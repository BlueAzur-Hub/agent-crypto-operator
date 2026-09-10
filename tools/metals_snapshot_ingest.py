#!/usr/bin/env python3
"""Validate and publish a provider-neutral Metals snapshot into Agent-Crypto.

This tool never fetches a provider and never accepts secrets. It converts a
local, already-received JSON payload into the public archive contract used by
the Metals Market and Graph reader.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from typing import Any

EXPECTED_ASSETS = {
    "gold": "XAU",
    "silver": "XAG",
    "platinum": "XPT",
    "palladium": "XPD",
    "copper": "HG",
}
ACCEPTED_STATES = {
    "data_current",
    "data_delayed",
    "data_historical",
    "date_unqualified",
    "licence_to_verify",
}
FORBIDDEN_KEY_RE = re.compile(
    r"(?:api[_-]?key|secret|token|authorization|password|passwd|bearer|credential)",
    re.I,
)


class ImportErrorSafe(ValueError):
    pass


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def iso(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ImportErrorSafe(f"{field} absent")
    try:
        parsed = dt.datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    except ValueError as exc:
        raise ImportErrorSafe(f"{field} invalide: {value!r}") from exc
    if parsed.tzinfo is None:
        raise ImportErrorSafe(f"{field} doit contenir un fuseau horaire")
    return parsed.astimezone(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def ensure_no_secrets(value: Any, path: str = "$.") -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            if FORBIDDEN_KEY_RE.search(str(key)):
                raise ImportErrorSafe(f"champ secret interdit dans l'import: {path}{key}")
            ensure_no_secrets(child, f"{path}{key}.")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            ensure_no_secrets(child, f"{path}[{index}].")


def finite_positive(value: Any, field: str) -> float:
    if isinstance(value, bool):
        raise ImportErrorSafe(f"{field} invalide")
    try:
        number = float(value)
    except (TypeError, ValueError) as exc:
        raise ImportErrorSafe(f"{field} doit être numérique") from exc
    if not (number > 0 and number < float("inf")):
        raise ImportErrorSafe(f"{field} doit être strictement positif et fini")
    return number


def finite_nullable(value: Any, field: str) -> float | None:
    if value is None:
        return None
    if isinstance(value, bool):
        raise ImportErrorSafe(f"{field} invalide")
    try:
        number = float(value)
    except (TypeError, ValueError) as exc:
        raise ImportErrorSafe(f"{field} doit être numérique ou null") from exc
    if not (number == number and abs(number) < float("inf")):
        raise ImportErrorSafe(f"{field} doit être fini")
    return number


def nonempty(value: Any, field: str) -> str:
    text = str(value or "").strip()
    if not text:
        raise ImportErrorSafe(f"{field} absent")
    return text


def canonical_quote(raw: dict[str, Any], received_at: str) -> dict[str, Any]:
    asset_id = nonempty(raw.get("asset_id"), "quote.asset_id")
    if asset_id not in EXPECTED_ASSETS:
        raise ImportErrorSafe(f"actif Métaux inconnu: {asset_id}")
    symbol = nonempty(raw.get("symbol"), f"{asset_id}.symbol").upper()
    if symbol != EXPECTED_ASSETS[asset_id]:
        raise ImportErrorSafe(f"symbole incohérent pour {asset_id}: {symbol}")
    data_state = nonempty(raw.get("data_state"), f"{asset_id}.data_state")
    if data_state not in ACCEPTED_STATES:
        raise ImportErrorSafe(f"état de donnée non accepté pour {asset_id}: {data_state}")

    quote_received_at = iso(raw.get("received_at") or received_at, f"{asset_id}.received_at")
    source_time = iso(raw.get("source_time"), f"{asset_id}.source_time")
    price = finite_positive(raw.get("price"), f"{asset_id}.price")

    return {
        "domain": "metals",
        "asset_id": asset_id,
        "symbol": symbol,
        "source_id": nonempty(raw.get("source_id"), f"{asset_id}.source_id"),
        "source_name": nonempty(raw.get("source_name"), f"{asset_id}.source_name"),
        "instrument_type": nonempty(raw.get("instrument_type"), f"{asset_id}.instrument_type"),
        "currency": nonempty(raw.get("currency"), f"{asset_id}.currency").upper(),
        "unit": nonempty(raw.get("unit"), f"{asset_id}.unit"),
        "price": price,
        "bid": finite_nullable(raw.get("bid"), f"{asset_id}.bid"),
        "ask": finite_nullable(raw.get("ask"), f"{asset_id}.ask"),
        "change": finite_nullable(raw.get("change"), f"{asset_id}.change"),
        "change_percent": finite_nullable(raw.get("change_percent"), f"{asset_id}.change_percent"),
        "source_time": source_time,
        "received_at": quote_received_at,
        "data_state": data_state,
        "delay_seconds": finite_nullable(raw.get("delay_seconds"), f"{asset_id}.delay_seconds"),
        "licence_state": nonempty(raw.get("licence_state", "verified_for_project"), f"{asset_id}.licence_state"),
        "provenance_note": str(raw.get("provenance_note") or "").strip() or None,
    }


def canonical_snapshot(payload: dict[str, Any], allow_partial: bool) -> dict[str, Any]:
    if payload.get("schema") != "agent_crypto_metals_import_v1":
        raise ImportErrorSafe("schéma d'import incompatible")
    ensure_no_secrets(payload)

    provider = payload.get("provider")
    if not isinstance(provider, dict):
        raise ImportErrorSafe("bloc provider absent")
    provider_id = nonempty(provider.get("id"), "provider.id")
    provider_name = nonempty(provider.get("name"), "provider.name")
    source_mode = nonempty(provider.get("source_mode", "provider_snapshot"), "provider.source_mode")
    received_at = iso(payload.get("received_at") or utc_now(), "received_at")

    raw_quotes = payload.get("quotes")
    if not isinstance(raw_quotes, list) or not raw_quotes:
        raise ImportErrorSafe("aucune cotation à importer")
    quotes = [canonical_quote(item, received_at) for item in raw_quotes if isinstance(item, dict)]
    if len(quotes) != len(raw_quotes):
        raise ImportErrorSafe("une cotation n'est pas un objet JSON")
    ids = [quote["asset_id"] for quote in quotes]
    if len(ids) != len(set(ids)):
        raise ImportErrorSafe("doublon d'actif dans l'import")
    missing = sorted(set(EXPECTED_ASSETS) - set(ids))
    if missing and not allow_partial:
        raise ImportErrorSafe("panier incomplet; actifs absents: " + ", ".join(missing))

    quotes.sort(key=lambda item: list(EXPECTED_ASSETS).index(item["asset_id"]))
    hash_payload = json.dumps({"received_at": received_at, "quotes": quotes}, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    digest = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()
    stamp = received_at.replace("-", "").replace(":", "").replace("Z", "Z")
    snapshot_id = f"metals-{stamp}-{digest[:12]}"
    states = {quote["data_state"] for quote in quotes}
    state = next(iter(states)) if len(states) == 1 else "mixed_qualified"

    return {
        "schema": "agent_crypto_metals_snapshot_v1",
        "version": "1.1.0",
        "snapshot_id": snapshot_id,
        "saved_at": received_at,
        "source_mode": source_mode,
        "provider_id": provider_id,
        "provider_name": provider_name,
        "assets_expected": list(EXPECTED_ASSETS),
        "assets_count": len(quotes),
        "quote_currencies": sorted({quote["currency"] for quote in quotes}),
        "quotes": quotes,
        "state": state,
        "integrity": {
            "quotes_connected": True,
            "no_invented_values": True,
            "crypto_data_reuse_forbidden": True,
            "source_timestamp_required": True,
            "received_timestamp_required": True,
            "currency_required_for_numeric_price": True,
            "unit_required_for_numeric_price": True,
            "single_snapshot_must_not_draw_chart": True,
        },
    }


def read_json(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ImportErrorSafe(f"fichier absent: {path}") from exc
    except json.JSONDecodeError as exc:
        raise ImportErrorSafe(f"JSON invalide: {path}: {exc}") from exc
    if not isinstance(data, dict):
        raise ImportErrorSafe(f"objet JSON attendu: {path}")
    return data


def write_atomic(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=str(path.parent), text=True)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_name, path)
    finally:
        if os.path.exists(temp_name):
            os.unlink(temp_name)


def json_text(payload: Any, compact: bool = False) -> str:
    if compact:
        return json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
    return json.dumps(payload, ensure_ascii=False, indent=2) + "\n"


def rebuild_history_index(history_dir: Path, updated_at: str) -> dict[str, Any]:
    entries: list[dict[str, Any]] = []
    total = 0
    all_times: list[str] = []
    for path in sorted(history_dir.glob("????-??-??.jsonl")):
        snapshots = []
        for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if not line.strip():
                continue
            try:
                item = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ImportErrorSafe(f"historique invalide {path.name}:{line_no}") from exc
            if item.get("schema") != "agent_crypto_metals_snapshot_v1":
                raise ImportErrorSafe(f"schéma historique invalide {path.name}:{line_no}")
            snapshots.append(item)
        if not snapshots:
            continue
        times = [iso(item.get("saved_at"), f"{path.name}.saved_at") for item in snapshots]
        total += len(snapshots)
        all_times.extend(times)
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        entries.append({
            "date": path.stem,
            "path": path.name,
            "snapshots": len(snapshots),
            "oldest_at": min(times),
            "newest_at": max(times),
            "sha256": digest,
        })
    return {
        "schema": "agent_crypto_metals_history_index_v1",
        "version": "1.1.0",
        "directory": "data/metals/history",
        "entries": entries,
        "files": len(entries),
        "snapshots": total,
        "oldest_at": min(all_times) if all_times else None,
        "newest_at": max(all_times) if all_times else None,
        "updated_at": updated_at,
        "integrity": {
            "fabricated_points_forbidden": True,
            "crypto_history_reuse_forbidden": True,
            "source_time_preserved": True,
        },
    }


def update_status(path: Path, snapshot: dict[str, Any], history_index: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    current = read_json(path)
    provider = payload["provider"]
    quota = provider.get("quota") if isinstance(provider.get("quota"), dict) else {}
    current.update({
        "version": "1.1.0",
        "status": "ready" if snapshot["assets_count"] == len(EXPECTED_ASSETS) else "partial",
        "provider_id": snapshot["provider_id"],
        "provider_name": snapshot["provider_name"],
        "last_attempt_at": snapshot["saved_at"],
        "last_success_at": snapshot["saved_at"],
        "last_error": None,
        "assets_received": snapshot["assets_count"],
        "quota": {
            "plan": quota.get("plan"),
            "limit": quota.get("limit"),
            "remaining": quota.get("remaining"),
            "period": quota.get("period"),
            "reset_at": quota.get("reset_at"),
        },
        "history": {
            "directory": "history/",
            "index": "history/index.json",
            "files": history_index["files"],
            "snapshots": history_index["snapshots"],
            "oldest_at": history_index["oldest_at"],
            "newest_at": history_index["newest_at"],
        },
        "updated_at": snapshot["saved_at"],
    })
    current.setdefault("security", {})["api_key_present_in_public_files"] = False
    return current


def publish(root: Path, input_path: Path, allow_partial: bool, dry_run: bool) -> dict[str, Any]:
    payload = read_json(input_path)
    snapshot = canonical_snapshot(payload, allow_partial=allow_partial)
    metals_dir = root / "data" / "metals"
    history_dir = metals_dir / "history"
    latest_path = metals_dir / "latest.json"
    status_path = metals_dir / "status.json"
    index_path = history_dir / "index.json"
    history_path = history_dir / f"{snapshot['saved_at'][:10]}.jsonl"

    existing_ids = set()
    existing_lines: list[str] = []
    if history_path.exists():
        for line in history_path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            item = json.loads(line)
            existing_ids.add(item.get("snapshot_id"))
            existing_lines.append(json.dumps(item, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
    if snapshot["snapshot_id"] not in existing_ids:
        existing_lines.append(json.dumps(snapshot, ensure_ascii=False, sort_keys=True, separators=(",", ":")))

    if dry_run:
        return {"snapshot": snapshot, "history_path": str(history_path), "written": False}

    write_atomic(latest_path, json_text(snapshot))
    write_atomic(history_path, "\n".join(existing_lines) + "\n")
    history_index = rebuild_history_index(history_dir, snapshot["saved_at"])
    write_atomic(index_path, json_text(history_index))
    status = update_status(status_path, snapshot, history_index, payload)
    write_atomic(status_path, json_text(status))
    return {
        "snapshot": snapshot,
        "history_path": str(history_path),
        "history_index": history_index,
        "status": status,
        "written": True,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Publier un snapshot Métaux canonique dans Agent-Crypto.")
    parser.add_argument("--input", required=True, type=Path, help="JSON local déjà obtenu depuis une source réelle")
    parser.add_argument("--root", required=True, type=Path, help="Racine public/agent_crypto_erith_ia")
    parser.add_argument("--allow-partial", action="store_true", help="Autoriser moins de 5 métaux")
    parser.add_argument("--dry-run", action="store_true", help="Valider sans écrire")
    args = parser.parse_args(argv)
    try:
        result = publish(args.root.resolve(), args.input.resolve(), args.allow_partial, args.dry_run)
    except (ImportErrorSafe, OSError, json.JSONDecodeError) as exc:
        print(f"ERREUR: {exc}", file=sys.stderr)
        return 2
    snapshot = result["snapshot"]
    action = "VALIDÉ" if args.dry_run else "PUBLIÉ"
    print(f"{action}: {snapshot['snapshot_id']} · {snapshot['assets_count']}/5 actifs · {snapshot['provider_name']}")
    if not args.dry_run:
        print(f"Historique: {result['history_path']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
