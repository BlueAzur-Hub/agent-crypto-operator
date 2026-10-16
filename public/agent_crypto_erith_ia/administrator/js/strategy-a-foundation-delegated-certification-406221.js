/* Agent-Crypto @erith.IA — 40.6.221 G2/G7 FOUNDATION PRECONDITION REPAIR
   Bounded delegated execution of the existing strict 40.6.191 foundation tests.
   Key repair: execution no longer depends on a prior tested-build match.
   It requires only:
   - the strict safety owner,
   - all four current self-test methods,
   - current module builds present/bindable,
   - Auto Lifecycle Bridge preflight READY.
   Exact tested-build equality remains a POST-test PASS requirement.
   Event-driven retry only: no recurring timer, no observer, no network, no order. */
(() => {
  "use strict";

  const BUILD = "40.6.221";
  const OWNER = "strategy-a-foundation-delegated-certification-406221";
  const ROOT_ID = "strategyAFoundationDelegatedReceipt406221";
  const STYLE_ID = `${ROOT_ID}Style`;
  const MARKER_KEY = "agent_crypto_foundation_delegated_406221";
  const AUTHORIZATION = "DELEGATED_OPERATOR_ACTION_2026-09-17";
  let running = false;
  let queued = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const safe = (fn, fallback = null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; } };

  function readMarker() {
    try {
      const raw = sessionStorage.getItem(MARKER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.build === BUILD ? parsed : null;
    } catch (_) { return null; }
  }

  function writeMarker(row) {
    try { sessionStorage.setItem(MARKER_KEY, JSON.stringify(row)); return true; }
    catch (_) { return false; }
  }

  function currentModuleFacts() {
    const truth = safe(globalThis.AgentCryptoStrategyASafetyCertification?.foundation_truth, null);
    const rows = truth?.current_modules && typeof truth.current_modules === "object"
      ? truth.current_modules
      : {};
    const names = ["deterministic_replay","paper_lifecycle","after_cost_metrics","auto_lifecycle_bridge"];
    const normalized = {};
    for (const name of names) {
      const row = rows?.[name] || {};
      normalized[name] = {
        available: row?.available === true,
        compatible: row?.compatible === true,
        version_bindable: row?.version_bindable === true,
        build: row?.build == null ? null : String(row.build),
        missing_methods: Array.isArray(row?.missing_methods) ? row.missing_methods.slice() : []
      };
    }
    return normalized;
  }

  function readiness() {
    const safety = globalThis.AgentCryptoStrategyASafetyCertification || null;
    const replay = globalThis.AgentCryptoStrategyAReplay || null;
    const lifecycle = globalThis.AgentCryptoStrategyAPaperLifecycle || null;
    const metrics = globalThis.AgentCryptoStrategyAAfterCostMetrics || null;
    const bridge = globalThis.AgentCryptoStrategyAAutoLifecycleBridge || null;
    const truth = safe(safety?.foundation_truth, null);
    const bridgePreflight = safe(bridge?.preflight, null);

    const modules = {
      deterministic_replay: typeof replay?.self_test === "function",
      paper_lifecycle: typeof lifecycle?.self_test === "function",
      after_cost_metrics: typeof metrics?.self_test === "function",
      auto_lifecycle_bridge: typeof bridge?.self_test === "function" && typeof bridge?.preflight === "function"
    };
    const methodsReady = Object.values(modules).every(Boolean);
    const facts = currentModuleFacts();
    const buildsReady = Object.keys(facts).length === 4
      && Object.values(facts).every(row => row.compatible === true && row.version_bindable === true && !!row.build);
    const preflightReady = bridgePreflight?.ready === true;
    const safetyAvailable = typeof safety?.run_foundation_tests === "function";

    return Object.freeze({
      safety_available: safetyAvailable,
      modules,
      methods_ready: methodsReady,
      current_modules: facts,
      current_builds_bindable: buildsReady,
      bridge_preflight_ready: preflightReady,
      bridge_blocked_reason: bridgePreflight?.blocked_reason || null,
      current_foundation_pass: truth?.pass === true,
      current_foundation_source: truth?.source || null,
      tested_builds_match_current: truth?.tested_builds_match_current === true,
      // Deliberately DO NOT require tested_builds_match_current before running.
      ready_to_run: safetyAvailable && methodsReady && buildsReady && preflightReady
    });
  }

  function statusSnapshot() {
    const r = readiness();
    const marker = readMarker();
    const truth = safe(globalThis.AgentCryptoStrategyASafetyCertification?.foundation_truth, null);
    let state = "WAITING_RUNTIME";
    if (truth?.pass === true && truth?.tested_builds_match_current === true) state = "FOUNDATION_PASS";
    else if (marker?.attempted === true && marker?.pass === false) state = marker?.status || "FOUNDATION_FAIL";
    else if (r.ready_to_run) state = "READY_TO_RUN";
    else if (r.safety_available && r.methods_ready && !r.current_builds_bindable) state = "WAITING_CURRENT_BUILDS";
    else if (r.safety_available && r.methods_ready && r.current_builds_bindable && !r.bridge_preflight_ready) state = "WAITING_BRIDGE_PREFLIGHT";

    return Object.freeze({
      schema: "agent_crypto_foundation_delegated_receipt_v2",
      build: BUILD,
      owner: OWNER,
      authorization: AUTHORIZATION,
      state,
      readiness: r,
      marker: clone(marker),
      foundation_truth: clone(truth),
      precondition_repair: {
        prior_tested_build_match_required_before_run: false,
        current_build_presence_required_before_run: true,
        bridge_preflight_required_before_run: true,
        exact_tested_build_match_required_after_run_for_pass: true
      },
      paper_only: true,
      real_order: false,
      business_network_request: false,
      live_unlock: false,
      gate_promotion: false
    });
  }

  function ensureStyle() {
    if (typeof document === "undefined" || byId(STYLE_ID)) return;
    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = `
      #${ROOT_ID}{margin:6px 0;padding:8px 10px;border:1px solid rgba(108,238,181,.22);border-radius:8px;background:rgba(8,31,25,.28);font:750 10px/1.45 system-ui,sans-serif;color:#cce9dc}
      #${ROOT_ID} b{color:#9fffd0}#${ROOT_ID}[data-state="FOUNDATION_PASS"]{border-color:rgba(105,247,176,.42)}
      #${ROOT_ID}[data-state*="FAIL"],#${ROOT_ID}[data-state="INCOMPLETE"]{border-color:rgba(255,118,160,.30);color:#f4b1c4}
      #${ROOT_ID} small{display:block;margin-top:3px;color:#8fb6a7;font-size:9px}
    `;
    document.head.appendChild(st);
  }

  function humanLabel(s) {
    if (s.state === "FOUNDATION_PASS") return "PASS · builds courants testés et liés";
    if (s.state === "READY_TO_RUN") return "prête · exécution de la fondation";
    if (s.state === "WAITING_CURRENT_BUILDS") return "attente des builds courants";
    if (s.state === "WAITING_BRIDGE_PREFLIGHT") return `attente Bridge${s.readiness?.bridge_blocked_reason ? ` · ${s.readiness.bridge_blocked_reason}` : ""}`;
    if (s.state.includes("FAIL") || s.state === "INCOMPLETE") return "échec / incomplet";
    return "attente runtime";
  }

  function render() {
    if (typeof document === "undefined") return statusSnapshot();
    ensureStyle();
    const s = statusSnapshot();
    const anchor = byId("strategyAEvidenceGateAudit") || byId("strategyASafety") || byId("strategyAEvidenceSupplements");
    if (!anchor?.parentElement) return s;
    let root = byId(ROOT_ID);
    if (!root) { root = document.createElement("div"); root.id = ROOT_ID; }
    if (root.parentElement !== anchor.parentElement || root.previousElementSibling !== anchor) {
      anchor.insertAdjacentElement("afterend", root);
    }
    root.dataset.state = s.state;
    root.innerHTML = `<b>G2 / G7 · Fondation courante : ${humanLabel(s)}</b><small>Précondition .221 : builds présents + Bridge prêt avant test ; égalité exacte des builds exigée après test pour PASS. PAPER uniquement.</small>`;
    return s;
  }

  function refreshViews(reason) {
    try { globalThis.AgentCryptoStrategyAEvidenceGateAudit?.render?.(); } catch (_) {}
    try { globalThis.AgentCryptoStrategyAGateCanonicalTruth?.render?.(); } catch (_) {}
    try { globalThis.AgentCryptoStrategyASafetyCertification?.render?.(); } catch (_) {}
    try { globalThis.AgentCryptoAdministratorOperatorFocus?.refresh?.(`foundation-221:${reason || "refresh"}`); } catch (_) {}
    render();
    if (typeof document !== "undefined") {
      try {
        document.dispatchEvent(new CustomEvent("agent-crypto:evidence-data-changed", {
          detail:{owner:OWNER,build:BUILD,reason:String(reason||"refresh")}
        }));
      } catch (_) {}
    }
  }

  function run(reason = "delegated-foundation-221") {
    if (running) return statusSnapshot();
    const before = statusSnapshot();
    if (before.state === "FOUNDATION_PASS") { render(); return before; }
    const prior = readMarker();
    if (prior?.attempted === true) { render(); return statusSnapshot(); }

    const ready = readiness();
    if (!ready.ready_to_run) { render(); return statusSnapshot(); }

    running = true;
    try {
      const api = globalThis.AgentCryptoStrategyASafetyCertification;
      const result = api.run_foundation_tests();
      const truth = safe(api.foundation_truth, null);
      const exactMatch = truth?.tested_builds_match_current === true;
      const pass = result?.pass === true && truth?.pass === true && exactMatch;
      const marker = Object.freeze({
        schema: "agent_crypto_foundation_delegated_action_v2",
        build: BUILD,
        at: new Date().toISOString(),
        attempted: true,
        pass,
        status: pass ? "FOUNDATION_PASS" : String(result?.status || "INCOMPLETE"),
        reason: String(reason || "delegated-foundation-221"),
        authorization: AUTHORIZATION,
        exact_current_build_binding: exactMatch,
        result: clone(result),
        post_test_truth: clone(truth)
      });
      writeMarker(marker);
      refreshViews(pass ? "pass" : "not-pass");
      return statusSnapshot();
    } catch (error) {
      const marker = {
        schema:"agent_crypto_foundation_delegated_action_v2",
        build:BUILD,
        at:new Date().toISOString(),
        attempted:true,
        pass:false,
        status:"FAIL",
        reason:String(error?.message||error),
        authorization:AUTHORIZATION
      };
      writeMarker(marker);
      refreshViews("exception");
      return statusSnapshot();
    } finally {
      running = false;
    }
  }

  function schedule(reason) {
    if (queued) return;
    queued = true;
    const go = () => {
      queued = false;
      const s = run(reason);
      if (s.state !== "FOUNDATION_PASS") render();
    };
    try { queueMicrotask(go); } catch (_) { Promise.resolve().then(go); }
  }

  globalThis.AgentCryptoStrategyAFoundationDelegatedCertification = Object.freeze({
    build: BUILD,
    owner: OWNER,
    authorization: AUTHORIZATION,
    snapshot: statusSnapshot,
    readiness,
    run,
    render,
    delegated_operator_action: true,
    one_shot_after_ready: true,
    recurring_timer: false,
    observer: false,
    business_network_request: false,
    market_core_modified: false,
    strategy_a_business_logic_modified: false,
    gate_promotion: false,
    live_unlock: false,
    paper_only: true,
    real_order: false,
    g3: "PENDING",
    g9: "LOCKED"
  });

  if (typeof document !== "undefined") {
    // Retry only on existing lifecycle/evidence events. No polling timer.
    const events = [
      "agent-crypto:runtime-modules-ready",
      "erith:system-hydrated",
      "agent-crypto:evidence-refresh-complete",
      "agent-crypto:evidence-data-changed"
    ];
    for (const name of events) document.addEventListener(name, () => schedule(name), {passive:true});
    window.addEventListener("load", () => schedule("load"), {once:true});
    window.addEventListener("pageshow", () => schedule("pageshow"));
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => schedule("dom-ready"), {once:true});
    else schedule("script-load");
  }
})();
