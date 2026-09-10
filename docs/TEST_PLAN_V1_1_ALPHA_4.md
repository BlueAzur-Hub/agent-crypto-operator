# Agent-Crypto @erith.IA — Test Plan V1.1-alpha.4

## Préparation

```text
Ctrl + F5
Vérifier : GitHub Pack V1.1-alpha.4
Lancer Livecheck
Aller dans Simulation
```

## Test 1 — Créer une mémoire locale

1. Cliquer `Remettre le simulateur à 100 €`.
2. Cliquer `Tester une opération prudente`.
3. Cliquer `Tester une opération trop grosse`.
4. Cliquer `Enregistrer snapshot maintenant`.

Résultat attendu :

```text
SNAPSHOT ENREGISTRÉ
Mémoire locale : 1/500 snapshots
```

## Test 2 — Voir la mémoire

Cliquer :

```text
Voir mémoire locale
```

Résultat attendu :

```text
Snapshots enregistrés : 1
Dernier snapshot : date locale
Tags apprentissage : achat_simule, montant_trop_gros
```

## Test 3 — Export JSON

Cliquer :

```text
Exporter mémoire JSON
```

Résultat attendu :

```text
Téléchargement d’un fichier .json public-compatible.
```

## Test 4 — Export JSONL

Cliquer :

```text
Exporter mémoire JSONL
```

Résultat attendu :

```text
Téléchargement d’un fichier .jsonl compatible future base locale.
```

## Test 5 — Effacer

Cliquer :

```text
Effacer mémoire locale
```

Résultat attendu :

```text
Mémoire locale effacée.
Compteur revenu à zéro.
```
