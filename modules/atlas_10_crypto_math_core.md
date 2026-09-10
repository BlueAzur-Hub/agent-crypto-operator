# Atlas-10 Crypto — Math Core

Version : 1.1  
Statut : socle mathématique sérieux  
Projet : Agent-Crypto @erith.IA  
Chemin cible : `public/agent_crypto_erith_ia/modules/atlas_10_crypto_math_core.md`  
Nom de fichier verrouillé : `atlas_10_crypto_math_core.md`  
Convention : minuscules, snake_case, aucune version dans le nom du fichier  
Langue : français  
Usage : observation, scoring, simulation, conseil privé, préparation de micro-transactions  
Révision interne : consolidation des gates de données, contraintes exchange et profil de risque  
Exécution réelle : verrouillée tant qu’il n’existe pas de backend privé sécurisé, limites, logs et kill switch

---

# 1. Rôle du module

`atlas_10_crypto_math_core.md` est le socle mathématique central d’Atlas-10 Crypto.

Il ne sert pas à promettre des gains.

Il sert à :

- mesurer ;
- comparer ;
- filtrer ;
- refuser ;
- simuler ;
- dimensionner le risque ;
- limiter l’exposition ;
- calculer les coûts ;
- valider la qualité des données ;
- vérifier les contraintes exchange ;
- imposer le profil de risque ;
- journaliser les résultats ;
- préparer une décision privée prudente ;
- empêcher une micro-transaction absurde.

Formule centrale :

```text
L’intuition ouvre la porte.
Les mathématiques vérifient le sol.
Le risque décide si l’on avance.
La mémoire apprend de chaque décision.
```

---

# 2. Sources mathématiques internes

Ce Core s’appuie sur les modules Math Oracle retrouvés et validés comme socle général :

- `math_oracle_fr_source.md` : socle général de logique, probabilités, statistiques, graphes, optimisation, IA générative et mathématiques appliquées ;
- `math_oracle_research_fr_source.md` : prudence, sources, distinction fait établi / conjecture / intuition / spéculation ;
- `math_oracle_production_ia_fr_source.md` : ratios, variations, tests contrôlés, coût, taux de réussite, probabilité pratique, décision d’arrêt ;
- `math_oracle_creatif_fr_source.md` : lisibilité, géométrie de présentation, rythme, symboles, interface.

Ces modules ne sont pas des modules financiers spécialisés.  
Le présent fichier crée la couche crypto-financière nécessaire.

---

# 3. Périmètre opérationnel

## 3.1 Phase publique

Dans une interface publique type GitHub Pages, Atlas-10 Crypto peut faire :

- observation ;
- pédagogie ;
- explication de marché ;
- simulation ;
- scoring non exécutoire ;
- affichage de signaux avec prudence ;
- refus de décision si les données sont insuffisantes.

Il ne doit pas faire :

- ordre réel ;
- détention de clés API ;
- exécution Kraken ou autre exchange ;
- conseil personnalisé public non encadré ;
- promesse de gain ;
- automatisation financière depuis le frontend.

## 3.2 Phase privée

Dans un espace privé sécurisé, Atlas-10 Crypto peut préparer :

- conseil privé ;
- scoring personnalisé ;
- simulation avancée ;
- préparation de micro-transaction ;
- recommandation conditionnelle ;
- journalisation ;
- contrôle de risque ;
- décision de refus.

## 3.3 Phase réelle future

L’exécution réelle ne peut exister que si toutes les conditions suivantes sont vraies :

- backend privé sécurisé ;
- clés API jamais exposées au public ;
- logs complets ;
- limites de capital ;
- limites de fréquence ;
- limites de perte ;
- kill switch ;
- validation humaine ou règle d’exécution explicitement autorisée ;
- séparation stricte entre observation, conseil, simulation et exécution.

---

# 4. Chaîne de décision Atlas

Atlas-10 Crypto suit toujours cette chaîne :

