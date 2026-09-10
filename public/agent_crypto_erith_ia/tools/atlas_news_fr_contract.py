#!/usr/bin/env python3
"""Atlas News Sentinel — canonical French headline contract.

Build 40.4.288 — News FR End-to-End Display Truth Lock.

This module is deliberately pure: no network, no filesystem writes, no browser repair.
The collector owns source evidence; this contract owns translation state and display truth.
"""
from __future__ import annotations

import copy
import re
from typing import Any, Callable

BUILD = "40.4.288"
SCHEMA = "atlas_news_translation_fr_v4"
QUALITY_MIN = 82
ENGINE_TAG = "argos-translate+atlas-news-fr-contract-v4"
STRUCTURAL_ENGINE = "atlas-news-fr-structural-v4"

ORIGINAL_FR = "ORIGINAL_FR"
TRANSLATED_OK = "TRANSLATED_OK"
FALLBACK_ORIGINAL = "FALLBACK_ORIGINAL"
TRANSLATION_REJECTED = "TRANSLATION_REJECTED"
STATUSES = {ORIGINAL_FR, TRANSLATED_OK, FALLBACK_ORIGINAL, TRANSLATION_REJECTED}

ASSET_ALIASES = {
    "BTC": ("Bitcoin", "BTC"), "ETH": ("Ethereum", "Ether", "ETH"),
    "SOL": ("Solana", "SOL"), "XRP": ("XRP", "Ripple"),
    "BNB": ("BNB", "Binance Coin"), "USDT": ("USDT", "Tether"),
    "USDC": ("USDC", "USD Coin"), "ADA": ("ADA", "Cardano"),
    "DOGE": ("DOGE", "Dogecoin"), "AVAX": ("AVAX", "Avalanche"),
    "LINK": ("LINK", "Chainlink"), "SUI": ("SUI",), "UNI": ("UNI", "Uniswap"),
    "AAVE": ("Aave", "AAVE"), "XMR": ("XMR", "Monero"),
}

PROTECTED_IDENTITIES = (
    "Term Finance", "The Sandbox", "Hugging Face", "OpenAI", "OneKey", "Coldcard",
    "CoinDesk", "Cointelegraph", "CryptoRank", "BlackRock", "Fidelity", "Galaxy", "Ledger",
    "Bitcoin", "Ethereum", "Ether", "Solana", "Binance", "Coinbase", "Kraken", "Uniswap",
    "Aave", "Ripple", "Tether", "DeFi", "Web3", "ETF", "ETFs", "SEC", "CFTC", "Fed", "ECB",
    "BTC", "ETH", "BNB", "XRP", "SOL", "USDT", "USDC", "DOGE", "ADA", "AVAX", "LINK", "SUI",
)

ENGLISH_RESIDUE = {
    # High-confidence English residue. Proper nouns/tickers/crypto terms are intentionally absent.
    "after", "before", "with", "without", "from", "into", "amid", "while", "only", "worth",
    "week", "month", "morning", "report", "finds", "says", "said", "loses", "lost", "gains",
    "grew", "added", "sessions", "straight", "days", "inflow", "inflows", "outflow", "outflows",
    "focus", "hit", "hits", "wave", "joins", "main", "news", "hacked", "hack", "attackers",
    "buys", "voting", "power", "stalls", "pledges", "vulnerable", "reimbursement", "bridge",
    "teams", "launch", "fixed", "income", "fund", "lending", "app", "attacker", "proposes",
    "new", "assets", "live", "updates", "climb", "climbs", "rise", "rises", "stocks", "slip",
    "halts", "entire", "agents", "tactics", "breach", "customers", "exposed", "widens",
    "users", "getting", "flooded", "password", "reset", "emails", "nobody", "requested",
    "network", "used", "exchanges", "claim", "good", "guys", "swaps", "stolen", "drained",
    "reserve", "wiped", "shorts", "another", "tokenized", "governance", "overhaul",
}

