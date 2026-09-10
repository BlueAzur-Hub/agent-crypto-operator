# Build 29.3.07 — Stable Stack Metadata Correction

Correction ciblée sans changement fonctionnel :
- `ATLAS_STABLE_STACK.interface` corrigé vers `Build 29.3.07`.
- `ATLAS_STABLE_STACK.controlCenter` corrigé vers `V2.3.1R1`.
- Bridge `V1.9.1` et modèle `gpt-oss:20b-32k` inchangés.
- Contrôleur déterministe 29.3.06 inchangé.

---

# Build 29.3.07 — Version Control Deterministic Human-Readable Lock

Cette Build part exactement de la 29.3.05 et remplace uniquement le cœur du contrôleur de version dans `web/app.js`, plus l’identité distante dans `web/version.json`.

## Correction racine

- Une seule valeur de version est désormais saisie manuellement : `ATLAS_BUILD`.
- `ATLAS_RELEASE` et `ATLAS_ASSET_TOKEN` sont dérivés automatiquement du Build.
- Suppression du faux contrôle `atlasVersionRuntimeIdentity()` qui comparait les constantes avec elles-mêmes.
- Suppression des anciens états persistants `agent_crypto_expected_build`, `agent_crypto_expected_token` et `agent_crypto_update_started_at` comme source de décision ; ils sont seulement nettoyés au démarrage pour migration.
- Suppression des états `publishing` et `repair`. Une propagation GitHub temporaire devient `Synchronisation GitHub`, sans présenter une anomalie transitoire comme une corruption locale.
- Une Build distante supérieure n’est proposée qu’après vérification de l’identité de son `app.js` et, si présent dans le manifeste, de son SHA-256.
- Une Build locale supérieure au manifeste distant est traitée comme une synchronisation GitHub temporaire, pas comme une panne.
- Après rechargement, la confirmation repose uniquement sur les paramètres URL demandés et l’identité réellement chargée ; aucun ancien `sessionStorage` ne peut bloquer la page.

## Architecture humaine

Le flux devient :

`app.js local -> version.json GitHub -> comparaison numérique -> vérification app.js distant si Build supérieure -> charger -> confirmer`.

Le contrôleur n’essaie plus de gérer huit états ni de faire passer un délai de propagation GitHub pour une incohérence permanente.

## Périmètre protégé

- Bridge inchangé.
- Atlas / Aerith / NØX inchangés.
- Math Core inchangé.
- Market, Graphique, Target Top 5, Market Flow, Métaux, News Sentinel, Decision Board, simulation, mémoire et parcours pédagogique inchangés.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` et assets inchangés.
- Aucun ordre réel, aucune clé API, aucun wallet.

## Test attendu

1. Publier les quatre fichiers du ZIP.
2. Ouvrir l’interface et attendre la propagation GitHub Pages.
3. Le badge doit afficher `Market Core V2.0-Alpha · Build 29.3.07`.
4. Un clic sur le badge doit soit confirmer la version courante, soit afficher temporairement `Synchronisation GitHub · Build 29.3.07` pendant la propagation.
5. L’ancien message `Publication Build ... incomplète · Revérifier` ne fait plus partie du contrôleur 29.3.06.

---

# Agent-Crypto @erith.IA — Market Core V2.0-Alpha

**Version publique préparée :** Market Core V2.0-Alpha · Build 29.3.05  
**Build :** 29.3.05  
**Mission :** Atlas 5/5 Direct Start Gate Lock


## Build 29.3.05 — Version Identity Repair Lock

Correction ciblée du contrôle de publication après la 29.3.04.

### Cause exacte réparée

Le fichier `app.js` 29.3.04 affichait bien `ATLAS_RELEASE = Build 29.3.04`, mais conservait par erreur :

- `ATLAS_BUILD = 29.3.03` ;
- `ATLAS_ASSET_TOKEN = market-core-v2.0-alpha-build-29.3.03`.

Le manifeste `version.json` déclarait correctement 29.3.04. Le contrôleur de version comparait donc une application qui se présentait encore comme 29.3.03 à un manifeste 29.3.04 et classait la publication comme incomplète.

### 29.3.05

- identité de Build synchronisée dans `ATLAS_RELEASE`, `ATLAS_BUILD` et `ATLAS_ASSET_TOKEN` ;
- carte de pile `Interface` synchronisée sur Build 29.3.05 ;
- manifeste `version.json` synchronisé ;
- empreinte SHA-256 de `app.js` recalculée après correction ;
- aucun changement du verrou Binance 5/5, d'Atlas, de NØX, d'Aerith, du Bridge ou du Math Core.

---

## Build 29.3.04 — Atlas 5/5 Direct Start Gate Lock

Cette Build conserve intégralement la chaîne 29.3.03 (Atlas → News/Risk → NØX No-FOMO → Aerith) et corrige le démarrage automatique canonique.

### Verrou de départ

- Atlas reste **armé** tant que les cinq cotations Binance EUR directes ne sont pas présentes et fraîches.
- À `4/5`, aucun paquet Atlas canonique n'est produit et le dernier paquet IndexedDB valide reste affiché.
- L'attente n'expire plus arbitrairement après 90 secondes : le scheduler continue à surveiller l'état de readiness.
- La transition réelle `4/5 → 5/5 directes` réveille immédiatement l'orchestrateur.
- Dès `5/5 directes`, si Bridge, CoinGecko, graphique et empreinte sont prêts, Atlas lance automatiquement les quatre rapports.
- Après validation `4/4`, la chaîne 29.3.03 continue : NØX No-FOMO puis conclusion Aerith et persistance IndexedDB.
- Une paire dérivée peut rester exploitable pour une **question libre**, mais elle ne satisfait pas le verrou de production canonique automatique.

### Démarrage de page

Le polling Bridge et l'orchestrateur dépendent désormais de la session opérateur autorisée, pas de la vue Basic/Intermédiaire/Administration actuellement affichée. L'analyse automatique peut donc rester armée dès le chargement de la page.

### Non-régression

Bridge V1.9.1, Control Center V2.3.1R1, GPT-OSS 20B-32K, NØX, News Sentinel, Risk Sentinel, Math Core V3, Market, Graphique, Target Top 5, Métaux, simulation, Modules 01–11, IndexedDB et sécurité lecture seule restent inchangés.

---

## Build 29.3.03 — Aerith News Intelligence + NØX No-FOMO Recovery Lock

Cette Build part de la 29.3.02 et conserve son orchestrateur automatique. Elle reconnecte le rôle historique de NØX Risk Auditor au bloc No-FOMO existant et enrichit la conclusion Aerith avec les informations News Sentinel déjà présentes dans le Fact Contract.

### Chaîne analytique

`Snapshot → Atlas 4/4 → Risk/Truth/Evidence → NØX No-FOMO → Aerith-10 Crypto → IndexedDB`.

- NØX ne calcule aucun prix et ne remplace ni Atlas ni Risk Sentinel.
- NØX classe le contexte en `CALME`, `PRUDENCE` ou `STOP` à partir des stop gates, de la qualité Math Core, des sources, de la couverture et du rapport preuve/impact des news.
- Une actualité à fort impact mais à preuve faible augmente le refroidissement ; aucune causalité marché n'est inventée.
- Aerith reçoit désormais le dossier News Sentinel et l'audit NØX dans sa conclusion, en plus des quatre rapports Atlas.
- L'actualité directrice, sa source/preuve, son impact potentiel et les actifs/secteurs déclarés peuvent être rappelés dans la synthèse Aerith sans devenir un signal d'exécution.
- Les règles `information manquante`, `corrélation ≠ causalité`, No-FOMO et validation humaine sont conservées.

### Bridge associé

Bridge V1.9.1 : prise en charge de `agent_crypto_nox_no_fomo_v1`, enrichissement News/NØX du contexte GPT-OSS et de la conclusion déterministe Aerith. Compatibilité V2/V3 conservée.

### Non-régression

- Orchestrateur 29.3.02 conservé.
- GPT-OSS `gpt-oss:20b-32k` et contexte 32768 conservés.
- Market, Graphique, Target Top 5, Market Flow, Math Core V3, Métaux, News Sentinel, Watchlist, Decision Board, simulation, Modules 01–11, CSS/HTML/assets et verrous Firefox inchangés.
- Aucun ordre réel, wallet, clé privée, écriture GitHub ou action exchange.

---

## Build 29.3.02 — Atlas Automatic Orchestrator Recovery Lock

La 29.3.02 reste la base de l'orchestrateur automatique : déclenchement fingerprint, retry Bridge/readiness, 4 rapports Atlas puis conclusion.

---

## Build 29.3.00 — Atlas-10 / Aerith-10 GPT-OSS Local Stack Recovery Lock

Cette Build ouvre la branche 29.3 depuis la 28.3.60 validée. Elle ne reconstruit ni le Market, ni le Graphique, ni les Modules 01–11. Elle réaligne uniquement la pile locale Atlas/Aerith sur le nouveau Bridge V1.9.0 et le moteur Ollama `gpt-oss:20b-32k`.

### Pile canonique

- Control Center V2.3.0R1.
- Bridge Atlas V1.9.0, localhost 127.0.0.1:8787, lecture seule.
- GPT-OSS 20B-32K comme moteur local.
- Fact Contract V3 `atlas_crypto_fact_contract_v3_truth_evidence` reconnu nativement ; V2 conservé pour reprise.
- Source Truth V2, Evidence V2, Math Quality Gates V2, Contradictions V2 et empreinte analytique conservés.
- Quatre rapports Atlas → conclusion Aerith conservés dans IndexedDB.

### Correction fonctionnelle

La Question libre et les analyses locales ne doivent plus être refusées parce que l’Interface envoie un contrat V3 alors que l’ancien Bridge attendait V2. Le Bridge V1.9.0 accepte et valide les deux schémas sans affaiblir les règles de vérité.

### Non-régression

- Build 28.3.60 conservée comme base visuelle et pédagogique.
- Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board, simulation et Modules 01–11 inchangés.
- Aucune action exchange, wallet, GitHub ou UI.
- Aucun ordre financier réel.

---

## Build 28.3.60 — Module 03 Visible-Step No-Valse Lock

Cette Build part exactement de la 28.3.59 publiée et ne change ni les calculs ni la pédagogie ajoutée dans cette version. Elle corrige uniquement le comportement du viewport du Module 03 observé sous Firefox.

### Contrat de viewport du Module 03

**Une action utilisateur = aucun déplacement si l’étape suivante est déjà lisible ; sinon un seul cadrage après stabilisation.**

- Le guard Firefox `overflow-anchor:none` est posé avant chaque rerender du Module 03.
- Après sauvegarde/persistance et deux frames stables, la prochaine carte est inspectée.
- Si son début utile et ses contrôles sont déjà visibles, la page reste exactement où elle est.
- Si la carte n’est pas réellement utilisable dans le viewport, un seul cadrage non lissé est autorisé.
- Aucun second recentrage différé n’est programmé.
- Les actions concernées sont : chargement des coûts, montant engagé fictif, scénario −3 %, scénario +5 % et conclusion finale.
- Les actions principales « scénarios » et « résultat net » utilisent la même règle visible = immobile.

### Périmètre protégé

- Pédagogie débutant et déverrouillage local du Module 03 de la 28.3.59 conservés.
- Module 01 viewport 28.3.58 inchangé.
- Module 02 inchangé.
- Modules 04–11 inchangés.
- Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board, Bridge, données live et simulation métier inchangés.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` et assets inchangés.

### Test Firefox attendu

Dans le Module 03, lorsque les cartes Étape 2, Étape 3 et Étape 4 sont déjà visibles comme sur la capture de validation, cliquer **« Charger l’exemple école »**, puis **« Engager fictivement 50 € »**, puis **−3 %** ne doit provoquer aucun saut. Lorsque l’étape suivante est hors écran, un seul cadrage est autorisé.


## Build 28.3.59 — Module 03 Beginner Pedagogy + Risk Position Unlock

