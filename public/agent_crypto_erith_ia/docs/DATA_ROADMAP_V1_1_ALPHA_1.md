# Agent-Crypto @erith.IA — Data Roadmap V1.1-alpha.1

## Vision

L'application doit évoluer vers un observatoire de données crypto, puis vers un assistant de décision contrôlé.

## Principe important

GitHub Pages est public et statique.
Il peut afficher des données et publier des fichiers non sensibles, mais il ne doit pas contenir :

- clés API privées ;
- wallet réel ;
- seed phrase ;
- droits de retrait ;
- droits de trading réel.

## Données publiques possibles

Ces données peuvent être stockées en JSON/CSV publics si elles ne contiennent rien de personnel :

- snapshots prix BTC / ETH / SOL ;
- capitalisation ;
- volume ;
- variation 24h / 7j / 30j ;
- statut des sources ;
- score pédagogique calculé ;
- historique de simulation anonymisé ;
- règles de prudence ;
- listes de cryptos à surveiller.

## Données privées futures

Ces données doivent rester sur backend local privé :

- compte exchange ;
- clé API ;
- logs détaillés d'accès ;
- soldes réels ;
- ordres réels ou préparés ;
- identité opérateur ;
- configuration de sécurité.

## Chemin recommandé

1. Public : observation + simulation.
2. Local : base de données SQLite ou fichiers JSONL.
3. Collecteur : snapshots réguliers.
4. Scoring : signaux prudents.
5. IA : scénarios et explications.
6. Plus tard : lecture seule Kraken.
7. Beaucoup plus tard : micro-trading contrôlé avec validation humaine.

## Vocabulaire à utiliser

Dire :

- signal ;
- scénario ;
- prudence ;
- surveillance ;
- simulation ;
- hypothèse.

Éviter :

- promesse de gain ;
- certitude ;
- achat recommandé ;
- conseil financier garanti ;
- robot autonome non contrôlé.
