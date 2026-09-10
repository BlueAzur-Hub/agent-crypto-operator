(() => {
  "use strict";

  /* ============================================================
     39.9.0R2 — ADMINISTRATOR MEMORY LAYOUT FINAL REPAIR

     PURPOSE
     - Preserve the compact Administrator home: no extra identity line.
     - Keep the original Decision Memory panel in its canonical grid area.
     - Move Dual Memory 39.5 and Retrospective 39.6 into one dedicated
       auxiliary host so no two .decision-memory-v2 roots can occupy the
       same direct-child grid area.

     CONTRACT
     - DOM placement only.
     - NO market or analytical logic change.
     - NO memory write or repair.
     - NO fetch, timer or WebSocket.
     - NO Atlas / NØX / Aerith / Bridge / Ollama start.
     ============================================================ */

  const BUILD = "39.9.0R2";
  const HOST_ID = "decisionAuxMemoryPanels3990R2";
  const byId = id => document.getElementById(id);

  function ensureHost(board) {
    if (!board) return null;
    let host = byId(HOST_ID);
    if (!host) {
      host = document.createElement("div");
      host.id = HOST_ID;
      host.dataset.layoutRepair = BUILD;
      host.dataset.layoutRole = "decision-aux-memory-host";
      host.setAttribute("aria-label", "Dual Memory et validation rétrospective isolées");
      // Inline layout only: no stylesheet file is changed or shipped.
      host.style.display = "grid";
      host.style.gridTemplateColumns = "minmax(0, 1fr)";
      host.style.gap = "14px";
      host.style.marginTop = "14px";
      host.style.minWidth = "0";
      host.style.width = "100%";
      host.style.gridColumn = "1 / -1";
      host.style.alignSelf = "stretch";
      board.appendChild(host);
    }
    return host;
  }

  function repair() {
    byId("administratorMirrorIdentity")?.remove();

    const board = byId("decision-board");
    const primary = byId("decisionMemoryV2");
    const dual = byId("decisionDualMemory395");
    const retro = byId("decisionRetrospective3960");
    const host = ensureHost(board);
    let movedDual = false;
    let movedRetro = false;

    // Canonical Decision Memory stays a direct child of #decision-board.
    // Only auxiliary readers are nested into HOST_ID, which prevents the
    // legacy direct-child selector from assigning all three to one grid area.
    if (host && dual && dual.parentElement !== host) {
      host.appendChild(dual);
      movedDual = true;
    }
    if (host && retro && retro.parentElement !== host) {
      host.appendChild(retro);
      movedRetro = true;
    }

    if (primary) {
      primary.dataset.layoutRepair = BUILD;
      primary.dataset.layoutRole = "decision-primary-memory";
    }
    if (dual) {
      dual.dataset.layoutRepair = BUILD;
      dual.dataset.layoutRole = "dual-memory-isolated";
      dual.classList.add("atlas-dual-memory-isolated");
    }
    if (retro) {
      retro.dataset.layoutRepair = BUILD;
      retro.dataset.layoutRole = "retrospective-isolated";
      retro.classList.add("atlas-retrospective-isolated");
    }

    document.documentElement.dataset.compactHomeLock = BUILD;
    document.documentElement.dataset.decisionMemoryLayoutLock = BUILD;

    const directMemoryRoots = board
      ? [...board.children].filter(node => node.classList?.contains("decision-memory-v2"))
      : [];

    return Object.freeze({
      build: BUILD,
      home_compact: !byId("administratorMirrorIdentity"),
      board_present: !!board,
      host_present: !!host,
      primary_present: !!primary,
      dual_present: !!dual,
      retrospective_present: !!retro,
      primary_direct_child: !!(board && primary && primary.parentElement === board),
      dual_isolated: !!(host && dual && dual.parentElement === host),
      retrospective_isolated: !!(host && retro && retro.parentElement === host),
      direct_memory_root_count: directMemoryRoots.length,
      direct_memory_root_ids: directMemoryRoots.map(node => node.id || "sans-id"),
      moved_dual: movedDual,
      moved_retrospective: movedRetro
    });
  }

  const contract = Object.freeze({
    build: BUILD,
    role: "Administrator compact-home + final Decision/Dual/Retrospective DOM isolation repair",
    feature_delta: false,
    visual_scope_only: true,
    writes_memory: false,
    repairs_memory: false,
    starts_atlas: false,
    starts_nox: false,
    starts_aerith: false,
    starts_bridge: false,
    starts_ollama: false,
    new_fetch: false,
    new_timer: false,
    new_websocket: false,
    images_shipped: 0,
    css_file_modified: false
  });

  const api = Object.freeze({ repair, contract });
  globalThis.__AGENT_CRYPTO_LAYOUT_REPAIR_3990R2__ = contract;
  globalThis.atlasAdministratorLayoutRepair3990R2 = api;

  try { repair(); } catch (_) {}
  queueMicrotask(() => { try { repair(); } catch (_) {} });
  window.addEventListener("load", () => { try { repair(); } catch (_) {} }, { once: true });
})();

