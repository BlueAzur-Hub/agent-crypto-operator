# Atlas-10 Crypto — Execution Math

Version : 1.0
Statut : module mathématique spécialisé — décision finale et verrous
Projet : Agent-Crypto @erith.IA
Chemin : public/agent_crypto_erith_ia/modules/atlas_execution_math.md
Rôle : transformer les scores mathématiques en décision contrôlée avant simulation, conseil privé, préparation d’ordre ou exécution future.

---

# 1. Principe central

Execution Math est le dernier verrou.

Il ne cherche pas une opportunité.

Il vérifie si toutes les conditions nécessaires sont réunies pour autoriser une action.

Formule :

```text
signal + risque + coûts + contraintes + profil + mémoire = décision
```

---

# 2. Modes autorisés

```text
observation
simulation
conseil_prive
preparation_ordre
execution_reelle
```

Règle :

```text
execution_reelle est interdite sans backend privé sécurisé, logs, limites, clés protégées et kill switch.
```

---

# 3. Scores nécessaires

```text
score_signal
score_risque
score_frais
score_micro_transaction
score_data_quality
score_fomo
score_execution
```

Formule de travail :

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

# 4. Décisions possibles

```text
feu_vert
feu_orange
simulation_seulement
preparation_seulement
refus
kill_switch
```

Interprétation :

```text
feu_vert = conditions mathématiques acceptables selon le mode autorisé
feu_orange = prudence, taille réduite ou attente
simulation_seulement = pas d’action réelle
preparation_seulement = ordre préparé mais non exécuté
refus = conditions insuffisantes
kill_switch = arrêt immédiat
```

---

# 5. Conditions minimales pour feu vert

```text
data_quality_ok
exchange_constraints_ok
risk_profile_ok
score_signal suffisant
score_risque acceptable
frais acceptables
seuil_rentabilite dépassé
exposition non dépassée
pas de fomo critique
pas de drawdown critique
mode autorisé compatible
```

---

# 6. Conditions de refus

Refus si :

```text
données absentes
source douteuse
frais inconnus
spread inconnu
slippage inconnu
risque opération trop élevé
exposition trop élevée
minimum exchange non respecté
profil de risque absent
signal trop faible
fomo élevé
drawdown trop élevé
backend absent pour réel
```

---

# 7. Kill switch

Kill switch si :

```text
perte_jour > perte_max_jour
perte_semaine > perte_max_semaine
drawdown critique
erreur API répétée
données de prix contradictoires
ordre rejeté plusieurs fois
comportement d’overtrading
connexion backend douteuse
clé API exposée ou suspecte
```

Effet :

```text
arrêt immédiat
passage en observation seulement
journalisation de l’incident
audit obligatoire avant reprise
```

---

# 8. Réponse type

```text
## Verdict Execution Math

Mode demandé :
...

Mode autorisé :
...

Data Quality Gate :
ok / non

Exchange Constraint Gate :
ok / non

Risk Profile Gate :
ok / non

Score signal :
...

Score risque :
...

Score frais :
...

Score FOMO :
...

Score execution :
...

Décision :
feu vert / feu orange / simulation seulement / préparation seulement / refus / kill switch

Raison :
...

Action autorisée :
...
```

---

# 9. Relation avec Atlas Math Core

Ce module détaille la couche décisionnelle du fichier central :

```text
atlas_10_crypto_math_core.md
```

Il est chargé en dernier, après :

```text
atlas_market_math.md
atlas_risk_math.md
atlas_micro_transaction_math.md
atlas_signal_quality_math.md
atlas_probability_scenario_math.md
atlas_portfolio_balance_math.md
atlas_paper_trading_math.md
```

Il ne doit jamais ignorer les refus produits par ces modules.
