# Agent-Crypto 40.6.515 — Graph Owner Handshake · USD Commit After Render

Parent: **40.6.514**  
Market Core: **38.15.11 — protected**

## Terrain defect proven on 40.6.514

Firefox proof showed:

- USD selector active;
- Bougies correctly routed to a USD/USDC scale;
- main Graphique final render returned to **PRIX EUR / Binance EUR / €** after its asynchronous history owner committed;
- Oracle remained EUR by design because it was outside 40.6.514 scope;
- Profondeur remained EUR by design and stays protected.

40.6.514 therefore passed CI but failed the final Graphique USD terrain proof.

## 40.6.515 repair

The fix is architectural, not a timer:

1. before a canonical graph owner renders, Global Quote Router restores the owner-native EUR state;
2. the canonical owner commits its normal render;
3. after that owner settles, the selected DISPLAY currency is committed again;
4. stale owner settlements are ignored through the router owner epoch.

Covered graph owners:

- `atlasRenderChartResult`;
- `atlasChartV2RedrawFromBroker`;
- `renderComparisonAnalystPanel`;
- `atlasScannerRun`;
- `atlasExternalChartRender` when present.

No polling loop and no MutationObserver are introduced.

## Hard separation

- DISPLAY default = USD;
- EXEC = BTC-EUR unchanged;
- SETTLE = EUR unchanged.

## Protected

Unchanged:

- `app.js` human core;
- Market Core 38.15.11;
- Oracle;
- Aether;
- Lecture Technique logic;
- Strategy A business logic / gates;
- Profondeur 40.6.513 geometry and EUR-native contract;
- Backend / Bridge;
- storage schema;
- wallet/private API/real orders.

## Firefox proof required

1. Ctrl+F5 → **Build 40.6.515**.
2. USD must be active.
3. In **Prix / Solo**, wait for history load to finish: final visible state must stay **PRIX USD** and dollar values.
4. Change 24h/7j/30j: each completed owner render must finish in USD.
5. Switch Prix ↔ Base100 ↔ Prix and Normal ↔ Log: USD must reapply after the broker redraw; Base100 remains unitless.
6. Test Solo / Top comparison / reset.
7. Toggle EUR: native EUR must return exactly. Toggle USD again: USD must reapply.
8. Bougies USD/USDC must stay functional.
9. Oracle may still be EUR in this build: it is not part of 40.6.515.
10. Profondeur .513, Market Core, Strategy, Aether and Lecture Technique must remain unchanged.

## Stop

If Graphique passes, only then widen USD coverage to Oracle/Market/Aether in a later build.
