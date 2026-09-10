# Build 29.3.06R1 — Stable Stack Metadata Correction

Correction ciblée sans changement fonctionnel :
- `ATLAS_STABLE_STACK.interface` corrigé vers `Build 29.3.06`.
- `ATLAS_STABLE_STACK.controlCenter` corrigé vers `V2.3.1R1`.
- Bridge `V1.9.1` et modèle `gpt-oss:20b-32k` inchangés.
- Contrôleur déterministe 29.3.06 inchangé.

---

# Build 29.3.06 — Version Control Deterministic Human-Readable Lock

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
3. Le badge doit afficher `Market Core V2.0-Alpha · Build 29.3.06`.
4. Un clic sur le badge doit soit confirmer la version courante, soit afficher temporairement `Synchronisation GitHub · Build 29.3.06` pendant la propagation.
5. L’ancien message `Publication Build ... incomplète · Revérifier` ne fait plus partie du contrôleur 29.3.06.

---

# Build 29.3.05 — Version Identity Repair Lock

- Base : 29.3.04.
- Répare l'identité interne incohérente de la 29.3.04 (`ATLAS_RELEASE=29.3.04` mais `ATLAS_BUILD` / `ATLAS_ASSET_TOKEN` restés en 29.3.03).
- Synchronise `ATLAS_RELEASE`, `ATLAS_BUILD`, `ATLAS_ASSET_TOKEN`, carte Interface et manifeste sur 29.3.05.
- Recalcule l'empreinte SHA-256 de `app.js`.
- Conserve intégralement le verrou automatique Binance 5/5 direct.
- Conserve Bridge V1.9.1, Control Center V2.3.1R1, GPT-OSS 20B-32K, Atlas 4/4, NØX No-FOMO, Aerith News Intelligence et IndexedDB.
- Aucun changement Market / Graphique / Math Core / Learning / Métaux.

---

# Build 29.3.04 — Atlas 5/5 Direct Start Gate Lock

- Base : 29.3.03.
- Production automatique canonique strictement verrouillée sur Binance `5/5` cotations directes et fraîches.
- À `4/5`, Atlas reste armé et attend ; aucun paquet incomplet n'est persisté.
- Suppression de l'expiration arbitraire de 90 s du scheduler de readiness.
- Réveil événementiel immédiat sur transition `binance-ready` 5/5.
- Auto-probe Bridge et orchestrateur liés à la session opérateur autorisée, pas à la vue UI active.
- Ancien paquet valide conservé jusqu'à finalisation du nouveau fingerprint.
- Chaîne 29.3.03 conservée : Atlas 4/4 → NØX No-FOMO → Aerith → IndexedDB.
- Bridge V1.9.1 et Control Center V2.3.1R1 inchangés.
- Aucun mode 4/5 dégradé pour la production canonique.

---

## Build 29.3.03 — Aerith News Intelligence + NØX No-FOMO Recovery Lock

- Base : 29.3.02.
- Bridge cible : V1.9.1.
- Ajout contrat `agent_crypto_nox_no_fomo_v1`.
- NØX No-FOMO : CALME / PRUDENCE / STOP, causalité non établie par défaut, stop gates, qualité Math Core, sources et preuve/impact News.
- Aerith : conclusion enrichie par News Sentinel + NØX ; aucune news convertie en signal d'exécution.
- Orchestrateur 4/4 → conclusion conservé.
- Aucun changement Market/Graph/Math Core métier/Simulation/Learning/Metals.

## Build 29.3.02 — Atlas Automatic Orchestrator Recovery Lock

- Base canonique : 29.3.00 publiée ; 29.3.01 abandonnée comme expérimentation non canonique.
- Cause : le scheduler Atlas pouvait perdre un événement si le Bridge/readiness n'étaient pas prêts au premier timer ; son motif par défaut `snapshot` était en outre absent de l'allowlist.
- Réparation transactionnelle de l'orchestrateur automatique, sans fallback 4/5 et sans changement des calculs.
- Retry conservateur lors des états transitoires Bridge / Atlas / Aerith dans la fenêtre anti-boucle de 90 s.
- Déclenchement explicite lors du passage Binance à 5 cotations EUR directes.
- Revalidation au retour Administration/focus/réseau même si le Bridge était déjà `ready`.
- Fingerprint : aucun recalcul d'un paquet courant déjà 4/4 + conclusion ; un nouveau fingerprint reste éligible.
- IndexedDB : le fingerprint restauré devient aussi la référence automatique pour éviter le doublon après F5.
- Chaîne : snapshot → Atlas 4 rapports → 4/4 → Aerith `/conclusion` → synthèse partagée → IndexedDB.
- NØX non simulé : aucune route/agent NØX canonique n'est câblé dans la 29.3.00 ; No-FOMO et contradictions existants seulement.
- Control Center V2.3.0R1, Bridge V1.9.0 et `gpt-oss:20b-32k` inchangés.
- `index.html`, `style.css`, `runtime_config.json`, assets, Market, Graphique, Math Core, Métaux et Modules 01–11 inchangés.

---

## Build 29.3.00 — Atlas-10 / Aerith-10 GPT-OSS Local Stack Recovery Lock

- Base : 28.3.60 validée.
- Nouvelle pile locale canonique : Control Center V2.3.0R1 + Bridge V1.9.0 + `gpt-oss:20b-32k`.
- Alignement de l’Interface sur le Fact Contract V3 Truth/Evidence réellement produit par Atlas.
- Conservation de la compatibilité V2 pour reprise historique.
- Question libre, quatre rapports Atlas et conclusion Aerith raccordés à la pile 29.3.
- Source Truth, Evidence, Math Quality Gates, Contradictions et empreinte analytique restent déterministes et prioritaires sur le LLM.
- Aucun changement Market, Graphique, Target Top 5, Market Flow, Modules 01–11, simulation, Métaux ou géométrie Firefox.
- Lecture seule : aucune action exchange, wallet, GitHub ou UI.

---

## Build 28.3.60 — Module 03 Visible-Step No-Valse Lock

- Base : 28.3.59 publiée.
- Test Firefox réel : les cartes Étapes 2/3/4 pouvaient déjà être visibles, mais chaque clic Module 03 relançait un recentrage programmé après rerender/persistance.
- Cause : `scrollToFoundationStage()` était appelé systématiquement après les mutations du Module 03, même lorsque la prochaine étape était déjà utilisable à l’écran.
- Guard Firefox posé avant les rerenders Risk.
- Nouveau verrou visible-step : après persistance + deux frames, aucune navigation si le début utile de la prochaine carte est déjà visible.
- Un seul cadrage non lissé si la prochaine étape est réellement hors zone utile.
- Couverture : coûts, montant engagé, scénarios −3 % / +5 %, mauvaise réponse finale et conclusion 5/5.
- Actions principales Risk `verify` / `note` : même politique visible = immobile.
- Module 01, Module 02, Modules 04–11, données live, calculs, preuves métier et pédagogie 28.3.59 inchangés.
- `index.html`, `style.css`, `runtime_config.json` et assets inchangés.
- Version Control Protected Core inchangé hors identité 28.3.60.

---

## Build 28.3.59 — Module 03 Beginner Pedagogy + Risk Position Unlock

- Base : 28.3.58 publiée.
- Bug Firefox/UI confirmé : le Module 03 pouvait conserver 50 € dans le simulateur sans valider `risk_position`, laissant −3 % / +5 % verrouillés.
- Cause : l’étape 3 dépendait de `runSchoolTest("safe_btc_5")`, lui-même soumis à une cotation Binance fraîche.
- Découplage ciblé : le Module 03 enregistre désormais une preuve pédagogique locale `percentage_only_simplified` de 50 € engagés sur 1 000 € ; aucun prix d’exécution live n’est requis.
- Les scénarios −3 % / +5 % calculent directement gain/perte brut puis net sur le montant engagé.
- Pédagogie réécrite : français simple d’abord, jargon ensuite — taille de position, exposition, P/L brut/net, spread, slippage, seuil de rentabilité, perte maximale, règle d’arrêt, drawdown et récupération.
- Exemple école conservé : 0,60 % de coûts aller-retour ≈ 0,30 € sur 50 €, explicitement non réel.
- Archive Module 03 passe au schéma `agent_crypto_risk_module_03_archive_prefill_v2` : aucun faux prix d’entrée ou quantité BTC n’est fabriqué pour l’exercice percentage-only.
- Module 01 viewport 28.3.58, Module 02, Modules 04–11 et moteurs métier inchangés.
- `index.html`, `style.css`, `runtime_config.json` et assets inchangés.
- Version Control Protected Core inchangé hors identité 28.3.59.

---

## Build 28.3.58 — Module 01 Livecheck Market Single Focus Lock

- Base : 28.3.57 publiée.
- Régression Firefox 28.3.57 confirmée : Market non cadré au clic Livecheck, cible Bitcoin automatique encore programmée après validation.
- Restauration du cadrage immédiat unique vers `#market-workspace`.
- Guard Firefox posé avant le cadrage et conservé pendant Livecheck + preuve IndexedDB.
- Suppression de toute navigation automatique de fin de Livecheck.
- Bitcoin devient une cible uniquement via le clic explicite « Voir la ligne Bitcoin ».
- Modules 02–11, calculs, données live, simulation, reset, assets et CSS inchangés.
- `index.html`, `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé hors identité 28.3.58.

---

## Build 28.3.57 — All Modules Guided Viewport Consolidation Lock

- Base : 28.3.56 préparée.
- Audit transversal Modules 01–11 appliqué.
- Le feedback Learning ne peut plus déclencher son propre `scrollIntoView()`.
- `foundationFeedback()` devient informatif uniquement.
- Guard commun démarré dans `handleFoundationAction()` pour couvrir aussi les appels programmatiques avant save/rerender.
- Validation de leçon, archivage et passage au module suivant couverts par la même transaction de viewport.
- Module 01 : suppression du pré-cadrage Livecheck et du `scrollIntoView()` direct vers Bitcoin ; une seule cible finale via le scheduler commun.
- Garde-fou transactionnel porté à 15 s pour Livecheck / IndexedDB longs, avec restitution immédiate après navigation terminée.
- Modules 02–11 : feedbacks et cartes de fin ne possèdent plus le viewport.
- Aucun calcul pédagogique, donnée live, simulation métier ou asset modifié.
- `index.html`, `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé hors identité 28.3.57.

---

## Build 28.3.56 — Firefox Guided Viewport Transaction Lock

- Base : 28.3.55 publiée.
- Test Firefox réel 28.3.55 : premier cadrage correct, puis déplacement tardif du viewport.
- `overflow-anchor:none` temporaire appliqué avant les rerenders pédagogiques guidés.
- Guard commun `html` + `body`, focus neutralisé et restitution exacte de la valeur précédente.
- Attente du timer de sauvegarde + chaîne IndexedDB avant l'échantillonnage géométrique final.
- Cible observée sur 4 échantillons stables ; un seul positionnement final non lissé.
- Une navigation devenue obsolète est annulée si une cible plus récente a pris la main.
- Expiration de sécurité du guard après 6 s si aucune navigation ne termine la transaction.
- Compatibilité conservée avec le verrou de viewport propre au Module 02.
- Reset 28.3.54 inchangé.
- Aucun changement des calculs du Module 03, des données live, du Market ou des assets.
- `index.html`, `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé hors identité 28.3.56.

---

## Build 28.3.55 — Guided Learning Single Recenter Lock

- Base : 28.3.54.
- Cause identifiée dans le parcours guidé : `atlasLearningScheduleTarget()` effectuait un cadrage puis des corrections à 90 ms et 240 ms.
- Suppression de ces recadrages différés.
- Attente courte de stabilité géométrique de la cible, puis un seul positionnement final non lissé.
- `blur()` du contrôle actif avant les rerenders de fondation et les actions principales du cockpit.
- Reset 28.3.54 inchangé : son recentrage utilise une routine séparée.
- Aucun changement pédagogique ou mathématique du Module 03.
- Aucun changement Market, données live, simulation, IndexedDB, Métaux, News Sentinel, Decision Board ou assets.
- `index.html`, `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé hors identité 28.3.55.

---

## Build 28.3.54 — Learning Reset In-Place Single Recenter Lock

