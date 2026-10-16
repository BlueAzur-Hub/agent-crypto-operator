# Agent-Crypto Administrator 40.6.553 — TECHNICAL READING · NATIVE S/R WINDOW

Parent: 40.6.552  
Market Core: 38.15.11 — protected / unchanged

## Why this build exists

40.6.552 was rejected on Firefox for presentation.

The S/R function remained correct, but the custom glass disclosure looked like a foreign block inside Lecture Technique:
- too dark;
- too tall;
- title wrapped badly;
- summary text was too small;
- custom chevron duplicated a behavior that already exists natively.

40.6.553 deletes that presentation approach and reuses the native Technical Reading window language already used by Fiche active, Sources and Network.

## Changes

- the existing S/R supplement now uses the native `atlas-detail-subwindow` component;
- it is collapsed by default like the other Technical Reading windows;
- native summary structure:
  - title: Repères Support / Résistance;
  - compact line: active instrument · timeframe · S price · R price;
  - native Ouvrir / Réduire text;
  - native + / − affordance;
- no custom chevron;
- no custom dark glass shell;
- no `pivots visibles` or `repères locaux` in the compact summary;
- no warning/disclaimer copy in the summary;
- expanded content keeps only useful information:
  - Support price;
  - touches;
  - confidence;
  - distance;
  - Resistance price;
  - touches;
  - confidence;
  - distance;
- expanded explanation is plain language:
  - Support = zone where price recently rebounded or slowed its decline;
  - Resistance = zone where price recently stalled or slowed its rise;
  - Touches = observed reactions around the level.

## Explicitly unchanged

- S/R pivot algorithm;
- S/R prices;
- touch-count logic;
- chart S/R lines and button;
- MA / EMA;
- candle inspector;
- historical Lecture Technique business logic;
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

1. Open Build 40.6.553 · Administrator → Bougies.
2. Open Lecture Technique.
3. Confirm Repères Support / Résistance visually matches Fiche active and the other native windows.
4. Confirm the S/R window is compact and closed by default.
5. Confirm the compact line is readable: instrument · timeframe · S · R.
6. Open it and confirm Support / Resistance / touches / confidence / distance are readable.
7. Confirm the explanation is useful plain language, with no generic warning text.
8. Change timeframe and confirm the compact summary and details update.
9. Confirm chart S/R levels are unchanged from 40.6.551/552 for the same candle window.

Terrain remains pending until Christophe validates it in Firefox.
