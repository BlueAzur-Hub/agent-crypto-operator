# Agent-Crypto 40.6.493 — OKX MICRO EXECUTION SHADOW TRUTH

Parent: **40.6.492**  
Market Core: **38.15.11 — protected**  
Bridge/Backend: **R18 / V1.9.13 / V1.4.3 — unchanged**

40.6.493 adds one passive laboratory after **EXECUTION COST TRUTH 40.6.492**.

It compares the existing OKX BTC/EUR evidence for tickets **10 / 25 / 50 / 100 EUR** across:
- Market → Market: current measured multi-level orderbook cost from 40.6.492.
- Post-only → Market: maker+taker fee floor only; fill remains UNKNOWN.
- Post-only → Post-only: two-maker fee floor only; fills remain UNKNOWN.

The current safety margin is derived from the existing Strategy A model when both values are known:
`strategy_threshold_pct - pedagogical_cost_pct`.

The laboratory may report **POTENTIEL**, **WAIT** or **UNKNOWN**. **POTENTIEL never means PASS.**

No new network call, WebSocket, storage schema/write, exchange key, wallet, order endpoint, real order, Strategy threshold, Cost Gate, Risk Governor, Oracle math, Market Core or historical backfill is added.
