/* Agent-Crypto Trader cockpit fit
   Presentation-only geometry.
   Goal: Graphique + Lecture Technique consume the middle of the Trader viewport,
   Target Top 5 is the final visible strip, Market Flow remains naturally below.
   No DOM move, no timer, no observer, no storage, no network. */
(() => {
  "use strict";

  const ROOT = document.documentElement;
  const HEIGHT_VAR = "--trader-target-top-analyst-height";
  const MIN_WIDTH = 1101;
  const MIN_ANALYST_HEIGHT = 400;
  const BOTTOM_GUARD = 4;
  let resizeFrame = 0;

  const analyst = () => document.getElementById("analyste");
  const targetTop = () => document.querySelector("#market-workspace > .top5-ribbon");

  function enabled() {
    if (ROOT.dataset.agentCryptoSurface !== "trader") return false;
    if (window.innerWidth < MIN_WIDTH) return false;
    return String(ROOT.dataset.atlasMarketDomain || "crypto").toLowerCase() !== "metals";
  }

  function measure() {
    const graph = analyst();
    const target = targetTop();
    if (!(graph instanceof HTMLElement) || !(target instanceof HTMLElement)) return null;

    const graphRect = graph.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const viewportHeight = Math.max(0, document.documentElement.clientHeight || window.innerHeight || 0);
    if (!(viewportHeight > 0 && targetRect.height > 0)) return null;

    const naturalGap = Math.max(0, targetRect.top - graphRect.bottom);
    const requested = Math.floor(
      viewportHeight
      - graphRect.top
      - naturalGap
      - targetRect.height
      - BOTTOM_GUARD
    );

    return Object.freeze({
      viewport_height: Math.round(viewportHeight),
      graph_top: Math.round(graphRect.top),
      target_height: Math.round(targetRect.height),
      natural_gap: Math.round(naturalGap),
      analyst_height: Math.max(MIN_ANALYST_HEIGHT, requested)
    });
  }

  function snapshot(reason = "snapshot", values = null) {
    const m = values || measure();
    return Object.freeze({
      active: enabled(),
      reason: String(reason || "snapshot"),
      analyst_height: Number(m?.analyst_height || 0),
      viewport_height: Number(m?.viewport_height || 0),
      target_height: Number(m?.target_height || 0),
      natural_gap: Number(m?.natural_gap || 0),
      target_top_native: true,
      market_flow_hidden: false,
      market_flow_moved: false,
      dom_moved: false,
      timer: false,
      observer: false,
      storage: false,
      network: false,
      market_core_modified: false
    });
  }

  function apply(reason = "fit") {
    if (!enabled()) {
      ROOT.style.removeProperty(HEIGHT_VAR);
      delete ROOT.dataset.traderTargetTopFit;
      return false;
    }

    const m = measure();
    if (!m) return false;

    ROOT.style.setProperty(HEIGHT_VAR, `${m.analyst_height}px`);
    ROOT.dataset.traderTargetTopFit = "ready";
    ROOT.dataset.traderTargetTopFitReason = String(reason || "fit");
    ROOT.dataset.traderTargetTopAnalystHeight = String(m.analyst_height);

    globalThis.AgentCryptoTraderCockpitFitState = snapshot(reason, m);
    return true;
  }

  function schedule(reason = "viewport-resize") {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      apply(reason);
    });
  }

  function install() {
    if (ROOT.dataset.agentCryptoSurface !== "trader") return false;

    apply("install");
    schedule("first-frame");

    window.addEventListener("resize", () => schedule("viewport-resize"), { passive: true });
    window.addEventListener("pageshow", () => schedule("pageshow"), { passive: true });

    if (document.fonts?.ready) {
      Promise.resolve(document.fonts.ready).then(() => schedule("fonts-ready")).catch(() => {});
    }
    return true;
  }

  globalThis.AgentCryptoTraderCockpitFit = Object.freeze({
    apply,
    refit: () => apply("manual-refit"),
    snapshot: () => snapshot("api"),
    presentation_only: true,
    target_top_native: true,
    market_flow_modified: false,
    recurring_timer: false,
    mutation_observer: false,
    storage_owner: false,
    network_owner: false,
    dom_move: false,
    market_core_modified: false
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
