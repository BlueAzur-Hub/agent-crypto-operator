/* Agent-Crypto @erith.IA — Build 40.6.77
   AETHER WATCH V2 — PRE-REVEAL POSITION LOCK

   Responsibility:
   - warm/validate the already approved V2 backplate;
   - migrate only the historical <=40.6.75 auto-centered floating position;
   - after migration, leave x/y/size/drag/resize/persistence entirely to the
     canonical Administrator Window Manager.

   No CSS geometry owner, no resize reframe, no pageshow reframe, no timer,
   no MutationObserver, no storage write owner, no network owner, no Market Core edit. */
(() => {
  "use strict";

  const BUILD = "40.6.77";
  const WINDOW_ID = "aether-watch";
  const TOGGLE_ID = "atlasAetherStatusToggle";
  const BACKPLATE = "./assets/aether/aether-observatory-master-v2.png";
  const ROOT_ATTR = "data-aether-backplate-v2";
  const MARGIN = 12;
  const CENTER_EPSILON = 14;
  const root = document.documentElement;
  let migrationResolved = false;

  function viewport() {
    return {
      width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    };
  }

  function warmBackplate() {
    root.setAttribute(ROOT_ATTR, "loading");
    const image = new Image();
    image.decoding = "async";
    const src = new URL(BACKPLATE, document.baseURI).href;
    const ready = () => {
      root.setAttribute(ROOT_ATTR, "ready");
      root.dataset.aetherNativePosition = "visual-ready";
    };
    const fallback = () => {
      root.setAttribute(ROOT_ATTR, "fallback-40.6.73");
      root.dataset.aetherNativePosition = "visual-fallback";
    };
    image.addEventListener("load", () => {
      const decoded = typeof image.decode === "function" ? image.decode() : Promise.resolve();
      Promise.resolve(decoded).then(ready).catch(fallback);
    }, { once: true });
    image.addEventListener("error", fallback, { once: true });
    image.src = src;
    return { image, src };
  }

  function managerState() {
    const manager = globalThis.ErithAdministratorWindows;
    const win = manager?.getWindow?.(WINDOW_ID) || null;
    const snapshot = manager?.snapshot?.() || null;
    const saved = snapshot?.windows?.[WINDOW_ID] || null;
    return { manager, win, snapshot, saved };
  }

  function geometryOf(win, saved) {
    const raw = saved?.geometry || win?.geometry || null;
    if (!raw) return null;
    const geometry = {
      x: Number(raw.x), y: Number(raw.y), width: Number(raw.width), height: Number(raw.height)
    };
    return Object.values(geometry).every(Number.isFinite) ? geometry : null;
  }

  function looksLegacyAutoCentered(geometry) {
    if (!geometry) return false;
    const { width: vw } = viewport();
    const centeredX = Math.max(MARGIN, Math.round((vw - geometry.width) / 2));
    return geometry.x > MARGIN + CENTER_EPSILON
      && Math.abs(geometry.x - centeredX) <= CENTER_EPSILON;
  }

  function migrateLegacyCenter(reason = "post-open") {
    if (migrationResolved) return false;
    const { manager, win, snapshot, saved } = managerState();
    if (!manager || !win || !snapshot) return false;
    if (win.minimized || win.maximized || saved?.minimized === true || saved?.maximized === true) return false;
    if (saved?.floating !== true && win?.floating !== true) return false;

    const geometry = geometryOf(win, saved);
    if (!geometry) return false;
    if (!looksLegacyAutoCentered(geometry)) {
      migrationResolved = true;
      root.dataset.aetherPreRevealPosition = "operator-position-preserved";
      return false;
    }

    const hidden = win.hidden === true || saved?.hidden === true;

    manager.applySnapshot({
      schema: snapshot.schema || "erith.admin.workspace.window-state.v1",
      windows: {
        [WINDOW_ID]: {
          floating: true,
          minimized: false,
          hidden,
          maximized: false,
          geometry: {
            x: MARGIN,
            y: geometry.y,
            width: geometry.width,
            height: geometry.height
          }
        }
      }
    }, { persist: true, captureResult: false });

    migrationResolved = true;
    root.dataset.aetherPreRevealPosition = `legacy-center-migrated:${reason}:${hidden ? "hidden" : "visible"}`;
    return true;
  }

  function captureAetherOpen(event) {
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest(`#${TOGGLE_ID}`)) return;
    migrateLegacyCenter("operator-pre-open");
  }

  const warm = warmBackplate();
  migrateLegacyCenter("frame-load");
  window.addEventListener("erith:administrator-mirror-ready", () => migrateLegacyCenter("window-manager-ready"), { once: true });
  document.addEventListener("click", captureAetherOpen, true);

  const api = Object.freeze({
    build: BUILD,
    window_id: WINDOW_ID,
    mode: "pre-reveal-position-lock",
    geometry_owner: "ErithAdministratorWindows",
    visual_owner: "aether-v2-406075.css",
    first_open_owner: "js/app.js preferredFloatGeometry",
    hidden_migration_supported: true,
    legacy_center_migration_only: true,
    operator_position_preserved: true,
    resize_reframe: false,
    pageshow_reframe: false,
    explicit_maximize_preserved: true,
    recurring_timer: false,
    observer: false,
    storage_write_owner: false,
    network_owner: false,
    market_core_changed: false,
    operator_runtime_changed: false,
    backplate: warm.src,
    migrate: migrateLegacyCenter,
    status: () => {
      const { win, saved } = managerState();
      return Object.freeze({
        build: BUILD,
        state: root.dataset.aetherPreRevealPosition || "idle",
        floating: win?.floating === true,
        hidden: win?.hidden === true,
        maximized: win?.maximized === true,
        geometry: geometryOf(win, saved)
      });
    }
  });

  globalThis.ErithAetherFrame406077 = api;
  globalThis.ErithAetherFrame406076 = api;
  globalThis.ErithAetherFrame406074 = api;
})();
