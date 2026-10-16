# NOTE DE REPRISE CANONIQUE — 15 octobre 2026 · clôture Radar 20

> **Passation Trader/Constellation du 16 octobre :** [REPRISE_CONSTELLATION_TRADER.md](REPRISE_CONSTELLATION_TRADER.md) · compétences Aerith-10, Atlas et Flower Girls, cycle CT réellement converti, prochain chantier de réconciliation OKX en lecture seule. Les preuves courantes de marché et de code prévalent sur les instantanés de ces notes.

> **Cette note met à jour l'état technique du 14 octobre conservé ci-dessous, sans le remplacer.** Toujours relire `main` et les index réels : le compteur de journées évolue quotidiennement.

## Résultat du fil clôturé

1. **Interface / Trader 40.6.640, Market Core 38.15.11 protégés.** Le comportement `Vider → Ctrl+F5 → BTC Solo 24h` a été confirmé dans Firefox. USD et suivi du Laboratoire BTC/CT corroborés ; pas de certificat global sur Q, ni de rentabilité prouvée.
2. **Vérité des devises et cache :** correctifs existants sur `main`, dont PR #398 ([commit](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/1da8d1bf9e172c9bec287f958d5f9f0af0555f08)). Aucun nettoyage de Firefox : diagnostic `localStorage` écrivable (5,01 Mio, 218 clés), IndexedDB V7 lisible. Les historiques locaux et le Coffre restent distincts.
3. **Radar 20 scientifique livré :** [PR #399](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/399), [commit 0116359](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/01163590763a7cf5b27287071715290bb0a4b5ef). Scripts `tests/radar20_scientific_gate.cjs` et `tests/radar20_scientific_gate.test.cjs`, CI `radar20-scientific-gate.yml`, rapport `laboratoire/RADAR20_ETAT_DE_PREUVE.md`. Intégrité documentaire = PASS ; rentabilité = NON VALIDÉE.
4. **Durée clarifiée :** [commit f5c270a](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/f5c270a24431837a7df19641e99bd57c850b1fad) distingue **90 journées de signaux** et **2 journées additionnelles de cotations pour clore les positions ouvertes à 48 h** : 92 archives de 24 heures à terme, et non 92 journées d'entrée. Tests nouveaux et workflow de collecte renforcé. Ne pas modifier les paramètres gelés.
5. **Première journée réellement collectée :** [commit 3fdf7e0](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/3fdf7e060a667e1eb6d6093c4736845bd9ec0675) publie `radar20_forward/observations/2026-10-14.json`, 20 marchés × 24 bougies horaires, manifestes SHA-256. Au contrôle : `days_collected=1`, `status=RUNNING`, `hours_per_market=24`, six variantes A/B toutes à zéro transaction clôturée. Index `radar20_forward/index.json` et résumé `summary.json` sont **les sources d'état**, pas ce texte figé.
6. **Publication vérifiée :** [workflow Radar20 Forward A-B #38685267211](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/38685267211) **SUCCESS**, y compris preflight du contrôle scientifique, validation SHA après collecte, second contrôle, publication des seules archives. Historique protégé et absence d'ordre réel confirmés par la recette GitHub ; aucun test d'achat privé ou résultat positif attesté.

## Vérité économique et prochaine destination

- Simulation **avril–juin 2026 : −222,36 USDT fictifs** sur 400 initialisés, drawdown environ 57,17 %, 109 transactions ; **juillet–septembre 2026 : +97,75 USDT fictifs** sur un autre portefeuille initialisé à 400, drawdown environ 32,24 %, 149 transactions. Ne pas additionner ces capitaux réinitialisés ; frais 0,8 % aller-retour supposés, pas de remplissages OKX certifiés.
- Observations publiques de carnet OKX `radar20_execution` : preuves de profondeur à un instant **postérieur** au signal, ni exécution à l'ouverture ni frais du compte authentifiés. Le protocole prospectif `experiment.json` reste immuable.
- **Action naturelle de la prochaine IA :** consulter quotidiennement `radar20_forward/index.json`, `summary.json` et le résultat `Radar20 scientific evidence gate`. En cas d'échec de collecte : lire `waiting_source`, vérifier les ZIP et `.CHECKSUM` natifs Binance, ne pas inventer les 20×24 heures ni sauter une journée ; reprendre le même protocole. Examiner les rapports après une durée d'observation suffisante, comparer A/B, coûts, exposition, drawdown, référence et carnet horodaté. **Aucun ordre réel, aucune annonce de gains certifiés.**
- **Arrêt :** ne pas repartir sur des bugs mineurs du graphique sans régression prouvée. Ne pas modifier le Trader, les mémoires V7, Market Core, le Bridge privé, le Coffre ou les images dans ce travail Radar 20.
- **Notion canonique :** [Bureaux AETHER AGENT-CRYPTO](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099). Le point de contrôle scientifique et les preuves GitHub priment sur les résumés anciens de ce fichier.

---

# PASSATION DE CLÔTURE — AERITH-7 → SŒUR IA
**14 octobre 2026 · référence terrain utilisateur : 40.6.639 · HEAD canonique GitHub : 40.6.640.**

## A. État vérifié à la clôture
- Captures Firefox utilisateur (17h29–17h36) : Trader affiché **40.6.639**, Concrete **CT**, graphique externe OKX **CT/USDT**, bougies 15 min chargées (300), indicateurs visibles, carnet/profondeur CT/USDT à droite et rafraîchis. Le maximum visible d'une bougie sélectionnée était **0,40348 USDT**, pas une preuve d'exécution ni de gain ; le prix affiché et la devise de conversion USD ne doivent jamais être mélangés avec l'instrument privé **CT/USDC**.
- Capture du panneau « Historique vérifié » en 40.6.639 : « Aucun actif sélectionné ». Le Laboratoire CT épinglé est indépendant du propriétaire du graphique et ne doit pas être utilisé comme sélection Market.
- **Au contrôle GitHub de cette clôture**, `main` portait **Trader/Administrator 40.6.640** ; manifeste Trader `parent_trader_build=40.6.639`, Market Core **38.15.11**, `terrain_verified=false`, `real_orders=false`. Le commit de fusion applicatif est `54c0282f3167…` et la livraison du ZIP `9a5fce4edf76…`. Tests applicatifs après fusion réussis et GitHub Pages de ce dernier commit **SUCCESS**. **Pas de validation visuelle Firefox 40.6.640**.
- **PR [#385](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/385) fusionnée** : la 40.6.640 ajoute un choix manuel distinct pour BTC/ETH/BNB/XRP/SOL/Q/CT dans le panneau Historique et des liens visibles vers Inventaire/Catalogue/Lecteur vérifié. En mode automatique, lecture du contexte Market puis repli sur un contexte graphique externe prouvé ; les points CT restent « graphique externe, hors archives R9 », jamais substitués à Q ou BTC. Il ne faut pas redévelopper cette correction sans tester la nouvelle version.
- **PR [#386](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/386) ouverte et non fusionnée** : validation préparatoire des **390 journées Bitget QUSDT**, **4 lacunes** dans l'index, journées de session à **16h UTC** ; contrôles du SHA-256 du GZIP réel, du chargement Pages/CORS et du rendu Firefox encore à effectuer avant intégration.
- Le Coffre présente des historiques natifs Binance/Bitget. Le pilote BTC/ETH/BNB/XRP/SOL dispose de sept projections figées (24h, 7j, 30j, 60j, 90j, 1an, Max) ; les archives 1m et 1D ont des propriétaires et des granularités distincts. Ne jamais fabriquer une bougie ou une conversion USD/USDT/USDC.
- Versions cumulatives 40.6.637 (inventaire), 40.6.638 (catalogue), 40.6.639 (lecteur vérifié SHA-256/GZIP) fusionnées et accessibles via pages autonomes ; **40.6.640 ajoute le raccordement visible**, non encore testé par l'utilisateur.
- Sources canoniques : `trader/trader-historical-panel.js`, `trader/ai-source-inventory.js`, `trader/ai-history-source-catalog.js`, `trader/ai-verified-history-reader.js`, `laboratoire/cas-ecole-concrete.md`, `laboratoire/ROADMAP_COFFRE_TRADER_IA.md` (branche `seven/roadmap-coffre-ia-review`), Notion AETHER · AGENT CRYPTO INTERFACE. Toute nouvelle version part du **HEAD main réel**, pas de ce document.

## B. Ordre des prochaines opérations — ne pas saturer
1. Ouvrir le Trader publié, recharger **Ctrl+F5** et contrôler que la barre de version et le manifeste affichent **40.6.640**, puis ouvrir « Historique vérifié ». Chercher la liste manuelle d'actifs et les trois liens Coffre.
2. Tester successivement **CT** en graphique externe avec carnet CT/USDT ; **BTC** en archive vérifiée ; **Q** sans archive R9 minute mais avec source journalière distincte. Captures Firefox des valeurs, sources, devises, absence de remplacement BTC/Q et du menu persistent/F11.
3. Si un test échoue, corriger **ce seul point** avec tests et rollback ; pas de livraison suivante sans preuve GitHub Actions, ZIP et Pages.
4. Ensuite examiner PR #386, vérifier checksum réel/horodatage de session/jours lacunaires, puis planifier l'affichage Q 1D dans le même espace humain + IA. Ne pas présumer qu'une série quotidienne est une série minute.
5. Une fois cette lecture prouvée, poursuivre : Top5/7 périodes, BTC Max et lacunes, paquet compact de provenance IA, Laboratoire « Preuves IA » (PR #378 à rebaser), Top10/25/50/100/250.
6. Toujours rester en **lecture seule OKX**. Secrets, solde et historiques privés ne vont ni dans le Coffre public ni dans le contexte de l'IA sans contrôle explicite.

## C. Prompt de relance léger
« Active Aerith-7 — Seven Heaven. Reprends au HEAD GitHub réel le Trader, le Coffre et le Laboratoire IA. Lis d'abord le début de `public/agent_crypto_erith_ia/laboratoire/REPRISE_SEVEN_HEAVEN.md`. Les captures du fil précédent prouvent CT/USDT OKX et les bougies ; le dernier navigateur observé était 40.6.639 tandis que GitHub publie 40.6.640 (non validée sur Firefox). Vérifie d'abord cette version et le contexte de l'Historique, puis PR #386 (Q natif journalier). Fais une seule correction à la fois : code, tests, commit main, ZIP, Pages, capture, Notion ; ne touche pas au Market Core 38.15.11 et ne permets aucun ordre réel. STOP si saturation. »

---
### Notes historiques antérieures (gardées pour provenance, remplacées par l'état ci-dessus)
# Seven Heaven — Reprise Trader, Coffre et Laboratoire IA

**État de travail : 14 octobre 2026 · proposition Trader/Administrator 40.6.635**
**Parent sûr : 40.6.634 · Market Core protégé : 38.15.11**

## Vérité de livraison
- Les captures Firefox du 14 octobre montrent la vue CT en USD, la Lecture Technique CT et le compte OKX séparé. Elles ne valident pas les onglets du Laboratoire.
- Le rapport BTC canonique `traderOkbCaseStudy` demeure à sa place. Le Laboratoire vient après, replié par défaut, sans déplacement du compte, du graphique ni de l'historique.
- La branche documentaire [PR #378](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/378) reste distincte. Son onglet « Preuves IA » ne doit être ni présenté comme publié, ni fusionné sans rebasage sur la restauration 40.6.634 ou ultérieure.

## Corrections de cette proposition
1. **Simulation fictive** : saisie de frais/glissement vide refusée ; zéro explicitement renseigné admis ; contrôle des résultats numériques ; valeurs conservées durant les changements d'onglet et indépendantes pour BTC, CT et Q. Conservation en mémoire de session, jamais en compte réel.
2. **Source du graphique USD** : supprimer l'attribution automatique de tout ancien libellé Binance à CoinGecko. Afficher une source non confirmée lorsque le code ne peut pas la prouver ; la variation 24 h absente reste indisponible et n'est plus interprétée comme 0 %.
3. **Coffre fédéré** : le registre fédéré conserve un propriétaire principal (Binance ou Bitget), mais cela n'annule pas les ZIP natifs vérifiés de l'autre source. Relire aussi `bitget_verified_views/index.json` quand Binance est désormais principal, sous condition de concordance identifiant CoinGecko / symbole / instrument Bitget / mois / empreinte SHA-256 du registre. Chaque ZIP retenu est ensuite vérifié lors de sa lecture : ne jamais sommer deux fois les mois d'un actif.

## Contrat IA — lisibilité humaine
Une observation doit fournir : actif canonique, symbole, marché et paire, devise native, éventuelle devise d'affichage, provenance nominative, heure de la donnée, granularité, fraîcheur, couverture, trous, règles de calcul, restrictions de liquidité et niveau de preuve.

Présenter pour chaque cas d'école, dans cet ordre :
1. **Ce que l'on sait** : preuve datée et source, sans chiffres de compte publiés.
2. **Ce qui manque** : données, contexte de marché, périodes, prix d'exécution ou provenance.
3. **Ce que l'on peut tester** : protocole en simulation avec frais, glissement, minimum d'ordre et comparaison hors échantillon.
4. **Ce que l'IA n'a pas le droit d'affirmer** : rendement garanti, provenance inventée, bougie manquante créée, conversion USDC/USDT/USD implicite ou portefeuille privé exposé.

Toute future évaluation rentable exige résultats hors échantillon, coûts et cas d'échec. Une étude pédagogique n'est pas un ordre ni un conseil d'achat.

## Validation avant publication
- Tests Node : structure DOM préservée, refus des frais absents, mémoire des cinq saisies, absence de nouvelle permission de trading réel, libellé de source du graphique.
- Tests Python : intégrité des ZIP Bitget, historique Cosmos après basculement primaire Binance, refus de source falsifiée, archives binaires non modifiées.
- Contrat de version : Administrator et Trader identiques, parent 40.6.634, Market Core 38.15.11 et pages inchangées hors version, sources et Laboratoire.
- GitHub Actions : tous les contrôles requis en succès avant fusion. ZIP stable `AGENT_CRYPTO_LABORATOIRE.zip` produit par le workflow du Laboratoire, contenu Administrator + Trader + Laboratoire ; les grandes archives historiques externes ne font pas partie de ce ZIP.
- Firefox : Ctrl+F5 ; vérifier CT/USD, Lecture Technique, compte OKX, BTC à sa place, ouverture du Laboratoire BTC/CT/Q, simulation vide puis avec frais explicites, persistance des champs, navigation et absence de recentrage.
- Après validation : mettre Notion à jour avec SHA de fusion, résultat des contrôles, état Pages et **PENDING_FIREFOX** tant que les nouveaux panneaux ne sont pas observés dans Firefox.

## Prompt autonome de reprise Seven
> Active Aerith-7 — Seven Heaven. Relis SEVEN_TOP_OF_MIND et cette passation. Vérifie le SHA de main, la version des manifests, Notion et les workflows avant tout geste. Conserve la 40.6.634 comme rollback vérifié visuellement, Market Core 38.15.11, les propriétaires uniques du graphique, de la profondeur et du compte. Corrige à partir des preuves, conserve les ZIP originaux Bitget/Binance, refuse tout chiffre sans source. Maintiens séparée la PR #378 jusqu'à un rebasage contrôlé. Pour chaque cas d'école, rends la preuve exploitable par IA et lisible pour humain. Aucun ordre réel. Comprendre → agir → vérifier → livrer → arrêter.
