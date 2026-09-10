# Agent-Crypto @erith.IA — Changelog V1.0-RC8

Date : 2026-07-20

## Objectif

Corriger le graphique 24h qui pouvait rester vide jusqu’au clic sur 7j ou 30j, et clarifier les sources rouges.

## Correctifs

- Redraw forcé du canvas après Livecheck.
- Redraw après layout via `requestAnimationFrame`.
- Sélection automatique du premier actif disponible.
- Les boutons 24h / 7j / 30j mettent à jour le graphique sans dépendre du premier rendu.
- `Sources réussies` au lieu de `Sources OK`.
- Sous-texte : sources interrogées + nombre d’échecs.
- Le verrou anti-hallucination explique pourquoi l’état est rouge.

## Commit conseillé

```text
fix chart redraw and source labels rc8
```
