# Agent-Crypto @erith.IA — Changelog V1.0-RC6

Date : 2026-07-20

## Objectif

Corriger le rendu graphique de RC5.

## Problème RC5

Le panneau `Graphique Analyste` était présent, mais le canvas restait vide et le panneau `Détail Actif` pouvait rester en attente.

## Correctifs

- Graphique principal rendu immédiatement.
- Fallback visuel si historique CoinGecko indisponible.
- Historique CoinGecko utilisé quand disponible.
- Détail actif rempli dès que Livecheck OK.
- Clic sur une crypto du tableau :
  - met à jour le graphique ;
  - met à jour le détail actif ;
  - met à jour le score ;
  - surligne la ligne sélectionnée.
- Périodes 24h / 7j / 30j actives.
- Mini-graphiques ajoutés dans le tableau.

## Commit conseillé

```text
fix analyst chart rendering rc6
```