- Base : 28.3.53.
- Contrat : reset vérifié → rester dans la page → recentrer UNE fois sur `learningSessionPlan` → immobilité.
- Aucun `window.location.reload()` réintroduit.
- Suppression du maintien artificiel de l'ancien viewport par `window.scrollBy()` ajouté en 28.3.53.
- Rerender local conservé.
- Attente de stabilité géométrique sans mouvement, puis un seul positionnement final non lissé.
- Aucun recadrage différé 120 / 420 / 1000 ms.
- Focus du bouton neutralisé.
- Aucun changement Market, données live, Modules 01–11, Math Core, Métaux, News Sentinel, Decision Board ou assets.
- `index.html`, `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé hors identité 28.3.54.

---

## Build 28.3.53 — Learning Reset In-Place Lock

- Base : 28.3.52.
- Suppression de `window.location.reload()` après `Repartir de zéro`.
- Écriture + relecture IndexedDB + vérification du carnet vierge conservées.
- Nettoyage LocalStorage pédagogique/simulation conservé.
- Reconstruction locale du cockpit, de la simulation, de la feuille de route et des états pédagogiques transitoires.
- Market et données live non redémarrés.
- Position visuelle de `learningSessionPlan` conservée avec un seul ajustement géométrique synchrone si nécessaire.
- Aucun passage par le haut de page, aucun reload et aucun recadrage différé.
- Rollback existant inchangé en cas d'échec de reset.
- `index.html`, `style.css`, `runtime_config.json` et assets inchangés.
- Version Control Protected Core inchangé hors identité 28.3.53.

---

## Build 28.3.52 — Learning Reset Stable Landing Lock

- Base : 28.3.51.
- Cause restante : le cadrage post-reset arrivait avant stabilisation géométrique des blocs situés au-dessus du Cockpit.
- Attente de stabilité de `learningSessionPlan` avant le seul cadrage final.
- Prise en compte de la fin du Livecheck de démarrage lorsqu'elle intervient dans la fenêtre d'attente.
- Délai maximal 5 s en cas de réseau lent.
- Aucun recadrage différé ajouté.
- Conservation du verrou Firefox `blur()`.
- Suppression du `overflow-anchor:none` temporaire du reset.
- Aucun changement fonctionnel hors navigation post-reset.
- `index.html`, `style.css`, `runtime_config.json` et assets inchangés.
- Version Control Protected Core inchangé hors identité 28.3.52.

---

## Build 28.3.51 — Learning Reset Firefox Focus Lock

- Base : 28.3.50.
- Correction de la seconde cause de « valse » observée dans Firefox après `Repartir de zéro`.
- `blur()` du contrôle actif avant `confirm()` puis juste avant `reload()`.
- Garde post-reset temporaire contre la restauration de focus de `btnResetLearningJourney`.
- `history.scrollRestoration = manual` maintenu pendant le redémarrage du reset.
- `overflow-anchor` neutralisé temporairement sur `html` et `body`, puis restauré automatiquement.
- Aucun scroll différé ajouté ; le reset conserve un seul cadrage vers `learningSessionPlan`.
- Aucun changement des Modules 01–11, de l'image Module 01, de la simulation, mémoire, Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board ou fiche Crypto.
- `index.html`, `style.css`, `runtime_config.json` et assets inchangés.
- Version Control Protected Core inchangé hors identité 28.3.51.

---

## Build 28.3.50 — Learning Reset Single Focus Lock

- Base : 28.3.49.
- Correction ciblée du bouton `Repartir de zéro`.
- Reset fonctionnel inchangé : retour Module 01 · 0/5 après reload.
- Suppression des recadrages différés spécifiques au reset à 120 / 420 / 1000 ms.
- Un seul cadrage est conservé après stabilisation du rendu par double `requestAnimationFrame`.
- But : empêcher la « valse » du viewport après un premier positionnement déjà correct.
- Aucun changement des Modules 01–11, de l’image Module 01, de la simulation, mémoire, Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board ou fiche Crypto.
- `index.html`, `style.css`, `runtime_config.json` et assets inchangés.
- Version Control Protected Core inchangé hors identité 28.3.50.

---

## Build 28.3.49 — Module 01 Market Visual Recap Lock

- Base : 28.3.48.
- Ajout de `web/assets/learning/module_01_market_visual_recap.png`.
- Module 01 : vue pédagogique annotée Prix / 24 h / 7 j / Source / Heure.
- La vue n’apparaît qu’après validation de l’étape 4 afin de préserver la recherche active des preuves.
- Les valeurs réelles de la session restent affichées dynamiquement à côté de l’image ; la capture est qualifiée comme exemple visuel.
- Après validation Source + Heure, cadrage vers `marketFoundationVisualRecap`, puis rappel actif de l’étape 5.
- Aucun changement du Module 02 ni des Modules 03–11.
- Aucun changement Market, Graphique, Target Top 5, Market Flow, Math Core, Métaux, News Sentinel, Decision Board, simulation, mémoire ou fiche Crypto.
- `index.html`, `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé hors identité 28.3.49.

---

## Build 28.3.48 — Sticky Dock Persistence Polish Lock

- Base : 28.3.47.
- Fiche Crypto latérale : sticky renforcé pendant le scroll long.
- Hauteur dynamique du viewport + scroll interne stable.
- Préférence Flottante / Latérale toujours mémorisée.
- Conservation temporaire de l'actif inspecté lors des transitions de largeur / Math Core.
- Retour automatique possible au dock quand la place redevient suffisante.
- `Échap` ferme et oublie explicitement la sélection temporaire.
- Aucun changement du score ATLAS, de la géométrie Market ou des données.
- `index.html` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé hors identité 28.3.48.

---

## Build 28.3.47 — Adaptive Crypto Card Dock Lock

- Base : 28.3.46.
- Correction ciblée du bouton `Latérale` de la Fiche Crypto.
- Suppression du seuil arbitraire `window.innerWidth >= 1540`.
- Disponibilité calculée sur la largeur réelle de `Market Workspace`.
- Réserve minimale de 980 px pour le tableau + 320 px pour la fiche + rail/gaps réels.
- Math Core Latéral : fiche flottante conservée.
- Math Core Réduit ou Dessus : ancrage autorisé dès que la place réelle est suffisante.
- Aucun `/100` ajouté au score ATLAS.
- Aucune logique de données, pédagogie, simulation ou mémoire modifiée.
- `index.html` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé hors identité 28.3.47.

---

## Build 28.3.46 — Crypto Card Dock / Floating Visual Stability Lock

- Base : 28.3.45.
- Fiche Crypto : ajout du choix `Flottante` / `Latérale`.
- Préférence mémorisée localement.
- Mode latéral réservé aux écrans >= 1540 px avec Math Core Réduit ou Dessus.
- Transformer Book / écran compact : fallback flottant automatique, aucune compression forcée du tableau.
- Math Core Latéral : fiche Crypto flottante afin d'éviter trois colonnes concurrentes.
- Fiche latérale mise à jour par le même flux live que la fiche flottante.
- Aucune largeur de colonne Market existante modifiée.
- Score ATLAS compact inchangé ; aucun `/100`.
- `index.html`, `runtime_config.json`, données, modules, simulation, mémoire et workflow inchangés.
- Version Control Protected Core inchangé hors identité 28.3.46.

---

## Build 28.3.45 — Market Truth Labels + Visual Stability Lock

- Base : 28.3.44.
- Score ATLAS conservé sous sa forme compacte actuelle, sans `/100`.
- Aucun changement CSS ou géométrique du Market Snapshot, du Math Core ou de la fiche Crypto.
- Capitalisation >= 10^12 EUR affichée en milliards explicites.
- Tooltip du point terminal : prix live séparé de la variation de période.
- Math Core : contexte spot live séparé de la série historique.
- Décision : justification dans la fiche Crypto et au survol, sans allonger le tableau.
- Provenance 24 h / 7 j / capitalisation / volume ajoutée au survol.
- Modules 01–11, simulation, données, `index.html`, `style.css`, `runtime_config.json`, workflow et Version Control Protected Core inchangés hors identité.

---

## Build 28.3.44 — 11 Modules Active Recall + Automatic Memory Parity Lock

- Base : 28.3.43.
- Audit du fil Crypto et de la pédagogie des Modules 01 à 11.
- Invariant commun : preuve → réponse de mémoire → première tentative conservée → validation/correction → explication → archive.
- Module 01 : rappel actif existant conservé.
- Module 02 : suppression de la fuite de réponse avant la question finale ; logique Ask/Bid et Marché/Limite conservée.
- Module 03 : scénarios figés conservés ; explication finale déplacée après la première réponse.
- Modules 04–11 : premières tentatives enregistrées aux étapes de choix 2/3 et à la question finale.
- Fiches d'étapes : les indices qui révélaient la réponse sont masqués jusqu'à la première tentative.
- Compatibilité historique : aucune première tentative n'est inventée pour une ancienne preuve déjà validée.
- Journal + Data Collector automatiques étendus des Modules 01–02 aux Modules 01–11.
- Mémoire dérivée dédupliquée depuis les archives pédagogiques canoniques ; aucune donnée manquante inventée.
- Aucune nouvelle image générée ; étude des futures vues explicatives documentée séparément.
- `style.css`, `runtime_config.json`, workflow marché et Version Control Protected Core inchangés hors identité 28.3.44.

---

## Build 28.3.43 — Memory Provenance + Distinct Snapshot Audit Lock

- Base : 28.3.42.
- Audit ciblé des Builds 28.3.33 → 28.3.42 et des décisions du fil Crypto.
- Correction de la provenance des snapshots : `state.mainSource` est traité comme une chaîne, plus comme un objet.
- Correction du volume 24 h : `c.volume24h` remplace `c.volume` dans le snapshot public de simulation/mémoire.
- Ajout de l'identité canonique marché (`snapshot_id` + `source_time`) dans les snapshots manuels.
- Déduplication renforcée : l'identité est lue aussi dans `snapshot.market_snapshot`, ce qui évite de compter plusieurs clics sur le même état comme plusieurs observations temporelles.
- Réécriture canonique des doublons IndexedDB détectés au démarrage.
- Tag Module 01 `market_observation` remplacé par `market_learning` pour séparer pédagogie et observation marché comparable.
- Réconciliation automatique des traces pédagogiques dérivées avec leur archive IndexedDB canonique.
- Ancien libellé `source live` affiché comme provenance historique non qualifiée, sans invention.
- `index.html`, `style.css`, `runtime_config.json`, workflow et pédagogie validée inchangés.
- Version Control Protected Core inchangé hors identité 28.3.43.

---

## Build 28.3.42 — Unified IndexedDB Memory + Panel Coherence Lock

- Base : 28.3.41.
- Data Collector migré de LocalStorage vers une IndexedDB dédiée, avec copie relue avant suppression de l’ancien stockage.
- Une seule lecture Collector alimente Data Collector, Explorateur, Plan de collecte et Assistant de reprise.
- Séparation explicite entre sessions pédagogiques et observations marché comparables.
- Deux observations marché distinctes suffisent pour comparer ; la troisième devient facultative.
- Explorateur et Assistant de reprise rendus automatiques et fondés sur l’état réel.
- Suppression des vieux objectifs figés « créer un 3e snapshot » / « V1.2-local-plan ».
- Modules pédagogiques, marché, simulation et Version Control Protected Core inchangés hors identité 28.3.42.

---

## Build 28.3.41 — Automatic Learning Memory Pipeline Lock — Modules 01 + 02

- Base : 28.3.40.
- Backfill automatique des archives Module 01 et Module 02 déjà présentes dans IndexedDB.
- Synchronisation automatique après archivage vérifié.
- Déduplication stricte par `learning_session_id`.
- Journal pédagogique automatique reconstruit depuis les preuves archivées.
- Data Collector local alimenté sans clic supplémentaire.
- Actions manuelles et exports conservés mais repliés comme outils facultatifs.
- Aucune donnée manquante inventée.
- Modules 03 à 11, Binance, CoinGecko, simulation et workflow marché inchangés.
- Version Control Protected Core inchangé hors identité 28.3.41.

---

## Build 28.3.40 — Module 02 Visual Recap Focus Lock

Base : 28.3.39 réparée.

- Après réussite de l’achat fictif de 50 € BTC, le cadrage vise désormais `spotFoundationVisualRecap`.
- L’étape 5 reste juste sous cette lecture visuelle.
- Aucun changement de simulation, source marché, style, image, IndexedDB ou contrôleur de version.
- Modification fonctionnelle : `web/app.js` uniquement.

---

## Build 28.3.39 — Module 02 Visual Recap + Pedagogical Isolation Lock

Cette Build part exactement de la 28.3.38.

### Mission unique

Ajouter une **vue expliquée** dans le Module 02 pour transformer le résultat de la simulation fictive en lecture pédagogique claire.

- Bloc visuel ajouté après l’étape 4 avec image annotée + texte explicatif.
- Focus pédagogique : 1 000 € de départ → 950 € disponibles + 50 € placés fictivement.
- Exposition et réserve du profil rappelées directement dans le cockpit.
- L’étape 5 devient **« À toi de répondre »** afin de séparer lecture du résultat et question finale.
- La destination pédagogique Spot reste `learningFoundationPanel` et n’utilise plus `schoolPanel` comme repère de vérification.
- Fichiers fonctionnels modifiés : `web/app.js`, `web/style.css`.
- Nouvel asset : `web/assets/learning/module_02_spot_visual_recap.png`.
- `web/index.html` et `web/runtime_config.json` restent inchangés.

---

# Agent-Crypto — historique des builds

## Build 28.3.38 — Resilient Binance Execution Quote Router + Public Snapshot Publication Lock

