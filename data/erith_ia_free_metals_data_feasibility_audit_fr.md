# ERITH.IA — Audit de faisabilité zéro coût pour les données Métaux

## Or · Argent · Platine · Palladium · Cuivre

Version : 1.0  
Date de vérification : 31 juillet 2026  
Statut : audit documentaire, aucune connexion réalisée  
Portée : interface publique Agent-Crypto, Bridge local, graphique Métaux, Market Métaux  
Règle budgétaire : **0 € supplémentaire sans décision explicite de Christophe**

---

# 🧭 0. Objet

Cet audit répond à une question précise :

> Peut-on alimenter honnêtement le domaine Métaux de l’interface Agent-Crypto sans nouvel abonnement payant ?

Les cinq actifs étudiés sont :

- XAU — or ;
- XAG — argent ;
- XPT — platine ;
- XPD — palladium ;
- HG — cuivre.

L’audit distingue :

1. les cotations actuelles ;
2. les historiques ;
3. les données structurelles ;
4. les données macroéconomiques ;
5. les conditions de licence ;
6. le droit d’affichage dans une interface publique ;
7. les quotas gratuits ;
8. les comptes ou clés gratuites ;
9. le stockage et le cache ;
10. la viabilité réelle pour Agent-Crypto.

---

# 🔒 1. Règles non négociables

Aucune solution n’est retenue si elle exige :

- une dépense ;
- une carte bancaire pour un essai ;
- un abonnement reconduit automatiquement ;
- une clé exposée dans GitHub Pages ;
- un scraping contraire aux conditions d’utilisation ;
- une redistribution interdite ;
- l’affichage d’un futur comme un prix spot ;
- l’affichage d’une donnée différée comme « live » ;
- l’invention d’un historique ;
- le remplacement d’une donnée absente par zéro.

Toute clé gratuite éventuelle doit rester dans le Bridge local.

Aucun compte ni aucune clé ne sont créés par cet audit.

---

# ✅ 2. Conclusion immédiate

## 2.1 Ce qui est possible gratuitement

Une couche Métaux gratuite est possible pour :

- des snapshots peu fréquents ;
- des historiques quotidiens ou mensuels ;
- les données USGS de production et réserves ;
- les scénarios IEA ;
- les profils européens RMIS ;
- la macro FRED ;
- les historiques mensuels de la Banque mondiale.

## 2.2 Ce qui n’est pas garanti gratuitement

L’audit ne trouve pas de source réunissant simultanément :

- les cinq métaux ;
- des cotations continues ;
- des historiques intraday ;
- une licence publique parfaitement claire ;
- un quota suffisant ;
- aucun compte ;
- aucune clé ;
- aucun paiement ;
- une stabilité de production.

## 2.3 Décision de sécurité

La prochaine étape ne doit pas connecter automatiquement une source payante.

Le projet doit d’abord distinguer trois niveaux :

```text
NIVEAU A — DONNÉES PUBLIQUES SANS COMPTE
USGS · IEA · RMIS · World Bank

NIVEAU B — CLÉ GRATUITE, ZÉRO CARTE
Metals.Dev · GoldAPI · Alpha Vantage

NIVEAU C — GRATUIT MAIS INCOMPATIBLE AVEC UNE APPLICATION PUBLIQUE
Twelve Data Basic · API Ninjas Free · Metals-API Free
```

---

# 🥇 3. Classement des solutions de cotation zéro coût

## 3.1 Metals.Dev — meilleur candidat cinq métaux à faible fréquence

### Statut

**Candidat principal zéro coût pour des snapshots peu fréquents.**

### Offre gratuite vérifiée

- 0 $ par mois ;
- aucune carte bancaire requise ;
- 100 requêtes par mois ;
- données annoncées avec un délai maximal de 60 secondes ;
- endpoint `latest` capable de retourner plusieurs métaux dans une seule réponse ;
- or, argent, platine et palladium ;
- métaux industriels et références LME annoncées ;
- cuivre LME trois mois documenté dans la FAQ ;
- clé gratuite obligatoire.

