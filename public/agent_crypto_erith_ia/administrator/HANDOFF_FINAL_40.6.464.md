# HANDOFF FINAL — 40.6.464

Dernier incident: 40.6.463 commitée/déployée mais panneau EXECUTION COST EVIDENCE CAPTURE absent du DOM Firefox.

Correction 40.6.464:
- strategy-core-ready écouté sur window;
- fallback via Strategy A Audit Demand Loader;
- rendu explicite après audits;
- ancres .460/.461/.462 acceptées.

Test unique: Ctrl+F5 → Build 40.6.464 → Section 04 → Simulation → rechercher EXECUTION COST EVIDENCE CAPTURE.
Attendu sans PAPER actif: ARMED · suivis 0 · entrées 0 · sorties 0 · entrée+sortie 0 · After-cost injection OFF.

État transmis:
.459 PASS terrain; .460 PASS diagnostic; .461 PASS diagnostic; .462 PASS diagnostic; .463 FAIL terrain panneau absent; .464 attente preuve Firefox.

Vérités: 4 after-cost liés 1↔1 à 4 PAPER, 5 PAPER orphelins, 0/4 COMPLETE+VERIFIED, blocage commun spread_eur + slippage_eur. Aucun backfill historique.
Ne pas produire .465 automatiquement. Si .464 est visible/ARMED, solder. Sinon lire console / Boot Probe / Audit Demand snapshot avant toute nouvelle modification.
Market Core 38.15.11 protégé.