- Base : Build 28.3.37.
- Diagnostic : le moteur de simulation exigeait encore `atlasAnalysisLiveReady()` puis utilisait `coin.price`, donc le prix d’exécution fictive pouvait dépendre du snapshot public CoinGecko. Le seuil public autorisait jusqu’à 3 heures.
- Correction : une exécution fictive sur actif couvert exige désormais une cotation Binance fraîche. WebSocket d’abord ; REST public ponctuel en secours.
- Le Module 02 injecte explicitement cette cotation dans le moteur de simulation ; CoinGecko ne peut plus être choisi implicitement comme prix d’exécution.
- Les preuves Spot enregistrent source + horodatage de la cotation.
- Valorisation du portefeuille : WebSocket Binance frais → dernier prix d’exécution local → historique seulement en dernier affichage.
- Snapshot public CoinGecko : seuil d’analyse active réduit de 3 h à 45 min ; affichage d’archive conservé.
- Workflow public : cible 30 min et publication protégée contre les non-fast-forward par fetch/reset propre + restauration du snapshot généré + trois tentatives de push, jamais de force push.
- `index.html`, `style.css`, `runtime_config.json` inchangés byte pour byte.
- Version Control Protected Core inchangé ; identité passée à 28.3.38.

---

## Build 28.3.37 — Module 02 Spot Single Click + Silent Simulation Focus Lock

- Base : Build 28.3.36.
- Retour Firefox réel : après « Simuler l’achat fictif de 50 € de BTC », la page pouvait encore se déplacer et l’étape rester à 3/5 sans résultat visible.
- Cause résiduelle isolée : le moteur pédagogique appelait encore le test générique du simulateur. Celui-ci exécute `resetSimulation()` puis `simulateOrder()`, et chacun rerend le grand panneau Simulation situé au-dessus du cockpit. Même avec le cockpit regroupé en un seul rendu, ces changements de hauteur déplaçaient visuellement la zone d’apprentissage.
- Le Module 02 exécute maintenant exactement le même moteur avec rendu du panneau Simulation désactivé pour cette transaction seulement. L’état local, le portefeuille fictif, le journal et la preuve pédagogique sont conservés.
- Verrou de clic : aucune seconde simulation concurrente tant que la première n’est pas terminée.
- Retour immédiat dans la carte : « Simulation en cours… », puis résultat ou message de réessai.
- Succès : une seule reconstruction du cockpit et un seul cadrage final vers l’étape 5.
- Échec réel : l’étape 4 reste la destination et aucune progression n’est créée.
- `index.html`, `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé ; identité passée à 28.3.37.

---

## Build 28.3.36 — Module 02 Spot Livecheck Handoff + Local Result Focus Lock

- Base : Build 28.3.35.
- Retour Firefox réel : le clic « Créer la position… » pouvait encore finir dans le haut du simulateur avec « Livecheck indisponible », notamment quand la lecture automatique de démarrage était déjà en cours.
- Cause précise : `runLivecheck()` renvoie immédiatement `false` lorsqu’un Livecheck est déjà occupé ; le parcours pédagogique interprétait cet état concurrent comme un échec. Le verrou de viewport commençait en plus après cette phase réseau.
- Le Module 02 rejoint maintenant le Livecheck déjà en cours, puis ne relance qu’une seule lecture si nécessaire.
- Le verrou visuel couvre toute la transaction, Livecheck compris.
- Échec réel : retour déterministe à l’étape 4 ; succès : cadrage unique sur l’étape 5.
- Le libellé débutant devient « Simuler l’achat fictif de 50 € de BTC » et définit le terme « position ».
- Aucun changement du moteur de simulation, d’IndexedDB, des règles de sécurité ou du Module 03.
- `index.html`, `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé ; identité passée à 28.3.36.

---

## Build 28.3.35 — Module 02 Spot Position Single Final Focus Lock

- Base : Build 28.3.34.
- Retour Firefox réel : la « valse » reste visible après la création de la position fictive.
- Cause de conception restante : la 28.3.34 demandait encore un cadrage immédiat puis plusieurs contrôles de position (80/180/420 ms), donc plusieurs commandes de scroll pendant une seule action.
- Le bouton pédagogique est maintenant défocalisé avant reconstruction du DOM.
- La réussite Spot déclenche un seul cadrage final vers l’étape 5, après deux frames de stabilisation, sans boucle de recadrage.
- Un échec Spot ne renvoie plus vers le haut de `learningFoundationLab` ; la zone courante est conservée.
- Simulation, règles de sécurité, IndexedDB, Ask/Bid, Marché/Limite et Module 03 inchangés.
- `index.html`, `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé ; identité passée à 28.3.35.

---

## Build 28.3.34 — Module 02 Spot Position Single Render Viewport Lock

- Base : Build 28.3.33.
- Cause isolée : le bouton de création de position déclenche plusieurs `renderLearningJourneyCockpit()` pendant `resetSimulation()`, `simulateOrder()` puis l’enregistrement de preuve.
- Ces reconstructions successives peuvent laisser Firefox recalculer son ancre visuelle et produire la « valse ».
- Le Module 02 regroupe maintenant ces rerendus en une seule reconstruction pédagogique finale.
- Le pré-cadrage introduit en 28.3.33 est retiré ; la destination n’est cadrée qu’une fois la simulation terminée.
- L’ancrage automatique du navigateur est neutralisé uniquement pendant cette transaction, puis restauré.
- Étape 5 ciblée directement après la reconstruction finale, avec contrôles courts de stabilisation.
- Simulation, preuves, IndexedDB, Ask/Bid, Marché/Limite, bulles et Module 03 inchangés.
- `index.html`, `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé ; identité passée à 28.3.34.

---

## Build 28.3.33 — Module 02 Spot Position Direct Focus Lock

- Base : Build 28.3.32.
- Correction ciblée du clic `Créer la position BTC fictive de 50 €`.
- Le viewport est cadré directement sur l’étape 5 juste avant les rerendus de simulation.
- Réutilisation du moteur `atlasLearningPositionTarget` existant ; aucun nouveau moteur de scroll.
- Cadrage préparatoire sans animation ni flash pour éviter le détour visuel.
- Validation, simulation fictive, preuves, IndexedDB et pédagogie Ask/Bid + Marché/Limite inchangées.
- Correction limitée au Module 02 ; Module 03 inchangé.
- `index.html`, `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé ; identité passée à 28.3.33.

---

## Build 28.3.32 — Module 02 Market / Limit Active Recall Lock

- Base : Build 28.3.31.
- Étape 3 du Module 02 convertie en rappel actif Marché / Limite.
- Chaque situation conserve sa première tentative avant d’afficher l’explication.
- Une erreur ne valide pas la situation ; elle révèle la règle puis autorise la correction.
- Explication humaine après tentative : un ordre est une instruction ; marché privilégie l’exécution immédiate ; limite protège un prix choisi mais peut attendre.
- Bulles d’aide `ⓘ` ajoutées comme indices facultatifs sur le sens d’`ordre`, de `marché` et de `limite`.
- Situation A et Situation B sont validées indépendamment ; l’étape 4 ne s’ouvre qu’après les deux bonnes réponses.
- Moteur de viewport pédagogique existant conservé : étape 3 pendant l’exercice, puis étape 4 après validation complète.
- `index.html`, `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé ; identité passée à 28.3.32.

---

## Build 28.3.31 — Module 02 Ask / Bid Active Recall Lock

- Base : Build 28.3.30.
- Étape 2 du Module 02 convertie en rappel actif : choix avant explication.
- Les réponses Ask et Bid sont traitées séparément ; la première tentative de chaque côté est conservée.
- Une réponse erronée révèle ensuite l’explication et permet la correction sans valider prématurément l’étape.
- Les règles « Ask = demande vendeur » et « Bid = proposition acheteur » sont disponibles en bulles d’aide `ⓘ` comme indices facultatifs.
- Le meilleur Ask et le meilleur Bid ne sont expliqués dans le corps de l’exercice qu’après la première tentative correspondante.
- Le Spread de 20 € n’apparaît qu’après les deux validations correctes.
- Après validation Ask + Bid, le moteur de cadrage pédagogique existant cible l’étape 3.
- `index.html`, `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé ; identité passée à 28.3.31.

---

## Build 28.3.30 — Livecheck Direct Market Focus Lock

- Base : Build 28.3.29.
- Lors du Module 01, le clic `Lancer Livecheck` pouvait provoquer un détour visuel : ancien viewport / haut de page, puis Market.
- Le cockpit positionne désormais immédiatement `market-workspace` avant la reconstruction de la table par le Livecheck.
- La couche de continuité du Market capture donc directement la bonne destination au lieu de restaurer brièvement l’ancienne position pédagogique.
- Après succès, la logique existante de preuve, IndexedDB et ciblage de la ligne Bitcoin reste inchangée.
- En cas d’échec, le retour pédagogique existant vers le cockpit reste inchangé.
- `index.html`, `style.css` et `runtime_config.json` restent strictement inchangés.
- Version Control Protected Core inchangé ; seules les constantes d’identité passent à 28.3.30.

---

## Build 28.3.29 — Learning Viewport Settle & Reset Hover Lock

- Base : Build 28.3.28.
- Le cadrage pédagogique devient convergent : après le premier positionnement, il vérifie la dérive réelle et ne corrige que si la cible s'est déplacée de plus de 4 px.
- Les transitions ordinaires utilisent deux contrôles courts ; le retour après `Repartir de zéro` utilise trois contrôles dédiés jusqu'à 1000 ms afin d'absorber les rerenders tardifs de Firefox.
- La destination du reset reste `learningSessionPlan` : `01 · Marché et données · session guidée · 0/5 étapes`.
- Ajout d'une bulle native sur `Repartir de zéro` expliquant ce qui est effacé et ce qui reste conservé.
- `style.css` et `runtime_config.json` inchangés.
- Version Control Protected Core inchangé ; identité passée à 28.3.29.

---

## Build 28.3.28 — Learning Viewport Focus & Reset Lock

- Base : Build 28.3.27 validé sur Transformer Book et Ryzen.
- `Repartir de zéro` conserve le reset vérifié IndexedDB/localStorage mais enregistre maintenant explicitement `learningSessionPlan` comme destination de reprise.
- La restauration automatique de position du navigateur est neutralisée pour ce reset afin d’éviter le retour à l’ancienne hauteur de page.
- `scrollToLearningTarget()` ne capture plus un élément avant rerender : la cible est retrouvée après deux frames, puis cadrée une seule fois.
- Le cadrage pédagogique utilise par défaut un saut immédiat avec marge haute constante, sans déplacement fluide à travers de longues zones.
- `scrollToFoundationStage()` et les autres appels pédagogiques partagent le même mécanisme de positionnement.
- `index.html`, `style.css` et `runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique inchangée ; identité locale passée à 28.3.28.

---

## Build 28.3.27 — Active Recall & Learning Guidance Lock

- Base : Build 28.3.26.
- Module 01 Étape 5 passe en rappel actif : preuves visibles, question, réponse, puis explication.
- La première tentative `Oui/Non` est conservée dans `practice_evidence`; seule la réponse finale correcte valide l’étape.
- L’explication n’est plus visible avant le premier choix.
- La synthèse automatique et les notes personnelles sont séparées dans l’interface sans casser le format historique `notes_free`.
- Les auto-synthèses Modules 01/02/03 restent compatibles avec les archives existantes.
- Bulles d’aide `ⓘ` au survol/focus ajoutées aux notions clés du Module 01.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.27.

---

> Historique humain extrait du manifeste `version.json` lors du Build 28.3.18.
> Ce fichier est documentaire : le runtime ne le lit pas.

## Build 28.3.26 — Current Build Reverify Stability Lock

- Base : Build 28.3.25.
- Mission : corriger la revérification manuelle du Build déjà chargé sur les navigateurs où une relecture distante d’un fichier auxiliaire pouvait provoquer un faux « publication incomplète ».
- Même Build + même token : validation de l’identité active via `app.js` + `version.json`, sans re-hash des ressources non versionnées.
- Même Build + token différent : refus explicite, jamais traité comme une nouvelle version.
- Build supérieur : vérification SHA-256 complète conservée avant installation.
- Aucune modification fonctionnelle des Modules 01/02/03 ni des autres zones produit.

---

## Build 28.3.25 — Module 03 Review Focus & Auto-Synthesis Lock

- Base : Build 28.3.24.
- Mission : aligner le Module 03 sur le standard humain de navigation et d’archivage des Modules 01/02.
- Coûts école 0,60 %, position fictive BTC 50 €, scénarios −3 % / +5 % et brut/net restent les preuves fonctionnelles existantes.
- Chaque transition du Module 03 possède désormais un seul propriétaire de viewport et un seul cadrage après rerender.
- À 5/5, `notes_free` reçoit `[AUTO-SYNTHÈSE MODULE 03]` sans écraser les notes personnelles.
- `risk_archive_prefill` et `risk_learning_journal` sont construits exclusivement depuis les preuves figées de la session.
- Frais/spread/slippage réels restent `non vérifiés`; aucune donnée réelle n’est inventée.
- Modules 01/02, HTML, CSS, runtime_config et Version Control Protected Core restent inchangés.

---

## Build 28.3.24 — Module 01 Review Focus & Auto-Synthesis Lock

