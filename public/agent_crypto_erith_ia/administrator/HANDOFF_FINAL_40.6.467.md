# HANDOFF FINAL — 40.6.467

## Preuve .466

Shadow 65 COST WAIT historiques :
- Legacy PASS : 0/65;
- Kraken snapshot + marge : 0/65 PASS;
- OKX plancher frais+spread+marge : 2 POTENTIAL / 63 WAIT avant slippage;
- slippage OKX inconnu → aucun PASS certifié.

Deux anomalies de vérité de présentation :
1. ticket canonique affiché `— €` alors que le spec canonique fixe 50 €;
2. Durable Evidence affiché `96 / 0` et NO_DURABLE_EVIDENCE pendant l'hydratation, alors que les preuves avaient déjà été restaurées auparavant.

## 40.6.467

- Ticket canonique = 50 € même si le module spec n'est pas encore résident, avec provenance fallback explicite;
- aucune fausse conclusion durable pendant l'initialisation;
- Reconciliation, Crosswalk et Completeness affichent DURABLE_LOADING / … jusqu'à `ready=true`;
- rafraîchissement borné sur les événements de résidence existants.

## Invariants

Cost Gate legacy 0,80 % intact.
Strategy A, Oracle, Risk, Paper inchangés.
Aucun backfill.
Aucune écriture IndexedDB nouvelle.
Aucun ordre réel.
Market Core 38.15.11 protégé.

## Test Firefox

Ctrl+F5 → Build 40.6.467 → Section 04 → Simulation.

Attendu :
- Real Venue Cost Shadow Truth : **Ticket canonique 50 €**;
- pendant chargement durable : **DURABLE_LOADING** et `…`, jamais de faux `0` interprété comme absence;
- après hydratation : restauration des comptes réels (notamment les 4 liens uniques / 5 PAPER orphelins si la base locale est intacte).
