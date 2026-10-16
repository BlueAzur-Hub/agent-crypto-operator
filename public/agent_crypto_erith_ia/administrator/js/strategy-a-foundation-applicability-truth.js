/* Agent-Crypto @erith.IA — 40.6.191 FOUNDATION PROOF INTEGRITY
   Current PASS requires an explicit test bound to the exact currently loaded
   module builds. Historical/unbound receipts stay evidence only. UI, API and
   export use the same canonical truth. PAPER ONLY; no order path added. */
(() => {
  "use strict";

  const BUILD = "40.6.191";
  const STORAGE_KEY = "agent_crypto_foundation_strict_406191";
  const original = globalThis.AgentCryptoStrategyASafetyCertification || null;
  if (!original) return;

  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const safe = (fn, fallback = null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; } };
  const REQUIRED = Object.freeze({
    deterministic_replay: Object.freeze(["self_test"]),
    paper_lifecycle: Object.freeze(["self_test"]),
    after_cost_metrics: Object.freeze(["self_test"]),
    auto_lifecycle_bridge: Object.freeze(["self_test", "preflight"])
  });

  function moduleFacts(apis = null) {
    const source = apis || {
      deterministic_replay: globalThis.AgentCryptoStrategyAReplay,
      paper_lifecycle: globalThis.AgentCryptoStrategyAPaperLifecycle,
      after_cost_metrics: globalThis.AgentCryptoStrategyAAfterCostMetrics,
      auto_lifecycle_bridge: globalThis.AgentCryptoStrategyAAutoLifecycleBridge
    };
    const out = {};
    for (const [name, required] of Object.entries(REQUIRED)) {
      const api = source[name] || null;
      const missing = required.filter(method => typeof api?.[method] !== "function");
      const build = api?.build == null || String(api.build).trim() === "" ? null : String(api.build).trim();
      out[name] = { name, available: !!api, build, required_methods: required.slice(), missing_methods: missing, compatible: !!api && missing.length === 0, version_bindable: !!api && missing.length === 0 && !!build };
    }
    return out;
  }

  function testedManifest(facts) {
    const out = {};
    for (const [name, row] of Object.entries(facts || {})) out[name] = { build: row?.build || null, required_methods: Array.isArray(row?.required_methods) ? row.required_methods.slice() : [], compatible: row?.compatible === true };
    return out;
  }

  function readLatest() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.schema === "agent_crypto_foundation_strict_result_v2" ? parsed : null;
    } catch (_) { return null; }
  }

  function persistLatest(result) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result)); return true; }
    catch (_) { return false; }
  }

  function bindingTruth(latest, current) {
    const tested = latest?.tested_modules;
    if (!latest || !tested || typeof tested !== "object") return { bound: false, match: false, reason: latest ? "TEST_RESULT_UNBOUND" : "NO_EXPLICIT_TEST" };
    for (const [name, row] of Object.entries(current || {})) {
      const prior = tested[name];
      if (!row?.compatible) return { bound: true, match: false, reason: `CURRENT_MODULE_INCOMPLETE:${name}` };
      if (!row?.version_bindable) return { bound: false, match: false, reason: `CURRENT_BUILD_UNBOUND:${name}` };
      if (!prior || prior.compatible !== true || !prior.build) return { bound: false, match: false, reason: `TESTED_BUILD_UNBOUND:${name}` };
      if (String(prior.build) !== String(row.build)) return { bound: true, match: false, reason: `BUILD_DRIFT:${name}:${prior.build}->${row.build}` };
      const required = Array.isArray(row.required_methods) ? row.required_methods : [];
      const testedRequired = Array.isArray(prior.required_methods) ? prior.required_methods : [];
      if (required.some(method => !testedRequired.includes(method))) return { bound: true, match: false, reason: `METHOD_CONTRACT_DRIFT:${name}` };
    }
    return { bound: true, match: true, reason: "EXACT_CURRENT_MODULE_BUILDS" };
  }

  function evaluateProof(latest, facts, receipt) {
    const rows = facts || {};
    const applicable = Object.values(rows).length === Object.keys(REQUIRED).length && Object.values(rows).every(row => row?.compatible === true);
    const bindable = applicable && Object.values(rows).every(row => row?.version_bindable === true);
    const binding = bindingTruth(latest, rows);
    const explicitPass = latest?.pass === true && latest?.status === "PASS";
    const pass = explicitPass && applicable && bindable && binding.match === true;
    let source = "NO_CURRENT_FOUNDATION_PROOF";
    if (latest) source = pass ? "EXPLICIT_TEST_EXACT_CURRENT_BUILDS" : binding.reason;
    else if (receipt?.pass === true) source = "HISTORICAL_RECEIPT_UNBOUND";
    return { applicable, bindable, binding, pass, source };
  }

  function foundationTruth() {
    const receipt = safe(original.foundation_receipt, null);
    const current = moduleFacts();
    const latest = readLatest();
    const proof = evaluateProof(latest, current, receipt);
    return { schema: "agent_crypto_foundation_applicability_truth_v2", build: BUILD, pass: proof.pass, source: proof.source, historical_receipt: clone(receipt), historical_receipt_pass: receipt?.pass === true, historical_receipt_current_pass: false, current_modules: current, applicability_complete: proof.applicable, version_binding_complete: proof.bindable, tested_builds_match_current: proof.binding.match === true, binding_reason: proof.binding.reason, latest_explicit_test: clone(latest), explicit_result_persists_across_reload_in_session: true, explicit_result_requires_exact_current_builds: true, missing_method_is_pass: false, unbound_receipt_is_current_pass: false, implicit_tests_executed: false, storage_scope: "sessionStorage" };
  }

  function strictCall(name, api, extra = null) {
    if (!api) return { name, pass: false, status: "INCOMPLETE", reason: "UNAVAILABLE" };
    if (typeof api.self_test !== "function") return { name, pass: false, status: "INCOMPLETE", reason: "SELF_TEST_MISSING" };
    try {
      const result = api.self_test();
      if (result?.pass !== true) return { name, pass: false, status: "FAIL", result: clone(result) };
      if (typeof extra === "function") {
        const extraResult = extra(api);
        if (extraResult?.pass !== true) return { name, pass: false, status: "INCOMPLETE", reason: extraResult?.reason || "PREFLIGHT_NOT_READY", result: clone(result) };
      }
      return { name, pass: true, status: "PASS", result: clone(result) };
    } catch (error) { return { name, pass: false, status: "FAIL", error: String(error?.message || error) }; }
  }

  function runFoundationTests() {
    const facts = moduleFacts();
    const modules = {
      deterministic_replay: strictCall("deterministic_replay", globalThis.AgentCryptoStrategyAReplay),
      paper_lifecycle: strictCall("paper_lifecycle", globalThis.AgentCryptoStrategyAPaperLifecycle),
      after_cost_metrics: strictCall("after_cost_metrics", globalThis.AgentCryptoStrategyAAfterCostMetrics),
      auto_lifecycle_bridge: strictCall("auto_lifecycle_bridge", globalThis.AgentCryptoStrategyAAutoLifecycleBridge, api => {
        if (typeof api.preflight !== "function") return { pass: false, reason: "PREFLIGHT_MISSING" };
        const p = api.preflight();
        return { pass: p?.ready === true, reason: p?.ready === true ? null : String(p?.blocked_reason || "PREFLIGHT_NOT_READY") };
      })
    };
    const testsPass = Object.values(modules).every(row => row.pass === true);
    const bindable = Object.values(facts).every(row => row.version_bindable === true);
    const pass = testsPass && bindable;
    const result = { schema: "agent_crypto_foundation_strict_result_v2", build: BUILD, at: new Date().toISOString(), pass, status: pass ? "PASS" : Object.values(modules).some(row => row.status === "INCOMPLETE") || !bindable ? "INCOMPLETE" : "FAIL", modules, tested_modules: testedManifest(facts), exact_build_binding_required: true, source: "EXPLICIT_OPERATOR_ACTION", historical_receipt_used_as_test_result: false };
    persistLatest(result);
    render();
    if (typeof document !== "undefined") try { document.dispatchEvent(new CustomEvent("agent-crypto:evidence-data-changed", { detail: { owner: "foundation-applicability", build: BUILD } })); } catch (_) {}
    return clone(result);
  }

  function certificationMatrix() {
    const base = safe(original.certification_matrix, { gates: [] }) || { gates: [] };
    const truth = foundationTruth();
    const gates = (Array.isArray(base.gates) ? base.gates : []).map(row => ({ ...row }));
    const currentState = truth.pass === true ? "FOUNDATION_PASS" : truth.applicability_complete ? "EVIDENCE_REQUIRED" : "INCOMPLETE";
    for (const gateNumber of [2, 7]) {
      const gate = gates.find(row => Number(row.gate) === gateNumber);
      if (!gate) continue;
      gate.state = currentState;
      gate.note = truth.pass === true ? `Fondation courante : test explicite lié aux builds chargés (${truth.source}).` : truth.applicability_complete ? `Fondation non certifiée pour les builds courants : ${truth.source}.` : `Fondation INCOMPLETE : module ou méthode requise indisponible. Aucun ancien PASS n'est réutilisé.`;
    }
    return { ...base, build: BUILD, gates, modules: truth.current_modules, foundation_proof: truth, certified_for_live: false, paper_only: true, real_orders: false, implicit_self_tests: false };
  }

  function snapshot() {
    const base = safe(original.snapshot, {}) || {};
    return { ...base, build: BUILD, foundation_truth: foundationTruth(), micro_live_locked: true, real_orders: false };
  }

  function exportJson() {
    const payload = { ...certificationMatrix(), exported_at: new Date().toISOString(), foundation_truth: foundationTruth(), export_owner: "strategy-a-foundation-applicability-truth.js", export_uses_same_canonical_truth_as_ui: true };
    if (typeof document !== "undefined" && typeof Blob !== "undefined" && typeof URL !== "undefined") {
      const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" });
      const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = "STRATEGY_A_CERTIFICATION_MATRIX.json"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }
    return clone(payload);
  }

  function patchView() {
    if (typeof document === "undefined") return false;
    const panel = document.getElementById("strategyASafety");
    if (!panel) return false;
    const truth = foundationTruth();
    const proof = panel.querySelector("[data-foundation-proof]");
    if (proof) {
      const latest = truth.latest_explicit_test;
      proof.textContent = truth.pass ? `Fondation actuelle : PASS · builds exacts testés ${latest?.at || "—"}` : truth.applicability_complete ? `Fondation actuelle : PREUVES REQUISES · ${truth.source} · ancien PASS non promu` : `Fondation actuelle : INCOMPLETE · module/méthode requis absent · ancien PASS non promu`;
    }
    const matrix = certificationMatrix();
    const nodes = panel.querySelectorAll(".sac-g");
    for (const node of nodes) {
      const label = node.querySelector("span")?.textContent || "";
      const match = label.match(/GATE\s+(\d+)/i);
      const gate = matrix.gates.find(row => Number(row.gate) === Number(match?.[1]));
      if (gate) { const b = node.querySelector("b"); if (b) b.textContent = gate.state; }
    }
    panel.dataset.foundationApplicabilityBuild = BUILD;
    panel.dataset.foundationApplicability = truth.applicability_complete ? "COMPLETE" : "INCOMPLETE";
    panel.dataset.foundationPass = truth.pass ? "true" : "false";
    return true;
  }

  function render() { try { original.render?.(); } catch (_) {} return patchView(); }

  function interceptRunTests(event) {
    const button = event?.target?.closest?.("[data-safety]");
    if (!button || button.dataset.safety !== "RUN_TESTS") return;
    event.preventDefault(); event.stopImmediatePropagation(); runFoundationTests();
  }

  function interceptExport(event) {
    const button = event?.target?.closest?.("#strategyASafetyExport");
    if (!button) return;
    event.preventDefault(); event.stopImmediatePropagation(); exportJson();
  }

  function selfTest() {
    const facts = {
      deterministic_replay: { compatible: true, version_bindable: true, build: "A", required_methods: ["self_test"] },
      paper_lifecycle: { compatible: true, version_bindable: true, build: "B", required_methods: ["self_test"] },
      after_cost_metrics: { compatible: true, version_bindable: true, build: "C", required_methods: ["self_test"] },
      auto_lifecycle_bridge: { compatible: true, version_bindable: true, build: "D", required_methods: ["self_test", "preflight"] }
    };
    const latest = { pass: true, status: "PASS", tested_modules: testedManifest(facts) };
    const exact = evaluateProof(latest, facts, { pass: true });
    const driftFacts = clone(facts); driftFacts.deterministic_replay.build = "A2";
    const drift = evaluateProof(latest, driftFacts, { pass: true });
    const missingFacts = clone(facts); missingFacts.paper_lifecycle.compatible = false; missingFacts.paper_lifecycle.version_bindable = false;
    const missing = evaluateProof(latest, missingFacts, { pass: true });
    const receiptOnly = evaluateProof(null, facts, { pass: true });
    const pass = exact.pass === true && drift.pass === false && missing.pass === false && receiptOnly.pass === false;
    return { schema: "agent_crypto_foundation_applicability_self_test_v2", build: BUILD, pass, checks: { exact_current_builds_pass: exact.pass === true, stale_explicit_pass_rejected_on_build_drift: drift.pass === false, explicit_pass_rejected_when_module_missing: missing.pass === false, historical_unbound_receipt_not_current_pass: receiptOnly.pass === false } };
  }

  const wrapped = Object.freeze({ ...original, build: BUILD, snapshot, certification_matrix: certificationMatrix, run_foundation_tests: runFoundationTests, foundation_truth: foundationTruth, export_json: exportJson, self_test_applicability: selfTest, render, foundation_applicability_truth_406191: true, explicit_result_session_persistence: true, explicit_result_exact_build_binding: true, historical_unbound_receipt_is_current_pass: false, missing_self_test_is_pass: false });
  globalThis.AgentCryptoStrategyASafetyCertification = wrapped;

  if (typeof document !== "undefined") {
    document.addEventListener("click", interceptRunTests, true);
    document.addEventListener("click", interceptExport, true);
    document.addEventListener("agent-crypto:runtime-modules-ready", render, { once: true });
    document.addEventListener("erith:system-hydrated", render, { passive: true });
    window.addEventListener("pageshow", render);
    queueMicrotask(render);
  }
})();
