/*
  Agent-Crypto Administrator — Strategy A Paper V2 lifecycle + common safety gate
  Build: 40.6.15
  Responsibility: deterministic Paper-only execution/reconciliation lifecycle.
  Adds a fail-closed common Safety Governor gate for NEW Paper entries only.
  Existing submitted Paper positions remain monitorable/reconcilable/closable.
  No network, no Kraken order, no wallet, no credentials, no live Paper ledger mutation.
*/
(() => {
  "use strict";

  const BUILD = "40.6.15";
  const SCHEMA = "agent_crypto_strategy_a_paper_lifecycle_v2";
  const MAX_AUDIT_ROWS = 160;
  const TERMINAL = new Set(["CLOSED", "REJECTED", "CANCELED", "STOP_UNPROTECTED", "RECONCILED_NO_ORDER"]);
  const LIVE_IDS = new Set();
  // Authorization identities are consumed exactly once at successful Paper SUBMIT.
  // They are intentionally never released by close/reject/cancel.
  const CONSUMED_AUTHORIZATIONS = new Set();
  const AUDIT = [];

  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const finite = value => Number.isFinite(Number(value));
  const num = (value, fallback = 0) => finite(value) ? Number(value) : fallback;
  const iso = () => new Date().toISOString();

  // 40.6.14 — one common gate for every NEW Strategy A Paper entry path.
  // Safety is resolved at call time because the governor script is loaded after
  // this lifecycle owner. Fail closed for creation/submission, but never strand
  // an already-submitted Paper position that still needs reconciliation/closure.
  function safetyGovernor() {
    return globalThis.AgentCryptoStrategyASafetyCertification404299
      || globalThis.AgentCryptoStrategyASafetyCertification404295
      || globalThis.AgentCryptoStrategyASafetyCertification404293
      || null;
  }

  function safetyGateSnapshot() {
    const governor = safetyGovernor();
    if (!governor || typeof governor.snapshot !== "function") {
      return { allowed: false, level: "UNAVAILABLE", reason: "SAFETY_GOVERNOR_UNAVAILABLE", new_trades_allowed: false };
    }
    try {
      const snap = governor.snapshot() || {};
      const level = String(snap.level || "UNKNOWN").toUpperCase();
      const allowed = level === "NORMAL" && snap.new_trades_allowed === true;
      return {
        allowed,
        level,
        reason: String(snap.reason || (allowed ? "NORMAL" : "SAFETY_GOVERNOR_BLOCK")),
        new_trades_allowed: snap.new_trades_allowed === true,
        existing_paper_monitoring_allowed: snap.existing_paper_monitoring_allowed !== false,
        governor_build: snap.build || governor.build || null
      };
    } catch (error) {
      return { allowed: false, level: "ERROR", reason: "SAFETY_GOVERNOR_SNAPSHOT_ERROR", new_trades_allowed: false, error: String(error?.message || error) };
    }
  }

  function safetyReject(envelope, stage, gate) {
    envelope.state = "REJECTED";
    envelope.reason = `SAFETY_GOVERNOR_BLOCK_${stage}`;
    envelope.retry_allowed = false;
    envelope.updated_at = iso();
    envelope.safety_gate = clone(gate) || gate;
    LIVE_IDS.delete(envelope.trade_id);
    audit(envelope, envelope.reason, {
      stage, level: gate?.level || "UNKNOWN", governor_reason: gate?.reason || null,
      new_trades_allowed: gate?.new_trades_allowed === true
    });
    return envelope;
  }

  const hash = text => {
    let h = 2166136261;
    for (const c of String(text || "")) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16).padStart(8, "0");
  };

  // 40.6.15 — canonical one-shot authorization identity.
  // Prefer the explicit Risk authorization. If the current caller does not
  // provide one, decision/proposal identity remains a deterministic fail-safe.
  function authorizationKey(envelope) {
    const clean = value => {
      const v = String(value ?? "").trim();
      if (!v || /^(UNKNOWN|NONE|NULL|N\/A)$/i.test(v) || /-UNKNOWN$/i.test(v)) return null;
      return v;
    };
    const risk = clean(envelope?.risk_id);
    if (risk) return `RISK:${risk}`;
    const decision = clean(envelope?.decision_id);
    if (decision) return `DECISION:${decision}`;
    const proposal = clean(envelope?.proposal_id);
    if (proposal) return `PROPOSAL:${proposal}`;
    return null;
  }

  function authorizationReject(envelope, reason, key = null) {
    envelope.state = "REJECTED";
    envelope.reason = reason;
    envelope.retry_allowed = false;
    envelope.updated_at = iso();
    envelope.authorization = {
      key: key ? hash(key) : null,
      source: key ? key.split(":", 1)[0] : null,
      consumed: false,
      rejected_at: envelope.updated_at
    };
    LIVE_IDS.delete(envelope.trade_id);
    audit(envelope, reason, { authorization_key_hash: envelope.authorization.key });
    return envelope;
  }

  function authorizationSnapshot() {
    return {
      build: BUILD,
      consumed_count: CONSUMED_AUTHORIZATIONS.size,
      consumed_key_hashes: [...CONSUMED_AUTHORIZATIONS].map(hash)
    };
  }

  function audit(envelope, action, detail = {}) {
    const row = {
      schema: "agent_crypto_strategy_a_paper_lifecycle_audit_v2",
      build: BUILD,
      at: iso(),
      trade_id: envelope?.trade_id || null,
      state: envelope?.state || null,
      action,
      detail: clone(detail) || {}
    };
    AUDIT.push(row);
    if (AUDIT.length > MAX_AUDIT_ROWS) AUDIT.splice(0, AUDIT.length - MAX_AUDIT_ROWS);
    return row;
  }

  function createEnvelope(input = {}) {
    const decisionId = String(input.decision_id || `REPLAY-DECISION-${Date.now()}`);
    const tradeId = String(input.trade_id || `PAPER-A-${hash(`${decisionId}|${input.symbol || "BTC"}|${input.authorized_notional_eur || 50}`)}`);
    if (LIVE_IDS.has(tradeId)) {
      const duplicate = {
        schema: SCHEMA, build: BUILD, trade_id: tradeId, decision_id: decisionId,
        state: "REJECTED", reason: "DUPLICATE_TRADE_ID", retry_allowed: false,
        paper_only: true, real_order: false, kraken_network: false
      };
      audit(duplicate, "CREATE_REJECTED_DUPLICATE");
      return duplicate;
    }
    const authorized = Math.max(0, num(input.authorized_notional_eur, 50));
    const envelope = {
      schema: SCHEMA,
      build: BUILD,
      trade_id: tradeId,
      decision_id: decisionId,
      proposal_id: input.proposal_id || null,
      risk_id: input.risk_id || null,
      strategy: "STRATEGY_A",
      symbol: String(input.symbol || "BTC").toUpperCase(),
      side: "BUY_PAPER",
      state: authorized > 0 ? "PROPOSAL" : "REJECTED",
      created_at: iso(),
      updated_at: iso(),
      authorized_notional_eur: authorized,
      submitted_notional_eur: 0,
      acknowledged_notional_eur: 0,
      filled_notional_eur: 0,
      filled_quantity: 0,
      remaining_notional_eur: authorized,
      fill_count: 0,
      fill_ratio: 0,
      average_fill_price_eur: null,
      fills: [],
      reconciliation: null,
      protection: { required: true, state: "NOT_REACHED" },
      retry_allowed: false,
      blind_retry_forbidden: true,
      paper_only: true,
      isolated_from_live: true,
      safety: {
        simulation_only: true,
        network_request: false,
        kraken_network: false,
        kraken_order: false,
        credentials: false,
        wallet: false,
        withdrawal: false,
        live_paper_ledger_mutated: false,
        experiment_ledger_mutated: false,
        real_order: false
      }
    };
    if (envelope.state !== "REJECTED") {
      const gate = safetyGateSnapshot();
      envelope.safety_gate = clone(gate) || gate;
      if (!gate.allowed) return safetyReject(envelope, "CREATE", gate);
      LIVE_IDS.add(tradeId);
    }
    audit(envelope, "CREATE", { authorized_notional_eur: authorized, safety_gate: envelope.safety_gate || null });
    return envelope;
  }

  function guard(envelope, allowed, action) {
    if (!envelope || !allowed.includes(envelope.state)) {
      audit(envelope || {}, `${action}_REFUSED`, { allowed, observed: envelope?.state || null });
      return false;
    }
    return true;
  }

  function riskApprove(envelope, decision = "ACCEPT") {
    if (!guard(envelope, ["PROPOSAL"], "RISK")) return envelope;
    const normalized = String(decision || "REJECT").toUpperCase();
    if (!new Set(["ACCEPT", "REDUCE"]).has(normalized) || !(envelope.authorized_notional_eur > 0)) {
      envelope.state = "REJECTED";
      envelope.reason = "RISK_GOVERNOR_REJECT";
      envelope.updated_at = iso();
      envelope.retry_allowed = false;
      LIVE_IDS.delete(envelope.trade_id);
      audit(envelope, "RISK_REJECT", { decision: normalized });
      return envelope;
    }
    envelope.state = "RISK_APPROVED";
    envelope.risk_decision = normalized;
    envelope.updated_at = iso();
    audit(envelope, "RISK_APPROVE", { decision: normalized });
    return envelope;
  }

  function submit(envelope) {
    if (!guard(envelope, ["RISK_APPROVED"], "SUBMIT")) return envelope;
    const gate = safetyGateSnapshot();
    envelope.safety_gate = clone(gate) || gate;
    if (!gate.allowed) return safetyReject(envelope, "SUBMIT", gate);

    const authorizationKeyValue = authorizationKey(envelope);
    if (!authorizationKeyValue) return authorizationReject(envelope, "AUTHORIZATION_ID_REQUIRED");
    if (CONSUMED_AUTHORIZATIONS.has(authorizationKeyValue)) {
      return authorizationReject(envelope, "AUTHORIZATION_ALREADY_CONSUMED", authorizationKeyValue);
    }

    // JS execution is single-threaded here: check + consume is synchronous and
    // occurs immediately before the SUBMITTED transition. Never release this key.
    CONSUMED_AUTHORIZATIONS.add(authorizationKeyValue);
    envelope.authorization = {
      key: hash(authorizationKeyValue),
      source: authorizationKeyValue.split(":", 1)[0],
      consumed: true,
      consumed_at: iso()
    };
    envelope.state = "SUBMITTED";
    envelope.submitted_notional_eur = envelope.authorized_notional_eur;
    envelope.updated_at = iso();
    envelope.retry_allowed = false;
    audit(envelope, "SUBMIT_PAPER", {
      notional_eur: envelope.submitted_notional_eur,
      authorization_key_hash: envelope.authorization.key,
      authorization_source: envelope.authorization.source,
      authorization_consumed_once: true
    });
    return envelope;
  }

  function acknowledge(envelope) {
    if (!guard(envelope, ["SUBMITTED"], "ACK")) return envelope;
    envelope.state = "ACK";
    envelope.acknowledged_notional_eur = envelope.submitted_notional_eur;
    envelope.updated_at = iso();
    audit(envelope, "ACK_PAPER");
    return envelope;
  }

  function reject(envelope, reason = "PAPER_EXECUTION_REJECT") {
    if (!guard(envelope, ["SUBMITTED", "ACK"], "REJECT")) return envelope;
    envelope.state = "REJECTED";
    envelope.reason = reason;
    envelope.retry_allowed = false;
    envelope.updated_at = iso();
    LIVE_IDS.delete(envelope.trade_id);
    audit(envelope, "EXECUTION_REJECT", { reason });
    return envelope;
  }

  function cancel(envelope, reason = "PAPER_CANCEL") {
    if (!guard(envelope, ["SUBMITTED", "ACK", "PARTIAL"], "CANCEL")) return envelope;
    envelope.state = "CANCELED";
    envelope.reason = reason;
    envelope.retry_allowed = false;
    envelope.updated_at = iso();
    LIVE_IDS.delete(envelope.trade_id);
    audit(envelope, "CANCEL", { reason, filled_notional_eur: envelope.filled_notional_eur });
    return envelope;
  }

  function timeout(envelope) {
    if (!guard(envelope, ["SUBMITTED", "ACK", "PARTIAL"], "TIMEOUT")) return envelope;
    envelope.state = "RECONCILIATION_REQUIRED";
    envelope.timeout_at = iso();
    envelope.retry_allowed = false;
    envelope.updated_at = envelope.timeout_at;
    audit(envelope, "TIMEOUT_NO_RETRY", { blind_retry_forbidden: true });
    return envelope;
  }

  function fill(envelope, notionalEur, priceEur) {
    if (!guard(envelope, ["ACK", "PARTIAL"], "FILL")) return envelope;
    const remaining = Math.max(0, num(envelope.remaining_notional_eur));
    const amount = Math.max(0, Math.min(num(notionalEur), remaining));
    const price = num(priceEur);
    if (!(amount > 0) || !(price > 0)) {
      audit(envelope, "FILL_REFUSED_INVALID", { notional_eur: notionalEur, price_eur: priceEur });
      return envelope;
    }

    // A notional amount is EUR spent. Quantity bought is notional / unit price.
    // Average execution price must therefore be total notional / total quantity,
    // never Σ(notional×price) / total notional.
    const quantity = amount / price;
    envelope.fills.push({
      fill_id: `${envelope.trade_id}-F${String(envelope.fill_count + 1).padStart(2, "0")}`,
      at: iso(),
      notional_eur: amount,
      price_eur: price,
      quantity
    });
    envelope.fill_count += 1;
    envelope.filled_notional_eur = Math.min(envelope.authorized_notional_eur, num(envelope.filled_notional_eur) + amount);
    envelope.filled_quantity = envelope.fills.reduce((sum, row) => sum + Math.max(0, num(row.quantity, num(row.notional_eur) / Math.max(num(row.price_eur), 1e-12))), 0);
    envelope.remaining_notional_eur = Math.max(0, envelope.authorized_notional_eur - envelope.filled_notional_eur);
    envelope.fill_ratio = envelope.authorized_notional_eur > 0 ? envelope.filled_notional_eur / envelope.authorized_notional_eur : 0;
    envelope.average_fill_price_eur = envelope.filled_quantity > 0 ? envelope.filled_notional_eur / envelope.filled_quantity : null;
    envelope.state = envelope.remaining_notional_eur <= 1e-9 ? "FILLED" : "PARTIAL";
    envelope.updated_at = iso();
    audit(envelope, envelope.state === "FILLED" ? "FILL_COMPLETE" : "FILL_PARTIAL", {
      amount_eur: amount,
      quantity,
      average_fill_price_eur: envelope.average_fill_price_eur,
      filled_eur: envelope.filled_notional_eur,
      remaining_eur: envelope.remaining_notional_eur,
      fill_ratio: envelope.fill_ratio
    });
    return envelope;
  }

  function reconcile(envelope, observed = {}) {
    if (!guard(envelope, ["FILLED", "PARTIAL", "RECONCILIATION_REQUIRED"], "RECONCILE")) return envelope;
    const localFilled = Math.max(0, num(envelope.filled_notional_eur));
    const observedState = String(observed.state || (localFilled > 0 ? "FILLED" : "NOT_FOUND")).toUpperCase();
    const observedFilled = finite(observed.filled_notional_eur) ? Math.max(0, Number(observed.filled_notional_eur)) : null;
    const mismatchTolerance = Math.max(1e-9, Math.max(localFilled, observedFilled || 0) * 1e-6);

    envelope.reconciliation = {
      at: iso(),
      observed_state: observedState,
      observed_filled_notional_eur: observedFilled,
      local_filled_notional_eur: localFilled,
      source: "DETERMINISTIC_PAPER_SANDBOX",
      conflict: false
    };

    if (observedState === "NOT_FOUND") {
      if (localFilled <= 0) {
        envelope.state = "RECONCILED_NO_ORDER";
        envelope.reason = "OBSERVED_NOT_FOUND_NO_LOCAL_FILL";
        envelope.retry_allowed = false;
        LIVE_IDS.delete(envelope.trade_id);
        audit(envelope, "RECONCILE_NO_ORDER", envelope.reconciliation);
        return envelope;
      }
      envelope.reconciliation.conflict = true;
      envelope.state = "RECONCILIATION_REQUIRED";
      envelope.reason = "OBSERVED_NOT_FOUND_LOCAL_FILL_PRESENT";
      envelope.retry_allowed = false;
      audit(envelope, "RECONCILE_CONFLICT_NOT_FOUND_WITH_LOCAL_FILL", envelope.reconciliation);
      return envelope;
    }

    if (observedState === "FILLED" || observedState === "PARTIAL") {
      if (localFilled <= 0) {
        envelope.reconciliation.conflict = true;
        envelope.state = "RECONCILIATION_REQUIRED";
        envelope.reason = "OBSERVED_FILL_WITHOUT_LOCAL_FILL";
        envelope.retry_allowed = false;
        audit(envelope, "RECONCILE_CONFLICT_REMOTE_FILL_WITHOUT_LOCAL_FILL", envelope.reconciliation);
        return envelope;
      }
      if (observedFilled !== null && Math.abs(observedFilled - localFilled) > mismatchTolerance) {
        envelope.reconciliation.conflict = true;
        envelope.state = "RECONCILIATION_REQUIRED";
        envelope.reason = "POSITION_MISMATCH";
        envelope.retry_allowed = false;
        audit(envelope, "RECONCILE_CONFLICT_POSITION_MISMATCH", envelope.reconciliation);
        return envelope;
      }
      envelope.state = "RECONCILED";
      envelope.reason = null;
      envelope.retry_allowed = false;
      audit(envelope, "RECONCILE_MATCH", envelope.reconciliation);
      return envelope;
    }

    envelope.state = "RECONCILIATION_REQUIRED";
    envelope.reason = "OBSERVED_STATE_INCONCLUSIVE";
    envelope.retry_allowed = false;
    audit(envelope, "RECONCILE_INCONCLUSIVE", envelope.reconciliation);
    return envelope;
  }

  function protect(envelope, ok = true) {
    if (!guard(envelope, ["RECONCILED"], "PROTECT")) return envelope;
    envelope.protection = { required: true, state: ok ? "VERIFIED" : "FAILED", verified_at: iso() };
    envelope.state = ok ? "PROTECTED" : "STOP_UNPROTECTED";
    envelope.updated_at = iso();
    if (!ok) LIVE_IDS.delete(envelope.trade_id);
    audit(envelope, ok ? "PROTECTION_VERIFIED" : "PROTECTION_FAILED_STOP");
    return envelope;
  }

  function close(envelope, reason = "PAPER_CLOSE") {
    if (!guard(envelope, ["PROTECTED"], "CLOSE")) return envelope;
    envelope.state = "CLOSED";
    envelope.closed_at = iso();
    envelope.close_reason = reason;
    envelope.retry_allowed = false;
    envelope.updated_at = envelope.closed_at;
    LIVE_IDS.delete(envelope.trade_id);
    audit(envelope, "CLOSE", { reason });
    return envelope;
  }

  function runScenario(name, { render = true } = {}) {
    const tag = `${name}-${Date.now()}-${AUDIT.length}`;
    let e;
    switch (name) {
      case "HAPPY_PATH":
        e = createEnvelope({ decision_id: tag, trade_id: `PAPER-${hash(tag)}`, authorized_notional_eur: 50 });
        riskApprove(e); submit(e); acknowledge(e); fill(e, 50, 68650); reconcile(e, { state: "FILLED", filled_notional_eur: 50 }); protect(e, true); close(e, "TARGET_OR_PATIENT_EXIT");
        break;
      case "PARTIAL_FILL":
        e = createEnvelope({ decision_id: tag, trade_id: `PAPER-${hash(tag)}`, authorized_notional_eur: 50 });
        riskApprove(e); submit(e); acknowledge(e); fill(e, 20, 68640); fill(e, 30, 68660); reconcile(e, { state: "FILLED", filled_notional_eur: 50 }); protect(e, true); close(e, "PARTIAL_RECONCILED");
        break;
      case "EXECUTION_REJECT":
        e = createEnvelope({ decision_id: tag, trade_id: `PAPER-${hash(tag)}`, authorized_notional_eur: 50 });
        riskApprove(e); submit(e); reject(e, "VENUE_REJECT_SIMULATED");
        break;
      case "TIMEOUT_RECONCILE":
        e = createEnvelope({ decision_id: tag, trade_id: `PAPER-${hash(tag)}`, authorized_notional_eur: 50 });
        riskApprove(e); submit(e); timeout(e); reconcile(e, { state: "NOT_FOUND", filled_notional_eur: 0 });
        break;
      case "CANCEL_AFTER_ACK":
        e = createEnvelope({ decision_id: tag, trade_id: `PAPER-${hash(tag)}`, authorized_notional_eur: 50 });
        riskApprove(e); submit(e); acknowledge(e); cancel(e, "OPERATOR_CANCEL_SIMULATED");
        break;
      case "PROTECTION_FAILURE":
        e = createEnvelope({ decision_id: tag, trade_id: `PAPER-${hash(tag)}`, authorized_notional_eur: 50 });
        riskApprove(e); submit(e); acknowledge(e); fill(e, 50, 68650); reconcile(e, { state: "FILLED", filled_notional_eur: 50 }); protect(e, false);
        break;
      case "RECONCILE_CONTRADICTION":
        e = createEnvelope({ decision_id: tag, trade_id: `PAPER-${hash(tag)}`, authorized_notional_eur: 50 });
        riskApprove(e); submit(e); acknowledge(e); fill(e, 50, 68650); reconcile(e, { state: "NOT_FOUND", filled_notional_eur: 0 });
        break;
      case "DUPLICATE_ID": {
        const fixed = `PAPER-DUP-${hash(tag)}`;
        e = createEnvelope({ decision_id: tag, trade_id: fixed, authorized_notional_eur: 50 });
        const duplicate = createEnvelope({ decision_id: `${tag}-2`, trade_id: fixed, authorized_notional_eur: 50 });
        e = duplicate;
        LIVE_IDS.delete(fixed);
        break;
      }
      default:
        throw new Error(`Unknown lifecycle scenario: ${name}`);
    }
    if (render) renderResult(e);
    return clone(e);
  }

  function diagnosticSnapshot() {
    return {
      build: BUILD,
      live_ids: [...LIVE_IDS],
      consumed_authorizations: [...CONSUMED_AUTHORIZATIONS],
      audit: clone(AUDIT) || []
    };
  }

  function restoreInternal(snapshot) {
    AUDIT.splice(0, AUDIT.length, ...(clone(snapshot?.audit) || []));
    LIVE_IDS.clear();
    for (const id of snapshot?.live_ids || []) LIVE_IDS.add(id);
    CONSUMED_AUTHORIZATIONS.clear();
    for (const key of snapshot?.consumed_authorizations || []) CONSUMED_AUTHORIZATIONS.add(key);
  }

  function selfTest() {
    const saved = diagnosticSnapshot();
    const checks = [];
    try {
      const expected = {
        HAPPY_PATH: "CLOSED",
        PARTIAL_FILL: "CLOSED",
        EXECUTION_REJECT: "REJECTED",
        TIMEOUT_RECONCILE: "RECONCILED_NO_ORDER",
        CANCEL_AFTER_ACK: "CANCELED",
        PROTECTION_FAILURE: "STOP_UNPROTECTED",
        RECONCILE_CONTRADICTION: "RECONCILIATION_REQUIRED",
        DUPLICATE_ID: "REJECTED"
      };
      for (const [scenario, state] of Object.entries(expected)) {
        const result = runScenario(scenario, { render: false });
        checks.push({ scenario, expected: state, actual: result.state, pass: result.state === state });
        if (scenario === "TIMEOUT_RECONCILE") checks.push({ scenario: `${scenario}_NO_BLIND_RETRY`, expected: false, actual: result.retry_allowed, pass: result.retry_allowed === false });
        if (scenario === "RECONCILE_CONTRADICTION") checks.push({ scenario: `${scenario}_CONFLICT`, expected: true, actual: result.reconciliation?.conflict, pass: result.reconciliation?.conflict === true });
      }

      let avg = createEnvelope({ decision_id: "SELFTEST-AVERAGE", trade_id: `PAPER-AVG-${Date.now()}`, authorized_notional_eur: 200 });
      riskApprove(avg); submit(avg); acknowledge(avg); fill(avg, 100, 10); fill(avg, 100, 20);
      const expectedAvg = 200 / (100 / 10 + 100 / 20);
      checks.push({ scenario: "PARTIAL_FILL_AVERAGE_PRICE", expected: expectedAvg, actual: avg.average_fill_price_eur, pass: Math.abs(avg.average_fill_price_eur - expectedAvg) < 1e-9 });

      return { schema: "agent_crypto_strategy_a_paper_lifecycle_self_test_v2", build: BUILD, pass: checks.every(row => row.pass), checks, state_preservation: true };
    } finally {
      restoreInternal(saved);
      renderResult(null);
    }
  }

  function ensureStyle() {
    if (typeof document === "undefined") return;
    if (document.getElementById("strategyAPaperLifecycleStyle404295")) return;
    document.getElementById("strategyAPaperLifecycleStyle404291")?.remove();
    const style = document.createElement("style");
    style.id = "strategyAPaperLifecycleStyle404295";
    style.textContent = `
      #strategyAPaperLifecycle404291{margin-top:10px;padding:10px;border:1px solid rgba(255,211,112,.22);border-radius:10px;background:rgba(26,18,5,.45)}
      #strategyAPaperLifecycle404291 .spl-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap}
      #strategyAPaperLifecycle404291 .spl-title{font-size:9px;font-weight:950;letter-spacing:.09em;text-transform:uppercase;color:#ffe3a3}
      #strategyAPaperLifecycle404291 .spl-sub{margin-top:3px;font-size:8px;line-height:1.35;color:#a99b7c}
      #strategyAPaperLifecycle404291 .spl-actions{display:flex;gap:5px;flex-wrap:wrap;margin:9px 0}
      #strategyAPaperLifecycle404291 .spl-actions button{font-size:8px!important;min-height:28px!important}
      #strategyAPaperLifecycle404291 .spl-state{padding:8px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(0,0,0,.15);font-size:9px;color:#f5eee0}
      #strategyAPaperLifecycle404291 .spl-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:7px}
      #strategyAPaperLifecycle404291 .spl-kpi{padding:6px 7px;border:1px solid rgba(255,255,255,.06);border-radius:7px;background:rgba(255,255,255,.018)}
      #strategyAPaperLifecycle404291 .spl-kpi span{display:block;font-size:7px;letter-spacing:.06em;color:#8d8370;text-transform:uppercase;font-weight:900}
      #strategyAPaperLifecycle404291 .spl-kpi b{display:block;margin-top:3px;font-size:9px;color:#fff5dc;overflow-wrap:anywhere}
      #strategyAPaperLifecycle404291 .spl-safety{margin-top:7px;font-size:8px;line-height:1.35;color:#8f8a7c}
      @media(max-width:950px){#strategyAPaperLifecycle404291 .spl-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

  function renderResult(envelope) {
    if (typeof document === "undefined") return false;
    const panel = document.getElementById("strategyAPaperLifecycle404291");
    if (!panel) return false;
    const state = panel.querySelector("#strategyAPaperLifecycleState404291");
    if (state) state.textContent = envelope ? `${envelope.trade_id || "—"} · ${envelope.state || "—"}${envelope.reason ? ` · ${envelope.reason}` : ""}` : "Aucun scénario lifecycle exécuté.";
    const set = (id, value) => { const n = panel.querySelector(id); if (n) n.textContent = value; };
    set("#strategyAPaperLifecycleFilled404291", envelope ? `${num(envelope.filled_notional_eur).toFixed(2)} / ${num(envelope.authorized_notional_eur).toFixed(2)} €` : "—");
    set("#strategyAPaperLifecycleRemaining404291", envelope ? `${num(envelope.remaining_notional_eur).toFixed(2)} €` : "—");
    set("#strategyAPaperLifecycleRetry404291", envelope ? (envelope.retry_allowed ? "OUI" : "NON") : "—");
    set("#strategyAPaperLifecycleProtection404291", envelope?.protection?.state || "—");
    return true;
  }

  function render() {
    if (typeof document === "undefined") return false;
    ensureStyle();
    const anchor = document.getElementById("strategyAReplaySandbox404290") || document.getElementById("strategyAExperimentLedger404289");
    if (!anchor) return false;

    // Replace any legacy .291 panel to remove handlers closed over the superseded implementation.
    document.getElementById("strategyAPaperLifecycle404291")?.remove();
    const panel = document.createElement("section");
    panel.id = "strategyAPaperLifecycle404291";
    panel.setAttribute("data-strategy-a-paper-lifecycle-build", BUILD);
    panel.innerHTML = `<div class="spl-head"><div><div class="spl-title">PAPER V2 · EXECUTION / RECONCILIATION LIFECYCLE</div><div class="spl-sub">Trade Envelope unique · Safety Governor commun · autorisation consommable une seule fois · ACK · fill · reconciliation · protection · clôture. Gate 40.6.15.</div></div></div><div class="spl-actions" id="strategyAPaperLifecycleActions404291"></div><div class="spl-state" id="strategyAPaperLifecycleState404291">Aucun scénario lifecycle exécuté.</div><div class="spl-grid"><div class="spl-kpi"><span>Fill</span><b id="strategyAPaperLifecycleFilled404291">—</b></div><div class="spl-kpi"><span>Reste</span><b id="strategyAPaperLifecycleRemaining404291">—</b></div><div class="spl-kpi"><span>Retry autorisé</span><b id="strategyAPaperLifecycleRetry404291">—</b></div><div class="spl-kpi"><span>Protection</span><b id="strategyAPaperLifecycleProtection404291">—</b></div></div><div class="spl-safety">PAPER ONLY · Safety Governor + autorisation unique obligatoires au SUBMIT · une autorisation consommée ne renaît pas après clôture · aucun réseau · aucun Kraken.</div>`;
    anchor.insertAdjacentElement("afterend", panel);
    const actions = panel.querySelector("#strategyAPaperLifecycleActions404291");
    const labels = {
      HAPPY_PATH: "CYCLE COMPLET",
      PARTIAL_FILL: "PARTIAL FILL",
      EXECUTION_REJECT: "REJECT",
      TIMEOUT_RECONCILE: "TIMEOUT → RECONCILE",
      CANCEL_AFTER_ACK: "CANCEL",
      PROTECTION_FAILURE: "PROTECTION FAIL",
      RECONCILE_CONTRADICTION: "CONTRADICTION",
      DUPLICATE_ID: "DUPLICATE ID"
    };
    for (const [scenario, label] of Object.entries(labels)) {
      const button = document.createElement("button");
      button.type = "button"; button.className = "btn small"; button.textContent = label;
      button.addEventListener("click", () => runScenario(scenario));
      actions?.appendChild(button);
    }
    return true;
  }

  const api = Object.freeze({
    build: BUILD,
    schema: SCHEMA,
    create: createEnvelope,
    risk_approve: riskApprove,
    submit,
    acknowledge,
    fill,
    timeout,
    reconcile,
    protect,
    close,
    cancel,
    reject,
    run: runScenario,
    self_test: selfTest,
    audit: () => clone(AUDIT) || [],
    diagnostic_snapshot: diagnosticSnapshot,
    safety_gate_snapshot: safetyGateSnapshot,
    authorization_snapshot: authorizationSnapshot,
    render,
    terminal_states: [...TERMINAL],
    paper_only: true,
    isolated_from_live: true,
    blind_retry_forbidden: true,
    live_paper_ledger_mutated: false,
    experiment_ledger_mutated: false,
    storage_write: false,
    network: false,
    real_orders: false,
    kraken_network: false,
    corrective_lock_404295: true,
    common_safety_gate_406014: true,
    new_entry_fail_closed: true,
    existing_submitted_monitoring_preserved: true,
    single_use_authorization_406015: true,
    authorization_consumed_at_submit: true,
    authorization_reuse_forbidden: true
  });

  globalThis.AgentCryptoStrategyAPaperLifecycle404295 = api;
  // Compatibility owner: downstream .292/.293/.294 modules already address the .291 symbol.
  globalThis.AgentCryptoStrategyAPaperLifecycle404291 = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => render(), { once: true });
    else render();
  }
})();
