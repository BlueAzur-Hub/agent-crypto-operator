# ERITH.IA — Registre maître des sources Marchés

## Crypto · Métaux précieux · Métaux industriels · Matières critiques · Bourse · Gemmes

Version : 1.0  
Date de recherche : 31 juillet 2026  
Statut : documentation de référence / architecture préparatoire  
Usage : Agent-Crypto @erith.IA, Atlas-10 Crypto, Aerith-10 Crypto, Bridge local, Notion, GitHub, LLM  
Nom de fichier canonique proposé : `ERITH_IA_MARKETS_SOURCE_REGISTRY_MASTER_FR.md`

---

# 🧭 0. Objet du registre

Ce document ne remplace pas les modules métier existants.

Il complète :

- `erith_ia_metals_sentinel_fr.md` ;
- `erith_ia_rare_earth_sentinel_fr.md` ;
- `erith_ia_gemstone_sentinel_fr.md`.

Les modules Sentinel décrivent **comment raisonner**.

Le présent registre décrit :

- **où chercher** ;
- **quelle source sert à quoi** ;
- **quelle source peut être automatisée** ;
- **quelle source doit rester une référence humaine** ;
- **quelles licences ou limites empêchent une intégration immédiate** ;
- **comment séparer prix, historique, structure, macro, réglementation et provenance** ;
- **comment construire les futurs adaptateurs Crypto, Métaux et Bourse sans mélanger les domaines**.

Règle centrale :

**Une source réputée n’est pas automatiquement une source exploitable par une application publique. La qualité, la licence, l’horodatage, l’unité et le droit de redistribution doivent être vérifiés séparément.**

---

# ⚠️ 1. Limites et règles de prudence

Ce registre :

- ne donne aucun conseil financier ;
- ne recommande aucun achat ni aucune vente ;
- ne garantit aucune donnée ;
- ne remplace pas les conditions contractuelles des fournisseurs ;
- ne donne pas le droit de republier une donnée sous licence ;
- ne transforme pas une cotation différée en cotation en direct ;
- ne permet pas d’inventer un historique absent ;
- ne permet pas de déduire un prix spot depuis un futur sans l’indiquer ;
- ne permet pas de présenter une estimation comme une mesure officielle.

Avant toute connexion réelle :

1. relire les conditions d’utilisation ;
2. vérifier la redistribution publique ;
3. vérifier le coût ;
4. protéger les clés dans le Bridge ;
5. tester les symboles ;
6. enregistrer l’unité ;
7. enregistrer la devise ;
8. enregistrer l’horodatage fourni par la source ;
9. enregistrer le délai annoncé ;
10. conserver la dernière donnée valide sans la présenter comme « live ».

---

# 🧠 2. État du projet relu dans le fil Crypto

## 2.1 Domaine Crypto actuel

Architecture déjà cohérente :

- CoinGecko pour l’univers de marché, les rangs, capitalisations, volumes, variations et snapshots ;
- Binance WebSocket pour les prix directs quand une paire compatible existe ;
- historique direct, cache, archive ou mixte explicitement qualifié ;
- graphique comparatif ;
- Math Core ;
- scanners ;
- mémoires A/B/C ;
- séparation entre observation, comparaison et décision humaine.

Règle déjà validée :

**CoinGecko structure le marché ; Binance apporte la cotation directe ; aucune source ne doit usurper le rôle de l’autre.**

## 2.2 Domaine Métaux actuel

La fondation visuelle existe pour :

- XAU — or ;
- XAG — argent ;
- XPT — platine ;
- XPD — palladium ;
- HG — cuivre.

État réel :

- aucune cotation connectée ;
- aucun prix inventé ;
- aucune série inventée ;
- USGS et IEA préparés comme sources structurelles ;
- LBMA et LME identifiés comme références de marché, mais non connectés ;
- futur adaptateur nécessaire ;
- cache Métaux séparé du cache Crypto ;
- mêmes principes d’intégrité que le graphique Crypto.

## 2.3 Domaine Bourse envisagé

Le fil conduit vers un troisième domaine parallèle :

- actions ;
- ETF ;
- indices ;
- fondamentaux ;
- macro ;
- horaires et états de marché ;
- données réglementaires.

La Bourse ne doit pas être ajoutée comme une extension cosmétique du Market Crypto.

Elle doit réutiliser le même contrat :

```text
source
actif
symbole
classe d’actif
devise
unité
marché
prix
OHLCV
horodatage source
horodatage réception
délai
licence
qualité
cache
provenance
```

## 2.4 Contraintes de chantier confirmées

- ne pas écrire sur GitHub ;
- livrer localement les fichiers ;
- préserver les fonctions valides ;
- une Build = un objectif cohérent ;
- aucune donnée fictive ;
- aucun faux statut « live » ;
- ne pas inclure les images inchangées dans les ZIP ;
- protéger les clés API dans le Bridge ;
- conserver la compatibilité Ryzen et Transformer Book ;
- distinguer les changements visuels des changements de données.

---

# 🏷️ 3. Classification des sources

## 3.1 Types

| Icône | Type | Définition |
|---|---|---|
| 🏛️ | Autorité publique | Organisme public, régulateur, banque centrale ou institution internationale |
| 🏦 | Marché officiel | Bourse, place de marché ou administrateur de benchmark |
| 🔌 | Fournisseur API | Service commercial ou gratuit conçu pour l’intégration |
| ⛓️ | Source blockchain | Explorateur, nœud, données on-chain ou protocole |
| 📚 | Référence structurelle | Rapport, base statistique, nomenclature ou méthodologie |
| 🧪 | Laboratoire / norme | Certification, gemmologie, qualité ou nomenclature |
| 📰 | Contexte | Actualités, recherche ou analyse à ne pas confondre avec une cotation |
| 👁️ | Référence humaine | Site utile à consulter, mais non retenu pour ingestion automatique |

## 3.2 Notes

| Note | Signification |
|---|---|
| A+ | Source prioritaire, autorité forte et usage clairement défini |
| A | Très bonne source, intégration possible sous conditions |
| B | Bonne source complémentaire ou fournisseur pratique |
| C | Contexte ou validation secondaire |
| R | Référence humaine uniquement |
| X | Ne pas automatiser tant que licence ou méthode non clarifiée |

## 3.3 Dimensions évaluées

Chaque source est comparée selon :

- autorité ;
- couverture ;
- fraîcheur ;
- historique ;
- horodatage ;
- unité ;
- accès API ;
- coût ;
- licence ;
- redistribution ;
- stabilité ;
- valeur pour le LLM ;
- valeur pour l’interface ;
- difficulté d’intégration.

---

# ₿ 4. Registre Crypto

## 4.1 CoinGecko

**Type :** 🔌 agrégateur de marché  
**Note :** A pour structure de marché, B pour production gratuite  
**Rôle recommandé :** univers, rang, capitalisation, volumes, variations, métadonnées, historique de marché agrégé.

