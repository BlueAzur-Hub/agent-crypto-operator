/*
  Agent-Crypto Administrator — TRADUS Data/UI Decoupling
  Build: 40.6.71
  Parent: 40.6.70
  Responsibility: make TRADUS PAPER truth available to Aether independently of whether
  the optional TRADUS visual panels are currently mounted.

  Safety / scope:
  - additive runtime coordinator only;
  - no market polling, no recurring timer, no MutationObserver;
  - no credential, wallet or real-order capability;
  - no Strategy A mutation;
  - no Aether geometry or artwork ownership;
  - no lifecycle ownership: 40.6.67 remains PAPER lifecycle owner;
  - 40.6.68 remains observability/archive owner;
  - 40.6.69 R1 remains Aether bridge/workbench owner.
*/
(() => {
  "use strict";

  const BUILD = "40.6.71";
  const PARENT = "40.6.70";
  const SNAPSHOT_EVENT = "agentcrypto:tradus-paper-snapshot";
  const PILL_ID = "aetherTradusPill406069";
  const STAGE_SELECTOR = "[data-aether-component-stage-406046]";
  const OPEN_SELECTOR = "#atlasAetherStatusToggle4084,[data-aether46-open],.aether46-actions button,[data-aether-card-406046=\"events\"]";

  let lastActivation = null;
  let activationCount = 0;

  const clone = value => {
    try { return JSON.parse(JSON.stringify(value)); }
    catch (_) { return null; }
  };

  const observability = () => globalThis.AgentCryptoTradusPaperObservability406068 || null;
  const paperOwner = () => globalThis.AgentCryptoTradusPaperShadow406067 || null;
  const aetherBridge = () => globalThis.AgentCryptoAetherTradusBridge406069 || null;

  function classify(snapshot = null) {
    const paper = paperOwner();
    if (!paper || typeof paper.read !== "function") return "unavailable";
    if (!snapshot || !snapshot.observed_at) return "waiting";
    return "observed";
  }

  function semanticModel(snapshot = null) {
    const state = classify(snapshot);
    if (state === "unavailable") {
      return Object.freeze({
        state,
        label:"TRADUS · INDISPONIBLE",
        title:"TRADUS PAPER indisponible : propriétaire lifecycle absent",
        tone:"muted"
      });
    }
    if (state === "waiting") {
      return Object.freeze({
        state,
        label:"TRADUS · EN ATTENTE",
        title:"TRADUS PAPER prêt · en attente d’une première observation carnet",
        tone:"wait"
      });
    }
    return Object.freeze({ state, label:null, title:null, tone:null });
  }

  function stampStage(state, snapshot = null) {
    if (typeof document === "undefined") return false;
    const stage = document.querySelector(STAGE_SELECTOR);
    if (!stage) return false;
    stage.dataset.tradusTruth406071 = state;
    stage.dataset.tradusDataUiDecoupling406071 = "active";
    stage.dataset.tradusObserved406071 = snapshot?.observed_at ? "1" : "0";
    return true;
  }

  function applySemanticState(snapshot = null) {
    if (typeof document === "undefined") return false;

    const bridge = aetherBridge();
    try { bridge?.mount_surface?.(snapshot || null); } catch (_) {}

    const model = semanticModel(snapshot);
    stampStage(model.state, snapshot);

    if (model.state === "observed") return true;

    const pill = document.getElementById(PILL_ID);
    if (!pill) return false;
    pill.textContent = model.label;
    pill.title = model.title;
    pill.dataset.tone = model.tone;
    pill.dataset.truth406071 = model.state;
    return true;
  }

  function publishTruth(source = "manual") {
    const obs = observability();
    let snapshot = null;

    if (obs && typeof obs.publish === "function") {
      try { snapshot = obs.publish(null, `406071_${source}`); } catch (_) {}
    }
    if (!snapshot && obs && typeof obs.read === "function") {
      try { snapshot = obs.read(); } catch (_) {}
    }

    try { obs?.mount?.(); } catch (_) {}

    const state = classify(snapshot);
    lastActivation = Object.freeze({
      at:new Date().toISOString(), source, state,
      observed_at:snapshot?.observed_at || null,
      signal:snapshot?.signal || null,
      side:snapshot?.side || null
    });
    activationCount += 1;

    queueMicrotask(() => applySemanticState(snapshot));
    return clone({ build:BUILD, parent:PARENT, activation:lastActivation, snapshot });
  }

  function afterExplicitOpen() {
    requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      const obs = observability();
      let snapshot = null;
      try { snapshot = obs?.read?.() || null; } catch (_) {}
      applySemanticState(snapshot);
    })));
  }

  function selfTest() {
    const savedPaper = globalThis.AgentCryptoTradusPaperShadow406067;
    let syntheticOwnerInstalled = false;
    try {
      if (!savedPaper) {
        syntheticOwnerInstalled = true;
        globalThis.AgentCryptoTradusPaperShadow406067 = Object.freeze({ read:() => ({ paper_only:true }) });
      }
      const waiting = semanticModel({ observed_at:null });
      const observed = semanticModel({ observed_at:"2026-09-11T09:00:00.000Z", side:"FLAT", signal:"NO_TRADE" });
      const pass = waiting.state === "waiting" && waiting.label === "TRADUS · EN ATTENTE" && observed.state === "observed";
      return Object.freeze({
        build:BUILD,
        pass,
        checks:{ waiting:waiting.state, observed:observed.state },
        paper_only:true,
        real_orders:false,
        strategy_a_mutated:false,
        market_polling:false,
        recurring_timer:false,
        mutation_observer:false,
        global_dom_observer:false,
        aether_geometry_owner:false
      });
    } finally {
      if (syntheticOwnerInstalled) {
        try { delete globalThis.AgentCryptoTradusPaperShadow406067; } catch (_) {}
      }
    }
  }

  const api = Object.freeze({
    build:BUILD,
    parent_build:PARENT,
    publish_truth:publishTruth,
    apply_semantic_state:applySemanticState,
    classify,
    status:() => clone(lastActivation),
    activation_count:() => activationCount,
    self_test:selfTest,
    paper_only:true,
    real_orders:false,
    credentials:false,
    wallet:false,
    strategy_a_mutated:false,
    market_polling:false,
    recurring_timer:false,
    mutation_observer:false,
    global_dom_observer:false,
    aether_geometry_owner:false
  });
  globalThis.AgentCryptoTradusDataUiDecoupling406071 = api;

  if (typeof document !== "undefined") {
    document.addEventListener(SNAPSHOT_EVENT, event => {
      queueMicrotask(() => applySemanticState(event?.detail || null));
    });

    document.addEventListener("click", event => {
      const target = event.target?.closest?.(OPEN_SELECTOR);
      if (!target) return;
      afterExplicitOpen();
    }, { capture:true });

    const boot = () => publishTruth("boot");
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once:true });
    else boot();

    window.addEventListener("pageshow", () => publishTruth("pageshow"));
  }
})();