### Avantages pour Agent-Crypto

Une seule requête peut récupérer plusieurs métaux.

Avec 100 requêtes par mois :

```text
environ 3 requêtes par jour
```

Cela permettrait :

- un snapshot le matin ;
- un snapshot dans l’après-midi ;
- un snapshot le soir ;
- ou une actualisation manuelle strictement limitée.

Le Bridge pourrait effectuer une seule requête puis servir le même cache aux différents écrans.

### Conditions importantes

Les conditions indiquent :

- l’usage gratuit ne demande pas de moyen de paiement ;
- la publication de taux sur un site est autorisée avec un abonnement actif ;
- la revente des données ou la création d’une API concurrente est interdite ;
- le fournisseur peut modifier les conditions du plan gratuit ;
- le fournisseur ne garantit pas l’exactitude ou la disponibilité.

### Limites

- 100 appels par mois sont insuffisants pour une courbe réellement continue ;
- une actualisation toutes les minutes consommerait le quota en moins de deux heures ;
- la terminologie `LBMA` ou `LME` doit être vérifiée actif par actif ;
- les droits amont des données doivent rester suivis ;
- le plan gratuit peut changer ;
- un compte et une clé restent nécessaires.

### Décision

```text
UTILISABLE :
snapshot manuel ou trois actualisations par jour

NON UTILISABLE :
streaming
rafraîchissement permanent
graphique intraday continu
```

### Sources officielles

- https://metals.dev/
- https://metals.dev/pricing
- https://metals.dev/docs
- https://metals.dev/policy/terms
- https://metals.dev/faq

---

## 3.2 GoldAPI.io — excellent pour les quatre métaux précieux, sans cuivre

### Statut

**Candidat secondaire pour XAU/XAG/XPT/XPD.**

### Offre gratuite vérifiée

- plan Sandbox gratuit ;
- aucune carte bancaire requise ;
- jusqu’à 100 requêtes par mois ;
- XAU, XAG, XPT et XPD ;
- USD, EUR et nombreuses autres devises ;
- historique quotidien annoncé ;
- bid/ask, timestamp et variations annoncés ;
- mises à jour annoncées toutes les deux secondes ;
- clé gratuite obligatoire.

### Avantages

- couvre les quatre métaux précieux ;
- réponses JSON adaptées au Bridge ;
- données dans plusieurs devises ;
- historique quotidien ;
- champs bid/ask ;
- documentation orientée tableaux de bord.

### Limites

- aucun cuivre ;
- 100 appels par mois seulement ;
- les affirmations marketing de temps réel doivent être contrôlées par le timestamp reçu ;
- les conditions détaillées de redistribution du plan Sandbox n’ont pas été trouvées avec une clarté suffisante pendant l’audit ;
- certaines pages annoncent un usage en production, mais une confirmation écrite du droit d’affichage public serait préférable.

### Décision

```text
BON CANDIDAT TECHNIQUE :
XAU / XAG / XPT / XPD

PAS ENCORE VALIDÉ JURIDIQUEMENT :
affichage public permanent du plan Sandbox

ABSENT :
cuivre
```

### Source officielle

- https://www.goldapi.io/

---

## 3.3 Alpha Vantage — bon pilote XAU/XAG, quota journalier faible

### Statut

**Candidat d’essai local pour l’or et l’argent.**

### Offre gratuite vérifiée

- clé gratuite ;
- majorité des endpoints accessibles gratuitement ;
- limite standard de 25 requêtes par jour ;
- endpoint `GOLD_SILVER_SPOT` ;
- symboles GOLD/XAU et SILVER/XAG ;
- endpoint `GOLD_SILVER_HISTORY` ;
- historique quotidien, hebdomadaire et mensuel.

### Avantages

