# SEVEN HANDOFF — Agent-Crypto 40.6.524

Build: **40.6.524**
Parent: **40.6.523**
Release: **TARGET TOP + MARKET FLOW USD DISPLAY**
Market Core: **38.15.11 protected**

## Proven remaining owners

### Target Top 5
The ribbon price still used the canonical EUR quote:
- atlasRenderTopFiveRibbon
- atlasPatchTickerSpot

### Market Flow
The ribbon explicitly used:
- coin.priceEur / coin.price
- atlasFormatEUR

## Repair

A new presentation-only owner projects both ribbons from explicit `priceUsd` when DISPLAY is USD.

Target Top is reprojected after the late spot writer, so it must not fall back to EUR after refresh.

EUR remains reversible.

No conversion.
No app.js edit.
No Market Core edit.

## Terrain

Ctrl+F5 → **40.6.524**.

Expected:
- Target Top = USD;
- Market Flow = USD;
- no late EUR rewrite;
- Fiche/Market/Graph/Oracle/Bougies/Depth unchanged;
- EUR button restores both ribbons to EUR.

Do not create 40.6.525 unless Firefox proves another owner defect.
