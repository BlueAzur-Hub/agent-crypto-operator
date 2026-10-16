/* Agent-Crypto @erith.IA — 40.6.223 G3 REALISTIC REPLAY READINESS TRUTH
   Read-only next-blocker owner after 40.6.222 outcome-label certification.
   It does NOT run a backtest and does NOT fabricate execution costs.
   It answers one question only: is the evidence chain ready for a realistic G3 replay?
   PAPER ONLY · G3 PENDING · G9 LOCKED. */
(() => {
  "use strict";

  const BUILD = "40.6.223";
  const OWNER = "G3_REALISTIC_REPLAY_READINESS_OWNER";
  const ROOT_ID = "strategyAG3RealisticReplayReadiness406223";
  const HOST_ID = "strategyAEvidenceSupplements";
  let queued = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const esc = v => String(v ?? "—").replace(/[&<>\"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
  const safe = (fn, fallback = null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; } };
  const int = v => Number.isFinite(Number(v)) ? Number(v) : 0;

  function snapshot() {
    const outcome = safe(globalThis.AgentCryptoStrategyAG3OutcomeCertification?.snapshot, null);
    const cascade = safe(globalThis.AgentCryptoStrategyAG3CascadeCheckpoint?.snapshot, null);
    const after = safe(globalThis.AgentCryptoStrategyAAfterCostMetrics?.summary, null);
    const lifecycle = globalThis.AgentCryptoStrategyAPaperLifecycle || null;

    const replayReady = cascade?.dataset?.ready === true ||
      cascade?.checkpoint?.replay_dataset === "READY_FOR_DECISION_REPLAY" ||
      outcome?.replay_dataset === "READY_FOR_DECISION_REPLAY";
    const outcomesCertified = outcome?.pass === true && outcome?.outcome_labels === "CERTIFIED";
    const afterOwner = !!globalThis.AgentCryptoStrategyAAfterCostMetrics;
    const afterTrades = int(after?.trades);
    const costModelComplete = after?.cost_model_complete === true;
    const ledgerVerified = after?.ledger_consistency_complete === true;

    const lifecycleCapabilities = Object.freeze({
      owner_present: !!lifecycle,
      submit: typeof lifecycle?.submit === "function",
      acknowledge: typeof lifecycle?.acknowledge === "function",
      fill: typeof lifecycle?.fill === "function",
      reconcile: typeof lifecycle?.reconcile === "function",
      timeout: typeof lifecycle?.timeout === "function",
      cancel: typeof lifecycle?.cancel === "function"
    });
    const partialFillLifecyclePresent = lifecycleCapabilities.fill && lifecycleCapabilities.reconcile;

    const latencyModelProven = false;
    const liquidityModelProven = false;

    const blockers = [];
    if (!replayReady) blockers.push("REPLAY_DATASET_NOT_READY");
    if (!outcomesCertified) blockers.push("OUTCOME_LABELS_NOT_CERTIFIED");
    if (!afterOwner) blockers.push("AFTER_COST_OWNER_UNAVAILABLE");
    if (afterOwner && afterTrades < 1) blockers.push("NO_AFTER_COST_PAPER_EVIDENCE");
    if (afterOwner && !costModelComplete) blockers.push("AFTER_COST_COST_MODEL_INCOMPLETE");
    if (afterOwner && !ledgerVerified) blockers.push("AFTER_COST_LEDGER_NOT_VERIFIED");
    if (!partialFillLifecyclePresent) blockers.push("PARTIAL_FILL_LIFECYCLE_UNPROVEN");
    if (!latencyModelProven) blockers.push("LATENCY_MODEL_UNPROVEN");
    if (!liquidityModelProven) blockers.push("LIQUIDITY_MODEL_UNPROVEN");

    const dataLayerReady = replayReady && outcomesCertified;
    const executionLayerReady = afterOwner && afterTrades > 0 &&
      costModelComplete && ledgerVerified && partialFillLifecyclePresent &&
      latencyModelProven && liquidityModelProven;
    const ready = dataLayerReady && executionLayerReady && blockers.length === 0;

    let state = "REALISTIC_REPLAY_NOT_READY";
    if (ready) state = "REALISTIC_REPLAY_READY";
    else if (!dataLayerReady) state = "WAIT_DATA_AND_OUTCOMES";
    else if (afterTrades < 1) state = "WAIT_EXECUTION_EVIDENCE";
    else state = "WAIT_EXECUTION_REALISM";

    return Object.freeze({
      schema: "agent_crypto_g3_realistic_replay_readiness_v1",
      build: BUILD,
      owner: OWNER,
      state,
      ready,
      data_layer: Object.freeze({
        replay_dataset_ready: replayReady,
        outcome_labels_certified: outcomesCertified,
        joined_decisions: int(outcome?.joined_decisions),
        certified_horizons: int(outcome?.certified_horizons),
        expected_horizons: int(outcome?.expected_horizons)
      }),
      execution_layer: Object.freeze({
        after_cost_owner_present: afterOwner,
        after_cost_trades: afterTrades,
        after_cost_sample_state: after?.sample_state || "UNKNOWN",
        cost_model_complete: costModelComplete,
        ledger_consistency_complete: ledgerVerified,
        partial_fill_lifecycle_present: partialFillLifecyclePresent,
        lifecycle_capabilities: lifecycleCapabilities,
        latency_model_proven: latencyModelProven,
        liquidity_model_proven: liquidityModelProven
      }),
      blockers: Object.freeze(blockers),
      next_owner: dataLayerReady ? "EXECUTION_REALISM_OWNER" : "G3_DATA_EVIDENCE_OWNER",
      next_action: dataLayerReady
        ? "PROVE_COST_LATENCY_LIQUIDITY_PARTIAL_FILL_REALISM_WITHOUT_FABRICATION"
        : "COMPLETE_REPLAY_DATASET_AND_POST_T0_OUTCOMES",
      economic_backtest_executed: false,
      profitability_claim: false,
      gate_promotion: false,
      current_oracle_applied_to_past: false,
      future_outcomes_used_as_t0_input: false,
      lookahead: false,
      paper_only: true,
      real_order: false,
      g3: "PENDING",
      g9: "LOCKED"
    });
  }

  function humanState(s) {
    if (s.ready) return "PRÊT POUR BACKTEST RÉALISTE";
    if (s.state === "WAIT_EXECUTION_EVIDENCE") return "DONNÉES MARCHÉ PRÊTES · PREUVE D’EXÉCUTION MANQUANTE";
    if (s.state === "WAIT_EXECUTION_REALISM") return "DONNÉES PRÊTES · MODÈLE D’EXÉCUTION INCOMPLET";
    return "PREUVES G3 ENCORE INCOMPLÈTES";
  }

  function ensureStyle() {
    if (typeof document === "undefined" || byId(`${ROOT_ID}Style`)) return;
    const st = document.createElement("style");
    st.id = `${ROOT_ID}Style`;
    st.textContent = `
      #${ROOT_ID}{margin-top:8px;padding:10px;border:1px solid rgba(255,190,92,.26);border-radius:9px;background:rgba(33,23,7,.28)}
      #${ROOT_ID} .grr-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;flex-wrap:wrap}
      #${ROOT_ID} .grr-title{font:950 9px/1.3 system-ui,sans-serif;letter-spacing:.08em;color:#ffd98a;text-transform:uppercase}
      #${ROOT_ID} .grr-state{font:950 9px/1.1 system-ui,sans-serif;color:#fff0bd}
      #${ROOT_ID} .grr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px;margin-top:8px}
      #${ROOT_ID} .grr-k{padding:7px;border:1px solid rgba(255,255,255,.07);border-radius:7px;background:rgba(3,9,14,.28)}
      #${ROOT_ID} .grr-k span{display:block;font:750 7px/1.2 system-ui,sans-serif;color:#9c8f76;text-transform:uppercase}
      #${ROOT_ID} .grr-k b{display:block;margin-top:2px;font:950 9px/1.25 system-ui,sans-serif;color:#f6f3e9}
      #${ROOT_ID} .grr-note{margin-top:7px;font:650 8px/1.45 system-ui,sans-serif;color:#b0a489}
    `;
    document.head.appendChild(st);
  }

  function render() {
    const s = snapshot();
    if (typeof document === "undefined") return s;
    const host = byId(HOST_ID);
    if (!host) return s;
    ensureStyle();

    let root = byId(ROOT_ID);
    if (!root) { root = document.createElement("section"); root.id = ROOT_ID; }

    const outcome = byId("strategyAG3OutcomeCertification406222");
    if (outcome?.parentElement === host) outcome.insertAdjacentElement("afterend", root);
    else if (root.parentElement !== host) host.appendChild(root);

    root.dataset.build = BUILD;
    root.dataset.ready = String(s.ready);
    const b = s.blockers.slice(0, 5).join(" · ") || "AUCUN";
    root.innerHTML = `
      <div class="grr-head">
        <div class="grr-title">G3 · PROCHAINE ÉTAPE RÉALISTE · ${BUILD}</div>
        <div class="grr-state">${esc(humanState(s))}</div>
      </div>
      <div class="grr-grid">
        <div class="grr-k"><span>Replay marché</span><b>${s.data_layer.replay_dataset_ready ? "PRÊT" : "ATTENTE"}</b></div>
        <div class="grr-k"><span>Résultats post-T0</span><b>${s.data_layer.outcome_labels_certified ? "CERTIFIÉS" : "ATTENTE"}</b></div>
        <div class="grr-k"><span>Preuves after-cost</span><b>${esc(s.execution_layer.after_cost_trades)}</b></div>
        <div class="grr-k"><span>Coûts complets</span><b>${s.execution_layer.cost_model_complete ? "OUI" : "NON"}</b></div>
        <div class="grr-k"><span>Partial fills</span><b>${s.execution_layer.partial_fill_lifecycle_present ? "MOTEUR PRÉSENT" : "NON PROUVÉ"}</b></div>
        <div class="grr-k"><span>Latence / liquidité</span><b>${s.execution_layer.latency_model_proven && s.execution_layer.liquidity_model_proven ? "PROUVÉES" : "À PROUVER"}</b></div>
      </div>
      <div class="grr-note">Blocage réel : ${esc(b)}. Aucun coût inconnu n’est converti en zéro. Aucun backtest ni PASS de Gate 3 n’est créé par cette vue.</div>`;
    return s;
  }

  function selfTest() {
    const s = snapshot();
    const checks = Object.freeze({
      gate_stays_pending: s.g3 === "PENDING",
      no_backtest_execution: s.economic_backtest_executed === false,
      no_profitability_claim: s.profitability_claim === false,
      no_real_order: s.real_order === false,
      no_lookahead: s.lookahead === false
    });
    return Object.freeze({schema:"agent_crypto_g3_realistic_replay_readiness_self_test_v1",build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }

  function schedule() {
    if (queued) return;
    queued = true;
    const run = () => { queued = false; render(); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  globalThis.AgentCryptoStrategyAG3RealisticReplayReadiness = Object.freeze({
    build: BUILD, owner: OWNER, root_id: ROOT_ID, snapshot, render, schedule, self_test: selfTest,
    read_only: true, recurring_timer:false, observer:false, storage_write:false,
    business_network_request:false, gate_promotion:false, economic_backtest:false,
    profitability_claim:false, live_unlock:false, paper_only:true, real_order:false,
    g3:"PENDING", g9:"LOCKED"
  });

  if (typeof document !== "undefined") {
    document.addEventListener("agent-crypto:evidence-data-changed", schedule);
    document.addEventListener("agent-crypto:evidence-refresh-complete", schedule);
    document.addEventListener("agent-crypto:market-series-updated", schedule);
    window.addEventListener("pageshow", schedule);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, {once:true});
    else schedule();
  }
})();