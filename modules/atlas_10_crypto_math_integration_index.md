# Atlas-10 Crypto — Math Integration Index

Version : 1.0  
Statut : index d’intégration sérieux  
Projet : Agent-Crypto @erith.IA  
Chemin cible : `public/agent_crypto_erith_ia/modules/atlas_10_crypto_math_integration_index.md`  
Langue principale : français  
Nommage : minuscules, snake_case, pas de version dans le nom du fichier  

---

# 1. Rôle du fichier

Ce fichier explique comment intégrer le socle mathématique Atlas-10 Crypto dans l’application Agent-Crypto.

Il ne remplace pas :

```text
atlas_10_crypto_math_core.md
atlas_10_crypto_math_modules_map.md
```

Il sert à dire :

```text
où brancher les modules ;
dans quels écrans ;
avec quelles données ;
avec quelles sorties ;
avec quels verrous ;
dans quel ordre de priorité.
```

Phrase centrale :

```text
Le Core fonde.
La Map route.
Les modules calculent.
L’Index d’intégration branche tout dans l’interface.
```

---

# 2. Fichiers mathématiques concernés

## 2.1. Socle central

```text
atlas_10_crypto_math_core.md
```

Rôle :

```text
socle mathématique central pour observation, scoring, simulation, conseil privé,
préparation théorique de micro-transactions et exécution future sous backend sécurisé.
```

## 2.2. Routage mathématique

```text
atlas_10_crypto_math_modules_map.md
```

Rôle :

```text
ordre de chargement, table de routage, gates, règles anti-FOMO, micro-transactions,
modes observation / simulation / conseil privé / préparation / exécution.
```

## 2.3. Modules spécialisés

```text
atlas_market_math.md
atlas_signal_quality_math.md
atlas_probability_scenario_math.md
atlas_risk_math.md
atlas_micro_transaction_math.md
atlas_execution_math.md
```

---

# 3. Écrans Agent-Crypto à connecter

Les écrans existants ou prévus doivent recevoir la couche mathématique selon cette logique :

```text
Livecheck
Débutant
Marché
Watchlist
Analyste
Situation
Questionnaire
Briefing
Impact
Backend
Sécurité
Simulation
Tests
Plan
Math Model
Risques
No-FOMO
Sources
```

---

# 4. Table d’intégration par écran

| Écran | Modules math à brancher | Rôle dans l’écran | Sortie attendue |
|---|---|---|---|
| Livecheck | `atlas_market_math.md` + Data Quality Gate | vérifier si les données sont fraîches et exploitables | état des données : ok / faible / refus |
| Marché | `atlas_market_math.md` | lire prix, variation, volume, volatilité, liquidité | score marché |
| Watchlist | `atlas_market_math.md` + `atlas_signal_quality_math.md` | classer les actifs surveillés | priorité de surveillance |
| Analyste | market + signal + scenario | transformer les données en hypothèses | hypothèse + scénarios |
| Situation | risk + portfolio futur | exposer état capital / risque / exposition | état prudent |
| Questionnaire | Risk Profile Gate | définir limites privées | profil de risque exploitable |
| Briefing | market + signal + scenario | produire synthèse claire | briefing prudent |
| Impact | scenario + risk | expliquer effet possible d’une action | impact capital / risque |
| Backend | Exchange Constraint Gate + Execution Math | préparer futur backend privé | contraintes techniques |
| Sécurité | Risk Profile Gate + Execution Math | afficher verrous, limites, kill switch | statut sécurité |
| Simulation | scenario + risk + micro | tester sans capital réel | résultat simulé |
| Tests | paper trading futur + scenario | journaliser essais | taux de réussite / erreurs |
| Plan | map + core | expliquer architecture | plan de chargement |
| Math Model | tous les modules math | écran central de lecture mathématique | verdict complet Atlas Math |
| Risques | `atlas_risk_math.md` | risque, drawdown, exposition, refus | score risque |
| No-FOMO | market + signal + execution | détecter urgence émotionnelle / achat tardif | ralentir / refuser |
| Sources | signal + data quality | tracer les sources | confiance / contradiction |

