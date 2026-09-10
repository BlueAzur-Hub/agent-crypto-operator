#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

import requests

try:
    from curl_cffi import requests as curl_requests
except Exception:
    curl_requests = None

UTC = timezone.utc
YAHOO_BASES = (
    "https://query2.finance.yahoo.com/v8/finance/chart",
    "https://query1.finance.yahoo.com/v8/finance/chart",
)
YAHOO_CRUMB_URL = "https://query2.finance.yahoo.com/v1/test/getcrumb"
COINGECKO_BTC_1Y = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart"
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36 Agent-Crypto-ERITH-IA-Parallel-Markets/40.4.173"

DOMAINS = {
    "indices": (
        {"id":"cac40","name":"CAC 40","symbol":"^FCHI","currency":"EUR","market":"Paris","unit":"index_points"},
        {"id":"sp500","name":"S&P 500","symbol":"^GSPC","currency":"USD","market":"SNP","unit":"index_points"},
        {"id":"nasdaq100","name":"NASDAQ-100","symbol":"^NDX","currency":"USD","market":"Nasdaq GIDS","unit":"index_points"},
        {"id":"dax","name":"DAX","symbol":"^GDAXI","currency":"EUR","market":"XETRA","unit":"index_points"},
        {"id":"nikkei225","name":"Nikkei 225","symbol":"^N225","currency":"JPY","market":"Osaka","unit":"index_points"},
    ),
    "energy": (
        {"id":"wti","name":"WTI Crude Oil","symbol":"CL=F","currency":"USD","market":"NYMEX","unit":"USD_per_barrel"},
        {"id":"brent","name":"Brent Crude Oil","symbol":"BZ=F","currency":"USD","market":"NYMEX","unit":"USD_per_barrel"},
        {"id":"natural_gas","name":"Natural Gas","symbol":"NG=F","currency":"USD","market":"NYMEX","unit":"USD_per_MMBtu"},
    ),
}


