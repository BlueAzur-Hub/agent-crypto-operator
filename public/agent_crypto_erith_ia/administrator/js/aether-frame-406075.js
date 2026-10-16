/* Agent-Crypto @erith.IA — Build 40.6.75
   AETHER WATCH V2 — CANONICAL FRAME OWNER / FIRST-PAINT STABILIZATION

   Presentation-only bridge between the existing Administrator Window Manager
   and the 1672×941 V2 Aether backplate.

   Contract:
   - Window Manager remains the only geometry/storage owner;
   - stale Aether floating geometry is normalized even while the window is hidden;
   - explicit Aether intent is preframed before the canonical click can reveal it;
   - the frame uses the largest complete 16:9 rectangle left of Lecture Technique;
   - explicit maximize/minimize states are never cancelled;
   - no recurring timer, MutationObserver, fetch, WebSocket, market or trading owner.
*/
(() => {
  "use strict";

  const BUILD = "40.6.75";
  const WINDOW_ID = "aether-watch";
  const PANEL_ID = "atlasAetherStatusPanel";
  const TOGGLE_ID = "atlasAetherStatusToggle";
  const DETAIL_ID = "detailPanel";
  const BACKPLATE = "./assets/aether/aether-observatory-master-v2.png";
  const ROOT_ATTR = "data-aether-backplate-v2";
  const MARGIN = 12;
  const MIN_WIDTH = 720;
  const MAX_FLOAT_WIDTH = 1450;
  const RATIO = 16 / 9;
  const EPSILON = 6;
  const root = document.documentElement;
  let resizeFrame = 0;

  function viewport() {
    return {
      width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    };
  }

  function visibleRect(node) {
    if (!(node instanceof HTMLElement)) return null;
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    if (node.hidden || style.display === "none" || style.visibility === "hidden") return null;
    if (rect.width <= 1 || rect.height <= 1) return null;
    return rect;
  }

  function workspaceRightBoundary(vw) {
    const detail = visibleRect(document.getElementById(DETAIL_ID));
    if (detail && detail.left > Math.max(MIN_WIDTH + MARGIN * 2, vw * 0.55)) {
      return Math.max(MIN_WIDTH + MARGIN * 2, detail.left - 8);
    }
    return vw - MARGIN;
  }

  function fit16x9(maxWidth, maxHeight) {
    let width = Math.min(maxWidth, maxHeight * RATIO);
    let height = width / RATIO;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * RATIO;
    }
    return { width, height };
  }

  function targetFloatingGeometry() {
    const { width: vw, height: vh } = viewport();
    const rightBoundary = workspaceRightBoundary(vw);
    const railReserved = rightBoundary < vw - MARGIN - 4;
    const availableWidth = Math.max(MIN_WIDTH, rightBoundary - MARGIN);
    const maxWidth = Math.max(MIN_WIDTH, Math.min(MAX_FLOAT_WIDTH, availableWidth));
    const maxHeight = Math.max(405, vh - MARGIN * 2);
    const fitted = fit16x9(maxWidth, maxHeight);
    const width = Math.round(Math.max(MIN_WIDTH, Math.min(maxWidth, fitted.width)));
    const height = Math.round(width / RATIO);
    return Object.freeze({
      x: Math.round(railReserved ? MARGIN : Math.max(MARGIN, (vw - width) / 2)),
      y: Math.round(Math.max(MARGIN, vh - height - MARGIN)),
      width,
      height,
      rightBoundary: Math.round(rightBoundary),
      railReserved
    });
  }

  function geometryDiffers(current, target) {
    if (!current) return true;
    return Math.abs(Number(current.x) - target.x) > EPSILON
      || Math.abs(Number(current.y) - target.y) > EPSILON
      || Math.abs(Number(current.width) - target.width) > EPSILON
      || Math.abs(Number(current.height) - target.height) > EPSILON;
  }

  function managerState() {
    const manager = globalThis.ErithAdministratorWindows;
    const win = manager?.getWindow?.(WINDOW_ID);
    const snapshot = manager?.snapshot?.();
    const saved = snapshot?.windows?.[WINDOW_ID] || null;
    return { manager, win, snapshot, saved };
  }

  function normalizeFloatingGeometry({ force = false, persist = true } = {}) {
    const { manager, win, snapshot, saved } = managerState();
    if (!manager || !win || !snapshot) return false;
    if (saved?.maximized === true || saved?.minimized === true || win.maximized === true || win.minimized === true) return false;

    const target = targetFloatingGeometry();
    const currentGeometry = saved?.geometry || null;
    const floating = saved?.floating === true || win.floating === true;
    if (!force && floating && !geometryDiffers(currentGeometry, target)) return false;

    manager.applySnapshot({
      schema: snapshot.schema || "erith.admin.workspace.window-state.v1",
      selectedId: snapshot.selectedId,
      activeWindowId: snapshot.activeWindowId,
      zOrder: Array.isArray(snapshot.zOrder) ? snapshot.zOrder : undefined,
      windows: {
        [WINDOW_ID]: {
          floating: true,
          minimized: false,
          maximized: false,
          hidden: saved?.hidden === true || win.hidden === true,
          geometry: {
            x: target.x,
            y: target.y,
            width: target.width,
            height: target.height
          }
        }
      }
    }, { persist, captureResult: false });

    root.dataset.aetherFrame = `${target.width}x${target.height}@${target.x},${target.y}`;
    root.dataset.aetherFrameMode = target.railReserved ? "left-of-detail" : "centered";
    return true;
  }

  function preframeCanonicalOpen(reason = "intent") {
    const { win } = managerState();
    if (!win || win.minimized || win.maximized) return false;
    const changed = normalizeFloatingGeometry({ force: false, persist: true });
    root.dataset.aetherFirstPaint406074R1 = changed ? `${reason}-normalized` : `${reason}-ready`;
    return true;
  }

  function warmBackplate() {
    const src = new URL(BACKPLATE, document.baseURI).href;
    const image = new Image();
    const ready = () => {
      root.setAttribute(ROOT_ATTR, "ready");
      root.dataset.aetherReadability = "canonical-ready";
      return true;
    };
    const fallback = () => {
      root.setAttribute(ROOT_ATTR, "fallback-40.6.73");
      root.dataset.aetherReadability = "canonical-fallback";
      return false;
    };
    image.decoding = "async";
    image.addEventListener("load", ready, { once: true });
    image.addEventListener("error", fallback, { once: true });
    image.src = src;
    if (image.complete && image.naturalWidth > 0) ready();
    return { image, src };
  }

  function captureAetherIntent(event) {
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest(`#${TOGGLE_ID}`)) return;

    // Capture phase runs before the canonical click handler can reveal Aether.
    // Apply the target while the Window Manager still owns a hidden window so
    // Firefox never paints the historical small centered rectangle first.
    preframeCanonicalOpen(event.type === "pointerdown" ? "pointerdown" : "click-capture");

    // The canonical handler may touch the window state later in the same event.
    // A microtask executes before the browser paints, so this is a no-flash
    // safety reassertion rather than the old two-requestAnimationFrame recadre.
    if (event.type === "click") {
      queueMicrotask(() => preframeCanonicalOpen("post-click-microtask"));
    }
  }

  function scheduleResize() {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      const { win } = managerState();
      if (!win || win.hidden || win.minimized || win.maximized) return;
      normalizeFloatingGeometry({ force: false, persist: false });
    });
  }

  const warm = warmBackplate();
  document.addEventListener("pointerdown", captureAetherIntent, { capture: true, passive: true });
  document.addEventListener("click", captureAetherIntent, true);
  window.addEventListener("resize", scheduleResize, { passive: true });
  window.addEventListener("pageshow", () => requestAnimationFrame(() => normalizeFloatingGeometry({ force: false, persist: true })), { passive: true });
  window.addEventListener("erith:administrator-mirror-ready", () => queueMicrotask(() => normalizeFloatingGeometry({ force: false, persist: true })), { once: true });

  // First synchronous attempt: when the dynamically loaded bridge arrives after
  // the Window Manager, the hidden geometry is corrected immediately, not one
  // animation frame later. The mirror-ready hook above remains the safe fallback.
  normalizeFloatingGeometry({ force: false, persist: true });

  globalThis.ErithAetherFrame406074 = Object.freeze({
    build: BUILD,
    window_id: WINDOW_ID,
    ratio: RATIO,
    max_float_width: MAX_FLOAT_WIDTH,
    hidden_geometry_migration: true,
    prepaint_intent_frame: true,
    post_click_microtask_reassert: true,
    explicit_maximize_preserved: true,
    recurring_timer: false,
    observer: false,
    network_owner: false,
    market_core_changed: false,
    operator_runtime_changed: false,
    backplate: warm.src,
    target: targetFloatingGeometry,
    normalize: normalizeFloatingGeometry,
    preframe: preframeCanonicalOpen,
    status: () => {
      const { win, snapshot, saved } = managerState();
      return Object.freeze({
        target: targetFloatingGeometry(),
        floating: saved?.floating ?? win?.floating ?? null,
        hidden: saved?.hidden ?? win?.hidden ?? null,
        maximized: saved?.maximized ?? win?.maximized ?? null,
        geometry: saved?.geometry || null,
        first_paint: root.dataset.aetherFirstPaint406074R1 || "idle",
        dataset: root.dataset.aetherFrame || "idle"
      });
    }
  });
})();