ABSURD_PATTERNS = (
    r"\bappuyez sur\b",
    r"\bcrypto liquidation wave\b",
    r"\bliquidation wave\b",
    r"\betf inflow streak\b",
    r"\bstraight days?\b",
    r"\bminist[eè]re des finances [aà] terme\b",
    r"\bcrypto r[oô]de\b",
    r"\bs['’]est [eé]cras[eé] un jeton\b",
)

FRENCH_MARKERS = {
    "le", "la", "les", "un", "une", "des", "du", "de", "dans", "avec", "pour", "sur", "après",
    "avant", "selon", "contre", "est", "sont", "et", "aux", "au", "par", "en", "alors", "tandis",
    "frappé", "frappés", "frappée", "frappées", "vague", "entrées", "sorties", "hausse", "baisse",
}

FRENCH_STRONG = {
    "atteint", "dépasse", "progresse", "recule", "enregistre", "gagne", "perd", "chute", "bondit",
    "frappe", "frappé", "frappés", "liquidations", "entrées", "sorties", "rendements", "marché", "fonds",
    "taux", "annonce", "attaque", "piratage", "régulateur", "réglementation", "hausse", "baisse", "apports",
}


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def source_is_french(event: dict[str, Any], original: str) -> bool:
    source_name = clean(event.get("source_name")).lower()
    source_url = clean(event.get("source_url")).lower()
    if source_name in {"france 24", "france24"} or "france24.com/fr" in source_url:
        return True
    return text_looks_french(original)


def text_looks_french(text: str) -> bool:
    value = clean(text).lower()
    if not value:
        return False
    if re.search(r"[àâçéèêëîïôùûüÿœæ]", value):
        return True
    tokens = set(re.findall(r"[a-zA-ZÀ-ÿ’']+", value))
    return bool(tokens & FRENCH_STRONG) or len(tokens & FRENCH_MARKERS) >= 3


def original_language(event: dict[str, Any], original: str) -> str:
    return "fr" if source_is_french(event, original) else "en"


def format_money_fr(value: str) -> str:
    text = clean(value)
    m = re.fullmatch(r"\$\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(BILLION|MILLION|BN|B|M|K)?", text, flags=re.I)
    if not m:
        return text
    number = m.group(1).replace(",", "")
    if "." in number:
        number = number.rstrip("0").rstrip(".").replace(".", ",")
    unit = (m.group(2) or "").upper()
    suffix = " Md$" if unit in {"BILLION", "BN", "B"} else " M$" if unit in {"MILLION", "M"} else " k$" if unit == "K" else " $"
    return f"{number}{suffix}"


def french_subjects(value: str) -> tuple[str, bool]:
    parts = [clean(p) for p in re.split(r"\s*,\s*|\s+and\s+", clean(value), flags=re.I) if clean(p)]
    if len(parts) <= 1:
        return clean(value), False
    return ", ".join(parts[:-1]) + " et " + parts[-1], True


def split_source_suffix(text: str) -> tuple[str, str]:
    m = re.match(r"^(.*?)(\s+-\s+[^-]{2,80})$", clean(text))
    return (clean(m.group(1)), clean(m.group(2))) if m else (clean(text), "")


def structural_french(original_value: Any) -> str:
    """Translate only reusable high-confidence headline grammars, never exact stories."""
    original = clean(original_value)
    body, suffix = split_source_suffix(original)

    m = re.fullmatch(
        r"(?P<subjects>.+?)\s+Hit by\s+(?P<amount>\$\s*[0-9][0-9,]*(?:\.[0-9]+)?\s*(?:Billion|Million|BN|B|M|K)?)\s+Crypto Liquidation Wave",
        body, flags=re.I,
    )
    if m:
        subjects, plural = french_subjects(m.group("subjects"))
        amount = format_money_fr(m.group("amount"))
        participle = "frappés" if plural else "frappé"
        return clean(f"{subjects} {participle} par une vague de liquidations crypto de {amount} {suffix}")

    m = re.fullmatch(
        r"(?P<subjects>.+?)\s+(?:Hit|Hits) by\s+(?P<amount>\$\s*[0-9][0-9,]*(?:\.[0-9]+)?\s*(?:Billion|Million|BN|B|M|K)?)\s+(?P<kind>Liquidation Wave)",
        body, flags=re.I,
    )
    if m:
        subjects, plural = french_subjects(m.group("subjects"))
        participle = "frappés" if plural else "frappé"
        return clean(f"{subjects} {participle} par une vague de liquidations de {format_money_fr(m.group('amount'))} {suffix}")

    return ""


