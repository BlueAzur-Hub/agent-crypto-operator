# Agent-Crypto 40.6.105 — TRADUS / Strategy A Comparison Truth

Parent: 40.6.104  
Engine: Market Core 38.15.11 (unchanged)

## Scope

Correct one reproduced read-side inconsistency in the TRADUS shadow panel: a frozen Strategy A snapshot could continue to display `Strategy A OFF / NON COMPARABLE` while the current Strategy A lane was visibly active and reporting `NO TRADE`.

## Reproduced evidence

The Administrator 40.6.103 full report simultaneously showed:

- Strategy A: `AUTO A ACTIF`, `Décision NO TRADE`, phase `NO TRADE`.
- TRADUS: `Strategy A OFF`, `Comparaison NON COMPARABLE`, `A OFF · TRADUS SELL`.

The TRADUS adapter stored Strategy A at the moment of its last Binance depth refresh and rendered that frozen copy until another TRADUS/market refresh.

## Correction

New read-side reconciliation layer: `js/tradus-strategy-a-reconcile-406105.js`.

- Reads current Strategy A directly from its existing UI truth.
- Reads the existing TRADUS observation without performing another fetch.
- If TRADUS is fresh (<=15 s), recomputes only the displayed comparison from current Strategy A + the existing TRADUS signal.
- If TRADUS is stale/unknown, comparison fails closed to `À RAFRAÎCHIR` rather than comparing a stale directional signal with current Strategy A.
- Does not mutate the TRADUS adapter snapshot, shadow ledger, Strategy A, Paper state or market data.
- Triggered only by bounded existing events/actions; no recurring timer and no MutationObserver.

## Protected

- Market Core 38.15.11 unchanged.
- Web Classic, Graphique, Lecture Technique unchanged.
- Aether business truth unchanged.
- Atlas CURRENT and Oracle unchanged.
- Strategy A business logic, lifecycle, Paper V2 and ledgers unchanged.
- TRADUS market fetch owner unchanged (`tradus-shadow-adapter.js`).
- No new fetch, timer, observer, storage owner, wallet, key or real order path.

## Acceptance

1. Administrator loads as Build 40.6.105.
2. With Strategy A `NO TRADE` and a fresh TRADUS SELL, the panel reads Strategy A `NO TRADE` and comparison `DIVERGENCE`, not `OFF / NON COMPARABLE`.
3. A TRADUS observation older than 15 s displays `À RAFRAÎCHIR` and does not assert a directional comparison.
4. Existing TRADUS refresh remains the only book-network owner.
5. Static self-test is 4/4; Version Truth and Version Delivery guards pass; Firefox terrain proof closes the build.