Cette Build part exactement de la 28.3.58 publiée. Les essais réels du parcours ont révélé un verrou du Module 03 ; cette version le corrige et améliore sa pédagogie débutant sans toucher au contrat de viewport stabilisé en 28.3.58.

### Bug corrigé

L’étape 3 du Module 03 utilisait encore `runSchoolTest("safe_btc_5")`, qui exige désormais une cotation Binance fraîche pour une simulation d’exécution. Le Module 03 pouvait donc afficher 50 € de position dans le simulateur tout en refusant d’enregistrer la preuve pédagogique `risk_position`; les boutons −3 % / +5 % restaient alors verrouillés.

Le Module 03 possède maintenant son propre exercice local :

**50 € engagés sur 1 000 € → exposition 5 % → scénarios −3 % / +5 % → brut / net.**

Aucune cotation Binance fraîche n’est requise pour cette démonstration en pourcentage. Aucun ordre réel, aucune clé API et aucun wallet ne sont utilisés.

### Pédagogie débutant V2

Règle générale : **mot simple d’abord → jargon professionnel ensuite → exemple concret → vérification.**

- `Montant engagé` puis `(taille de position)`.
- `Part du capital engagée` puis `(exposition)`.
- `Gain/perte avant coûts` puis `(P/L brut)`.
- `Gain/perte après coûts` puis `(P/L net)`.
- `Écart achat / vente` puis `(spread)`.
- `Écart entre prix attendu et prix exécuté` puis `(slippage)`.
- `Baisse depuis le dernier sommet` puis `(drawdown)`.
- `Récupération` = hausse nécessaire pour revenir au dernier sommet.

Le parcours rappelle aussi la perte maximale acceptable, la règle d’arrêt et le seuil de rentabilité. L’exemple école reste explicitement pédagogique : 0,60 % de coûts aller-retour, soit environ 0,30 € sur 50 € ; ce n’est pas un tarif réel de plateforme.

### Périmètre protégé

- Module 01 Livecheck / viewport 28.3.58 inchangé.
- Module 02 et son exigence de cotation Binance fraîche pour l’achat fictif inchangés.
- Modules 04–11 inchangés.
- Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board, Bridge et données live inchangés.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` et assets inchangés.

### Test attendu

Dans le Module 03, après avoir chargé l’exemple école, cliquer **« Engager fictivement 50 € »**. L’étape 3 doit devenir verte immédiatement et les boutons **−3 %** et **+5 %** doivent devenir utilisables, même sans cotation Binance fraîche. Le viewport ne doit effectuer qu’un seul cadrage vers l’étape 4.


## Build 28.3.58 — Module 01 Livecheck Market Single Focus Lock

Cette Build part exactement de la 28.3.57 publiée. Le test Firefox réel a révélé une régression du Module 01 : le Livecheck ne cadrait plus le Market au clic et pouvait encore déclencher une navigation automatique tardive vers Bitcoin.

### Contrat corrigé du Module 01

**Clic Livecheck → cadrage immédiat du Market UNE fois → Livecheck + preuve IndexedDB → aucun autre déplacement automatique.**

La ligne Bitcoin devient une destination uniquement lorsque l’utilisateur clique explicitement sur **« Voir la ligne Bitcoin »**.

### Corrections ciblées

- Restauration de `atlasLearningPrimeLivecheckMarketFocus()` au début du Livecheck pédagogique.
- Le guard Firefox est posé avant ce cadrage et reste actif pendant les mutations asynchrones.
- Suppression de la cible finale automatique `Bitcoin row || Market` après validation du Livecheck.
- Après la preuve IndexedDB et le rerender du cockpit, le guard est restitué sans nouveau scroll.
- Le message de l’action principale décrit désormais le comportement réel : Market immédiat, puis aucune navigation automatique.
- Le bouton **« Voir la ligne Bitcoin »** conserve son routage explicite et reste la seule action autorisée à déplacer le viewport vers Bitcoin.

### Périmètre protégé

- Aucun calcul, aucune donnée live, aucun scénario pédagogique et aucune preuve métier modifiés.
- Modules 02–11 inchangés par cette Build.
- Reset in-place 28.3.54 inchangé.
- Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board, Bridge et simulation métier inchangés.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` et assets inchangés.

### Test Firefox attendu

Sur Module 01 étape 2 : cliquer **Livecheck**. Le Market doit se cadrer immédiatement une seule fois et rester en place pendant/après le chargement. Aucun saut vers Bitcoin ne doit survenir quelques secondes plus tard. Bitcoin ne doit être cadré qu’après un clic explicite sur **« Voir la ligne Bitcoin »**.


## Build 28.3.57 — All Modules Guided Viewport Consolidation Lock

Cette Build part de la 28.3.56 préparée et applique l’audit transversal des Modules 01 à 11. La règle devient globale : **le feedback explique, le routeur Learning déplace**. Aucun feedback pédagogique n’a le droit de déclencher un second scroll.

### Contrat commun Modules 01–11

**Une action → verrou avant mutation → blur → sauvegarde/rerender → attente IndexedDB + stabilité → UN seul cadrage final → restitution du navigateur.**

### Corrections

- Les cibles appartenant au parcours Learning ne sont plus scrollées par `setActionFeedback()`.
- `foundationFeedback()` devient strictement informatif et ne possède plus le viewport.
- `handleFoundationAction()` ouvre lui-même la transaction de viewport, y compris lorsqu’il est appelé programmatiquement.
- La validation de leçon, l’archivage et le passage au module suivant utilisent aussi le verrou commun avant reconstruction du DOM.
- Le garde-fou Firefox passe de 6 s à 15 s afin de couvrir Livecheck et écritures IndexedDB longues ; il est toujours relâché immédiatement après le cadrage final lorsqu’une navigation aboutit.
- Module 01 : suppression du pré-cadrage Livecheck ; plus de trajet « Livecheck → Market → Bitcoin ». Une seule cible finale est résolue après validation des preuves.
- Module 01 : le bouton « Voir la ligne Bitcoin » utilise désormais le même scheduler que tous les autres parcours, sans `scrollIntoView()` direct.
- Modules 02–11 : les feedbacks, validations et cartes de fin ne peuvent plus lancer de second déplacement après le routeur commun.

### Verrous

- Aucun calcul pédagogique, scénario, réponse attendue ou preuve métier modifié.
- Module 03 inchangé : position BTC fictive 50 €, coûts école 0,60 %, scénarios −3 % / +5 %.
- Reset in-place 28.3.54 conservé séparément.
- Données live, Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board, Bridge et simulation métier inchangés.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` et assets inchangés.

### Test Firefox attendu

Tester le parcours normalement. Après chaque action pédagogique, la page peut se déplacer **une seule fois** vers la cible suivante. Aucun feedback, preuve IndexedDB ou mise à jour tardive ne doit provoquer un second scroll quelques secondes après.



## Build 28.3.56 — Firefox Guided Viewport Transaction Lock

Cette Build part exactement de la 28.3.55 publiée. Le test Firefox réel a montré que la cible était d'abord correctement cadrée, puis que le navigateur déplaçait encore le viewport quelques instants plus tard. La 28.3.55 avait supprimé nos recadrages explicites multiples ; le défaut restant venait donc d'une transition de layout encore active autour du rerender et de la preuve IndexedDB.

### Contrat fonctionnel

**Une action pédagogique → verrou temporaire de l'ancrage Firefox → rerender → écriture/relecture IndexedDB → stabilité géométrique → UN seul cadrage final → restitution de l'ancrage navigateur.**

### Correction

- `overflow-anchor:none` est posé temporairement sur `html` et `body` **avant** le rerender d'une action pédagogique guidée.
- Le focus du contrôle cliqué est neutralisé pendant la même transaction de viewport.
- La navigation attend maintenant la fin du timer de sauvegarde pédagogique et de la chaîne d'écriture IndexedDB avant de décider que la cible est stable.
- Après la preuve IndexedDB, la cible est observée sur plusieurs échantillons géométriques.
- Un seul `window.scrollTo(..., behavior:"auto")` est ensuite autorisé vers l'étape suivante.
- Si une navigation plus récente a déjà pris la main, l'ancienne cible est annulée et ne peut plus déclencher un déplacement tardif.
- Le `overflow-anchor` précédent est restauré exactement après le cadrage final.
- Un garde-fou de 6 secondes libère automatiquement le verrou si une action ne produit aucune navigation.
- Le verrou spécifique du Module 02 reste compatible : s'il s'imbrique dans la transaction globale, il restaure `none` jusqu'à la fin de la transaction globale.

### Verrous

- Aucun changement des calculs, preuves ou textes pédagogiques du Module 03.
- Aucun changement des coûts école 0,60 %, de la position BTC fictive 50 €, ni des scénarios −3 % / +5 %.
- Reset 28.3.54 conservé séparément.
- Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board, Bridge et données live inchangés.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` et assets inchangés.

### Test Firefox attendu

1. Reprendre le parcours guidé et déclencher une étape qui rerend le cockpit.
2. La page peut effectuer **un seul** déplacement automatique lorsque la preuve et la géométrie sont stabilisées.
3. Après ce cadrage, aucun rebond ni second déplacement ne doit apparaître quelques secondes plus tard.
4. Tester en priorité le Module 03 : charger l'exemple école, créer la position BTC fictive, puis lancer les scénarios −3 % et +5 %.



## Build 28.3.55 — Guided Learning Single Recenter Lock

Cette Build part exactement de la 28.3.54. Le test réel du Module 03 a montré une seconde « valse » distincte du reset : la navigation pédagogique utilisait encore un cadrage initial puis deux corrections différées à 90 ms et 240 ms après les rerenders du cockpit.

### Contrat fonctionnel

**Une action pédagogique → rerender → stabilité géométrique → UN seul cadrage vers l’étape suivante.**

### Correction

- Suppression des corrections de navigation différées à **90 ms** et **240 ms**.
- `atlasLearningScheduleTarget()` n’effectue plus de cadrage immédiat suivi de reprises.
- La cible est observée brièvement jusqu’à stabilité géométrique, puis cadrée **une seule fois** en mode non lissé.
- Le bouton actif est `blur()` avant les rerenders des actions de fondation afin que Firefox ne l’utilise pas comme ancre implicite.
- Le même verrou est appliqué aux actions principales du cockpit guidé.
- Le recentrage du reset 28.3.54 reste séparé et inchangé.

### Verrous

- Aucun changement des calculs du Module 03, des frais pédagogiques, des scénarios −3 % / +5 %, de la simulation ou des preuves IndexedDB.
- Aucun changement Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel ou Decision Board.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` et assets inchangés.
- Score ATLAS compact inchangé, jamais `/100`.

### Test Firefox attendu

1. Continuer le Module 03 depuis une étape active.
2. Cliquer une action qui ouvre l’étape suivante.
3. Vérifier qu'il n'y a plus de recadrage en plusieurs temps.
4. Un seul déplacement automatique vers la prochaine étape est acceptable.
5. La page doit ensuite rester immobile jusqu'à l'action suivante.



## Build 28.3.54 — Learning Reset In-Place Single Recenter Lock

Cette Build part exactement de la 28.3.53 et corrige le défaut restant de **Repartir de zéro** sans réintroduire le reload.

### Contrat fonctionnel verrouillé

**Repartir de zéro → reset vérifié → rester dans la page → recentrer UNE fois sur `01 · Marché et données · session guidée` → rester immobile.**

### Correction

- Le reset **in-place** de la 28.3.53 est conservé : aucun `window.location.reload()`.
- Suppression de la rustine 28.3.53 qui conservait artificiellement l'ancienne position du viewport avec `window.scrollBy()`.
- Après reconstruction locale du Cockpit, la page **n'est pas déplacée immédiatement**.
- La position de `learningSessionPlan` est d'abord observée sans scroll jusqu'à stabilisation géométrique.
- Une fois stable, **un seul recentrage final** est exécuté par `atlasLearningPositionTarget()`.
- Aucun recadrage différé 120 / 420 / 1000 ms n'est réintroduit.
- Aucun reload, aucun passage volontaire en haut de page, aucune séquence de corrections successives.
- Le focus du bouton reste neutralisé avant et après la confirmation.

### Verrous

- Reset IndexedDB vérifié et rollback 28.3.53 conservés.
- Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board et données live inchangés.
- Modules 01–11, simulation pédagogique, image Module 01 et mémoire existante inchangés hors remise à zéro demandée.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` et assets inchangés.
- Score ATLAS compact inchangé, jamais `/100`.

