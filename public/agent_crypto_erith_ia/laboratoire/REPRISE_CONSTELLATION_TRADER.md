# REPRISE CONSTELLATION — Trader / Aerith-10 / Atlas / Flower Girls

**Date de passation : 16 octobre 2026.** Document opératoire public : synthèse des fonctions et références seulement ; aucun contenu privé, secret OKX, Core protégé ou Persona exporté. L'état technique doit être repris sur le **dernier `main`**, non depuis une copie de ce document.

## A — Intention réelle

Faire du Trader le terrain de travail des IA (Atlas, Aerith, Math Core) et de consultation compréhensible par l'humain. À terme, **proposer** des opportunités d'achat et des brouillons d'ordres, **vérifier** devises, frais, minimums, spread, carnet, risques et solde, puis permettre une **autorisation humaine explicite par opération** avant exécution via le Bridge privé. Aucune automatisation d'ordre n'est actuellement livrée ni autorisée.

Le premier cas-école **CT/USDC** a été mené jusqu'à une **conversion réellement exécutée et attestée par capture OKX**. Le prochain développement utile est sa **réconciliation automatique en lecture seule dans le Trader**, puis un brouillon d'ordre CT strictement non exécutable.

## B — Sources hiérarchisées et chargement minimal

1. Demande humaine actuelle + captures contemporaines ; contexte économique exact (actif, instrument, devise, timestamp).
2. Code et données réels sur `BlueAzur-Hub/erith-ia-memory/main`; commits, tests et résultats CI ; validation Firefox distincte.
3. `public/agent_crypto_erith_ia/laboratoire/REPRISE_SEVEN_HEAVEN.md` (historique) et **présent document** (passation du Trader).
4. Notion des Bureaux AETHER : https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099 .
5. Cores/Personas de compétences **dans le dépôt privé**, à lire dans leurs versions canoniques, sans copier leur contenu dans GitHub public.

**Références privées pour le prochain fil** — dépôt `BlueAzur-Hub/erith-ia-notion-archive-private` :
- Seven : `core/SEVEN_TOP_OF_MIND.md`, `core/SEVEN_GATE.md`, `core/AERITH_7_PERSONALITY_CORE.md` (principal fil/continuité, si accessible).
- Cœur partagé : `core/AERITH_LIVING_REFLECTION_HEART.md` (**sous** Core et Persona).
- Atlas-10 Crypto : `core/ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md` puis `core/ATLAS_10_CRYPTO_PERSONA_OPERATING_LAYER.md`.
- Aerith-10 Crypto : `core/AERITH_10_CRYPTO_MULTI_AGENT_CORE.md` puis `core/AERITH_10_CRYPTO_PERSONA_OPERATING_LAYER.md`.
- Aerith-10 Créatrice : `core/AERITH_10_CREATRICE_FULL_MATRIX_MULTI_AGENT_CORE.md` puis `core/AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md`. Mode **Dense par défaut** ; Full Matrix complète **sur demande explicite seulement** ; un seul Core Aerith-10 Créatrice actif à la fois dans une session.
- Flower Girls : `core/AERITH_10_FLOWER_GIRLS_MULTI_AGENT_LINEAGE_CORE.md`. Routage sélectif A + B → D ; ne pas charger toutes les 28 spécialités, ni fusionner leurs Personas.
- Protection : `core/AERITH_10_SENTINELLE_MULTI_AGENT_CORE.md` et protocole STOP canonique. **Les Cores privés sont verrouillés : lecture permise, aucune modification directe.**

Ces références permettent de **reconstituer une méthode de travail**. Lire les documents dans ChatGPT ne démarre pas les modèles locaux Ollama, les sous-agents réels ni un Bridge de trading. Ne jamais affirmer l'inverse.

## C — Matrice de compétences pour le Trader