- Base : Build 28.3.23, Module 02 archivé et auto-synthèse validée sous Firefox.
- Mission : préparer la relecture complète du Module 01 avec le même standard de navigation et de mémoire.
- Le parcours Module 01 reste identique sur le fond : Livecheck, lecture Prix / 24 h / 7 j, provenance, conclusion observation ≠ prédiction.
- Étapes 3 → 4 → 5 : cadrage unique après rerender ; suppression du feedback qui relançait un second scroll.
- Une mauvaise réponse à la conclusion ne déplace pas la page.
- À 5/5, `notes_free` reçoit `[AUTO-SYNTHÈSE MODULE 01]` sans écraser les notes personnelles.
- `market_archive_prefill` et `market_learning_journal` sont construits exclusivement à partir des preuves figées.
- Aucune recommandation ni prédiction n’est générée.
- Module 02, HTML, CSS, runtime_config et logique du Version Control restent inchangés.

---

## Build 28.3.23 — Module 02 Auto-Synthesis & Archive Prefill Lock

- Base : Build 28.3.22, parcours Module 02 guidé et cadrage validés.
- Mission : transformer automatiquement les preuves du Module 02 en synthèse lisible et données d’archive sans demander de ressaisie inutile.
- À 5/5, `notes_free` reçoit un bloc `[AUTO-SYNTHÈSE MODULE 02]` généré depuis les preuves réelles de la session.
- Les notes personnelles déjà présentes sont conservées ; le bloc automatique est remplaçable/idempotent et n’est pas dupliqué.
- `spot_archive_prefill` conserve Ask 60 010 €, Bid 59 990 €, spread 20 €, choix Marché/Limite, position BTC fictive, capital restant, conclusion et verrous de sécurité.
- `spot_learning_journal` conserve la synthèse pédagogique dérivée.
- Frais réels, spread réel de plateforme et slippage réel restent `not_verified` avec valeurs nulles ; aucune donnée financière non vérifiée n’est fabriquée.
- Migration douce : un brouillon Module 02 déjà 5/5 provenant de 28.3.22 est prérempli automatiquement au premier rendu 28.3.23.
- `index.html`, `style.css` et `runtime_config.json` strictement inchangés.
- Version Control Protected Core : logique intacte ; identité locale passée à 28.3.23.

---

## Build 28.3.22 — Guided Step Focus & Pedagogy Lock

- Base : Build 28.3.21 validé sous Firefox.
- Mission : stabiliser la navigation du Module 02 sans toucher aux autres zones.
- Après chaque action correcte, le DOM est d’abord rerendu puis un unique cadrage place l’étape suivante en haut de la fenêtre.
- Suppression du double scroll parasite provoqué par le feedback pédagogique.
- Étape 1 → 2, fin de Bid/Ask → 3, fin de Marché/Limite → 4, position fictive → 5.
- Bid / Ask reformulés : Ask = prix demandé par les vendeurs ; Bid = prix proposé par les acheteurs.
- Situation B reformulée comme prix maximum d’achat à 59 500 €.
- `index.html`, `style.css` et `runtime_config.json` restent strictement inchangés.
- Version Control : logique inchangée ; seule l’identité de Build dans `app.js` / `version.json` évolue.

---

## Build 28.3.21 — Two-File Version Control Final Lock

- Base : Build 28.3.20 validé sous Firefox.
- Mission : terminer la séparation du versionnage et supprimer définitivement l’identité Build/token de `index.html` et `style.css`.
- Versionnage actif : `web/app.js` + `web/version.json`.
- `index.html` ne contient plus de meta Build/token et charge `style.css` / `app.js` par leurs URLs canoniques sans paramètre de Build.
- `style.css` ne contient plus de marqueur Build/token ni de variables CSS de version.
- Les libellés de version visibles dans l’interface sont injectés au runtime par `app.js`.
- `version.json` conserve les empreintes SHA-256 des ressources publiées : elles servent à l’intégrité de publication, pas à leur donner une identité de version.
- `runtime_config.json` reste strictement inchangé.
- Nouvelle fonctionnalité produit : aucune.
- À partir de cette Build, si HTML/CSS/configuration ne changent pas, une future Build de versionnage n’a plus besoin de les modifier ni de les réuploader.

---

## Build 28.3.20 — Two-File Version Control Transition Lock

- Base : Build 28.3.19 validé sous Firefox.
- Mission : installer le nouveau noyau de versionnage centré sur `app.js` + `version.json`.
- `version.json` abandonne `coherence_contract` et devient le manifeste d’identité + intégrité SHA-256.
- `app.js` vérifie désormais l’identité distante par ses propres constantes Build/token et contrôle les empreintes des fichiers publiés.
- `index.html` et `style.css` conservent leurs marqueurs Build/token **une dernière fois**, uniquement pour que le contrôleur 28.3.19 puisse accepter et installer cette Build.
- Le nouveau contrôleur 28.3.20 n’utilise plus ces marqueurs HTML/CSS.
- Avant rechargement, les ressources publiées sont relues avec `cache: reload` et leur SHA-256 est contrôlé afin de rafraîchir le cache HTTP sans dépendre d’un numéro de Build dans le CSS ou le HTML.
- `runtime_config.json` reste strictement inchangé.
- Nouvelle fonctionnalité produit : aucune.
- Prochaine étape : suppression définitive des marqueurs Build/token de `index.html` et `style.css` dans la Build suivante, une fois cette transition validée sous Firefox.

---

## Build 28.3.19 — Runtime Config Separation Lock

- Base : Build 28.3.18.
- Mission : sortir la configuration runtime de `version.json`.
- Nouvelle fonction produit : aucune.
- Comportement volontairement modifié : aucun.
- `assets` et `registries` sont déplacés sans modification vers `web/runtime_config.json`.
- `version.json` conserve uniquement l’identité de publication et le contrat de cohérence encore requis par le contrôleur actuel.
- `runtime_config.json` ne porte aucun numéro de Build : il ne change que lorsque la configuration change.

## Build 28.3.18 — Version Manifest Separation Lock

- Base : Build 28.3.17.
- Mission : sortir les strates historiques de `version.json`.
- Nouvelle fonction produit : aucune.
- Comportement volontairement modifié : aucun.
- `version.json` reste le manifeste actif.
- `build_history.md` devient l’archive humaine des métadonnées historiques retirées.

## Build 28.3.17 — Human Code Architecture Foundation Lock

- Restructuration humaine de `index.html`, `style.css` et `app.js`.
- Ordre du code aligné sur l’ordre visuel de l’interface.
- Blocs numérotés et recherchables par `Ctrl+F`.
- Refactoring à comportement constant.

---

## Archive héritée de `version.json` 28.3.17

Les sections suivantes sont conservées sans perte de données. Chaque objet JSON ci-dessous reprend exactement la valeur retirée du manifeste 28.3.17.

### Fondations, géométrie et publication

#### `merge_base`

```json
{
  "product_and_metals_workspace": "28.2.44",
  "update_control": "28.2.47",
  "excluded_visual_layers": [
    "28.2.45",
    "28.2.46",
    "28.2.47"
  ]
}
```

#### `geometry_repair`

```json
{
  "base": "28.2.48",
  "scope": "metals_wide_deck_css_only",
  "wide_breakpoint_min_px": 1101,
  "stacked_breakpoint_max_px": 1100,
  "firefox_reported_dead_column_removed": true,
  "update_control_unchanged": true,
  "registries_unchanged": true
}
```

#### `publication_identity_single_source_lock`

```json
{
  "base": "28.2.75",
  "scope": "version_detection_and_update_path_only",
  "style_active_identity_at_file_start": true,
  "legacy_style_markers_neutralized": true,
  "runtime_css_identity_matches_manifest": true,
  "old_28_2_75_parser_can_detect_28_2_76": true,
  "market_logic_unchanged": true,
  "geometry_unchanged": true,
  "state": "validated_on_firefox_ryzen"
}
```

#### `publication_identity_immutability_cache_recovery_lock`

```json
{
  "build": "28.3.14",
  "base": "28.3.13",
  "cause": "same_build_republication_reused_asset_token_after_app_and_index_changed",
  "scope": [
    "unique_build_identity",
    "unique_asset_token",
    "four_asset_identity_alignment",
    "same_build_token_change_detection",
    "cache_recovery"
  ],
  "same_build_republication_forbidden": true,
  "previous_same_build_hotfix_invalidated": true,
  "active_assets": [
    "index.html",
    "app.js",
    "style.css",
    "version.json"
  ],
  "remote_update_requires_newer_build_or_changed_token": true,
  "pedagogy_schema_changed": false,
  "persistence_schema_changed": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "simulation_engine_changed": false,
  "firefox_existing_profile_validation_required": true
}
```

#### `historical_version_control_restoration_lock`

```json
{
  "build": "28.3.16",
  "base": "28.3.14",
  "historical_controller_reference": [
    "28.3.12",
    "28.3.13"
  ],
  "scope": "version_control_only",
  "removed_28_3_14_same_build_token_update_path": true,
  "remote_update_requires_strictly_newer_build": true,
  "same_build_runtime_repair_preserved": true,
  "same_build_republication_forbidden": true,
  "active_assets": [
    "index.html",
    "app.js",
    "style.css",
    "version.json"
  ],
  "pedagogy_changed": false,
  "persistence_changed": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "simulation_changed": false,
  "layout_changed": false,
  "firefox_existing_profile_validation_required": true
}
```

### Métaux

#### `public_metals_structural_layer`

```json
{
  "schema": "agent_crypto_metals_structural_registry_v1",
  "version": "1.0.0",
  "path": "metals_structural_registry.json",
  "assets": 5,
  "reference_year": 2025,
  "primary_source": "USGS Mineral Commodity Summaries 2026 v1.3",
  "quotes_connected": false,
  "historical_prices_imported": false
}
```

#### `metals_market_frame_cleanup`

```json
{
  "base": "28.2.52",
  "scope": "remove_unrequested_market_header_button_only",
  "global_market_shortcut_preserved": true,
  "market_frame_preserved": [
    "TARGET MÉTAUX",
    "METALS FLOW",
    "ESPACE 02 · MARKET MÉTAUX"
  ],
  "removed_element_id": "atlasMetalsReturnToGraph",
  "crypto_workspace_unchanged": true,
  "metals_data_unchanged": true,
  "quotes_connected": false
}
```

#### `metals_data_foundation`

```json
{
  "base": "28.2.57R3",
  "schema": "agent_crypto_metals_snapshot_v1",
  "contract": "metals_quote_adapter_contract.json",
  "snapshot_path": "../data/metals/latest.json",
  "status_path": "../data/metals/status.json",
  "history_index_path": "../data/metals/history/index.json",
  "archive_reader_ready": true,
  "archive_assets": 5,
  "provider_configured": true,
  "bridge_required": false,
  "crypto_data_reuse_forbidden": true,
  "quotes_connected": true,
  "chart_series_connected": true,
  "layout_unchanged": true,
  "crypto_workspace_unchanged": true,
  "public_archive_primary": true,
  "history_sessions_per_asset": 261,
  "state": "ready"
}
```

#### `metals_snapshot_import_gate`

```json
{
  "base": "28.2.54",
  "state": "ready",
  "input_schema": "agent_crypto_metals_import_v1",
  "tool": "../tools/metals_snapshot_ingest.py",
  "template": "../data/metals/import_template.json",
  "provider_configured": true,
  "provider_fetch_performed": false,
  "public_key_exposure": false,
  "full_basket_required_by_default": true,
  "history_writer_ready": true,
  "market_reader_ready": true,
  "chart_requires_two_or_more_real_snapshots": true,
  "layout_unchanged": true,
  "crypto_workspace_unchanged": true,
  "normal_flow": false
}
```

#### `metals_live_bridge`

```json
{
  "base": "28.2.55",
  "bridge_origin": "http://127.0.0.1:8787",
  "bridge_version_required": null,
  "snapshot_route": "/market/metals/snapshot",
  "status_route": "/market/metals/status",
  "history_route": "/market/metals/history",
  "manual_refresh_only": false,
  "provider_requests_per_manual_refresh": 0,
  "github_pages_remains_primary_interface": true,
  "local_interface_copy_is_fallback_only": false,
  "layout_unchanged": true,
  "crypto_workspace_unchanged": true,
  "state": "retired_public_archive_only",
  "public_archive_primary": true,
  "metals_dev_reactivation_forbidden": true
}
```

#### `metals_comparative_history`

```json
{
  "base": "28.2.57R3",
  "mode": "public_futures_daily_one_year",
  "assets": [
    "XAU",
    "XAG",
    "XPT",
    "XPD",
    "HG"
  ],
  "value_delta": true,
  "percent_delta": true,
  "trend_state": [
    "up",
    "down",
    "stable",
    "insufficient",
    "incoherent"
  ],
  "snapshot_strip": true,
  "provider_requests_for_comparison": 0,
  "predictions_generated": false,
  "book_transfer_controls_visible": false,
  "crypto_workspace_unchanged": true,
  "spot_current_series_separated": true
}
```

#### `public_metals_archive`

