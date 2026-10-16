# Agent-Crypto 40.6.212 — G3 DURABLE DECISION EVIDENCE · NINE-PANEL HOST BINDING

Parent: 40.6.211  
Engine: Market Core 38.15.11  
Mode: PAPER ONLY  
G3: PENDING  
G9: LOCKED

## Terrain that selected this build

Firefox loaded Build 40.6.211, but the exported Evidence Dossier still contained the old prospective capture panel and overlap proof without any `DÉCISION PAPER · MÉMOIRE DURABLE` block.

This means the durable persistence mechanism itself was not yet proven or disproven: its UI/export owner was still absent from the stable Evidence lifecycle.

## 40.6.212

- Promotes `strategyAG3DurableDecisionEvidence` to the ninth official panel of `strategyAEvidenceSupplements`.
- The first eight panels keep their existing `render()` ownership.
- The durable owner is invoked through its existing `refresh()` method.
- Evidence lifecycle truth now expects nine stable/hydrated panels.
- Durable ready/written events trigger the same bounded Evidence remount path.
- If the durable API is unavailable, the ninth panel remains an explicit `MODULE EN ATTENTE` placeholder instead of disappearing silently.
- T0/window overlap remains read-only and is positioned after the durable evidence block when available.

No Strategy A business logic, Risk Governor, PAPER lifecycle, Market Core, Atlas, Oracle, Aether, Lecture Technique, Gate state, real-order path, recurring timer, MutationObserver or business-network request is changed.

## Terrain acceptance

1. Reload Administrator until `Build 40.6.212 · Administrator` is visible.
2. Export the markdown report without recording another PAPER decision yet.
3. Expected host: `9 / 9 PANNEAUX · 9 HYDRATÉ(S)`.
4. Expected durable block: `DÉCISION PAPER · MÉMOIRE DURABLE` with an explicit memory state.
5. If the ninth panel says `MODULE EN ATTENTE`, stop: that is sufficient proof that the durable API is not active and the next repair can target loading rather than storage.

No Gate promotion is claimed by this build.