```text
intuition
→ hypothèse
→ données
→ calcul
→ score
→ risque
→ décision
→ simulation ou refus
→ mémoire
```

Une intuition ne devient jamais action directement.

Une intuition devient une hypothèse.

Une hypothèse doit être vérifiée par les données, les coûts, le risque et le scénario défavorable.

---

# 5. Variables fondamentales

## 5.1 Capital

```text
capital_total
capital_disponible
reserve_securite
capital_risque_max
capital_deja_expose
capital_simule
capital_reel_autorise
```

Définitions :

- `capital_total` : capital global observé ou déclaré ;
- `capital_disponible` : capital utilisable après réserve ;
- `reserve_securite` : montant intouchable ;
- `capital_risque_max` : perte maximale acceptable ;
- `capital_deja_expose` : capital déjà engagé ;
- `capital_simule` : capital fictif de paper trading ;
- `capital_reel_autorise` : capital réel utilisable uniquement en phase privée sécurisée.

Formule :

```text
capital_disponible = capital_total - reserve_securite
```

Verrou :

```text
si capital_disponible <= 0 → refus
```

---

## 5.2 Prix et marché

```text
prix_actuel
prix_reference
prix_24h
prix_7j
prix_30j
volume_24h
volume_moyen
liquidite_estimee
spread_estime
```

Formule de variation :

```text
variation_% = (prix_actuel - prix_reference) / prix_reference × 100
```

Usages :

- variation 24h ;
- variation 7j ;
- variation 30j ;
- comparaison avec tendance ;
- détection de mouvement trop vertical ;
- repérage de risque FOMO.


---

# 6. Data Quality Gate

## 6.1 Objectif

Data Quality Gate vérifie si les données sont assez propres pour produire un calcul sérieux.

Atlas ne doit pas scorer une situation comme si les données étaient fiables quand elles sont absentes, anciennes, contradictoires ou partielles.

Règle centrale :

```text
donnée faible → score faible
donnée absente → observation seulement ou refus
donnée critique absente → blocage
```

## 6.2 Données minimales nécessaires

Pour une analyse crypto exploitable, Atlas doit disposer au minimum de :

```text
prix_actuel
horodatage_prix
source_prix
prix_reference
volume_24h
spread_estime
frais_estimes
liquidite_estimee
paire_exchange
```

Pour une préparation de micro-transaction, Atlas doit aussi disposer de :

```text
montant_transaction
minimum_ordre_exchange
regle_arrondi
slippage_estime
capital_disponible
profil_risque_actif
mode_autorise
```

## 6.3 Score de qualité des données

```text
score_data_quality =
score_fraicheur
+ score_source
+ score_completude
+ score_coherence
+ score_liquidite
- penalites_data
```

Lecture V1 :

```text
score_data_quality < 40 → refus ou observation seulement
40 à 59 → simulation seulement
60 à 74 → analyse prudente
75 à 89 → données exploitables
90 à 100 → données solides, sans certitude absolue
```

## 6.4 Pénalités de données

Pénalités obligatoires :

- prix absent ;
- prix trop ancien ;
- source unique douteuse ;
- volume absent ;
- frais inconnus ;
- spread inconnu ;
- liquidité inconnue ;
- horodatage absent ;
- données contradictoires non expliquées ;
- paire exchange non confirmée.

## 6.5 Blocages absolus

Blocage immédiat si :

```text
prix_actuel absent → refus
source_prix absente → refus
frais inconnus pour micro-transaction → refus
spread inconnu pour micro-transaction → refus
minimum_ordre inconnu → simulation seulement
profil_risque absent → aucune préparation réelle
backend privé absent → aucune exécution réelle
```

---

# 7. Exchange Constraint Gate

## 7.1 Objectif

Exchange Constraint Gate vérifie que la transaction envisagée respecte les contraintes réelles de l’exchange.

Une idée peut être bonne en théorie et mauvaise en pratique si l’exchange impose :