def normalize_english_context(original_value: Any) -> str:
    """Expand terse financial idioms before MT; canonical evidence remains untouched."""
    text = clean(original_value)
    rules = (
        (r"\bHit by (\$[\d.,]+\s*(?:Billion|Million|BN|B|M|K)?) Crypto Liquidation Wave\b", r"are affected by a crypto liquidation wave worth \1"),
        (r"\bpledges 1:1 repayment\b", "promises full reimbursement"),
        (r"\bbridge exploit\b", "attack against a blockchain bridge"),
        (r"\bvault governance exploit\b", "attack exploiting vault governance"),
        (r"\binflow streak\b", "series of consecutive inflows"),
        (r"\bstreak snaps\b", "series of inflows ends"),
        (r"\bLog Sixth Straight Day of Combined Net Inflows\b", "record a sixth consecutive day of combined net inflows"),
        (r"\bin Focus\b", "to watch"),
    )
    for pattern, replacement in rules:
        text = re.sub(pattern, replacement, text, flags=re.I)
    return clean(text)


def protected_terms(event: dict[str, Any], original: str) -> list[str]:
    terms: list[str] = []
    for term in PROTECTED_IDENTITIES:
        if re.search(rf"(?<!\w){re.escape(term)}(?!\w)", original, flags=re.I):
            terms.append(term)
    for symbol in event.get("assets") or []:
        symbol = clean(symbol).upper()
        for alias in ASSET_ALIASES.get(symbol, (symbol,)):
            if re.search(rf"(?<!\w){re.escape(alias)}(?!\w)", original, flags=re.I):
                terms.append(alias)
    return sorted(set(terms), key=len, reverse=True)


def protect_for_mt(text: str, terms: list[str]) -> tuple[str, dict[str, str]]:
    output = text
    mapping: dict[str, str] = {}
    for term in terms:
        pattern = re.compile(rf"(?<!\w){re.escape(term)}(?!\w)", flags=re.I)
        match = pattern.search(output)
        if not match:
            continue
        token = f"ZXQENTITY{len(mapping):02d}QXZ"
        canonical = match.group(0)
        output = pattern.sub(token, output)
        mapping[token] = canonical
    return output, mapping


def restore_after_mt(text: str, mapping: dict[str, str]) -> str:
    output = clean(text)
    for token, term in mapping.items():
        output = re.sub(re.escape(token), term, output, flags=re.I)
        output = output.replace(" ".join(token), term)
    return clean(output)


def french_typography(text: str) -> str:
    value = clean(text)
    value = re.sub(r"\$\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(Billion|Million|BN|B|M|K)\b",
                   lambda m: format_money_fr(m.group(0)), value, flags=re.I)
    value = re.sub(r"([0-9]+(?:[.,][0-9]+)?)\s*%", lambda m: f"{m.group(1).replace('.', ',')} %", value)
    value = re.sub(r"\s+([,.;!?])", r"\1", value)
    value = re.sub(r"\s*:\s*", " : ", value)
    value = re.sub(r"\s*—\s*", " — ", value)
    return clean(value)


