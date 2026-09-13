# Agent-Crypto — Profil Yohan (Operator)

## Checkpoint actif

- Operator delivery : **40.6.118**
- Market Core : **38.15.11**
- Profil : **Yohan Operator**
- Runtime canonique : `BlueAzur-Hub/erith-ia-memory`

## Entrées publiques

Entrée recommandée :

`operator/index-40.6.118.html`

Alias courant :

`operator/index.html`

Entrée historique conservée :

`administrator/yohan.html`

## Vérité de version

Le dépôt `agent-crypto-operator` ne duplique pas aveuglément le gros runtime Administrator.

Le profil Yohan ouvre directement le runtime canonique **Administrator 40.6.118** du dépôt maître en `?view=intermediate`, puis injecte uniquement la couche locale Yohan déjà existante depuis ce dépôt.

Ainsi :

- la vérité runtime reste portée par `BlueAzur-Hub/erith-ia-memory` ;
- la couche Yohan reste spécifique à `BlueAzur-Hub/agent-crypto-operator` ;
- l'ancien miroir Administrator **40.6.73 R2** reste présent comme archive/rollback et n'est pas la cible active ;
- les anciennes entrées Operator versionnées restent des archives et ne sont pas supprimées.

## Contrat

- Même runtime canonique Administrator **40.6.118**.
- Vue Intermédiaire / rôle Operator par défaut selon la couche Yohan actuelle.
- Aucun privilège Administrator n'est accordé par le paramètre URL.
- La couche `yohan-operator-profile.js` n'est pas modifiée par cette synchronisation.
- Aether Operator Bridge `406002` reste une brique du runtime canonique.
- Futur Bridge local Yohan/Ollama/authentification : chantier distinct, à configurer sur son poste réel.
- Aucun mot de passe, token, clé privée ou wallet embarqué dans GitHub Pages.
- Aucun ordre réel ajouté par cette synchronisation.
- Market Core **38.15.11** inchangé.

## Fichiers spécifiques Yohan touchés par cette livraison

- `administrator/yohan.html`
- `operator/index-40.6.118.html` — nouveau
- `operator/index.html`
- `operator/build.json`
- ce README

## Fichier Yohan volontairement préservé

- `administrator/js/yohan-operator-profile.js`

Cette synchronisation ne doit pas devenir un chantier d'interface ou d'authentification. Elle aligne seulement l'Operator sur le checkpoint Administrator 40.6.118.

## Règle de synchronisation

Le MASTER fournit le runtime.
Le dépôt Operator fournit la couche Yohan.
Ne jamais recopier aveuglément tout le MASTER dans ce dépôt.
