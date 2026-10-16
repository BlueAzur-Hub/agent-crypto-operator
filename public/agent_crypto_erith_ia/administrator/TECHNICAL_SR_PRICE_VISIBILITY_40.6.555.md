# Agent-Crypto Administrator 40.6.555 — TECHNICAL READING · S/R PRICE VISIBILITY

Parent: 40.6.554  
Market Core: 38.15.11 — protected / unchanged

## Terrain finding

40.6.554 fixed the information structure, but Firefox terrain proof shows that the actual Support / Resistance prices are still too small in the narrow Technical Reading panel.

The source confirms why: 40.6.554 only raised the price typography from 10px to 14px. That does not satisfy the operator goal of making the price immediately readable.

## Single responsibility

40.6.555 changes only S/R price typography inside the existing native Technical Reading S/R window.

### Primary cards

- keep the existing Support / Resistance cards;
- separate the numeric value from the USDC unit;
- render the numeric value at 22px and weight 950;
- keep USDC secondary at 8.5px;
- slightly increase card height to preserve breathing room.

### Secondary context

Unchanged:

- Contexte des niveaux;
- Testé / Testée N fois;
- prix actuel à X % du niveau.

## Explicitly unchanged

- S/R pivot algorithm;
- S/R values;
- touch counts;
- confidence computation;
- chart S/R lines and button;
- native Technical Reading component;
- collapsed summary;
- MA / EMA;
- candle inspector;
- Market Core 38.15.11;
- data sources;
- Profondeur;
- Fiche Latérale;
- New Listings;
- USD architecture.

No Supertrend, Bollinger, SAR, VWAP or Volume Profile is added.

## Firefox terrain proof required

1. Open Build 40.6.555 · Administrator → Bougies → Lecture Technique.
2. Open Repères Support / Résistance.
3. The Support and Resistance numbers must be readable immediately without leaning into the panel.
4. The numeric value must clearly dominate both its USDC unit and the Context box.
5. Context wording remains below and does not compete visually.
6. Collapsed summary and chart S/R values remain unchanged.

Terrain remains pending until Christophe validates it in Firefox.
