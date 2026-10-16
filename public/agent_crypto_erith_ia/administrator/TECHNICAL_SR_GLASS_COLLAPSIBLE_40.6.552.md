# Agent-Crypto Administrator 40.6.552 — TECHNICAL READING · S/R GLASS COLLAPSIBLE

Parent: 40.6.551  
Market Core: 38.15.11 — protected / unchanged

## Why this build exists

40.6.551 passed functionally in Firefox:
- S/R lines are visible on the candle chart;
- the same levels appear in Lecture Technique;
- the read-only heuristic wording is correct.

Operator feedback identified presentation debt only:
- the Support / Résistance block in Lecture Technique is too opaque compared with the surrounding cells;
- the block should be collapsible.

40.6.552 is therefore a presentation-only polish of the existing S/R bridge.

## Changes

- converts the existing S/R supplement inside Lecture Technique from a static section into a native `<details>` disclosure;
- open by default;
- collapsible with one click;
- collapsed state keeps a compact line:
  - active instrument + timeframe;
  - Support price;
  - Resistance price;
  - compact confidence wording;
- outer background opacity is reduced to match the surrounding glass cells;
- Support and Resistance cards use lighter translucent glass backgrounds;
- keeps the background artwork visible through the panel;
- no storage persistence is added for open/closed state;
- no timer, observer or new owner is added.

## Explicitly unchanged

- S/R pivot algorithm;
- S/R levels and touch-count logic;
- chart lines and S/R button;
- historical Lecture Technique business logic;
- MA / EMA;
- candle inspector;
- data sources;
- Market Core 38.15.11;
- Profondeur;
- Fiche Latérale;
- New Listings;
- USD architecture;
- Strategy A / Aether / Web Classique.

## Explicitly not added

- Supertrend;
- Bollinger;
- SAR;
- VWAP;
- Volume Profile;
- order execution;
- private OKX account access.

## Firefox terrain proof required

1. Open Build 40.6.552 · Administrator → Bougies.
2. Confirm S/R levels remain identical to 40.6.551 for the same window.
3. Open Lecture Technique.
4. Confirm the S/R block is visibly more transparent than 40.6.551.
5. Collapse the S/R block.
6. Confirm the compact summary still exposes S and R.
7. Re-open the block.
8. Change timeframe and confirm the content updates while remaining collapsible.
9. Confirm Profondeur / Fiche / Market remain unchanged.

Terrain remains pending until Christophe validates it in Firefox.
