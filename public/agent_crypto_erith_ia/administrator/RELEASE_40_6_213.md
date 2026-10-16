# Agent-Crypto 40.6.213 — G3 TRUE HYDRATION CHECK

Parent: 40.6.212  
Engine: Market Core 38.15.11  
Mode: PAPER ONLY  
G3: PENDING  
G9: LOCKED

## Terrain that selected this build

40.6.212 loaded successfully and finally exposed the durable-memory panel. The export showed:

- `MÉMOIRE DURABLE OK`
- 0 conserved PAPER decisions
- host header `9 / 9 PANNEAUX · 9 HYDRATÉ(S)`
- but seven historical G3 panels still rendered `MODULE EN ATTENTE`

Therefore 40.6.212 had a false-positive hydration counter. Function/API presence was being treated as equivalent to successful content hydration.

## 40.6.213

Hydration truth is now based on visible panel content and owner availability:

- a panel with `MODULE EN ATTENTE` is never counted as hydrated;
- the placeholder class is removed only after real owner content replaces the placeholder text;
- `panel_hydrated(id)` is exposed by the stable host integrator;
- lifecycle truth delegates its hydrated count to this contract;
- bootstrap settles only when all nine panels are genuinely hydrated;
- otherwise the bounded click/focus/pageshow/runtime events remain available for later owner availability.

## Safety / scope

No Strategy A business logic, threshold, Risk Governor, PAPER lifecycle, Market Core, Atlas, Oracle, Aether, Lecture Technique, Gate state, real-order path, recurring timer, MutationObserver, business-network request or historical backfill is changed.

The existing bounded IndexedDB store for prospective PAPER decision evidence remains unchanged.

## Terrain acceptance

1. Reload until `Build 40.6.213 · Administrator`.
2. Export the markdown report without recording another PAPER decision.
3. Check the stable Evidence host title `TRUE HYDRATION · 40.6.213`.
4. The `HYDRATÉ(S)` count must match real rendered panels, not placeholders.
5. `9 / 9 · 9 HYDRATÉ(S)` is valid only if no `MODULE EN ATTENTE` remains inside the nine-panel host.

No Gate promotion is claimed by this release.
