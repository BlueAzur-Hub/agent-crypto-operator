# Agent-Crypto 40.6.494 — STRATEGY LEDGER LIVE MERGE TRUTH

Parent: **40.6.493**  
Market Core: **38.15.11 — protected**  
Bridge/Backend: **R18 / V1.9.13 / V1.4.3 — unchanged**

## Cause

Auto A continued to create new cycles, but the G3 prospective facade inherited from 40.6.206 could expose a stale generic Experiment Ledger view. Terrain showed:
- visible Auto A latest cycle: A-CYCLE-00017;
- 40.6.478 received event A-CYCLE-00017 but returned LEDGER_ID_MISS;
- 40.6.479 still exposed A-CYCLE-00006 as its latest decision frame.

## 40.6.494

The facade now merges:
1. historical/durable generic ledger rows;
2. prospective G3 evidence rows;
3. the exact live Experiment Ledger owner.

Rows are keyed by cycle_id. Exact live fields are authoritative on overlap. Prospective-only evidence fields are retained by shallow merge. The visible facade remains bounded to 240 rows and is sorted by decision/capture time so the newest live cycle cannot be hidden by an older snapshot.

## Protections

No Strategy threshold, Cost Gate, Oracle math, Risk policy, PAPER execution, 40.6.492 execution-cost measurement, 40.6.493 shadow lab, Backend, Bridge, Market Core, order, wallet, API key, timer, observer, fetch/WebSocket, or IndexedDB schema is changed.
