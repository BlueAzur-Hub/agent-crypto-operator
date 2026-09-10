(() => {
  "use strict";

  /* 40.4.284 — Memory coverage gap-aware truth + color identity.
     Read-only over the existing IndexedDB Collector.
     No Collector/import mutation, no CURRENT rewrite, no Atlas/Oracle/Strategy/Paper/Bridge change.
     No timer, no network request, no storage write. */
  const BUILD = "40.4.284";
  const DAY_MS = 24 * 60 * 60 * 1000;
  const MIN_CONTINUITY_MS = 90 * 60 * 1000;
  const MAX_CONTINUITY_MS = 6 * 60 * 60 * 1000;
  const CONTINUITY_MULTIPLIER = 3;

  const byId = id => document.getElementById(id);

  function setText(id, value) {
    const node = byId(id);
    if (node) node.textContent = value;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function median(values) {
    const sorted = (values || []).filter(value => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
    if (!sorted.length) return NaN;
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
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

  function canonicalTimeline(stats) {
    const canonical = Array.isArray(stats?.canonicalRecords)
      ? stats.canonicalRecords
      : Array.isArray(stats?.records) ? stats.records : [];
    const rows = canonical
      .map(record => ({ record, time: timestampOf(record) }))
      .filter(item => item.time > 0)
      .sort((a, b) => a.time - b.time);
    const times = [...new Set(rows.map(item => item.time))].sort((a, b) => a - b);
    return { rows, times };
  }

  function sourceRecords(stats) {
    if (Array.isArray(stats?.rawRecords)) return stats.rawRecords;
    if (Array.isArray(stats?.marketRecords)) return stats.marketRecords;
    return [];
  }

  function continuityModel(times) {
    const gaps = [];
    for (let i = 1; i < times.length; i += 1) {
      const gap = times[i] - times[i - 1];
      if (gap > 0) gaps.push(gap);
    }
    const cadence = median(gaps);
    const continuity = Number.isFinite(cadence)
      ? clamp(cadence * CONTINUITY_MULTIPLIER, MIN_CONTINUITY_MS, MAX_CONTINUITY_MS)
      : MIN_CONTINUITY_MS;
    const largestGap = gaps.length ? Math.max(...gaps) : NaN;
    return { gaps, cadence, continuity, largestGap };
  }

  function horizonTruth(times, end, horizonMs, continuity) {
    if (!times.length || !Number.isFinite(end) || end <= 0 || horizonMs <= 0) {
      return { count: 0, coveredMs: 0, coverage: 0, gaps: 0, largestGap: NaN };
    }
    const start = end - horizonMs;
    const count = times.filter(time => time >= start && time <= end).length;
    let coveredMs = 0;
    let gapCount = 0;
    let largestGap = NaN;

    for (let i = 1; i < times.length; i += 1) {
      const leftPoint = times[i - 1];
      const rightPoint = times[i];
      if (rightPoint <= start || leftPoint >= end) continue;

      const overlapStart = Math.max(start, leftPoint);
      const overlapEnd = Math.min(end, rightPoint);
      if (overlapEnd <= overlapStart) continue;

      const fullGap = rightPoint - leftPoint;
      if (fullGap <= continuity) {
        coveredMs += overlapEnd - overlapStart;
      } else {
        gapCount += 1;
        largestGap = Number.isFinite(largestGap) ? Math.max(largestGap, fullGap) : fullGap;
      }
    }

    coveredMs = clamp(coveredMs, 0, horizonMs);
    return {
      count,
      coveredMs,
      coverage: horizonMs ? clamp((coveredMs / horizonMs) * 100, 0, 100) : 0,
      gaps: gapCount,
      largestGap
    };
  }

  function coverageState(percent) {
    if (percent >= 95) return "full";
    if (percent >= 70) return "strong";
    if (percent >= 40) return "partial";
    if (percent > 0) return "sparse";
    return "empty";
  }

  function horizonLabel(days) {
    return days === 1 ? "24 h" : `${days} j`;
  }

  function renderHorizons(times, last, continuity) {
    const grid = byId("memoryHorizonGrid");
    if (!grid) return [];

    const results = [];
    grid.querySelectorAll("article[data-horizon]").forEach(article => {
      const days = Math.max(1, Number(article.dataset.horizon || 0));
      const horizonMs = days * DAY_MS;
      const truth = horizonTruth(times, last, horizonMs, continuity);
      const state = coverageState(truth.coverage);
      article.dataset.coverageState = state;
      article.dataset.coverageGapCount = String(truth.gaps);

      const value = article.querySelector("b");
      const detail = article.querySelector("small");
      const rounded = truth.coverage >= 10 ? truth.coverage.toFixed(0) : truth.coverage.toFixed(1);

      if (value) {
        value.textContent = truth.count
          ? `${truth.count} snapshot(s) · ${rounded} % réel`
          : "Mémoire insuffisante";
      }
      if (detail) {
        if (!truth.count) {
          detail.textContent = "Aucun snapshot marché horodaté";
        } else if (state === "full") {
          detail.textContent = `Couverture continue · ${durationLabel(truth.coveredMs)} / ${horizonLabel(days)}`;
        } else {
          const gap = Number.isFinite(truth.largestGap) ? ` · trou ${durationLabel(truth.largestGap)}` : "";
          detail.textContent = `Couverture observée · ${durationLabel(truth.coveredMs)} / ${horizonLabel(days)}${gap}`;
        }
      }

      results.push({ days, ...truth, state });
    });
    return results;
  }

  function collectorTone(text) {
    const value = String(text || "").toLowerCase();
    if (value.includes("ryzen7-christophe")) return "ryzen";
    if (value.includes("transformer-book")) return "book";
    if (value.includes("local-legacy")) return "legacy";
    return "neutral";
  }

  function applyCollectorTones() {
    for (const root of [byId("memoryCollectorQuality"), byId("collectorTruthList")]) {
      if (!root) continue;
      [...root.children].forEach(row => {
        row.dataset.collectorTone = collectorTone(row.textContent);
      });
    }
  }

  function applyColorIdentity() {
    const tones = {
      "auto-reader": "reader",
      "shared-memory": "shared",
      "github-memory": "github"
    };
    for (const [key, tone] of Object.entries(tones)) {
      const details = document.querySelector(`details[data-collapse-key="${key}"]`);
      if (details) {
        details.classList.add("atlas-memory-color-404284");
        details.dataset.memoryTone = tone;
      }
    }
    const panel = byId("memoryCoveragePanel");
    if (panel) panel.dataset.coverageTruth = "gap-aware";
    applyCollectorTones();
  }

  function renderCoverage() {
    const stats = marketStats();
    const source = sourceRecords(stats);
    const { rows, times } = canonicalTimeline(stats);
    const first = times[0] || 0;
    const last = times[times.length - 1] || 0;
    const span = first && last ? Math.max(0, last - first) : 0;
    const model = continuityModel(times);

    const invalid = Math.max(
      0,
      (Array.isArray(stats?.canonicalRecords) ? stats.canonicalRecords.length : rows.length) - rows.length
    );
    const sourceCount = Number.isFinite(Number(stats?.sourceRecordCount))
      ? Number(stats.sourceRecordCount)
      : source.length;
    const canonicalCount = Number.isFinite(Number(stats?.canonicalCount))
      ? Number(stats.canonicalCount)
      : rows.length;

    const spanNode = byId("memoryCoverageSpan");
    const spanLabel = spanNode?.closest("article")?.querySelector("span");
    if (spanLabel) spanLabel.textContent = "Étendue historique";

    setText("memoryCoverageFirst", dateLabel(first));
    setText("memoryCoverageLast", dateLabel(last));
    setText("memoryCoverageSpan", first && last ? durationLabel(span) : "0 s");
    setText(
      "memoryCoverageValid",
      `${rows.length}/${canonicalCount}` + (invalid ? ` · ${invalid} horodatage(s) invalide(s)` : "")
    );
    setText("memoryCoverageCadence", Number.isFinite(model.cadence) ? durationLabel(model.cadence) : "Non mesurable");
    setText("memoryCoverageLargestGap", Number.isFinite(model.largestGap) ? durationLabel(model.largestGap) : "—");

    const gapArticle = byId("memoryCoverageLargestGap")?.closest("article");
    if (gapArticle) {
      gapArticle.dataset.gapState = Number.isFinite(model.largestGap) && model.largestGap > model.continuity
        ? "attention"
        : "normal";
    }

    const horizons = renderHorizons(times, last, model.continuity);

    try {
      globalThis.AgentCryptoSharedMemoryReader404283?.renderIdentity?.();
    } catch (_) {}
    const collectorRoot = byId("memoryCollectorQuality");
    if (collectorRoot) {
      const groups = new Map();
      for (const record of source) {
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
      collectorRoot.replaceChildren();
      if (!groups.size) {
        const empty = document.createElement("span");
        empty.className = "collector-truth-empty";
        empty.textContent = "Aucun collecteur marché IndexedDB exploitable.";
        collectorRoot.appendChild(empty);
      } else {
        [...groups.values()]
          .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
          .forEach(entry => {
            const row = document.createElement("div");
            row.className = "collector-truth-row";
            row.dataset.collectorTone = collectorTone(entry.id);
            row.textContent = `${entry.id} · ${entry.count} relevé(s)`
              + (entry.first ? ` · ${dateLabel(entry.first)} → ${dateLabel(entry.last)}` : " · horodatage indisponible");
            collectorRoot.appendChild(row);
          });
      }
    }

    const output = byId("memoryCoverageOutput");
    if (output) {
      const collectors = Array.isArray(stats?.collectors) ? stats.collectors : [];
      const h30 = horizons.find(item => item.days === 30);
      output.textContent = [
        `MEMORY HISTORY COVERAGE — Build ${BUILD}`,
        "",
        "OWNER LECTURE : IndexedDB Collector · GAP-AWARE",
        `Snapshots canoniques : ${canonicalCount}`,
        `Relevés source : ${sourceCount}`,
        `Collecteurs marché : ${collectors.join(" / ") || "aucun"}`,
        `Première trace : ${dateLabel(first)}`,
        `Dernière trace : ${dateLabel(last)}`,
        `Étendue historique : ${first && last ? durationLabel(span) : "0 s"}`,
        `Cadence médiane : ${Number.isFinite(model.cadence) ? durationLabel(model.cadence) : "non mesurable"}`,
        `Seuil de continuité : ${durationLabel(model.continuity)} (3 × cadence, borné 1 h 30 → 6 h)`,
        `Plus grand trou : ${Number.isFinite(model.largestGap) ? durationLabel(model.largestGap) : "non mesurable"}`,
        h30 ? `Couverture réelle 30 j : ${h30.coverage.toFixed(h30.coverage >= 10 ? 0 : 1)} % · ${durationLabel(h30.coveredMs)} observées` : "Couverture réelle 30 j : non mesurable",
        "",
        "Lecture seule : les intervalles au-delà du seuil sont comptés comme trous ; aucune écriture Collector, aucun changement CURRENT analytique."
      ].join("\n");
    }

    applyColorIdentity();
    return { stats, source, rows, times, first, last, span, ...model, horizons };
  }

  function renderAll() {
    applyColorIdentity();
    return renderCoverage();
  }

  function install() {
    try { atlasRenderMemoryCoverage = renderCoverage; } catch (_) {}

    try {
      if (typeof renderSharedMemory === "function" && renderSharedMemory.__coverage404284 !== true) {
        const base = renderSharedMemory;
        const wrapped = function sharedMemoryCoverageTruth404284(...args) {
          const result = base.apply(this, args);
          Promise.resolve(
            typeof atlasCollectorInitializeStorage === "function"
              ? atlasCollectorInitializeStorage()
              : null
          ).then(renderAll).catch(applyColorIdentity);
          return result;
        };
        wrapped.__coverage404284 = true;
        renderSharedMemory = wrapped;
      }
    } catch (_) {}

    Promise.resolve(
      typeof atlasCollectorInitializeStorage === "function"
        ? atlasCollectorInitializeStorage()
        : null
    ).then(renderAll).catch(applyColorIdentity);

    globalThis.AgentCryptoMemoryTruth404284 = Object.freeze({
      build: BUILD,
      render: renderAll,
      renderCoverage,
      applyColorIdentity,
      read_only: true,
      gap_aware: true,
      storage_write_added: false,
      timer_added: false,
      network_request_added: false
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
