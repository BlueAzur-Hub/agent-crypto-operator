# Agent-Crypto Administrator 40.6.562 — CANDLES · INDICATOR TRUTH LOCK

Parent: **40.6.561**  
Market Core: **38.15.11 — protected / unchanged**

## Why this build

The 40.6.560/561 review found that indicator formulas were mostly sound, but some indicator state was tied to the viewport rather than to the loaded candle history, and Support/Resistance wording could describe a historical visible close as if it were a current price.

40.6.562 corrects indicator truth only. It does **not** change trading logic, Market Core, Depth, New Listings, USD architecture, Strategy A, Oracle, Aether or Web Classique.

## Single responsibility

**An indicator value and its label must describe the candle history actually used to calculate it.**

### MA / EMA

MA5/10/20 and EMA5/10/20 are now calculated on the full loaded candle series and only then projected into the visible viewport.

Result: panning or zooming no longer reseeds an EMA or changes the same candle's MA/EMA simply because the viewport moved.

### Support / Resistance truth

The S/R algorithm remains **PIVOTS_VISIBLES_W2** and still belongs to the visible window.

The native Technical Reading bridge now includes the visible reference close and distance values in its render signature, so the displayed distance cannot stay stale when the reference close changes.

Wording is explicit:

- **dernière clôture** when the visible window reaches the latest loaded candle;
- **clôture visible** when the operator pans into history.

When S/R is OFF, the native S/R window hides and `technicalLevels()` returns `null`; stale levels are not kept as active truth.

### Indicator state summary

The existing immediate `renderState()` refresh on indicator toggle is preserved and now guarded as part of the 40.6.562 contract.

### VWAP naming

The formula remains unchanged:

`VWAP_CUMULATIVE_TYPICAL_PRICE_VOLUME`

The visible label becomes **VWAP fenêtre** to make the current anchor explicit: the calculation begins at the first loaded candle of the 300-point window. This is not a session-anchored exchange VWAP.

### Numerical reference tests

The module self-test now checks deterministic reference values for:

- MA20 / EMA20 full-history projection;
- Supertrend **10 × 3**;
- Bollinger **20 × 2**;
- Parabolic SAR **0.02 / 0.20**;
- VWAP window;
- Volume Profile **24 bins** with deterministic POC.

These tests complement, rather than replace, Firefox terrain validation.

## Explicitly unchanged

- candle request / asset truth lock from 40.6.561;
- Supertrend formula;
- Bollinger formula;
- Parabolic SAR formula;
- VWAP formula;
- Volume Profile approximation formula;
- S/R pivot algorithm;
- Lecture Technique business logic;
- Profondeur;
- Market Core 38.15.11;
- New Listings business logic;
- USD architecture;
- Strategy A;
- Oracle;
- Aether;
- Web Classique;
- storage ownership;
- real / automatic orders.

No recurring timer, MutationObserver or new business network request is added.

## Firefox terrain proof required

1. Open Bougies with MA/EMA. Pan left, note a candle, pan away and return: the same candle must keep the same MA/EMA value.
2. With S/R ON, pan into history: the context must say **clôture visible**.
3. Return to the latest candles: the context must say **dernière clôture**.
4. Switch S/R OFF: the S/R native window must hide and `AgentCryptoMarketMicroscope.technicalLevels()` must be `null`.
5. Toggle BOLL / SAR / VWAP / VP: the state summary must update immediately.
6. Confirm the legend/state says **VWAP fenêtre**.
7. Confirm SUPER / BOLL / SAR / VWAP / VP remain opt-in and their visual formulas are unchanged.

Terrain remains **PENDING Firefox** until Christophe validates it.
