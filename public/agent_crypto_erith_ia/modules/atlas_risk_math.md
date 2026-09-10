# Atlas-10 Crypto — Risk Math

Version : 1.0
Statut : module mathématique spécialisé — risque
Projet : Agent-Crypto @erith.IA
Chemin : public/agent_crypto_erith_ia/modules/atlas_risk_math.md
Rôle : mesurer, limiter et bloquer le risque avant toute décision crypto.

---

# 1. Principe central

Atlas Risk Math ne cherche pas à maximiser le gain.

Il cherche d’abord à éviter la perte non maîtrisée.

Formule de conduite :

```text
capital → exposition → risque → limite → décision
```

Règle :

```text
Aucune opportunité ne mérite d’exister si sa perte possible n’est pas comprise.
```

---

# 2. Variables minimales

```text
capital_total
capital_autorise
capital_disponible
reserve_securite
perte_max_operation
perte_max_jour
perte_max_semaine
exposition_actif
exposition_totale
prix_entree
prix_invalidation
frais_total
spread_estime
slippage_estime
```

---

# 3. Capital réellement utilisable

```text
capital_utilisable = capital_autorise - reserve_securite
```

Blocage si :

```text
capital_utilisable <= 0
```

Interprétation :

Si la réserve de sécurité absorbe tout le capital autorisé, Atlas passe en observation ou simulation seulement.

---

# 4. Risque par opération

```text
risque_operation_euros = montant_position × risque_operation_%
```

Version avec prix d’invalidation :

```text
risque_operation_euros = montant_position × abs(prix_entree - prix_invalidation) / prix_entree
```

Règle :

```text
risque_operation_euros <= perte_max_operation
```

Sinon :

```text
feu_rouge
```

---

# 5. Exposition

```text
exposition_actif_% = montant_expose_actif / capital_autorise × 100
```

```text
exposition_totale_% = montant_total_expose / capital_autorise × 100
```

Blocage si :

```text
exposition_actif_% > exposition_actif_max_%
```

ou :

```text
exposition_totale_% > exposition_totale_max_%
```

---

# 6. Drawdown

```text
drawdown_% = (capital_max_observe - capital_actuel) / capital_max_observe × 100
```

Niveaux recommandés :

```text
0 à 2 % : normal
2 à 5 % : prudence
5 à 10 % : réduction d’activité
> 10 % : arrêt / audit
```

Ces seuils sont des valeurs de travail, à adapter au profil de risque privé.

---

# 7. Risk / Reward

```text
risk_reward = gain_potentiel / perte_potentielle
```

Règle minimale :

```text
risk_reward > 1
```

Mais pour une micro-transaction réelle, il faut aussi intégrer :

```text
frais
spread
slippage
marge_securite
```

Donc :

```text
risk_reward_net = gain_potentiel_net / perte_potentielle_totale
```

Blocage si :

```text
risk_reward_net <= 1
```

---

# 8. Score de risque

Échelle simple :

```text
0 = risque nul ou non significatif
25 = risque faible
50 = risque moyen
75 = risque élevé
100 = risque inacceptable
```

Formule de travail :

```text
score_risque =
exposition_score
+ volatilite_score
+ drawdown_score
+ frais_score
+ liquidite_penalty
+ fomo_penalty
+ data_quality_penalty
```

Verdict :

```text
0 à 30 : risque acceptable
31 à 55 : prudence / taille réduite
56 à 75 : simulation seulement
76 à 100 : refus
```

---

# 9. Gates de blocage

Atlas Risk Math bloque si :

```text
profil_risque_absent
capital_autorise_absent
perte_max_operation_absente
drawdown_trop_eleve
exposition_max_depassée
risque_operation_euros > perte_max_operation
risk_reward_net <= 1
frais_disproportionnes
données_insuffisantes
backend_prive_absent pour exécution réelle
```

---

# 10. Sortie attendue

```text
## Verdict Risk Math

Capital utilisable :
...

Risque opération :
...

Exposition actif :
...

Exposition totale :
...

Drawdown :
...

Risk / reward net :
...

Score risque :
...

Décision :
feu vert / feu orange / simulation seulement / refus

Raison principale :
...
```

---

# 11. Relation avec Atlas Math Core

Ce module détaille la couche risque du fichier central :

```text
atlas_10_crypto_math_core.md
```

Il ne remplace pas le Core.

Il est chargé lorsque la question touche :

```text
capital réel
perte potentielle
exposition
drawdown
taille de position
limite de risque
refus de transaction
```
