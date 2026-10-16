# Agent-Crypto 40.6.255 — BRIDGE AUTH CONTINUITY + STRATEGY A EVIDENCE LIVE REFRESH

Parent: **40.6.254**  
Market Core: **38.15.11 — protected**

## Faults proved

### Administrator session returning to Aether Trust
The local Administrator UI role and the privileged Ryzen Bridge token are separate.
The Bridge token carries an `expires_at` timestamp and 40.4.273 intentionally opens
Aether Trust when privileged auth is stale. There was no frontend renewal path.

### Strategy A proof card stale while runtime kept moving
Retrospective Validation and Market/Analytical Memory continued to advance, but the
Paper V2 proof card was essentially mount/manual-refresh driven.

## Surgery

- Reuse the existing 60 s Bridge supervision owner; no second recurring timer.
- Keep the already-validated Administrator secret only in JS memory for the current document.
- Never write that secret to localStorage, sessionStorage, IndexedDB, GitHub or exports.
- Attempt bounded loopback re-authentication in the 5 min pre-expiry window.
- Protected Bridge routes and Atlas preflight attempt the same bounded renewal before Aether Trust fallback.
- Explicit Lock and Operator handoff clear the volatile secret.
- Strategy A Paper V2 proof rerenders on CURRENT finalized, evidence changes,
  market-series update, visibility return and pageshow.
- No polling timer, MutationObserver, storage owner, fetch owner or business-rule change.

## Protected
Market Core 38.15.11 · Atlas CURRENT semantics · Auto Reader 40.6.254 ·
Strategy A thresholds/Risk/lifecycle/Gates · Decision Intelligence · Oracle ·
Lecture Technique · Aether business behavior · Web Classique.

## Static validation
- administrator/app.js: JavaScript parse PASS.
- strategy-a-paper-v2-proof-bridge.js: JavaScript parse PASS.
- build.json: JSON parse PASS.
- No new recurring timer.
- No MutationObserver.
- PAPER ONLY · G3 PENDING · G9 LOCKED.

## Firefox acceptance
1. Hard reload 40.6.255 and authenticate Administrator once.
2. Keep the tab open through the previous Bridge-token expiry horizon.
3. Expected: Aether Trust does not reopen while Bridge is healthy.
4. Explicit Lock must still return to the gate.
5. Let a new CURRENT / canonical market observation arrive.
6. Expected: Strategy A · Preuves croisées advances without ACTUALISER PREUVES.
7. Confirm no Firefox slowdown banner.
