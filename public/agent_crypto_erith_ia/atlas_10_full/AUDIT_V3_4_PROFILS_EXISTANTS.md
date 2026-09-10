# AUDIT V3.4 — PROFILS EXISTANTS

## Défaut corrigé

La V3.3 confondait :

- profil complet dans le dépôt privé ;
- Core et Persona chargés localement dans le navigateur.

Cette confusion maintenait Routeuse à 78 % malgré l’upload réel de sa Persona, de son Boot et de son Block LLM.

## Règle V3.4

- Le registre confirme l’existence et l’état du profil dans le dépôt.
- L’import local fournit seulement les octets nécessaires au ZIP final.
- Un profil complet atteint 100 % sans import local.
- Le ZIP complet reste désactivé tant que le Core et la Persona ne sont pas chargés localement.
- Les fichiers PROPOSAL sont ignorés et ne bloquent pas le profil existant.
