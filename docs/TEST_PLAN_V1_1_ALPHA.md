# Plan de test — V1.1-alpha Profil Solo Débutant 100 €

## Test 0 — Recharge

```text
Ctrl + F5
Vérifier : GitHub Pack V1.1-alpha
```

## Test 1 — Profil visible

```text
Aller dans Simulation
Vérifier : Profil actif Solo Débutant 100 €
Vérifier : capital 100 €, ticket 5 €, maximum 10 €, exposition 30 €, réserve 70 €
```

## Test 2 — Reset

```text
Cliquer Reset simulation
Résultat attendu : Capital virtuel 100 €, positions 0 €, total 100 €
```

## Test 3 — Achat accepté

```text
Lancer Livecheck
Simuler achat BTC 5 €
Résultat attendu : accepté
Capital attendu : 95 € environ
Positions attendues : 5 € environ
```

## Test 4 — Montant refusé

```text
Simuler achat BTC 50 €
Résultat attendu : refusé
Raison : maximum débutant 10 €
```

## Test 5 — Crypto refusée

```text
Simuler achat DOGE 5 €
Résultat attendu : refusé
Raison : profil limité à BTC / ETH / SOL
```

## Test 6 — Exposition maximale

```text
Reset simulation
Acheter BTC 10 €
Acheter ETH 10 €
Acheter SOL 10 €
Puis tenter BTC 5 €
Résultat attendu : refusé
Raison : exposition maximale 30 €
```

## Test 7 — Sécurité

```text
Vérifier : aucun compte Kraken/Binance demandé
Vérifier : aucune clé API demandée
Vérifier : aucun wallet réel demandé
Vérifier : aucun ordre réel possible
```
