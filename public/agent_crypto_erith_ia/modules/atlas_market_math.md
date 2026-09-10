# Atlas-10 Crypto — Market Math

Version : 1.0
Statut : module mathématique spécialisé — lecture du marché
Projet : Agent-Crypto @erith.IA
Chemin : public/agent_crypto_erith_ia/modules/atlas_market_math.md
Rôle : transformer les données de marché en indicateurs lisibles, prudents et exploitables par Atlas-10 Crypto.

---

# 1. Principe central

Atlas Market Math ne prédit pas l’avenir.

Il mesure l’état observable du marché.

Formule de conduite :

```text
prix → variation → volume → liquidité → volatilité → momentum → contexte
```

Règle :

```text
Un signal de marché n’est pas une décision.
Un signal de marché est une hypothèse à vérifier.
```

---

# 2. Variables minimales

```text
asset
prix_actuel
prix_reference
prix_24h
prix_7j
prix_30j
plus_haut_periode
plus_bas_periode
volume_24h
volume_moyen_7j
spread_estime
liquidite_estimee
timestamp
source_prix
```

Blocage si :

```text
prix_actuel absent
timestamp absent
source_prix absente
volume_24h absent
```

Dans ce cas :

```text
observation seulement
```

---

# 3. Variation de prix

```text
variation_% = (prix_actuel - prix_reference) / prix_reference × 100
```

Usages :

```text
variation_24h
variation_7j
variation_30j
```

Interprétation simple :

```text
variation positive = prix supérieur à la référence
variation négative = prix inférieur à la référence
variation extrême = prudence, possible retard ou FOMO
```

---

# 4. Momentum simple

Le momentum mesure la direction récente.

Formule de travail :

```text
momentum_court = variation_24h
momentum_moyen = variation_7j
momentum_long = variation_30j
```

Lecture :

```text
momentum_court > 0 et momentum_moyen > 0
= tendance positive possible

momentum_court < 0 et momentum_moyen < 0
= tendance négative possible

momentum_court très positif après forte hausse
= risque FOMO
```

---

# 5. Volume relatif

```text
volume_relatif = volume_24h / volume_moyen_7j
```

Lecture :

```text
volume_relatif < 0.7 = volume faible
0.7 à 1.3 = volume normal
1.3 à 2.5 = volume élevé
> 2.5 = volume exceptionnel, prudence
```

Attention :

```text
volume élevé + prix vertical = possible emballement
volume élevé + retournement = possible phase critique
volume faible = signal fragile
```

---

# 6. Volatilité simple

Méthode minimale :

```text
amplitude_% = (plus_haut_periode - plus_bas_periode) / prix_actuel × 100
```

Lecture :

```text
amplitude faible = marché calme
amplitude moyenne = marché actif
amplitude forte = marché instable
amplitude extrême = risque élevé
```

La volatilité ne dit pas quoi faire.

Elle dit combien le sol bouge.

---

# 7. Liquidité et spread

```text
spread_% = (prix_ask - prix_bid) / prix_mid × 100
```

Si seules des données approximatives existent :

```text
spread_estime_% = écart achat / vente estimé
```

Règle :

```text
spread élevé = micro-transaction dangereuse
liquidité faible = slippage probable
```

Blocage si :

```text
spread inconnu pour préparation d’ordre réel
liquidité inconnue pour préparation d’ordre réel
```

---

# 8. Distance au plus haut / plus bas

```text
distance_plus_haut_% = (plus_haut_periode - prix_actuel) / plus_haut_periode × 100
```

```text
distance_plus_bas_% = (prix_actuel - plus_bas_periode) / plus_bas_periode × 100
```

Usage :

```text
prix proche du plus haut + hausse rapide = risque d’achat tardif
prix proche du plus bas + volume faible = pas forcément opportunité
prix entre deux zones = attendre confirmation
```

---

# 9. Score Market Math

Échelle :

```text
0 = marché illisible ou dangereux
50 = marché neutre / exploitable seulement en observation
100 = marché lisible avec conditions favorables
```

Formule de travail :

```text
score_market =
momentum_score
+ volume_score
+ liquidite_score
+ spread_score
+ volatilite_score
+ contexte_score
- fomo_penalty
- data_quality_penalty
```

Lecture :

```text
0 à 39 = marché trop faible ou trop risqué
40 à 59 = observation / simulation
60 à 79 = signal exploitable sous contrôle
80 à 100 = signal fort, à vérifier par Risk Math et Execution Math
```

---

# 10. Pénalités principales

```text
fomo_penalty
= hausse verticale + volume exceptionnel + prix proche du plus haut
```

```text
liquidite_penalty
= volume faible ou spread élevé
```

```text
volatilite_penalty
= amplitude trop forte pour le profil de risque
```

```text
data_quality_penalty
= données manquantes, anciennes ou contradictoires
```

---

# 11. Gates de blocage

Atlas Market Math bloque si :

```text
prix absent
source absente
timestamp absent
volume absent
spread inconnu pour réel
liquidité inconnue pour réel
données contradictoires non expliquées
variation extrême sans contexte
```

Blocage ne veut pas dire “marché mauvais”.

Blocage veut dire :

```text
les données ne permettent pas de décider proprement
```

---

# 12. Sortie attendue

```text
## Verdict Market Math

Actif :
...

Prix actuel :
...

Variation 24h :
...

Variation 7j :
...

Variation 30j :
...

Volume relatif :
...

Volatilité simple :
...

Spread estimé :
...

Liquidité estimée :
...

Score Market :
...

Décision :
observation / signal faible / signal exploitable / prudence / refus marché

Raison principale :
...
```

---

# 13. Relation avec Atlas Math Core

Ce module détaille la lecture du marché du fichier central :

```text
atlas_10_crypto_math_core.md
```

Il doit être chargé avant :

```text
atlas_signal_quality_math.md
atlas_probability_scenario_math.md
atlas_risk_math.md
atlas_execution_math.md
```

Il ne décide jamais seul d’une transaction.
