# SEVEN HANDOFF — Agent-Crypto Administrator 40.6.517

## Canonical build

Build: **40.6.517**  
Release: **CURRENCY DOMAIN V2 · ADDITIVE CONTRACT ONLY**  
Parent: **40.6.516**  
Market Core: **38.15.11 — protected**

## What changed

A new pure module defines explicit currency contracts without touching current owners:

- QuoteValue;
- QuoteBundle;
- CurrencyContext;
- currency-aware chart storage/context key helpers.

## What did not change

- DISPLAY default remains EUR;
- ANALYSIS remains EUR;
- EXEC remains BTC-EUR;
- SETTLE remains EUR;
- app.js unchanged;
- quote.price remains legacy EUR;
- spot.usd is not wired yet;
- Graphique is not migrated;
- Oracle/Aether are not migrated;
- Bougies/Profondeur remain their own instrument owners;
- failed .514/.515 mechanisms remain unloaded.

## Next build only after Firefox PASS

40.6.518 may wire Market + Fiche presentation to existing EUR/USD values.

Do not begin Graphique USD in 40.6.518.

## Method

contract → proof → one owner → proof → stop.