def number_facts(text: str) -> list[str]:
    values: list[str] = []
    for match in re.finditer(r"(?<![A-Za-z])([0-9][0-9,]*(?:[.,][0-9]+)?)", clean(text)):
        raw = match.group(1).replace(" ", "")
        if raw.count(",") > 1 and "." not in raw:
            raw = raw.replace(",", "")
        elif "," in raw and "." not in raw:
            # 2,6 in French is decimal; 1,789 in English is likely thousands.
            tail = raw.rsplit(",", 1)[-1]
            raw = raw.replace(",", "") if len(tail) == 3 else raw.replace(",", ".")
        else:
            raw = raw.replace(",", "")
        try:
            values.append(f"{float(raw):g}")
        except ValueError:
            pass
    return values


def entity_facts(event: dict[str, Any], original: str) -> list[tuple[str, tuple[str, ...]]]:
    facts: list[tuple[str, tuple[str, ...]]] = []
    for symbol in event.get("assets") or []:
        symbol = clean(symbol).upper()
        aliases = ASSET_ALIASES.get(symbol, (symbol,))
        if any(re.search(rf"(?<!\w){re.escape(alias)}(?!\w)", original, flags=re.I) for alias in aliases):
            facts.append((symbol, aliases))
    for identity in PROTECTED_IDENTITIES:
        if identity in {alias for aliases in ASSET_ALIASES.values() for alias in aliases}:
            continue
        if re.search(rf"(?<!\w){re.escape(identity)}(?!\w)", original, flags=re.I):
            facts.append((identity, (identity,)))
    return facts


def quality_gate(event: dict[str, Any], original_value: Any, candidate_value: Any) -> tuple[int, list[str], bool]:
    original = clean(original_value)
    candidate = clean(candidate_value)
    flags: list[str] = []
    score = 100
    hard = False

    if not candidate:
        return 0, ["missing_translation"], False

    if candidate.casefold() == original.casefold() and not source_is_french(event, original):
        flags.append("unchanged_english")
        score -= 45
        hard = True

    for pattern in ABSURD_PATTERNS:
        if re.search(pattern, candidate, flags=re.I):
            flags.append("absurd_literal")
            score -= 45
            hard = True
            break

    residue = [token.lower() for token in re.findall(r"[A-Za-z]+", candidate) if token.lower() in ENGLISH_RESIDUE]
    residue_unique = sorted(set(residue))
    if residue_unique:
        # 40.4.288 — a headline presented as canonical French may not retain ordinary
        # English news vocabulary. One clear residue is enough to refuse publication as FR;
        # proper nouns, tickers and accepted crypto terms are excluded from ENGLISH_RESIDUE.
        flags.append("english_residue:" + ",".join(residue_unique[:6]))
        score -= min(60, 12 * len(residue_unique))
        hard = True

    if not text_looks_french(candidate):
        flags.append("not_confidently_french")
        score -= 25
        hard = True

    original_numbers = number_facts(original)
    candidate_numbers = number_facts(candidate)
    missing_numbers = [value for value in original_numbers if value not in candidate_numbers]
    if missing_numbers:
        flags.append("numeric_fact_loss")
        score -= min(35, 12 * len(missing_numbers))
        hard = True

    missing_entities: list[str] = []
    lower_candidate = candidate.casefold()
    for label, aliases in entity_facts(event, original):
        if not any(alias.casefold() in lower_candidate for alias in aliases):
            missing_entities.append(label)
    if missing_entities:
        flags.append("entity_loss:" + ",".join(missing_entities[:5]))
        score -= min(30, 8 * len(missing_entities))
        hard = True

    score = max(0, min(100, score))
    accepted = score >= QUALITY_MIN and not hard
    return score, list(dict.fromkeys(flags)), accepted


