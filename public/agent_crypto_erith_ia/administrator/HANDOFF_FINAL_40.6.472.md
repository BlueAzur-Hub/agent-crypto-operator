# HANDOFF FINAL — 40.6.472

## Terrain 40.6.471
PASS :
- baseline 144/144;
- POTENTIAL 16/16;
- REFERENCE_REPLAY_READY.

Résultats certifiés :
- T+5 : 0/5 couvre 0,6109 %;
- T+15 : 0/3;
- T+60 : 0/7.

Les autres horizons ne doivent pas être comptés comme échecs.

## 40.6.472
Ajoute OKX OUTCOME COVERAGE TRUTH.

Objectif : séparer la preuve négative certifiée des inconnus de couverture, sans élargir la tolérance de 150 s.

Test Firefox :
Ctrl+F5 → Build 40.6.472 → Section 04 → Simulation.
Lire les trois cartes T+5/T+15/T+60 :
- certifiés;
- franchissements observés;
- inconnus.

Si OBSERVED_CROSS_PARTIAL > 0, le franchissement est une observation positive malgré endpoint non certifié.
Si PARTIAL_NO_CROSS ou NO_SAMPLE, conserver INCONNU.

Aucun changement Market Core 38.15.11, Strategy A, Oracle, Risk, Paper, gate ou stockage. Aucun ordre réel.
