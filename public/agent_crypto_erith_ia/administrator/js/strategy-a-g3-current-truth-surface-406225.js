/* Agent-Crypto @erith.IA — 40.6.225 G3 CURRENT TRUTH SURFACE
   Operator-facing, read-only summary over the terrain-proven 40.6.222 receipt and
   the 40.6.223/224 execution-realism bridge. It does not create evidence, execute
   a backtest, change Strategy A, or promote any Gate.
   PAPER ONLY · G3 PENDING · G9 LOCKED. */
(() => {
  "use strict";

  const BUILD = "40.6.225";
  const OWNER = "G3_CURRENT_TRUTH_SURFACE_OWNER";
  const ROOT_ID = "strategyAG3CurrentTruthSurface406225";
  const DOSSIER_ID = "strategyADossier";
  const AUDIT_ID = "strategyAEvidenceGateAudit";
  let queued = false;

  const PROVEN = Object.freeze({
    receipt_build: "40.6.222",
    temporal_24h: "CERTIFIED",
    replay_dataset: "READY_FOR_DECISION_REPLAY",
    joined_decisions: 2,
    certified_horizons: 6,
    expected_horizons: 6,
    outcome_labels: "CERTIFIED",
    g2: "FOUNDATION_PASS",
    g7: "FOUNDATION_PASS",
    g3: "PENDING",
    g9: "LOCKED"
  });

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const safe = (fn, fallback = null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; } };
  const esc = v => String(v ?? "—").replace(/[&<>\"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
  const int = v => Number.isFinite(Number(v)) ? Number(v) : 0;

  const EXECUTION_CODES = new Set([
    "AFTER_COST_OWNER_UNAVAILABLE",
    "NO_AFTER_COST_PAPER_EVIDENCE",
    "AFTER_COST_COST_MODEL_INCOMPLETE",
    "AFTER_COST_LEDGER_NOT_VERIFIED",
    "PARTIAL_FILL_LIFECYCLE_UNPROVEN",
    "LATENCY_MODEL_UNPROVEN",
    "LIQUIDITY_MODEL_UNPROVEN"
  ]);

  function humanBlocker(code) {
    const map = {
      AFTER_COST_OWNER_UNAVAILABLE: "owner after-cost indisponible",
      NO_AFTER_COST_PAPER_EVIDENCE: "aucune preuve PAPER after-cost certifiable",
      AFTER_COST_COST_MODEL_INCOMPLETE: "modèle de coûts incomplet",
      AFTER_COST_LEDGER_NOT_VERIFIED: "comptabilité after-cost non vérifiée",
      PARTIAL_FILL_LIFECYCLE_UNPROVEN: "partial fills non prouvés",
      LATENCY_MODEL_UNPROVEN: "latence non prouvée",
      LIQUIDITY_MODEL_UNPROVEN: "liquidité non prouvée"
    };
    return map[code] || String(code || "preuve inconnue");
  }

  function snapshot() {
    const outcome = safe(globalThis.AgentCryptoStrategyAG3OutcomeCertification?.snapshot, null);
    const readiness = safe(globalThis.AgentCryptoStrategyAG3RealisticReplayReadiness?.snapshot, null);
    const after = safe(globalThis.AgentCryptoStrategyAAfterCostMetrics?.summary, null);

    let blockers = Array.isArray(readiness?.blockers)
      ? readiness.blockers.filter(code => EXECUTION_CODES.has(code))
      : [];

    if (!blockers.length && readiness?.ready !== true) {
      if (!globalThis.AgentCryptoStrategyAAfterCostMetrics) blockers.push("AFTER_COST_OWNER_UNAVAILABLE");
      else if (int(after?.trades) < 1) blockers.push("NO_AFTER_COST_PAPER_EVIDENCE");
      if (readiness?.execution_layer?.cost_model_complete === false) blockers.push("AFTER_COST_COST_MODEL_INCOMPLETE");
      if (readiness?.execution_layer?.ledger_consistency_complete === false) blockers.push("AFTER_COST_LEDGER_NOT_VERIFIED");
      if (readiness?.execution_layer?.partial_fill_lifecycle_present === false) blockers.push("PARTIAL_FILL_LIFECYCLE_UNPROVEN");
      if (readiness?.execution_layer?.latency_model_proven !== true) blockers.push("LATENCY_MODEL_UNPROVEN");
      if (readiness?.execution_layer?.liquidity_model_proven !== true) blockers.push("LIQUIDITY_MODEL_UNPROVEN");
    }
    blockers = [...new Set(blockers)];

    const runtimeOutcomeVisible = !!outcome;
    const runtimeOutcomeCertified = outcome?.pass === true && outcome?.outcome_labels === "CERTIFIED";
    const runtimeHorizons = int(outcome?.certified_horizons);
    const runtimeExpected = int(outcome?.expected_horizons);

    return Object.freeze({
      schema: "agent_crypto_g3_current_truth_surface_v1",
      build: BUILD,
      owner: OWNER,
      proven: PROVEN,
      current: Object.freeze({
        runtime_outcome_owner_visible: runtimeOutcomeVisible,
        runtime_outcome_certified: runtimeOutcomeCertified,
        runtime_certified_horizons: runtimeHorizons,
        runtime_expected_horizons: runtimeExpected,
        readiness_owner_visible: !!readiness,
        readiness_state: readiness?.state || "UNAVAILABLE",
        after_cost_trades: int(after?.trades),
        after_cost_sample_state: after?.sample_state || "UNKNOWN",
        execution_blockers: Object.freeze(blockers)
      }),
      canonical_next_layer: "EXECUTION_REALISM",
      canonical_next_action: "PROVE_COST_LATENCY_LIQUIDITY_PARTIAL_FILL_REALISM_WITHOUT_FABRICATION",
      historical_receipt_reopened: false,
      gate_promotion: false,
      economic_backtest: false,
      profitability_claim: false,
      storage_write: false,
      business_network_request: false,
      recurring_timer: false,
      observer: false,
      paper_only: true,
      real_order: false,
      g3: "PENDING",
      g9: "LOCKED"
    });
  }

  function ensureStyle() {
    if (typeof document === "undefined" || byId(`${ROOT_ID}Style`)) return;
    const style = document.createElement("style");
    style.id = `${ROOT_ID}Style`;
    style.textContent = `
      #${ROOT_ID}{margin:12px 0;padding:14px;border:1px solid rgba(111,255,215,.30);border-radius:12px;background:linear-gradient(135deg,rgba(4,29,25,.62),rgba(8,18,29,.72))}
      #${ROOT_ID} .gct-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
      #${ROOT_ID} .gct-title{font:950 13px/1.25 system-ui,sans-serif;letter-spacing:.06em;color:#9fffd5;text-transform:uppercase}
      #${ROOT_ID} .gct-sub{margin-top:4px;font:650 11px/1.45 system-ui,sans-serif;color:#a7c5bc}
      #${ROOT_ID} .gct-status{padding:7px 10px;border:1px solid rgba(255,211,110,.30);border-radius:999px;font:950 10px/1 system-ui,sans-serif;color:#ffe29b;background:rgba(255,211,110,.06)}
      #${ROOT_ID} .gct-flow{display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:8px;margin-top:12px}
      #${ROOT_ID} .gct-step{padding:10px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(2,11,18,.34);min-width:0}
      #${ROOT_ID} .gct-step span{display:block;font:800 8px/1.2 system-ui,sans-serif;color:#86a59d;text-transform:uppercase}
      #${ROOT_ID} .gct-step b{display:block;margin-top:4px;font:950 11px/1.3 system-ui,sans-serif;color:#f1fff9;overflow-wrap:anywhere}
      #${ROOT_ID} .gct-step.done{border-color:rgba(111,255,215,.24)}
      #${ROOT_ID} .gct-step.active{border-color:rgba(255,211,110,.34);background:rgba(48,36,7,.20)}
      #${ROOT_ID} .gct-step.locked{border-color:rgba(255,118,151,.24)}
      #${ROOT_ID} .gct-now{margin-top:11px;padding:10px;border-left:3px solid rgba(255,211,110,.72);background:rgba(255,211,110,.055);font:750 11px/1.5 system-ui,sans-serif;color:#e8e2cf}
      #${ROOT_ID} .gct-blockers{margin-top:7px;font:650 10px/1.5 system-ui,sans-serif;color:#b5c6c2}
      #${ROOT_ID} .gct-note{margin-top:8px;font:600 9px/1.45 system-ui,sans-serif;color:#829b96}
      @media(max-width:980px){#${ROOT_ID} .gct-flow{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:620px){#${ROOT_ID} .gct-flow{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function anchor() {
    return byId(DOSSIER_ID) || byId(AUDIT_ID) || null;
  }

  function render(reason = "explicit") {
    if (typeof document === "undefined") return snapshot();

    // Re-apply the presentation-only 40.6.224 bridge whenever this current-truth
    // surface refreshes, because legacy audit refreshes can overwrite its wording.
    safe(globalThis.AgentCryptoStrategyAG3ForwardEvidenceBridge?.render, null);

    const s = snapshot();
    const a = anchor();
    if (!a?.parentElement) return s;
    ensureStyle();

    let root = byId(ROOT_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = ROOT_ID;
    }
    if (root.nextElementSibling !== a || root.parentElement !== a.parentElement) a.insertAdjacentElement("beforebegin", root);

    root.dataset.build = BUILD;
    root.dataset.reason = String(reason || "explicit");
    root.dataset.g3 = "PENDING";
    root.dataset.nextLayer = s.canonical_next_layer;

    const blockers = s.current.execution_blockers.length
      ? s.current.execution_blockers.slice(0, 6).map(humanBlocker).join(" · ")
      : "preuves d’exécution à compléter sans valeur inventée";

    const runtimeReceipt = s.current.runtime_outcome_owner_visible
      ? (s.current.runtime_outcome_certified
          ? `Le runtime courant confirme ${s.current.runtime_certified_horizons}/${s.current.runtime_expected_horizons}.`
          : "Le owner runtime courant n’expose pas encore le receipt certifié ; cela ne rouvre pas la preuve terrain 40.6.222.")
      : "Le owner runtime courant n’est pas visible ; la preuve terrain 40.6.222 reste la référence fermée.";

    root.innerHTML = `
      <div class="gct-head">
        <div>
          <div class="gct-title">STRATEGY A · ÉTAT ACTUEL G3 · ${BUILD}</div>
          <div class="gct-sub">Résumé opérateur canonique : ce qui est déjà prouvé, ce qui bloque maintenant, sans rouvrir le legacy.</div>
        </div>
        <div class="gct-status">G3 PENDING · EXECUTION REALISM</div>
      </div>
      <div class="gct-flow">
        <div class="gct-step done"><span>Historique 24 h</span><b>CERTIFIÉ</b></div>
        <div class="gct-step done"><span>T0 + replay</span><b>2 décisions jointes · PRÊT</b></div>
        <div class="gct-step done"><span>Résultats post-T0</span><b>6 / 6 CERTIFIÉS</b></div>
        <div class="gct-step active"><span>Étape actuelle</span><b>RÉALISME D’EXÉCUTION</b></div>
        <div class="gct-step locked"><span>Micro-live</span><b>G9 VERROUILLÉ</b></div>
      </div>
      <div class="gct-now"><b>Maintenant :</b> prouver les coûts after-cost, les partial fills, la latence et la liquidité. Aucun UNKNOWN n’est converti en zéro et aucun trade n’est forcé.</div>
      <div class="gct-blockers"><b>Blocages d’exécution observables :</b> ${esc(blockers)}.</div>
      <div class="gct-note">Preuve canonique fermée : terrain 40.6.222 · 24 h certifiées · replay prêt · 2 décisions jointes · 6/6 horizons T+5/T+15/T+60 certifiés. ${esc(runtimeReceipt)} Les anciens panneaux restent auditables mais ne définissent plus la prochaine étape.</div>`;

    return s;
  }

  function selfTest() {
    const s = snapshot();
    const checks = Object.freeze({
      terrain_receipt_closed: s.proven.outcome_labels === "CERTIFIED" && s.proven.certified_horizons === 6 && s.proven.expected_horizons === 6,
      next_layer_execution_realism: s.canonical_next_layer === "EXECUTION_REALISM",
      gate_stays_pending: s.g3 === "PENDING",
      g9_locked: s.g9 === "LOCKED",
      no_backtest_execution: s.economic_backtest === false,
      no_profitability_claim: s.profitability_claim === false,
      no_real_order: s.real_order === false
    });
    return Object.freeze({schema:"agent_crypto_g3_current_truth_surface_self_test_v1",build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }

  function schedule(reason = "event") {
    if (queued || typeof document === "undefined") return;
    queued = true;
    const run = () => { queued = false; render(reason); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  globalThis.AgentCryptoStrategyAG3CurrentTruthSurface = Object.freeze({
    build: BUILD,
    owner: OWNER,
    root_id: ROOT_ID,
    snapshot,
    render,
    schedule,
    self_test: selfTest,
    receipt_build: PROVEN.receipt_build,
    presentation_only: true,
    historical_receipt_reopened: false,
    gate_promotion: false,
    economic_backtest: false,
    profitability_claim: false,
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
    document.addEventListener("agent-crypto:evidence-data-changed", () => schedule("evidence-data-changed"));
    document.addEventListener("agent-crypto:evidence-refresh-complete", () => schedule("evidence-refresh-complete"));
    document.addEventListener("agent-crypto:runtime-modules-ready", () => schedule("runtime-modules-ready"), {once:true});
    document.addEventListener("erith:system-hydrated", () => schedule("system-hydrated"), {once:true,passive:true});
    document.addEventListener("click", event => {
      const b = event?.target?.closest?.("button");
      if (b && /rafraîchir\s+marché|actualiser\s+preuves|exporter\s+dossier/i.test(String(b.textContent || ""))) schedule("operator-action");
    }, false);
    window.addEventListener("pageshow", () => schedule("pageshow"));
    window.addEventListener("load", () => schedule("load"), {once:true});
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => schedule("dom-ready"), {once:true});
    else schedule("script-load");
  }
})();
