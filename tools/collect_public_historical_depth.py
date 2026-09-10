#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
import os
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import quote

import requests

try:
    from curl_cffi import requests as curl_requests
except Exception:
    curl_requests = None

UTC = timezone.utc
BUILD = "40.4.197"
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36 Agent-Crypto-ERITH-IA-Historical-Depth/40.4.197"
YAHOO_BASES = (
    "https://query2.finance.yahoo.com/v8/finance/chart",
    "https://query1.finance.yahoo.com/v8/finance/chart",
)
YAHOO_CRUMB_URL = "https://query2.finance.yahoo.com/v1/test/getcrumb"

INDICES = (
    {"id":"cac40","name":"CAC 40","symbol":"^FCHI","currency":"EUR","market":"Paris","unit":"index_points"},
    {"id":"sp500","name":"S&P 500","symbol":"^GSPC","currency":"USD","market":"SNP","unit":"index_points"},
    {"id":"nasdaq100","name":"NASDAQ-100","symbol":"^NDX","currency":"USD","market":"Nasdaq GIDS","unit":"index_points"},
    {"id":"dax","name":"DAX","symbol":"^GDAXI","currency":"EUR","market":"XETRA","unit":"index_points"},
    {"id":"nikkei225","name":"Nikkei 225","symbol":"^N225","currency":"JPY","market":"Osaka","unit":"index_points"},
)