- documentation claire ;
- or et argent explicitement pris en charge ;
- historique directement exploitable ;
- quota quotidien plutôt que mensuel ;
- aucun abonnement nécessaire pour les fonctions gratuites.

### Limites

- seulement XAU et XAG pour les endpoints spécialisés ;
- 25 appels par jour ;
- ne couvre pas le panier complet ;
- le droit d’affichage public des données Métaux gratuites n’est pas décrit assez précisément ;
- le fournisseur invite à contacter le service commercial pour certains usages commerciaux ;
- aucune clé ne doit être placée dans le navigateur.

### Décision

```text
UTILISABLE POUR :
test local
historique XAU/XAG
snapshot peu fréquent

NON RETENU COMME SOURCE PUBLIQUE :
tant que les droits d’affichage ne sont pas clarifiés
```

### Sources officielles

- https://www.alphavantage.co/documentation/
- https://www.alphavantage.co/support/
- https://www.alphavantage.co/premium/
- https://www.alphavantage.co/realtime_data_policy/

---

# 🟠 4. Sources gratuites techniquement intéressantes mais rejetées pour la production publique

## 4.1 API Ninjas — cinq métaux possibles, mais plan gratuit limité à l’évaluation

### Données proposées

- or ;
- argent ;
- platine ;
- palladium ;
- cuivre ;
- prix actuels ;
- historique ;
- snapshots ;
- courbes à terme ;
- données gratuites différées de 15 minutes ;
- contrats futures roulants.

### Plan gratuit vérifié

- 3 000 appels par mois ;
- 100 appels par heure ;
- aucune carte bancaire ;
- attribution obligatoire ;
- usage commercial interdit ;
- stockage et cache interdits ;
- usage limité à l’évaluation et à la démonstration ;
- aucune garantie de disponibilité ;
- interruptions régulières annoncées.

### Problème principal

Agent-Crypto doit conserver la dernière donnée valide dans un cache.

Le plan gratuit API Ninjas interdit précisément le stockage et le cache.

Il ne convient donc pas à l’architecture du projet.

### Autre problème

Les prix sont basés sur des contrats futures roulants.

Ils ne peuvent pas être affichés comme :

```text
spot physique
LBMA
LME officiel
```

### Décision

```text
REJETÉ POUR LA PRODUCTION PUBLIQUE

AUTORISÉ UNIQUEMENT :
test ponctuel de schéma
démonstration locale non persistante
```

### Sources officielles

- https://api-ninjas.com/api/commodityprice
- https://api-ninjas.com/pricing

---

## 4.2 Twelve Data Basic — gratuit, mais matières premières et affichage public non adaptés

### Plan Basic vérifié

- 0 $ ;
- 800 crédits par jour ;
- 8 crédits API par minute ;
- symboles d’essai internationaux ;
- usage personnel, interne et non commercial.

### Restriction déterminante

Les plans individuels, y compris Basic, ne permettent pas :

- la redistribution ;
- l’affichage commercial à des tiers ;
- l’usage public externe.

Le plan Basic ne mentionne pas les matières premières dans sa couverture principale.

La couverture `Commodities market data` apparaît dans des offres payantes supérieures.

### Décision

```text
REJETÉ POUR L’INTERFACE PUBLIQUE GRATUITE

ÉVENTUELLEMENT UTILE :
test interne sur symboles d’essai
aucune publication
```

### Sources officielles

- https://twelvedata.com/pricing
- https://support.twelvedata.com/en/articles/5332349-commercial-and-personal-usage
- https://support.twelvedata.com/en/articles/5335783-trial
- https://twelvedata.com/docs

---

## 4.3 Metals-API — plan gratuit incompatible avec l’affichage public

### État vérifié

La page de prix actuelle met surtout en avant des offres payantes.

Les conditions indiquent explicitement que le plan gratuit :

- est réservé à l’usage personnel ou aux tests ;
- ne peut pas être utilisé publiquement ;
- ne permet pas la redistribution ;
- ne peut pas être utilisé commercialement.