```json
{
  "base": "28.2.57R3",
  "collector": "../tools/collect_public_metals.py",
  "workflow": ".github/workflows/atlas-public-metals-archive.yml",
  "current_source": "Gold API (indicative)",
  "history_source": "Yahoo Finance futures (daily 1y)",
  "fx_source": "BCE reference rate",
  "assets": [
    "XAU",
    "XAG",
    "XPT",
    "XPD",
    "HG"
  ],
  "history_range": "1y daily",
  "api_key_required": false,
  "manual_ryzen_publication_required": false,
  "bridge_required_for_book": false,
  "crypto_workspace_unchanged": true,
  "legacy_metals_dev_active": false,
  "bridge_role": "optional local cache after public archive validation",
  "state": "ready",
  "schedule": "every_4_hours",
  "failure_policy": "preserve_last_valid_and_mark_degraded",
  "report_generation": "browser_from_public_archive",
  "report_persistence": "indexeddb_v2",
  "same_public_files_ryzen_and_transformer_book": true,
  "first_real_github_run_completed": true,
  "current_quotes_ready": true,
  "history_ready": true,
  "archive_assets": 5
}
```

#### `metals_public_archive`

```json
{
  "current_history_decoupled": true,
  "history_failure_blocks_current_quotes": false,
  "multi_horizon_history_connected": true,
  "twenty_four_hour_intraday_fabrication_forbidden": true
}
```

#### `metals_multi_horizon_history`

```json
{
  "base": "28.2.59",
  "state": "connected",
  "current_quote_source": "Gold API indicative spot reference",
  "history_source": "Yahoo Finance continuous Futures daily public archive",
  "fx_source": "ECB daily reference rate",
  "chart_periods_connected_days": [
    7,
    30,
    90,
    365
  ],
  "analysis_horizons_connected_days": [
    7,
    30,
    90,
    365
  ],
  "twenty_four_hour_policy": "intraday_required_no_daily_two_point_curve",
  "spot_futures_mixing_forbidden": true,
  "anchor_before_period_cutoff_used": true,
  "base100_multi_asset_only": true,
  "raw_price_single_active_asset_only": true,
  "crypto_workspace_unchanged": true,
  "layout_geometry_unchanged": true,
  "bridge_role_unchanged": "legacy_optional_fallback"
}
```

#### `metals_results_visibility`

```json
{
  "base": "28.2.60",
  "state": "ready",
  "default_period_days": 7,
  "saved_24h_state_migrated_once": true,
  "primary_analysis_horizons_days": [
    7,
    30,
    90,
    365
  ],
  "result_headline_visible": true,
  "result_headline_fields": [
    "asset",
    "symbol",
    "period",
    "percent",
    "sessions",
    "date_range",
    "current_quote_separation"
  ],
  "twenty_four_hour_state": "explicit_intraday_unavailable",
  "report_history_label": "sessions_futures",
  "indexeddb_report_refreshed_from_newer_public_snapshot": true,
  "crypto_workspace_unchanged": true,
  "collector_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_terminology_responsive_results`

```json
{
  "base": "28.2.61",
  "state": "ready",
  "analysis_horizons_responsive": true,
  "one_year_result_clipping_fixed": true,
  "comparison_label": "two_latest_futures_sessions",
  "history_counter_label": "futures_sessions",
  "provider_change_null_policy": "display_not_provided_never_zero",
  "provider_change_spot_futures_separation_preserved": true,
  "crypto_workspace_unchanged": true,
  "collector_unchanged": true,
  "github_actions_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_parallel_math_core_graph_recovery`

```json
{
  "base": "28.2.62",
  "state": "ready",
  "result_headline_mode": "compact_explicit_grid_row",
  "graph_height_recovered": true,
  "math_core_metals_version": "1.0.0",
  "math_core_follows_active_metal": true,
  "math_core_follows_active_period": true,
  "math_core_metrics": [
    "real_sessions",
    "period_variation_pct",
    "session_volatility_pct",
    "max_drawdown_pct",
    "high_low_amplitude_pct",
    "series_completeness_pct"
  ],
  "current_quote_source": "Gold API indicative",
  "historical_source": "Yahoo Finance Futures daily",
  "spot_futures_separated": true,
  "math_core_crypto_restored_on_crypto_domain": true,
  "market_metals_reused_not_duplicated": true,
  "display_order": [
    "metals_graph",
    "metals_math_core",
    "existing_metals_market",
    "metals_analysis"
  ],
  "prediction_generated": false,
  "crypto_workspace_unchanged": true,
  "collector_unchanged": true,
  "github_actions_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_result_footer_placement`

```json
{
  "base": "28.2.63",
  "state": "ready",
  "result_position": "below_chart_stage",
  "reading_order": [
    "graph_header",
    "futures_chart",
    "compact_result_footer",
    "graph_selection_footer"
  ],
  "result_ids_unchanged": true,
  "result_calculation_unchanged": true,
  "graph_calculation_unchanged": true,
  "math_core_metals_unchanged": true,
  "math_core_crypto_unchanged": true,
  "market_metals_unchanged": true,
  "metals_analysis_unchanged": true,
  "collector_unchanged": true,
  "github_actions_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_unified_reading`

```json
{
  "base": "28.2.64",
  "state": "ready",
  "surface": "metals_detail_panel",
  "active_metal_synchronized": true,
  "active_period_synchronized": true,
  "horizons_summarized": [
    7,
    30,
    90,
    365
  ],
  "language": "plain_french_descriptive",
  "prediction_generated": false,
  "recommendation_generated": false,
  "spot_and_futures_separated": true,
  "graph_unchanged": true,
  "math_core_metals_unchanged": true,
  "market_metals_unchanged": true,
  "crypto_workspace_unchanged": true,
  "collector_unchanged": true,
  "github_actions_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_real_24h_spot_archive`

```json
{
  "base": "28.2.65",
  "state": "secondary_collection_journal",
  "collector": "../tools/collect_public_metals.py",
  "workflow": ".github/workflows/atlas-public-metals-archive.yml",
  "file": "../data/metals/history/spot_48h.json",
  "source": "Gold API",
  "schedule": "every_4_hours",
  "retention_hours": 48,
  "minimum_complete_hours": 20,
  "complete_five_asset_baskets_only": true,
  "first_real_point_after_first_workflow_run": true,
  "full_window_requires_elapsed_time": true,
  "futures_horizons_preserved": [
    7,
    30,
    90,
    365
  ],
  "spot_and_futures_separated": true,
  "fabricated_points_forbidden": true,
  "crypto_workspace_unchanged": true,
  "bridge_unchanged": true,
  "primary_chart_source": false
}
```

#### `metals_immediate_24h_futures`

```json
{
  "base": "28.2.66",
  "state": "ready_after_first_github_actions_run",
  "file": "../data/metals/history/intraday_24h.json",
  "source": "Yahoo Finance continuous Futures intraday",
  "interval": "5m",
  "requested_range": "2d",
  "display_window_hours": 24,
  "assets": [
    "XAU",
    "XAG",
    "XPT",
    "XPD",
    "HG"
  ],
  "full_series_fetched_each_run": true,
  "rolling_accumulation_wait_removed": true,
  "gold_api_role": "current indicative quote only",
  "spot_and_intraday_futures_separated": true,
  "daily_futures_horizons_preserved": [
    7,
    30,
    90,
    365
  ],
  "fabricated_points_forbidden": true,
  "crypto_workspace_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_all_series_comparison`

```json
{
  "base": "28.2.67",
  "state": "ready",
  "control": "TOUS",
  "location": "compact_metals_chart_legend_after_HG",
  "assets": [
    "XAU",
    "XAG",
    "XPT",
    "XPD",
    "HG"
  ],
  "periods_days": [
    1,
    7,
    30,
    90,
    365
  ],
  "automatic_view": "base100",
  "single_asset_return_view": "real_price",
  "legend_variations_visible": true,
  "leader_and_laggard_visible": true,
  "spread_points_visible": true,
  "artificial_average_generated": false,
  "gold_api_current_quotes_mixed_with_futures": false,
  "math_core_changed": false,
  "crypto_workspace_unchanged": true,
  "collectors_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_cursor_historical_inspector`

```json
{
  "base": "28.2.69",
  "state": "ready",
  "title": "PRIX HISTORIQUE",
  "pointer_following_panel": true,
  "nearest_real_point_only": true,
  "assets": [
    "XAU",
    "XAG",
    "XPT",
    "XPD",
    "HG"
  ],
  "comparison_mode_rows": 5,
  "single_mode_rows": 1,
  "historical_price_source_24h": "Yahoo Finance continuous Futures intraday 5m",
  "historical_price_source_7d_plus": "Yahoo Finance continuous Futures daily",
  "change_basis": "first real point of active window to inspected real point",
  "vertical_guide": true,
  "point_markers": true,
  "fixed_current_quote_panel_removed": true,
  "fabricated_points": false,
  "crypto_cursor_engine_unchanged": true,
  "collectors_unchanged": true,
  "bridge_unchanged": true
}
```

#### `metals_inspector_full_5x5_layout`

```json
{
  "base": "28.2.70",
  "state": "ready_for_user_test",
  "visible_rows_comparison_mode": 5,
  "visible_rows_single_mode": 1,
  "row_overflow": false,
  "scroll_required": false,
  "crypto_table_density_reference_used": true,
  "header_compacted": true,
  "footer_compacted": true,
  "data_engine_changed": false,
  "nearest_point_engine_changed": false,
  "crypto_cursor_engine_unchanged": true,
  "collectors_unchanged": true,
  "bridge_unchanged": true
}
```

### Bridge, données marché et décision

#### `bridge_canonical_stack_recovery`

```json
{
  "base": "28.2.71",
  "state": "ready_for_user_test",
  "control_center": "V2.1.0R1",
  "bridge": "V1.7.6",
  "model": "llama3.2:latest",
  "interface": "Build 28.2.74",
  "bridge_scope": "crypto_history_scanner_reports_conclusion_chat",
  "metals_scope": "public_github_actions_archive_only",
  "metals_dev_dependency": false,
  "local_metals_bridge_fallback": false,
  "github_writes": false,
  "exchange_actions": false,
  "wallet_actions": false,
  "crypto_graph_changed": false,
  "metals_graph_changed": false,
  "collectors_changed": false
}
```

#### `decision_board_truth_contract`

```json
{
  "base": "28.2.72",
  "state": "validated_on_firefox_ryzen",
  "scope": "crypto_decision_board_visible_truth_contract_only",
  "archive_index_policy": "historical_watch_index_remains_visible_for_consultation",
  "archive_direct_analysis": "suspended",
  "archive_active_conclusion": "suspended",
  "archive_simulation": "suspended",
  "displayed_index_name": "Indice de veille Atlas",
  "source_counter_name": "flux CoinGecko",
  "source_counter_independent_providers_claimed": false,
  "category_reading_name": "Lecture catégories d’actifs",
  "action_basis": [
    "asset_category",
    "direct_or_archived_state"
  ],
  "action_depends_on_watch_index": false,
  "scoring_formula_changed": false,
  "anomaly_thresholds_changed": false,
  "movement_thresholds_changed": false,
  "memory_engine_changed": false,
  "news_sentinel_changed": false,
  "bridge_changed": false,
  "crypto_graph_changed": false,
  "metals_workspace_changed": false,
  "collectors_changed": false,
  "interface_geometry_changed": false
}
```

#### `coingecko_usd_eur_market_fallback`

```json
{
  "base": "28.2.73",
  "state": "retired_replaced_by_public_crypto_market_archive",
  "preferred_path": "CoinGecko Top 250 EUR direct",
  "fallback_path": "CoinGecko Top 250 USD direct + ECB USD/EUR public reference",
  "archive_policy": "only_after_eur_and_usd_eur_paths_fail",
  "fx_registry": "../data/metals/fx/usd_eur.json",
  "fx_source": "Banque centrale européenne",
  "fx_max_age_days": 10,
  "monetary_fields_converted_to_eur": [
    "current_price",
    "market_cap",
    "total_volume",
    "high_24h",
    "low_24h",
    "global_top250_market_cap",
    "global_top250_volume"
  ],
  "percentage_variations_basis": "CoinGecko USD",
  "fallback_source_lock_mode": "direct",
  "decision_board_enabled_on_valid_fallback": true,
  "fallback_provenance_visible": true,
  "archive_state_label_corrected": true,
  "scoring_formula_changed": false,
  "movement_thresholds_changed": false,
  "anomaly_thresholds_changed": false,
  "crypto_chart_changed": false,
  "metals_workspace_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "github_actions_changed": false,
  "interface_geometry_changed": false
}
```

#### `public_crypto_market_archive`

