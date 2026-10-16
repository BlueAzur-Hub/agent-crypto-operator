# Agent-Crypto 40.6.206 — G3 Prospective T0 Stable Host Binding

Parent: 40.6.205  
Engine: Market Core 38.15.11  
Mode: PAPER ONLY  
G3: PENDING  
G9: LOCKED

## Terrain proof from 40.6.205
Firefox/export reports prove Build 40.6.205 loaded, but the prospective T0 panel and its operator control were absent from both reports.

## Exact cause
40.6.205 mounted `#strategyAG3ProspectiveT0Capture` as a child of `#strategyAG3CascadeCheckpoint`. The Cascade Checkpoint owner rewrites its own `innerHTML` during refresh/export, so the foreign prospective child is deleted before the report is serialized.

## 40.6.206 change
One responsibility only: move the prospective T0 panel outside the checkpoint subtree and keep it as a sibling immediately after the checkpoint inside the already terrain-proven stable host `#strategyAEvidenceSupplements`.

The capture contract, legacy Experiment Ledger producer, Strategy A business logic, Risk Governor, Paper lifecycle, Market Core, Atlas, Oracle, Aether and Lecture Technique remain unchanged.

The visible operator label is now `CAPTURER LE PROCHAIN CYCLE PAPER`, but no operator click should be requested until Firefox/export proves the control actually exists.

## Static proof
- `node --check`: PASS
- prospective T0 self-test: PASS 8/8

## Terrain acceptance
1. Reload until `Build 40.6.206 · Administrator`.
2. Export the markdown report only.
3. Do not search for internal function names and do not click a new control yet.
4. The assistant verifies from the report whether `G3 · CAPTURE T0 PROSPECTIVE · 40.6.206` and `CAPTURER LE PROCHAIN CYCLE PAPER` are actually visible.