Source officielle :

- Documentation : https://docs.coingecko.com/
- Vue des endpoints : https://docs.coingecko.com/reference/endpoint-overview
- API publique : https://api.coingecko.com/api/v3
- API on-chain publique : https://api.geckoterminal.com/api/v2

Points forts :

- couverture très large ;
- identifiants de coins stables ;
- données de marché agrégées ;
- historique ;
- informations d’exchange ;
- démarrage possible sans clé pour un prototype léger ;
- GeckoTerminal pour DEX, pools et liquidité.

Limites :

- l’API publique est soumise à une limitation dynamique par IP ;
- les requêtes lourdes ou fréquentes nécessitent une formule dédiée ;
- une valeur agrégée n’est pas une cotation d’exécution ;
- le prix peut différer d’une place précise ;
- les identifiants CoinGecko ne doivent pas être remplacés par de simples symboles.

Usage Agent-Crypto :

- conserver comme source principale du Market Snapshot ;
- conserver pour les Top 250 et scanners de marché ;
- conserver comme secours pour un prix de snapshot ;
- ne pas étiqueter comme Binance Live ;
- enregistrer l’identifiant CoinGecko dans le registre des actifs.

Implémentation :

```text
coingecko_id
symbol
market_rank
market_cap
volume_24h
price_change_percentage
snapshot_at
received_at
source_kind = aggregate_market
```

---

## 4.2 Binance Spot API et WebSocket

**Type :** 🏦 place de marché / 🔌 API  
**Note :** A pour cotation directe des paires disponibles  
**Rôle recommandé :** dernier prix, trades, mini-ticker, OHLC, carnet et streaming.

Sources officielles :

- Documentation générale : https://developers.binance.com/en/docs/introduction
- REST Spot : https://developers.binance.com/en/docs/products/spot/rest-api
- WebSocket Spot : https://developers.binance.com/en/docs/binance-spot-api-docs/web-socket-streams

Points forts :

- données directes de marché ;
- WebSocket ;
- prix, bid/ask, trades, mini-tickers et chandeliers ;
- timestamps ;
- plusieurs flux combinables ;
- convient au cartouche « Prix live Binance ».

Limites :

- seulement les actifs et paires cotés ;
- un prix BTC/EUR n’est pas un prix global BTC ;
- les connexions doivent être surveillées et recréées ;
- les limites WebSocket doivent être respectées ;
- les flux de marché ne remplacent pas CoinGecko pour la capitalisation ou le rang.

Usage Agent-Crypto :

- source directe primaire pour BTC, ETH, BNB, XRP, SOL lorsque les paires EUR existent ;
- fallback contrôlé en USDT ou autre paire uniquement si l’interface l’annonce ;
- cache du dernier événement valide ;
- vérification de silence du flux ;
- état dégradé si le timestamp dépasse le seuil.

Contrat :

```text
exchange = Binance
pair = BTCEUR
price
bid
ask
event_time
trade_time
received_at
latency_ms
state = live | delayed | disconnected
```

---

## 4.3 Coin Metrics Community

**Type :** ⛓️ données réseau et marché  
**Note :** A pour métriques communautaires documentées  
**Rôle recommandé :** couche on-chain prudente et normalisée.

Sources officielles :

- Documentation : https://docs.coinmetrics.io/api
- API v4 : https://docs.coinmetrics.io/api/v4/
- Base communautaire : https://community-api.coinmetrics.io/v4

Points forts :

- API communautaire sans clé ;
- métriques décrites et normalisées ;
- timestamps ISO 8601 ;
- données réseau ;
- données de marché selon couverture ;
- licence communautaire indiquée pour les usages non commerciaux.

Limites :

- couverture communautaire plus limitée que l’offre professionnelle ;
- limites de débit ;
- certaines métriques ou résolutions sont payantes ;
- les métriques doivent être comprises avant d’être affichées.

Usage Agent-Crypto :

- première extension on-chain recommandée ;
- activité réseau ;
- frais ;
- émissions ;
- capitalisation réalisée si disponible ;
- indicateurs de santé réseau ;
- ne pas injecter cinquante métriques à la fois.

Priorité d’interface :

```text
RÉSEAU
activité
frais
offre
sécurité
horodatage
définition de la métrique
```

---

## 4.4 Etherscan API V2

**Type :** ⛓️ explorateur et vérification blockchain  
**Note :** A pour preuve transactionnelle Ethereum et réseaux compatibles  
**Rôle recommandé :** transactions, transferts, contrats, soldes, vérification d’adresse.

Sources officielles :

- Démarrage : https://docs.etherscan.io/getting-started
- Limites : https://docs.etherscan.io/resources/rate-limits
- API : https://api.etherscan.io/v2/api

Points forts :

- API multi-chaînes V2 ;
- transactions et transferts ;
- contrats vérifiés ;
- soldes ;
- logs ;
- outils de preuve pour la fiche d’un actif.

Limites :

- clé requise ;
- certains endpoints sont payants ;
- pagination nécessaire ;
- limites spécifiques ;
- une transaction on-chain ne prouve pas une identité humaine ;
- ne pas analyser automatiquement un portefeuille privé sans demande explicite.

Usage Agent-Crypto :

- bouton « Explorateur blockchain » ;
- vérification d’un contrat ;
- fiche de transaction ;
- preuves liées à un token ;
- pas de surveillance personnelle par défaut.

---

## 4.5 DefiLlama

**Type :** ⛓️ agrégateur DeFi  
**Note :** B+  
**Rôle recommandé :** TVL, stablecoins, volumes DEX, frais et revenus de protocoles.

Sources officielles :

- Documentation API : https://defillama.com/docs/api
- Documentation Pro : https://defillama.com/pro-api/docs
- SDK officiel : https://github.com/DefiLlama/api-sdk

Points forts :

- couverture DeFi étendue ;
- TVL par protocole et chaîne ;
- stablecoins ;
- volumes ;
- frais ;
- API et SDK.

Limites :

- TVL n’est pas une valeur parfaitement standardisée ;
- double comptage et méthodes propres aux protocoles possibles ;
- certaines catégories nécessitent l’offre payante ;
- ne pas transformer une hausse de TVL en recommandation.

Usage Agent-Crypto :

- futur module DeFi ;
- contexte de liquidité ;
- comparaison protocole/chaîne ;
- alerte méthodologique obligatoire ;
- afficher la source et la définition de chaque métrique.

---

## 4.6 Glassnode

**Type :** ⛓️ fournisseur on-chain professionnel  
**Note :** A technique, C économique pour le projet actuel  
**Rôle recommandé :** future couche avancée si budget.

Source officielle :

- Documentation : https://docs.glassnode.com/
- API : https://docs.glassnode.com/basic-api/api

Points forts :

- nombreuses métriques on-chain ;
- historique ;
- métadonnées détaillées ;
- infrastructure spécialisée ;
- indicateurs avancés.