def now_iso():
    return datetime.now(tz=UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def finite(value):
    try:
        n = float(value)
    except (TypeError, ValueError):
        return None
    return n if math.isfinite(n) else None


def atomic_json(path: Path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def session_yahoo():
    if curl_requests is not None:
        s = curl_requests.Session(impersonate="chrome")
    else:
        s = requests.Session()
    s.headers.update({"User-Agent":USER_AGENT,"Accept":"application/json,text/plain,*/*","Accept-Language":"fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7","Referer":"https://finance.yahoo.com/"})
    return s


def yahoo_crumb(s, timeout):
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


def yahoo_payload(s, symbol, timeout, interval, range_value, crumb=None):
    params = {"interval":interval,"range":range_value,"events":"history","includeAdjustedClose":"true","includePrePost":"true"}
    if crumb:
        params["crumb"] = crumb
    failures = []
    encoded = quote(symbol, safe="")
    for base in YAHOO_BASES:
        try:
            r = s.get(f"{base}/{encoded}", params=params, timeout=timeout)
            if r.status_code == 429:
                failures.append("HTTP 429")
                continue
            r.raise_for_status()
            payload = r.json()
            chart = payload.get("chart") if isinstance(payload, dict) else None
            if not isinstance(chart, dict) or chart.get("error"):
                raise RuntimeError(str(chart.get("error") if isinstance(chart, dict) else "chart absent"))
            return payload
        except Exception as exc:
            failures.append(str(exc))
    raise RuntimeError(f"Yahoo {symbol}: " + " ; ".join(failures))


def parse_yahoo(payload, spec, interval):
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
    current = finite(meta.get("regularMarketPrice"))
    current_time = meta.get("regularMarketTime")
    current_iso = None
    if isinstance(current_time, (int,float)):
        current_iso = datetime.fromtimestamp(float(current_time), tz=UTC).isoformat(timespec="seconds").replace("+00:00","Z")
    return {
        "asset_id": spec["id"],
        "name": spec["name"],
        "symbol": spec["symbol"],
        "provider_symbol": meta.get("symbol") or spec["symbol"],
        "source_id": "yahoo_finance",
        "source_name": "Yahoo Finance",
        "instrument_type": "index" if spec["unit"] == "index_points" else "future_continuous",
        "market": meta.get("exchangeName") or spec["market"],
        "currency": meta.get("currency") or spec["currency"],
        "unit": spec["unit"],
        "timezone": meta.get("exchangeTimezoneName"),
        "market_state": meta.get("marketState"),
        "regular_market_price": current,
        "regular_market_time": current_iso,
        "interval": interval,
        "points": points,
        "points_count": len(points),
    }


def collect_yahoo_domain(root: Path, domain: str, timeout: float, pacing: float):
    specs = DOMAINS[domain]
    s = session_yahoo()
    crumb = yahoo_crumb(s, timeout)
    assets = []
    errors = []
    for spec in specs:
        try:
            daily = parse_yahoo(yahoo_payload(s, spec["symbol"], timeout, "1d", "1y", crumb), spec, "1d")
            time.sleep(pacing)
            intraday = parse_yahoo(yahoo_payload(s, spec["symbol"], timeout, "5m", "2d", crumb), spec, "5m")
            cutoff = time.time() - 24 * 3600
            intraday["points"] = [p for p in intraday["points"] if datetime.fromisoformat(p["time"].replace("Z","+00:00")).timestamp() >= cutoff]
            intraday["points_count"] = len(intraday["points"])
            assets.append({
                "asset_id":spec["id"],"name":spec["name"],"symbol":spec["symbol"],"currency":daily["currency"],"unit":spec["unit"],"market":daily["market"],
                "current":{"price":daily["regular_market_price"] or (daily["points"][-1]["close"] if daily["points"] else None),"time":daily["regular_market_time"] or (daily["points"][-1]["time"] if daily["points"] else None),"market_state":daily["market_state"]},
                "daily":daily["points"],"intraday_24h":intraday["points"],
                "source":{"id":"yahoo_finance","name":"Yahoo Finance","provider_symbol":spec["symbol"],"quote_state":"free_or_delayed_as_provider_reports"},
            })
        except Exception as exc:
            errors.append({"symbol":spec["symbol"],"error":str(exc)[:600]})
        time.sleep(pacing)
    status = "ready" if len(assets) == len(specs) else ("partial" if assets else "unavailable")
    payload = {
        "schema":"agent_crypto_parallel_market_v1","build":"40.4.173","domain":domain,"status":status,"generated_at":now_iso(),"source":"Yahoo Finance chart endpoint","assets_expected":len(specs),"assets_count":len(assets),"assets":assets,
        "integrity":{"no_invented_values":True,"base100_is_presentation_only":True,"domains_separated":True,"provider_delay_preserved":True,"orders_allowed":False},
        "errors":errors,
    }
    out = root / "data" / domain
    atomic_json(out / "market.json", payload)
    atomic_json(out / "status.json", {"schema":"agent_crypto_parallel_market_status_v1","build":"40.4.173","domain":domain,"status":status,"generated_at":payload["generated_at"],"assets_expected":len(specs),"assets_count":len(assets),"errors":errors,"integrity":payload["integrity"]})
    if status != "ready":
        raise RuntimeError(f"{domain} basket incomplete: {len(assets)}/{len(specs)}")


def series_from_local(path: Path, asset_id: str, name: str, symbol: str):
    payload = json.loads(path.read_text(encoding="utf-8"))
    points = []
    for row in payload.get("points") or []:
        close = finite(row.get("close"))
        if close is None or close <= 0:
            continue
        points.append({"time":row.get("time") or (str(row.get("date")) + "T00:00:00Z"),"date":row.get("date"),"close":close})
    return {"asset_id":asset_id,"name":name,"symbol":symbol,"daily":points,"source":{"id":payload.get("source_id") or "public_archive","name":payload.get("source_name") or "Public archive"}}


def collect_cross(root: Path, timeout: float):
    indices = json.loads((root / "data" / "indices" / "market.json").read_text(encoding="utf-8"))
    energy = json.loads((root / "data" / "energy" / "market.json").read_text(encoding="utf-8"))
    sp = next(x for x in indices["assets"] if x["asset_id"] == "sp500")
    brent = next(x for x in energy["assets"] if x["asset_id"] == "brent")

    r = requests.get(COINGECKO_BTC_1Y, params={"vs_currency":"usd","days":"365","interval":"daily"}, headers={"User-Agent":USER_AGENT,"Accept":"application/json"}, timeout=timeout)
    r.raise_for_status()
    cg = r.json()
    btc_by_date = {}
    for row in cg.get("prices") or []:
        if not isinstance(row, list) or len(row) < 2:
            continue
        value = finite(row[1])
        if value is None or value <= 0:
            continue
        dt = datetime.fromtimestamp(float(row[0]) / 1000.0, tz=UTC)
        btc_by_date[dt.date().isoformat()] = {"time":dt.isoformat(timespec="seconds").replace("+00:00","Z"),"date":dt.date().isoformat(),"close":value}
    btc = {"asset_id":"btc","name":"Bitcoin","symbol":"BTC","daily":list(btc_by_date.values()),"source":{"id":"coingecko","name":"CoinGecko"}}
    gold = series_from_local(root / "data" / "metals" / "series" / "gold.json", "xau", "Or", "XAU")
    copper = series_from_local(root / "data" / "metals" / "series" / "copper.json", "hg", "Cuivre", "HG")
    sp_asset = {"asset_id":"sp500","name":"S&P 500","symbol":"S&P500","daily":[{"time":p["time"],"date":p["date"],"close":p["close"]} for p in sp["daily"]],"source":sp["source"]}
    brent_asset = {"asset_id":"brent","name":"Brent","symbol":"BRENT","daily":[{"time":p["time"],"date":p["date"],"close":p["close"]} for p in brent["daily"]],"source":brent["source"]}
    assets = [btc, gold, sp_asset, brent_asset, copper]
    payload = {
        "schema":"agent_crypto_cross_market_v1","build":"40.4.173","domain":"cross-market","status":"ready","generated_at":now_iso(),"assets_expected":5,"assets_count":5,"assets":assets,
        "integrity":{"base100_only":True,"no_inter_source_average":True,"no_invented_values":True,"source_series_remain_independent":True,"orders_allowed":False},
        "source_note":"BTC CoinGecko ; XAU/HG archive Métaux Yahoo Futures ; S&P 500 archive Indices Yahoo ; Brent archive Énergie Yahoo. Comparaison Base 100 uniquement.",
    }
    out = root / "data" / "cross_market"
    atomic_json(out / "market.json", payload)
    atomic_json(out / "status.json", {"schema":"agent_crypto_parallel_market_status_v1","build":"40.4.173","domain":"cross-market","status":"ready","generated_at":payload["generated_at"],"assets_expected":5,"assets_count":5,"integrity":payload["integrity"]})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default="public/agent_crypto_erith_ia")
    ap.add_argument("--domain", choices=("indices","energy","cross"), required=True)
    ap.add_argument("--timeout", type=float, default=25.0)
    ap.add_argument("--pacing", type=float, default=1.4)
    args = ap.parse_args()
    root = Path(args.root)
    if args.domain in DOMAINS:
        collect_yahoo_domain(root, args.domain, args.timeout, args.pacing)
    else:
        collect_cross(root, args.timeout)

if __name__ == "__main__":
    main()