/* ==========================================================================
   40.4.156R1 — ORACLE DIRECT-FLOAT BODY PORTAL REPAIR
   ========================================================================== */
(() => {
  "use strict";

  /*
     PURPOSE
     - Keep the Oracle V1 floating graph in viewport coordinates.
     - Remove the first-drag cursor/window offset caused by a nested fixed
       containing/stacking context.
     - Let the existing Window Manager z-index become global so Oracle stays
       above sibling floating windows while it is moved/focused.

     CONTRACT
     - Oracle presentation/DOM placement only.
     - Existing Window Manager remains the drag, resize, persistence and z-order owner.
     - NO Oracle math, canvas, market data, Atlas pipeline or fetch change.
     - NO timer and no broad document observer.
  */

  const BUILD = "40.4.156R1";
  const ORACLE_ID = "atlasOracleV0";
  const FLOAT_CLASS = "admin-native-direct-floating";
  let homeMarker = null;
  let classObserver = null;

  function fixedPx(value) {
    const number = Number(value);
    return `${Number.isFinite(number) ? Math.round(number * 100) / 100 : 0}px`;
  }

  function rememberHome(node) {
    if (!(node instanceof HTMLElement) || node.parentNode === document.body) return false;
    if (homeMarker?.parentNode) return true;
    homeMarker = document.createComment("atlas-oracle-v1-home-40.4.156R1");
    node.parentNode?.insertBefore(homeMarker, node);
    return !!homeMarker.parentNode;
  }

  function portalFloatingOracle(node) {
    if (!(node instanceof HTMLElement) || !node.classList.contains(FLOAT_CLASS)) return false;
    if (node.parentNode === document.body) {
      node.dataset.oracleDirectBodyPortal = BUILD;
      return true;
    }

    const rect = node.getBoundingClientRect();
    if (!rememberHome(node)) return false;

    // Preserve the exact visual rectangle while changing containing block.
    // Once the node is a direct body child, the Window Manager's fixed
    // left/top coordinates and z-index are in the same viewport/global layer.
    document.body.appendChild(node);
    node.style.setProperty("position", "fixed", "important");
    node.style.setProperty("left", fixedPx(rect.left), "important");
    node.style.setProperty("top", fixedPx(rect.top), "important");
    node.style.setProperty("right", "auto", "important");
    node.style.setProperty("bottom", "auto", "important");
    node.style.setProperty("width", fixedPx(rect.width), "important");
    node.style.setProperty("height", fixedPx(rect.height), "important");
    node.style.setProperty("transform", "none", "important");
    node.dataset.oracleDirectBodyPortal = BUILD;
    document.documentElement.dataset.oracleDirectBodyPortal404156R1 = "active";
    return true;
  }

  function restoreDockedOracle(node) {
    if (!(node instanceof HTMLElement) || node.classList.contains(FLOAT_CLASS)) return false;
    if (!(homeMarker?.parentNode)) return false;

    const parent = homeMarker.parentNode;
    parent.insertBefore(node, homeMarker);
    homeMarker.remove();
    homeMarker = null;
    delete node.dataset.oracleDirectBodyPortal;
    document.documentElement.dataset.oracleDirectBodyPortal404156R1 = "docked";
    return true;
  }

  function reconcile(node = document.getElementById(ORACLE_ID)) {
    if (!(node instanceof HTMLElement)) return false;
    if (node.classList.contains(FLOAT_CLASS)) return portalFloatingOracle(node);
    return restoreDockedOracle(node);
  }

  function install() {
    const node = document.getElementById(ORACLE_ID);
    if (!(node instanceof HTMLElement)) return false;

    reconcile(node);
    if (!classObserver && typeof MutationObserver === "function") {
      classObserver = new MutationObserver(() => { try { reconcile(node); } catch (_) {} });
      classObserver.observe(node, { attributes: true, attributeFilter: ["class"] });
    }

    globalThis.ErithOracleDirectFloatRepair404156R1 = Object.freeze({
      build: BUILD,
      oracle_id: ORACLE_ID,
      body_portal_only_while_floating: true,
      window_manager_remains_drag_owner: true,
      window_manager_remains_z_owner: true,
      observer_scope: "oracle-class-only",
      repair: () => reconcile(node),
      status: () => Object.freeze({
        floating: node.classList.contains(FLOAT_CLASS),
        body_child: node.parentNode === document.body,
        marker_present: !!homeMarker?.parentNode
      })
    });
    return true;
  }

  try { install(); } catch (_) {}
  queueMicrotask(() => { try { install(); } catch (_) {} });
  window.addEventListener("load", () => { try { install(); } catch (_) {} }, { once: true });
})();