### Décision

```text
REJETÉ
```

Même si une clé gratuite est encore disponible, elle ne convient pas à l’interface publique.

### Sources officielles

- https://www.metals-api.com/pricing
- https://www.metals-api.com/terms
- https://documentation.metals-api.com/

---

# 🏛️ 5. Sources publiques sans abonnement pour les historiques et la structure

## 5.1 USGS — base structurelle prioritaire

### Coût

```text
0 €
aucune clé
aucun compte
```

### Contenu

Mineral Commodity Summaries 2026 :

- 222 pages ;
- plus de 90 minéraux et matériaux ;
- production mondiale ;
- réserves ;
- ressources ;
- dépendance aux importations ;
- tarifs ;
- statistiques sur cinq ans ;
- événements et tendances ;
- version 1.3 révisée en mai 2026 ;
- data release associée ;
- outil de visualisation.

### Licence

Les contenus produits par l’USGS sont généralement dans le domaine public américain, avec attribution demandée.

Les éléments tiers doivent néanmoins être identifiés.

### Usage Agent-Crypto

```text
PRODUCTION
RÉSERVES
RESSOURCES
DÉPENDANCES
PAYS PRINCIPAUX
TENDANCES ANNUELLES
```

### Limite

Aucune cotation intraday.

### Décision

```text
RETENU IMMÉDIATEMENT
```

### Sources officielles

- https://pubs.usgs.gov/publication/mcs2026
- https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries

---

## 5.2 IEA — matériaux critiques, scénarios et politiques

### Coût

```text
0 €
aucune carte
```

### Contenu vérifié

Le Critical Minerals Data Explorer 2026 :

- 37 minéraux critiques ;
- trois scénarios principaux ;
- onze cas technologiques ;
- demande et offre pour les principaux minéraux ;
- cuivre ;
- terres rares ;
- chaînes industrielles ;
- données mises à jour le 27 juillet 2026 ;
- licence CC BY 4.0.

Le Policy Tracker :

- plus de 60 pays et régions ;
- plus de 600 politiques ;
- résilience ;
- production ;
- pratiques responsables ;
- recyclage ;
- traçabilité ;
- licence CC BY 4.0.

### Usage Agent-Crypto

```text
MATÉRIAUX CRITIQUES
DEMANDE PAR SCÉNARIO
CONCENTRATION
POLITIQUES
RECYCLAGE
TRAÇABILITÉ
```

### Limite

Projection et politique, pas cotation.

### Décision

```text
RETENU IMMÉDIATEMENT
```

### Sources officielles

- https://www.iea.org/data-and-statistics/data-tools/critical-minerals-data-explorer
- https://www.iea.org/data-and-statistics/data-tools/critical-minerals-policy-explorer
- https://www.iea.org/reports/global-critical-minerals-outlook-2026

---

## 5.3 RMIS / JRC — criticité européenne

### Coût

```text
0 €
```

### Contenu

- 34 matières premières critiques de l’Union européenne ;
- 17 matières stratégiques ;
- profils matières ;
- fiches téléchargeables ;
- profils pays ;
- statut CRMA ;
- commerce, recyclage et chaînes industrielles selon les profils.

### Usage Agent-Crypto

```text
CRITIQUE UE
STRATÉGIQUE UE
PROFIL MATIÈRE
DÉPENDANCE EUROPÉENNE
RECYCLAGE
```

### Limite

La licence doit être vérifiée pour chaque téléchargement ou fiche.

### Décision

```text
RETENU COMME SOURCE STRUCTURELLE
```

### Source officielle

- https://rmis.jrc.ec.europa.eu/critical-and-strategic-materials

---

## 5.4 Banque mondiale — Pink Sheet

### Coût

```text
0 €
aucune clé
```

### Contenu

- données mensuelles XLS ;
- données annuelles XLS ;
- or ;
- argent ;
- platine ;
- cuivre et autres matières selon le fichier ;
- indices de matières premières ;
- mises à jour mensuelles ;
- historique long.

