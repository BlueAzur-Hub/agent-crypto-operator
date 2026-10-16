(() => {
  "use strict";

  /* ============================================================
     39.3.0 — MARKET MEMORY RESTORATION LOCK
     Market Memory = ordinary market observations only.
     CURRENT stays preserved as a separate analytical unit.
     No new fetch, timer, Atlas/NØX/Aerith, Bridge or Ollama call.
     ============================================================ */

  const MARKET_MEMORY_SCHEMA = "atlas_market_memory_v390";

  function isAnalyticalCurrent(record) {
    if (!record) return false;
    if (record.analytical_current === true) return true;
    if (String(record.record_kind || "").toUpperCase() === "CURRENT") return true;
    try {
      return typeof atlasCurrentMemoryFingerprint34 === "function" && !!atlasCurrentMemoryFingerprint34(record);
    } catch (_) {
      return false;
    }
  }

  function splitMemory() {
    const raw = typeof readAutoMemory === "function" ? readAutoMemory() : [];
    const distinct = typeof atlasDistinctMarketMemory === "function" ? atlasDistinctMarketMemory(raw) : raw;
    const marketRecords = distinct.filter(record => !isAnalyticalCurrent(record));
    const currentRecords = distinct.filter(record => isAnalyticalCurrent(record));
    const marketCollectors = [...new Set(marketRecords.map(record => String(record?.collector_id || "local-legacy")).filter(Boolean))];
    const allCollectors = [...new Set(distinct.map(record => String(record?.collector_id || "local-legacy")).filter(Boolean))];
    return { raw, distinct, marketRecords, currentRecords, marketCollectors, allCollectors };
  }

  function marketStats() {
    const split = splitMemory();
    const records = split.marketRecords;
    const last = records.length ? records[records.length - 1] : null;
    const lastCollector = last?.collector_id || "local-legacy";
    const lastCanonicalId = last && typeof atlasMemoryCanonicalSnapshotId === "function"
      ? atlasMemoryCanonicalSnapshotId(last)
      : null;
    const previous = last
      ? [...records].reverse().find(record => {
          if (record === last || String(record?.collector_id || "local-legacy") !== String(lastCollector) || !Array.isArray(record?.assets)) return false;
          const id = typeof atlasMemoryCanonicalSnapshotId === "function" ? atlasMemoryCanonicalSnapshotId(record) : null;
          return !lastCanonicalId || !id || id !== lastCanonicalId;
        }) || null
      : null;
    return {
      rawRecords: split.raw,
      records,
      marketRecords: split.marketRecords,
      currentRecords: split.currentRecords,
      collectors: split.marketCollectors,
      allCollectors: split.allCollectors,
      last,
      previous,
      lastCollector,
      distinctCount: records.length,
      allDistinctCount: split.distinct.length,
      duplicateObservations: Math.max(0, split.raw.length - split.distinct.length),
      comparable: !!(last && previous),
      analyticalBasis: "MARKET",
      basis: "MARKET"
    };
  }

  // Future ordinary snapshots are explicitly identified as market observations.
  // Existing legacy market observations remain valid because CURRENT evidence is
  // detected independently from this new marker.
  if (typeof makeAutoSnapshot === "function") {
    const makeAutoSnapshotBase = makeAutoSnapshot;
    makeAutoSnapshot = function makeAutoSnapshot390() {
      const record = makeAutoSnapshotBase();
      if (!record) return record;
      return {
        ...record,
        memory_schema: MARKET_MEMORY_SCHEMA,
        record_kind: "MARKET",
        market_observation: true,
        analytical_current: false
      };
    };
  }

  atlasDecisionMemoryStats = function atlasDecisionMemoryStats390() {
    return marketStats();
  };

  atlasMemoryIntelligenceCompute = function atlasMemoryIntelligenceCompute390() {
    const split = splitMemory();
    const market = split.marketRecords;
    const primary = atlasMemoryIntelligencePrimaryTimeline(market);
    const horizons = Object.fromEntries(
      ATLAS_MEMORY_INTELLIGENCE_HORIZONS.map(size => [size, atlasMemoryIntelligenceHorizon(primary.records, size)])
    );
    const persistence = atlasMemoryIntelligencePersistence(primary.records);
    const collectors = atlasMemoryIntelligenceCollectorConfirmation(market);
    const localGithub = atlasMemoryIntelligenceLocalGithub(market);
    const sectors = atlasMemoryIntelligencePersistentSectors(primary.records);
    const latest = primary.records[primary.records.length - 1] || market[market.length - 1] || null;
    const anomaly = atlasMemoryIntelligenceAnomaly(latest);
    const pumps = atlasMemoryIntelligencePumps(primary.records);
    const latestTime = Date.parse(atlasMemoryRecordTime(latest) || 0);
    const ageMin = latestTime ? Math.max(0, (Date.now() - latestTime) / 60000) : null;

    let confidenceScore = 15;
    confidenceScore += Math.min(40, primary.records.length * 4);
    confidenceScore += Math.min(20, Math.max(0, split.marketCollectors.length - 1) * 10);
    if (Number.isFinite(ageMin) && ageMin <= 30) confidenceScore += 10;
    if (collectors.ready && Number(collectors.spread) <= 0.5) confidenceScore += 15;
    confidenceScore = Math.max(0, Math.min(100, Math.round(confidenceScore)));
    const confidenceLabel = confidenceScore >= 75 ? "renforcée" : confidenceScore >= 50 ? "moyenne" : "faible";

    return {
      schema: MARKET_MEMORY_SCHEMA,
      generated_at: new Date().toISOString(),
      records: primary.records.length,
      market_observations: market.length,
      analytical_records: split.currentRecords.length,
      all_distinct_records: split.distinct.length,
      basis: "MARKET",
      primary_collector: primary.collector,
      primary_records: primary.records.length,
      collectors_count: split.marketCollectors.length,
      horizons,
      persistence,
      collectors,
      local_github: localGithub,
      sectors,
      anomaly,
      pumps,
      confidence: {
        score: confidenceScore,
        label: confidenceLabel,
        meaning: "continuité des observations marché, pas probabilité de marché"
      },
      latest_at: atlasMemoryRecordTime(latest)
    };
  };

  atlasMemoryLedgerRender35 = function atlasMemoryLedgerRender390() {
    const split = splitMemory();
    const set = (id, text) => {
      const node = document.getElementById(id);
      if (node) node.textContent = text;
    };
    set("atlasMemoryMarketCount35", String(split.marketRecords.length));
    set("atlasMemoryCurrentCount35", String(split.currentRecords.length));
    set("atlasMemoryCollectorCount35", String(split.marketCollectors.length));
    set("atlasMemoryBasis35", "MARKET MEMORY");
    set("atlasMemoryBasisDetail35", "Les horizons 3 / 5 / 10 utilisent exclusivement les observations marché. Les CURRENT analytiques restent conservés séparément.");
    return split;
  };

  const memoryRenderBase = atlasMemoryIntelligenceRender;
  atlasMemoryIntelligenceRender = function atlasMemoryIntelligenceRender390() {
    const data = memoryRenderBase();
    const split = atlasMemoryLedgerRender35();
    const root = document.getElementById("atlasMemoryIntelligence");
    const eyebrow = root?.querySelector(".atlas-memory-intelligence-head .eyebrow");
    const title = document.getElementById("atlasMemoryIntelligenceTitle");
    const intro = title?.nextElementSibling;
    const status = document.getElementById("atlasMemoryIntelligenceStatus");
    const exportButton = document.getElementById("btnAtlasMemoryExport");

    if (eyebrow) eyebrow.textContent = "MARKET MEMORY · 3 / 5 / 10 OBSERVATIONS";
    if (title) title.textContent = "Continuité réelle du marché · indépendante d’Atlas";
    if (intro) intro.textContent = "Lecture rétrospective des observations marché déjà mémorisées. Les CURRENT Atlas restent séparés et ne participent jamais aux horizons 3 / 5 / 10.";
    if (exportButton) exportButton.textContent = "Exporter Market Memory .md";
    if (status && data) {
      const latest = data.latest_at ? new Date(data.latest_at).toLocaleString("fr-FR") : "aucune";
      status.textContent = `${split.marketRecords.length} observation(s) marché distincte(s) · fil principal ${data.primary_records || 0} relevé(s) · ${split.currentRecords.length} CURRENT analytique(s) conservé(s) à part · dernier marché ${latest}. Market Memory ne déclenche jamais Atlas.`;
    }
    if (root) {
      root.dataset.memoryBasis = "market";
      root.dataset.marketObservations = String(split.marketRecords.length);
      root.dataset.analyticalCurrents = String(split.currentRecords.length);
    }
    return data;
  };

  atlasMemoryIntelligenceMarkdown = function atlasMarketMemoryMarkdown390(data = atlasMemoryIntelligenceCompute()) {
    const split = splitMemory();
    const lines = [
      "# Agent-Crypto — Market Memory", "",
      `- Build : ${ATLAS_BUILD}`,
      `- Généré : ${data.generated_at}`,
      `- Observations marché distinctes : ${split.marketRecords.length}`,
      `- CURRENT analytiques conservés séparément : ${split.currentRecords.length}`,
      `- Collecteurs marché : ${split.marketCollectors.length}`,
      `- Fil principal : ${data.primary_collector || "—"} · ${data.primary_records || 0} relevé(s)`, "",
      "## Horizons marché 3 / 5 / 10", ""
    ];
    ATLAS_MEMORY_INTELLIGENCE_HORIZONS.forEach(size => {
      const horizon = data.horizons?.[size];
      lines.push(`- ${size} observations : ${horizon?.label || `collecte ${horizon?.records || 0}/${size}`}`);
    });
    lines.push(
      "", "## Persistance", "",
      ...(data.persistence?.length
        ? data.persistence.map(row => `- ${row.symbol} : ${row.state} · ${Number.isFinite(row.total) ? `${row.total >= 0 ? "+" : ""}${row.total.toFixed(2)} %` : "indisponible"} · cohérence ${(Number(row.consistency || 0) * 100).toFixed(0)} %`)
        : ["- Données marché insuffisantes."]),
      "", "## Séparation des responsabilités", "",
      "- Market Memory lit et compare les observations marché.",
      "- Les CURRENT Atlas 4/4 → NØX → Aerith restent des unités analytiques séparées.",
      "- Market Memory ne lance jamais Atlas, NØX, Aerith, Bridge ou Ollama.",
      "- Aucun ordre, achat, vente ou rendement futur n’est produit."
    );
    return lines.join("\n");
  };

  if (typeof atlasOperatorSummaryRender35 === "function") {
    const operatorSummaryBase = atlasOperatorSummaryRender35;
    atlasOperatorSummaryRender35 = function atlasOperatorSummaryRender390() {
      const result = operatorSummaryBase();
      const memory = atlasMemoryIntelligenceCompute();
      const split = splitMemory();
      const value = document.getElementById("atlasOperatorMemory35");
      const detail = document.getElementById("atlasOperatorMemoryDetail35");
      if (value) value.textContent = `${split.marketRecords.length} observations marché`;
      if (detail) detail.textContent = `Market Memory : 3=${memory?.horizons?.[3]?.records || 0}/3 · 5=${memory?.horizons?.[5]?.records || 0}/5 · 10=${memory?.horizons?.[10]?.records || 0}/10 · ${split.currentRecords.length} CURRENT analytique(s) séparé(s).`;
      return result;
    };
  }

  atlasDecisionBoardV2Comparison = function atlasDecisionBoardV2Comparison390(stats) {
    const last = stats?.last || null;
    const previous = stats?.previous || null;
    if (!last || !previous) {
      return { ready: false, lines: [], meta: "Deux observations marché distinctes du même collecteur sont nécessaires." };
    }
    const symbols = ["BTC", "ETH", "BNB", "XRP", "SOL"];
    const lines = symbols.map(symbol => {
      const first = atlasMemoryIntelligenceAsset(previous, symbol);
      const second = atlasMemoryIntelligenceAsset(last, symbol);
      const delta = atlasMemoryIntelligencePctDelta(first, second);
      return Number.isFinite(delta) ? `${symbol} ${delta >= 0 ? "+" : ""}${delta.toFixed(2)} %` : `${symbol} —`;
    });
    const firstTime = atlasMemoryRecordTime(previous);
    const lastTime = atlasMemoryRecordTime(last);
    return {
      ready: true,
      lines,
      meta: `${firstTime ? new Date(firstTime).toLocaleString("fr-FR") : "ancien"} → ${lastTime ? new Date(lastTime).toLocaleString("fr-FR") : "récent"} · ${stats.lastCollector || "collecteur"}`
    };
  };

  try {
    globalThis.__AGENT_CRYPTO_MARKET_MEMORY_390__ = Object.freeze({
      build: ATLAS_BUILD,
      schema: MARKET_MEMORY_SCHEMA,
      basis: "MARKET",
      horizons: [3, 5, 10],
      starts_atlas: false,
      new_timer: false,
      new_fetch: false,
      storage: "existing AUTO_MEMORY_KEY; CURRENT preserved separately"
    });
  } catch (_) {}

  queueMicrotask(() => {
    try { atlasMemoryIntelligenceRender(); } catch (_) {}
    try { renderDecisionBoard(); } catch (_) {}
    try { atlasOperatorSummaryRender35(); } catch (_) {}
  });
})();
