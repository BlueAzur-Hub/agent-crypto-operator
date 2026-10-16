# SEVEN HANDOFF — Agent-Crypto 40.6.521

Build: **40.6.521**
Release: **OKX DEPTH MULTI-QUOTE · USD→USDC/USDT TRUTH**
Parent: **40.6.520**

## Migrated

Profondeur / Carnet now follows the presentation domain by changing its **real source instrument**.

EUR stays EUR.

USD presentation selects a native stablecoin orderbook:
1. USDC preferred;
2. USDT fallback.

The UI never writes USD when the exchange instrument is USDC or USDT.

## Already covered before this build

- Market/Fiche: 40.6.518;
- Oracle/Aether/Lecture price presentation: 40.6.519;
- Graphique native USD source: 40.6.520;
- Bougies already use USDC when DISPLAY=USD.

## Remaining destination

After 40.6.521, the remaining planned user destination is:
**USD as default DISPLAY**, with EUR still operator-selectable.

That should be a separate build so default-policy change is not mixed with the Depth source migration.