### Test Firefox attendu

1. Se placer plus bas ou plus haut que le début de la session guidée.
2. Cliquer **Repartir de zéro** puis confirmer.
3. Vérifier le retour à **01 · Marché et données · session guidée — 0/5 étapes**.
4. Observer **un seul recentrage** sur ce panneau.
5. Vérifier qu'aucun passage en haut et aucun second mouvement automatique ne suivent.



## Build 28.3.53 — Learning Reset In-Place Lock

Cette Build part exactement de la 28.3.52. Le test Firefox a confirmé le dernier mouvement résiduel : après un reset valide, `window.location.reload()` renvoyait nécessairement la page en haut avant le cadrage pédagogique.

### Correction

- **Suppression du reload dans `Repartir de zéro`.**
- Le reset conserve toutes ses vérifications existantes :
  - écriture du carnet vierge IndexedDB ;
  - relecture et validation du Module 01 vide ;
  - nettoyage ciblé du LocalStorage pédagogique / simulation ;
  - restauration automatique de l'ancien état si la vérification échoue.
- Après validation, l'interface est reconstruite **sur place** :
  - Module 01 · 0/5 ;
  - feuille de route remise à zéro ;
  - simulation fictive neuve ;
  - profil pédagogique par défaut ;
  - coûts pédagogiques remis à zéro ;
  - scénario temporaire remis à 0 ;
  - aides pédagogiques et tiroir remis dans leur état par défaut ;
  - signaux Scam Sentinel et cases de retrait fictif remis à zéro.
- Le Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board et les données live restent en place.
- La zone `learningSessionPlan` conserve sa position visuelle : un ajustement unique compense seulement une différence de géométrie du rerender, sans navigation vers le haut et sans séquence de recadrages.
- Aucun `window.location.reload()` n'est exécuté par le reset.
- L'image du Module 01 et les Modules 01–11 restent inchangés.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` et les assets restent inchangés.
- Version Control Protected Core inchangé hors identité 28.3.53.

### Test Firefox attendu

1. Cliquer **Repartir de zéro**.
2. Confirmer.
3. Le bouton passe brièvement en réinitialisation.
4. Le même écran devient **01 · Marché et données · session guidée — 0/5 étapes**.
5. **Aucun passage en haut de page. Aucun reload. Aucune valse.**


## Build 28.3.52 — Learning Reset Stable Landing Lock

Cette Build part exactement de la 28.3.51. Le retour Firefox montre que le cadrage du reset intervient encore pendant que les zones Market / Graphique situées au-dessus du cockpit finissent leur démarrage et changent de hauteur.

### Correction

- Le reset ne cadre plus immédiatement `learningSessionPlan` après le reload.
- La position documentaire de `learningSessionPlan` est observée jusqu'à être stable sur plusieurs mesures consécutives.
- Si le Livecheck de démarrage termine rapidement, le cadrage attend aussi sa fin.
- Un délai maximal de 5 secondes évite tout blocage sur réseau lent.
- Une fois la géométrie stable : **un seul cadrage**, sans correction différée.
- Le garde Firefox `blur()` de la 28.3.51 est conservé.
- Le `overflow-anchor:none` temporaire de la 28.3.51 est retiré : l'ancrage natif reste disponible pendant les changements de hauteur du démarrage.
- Aucun changement des données, Modules 01–11, simulation, mémoire, Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board ou fiche Crypto.
- L'image du Module 01 reste inchangée.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` et les assets restent inchangés.

### Test Firefox attendu

1. Cliquer `Repartir de zéro`.
2. Confirmer.
3. Attendre brièvement la stabilisation du démarrage.
4. Un seul déplacement vers `01 · Marché et données · session guidée — 0/5 étapes`.
5. Aucun déplacement secondaire.


## Build 28.3.51 — Learning Reset Firefox Focus Lock

Cette Build part exactement de la 28.3.50 et corrige la seconde cause observée de la « valse » après **Repartir de zéro** dans Firefox.

### Correction

- Le bouton `Repartir de zéro` perd explicitement son focus **avant** l'ouverture de `confirm()`.
- Le focus actif est neutralisé une seconde fois juste avant `window.location.reload()`.
- Au redémarrage validé du reset, un garde Firefox temporaire :
  - maintient `history.scrollRestoration = "manual"` ;
  - neutralise un éventuel focus restauré sur `btnResetLearningJourney` ;
  - désactive temporairement `overflow-anchor` sur `html` et `body` afin qu'un changement de hauteur tardif ne ré-ancre pas le viewport sur l'ancien bouton.
- Le garde est retiré automatiquement après 1,4 seconde ; il **ne déclenche aucun scroll supplémentaire**.
- Le cadrage du reset reste celui de la 28.3.50 : **un seul positionnement** vers `learningSessionPlan`, sans recadrages 120 / 420 / 1000 ms.
- Aucun changement des données, de la pédagogie, de la simulation, de la mémoire ou des autres panneaux.
- L'image pédagogique du Module 01 et les Modules 01–11 restent inchangés.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` et les assets restent inchangés.
- Version Control Protected Core inchangé hors identité 28.3.51.

### Test Firefox attendu

1. Cliquer **Repartir de zéro**.
2. Confirmer.
3. Reload.
4. Arrivée sur **01 · Marché et données · session guidée — 0/5 étapes**.
5. Le viewport reste à cet endroit : aucune reprise de focus sur le bouton et aucune « valse » secondaire.


## Build 28.3.50 — Learning Reset Single Focus Lock

Cette Build part exactement de la 28.3.49 validée sur GitHub et corrige uniquement la navigation après **« Repartir de zéro »**.

### Correction

- La réinitialisation complète conserve son comportement fonctionnel actuel : nettoyage pédagogique Agent-Crypto, retour au **Module 01 · 0/5**, puis reload contrôlé.
- Après le reload, le cockpit effectue désormais **un seul cadrage** vers `learningSessionPlan`.
- Suppression des trois recadrages différés spécifiques au reset (`120 ms`, `420 ms`, `1000 ms`) qui pouvaient déplacer plusieurs fois la page après un premier positionnement déjà correct.
- Le double `requestAnimationFrame` existant est conservé pour attendre le rendu du panneau avant cet unique cadrage.
- Aucun changement de contenu pédagogique, IndexedDB, simulation, Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board, fiche Crypto ou Modules 01–11.
- L’image pédagogique du Module 01 ajoutée en 28.3.49 reste inchangée.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` et les assets sont inchangés.
- Version Control Protected Core inchangé hors identité 28.3.50.

### Test Firefox attendu

1. Cliquer **Repartir de zéro**.
2. Confirmer.
3. Après reload : **01 · Marché et données · session guidée — 0/5 étapes**.
4. Le cadrage peut se faire une fois vers ce panneau.
5. **Aucun second déplacement automatique** ne doit suivre.


## Build 28.3.49 — Module 01 Market Visual Recap Lock

Cette Build part exactement de la 28.3.48 et ajoute une seule amélioration pédagogique substantielle au **Module 01 · Marché et données**.

### Ajout

- Nouvel asset pédagogique : `web/assets/learning/module_01_market_visual_recap.png`.
- La vue annotée montre où retrouver les cinq preuves du Module 01 :
  - prix Bitcoin ;
  - variation 24 h ;
  - variation 7 j ;
  - source ;
  - heure / fraîcheur.
- La vue apparaît uniquement après validation de l’étape 4 **Source + heure**, donc après que l’élève a déjà relevé lui-même les données.
- Le cockpit recopie à côté de l’image les valeurs réellement figées pour la session courante ; les chiffres visibles dans la capture restent explicitement qualifiés comme exemple visuel.
- Après validation de l’étape 4, le viewport conduit vers `marketFoundationVisualRecap`, puis l’élève répond à l’étape 5.
- L’image ne donne pas la réponse à la question finale ; elle sert uniquement à retrouver visuellement les cinq preuves.

### Verrous

- Build 28.3.48 conservée comme base fonctionnelle.
- Fiche Crypto Flottante / Latérale, sticky et persistance inchangées.
- Score ATLAS compact inchangé, jamais `/100`.
- Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board, simulation et Modules 02–11 inchangés.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` inchangés.
- Les classes visuelles déjà validées pour le récapitulatif du Module 02 sont réutilisées ; aucune nouvelle couche CSS n’est ajoutée.
- Version Control Protected Core inchangé hors identité 28.3.49.


## Build 28.3.48 — Sticky Dock Persistence Polish Lock

Cette Build part de la 28.3.47 validée visuellement et applique uniquement les deux finitions prévues après validation du mode Latéral.

### Finitions

- La Fiche Crypto latérale est explicitement verrouillée en **sticky** pendant le défilement du tableau.
- Sa hauteur suit le viewport dynamique (`100dvh`) avec scroll interne si nécessaire.
- Le scroll de la fiche ne propage plus involontairement le défilement au tableau (`overscroll-behavior: contain`).
- Le choix **Flottante / Latérale** reste mémorisé comme en 28.3.47.
- L'actif actuellement inspecté est maintenant conservé pendant un changement temporaire de largeur ou de position Math Core :
  - si Latérale devient momentanément indisponible, la préférence n'est pas perdue ;
  - quand la place redevient suffisante avec Math Core Réduit ou Dessus, la fiche peut reprendre automatiquement l'actif précédemment inspecté ;
  - `Échap` ferme explicitement la fiche et oublie cette sélection temporaire.

### Verrous

- Score ATLAS inchangé (`37`, `50`, etc.), jamais `/100`.
- Géométrie et colonnes Market inchangées.
- Math Core reste toujours actif.
- Aucun changement des données, calculs, Modules 01–11, simulation, mémoire, Binance/CoinGecko, Graphique, Target Top 5 ou Market Flow.
- `web/index.html` et `web/runtime_config.json` inchangés.
- CSS 28.3.47 conservé intégralement ; ajout uniquement du verrou sticky.
- Version Control Protected Core inchangé hors identité 28.3.48.


## Build 28.3.47 — Adaptive Crypto Card Dock Lock

Cette Build part exactement de la 28.3.46 et corrige uniquement la règle qui rendait le bouton **Latérale** indisponible malgré un Math Core déjà Réduit ou Dessus.

### Correction

- Suppression du verrou arbitraire `window.innerWidth >= 1540`.
- La disponibilité de la fiche latérale est maintenant calculée à partir de la **largeur réelle de Market Workspace**.
- Le tableau Market conserve une réserve minimale de **980 px** avant que l'ancrage soit autorisé.
- La fiche latérale conserve une largeur de **320–360 px**.
- En Math Core **Latéral**, la fiche Crypto reste flottante pour éviter trois colonnes concurrentes.
- En Math Core **Réduit** ou **Dessus**, le bouton Latérale devient disponible dès que la zone Market dispose réellement de la place nécessaire.
- Le message d'aide ne parle plus de « grand écran » ou de plein écran.
- La préférence Flottante / Latérale reste mémorisée.

### Rendu protégé

- Score ATLAS compact inchangé (`37`, `50`, etc.), jamais `/100`.
- Aucune colonne Market existante n'est élargie.
- Math Core reste toujours actif.
- Graphique, Target Top 5, Market Flow, Modules 01–11, simulation, mémoire, Binance/CoinGecko et Métaux inchangés.
- `web/index.html` et `web/runtime_config.json` inchangés.
- Le CSS 28.3.46 est conservé ; la 28.3.47 ajoute seulement l'extension responsive nécessaire entre 1280 et 1539 px.
- Version Control Protected Core inchangé hors identité 28.3.47.


