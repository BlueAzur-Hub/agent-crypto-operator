# SEVEN HANDOFF — Agent-Crypto 40.6.523

Build: **40.6.523**
Parent: **40.6.522**
Release: **MARKET + FICHE USD OWNER REBIND**
Market Core: **38.15.11 protected**

## What 40.6.522 proved

PASS:
- USD default;
- Graphique USD;
- Oracle USD;
- Bougies BTC-USDC;
- Profondeur BTC/USDC (USDT fallback).

PARTIAL:
- Market price cells returned to EUR after live spot refresh;
- FICHE CRYPTO floating card remained partly EUR.

## Root cause

The remaining defects were not data failures.

Market:
`atlasPatchCurrentQuoteBox` is a late native EUR writer.

Fiche:
the visible card is `atlasMarketHelpDefinition` / `atlasPatchOpenMarketHelp`, not the previously projected detail grid.

## 40.6.523

The existing Market/Fiche presentation owner now owns those two missing paths.

No app.js edit.
No Market Core edit.
No business logic change.
No conversion.

## Terrain test

Ctrl+F5.

Expected under DISPLAY USD:

- Market BTC around the same USD domain as Graphique/Oracle, not ~75k EUR;
- ETH/BNB/XRP and other enriched rows show USD;
- FICHE CRYPTO shows only USD monetary presentation for active DISPLAY fields;
- no late EUR rewrite after refresh;
- Graphique / Oracle / Aether / Bougies / Profondeur unchanged.

Then click EUR and confirm reversible EUR presentation.

Do not create 40.6.524 unless Firefox proves a remaining owner defect.
