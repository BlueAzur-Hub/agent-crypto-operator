#!/usr/bin/env python3
"""Agent-Crypto News Sentinel — native-French display contract.

Build 40.4.291

No machine translation is performed. French-native evidence is allowed into the
operator display lane unchanged. Non-French evidence remains available in the
archive as an explicit [EN] fallback. The original source headline is immutable.
"""
from __future__ import annotations

import argparse
import copy
import json
import re
from pathlib import Path
from typing import Any

BUILD = "40.4.291"
SCHEMA = "atlas_news_native_fr_v1"
ROOT = Path("public/agent_crypto_erith_ia/data/news")

FRENCH_MARKERS = {
    "le", "la", "les", "un", "une", "des", "du", "de", "dans", "avec", "pour", "sur", "après",
    "avant", "selon", "contre", "est", "sont", "et", "aux", "au", "par", "en", "alors", "tandis",
    "marché", "marchés", "hausse", "baisse", "fonds", "taux", "banque", "réglementation", "liquidité",
    "entrées", "sorties", "investisseurs", "institutionnels", "régulation", "régulateurs", "obligations",
}
FRENCH_STRONG = {
    "enregistre", "enregistrent", "progresse", "progressent", "recule", "reculent", "annonce", "annoncent",
    "frappe", "frappé", "frappés", "chute", "bondit", "dépasse", "atteint", "propose", "adopte", "rejette",
    "piratage", "liquidations", "régulateur", "réglementation", "rendements", "emplois", "inflation",
}


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def looks_french(text: str) -> bool:
    value = clean(text).lower()
    if not value:
        return False
    if re.search(r"[àâçéèêëîïôùûüÿœæ]", value):
        return True
    tokens = re.findall(r"[a-zA-ZÀ-ÿ’']+", value)
    token_set = set(tokens)
    if token_set & FRENCH_STRONG:
        return True
    return len(token_set & FRENCH_MARKERS) >= 3


def event_is_native_french(event: dict[str, Any], original: str) -> bool:
    declared = clean(event.get("source_language")).lower()
    source_name = clean(event.get("source_name")).lower()
    source_url = clean(event.get("source_url")).lower()
    if declared == "fr" and looks_french(original):
        return True
    if ("france 24" in source_name or "france24.com/fr" in source_url) and looks_french(original):
        return True
    if "google news fr" in source_name and looks_french(original):
        return True
    return looks_french(original)


def apply_event(event_value: Any) -> dict[str, Any]:
    event = copy.deepcopy(event_value) if isinstance(event_value, dict) else {}
    original = clean(event.get("headline_original") or event.get("headline") or event.get("event_label"))
    event["headline_original"] = original
    event["language_original"] = "fr" if event_is_native_french(event, original) else clean(event.get("source_language") or "en") or "en"
    event["translation_contract_build"] = BUILD
    event["translation_contract_schema"] = SCHEMA
    event["native_fr_contract_build"] = BUILD
    event["native_fr_contract_schema"] = SCHEMA
    event["browser_translation"] = False
    event["machine_translation"] = False

    if event_is_native_french(event, original):
        event["headline_fr"] = original
        event["translation_engine"] = "native-fr-source"
        event["translation_quality_score"] = 100
        event["translation_quality_flags"] = []
        event["translation_status"] = "ORIGINAL_FR"
        event["display_headline"] = original
        event["display_language"] = "fr"
        event["headline_fr_display"] = original
        event["headline_fr_display_status"] = "native_fr"
        event["headline_fr_status"] = "original_fr"
        event["headline_fr_engine"] = "native-fr-source"
        event["headline_fr_quality_score"] = 100
        event["headline_fr_quality_status"] = "native"
        event["headline_fr_quality_reasons"] = []
    else:
        event["headline_fr"] = None
        event["translation_engine"] = "none-native-first"
        event["translation_quality_score"] = 0
        event["translation_quality_flags"] = ["source_not_native_french"]
        event["translation_status"] = "FALLBACK_ORIGINAL"
        event["display_headline"] = f"[EN] {original}" if original else "[EN] Événement sans titre"
        event["display_language"] = "en"
        event["headline_fr_display"] = None
        event["headline_fr_display_status"] = "not_native_fr"
        event["headline_fr_status"] = "not_translated"
        event["headline_fr_engine"] = "none-native-first"
        event["headline_fr_quality_score"] = 0
        event["headline_fr_quality_status"] = "archive_only"
        event["headline_fr_quality_reasons"] = ["source_not_native_french"]
    return event


def transform(payload_value: Any) -> dict[str, Any]:
    payload = copy.deepcopy(payload_value) if isinstance(payload_value, dict) else {}
    raw_events = payload.get("events") if isinstance(payload.get("events"), list) else []
    events = [apply_event(event) for event in raw_events]
    fr_events = [event for event in events if event.get("display_language") == "fr" and event.get("translation_status") == "ORIGINAL_FR"]
    en_events = [event for event in events if event.get("display_language") == "en"]
    payload["events"] = events
    payload["translation_fr"] = {
        "build": BUILD,
        "schema": SCHEMA,
        "mode": "native_french_first",
        "machine_translation": False,
        "translation_provider": None,
        "api_key_required": False,
        "secret_required": False,
        "paid_service": False,
        "total_events": len(events),
        "accepted_french": len(fr_events),
        "archive_english": len(en_events),
        "display_coverage": len(events),
        "operator_lane_rule": "native French only; English preserved as archive evidence",
    }
    payload["native_fr"] = dict(payload["translation_fr"])
    payload["news_display_contract"] = {
        "build": BUILD,
        "schema": SCHEMA,
        "preferred_field": "display_headline",
        "operator_language": "fr",
        "english_policy": "archive_only",
        "machine_translation": False,
    }
    return payload


def build_file(require_native_fr: bool = False) -> int:
    path = ROOT / "latest.json"
    payload = json.loads(path.read_text(encoding="utf-8"))
    transformed = transform(payload)
    path.write_text(json.dumps(transformed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    summary = transformed["translation_fr"]
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if require_native_fr and int(summary.get("accepted_french") or 0) <= 0:
        # Do not invent a translation. The archive remains valid; the operator lane may be empty.
        print("WARNING: no native-French event available in this cycle; English evidence kept archive-only.")
    return 0


def self_test() -> int:
    sample = {
        "events": [
            {
                "event_id": "fr-1",
                "headline": "Les ETF Bitcoin enregistrent de nouvelles entrées institutionnelles",
                "source_name": "Google News FR · ETF / flux institutionnels",
                "source_language": "fr",
            },
            {
                "event_id": "en-1",
                "headline": "XRP ETFs Extend Inflow Streak to 9 Days",
                "source_name": "Decrypt",
                "source_language": "en",
            },
        ]
    }
    out = transform(sample)
    fr, en = out["events"]
    assert fr["translation_status"] == "ORIGINAL_FR" and fr["display_language"] == "fr"
    assert fr["display_headline"] == fr["headline_original"]
    assert en["translation_status"] == "FALLBACK_ORIGINAL" and en["display_language"] == "en"
    assert en["display_headline"].startswith("[EN] ")
    assert out["translation_fr"]["machine_translation"] is False
    assert out["translation_fr"]["secret_required"] is False
    assert not any("argos" in clean(event.get("translation_engine")).lower() for event in out["events"])
    print("NEWS NATIVE FR CONTRACT 40.4.291 self-test: OK")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--require-native-fr", action="store_true")
    args = parser.parse_args()
    return self_test() if args.self_test else build_file(require_native_fr=args.require_native_fr)


if __name__ == "__main__":
    raise SystemExit(main())
