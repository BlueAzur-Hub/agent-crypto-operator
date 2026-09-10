/* Agent-Crypto @erith.IA — 40.6.50
   Aether role visibility corrective lock.
   Responsibility: visibility only. Geometry remains owned by the canonical Administrator Window Manager.
   Contract: Aether is CLOSED on boot and after any view/role transition (Classique, Intermédiaire, Administrator).
   Opening remains explicit through the existing Aether operator controls. No timer, observer, storage or network owner. */
(() => {
  "use strict";
  const BUILD = "40.6.50";
  const WINDOW_ID = "aether-watch";
  const PANEL_ID = "atlasAetherStatusPanel4084";
  const TOGGLE_ID = "atlasAetherStatusToggle4084";

  function closeAether(reason = "role-visibility") {
    const panel = document.getElementById(PANEL_ID);
    const toggle = document.getElementById(TOGGLE_ID);
    if (panel) panel.dataset.aetherOperatorOpen406046 = "0";
    if (toggle) toggle.setAttribute("aria-expanded", "false");

    const manager = globalThis.ErithAdministratorWindows;
    if (manager?.getWindow?.(WINDOW_ID)) {
      // Window Manager keeps geometry/persistence; operator intent owns visibility.
      if (panel) panel.hidden = false;
      manager.hide(WINDOW_ID, true);
    } else if (panel) {
      panel.hidden = true;
    }

    document.documentElement.dataset.aetherRoleVisibility406050 = reason;
    return true;
  }

  const closeAfterOwner = reason => queueMicrotask(() => closeAether(reason));

  // Covers the case where js/app.js already completed synchronously before this script executes.
  closeAether("script-load");

  // Canonical Window Manager ready: close after its own initialization transaction.
  window.addEventListener("erith:administrator-mirror-ready", () => closeAfterOwner("window-manager-ready"), { once: true });

  // Every real view/role transition starts with Aether closed. This is especially important
  // for view=intermediate (operator), whose neutralized window presentation must not POP Aether.
  window.addEventListener("atlas:v2mode", () => closeAfterOwner("role-transition"), { passive: true });

  // BFCache restore must not resurrect a previously visible Aether window.
  window.addEventListener("pageshow", event => {
    if (event.persisted) closeAfterOwner("bfcache-restore");
  }, { passive: true });

  globalThis.ErithAetherRoleVisibility406050 = Object.freeze({
    build: BUILD,
    window_id: WINDOW_ID,
    boot_closed: true,
    intermediate_boot_closed: true,
    role_transition_closed: true,
    explicit_operator_open_preserved: true,
    geometry_owner: "ErithAdministratorWindows",
    new_timer: false,
    new_observer: false,
    new_storage_owner: false,
    new_network_owner: false,
    close: closeAether
  });
})();
