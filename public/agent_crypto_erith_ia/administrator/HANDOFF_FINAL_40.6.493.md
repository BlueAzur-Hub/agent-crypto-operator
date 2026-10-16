# HANDOFF — 40.6.493 OKX MICRO EXECUTION SHADOW TRUTH

1. Keep Control Center **2.3.2R18** / Bridge **V1.9.13** / Backend **V1.4.3** running. No new Bridge install.
2. Firefox Ctrl+F5 → Administrator **40.6.493** → Simulation.
3. In **EXECUTION COST TRUTH 40.6.492**, click **RAFRAÎCHIR KRAKEN + OKX**.
4. Immediately below it, verify **OKX MICRO EXECUTION SHADOW TRUTH 40.6.493** appears.
5. Expected: tickets 10/25/50/100 EUR and 3 modes: Market→Market, Post-only→Market, Post-only→Post-only.
6. Market→Market must come from the measured 40.6.492 OKX book. Post-only modes must be labelled fee-floor/fill-unknown.
7. Expected safety lock: **POTENTIEL ≠ PASS** and Cost Gate remains unchanged.
8. Optional console proof: `AgentCryptoOkxMicroExecutionShadowTruth.self_test().pass === true`.

Do not alter Strategy thresholds or force a PAPER trade to manufacture a result.
