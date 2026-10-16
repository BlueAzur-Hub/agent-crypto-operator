# HANDOFF FINAL — 40.6.476

## Parent .475 — preuve terrain

PASS plomberie :
`événements reçus 1 · event A-CYCLE-00001-ebfa9b7e · résolu A-CYCLE-00001-ebfa9b7e · mode LEDGER_BY_ID · erreur —`.

FAIL présentation :
le panneau .475 a ensuite disparu tandis que le panneau .469 restait visible.

## .476

Correction strictement DOM/presentation :
- ancre prioritaire : `strategyAExecutionCostEvidenceCapture` ;
- fallback : T+60 .473 → Coverage .472 → Potential .471 ;
- remount event-driven après `agent-crypto:administrator-presentation-settled` et événements de cycle/preuve existants ;
- compteur `mount_repairs`, `mount_anchor_id`, `last_mount_at` exposés ;
- aucun timer ;
- aucun MutationObserver ;
- aucun changement Strategy A métier.

## Test

Ctrl+F5 → Build 40.6.476 → Simulation.

Attendu :
- panneau .476 immédiatement après .469 ;
- Montage : `ancre strategyAExecutionCostEvidenceCapture` ;
- après un cycle + settlement de présentation, panneau toujours présent ou revenu automatiquement ;
- Plomberie reste `LEDGER_BY_ID`, sans erreur.

Market Core 38.15.11 intact. Aucun ordre réel.