def relevance_reason(event: dict[str, Any]) -> str:
    parts: list[str] = []
    assets = [clean(v).upper() for v in event.get("assets") or [] if clean(v)]
    domains = [clean(v) for v in event.get("driver_domains") or [] if clean(v)]
    topics = [clean(v) for v in event.get("matched_topics") or [] if clean(v)]
    if assets:
        parts.append("actifs=" + "/".join(assets[:6]))
    if domains:
        parts.append("drivers=" + "/".join(domains[:4]))
    if topics:
        parts.append("thèmes=" + "/".join(topics[:5]))
    if not parts and clean(event.get("event_label")):
        parts.append("événement=" + clean(event.get("event_label")))
    return " · ".join(parts) or "pertinence héritée du collecteur canonique"


def _legacy_aliases(event: dict[str, Any]) -> None:
    """Compatibility only: aliases mirror canonical fields; they never alter content."""
    status = event["translation_status"]
    event["headline_fr_display"] = event["display_headline"]
    event["headline_fr_display_status"] = "canonical_v3"
    event["headline_fr_status"] = status.lower()
    event["headline_fr_engine"] = event.get("translation_engine") or "none"
    event["headline_fr_quality_score"] = event["translation_quality_score"]
    event["headline_fr_quality_status"] = "pass" if status in {ORIGINAL_FR, TRANSLATED_OK} else "rejected" if status == TRANSLATION_REJECTED else "fallback"
    event["headline_fr_quality_reasons"] = list(event["translation_quality_flags"])


def canonicalize_event(event_value: dict[str, Any], translate_en_fr: Callable[[str], str] | None) -> dict[str, Any]:
    event = copy.deepcopy(event_value)
    original = clean(event.get("headline"))
    incoming_contract_build = clean(event.get("translation_contract_build"))
    incoming_translation_status = clean(event.get("translation_status"))
    incoming_headline_fr = clean(event.get("headline_fr"))
    incoming_engine = clean(event.get("translation_engine"))
    # Derived v1/v2/v3 translation metadata is never source evidence. Rebuild it deterministically
    # from the immutable original headline so stale quality claims cannot leak across contracts.
    for field in (
        "headline_fr_display", "headline_fr_display_status", "headline_fr_status", "headline_fr_engine",
        "headline_fr_quality_score", "headline_fr_quality_status", "headline_fr_quality_reasons",
        "headline_fr_source_normalized", "translation_source_normalized", "translation_error",
        "translation_quality_score", "translation_quality_flags", "translation_engine",
        "translation_status", "display_headline", "display_language",
    ):
        event.pop(field, None)
    event["headline_original"] = original
    event["language_original"] = original_language(event, original) if original else "und"
    event["source"] = clean(event.get("source_name") or event.get("source_host"))
    event["url"] = clean(event.get("source_url"))
    event["published_at"] = clean(event.get("event_time") or event.get("published_at"))
    event["crypto_relevance_score"] = int(event.get("relevance_score") or 0)
    event["relevance_reason"] = relevance_reason(event)
    event["translation_contract_build"] = BUILD
    event["translation_contract_schema"] = SCHEMA

    if not original:
        event["translation_status"] = FALLBACK_ORIGINAL
        event["translation_engine"] = "none"
        event["translation_quality_score"] = 0
        event["translation_quality_flags"] = ["missing_original"]
        event["display_headline"] = clean(event.get("event_label")) or "Événement sans titre"
        event["display_language"] = "fr"
        event.pop("headline_fr", None)
        _legacy_aliases(event)
        return event

    if event["language_original"] == "fr":
        event["headline_fr"] = original
        event["translation_status"] = ORIGINAL_FR
        event["translation_engine"] = "source"
        event["translation_quality_score"] = 100
        event["translation_quality_flags"] = []
        event["display_headline"] = original
        event["display_language"] = "fr"
        _legacy_aliases(event)
        return event

    # Only same-contract accepted translations may be reused. V1/V2 output is never trusted implicitly.
    if (
        incoming_contract_build == BUILD
        and incoming_translation_status == TRANSLATED_OK
        and incoming_headline_fr
    ):
        candidate = incoming_headline_fr
        score, flags, accepted = quality_gate(event, original, candidate)
        if accepted:
            event["translation_engine"] = incoming_engine or ENGINE_TAG
            event["translation_quality_score"] = score
            event["translation_quality_flags"] = flags
            event["display_headline"] = candidate
            event["display_language"] = "fr"
            _legacy_aliases(event)
            return event

    event.pop("headline_fr", None)
    candidate = structural_french(original)
    engine = STRUCTURAL_ENGINE if candidate else ""
    if not candidate and translate_en_fr is not None:
        try:
            normalized = normalize_english_context(original)
            event["translation_source_normalized"] = normalized if normalized != original else original
            protected, mapping = protect_for_mt(normalized, protected_terms(event, original))
            candidate = french_typography(restore_after_mt(translate_en_fr(protected), mapping))
            engine = ENGINE_TAG
        except Exception as exc:
            event["translation_error"] = clean(exc)[:180]
            candidate = ""

    if candidate:
        candidate = french_typography(candidate)
        event["headline_fr"] = candidate
        score, flags, accepted = quality_gate(event, original, candidate)
        event["translation_engine"] = engine or ENGINE_TAG
        event["translation_quality_score"] = score
        event["translation_quality_flags"] = flags
        if accepted:
            event["translation_status"] = TRANSLATED_OK
            event["display_headline"] = candidate
            event["display_language"] = "fr"
        else:
            event["translation_status"] = TRANSLATION_REJECTED
            event["display_headline"] = f"[EN] {original}"
            event["display_language"] = "en"
    else:
        event.pop("headline_fr", None)
        event["translation_status"] = FALLBACK_ORIGINAL
        event["translation_engine"] = "unavailable"
        event["translation_quality_score"] = 0
        event["translation_quality_flags"] = ["translation_unavailable"]
        event["display_headline"] = f"[EN] {original}"
        event["display_language"] = "en"

    _legacy_aliases(event)
    return event


