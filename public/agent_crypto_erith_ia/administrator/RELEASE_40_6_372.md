# Agent-Crypto 40.6.372 — HOVER STATUS LINE

Date: 2026-09-23
Parent: **40.6.371**
Scope: **compact hover state readout for REDIVIDER + Math Core MINI controls**

## REDIVIDER
Native tooltip bubble is removed. On hover/focus:
- active: **REDIVIDER · 100% PRÊT · CHARGÉ · Appuyez pour stopper**
- stopped: **REDIVIDER · COUPÉ · Auto A Paper arrêté · Appuyez pour relancer**
- unavailable: explicit unavailable state.

The line appears above the mini/recall control and disappears on leave/blur.

## Math Core
On hover/focus of Math Core MINI/recall:
**MATH CORE · <score>/100 · <canonical label> · Appuyez pour ouvrir**

The score and label are read from the existing canonical Math DOM. No Math computation is added.

## Cumulative preservation
- 40.6.371 reversible REDIVIDER stop/resume;
- 40.6.370 centered crimson/bold confirmation safety text;
- 40.6.369 continuous 360° REDIVIDER ring;
- Math 40.6.364 behavior/presentation baseline;
- PAPER ONLY, no real orders, no wallet.

## Static gates
- JavaScript parse: PASS;
- native Redivider title tooltip removed: PASS;
- both hover copy routes present: PASS;
- prior reversible/modal/ring contracts present: PASS;
- Firefox terrain: PENDING.
