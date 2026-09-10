# Atlas-10 Crypto — Math UI Readonly Patch Plan

Version : 1.0  
Statut : plan d’intégration lecture seule  
Projet : Agent-Crypto @erith.IA  
Chemin cible : `public/agent_crypto_erith_ia/modules/atlas_10_crypto_math_ui_readonly_patch_plan.md`  
Langue principale : français  
Nommage : minuscules, snake_case, pas de version dans le nom du fichier  

---

# 1. Rôle du fichier

Ce fichier décrit comment intégrer la couche mathématique Atlas-10 Crypto dans l’interface actuelle de l’application Agent-Crypto.

Objectif :

```text
brancher les mathématiques dans l’interface
sans ordre réel
sans API privée
sans clé exchange
sans backend réel
sans engagement de capital
```

Phrase centrale :

```text
La première intégration doit rendre les mathématiques visibles,
pas rendre l’argent manipulable.
```

---

# 2. Fichiers concernés côté interface

Fichiers principaux à auditer puis patcher localement :

```text
public/agent_crypto_erith_ia/web/index.html
public/agent_crypto_erith_ia/web/style.css
public/agent_crypto_erith_ia/web/app.js
```

Aucune modification GitHub directe dans cette phase.

Règle :

```text
patch local d’abord
test navigateur ensuite
GitHub seulement après validation explicite
```

---

# 3. Fichiers mathématiques à intégrer

Socle :

```text
atlas_10_crypto_math_core.md
```

Routage :

```text
atlas_10_crypto_math_modules_map.md
```

Index :

```text
atlas_10_crypto_math_integration_index.md
```

Modules spécialisés :

```text
atlas_market_math.md
atlas_signal_quality_math.md
atlas_probability_scenario_math.md
atlas_risk_math.md
atlas_micro_transaction_math.md
atlas_execution_math.md
```

---

# 4. Écrans prioritaires

La première intégration lecture seule doit viser seulement quatre écrans :

```text
Math Model
Simulation
Risques
No-FOMO
```

Ces écrans forment la base utile.

Ne pas disperser l’effort sur toute l’interface au premier patch.

---

# 5. Écran Math Model

## 5.1. Rôle

Écran central de lecture mathématique.

Il affiche toute la chaîne :

```text
Data Quality Gate
Market Math
Signal Quality
Scenario Math
Risk Math
Micro-Transaction Math
Execution Math
Verdict final
```

## 5.2. Données affichées

```text
prix actuel
source
timestamp
variation 24h
variation 7j
volume 24h
spread estimé
frais estimés
liquidité estimée
mode demandé
mode autorisé
```

## 5.3. Sortie attendue

```text
verdict court
score marché
score signal
score scénario
score risque
score micro-transaction
score execution
raison principale
action autorisée
```

## 5.4. Rendu UI recommandé

```text
Carte 1 : Données
Carte 2 : Marché
Carte 3 : Signal
Carte 4 : Scénarios
Carte 5 : Risque
Carte 6 : Micro-transaction
Carte 7 : Exécution
Carte 8 : Verdict Atlas
```

---

# 6. Écran Simulation

## 6.1. Rôle

Tester une hypothèse sans capital réel.

## 6.2. Modules utilisés

```text
atlas_probability_scenario_math.md
atlas_risk_math.md
atlas_micro_transaction_math.md
atlas_execution_math.md
```

## 6.3. Entrées

```text
actif
montant simulé
prix d’entrée simulé
prix cible
prix d’invalidation
frais simulés
spread simulé
slippage simulé
horizon
```

## 6.4. Sorties

```text
gain potentiel
perte potentielle
seuil de rentabilité
espérance simple
risk/reward net
score simulation
décision simulation
leçon
```

## 6.5. Verrou

```text
simulation réussie ≠ autorisation réelle
```

---

# 7. Écran Risques

## 7.1. Rôle

Afficher les limites de capital et les risques avant opportunité.

## 7.2. Modules utilisés

```text
atlas_risk_math.md
atlas_execution_math.md
```

## 7.3. Entrées

```text
capital autorisé
réserve de sécurité
capital utilisable
perte maximale par opération
perte maximale par jour
perte maximale par semaine
exposition maximale par actif
exposition maximale totale
drawdown actuel
```

## 7.4. Sorties

```text
score risque
exposition par actif
exposition totale
drawdown
limite dépassée ou non
statut kill switch
action autorisée
```

Phrase écran :

```text
Le risque est lu avant l’opportunité.
```

---

# 8. Écran No-FOMO

## 8.1. Rôle

Empêcher l’achat émotionnel, tardif ou impulsif.

## 8.2. Modules utilisés

```text
atlas_market_math.md
atlas_signal_quality_math.md
atlas_execution_math.md
```

## 8.3. Déclencheurs surveillés

```text
hausse verticale
volume exceptionnel
prix proche du plus haut
urgence émotionnelle
signal social euphorique
absence d’invalidation
frais non calculés
spread inconnu
risque non accepté
```

## 8.4. Sorties

```text
continuer
ralentir
attendre
simulation seulement
refus
```

Phrase écran :

```text
Le signal peut être réel, mais l’entrée peut être trop tardive.
```

---

# 9. Fonctions JavaScript à prévoir

Les fonctions doivent rester locales, déterministes et lisibles.

```text
computeDataQualityGate(input)
computeMarketMath(input)
computeSignalQuality(input)
computeScenarioMath(input)
computeRiskMath(input)
computeMicroTransactionMath(input)
computeExecutionMath(input)
computeAtlasMathVerdict(input)
renderMathModel(state)
renderSimulation(state)
renderRiskPanel(state)
renderNoFomoPanel(state)
```

Règle :

```text
une fonction = un rôle
pas de fonction monstre
```

