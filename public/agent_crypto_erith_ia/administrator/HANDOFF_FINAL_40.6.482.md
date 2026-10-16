# HANDOFF FINAL — 40.6.482

## Proven before this build
- .481 Firefox terrain PASS: Evidence explorer recovered; 35,607 / 35,607 displayed, 5,732 resolved, 29,875 pending. No serialized-value overflow.

## 40.6.482
Tiered-storage foundation only.

HOT = browser IndexedDB.
COLD = GitHub data/oracle_evidence.
CONTROL = Notion.
TRANSPORT = safe Bridge/backend (future).

## Safety invariant
40.6.482 NEVER deletes local Evidence and NEVER writes GitHub from public browser JS.

## Next sister AI task
Prepare **40.6.483 — ORACLE EVIDENCE SAFE BRIDGE INGEST + COLD VERIFY**.

Required sequence:
1. accept one 40.6.482 transport bundle in a trusted local Bridge/backend;
2. verify bundle JSON + SHA-256 + row_count;
3. write JSONL chunk to GitHub cold path;
4. update manifest atomically;
5. read back raw/published chunk;
6. verify SHA/count/JSON parse again;
7. mark chunk VERIFIED in manifest;
8. still do NOT purge browser data in 40.6.483.

Only after several verified cold chunks should a later build consider local retention/release.
That later retention build must delete only rows covered by VERIFIED chunks and must keep a hot window.

## Separate unresolved work
- CoinGecko canonical collector still needs valid GitHub Actions secret COINGECKO_DEMO_API_KEY for live recovery.
- .479 Input Freshness semantic correction (News event_time + cycle capture vs upstream time) remains separate.