## Build 28.3.46 — Crypto Card Dock / Floating Visual Stability Lock

Cette Build part exactement de la 28.3.45. Sa mission est volontairement unique : permettre de juger la fiche Crypto **flottante ou latérale**, sans rouvrir la géométrie validée du Market Snapshot.

### Nouveau comportement

- La fiche `FICHE CRYPTO · MARKET SNAPSHOT` propose deux modes discrets : **Flottante** et **Latérale**.
- **Flottante** reste le comportement par défaut et conserve la fiche actuelle.
- **Latérale** ancre la fiche dans une colonne dédiée à droite afin qu'elle ne recouvre plus les lignes du tableau.
- Le choix est mémorisé localement dans Firefox.
- La fiche latérale reste visible pendant le défilement et continue de recevoir les mises à jour live de la crypto affichée.

### Compact UI Lock

- L'ancrage latéral n'est proposé qu'à partir de **1540 px** de largeur et lorsque Math Core est en mode **Réduit** ou **Dessus**.
- Sur Transformer Book / écran compact, le comportement reste automatiquement **Flottant** : aucune colonne supplémentaire n'est imposée.
- Si Math Core passe en mode **Latéral**, la fiche Crypto revient au comportement flottant pour ne pas créer trois colonnes concurrentes.
- Aucune largeur de colonne Market existante n'est modifiée.

### Rendu protégé

- Score ATLAS inchangé : entier compact (`37`, `50`, etc.), aucun `/100`.
- Math Core Réduit / Latéral / Dessus inchangé.
- Market Snapshot, Graphique, Target Top 5 et Market Flow inchangés hors emplacement facultatif de la fiche.
- Modules 01–11, simulation, mémoire, Binance/CoinGecko, Métaux et Bridge inchangés.
- `web/index.html` et `web/runtime_config.json` restent inchangés.
- Version Control Protected Core strictement inchangé hors identité 28.3.46.


## Build 28.3.45 — Market Truth Labels + Visual Stability Lock

Cette Build part exactement de la 28.3.44 et corrige uniquement les ambiguïtés de lecture relevées sur les captures Market / Math Core.

### Rendu strictement protégé

- Le score ATLAS reste un entier compact (`50`, `59`, etc.) : aucun `/100`.
- Aucun changement de `style.css`, aucune largeur de colonne modifiée, aucun badge visible ajouté au tableau.
- Math Core Réduit / Latéral / Dessus, fiche Crypto, Market Snapshot et graphique gardent leur géométrie.

### Corrections

- Capitalisation >= 10^12 EUR : affichage en milliards explicites (`1 130 Md €`) au lieu de `1,13 Bn €`.
- Tooltip terminal du graphique : `PRIX LIVE BINANCE · VARIATION <période>` afin de distinguer le prix spot live de la performance de la période graphique.
- Contexte Math Core : distinction explicite `Spot LIVE Binance` / `série historique 30j · 721 pts`.
- Décision : libellé compact inchangé ; sa justification est visible dans la fiche Crypto et au survol de la cellule.
- 24 h, 7 j, capitalisation et volume : provenance exposée au survol sans ajouter de texte permanent dans le tableau.

### Préservation

