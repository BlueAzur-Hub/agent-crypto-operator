# HANDOFF FINAL — 40.6.474

## Terrain parent .473

PASS : TRAJECTORY_TRUTH_READY.

Cycle franchissant :
- A-CYCLE-00001-d562dc57;
- premier passage / dernier passage / pic : 22,2 min;
- pic +0,691 %;
- marge vs plancher +0,080 %;
- 1 échantillon >= plancher;
- span observé 0,0 min.

Inconnus T+60 :
- PARTIAL_NO_CROSS : 4;
- ARCHIVE_END_NO_SAMPLE : 0;
- TARGET_GAP_NO_SAMPLE : 4.

## 40.6.474

On arrête de chercher à compléter l'historique ancien.
On fabrique une meilleure preuve future.

Nouveau owner résident :
`AgentCryptoStrategyAProspectiveOutcomeEvidenceCapture`

Pour chaque nouveau COST_GATE_WAIT :
1. persiste T0;
2. demande un snapshot Execution Cost Truth et conserve la preuve OKX observable;
3. sur les cycles suivants, capture T+5 / T+15 / T+60 à ±150 s;
4. persiste endpoint, gap, MFE, MAE;
5. si la fenêtre est ratée, écrit MISSED_WINDOW sans interpolation.

Stockage : IndexedDB Durable Evidence existant, store meta, aucun nouveau schéma.

## Test Firefox

Ctrl+F5 → Build 40.6.474 → Section 04 → Simulation.

Panneau attendu :
**STRATEGY A · PROSPECTIVE OUTCOME + OKX COST EVIDENCE · 40.6.474**

État initial : **ARMED**.

Puis laisser Auto A tourner normalement, sans forcer de PAPER.
Au prochain COST_GATE_WAIT :
- Cycles suivis doit augmenter;
- OKX T0 capturé doit augmenter si la mesure est disponible;
- T+5, T+15 et T+60 doivent se remplir au fil des cycles;
- une absence réelle devient MISSED_WINDOW, jamais une valeur inventée.

Aucun changement de gate. Aucun ordre réel.
