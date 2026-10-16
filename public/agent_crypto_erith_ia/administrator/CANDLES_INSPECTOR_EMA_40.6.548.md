# Agent-Crypto Administrator 40.6.548 — Candles Inspector + EMA Foundation

Parent: 40.6.547  
Market Core: 38.15.11 — protected / unchanged  
Owner: `administrator/js/market-microscope-candles-406498.js`

## Purpose

Enrich the already validated **Bougies** surface without creating a second chart engine and without modifying Market Core, New Listings, Fiche Latérale, Profondeur or trading/order logic.

40.6.548 is the first incremental layer of the Trading Desk chart work.

## Additions

- vertical + horizontal crosshair;
- live pointer price label on the y-axis;
- existing OHLCV tooltip enriched with candle change percentage;
- visible-range factual **H / L** markers;
- latest-candle **FRESH / STALE / UNKNOWN** truth state based on the selected candle interval;
- indicator toolbar:
  - **MA** = MA5/10/20, default ON;
  - **EMA** = EMA5/10/20, default OFF;
- toolbar remains horizontal/scrollable on narrow screens.

## Explicitly not added

This build does **not** infer support/resistance, Supertrend, Bollinger, SAR, VWAP or Volume Profile. Those remain later isolated layers after Firefox proof.

## Protected behavior

- OKX public candles remain the native source;
- New Listings keep their provider reuse path from 40.6.529;
- no recurring timer;
- no MutationObserver;
- no storage writer;
- no account API;
- no order, buy or sell path;
- no Market Core change;
- no changes to Lecture Technique or Profondeur.

## Firefox proof

1. Ctrl+F5 and confirm **Build 40.6.548 · Administrator**.
2. Open **Bougies** on BTC.
3. Move the pointer over the chart:
   - vertical and horizontal crosshair must appear;
   - y-axis price tag must follow;
   - tooltip must show date + O/H/L/C + Δ + Volume.
4. Confirm visible **H** and **L** markers.
5. Toggle **EMA** on/off; MA must remain independently toggleable.
6. Change 15m → 1h → 4h and verify the state line remains coherent.
7. Test one New Listing in Bougies to ensure the existing external-provider path still works.
8. No interaction should alter Market Core, Fiche Latérale or Profondeur.

Status: PENDING FIREFOX.
