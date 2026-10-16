/* Agent-Crypto @erith.IA — 40.6.494 G3 PROSPECTIVE T0 + LIVE LEDGER MERGE TRUTH
   Operator-triggered, PAPER-only capture of one NEW Strategy A decision cycle.
   Existing historical ledger rows are never backfilled. The legacy producer remains
   authoritative; this module adds a bounded prospective evidence overlay and exposes
   it through the existing generic Experiment Ledger read facade.
   No real order, wallet, credentials, withdrawal, fetch, websocket, observer or
   recurring timer. G3 remains PENDING and G9 remains LOCKED. */
(() => {
  "use strict";

  const BUILD = "40.6.494";
  const OWNER = "strategy-a-g3-prospective-t0-capture";
  const STORAGE_KEY = "agent_crypto_erith_ia_strategy_a_g3_prospective_t0_40_6_205";
  const MAX_ROWS = 64;
  const PANEL_ID = "strategyAG3ProspectiveT0Capture";
  const HOST_ID = "strategyAEvidenceSupplements";
  const STYLE_ID = `${PANEL_ID}Style`;
  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const plain = value => !!value && typeof value === "object" && !Array.isArray(value);
  const text = value => value === null || value === undefined ? "" : String(value).trim();
  const upper = value => text(value).toUpperCase();
  const num = value => {
    if (value === null || value === undefined || typeof value === "boolean") return null;
    if (typeof value === "string" && !value.trim()) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
  const parseTime = value => {
    const ms = typeof value === "number" ? value : Date.parse(text(value));
    return Number.isFinite(ms) ? ms : null;
  };
  const iso = value => {
    const ms = parseTime(value);
    return ms === null ? null : new Date(ms).toISOString();
  };
  const safeCall = (fn, fallback = null, ...args) => {
    try { return typeof fn === "function" ? fn(...args) : fallback; }
    catch (_) { return fallback; }
  };
  const cycleId = row => text(row?.cycle_id ?? row?.decision_id ?? row?.proposal_id ?? row?.id);
  const ORIGINAL_GENERIC_LEDGER = globalThis.AgentCryptoStrategyAExperimentLedger || null;
  const EXACT_LEGACY_LEDGER = globalThis.AgentCryptoStrategyAExperimentLedger404289 || null;
  let facadeInstalled = false;
  let lastReceipt = null;

  function readStored() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(raw) ? raw.filter(plain).slice(-MAX_ROWS) : [];
    } catch (_) {
      return [];
    }
  }

  let PROSPECTIVE = typeof localStorage !== "undefined" ? readStored() : [];

  function persist() {
    PROSPECTIVE = PROSPECTIVE.filter(plain).slice(-MAX_ROWS);
    if (typeof localStorage === "undefined") return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(PROSPECTIVE));
      return true;
    } catch (_) {
      return false;
    }
  }

  function sourceLedger() {
    return EXACT_LEGACY_LEDGER || ORIGINAL_GENERIC_LEDGER || null;
  }

  function readLegacy(owner = sourceLedger()) {
    const value = safeCall(owner?.read, []);
    if (Array.isArray(value)) return value.filter(plain);
    if (Array.isArray(value?.rows)) return value.rows.filter(plain);
    if (Array.isArray(value?.entries)) return value.entries.filter(plain);
    return [];
  }

  function ledgerRowTime(row) {
    return parseTime(row?.captured_at ?? row?.decision_at ?? row?.decided_at ?? row?.available_at ?? row?.at ?? row?.timestamp);
  }

  function mergeLedgerViews(genericRows = [], exactRows = [], prospectiveRows = []) {
    const byId = new Map();
    const anonymous = [];
    const absorb = (rows, mode) => {
      for (const row of Array.isArray(rows) ? rows : []) {
        if (!plain(row)) continue;
        const id = cycleId(row);
        if (!id) {
          anonymous.push(row);
          continue;
        }
        const previous = byId.get(id);
        if (mode === "exact" && plain(previous)) {
          // Live exact facts are authoritative for overlapping fields while
          // prospective-only evidence fields remain available on the facade.
          byId.set(id, { ...previous, ...row });
        } else {
          byId.set(id, row);
        }
      }
    };

    // Historical/durable generic view first, then prospective evidence overlay,
    // then the exact live owner last. The live owner must never be hidden by an
    // older facade snapshot for a cycle_id that Auto A has just emitted.
    absorb(genericRows, "generic");
    absorb(prospectiveRows, "prospective");
    absorb(exactRows, "exact");

    const merged = anonymous.concat([...byId.values()]);
    merged.sort((a, b) => {
      const ta = ledgerRowTime(a), tb = ledgerRowTime(b);
      if (ta === null && tb === null) return 0;
      if (ta === null) return -1;
      if (tb === null) return 1;
      return ta - tb;
    });
    return merged.slice(-240);
  }

  function mergedRead() {
    const generic = ORIGINAL_GENERIC_LEDGER ? readLegacy(ORIGINAL_GENERIC_LEDGER) : [];
    const exact = EXACT_LEGACY_LEDGER ? readLegacy(EXACT_LEGACY_LEDGER) : [];
    return mergeLedgerViews(generic, exact, PROSPECTIVE.filter(plain));
  }

  function installLedgerFacade() {
    if (facadeInstalled) return true;
    const base = sourceLedger();
    if (!base) return false;

    const wrapper = Object.freeze({
      build: BUILD,
      source_build: base.build || null,
      source_owner: EXACT_LEGACY_LEDGER ? "AgentCryptoStrategyAExperimentLedger404289" : "AgentCryptoStrategyAExperimentLedger",
      read: mergedRead,
      summary: () => ({
        build: BUILD,
        source_rows: readLegacy(base).length,
        generic_rows: ORIGINAL_GENERIC_LEDGER ? readLegacy(ORIGINAL_GENERIC_LEDGER).length : 0,
        exact_live_rows: EXACT_LEGACY_LEDGER ? readLegacy(EXACT_LEGACY_LEDGER).length : 0,
        prospective_rows: PROSPECTIVE.length,
        merged_rows: mergedRead().length,
        exact_live_priority: true,
        paper_only: true,
        g3: "PENDING",
        g9: "LOCKED"
      }),
      prospective_read: () => clone(PROSPECTIVE) || [],
      original_read: () => clone(readLegacy(base)) || [],
      storage_key: STORAGE_KEY,
      max_prospective_rows: MAX_ROWS,
      paper_only: true,
      real_orders: false,
      kraken_network: false,
      current_runtime_backfill: false,
      current_oracle_applied_to_past: false,
      future_outcomes_used_as_t0_input: false
    });

    try {
      globalThis.AgentCryptoStrategyAExperimentLedger = wrapper;
      facadeInstalled = globalThis.AgentCryptoStrategyAExperimentLedger === wrapper;
    } catch (_) {
      facadeInstalled = false;
    }

    if (!facadeInstalled) {
      try {
        Object.defineProperty(globalThis, "AgentCryptoStrategyAExperimentLedger", {
          configurable: true,
          writable: true,
          value: wrapper
        });
        facadeInstalled = globalThis.AgentCryptoStrategyAExperimentLedger === wrapper;
      } catch (_) {
        facadeInstalled = false;
      }
    }
    return facadeInstalled;
  }

  function gate(row, key) {
    const gates = Array.isArray(row?.gates) ? row.gates : [];
    return gates.find(item => text(item?.key).toLowerCase() === String(key).toLowerCase()) || null;
  }

  function gateBool(row, key) {
    const state = text(gate(row, key)?.state).toLowerCase();
    if (state === "pass") return true;
    if (state === "wait" || state === "stop") return false;
    return null;
  }

  function decisionFrom(row) {
    const phase = upper(row?.phase);
    const proposal = upper(row?.proposal_status);
    const paper = upper(row?.paper?.status);
    if (["PAPER_OPEN", "MONITORING_OPEN", "FILLED", "SUBMITTED", "ACK", "PARTIAL"].some(x => phase.includes(x) || paper.includes(x))) {
      return "PAPER_CANDIDATE";
    }
    if (phase || proposal) return "NO_TRADE";
    return null;
  }

  function sourceTimestamp(obj) {
    const candidates = [
      ["source_time", obj?.source_time],
      ["market_time", obj?.market_time],
      ["event_time", obj?.event_time],
      ["trade_time", obj?.trade_time],
      ["timestamp", obj?.timestamp],
      ["at", obj?.at]
    ];
    for (const [path, value] of candidates) {
      const ms = parseTime(value);
      if (ms !== null) return { path, ms, iso: new Date(ms).toISOString() };
    }
    return { path: null, ms: null, iso: null };
  }

  function quoteSnapshot() {
    const findCoin = globalThis.findCoinByQuery;
    const quoteFor = globalThis.atlasCurrentQuoteForCoin;
    if (typeof findCoin !== "function" || typeof quoteFor !== "function") return null;
    const coin = safeCall(findCoin, null, "BTC");
    if (!coin) return null;
    const quote = safeCall(quoteFor, null, coin);
    if (!quote || typeof quote !== "object") return null;
    const price = num(quote?.price ?? quote?.price_eur ?? coin?.price ?? coin?.current_price);
    const ts = sourceTimestamp(quote);
    return {
      kind: "CURRENT_QUOTE",
      symbol: "BTC",
      price_eur: price,
      market_at: ts.iso,
      timestamp_path: ts.path,
      source: text(quote?.source ?? coin?.source) || null,
      proven_source_time: ts.ms !== null,
      source_object_available: true
    };
  }

  function seriesSnapshot() {
    const s = safeCall(globalThis.AgentCryptoMarketSeriesTruth?.snapshot, null);
    if (!s || s.temporal_coverage_certified !== true || upper(s.symbol || s.asset_id) !== "BTC") return null;
    const rows = Array.isArray(s.rows) ? s.rows : [];
    const last = rows.at(-1);
    if (!Array.isArray(last)) return null;
    const t = parseTime(last[0]);
    const p = num(last[1]);
    if (t === null || p === null || !(p > 0)) return null;
    return {
      kind: "CERTIFIED_24H_SERIES_LAST_POINT",
      symbol: "BTC",
      price_eur: p,
      market_at: new Date(t).toISOString(),
      timestamp_path: "AgentCryptoMarketSeriesTruth.snapshot.rows[-1][0]",
      source: text(s.source_kind || s.owner) || null,
      proven_source_time: true,
      source_object_available: true
    };
  }

  function preMarketSnapshot() {
    const q = quoteSnapshot();
    if (q?.proven_source_time && q?.price_eur !== null) return q;
    return seriesSnapshot() || q || {
      kind: "UNAVAILABLE",
      symbol: "BTC",
      price_eur: null,
      market_at: null,
      timestamp_path: null,
      source: null,
      proven_source_time: false,
      source_object_available: false
    };
  }

  function priceMatch(a, b) {
    const x = num(a), y = num(b);
    if (x === null || y === null || !(x > 0) || !(y > 0)) return false;
    return Math.abs(x - y) <= Math.max(1e-8, Math.max(Math.abs(x), Math.abs(y)) * 1e-10);
  }

  function normalizeProspective(sourceRow, marketSnapshot, context = {}) {
    const row = plain(sourceRow) ? sourceRow : {};
    const market = plain(marketSnapshot) ? marketSnapshot : {};
    const id = cycleId(row);
    const capturedAt = iso(row?.captured_at ?? context.captured_at);
    const decision = decisionFrom(row);
    const sourcePrice = num(row?.market?.price_eur);
    const candidateMarketAt = iso(market?.market_at);
    const marketPriceMatches = priceMatch(sourcePrice, market?.price_eur);
    const temporalOrderOk = candidateMarketAt && capturedAt
      ? Date.parse(candidateMarketAt) <= Date.parse(capturedAt)
      : false;
    const marketTimeProven = market?.proven_source_time === true && marketPriceMatches && temporalOrderOk;
    const specBuild = text(context.spec_build);
    const dataReady = gateBool(row, "data");
    const reentryFresh = gateBool(row, "reentry");
    const riskDecisionRaw = text(row?.risk?.decision);
    const riskDecision = riskDecisionRaw || null;
    const sourceNotional = num(row?.risk?.authorized_notional_eur);
    const riskNotReached = upper(riskDecision) === "NOT_REACHED";
    const normalizedNotional = sourceNotional !== null ? sourceNotional : (riskNotReached ? 0 : null);
    const requiredMove = num(row?.cost?.required_move_pct);
    const expectedMove = num(row?.cost?.expected_move_pct);
    const direction = num(row?.oracle?.direction_score);
    const confidence = num(row?.oracle?.confidence);
    const btc24 = num(row?.market?.change_24h_pct);
    const regime = text(row?.oracle?.regime) || null;
    const missing = [];
    if (!id) missing.push("cycle_id");
    if (!decision) missing.push("decision");
    if (!marketTimeProven) missing.push("market_at_proven");
    if (!capturedAt) missing.push("decision_at");
    if (!specBuild) missing.push("strategy_policy_build");
    if (dataReady === null) missing.push("data_ready");
    if (!regime) missing.push("regime");
    if (direction === null) missing.push("direction_score");
    if (confidence === null) missing.push("confidence");
    if (btc24 === null) missing.push("btc24_pct");
    if (reentryFresh === null) missing.push("reentry_fresh");
    if (expectedMove === null) missing.push("expected_move_pct");
    if (requiredMove === null) missing.push("required_move_pct");
    if (!riskDecision) missing.push("risk_decision");
    if (normalizedNotional === null) missing.push("authorized_notional_eur");

    return {
      schema: "agent_crypto_strategy_a_g3_prospective_t0_v1",
      build: BUILD,
      evidence_mode: "PROSPECTIVE_ONLY",
      cycle_id: id || null,
      decision_id: text(row?.decision_id) || id || null,
      asset: "BTC",
      symbol: "BTC",
      decision,
      reason: text(row?.proposal_reason || row?.first_blocker_label || row?.last_action) || null,
      market_at: marketTimeProven ? candidateMarketAt : null,
      decision_at: capturedAt,
      decided_at: capturedAt,
      available_at: capturedAt,
      strategy_build: specBuild || null,
      policy_build: specBuild || null,
      runtime_build: BUILD,
      data_ready: dataReady,
      regime,
      direction,
      direction_score: direction,
      confidence,
      btc_24h_pct: btc24,
      btc24_pct: btc24,
      reentry_fresh: reentryFresh,
      expected_move_pct: expectedMove,
      required_move_pct: requiredMove,
      cost_gate_pct: requiredMove,
      duplicate: false,
      risk_decision: riskDecision,
      authorized_notional_eur: normalizedNotional,
      inputs: {
        data_ready: dataReady,
        regime,
        direction_score: direction,
        confidence,
        btc24_pct: btc24,
        reentry_fresh: reentryFresh,
        expected_move_pct: expectedMove,
        required_move_pct: requiredMove,
        duplicate: false,
        risk_decision: riskDecision,
        authorized_notional_eur: normalizedNotional
      },
      source_provenance: {
        legacy_owner: context.legacy_owner || null,
        legacy_build: row?.build || null,
        legacy_cycle_number: num(row?.cycle_number),
        legacy_captured_at: capturedAt,
        market_source_kind: market?.kind || null,
        market_source: market?.source || null,
        market_timestamp_path: market?.timestamp_path || null,
        market_source_time_proven: market?.proven_source_time === true,
        market_price_eur_pre_tick: num(market?.price_eur),
        legacy_market_price_eur: sourcePrice,
        market_price_match: marketPriceMatches,
        market_before_decision: temporalOrderOk,
        canonical_spec_build: specBuild || null,
        risk_not_reached_normalized_to_zero: riskNotReached && sourceNotional === null
      },
      prospective_t0_complete: missing.length === 0,
      state: missing.length === 0 ? "PROSPECTIVE_T0_COMPLETE" : "PROSPECTIVE_T0_INCOMPLETE",
      blockers: missing,
      current_runtime_backfill: false,
      current_oracle_applied_to_past: false,
      future_outcomes_used_as_t0_input: false,
      lookahead: false,
      paper_only: true,
      real_order: false,
      g3: "PENDING",
      g9: "LOCKED"
    };
  }

  function captureOnce() {
    installLedgerFacade();
    const legacy = sourceLedger();
    const runner = globalThis.AgentCryptoAutoPaperRunner404265 || globalThis.AgentCryptoAutoPaperRunner || null;
    const spec = globalThis.AgentCryptoStrategyACanonicalSpec || null;
    const beforeRows = readLegacy(legacy);
    const beforeIds = new Set(beforeRows.map(cycleId).filter(Boolean));
    const beforeProspectiveIds = new Set(PROSPECTIVE.map(cycleId).filter(Boolean));
    const preMarket = preMarketSnapshot();
    const runnerState = safeCall(runner?.state, null);

    if (!legacy || typeof legacy.read !== "function") {
      lastReceipt = { build: BUILD, ok: false, blocker: "EXPERIMENT_LEDGER_OWNER_UNAVAILABLE", paper_only: true, g3: "PENDING", g9: "LOCKED" };
      render();
      return clone(lastReceipt);
    }
    if (!runner || typeof runner.tick !== "function") {
      lastReceipt = { build: BUILD, ok: false, blocker: "AUTO_PAPER_RUNNER_TICK_UNAVAILABLE", paper_only: true, g3: "PENDING", g9: "LOCKED" };
      render();
      return clone(lastReceipt);
    }
    if (runnerState && runnerState.enabled === false) {
      lastReceipt = {
        build: BUILD, ok: false, blocker: "AUTO_A_NOT_ACTIVE",
        action: "ACTIVER_AUTO_A_THEN_CAPTURE_ONE_T0",
        runner_build: runner.build || null, paper_only: true, g3: "PENDING", g9: "LOCKED"
      };
      render();
      return clone(lastReceipt);
    }

    safeCall(runner.tick, null);
    const afterRows = readLegacy(legacy);
    const newRows = afterRows.filter(row => {
      const id = cycleId(row);
      return id && !beforeIds.has(id) && !beforeProspectiveIds.has(id);
    });

    if (newRows.length !== 1) {
      lastReceipt = {
        build: BUILD,
        ok: false,
        blocker: newRows.length === 0 ? "NO_NEW_PROSPECTIVE_LEDGER_ROW" : "AMBIGUOUS_MULTIPLE_NEW_LEDGER_ROWS",
        source_rows_before: beforeRows.length,
        source_rows_after: afterRows.length,
        new_rows: newRows.length,
        runner_build: runner.build || null,
        paper_only: true,
        g3: "PENDING",
        g9: "LOCKED"
      };
      refreshEvidenceViews();
      return clone(lastReceipt);
    }

    const normalized = normalizeProspective(newRows[0], preMarket, {
      spec_build: spec?.build || null,
      legacy_owner: legacy === EXACT_LEGACY_LEDGER ? "AgentCryptoStrategyAExperimentLedger404289" : "AgentCryptoStrategyAExperimentLedger"
    });
    PROSPECTIVE.push(normalized);
    const persisted = persist();
    installLedgerFacade();

    lastReceipt = {
      build: BUILD,
      ok: true,
      state: normalized.state,
      cycle_id: normalized.cycle_id,
      prospective_t0_complete: normalized.prospective_t0_complete,
      blockers: normalized.blockers,
      market_at: normalized.market_at,
      market_time_proven: normalized.source_provenance.market_source_time_proven && normalized.source_provenance.market_price_match && normalized.source_provenance.market_before_decision,
      version_binding: normalized.policy_build,
      persisted,
      source_rows_before: beforeRows.length,
      source_rows_after: afterRows.length,
      prospective_rows: PROSPECTIVE.length,
      paper_only: true,
      g3: "PENDING",
      g9: "LOCKED"
    };
    refreshEvidenceViews();
    return clone(lastReceipt);
  }

  function snapshot() {
    installLedgerFacade();
    const source = sourceLedger();
    const latest = PROSPECTIVE.at(-1) || null;
    return {
      schema: "agent_crypto_strategy_a_g3_prospective_t0_capture_snapshot_v1",
      build: BUILD,
      owner: OWNER,
      source_owner: source === EXACT_LEGACY_LEDGER ? "AgentCryptoStrategyAExperimentLedger404289" : (source ? "AgentCryptoStrategyAExperimentLedger" : null),
      source_build: source?.build || null,
      runner_owner: globalThis.AgentCryptoAutoPaperRunner404265 ? "AgentCryptoAutoPaperRunner404265" : (globalThis.AgentCryptoAutoPaperRunner ? "AgentCryptoAutoPaperRunner" : null),
      runner_build: (globalThis.AgentCryptoAutoPaperRunner404265 || globalThis.AgentCryptoAutoPaperRunner)?.build || null,
      facade_installed: facadeInstalled,
      prospective_rows: PROSPECTIVE.length,
      complete_rows: PROSPECTIVE.filter(row => row?.prospective_t0_complete === true).length,
      latest_cycle_id: latest?.cycle_id || null,
      latest_state: latest?.state || "WAITING_OPERATOR_CAPTURE",
      latest_market_at: latest?.market_at || null,
      latest_policy_build: latest?.policy_build || null,
      latest_blockers: Array.isArray(latest?.blockers) ? latest.blockers : [],
      last_receipt: clone(lastReceipt),
      current_runtime_backfill: false,
      paper_only: true,
      real_order: false,
      g3: "PENDING",
      g9: "LOCKED"
    };
  }

  function ensureStyle() {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      #${PANEL_ID}{margin-top:8px;padding:8px;border:1px solid rgba(124,235,204,.24);border-radius:8px;background:rgba(3,28,27,.38)}
      #${PANEL_ID} .h{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
      #${PANEL_ID} .t{font-size:8px;font-weight:950;letter-spacing:.08em;color:#8ff1d5;text-transform:uppercase}
      #${PANEL_ID} .g{display:grid;grid-template-columns:repeat(auto-fit,minmax(105px,1fr));gap:5px;margin-top:7px}
      #${PANEL_ID} .k{padding:5px;border:1px solid rgba(255,255,255,.06);border-radius:7px}
      #${PANEL_ID} .k span{display:block;font-size:7px;color:#789b91;text-transform:uppercase}
      #${PANEL_ID} .k b{display:block;margin-top:2px;font-size:8px;color:#effffb;overflow-wrap:anywhere}
      #${PANEL_ID} .n{margin-top:6px;font-size:8px;color:#88a9a0;line-height:1.35}
      #${PANEL_ID} button{font-size:13px!important;min-height:38px!important}
    `;
    document.head.appendChild(s);
  }

  const esc = value => String(value ?? "—").replace(/[&<>"]/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[m]));

  function render() {
    if (typeof document === "undefined") return snapshot();
    installLedgerFacade();
    const host = document.getElementById(HOST_ID);
    const checkpoint = document.getElementById("strategyAG3CascadeCheckpoint");
    if (!host || !checkpoint) return snapshot();
    ensureStyle();
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement("section");
      panel.id = PANEL_ID;
    }
    // 40.6.206: the checkpoint owner rewrites its own innerHTML during refresh/export.
    // Keep the prospective capture panel as a sibling inside the already terrain-proven
    // stable evidence host so checkpoint rerenders cannot delete it.
    if (panel.parentElement !== host || checkpoint.nextElementSibling !== panel) {
      checkpoint.insertAdjacentElement("afterend", panel);
    }
    panel.dataset.stableEvidenceHost = HOST_ID;
    panel.dataset.outsideCheckpointSubtree = "true";
    const s = snapshot();
    const blockers = s.latest_blockers?.length ? s.latest_blockers.join(" · ") : "AUCUN — prêt pour audit T0";
    panel.innerHTML = `
      <div class="h"><div class="t">G3 · CAPTURE T0 PROSPECTIVE · ${BUILD}</div><button type="button" class="btn small" id="${PANEL_ID}Run">CAPTURER LE PROCHAIN CYCLE PAPER</button></div>
      <div class="g">
        <div class="k"><span>Source owner</span><b>${esc(s.source_owner)}</b></div>
        <div class="k"><span>Prospective rows</span><b>${esc(s.prospective_rows)}</b></div>
        <div class="k"><span>Complete rows</span><b>${esc(s.complete_rows)}</b></div>
        <div class="k"><span>Last ID</span><b>${esc(s.latest_cycle_id)}</b></div>
        <div class="k"><span>Market time</span><b>${esc(s.latest_market_at || "NON PROUVÉ")}</b></div>
        <div class="k"><span>Policy binding</span><b>${esc(s.latest_policy_build || "NON PROUVÉ")}</b></div>
        <div class="k"><span>T0 state</span><b>${esc(s.latest_state)}</b></div>
        <div class="k"><span>Facade</span><b>${s.facade_installed ? "MERGED READ ACTIVE" : "NON LIÉE"}</b></div>
      </div>
      <div class="n">BLOCKER · ${esc(blockers)} · Prospective uniquement : aucun backfill historique, aucun Oracle actuel appliqué au passé, aucune donnée future utilisée.</div>`;
    panel.querySelector(`#${PANEL_ID}Run`)?.addEventListener("click", captureOnce, { once: false });
    return s;
  }

  function refreshEvidenceViews() {
    try { globalThis.AgentCryptoStrategyAG3T0DecisionProof?.render?.(); } catch (_) {}
    try { globalThis.AgentCryptoStrategyAG3ReplayDataset?.render?.(); } catch (_) {}
    try { globalThis.AgentCryptoStrategyAG3DecisionReplay?.render?.(); } catch (_) {}
    try { globalThis.AgentCryptoStrategyAG3CascadeCheckpoint?.render?.(); } catch (_) {}
    try { render(); } catch (_) {}
  }

  function selfTest() {
    const base = Date.UTC(2026, 8, 16, 20, 0, 0);
    const source = {
      build: "40.4.289",
      cycle_id: "A-CYCLE-TEST",
      decision_id: "P-TEST",
      captured_at: new Date(base + 2000).toISOString(),
      phase: "COST_GATE_WAIT",
      proposal_status: "PROPOSED",
      proposal_reason: "Cost gate",
      gates: [
        { key: "data", state: "pass" },
        { key: "reentry", state: "pass" },
        { key: "cost", state: "wait" }
      ],
      market: { symbol: "BTC", price_eur: 65000, change_24h_pct: 1.2 },
      oracle: { regime: "MIXTE", confidence: 94, direction_score: 16 },
      cost: { expected_move_pct: 0.62, required_move_pct: 0.80 },
      risk: { decision: "NOT_REACHED", authorized_notional_eur: null }
    };
    const market = {
      kind: "CURRENT_QUOTE",
      symbol: "BTC",
      price_eur: 65000,
      market_at: new Date(base).toISOString(),
      timestamp_path: "timestamp",
      source: "TEST",
      proven_source_time: true
    };
    const complete = normalizeProspective(source, market, { spec_build: "40.6.56", legacy_owner: "TEST" });
    const noTime = normalizeProspective(source, { ...market, market_at: null, proven_source_time: false }, { spec_build: "40.6.56", legacy_owner: "TEST" });
    const badPrice = normalizeProspective(source, { ...market, price_eur: 65001 }, { spec_build: "40.6.56", legacy_owner: "TEST" });
    const genericRows = Array.from({length: 241}, (_, i) => ({
      cycle_id: "OLD-" + String(i).padStart(3, "0"),
      captured_at: new Date(base - (241 - i) * 60000).toISOString(),
      phase: "NO_TRADE",
      marker: "GENERIC"
    })).concat([{
      cycle_id: "A-CYCLE-LIVE",
      captured_at: new Date(base + 1000).toISOString(),
      phase: "NO_TRADE",
      marker: "STALE_GENERIC",
      prospective_t0_complete: true
    }]);
    const prospectiveRows = [{
      cycle_id: "A-CYCLE-LIVE",
      decision_at: new Date(base + 1000).toISOString(),
      prospective_t0_complete: true,
      prospective_marker: "KEPT"
    }];
    const exactRows = [{
      cycle_id: "A-CYCLE-LIVE",
      captured_at: new Date(base + 2000).toISOString(),
      phase: "COST_GATE_WAIT",
      marker: "EXACT_LIVE"
    }, {
      cycle_id: "A-CYCLE-NEWEST",
      captured_at: new Date(base + 3000).toISOString(),
      phase: "NO_TRADE",
      marker: "EXACT_NEWEST"
    }];
    const merged = mergeLedgerViews(genericRows, exactRows, prospectiveRows);
    const mergedLive = merged.find(row => cycleId(row) === "A-CYCLE-LIVE");
    const mergedNewest = merged.at(-1);

    const pass =
      complete.prospective_t0_complete === true &&
      complete.decision === "NO_TRADE" &&
      complete.authorized_notional_eur === 0 &&
      complete.policy_build === "40.6.56" &&
      complete.market_at === new Date(base).toISOString() &&
      noTime.prospective_t0_complete === false &&
      noTime.blockers.includes("market_at_proven") &&
      badPrice.prospective_t0_complete === false &&
      badPrice.blockers.includes("market_at_proven") &&
      complete.current_runtime_backfill === false &&
      complete.future_outcomes_used_as_t0_input === false &&
      merged.length === 240 &&
      mergedLive?.marker === "EXACT_LIVE" &&
      mergedLive?.prospective_marker === "KEPT" &&
      mergedNewest?.cycle_id === "A-CYCLE-NEWEST";
    return {
      schema: "agent_crypto_strategy_a_g3_prospective_t0_capture_self_test_v1",
      build: BUILD,
      pass,
      checks: {
        complete_prospective_row_can_be_built: complete.prospective_t0_complete === true,
        cost_wait_maps_to_no_trade: complete.decision === "NO_TRADE",
        not_reached_risk_is_explicit_zero_authorization: complete.authorized_notional_eur === 0,
        canonical_spec_build_is_bound: complete.policy_build === "40.6.56",
        missing_market_time_fails_closed: noTime.prospective_t0_complete === false,
        price_mismatch_fails_closed: badPrice.prospective_t0_complete === false,
        no_historical_backfill: complete.current_runtime_backfill === false,
        no_future_outcomes: complete.future_outcomes_used_as_t0_input === false,
        merged_view_remains_bounded_240: merged.length === 240,
        exact_live_overrides_stale_generic: mergedLive?.marker === "EXACT_LIVE",
        prospective_fields_survive_live_merge: mergedLive?.prospective_marker === "KEPT",
        newest_exact_cycle_is_visible: mergedNewest?.cycle_id === "A-CYCLE-NEWEST"
      }
    };
  }

  const api = Object.freeze({
    build: BUILD,
    owner: OWNER,
    storage_key: STORAGE_KEY,
    max_rows: MAX_ROWS,
    read: () => clone(PROSPECTIVE) || [],
    snapshot,
    capture_once: captureOnce,
    install_ledger_facade: installLedgerFacade,
    render,
    self_test: selfTest,
    paper_only: true,
    real_order: false,
    kraken_network: false,
    wallet: false,
    credentials: false,
    withdrawal: false,
    current_runtime_backfill: false,
    current_oracle_applied_to_past: false,
    future_outcomes_used_as_t0_input: false,
    live_ledger_merge_truth: true,
    exact_live_priority: true,
    recurring_timer: false,
    observer: false,
    fetch_added: false,
    websocket_added: false,
    storage_write: true,
    stable_evidence_host: HOST_ID,
    outside_checkpoint_subtree: true,
    g3: "PENDING",
    g9: "LOCKED"
  });

  globalThis.AgentCryptoStrategyAG3ProspectiveT0Capture = api;
  installLedgerFacade();

  if (typeof document !== "undefined") {
    const mount = () => { try { render(); } catch (_) {} };
    document.addEventListener("agent-crypto:evidence-data-changed", mount);
    window.addEventListener("pageshow", mount);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
      window.addEventListener("load", mount, { once: true });
    } else {
      mount();
    }
  }
})();
