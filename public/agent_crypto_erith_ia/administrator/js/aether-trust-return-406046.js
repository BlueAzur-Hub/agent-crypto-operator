/* Agent-Crypto 40.6.46 — AETHER TRUST DIRECT-ADMIN RETURN LOCK
   Direct Administration authentication preserves the operator viewport.
   Explicit Atlas/Local-AI authentication preserves its canonical pending target.
   No recurring timer, observer, fetch owner, storage owner or business mutation. */
(() => {
  "use strict";
  let directAdminEntry = null;

  document.addEventListener("click", event => {
    const button = event.target instanceof Element ? event.target.closest("#btnAdminAccountToggle") : null;
    if (!button || event.isTrusted !== true) return;
    directAdminEntry = {
      x: window.scrollX,
      y: window.scrollY,
      hash: location.hash,
      pathname: location.pathname,
      search: location.search
    };
  }, true);

  const bind = () => {
    const dialog = document.getElementById("atlasAccessDialog");
    const button = document.getElementById("btnAdminAccountToggle");
    if (!dialog || dialog.dataset.aetherTrustReturn406046 === "1") return;
    dialog.dataset.aetherTrustReturn406046 = "1";

    dialog.addEventListener("close", () => {
      const point = directAdminEntry;
      directAdminEntry = null;
      if (!point) return; // Explicit Atlas/other protected navigation: keep its target.

      const restore = () => {
        const unwantedAtlasHash = location.hash === "#local-ai-hub" && point.hash !== "#local-ai-hub";
        if (unwantedAtlasHash) {
          history.replaceState(history.state, "", `${point.pathname}${point.search}${point.hash || ""}`);
        }
        window.scrollTo({ left: point.x, top: point.y, behavior: "auto" });
        try { button?.focus({ preventScroll: true }); } catch (_) {}
      };

      // Let the canonical role transition complete, then restore the pre-Trust viewport.
      queueMicrotask(() => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(restore))));
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once:true });
  else bind();

  globalThis.ErithAetherTrustReturn406046 = Object.freeze({
    build:"40.6.46",
    direct_admin_viewport_preserved:true,
    explicit_atlas_pending_target_preserved:true,
    recurring_timer_added:false,
    observer_added:false,
    fetch_owner_added:false,
    storage_owner_added:false
  });
})();
