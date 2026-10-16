# Agent-Crypto 40.6.208 — G3 T0 Window Overlap Proof

Parent: 40.6.207  
Engine: Market Core 38.15.11  
Mode: PAPER ONLY  
G3: PENDING  
G9: LOCKED

## Terrain selected by 40.6.207
Firefox/export proof now confirms the eight-panel Evidence host is stable:

- `8 / 8 PANNEAUX · 8 HYDRATÉ(S)`
- prospective T0 panel visible in export
- `Prospective rows = 1`
- cascade `T0 TRACEABLE = 1`
- cascade `T0 CERT. = 1`
- `JOINTES = 0`
- blocker `NO_T0_DECISION_INSIDE_CERTIFIED_WINDOW`
- owner `WAIT_OR_TIMESTAMP_PROOF`
- action `WAIT_NATURAL_OVERLAP_OR_PROVE_TIMESTAMP_BUG`

The prospective capture row itself remains fail-closed on `reentry_fresh`; that is not silently promoted or backfilled.

## 40.6.208
Adds one read-only proof block to the already validated stable Evidence host:

`G3 · T0 WINDOW OVERLAP PROOF · 40.6.208`

It exposes:

- certified window first timestamp
- certified window last timestamp
- latest certified T0 market timestamp and ID
- relation: before / inside / after certified window
- gap in minutes
- certified T0 count
- joined count
- conclusion
- current checkpoint blocker / owner / action

This build does not capture another T0 and does not alter the series, ledger, Strategy A business logic, Gate state or any real-order path.

## Terrain acceptance
Reload until `Build 40.6.208 · Administrator`, export the markdown report, and send it back. No special click or search is required.

The next version is chosen strictly from the displayed relation:

- `T0_AFTER_CERTIFIED_WINDOW` → preserve the T0 and wait for natural source overlap;
- `T0_INSIDE_CERTIFIED_WINDOW` with zero joins → inspect/repair join timestamp logic;
- `T0_BEFORE_CERTIFIED_WINDOW` → inspect stale-window/retention semantics;
- `UNPROVEN` → repair timestamp evidence owner only.
