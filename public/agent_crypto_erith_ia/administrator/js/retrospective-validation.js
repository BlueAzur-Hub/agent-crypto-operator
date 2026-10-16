(() => {
  "use strict";

  /* ============================================================
     39.6.1 — RETROSPECTIVE VALIDATION READER / POST-CURRENT PROOF

     RELEASE SURFACE: Agent-Crypto 40.6.151

     READ-ONLY CONTRACT
     - Read verified closed CURRENT units from Analytical Memory 39.4.
     - Read canonical market observations from Market Memory 39.4.4R1.
     - Pair each CURRENT only with market observations strictly AFTER
       the analytical close time; never select a pre-close observation.
     - Measure observed EUR price returns from the frozen CURRENT payload
       to the first and latest post-CURRENT market observations.
     - Make the latest waiting CURRENT AND the latest evaluable CURRENT visible.
     - NEVER score forecast accuracy: CURRENT can be descriptive and may
       contain no directional forecast at all.
     - NEVER rewrite CURRENT, Market Memory, Analytical Memory or journal.
     - NEVER launch Atlas, NØX, Aerith, Bridge or Ollama.
     - NO fetch, timer, WebSocket or storage write.
     ============================================================ */

  const BUILD_3961 = "39.6.1";
  const RELEASE_406151 = "40.6.151";
  const ROOT_ID = "decisionRetrospective";
  const EXPORT_ID = "btnDecisionBoardRetrospectiveExport3961";
  const TOP5 = Object.freeze(["BTC", "ETH", "BNB", "XRP", "SOL"]);
  const FLAT_EPSILON_PCT = 0.05;

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

  function currentTime(record) {
    return parseTime(
      record?.closed_at || record?.completed_at || record?.current_truth?.closed_at ||
      record?.saved_at || record?.last_seen_at || record?.source_time || record?.market_generated_at
    );
  }

  function marketTime(record) {
    return parseTime(
      record?.market_generated_at || record?.source_time ||
      record?.snapshot?.market_snapshot?.source_time || record?.saved_at || record?.last_seen_at
    );
  }

  function fingerprint(record) {
    const raw = String(record?.analysis_fingerprint || record?.current_fingerprint || "").trim();
    if (raw) return raw.startsWith("sha256:") ? raw : `sha256:${raw}`;
    try {
      if (typeof globalThis.atlasCurrentMemoryFingerprint34 === "function") {
        const value = String(globalThis.atlasCurrentMemoryFingerprint34(record) || "").trim();
        return value ? (value.startsWith("sha256:") ? value : `sha256:${value}`) : "";
      }
    } catch (_) {}
    return "";
  }

  function compactFingerprint(value) {
    const raw = String(value || "");
    return raw ? (raw.length > 22 ? `${raw.slice(0, 18)}…` : raw) : "—";
  }

  function canonicalMarketId(record) {
    return String(
      record?.market_snapshot_id || record?.snapshot?.market_snapshot?.snapshot_id ||
      record?.snapshot_id || record?.id || ""
    ).trim();
  }

  function canonicalMarkets(stats) {
    const source = Array.isArray(stats?.canonicalRecords) ? stats.canonicalRecords
      : Array.isArray(stats?.records) ? stats.records
      : Array.isArray(stats?.marketRecords) ? stats.marketRecords
      : [];
    const map = new Map();
    for (const record of source) {
      const t = marketTime(record);
      const key = canonicalMarketId(record) || `time:${t}`;
      const previous = map.get(key);
      if (!previous || marketTime(previous) <= t) map.set(key, record);
    }
    return [...map.values()].filter(row => marketTime(row) > 0).sort((a, b) => marketTime(a) - marketTime(b));
  }

  function verifiedCurrents(stats) {
    const rows = Array.isArray(stats?.verified) ? stats.verified : [];
    return rows.filter(row => currentTime(row) > 0).slice().sort((a, b) => currentTime(a) - currentTime(b));
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
      if (TOP5.includes(symbol)) map.set(symbol, row);
    }
    return map;
  }

  function eurPrice(asset) {
    for (const key of ["price_eur", "spot_eur", "current_price", "price"]) {
      const value = Number(asset?.[key]);
      if (Number.isFinite(value) && value > 0) return value;
    }
    return null;
  }

  function observedReturns(current, market) {
    const baseline = assetMap(current);
    const observed = assetMap(market);
    const rows = [];
    for (const symbol of TOP5) {
      const from = eurPrice(baseline.get(symbol));
      const to = eurPrice(observed.get(symbol));
      if (!(from > 0) || !(to > 0)) continue;
      const pct = ((to / from) - 1) * 100;
      rows.push({ symbol, from, to, pct });
    }
    const up = rows.filter(row => row.pct > FLAT_EPSILON_PCT).length;
    const down = rows.filter(row => row.pct < -FLAT_EPSILON_PCT).length;
    const flat = rows.length - up - down;
    return { rows, up, down, flat, comparable: rows.length };
  }

  function pairCurrent(current, markets) {
    const closedAt = currentTime(current);
    const later = markets.filter(row => marketTime(row) > closedAt);
    const first = later[0] || null;
    const latest = later[later.length - 1] || null;
    return {
      current, closedAt, first, latest,
      firstReturns: first ? observedReturns(current, first) : null,
      latestReturns: latest ? observedReturns(current, latest) : null
    };
  }

  function derive() {
    const marketStats = safeCall(globalThis.atlasMarketMemoryStats3944R1, {}) || {};
    const analyticalStats = safeCall(globalThis.atlasAnalyticalMemoryStats394, {}) || {};
    const markets = canonicalMarkets(marketStats);
    const currents = verifiedCurrents(analyticalStats);
    const pairs = currents.map(current => pairCurrent(current, markets));
    const evaluable = pairs.filter(pair => pair.first && Number(pair.firstReturns?.comparable || 0) >= 3);
    const latestPair = pairs[pairs.length - 1] || null;
    const latestEvaluable = [...evaluable].reverse()[0] || null;
    return { marketStats, analyticalStats, markets, currents, pairs, evaluable, latestPair, latestEvaluable };
  }

  function localTime(msOrValue) {
    const ms = typeof msOrValue === "number" ? msOrValue : parseTime(msOrValue);
    return ms ? new Date(ms).toLocaleString("fr-FR") : "—";
  }

  function duration(fromMs, toMs) {
    if (!(fromMs > 0) || !(toMs > fromMs)) return "—";
    const minutes = Math.round((toMs - fromMs) / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
  }

  function pct(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return `${n >= 0 ? "+" : ""}${n.toFixed(2)} %`;
  }

  function returnsLine(data) {
    const rows = Array.isArray(data?.rows) ? data.rows : [];
    return rows.length ? rows.map(row => `${row.symbol} ${pct(row.pct)}`).join(" · ") : "Prix TOP5 comparables indisponibles";
  }

  function breadthLine(data) {
    if (!data?.comparable) return "Indéterminée";
    return `${data.up} hausse(s) · ${data.down} baisse(s) · ${data.flat} stable(s)`;
  }

  function statusOf(pair) {
    if (!pair) return { code: "waiting", label: "Aucun CURRENT vérifié" };
    if (!pair.first) return { code: "waiting", label: "En attente du marché postérieur" };
    if (Number(pair.firstReturns?.comparable || 0) < 3) return { code: "partial", label: "Payload partiel" };
    return { code: "ready", label: "Mesure disponible" };
  }

  function ensureRoot() {
    let root = byId(ROOT_ID);
    const dual = byId("decisionDualMemory395");
    const anchor = dual || byId("decisionMemoryV2");
    if (!root && !anchor) return null;

    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.className = "decision-memory-v2";
      anchor.insertAdjacentElement("afterend", root);
    }

    root.setAttribute("aria-label", "Decision Board 39.6.1 · Post-CURRENT en lecture seule");
    if (root.dataset.ui3961 !== "1") {
      root.innerHTML = `
        <article class="decision-memory-v2-action"><span>POST-CURRENT · ${RELEASE_406151}</span><b id="retroStatus">En attente</b><small id="retroStatusDetail">Le lecteur attend un CURRENT vérifié suivi d’un snapshot marché canonique.</small></article>
        <article><span>CURRENT évaluables</span><b id="retroCount">0 / 0</b><small id="retroCountDetail">Seuls les CURRENT vérifiés avec payload détaillé sont comparables.</small></article>
        <article><span>Dernier CURRENT</span><b id="retroCurrent">—</b><small id="retroCurrentDetail">Analyse figée et jamais réécrite.</small></article>
        <article><span>Premier marché postérieur</span><b id="retroFirst">—</b><small id="retroFirstDetail">L’observation doit être strictement postérieure à la fermeture analytique.</small></article>
        <article><span>TOP5 observé après CURRENT</span><b id="retroTop5">—</b><small id="retroTop5Detail">Rendement EUR observé depuis les prix figés du CURRENT.</small></article>
        <article><span>Largeur post-CURRENT</span><b id="retroBreadth">—</b><small id="retroBreadthDetail">Description du mouvement, pas validation d’une prévision.</small></article>
        <article id="retroLatestEvaluableCard"><span>Dernier CURRENT évaluable</span><b id="retroEvaluable">—</b><small id="retroEvaluableDetail">Aucune unité antérieure mesurable.</small></article>
        <article class="decision-memory-v2-action"><span>Contrat</span><b>OBSERVATION ≠ PRÉDICTION</b><small id="retroContract">Aucun score de réussite · aucune réécriture · aucun recalibrage · aucun ordre.</small></article>`;
      root.dataset.ui3961 = "1";
    }

    const actions = byId("decisionMemoryCompare")?.querySelector?.(".decision-memory-compare-actions");
    if (actions) {
      actions.querySelector("#btnDecisionBoardRetrospectiveExport3960")?.remove();
      if (!byId(EXPORT_ID)) {
        const button = document.createElement("button");
        button.type = "button";
        button.id = EXPORT_ID;
        button.textContent = "Exporter post-CURRENT .md";
        button.addEventListener("click", exportMarkdown);
        actions.appendChild(button);
      }
    }
    return root;
  }

  function render() {
    const root = ensureRoot();
    if (!root) return null;
    const data = derive();
    const pair = data.latestPair;
    const state = statusOf(pair);
    const firstTime = pair?.first ? marketTime(pair.first) : 0;
    const ev = data.latestEvaluable;
    const evFirstTime = ev?.first ? marketTime(ev.first) : 0;

    setText("retroStatus", state.label);
    setText("retroStatusDetail", state.code === "ready"
      ? "Premier snapshot canonique strictement postérieur détecté · mesure descriptive disponible."
      : state.code === "partial"
        ? "Un snapshot postérieur existe mais moins de 3 actifs TOP5 ont des prix EUR comparables."
        : pair ? "Dernier CURRENT encore ouvert côté preuve rétrospective : aucun snapshot canonique strictement postérieur." : "Aucun CURRENT analytique vérifié disponible.");

    setText("retroCount", `${data.evaluable.length} / ${data.currents.length}`);
    setText("retroCountDetail", `${data.markets.length} snapshot(s) marché canonique(s) disponibles · Analytical Memory et Market Memory restent séparées.`);

    setText("retroCurrent", pair ? compactFingerprint(fingerprint(pair.current)) : "—");
    setText("retroCurrentDetail", pair ? `${localTime(pair.closedAt)} · ${pair.current?.collector_id || "collecteur inconnu"}` : "Aucun CURRENT vérifié.");

    setText("retroFirst", firstTime ? localTime(firstTime) : "En attente");
    setText("retroFirstDetail", firstTime ? `${duration(pair.closedAt, firstTime)} après fermeture · ${pair.first?.collector_id || "collecteur inconnu"}` : "Aucune observation postérieure sélectionnée.");

    setText("retroTop5", pair?.firstReturns ? returnsLine(pair.firstReturns) : "—");
    setText("retroTop5Detail", pair?.latest && pair.latest !== pair.first
      ? `Dernière observation disponible ${localTime(marketTime(pair.latest))} : ${returnsLine(pair.latestReturns)}`
      : "Premier état marché postérieur uniquement ; aucune fenêtre future inventée.");

    setText("retroBreadth", pair?.firstReturns ? breadthLine(pair.firstReturns) : "—");
    setText("retroBreadthDetail", pair?.firstReturns?.comparable
      ? `${pair.firstReturns.comparable}/5 actif(s) comparables · seuil stable ±${FLAT_EPSILON_PCT.toFixed(2)} %.`
      : "Comparaison insuffisante.");

    if (ev) {
      setText("retroEvaluable", `${compactFingerprint(fingerprint(ev.current))} · ${localTime(evFirstTime)}`);
      setText("retroEvaluableDetail", `${duration(ev.closedAt, evFirstTime)} après fermeture · ${returnsLine(ev.firstReturns)} · ${breadthLine(ev.firstReturns)}.`);
    } else {
      setText("retroEvaluable", "Aucun");
      setText("retroEvaluableDetail", "Aucun CURRENT ne possède encore un snapshot postérieur avec au moins 3 prix TOP5 comparables.");
    }

    root.dataset.state = state.code;
    root.dataset.build = BUILD_3961;
    root.dataset.release = RELEASE_406151;
    root.dataset.readOnly = "true";
    root.dataset.evaluable = String(data.evaluable.length);
    root.dataset.currentCount = String(data.currents.length);

    const board = byId("decision-board");
    if (board) {
      board.dataset.retrospectiveReader = BUILD_3961;
      board.dataset.retrospectiveRelease = RELEASE_406151;
      board.dataset.retrospectiveEvaluable = String(data.evaluable.length);
    }
    return data;
  }

  function markdown(data = derive()) {
    const pair = data.latestPair;
    const state = statusOf(pair);
    const firstTime = pair?.first ? marketTime(pair.first) : 0;
    const ev = data.latestEvaluable;
    const evFirstTime = ev?.first ? marketTime(ev.first) : 0;
    return [
      "# Agent-Crypto — Post-CURRENT Validation", "",
      `- Release : ${RELEASE_406151}`,
      `- Reader : ${BUILD_3961}`,
      `- Généré : ${new Date().toISOString()}`,
      "- Contrat : observation rétrospective ≠ prédiction · lecture seule", "",
      "## Couverture", "",
      `- CURRENT vérifiés : ${data.currents.length}`,
      `- CURRENT évaluables : ${data.evaluable.length}`,
      `- Snapshots marché canoniques disponibles : ${data.markets.length}`, "",
      "## Dernier CURRENT", "",
      `- Statut : ${state.label}`,
      `- Fingerprint : ${pair ? fingerprint(pair.current) || "—" : "—"}`,
      `- Fermeture analytique : ${pair ? localTime(pair.closedAt) : "—"}`,
      `- Première observation postérieure : ${firstTime ? localTime(firstTime) : "—"}`,
      `- Délai : ${firstTime ? duration(pair.closedAt, firstTime) : "—"}`,
      `- TOP5 : ${pair?.firstReturns ? returnsLine(pair.firstReturns) : "—"}`,
      `- Largeur : ${pair?.firstReturns ? breadthLine(pair.firstReturns) : "—"}`, "",
      "## Dernier CURRENT évaluable", "",
      `- Fingerprint : ${ev ? fingerprint(ev.current) || "—" : "—"}`,
      `- Première observation postérieure : ${evFirstTime ? localTime(evFirstTime) : "—"}`,
      `- Délai : ${evFirstTime ? duration(ev.closedAt, evFirstTime) : "—"}`,
      `- TOP5 : ${ev?.firstReturns ? returnsLine(ev.firstReturns) : "—"}`,
      `- Largeur : ${ev?.firstReturns ? breadthLine(ev.firstReturns) : "—"}`, "",
      "## Lecture correcte", "",
      "- Une observation est retenue seulement si son timestamp canonique est strictement postérieur à la fermeture du CURRENT.",
      "- Les variations décrivent ce qui a été observé après la fermeture analytique.",
      "- Aucun score de réussite, aucune prédiction rétrospective et aucune fenêtre future inventée.",
      "- Aucun CURRENT, journal, Market Memory ou Analytical Memory n’est modifié.",
      "- Aucun Atlas, NØX, Aerith, Bridge ou Ollama n’est lancé.",
      "- Aucun ordre financier ou recommandation n’est produit."
    ].join("\n");
  }

  function exportMarkdown() {
    const body = markdown();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    if (typeof globalThis.downloadTextFile === "function") {
      globalThis.downloadTextFile(`agent_crypto_post_current_${stamp}.md`, "text/markdown;charset=utf-8", body);
      return body;
    }
    try {
      const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `agent_crypto_post_current_${stamp}.md`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (_) {}
    return body;
  }

  const baseRenderDecisionBoard = typeof globalThis.renderDecisionBoard === "function" ? globalThis.renderDecisionBoard : null;
  if (baseRenderDecisionBoard) {
    globalThis.renderDecisionBoard = function renderDecisionBoard3961(...args) {
      const result = baseRenderDecisionBoard.apply(this, args);
      try { render(); } catch (_) {}
      return result;
    };
  }

  document.addEventListener("click", event => {
    const id = event?.target?.closest?.("button")?.id || "";
    if (id === "btnAtlasAnalyticalMemoryRefresh394") queueMicrotask(() => { try { render(); } catch (_) {} });
  });

  globalThis.__AGENT_CRYPTO_RETROSPECTIVE_VALIDATION_3961__ = Object.freeze({
    build: BUILD_3961,
    release: RELEASE_406151,
    role: "read-only post-CURRENT retrospective observation reader",
    market_memory: "39.4.4R1",
    analytical_memory: "39.4",
    pairs_only_after_current_close: true,
    latest_evaluable_visible: true,
    forecast_accuracy_score: false,
    starts_atlas: false,
    starts_nox: false,
    starts_aerith: false,
    writes_memory: false,
    new_fetch: false,
    new_timer: false,
    new_websocket: false
  });
  globalThis.atlasRetrospectiveValidation = Object.freeze({ derive, render, markdown });

  queueMicrotask(() => { try { render(); } catch (_) {} });
})();