### Usage Agent-Crypto

```text
HISTORIQUE MENSUEL
COMPARAISON LONGUE
CONTEXTE MACRO DES MATIÈRES
```

### Limites

- aucune cotation en direct ;
- pas de courbe intraday ;
- la présence exacte du palladium doit être contrôlée dans le fichier téléchargé ;
- les conventions de séries et unités doivent être conservées ;
- vérifier les conditions de réutilisation du fichier avant redistribution.

### Décision

```text
RETENU POUR LE LONG TERME
```

### Source officielle

- https://www.worldbank.org/en/research/commodity-markets

---

## 5.5 FRED / ALFRED — couche macro, pas flux Métaux principal

### Coût

```text
0 €
compte gratuit pour la clé API
```

### Utilité

- taux ;
- inflation ;
- dollar ;
- production industrielle ;
- indices de prix ;
- stress financier ;
- séries publiques ou tierces ;
- métadonnées ;
- révisions historiques ALFRED.

### Contraintes

- l’API nécessite une clé liée à un compte ;
- toutes les séries ne sont pas libres de droits ;
- les restrictions propres au producteur de la série restent applicables ;
- une attribution et une mention FRED sont requises ;
- FRED n’est pas une source de cotation Métaux intraday.

### Usage Agent-Crypto

```text
MACRO
TAUX
DOLLAR
INFLATION
CYCLE INDUSTRIEL
```

### Décision

```text
RETENU PLUS TARD POUR LA MACRO
PAS POUR LE PRIX DIRECT
```

### Sources officielles

- https://fred.stlouisfed.org/docs/api/fred/overview.html
- https://fred.stlouisfed.org/docs/api/fred/v2/api_key.html
- https://fred.stlouisfed.org/docs/api/terms_of_use.html

---

# 📊 6. Tableau de décision final

| Source | Prix actuel | Historique | Métaux couverts | Compte/clé | Carte | Affichage public gratuit | Cache autorisé | Décision |
|---|---:|---:|---|---|---:|---|---|---|
| Metals.Dev Free | Oui, faible fréquence | Oui selon endpoint | XAU/XAG/XPT/XPD + industriels | Oui | Non | Semble autorisé avec plan actif, à surveiller | Non interdit dans les termes consultés | Candidat principal |
| GoldAPI Sandbox | Oui | Quotidien annoncé | XAU/XAG/XPT/XPD | Oui | Non | À confirmer explicitement | À vérifier | Candidat secondaire |
| Alpha Vantage Free | XAU/XAG | Quotidien/hebdo/mensuel | XAU/XAG | Oui | Non | Droit public insuffisamment clair | À vérifier | Test local |
| API Ninjas Free | Différé 15 min | Oui selon endpoint | 5 métaux, futures | Oui | Non | Démo seulement | Non | Rejeté |
| Twelve Data Basic | Symboles d’essai | Oui selon accès | Commodities non garanties en Basic | Oui | Non | Non | Usage interne | Rejeté |
| Metals-API Free | Selon disponibilité | Selon plan | Plusieurs | Oui | Non | Non | Non public | Rejeté |
| USGS | Non | Annuel structurel | Très large | Non | Non | Oui avec attribution | Oui | Retenu |
| IEA | Non | Scénarios | Critiques | Non | Non | CC BY 4.0 | Oui | Retenu |
| RMIS/JRC | Non | Profils | Critiques UE | Non | Non | Selon ressource | Oui selon licence | Retenu |
| World Bank | Non | Mensuel/annuel | Plusieurs | Non | Non | À vérifier avec attribution | Oui selon conditions | Retenu |
| FRED | Non principal | Macro | Séries variables | Oui | Non | Série par série | Oui selon série | Retenu macro |

---

# 🧮 7. Faisabilité par actif

## XAU — Or

Sources gratuites possibles :

