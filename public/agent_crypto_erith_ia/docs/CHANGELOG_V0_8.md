# Agent-Crypto @erith.IA — Changelog V0.8

Date : 2026-07-20

## Objectif

Corriger les défauts visibles de la V0.7 :

- ticker illisible car texte uniforme ;
- tableau encore bloqué sur “Livecheck requis” alors que CoinGecko répond ;
- Score Observation bloqué en attente ;
- Lecture froide encore en mode accès absent.

## Corrections

- Ticker transformé en éléments lisibles :
  symbole / prix / variation / couleur.
- Table de marché réécrite pour s’afficher après source CoinGecko OK.
- Score Observation connecté au premier actif chargé.
- Lecture froide synchronisée avec Livecheck.
- Compteur Sources OK conservé.
- Règle anti-hallucination inchangée.

## Commit conseillé

```text
fix agent crypto live table and ticker readability v0.8
```
