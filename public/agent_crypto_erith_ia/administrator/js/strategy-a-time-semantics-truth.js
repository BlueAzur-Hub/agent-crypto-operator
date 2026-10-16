/* Agent-Crypto @erith.IA — 40.6.168 TIME SEMANTICS TRUTH
   Canonical fact time is not save/receive time. Retrospective market pairing
   accepts only market timestamps; CURRENT pairing accepts only analytical close
   timestamps. After-cost evidence refuses a missing/invalid closed_at instead of
   synthesizing the current clock. No backtest, no order, no timer/observer. */
(() => {
  "use strict";

  const BUILD = "40.6.168";
  const TOP5 = Object.freeze(["BTC", "ETH", "BNB", "XRP", "SOL"]);
  const FLAT_EPSILON_PCT = 0.05;
  const baseRetro = globalThis.atlasRetrospectiveValidation || null;
  const baseMetrics = globalThis.AgentCryptoStrategyAAfterCostMetrics || null;

  const parseTime = value => {
    if (value === null || value === undefined || value === "") return 0;
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : 0;
  };
  const strictCurrentTime = record => parseTime(
    record?.closed_at || record?.completed_at || record?.current_truth?.closed_at || record?.current_truth?.completed_at
  );
  const strictMarketTime = record => parseTime(
    record?.market_generated_at || record?.source_time || record?.snapshot?.market_snapshot?.source_time
  );
  const canonicalMarketId = record => String(
    record?.market_snapshot_id || record?.snapshot?.market_snapshot?.snapshot_id || record?.snapshot_id || record?.id || ""
  ).trim();
  const assets = record => Array.isArray(record?.assets) ? record.assets
    : Array.isArray(record?.snapshot?.market_snapshot?.assets) ? record.snapshot.market_snapshot.assets
    : [];
  const assetMap = record => {
    const map = new Map();
    for (const row of assets(record)) {
      const symbol = String(row?.symbol || "").toUpperCase();
      if (TOP5.includes(symbol)) map.set(symbol, row);
    }
    return map;
  };
  const eurPrice = asset => {
    for (const key of ["price_eur", "spot_eur", "current_price", "price"]) {
      const n = Number(asset?.[key]);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return null;
  };
  function observedReturns(current, market) {
    const baseline = assetMap(current), observed = assetMap(market), rows = [];
    for (const symbol of TOP5) {
      const from = eurPrice(baseline.get(symbol)), to = eurPrice(observed.get(symbol));
      if (!(from > 0) || !(to > 0)) continue;
      rows.push({ symbol, from, to, pct: ((to / from) - 1) * 100 });
    }
    const up = rows.filter(row => row.pct > FLAT_EPSILON_PCT).length;
    const down = rows.filter(row => row.pct < -FLAT_EPSILON_PCT).length;
    return { rows, up, down, flat: rows.length - up - down, comparable: rows.length };
  }
  function canonicalMarkets(stats) {
    const source = Array.isArray(stats?.canonicalRecords) ? stats.canonicalRecords
      : Array.isArray(stats?.records) ? stats.records
      : Array.isArray(stats?.marketRecords) ? stats.marketRecords : [];
    const map = new Map();
    for (const record of source) {
      const t = strictMarketTime(record);
      if (!(t > 0)) continue;
      const key = canonicalMarketId(record) || `time:${t}`;
      const previous = map.get(key);
      if (!previous || strictMarketTime(previous) <= t) map.set(key, record);
    }
    return [...map.values()].sort((a, b) => strictMarketTime(a) - strictMarketTime(b));
  }
  function verifiedCurrents(stats) {
    const rows = Array.isArray(stats?.verified) ? stats.verified : [];
    return rows.filter(row => strictCurrentTime(row) > 0).slice().sort((a, b) => strictCurrentTime(a) - strictCurrentTime(b));
  }
  function pairCurrent(current, markets) {
    const closedAt = strictCurrentTime(current);
    const later = markets.filter(row => strictMarketTime(row) > closedAt);
    const first = later[0] || null, latest = later[later.length - 1] || null;
    return {
      current, closedAt, first, latest,
      firstReturns: first ? observedReturns(current, first) : null,
      latestReturns: latest ? observedReturns(current, latest) : null
    };
  }
  function strictDerive() {
    let raw = null;
    try { raw = baseRetro?.derive?.() || null; } catch (_) {}
    const marketStats = raw?.marketStats || {};
    const analyticalStats = raw?.analyticalStats || {};
    const markets = canonicalMarkets(marketStats);
    const currents = verifiedCurrents(analyticalStats);
    const pairs = currents.map(current => pairCurrent(current, markets));
    const evaluable = pairs.filter(pair => pair.first && Number(pair.firstReturns?.comparable || 0) >= 3);
    return {
      marketStats, analyticalStats, markets, currents, pairs, evaluable,
      latestPair: pairs[pairs.length - 1] || null,
      latestEvaluable: [...evaluable].reverse()[0] || null,
      time_truth: {
        build: BUILD,
        current_fact_time_fields: ["closed_at", "completed_at", "current_truth.closed_at", "current_truth.completed_at"],
        market_fact_time_fields: ["market_generated_at", "source_time", "snapshot.market_snapshot.source_time"],
        saved_at_is_market_time: false,
        last_seen_at_is_market_time: false
      }
    };
  }

  const localTime = value => { const ms = typeof value === "number" ? value : parseTime(value); return ms ? new Date(ms).toLocaleString("fr-FR") : "—"; };
  const duration = (from, to) => { if (!(from > 0) || !(to > from)) return "—"; const m = Math.round((to - from) / 60000); return m < 60 ? `${m} min` : `${Math.floor(m/60)} h${m%60?` ${m%60} min`:""}`; };
  const pct = value => Number.isFinite(Number(value)) ? `${Number(value) >= 0 ? "+" : ""}${Number(value).toFixed(2)} %` : "—";
  const returnsLine = data => Array.isArray(data?.rows) && data.rows.length ? data.rows.map(row => `${row.symbol} ${pct(row.pct)}`).join(" · ") : "—";
  const breadthLine = data => Number(data?.comparable) ? `${Number(data.up||0)} hausse(s) · ${Number(data.down||0)} baisse(s) · ${Number(data.flat||0)} stable(s)` : "—";
  const fingerprint = record => {
    const raw = String(record?.analysis_fingerprint || record?.current_fingerprint || "").trim();
    return raw ? (raw.startsWith("sha256:") ? raw : `sha256:${raw}`) : "";
  };
  const compact = value => value ? (value.length > 22 ? `${value.slice(0,18)}…` : value) : "—";

  function strictRender() {
    try { baseRetro?.render?.(); } catch (_) {}
    const data = strictDerive();
    const pair = data.latestPair, ev = data.latestEvaluable;
    const firstTime = pair?.first ? strictMarketTime(pair.first) : 0;
    const evFirstTime = ev?.first ? strictMarketTime(ev.first) : 0;
    const set = (id, value) => { const node = document.getElementById(id); if (node) node.textContent = String(value); };
    set("retroCount", `${data.evaluable.length} / ${data.currents.length}`);
    set("retroCountDetail", `${data.markets.length} snapshot(s) avec timestamp marché canonique · saved_at/last_seen_at exclus.`);
    set("retroCurrent", pair ? compact(fingerprint(pair.current)) : "—");
    set("retroCurrentDetail", pair ? `${localTime(pair.closedAt)} · fermeture analytique canonique` : "Aucun CURRENT avec fermeture canonique.");
    set("retroFirst", firstTime ? localTime(firstTime) : "En attente");
    set("retroFirstDetail", firstTime ? `${duration(pair.closedAt, firstTime)} après fermeture · timestamp marché canonique` : "Aucune observation marché canonique strictement postérieure.");
    set("retroTop5", pair?.firstReturns ? returnsLine(pair.firstReturns) : "—");
    set("retroBreadth", pair?.firstReturns ? breadthLine(pair.firstReturns) : "—");
    set("retroEvaluable", ev ? `${compact(fingerprint(ev.current))} · ${localTime(evFirstTime)}` : "Aucun");
    set("retroEvaluableDetail", ev ? `${duration(ev.closedAt, evFirstTime)} après fermeture · ${returnsLine(ev.firstReturns)} · ${breadthLine(ev.firstReturns)}.` : "Aucun CURRENT évaluable avec timestamps canoniques stricts.");
    const root = document.getElementById("decisionRetrospective");
    if (root) { root.dataset.timeTruthBuild = BUILD; root.dataset.evaluable = String(data.evaluable.length); root.dataset.currentCount = String(data.currents.length); }
    return data;
  }

  if (baseRetro) {
    globalThis.atlasRetrospectiveValidation = Object.freeze({
      ...baseRetro,
      derive: strictDerive,
      render: strictRender,
      markdown: () => typeof baseRetro.markdown === "function" ? baseRetro.markdown(strictDerive()) : "",
      time_truth_build: BUILD
    });
  }

  if (baseMetrics) {
    const recordStrict = payload => {
      const closedAt = payload?.closed_at;
      if (!(parseTime(closedAt) > 0)) return { ok: false, reason: "CLOSED_AT_MISSING_OR_INVALID", timestamp_certifiable: false };
      const result = baseMetrics.record_from_reconciliation?.(payload) || baseMetrics.from_reconciliation?.(payload);
      if (result?.ok === true) {
        try { document.dispatchEvent(new CustomEvent("agent-crypto:evidence-data-changed", { detail: { owner: "after-cost-metrics", build: BUILD } })); } catch (_) {}
      }
      return result;
    };
    globalThis.AgentCryptoStrategyAAfterCostMetrics = Object.freeze({
      ...baseMetrics,
      build: BUILD,
      from_reconciliation: recordStrict,
      record_from_reconciliation: recordStrict,
      closed_at_required_for_certification: true,
      synthetic_now_for_missing_closed_at: false,
      time_truth_build: BUILD
    });
  }

  globalThis.__AGENT_CRYPTO_TIME_SEMANTICS_TRUTH_406168__ = Object.freeze({
    build: BUILD,
    saved_at_is_market_time: false,
    last_seen_at_is_market_time: false,
    missing_closed_at_becomes_now: false,
    strict_post_current_pairing: true,
    paper_only: true,
    real_order: false,
    recurring_timer: false,
    observer: false
  });

  document.addEventListener("agent-crypto:runtime-modules-ready", strictRender, { once: true });
  document.addEventListener("erith:system-hydrated", strictRender, { passive: true });
  window.addEventListener("pageshow", strictRender);
  queueMicrotask(strictRender);
})();