/* ==========================================================================
   40.4.158 — GRAPH DIRECT-FLOAT BODY PORTAL REPAIR
   ========================================================================== */
(() => {
  "use strict";

  /*
     PURPOSE
     - Keep Graphique + Lecture technique in viewport/global stacking coordinates.
     - Prevent Administrator sections (Analyse & décision / multi-horizon / Market)
       from crossing above the graph while the graph is moved.
     - Mirror the proven 40.4.156R1 Oracle body-portal strategy without changing
       the existing Window Manager drag, resize, persistence or z-order owner.

     CONTRACT
     - #analyste presentation/DOM placement only.
     - Body portal only while .admin-native-direct-floating is active.
     - Existing Window Manager remains drag, resize, persistence and z-order owner.
     - NO chart engine, Oracle, Market Core, Atlas, News, Simulation or fetch change.
     - One attribute-only observer scoped to #analyste class changes; no document observer.
  */

  const BUILD = "40.4.158";
  const GRAPH_ID = "analyste";
  const FLOAT_CLASS = "admin-native-direct-floating";
  let homeMarker = null;
  let classObserver = null;

  function fixedPx(value) {
    const number = Number(value);
    return `${Number.isFinite(number) ? Math.round(number * 100) / 100 : 0}px`;
  }

  function rememberHome(node) {
    if (!(node instanceof HTMLElement) || node.parentNode === document.body) return false;
    if (homeMarker?.parentNode) return true;
    homeMarker = document.createComment("agent-crypto-graph-home-40.4.158");
    node.parentNode?.insertBefore(homeMarker, node);
    return !!homeMarker.parentNode;
  }

  function portalFloatingGraph(node) {
    if (!(node instanceof HTMLElement) || !node.classList.contains(FLOAT_CLASS)) return false;
    if (node.parentNode === document.body) {
      node.dataset.graphDirectBodyPortal = BUILD;
      return true;
    }

    const rect = node.getBoundingClientRect();
    if (!rememberHome(node)) return false;

    // Preserve the exact visual rectangle while changing containing/stacking block.
    // Window Manager already assigned the floating z-index; as a direct body child
    // that z-index finally competes in the global workspace rather than a nested one.
    document.body.appendChild(node);
    node.style.setProperty("position", "fixed", "important");
    node.style.setProperty("left", fixedPx(rect.left), "important");
    node.style.setProperty("top", fixedPx(rect.top), "important");
    node.style.setProperty("right", "auto", "important");
    node.style.setProperty("bottom", "auto", "important");
    node.style.setProperty("width", fixedPx(rect.width), "important");
    node.style.setProperty("height", fixedPx(rect.height), "important");
    node.style.setProperty("transform", "none", "important");
    node.style.setProperty("isolation", "isolate", "important");
    node.dataset.graphDirectBodyPortal = BUILD;
    document.documentElement.dataset.graphDirectBodyPortal404158 = "active";
    return true;
  }

  function restoreDockedGraph(node) {
    if (!(node instanceof HTMLElement) || node.classList.contains(FLOAT_CLASS)) return false;
    if (!(homeMarker?.parentNode)) return false;

    const parent = homeMarker.parentNode;
    parent.insertBefore(node, homeMarker);
    homeMarker.remove();
    homeMarker = null;
    node.style.removeProperty("isolation");
    delete node.dataset.graphDirectBodyPortal;
    document.documentElement.dataset.graphDirectBodyPortal404158 = "docked";
    return true;
  }

  function reconcile(node = document.getElementById(GRAPH_ID)) {
    if (!(node instanceof HTMLElement)) return false;
    if (node.classList.contains(FLOAT_CLASS)) return portalFloatingGraph(node);
    return restoreDockedGraph(node);
  }

  function install() {
    const node = document.getElementById(GRAPH_ID);
    if (!(node instanceof HTMLElement)) return false;

    reconcile(node);
    if (!classObserver && typeof MutationObserver === "function") {
      classObserver = new MutationObserver(() => { try { reconcile(node); } catch (_) {} });
      classObserver.observe(node, { attributes: true, attributeFilter: ["class"] });
    }

    globalThis.ErithGraphDirectFloatRepair404158 = Object.freeze({
      build: BUILD,
      graph_id: GRAPH_ID,
      body_portal_only_while_floating: true,
      window_manager_remains_drag_owner: true,
      window_manager_remains_resize_owner: true,
      window_manager_remains_z_owner: true,
      observer_scope: "analyste-class-only",
      chart_engine_changed: false,
      oracle_changed: false,
      market_core_changed: false,
      atlas_changed: false,
      repair: () => reconcile(node),
      status: () => Object.freeze({
        floating: node.classList.contains(FLOAT_CLASS),
        body_child: node.parentNode === document.body,
        marker_present: !!homeMarker?.parentNode
      })
    });
    return true;
  }

  try { install(); } catch (_) {}
  queueMicrotask(() => { try { install(); } catch (_) {} });
  window.addEventListener("load", () => { try { install(); } catch (_) {} }, { once: true });
})();

