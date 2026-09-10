# Atlas-10 Crypto — Math Modules Map

Version : 1.0  
Statut : fichier maître de routage mathématique  
Projet : Agent-Crypto @erith.IA  
Chemin cible : `public/agent_crypto_erith_ia/modules/atlas_10_crypto_math_modules_map.md`  
Langue principale : français  
Nommage : minuscules, snake_case, pas de version dans le nom du fichier  

---

# 1. Rôle du fichier

Ce fichier n’est pas un simple sommaire.

Il est la carte de routage mathématique d’Atlas-10 Crypto.

Il indique :

- quel module charger ;
- dans quel ordre ;
- pour quel type de question ;
- avec quels verrous ;
- quelles sorties attendre ;
- quel module a le droit de décider ;
- quelles limites ne doivent jamais être franchies.

Phrase centrale :

```text
La map route.
Le core fonde.
Les modules calculent.
Execution Math décide.
Atlas garde la mémoire.
```

---

# 2. Socle central

Le socle mathématique central est :

```text
atlas_10_crypto_math_core.md
```

Rôle :

```text
base mathématique centrale pour observation, scoring, simulation, conseil privé,
préparation de micro-transactions et exécution future sous backend sécurisé.
```

Ce fichier reste la colonne vertébrale.

Les modules satellites détaillent les zones spécialisées.

---

# 3. Modules mathématiques spécialisés

Modules actifs de la V1 :

```text
atlas_market_math.md
atlas_signal_quality_math.md
atlas_probability_scenario_math.md
atlas_risk_math.md
atlas_micro_transaction_math.md
atlas_execution_math.md
```

Ordre logique :

```text
1. atlas_market_math.md
2. atlas_signal_quality_math.md
3. atlas_probability_scenario_math.md
4. atlas_risk_math.md
5. atlas_micro_transaction_math.md
6. atlas_execution_math.md
```

Chaîne de décision :

```text
marché
→ signal
→ scénario
→ risque
→ micro-transaction
→ exécution / refus / kill switch
```

---

# 4. Table de routage rapide

| Question utilisateur | Modules à charger | Décision finale |
|---|---|---|
| Que montre le marché ? | `atlas_market_math.md` | observation seulement |
| Ce signal est-il fiable ? | `atlas_market_math.md` + `atlas_signal_quality_math.md` | pas de transaction |
| Est-ce une opportunité plausible ? | `atlas_market_math.md` + `atlas_signal_quality_math.md` + `atlas_probability_scenario_math.md` | simulation ou passage au risque |
| Combien peut-on perdre ? | `atlas_risk_math.md` | jamais seul pour action |
| Cette micro-transaction vaut-elle le coût ? | `atlas_micro_transaction_math.md` + `atlas_risk_math.md` | passage à execution |
| Puis-je préparer un ordre ? | tous les modules nécessaires + `atlas_execution_math.md` | préparation seulement |
| Puis-je exécuter réellement ? | tous les modules + backend privé + logs + kill switch | seulement si autorisé |
| Dois-je arrêter ? | `atlas_execution_math.md` + `atlas_risk_math.md` | refus ou kill switch |

---

# 5. Règle de décision

Aucun module spécialisé ne décide seul.

La seule couche qui transforme les scores en décision opérationnelle est :

```text
atlas_execution_math.md
```

Même en cas de signal fort :

```text
signal fort ≠ action
signal fort = hypothèse à vérifier
```

Formule de conduite :

```text
intuition
→ hypothèse
→ données
→ calcul
→ scénario
→ risque
→ coûts
→ décision
→ mémoire
```

---

# 6. Rôle de chaque module

## 6.1. atlas_market_math.md

Rôle :

```text
lire le marché observable.
```

Il mesure :

- prix actuel ;
- variation 24h / 7j / 30j ;
- momentum ;
- volume relatif ;
- volatilité ;
- spread ;
- liquidité ;
- distance au plus haut / plus bas.

Il répond à :

```text
Le marché est-il lisible ?
Le mouvement est-il normal, faible, fort ou dangereux ?
Le prix est-il déjà trop vertical ?
La liquidité permet-elle de réfléchir sérieusement ?
```

Il ne répond pas à :

```text
Faut-il acheter ?
Faut-il vendre ?
Faut-il exécuter ?
```

---

## 6.2. atlas_signal_quality_math.md

Rôle :

```text
évaluer la qualité d’un signal.
```

Il mesure :

- source ;
- fraîcheur ;
- concordance ;
- contradiction ;
- bruit ;
- niveau de confiance ;
- signal intuitif transformé en hypothèse testable.

Il répond à :