```json
{
  "base": "28.2.74",
  "state": "validated_on_firefox_ryzen",
  "collector": "../tools/collect_public_crypto.py",
  "workflow": ".github/workflows/atlas-public-crypto-market.yml",
  "snapshot_path": "../data/crypto/latest.json",
  "status_path": "../data/crypto/status.json",
  "market_source": "CoinGecko Top 250 USD",
  "fx_source": "ECB USD/EUR public reference",
  "publication_mode": "GitHub Actions static JSON",
  "schedule": "every_2_hours",
  "browser_direct_top250_required": false,
  "original_usd_preserved": true,
  "eur_values_converted_with_single_ecb_rate": true,
  "percentage_variations_base": "CoinGecko USD",
  "last_valid_preserved_on_failure": true,
  "decision_board_current_max_age_hours": 3,
  "display_max_age_hours": 24,
  "local_browser_cache_last_resort": true,
  "crypto_graphs_unchanged": true,
  "metals_workspace_unchanged": true,
  "bridge_unchanged": true,
  "github_write_scope": "public/agent_crypto_erith_ia/data/crypto only"
}
```

#### `canonical_snapshot_memory_deduplication_lock`

```json
{
  "base": "28.2.76",
  "state": "ready_for_user_test",
  "scope": "local_memory_and_decision_board_comparison_truth_only",
  "canonical_identity_source": "state.sourceLock.snapshotId",
  "canonical_timestamp_source": "state.sourceLock.timestamp",
  "one_record_per_collector_and_market_snapshot": true,
  "repeat_livechecks_increment_observation_count": true,
  "duplicate_market_observations_neutralized": true,
  "legacy_source_time_used_as_safe_fallback_identity": true,
  "legacy_records_deleted": false,
  "decision_board_requires_distinct_market_snapshots": true,
  "public_crypto_collector_changed": false,
  "github_actions_changed": false,
  "decision_board_formula_changed": false,
  "movement_thresholds_changed": false,
  "anomaly_thresholds_changed": false,
  "crypto_graphs_changed": false,
  "metals_workspace_changed": false,
  "bridge_changed": false,
  "interface_geometry_changed": false,
  "validation_state_truth_updates": [
    "decision_board_truth_contract_validated",
    "public_crypto_market_archive_validated",
    "publication_identity_single_source_lock_validated",
    "browser_direct_top250_fallback_retired"
  ]
}
```

### Pédagogie, simulation et parcours

#### `pedagogy_security_layer`

```json
{
  "base": "28.2.77",
  "state": "ready",
  "scope": "additive_simulation_pedagogy_and_security_gate",
  "dynamic_info_drawer": true,
  "simulation_cost_assumptions": [
    "buy_fee_pct",
    "sell_fee_pct",
    "entry_impact_pct",
    "exit_impact_pct"
  ],
  "cost_source_policy": "manual_or_explicit_school_example_never_claimed_as_kraken_rate",
  "break_even_estimate": true,
  "gross_and_estimated_net_pnl_separated": true,
  "instant_scenarios_pct": [
    -5,
    -3,
    -1,
    0,
    1,
    3,
    5
  ],
  "negative_zero_removed": true,
  "position_detail_fields": [
    "quantity",
    "average_entry",
    "current_price",
    "gross_value",
    "gross_pnl",
    "estimated_net_pnl"
  ],
  "security_gate_levels": [
    "green",
    "orange",
    "red"
  ],
  "security_gate_real_execution_authority": false,
  "school_mode_preserved": true,
  "all_existing_sections_preserved": true,
  "chart_truth_badge_short_label": "À JOUR",
  "chart_truth_badge_width_locked": true,
  "github_write_performed": false,
  "real_order_performed": false,
  "real_wallet_connected": false,
  "real_exchange_key_used": false,
  "withdrawal_safety_lab": true,
  "withdrawal_lab_real_address_requested": false,
  "withdrawal_lab_real_transaction_possible": false,
  "scam_sentinel": true,
  "scam_signal_count": 8,
  "verification_scope": [
    "static_identity_and_json",
    "node_simulation_logic",
    "school_rule_regression",
    "chromium_inline_browser_smoke",
    "responsive_geometry_smoke"
  ],
  "firefox_publication_validation_required_after_upload": true,
  "public_github_pages_validation_performed": false
}
```

#### `inline_expert_learning_transaction_proof_lock`

```json
{
  "base": "28.2.78",
  "state": "ready_for_user_test",
  "scope": "additive_non_modal_pedagogy_expert_roadmap_and_local_transaction_proofs",
  "pedagogy_surface": "non_modal_right_dock_desktop_bottom_dock_mobile",
  "page_backdrop_blur_removed": true,
  "page_interaction_blocked_by_help": false,
  "pedagogy_minimize_and_close": true,
  "expert_roadmap_horizon_months": 24,
  "expert_roadmap_modules": 11,
  "expert_roadmap_local_notes": true,
  "expert_roadmap_export_markdown": true,
  "transaction_proof_schema": "agent_crypto_transaction_proof_v1",
  "transaction_proof_types": [
    "SIM_BUY",
    "SIM_SELL",
    "REFUS"
  ],
  "transaction_proof_exports": [
    "markdown",
    "json"
  ],
  "legacy_simulation_logs_migrated_non_destructively": true,
  "existing_pedagogy_security_layer_preserved": true,
  "all_existing_sections_preserved": true,
  "github_write_performed": false,
  "real_order_performed": false,
  "real_wallet_connected": false,
  "real_exchange_key_used": false,
  "firefox_publication_validation_required_after_upload": true
}
```

#### `dual_capital_simulation_profile_lock`

```json
{
  "base": "28.2.79",
  "state": "ready_for_public_firefox_validation",
  "scope": "simulation_profiles_only_additive",
  "default_profile": "Solo Progression 1 000 €",
  "preserved_profile": "Solo Débutant 100 €",
  "profile_1000": {
    "start_cash_eur": 1000,
    "default_ticket_eur": 50,
    "max_per_operation_eur": 100,
    "max_exposure_eur": 300,
    "min_reserve_eur": 700,
    "allowed_assets": [
      "BTC",
      "ETH",
      "SOL"
    ]
  },
  "profile_100": {
    "start_cash_eur": 100,
    "default_ticket_eur": 5,
    "max_per_operation_eur": 10,
    "max_exposure_eur": 30,
    "min_reserve_eur": 70,
    "allowed_assets": [
      "BTC",
      "ETH",
      "SOL"
    ]
  },
  "profile_state_isolated": true,
  "switching_profiles_deletes_other_state": false,
  "legacy_100_eur_state_migrated_non_destructively": true,
  "school_tests_scale_to_active_profile": true,
  "existing_sections_removed": false,
  "github_write_performed": false,
  "real_order_performed": false,
  "real_wallet_connected": false,
  "real_exchange_key_used": false,
  "firefox_publication_validation_required_after_upload": true
}
```

#### `learning_journey_cockpit_guided_practice_lock`

```json
{
  "base": "28.2.80",
  "state": "ready_for_public_firefox_validation",
  "title": "LEARNING JOURNEY COCKPIT & GUIDED PRACTICE LOCK",
  "additive_only": true,
  "real_money_used": false,
  "real_exchange_action": false,
  "features": [
    "daily_learning_cockpit",
    "recommended_next_module",
    "five_step_guided_session",
    "local_session_note",
    "session_markdown_export",
    "simulation_and_proof_shortcuts",
    "help_modes_off_short_detailed",
    "roadmap_and_simulation_state_summary"
  ],
  "preserved": [
    "all_28_2_80_sections",
    "dual_simulation_profiles",
    "expert_24_month_roadmap",
    "transaction_proof_ledger",
    "security_gate",
    "withdrawal_lab",
    "scam_sentinel",
    "crypto_workspace",
    "metals_workspace",
    "decision_board",
    "bridge_v1_7_6",
    "control_center_v2_1_0_r1"
  ]
}
```

#### `checkbox_layout_guided_session_ui_fix`

```json
{
  "base": "28.2.81",
  "state": "ready_for_public_firefox_validation",
  "title": "CHECKBOX LAYOUT & GUIDED SESSION UI FIX",
  "scope": "checkbox_geometry_and_guided_session_layout_only",
  "reported_environment": "Firefox on Ryzen",
  "visible_issue": "native checkboxes occupied the generic 100 percent input width and separated controls from their labels",
  "root_cause": "historical generic input textarea width rule also matched input type checkbox",
  "checkbox_square_size_px_desktop": 16,
  "checkbox_square_size_px_mobile": 17,
  "guided_session_rows_compact": true,
  "checkbox_and_label_left_aligned": true,
  "fixed_groups": [
    "guided_learning_session_steps",
    "simulation_cost_confirmation",
    "fictitious_withdrawal_checks",
    "scam_sentinel_checks"
  ],
  "html_structure_changed": false,
  "javascript_behavior_changed": false,
  "simulation_calculations_changed": false,
  "learning_progress_changed": false,
  "security_rules_changed": false,
  "existing_sections_removed": false,
  "github_write_performed": false,
  "real_order_performed": false,
  "real_wallet_connected": false,
  "firefox_publication_validation_required_after_upload": true
}
```

#### `guided_lesson_notebook_cockpit_restart_lock`

```json
{
  "base": "28.2.82",
  "state": "ready_for_public_firefox_validation",
  "title": "GUIDED LESSON NOTEBOOK & COCKPIT RESTART LOCK",
  "reported_issue": "session comments were deliberately truncated and core lesson content depended on the external conversation",
  "root_causes": [
    "html_maxlength_800",
    "javascript_slice_800",
    "single_note_field_mixed_reference_notes_and_personal_conclusion",
    "no_integrated_lesson_content",
    "completed_sessions_not_archived_as_full_notes"
  ],
  "cockpit_restart": true,
  "previous_cockpit_storage_preserved": true,
  "previous_roadmap_storage_preserved": true,
  "new_cockpit_storage_key": "agent_crypto_learning_journey_cockpit_28_2_83",
  "new_roadmap_storage_key": "agent_crypto_expert_roadmap_28_2_83",
  "integrated_lessons": 11,
  "notes_deliberately_truncated": false,
  "free_notes_and_takeaway_separated": true,
  "autosave": true,
  "character_counters": true,
  "session_history_archive": true,
  "complete_notebook_markdown_export": true,
  "technical_target_names_replaced_by_french_labels": true,
  "five_steps_required_for_completion": true,
  "existing_simulation_profiles_preserved": true,
  "simulation_calculations_changed": false,
  "security_rules_changed": false,
  "github_write_performed": false,
  "real_order_performed": false,
  "real_wallet_connected": false,
  "firefox_publication_validation_required_after_upload": true
}
```

#### `legacy_learning_recovery_notebook_migration_lock`

```json
{
  "base": "28.2.83",
  "state": "ready_for_public_firefox_validation",
  "title": "LEGACY LEARNING RECOVERY & NOTEBOOK MIGRATION LOCK",
  "source_cockpit_key": "agent_crypto_learning_journey_cockpit_28_2_81",
  "source_roadmap_key": "agent_crypto_expert_roadmap_28_2_79",
  "target_cockpit_key": "agent_crypto_learning_journey_cockpit_28_2_83",
  "target_history_key": "agent_crypto_learning_journey_history_28_2_83",
  "target_roadmap_key": "agent_crypto_expert_roadmap_28_2_83",
  "preview_before_import": true,
  "manual_import": true,
  "ignore_without_delete": true,
  "backup_before_merge": true,
  "old_keys_preserved": true,
  "duplicate_import_blocked_by_signature": true,
  "legacy_single_note_imported_to_free_notes": true,
  "legacy_takeaway_invented": false,
  "legacy_progress_preserved": true,
  "truth_policy": "text already truncated by the old 800-character format cannot be reconstructed; all characters still present are imported exactly",
  "expert_roadmap_note_deliberate_limit_removed": true,
  "simulation_profiles_preserved": true,
  "simulation_calculations_changed": false,
  "security_rules_changed": false,
  "github_write_performed": false,
  "real_order_performed": false,
  "real_wallet_connected": false,
  "firefox_publication_validation_required_after_upload": true
}
```

#### `legacy_recovery_action_progress_restore_fix`

```json
{
  "base": "28.2.84",
  "state": "ready_for_public_validation",
  "automatic_startup_recovery": true,
  "manual_import_required": false,
  "post_write_readback_required": true,
  "legacy_source_keys_preserved": true,
  "legacy_marker_not_trusted_without_target_audit": true,
  "recovery_targets": [
    "roadmap",
    "session_history",
    "active_learning_draft",
    "full_remaining_note_text"
  ],
  "explicit_failure_state": true,
  "quota_error_visible": true,
  "anti_duplicate": true,
  "expected_user_case": {
    "completed_sessions": 1,
    "progressed_modules": 1,
    "active_module": "spot",
    "remaining_note_characters": 550,
    "legacy_checked_steps": 3
  },
  "simulation_calculations_unchanged": true,
  "collectors_unchanged": true,
  "workflows_unchanged": true,
  "bridge_unchanged": true
}
```

#### `learning_notebook_indexeddb`

