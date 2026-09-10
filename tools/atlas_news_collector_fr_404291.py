#!/usr/bin/env python3
"""Agent-Crypto News Sentinel — French-first source routing wrapper.

Build 40.4.291

This wrapper keeps the canonical 40.3.89 collector as the raw evidence engine,
but replaces the three Google News discovery lanes with France/French queries.
English primary/crypto sources remain archive evidence. No translation service,
API key, secret, browser crawler or financial execution is introduced.
"""
from __future__ import annotations

import argparse
import importlib.util
import sys
import urllib.parse
from pathlib import Path
from typing import Any

BUILD = "40.4.291"
VERSION = "V1.1-alpha.26.47.6"
SCHEMA = "atlas_news_french_first_source_routing_v1"
HERE = Path(__file__).resolve().parent
BASE_PATH = HERE / "atlas_news_collector.py"


def load_base():
    spec = importlib.util.spec_from_file_location("atlas_news_collector_base_404291", BASE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load canonical atlas_news_collector.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


base = load_base()
Source = base.Source


def google_news_fr_rss(query: str) -> str:
    return (
        "https://news.google.com/rss/search?q="
        + urllib.parse.quote_plus(query)
        + "&hl=fr&gl=FR&ceid=FR:fr"
    )


FR_DISCOVERY_SOURCES = (
    Source(
        "google_news_etf_flows",
        "Google News FR · ETF / flux institutionnels",
        google_news_fr_rss("bitcoin ethereum ETF flux entrants sorties institutionnels when:7d"),
        "finance",
        "fr",
        58,
    ),
    Source(
        "google_news_macro_liquidity",
        "Google News FR · macro / liquidité",
        google_news_fr_rss("bitcoin crypto liquidité taux Fed BCE obligations rendements when:7d"),
        "finance",
        "fr",
        58,
    ),
    Source(
        "google_news_crypto_regulation",
        "Google News FR · réglementation crypto",
        google_news_fr_rss("bitcoin crypto réglementation MiCA SEC CFTC stablecoin marchés when:7d"),
        "finance",
        "fr",
        58,
    ),
)

LEGACY_DISCOVERY_IDS = {s.id for s in FR_DISCOVERY_SOURCES}
SOURCES = tuple(s for s in base.SOURCES if s.id not in LEGACY_DISCOVERY_IDS) + FR_DISCOVERY_SOURCES
SOURCE_LANGUAGE = {s.id: s.language for s in SOURCES}
SOURCE_LOCALE = {s.id: ("fr-FR" if s.id in LEGACY_DISCOVERY_IDS or s.id == "france24_fr" else "source-native") for s in SOURCES}

# The base collector remains the implementation owner; this wrapper changes only source routing
# and stamps the raw collection with the current source-routing build.
base.SOURCES = SOURCES
base.BUILD = BUILD
base.VERSION = VERSION
_base_analyze_item = base.analyze_item


def analyze_item_with_source_language(item: dict[str, Any]):
    event = _base_analyze_item(item)
    if not event:
        return event
    source_id = str(item.get("source_id") or "")
    event["source_language"] = SOURCE_LANGUAGE.get(source_id, "unknown")
    event["source_discovery_locale"] = SOURCE_LOCALE.get(source_id, "source-native")
    event["source_routing_build"] = BUILD
    event["source_routing_schema"] = SCHEMA
    return event


base.analyze_item = analyze_item_with_source_language


def self_test() -> int:
    assert len(SOURCES) == 15
    ids = {s.id for s in SOURCES}
    assert LEGACY_DISCOVERY_IDS.issubset(ids)
    for source in FR_DISCOVERY_SOURCES:
        assert source.language == "fr"
        assert "hl=fr" in source.url and "gl=FR" in source.url and "ceid=FR:fr" in source.url
        assert "en-US" not in source.url
    assert not any(
        s.id in LEGACY_DISCOVERY_IDS and ("hl=en-US" in s.url or "ceid=US:en" in s.url)
        for s in SOURCES
    )
    sample = {
        "source_group": "finance",
        "source_trust": 76,
        "source_id": "google_news_etf_flows",
        "source_name": "Google News FR · ETF / flux institutionnels",
        "headline": "Les ETF Bitcoin enregistrent de nouvelles entrées institutionnelles",
        "summary": "Les flux vers les fonds crypto restent surveillés.",
        "published_at": base.utc_now().isoformat(),
        "url": "https://example.fr/article",
    }
    event = analyze_item_with_source_language(sample)
    assert event is not None
    assert event["source_language"] == "fr"
    assert event["source_discovery_locale"] == "fr-FR"
    assert event["source_routing_build"] == BUILD
    print("NEWS FRENCH-FIRST SOURCE ROUTING 40.4.291 self-test: OK")
    return 0


def collect() -> int:
    return base.collect()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    return self_test() if args.self_test else collect()


if __name__ == "__main__":
    raise SystemExit(main())
