# Agent-Crypto 40.6.202 — G3 Evidence Stable Host Restore

Parent: 40.6.201  
Engine: Market Core 38.15.11  
Mode: PAPER ONLY  
G3: PENDING  
G9: LOCKED

## Root cause
Firefox/export proof on 40.6.201 still showed only the legacy Evidence Dossier surfaces. The legacy `strategy-a-evidence-dossier.js` owner removes and recreates `#strategyADossier` during its render, so supplemental G3 panels mounted as children of that subtree are not durable.

## Scope
One responsibility only: restore a stable sibling host for the seven existing supplemental G3 evidence panels, outside the destructive legacy Evidence Dossier subtree.

## Changed
- `js/strategy-a-evidence-dossier-supplement-integrator.js`: upgraded to Build 40.6.202; creates `#strategyAEvidenceSupplements` as a stable sibling, hydrates the seven existing G3 owners, then moves their roots into the stable host.
- `build.json`: publishes Build 40.6.202 and records the stable-host repair.

## Seven expected panels
1. G3 · STRUCTURED DATA TRUTH
2. G3 · HISTORY OWNER DISCOVERY
3. G3 · HISTORICAL EVIDENCE ADAPTER
4. G3 · T0 DECISION PROOF
5. G3 · IMMUTABLE REPLAY DATASET
6. G3 · DECISION REPLAY VERIFIER
7. G3 · CASCADE CHECKPOINT TRUTH

## Not changed
Market Core 38.15.11, Web Classic, Strategy A thresholds/business logic, Risk Governor, Cost Gate, Paper lifecycle, Atlas CURRENT, Oracle, Aether, Lecture Technique, TRADUS, storage owners, wallets, keys or real-order paths.

## Safety
No recurring timer, MutationObserver, polling loop, storage write, business network request, real order, Gate promotion, historical backfill or future lookahead is added.

## Operator proof
Reload Administrator until `Build 40.6.202 · Administrator` is visible, then send the exported markdown report. No Ctrl+F or manual technical search is required. The report should contain the stable-host heading and all seven panels; the `G3 · CASCADE CHECKPOINT TRUTH` BLOCKER / OWNER / ACTION then chooses the next version.
