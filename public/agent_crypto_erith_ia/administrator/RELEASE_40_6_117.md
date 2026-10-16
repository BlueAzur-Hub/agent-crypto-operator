# Agent-Crypto Administrator 40.6.117 — Atlas Decision Context Canonical Readers

Parent: **40.6.116**  
Market Core: **38.15.11 — unchanged**

## Mission

Repair the existing **Atlas Decision Context** without touching its visual layout or any analytical engine.

The 40.6.116 Firefox export showed the context as **INCOMPLET** while the same runtime already exposed usable market, Oracle, source and News truth elsewhere in the page. The defect was therefore treated as a read-side / load-order problem, not as missing market intelligence.

## Canonical owner

`js/atlas-decision-context.js`

The stable demand loader already loads this canonical owner for Administrator **40.6.114+**; 40.6.117 changes the owner implementation only.

## 40.6.117 repair

- Strategy A now prefers the existing current comparative owner and canonical fail-closed reader before any historical fallback.
- TRADUS now prefers the existing Strategy A ↔ TRADUS comparative model, then the canonical shadow reader.
- Oracle parsing checks both the Oracle-local surface and the complete visible runtime instead of stopping on an incomplete local node.
- Market breadth accepts the current visible `hausses / baisses / stables` presentation.
- `+0/100` direction scores are parsed correctly.
- null / empty numeric values remain **null** instead of silently becoming `0`.
- Source Truth can expose a bounded `visible-ready` state while the detailed CEX/DEX owner is still loading; missing DEX detail is explicitly shown as not loaded, never invented.
- News can use the visible runtime truth as a read-only fallback when the Event Intelligence owner is not yet materialized.
- The context re-renders when Source Truth or Strategy A ↔ TRADUS comparative intelligence becomes available later in the same runtime.

## Expected visible effect

When the same truths visible in the 40.6.116 export are present, Atlas Decision Context should no longer remain stuck on:

- Marché `INCONNUE`;
- Oracle `INCONNU`;
- Sources `PARTIEL` solely because their detailed owner loaded later;
- News `INDISPONIBLE` despite a visible News Sentinel;
- Strategy A `INCONNU` when the canonical comparative reader already resolved it.

The verdict remains descriptive and fail-closed. A mixed Oracle or a Strategy/TRADUS disagreement may still legitimately produce **OBSERVER**, **CONVERGENCE DESCRIPTIVE · OBSERVER**, or another non-action state.

## Read-only contract

No change to:

- Market Core 38.15.11;
- Web Classic;
- Graphique;
- Lecture Technique;
- Aether;
- Atlas CURRENT pipeline;
- Oracle engine;
- Strategy A engine or thresholds;
- TRADUS engine;
- Bridge protocol;
- wallet / credential paths;
- real or automatic orders.

The owner adds no fetch, recurring timer, MutationObserver or storage write.

## Self-test

Expected: **6/6**.

The internal checks cover null-number handling, incomplete fail-closed behavior, descriptive convergence, no financial signal, no automatic order, and no fetch/timer/storage side effect.

## Terrain proof

**Pending Firefox validation after GitHub Pages propagation.**

The proof target is the existing `ATLAS DECISION CONTEXT · READ ONLY` card only. No other interface zone should move or change size.
