# ERITH.IA — Accès IA aux flux historiques, pilote ETH

**Nature : documentation du pilote Trader Flux, publication sous contrôle.**

## Le problème réel

Le ZIP `ETHUSDT-1m-2026-09.zip` du Coffre historique est conservé en GitHub Release. Il est réutilisable par un exécuteur qui sait télécharger les octets. Mais un LLM conversationnel, ou un lecteur texte, n'a pas systématiquement la capacité de récupérer/décompresser ce binaire. Les vues historiques existantes (OHLCV) n'exposent pas encore tous les champs natifs d'achats agressifs.

## Destination

Les archives authentiques restent **une seule fois dans les Releases du Coffre**. Un job GitHub Actions récupère le ZIP original, compare son empreinte SHA-256, lit et vérifie ses 43 200 bougies de 1 minute avec **12 colonnes**, calcule les flux horaires ETH/USDT, puis construit des **vues publiques en JSON texte**.

Chemin de publication proposé :

`public/agent_crypto_erith_ia/data/trader_flux/`

* `index.json` : carte d'accès à tous les flux dérivés ;
* `ETHUSDT/2026-09/index.json` : provenance, schéma, 30 journées, empreintes et 720 heures contrôlées ;
* `ETHUSDT/2026-09/days/01.json` à `30.json` : 24 lignes horaires par jour ;
* `ETHUSDT/2026-09/summary.json` : statistiques agrégées et essais fictifs **non certifiés**, sans journal exhaustif des transactions.

Exemple d'URL **future uniquement, après publication réussie** :

`https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/data/trader_flux/ETHUSDT/2026-09/index.json`

Chaque vue journalière explicite **USDT** ; aucun renommage trompeur en USD. Aucune donnée de compte OKX, aucun ordre réel.

## Installation et première vérification

Ce pack préserve l'arborescence GitHub. Ajouter uniquement les fichiers des dossiers `.github/` et `public/` dans le dépôt. Exécuter les tests et créer un seul commit contrôlé. Ne pas écraser les scripts natifs du Coffre.

Le workflow `Agent Crypto Trader Flux Historique` démarre en vérification non destructive sur `push` et possède aussi un déclenchement manuel `workflow_dispatch` :

1. D'abord `publish = false` : l'exécution télécharge le ZIP depuis la Release, vérifie le SHA, analyse les données réelles, puis rend le résultat téléchargeable comme artifact Actions (`trader-eth-flux-json`). Rien n'est publié dans GitHub Pages.
2. Après consultation des résultats : `publish = true` : même vérification obligatoire, puis **un commit du seul sous-dossier `data/trader_flux`** pour rendre les petits fichiers JSON disponibles via GitHub Pages. Si l'archive manque ou si une vérification échoue, aucune publication.

*Le lancement réel du workflow, l'accès au ZIP depuis GitHub Actions et le déploiement Pages ne sont PAS encore démontrés par ce pack. Ils nécessitent une première exécution sur GitHub.*

## Contrôles effectués localement

Commande à la racine du pack :

```
python -m unittest discover -s public/agent_crypto_erith_ia/tools -p 'test_eth_flow_pilot.py' -v
python -m unittest discover -s public/agent_crypto_erith_ia/tools -p 'test_publish_trader_flux.py' -v
```

8 + 6 = **14 tests réussis**, y compris publication simulée de 30 jours, empreintes des fichiers dérivés, absence de signal d'ordre, stratégie non certifiée, refus d'archive incorrecte et déterminisme.

**Limite** : les tests locaux utilisent des entrées synthétiques. Ils prouvent le fonctionnement du programme, **pas** l'existence de résultats réels ETH. Le ZIP source n'est pas présent dans le pack.

## Architecture à généraliser après le pilote

- Pour 20 actifs × 3 mois, index global puis partitions par paire, mois et jour ; chaque IA ne lit que l'index puis les jours utiles.
- Pour le Trader, consommation directe des JSON par un lecteur non destructif, **après** validation des données. Aucune modification graphique n'est nécessaire pour le pilote.
- Pour une IA locale et son Bridge, le même index sert de catalogue et de routage vers les jours nécessaires. Le Bridge peut les mettre en cache sans nouveau Coffre de prix.
- Les bougies OHLCV déjà publiées restent celles du Coffre. Les flux ajoutent un **jeu de données dérivé** et non une archive historique de prix concurrente.
- Les historiques seuls ne donnent pas les spreads et la liquidité exécutable OKX passée. Les essais sont indicatifs tant que ces données ne sont pas réunies.

## Frontière d'écriture

**À ce stade : aucun commit GitHub, aucun workflow lancé, aucun changement de Trader/Market Core/Bridge/Coffre.** Publier seulement après une instruction explicite de l'opérateur.
