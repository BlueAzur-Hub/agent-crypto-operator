# HANDOFF FINAL — 40.6.470

## État validé avant .470

40.6.469 : PASS opérateur pour le montage Capture — panneau unique et ARMED, aucun PAPER forcé.

Référence économique terrain conservée :
- .467 : 144 COST WAIT;
- Kraken shadow 0/144;
- OKX 16 POTENTIAL / 128 WAIT;
- plancher OKX + marge ≈ 0,6109 % avant slippage;
- POTENTIAL ≠ PASS.

La session .469 ultérieure compte déjà 145 COST WAIT et peut avoir un snapshot OKX indisponible. .470 ne recalcule donc pas la population de référence avec le marché courant.

## 40.6.470

Nouveau panneau : **STRATEGY A · OKX POTENTIAL OUTCOME AUDIT · 40.6.470**

Référence figée :
- les 144 premiers cas COST WAIT de l'audit chronologique;
- expected_move >= 0,6109 %;
- 16 candidats attendus.

Pour chacun, MFE cumulée échantillonnée à T+5 / T+15 / T+60.

État attendu :
- **REFERENCE_REPLAY_READY** si 144/144 et 16/16;
- **BASELINE_DRIFT** sinon.

Aucune utilisation du snapshot OKX courant. Aucun changement de gate.

## Test Firefox

Ctrl+F5 → Build 40.6.470 → Section 04 → Simulation.

Relever :
- Baseline reconstruite;
- POTENTIAL reconstruits;
- T+5 couvre plancher;
- T+15 couvre plancher;
- T+60 couvre plancher;
- export JSON si besoin pour les 16 cycle_id.

Ces résultats décideront du prochain chantier analytique, pas d'une modification automatique de seuil.
