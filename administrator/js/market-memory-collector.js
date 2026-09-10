(() => {
  "use strict";

  /* ============================================================
     39.4.4R1 — MARKET MEMORY SINGLE TRUTH COUNTERS LOCK

     PURPOSE
     - Restore automatic Market Memory on top of the already-working
       Collector IndexedDB infrastructure.
     - Never modify the recovered 39.4.3R1 application core logic.
     - Keep Analytical CURRENT records separate.

     STORAGE CONTRACT
     - Market observations: existing Collector IndexedDB
       agent_crypto_local_memory / memory / collector_memory_primary.
     - Analytical CURRENT: existing CURRENT/Auto Memory path, read only here.
     - Canonical dedupe: collector_id + market_snapshot_id.

     NO NEW fetch / timer / WebSocket / Atlas / NØX / Aerith / Bridge / Ollama.
     ============================================================ */

  const BUILD_3944 = "39.4.4R1";
  const MARKET_SCHEMA_3944 = "atlas_market_memory_v3944r1";
  let captureChain3944 = Promise.resolve();

  function appState3944() {
    try { return typeof state !== "undefined" && state ? state : null; }
    catch (_) { return null; }
  }

  function isCurrent3944(record) {
    if (!record || typeof record !== "object") return false;
    if (record.analytical_current === true) return true;
    if (String(record.record_kind || "").toUpperCase() === "CURRENT") return true;
    try {
      return typeof atlasCurrentMemoryFingerprint34 === "function"
        && !!atlasCurrentMemoryFingerprint34(record);
    } catch (_) { return false; }
  }

  function distinctCurrents3944(records) {
    const map = new Map();
    for (const record of Array.isArray(records) ? records : []) {
      if (!isCurrent3944(record)) continue;
      let key = "";
      try {
        key = typeof atlasCurrentMemoryFingerprint34 === "function"
          ? String(atlasCurrentMemoryFingerprint34(record) || "")
          : "";
      } catch (_) {}
      key = key || String(record.analysis_fingerprint || record.current_fingerprint || record.id || record.saved_at || "");
      if (key) map.set(key, record);
    }
    return [...map.values()].sort((a, b) => Date.parse(a?.saved_at || 0) - Date.parse(b?.saved_at || 0));
  }

  function collectorRows3944() {
    try {
      if (typeof readCollectorMemory !== "function") return [];
      const raw = readCollectorMemory();
      const market = typeof atlasCollectorMarketObservationRecords === "function"
        ? atlasCollectorMarketObservationRecords(raw)
        : raw.filter(record => {
            const assets = record?.snapshot?.market_snapshot?.assets;
            return Array.isArray(assets) && assets.some(asset => Number.isFinite(Number(asset?.price_eur)));
          });
      return Array.isArray(market) ? market : [];
    } catch (_) { return []; }
  }

  function adaptMarketRecord3944(record) {
    const nested = record?.snapshot?.market_snapshot || {};
    const assets = Array.isArray(record?.assets) && record.assets.length
      ? record.assets
      : Array.isArray(nested?.assets) ? nested.assets : [];
    const collector = String(record?.collector_id || "local-legacy");
    return {
      ...record,
      collector_id: collector,
      collector_type: record?.collector_type || "local_browser",
      record_kind: "MARKET",
      market_observation: true,
      analytical_current: false,
      assets,
      market_snapshot_id: record?.market_snapshot_id || nested?.snapshot_id || null,
      market_generated_at: record?.market_generated_at || nested?.source_time || record?.source_time || null,
      source_time: record?.source_time || nested?.source_time || record?.market_generated_at || null
    };
  }

  function marketRows3944() {
    const adapted = collectorRows3944().map(adaptMarketRecord3944);
    try {
      return typeof atlasDistinctMarketMemory === "function"
        ? atlasDistinctMarketMemory(adapted)
        : adapted;
    } catch (_) { return adapted; }
  }

  function currentRows3944() {
    try {
      return typeof readAutoMemory === "function" ? distinctCurrents3944(readAutoMemory()) : [];
    } catch (_) { return []; }
  }

  function canonicalId3944(record = null) {
    let id = "";
    try {
      if (record && typeof atlasMemoryCanonicalSnapshotId === "function") {
        id = String(atlasMemoryCanonicalSnapshotId(record) || "").trim();
      }
    } catch (_) {}
    if (id) return id;
    try {
      if (typeof atlasAutomation341SnapshotId === "function") {
        id = String(atlasAutomation341SnapshotId() || "").trim();
      }
    } catch (_) {}
    if (id) return id;
    const s = appState3944();
    return String(s?.sourceLock?.snapshotId || s?.dataBroker?.market?.snapshotId || s?.dataBroker?.marketFrame?.id || "").trim();
  }

  function recordTime3944(record) {
    try {
      if (typeof atlasMemoryRecordTime === "function") return Date.parse(atlasMemoryRecordTime(record) || 0) || 0;
    } catch (_) {}
    return Date.parse(record?.market_generated_at || record?.source_time || record?.last_seen_at || record?.saved_at || 0) || 0;
  }

  function canonicalSnapshots3944(sourceRecords) {
    const byCanonical = new Map();
    for (const record of Array.isArray(sourceRecords) ? sourceRecords : []) {
      const canonical = canonicalId3944(record) || `unknown:${record?.collector_id || "local"}:${record?.id || record?.saved_at || Math.random()}`;
      const previous = byCanonical.get(canonical);
      if (!previous || recordTime3944(record) >= recordTime3944(previous)) byCanonical.set(canonical, record);
    }
    return [...byCanonical.values()].sort((a, b) => recordTime3944(a) - recordTime3944(b));
  }

  function marketStats3944() {
    // sourceRecords are already deduplicated by the historic collector + canonical snapshot contract.
    // canonicalRecords collapse the same market snapshot seen by several collectors into ONE market state.
    const sourceRecords = marketRows3944();
    const canonicalRecords = canonicalSnapshots3944(sourceRecords);
    const currentRecords = currentRows3944();
    const orderedSource = [...sourceRecords].sort((a, b) => recordTime3944(a) - recordTime3944(b));
    const last = orderedSource[orderedSource.length - 1] || null;
    const lastCollector = String(last?.collector_id || "local-legacy");
    const lastCanonical = canonicalId3944(last);
    const previous = last
      ? [...orderedSource].reverse().find(record => {
          if (record === last) return false;
          if (String(record?.collector_id || "local-legacy") !== lastCollector) return false;
          const id = canonicalId3944(record);
          return !!id && !!lastCanonical && id !== lastCanonical;
        }) || null
      : null;
    const collectors = [...new Set(sourceRecords.map(record => String(record?.collector_id || "local-legacy")))];
    const repeatedSameCollector = Math.max(0, sourceRecords.reduce((sum, row) => sum + Math.max(1, Number(row?.observation_count || 1)), 0) - sourceRecords.length);
    const crossCollectorCopies = Math.max(0, sourceRecords.length - canonicalRecords.length);
    return {
      rawRecords: sourceRecords,
      records: canonicalRecords,
      canonicalRecords,
      marketRecords: sourceRecords,
      currentRecords,
      collectors,
      allCollectors: collectors,
      last,
      previous,
      lastCollector,
      distinctCount: canonicalRecords.length,
      canonicalCount: canonicalRecords.length,
      sourceRecordCount: sourceRecords.length,
      allDistinctCount: canonicalRecords.length + currentRecords.length,
      duplicateObservations: repeatedSameCollector,
      crossCollectorCopies,
      comparable: !!(last && previous),
      analyticalBasis: "MARKET",
      basis: "MARKET"
    };
  }

  function renderMarketTruth3944() {
    try { atlasMemoryIntelligenceRender?.(); } catch (_) {}
    try { renderDecisionBoard?.(); } catch (_) {}
    try { atlasOperatorSummaryRender35?.(); } catch (_) {}
    try { atlasMultiCollectorOperatorRender?.(); } catch (_) {}
    try { renderCollectorStatus?.(); } catch (_) {}
  }

  function buildCollectorMarketRecord3944() {
    const s = appState3944();
    if (!s?.liveOk || !Array.isArray(s.coins) || !s.coins.length) return null;
    const canonical = canonicalId3944();
    if (!canonical) return null;

    const base = typeof makeAutoSnapshot === "function" ? makeAutoSnapshot() : null;
    if (!base || !Array.isArray(base.assets) || !base.assets.length) return null;

    const collector = String(base.collector_id || (typeof getCollectorId === "function" ? getCollectorId() : "local-legacy"));
    const now = new Date().toISOString();
    const safeIdentity = canonical.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 180);
    const id = `${collector}_market_${safeIdentity}`;
    const sourceTime = base.market_generated_at || base.source_time || s?.sourceLock?.timestamp || s?.timestamp || null;
    let publicSnapshot = null;
    try { publicSnapshot = typeof publicMarketSnapshot === "function" ? publicMarketSnapshot() : null; } catch (_) {}

    return {
      ...base,
      id,
      snapshot_id: id,
      schema: MARKET_SCHEMA_3944,
      memory_schema: MARKET_SCHEMA_3944,
      collector_id: collector,
      collector_type: "local_browser",
      record_kind: "MARKET",
      market_observation: true,
      analytical_current: false,
      analysis_fingerprint: null,
      current_fingerprint: null,
      saved_at: now,
      first_saved_at: now,
      last_seen_at: now,
      observation_count: 1,
      market_snapshot_id: canonical,
      market_generated_at: sourceTime,
      source_time: sourceTime,
      snapshot: {
        generated_at: now,
        version: typeof ATLAS_RELEASE !== "undefined" ? ATLAS_RELEASE : BUILD_3944,
        public_only: true,
        market_snapshot: {
          ...(publicSnapshot || {}),
          snapshot_id: canonical,
          source_time: sourceTime,
          live_ok: true,
          assets: base.assets
        }
      }
    };
  }

  async function captureMarket3944(reason = "market_refresh") {
    if (typeof atlasCollectorInitializeStorage !== "function"
        || typeof readCollectorMemory !== "function"
        || typeof writeCollectorMemory !== "function"
        || typeof atlasCollectorPersistNow !== "function") {
      return { ok:false, skipped:"collector-indexeddb-api-missing" };
    }

    await atlasCollectorInitializeStorage();
    const record = buildCollectorMarketRecord3944();
    if (!record) return { ok:false, skipped:"market-not-canonical-or-not-ready" };

    const canonical = canonicalId3944(record);
    const collector = String(record.collector_id || "local-legacy");
    const originalRecords = readCollectorMemory();
    const records = originalRecords.slice();
    const index = records.findIndex(existing => {
      const nestedAssets = existing?.snapshot?.market_snapshot?.assets;
      if (!Array.isArray(nestedAssets) || !nestedAssets.length) return false;
      return String(existing?.collector_id || "local-legacy") === collector
        && canonicalId3944(existing) === canonical;
    });

    let changed = false;
    if (index >= 0) {
      const existing = records[index];
      records[index] = {
        ...existing,
        ...record,
        saved_at: existing?.saved_at || record.saved_at,
        first_saved_at: existing?.first_saved_at || existing?.saved_at || record.saved_at,
        last_seen_at: record.saved_at,
        observation_count: Math.max(1, Number(existing?.observation_count || 1)) + 1
      };
    } else {
      records.push(record);
      changed = true;
    }

    const beforeWrite = originalRecords;

    writeCollectorMemory(records, `market_memory_3944_${reason}`);
    const persisted = await atlasCollectorPersistNow(`market_memory_3944_${reason}_verified`);
    if (!persisted?.ok) {
      try {
        writeCollectorMemory(beforeWrite, `market_memory_3944_${reason}_rollback`);
        await atlasCollectorPersistNow(`market_memory_3944_${reason}_rollback_verified`);
      } catch (_) {}
      return { ok:false, skipped:"indexeddb-write-not-verified", persisted };
    }

    const verified = readCollectorMemory().find(existing =>
      String(existing?.collector_id || "local-legacy") === collector
      && canonicalId3944(existing) === canonical
    ) || null;
    if (!verified) {
      try {
        writeCollectorMemory(beforeWrite, `market_memory_3944_${reason}_rollback`);
        await atlasCollectorPersistNow(`market_memory_3944_${reason}_rollback_verified`);
      } catch (_) {}
      return { ok:false, skipped:"indexeddb-reread-missing-canonical-record" };
    }

    renderMarketTruth3944();
    return {
      ok:true,
      changed,
      canonical,
      collector,
      observation_count:Number(verified?.observation_count || 1),
      distinct:marketRows3944().length,
      persisted
    };
  }

  function queueCapture3944(reason) {
    captureChain3944 = captureChain3944
      .catch(() => null)
      .then(() => captureMarket3944(reason))
      .catch(error => {
        console.warn("Market Memory 39.4.4", error);
        return { ok:false, error:String(error?.message || error) };
      });
    return captureChain3944;
  }

  atlasDecisionMemoryStats = function atlasDecisionMemoryStats3944() {
    return marketStats3944();
  };

  atlasMemoryIntelligenceCompute = function atlasMemoryIntelligenceCompute3944() {
    const stats = marketStats3944();
    const market = stats.marketRecords;
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
    confidenceScore += Math.min(20, Math.max(0, stats.collectors.length - 1) * 10);
    if (Number.isFinite(ageMin) && ageMin <= 30) confidenceScore += 10;
    if (collectors.ready && Number(collectors.spread) <= 0.5) confidenceScore += 15;
    confidenceScore = Math.max(0, Math.min(100, Math.round(confidenceScore)));
    const confidenceLabel = confidenceScore >= 75 ? "renforcée" : confidenceScore >= 50 ? "moyenne" : "faible";

    return {
      schema: MARKET_SCHEMA_3944,
      generated_at: new Date().toISOString(),
      records: stats.canonicalCount,
      canonical_snapshots: stats.canonicalCount,
      source_records: stats.sourceRecordCount,
      market_observations: stats.canonicalCount,
      analytical_records: stats.currentRecords.length,
      all_distinct_records: stats.allDistinctCount,
      cross_collector_copies: stats.crossCollectorCopies,
      basis: "MARKET",
      primary_collector: primary.collector,
      primary_records: primary.records.length,
      collectors_count: stats.collectors.length,
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

  atlasMemoryLedgerRender35 = function atlasMemoryLedgerRender3944() {
    const stats = marketStats3944();
    const set = (id, text) => {
      const node = document.getElementById(id);
      if (node) node.textContent = text;
    };
    set("atlasMemoryMarketCount35", String(stats.canonicalCount));
    set("atlasMemoryCurrentCount35", String(stats.currentRecords.length));
    set("atlasMemoryCollectorCount35", String(stats.collectors.length));
    set("atlasMemoryBasis35", "MARKET MEMORY");
    set("atlasMemoryBasisDetail35", `${stats.canonicalCount} snapshot(s) canonique(s) · ${stats.sourceRecordCount} relevé(s) source conservé(s) · ${stats.crossCollectorCopies} autre(s) origine(s) du même état marché. Les horizons 3 / 5 / 10 utilisent uniquement la timeline canonique du fil principal.`);
    const marketCount = document.getElementById("atlasMemoryMarketCount35");
    const marketCard = marketCount?.closest("article");
    const marketLabel = marketCard?.querySelector("span");
    const marketDetail = marketCard?.querySelector("small");
    if (marketLabel) marketLabel.textContent = "Snapshots canoniques";
    if (marketDetail) marketDetail.textContent = `${stats.sourceRecordCount} relevé(s) source conservé(s) sur ${stats.collectors.length} collecteur(s), regroupés par identité marché canonique.`;
    return stats;
  };

  if (typeof atlasMemoryLedgerRender34 === "function") {
    const currentLedgerBase3944 = atlasMemoryLedgerRender34;
    atlasMemoryLedgerRender34 = function atlasMemoryLedgerRender34SingleTruth3944() {
      const currentStats = currentLedgerBase3944();
      const marketStats = marketStats3944();
      const value = document.getElementById("atlasMemoryCurrentLedger34");
      const detail = document.getElementById("atlasMemoryCurrentLedger34Detail");
      if (value) value.textContent = `${currentStats.currentRecords.length} CURRENT canonique(s)`;
      if (detail) {
        const missing = currentStats.missingJournal?.length || 0;
        detail.textContent = `Market Memory séparée : ${marketStats.canonicalCount} snapshot(s) canonique(s) · ${marketStats.sourceRecordCount} relevé(s) source. Journal ${currentStats.journal?.length || 0} CURRENT · ${missing ? `${missing} ancien(s) sans payload complet, non fabriqué(s)` : "journal aligné"}.`;
      }
      return currentStats;
    };
  }

  if (typeof atlasMemoryIntelligenceRender === "function") {
    const renderBase3944 = atlasMemoryIntelligenceRender;
    atlasMemoryIntelligenceRender = function atlasMemoryIntelligenceRender3944() {
      const data = renderBase3944();
      const stats = marketStats3944();
      atlasMemoryLedgerRender35();
      const root = document.getElementById("atlasMemoryIntelligence");
      const status = document.getElementById("atlasMemoryIntelligenceStatus");
      if (status) {
        const latest = data?.latest_at ? new Date(data.latest_at).toLocaleString("fr-FR") : "aucune";
        status.textContent = `${stats.canonicalCount} snapshot(s) marché canonique(s) · ${stats.sourceRecordCount} relevé(s) source conservé(s) · fil principal ${data?.primary_records || 0} relevé(s) · ${stats.currentRecords.length} CURRENT analytique(s) séparé(s) · dernier marché ${latest} · IndexedDB Collector vérifié.`;
      }
      if (root) {
        root.dataset.memoryBasis = "market-indexeddb-collector";
        root.dataset.marketObservations = String(stats.canonicalCount);
        root.dataset.marketSourceRecords = String(stats.sourceRecordCount);
        root.dataset.analyticalCurrents = String(stats.currentRecords.length);
      }
      return data;
    };
  }

  if (typeof atlasOperatorSummaryRender35 === "function") {
    const operatorBase3944 = atlasOperatorSummaryRender35;
    atlasOperatorSummaryRender35 = function atlasOperatorSummaryRender3944() {
      const result = operatorBase3944();
      const memory = atlasMemoryIntelligenceCompute();
      const stats = marketStats3944();
      const value = document.getElementById("atlasOperatorMemory35");
      const detail = document.getElementById("atlasOperatorMemoryDetail35");
      if (value) value.textContent = `${stats.canonicalCount} snapshot(s) marché`;
      if (detail) detail.textContent = `Market Memory : ${stats.sourceRecordCount} relevé(s) source · ${stats.collectors.length} collecteur(s) · 3=${memory?.horizons?.[3]?.records || 0}/3 · 5=${memory?.horizons?.[5]?.records || 0}/5 · 10=${memory?.horizons?.[10]?.records || 0}/10 · ${stats.currentRecords.length} CURRENT analytique(s) séparé(s).`;
      return result;
    };
  }

  atlasMemoryIntelligenceMarkdown = function atlasMemoryIntelligenceMarkdown3944(data = atlasMemoryIntelligenceCompute()) {
    const stats = marketStats3944();
    const lines = [
      "# Agent-Crypto — Market Memory", "",
      `- Build : ${typeof ATLAS_BUILD !== "undefined" ? ATLAS_BUILD : BUILD_3944}`,
      `- Généré : ${data.generated_at}`,
      `- Backend : IndexedDB Collector · ${typeof atlasCollectorStorageMode !== "undefined" ? atlasCollectorStorageMode : "inconnu"}`,
      `- Snapshots marché canoniques distincts : ${stats.canonicalCount}`,
      `- Relevés source conservés : ${stats.sourceRecordCount}`,
      `- Autres origines du même snapshot : ${stats.crossCollectorCopies}`,
      `- CURRENT analytiques conservés séparément : ${stats.currentRecords.length}`,
      `- Collecteurs marché : ${stats.collectors.length}`,
      `- Fil principal : ${data.primary_collector || "—"} · ${data.primary_records || 0} relevé(s)`, "",
      "## Horizons marché 3 / 5 / 10", ""
    ];
    ATLAS_MEMORY_INTELLIGENCE_HORIZONS.forEach(size => {
      const horizon = data.horizons?.[size];
      lines.push(`- ${size} observations : ${horizon?.label || `collecte ${horizon?.records || 0}/${size}`}`);
    });
    lines.push(
      "", "## Contrat", "",
      "- Identité canonique : collector_id + market_snapshot_id.",
      "- Relecture du même snapshot : observation_count augmente, aucun faux snapshot distinct n’est créé.",
      "- Les observations marché sont écrites puis relues depuis IndexedDB Collector.",
      "- Les CURRENT Atlas → NØX → Aerith restent dans Analytical Memory.",
      "- Market Memory ne lance jamais Atlas, NØX, Aerith, Bridge ou Ollama."
    );
    return lines.join("\n");
  };

  if (typeof atlasAfterLivecheck === "function") {
    const afterLivecheckBase3944 = atlasAfterLivecheck;
    atlasAfterLivecheck = function atlasAfterLivecheck3944(options = {}) {
      const result = afterLivecheckBase3944(options);
      const s = appState3944();
      if (s?.liveOk && Array.isArray(s.coins) && s.coins.length && canonicalId3944()) {
        queueMicrotask(() => { void queueCapture3944(String(options?.reason || "livecheck")); });
      }
      return result;
    };
  }

  // Existing valid state may already be hydrated before this module executes.
  // The same canonical snapshot is deduplicated, so this cannot create a false 2/3.
  Promise.resolve()
    .then(() => typeof atlasCollectorInitializeStorage === "function" ? atlasCollectorInitializeStorage() : null)
    .then(() => {
      renderMarketTruth3944();
      const s = appState3944();
      if (s?.liveOk && Array.isArray(s.coins) && s.coins.length && canonicalId3944()) {
        return queueCapture3944("boot-valid-state");
      }
      return null;
    })
    .catch(error => console.warn("Market Memory 39.4.4 init", error));

  try {
    globalThis.__AGENT_CRYPTO_MARKET_MEMORY_3944R1__ = Object.freeze({
      build: BUILD_3944,
      schema: MARKET_SCHEMA_3944,
      storage: "existing Collector IndexedDB agent_crypto_local_memory",
      canonical_identity: "collector_id + market_snapshot_id",
      source_of_truth: "one canonical market snapshot truth shared by Market Memory and Decision Board",
      counter_contract: "canonical snapshots != source records != collectors",
      current_memory: "separate read-only analytical path",
      core_app_rewrite: false,
      starts_atlas: false,
      new_timer: false,
      new_fetch: false,
      new_websocket: false
    });
    globalThis.atlasMarketMemoryCapture3944R1 = reason => queueCapture3944(reason || "diagnostic");
    globalThis.atlasMarketMemoryStats3944R1 = marketStats3944;
  } catch (_) {}
})();
