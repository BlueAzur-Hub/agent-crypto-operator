/* Agent-Crypto @erith.IA — 40.6.50 + Build 40.6.77 canonical Aether integration
   Aether role visibility corrective lock.
   Responsibility: visibility only. Geometry remains owned by the canonical Administrator Window Manager.
   Contract: Aether is CLOSED on boot and after any view/role transition (Classique, Intermédiaire, Administrator).
   Opening remains explicit through the existing Aether operator controls. No timer, observer, storage or network owner. */
(() => {
  "use strict";
  const BUILD = "40.6.50";
  const WINDOW_ID = "aether-watch";
  const PANEL_ID = "atlasAetherStatusPanel";
  const TOGGLE_ID = "atlasAetherStatusToggle";

  function closeAether(reason = "role-visibility") {
    const panel = document.getElementById(PANEL_ID);
    const toggle = document.getElementById(TOGGLE_ID);
    if (panel) panel.dataset.aetherOperatorOpen = "0";
    if (toggle) toggle.setAttribute("aria-expanded", "false");

    const manager = globalThis.ErithAdministratorWindows;
    if (manager?.getWindow?.(WINDOW_ID)) {
      if (panel) panel.hidden = false;
      manager.hide(WINDOW_ID, true);
    } else if (panel) {
      panel.hidden = true;
    }

    document.documentElement.dataset.aetherRoleVisibility = reason;
    return true;
  }

  const closeAfterOwner = reason => queueMicrotask(() => closeAether(reason));

  closeAether("script-load");
  window.addEventListener("erith:administrator-mirror-ready", () => closeAfterOwner("window-manager-ready"), { once: true });
  window.addEventListener("atlas:v2mode", () => closeAfterOwner("role-transition"), { passive: true });
  window.addEventListener("pageshow", event => {
    if (event.persisted) closeAfterOwner("bfcache-restore");
  }, { passive: true });

  globalThis.ErithAetherRoleVisibility = Object.freeze({
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

/* 40.6.73 R4 — ACTIVE MARKET FICHE ABOVE AETHER LOCK */
(() => {
  "use strict";
  const BUILD = "40.6.73 R4";
  const STYLE_ID = "atlasMarketFicheAboveAether406073R4";
  const ACTIVE_FICHE_SELECTOR = ".atlas-help-layer[data-market-help-coin-id]:not([hidden])";

  function install() {
    if (document.getElementById(STYLE_ID)) return true;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `${ACTIVE_FICHE_SELECTOR}{z-index:2147483647!important;}`;
    document.head.appendChild(style);
    document.documentElement.dataset.marketFicheAboveAether406073R4 = "1";
    return true;
  }

  install();

  globalThis.ErithMarketFicheAboveAether406073R4 = Object.freeze({
    build: BUILD,
    selector: ACTIVE_FICHE_SELECTOR,
    z_index: 2147483647,
    scope: "active floating crypto fiche only",
    aether_geometry_changed: false,
    aether_visibility_changed: false,
    window_manager_changed: false,
    market_core_changed: false,
    new_timer: false,
    new_observer: false,
    new_storage_owner: false,
    new_network_owner: false,
    install
  });
})();

/* 40.6.545 — NATIVE MARKET FICHE OWNERSHIP RESTORE
   Restoration means: do not add a second owner around the canonical
   Flottante / Latérale implementation. The native app.js 28.3.46-28.3.48
   contract and the 40.1.2 CSS restoration own the behavior.
   The later 40.6.73 R5 / 40.6.543 R6 body-tail portal is retired. */
globalThis.ErithMarketFicheForeground406073R5 = Object.freeze({
  build: "40.6.545",
  retired: true,
  strategy: "native-app-js-only",
  native_owner: "app.js",
  native_mode_key: "agent_crypto_erith_ia_market_card_mode_v1",
  floating_mode: true,
  lateral_mode: true,
  body_tail_portal: false,
  extra_document_event_listeners: false,
  market_core_changed: false
});

/* ==========================================================================
   BUILD 40.6.83 — AETHER V2 CANONICAL INTEGRATION
   Historical Aether component build only.
   IMPORTANT: this component no longer owns or mutates Administrator Version Truth.
   ========================================================================== */
(() => {
  "use strict";
  const BUILD = "40.6.83";
  const REVISION = "V18";
  const RELEASE = "AETHER V2 · FINAL PREBOOT + ACCEPTANCE LOCK";
  const STYLE_ID = "aetherV2Canonical";
  const SCRIPT_ID = "aetherV2RuntimeCanonical";
  const STYLE_HREF = "./aether-v2.css?v=administrator-build-40.6.83";
  const SCRIPT_SRC = "./js/aether-v2.js?v=administrator-build-40.6.83";
  const RETIRED_LINK_IDS = Object.freeze([
    "aetherReadability","aetherV2Stabilization406074C21","aetherV2Refinement406074C3",
    "aetherV2Refinement406074C31","aetherV2Reframe406074C4","aetherV2Reframe406074C5",
    "aetherV2406075Canonical"
  ]);
  const RETIRED_SCRIPT_IDS = Object.freeze([
    "aetherFrame406076Canonical","aetherFrame406077Canonical","aetherFrame406078Canonical",
    "aetherV2Operator406079Canonical","aetherV2Operator406080Canonical"
  ]);

  function publishVersionTruth() {
    /* RETIRED GLOBAL WRITE OWNER.
       Version Truth belongs to ErithBuildAuthority / ErithVersionTruth.
       Kept as a compatibility method because older callers may reference it. */
    return true;
  }
  function retireLegacyAssets() {
    for(const id of RETIRED_LINK_IDS) if(id!==STYLE_ID) document.getElementById(id)?.remove();
    for(const id of RETIRED_SCRIPT_IDS) if(id!==SCRIPT_ID) document.getElementById(id)?.remove();
  }
  function ensureStyle() {
    retireLegacyAssets();
    let link=document.getElementById(STYLE_ID);
    if(!link){ link=document.createElement("link"); link.id=STYLE_ID; link.rel="stylesheet"; document.head.appendChild(link); }
    link.href=STYLE_HREF; link.dataset.aetherCanonicalBuild=BUILD; return link;
  }
  function ensureRuntime() {
    if(globalThis.ErithAetherV2Canonical?.build===BUILD) return true;
    let script=document.getElementById(SCRIPT_ID);
    if(!script){ script=document.createElement("script"); script.id=SCRIPT_ID; script.src=SCRIPT_SRC; script.defer=true; script.dataset.aetherCanonicalBuild=BUILD; document.head.appendChild(script); }
    return true;
  }
  ensureStyle(); ensureRuntime();
  globalThis.ErithAetherCanonical=Object.freeze({
    build:BUILD,revision:REVISION,release:RELEASE,style_href:STYLE_HREF,script_src:SCRIPT_SRC,
    one_visual_owner:true,one_runtime_owner:true,recurring_timer:false,observer:false,network_owner:false,
    market_core_changed:false,operator_runtime_changed:false,global_version_truth_owner:false,publishVersionTruth
  });
})();