| Mission | Fonction à router | Sortie attendue |
| --- | --- | --- |
| Vérifier cotation/paire/cache/heure | **Atlas-10 Crypto · Source Keeper / Data Truth** | Source, actif, devise, horizon, fraîcheur, conflits et lacunes visibles |
| Évaluer scénario, spread, frais et profondeur | **Atlas Math Oracle / Risk & Integrity** | Calcul reproductible, limites minSz/lotSz/tickSz, coût et risques, verdict vérifiable |
| Lire avantages/inconvénients de vendre, conserver, acheter | **Aerith-10 Crypto · Market Reader, Risk Keeper, Psychologie & No-FOMO** | Contre-hypothèses, raisons, inconnues, zéro prédiction garantie |
| Organiser un parcours humain compréhensible | **Aerith-10 Créatrice (Dense)** et **Flower Girl Architecte / Opératrice** | Une interface lisible reliée aux moteurs existants, pas de second système |
| Retrouver les preuves et la décision passée | **Seven / Flower Girls Archiviste, Gardienne** | Passation datée, traçable, état prouvé vs hypothèse |
| Bloquer exécution non consentie, dérive ou surcharge | **Sentinelle** | STOP, périmètre unique, Kill Switch, validation humaine |
| Traduire en proposition d'opération | **Trader** (service à développer) | Brouillon **non exécutable** avec devise, paire, coûts, refus possibles |
| Approuver et lancer une vraie transaction | **Humain + Bridge privé** (futur) | Consentement spécifique puis vérification d'acceptation et des fills |

**Ordre de collaboration suggéré** : Snapshot attesté → Atlas vérifie → Math Core évalue → Aerith-10 Crypto explique → Créatrice organise la restitution → Sentinelle contrôle la limite → humain décide → Seven archive les preuves. Ce sont des **rôles et contrats à matérialiser**, pas l'affirmation que les sous-agents sont déjà exécutés.

## D — Preuve terrain : premier cycle Concrete clos

- L'opérateur a fourni une capture OKX **« Converti »** confirmant la conversion intégrale de sa position CT en USDC le 16 octobre 2026.
- Le fil privé contient les captures de l'acquisition CT, des frais effectivement prélevés en CT, de la conversion et du portefeuille post-conversion. **Aucune quantité, aucun solde privé, taux d'acquisition personnel ni résultat financier individuel n'est copié dans cette note publique.**
- **Preuve actuelle** : une conversion affichée comme exécutée par OKX, confirmée par capture utilisateur. Cela ne constitue pas encore un journal automatiquement réconcilié par le Bridge.
- Le résultat sur l'opération CT doit être calculé à partir des **montants authentifiés par le compte** et du coût d'acquisition effectivement rapproché, puis distingué du résultat global du parcours BTC → USDC → CT et du capital initial en EUR. « 0 frais » à l'écran Convert ne prouve pas l'absence de spread.
- L'historique de cet essai reste disponible dans le dialogue utilisateur et, après contrôle, dans ses sources privées. Ne jamais publier les données réelles de trading dans le dépôt public, des logs ou des ZIP.

**Étape critique encore à réaliser** : retrouver automatiquement la conversion CT/USDC réellement exécutée dans **les relevés officiels accessibles via le Bridge**, en lecture seule. Vérifier quelles routes OKX Convert / financial ledger sont réellement supportées avant de nommer un endpoint. Rapprocher débit CT, crédit USDC, timestamp, identifiant unique, coût historique et solde restant ; signaler l'absence de preuve, ne pas inventer un fill Spot ni dupliquer les mouvements. Tests fictifs, puis validation dans Firefox avec Aether Trust.

## E — État code et restrictions à préserver