Limites :

- accès API réservé aux offres professionnelles avec option API ;
- coût incompatible avec une première implémentation pédagogique ;
- risque de surcharger l’interface avec des métriques opaques.

Décision :

**Ne pas intégrer maintenant. Conserver dans le catalogue comme source professionnelle future.**

---

## 4.7 AMF

**Type :** 🏛️ régulateur français  
**Note :** A+ pour la France  
**Rôle recommandé :** statut des prestataires, listes blanches/noires, information épargnant.

Sources officielles :

- Site : https://www.amf-france.org/
- Information crypto : https://www.amf-france.org/fr/espace-epargnants/proteger-son-epargne/crypto-actifs-bitcoin-etc
- Prestataires : https://www.amf-france.org/fr/espace-epargnants/proteger-son-epargne/listes-blanches/psanpsca

Usage Agent-Crypto :

- Source Dock réglementaire ;
- vérification du statut d’une plateforme ;
- avertissement France ;
- aucune déduction sur la performance d’un actif.

État réglementaire 2026 à enregistrer dans la mémoire de veille :

- fin de la période transitoire française ;
- statut PSCA/MiCA à vérifier ;
- ne pas considérer l’ancien statut PSAN comme suffisant après la transition.

---

## 4.8 ESMA — MiCA

**Type :** 🏛️ régulateur européen  
**Note :** A+  
**Rôle recommandé :** registre MiCA, prestataires, white papers et entités non conformes.

Sources officielles :

- MiCA : https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica
- Registres : https://www.esma.europa.eu/publications-and-data/databases-and-registers

Usage Agent-Crypto :

- registre réglementaire européen ;
- validation croisée avec l’AMF ;
- téléchargement et indexation des CSV officiels ;
- état séparé de la donnée financière.

Contrat :

```text
entity_name
country
authorisation_type
competent_authority
status
effective_date
source_file_date
source_url
```

---

# 🥇 5. Registre Métaux — cotations et historiques

## 5.1 Alpha Vantage

**Type :** 🔌 fournisseur API multi-actifs  
**Note :** A- comme premier adaptateur XAU/XAG  
**Rôle recommandé :** démarrage rapide or/argent, spot et historique.

Source officielle :

- Documentation : https://www.alphavantage.co/documentation/

Fonctions utiles identifiées :

```text
GOLD_SILVER_SPOT
GOLD_SILVER_HISTORY
CURRENCY_EXCHANGE_RATE
TIME_SERIES
INDICATEURS ÉCONOMIQUES
```

Points forts :

- API simple ;
- JSON et CSV ;
- XAU et XAG explicitement documentés ;
- spot or/argent ;
- historique quotidien, hebdomadaire et mensuel ;
- couvre aussi actions, ETF, devises, crypto et macro.

Limites :

- clé nécessaire ;
- quotas selon formule ;
- ne couvre pas nécessairement les cinq actifs Métaux avec le même niveau ;
- vérifier le droit d’affichage public ;
- le projet doit conserver la source native et ne pas appeler une série « LBMA ».

Usage recommandé :

**Phase 1 immédiate pour XAU et XAG uniquement.**

Ne pas forcer XPT, XPD ou HG dans le même adaptateur si la documentation ou l’abonnement ne les expose pas clairement.

---

## 5.2 Twelve Data

**Type :** 🔌 fournisseur API multi-actifs  
**Note :** A comme candidat unifié Métaux + Bourse  
**Rôle recommandé :** prix, historique OHLC et WebSocket pour plusieurs classes d’actifs.

Sources officielles :

- Documentation : https://twelvedata.com/docs
- Marchés : https://twelvedata.com/market-data
- Commodities : https://twelvedata.com/commodities
- Base REST : https://api.twelvedata.com
- WebSocket : wss://ws.twelvedata.com

Points forts :

- format commun pour actions, devises, crypto, ETF et matières premières ;
- endpoint `time_series` ;
- JSON ou CSV ;
- OHLC ;
- historique ;
- WebSocket ;
- XAU/USD et XPT/USD visibles dans les exemples et catalogues ;
- base particulièrement adaptée à un futur switch Métaux/Bourse.

Limites :

- clé API ;
- couverture dépend du plan ;
- WebSocket complet selon formule ;
- tester XAU, XAG, XPT, XPD et HG avant engagement ;
- vérifier l’origine exacte de chaque flux agrégé ;
- ne pas assimiler automatiquement XAU/USD à un benchmark LBMA.

Usage recommandé :

**Candidat principal pour un adaptateur unifié de démonstration, après test des cinq symboles et vérification de licence.**

Test minimal :

```text
XAU/USD
XAG/USD
XPT/USD
XPD/USD
HG ou symbole cuivre réellement référencé
```

Décision après test :

```text
couverture 5/5
timestamp
OHLC
historique disponible
délai
quota
droit de publication
coût mensuel
```

---

## 5.3 API Ninjas — Commodity Price

**Type :** 🔌 fournisseur API de futures matières premières  
**Note :** B+ comme prototype cinq métaux  
**Rôle recommandé :** candidat pratique pour couvrir rapidement les cinq familles.

Source officielle :

- Documentation : https://api-ninjas.com/api/commodityprice

Couverture annoncée :

- or ;
- argent ;
- platine ;
- palladium ;
- cuivre ;
- aluminium ;
- énergie ;
- agriculture.

Points forts :

- cinq métaux du panier couverts ;
- prix ;
- variation ;
- précédent close ;
- haut/bas ;
- horodatage ;
- conversion de devise et d’unité ;
- historique OHLCV dans les offres adaptées ;
- snapshots et courbes à terme dans certaines offres.

Limites :

- il s’agit principalement de contrats futures roulants, pas du spot LBMA ;
- accès gratuit très limité ;
- données gratuites différées ;
- usage commercial soumis à abonnement ;
- il faut afficher clairement `Futures`, l’exchange et l’unité ;
- un contrat roulant ne doit jamais être présenté comme un lingot physique.

Usage recommandé :

- excellent banc d’essai pour le contrat de données ;
- possible secours pour XPT, XPD et cuivre ;
- comparer avec Twelve Data avant sélection ;
- ne pas connecter sans Bridge.

---

## 5.4 LBMA

**Type :** 🏦 benchmark officiel des métaux précieux  
**Note :** A+ comme référence, X pour redistribution immédiate  
**Rôle recommandé :** vérité de benchmark, méthodologie, clearing et marché OTC de Londres.

Sources officielles :

- Prix et données : https://www.lbma.org.uk/prices-and-data
- Gold Price : https://www.lbma.org.uk/prices-and-data/lbma-gold-price
- Silver Price : https://www.lbma.org.uk/prices-and-data/lbma-silver-price
- Clearing : https://www.lbma.org.uk/prices-and-data/clearing-data

Points forts :

