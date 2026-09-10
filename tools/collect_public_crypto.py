#!/usr/bin/env python3
"""Collect a public CoinGecko Top-250 crypto market snapshot for Agent-Crypto.

Build 28.2.75 architecture:
- GitHub Actions, not the browser, contacts CoinGecko.
- CoinGecko USD monetary values are converted to EUR with the public ECB rate.
- The original USD values are preserved next to the EUR values.
- The last valid public snapshot is never overwritten by a failed collection.
- No API key, wallet, order, Bridge write, or Crypto file outside data/crypto is used.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import math
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

UTC = timezone.utc
BUILD_TARGET = "28.2.75"
SCHEMA_VERSION = "1.0.0"
LATEST_SCHEMA = "agent_crypto_public_market_snapshot_v1"
STATUS_SCHEMA = "agent_crypto_public_market_collector_status_v1"
COINGECKO_URL = (
    "https://api.coingecko.com/api/v3/coins/markets"
    "?vs_currency=usd&order=market_cap_desc&per_page=250&page=1"
    "&locale=fr&precision=full&sparkline=false"
    "&price_change_percentage=1h,24h,7d,30d"
)
ECB_USD_EUR_URL = (
    "https://data-api.ecb.europa.eu/service/data/EXR/"
    "D.USD.EUR.SP00.A?lastNObservations=10&format=csvdata"
)
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "Chrome/126 Safari/537.36 Agent-Crypto-ERITH-IA-Public-Crypto/28.2.75"
)
FX_MAX_AGE_DAYS = 10


def utc_now() -> datetime:
    return datetime.now(tz=UTC)


def iso(value: datetime | None = None) -> str:
    return (value or utc_now()).astimezone(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def finite(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def positive(value: Any) -> float | None:
    number = finite(value)
    return number if number is not None and number > 0 else None


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)


def sha256_json(value: Any) -> str:
    return "sha256:" + hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def atomic_write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    os.replace(temp, path)


def read_json(path: Path) -> dict[str, Any] | None:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else None
    except Exception:
        return None


def parse_iso(value: Any) -> datetime | None:
    text = str(value or "").strip()
    if not text:
        return None
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).astimezone(UTC)
    except ValueError:
        return None


def build_session() -> requests.Session:
    retry = Retry(
        total=2,
        connect=2,
        read=2,
        status=2,
        backoff_factor=1.0,
        status_forcelist=(500, 502, 503, 504),
        allowed_methods=frozenset({"GET"}),
        respect_retry_after_header=True,
    )
    session = requests.Session()
    session.headers.update({
        "User-Agent": USER_AGENT,
        "Accept": "application/json,text/csv;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.7",
    })
    session.mount("https://", HTTPAdapter(max_retries=retry))
    return session


def fetch_coingecko(session: requests.Session, timeout: float) -> list[dict[str, Any]]:
    response = session.get(COINGECKO_URL, timeout=timeout)
    if response.status_code == 429:
        raise RuntimeError("CoinGecko HTTP 429 (quota temporaire)")
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list):
        raise RuntimeError("CoinGecko Top 250: tableau JSON attendu")
    return [row for row in payload if isinstance(row, dict)]


def normalize_fx_payload(payload: dict[str, Any]) -> dict[str, Any] | None:
    if str(payload.get("pair") or "").upper() != "USD/EUR":
        return None
    eur_per_usd = positive(payload.get("eur_per_usd"))
    usd_per_eur = positive(payload.get("usd_per_eur"))
    source_date = str(payload.get("source_date") or "").strip()
    if eur_per_usd is None or usd_per_eur is None or not source_date:
        return None
    date_value = parse_iso(source_date + "T23:59:59Z" if len(source_date) == 10 else source_date)
    if date_value is None:
        return None
    age_days = max(0.0, (utc_now() - date_value).total_seconds() / 86400.0)
    if age_days > FX_MAX_AGE_DAYS:
        return None
    return {
        "pair": "USD/EUR",
        "eur_per_usd": eur_per_usd,
        "usd_per_eur": usd_per_eur,
        "source_date": source_date,
        "received_at": payload.get("received_at"),
        "source_id": payload.get("source_id") or "ecb",
        "source_name": payload.get("source_name") or "Banque centrale européenne",
        "age_days": age_days,
        "path": "../metals/fx/usd_eur.json",
    }


def fetch_ecb_fx(session: requests.Session, timeout: float) -> dict[str, Any]:
    response = session.get(ECB_USD_EUR_URL, timeout=timeout, headers={"Accept": "text/csv"})
    response.raise_for_status()
    reader = csv.DictReader(io.StringIO(response.text))
    observations: list[tuple[str, float]] = []
    for row in reader:
        date_value = str(row.get("TIME_PERIOD") or "").strip()
        usd_per_eur = positive(row.get("OBS_VALUE"))
        if date_value and usd_per_eur is not None:
            observations.append((date_value, usd_per_eur))
    if not observations:
        raise RuntimeError("BCE USD/EUR: aucune observation valide")
    source_date, usd_per_eur = sorted(observations, key=lambda item: item[0])[-1]
    return {
        "pair": "USD/EUR",
        "eur_per_usd": 1.0 / usd_per_eur,
        "usd_per_eur": usd_per_eur,
        "source_date": source_date,
        "received_at": iso(),
        "source_id": "ecb",
        "source_name": "Banque centrale européenne",
        "age_days": 0.0,
        "path": None,
    }


def load_fx(root: Path, session: requests.Session, timeout: float) -> dict[str, Any]:
    fx_path = root / "data" / "metals" / "fx" / "usd_eur.json"
    local = normalize_fx_payload(read_json(fx_path) or {}) if fx_path.is_file() else None
    if local is not None:
        local["origin"] = "existing_public_metals_fx"
        return local
    fresh = fetch_ecb_fx(session, timeout)
    fresh["origin"] = "ecb_direct_collector_fallback"
    return fresh


def normalize_market(rows: list[dict[str, Any]], fx: dict[str, Any], minimum_assets: int) -> list[dict[str, Any]]:
    rate = positive(fx.get("eur_per_usd"))
    if rate is None:
        raise RuntimeError("Taux BCE EUR par USD invalide")

    seen: set[str] = set()
    coins: list[dict[str, Any]] = []
    generated_at = iso()

    def convert(value: Any) -> float | None:
        number = finite(value)
        return number * rate if number is not None else None

    for row in rows:
        coin_id = str(row.get("id") or "").strip()
        rank = finite(row.get("market_cap_rank"))
        price_usd = positive(row.get("current_price"))
        if not coin_id or coin_id in seen or rank is None or not (1 <= rank <= 250) or price_usd is None:
            continue
        seen.add(coin_id)
        last_updated = str(row.get("last_updated") or generated_at)
        fx_record = {
            "active": True,
            "mode": "github-actions-ecb-usd-to-eur",
            "pair": "USD/EUR",
            "eurPerUsd": rate,
            "usdPerEur": positive(fx.get("usd_per_eur")),
            "sourceDate": fx.get("source_date"),
            "receivedAt": fx.get("received_at"),
            "sourceId": fx.get("source_id") or "ecb",
            "sourceName": fx.get("source_name") or "Banque centrale européenne",
        }
        coins.append({
            "id": coin_id,
            "rank": int(rank),
            "name": str(row.get("name") or coin_id),
            "symbol": str(row.get("symbol") or "").upper(),
            "image": row.get("image"),
            "price": convert(price_usd),
            "priceEur": convert(price_usd),
            "priceUsd": price_usd,
            "change1h": finite(row.get("price_change_percentage_1h_in_currency")),
            "change24h": finite(row.get("price_change_percentage_24h_in_currency") if row.get("price_change_percentage_24h_in_currency") is not None else row.get("price_change_percentage_24h")),
            "change7d": finite(row.get("price_change_percentage_7d_in_currency")),
            "change30d": finite(row.get("price_change_percentage_30d_in_currency")),
            "high24h": convert(row.get("high_24h")),
            "low24h": convert(row.get("low_24h")),
            "high24hUsd": finite(row.get("high_24h")),
            "low24hUsd": finite(row.get("low_24h")),
            "marketCap": convert(row.get("market_cap")),
            "marketCapUsd": finite(row.get("market_cap")),
            "volume24h": convert(row.get("total_volume")),
            "volume24hUsd": finite(row.get("total_volume")),
            "sparkline7d": [],
            "lastUpdated": last_updated,
            "source": "CoinGecko",
            "sourceMode": "github-public",
            "quoteCurrencies": ["EUR", "USD"],
            "changeQuoteCurrency": "USD",
            "timestamp": generated_at,
            "fxConversion": fx_record,
        })

    coins.sort(key=lambda coin: coin["rank"])
    if len(coins) < minimum_assets:
        raise RuntimeError(f"Univers CoinGecko insuffisant: {len(coins)}/250 actifs valides")
    return coins


def build_snapshot(rows: list[dict[str, Any]], fx: dict[str, Any], minimum_assets: int) -> dict[str, Any]:
    coins = normalize_market(rows, fx, minimum_assets)
    generated_at = iso()
    total_market_cap_eur = sum(float(coin.get("marketCap") or 0) for coin in coins)
    total_market_cap_usd = sum(float(coin.get("marketCapUsd") or 0) for coin in coins)
    total_volume_eur = sum(float(coin.get("volume24h") or 0) for coin in coins)
    total_volume_usd = sum(float(coin.get("volume24hUsd") or 0) for coin in coins)
    btc = next((coin for coin in coins if coin["id"] == "bitcoin" or coin["symbol"] == "BTC"), None)
    btc_share = (
        float(btc.get("marketCap") or 0) / total_market_cap_eur * 100.0
        if btc and total_market_cap_eur > 0
        else None
    )
    snapshot_id = f"coingecko-top250-usd-ecb-eur-github_{generated_at}"
    snapshot = {
        "schema": LATEST_SCHEMA,
        "version": SCHEMA_VERSION,
        "build": BUILD_TARGET,
        "generated_at": generated_at,
        "snapshot_id": snapshot_id,
        "assets_count": len(coins),
        "requested_assets": 250,
        "source": {
            "provider_id": "coingecko",
            "provider_name": "CoinGecko",
            "collection_mode": "github_actions_public_archive",
            "quote_currency": "USD",
            "endpoint_family": "coins/markets",
            "browser_direct_required": False,
        },
        "fx": {
            "pair": "USD/EUR",
            "eur_per_usd": fx["eur_per_usd"],
            "usd_per_eur": fx["usd_per_eur"],
            "source_date": fx["source_date"],
            "received_at": fx.get("received_at"),
            "source_id": fx.get("source_id") or "ecb",
            "source_name": fx.get("source_name") or "Banque centrale européenne",
            "origin": fx.get("origin"),
        },
        "coins": coins,
        "global": {
            "total_market_cap": {"eur": total_market_cap_eur, "usd": total_market_cap_usd},
            "total_volume": {"eur": total_volume_eur, "usd": total_volume_usd},
            "market_cap_percentage": {"btc": btc_share},
            "scope": "top250-ranked",
            "fx_reference": {
                "active": True,
                "mode": "github-actions-ecb-usd-to-eur",
                "pair": "USD/EUR",
                "eurPerUsd": fx["eur_per_usd"],
                "usdPerEur": fx["usd_per_eur"],
                "sourceDate": fx["source_date"],
                "receivedAt": fx.get("received_at"),
                "sourceId": fx.get("source_id") or "ecb",
                "sourceName": fx.get("source_name") or "Banque centrale européenne",
            },
        },
        "integrity": {
            "no_invented_values": True,
            "original_usd_preserved": True,
            "all_eur_monetary_values_use_single_fx_rate": True,
            "percentage_variations_remain_coingecko_usd_based": True,
            "browser_direct_market_fetch_required": False,
            "last_valid_preserved_on_failure": True,
            "orders_generated": False,
            "wallet_actions_generated": False,
        },
    }
    snapshot["content_hash"] = sha256_json({
        "generated_at": generated_at,
        "snapshot_id": snapshot_id,
        "coins": coins,
        "global": snapshot["global"],
        "fx": snapshot["fx"],
    })
    return snapshot


def valid_existing_snapshot(payload: dict[str, Any] | None, minimum_assets: int) -> bool:
    if not payload or payload.get("schema") != LATEST_SCHEMA:
        return False
    coins = payload.get("coins")
    return isinstance(coins, list) and len(coins) >= minimum_assets


def build_status(*, status: str, started_at: str, latest: dict[str, Any] | None, error: str | None, preserved: bool) -> dict[str, Any]:
    return {
        "schema": STATUS_SCHEMA,
        "version": SCHEMA_VERSION,
        "build": BUILD_TARGET,
        "status": status,
        "started_at": started_at,
        "completed_at": iso(),
        "assets_received": int(latest.get("assets_count") or 0) if latest else 0,
        "latest_snapshot_id": latest.get("snapshot_id") if latest else None,
        "latest_generated_at": latest.get("generated_at") if latest else None,
        "last_success_at": latest.get("generated_at") if latest else None,
        "last_error": error,
        "preserved_last_valid": preserved,
        "source": {
            "market": "CoinGecko Top 250 USD",
            "conversion": "BCE USD/EUR",
            "publication": "GitHub Actions static JSON",
            "schedule": "twice_hourly_11_41_europe_paris",
            "schedule_label": "11 et 41 min de chaque heure · Europe/Paris",
            "recovery_watchdog": "17 et 47 min · stale >=20 min · aucun collecteur actif",
        },
        "security": {
            "api_key_required": False,
            "api_key_present_in_public_files": False,
            "browser_direct_market_fetch_required": False,
            "github_write_scope": "public/agent_crypto_erith_ia/data/crypto only",
            "exchange_order_allowed": False,
            "wallet_action_allowed": False,
        },
        "integrity": {
            "last_valid_preserved_on_failure": True,
            "metals_data_untouched": True,
            "bridge_untouched": True,
            "interface_files_untouched_by_collector": True,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default="public/agent_crypto_erith_ia")
    parser.add_argument("--timeout", type=float, default=25.0)
    parser.add_argument("--minimum-assets", type=int, default=40)
    args = parser.parse_args()

    root = Path(args.root).resolve()
    data_root = root / "data" / "crypto"
    latest_path = data_root / "latest.json"
    status_path = data_root / "status.json"
    started_at = iso()
    existing = read_json(latest_path)
    existing_valid = valid_existing_snapshot(existing, args.minimum_assets)

    session = build_session()
    try:
        rows = fetch_coingecko(session, args.timeout)
        fx = load_fx(root, session, args.timeout)
        latest = build_snapshot(rows, fx, args.minimum_assets)
        atomic_write_json(latest_path, latest)
        atomic_write_json(status_path, build_status(
            status="ready",
            started_at=started_at,
            latest=latest,
            error=None,
            preserved=False,
        ))
        print(json.dumps({
            "status": "ready",
            "assets": latest["assets_count"],
            "snapshot": latest["snapshot_id"],
            "fx_date": latest["fx"]["source_date"],
        }, ensure_ascii=False))
        return 0
    except Exception as exc:
        error = f"{type(exc).__name__}: {exc}"
        preserved_latest = existing if existing_valid else None
        atomic_write_json(status_path, build_status(
            status="degraded" if preserved_latest else "unavailable",
            started_at=started_at,
            latest=preserved_latest,
            error=error,
            preserved=bool(preserved_latest),
        ))
        print(json.dumps({
            "status": "degraded" if preserved_latest else "unavailable",
            "preserved": bool(preserved_latest),
            "error": error,
        }, ensure_ascii=False))
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
