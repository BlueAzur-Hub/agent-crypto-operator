# Agent-Crypto @erith.IA — Data Schema V1.1-alpha.3

## Fichier exporté

```text
agent_crypto_data_snapshot_YYYY-MM-DD.json
```

## Nature des données

Public-compatible, non sensible.

## Champs principaux

```text
version
generated_at
public_only
warning
profile
simulation
totals
market_snapshot
```

## profile

Contient les règles du profil Solo Débutant 100 € :

```text
capital initial
cryptos autorisées
ticket conseillé
maximum par opération
exposition maximale
réserve minimale
```

## simulation

Contient le portefeuille fictif :

```text
cash_eur
positions_value_eur
total_value_eur
pnl_eur
positions fictives
logs de simulation
```

## market_snapshot

Contient les données publiques si Livecheck est actif :

```text
BTC / ETH / SOL
prix EUR
variation 24h
variation 7j
market cap
volume
source
heure
```

## Interdits

Ne jamais stocker ici :

```text
clé API
seed phrase
wallet réel
compte exchange
identité opérateur
ordre réel
droit de retrait
```