---

# 5. Ordre de traitement dans l’application

Pour une analyse complète, l’application doit suivre cet ordre :

```text
1. récupérer les données
2. vérifier la qualité des données
3. lire le marché
4. qualifier le signal
5. construire les scénarios
6. calculer le risque
7. tester la micro-transaction
8. passer au gate d’exécution
9. produire le verdict
10. journaliser
```

Chaîne :

```text
data
→ market
→ signal
→ scenario
→ risk
→ micro_transaction
→ execution
→ memory
```

---

# 6. Data Layer

La couche données doit alimenter les modules avec :

```text
asset
prix_actuel
timestamp
source_prix
prix_24h
prix_7j
prix_30j
volume_24h
volume_moyen_7j
plus_haut_periode
plus_bas_periode
spread_estime
liquidite_estimee
frais_estimes
minimum_exchange
```

Statut possible des données :

```text
ok
faible
incomplète
contradictoire
périmée
absente
```

Règle :

```text
donnée faible → score faible.
donnée absente → observation seulement ou refus.
```

---

# 7. Math Layer

La couche mathématique transforme les données en scores.

Scores principaux :

```text
score_market
score_signal_quality
score_scenario
score_risque
score_micro_transaction
score_execution
```

Aucun score ne doit être affiché comme une vérité absolue.

Chaque score doit être accompagné de :

```text
raison principale
données utilisées
limite connue
niveau de confiance
mode autorisé
```

---

# 8. Decision Layer

La décision finale doit toujours passer par :

```text
atlas_execution_math.md
```

Décisions possibles :

```text
observation
simulation
conseil_prive
preparation_seulement
feu_orange
feu_vert
refus
kill_switch
```

Règle :

```text
une décision sans raison affichée est invalide.
```

---

# 9. UI Layer

L’interface ne doit pas noyer l’utilisateur.

Chaque écran doit afficher :

```text
1. verdict court
2. raison principale
3. score utile
4. risque principal
5. action autorisée
6. mémoire à enregistrer
```

Exemple d’affichage simple :

```text
Verdict : simulation seulement
Raison : frais trop élevés pour le montant
Score micro-transaction : 38 / 100
Risque principal : seuil de rentabilité supérieur au gain cible
Action autorisée : tester en simulation, ne pas préparer d’ordre réel
```

---

# 10. Intégration écran Math Model

L’écran Math Model devient le centre de lecture.

Il doit afficher :

```text
Data Quality Gate
Market Math
Signal Quality
Scenario Math
Risk Math
Micro-Transaction Math
Execution Math
Verdict final
```

Format recommandé :

```text
# Math Model

## Données
...

## Marché
...

## Signal
...

## Scénarios
...

## Risque
...

## Micro-transaction
...

## Exécution
...

## Verdict Atlas
...
```

---

# 11. Intégration écran Simulation

L’écran Simulation utilise :

```text
atlas_probability_scenario_math.md
atlas_risk_math.md
atlas_micro_transaction_math.md
atlas_execution_math.md
```

Il ne doit jamais envoyer d’ordre réel.

Il produit :

```text
capital fictif
montant simulé
prix simulé
frais simulés
gain/perte simulé
score execution simulé
leçon
```

Règle :

```text
simulation réussie ≠ autorisation réelle.
```

---

# 12. Intégration écran Risques

L’écran Risques utilise :

```text
atlas_risk_math.md
atlas_execution_math.md
```

Il affiche :

```text
capital autorisé
capital utilisable
exposition par actif
exposition totale
perte maximale opération
perte maximale jour
drawdown
score risque
statut kill switch
```

Phrase écran :

```text
Le risque est lu avant l’opportunité.
```

---

# 13. Intégration écran No-FOMO

L’écran No-FOMO utilise :

