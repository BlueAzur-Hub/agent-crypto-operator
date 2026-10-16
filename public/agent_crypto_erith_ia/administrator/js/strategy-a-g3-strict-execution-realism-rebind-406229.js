/* Agent-Crypto @erith.IA — 40.6.229 G3 STRICT EXECUTION REALISM REBIND
   Read-only execution-realism truth over the strict 40.6.228 outcome receipt.
   Proven mechanics are kept separate from actual PAPER terrain evidence.
   No forced trade, no threshold change, no backtest, no Gate promotion.
   PAPER ONLY · G3 PENDING · G9 LOCKED. */
(() => {
  "use strict";

  const BUILD = "40.6.229";
  const OWNER = "G3_STRICT_EXECUTION_REALISM_REBIND_OWNER";
  const ROOT_ID = "strategyAG3StrictExecutionRealismRebind406229";
  const SOURCE_BUILD = "40.6.228";
  const SOURCE_ROOT_ID = "strategyAG3StrictOutcomeRevalidation406228";
  const DOSSIER_ID = "strategyADossier";
  const LEGACY_READINESS_ID = "strategyAG3RealisticReplayReadiness406223";
  const GATE_AUDIT_ID = "strategyAEvidenceGateAudit";
  let queued = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const safe = (fn, fallback = null) => {
    try { return typeof fn === "function" ? fn() : fallback; }
    catch (_) { return fallback; }
  };
  const strictNum = v => {
    if (v === null || v === undefined || typeof v === "boolean") return null;
    if (typeof v === "string" && !v.trim()) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const esc = v => String(v ?? "—").replace(/[&<>\"]/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"
  }[m]));

  function lifecycleTruth() {
    const owner = globalThis.AgentCryptoStrategyAPaperLifecycle || null;
    const capabilities = Object.freeze({
      owner_present: !!owner,
      submit: typeof owner?.submit === "function",
      acknowledge: typeof owner?.acknowledge === "function",
      fill: typeof owner?.fill === "function",
      reconcile: typeof owner?.reconcile === "function",
      timeout: typeof owner?.timeout === "function",
      cancel: typeof owner?.cancel === "function"
    });
    const mechanismPresent = capabilities.owner_present && capabilities.submit &&
      capabilities.acknowledge && capabilities.fill && capabilities.reconcile &&
      capabilities.timeout && capabilities.cancel;
    return Object.freeze({
      build: owner?.build || null,
      capabilities,
      mechanism_present: mechanismPresent,
      partial_fill_mechanism_present: capabilities.fill && capabilities.reconcile,
      paper_only: owner?.paper_only === true,
      real_orders: owner?.real_orders === true
    });
  }

  function acceptanceTruth() {
    const owner = globalThis.AgentCryptoStrategyAPaperAfterCostAcceptance || null;
    const receipt = safe(owner?.read, null);
    const lifecycleChecks = Array.isArray(receipt?.lifecycle?.checks) ? receipt.lifecycle.checks : [];
    const afterCostChecks = Array.isArray(receipt?.after_cost?.checks) ? receipt.after_cost.checks : [];
    const partialChecks = lifecycleChecks.filter(x =>
      ["PARTIAL_FILL", "PARTIAL_FILL_AVERAGE_PRICE"].includes(String(x?.id || ""))
    );
    return Object.freeze({
      owner_present: !!owner,
      build: owner?.build || null,
      receipt_present: !!receipt,
      receipt_pass: receipt?.pass === true,
      partial_fill_lab_checks_present: partialChecks.length === 2,
      partial_fill_lab_checks_pass: partialChecks.length === 2 && partialChecks.every(x => x?.pass === true),
      state_preserved: receipt?.state_preservation?.lifecycle === true &&
        receipt?.state_preservation?.after_cost === true,
      check_count: lifecycleChecks.length + afterCostChecks.length
    });
  }

  function afterCostTruth() {
    const owner = globalThis.AgentCryptoStrategyAAfterCostMetrics || null;
    const summary = safe(owner?.summary, null);
    const rows = safe(owner?.read, []);
    return Object.freeze({
      owner_present: !!owner,
      build: owner?.build || null,
      trades: strictNum(summary?.trades) ?? 0,
      complete_cost_trades: strictNum(summary?.complete_cost_trades) ?? 0,
      verified_accounting_trades: strictNum(summary?.verified_accounting_trades) ?? 0,
      sample_state: summary?.sample_state || "UNKNOWN",
      sample_min: strictNum(summary?.sample_min),
      cost_model_complete: summary?.cost_model_complete === true,
      ledger_consistency_complete: summary?.ledger_consistency_complete === true,
      rows_present: Array.isArray(rows) ? rows.length : 0
    });
  }

  function snapshot() {
    const strictOwner = globalThis.AgentCryptoStrategyAG3StrictOutcomeRevalidation || null;
    const strict = safe(strictOwner?.snapshot, null);
    const lifecycle = lifecycleTruth();
    const acceptance = acceptanceTruth();
    const afterCost = afterCostTruth();
    const blockers = [];

    const dataReady = !!strictOwner && strictOwner.build === SOURCE_BUILD &&
      strict?.pass === true &&
      strict?.outcome_labels === "CERTIFIED_STRICT_DECISION_TIME" &&
      strict?.horizon_anchor === "decision_at";

    if (!dataReady) blockers.push("STRICT_DATA_OUTCOMES_NOT_CERTIFIED");
    if (!lifecycle.mechanism_present) blockers.push("PAPER_LIFECYCLE_MECHANISM_INCOMPLETE");
    if (!lifecycle.partial_fill_mechanism_present) blockers.push("PARTIAL_FILL_MECHANISM_UNAVAILABLE");

    if (afterCost.trades < 1) blockers.push("NO_AFTER_COST_PAPER_TERRAIN_EVIDENCE");
    if (afterCost.trades > 0 && !afterCost.cost_model_complete) blockers.push("AFTER_COST_COST_MODEL_INCOMPLETE");
    if (afterCost.trades > 0 && !afterCost.ledger_consistency_complete) blockers.push("AFTER_COST_LEDGER_NOT_VERIFIED");

    /* A complete-cost trade does not prove that a real partial fill occurred.
       Until a dedicated canonical terrain owner proves one, keep this UNKNOWN/false. */
    const partialFillTerrainProven = false;
    blockers.push("PARTIAL_FILL_TERRAIN_EVIDENCE_UNPROVEN");

    /* Generic network latency and generic market liquidity are not Strategy A
       execution evidence. Dedicated canonical execution evidence is required. */
    const latencyStatus = "NOT_PROVEN";
    const liquidityStatus = "NOT_PROVEN";
    blockers.push("EXECUTION_LATENCY_MODEL_UNPROVEN");
    blockers.push("EXECUTION_LIQUIDITY_MODEL_UNPROVEN");

    const afterCostTerrainReady = afterCost.trades > 0 &&
      afterCost.cost_model_complete && afterCost.ledger_consistency_complete;

    const executionReady = dataReady && lifecycle.mechanism_present &&
      lifecycle.partial_fill_mechanism_present && partialFillTerrainProven &&
      afterCostTerrainReady && latencyStatus === "PROVEN" && liquidityStatus === "PROVEN";

    let state = "WAIT_STRICT_DATA_OUTCOMES";
    if (dataReady && !afterCostTerrainReady) state = "WAIT_NATURAL_PAPER_AFTER_COST_EVIDENCE";
    else if (dataReady && afterCostTerrainReady && !partialFillTerrainProven)
      state = "WAIT_PARTIAL_FILL_LATENCY_LIQUIDITY_REALISM";
    if (executionReady) state = "EXECUTION_REALISM_READY";

    return Object.freeze({
      schema: "agent_crypto_g3_strict_execution_realism_rebind_v1",
      build: BUILD,
      owner: OWNER,
      state,
      ready: executionReady,
      data_layer: Object.freeze({
        strict_outcomes_ready: dataReady,
        source_build: strict?.build || null,
        joined_decisions: strictNum(strict?.joined_decisions) ?? 0,
        certified_horizons: strictNum(strict?.certified_horizons) ?? 0,
        expected_horizons: strictNum(strict?.expected_horizons) ?? 0,
        horizon_anchor: strict?.horizon_anchor || null
      }),
      mechanism_layer: Object.freeze({lifecycle, acceptance}),
      terrain_layer: Object.freeze({
        after_cost: afterCost,
        partial_fill_terrain_proven: partialFillTerrainProven
      }),
      model_layer: Object.freeze({
        execution_latency: latencyStatus,
        execution_liquidity: liquidityStatus,
        generic_network_latency_is_execution_proof: false,
        generic_market_liquidity_is_execution_proof: false
      }),
      blockers: Object.freeze([...new Set(blockers)]),
      next_action: afterCost.trades < 1
        ? "WAIT_FOR_NATURALLY_ELIGIBLE_STRATEGY_A_PAPER_AND_RECORD_COMPLETE_AFTER_COST_FACTS"
        : "PROVE_PARTIAL_FILL_LATENCY_AND_LIQUIDITY_WITH_CANONICAL_STRATEGY_A_EVIDENCE",
      force_trade: false,
      threshold_change: false,
      economic_backtest: false,
      profitability_claim: false,
      gate_promotion: false,
      current_runtime_backfill: false,
      current_oracle_applied_to_past: false,
      future_outcomes_used_as_t0_input: false,
      lookahead: false,
      recurring_timer: false,
      observer: false,
      storage_write: false,
      business_network_request: false,
      paper_only: true,
      real_order: false,
      g3: "PENDING",
      g9: "LOCKED"
    });
  }

  function human(code) {
    const labels = {
      STRICT_DATA_OUTCOMES_NOT_CERTIFIED: "données/outcomes stricts non certifiés",
      PAPER_LIFECYCLE_MECHANISM_INCOMPLETE: "mécanisme lifecycle PAPER incomplet",
      PARTIAL_FILL_MECHANISM_UNAVAILABLE: "mécanisme partial fill indisponible",
      NO_AFTER_COST_PAPER_TERRAIN_EVIDENCE: "aucun trade Strategy A after-cost terrain",
      AFTER_COST_COST_MODEL_INCOMPLETE: "coûts after-cost terrain incomplets",
      AFTER_COST_LEDGER_NOT_VERIFIED: "comptabilité after-cost terrain non vérifiée",
      PARTIAL_FILL_TERRAIN_EVIDENCE_UNPROVEN: "partial fill terrain non prouvé",
      EXECUTION_LATENCY_MODEL_UNPROVEN: "latence d’exécution non prouvée",
      EXECUTION_LIQUIDITY_MODEL_UNPROVEN: "liquidité d’exécution non prouvée"
    };
    return labels[code] || String(code || "preuve inconnue");
  }

  function findG3Row() {
    const audit = byId(GATE_AUDIT_ID);
    if (!audit) return null;
    return Array.from(audit.querySelectorAll(".saga-row")).find(row =>
      String(row.querySelector(".saga-n")?.textContent || "").trim() === "03"
    ) || null;
  }

  function rebindLegacyAudit(s) {
    if (typeof document === "undefined") return false;
    const row = findG3Row();
    if (!row) return false;
    const proof = row.querySelector(".saga-proof");
    const state = row.querySelector(".saga-state");
    if (!proof || !state) return false;
    const next = s.blockers.slice(0, 5).map(human).join(" · ") || "réalisme d’exécution";
    proof.innerHTML = `<b>Preuve canonique stricte :</b> données + outcomes ${s.data_layer.strict_outcomes_ready ? "CERTIFIÉS" : "EN ATTENTE"} · ${s.data_layer.certified_horizons}/${s.data_layer.expected_horizons} horizons · lifecycle ${s.mechanism_layer.lifecycle.mechanism_present ? "PRÉSENT" : "INCOMPLET"} · after-cost terrain ${s.terrain_layer.after_cost.trades} trade(s).<span class="saga-next"><b>Suite :</b> ${esc(next)}. Aucun trade n’est forcé.</span>`;
    state.textContent = "WAIT";
    row.dataset.executionRealismRebind = BUILD;
    row.dataset.strictOutcomeSource = SOURCE_BUILD;
    return true;
  }

  function ensureStyle() {
    if (typeof document === "undefined" || byId(`${ROOT_ID}Style`)) return;
    const style = document.createElement("style");
    style.id = `${ROOT_ID}Style`;
    style.textContent = `
      #${ROOT_ID}{margin:12px 0;padding:14px;border:1px solid rgba(255,190,92,.34);border-radius:12px;background:rgba(25,18,7,.88);color:#dbe7ef}
      #${ROOT_ID} .ser-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
      #${ROOT_ID} .ser-title{font:950 13px/1.3 system-ui;color:#ffd98a;letter-spacing:.04em}
      #${ROOT_ID} .ser-tag{font:950 10px/1.2 system-ui;color:#ffe6a9}
      #${ROOT_ID} .ser-sub{margin-top:4px;font:650 10px/1.45 system-ui;color:#b8aa8c}
      #${ROOT_ID} .ser-grid{display:grid;grid-template-columns:repeat(6,minmax(120px,1fr));gap:7px;margin-top:10px}
      #${ROOT_ID} .ser-k{padding:8px;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:rgba(2,10,16,.38)}
      #${ROOT_ID} .ser-k span{display:block;font:800 8px system-ui;color:#9f947c;text-transform:uppercase}
      #${ROOT_ID} .ser-k b{display:block;margin-top:3px;font:950 10px/1.3 system-ui;color:#fff8e9;overflow-wrap:anywhere}
      #${ROOT_ID} .ser-next{margin-top:9px;padding:8px;border-left:3px solid #f2bd64;background:rgba(242,189,100,.07);font:750 10px/1.5 system-ui;color:#f4dfbb}
      #${ROOT_ID} .ser-proof{margin-top:7px;font:650 9px/1.5 ui-monospace,monospace;color:#a99c81;overflow-wrap:anywhere}
      @media(max-width:1100px){#${ROOT_ID} .ser-grid{grid-template-columns:repeat(2,1fr)}}`;
    document.head.appendChild(style);
  }

  function render(reason = "explicit") {
    const s = snapshot();
    if (typeof document === "undefined") return s;
    const anchor = byId(SOURCE_ROOT_ID) || byId(DOSSIER_ID) || byId("strategyAEvidenceSupplements");
    if (!anchor?.parentElement) return s;

    ensureStyle();
    const legacy = byId(LEGACY_READINESS_ID);
    if (legacy) {
      legacy.hidden = true;
      legacy.setAttribute("aria-hidden", "true");
      legacy.dataset.supersededBy = BUILD;
    }

    let root = byId(ROOT_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = ROOT_ID;
    }
    if (anchor.id === SOURCE_ROOT_ID) {
      if (root.previousElementSibling !== anchor || root.parentElement !== anchor.parentElement)
        anchor.insertAdjacentElement("afterend", root);
    } else if (root.nextElementSibling !== anchor || root.parentElement !== anchor.parentElement) {
      anchor.insertAdjacentElement("beforebegin", root);
    }

    root.dataset.build = BUILD;
    root.dataset.ready = String(s.ready);
    root.dataset.reason = String(reason || "explicit");

    const after = s.terrain_layer.after_cost;
    const acceptance = s.mechanism_layer.acceptance;
    const lab = acceptance.receipt_present
      ? (acceptance.receipt_pass ? `PASS · ${acceptance.check_count} checks` : "FAIL / INCOMPLET")
      : "NON RELANCÉE";
    const blockerText = s.blockers.slice(0, 7).map(human).join(" · ") || "AUCUN";

    root.innerHTML = `
      <div class="ser-head">
        <div>
          <div class="ser-title">STRATEGY A · RÉALISME D’EXÉCUTION · ${BUILD}</div>
          <div class="ser-sub">Séparation stricte : mécanisme disponible ≠ preuve terrain. Aucun coût, délai ou liquidité UNKNOWN n’est inventé.</div>
        </div>
        <div class="ser-tag">G3 PENDING · ${esc(s.state)}</div>
      </div>
      <div class="ser-grid">
        <div class="ser-k"><span>Données + outcomes</span><b>${s.data_layer.strict_outcomes_ready ? "CERTIFIÉS" : "ATTENTE"}</b></div>
        <div class="ser-k"><span>Lifecycle / partial fill</span><b>${s.mechanism_layer.lifecycle.partial_fill_mechanism_present ? "MÉCANISME PRÉSENT" : "INCOMPLET"}</b></div>
        <div class="ser-k"><span>Preuve labo isolée</span><b>${esc(lab)}</b></div>
        <div class="ser-k"><span>After-cost terrain</span><b>${esc(after.trades)} trade(s) · ${esc(after.sample_state)}</b></div>
        <div class="ser-k"><span>Latence exécution</span><b>NON PROUVÉE</b></div>
        <div class="ser-k"><span>Liquidité exécution</span><b>NON PROUVÉE</b></div>
      </div>
      <div class="ser-next"><b>Maintenant :</b> ${after.trades < 1
        ? "attendre un PAPER Strategy A naturellement éligible puis conserver ses coûts complets. Ne pas provoquer de trade pour satisfaire Gate 3."
        : "vérifier coûts/comptabilité terrain, puis prouver séparément partial fills, latence et liquidité."}</div>
      <div class="ser-proof">EXECUTION TRUTH · strict=${esc(s.data_layer.source_build)} · lifecycle=${esc(s.mechanism_layer.lifecycle.build)} · afterCost=${esc(after.build)} · complete=${esc(after.complete_cost_trades)}/${esc(after.trades)} · verified=${esc(after.verified_accounting_trades)}/${esc(after.trades)} · partialFillTerrain=NON_PROUVÉ · blockers=${esc(blockerText)} · G9 LOCKED · PAPER ONLY.</div>`;

    rebindLegacyAudit(s);
    document.documentElement.dataset.agentCryptoG3ExecutionRealism = "406229";
    return s;
  }

  function schedule(reason = "event") {
    if (queued || typeof document === "undefined") return;
    queued = true;
    const run = () => { queued = false; render(reason); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  function selfTest() {
    const s = snapshot();
    const checks = Object.freeze({
      gate_stays_pending: s.g3 === "PENDING",
      partial_fill_terrain_not_fabricated: s.terrain_layer.partial_fill_terrain_proven === false,
      latency_not_fabricated: s.model_layer.execution_latency === "NOT_PROVEN",
      liquidity_not_fabricated: s.model_layer.execution_liquidity === "NOT_PROVEN",
      no_forced_trade: s.force_trade === false,
      no_threshold_change: s.threshold_change === false,
      no_backtest: s.economic_backtest === false,
      no_profitability_claim: s.profitability_claim === false,
      no_real_order: s.real_order === false
    });
    return Object.freeze({
      schema: "agent_crypto_g3_strict_execution_realism_rebind_self_test_v1",
      build: BUILD,
      pass: Object.values(checks).every(Boolean),
      checks
    });
  }

  globalThis.AgentCryptoStrategyAG3StrictExecutionRealismRebind = Object.freeze({
    build: BUILD,
    owner: OWNER,
    root_id: ROOT_ID,
    source_build: SOURCE_BUILD,
    snapshot,
    render,
    schedule,
    self_test: selfTest,
    read_only: true,
    gate_promotion: false,
    economic_backtest: false,
    profitability_claim: false,
    force_trade: false,
    threshold_change: false,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    business_network_request: false,
    paper_only: true,
    real_order: false,
    g3: "PENDING",
    g9: "LOCKED"
  });

  if (typeof document !== "undefined") {
    const rerender = event => {
      const reason = event?.type || "event";
      render(reason);
      schedule(`${reason}-settled`);
    };
    document.addEventListener("click", event => {
      const label = String(event?.target?.closest?.("button,a,summary")?.textContent || "").toLowerCase();
      render(label.includes("export") ? "export-click-capture" : "click-capture");
      schedule("click-settled");
    }, true);
    document.addEventListener("toggle", event => {
      if (event?.target?.open === false) return;
      rerender(event);
    }, true);
    for (const eventName of [
      "erith:system-hydrated",
      "agent-crypto:runtime-modules-ready",
      "agent-crypto:evidence-data-changed",
      "agent-crypto:evidence-refresh-complete",
      "agent-crypto:market-series-updated"
    ]) document.addEventListener(eventName, rerender);
    window.addEventListener("pageshow", rerender);
    window.addEventListener("load", () => {
      render("load");
      schedule("load-settled");
    }, {once:true});
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        render("dom-ready");
        schedule("dom-ready-settled");
      }, {once:true});
    } else {
      render("script-load");
      schedule("script-load-settled");
    }
  }
})();