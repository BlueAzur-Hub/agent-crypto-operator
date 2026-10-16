# Agent-Crypto Administrator 40.6.550 — CANDLES · READABILITY POLISH

Parent: 40.6.549  
Market Core: 38.15.11 — protected / unchanged

## Why this build exists

40.6.549 validated the human-readable candle inspector on Firefox, but the surrounding chart still showed presentation debt:
- PLUS HAUT could collide visually with the inspector area;
- the old canvas MA/EMA legend was partially hidden and ambiguous;
- crosshair and price-axis values could expose unnecessary decimal precision.

40.6.550 is presentation polish only. It adds no trading indicator and no second chart engine.

## Changes

- derives the chart top padding from the actual inspector and MA/EMA legend geometry, so the plot never starts underneath those overlays;
- clamps PLUS HAUT / PLUS BAS labels inside the usable plot area;
- replaces the old canvas legend with a dedicated DOM legend:
  - MA5 / MA10 / MA20;
  - EMA5 / EMA10 / EMA20;
  - each with its exact series color;
- applies adaptive price precision:
  - large-price assets such as BTC use human-scale decimals;
  - lower-priced assets retain the precision they need;
- preserves the 72-candle default viewport and the larger candle bodies from 40.6.549.

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

1. Open Build 40.6.550 · Administrator → Bougies.
2. Confirm inspector remains readable.
3. Confirm PLUS HAUT / PLUS BAS never overlap the inspector or legend.
4. Confirm MA5/10/20 and EMA5/10/20 are individually identifiable by the DOM legend.
5. Hover the chart: crosshair price should use human-scale precision.
6. Test MA only, EMA only, MA+EMA.
7. Test 15m → 1h → 4h.
8. Test one New Listing → Bougies.
9. Confirm Profondeur / Lecture Technique / Fiche / Market remain unchanged.

Terrain remains pending until Christophe validates it in Firefox.