1. Metals.Dev ;
2. GoldAPI ;
3. Alpha Vantage ;
4. World Bank pour mensuel ;
5. USGS pour structure ;
6. FRED pour macro.

Verdict :

```text
FAISABLE GRATUITEMENT
mais fréquence limitée
```

## XAG — Argent

Sources gratuites possibles :

1. Metals.Dev ;
2. GoldAPI ;
3. Alpha Vantage ;
4. World Bank ;
5. USGS ;
6. FRED macro.

Verdict :

```text
FAISABLE GRATUITEMENT
mais fréquence limitée
```

## XPT — Platine

Sources gratuites possibles :

1. Metals.Dev ;
2. GoldAPI ;
3. World Bank selon série ;
4. USGS ;
5. IEA/RMIS ;
6. API Ninjas uniquement en test futures.

Verdict :

```text
FAISABLE POUR SNAPSHOT ET STRUCTURE
historique intraday gratuit non garanti
```

## XPD — Palladium

Sources gratuites possibles :

1. Metals.Dev ;
2. GoldAPI ;
3. USGS ;
4. IEA/RMIS ;
5. API Ninjas uniquement en test futures.

Verdict :

```text
FAISABLE POUR SNAPSHOT
historique gratuit stable à confirmer
```

## HG — Cuivre

Sources gratuites possibles :

1. Metals.Dev pour référence LME cuivre annoncée ;
2. API Ninjas en futures, mais plan gratuit incompatible avec le cache ;
3. World Bank pour historique mensuel ;
4. USGS pour structure ;
5. IEA/RMIS pour criticité ;
6. FRED pour macro.

Verdict :

```text
FAISABLE POUR SNAPSHOT TRÈS LIMITÉ
ET TRÈS BONNE COUCHE STRUCTURELLE
```

Attention :

```text
HG COMEX = USD / livre
LME CUIVRE = USD / tonne
```

Ces deux instruments ne doivent jamais être fusionnés sans conversion et étiquette.

---

# 🧱 8. Architecture zéro coût recommandée

## 8.1 Couche 1 — sans compte et sans clé

À intégrer en premier :

```text
USGS
IEA
RMIS
WORLD BANK
```

Fonctions :

- production ;
- réserves ;
- dépendances ;
- demande ;
- scénarios ;
- criticité ;
- politiques ;
- historique mensuel.

## 8.2 Couche 2 — snapshots gratuits optionnels

Seulement après accord explicite de Christophe :

```text
METALS.DEV FREE
```

Configuration prudente :

```text
1 requête au démarrage du Bridge
1 actualisation manuelle
cache partagé
maximum 3 requêtes par jour
aucune actualisation automatique fréquente
```

Une requête `latest` doit récupérer tous les métaux disponibles en même temps.

## 8.3 Couche 3 — secours quatre métaux précieux

Après vérification écrite des conditions :

```text
GOLDAPI SANDBOX
```

Rôle :

- secours XAU/XAG/XPT/XPD ;
- validation croisée ;
- jamais source cuivre.

## 8.4 Couche 4 — historique XAU/XAG

Option gratuite :

```text
ALPHA VANTAGE
```

Rôle :

- historique journalier XAU/XAG ;
- faible fréquence ;
- test local avant toute publication.

---

# 🚫 9. Ce qu’il ne faut pas faire

Ne pas :

- acheter une formule Twelve Data ;
- acheter une formule Alpha Vantage ;
- acheter une formule API Ninjas ;
- acheter une formule Metals-API ;
- acheter une donnée LBMA, LME ou CME ;
- créer plusieurs comptes gratuits pour contourner les quotas ;
- rafraîchir Metals.Dev chaque minute ;
- exposer une clé dans `app.js` ;
- appeler l’API directement depuis GitHub Pages ;
- stocker une donnée API Ninjas Free ;
- présenter World Bank comme prix actuel ;
- présenter USGS comme prix ;
- mélanger HG COMEX et cuivre LME ;
- nommer une donnée agrégée `LBMA officiel` sans preuve contractuelle.

