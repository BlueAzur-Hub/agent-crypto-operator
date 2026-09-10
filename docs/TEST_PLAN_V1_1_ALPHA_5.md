# Agent-Crypto @erith.IA — Test Plan V1.1-alpha.5

## Préparation

```text
Ctrl + F5
Vérifier : GitHub Pack V1.1-alpha.5
Lancer Livecheck
Aller dans Simulation
```

## Test 1 — Créer au moins un snapshot

```text
Tester une opération trop grosse
Enregistrer snapshot maintenant
```

## Test 2 — Lire mémoire

Cliquer :

```text
Lire mémoire
```

Résultat attendu :

```text
Snapshots enregistrés : 1
Tags dominants : montant_trop_gros
Lecture pédagogique présente
```

## Test 3 — Comparer premier / dernier

Avec 1 snapshot :

```text
Comparaison impossible pour l’instant
Il faut au moins 2 snapshots
```

Avec 2 snapshots :

```text
BTC / ETH / SOL affichent une comparaison premier → dernier
```

## Test 4 — Résumer refus

Cliquer :

```text
Résumer refus
```

Résultat attendu :

```text
Montant trop gros : au moins 1
Conclusion : le refus prouve que la sécurité fonctionne
```

## Test 5 — Rapport Markdown

Cliquer :

```text
Télécharger rapport .md
```

Résultat attendu :

```text
Fichier Markdown lisible.
Aucune clé.
Aucun wallet.
Aucun compte réel.
```
