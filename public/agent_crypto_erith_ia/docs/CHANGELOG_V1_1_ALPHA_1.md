# Agent-Crypto @erith.IA — Changelog V1.1-alpha.1

Date : 2026-07-20

## Objectif

Corriger le test bloquant du profil Solo Débutant 100 €.

## Correction

Avant :
- BTC 50 € pouvait donner l'impression qu'il ne se passait rien.

Maintenant :
- BTC 50 € écrit REFUS dans le journal simulation ;
- DOGE 5 € écrit REFUS dans le journal simulation ;
- tout refus du profil 100 € devient visible ;
- le navigateur ne masque plus le test avec un `max=10` HTML.

## Ajout documentaire

- `docs/DATA_ROADMAP_V1_1_ALPHA_1.md`
- clarification public GitHub Pages / future base locale privée.

## Tests

1. Reset simulation.
2. BTC 5 € : accepté.
3. BTC 50 € : REFUS visible.
4. DOGE 5 € : REFUS visible.
5. BTC 10 + ETH 10 + SOL 10 : accepté.
6. BTC 5 € ensuite : REFUS exposition maximale.

## Commit conseillé

```text
fix visible simulation refusals and add data roadmap v1.1 alpha.1
```