- benchmark majeur pour l’or et l’argent ;
- références platine et palladium ;
- données de clearing ;
- méthodologie et participants ;
- référence essentielle pour Metals Sentinel.

Limites déterminantes :

- une licence est requise pour obtenir ou utiliser les benchmarks en temps réel ou historiques dans de nombreux usages ;
- l’affichage public, la valorisation et les produits dérivés sont encadrés ;
- ne pas scraper les tableaux ;
- ne pas republier les prix sans droit explicite.

Décision :

**Source documentaire et de validation, pas adaptateur public immédiat.**

---

## 5.5 London Metal Exchange — LME

**Type :** 🏦 marché officiel des métaux industriels  
**Note :** A+ comme référence, X pour redistribution publique sans licence  
**Rôle recommandé :** cuivre, aluminium, nickel, zinc, plomb, étain, stocks, volumes et courbes.

Sources officielles :

- Marché des données : https://www.lme.com/en/Market-data
- Accès : https://www.lme.com/en/Market-data/Accessing-market-data
- Rapports : https://www.lme.com/en/market-data/reports-and-data
- Métaux non ferreux : https://www.lme.com/en/Metals/Non-ferrous
- Licences : https://www.lme.com/en/Market-Data/Market-data-licensing/

Points forts :

- référence industrielle ;
- prix officiels et de clôture ;
- données de stocks et entrepôts ;
- volumes ;
- open interest ;
- données différées et historiques ;
- cuivre directement pertinent pour HG.

Limites déterminantes :

- licence nécessaire selon affichage, distribution ou usage non-display ;
- les flux publics sont souvent différés ;
- accès XML et usages internes encadrés ;
- historiques avancés payants ;
- ne pas contourner les licences par scraping.

Décision :

- intégrer d’abord les **métadonnées** et la **documentation** ;
- ajouter les stocks et rapports seulement après vérification des conditions ;
- cotation LME directe dans une phase budgétée.

---

## 5.6 CME Group / COMEX / NYMEX

**Type :** 🏦 marché officiel de futures et options  
**Note :** A+ comme source de contrats, A payant pour API  
**Rôle recommandé :** or, argent, platine, palladium, cuivre, contrats, volumes, courbe à terme.

Sources officielles :

- Métaux : https://www.cmegroup.com/metals
- Métaux précieux : https://www.cmegroup.com/markets/metals/precious.html
- APIs : https://www.cmegroup.com/market-data/market-data-api.html
- Temps réel : https://www.cmegroup.com/market-data/real-time-futures-and-options-data-api.html
- Historique DataMine : https://www.cmegroup.com/datamine/datamine-api.html

Points forts :

- source directe de contrats ;
- WebSocket officiel ;
- top of book ;
- trades ;
- statistiques ;
- historique DataMine ;
- excellente base pour contango/backwardation ;
- données adaptées à l’analyse de contrats.

Limites :

- abonnement et licence ;
- différence entre futur et spot ;
- expiration et roulement à gérer ;
- symboles de contrats variables ;
- ne convient pas à une première intégration gratuite.

Décision :

**Phase institutionnelle ultérieure, après stabilisation de l’adaptateur générique.**

---

# ⛏️ 6. Métaux — données structurelles, offre et géopolitique

## 6.1 USGS — Mineral Commodity Summaries

**Type :** 🏛️📚 autorité publique  
**Note :** A+  
**Rôle recommandé :** production, réserves, dépendances, événements, tendances et données structurelles.

Sources officielles :

- MCS : https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries
- Édition 2026 : https://pubs.usgs.gov/publication/mcs2026
- Centre : https://www.usgs.gov/centers/national-minerals-information-center

Édition 2026 :

- 222 pages ;
- plus de 90 minéraux et matériaux ;
- données de production ;
- réserves ;
- ressources ;
- dépendance aux importations ;
- événements et tendances ;
- fiches par matière ;
- données publiées avec une data release associée.

C’est bien le grand PDF recherché dans le fil.

Points forts :

- autorité ;
- profondeur ;
- séries pluriannuelles ;
- couverture très large ;
- données structurelles indispensables ;
- contenu public largement réutilisable avec attribution selon les règles USGS.

Limites :

- rythme annuel ;
- pas de cotation intraday ;
- données mondiales parfois estimées ;
- extraction PDF à contrôler ;
- les données doivent être liées à l’année et à la version.

Usage Agent-Crypto :

- cartes `Production`, `Réserves`, `Dépendances`, `Pays principaux` ;
- mise à jour annuelle ;
- cache permanent versionné ;
- aucune confusion avec une source de prix.

---

## 6.2 IEA — Critical Minerals

**Type :** 🏛️📚 institution internationale  
**Note :** A+  
**Rôle recommandé :** demande, scénarios, chaînes industrielles, politiques et transition énergétique.

Sources officielles :

- Data Explorer : https://www.iea.org/data-and-statistics/data-tools/critical-minerals-data-explorer
- Outlook 2026 : https://www.iea.org/reports/global-critical-minerals-outlook-2026
- Policy Tracker : https://www.iea.org/data-and-statistics/data-tools/critical-minerals-policy-explorer
- Dataset : https://www.iea.org/data-and-statistics/data-product/critical-minerals-dataset

Points forts :

- projections pour de nombreux minéraux ;
- scénarios ;
- technologies ;
- politiques ;
- concentration minière et raffinage ;
- licence CC BY 4.0 pour les produits indiqués ;
- particulièrement utile à Rare Earth Sentinel.

Limites :

- projections, pas cotations ;
- hypothèses de scénario à conserver ;
- dates de mise à jour différentes entre explorer, dataset et rapport ;
- ne pas afficher un scénario comme une prévision certaine.

Usage Agent-Crypto :

```text
mineral
scenario
technology
demand_year
demand_value
unit
dataset_version
methodology
```

---

## 6.3 Commission européenne — RMIS / JRC

**Type :** 🏛️📚 autorité européenne  
**Note :** A+  
**Rôle recommandé :** matériaux critiques UE, profils, production, réserves, recyclage, commerce et risque d’approvisionnement.

Sources officielles :

- RMIS : https://rmis.jrc.ec.europa.eu/
- Matériaux critiques et stratégiques : https://rmis.jrc.ec.europa.eu/critical-and-strategic-materials
- Commission européenne : https://single-market-economy.ec.europa.eu/sectors/raw-materials/areas-specific-interest/critical-raw-materials_en
- Critical Raw Materials Act : https://single-market-economy.ec.europa.eu/sectors/raw-materials/areas-specific-interest/critical-raw-materials/critical-raw-materials-act_en

Points forts :

- angle européen ;
- listes réglementaires ;
- profils matières ;
- commerce UE ;
- recyclage ;
- fiches ;
- données très pertinentes pour la France.

Limites :

