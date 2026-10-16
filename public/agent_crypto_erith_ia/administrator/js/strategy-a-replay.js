/*
  Agent-Crypto Administrator — Strategy A deterministic replay sandbox
  Build: 40.6.192
  Responsibility: replay fixed Paper V2 decision scenarios without touching live market state.
  40.6.192: self-tests are pure/non-destructive, replay ids remain unique after the 64-row cap,
  and null/blank/boolean numeric inputs are rejected instead of coercing to zero.
  No network, no timer, no localStorage, no live Paper ledger mutation, no Kraken order.
*/
(() => {
  "use strict";
  const BUILD = "40.6.192";
  const SCHEMA = "agent_crypto_strategy_a_deterministic_replay_v2";
  const MAX_RESULTS = 64;
  const CANONICAL_POLICY = Object.freeze({ mixed_direction_min: 12, mixed_confidence_min: 70, mixed_btc24_min_pct: 0.10, bullish_confidence_min: 55, cost_required_move_pct: 0.80, allowed_risk_decisions: Object.freeze(["ACCEPT", "REDUCE"]) });

  const SCENARIOS = Object.freeze({
    PASS_TO_PAPER: Object.freeze({ label: "PASS → PAPER SIMULÉ", data_ready: true, regime: "MIXTE", direction_score: 18, confidence: 84, btc24_pct: 0.35, reentry_fresh: true, expected_move_pct: 1.05, required_move_pct: 0.80, duplicate: false, risk_decision: "ACCEPT", authorized_notional_eur: 50 }),
    DATA_STALE_STOP: Object.freeze({ label: "DATA STALE → STOP", data_ready: false, regime: "MIXTE", direction_score: 18, confidence: 84, btc24_pct: 0.35, reentry_fresh: true, expected_move_pct: 1.05, required_move_pct: 0.80, duplicate: false, risk_decision: "ACCEPT", authorized_notional_eur: 50 }),
    DIRECTION_WAIT: Object.freeze({ label: "DIRECTION → WAIT", data_ready: true, regime: "MIXTE", direction_score: 8, confidence: 84, btc24_pct: 0.35, reentry_fresh: true, expected_move_pct: 1.05, required_move_pct: 0.80, duplicate: false, risk_decision: "ACCEPT", authorized_notional_eur: 50 }),
    BTC24_WAIT: Object.freeze({ label: "BTC 24H → WAIT", data_ready: true, regime: "MIXTE", direction_score: 18, confidence: 84, btc24_pct: -0.18, reentry_fresh: true, expected_move_pct: 1.05, required_move_pct: 0.80, duplicate: false, risk_decision: "ACCEPT", authorized_notional_eur: 50 }),
    COST_WAIT: Object.freeze({ label: "COST GATE → WAIT", data_ready: true, regime: "MIXTE", direction_score: 18, confidence: 84, btc24_pct: 0.35, reentry_fresh: true, expected_move_pct: 0.34, required_move_pct: 0.80, duplicate: false, risk_decision: "ACCEPT", authorized_notional_eur: 50 }),
    DUPLICATE_STOP: Object.freeze({ label: "DUPLICATE → STOP", data_ready: true, regime: "MIXTE", direction_score: 18, confidence: 84, btc24_pct: 0.35, reentry_fresh: true, expected_move_pct: 1.05, required_move_pct: 0.80, duplicate: true, risk_decision: "ACCEPT", authorized_notional_eur: 50 }),
    RISK_REJECT: Object.freeze({ label: "RISK → REJECT", data_ready: true, regime: "MIXTE", direction_score: 18, confidence: 84, btc24_pct: 0.35, reentry_fresh: true, expected_move_pct: 1.05, required_move_pct: 0.80, duplicate: false, risk_decision: "REJECT", authorized_notional_eur: 0 })
  });

  const RESULTS = [];
  let replaySequence = 0;
  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const finite = value => { if (value === null || value === undefined || typeof value === "boolean") return false; if (typeof value === "string" && value.trim() === "") return false; return Number.isFinite(Number(value)); };
  const number = (value, fallback = null) => finite(value) ? Number(value) : fallback;
  const fixed = (value, digits = 2, fallback = "—") => finite(value) ? Number(value).toFixed(digits) : fallback;

  function livePolicyProbe() {
    const mixed = globalThis.AgentCryptoStrategyAMeasuredMixedBias?.thresholds || null;
    const v2 = globalThis.AgentCryptoStrategyAV2?.policy || null;
    return { mixed_direction_min: number(mixed?.min_direction_score), mixed_confidence_min: number(mixed?.min_oracle_confidence), mixed_btc24_min_pct: number(mixed?.min_btc_24h_pct), cost_absolute_min_expected_move_pct: number(v2?.absolute_min_expected_move_pct), cost_safety_margin_over_cost_pct: number(v2?.safety_margin_over_cost_pct) };
  }

  function policyDrift(probe = livePolicyProbe()) {
    const checks = [["mixed_direction_min", probe.mixed_direction_min, CANONICAL_POLICY.mixed_direction_min],["mixed_confidence_min", probe.mixed_confidence_min, CANONICAL_POLICY.mixed_confidence_min],["mixed_btc24_min_pct", probe.mixed_btc24_min_pct, CANONICAL_POLICY.mixed_btc24_min_pct],["cost_absolute_min_expected_move_pct", probe.cost_absolute_min_expected_move_pct, CANONICAL_POLICY.cost_required_move_pct]];
    return checks.filter(([, observed, expected]) => finite(observed) && Math.abs(Number(observed) - Number(expected)) > 1e-9).map(([key, observed, expected]) => ({ key, observed: Number(observed), expected: Number(expected) }));
  }

  function evaluateScenario(name, overrides = {}) {
    const base = SCENARIOS[name]; if (!base) throw new Error(`Unknown replay scenario: ${name}`);
    const s = { ...base, ...(overrides || {}) };
    const mixed = /MIXTE/i.test(String(s.regime || ""));
    const bullish = /HAUSSI/i.test(String(s.regime || "")) && !/BAISS/i.test(String(s.regime || ""));
    const gates = []; let blocked = false;
    const push = (key, label, pass, failState, value, threshold) => { const state = blocked ? "not_reached" : (pass ? "pass" : failState); gates.push({ key, label, state, value: String(value ?? "—"), threshold: String(threshold ?? "—") }); if (!blocked && !pass) blocked = true; return state === "pass"; };

    push("data", "DATA", s.data_ready === true, "stop", s.data_ready ? "READY" : "STALE / INCOMPLET", "données vérifiées");
    push("regime", "RÉGIME", bullish || mixed, "wait", s.regime, "HAUSSIER ou MIXTE mesurable");
    const directionPass = bullish || (mixed && finite(s.direction_score) && Number(s.direction_score) >= CANONICAL_POLICY.mixed_direction_min);
    push("direction", "DIRECTION", directionPass, "wait", finite(s.direction_score) ? `${Number(s.direction_score)}/100` : "—", bullish ? "baseline haussier" : `≥ +${CANONICAL_POLICY.mixed_direction_min}/100`);
    const confFloor = mixed ? CANONICAL_POLICY.mixed_confidence_min : CANONICAL_POLICY.bullish_confidence_min;
    push("confidence", "CONFIANCE", finite(s.confidence) && Number(s.confidence) >= confFloor, "wait", finite(s.confidence) ? `${Number(s.confidence)}/100` : "—", `≥ ${confFloor}/100`);
    const btcPass = finite(s.btc24_pct) && (mixed ? Number(s.btc24_pct) >= CANONICAL_POLICY.mixed_btc24_min_pct : Number(s.btc24_pct) > 0);
    push("btc24", "BTC 24 H", btcPass, "wait", finite(s.btc24_pct) ? `${Number(s.btc24_pct).toFixed(3)} %` : "—", mixed ? `≥ +${CANONICAL_POLICY.mixed_btc24_min_pct.toFixed(2)} %` : "> 0 %");
    push("reentry", "RÉENTRÉE", s.reentry_fresh === true, "wait", s.reentry_fresh ? "SIGNAL NEUF" : "STALE", "cooldown + signal neuf");
    const required = finite(s.required_move_pct) ? Number(s.required_move_pct) : CANONICAL_POLICY.cost_required_move_pct;
    const expected = number(s.expected_move_pct);
    push("cost", "COST GATE", finite(expected) && Number(expected) >= required, "wait", finite(expected) ? `${Number(expected).toFixed(2)} %` : "—", `≥ ${required.toFixed(2)} %`);
    push("duplicate", "IDENTITÉ", s.duplicate !== true, "stop", s.duplicate ? "DUPLICATE" : "UNIQUE", "decision_id unique");
    const riskDecision = String(s.risk_decision || "REJECT").toUpperCase();
    const riskPass = CANONICAL_POLICY.allowed_risk_decisions.includes(riskDecision) && finite(s.authorized_notional_eur) && Number(s.authorized_notional_eur) > 0;
    push("risk", "RISK GOVERNOR", riskPass, "stop", `${riskDecision} · ${fixed(s.authorized_notional_eur)} €`, "ACCEPT/REDUCE + montant > 0");
    push("paper", "PAPER", !blocked, "not_reached", blocked ? "NON ATTEINT" : "PAPER_SIMULATED", "aucun ordre réel");

    const firstBlocker = gates.find(g => g.state === "wait" || g.state === "stop") || null;
    const finalState = firstBlocker ? (firstBlocker.state === "stop" ? "STOP" : "WAIT") : "PAPER_SIMULATED";
    const probe = livePolicyProbe();
    return { schema: SCHEMA, build: BUILD, replay_id: null, scenario: name, label: String(s.label || name), deterministic: true, final_state: finalState, first_blocker: firstBlocker?.key || null, gates, input: clone(s), canonical_policy: clone(CANONICAL_POLICY), live_policy_probe: probe, policy_drift: policyDrift(probe), safety: { isolated_from_live: true, experiment_ledger_mutated: false, live_proposal_mutated: false, live_risk_mutated: false, live_paper_ledger_mutated: false, local_storage_write: false, network_request: false, kraken_network: false, wallet: false, credentials: false, real_orders: false } };
  }

  function replayScenario(name, overrides = {}) {
    const result = evaluateScenario(name, overrides); replaySequence += 1; result.replay_id = `REPLAY-${name}-${String(replaySequence).padStart(6, "0")}`;
    RESULTS.push(result); if (RESULTS.length > MAX_RESULTS) RESULTS.splice(0, RESULTS.length - MAX_RESULTS); renderResult(result); return clone(result);
  }

  function selfTest() {
    const expected = { PASS_TO_PAPER: "PAPER_SIMULATED", DATA_STALE_STOP: "STOP", DIRECTION_WAIT: "WAIT", BTC24_WAIT: "WAIT", COST_WAIT: "WAIT", DUPLICATE_STOP: "STOP", RISK_REJECT: "STOP" };
    const before = JSON.stringify(RESULTS), sequenceBefore = replaySequence, checks = [];
    for (const [name, finalState] of Object.entries(expected)) { const result = evaluateScenario(name); checks.push({ scenario: name, expected: finalState, actual: result.final_state, pass: result.final_state === finalState }); }
    const nullCost = evaluateScenario("PASS_TO_PAPER", { expected_move_pct: null });
    const blankCost = evaluateScenario("PASS_TO_PAPER", { expected_move_pct: "  " });
    const nullRisk = evaluateScenario("PASS_TO_PAPER", { authorized_notional_eur: null });
    const stateUnchanged = before === JSON.stringify(RESULTS) && sequenceBefore === replaySequence;
    const nullsRejected = nullCost.first_blocker === "cost" && blankCost.first_blocker === "cost" && nullRisk.first_blocker === "risk";
    const pass = checks.every(row => row.pass) && stateUnchanged && nullsRejected;
    return { schema: "agent_crypto_strategy_a_replay_self_test_v2", build: BUILD, pass, state_unchanged: stateUnchanged, checks, integrity: { result_store_unchanged: stateUnchanged, replay_sequence_unchanged: sequenceBefore === replaySequence, null_numeric_inputs_rejected: nullsRejected, self_test_writes_replay_history: false } };
  }

  function ensureStyle() {
    if (typeof document === "undefined") return null; let style = document.getElementById("strategyAReplayStyle"); if (style) return style;
    style = document.createElement("style"); style.id = "strategyAReplayStyle";
    style.textContent = `#strategyAReplaySandbox{margin-top:10px;padding:10px;border:1px solid rgba(127,183,255,.20);border-radius:10px;background:rgba(5,13,25,.62)}#strategyAReplaySandbox .sar-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap}#strategyAReplaySandbox .sar-title{font-size:9px;font-weight:950;letter-spacing:.09em;text-transform:uppercase;color:#b7d8ff}#strategyAReplaySandbox .sar-sub{margin-top:3px;font-size:8px;line-height:1.35;color:#8298ad}#strategyAReplaySandbox .sar-actions{display:flex;gap:5px;flex-wrap:wrap;margin:9px 0}#strategyAReplaySandbox .sar-actions button{font-size:13px!important;min-height:38px!important}#strategyAReplaySandbox .sar-status{padding:7px 8px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(0,0,0,.14);font-size:9px;color:#d9e9f6}#strategyAReplaySandbox .sar-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin-top:7px}#strategyAReplaySandbox .sar-gate{padding:6px 7px;border:1px solid rgba(255,255,255,.06);border-radius:7px;background:rgba(255,255,255,.018)}#strategyAReplaySandbox .sar-gate[data-state="pass"]{border-color:rgba(91,219,171,.25)}#strategyAReplaySandbox .sar-gate[data-state="wait"]{border-color:rgba(234,192,93,.28)}#strategyAReplaySandbox .sar-gate[data-state="stop"]{border-color:rgba(255,114,114,.30)}#strategyAReplaySandbox .sar-gate[data-state="not_reached"]{opacity:.45}#strategyAReplaySandbox .sar-gate span{display:block;font-size:7px;letter-spacing:.06em;color:#7d91a4;text-transform:uppercase;font-weight:900}#strategyAReplaySandbox .sar-gate b{display:block;margin-top:3px;font-size:9px;color:#eef7ff;overflow-wrap:anywhere}#strategyAReplaySandbox .sar-gate small{display:block;margin-top:2px;font-size:7px;color:#748696}#strategyAReplaySandbox .sar-safety{margin-top:7px;font-size:8px;line-height:1.35;color:#7f989f}@media(max-width:950px){#strategyAReplaySandbox .sar-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
    document.head.appendChild(style); return style;
  }

  function renderResult(result) {
    if (typeof document === "undefined") return false; const panel = document.getElementById("strategyAReplaySandbox"); if (!panel) return false;
    const status = panel.querySelector("#strategyAReplayStatus"), grid = panel.querySelector("#strategyAReplayGrid");
    if (status) status.textContent = result ? `${result.scenario} · ${result.final_state}${result.first_blocker ? ` · 1er verrou ${result.first_blocker.toUpperCase()}` : " · pipeline complet"}` : "Aucun replay exécuté.";
    if (grid) { grid.replaceChildren(); for (const gate of result?.gates || []) { const card = document.createElement("div"); card.className = "sar-gate"; card.dataset.state = gate.state; card.innerHTML = `<span>${gate.label} · ${gate.state.toUpperCase()}</span><b>${gate.value}</b><small>${gate.threshold}</small>`; grid.appendChild(card); } }
    return true;
  }

  function exportResults() {
    const payload = { schema: "agent_crypto_strategy_a_replay_export_v2", build: BUILD, exported_at: new Date().toISOString(), deterministic: true, paper_only: true, replay_sequence: replaySequence, safety: { live_state_mutation: false, local_storage_write: false, network: false, real_orders: false }, results: clone(RESULTS) || [] };
    if (typeof document !== "undefined" && typeof Blob !== "undefined" && typeof URL !== "undefined") { const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = "STRATEGY_A_REPLAY_SANDBOX.json"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }
    return payload;
  }

  function render() {
    if (typeof document === "undefined") return false; ensureStyle(); const anchor = document.getElementById("strategyAExperimentLedger") || document.getElementById("strategyADecisionTrace"); if (!anchor) return false;
    let panel = document.getElementById("strategyAReplaySandbox");
    if (!panel) { panel = document.createElement("section"); panel.id = "strategyAReplaySandbox"; panel.setAttribute("data-strategy-a-replay-build", BUILD); panel.innerHTML = `<div class="sar-head"><div><div class="sar-title">REPLAY SANDBOX · DÉTERMINISTE · ISOLÉ DU LIVE</div><div class="sar-sub">Scénarios figés pour traverser volontairement les gates Strategy A sans falsifier le marché réel ni contaminer le ledger Auto A.</div></div><button type="button" class="btn small" id="strategyAReplayExport">EXPORTER REPLAY</button></div><div class="sar-actions" id="strategyAReplayActions"></div><div class="sar-status" id="strategyAReplayStatus">Aucun replay exécuté.</div><div class="sar-grid" id="strategyAReplayGrid"></div><div class="sar-safety">PAPER ONLY · zéro ordre réel · zéro Kraken · zéro wallet · zéro clé · zéro écriture localStorage · aucun état live Strategy A modifié.</div>`; anchor.insertAdjacentElement("afterend", panel); const actions = panel.querySelector("#strategyAReplayActions"); for (const [name, scenario] of Object.entries(SCENARIOS)) { const button = document.createElement("button"); button.type = "button"; button.className = "btn small"; button.dataset.replayScenario = name; button.textContent = scenario.label; button.addEventListener("click", () => replayScenario(name)); actions?.appendChild(button); } panel.querySelector("#strategyAReplayExport")?.addEventListener("click", exportResults); }
    renderResult(RESULTS.at(-1) || null); return true;
  }

  const api = Object.freeze({ build: BUILD, schema: SCHEMA, scenarios: clone(SCENARIOS), policy: clone(CANONICAL_POLICY), run: replayScenario, evaluate: evaluateScenario, read: () => clone(RESULTS) || [], export_json: exportResults, self_test: selfTest, live_policy_probe: livePolicyProbe, policy_drift: () => policyDrift(), render, deterministic: true, isolated_from_live: true, self_test_writes_replay_history: false, replay_ids_independent_of_store_length: true, strict_numeric_inputs: true, experiment_ledger_mutated: false, live_paper_ledger_mutated: false, storage_write: false, new_fetch: false, new_websocket: false, new_timer: false, new_observer: false, real_orders: false, kraken_network: false });
  globalThis.AgentCryptoStrategyAReplay = api;
  if (typeof document !== "undefined") { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => render(), { once: true }); else render(); }
})();