def canonicalize_payload(payload_value: dict[str, Any], translate_en_fr: Callable[[str], str] | None, engine_version: str | None = None) -> tuple[dict[str, Any], dict[str, Any]]:
    out = copy.deepcopy(payload_value)
    rows = out.get("events") if isinstance(out.get("events"), list) else []
    events = [canonicalize_event(event, translate_en_fr) if isinstance(event, dict) else event for event in rows]
    out["events"] = events
    counts = {status: 0 for status in STATUSES}
    for event in events:
        if isinstance(event, dict) and event.get("translation_status") in counts:
            counts[event["translation_status"]] += 1
    eligible = [event for event in events if isinstance(event, dict) and clean(event.get("headline_original"))]
    display_count = sum(1 for event in eligible if clean(event.get("display_headline")))
    accepted_fr = counts[ORIGINAL_FR] + counts[TRANSLATED_OK]
    summary = {
        "schema": SCHEMA,
        "build": BUILD,
        "source_field": "headline",
        "original_alias_field": "headline_original",
        "translation_field": "headline_fr",
        "display_field": "display_headline",
        "status_field": "translation_status",
        "quality_score_field": "translation_quality_score",
        "quality_flags_field": "translation_quality_flags",
        "target_language": "fr",
        "engine": "argos-translate",
        "engine_version": engine_version,
        "engine_tag": ENGINE_TAG,
        "quality_minimum": QUALITY_MIN,
        "statuses": sorted(STATUSES),
        "counts": counts,
        "events": len(eligible),
        "display_coverage": display_count,
        "display_coverage_ratio": round(display_count / len(eligible), 4) if eligible else 1.0,
        "accepted_french": accepted_fr,
        "accepted_french_ratio": round(accepted_fr / len(eligible), 4) if eligible else 1.0,
        "quality_gate": {
            "minimum": QUALITY_MIN,
            "accepted": counts[ORIGINAL_FR] + counts[TRANSLATED_OK],
            "rejected": counts[TRANSLATION_REJECTED],
            "fallback_original": counts[FALLBACK_ORIGINAL],
        },
        "canonical_original_preserved": all(clean(event.get("headline_original")) == clean(event.get("headline")) for event in eligible),
        "browser_translation": False,
        "browser_editorial_repair": False,
        "translation_quality_separate_from_crypto_relevance": True,
        "fallback_original_is_explicitly_labelled": True,
        "display_contract": {
            "field": "display_headline",
            "accepted_languages": ["fr", "en"],
            "english_fallback_prefix": "[EN] ",
            "consumer_must_not_translate": True,
            "consumer_must_not_fallback_silently_to_headline": True,
        },
    }
    out["translation_fr"] = summary
    return out, summary