- profils et millésimes hétérogènes ;
- certaines données proviennent de sources tierces ;
- fréquence variable ;
- vérifier la licence de chaque téléchargement.

Usage Agent-Crypto :

- onglet `Matériaux critiques` ;
- badge `Critique UE` / `Stratégique UE` ;
- profils par métal ;
- politiques et dépendances ;
- aucune valeur de marché calculée à partir du statut critique.

---

## 6.4 Banque mondiale — Pink Sheet

**Type :** 🏛️📚 institution internationale  
**Note :** A  
**Rôle recommandé :** prix mensuels et annuels de matières premières, historique long et contexte global.

Source officielle :

- https://www.worldbank.org/en/research/commodity-markets

Points forts :

- fichiers mensuels et annuels ;
- historique ;
- prix de matières premières ;
- format tableur ;
- comparaison inter-marchés ;
- utile pour les horizons 1 an et plus.

Limites :

- fréquence mensuelle ;
- pas de live ;
- conventions de séries à conserver ;
- certaines matières utilisent des références composites.

Usage Agent-Crypto :

- historique de fond ;
- vue Macro ;
- comparaison mensuelle ;
- source de secours historique, jamais source spot.

---

## 6.5 FRED / ALFRED

**Type :** 🏛️📚 banque centrale / agrégateur public  
**Note :** A+ pour la macro  
**Rôle recommandé :** dollar, taux, inflation, stress financier, production et séries macro.

Sources officielles :

- Documentation : https://fred.stlouisfed.org/docs/api/fred/overview.html
- Site : https://fred.stlouisfed.org/

Points forts :

- API REST ;
- JSON/XML ;
- très nombreuses séries ;
- métadonnées ;
- dates de publication ;
- ALFRED pour les versions historiques ;
- excellent pour Math Core macro.

Limites :

- clé API ;
- séries provenant de producteurs multiples ;
- fréquence différente selon série ;
- révisions possibles ;
- ne pas superposer automatiquement une série mensuelle à une série intraday.

Usage recommandé :

```text
DXY ou proxy dollar
taux réels
Fed Funds
inflation
production industrielle
stress financier
récession
```

Chaque série doit stocker :

```text
fred_series_id
frequency
units
seasonal_adjustment
source_agency
last_updated
observation_date
```

---

# 💎 7. Gemmes, certificats et nomenclature

## 7.1 GIA Report Check

**Type :** 🧪 laboratoire / vérification  
**Note :** A+  
**Rôle recommandé :** vérification humaine d’un rapport GIA.

Source officielle :

- https://www.gia.edu/report-check
- Portail : https://myapps.gia.edu/ReportCheckPortal/

Points forts :

- vérification d’un numéro de rapport ;
- correspondance avec les archives GIA ;
- données et PDF selon millésime ;
- traitements et diagrammes selon rapport.

Limites :

- pas une API publique générale à supposer ;
- ne pas automatiser par scraping ;
- un rapport cohérent ne remplace pas l’examen physique ;
- les limitations du service doivent être conservées.

Usage Agent-Crypto / Gemstone Sentinel :

- lien de vérification ;
- checklist ;
- champ `Laboratoire` ;
- champ `Numéro de rapport` ;
- action humaine explicite.

---

## 7.2 CIBJO — Blue Books

**Type :** 🧪📚 normes et nomenclature  
**Note :** A+  
**Rôle recommandé :** langage commun pour diamants, gemmes, perles, métaux précieux, laboratoires et sourcing.

Sources officielles :

- https://cibjo.org/the-blue-books/
- Introduction : https://cibjo.org/rstoolkit/introduction-to-the-blue-books-2/

Points forts :

- standards de nomenclature ;
- livres vivants ;
- révision régulière ;
- documents pour gemmes, diamants, perles, métaux précieux, laboratoires et sourcing responsable.

Limites :

- standards volontaires ;
- toujours vérifier l’édition ;
- ne pas reproduire intégralement sans examiner les droits ;
- ne pas résumer une exigence sans citer le livre et l’année.

Usage :

- glossaire canonique ;
- validation des termes ;
- contrôle des déclarations `naturel`, `synthétique`, `traité` ;
- bloc LLM Gemstone Sentinel.

---

## 7.3 Gemdat

**Type :** 👁️📚 base communautaire spécialisée  
**Note :** C+  
**Rôle recommandé :** découverte, propriétés, noms, localités et photographie de référence.

Source :

- https://www.gemdat.org/

Points forts :

- vaste catalogue ;
- index de gemmes ;
- localités ;
- propriétés ;
- utile pédagogiquement.

Limites :

- ne remplace pas GIA ou un laboratoire ;
- contenu et photographies soumis à leurs droits ;
- pas de certification ;
- ne pas utiliser comme source de prix.

Décision :

**Référence humaine et enrichissement pédagogique, pas source décisionnelle.**

---

# 📈 8. Bourse — futur domaine parallèle

## 8.1 Twelve Data

**Note :** A comme candidat unifié  
**Rôle :** actions, ETF, indices, forex, crypto et matières premières avec une logique d’API commune.

Intérêt pour le projet :

- évite de créer une architecture différente pour Bourse ;
- `time_series` peut nourrir le graphique ;
- mêmes mécanismes de cache ;
- mêmes objets OHLC ;
- état des marchés et métadonnées.

Condition :

**Tester la couverture Euronext, les délais et la licence avant affichage public.**

---

## 8.2 Alpha Vantage

**Note :** A-  
**Rôle :** actions, ETF, indicateurs, fondamentaux, devises, crypto et macro.

Intérêt :

- API simple ;
- bonne pour prototype ;
- historique ;
- fondamentaux ;
- indicateurs ;
- complément possible à Twelve Data.

Limite :

- quotas ;
- qualité et fréquence variables selon endpoint ;
- certaines fonctions premium ;
- ne pas mélanger un cours différé et un cours direct.

---

## 8.3 Euronext

**Type :** 🏦 marché officiel européen  
**Note :** A+ comme source, X sans accord de diffusion  
**Rôle :** actions européennes, ETF, indices, dérivés, obligations et données de référence.

Sources officielles :

- Données : https://www.euronext.com/en/data
- Accès : https://www.euronext.com/en/data/real-time-data/how-access-market-data
- Web Services : https://www.euronext.com/en/data/how-access-market-data/web-services
- Stream API : https://www.euronext.com/en/data/cloud-solutions

Points forts :

- source directe ;
- France et plusieurs marchés européens ;
- API REST JSON ;
- flux WebSocket ;
- temps réel, différé, historique et référence ;
- CAC 40 et instruments Euronext.

Limites :

- licence ;
- coûts ;
- usages internes et redistribution distingués ;
- données différées gratuites dans certains cadres, pas automatiquement redistribuables ;
- ne pas scraper Live Euronext.

Décision :

**Référence officielle future. Commencer la Bourse avec un agrégateur autorisé, puis migrer vers Euronext si le projet et le budget le justifient.**

