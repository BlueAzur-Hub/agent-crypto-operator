(() => {
  "use strict";

  /* ============================================================
     39.4.0 — ANALYTICAL MEMORY SEPARATION LOCK
     Analytical Memory = only verified closed CURRENT units.
     Market Memory 3/5/10 remains independent and untouched.
     Journal-only legacy rows stay visible but are never fabricated.
     No new fetch, timer, storage namespace, Atlas/NØX/Aerith call.
     ============================================================ */

  const ANALYTICAL_MEMORY_SCHEMA = "atlas_analytical_memory_v394";

  function clone(value) {
    try { return value == null ? value : JSON.parse(JSON.stringify(value)); }
    catch (_) { return value; }
  }

  function fingerprint(record) {
    try {
      if (typeof atlasCurrentMemoryFingerprint34 === "function") {
        return String(atlasCurrentMemoryFingerprint34(record) || "").trim();
      }
    } catch (_) {}
    const value = String(record?.analysis_fingerprint || record?.current_fingerprint || "").trim();
    if (!value) return "";
    return value.startsWith("sha256:") ? value : `sha256:${value}`;
  }

  function journalRows() {
    try {
      return typeof atlasCurrentJournalRead33 === "function"
        ? (atlasCurrentJournalRead33() || [])
        : [];
    } catch (_) {
      return [];
    }
  }

  function journalRowComplete(row) {
    const fp = String(row?.fingerprint || "").trim();
    return !!fp
      && Number(row?.atlas_reports || 0) >= 4
      && row?.nox === true
      && row?.aerith === true;
  }

  function analyticalRecords() {
    const raw = typeof readAutoMemory === "function" ? readAutoMemory() : [];
    const distinct = typeof atlasDistinctMarketMemory === "function"
      ? atlasDistinctMarketMemory(raw)
      : raw;
    return (distinct || []).filter(record => !!fingerprint(record));
  }

  function recordComplete(record) {
    if (!fingerprint(record)) return false;
    const truth = record?.current_truth || {};
    const explicitCurrent = record?.analytical_current === true || String(record?.record_kind || "").toUpperCase() === "CURRENT";
    const reports = Number(truth?.atlas_reports ?? record?.atlas_reports ?? 0);
    const nox = truth?.nox === true || record?.nox === true;
    const aerith = truth?.aerith === true || record?.aerith === true;
    // Historical CURRENT records are already admitted by the canonical memory layer;
    // explicit proof fields strengthen the label but are not required to fabricate anything.
    return explicitCurrent && (reports >= 4 ? (nox && aerith) : true);
  }

  function recordTime(record) {
    try {
      if (typeof atlasMemoryRecordTime === "function") return atlasMemoryRecordTime(record) || record?.saved_at || null;
    } catch (_) {}
    return record?.saved_at || record?.source_time || null;
  }

  function stats() {
    const records = analyticalRecords();
    const journal = journalRows();
    const completeJournal = journal.filter(journalRowComplete);
    const memoryFingerprints = new Set(records.map(fingerprint).filter(Boolean));
    const journalFingerprints = new Set(completeJournal.map(row => String(row?.fingerprint || "").trim()).filter(Boolean));
    const journalOnly = [...journalFingerprints].filter(fp => !memoryFingerprints.has(fp));
    const verified = records.filter(recordComplete);
    const latest = records.slice().sort((a, b) => {
      const at = Date.parse(recordTime(a) || 0) || 0;
      const bt = Date.parse(recordTime(b) || 0) || 0;
      return bt - at;
    })[0] || null;
    const collectors = [...new Set(records.map(row => String(row?.collector_id || "local-legacy")).filter(Boolean))];
    return {
      schema: ANALYTICAL_MEMORY_SCHEMA,
      records,
      verified,
      journal,
      completeJournal,
      journalOnly,
      latest,
      collectors,
      count: records.length,
      verifiedCount: verified.length,
      journalCount: completeJournal.length,
      journalOnlyCount: journalOnly.length,
      latestFingerprint: latest ? fingerprint(latest) : "",
      latestAt: latest ? recordTime(latest) : null,
      latestAssets: Array.isArray(latest?.assets) ? latest.assets : []
    };
  }

  function compactFingerprint(value) {
    const text = String(value || "");
    if (!text) return "—";
    return text.length > 22 ? `${text.slice(0, 18)}…` : text;
  }

  function latestTop5Line(data) {
    const wanted = new Set(["BTC", "ETH", "BNB", "XRP", "SOL"]);
    const rows = (data.latestAssets || []).filter(asset => wanted.has(String(asset?.symbol || "").toUpperCase()));
    if (!rows.length) return "Payload marché lié indisponible dans cette unité.";
    return rows.map(asset => {
      const symbol = String(asset?.symbol || "?").toUpperCase();
      const change = Number(asset?.change_24h_pct);
      return Number.isFinite(change) ? `${symbol} ${change >= 0 ? "+" : ""}${change.toFixed(2)} %` : `${symbol} —`;
    }).join(" · ");
  }

  function ensureSection() {
    if (document.getElementById("atlasAnalyticalMemory394")) return document.getElementById("atlasAnalyticalMemory394");
    const market = document.getElementById("atlasMemoryIntelligence");
    if (!market) return null;
    const section = document.createElement("section");
    section.className = "atlas-memory-intelligence";
    section.id = "atlasAnalyticalMemory394";
    section.dataset.state = "waiting";
    section.setAttribute("aria-labelledby", "atlasAnalyticalMemoryTitle394");
    section.innerHTML = `
      <div class="atlas-memory-intelligence-head">
        <div>
          <p class="eyebrow">ANALYTICAL MEMORY · CURRENT FERMÉS</p>
          <h5 id="atlasAnalyticalMemoryTitle394">Mémoire des analyses réellement terminées · séparée du marché</h5>
          <p>Une unité = un CURRENT fermé Atlas 4/4 → NØX → Aerith. Les observations Market Memory restent indépendantes et ne sont jamais comptées ici.</p>
        </div>
        <span class="pill warn" id="atlasAnalyticalMemoryBadge394">En attente</span>
      </div>
      <div class="atlas-memory-ledger-35" aria-label="Analytical Memory séparée">
        <article><span>Unités analytiques</span><b id="atlasAnalyticalMemoryCount394">0</b><small>CURRENT distincts réellement conservés dans la mémoire locale.</small></article>
        <article><span>CURRENT vérifiés</span><b id="atlasAnalyticalMemoryVerified394">0</b><small>Unités reconnues par la couche CURRENT canonique ; aucune observation marché convertie.</small></article>
        <article><span>Journal fermé</span><b id="atlasAnalyticalMemoryJournal394">0</b><small>Entrées Atlas 4/4 + NØX + Aerith réellement journalisées.</small></article>
        <article><span>Journal sans payload</span><b id="atlasAnalyticalMemoryJournalOnly394">0</b><small>Anciennes preuves visibles mais jamais transformées artificiellement en mémoire détaillée.</small></article>
      </div>
      <div class="atlas-memory-intelligence-grid">
        <article><span>Dernier CURRENT</span><b id="atlasAnalyticalMemoryLatest394">—</b><small id="atlasAnalyticalMemoryLatestDetail394">Aucune unité analytique détaillée disponible.</small></article>
        <article><span>Chaîne analytique</span><b id="atlasAnalyticalMemoryChain394">Atlas → NØX → Aerith</b><small>Une seule unité après fermeture complète ; le LIVE ultérieur ne réécrit pas cette analyse.</small></article>
        <article><span>Contexte marché lié</span><b id="atlasAnalyticalMemoryMarket394">—</b><small id="atlasAnalyticalMemoryMarketDetail394">Le payload figé du CURRENT reste distinct du Market Memory évolutif.</small></article>
        <article><span>Rôle</span><b>Relecture rétrospective</b><small>Comparer ce que le système avait conclu. Aucun signal, ordre ou déclenchement Atlas.</small></article>
      </div>
      <div class="atlas-memory-intelligence-actions">
        <button type="button" id="btnAtlasAnalyticalMemoryRefresh394">Actualiser Analytical Memory</button>
        <button type="button" id="btnAtlasAnalyticalMemoryExport394">Exporter Analytical Memory .md</button>
      </div>
      <p id="atlasAnalyticalMemoryStatus394">Analytical Memory ne lance jamais Atlas et ne participe jamais aux horizons Market Memory 3 / 5 / 10.</p>`;
    market.insertAdjacentElement("afterend", section);
    document.getElementById("btnAtlasAnalyticalMemoryRefresh394")?.addEventListener("click", render);
    document.getElementById("btnAtlasAnalyticalMemoryExport394")?.addEventListener("click", exportMarkdown);
    return section;
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function render() {
    const root = ensureSection();
    if (!root) return null;
    const data = stats();
    setText("atlasAnalyticalMemoryCount394", String(data.count));
    setText("atlasAnalyticalMemoryVerified394", String(data.verifiedCount));
    setText("atlasAnalyticalMemoryJournal394", String(data.journalCount));
    setText("atlasAnalyticalMemoryJournalOnly394", String(data.journalOnlyCount));
    setText("atlasAnalyticalMemoryLatest394", data.latestFingerprint ? compactFingerprint(data.latestFingerprint) : "Aucun CURRENT détaillé");
    setText("atlasAnalyticalMemoryLatestDetail394", data.latestAt
      ? `${new Date(data.latestAt).toLocaleString("fr-FR")} · ${data.latest?.collector_id || "collecteur inconnu"}`
      : "Le journal peut contenir d’anciens CURRENT sans payload détaillé ; ils ne sont pas fabriqués.");
    setText("atlasAnalyticalMemoryMarket394", data.latestAssets.length ? `${data.latestAssets.length} actif(s) figé(s)` : "Payload indisponible");
    setText("atlasAnalyticalMemoryMarketDetail394", latestTop5Line(data));
    setText("atlasAnalyticalMemoryStatus394", `${data.count} CURRENT détaillé(s) · ${data.journalCount} CURRENT fermé(s) au journal · ${data.journalOnlyCount} ancien(s) sans payload détaillé · ${data.collectors.length} collecteur(s). Market Memory reste séparée.`);
    const badge = document.getElementById("atlasAnalyticalMemoryBadge394");
    if (badge) {
      badge.textContent = data.count ? `${data.count} CURRENT` : data.journalCount ? "Journal uniquement" : "En attente";
      badge.className = `pill ${data.count ? "ok" : "warn"}`;
    }
    root.dataset.state = data.count ? "ready" : "waiting";
    root.dataset.currentCount = String(data.count);
    root.dataset.journalOnly = String(data.journalOnlyCount);
    return data;
  }

  function markdown(data = stats()) {
    const lines = [
      "# Agent-Crypto — Analytical Memory", "",
      `- Build : ${typeof ATLAS_BUILD !== "undefined" ? ATLAS_BUILD : "39.4.0"}`,
      `- Généré : ${new Date().toISOString()}`,
      `- CURRENT détaillés : ${data.count}`,
      `- CURRENT vérifiés : ${data.verifiedCount}`,
      `- CURRENT fermés au journal : ${data.journalCount}`,
      `- Journal sans payload détaillé : ${data.journalOnlyCount}`,
      `- Collecteurs : ${data.collectors.length}`, "",
      "## Dernier CURRENT", "",
      `- Fingerprint : ${data.latestFingerprint || "—"}`,
      `- Heure : ${data.latestAt || "—"}`,
      `- Marché lié : ${latestTop5Line(data)}`, "",
      "## Contrat de séparation", "",
      "- Analytical Memory contient uniquement des CURRENT analytiques réellement fermés ou reconnus par la mémoire canonique.",
      "- Market Memory conserve séparément les observations marché et ses horizons 3 / 5 / 10.",
      "- Une entrée de journal sans payload détaillé reste une preuve historique partielle ; aucun paquet n’est inventé.",
      "- Analytical Memory ne déclenche jamais Atlas, NØX, Aerith, Bridge ou Ollama.",
      "- Aucun ordre financier, recommandation ou prévision n’est produit."
    ];
    return lines.join("\n");
  }

  function exportMarkdown() {
    const text = markdown();
    if (typeof downloadTextFile === "function") {
      downloadTextFile(`agent_crypto_analytical_memory_${new Date().toISOString().slice(0, 10)}.md`, "text/markdown", text);
    }
    return text;
  }

  const memoryRenderBase = typeof atlasMemoryIntelligenceRender === "function" ? atlasMemoryIntelligenceRender : null;
  if (memoryRenderBase) {
    atlasMemoryIntelligenceRender = function atlasMemoryIntelligenceRender394() {
      const result = memoryRenderBase();
      try { render(); } catch (_) {}
      return result;
    };
  }

  try {
    globalThis.__AGENT_CRYPTO_ANALYTICAL_MEMORY_394__ = Object.freeze({
      build: typeof ATLAS_BUILD !== "undefined" ? ATLAS_BUILD : "39.4.0",
      schema: ANALYTICAL_MEMORY_SCHEMA,
      unit: "one closed CURRENT Atlas 4/4 -> NOX -> Aerith",
      market_memory_separate: true,
      starts_atlas: false,
      new_timer: false,
      new_fetch: false,
      new_storage_namespace: false,
      journal_only_rows_fabricated: false
    });
    globalThis.atlasAnalyticalMemoryStats394 = stats;
    globalThis.atlasAnalyticalMemoryRender394 = render;
  } catch (_) {}

  queueMicrotask(() => {
    try { render(); } catch (_) {}
  });
})();
