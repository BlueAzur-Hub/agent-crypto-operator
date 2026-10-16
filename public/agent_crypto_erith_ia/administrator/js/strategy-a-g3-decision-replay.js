/* Agent-Crypto @erith.IA — 40.6.196 G3 DECISION REPLAY VERIFIER
   Replays joined t0 decisions through the canonical Strategy A spec with no
   scenario-fixture defaults. It verifies decision reproducibility only; future
   outcomes and economic backtest metrics remain excluded. Gate 3 stays PENDING.
   No network, timer, observer, storage write, wallet, credentials or real order. */
(() => {
  "use strict";

  const BUILD = "40.6.196";
  const OWNER = "strategy-a-g3-decision-replay";
  const ROOT_ID = "strategyAG3DecisionReplay";
  const STYLE_ID = `${ROOT_ID}Style`;
  const SCHEMA = "agent_crypto_strategy_a_g3_decision_replay_v1";

  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const safeCall = (fn, fallback = null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; } };
  const strictNumber = value => {
    if (value === null || value === undefined || typeof value === "boolean") return null;
    if (typeof value === "string" && !value.trim()) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
  const upper = value => String(value ?? "").trim().toUpperCase();
  const plain = value => !!value && typeof value === "object" && !Array.isArray(value);

  function readPath(obj, path) {
    let cur = obj;
    for (const key of String(path).split(".")) {
      if (!plain(cur) && !Array.isArray(cur)) return undefined;
      cur = cur?.[key];
    }
    return cur;
  }
  function strictBoolean(value) {
    if (typeof value === "boolean") return value;
    if (value === 1 || upper(value) === "TRUE" || upper(value) === "YES") return true;
    if (value === 0 || upper(value) === "FALSE" || upper(value) === "NO") return false;
    return null;
  }
  function firstBoolean(obj, paths) {
    for (const path of paths) {
      const value = strictBoolean(readPath(obj, path));
      if (value !== null) return { path, value };
    }
    return { path: null, value: null };
  }

  const DATA_READY_PATHS = Object.freeze([
    "data_ready", "inputs.data_ready", "snapshot.data_ready", "data.ready",
    "market_data_ready", "market.ready", "proposal.data_ready"
  ]);

  function experimentRows() {
    const rows = safeCall(globalThis.AgentCryptoStrategyAExperimentLedger?.read, []);
    return Array.isArray(rows) ? rows.filter(plain) : [];
  }
  function cycleId(row) {
    return String(row?.cycle_id ?? row?.decision_id ?? row?.proposal_id ?? row?.id ?? "").trim();
  }
  function rawDataReady(sourceCycleId) {
    const id = String(sourceCycleId || "").trim();
    if (!id) return { found: false, value: null, path: null };
    const row = experimentRows().find(candidate => cycleId(candidate) === id);
    if (!row) return { found: false, value: null, path: null };
    const hit = firstBoolean(row, DATA_READY_PATHS);
    return { found: hit.value !== null, value: hit.value, path: hit.path };
  }

  function canonicalSpec() {
    const api = globalThis.AgentCryptoStrategyACanonicalSpec || null;
    const spec = clone(api?.spec) || null;
    const audit = safeCall(api?.audit, null);
    return { api, spec, audit, build: api?.build || null };
  }

  function evaluateInputs(input, policy) {
    const p = policy || {};
    const requiredPolicyNumbers = [
      "mixed_direction_min", "mixed_confidence_min", "mixed_btc24_min_pct",
      "bullish_confidence_min", "cost_required_move_pct"
    ];
    const missingPolicy = requiredPolicyNumbers.filter(key => strictNumber(p[key]) === null);
    if (!Array.isArray(p.allowed_risk_decisions) || !p.allowed_risk_decisions.length) missingPolicy.push("allowed_risk_decisions");
    if (missingPolicy.length) {
      return {
        schema: `${SCHEMA}_evaluation`,
        build: BUILD,
        evaluable: false,
        final_state: "NOT_EVALUABLE",
        reproduced_decision: null,
        first_blocker: null,
        gates: [],
        missing_policy: missingPolicy,
        missing_inputs: [],
        fixture_defaults_used: false
      };
    }

    const s = plain(input) ? input : {};
    const gates = [];
    const missingInputs = [];
    let blocked = false;
    const push = (key, label, known, pass, failState, value, threshold) => {
      if (!known) missingInputs.push(key);
      const state = blocked ? "not_reached" : (!known ? "unknown" : (pass ? "pass" : failState));
      gates.push({ key, label, state, value: value ?? null, threshold: threshold ?? null });
      if (!blocked && state !== "pass") blocked = true;
    };

    const dataReady = strictBoolean(s.data_ready);
    push("data", "DATA", dataReady !== null, dataReady === true, "stop", dataReady, true);

    const regime = upper(s.regime);
    const mixed = regime.includes("MIXTE");
    const bullish = regime.includes("HAUSSI") && !regime.includes("BAISS");
    push("regime", "RÉGIME", !!regime, bullish || mixed, "wait", regime || null, "HAUSSIER|MIXTE");

    const direction = strictNumber(s.direction_score);
    const directionPass = bullish || (mixed && direction !== null && direction >= Number(p.mixed_direction_min));
    push("direction", "DIRECTION", direction !== null, directionPass, "wait", direction, mixed ? Number(p.mixed_direction_min) : null);

    const confidence = strictNumber(s.confidence);
    const confidenceFloor = mixed ? Number(p.mixed_confidence_min) : Number(p.bullish_confidence_min);
    push("confidence", "CONFIANCE", confidence !== null, confidence !== null && confidence >= confidenceFloor, "wait", confidence, confidenceFloor);

    const btc24 = strictNumber(s.btc24_pct);
    const btcPass = btc24 !== null && (mixed ? btc24 >= Number(p.mixed_btc24_min_pct) : btc24 > 0);
    push("btc24", "BTC 24 H", btc24 !== null, btcPass, "wait", btc24, mixed ? Number(p.mixed_btc24_min_pct) : 0);

    const reentry = strictBoolean(s.reentry_fresh);
    push("reentry", "RÉENTRÉE", reentry !== null, reentry === true, "wait", reentry, true);

    const expected = strictNumber(s.expected_move_pct);
    push("cost", "COST GATE", expected !== null, expected !== null && expected >= Number(p.cost_required_move_pct), "wait", expected, Number(p.cost_required_move_pct));

    const duplicate = strictBoolean(s.duplicate);
    push("identity", "IDENTITÉ", duplicate !== null, duplicate === false, "stop", duplicate, false);

    const riskDecision = upper(s.risk_decision);
    const notional = strictNumber(s.authorized_notional_eur);
    const allowedRisk = p.allowed_risk_decisions.map(upper);
    const riskKnown = !!riskDecision && notional !== null;
    const riskPass = riskKnown && allowedRisk.includes(riskDecision) && notional > 0;
    push("risk", "RISK GOVERNOR", riskKnown, riskPass, "stop", riskKnown ? `${riskDecision}:${notional}` : null, allowedRisk.join("|"));

    if (!blocked) gates.push({ key: "paper", label: "PAPER", state: "pass", value: "PAPER_SIMULATED", threshold: "PAPER_ONLY" });
    else gates.push({ key: "paper", label: "PAPER", state: "not_reached", value: null, threshold: "PAPER_ONLY" });

    const firstBlocker = gates.find(g => ["wait", "stop", "unknown"].includes(g.state)) || null;
    const finalState = firstBlocker ? (firstBlocker.state === "stop" ? "STOP" : (firstBlocker.state === "wait" ? "WAIT" : "NOT_EVALUABLE")) : "PAPER_SIMULATED";
    const reproducedDecision = finalState === "PAPER_SIMULATED" ? "PAPER_CANDIDATE" : (["WAIT", "STOP"].includes(finalState) ? "NO_TRADE" : null);

    return {
      schema: `${SCHEMA}_evaluation`,
      build: BUILD,
      evaluable: missingInputs.length === 0,
      final_state: missingInputs.length ? "NOT_EVALUABLE" : finalState,
      reproduced_decision: missingInputs.length ? null : reproducedDecision,
      first_blocker: firstBlocker?.key || null,
      gates,
      missing_policy: [],
      missing_inputs: [...new Set(missingInputs)],
      fixture_defaults_used: false,
      future_outcomes_used: false,
      real_order: false
    };
  }

  function replayDecision(decision, dataset, specContext) {
    const sourceCycleId = decision?.source_cycle_id || null;
    const dataReady = rawDataReady(sourceCycleId);
    const spec = specContext?.spec || null;
    const audit = specContext?.audit || null;
    const specBuild = specContext?.build || null;
    const recordedPolicyBuild = String(decision?.policy_build || "").trim();
    const policyVersionMatches = !!recordedPolicyBuild && !!specBuild && recordedPolicyBuild === specBuild;
    const auditOk = audit?.status === "OK";
    const recordedRequired = strictNumber(decision?.inputs?.required_move_pct);
    const canonicalRequired = strictNumber(spec?.policy?.cost_required_move_pct);
    const costThresholdMatches = recordedRequired !== null && canonicalRequired !== null && Math.abs(recordedRequired - canonicalRequired) < 1e-9;

    const input = { ...(clone(decision?.inputs) || {}), data_ready: dataReady.value };
    const evaluation = evaluateInputs(input, spec?.policy || null);
    const recordedDecision = upper(decision?.decision);
    const decisionMatches = !!evaluation.reproduced_decision && recordedDecision === evaluation.reproduced_decision;
    const blockers = [];
    if (!dataset?.replay_input_ready) blockers.push("DATASET_NOT_READY");
    if (!dataReady.found) blockers.push("T0_DATA_READY_NOT_RECORDED");
    if (!auditOk) blockers.push(`CANONICAL_SPEC_AUDIT_${audit?.status || "UNAVAILABLE"}`);
    if (!policyVersionMatches) blockers.push("RECORDED_POLICY_VERSION_NOT_CURRENT_CANONICAL_SPEC");
    if (!costThresholdMatches) blockers.push("RECORDED_COST_THRESHOLD_MISMATCH");
    if (!evaluation.evaluable) blockers.push("DECISION_INPUTS_NOT_EVALUABLE");
    if (evaluation.evaluable && !decisionMatches) blockers.push("REPRODUCED_DECISION_MISMATCH");

    const verified = blockers.length === 0;
    return {
      schema: `${SCHEMA}_row`,
      build: BUILD,
      source_cycle_id: sourceCycleId,
      evidence_id: decision?.evidence_id || null,
      dataset_id: dataset?.dataset_id || null,
      t0_fingerprint: decision?.t0_fingerprint || null,
      recorded_decision: recordedDecision || null,
      reproduced_decision: evaluation.reproduced_decision,
      final_state: evaluation.final_state,
      first_blocker: evaluation.first_blocker,
      data_ready: dataReady.value,
      data_ready_source_path: dataReady.path,
      canonical_spec_build: specBuild,
      recorded_policy_build: recordedPolicyBuild || null,
      policy_version_matches: policyVersionMatches,
      canonical_spec_audit: audit?.status || "UNAVAILABLE",
      cost_threshold_matches: costThresholdMatches,
      verified_decision_replay: verified,
      state: verified ? "DECISION_REPLAY_VERIFIED" : "NOT_VERIFIED",
      blockers,
      evaluation,
      future_outcomes_used: false,
      fixture_defaults_used: false,
      economic_outcomes_evaluated: false,
      gate3_promoted: false
    };
  }

  function verify(datasetSnapshot = null) {
    const dataset = clone(datasetSnapshot) || safeCall(globalThis.AgentCryptoStrategyAG3ReplayDataset?.snapshot, null) || {};
    const specContext = canonicalSpec();
    const decisions = Array.isArray(dataset.decisions) ? dataset.decisions : [];
    const rows = decisions.map(decision => replayDecision(decision, dataset, specContext));
    const verified = rows.filter(row => row.verified_decision_replay);
    const blockers = [];
    if (dataset.replay_input_ready !== true) blockers.push("REPLAY_DATASET_NOT_READY");
    if (!decisions.length) blockers.push("NO_JOINED_T0_DECISION");
    if (decisions.length && verified.length !== decisions.length) blockers.push(`UNVERIFIED_DECISIONS:${decisions.length - verified.length}`);
    if (specContext.audit?.status !== "OK") blockers.push(`CANONICAL_SPEC_${specContext.audit?.status || "UNAVAILABLE"}`);

    const ready = dataset.replay_input_ready === true && decisions.length > 0 && verified.length === decisions.length && specContext.audit?.status === "OK";
    return {
      schema: `${SCHEMA}_snapshot`,
      build: BUILD,
      owner: OWNER,
      generated_at: new Date().toISOString(),
      state: ready ? "DECISION_REPLAY_VERIFIED" : "NOT_VERIFIED",
      decision_replay_verified: ready,
      dataset_id: dataset.dataset_id || null,
      dataset_state: dataset.state || null,
      canonical_spec_build: specContext.build,
      canonical_spec_audit: specContext.audit?.status || "UNAVAILABLE",
      decisions_seen: decisions.length,
      decisions_verified: verified.length,
      rows,
      blockers: [...new Set(blockers)],
      fixture_defaults_used: false,
      future_outcomes_used: false,
      economic_backtest_complete: false,
      performance_claim: false,
      first_decision_replay_proves_logic_wiring_only: true,
      gate3_promoted: false,
      g3_state: "PENDING",
      g9: "LOCKED",
      paper_only: true,
      real_order: false,
      network: false,
      storage_write: false,
      recurring_timer: false,
      observer: false
    };
  }

  function selfTest() {
    const policy = {
      mixed_direction_min: 12,
      mixed_confidence_min: 70,
      mixed_btc24_min_pct: 0.1,
      bullish_confidence_min: 55,
      cost_required_move_pct: 0.8,
      allowed_risk_decisions: ["ACCEPT", "REDUCE"]
    };
    const base = {
      data_ready: true,
      regime: "MIXTE",
      direction_score: 18,
      confidence: 84,
      btc24_pct: 0.35,
      reentry_fresh: true,
      expected_move_pct: 1.05,
      required_move_pct: 0.8,
      duplicate: false,
      risk_decision: "ACCEPT",
      authorized_notional_eur: 50
    };
    const paper = evaluateInputs(base, policy);
    const noTrade = evaluateInputs({ ...base, direction_score: -20, authorized_notional_eur: 0 }, policy);
    const missingData = evaluateInputs({ ...base, data_ready: null }, policy);
    const nullExpected = evaluateInputs({ ...base, expected_move_pct: null }, policy);
    const pass =
      paper.reproduced_decision === "PAPER_CANDIDATE" &&
      paper.final_state === "PAPER_SIMULATED" &&
      noTrade.reproduced_decision === "NO_TRADE" &&
      noTrade.first_blocker === "direction" &&
      missingData.evaluable === false &&
      nullExpected.evaluable === false &&
      paper.fixture_defaults_used === false &&
      paper.future_outcomes_used === false;
    return {
      schema: "agent_crypto_strategy_a_g3_decision_replay_self_test_v1",
      build: BUILD,
      pass,
      checks: {
        complete_pass_reaches_paper_candidate: paper.reproduced_decision === "PAPER_CANDIDATE",
        direction_block_reproduces_no_trade: noTrade.reproduced_decision === "NO_TRADE" && noTrade.first_blocker === "direction",
        missing_data_ready_rejected: missingData.evaluable === false,
        null_financial_input_rejected: nullExpected.evaluable === false,
        no_fixture_defaults: paper.fixture_defaults_used === false,
        no_future_outcomes: paper.future_outcomes_used === false
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
    style.textContent = `#${ROOT_ID}{margin-top:9px;padding:9px;border:1px solid rgba(185,142,255,.24);border-radius:9px;background:rgba(18,10,35,.30)}#${ROOT_ID} .g3dr-head{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}#${ROOT_ID} .g3dr-title{font-size:8px;font-weight:950;letter-spacing:.08em;color:#d1b4ff;text-transform:uppercase}#${ROOT_ID} .g3dr-badge{font-size:8px;font-weight:950;color:#ffe08a}#${ROOT_ID} .g3dr-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:7px}#${ROOT_ID} .g3dr-k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px;background:rgba(0,0,0,.12)}#${ROOT_ID} .g3dr-k span{display:block;font-size:7px;color:#9884ac;text-transform:uppercase}#${ROOT_ID} .g3dr-k b{display:block;margin-top:3px;font-size:9px;color:#f7eeff;overflow-wrap:anywhere}#${ROOT_ID} .g3dr-note{margin-top:7px;font-size:8px;line-height:1.4;color:#aa99ba}#${ROOT_ID} .g3dr-block{margin-top:6px;padding:6px 7px;border-left:3px solid #ffd45c;background:rgba(255,199,56,.05);font-size:8px;color:#cfbf83;overflow-wrap:anywhere}@media(max-width:900px){#${ROOT_ID} .g3dr-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
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
      const anchor = document.getElementById("strategyAG3ReplayDataset") || dossier.querySelector(".sad-g3") || dossier.lastElementChild;
      if (anchor?.parentElement === dossier) anchor.insertAdjacentElement("afterend", root);
      else dossier.appendChild(root);
    }
    const data = verify();
    const blockers = data.blockers.length ? data.blockers.join(" · ") : "Décisions t0 reproduites sous la spec canonique courante. Les outcomes économiques restent à ajouter séparément.";
    root.dataset.build = BUILD;
    root.dataset.g3 = "PENDING";
    root.innerHTML = `<div class="g3dr-head"><div><div class="g3dr-title">G3 · DECISION REPLAY VERIFIER · ${BUILD}</div><div class="g3dr-note">Replay de la décision t0 · spec canonique · zéro fixture par défaut · futur exclu.</div></div><div class="g3dr-badge">${escapeHtml(data.state)} · G3 PENDING</div></div><div class="g3dr-grid"><div class="g3dr-k"><span>Dataset</span><b>${escapeHtml(data.dataset_state || "—")}</b></div><div class="g3dr-k"><span>Décisions</span><b>${data.decisions_seen}</b></div><div class="g3dr-k"><span>Vérifiées</span><b>${data.decisions_verified}</b></div><div class="g3dr-k"><span>Spec audit</span><b>${escapeHtml(data.canonical_spec_audit)}</b></div><div class="g3dr-k"><span>Spec build</span><b>${escapeHtml(data.canonical_spec_build || "—")}</b></div><div class="g3dr-k"><span>Fixtures</span><b>0</b></div><div class="g3dr-k"><span>Outcomes futurs</span><b>0 entrée</b></div><div class="g3dr-k"><span>Backtest économique</span><b>NON</b></div></div><div class="g3dr-block">${escapeHtml(blockers)}</div><div class="g3dr-note">DECISION_REPLAY_VERIFIED prouve seulement la reproductibilité de la décision enregistrée sous la version de policy compatible. Aucun rendement n'est déduit et Gate 3 reste PENDING.</div>`;
    return true;
  }

  function exportJson() {
    const payload = verify();
    if (typeof document !== "undefined" && typeof Blob !== "undefined" && typeof URL !== "undefined") {
      const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "STRATEGY_A_G3_DECISION_REPLAY.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    return clone(payload);
  }

  globalThis.AgentCryptoStrategyAG3DecisionReplay = Object.freeze({
    build: BUILD,
    schema: SCHEMA,
    owner: OWNER,
    evaluate_inputs: evaluateInputs,
    verify,
    snapshot: verify,
    self_test: selfTest,
    render,
    export_json: exportJson,
    fixture_defaults_used: false,
    future_outcomes_used: false,
    economic_backtest_complete: false,
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
