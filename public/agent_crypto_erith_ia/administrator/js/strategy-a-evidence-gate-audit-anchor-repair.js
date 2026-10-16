/* Agent-Crypto @erith.IA — 40.6.158 STRATEGY A AUDIT ANCHOR REPAIR
   Terrain repair for 40.6.157: build loaded in Firefox, but the audit/button could
   miss the late-mounted PAPER V2 proof bridge. Event-driven retries only.

   40.6.165 extension — G3 REALISTIC REPLAY CONTRACT
   Defines the historical replay row contract inside the existing Evidence Dossier:
   frozen Strategy A inputs at t0, unique replay identity, strictly post-t0 outcomes,
   certified outcome labels, and an explicit future-leakage prohibition.
   This extension does NOT construct a dataset, execute a backtest, promote G3,
   mutate Strategy A business logic, add storage/timer/observer, or place any order. */
(() => {
  "use strict";

  const ANCHOR_RELEASE = "40.6.158";
  const BUILD = "40.6.165";
  const ROOT_ID = "strategyAEvidenceGateAudit";
  const CONTRACT_ID = "strategyAG3RealisticReplayContract";
  const REQUIRED_FIELDS = Object.freeze([
    "replay_id", "decision_at", "decision_fingerprint", "strategy_inputs_t0",
    "market_source_id", "outcome_at", "outcome_values", "outcome_label_status"
  ]);

  function byId(id) { return document.getElementById(id); }
  function numText(value, fallback = 0) {
    const n = parseInt(String(value ?? "").replace(/\s+/g, ""), 10);
    return Number.isFinite(n) ? n : fallback;
  }
  function g3Value(key) {
    return String(byId("strategyADossier")?.querySelector(`[data-g3="${key}"]`)?.textContent || "").trim();
  }

  function contractSnapshot() {
    const retro = (g3Value("retro").match(/(\d+)\s*\/\s*(\d+)/) || []).slice(1).map(Number);
    let derived = null;
    try { derived = globalThis.atlasRetrospectiveValidation?.derive?.() || null; } catch (_) {}
    const currentTotal = Array.isArray(derived?.currents) ? derived.currents.length : (Number.isFinite(retro[1]) ? retro[1] : 0);
    const currentEvaluable = Array.isArray(derived?.evaluable) ? derived.evaluable.length : (Number.isFinite(retro[0]) ? retro[0] : 0);
    const temporal = globalThis.__AGENT_CRYPTO_RETROSPECTIVE_VALIDATION_3961__ || null;
    const strictPostT0 = temporal?.pairs_only_after_current_close === true;
    const seriesPoints = numText(g3Value("series"), 0);
    const memoryObservations = numText(g3Value("memory"), 0);
    const sourceCandidate = seriesPoints > 0 || memoryObservations > 0;

    return {
      schema: "agent_crypto_strategy_a_realistic_replay_contract_v1",
      build: BUILD,
      definition_ready: REQUIRED_FIELDS.length === 8,
      required_fields: [...REQUIRED_FIELDS],
      source_historical_candidate: sourceCandidate,
      candidate_current_units: currentTotal,
      evaluable_current_units: currentEvaluable,
      strict_post_t0_rule_available: strictPostT0,
      strategy_inputs_t0_certified: false,
      unique_replay_identity_required: true,
      certified_outcome_labels: false,
      certified_replay_rows: 0,
      future_leakage_forbidden: true,
      replay_contract_ready: false,
      dataset_ready: false,
      backtest_ready: false,
      g3_state: "PENDING",
      reason: "Contrat défini. G3 reste PENDING : les inputs Strategy A à t0, l'identité replay et les labels outcome ne sont pas encore certifiés.",
      safety: {
        passive_read: true,
        automatic_replay: false,
        fabricated_data: false,
        network_data_request: false,
        storage_write: false,
        recurring_timer: false,
        observer: false,
        real_orders: false
      }
    };
  }

  function ensureContractStyle() {
    if (byId("strategyAG3RealisticReplayContractStyle")) return;
    const style = document.createElement("style");
    style.id = "strategyAG3RealisticReplayContractStyle";
    style.textContent = `
      #${CONTRACT_ID}{margin-top:9px;padding:8px;border:1px solid rgba(91,219,171,.22);border-radius:8px;background:rgba(6,25,24,.34)}
      #${CONTRACT_ID} .g3rc-title{font-size:8px;font-weight:950;letter-spacing:.08em;color:#8ff0d1;text-transform:uppercase}
      #${CONTRACT_ID} .g3rc-sub,#${CONTRACT_ID} .g3rc-reason{margin-top:4px;font-size:8px;line-height:1.35;color:#88a8a3}
      #${CONTRACT_ID} .g3rc-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin-top:7px}
      #${CONTRACT_ID} .g3rc-k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px}
      #${CONTRACT_ID} .g3rc-k span{display:block;font-size:7px;color:#71958f;text-transform:uppercase}
      #${CONTRACT_ID} .g3rc-k b{display:block;margin-top:3px;font-size:9px;color:#dffbf2}
      @media(max-width:950px){#${CONTRACT_ID} .g3rc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

  function renderContract() {
    const dossier = byId("strategyADossier");
    const g3 = dossier?.querySelector(".sad-g3");
    if (!dossier || !g3) return false;
    ensureContractStyle();

    let panel = byId(CONTRACT_ID);
    if (!panel) {
      panel = document.createElement("section");
      panel.id = CONTRACT_ID;
      panel.innerHTML = `
        <div class="g3rc-title">G3 · REALISTIC REPLAY CONTRACT · ${BUILD}</div>
        <div class="g3rc-sub">t0 figé → outcome strictement postérieur · future leakage interdite · aucun backtest exécuté.</div>
        <div class="g3rc-grid">
          <div class="g3rc-k"><span>Définition contrat</span><b data-g3rc="definition">READY</b></div>
          <div class="g3rc-k"><span>Source historique</span><b data-g3rc="source">—</b></div>
          <div class="g3rc-k"><span>CURRENT t0 candidats</span><b data-g3rc="currents">0/0</b></div>
          <div class="g3rc-k"><span>Post-t0 strict</span><b data-g3rc="postt0">UNVERIFIED</b></div>
          <div class="g3rc-k"><span>Inputs Strategy A t0</span><b data-g3rc="inputs">NOT PROVEN</b></div>
          <div class="g3rc-k"><span>ID replay unique</span><b data-g3rc="identity">REQUIRED</b></div>
          <div class="g3rc-k"><span>Labels outcome</span><b data-g3rc="labels">NOT CERTIFIED</b></div>
          <div class="g3rc-k"><span>Lignes certifiées</span><b data-g3rc="rows">0</b></div>
          <div class="g3rc-k"><span>Future leakage</span><b data-g3rc="leakage">FORBIDDEN</b></div>
          <div class="g3rc-k"><span>Dataset replay</span><b data-g3rc="dataset">NOT READY</b></div>
          <div class="g3rc-k"><span>G3</span><b data-g3rc="state">PENDING</b></div>
        </div>
        <div class="g3rc-reason" data-g3rc="reason"></div>`;
      g3.insertAdjacentElement("afterend", panel);
    }

    const c = contractSnapshot();
    const set = (key, value) => {
      const node = panel.querySelector(`[data-g3rc="${key}"]`);
      if (node) node.textContent = String(value);
    };
    set("definition", c.definition_ready ? "READY" : "NOT READY");
    set("source", c.source_historical_candidate ? "CANDIDATE" : "MISSING");
    set("currents", `${c.evaluable_current_units}/${c.candidate_current_units}`);
    set("postt0", c.strict_post_t0_rule_available ? "RULE DEFINED" : "UNVERIFIED");
    set("inputs", "NOT PROVEN");
    set("identity", "REQUIRED");
    set("labels", "NOT CERTIFIED");
    set("rows", c.certified_replay_rows);
    set("leakage", "FORBIDDEN");
    set("dataset", "NOT READY");
    set("state", "PENDING");
    set("reason", c.reason);
    panel.dataset.build = BUILD;
    panel.dataset.g3State = "PENDING";
    panel.dataset.backtestReady = "false";
    return true;
  }

  function relocate() {
    const bridge = byId("strategyAPaperV2ProofBridge");
    const root = byId(ROOT_ID);
    const list = bridge?.querySelector(".sapv2-gate-list");
    if (!bridge || !root || !list) return false;
    if (root.previousElementSibling !== list) list.insertAdjacentElement("afterend", root);
    root.dataset.anchorRepair = ANCHOR_RELEASE;
    const title = root.querySelector(".saga-title");
    if (title) title.textContent = `AUDIT DES 9 GATES · ${ANCHOR_RELEASE}`;
    renderContract();
    return true;
  }

  function repair() {
    const bridge = byId("strategyAPaperV2ProofBridge");
    const api = globalThis.AgentCryptoStrategyAEvidenceGateAudit || null;
    if (!bridge || !api || typeof api.render !== "function") return false;
    if (!byId(ROOT_ID)) {
      try { api.render(); } catch (_) { return false; }
    }
    const repaired = relocate();
    renderContract();
    return repaired;
  }

  function retry() {
    try { return repair(); } catch (_) { return false; }
  }

  function afterPaint() {
    try { requestAnimationFrame(() => requestAnimationFrame(retry)); }
    catch (_) { retry(); }
  }

  globalThis.AgentCryptoStrategyAEvidenceGateAuditAnchorRepair = Object.freeze({
    release: ANCHOR_RELEASE,
    owner: "strategy-a-evidence-gate-audit-anchor-repair",
    repair,
    timer_added: false,
    observer_added: false,
    storage_write: false,
    network: false,
    paper_only: true,
    real_order: false,
    thresholds_changed: false,
    business_logic_changed: false
  });

  globalThis.AgentCryptoStrategyAG3RealisticReplayContract = Object.freeze({
    build: BUILD,
    snapshot: contractSnapshot,
    render: renderContract,
    required_fields: [...REQUIRED_FIELDS],
    automatic_replay: false,
    fabricated_data: false,
    replay_contract_ready: false,
    backtest_ready: false,
    g3_state: "PENDING",
    network_data_request: false,
    storage_write: false,
    recurring_timer: false,
    observer: false,
    real_orders: false
  });

  document.addEventListener("click", retry, true);
  document.addEventListener("focusin", retry, true);
  window.addEventListener("pageshow", retry);
  document.addEventListener("agent-crypto:runtime-modules-ready", () => { retry(); afterPaint(); }, { once: true });
  document.addEventListener("erith:system-hydrated", () => { retry(); afterPaint(); }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { retry(); afterPaint(); }, { once: true });
    window.addEventListener("load", () => { retry(); afterPaint(); }, { once: true });
  } else {
    retry();
    afterPaint();
  }
})();