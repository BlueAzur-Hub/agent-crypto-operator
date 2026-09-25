# Agent-Crypto Operator — Yohan — 40.6.407

Cette livraison synchronise le dépôt séparé `BlueAzur-Hub/agent-crypto-operator`
avec le checkpoint canonique **Administrator 40.6.407 / Market Core 38.15.11**
sans recopier le runtime maître.

## Architecture

- runtime : `BlueAzur-Hub/erith-ia-memory` / Administrator 40.6.407 ;
- profil : couche locale `administrator/js/yohan-operator-profile.js` ;
- runtime partagé, aucun second moteur ;
- ancien Operator 40.6.377 conservé comme historique / rollback.

## Contrat hérité

- Strategy A reste automatique ;
- le statut Strategy n'est plus dans le header ;
- le statut Strategy est visible dans Simulation ;
- ouvrir Simulation ne lance pas Evidence 28/28 ;
- le résumé léger G1→G9 reste disponible ;
- Evidence complet reste sur demande explicite ;
- Market Core 38.15.11 et REDIVIDER restent inchangés.

## Sécurité

Le paramètre URL n'est pas une authentification.
Aucun wallet, clé privée, endpoint d'ordre réel ou privilège Administrator supplémentaire n'est ajouté.
