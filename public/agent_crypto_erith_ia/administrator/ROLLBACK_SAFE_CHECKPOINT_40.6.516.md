# Agent-Crypto 40.6.516 — Rollback Safe Checkpoint · Restore 40.6.513 Runtime

Parent: **40.6.515**  
Rollback runtime target: **40.6.513**  
Market Core: **38.15.11 — protected**

## Why

Firefox terrain invalidated both USD experiments:

- 40.6.514: USD selector active, but the canonical asynchronous Graphique owner repainted final EUR.
- 40.6.515: attempted owner handshake produced a mixed state: `PRIX USD` in the overlay while the axis stayed in EUR, the price curve disappeared, and the graph temporarily entered an unavailable state.

The correct action is therefore rollback, not another patch on top.

## Runtime restored

40.6.516 restores the validated 40.6.513 runtime ownership model:

- canonical Administrator entry rebuilt from the 40.6.513 entry;
- Quote Currency Architecture restored exactly to 40.6.513 behavior;
- default display returns to **EUR**;
- post-boot runtime restored from 40.6.513;
- Atlas presentation restored from 40.6.513;
- Global Quote Router 40.6.514 is not loaded;
- Graph Owner Handshake 40.6.515 is not loaded.

The failed files remain in repository history only.

## Protected

Unchanged:

- `app.js` human core;
- Market Core 38.15.11;
- Profondeur 40.6.513;
- Oracle;
- Aether;
- Lecture Technique;
- Strategy A business logic;
- Backend / Bridge;
- market data snapshots;
- wallet/private API/real orders.

## Firefox proof

1. Ctrl+F5 → Build **40.6.516**.
2. EUR must be active by default.
3. Graphique Prix must again show the price curve and volume together.
4. No mixed USD title with EUR axis.
5. No temporary graph unavailability caused by the rollback.
6. Period changes and Solo/Top must behave like the validated 40.6.513 baseline.
7. Bougies and Profondeur remain functional.
8. Do not resume global USD propagation until this rollback is explicitly validated.

## Stop

40.6.516 is a recovery checkpoint. No USD expansion belongs in this build.
