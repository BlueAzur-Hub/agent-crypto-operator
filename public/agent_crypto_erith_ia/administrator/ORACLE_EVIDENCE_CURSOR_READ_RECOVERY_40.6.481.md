# ORACLE EVIDENCE CURSOR READ RECOVERY — 40.6.481

## Scope
Le propriétaire commun `atlasOracleEvidenceAll()` dans `administrator/app.js` uniquement.

## Défaut observé
Firefox a refusé la matérialisation monolithique du store Oracle Evidence avec une erreur `serialized value is too large`. Le compteur Oracle continuait pourtant à progresser, ce qui distingue l'échec de lecture d'une perte des données.

## Réparation
- `IndexedDB.getAll()` retiré du chemin de lecture complète Oracle Evidence.
- `openCursor()` lit les observations une par une.
- Le warm mirror existant reçoit ensuite le même tableau logique.
- Les consommateurs existants gardent la même API.
- Le pruning utilise `count()` avant toute lecture complète et ne matérialise rien sous la limite de 50 000 lignes.

## Non-modifications
Aucune suppression Evidence, aucun `clear()`, aucun backfill, aucune migration, aucun nouvel object store, aucun changement de rétention, Oracle Math, Strategy A, profil Crypto, Market Core, réseau ou ordre réel.

## Limite volontaire
40.6.481 corrige le transport IndexedDB/Firefox. Elle ne transforme pas encore le warm mirror complet en stockage paginé. L'architecture mémoire chaude navigateur + mémoire froide GitHub sera un chantier séparé après preuve terrain.
