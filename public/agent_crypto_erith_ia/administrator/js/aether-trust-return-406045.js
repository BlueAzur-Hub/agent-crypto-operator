/* Agent-Crypto 40.6.45 — AETHER TRUST RETURN STABILITY
   Direct Administration authentication returns to the operator's prior viewport.
   Explicit Atlas/Local-AI authentication keeps its existing pending-target navigation. */
(() => {
  "use strict";
  let pendingAdminEntry = null;

  document.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target.closest("#btnAdminAccountToggle") : null;
    if (!target || event.isTrusted !== true) return;
    pendingAdminEntry = { x: window.scrollX, y: window.scrollY, hash: location.hash };
  }, true);

  const bind = () => {
    const dialog = document.getElementById("atlasAccessDialog");
    const button = document.getElementById("btnAdminAccountToggle");
    if (!dialog || dialog.dataset.aetherTrustReturn406045 === "1") return;
    dialog.dataset.aetherTrustReturn406045 = "1";
    dialog.addEventListener("close", () => {
      const point = pendingAdminEntry;
      pendingAdminEntry = null;
      if (!point) return; // Trust opened from Atlas/another explicit target: preserve canonical navigation.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (location.hash === "#local-ai-hub" && point.hash !== "#local-ai-hub") {
          history.replaceState(history.state, "", `${location.pathname}${location.search}${point.hash || ""}`);
        }
        window.scrollTo({ left: point.x, top: point.y, behavior: "auto" });
        try { button?.focus({ preventScroll: true }); } catch (_) {}
      }));
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once:true }); else bind();

  globalThis.ErithAetherTrustReturn406045 = Object.freeze({
    build:"40.6.45", direct_admin_viewport_preserved:true, explicit_atlas_pending_target_preserved:true,
    timer_added:false, observer_added:false, fetch_owner_added:false, storage_owner_added:false
  });
})();
