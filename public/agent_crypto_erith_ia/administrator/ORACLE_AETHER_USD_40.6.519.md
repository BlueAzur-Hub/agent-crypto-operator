# Agent-Crypto 40.6.519 — Oracle + Aether USD Presentation

Parent: **40.6.518**  
Market Core: **38.15.11 — protected**  
Scope: **Oracle presentation + Aether presentation only**

## Purpose

Continue the owner-by-owner USD migration without reintroducing a global router.

When DISPLAY = USD:

- Oracle's visible asset price uses explicit `priceUsd`;
- Oracle math/model/evidence remains EUR;
- Aether's BTC market brief uses explicit `priceUsd`;
- Aether Attention/System BTC uses explicit `priceUsd`.

When DISPLAY = EUR, the existing EUR presentation remains canonical.

## No conversion

40.6.519 never derives USD from EUR in the browser.

If explicit USD is unavailable, the USD price is shown as unavailable.

## Aether owner change

`js/aether.js` is modified only at the two BTC monetary presentation points:

- `aetherMarketBrief()`;
- `aetherBtc()`.

A passive quote-architecture event causes a synchronous Aether repaint. It does not trigger a new network fetch.

## Oracle owner change

`app.js` remains byte-for-byte unchanged.

A small post-owner module wraps only `atlasRenderOracleV0()` and projects the already-rendered visible price. The Oracle model, math, evidence and calibration continue to use EUR.

## Protected

- `app.js` / Market Core 38.15.11;
- Market + Fiche 40.6.518;
- Graphique;
- Lecture Technique;
- Bougies;
- Profondeur;
- Strategy A / Evidence / Cost Gate;
- Backend / Bridge.

## Firefox proof

1. Ctrl+F5 → **Build 40.6.519 · Administrator**.
2. EUR default remains unchanged.
3. Click USD.
4. Oracle BTC price must display USD.
5. Aether BTC price/brief must display USD.
6. Oracle forces, confidence, regime and evidence must remain unchanged.
7. Graphique must remain EUR and intact.
8. Market/Fiche remain on their 40.6.518 behavior.
9. Bougies/Profondeur remain their native instrument owners.
10. Click EUR → Oracle + Aether return to EUR cleanly.

## Stop

Any Oracle math/evidence or Graphique mutation is a scope failure.