---

# 🗄️ 10. Politique de cache zéro coût

## Metals.Dev

```text
cache_metals_quotes
durée proposée : plusieurs heures
maximum : 3 rafraîchissements par jour
```

## GoldAPI

```text
cache_metals_precious_quotes
durée proposée : plusieurs heures
maximum : 3 rafraîchissements par jour
```

## Alpha Vantage

```text
cache_metals_daily_history
durée proposée : 24 heures
```

## World Bank

```text
cache_metals_monthly_history
durée proposée : jusqu’à la publication suivante
```

## USGS

```text
cache_metals_structural
durée proposée : jusqu’à la nouvelle version annuelle ou révision
```

## IEA / RMIS

```text
cache_metals_critical_materials
durée proposée : jusqu’à la date de mise à jour officielle
```

---

# 🔌 11. Bridge zéro coût proposé

Aucune route ne doit appeler automatiquement un service payant.

```text
GET /market/metals/free/status
GET /market/metals/free/snapshot
GET /market/metals/free/history
GET /market/metals/public/usgs
GET /market/metals/public/iea
GET /market/metals/public/world-bank
GET /market/metals/public/rmis
```

Réponse :

```json
{
  "ok": true,
  "data": null,
  "source": {
    "id": null,
    "plan": "free",
    "cost_eur": 0,
    "source_time": null,
    "received_at": null,
    "quota_remaining": null,
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

# 🟢 12. Nouvelle classification à appliquer au registre de l’interface

## Candidats zéro coût

```text
Metals.Dev
GoldAPI
Alpha Vantage
```

## Public structurel prêt

```text
USGS
IEA
RMIS
World Bank
FRED
```

## Test seulement

```text
API Ninjas
Twelve Data Basic
```

## Non utilisable gratuitement en public

```text
Metals-API
LBMA direct
LME direct
CME direct
Euronext direct
```

---

# 🛠️ 13. Suite de développement recommandée

## Build 28.2.45 — Free Source Policy & Public Data Foundation

Cette Build ne connecte aucune clé.

Elle doit :

- reclasser les sources du registre ;
- afficher `ZÉRO COÛT`, `TEST SEULEMENT`, `LICENCE REQUISE` ;
- ajouter le coût `0 €` dans les métadonnées ;
- ajouter le statut `COMPTE GRATUIT REQUIS` ;
- ajouter le statut `SANS COMPTE` ;
- préparer les imports USGS, IEA, RMIS et World Bank ;
- ne modifier aucune courbe ;
- ne créer aucune dépense.

## Build 28.2.46 — USGS / IEA / World Bank Public Layer

Sans clé :

- production ;
- réserves ;
- dépendances ;
- criticité ;
- historique mensuel ;
- date de publication ;
- version du document.

## Build ultérieure optionnelle

Seulement après autorisation explicite :

```text
Free Metals Snapshot Pilot
```

avec Metals.Dev Free, quota strict et aucun paiement.

---

# 🤖 14. BLOCK LLM — FREE METALS DATA POLICY

```text
BLOCK_LLM_FREE_METALS_DATA_POLICY_V1

BUDGET
Le budget maximal par défaut pour toute nouvelle source Métaux est 0 €.

AUTORISATION
Ne jamais :
- souscrire ;
- acheter ;
- démarrer un essai payant ;
- fournir une carte bancaire ;
- créer une clé ;
- créer un compte ;
sans instruction explicite de Christophe.

PRIORITÉ
1. Source publique sans compte
2. Source gratuite sans carte
3. Téléchargement officiel versionné
4. Cache local
5. Source payante uniquement comme référence documentaire

ÉTATS
SANS COMPTE
COMPTE GRATUIT REQUIS
ZÉRO COÛT
QUOTA LIMITÉ
TEST SEULEMENT
AFFICHAGE PUBLIC INTERDIT
LICENCE À CONFIRMER
LICENCE REQUISE
SOURCE STRUCTURELLE
SOURCE MACRO
SOURCE DIFFÉRÉE

