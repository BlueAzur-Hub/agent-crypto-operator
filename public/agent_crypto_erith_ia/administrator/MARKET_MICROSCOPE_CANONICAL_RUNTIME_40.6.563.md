# Agent-Crypto Administrator 40.6.563 — MARKET MICROSCOPE · CANONICAL RUNTIME + INDICATOR STATE

Parent: **40.6.562**  
Market Core: **38.15.11 — protected / unchanged**

## Why this build

The 40.6.553 → 40.6.562 review found two architecture debts in the active Market Microscope:

1. the runtime was still named `market-microscope-candles-406498.js` and still carried versioned DOM / hook identifiers from 40.6.551, 40.6.561 and 40.6.562;
2. indicator buttons were independent while the page was alive, but their state existed only in the in-memory `state.indicators` object. A reload reconstructed the hard-coded defaults and silently lost the operator's selection.

40.6.563 repairs only those ownership problems.

## Canonical runtime

Active runtime: `js/market-microscope-candles.js`

Historical lineage remains metadata only: `40.6.498`

Stable runtime identifiers:
- `atlasCandlesTechnicalLevels`
- `__agentCryptoMicroscopeHook`
- `__agentCryptoMicroscopeOriginal`

## Indicator state owner

Stable key: `agentCrypto.marketMicroscope.indicators.v1`

Owned values: MA, EMA, S/R, SUPER, BOLL, SAR, VWAP, VP.

Storage policy:
- localStorage attempted for durable browser persistence;
- sessionStorage fallback when localStorage is unavailable or quota-blocked;
- no existing storage key is deleted, migrated or cleared;
- persistence failure never blocks chart rendering;
- original first-run defaults remain unchanged.

## Preserved

No indicator formula changes. Request / asset truth from 40.6.561 and indicator truth from 40.6.562 are preserved. Technical Reading business logic, Profondeur, New Listings business logic, USD architecture and Market Core 38.15.11 are unchanged. Read-only / no real orders remains true.

## CI ownership

Current validator:
- `.github/workflows/agent-crypto-market-microscope-current.yml`
- `.github/scripts/agent_crypto_market_microscope_guard.py`

The 40.6.562 versioned validator is archived and no longer active.

## Firefox terrain proof

1. Activate MA + EMA + S/R + BOLL + VWAP.
2. Reload with Ctrl+F5: same buttons, legends and overlays must return.
3. Click EMA only: no other indicator may change.
4. Toggle SUPER, BOLL, SAR, VWAP and VP independently.
5. Turn S/R OFF, reload, confirm S/R remains OFF and the native S/R window remains hidden.
6. Confirm current page loads `market-microscope-candles.js?v=40.6.563`.

Terrain remains **PENDING Firefox** until operator validation.
