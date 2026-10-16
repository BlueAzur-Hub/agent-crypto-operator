(() => {
  "use strict";
  const BUILD = "40.6.599";
  const ADMIN_BASE = "40.6.571";
  const DETAIL_KEY = "agent_crypto_erith_ia_clean_lens_detail_collapsed_v2";
  const profileNode = document.getElementById("viewportProfile");

  function viewportProfile() {
    const w = window.innerWidth || 0;
    if (w >= 1500) return "wide";
    if (w >= 1180) return "desktop";
    if (w >= 820) return "compact-desktop";
    return "mobile";
  }

  function syncViewport() {
    const profile = viewportProfile();
    document.documentElement.dataset.traderViewport = profile;
    if (profileNode) profileNode.textContent = "viewport · " + profile;
  }

  function scheduleGraphLayout() {
    requestAnimationFrame(() => {
      try { globalThis.AgentCryptoMarketMicroscope?.mount?.(); } catch (_) {}
      try { window.dispatchEvent(new Event("resize")); } catch (_) {}
    });
  }

  /* Transposition directe du comportement Clean Lens Administrator. */
  function setDetailCollapsed(collapsed, persist = true) {
    const deck = document.getElementById("analyste");
    const panel = document.getElementById("detailPanel");
    const toggle = document.getElementById("detailPanelToggle");
    const stateLabel = document.getElementById("detailPanelToggleState");
    const rail = document.getElementById("detailPanelRail");
    const railArrow = document.querySelector("#detailPanelRail b");
    if (!deck || !panel) return false;

    const value = !!collapsed;
    deck.classList.toggle("detail-collapsed", value);
    toggle?.setAttribute("aria-expanded", String(!value));
    rail?.setAttribute("aria-expanded", String(!value));
    panel.setAttribute("aria-hidden", String(value));
    panel.inert = value;
    panel.hidden = value;

    if (stateLabel) stateLabel.textContent = value ? "Afficher ▼" : "Réduire ▲";
    if (railArrow) railArrow.textContent = value ? "▼" : "▲";

    if (persist) {
      try { localStorage.setItem(DETAIL_KEY, value ? "1" : "0"); } catch (_) {}
    }
    scheduleGraphLayout();
    return true;
  }

  function toggleDetail(forceOpen = null) {
    const deck = document.getElementById("analyste");
    if (!deck) return;
    const collapsed = deck.classList.contains("detail-collapsed");
    const next = forceOpen === true ? false : forceOpen === false ? true : !collapsed;
    setDetailCollapsed(next, true);
  }

  function initNativeDetailPanel() {
    const deck = document.getElementById("analyste");
    const toggle = document.getElementById("detailPanelToggle");
    const rail = document.getElementById("detailPanelRail");
    if (!deck || !toggle || !rail) return false;

    let collapsed = false;
    try {
      const stored = localStorage.getItem(DETAIL_KEY);
      collapsed = stored === "1";
    } catch (_) {}
    setDetailCollapsed(collapsed, false);

    const bind = node => {
      if (!node || node.dataset.traderNativeDetailBound === "1") return;
      node.dataset.traderNativeDetailBound = "1";
      node.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        toggleDetail();
      });
    };
    bind(toggle);
    bind(rail);
    return true;
  }

  function mountExistingCandlesOwner() {
    const quote = globalThis.AgentCryptoQuoteCurrencyArchitecture;
    const candles = globalThis.AgentCryptoMarketMicroscope;
    try { quote?.setDisplayCurrency?.("USD", { reason: "trader-default-usd" }); } catch (_) {}
    const mounted = !!candles?.mount?.();
    if (mounted) {
      try { candles.setMode?.("candles"); } catch (_) {}
      document.documentElement.dataset.traderCandlesOwner = "mounted";
    } else {
      document.documentElement.dataset.traderCandlesOwner = "missing";
    }
    return mounted;
  }

  function mountExistingDepthOwner() {
    const depth = globalThis.AgentCryptoOkxMicrostructure;
    const mounted = !!depth?.mount?.();
    if (mounted) {
      try { depth.setOpen?.(true); } catch (_) {}
      document.documentElement.dataset.traderDepthOwner = "mounted";
    } else {
      document.documentElement.dataset.traderDepthOwner = "missing";
    }
    return mounted;
  }

  function syncTechnicalSummary(levels) {
    if (!levels) return;
    const host = document.getElementById("atlasCandlesTechnicalLevels");
    if (host && !host.hidden && host.dataset.traderInitialOpen !== "1") {
      host.dataset.traderInitialOpen = "1";
      host.open = true;
    }
    try {
      window.dispatchEvent(new CustomEvent("agent-crypto:trader-technical-levels",{detail:levels}));
    } catch (_) {}
  }
  window.addEventListener("agent-crypto:candles-technical-levels", event => syncTechnicalSummary(event.detail), { passive: true });
  window.addEventListener("agent-crypto:quote-architecture-changed", () => {
    const levels = globalThis.AgentCryptoMarketMicroscope?.technicalLevels?.();
    if (levels) syncTechnicalSummary(levels);
  }, { passive: true });

  globalThis.AgentCryptoTraderFoundation = Object.freeze({
    build: BUILD,
    administratorBase: ADMIN_BASE,
    surface: "trader",
    execution: "disabled",
    phase: "line-resilient-cache-debug",
    duplicatedBusinessLogic: false,
    mountedOwners: Object.freeze({
      candles: true,
      depth: true,
      technicalReadingArchitecture: true,
      technicalReadingSRBridge: true,
      market: true,
      mathCore: true
    }),
    omittedSections: Object.freeze([
      "Aether","Atlas","Oracle","Veille","Sources","Decision Board","Other Administrator sections"
    ]),
    snapshot() {
      return {
        build: BUILD,
        administrator_base: ADMIN_BASE,
        viewport: viewportProfile(),
        detail_collapsed: document.getElementById("analyste")?.classList.contains("detail-collapsed") === true,
        execution: "disabled"
      };
    }
  });

  const boot = () => {
    syncViewport();
    initNativeDetailPanel();
    mountExistingCandlesOwner();
    mountExistingDepthOwner();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("pageshow", () => {
    mountExistingCandlesOwner();
    mountExistingDepthOwner();
  }, { passive: true });
  window.addEventListener("resize", syncViewport, { passive: true });
})();
