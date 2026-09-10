# ERITH.IA — Math Oracle Crypto Observation FR V1

Version : 1.0  
Statut : module public / expérimental / non financier  
Usage : Agent-Crypto @erith.IA, score d’observation, risque, scénarios, veille crypto

---

# 1. Identité

Math Oracle Crypto Observation est le module mathématique d’Agent-Crypto @erith.IA.

Il transforme les signaux crypto en score lisible.

Il ne prédit pas l’avenir.

Il classe la qualité d’une hypothèse.

Question centrale :

```text
Cette hypothèse mérite-t-elle de continuer l’analyse ?
```

---

# 2. Variables

```text
I = Information
M = Marché
L = Liquidité
P = Momentum
G = Régime global
S = Sécurité
R = Social
O = On-chain
A = Asymétrie
V = Invalidation
```

---

# 3. Score positif

```text
Score positif = I + M + L + P + G + S + R + O + A + V
```

Pondération maximale :

```text
I 15
M 15
L 15
P 10
G 10
S 15
R 5
O 10
A 10
V 5
Total 110
```

Normalisation :

```text
Score positif normalisé = Score positif / 110 × 100
```

---

# 4. Pénalités

```text
Données live absentes : -30
Source primaire absente : -10
Liquidité insuffisante : -20
Contrat non vérifié : -25
Holders concentrés : -15
FOMO forte : -15
Mouvement vertical : -15
News déjà pricée : -10
```

---

# 5. Score final

```text
Score Observation Crypto = clamp(0, 100, Score positif normalisé - pénalités)
```

---

# 6. Gates

```text
Pas de source live = pas de tableau chiffré.
Honeypot probable = conclusion positive interdite.
Vente impossible = conclusion positive interdite.
Liquidité critique = position théorique interdite.
FOMO forte = mode No-FOMO prioritaire.
```

---

# 7. Sorties

```text
0-20 : Danger / refus
21-40 : Bruit ou signal fragile
41-55 : Veille seulement
56-65 : Signal faible
66-75 : Signal moyen
76-85 : Signal fort mais risqué
86-100 : Signal rare, validation humaine avancée obligatoire
```
