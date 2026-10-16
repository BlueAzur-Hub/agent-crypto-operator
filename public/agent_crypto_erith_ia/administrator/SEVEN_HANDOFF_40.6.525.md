# SEVEN HANDOFF — Agent-Crypto 40.6.525

Build: **40.6.525**
Parent: **40.6.524**
Release: **FICHE USD DE-DUP + EUR SYMMETRY**

## Remaining proven defect

FICHE CRYPTO duplicated the same USD price twice under DISPLAY USD.

## Repair

USD:
- Prix affichage USD
- Source USD + freshness
- Capitalisation USD
- Volume USD

EUR:
- Prix direct EUR
- Prix USD marché
- Capitalisation EUR
- Volume EUR

## Depth

Do not modify.

The BTC/EUR stale 16 s warning shown during the switch recovered by itself without operator action. The 15 s safety gate is therefore retained exactly as-is.

## Terrain

Ctrl+F5 → 40.6.525.

Test USD → EUR → USD → EUR on one BTC Fiche.
No duplicated USD price.
No asymmetric stale label/value after return.

Do not create 40.6.526 unless Firefox proves another owner defect.
