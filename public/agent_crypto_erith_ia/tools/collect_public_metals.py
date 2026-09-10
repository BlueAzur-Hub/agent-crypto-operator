#!/usr/bin/env python3
"""Collect public metals data for Agent-Crypto @erith.IA Build 28.2.67.

Public sources, no provider key:
- Gold API: current indicative XAU/XAG/XPT/XPD/HG prices.
- Yahoo Finance chart endpoint: one-year daily and immediate 24-hour intraday futures series.
- ECB SDMX: daily USD/EUR reference rate.

The public page never contacts these providers. GitHub Actions runs this collector,
commits static JSON, and GitHub Pages serves the same files to every device.
Crypto files are never read or modified.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import math
import os
import shutil
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import quote

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

try:
    from curl_cffi import requests as curl_requests
except Exception:  # optional outside the GitHub Actions runtime
    curl_requests = None

UTC = timezone.utc
SCHEMA_VERSION = "2.3.0"
BUILD_TARGET = "28.2.67"
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36 "
    "Agent-Crypto-ERITH-IA-Public-Metals/28.2.67"
)


@dataclass(frozen=True)
class Metal:
    asset_id: str
    name: str
    symbol: str
    future_symbol: str
    market: str
    unit: str
    unit_label_fr: str


METALS: tuple[Metal, ...] = (
    Metal("gold", "Or", "XAU", "GC=F", "COMEX", "troy_ounce", "USD / once troy"),
    Metal("silver", "Argent", "XAG", "SI=F", "COMEX", "troy_ounce", "USD / once troy"),
    Metal("platinum", "Platine", "XPT", "PL=F", "NYMEX", "troy_ounce", "USD / once troy"),
    Metal("palladium", "Palladium", "XPD", "PA=F", "NYMEX", "troy_ounce", "USD / once troy"),
    Metal("copper", "Cuivre", "HG", "HG=F", "COMEX", "pound", "USD / livre"),
)
ASSET_ORDER = {metal.asset_id: index for index, metal in enumerate(METALS)}
EXPECTED_ASSETS = [metal.asset_id for metal in METALS]

SPOT_HISTORY_SCHEMA = "agent_crypto_metals_spot_history_v1"
SPOT_RETENTION_HOURS = 48
SPOT_MIN_COMPLETE_HOURS = 20
SPOT_HISTORY_RELATIVE_PATH = Path("history") / "spot_48h.json"

INTRADAY_HISTORY_SCHEMA = "agent_crypto_metals_intraday_history_v1"
INTRADAY_INTERVAL = "5m"
INTRADAY_REQUEST_RANGE = "2d"
INTRADAY_WINDOW_HOURS = 24
INTRADAY_HISTORY_RELATIVE_PATH = Path("history") / "intraday_24h.json"
_YAHOO_CRUMB_CACHE: dict[int, str | None] = {}

GOLD_API_BASE = "https://api.gold-api.com/price"
YAHOO_CHART_BASES = (
    "https://query2.finance.yahoo.com/v8/finance/chart",
    "https://query1.finance.yahoo.com/v8/finance/chart",
)
YAHOO_CRUMB_URL = "https://query2.finance.yahoo.com/v1/test/getcrumb"
ECB_USD_EUR_URL = (
    "https://data-api.ecb.europa.eu/service/data/EXR/"
    "D.USD.EUR.SP00.A?lastNObservations=10&format=csvdata"
)


def utc_now() -> datetime:
    return datetime.now(tz=UTC)


def iso(value: datetime | None = None) -> str:
    return (value or utc_now()).astimezone(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def parse_time(value: Any) -> str | None:
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)) and math.isfinite(float(value)):
        number = float(value)
        if number > 10_000_000_000:
            number /= 1000.0
        try:
            return iso(datetime.fromtimestamp(number, tz=UTC))
        except (ValueError, OSError, OverflowError):
            return None
    text = str(value).strip()
    if not text:
        return None
    if text.isdigit():
        return parse_time(int(text))
    try:
        return iso(datetime.fromisoformat(text.replace("Z", "+00:00")))
    except ValueError:
        return None


def date_key(value: Any) -> str | None:
    stamp = parse_time(value)
    return stamp[:10] if stamp else None


def finite_number(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def positive_number(value: Any) -> float | None:
    number = finite_number(value)
    return number if number is not None and number > 0 else None


def first_number(payload: dict[str, Any], keys: Iterable[str], *, positive: bool = False) -> float | None:
    for key in keys:
        if key not in payload:
            continue
        number = positive_number(payload[key]) if positive else finite_number(payload[key])
        if number is not None:
            return number
    return None


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)


def sha256_json(value: Any) -> str:
    return "sha256:" + hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def atomic_write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=False, allow_nan=False) + "\n"
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(text, encoding="utf-8", newline="\n")
    os.replace(temp, path)


def read_json(path: Path) -> dict[str, Any] | None:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else None
    except Exception:
        return None


def build_session() -> requests.Session:
    # 429 is deliberately not retried: repeated automated retries worsen throttling.
    retry = Retry(
        total=2,
        connect=2,
        read=2,
        status=2,
        backoff_factor=0.8,
        status_forcelist=(500, 502, 503, 504),
        allowed_methods=frozenset({"GET"}),
        respect_retry_after_header=True,
    )
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json,text/csv;q=0.9,*/*;q=0.8"})
    session.mount("https://", HTTPAdapter(max_retries=retry))
    return session


def build_yahoo_session():
    if curl_requests is None:
        return build_session()
    session = curl_requests.Session(impersonate="chrome")
    session.headers.update({
        "User-Agent": USER_AGENT,
        "Accept": "application/json,text/plain,*/*",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://finance.yahoo.com/",
    })
    return session


def yahoo_get_crumb(session, timeout: float) -> str | None:
    key = id(session)
    if key in _YAHOO_CRUMB_CACHE:
        return _YAHOO_CRUMB_CACHE[key]
    crumb = None
    try:
        session.get("https://fc.yahoo.com", timeout=timeout, allow_redirects=True)
    except Exception:
        pass
    try:
        response = session.get(YAHOO_CRUMB_URL, timeout=timeout)
        if response.status_code == 200 and response.text.strip():
            crumb = response.text.strip()
    except Exception:
        crumb = None
    _YAHOO_CRUMB_CACHE[key] = crumb
    return crumb


def yahoo_get_payload(
    session,
    metal: Metal,
    timeout: float,
    *,
    interval: str = "1d",
    period_days: int | None = 380,
    range_value: str | None = None,
    include_prepost: bool = False,
) -> dict[str, Any]:
    # One browser-like session and one cached crumb are shared by daily and intraday calls.
    # HTTP 429 is never retried in a loop.
    crumb = yahoo_get_crumb(session, timeout)
    now = int(utc_now().timestamp())
    params: dict[str, Any] = {
        "interval": interval,
        "events": "history",
        "includeAdjustedClose": "true",
    }
    if range_value:
        params["range"] = range_value
    else:
        days = max(2, int(period_days or 380))
        params["period1"] = now - days * 86400
        params["period2"] = now
    if include_prepost:
        params["includePrePost"] = "true"
    if crumb:
        params["crumb"] = crumb

    encoded = quote(metal.future_symbol, safe="")
    failures = []
    for base in YAHOO_CHART_BASES:
        url = f"{base}/{encoded}"
        try:
            response = session.get(url, params=params, timeout=timeout)
            if response.status_code == 429:
                failures.append(f"{base.split('//',1)[1].split('/',1)[0]} HTTP 429")
                continue
            response.raise_for_status()
            payload = response.json()
            if not isinstance(payload, dict):
                raise RuntimeError("objet JSON attendu")
            return payload
        except Exception as exc:
            failures.append(f"{base.split('//',1)[1].split('/',1)[0]} {exc}")
    raise RuntimeError(" ; ".join(failures))

def get_json(session: requests.Session, url: str, timeout: float) -> dict[str, Any]:
    response = session.get(url, timeout=timeout)
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, dict):
        raise RuntimeError(f"Réponse JSON objet attendue : {url}")
    return payload


def get_text(session: requests.Session, url: str, timeout: float) -> str:
    response = session.get(url, timeout=timeout, headers={"Accept": "text/csv"})
    response.raise_for_status()
    return response.text


def load_fixture(fixtures: Path | None, filename: str) -> Any | None:
    if fixtures is None:
        return None
    path = fixtures / filename
    if not path.is_file():
        raise FileNotFoundError(f"Fixture absente : {path}")
    if path.suffix.lower() == ".json":
        return json.loads(path.read_text(encoding="utf-8"))
    return path.read_text(encoding="utf-8")


def gold_api_quote(
    session: requests.Session,
    metal: Metal,
    timeout: float,
    received_at: str,
    fixtures: Path | None,
) -> dict[str, Any]:
    payload = load_fixture(fixtures, f"gold_api_{metal.symbol}.json")
    if payload is None:
        payload = get_json(session, f"{GOLD_API_BASE}/{metal.symbol}", timeout)
    if not isinstance(payload, dict):
        raise RuntimeError(f"Gold API {metal.symbol}: objet JSON attendu")

    response_symbol = str(payload.get("symbol") or metal.symbol).upper()
    if response_symbol != metal.symbol:
        raise RuntimeError(f"Gold API {metal.symbol}: symbole reçu {response_symbol}")
    response_currency = str(payload.get("currency") or "USD").upper()
    if response_currency != "USD":
        raise RuntimeError(f"Gold API {metal.symbol}: devise reçue {response_currency}, USD requise")

    price = first_number(payload, ("price", "value", "rate", "current_price"), positive=True)
    if price is None:
        raise RuntimeError(f"Gold API {metal.symbol}: prix positif absent")

    source_time = next(
        (
            stamp for stamp in (
                parse_time(payload.get(key))
                for key in (
                    "updatedAt", "updated_at", "timestamp", "lastUpdated", "last_updated",
                    "price_timestamp", "server_time", "date",
                )
            ) if stamp
        ),
        None,
    )

    return {
        "asset_id": metal.asset_id,
        "domain": "metals",
        "symbol": metal.symbol,
        "source_id": "gold_api",
        "source_name": "Gold API",
        "provider_symbol": metal.symbol,
        "instrument_type": "spot_reference",
        "market": "indicative_public_reference",
        "currency": "USD",
        "unit": metal.unit,
        "unit_label_fr": metal.unit_label_fr,
        "unit_basis": "market_symbol_convention",
        "price": price,
        "bid": first_number(payload, ("bid", "best_bid"), positive=True),
        "ask": first_number(payload, ("ask", "best_ask"), positive=True),
        "change": first_number(payload, ("change", "price_change", "change_24h")),
        "change_percent": first_number(
            payload,
            ("changePercent", "change_percent", "percent_change", "change_24h_percent", "chp"),
        ),
        "source_time": source_time,
        "received_at": received_at,
        "data_state": "data_current" if source_time else "date_unqualified",
        "delay_seconds": None,
        "licence_state": "public_terms",
        "provenance_note": (
            f"Cotation indicative publique Gold API {metal.symbol}, unité qualifiée {metal.unit_label_fr}, "
            "collectée automatiquement sans clé fournisseur."
        ),
    }


def yahoo_future_series(
    session: requests.Session,
    metal: Metal,
    timeout: float,
    received_at: str,
    fixtures: Path | None,
) -> dict[str, Any]:
    fixture_name = f"yahoo_{metal.future_symbol.replace('=', '_')}.json"
    payload = load_fixture(fixtures, fixture_name)
    if payload is None:
        payload = yahoo_get_payload(session, metal, timeout, interval="1d", period_days=380)
    if not isinstance(payload, dict):
        raise RuntimeError(f"Yahoo {metal.future_symbol}: objet JSON attendu")

    chart = payload.get("chart")
    result_list = chart.get("result") if isinstance(chart, dict) else None
    error = chart.get("error") if isinstance(chart, dict) else None
    if error:
        raise RuntimeError(f"Yahoo {metal.future_symbol}: {error}")
    if not isinstance(result_list, list) or not result_list or not isinstance(result_list[0], dict):
        raise RuntimeError(f"Yahoo {metal.future_symbol}: résultat absent")
    result = result_list[0]

    timestamps = result.get("timestamp")
    indicators = result.get("indicators")
    quote_rows = indicators.get("quote") if isinstance(indicators, dict) else None
    quote_data = quote_rows[0] if isinstance(quote_rows, list) and quote_rows else None
    adj_rows = indicators.get("adjclose") if isinstance(indicators, dict) else None
    adj_data = adj_rows[0] if isinstance(adj_rows, list) and adj_rows else {}
    if not isinstance(timestamps, list) or not isinstance(quote_data, dict):
        raise RuntimeError(f"Yahoo {metal.future_symbol}: séries OHLC absentes")

    opens = quote_data.get("open") or []
    highs = quote_data.get("high") or []
    lows = quote_data.get("low") or []
    closes = quote_data.get("close") or []
    volumes = quote_data.get("volume") or []
    adjcloses = adj_data.get("adjclose") if isinstance(adj_data, dict) else []
    meta = result.get("meta") if isinstance(result.get("meta"), dict) else {}
    currency = str(meta.get("currency") or "USD").upper()
    if currency != "USD":
        raise RuntimeError(f"Yahoo {metal.future_symbol}: devise reçue {currency}, USD requise")

    by_date: dict[str, dict[str, Any]] = {}
    previous_close: float | None = None
    for index, stamp in enumerate(timestamps):
        close_value = positive_number(closes[index] if index < len(closes) else None)
        point_time = parse_time(stamp)
        day = date_key(stamp)
        if close_value is None or not point_time or not day:
            continue
        change_percent = None
        if previous_close is not None and previous_close > 0:
            change_percent = ((close_value - previous_close) / previous_close) * 100.0
        by_date[day] = {
            "date": day,
            "time": point_time,
            "open": positive_number(opens[index] if index < len(opens) else None),
            "high": positive_number(highs[index] if index < len(highs) else None),
            "low": positive_number(lows[index] if index < len(lows) else None),
            "close": close_value,
            "adj_close": positive_number(adjcloses[index] if index < len(adjcloses) else None),
            "volume": finite_number(volumes[index] if index < len(volumes) else None),
            "change_percent": change_percent,
        }
        previous_close = close_value

    points = [by_date[day] for day in sorted(by_date)]
    if len(points) < 200:
        raise RuntimeError(f"Yahoo {metal.future_symbol}: historique annuel insuffisant ({len(points)} points)")
    span_days = (
        datetime.fromisoformat(points[-1]["time"].replace("Z", "+00:00"))
        - datetime.fromisoformat(points[0]["time"].replace("Z", "+00:00"))
    ).days
    if span_days < 320:
        raise RuntimeError(f"Yahoo {metal.future_symbol}: période insuffisante ({span_days} jours)")

    return {
        "schema": "agent_crypto_metals_daily_series_v1",
        "version": SCHEMA_VERSION,
        "asset_id": metal.asset_id,
        "symbol": metal.symbol,
        "provider_symbol": metal.future_symbol,
        "name": metal.name,
        "instrument_type": "future_continuous",
        "market": metal.market,
        "currency": "USD",
        "unit": metal.unit,
        "unit_label_fr": metal.unit_label_fr,
        "unit_basis": "exchange_contract_convention",
        "interval": "1d",
        "range": "1y",
        "source_id": "yahoo_finance",
        "source_name": "Yahoo Finance",
        "exchange_name": meta.get("exchangeName") or meta.get("fullExchangeName") or metal.market,
        "timezone": meta.get("exchangeTimezoneName") or "UTC",
        "received_at": received_at,
        "points_count": len(points),
        "oldest_at": points[0]["time"],
        "newest_at": points[-1]["time"],
        "points": points,
        "integrity": {
            "fabricated_points_forbidden": True,
            "source_timestamp_preserved": True,
            "daily_date_deduplicated": True,
            "minimum_one_year_span_required": True,
            "crypto_history_reuse_forbidden": True,
        },
    }



def yahoo_intraday_series(
    session,
    metal: Metal,
    timeout: float,
    received_at: str,
    fixtures: Path | None,
) -> dict[str, Any]:
    fixture_name = f"yahoo_intraday_{metal.future_symbol.replace('=', '_')}.json"
    payload = load_fixture(fixtures, fixture_name)
    if payload is None:
        payload = yahoo_get_payload(
            session,
            metal,
            timeout,
            interval=INTRADAY_INTERVAL,
            period_days=None,
            range_value=INTRADAY_REQUEST_RANGE,
            include_prepost=True,
        )
    if not isinstance(payload, dict):
        raise RuntimeError(f"Yahoo intraday {metal.future_symbol}: objet JSON attendu")

    chart = payload.get("chart")
    result_list = chart.get("result") if isinstance(chart, dict) else None
    error = chart.get("error") if isinstance(chart, dict) else None
    if error:
        raise RuntimeError(f"Yahoo intraday {metal.future_symbol}: {error}")
    if not isinstance(result_list, list) or not result_list or not isinstance(result_list[0], dict):
        raise RuntimeError(f"Yahoo intraday {metal.future_symbol}: résultat absent")
    result = result_list[0]
    timestamps = result.get("timestamp")
    indicators = result.get("indicators")
    quote_rows = indicators.get("quote") if isinstance(indicators, dict) else None
    quote_data = quote_rows[0] if isinstance(quote_rows, list) and quote_rows else None
    if not isinstance(timestamps, list) or not isinstance(quote_data, dict):
        raise RuntimeError(f"Yahoo intraday {metal.future_symbol}: série absente")

    meta = result.get("meta") if isinstance(result.get("meta"), dict) else {}
    currency = str(meta.get("currency") or "USD").upper()
    if currency != "USD":
        raise RuntimeError(f"Yahoo intraday {metal.future_symbol}: devise {currency}, USD requise")

    opens = quote_data.get("open") or []
    highs = quote_data.get("high") or []
    lows = quote_data.get("low") or []
    closes = quote_data.get("close") or []
    volumes = quote_data.get("volume") or []
    deduplicated: dict[str, dict[str, Any]] = {}
    for index, raw_stamp in enumerate(timestamps):
        point_time = parse_time(raw_stamp)
        close_value = positive_number(closes[index] if index < len(closes) else None)
        if not point_time or close_value is None:
            continue
        deduplicated[point_time] = {
            "time": point_time,
            "open": positive_number(opens[index] if index < len(opens) else None),
            "high": positive_number(highs[index] if index < len(highs) else None),
            "low": positive_number(lows[index] if index < len(lows) else None),
            "close": close_value,
            "volume": finite_number(volumes[index] if index < len(volumes) else None),
        }

    points = [deduplicated[key] for key in sorted(deduplicated)]
    if len(points) < 2:
        raise RuntimeError(f"Yahoo intraday {metal.future_symbol}: moins de deux points réels")

    # Keep a small margin beyond 24 hours so the browser can cut an exact rolling window.
    newest = datetime.fromisoformat(points[-1]["time"].replace("Z", "+00:00")).astimezone(UTC)
    cutoff = newest - timedelta(hours=30)
    points = [
        point for point in points
        if datetime.fromisoformat(point["time"].replace("Z", "+00:00")).astimezone(UTC) >= cutoff
    ]
    if len(points) < 2:
        raise RuntimeError(f"Yahoo intraday {metal.future_symbol}: fenêtre 30 h insuffisante")

    return {
        "schema": "agent_crypto_metals_intraday_series_v1",
        "version": SCHEMA_VERSION,
        "asset_id": metal.asset_id,
        "symbol": metal.symbol,
        "provider_symbol": metal.future_symbol,
        "name": metal.name,
        "instrument_type": "future_continuous",
        "market": metal.market,
        "currency": "USD",
        "unit": metal.unit,
        "unit_label_fr": metal.unit_label_fr,
        "interval": INTRADAY_INTERVAL,
        "requested_range": INTRADAY_REQUEST_RANGE,
        "source_id": "yahoo_finance",
        "source_name": "Yahoo Finance",
        "exchange_name": meta.get("exchangeName") or meta.get("fullExchangeName") or metal.market,
        "timezone": meta.get("exchangeTimezoneName") or "UTC",
        "received_at": received_at,
        "points_count": len(points),
        "oldest_at": points[0]["time"],
        "newest_at": points[-1]["time"],
        "points": points,
        "integrity": {
            "fabricated_points_forbidden": True,
            "source_timestamp_preserved": True,
            "current_spot_quote_mixing_forbidden": True,
            "daily_series_reuse_forbidden": True,
        },
    }


def intraday_state_from_disk(data_dir: Path) -> dict[str, Any]:
    payload = read_json(data_dir / INTRADAY_HISTORY_RELATIVE_PATH) or {}
    series = payload.get("series") if isinstance(payload.get("series"), list) else []
    valid_series = [
        item for item in series
        if isinstance(item, dict)
        and item.get("schema") == "agent_crypto_metals_intraday_series_v1"
        and item.get("source_id") == "yahoo_finance"
        and item.get("interval") == INTRADAY_INTERVAL
        and int(item.get("points_count") or 0) >= 2
        and isinstance(item.get("points"), list)
        and len(item.get("points")) >= 2
    ]
    valid = (
        payload.get("schema") == INTRADAY_HISTORY_SCHEMA
        and payload.get("integrity", {}).get("fabricated_points_forbidden") is True
        and payload.get("integrity", {}).get("gold_api_current_quote_mixing_forbidden") is True
        and len(valid_series) == len(METALS)
        and {item.get("asset_id") for item in valid_series} == set(EXPECTED_ASSETS)
    )
    return {
        "available": bool(valid),
        "preserved": bool(valid),
        "file": str(INTRADAY_HISTORY_RELATIVE_PATH).replace("\\", "/"),
        "assets": len(valid_series) if valid else 0,
        "series_points": {str(item.get("asset_id")): int(item.get("points_count") or 0) for item in valid_series} if valid else {},
        "oldest_at": min((item.get("oldest_at") for item in valid_series), default=None) if valid else None,
        "newest_at": max((item.get("newest_at") for item in valid_series), default=None) if valid else None,
        "interval": INTRADAY_INTERVAL,
        "window_hours": INTRADAY_WINDOW_HOURS,
        "source_id": "yahoo_finance",
    }


def build_intraday_history(
    data_dir: Path,
    series_by_asset: dict[str, dict[str, Any]],
    received_at: str,
) -> dict[str, Any]:
    if set(series_by_asset) != set(EXPECTED_ASSETS):
        return intraday_state_from_disk(data_dir)
    ordered = [series_by_asset[metal.asset_id] for metal in METALS]
    payload = {
        "schema": INTRADAY_HISTORY_SCHEMA,
        "version": SCHEMA_VERSION,
        "source_mode": "github_actions_public_archive",
        "source_id": "yahoo_finance",
        "source_name": "Yahoo Finance Futures",
        "generated_at": received_at,
        "interval": INTRADAY_INTERVAL,
        "requested_range": INTRADAY_REQUEST_RANGE,
        "window_hours": INTRADAY_WINDOW_HOURS,
        "assets": [metal.symbol for metal in METALS],
        "series_count": len(ordered),
        "series": ordered,
        "integrity": {
            "fabricated_points_forbidden": True,
            "source_timestamp_preserved": True,
            "five_asset_series_required": True,
            "gold_api_current_quote_mixing_forbidden": True,
            "daily_series_reuse_forbidden": True,
            "crypto_history_reuse_forbidden": True,
        },
    }
    payload["fingerprint"] = sha256_json({"generated_at": received_at, "series": ordered})
    atomic_write_json(data_dir / INTRADAY_HISTORY_RELATIVE_PATH, payload)
    state = intraday_state_from_disk(data_dir)
    return {**state, "preserved": False}

def ecb_fx(
    session: requests.Session,
    timeout: float,
    received_at: str,
    fixtures: Path | None,
) -> dict[str, Any]:
    text = load_fixture(fixtures, "ecb_usd_eur.csv")
    if text is None:
        text = get_text(session, ECB_USD_EUR_URL, timeout)
    reader = csv.DictReader(io.StringIO(str(text)))
    observations: list[dict[str, Any]] = []
    for row in reader:
        period = row.get("TIME_PERIOD") or row.get("TIME") or row.get("time_period")
        value = positive_number(row.get("OBS_VALUE") or row.get("value") or row.get("obs_value"))
        if not period or value is None:
            continue
        observations.append({"date": str(period), "usd_per_eur": value, "eur_per_usd": 1.0 / value})
    if not observations:
        raise RuntimeError("BCE USD/EUR: aucune observation exploitable")
    observations.sort(key=lambda row: row["date"])
    latest = observations[-1]
    return {
        "schema": "agent_crypto_fx_reference_v1",
        "version": SCHEMA_VERSION,
        "pair": "USD/EUR",
        "series_key": "EXR.D.USD.EUR.SP00.A",
        "source_id": "ecb",
        "source_name": "Banque centrale européenne",
        "frequency": "daily",
        "source_date": latest["date"],
        "usd_per_eur": latest["usd_per_eur"],
        "eur_per_usd": latest["eur_per_usd"],
        "received_at": received_at,
        "observations": observations,
        "provenance_note": "Taux de référence quotidien BCE ; conversion informative distincte des prix source USD.",
    }


def archive_legacy_metals(data_dir: Path) -> None:
    existing = read_json(data_dir / "latest.json")
    if str(existing.get("provider_id") if existing else "") != "metals_dev":
        return
    archive = data_dir / "archive" / "metals_dev_2026-08-01"
    archive.mkdir(parents=True, exist_ok=True)
    for relative in ("latest.json", "status.json", "ryzen_report.json", "history/index.json"):
        source = data_dir / relative
        target = archive / relative
        if source.is_file() and not target.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
    history_dir = data_dir / "history"
    if history_dir.is_dir():
        for source in history_dir.glob("ryzen7_metals_*.json"):
            target = archive / "history" / source.name
            target.parent.mkdir(parents=True, exist_ok=True)
            if not target.exists():
                shutil.copy2(source, target)


def enrich_quotes_with_fx(quotes: list[dict[str, Any]], fx: dict[str, Any]) -> None:
    eur_per_usd = positive_number(fx.get("eur_per_usd"))
    if eur_per_usd is None:
        raise RuntimeError("BCE USD/EUR: facteur EUR/USD invalide")
    for item in quotes:
        price = positive_number(item.get("price"))
        if price is None:
            raise RuntimeError(f"Prix courant invalide pour {item.get('symbol')}")
        item["price_eur"] = price * eur_per_usd
        item["fx_source_id"] = "ecb"
        item["fx_source_name"] = "Banque centrale européenne"
        item["fx_source_date"] = fx["source_date"]
        item["fx_eur_per_usd"] = eur_per_usd


def build_history_response(series_by_asset: dict[str, dict[str, Any]], received_at: str) -> dict[str, Any]:
    points_by_asset = {
        asset_id: {point["date"]: point for point in series["points"]}
        for asset_id, series in series_by_asset.items()
    }
    common_dates = set.intersection(*(set(points) for points in points_by_asset.values()))
    if len(common_dates) < 200:
        raise RuntimeError(f"Historique commun 5/5 insuffisant ({len(common_dates)} jours)")

    snapshots: list[dict[str, Any]] = []
    for day in sorted(common_dates):
        quotes: list[dict[str, Any]] = []
        for metal in METALS:
            series = series_by_asset[metal.asset_id]
            point = points_by_asset[metal.asset_id][day]
            quotes.append({
                "asset_id": metal.asset_id,
                "domain": "metals",
                "symbol": metal.symbol,
                "source_id": "yahoo_finance",
                "source_name": f"Yahoo Finance · {metal.market}",
                "provider_symbol": metal.future_symbol,
                "instrument_type": "future_continuous",
                "market": metal.market,
                "currency": "USD",
                "unit": metal.unit,
                "unit_label_fr": metal.unit_label_fr,
                "unit_basis": "exchange_contract_convention",
                "price": point["close"],
                "bid": None,
                "ask": None,
                "change": None,
                "change_percent": point["change_percent"],
                "source_time": point["time"],
                "received_at": received_at,
                "data_state": "data_historical",
                "delay_seconds": None,
                "licence_state": "public_web_terms",
                "provenance_note": (
                    f"Historique quotidien public {metal.future_symbol}, marché {metal.market}, "
                    f"unité {metal.unit_label_fr}; série Futures distincte de la cotation indicative courante."
                ),
            })
        snapshots.append({
            "schema": "agent_crypto_metals_snapshot_v1",
            "version": SCHEMA_VERSION,
            "snapshot_id": f"public-futures-{day}",
            "saved_at": f"{day}T00:00:00.000Z",
            "source_mode": "github_actions_public_archive",
            "provider_id": "yahoo_finance",
            "provider_name": "Yahoo Finance · Futures métaux",
            "assets_expected": EXPECTED_ASSETS,
            "assets_count": len(quotes),
            "quote_currencies": ["USD"],
            "quotes": quotes,
            "state": "ready",
            "integrity": {
                "quotes_connected": True,
                "no_invented_values": True,
                "crypto_data_reuse_forbidden": True,
                "source_timestamp_required": True,
                "received_timestamp_required": True,
                "currency_required_for_numeric_price": True,
                "unit_required_for_numeric_price": True,
                "single_snapshot_must_not_draw_chart": True,
                "public_collection_only": True,
                "secret_fields_forbidden": True,
                "spot_and_futures_series_separated": True,
            },
        })

    return {
        "schema": "agent_crypto_metals_history_response_v1",
        "version": SCHEMA_VERSION,
        "source_mode": "github_actions_public_archive",
        "generated_at": received_at,
        "count": len(snapshots),
        "snapshots": snapshots,
        "integrity": {
            "fabricated_points_forbidden": True,
            "crypto_history_reuse_forbidden": True,
            "source_time_preserved": True,
            "duplicate_snapshot_ids_forbidden": True,
            "complete_five_asset_snapshots_only": True,
            "spot_and_futures_series_separated": True,
        },
    }


def current_snapshot(quotes: list[dict[str, Any]], received_at: str) -> dict[str, Any]:
    payload = {
        "schema": "agent_crypto_metals_snapshot_v1",
        "version": SCHEMA_VERSION,
        "snapshot_id": "github-actions-public-metals-" + received_at.replace(":", "-").replace(".", "-"),
        "saved_at": received_at,
        "source_mode": "github_actions_public_archive",
        "provider_id": "gold_api",
        "provider_name": "Gold API",
        "assets_expected": EXPECTED_ASSETS,
        "assets_count": len(quotes),
        "quote_currencies": ["USD"] + (["EUR"] if quotes and all(item.get("price_eur") is not None for item in quotes) else []),
        "quotes": sorted(quotes, key=lambda row: ASSET_ORDER[row["asset_id"]]),
        "state": "ready" if len(quotes) == len(METALS) else "partial",
        "integrity": {
            "quotes_connected": len(quotes) > 0,
            "complete_five_asset_basket": len(quotes) == len(METALS),
            "no_invented_values": True,
            "crypto_data_reuse_forbidden": True,
            "source_timestamp_required": False,
            "received_timestamp_required": True,
            "currency_required_for_numeric_price": True,
            "unit_required_for_numeric_price": True,
            "single_snapshot_must_not_draw_chart": True,
            "public_collection_only": True,
            "secret_fields_forbidden": True,
            "spot_and_futures_series_separated": True,
        },
    }
    payload["fingerprint"] = sha256_json({"saved_at": received_at, "quotes": payload["quotes"]})
    return payload


def spot_snapshot_valid(snapshot: Any) -> bool:
    if not isinstance(snapshot, dict):
        return False
    if snapshot.get("schema") != "agent_crypto_metals_snapshot_v1":
        return False
    if snapshot.get("provider_id") != "gold_api":
        return False
    quotes = snapshot.get("quotes")
    if not isinstance(quotes, list) or len(quotes) != len(METALS):
        return False
    if int(snapshot.get("assets_count") or 0) != len(METALS):
        return False
    if snapshot.get("integrity", {}).get("no_invented_values") is not True:
        return False
    ids = {str(row.get("asset_id") or "") for row in quotes if isinstance(row, dict)}
    if ids != set(EXPECTED_ASSETS):
        return False
    for row in quotes:
        if not isinstance(row, dict):
            return False
        if row.get("source_id") != "gold_api":
            return False
        if row.get("instrument_type") != "spot_reference":
            return False
        if positive_number(row.get("price")) is None:
            return False
    return parse_time(snapshot.get("saved_at")) is not None


def build_spot_history(
    data_dir: Path,
    snapshot: dict[str, Any] | None,
    received_at: str,
) -> dict[str, Any]:
    path = data_dir / SPOT_HISTORY_RELATIVE_PATH
    previous = read_json(path) or {}
    candidates: list[dict[str, Any]] = []
    if previous.get("schema") == SPOT_HISTORY_SCHEMA:
        candidates.extend(
            item for item in (previous.get("snapshots") or [])
            if spot_snapshot_valid(item)
        )
    if spot_snapshot_valid(snapshot):
        candidates.append(snapshot)

    deduplicated: dict[str, dict[str, Any]] = {}
    for item in candidates:
        stamp = parse_time(item.get("saved_at"))
        if not stamp:
            continue
        deduplicated[stamp] = item

    now = datetime.fromisoformat(received_at.replace("Z", "+00:00")).astimezone(UTC)
    cutoff = now - timedelta(hours=SPOT_RETENTION_HOURS)
    rows = []
    for stamp, item in sorted(deduplicated.items()):
        moment = datetime.fromisoformat(stamp.replace("Z", "+00:00")).astimezone(UTC)
        if moment >= cutoff:
            rows.append(item)

    oldest_at = parse_time(rows[0].get("saved_at")) if rows else None
    newest_at = parse_time(rows[-1].get("saved_at")) if rows else None
    span_hours = 0.0
    if oldest_at and newest_at:
        span_hours = max(0.0, (
            datetime.fromisoformat(newest_at.replace("Z", "+00:00"))
            - datetime.fromisoformat(oldest_at.replace("Z", "+00:00"))
        ).total_seconds() / 3600.0)

    payload = {
        "schema": SPOT_HISTORY_SCHEMA,
        "version": SCHEMA_VERSION,
        "source_mode": "github_actions_public_archive",
        "source_id": "gold_api",
        "source_name": "Gold API",
        "generated_at": received_at,
        "retention_hours": SPOT_RETENTION_HOURS,
        "minimum_complete_hours": SPOT_MIN_COMPLETE_HOURS,
        "assets": [metal.symbol for metal in METALS],
        "count": len(rows),
        "oldest_at": oldest_at,
        "newest_at": newest_at,
        "span_hours": round(span_hours, 6),
        "snapshots": rows,
        "integrity": {
            "fabricated_points_forbidden": True,
            "complete_five_asset_snapshots_only": True,
            "source_timestamp_preserved": True,
            "spot_reference_only": True,
            "futures_mixing_forbidden": True,
            "crypto_history_reuse_forbidden": True,
        },
    }
    payload["fingerprint"] = sha256_json({
        "generated_at": received_at,
        "snapshots": rows,
    })
    atomic_write_json(path, payload)
    return {
        "available": len(rows) > 0,
        "complete_24h": len(rows) >= 2 and span_hours >= SPOT_MIN_COMPLETE_HOURS,
        "file": str(SPOT_HISTORY_RELATIVE_PATH).replace("\\", "/"),
        "snapshots": len(rows),
        "oldest_at": oldest_at,
        "newest_at": newest_at,
        "span_hours": round(span_hours, 6),
        "retention_hours": SPOT_RETENTION_HOURS,
        "minimum_complete_hours": SPOT_MIN_COMPLETE_HOURS,
        "source_id": "gold_api",
    }


def history_state_from_disk(data_dir: Path) -> dict[str, Any]:
    history = read_json(data_dir / "history" / "public_1y.json") or {}
    index = read_json(data_dir / "history" / "index.json") or {}
    valid = (
        history.get("schema") == "agent_crypto_metals_history_response_v1"
        and int(history.get("count") or 0) >= 200
        and index.get("schema") == "agent_crypto_metals_history_index_v1"
    )
    return {
        "available": bool(valid),
        "preserved": bool(valid),
        "file": "history/public_1y.json",
        "snapshots": int(history.get("count") or 0) if valid else 0,
        "oldest_at": index.get("oldest_at") if valid else None,
        "newest_at": index.get("newest_at") if valid else None,
        "series_points": {
            str(entry.get("asset_id")): int(entry.get("points") or 0)
            for entry in (index.get("entries") or []) if isinstance(entry, dict)
        } if valid else {},
        "source_id": "yahoo_finance",
    }


def build_status(
    data_dir: Path,
    received_at: str,
    current_count: int,
    current_preserved: bool,
    history_info: dict[str, Any],
    intraday_info: dict[str, Any],
    spot_info: dict[str, Any],
    fx: dict[str, Any] | None,
    source_states: dict[str, str],
    errors: list[str],
) -> dict[str, Any]:
    previous = read_json(data_dir / "status.json") or {}
    effective_count = current_count
    if current_preserved:
        effective_count = int((read_json(data_dir / "latest.json") or {}).get("assets_count") or 0)

    history_available = bool(history_info.get("available"))
    intraday_available = bool(intraday_info.get("available"))
    if current_count == len(METALS) and history_available and intraday_available and not errors:
        state = "ready"
    elif current_count > 0:
        state = "partial"
    elif current_preserved and effective_count > 0:
        state = "degraded"
    else:
        state = "unavailable"

    last_success = received_at if current_count > 0 else previous.get("last_success_at")
    return {
        "schema": "agent_crypto_metals_collector_status_v1",
        "version": SCHEMA_VERSION,
        "status": state,
        "provider_id": "public_metals_multi_source",
        "provider_name": "Gold API + Yahoo Finance Futures + BCE",
        "bridge_required": False,
        "public_page_mode": "github_actions_archive_reader",
        "last_attempt_at": received_at,
        "last_success_at": last_success,
        "last_error": " | ".join(errors)[:4000] if errors else None,
        "assets_expected": len(METALS),
        "assets_received": effective_count,
        "current": {
            "available": effective_count > 0,
            "preserved": bool(current_preserved),
            "assets": effective_count,
            "source_id": "gold_api",
        },
        "quota": {"plan": "public_no_key", "limit": None, "remaining": None, "period": None, "reset_at": None},
        "sources": [
            {"id": "gold_api", "role": "current_indicative_prices", "authentication": "none", "state": source_states.get("gold_api", "unavailable")},
            {"id": "yahoo_finance", "role": "daily_and_intraday_futures", "transport": "browser_session_query2_query1", "authentication": "none", "state": source_states.get("yahoo_finance", "unavailable")},
            {"id": "ecb", "role": "usd_eur_reference_rate", "authentication": "none", "state": source_states.get("ecb", "unavailable")},
        ],
        "history": history_info,
        "intraday_24h": intraday_info,
        "spot_history": spot_info,
        "fx": ({"pair": fx.get("pair"), "source_date": fx.get("source_date"), "eur_per_usd": fx.get("eur_per_usd")} if fx else previous.get("fx")),
        "fallback": {
            "last_valid_snapshot_preserved": bool(current_preserved),
            "last_valid_history_preserved": bool(history_info.get("preserved")),
            "last_valid_intraday_preserved": bool(intraday_info.get("preserved")),
            "invented_replacement_values": False,
        },
        "security": {
            "api_key_present_in_public_files": False,
            "browser_direct_keyed_request_forbidden": True,
            "crypto_cache_separation_required": True,
            "secret_fields_forbidden_in_import": True,
            "provider_fetch_not_performed_by_public_page": True,
            "manual_ryzen_publication_required": False,
        },
        "integrity": {
            "current_and_history_decoupled": True,
            "current_quotes_not_erased_by_history_failure": True,
            "history_never_fabricated": True,
            "intraday_futures_and_current_spot_separated": True,
        },
        "updated_at": received_at,
        "collector": "tools/collect_public_metals.py",
    }

def build_index(received_at: str, history: dict[str, Any], series_by_asset: dict[str, dict[str, Any]]) -> dict[str, Any]:
    entries = [
        {
            "asset_id": metal.asset_id,
            "symbol": metal.symbol,
            "provider_symbol": metal.future_symbol,
            "file": f"../series/{metal.asset_id}.json",
            "points": series_by_asset[metal.asset_id]["points_count"],
            "oldest_at": series_by_asset[metal.asset_id]["oldest_at"],
            "newest_at": series_by_asset[metal.asset_id]["newest_at"],
            "provider_id": "yahoo_finance",
        }
        for metal in METALS
    ]
    return {
        "schema": "agent_crypto_metals_history_index_v1",
        "version": SCHEMA_VERSION,
        "directory": "data/metals/history",
        "history_response": "public_1y.json",
        "entries": entries,
        "files": len(entries) + 1,
        "snapshots": history["count"],
        "oldest_at": min(entry["oldest_at"] for entry in entries),
        "newest_at": max(entry["newest_at"] for entry in entries),
        "updated_at": received_at,
        "integrity": {
            "fabricated_points_forbidden": True,
            "crypto_history_reuse_forbidden": True,
            "source_time_preserved": True,
            "duplicate_snapshot_ids_forbidden": True,
            "complete_five_asset_snapshots_only": True,
        },
    }


def build_manifest(received_at: str, status: dict[str, Any], errors: list[str] | None = None) -> dict[str, Any]:
    payload = {
        "schema": "agent_crypto_public_metals_collection_manifest_v1",
        "version": SCHEMA_VERSION,
        "generated_at": received_at,
        "build_target": BUILD_TARGET,
        "state": status.get("status"),
        "assets": [metal.symbol for metal in METALS],
        "current_provider": "gold_api",
        "history_provider": "yahoo_finance",
        "fx_provider": "ecb",
        "status": status.get("status"),
        "errors": errors or [],
        "files": {
            "latest": "data/metals/latest.json",
            "status": "data/metals/status.json",
            "history": "data/metals/history/public_1y.json",
            "intraday_24h": "data/metals/history/intraday_24h.json",
            "spot_history": "data/metals/history/spot_48h.json",
            "history_index": "data/metals/history/index.json",
            "fx": "data/metals/fx/usd_eur.json",
            "series": [f"data/metals/series/{metal.asset_id}.json" for metal in METALS],
        },
        "integrity": {
            "no_api_key": True,
            "no_manual_ryzen_publication": True,
            "crypto_data_untouched": True,
            "current_and_history_decoupled": True,
            "current_quotes_survive_history_failure": True,
            "five_of_five_current_required_for_green_run": True,
            "minimum_one_year_history_required_when_published": True,
            "spot_and_futures_series_separated": True,
            "immediate_intraday_futures_enabled": True,
            "intraday_interval": INTRADAY_INTERVAL,
            "intraday_window_hours": INTRADAY_WINDOW_HOURS,
            "rolling_spot_archive_enabled": True,
            "spot_history_retention_hours": SPOT_RETENTION_HOURS,
            "last_valid_data_preserved_on_failure": True,
        },
    }
    payload["fingerprint"] = sha256_json(payload)
    return payload


def validate_current(snapshot: dict[str, Any]) -> None:
    count = int(snapshot.get("assets_count") or 0)
    quotes = snapshot.get("quotes") or []
    if count != len(quotes) or count < 1:
        raise RuntimeError("Snapshot courant vide ou incohérent")
    if len({row.get("asset_id") for row in quotes}) != count:
        raise RuntimeError("Panier courant incohérent")
    if any(positive_number(row.get("price")) is None for row in quotes):
        raise RuntimeError("Prix courant invalide")
    if snapshot.get("integrity", {}).get("no_invented_values") is not True:
        raise RuntimeError("Verrou anti-invention absent")


def validate_history(history: dict[str, Any], series_by_asset: dict[str, dict[str, Any]]) -> None:
    if history.get("count", 0) < 200:
        raise RuntimeError(f"Historique public insuffisant: {history.get('count', 0)} snapshots")
    if set(series_by_asset) != set(EXPECTED_ASSETS):
        raise RuntimeError("Séries Métaux incomplètes")
    if any(series.get("points_count", 0) < 200 for series in series_by_asset.values()):
        raise RuntimeError("Une série Métaux contient moins de 200 points")


def main() -> int:
    parser = argparse.ArgumentParser(description="Collecteur public Métaux Agent-Crypto")
    parser.add_argument("--root", default="public/agent_crypto_erith_ia", help="Racine de l'interface dans le dépôt")
    parser.add_argument("--timeout", type=float, default=25.0)
    parser.add_argument("--fixtures", type=Path, default=None, help="Fixtures hors ligne pour tests")
    parser.add_argument("--pacing", type=float, default=1.4, help="Pause entre symboles Yahoo hors fixtures")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    data_dir = root / "data" / "metals"
    data_dir.mkdir(parents=True, exist_ok=True)
    archive_legacy_metals(data_dir)

    received_at = iso()
    session = build_session()
    yahoo_session = build_yahoo_session()
    errors: list[str] = []
    source_states = {"gold_api": "ready", "yahoo_finance": "ready", "ecb": "ready"}

    previous_latest = read_json(data_dir / "latest.json") or {}
    previous_current_valid = (
        previous_latest.get("schema") == "agent_crypto_metals_snapshot_v1"
        and int(previous_latest.get("assets_count") or 0) > 0
        and previous_latest.get("integrity", {}).get("no_invented_values") is True
    )

    # Current quotes and FX are independent from the historical series.
    quotes: list[dict[str, Any]] = []
    for metal in METALS:
        try:
            quotes.append(gold_api_quote(session, metal, args.timeout, received_at, args.fixtures))
        except Exception as exc:
            source_states["gold_api"] = "partial" if quotes else "unavailable"
            errors.append(f"Gold API {metal.symbol}: {exc}")

    fx: dict[str, Any] | None = None
    try:
        fx = ecb_fx(session, args.timeout, received_at, args.fixtures)
        enrich_quotes_with_fx(quotes, fx)
        atomic_write_json(data_dir / "fx" / "usd_eur.json", fx)
    except Exception as exc:
        source_states["ecb"] = "unavailable"
        errors.append(f"BCE USD/EUR: {exc}")
        # USD quotes remain publishable without an EUR conversion.
        for item in quotes:
            item["price_eur"] = None
            item["fx_source_id"] = None
            item["fx_source_date"] = None

    current_count = len(quotes)
    current_preserved = False
    snapshot: dict[str, Any] | None = None
    if current_count > 0:
        snapshot = current_snapshot(quotes, received_at)
        validate_current(snapshot)
        atomic_write_json(data_dir / "latest.json", snapshot)
    elif previous_current_valid:
        current_preserved = True

    # A complete Gold API basket is appended to a dedicated rolling spot archive.
    # Partial or missing baskets never enter the 24-hour series.
    spot_info = build_spot_history(
        data_dir,
        snapshot if current_count == len(METALS) else None,
        received_at,
    )

    # Daily and intraday Futures are collected independently from the current Gold API quote.
    series_by_asset: dict[str, dict[str, Any]] = {}
    intraday_by_asset: dict[str, dict[str, Any]] = {}
    history_errors: list[str] = []
    intraday_errors: list[str] = []
    for index, metal in enumerate(METALS):
        if args.fixtures is None and index:
            time.sleep(max(0.0, args.pacing))
        try:
            series_by_asset[metal.asset_id] = yahoo_future_series(
                yahoo_session, metal, args.timeout, received_at, args.fixtures
            )
        except Exception as exc:
            history_errors.append(f"Yahoo daily {metal.future_symbol}: {exc}")
        if args.fixtures is None:
            time.sleep(max(0.25, args.pacing / 2.0))
        try:
            intraday_by_asset[metal.asset_id] = yahoo_intraday_series(
                yahoo_session, metal, args.timeout, received_at, args.fixtures
            )
        except Exception as exc:
            intraday_errors.append(f"Yahoo intraday {metal.future_symbol}: {exc}")

    history_info: dict[str, Any]
    if len(series_by_asset) == len(METALS):
        try:
            history = build_history_response(series_by_asset, received_at)
            index = build_index(received_at, history, series_by_asset)
            validate_history(history, series_by_asset)
            atomic_write_json(data_dir / "history" / "public_1y.json", history)
            atomic_write_json(data_dir / "history" / "index.json", index)
            for asset_id, series in series_by_asset.items():
                atomic_write_json(data_dir / "series" / f"{asset_id}.json", series)
            history_info = {
                "available": True, "preserved": False, "file": "history/public_1y.json",
                "snapshots": history["count"], "oldest_at": index["oldest_at"], "newest_at": index["newest_at"],
                "series_points": {key: value["points_count"] for key, value in series_by_asset.items()},
                "source_id": "yahoo_finance",
            }
        except Exception as exc:
            history_errors.append(f"Historique quotidien commun: {exc}")
            history_info = history_state_from_disk(data_dir)
    else:
        history_info = history_state_from_disk(data_dir)

    if len(intraday_by_asset) == len(METALS):
        try:
            intraday_info = build_intraday_history(data_dir, intraday_by_asset, received_at)
        except Exception as exc:
            intraday_errors.append(f"Historique intraday commun: {exc}")
            intraday_info = intraday_state_from_disk(data_dir)
    else:
        intraday_info = intraday_state_from_disk(data_dir)

    if history_errors or intraday_errors:
        yahoo_preserved = bool(history_info.get("available")) or bool(intraday_info.get("available"))
        source_states["yahoo_finance"] = "preserved" if yahoo_preserved else "unavailable"
        errors.extend(history_errors)
        errors.extend(intraday_errors)

    status = build_status(
        data_dir, received_at, current_count, current_preserved, history_info, intraday_info, spot_info, fx, source_states, errors
    )
    atomic_write_json(data_dir / "status.json", status)
    atomic_write_json(data_dir / "collector_manifest.json", build_manifest(received_at, status, errors))

    print(json.dumps({
        "status": status["status"],
        "received_at": received_at,
        "current_quotes": status["assets_received"],
        "current_preserved": current_preserved,
        "history_available": bool(history_info.get("available")),
        "history_preserved": bool(history_info.get("preserved")),
        "history_snapshots": int(history_info.get("snapshots") or 0),
        "intraday_available": bool(intraday_info.get("available")),
        "intraday_assets": int(intraday_info.get("assets") or 0),
        "intraday_points": intraday_info.get("series_points") or {},
        "spot_snapshots": int(spot_info.get("snapshots") or 0),
        "spot_span_hours": float(spot_info.get("span_hours") or 0),
        "spot_24h_complete": bool(spot_info.get("complete_24h")),
        "errors": errors,
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"COLLECTOR_FATAL: {exc}", file=sys.stderr)
        raise
