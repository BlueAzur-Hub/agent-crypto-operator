# HANDOFF FINAL — 40.6.471

40.6.470 terrain : 65/144, 1/16, BASELINE_DRIFT.
Le cycle unique retrouvé ne couvre pas 0,6109 % à T+5/T+15/T+60 ; ce résultat n'est pas représentatif des 16.

Cause : le Cost-Wait Outcome Audit lit d'abord le ledger visible.

40.6.471 utilise exclusivement les cycles Durable Evidence pour reconstruire la baseline .467.

Test : Ctrl+F5 → Build 40.6.471 → Section 04 → Simulation.
Attendu après hydratation : Baseline 144/144, POTENTIAL 16/16, puis T+5/T+15/T+60.
Si la baseline dérive encore, exporter les IDs et ne pas modifier le gate.

Market Core 38.15.11, Strategy A, Oracle, Risk, Paper et IndexedDB inchangés. Aucun ordre réel.
