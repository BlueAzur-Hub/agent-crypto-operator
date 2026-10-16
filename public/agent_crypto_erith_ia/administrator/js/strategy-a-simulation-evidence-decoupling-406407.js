/* Agent-Crypto Administrator — 40.6.407 SIMULATION STATUS RELOCATION
   Presentation + explicit-demand routing only.
   Goals:
   - expose Strategy A automatic state inside Simulation only;
   - show the nine Gates from the resident Safety Certification matrix;
   - never turn an ordinary Simulation/Evidence click into a 28-module Evidence demand;
   - keep full Evidence available behind one explicit operator control.
   No business threshold, gate state, timer, observer, storage, network or order path is changed. */
(() => {
  "use strict";

  if (globalThis.AgentCryptoSimulationEvidenceDecoupling406407) return;

  const BUILD = "40.6.407";
  const OWNER = "strategy-a-simulation-evidence-decoupling-406407.js";
  const STATUS_ID = "strategyASimulationStatus406407";
  const SUMMARY_ID = "strategyAGateSummary406406";
  const STYLE_ID = "strategyASimulationEvidenceDecouplingStyle406406";
  let renderQueued = false;

  const byId = id => document.getElementById(id);
  const text = value => value == null ? "" : String(value);
  const escapeHtml = value => text(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  function autoSnapshot() {
    try {
      const owner = globalThis.AgentCryptoStrategyAAutoStart?.snapshot?.() || null;
      const runner = owner?.runner_state || globalThis.AgentCryptoAutoPaperRunner?.state?.() || null;
      return { owner, runner };
    } catch (_) {
      return { owner: null, runner: null };
    }
  }

  function autoState() {
    const { owner, runner } = autoSnapshot();
    const manualStop = owner?.manual_stop === true;
    const enabled = runner?.enabled === true;
    const raw = [
      runner?.phase,
      runner?.state,
      runner?.status,
      runner?.last_action,
      owner?.last_action
    ].filter(Boolean).join(" ").toUpperCase();

    if (manualStop || /STOP/.test(raw)) {
      return { key: "STOP", label: "STRATEGY A · STOP", detail: owner?.manual_stop_reason || runner?.last_action || owner?.last_action || "STOP opérateur" };
    }
    if (enabled && /(WAIT|ATTENTE|COST GATE|MARKET)/.test(raw)) {
      return { key: "WAIT", label: "STRATEGY A · WAIT", detail: runner?.last_action || runner?.phase || runner?.state || "Auto A actif · attente marché" };
    }
    if (enabled) {
      return { key: "ACTIVE", label: "STRATEGY A · AUTO A ACTIF", detail: runner?.last_action || runner?.phase || runner?.state || "Runner PAPER actif" };
    }
    if (owner?.runner_available === false || !runner) {
      return { key: "PENDING", label: "STRATEGY A · ATTENTE", detail: owner?.last_action || "Owner PAPER en attente" };
    }
    return { key: "PENDING", label: "STRATEGY A · ATTENTE", detail: runner?.last_action || owner?.last_action || "Initialisation" };
  }

  function matrixSnapshot() {
    try {
      const matrix = globalThis.AgentCryptoStrategyASafetyCertification?.certification_matrix?.();
      if (!Array.isArray(matrix?.gates)) return null;
      return matrix;
    } catch (_) {
      return null;
    }
  }

  function evidenceSnapshot() {
    try { return globalThis.AgentCryptoCanonicalEvidenceWiring?.snapshot?.() || null; }
    catch (_) { return null; }
  }

  function ensureStyle() {
    if (byId(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${STATUS_ID}{
        display:flex;
        align-items:center;
        gap:8px;
        margin:8px 0 10px;
        padding:7px 9px;
        border:1px solid rgba(111,225,195,.20);
        border-radius:9px;
        background:rgba(9,38,42,.28);
      }
      #${STATUS_ID} .se407-label{
        display:inline-flex;
        align-items:center;
        min-height:26px;
        padding:5px 9px;
        border:1px solid rgba(111,225,195,.32);
        border-radius:999px;
        background:rgba(30,111,91,.16);
        color:#b8ffe8;
        font:900 9px/1 system-ui,sans-serif;
        white-space:nowrap;
      }
      #${STATUS_ID}[data-state="WAIT"] .se407-label{
        border-color:rgba(255,211,92,.32);
        background:rgba(116,87,22,.16);
        color:#ffe398;
      }
      #${STATUS_ID}[data-state="STOP"] .se407-label{
        border-color:rgba(255,102,126,.38);
        background:rgba(115,31,50,.20);
        color:#ffb3c1;
      }
      #${STATUS_ID}[data-state="PENDING"] .se407-label{
        border-color:rgba(120,171,206,.26);
        background:rgba(34,65,86,.16);
        color:#b7d3e4;
      }
      #${STATUS_ID} .se407-note{
        color:#819ca6;
        font:700 8px/1.3 system-ui,sans-serif;
      }
      #${SUMMARY_ID}{
        margin:9px 0;
        padding:10px;
        border:1px solid rgba(99,221,200,.23);
        border-radius:10px;
        background:linear-gradient(135deg,rgba(7,31,37,.55),rgba(8,18,30,.62));
        box-shadow:inset 0 1px 0 rgba(255,255,255,.035);
      }
      #${SUMMARY_ID} .se406-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
        flex-wrap:wrap;
      }
      #${SUMMARY_ID} .se406-kicker{
        font:950 8px/1.2 system-ui,sans-serif;
        letter-spacing:.10em;
        color:#72e8d1;
        text-transform:uppercase;
      }
      #${SUMMARY_ID} .se406-title{
        margin-top:3px;
        font:900 13px/1.25 system-ui,sans-serif;
        color:#ecfbf7;
      }
      #${SUMMARY_ID} .se406-sub{
        margin-top:3px;
        font:600 8.5px/1.4 system-ui,sans-serif;
        color:#8ca9b2;
      }
      #${SUMMARY_ID} .se406-actions{
        display:flex;
        align-items:center;
        gap:7px;
        flex-wrap:wrap;
      }
      #${SUMMARY_ID} .se406-evidence-state{
        padding:5px 7px;
        border:1px solid rgba(255,255,255,.08);
        border-radius:999px;
        font:850 8px/1 system-ui,sans-serif;
        color:#9fb9c2;
        background:rgba(255,255,255,.025);
      }
      #${SUMMARY_ID} [data-strategy-evidence-demand="true"]{
        min-height:32px;
        padding:7px 10px;
        border:1px solid rgba(177,150,255,.32);
        border-radius:8px;
        background:rgba(80,57,137,.18);
        color:#d9cbff;
        font:900 8.5px/1 system-ui,sans-serif;
        letter-spacing:.03em;
        cursor:pointer;
      }
      #${SUMMARY_ID} .se406-gates{
        display:grid;
        grid-template-columns:repeat(9,minmax(72px,1fr));
        gap:5px;
        margin-top:9px;
      }
      #${SUMMARY_ID} .se406-gate{
        min-width:0;
        padding:7px 6px;
        border:1px solid rgba(255,255,255,.07);
        border-radius:8px;
        background:rgba(3,14,22,.52);
      }
      #${SUMMARY_ID} .se406-gate b{
        display:block;
        font:950 8px/1.1 system-ui,sans-serif;
        color:#edf7f8;
      }
      #${SUMMARY_ID} .se406-gate span{
        display:block;
        margin-top:3px;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        font:700 7.5px/1.2 system-ui,sans-serif;
        color:#829ba5;
      }
      #${SUMMARY_ID} .se406-gate small{
        display:block;
        margin-top:4px;
        font:900 7.5px/1.15 system-ui,sans-serif;
        color:#f3cf70;
      }
      #${SUMMARY_ID} .se406-gate[data-state="FOUNDATION_PASS"] small,
      #${SUMMARY_ID} .se406-gate[data-state="PASS"] small{
        color:#89e7b6;
      }
      #${SUMMARY_ID} .se406-gate[data-state="LOCKED"] small{
        color:#ff9bad;
      }
      #${SUMMARY_ID} .se406-empty{
        margin-top:9px;
        padding:8px;
        border:1px solid rgba(255,204,91,.16);
        border-radius:8px;
        color:#d9bd76;
        font:700 8.5px/1.4 system-ui,sans-serif;
      }
      @media(max-width:1250px){
        #${SUMMARY_ID} .se406-gates{grid-template-columns:repeat(3,minmax(0,1fr))}
      }
      @media(max-width:720px){
        #${SUMMARY_ID} .se406-gates{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);
  }

  function renderSimulationStatus() {
    byId("strategyAAutoHeadlessStatus406406")?.remove();
    const simulation = byId("simulation");
    if (!simulation) return false;

    let node = byId(STATUS_ID);
    if (!node) {
      node = document.createElement("div");
      node.id = STATUS_ID;
      node.setAttribute("aria-live", "polite");
      node.setAttribute("aria-atomic", "true");
      const head = simulation.querySelector(":scope > .section-head");
      if (head) head.insertAdjacentElement("afterend", node);
      else simulation.prepend(node);
    }

    const state = autoState();
    node.dataset.state = state.key;
    node.innerHTML = `<span class="se407-label">${escapeHtml(state.label)}</span><span class="se407-note">Automatique · PAPER · état de Strategy A</span>`;
    node.title = text(state.detail);
    return true;
  }

  function summaryAnchor() {
    return byId("strategyASafety")
      || byId("strategyAAfterCost")
      || byId("strategyAPaperLifecycle")
      || byId("strategyADossier")
      || byId("strategyAPaperV2ProofBridge");
  }

  function renderGateSummary() {
    const anchor = summaryAnchor();
    if (!anchor) return false;

    let root = byId(SUMMARY_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = SUMMARY_ID;
      root.dataset.owner = OWNER;
      root.dataset.build = BUILD;
      root.dataset.lightweightGateSource = "AgentCryptoStrategyASafetyCertification.certification_matrix";
      anchor.insertAdjacentElement("beforebegin", root);
    }

    const matrix = matrixSnapshot();
    const evidence = evidenceSnapshot();
    const auto = autoState();
    const evidenceLabel = evidence
      ? `Evidence complet ${Number(evidence.loaded || 0)}/${Number(evidence.total || 0)}`
      : "Evidence complet 0/28";

    if (!matrix) {
      root.innerHTML = `
        <div class="se406-head">
          <div>
            <div class="se406-kicker">STRATEGY A · RÉSUMÉ LÉGER · ${BUILD}</div>
            <div class="se406-title">${escapeHtml(auto.label)}</div>
            <div class="se406-sub">Matrice des 9 Gates en attente du Strategy Core. Aucune charge Evidence déclenchée.</div>
          </div>
          <div class="se406-actions">
            <span class="se406-evidence-state">${escapeHtml(evidenceLabel)}</span>
            <button type="button" data-strategy-evidence-demand="true" data-strategy-evidence-reason="operator-explicit-open-evidence">OUVRIR LES PREUVES</button>
          </div>
        </div>
        <div class="se406-empty">Résumé indisponible tant que Safety Certification n'est pas résidente. Le système ne charge pas les 28 modules pour combler ce manque.</div>
      `;
      return true;
    }

    const gates = matrix.gates.map(row => {
      const state = text(row?.state || "UNKNOWN").toUpperCase();
      return `
        <div class="se406-gate" data-state="${escapeHtml(state)}" title="${escapeHtml(row?.note || "")}">
          <b>G${escapeHtml(row?.gate ?? "?")}</b>
          <span>${escapeHtml(row?.label || "Gate")}</span>
          <small>${escapeHtml(state)}</small>
        </div>
      `;
    }).join("");

    root.innerHTML = `
      <div class="se406-head">
        <div>
          <div class="se406-kicker">STRATEGY A · 9 GATES · RÉSUMÉ LÉGER · ${BUILD}</div>
          <div class="se406-title">${escapeHtml(auto.label)}</div>
          <div class="se406-sub">Source résidente : Safety Certification · lecture seule · ouvrir Simulation ne charge plus Evidence.</div>
        </div>
        <div class="se406-actions">
          <span class="se406-evidence-state">${escapeHtml(evidenceLabel)}</span>
          <button type="button" data-strategy-evidence-demand="true" data-strategy-evidence-reason="operator-explicit-open-evidence">OUVRIR LES PREUVES</button>
        </div>
      </div>
      <div class="se406-gates">${gates}</div>
    `;
    return true;
  }

  function render() {
    ensureStyle();
    const status = renderSimulationStatus();
    const gates = renderGateSummary();
    return { status, gates };
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    queueMicrotask(() => {
      renderQueued = false;
      render();
    });
  }

  function settleAfterInteraction() {
    queueRender();
    try {
      requestAnimationFrame(() => requestAnimationFrame(render));
    } catch (_) {}
  }

  document.addEventListener("click", settleAfterInteraction, { passive: true });
  document.addEventListener("agent-crypto:strategy-core-ready", settleAfterInteraction, { passive: true });
  document.addEventListener("agentcrypto:strategy-a-owner-autostart", settleAfterInteraction, { passive: true });
  document.addEventListener("agent-crypto:evidence-data-changed", settleAfterInteraction, { passive: true });
  document.addEventListener("erith:system-hydrated", settleAfterInteraction, { passive: true });
  window.addEventListener("pageshow", settleAfterInteraction, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", settleAfterInteraction, { once: true });
  } else {
    settleAfterInteraction();
  }

  globalThis.AgentCryptoSimulationEvidenceDecoupling406407 = Object.freeze({
    build: BUILD,
    owner: OWNER,
    render,
    snapshot: () => Object.freeze({
      build: BUILD,
      owner: OWNER,
      auto: Object.freeze({ ...autoState() }),
      gate_matrix_available: !!matrixSnapshot(),
      evidence: evidenceSnapshot(),
      header_strategy_badge_present: false,
      simulation_strategy_status_present: !!byId(STATUS_ID),
      ordinary_simulation_click_loads_evidence: false,
      explicit_evidence_control: '[data-strategy-evidence-demand="true"]',
      recurring_timer: false,
      mutation_observer: false,
      storage_write: false,
      business_network_request: false,
      strategy_business_logic_changed: false,
      gate_state_changed: false,
      paper_only: true,
      real_order: false
    })
  });
})();
