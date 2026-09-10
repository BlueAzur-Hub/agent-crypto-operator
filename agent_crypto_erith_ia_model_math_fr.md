# Agent-Crypto @erith.IA — Modèle mathématique FR

Version : 0.2  
Statut : modèle d’observation prudent / non financier

---

# 1. Principe

Le modèle mathématique ne prédit pas l’avenir.

Il mesure la qualité d’une hypothèse de veille.

Il répond :

```text
Le signal est-il assez propre pour mériter une analyse plus profonde ?
```

Il ne répond pas :

```text
Faut-il acheter ?
Combien vais-je gagner ?
Quel sera le prix futur exact ?
```

---

# 2. Variables positives

```text
I = fiabilité informationnelle        0 à 15
M = validation marché                 0 à 15
L = liquidité / volume / spread       0 à 15
P = momentum contrôlé                 0 à 10
G = régime global crypto              0 à 10
S = sécurité contrat / projet         0 à 15
R = signal social                     0 à 5
O = on-chain / holders                0 à 10
A = asymétrie prudente                0 à 10
V = invalidation claire               0 à 5
```

Total positif brut maximal :

```text
110 points
```

Normalisation :

```text
Score positif normalisé = Score brut positif / 110 × 100
```

---

# 3. Pénalités

```text
Données live absentes                -30
Source primaire absente              -10
Source secondaire absente             -5
Liquidité insuffisante               -20
Contrat non vérifié                  -25
Holders très concentrés              -15
FOMO forte                           -15
Mouvement déjà vertical              -15
News déjà pricée                     -10
Social agressif / spam                -8
Données on-chain manquantes           -8
```

---

# 4. Formule

```text
Score Observation Crypto = clamp(0, 100, Score positif normalisé - Pénalités)
```

---

# 5. Gates de blocage

Les gates ne sont pas de simples pénalités.

Elles bloquent une conclusion positive.

## Gate Live

```text
Si aucune source live n’a été consultée :
pas de prix
pas de market cap
pas de tableau chiffré
pas de classement actuel
```

## Gate Sécurité

```text
Honeypot probable → conclusion positive interdite
Impossibilité de vendre → conclusion positive interdite
Contrat critique non vérifié → position théorique interdite
```

## Gate Liquidité

```text
Liquidité trop faible → position théorique interdite ou micro-éducative seulement
```

## Gate FOMO

```text
Entrée motivée par regret, panique ou euphorie → mode No-FOMO prioritaire
```

---

# 6. Niveaux

```text
0-20   Danger / refus
21-40  Bruit ou signal trop fragile
41-55  Veille seulement
56-65  Signal faible mais intéressant
66-75  Signal moyen, analyse approfondie requise
76-85  Signal fort mais risqué
86-100 Signal rare, validation humaine avancée obligatoire
```

---

# 7. Prévision prudente

Le mot prévision signifie ici :

```text
projection conditionnelle
scénario probabiliste
lecture de régime
classement d’hypothèse
```

Il ne signifie pas :

```text
certitude
voyance
ordre de trading
prix futur garanti
```

Format autorisé :

```text
Biais conditionnel : haussier / neutre / baissier / indéterminé
Horizon : 24h / 7j / 30j
Confiance : faible / moyenne / élevée
Conditions qui renforcent :
Conditions qui invalident :
Risques principaux :
Décision : veille / attente / refus / analyse approfondie
```
