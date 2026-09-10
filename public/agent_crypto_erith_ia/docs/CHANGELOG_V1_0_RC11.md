# Agent-Crypto @erith.IA — Changelog V1.0-RC11

Date : 2026-07-20

## Objectif

Ajouter une couche de commandes IA contrôlées.

## Ajouts

- Section `Crypto Command Layer`.
- Commandes rapides :
  - `help`
  - `market_snapshot`
  - `asset BTC`
  - `chart ETH 7d`
  - `compare BTC ETH`
  - `sources`
  - `category USDT`
  - `risk SOL`
- Sortie JSON lisible.
- Mise à jour du graphique via commande `chart`.
- Comparaison d’actifs.
- Diagnostic sources par commande.
- API interne exposée :
  - `window.AgentCryptoCommands`

## Sécurité

Commandes bloquées :

```text
buy
sell
order
trade
withdraw
transfer
```

## Règle

Aucun ordre réel dans GitHub Pages. Une future intégration exchange devra passer par backend sécurisé, dry-run, logs, limites et validation humaine.

## Commit conseillé

```text
add crypto command layer rc11
```