- Modules 01–11 inchangés.
- Simulation, données, graphiques, Métaux, Bridge, mémoire et workflow inchangés.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` inchangés.
- Version Control Protected Core inchangé hors identité 28.3.45.


## Build 28.3.44 — 11 Modules Active Recall + Automatic Memory Parity Lock

Cette Build part exactement de la 28.3.43 et applique aux **11 modules** les principes pédagogiques validés pendant la reprise détaillée des Modules 01 et 02.

### Invariant pédagogique commun

Le parcours suit désormais partout la même logique lorsqu'une question sert réellement à vérifier la compréhension :

**preuve / situation → réponse de mémoire → première tentative conservée → validation ou correction → explication → archive**.

L'application ne doit plus donner la conclusion d'une question dans le texte placé juste avant cette même question.

### Corrections principales

- Module 01 conserve son rappel actif déjà validé : observation BTC, provenance, première réponse, correction et explication.
- Module 02 conserve Ask/Bid et Marché/Limite en rappel actif ; sa question finale ne reçoit plus sa réponse dans la synthèse affichée avant le choix.
- Module 03 conserve ses scénarios figés −3 % / +5 % ; la question finale sur l'effet des coûts est désormais posée avant l'explication.
- Modules 04 à 11 : les choix pédagogiques des étapes 2 et 3 enregistrent désormais la première tentative avant d'afficher l'explication.
- Modules 04 à 11 : les fiches d'étapes masquent également le repère « À retenir » lorsqu'il révélerait la réponse avant la première tentative.
- Modules 02 à 11 : la question finale est présentée sans conclusion pré-écrite ; l'explication complète apparaît après le premier choix.
- Une première erreur reste conservée comme trace d'apprentissage ; une correction ultérieure ne l'efface pas.
- Les anciens modules déjà validés sont conservés : aucune première tentative historique n'est inventée rétroactivement.

### Mémoire automatique 01 → 11

- Le Journal pédagogique et le Data Collector automatique ne s'arrêtent plus aux Modules 01 et 02.
- Les archives vérifiées des Modules 03 à 11 produisent elles aussi une trace pédagogique dérivée, dédupliquée, sans clic supplémentaire.
- Les résumés conservent uniquement les preuves réellement présentes dans l'archive ; une preuve absente n'est pas inventée.
- Le Journal automatique montre les trois séances les plus récentes, tandis que toutes les archives restent conservées dans IndexedDB.
- L'archive pédagogique canonique reste la source de vérité ; la mémoire Collector reste une copie structurée dérivée.

### Images pédagogiques

Aucune nouvelle image n'est générée dans cette Build. L'audit identifie seulement les modules où une future vue expliquée serait utile. Les captures de base seront validées avec l'utilisateur au moment de reprendre chaque module.

### Préservation

- Aucun ordre réel, wallet réel ou clé API.
- Aucun reset global.
- Simulation Binance, Market, graphiques, Métaux, Bridge et workflow marché inchangés.
- `web/style.css` et `web/runtime_config.json` inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les trois constantes d'identité passent à 28.3.44.


## Build 28.3.43 — Memory Provenance + Distinct Snapshot Audit Lock

Cette Build part exactement de la 28.3.42 et clôt un audit ciblé des Builds 28.3.33 à 28.3.42 ainsi que des décisions du fil Crypto.

### Corrections

- `publicMarketSnapshot()` utilisait `state.mainSource?.name` alors que `state.mainSource` est une chaîne : la provenance des snapshots manuels pouvait donc devenir `source live` ou `null`.
- Le même snapshot exportait `volume_24h_eur` depuis `c.volume` alors que la donnée normalisée est `c.volume24h`.
- Les observations manuelles ne portaient pas systématiquement l'identité canonique du snapshot marché ; plusieurs clics sur le même état pouvaient être comptés comme plusieurs observations distinctes.
- La déduplication lit maintenant aussi `snapshot.market_snapshot.snapshot_id` et `snapshot.market_snapshot.source_time`.
- Les doublons déjà présents en IndexedDB sont réécrits sous forme canonique si la normalisation réduit le nombre de traces.
- Le Module 01 pédagogique n'emploie plus le tag ambigu `market_observation` mais `market_learning`, afin de ne pas le confondre avec une observation marché comparable.
- Les mémoires pédagogiques dérivées sont désormais réconciliées / mises à jour depuis l'archive canonique, sans créer de nouvelle trace.
- Les anciens enregistrements affichant littéralement `source live` sont présentés comme `source historique non qualifiée · ancien format` : aucune provenance n'est inventée.
- Aucun changement du Module 01/02 pédagogique, Binance, graphique, simulation, CSS, HTML ou workflow.
- Version Control Protected Core : logique inchangée ; identité passée à 28.3.43.


## Build 28.3.42 — Unified IndexedDB Memory + Panel Coherence Lock

Cette Build part exactement de la 28.3.41.

### Mission unique

Faire raconter la même vérité au Data Collector, à l’Explorateur, au Plan de collecte et à l’Assistant de reprise, tout en supprimant la dépendance lourde du Data Collector à `localStorage`.

- Le Data Collector utilise désormais une base **IndexedDB dédiée** (`agent_crypto_local_memory`) comme stockage canonique de ses traces.
- L’ancien `localStorage` Collector est lu une dernière fois, fusionné et dédupliqué, écrit puis relu dans IndexedDB ; il n’est supprimé qu’après vérification de la copie.
- Les archives pédagogiques des Modules 01 et 02 restent canoniques dans leur IndexedDB pédagogique ; leurs copies dérivées sont resynchronisées automatiquement vers la mémoire Collector.
- Tous les panneaux utilisent désormais le même cache Collector vérifié.
- Les **sessions pédagogiques** et les **observations marché** sont distinguées : une session d’apprentissage ne compte plus artificiellement comme un snapshot marché comparable.
- Le Plan de collecte considère **2 observations marché distinctes** comme seuil de comparaison ; une troisième observation enrichit la lecture mais n’est plus une obligation.
- L’Explorateur se remplit automatiquement et ne demande plus de cliquer « Lire mémoire » pour donner du sens au panneau.
- L’Assistant de reprise abandonne les anciens textes figés (« 3e snapshot », « V1.2-local-plan ») et se construit depuis l’état réel du parcours et de la mémoire.
- Les snapshots marché manuels, comparaisons ciblées et exports restent disponibles sous des outils facultatifs.
- Le message `quota has been exceeded` du Collector LocalStorage ne doit plus bloquer la mémoire pédagogique automatique.
- Modules 01 et 02 pédagogiques, Binance, CoinGecko, simulation et workflow marché : inchangés.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.42.


## Build 28.3.41 — Automatic Learning Memory Pipeline Lock — Modules 01 + 02

Cette Build part exactement de la 28.3.40.

### Mission unique

Supprimer les actions supplémentaires après l’apprentissage : les archives vérifiées des Modules 01 et 02 alimentent désormais automatiquement le Journal pédagogique et le Data Collector local.

- Au démarrage, les archives Module 01 / Module 02 déjà présentes dans IndexedDB sont relues et rétro-synchronisées automatiquement.
- À chaque archivage futur d’un Module 01 ou 02, une trace locale structurée est créée automatiquement après confirmation de l’archive IndexedDB.
- Déduplication par `session_id` : rechargement, réouverture ou nouvelle synchronisation ne crée pas plusieurs copies de la même séance.
- Le Journal pédagogique affiche automatiquement les apprentissages, provenance, réponses/corrections et simulation fictive du dernier Module 01 / 02.
- Le Data Collector affiche automatiquement le nombre de traces, la dernière origine, les tags pédagogiques et l’exposition fictive lorsqu’elle existe.
- Les boutons manuels sont conservés sous « actions facultatives » pour les exports et les snapshots supplémentaires ; ils ne font plus partie du parcours normal.
- Aucun prix ou fait manquant n’est inventé : une donnée absente reste explicitement indisponible.
- L’archive IndexedDB reste la preuve canonique ; le Data Collector reçoit une copie locale dérivée.
- Modules 03 à 11 inchangés dans cette Build.
- `web/runtime_config.json` et le workflow marché sont inchangés.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.41.


## Build 28.3.40 — Module 02 Visual Recap Focus Lock

Cette Build part exactement de la 28.3.39 réparée.

### Mission unique

Après la simulation fictive de 50 € BTC, cadrer directement la **Vue expliquée** ajoutée en 28.3.39 au lieu de sauter à l’étape 5.

- La simulation Binance et les preuves restent strictement inchangées.
- Le grand `PAPER TRADING SANDBOX` reste un moteur secondaire, pas une destination pédagogique.
- En cas de succès, le viewport vise `spotFoundationVisualRecap`.
- L’étape 5 reste immédiatement sous la vue expliquée et n’exige aucun bouton supplémentaire.
- En cas d’échec, le comportement de retour à l’étape 4 reste inchangé.
- `web/style.css`, l’image pédagogique, `web/index.html` et `web/runtime_config.json` restent inchangés.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.40.


## Build 28.3.39 — Module 02 Visual Recap + Pedagogical Isolation Lock

Cette Build part exactement de la 28.3.38.

### Mission unique

Transformer le résultat de la simulation fictive du **Module 02** en une **vue pédagogique lisible** sans renvoyer visuellement l’utilisateur dans le grand `PAPER TRADING SANDBOX`.

- Une **vue expliquée** est ajoutée juste après l’étape 4, dans le cockpit du Module 02.
- Cette vue affiche l’image pédagogique annotée et un bloc explicatif court : avant / après, argent disponible, montant placé, exposition et source de la cotation.
- L’image sert de repère visuel pour comprendre immédiatement les zones importantes : **950 € disponibles**, **50 € placés**, **exposition 50 € / 300 €**.
- Le titre de l’étape 5 devient plus clair : **« À toi de répondre »**.
- Le chemin de vérification du Module 02 reste maintenant ancré sur `learningFoundationPanel` ; il ne doit plus cibler `schoolPanel` comme destination pédagogique.
- Le moteur de simulation, Binance, CoinGecko, le contrôleur de version canonisé et les autres modules restent inchangés.
- Fichiers fonctionnels modifiés : `web/app.js`, `web/style.css`.
- Nouvel asset pédagogique : `web/assets/learning/module_02_spot_visual_recap.png`.
- `web/index.html` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.39.


## Build 28.3.38 — Resilient Binance Execution Quote Router + Public Snapshot Publication Lock

Cette Build part exactement de la 28.3.37.

### Mission unique

Séparer définitivement **prix d’exécution fictive** et **snapshot large de marché**.

- Les actifs couverts BTC / ETH / BNB / XRP / SOL utilisent d’abord le WebSocket Binance existant.
- Si le WebSocket ne fournit pas une cotation fraîche au moment exact de l’action, le navigateur demande une cotation publique Binance REST ponctuelle.
- Une simulation ne peut plus utiliser silencieusement un snapshot CoinGecko de plusieurs heures comme prix d’exécution.
- Le Module 02 demande directement une cotation Binance fraîche puis exécute son achat fictif de 50 € en un seul clic.
- La preuve pédagogique conserve maintenant la source et l’heure de la cotation utilisée.
- La valorisation d’une position virtuelle privilégie le WebSocket Binance frais, puis le dernier prix d’exécution enregistré ; CoinGecko n’est plus prioritaire pour cette fonction.
- Le snapshot public CoinGecko reste la source de largeur de marché (univers, capitalisation, volumes, rangs, historique) et peut rester affiché comme archive, mais il cesse d’être considéré comme analyse active après 45 minutes.
- Le workflow public CoinGecko passe à une cible de 30 minutes (minutes 17 et 47) et publie avec resynchronisation non destructive en cas de commit concurrent, sans `force push`.
- GitHub Actions reste un cache/snapshot : aucune promesse de temps réel n’est attachée à ce workflow.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.38.


## Build 28.3.37 — Module 02 Spot Single Click + Silent Simulation Focus Lock

Cette Build part exactement de la 28.3.36.

### Mission unique

Supprimer la « valse » encore visible après le clic de l’étape 4 du Module 02 en séparant enfin le **moteur de simulation** de son **grand panneau d’affichage** pendant cette action pédagogique.

- **Un clic suffit** sur « Simuler 50 € de BTC (fictif) ». Un verrou empêche tout second déclenchement pendant l’opération.
- Le bouton affiche immédiatement « Simulation en cours… » et la carte indique ce que fait le cockpit ; il n’est plus nécessaire de recliquer pour savoir si l’action travaille.
- La simulation de 50 € utilise le moteur existant, mais avec `render:false` : l’état du portefeuille virtuel et le journal sont bien écrits sans reconstruire le grand panneau Paper Trading placé plus haut dans la page.
- Cette séparation élimine les changements de hauteur successifs provoqués auparavant par `resetSimulation()` puis `simulateOrder()` ; c’était la source résiduelle de la « valse » même quand les rerendus du cockpit étaient regroupés.
- Après réussite, une seule reconstruction pédagogique est effectuée et un seul cadrage final vise l’étape 5.
- En cas d’indisponibilité réelle des données, l’étape 4 reste visible et le même bouton devient « Réessayer la simulation fictive » ; aucune progression n’est fabriquée.
- Le texte de l’étape 4 est raccourci : la définition de « position » passe dans une bulle d’aide et la consigne insiste sur le clic unique.
- Le moteur de simulation reste rétrocompatible : son rendu reste actif partout ailleurs par défaut.
- Modification fonctionnelle : `web/app.js` uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.37.

## Build 28.3.36 — Module 02 Spot Livecheck Handoff + Local Result Focus Lock

Cette Build part exactement de la 28.3.35.

### Mission unique

Rendre l’étape 4 du Module 02 cohérente pour un débutant : le Livecheck reste un mécanisme technique en arrière-plan, l’achat de 50 € reste dans le cockpit pédagogique, et l’action ne doit plus envoyer l’utilisateur dans le haut du simulateur.

- Le verrou de viewport commence **avant** la vérification Livecheck.
- Si le Livecheck automatique de démarrage est déjà en cours, le clic pédagogique **rejoint cette lecture** au lieu de la considérer comme une panne.
- Si aucune donnée exploitable n’est disponible après l’attente, une seule lecture explicite est tentée ; en cas d’échec réel, le cockpit revient sur l’étape 4.
- Après succès, le simulateur reste un moteur technique secondaire : un seul cadrage final ouvre l’étape 5.
- « Position » est maintenant définie directement dans l’étape 4 comme la quantité de BTC détenue virtuellement après l’achat.
- Le bouton devient « Simuler l’achat fictif de 50 € de BTC ».
- Le résultat local affiche quantité détenue, prix d’entrée et argent virtuel disponible.
- Ask/Bid, Marché/Limite, IndexedDB, sécurité, Module 03 et moteur de simulation restent inchangés.
- Modification fonctionnelle : `web/app.js` uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.36.


## Build 28.3.35 — Module 02 Spot Position Single Final Focus Lock

Cette Build part exactement de la 28.3.34.

### Mission unique

Supprimer la « valse » encore constatée dans Firefox après `Créer la position BTC fictive de 50 €` sans toucher à la simulation ni à la pédagogie.

- Le clic pédagogique retire maintenant explicitement le focus du bouton avant que le laboratoire soit reconstruit.
- Après la création de position, aucun pré-cadrage ni série de recadrages n’est exécuté : **un seul positionnement final** vise l’étape 5 après stabilisation du DOM.
- Les contrôles de stabilisation 80/180/420 ms de la 28.3.34 sont supprimés pour ce parcours : ils pouvaient eux-mêmes rendre plusieurs déplacements visibles.
- Si la position n’est réellement pas créée, l’interface reste sur la zone courante au lieu de remonter au début du laboratoire.
- La transaction de rendu unique et la neutralisation temporaire de `overflow-anchor` introduites en 28.3.34 sont conservées.
- Simulation, preuves, IndexedDB, Ask/Bid, Marché/Limite, bulles et Module 03 inchangés.
- Modification fonctionnelle : `web/app.js` uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.35.


## Build 28.3.34 — Module 02 Spot Position Single Render Viewport Lock

Cette Build part exactement de la 28.3.33.

### Mission unique

Supprimer la « valse » encore visible après `Créer la position BTC fictive de 50 €` en traitant la cause réelle : plusieurs reconstructions successives du cockpit pendant une seule action.

- `resetSimulation()` et `simulateOrder()` continuent de mettre à jour la simulation exactement comme avant.
- Pendant cette action du Module 02 uniquement, les rerendus du cockpit pédagogique sont regroupés : trois reconstructions successives deviennent une seule reconstruction finale.
- Le scroll préparatoire de la 28.3.33 est retiré : aucun déplacement vers l’étape 5 n’est demandé avant la fin de la simulation.
- L’ancrage automatique du navigateur est neutralisé uniquement pendant cette transaction afin que Firefox ne compense pas les changements de hauteur.
- Après la reconstruction finale, l’étape 5 est positionnée directement puis contrôlée trois fois sur une courte fenêtre de stabilisation.
- Le verrou d’ancrage est ensuite restauré.
- Aucune modification de la logique de simulation, des preuves, d’IndexedDB, des bulles d’aide, d’Ask/Bid ou de Marché/Limite.
- Modification fonctionnelle : `web/app.js` uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.34.

## Build 28.3.33 — Module 02 Spot Position Direct Focus Lock

Cette Build part exactement de la 28.3.32.

### Mission unique

Supprimer le détour visuel observé après le clic `Créer la position BTC fictive de 50 €`.

- Le bouton conserve exactement la même simulation fictive, les mêmes preuves et la même validation de l’étape 4.
- Avant que la simulation ne reconstruise ses panneaux, le cockpit cadre directement la destination pédagogique attendue : l’étape 5.
- Le moteur de cadrage existant est réutilisé : aucun second système de scroll n’est créé.
- Le cadrage préparatoire est immédiat, sans animation ni flash, afin d’éviter l’effet de « valse ».
- Après la simulation, le ciblage existant de l’étape 5 reste en place comme vérification finale.
- La correction est limitée au chemin Module 02 `spot` ; le Module 03 n’est pas modifié.
- Les bulles d’aide, le rappel actif Ask/Bid et Marché/Limite restent inchangés.
- Modification fonctionnelle : `web/app.js`, bloc pédagogique / navigation uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.33.

## Build 28.3.32 — Module 02 Market / Limit Active Recall Lock

Cette Build part exactement de la 28.3.31.

### Mission unique

Transformer l’étape 3 du Module 02 en rappel actif compréhensible : répondre d’abord, puis lire l’explication du type d’ordre.

- Situation A : l’utilisateur choisit d’abord entre `Ordre au marché` et `Ordre limite` pour un achat immédiat.
- Situation B : même logique pour un prix maximum d’achat fixé à 59 500 €.
- La première tentative de chaque situation est conservée séparément.
- Une erreur révèle l’explication correspondante, ne valide pas la situation et permet une correction.
- Une bonne réponse désactive uniquement la situation déjà validée ; l’autre reste active.
- Après la première tentative, le cockpit explique en langage humain : `ordre = instruction`, `marché = priorité à l’exécution`, `limite = priorité au prix choisi`.
- Des bulles `ⓘ` fournissent des indices facultatifs sans imposer leur lecture.
- L’étape 3 ne devient complète qu’après les deux réponses correctes ; le moteur de cadrage existant cible alors l’étape 4.
- Modification fonctionnelle : `web/app.js`, bloc 09 uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.32.


## Build 28.3.31 — Module 02 Ask / Bid Active Recall Lock

Cette Build part exactement de la 28.3.30.

### Mission unique

Transformer l’étape 2 du Module 02 en véritable rappel actif, sans toucher au carnet d’ordres réel, au Market, à la simulation ou au Version Control.

- La règle « meilleur Ask / meilleur Bid » n’est plus donnée avant le premier choix.
- Ask : l’utilisateur choisit d’abord entre les deux vendeurs ; la première tentative est mémorisée, puis l’explication apparaît.
- Bid : même logique côté acheteurs.
- Une première erreur ne valide pas l’étape ; elle est conservée comme trace d’apprentissage et l’utilisateur peut corriger.
- Une réponse correcte désactive uniquement le côté déjà validé afin de guider vers l’autre colonne.
- Le Spread pédagogique n’est révélé qu’une fois Ask et Bid correctement identifiés.
- Des bulles `ⓘ` donnent un indice sémantique sur Ask et Bid sans révéler le prix correct avant la tentative.
- Quand les deux côtés sont validés, le viewport reste dans le moteur pédagogique existant et cible directement l’étape 3.
- Modification fonctionnelle : `web/app.js`, bloc 09 uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.31.


## Build 28.3.30 — Livecheck Direct Market Focus Lock

Cette Build part exactement de la 28.3.29.

### Mission unique

Supprimer le détour visuel observé au clic sur `Lancer Livecheck` pendant le Module 01 : le parcours doit aller directement au Market, sans passage bref par l’ancienne position ou le haut de page.

- Avant de lancer le rafraîchissement réseau, le cockpit cadre immédiatement `market-workspace`.
- La couche de continuité du Market mémorise donc le bon viewport avant la reconstruction de la table.
- Le Livecheck, le Market Snapshot, la ligne Bitcoin, les preuves pédagogiques et IndexedDB ne changent pas.
- Le ciblage final de la ligne Bitcoin après validation de l’étape 2 reste en place.
- En cas d’échec Livecheck, le retour vers la zone pédagogique reste inchangé.
- Modification fonctionnelle : `web/app.js` uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.30.



## Build 28.3.29 — Learning Viewport Settle & Reset Hover Lock

Cette Build part exactement de la 28.3.28 testée visuellement.

### Mission unique

Corriger le cadrage encore trop bas après certains rerenders, en particulier après `Repartir de zéro`, sans toucher aux données du parcours ni au Version Control Protected Core.

- Le moteur de focus pédagogique garde une cible unique, mais vérifie maintenant sa position après les petits changements de mise en page qui suivent un clic.
- Le premier cadrage reste immédiat ; deux contrôles courts corrigent uniquement une dérive réelle supérieure à 4 px.
- Après un reset/rechargement, trois contrôles dédiés à 120 ms, 420 ms et 1000 ms ramènent `learningSessionPlan` à 18 px du haut si Firefox l'a décalé pendant la stabilisation de la page.
- Aucun scroll supplémentaire n'est effectué si la cible est déjà correctement placée.
- Le bouton `Repartir de zéro` reçoit une bulle native au survol qui précise exactement ce qui est effacé et ce qui est conservé.
- Fichiers fonctionnels modifiés : `web/app.js` et la seule balise du bouton reset dans `web/index.html`.
- `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique inchangée ; seules les constantes d'identité passent à 28.3.29.


