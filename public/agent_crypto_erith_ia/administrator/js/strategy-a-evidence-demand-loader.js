/* Agent-Crypto Administrator — 40.6.494 EXPLICIT STRATEGY DIAGNOSTIC / EVIDENCE DEMAND
   Canonical Strategy A evidence stays immediately available on explicit operator demand.
   Evidence never loads in background. It loads only from the explicit operator control or explicit API demand.
   A failed/missing module keeps the loader PARTIAL and remains retryable.
   No recurring timer, observer, business network request or order path. */
(() => {
  "use strict";
  if (globalThis.AgentCryptoCanonicalEvidenceWiring?.owner === "strategy-a-evidence-demand-loader.js") return;

  const BUILD = "40.6.494";
  const SOURCE = "40.6.494-explicit-diagnostic-evidence-demand";
  const MODULES = Object.freeze([
    "./js/strategy-a-replay.js",
    "./js/strategy-a-replay-acceptance.js?v=40.6.405",
    "./js/strategy-a-evidence-lifecycle-truth.js",
    "./js/strategy-a-foundation-applicability-truth.js",
    "./js/strategy-a-foundation-delegated-certification-406221.js",
    "./js/strategy-a-time-semantics-truth.js",
    "./js/strategy-a-g3-structured-data-truth.js",
    "./js/strategy-a-g3-history-owner-discovery.js",
    "./js/strategy-a-g3-historical-evidence-adapter.js",
    "./js/strategy-a-g3-t0-decision-proof.js",
    "./js/strategy-a-g3-replay-dataset.js",
    "./js/strategy-a-g3-decision-replay.js",
    "./js/strategy-a-g3-cascade-checkpoint.js",
    "./js/strategy-a-gate-canonical-truth.js",
    "./js/strategy-a-evidence-dossier-supplement-integrator.js",
    "./js/strategy-a-g3-prospective-t0-capture.js",
    "./js/strategy-a-g3-overlap-live-refresh.js",
    "./js/strategy-a-g3-post-horizon-outcome.js",
    "./js/strategy-a-g3-post-horizon-mount-repair-406216.js",
    "./js/strategy-a-g3-outcome-certification-406222.js",
    "./js/strategy-a-g3-realistic-replay-readiness-406223.js",
    "./js/strategy-a-g3-forward-evidence-bridge-406224.js",
    "./js/strategy-a-g3-current-truth-surface-406225.js",
    "./js/strategy-a-g3-strict-decision-time-truth-406226.js",
    "./js/strategy-a-g3-strict-truth-mount-proof-406227.js",
    "./js/strategy-a-g3-strict-outcome-revalidation-406228.js",
    "./js/strategy-a-g3-strict-execution-realism-rebind-406229.js"
  ]);
  const PRESENTATION = Object.freeze(["./js/administrator-operator-focus-406216.js"]);
  const ALL = Object.freeze([...MODULES, ...PRESENTATION]);
  const CACHE_IDENTITY = Object.freeze({
    "./js/strategy-a-g3-prospective-t0-capture.js": "40.6.494",
    "./js/strategy-a-g3-structured-data-truth.js": "40.6.279",
    "./js/strategy-a-g3-cascade-checkpoint.js": "40.6.279",
    "./js/strategy-a-g3-strict-decision-time-truth-406226.js": "40.6.279",
    "./js/strategy-a-g3-strict-outcome-revalidation-406228.js": "40.6.279"
  });
  const moduleHref = src => {
    const url = new URL(src, document.baseURI);
    const token = CACHE_IDENTITY[src];
    if (token) url.searchParams.set("v", token);
    return url.href;
  };
  const PANEL_IDS = Object.freeze([
    "strategyAG3StructuredTruth",
    "strategyAG3HistoryOwnerDiscovery",
    "strategyAG3HistoricalEvidenceAdapter",
    "strategyAG3T0DecisionProof",
    "strategyAG3ReplayDataset",
    "strategyAG3DecisionReplay",
    "strategyAG3CascadeCheckpoint"
  ]);

  const READY_CHECKS = Object.freeze({
    "./js/strategy-a-replay.js": () => !!globalThis.AgentCryptoStrategyAReplay,
    "./js/strategy-a-replay-acceptance.js?v=40.6.405": () => !!globalThis.AgentCryptoStrategyAReplayAcceptance,
    "./js/strategy-a-evidence-lifecycle-truth.js": () => !!globalThis.AgentCryptoEvidenceLifecycleTruth,
    "./js/strategy-a-foundation-applicability-truth.js": () => globalThis.AgentCryptoStrategyASafetyCertification?.foundation_applicability_truth_406191 === true,
    "./js/strategy-a-foundation-delegated-certification-406221.js": () => !!globalThis.AgentCryptoStrategyAFoundationDelegatedCertification,
    "./js/strategy-a-time-semantics-truth.js": () => !!globalThis.__AGENT_CRYPTO_TIME_SEMANTICS_TRUTH_406168__,
    "./js/strategy-a-g3-structured-data-truth.js": () => !!globalThis.AgentCryptoStrategyAG3StructuredDataTruth,
    "./js/strategy-a-g3-history-owner-discovery.js": () => !!globalThis.AgentCryptoStrategyAG3HistoryOwnerDiscovery,
    "./js/strategy-a-g3-historical-evidence-adapter.js": () => !!globalThis.AgentCryptoStrategyAG3HistoricalEvidenceAdapter,
    "./js/strategy-a-g3-t0-decision-proof.js": () => !!globalThis.AgentCryptoStrategyAG3T0DecisionProof,
    "./js/strategy-a-g3-replay-dataset.js": () => !!globalThis.AgentCryptoStrategyAG3ReplayDataset,
    "./js/strategy-a-g3-decision-replay.js": () => !!globalThis.AgentCryptoStrategyAG3DecisionReplay,
    "./js/strategy-a-g3-cascade-checkpoint.js": () => !!globalThis.AgentCryptoStrategyAG3CascadeCheckpoint,
    "./js/strategy-a-gate-canonical-truth.js": () => !!globalThis.AgentCryptoStrategyAGateCanonicalTruth,
    "./js/strategy-a-evidence-dossier-supplement-integrator.js": () => !!globalThis.AgentCryptoStrategyAEvidenceDossierSupplementIntegrator,
    "./js/strategy-a-g3-prospective-t0-capture.js": () => !!globalThis.AgentCryptoStrategyAG3ProspectiveT0Capture,
    "./js/strategy-a-g3-overlap-live-refresh.js": () => !!globalThis.AgentCryptoStrategyAG3OverlapLiveRefresh,
    "./js/strategy-a-g3-post-horizon-outcome.js": () => !!globalThis.AgentCryptoStrategyAG3PostHorizonOutcome,
    "./js/strategy-a-g3-post-horizon-mount-repair-406216.js": () => !!globalThis.AgentCryptoStrategyAG3PostHorizonMountRepair,
    "./js/strategy-a-g3-outcome-certification-406222.js": () => !!globalThis.AgentCryptoStrategyAG3OutcomeCertification,
    "./js/strategy-a-g3-realistic-replay-readiness-406223.js": () => !!globalThis.AgentCryptoStrategyAG3RealisticReplayReadiness,
    "./js/strategy-a-g3-forward-evidence-bridge-406224.js": () => !!globalThis.AgentCryptoStrategyAG3ForwardEvidenceBridge,
    "./js/strategy-a-g3-current-truth-surface-406225.js": () => !!globalThis.AgentCryptoStrategyAG3CurrentTruthSurface,
    "./js/strategy-a-g3-strict-decision-time-truth-406226.js": () => !!globalThis.AgentCryptoStrategyAG3StrictDecisionTimeTruth,
    "./js/strategy-a-g3-strict-truth-mount-proof-406227.js": () => !!globalThis.AgentCryptoStrategyAG3StrictTruthMountProof,
    "./js/strategy-a-g3-strict-outcome-revalidation-406228.js": () => !!globalThis.AgentCryptoStrategyAG3StrictOutcomeRevalidation,
    "./js/strategy-a-g3-strict-execution-realism-rebind-406229.js": () => !!globalThis.AgentCryptoStrategyAG3StrictExecutionRealismRebind,
    "./js/administrator-operator-focus-406216.js": () => !!globalThis.AgentCryptoAdministratorOperatorFocus
  });

  const states = new Map(ALL.map(src => [src, "pending"]));
  const loaded = new Set();
  const failures = new Map();
  let loading = null;
  let complete = false;
  let reasonLast = "not-started";

  const absolute = src => new URL(src, document.baseURI).href.split("?")[0];
  function findScript(src) {
    const wanted = absolute(src);
    return Array.from(document.scripts).find(script => {
      try { return script.src && new URL(script.src, document.baseURI).href.split("?")[0] === wanted; }
      catch (_) { return false; }
    }) || null;
  }
  function moduleReady(src) {
    const check = READY_CHECKS[src];
    try { return typeof check === "function" ? check() === true : loaded.has(src); }
    catch (_) { return false; }
  }
  function markLoaded(src) {
    loaded.add(src);
    failures.delete(src);
    states.set(src, "loaded");
  }
  function markFailed(src, error) {
    loaded.delete(src);
    failures.set(src, String(error?.message || error || "MODULE_NOT_READY"));
    states.set(src, "failed");
  }
  function yieldBrowser(timeout=220) {
    return new Promise(resolve => {
      if (typeof requestIdleCallback === "function") requestIdleCallback(() => resolve(), {timeout});
      else setTimeout(resolve, 48);
    });
  }
  function waitExisting(src, script) {
    return new Promise((resolve, reject) => {
      const onLoad = () => {
        if (moduleReady(src)) { markLoaded(src); resolve(src); return; }
        const error = new Error("evidence demand module loaded without canonical API: " + src);
        markFailed(src, error);
        try { script.remove(); } catch (_) {}
        reject(error);
      };
      const onError = () => {
        const error = new Error("evidence demand module failed: " + src);
        markFailed(src, error);
        try { script.remove(); } catch (_) {}
        reject(error);
      };
      script.addEventListener("load", onLoad, {once:true});
      script.addEventListener("error", onError, {once:true});
    });
  }
  function loadOne(src) {
    if (moduleReady(src)) { markLoaded(src); return Promise.resolve(src); }

    const existing = findScript(src);
    if (existing) {
      if (existing.dataset.agentCryptoEvidenceDemandState === "failed") {
        try { existing.remove(); } catch (_) {}
      } else if (existing.dataset.agentCryptoEvidenceDemandState === "loading") {
        states.set(src, "loading");
        return waitExisting(src, existing);
      } else if (moduleReady(src)) {
        markLoaded(src);
        return Promise.resolve(src);
      } else if (existing.dataset.agentCryptoEvidenceDemandModule === src) {
        try { existing.remove(); } catch (_) {}
      }
    }

    states.set(src, "loading");
    failures.delete(src);
    return new Promise((resolve,reject) => {
      const script=document.createElement("script");
      script.src=moduleHref(src);
      script.async=false;
      script.dataset.agentCryptoEvidenceDemandModule=src;
      script.dataset.agentCryptoEvidenceDemandState="loading";
      script.addEventListener("load",()=>{
        if (moduleReady(src)) {
          script.dataset.agentCryptoEvidenceDemandState="loaded";
          markLoaded(src);
          resolve(src);
          return;
        }
        const error = new Error("evidence demand module loaded without canonical API: " + src);
        script.dataset.agentCryptoEvidenceDemandState="failed";
        markFailed(src, error);
        try { script.remove(); } catch (_) {}
        reject(error);
      },{once:true});
      script.addEventListener("error",()=>{
        const error = new Error("evidence demand module failed: " + src);
        script.dataset.agentCryptoEvidenceDemandState="failed";
        markFailed(src, error);
        try { script.remove(); } catch (_) {}
        reject(error);
      },{once:true});
      document.head.appendChild(script);
    });
  }
  function mountEvidence() {
    try{globalThis.AgentCryptoStrategyAEvidenceDossierSupplementIntegrator?.mount?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAFoundationDelegatedCertification?.run?.("406284-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3CascadeCheckpoint?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3ProspectiveT0Capture?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3OverlapLiveRefresh?.refresh?.("406284-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3PostHorizonOutcome?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3PostHorizonMountRepair?.mount?.("406284-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3OutcomeCertification?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3RealisticReplayReadiness?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3ForwardEvidenceBridge?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3CurrentTruthSurface?.render?.("406284-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3StrictDecisionTimeTruth?.render?.("406284-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3StrictTruthMountProof?.mount?.("406284-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3StrictOutcomeRevalidation?.render?.("406284-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3StrictExecutionRealismRebind?.render?.("406284-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoAdministratorOperatorFocus?.requestSettled?.("406284-demand-owner");}catch(_){}
  }
  function reconcileState() {
    for (const src of ALL) {
      if (moduleReady(src)) markLoaded(src);
      else if (states.get(src) === "loaded") states.set(src, "pending");
    }
    complete = ALL.every(src => states.get(src) === "loaded" && moduleReady(src));
    return complete;
  }
  async function load(reason="manual") {
    reasonLast=String(reason||"manual");
    reconcileState();
    if (complete) { mountEvidence(); return MODULES.slice(); }
    if (loading) return loading;

    loading=(async()=>{
      try{globalThis.AgentCryptoBootProbe?.markOnce?.("strategy-evidence-start",{reason:reasonLast});}catch(_){}
      const missing = ALL.filter(src => !moduleReady(src));
      for (const src of missing) {
        await yieldBrowser();
        try { await loadOne(src); }
        catch (error) { console.warn("[40.6.284 evidence demand]", src, error); }
      }

      reconcileState();
      const readyModules = MODULES.filter(src => moduleReady(src));
      const missingModules = ALL.filter(src => !moduleReady(src));

      if (complete) {
        try{globalThis.AgentCryptoBootProbe?.markOnce?.("strategy-evidence-ready",{loaded:readyModules.length});}catch(_){}
        mountEvidence();
        try{document.dispatchEvent(new CustomEvent("agent-crypto:runtime-modules-ready",{detail:{modules:MODULES.slice(),source:SOURCE,complete:true}}));}catch(_){}
        try{document.dispatchEvent(new CustomEvent("agent-crypto:evidence-data-changed",{detail:{source:SOURCE}}));}catch(_){}
      } else {
        try{document.dispatchEvent(new CustomEvent("agent-crypto:runtime-modules-partial",{detail:{modules:readyModules.slice(),missing:missingModules.slice(),source:SOURCE,complete:false}}));}catch(_){}
      }
      return readyModules;
    })();

    try { return await loading; } finally { loading=null; }
  }
  function evidenceIntent(target) {
    if (!(target instanceof Element)) return null;
    return target.closest('[data-strategy-evidence-demand="true"]');
  }
  document.addEventListener("click",event=>{
    const trigger=evidenceIntent(event.target);
    if(!trigger)return;
    const reason=String(trigger.getAttribute("data-strategy-evidence-reason")||"operator-explicit-evidence-demand");
    void load(reason);
  },true);
  globalThis.AgentCryptoCanonicalEvidenceWiring=Object.freeze({
    build:BUILD,
    owner:"strategy-a-evidence-demand-loader.js",
    mode:"EXPLICIT_EVIDENCE_DEMAND_ONLY",
    modules:MODULES,
    presentation_modules:PRESENTATION,
    panels:PANEL_IDS,
    load,
    loaded:()=>Object.freeze(Array.from(loaded)),
    failed:()=>Object.freeze(Array.from(failures.entries()).map(([src,error])=>({src,error}))),
    snapshot:()=>{
      reconcileState();
      return Object.freeze({
        build:BUILD,owner:"strategy-a-evidence-demand-loader.js",mode:"EXPLICIT_EVIDENCE_DEMAND_ONLY",
        loaded:loaded.size,total:ALL.length,complete,reason_last:reasonLast,
        missing:Object.freeze(ALL.filter(src=>!moduleReady(src))),
        failed:Object.freeze(Array.from(failures.keys())),
        states:Object.freeze(Object.fromEntries(states)),
        direct_parser_injection:false,idle_paced:true,recurring_timer:false,observer:false,
        business_network_request:false,background_after_postboot:false,explicit_demand_only:true,ordinary_surface_click_demand:false,hash_demand:false,explicit_control_selector:'[data-strategy-evidence-demand="true"]',real_order:false,paper_only:true,
        g3:"PENDING",g9:"LOCKED"
      });
    }
  });
})();