# Agent-Crypto 40.6.498 — MARKET MICROSCOPE · CANDLES CORE

Parent: **40.6.497**  
Market Core: **38.15.11 — protected**

## Added
- isolated **Ligne / Bougies** microscope control;
- OKX public candles, on demand only;
- OHLC candles;
- volume;
- MA 5 / 10 / 20;
- pointer crosshair and precise O/H/L/C/V tooltip;
- 1m / 5m / 15m / 1h / 4h / 1j.

Native Prix / Base 100 is not rewritten or removed.

## Data boundary
EUR display requests SYMBOL-EUR. If unavailable, a SYMBOL-USDC fallback may be shown only with an explicit **not converted to EUR** warning. USD display uses USDC as the display-source quote; executionInstrument remains independent.

## Protections
No recurring timer, MutationObserver, storage write, private API, real order, wallet, Strategy A, Market Core, Oracle, Math, Bridge or Backend change.

## Test environment
Node syntax + module self-test + headless Chromium mock-data visual harness PASS before publication. Terrain Firefox remains pending.