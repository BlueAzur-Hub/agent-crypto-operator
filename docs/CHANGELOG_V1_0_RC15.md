# Agent-Crypto @erith.IA — Changelog V1.0-RC15

Date : 2026-07-20

## Objectif

Poser le blueprint backend avant toute future connexion Kraken.

## Ajouts

- Section `Backend Blueprint`.
- Séparation :
  - Public : GitHub Pages ;
  - Privé : PC Yohan / backend local ;
  - Exchange : Kraken d’abord.
- Gates backend :
  - B1 Plan public/privé ;
  - B2 Backend local ;
  - B3 Kraken lecture seule ;
  - B4 Logs + kill switch ;
  - B5 Simulation serveur ;
  - B6 Réel humain.
- Commandes IA :
  - `backend_blueprint`
  - `kraken_readonly_plan`
  - `remote_blueprint`
  - `security_review`

## Sécurité

Aucune clé privée dans GitHub Pages.
Aucune clé de retrait.
Aucun ordre réel.
Backend privé requis plus tard.

## Commit conseillé

```text
add backend blueprint rc15
```