---

## 8.4 SEC EDGAR

**Type :** 🏛️ données réglementaires  
**Note :** A+ pour les sociétés américaines  
**Rôle :** dépôts, XBRL, fondamentaux publiés et historique.

Source officielle :

- https://www.sec.gov/search-filings/edgar-application-programming-interfaces
- Base : https://data.sec.gov/

Points forts :

- sans clé ;
- JSON ;
- company facts ;
- dépôts ;
- données XBRL ;
- mises à jour rapides après publication ;
- archives bulk.

Limites :

- pas de CORS direct ;
- requiert un backend/Bridge ;
- conformité au fair access ;
- données réglementaires, pas prix de marché ;
- taxonomies et périodes fiscales à gérer.

Usage futur :

- fiche société ;
- chiffre d’affaires ;
- résultat ;
- bilan ;
- cash-flow ;
- date du dernier dépôt ;
- preuve du document source.

---

# 🧮 9. Tableau comparatif des principaux candidats d’API

| Source | Crypto | XAU/XAG | XPT/XPD | Cuivre | Actions/ETF | WebSocket | Historique | Coût initial | Licence publique | Décision |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| CoinGecko | Oui | Non cible | Non | Non | Non | Selon offre | Oui | Faible | Vérifier formule | Conserver Crypto |
| Binance | Oui direct | Non | Non | Non | Non | Oui | Oui | Faible | Conditions exchange | Conserver Live Crypto |
| Coin Metrics | On-chain | Non | Non | Non | Non | Pro | Oui | Gratuit limité | Non commercial communautaire | Ajouter plus tard |
| Alpha Vantage | Oui | Oui | À vérifier | Oui selon série | Oui | Non central | Oui | Gratuit limité | Vérifier | Premier XAU/XAG |
| Twelve Data | Oui | Oui | À tester | À tester | Oui | Oui | Oui | Essai / abonnement | Vérifier | Candidat unifié |
| API Ninjas | Bitcoin séparé | Oui futures | Oui futures | Oui futures | API séparée | Non central | Premium | Gratuit très limité | Premium pour commercial | Prototype 5 métaux |
| LBMA | Non | Benchmark | Benchmark | Non | Non | Licence | Oui sous licence | Élevé | Encadrée | Référence, pas connexion immédiate |
| LME | Non | Non | PGM selon produit | Oui officiel | Non | Services/licence | Oui | Élevé | Encadrée | Phase institutionnelle |
| CME | Non principal | Futures | Futures | Futures | Dérivés | Oui payant | DataMine | Payant | Encadrée | Phase institutionnelle |
| Euronext | Indices crypto possibles | Non cible | Non | Dérivés selon offre | Oui officiel | Oui payant | Oui | Payant | Encadrée | Future Bourse officielle |

---

# 🥇 10. Classement pratique pour Agent-Crypto

## 10.1 À intégrer ou conserver maintenant

### Crypto

1. 🥇 Binance — prix direct des paires disponibles.
2. 🥈 CoinGecko — marché global, rangs, caps, volumes et historique.
3. 🥉 AMF + ESMA — statut réglementaire.
4. Coin Metrics Community — première extension on-chain.
5. Etherscan — preuve transactionnelle ciblée.

### Métaux

1. 🥇 Alpha Vantage — premier adaptateur XAU/XAG simple.
2. 🥈 Twelve Data — candidat unifié Métaux + Bourse.
3. 🥉 API Ninjas — candidat rapide pour les cinq contrats futures.
4. USGS — structure annuelle.
5. IEA — matières critiques et scénarios.
6. FRED — macro.
7. World Bank — historique mensuel.
8. RMIS/JRC — statut critique européen.

## 10.2 À garder comme références officielles non connectées

- LBMA ;
- LME ;
- CME ;
- Euronext ;
- GIA ;
- CIBJO.

## 10.3 À ne pas automatiser par scraping

- pages de prix LBMA ;
- pages interactives LME ;
- pages Live Euronext ;
- GIA Report Check ;
- graphiques TradingView ;
- pages d’agrégateurs sans API ni licence claire ;
- tableaux de vendeurs d’or ;
- cours affichés sur des sites de presse ;
- résultats Google.

---

# 🔌 11. Contrat de données commun

## 11.1 SourceRegistryEntry

```json
{
  "source_id": "twelve_data",
  "name": "Twelve Data",
  "domain": ["crypto", "metals", "stocks", "forex"],
  "authority_type": "vendor_api",
  "official_docs": "https://twelvedata.com/docs",
  "access": {
    "mode": ["rest", "websocket"],
    "key_required": true,
    "bridge_required": true
  },
  "licence": {
    "public_display": "to_verify",
    "redistribution": "to_verify",
    "commercial_use": "plan_dependent"
  },
  "freshness": {
    "declared_delay": "plan_dependent",
    "source_timestamp": true
  },
  "status": "candidate",
  "priority": 1
}
```

## 11.2 QuoteRecord

```json
{
  "domain": "metals",
  "asset_id": "gold",
  "symbol": "XAU",
  "instrument": "XAU/USD",
  "instrument_type": "spot",
  "source_id": "alpha_vantage",
  "market": null,
  "price": 0,
  "currency": "USD",
  "unit": "troy_ounce",
  "bid": null,
  "ask": null,
  "change_24h": null,
  "change_24h_percent": null,
  "source_time": null,
  "received_at": null,
  "declared_delay_seconds": null,
  "quality": "unqualified",
  "licence_state": "verified_before_publication"
}
```

Règle :

**La valeur `0` ci-dessus illustre le schéma. Elle ne doit jamais être affichée comme un cours. Une donnée absente reste `null` dans l’application.**

## 11.3 SeriesRecord

```json
{
  "domain": "metals",
  "asset_id": "gold",
  "symbol": "XAU",
  "period": "7d",
  "interval": "1h",
  "price_type": "spot",
  "source_id": "twelve_data",
  "currency": "USD",
  "unit": "troy_ounce",
  "points": [],
  "oldest_point_at": null,
  "newest_point_at": null,
  "received_at": null,
  "cache_state": "empty",
  "freshness_state": "not_qualified"
}
```

## 11.4 StructuralFact

```json
{
  "domain": "critical_materials",
  "asset_id": "copper",
  "metric": "world_mine_production",
  "value": null,
  "unit": "metric_tons",
  "year": 2025,
  "source_id": "usgs_mcs_2026",
  "publication_version": "1.3",
  "published_at": "2026-02-06",
  "revised_at": "2026-05-27",
  "methodology_url": null,
  "confidence": "official_estimate"
}
```

## 11.5 RegulatoryRecord

```json
{
  "domain": "regulation",
  "entity": null,
  "jurisdiction": "EU",
  "register": "MiCA",
  "status": null,
  "effective_date": null,
  "source_id": "esma_mica_register",
  "source_file_date": null,
  "received_at": null
}
```

