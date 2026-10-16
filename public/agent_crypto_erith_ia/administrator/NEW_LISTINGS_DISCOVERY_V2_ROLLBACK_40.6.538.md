# Agent-Crypto 40.6.538 — NEW LISTINGS · DISCOVERY V2 ROLLBACK

Parent: **40.6.537**  
Rollback target behavior: **40.6.536**  
Market Core: **38.15.11 — protected / unchanged**

## Terrain failure that triggered the rollback

40.6.537 is rejected after Firefox proof:
- OKX `listTime` classified historical assets such as BTC / ETH / USDC as "new";
- OKX rows entered the native category without a complete ticker path, producing missing price / change / volume;
- Concrete / CT, already valid in 40.6.536, was degraded by the discovery V2 layer.

## Rollback

The canonical owner:

`administrator/js/new-listings-native-category.js`

is restored **byte-for-byte** from the validated 40.6.536 parent commit:

`2f4141ba76b3260a01d1bef0cd78a910e59639cc`

Expected Git blob SHA:

`f3d3105437fe754bbd1521ca1b3db2602c699704`

This restores:
- Bitget SPOT `launchTime` discovery <= 30 days;
- valid Bitget ticker / price / volume path;
- Concrete / CT analysis route through OKX CT/USDT;
- native Fiche / Graphique / Bougies / Profondeur reuse;
- Reset back to BTC.

## Removed from active runtime

- OKX `listTime` discovery;
- cross-provider discovery merge;
- 40.6.537 live-discovery V2 behavior.

## Protection

No Market Core change.  
No Graphique / Scanner reconstruction.  
No Strategy, Oracle business logic, Aether or Web Classique change.  
No timer, observer, storage owner, wallet, private API or real order.

## Firefox proof

1. Ctrl+F5 → **Build 40.6.538 · Administrator**.
2. Open **Nouveaux listings**.
3. Prices / 24 h / volume must be populated as in 40.6.536.
4. BTC / ETH / USDC must not appear as false "new listings" due to OKX `listTime`.
5. Select **CT** → existing Graphique.
6. **Réinit.** → BTC · Solo · 24 h.

PASS → freeze 40.6.538 as the rollback checkpoint.
