# Agent-Crypto 40.6.210 — G3 Durable Decision Evidence

Parent: 40.6.209  
Engine: Market Core 38.15.11  
Mode: PAPER ONLY  
G3: PENDING  
G9: LOCKED

## Terrain proof
The 40.6.208 in-session report showed one newly captured PAPER decision: Ledger 12, T0 traceable 1, T0 certified 1 and one prospective evidence row.

After a normal reload, the 40.6.209 report returned to Ledger 11, T0 traceable 0, T0 certified 0 and Prospective rows 0.

Therefore the existing browser-local persistence path did not preserve that evidence across reload. This release does **not** guess whether the browser cause was quota, eviction, privacy configuration or another local-storage failure mode.

## 40.6.210
The already-loaded `js/strategy-a-g3-overlap-live-refresh.js` asset now also owns a bounded durable evidence mirror using IndexedDB:

- database: `agent_crypto_erith_ia_g3_evidence_v1`
- store: `prospective_t0`
- maximum: 64 prospective PAPER evidence rows

After the existing visible PAPER capture action completes, the resulting prospective evidence is copied into IndexedDB. On later reloads it is hydrated back into the generic Experiment Ledger read facade before the G3 proof/cascade/overlap views are refreshed.

The original localStorage path is not deleted or rewritten. IndexedDB is an additional durable evidence path.

## Human UI
A new block appears directly below the existing capture panel:

`DÉCISION PAPER · MÉMOIRE DURABLE · 40.6.210`

It reports:
- storage state;
- number of decisions conserved;
- last conserved decision ID;
- whether a decision is present after reload.

The visible action is renamed to `ENREGISTRER LA PROCHAINE DÉCISION PAPER`.

## Not changed
No Strategy A threshold, Risk Governor, PAPER lifecycle, Market Core, Atlas, Oracle, Aether, Lecture Technique, Gate state or real-order path is changed. No recurring timer, MutationObserver or business-network request is added.

## Terrain acceptance
1. Reload until `Build 40.6.210 · Administrator`.
2. Confirm the human durable-memory block reports `MÉMOIRE DURABLE OK`.
3. Because the old proof is already gone, record exactly one new PAPER decision with the visible human-labelled button.
4. Wait for `DÉCISIONS CONSERVÉES 1` or more.
5. Reload the page once.
6. Export the markdown report.
7. Acceptance requires the durable-memory block to still report at least one decision after reload and the G3 evidence chain to recover that decision without another capture.
