/* Agent-Crypto @erith.IA — 40.6.238 ADMINISTRATOR PRESENTATION REFRESH · SINGLE SETTLED OWNER
   Stable operator map mounted as a sibling of the lazy Strategy A dossier.
   Replaces the fragile per-panel era badges from 40.6.230/231 with one durable map.
   No evidence value is rewritten. No Market Core or Strategy A business logic is changed.
   PAPER ONLY · G3 PENDING · G9 LOCKED. */
(() => {
  "use strict";

  const BUILD = "40.6.238";
  const CREATOR_ID = "administratorCreatorShortcut406219";
  const STYLE_ID = "administratorOperatorCompatibility406219Style";
  const FOUNDATION_SRC = "./js/strategy-a-foundation-delegated-certification-406219.js?release=40.6.219";
  const MAP_ID = "strategyAG3EvidenceEraMap406232";
  const OLD_LEGEND_ID = "strategyAG3EvidenceEraLegend406231";
  const SETTLED_EVENT = "agent-crypto:administrator-presentation-settled";
  let queued = false;
  let lastReceipt = null;
  const pendingReasons = new Set();

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const safe = (fn, fallback = null) => {
    try { return typeof fn === "function" ? fn() : fallback; }
    catch (_) { return fallback; }
  };
  const esc = v => String(v ?? "—").replace(/[&<>\"]/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"
  }[m]));

  function cleanupFailedWrappers() {
    [
      "administratorOperatorFocus406215",
      "administratorOperatorFocus406216",
      "administratorOperatorFocus406217",
      "administratorOperatorFocus406218",
      "administratorOperatorEvidenceSummary406217",
      "administratorOperatorEvidenceSummary406218",
      "administratorCreatorShortcut406217",
      "administratorCreatorShortcut406218"
    ].forEach(id => byId(id)?.remove());
    byId("strategyADossier")?.classList.remove("aof218-collapsed");
    byId("strategyAEvidenceSupplements")?.classList.remove("aof218-simple");
  }

  function cleanupFragileEraLabels() {
    byId(OLD_LEGEND_ID)?.remove();
    document.querySelectorAll?.(".aof231-evidence-era").forEach(node => node.remove());
    document.querySelectorAll?.("[data-aof231-evidence-era]").forEach(node => {
      try { delete node.dataset.aof231EvidenceEra; } catch (_) {}
    });
  }

  function mapStyle() {
    return `
      #${MAP_ID}{margin:12px 0;padding:14px;border:1px solid rgba(91,230,199,.34);border-radius:12px;background:linear-gradient(135deg,rgba(7,25,31,.96),rgba(12,18,29,.96));color:#dbe7ef;box-shadow:inset 0 0 0 1px rgba(255,255,255,.02)}
      #${MAP_ID} .eam-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}
      #${MAP_ID} .eam-title{font:950 13px/1.3 system-ui;color:#7ff0d0;letter-spacing:.045em}
      #${MAP_ID} .eam-sub{margin-top:4px;font:650 10px/1.45 system-ui;color:#a7bdc7}
      #${MAP_ID} .eam-tag{padding:5px 8px;border:1px solid rgba(255,205,102,.30);border-radius:999px;color:#ffe1a0;background:rgba(81,56,10,.18);font:900 9px/1.2 system-ui}
      #${MAP_ID} .eam-grid{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:8px;margin-top:10px}
      #${MAP_ID} .eam-card{padding:10px;border:1px solid rgba(255,255,255,.09);border-radius:9px;background:rgba(2,10,16,.38)}
      #${MAP_ID} .eam-card[data-era="current"]{border-color:rgba(91,230,199,.32);background:rgba(18,79,69,.13)}
      #${MAP_ID} .eam-card[data-era="historical"]{border-style:dashed;color:#aabcc6}
      #${MAP_ID} .eam-card[data-era="superseded"]{border-color:rgba(255,190,92,.25);background:rgba(78,55,13,.10)}
      #${MAP_ID} .eam-k{font:900 8px/1.2 system-ui;letter-spacing:.10em;text-transform:uppercase;color:#8da5b1}
      #${MAP_ID} .eam-card[data-era="current"] .eam-k{color:#72e7c6}
      #${MAP_ID} .eam-card[data-era="superseded"] .eam-k{color:#e9bd6b}
      #${MAP_ID} .eam-v{margin-top:5px;font:900 10px/1.45 system-ui;color:#f2faf7}
      #${MAP_ID} .eam-v small{display:block;margin-top:3px;font:650 9px/1.45 system-ui;color:#91a7b2}
      #${MAP_ID} .eam-next{margin-top:9px;padding:9px;border-left:3px solid #f0c765;background:rgba(240,199,101,.07);font:750 10px/1.5 system-ui;color:#f2dfaa}
      #${MAP_ID} .eam-proof{margin-top:7px;font:650 9px/1.5 ui-monospace,monospace;color:#829da7;overflow-wrap:anywhere}
      @media(max-width:980px){#${MAP_ID} .eam-grid{grid-template-columns:1fr}}
    `;
  }

  function ensureStyle() {
    const existing = byId(STYLE_ID);
    if (existing) {
      if (!existing.textContent.includes(`#${MAP_ID}`)) existing.textContent += mapStyle();
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #strategyAEvidenceSupplements{font-size:12px!important;line-height:1.55!important}
      #strategyAEvidenceSupplements .saesh-title{font-size:13px!important;letter-spacing:.055em!important}
      #strategyAEvidenceSupplements .saesh-sub,#strategyAEvidenceSupplements .saesh-state{font-size:11px!important;line-height:1.45!important}
      #strategyADossier [style*="font-size:7px"],#strategyADossier [style*="font-size: 7px"]{font-size:10px!important;line-height:1.45!important}
      #strategyADossier [style*="font-size:8px"],#strategyADossier [style*="font-size: 8px"]{font-size:10.5px!important;line-height:1.45!important}
      #strategyADossier [style*="font-size:9px"],#strategyADossier [style*="font-size: 9px"]{font-size:11px!important;line-height:1.45!important}
      .aerith10-loader-card::before{background-size:contain!important;background-position:center top!important;background-repeat:no-repeat!important;background-color:rgba(7,10,20,.88)!important;min-height:160px!important;max-height:none!important}
      #${CREATOR_ID}{margin-left:6px;border:1px solid rgba(255,176,232,.28);border-radius:999px;background:rgba(255,255,255,.045);color:#ffd2ef;padding:6px 9px;font:900 9px/1 system-ui,sans-serif;cursor:pointer}
      #${CREATOR_ID}:hover{background:rgba(255,176,232,.10)}
      @media(max-width:620px){.aerith10-loader-card::before{min-height:120px!important}}
    ` + mapStyle();
    document.head.appendChild(style);
  }

  function ensureCreatorShortcut() {
    let button = byId(CREATOR_ID);
    const anchor = byId("atlasProjectsCluster");
    if (!anchor?.parentElement) return null;
    if (!button) {
      button = document.createElement("button");
      button.id = CREATOR_ID;
      button.type = "button";
      button.textContent = "Créatrice";
      button.setAttribute("aria-label", "Ouvrir Aerith-10 Créatrice");
      button.addEventListener("click", () => {
        const target = byId("aerith10-creator");
        if (!target) return;
        if ("open" in target) target.open = true;
        target.scrollIntoView({behavior:"smooth",block:"start"});
      });
    }
    if (button.parentElement !== anchor.parentElement || button.previousElementSibling !== anchor)
      anchor.insertAdjacentElement("afterend", button);
    return button;
  }

  function ensureFoundationLoader() {
    if (globalThis.AgentCryptoStrategyAFoundationDelegatedCertification) return true;
    if (document.querySelector('script[data-agent-crypto-foundation-219="true"]')) return false;
    const script = document.createElement("script");
    script.src = FOUNDATION_SRC;
    script.async = false;
    script.dataset.agentCryptoFoundation219 = "true";
    script.addEventListener("load", () => {
      try { globalThis.AgentCryptoStrategyAFoundationDelegatedCertification?.run?.("operator-compatibility-load"); } catch (_) {}
    }, {once:true});
    (document.body || document.documentElement).appendChild(script);
    return false;
  }

  function chooseAnchor() {
    for (const id of [
      "strategyADossier",
      "strategyAEvidenceSupplements",
      "strategyAG3StrictOutcomeRevalidation406228",
      "strategyAG3StrictExecutionRealismRebind406229",
      "strategyAEvidenceGateAudit"
    ]) {
      const node = byId(id);
      if (node?.parentElement) return node;
    }
    return null;
  }

  function currentTruth() {
    const strictOwner = globalThis.AgentCryptoStrategyAG3StrictOutcomeRevalidation || null;
    const executionOwner = globalThis.AgentCryptoStrategyAG3StrictExecutionRealismRebind || null;
    const strict = safe(strictOwner?.snapshot, null);
    const execution = safe(executionOwner?.snapshot, null);
    return Object.freeze({strictOwner, executionOwner, strict, execution});
  }

  function ensureEraMap(reason = "explicit") {
    if (typeof document === "undefined") return null;
    const anchor = chooseAnchor();
    if (!anchor?.parentElement) return null;
    cleanupFragileEraLabels();
    ensureStyle();

    const {strict, execution} = currentTruth();
    let root = byId(MAP_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = MAP_ID;
      root.setAttribute("role", "note");
    }
    if (root.parentElement !== anchor.parentElement || root.nextElementSibling !== anchor)
      anchor.insertAdjacentElement("beforebegin", root);

    const joined = strict?.joined_decisions ?? 0;
    const horizons = strict?.certified_horizons ?? 0;
    const expected = strict?.expected_horizons ?? 0;
    const labels = strict?.outcome_labels || "UNKNOWN";
    const anchorTime = strict?.horizon_anchor || "UNKNOWN";
    const trades = execution?.terrain_layer?.after_cost?.trades ?? 0;
    const latency = execution?.model_layer?.execution_latency || "NOT_PROVEN";
    const liquidity = execution?.model_layer?.execution_liquidity || "NOT_PROVEN";
    const executionState = execution?.state || "WAIT_EXECUTION_REALISM";

    root.dataset.build = BUILD;
    root.dataset.mount = "stable-sibling-before-lazy-dossier";
    root.dataset.reason = String(reason || "explicit");
    root.innerHTML = `
      <div class="eam-head">
        <div>
          <div class="eam-title">STRATEGY A · CARTE DES PREUVES G3 · ${BUILD}</div>
          <div class="eam-sub">Une seule carte stable pour distinguer la vérité actuelle des étapes de construction conservées pour audit.</div>
        </div>
        <div class="eam-tag">G3 PENDING · G9 LOCKED · PAPER ONLY</div>
      </div>
      <div class="eam-grid">
        <div class="eam-card" data-era="current">
          <div class="eam-k">ACTUEL</div>
          <div class="eam-v">40.6.228 · données + outcomes
            <small>${esc(joined)} décision(s) jointe(s) · ${esc(horizons)}/${esc(expected)} horizons · ${esc(labels)} · ancre ${esc(anchorTime)}</small>
          </div>
          <div class="eam-v">40.6.229 · réalisme d’exécution
            <small>after-cost terrain ${esc(trades)} trade(s) · latence ${esc(latency)} · liquidité ${esc(liquidity)} · ${esc(executionState)}</small>
          </div>
        </div>
        <div class="eam-card" data-era="historical">
          <div class="eam-k">PREUVES HISTORIQUES</div>
          <div class="eam-v">40.6.193 → 40.6.213
            <small>Construction qualité 24 h, T0, replay, checkpoint, mémoire durable et hydratation. Conservée pour audit ; ne définit plus seule l’état courant.</small>
          </div>
        </div>
        <div class="eam-card" data-era="superseded">
          <div class="eam-k">SUPERSEDED</div>
          <div class="eam-v">40.6.214 · .222 · .223 · .225 · .226 · .227
            <small>Conclusions remplacées par la revalidation stricte 40.6.228 et la vérité d’exécution 40.6.229. Les panneaux restent consultables.</small>
          </div>
        </div>
      </div>
      <div class="eam-next"><b>Maintenant :</b> ne plus rouvrir la chaîne historique. Attendre un PAPER Strategy A naturellement éligible, puis conserver ses faits after-cost complets. Partial fill terrain, latence et liquidité restent à prouver sans forcer de trade.</div>
      <div class="eam-proof">ERA MAP · host=${esc(anchor.id)} · reason=${esc(reason)} · current=40.6.228+40.6.229 · no evidence rewrite · no Gate promotion · no timer · no observer.</div>`;

    document.documentElement.dataset.agentCryptoG3EvidenceEraMap = "406235";
    return root;
  }

  function refresh(reason = "explicit") {
    if (typeof document === "undefined") return Object.freeze({build:BUILD,available:false});
    cleanupFailedWrappers();
    ensureStyle();
    const creator = ensureCreatorShortcut();
    const loaded = ensureFoundationLoader();
    const map = ensureEraMap(reason);
    // Presentation refresh must not re-run Evidence/Foundation owners.
    // Those owners remain authoritative and are invoked by their own lifecycle.
    const truth = currentTruth();
    lastReceipt = Object.freeze({
      build: BUILD,
      reason,
      host_id: chooseAnchor()?.id || null,
      map_present: !!map,
      map_id: MAP_ID,
      current_truth_228_present: !!truth.strict,
      current_truth_229_present: !!truth.execution,
      current_authority: "40.6.228+40.6.229",
      legacy_badges_required: false,
      stable_sibling_mount: true,
      explicit_dossier_mount_event: true,
      mount_repair_build: "40.6.235",
      canonical_header_preserved: true,
      creator_shortcut_present: !!creator,
      foundation_owner_available: !!globalThis.AgentCryptoStrategyAFoundationDelegatedCertification,
      foundation_loader_already_available: loaded,
      market_core_modified: false,
      strategy_a_business_logic_modified: false,
      gate_state_modified: false,
      recurring_timer: false,
      observer: false,
      storage_write: false,
      business_network_request: false,
      real_order: false,
      paper_only: true,
      g3: "PENDING",
      g9: "LOCKED"
    });
    return lastReceipt;
  }

  function flushSettledPresentation() {
    const reasons = [...pendingReasons];
    pendingReasons.clear();
    const reason = reasons.length <= 1
      ? (reasons[0] || "settled")
      : `settled:${reasons.join("+")}`;
    const detail = Object.freeze({
      build: BUILD,
      owner: "administrator-operator-focus-406216.js",
      reason,
      reasons: Object.freeze(reasons),
      recurring_timer: false,
      observer: false
    });
    try {
      document.dispatchEvent(new CustomEvent(SETTLED_EVENT, {detail}));
    } finally {
      queued = false;
      if (pendingReasons.size) schedule();
    }
  }

  function schedule(reason = "event") {
    if (reason) pendingReasons.add(String(reason));
    if (queued) return;
    queued = true;
    try {
      requestAnimationFrame(() => requestAnimationFrame(flushSettledPresentation));
    } catch (_) {
      queueMicrotask(flushSettledPresentation);
    }
  }

  globalThis.AgentCryptoAdministratorOperatorFocus = Object.freeze({
    build: BUILD,
    refresh,
    requestSettled: schedule,
    ensureEraMap,
    snapshot: () => lastReceipt || refresh("snapshot"),
    map_id: MAP_ID,
    mount: "STABLE_SIBLING_G3_EVIDENCE_ERA_MAP",
    current_authority: "40.6.228+40.6.229",
    legacy_evidence_readability: true,
    legacy_labels_mount_repair: false,
    evidence_era_map: true,
    evidence_era_map_mount_repair_406235: true,
    explicit_dossier_mount_event: "agent-crypto:strategy-a-evidence-dossier-mounted",
    presentation_settled_event: SETTLED_EVENT,
    single_presentation_refresh_owner: true,
    foundation_rerun_on_presentation_refresh: false,
    delegated_foundation_loader: true,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    business_network_request: false,
    market_core_modified: false,
    strategy_a_business_logic_modified: false,
    gate_state_modified: false,
    real_order: false,
    paper_only: true,
    g3: "PENDING",
    g9: "LOCKED"
  });

  if (typeof document !== "undefined") {
    // Raw lifecycle events only request settlement. The settled event is the
    // single presentation refresh entrance.
    document.addEventListener(SETTLED_EVENT, event => {
      refresh(event?.detail?.reason || "settled");
    }, {passive:true});
    document.addEventListener("agent-crypto:runtime-modules-ready", () => schedule("runtime-modules-ready"), {once:true});
    document.addEventListener("erith:system-hydrated", () => schedule("system-hydrated"), {passive:true});
    document.addEventListener("agent-crypto:evidence-data-changed", () => schedule("evidence-data-changed"), {passive:true});
    document.addEventListener("agent-crypto:evidence-refresh-complete", () => schedule("evidence-refresh-complete"), {passive:true});
    document.addEventListener("agent-crypto:strategy-a-evidence-dossier-mounted", () => schedule("strategy-a-evidence-dossier-mounted"), {passive:true});
    document.addEventListener("toggle", event => {
      if (event?.target?.closest?.("#strategyADossier,#strategyAEvidenceSupplements") || event?.target?.id === "strategyADossier")
        schedule("toggle-settled");
    }, true);
    window.addEventListener("pageshow", () => schedule("pageshow"));
    window.addEventListener("load", () => schedule("load"), {once:true});
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", () => schedule("dom-ready"), {once:true});
    else schedule("script-load");
  }
})();