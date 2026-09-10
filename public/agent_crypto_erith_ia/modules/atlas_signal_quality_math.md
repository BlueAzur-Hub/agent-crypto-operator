# Atlas-10 Crypto — Signal Quality Math

Version : 1.0
Statut : module mathématique spécialisé — qualité du signal
Projet : Agent-Crypto @erith.IA
Chemin : public/agent_crypto_erith_ia/modules/atlas_signal_quality_math.md
Rôle : mesurer si un signal crypto est assez propre, concordant et robuste pour être utilisé par Atlas-10.

---

# 1. Principe central

Un signal n’est pas bon parce qu’il est excitant.

Un signal est bon s’il est :

```text
sourcé
mesurable
concordant
récent
non contradictoire
compatible avec le risque
```

Phrase centrale :

```text
Un signal faible peut ouvrir une hypothèse.
Il ne doit jamais ouvrir directement une transaction.
```

---

# 2. Types de signaux

```text
signal_prix
signal_volume
signal_tendance
signal_liquidite
signal_news
signal_sentiment
signal_technique
signal_onchain
signal_macro
signal_portefeuille
signal_intuitif
```

Le signal intuitif est autorisé comme déclencheur de recherche.

Il n’est jamais suffisant comme preuve.

---

# 3. Variables minimales

```text
nom_signal
type_signal
source_signal
timestamp_signal
actif_concerne
sens_signal
force_signal
données_appui
données_contraires
niveau_confiance_source
niveau_concordance
niveau_bruit
```

Blocage si :

```text
source_signal absente
timestamp_signal absent
actif_concerne absent
```

---

# 4. Score de source

Échelle :

```text
0 = source inconnue ou douteuse
25 = source faible
50 = source correcte mais unique
75 = source fiable
100 = source fiable + vérifiable + historique correct
```

Critères :

```text
fiabilité
réputation
traçabilité
fraîcheur
historique
indépendance
```

---

# 5. Concordance

```text
concordance_% = signaux_confirmants / signaux_totaux × 100
```

Exemple :

```text
3 signaux confirmants sur 5 = 60 %
```

Lecture :

```text
0 à 39 % = signal fragile
40 à 59 % = signal mitigé
60 à 79 % = signal intéressant
80 à 100 % = signal fortement concordant
```

Attention :

Des sources qui se copient entre elles ne comptent pas comme indépendantes.

---

# 6. Bruit et contradiction

```text
bruit_score = signaux_inutiles + signaux_flous + signaux_non_sourcés
```

```text
contradiction_score = signaux_contraires / signaux_totaux × 100
```

Règle :

```text
contradiction élevée = prudence ou refus
bruit élevé = score signal réduit
```

---

# 7. Fraîcheur du signal

```text
age_signal = temps_actuel - timestamp_signal
```

Lecture :

```text
signal très récent = utile mais possiblement instable
signal ancien = peut être déjà intégré au prix
signal périmé = refus
```

Un signal news en crypto peut devenir vieux très vite.

---

# 8. Signal Quality Score

Formule de travail :

```text
score_signal_quality =
source_score
+ concordance_score
+ fraicheur_score
+ data_support_score
+ coherence_market_score
- bruit_penalty
- contradiction_penalty
- fomo_penalty
```

Échelle :

```text
0 à 39 = signal faible
40 à 59 = signal à surveiller
60 à 79 = signal exploitable en simulation ou prudence
80 à 100 = signal fort, à vérifier par Risk Math
```

---

# 9. Signal intuitif

Atlas doit respecter l’intuition de Christophe comme point de départ.

Mais il doit la transformer en hypothèse :

```text
intuition → hypothèse → données → vérification → décision
```

Format :

```text
Intuition :
...

Hypothèse testable :
...

Données à vérifier :
...

Signal confirmé ?
oui / non / insuffisant
```

Règle :

```text
L’intuition ouvre la recherche.
Les données décident de la suite.
```

---

# 10. Gates de blocage

Refus ou observation seulement si :

```text
source absente
source douteuse
timestamp absent
signal périmé
concordance faible
contradiction élevée
données de marché opposées
fomo détecté
signal uniquement émotionnel
```

---

# 11. Sortie attendue

```text
## Verdict Signal Quality Math

Signal :
...

Type :
...

Source :
...

Âge :
...

Concordance :
...

Contradiction :
...

Bruit :
...

Score qualité signal :
...

Décision :
ignorer / surveiller / simulation / exploitable sous contrôle / refus

Hypothèse testable :
...

Données à vérifier ensuite :
...
```

---

# 12. Relation avec Atlas Math Core

Ce module détaille la qualité du signal du fichier central :

```text
atlas_10_crypto_math_core.md
```

Il doit être utilisé après Market Math et avant Risk Math.

Il ne valide pas une transaction.

Il valide seulement si le signal mérite de passer à l’étape suivante.
