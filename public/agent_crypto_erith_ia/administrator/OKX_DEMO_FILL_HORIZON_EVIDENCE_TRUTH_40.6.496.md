# Agent-Crypto 40.6.496 — OKX DEMO FILL + HORIZON EVIDENCE TRUTH

Parent: **40.6.495**  
Market Core: **38.15.11 — protected**  
Execution Cost Truth: **40.6.492 — unchanged**  
Bridge / Backend: **R18 / V1.9.13 / V1.4.3 — unchanged**

## Purpose

40.6.496 imports the bounded OKX Demo V5 evidence into the passive Strategy A laboratory. It does **not** promote Demo results to live execution truth and does **not** change Strategy A business logic or gates.

## V5 evidence integrated

Source report: `post_only_fill_horizon_lab_v5_FINAL_20261002_084547.json`  
SHA-256: `930bb9d35cfdbcd3c2a0632063918e8c7a8b2afb424da8d99aa4bf7ae1b4425b`

- mode: OKX Demo;
- instrument: BTC-EUR;
- tested ticket: **10 EUR only**;
- 10 Post-only BUY entries at best bid;
- **4 full fills / 10**;
- **0 partial**;
- **6 no-fill**;
- fill rate: **40.0 %**;
- median first-fill checkpoint: **20 s**;
- observed entry fee: **0.10 %**.

Post-fill median bid moves on the four filled entries:

| Horizon | Median bid move | After 0.20 % maker/maker fee proxy | Covers proxy |
| --- | ---: | ---: | ---: |
| +5 min | +0.1447 % | -0.0553 % | 1 / 4 |
| +15 min | +0.1357 % | -0.0643 % | 0 / 4 |
| +30 min | +0.0843 % | -0.1157 % | 0 / 4 |
| +60 min | -0.4500 % | -0.6500 % | 0 / 4 |
| +120 min | -0.6459 % | -0.8459 % | 0 / 4 |

## Interpretation boundary

The V5 sample proves only a **bounded Demo entry-leg observation at 10 EUR**. It does not prove:
- live fill probability;
- live queue position;
- Post-only exit fill;
- Post-only→Post-only round-trip fill;
- profitability;
- 25 / 50 / 100 EUR fill behavior.

The longer-horizon hypothesis is **not validated by this small V5 sample**. Strategy A V1 remains **FAIL_BENCHMARK_FROZEN**. Strategy A2 is **not started** in this release.

## Protected

No Strategy threshold, Cost Gate, Oracle math, Risk policy, PAPER execution, 40.6.492 measurement logic, Backend, Bridge, Market Core, wallet, API key, live order, persistent storage schema, recurring timer or MutationObserver is changed.
