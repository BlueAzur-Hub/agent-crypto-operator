# Agent-Crypto — Profil Yohan (Operator)

## Checkpoint actif

- Operator delivery : **40.6.99**
- Market Core : **38.15.11**
- Profil : **Yohan Operator**
- Runtime canonique : `BlueAzur-Hub/erith-ia-memory`

## Entrées publiques

Entrée recommandée :

`operator/index-40.6.99.html`

Alias courant :

`operator/index.html`

Entrée historique conservée :

`administrator/yohan.html`

## Vérité de version

Le dépôt `agent-crypto-operator` ne duplique plus aveuglément le gros runtime Administrator.

Le profil Yohan ouvre directement le runtime canonique **Administrator 40.6.99** du dépôt maître en `?view=intermediate`, puis injecte uniquement la couche locale Yohan depuis ce dépôt.

Ainsi :

- la vérité runtime reste portée par `BlueAzur-Hub/erith-ia-memory` ;
- la couche Yohan reste spécifique à `BlueAzur-Hub/agent-crypto-operator` ;
- l'ancien miroir Administrator **40.6.73 R2** reste présent comme archive/rollback et n'est plus la cible active de l'entrée Yohan 40.6.99.

## Contrat

- Vue Intermédiaire / rôle Operator par défaut.
- Aucun privilège Administrator n'est accordé par le paramètre URL.
- Accès Administration local conservé selon le contrat du runtime canonique.
- Projects / Portfolio restent masqués par `yohan-operator-profile.js`.
- Aether Operator Bridge `406002` provient du runtime canonique 40.6.99.
- Futur Bridge local Yohan/Ollama : chantier distinct, à configurer sur son poste.
- Aucun mot de passe, token, clé privée ou wallet embarqué dans GitHub Pages.
- Aucun ordre réel ajouté par cette synchronisation.

## Fichiers spécifiques Yohan

- `administrator/yohan.html`
- `administrator/js/yohan-operator-profile.js`
- `operator/index-40.6.99.html`
- `operator/index.html`
- `operator/build.json`

## Règle de synchronisation

Le MASTER fournit le runtime.
Le dépôt Operator fournit la couche Yohan.
Ne jamais recopier aveuglément tout le MASTER dans ce dépôt.
