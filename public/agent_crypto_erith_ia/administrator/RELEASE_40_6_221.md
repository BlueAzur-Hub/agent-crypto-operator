# Agent-Crypto @erith.IA — 40.6.221

## Release

**G2/G7 FOUNDATION PRECONDITION + EVENT RETRY REPAIR**

Parent: `40.6.220`  
Market Core: `38.15.11` unchanged  
Mode: **PAPER ONLY**  
Gate 3: **PENDING**  
Gate 9: **LOCKED**

## Terrain inherited from 40.6.220

Firefox/export confirms `Build 40.6.220 · Administrator` with Market Core `38.15.11`, but G2 and G7 remain `EVIDENCE_REQUIRED / TEST DISPONIBLE`. The audit still reports `HISTORICAL_RECEIPT_UNBOUND`: no explicit strict foundation result is bound to the current loaded module builds.

## Repair

Adds `js/strategy-a-foundation-delegated-certification-406221.js` and loads it directly from the canonical Administrator evidence chain.

The delegated run now separates **pre-test readiness** from **post-test certification**:

- before execution: the strict Safety owner must exist;
- the four current foundation self-test APIs must exist;
- all four current module builds must be present and bindable;
- Auto Lifecycle Bridge preflight must be `READY`;
- an older tested-build match is **not** required before the new explicit test;
- after execution, `tested_builds_match_current === true` is mandatory before FOUNDATION PASS.

The owner retries only on existing runtime/evidence lifecycle events until it can execute. It does not add a polling timer or MutationObserver.

## Invariants

- no Market Core change;
- no Strategy A threshold/business-logic change;
- no Atlas or Oracle behavior change;
- no real order path;
- no live unlock;
- no Gate promotion fabricated by the delegated owner;
- no business network request;
- no recurring timer;
- no MutationObserver;
- strict `40.6.191` foundation truth remains authoritative.

## Terrain proof required

Reload Firefox until `Build 40.6.221 · Administrator` is visible, then export the markdown report. The expected result is either:

1. G2/G7 become PASS because the strict explicit test ran and exact current-build binding was proven; or
2. the new G2/G7 foundation receipt exposes the precise remaining wait/failure state.

No internal operator control is required.
