# Agent-Crypto 40.6.497 — QUOTE CURRENCY ARCHITECTURE

Parent: **40.6.496**  
Market Core: **38.15.11 — protected**

## Scope
Additive presentation/routing contract separating:
- `displayCurrency` = EUR or USD;
- `executionInstrument` = BTC-EUR (unchanged);
- `settlementAsset` = EUR (unchanged).

Changing the display selector never changes the execution instrument or settlement asset.

## Protections
No graph algorithm, Strategy A, threshold, Cost Gate, Oracle, Math, Risk, PAPER, Bridge, Backend, storage schema, recurring timer, MutationObserver, wallet, private API or real order is changed.

## Terrain
Ctrl+F5 → Crypto graph → toggle EUR/USD → verify DISPLAY changes while EXEC remains BTC-EUR and SETTLE remains EUR.