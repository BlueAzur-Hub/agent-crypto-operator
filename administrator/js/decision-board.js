(() => {
  "use strict";

  /* ============================================================
     39.5.0 — DECISION BOARD DUAL MEMORY READER LOCK

     READ-ONLY CONTRACT
     - Read Market Memory 39.4.4R1 through its public stats/compute APIs.
     - Read Analytical Memory 39.4 through its public stats API.
     - Display both memories side-by-side inside Decision Board.
     - NEVER fuse their counters, confidence or timelines.
     - NEVER launch Atlas, NØX, Aerith, Bridge or Ollama.
     - NO fetch, timer, WebSocket or storage write.
     ============================================================ */

  const BUILD_3950 = "39.5.0";
  const ROOT_ID = "decisionDualMemory395";
  const EXPORT_ID = "btnDecisionBoardDualMemoryExport395";

  const byId = id => document.getElementById(id);
  const text = (id, value) => {
    const node = byId(id);
    if (node) node.textContent = String(value ?? "—");
  };

  function safeCall(fn, fallback = null) {
    try { return typeof fn === "function" ? fn() : fallback; }
    catch (_) { return fallback; }
  }

  function marketState() {
    const stats = safeCall(globalThis.atlasMarketMemoryStats3944R1, {}) || {};
    const intelligence = safeCall(globalThis.atlasMemoryIntelligenceCompute, {}) || {};
    const canonical = Number(stats.canonicalCount ?? stats.distinctCount ?? intelligence.canonical_snapshots ?? intelligence.records ?? 0);
    const sourceRecords = Number(stats.sourceRecordCount ?? intelligence.source_records ?? stats.marketRecords?.length ?? 0);
    const collectors = Array.isArray(stats.collectors)
      ? stats.collectors.length
      : Number(intelligence.collectors_count || 0);
    const primary = Number(intelligence.primary_records ?? 0);
    return { stats, intelligence, canonical, sourceRecords, collectors, primary };
  }

  function analyticalState() {
    const data = safeCall(globalThis.atlasAnalyticalMemoryStats394, {}) || {};
    return {
      data,
      count: Number(data.count || 0),
      verified: Number(data.verifiedCount || 0),
      journal: Number(data.journalCount || 0),
      journalOnly: Number(data.journalOnlyCount || 0),
      collectors: Array.isArray(data.collectors) ? data.collectors.length : 0,
      latestFingerprint: String(data.latestFingerprint || ""),
      latestAt: data.latestAt || null,
      latest: data.latest || null
    };
  }

  function horizonLine(memory) {
    const horizons = memory?.intelligence?.horizons || {};
    const count = size => Number(horizons?.[size]?.records || 0);
    return `3=${count(3)}/3 · 5=${count(5)}/5 · 10=${count(10)}/10`;
  }

  function compactFingerprint(value) {
    const s = String(value || "");
    if (!s) return "Aucun CURRENT détaillé";
    return s.length > 22 ? `${s.slice(0, 18)}…` : s;
  }

  function localTime(value) {
    if (!value) return "date indisponible";
    const t = Date.parse(value);
    return Number.isFinite(t) ? new Date(t).toLocaleString("fr-FR") : String(value);
  }

  function ensureRoot() {
    let root = byId(ROOT_ID);
    if (root) return root;
    const anchor = byId("decisionMemoryV2");
    if (!anchor) return null;

    root = document.createElement("div");
    root.id = ROOT_ID;
    root.className = "decision-memory-v2";
    root.setAttribute("aria-label", "Decision Board 39.5.0 · Dual Memory Reader");
    root.innerHTML = `
      <article><span>Market Memory</span><b id="decisionDualMarket395">—</b><small id="decisionDualMarketDetail395">Observations marché canoniques, évolutives et indépendantes d’Atlas.</small></article>
      <article><span>Horizons Market</span><b id="decisionDualHorizons395">—</b><small id="decisionDualHorizonsDetail395">Timeline du fil principal uniquement.</small></article>
      <article><span>Continuité Market</span><b id="decisionDualContinuity395">—</b><small id="decisionDualContinuityDetail395">Score de continuité des données, jamais probabilité de gain.</small></article>
      <article><span>Analytical Memory</span><b id="decisionDualAnalytical395">—</b><small id="decisionDualAnalyticalDetail395">CURRENT analytiques fermés, figés et séparés du marché.</small></article>
      <article><span>Journal CURRENT</span><b id="decisionDualJournal395">—</b><small id="decisionDualJournalDetail395">Les preuves sans payload détaillé restent explicitement partielles.</small></article>
      <article><span>Dernier CURRENT</span><b id="decisionDualLatest395">—</b><small id="decisionDualLatestDetail395">Aucune comparaison rétrospective n’est effectuée en 39.5.0.</small></article>
      <article class="decision-memory-v2-action"><span>Contrat Dual Memory</span><b id="decisionDualContract395">MARKET ≠ CURRENT</b><small id="decisionDualContractDetail395">Lecture simultanée, compteurs et responsabilités séparés. Aucune fusion.</small></article>`;
    anchor.insertAdjacentElement("afterend", root);

    const actions = byId("decisionMemoryCompare")?.querySelector?.(".decision-memory-compare-actions");
    if (actions && !byId(EXPORT_ID)) {
      const button = document.createElement("button");
      button.type = "button";
      button.id = EXPORT_ID;
      button.textContent = "Exporter Dual Memory .md";
      button.addEventListener("click", exportMarkdown);
      actions.appendChild(button);
    }
    return root;
  }

  function render() {
    const root = ensureRoot();
    if (!root) return null;
    const market = marketState();
    const analytical = analyticalState();
    const confidence = market.intelligence?.confidence || {};

    text("decisionDualMarket395", `${market.canonical} snapshot(s) canonique(s)`);
    text("decisionDualMarketDetail395", `${market.sourceRecords} relevé(s) source · ${market.primary} relevé(s) fil principal · ${market.collectors} collecteur(s).`);

    text("decisionDualHorizons395", horizonLine(market));
    text("decisionDualHorizonsDetail395", "Market Memory uniquement · les CURRENT analytiques n’entrent jamais dans 3 / 5 / 10.");

    text("decisionDualContinuity395", `${confidence.label || "faible"} · ${Number(confidence.score || 0)}/100`);
    text("decisionDualContinuityDetail395", `Dernier marché : ${localTime(market.intelligence?.latest_at)} · descriptif uniquement.`);

    text("decisionDualAnalytical395", `${analytical.count} CURRENT détaillé(s) · ${analytical.verified} vérifié(s)`);
    text("decisionDualAnalyticalDetail395", `${analytical.collectors} collecteur(s) analytique(s) · unités figées après fermeture Atlas → NØX → Aerith.`);

    text("decisionDualJournal395", `${analytical.journal} fermé(s) · ${analytical.journalOnly} sans payload`);
    text("decisionDualJournalDetail395", "Journal conservé comme preuve historique ; aucune unité détaillée n’est fabriquée.");

    text("decisionDualLatest395", compactFingerprint(analytical.latestFingerprint));
    text("decisionDualLatestDetail395", analytical.latestAt
      ? `${localTime(analytical.latestAt)} · ${analytical.latest?.collector_id || "collecteur inconnu"} · lecture seule.`
      : "Aucun CURRENT détaillé disponible ; Market Memory continue indépendamment.");

    text("decisionDualContract395", "MARKET ≠ CURRENT");
    text("decisionDualContractDetail395", "Decision Board lit les deux mémoires sans les fusionner, sans écrire dedans et sans lancer Atlas.");

    root.dataset.state = market.canonical || analytical.count || analytical.journal ? "ready" : "waiting";
    root.dataset.marketCanonical = String(market.canonical);
    root.dataset.analyticalCurrent = String(analytical.count);
    root.dataset.separation = "strict";

    const board = byId("decision-board");
    if (board) {
      board.dataset.dualMemoryReader = BUILD_3950;
      board.dataset.marketMemory = String(market.canonical);
      board.dataset.analyticalMemory = String(analytical.count);
    }

    const compareTitle = byId("decisionMemoryCompare")?.querySelector?.(".decision-memory-compare-head b");
    if (compareTitle) compareTitle.textContent = "Comparer les deux derniers relevés Market Memory";

    return { build: BUILD_3950, market, analytical, separation: "strict" };
  }

  function markdown(data = render() || { market: marketState(), analytical: analyticalState() }) {
    const market = data.market || marketState();
    const analytical = data.analytical || analyticalState();
    const confidence = market.intelligence?.confidence || {};
    return [
      "# Agent-Crypto — Decision Board Dual Memory Reader", "",
      `- Build : ${BUILD_3950}`,
      `- Généré : ${new Date().toISOString()}`,
      "- Contrat : MARKET ≠ CURRENT · lecture seule · aucune fusion", "",
      "## Market Memory", "",
      `- Snapshots canoniques : ${market.canonical}`,
      `- Relevés source : ${market.sourceRecords}`,
      `- Fil principal : ${market.primary}`,
      `- Collecteurs : ${market.collectors}`,
      `- Horizons : ${horizonLine(market)}`,
      `- Continuité : ${confidence.label || "faible"} · ${Number(confidence.score || 0)}/100`,
      `- Dernier marché : ${market.intelligence?.latest_at || "—"}`, "",
      "## Analytical Memory", "",
      `- CURRENT détaillés : ${analytical.count}`,
      `- CURRENT vérifiés : ${analytical.verified}`,
      `- Journal fermé : ${analytical.journal}`,
      `- Journal sans payload : ${analytical.journalOnly}`,
      `- Collecteurs analytiques : ${analytical.collectors}`,
      `- Dernier fingerprint : ${analytical.latestFingerprint || "—"}`,
      `- Dernier CURRENT : ${analytical.latestAt || "—"}`, "",
      "## Séparation", "",
      "- Market Memory décrit la continuité des observations marché.",
      "- Analytical Memory conserve les CURRENT fermés Atlas 4/4 → NØX → Aerith.",
      "- Les deux mémoires sont lues ensemble par le Decision Board mais leurs compteurs, horizons, scores et timelines ne sont jamais fusionnés.",
      "- 39.5.0 n’effectue pas encore de validation rétrospective des décisions : ce sera une responsabilité séparée.",
      "- Aucun ordre financier, achat, vente ou rendement futur n’est produit."
    ].join("\n");
  }

  function exportMarkdown() {
    const body = markdown();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    if (typeof globalThis.downloadTextFile === "function") {
      globalThis.downloadTextFile(`agent_crypto_dual_memory_${stamp}.md`, "text/markdown;charset=utf-8", body);
      return body;
    }
    try {
      const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agent_crypto_dual_memory_${stamp}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (_) {}
    return body;
  }

  const baseRenderDecisionBoard = typeof globalThis.renderDecisionBoard === "function"
    ? globalThis.renderDecisionBoard
    : null;
  if (baseRenderDecisionBoard) {
    globalThis.renderDecisionBoard = function renderDecisionBoard3950(...args) {
      const result = baseRenderDecisionBoard.apply(this, args);
      try { render(); } catch (_) {}
      return result;
    };
  }

  document.addEventListener("click", event => {
    const id = event?.target?.closest?.("button")?.id || "";
    if (id === "btnAtlasAnalyticalMemoryRefresh394") queueMicrotask(() => { try { render(); } catch (_) {} });
  });

  globalThis.__AGENT_CRYPTO_DECISION_DUAL_MEMORY_3950__ = Object.freeze({
    build: BUILD_3950,
    role: "read-only dual memory reader",
    market_memory: "39.4.4R1",
    analytical_memory: "39.4",
    fused: false,
    starts_atlas: false,
    writes_memory: false,
    new_fetch: false,
    new_timer: false,
    new_websocket: false
  });
  globalThis.atlasDecisionBoardDualMemory3950 = Object.freeze({ render, markdown });

  queueMicrotask(() => { try { render(); } catch (_) {} });
})();
