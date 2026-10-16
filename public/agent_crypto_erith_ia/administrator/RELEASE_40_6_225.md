# Agent-Crypto @erith.IA — 40.6.225

## G3 CURRENT TRUTH SURFACE · OPERATOR SUMMARY

Parent: `40.6.224`  
Market Core: `38.15.11` unchanged  
Mode: **PAPER ONLY**  
Gate 3: **PENDING**  
Gate 9: **LOCKED**

## Why this version exists

Firefox terrain on Build 40.6.224 confirms that the canonical runtime is loaded, but the operator-facing report still lets legacy Gate-3 panels tell an older story: replay/outcome work appears unfinished even though the terrain-proven 40.6.222 receipt already closed that sub-layer.

40.6.225 adds one stable read-only current-truth surface immediately before the legacy Evidence Dossier.

## Visible result

The operator summary now states in plain language:

- 24h historical layer: **CERTIFIED**;
- T0 + replay: **2 joined decisions · READY**;
- post-T0 T+5/T+15/T+60 outcomes: **6/6 CERTIFIED**;
- current active layer: **EXECUTION REALISM**;
- Gate 9: **LOCKED**.

It also exposes the current execution-realism blockers when available from the 40.6.223 readiness owner: after-cost evidence, cost completeness, partial fills, latency and liquidity.

The 40.6.224 forward bridge is re-applied on existing evidence/operator refresh events so legacy refreshes do not silently restore stale Gate-3 wording.

## Important truth boundary

The 40.6.222 terrain receipt is preserved as a closed historical proof. A transient runtime presentation gap does not silently erase it, and the summary explicitly distinguishes that frozen proof from the current runtime owner state.

No legacy panel is deleted. They remain available for audit below the current summary.

## Invariants

- no Market Core change;
- no Strategy A threshold or business-logic change;
- no historical backfill;
- no current Oracle applied to the past;
- no future outcome used as T0 input;
- no economic backtest execution;
- no profitability claim;
- no recurring timer or MutationObserver;
- no storage write;
- no business network request;
- no live unlock or real order;
- Gate 3 remains PENDING;
- Gate 9 remains LOCKED.

## Terrain check

Reload until **Build 40.6.225 · Administrator** is visible. Verify the new **STRATEGY A · ÉTAT ACTUEL G3** block appears before the legacy Evidence Dossier, then export the `.md`. No other operator action is required.