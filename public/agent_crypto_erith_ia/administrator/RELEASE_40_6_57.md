# Agent-Crypto 40.6.57 — STRATEGY A REPLAY ACCEPTANCE MATRIX

Build **40.6.57** · parent **40.6.56** · Market Core **38.15.11**.

Cumulative build: includes the 40.6.56 canonical Strategy A specification and adds an operator-triggered 7-case acceptance matrix over the existing deterministic replay sandbox.

Expected cases: PASS→PAPER_SIMULATED; DATA STALE→STOP; DIRECTION→WAIT; BTC24→WAIT; COST→WAIT; DUPLICATE→STOP; RISK REJECT→STOP. The matrix is never executed automatically. It calls the existing replay self-test, verifies its result store is restored, and renders/exports an isolated receipt.

Aether 40.6.54 geometry/backplate/Window Manager are untouched. Existing live Strategy A gates and Paper lifecycle are untouched. No new timer, observer, network owner, storage owner or real-order path.

Acceptance module SHA-256: `968c6b1b81d6da4d530471caa6e749eb3a122b6191c49afb9f487c3073e0516c`