```text
Le signal mérite-t-il une vérification ?
Les sources sont-elles assez propres ?
Le signal est-il seulement émotionnel ?
```

Il ne répond pas à :

```text
Le signal suffit-il à agir ?
```

---

## 6.3. atlas_probability_scenario_math.md

Rôle :

```text
transformer une hypothèse en scénarios.
```

Il construit :

- scénario favorable ;
- scénario neutre ;
- scénario défavorable ;
- scénario de rupture si nécessaire ;
- probabilité pratique ;
- espérance simple ;
- condition d’invalidation.

Il répond à :

```text
Quelle est l’hypothèse ?
Que se passe-t-il si elle échoue ?
Quelle perte devient inacceptable ?
Quel horizon de temps est visé ?
```

Il ne répond pas à :

```text
Cette espérance suffit-elle à agir ?
```

---

## 6.4. atlas_risk_math.md

Rôle :

```text
protéger le capital.
```

Il calcule :

- capital utilisable ;
- perte maximale ;
- risque par opération ;
- exposition par actif ;
- exposition totale ;
- drawdown ;
- risk/reward net ;
- score de risque.

Il répond à :

```text
La perte possible est-elle acceptable ?
Le capital est-il trop exposé ?
Le drawdown impose-t-il une pause ?
```

Il peut bloquer l’action.

---

## 6.5. atlas_micro_transaction_math.md

Rôle :

```text
déterminer si une micro-transaction mérite d’exister.
```

Il calcule :

- frais en pourcentage ;
- spread ;
- slippage ;
- seuil de rentabilité ;
- taille minimale utile ;
- coût de suractivité ;
- minimum exchange ;
- score micro-transaction.

Il répond à :

```text
Les frais détruisent-ils l’opération ?
La transaction est-elle trop petite pour être rationnelle ?
Le gain cible dépasse-t-il vraiment les coûts ?
```

Il peut bloquer l’action.

---

## 6.6. atlas_execution_math.md

Rôle :

```text
dernier verrou décisionnel.
```

Il produit :

- feu vert ;
- feu orange ;
- simulation seulement ;
- préparation seulement ;
- refus ;
- kill switch.

Il vérifie :

- Data Quality Gate ;
- Exchange Constraint Gate ;
- Risk Profile Gate ;
- risque ;
- frais ;
- FOMO ;
- mode autorisé ;
- backend privé ;
- logs ;
- kill switch.

Il est le seul module de décision finale.

---

# 7. Modes de fonctionnement

Atlas-10 Crypto peut fonctionner selon cinq modes :

```text
observation
simulation
conseil_prive
preparation_ordre
execution_reelle
```

## 7.1. observation

Autorisé avec données incomplètes si elles sont clairement marquées.

```text
objectif : comprendre
risque : aucun ordre
sortie : lecture prudente
```

## 7.2. simulation

Autorisé sans backend privé.

```text
objectif : tester une hypothèse
risque : aucun capital réel
sortie : scénario, score, résultat simulé
```

## 7.3. conseil_prive

Autorisé uniquement dans le cadre privé défini par Christophe.

```text
objectif : recommander ou déconseiller
risque : influence sur capital réel
sortie : avis prudent, chiffré, journalisé
```

## 7.4. preparation_ordre

Autorisé uniquement si les gates sont validés.

```text
objectif : préparer une action
risque : proche du réel
sortie : ordre préparé mais non exécuté
```

## 7.5. execution_reelle

Interdite sans :

```text
backend privé sécurisé
clés protégées
logs
limites
profil de risque
kill switch
contrôle exchange
journalisation complète
```

---

# 8. Gates obligatoires

## 8.1. Data Quality Gate

Vérifie :

```text
prix actuel
timestamp
source
volume
spread
liquidité
frais
prix de référence
```

Blocage si :

```text
données absentes
données anciennes
données contradictoires
source douteuse
```

---

## 8.2. Exchange Constraint Gate

Vérifie :

```text
minimum d’ordre
frais maker/taker
paire disponible
liquidité
spread
slippage
limites API
règles d’arrondi
```

Blocage si :

```text
montant inférieur au minimum
frais disproportionnés
paire non validée
limite API proche
règles inconnues
```

---

## 8.3. Risk Profile Gate

Vérifie :

```text
capital autorisé
perte maximale par opération
perte maximale par jour
perte maximale par semaine
exposition maximale par actif
exposition maximale totale
nombre maximal d’ordres
mode autorisé
```

Blocage si :

```text
profil absent
perte maximale absente
capital autorisé absent
mode non autorisé
```

---

# 9. Formules maîtresses

```text
variation_% = (prix_actuel - prix_reference) / prix_reference × 100
```

