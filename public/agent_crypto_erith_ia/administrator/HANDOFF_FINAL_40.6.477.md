# HANDOFF FINAL — 40.6.477

## Parent .476

Terrain confirmé :
- plomberie prospectif : `LEDGER_BY_ID`, aucune erreur ;
- panneau prospectif stable sur l'ancre .469 ;
- Strategy A métier inchangée ;
- collecte économique complète encore en attente d'un nouveau `COST_GATE_WAIT` réel.

## Défaut .477

Lecture Technique pouvait annoncer une image prête alors que `swapUrl()` avait échoué sur un démarrage replié/cache froid. Une ouverture pendant la lecture du cache pouvait également rater la reprise.

## Réparation

- `apply()` retourne le résultat réel de `swapUrl()` ;
- `imageReady` devient vrai uniquement après succès ;
- reprise unique si l'état passe replié → ouvert pendant l'attente cache ;
- pas de réseau tant que le panneau reste replié ;
- AUTO/RND/image privée préservés ;
- aucun préchargement complet.

## Test terrain

Ctrl+F5 → Build 40.6.477.

Attendu :
- ouverte au boot : image présente ;
- repliée/cache froid puis ouverte : image présente sans clic AUTO/RND ;
- ouverture pendant cache async : image présente après une seule reprise.

Le plantage Firefox/Transformer Book reste **UNKNOWN** et n'est pas attribué à ce défaut.

Market Core 38.15.11 intact. Aucun ordre réel.