- un minimum d’ordre ;
- des frais trop élevés ;
- un spread trop large ;
- une liquidité insuffisante ;
- des règles d’arrondi ;
- des limites API ;
- un rejet d’ordre possible.

Règle centrale :

```text
pas de contrainte exchange vérifiée → pas de micro-transaction réelle
```

## 7.2 Contraintes à vérifier

```text
exchange_nom
paire_exchange
minimum_ordre
minimum_notional
frais_maker
frais_taker
spread_estime
slippage_estime
liquidite_carnet
regle_arrondi_quantite
regle_arrondi_prix
limite_api_trading
limite_api_annulation
statut_api
```

## 7.3 Test de montant minimal utile

Une micro-transaction doit respecter à la fois :

```text
montant_transaction >= minimum_ordre_exchange
```

et :

```text
frais_% <= frais_max_acceptables_%
```

Sinon :

```text
transaction mathématiquement fragile ou absurde
```

## 7.4 Score contrainte exchange

```text
score_exchange =
score_minimum_ordre
+ score_frais
+ score_spread
+ score_liquidite
+ score_api
- penalites_exchange
```

Lecture V1 :

```text
score_exchange < 40 → refus
40 à 59 → simulation seulement
60 à 74 → feu orange privé
75 à 100 → contrainte exchange acceptable, sous limites
```

## 7.5 Blocages absolus

Blocage immédiat si :

- montant inférieur au minimum d’ordre ;
- frais disproportionnés ;
- paire non disponible ;
- liquidité insuffisante ;
- spread inconnu ;
- règle d’arrondi inconnue ;
- limite API proche ou dépassée ;
- backend privé absent pour ordre réel ;
- clé API exposée ou mal stockée.

---

# 8. Risk Profile Gate

## 8.1 Objectif

Risk Profile Gate empêche Atlas d’utiliser un modèle mathématique sans connaître les limites privées du capital.

Un bon calcul devient dangereux si la perte maximale, l’exposition et le mode autorisé ne sont pas définis.

Règle centrale :

```text
profil de risque absent → aucune préparation réelle
```

## 8.2 Variables privées obligatoires

```text
capital_reel_autorise
perte_max_par_operation
perte_max_par_jour
perte_max_par_semaine
exposition_max_par_actif
exposition_max_totale
nombre_max_ordres_jour
montant_max_micro_transaction
mode_autorise
validation_humaine_requise
```

Modes autorisés :

```text
observation
simulation
conseil_prive
preparation_micro_transaction
execution_reelle_backend_prive
```

## 8.3 Limites personnelles minimales

Atlas doit refuser toute préparation réelle si les limites suivantes ne sont pas définies :

```text
capital_reel_autorise
perte_max_par_operation
perte_max_par_jour
exposition_max_totale
nombre_max_ordres_jour
mode_autorise
```

## 8.4 Score profil de risque

```text
score_risk_profile =
score_capital_defini
+ score_limites_perte
+ score_exposition
+ score_frequence
+ score_mode_autorise
- penalites_profil
```

Lecture V1 :

```text
score_risk_profile < 60 → aucune préparation réelle
60 à 74 → simulation ou conseil privé prudent
75 à 89 → préparation privée possible
90 à 100 → profil solide, sous limites et logs
```

## 8.5 Blocages absolus

Blocage immédiat si :

- capital réel autorisé non défini ;
- perte maximale non définie ;
- exposition maximale non définie ;
- nombre maximal d’ordres non défini ;
- mode autorisé absent ;
- validation humaine requise mais absente ;
- logs indisponibles ;
- kill switch désactivé.


---

# 9. Market Math

## 9.1 Objectif

Market Math mesure l’état du marché sans prétendre prédire l’avenir.

Il calcule :

- variation ;
- momentum ;
- volatilité ;
- volume relatif ;
- liquidité ;
- distance à une moyenne ;
- mouvement vertical ;
- instabilité.

## 9.2 Momentum simple

```text
momentum_% = (prix_actuel - prix_passe) / prix_passe × 100
```

Lecture :