## Build 28.3.28 — Learning Viewport Focus & Reset Lock

Cette Build part exactement de la 28.3.27 validée sur le Transformer Book et le Ryzen.

### Mission unique

Stabiliser le cadrage du parcours pédagogique après les clics, et garantir qu’un « Repartir de zéro » revient bien sur `01 · Marché et données · session guidée` à `0/5 étapes`.

- Le reset conserve son effacement limité à Agent-Crypto, puis recharge proprement l’application.
- Après rechargement, Firefox ne doit plus restaurer l’ancienne position verticale : le cockpit revient sur `learningSessionPlan`.
- Le gestionnaire de focus pédagogique résout désormais la cible **après** le rerender du cockpit (double `requestAnimationFrame`), puis la place en haut avec un décalage constant.
- Le scroll pédagogique est immédiat par défaut : plus de long déplacement fluide à travers la page (« envoyé valser »).
- Toutes les actions existantes qui utilisent `scrollToLearningTarget()` bénéficient de ce cadrage sans réécriture de leurs blocs fonctionnels.
- Aucun changement de contenu pédagogique, Market, Graphique, Simulation, Métaux, Bridge, IndexedDB schema, HTML, CSS ou `runtime_config.json`.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.28.


## Build 28.3.27 — Active Recall & Learning Guidance Lock

Cette Build part exactement de la 28.3.26 validée après rechargement forcé sur le Transformer Book.

### Mission unique

Renforcer l’apprentissage du Module 01 sans modifier son contenu de marché ni le Version Control Protected Core.

- Étape 5 : les preuves sont affichées avant la question, mais la conclusion n’est plus donnée avant la réponse.
- Ordre pédagogique : **question → réponse → validation → explication**.
- La première réponse est conservée comme trace d’apprentissage ; une erreur ne détruit aucune progression.
- La réponse correcte `Non` valide l’étape et révèle l’explication complète avant l’archivage.
- `Synthèse automatique` et `Notes personnelles` sont désormais deux zones visuellement distinctes ; le stockage historique reste compatible.
- Les anciennes auto-synthèses Modules 01/02/03 sont séparées à l’affichage sans migration destructive des archives.
- Ajout de bulles `ⓘ` accessibles au survol et au clavier sur Prix/24 h/7 j, provenance et rappel actif.
- Aucun changement Market, Graphique, Simulation, Métaux, Bridge, IndexedDB schema ou logique Version Control.


## Build 28.3.26 — Current Build Reverify Stability Lock

Cette Build part exactement de la 28.3.25 publiée.

### Mission unique

Corriger le faux état « Publication Build courant incomplète » observé sur le Transformer Book lors d’une revérification manuelle du Build déjà chargé.

- Si `version.json` annonce le même Build et le même token que `app.js`, le contrôleur confirme désormais l’identité courante sans retélécharger ni re-hasher HTML/CSS/runtime_config.
- Une incohérence même-Build / token différent reste refusée.
- Toute Build supérieure continue d’être vérifiée avec l’intégrité SHA-256 complète avant proposition d’installation.
- Le préchargement fort avant installation d’une nouvelle Build reste inchangé.
- Modules 01, 02, 03, Market, Graphique, Métaux, Simulation, HTML, CSS et runtime_config restent inchangés.



## Build 28.3.25 — Module 03 Review Focus & Auto-Synthesis Lock

Cette Build part exactement de la 28.3.24 validée.

### Mission unique

Mettre `03 · Frais et gestion du risque` au même standard de navigation et de mémoire que les Modules 01 et 02 avant la reprise pédagogique de Christophe.

- Parcours fonctionnel conservé : coûts école, position BTC fictive de 50 €, scénarios −3 % / +5 %, brut / net et conclusion guidée.
- Étapes 1 → 2 → 3 → 4 → 5 : cadrage unique sur la carte canonique après rerender.
- Suppression des doubles scrolls concurrents propres au Module 03 ; une mauvaise réponse ne déplace pas la page.
- À 5/5, `Mes notes libres` reçoit `[AUTO-SYNTHÈSE MODULE 03]` sans écraser les notes personnelles.
- `risk_archive_prefill` conserve modèle de coûts école, position figée, scénarios figés, conclusion et verrous de sécurité.
- Les frais réels, le spread réel et le slippage réel restent explicitement non vérifiés ; aucune valeur réelle n’est inventée.
- `risk_learning_journal` conserve la synthèse pédagogique dérivée.
- Modules 01/02, HTML, CSS, runtime_config et logique du Version Control Protected Core restent inchangés.

## Build 28.3.24 — Module 01 Review Focus & Auto-Synthesis Lock

Cette Build part exactement de la 28.3.23 validée avec le Module 02 archivé.

### Mission unique

Mettre `01 · Marché et données` au même niveau d’ergonomie et de mémoire pédagogique que le Module 02 avant la relecture complète de Christophe.

- Parcours fonctionnel Module 01 conservé : Livecheck, Prix / 24 h / 7 j, source + heure, conclusion guidée.
- Navigation des étapes 3 → 4 → 5 stabilisée : un rerender, un seul cadrage, aucun feedback concurrent.
- Les mauvaises réponses ne déplacent plus la page.
- À 5/5, `Mes notes libres` reçoit un bloc `[AUTO-SYNTHÈSE MODULE 01]` construit uniquement à partir des preuves figées de la session.
- Les notes personnelles existantes sont conservées.
- `market_archive_prefill` conserve observation BTC, variations 24 h / 7 j, source, heure, conclusion et verrous de sécurité.
- `market_learning_journal` conserve la synthèse pédagogique dérivée.
- Aucune recommandation, prédiction ou donnée manquante n’est inventée.
- Module 02 et Version Control Protected Core restent inchangés.
- `index.html`, `style.css` et `runtime_config.json` restent strictement inchangés.

## Build 28.3.23 — Module 02 Auto-Synthesis & Archive Prefill Lock

Cette Build part exactement de la 28.3.22 validée dans le parcours Module 02.

### Mission unique

À la validation 5/5 de `02 · Spot et carnet d’ordres`, le cockpit transforme automatiquement les preuves déjà produites en mémoire pédagogique exploitable.

- Préremplissage automatique de `Mes notes libres` avec une auto-synthèse clairement balisée.
- Les éventuelles notes personnelles existantes sont conservées intégralement.
- Création d’un objet `spot_archive_prefill` dans les preuves pédagogiques : Ask, Bid, spread, types d’ordre, position fictive, capital restant, conclusion et sécurité.
- Création d’un journal pédagogique dérivé de ces mêmes preuves.
- Les frais réels, spreads réels de plateforme et slippage réel restent explicitement `non vérifiés` ; aucune valeur n’est inventée.
- Une session Module 02 déjà à 5/5 en 28.3.22 reçoit automatiquement le préremplissage lors du premier rendu 28.3.23.
- L’archive IndexedDB conserve automatiquement ces données lorsque l’utilisateur clique sur `Terminer et archiver le module`.
- `index.html`, `style.css` et `runtime_config.json` restent strictement inchangés.
- Le noyau de versionnage reste inchangé ; seules les constantes d’identité Build/token passent à 28.3.23.

## Build 28.3.22 — Guided Step Focus & Pedagogy Lock

Cette Build part exactement de la 28.3.21 validée sous Firefox.

### Mission unique

Corriger l’ergonomie du Module 02 — Spot et carnet d’ordres : un clic, un rerender, un seul cadrage sur l’étape suivante.

- Étape 1 validée → cadrage Étape 2.
- Bid / Ask terminés → cadrage Étape 3.
- Marché / Limite terminés → cadrage Étape 4.
- Position BTC fictive créée → cadrage Étape 5.
- Le feedback n’effectue plus de scroll concurrent.
- Ask / Bid et la Situation B sont reformulés pour réduire l’ambiguïté pédagogique.
- Aucun changement HTML/CSS/runtime_config.
- Noyau de versionnage 28.3.21 conservé ; seules les constantes d’identité Build/token évoluent.

## Build 28.3.21 — Two-File Version Control Final Lock

Cette Build part exactement de la 28.3.20 validée sous Firefox.

### Mission unique

Terminer la séparation du versionnage.

Le noyau actif est désormais :

- `web/app.js` → identité locale exécutée + contrôleur de mise à jour ;
- `web/version.json` → identité distante publiée + empreintes d’intégrité.

### `index.html` libéré

`index.html` ne contient plus :

- `meta[name="atlas-build"]` ;
- `meta[name="atlas-asset-token"]` ;
- numéro de Build dans les URLs de `style.css` et `app.js`.

Les libellés visibles de version sont remplis dynamiquement par `app.js`.

### `style.css` libéré

`style.css` ne contient plus :

- `ATLAS_ASSET_BUILD` ;
- `ATLAS_ASSET_TOKEN` ;
- `--atlas-asset-build` ;
- `--atlas-asset-token`.

La feuille de style ne porte plus le numéro de Build.

### Intégrité de publication

`version.json` conserve les empreintes SHA-256 de :

- `app.js` ;
- `index.html` ;
- `style.css` ;
- `runtime_config.json`.

Cela ne versionne pas HTML/CSS : cela permet seulement au contrôleur de vérifier qu’une publication distante est complète avant de proposer ou d’installer la mise à jour.

### Conséquence pour les prochaines Builds

Si une future Build ne modifie ni HTML, ni CSS, ni configuration runtime :

- `index.html` reste inchangé ;
- `style.css` reste inchangé ;
- `runtime_config.json` reste inchangé ;
- le versionnage peut évoluer uniquement avec `app.js` + `version.json`.

`build_history.md` et `README.md` restent documentaires et peuvent être mis à jour sans être lus par le runtime.


## Build 29.3.07 — Aerith Whole-Page Pedagogy Layer

