#!/usr/bin/env python3
"""Publish a public CoinGecko extended market snapshot (ranks 251..1000).

40.3.102 architecture:
- GitHub Actions, not Firefox, contacts CoinGecko.
- The canonical Top 250 remains owned by collect_public_crypto.py.
- This collector fetches pages 2, 3 and 4 only (max 250 rows/page).
- Existing public Top-250 FX metadata supplies the USD->EUR rate.
- Last valid extended.json is preserved on collection failure.
- No API key, wallet, order, Bridge write, browser direct CoinGecko request,
  or mutation of the canonical Top 250 is used.
"""
from __future__ import annotations

import argparse
import hashlib
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
BUILD_TARGET = "40.3.102"
SCHEMA_VERSION = "1.0.0"
EXTENDED_SCHEMA = "agent_crypto_public_extended_market_snapshot_v1"
STATUS_SCHEMA = "agent_crypto_public_extended_market_collector_status_v1"
RANK_MIN = 251
RANK_MAX = 1000
PAGES = (2, 3, 4)
PER_PAGE = 250
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "Chrome/126 Safari/537.36 Agent-Crypto-ERITH-IA-Extended/40.3.102"
)


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


def build_session() -> requests.Session:
    retry = Retry(
        total=2,
        connect=2,
        read=2,
        status=2,
        backoff_factor=1.0,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset({"GET"}),
        respect_retry_after_header=True,
    )
    session = requests.Session()
    session.headers.update({
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.7",
    })
    session.mount("https://", HTTPAdapter(max_retries=retry))
    return session


def load_public_fx(root: Path) -> dict[str, Any]:
    latest_path = root / "data" / "crypto" / "latest.json"
    payload = read_json(latest_path) or {}
    fx = payload.get("fx") if isinstance(payload.get("fx"), dict) else {}
    eur_per_usd = positive(fx.get("eur_per_usd"))
    usd_per_eur = positive(fx.get("usd_per_eur"))
    source_date = str(fx.get("source_date") or "").strip()
    if eur_per_usd is None or usd_per_eur is None or not source_date:
        raise RuntimeError("Top-250 public FX unavailable; run canonical crypto collector first")
    return {
        "pair": "USD/EUR",
        "eur_per_usd": eur_per_usd,
        "usd_per_eur": usd_per_eur,
        "source_date": source_date,
        "source_id": fx.get("source_id") or "ecb",
        "source_name": fx.get("source_name") or "Banque centrale européenne",
        "received_at": fx.get("received_at"),
        "origin": "canonical_top250_public_fx",
    }


def fetch_page(session: requests.Session, page: int, timeout: float) -> list[dict[str, Any]]:
    url = (
        "https://api.coingecko.com/api/v3/coins/markets"
        f"?vs_currency=usd&order=market_cap_desc&per_page={PER_PAGE}&page={page}"
        "&locale=fr&precision=full&sparkline=false"
        "&price_change_percentage=1h,24h,7d,30d"
    )
    response = session.get(url, timeout=timeout)
    if response.status_code == 429:
        raise RuntimeError(f"CoinGecko HTTP 429 page {page}")
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list):
        raise RuntimeError(f"CoinGecko page {page}: JSON array expected")
    return [row for row in payload if isinstance(row, dict)]


def fetch_extended(session: requests.Session, timeout: float) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for page in PAGES:
        page_rows = fetch_page(session, page, timeout)
        if len(page_rows) < 100:
            raise RuntimeError(f"CoinGecko page {page} incomplete: {len(page_rows)}/{PER_PAGE}")
        rows.extend(page_rows)
    return rows


def normalize_extended(rows: list[dict[str, Any]], fx: dict[str, Any]) -> list[dict[str, Any]]:
    rate = positive(fx.get("eur_per_usd"))
    if rate is None:
        raise RuntimeError("Invalid EUR/USD conversion rate")

    generated_at = iso()
    seen: set[str] = set()
    coins: list[dict[str, Any]] = []

    def convert(value: Any) -> float | None:
        number = finite(value)
        return number * rate if number is not None else None

    for row in rows:
        coin_id = str(row.get("id") or "").strip()
        rank = finite(row.get("market_cap_rank"))
        price_usd = positive(row.get("current_price"))
        if (
            not coin_id
            or coin_id in seen
            or rank is None
            or not (RANK_MIN <= rank <= RANK_MAX)
            or price_usd is None
        ):
            continue
        seen.add(coin_id)
        last_updated = str(row.get("last_updated") or generated_at)
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
            "change24h": finite(
                row.get("price_change_percentage_24h_in_currency")
                if row.get("price_change_percentage_24h_in_currency") is not None
                else row.get("price_change_percentage_24h")
            ),
            "change7d": finite(row.get("price_change_percentage_7d_in_currency")),
            "change30d": finite(row.get("price_change_percentage_30d_in_currency")),
            "high24h": convert(row.get("high_24h")),
            "low24h": convert(row.get("low_24h")),
            "marketCap": convert(row.get("market_cap")),
            "marketCapUsd": finite(row.get("market_cap")),
            "volume24h": convert(row.get("total_volume")),
            "volume24hUsd": finite(row.get("total_volume")),
            "lastUpdated": last_updated,
            "source": "CoinGecko",
            "sourceMode": "github-public-extended",
            "quoteCurrencies": ["EUR", "USD"],
            "changeQuoteCurrency": "USD",
            "timestamp": generated_at,
            "externalLookup": True,
        })

    coins.sort(key=lambda coin: coin["rank"])
    if len(coins) < 400:
        raise RuntimeError(f"Extended universe insufficient: {len(coins)} valid rows")
    return coins


