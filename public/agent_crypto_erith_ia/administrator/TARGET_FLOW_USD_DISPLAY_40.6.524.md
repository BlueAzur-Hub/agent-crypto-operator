# Agent-Crypto 40.6.524 — Target Top + Market Flow USD Display

Parent: **40.6.523**
Market Core: **38.15.11 — protected**
Scope: **Target Top 5 + Market Flow presentation only**

## Firefox evidence

With DISPLAY already on USD, Target Top still displayed BTC around the EUR domain (~75k €), while Oracle/Fiche/Depth were in the USD domain (~84k).

## Code audit

### Target Top 5

Native owner:

- `atlasRenderTopFiveRibbon()`
- `atlasPatchTickerSpot()`

Both write the visible price through `atlasCurrentQuotePriceText(quote)`.

The canonical current quote remains an EUR analysis quote by architecture, so the ribbon remained EUR even when DISPLAY was USD.

The second function is also a late writer: after spot refresh it can put EUR back into an already projected ribbon.

### Market Flow

Native owner:

- `atlasRenderMarketFlowRibbon()`

The code explicitly does:

- `coin.priceEur ?? coin.price`
- then `atlasFormatEUR(price)`

Therefore Market Flow never followed DISPLAY USD.

## 40.6.524 repair

New presentation-only owner:

`js/target-flow-display-406524.js`

Under DISPLAY USD it:

- uses explicit `coin.priceUsd` for Target Top;
- reprojects Target Top after `atlasPatchTickerSpot`;
- uses explicit `coin.priceUsd` for every Market Flow item;
- preserves source truth;
- returns to native EUR renderers when EUR is selected.

## Truth rules

No EUR→USD browser conversion.
No estimate from EUR.
Missing explicit USD => unavailable.

## Protected

Unchanged:

- app.js;
- Market Core 38.15.11;
- Market/Fiche 40.6.523 owner;
- Graphique;
- Oracle/Aether;
- Bougies;
- Profondeur;
- Strategy A;
- Backend / Bridge;
- EXEC BTC-EUR;
- SETTLE EUR.

## Firefox test

1. Ctrl+F5.
2. Confirm **Build 40.6.524 · Administrator**.
3. Confirm DISPLAY = USD.
4. Target Top 5:
   - BTC must be in the same USD domain as Oracle/Fiche;
   - ETH / BNB / XRP / SOL must be USD;
   - wait for spot refresh: no return to EUR.
5. Market Flow:
   - all available items must display USD;
   - no euro symbol while DISPLAY USD.
6. Click EUR:
   - Target Top + Market Flow return to EUR.
7. Confirm all previously validated owners remain unchanged.
