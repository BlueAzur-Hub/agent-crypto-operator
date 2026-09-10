(() => {
  "use strict";

  /* ============================================================
     39.7.0 — MULTI-COLLECTOR CONCORDANCE READER LOCK

     READ-ONLY CONTRACT
     - Read canonical/source Market Memory records through the public
       39.4.4R1 stats API only.
     - Compare DISTINCT collector_id records without merging memories.
     - Prefer the same canonical market_snapshot_id across collectors;
       otherwise allow a bounded near-time comparison (20 min max).
     - Compare only explicit EUR prices (price_eur) for BTC/ETH/BNB/XRP/SOL.
     - Distinguish collector concordance from upstream source independence.
     - NEVER infer that a historical collector trace means a machine is online.
     - NEVER create synthetic observations or a fake confidence/profit score.
     - NEVER rewrite Market Memory, Analytical Memory, CURRENT or journal.
     - NEVER launch Atlas, NØX, Aerith, Bridge or Ollama.
     - NO fetch, timer, WebSocket or storage write.
     ============================================================ */

  const BUILD_3970 = "39.7.0";
  const ROOT_ID = "atlasMultiCollector3970";
  const DETAILS_ID = "atlasMultiCollectorDetails3970";
  const EXPORT_ID = "btnAtlasMultiCollectorExport3970";
  const TOP5 = Object.freeze(["BTC", "ETH", "BNB", "XRP", "SOL"]);
  const RECENT_WINDOW_MS = 20 * 60 * 1000;
  const MIN_COMPARABLE_ASSETS = 3;
  const CONFIRMED_MEAN_SPREAD_PCT = 0.5;
  const MAX_ASSET_SPREAD_PCT = 1.0;

  const byId = id => document.getElementById(id);
  const setText = (id, value) => {
    const node = byId(id);
    if (node) node.textContent = String(value ?? "—");
  };

  function safeCall(fn, fallback = null) {
    try { return typeof fn === "function" ? fn() : fallback; }
    catch (_) { return fallback; }
  }

  function parseTime(value) {
    const parsed = Date.parse(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function recordTime(record) {
    return parseTime(
      record?.market_generated_at ||
      record?.source_time ||
      record?.snapshot?.market_snapshot?.source_time ||
      record?.generated_at ||
      record?.saved_at ||
      record?.last_seen_at
    );
  }

  function collectorId(record) {
    return String(record?.collector_id || "local-legacy").trim() || "local-legacy";
  }

  function canonicalId(record) {
    return String(
      record?.market_snapshot_id ||
      record?.snapshot?.market_snapshot?.snapshot_id ||
      ""
    ).trim();
  }

  function marketFingerprint(record) {
    return String(
      record?.market_fingerprint ||
      record?.fingerprint ||
      record?.snapshot?.market_snapshot?.fingerprint ||
      ""
    ).trim();
  }

  function normalizeSource(value) {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number") {
      return String(value).trim().toLowerCase();
    }
    if (typeof value === "object") {
      for (const key of ["provider", "name", "source", "id", "endpoint", "origin"]) {
        const candidate = value?.[key];
        if (candidate != null && String(candidate).trim()) return String(candidate).trim().toLowerCase();
      }
    }
    return "";
  }

  function sourceSignature(record) {
    const nested = record?.snapshot?.market_snapshot || {};
    const candidates = [
      record?.market_source,
      record?.source,
      record?.provider,
      record?.source_name,
      record?.source_provider,
      nested?.market_source,
      nested?.source,
      nested?.provider,
      nested?.source_name
    ];
    return candidates.map(normalizeSource).find(Boolean) || "";
  }

  function assets(record) {
    if (Array.isArray(record?.assets)) return record.assets;
    if (Array.isArray(record?.snapshot?.market_snapshot?.assets)) return record.snapshot.market_snapshot.assets;
    return [];
  }

  function assetMap(record) {
    const map = new Map();
    for (const row of assets(record)) {
      const symbol = String(row?.symbol || "").toUpperCase();
      if (!TOP5.includes(symbol)) continue;
      const price = Number(row?.price_eur);
      if (Number.isFinite(price) && price > 0) map.set(symbol, price);
    }
    return map;
  }

  function sourceRecords() {
    const stats = safeCall(globalThis.atlasMarketMemoryStats3944R1, {}) || {};
    const raw = Array.isArray(stats.marketRecords) ? stats.marketRecords
      : Array.isArray(stats.rawRecords) ? stats.rawRecords
      : [];

    const deduped = new Map();
    for (const record of raw) {
      const collector = collectorId(record);
      const canonical = canonicalId(record);
      const time = recordTime(record);
      const key = `${collector}::${canonical || marketFingerprint(record) || `time:${time}`}`;
      const previous = deduped.get(key);
      if (!previous || recordTime(previous) <= time) deduped.set(key, record);
    }
    return { stats, records: [...deduped.values()].sort((a, b) => recordTime(a) - recordTime(b)) };
  }

  function absoluteSpreadPct(a, b) {
    const x = Number(a);
    const y = Number(b);
    if (!(x > 0) || !(y > 0)) return null;
    const mean = (x + y) / 2;
    return mean > 0 ? (Math.abs(x - y) / mean) * 100 : null;
  }

  function sourceIndependence(a, b, sameStateIdentity) {
    const sa = sourceSignature(a);
    const sb = sourceSignature(b);
    if (sameStateIdentity) {
      return {
        code: "not-proven",
        label: "NON PROUVÉE",
        detail: "Même état marché canonique observé par des collecteurs distincts ; cela confirme la collecte, pas l’indépendance de la source amont."
      };
    }
    if (sa && sb && sa === sb) {
      return {
        code: "same-source",
        label: "NON · MÊME SOURCE",
        detail: `Source amont déclarée identique : ${sa}. Deux collecteurs ne valent pas deux sources indépendantes.`
      };
    }
    if (sa && sb && sa !== sb) {
      return {
        code: "declared-distinct",
        label: "POSSIBLE",
        detail: `Sources déclarées différentes (${sa} ↔ ${sb}) ; l’indépendance réelle n’est pas prouvée automatiquement.`
      };
    }
    return {
      code: "unknown",
      label: "INCONNUE",
      detail: "Provenance amont insuffisamment décrite pour conclure à une indépendance de source."
    };
  }

  function comparePair(a, b, mode = "near-time") {
    const mapA = assetMap(a);
    const mapB = assetMap(b);
    const rows = [];
    for (const symbol of TOP5) {
      const pa = mapA.get(symbol);
      const pb = mapB.get(symbol);
      const spread = absoluteSpreadPct(pa, pb);
      if (!Number.isFinite(spread)) continue;
      rows.push({ symbol, a: pa, b: pb, spread });
    }

    const meanSpread = rows.length ? rows.reduce((sum, row) => sum + row.spread, 0) / rows.length : null;
    const maxSpread = rows.length ? Math.max(...rows.map(row => row.spread)) : null;
    const timeA = recordTime(a);
    const timeB = recordTime(b);
    const timeSkewMs = Math.abs(timeA - timeB);
    const canonicalA = canonicalId(a);
    const canonicalB = canonicalId(b);
    const sameCanonical = !!canonicalA && canonicalA === canonicalB;
    const fingerprintA = marketFingerprint(a);
    const fingerprintB = marketFingerprint(b);
    const sameFingerprint = !!fingerprintA && fingerprintA === fingerprintB;
    const sameStateIdentity = sameCanonical || sameFingerprint;
    const independence = sourceIndependence(a, b, sameStateIdentity);

    return {
      a,
      b,
      collectorA: collectorId(a),
      collectorB: collectorId(b),
      canonicalA,
      canonicalB,
      fingerprintA,
      fingerprintB,
      sameFingerprint,
      sameStateIdentity,
      sameCanonical,
      mode: sameStateIdentity ? "same-snapshot" : mode,
      timeA,
      timeB,
      timeSkewMs,
      rows,
      comparableAssets: rows.length,
      meanSpread,
      maxSpread,
      independence,
      newestTime: Math.max(timeA, timeB)
    };
  }

  function classifyPair(pair) {
    if (!pair || pair.comparableAssets < MIN_COMPARABLE_ASSETS) {
      return {
        code: "insufficient",
        label: "INSUFFISANTE",
        detail: `Au moins ${MIN_COMPARABLE_ASSETS} actifs TOP5 avec prix EUR comparables sont nécessaires.`
      };
    }
    if (Number(pair.meanSpread) <= CONFIRMED_MEAN_SPREAD_PCT && Number(pair.maxSpread) <= MAX_ASSET_SPREAD_PCT) {
      return {
        code: "confirmed",
        label: "COHÉRENTE",
        detail: `Écart moyen ≤ ${CONFIRMED_MEAN_SPREAD_PCT.toFixed(2)} % et écart maximal ≤ ${MAX_ASSET_SPREAD_PCT.toFixed(2)} % sur les actifs comparables.`
      };
    }
    return {
      code: "divergent",
      label: "DIVERGENTE",
      detail: "Écart inter-collecteurs supérieur au seuil technique de cohérence ; vérifier timestamps, provenance et fraîcheur avant interprétation."
    };
  }

  function collectorLatest(records) {
    const latest = new Map();
    for (const record of records) {
      const collector = collectorId(record);
      const previous = latest.get(collector);
      if (!previous || recordTime(previous) <= recordTime(record)) latest.set(collector, record);
    }
    return latest;
  }

  function historicalSharedSnapshots(records) {
    const groups = new Map();
    for (const record of records) {
      const canonical = canonicalId(record);
      if (!canonical) continue;
      if (!groups.has(canonical)) groups.set(canonical, new Map());
      groups.get(canonical).set(collectorId(record), record);
    }
    return [...groups.entries()].filter(([, collectors]) => collectors.size >= 2).map(([canonical, collectors]) => ({ canonical, collectors }));
  }

  function bestPairForCollectors(recordsA, recordsB) {
    const exact = [];
    const near = [];
    for (const a of recordsA) {
      for (const b of recordsB) {
        const ca = canonicalId(a);
        const cb = canonicalId(b);
        const fa = marketFingerprint(a);
        const fb = marketFingerprint(b);
        const sameCanonical = !!ca && ca === cb;
        const sameFingerprint = !!fa && fa === fb;
        const skew = Math.abs(recordTime(a) - recordTime(b));
        if (sameCanonical || sameFingerprint) exact.push(comparePair(a, b, "same-snapshot"));
        else if (skew <= RECENT_WINDOW_MS) near.push(comparePair(a, b, "near-time"));
      }
    }
    const rank = (x, y) =>
      Number(y.comparableAssets || 0) - Number(x.comparableAssets || 0) ||
      (Number.isFinite(Number(x.timeSkewMs)) ? Number(x.timeSkewMs) : Infinity) - (Number.isFinite(Number(y.timeSkewMs)) ? Number(y.timeSkewMs) : Infinity) ||
      Number(y.newestTime || 0) - Number(x.newestTime || 0);
    exact.sort(rank);
    near.sort(rank);
    return exact[0] || near[0] || null;
  }

  function derive() {
    const { stats, records } = sourceRecords();
    const latestByCollector = collectorLatest(records);
    const knownCollectors = [...latestByCollector.keys()].sort();
    const newest = Math.max(0, ...[...latestByCollector.values()].map(recordTime));
    const recentCollectors = knownCollectors.filter(collector => {
      const t = recordTime(latestByCollector.get(collector));
      return newest > 0 && t > 0 && (newest - t) <= RECENT_WINDOW_MS;
    });

    const recentSet = new Set(recentCollectors);
    const recentRecords = records.filter(record => recentSet.has(collectorId(record)) && newest - recordTime(record) <= RECENT_WINDOW_MS);
    const bestByCollectorPair = [];
    for (let i = 0; i < recentCollectors.length; i += 1) {
      for (let j = i + 1; j < recentCollectors.length; j += 1) {
        const ca = recentCollectors[i];
        const cb = recentCollectors[j];
        const rowsA = recentRecords.filter(record => collectorId(record) === ca);
        const rowsB = recentRecords.filter(record => collectorId(record) === cb);
        const pair = bestPairForCollectors(rowsA, rowsB);
        if (pair) bestByCollectorPair.push(pair);
      }
    }

    bestByCollectorPair.sort((a, b) =>
      Number(b.sameCanonical) - Number(a.sameCanonical) ||
      Number(b.comparableAssets || 0) - Number(a.comparableAssets || 0) ||
      (Number.isFinite(Number(a.timeSkewMs)) ? Number(a.timeSkewMs) : Infinity) - (Number.isFinite(Number(b.timeSkewMs)) ? Number(b.timeSkewMs) : Infinity) ||
      Number(b.newestTime || 0) - Number(a.newestTime || 0)
    );

    const pair = bestByCollectorPair[0] || null;
    const shared = historicalSharedSnapshots(records);
    let status;
    if (recentCollectors.length < 2) {
      status = {
        code: "insufficient",
        label: "INSUFFISANTE",
        detail: `Seulement ${recentCollectors.length} collecteur(s) récent(s) sur ${knownCollectors.length} connu(s) dans la fenêtre de 20 min.`
      };
    } else if (!pair) {
      status = {
        code: "insufficient",
        label: "INSUFFISANTE",
        detail: "Plusieurs collecteurs sont récents, mais aucune paire temporelle/canonique exploitable n’est disponible."
      };
    } else {
      status = classifyPair(pair);
    }

    return {
      build: BUILD_3970,
      generatedAt: new Date().toISOString(),
      stats,
      records,
      knownCollectors,
      recentCollectors,
      recentWindowMinutes: RECENT_WINDOW_MS / 60000,
      pairCount: bestByCollectorPair.length,
      pairs: bestByCollectorPair,
      pair,
      historicalSharedSnapshots: shared.length,
      status,
      contract: "COLLECTOR CONCORDANCE ≠ SOURCE INDEPENDENCE ≠ MARKET PREDICTION"
    };
  }

  function localTime(ms) {
    return Number(ms) > 0 ? new Date(Number(ms)).toLocaleString("fr-FR") : "—";
  }

  function duration(ms) {
    const total = Math.max(0, Number(ms) || 0);
    if (!total) return "0 s";
    const seconds = Math.round(total / 1000);
    if (seconds < 60) return `${seconds} s`;
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
  }

  function pct(value, digits = 3) {
    const n = Number(value);
    return Number.isFinite(n) ? `${n.toFixed(digits)} %` : "—";
  }

  function pairLabel(pair) {
    return pair ? `${pair.collectorA} ↔ ${pair.collectorB}` : "Aucune paire récente";
  }

  function assetLine(pair) {
    if (!pair?.rows?.length) return "Aucun actif TOP5 comparable";
    return pair.rows.map(row => `${row.symbol} ${pct(row.spread)}`).join(" · ");
  }

  function ensureRoot() {
    let root = byId(ROOT_ID);
    if (root) return root;
    const memory = byId("atlasMemoryIntelligence");
    const grid = memory?.querySelector?.(".atlas-memory-intelligence-grid");
    if (!memory || !grid) return null;

    root = document.createElement("details");
    root.id = ROOT_ID;
    root.className = "atlas-shared-conclusion";
    root.setAttribute("aria-label", "Multi-Collector Concordance 39.7.0 · lecture seule");
    root.innerHTML = `
      <summary id="atlasMultiCollectorSummary3970">Multi-Collector Concordance · lecture seule</summary>
      <div id="${DETAILS_ID}">
        <div class="atlas-memory-ledger-35" aria-label="État multi-collecteur">
          <article><span>Collecteurs connus</span><b id="multiCollectorKnown3970">0</b><small>Identités collector_id réellement présentes dans Market Memory.</small></article>
          <article><span>Collecteurs récents</span><b id="multiCollectorRecent3970">0</b><small id="multiCollectorRecentDetail3970">Fenêtre de comparaison : 20 minutes.</small></article>
          <article><span>Paires comparables</span><b id="multiCollectorPairs3970">0</b><small>Une paire = deux collector_id distincts et des observations temporellement/canoniquement comparables.</small></article>
          <article><span>États partagés exacts</span><b id="multiCollectorShared3970">0</b><small>Même market_snapshot_id observé historiquement par au moins deux collecteurs.</small></article>
        </div>
        <div class="atlas-memory-intelligence-grid">
          <article><span>Dernière paire</span><b id="multiCollectorPair3970">—</b><small id="multiCollectorPairDetail3970">Aucune paire récente.</small></article>
          <article><span>Écart temporel</span><b id="multiCollectorSkew3970">—</b><small id="multiCollectorSkewDetail3970">Les observations proches restent distinctes.</small></article>
          <article><span>Écart TOP5 moyen</span><b id="multiCollectorSpread3970">—</b><small id="multiCollectorSpreadDetail3970">Comparaison de prix EUR uniquement.</small></article>
          <article><span>Indépendance source</span><b id="multiCollectorIndependence3970">—</b><small id="multiCollectorIndependenceDetail3970">Deux collecteurs ne prouvent jamais deux sources indépendantes.</small></article>
          <article class="atlas-memory-confidence"><span>Concordance collecteurs</span><b id="multiCollectorStatus3970">INSUFFISANTE</b><small id="multiCollectorStatusDetail3970">Pas de score artificiel : verdict technique uniquement.</small></article>
        </div>
        <p id="multiCollectorContract3970">COLLECTOR CONCORDANCE ≠ SOURCE INDEPENDENCE ≠ MARKET PREDICTION</p>
      </div>`;
    grid.insertAdjacentElement("afterend", root);

    const actions = memory.querySelector?.(".atlas-memory-intelligence-actions");
    if (actions && !byId(EXPORT_ID)) {
      const button = document.createElement("button");
      button.type = "button";
      button.id = EXPORT_ID;
      button.textContent = "Exporter concordance .md";
      button.addEventListener("click", exportMarkdown);
      actions.appendChild(button);
    }
    return root;
  }

  function render() {
    const root = ensureRoot();
    if (!root) return null;
    const data = derive();
    const pair = data.pair;

    setText("atlasMultiCollectorSummary3970", `Multi-Collector Concordance · ${data.status.label}`);
    setText("multiCollectorKnown3970", String(data.knownCollectors.length));
    setText("multiCollectorRecent3970", `${data.recentCollectors.length} / ${data.knownCollectors.length}`);
    setText("multiCollectorRecentDetail3970", `Fenêtre récente : ${data.recentWindowMinutes} min · une trace historique ne prouve pas qu’une machine est en ligne.`);
    setText("multiCollectorPairs3970", String(data.pairCount));
    setText("multiCollectorShared3970", String(data.historicalSharedSnapshots));

    setText("multiCollectorPair3970", pairLabel(pair));
    setText("multiCollectorPairDetail3970", pair
      ? `${pair.sameCanonical ? "Même snapshot canonique" : pair.sameFingerprint ? "Même fingerprint marché" : "Comparaison temporelle bornée"} · ${pair.comparableAssets}/5 actif(s) EUR comparable(s).`
      : "Aucune paire récente exploitable ; aucun rapprochement artificiel n’est créé.");

    setText("multiCollectorSkew3970", pair ? duration(pair.timeSkewMs) : "—");
    setText("multiCollectorSkewDetail3970", pair
      ? `${localTime(pair.timeA)} ↔ ${localTime(pair.timeB)} · fenêtre max ${data.recentWindowMinutes} min.`
      : "Il faut deux collecteurs récents distincts et des timestamps compatibles.");

    setText("multiCollectorSpread3970", pair ? pct(pair.meanSpread) : "—");
    setText("multiCollectorSpreadDetail3970", pair
      ? `${assetLine(pair)} · max ${pct(pair.maxSpread)}.`
      : "BTC / ETH / BNB / XRP / SOL : prix EUR comparables insuffisants.");

    setText("multiCollectorIndependence3970", pair?.independence?.label || "INCONNUE");
    setText("multiCollectorIndependenceDetail3970", pair?.independence?.detail || "Aucune paire récente pour qualifier la provenance amont.");

    setText("multiCollectorStatus3970", data.status.label);
    setText("multiCollectorStatusDetail3970", `${data.status.detail} Ce verdict mesure la cohérence de collecte, jamais la probabilité d’un gain.`);
    setText("multiCollectorContract3970", data.contract);

    const existing = byId("atlasMemoryCollectors");
    const existingDetail = byId("atlasMemoryCollectorsDetail");
    if (existing) existing.textContent = data.status.code === "insufficient"
      ? `${data.recentCollectors.length} collecteur(s) récent(s)`
      : `${data.status.label} · ${pair?.comparableAssets || 0}/5`;
    if (existingDetail) existingDetail.textContent = data.status.code === "insufficient"
      ? `${data.knownCollectors.length} collecteur(s) connu(s) · ${data.pairCount} paire(s) comparable(s) · détail Multi-Collector ci-dessous.`
      : `${pairLabel(pair)} · écart moyen ${pct(pair?.meanSpread)} · source ${pair?.independence?.label || "inconnue"}.`;

    root.dataset.state = data.status.code;
    root.dataset.build = BUILD_3970;
    root.dataset.readOnly = "true";
    root.dataset.knownCollectors = String(data.knownCollectors.length);
    root.dataset.recentCollectors = String(data.recentCollectors.length);
    root.dataset.pairCount = String(data.pairCount);

    const memory = byId("atlasMemoryIntelligence");
    if (memory) {
      memory.dataset.multiCollectorConcordance = BUILD_3970;
      memory.dataset.multiCollectorState = data.status.code;
    }
    return data;
  }

  function markdown(data = derive()) {
    const pair = data.pair;
    const lines = [
      "# Agent-Crypto — Multi-Collector Concordance", "",
      `- Build : ${BUILD_3970}`,
      `- Généré : ${data.generatedAt}`,
      "- Contrat : lecture seule · aucune fusion de mémoire · aucune prédiction", "",
      "## Couverture", "",
      `- Collecteurs connus : ${data.knownCollectors.length}${data.knownCollectors.length ? ` · ${data.knownCollectors.join(" · ")}` : ""}`,
      `- Collecteurs récents (≤ ${data.recentWindowMinutes} min du plus récent) : ${data.recentCollectors.length}${data.recentCollectors.length ? ` · ${data.recentCollectors.join(" · ")}` : ""}`,
      `- Paires comparables récentes : ${data.pairCount}`,
      `- États canoniques historiquement partagés : ${data.historicalSharedSnapshots}`, "",
      "## Verdict courant", "",
      `- Concordance : ${data.status.label}`,
      `- Motif : ${data.status.detail}`,
      `- Paire retenue : ${pairLabel(pair)}`,
      `- Mode : ${pair ? (pair.sameCanonical ? "même snapshot canonique" : pair.sameFingerprint ? "même fingerprint marché" : "comparaison temporelle bornée") : "—"}`,
      `- Écart temporel : ${pair ? duration(pair.timeSkewMs) : "—"}`,
      `- Actifs EUR comparables : ${pair?.comparableAssets || 0}/5`,
      `- Écart TOP5 moyen : ${pair ? pct(pair.meanSpread) : "—"}`,
      `- Écart TOP5 maximal : ${pair ? pct(pair.maxSpread) : "—"}`,
      `- Détail actifs : ${pair ? assetLine(pair) : "—"}`,
      `- Indépendance source : ${pair?.independence?.label || "INCONNUE"}`,
      `- Détail provenance : ${pair?.independence?.detail || "Aucune paire récente."}`, "",
      "## Règles", "",
      "- collector_id distinct est obligatoire pour une comparaison inter-collecteurs.",
      "- Le même market_snapshot_id observé par plusieurs collecteurs compte comme un état marché partagé, pas comme plusieurs états marché.",
      "- À défaut d’un snapshot canonique partagé, la comparaison temporelle est bornée à 20 minutes.",
      "- Seuls les prix price_eur réellement présents sont comparés ; aucune conversion ou valeur absente n’est inventée.",
      "- Deux collecteurs utilisant la même source amont ne deviennent pas deux sources indépendantes.",
      "- Une trace de collecteur en mémoire ne prouve jamais qu’une machine est actuellement en ligne.",
      "- Aucun score de gain, aucune recommandation financière et aucune prédiction ne sont produits.",
      "- Aucun fetch, timer, WebSocket, Atlas, NØX, Aerith, Bridge, Ollama ou write mémoire n’est déclenché."
    ];
    return lines.join("\n");
  }

  function exportMarkdown() {
    const body = markdown();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const name = `agent_crypto_multi_collector_concordance_${stamp}.md`;
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
    globalThis.atlasMemoryIntelligenceRender = function atlasMemoryIntelligenceRender3970(...args) {
      const result = baseMemoryRender.apply(this, args);
      try { render(); } catch (_) {}
      return result;
    };
  }

  globalThis.__AGENT_CRYPTO_MULTI_COLLECTOR_3970__ = Object.freeze({
    build: BUILD_3970,
    role: "read-only multi-collector concordance reader",
    market_memory: "39.4.4R1",
    recent_window_minutes: RECENT_WINDOW_MS / 60000,
    min_comparable_assets: MIN_COMPARABLE_ASSETS,
    confirmation_mean_spread_pct: CONFIRMED_MEAN_SPREAD_PCT,
    source_independence_is_separate: true,
    starts_atlas: false,
    starts_nox: false,
    starts_aerith: false,
    writes_memory: false,
    new_fetch: false,
    new_timer: false,
    new_websocket: false
  });
  globalThis.atlasMultiCollectorConcordance3970 = Object.freeze({ derive, render, markdown });

  queueMicrotask(() => { try { render(); } catch (_) {} });
})();
