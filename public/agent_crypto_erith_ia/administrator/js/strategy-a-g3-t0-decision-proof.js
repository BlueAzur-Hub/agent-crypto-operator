/* Agent-Crypto @erith.IA — 40.6.194 G3 T0 DECISION PROOF
   Read-only prospective bridge from the existing Strategy A Experiment Ledger
   to traceable decision-at-t0 evidence. It never invents missing historical
   inputs, never mixes future outcomes into t0, and never promotes Gate 3.
   No network, timer, observer, storage write, wallet, credentials or real order. */
(() => {
  "use strict";

  const BUILD = "40.6.194";
  const OWNER = "strategy-a-g3-t0-decision-proof";
  const ROOT_ID = "strategyAG3T0DecisionProof";
  const STYLE_ID = `${ROOT_ID}Style`;
  const SCHEMA = "agent_crypto_strategy_a_g3_t0_decision_proof_v1";
  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const safeCall = (fn, fallback = null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; } };
  const plainObject = value => !!value && typeof value === "object" && !Array.isArray(value);
  const text = value => value === null || value === undefined ? "" : String(value).trim();
  const strictNumber = value => {
    if (value === null || value === undefined || typeof value === "boolean") return null;
    if (typeof value === "string" && !value.trim()) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
  const parseTime = value => {
    const raw = text(value);
    if (!raw) return null;
    const ms = Date.parse(raw);
    return Number.isFinite(ms) ? { iso: new Date(ms).toISOString(), ms } : null;
  };
  const readPath = (obj, path) => {
    let cur = obj;
    for (const key of String(path).split(".")) {
      if (!plainObject(cur) && !Array.isArray(cur)) return undefined;
      cur = cur?.[key];
    }
    return cur;
  };
  const first = (obj, paths, accept = value => value !== undefined && value !== null) => {
    for (const path of paths) {
      const value = readPath(obj, path);
      if (accept(value)) return { path, value };
    }
    return { path: null, value: null };
  };
  const firstText = (obj, paths) => first(obj, paths, value => text(value) !== "");
  const firstNumber = (obj, paths) => first(obj, paths, value => strictNumber(value) !== null);
  const firstTime = (obj, paths) => {
    for (const path of paths) {
      const parsed = parseTime(readPath(obj, path));
      if (parsed) return { path, value: parsed.iso, ms: parsed.ms };
    }
    return { path: null, value: null, ms: null };
  };
  const upper = value => text(value).toUpperCase();
  const canonicalJson = value => {
    const normalize = v => {
      if (Array.isArray(v)) return v.map(normalize);
      if (plainObject(v)) return Object.keys(v).sort().reduce((out, key) => { out[key] = normalize(v[key]); return out; }, {});
      return v;
    };
    return JSON.stringify(normalize(value));
  };
  const fnv1a32 = value => {
    let h = 0x811c9dc5;
    const s = String(value);
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  };

  const PATHS = Object.freeze({
    id: ["cycle_id", "decision_id", "proposal_id", "id"],
    asset: ["asset", "symbol", "market.symbol", "snapshot.symbol", "snapshot.asset", "market_snapshot.symbol", "snapshot.market_snapshot.symbol"],
    pair: ["pair", "market.pair", "snapshot.pair", "market_snapshot.pair", "snapshot.market_snapshot.pair"],
    quote: ["quote_currency", "quote", "currency", "market.quote_currency", "snapshot.quote_currency", "market_snapshot.quote_currency", "snapshot.market_snapshot.quote_currency"],
    decision: ["decision", "final_decision", "action", "result", "status", "proposal.decision"],
    reason: ["reason", "decision_reason", "blocker", "first_blocker", "gate_blocker", "proposal.reason"],
    decisionAt: ["decided_at", "decision_at", "at", "timestamp", "created_at", "captured_at", "saved_at"],
    marketAt: ["market_generated_at", "source_time", "market_at", "market.source_time", "snapshot.market_snapshot.source_time", "market_snapshot.source_time"],
    availableAt: ["available_at", "received_at", "captured_at", "decision_at", "decided_at", "at", "timestamp", "created_at", "saved_at"],
    strategyBuild: ["strategy_build", "strategy_version", "strategy.version", "strategy.build", "runtime.strategy_build", "versions.strategy"],
    policyBuild: ["policy_build", "policy_version", "policy.version", "policy.build", "runtime.policy_build", "versions.policy"],
    runtimeBuild: ["runtime_build", "administrator_build", "build", "runtime.build", "versions.runtime"],
    regime: ["regime", "market_regime", "inputs.regime", "snapshot.regime", "analysis.regime"],
    directionScore: ["direction_score", "inputs.direction_score", "snapshot.direction_score", "analysis.direction_score", "atlas.direction_score"],
    confidence: ["confidence", "oracle_confidence", "inputs.confidence", "inputs.oracle_confidence", "snapshot.confidence", "oracle.confidence"],
    btc24: ["btc24_pct", "btc_24h_pct", "btc24", "inputs.btc24_pct", "inputs.btc_24h_pct", "snapshot.btc24_pct", "market.btc24_pct"],
    reentryFresh: ["reentry_fresh", "fresh_signal", "inputs.reentry_fresh", "inputs.fresh_signal"],
    expectedMove: ["expected_move_pct", "inputs.expected_move_pct", "cost.expected_move_pct", "proposal.expected_move_pct"],
    requiredMove: ["required_move_pct", "inputs.required_move_pct", "cost.required_move_pct", "proposal.required_move_pct"],
    duplicate: ["duplicate", "is_duplicate", "inputs.duplicate", "identity.duplicate"],
    riskDecision: ["risk_decision", "inputs.risk_decision", "risk.decision", "risk.status"],
    authorizedNotional: ["authorized_notional_eur", "inputs.authorized_notional_eur", "risk.authorized_notional_eur", "risk.amount_eur"]
  });

  const FUTURE_MARKERS = Object.freeze([
    "closed_at", "completed_at", "settled_at", "exit_at", "exit_price", "close_price", "outcome", "future",
    "post_current", "next_price", "pnl", "net_pnl", "gross_pnl", "realized", "return_pct", "after_cost"
  ]);

  function futurePaths(value, prefix = "", out = []) {
    if (!plainObject(value) && !Array.isArray(value)) return out;
    const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v]) : Object.entries(value);
    for (const [key, child] of entries) {
      const path = prefix ? `${prefix}.${key}` : key;
      const normalized = String(key).toLowerCase();
      if (FUTURE_MARKERS.some(marker => normalized.includes(marker))) out.push(path);
      if ((plainObject(child) || Array.isArray(child)) && out.length < 64) futurePaths(child, path, out);
      if (out.length >= 64) break;
    }
    return out;
  }

  function normalizeAsset(rawAsset, rawPair) {
    let asset = upper(rawAsset);
    const pair = upper(rawPair);
    if (!asset && pair) asset = pair.split(/[\/\-_]/)[0] || "";
    if (asset.includes("/")) asset = asset.split("/")[0];
    if (asset.includes("-")) asset = asset.split("-")[0];
    return asset || null;
  }

  function normalizeQuote(rawQuote, rawPair) {
    let quote = upper(rawQuote);
    const pair = upper(rawPair);
    if (!quote && pair) {
      const parts = pair.split(/[\/\-_]/).filter(Boolean);
      if (parts.length >= 2) quote = parts.at(-1);
    }
    return quote || null;
  }

  function normalizeDecision(value) {
    const raw = upper(value).replace(/\s+/g, "_");
    if (!raw) return null;
    if (raw.includes("NO_TRADE") || raw === "WAIT" || raw === "STOP" || raw.includes("OBSERVER")) return "NO_TRADE";
    if (raw.includes("PAPER") || raw.includes("TRADE") || raw.includes("EXECUT")) return "PAPER_CANDIDATE";
    return raw;
  }

  function extractBoolean(row, paths) {
    const hit = first(row, paths, value => typeof value === "boolean" || value === 0 || value === 1 || ["TRUE", "FALSE", "YES", "NO"].includes(upper(value)));
    if (!hit.path) return { path: null, value: null };
    const v = hit.value;
    const bool = typeof v === "boolean" ? v : (v === 1 || ["TRUE", "YES"].includes(upper(v)) ? true : (v === 0 || ["FALSE", "NO"].includes(upper(v)) ? false : null));
    return { path: hit.path, value: bool };
  }

  function projectRow(row, index = 0) {
    const raw = plainObject(row) ? row : {};
    const idHit = firstText(raw, PATHS.id);
    const pairHit = firstText(raw, PATHS.pair);
    const assetHit = firstText(raw, PATHS.asset);
    const quoteHit = firstText(raw, PATHS.quote);
    const decisionHit = firstText(raw, PATHS.decision);
    const reasonHit = firstText(raw, PATHS.reason);
    const decisionTime = firstTime(raw, PATHS.decisionAt);
    const marketTime = firstTime(raw, PATHS.marketAt);
    const availabilityTime = firstTime(raw, PATHS.availableAt);
    const strategyHit = firstText(raw, PATHS.strategyBuild);
    const policyHit = firstText(raw, PATHS.policyBuild);
    const runtimeHit = firstText(raw, PATHS.runtimeBuild);
    const regimeHit = firstText(raw, PATHS.regime);
    const directionHit = firstNumber(raw, PATHS.directionScore);
    const confidenceHit = firstNumber(raw, PATHS.confidence);
    const btcHit = firstNumber(raw, PATHS.btc24);
    const reentryHit = extractBoolean(raw, PATHS.reentryFresh);
    const expectedHit = firstNumber(raw, PATHS.expectedMove);
    const requiredHit = firstNumber(raw, PATHS.requiredMove);
    const duplicateHit = extractBoolean(raw, PATHS.duplicate);
    const riskHit = firstText(raw, PATHS.riskDecision);
    const notionalHit = firstNumber(raw, PATHS.authorizedNotional);

    const pair = upper(pairHit.value) || null;
    const asset = normalizeAsset(assetHit.value, pair);
    const quote = normalizeQuote(quoteHit.value, pair);
    const decision = normalizeDecision(decisionHit.value);
    const cycleId = text(idHit.value) || null;
    const futureExcluded = [...new Set(futurePaths(raw))].sort();
    const marketAt = marketTime.value;
    const availableAt = availabilityTime.value || decisionTime.value;
    const decidedAt = decisionTime.value || availabilityTime.value;
    const timeOrderKnown = !!(marketTime.ms && (availabilityTime.ms || decisionTime.ms));
    const availabilityMs = availabilityTime.ms || decisionTime.ms;
    const temporalOrderOk = timeOrderKnown ? marketTime.ms <= availabilityMs : null;

    const t0 = {
      cycle_id: cycleId,
      asset,
      pair,
      quote_currency: quote,
      market_at: marketAt,
      available_at: availableAt,
      decided_at: decidedAt,
      decision,
      reason: text(reasonHit.value) || null,
      strategy_build: text(strategyHit.value) || null,
      policy_build: text(policyHit.value) || null,
      recorded_runtime_build: text(runtimeHit.value) || null,
      inputs: {
        regime: text(regimeHit.value) || null,
        direction_score: strictNumber(directionHit.value),
        confidence: strictNumber(confidenceHit.value),
        btc24_pct: strictNumber(btcHit.value),
        reentry_fresh: reentryHit.value,
        expected_move_pct: strictNumber(expectedHit.value),
        required_move_pct: strictNumber(requiredHit.value),
        duplicate: duplicateHit.value,
        risk_decision: text(riskHit.value) || null,
        authorized_notional_eur: strictNumber(notionalHit.value)
      }
    };

    const recordedVersionBound = !!(t0.strategy_build && t0.policy_build);
    const essential = {
      stable_id: !!cycleId,
      asset: !!asset,
      decision: !!decision,
      decision_time: !!decidedAt,
      availability_time: !!availableAt,
      market_time: !!marketAt,
      temporal_order: temporalOrderOk === true,
      recorded_strategy_policy_versions: recordedVersionBound
    };
    const replayInputs = {
      regime: !!t0.inputs.regime,
      direction_score: t0.inputs.direction_score !== null,
      confidence: t0.inputs.confidence !== null,
      btc24_pct: t0.inputs.btc24_pct !== null,
      reentry_fresh: t0.inputs.reentry_fresh !== null,
      expected_move_pct: t0.inputs.expected_move_pct !== null,
      required_move_pct: t0.inputs.required_move_pct !== null,
      duplicate: t0.inputs.duplicate !== null,
      risk_decision: !!t0.inputs.risk_decision,
      authorized_notional_eur: t0.inputs.authorized_notional_eur !== null
    };
    const missingEssential = Object.entries(essential).filter(([, ok]) => ok !== true).map(([key]) => key);
    const missingReplayInputs = Object.entries(replayInputs).filter(([, ok]) => ok !== true).map(([key]) => key);
    const traceable = essential.stable_id && essential.asset && essential.decision && essential.decision_time && essential.availability_time;
    const certified = traceable && essential.market_time && essential.temporal_order && essential.recorded_strategy_policy_versions && missingReplayInputs.length === 0;
    const fingerprintPayload = { schema: SCHEMA, source_owner: "AgentCryptoStrategyAExperimentLedger.read", t0 };
    const fingerprint = `fnv1a32:${fnv1a32(canonicalJson(fingerprintPayload))}`;

    return {
      schema: SCHEMA,
      build: BUILD,
      owner: OWNER,
      row_index: index,
      evidence_id: cycleId ? `T0-${cycleId}` : `T0-ROW-${String(index + 1).padStart(4, "0")}`,
      fingerprint,
      fingerprint_algorithm: "FNV-1A-32",
      source_owner: "AgentCryptoStrategyAExperimentLedger.read",
      source_cycle_id: cycleId,
      traceable_candidate: traceable,
      certified_t0_row: certified,
      state: certified ? "CERTIFIED_T0_ROW" : (traceable ? "TRACEABLE_CANDIDATE" : "INCOMPLETE"),
      t0,
      checks: { essential, replay_inputs: replayInputs, time_order_known: timeOrderKnown, temporal_order_ok: temporalOrderOk },
      missing_essential: missingEssential,
      missing_replay_inputs: missingReplayInputs,
      future_fields_excluded: futureExcluded,
      future_fields_in_t0: false,
      current_runtime_fallback_used_for_historical_version: false,
      current_runtime_context: {
        administrator_build: text(globalThis.AgentCryptoBootTruth?.build || globalThis.AGENT_CRYPTO_EFFECTIVE_BUILD || "") || null,
        strategy_spec_build: text(globalThis.AgentCryptoStrategyACanonicalSpec?.build || "") || null,
        replay_build: text(globalThis.AgentCryptoStrategyAReplay?.build || "") || null
      },
      gate3_promoted: false,
      g3_state: "PENDING",
      paper_only: true,
      real_order: false
    };
  }

  function readRows() {
    const api = globalThis.AgentCryptoStrategyAExperimentLedger || null;
    const rows = safeCall(api?.read, []);
    return Array.isArray(rows) ? rows.filter(plainObject) : [];
  }

  function snapshot() {
    const rawRows = readRows();
    const rows = rawRows.map(projectRow);
    const traceable = rows.filter(row => row.traceable_candidate);
    const certified = rows.filter(row => row.certified_t0_row);
    const latest = rows.at(-1) || null;
    const latestTraceable = [...traceable].sort((a, b) => Date.parse(a.t0?.decided_at || 0) - Date.parse(b.t0?.decided_at || 0)).at(-1) || null;
    const blockers = latestTraceable ? [
      ...latestTraceable.missing_essential.map(x => `essential:${x}`),
      ...latestTraceable.missing_replay_inputs.map(x => `input:${x}`)
    ] : (rawRows.length ? ["no_traceable_decision_row"] : ["experiment_ledger_empty_or_unavailable"]);
    return {
      schema: `${SCHEMA}_snapshot`,
      build: BUILD,
      owner: OWNER,
      generated_at: new Date().toISOString(),
      source_api_available: !!globalThis.AgentCryptoStrategyAExperimentLedger,
      source_rows: rawRows.length,
      projected_rows: rows.length,
      traceable_candidates: traceable.length,
      certified_t0_rows: certified.length,
      latest,
      latest_traceable: latestTraceable,
      blockers,
      rows,
      future_outcomes_used_as_t0_input: false,
      current_oracle_applied_to_past: false,
      current_runtime_fallback_used_for_historical_version: false,
      first_traceable_row_proves_wiring_only: true,
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

  function selfTest() {
    const base = {
      cycle_id: "A-CYCLE-TEST-001",
      asset: "BTC",
      pair: "BTC/EUR",
      market_generated_at: "2026-09-16T17:00:00Z",
      available_at: "2026-09-16T17:00:02Z",
      decided_at: "2026-09-16T17:00:03Z",
      decision: "NO_TRADE",
      reason: "DIRECTION",
      strategy_build: "STRAT-1",
      policy_build: "POLICY-1",
      inputs: { regime: "MIXTE", direction_score: -20, confidence: 94, btc24_pct: -2.17, reentry_fresh: true, expected_move_pct: 0.5, required_move_pct: 0.8, duplicate: false, risk_decision: "ACCEPT", authorized_notional_eur: 0 }
    };
    const complete = projectRow(base, 0);
    const missingTime = projectRow({ ...base, cycle_id: "A-CYCLE-TEST-002", decided_at: null, available_at: null }, 1);
    const withFuture = projectRow({ ...base, cycle_id: "A-CYCLE-TEST-003", net_pnl_eur: 999, closed_at: "2026-09-17T17:00:00Z" }, 2);
    const withoutFuture = projectRow({ ...base, cycle_id: "A-CYCLE-TEST-003" }, 2);
    const savedOnly = projectRow({ ...base, cycle_id: "A-CYCLE-TEST-004", market_generated_at: null, source_time: null, market_at: null, saved_at: "2026-09-16T17:00:05Z" }, 3);
    const versionMissing = projectRow({ ...base, cycle_id: "A-CYCLE-TEST-005", strategy_build: null, policy_build: null, build: BUILD }, 4);
    const pass = complete.certified_t0_row === true &&
      missingTime.certified_t0_row === false &&
      withFuture.future_fields_excluded.some(path => path.includes("net_pnl")) &&
      withFuture.fingerprint === withoutFuture.fingerprint &&
      savedOnly.t0.market_at === null && savedOnly.certified_t0_row === false &&
      versionMissing.certified_t0_row === false && versionMissing.current_runtime_fallback_used_for_historical_version === false;
    return {
      schema: "agent_crypto_strategy_a_g3_t0_decision_proof_self_test_v1",
      build: BUILD,
      pass,
      checks: {
        complete_no_trade_can_be_certified: complete.certified_t0_row === true,
        missing_decision_availability_time_rejected: missingTime.certified_t0_row === false,
        future_fields_excluded: withFuture.future_fields_excluded.some(path => path.includes("net_pnl")),
        future_fields_do_not_change_t0_fingerprint: withFuture.fingerprint === withoutFuture.fingerprint,
        saved_at_not_market_time: savedOnly.t0.market_at === null,
        current_runtime_build_never_fills_missing_historical_strategy_policy: versionMissing.certified_t0_row === false
      }
    };
  }

  function htmlEscape(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function localTime(value) {
    const ms = Date.parse(value || 0);
    return Number.isFinite(ms) ? new Date(ms).toLocaleString("fr-FR") : "—";
  }
  function ensureStyle() {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `#${ROOT_ID}{margin-top:9px;padding:9px;border:1px solid rgba(142,255,214,.22);border-radius:9px;background:rgba(6,25,24,.28)}#${ROOT_ID} .g3t0-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap}#${ROOT_ID} .g3t0-title{font-size:8px;font-weight:950;letter-spacing:.08em;color:#8ff5d2;text-transform:uppercase}#${ROOT_ID} .g3t0-badge{font-size:8px;font-weight:950;color:#ffe08a}#${ROOT_ID} .g3t0-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:7px}#${ROOT_ID} .g3t0-k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px;background:rgba(0,0,0,.12)}#${ROOT_ID} .g3t0-k span{display:block;font-size:7px;color:#77988e;text-transform:uppercase}#${ROOT_ID} .g3t0-k b{display:block;margin-top:3px;font-size:9px;color:#eafff8;overflow-wrap:anywhere}#${ROOT_ID} .g3t0-note{margin-top:7px;font-size:8px;line-height:1.4;color:#93afa6}#${ROOT_ID} .g3t0-block{margin-top:6px;padding:6px 7px;border-left:3px solid #ffd45c;background:rgba(255,199,56,.05);font-size:8px;color:#cfbf83;overflow-wrap:anywhere}@media(max-width:900px){#${ROOT_ID} .g3t0-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
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
      const anchor = document.getElementById("strategyAG3HistoricalEvidenceAdapter") || dossier.querySelector(".sad-g3") || dossier.lastElementChild;
      if (anchor?.parentElement === dossier) anchor.insertAdjacentElement("afterend", root); else dossier.appendChild(root);
    }
    const data = snapshot();
    const latest = data.latest_traceable;
    const state = data.certified_t0_rows > 0 ? "T0 ROW CERTIFIÉE" : (data.traceable_candidates > 0 ? "CANDIDAT TRAÇABLE" : "EN ATTENTE");
    root.dataset.build = BUILD;
    root.dataset.g3 = "PENDING";
    root.innerHTML = `<div class="g3t0-head"><div><div class="g3t0-title">G3 · T0 DECISION PROOF · ${BUILD}</div><div class="g3t0-note">Décision prospective connue à t0 · outcomes futurs exclus · aucune promotion de Gate.</div></div><div class="g3t0-badge">${htmlEscape(state)} · G3 PENDING</div></div><div class="g3t0-grid"><div class="g3t0-k"><span>Ledger</span><b>${data.source_rows} ligne(s)</b></div><div class="g3t0-k"><span>Traçables</span><b>${data.traceable_candidates}</b></div><div class="g3t0-k"><span>Certifiées t0</span><b>${data.certified_t0_rows}</b></div><div class="g3t0-k"><span>Dernière décision</span><b>${htmlEscape(latest?.t0?.decision || "—")}</b></div><div class="g3t0-k"><span>ID</span><b>${htmlEscape(latest?.source_cycle_id || "—")}</b></div><div class="g3t0-k"><span>Marché t0</span><b>${htmlEscape(localTime(latest?.t0?.market_at))}</b></div><div class="g3t0-k"><span>Disponible</span><b>${htmlEscape(localTime(latest?.t0?.available_at))}</b></div><div class="g3t0-k"><span>Empreinte</span><b>${htmlEscape(latest?.fingerprint || "—")}</b></div></div><div class="g3t0-block">${htmlEscape(data.blockers.length ? `Manque encore : ${data.blockers.join(" · ")}` : "Raccord t0 strict disponible. Cette première ligne prouve le câblage, pas le backtest complet.")}</div><div class="g3t0-note">PAPER ONLY · Oracle actuel jamais appliqué au passé · versions historiques jamais complétées depuis le runtime courant · futur exclu du signal t0.</div>`;
    return true;
  }

  function exportJson() {
    const payload = snapshot();
    if (typeof document !== "undefined" && typeof Blob !== "undefined" && typeof URL !== "undefined") {
      const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "STRATEGY_A_G3_T0_DECISION_PROOF.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    return clone(payload);
  }

  globalThis.AgentCryptoStrategyAG3T0DecisionProof = Object.freeze({
    build: BUILD,
    schema: SCHEMA,
    owner: OWNER,
    project_row: projectRow,
    read: () => snapshot().rows,
    snapshot,
    self_test: selfTest,
    render,
    export_json: exportJson,
    prospective_only: true,
    future_outcomes_used_as_t0_input: false,
    current_oracle_applied_to_past: false,
    current_runtime_fallback_used_for_historical_version: false,
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
