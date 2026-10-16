# HANDOFF FINAL — 40.6.496 OKX DEMO FILL + HORIZON EVIDENCE TRUTH

## Firefox terrain proof

1. Ctrl+F5 and verify **Build 40.6.496 · Administrator**.
2. Open **Section 04 → Simulation**.
3. Find **STRATEGY A · OKX DEMO FILL + HORIZON EVIDENCE TRUTH · 40.6.496**.
4. Verify the V5 evidence card says:
   - **4/10 fills complets**;
   - **40.0 %**;
   - median first fill **20 s**;
   - observed entry fee **0.1000 %**;
   - horizons **+5 / +15 / +30 / +60 / +120 min**.
5. Verify the horizon conclusion is **NON VALIDÉ** for this V5 sample.
6. Verify the table no longer presents generic `FILL INCONNU`; it says **ROUND-TRIP INCONNU**, because V5 measured only the 10 EUR entry leg.
7. Verify the warning explicitly says **25/50/100 EUR have no V5 fill proof**.
8. Verify Strategy A V1 remains **FAIL benchmark figé** and no Strategy A2 activation appears.
9. Verify 40.6.492, Cost Gate, Oracle, Risk, PAPER, Backend/Bridge and Market Core 38.15.11 are unchanged.

PASS terrain requires correct V5 numbers + correct evidence boundary + no gate/business-logic change.
