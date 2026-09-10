# Atlas-10 Crypto — Probability Scenario Math

Version : 1.0
Statut : module mathématique spécialisé — scénarios et probabilités pratiques
Projet : Agent-Crypto @erith.IA
Chemin : public/agent_crypto_erith_ia/modules/atlas_probability_scenario_math.md
Rôle : transformer un signal crypto en scénarios prudents, probabilités pratiques, espérance simple et conditions d’invalidation.

---

# 1. Principe central

La probabilité ne donne pas une certitude.

Elle donne une forme à l’incertitude.

Phrase centrale :

```text
Atlas ne dit pas : cela va arriver.
Atlas dit : voici les scénarios, leurs conditions et leurs risques.
```

---

# 2. Trois scénarios obligatoires

Toute hypothèse crypto doit être testée avec au moins trois scénarios :

```text
scenario_favorable
scenario_neutre
scenario_defavorable
```

Un quatrième scénario peut être ajouté :

```text
scenario_rupture
```

pour les événements extrêmes :

```text
crash
pump vertical
news majeure
bug exchange
forte illiquidité
mouvement BTC brutal
```

---

# 3. Variables minimales

```text
hypothese
prix_actuel
prix_cible_favorable
prix_neutre
prix_invalidation
probabilite_favorable
probabilite_neutre
probabilite_defavorable
gain_potentiel
perte_potentielle
frais_total
spread_estime
slippage_estime
horizon_temps
```

Blocage si :

```text
prix_invalidation absent
perte_potentielle absente
horizon_temps absent
```

---

# 4. Probabilités pratiques

Les probabilités pratiques sont des estimations de travail.

Elles ne doivent jamais être présentées comme des vérités.

Règle :

```text
probabilite_favorable + probabilite_neutre + probabilite_defavorable = 100 %
```

Si la somme n’est pas égale à 100 %, Atlas doit corriger ou refuser le calcul.

---

# 5. Espérance simple

```text
esperance_simple =
(probabilite_gain × gain_moyen)
-
(probabilite_perte × perte_moyenne)
```

Version avec scénario neutre :

```text
esperance_simple =
(probabilite_favorable × gain_favorable)
+ (probabilite_neutre × resultat_neutre)
- (probabilite_defavorable × perte_defavorable)
```

Attention :

```text
une espérance positive ne suffit pas à autoriser une transaction.
```

Il faut aussi :

```text
frais acceptables
risque acceptable
liquidité correcte
signal assez fiable
profil de risque compatible
```

---

# 6. Scénario défavorable obligatoire

Atlas doit toujours calculer :

```text
perte_defavorable
perte_defavorable_%
impact_sur_capital
condition_invalidation
```

Formule :

```text
perte_defavorable_% = (prix_actuel - prix_invalidation) / prix_actuel × 100
```

Pour une position acheteuse.

Règle :

```text
si le scénario défavorable est inacceptable, l’action est refusée.
```

---

# 7. Horizon de temps

Un scénario sans horizon est flou.

Exemples :

```text
court terme : minutes / heures
moyen terme : jours
long terme : semaines / mois
```

Règle :

```text
signal court terme ≠ décision long terme
signal long terme ≠ micro-transaction immédiate
```

---

# 8. Score scénario

```text
score_scenario =
esperance_score
+ coherence_score
+ risk_reward_score
+ horizon_score
+ invalidation_score
- incertitude_penalty
- frais_penalty
- fomo_penalty
```

Lecture :

```text
0 à 39 = scénario faible ou dangereux
40 à 59 = observation
60 à 79 = simulation ou prudence
80 à 100 = scénario robuste à vérifier par Risk Math et Execution Math
```

---

# 9. Conditions d’invalidation

Toute hypothèse doit avoir une phrase d’invalidation :

```text
L’hypothèse est invalidée si :
- le prix passe sous ...
- le volume disparaît ;
- le signal contraire apparaît ;
- le spread dépasse ... ;
- BTC casse une zone critique ;
- la news est démentie ;
- la donnée source devient invalide.
```

Sans invalidation :

```text
pas de décision réelle
```

---

# 10. Gates de blocage

Refus ou simulation seulement si :

```text
scénario défavorable absent
prix_invalidation absent
probabilités incohérentes
horizon absent
perte potentielle inconnue
espérance positive mais risque trop élevé
frais supérieurs au gain plausible
signal non confirmé
```

---

# 11. Sortie attendue

```text
## Verdict Probability Scenario Math

Hypothèse :
...

Horizon :
...

Scénario favorable :
prix / gain / probabilité

Scénario neutre :
prix / résultat / probabilité

Scénario défavorable :
prix / perte / probabilité

Espérance simple :
...

Condition d’invalidation :
...

Score scénario :
...

Décision :
observation / simulation / prudence / passer à Risk Math / refus

Raison principale :
...
```

---

# 12. Relation avec Atlas Math Core

Ce module détaille la couche scénarios du fichier central :

```text
atlas_10_crypto_math_core.md
```

Il doit être utilisé après :

```text
atlas_market_math.md
atlas_signal_quality_math.md
```

Et avant :

```text
atlas_risk_math.md
atlas_execution_math.md
```

Il ne donne jamais seul l’autorisation d’agir.
