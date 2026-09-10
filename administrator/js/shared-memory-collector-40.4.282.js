(() => {
  "use strict";

  /* 40.4.282 — Shared Market Memory uses the existing Collector IndexedDB owner.
     MARKET only. Analytical CURRENT remains in Auto/Analytical Memory.
     No Atlas/Oracle/Strategy/Paper/Bridge/network owner change. */
  const BUILD = "40.4.282";
  const SCHEMA = "atlas_shared_market_memory_v2";

  const clone = value => {
    if (value === undefined) return undefined;
    try { return structuredClone(value); } catch (_) {}
    return JSON.parse(JSON.stringify(value));
  };

  const cleanId = value => {
    try { if (typeof cleanCollectorId === "function") return cleanCollectorId(value); } catch (_) {}
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
  };

  function assetsOf(record) {
    if (Array.isArray(record?.assets) && record.assets.length) return record.assets;
    const nested = record?.snapshot?.market_snapshot?.assets;
    return Array.isArray(nested) ? nested : [];
  }

  function isCurrent(record) {
    if (!record || typeof record !== "object") return false;
    if (record.analytical_current === true || String(record.record_kind || "").toUpperCase() === "CURRENT") return true;
    try { return typeof atlasCurrentMemoryFingerprint34 === "function" && !!atlasCurrentMemoryFingerprint34(record); }
    catch (_) { return false; }
  }

  function canonicalOf(record) {
    try {
      if (typeof atlasMemoryCanonicalSnapshotId === "function") {
        const id = String(atlasMemoryCanonicalSnapshotId(record) || "").trim();
        if (id && !id.startsWith("current:")) return id;
      }
    } catch (_) {}
    const nested = record?.snapshot?.market_snapshot || {};
    const direct = String(record?.market_snapshot_id || record?.source_snapshot_id || nested?.snapshot_id || "").trim();
    if (direct) return direct;
    const t = String(record?.market_generated_at || record?.source_time || nested?.source_time || "").trim();
    return t ? `legacy-source-time:${t}` : "";
  }

  function sourceTimeOf(record) {
    const nested = record?.snapshot?.market_snapshot || {};
    return String(record?.market_generated_at || record?.source_time || nested?.source_time || "").trim() || null;
  }

  function collectorOf(record, payload) {
    const p = record?.shared_memory_provenance || {};
    for (const value of [record?.collector_id, p.collector_id, record?.imported_from_collector_id, record?.machine_id, payload?.exporter_collector_id]) {
      const id = cleanId(value);
      if (id) return id;
    }
    return "";
  }

  function adapt(record, payload, index) {
    if (!record || typeof record !== "object") throw new Error(`record ${index + 1}: objet absent`);
    if (isCurrent(record)) return null;
    const assets = assetsOf(record);
    if (!assets.length) throw new Error(`record ${index + 1}: aucun actif marché`);
    const collector = collectorOf(record, payload);
    if (!collector) throw new Error(`record ${index + 1}: provenance collecteur absente`);
    const canonical = canonicalOf(record);
    if (!canonical) throw new Error(`record ${index + 1}: identité snapshot marché absente`);
    const nested = record?.snapshot?.market_snapshot || {};
    const sourceTime = sourceTimeOf(record);
    const savedAt = String(record?.saved_at || record?.first_saved_at || sourceTime || payload?.exported_at || "").trim();
    if (!Number.isFinite(Date.parse(savedAt))) throw new Error(`record ${index + 1}: saved_at invalide`);
    const marketId = String(record?.market_snapshot_id || record?.source_snapshot_id || nested?.snapshot_id || (!canonical.startsWith("legacy-source-time:") ? canonical : "")).trim() || null;
    const id = String(record?.id || record?.snapshot_id || `${collector}_market_${canonical.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 180)}`);
    return {
      ...clone(record),
      id,
      snapshot_id: String(record?.snapshot_id || id),
      collector_id: collector,
      machine_id: collector,
      collector_type: record?.collector_type || "local_browser",
      record_kind: "MARKET",
      market_observation: true,
      analytical_current: false,
      assets: clone(assets),
      market_snapshot_id: marketId,
      market_generated_at: record?.market_generated_at || sourceTime,
      source_time: record?.source_time || sourceTime,
      saved_at: savedAt,
      first_saved_at: record?.first_saved_at || savedAt,
      last_seen_at: record?.last_seen_at || savedAt,
      observation_count: Math.max(1, Number(record?.observation_count || 1)),
      shared_memory_provenance: {
        ...(record?.shared_memory_provenance || {}),
        locked: true,
        collector_id: collector,
        source_exporter_collector_id: cleanId(payload?.exporter_collector_id) || collector,
        source_record_id: String(record?.id || record?.snapshot_id || canonical),
        imported_via: "shared_market_memory_404282"
      },
      snapshot: {
        ...clone(record?.snapshot || {}),
        generated_at: record?.snapshot?.generated_at || savedAt,
        version: record?.snapshot?.version || record?.version || `Build ${BUILD} · Administrator`,
        public_only: true,
        market_snapshot: {
          ...clone(nested),
          snapshot_id: marketId || nested?.snapshot_id || null,
          source_time: sourceTime || nested?.source_time || null,
          live_ok: record?.live_ok ?? nested?.live_ok ?? true,
          assets: clone(assets)
        }
      }
    };
  }

  function identity(record) {
    try { if (typeof atlasCollectorRecordIdentity === "function") return String(atlasCollectorRecordIdentity(record) || ""); } catch (_) {}
    const collector = cleanId(record?.collector_id || record?.machine_id) || "local";
    const canonical = canonicalOf(record);
    return canonical ? `market:${collector}:${canonical}` : `record:${record?.snapshot_id || record?.id || record?.saved_at || ""}`;
  }

  function proof(record) {
    return JSON.stringify({
      id: identity(record), collector: cleanId(record?.collector_id || record?.machine_id), canonical: canonicalOf(record),
      saved_at: String(record?.saved_at || ""), source_time: sourceTimeOf(record), assets: assetsOf(record).length
    });
  }

  function marketRows(records) {
    try { if (typeof atlasCollectorMarketObservationRecords === "function") return atlasCollectorMarketObservationRecords(records); } catch (_) {}
    return (records || []).filter(record => !isCurrent(record) && assetsOf(record).length);
  }

  function stats(records) {
    const market = marketRows(records);
    const collectors = new Map(), canonicals = new Set();
    for (const row of market) {
      const id = cleanId(row?.collector_id || row?.machine_id) || "local-legacy";
      collectors.set(id, (collectors.get(id) || 0) + 1);
      const canonical = canonicalOf(row); if (canonical) canonicals.add(canonical);
    }
    return { market, source: market.length, canonical: canonicals.size, collectors };
  }

  async function ensureCollector() {
    if (typeof atlasCollectorInitializeStorage !== "function" || typeof readCollectorMemory !== "function" ||
        typeof writeCollectorMemory !== "function" || typeof atlasCollectorPersistNow !== "function" ||
        typeof atlasCollectorNormalizeRecords !== "function") throw new Error("API Collector IndexedDB incomplète");
    await atlasCollectorInitializeStorage();
    if (typeof atlasCollectorStorageMode !== "undefined" && atlasCollectorStorageMode === "legacy_fallback") {
      throw new Error("Collector IndexedDB indisponible : import refusé sans mutation");
    }
  }

  function normalize(records) { return atlasCollectorNormalizeRecords(records); }
  function sameState(a, b) { return JSON.stringify(normalize(a).map(proof)) === JSON.stringify(normalize(b).map(proof)); }

  async function rollback(before, reason) {
    writeCollectorMemory(before, `${reason}_rollback`);
    const persisted = await atlasCollectorPersistNow(`${reason}_rollback_verified`);
    if (!persisted?.ok || !sameState(before, readCollectorMemory())) throw new Error("ROLLBACK COLLECTOR NON VÉRIFIÉ");
  }

  async function mergePayload(payload, reason = "shared_market_memory_404282_import") {
    await ensureCollector();
    const raw = Array.isArray(payload) ? payload : Array.isArray(payload?.records) ? payload.records : [];
    if (!raw.length) throw new Error("aucun relevé trouvé");
    let skippedCurrent = 0;
    const incoming = [];
    raw.forEach((record, index) => { const row = adapt(record, payload, index); if (row) incoming.push(row); else skippedCurrent += 1; });
    if (!incoming.length) throw new Error(skippedCurrent ? "fichier CURRENT analytique uniquement ; Market Memory inchangée" : "aucun relevé marché importable");

    const before = readCollectorMemory();
    const beforeIds = new Set(before.map(identity));
    const map = new Map(before.map(row => [identity(row), clone(row)]));
    for (const row of incoming) map.set(identity(row), { ...(map.get(identity(row)) || {}), ...clone(row) });
    const candidate = normalize([...map.values()]);
    const retained = new Set(candidate.map(identity));
    const missing = [...new Set(incoming.map(identity))].filter(id => !retained.has(id));
    if (missing.length) throw new Error(`capacité Collector insuffisante : ${missing.length} relevé(s) importé(s) seraient évincés ; aucune écriture`);

    try {
      writeCollectorMemory(candidate, reason);
      const persisted = await atlasCollectorPersistNow(`${reason}_verified`);
      if (!persisted?.ok) throw new Error(`écriture IndexedDB non confirmée: ${persisted?.error_message || "persist=false"}`);
      const actual = new Map(readCollectorMemory().map(row => [identity(row), row]));
      const failures = incoming.filter(row => !actual.has(identity(row)) || proof(actual.get(identity(row))) !== proof(candidate.find(x => identity(x) === identity(row)) || row));
      if (failures.length) throw new Error(`relecture IndexedDB incomplète : ${failures.length} relevé(s)`);
      const s = stats([...actual.values()]);
      return { ok: true, read: incoming.length, added: incoming.filter(row => !beforeIds.has(identity(row))).length, skippedCurrent, records: s.source, canonical: s.canonical, collectors: [...s.collectors.keys()] };
    } catch (error) {
      await rollback(before, reason);
      throw error;
    }
  }

  function render() {
    Promise.resolve().then(ensureCollector).then(() => {
      const s = stats(readCollectorMemory());
      const local = typeof getCollectorId === "function" ? getCollectorId() : "local";
      const localCount = document.getElementById("sharedLocalCount");
      const collectorCount = document.getElementById("sharedCollectorsCount");
      const output = document.getElementById("sharedMemoryOutput");
      if (localCount) localCount.textContent = `${s.source} relevé(s) source · ${s.canonical} snapshot(s) canonique(s)`;
      if (collectorCount) collectorCount.textContent = `${s.collectors.size} · ${[...s.collectors].map(([id,n]) => `${id} (${n})`).join(" · ") || "aucun"}`;
      if (output) output.textContent = `ATLAS SHARED MARKET MEMORY — Build ${BUILD}\n\nOWNER : IndexedDB Collector vérifié\nMachine locale : ${local}\nSnapshots marché canoniques : ${s.canonical}\nRelevés source conservés : ${s.source}\nCollecteurs marché : ${[...s.collectors.keys()].join(" / ") || "aucun"}\n\nCURRENT analytiques : stockage séparé inchangé.\nPréflight rétention + persistance + relecture par identité + rollback vérifié.`;
    }).catch(error => { const out = document.getElementById("sharedMemoryOutput"); if (out) out.textContent = `SHARED MEMORY INDISPONIBLE\n\n${error.message || error}`; });
  }

  async function importFile(file) {
    if (!file) return;
    const output = document.getElementById("sharedMemoryOutput");
    try {
      const result = await mergePayload(JSON.parse(await file.text()));
      render();
      if (output) output.textContent = `✅ IMPORT MARKET MEMORY RÉUSSI · INDEXEDDB VÉRIFIÉE\n\n${result.read} relevé(s) marché lus · ${result.added} nouveau(x) · ${result.skippedCurrent} CURRENT ignoré(s)\n${result.records} relevé(s) source · ${result.canonical} snapshot(s) canonique(s)\nCollecteurs : ${result.collectors.join(" / ")}\n\nRéimport identique = 0 nouveau doublon.`;
      return result;
    } catch (error) {
      if (output) output.textContent = `❌ IMPORT MARKET MEMORY REFUSÉ\n\n${error.message || error}\n\nAucune réussite sans persistance et relecture vérifiées.`;
      throw error;
    }
  }

  async function exportShared() {
    await ensureCollector();
    const records = marketRows(readCollectorMemory());
    const s = stats(records);
    const exporter = typeof getCollectorId === "function" ? getCollectorId() : "local";
    const payload = { schema: SCHEMA, exported_at: new Date().toISOString(), exporter_collector_id: exporter, backend: "IndexedDB Collector", identity_contract: "collector_id + market_snapshot_id", analytical_current_included: false, record_count: records.length, canonical_snapshot_count: s.canonical, collectors: [...s.collectors.keys()], records };
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    downloadTextFile(`atlas_shared_market_memory_${exporter}_${stamp}.json`, "application/json", JSON.stringify(payload, null, 2));
    return payload;
  }

  function install() {
    const exportButton = document.getElementById("btnExportAutoMemory");
    if (exportButton && exportButton.dataset.sharedOwner404282 !== "1") {
      exportButton.dataset.sharedOwner404282 = "1";
      exportButton.addEventListener("click", event => { event.preventDefault(); event.stopImmediatePropagation(); void exportShared().catch(() => null); }, true);
      exportButton.title = "Exporter Market Memory depuis IndexedDB Collector";
    }
    const input = document.getElementById("autoMemoryImport");
    if (input && input.dataset.sharedOwner404282 !== "1") {
      input.dataset.sharedOwner404282 = "1";
      input.addEventListener("change", event => { event.stopImmediatePropagation(); const file = event.target?.files?.[0]; void importFile(file).catch(() => null).finally(() => { try { event.target.value = ""; } catch (_) {} }); }, true);
    }
    const clear = document.getElementById("btnClearAutoMemory");
    if (clear) { clear.textContent = "Effacer mémoire Auto/CURRENT"; clear.title = "N’efface pas Market Memory IndexedDB."; }
    try { exportAutoMemory = exportShared; } catch (_) {}
    try { importAutoMemoryFile = importFile; } catch (_) {}
    try { renderSharedMemory = render; } catch (_) {}
    globalThis.AgentCryptoSharedMemory404282 = Object.freeze({ build: BUILD, schema: SCHEMA, importPayload: mergePayload, importFile, exportPayload: exportShared, render, adapt, identity, proof });
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
