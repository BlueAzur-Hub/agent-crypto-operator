# Agent-Crypto Administrator 40.6.554 — TECHNICAL READING · S/R PRICE PRIORITY

Parent: 40.6.553  
Market Core: 38.15.11 — protected / unchanged

## Why this build exists

40.6.553 fixed the window architecture by reusing the native Technical Reading component, but Firefox feedback showed a wrong visual hierarchy inside the opened S/R window:

- the important information is the Support / Resistance price;
- the price was too small;
- "1 touche · indicatif · écart 0.02 %" looked like diagnostic jargon and competed with the price;
- "confirmé" was especially ambiguous and not useful to display.

40.6.554 changes information hierarchy only.

## Changes

### Primary cards
Support and Resistance cards now show only:
- label;
- large dominant price in USDC.

### Secondary context
A separate "Contexte des niveaux" box below the two prices explains only:
- Support: Testé N fois · prix actuel à X % du niveau;
- Résistance: Testée N fois · prix actuel à X % du niveau.

The UI no longer displays "indicatif", "confirmé" or "fort".

## Explicitly unchanged

- S/R pivot algorithm;
- S/R prices;
- touch counts;
- internal confidence computation;
- chart S/R lines and button;
- native Technical Reading window;
- compact collapsed summary;
- MA / EMA;
- candle inspector;
- Market Core 38.15.11;
- data sources;
- Profondeur;
- Fiche Latérale;
- New Listings;
- USD architecture.

## Firefox terrain proof required

1. Open Build 40.6.554 · Administrator → Bougies → Lecture Technique.
2. Open Repères Support / Résistance.
3. Confirm Support and Resistance prices are the dominant information.
4. Confirm no "indicatif / confirmé / fort" wording is displayed.
5. Confirm the secondary context is separated below the prices.
6. Confirm wording is understandable without decoding jargon.
7. Confirm collapsed summary remains compact.
8. Confirm chart S/R values are unchanged for the same candle window.

Terrain remains pending until Christophe validates it in Firefox.
