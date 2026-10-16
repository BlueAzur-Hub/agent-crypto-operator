# Agent-Crypto 40.6.97 — Retrospective Decision Reader Activation

Parent: 40.6.96
Engine: Market Core 38.15.11 (unchanged)

## Scope
- Activate the already existing `js/retrospective-validation.js` (39.6.0) only after page dependencies are loaded.
- Keep Market Memory and Analytical Memory separate.
- Compare closed verified CURRENT analyses only with market observations strictly after their close time.
- Read-only: no fetch, timer, WebSocket, storage write, Atlas launch, NØX launch, Aerith launch, or prediction-accuracy score.

## Expected runtime proof
Decision Board gains the existing `Validation rétrospective` reader without changing the dual-memory owner.

## Protected
Aether, Atlas CURRENT, Oracle, Lecture Technique, Web Classic, Strategy decision logic and Market Core are untouched.
