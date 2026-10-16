# Agent-Crypto 40.6.272 — STRATEGY A DURABLE EVIDENCE RECOVERY

Parent: **40.6.271**
Functional runtime base: **40.6.267**
Recovered capability: **40.6.268**
Original capability commit: `97abaedb2de2f8381df28471c29a0ac3eef06de1`

## Purpose

Recover the only missing post-40.6.267 work: Strategy A durable evidence continuity.

The original 40.6.268 feature was useful, but its implementation added work on a hot market/event path while Firefox was already overloaded. 40.6.272 keeps the same IndexedDB database and evidence families while removing the hot-path amplification.

## Recovered

- IndexedDB database `agent_crypto_strategy_a_durable_evidence_v1`
- durable Strategy A cycles
- after-cost rows
- PAPER lifecycle states
- runtime gaps
- legacy G3 prospective import
- reload continuity
- REVIEW REQUIRED for unresolved restored PAPER state
- merged durable/live read surfaces

## Performance boundary

- no `agent-crypto:market-series-updated` listener
- no recurring timer
- no MutationObserver
- no network request
- no full evidence capture during page boot
- bounded/coalesced capture only
- incremental IndexedDB writes
- cached merged reads

## Protected

- Market Core 38.15.11
- Decision Intelligence recovered 40.6.267 behavior
- Atlas CURRENT
- Oracle
- Lecture Technique
- Strategy A thresholds / Cost Gate / Risk Governor
- PAPER ONLY
- no real order
