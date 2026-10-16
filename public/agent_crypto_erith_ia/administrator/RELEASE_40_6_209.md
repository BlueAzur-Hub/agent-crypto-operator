# Agent-Crypto 40.6.209 — G3 T0 Overlap Live Refresh

Parent: 40.6.208  
Engine: Market Core 38.15.11  
Mode: PAPER ONLY  
G3: PENDING  
G9: LOCKED

## Terrain proof
The 40.6.208 Firefox/export report proves that one prospective PAPER T0 was captured successfully:

- prospective rows: 1
- ledger rows: 12
- T0 traceable: 1
- T0 certified: 1
- joined rows: 0
- checkpoint: `NO_T0_DECISION_INSIDE_CERTIFIED_WINDOW`
- owner/action: `WAIT_OR_TIMESTAMP_PROOF / WAIT_NATURAL_OVERLAP_OR_PROVE_TIMESTAMP_BUG`

In the same exported report, the read-only overlap panel remained on its pre-click snapshot (`Certified T0 = NON PROUVE`, `Relation = UNPROVEN`).

## Exact cause
The prospective capture refresh chain rerendered T0 Decision Proof, Replay Dataset, Decision Replay, Cascade Checkpoint and its own panel, but did not rerender `strategyAG3T0WindowOverlapProof`.

## 40.6.209 change
Adds `js/strategy-a-g3-overlap-live-refresh.js` to canonical Evidence wiring after the prospective T0 capture module.

The binding:

- listens to the existing visible prospective PAPER capture action;
- rerenders the Cascade Checkpoint and the existing read-only overlap proof after capture state is committed;
- also refreshes once during canonical mount/pageshow so persisted prospective evidence can be evaluated without a second capture;
- does not alter Strategy A business logic, Gate state, ledger rows, market data, storage contract, timers, observers, network paths or real-order paths.

## Terrain acceptance
Reload to `Build 40.6.209 · Administrator`, then export the markdown report without capturing another T0. The existing T0 should be restored from the bounded prospective evidence store and the overlap proof should display its current relation, gap and conclusion instead of the stale pre-click snapshot.