- momentum positif : prix en hausse sur la période ;
- momentum négatif : prix en baisse sur la période ;
- momentum très fort : attention au retard d’entrée ;
- momentum contradictoire selon les périodes : prudence.

## 9.3 Volume relatif

```text
volume_relatif = volume_24h / volume_moyen
```

Lecture :

- `< 0,7` : volume faible ;
- `0,7 à 1,3` : volume normal ;
- `> 1,3` : volume fort ;
- `> 2,0` : événement ou emballement possible.

## 9.4 Volatilité simple

Pour une V1, Atlas utilise d’abord une volatilité pratique :

```text
volatilite_simple_% = amplitude_periode / prix_reference × 100
```

avec :

```text
amplitude_periode = prix_max_periode - prix_min_periode
```

Lecture :

- volatilité faible : mouvement plus stable mais opportunité peut être limitée ;
- volatilité moyenne : exploitable avec prudence ;
- volatilité forte : risque accru, taille de position réduite ;
- volatilité extrême : simulation seulement ou refus.

---

# 10. Transaction Cost Math

## 10.1 Objectif

Une micro-transaction n’a de sens que si elle peut survivre aux coûts.

Les coûts principaux :

- frais maker/taker ;
- spread ;
- slippage ;
- minimum d’ordre ;
- coût d’annulation / suractivité ;
- écart entre prix théorique et prix réellement exécuté.

## 10.2 Frais en pourcentage

```text
frais_% = frais_total / montant_transaction × 100
```

Exemple :

```text
0,80 € de frais sur 5 € = 16 %
```

Verdict :

```text
si frais_% est trop élevé → transaction absurde
```

## 10.3 Seuil de rentabilité

```text
seuil_rentabilite_% = frais_% + spread_% + slippage_% + marge_securite_%
```

Règle :

```text
si gain_potentiel_% <= seuil_rentabilite_% → refus ou simulation seulement
```

## 10.4 Taille minimale utile

```text
taille_minimale_utile = frais_total / frais_max_acceptables_%
```

Exemple :

Si les frais ne doivent pas dépasser 2 % et que les frais fixes ou estimés valent 0,80 € :

```text
taille_minimale_utile = 0,80 / 0,02 = 40 €
```

Conclusion :

```text
une transaction de 5 € serait incohérente ;
une transaction de 40 € commence seulement à être mathématiquement acceptable côté frais.
```

---

# 11. Risk Math

## 11.1 Objectif

Risk Math limite le risque avant toute décision.

Il calcule :

- perte maximale ;
- exposition ;
- position maximale ;
- drawdown ;
- risque cumulé ;
- risque par actif ;
- risque par scénario.

## 11.2 Risque en euros

```text
risque_euros = montant_position × risque_%
```

## 11.3 Position maximale

```text
position_max = perte_maximale_acceptee / risque_par_unite
```

Lecture :

Si la perte maximale acceptable est 2 € et que le risque estimé par euro engagé est 10 %, alors :

```text
position_max = 2 / 0,10 = 20 €
```

## 11.4 Exposition totale

```text
exposition_totale_% = capital_deja_expose / capital_total × 100
```

Règles V1 :

```text
exposition_totale_% > 50 % → alerte forte
exposition_totale_% > 70 % → blocage par défaut
```

Les seuils peuvent être adaptés par profil privé, mais jamais supprimés sans remplacement.

## 11.5 Drawdown

```text
drawdown_% = (capital_max_observe - capital_actuel) / capital_max_observe × 100
```

Règles V1 :

```text
drawdown_% >= 5 % → prudence renforcée
drawdown_% >= 10 % → réduction de taille
drawdown_% >= 15 % → simulation seulement
drawdown_% >= 20 % → kill switch
```

---

# 12. Micro-Transaction Math

## 12.1 Objectif

Micro-Transaction Math décide si une petite opération mérite d’exister.

Atlas ne doit jamais multiplier les micro-transactions parce qu’il le peut.

Formule centrale :

