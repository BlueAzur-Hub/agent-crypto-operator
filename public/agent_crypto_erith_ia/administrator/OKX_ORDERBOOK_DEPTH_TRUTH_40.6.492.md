# Agent-Crypto 40.6.492 — OKX ORDERBOOK DEPTH TRUTH

Parent: **40.6.491**
Market Core: **38.15.11 — protected**

40.6.492 closes the explicit OKX evidence gap without changing Strategy A business logic. The browser still never contacts OKX directly: Private Backend **V1.4.3** exposes a fresh public BTC/EUR multi-level book on loopback, and Execution Cost Truth derives depth ±5/10/25 bp plus simulated 10/25/50/100 EUR slippage.

If the local orderbook route is absent, stale, invalid, crossed or incomplete, the existing top-of-book evidence remains available while depth/slippage remain **UNKNOWN**.

No Strategy threshold, Cost Gate, Risk Governor, Oracle math, Market Core, wallet, key, order endpoint or historical backfill is changed.
