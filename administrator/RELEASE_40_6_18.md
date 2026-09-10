# Agent-Crypto 40.6.18 — END-TO-END UNKNOWN PROPAGATION · PAPER BRIDGE TRUTH

- Parent: `40.6.17`
- Market Core `38.15.11` protected / unchanged.
- Changed runtime owner: `js/strategy-a-auto-lifecycle-bridge-404297.js`.
- External `null`, blank, boolean, missing or invalid numerics stay `null`/UNKNOWN.
- Missing entry fee can no longer become `0` to fabricate `authorized_notional - fee`.
- Price×quantity remains a valid direct asset-notional proof even when fee/authorized notional are unknown.
- Authorized-notional−fee fallback requires both values to be known.
- Contradictory known direct/fallback notionals fail closed.
- Filled-notional reconciliation refuses UNKNOWN.
- After-Cost 40.6.17, Ledger 40.6.16, Paper authorization 40.6.15, Safety 40.6.14, Oracle 40.6.13, Chronos, Graphique, Lecture Technique and Window Manager are frozen.
- No real order / network / storage / timer / observer owner added.

Generated: `2026-09-08T00:25:41Z`