def build_snapshot(rows: list[dict[str, Any]], fx: dict[str, Any]) -> dict[str, Any]:
    coins = normalize_extended(rows, fx)
    generated_at = iso()
    payload = {
        "schema": EXTENDED_SCHEMA,
        "version": SCHEMA_VERSION,
        "build": BUILD_TARGET,
        "generated_at": generated_at,
        "snapshot_id": f"coingecko-ranks-251-1000_{generated_at}",
        "rank_min": RANK_MIN,
        "rank_max": RANK_MAX,
        "pages": list(PAGES),
        "assets_count": len(coins),
        "source": {
            "provider_id": "coingecko",
            "provider_name": "CoinGecko",
            "collection_mode": "github_actions_public_extended_archive",
            "quote_currency": "USD",
            "endpoint_family": "coins/markets",
            "browser_direct_required": False,
        },
        "fx": fx,
        "coins": coins,
        "integrity": {
            "canonical_top250_mutated": False,
            "browser_direct_market_fetch_required": False,
            "no_invented_values": True,
            "original_usd_preserved": True,
            "all_eur_monetary_values_use_single_fx_rate": True,
            "percentage_variations_remain_coingecko_usd_based": True,
            "last_valid_preserved_on_failure": True,
            "orders_generated": False,
            "wallet_actions_generated": False,
        },
    }
    payload["content_hash"] = sha256_json({
        "generated_at": generated_at,
        "coins": coins,
        "fx": fx,
    })
    return payload


def valid_existing(payload: dict[str, Any] | None) -> bool:
    return bool(
        payload
        and payload.get("schema") == EXTENDED_SCHEMA
        and isinstance(payload.get("coins"), list)
        and len(payload["coins"]) >= 400
    )


def status_payload(
    *,
    status: str,
    started_at: str,
    latest: dict[str, Any] | None,
    error: str | None,
    preserved: bool,
) -> dict[str, Any]:
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
        "last_error": error,
        "preserved_last_valid": preserved,
        "source": {
            "market": "CoinGecko ranks 251-1000 USD",
            "conversion": "canonical public ECB USD/EUR",
            "publication": "GitHub Actions static JSON",
            "schedule": "twice_hourly_offset",
        },
        "security": {
            "api_key_required": False,
            "browser_direct_market_fetch_required": False,
            "canonical_top250_mutation_allowed": False,
            "exchange_order_allowed": False,
            "wallet_action_allowed": False,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default="public/agent_crypto_erith_ia")
    parser.add_argument("--timeout", type=float, default=25.0)
    args = parser.parse_args()

    root = Path(args.root).resolve()
    data_root = root / "data" / "crypto"
    extended_path = data_root / "extended.json"
    status_path = data_root / "extended_status.json"
    started_at = iso()

    existing = read_json(extended_path)
    existing_valid = valid_existing(existing)
    session = build_session()

    try:
        fx = load_public_fx(root)
        rows = fetch_extended(session, args.timeout)
        latest = build_snapshot(rows, fx)
        atomic_write_json(extended_path, latest)
        atomic_write_json(
            status_path,
            status_payload(
                status="ready",
                started_at=started_at,
                latest=latest,
                error=None,
                preserved=False,
            ),
        )
        print(json.dumps({
            "status": "ready",
            "assets": latest["assets_count"],
            "range": f"{RANK_MIN}-{RANK_MAX}",
            "snapshot": latest["snapshot_id"],
        }, ensure_ascii=False))
        return 0
    except Exception as exc:
        error = f"{type(exc).__name__}: {exc}"
        preserved = existing if existing_valid else None
        atomic_write_json(
            status_path,
            status_payload(
                status="degraded" if preserved else "unavailable",
                started_at=started_at,
                latest=preserved,
                error=error,
                preserved=bool(preserved),
            ),
        )
        print(json.dumps({
            "status": "degraded" if preserved else "unavailable",
            "preserved": bool(preserved),
            "error": error,
        }, ensure_ascii=False))
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
