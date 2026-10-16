# Agent-Crypto Administrator 40.6.556 — CANDLES · SUPERTREND OPT-IN

Parent: 40.6.555  
Market Core: 38.15.11 — protected / unchanged

## Terrain checkpoint inherited

40.6.555 is now recorded as PASS Firefox terrain:
- Support / Resistance prices are readable;
- numeric values dominate the unit and context;
- the native Technical Reading S/R window remains approved.

## Single responsibility

40.6.556 adds one indicator only: Supertrend.

### Operator control

- new `SUPER` button beside MA / EMA / S/R;
- OFF by default;
- no persistence owner;
- no timer;
- no observer;
- no network request.

### Calculation

- method: Wilder ATR Supertrend;
- ATR period: 10;
- multiplier: 3;
- calculation uses only the candle rows already loaded by Market Microscope;
- no new data source.

### Rendering

- existing candle canvas is reused;
- rising and falling Supertrend segments are visually distinct;
- compact legend shows `SUPER ↑` and `SUPER ↓`;
- visible price scale includes the Supertrend values only while SUPER is enabled.

## Explicitly unchanged

- MA 5/10/20;
- EMA 5/10/20;
- Support / Resistance algorithm and values;
- Technical Reading;
- Profondeur;
- Market;
- Fiche Latérale;
- New Listings;
- USD architecture;
- data providers;
- order path;
- Market Core 38.15.11.

No Bollinger, SAR, VWAP or Volume Profile is added in this build.

## Firefox terrain proof required

1. Open Build 40.6.556 · Administrator → Bougies.
2. Confirm SUPER is OFF by default.
3. Click SUPER.
4. Confirm a Supertrend line appears on the existing candles.
5. Confirm rising/falling segments are easy to distinguish.
6. Switch 5m → 15m → 1h and verify the line recomputes without opening a second graph.
7. Disable SUPER and confirm the graph returns to the validated .555 presentation.
8. Confirm S/R and Lecture Technique remain unchanged.

Terrain remains pending until Christophe validates it in Firefox.
