# Agent-Crypto Administrator — 40.6.64

## TRADUS SHADOW ADAPTER · MARKET MICROSTRUCTURE

Parent: **40.6.63**  
Market Core: **38.15.11 — protected**

### Functional progress

40.6.64 adds a second, independent strategy lane beside Strategy A: **TRADUS V1.0 R1**.
It reads the public Binance BTCEUR top-of-book and evaluates the original ORDER_IMBALANCE rule:

- BUY when imbalance >= +0.25;
- SELL when imbalance <= -0.25;
- NO_TRADE otherwise;
- NO_TRADE if spread ratio exceeds 0.002.

The operator panel shows Book, TRADUS signal, imbalance, spread, Strategy A state, and convergence/divergence.
This is **SHADOW SIGNAL ONLY** in 40.6.64: no order and no performance claim.

### TRADUS R1 corrections

- stale data uses the real current clock by default;
- signed long/short accounting is corrected in the preserved Python vendor copy;
- the contradictory original BUY test is repaired by using a spread that satisfies the unchanged risk threshold.

Corrected vendor tests: **........                                                                 [100%] 8 passed in 0.15s**

### Protected

Aether Watch checkpoint, Market Core 38.15.11, Graphique, Lecture Technique, Oracle, Atlas, Strategy A thresholds and existing Strategy A Paper owners are unchanged.

### Network and safety

One read-only public Binance depth request on mount and when the host market refresh is explicitly triggered. No recurring polling timer. No API key. No wallet. No order endpoint. No real order.
