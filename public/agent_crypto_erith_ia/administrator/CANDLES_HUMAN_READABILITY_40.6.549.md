# Agent-Crypto Administrator 40.6.549 — CANDLES · HUMAN READABILITY

Parent: 40.6.548  
Market Core: 38.15.11 — protected / unchanged

## Why this build exists

40.6.548 proved that the candle inspector foundation is present, but Firefox operator feedback rejected the UX: the tooltip and chart annotations were technically present yet too small and too cryptic to be comfortably readable.

40.6.549 changes presentation only. It does not add a trading indicator or a second chart engine.

## Changes

- replaces the tiny moving OHLCV tooltip with a fixed, large selected-candle inspector;
- uses full French labels: Ouverture, Plus haut, Plus bas, Clôture, Variation, Volume;
- keeps the selected candle values visible after the pointer leaves the canvas;
- increases price-axis and time-label readability;
- widens candle bodies and strengthens wicks;
- reduces the default visible window from 120 to 72 candles so the chart is readable before zooming;
- replaces H / L abbreviations with PLUS HAUT / PLUS BAS markers;
- simplifies the bottom state line while preserving provider, freshness, interval and read-only truth;
- preserves MA and EMA toggles exactly as the existing indicator foundation.

## Explicitly not added

- Support / Résistance interpretation;
- Supertrend;
- Bollinger;
- SAR;
- VWAP;
- Volume Profile;
- order execution;
- OKX private account access.

## Protected / unchanged

- Market Core 38.15.11;
- Profondeur;
- Lecture Technique;
- Fiche Latérale;
- New Listings and logo memory;
- USD architecture and price pipeline;
- Strategy A / Aether / Web Classique.

## Firefox terrain proof required

1. Open Build 40.6.549 · Administrator → Bougies.
2. Confirm the selected-candle inspector is immediately readable without decoding O/H/L/C.
3. Confirm PLUS HAUT / PLUS BAS and price axis are readable.
4. Confirm candle bodies are easier to distinguish at default zoom.
5. Toggle MA and EMA.
6. Test 15m → 1h → 4h.
7. Test one New Listing → Bougies.
8. Confirm Profondeur / Lecture Technique / Fiche / Market remain unchanged.

Terrain remains pending until Christophe validates it in Firefox.