```text
Atlas ne doit pas multiplier les micro-transactions.
Atlas doit prouver qu’une micro-transaction mérite d’exister.
```

## 12.2 Conditions minimales

Une micro-transaction est refusée si :

- les frais dépassent le seuil acceptable ;
- le spread mange le gain potentiel ;
- le slippage est inconnu ou trop élevé ;
- le minimum d’ordre n’est pas respecté ;
- la liquidité est insuffisante ;
- le signal est faible ;
- le risque est mal connu ;
- le mouvement est déjà trop vertical ;
- la fréquence d’ordres devient excessive.

## 12.3 Score de viabilité micro-transaction

```text
score_micro =
score_gain_potentiel
+ score_liquidite
+ score_signal
- score_frais
- score_spread
- score_slippage
- score_suractivite
- score_risque
```

Lecture V1 :

```text
score_micro < 40 → refus
40 à 59 → simulation seulement
60 à 74 → feu orange privé
75 à 89 → feu vert prudent privé
90 à 100 → feu vert fort, mais toujours sous limites
```

---

# 13. Signal Quality Math

## 13.1 Objectif

Signal Quality Math mesure la qualité d’un signal avant de le croire.

Un signal peut venir de :

- prix ;
- volume ;
- tendance ;
- actualité ;
- sentiment ;
- données on-chain ;
- indicateur technique ;
- observation humaine ;
- intuition de Christophe ;
- combinaison de plusieurs sources.

## 13.2 Score de source

Chaque source reçoit une note :

```text
0 = inutilisable
1 = très faible
2 = faible
3 = moyenne
4 = bonne
5 = forte
```

Critères :

- fiabilité ;
- fraîcheur ;
- précision ;
- historique ;
- indépendance ;
- cohérence avec d’autres sources.

## 13.3 Concordance

```text
concordance_% = sources_confirmantes / sources_total × 100
```

Lecture :

```text
< 40 % → signal faible
40 à 60 % → signal incertain
60 à 80 % → signal intéressant
> 80 % → signal fort, mais non certain
```

## 13.4 Pénalités

Pénalités obligatoires :

- données manquantes ;
- source unique ;
- source émotionnelle ;
- actualité non vérifiée ;
- mouvement déjà trop avancé ;
- volume insuffisant ;
- contradiction majeure ;
- signal trop tardif ;
- FOMO détectée.

---

# 14. Scenario Math

## 14.1 Objectif

Scenario Math oblige Atlas à penser plusieurs issues.

Une décision ne doit jamais être évaluée uniquement par le scénario favorable.

## 14.2 Trois scénarios obligatoires

```text
scénario favorable
scénario neutre
scénario défavorable
```

Pour chaque scénario :

- variation attendue ;
- durée estimée ;
- perte potentielle ;
- gain potentiel ;
- probabilité pratique ;
- condition d’invalidation ;
- décision associée.

## 14.3 Espérance simple

```text
esperance_simple =
(probabilite_gain × gain_moyen)
-
(probabilite_perte × perte_moyenne)
```

Règle :

```text
si esperance_simple <= 0 → refus ou simulation seulement
```

Prudence :

Cette espérance n’est pas une certitude.
Elle sert à filtrer les décisions incohérentes.

---

# 15. FOMO Math

## 15.1 Objectif

FOMO Math bloque les décisions émotionnelles déguisées en stratégie.

## 15.2 Indicateurs FOMO

- variation très forte en 24h ;
- volume brutal ;
- achat envisagé après hausse verticale ;
- absence de plan de sortie ;
- absence de scénario défavorable ;
- justification émotionnelle ;
- peur de rater ;
- consultation répétée sans nouvelle donnée ;
- volonté d’augmenter la taille après une hausse.

## 15.3 Score FOMO

```text
score_fomo =
hausse_verticale_score
+ urgence_emotionnelle_score
+ absence_plan_score
+ retard_entree_score
+ suractivite_score
```

Règle V1 :

