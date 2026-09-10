(() => {
  "use strict";

  /* ============================================================
     40.3.23 — PARKER LEWIS CAN'T LOSE · FIREFOX COMPOSITOR ISOLATION LOCK

     PURPOSE
     - Re-run the validated 39.x architecture checks under the current recovery identity.
     - Verify publication identity, runtime truth, module wiring,
       read-only contracts, script order, protected UI anchors, the single uniform metallic menu appearance for all Administrator window controls.
     - Report data-coverage limits as WARN, never as fake code failures.

     CONTRACT
     - 40.1.52 keeps the Binance LIVE board outside historical datasets, illuminates the restored Metal bars without geometry changes, strengthens the whole positive 24h Technical Reading cell, and adds Oracle V1 on a separate canvas; no synthetic Chart.js endpoint or trading action.
     - NO automatic repair.
     - NO memory write.
     - NO network request from this module.
     - NO Atlas / NØX / Aerith / Bridge / Ollama start.
     ============================================================ */

  const BUILD_CURRENT = "40.3.56";
  const ENGINE_CURRENT = "38.15.11";
  const WINDOW_MANAGER_SOURCE_BUILD = "40.1.48";
  const TOKEN_CURRENT = `market-core-v2.0-alpha-build-${BUILD_CURRENT}`;
  const ROOT_ID = "atlasArchitectureFreeze";

  const byId = id => document.getElementById(id);
  const setText = (id, value) => {
    const node = byId(id);
    if (node) node.textContent = String(value ?? "—");
  };
  const safe = (fn, fallback = null) => {
    try { return typeof fn === "function" ? fn() : fallback; }
    catch (_) { return fallback; }
  };

  function meta(name) {
    return String(document.querySelector(`meta[name="${name}"]`)?.content || "").trim();
  }

  function scriptRows() {
    return [...document.querySelectorAll('script[src]')].map((node, index) => ({
      index,
      raw: String(node.getAttribute("src") || ""),
      src: String(node.src || node.getAttribute("src") || "")
    }));
  }

  function styleRows() {
    return [...document.querySelectorAll('link[rel="stylesheet"][href]')].map((node, index) => ({
      index,
      raw: String(node.getAttribute("href") || ""),
      href: String(node.href || node.getAttribute("href") || "")
    }));
  }

  function pathOnly(value) {
    return String(value || "").split("?")[0].split("#")[0];
  }

  function countScriptSuffix(suffix) {
    return scriptRows().filter(row => pathOnly(row.raw).endsWith(suffix)).length;
  }

  function hasScriptSuffix(suffix) {
    return countScriptSuffix(suffix) === 1;
  }

  function versionedLocalScripts() {
    const rows = scriptRows().filter(row => row.raw.startsWith("./") && row.raw.includes("?v="));
    const stale = rows.filter(row => !row.raw.includes(BUILD_CURRENT));
    return { rows, stale };
  }

  function versionedAdminStyles() {
    const required = ["admin-windows.css", "admin-visual-assets.css", "admin-ribbons.css", "admin-window-menu-uniform.css"];
    const rows = styleRows();
    const states = required.map(name => {
      const matches = rows.filter(row => pathOnly(row.raw).endsWith(`/${name}`) || pathOnly(row.raw).endsWith(name));
      const row = matches[0] || null;
      return {
        name,
        count: matches.length,
        current: !!row && row.raw.includes(BUILD_CURRENT),
        raw: row?.raw || "absent"
      };
    });
    return states;
  }

  function scriptOrder() {
    const expected = [
      "./app.js",
      "./js/market-memory.js",
      "./js/analytical-memory.js",
      "./js/market-memory-collector.js",
      "./js/decision-board.js",
      "./js/retrospective-validation.js",
      "./js/multi-collector-concordance.js",
      "./js/memory-health-audit.js",
      "./js/core/admin-window-manager.js",
      "./js/app.js",
      "./js/layout-repair.js",
      "./js/architecture-freeze.js"
    ];
    const rows = scriptRows();
    const positions = expected.map(path => {
      const matches = rows.filter(row => pathOnly(row.raw) === path);
      return { path, count: matches.length, index: matches.length === 1 ? matches[0].index : -1 };
    });
    const unique = positions.every(row => row.count === 1);
    const ordered = unique && positions.every((row, i) => i === 0 || row.index > positions[i - 1].index);
    return { expected, positions, unique, ordered };
  }

  function check(name, ok, detail, severity = "critical") {
    return Object.freeze({ name, ok: !!ok, detail: String(detail || ""), severity });
  }

  function runtimeBuild() {
    try { return String(typeof ATLAS_BUILD !== "undefined" ? ATLAS_BUILD : "").trim(); }
    catch (_) { return ""; }
  }

  function runtimeToken() {
    try { return String(typeof ATLAS_ASSET_TOKEN !== "undefined" ? ATLAS_ASSET_TOKEN : "").trim(); }
    catch (_) { return ""; }
  }

  function runtimeTruth() {
    try {
      if (typeof atlasRuntimeTruth3813 === "function") return atlasRuntimeTruth3813();
    } catch (_) {}
    return globalThis.__AGENT_CRYPTO_RUNTIME_TRUTH__ || null;
  }

  function memoryHealth() {
    return safe(globalThis.atlasMemoryHealth3980R2?.derive, null);
  }

  function multiCollector() {
    return safe(globalThis.atlasMultiCollectorConcordance3970?.derive, null);
  }

  function readOnlyContractOk(contract) {
    if (!contract) return false;
    return contract.writes_memory === false
      && contract.new_fetch === false
      && contract.new_timer === false
      && contract.new_websocket === false
      && contract.starts_atlas === false
      && contract.starts_nox === false
      && contract.starts_aerith === false;
  }

  function directControlState(host) {
    if (!(host instanceof HTMLElement)) return null;
    const shell = host.closest?.(".admin-native-floating-shell") || null;
    const root = shell
      ? shell.querySelector(":scope > .admin-native-floating-titlebar > .admin-native-controls-floating")
      : ([...host.children].find(node => node.classList?.contains("admin-native-controls")) || null);
    if (!(root instanceof HTMLElement)) return null;
    const required = [
      ".admin-native-move",
      ".admin-native-minimize",
      ".admin-native-float",
      ".admin-native-maximize",
      ".admin-native-hide"
    ];
    const buttons = required.map(selector => root.querySelector(selector));
    const style = safe(() => getComputedStyle(root), null);
    const effectiveHost = shell || host;
    const hostStyle = safe(() => getComputedStyle(effectiveHost), null);
    const rect = safe(() => root.getBoundingClientRect(), null);
    const hostRect = safe(() => effectiveHost.getBoundingClientRect(), null);
    const rendered = !!hostStyle
      && hostStyle.display !== "none"
      && hostStyle.visibility !== "hidden"
      && Number(hostRect?.width || 0) > 0
      && Number(hostRect?.height || 0) > 0
      && effectiveHost.getClientRects().length > 0;
    const layoutOk = !rendered || (
      !!style && style.position === "absolute"
      && !!rect && rect.width >= 120
      && !!hostRect && rect.left >= hostRect.left - 2 && rect.right <= hostRect.right + 2
    );
    return {
      root,
      buttons,
      rendered,
      complete: buttons.every(button => button instanceof HTMLButtonElement),
      interactive: !!style && style.display !== "none" && style.visibility !== "hidden" && style.pointerEvents !== "none",
      computedOpacity: Number.parseFloat(style?.opacity || "0"),
      position: String(style?.position || ""),
      display: String(style?.display || ""),
      flexDirection: String(style?.flexDirection || ""),
      width: Number(rect?.width || 0),
      layoutOk
    };
  }

  function canonicalChromeCssContract() {
    const sheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-windows.css"));
    if (!sheet) return { ok:false, detail:"admin-windows.css CSSOM absent" };
    const rows = [];
    const selectors = value => String(value || "").split(",").map(item => item.trim()).filter(Boolean);
    const opacityNumber = value => {
      const number = Number.parseFloat(String(value || "").trim());
      return Number.isFinite(number) ? number : null;
    };
    try {
      for (const rule of [...sheet.cssRules]) {
        if (rule.type !== CSSRule.STYLE_RULE) continue;
        rows.push({
          selector:String(rule.selectorText || ""),
          selectors:selectors(rule.selectorText),
          opacity:String(rule.style?.opacity || "").trim()
        });
      }
    } catch (_) {
      return { ok:false, detail:"admin-windows.css CSSOM illisible" };
    }
    const lastOpacity = selector => {
      let value = "";
      for (const row of rows) {
        if (row.selectors.includes(selector) && row.opacity) value = row.opacity;
      }
      return value;
    };
    const expected = [
      [".admin-native-controls", 0.16],
      ["#analyste.admin-native-anchor > .admin-native-controls", 0.12],
      ["#marketSnapshotPanel > .admin-native-controls", 0.12],
      [".top5-ribbon > .admin-native-controls", 0.09],
      [".market-flow-ribbon > .admin-native-controls", 0.09],
      [".admin-mirror-bar.admin-mirror-bar-39-2-8", 0.15]
    ];
    const hoverRequired = [
      ".admin-native-control-host:hover > .admin-native-controls",
      "#analyste.admin-native-anchor:hover > .admin-native-controls",
      "#marketSnapshotPanel:hover > .admin-native-controls",
      ".top5-ribbon:hover > .admin-native-controls",
      ".market-flow-ribbon:hover > .admin-native-controls",
      ".admin-mirror-bar.admin-mirror-bar-39-2-8:hover"
    ];
    const base = expected.map(([selector, expectedOpacity]) => {
      const got = lastOpacity(selector);
      const numeric = opacityNumber(got);
      return { selector, expectedOpacity, got, ok: numeric !== null && Math.abs(numeric - expectedOpacity) < 0.0001 };
    });
    const hover = hoverRequired.map(selector => ({
      selector,
      ok: rows.some(row => row.selectors.includes(selector) && opacityNumber(row.opacity) !== null)
    }));
    return {
      ok: base.every(row => row.ok) && hover.every(row => row.ok),
      base,
      hover,
      detail: base.map(row => `${row.selector}:${row.got || "—"}`).join(" · ")
    };
  }

  function graphToolbarStateContract40289() {
    const toolbar = document.querySelector?.("#analyste .chart-v2-toolbar.atlas-graph-toolbar-metallic-40289");
    const reading = toolbar?.querySelector?.(".chart-v2-toolbar-reading");
    const period = toolbar?.querySelector?.(".chart-v2-toolbar-period");
    const comparison = toolbar?.querySelector?.(".chart-v2-toolbar-comparison");
    const labels = [...(toolbar?.querySelectorAll?.(".chart-v2-toolbar-label") || [])].map(node => String(node.textContent || "").trim().toLowerCase());
    const readingGroups = [...(reading?.querySelectorAll?.(".chart-v2-toggle-group > span") || [])].map(node => String(node.textContent || "").trim().toLowerCase());
    const stylesheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-window-menu-uniform.css"));
    const buttonCount = Number(toolbar?.querySelectorAll?.(".chart-v2-toggle,.period-btn,.compare-btn")?.length || 0);
    const fiche = !!toolbar?.querySelector?.("#atlasTop5NativeFicheToggle40284");
    const requiredLabels = ["lecture","période","comparaison"].every(label => labels.includes(label));
    const requiredReading = ["vue","échelle","afficher"].every(label => readingGroups.includes(label));
    const maxNeutral = !!toolbar?.querySelector?.("#btnChartMaxPeriod.period-btn-max");
    const clearPresent = !!toolbar?.querySelector?.("#btnChartClear.compare-btn-clear");
    return {
      ok: !!toolbar && !!reading && !!period && !!comparison && !!stylesheet && requiredLabels && requiredReading && fiche && maxNeutral && clearPresent && buttonCount >= 20,
      detail:`toolbar=${String(!!toolbar)} · rows=${[reading,period,comparison].filter(Boolean).length}/3 · lecture=${String(requiredReading)} · fiche=${String(fiche)} · max=${String(maxNeutral)} · clear=${String(clearPresent)} · buttons=${buttonCount} · css=${String(!!stylesheet)}`
    };
  }

  function sectionAirEmblemContract40292() {
    const bodyOk = document.body?.classList?.contains("atlas-section-air-40292") === true;
    const oracle = document.getElementById("oracle-analysis-suite");
    const news = document.getElementById("news-market-explanation");
    const system = document.querySelector('.atlas-layout-family-system > .admin-family-emblem-r3[data-for="system"]');
    const projects = document.querySelector('.atlas-layout-family-operations > .admin-family-emblem-r3[data-for="projects"]');
    const sources = document.querySelector('#liveSourcesCollapse > summary .admin-summary-emblem-r3[data-for="sources"]');
    const analytical = document.querySelector('#atlasAnalyticalMemory394 > .admin-analytical-emblem-r3');
    return {
      ok: bodyOk && !!oracle && !!news && !!system && !!projects && !!sources && !!analytical,
      detail:`body=${String(bodyOk)} · oracle=${String(!!oracle)} · news=${String(!!news)} · system=${String(!!system)} · projects=${String(!!projects)} · sources=${String(!!sources)} · analytical=${String(!!analytical)}`
    };
  }

  function sectionDensityAtlasViewportContract40293() {
    const bodyOk = document.body?.classList?.contains("atlas-section-density-40293") === true;
    const progress = document.getElementById("atlasAnalysisProgressCard");
    const localHub = document.getElementById("local-ai-hub");
    const oracleSubsections = Number(document.querySelectorAll?.("#oracle-analysis-suite .atlas-oracle-suite-subsection")?.length || 0);
    const news = document.getElementById("newsMarketOperatorIntelligence40235");
    return {
      ok: bodyOk && !!progress && !!localHub && oracleSubsections >= 2 && !!news,
      detail:`body=${String(bodyOk)} · progress=${String(!!progress)} · hub=${String(!!localHub)} · oracleSubsections=${oracleSubsections} · news=${String(!!news)}`
    };
  }


  function familyBoundaryContract40298() {
    const bodyOk = document.body?.classList?.contains("atlas-family-boundaries-40298") === true;
    const shell = document.querySelector("main.shell");
    const operations = document.querySelector(".atlas-layout-family-operations");
    const system = document.querySelector(".atlas-layout-family-system");
    const topLevelSiblings = !!shell && operations?.parentElement === shell && system?.parentElement === shell;
    const operationsBeforeSystem = !!operations && !!system && Boolean(operations.compareDocumentPosition(system) & Node.DOCUMENT_POSITION_FOLLOWING);
    const systemNotNestedInOperations = !system?.closest?.('[data-layout-family="operations"]');
    const operationsEmblem = operations?.querySelector?.(':scope > .admin-family-emblem-r3[data-for="projects"]');
    const systemEmblem = system?.querySelector?.(':scope > .admin-family-emblem-r3[data-for="system"]');
    return {
      ok: bodyOk && topLevelSiblings && operationsBeforeSystem && systemNotNestedInOperations && !!operationsEmblem && !!systemEmblem,
      detail:`body=${String(bodyOk)} · siblings=${String(topLevelSiblings)} · 03-before-04=${String(operationsBeforeSystem)} · 04-outside-03=${String(systemNotNestedInOperations)} · emblems=${Number(!!operationsEmblem)+Number(!!systemEmblem)}/2`
    };
  }


  function bookNavigationContract40299() {
    const bodyOk = document.body?.classList?.contains("atlas-book-nav-40299") === true;
    const dock = document.querySelector(".atlas-v2-nav-essential.atlas-quick-dock");
    const buttons = [...(dock?.querySelectorAll?.("button[data-atlas-essential-target]") || [])];
    const expected = ["livecheck","market-workspace","analyste","atlas-local-ai-collapse","oracle-analysis-suite","sources"];
    const ids = buttons.map(node => String(node.dataset.atlasEssentialTarget || ""));
    const targetsOk = expected.every((id, index) => ids[index] === id && !!document.getElementById(id));
    const noHref = Number(dock?.querySelectorAll?.("a[href]")?.length || 0) === 0;
    const kicker = document.getElementById("atlasCommandKicker");
    const singleAdminVisual = !!kicker?.classList?.contains("atlas-visually-hidden") && !!document.getElementById("btnAdminAccountToggle");
    return {
      ok: bodyOk && buttons.length === 6 && targetsOk && noHref && singleAdminVisual,
      detail:`body=${String(bodyOk)} · buttons=${buttons.length}/6 · order=${ids.join(">") || "—"} · noHref=${String(noHref)} · singleAdmin=${String(singleAdminVisual)}`
    };
  }

  function adminFamilyOrderMenuContract40300() {
    const bodyOk = document.body?.classList?.contains("atlas-family-order-40300") === true;
    const systemHeader = document.querySelector(".atlas-layout-family-system");
    const audience = document.getElementById("mesure-audience");
    // 40.3.02 supersedes the temporary 40.3.00 topology where the 04 header
    // sat after its children. Preserve only the durable 40.3.00 invariants:
    // 04 remains before Audience and menus 02/03/04 remain right-owned.
    const headerBeforeAudience = !!systemHeader && !!audience && Boolean(systemHeader.compareDocumentPosition(audience) & Node.DOCUMENT_POSITION_FOLLOWING);
    const headers = ["intelligence","operations","system"].map(name => document.querySelector(`.atlas-layout-family-${name}`)).filter(Boolean);
    const controls = headers.map(header => header.querySelector(":scope > .admin-native-controls")).filter(Boolean);
    const controlsRight = controls.length === 3 && controls.every(node => {
      const style = getComputedStyle(node);
      return style.position === "absolute" && style.left === "auto" && style.right !== "auto";
    });
    return {
      ok: bodyOk && headerBeforeAudience && controlsRight,
      detail:`body=${String(bodyOk)} · 04-before-audience=${String(headerBeforeAudience)} · menus-right=${controls.length}/3:${String(controlsRight)} · topology=40302-supersedes-temporary-40300`
    };
  }

  function atomicFamilyCommandlineContract40302() {
    const bodyAtomic = document.body?.classList?.contains("atlas-family-atomic-40302") === true;
    const bodyCommand = document.body?.classList?.contains("atlas-commandline-compact-40302") === true;
    const shell = document.querySelector("main.shell");
    const direct = node => !!node && node.parentElement === shell;
    const headers = [
      document.querySelector(".atlas-layout-family-analysis"),
      document.querySelector(".atlas-layout-family-intelligence"),
      document.querySelector(".atlas-layout-family-operations"),
      document.querySelector(".atlas-layout-family-system")
    ];
    const sys = [...(shell?.children || [])].filter(node => ["system","experiment"].includes(String(node.dataset?.layoutFamily || "")));
    const manager = globalThis.ErithAdministratorWindows;
    const expected = {
      "analyse-decision":["analysis"],
      "intelligence-memoire-creation":["intelligence","creation"],
      "preparation-operations":["operations"],
      "experimentation-systeme":["system","experiment"]
    };
    const ownership = Object.entries(expected).every(([id,tones]) => {
      const win = manager?.getWindow?.(id);
      if (!win || !direct(win.anchor)) return false;
      return win.nodes.every(node => node === win.anchor || (direct(node) && tones.includes(String(node.dataset?.layoutFamily || ""))));
    });
    const atomic = headers.every(direct) && sys.length === 6 && sys.every(direct);
    const analysisWindow = manager?.getWindow?.("analyse-decision");
    const astro = document.getElementById("astrocycle-4055");
    const celestial = document.getElementById("celestial-sentinel-4055");
    const dynamicAnalysisOwned = [astro, celestial].every(node => node instanceof HTMLElement
      && direct(node)
      && node.dataset.layoutFamily === "analysis"
      && node.dataset.adminNativeWindow === "analyse-decision"
      && analysisWindow?.nodes?.includes?.(node));
    const drawer = document.getElementById("atlasAdminCenterDrawer");
    const portalOk = drawer?.parentElement === document.body;
    const essential = document.querySelectorAll(".atlas-v2-nav-essential [data-atlas-essential-target]").length === 6;
    return {
      ok: bodyAtomic && bodyCommand && atomic && ownership && dynamicAnalysisOwned && portalOk && essential,
      detail:`atomic=${String(atomic)} · 04-members=${sys.length}/6 · ownership=${String(ownership)} · dynamic-analysis=${String(dynamicAnalysisOwned)} · drawer-portal=${String(portalOk)} · essential=${essential}/6`
    };
  }

  function canonicalAdminSequenceContract40304() {
    const bodyOk = document.body?.classList?.contains("atlas-canonical-admin-sequence-40304") === true;
    const shell = document.querySelector("main.shell");
    const direct = node => !!node && node.parentElement === shell;
    const h01 = document.querySelector(".atlas-layout-family-analysis");
    const h02 = document.querySelector(".atlas-layout-family-intelligence");
    const h03 = document.querySelector(".atlas-layout-family-operations");
    const h04 = document.querySelector(".atlas-layout-family-system");
    const missions = document.getElementById("missions-vie");
    const audience = document.getElementById("mesure-audience");
    const sources = document.getElementById("liveSourcesCollapse");
    const sequence = [h01,h02,h03,h04,missions,audience,sources];
    const orderOk = sequence.every(direct) && sequence.every((node,index) => index === sequence.length - 1
      || Boolean(node.compareDocumentPosition(sequence[index+1]) & Node.DOCUMENT_POSITION_FOLLOWING));
    const sys = [...(shell?.children || [])].filter(node => ["system","experiment"].includes(String(node.dataset?.layoutFamily || "")));
    const missionKeys = new Set(["fonds-erith","association-erith","aerith-enfance","aerith-animaux","aerith-terre-vivante"]);
    const missionMembers = [...(shell?.children || [])].filter(node => node instanceof HTMLDetailsElement && missionKeys.has(String(node.dataset?.collapseKey || "")));
    const systemContiguous = sys.length === 6 && h04?.nextElementSibling === sys[0] && sys[sys.length-1]?.nextElementSibling === missions;
    const missionsContiguous = missionMembers.length === 5 && missions?.nextElementSibling === missionMembers[0]
      && missionMembers[missionMembers.length-1]?.nextElementSibling === audience;
    const ownerSystem = globalThis.ErithAdministratorWindows?.getWindow?.("experimentation-systeme");
    const ownerMissions = globalThis.ErithAdministratorWindows?.getWindow?.("missions-de-vie");
    const ownershipOk = ownerSystem?.anchor === h04 && ownerSystem?.nodes?.length === 7 && ownerMissions?.nodes?.length === 6;
    return {
      ok: bodyOk && orderOk && systemContiguous && missionsContiguous && ownershipOk,
      detail:`body=${String(bodyOk)} · order=01>02>03>04>Missions>Audience>Sources:${String(orderOk)} · 04-header>6-members>Missions=${String(systemContiguous)} · missions=5/5:${String(missionsContiguous)} · owners=${String(ownershipOk)}`
    };
  }

  function family04TrailingHeaderContract40305() {
    // 40.3.05 is retained as a recorded rejected topology, never as a current invariant.
    const oldMarkerPresent = document.body?.classList?.contains("atlas-family04-trailing-header-40305") === true;
    const currentMarker = document.body?.classList?.contains("atlas-family04-canonical-header-40306") === true;
    const shell = document.querySelector("main.shell");
    const h04 = document.querySelector(".atlas-layout-family-system");
    const missions = document.getElementById("missions-vie");
    const sys = [...(shell?.children || [])].filter(node => ["system","experiment"].includes(String(node.dataset?.layoutFamily || "")));
    const canonicalBoundary = sys.length === 6 && h04?.nextElementSibling === sys[0] && sys[sys.length-1]?.nextElementSibling === missions;
    return {
      ok: !oldMarkerPresent && currentMarker && canonicalBoundary,
      detail:`40305-marker-absent=${String(!oldMarkerPresent)} · 40306-marker=${String(currentMarker)} · 04-header>members>Missions=${String(canonicalBoundary)}`
    };
  }

  function family04TrailingBoundaryContract40307() {
    const bodyOk = document.body?.classList?.contains("atlas-family04-trailing-boundary-40307") === true;
    const shell = document.querySelector("main.shell");
    const direct = node => !!node && node.parentElement === shell;
    const h03 = document.querySelector(".atlas-layout-family-operations");
    const h04 = document.querySelector(".atlas-layout-family-system");
    const missions = document.getElementById("missions-vie");
    const audience = document.getElementById("mesure-audience");
    const sources = document.getElementById("liveSourcesCollapse");
    const sys = [...(shell?.children || [])].filter(node => ["system","experiment"].includes(String(node.dataset?.layoutFamily || "")));
    const physical = shell?.querySelector?.(':scope > details[data-collapse-key="physical-security"]') || null;
    const boundary = sys.length === 6
      && sys[sys.length - 1] === physical
      && physical?.nextElementSibling === h04
      && h04?.nextElementSibling === missions;
    const orderOk = [h03, sys[0], h04, missions, audience, sources].every(direct)
      && Boolean(h03.compareDocumentPosition(sys[0]) & Node.DOCUMENT_POSITION_FOLLOWING)
      && Boolean(h04.compareDocumentPosition(missions) & Node.DOCUMENT_POSITION_FOLLOWING)
      && Boolean(missions.compareDocumentPosition(audience) & Node.DOCUMENT_POSITION_FOLLOWING)
      && Boolean(audience.compareDocumentPosition(sources) & Node.DOCUMENT_POSITION_FOLLOWING);
    const owner = globalThis.ErithAdministratorWindows?.getWindow?.("experimentation-systeme");
    const ownershipOk = owner?.anchor === h04
      && owner?.nodes?.length === 7
      && sys.every(node => owner.nodes.includes(node));
    return {
      ok: bodyOk && boundary && orderOk && ownershipOk,
      detail:`body=${String(bodyOk)} · system-members=${sys.length}/6 · physical>04>Missions=${String(boundary)} · order=${String(orderOk)} · owner=${String(ownershipOk)}`
    };
  }

  function family04OwnershipOrderContract40308() {
    const bodyOk = document.body?.classList?.contains("atlas-family04-owner-order-40308") === true;
    const shell = document.querySelector("main.shell");
    const direct = node => !!node && node.parentElement === shell;
    const h03 = document.querySelector(".atlas-layout-family-operations");
    const h04 = document.querySelector(".atlas-layout-family-system");
    const storage = document.getElementById("atlasStorageHealth40198");
    const keys04 = ["simulation","commandes","backend","safety","physical-security"];
    const members04 = [storage, ...keys04.map(key => shell?.querySelector?.(`:scope > details[data-collapse-key="${key}"]`) || null)].filter(Boolean);
    const keys03 = ["situation","questionnaire","briefing","planning"];
    const members03 = keys03.map(key => shell?.querySelector?.(`:scope > details[data-collapse-key="${key}"]`) || null).filter(Boolean);
    const owner03 = globalThis.ErithAdministratorWindows?.getWindow?.("preparation-operations");
    const owner04 = globalThis.ErithAdministratorWindows?.getWindow?.("experimentation-systeme");
    const expected03 = [h03, ...members03];
    const expected04 = [...members04, h04];
    const sameOrder = (actual, expected) => Array.isArray(actual)
      && actual.length === expected.length
      && actual.every((node, index) => node === expected[index]);
    const disjoint = owner03?.nodes?.every?.(node => !expected04.includes(node)) === true
      && owner04?.nodes?.every?.(node => !expected03.includes(node)) === true;
    const domBoundary = members04.length === 6
      && members04.every(direct)
      && members03.every(direct)
      && members04[members04.length - 1]?.nextElementSibling === h04
      && h04?.nextElementSibling?.id === "missions-vie";
    const ownerBoundary = sameOrder(owner03?.nodes, expected03)
      && sameOrder(owner04?.nodes, expected04)
      && owner03?.anchor === h03
      && owner04?.anchor === h04
      && disjoint;
    return {
      ok: bodyOk && domBoundary && ownerBoundary,
      detail:`body=${String(bodyOk)} · 03=${owner03?.nodes?.length || 0}/5 · 04=${owner04?.nodes?.length || 0}/7 · physical>04>Missions=${String(domBoundary)} · exact-owner-order=${String(ownerBoundary)} · disjoint=${String(disjoint)}`
    };
  }

  function canonicalSectionsAutofitContract40320() {
    const bodyOk = document.body?.classList?.contains("atlas-family04-canonical-hierarchy-40320") === true;
    const shell = document.querySelector("main.shell");
    const direct = node => !!node && node.parentElement === shell;
    const h03 = document.querySelector(".atlas-layout-family-operations");
    const h04 = document.querySelector(".atlas-layout-family-system");
    const storage = document.getElementById("atlasStorageHealth40198");
    const missions = document.getElementById("missions-vie");
    const audience = document.getElementById("mesure-audience");
    const sources = document.getElementById("liveSourcesCollapse");
    const getDetail = key => shell?.querySelector?.(`:scope > details[data-collapse-key="${key}"]`) || null;
    const family03 = [h03, ...["situation","questionnaire","briefing","planning"].map(getDetail)];
    const family04 = [h04, storage, ...["simulation","commandes","backend","safety","physical-security"].map(getDetail)];
    const exactChain = [...family03, ...family04, missions, audience, sources];
    const domOk = exactChain.every(direct) && exactChain.every((node,index) => index === exactChain.length - 1 || node.nextElementSibling === exactChain[index+1]);
    const manager = globalThis.ErithAdministratorWindows;
    const owner03 = manager?.getWindow?.("preparation-operations");
    const owner04 = manager?.getWindow?.("experimentation-systeme");
    const same = (actual, expected) => Array.isArray(actual) && actual.length === expected.length && actual.every((node,index) => node === expected[index]);
    const ownershipOk = owner03?.anchor === h03 && owner04?.anchor === h04 && same(owner03?.nodes, family03) && same(owner04?.nodes, family04);
    const c = globalThis.ErithCanonicalSectionsAutofit40320;
    const wm = globalThis.ErithAdminWindowManager?.contract || {};
    const autoFitOk = c?.native_first_detach_autofit_restored === true
      && c?.native_first_detach_autofit_owner === "autoFitFloatingShell"
      && wm?.native_first_detach_autofit_40320 === true
      && wm?.native_first_detach_autofit_owner_40320 === "autoFitFloatingShell"
      && wm?.native_first_detach_autofit_layout_passes_40320 === 1
      && wm?.legacy_stored_geometry_height_fallback_40320 === true
      && wm?.saved_workspace_reset_40320 === false;
    return {
      ok: bodyOk && domOk && ownershipOk && autoFitOk,
      detail:`body=${String(bodyOk)} · 03>04>Storage>…>Physical>Missions=${String(domOk)} · owners=${String(ownershipOk)} · native-autofit=${String(autoFitOk)}`
    };
  }

  function roleTransitionPerformanceContract40314() {
    const bodyOk = document.body?.classList?.contains("atlas-role-transition-performance-40314") === true;
    const transition = globalThis.ErithWindowRoleTransition40314;
    const wm = globalThis.ErithAdminWindowManager?.contract;
    return {
      ok: bodyOk
        && transition?.build === "40.3.14"
        && transition?.same_role_transition_is_noop === true
        && transition?.boot_replay_removed === true
        && transition?.one_window_manager_transaction_per_real_role_change === true
        && transition?.persisted_restore_single_pass === true
        && transition?.role_transition_forces_geometry_snapshot === false
        && transition?.hidden_window_deck_live_rebuild === false
        && wm?.batched_deck_reflow_40314 === true
        && wm?.one_deck_rebuild_per_multiwindow_transaction_40314 === true
        && wm?.hidden_deck_rebuild_deferred_40314 === true
        && wm?.role_transition_capture_snapshot_disabled_40314 === true
        && wm?.restore_persisted_single_pass_40314 === true,
      detail:`body=${String(bodyOk)} · same-role-noop=${String(transition?.same_role_transition_is_noop === true)} · boot-replay=${String(transition?.boot_replay_removed === true)} · single-pass=${String(wm?.restore_persisted_single_pass_40314 === true)} · deck-batch=${String(wm?.batched_deck_reflow_40314 === true)} · hidden-deck-deferred=${String(wm?.hidden_deck_rebuild_deferred_40314 === true)}`
    };
  }

  function surfacePerformanceContract40315() {
    const bodyOk = document.body?.classList?.contains("atlas-surface-performance-40315") === true;
    const c = globalThis.ErithSurfacePerformance40315;
    const wm = globalThis.ErithAdminWindowManager?.contract;
    const header = document.querySelector("main.shell > header#accueil");
    const content = document.querySelector("main.shell > section:not(#marche)") || document.querySelector("main.shell > section");
    const viewport = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const hratio = header && viewport ? header.getBoundingClientRect().width / viewport : 0;
    const cratio = content && viewport ? content.getBoundingClientRect().width / viewport : 0;
    return {
      ok: bodyOk
        && c?.build === "40.3.15"
        && c?.header_surface === "100%"
        && c?.content_surface === "97%"
        && c?.transform_scale === false
        && c?.global_zoom === false
        && c?.floating_backdrop_blur === false
        && wm?.placeholder_measurement_batch_40315 === "all-reads-before-dom-writes"
        && wm?.floating_surface_backdrop_blur_40315 === false,
      detail:`body=${String(bodyOk)} · header=${hratio.toFixed(3)} · content=${cratio.toFixed(3)} · drag-autofit=${String(c?.drag_detach_auto_fit)} · blur=${String(c?.floating_backdrop_blur)}`
    };
  }

  function bridgePassivePerformanceContract40317() {
    const bodyOk = document.body?.classList?.contains("atlas-bridge-passive-performance-40317") === true;
    const c = globalThis.ErithBridgePassivePerformance40317;
    const wm = globalThis.ErithAdminWindowManager?.contract || globalThis.ErithAdminWindowManagerContract || {};
    return {
      ok: bodyOk && c?.build === "40.3.17" && c?.bridge_health_is_analysis_trigger === false
        && c?.focus_pageshow_restart_analysis === false && c?.one_supervision_timer === true
        && c?.compact_family_placeholder_policy === true
        && wm?.compact_family_placeholder_policy_40317 === "anchor-marker-18px",
      detail: `body=${String(bodyOk)} · passiveHealth=${String(c?.bridge_health_is_analysis_trigger === false)} · focusNoRestart=${String(c?.focus_pageshow_restart_analysis === false)} · oneTimer=${String(c?.one_supervision_timer === true)} · placeholder=${String(wm?.compact_family_placeholder_policy_40317 || "")}`
    };
  }

  function technicalImageContinuityContract40321() {
    const contract = globalThis.ErithTechnicalImageContinuity40321 || globalThis.ErithTechnicalLoadPriority40307;
    const portraitCount = document.querySelectorAll("#detailPanel .admin-tech-portrait-r3").length;
    const noChartPreloadDuplicate = !document.querySelector('link[rel="preload"][href*="admin-chart-office.png"]');
    const bodyOk = document.body?.classList?.contains("atlas-tech-image-continuity-40321") === true;
    return {
      ok: bodyOk
        && contract?.build === "40.3.21"
        && contract?.parent_build === "40.3.20"
        && contract?.saved_detail_state_preserved === true
        && contract?.collapsed_boot_defers_asset === false
        && contract?.collapsed_boot_keeps_asset === true
        && contract?.open_boot_loads_asset === true
        && contract?.technical_fetch_priority_open === "auto"
        && contract?.technical_fetch_priority_collapsed === "low"
        && contract?.technical_loading_collapsed === "eager"
        && contract?.auto_boundary_updates_when_collapsed === true
        && contract?.private_image_click_preserved === true
        && contract?.private_image_indexeddb_preserved === true
        && contract?.random_library_count === 9
        && contract?.single_src_authority_preserved === true
        && contract?.observer_added === false
        && contract?.timer_added === false
        && contract?.geometry_changed === false
        && contract?.window_manager_changed === false
        && contract?.chart_background_duplicate_request_added === false
        && noChartPreloadDuplicate
        && portraitCount === 1,
      detail:`body=${String(bodyOk)} · contract=${contract?.build || "—"} · saved-state=${String(contract?.saved_detail_state_preserved === true)} · reduced-image=${String(contract?.collapsed_boot_keeps_asset === true)} · collapsed-defer=${String(contract?.collapsed_boot_defers_asset === true)} · priority=${String(contract?.technical_fetch_priority_collapsed || "—")} · RND=${String(contract?.random_library_count || 0)} · portrait=${portraitCount}/1`
    };
  }

  function commandCenterPortalContract40321() {
    const drawer = byId("atlasAdminCenterDrawer");
    const styleNode = document.querySelector("style[data-atlas-command-center-portal-40321]");
    const css = String(styleNode?.textContent || "");
    const bodyOk = document.body?.classList?.contains("atlas-command-center-portal-40321") === true;
    const portalParentOk = !!drawer && drawer.parentElement === document.body;
    const computedPosition = drawer ? String(getComputedStyle(drawer).position || "") : "";
    const fixedOwnerDeclared = css.includes("body > #atlasAdminCenterDrawer.atlas-admin-command-drawer")
      && css.includes("admin-command-observatory-r3")
      && css.includes("position: fixed !important")
      && css.includes("z-index: 2000 !important");
    return {
      ok: bodyOk
        && portalParentOk
        && fixedOwnerDeclared
        && computedPosition === "fixed",
      detail:`body=${String(bodyOk)} · body-portal=${String(portalParentOk)} · owner=${String(fixedOwnerDeclared)} · position=${computedPosition || "—"}`
    };
  }

  function familyRoleReturnContract40322() {
    const isolation = globalThis.ErithRoleIsolation40312;
    const migration = globalThis.ErithFamilyRoleReturnMigration40322;
    const expected = ["analyse-decision","intelligence-memoire-creation","preparation-operations","experimentation-systeme","missions-de-vie"];
    const ids = Array.isArray(migration?.window_ids) ? migration.window_ids : [];
    return {
      ok: isolation?.build === "40.3.22"
        && isolation?.base_build === "40.3.12"
        && isolation?.public_visibility_snapshot_before_block === true
        && isolation?.administrator_family_header_restore === true
        && migration?.build === "40.3.22"
        && migration?.parent_build === "40.3.21"
        && migration?.one_time === true
        && migration?.before_window_manager_init === true
        && migration?.clears_only_large_family_presentation_state === true
        && migration?.direct_fixed_state_preserved === true
        && expected.every(id => ids.includes(id))
        && ids.length === expected.length,
      detail:`isolation=${String(isolation?.build || "—")} · restore=${String(isolation?.administrator_family_header_restore === true)} · migration=${String(migration?.build || "—")} · ids=${ids.length}/${expected.length} · directFixed=${String(migration?.direct_fixed_state_preserved === true)}`
    };
  }

  function commandCenterExplicitContract40322() {
    const contract = globalThis.ErithCommandCenterExplicit40322;
    return {
      ok: contract?.build === "40.3.22"
        && contract?.parent_build === "40.3.21"
        && contract?.automatic_boot_open === false
        && contract?.automatic_auth_open === false
        && contract?.automatic_role_return_open === false
        && contract?.automatic_workspace_restore_open === false
        && contract?.explicit_toggle_open === true
        && contract?.explicit_cluster_open === true
        && contract?.fixed_body_portal_preserved === true
        && contract?.saved_open_state_restore_disabled === true
        && contract?.admin_mode_force_decoupled_from_center_open === true,
      detail:`boot=${String(contract?.automatic_boot_open)} · auth=${String(contract?.automatic_auth_open)} · role=${String(contract?.automatic_role_return_open)} · workspace=${String(contract?.automatic_workspace_restore_open)} · explicit=${String(contract?.explicit_toggle_open === true)}`
    };
  }

  function essentialNavigationContract40309() {
    const contract = globalThis.ErithEssentialNavigation40309;
    const atlasButton = document.querySelector('.atlas-v2-nav-essential [data-atlas-essential-target="atlas-local-ai-collapse"]');
    const atlasTarget = document.getElementById("atlas-local-ai-collapse");
    const atlasManifestTarget = document.getElementById("local-ai-hub");
    const oracleButton = document.querySelector('.atlas-v2-nav-essential [data-atlas-essential-target="oracle-analysis-suite"]');
    const allTargets = [...document.querySelectorAll(".atlas-v2-nav-essential [data-atlas-essential-target]")]
      .every(button => !!document.getElementById(String(button.dataset.atlasEssentialTarget || "")));
    return {
      ok: contract?.build === "40.3.09"
        && contract?.explicit_operator_intent === true
        && contract?.restore_hidden_owner === true
        && contract?.restore_minimized_owner === true
        && contract?.open_requested_details === true
        && contract?.floating_focus_without_document_scroll === true
        && contract?.atlas_manifest_bridge === "local-ai-hub"
        && !!atlasButton && !!atlasTarget && !!atlasManifestTarget && !!oracleButton && allTargets,
      detail:`contract=${contract?.build || "—"} · min-restore=${String(contract?.restore_minimized_owner === true)} · open-details=${String(contract?.open_requested_details === true)} · all-targets=${String(allTargets)}`
    };
  }

  function adminPresentationAuthorityContract40309() {
    const bodyOk = document.body?.classList?.contains("atlas-admin-presentation-authority-40309") === true;
    const shell = document.querySelector("main.shell");
    const planning = document.querySelector('details[data-collapse-key="planning"]');
    const storage = document.getElementById("atlasStorageHealth40198");
    const physical = document.querySelector('details[data-collapse-key="physical-security"]');
    const family04 = document.querySelector("section.atlas-layout-family-system");
    const missions = document.getElementById("missions-vie");
    const intermediateHidden = globalThis.ATLAS_V2_INTERMEDIATE_HIDDEN_IDS || null;
    const direct = node => node instanceof HTMLElement && node.parentElement === shell;
    const boundary = direct(planning) && direct(storage) && planning.nextElementSibling === storage
      && direct(physical) && direct(family04) && physical.nextElementSibling === family04
      && direct(missions) && family04.nextElementSibling === missions;
    const missionsVisibleStructurally = !intermediateHidden || !intermediateHidden.has?.("missions-vie");
    return {
      ok: bodyOk && boundary && missionsVisibleStructurally,
      detail:`body=${String(bodyOk)} · Plan>Storage=${String(planning?.nextElementSibling === storage)} · Physical>04>Missions=${String(physical?.nextElementSibling === family04 && family04?.nextElementSibling === missions)} · intermediate-missions-intro=${String(missionsVisibleStructurally)}`
    };
  }

  function passiveViewportRoleContract40311() {
    const contract = globalThis.ErithPassiveViewportAuthority40310;
    const intermediateHidden = globalThis.ATLAS_V2_INTERMEDIATE_HIDDEN_IDS || null;
    const missionIds = ["fonds-erith-ia", "association-erith-ia", "aerith-enfance", "aerith-animaux", "aerith-terre-vivante"];
    const missionsHidden = missionIds.every(id => intermediateHidden?.has?.(id));
    return {
      ok: contract?.passive_market_patch_document_scroll === false
        && contract?.passive_spot_patch_document_scroll === false
        && contract?.browser_scroll_anchoring_kept === true
        && contract?.table_scroll_preserved === true
        && contract?.focused_control_prevent_scroll === true
        && contract?.user_scroll_authority === true
        && missionsHidden,
      detail:`passive-scroll=${String(contract?.passive_market_patch_document_scroll === false && contract?.passive_spot_patch_document_scroll === false)} · missions-hidden=${String(missionsHidden)}`
    };
  }

  function roleIsolationViewportOwnershipContract40312() {
    const bodyOk = document.body?.classList?.contains("atlas-role-isolation-viewport-ownership-40312") === true;
    const role = globalThis.ErithRoleIsolation40312;
    const windows = globalThis.ErithWindowRoleIsolation40312;
    const viewport = globalThis.ErithViewportOwnership40312;
    const legacyHash = globalThis.ErithLegacyHashRouter40312;
    const wm = globalThis.ErithAdminWindowManager?.contract;
    const missionIds = ["fonds-erith-ia", "association-erith-ia", "aerith-enfance", "aerith-animaux", "aerith-terre-vivante"];
    const missionsHidden = missionIds.every(id => globalThis.ATLAS_V2_INTERMEDIATE_HIDDEN_IDS?.has?.(id));
    const leakedSemanticNodes = [
      document.getElementById("atlasBreakoutContext40271"),
      document.getElementById("news-market-explanation"),
      document.getElementById("atlasMultiCollectorOperator")?.closest?.("[data-layout-family]")
    ].filter(Boolean);
    const semanticTagged = leakedSemanticNodes.length === 3 && leakedSemanticNodes.every(node => !!String(node.dataset.layoutFamily || "").trim());
    return {
      ok: bodyOk
        && role?.build === "40.3.12"
        && role?.public_semantic_family_block === true
        && role?.local_storage_rewrite_for_neutral_view === false
        && windows?.build === "40.3.12"
        && windows?.basic_restores_admin_geometry === false
        && windows?.intermediate_restores_admin_geometry === false
        && windows?.administrator_restores_persisted_geometry === true
        && windows?.neutralization_persists === false
        && wm?.role_isolation_api_40312 === true
        && wm?.neutralize_presentation_without_persist === true
        && wm?.restore_persisted_presentation_without_persist === true
        && viewport?.build === "40.3.12"
        && viewport?.mode_change_document_scroll === false
        && viewport?.authentication_document_scroll === false
        && viewport?.lock_document_scroll === false
        && viewport?.atlas_current_document_scroll === false
        && viewport?.legacy_hash_router_document_scroll === false
        && viewport?.hashchange_second_scroll === false
        && viewport?.passive_market_document_scroll === false
        && viewport?.explicit_operator_navigation_single_frame === true
        && legacyHash?.retired === true
        && legacyHash?.automatic_hash_scroll === false
        && missionsHidden
        && semanticTagged,
      detail:`body=${String(bodyOk)} · role=${role?.build || "—"} · wm-role=${String(wm?.role_isolation_api_40312 === true)} · viewport=${viewport?.build || "—"} · missions-hidden=${String(missionsHidden)} · semantic-leaks-covered=${String(semanticTagged)}`
    };
  }

  function familyStateMigrationContract40303() {
    const bodyOk = document.body?.classList?.contains("atlas-family-state-migration-40303") === true;
    const contract = globalThis.ErithFamilyTopologyStateMigration40303;
    const expected = [
      "analyse-decision",
      "intelligence-memoire-creation",
      "preparation-operations",
      "experimentation-systeme",
      "missions-de-vie"
    ];
    const ids = Array.isArray(contract?.window_ids) ? [...contract.window_ids] : [];
    const idsOk = ids.length === expected.length && expected.every((id,index) => ids[index] === id);
    let markerOk = false;
    try { markerOk = !!contract?.key && localStorage.getItem(contract.key) === "1"; } catch {}
    return {
      ok: bodyOk
        && contract?.build === "40.3.03"
        && contract?.one_time === true
        && contract?.before_window_manager_init === true
        && contract?.scoped_family_state_only === true
        && contract?.unrelated_window_state_preserved === true
        && contract?.namespace_changed === false
        && idsOk && markerOk,
      detail:`body=${String(bodyOk)} · ids=${ids.length}/5:${String(idsOk)} · marker=${String(markerOk)} · scoped=${String(contract?.scoped_family_state_only === true)} · preserve-unrelated=${String(contract?.unrelated_window_state_preserved === true)}`
    };
  }


  function familyCompactReduceContract40301() {
    const bodyOk = document.body?.classList?.contains("atlas-family-compact-reduce-40301") === true;
    const wm = globalThis.ErithAdminWindowManager?.contract;
    const manager = globalThis.ErithAdministratorWindows;
    const ids = ["analyse-decision","intelligence-memoire-creation","preparation-operations","experimentation-systeme"];
    const wins = ids.map(id => manager?.getWindow?.(id)).filter(Boolean);
    const configured = wins.length === 4 && wins.every(win => typeof win.resolveCompactNodes === "function");
    const analysis = manager?.getWindow?.("analyse-decision");
    const intelligence = manager?.getWindow?.("intelligence-memoire-creation");
    const collapsedResolvers = typeof analysis?.resolveCompactCollapsedDetails === "function" && typeof intelligence?.resolveCompactCollapsedDetails === "function";
    const representatives = !!document.getElementById("oracle-analysis-suite") && !!document.getElementById("atlas-local-ai-collapse");
    return {
      ok: bodyOk
        && wm?.build === "40.3.01"
        && wm?.docked_family_compact_representative === true
        && wm?.floating_family_minimize_uses_historical_minibar === true
        && configured && collapsedResolvers && representatives,
      detail:`body=${String(bodyOk)} · wm=${wm?.build || "—"} · compact=${String(wm?.docked_family_compact_representative === true)} · configured=${wins.length}/4:${String(configured)} · reps=${String(representatives)}`
    };
  }

  function astroPlanetColorContract40291() {
    const bodyOk = document.body?.classList?.contains("atlas-astro-planet-colors-40291") === true;
    const timeline = [...(document.querySelectorAll?.("#atlasAstroTimeline4055 .atlas-astro-hour-4055") || [])];
    const tones = new Set(timeline.map(node => String(node.dataset.planet40291 || "")).filter(Boolean));
    const expected = ["saturn","mars","sun","venus","mercury","moon","jupiter"];
    const allTones = expected.every(tone => tones.has(tone));
    const currentCard = document.getElementById("atlasAstroHour4055")?.closest?.("article");
    const nextCard = document.getElementById("atlasAstroNext4055")?.closest?.("article");
    return {
      ok: bodyOk && timeline.length === 24 && allTones && !!currentCard?.dataset?.planet40291 && !!nextCard?.dataset?.planet40291,
      detail:`body=${String(bodyOk)} · timeline=${timeline.length}/24 · tones=${tones.size}/7 · current=${currentCard?.dataset?.planet40291 || "—"} · next=${nextCard?.dataset?.planet40291 || "—"}`
    };
  }

  function semanticColorIconContract40290() {
    const body = document.body;
    const shortcuts = Number(document.querySelectorAll?.("#atlasAdminCommandBar .atlas-admin-shortcut-icon-40290")?.length || 0);
    const headings = Number(document.querySelectorAll?.(".atlas-icon-heading-40290 .atlas-heading-icon-40290")?.length || 0);
    const familyTones = ["analysis","intelligence","operations","system"].every(name => !!document.querySelector?.(`.atlas-layout-family-${name}`));
    const stylesheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-window-menu-uniform.css"));
    const classOk = body?.classList?.contains("atlas-semantic-color-icons-40290") === true;
    return {
      ok: classOk && shortcuts >= 6 && headings >= 11 && familyTones && !!stylesheet,
      detail:`body=${String(classOk)} · command-icons=${shortcuts}/6 · heading-icons=${headings}/11 · families=${String(familyTones)} · css=${String(!!stylesheet)}`
    };
  }

  function celestialRyzenBookContract40288() {
    const root=document.getElementById("atlasCelestialHandoff40288");
    const exportButton=document.getElementById("atlasCelestialExport40288");
    const importButton=document.getElementById("atlasCelestialImport40288");
    const api=globalThis.AgentCryptoCelestialPortable40288 || globalThis.AgentCryptoCelestialPortable40272;
    const sentinel=globalThis.__AGENT_CRYPTO_CELESTIAL_SENTINEL_40268__;
    const transport=api?.transport === "manual_shared_memory_json";
    const readonly=api?.read_only_on_book === true;
    const noGithub=api?.github_publication_required === false;
    const modelLocked=api?.oracle_model_input === false && api?.causal_claim === false;
    return {
      ok:!!root && !!exportButton && !!importButton && transport && readonly && noGithub && modelLocked && !!sentinel,
      detail:`ui=${String(!!root)} · export=${String(!!exportButton)} · import=${String(!!importButton)} · transport=${String(transport)} · bookRO=${String(readonly)} · github=${String(!noGithub?"required":"not-required")} · Oracle=${String(api?.oracle_model_input)}`
    };
  }

  function uniformMenuCssContract() {
    const sheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-window-menu-uniform.css"));
    if (!sheet) return { ok:false, detail:"uniform menu stylesheet absent" };
    const rows = [];
    const normalizeSelector = value => String(value || "")
      .trim()
      .replace(/^body\.atlas-administrator-mirror\s+/, "");
    const selectors = value => String(value || "")
      .split(",")
      .map(item => normalizeSelector(item))
      .filter(Boolean);
    const opacityIs = (value, expected) => {
      const number = Number.parseFloat(String(value || "").trim());
      return Number.isFinite(number) && Math.abs(number - expected) < 0.0001;
    };
    try {
      const walk = rules => {
        for (const rule of [...(rules || [])]) {
          if (rule.cssRules) { walk(rule.cssRules); continue; }
          if (rule.type !== CSSRule.STYLE_RULE) continue;
          rows.push({
            selector:String(rule.selectorText || ""),
            selectors:selectors(rule.selectorText),
            opacity:String(rule.style?.opacity || "").trim(),
            visibility:String(rule.style?.visibility || "").trim(),
            pointer:String(rule.style?.pointerEvents || "").trim()
          });
        }
      };
      walk(sheet.cssRules);
    } catch (_) {
      return { ok:false, detail:"uniform menu stylesheet CSSOM illisible" };
    }
    const has = (selector, expectedOpacity, extra = () => true) =>
      rows.some(row => row.selectors.includes(selector) && opacityIs(row.opacity, expectedOpacity) && extra(row));
    // One generic rule is the canonical owner for every five-button menu.
    // Do not require redundant per-window selectors when the generic selector
    // already covers Graphique, Target Top and Market Flow by construction.
    const base = has(".admin-native-control-host > .admin-native-controls", 0.16, row => row.visibility === "visible" && row.pointer === "auto");
    const reveal = has(".admin-native-control-host:hover > .admin-native-controls", 0.82);
    const direct = has(".admin-native-control-host > .admin-native-controls:hover", 1);
    const graphSpecific = has("#analyste.admin-native-control-host > .admin-native-controls", 0.16);
    const targetSpecific = has("#market-workspace .top5-ribbon.admin-native-control-host > .admin-native-controls", 0.16);
    const flowSpecific = has("#market-workspace .market-flow-ribbon.admin-native-control-host > .admin-native-controls", 0.16);
    const covered = base && reveal && direct;
    return {
      ok: covered,
      detail:`generic=${String(covered)} · rest=.16 · reveal=.82 · direct=1 · dedicated graph=${graphSpecific} target=${targetSpecific} flow=${flowSpecific} (informatifs)`
    };
  }

  function technicalReadingGlassContract() {
    const sheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-visual-assets.css"));
    if (!sheet) return { ok:false, detail:"admin-visual-assets.css CSSOM absent" };
    const rows = [];
    const selectors = value => String(value || "").split(",").map(item => item.trim()).filter(Boolean);
    const alpha = value => {
      const text = String(value || "").trim().toLowerCase();
      if (text === "transparent") return 0;
      const rgba = text.match(/rgba?\(([^)]+)\)/);
      if (!rgba) return null;
      const parts = rgba[1].split(",").map(item => item.trim());
      if (parts.length < 4) return 1;
      const valueAlpha = Number.parseFloat(parts[3]);
      return Number.isFinite(valueAlpha) ? valueAlpha : null;
    };
    try {
      for (const rule of [...sheet.cssRules]) {
        if (rule.type !== CSSRule.STYLE_RULE) continue;
        rows.push({
          selectors:selectors(rule.selectorText),
          backgroundColor:String(rule.style?.backgroundColor || "").trim(),
          backdrop:String(rule.style?.backdropFilter || "").trim(),
          webkitBackdrop:String(rule.style?.webkitBackdropFilter || "").trim()
        });
      }
    } catch (_) {
      return { ok:false, detail:"admin-visual-assets.css CSSOM illisible" };
    }
    const rootSelector = "body.atlas-administrator-mirror #detailPanel.clean-lens-detail-panel";
    const root = rows.find(row => row.selectors.includes(rootSelector)) || null;
    const inner = rows.find(row => row.selectors.includes("body.atlas-administrator-mirror #detailPanel .detail-panel-body")) || null;
    const surface = rows.find(row => row.selectors.includes("body.atlas-administrator-mirror #detailPanel .detail-panel-toggle")) || null;
    const rootAlpha = alpha(root?.backgroundColor);
    const innerAlpha = alpha(inner?.backgroundColor);
    const surfaceAlpha = alpha(surface?.backgroundColor);
    const inlineLegacy = !!byId("administrator-tech-reading-ultra-clear-39-7-1")
      || !!byId("administrator-tech-reading-near-zero-glass-39-8-0-r1");
    const ok = rootAlpha === 0
      && innerAlpha !== null && innerAlpha <= 0.0081
      && surfaceAlpha !== null && surfaceAlpha <= 0.0181
      && !inlineLegacy;
    return {
      ok,
      detail:`owner=admin-visual-assets.css · root=${rootAlpha ?? "—"} · inner=${innerAlpha ?? "—"} · surfaces=${surfaceAlpha ?? "—"} · inlineLegacy=${inlineLegacy}`
    };
  }

  function cryptoCardContract() {
    const layer = byId("atlasHelpLayer");
    const row = document.querySelector("[data-market-help-id]");
    const periodButton = document.querySelector(".period-btn[data-period]");
    const definition = row && typeof atlasMarketHelpDefinition === "function"
      ? safe(() => atlasMarketHelpDefinition(row), null)
      : null;
    const routedMarket = row && typeof atlasHelpTargetFromNode === "function"
      ? safe(() => atlasHelpTargetFromNode(row) === row, false)
      : false;
    const genericSuppressed = periodButton && typeof atlasHelpTargetFromNode === "function"
      ? safe(() => atlasHelpTargetFromNode(periodButton) === null, false)
      : false;

    let destructiveSharedHostRule = false;
    let interactiveMarketRule = false;
    let dockRailGeometryRule = false;
    let dockTopGeometryRule = false;
    let dockStickySurfaceRule = false;

    const walk = (rules, sheetName) => {
      for (const rule of [...(rules || [])]) {
        if (rule.cssRules) { walk(rule.cssRules, sheetName); continue; }
        const selector = String(rule.selectorText || "").trim();
        const selectorTokens = selector.split(",").map(item => item.trim());
        const display = String(rule.style?.display || "").trim().toLowerCase();
        const visibility = String(rule.style?.visibility || "").trim().toLowerCase();
        const pointerEvents = String(rule.style?.pointerEvents || "").trim().toLowerCase();

        if (sheetName === "admin-visual-assets.css"
            && /#atlasHelpLayer|\.atlas-help-layer/.test(selector)
            && (display === "none" || visibility === "hidden" || pointerEvents === "none")) {
          destructiveSharedHostRule = true;
        }

        if (sheetName !== "style.css") continue;

        if (selectorTokens.includes('.atlas-help-layer[data-market-help-coin-id]:not([hidden])')
            && pointerEvents === "auto") {
          interactiveMarketRule = true;
        }

        if (selectorTokens.includes('.market-workspace-grid.market-card-dock-active.math-dock-rail')) {
          const columns = String(rule.style?.gridTemplateColumns || "").replace(/\s+/g, " ").trim();
          dockRailGeometryRule = /980px/.test(columns) && /320px/.test(columns)
            && (/atlas-canonical-side-rail-width/.test(columns) || /64px/.test(columns));
        }

        if (selectorTokens.includes('.market-workspace-grid.market-card-dock-active:not(.math-dock-rail):not(.math-dock-side)')) {
          const columns = String(rule.style?.gridTemplateColumns || "").replace(/\s+/g, " ").trim();
          dockTopGeometryRule = /980px/.test(columns) && /320px/.test(columns);
        }

        if (selectorTokens.includes('#atlasMarketCardDockHost.atlas-market-card-dock-host')) {
          const position = String(rule.style?.position || "").trim().toLowerCase();
          const top = String(rule.style?.top || "").trim().toLowerCase();
          const minWidth = String(rule.style?.minWidth || "").trim().toLowerCase();
          const overflowY = String(rule.style?.overflowY || "").trim().toLowerCase();
          const overscroll = String(rule.style?.overscrollBehavior || "").trim().toLowerCase();
          const scrollbar = String(rule.style?.scrollbarGutter || "").trim().toLowerCase();
          dockStickySurfaceRule = position === "sticky" && top === "8px" && minWidth === "320px"
            && ["auto", "scroll"].includes(overflowY) && overscroll === "contain" && scrollbar === "stable";
        }
      }
    };

    for (const sheet of [...document.styleSheets]) {
      const name = pathOnly(sheet.href || "").split("/").pop() || "";
      if (name !== "admin-visual-assets.css" && name !== "style.css") continue;
      try { walk(sheet.cssRules, name); } catch (_) {}
    }

    const toolbarOk = !!definition?.marketCoinId
      && String(definition?.html || "").includes('data-market-card-mode="floating"')
      && String(definition?.html || "").includes('data-market-card-mode="dock"');

    const grid = byId("marketWorkspaceGrid");
    const dockActive = !!grid?.classList?.contains("market-card-dock-active");
    const dockHost = byId("atlasMarketCardDockHost");
    let dockRuntimeOk = true;
    let dockRuntimeDetail = "inactive";

    if (dockActive) {
      const market = byId("marketSnapshotPanel");
      const math = byId("math");
      const hostStyle = dockHost ? safe(() => getComputedStyle(dockHost), null) : null;
      const hostRect = dockHost ? safe(() => dockHost.getBoundingClientRect(), null) : null;
      const marketRect = market ? safe(() => market.getBoundingClientRect(), null) : null;
      const mathRect = math ? safe(() => math.getBoundingClientRect(), null) : null;
      const rail = !!grid?.classList?.contains("math-dock-rail");
      const visible = !!dockHost && !dockHost.hidden && hostStyle?.display !== "none" && hostStyle?.visibility !== "hidden";
      const sticky = hostStyle?.position === "sticky";
      const scrollable = ["auto", "scroll"].includes(String(hostStyle?.overflowY || "").toLowerCase());
      const hostWide = Number(hostRect?.width || 0) >= 319;
      const marketWide = Number(marketRect?.width || 0) >= 979;
      const horizontalOrder = !rail || (
        Number(marketRect?.right || 0) <= Number(hostRect?.left || 0) + 2
        && Number(hostRect?.right || 0) <= Number(mathRect?.left || 0) + 2
      );
      dockRuntimeOk = visible && sticky && scrollable && hostWide && marketWide && horizontalOrder;
      dockRuntimeDetail = `active · market=${Math.round(marketRect?.width || 0)}px · card=${Math.round(hostRect?.width || 0)}px · sticky=${String(sticky)} · scroll=${String(scrollable)} · order=${String(horizontalOrder)}`;
    }

    const sourceDockOk = dockRailGeometryRule && dockTopGeometryRule && dockStickySurfaceRule;
    const ok = !!layer && !!row && !!definition?.marketCoinId && toolbarOk
      && routedMarket && genericSuppressed && !destructiveSharedHostRule && interactiveMarketRule
      && sourceDockOk && dockRuntimeOk;

    return {
      ok,
      detail: `host=${String(!!layer)} · modes=${String(toolbarOk)} · route=${String(routedMarket)} · genericGate=${String(genericSuppressed)} · destructiveCss=${String(destructiveSharedHostRule)} · pointer=${String(interactiveMarketRule)} · dockCSS=${String(sourceDockOk)} · dockRuntime=${dockRuntimeDetail}`
    };
  }

  function destructiveMenuHideRules() {
    const hits = [];
    const walk = rules => {
      for (const rule of [...(rules || [])]) {
        if (rule.cssRules) { walk(rule.cssRules); continue; }
        const selector = String(rule.selectorText || "");
        const display = String(rule.style?.display || "").trim().toLowerCase();
        if (display !== "none") continue;
        if (/admin-native-controls/.test(selector) && /analyste|marketSnapshotPanel|top5-ribbon|market-flow-ribbon|#math|atlas-layout-family/.test(selector)) {
          hits.push(`${selector}{display:none}`);
        }
      }
    };
    for (const sheet of [...document.styleSheets]) {
      try { walk(sheet.cssRules); } catch (_) {}
    }
    return hits;
  }

  function technicalReadingGeometryOwnerContract() {
    const root = document.querySelector('#analyste.champagne-clean-lens');
    const chart = root?.querySelector(':scope > .chart-panel');
    const detail = root?.querySelector(':scope > #detailPanel.clean-lens-detail-panel');
    const body = detail?.querySelector(':scope > .detail-panel-body');
    if (!(root instanceof HTMLElement) || !(chart instanceof HTMLElement) || !(detail instanceof HTMLElement) || !(body instanceof HTMLElement)) {
      return { ok:false, detail:'ancrages Graphique/Lecture technique absents' };
    }

    const offenders = [];
    for (const sheet of [...document.styleSheets]) {
      const href = String(sheet.href || '');
      if (!href.includes('admin-visual-assets.css')) continue;
      let rules = [];
      try { rules = [...(sheet.cssRules || [])]; } catch (_) { continue; }
      const walk = list => {
        for (const rule of list) {
          if (rule.cssRules) { walk([...rule.cssRules]); continue; }
          const selector = String(rule.selectorText || '').replace(/\s+/g,' ').trim();
          const style = rule.style;
          if (!style) continue;
          const rootGeom = selector.endsWith('#analyste.champagne-clean-lens:not(.detail-collapsed)') ||
            selector.endsWith('#analyste.champagne-clean-lens:not(.detail-collapsed):not(.admin-native-direct-floating)');
          const chartGeom = /> \.chart-panel(?:\b|$)/.test(selector);
          const detailGeom = /> #detailPanel\.clean-lens-detail-panel/.test(selector);
          if (!(rootGeom || chartGeom || detailGeom)) continue;
          const geom = [
            'display','position','inset','top','right','bottom','left',
            'width','min-width','max-width','height','min-height','max-height',
            'padding-right','grid-template-columns','grid-template-rows','grid-column','grid-row',
            'justify-self','align-self'
          ];
          const used = geom.filter(name => String(style.getPropertyValue(name) || '').trim());
          if (used.length) offenders.push(`${selector} => ${used.join(',')}`);
        }
      };
      walk(rules);
    }

    const rootStyle = getComputedStyle(root);
    const detailStyle = getComputedStyle(detail);
    const bodyStyle = getComputedStyle(body);
    const padRight = parseFloat(rootStyle.paddingRight || '0') || 0;
    const runtimeOk =
      rootStyle.display === 'block' &&
      rootStyle.position === 'relative' &&
      padRight > 0 &&
      detailStyle.position === 'absolute' &&
      detailStyle.top === '0px' &&
      detailStyle.bottom === '0px' &&
      detailStyle.height !== 'auto' &&
      (bodyStyle.overflowY === 'auto' || bodyStyle.overflowY === 'scroll');

    return {
      ok: offenders.length === 0 && runtimeOk,
      detail: offenders.length
        ? offenders.join(' · ')
        : `Mirror local actif · root=${rootStyle.display}/${rootStyle.position} · dock=${detailStyle.position} · scroll=${bodyStyle.overflowY}`
    };
  }

  function directFixedGeometryOwnerContract() {
    const managerContract = globalThis.ErithAdminWindowManager?.contract || {};
    const rows = [
      ["graphique", byId("analyste")],
      ["target-top", document.querySelector("#market-workspace .top5-ribbon")],
      ["market-flow", document.querySelector("#market-workspace .market-flow-ribbon")],
      ["math-core", byId("math")]
    ].map(([id, node]) => {
      if (!(node instanceof HTMLElement)) return { id, present:false, floating:false, ok:false, detail:"absent" };
      const floating = node.classList.contains("admin-native-direct-floating");
      const style = getComputedStyle(node);
      const priority = property => node.style.getPropertyPriority(property) === "important";
      const runtimeOk = !floating || (
        String(style.position || "").toLowerCase() === "fixed"
        && priority("position")
        && priority("left")
        && priority("top")
        && priority("width")
        && priority("height")
        && priority("z-index")
      );
      return {
        id,
        present:true,
        floating,
        ok:runtimeOk,
        detail:floating
          ? `${style.position} · inline!important pos=${priority("position")} xy=${priority("left") && priority("top")} wh=${priority("width") && priority("height")} z=${priority("z-index")}`
          : "docked"
      };
    });
    const contractOk =
      managerContract.build === WINDOW_MANAGER_SOURCE_BUILD
      && managerContract.direct_fixed_position_owner === "inline-important"
      && managerContract.direct_fixed_geometry_owner === "inline-important"
      && managerContract.direct_fixed_z_order_owner === "inline-important"
      && managerContract.direct_fixed_dock_css_override_safe === true;
    return {
      ok: contractOk && rows.every(row => row.present && row.ok),
      detail:`contract=${String(contractOk)} · manager=${String(managerContract.build || "—")} · source attendu=${WINDOW_MANAGER_SOURCE_BUILD} · ${rows.map(row => `${row.id}:${row.detail}`).join(" · ")}`
    };
  }

  function detachDragContinuityContract() {
    const managerContract = globalThis.ErithAdminWindowManager?.contract || {};
    const ok =
      managerContract.build === WINDOW_MANAGER_SOURCE_BUILD
      && managerContract.drag_pointer_event_owner === "window-capture-phase"
      && managerContract.drag_reparent_continuity === true
      && managerContract.drag_pointer_capture_reacquire === true
      && managerContract.drag_single_gesture_detach_move === true;
    return {
      ok,
      detail: ok
        ? "window capture-phase · reparent-safe · capture reacquire · one gesture"
        : `manager=${String(managerContract.build || "—")} / source attendu=${WINDOW_MANAGER_SOURCE_BUILD} · owner=${String(managerContract.drag_pointer_event_owner || "—")} · reparent=${String(managerContract.drag_reparent_continuity)} · reacquire=${String(managerContract.drag_pointer_capture_reacquire)} · oneGesture=${String(managerContract.drag_single_gesture_detach_move)}`
    };
  }

  function marketFlowFloatParityContract() {
    const flow = document.querySelector("#market-workspace .market-flow-ribbon");
    const target = document.querySelector("#market-workspace .top5-ribbon");
    const viewport = flow?.querySelector(":scope > .market-flow-viewport") || null;
    const ribbonSheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-ribbons.css"));
    const windowSheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-windows.css"));
    if (!flow || !target || !viewport || !ribbonSheet || !windowSheet) {
      return { ok:false, detail:"ancrage Market Flow / Target Top / viewport ou stylesheet absent" };
    }

    let flowGlobalPosition = "";
    let dockedRelative = false;
    let directFixedOwner = false;
    let floatingViewportRule = false;
    const inspect = (sheet, kind) => {
      const walk = rules => {
        for (const rule of [...(rules || [])]) {
          if (rule.cssRules) { walk(rule.cssRules); continue; }
          if (rule.type !== CSSRule.STYLE_RULE) continue;
          const selector = String(rule.selectorText || "").replace(/\s+/g," ").trim();
          const position = String(rule.style?.position || "").trim().toLowerCase();
          if (kind === "ribbons") {
            if (selector === "#market-workspace .market-flow-ribbon") flowGlobalPosition = position;
            if (selector.includes(".market-flow-ribbon:not(.admin-native-direct-floating)") && position === "relative") dockedRelative = true;
            if (selector.includes(".market-flow-ribbon.admin-native-direct-floating > .market-flow-viewport")
                && String(rule.style?.overflow || "").trim().toLowerCase() === "hidden") floatingViewportRule = true;
          }
          if (kind === "windows" && selector.split(",").map(x => x.trim()).includes(".admin-native-direct-floating") && position === "fixed") {
            directFixedOwner = true;
          }
        }
      };
      try { walk(sheet.cssRules); } catch (_) {}
    };
    inspect(ribbonSheet, "ribbons");
    inspect(windowSheet, "windows");

    const flowFloating = flow.classList.contains("admin-native-direct-floating");
    const targetFloating = target.classList.contains("admin-native-direct-floating");
    const flowStyle = getComputedStyle(flow);
    const viewportStyle = getComputedStyle(viewport);
    const targetPosition = String(getComputedStyle(target).position || "").toLowerCase();
    const flowPosition = String(flowStyle.position || "").toLowerCase();
    const flowHeight = Math.round(flow.getBoundingClientRect().height || 0);
    const viewportWidth = Math.round(viewport.getBoundingClientRect().width || 0);
    const flowWidth = Math.round(flow.getBoundingClientRect().width || 0);
    const runtimeOk = !flowFloating || (
      flowPosition === "fixed"
      && Math.abs(flowHeight - 54) <= 2
      && viewportStyle.overflowX === "hidden"
      && viewportWidth <= flowWidth + 2
    );
    const targetReferenceOk = !targetFloating || targetPosition === "fixed";
    const ok = flowGlobalPosition !== "relative" && dockedRelative && directFixedOwner
      && floatingViewportRule && runtimeOk && targetReferenceOk;
    return {
      ok,
      detail:`globalFlowPosition=${flowGlobalPosition || "unset"} · dockedRelative=${dockedRelative} · fixedOwner=${directFixedOwner} · viewportRule=${floatingViewportRule} · flow=${flowFloating ? `${flowPosition}/${flowHeight}px` : "docked"} · viewport=${viewportWidth}px/${flowWidth}px · target=${targetFloating ? targetPosition : "docked"}`
    };
  }

  function marketSnapshotBodyPortalContract() {
    const shell = document.querySelector('[data-admin-native-shell="market"]');
    if (!shell) {
      return { ok: true, detail: "docked · shell flottante absente (portal body prêt)" };
    }
    const parentIsBody = shell.parentElement === document.body;
    const position = String(getComputedStyle(shell).position || "").toLowerCase();
    const z = Number.parseInt(getComputedStyle(shell).zIndex || "0", 10) || 0;
    return {
      ok: parentIsBody && position === "fixed",
      detail: `parent=${shell.parentElement === document.body ? "body" : shell.parentElement?.id || shell.parentElement?.tagName || "—"} · position=${position || "—"} · z=${z}`
    };
  }

  function globalFloatingShellContract() {
    const managerContract = globalThis.ErithAdminWindowManager?.contract || null;
    const managerOk = managerContract?.default_shell_portal === "document.body"
      && managerContract?.dock_restore === "layout-preserving-placeholder-original-parent"
      && managerContract?.layout_preserving_placeholders === true
      && managerContract?.reserved_placeholder_css_zero_override === false
      && managerContract?.multi_node_geometry === "visible-node-union"
      && managerContract?.floating_shell_auto_fit === "first-detach-height-only-40342"
      && managerContract?.floating_shell_height_cap === "viewport-minus-24px"
      && managerContract?.floating_shell_saved_geometry_respected === true
      && managerContract?.direct_fixed_auto_fit === false
      && managerContract?.floating_shell_z_order === "global-body";

    const sheet = [...document.styleSheets].find(item => pathOnly(item.href || "").endsWith("/admin-windows.css"));
    let horizontalCssOwner = false;
    let reservedPlaceholderCssOwner = false;
    let forbiddenReservedZeroRule = false;
    if (sheet) {
      try {
        for (const rule of [...sheet.cssRules]) {
          if (rule.type !== CSSRule.STYLE_RULE) continue;
          const selector = String(rule.selectorText || "").replace(/\s+/g, " ").trim();
          if (selector === ".admin-native-floating-shell .admin-native-controls-floating") {
            const display = String(rule.style?.display || "").trim().toLowerCase();
            const direction = String(rule.style?.flexDirection || "").trim().toLowerCase();
            const wrap = String(rule.style?.flexWrap || "").trim().toLowerCase();
            horizontalCssOwner = display === "flex" && (direction === "row" || direction === "") && wrap === "nowrap";
          }
          if (selector === '.admin-native-placeholder[data-admin-native-placeholder-reserved="1"]') {
            const display = String(rule.style?.display || "").trim().toLowerCase();
            const visibility = String(rule.style?.visibility || "").trim().toLowerCase();
            reservedPlaceholderCssOwner = display === "block" && visibility === "hidden";
          }
          if (selector.includes(".admin-native-placeholder")
            && !selector.includes(':not([data-admin-native-placeholder-reserved="1"])')
            && String(rule.style?.height || "").trim() === "0px"
            && String(rule.style?.getPropertyPriority?.("height") || "").toLowerCase() === "important") {
            forbiddenReservedZeroRule = true;
          }
        }
      } catch (_) {}
    }

    const shells = [...document.querySelectorAll(".admin-native-floating-shell")];
    const rows = shells.map(shell => {
      const controls = shell.querySelector(":scope > .admin-native-floating-titlebar > .admin-native-controls-floating");
      const shellStyle = getComputedStyle(shell);
      const controlStyle = controls ? getComputedStyle(controls) : null;
      const buttons = controls ? [...controls.querySelectorAll(":scope > .admin-native-control")] : [];
      const id = String(shell.dataset.adminNativeShell || "—");
      const placeholders = [...document.querySelectorAll(`[data-admin-native-placeholder="${CSS.escape(id)}"]`)];
      const reserved = placeholders.filter(marker => marker.dataset.adminNativePlaceholderReserved === "1");
      const reservationOk = reserved.length > 0 && reserved.every(marker => {
        const rect = marker.getBoundingClientRect();
        const style = getComputedStyle(marker);
        return rect.height > 0
          && String(style.display || "").toLowerCase() !== "none"
          && String(style.visibility || "").toLowerCase() === "hidden";
      });
      const parentBody = shell.parentElement === document.body;
      const fixed = String(shellStyle.position || "").toLowerCase() === "fixed";
      const horizontal = !!controlStyle
        && String(controlStyle.display || "").toLowerCase() === "flex"
        && String(controlStyle.flexDirection || "row").toLowerCase() === "row"
        && buttons.length === 5;
      return {
        id,
        parentBody,
        fixed,
        horizontal,
        buttons: buttons.length,
        placeholders: placeholders.length,
        reserved: reserved.length,
        reservationOk,
        sizing: String(shell.dataset.adminNativeShellSizing || "—"),
        naturalHeight: Number(shell.dataset.adminNativeShellNaturalHeight || 0),
        fittedHeight: Number(shell.dataset.adminNativeShellFittedHeight || 0),
        viewportClamped: String(shell.dataset.adminNativeShellViewportClamped || "—")
      };
    });
    const runtimeOk = rows.every(row => row.parentBody && row.fixed && row.horizontal && row.reservationOk);
    const cssReservationOk = reservedPlaceholderCssOwner && !forbiddenReservedZeroRule;
    return {
      ok: managerOk && horizontalCssOwner && cssReservationOk && runtimeOk,
      detail: `managerBodyDefault=${managerOk} · horizontalCss=${horizontalCssOwner} · reservedPlaceholderCss=${cssReservationOk} · forbiddenZero=${forbiddenReservedZeroRule} · shells=${rows.length}${rows.length ? " · " + rows.map(row => `${row.id}:body=${row.parentBody}/fixed=${row.fixed}/horizontal=${row.horizontal}/5=${row.buttons}/spacers=${row.reserved}/${row.placeholders}/layout=${row.reservationOk}/size=${row.sizing}${row.naturalHeight ? `:${row.fittedHeight}/${row.naturalHeight}` : ""}`).join(" · ") : " · aucune shell ouverte"}`
    };
  }

  function canonicalModuleFilenameContract() {
    const forbidden = [
      /\/js\/market-memory-\d/i,
      /\/js\/analytical-memory-\d/i,
      /\/js\/decision-board-dual-memory-\d/i,
      /\/js\/retrospective-validation-\d/i,
      /\/js\/multi-collector-concordance-\d/i,
      /\/js\/memory-health-audit-\d/i
    ];
    const legacy = scriptRows()
      .map(row => pathOnly(row.raw))
      .filter(path => forbidden.some(rx => rx.test(path)));
    return {
      ok: legacy.length === 0,
      legacy,
      detail: legacy.length ? `anciens noms actifs: ${legacy.join(" · ")}` : "noms fonctionnels canoniques uniquement"
    };
  }

  function derive() {
    const build = runtimeBuild();
    const token = runtimeToken();
    const truth = runtimeTruth();
    const cache = versionedLocalScripts();
    const styles = versionedAdminStyles();
    const order = scriptOrder();
    const health = memoryHealth();
    const multi = multiCollector();
    const healthContract = globalThis.__AGENT_CRYPTO_MEMORY_HEALTH_3980R2__ || null;
    const multiContract = globalThis.__AGENT_CRYPTO_MULTI_COLLECTOR_3970__ || null;
    const layoutContract = globalThis.__AGENT_CRYPTO_LAYOUT_REPAIR_3990R2__ || null;
    const layoutState = safe(globalThis.atlasAdministratorLayoutRepair3990R2?.repair, null);
    const board = byId("decision-board");
    const primaryMemory = byId("decisionMemoryV2");
    const dualMemory = byId("decisionDualMemory395");
    const retro = byId("decisionRetrospective3960");
    const auxHost = byId("decisionAuxMemoryPanels3990R2");
    const directMemoryRoots = board ? [...board.children].filter(node => node.classList?.contains("decision-memory-v2")) : [];
    const bodyBuild = String(document.body?.dataset?.administratorBuild || "").trim();
    const rootBuild = String(document.documentElement?.dataset?.administratorBuild || "").trim();

    const graphChrome = directControlState(byId("analyste"));
    const targetChrome = directControlState(document.querySelector("#market-workspace .top5-ribbon"));
    const flowChrome = directControlState(document.querySelector("#market-workspace .market-flow-ribbon"));
    const marketChrome = directControlState(byId("marketSnapshotPanel"));
    const mathChrome = directControlState(byId("math"));
    const familyChromeHosts = [...document.querySelectorAll(".atlas-layout-family.admin-native-control-host")];
    const familyChromes = familyChromeHosts.map(host => ({
      title: String(host.dataset.adminNativeTitle || host.querySelector("h2")?.textContent || "famille").trim(),
      state: directControlState(host)
    }));
    const visibleFamilyChromes = familyChromes.filter(row => row.state?.rendered === true);
    const familyChromeDomOk = familyChromes.length >= 4 && familyChromes.every(row => !!row.state && row.state.complete);
    // In Vue normale the family separators are intentionally display:none.
    // Hidden geometry is not measurable (0 px) and must not be reported as clipping.
    const familyChromeLayoutOk = familyChromeDomOk && visibleFamilyChromes.every(row =>
      row.state.interactive && row.state.layoutOk
    );
    const chromeCss = canonicalChromeCssContract();
    const uniformMenuCss = uniformMenuCssContract();
    const cryptoCard = cryptoCardContract();
    const graphStability = globalThis.__ATLAS_GRAPH_STABILITY_40122__ || null;
    const verticalBars = globalThis.__ATLAS_VERTICAL_BAR_RENDERER_40149__ || null;
    const oracleV1 = globalThis.__ATLAS_ORACLE_V1_40149__ || null;
    const forbiddenOverrides = styleRows().filter(row => /admin-window-(?:controls-recovery|hover-ghost-contract)-40\.0\.0R[12]\.css/i.test(pathOnly(row.raw)));

    const checks = [
      check("Build runtime", build === BUILD_CURRENT, `ATLAS_BUILD=${build || "—"}`),
      check("Token runtime", token === TOKEN_CURRENT, `ATLAS_ASSET_TOKEN=${token || "—"}`),
      check("Runtime Truth", !!truth && truth.pass === true, truth ? `pass=${String(truth.pass)} · app=${truth.app_build || "—"} · html=${truth.html_build || "—"}` : "runtime truth indisponible"),
      check("Meta atlas-build", meta("atlas-build") === BUILD_CURRENT, `meta=${meta("atlas-build") || "—"}`),
      check("Meta administrator-build", meta("administrator-build") === BUILD_CURRENT, `meta=${meta("administrator-build") || "—"}`),
      check("Meta asset token", meta("atlas-asset-token") === TOKEN_CURRENT, `meta=${meta("atlas-asset-token") || "—"}`),
      check("Engine lock", meta("atlas-engine-build") === ENGINE_CURRENT, `engine=${meta("atlas-engine-build") || "—"}`),
      check("DOM build identity", bodyBuild === BUILD_CURRENT || rootBuild === BUILD_CURRENT, `body=${bodyBuild || "—"} · html=${rootBuild || "—"}`),
      check("Cache-busters JS", cache.stale.length === 0 && cache.rows.length === 12, cache.stale.length ? `${cache.stale.length} script(s) local(aux) avec version obsolète` : `${cache.rows.length} script(s) locaux alignés`),
      check("Cache-busters CSS admin", styles.every(row => row.count === 1 && row.current), styles.map(row => `${row.name}:${row.count === 1 && row.current ? "OK" : row.raw}`).join(" · ")),
      check("Ordre des scripts", order.unique && order.ordered, order.unique ? (order.ordered ? "12/12 scripts uniques dans l’ordre canonique" : "ordre de chargement non canonique") : "script absent ou dupliqué"),
      check("Noms modules canoniques", canonicalModuleFilenameContract().ok, canonicalModuleFilenameContract().detail),
      check("Market Memory 39.4.4R1", typeof globalThis.atlasMarketMemoryStats3944R1 === "function" && hasScriptSuffix("/js/market-memory-collector.js"), "API stats + script unique"),
      check("Core identité/temps mémoire", typeof atlasMemoryCanonicalSnapshotId === "function" && typeof atlasMemoryRecordTime === "function", "résolveurs canoniques du Core disponibles"),
      check("Analytical Memory 39.4", typeof globalThis.atlasAnalyticalMemoryStats394 === "function" && hasScriptSuffix("/js/analytical-memory.js"), "API stats + script unique"),
      check("Dual Memory 39.5", !!globalThis.atlasDecisionBoardDualMemory3950 && hasScriptSuffix("/js/decision-board.js"), "API + script unique"),
      check("Retrospective 39.6", hasScriptSuffix("/js/retrospective-validation.js"), "script unique · état de données non bloquant"),
      check("Multi-Collector 39.7", !!globalThis.atlasMultiCollectorConcordance3970 && hasScriptSuffix("/js/multi-collector-concordance.js"), "API + script unique"),
      check("Contrat Multi-Collector", readOnlyContractOk(multiContract), multiContract ? "lecture seule vérifiée" : "sentinelle absente"),
      check("Memory Health 39.8.0R2", !!globalThis.atlasMemoryHealth3980R2 && hasScriptSuffix("/js/memory-health-audit.js"), "Truth Repair API + script unique"),
      check("Contrat Memory Health", readOnlyContractOk(healthContract) && healthContract.verdicts_separated === true, healthContract ? "lecture seule + verdicts séparés" : "sentinelle absente"),
      check("Ancien Memory Health retiré", countScriptSuffix("/js/memory-health-audit-39.8.0.js") === 0, "aucun doublon du lecteur 39.8.0 initial"),
      check("Window Manager", hasScriptSuffix("/js/core/admin-window-manager.js"), "script unique"),
      check("Workspace Profiles · visual-only API",
        typeof globalThis.ErithAdministratorWindows?.snapshot === "function"
          && typeof globalThis.ErithAdministratorWindows?.applySnapshot === "function"
          && globalThis.ErithAdministratorWorkspaceProfiles?.schema === "agent_crypto_workspace_profile_v1"
          && typeof globalThis.ErithAdministratorWorkspaceProfiles?.exportSelected === "function"
          && typeof globalThis.ErithAdministratorWorkspaceProfiles?.importPortable === "function"
          && typeof globalThis.ErithAdministratorWorkspaceProfiles?.exportLibrary === "function"
          && typeof globalThis.ErithAdministratorWorkspaceProfiles?.importLibrary === "function"
          && !!byId("adminWorkspaceProfilesToggle")
          && !!byId("adminWorkspaceProfilesPanel"),
        "snapshot/apply + profils IndexedDB + transfert JSON · V7 non propriétaire"),
      check("Storage Lineage V2 · read-only",
        globalThis.AtlasStorageLineage40224?.automatic_cleanup === false
          && globalThis.AtlasStorageLineage40224?.deletion_enabled === false
          && !!byId("btnAtlasStorageLineage40224")
          && !!byId("atlasStorageLineage40224"),
        "audit opérateur différé · aucune suppression automatique"),
      check("Storage Lineage Decision 40.2.28",
        globalThis.ErithStorageLineageDecisionContract40228?.operator_triggered_only === true
          && globalThis.ErithStorageLineageDecisionContract40228?.read_only === true
          && globalThis.ErithStorageLineageDecisionContract40228?.automatic_boot_scan === false
          && globalThis.ErithStorageLineageDecisionContract40228?.deletion_enabled === false
          && globalThis.ErithStorageLineageDecisionContract40228?.retirement_gate === "CLOSED"
          && globalThis.ErithStorageLineageDecisionContract40228?.no_exact_reference_is_not_retirement_proof === true
          && globalThis.AtlasStorageLineageDecision40228?.deletion_enabled === false
          && globalThis.AtlasStorageLineageDecision40228?.retirement_gate === "CLOSED",
        "audit décisionnel opérateur · ACTIVE/LEGACY/MIGRATED/REVIEW · RETIRABLE_PROVEN fermé · aucune suppression"),
      check("Storage Ownership Proof 40.2.29",
        globalThis.ErithStorageOwnershipProofContract40229?.operator_triggered_only === true
          && globalThis.ErithStorageOwnershipProofContract40229?.read_only === true
          && globalThis.ErithStorageOwnershipProofContract40229?.automatic_boot_scan === false
          && globalThis.ErithStorageOwnershipProofContract40229?.deletion_enabled === false
          && globalThis.ErithStorageOwnershipProofContract40229?.retirement_gate === "CLOSED"
          && globalThis.ErithStorageOwnershipProofContract40229?.positive_owner_proof_only === true
          && globalThis.ErithStorageOwnershipProofContract40229?.unresolved_absence_is_not_non_ownership_proof === true
          && globalThis.AtlasStorageOwnershipProof40229?.deletion_enabled === false
          && globalThis.AtlasStorageOwnershipProof40229?.retirement_gate === "CLOSED",
        "preuve positive de propriété uniquement · REVIEW conservateur · RETIRABLE_PROVEN fermé · aucune suppression"),
      check("Visual Continuity 40.2.30",
        globalThis.ErithVisualContinuityContract40230?.visual_only === true
          && globalThis.ErithVisualContinuityContract40230?.existing_repository_assets_only === true
          && globalThis.ErithVisualContinuityContract40230?.technical_portrait_complete_foreground_preserved === true
          && globalThis.ErithVisualContinuityContract40230?.technical_portrait_letterbox_backdrop_fill === true
          && globalThis.ErithVisualContinuityContract40230?.intelligence_family_emblem_added === true
          && globalThis.ErithVisualContinuityContract40230?.oracle_model_modified === false
          && globalThis.ErithVisualContinuityContract40230?.window_manager_modified === false
          && globalThis.ErithVisualContinuity40230?.visual_only === true
          && Boolean(document.querySelector('.atlas-layout-family-intelligence .admin-family-emblem-r3[data-for="intelligence-40230"]'))
          && document.getElementById("detailPanel")?.classList.contains("atlas-tech-letterbox-fill-40230") === true,
        "portrait complet conservé · letterbox rempli par le même asset temporel · famille 02 illustrée · aucun moteur touché"),
      check("Oracle V2 Evaluation Gate 40.2.31",
        globalThis.ErithOracleV2EvaluationContract40231?.operator_triggered_only === true
          && globalThis.ErithOracleV2EvaluationContract40231?.read_only === true
          && globalThis.ErithOracleV2EvaluationContract40231?.same_t0_required === true
          && globalThis.ErithOracleV2EvaluationContract40231?.prospective_shadow_only === true
          && globalThis.ErithOracleV2EvaluationContract40231?.automatic_promotion === false
          && globalThis.ErithOracleV2EvaluationContract40231?.model_weights_changed === false
          && globalThis.ErithOracleV2EvaluationContract40231?.oracle_v1_changed === false
          && globalThis.ErithOracleV2EvaluationContract40231?.shadow_snapshot_changed === false
          && globalThis.AtlasOracleV2Evaluation40231?.read_only === true
          && globalThis.AtlasOracleV2Evaluation40231?.automatic_promotion === false
          && globalThis.AtlasOracleV2Evaluation40231?.model_weights_changed === false
          && Boolean(document.getElementById("atlasOracleV2EvaluationGate40231"))
          && Boolean(document.getElementById("btnAtlasOracleV2Eval40231")),
        "audit opérateur same-T0 · prospectif Shadow · V1/ENS/naïf comparables · aucun retuning · promotion bloquée"),
      check("Oracle Verdict Hierarchy 40.2.32A",
        globalThis.ErithOracleVerdictHierarchyContract40232A?.visual_only === true
          && globalThis.ErithOracleVerdictHierarchyContract40232A?.existing_oracle_values_only === true
          && globalThis.ErithOracleVerdictHierarchyContract40232A?.oracle_model_modified === false
          && globalThis.ErithOracleVerdictHierarchyContract40232A?.network_request_added === false
          && Boolean(document.getElementById("atlasOracleV0")),
        "hiérarchie verdict uniquement · valeurs Oracle existantes · aucun moteur touché"),
      check("Oracle Time Field 40.2.32B",
        globalThis.ErithOracleTimeFieldContract40232B?.visual_only === true
          && globalThis.ErithOracleTimeFieldContract40232B?.historical_now_scenario_emphasis === true
          && globalThis.ErithOracleTimeFieldContract40232B?.canvas_data_unchanged === true
          && globalThis.ErithOracleTimeFieldContract40232B?.forecast_math_changed === false,
        "historique/NOW/scénario renforcés · données canvas et calculs inchangés"),
      check("Oracle Information Hierarchy 40.2.32C",
        globalThis.ErithOracleInformationHierarchyContract40232C?.visual_only === true
          && globalThis.ErithOracleInformationHierarchyContract40232C?.same_dom_content === true
          && globalThis.ErithOracleInformationHierarchyContract40232C?.operator_context_lab_levels === true
          && globalThis.ErithOracleInformationHierarchyContract40232C?.oracle_model_modified === false,
        "opérateur/context/lab hiérarchisés · mêmes données et mêmes nœuds métier"),
      check("Oracle Runtime Stethoscope 40.2.32D",
        globalThis.ErithOracleRuntimeStethoscopeContract40232D?.passive_read_only === true
          && globalThis.ErithOracleRuntimeStethoscopeContract40232D?.existing_state_only === true
          && globalThis.ErithOracleRuntimeStethoscopeContract40232D?.timer_added === false
          && globalThis.ErithOracleRuntimeStethoscopeContract40232D?.network_request_added === false
          && globalThis.AtlasOracleRuntimeStethoscope40232D?.passive === true
          && Boolean(document.getElementById("atlasOracleRuntimeStethoscope40232D")),
        "stéthoscope passif · états existants uniquement · aucun poller/socket/moteur ajouté"),
      check("Oracle Operator Visual Stack 40.2.32",
        globalThis.ErithOracleOperatorVisualStackContract40232?.cumulative === true
          && globalThis.ErithOracleOperatorVisualStackContract40232?.code_only === true
          && globalThis.ErithOracleOperatorVisualStackContract40232?.image_generation_added === false
          && globalThis.ErithOracleOperatorVisualStackContract40232?.oracle_model_modified === false
          && globalThis.ErithOracleOperatorVisualStackContract40232?.window_manager_modified === false,
        "A+B+C+D cumulés · CODE ONLY · aucun modèle, Evidence ou Window Manager modifié"),
      check("Oracle Operator Console Final 40.2.33",
        globalThis.ErithOracleOperatorConsoleFinalContract40233?.final_lock === true
          && globalThis.ErithOracleOperatorConsoleFinalContract40233?.fit_overflow_contrast_only === true
          && globalThis.ErithOracleOperatorConsoleFinalContract40233?.inherits_cumulative_40_2_32 === true
          && globalThis.ErithOracleOperatorConsoleFinalContract40233?.code_only === true
          && globalThis.ErithOracleOperatorConsoleFinalContract40233?.oracle_model_modified === false
          && globalThis.ErithOracleOperatorConsoleFinalContract40233?.window_manager_modified === false,
        "final fit/overflow/contraste · cumulative A-D préservée · aucun comportement métier ajouté"),
      check("News-to-Market Causal Role 40.2.34",
        globalThis.ErithNewsToMarketCausalRoleContract40234?.deterministic_local === true
          && globalThis.ErithNewsToMarketCausalRoleContract40234?.existing_news_archive_only === true
          && globalThis.ErithNewsToMarketCausalRoleContract40234?.existing_market_state_only === true
          && globalThis.ErithNewsToMarketCausalRoleContract40234?.causal_claim_allowed === false
          && globalThis.ErithNewsToMarketCausalRoleContract40234?.external_ai_required === false
          && globalThis.ErithNewsToMarketCausalRoleContract40234?.new_network_request_added === false
          && globalThis.ErithNewsToMarketCausalRoleContract40234?.timer_added === false
          && globalThis.AtlasNewsToMarketCausalRole40234?.deterministic === true
          && globalThis.AtlasNewsToMarketCausalRole40234?.causal_claim === false
          && Boolean(document.getElementById("newsMarketDrivers40234")),
        "catalyseur/amplificateur/flux/réaction séparés · causalité toujours non établie · archive+marché existants uniquement · zéro IA/réseau/timer"),
      check("News-to-Market Operator Intelligence 40.2.35",
        globalThis.ErithNewsToMarketOperatorIntelligenceContract40235?.deterministic_local === true
          && globalThis.ErithNewsToMarketOperatorIntelligenceContract40235?.explanatory_layer_added === true
          && globalThis.ErithNewsToMarketOperatorIntelligenceContract40235?.causal_claim_allowed === false
          && globalThis.AtlasNewsToMarketOperatorIntelligence40235?.external_ai_used === false
          && Boolean(document.getElementById("newsMarketOperatorIntelligence40235")),
        "faits + mécanisme + ce que cela explique/n’explique pas + contexte demande + verdict · aucune IA externe"),

      check("Event Reaction Timeline 40.2.36",
        globalThis.ErithEventReactionTimelineContract40236?.local_chart_cache_only === true
          && globalThis.ErithEventReactionTimelineContract40236?.fetch_added === false
          && globalThis.ErithEventReactionTimelineContract40236?.causality_inferred === false
          && globalThis.AtlasNewsMarketReactionTimeline40236?.local_cache_only === true
          && Boolean(document.getElementById("newsMarketReactionTimeline40236")),
        "T−15/T0/+15/+1h/+4h depuis cache historique existant · aucun fetch · causalité non inférée"),

      check("Role Evidence Quality 40.2.37",
        globalThis.ErithRoleEvidenceQualityContract40237?.role_quality_not_causal_probability === true
          && globalThis.ErithRoleEvidenceQualityContract40237?.causal_probability_calculated === false
          && globalThis.AtlasNewsMarketRoleQuality40237?.causal_probability_calculated === false
          && Boolean(document.getElementById("newsMarketRoleQuality40237")),
        "solidité transparente du rôle · probabilité de causalité NON CALCULÉE"),

      check("Cross-Layer Market Explanation 40.2.38",
        globalThis.ErithCrossLayerMarketExplanationContract40238?.independent_layers_preserved === true
          && globalThis.ErithCrossLayerMarketExplanationContract40238?.news_market_oracle_atlas_compared_not_fused === true
          && globalThis.ErithCrossLayerMarketExplanationContract40238?.causal_claim_allowed === false
          && globalThis.AtlasNewsMarketCrossLayer40238?.independent_layers === true
          && Boolean(document.getElementById("newsMarketCrossLayer40238")),
        "News + réaction + marché + Oracle + Atlas comparés sans fusion/recalibrage · convergence descriptive seulement"),

      check("Oracle News Context Integration 40.2.39",
        globalThis.ErithOracleNewsContextIntegrationContract40239?.source_of_truth === "news-sentinel"
          && globalThis.ErithOracleNewsContextIntegrationContract40239?.oracle_forecast_math_changed === false
          && globalThis.AtlasOracleNewsContextIntegration40239?.compact_summary_only === true,
        "contrat historique 40.2.39 conservé · résumé Oracle volontairement démonté par 40.2.41 · calcul Oracle inchangé"),

      check("News-to-Market Final Lock 40.2.40",
        globalThis.ErithNewsToMarketFinalLockContract40240?.final_lock === true
          && globalThis.ErithNewsToMarketFinalLockContract40240?.css_fit_overflow_responsive_only === true
          && globalThis.ErithNewsToMarketFinalLockContract40240?.new_intelligence_added === false
          && globalThis.ErithNewsToMarketFinalLockContract40240?.oracle_v2_changed === false
          && globalThis.ErithNewsToMarketFinalLockContract40240?.window_manager_modified === false,
        "final fit/overflow/responsive · cumulative 40.2.35→40.2.39 préservée · aucun moteur modifié"),


      check("Oracle Restore + News Report Placement 40.2.41",
        globalThis.ErithOracleRestoreNewsPlacementContract40241?.corrective_layout === true
          && globalThis.ErithOracleRestoreNewsPlacementContract40241?.oracle_news_context_unmounted === true
          && globalThis.ErithOracleRestoreNewsPlacementContract40241?.oracle_operator_outer_frame_removed === true
          && globalThis.ErithOracleRestoreNewsPlacementContract40241?.news_report_moved_to_dedicated_news_accordion === true
          && globalThis.ErithOracleRestoreNewsPlacementContract40241?.image_generation_added === false
          && globalThis.ErithOracleRestoreNewsPlacementContract40241?.oracle_model_modified === false
          && globalThis.ErithOracleRestoreNewsPlacementContract40241?.window_manager_modified === false
          && !Boolean(document.getElementById("atlasOracleNewsContext40234"))
          && Boolean(document.getElementById("news-market-explanation"))
          && Boolean(document.getElementById("newsMarketOperatorIntelligence40235")),
        "super Oracle restauré · rapport complet News→Marché déplacé dans son accordéon News · icônes inline existantes réutilisées · CODE ONLY"),
      check("Workspace Runtime Contract 40.2.27",
        globalThis.ErithWorkspaceRuntimeContract40227?.checkpoint_only === true
          && globalThis.ErithWorkspaceRuntimeContract40227?.x_semantics === "mask_presentation_only"
          && globalThis.ErithWorkspaceRuntimeContract40227?.views_own_business_engines === false
          && globalThis.ErithWorkspaceRuntimeContract40227?.workspace_profile_owns_analytical_context === false
          && globalThis.ErithWorkspaceRuntimeContract40227?.graph_context_v7_is_analytical_authority === true
          && globalThis.ErithWorkspaceRuntimeContract40227?.oracle_visibility_dependency_allowed === false
          && globalThis.ErithWorkspaceRuntimeContract40227?.targeted_render_optimization_added === false
          && globalThis.ErithWorkspaceRuntimeContract40227?.render_gate_added === false
          && globalThis.ErithWorkspaceRuntimeContract40227?.engine_stop_added === false,
        "checkpoint uniquement · X=masquer · vues/profils non propriétaires des moteurs · V7 autorité analytique · aucune chirurgie"),
      check("Math Core réduit · mini-module flottant mobile",
        globalThis.ErithAdminWindowManager?.contract?.floating_minimize_compact_bar === true,
        "réduction flottante compacte · position restaurée après déplacement"),
      check("DirectFixed · propriétaire géométrie inline !important", directFixedGeometryOwnerContract().ok === true, directFixedGeometryOwnerContract().detail),
      check("Déplacement · détacher + glisser sans perdre la prise", detachDragContinuityContract().ok === true, detachDragContinuityContract().detail),
      check("Shells flottantes · body + placeholder + auto-fit contenu/chrome", globalFloatingShellContract().ok === true, globalFloatingShellContract().detail),
      check("Aucun override chrome R1/R2 chargé", forbiddenOverrides.length === 0, forbiddenOverrides.length ? forbiddenOverrides.map(row => row.raw).join(" · ") : "anciens overrides R1/R2 absents"),
      check("Base CSS historique lisible", chromeCss.ok === true, chromeCss.detail || "contrat CSS historique absent"),
      check("Menu métallique uniforme", uniformMenuCss.ok === true, uniformMenuCss.detail || "contrat uniforme absent"),
      check("Graphique · actif turquoise/blanc · désactivé gris 40.2.89", graphToolbarStateContract40289().ok === true, graphToolbarStateContract40289().detail),
      check("Sections · air + emblèmes transparents 40.2.92", sectionAirEmblemContract40292().ok === true, sectionAirEmblemContract40292().detail),
      check("Sections · hiérarchie compacte + sous-sections bordées + Atlas viewport 40.2.93", sectionDensityAtlasViewportContract40293().ok === true, sectionDensityAtlasViewportContract40293().detail),
      check("Sections · frontières familles + emblèmes sur axe signal 40.2.98", familyBoundaryContract40298().ok === true, familyBoundaryContract40298().detail),
      check("Navigation · Book 2×3 + boutons internes + ADMIN unique 40.2.99", bookNavigationContract40299().ok === true, bookNavigationContract40299().detail),
      check("Familles · 04 devant Mesure d’audience + menus 02/03/04 à droite 40.3.00", adminFamilyOrderMenuContract40300().ok === true, adminFamilyOrderMenuContract40300().detail),
      check("Familles · Réduire conserve bandeau natif + Oracle/Atlas compact 40.3.01", familyCompactReduceContract40301().ok === true, familyCompactReduceContract40301().detail),
      check("Familles · topologie atomique + commandline sans saut document 40.3.02", atomicFamilyCommandlineContract40302().ok === true, atomicFamilyCommandlineContract40302().detail),
      check("Fenêtres · migration ciblée états familles 40.3.03", familyStateMigrationContract40303().ok === true, familyStateMigrationContract40303().detail),
      check("Parcours · séquence canonique 01→02→03→04→Missions→Audience→Sources 40.3.04", canonicalAdminSequenceContract40304().ok === true, canonicalAdminSequenceContract40304().detail),
      check("Sections + fenêtres · 03/04 canoniques + auto-fit natif 40.3.20", canonicalSectionsAutofitContract40320().ok === true, canonicalSectionsAutofitContract40320().detail),
      check("Navigation · intention Atlas/Oracle restaure la famille réduite 40.3.09", essentialNavigationContract40309().ok === true, essentialNavigationContract40309().detail),
      check("Viewport passif · Market/Spot sans restauration document + Missions privées 40.3.11", passiveViewportRoleContract40311().ok === true, passiveViewportRoleContract40311().detail),
      check("Rôles + viewport · isolation Basic/Intermédiaire et propriétaire unique 40.3.12", roleIsolationViewportOwnershipContract40312().ok === true, roleIsolationViewportOwnershipContract40312().detail),
      check("Performance · transition rôle unique + reflow Window Deck borné 40.3.14", roleTransitionPerformanceContract40314().ok === true, roleTransitionPerformanceContract40314().detail),
      check("Surface Firefox héritée · menu 100% + contenu 97% + shell sans blur 40.3.15", surfacePerformanceContract40315().ok === true, surfacePerformanceContract40315().detail),
      check("Performance · Bridge passif + placeholders famille compacts 40.3.17", bridgePassivePerformanceContract40317().ok === true, bridgePassivePerformanceContract40317().detail),
      check("Lecture Technique · image conservée en vue réduite + priorité basse 40.3.21", technicalImageContinuityContract40321().ok === true, technicalImageContinuityContract40321().detail),
      check("Command Center · portail fixe au body + atmosphère non propriétaire 40.3.21", commandCenterPortalContract40321().ok === true, commandCenterPortalContract40321().detail),
      check("Familles Admin · retour Basic→Admin restaure 01/02/03/04 + reset présentation ciblé 40.3.22", familyRoleReturnContract40322().ok === true, familyRoleReturnContract40322().detail),
      check("Command Center · ouverture uniquement sur intention opérateur 40.3.22", commandCenterExplicitContract40322().ok === true, commandCenterExplicitContract40322().detail),
      check("AstroCycle · couleurs planétaires 40.2.91", astroPlanetColorContract40291().ok === true, astroPlanetColorContract40291().detail),
      check("Interface · couleurs sémantiques + icônes code-only 40.2.90", semanticColorIconContract40290().ok === true, semanticColorIconContract40290().detail),
      check("Celestial · Ryzen → Book lecture seule 40.2.88", celestialRyzenBookContract40288().ok === true, celestialRyzenBookContract40288().detail),
      check("Aucun CSS destructeur des menus", destructiveMenuHideRules().length === 0, destructiveMenuHideRules().length ? destructiveMenuHideRules().join(" · ") : "aucun display:none sur les menus opérationnels"),
      check("Graphique direct window controls", !!graphChrome && graphChrome.complete && graphChrome.interactive, graphChrome ? `5/5=${String(graphChrome.complete)} · interactif=${String(graphChrome.interactive)} · opacity runtime=${Number.isFinite(graphChrome.computedOpacity) ? graphChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Graphique absent"),
      check("Graphique · historique pur + LIVE hors canvas",
        graphStability?.build === BUILD_CURRENT
          && graphStability?.contract?.atomic_cache_to_direct === true
          && graphStability?.contract?.preserve_visible_comparison_until_complete === true
          && graphStability?.contract?.reuse_existing_comparison_chart === true
          && graphStability?.contract?.single_resize_owner === "atlasScheduleStableChartResize"
          && graphStability?.contract?.geometry_guard === true
          && graphStability?.contract?.live_websocket_canvas_updates === false
          && graphStability?.contract?.collector_canvas_updates === false
          && graphStability?.contract?.live_endpoint_commit_scope === "disabled"
          && graphStability?.contract?.synthetic_terminal_point === false
          && graphStability?.contract?.live_top5_presentation_outside_canvas === true
          && graphStability?.contract?.virtual_live_tooltip_endpoint === true
          && graphStability?.contract?.websocket_canvas_mutation === false,
        graphStability
          ? `transactions=${Number(graphStability.metrics?.atomic_refresh_transactions || 0)} · commits=${Number(graphStability.metrics?.atomic_refresh_commits || 0)} · live-render=${Number(graphStability.metrics?.live_endpoint_render_commits || 0)} · live-ui=${Number(graphStability.metrics?.live_presentation_refreshes || 0)} · blocked=${Number(graphStability.metrics?.live_endpoint_blocked_calls || 0)} · resize=${Number(graphStability.metrics?.resize_executed || 0)}/${Number(graphStability.metrics?.resize_requested || 0)} · skip=${Number(graphStability.metrics?.resize_skipped || 0)}`
          : `contrat stabilité graphique ${BUILD_CURRENT} absent`),
      check("Graphique · renderer vertical canonique + Metal illuminé",
        verticalBars?.build === BUILD_CURRENT
          && verticalBars?.geometry_source === "39.2.11"
          && verticalBars?.metal_paint_source === "39.2.21"
          && verticalBars?.verified_commit === "1e6664505b2e3401e34639f0bb88aa121093103b"
          && verticalBars?.geometry === "bottom-to-curve-point-by-point"
          && verticalBars?.baseline === "chartArea.bottom"
          && Number(verticalBars?.height_ratio) === 0.88
          && verticalBars?.base_metal?.solo?.color === "#5f7f92"
          && Number(verticalBars?.base_metal?.solo?.opacity) === 0.115
          && verticalBars?.base_metal?.comparison?.color === "#587488"
          && Number(verticalBars?.base_metal?.comparison?.lead_opacity) === 0.085
          && verticalBars?.illumination?.enabled === true
          && verticalBars?.illumination?.composite === "screen"
          && verticalBars?.illumination?.geometry_changed === false
          && verticalBars?.synthetic_live_endpoint === false
          && verticalBars?.websocket_canvas_rescale === false,
        verticalBars ? `géométrie=${verticalBars.geometry_source} · base=${verticalBars.metal_paint_source} · illumination=${verticalBars.illumination?.composite}` : "contrat renderer vertical 40.1.52 absent"),
      check("Lecture technique · case 24 h vert pomme + chiffre vert fluo", !!byId("atlasOracleOverlay40148") && /#72ffb2/i.test(byId("atlasOracleOverlay40148")?.textContent || ""), "case positive entière renforcée · chiffre positif #72ffb2 restauré"),
      check("Versioning · propagation GitHub informative", /stateMode === \"syncing\"[\s\S]{0,260}classList\.add\(\"ok\"\)/.test(String(globalThis.atlasVersionControlState || "")), "syncing utilise la famille visuelle ok/verte, pas warn/rouge"),
      check("Math Core · commandes inline dans l’en-tête", document.querySelector?.("#math .atlas-math-dock-actions[data-math-inline-window-controls=\"40148\"]"), "[⠿][−][□][↗][×] | Dessus · Latéral · Réduire sur une seule ligne"),
      check("Oracle V1 · buffer LIVE micro borné", !!oracleV1 && /live micro/i.test(String(oracleV1.live_micro_buffer || "")), "20 min max · mémoire session · aucun write mainChart"),
      check("Oracle V1 · TOP 5 agrégé", !!oracleV1?.top5_aggregate_focus, "focus agrégé + focus BTC/ETH/BNB/XRP/SOL"),
      check("Oracle V1 · zoom visuel isolé", Array.isArray(oracleV1?.visual_zoom) && oracleV1.visual_zoom.includes("4x") && oracleV1.visual_zoom_data_mutation === false && oracleV1.visual_zoom_score_mutation === false && oracleV1.visual_zoom_main_chart_mutation === false, "AUTO/×1/×2/×4 · ancre MAINTENANT · zéro mutation data/score/mainChart"),
      check("Oracle V1 · multivue + canvas séparé",
        oracleV1?.build === BUILD_CURRENT
          && oracleV1?.mode === "historical-tail-to-multiview-interpretative-continuation"
          && oracleV1?.overlay_on_main_chart === true
          && oracleV1?.historical_tail_read_only === true
          && Array.isArray(oracleV1?.views)
          && oracleV1.views.join(",") === "continuation,top5"
          && Array.isArray(oracleV1?.horizons)
          && oracleV1.horizons.join(",") === "1m,5m,15m"
          && oracleV1?.default_view === "continuation"
          && oracleV1?.default_horizon === "5m"
          && oracleV1?.separate_canvas === true
          && oracleV1?.main_chart_mutation === false
          && oracleV1?.main_chart_dataset_write === false
          && oracleV1?.historical_canvas_mutation === false
          && oracleV1?.synthetic_future_prices === false
          && oracleV1?.prediction === false
          && oracleV1?.financial_advice === false
          && !!byId("atlasOracleV0")
          && !!byId("atlasOracleCanvas")
          && !!byId("atlasOracleViewLabel")
          && byId("atlasOracleCanvas") !== byId("mainChart"),
        oracleV1 ? `${oracleV1.mode} · continuation/top5 · 1m/5m/15m · overlay read-only` : "contrat Oracle V1 absent"),
      check("Target Top direct window controls", !!targetChrome && targetChrome.complete && targetChrome.interactive, targetChrome ? `5/5=${String(targetChrome.complete)} · interactif=${String(targetChrome.interactive)} · opacity runtime=${Number.isFinite(targetChrome.computedOpacity) ? targetChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Target Top absent"),
      check("Market Flow direct window controls", !!flowChrome && flowChrome.complete && flowChrome.interactive, flowChrome ? `5/5=${String(flowChrome.complete)} · interactif=${String(flowChrome.interactive)} · opacity runtime=${Number.isFinite(flowChrome.computedOpacity) ? flowChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Market Flow absent"),
      check("Market Flow · déplacement Target Top + viewport interne adapté", marketFlowFloatParityContract().ok === true, marketFlowFloatParityContract().detail),
      check("Market Snapshot direct window controls", !!marketChrome && marketChrome.complete && marketChrome.interactive, marketChrome ? `5/5=${String(marketChrome.complete)} · interactif=${String(marketChrome.interactive)} · opacity runtime=${Number.isFinite(marketChrome.computedOpacity) ? marketChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Market Snapshot absent"),
      check("Market Snapshot · shell flottante globale", marketSnapshotBodyPortalContract().ok === true, marketSnapshotBodyPortalContract().detail),
      check("Math Core direct window controls", !!mathChrome && mathChrome.complete && mathChrome.interactive, mathChrome ? `5/5=${String(mathChrome.complete)} · interactif=${String(mathChrome.interactive)} · opacity runtime=${Number.isFinite(mathChrome.computedOpacity) ? mathChrome.computedOpacity.toFixed(2) : "—"}` : "chrome Math Core absent"),
      check("Menus familles Administrator · 5 boutons non rognés", familyChromeLayoutOk,
        familyChromes.length
          ? familyChromes.map(row => row.state?.rendered
              ? `${row.title}:5/5=${String(!!row.state?.complete)} · visible=true · pos=${row.state?.position || "—"} · width=${Math.round(row.state?.width || 0)}px · layout=${String(!!row.state?.layoutOk)}`
              : `${row.title}:5/5=${String(!!row.state?.complete)} · visible=false · géométrie non mesurée (vue courante)`
            ).join(" · ")
          : "aucun chrome famille détecté"),
      check("Lecture technique", !!byId("detailPanel") && !!byId("detailPanelBody"), "ancrages DOM présents"),
      check("Lecture technique · géométrie Classic propriétaire", technicalReadingGeometryOwnerContract().ok === true, technicalReadingGeometryOwnerContract().detail),
      check("Near-zero glass lock", technicalReadingGlassContract().ok === true, technicalReadingGlassContract().detail),
      check("Fiche Crypto native · Flottante / Latérale", cryptoCard.ok === true, cryptoCard.detail),
      check("Workspace marché", !!byId("market-workspace") && !!byId("analyste"), "ancrages marché/graphe présents"),
      check("Layout repair courant", !!globalThis.atlasAdministratorLayoutRepair3990R2 && hasScriptSuffix("/js/layout-repair.js"), "module DOM final + script unique"),
      check("Contrat Layout repair", readOnlyContractOk(layoutContract), layoutContract ? "DOM uniquement · lecture seule · zéro pipeline" : "sentinelle absente"),
      check("Accueil compact lock", !byId("administratorMirrorIdentity"), "aucune ligne Administrator Mirror supplémentaire dans le header"),
      check("Decision Memory canonique", !!board && !!primaryMemory && primaryMemory.parentElement === board, "decisionMemoryV2 reste dans sa zone canonique"),
      check("Host mémoire auxiliaire", !!board && !!auxHost && auxHost.parentElement === board, "host R2 unique sous Decision Board"),
      check("Dual Memory isolée", !!auxHost && !!dualMemory && dualMemory.parentElement === auxHost, "Dual Memory 39.5 hors sélecteur direct-child decision-memory"),
      check("Rétrospective isolée", !!auxHost && !!retro && retro.parentElement === auxHost, "Retrospective 39.6 hors sélecteur direct-child decision-memory"),
      check("Collision de grille interdite", directMemoryRoots.length === 1 && directMemoryRoots[0]?.id === "decisionMemoryV2", `${directMemoryRoots.length} racine(s) .decision-memory-v2 directe(s) : ${directMemoryRoots.map(node => node.id || "sans-id").join(", ") || "aucune"}`),
      check("Layout state R2", !!layoutState && layoutState.direct_memory_root_count === 1 && layoutState.dual_isolated && layoutState.retrospective_isolated, layoutState ? "1 racine primaire · Dual + Retrospective isolées" : "état layout indisponible"),
      check("Ancien Freeze non chargé", countScriptSuffix("/js/architecture-freeze-39.9.0.js") === 0 && countScriptSuffix("/js/architecture-freeze-39.9.0R1.js") === 0 && countScriptSuffix("/js/architecture-freeze-39.9.0R2.js") === 0 && countScriptSuffix("/js/architecture-freeze-40.0.0.js") === 0, "anciens Freeze 39.9.0/R1/R2 non chargés"),
      check("Freeze singleton", hasScriptSuffix("/js/architecture-freeze.js"), "script diagnostic courant unique")
    ];

    if (health) {
      const structure = health?.verdicts?.structure || {};
      if (structure.code === "waiting") {
        checks.push(check(
          "État structure mémoire",
          false,
          `${structure.label || "EN ATTENTE"} · ${structure.detail || "aucun détail"}`,
          "warning"
        ));
      } else {
        checks.push(check(
          "État structure mémoire",
          structure.code === "healthy",
          `${structure.label || "INDISPONIBLE"} · ${structure.detail || "aucun détail"}`,
          "critical"
        ));
      }
      const coverage = health?.verdicts?.coverage || {};
      checks.push(check(
        "Couverture mémoire",
        coverage.code === "complete",
        `${coverage.label || "INDISPONIBLE"} · ${coverage.detail || "aucun détail"}`,
        "warning"
      ));
      const continuity = health?.verdicts?.continuity || {};
      checks.push(check(
        "Continuité de collecte",
        continuity.code === "observed",
        `${continuity.label || "INDISPONIBLE"} · ${continuity.detail || "aucun détail"}`,
        "warning"
      ));
    } else {
      checks.push(check("État structure mémoire", false, "Memory Health n’a pas retourné de diagnostic", "warning"));
    }

    if (multi) {
      checks.push(check(
        "Concordance multi-collecteur disponible",
        multi?.status?.code !== "insufficient",
        `${multi?.status?.label || "INDISPONIBLE"} · ${Number(multi?.pairCount || 0)} paire(s) comparable(s)`,
        "warning"
      ));
    }

    const criticalFails = checks.filter(row => row.severity === "critical" && !row.ok);
    const warnings = checks.filter(row => row.severity === "warning" && !row.ok);
    const pass = criticalFails.length === 0;
    const label = !pass
      ? "FREEZE REFUSÉ"
      : warnings.length
        ? "FREEZE PASS · LIMITES CONNUES"
        : "FREEZE PASS";

    return {
      build: BUILD_CURRENT,
      generatedAt: new Date().toISOString(),
      pass,
      label,
      checks,
      criticalFails,
      warnings,
      runtimeTruth: truth,
      health,
      multi,
      contract: `ARCHITECTURE GELÉE · RESERVED PLACEHOLDER + UNION GEOMETRY · AUCUNE MUTATION AUTOMATIQUE · ${BUILD_CURRENT} CANDIDAT À VALIDER DANS FIREFOX`
    };
  }

  const FREEZE_BODY_TEMPLATE_40352 = `
      <div class="atlas-memory-ledger-35">
        <article><span>Contrôles</span><b id="architectureFreezeCount">—</b><small>PASS réellement exécutés dans ce navigateur.</small></article>
        <article><span>Critiques</span><b id="architectureFreezeCritical">—</b><small>Un seul FAIL critique invalide le candidat stable.</small></article>
        <article><span>Limites</span><b id="architectureFreezeWarnings">—</b><small>Couverture ou données manquantes : visibles mais non maquillées en panne.</small></article>
        <article><span>Verdict</span><b id="architectureFreezeState">—</b><small>Préflight local ${BUILD_CURRENT} ; validation Firefox opérateur requise.</small></article>
      </div>
      <div class="atlas-memory-intelligence-grid" id="architectureFreezeGrid"></div>
      <div class="atlas-memory-intelligence-actions">
        <button type="button" id="btnArchitectureFreezeRefresh">Relancer le contrôle</button>
        <button type="button" id="btnArchitectureFreezeExport">Exporter Freeze Audit .md</button>
      </div>
      <p id="architectureFreezeContract">Audit matérialisé à la demande uniquement.</p>`;

  function releaseFreezeBody40352(root = byId(ROOT_ID)) {
    const mount = byId("architectureFreezeMount40352");
    if (!root || !mount) return false;
    if (mount.dataset.freezeMounted40352 === "0"
        && mount.querySelector("[data-architecture-freeze-placeholder-40352]")) return true;
    mount.innerHTML = '<p class="atlas-local-response-empty" data-architecture-freeze-placeholder-40352="1">Freeze Audit fermé · les contrôles complets ne sont pas matérialisés.</p>';
    mount.dataset.freezeMounted40352 = "0";
    root.dataset.state = "deferred";
    const badge = byId("architectureFreezeBadge");
    if (badge) {
      badge.textContent = "À la demande";
      badge.className = "pill warn";
    }
    return true;
  }

  function ensureFreezeBody40352(root = byId(ROOT_ID)) {
    const mount = byId("architectureFreezeMount40352");
    if (!root || !mount) return false;
    if (mount.dataset.freezeMounted40352 !== "1") {
      mount.innerHTML = FREEZE_BODY_TEMPLATE_40352;
      mount.dataset.freezeMounted40352 = "1";
    }
    // Refresh remains owned by the existing delegated document click listener.
    // Do not add a second heavy audit execution path here.
    const exporter = byId("btnArchitectureFreezeExport");
    if (exporter && exporter.dataset.freezeBound40352 !== "1") {
      exporter.dataset.freezeBound40352 = "1";
      exporter.addEventListener("click", exportMarkdown);
    }
    return true;
  }

  function ensureRoot() {
    let root = byId(ROOT_ID);
    if (root) return root;
    const anchor = byId("atlasMemoryHealth3980") || byId("atlasMemoryIntelligence");
    if (!anchor) return null;

    root = document.createElement("details");
    root.id = ROOT_ID;
    root.className = "atlas-memory-intelligence atlas-architecture-freeze-deferred-40352 atlas-collapse glass atlas-tone-intelligence";
    root.dataset.state = "deferred";
    root.dataset.atlasFreezeDeferred40352 = "1";
    root.setAttribute("aria-labelledby", "architectureFreezeTitle");
    root.innerHTML = `
      <summary class="atlas-collapse-summary">
        <span class="atlas-collapse-icon" aria-hidden="true">▶</span>
        <span class="atlas-collapse-copy">
          <span class="eyebrow">ADMINISTRATOR CONSOLIDATION · ${BUILD_CURRENT} · READ ONLY · À LA DEMANDE</span>
          <span class="atlas-collapse-title" id="architectureFreezeTitle">Freeze / Architecture / Diagnostics</span>
          <span class="atlas-collapse-subtitle">Ouvrir uniquement pour exécuter et matérialiser l’audit complet.</span>
        </span>
        <span class="pill warn" id="architectureFreezeBadge">À la demande</span>
        <span class="atlas-collapse-state" data-open-label="Replier" data-closed-label="Déplier">Déplier</span>
      </summary>
      <div class="atlas-collapse-body" id="architectureFreezeMount40352" data-freeze-mounted-40352="0">
        <p class="atlas-local-response-empty" data-architecture-freeze-placeholder-40352="1">Freeze Audit fermé · les contrôles complets ne sont pas matérialisés.</p>
      </div>`;

    anchor.insertAdjacentElement("afterend", root);
    root.addEventListener("toggle", () => {
      const state = root.querySelector(":scope > summary .atlas-collapse-state");
      if (state) state.textContent = root.open ? (state.dataset.openLabel || "Replier") : (state.dataset.closedLabel || "Déplier");
      if (root.open) {
        ensureFreezeBody40352(root);
        render({ force: true });
      } else {
        releaseFreezeBody40352(root);
      }
    });
    return root;
  }

  function render(options = {}) {
    const root = ensureRoot();
    if (!root) return null;
    const force = options?.force === true;
    if (!root.open && !force) {
      releaseFreezeBody40352(root);
      return { build: BUILD_CURRENT, deferred: true, checks: [], criticalFails: [], warnings: [] };
    }
    ensureFreezeBody40352(root);
    const data = derive();
    const passed = data.checks.filter(row => row.ok).length;
    setText("architectureFreezeCount", `${passed}/${data.checks.length} PASS`);
    setText("architectureFreezeCritical", data.criticalFails.length ? `${data.criticalFails.length} FAIL` : "0 FAIL");
    setText("architectureFreezeWarnings", data.warnings.length ? `${data.warnings.length} limite(s)` : "0");
    setText("architectureFreezeState", data.label);
    setText("architectureFreezeContract", data.pass
      ? `${BUILD_CURRENT} : Freeze courant. Le verrou graphique hérité de 40.1.23 conserve le canvas historique pur et sans endpoint synthétique. 40.1.52 conserve le renderer canonique 39.2.11 / Metal 39.2.21, ajoute une passe lumineuse paint-only, une case 24 h vert pomme et Oracle V1 multivue sur canvas séparé. Le canvas historique principal reste pur. Math Core conserve ses métriques historiques ; sa barre complète de commandes est ancrée dans son en-tête et les barres minimisées disposent d’un verrou de restauration interactif. Market Flow, mémoires, sources et pipeline Atlas/NØX/Aerith restent inchangés.`
      : "CANDIDAT REFUSÉ : corriger les FAIL critiques avant validation stable.");

    const badge = byId("architectureFreezeBadge");
    if (badge) {
      badge.textContent = data.label;
      badge.className = `pill ${data.pass ? (data.warnings.length ? "warn" : "ok") : "fail"}`;
    }

    const grid = byId("architectureFreezeGrid");
    if (grid) {
      const nodes = data.checks.map(row => {
        const article = document.createElement("article");
        const state = row.ok ? "PASS" : row.severity === "critical" ? "FAIL" : "LIMITE";
        article.dataset.state = row.ok ? "ok" : row.severity === "critical" ? "fail" : "warn";
        article.innerHTML = `<span></span><b>${state}</b><small></small>`;
        article.querySelector("span").textContent = row.name;
        article.querySelector("small").textContent = row.detail;
        return article;
      });
      grid.replaceChildren(...nodes);
    }

    root.dataset.state = data.pass ? (data.warnings.length ? "prudent" : "ready") : "fail";
    root.dataset.build = BUILD_CURRENT;
    root.dataset.criticalFails = String(data.criticalFails.length);
    root.dataset.warnings = String(data.warnings.length);
    return data;
  }

  function markdown(data = derive()) {
    const lines = [
      `# Agent-Crypto — Administrator Consolidation ${BUILD_CURRENT}`, "",
      `- Généré : ${data.generatedAt}`,
      `- Verdict : ${data.label}`,
      `- FAIL critiques : ${data.criticalFails.length}`,
      `- Limites connues : ${data.warnings.length}`, "",
      "## Contrôles", ""
    ];
    for (const row of data.checks) {
      const state = row.ok ? "PASS" : row.severity === "critical" ? "FAIL" : "LIMITE";
      lines.push(`- ${state} · ${row.name} · ${row.detail}`);
    }
    lines.push(
      "", `## Validation finale ${BUILD_CURRENT}`, "",
      "- 0 FAIL critique requis.",
      "- Les limites de couverture/continuité peuvent rester visibles si elles ne sont pas des défauts structurels.",
      "- Les contrôles Versioning/Math Core ne disposent plus d’un passe-droit `|| true` : leur PASS exige désormais la condition réelle.",
      "- Ce candidat prolonge passivement l’instrumentation 40.2.25 : attribution par refresh des états RÉDUIT / MASQUÉ / REPLIÉ, sans gating, suppression DOM, cadence, décision métier, coupure moteur ni autorité de stockage.",
      `- Le candidat ${BUILD_CURRENT} exige une validation réelle dans Firefox après publication opérateur.`,
      "- Aucun ordre financier, aucune recommandation et aucune réparation automatique ne sont produits par ce module."
    );
    return lines.join("\n");
  }

  function exportMarkdown() {
    const body = markdown();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const buildSlug = BUILD_CURRENT.replace(/\./g, "_");
    const name = `agent_crypto_architecture_freeze_${buildSlug}_${stamp}.md`;
    if (typeof globalThis.downloadTextFile === "function") {
      globalThis.downloadTextFile(name, "text/markdown;charset=utf-8", body);
      return body;
    }
    try {
      const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (_) {}
    return body;
  }


  // Keep the displayed Freeze verdict synchronized with the real Memory Health
  // lifecycle. No polling: we piggyback on the existing memory render chain and
  // on explicit operator refresh actions only.
  const baseMemoryIntelligenceRenderFreeze = typeof globalThis.atlasMemoryIntelligenceRender === "function"
    ? globalThis.atlasMemoryIntelligenceRender
    : null;
  if (baseMemoryIntelligenceRenderFreeze && !baseMemoryIntelligenceRenderFreeze.__architectureFreezeWrapped) {
    const wrapped = function atlasMemoryIntelligenceRenderFreeze(...args) {
      const result = baseMemoryIntelligenceRenderFreeze.apply(this, args);
      queueMicrotask(() => { try { render(); } catch (_) {} });
      return result;
    };
    try { Object.defineProperty(wrapped, "__architectureFreezeWrapped", { value: true }); } catch (_) {}
    globalThis.atlasMemoryIntelligenceRender = wrapped;
  }

  document.addEventListener("click", event => {
    const id = event?.target?.closest?.("button")?.id || "";
    if (id === "btnMemoryHealthRefresh3980R2" || id === "btnArchitectureFreezeRefresh") {
      queueMicrotask(() => { try { render(); } catch (_) {} });
    }
  });

  const freezeContract = Object.freeze({
    build: BUILD_CURRENT,
    role: "read-only recovery over protected Administrator architecture",
    feature_delta: false,
    repairs_automatically: false,
    writes_memory: false,
    starts_atlas: false,
    starts_nox: false,
    starts_aerith: false,
    starts_bridge: false,
    starts_ollama: false,
    new_fetch: false,
    new_timer: false,
    new_websocket: false
  });

  globalThis.__AGENT_CRYPTO_ARCHITECTURE_FREEZE__ = freezeContract;
  globalThis.atlasArchitectureFreeze = Object.freeze({ derive, render, markdown });

  queueMicrotask(() => { try { ensureRoot(); } catch (_) {} });
  window.addEventListener("load", () => { try { ensureRoot(); } catch (_) {} }, { once: true });
})();