```text
frais_% = frais_total / montant_transaction × 100
```

```text
seuil_rentabilite_% = frais_% + spread_% + slippage_% + marge_securite_%
```

```text
risque_operation_euros = montant_position × abs(prix_entree - prix_invalidation) / prix_entree
```

```text
exposition_actif_% = montant_expose_actif / capital_autorise × 100
```

```text
drawdown_% = (capital_max_observe - capital_actuel) / capital_max_observe × 100
```

```text
esperance_simple =
(probabilite_favorable × gain_favorable)
+ (probabilite_neutre × resultat_neutre)
- (probabilite_defavorable × perte_defavorable)
```

```text
score_execution =
score_signal
+ score_micro_transaction
+ score_data_quality
- score_risque
- score_frais
- score_fomo
- penalites_critiques
```

---

# 10. Règles anti-FOMO

Atlas doit bloquer ou ralentir si :

```text
hausse verticale
volume exceptionnel non expliqué
prix proche d’un plus haut
signal social trop euphorique
urgence émotionnelle
peur de rater
absence d’invalidation
frais non calculés
risque non accepté
```

Phrase obligatoire en cas de FOMO :

```text
Le signal peut être réel, mais l’entrée peut être trop tardive.
Atlas demande vérification, simulation ou attente.
```

---

# 11. Règles de micro-transaction

Une micro-transaction est refusée si :

```text
frais_% trop élevé
spread inconnu
slippage inconnu
montant inférieur au minimum exchange
gain cible inférieur au seuil de rentabilité
taille minimale utile non atteinte
suractivité détectée
profil de risque absent
```

Phrase centrale :

```text
Une petite transaction peut être une grosse erreur si les coûts sont proportionnellement trop élevés.
```

---

# 12. Règles de journalisation

Chaque décision doit produire une mémoire exploitable.

Champs minimaux :

```text
date
actif
mode
hypothèse
prix actuel
signal
scénario
risque
frais
score execution
décision
raison principale
résultat futur
erreur éventuelle
leçon
```

But :

```text
apprendre sans réécrire l’histoire
```

---

# 13. Format de réponse Atlas Math

```text
# Atlas Math Verdict

## Mode demandé
...

## Mode autorisé
...

## Données disponibles
...

## Market Math
...

## Signal Quality
...

## Scenario Math
...

## Risk Math
...

## Micro-Transaction Math
...

## Execution Math
...

## Décision
feu vert / feu orange / simulation seulement / préparation seulement / refus / kill switch

## Raison principale
...

## Action autorisée
...

## Mémoire à enregistrer
...
```

---

# 14. Règle de chargement minimal

Ne pas charger tout par réflexe.

```text
question marché simple
→ atlas_market_math.md

question signal
→ atlas_market_math.md + atlas_signal_quality_math.md

question opportunité
→ market + signal + scenario

question risque
→ risk

question micro-transaction
→ micro_transaction + risk + execution

question décision réelle
→ tous les modules nécessaires + execution + backend privé
```

Règle :

```text
Disponible ne veut pas dire chargé.
Chargé ne veut pas dire autorisé à décider.
```

---

# 15. Relation avec Math Oracle

Les modules Math Oracle généraux restent les sources méthodologiques :

```text
math_oracle_fr_source.md
math_oracle_research_fr_source.md
math_oracle_production_ia_fr_source.md
math_oracle_creatif_fr_source.md
```

Ils apportent :

```text
clarté mathématique
prudence scientifique
probabilités
statistiques
optimisation
tests contrôlés
décision d’arrêt
lisibilité visuelle
```

Atlas Crypto Math ajoute la couche financière spécialisée :

```text
capital
risque
frais
micro-transactions
exchange constraints
scoring
execution gate
kill switch
```

---

# 16. Décision finale de la V1

La V1 mathématique d’Atlas-10 Crypto est considérée structurée lorsque les fichiers suivants sont présents :

```text
atlas_10_crypto_math_core.md
atlas_10_crypto_math_modules_map.md
atlas_market_math.md
atlas_signal_quality_math.md
atlas_probability_scenario_math.md
atlas_risk_math.md
atlas_micro_transaction_math.md
atlas_execution_math.md
```

Statut :

```text
socle mathématique V1 exploitable en observation, simulation, conseil privé et préparation théorique.
exécution réelle interdite sans backend privé sécurisé.
```

---

# 17. Changelog interne

## Version 1.0

Création du fichier maître de routage mathématique.

Ajouts :

```text
socle central
modules spécialisés
ordre de chargement
table de routage
gates obligatoires
règles anti-FOMO
règles micro-transaction
format de réponse Atlas Math
relation avec Math Oracle
```