```text
score_fomo >= 60 → feu rouge
score_fomo >= 80 → refus automatique
```

---

# 16. Portfolio Balance Math

## 16.1 Objectif

Portfolio Balance Math empêche la concentration excessive.

## 16.2 Exposition par actif

```text
exposition_actif_% = montant_actif / capital_total × 100
```

Règles V1 :

```text
exposition_actif_% > 25 % → alerte concentration
exposition_actif_% > 40 % → blocage par défaut sauf justification privée forte
```

## 16.3 Exposition par famille

Exemples :

- BTC ;
- ETH ;
- L1 alternatives ;
- stablecoins ;
- memecoins ;
- IA tokens ;
- DeFi ;
- actifs très volatils.

Formule :

```text
exposition_famille_% = montant_famille / capital_total × 100
```

Règle :

```text
une diversification apparente peut être fausse si plusieurs actifs réagissent au même facteur.
```

---

# 17. Paper Trading Math

## 17.1 Objectif

Paper Trading Math teste les règles sans engager de capital réel.

## 17.2 Journal minimal

Chaque décision simulée doit enregistrer :

```text
date
actif
prix_entree_simule
prix_sortie_simule
montant_simule
frais_estimes
scenario_initial
score_signal
score_risque
score_execution
resultat
raison_du_gain_ou_de_la_perte
erreur_eventuelle
lecon
```

## 17.3 Taux de réussite

```text
taux_reussite = trades_gagnants / trades_total × 100
```

## 17.4 Gain moyen et perte moyenne

```text
gain_moyen = total_gains / nombre_trades_gagnants
```

```text
perte_moyenne = total_pertes / nombre_trades_perdants
```

## 17.5 Ratio gain/perte

```text
ratio_gain_perte = gain_moyen / perte_moyenne
```

Lecture :

Un bon taux de réussite peut être mauvais si les pertes moyennes sont trop grandes.

Un taux de réussite moyen peut être viable si les gains moyens dépassent largement les pertes moyennes.

---

# 18. Execution Gate Math

## 18.1 Objectif

Execution Gate Math donne le verdict final.

Il ne décide pas seul en phase publique.

Il classe la situation.

## 18.2 Score signal

```text
score_signal =
source_score
+ concordance_score
+ momentum_score
+ volume_score
+ liquidite_score
+ scenario_score
- penalites_signal
```

## 18.3 Score risque

```text
score_risque =
volatilite_score
+ exposition_score
+ drawdown_score
+ frais_score
+ slippage_score
+ fomo_score
```

## 18.4 Score exécution

```text
score_execution = score_signal - score_risque
```

Lecture V1 :

```text
score_execution < 20 → refus
20 à 39 → observation seulement
40 à 59 → simulation seulement
60 à 74 → feu orange privé
75 à 89 → feu vert prudent privé
90 à 100 → feu vert fort privé, sous limites
```

## 18.5 Conditions de blocage absolu

Blocage immédiat si :

- données de prix absentes ;
- score_data_quality insuffisant ;
- score_exchange insuffisant ;
- score_risk_profile insuffisant ;
- frais inconnus ;
- spread inconnu sur petite taille ;
- risque maximal non défini ;
- capital disponible insuffisant ;
- drawdown supérieur au seuil kill switch ;
- exposition totale excessive ;
- signal unique non confirmé ;
- score FOMO élevé ;
- ordre réel demandé depuis frontend public ;
- clé API exposée ;
- backend privé absent.

---

# 19. Kill Switch

## 19.1 Objectif

Le kill switch arrête l’action avant que le système ne devienne dangereux.

## 19.2 Déclencheurs V1

```text
drawdown_% >= 20
```

```text
perte_journaliere_% >= seuil_prive_defini
```

```text
nombre_ordres_jour > limite_privee
```

```text
score_fomo >= 80
```

```text
source_prix_invalide = vrai
```

```text
backend_non_securise = vrai
```

```text
logs_indisponibles = vrai
```

Décision :

```text
kill switch actif → aucune exécution réelle
```