def self_test() -> int:
    sample = {
        "events": [
            {
                "event_id": "liq", "headline": "XRP, Ethereum and Solana Hit by $369M Crypto Liquidation Wave - altcoinbuzz.io",
                "assets": ["ETH", "SOL", "XRP"], "relevance_score": 12, "matched_topics": ["crypto", "security"],
                "source_name": "Google News · ETF flows discovery", "source_url": "https://example.test/liq",
            },
            {
                "event_id": "bad", "headline": "Bitcoin rises after ETF inflows", "assets": ["BTC"],
                "source_name": "CoinDesk", "headline_fr": "Bitcoin Appuyez sur ETF inflows",
                "headline_fr_engine": "argos-translate+atlas-domain-normalizer-v2",
            },
            {
                "event_id": "fr", "headline": "Le bitcoin progresse après une annonce européenne",
                "assets": ["BTC"], "source_name": "France 24",
            },
            {
                "event_id": "reject", "headline": "Ethereum loses $8.5M after attacker buys voting power",
                "assets": ["ETH"], "source_name": "Cointelegraph",
            },
        ]
    }

    def fake(text: str) -> str:
        if "loses" in text:
            return "Ethereum perd 8,5 M$ after attacker buys voting power"
        return "Bitcoin progresse après des entrées dans les ETF"

    out, summary = canonicalize_payload(sample, fake, "SELFTEST")
    events = {event["event_id"]: event for event in out["events"]}
    expected = "XRP, Ethereum et Solana frappés par une vague de liquidations crypto de 369 M$ - altcoinbuzz.io"
    assert events["liq"]["display_headline"] == expected
    assert events["liq"]["translation_status"] == TRANSLATED_OK
    assert events["liq"]["translation_quality_score"] >= QUALITY_MIN
    assert "Appuyez sur" not in events["bad"]["display_headline"]
    assert events["bad"]["translation_contract_build"] == BUILD
    assert events["fr"]["translation_status"] == ORIGINAL_FR
    assert events["reject"]["translation_status"] == TRANSLATION_REJECTED
    assert events["reject"]["display_headline"].startswith("[EN] ")
    assert events["reject"]["translation_quality_score"] < QUALITY_MIN
    # Regression proof from 40.4.287: mixed French/English output must never be certified FR.
    mixed_event = {"headline": "Crypto.com Cronos Halts Entire Blockchain After $75M Exploit", "assets": []}
    mixed_candidate = "Cronos Halts Entire Blockchain de Crypto.com après 75 M$ d'exploitation"
    _, mixed_flags, mixed_ok = quality_gate(mixed_event, mixed_event["headline"], mixed_candidate)
    assert mixed_ok is False and any(flag.startswith("english_residue:") for flag in mixed_flags)
    unchanged_event = {"headline": "Neuberger teams with Securitize on tokenized fixed-income fund launch", "assets": []}
    _, _, unchanged_ok = quality_gate(unchanged_event, unchanged_event["headline"], unchanged_event["headline"])
    assert unchanged_ok is False
    assert summary["canonical_original_preserved"] is True
    assert summary["browser_editorial_repair"] is False
    assert summary["translation_quality_separate_from_crypto_relevance"] is True
    print("ATLAS NEWS FR CONTRACT 40.4.288 SELF-TEST PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(self_test())
