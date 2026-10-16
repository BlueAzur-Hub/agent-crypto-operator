# Agent-Crypto @erith.IA — 40.6.223

## G3 REALISTIC REPLAY READINESS TRUTH

Parent: `40.6.222`  
Market Core: `38.15.11` unchanged  
Mode: **PAPER ONLY**  
Gate 3: **PENDING**  
Gate 9: **LOCKED**

## Terrain inherited from 40.6.222

The supplied Firefox exports prove the post-T0 sub-layer is complete:

- replay dataset: `READY_FOR_DECISION_REPLAY`;
- joined PAPER decisions: 2;
- post-T0 horizons: 6 / 6 certified across T+5 / T+15 / T+60;
- outcome labels: `CERTIFIED`;
- G2 and G7 remain `FOUNDATION_PASS`;
- G3 remains `PENDING`.

## 40.6.223

Adds `js/strategy-a-g3-realistic-replay-readiness-406223.js`.

This read-only owner separates two layers that were previously mixed in the UI:

1. **market/outcome evidence** — replay dataset + certified post-T0 labels;
2. **execution realism** — after-cost evidence, complete cost accounting, partial-fill lifecycle, latency and liquidity proof.

It deliberately fails closed when execution facts are absent. UNKNOWN is never converted to zero. It does not execute a backtest and cannot promote Gate 3.

## Expected current next blocker

With the 40.6.222 terrain proof, the data/outcome layer is complete. The remaining G3 work is execution realism: actual after-cost evidence and explicit proof for execution costs / latency / liquidity / partial-fill behavior before a realistic historical backtest can be certified.

## Invariants

- no historical backfill;
- no current Oracle applied to the past;
- no future outcome used as T0 input;
- no Strategy A threshold change;
- no Market Core change;
- no profitability claim;
- no Gate promotion;
- no recurring timer or observer;
- no business network request;
- no live unlock or real order.
