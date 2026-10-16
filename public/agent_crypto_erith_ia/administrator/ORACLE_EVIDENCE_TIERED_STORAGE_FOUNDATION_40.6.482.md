# ORACLE EVIDENCE TIERED STORAGE FOUNDATION — 40.6.482

## Goal

Create the safe foundation for a two-tier Oracle Evidence memory model:
- **HOT**: Firefox IndexedDB for current work.
- **COLD**: GitHub `public/agent_crypto_erith_ia/data/oracle_evidence` for durable history.

## What 40.6.482 actually does

A new module exposes a bounded, operator-triggered archive planner:
- reads the GitHub cold manifest;
- scans the existing Evidence IndexedDB by `t0` cursor;
- prepares at most 500 rows by default (hard maximum 1000);
- serializes JSONL;
- calculates SHA-256;
- records first/last IDs and T0 watermark;
- downloads one transport bundle;
- verifies a published cold chunk by SHA/count/JSON parse.

## What it does NOT do

- no local Evidence delete;
- no retention reduction;
- no IndexedDB schema change;
- no GitHub credential in browser;
- no browser-to-GitHub write;
- no automatic upload;
- no timer;
- no observer;
- no Oracle Math change;
- no Strategy A change;
- no Market Core change;
- no real order.

## Why transport is deferred

The current public Administrator cannot safely own a GitHub write credential.
Authenticated ingestion must be implemented in a trusted local Bridge/backend in the next stage.

## Terrain

Oracle → Evidence & validation should show the small **MÉMOIRE FROIDE · GITHUB · 40.6.482** panel.
Expected initial state:
- local Evidence count visible;
- archived = 0;
- chunks = 0;
- transport = PENDING_SAFE_BRIDGE;
- preparing a 500-row chunk succeeds;
- downloading a bundle does not remove any local row.
