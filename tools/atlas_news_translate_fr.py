#!/usr/bin/env python3
"""Atlas News Sentinel — canonical French translation orchestrator.

Build 40.4.288. Source evidence is immutable; translation quality and display selection
are delegated to atlas_news_fr_contract.py. No browser repair layer exists here.
"""
from __future__ import annotations

import argparse
import importlib.metadata
import json
from pathlib import Path
from typing import Callable

from atlas_news_fr_contract import (
    BUILD, FALLBACK_ORIGINAL, ORIGINAL_FR, QUALITY_MIN, SCHEMA, STATUSES,
    TRANSLATED_OK, TRANSLATION_REJECTED, canonicalize_payload, clean, self_test as contract_self_test,
)

ROOT = Path("public/agent_crypto_erith_ia/data/news")
DEFAULT_LATEST = ROOT / "latest.json"
DEFAULT_STATUS = ROOT / "status.json"
ENGINE_PIN = "1.11.0"


def argos_translator() -> tuple[Callable[[str], str], str]:
    from argostranslate import package, translate

    def pair_ready() -> bool:
        languages = translate.get_installed_languages()
        source = next((language for language in languages if language.code == "en"), None)
        target = next((language for language in languages if language.code == "fr"), None)
        if not source or not target:
            return False
        try:
            source.get_translation(target)
            return True
        except Exception:
            return False

    if not pair_ready():
        package.update_package_index()
        choices = [item for item in package.get_available_packages() if item.from_code == "en" and item.to_code == "fr"]
        if not choices:
            raise RuntimeError("Argos en→fr package unavailable")
        selected = sorted(choices, key=lambda item: str(getattr(item, "package_version", "")), reverse=True)[0]
        package.install_from_path(selected.download())
        clear = getattr(translate.get_installed_languages, "cache_clear", None)
        if callable(clear):
            clear()
        if not pair_ready():
            raise RuntimeError("Argos en→fr package installation did not become available")

    version = importlib.metadata.version("argostranslate")
    return (lambda text: clean(translate.translate(clean(text), "en", "fr"))), version


def write_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def validate_canonical(payload: dict) -> tuple[bool, dict]:
    events = [event for event in payload.get("events", []) if isinstance(event, dict) and clean(event.get("headline"))]
    missing_display = [clean(event.get("event_id") or event.get("id") or "?") for event in events if not clean(event.get("display_headline"))]
    invalid_status = [clean(event.get("event_id") or event.get("id") or "?") for event in events if event.get("translation_status") not in STATUSES]
    low_accepted = [clean(event.get("event_id") or event.get("id") or "?") for event in events if event.get("translation_status") == TRANSLATED_OK and int(event.get("translation_quality_score") or 0) < QUALITY_MIN]
    unlabeled_fallback = [clean(event.get("event_id") or event.get("id") or "?") for event in events if event.get("translation_status") in {FALLBACK_ORIGINAL, TRANSLATION_REJECTED} and not clean(event.get("display_headline")).startswith("[EN] ")]
    wrong_display_language = [clean(event.get("event_id") or event.get("id") or "?") for event in events if (event.get("translation_status") in {ORIGINAL_FR, TRANSLATED_OK} and event.get("display_language") != "fr") or (event.get("translation_status") in {FALLBACK_ORIGINAL, TRANSLATION_REJECTED} and event.get("display_language") != "en")]
    original_mutation = [clean(event.get("event_id") or event.get("id") or "?") for event in events if clean(event.get("headline_original")) != clean(event.get("headline"))]
    bad_literal = [clean(event.get("event_id") or event.get("id") or "?") for event in events if "appuyez sur" in clean(event.get("display_headline")).lower()]
    ok = not any((missing_display, invalid_status, low_accepted, unlabeled_fallback, wrong_display_language, original_mutation, bad_literal))
    return ok, {
        "events": len(events), "missing_display": missing_display[:8], "invalid_status": invalid_status[:8],
        "low_accepted": low_accepted[:8], "unlabeled_fallback": unlabeled_fallback[:8],
        "wrong_display_language": wrong_display_language[:8],
        "original_mutation": original_mutation[:8], "bad_literal": bad_literal[:8],
    }


def self_test() -> int:
    contract_self_test()
    print("ATLAS_NEWS_TRANSLATE_FR 40.4.288 SELF-TEST PASS")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--latest", type=Path, default=DEFAULT_LATEST)
    parser.add_argument("--status", type=Path, default=DEFAULT_STATUS)
    parser.add_argument("--require-canonical", action="store_true", help="Require canonical display coverage and quality-gate truth; rejected MT may fall back to labelled original English.")
    args = parser.parse_args()
    if args.self_test:
        return self_test()

    payload = json.loads(args.latest.read_text(encoding="utf-8"))
    translator = None
    engine_version = None
    engine_error = None
    try:
        translator, engine_version = argos_translator()
    except Exception as exc:
        engine_error = clean(exc)[:220]

    translated, summary = canonicalize_payload(payload, translator, engine_version)
    if engine_error:
        summary["engine_status"] = "unavailable"
        summary["engine_error"] = engine_error
    else:
        summary["engine_status"] = "ok"
    translated["translation_fr"] = summary
    write_json(args.latest, translated)

    if args.status.exists():
        try:
            status = json.loads(args.status.read_text(encoding="utf-8"))
            if isinstance(status, dict):
                status["translation_fr"] = summary
                write_json(args.status, status)
        except Exception:
            pass

    ok, validation = validate_canonical(translated)
    print(json.dumps({"summary": summary, "validation": validation}, ensure_ascii=False, sort_keys=True))
    if args.require_canonical and not ok:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
