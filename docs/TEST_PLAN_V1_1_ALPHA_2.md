# Agent-Crypto @erith.IA — Test Plan V1.1-alpha.2

## Objectif

Valider le Mode École guidé.

La personne qui teste ne doit plus deviner quoi taper dans le formulaire manuel.

## Préparation

```text
Ctrl + F5
Vérifier : GitHub Pack V1.1-alpha.2
Lancer Livecheck
Aller dans Simulation
```

## Tests guidés

### Test 1 — Opération prudente

Cliquer :

```text
1 · Tester une opération prudente
```

Résultat attendu :

```text
Accepté : opération prudente
BTC 5 € est accepté
Capital virtuel : 95 €
Valeur positions : 5 €
```

### Test 2 — Opération trop grosse

Cliquer :

```text
2 · Tester une opération trop grosse
```

Résultat attendu :

```text
Refus normal : opération trop grosse
50 € refusé car maximum opération = 10 €
```

### Test 3 — Crypto interdite

Cliquer :

```text
3 · Tester une crypto interdite
```

Résultat attendu :

```text
Refus normal : crypto non autorisée
DOGE refusé car profil limité à BTC / ETH / SOL
```

### Test 4 — Plafond de sécurité

Cliquer :

```text
4 · Remplir le plafond de sécurité
```

Résultat attendu :

```text
Plafond rempli : 30 € exposés
BTC 10 + ETH 10 + SOL 10
Capital : environ 70 €
```

### Test 5 — Dépassement plafond

Cliquer :

```text
5 · Dépasser le plafond
```

Résultat attendu :

```text
Refus normal : plafond déjà atteint
Après 30 € exposés, BTC 5 € est refusé
```

## Critère de validation

Un non-technicien doit pouvoir tester sans écrire DOGE, sans entrer 50 à la main, sans lire un journal brut.