- Ajoute « Comprendre la page » avec trois niveaux : Simple, Détaillé, Expert + dictionnaire.
- Ajoute un dictionnaire contextuel crypto, banque, trading, statistiques et technique.
- Ajoute le contrat `aerith_crypto_whole_page_pedagogy_v1` au snapshot transmis au Bridge.
- Aerith doit relire le snapshot entier, signaler les incohérences temporelles et expliquer chaque indicateur sans inventer de donnée.
- La chaîne Atlas → NØX → Aerith reste automatique.
- La validation humaine est réservée aux décisions/actions financières réelles.
- Aucun changement Bridge, exchange, wallet ou exécution financière.


## Build 29.3.08 FINAL — Consolidated Atlas / NØX / Aerith Lock

- Supprime le second panneau pédagogique concurrent introduit en 29.3.07 et réutilise le tiroir pédagogique historique de l’interface.
- Ajoute « Comprendre toute la page » sans dupliquer l’UI.
- Verrouille Atlas → NØX → Aerith comme chaîne analytique automatique.
- Réserve la validation humaine aux décisions/actions financières réelles.
- Rend le validateur de conclusion compatible avec la synthèse Aerith enrichie.
- Conserve le contrôle fingerprint/snapshot et l’ancienne conclusion uniquement comme historique si une nouvelle conclusion échoue.
- Corrige le SHA-256 app.js dans la vraie structure integrity.files de version.json.
- Stack finale : Interface 29.3.08 · Control Center V2.3.2R1 · Bridge V1.9.2 · gpt-oss:20b-32k.


## Build 29.3.09 — Current Snapshot Promotion Lock

- Un nouveau fingerprint qualifié retire immédiatement le statut CURRENT à l'ancienne conclusion.
- L'ancien paquet IndexedDB reste conservé comme historique.
- La chaîne automatique attend Binance 5/5 directes.
- Le statut CURRENT n'est accordé qu'après cohérence snapshot + 4 rapports Atlas + conclusion Aerith sur le même fingerprint.
- L'UI signale explicitement Analyse courante / Nouvelle analyse en cours / Analyse en attente.
- Aucun changement Bridge, Ollama, Math Core ou News Intelligence.


## Build 29.3.10 — Auto Chain + Current Snapshot Lock

Consolidation de l'orchestration automatique. Corrige trois défauts critiques découverts lors de l'audit 29.3.09 : fingerprint évalué trop tôt, objet `reports` traité comme tableau, et `lastAutoFingerprint` fixé avant le succès d'Aerith. Les synthèses restaurées restent historiques jusqu'à promotion transactionnelle du snapshot courant.


## Build 29.3.11 — Clean Direct Source + Current Lock

- Interface-only correction.
- No Bridge change.
- No Control Center change.
- No Market Flow change.
- Distinguishes 5/5 prices from 5/5 Binance direct sources.
- Displays direct and derived source counts in the automatic-analysis status.
- Atlas remains blocked until 5/5 Binance sources are direct.
- Preserves automatic Atlas → NØX → Aerith → CURRENT orchestration.
- Preserves stale conclusions as HISTORICAL only when fingerprint differs.
- Canonical local stack remains Control Center V2.3.2R2 / Bridge V1.9.2 / gpt-oss:20b-32k.
- Browser cache remains handled operationally with Ctrl+F5 after GitHub publication.


## Build 29.3.12 — Stable 5/5 Direct Gate + Snapshot Freeze Lock

- Fixes the 5/5 ↔ 4/5 source flapping race.
- A transient 5/5 no longer launches Atlas immediately.
- Requires 5/5 Binance direct sources continuously for 10 seconds and at least 3 checks.
- Any drop to 4/5 resets the stability counter to zero.
- Scheduler re-validates the stable gate before starting Atlas.
- Once Atlas starts, the accepted snapshot/fingerprint is frozen for the complete Atlas → NØX → Aerith transaction.
- Later live-source fluctuations do not mutate the in-flight snapshot.
- No Bridge change.
- No Control Center change.
- No Market Flow change.
- No CSS change.


## Build 29.3.13 — Gate Watchdog + Response UI Restore Lock

- Keeps the 29.3.12 stable 5/5 direct-source gate.
- Adds an independent 10-second watchdog so Atlas can arm even if no extra WebSocket render occurs at the exact threshold.
- Requires exactly 5 direct Binance pairs and 0 derived pairs.
- Any 4/5 or derived fallback cancels and resets the watchdog.
- Keeps the accepted snapshot frozen for Atlas → NØX → Aerith.
- Removes the injected historical marker block that disturbed the response-panel layout.
- Historical/current state now uses the existing title/meta elements, preserving the original CSS structure.
- Prevents duplicate `Historique — Historique —` title prefixes.
- No Bridge change.
- No Control Center change.
- No Market Flow change.
- No style.css change.
- No index.html change.


## Build 29.3.14 — Atomic Chain + Background Retry Lock

- Keeps the exact 5/5 direct-source stable gate from 29.3.13.
- Automatic analysis no longer pauses merely because the browser tab is hidden.
- Atlas 4/4 → NØX → Aerith now runs as one awaited transaction on the same frozen snapshot/fingerprint.
- Removes the hand-off gap between Atlas completion and Aerith start.
- If Atlas 4/4 is already valid but Aerith failed or is missing, the scheduler retries Aerith directly.
- A failed Aerith conclusion preserves Atlas 4/4 and schedules a bounded automatic retry.
- Avoids rerunning expensive Atlas reports when only Aerith needs recovery.
- No Bridge change.
- No Control Center change.
- No Market Flow change.
- No CSS change.
- No index.html change.


## Build 29.3.15 — IndexedDB Current Restore + Stale Demotion Lock

- Hardens CURRENT/HISTORICAL restoration after reload.
- A persisted CURRENT package whose fingerprint differs from the current snapshot is demoted immediately.
- Historical IndexedDB packages remain readable but cannot seed the current conclusion or current Atlas fingerprint.
- Restored historical reports are labeled explicitly as historical and do not block fresh automatic analysis.
- Current-state banner is rebuilt from the actual current fingerprint after snapshot creation.
- Keeps the 29.3.14 atomic Atlas → NØX → Aerith transaction and Aerith-only retry.
- Keeps the 29.3.13 exact 5/5 direct + 0 derived stable gate and watchdog.
- No Bridge change.
- No Control Center change.
- No Market Flow change.
- No CSS change.
- No index.html change.


## Build 29.3.16 — Restore Reconciliation + Historical Isolation Lock

- Fixes an incomplete IndexedDB restore hardening from 29.3.15.
- Restored historical Atlas reports may be displayed but cannot seed `lastCompletedFingerprint`.
- Historical packages cannot seed the current Aerith conclusion or block a fresh automatic run.
- Reconciliation runs again as soon as the real current fingerprint exists.
- A package restored before the current snapshot is known is reclassified once the snapshot arrives.
- Persisted automatic-attempt state tied to an old fingerprint is cleared on demotion.
- Uses a safe `typeof structuredClone === "function"` compatibility test.
- CURRENT/HISTORICAL is derived from the actual current fingerprint, not merely from restore order.
- Keeps exact 5/5 direct stable gate, watchdog, snapshot freeze and atomic Atlas → NØX → Aerith chain.
- No Bridge change.
- No Control Center change.
- No Market Flow change.
- No CSS change.
- No index.html change.


## Build 29.3.17 — Transaction Supersession + Partial Retry Lock

- Prevents Atlas from starting while an Aerith conclusion is already in flight.
- Adds a conclusion transaction token and active fingerprint.
- A superseded conclusion can never promote itself to CURRENT.
- CURRENT promotion now rechecks 4/4 report fingerprints immediately before commit.
- Automatic partial Atlas runs retry automatically instead of stopping at 1/4, 2/4 or 3/4.
- Partial retries reuse already valid reports from the same fingerprint and request only missing reports.
- Previous reports from another fingerprint are explicitly labelled HISTORICAL.
- A superseded transaction schedules the newer current analysis instead of restoring stale state.
- Keeps 29.3.16 IndexedDB reconciliation and historical isolation.
- Keeps exact 5/5 direct stable gate, watchdog, snapshot freeze and atomic Atlas → NØX → Aerith chain.
- No Bridge change.
- No Control Center change.
- No Market Flow change.
- No CSS change.
- No index.html change.


## Build 29.3.18 — Bridge Recovery Watchdog + Unattended Mode Lock

- Fixes a contradiction in Bridge supervision: comments said it belonged to the authorized session, but code still restricted automatic supervision to Advanced view.
- Bridge supervision now remains active in Basic, Intermediate or Advanced view.
- Hidden browser tabs no longer deliberately disable Bridge health supervision.
- POST requests classify timeout/offline failures and automatically arm Bridge health recovery.
- A successful local request is treated as a positive Bridge health signal.
- Atlas stops the current report batch on Bridge timeout/offline instead of hammering remaining endpoints.
- Already completed same-fingerprint reports remain preserved for partial retry.
- After Bridge recovery, the automatic chain wakes immediately.
- Aerith timeout/offline keeps Atlas 4/4 and uses the existing Aerith-only retry path.
- Keeps transaction supersession, partial-report reuse, IndexedDB reconciliation, stable exact 5/5 gate, watchdog and snapshot freeze.
- No Bridge binary change.
- No Control Center change.
- No Market Flow change.
- No CSS change.
- No index.html change.


## Build 29.3.19 — Fast Fail Local Bridge + Retry Storm Lock

- Local Bridge supervision no longer depends on `navigator.onLine`; localhost health remains testable independently of Internet status.
- Summary requests fast-fail after timeout/offline instead of repeating the same long request while the Bridge watchdog is already recovering.
- Only one Bridge health probe may be in flight at a time.
- Automatic retry escalation is bounded and still uses a single replaceable timer.
- Removes duplicate Bridge recovery starts from report/conclusion catches.
- Successful Bridge recovery clears accumulated analytical retry escalation.
- Timeout/offline is presented as a recoverable local pause, not as loss of already valid reports.
- Keeps transaction supersession, partial same-fingerprint retry, IndexedDB reconciliation, exact stable 5/5 direct gate, watchdog and snapshot freeze.
- No Bridge binary change.
- No Control Center change.
- No Market Flow change.
- No CSS change.
- No index.html change.


## Build 29.3.20 — Unattended Supervision + Timer Cleanup Lock

- Fixes a remaining contradiction: a later visibility handler still stopped Bridge supervision when the tab became hidden.
- Hidden tabs no longer deliberately stop local Bridge supervision anywhere in the active auto-controller.
- pagehide performs explicit cleanup; pageshow re-arms Bridge + analytical scheduling.
- Centralizes analytical timer cleanup.
- Prevents automatic scheduler stacking during an active Atlas/Aerith transaction.
- CURRENT promotion clears stale pending/retry state immediately.
- Partial retries, Bridge recovery and superseded transactions replace stale timers instead of accumulating them.
- Keeps fast-fail Bridge recovery, one health probe at a time, transaction supersession, partial report reuse, IndexedDB reconciliation, exact stable 5/5 direct gate and snapshot freeze.
- No Bridge binary change.
- No Control Center change.
- No Market Flow change.
- No CSS change.
- No index.html change.


## Build 29.3.21 — Deferred Retry + Transaction Flush Lock

- Fixes a critical retry deadlock introduced by the active-transaction scheduler guard.
- Retry requests raised during Atlas/Aerith execution are no longer silently discarded.
- Active-transaction retries are queued as one deferred retry.
- RunAll flushes the deferred retry only after clearing `transactionFingerprint`.
- Standalone Aerith runs flush the deferred retry only after clearing `atlasLocalConclusionState.running`.
- Superseded transactions no longer create an orphan `setTimeout`; they use the same deferred-retry queue.
- Preserves one analytical retry timer at a time.
- Preserves fast-fail Bridge recovery, partial report reuse, transaction supersession, IndexedDB reconciliation, exact stable 5/5 gate and snapshot freeze.
- No Bridge binary change.
- No Control Center change.
- No Market Flow change.
- No CSS change.
- No index.html change.


