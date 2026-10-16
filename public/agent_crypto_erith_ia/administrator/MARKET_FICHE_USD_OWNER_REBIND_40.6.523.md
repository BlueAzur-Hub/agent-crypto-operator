# Agent-Crypto 40.6.523 — Market + Fiche USD Owner Rebind

Parent: **40.6.522**
Market Core: **38.15.11 — protected**
Scope: **Market Snapshot + FICHE CRYPTO presentation only**

## Firefox evidence from 40.6.522

DISPLAY was correctly **USD**, and Graphique / Oracle / Bougies / Profondeur were already coherent.

Two remaining defects were visible:

1. Market rows such as BTC / ETH / BNB / XRP still displayed EUR prices.
2. FICHE CRYPTO · MARKET SNAPSHOT still displayed:
   - Prix direct EUR;
   - EUR capitalization;
   - EUR volume.

Market capitalization / volume in the table were already USD. This proved that the 40.6.518 projection was running only partially.

## Code audit

### Root cause 1 — late Market price overwrite

The native Market path calls `atlasPatchCurrentQuoteBox(...)` during spot refresh.

That function writes the canonical EUR direct quote into the Market price box after the USD presentation decorator has run.

Therefore the row can momentarily be projected to USD and later return to EUR.

### Root cause 2 — wrong Fiche owner targeted

40.6.518 projected:
- compact detail strip;
- asset detail grid.

The visible floating card in Firefox is a different owner:

- `atlasMarketHelpDefinition`
- `atlasPatchOpenMarketHelp`

That card was still built with explicit EUR markup.

## 40.6.523 repair

The existing owner `js/market-fiche-display-406518.js` is repaired instead of adding a new global layer.

It now:

- rebinds the Market price box after `atlasPatchCurrentQuoteBox`, but only when the box is inside `#marketRows`;
- uses explicit `priceUsd` for DISPLAY USD;
- projects the FICHE CRYPTO definition before insertion;
- reprojects an already-open Fiche after native live refresh;
- projects Market Cap / Volume from explicit USD fields;
- restores EUR when the operator selects EUR.

## Truth rules

No browser EUR→USD conversion.
No USD estimate from EUR.
Missing explicit USD data => unavailable.

USDC / USDT remain distinct from USD.

## Protected owners

Unchanged:

- app.js;
- Market Core 38.15.11;
- Graphique;
- Oracle / Aether;
- Bougies;
- Profondeur;
- Strategy A;
- Backend / Bridge;
- execution BTC-EUR;
- settlement EUR.

## Firefox test

1. Ctrl+F5.
2. Confirm **Build 40.6.523 · Administrator**.
3. Confirm DISPLAY starts in **USD**.
4. Open Market:
   - BTC / ETH / BNB / XRP prices must be USD when explicit USD exists;
   - no late return to EUR after live refresh.
5. Open FICHE CRYPTO:
   - Prix affichage USD;
   - Prix USD marché;
   - Capitalisation USD;
   - Volume 24 h USD.
6. Confirm Graphique / Oracle / Bougies / Profondeur remain unchanged.
7. Click EUR:
   - Market + Fiche return to EUR presentation;
   - EXEC remains BTC-EUR;
   - SETTLE remains EUR.

Firefox decides the terrain PASS.