/* ==========================================================================
   40.4.162 — OPERATOR FLOW & FAMILY PERSISTENCE LOCK
   ========================================================================== */
(() => {
  "use strict";

  /*
     PURPOSE
     - Preserve explicit operator presentation choices for the four canonical
       Administrator families across reloads and view round-trips.
     - Keep the proven 40.3.61 compact family boot as the first-run/default state.
     - Replay only a separately captured operator snapshot after Window Manager
       has completed its canonical restore/neutralize transaction.

     WHY
     - 40.3.61 intentionally stages 01/02/03/04 as docked compact on every boot.
     - That historical safety default is still useful for first-run clarity, but
       it can overwrite a later explicit operator open/minimize/float choice.
     - The Window Manager remains the only owner of presentation mechanics.

     CONTRACT
     - Presentation state only: floating/minimized/hidden/maximized/geometry.
     - Four families only: 01 Analyse, 02 Intelligence, 03 Operations, 04 System.
     - No market domain, Graph Context V7, Oracle, selected asset or business data.
     - No timer, no network, no WebSocket, no broad MutationObserver.
     - Event-driven localStorage write only after operator interaction changes state.
     - Direct hash navigation wins: no replay while location.hash is present.
  */

  const BUILD = "40.4.162";
  const STORAGE_KEY = "erith_admin_portal_39_2_9:operator-family-persistence-404162";
  const SCHEMA = "erith.admin.operator-family-state.v1";
  const FAMILY_IDS = Object.freeze([
    "analyse-decision",
    "intelligence-memoire-creation",
    "preparation-operations",
    "experimentation-systeme"
  ]);

  let manager = null;
  let installed = false;
  let restoring = false;
  let lastSignature = "";
  let lastRole = "";

  const safeParse = (value, fallback = null) => {
    try { return JSON.parse(value); } catch (_) { return fallback; }
  };

  function role() {
    return String(document.documentElement.dataset.adminWindowPresentationRole40314 || "").trim().toLowerCase();
  }

  function normalizeGeometry(raw) {
    if (!raw || typeof raw !== "object") return null;
    const x = Number(raw.x);
    const y = Number(raw.y);
    const width = Number(raw.width);
    const height = Number(raw.height);
    if (![x, y, width, height].every(Number.isFinite)) return null;
    return { x, y, width, height };
  }

  function familySnapshot(raw) {
    const source = raw?.windows && typeof raw.windows === "object" ? raw.windows : {};
    const windows = {};
    FAMILY_IDS.forEach(id => {
      const row = source[id];
      if (!row || typeof row !== "object") return;
      windows[id] = {
        floating: row.floating === true,
        minimized: row.minimized === true,
        hidden: row.hidden === true,
        maximized: row.maximized === true,
        geometry: normalizeGeometry(row.geometry)
      };
    });
    return { schema: "erith.admin.workspace.window-state.v1", windows };
  }

  function signature(snapshot) {
    try { return JSON.stringify(snapshot?.windows || {}); } catch (_) { return ""; }
  }

  function currentFamilySnapshot() {
    if (!manager?.snapshot) return familySnapshot(null);
    try { return familySnapshot(manager.snapshot()); }
    catch (_) { return familySnapshot(null); }
  }

  function readSaved() {
    try {
      const raw = safeParse(localStorage.getItem(STORAGE_KEY) || "", null);
      if (!raw || raw.schema !== SCHEMA || !raw.snapshot) return null;
      const snapshot = familySnapshot(raw.snapshot);
      return Object.keys(snapshot.windows).length ? { ...raw, snapshot } : null;
    } catch (_) {
      return null;
    }
  }

  function writeSaved(reason = "operator") {
    if (restoring || role() !== "administrator" || !manager?.snapshot) return false;
    const snapshot = currentFamilySnapshot();
    const nextSignature = signature(snapshot);
    if (!nextSignature || nextSignature === lastSignature) return false;

    const payload = {
      schema: SCHEMA,
      build: BUILD,
      saved_at: new Date().toISOString(),
      reason: String(reason || "operator"),
      snapshot
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      lastSignature = nextSignature;
      document.documentElement.dataset.operatorFamilyPersistence404162 = "saved";
      document.documentElement.dataset.operatorFamilyPersistenceSaved404162 = payload.saved_at;
      return true;
    } catch (_) {
      document.documentElement.dataset.operatorFamilyPersistence404162 = "storage-unavailable";
      return false;
    }
  }

  function restoreSaved(reason = "boot") {
    if (role() !== "administrator" || !manager?.applySnapshot || location.hash) return false;
    const saved = readSaved();
    if (!saved) {
      lastSignature = signature(currentFamilySnapshot());
      document.documentElement.dataset.operatorFamilyPersistence404162 = "default-compact";
      return false;
    }

    restoring = true;
    try {
      manager.applySnapshot(saved.snapshot, { persist: false, captureResult: false });
      lastSignature = signature(currentFamilySnapshot());
      document.documentElement.dataset.operatorFamilyPersistence404162 = "restored";
      document.documentElement.dataset.operatorFamilyPersistenceRestoreReason404162 = String(reason || "boot");
      return true;
    } catch (_) {
      document.documentElement.dataset.operatorFamilyPersistence404162 = "restore-failed";
      return false;
    } finally {
      restoring = false;
    }
  }

  function reconcileRole(reason = "interaction") {
    const nextRole = role();
    if (!nextRole || nextRole === lastRole) return false;
    lastRole = nextRole;
    if (nextRole === "administrator") return restoreSaved(reason);
    return false;
  }

  function postInteraction(reason) {
    queueMicrotask(() => {
      try {
        reconcileRole(`${reason}-role`);
        if (role() !== "administrator") return;
        requestAnimationFrame(() => {
          try { writeSaved(reason); } catch (_) {}
        });
      } catch (_) {}
    });
  }

  function install() {
    if (installed) return true;
    manager = globalThis.ErithAdministratorWindows || null;
    if (!manager?.snapshot || !manager?.applySnapshot) return false;

    installed = true;
    lastRole = role();
    if (lastRole === "administrator") restoreSaved("boot");
    else lastSignature = signature(currentFamilySnapshot());

    // Capture the state before a possible role switch, then capture again after
    // the click transaction. Signature dedup prevents redundant localStorage writes.
    document.addEventListener("click", () => {
      try { if (role() === "administrator") writeSaved("pre-click"); } catch (_) {}
      postInteraction("click");
    }, true);

    // Drag, first-detach and native CSS resize finish on pointerup. Persist only
    // if the resulting four-family snapshot actually changed.
    window.addEventListener("pointerup", () => postInteraction("pointerup"), true);
    window.addEventListener("popstate", () => postInteraction("popstate"), true);
    window.addEventListener("hashchange", () => postInteraction("hashchange"), true);

    document.documentElement.dataset.operatorFamilyPersistenceBuild = BUILD;
    globalThis.ErithOperatorFamilyPersistence404162 = Object.freeze({
      build: BUILD,
      schema: SCHEMA,
      storage_key: STORAGE_KEY,
      families: FAMILY_IDS,
      first_run_default_compact_preserved: true,
      direct_hash_wins: true,
      manager_remains_presentation_owner: true,
      business_state_changed: false,
      graph_context_changed: false,
      oracle_changed: false,
      market_core_changed: false,
      timer_added: false,
      network_added: false,
      websocket_added: false,
      broad_observer_added: false,
      status: () => Object.freeze({
        role: role(),
        saved: !!readSaved(),
        state: document.documentElement.dataset.operatorFamilyPersistence404162 || "idle",
        signature: lastSignature
      }),
      capture: reason => writeSaved(reason || "manual"),
      restore: reason => restoreSaved(reason || "manual")
    });
    return true;
  }

  try { install(); } catch (_) {}
  queueMicrotask(() => { try { install(); } catch (_) {} });
  window.addEventListener("load", () => { try { install(); } catch (_) {} }, { once: true });
})();
