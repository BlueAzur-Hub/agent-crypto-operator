/* Agent-Crypto @erith.IA — 40.6.219 G2/G7 DELEGATED FOUNDATION CERTIFICATION
   Bounded one-shot execution of the existing isolated foundation self-tests after
   explicit operator delegation in the release workflow. The strict 40.6.191 owner
   remains authoritative: exact current module builds must be available and the
   lifecycle bridge preflight must already be READY before any test is launched.
   No order, wallet, key, business network request, Gate promotion or live unlock. */
(() => {
  "use strict";

  const BUILD = "40.6.219";
  const OWNER = "strategy-a-foundation-delegated-certification-406219";
  const ROOT_ID = "strategyAFoundationDelegatedReceipt406219";
  const STYLE_ID = `${ROOT_ID}Style`;
  const MARKER_KEY = "agent_crypto_foundation_delegated_406219";
  const AUTHORIZATION = "DELEGATED_OPERATOR_ACTION_2026-09-17";
  let running = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const safe = (fn, fallback = null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; };

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
    const strictReady = truth?.applicability_complete === true && truth?.version_binding_complete === true;
    const preflightReady = bridgePreflight?.ready === true;

    return Object.freeze({
      safety_available: typeof safety?.run_foundation_tests === "function",
      modules,
      methods_ready: methodsReady,
      strict_ready: strictReady,
      bridge_preflight_ready: preflightReady,
      bridge_blocked_reason: bridgePreflight?.blocked_reason || null,
      current_foundation_pass: truth?.pass === true,
      current_foundation_source: truth?.source || null,
      tested_builds_match_current: truth?.tested_builds_match_current === true,
      ready_to_run: typeof safety?.run_foundation_tests === "function" && methodsReady && strictReady && preflightReady
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
    else if (r.safety_available && r.methods_ready && r.strict_ready && !r.bridge_preflight_ready) state = "WAITING_BRIDGE_PREFLIGHT";

    return Object.freeze({
      schema: "agent_crypto_foundation_delegated_receipt_v1",
      build: BUILD,
      owner: OWNER,
      authorization: AUTHORIZATION,
      state,
      readiness: r,
      marker: clone(marker),
      foundation_truth: clone(truth),
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
      #${ROOT_ID}{margin:6px 0;padding:7px 9px;border:1px solid rgba(108,238,181,.22);border-radius:8px;background:rgba(8,31,25,.28);font:750 9px/1.4 system-ui,sans-serif;color:#cce9dc}
      #${ROOT_ID} b{color:#9fffd0}#${ROOT_ID}[data-state="FOUNDATION_PASS"]{border-color:rgba(105,247,176,.35)}
      #${ROOT_ID}[data-state*="FAIL"]{border-color:rgba(255,118,160,.28);color:#f4b1c4}#${ROOT_ID} small{display:block;margin-top:2px;color:#7fa395;font-size:8px}
    `;
    document.head.appendChild(st);
  }

  function render() {
    if (typeof document === "undefined") return statusSnapshot();
    ensureStyle();
    const s = statusSnapshot();
    const anchor = byId("strategyAEvidenceGateAudit") || byId("strategyASafety") || byId("strategyAEvidenceSupplements");
    if (!anchor?.parentElement) return s;
    let root = byId(ROOT_ID);
    if (!root) { root = document.createElement("div"); root.id = ROOT_ID; }
    if (root.parentElement !== anchor.parentElement || root.previousElementSibling !== anchor) anchor.insertAdjacentElement("afterend", root);
    root.dataset.state = s.state;
    const label = s.state === "FOUNDATION_PASS" ? "PASS · builds courants liés"
      : s.state === "READY_TO_RUN" ? "prêt à certifier"
      : s.state === "WAITING_BRIDGE_PREFLIGHT" ? "attente préflight bridge"
      : s.state.includes("FAIL") || s.state === "INCOMPLETE" ? "échec / incomplet"
      : "attente runtime";
    root.innerHTML = `<b>G2 / G7 · Fondation courante : ${label}</b><small>Tests isolés PAPER · état restauré · aucun ordre réel · aucun déverrouillage live.</small>`;
    return s;
  }

  function refreshViews(reason) {
    try { globalThis.AgentCryptoStrategyAEvidenceGateAudit?.render?.(); } catch (_) {}
    try { globalThis.AgentCryptoStrategyAGateCanonicalTruth?.render?.(); } catch (_) {}
    try { globalThis.AgentCryptoStrategyASafetyCertification?.render?.(); } catch (_) {}
    try { globalThis.AgentCryptoAdministratorOperatorFocus?.refresh?.(`foundation-219:${reason || "refresh"}`); } catch (_) {}
    render();
    if (typeof document !== "undefined") {
      try { document.dispatchEvent(new CustomEvent("agent-crypto:evidence-data-changed", {detail:{owner:OWNER,build:BUILD,reason:String(reason||"refresh")}})); } catch (_) {}
    }
  }

  function run(reason = "explicit-release-delegation") {
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
      const pass = result?.pass === true && truth?.pass === true && truth?.tested_builds_match_current === true;
      const marker = Object.freeze({
        schema: "agent_crypto_foundation_delegated_action_v1",
        build: BUILD,
        at: new Date().toISOString(),
        attempted: true,
        pass,
        status: pass ? "FOUNDATION_PASS" : String(result?.status || "INCOMPLETE"),
        reason: String(reason || "explicit-release-delegation"),
        authorization: AUTHORIZATION,
        exact_current_build_binding: truth?.tested_builds_match_current === true,
        result: clone(result)
      });
      writeMarker(marker);
      refreshViews(pass ? "pass" : "not-pass");
      return statusSnapshot();
    } catch (error) {
      const marker = {schema:"agent_crypto_foundation_delegated_action_v1",build:BUILD,at:new Date().toISOString(),attempted:true,pass:false,status:"FAIL",reason:String(error?.message||error),authorization:AUTHORIZATION};
      writeMarker(marker);
      refreshViews("exception");
      return statusSnapshot();
    } finally {
      running = false;
    }
  }

  function schedule(reason) {
    const go = () => {
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
    one_shot: true,
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
    document.addEventListener("agent-crypto:runtime-modules-ready", () => schedule("runtime-modules-ready"), {once:true});
    document.addEventListener("erith:system-hydrated", () => schedule("system-hydrated"), {once:true, passive:true});
    window.addEventListener("load", () => schedule("load"), {once:true});
    window.addEventListener("pageshow", () => schedule("pageshow"), {once:true});
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => schedule("dom-ready"), {once:true});
    else schedule("script-load");
  }
})();
