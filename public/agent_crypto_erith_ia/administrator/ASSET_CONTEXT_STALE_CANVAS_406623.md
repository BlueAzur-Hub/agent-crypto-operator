# Agent-Crypto 40.6.623 — Asset Context / Stale Canvas Truth

## Terrain defect

Firefox proof on Trader 40.6.622:

- selected asset: STONK;
- candle source: unavailable;
- orderbook: correctly unavailable;
- Market Microscope metadata already reported STONK / no candles;
- but the canvas and selected-candle inspector still showed the previous BTC-USDC series.

This is a context-integrity defect: a new asset must never inherit the previous asset's visual series.

## Root cause

`handleCanonicalSelectionChanged()` returned immediately while the external/new-listing context was active:

`if(externalContext().active)return false;`

The separate `agent-crypto:external-asset-changed` reset emptied state but did not repaint the empty canvas/inspector, and it forced the microscope back to native mode.

## 40.6.623 correction

Owner changed only:

`administrator/js/market-microscope-candles.js`

Changes:

1. external active selections are no longer ignored by the canonical selection handler;
2. an empty series now clears the canvas geometry and the selected-candle inspector;
3. the external-asset event resets the requested/active instrument and error context;
4. the current Ligne/Bougies mode is preserved;
5. if Bougies is open, the external asset is reloaded through the existing external provider path;
6. an external provider with zero candles returns explicit `MARKET_INSTRUMENT_UNAVAILABLE`.

## Protected

Unchanged:

- Market Core 38.15.11;
- Bridge 1.9.13;
- Backend 1.4.6 R2;
- Market Instrument Resolver;
- OKX/Bitget/Binance provider order;
- Support/Resistance formula and PIVOTS_VISIBLES_W2;
- Profondeur;
- order execution: disabled.

No new recurring timer.
No new observer.
No new storage owner.
No new business network route.

## Firefox proof required

1. Open BTC or another asset with candles in Bougies.
2. Select STONK (or another asset with no compatible candles).
3. Confirm:
   - STONK remains the current asset;
   - candle metadata reports unavailable / zero series;
   - no BTC candle remains visible;
   - selected-candle inspector is empty;
   - no BTC Support/Resistance remains visible.
4. Return to BTC/PUMP/OKB and confirm fresh candles repaint normally.
5. Optional regression: asset with available external candles must load through the existing provider path.

Engineering/static checks are CI authority. Terrain remains pending until Firefox proof.