---

# ⏱️ 12. Règles de fraîcheur et de vérité

## 12.1 États autorisés

```text
DIRECT
DÉLAI DÉCLARÉ
DONNÉES À JOUR
DONNÉES DIFFÉRÉES
DONNÉES HISTORIQUES
DATE NON QUALIFIÉE
SOURCE DÉCONNECTÉE
ADAPTATEUR REQUIS
LICENCE À VÉRIFIER
```

## 12.2 États interdits

```text
LIVE
TEMPS RÉEL
OFFICIEL
SPOT
BENCHMARK
```

Ces mots sont interdits lorsque la source ou le contrat ne le prouve pas.

## 12.3 Calcul de l’état

```text
age = now - source_time

si aucune source_time :
    DATE NON QUALIFIÉE

si connexion absente :
    SOURCE DÉCONNECTÉE

si délai contractuel connu :
    comparer age au délai contractuel

si historique :
    afficher la date de la dernière observation

si cache :
    afficher source_time + received_at + cache_age
```

## 12.4 Séparation des horodatages

Toujours conserver :

- `source_time` ;
- `received_at` ;
- `cached_at` ;
- `rendered_at`.

Ne jamais remplacer le timestamp source par l’heure du navigateur.

---

# 🗄️ 13. Caches séparés

```text
cache_crypto_market
cache_crypto_live
cache_crypto_history
cache_crypto_onchain

cache_metals_quotes
cache_metals_history
cache_metals_structural
cache_metals_macro
cache_metals_sources

cache_stocks_quotes
cache_stocks_history
cache_stocks_fundamentals
cache_stocks_regulatory
```

Règle :

**Une série Crypto ne doit jamais apparaître derrière une sélection Métaux. Une série Métaux ne doit jamais réutiliser le statut Binance.**

---

# 🛡️ 14. Bridge et sécurité

## 14.1 Clés interdites dans le navigateur public

Ne jamais placer dans `app.js`, `index.html`, `version.json` ou GitHub Pages :

- clé Alpha Vantage ;
- clé Twelve Data ;
- clé API Ninjas ;
- clé Etherscan ;
- clé FRED ;
- identifiants CME ;
- identifiants Euronext ;
- tout token payant.

## 14.2 Routes Bridge proposées

```text
GET /market/metals/quote?symbol=XAU
GET /market/metals/series?symbol=XAU&period=7d
GET /market/metals/snapshot
GET /market/metals/source-status

GET /market/stocks/quote?symbol=...
GET /market/stocks/series?symbol=...
GET /market/stocks/fundamentals?symbol=...

GET /market/macro/fred?series_id=...
GET /market/structural/usgs?commodity=...
GET /market/structural/iea?mineral=...
```

## 14.3 Réponse Bridge minimale

```json
{
  "ok": true,
  "data": null,
  "source": {
    "id": null,
    "name": null,
    "source_time": null,
    "received_at": null,
    "delay": null,
    "licence_state": null
  },
  "cache": {
    "hit": false,
    "age_seconds": null
  },
  "error": null
}
```

---

# 🧱 15. Plan d’implémentation recommandé

## Phase 0 — Registre et contrats

Statut : présent document.

À créer ensuite :

```text
market_source_registry.json
market_asset_registry.json
market_data_contract.md
bridge_market_adapter_contract.md
```

Aucun appel réel.

## Phase 1 — Adaptateur XAU/XAG

Objectif :

- connecter uniquement or et argent ;
- tester Alpha Vantage et Twelve Data ;
- choisir une source principale ;
- conserver l’autre comme validation ou secours ;
- afficher devise, unité, délai et timestamp ;
- remplir le graphique sans toucher à la logique Crypto.

Critères de validation :

```text
2/2 cotations
historique 24h
historique 7j
horodatage source
cache séparé
fallback contrôlé
aucun secret navigateur
aucun faux live
```

## Phase 2 — Extension XPT/XPD/HG

Comparer :

- Twelve Data ;
- API Ninjas ;
- fournisseur alternatif autorisé.

Décider actif par actif.

Il est acceptable d’avoir :

```text
XAU/XAG = spot agrégé
XPT/XPD/HG = futures
```

à condition que l’interface l’affiche clairement.

Il est interdit de fusionner les deux catégories sans étiquette.

## Phase 3 — Structure Métaux

Connecter ou importer :

- USGS MCS ;
- IEA ;
- RMIS/JRC ;
- World Bank ;
- FRED.

Créer :

- Production ;
- Réserves ;
- Dépendance ;
- Demande ;
- Politiques ;
- Macro ;
- Provenance.

## Phase 4 — Bourse

Réutiliser le contrat Métaux :

- Twelve Data ou Alpha Vantage pour prototype ;
- SEC EDGAR pour fondamentaux US ;
- Euronext officiel lorsque licence et budget le permettent ;
- FRED pour macro.

Nouveau cycle de domaine possible :

```text
MARCHÉ CRYPTO
→ MARCHÉ MÉTAUX
→ MARCHÉ BOURSE
→ MARCHÉ CRYPTO
```

Ce cycle ne doit être activé qu’après création de la fondation Bourse.

## Phase 5 — On-chain

Ajouter progressivement :

1. Coin Metrics Community ;
2. Etherscan ;
3. DefiLlama ;
4. Glassnode seulement si besoin et budget.

---

# 🧩 16. Version suivante la plus logique après la consolidation visuelle

La suite ne devrait pas être une nouvelle refonte graphique.

La version technique la plus sûre est :

```text
Build 28.2.44 — Metals Source Registry & Data Contract Foundation
```

Objectif limité :

- ajouter un registre interne des cinq actifs ;
- ajouter un registre des sources ;
- définir les états de connexion ;
- définir les unités ;
- définir les types spot/futures/structurel ;
- définir le format Bridge ;
- ne connecter aucune clé ;
- ne modifier aucune courbe Crypto ;
- ne changer aucun visuel majeur.

Puis :

```text
Build 28.2.45 — XAU/XAG Bridge Adapter Pilot
```

Cette séparation réduit fortement le risque de régression.

---

# 🤖 17. BLOCK LLM — MARKET SOURCE REGISTRY

