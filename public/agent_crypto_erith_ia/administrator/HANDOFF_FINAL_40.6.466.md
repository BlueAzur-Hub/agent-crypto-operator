# HANDOFF FINAL — 40.6.466

## Point de départ

40.6.465 est PASS terrain pour l'armement de la Capture :
- panneau visible;
- état ARMED;
- 4 liens 1↔1 uniques restaurés;
- 5 PAPER réellement orphelins;
- 0/4 COMPLETE+VERIFIED;
- spread_eur + slippage_eur manquants sur les 4 liens;
- futurs PAPER capturables, mais aucun nouveau PAPER naturel.

Le Fil Crypto a déjà établi que l'attente passive ne suffit pas : Strategy A accumule les COST WAIT et n'atteint pratiquement jamais Risk/Paper.

## 40.6.466

Nouveau panneau : **STRATEGY A · REAL VENUE COST SHADOW TRUTH · 40.6.466**

But : comparer les `expected_move_pct` historiques des cycles COST_GATE_WAIT au coût venue observable courant + marge, **sans modifier Strategy A**.

### Kraken
Pour 10 / 25 / 50 / 100 €, le carnet public permet un coût Market→Market estimé complet au snapshot. Le shadow compte PASS/WAIT contrefactuels. Le ticket canonique Strategy A est 50 €.

### OKX
Le backend 1.4.2 expose bid/ask + spread, pas le carnet multi-niveaux. Le shadow calcule donc seulement :
frais taker aller-retour + spread courant + marge.

Un cycle au-dessus de ce plancher est **POTENTIAL_PASS_BEFORE_SLIPPAGE**, jamais PASS certifié.

## Interdits maintenus

- Cost Gate legacy 0,80 % inchangé;
- aucune modification Strategy A métier;
- aucune modification Oracle;
- Risk Governor intact;
- Paper intact;
- aucun backfill;
- aucune promotion automatique d'OKX;
- aucune valeur de slippage inventée;
- aucun ordre réel;
- Market Core 38.15.11 protégé.

## Test Firefox

Ctrl+F5 → Build 40.6.466 → Section 04 → Simulation.

Après EXECUTION COST TRUTH, vérifier **REAL VENUE COST SHADOW TRUTH** :
- nombre de COST WAIT historiques;
- legacy PASS;
- lignes Kraken 10/25/50/100 €;
- ticket canonique 50 €;
- ligne OKX POTENTIEL ≠ PASS · SLIPPAGE INCONNU.

Exporter le JSON du nouveau panneau si l'on veut analyser précisément les IDs de cycles shadow PASS / potentiels.