## Build 29.4.00 — PRODUCT ADVANCE · Watchlist Intelligence + News Reaction + Math V4

This is a product feature release, not another retry/timer patch.

### Atlas Watchlist Intelligence V4
- Turns the saved watchlist into an autonomous descriptive reader.
- Separates leaders, assets under pressure, market-foundation assets and speculative/fragile profiles.
- Uses current market data and Atlas score only.
- Does not emit buy/sell recommendations.

### News Sentinel Event Reaction V1
- Links the lead qualified News Sentinel event with affected assets found in the current market snapshot.
- Compares observed 24 h/7 d movement with the event direction.
- Explicitly distinguishes coherence, divergence and insufficient data.
- Never converts correlation/temporal proximity into causal proof.

### Atlas Math Core V4
- Preserves all Math Core V3 historical-risk metrics.
- Adds the current News ↔ market reaction context.
- Keeps the anti-causality rule explicit.

### Atlas Auto Reader V3
- Adds leaders / laggards / foundation / speculative summaries.
- Adds News Sentinel ↔ market interpretation.
- Moves the product closer to: open the page → Atlas reads → compares → explains.

### Preserved infrastructure
- Exact stable 5/5 direct-source gate.
- Snapshot freeze.
- Atlas → NØX → Aerith automatic chain.
- IndexedDB CURRENT/HISTORICAL separation.
- Bridge recovery and transaction protections.
- Control Center V2.3.2R2 / Bridge V1.9.2 unchanged.
- Market Flow / CSS / index.html unchanged.


## Build 29.5.00 — Aerith Pedagogy V2 + Whole Page Reader

This is cumulative and includes the complete 29.4.00 product advance plus all previously inherited stability locks.

### Aerith Pedagogy V2
- Reads the current whole-page snapshot contract.
- Explains crypto / trading / banking / statistical jargon in French.
- Sends Watchlist Intelligence V4, News Event Reaction V1 and Math Core V4 to the pedagogical layer.
- Produces a Simple / Detailed / Expert reading contract.
- Keeps fact / hypothesis / interpretation / risk / missing-information separation.

### Question Libre V2
- A free question now receives the whole current snapshot, pedagogy contract, current same-fingerprint Atlas reports and current conclusion when valid.
- The Bridge receives explicit `whole_page_simple_detailed_expert` intent.
- No stale conclusion/report is injected when the fingerprint differs.

### Auto Reader V3.1
- Adds plain-language definitions for leader, under pressure, market foundation, speculative/fragile, volatility, drawdown and VaR.

### Safety / truth
- Correlation is never promoted to causation.
- Missing values remain INFORMATION MANQUANTE.
- No buy/sell instruction is generated by the pedagogy layer.
- Historical conclusions remain distinct from CURRENT.

### Inherited cumulative stack
- 29.4.00 Watchlist Intelligence + News Reaction + Math V4.
- Stable 5/5 direct-source gate.
- Snapshot freeze.
- Atlas → NØX → Aerith automatic chain.
- IndexedDB CURRENT/HISTORICAL reconciliation.
- Bridge recovery / transaction protections.
- Control Center V2.3.2R2 / Bridge V1.9.2 unchanged.
- Market Flow / CSS / index.html unchanged.


## Build 29.6.00 — Historical Memory V2 + Snapshot Compare

Cumulative release. Includes the entire 29.5.00 product/pedagogy stack and all inherited stability locks.

### Historical Memory V2
- Stores up to 30 compact CURRENT snapshots locally.
- Stores only after a successful Atlas → NØX → Aerith → CURRENT promotion.
- Historical entries never become CURRENT merely because they exist in storage.

### Snapshot Compare V2
- Compares the current snapshot with the previous CURRENT snapshot.
- Measures Top-5 price evolution between snapshots.
- Identifies the largest observed change.
- Detects whether the lead News event changed.
- Preserves watchlist-category evolution for pedagogy and analysis.
- Missing values remain missing; no synthetic values are invented.

### Aerith / Atlas integration
- Whole-page pedagogy receives historical comparison.
- Question Libre receives the current snapshot + up to 10 recent historical compact snapshots + current comparison.
- Auto Reader adds an “ÉVOLUTION DEPUIS LE SNAPSHOT PRÉCÉDENT” section.

### Preserved cumulative stack
- 29.5.00 Aerith Pedagogy V2 / Whole Page Reader.
- 29.4.00 Watchlist Intelligence / News Reaction / Math Core V4.
- Stable 5/5 direct-source gate.
- Snapshot freeze.
- Atlas → NØX → Aerith automatic chain.
- IndexedDB CURRENT/HISTORICAL reconciliation.
- Bridge recovery / transaction protection / retry controls.
- Control Center V2.3.2R2 / Bridge V1.9.2 unchanged.
- Market Flow / CSS / index.html unchanged.


## Build 30.0.00 — Public Stable Release Candidate · Cumulative Freeze

This release is cumulative. It includes the complete 29.6.00 / 29.5.00 / 29.4.00 feature stack and inherited stability locks.

### Release Candidate contract
- Interface: Build 30.0.00
- Control Center: V2.3.2R2
- Bridge: V1.9.2
- Model: gpt-oss:20b-32k
- No Bridge binary change.
- No Control Center change.
- No Market Flow change.
- No CSS change.
- No index.html change.

### Frozen product features
- Atlas Watchlist Intelligence V4.
- News Event Reaction V1.
- Atlas Math Core V4.
- Atlas Auto Reader V4.
- Aerith Pedagogy V2 / Whole Page Reader.
- Question Libre with current snapshot, same-fingerprint reports, historical memory and current conclusion.
- Historical Memory V2 / Snapshot Compare.

### Frozen analytical invariants
- Atlas automatic start only after exact 5/5 Binance direct sources, 0 derived, stable gate.
- Snapshot/fingerprint frozen through Atlas → NØX → Aerith.
- CURRENT promotion only after 4/4 Atlas + Aerith share the same fingerprint.
- Historical IndexedDB/local history never becomes CURRENT by restore order.
- Bridge timeout/offline preserves valid partial work and retries.
- Superseded transactions cannot promote stale CURRENT.
- No automatic real financial execution.

### RC self-audit
The page now exposes:
- static release-contract audit;
- runtime fingerprint/4-of-4/Aerith/CURRENT audit;
- RC metadata inside Atlas/Aerith whole-page contracts.

30.0.00 should now be treated as the stabilization candidate. Future 30.0.x builds should be bug-fix-only unless a new product branch is explicitly opened.


## Build 30.0.01 — Gate Truth + Autostart Sync Fix

Bug-fix-only RC build.

- Fixes misleading top banner that said “Atlas starts automatically at 5/5” while the 10-second stability gate or another prerequisite could still be pending.
- Top banner now distinguishes:
  - waiting for 5/5 direct;
  - 5/5 detected, stability countdown;
  - 5/5 stable but Bridge/Market/Graph prerequisite still pending;
  - all prerequisites ready / analysis pending.
- Stable-gate transition now synchronizes the current-state banner before scheduling Atlas.
- Scheduler synchronizes the banner with the exact blocking prerequisite.
- Autostart wake delay after confirmed stable 5/5 reduced from 600 ms to 250 ms.
- Does NOT loosen the exact 5/5 direct + 0 derived + stable gate.
- No Bridge / Control Center / Market Flow / CSS / index.html changes.


## Build 30.0.02 — Aerith Conclusion Recovery + State Coherence Fix

Bug-fix-only RC build based on observed production state.

- Fixes the contradiction “En attente des quatre rapports Atlas-10” while Atlas is already 4/4.
- Preserves same-fingerprint CURRENT / ERROR / ATLAS_4_4_READY / NOX_READY / AERITH_RUNNING states against live-gate banner downgrades.
- Makes conclusion validation tolerant to valid local-model wording while preserving anti-invention and financial-safety requirements.
- If an automatic Aerith conclusion is structurally incomplete, Atlas 4/4 is preserved and Aerith alone is retried automatically.
- No Atlas recalculation for an Aerith-only validation retry.
- No version-control rewrite.
- No Bridge / Control Center / Market Flow / CSS / index.html change.


## Build 30.0.03 — Historical Source Qualification Fix

Bug-fix-only RC build based on the observed:
`Historiques directs · 4 directs · 1 non qualifié`

### Root cause
`atlasChartSourceMode()` recognized:
- `binance-direct-klines`
- `binance-derived-klines`

but did not recognize the scanner equivalents:
- `binance-scanner-direct-klines`
- `binance-scanner-derived-klines`

A valid Binance historical series produced by the scanner could therefore be counted as `unknown`, even though its data source was valid and network-fetched.

### Fix
- Both scanner Binance kline modes are now qualified as historical `direct` provenance.
- No live-price qualification rule is changed.
- No 5/5 Binance spot gate is loosened.
- If a future unknown historical mode remains, the UI now names the affected symbol(s) instead of only displaying `1 non qualifié`.

### Preserved
- Atlas 4 reports.
- Atlas consolidated conclusion.
- Aerith-10 Crypto synthesis.
- 5/5 Binance direct live quote gate.
- NØX / Math Core / Watchlist / News / historical memory.
- Version Control logic unchanged except the build number.
- Bridge / Control Center / Market Flow / CSS / index.html unchanged.


## Build 30.0.04 — Aerith Pipeline Contract + State Separation Fix

Bug-fix-only RC build based on observed production screenshots.

### Fixed: normal Atlas waiting was displayed as an Aerith failure
The conclusion panel now distinguishes:
- Atlas 0/4 → 3/4: normal waiting, no Aerith error;
- Atlas 4/4: automatic Aerith launch;
- Aerith running;
- genuine Aerith contract failure;
- CURRENT conclusion.

A stale previous message such as `Conclusion locale non générée` is replaced by the current Atlas progress while a new Atlas transaction is running.

### Fixed: fragile browser-side lexical gate
Bridge V1.9.2 already returns a structured conclusion response:
- `ok = true`
- `profile = aerith`
- `source_reports = 4`
- `report_fingerprint`
- `read_only = true`
- `model`
- `answer`

Build 30.0.04 now validates this structured Bridge contract as the primary acceptance gate.
The old text/keyword validator remains diagnostic only and cannot reject an otherwise valid structured Bridge conclusion.

### Model lock
A CURRENT Aerith conclusion is accepted only when the Bridge response model matches the stable stack model:
`gpt-oss:20b-32k`.

An old IndexedDB historical synthesis tagged `llama3.2:latest` remains historical and can never satisfy the CURRENT conclusion contract.

### Automatic chain
No manual validation is required between Atlas and Aerith:
5/5 direct stable → Atlas 4/4 → NØX → Aerith automatically → CURRENT.

Human validation remains required only before any real financial decision/action.

### Preserved
- 30.0.03 historical 5-direct qualification fix.
- 5/5 Binance direct gate.
- Atlas four-report architecture.
- Atlas consolidated analytical layer.
- NØX No-FOMO.
- Historical memory / IndexedDB separation.
- Version Control behavior.
- Bridge V1.9.2 / Control Center V2.3.2R2.
- Market Flow / CSS / index.html unchanged.


## Build 30.0.05 — UI Progress Readability + 32K Lock

Targeted correction requested from screenshot annotations.

- Keeps `ollama · gpt-oss:20b-32k`.
- Enlarges the local dialogue readiness/status text.
- Makes Atlas progress explicit as 0 %, 25 %, 50 %, 75 %, 100 %.
- Keeps 1/4, 2/4, 3/4, 4/4 alongside percentage.
- Removes the blocking `no_forbidden_financial_instruction` regex contract that could reject a valid cautious Aerith response merely because it contained words such as `ordre automatique` in a negated sentence.
- No new business rule added.
- Atlas 4 reports → NØX → Aerith automatic chain preserved.