def iso_now() -> str:
    return datetime.now(tz=UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def finite(value):
    try:
        n = float(value)
    except (TypeError, ValueError):
        return None
    return n if math.isfinite(n) else None


def atomic_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def session_yahoo():
    if curl_requests is not None:
        s = curl_requests.Session(impersonate="chrome")
    else:
        s = requests.Session()
    s.headers.update({
        "User-Agent": USER_AGENT,
        "Accept": "application/json,text/plain,*/*",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://finance.yahoo.com/",
    })
    return s


def yahoo_crumb(s, timeout: float):
    try:
        s.get("https://fc.yahoo.com", timeout=timeout, allow_redirects=True)
    except Exception:
        pass
    try:
        r = s.get(YAHOO_CRUMB_URL, timeout=timeout)
        if r.status_code == 200 and r.text.strip():
            return r.text.strip()
    except Exception:
        pass
    return None


def yahoo_payload(s, symbol: str, timeout: float, interval: str, range_value: str, crumb=None):
    params = {
        "interval":interval,
        "range":range_value,
        "events":"history",
        "includeAdjustedClose":"true",
        "includePrePost":"false",
    }
    if crumb:
        params["crumb"] = crumb
    encoded = quote(symbol, safe="")
    errors = []
    for base in YAHOO_BASES:
        try:
            r = s.get(f"{base}/{encoded}", params=params, timeout=timeout)
            if r.status_code == 429:
                errors.append("HTTP 429")
                continue
            r.raise_for_status()
            payload = r.json()
            chart = payload.get("chart") if isinstance(payload, dict) else None
            if not isinstance(chart, dict) or chart.get("error"):
                raise RuntimeError(str(chart.get("error") if isinstance(chart, dict) else "chart absent"))
            return payload
        except Exception as exc:
            errors.append(str(exc))
    raise RuntimeError(f"Yahoo {symbol} {range_value}/{interval}: " + " ; ".join(errors))


def parse_series(payload, spec, requested_interval: str, requested_range: str):
    result = payload["chart"]["result"][0]
    meta = result.get("meta") or {}
    ts = result.get("timestamp") or []
    quote_rows = ((result.get("indicators") or {}).get("quote") or [{}])[0]
    closes = quote_rows.get("close") or []
    opens = quote_rows.get("open") or []
    highs = quote_rows.get("high") or []
    lows = quote_rows.get("low") or []
    volumes = quote_rows.get("volume") or []
    points = []
    for i, stamp in enumerate(ts):
        close = finite(closes[i] if i < len(closes) else None)
        if close is None or close <= 0:
            continue
        dt = datetime.fromtimestamp(float(stamp), tz=UTC)
        points.append({
            "time": dt.isoformat(timespec="seconds").replace("+00:00", "Z"),
            "date": dt.date().isoformat(),
            "open": finite(opens[i] if i < len(opens) else None),
            "high": finite(highs[i] if i < len(highs) else None),
            "low": finite(lows[i] if i < len(lows) else None),
            "close": close,
            "volume": finite(volumes[i] if i < len(volumes) else None),
        })
    if len(points) < 12:
        raise RuntimeError(f"{spec['symbol']}: série insuffisante ({len(points)} points)")
    return {
        "asset_id": spec["id"],
        "name": spec["name"],
        "symbol": spec["symbol"],
        "provider_symbol": meta.get("symbol") or spec["symbol"],
        "currency": meta.get("currency") or spec["currency"],
        "unit": spec["unit"],
        "market": meta.get("exchangeName") or spec["market"],
        "timezone": meta.get("exchangeTimezoneName"),
        "source": {"id":"yahoo_finance","name":"Yahoo Finance","provider_symbol":spec["symbol"]},
        "requested_interval": requested_interval,
        "requested_range": requested_range,
        "source_interval": meta.get("dataGranularity") or requested_interval,
        "history_points": points,
    }


def span_years(points) -> float:
    if len(points) < 2:
        return 0.0
    first = datetime.fromisoformat(points[0]["time"].replace("Z", "+00:00"))
    last = datetime.fromisoformat(points[-1]["time"].replace("Z", "+00:00"))
    return max(0.0, (last - first).total_seconds() / (365.2425 * 86400.0))


def slice_years(points, years: int):
    if not points:
        return []
    last = datetime.fromisoformat(points[-1]["time"].replace("Z", "+00:00"))
    cutoff = last - timedelta(days=years * 365.2425 + 8)
    return [p for p in points if datetime.fromisoformat(p["time"].replace("Z", "+00:00")) >= cutoff]


def clone_asset(asset, points):
    clone = {k:v for k,v in asset.items() if k != "history_points"}
    clone["history_points"] = points
    clone["points_count"] = len(points)
    clone["history_start"] = points[0]["time"]
    clone["history_end"] = points[-1]["time"]
    clone["span_years"] = round(span_years(points), 3)
    return clone


def common_resolution(assets):
    values = sorted({str(a.get("source_interval") or "unknown") for a in assets})
    return values[0] if len(values) == 1 else "mixed:" + ",".join(values)


def validate_horizon(assets, horizon: str):
    minimum_span = {"5a":4.5, "10a":8.8, "max":8.8}[horizon]
    minimum_points = {"5a":48, "10a":96, "max":96}[horizon]
    failures = []
    for asset in assets:
        if asset["span_years"] < minimum_span or asset["points_count"] < minimum_points:
            failures.append({
                "symbol":asset["symbol"],
                "span_years":asset["span_years"],
                "points":asset["points_count"],
                "required_span":minimum_span,
                "required_points":minimum_points,
            })
    if failures:
        raise RuntimeError(f"historical horizon {horizon} coverage insufficient: {failures}")


def build_payload(assets, horizon: str, generated_at: str):
    validate_horizon(assets, horizon)
    return {
        "schema":"agent_crypto_historical_depth_v1",
        "build":BUILD,
        "domain":"indices",
        "status":"ready",
        "horizon":horizon,
        "resolution":common_resolution(assets),
        "generated_at":generated_at,
        "source":"Yahoo Finance chart endpoint",
        "assets_expected":len(INDICES),
        "assets_count":len(assets),
        "assets":assets,
        "coverage":{
            "min_span_years":min(a["span_years"] for a in assets),
            "max_span_years":max(a["span_years"] for a in assets),
            "min_points":min(a["points_count"] for a in assets),
            "max_points":max(a["points_count"] for a in assets),
        },
        "integrity":{
            "no_invented_values":True,
            "provider_series_preserved":True,
            "provider_granularity_recorded":True,
            "horizon_subsets_are_deterministic":True,
            "coverage_duration_validated":True,
            "lazy_browser_load_required":True,
            "boot_payload_forbidden":True,
            "orders_allowed":False,
        },
    }


def collect(root: Path, timeout: float, pacing: float):
    s = session_yahoo()
    crumb = yahoo_crumb(s, timeout)
    ten_year = []
    max_history = []
    errors = []
    for spec in INDICES:
        try:
            p10 = yahoo_payload(s, spec["symbol"], timeout, "1wk", "10y", crumb)
            ten_year.append(parse_series(p10, spec, "1wk", "10y"))
            time.sleep(pacing)
            pmax = yahoo_payload(s, spec["symbol"], timeout, "1mo", "max", crumb)
            max_history.append(parse_series(pmax, spec, "1mo", "max"))
        except Exception as exc:
            errors.append({"symbol":spec["symbol"],"error":str(exc)[:1000]})
        time.sleep(pacing)
    if len(ten_year) != len(INDICES) or len(max_history) != len(INDICES):
        raise RuntimeError(f"indices historical basket incomplete: 10y={len(ten_year)}/5 max={len(max_history)}/5 · {errors}")

    generated_at = iso_now()
    five_assets = []
    ten_assets = []
    max_assets = []
    by_id_max = {a["asset_id"]:a for a in max_history}
    for asset in ten_year:
        five_assets.append(clone_asset(asset, slice_years(asset["history_points"], 5)))
        ten_assets.append(clone_asset(asset, list(asset["history_points"])))
        max_asset = by_id_max[asset["asset_id"]]
        max_assets.append(clone_asset(max_asset, list(max_asset["history_points"])))

    payloads = {
        "5a": build_payload(five_assets, "5a", generated_at),
        "10a": build_payload(ten_assets, "10a", generated_at),
        "max": build_payload(max_assets, "max", generated_at),
    }
    out = root / "data" / "indices" / "history"
    for horizon, payload in payloads.items():
        atomic_json(out / f"{horizon}.json", payload)
    atomic_json(out / "status.json", {
        "schema":"agent_crypto_historical_depth_status_v1",
        "build":BUILD,
        "domain":"indices",
        "status":"ready",
        "generated_at":generated_at,
        "horizons":{
            h:{
                "ready":True,
                "resolution":payloads[h]["resolution"],
                "assets":payloads[h]["assets_count"],
                **payloads[h]["coverage"],
                "path":f"data/indices/history/{h}.json",
            } for h in ("5a","10a","max")
        },
        "integrity":payloads["max"]["integrity"],
        "errors":errors,
    })
    print(json.dumps({"status":"ready","domain":"indices","horizons":list(payloads.keys()),"coverage":{h:payloads[h]["coverage"] for h in payloads}}, ensure_ascii=False))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default="public/agent_crypto_erith_ia")
    ap.add_argument("--timeout", type=float, default=25.0)
    ap.add_argument("--pacing", type=float, default=1.6)
    args = ap.parse_args()
    collect(Path(args.root), args.timeout, args.pacing)

if __name__ == "__main__":
    main()