RÈGLE DE VÉRITÉ
Une source gratuite n’est pas automatiquement libre de redistribution.
Une donnée visible sur un site n’est pas automatiquement réutilisable.
Une clé gratuite n’est pas un abonnement payant.
Un essai gratuit avec carte est refusé.
Un quota gratuit ne doit jamais être contourné.

RÈGLE MÉTAUX
XAU, XAG, XPT et XPD peuvent être exprimés par once troy.
HG COMEX peut être exprimé en USD/livre.
LME Copper peut être exprimé en USD/tonne.
Toujours afficher instrument, unité, devise et source.

RÈGLE API NINJAS FREE
Test uniquement.
Aucun cache.
Aucun stockage.
Aucune production publique.

RÈGLE TWELVE DATA BASIC
Usage personnel/interne.
Aucune redistribution.
Ne pas utiliser dans l’interface publique.

RÈGLE METALS.DEV FREE
Candidat snapshot faible fréquence.
100 appels par mois.
Aucune carte.
Ne jamais lancer de rafraîchissement fréquent.
Surveiller les conditions du plan.

RÈGLE GOLDAPI SANDBOX
Candidat XAU/XAG/XPT/XPD.
100 appels par mois.
Aucune carte.
Licence publique à confirmer avant déploiement.

RÈGLE ALPHA VANTAGE FREE
Candidat XAU/XAG et historique quotidien.
25 appels par jour.
Droit d’affichage public à confirmer.

RÈGLE PUBLIQUE
USGS = structure annuelle.
IEA = scénarios et politiques.
RMIS = criticité européenne.
World Bank = historique mensuel.
FRED = macro, série par série.

FORMAT DE DÉCISION
SOURCE :
COÛT :
CARTE :
COMPTE :
CLÉ :
QUOTA :
MÉTAUX :
TYPE DE DONNÉE :
FRÉQUENCE :
CACHE AUTORISÉ :
AFFICHAGE PUBLIC :
LICENCE :
RISQUE :
DÉCISION :
```

---

# ✅ 15. Décision finale

L’interface Métaux peut progresser sans payer.

La stratégie la plus solide est :

```text
1. USGS + IEA + RMIS + World Bank
2. aucun compte
3. aucune clé
4. données structurelles et historiques
5. Metals.Dev Free seulement en option
6. trois snapshots quotidiens maximum
7. aucune source payante
```

La connexion continue des cinq métaux avec historique intraday ne peut pas être promise gratuitement et durablement.

Le projet doit donc commencer par une couche publique, documentée et stable, puis ajouter éventuellement un snapshot gratuit très limité après accord explicite.

---

# 🔗 16. Sources officielles consultées

## Fournisseurs de cotations

- https://metals.dev/
- https://metals.dev/pricing
- https://metals.dev/docs
- https://metals.dev/policy/terms
- https://www.goldapi.io/
- https://www.alphavantage.co/documentation/
- https://www.alphavantage.co/support/
- https://api-ninjas.com/api/commodityprice
- https://api-ninjas.com/pricing
- https://twelvedata.com/pricing
- https://support.twelvedata.com/en/articles/5332349-commercial-and-personal-usage
- https://www.metals-api.com/pricing
- https://www.metals-api.com/terms

## Sources publiques

- https://pubs.usgs.gov/publication/mcs2026
- https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries
- https://www.iea.org/data-and-statistics/data-tools/critical-minerals-data-explorer
- https://www.iea.org/data-and-statistics/data-tools/critical-minerals-policy-explorer
- https://rmis.jrc.ec.europa.eu/critical-and-strategic-materials
- https://www.worldbank.org/en/research/commodity-markets
- https://fred.stlouisfed.org/docs/api/fred/overview.html
- https://fred.stlouisfed.org/docs/api/terms_of_use.html
