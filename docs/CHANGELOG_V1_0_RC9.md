# Agent-Crypto @erith.IA — Changelog V1.0-RC9

Date : 2026-07-20

## Objectif

Clarifier le `5/7` ou `6/7` du Livecheck et ajouter une navigation plus puissante dans le tableau.

## Diagnostic sources

- Panneau visible en haut.
- CoinGecko marqué comme source critique.
- Statut par source :
  - OK ;
  - ÉCHEC ;
  - en attente ;
  - temps de réponse ;
  - détail technique court.
- Message explicite :
  si CoinGecko échoue, le tableau est bloqué même si des sources secondaires répondent.

## Tableau

Filtres :

```text
Tous
BTC / ETH
Stablecoins
Altcoins majeurs
Spéculatifs
```

Tris :

```text
Rang marché
Score décroissant
Volume 24h
24h hausse
24h baisse
Vol/Cap
```

## Commit conseillé

```text
add source diagnostic filters and sorting rc9
```
