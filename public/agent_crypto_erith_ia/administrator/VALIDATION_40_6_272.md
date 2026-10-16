# VALIDATION — Agent-Crypto 40.6.272

Status: COMMITTED RECOVERY · FIREFOX TERRAIN REQUIRED

## Static checks

- durable owner JavaScript parses;
- runtime-shell contains exactly one durable owner script tag;
- IndexedDB schema/database remains compatible with 40.6.268;
- no market-series hot listener;
- no recurring timer;
- no MutationObserver;
- no network request;
- no real-order path;
- no Strategy A threshold change;
- no initial full evidence scan/write at page boot.

## Terrain proof

1. Confirm **Build 40.6.272 · Administrator**.
2. Ctrl+F5 once.
3. Confirm Decision Intelligence remains responsive.
4. Locate **STRATEGY A · DURABLE EVIDENCE · 40.6.272**.
5. Confirm **DURABLE READY**.
6. If 40.6.268 previously wrote evidence in this Firefox profile, confirm its counts are recovered.
7. Let one normal cycle occur, reload once, and confirm counts survive.
8. Any repeated Firefox slow-page warning = FAIL; revert runtime use to 40.6.271 and do not stack another patch.