```text
BLOCK_LLM_MARKET_SOURCE_REGISTRY_V1

IDENTITÉ
Tu aides ERITH.IA Agent-Crypto à sélectionner, qualifier et expliquer les sources de données financières, crypto, métaux, matières critiques, Bourse et gemmes.

MISSION
Tu ne cherches pas seulement une valeur.
Tu identifies :
- la source ;
- son rôle ;
- son autorité ;
- son type de donnée ;
- sa licence ;
- son horodatage ;
- son unité ;
- sa devise ;
- son délai ;
- sa méthodologie ;
- son droit d’usage ;
- ses limites ;
- sa compatibilité avec le Bridge.

RÈGLE DE SÉPARATION
Ne mélange jamais :
- agrégateur de marché ;
- cotation directe ;
- benchmark ;
- futur ;
- spot ;
- donnée physique ;
- donnée structurelle ;
- projection ;
- donnée réglementaire ;
- actualité ;
- opinion.

RÈGLE CRYPTO
CoinGecko sert principalement au marché agrégé.
Binance sert principalement à la cotation directe des paires disponibles.
Une valeur CoinGecko ne devient jamais une valeur Binance.
Une valeur de snapshot ne devient jamais une observation WebSocket.

RÈGLE MÉTAUX
Un prix XAU/USD agrégé ne devient jamais automatiquement le LBMA Gold Price.
Un futur COMEX ne devient jamais automatiquement un spot physique.
Une série LME différée ne devient jamais une cotation en direct.
Une donnée USGS ou IEA ne devient jamais un prix.

RÈGLE BOURSE
Une donnée réglementaire SEC n’est pas un prix.
Une cotation agrégée n’est pas la donnée officielle Euronext.
Un cours différé doit être nommé différé.
Un marché fermé ne doit pas afficher une heure de mise à jour comme preuve de négociation active.

RÈGLE GEMMES
Une photo ne certifie pas une pierre.
Un numéro de rapport doit être vérifié sur le site du laboratoire.
CIBJO fournit une nomenclature et des standards volontaires.
GIA Report Check reste une vérification humaine sauf API officielle explicite.

AVANT TOUTE CONCLUSION
Produire :
1. Faits vérifiés
2. Source primaire
3. Source secondaire
4. Horodatage
5. Unité et devise
6. Délai
7. Données manquantes
8. Risque de licence
9. Niveau de confiance
10. Prochaine vérification

ÉTATS AUTORISÉS
- DIRECT
- DONNÉES À JOUR
- DONNÉES DIFFÉRÉES
- DONNÉES HISTORIQUES
- DATE NON QUALIFIÉE
- SOURCE DÉCONNECTÉE
- ADAPTATEUR REQUIS
- LICENCE À VÉRIFIER

INTERDICTIONS
- ne pas inventer de prix ;
- ne pas inventer d’historique ;
- ne pas inventer de volume ;
- ne pas combler un null par zéro ;
- ne pas masquer un délai ;
- ne pas publier une clé ;
- ne pas scraper une source sous licence ;
- ne pas donner d’ordre d’achat ou de vente ;
- ne pas transformer un score en recommandation.

FORMAT COURT
SOURCE :
TYPE :
DONNÉE :
ACTIF :
MARCHÉ :
SPOT/FUTURE/AUTRE :
DEVISE :
UNITÉ :
HORODATAGE :
DÉLAI :
LICENCE :
QUALITÉ :
LIMITES :
IMPLÉMENTATION :
DÉCISION :

FORMAT COMPARAISON
SOURCE A :
SOURCE B :
MÊME INSTRUMENT : oui/non
MÊME UNITÉ : oui/non
MÊME HORODATAGE : oui/non
MÊME MÉTHODE : oui/non
ÉCART :
CAUSES POSSIBLES :
SOURCE À PRIVILÉGIER :
JUSTIFICATION :
```

---

# 📋 18. Checklist avant ajout d’une source

```text
[ ] Source officielle ou fournisseur identifié
[ ] Documentation lue
[ ] Conditions d’utilisation lues
[ ] Redistribution publique autorisée
[ ] Coût connu
[ ] Clé protégée dans le Bridge
[ ] Symbole testé
[ ] Type d’instrument confirmé
[ ] Spot/futur confirmé
[ ] Devise confirmée
[ ] Unité confirmée
[ ] Timestamp source présent
[ ] Délai connu
[ ] Historique testé
[ ] Null géré
[ ] 429 géré
[ ] timeout géré
[ ] cache séparé
[ ] dernière donnée valide conservée
[ ] état dégradé visible
[ ] aucune donnée fictive
[ ] retour Crypto testé
[ ] Transformer Book testé
```

---

# 🔗 19. Index condensé des liens prioritaires

## Crypto

- CoinGecko : https://docs.coingecko.com/
- Binance : https://developers.binance.com/en/docs/introduction
- Coin Metrics : https://docs.coinmetrics.io/api
- Etherscan : https://docs.etherscan.io/
- DefiLlama : https://defillama.com/docs/api
- Glassnode : https://docs.glassnode.com/
- AMF : https://www.amf-france.org/
- ESMA MiCA : https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica

## Métaux et matières

- Alpha Vantage : https://www.alphavantage.co/documentation/
- Twelve Data : https://twelvedata.com/docs
- API Ninjas : https://api-ninjas.com/api/commodityprice
- LBMA : https://www.lbma.org.uk/prices-and-data
- LME : https://www.lme.com/en/Market-data
- CME : https://www.cmegroup.com/market-data/market-data-api.html
- USGS MCS 2026 : https://pubs.usgs.gov/publication/mcs2026
- IEA : https://www.iea.org/data-and-statistics/data-tools/critical-minerals-data-explorer
- RMIS : https://rmis.jrc.ec.europa.eu/
- World Bank : https://www.worldbank.org/en/research/commodity-markets
- FRED : https://fred.stlouisfed.org/docs/api/fred/overview.html

## Bourse

- Euronext : https://www.euronext.com/en/data
- Euronext Web Services : https://www.euronext.com/en/data/how-access-market-data/web-services
- SEC EDGAR API : https://www.sec.gov/search-filings/edgar-application-programming-interfaces
- Twelve Data : https://twelvedata.com/market-data
- Alpha Vantage : https://www.alphavantage.co/documentation/

## Gemmes

- GIA Report Check : https://www.gia.edu/report-check
- CIBJO Blue Books : https://cibjo.org/the-blue-books/
- Gemdat : https://www.gemdat.org/

---

# ✅ 20. Conclusion opérationnelle

Le travail déjà réalisé n’est pas une simple décoration.

La fondation actuelle permet de construire trois marchés parallèles :

```text
CRYPTO
MÉTAUX
BOURSE
```

La meilleure progression n’est plus d’ajouter des panneaux.

Elle consiste à créer :

1. un registre des sources ;
2. un contrat de données ;
3. un registre des actifs ;
4. un Bridge commun ;
5. un premier adaptateur XAU/XAG ;
6. une extension XPT/XPD/HG ;
7. une couche structurelle USGS/IEA/RMIS/FRED ;
8. une fondation Bourse réutilisant exactement le même contrat.

Décision recommandée :

**Conserver CoinGecko + Binance pour Crypto. Tester Alpha Vantage et Twelve Data pour XAU/XAG. Tester Twelve Data et API Ninjas pour l’extension cinq métaux. Garder LBMA, LME, CME et Euronext comme références officielles sous licence. Utiliser USGS, IEA, RMIS, World Bank et FRED comme couche structurelle et macro.**

Fin du registre.
