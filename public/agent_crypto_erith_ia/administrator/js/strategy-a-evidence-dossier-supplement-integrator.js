/* Agent-Crypto @erith.IA — 40.6.213 G3 TRUE HYDRATION CHECK
   Terrain 40.6.212 proved the stable Evidence host and durable-memory panel are visible,
   but the host falsely reported 9/9 hydrated while seven panels still displayed
   MODULE EN ATTENTE. This build makes hydration truth content-based: a panel is
   hydrated only when its owner API exists and the placeholder marker/text has been
   replaced by real rendered content. Bootstrap settles only when all nine panels are
   genuinely hydrated. No Strategy A business logic, Gate promotion, market data,
   recurring timer, MutationObserver, network/order path or historical backfill is added. */
(() => {
  "use strict";

  const BUILD = "40.6.213";
  const DOSSIER_ID = "strategyADossier";
  const AUDIT_ID = "strategyAEvidenceGateAudit";
  const BRIDGE_ID = "strategyAPaperV2ProofBridge";
  const HOST_ID = "strategyAEvidenceSupplements";
  const STATUS_ID = "strategyAEvidenceSupplementsStatus";
  const OVERLAP_ID = "strategyAG3T0WindowOverlapProof";

  const PANEL_SPECS = Object.freeze([
    Object.freeze({id:"strategyAG3StructuredTruth",api:"AgentCryptoStrategyAG3StructuredDataTruth",title:"G3 · STRUCTURED DATA TRUTH",method:"render"}),
    Object.freeze({id:"strategyAG3HistoryOwnerDiscovery",api:"AgentCryptoStrategyAG3HistoryOwnerDiscovery",title:"G3 · HISTORY OWNER DISCOVERY",method:"render"}),
    Object.freeze({id:"strategyAG3HistoricalEvidenceAdapter",api:"AgentCryptoStrategyAG3HistoricalEvidenceAdapter",title:"G3 · HISTORICAL EVIDENCE ADAPTER",method:"render"}),
    Object.freeze({id:"strategyAG3T0DecisionProof",api:"AgentCryptoStrategyAG3T0DecisionProof",title:"G3 · T0 DECISION PROOF",method:"render"}),
    Object.freeze({id:"strategyAG3ReplayDataset",api:"AgentCryptoStrategyAG3ReplayDataset",title:"G3 · IMMUTABLE REPLAY DATASET",method:"render"}),
    Object.freeze({id:"strategyAG3DecisionReplay",api:"AgentCryptoStrategyAG3DecisionReplay",title:"G3 · DECISION REPLAY VERIFIER",method:"render"}),
    Object.freeze({id:"strategyAG3CascadeCheckpoint",api:"AgentCryptoStrategyAG3CascadeCheckpoint",title:"G3 · CASCADE CHECKPOINT TRUTH",method:"render"}),
    Object.freeze({id:"strategyAG3ProspectiveT0Capture",api:"AgentCryptoStrategyAG3ProspectiveT0Capture",title:"G3 · CAPTURE T0 PROSPECTIVE",method:"render"}),
    Object.freeze({id:"strategyAG3DurableDecisionEvidence",api:"AgentCryptoStrategyAG3DurableDecisionEvidence",title:"G3 · DÉCISION PAPER · MÉMOIRE DURABLE",method:"refresh"})
  ]);

  let mountCount = 0;
  let mounting = false;
  let queued = false;
  let bootstrapBound = false;
  let bootstrapSettled = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const esc = value => String(value ?? "—").replace(/[&<>\"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[m]));
  const finite = value => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
  const ownerMethod = spec => {
    const api = globalThis[spec.api];
    const method = String(spec.method || "render");
    return typeof api?.[method] === "function" ? api[method].bind(api) : null;
  };
  const placeholderText = node => /MODULE EN ATTENTE/i.test(String(node?.textContent || ""));
  const panelHydrated = spec => {
    const node = byId(spec.id);
    if (!node) return false;
    if (!ownerMethod(spec)) return false;
    if (node.classList?.contains("saeds-placeholder")) return false;
    if (placeholderText(node)) return false;
    return true;
  };

  function anchor() {
    return byId(AUDIT_ID) || byId(DOSSIER_ID) || byId(BRIDGE_ID) || null;
  }

  function t0WindowProof() {
    let snap = null;
    try { snap = globalThis.AgentCryptoStrategyAG3CascadeCheckpoint?.snapshot?.() || null; } catch (_) {}
    const temporal = snap?.temporal || null;
    const certified = Array.isArray(snap?.t0?.certified) ? snap.t0.certified.slice() : [];
    certified.sort((a,b) => (finite(b?.market_at) ?? -Infinity) - (finite(a?.market_at) ?? -Infinity));
    const latest = certified[0] || null;
    const firstMs = finite(temporal?.first_ms);
    const lastMs = finite(temporal?.last_ms);
    const t0Ms = finite(latest?.market_at);
    let relation = "UNPROVEN";
    let gapMin = null;
    let conclusion = "INSUFFICIENT_TIMESTAMP_PROOF";

    if (firstMs !== null && lastMs !== null && t0Ms !== null) {
      if (t0Ms < firstMs) {
        relation = "T0_BEFORE_CERTIFIED_WINDOW";
        gapMin = (firstMs - t0Ms) / 60000;
        conclusion = "T0_OLDER_THAN_CURRENT_CERTIFIED_WINDOW";
      } else if (t0Ms > lastMs) {
        relation = "T0_AFTER_CERTIFIED_WINDOW";
        gapMin = (t0Ms - lastMs) / 60000;
        conclusion = "WAIT_SOURCE_WINDOW_TO_REACH_T0";
      } else {
        relation = "T0_INSIDE_CERTIFIED_WINDOW";
        gapMin = 0;
        conclusion = "OVERLAP_PROVEN";
      }
    }

    return Object.freeze({
      schema: "agent_crypto_g3_t0_window_overlap_proof_v1",
      build: BUILD,
      checkpoint_build: snap?.build || null,
      temporal_certified: temporal?.certified === true,
      window_first_at: temporal?.first_at || null,
      window_last_at: temporal?.last_at || null,
      latest_certified_t0_id: latest?.id || null,
      latest_certified_t0_market_at: t0Ms === null ? null : new Date(t0Ms).toISOString(),
      relation,
      gap_min: gapMin === null ? null : Math.round(gapMin * 1000) / 1000,
      conclusion,
      certified_t0: snap?.t0?.certified_rows ?? 0,
      joined_count: snap?.dataset?.joined_count ?? 0,
      checkpoint_blocker: snap?.checkpoint?.blocker || null,
      checkpoint_owner: snap?.checkpoint?.next_owner || null,
      checkpoint_action: snap?.checkpoint?.next_action || null,
      read_only: true,
      paper_only: true,
      real_order: false,
      g3: "PENDING",
      g9: "LOCKED"
    });
  }

  function ensureStyle() {
    if (typeof document === "undefined" || byId(`${HOST_ID}Style`)) return;
    const style = document.createElement("style");
    style.id = `${HOST_ID}Style`;
    style.textContent = `
      #${HOST_ID}{margin-top:10px;padding:10px;border:1px solid rgba(111,255,215,.22);border-radius:10px;background:rgba(5,23,25,.42)}
      #${HOST_ID}>.saesh-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:4px}
      #${HOST_ID} .saesh-title{font-size:9px;font-weight:950;letter-spacing:.09em;color:#83ffda;text-transform:uppercase}
      #${HOST_ID} .saesh-sub{font-size:8px;color:#86aaa4;margin-top:3px}
      #${HOST_ID} .saesh-state{font-size:8px;font-weight:900;color:#dffdf5;border:1px solid rgba(111,255,215,.18);border-radius:999px;padding:4px 7px;background:rgba(111,255,215,.06)}
      #${HOST_ID}>section{margin-top:9px}
      #${HOST_ID} .saeds-placeholder{padding:8px;border:1px dashed rgba(111,255,215,.20);border-radius:8px;background:rgba(4,20,24,.22)}
      #${HOST_ID} .saeds-placeholder-title{font-size:8px;font-weight:950;letter-spacing:.08em;color:#83ffda;text-transform:uppercase}
      #${HOST_ID} .saeds-placeholder-note{margin-top:4px;font-size:8px;color:#91b7ad}
      #${OVERLAP_ID}{margin-top:9px;padding:8px;border:1px solid rgba(255,211,110,.28);border-radius:8px;background:rgba(48,36,7,.18)}
      #${OVERLAP_ID} .ow-title{font-size:8px;font-weight:950;letter-spacing:.08em;color:#ffd36e;text-transform:uppercase}
      #${OVERLAP_ID} .ow-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:5px;margin-top:7px}
      #${OVERLAP_ID} .ow-k{padding:5px;border:1px solid rgba(255,255,255,.06);border-radius:7px}
      #${OVERLAP_ID} .ow-k span{display:block;font-size:7px;color:#9a8f70;text-transform:uppercase}
      #${OVERLAP_ID} .ow-k b{display:block;margin-top:2px;font-size:8px;color:#fff8df;overflow-wrap:anywhere}
      #${OVERLAP_ID} .ow-note{margin-top:6px;font-size:8px;color:#b8ae91;line-height:1.35}
    `;
    document.head.appendChild(style);
  }

  function ensureHost() {
    if (typeof document === "undefined") return null;
    const a = anchor();
    if (!a) return null;
    ensureStyle();

    let host = byId(HOST_ID);
    if (!host) {
      host = document.createElement("section");
      host.id = HOST_ID;
      host.innerHTML = `<div class="saesh-head"><div><div class="saesh-title">STRATEGY A · G3 EVIDENCE SUPPLEMENTS · TRUE HYDRATION · ${BUILD}</div><div class="saesh-sub">9 panneaux · un panneau n’est hydraté que lorsque son contenu réel a remplacé le placeholder.</div></div><div id="${STATUS_ID}" class="saesh-state" data-saesh-state>0 / ${PANEL_SPECS.length} PANNEAUX</div></div>`;
    }
    host.dataset.build = BUILD;
    host.dataset.stableSibling = "true";
    host.dataset.lifecycleBound = "true";
    host.dataset.ninePanelContract = "true";
    host.dataset.trueHydration = "true";
    host.dataset.overlapProofBuild = BUILD;
    const title = host.querySelector(".saesh-title");
    const sub = host.querySelector(".saesh-sub");
    if (title) title.textContent = `STRATEGY A · G3 EVIDENCE SUPPLEMENTS · TRUE HYDRATION · ${BUILD}`;
    if (sub) sub.textContent = "9 panneaux · un panneau n’est hydraté que lorsque son contenu réel a remplacé le placeholder.";
    if (a.nextElementSibling !== host) a.insertAdjacentElement("afterend", host);
    return host;
  }

  function ensurePlaceholder(host, spec) {
    let root = byId(spec.id);
    if (!root) {
      root = document.createElement("section");
      root.id = spec.id;
      root.className = "saeds-placeholder";
      root.dataset.placeholderBuild = BUILD;
      root.innerHTML = `<div class="saeds-placeholder-title">${spec.title}</div><div class="saeds-placeholder-note">MODULE EN ATTENTE · aucune donnée inventée.</div>`;
    }
    if (root.parentElement !== host) host.appendChild(root);
    return root;
  }

  function renderOwners() {
    for (const spec of PANEL_SPECS) {
      const call = ownerMethod(spec);
      if (!call) continue;
      try {
        call(spec.method === "refresh" ? "stable-host-mount" : undefined);
        const root = byId(spec.id);
        if (root && !placeholderText(root)) {
          root.classList?.remove("saeds-placeholder");
          root.dataset.hydratedBy = spec.api;
          root.dataset.hydratedTruthBuild = BUILD;
        } else if (root) {
          root.classList?.add("saeds-placeholder");
          delete root.dataset.hydratedBy;
          root.dataset.hydratedTruthBuild = BUILD;
        }
      } catch (_) {}
    }
  }

  function movePanels(host) {
    let present = 0;
    let hydrated = 0;
    for (const spec of PANEL_SPECS) {
      const root = byId(spec.id);
      if (!root) continue;
      if (root.parentElement !== host) host.appendChild(root);
      root.dataset.lifecycleHostBuild = BUILD;
      root.dataset.outsideLegacyDossier = "true";
      root.dataset.integratedBy = BUILD;
      root.dataset.hydratedTruth = panelHydrated(spec) ? "true" : "false";
      if (panelHydrated(spec)) hydrated += 1;
      present += 1;
    }
    return {present, hydrated};
  }

  function renderOverlapProof(host) {
    if (!host) return t0WindowProof();
    let root = byId(OVERLAP_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = OVERLAP_ID;
    }
    const durable = byId("strategyAG3DurableDecisionEvidence");
    const capture = byId("strategyAG3ProspectiveT0Capture");
    if (durable?.parentElement === host) durable.insertAdjacentElement("afterend", root);
    else if (capture?.parentElement === host) capture.insertAdjacentElement("afterend", root);
    else if (root.parentElement !== host) host.appendChild(root);

    const p = t0WindowProof();
    root.dataset.build = BUILD;
    root.dataset.readOnly = "true";
    root.innerHTML = `
      <div class="ow-title">G3 · T0 WINDOW OVERLAP PROOF · ${BUILD}</div>
      <div class="ow-grid">
        <div class="ow-k"><span>Window first</span><b>${esc(p.window_first_at || "NON PROUVÉ")}</b></div>
        <div class="ow-k"><span>Window last</span><b>${esc(p.window_last_at || "NON PROUVÉ")}</b></div>
        <div class="ow-k"><span>Certified T0</span><b>${esc(p.latest_certified_t0_market_at || "NON PROUVÉ")}</b></div>
        <div class="ow-k"><span>T0 ID</span><b>${esc(p.latest_certified_t0_id || "—")}</b></div>
        <div class="ow-k"><span>Relation</span><b>${esc(p.relation)}</b></div>
        <div class="ow-k"><span>Gap min</span><b>${esc(p.gap_min ?? "—")}</b></div>
        <div class="ow-k"><span>T0 cert.</span><b>${esc(p.certified_t0)}</b></div>
        <div class="ow-k"><span>Jointes</span><b>${esc(p.joined_count)}</b></div>
        <div class="ow-k"><span>Conclusion</span><b>${esc(p.conclusion)}</b></div>
      </div>
      <div class="ow-note">CHECKPOINT · ${esc(p.checkpoint_blocker || "INCONNU")} · OWNER · ${esc(p.checkpoint_owner || "INCONNU")} · ACTION · ${esc(p.checkpoint_action || "INCONNUE")}</div>
      <div class="ow-note">Lecture seule : ce bloc ne modifie ni série marché, ni ledger, ni Strategy A, ni Gate.</div>`;
    return p;
  }

  function snapshot() {
    const host = byId(HOST_ID);
    const dossier = byId(DOSSIER_ID);
    const panels = PANEL_SPECS.map(spec => {
      const node = byId(spec.id);
      return {
        id: spec.id,
        api: spec.api,
        method: spec.method,
        present: !!node,
        parent: node?.parentElement?.id || null,
        stable: !!host && node?.parentElement === host,
        hydrated: panelHydrated(spec),
        placeholder_text: placeholderText(node)
      };
    });
    const missingApis = PANEL_SPECS.filter(spec => !ownerMethod(spec)).map(spec => `${spec.api}.${spec.method}`);
    return {
      schema: "agent_crypto_strategy_a_g3_evidence_true_hydration_v1",
      build: BUILD,
      dossier_present: !!dossier,
      host_present: !!host,
      lifecycle_bound: host?.dataset?.lifecycleBound === "true",
      nine_panel_contract: host?.dataset?.ninePanelContract === "true",
      true_hydration_contract: true,
      mount_count: mountCount,
      mounting,
      bootstrap_bound: bootstrapBound,
      bootstrap_settled: bootstrapSettled,
      present: panels.filter(p => p.present).length,
      hydrated: panels.filter(p => p.hydrated).length,
      stable: panels.filter(p => p.stable).length,
      expected: PANEL_SPECS.length,
      missing_apis: missingApis,
      panels,
      overlap_proof: t0WindowProof(),
      legacy_dossier_owner_unchanged: true,
      recurring_timer: false,
      observer: false,
      network: false,
      real_order: false,
      paper_only: true,
      g3: "PENDING",
      g9: "LOCKED"
    };
  }

  function clearBootstrapListeners() {
    if (!bootstrapBound || typeof document === "undefined") return;
    document.removeEventListener("click", bootstrapAttempt, true);
    document.removeEventListener("focusin", bootstrapAttempt, true);
    window.removeEventListener("pageshow", bootstrapAttempt);
    bootstrapBound = false;
  }

  function mount() {
    if (mounting) return {...snapshot(),mounted:false,reason:"MOUNT_ALREADY_ACTIVE"};
    mounting = true;
    mountCount += 1;
    try {
      if (typeof document === "undefined") return {mounted:false,reason:"NO_DOCUMENT",mount_count:mountCount};
      const host = ensureHost();
      if (!host) return {mounted:false,reason:"EVIDENCE_ANCHOR_UNAVAILABLE",mount_count:mountCount};

      PANEL_SPECS.forEach(spec => ensurePlaceholder(host,spec));
      renderOwners();
      const moved = movePanels(host);
      const overlap = renderOverlapProof(host);
      const state = snapshot();
      const status = host.querySelector("[data-saesh-state]");
      if (status) status.textContent = `${moved.present} / ${PANEL_SPECS.length} PANNEAUX · ${moved.hydrated} HYDRATÉ(S)` + (state.missing_apis.length ? ` · API MANQUANTE: ${state.missing_apis.length}` : "");
      host.dataset.panelsPresent = String(moved.present);
      host.dataset.panelsHydrated = String(moved.hydrated);
      host.dataset.panelsExpected = String(PANEL_SPECS.length);
      host.dataset.complete = moved.present === PANEL_SPECS.length && moved.hydrated === PANEL_SPECS.length ? "true" : "false";
      host.dataset.overlapRelation = String(overlap?.relation || "UNPROVEN");
      if (host.dataset.complete === "true") {
        bootstrapSettled = true;
        clearBootstrapListeners();
      } else {
        bootstrapSettled = false;
        bindBootstrapLifecycle();
      }
      return {...state,mounted:true,complete:host.dataset.complete === "true",overlap};
    } finally {
      mounting = false;
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    const run = () => { queued = false; mount(); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  function bootstrapAttempt() {
    if (bootstrapSettled) return;
    const result = mount();
    if (result?.mounted !== true || result?.complete !== true) schedule();
  }

  function bindBootstrapLifecycle() {
    if (bootstrapBound || bootstrapSettled || typeof document === "undefined") return;
    bootstrapBound = true;
    document.addEventListener("click", bootstrapAttempt, true);
    document.addEventListener("focusin", bootstrapAttempt, true);
    window.addEventListener("pageshow", bootstrapAttempt);
  }

  globalThis.AgentCryptoStrategyAEvidenceDossierSupplementIntegrator = Object.freeze({
    build: BUILD,
    owner: "strategy-a-g3-evidence-true-hydration-check",
    dossier_id: DOSSIER_ID,
    host_id: HOST_ID,
    status_id: STATUS_ID,
    overlap_id: OVERLAP_ID,
    panels: PANEL_SPECS.map(spec => spec.id),
    mount,
    snapshot,
    schedule,
    t0_window_proof: t0WindowProof,
    render_overlap_proof: renderOverlapProof,
    panel_hydrated: id => {
      const spec = PANEL_SPECS.find(x => x.id === id);
      return spec ? panelHydrated(spec) : false;
    },
    lifecycle_bound: true,
    nine_panel_contract: true,
    true_hydration_contract: true,
    bounded_bootstrap_retry: true,
    dossier_hook_installed: false,
    recurring_timer: false,
    observer: false,
    network: false,
    real_order: false,
    paper_only: true,
    g3: "PENDING",
    g9: "LOCKED"
  });

  if (typeof document !== "undefined") {
    bindBootstrapLifecycle();
    document.addEventListener("agent-crypto:evidence-data-changed", schedule);
    document.addEventListener("agent-crypto:g3-durable-evidence-ready", schedule);
    document.addEventListener("agent-crypto:g3-durable-evidence-written", schedule);
    document.addEventListener("erith:system-hydrated", schedule,{passive:true});
    document.addEventListener("agent-crypto:runtime-modules-ready", schedule,{once:true});
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule,{once:true});
    else schedule();
    window.addEventListener("load", schedule,{once:true});
  }
})();
