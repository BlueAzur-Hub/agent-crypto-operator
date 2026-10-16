# Agent-Crypto 40.6.518 — Market + Fiche USD Projection

Parent: **40.6.517 — Firefox PASS**  
Market Core: **38.15.11 — protected**  
Scope: **Market Snapshot + Fiche only**

## Purpose

40.6.518 is the first owner migration built on Currency Domain V2.

When DISPLAY = USD:

- Market price uses explicit `priceUsd`;
- Market Cap uses explicit `marketCapUsd`;
- Volume 24 h uses explicit `volume24hUsd`;
- the compact Fiche price uses explicit `priceUsd`;
- the expanded Fiche surfaces the explicit USD value and its source/freshness.

When DISPLAY = EUR, the existing canonical EUR Market rendering is restored.

## No conversion

40.6.518 never computes USD from EUR in the browser.

If an explicit USD field is missing, the USD surface displays unavailable rather than estimating it.

## Protected

Unchanged:

- `app.js` / Market Core 38.15.11;
- legacy EUR analysis truth;
- broker Spot;
- Graphique;
- Oracle / Math;
- Aether;
- Lecture Technique;
- Bougies;
- Profondeur;
- Strategy A / Evidence / Cost Gate;
- Backend / Bridge.

DISPLAY default remains **EUR**.  
ANALYSIS remains **EUR**.  
EXEC remains **BTC-EUR**.  
SETTLE remains **EUR**.

## Owner strategy

The module decorates only the existing Market/Fiche presentation owners and re-applies the selected DISPLAY currency after those owners render.

No polling timer and no MutationObserver are added.

## Firefox proof

1. Ctrl+F5 → **Build 40.6.518 · Administrator**.
2. EUR default must look like 40.6.517.
3. Click **USD**.
4. Market price, Market Cap and Volume must display USD values.
5. Compact Fiche label/value must become **Prix USD**.
6. Expanded Fiche must show an explicit USD value/source.
7. Graphique must remain EUR and intact.
8. Oracle, Aether, Bougies and Profondeur must remain unchanged.
9. Wait for Binance spot updates: Market must stay USD while DISPLAY = USD.
10. Click EUR: canonical EUR Market + Fiche must return cleanly.

## Stop

Any Graphique/Oracle/Aether/Depth/Candles change is a scope failure.
