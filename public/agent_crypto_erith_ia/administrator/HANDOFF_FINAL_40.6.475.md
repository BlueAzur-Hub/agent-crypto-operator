# HANDOFF FINAL — 40.6.475

## Parent terrain .474

- panneau PROSPECTIVE OUTCOME visible ;
- état ARMED ;
- Auto A a continué à produire des cycles ;
- Cost waits est resté à 65 pendant l'observation ;
- aucun nouveau COST_GATE_WAIT naturel n'a donc validé le chemin complet.

## 40.6.475

Objet : **PROSPECTIVE CAPTURE PLUMBING PROOF**.

La cause d'incertitude n'était pas un tuyau manifestement cassé, mais un contrat caché :
l'événement .454 est partiel et .474 devait relire le ledger pour récupérer prix/coût.

.475 verrouille ce contrat :
- résolution exacte par `cycle_id` ;
- aucun fallback silencieux vers le dernier cycle lorsqu'un ID est fourni ;
- ID absent = erreur observable et fail-closed ;
- observabilité `events_received / last_event_at / last_event_cycle_id / last_resolved_cycle_id / last_resolution_mode / last_error`.

Le harness isolé vérifie :
événement partiel → cycle exact dans ledger → persistance meta → OKX T0 → T+5, puis ID absent → fail-closed.

## Test Firefox

Ctrl+F5 → Build 40.6.475 → Section 04 → Simulation.

Pas besoin d'attendre Cost waits 65 → 66.

Après le prochain cycle Auto A normal :
- Plomberie / événements reçus > 0 ;
- event == résolu ;
- mode = LEDGER_BY_ID ;
- erreur = —.

Si ces quatre points sont vrais, la plomberie événement → ledger est PASS terrain.

Le test naturel COST_GATE_WAIT reste ensuite utile pour prouver T0/T+5/T+15/T+60 sur données réelles, mais il n'est plus requis pour certifier le câblage.

Aucun changement Strategy A métier, aucun seuil/gate, aucun Market Core, aucun ordre réel.
