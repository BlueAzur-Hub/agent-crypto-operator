# HANDOFF FINAL — 40.6.495 OKX SHADOW EVIDENCE TRUTH

## Firefox terrain proof

1. Ctrl+F5 and verify **Build 40.6.495 · Administrator**.
2. Open **Section 04 → Simulation**.
3. Find **STRATEGY A · OKX SHADOW EVIDENCE TRUTH · 40.6.495**.
4. On a normal Auto A cycle, verify:
   - a **Cycle lié** is displayed;
   - **Oracle historique médiane** and **Expected move cycle lié** are separate;
   - **Comparateur actif** says LINKED_CYCLE_EXPECTED_MOVE for an Auto A experiment-cycle measurement;
   - source quality is one of FULL / PARTIAL / STALE / UNAVAILABLE;
   - age of source is visible;
   - numeric cost and cost+margin remain visible.
5. If the orderbook is unavailable but top-of-book remains valid, expected state is **PARTIAL · TOP OF BOOK ONLY · FRESH**, not a generic SHADOW_READY.
6. If the source is not refreshed for more than 120 s, the laboratory must display **STALE_HISTORY** after its freshness-expiry refresh.
7. Export the lab and verify the session observations retain:
   - cycle_id;
   - source timestamp;
   - coverage;
   - cost_pct;
   - required_with_margin_pct;
   - state / evidence / fill.
8. Verify 40.6.492, Cost Gate, Oracle, Risk, PAPER, Backend/Bridge and Market Core 38.15.11 are unchanged.

PASS terrain requires clear cycle linkage + clear FULL/PARTIAL/STALE semantics + numeric observation history.
