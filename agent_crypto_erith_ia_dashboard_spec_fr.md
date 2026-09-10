# Agent-Crypto @erith.IA — Spécification Dashboard FR

Version : 0.2

---

# 1. Direction UI

L’interface doit être qualitative et immersive, inspirée par l’esprit Seven Portable Terminal :

```text
cockpit premium
fond immersif
cartouches translucides
navigation horizontale
boutons capsules
cards de modules
lecture claire
statut de source visible
```

Mais elle doit rester originale et adaptée crypto.

---

# 2. Pages / sections

```text
Accueil
Livecheck
Marché
Watchlist
News
Risques
Math Model
No-FOMO
Sources
```

---

# 3. Header

Contenu :

```text
Agent-Crypto @erith.IA
Observatoire crypto prudent
Statut Livecheck
Source active
Heure données
Bouton Lancer Livecheck
Bouton Rafraîchir
```

---

# 4. Cartes marché

```text
Capitalisation totale
Volume 24h
Dominance BTC
Dominance ETH
Source active
État données
```

Si données absentes :

```text
—
Donnée non récupérée
```

---

# 5. Tableau marché

Colonnes :

```text
Rang
Crypto
Symbole
Prix
24h
7j
Market Cap
Volume 24h
Score
Décision
Source
```

---

# 6. Score mathématique

Affichage :

```text
Score Observation Crypto
Niveau
Pénalités
Gates de blocage
Décision autorisée
```

---

# 7. No-FOMO

Texte permanent :

```text
Une occasion ratée ne coûte rien.
Une mauvaise position peut coûter très cher.
```

Question :

```text
Est-ce encore une opportunité actuelle,
ou seulement le souvenir douloureux d’une opportunité déjà passée ?
```

---

# 8. Qualité technique

```text
HTML séparé
CSS séparé
JS séparé
responsive
aucune clé API exposée
aucun faux prix
fallback clair si échec réseau
```