---

# 10. Structure d’état JS recommandée

```text
state.math = {
  modeRequested: "observation",
  modeAllowed: "observation",
  dataQuality: {},
  market: {},
  signal: {},
  scenario: {},
  risk: {},
  microTransaction: {},
  execution: {},
  verdict: {},
  memoryDraft: {}
}
```

---

# 11. Modèle d’entrée minimal

```text
{
  asset: "bitcoin",
  priceCurrent: null,
  priceReference: null,
  price24h: null,
  price7d: null,
  price30d: null,
  volume24h: null,
  volumeAverage7d: null,
  spreadEstimatedPct: null,
  feesEstimatedPct: null,
  slippageEstimatedPct: null,
  transactionAmount: null,
  capitalAuthorized: null,
  safetyReserve: null,
  maxLossPerOperation: null,
  modeRequested: "observation"
}
```

---

# 12. Modèle de sortie minimal

```text
{
  verdict: "observation",
  allowedAction: "read_only",
  mainReason: "...",
  scores: {
    market: null,
    signal: null,
    scenario: null,
    risk: null,
    microTransaction: null,
    execution: null
  },
  gates: {
    dataQuality: "unknown",
    exchangeConstraints: "unknown",
    riskProfile: "unknown"
  },
  memoryDraft: {
    date: "...",
    asset: "...",
    decision: "...",
    reason: "..."
  }
}
```

---

# 13. Décisions affichables

L’interface doit utiliser un vocabulaire stable :

```text
observation
simulation seulement
préparation seulement
feu orange
feu vert
refus
kill switch
```

Ne pas afficher :

```text
achète maintenant
vends maintenant
opportunité sûre
gain garanti
```

---

# 14. Verrous visuels obligatoires

Chaque écran doit rappeler le mode actuel :

```text
Mode : lecture seule
Aucun ordre réel
Aucune clé API
Aucun capital engagé
```

Pour les zones proches du réel :

```text
Exécution réelle verrouillée
Backend privé requis
Kill switch requis
Journalisation requise
```

---

# 15. Plan de patch index.html

À ajouter ou vérifier :

```text
section Math Model
section Simulation
section Risques
section No-FOMO
cartes de verdict
zones de score
zones de raison principale
zones d’action autorisée
zones mémoire à enregistrer
```

Ne pas modifier la navigation si elle existe déjà.

Ne pas renommer les sections existantes sans nécessité.

---

# 16. Plan de patch style.css

À ajouter ou vérifier :

```text
.math-panel
.math-card
.math-score
.math-verdict
.math-gate
.math-warning
.math-refusal
.math-memory
.readonly-lock
.kill-switch-status
```

Style attendu :

```text
lisible
sobre
premium
pas anxiogène
pas casino
pas exchange agressif
```

---

# 17. Plan de patch app.js

À ajouter en priorité :

```text
initialisation state.math
fonctions compute*
fonctions render*
fonction refreshMathModel()
fonction buildMemoryDraft()
```

Ordre :

```text
1. créer state.math
2. créer computeDataQualityGate()
3. créer computeMarketMath()
4. créer computeRiskMath()
5. créer computeMicroTransactionMath()
6. créer computeExecutionMath()
7. créer renderMathModel()
8. connecter les écrans
```

Ne pas intégrer d’API privée dans ce patch.

---

# 18. Journalisation locale future

Dans cette phase, la mémoire peut rester affichée sous forme de brouillon copiable.

Format :

```text
## Mémoire décision Atlas

Date :
Actif :
Mode :
Hypothèse :
Données :
Scores :
Décision :
Raison :
Action autorisée :
Leçon :
```

Étape future :

```text
stockage local
export JSON
export Markdown
backend privé
```

---

# 19. Tests manuels à faire après patch

## Test 1 — données absentes

Entrée :

```text
aucun prix
aucune source
```

Résultat attendu :

```text
observation seulement
Data Quality Gate : refus
```

## Test 2 — frais trop élevés

Entrée :

```text
montant_transaction = 5
frais_% = 16
gain_cible_% = 4
```

Résultat attendu :

```text
refus micro-transaction
raison : seuil de rentabilité supérieur au gain cible
```

## Test 3 — profil risque absent

Entrée :

```text
capital autorisé absent
perte maximale absente
```

Résultat attendu :

```text
simulation seulement ou refus
Risk Profile Gate : non
```

## Test 4 — FOMO

Entrée :

```text
variation 24h très forte
volume exceptionnel
prix proche du plus haut
```

Résultat attendu :

```text
No-FOMO : ralentir / simulation seulement / refus
```

---

# 20. Ce qui est explicitement interdit dans ce patch

```text
connexion Kraken réelle
clé API
ordre réel
achat
vente
backend privé
automatisation d’exécution
promesse de gain
signal garanti
refonte graphique totale
nouveau système complexe
```

---

# 21. Critère de réussite

Le patch est réussi si :

```text
l’utilisateur voit clairement les mathématiques
les écrans affichent un verdict lisible
les refus sont explicables
les risques sont visibles
les micro-transactions sont contrôlées
aucune action réelle n’est possible
le système produit une mémoire copiable
```

---

# 22. Prochaine étape après ce plan

Après validation de ce fichier :

```text
audit local de index.html / style.css / app.js
création d’un patch lecture seule
test navigateur
correction minimale
sauvegarde ZIP
validation utilisateur
```

Phrase de clôture :

```text
On branche les freins avant le moteur.
```

---

# 23. Changelog interne

## Version 1.0

Création du plan de patch UI lecture seule.

Ajouts :

```text
écrans prioritaires
fonctions JS prévues
state math recommandé
modèles entrée/sortie
verrous visuels
plans index/style/app
tests manuels
interdits du patch
critères de réussite
```
