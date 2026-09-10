#!/usr/bin/env python3
"""Compatibility shim for the retired numbered 40.3.67 News extension.

Canonical owner since Agent-Crypto 40.3.88:
    public/agent_crypto_erith_ia/tools/atlas_news_collector.py

This shim deliberately adds no source, keyword, timer, network request or policy.
It exists only so old manual commands fail safe into the canonical collector.
"""
from __future__ import annotations

import atlas_news_collector as canonical

VERSION = canonical.VERSION
BUILD = canonical.BUILD


def self_test() -> int:
    return canonical.self_test()


def main() -> int:
    return canonical.main()


if __name__ == "__main__":
    raise SystemExit(main())
