# Atlas-10 Crypto — Micro-Transaction Math

Version : 1.0
Statut : module mathématique spécialisé — micro-transactions
Projet : Agent-Crypto @erith.IA
Chemin : public/agent_crypto_erith_ia/modules/atlas_micro_transaction_math.md
Rôle : déterminer si une petite transaction mérite d’exister après frais, spread, slippage et contraintes d’exchange.

---

# 1. Principe central

Une micro-transaction n’est pas automatiquement prudente parce qu’elle est petite.

Elle peut être mauvaise si les frais, le spread ou le slippage absorbent l’espérance de gain.

Phrase centrale :

```text
Atlas ne multiplie pas les micro-transactions.
Atlas prouve qu’une micro-transaction mérite d’exister.
```

---

# 2. Variables minimales

```text
montant_transaction
prix_actuel
frais_maker
frais_taker
frais_total
spread_estime
slippage_estime
montant_minimum_exchange
arrondi_minimum
liquidite_disponible
gain_cible_%
marge_securite_%
```

---

# 3. Frais en pourcentage

```text
frais_% = frais_total / montant_transaction × 100
```

Exemple :

```text
0,80 € de frais sur 5 € = 16 %
```

Verdict :

```text
si frais_% est trop élevé, la transaction est absurde.
```

---

# 4. Seuil de rentabilité

```text
seuil_rentabilite_% = frais_% + spread_% + slippage_% + marge_securite_%
```

Règle :

```text
gain_cible_% > seuil_rentabilite_%
```

Sinon :

```text
refus
```

---

# 5. Taille minimale utile

```text
taille_minimale_utile =
frais_total / frais_max_acceptables_%
```

Exemple :

Si les frais sont 0,50 € et qu’on accepte au maximum 1 % de frais :

```text
0,50 / 0,01 = 50 €
```

Donc une transaction de 5 € serait mauvaise dans ce cadre.

---

# 6. Coût de suractivité

```text
cout_suractivite = nombre_transactions × frais_total_moyen
```

```text
frais_moyens_% = total_frais / capital_engage_total × 100
```

Blocage si :

```text
frais_moyens_% > seuil_frais_max_%
```

---

# 7. Minimum exchange

Avant toute préparation d’ordre :

```text
montant_transaction >= montant_minimum_exchange
```

Blocage si :

```text
montant_transaction < montant_minimum_exchange
```

Blocage aussi si les règles d’arrondi ou taille minimale d’actif sont inconnues.

---

# 8. Score micro-transaction

```text
score_micro_transaction =
rentabilite_nette_score
+ liquidite_score
+ taille_utile_score
+ risk_reward_score
- frais_penalty
- spread_penalty
- slippage_penalty
- overtrading_penalty
```

Verdict :

```text
80 à 100 : micro-transaction valide sous contrôle
60 à 79 : possible mais prudente
40 à 59 : simulation seulement
0 à 39 : refus
```

---

# 9. Gates de blocage

Refus immédiat si :

```text
frais inconnus
spread inconnu
slippage estimé absent
montant inférieur au minimum exchange
taille minimale utile non atteinte
gain cible inférieur au seuil de rentabilité
liquidité insuffisante
trop d’ordres récents
profil de risque absent
backend privé absent pour réel
```

---

# 10. Sortie attendue

```text
## Verdict Micro-Transaction Math

Montant :
...

Frais % :
...

Spread estimé :
...

Slippage estimé :
...

Seuil de rentabilité :
...

Gain cible :
...

Taille minimale utile :
...

Score micro-transaction :
...

Décision :
valide / prudence / simulation seulement / refus

Raison principale :
...
```

---

# 11. Relation avec Atlas Math Core

Ce module détaille la couche micro-transaction du fichier central :

```text
atlas_10_crypto_math_core.md
```

Il est chargé lorsque la question touche :

```text
petites transactions
centaines ou milliers d’ordres
frais
spread
slippage
minimum exchange
rentabilité nette
suractivité
```
