# Agent-Crypto Administrator 40.6.551 — CANDLES · SUPPORT / RÉSISTANCE

Parent: 40.6.550  
Market Core: 38.15.11 — protected / unchanged

## Why this build exists

40.6.550 is accepted on Firefox for candle readability. The next planned responsibility is Support / Résistance, connected to Lecture Technique without rewriting its historical owner.

40.6.551 adds one analytical layer only: local S/R reference zones from the already loaded candle window.

## Method

- scans visible candles with a local pivot window of 2 bars on each side;
- clusters nearby pivot lows into support candidates and nearby pivot highs into resistance candidates;
- prefers the nearest useful level around the current close, while favouring repeated touches when distances are close;
- exposes touch count and a confidence word:
  - 3+ touches: fort;
  - 2 touches: confirmé;
  - 1 touch: indicatif;
- if no clustered pivot exists on one side, the visible extreme can be used as an explicitly indicative fallback;
- these are heuristic local reference zones, not market certainty and not an execution signal.

## Chart

- new S/R toggle in the existing indicator toolbar;
- support line shows S + price + touch count;
- resistance line shows R + price + touch count;
- existing MA / EMA / inspector / human precision remain unchanged.

## Lecture Technique bridge

40.6.551 does not replace or mutate the historical Lecture Technique owner.

It inserts one read-only supplement directly below the existing compact strip:
- Support;
- Résistance;
- price;
- touches;
- confidence;
- distance from current price;
- active instrument and candle timeframe;
- explicit heuristic/read-only disclaimer.

The bridge also emits `agent-crypto:candles-technical-levels` only when the level signature changes, for later consumers without timer or observer.

## Explicitly not added

- Supertrend;
- Bollinger;
- SAR;
- VWAP;
- Volume Profile;
- order execution;
- private OKX account access.

## Protected / unchanged

- Market Core 38.15.11;
- Profondeur;
- historical Lecture Technique business logic;
- Fiche Latérale;
- New Listings discovery and logo memory;
- USD architecture and price pipeline;
- Strategy A / Aether / Web Classique.

## Firefox terrain proof required

1. Open Build 40.6.551 · Administrator → Bougies.
2. Confirm S/R button is visible and active.
3. Confirm one support and one resistance line are readable when available.
4. Confirm line labels expose price + touch count.
5. Toggle S/R OFF then ON.
6. Confirm Lecture Technique shows the same levels, timeframe and distances.
7. Switch 5m → 15m → 1h and confirm the levels recompute with the timeframe.
8. Test MA + EMA + S/R together.
9. Test one New Listing → Bougies.
10. Confirm Profondeur / Fiche / Market remain unchanged.

Terrain remains pending until Christophe validates it in Firefox.
