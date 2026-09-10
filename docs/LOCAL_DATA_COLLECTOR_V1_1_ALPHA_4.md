# Agent-Crypto @erith.IA — Local Data Collector V1.1-alpha.4

## Rôle

Commencer une mémoire exploitable sans backend.

## Où sont stockées les données ?

Dans le navigateur, via LocalStorage.

## Pourquoi ?

Parce que GitHub Pages est public et statique.
Cette étape permet de tester le principe de collecte avant la future base locale sur PC Ryzen 7.

## Limite

Le collecteur ne tourne pas tout seul en arrière-plan.
Il enregistre un snapshot quand l’utilisateur clique.

## Future étape Ryzen 7

Remplacer ou compléter LocalStorage par :

```text
SQLite
JSONL
scheduler local
logs horodatés
scoring
analyse IA
```

## Sécurité

Ne jamais stocker :

```text
clé API
wallet
seed phrase
compte réel
droit de retrait
ordre réel
donnée personnelle
```