```json
{
  "base": "28.2.85",
  "state": "ready",
  "backend": "IndexedDB",
  "database": "agent_crypto_learning_notebook",
  "store": "notebook",
  "record": "learning_notebook_primary",
  "localstorage_source_read_only": true,
  "localstorage_quota_dependency_removed_for_learning_notebook": true,
  "automatic_legacy_recovery": true,
  "post_write_readback_verification": true,
  "legacy_keys_preserved": true,
  "expected_recovery": {
    "completed_sessions": 1,
    "progressed_modules": 1,
    "active_module": "spot",
    "compatible_steps": 3,
    "note_characters": 550
  },
  "no_operator_click_required": true,
  "retired_localstorage_targets_backed_up_in_indexeddb": true,
  "retired_localstorage_targets_removed_after_verified_write": true,
  "legacy_source_keys_preserved_paths": [
    "agent_crypto_learning_journey_cockpit_28_2_81",
    "agent_crypto_expert_roadmap_28_2_79"
  ],
  "learning_target_keys_retired_after_migration": [
    "agent_crypto_learning_journey_cockpit_28_2_83",
    "agent_crypto_learning_journey_history_28_2_83",
    "agent_crypto_expert_roadmap_28_2_83",
    "agent_crypto_learning_legacy_migration_28_2_84",
    "agent_crypto_learning_legacy_backup_28_2_84",
    "agent_crypto_learning_legacy_recovery_audit_28_2_85"
  ],
  "scope_limit": "learning notebook and roadmap only; simulation profile storage remains unchanged"
}
```

#### `guided_learning_flow_readme_canonical_reset_lock`

```json
{
  "base": "28.2.86",
  "state": "ready_for_public_firefox_validation",
  "title": "GUIDED LEARNING FLOW & CANONICAL README RESET LOCK",
  "mission": "one_primary_action_from_lesson_to_next_module_without_guessing",
  "reopened_archived_session_repair": true,
  "archive_idempotent_by_session_id": true,
  "completed_at_cleared_only_by_explicit_new_session": true,
  "completion_card_visible": true,
  "next_module_button_visible": true,
  "automatic_proof_checkboxes_read_only": true,
  "exercise_return_guide": true,
  "risk_module_evidence": [
    "school_cost_example",
    "scenario_minus_3_percent",
    "scenario_plus_5_percent"
  ],
  "current_expected_transition": "02_spot_archived_to_03_fees_and_risk",
  "learning_storage_backend": "IndexedDB",
  "learning_storage_keys_changed": false,
  "simulation_storage_changed": false,
  "market_collectors_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "decision_board_changed": false,
  "real_order_performed": false,
  "wallet_connected": false,
  "github_write_performed": false,
  "canonical_readme_replaced_in_delivery": true
}
```

#### `recovery_context_practice_status_reconciliation_lock`

```json
{
  "base": "28.2.87",
  "state": "ready_for_public_firefox_validation",
  "title": "RECOVERY CONTEXT & PRACTICE STATUS RECONCILIATION LOCK",
  "legacy_recovery_panel_historical_context_explicit": true,
  "legacy_draft_label": "ancien_brouillon_recupere",
  "current_cockpit_module_displayed_separately": true,
  "archived_guided_practice_reconciles_roadmap": true,
  "reconciliation_evidence": [
    "completed_at",
    "five_steps_complete",
    "practice_true",
    "verify_true",
    "session_id"
  ],
  "existing_archives_duplicated": false,
  "indexeddb_keys_changed": false,
  "simulation_storage_changed": false,
  "market_collectors_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "decision_board_changed": false,
  "real_order_performed": false,
  "wallet_connected": false,
  "github_write_performed": false
}
```

#### `cockpit_interaction_restoration_readability_lock`

```json
{
  "base": "28.2.88",
  "state": "ready_for_human_validation",
  "scope": "learning_cockpit_only",
  "checkboxes_clickable": true,
  "checkbox_change_listener_restored": true,
  "lesson_button_preserved": true,
  "primary_action_preserved": true,
  "readability_source": "28.2.89 canonical cockpit CSS only",
  "indexeddb_schema_unchanged": true,
  "storage_keys_unchanged": true,
  "crypto_workspace_unchanged": true,
  "metals_workspace_unchanged": true,
  "bridge_unchanged": true,
  "decision_board_unchanged": true
}
```

#### `foundations_learning_path_01_03_lock`

```json
{
  "status": "implemented",
  "scope": [
    "module_01_market_data",
    "module_02_spot_orderbook",
    "module_03_fees_risk"
  ],
  "storage_schema_changed": false,
  "archived_sessions_changed": false,
  "market_metals_bridge_changed": false,
  "principle": "definition -> exact panel -> exact control -> expected result -> beginner interpretation"
}
```

#### `full_learning_journey_reset_module_01_lock`

```json
{
  "status": "implemented",
  "base": "28.2.91",
  "button": "Recommencer tout depuis le Module 01",
  "double_confirmation": true,
  "typed_confirmation": "RECOMMENCER MODULE 01",
  "automatic_backup": {
    "download": "JSON before reset",
    "indexeddb": "last_reset_backup"
  },
  "cleared": [
    "current learning draft",
    "archived learning sessions",
    "learning notes",
    "learning conclusions",
    "learning roadmap states"
  ],
  "preserved": [
    "Market",
    "Metals",
    "Bridge",
    "simulation portfolio",
    "transaction proofs",
    "collectors",
    "general settings"
  ],
  "restart_state": {
    "module": "01 · Marché et données",
    "steps": "0/5",
    "progress": "0 %"
  },
  "legacy_reimport_blocked_after_reset": true,
  "storage_schema_changed": false,
  "indexeddb_name_version_store_record_changed": false
}
```

#### `current_module_step_one_restart_lock`

```json
{
  "base": "28.2.92",
  "includes_foundation_evidence_validation_from": "28.2.93-unpublished-candidate",
  "state": "ready_for_public_firefox_validation",
  "removed_behavior": "restart_steps_2_to_4_only",
  "button_label": "Recommencer ce module depuis l’étape 1",
  "restart_scope_cleared": [
    "lesson_read_state",
    "five_current_draft_steps",
    "current_draft_notes",
    "current_draft_takeaway",
    "current_module_practice_evidence"
  ],
  "preserved": [
    "archived_learning_sessions",
    "other_modules",
    "Market",
    "Metals",
    "Bridge",
    "simulation_portfolio",
    "transaction_proofs",
    "collectors",
    "general_settings"
  ],
  "confirmation_required_when_content_exists": true,
  "foundation_upgrade_button_uses_same_restart_function": true,
  "return_target": "integrated_lesson_step_1",
  "full_journey_reset_module_01_preserved": true,
  "storage_schema_changed": false,
  "storage_keys_changed": false
}
```

#### `cockpit_recovery_actionability_separate_simulation_reset_lock`

```json
{
  "base": "28.2.94",
  "state": "ready_for_manual_publication",
  "scope": "learning_cockpit_only",
  "firefox_open_options_geometry_repaired": true,
  "session_options_full_width": true,
  "active_step_has_direct_action_button": true,
  "future_step_buttons_dependency_locked": true,
  "foundation_evidence_only_validation_preserved": true,
  "foundation_target_return_guide_visible": true,
  "separate_simulation_reset_visible_in_cockpit": true,
  "simulation_reset_preserves_learning": true,
  "module_restart_from_step_one_preserved": true,
  "full_learning_reset_module_one_preserved": true,
  "market_unchanged": true,
  "metals_unchanged": true,
  "bridge_unchanged": true,
  "collectors_unchanged": true
}
```

#### `direct_current_action_neutral_labels_lock`

```json
{
  "base": "28.2.95",
  "state": "ready_for_manual_publication",
  "scope": "learning_cockpit_primary_action_only",
  "neutral_heading": "Prochaine étape",
  "removed_promotional_phrases": [
    "Continuer sans chercher où cliquer",
    "Apprendre sans deviner quoi taper"
  ],
  "risk_step_2_direct": "load_school_cost_example",
  "risk_step_3_direct": "create_virtual_btc_50_position",
  "risk_step_4_targeted": "open_and_highlight_minus3_plus5_scenarios",
  "spot_step_4_direct": "create_virtual_btc_50_position",
  "market_steps_direct": [
    "launch_livecheck",
    "read_bitcoin",
    "validate_prudent_conclusion"
  ],
  "simulation_real_execution": false,
  "market_metals_bridge_collectors_unchanged": true
}
```

#### `full_restart_learning_active_simulation_lock`

```json
{
  "base": "28.2.96",
  "build": "28.2.97",
  "scope": "reset_contract_only",
  "button_label": "Repartir entièrement depuis le Module 01",
  "typed_confirmation": "REPARTIR MODULE 01",
  "backup_includes": [
    "learning_notebook",
    "active_simulation",
    "active_simulation_costs",
    "temporary_scenario"
  ],
  "clears": [
    "learning_draft",
    "learning_history",
    "learning_notes",
    "learning_conclusions",
    "learning_roadmap",
    "active_simulation_positions",
    "active_simulation_realized_pnl",
    "active_simulation_log",
    "active_simulation_costs",
    "temporary_scenario"
  ],
  "preserves": [
    "market",
    "metals",
    "bridge",
    "other_simulation_profile",
    "collectors",
    "general_settings"
  ],
  "learning_backend": "IndexedDB",
  "simulation_backend": "localStorage",
  "dual_verification": true,
  "rollback_on_failure": true
}
```

#### `internal_agent_crypto_clean_reset_lock`

```json
{
  "base": "28.2.97",
  "build": "28.2.98",
  "scope": "Agent-Crypto local learning and simulations only",
  "visible_reset_controls": 1,
  "button_label": "Repartir de zéro",
  "confirmation_count": 1,
  "typed_confirmation": false,
  "automatic_json_download": false,
  "clears": [
    "learning_cockpit",
    "learning_history",
    "learning_notes",
    "learning_conclusions",
    "learning_roadmap",
    "learning_recovery_state",
    "all_fictional_simulation_profiles",
    "simulation_positions",
    "simulation_logs",
    "simulation_costs",
    "temporary_scenario"
  ],
  "preserves": [
    "market",
    "metals",
    "bridge",
    "collectors",
    "general_settings",
    "GitHub",
    "YouTube",
    "browser_passwords",
    "browser_cookies",
    "other_BlueAzur_interfaces"
  ],
  "learning_backend": "IndexedDB",
  "simulation_backend": "localStorage",
  "indexeddb_transaction_handlers_installed_before_requests": true,
  "readback_verification": true,
  "rollback_with_explicit_error_code": true,
  "success_state": "Module 01 · 0/5 · no learning archive · default fictional capital · no position",
  "manual_browser_storage_cleanup_required": false,
  "ctrl_f5_required": false
}
```

#### `livecheck_step_2_direct_validation_lock`

```json
{
  "base": "28.2.98",
  "build": "28.2.99",
  "scope": "Module 01 step 2 only",
  "manual_livecheck_handlers": 1,
  "polling_watcher_removed": true,
  "validation_trigger": "successful manual runLivecheck completion",
  "required_proofs": [
    "live_ok",
    "market_rows",
    "bitcoin_row",
    "source",
    "timestamp",
    "visible_source",
    "visible_time"
  ],
  "learning_backend": "IndexedDB",
  "write_readback_required": true,
  "success_state": "Module 01 · 2/5 · step 3 enabled",
  "success_scroll_target": "learningFoundationPanel",
  "failure_state": "Module 01 · 1/5 with explicit message",
  "reset_28_2_98_unchanged": true,
  "market_metals_bridge_collectors_unchanged": true
}
```

#### `livecheck_step_3_market_target_lock`

```json
{
  "base": "28.2.99",
  "build": "28.3.00",
  "scope": "Module 01 post-Livecheck navigation only",
  "step_2_validation_unchanged": true,
  "success_scroll_target": "MARKET SNAPSHOT bitcoin row",
  "learning_foundation_panel_bounce_removed": true,
  "success_feedback_anchor": "bitcoin row or market workspace fallback",
  "existing_28_2_99_learning_state_compatible": true,
  "reset_required": false,
  "reset_28_2_98_unchanged": true,
  "market_metals_bridge_collectors_simulation_unchanged": true
}
```

#### `conclusion_step_5_instant_validation_lock`

```json
{
  "base": "28.3.00",
  "build": "28.3.01",
  "scope": "Module 01 step 5 completion and autonomous guidance only",
  "step_4_success_target": "Ce que je retiens — conclusion personnelle",
  "autonomous_prompt_visible": true,
  "external_ai_required": false,
  "validation_trigger": "textarea input after 220 ms debounce",
  "minimum_useful_characters": 20,
  "prerequisites": [
    "read",
    "open",
    "practice",
    "verify"
  ],
  "success_state": "Module 01 · 5/5 · Terminer et archiver enabled",
  "full_cockpit_rerender_on_validation": true,
  "reset_required": false,
  "market_metals_bridge_collectors_simulation_unchanged": true
}
```

#### `single_action_lesson_autonomous_guided_flow_lock`

```json
{
  "base": "28.3.01",
  "build": "28.3.02",
  "scope": "Module 01 guided flow clarity and single-action lesson validation",
  "step_1_primary_action": "J’ai lu la leçon — passer à Livecheck",
  "second_lesson_confirmation_removed": true,
  "step_1_transition": "single click validates read and exposes Livecheck",
  "step_4_primary_action": "Vérifier automatiquement source + heure",
  "step_4_manual_search_required": false,
  "active_28_3_01_session_compatible": true,
  "reset_required": false,
  "market_metals_bridge_collectors_simulation_unchanged": true
}
```

