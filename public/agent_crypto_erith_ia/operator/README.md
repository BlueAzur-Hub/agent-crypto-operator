# Agent-Crypto Operator — Yohan — 40.6.99

Cette entrée synchronise le dépôt séparé `BlueAzur-Hub/agent-crypto-operator` avec le checkpoint canonique **Administrator 40.6.99 / Market Core 38.15.11** sans recopier le runtime maître en bloc.

## Architecture

- runtime : `BlueAzur-Hub/erith-ia-memory` / Administrator 40.6.99 ;
- vue : `?view=intermediate` ;
- profil : couche locale `administrator/js/yohan-operator-profile.js` ;
- Bridge d'interface : Aether Operator Bridge 406002 du runtime maître ;
- ancien miroir local 40.6.73 R2 : conservé comme rollback, non actif pour l'entrée Operator 40.6.99.

## Entrée

`index-40.6.99.html`

Alias :

`index.html`

## Sécurité

Le paramètre URL n'est pas une authentification.
Aucun wallet, clé privée, endpoint d'ordre réel ou privilège Administrator supplémentaire n'est ajouté par cette synchronisation.

Le futur Bridge local Yohan/Ollama reste un chantier distinct.