```text
atlas_market_math.md
atlas_signal_quality_math.md
atlas_execution_math.md
```

Il surveille :

```text
hausse verticale
volume exceptionnel
prix proche du plus haut
urgence émotionnelle
signal social euphorique
absence d’invalidation
frais non calculés
```

Sorties :

```text
continuer
ralentir
attendre
simulation seulement
refus
```

Phrase écran :

```text
Le signal peut être réel, mais l’entrée peut être trop tardive.
```

---

# 14. Intégration Backend

Le backend futur ne doit pas être un simple relais d’ordres.

Il doit contenir :

```text
clés API protégées
profil de risque privé
logs
limites par jour
limites par semaine
limites par actif
minimum exchange
contrôle frais
contrôle spread
kill switch
audit incident
```

Règle :

```text
GitHub Pages ne doit jamais contenir de clé API privée ni exécuter d’ordre réel.
```

---

# 15. Intégration Sécurité

L’écran Sécurité affiche :

```text
backend privé : absent / présent / validé
clés API : absentes / protégées / erreur
logs : actifs / absents
kill switch : actif / inactif
profil de risque : défini / incomplet
limites : définies / incomplètes
mode réel : interdit / autorisé sous conditions
```

Décision :

```text
si un verrou critique est absent → exécution réelle interdite.
```

---

# 16. Mémoire et journalisation

Chaque verdict important doit être journalisé.

Format minimal :

```text
date
actif
mode
données disponibles
hypothèse
scores
risque principal
décision
raison principale
action autorisée
résultat futur
leçon
```

But :

```text
Atlas apprend par mémoire, pas par impression.
```

---

# 17. Relation avec l’intuition

Atlas ne méprise pas l’intuition.

Il la transforme en hypothèse testable.

```text
intuition
→ hypothèse
→ données à vérifier
→ score
→ risque
→ décision
```

Phrase centrale :

```text
L’intuition ouvre la porte.
Les mathématiques vérifient le sol.
Le risque décide si l’on avance.
La mémoire apprend du chemin.
```

---

# 18. Priorités de développement

## Priorité 1 — branchement lecture seule

```text
Math Model
Simulation
Risques
No-FOMO
```

Objectif :

```text
afficher les verdicts sans aucune action réelle.
```

## Priorité 2 — journalisation

```text
logs locaux
mémoire de décision
historique des simulations
erreurs récurrentes
```

## Priorité 3 — contraintes exchange

```text
minimum d’ordre
frais
spread
slippage
limites API
```

## Priorité 4 — backend privé

```text
clés protégées
profil de risque
logs
kill switch
préparation d’ordre
```

## Priorité 5 — exécution réelle future

Uniquement si toutes les couches précédentes sont validées.

---

# 19. Règles de non-dispersion

Ne pas créer de nouveau module tant que les écrans suivants ne savent pas lire le socle :

```text
Math Model
Simulation
Risques
No-FOMO
```

Ne pas ajouter RSI, MACD, Bollinger, IA prédictive ou backtesting avancé avant :

```text
data quality
risk profile
exchange constraints
execution gate
journalisation
```

Règle :

```text
un projet crypto sérieux commence par ses freins.
```

---

# 20. Statut de la V1

La V1 de l’intégration est complète lorsque :

```text
atlas_10_crypto_math_core.md existe
atlas_10_crypto_math_modules_map.md existe
les six modules spécialisés existent
cet index existe
l’interface sait où brancher Math Model, Simulation, Risques et No-FOMO
```

Statut actuel attendu :

```text
prêt pour intégration lecture seule.
exécution réelle interdite.
```

---

# 21. Changelog interne

## Version 1.0

Création de l’index d’intégration.

Ajouts :

```text
table écran → module
ordre de traitement
data layer
math layer
decision layer
ui layer
intégration Math Model
intégration Simulation
intégration Risques
intégration No-FOMO
intégration Backend
intégration Sécurité
journalisation
priorités de développement
```
