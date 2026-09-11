# STRATEGY A — CANONICAL SPEC

**Spec version:** 1.0  
**Runtime integration build:** 40.6.56  
**Mode:** PAPER ONLY  
**Authority:** AERITH TRADING Rulebook → this Strategy A spec → runtime presentation.

## Purpose

Freeze the measured Strategy A gate contract already present in Agent-Crypto without changing thresholds. This file documents what the runtime is expected to implement and what the 40.6.56 audit module checks.

## Universe and profile

- Assets: BTC, ETH, SOL.
- Virtual capital: 1,000 EUR.
- Suggested ticket: 50 EUR.
- Maximum operation: 100 EUR.
- Maximum exposure: 300 EUR.
- Minimum reserve: 700 EUR.

## Ordered decision gates

1. DATA
2. REGIME
3. DIRECTION
4. CONFIDENCE
5. BTC 24H
6. REENTRY
7. COST GATE
8. IDENTITY / duplicate protection
9. RISK GOVERNOR
10. PAPER

### Measured policy

- MIXTE direction: at least +12/100.
- MIXTE Oracle confidence: at least 70/100.
- MIXTE BTC 24 h: at least +0.10%.
- Bullish confidence floor carried by deterministic replay: 55/100.
- Cost Gate required move: at least 0.80%.
- Current aggregate modelled cost floor: 0.60%.
- Safety margin over cost: 0.20%.
- Risk decisions eligible to continue: ACCEPT or REDUCE with authorized notional > 0.
- Reentry: cooldown + fresh signal. Exact runtime timing is deliberately not invented here.

## Cost-model limitation

The current runtime exposes a 0.60% aggregate cost allowance plus 0.20% safety margin. This specification does **not** claim a verified decomposition into fee, spread, slippage, latency or liquidity costs. Those components remain a Paper V2 evidence task.

## Safety

This specification creates no order path. PAPER ONLY; no wallet, no credentials and no Kraken trading endpoint. The AERITH TRADING Rulebook remains superior to Strategy A.

## Protected surroundings

Market Core 38.15.11 and the Aether 40.6.54 visual checkpoint are outside this surgery. Aether geometry, master backplate and Window Manager are not modified.
