# Agent-Crypto Administrator 40.6.564 — MARKET MICROSCOPE · LOCAL TRANSPORT TRUTH + CANDLE VALIDATION

Parent: **40.6.563**  
Market Core: **38.15.11 — protected / unchanged**

## Why this build

Firefox terrain plus the Astra audit established the active candle path:

```text
Market Microscope
→ OKX public candle URL
→ canonical browser fetch transport
→ local Backend 127.0.0.1:8790 /okx-public
→ OKX
```

The OKX URL remains the data-source identity. It is not a direct-browser transport contract in the installed Administrator runtime.

This build does **not** remove the local relay, does **not** split public candles from the existing backend architecture, and does **not** change Market Core, indicator formulas, Lecture Technique, Profondeur, Strategy A, Oracle, Aether or New Listings business logic.

## Bounded repairs

### 1. Explicit local transport truth

The Microscope status now separates:
- source: OKX public market candles;
- transport: local Backend 127.0.0.1:8790.

If the canonical transport module is missing, candle loading fails closed with an explicit operator-visible error.

### 2. Timeout is no longer silent

A 12-second request deadline is now distinguished from a request replaced by a newer asset/interval request.

- superseded request: cancelled silently as before;
- real deadline: `OKX_LOCAL_TIMEOUT` is surfaced;
- the last valid series remains visible.

### 3. Strict OHLC validation

Candle parsing now rejects:
- null / undefined / blank OHLC values instead of coercing them to zero;
- incoherent high/low bounds;
- negative volume;
- a response that parses to zero usable candles.

### 4. Transport failure does not trigger a false EUR → USDC fallback

The historical EUR → USDC fallback remains available only for an OKX candle-series availability failure. A local Backend/network failure is reported as a transport failure instead of retrying the same dead transport under another instrument.

## Preserved

- canonical runtime: `js/market-microscope-candles.js`;
- eight independent indicator states;
- latest-request-wins / abort-previous-request behavior;
- MA/EMA full-history projection;
- S/R, Supertrend, Bollinger, SAR, VWAP, Volume Profile formulas unchanged;
- read-only / no real order;
- Market Core 38.15.11 unchanged.

## Firefox terrain proof

1. Backend 8790 available → Bougies must load in Classique, Intermédiaire and Administrateur.
2. Status must identify OKX as source and `LOCAL BACKEND 127.0.0.1:8790` as transport.
3. Stop Backend 8790 while a valid series is visible, then request refresh/interval:
   - explicit ATTENTION transport error;
   - last valid series remains visible;
   - no silent empty success.
4. Restart Backend 8790, explicit refresh:
   - candle load recovers;
   - no page reconstruction required.
5. Rapid BTC/ETH or 5m/15m changes:
   - obsolete request is cancelled;
   - only the latest request wins;
   - no false timeout is displayed.
6. Confirm Profondeur and Lecture Technique are unchanged.

Terrain remains **PENDING Firefox** until operator validation.