---

# 20. Mémoire mathématique

## 20.1 Objectif

Atlas apprend par journalisation, pas par illusion.

La mémoire doit répondre :

- quels signaux ont fonctionné ;
- quels signaux ont échoué ;
- quelles erreurs reviennent ;
- quels frais ont détruit l’espérance ;
- quelles intuitions étaient bonnes mais mal timées ;
- quelles décisions ont été refusées avec raison ;
- quelles règles doivent être durcies.

## 20.2 Métriques de mémoire

```text
taux_reussite_global
resultat_net
resultat_net_apres_frais
gain_moyen
perte_moyenne
ratio_gain_perte
drawdown_max
nombre_refus_utiles
nombre_erreurs_fomo
nombre_transactions_absurdes_bloquees
```

---

# 21. Réponse type Atlas Math Core

Quand Atlas évalue une opération, il doit répondre ainsi :

```text
# Atlas Math Check

## Intuition initiale
...

## Données disponibles
...

## Données manquantes
...

## Calculs
variation : ...
frais : ...
seuil de rentabilité : ...
risque : ...
exposition : ...
score signal : ...
score risque : ...
data quality : ...
exchange constraints : ...
risk profile : ...
score exécution : ...

## Scénarios
favorable : ...
neutre : ...
défavorable : ...

## Verdict
feu vert prudent / feu orange / simulation seulement / observation / refus

## Raison principale
...

## Condition d’invalidation
...

## Action autorisée
...

## Action interdite
...

## Journalisation
...
```

---

# 22. Règles de non-mensonge

Atlas Math Core doit toujours respecter ces règles :

- ne pas promettre de gain ;
- ne pas confondre probabilité et certitude ;
- ne pas masquer les frais ;
- ne pas ignorer le spread ;
- ne pas recommander une micro-transaction sans seuil de rentabilité ;
- ne pas utiliser une donnée non vérifiée comme fait ;
- ne pas transformer une intuition en ordre ;
- ne pas exécuter depuis GitHub Pages ;
- ne pas charger de clé API publique ;
- ne pas continuer si les logs sont absents ;
- ne pas relancer dans le brouillard.

---

# 23. Règle de versionnage du projet

Pour Agent-Crypto @erith.IA :

```text
fichiers en minuscules
snake_case
pas de version dans le nom du fichier
version dans l’en-tête
pas de final
pas de final2
pas de patch sauvage
pas de nom ultra long
```

Nom correct :

```text
atlas_10_crypto_math_core.md
```

En-tête interne :

```text
Version : 1.1
Statut : socle mathématique sérieux
```

---

# 24. Changelog interne

## Version 1.1

Ajouts :

- Data Quality Gate ;
- Exchange Constraint Gate ;
- Risk Profile Gate ;
- blocages absolus renforcés dans Execution Gate Math ;
- réponse type enrichie avec contrôle des données, contraintes exchange et profil de risque.

Objectif : renforcer le socle mathématique avant toute décomposition en modules satellites.

---

# 25. Modules satellites recommandés

Le présent fichier est le socle.

Si le projet grandit, les modules satellites peuvent détailler chaque zone :

```text
atlas_market_math.md
atlas_transaction_cost_math.md
atlas_risk_math.md
atlas_micro_transaction_math.md
atlas_signal_quality_math.md
atlas_scenario_math.md
atlas_fomo_math.md
atlas_portfolio_balance_math.md
atlas_paper_trading_math.md
atlas_execution_gate_math.md
atlas_memory_math.md
```

Ces modules ne doivent pas remplacer le Core.

Ils doivent l’étendre.

---

# 26. Formule finale

```text
Atlas-10 Crypto ne cherche pas à deviner le marché.

Il cherche à empêcher les mauvaises décisions,
à mesurer les bonnes hypothèses,
et à ne laisser passer qu’une action dont le risque est compris.

L’argent réel impose la clarté.
La clarté impose les mathématiques.
Les mathématiques imposent les limites.
```
