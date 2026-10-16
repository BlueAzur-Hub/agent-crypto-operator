# Agent-Crypto 40.6.267 — STABILITY · DECISION INTELLIGENCE SINGLE-PASS

Parent: **40.6.266**
Base commit: `b51f16dca36218f38df143870ef2e4d3635a4bb8`

## Scope

Runtime owners changed:
- `js/event-memory.js`
- `js/decision-intelligence-current-truth.js`

No Section 01 structural change. No Window Manager change. No runtime-shell change.

## Repair 1 — hidden regime rescan removed

Event Memory already resolves the T0 Collector snapshot through its shared timestamp index.
Before 40.6.267 it then called `MarketRegimeContext.for_event()`, which re-entered
`EventReactionLedger.project()` → `EventReactionMemory.derive()` and rescanned the full
Collector record set across the reaction windows.

40.6.267 classifies the already matched T0 row directly through
`MarketRegimeContext.classify()`.

The regime classification formula is unchanged.

## Repair 2 — semantic clustering is lazy

Decision Intelligence no longer calls `EventSemanticEnrichment.clusters()` before knowing
whether Historical Analog has any horizon-eligible historical reaction.

The 40.6.266 Historical Analog owner remains responsible for clustering only when candidates
actually exist. A legitimate `NO_ANALOG` path therefore avoids clustering completely.

## Protected

Unchanged:
- Market Core 38.15.11
- Section 01 canonical slot
- Administrator Window Manager
- Oracle
- Atlas CURRENT
- Lecture Technique
- Strategy A business rules / Gates
- Aether
- Web Classique
- Bridge auth
- real-order paths

No new timer, observer, fetch, storage owner or automatic order.

## Terrain

Firefox terrain is mandatory before calling this stable.
