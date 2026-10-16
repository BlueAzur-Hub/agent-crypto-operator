/* Agent-Crypto @erith.IA — 40.6.240
   COMMAND CENTER ROUTING COMPLETION

   One responsibility:
   make existing Command Center shortcuts land on their actual current owner
   without creating a second menu or changing business/runtime truth.

   Uses existing PresentationLifecycle.restoreForHash when available, opens
   ancestor <details>, performs one bounded requestAnimationFrame settle loop,
   then scrolls to the resolved surface. No timer, observer, storage or network.
*/
(() => {
  "use strict";

  const BUILD = "40.6.240";
  const DRAWER_ID = "atlasAdminCenterDrawer";
  const SELECT_ID = "atlasV2AdvancedModuleSelect";
  const OPEN_ID = "btnOpenAdvancedModule";
  const ROUTE_EVENT = "agent-crypto:command-center-route";
  const MAX_FRAMES = 10;

  const ALIASES = Object.freeze({
    "fonds-erith-ia": "fonds-erith",
    "association-erith-ia": "association-erith"
  });

  let activeNode = null;
  let lastRoute = null;

  const esc = value => {
    try { return CSS.escape(String(value)); }
    catch (_) { return String(value).replace(/["\\]/g, "\\$&"); }
  };

  function normalizeTarget(value) {
    return String(value || "")
      .trim()
      .replace(/^#/, "");
  }

  function lifecycleRestore(target) {
    try {
      return globalThis.ErithPresentationLifecycle?.restoreForHash?.(`#${target}`) === true;
    } catch (_) {
      return false;
    }
  }

  function resolveTarget(target) {
    const key = normalizeTarget(target);
    if (!key) return null;

    const direct = document.getElementById(key);
    if (direct) return direct;

    const collapse = document.querySelector(`[data-collapse-key="${esc(key)}"]`);
    if (collapse) return collapse;

    const alias = ALIASES[key] || "";
    if (alias) {
      const aliasId = document.getElementById(alias);
      if (aliasId) return aliasId;
      const aliasCollapse = document.querySelector(`[data-collapse-key="${esc(alias)}"]`);
      if (aliasCollapse) return aliasCollapse;
    }

    const semantic = document.querySelector(
      `[data-module-key="${esc(key)}"],[data-section-key="${esc(key)}"],[data-admin-module="${esc(key)}"]`
    );
    return semantic || null;
  }

  function surfaceFor(node) {
    if (!(node instanceof Element)) return null;
    if (node instanceof HTMLDetailsElement) return node;
    if (node.matches("[data-project-lazy-anchor],[data-system-lazy-anchor]")) {
      return node.closest("details") || node.closest("section,article") || node;
    }
    if (node.getBoundingClientRect) {
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        return node.closest("details") || node.closest("section,article") || node;
      }
    }
    return node;
  }

  function openAncestors(node) {
    if (!(node instanceof Element)) return false;
    const details = [];
    if (node instanceof HTMLDetailsElement) details.push(node);
    let parent = node.parentElement;
    while (parent) {
      if (parent instanceof HTMLDetailsElement) details.push(parent);
      parent = parent.parentElement;
    }
    details.reverse().forEach(detail => {
      if (!detail.open) detail.open = true;
    });
    return details.length > 0;
  }

  function markSurface(node, target) {
    if (activeNode && activeNode !== node) {
      try { delete activeNode.dataset.commandCenterRouteActive; } catch (_) {}
    }
    activeNode = node;
    if (node?.dataset) node.dataset.commandCenterRouteActive = target;
    try {
      document.documentElement.dataset.commandCenterRoute406240 = target;
    } catch (_) {}
  }

  function closeDrawer() {
    const close = document.getElementById("atlasAdminCenterClose");
    const drawer = document.getElementById(DRAWER_ID);
    if (drawer && drawer.hidden !== true && close instanceof HTMLElement) {
      try { close.click(); } catch (_) {}
    }
  }

  function publish(target, source, ok, frame, node) {
    const detail = Object.freeze({
      build: BUILD,
      target,
      source,
      ok: ok === true,
      frame,
      resolved_id: String(node?.id || ""),
      collapse_key: String(node?.dataset?.collapseKey || ""),
      recurring_timer: false,
      observer: false,
      storage_write: false,
      network: false
    });
    lastRoute = detail;
    try { document.dispatchEvent(new CustomEvent(ROUTE_EVENT, { detail })); } catch (_) {}
    return detail;
  }

  function finalize(target, source, frame, rawNode) {
    const node = surfaceFor(rawNode);
    if (!(node instanceof Element)) return false;

    openAncestors(node);

    try {
      node.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    } catch (_) {
      try { node.scrollIntoView(); } catch (_) {}
    }

    markSurface(node, target);
    closeDrawer();
    publish(target, source, true, frame, node);
    return true;
  }

  function route(target, source = "command-center") {
    target = normalizeTarget(target);
    if (!target) return false;

    lifecycleRestore(target);

    // Decision Board has a current read-only renderer already loaded.
    if (target === "decision-board") {
      try { globalThis.atlasDecisionBoardDualMemory?.render?.(); } catch (_) {}
    }

    let frame = 0;
    const attempt = () => {
      lifecycleRestore(target);
      const node = resolveTarget(target);
      if (node && finalize(target, source, frame, node)) return;

      frame += 1;
      if (frame >= MAX_FRAMES) {
        publish(target, source, false, frame, null);
        return;
      }
      requestAnimationFrame(attempt);
    };

    requestAnimationFrame(attempt);
    return true;
  }

  function bind() {
    const drawer = document.getElementById(DRAWER_ID);
    if (!(drawer instanceof HTMLElement) || drawer.dataset.commandCenterRouting406240 === "1") return false;
    drawer.dataset.commandCenterRouting406240 = "1";

    // Keep the native href/default behavior. This layer only verifies/restores
    // the target after existing capture handlers and lazy owners have reacted.
    drawer.addEventListener("click", event => {
      const anchor = event.target instanceof Element
        ? event.target.closest('a.atlas-quick-link[href^="#"]')
        : null;
      if (!anchor) return;
      const target = normalizeTarget(anchor.getAttribute("href"));
      if (!target) return;
      queueMicrotask(() => route(target, "quick-link"));
    });

    const open = document.getElementById(OPEN_ID);
    if (open instanceof HTMLElement && open.dataset.commandCenterRouting406240 !== "1") {
      open.dataset.commandCenterRouting406240 = "1";
      open.addEventListener("click", () => {
        const select = document.getElementById(SELECT_ID);
        const target = normalizeTarget(select?.value || "");
        if (!target) return;
        queueMicrotask(() => route(target, "module-picker"));
      });
    }

    return true;
  }

  globalThis.AgentCryptoCommandCenterRouting406240 = Object.freeze({
    build: BUILD,
    route,
    resolve: target => resolveTarget(normalizeTarget(target)),
    snapshot: () => Object.freeze({
      build: BUILD,
      drawer_bound: document.getElementById(DRAWER_ID)?.dataset?.commandCenterRouting406240 === "1",
      last_route: lastRoute,
      max_frames: MAX_FRAMES,
      uses_presentation_lifecycle_restore: true,
      creates_second_menu: false,
      recurring_timer: false,
      observer: false,
      storage_write: false,
      network: false,
      market_core_modified: false,
      strategy_a_business_logic_modified: false
    })
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }
  window.addEventListener("load", bind, { once: true });
})();