#### `autonomous_archive_guided_flow_coherence_lock`

```json
{
  "base": "28.3.02",
  "build": "28.3.03",
  "scope": "Module 01 completion coherence and visible publication identity",
  "step_5_archive": "automatic after valid personal conclusion",
  "extra_archive_click_required": false,
  "roadmap_update": "immediate after archive",
  "expected_post_completion": [
    "session archived",
    "Module 01 roadmap practiced",
    "progress no longer 0 percent",
    "module 02 available"
  ],
  "snapshot_label": "Lecture du snapshot Bitcoin",
  "spot_snapshot_distinction_visible": true,
  "step_4_wording_matches_direct_automatic_action": true,
  "visible_build_labels_synchronized": true,
  "preserved": [
    "reset",
    "Market",
    "Metals",
    "Bridge",
    "collectors",
    "fictional simulation",
    "existing learning archives"
  ]
}
```

#### `explicit_lesson_validation_verified_archive_lock`

```json
{
  "base": "28.3.03",
  "build": "28.3.04",
  "scope": "guided learning interaction correction only",
  "step_1_primary_action": "opens and scrolls to the lesson only",
  "step_1_validation_button": "visible below the lesson",
  "lesson_remains_available_after_validation": true,
  "step_5_effect": "validates conclusion only",
  "archive_action": "distinct visible Terminer et archiver button",
  "archive_persistence": "IndexedDB write followed by verified read-back",
  "archive_failure": "rollback to visible 5/5 unarchived state with explicit error",
  "completed_module_visibility": "lesson, five-step plan and notebook remain visible",
  "next_module_action": "distinct button in completion panel",
  "no_claim_of_human_comprehension": "completed cards say Preuve enregistrée",
  "reset_required": false,
  "preserved": [
    "reset",
    "Market",
    "Metals",
    "Bridge",
    "collectors",
    "fictional simulation",
    "existing learning archives"
  ],
  "dead_dom_references_removed": [
    "offlineNotice",
    "btnFoundationResetPath",
    "btnNewLearningSession",
    "btnResetLearningSimulation"
  ]
}
```

#### `module_01_guided_conclusion_pedagogy_lock`

```json
{
  "base": "28.3.04",
  "build": "28.3.05",
  "scope": "Module 01 pedagogy only",
  "step_1": "explicit lesson opening and visible post-reading validation preserved",
  "step_2": "Livecheck proof with IndexedDB read-back preserved",
  "step_3": "explicit BTC price 24h 7d observation with separate confirmation",
  "step_4": "explicit source and time confirmation; no hidden search",
  "step_5": "generated factual synthesis plus explicit prediction question",
  "correct_answer": "Non",
  "mandatory_free_text_removed": true,
  "personal_notes": "optional and never validate Module 01",
  "archive": "separate explicit button with IndexedDB verification",
  "next_module": "separate action after archived Module 01 remains visible",
  "active_28_3_04_draft_migration": "old text length cannot preserve step 5 without guided evidence",
  "reset_required": false,
  "preserved": [
    "reset 28.2.98",
    "Market",
    "Metals",
    "Bridge",
    "collectors",
    "fictional simulation",
    "existing archives"
  ]
}
```

#### `foundations_guided_pedagogy_01_03`

```json
{
  "base": "28.3.05",
  "state": "ready",
  "modules": [
    "01 · Marché et données",
    "02 · Spot et carnet d’ordres",
    "03 · Frais et gestion du risque"
  ],
  "module_01_polish": [
    "indexeddb_archive_count_message",
    "market_snapshot_vs_binance_spot_explicit"
  ],
  "module_02_flow": [
    "lesson",
    "best_bid_ask",
    "market_vs_limit",
    "fictional_btc_50_position",
    "guided_execution_conclusion"
  ],
  "module_03_flow": [
    "lesson",
    "school_cost_example",
    "fictional_btc_50_position",
    "minus3_plus5_scenarios",
    "guided_net_result_conclusion"
  ],
  "free_text_required": false,
  "archive_separate": true,
  "next_module_separate": true,
  "real_orders": false,
  "wallet": false,
  "api_keys": false
}
```

#### `foundations_evidence_snapshot_consolidation_01_03`

```json
{
  "base": "28.3.06",
  "build": "28.3.07",
  "state": "ready",
  "scope": "Foundations 01–03 evidence stability and code/test consolidation",
  "module_01": {
    "price_24h_7d": "frozen at explicit step 3 validation",
    "source_time": "frozen at explicit step 4 validation",
    "live_market_can_continue_without_mutating_session": true,
    "archive_uses_frozen_evidence": true
  },
  "module_02": {
    "position_summary": "already evidence-backed and preserved",
    "behavior_changed": false
  },
  "module_03": {
    "scenario_anchor": "position entry price and invested amount",
    "scenario_model": "simplified gross change minus explicit round-trip pedagogical costs",
    "minus_3_and_plus_5_frozen_at_test": true,
    "live_market_can_continue_without_mutating_scenario_evidence": true,
    "active_28_3_06_draft_migration": "legacy scenario evidence returns to step 4 only; earlier steps and completed archives are preserved"
  },
  "code_cleanup": [
    "remove unused free-text threshold constant",
    "remove unused conclusion length helper",
    "update persistence reason build marker",
    "repair current contract harness"
  ],
  "preserved": [
    "Module 01 archive",
    "roadmap progression",
    "Market",
    "Metals",
    "Bridge",
    "collectors",
    "reset 28.2.98",
    "fictional simulation safety"
  ],
  "reset_required": false,
  "real_orders": false,
  "wallet": false,
  "api_keys": false
}
```

#### `security_guided_pedagogy_04_05`

```json
{
  "base": "28.3.07",
  "build": "28.3.08",
  "status": "ready_for_local_chromium_and_public_firefox_validation",
  "scope": [
    "module_04_account_security",
    "module_05_wallet_withdrawals"
  ],
  "module_04_evidence": [
    "security_stack",
    "fake_support_refusal",
    "security_plan_snapshot",
    "guided_conclusion"
  ],
  "module_05_evidence": [
    "asset_network_match",
    "independent_destination_method",
    "small_test_and_trace_plan",
    "guided_conclusion"
  ],
  "real_credentials_collected": false,
  "real_address_collected": false,
  "real_transaction_performed": false,
  "notes_optional": true,
  "archive_and_next_module_separate": true,
  "old_unfinished_04_05_draft_policy": "preserve_lesson_read_then_restart_at_step_2",
  "modules_01_03_changed": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "reset_changed": false,
  "simulation_engine_changed": false,
  "research_basis": [
    "ANSSI MFA and password recommendations",
    "AMF PSCA and unauthorized actor warnings",
    "Kraken account security, GSL, withdrawal network and confirmation documentation"
  ]
}
```

#### `knowledge_guided_pedagogy_06_08`

```json
{
  "build": "28.3.09",
  "base": "28.3.08",
  "scope": [
    "module_06_stablecoins_tokenomics",
    "module_07_smart_contracts_defi",
    "module_08_staking_yields"
  ],
  "modules_01_05_changed": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "reset_changed": false,
  "simulation_engine_changed": false,
  "real_stablecoin_selected": false,
  "real_wallet_connected": false,
  "real_contract_interaction": false,
  "real_approval_or_signature": false,
  "real_staking_or_deposit": false,
  "evidence_mode": "frozen_at_validation",
  "free_notes_required": false,
  "archive_separate_from_next_module": true,
  "active_draft_migration": "preserve_step_1_clear_steps_2_5_for_modules_06_08"
}
```

#### `mastery_guided_pedagogy_09_11`

```json
{
  "build": "28.3.10",
  "base": "28.3.09",
  "scope": [
    "module_09_derivatives_liquidation",
    "module_10_scams_investigation",
    "module_11_records_tax"
  ],
  "modules_01_08_changed": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "reset_changed": false,
  "simulation_engine_changed": false,
  "real_derivative_opened": false,
  "real_entity_assessed": false,
  "real_personal_data_collected": false,
  "real_tax_calculation": false,
  "personalized_tax_advice": false,
  "evidence_mode": "frozen_at_validation",
  "free_notes_required": false,
  "archive_separate_from_next_module": true,
  "active_draft_migration": "preserve_step_1_clear_steps_2_5_for_modules_09_11"
}
```

#### `learning_state_continuity_order_completion_lock`

```json
{
  "build": "28.3.11",
  "base": "28.3.10",
  "scope": [
    "per_module_pedagogy_versions",
    "active_draft_continuity",
    "strict_step_order_1_to_5",
    "explicit_journey_completion_11_of_11"
  ],
  "module_versions": {
    "market": "28.3.07",
    "spot": "28.3.07",
    "risk": "28.3.07",
    "account": "28.3.08",
    "wallet": "28.3.08",
    "tokenomics": "28.3.09",
    "defi": "28.3.09",
    "yield": "28.3.09",
    "derivatives": "28.3.10",
    "scams": "28.3.10",
    "records": "28.3.10"
  },
  "unchanged_active_drafts_preserved": true,
  "step_2_blocked_before_lesson_ui": true,
  "step_2_blocked_before_lesson_handler": true,
  "module_11_next_state": "journey_complete_11_11",
  "automatic_module_01_restart": false,
  "modules_content_changed": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "reset_changed": false,
  "simulation_engine_changed": false,
  "public_firefox_indexeddb_validation_required": true
}
```

#### `real_browser_persistence_recovery_evidence_lock`

```json
{
  "base": "28.3.11",
  "scope": [
    "indexeddb_write_readback",
    "serialized_persistence_queue",
    "reload_and_reopen_recovery",
    "non_destructive_integrity_diagnostic",
    "explicit_storage_error_codes",
    "simulation_store_separation"
  ],
  "notebook_schema": "agent_crypto_learning_notebook_indexeddb_v2",
  "persistence_evidence_schema": "agent_crypto_learning_persistence_evidence_v2",
  "diagnostic_schema": "agent_crypto_learning_integrity_report_v2",
  "error_codes": [
    "LEARNING-IDB-OPEN",
    "LEARNING-IDB-BLOCKED",
    "LEARNING-IDB-READ",
    "LEARNING-IDB-WRITE",
    "LEARNING-IDB-VERIFY",
    "LEARNING-STORAGE-QUOTA"
  ],
  "automatic_repair": false,
  "automatic_reset": false,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "pedagogy_content_changed": false,
  "simulation_engine_changed": false,
  "reset_changed": false,
  "chromium_real_indexeddb_tested": false,
  "public_firefox_existing_profile_validation_required": true
}
```

### Persistance et continuité

#### `fail_closed_persistence_reset_serialization_diagnostic_truth_lock`

```json
{
  "base": "28.3.12",
  "scope": [
    "fail_closed_initial_read",
    "two_phase_verification_evidence",
    "canonical_reset_serialization",
    "record_pure_diagnostic",
    "bidirectional_archive_roadmap_consistency",
    "pagehide_persistence_flush",
    "truthful_test_metadata"
  ],
  "initial_read_failure_writes": 0,
  "reset_uses_canonical_queue": true,
  "stale_generation_rejected": true,
  "verified_metadata_written_after_readback": true,
  "diagnostic_global_cache_reads": false,
  "roadmap_archive_consistency": "bidirectional",
  "pagehide_flush_installed": true,
  "chromium_real_indexeddb_tested": false,
  "firefox_existing_profile_validation_required": true,
  "market_changed": false,
  "metals_changed": false,
  "bridge_changed": false,
  "collectors_changed": false,
  "pedagogy_content_changed": false,
  "simulation_engine_changed": false
}
```

### Autres métadonnées historiques

#### `foundation_evidence_only_validation`

```json
{
  "base": "28.2.92",
  "state": "historical_superseded",
  "modules": [
    "market",
    "spot",
    "risk"
  ],
  "checkboxes": "read_only_status_indicators",
  "manual_step_mutation_blocked": true,
  "validation_sources": [
    "integrated_lesson",
    "livecheck",
    "foundation_answers",
    "school_simulation",
    "instant_scenarios"
  ],
  "conclusion_prerequisites": [
    "read",
    "open",
    "practice",
    "verify"
  ],
  "conclusion_minimum_characters": 20,
  "early_text_preserved": true,
  "non_foundation_modules_unchanged": true,
  "full_learning_reset_preserved": true,
  "market_metals_bridge_collectors_unchanged": true,
  "superseded_by": "module_01_guided_conclusion_pedagogy_lock",
  "current_conclusion_validation": "guided evidence answer; no character threshold"
}
```

---

Extraction : 64 sections historiques déplacées depuis `version.json` 28.3.17.


## 29.3.07 — Aerith Whole-Page Pedagogy Layer

Couche de vulgarisation complète au-dessus d'Atlas/NØX : lecture Simple, Détaillée et Expert, dictionnaire contextuel, contrôle de cohérence snapshot/fingerprint et contrat pédagogique transmis à Aerith. Aucun changement du Bridge V1.9.1.


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
