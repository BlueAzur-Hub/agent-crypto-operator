/* Agent-Crypto @erith.IA — 40.6.200 G3 CASCADE CHECKPOINT TRUTH
   Read-only checkpoint over the existing G3 evidence chain.
   It does not mutate Strategy A, thresholds, ledger, storage or market data.
   PAPER ONLY · G3 PENDING · G9 LOCKED. */
(() => {
  "use strict";

  const BUILD = "40.6.200";
  const ROOT_ID = "strategyAG3CascadeCheckpoint";
  const DOSSIER_ID = "strategyADossier";
  const DAY_MS = 86400000;

  const finite = v => {
    if (v === null || v === undefined || typeof v === "boolean") return null;
    if (typeof v === "string" && !v.trim()) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const parseTs = v => {
    const n = typeof v === "number" ? v : Date.parse(String(v ?? ""));
    return Number.isFinite(n) ? n : null;
  };

  const first = (o, paths) => {
    for (const p of paths) {
      let v = o;
      for (const k of p.split(".")) {
        v = v?.[k];
        if (v === undefined || v === null) break;
      }
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return null;
  };

  const median = a => {
    const b = a.filter(Number.isFinite).sort((x, y) => x - y);
    if (!b.length) return null;
    const m = Math.floor(b.length / 2);
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
  };

  function temporal(rawOverride = undefined, canonicalOverride = undefined) {
    let raw = rawOverride;
    if (rawOverride === undefined) {
      try { raw = globalThis.AgentCryptoMarketSeriesTruth?.snapshot?.() || null; } catch (_) { raw = null; }
    }

    let canonical = canonicalOverride;
    if (canonicalOverride === undefined) {
      try { canonical = globalThis.AgentCryptoStrategyAG3StructuredDataTruth?.snapshot?.()?.market_series || null; } catch (_) { canonical = null; }
    }

    const blockers = [];
    const fail = extra => Object.freeze({
      certified: false,
      status: "NOT_CERTIFIED",
      blockers: Object.freeze([...new Set([...blockers, ...(extra || [])])]),
      rows: Object.freeze([]),
      source_points: 0,
      window_points: 0,
      asset: String(raw?.symbol || raw?.asset_id || "BTC").toUpperCase(),
      first_ms: null,
      last_ms: null,
      first_at: null,
      last_at: null,
      observed_cadence_min: null,
      expected_cadence_min: finite(canonical?.expected_cadence_min),
      window_span_min: null,
      max_gap_min: null,
      duplicate_timestamps: finite(canonical?.duplicate_timestamps),
      conflicting_duplicate_timestamps: finite(canonical?.conflicting_duplicate_timestamps),
      canonical_quality_state: canonical?.quality_state || null,
      refusal_sticky: true
    });

    if (!raw || raw.available === false) return fail(["SOURCE_UNAVAILABLE"]);
    if (!canonical || canonical.structured_owner_available === false) blockers.push("CANONICAL_TEMPORAL_OWNER_UNAVAILABLE");

    const sourcePeriodDays = finite(canonical?.source_period_days ?? raw?.source_period_days);
    const sourcePeriodProven = canonical?.source_period_proven === true || raw?.source_period_proven === true;
    if (!sourcePeriodProven || sourcePeriodDays !== 1) blockers.push("SOURCE_24H_NOT_PROVEN");

    const expectedCadence = finite(canonical?.expected_cadence_min);
    if (!(expectedCadence > 0)) blockers.push("CADENCE_CONTRACT_UNKNOWN");

    const canonicalQuality = String(canonical?.quality_state || "");
    if (canonical?.temporal_coverage_certified !== true) {
      if (canonicalQuality === "CONFLICTING_DUPLICATE_TIMESTAMP") blockers.push("CONFLICTING_DUPLICATE_TIMESTAMP");
      else if (canonicalQuality === "DUPLICATE_TIMESTAMP") blockers.push("DUPLICATE_TIMESTAMP");
      else if (canonicalQuality === "CADENCE_CONTRACT_UNKNOWN") blockers.push("CADENCE_CONTRACT_UNKNOWN");
      else blockers.push("CANONICAL_TEMPORAL_OWNER_NOT_CERTIFIED");
    }

    const norm = (Array.isArray(raw.rows) ? raw.rows : [])
      .map(x => Array.isArray(x)
        ? { t: parseTs(x[0]), p: finite(x[1]) }
        : {
            t: parseTs(x?.t ?? x?.ts ?? x?.time ?? x?.timestamp ?? x?.at),
            p: finite(x?.p ?? x?.price ?? x?.value ?? x?.close)
          })
      .filter(r => r.t !== null && r.p !== null && r.p > 0)
      .sort((a, b) => a.t - b.t);

    if (norm.length < 2) return fail(["INSUFFICIENT_VALID_ROWS"]);

    const grouped = new Map();
    for (const row of norm) {
      const bucket = grouped.get(row.t) || [];
      bucket.push(row.p);
      grouped.set(row.t, bucket);
    }
    let duplicateCount = 0;
    const conflictingTimes = [];
    for (const [t, prices] of grouped) {
      if (prices.length <= 1) continue;
      duplicateCount += prices.length - 1;
      if (new Set(prices.map(value => Number(value).toPrecision(15))).size > 1) conflictingTimes.push(t);
    }
    if (duplicateCount > 0) blockers.push("DUPLICATE_TIMESTAMP");
    if (conflictingTimes.length > 0) blockers.push("CONFLICTING_DUPLICATE_TIMESTAMP");

    const uniq = [];
    for (const row of norm) {
      if (!uniq.length || uniq.at(-1).t !== row.t) uniq.push(row);
    }
    if (uniq.length < 2) return fail(["INSUFFICIENT_VALID_ROWS"]);

    const diffs = [];
    for (let i = 1; i < uniq.length; i++) diffs.push((uniq[i].t - uniq[i - 1].t) / 60000);
    const observedCadence = median(diffs);

    const end = uniq.at(-1).t;
    const target = end - DAY_MS;
    const tolerance = expectedCadence > 0 ? Math.max(1000, expectedCadence * 4800) : 1000;

    let idx = -1;
    let best = Infinity;
    uniq.forEach((r, i) => {
      const d = Math.abs(r.t - target);
      if (d < best) { best = d; idx = i; }
    });

    const rows = idx >= 0 ? uniq.slice(idx) : [];
    const span = rows.length > 1 ? (rows.at(-1).t - rows[0].t) / 60000 : null;
    const windowDiffs = [];
    for (let i = 1; i < rows.length; i++) windowDiffs.push((rows[i].t - rows[i - 1].t) / 60000);
    const maxGap = windowDiffs.length ? Math.max(...windowDiffs) : null;
    const expectedRows = expectedCadence > 0 ? Math.round(1440 / expectedCadence) + 1 : null;

    if (!(observedCadence > 0)) blockers.push("OBSERVED_CADENCE_UNKNOWN");
    if (best > tolerance) blockers.push("NO_EXACT_24H_BOUNDARY");
    if (span === null || expectedCadence <= 0 || Math.abs(span - 1440) > Math.max(.25, expectedCadence * .08)) blockers.push("SPAN_NOT_24H");
    if (expectedRows !== null && rows.length !== expectedRows) blockers.push("ROW_COUNT_MISMATCH");
    if (expectedCadence > 0 && windowDiffs.some(d => Math.abs(d - expectedCadence) > Math.max(.25, expectedCadence * .25))) blockers.push("IRREGULAR_CADENCE");
    if (expectedCadence > 0 && maxGap > expectedCadence * 1.25) blockers.push("UNEXPECTED_GAP");

    return Object.freeze({
      certified: blockers.length === 0,
      status: blockers.length ? "NOT_CERTIFIED" : "CERTIFIED",
      asset: String(raw.symbol || raw.asset_id || "BTC").toUpperCase(),
      rows: Object.freeze(rows.map(r => Object.freeze([r.t, r.p]))),
      source_points: norm.length,
      window_points: rows.length,
      observed_cadence_min: observedCadence,
      expected_cadence_min: expectedCadence,
      window_span_min: span,
      max_gap_min: maxGap,
      duplicate_timestamps: duplicateCount,
      conflicting_duplicate_timestamps: conflictingTimes.length,
      first_ms: rows[0]?.t ?? null,
      last_ms: rows.at(-1)?.t ?? null,
      first_at: rows.length ? new Date(rows[0].t).toISOString() : null,
      last_at: rows.length ? new Date(rows.at(-1).t).toISOString() : null,
      canonical_quality_state: canonicalQuality || null,
      canonical_temporal_certified: canonical?.temporal_coverage_certified === true,
      refusal_sticky: true,
      blockers: Object.freeze([...new Set(blockers)])
    });
  }

  function ledgerRows() {
    try {
      const v = globalThis.AgentCryptoStrategyAExperimentLedger?.read?.();
      if (Array.isArray(v)) return v;
      if (Array.isArray(v?.rows)) return v.rows;
      if (Array.isArray(v?.entries)) return v.entries;
    } catch (_) {}
    return [];
  }

  function normalizeT0(r) {
    const id = first(r, ["cycle_id", "decision_id", "proposal_id", "id", "trace.cycle_id", "trace.id"]);
    const asset = String(first(r, ["asset", "symbol", "market.symbol", "inputs.asset", "inputs.symbol", "snapshot.symbol"]) || "").toUpperCase();
    const decision = String(first(r, ["decision", "verdict", "action", "proposal.decision", "result.decision", "trace.decision"]) || "").toUpperCase();
    const marketAt = parseTs(first(r, ["market_at", "market_time", "market.timestamp", "inputs.market_at", "snapshot.market_at"]));
    const decisionAt = parseTs(first(r, ["decision_at", "decided_at", "decision.timestamp", "trace.decision_at"]));
    const availableAt = parseTs(first(r, ["available_at", "recorded_at", "trace.available_at"]));
    const strategyBuild = first(r, ["strategy_build", "strategy_version", "strategy.build", "trace.strategy_build"]);
    const policyBuild = first(r, ["policy_build", "policy_version", "policy.build", "trace.policy_build"]);
    const direction = finite(first(r, ["direction", "direction_score", "inputs.direction", "inputs.direction_score", "signal.direction"]));
    const confidence = finite(first(r, ["confidence", "confidence_score", "inputs.confidence", "inputs.confidence_score", "oracle.confidence"]));
    const btc24 = finite(first(r, ["btc_24h_pct", "btc24h", "inputs.btc_24h_pct", "market.btc_24h_pct"]));
    const expectedMove = finite(first(r, ["expected_move_pct", "oracle_amplitude", "inputs.expected_move_pct", "inputs.oracle_amplitude"]));
    const dataReady = first(r, ["data_ready", "inputs.data_ready", "trace.data_ready"]);
    const costGate = finite(first(r, ["cost_gate_pct", "cost_gate_threshold_pct", "inputs.cost_gate_pct", "inputs.cost_gate_threshold_pct"]));

    const missing = [];
    if (!id) missing.push("id");
    if (!asset) missing.push("asset");
    if (!decision) missing.push("decision");
    if (marketAt === null) missing.push("market_at");
    if (decisionAt === null) missing.push("decision_at");
    if (availableAt === null) missing.push("available_at");
    if (!strategyBuild) missing.push("strategy_build");
    if (!policyBuild) missing.push("policy_build");
    if (direction === null) missing.push("direction");
    if (confidence === null) missing.push("confidence");
    if (btc24 === null) missing.push("btc_24h_pct");
    if (expectedMove === null) missing.push("expected_move_pct");
    if (dataReady !== true && dataReady !== false) missing.push("data_ready");
    if (costGate === null) missing.push("cost_gate_pct");
    if (marketAt !== null && decisionAt !== null && marketAt > decisionAt) missing.push("market_after_decision");
    if (decisionAt !== null && availableAt !== null && decisionAt > availableAt) missing.push("decision_after_available");

    return Object.freeze({
      id: id ? String(id) : null,
      asset,
      decision,
      market_at: marketAt,
      decision_at: decisionAt,
      available_at: availableAt,
      strategy_build: strategyBuild ? String(strategyBuild) : null,
      policy_build: policyBuild ? String(policyBuild) : null,
      direction,
      confidence,
      btc_24h_pct: btc24,
      expected_move_pct: expectedMove,
      data_ready: dataReady,
      cost_gate_pct: costGate,
      certified: missing.length === 0,
      missing: Object.freeze(missing)
    });
  }

  function t0Audit() {
    const rows = ledgerRows();
    const normalized = rows.map(normalizeT0);
    const certified = normalized.filter(x => x.certified);
    const missing = {};

    for (const n of normalized) {
      for (const k of n.missing) missing[k] = (missing[k] || 0) + 1;
    }

    return Object.freeze({
      status: certified.length ? "TRACEABLE_T0_AVAILABLE" : "WAITING_T0_CAPTURE",
      ledger_rows: rows.length,
      traceable_rows: normalized.filter(x => !!x.id && x.decision_at !== null).length,
      certified_rows: certified.length,
      certified: Object.freeze(certified),
      missing_field_counts: Object.freeze(missing),
      current_runtime_backfill: false,
      current_oracle_applied_to_past: false,
      future_outcomes_used: false
    });
  }

  function datasetFrom(t = t0Audit(), s = temporal()) {
    const blockers = [];
    if (!s.certified) {
      blockers.push("TEMPORAL_WINDOW_NOT_CERTIFIED");
      for (const blocker of Array.isArray(s?.blockers) ? s.blockers : []) blockers.push(`TEMPORAL:${blocker}`);
    }
    if (!t.certified_rows) blockers.push("NO_CERTIFIED_T0_DECISION");

    const joined = [];
    if (s.certified && t.certified_rows) {
      for (const d of t.certified) {
        if (d.asset && s.asset && d.asset !== s.asset) continue;
        if (d.market_at < s.first_ms || d.market_at > s.last_ms) continue;
        joined.push(Object.freeze({
          decision: Object.freeze({ ...d }),
          market_window: Object.freeze({
            asset: s.asset,
            first_at: s.first_at,
            last_at: s.last_at,
            cadence_min: s.expected_cadence_min,
            points: s.window_points
          }),
          future_outcome: null,
          economic_result: null
        }));
      }
    }

    if (t.certified_rows && joined.length === 0) blockers.push("NO_T0_DECISION_INSIDE_CERTIFIED_WINDOW");
    const ready = blockers.length === 0 && joined.length > 0;

    return Object.freeze({
      schema: "agent_crypto_g3_replay_dataset_certification_v1",
      build: BUILD,
      status: ready ? "READY_FOR_DECISION_REPLAY" : "NOT_READY",
      ready,
      joined: Object.freeze(joined),
      joined_count: joined.length,
      blockers: Object.freeze(blockers),
      future_outcomes_attached: false,
      outcome_labels: "NOT_CERTIFIED",
      economic_backtest: false,
      execution_cost_model: false,
      lookahead: false,
      paper_only: true,
      g3: "PENDING",
      g9: "LOCKED"
    });
  }

  function checkpointTruth(temporalState, t0, dataset) {
    let blocker = "READY_FOR_DECISION_REPLAY";
    let nextOwner = "POST_HORIZON_OUTCOME_OWNER";
    let nextAction = "BEGIN_POST_HORIZON_OUTCOME_CERTIFICATION";

    if (!temporalState.certified) {
      blocker = "TEMPORAL_WINDOW_NOT_CERTIFIED";
      nextOwner = "AgentCryptoMarketSeriesTruth";
      nextAction = "REPAIR_TEMPORAL_OWNER_ONLY";
    } else if (!t0.certified_rows) {
      blocker = "NO_CERTIFIED_T0_DECISION";
      nextOwner = "AgentCryptoStrategyAExperimentLedger";
      nextAction = "CAPTURE_NEW_PROSPECTIVE_T0_ONLY";
    } else if (!dataset.joined_count) {
      blocker = "NO_T0_DECISION_INSIDE_CERTIFIED_WINDOW";
      nextOwner = "WAIT_OR_TIMESTAMP_PROOF";
      nextAction = "WAIT_NATURAL_OVERLAP_OR_PROVE_TIMESTAMP_BUG";
    }

    return Object.freeze({
      schema: "agent_crypto_g3_checkpoint_truth_v1",
      build: BUILD,
      temporal_contract: temporalState.status,
      temporal_blockers: temporalState.blockers,
      market_rows: temporalState.source_points,
      window_rows: temporalState.window_points,
      ledger_rows: t0.ledger_rows,
      traceable_t0: t0.traceable_rows,
      certified_t0: t0.certified_rows,
      joined_rows: dataset.joined_count,
      outcome_labels: dataset.outcome_labels,
      replay_dataset: dataset.status,
      blocker,
      next_owner: nextOwner,
      next_action: nextAction,
      paper_only: true,
      g3: "PENDING",
      g9: "LOCKED"
    });
  }

  function snapshot() {
    const temporalState = temporal();
    const t0 = t0Audit();
    const dataset = datasetFrom(t0, temporalState);
    const checkpoint = checkpointTruth(temporalState, t0, dataset);

    return Object.freeze({
      schema: "agent_crypto_g3_cascade_checkpoint_v4",
      build: BUILD,
      stage: "CASCADE_CHECKPOINT_TRUTH",
      temporal: temporalState,
      t0,
      dataset,
      checkpoint,
      paper_only: true,
      g3: "PENDING",
      g9: "LOCKED",
      real_order: false,
      profitability_claim: false
    });
  }

  function self_test() {
    const full = normalizeT0({
      cycle_id: "A-CYCLE-X",
      asset: "BTC",
      decision: "NO_TRADE",
      market_at: "2026-09-16T10:00:00Z",
      decision_at: "2026-09-16T10:00:01Z",
      available_at: "2026-09-16T10:00:02Z",
      strategy_build: "40.6.56",
      policy_build: "40.6.56",
      direction: -16,
      confidence: 94,
      btc_24h_pct: -.8,
      expected_move_pct: .44,
      data_ready: true,
      cost_gate_pct: .8
    });
    const incomplete = normalizeT0({ cycle_id: "X" });
    const missingNumeric = normalizeT0({
      cycle_id: "MISSING-NUMERIC", asset: "BTC", decision: "NO_TRADE",
      market_at: "2026-09-16T10:00:00Z", decision_at: "2026-09-16T10:00:01Z", available_at: "2026-09-16T10:00:02Z",
      strategy_build: "40.6.56", policy_build: "40.6.56",
      confidence: 94, btc_24h_pct: -.8, expected_move_pct: .44, data_ready: true, cost_gate_pct: .8
    });
    const base = Date.UTC(2026,8,16,0,0,0), goodRows = [];
    for (let i=0;i<=288;i++) goodRows.push([base+i*5*60000,65000+i]);
    const rawGood = {available:true,symbol:"BTC",asset_id:"bitcoin",source_period_days:1,source_period_proven:true,rows:goodRows};
    const cadenceUnknown = temporal(rawGood,{structured_owner_available:true,source_period_days:1,source_period_proven:true,expected_cadence_min:null,temporal_coverage_certified:false,quality_state:"CADENCE_CONTRACT_UNKNOWN"});
    const conflictRows = goodRows.slice(); conflictRows.splice(10,0,[base+50*60000,99999]);
    const conflicting = temporal({...rawGood,rows:conflictRows},{structured_owner_available:true,source_period_days:1,source_period_proven:true,expected_cadence_min:5,temporal_coverage_certified:false,quality_state:"CONFLICTING_DUPLICATE_TIMESTAMP",duplicate_timestamps:1,conflicting_duplicate_timestamps:1});

    const truthTemporal = checkpointTruth(
      { certified: false, status: "NOT_CERTIFIED", blockers: ["SPAN_NOT_24H"], source_points: 482, window_points: 0 },
      { ledger_rows: 15, traceable_rows: 0, certified_rows: 0 },
      { joined_count: 0, outcome_labels: "NOT_CERTIFIED", status: "NOT_READY" }
    );
    const truthT0 = checkpointTruth(
      { certified: true, status: "CERTIFIED", blockers: [], source_points: 289, window_points: 289 },
      { ledger_rows: 15, traceable_rows: 15, certified_rows: 0 },
      { joined_count: 0, outcome_labels: "NOT_CERTIFIED", status: "NOT_READY" }
    );
    const truthReady = checkpointTruth(
      { certified: true, status: "CERTIFIED", blockers: [], source_points: 289, window_points: 289 },
      { ledger_rows: 15, traceable_rows: 15, certified_rows: 1 },
      { joined_count: 1, outcome_labels: "NOT_CERTIFIED", status: "READY_FOR_DECISION_REPLAY" }
    );

    const checks = Object.freeze({
      complete_no_trade_certifies: full.certified === true && full.decision === "NO_TRADE",
      incomplete_fails_closed: incomplete.certified === false,
      missing_numeric_stays_missing: missingNumeric.certified === false && missingNumeric.direction === null && missingNumeric.missing.includes("direction"),
      cadence_contract_unknown_rejected: cadenceUnknown.certified === false && cadenceUnknown.blockers.includes("CADENCE_CONTRACT_UNKNOWN"),
      conflicting_duplicate_rejected: conflicting.certified === false && conflicting.blockers.includes("CONFLICTING_DUPLICATE_TIMESTAMP"),
      temporal_blocker_precedence: truthTemporal.blocker === "TEMPORAL_WINDOW_NOT_CERTIFIED",
      t0_blocker_after_temporal: truthT0.blocker === "NO_CERTIFIED_T0_DECISION",
      ready_is_not_gate_pass: truthReady.blocker === "READY_FOR_DECISION_REPLAY" && truthReady.g3 === "PENDING"
    });

    return Object.freeze({ build: BUILD, pass: Object.values(checks).every(Boolean), checks });
  }

  function render() {
    const d = snapshot();
    if (typeof document === "undefined") return d;

    const dossier = document.getElementById(DOSSIER_ID);
    if (!dossier) return d;

    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = ROOT_ID;
      dossier.appendChild(root);
    }

    const e = x => String(x ?? "INCONNU").replace(/[&<>]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
    const c = d.checkpoint;
    const tone = c.blocker === "READY_FOR_DECISION_REPLAY" ? "#9dffb8" : "#ffd36e";

    root.style.cssText = "margin-top:9px;padding:9px;border:1px solid rgba(120,210,255,.25);border-radius:8px;background:rgba(6,24,34,.30)";
    root.innerHTML = `
      <div style="font-size:8px;font-weight:950;letter-spacing:.08em;color:#85e8ff">G3 · CASCADE CHECKPOINT TRUTH · ${BUILD}</div>
      <div style="font-size:8px;color:#9bb8c3;margin-top:3px">Lecture seule · fenêtre 24H + ledger T0 + jointure replay · aucune promotion de Gate.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(105px,1fr));gap:5px;margin-top:7px">
        <div><small>24H CONTRACT</small><b style="display:block">${e(c.temporal_contract)}</b></div>
        <div><small>MARKET ROWS</small><b style="display:block">${e(c.market_rows)}</b></div>
        <div><small>WINDOW ROWS</small><b style="display:block">${e(c.window_rows)}</b></div>
        <div><small>LEDGER</small><b style="display:block">${e(c.ledger_rows)}</b></div>
        <div><small>T0 TRACEABLE</small><b style="display:block">${e(c.traceable_t0)}</b></div>
        <div><small>T0 CERT.</small><b style="display:block">${e(c.certified_t0)}</b></div>
        <div><small>JOINTES</small><b style="display:block">${e(c.joined_rows)}</b></div>
        <div><small>OUTCOME LABELS</small><b style="display:block">${e(c.outcome_labels)}</b></div>
        <div><small>REPLAY DATASET</small><b style="display:block">${e(c.replay_dataset)}</b></div>
        <div><small>G3</small><b style="display:block">PENDING</b></div>
      </div>
      <div style="margin-top:7px;padding-top:6px;border-top:1px solid rgba(120,210,255,.16);font-size:8px;color:${tone}"><b>BLOCKER · ${e(c.blocker)}</b></div>
      <div style="margin-top:3px;font-size:8px;color:#9bb8c3">OWNER · ${e(c.next_owner)} · ACTION · ${e(c.next_action)}</div>
      <div style="margin-top:3px;font-size:8px;color:#7895a0">${e(c.temporal_blockers?.join(" · ") || "Temporal blockers: none")}</div>`;

    return d;
  }

  globalThis.AgentCryptoStrategyAG3CascadeCheckpoint = Object.freeze({
    build: BUILD,
    stage: "CASCADE_CHECKPOINT_TRUTH",
    snapshot,
    render,
    self_test,
    normalize_t0: normalizeT0,
    dataset_from: datasetFrom,
    checkpoint_truth: () => snapshot().checkpoint,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    network: false,
    real_order: false,
    paper_only: true,
    g3: "PENDING",
    g9: "LOCKED"
  });
})();
