(() => {
  "use strict";

  /* 40.4.283 — Shared Memory reader consistency only.
     Reads the existing IndexedDB Collector truth exposed by market-memory-collector.js.
     No Collector mutation, import rewrite, Atlas/Oracle/Strategy/Paper/Bridge change. */
  const BUILD = "40.4.283";
  const DAY_MS = 24 * 60 * 60 * 1000;

  const byId = id => document.getElementById(id);

  function setText(id, value) {
    const node = byId(id);
    if (node) node.textContent = value;
  }

  function currentCollectorId() {
    try {
      if (typeof getCollectorId === "function") return String(getCollectorId() || "").trim();
    } catch (_) {}
    return "";
  }

  function collectorConfigured() {
    try {
      return typeof isCollectorConfigured === "function" && !!isCollectorConfigured();
    } catch (_) {
      return false;
    }
  }

  function timestampOf(record) {
    try {
      if (typeof atlasMemoryRecordTimestamp === "function") {
        const value = Number(atlasMemoryRecordTimestamp(record));
        if (Number.isFinite(value) && value > 0) return value;
      }
    } catch (_) {}
    for (const value of [
      record?.market_generated_at,
      record?.source_time,
      record?.last_seen_at,
      record?.saved_at,
      record?.first_saved_at,
      record?.snapshot?.market_snapshot?.source_time,
      record?.snapshot?.generated_at
    ]) {
      const parsed = Date.parse(value || "");
      if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
  }

  function dateLabel(value) {
    if (!Number.isFinite(value) || value <= 0) return "Aucune";
    try {
      if (typeof atlasMemoryDateLabel === "function") return atlasMemoryDateLabel(value);
    } catch (_) {}
    return new Date(value).toLocaleString("fr-FR");
  }

  function durationLabel(ms) {
    if (!Number.isFinite(ms) || ms < 0) return "—";
    try {
      if (typeof atlasMemoryDurationLabel === "function") return atlasMemoryDurationLabel(ms);
    } catch (_) {}
    if (ms < 60_000) return `${Math.round(ms / 1000)} s`;
    if (ms < 3_600_000) return `${Math.round(ms / 60_000)} min`;
    if (ms < DAY_MS) return `${(ms / 3_600_000).toFixed(ms < 10 * 3_600_000 ? 1 : 0)} h`;
    return `${(ms / DAY_MS).toFixed(ms < 10 * DAY_MS ? 1 : 0)} j`;
  }

  function median(values) {
    const sorted = (values || []).filter(v => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
    if (!sorted.length) return NaN;
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  function marketStats() {
    try {
      const value = globalThis.atlasMarketMemoryStats3944R1?.();
      if (value && typeof value === "object") return value;
    } catch (_) {}
    return {
      rawRecords: [],
      marketRecords: [],
      canonicalRecords: [],
      records: [],
      collectors: [],
      sourceRecordCount: 0,
      canonicalCount: 0
    };
  }

  function renderIdentity() {
    const id = currentCollectorId();
    const configured = collectorConfigured();
    const input = byId("collectorIdInput");
    const save = byId("btnSaveCollectorId");
    const badge = byId("collectorIdentityBadge");
    const value = byId("sharedCollectorId");

    if (input && id && (configured || document.activeElement !== input)) {
      input.value = id;
      input.placeholder = id;
    }
    if (input) {
      input.readOnly = configured;
      if (configured) input.setAttribute("aria-readonly", "true");
      else input.removeAttribute("aria-readonly");
    }

    if (save) {
      save.disabled = configured;
      save.textContent = configured ? "ID déjà configuré" : "Confirmer ID une fois";
      save.title = configured
        ? `Identité Collector verrouillée : ${id || "inconnue"}`
        : `Confirmer l’identité locale détectée : ${id || "inconnue"}`;
    }

    if (badge) badge.textContent = configured
      ? `Configuré · ${id || "inconnu"}`
      : `Détecté · ${id || "à confirmer"}`;

    if (value) {
      value.textContent = configured
        ? `${id || "inconnu"} · sauvegardé dans Firefox`
        : `${id || "inconnu"} · détecté · à confirmer`;
      const label = value.closest("article")?.querySelector("span");
      if (label) label.textContent = "Machine locale";
    }
  }

  function canonicalTimeline(stats) {
    const canonical = Array.isArray(stats?.canonicalRecords)
      ? stats.canonicalRecords
      : Array.isArray(stats?.records) ? stats.records : [];
    const rows = canonical
      .map(record => ({ record, time: timestampOf(record) }))
      .filter(item => item.time > 0)
      .sort((a, b) => a.time - b.time);

    // Market identity is already canonical upstream; only collapse exact repeated timestamps
    // for cadence math so a cross-collector copy cannot create a zero-length interval.
    const times = [...new Set(rows.map(item => item.time))].sort((a, b) => a - b);
    return { rows, times };
  }

  function sourceRecords(stats) {
    if (Array.isArray(stats?.rawRecords)) return stats.rawRecords;
    if (Array.isArray(stats?.marketRecords)) return stats.marketRecords;
    return [];
  }

  function renderCollectors(records) {
    const root = byId("memoryCollectorQuality");
    if (!root) return;

    const groups = new Map();
    for (const record of records) {
      const id = String(record?.collector_id || record?.machine_id || "local-legacy").trim() || "local-legacy";
      const time = timestampOf(record);
      const entry = groups.get(id) || { id, count: 0, first: 0, last: 0 };
      entry.count += 1;
      if (time > 0) {
        entry.first = entry.first ? Math.min(entry.first, time) : time;
        entry.last = Math.max(entry.last, time);
      }
      groups.set(id, entry);
    }

    root.replaceChildren();
    if (!groups.size) {
      const empty = document.createElement("span");
      empty.className = "collector-truth-empty";
      empty.textContent = "Aucun collecteur marché IndexedDB exploitable.";
      root.appendChild(empty);
      return;
    }

    [...groups.values()]
      .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
      .forEach(entry => {
        const row = document.createElement("div");
        row.className = "collector-truth-row";
        row.textContent = `${entry.id} · ${entry.count} relevé(s)`
          + (entry.first ? ` · ${dateLabel(entry.first)} → ${dateLabel(entry.last)}` : " · horodatage indisponible");
        root.appendChild(row);
      });
  }

  function renderHorizons(times, first, last) {
    const grid = byId("memoryHorizonGrid");
    if (!grid) return;

    grid.querySelectorAll("article[data-horizon]").forEach(article => {
      const days = Math.max(1, Number(article.dataset.horizon || 0));
      const horizonMs = days * DAY_MS;
      const start = last > 0 ? last - horizonMs : 0;
      const count = last > 0 ? times.filter(time => time >= start && time <= last).length : 0;
      const availableMs = last > 0 && first > 0 ? Math.max(0, last - Math.max(first, start)) : 0;
      const coverage = Math.max(0, Math.min(100, horizonMs ? (availableMs / horizonMs) * 100 : 0));
      const strong = coverage >= 99.5;

      const value = article.querySelector("b");
      const detail = article.querySelector("small");
      if (value) value.textContent = count
        ? `${count} snapshot(s) · ${coverage.toFixed(coverage >= 10 ? 0 : 1)} %`
        : "Mémoire insuffisante";
      if (detail) detail.textContent = count
        ? (strong ? "Fenêtre mémoire couverte" : `Mémoire partielle · ${durationLabel(availableMs)} / ${days === 1 ? "24 h" : `${days} j`}`)
        : "Aucun snapshot marché horodaté";
    });
  }

  function renderCoverage() {
    const stats = marketStats();
    const source = sourceRecords(stats);
    const { rows, times } = canonicalTimeline(stats);
    const first = times[0] || 0;
    const last = times[times.length - 1] || 0;
    const span = first && last ? Math.max(0, last - first) : 0;
    const gaps = [];
    for (let i = 1; i < times.length; i += 1) {
      const gap = times[i] - times[i - 1];
      if (gap > 0) gaps.push(gap);
    }
    const cadence = median(gaps);
    const largestGap = gaps.length ? Math.max(...gaps) : NaN;
    const invalid = Math.max(0, (Array.isArray(stats?.canonicalRecords) ? stats.canonicalRecords.length : rows.length) - rows.length);
    const sourceCount = Number.isFinite(Number(stats?.sourceRecordCount)) ? Number(stats.sourceRecordCount) : source.length;
    const canonicalCount = Number.isFinite(Number(stats?.canonicalCount)) ? Number(stats.canonicalCount) : rows.length;

    setText("memoryCoverageFirst", dateLabel(first));
    setText("memoryCoverageLast", dateLabel(last));
    setText("memoryCoverageSpan", first && last ? durationLabel(span) : "0 s");
    setText(
      "memoryCoverageValid",
      `${rows.length}/${canonicalCount}` + (invalid ? ` · ${invalid} horodatage(s) invalide(s)` : "")
    );
    setText("memoryCoverageCadence", Number.isFinite(cadence) ? durationLabel(cadence) : "Non mesurable");
    setText("memoryCoverageLargestGap", Number.isFinite(largestGap) ? durationLabel(largestGap) : "—");

    renderHorizons(times, first, last);
    renderCollectors(source);

    const output = byId("memoryCoverageOutput");
    if (output) {
      const collectors = Array.isArray(stats?.collectors) ? stats.collectors : [];
      output.textContent = [
        `MEMORY HISTORY COVERAGE — Build ${BUILD}`,
        "",
        "OWNER LECTURE : IndexedDB Collector",
        `Snapshots canoniques : ${canonicalCount}`,
        `Relevés source : ${sourceCount}`,
        `Collecteurs marché : ${collectors.join(" / ") || "aucun"}`,
        `Première trace : ${dateLabel(first)}`,
        `Dernière trace : ${dateLabel(last)}`,
        `Durée réelle : ${first && last ? durationLabel(span) : "0 s"}`,
        `Cadence médiane : ${Number.isFinite(cadence) ? durationLabel(cadence) : "non mesurable"}`,
        `Plus grand trou : ${Number.isFinite(largestGap) ? durationLabel(largestGap) : "non mesurable"}`,
        "",
        "Lecture seule : aucune écriture Collector, aucun changement CURRENT analytique."
      ].join("\n");
    }

    renderIdentity();
    return { stats, source, rows, times, first, last, span, cadence, largestGap };
  }

  function renderAll() {
    renderIdentity();
    return renderCoverage();
  }

  function install() {
    // Existing Recalculer binding resolves this global function at click time.
    try { atlasRenderMemoryCoverage = renderCoverage; } catch (_) {}

    // Preserve the .282 import/export owner and add only reader/UI consistency after its render.
    try {
      if (typeof renderSharedMemory === "function" && renderSharedMemory.__reader404283 !== true) {
        const base = renderSharedMemory;
        const wrapped = function sharedMemoryReaderConsistency404283(...args) {
          const result = base.apply(this, args);
          Promise.resolve(
            typeof atlasCollectorInitializeStorage === "function"
              ? atlasCollectorInitializeStorage()
              : null
          ).then(renderAll).catch(() => renderIdentity());
          return result;
        };
        wrapped.__reader404283 = true;
        renderSharedMemory = wrapped;
      }
    } catch (_) {}

    Promise.resolve(
      typeof atlasCollectorInitializeStorage === "function"
        ? atlasCollectorInitializeStorage()
        : null
    ).then(renderAll).catch(() => renderIdentity());

    globalThis.AgentCryptoSharedMemoryReader404283 = Object.freeze({
      build: BUILD,
      render: renderAll,
      renderCoverage,
      renderIdentity
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
