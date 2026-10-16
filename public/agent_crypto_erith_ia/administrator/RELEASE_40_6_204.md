# Agent-Crypto 40.6.204 — G3 Evidence Lifecycle Binding

Parent: 40.6.203  
Engine: Market Core 38.15.11  
Mode: PAPER ONLY  
G3: PENDING  
G9: LOCKED

## Terrain proof from 40.6.203
The exported Firefox report proves that Build 40.6.203 loaded, but the expected supplemental G3 host still did not survive into the report: no BODY PORTAL heading, no `G3 · CASCADE CHECKPOINT TRUTH`, and no checkpoint BLOCKER.

## Root cause found
The legacy Evidence Dossier does not assume its anchors exist at first script execution. Its owner uses a bounded bootstrap lifecycle and retries on operator `click`, `focusin`, and `pageshow` until `#strategyADossier` can be mounted.

The supplemental G3 integrator did not mirror that lifecycle. It could run too early, find no usable Evidence anchor, return, and never retry at the exact moment the legacy dossier later became available.

A second lifecycle mismatch was also present: `strategy-a-evidence-lifecycle-truth.js` was still the 40.6.187 three-panel contract and checked supplements as children of `#strategyADossier`, while the current evidence cascade contains seven supplemental panels hosted outside that destructive subtree.

## 40.6.204 correction
- Bind the supplemental integrator to the same bounded `click` / `focusin` / `pageshow` bootstrap lifecycle used by the real Evidence owner.
- On those bootstrap signals, attempt the mount synchronously so a first operator export can see the mounted evidence before bubble-phase export handling.
- Stop the temporary bootstrap listeners once all seven panels are present and hydrated.
- Upgrade EvidenceLifecycleTruth to the seven-panel host contract.
- Keep explicit Evidence refresh single-owner: one dossier render, one supplement mount, one gate-truth render.

## Not changed
Market Core 38.15.11, Web Classic, Strategy A thresholds/business logic, Risk Governor, Cost Gate, Paper lifecycle, Atlas CURRENT, Oracle, Aether, Lecture Technique, TRADUS, storage owners, business-network paths, wallets, keys and real-order paths.

No recurring timer, MutationObserver or polling loop is added.

## Operator proof
Reload until `Build 40.6.204 · Administrator` is visible, then export the markdown report normally. No manual search is required.

Expected evidence:
- `STRATEGY A · G3 EVIDENCE SUPPLEMENTS · LIFECYCLE BOUND · 40.6.204`
- seven supplemental G3 panels
- `G3 · CASCADE CHECKPOINT TRUTH`

Only after the terrain report exposes its real `BLOCKER / OWNER / ACTION` should the next G3 evidence-owner build be selected.
