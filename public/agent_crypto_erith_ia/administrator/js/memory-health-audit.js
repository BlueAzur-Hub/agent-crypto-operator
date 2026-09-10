(() => {
  "use strict";

  /* ============================================================
     39.8.0R2 — MEMORY HEALTH TRUTH REPAIR · READ-ONLY LOCK

     CONTRACT
     - Read Market Memory 39.4.4R1, Analytical Memory 39.4,
       Multi-Collector 39.7.0 and the existing Collector state.
     - Reuse the canonical identity/time primitives already owned by Core.
     - Separate STRUCTURE, COVERAGE and CONTINUITY verdicts.
     - A missing second collector, unavailable Local↔GitHub comparison or
       an interruption of collection MUST NOT become a structural defect.
     - Historical gaps are observations, never proof of corruption.
     - NEVER repair, delete, merge, rewrite or fabricate memory.
     - NEVER launch Atlas, NØX, Aerith, Bridge or Ollama.
     - NO fetch, timer, WebSocket or storage write.
     ============================================================ */

  const BUILD_3980R2 = "39.8.0R2";
  const ROOT_ID = "atlasMemoryHealth3980";
  const TOP5 = Object.freeze(["BTC", "ETH", "BNB", "XRP", "SOL"]);

  const byId = id => document.getElementById(id);
  const setText = (id, value) => {
    const node = byId(id);
    if (node) node.textContent = String(value ?? "—");
  };
  const safeCall = (fn, fallback = null) => {
    try { return typeof fn === "function" ? fn() : fallback; }
    catch (_) { return fallback; }
  };

  function parseTime(value) {
    if (value == null) return 0;
    if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : 0;
    const text = String(value).trim();
    if (!text) return 0;
    const parsed = Date.parse(text);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  function coreCanonicalId(record) {
    try {
      if (typeof atlasMemoryCanonicalSnapshotId === "function") {
        return String(atlasMemoryCanonicalSnapshotId(record) || "").trim();
      }
    } catch (_) {}
    const nested = record?.snapshot?.market_snapshot || {};
    const direct = String(
      record?.market_snapshot_id ||
      record?.source_snapshot_id ||
      nested?.snapshot_id ||
      nested?.snapshotId ||
      ""
    ).trim();
    if (direct) return direct;
    const sourceTime = String(
      record?.market_generated_at ||
      record?.source_time ||
      nested?.source_time ||
      ""
    ).trim();
    return sourceTime ? `legacy-source-time:${sourceTime}` : "";
  }

  function directCanonicalId(record) {
    const nested = record?.snapshot?.market_snapshot || {};
    return String(
      record?.market_snapshot_id ||
      record?.source_snapshot_id ||
      nested?.snapshot_id ||
      nested?.snapshotId ||
      ""
    ).trim();
  }

  function identityResolution(record) {
    const direct = directCanonicalId(record);
    if (direct) return { id: coreCanonicalId(record) || direct, mode: "direct" };
    const resolved = coreCanonicalId(record);
    if (!resolved) return { id: "", mode: "missing" };
    return {
      id: resolved,
      mode: resolved.startsWith("legacy-source-time:") ? "legacy-time" : "core-fallback"
    };
  }

  function recordTime(record) {
    try {
      if (typeof atlasMemoryRecordTime === "function") {
        const value = atlasMemoryRecordTime(record);
        const parsed = parseTime(value);
        if (parsed) return parsed;
      }
    } catch (_) {}
    const nested = record?.snapshot?.market_snapshot || {};
    return parseTime(
      record?.market_generated_at ||
      record?.source_time ||
      nested?.source_time ||
      record?.saved_at ||
      record?.last_seen_at
    );
  }

  function collectorId(record) {
    return String(record?.collector_id || "local-legacy").trim() || "local-legacy";
  }

  function assets(record) {
    if (Array.isArray(record?.assets)) return record.assets;
    if (Array.isArray(record?.snapshot?.market_snapshot?.assets)) return record.snapshot.market_snapshot.assets;
    return [];
  }

  function isCurrent(record) {
    if (!record || typeof record !== "object") return false;
    if (record.analytical_current === true) return true;
    if (String(record.record_kind || "").toUpperCase() === "CURRENT") return true;
    try {
      return typeof atlasCurrentMemoryFingerprint34 === "function"
        && !!atlasCurrentMemoryFingerprint34(record);
    } catch (_) { return false; }
  }

  function isMarketCandidate(record) {
    if (!record || typeof record !== "object" || isCurrent(record)) return false;
    if (record.market_observation === true) return true;
    if (String(record.record_kind || "").toUpperCase() === "MARKET") return true;
    const nested = record?.snapshot?.market_snapshot || {};
    return Array.isArray(record?.assets) || Array.isArray(nested?.assets);
  }

  function validPriceRows(record) {
    const valid = [];
    for (const row of assets(record)) {
      const symbol = String(row?.symbol || "").toUpperCase();
      const price = Number(row?.price_eur);
      if (!TOP5.includes(symbol)) continue;
      if (!Number.isFinite(price) || price <= 0) continue;
      valid.push({ symbol, price });
    }
    return valid;
  }

  function canonicalRows(stats) {
    if (Array.isArray(stats?.canonicalRecords)) return stats.canonicalRecords;
    if (Array.isArray(stats?.records)) return stats.records;
    return [];
  }

  function sourceRows(stats) {
    if (Array.isArray(stats?.marketRecords)) return stats.marketRecords;
    if (Array.isArray(stats?.rawRecords)) return stats.rawRecords;
    return [];
  }

  function normalizedCollectorRows() {
    try {
      if (typeof readCollectorMemory !== "function") return [];
      const rows = readCollectorMemory();
      return Array.isArray(rows) ? rows : [];
    } catch (_) { return []; }
  }

  function collectorStorageTruth() {
    let ready = null;
    let mode = "unknown";
    let last = null;
    try { if (typeof atlasCollectorStorageReady !== "undefined") ready = !!atlasCollectorStorageReady; } catch (_) {}
    try { if (typeof atlasCollectorStorageMode !== "undefined") mode = String(atlasCollectorStorageMode || "unknown"); } catch (_) {}
    try {
      if (typeof atlasCollectorStorageLastResult !== "undefined" && atlasCollectorStorageLastResult) {
        last = atlasCollectorStorageLastResult;
      }
    } catch (_) {}

    const apiReadable = typeof readCollectorMemory === "function";
    const indexed = mode === "indexeddb";
    const fallback = mode === "legacy_fallback";
    const lastOk = !!last?.ok;
    const digestVerified = indexed && lastOk && !!String(last?.digest || "").trim();
    const readVerified = indexed && ready === true && (lastOk || apiReadable);

    let code = "unknown";
    let label = "ÉTAT INCONNU";
    let detail = "État interne Collector indisponible à cette lecture.";
    if (digestVerified) {
      code = "write-verified";
      label = "INDEXEDDB ÉCRIT + RELU";
      detail = `Dernière persistance vérifiée${last?.count != null ? ` · ${Number(last.count)} trace(s)` : ""}.`;
    } else if (readVerified) {
      code = "read-verified";
      label = "INDEXEDDB LISIBLE";
      detail = `Backend IndexedDB prêt${last?.status ? ` · état ${String(last.status)}` : ""}.`;
    } else if (fallback) {
      code = "legacy-fallback";
      label = "SECOURS LECTURE SEULE";
      detail = String(last?.error_message || "IndexedDB indisponible ; ancien LocalStorage utilisé en lecture seule.");
    } else if (ready === false || mode === "starting") {
      code = "starting";
      label = "INITIALISATION";
      detail = "Le backend Collector n’a pas encore terminé son initialisation.";
    } else if (apiReadable) {
      code = "api-only";
      label = "API LISIBLE";
      detail = "API Collector lisible ; état backend détaillé non exposé.";
    }

    return {
      ready,
      mode,
      last,
      apiReadable,
      code,
      label,
      detail,
      verified: code === "write-verified" || code === "read-verified"
    };
  }

  function median(values) {
    const rows = values.filter(value => Number.isFinite(value) && value > 0).slice().sort((a, b) => a - b);
    if (!rows.length) return null;
    const middle = Math.floor(rows.length / 2);
    return rows.length % 2 ? rows[middle] : (rows[middle - 1] + rows[middle]) / 2;
  }

  function duration(ms) {
    if (!Number.isFinite(ms) || ms < 0) return "—";
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours < 48) return rest ? `${hours} h ${rest} min` : `${hours} h`;
    const days = Math.floor(hours / 24);
    const restHours = hours % 24;
    return restHours ? `${days} j ${restHours} h` : `${days} j`;
  }

  function localTime(value) {
    const t = typeof value === "number" ? value : parseTime(value);
    return t ? new Date(t).toLocaleString("fr-FR") : "—";
  }

  function derive() {
    const market = safeCall(globalThis.atlasMarketMemoryStats3944R1, {}) || {};
    const intelligence = safeCall(globalThis.atlasMemoryIntelligenceCompute, {}) || {};
    const analytical = safeCall(globalThis.atlasAnalyticalMemoryStats394, {}) || {};
    const multi = safeCall(globalThis.atlasMultiCollectorConcordance3970?.derive, {}) || {};

    const source = sourceRows(market);
    const canonical = canonicalRows(market);
    const storageRows = normalizedCollectorRows();
    const storageMarketRows = storageRows.filter(isMarketCandidate);
    const collectors = Array.isArray(market.collectors)
      ? market.collectors.map(String)
      : [...new Set(source.map(collectorId))];

    const sourceIdentity = source.map(row => ({ row, ...identityResolution(row) }));
    const missingCanonical = sourceIdentity.filter(item => !item.id);
    const legacyResolved = sourceIdentity.filter(item => item.mode === "legacy-time" || item.mode === "core-fallback");

    const missingPayload = canonical.filter(row => validPriceRows(row).length < 3);
    const invalidTime = source.filter(row => !recordTime(row));

    // readCollectorMemory() is already normalized by the Core. This check can
    // detect residual duplicates in the normalized store, but MUST NOT pretend
    // to reconstruct pre-normalization duplicates that no longer exist.
    const normalizedSeen = new Map();
    let normalizedResidualDuplicates = 0;
    for (const row of storageMarketRows) {
      const id = coreCanonicalId(row);
      if (!id) continue;
      const key = `${collectorId(row)}::${id}`;
      const count = (normalizedSeen.get(key) || 0) + 1;
      normalizedSeen.set(key, count);
      if (count > 1) normalizedResidualDuplicates += 1;
    }

    const timeline = canonical.map(recordTime).filter(Boolean).sort((a, b) => a - b);
    const intervals = [];
    for (let i = 1; i < timeline.length; i += 1) intervals.push(timeline[i] - timeline[i - 1]);
    const medianGap = median(intervals);
    const adaptiveGapThreshold = medianGap ? medianGap * 3 : null;
    const interruptions = adaptiveGapThreshold
      ? intervals.filter(value => value > adaptiveGapThreshold)
      : [];
    const largestGap = intervals.length ? Math.max(...intervals) : null;

    const neutralizedRepeats = Math.max(0, Number(market.duplicateObservations || 0));
    const crossCollectorCopies = Math.max(0, Number(market.crossCollectorCopies || 0));
    const currentCount = Number(analytical.count || 0);
    const verifiedCount = Number(analytical.verifiedCount || 0);
    const journalCount = Number(analytical.journalCount || 0);
    const journalOnly = Number(analytical.journalOnlyCount || 0);

    const localGithub = intelligence?.local_github || {};
    const localGithubAvailable = !!(localGithub?.ready || localGithub?.available || localGithub?.comparable);
    const storage = collectorStorageTruth();

    const declaredCanonicalCount = Number(market.canonicalCount ?? market.distinctCount ?? canonical.length);
    const declaredSourceCount = Number(market.sourceRecordCount ?? source.length);
    const countMismatch = Math.max(0,
      (Number.isFinite(declaredCanonicalCount) && declaredCanonicalCount !== canonical.length ? 1 : 0) +
      (Number.isFinite(declaredSourceCount) && declaredSourceCount !== source.length ? 1 : 0)
    );

    const structuralDefects =
      missingCanonical.length +
      missingPayload.length +
      invalidTime.length +
      normalizedResidualDuplicates +
      countMismatch;

    let structure = {
      code: "healthy",
      label: "SAINE",
      detail: "Aucune incohérence structurelle détectée dans les enregistrements actuellement lisibles."
    };
    if (!canonical.length && !source.length) {
      structure = {
        code: "waiting",
        label: "EN ATTENTE",
        detail: "Aucune Market Memory lisible pour établir l’intégrité structurelle."
      };
    } else if (structuralDefects > 0) {
      structure = {
        code: "attention",
        label: "À VÉRIFIER",
        detail: `${structuralDefects} anomalie(s) structurelle(s) réellement observée(s) dans les données lisibles.`
      };
    }

    const coverageReasons = [];
    if (journalOnly > 0) coverageReasons.push(`${journalOnly} preuve(s) CURRENT historique(s) sans payload détaillé`);
    if (multi?.status?.code === "insufficient" || Number(multi?.recentCollectors?.length || 0) < 2) {
      coverageReasons.push("concordance multi-collecteur insuffisante");
    }
    if (!localGithubAvailable) coverageReasons.push("comparaison Local ↔ GitHub indisponible");
    const coverage = coverageReasons.length
      ? {
          code: "partial",
          label: "PARTIELLE",
          detail: coverageReasons.join(" · ")
        }
      : {
          code: "complete",
          label: "DISPONIBLE",
          detail: "Aucune limite de couverture supplémentaire détectée par les lecteurs actuellement branchés."
        };

    let continuity = {
      code: "insufficient",
      label: "INSUFFISANTE",
      detail: "Pas assez d’intervalles canoniques pour caractériser la continuité de collecte."
    };
    if (intervals.length) {
      continuity = interruptions.length
        ? {
            code: "interrupted",
            label: "INTERRUPTION OBSERVÉE",
            detail: `${interruptions.length} intervalle(s) atypique(s) au-delà du seuil descriptif médiane ×3 ; cela décrit une absence de collecte, pas une corruption.`
          }
        : {
            code: "observed",
            label: "OBSERVÉE",
            detail: "Aucune interruption atypique détectée dans la timeline canonique observée."
          };
    }

    const status = structure.code === "attention"
      ? { code: "attention", label: "STRUCTURE À VÉRIFIER", detail: structure.detail }
      : structure.code === "waiting"
        ? { code: "waiting", label: "EN ATTENTE", detail: structure.detail }
        : {
            code: "ok",
            label: "STRUCTURE SAINE",
            detail: `Structure saine · couverture ${coverage.label.toLowerCase()} · continuité ${continuity.label.toLowerCase()}.`
          };

    return {
      build: BUILD_3980R2,
      generatedAt: new Date().toISOString(),
      status,
      verdicts: { structure, coverage, continuity },
      market: {
        canonicalCount: declaredCanonicalCount,
        sourceCount: declaredSourceCount,
        canonicalArrayCount: canonical.length,
        sourceArrayCount: source.length,
        normalizedStorageRecords: storageRows.length,
        normalizedStorageMarketRows: storageMarketRows.length,
        collectors: collectors.length,
        neutralizedRepeats,
        crossCollectorCopies,
        missingCanonical: missingCanonical.length,
        legacyResolved: legacyResolved.length,
        missingPayload: missingPayload.length,
        invalidTime: invalidTime.length,
        normalizedResidualDuplicates,
        countMismatch,
        latestAt: intelligence?.latest_at || (timeline.length ? new Date(timeline[timeline.length - 1]).toISOString() : null)
      },
      analytical: { currentCount, verifiedCount, journalCount, journalOnly },
      continuity: {
        intervals: intervals.length,
        medianGap,
        adaptiveGapThreshold,
        interruptions: interruptions.length,
        largestGap
      },
      storage,
      multi: {
        knownCollectors: Number(multi?.knownCollectors?.length || collectors.length),
        recentCollectors: Number(multi?.recentCollectors?.length || 0),
        pairCount: Number(multi?.pairCount || 0),
        statusCode: multi?.status?.code || "unavailable",
        status: multi?.status?.label || "INDISPONIBLE"
      },
      localGithub: {
        available: localGithubAvailable,
        label: localGithubAvailable ? "COMPARABLE" : "INDISPONIBLE"
      },
      evidence: {
        identityResolver: typeof atlasMemoryCanonicalSnapshotId === "function" ? "Core atlasMemoryCanonicalSnapshotId" : "fallback compatible Core",
        timeResolver: typeof atlasMemoryRecordTime === "function" ? "Core atlasMemoryRecordTime" : "fallback compatible Core",
        duplicateScope: "post-normalisation uniquement ; le passé pré-normalisation n’est pas reconstruit"
      },
      contract: "STRUCTURE ≠ COUVERTURE ≠ CONTINUITÉ · DIAGNOSTIC ≠ RÉPARATION · MARKET ≠ CURRENT"
    };
  }

  function ensureRoot() {
    let root = byId(ROOT_ID);
    if (root) return root;
    const anchor = byId("atlasMultiCollector3970") || byId("atlasAnalyticalMemory394") || byId("atlasMemoryIntelligence");
    if (!anchor) return null;

    root = document.createElement("section");
    root.id = ROOT_ID;
    root.className = "atlas-memory-intelligence";
    root.dataset.state = "waiting";
    root.setAttribute("aria-labelledby", "atlasMemoryHealthTitle3980R2");
    root.innerHTML = `
      <div class="atlas-memory-intelligence-head">
        <div>
          <p class="eyebrow">MEMORY HEALTH · 39.8.0R2 · TRUTH REPAIR · READ ONLY</p>
          <h5 id="atlasMemoryHealthTitle3980R2">Structure · couverture · continuité</h5>
          <p>Trois verdicts séparés. Une preuve absente ou une pause de collecte n’est jamais appelée corruption mémoire.</p>
        </div>
        <span class="pill warn" id="atlasMemoryHealthBadge3980R2">En attente</span>
      </div>
      <div class="atlas-memory-ledger-35" aria-label="Verdicts Memory Health">
        <article><span>Structure</span><b id="memoryHealthStructure3980R2">—</b><small id="memoryHealthStructureDetail3980R2">Intégrité des enregistrements lisibles.</small></article>
        <article><span>Couverture</span><b id="memoryHealthCoverage3980R2">—</b><small id="memoryHealthCoverageDetail3980R2">Ce qui est réellement vérifiable.</small></article>
        <article><span>Continuité</span><b id="memoryHealthContinuity3980R2">—</b><small id="memoryHealthContinuityDetail3980R2">Intervalles de collecte observés, sans cadence imposée.</small></article>
        <article><span>Stockage</span><b id="memoryHealthStorage3980R2">—</b><small id="memoryHealthStorageDetail3980R2">État interne Collector, pas un libellé relu dans le DOM.</small></article>
      </div>
      <div class="atlas-memory-intelligence-grid">
        <article><span>Market Memory</span><b id="memoryHealthMarket3980R2">—</b><small id="memoryHealthMarketDetail3980R2">Canoniques / source / collecteurs.</small></article>
        <article><span>Identités canoniques</span><b id="memoryHealthIdentity3980R2">—</b><small id="memoryHealthIdentityDetail3980R2">Résolution par la primitive canonique du Core.</small></article>
        <article><span>Payload marché</span><b id="memoryHealthPayload3980R2">—</b><small id="memoryHealthPayloadDetail3980R2">Prix EUR strictement numériques et positifs.</small></article>
        <article><span>Répétitions</span><b id="memoryHealthDuplicates3980R2">—</b><small id="memoryHealthDuplicatesDetail3980R2">Répétitions F5 et résidus post-normalisation séparés.</small></article>
        <article><span>Chronologie</span><b id="memoryHealthTimeline3980R2">—</b><small id="memoryHealthTimelineDetail3980R2">Interruption observée ≠ corruption.</small></article>
        <article><span>Analytical Memory</span><b id="memoryHealthCurrent3980R2">—</b><small id="memoryHealthCurrentDetail3980R2">CURRENT détaillés / preuves historiques.</small></article>
        <article><span>Multi-Collector</span><b id="memoryHealthMulti3980R2">—</b><small id="memoryHealthMultiDetail3980R2">Couverture de concordance uniquement.</small></article>
        <article><span>Local ↔ GitHub</span><b id="memoryHealthLocalGithub3980R2">—</b><small id="memoryHealthLocalGithubDetail3980R2">Indisponible reste indisponible, sans pénalité structurelle.</small></article>
        <article class="decision-memory-v2-action"><span>Contrat</span><b id="memoryHealthContract3980R2">STRUCTURE ≠ COUVERTURE ≠ CONTINUITÉ</b><small>Aucune suppression, fusion, correction ou fabrication de mémoire.</small></article>
      </div>
      <div class="atlas-memory-intelligence-actions">
        <button type="button" id="btnMemoryHealthRefresh3980R2">Actualiser Memory Health</button>
        <button type="button" id="btnMemoryHealthExport3980R2">Exporter Memory Health .md</button>
      </div>
      <p id="memoryHealthStatus3980R2">Diagnostic en attente.</p>`;

    anchor.insertAdjacentElement("afterend", root);
    byId("btnMemoryHealthRefresh3980R2")?.addEventListener("click", render);
    byId("btnMemoryHealthExport3980R2")?.addEventListener("click", exportMarkdown);
    return root;
  }

  function render() {
    const root = ensureRoot();
    if (!root) return null;
    const data = derive();
    const market = data.market;
    const analytical = data.analytical;

    setText("atlasMemoryHealthBadge3980R2", data.status.label);
    const badge = byId("atlasMemoryHealthBadge3980R2");
    if (badge) badge.className = `pill ${data.status.code === "ok" ? "ok" : "warn"}`;

    setText("memoryHealthStructure3980R2", data.verdicts.structure.label);
    setText("memoryHealthStructureDetail3980R2", data.verdicts.structure.detail);
    setText("memoryHealthCoverage3980R2", data.verdicts.coverage.label);
    setText("memoryHealthCoverageDetail3980R2", data.verdicts.coverage.detail);
    setText("memoryHealthContinuity3980R2", data.verdicts.continuity.label);
    setText("memoryHealthContinuityDetail3980R2", data.verdicts.continuity.detail);
    setText("memoryHealthStorage3980R2", data.storage.label);
    setText("memoryHealthStorageDetail3980R2", data.storage.detail);

    setText("memoryHealthMarket3980R2", `${market.canonicalCount} canonique(s) · ${market.sourceCount} source · ${market.collectors} collecteur(s)`);
    setText("memoryHealthMarketDetail3980R2", `Dernier marché : ${localTime(market.latestAt)} · store normalisé ${market.normalizedStorageMarketRows} ligne(s) marché.`);

    setText("memoryHealthIdentity3980R2", market.missingCanonical ? "À VÉRIFIER" : "RÉSOLUES");
    setText("memoryHealthIdentityDetail3980R2", `${market.missingCanonical} identité(s) réellement manquante(s) · ${market.legacyResolved} identité(s) héritée(s) résolue(s) par le Core.`);

    setText("memoryHealthPayload3980R2", market.missingPayload ? `${market.missingPayload} PARTIEL(S)` : "OK");
    setText("memoryHealthPayloadDetail3980R2", `${market.invalidTime} timestamp(s) invalide(s) · minimum 3 actifs TOP5 avec price_eur numérique > 0.`);

    setText("memoryHealthDuplicates3980R2", `${market.neutralizedRepeats} F5 neutralisé(s)`);
    setText("memoryHealthDuplicatesDetail3980R2", `${market.normalizedResidualDuplicates} doublon(s) résiduel(s) dans le store déjà normalisé · ${market.crossCollectorCopies} autre(s) origine(s) du même état.`);

    setText("memoryHealthTimeline3980R2", data.continuity.interruptions ? `${data.continuity.interruptions} interruption(s) observée(s)` : data.continuity.intervals ? "Aucune interruption atypique" : "Insuffisant");
    setText("memoryHealthTimelineDetail3980R2", data.continuity.intervals
      ? `Pas médian ${duration(data.continuity.medianGap)} · seuil descriptif ×3 ${duration(data.continuity.adaptiveGapThreshold)} · plus grand intervalle ${duration(data.continuity.largestGap)} · aucune cadence obligatoire déduite.`
      : "Pas assez d’intervalles pour caractériser la timeline.");

    setText("memoryHealthCurrent3980R2", `${analytical.currentCount} CURRENT · ${analytical.verifiedCount} vérifié(s)`);
    setText("memoryHealthCurrentDetail3980R2", `Journal fermé ${analytical.journalCount} · ${analytical.journalOnly} preuve(s) ancienne(s) sans payload détaillé, conservée(s) comme couverture partielle.`);

    setText("memoryHealthMulti3980R2", data.multi.status);
    setText("memoryHealthMultiDetail3980R2", `${data.multi.knownCollectors} connu(s) · ${data.multi.recentCollectors} récent(s) · ${data.multi.pairCount} paire(s) comparable(s) · n’affecte pas la santé structurelle.`);

    setText("memoryHealthLocalGithub3980R2", data.localGithub.label);
    setText("memoryHealthLocalGithubDetail3980R2", data.localGithub.available
      ? "Les deux côtés nécessaires sont lisibles par la couche mémoire."
      : "Comparaison non disponible : limite de couverture uniquement, aucune anomalie structurelle inventée.");

    setText("memoryHealthContract3980R2", data.contract);
    setText("memoryHealthStatus3980R2", `${data.status.label} · ${data.status.detail}`);

    root.dataset.state = data.status.code;
    root.dataset.build = BUILD_3980R2;
    root.dataset.readOnly = "true";
    root.dataset.structure = data.verdicts.structure.code;
    root.dataset.coverage = data.verdicts.coverage.code;
    root.dataset.continuity = data.verdicts.continuity.code;
    return data;
  }

  function markdown(data = derive()) {
    return [
      "# Agent-Crypto — Memory Health Truth Repair", "",
      `- Build : ${BUILD_3980R2}`,
      `- Généré : ${data.generatedAt}`,
      `- Structure : ${data.verdicts.structure.label}`,
      `- Couverture : ${data.verdicts.coverage.label}`,
      `- Continuité : ${data.verdicts.continuity.label}`,
      `- État global : ${data.status.label}`, "",
      "## Structure", "",
      `- Verdict : ${data.verdicts.structure.label} — ${data.verdicts.structure.detail}`,
      `- Snapshots canoniques : ${data.market.canonicalCount}`,
      `- Relevés source : ${data.market.sourceCount}`,
      `- Identités réellement manquantes : ${data.market.missingCanonical}`,
      `- Identités héritées résolues par le Core : ${data.market.legacyResolved}`,
      `- Payloads TOP5 partiels : ${data.market.missingPayload}`,
      `- Timestamps invalides : ${data.market.invalidTime}`,
      `- Doublons résiduels post-normalisation : ${data.market.normalizedResidualDuplicates}`,
      `- Mismatch compteurs API/tableaux : ${data.market.countMismatch}`,
      `- Résolveur identité : ${data.evidence.identityResolver}`,
      `- Résolveur temps : ${data.evidence.timeResolver}`, "",
      "## Couverture", "",
      `- Verdict : ${data.verdicts.coverage.label} — ${data.verdicts.coverage.detail}`,
      `- Collecteurs connus : ${data.multi.knownCollectors}`,
      `- Collecteurs récents : ${data.multi.recentCollectors}`,
      `- Paires comparables : ${data.multi.pairCount}`,
      `- Concordance : ${data.multi.status}`,
      `- Local ↔ GitHub : ${data.localGithub.label}`,
      `- CURRENT détaillés : ${data.analytical.currentCount}`,
      `- Journal fermé : ${data.analytical.journalCount}`,
      `- Journal sans payload détaillé : ${data.analytical.journalOnly}`, "",
      "## Continuité", "",
      `- Verdict : ${data.verdicts.continuity.label} — ${data.verdicts.continuity.detail}`,
      `- Intervalles observés : ${data.continuity.intervals}`,
      `- Pas médian : ${duration(data.continuity.medianGap)}`,
      `- Seuil descriptif médiane ×3 : ${duration(data.continuity.adaptiveGapThreshold)}`,
      `- Interruptions atypiques observées : ${data.continuity.interruptions}`,
      `- Plus grand intervalle : ${duration(data.continuity.largestGap)}`,
      "- Une interruption de collecte n’est pas une corruption mémoire et aucune cadence obligatoire n’est inventée.", "",
      "## Stockage", "",
      `- État : ${data.storage.label}`,
      `- Détail : ${data.storage.detail}`,
      `- Backend déclaré : ${data.storage.mode}`,
      `- Store normalisé : ${data.market.normalizedStorageRecords} trace(s) · ${data.market.normalizedStorageMarketRows} ligne(s) marché`,
      `- Portée doublons : ${data.evidence.duplicateScope}`,
      `- Répétitions F5 neutralisées : ${data.market.neutralizedRepeats}`, "",
      "## Contrat", "",
      "- STRUCTURE ≠ COUVERTURE ≠ CONTINUITÉ.",
      "- DIAGNOSTIC ≠ RÉPARATION.",
      "- MARKET ≠ CURRENT.",
      "- Aucun ancien payload n’est reconstruit artificiellement.",
      "- Aucune suppression, fusion, correction ou écriture mémoire.",
      "- Aucun fetch, timer, WebSocket, Atlas, NØX, Aerith, Bridge ou Ollama."
    ].join("\n");
  }

  function exportMarkdown() {
    const body = markdown();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const name = `agent_crypto_memory_health_truth_${stamp}.md`;
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

  const baseMemoryRender = typeof globalThis.atlasMemoryIntelligenceRender === "function"
    ? globalThis.atlasMemoryIntelligenceRender
    : null;
  if (baseMemoryRender) {
    globalThis.atlasMemoryIntelligenceRender = function atlasMemoryIntelligenceRender3980R2(...args) {
      const result = baseMemoryRender.apply(this, args);
      try { render(); } catch (_) {}
      return result;
    };
  }

  const healthContract3980R2 = Object.freeze({
    build: BUILD_3980R2,
    role: "read-only memory health truth audit",
    verdicts_separated: true,
    uses_core_canonical_identity: true,
    treats_collection_gap_as_corruption: false,
    penalizes_missing_second_collector_as_structure: false,
    penalizes_missing_local_github_as_structure: false,
    repairs_memory: false,
    fabricates_history: false,
    starts_atlas: false,
    starts_nox: false,
    starts_aerith: false,
    writes_memory: false,
    new_fetch: false,
    new_timer: false,
    new_websocket: false
  });
  globalThis.__AGENT_CRYPTO_MEMORY_HEALTH_3980R2__ = healthContract3980R2;
  globalThis.__AGENT_CRYPTO_MEMORY_HEALTH_3980__ = healthContract3980R2; // compatibility sentinel

  const api = Object.freeze({ derive, render, markdown });
  globalThis.atlasMemoryHealth3980R2 = api;
  globalThis.atlasMemoryHealth3980 = api; // compatibility alias for 39.8 readers/tools

  queueMicrotask(() => { try { render(); } catch (_) {} });
})();
