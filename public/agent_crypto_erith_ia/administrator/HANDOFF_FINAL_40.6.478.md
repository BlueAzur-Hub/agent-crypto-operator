# HANDOFF FINAL — 40.6.478

## Parent

40.6.477 corrige Lecture Technique et reste intégralement héritée.

## Défaut ciblé

Le collecteur prospectif pouvait réécrire un dossier déjà terminé à chaque nouveau cycle parce que `addObservation()` précédait la vérification de clôture des horizons.

## Réparation

`recordTerminal(record)` exige T+5/T+15/T+60 tous `CAPTURED` ou `MISSED_WINDOW`.

`applySample()` retourne immédiatement `false` pour ce dossier.

Résultat attendu :
- zéro nouvelle observation ;
- zéro `updated_at` ;
- zéro persist IndexedDB ;
- aucune modification des dossiers PENDING.

## Invariants

- aucun backfill ;
- aucune interpolation ;
- tolérance inchangée ;
- horizons inchangés ;
- capture OKX T0 inchangée ;
- Strategy A décisionnelle inchangée ;
- Market Core 38.15.11 intact ;
- aucun ordre réel.
