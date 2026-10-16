/* Agent-Crypto @erith.IA — 40.6.195 G3 IMMUTABLE REPLAY DATASET
   Joins source-proven 24h market truth with certified t0 Strategy A decisions.
   Fail-closed: no certified t0 row, bad temporal coverage, symbol mismatch or
   unbounded join keeps the dataset NOT READY. No future outcome is an input.
   No network, timer, observer, storage write, wallet, credentials or real order. */
(() => {
  "use strict";

  const BUILD = "40.6.195";
  const OWNER = "strategy-a-g3-replay-dataset";
  const ROOT_ID = "strategyAG3ReplayDataset";
  const STYLE_ID = `${ROOT_ID}Style`;
  const SCHEMA = "agent_crypto_strategy_a_g3_replay_dataset_v1";

  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const safeCall = (fn, fallback = null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; } };
  const finite = value => value !== null && value !== undefined && typeof value !== "boolean" && !(typeof value === "string" && !value.trim()) && Number.isFinite(Number(value));
  const timeMs = value => {
    if (finite(value)) return Number(value);
    const ms = Date.parse(value || "");
    return Number.isFinite(ms) ? ms : null;
  };
  const upper = value => String(value ?? "").trim().toUpperCase();
  const plain = value => !!value && typeof value === "object" && !Array.isArray(value);

  function canonicalJson(value) {
    const normalize = v => {
      if (Array.isArray(v)) return v.map(normalize);
      if (plain(v)) return Object.keys(v).sort().reduce((out, key) => { out[key] = normalize(v[key]); return out; }, {});
      return v;
    };
    return JSON.stringify(normalize(value));
  }
  function fnv1a32(value) {
    let h = 0x811c9dc5;
    const s = String(value);
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  }

  function normalizeRows(rows) {
    return (Array.isArray(rows) ? rows : [])
      .map(row => Array.isArray(row) ? [timeMs(row[0]), finite(row[1]) ? Number(row[1]) : null] : [null, null])
      .filter(([t, p]) => t !== null && p !== null && p > 0)
      .sort((a, b) => a[0] - b[0]);
  }

  function joinDecisionToSeries(decisionRow, series, options = {}) {
    const t0 = decisionRow?.t0 || {};
    const symbol = upper(series?.symbol);
    const asset = upper(t0.asset);
    const marketMs = timeMs(t0.market_at);
    const rows = normalizeRows(series?.rows);
    const expectedCadenceMin = finite(series?.expected_cadence_min) && Number(series.expected_cadence_min) > 0 ? Number(series.expected_cadence_min) : null;
    const maxJoinLagMin = finite(options.max_join_lag_min)
      ? Number(options.max_join_lag_min)
      : (expectedCadenceMin !== null ? expectedCadenceMin * 1.5 : null);

    const reasons = [];
    if (decisionRow?.certified_t0_row !== true) reasons.push("T0_ROW_NOT_CERTIFIED");
    if (!symbol || !asset || symbol !== asset) reasons.push("ASSET_SERIES_MISMATCH");
    if (marketMs === null) reasons.push("T0_MARKET_TIME_MISSING");
    if (rows.length < 2) reasons.push("SERIES_ROWS_INSUFFICIENT");
    if (series?.temporal_coverage_certified !== true) reasons.push("SERIES_TEMPORAL_COVERAGE_NOT_CERTIFIED");
    if (expectedCadenceMin === null) reasons.push("SERIES_CADENCE_UNKNOWN");

    const firstMs = rows[0]?.[0] ?? null;
    const lastMs = rows.at(-1)?.[0] ?? null;
    if (marketMs !== null && firstMs !== null && lastMs !== null && (marketMs < firstMs || marketMs > lastMs)) reasons.push("T0_OUTSIDE_SERIES_WINDOW");

    let prior = null;
    if (marketMs !== null && rows.length) {
      for (const row of rows) {
        if (row[0] <= marketMs) prior = row;
        else break;
      }
    }
    const joinLagMin = prior && marketMs !== null ? (marketMs - prior[0]) / 60000 : null;
    if (!prior) reasons.push("NO_PRIOR_MARKET_POINT");
    if (prior && maxJoinLagMin !== null && joinLagMin > maxJoinLagMin + 1e-9) reasons.push("MARKET_POINT_TOO_OLD_FOR_T0");
    if (prior && maxJoinLagMin === null) reasons.push("JOIN_LAG_CONTRACT_UNKNOWN");

    const joined = reasons.length === 0;
    return {
      evidence_id: decisionRow?.evidence_id || null,
      source_cycle_id: decisionRow?.source_cycle_id || null,
      t0_fingerprint: decisionRow?.fingerprint || null,
      asset: asset || null,
      market_at: t0.market_at || null,
      available_at: t0.available_at || null,
      decided_at: t0.decided_at || null,
      decision: t0.decision || null,
      reason: t0.reason || null,
      strategy_build: t0.strategy_build || null,
      policy_build: t0.policy_build || null,
      inputs: clone(t0.inputs),
      market_reference: prior ? {
        at: new Date(prior[0]).toISOString(),
        price: prior[1],
        join_lag_min: Number(joinLagMin.toFixed(6)),
        source_owner: series?.owner || null,
        source_path: series?.owner_path || null,
        source_kind: series?.source_kind || null
      } : null,
      joined,
      state: joined ? "JOINED_T0_MARKET" : "REJECTED",
      rejection_reasons: reasons,
      future_outcomes_used_as_input: false
    };
  }

  function assemble(seriesSnapshot, t0Snapshot) {
    const series = clone(seriesSnapshot) || {};
    const t0 = clone(t0Snapshot) || {};
    const rows = normalizeRows(series.rows);
    const certifiedRows = Array.isArray(t0.rows) ? t0.rows.filter(row => row?.certified_t0_row === true) : [];
    const joinedRows = certifiedRows.map(row => joinDecisionToSeries(row, series));
    const accepted = joinedRows.filter(row => row.joined);
    const rejected = joinedRows.filter(row => !row.joined);

    const seriesReady =
      series.temporal_coverage_certified === true &&
      finite(series.expected_cadence_min) &&
      Number(series.expected_cadence_min) > 0 &&
      rows.length >= 2 &&
      upper(series.symbol) !== "";

    const blockers = [];
    if (!seriesReady) blockers.push("MARKET_SERIES_NOT_CERTIFIED_FOR_REPLAY");
    if (!certifiedRows.length) blockers.push("NO_CERTIFIED_T0_DECISION_ROW");
    if (certifiedRows.length && !accepted.length) blockers.push("NO_T0_ROW_CAN_BE_JOINED_TO_CERTIFIED_MARKET_SERIES");
    if (rejected.length) blockers.push(`REJECTED_T0_ROWS:${rejected.length}`);

    const ready = seriesReady && accepted.length > 0;
    const immutablePayload = {
      schema: SCHEMA,
      market: {
        build: series.build || null,
        owner: series.owner || null,
        owner_path: series.owner_path || null,
        source_kind: series.source_kind || null,
        symbol: series.symbol || null,
        asset_id: series.asset_id || null,
        source_period_days: series.source_period_days ?? null,
        expected_cadence_min: series.expected_cadence_min ?? null,
        first_at: series.first_at || null,
        last_at: series.last_at || null,
        points: rows.length,
        rows
      },
      decisions: accepted.map(row => ({
        evidence_id: row.evidence_id,
        source_cycle_id: row.source_cycle_id,
        t0_fingerprint: row.t0_fingerprint,
        asset: row.asset,
        market_at: row.market_at,
        available_at: row.available_at,
        decided_at: row.decided_at,
        decision: row.decision,
        reason: row.reason,
        strategy_build: row.strategy_build,
        policy_build: row.policy_build,
        inputs: clone(row.inputs),
        market_reference: clone(row.market_reference)
      }))
    };
    const contentId = `fnv1a32:${fnv1a32(canonicalJson(immutablePayload))}`;

    return {
      schema: `${SCHEMA}_snapshot`,
      build: BUILD,
      owner: OWNER,
      generated_at: new Date().toISOString(),
      state: ready ? "REPLAY_INPUT_READY" : "NOT_READY",
      replay_input_ready: ready,
      dataset_id: `G3-DATASET-${contentId.split(":")[1]}`,
      content_fingerprint: contentId,
      fingerprint_algorithm: "FNV-1A-32_NON_CRYPTO_CONTENT_ID",
      immutable_snapshot_semantics: true,
      series_ready: seriesReady,
      market: immutablePayload.market,
      t0_source_build: t0.build || null,
      certified_t0_rows_seen: certifiedRows.length,
      joined_t0_rows: accepted.length,
      rejected_t0_rows: rejected.length,
      decisions: immutablePayload.decisions,
      rejected: rejected.map(row => ({
        evidence_id: row.evidence_id,
        source_cycle_id: row.source_cycle_id,
        asset: row.asset,
        market_at: row.market_at,
        rejection_reasons: row.rejection_reasons
      })),
      blockers,
      future_outcomes_used_as_input: false,
      current_oracle_applied_to_past: false,
      current_runtime_backfill: false,
      result_fields_present_in_decision_inputs: false,
      first_ready_dataset_proves_wiring_only: true,
      economic_backtest_complete: false,
      gate3_promoted: false,
      g3_state: "PENDING",
      paper_only: true,
      real_order: false,
      network: false,
      storage_write: false,
      recurring_timer: false,
      observer: false
    };
  }

  function snapshot() {
    const series = safeCall(globalThis.AgentCryptoMarketSeriesTruth?.snapshot, null);
    const t0 = safeCall(globalThis.AgentCryptoStrategyAG3T0DecisionProof?.snapshot, null);
    return assemble(series, t0);
  }

  function selfTest() {
    const base = Date.UTC(2026, 8, 16, 0, 0, 0);
    const rows = [];
    for (let i = 0; i <= 288; i += 1) rows.push([base + i * 5 * 60000, 65000 + i]);
    const series = {
      build: "TEST-SERIES",
      owner: "TEST",
      owner_path: "test.rows",
      source_kind: "SYNTHETIC_TEST",
      symbol: "BTC",
      source_period_days: 1,
      expected_cadence_min: 5,
      first_at: new Date(rows[0][0]).toISOString(),
      last_at: new Date(rows.at(-1)[0]).toISOString(),
      temporal_coverage_certified: true,
      rows
    };
    const decision = {
      certified_t0_row: true,
      evidence_id: "T0-A-CYCLE-TEST-1",
      source_cycle_id: "A-CYCLE-TEST-1",
      fingerprint: "fnv1a32:test",
      t0: {
        asset: "BTC",
        market_at: new Date(base + 60 * 60000).toISOString(),
        available_at: new Date(base + 60 * 60000 + 1000).toISOString(),
        decided_at: new Date(base + 60 * 60000 + 2000).toISOString(),
        decision: "NO_TRADE",
        reason: "DIRECTION",
        strategy_build: "STRAT-1",
        policy_build: "POLICY-1",
        inputs: { regime: "MIXTE", direction_score: -20, confidence: 94, btc24_pct: -2.1, reentry_fresh: true, expected_move_pct: 0.5, required_move_pct: 0.8, duplicate: false, risk_decision: "ACCEPT", authorized_notional_eur: 0 }
      }
    };
    const ready = assemble(series, { build: "TEST-T0", rows: [decision] });
    const missingT0 = assemble(series, { build: "TEST-T0", rows: [] });
    const badCoverage = assemble({ ...series, temporal_coverage_certified: false }, { build: "TEST-T0", rows: [decision] });
    const outside = assemble(series, { build: "TEST-T0", rows: [{ ...decision, t0: { ...decision.t0, market_at: new Date(base - 60000).toISOString() } }] });
    const mismatch = assemble(series, { build: "TEST-T0", rows: [{ ...decision, t0: { ...decision.t0, asset: "ETH" } }] });

    const pass =
      ready.replay_input_ready === true &&
      ready.joined_t0_rows === 1 &&
      missingT0.replay_input_ready === false &&
      badCoverage.replay_input_ready === false &&
      outside.replay_input_ready === false &&
      mismatch.replay_input_ready === false &&
      ready.future_outcomes_used_as_input === false &&
      ready.g3_state === "PENDING";

    return {
      schema: "agent_crypto_strategy_a_g3_replay_dataset_self_test_v1",
      build: BUILD,
      pass,
      checks: {
        certified_series_plus_t0_can_form_replay_input: ready.replay_input_ready === true,
        no_t0_is_not_ready: missingT0.replay_input_ready === false,
        unproven_temporal_coverage_is_not_ready: badCoverage.replay_input_ready === false,
        t0_outside_series_is_rejected: outside.replay_input_ready === false,
        asset_mismatch_is_rejected: mismatch.replay_input_ready === false,
        future_outcomes_never_inputs: ready.future_outcomes_used_as_input === false,
        dataset_never_promotes_gate3: ready.g3_state === "PENDING"
      }
    };
  }

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function ensureStyle() {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `#${ROOT_ID}{margin-top:9px;padding:9px;border:1px solid rgba(110,188,255,.23);border-radius:9px;background:rgba(7,17,35,.30)}#${ROOT_ID} .g3ds-head{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}#${ROOT_ID} .g3ds-title{font-size:8px;font-weight:950;letter-spacing:.08em;color:#9dccff;text-transform:uppercase}#${ROOT_ID} .g3ds-badge{font-size:8px;font-weight:950;color:#ffe08a}#${ROOT_ID} .g3ds-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:7px}#${ROOT_ID} .g3ds-k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px;background:rgba(0,0,0,.12)}#${ROOT_ID} .g3ds-k span{display:block;font-size:7px;color:#7990a6;text-transform:uppercase}#${ROOT_ID} .g3ds-k b{display:block;margin-top:3px;font-size:9px;color:#edf7ff;overflow-wrap:anywhere}#${ROOT_ID} .g3ds-note{margin-top:7px;font-size:8px;line-height:1.4;color:#91a9bb}#${ROOT_ID} .g3ds-block{margin-top:6px;padding:6px 7px;border-left:3px solid #ffd45c;background:rgba(255,199,56,.05);font-size:8px;color:#cfbf83;overflow-wrap:anywhere}@media(max-width:900px){#${ROOT_ID} .g3ds-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
    document.head.appendChild(style);
  }

  function render() {
    if (typeof document === "undefined") return false;
    ensureStyle();
    const dossier = document.getElementById("strategyADossier");
    if (!dossier) return false;
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = ROOT_ID;
      const anchor = document.getElementById("strategyAG3T0DecisionProof") || dossier.querySelector(".sad-g3") || dossier.lastElementChild;
      if (anchor?.parentElement === dossier) anchor.insertAdjacentElement("afterend", root);
      else dossier.appendChild(root);
    }
    const data = snapshot();
    const blockers = data.blockers?.length ? data.blockers.join(" · ") : "Dataset t0 + marché raccordé. Le replay économique reste à exécuter.";
    root.dataset.build = BUILD;
    root.dataset.g3 = "PENDING";
    root.innerHTML = `<div class="g3ds-head"><div><div class="g3ds-title">G3 · IMMUTABLE REPLAY DATASET · ${BUILD}</div><div class="g3ds-note">Série certifiée + décisions t0 certifiées · jointure temporelle stricte · aucun résultat futur en entrée.</div></div><div class="g3ds-badge">${escapeHtml(data.state)} · G3 PENDING</div></div><div class="g3ds-grid"><div class="g3ds-k"><span>Série</span><b>${data.series_ready ? "QUALITY PROVEN" : "NON PRÊTE"}</b></div><div class="g3ds-k"><span>T0 certifiées</span><b>${data.certified_t0_rows_seen}</b></div><div class="g3ds-k"><span>Jointes</span><b>${data.joined_t0_rows}</b></div><div class="g3ds-k"><span>Rejetées</span><b>${data.rejected_t0_rows}</b></div><div class="g3ds-k"><span>Dataset</span><b>${escapeHtml(data.dataset_id)}</b></div><div class="g3ds-k"><span>Actif</span><b>${escapeHtml(data.market?.symbol || "—")}</b></div><div class="g3ds-k"><span>Points</span><b>${data.market?.points ?? "—"}</b></div><div class="g3ds-k"><span>Cadence</span><b>${data.market?.expected_cadence_min ?? "—"} min</b></div></div><div class="g3ds-block">${escapeHtml(blockers)}</div><div class="g3ds-note">PAPER ONLY · READY = entrée de replay prête, pas Gate 3 PASS · le backtest économique et l'évaluation des Gates restent séparés.</div>`;
    return true;
  }

  function exportJson() {
    const payload = snapshot();
    if (typeof document !== "undefined" && typeof Blob !== "undefined" && typeof URL !== "undefined") {
      const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "STRATEGY_A_G3_REPLAY_DATASET.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    return clone(payload);
  }

  globalThis.AgentCryptoStrategyAG3ReplayDataset = Object.freeze({
    build: BUILD,
    schema: SCHEMA,
    owner: OWNER,
    assemble,
    join_decision_to_series: joinDecisionToSeries,
    snapshot,
    self_test: selfTest,
    render,
    export_json: exportJson,
    immutable_snapshot_semantics: true,
    future_outcomes_used_as_input: false,
    current_oracle_applied_to_past: false,
    gate3_promoted: false,
    g3: "PENDING",
    g9: "LOCKED",
    paper_only: true,
    real_order: false,
    network: false,
    storage_write: false,
    recurring_timer: false,
    observer: false
  });

  if (typeof document !== "undefined") render();
})();
