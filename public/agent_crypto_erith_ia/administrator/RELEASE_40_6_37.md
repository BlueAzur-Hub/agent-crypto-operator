# Agent-Crypto 40.6.37 — AETHER GRAPH-FIRST LAZY HYDRATION · INTERACTION-ON-DEMAND LOCK

Parent: **40.6.36**  
Market Core: **38.15.11 — protected**  
Generated: **2026-09-08T20:49:32Z**

## Why
Firefox inspection of 40.6.36 confirms the Observatory presentation is close to final, but Aether still performs an eager `refreshAether(force:true)` at DOMContentLoaded. That starts Aether synthesis, local system telemetry, weather and the existing News Sentinel wake while the market graph is still reaching its first useful paint.

## 40.6.37 contract
- The market/graph remains the first useful workload.
- Aether binds controls at DOMContentLoaded but performs no eager heavy refresh.
- Existing `atlasAfterLivecheck` becomes the graph/market completion signal; only after it settles does Aether paint its core and schedule secondary hydration during browser idle time.
- System + weather hydrate after market readiness.
- The existing News Sentinel owner is woken only after Aether core/system scheduling, never before the graph.
- Aether panel still opens immediately on explicit user intent using currently available data.
- Full History rows are materialized only when `Historique` is clicked.
- Explanatory Details are materialized only when `Détails` is clicked.
- `Vue` remains the default focus.
- The historical public `AgentCryptoAether.refresh()` API remains explicit/immediate for manual diagnostics.

## Protected
- Market Core 38.15.11 unchanged.
- Graph runtime itself unchanged: Aether only listens to the existing completion owner.
- Oracle runtime semantics unchanged.
- 40.6.36 painted-lane CSS unchanged.
- Exact Observatory artwork unchanged (SHA-256 `5c4d61e9410d4a701372e2d30640d6523938dfe603f65902d493b354c5f2e7b2`).
- No recurring timer, MutationObserver, storage owner, new fetch owner or automatic/real order added.

## Runtime hashes
- Parent Aether: `2620262676958c0e4c10f6f70427f353624e35cf6ed2794bea32a33bb13cf87d`
- 40.6.37 Aether: `1ffb9e3c8ff4b1291b96c3f9fc1ac22de63b0cea35d23ec000d34deaa96a4427`

## Firefox acceptance
1. Ctrl+F5 and observe the Graphique/market becoming useful before Aether secondary hydration.
2. Open Aether: `Vue` must appear immediately.
3. Click `Historique`: full 8-row session timeline should materialize then, not at boot.
4. Click `Détails`: explanatory blocks should materialize then.
5. Return to `Vue`, close/reopen, and verify geometry/typography from 40.6.36 is unchanged.