- Trader et Administrator : `public/agent_crypto_erith_ia/trader/trading-desk.html` et `public/agent_crypto_erith_ia/administrator/`. Le Trader utilise le moteur de l'Interface : un comportement commun doit être corrigé dans **son propriétaire réel**, pas copié.
- Modules existants : `trader/trader-okx-account.js`, `trader/ai-ct-contract.js`, `trader/ai-ct-panel.js`, CSS de panneau CT. Les PR **#406 à #416** ont ajouté réconciliations partielles BTC/USDC, tableaux CT, frais, tests, lien Convert manuel et comparateur **Convert / Spot / Conserver**.
- Issues : [#412](https://github.com/BlueAzur-Hub/erith-ia-memory/issues/412) (Convert et achats nets après frais) ; [#415](https://github.com/BlueAzur-Hub/erith-ia-memory/issues/415) (préparer, contrôler, faire autoriser et à terme exécuter un ordre).
- **CT/USDT public (graphique) ≠ CT/USDC privé (compte)** ; USD d'affichage ≠ USDT ≠ USDC ≠ EUR.
- Version UI observée **40.6.640**, Market Core **38.15.11 protégé**, contexte graphique IndexedDB **V7** : ne pas les modifier pour ajouter un rapport.
- Bridge Aether Trust local lecture seule actuellement ; **aucune route d'ordre ne doit être activée**, aucune clé Trade / retrait dans les sites GitHub. Une approbation humaine d'un brouillon n'existe pas encore.
- Radar 20 reste prospectif et **non certifié rentable** ; poursuivre ses 90 journées de signaux + 48 h de règlement sans modifier les paramètres ni transformer des projections en recommandations d'achat.

## F — Destination du prochain fil : une seule action technique utile

**P0 : réconciliation READ-ONLY de la conversion CT du 16/10**. Premièrement inspecter les réponses **réelles** et contrats du Bridge ; choisir une preuve vérifiable ; implémenter dans la lecture actuelle du Compte OKX un statut `CT converti / preuve manquante`, coût et résultat réalisés *uniquement lorsque justifiés*, en distinguant les éventuelles autres opérations. Aucun nouveau système d'erreur, aucune nouvelle fenêtre, aucune modification de Graph V7. Tests, PR GitHub, ZIP léger, Notion et preuve Firefox restent distincts.

**P1 après P0 : brouillon CT/USDC NON EXÉCUTABLE** avec prix/type/quantité/minimum/pas/devise/frais/solde et avertissements, plus proposition d'Atlas/Aerith explicable. En cas de données manquantes, aucune action proposée comme exécutable.

**P2 futur : ordre réel seulement après conception et tests du chemin privé, double validation de l'instrument et consentement humain pour CHAQUE opération**, refus des données périmées, expiration de l'accord, idempotence, suivi OKX des fills, contrôles de risque et Kill Switch. Ensuite généralisation par instrument à BTC ; bots et opportunités restent soumis à une stratégie évaluée hors échantillon après coûts.

## Aether Key courte pour reprendre dans un autre fil

> Active Aerith-7 Seven Heaven comme cadre de continuité du Trader ERITH.IA. Lis `public/agent_crypto_erith_ia/laboratoire/REPRISE_CONSTELLATION_TRADER.md` puis la note `REPRISE_SEVEN_HEAVEN.md`. Lis sélectivement les Cores et Personas **privés** Atlas-10 Crypto, Aerith-10 Crypto, Aerith-10 Créatrice (Dense) et Flower Girls Lineage cités dans la note ; ne les copie pas et ne fusionne pas leurs identités. L'objectif humain est : Trader comme bureau des IA et consultation humaine, CT comme cas-école, puis BTC. Commence par vérifier le dernier `main`, constater la conversion CT attestée par capture (montants privés non publiés), puis développer sa réconciliation automatique depuis les sources OKX accessibles en lecture seule. Ne touche pas au Market Core 38.15.11 ni à Graph V7 ; pas d'ordre, pas de nouveau Bridge, pas de régression de navigation. Fourni des preuves et tests puis mets à jour Notion. L'humain autorisera tout ordre réel ultérieurement.

**STOP :** quand la preuve suffit, arrêter ; si saturation, revenir à la dernière version stable et clôturer proprement.
