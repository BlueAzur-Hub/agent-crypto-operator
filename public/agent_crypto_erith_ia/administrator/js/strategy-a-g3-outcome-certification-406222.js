/* Agent-Crypto @erith.IA — 40.6.222 G3 POST-HORIZON OUTCOME CERTIFICATION
   Read-only certification receipt over the existing 40.6.214 post-horizon owner.
   It certifies only descriptive outcome labels that are already present in the
   certified market series after joined PAPER T0 decisions. It never creates a
   Gate-3 PASS, never rewrites T0, never applies the current Oracle to the past,
   and never produces an economic-performance verdict.
   PAPER ONLY · G3 PENDING · G9 LOCKED. */
(() => {
  "use strict";

  const BUILD = "40.6.222";
  const OWNER = "POST_HORIZON_OUTCOME_CERTIFICATION_OWNER";
  const ROOT_ID = "strategyAG3OutcomeCertification406222";
  const HOST_ID = "strategyAEvidenceSupplements";
  const OUTCOME_ID = "strategyAG3PostHorizonOutcome";
  const REQUIRED_HORIZONS = Object.freeze([5, 15, 60]);
  let queued = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const esc = v => String(v ?? "—").replace(/[&<>\"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[m]));
  const finite = v => { const n = Number(v); return Number.isFinite(n) ? n : null; };
  const safe = (fn, fallback = null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; } };

  function certify(sourceOverride = undefined) {
    const source = sourceOverride === undefined
      ? safe(globalThis.AgentCryptoStrategyAG3PostHorizonOutcome?.snapshot, null)
      : sourceOverride;

    const blockers = [];
    const rows = [];

    if (!source) blockers.push("POST_HORIZON_OWNER_UNAVAILABLE");
    if (source && source.replay_dataset !== "READY_FOR_DECISION_REPLAY") blockers.push("REPLAY_DATASET_NOT_READY");
    if (source && !(Number(source.joined_decisions) > 0)) blockers.push("NO_JOINED_DECISION");
    if (source && source.current_oracle_applied_to_past !== false) blockers.push("ORACLE_RETROACTIVE_RISK");
    if (source && source.future_outcomes_used_as_t0_input !== false) blockers.push("FUTURE_INPUT_RISK");
    if (source && source.lookahead !== false) blockers.push("LOOKAHEAD_RISK");
    if (source && source.gate_promotion !== false) blockers.push("UNSAFE_GATE_PROMOTION_FLAG");
    if (source && source.real_order !== false) blockers.push("REAL_ORDER_FLAG");

    const decisions = Array.isArray(source?.decisions) ? source.decisions : [];
    for (const decision of decisions) {
      const t0 = Date.parse(String(decision?.t0_at || ""));
      if (!Number.isFinite(t0)) {
        blockers.push(`T0_UNPROVEN:${decision?.id || "UNKNOWN"}`);
        continue;
      }

      for (const h of REQUIRED_HORIZONS) {
        const item = decision?.horizons?.[`t${h}`] || null;
        const target = Date.parse(String(item?.target_at || ""));
        const matched = Date.parse(String(item?.matched_at || ""));
        const price = finite(item?.price);
        const change = finite(item?.change_pct);

        let status = "CERTIFIED";
        if (item?.status !== "CERTIFIED") status = String(item?.status || "WAITING");
        else if (!Number.isFinite(target)) status = "TARGET_TIME_UNPROVEN";
        else if (!Number.isFinite(matched)) status = "MATCH_TIME_UNPROVEN";
        else if (!(matched > t0)) status = "MATCH_NOT_AFTER_T0";
        else if (!(matched >= target)) status = "MATCH_BEFORE_TARGET";
        else if (!(price > 0)) status = "PRICE_INVALID";
        else if (change === null) status = "CHANGE_UNPROVEN";

        if (status !== "CERTIFIED") blockers.push(`${decision?.id || "UNKNOWN"}:T${h}:${status}`);
        rows.push(Object.freeze({
          decision_id: decision?.id || null,
          asset: decision?.asset || null,
          decision: decision?.decision || null,
          t0_at: decision?.t0_at || null,
          horizon_min: h,
          target_at: item?.target_at || null,
          matched_at: item?.matched_at || null,
          price,
          change_pct: change,
          direction: item?.direction || null,
          source_status: item?.status || null,
          certification_status: status
        }));
      }
    }

    const expected = decisions.length * REQUIRED_HORIZONS.length;
    const certified = rows.filter(row => row.certification_status === "CERTIFIED").length;

    if (expected === 0) blockers.push("NO_OUTCOME_ROWS");
    if (source && Number(source.expected_horizons) !== expected) blockers.push("OWNER_EXPECTED_COUNT_MISMATCH");
    if (source && Number(source.certified_horizons) !== certified) blockers.push("OWNER_CERTIFIED_COUNT_MISMATCH");
    if (source && source.outcome_labels === "CERTIFIED" && certified !== expected) blockers.push("OWNER_CERTIFIED_FLAG_INCONSISTENT");

    const pass = blockers.length === 0 && expected > 0 && certified === expected;
    const state = pass ? "OUTCOME_LABELS_CERTIFIED"
      : certified > 0 ? "OUTCOME_LABELS_PARTIAL"
      : source ? "WAITING_POST_HORIZON_DATA"
      : "OWNER_UNAVAILABLE";

    return Object.freeze({
      schema: "agent_crypto_g3_outcome_certification_receipt_v1",
      build: BUILD,
      owner: OWNER,
      source_build: source?.build || null,
      source_state: source?.state || null,
      replay_dataset: source?.replay_dataset || "NOT_READY",
      joined_decisions: decisions.length,
      horizons_min: REQUIRED_HORIZONS.slice(),
      certified_horizons: certified,
      expected_horizons: expected,
      outcome_labels: pass ? "CERTIFIED" : "NOT_CERTIFIED",
      state,
      pass,
      blockers: Object.freeze([...new Set(blockers)]),
      rows: Object.freeze(rows),
      current_oracle_applied_to_past: false,
      future_outcomes_used_as_t0_input: false,
      lookahead: false,
      economic_backtest: false,
      profitability_claim: false,
      gate_promotion: false,
      paper_only: true,
      real_order: false,
      g3: "PENDING",
      g9: "LOCKED"
    });
  }

  function ensureStyle() {
    if (typeof document === "undefined" || byId(`${ROOT_ID}Style`)) return;
    const style = document.createElement("style");
    style.id = `${ROOT_ID}Style`;
    style.textContent = `
      #${ROOT_ID}{margin-top:8px;padding:9px 10px;border:1px solid rgba(112,246,194,.26);border-radius:9px;background:rgba(4,29,25,.34)}
      #${ROOT_ID} .goc-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;flex-wrap:wrap}
      #${ROOT_ID} .goc-title{font:950 9px/1.3 system-ui,sans-serif;letter-spacing:.08em;color:#9fffd5;text-transform:uppercase}
      #${ROOT_ID} .goc-state{font:950 9px/1 system-ui,sans-serif;padding:5px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12);color:#fff0bd}
      #${ROOT_ID}[data-pass="true"] .goc-state{color:#a8ffd2;border-color:rgba(120,255,190,.28)}
      #${ROOT_ID} .goc-sub{margin-top:4px;font:650 8px/1.4 system-ui,sans-serif;color:#8fb4aa}
      #${ROOT_ID} .goc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px;margin-top:8px}
      #${ROOT_ID} .goc-k{padding:7px;border:1px solid rgba(255,255,255,.07);border-radius:7px;background:rgba(1,12,13,.28)}
      #${ROOT_ID} .goc-k span{display:block;font:750 7px/1.2 system-ui,sans-serif;color:#7ea79c;text-transform:uppercase}
      #${ROOT_ID} .goc-k b{display:block;margin-top:2px;font:950 9px/1.25 system-ui,sans-serif;color:#eefefa}
      #${ROOT_ID} .goc-note{margin-top:7px;font:650 8px/1.45 system-ui,sans-serif;color:#89a9a1}
    `;
    document.head.appendChild(style);
  }

  function render() {
    const receipt = certify();
    if (typeof document === "undefined") return receipt;
    const host = byId(HOST_ID);
    if (!host) return receipt;

    ensureStyle();
    let root = byId(ROOT_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = ROOT_ID;
    }

    const outcome = byId(OUTCOME_ID);
    if (outcome?.parentElement === host) outcome.insertAdjacentElement("afterend", root);
    else if (root.parentElement !== host) host.appendChild(root);

    root.dataset.build = BUILD;
    root.dataset.pass = String(receipt.pass);
    root.dataset.readOnly = "true";

    const blockerText = receipt.blockers.length
      ? receipt.blockers.slice(0, 4).join(" · ")
      : "AUCUN — labels post-T0 certifiés";

    root.innerHTML = `
      <div class="goc-head">
        <div>
          <div class="goc-title">G3 · CERTIFICATION DES RÉSULTATS APRÈS DÉCISION · ${BUILD}</div>
          <div class="goc-sub">Preuve descriptive seulement : aucune conclusion de rendement et aucun PASS automatique de Gate 3.</div>
        </div>
        <div class="goc-state">${esc(receipt.state)}</div>
      </div>
      <div class="goc-grid">
        <div class="goc-k"><span>Décisions raccordées</span><b>${esc(receipt.joined_decisions)}</b></div>
        <div class="goc-k"><span>Horizons certifiés</span><b>${esc(receipt.certified_horizons)} / ${esc(receipt.expected_horizons)}</b></div>
        <div class="goc-k"><span>Outcome labels</span><b>${esc(receipt.outcome_labels)}</b></div>
        <div class="goc-k"><span>Replay dataset</span><b>${esc(receipt.replay_dataset)}</b></div>
        <div class="goc-k"><span>Gate 3</span><b>PENDING</b></div>
      </div>
      <div class="goc-note">État : ${esc(blockerText)}. T+5 / T+15 / T+60 restent strictement postérieurs au T0 ; le futur ne réécrit jamais la décision.</div>`;
    return receipt;
  }

  function selfTest() {
    const sample = Object.freeze({
      build:"40.6.214",
      replay_dataset:"READY_FOR_DECISION_REPLAY",
      joined_decisions:1,
      expected_horizons:3,
      certified_horizons:3,
      outcome_labels:"CERTIFIED",
      current_oracle_applied_to_past:false,
      future_outcomes_used_as_t0_input:false,
      lookahead:false,
      gate_promotion:false,
      real_order:false,
      decisions:[{
        id:"A-TEST",
        asset:"BTC",
        decision:"NO_TRADE",
        t0_at:"2026-09-17T00:00:00.000Z",
        horizons:{
          t5:{status:"CERTIFIED",target_at:"2026-09-17T00:05:00.000Z",matched_at:"2026-09-17T00:05:00.000Z",price:101,change_pct:1,direction:"UP"},
          t15:{status:"CERTIFIED",target_at:"2026-09-17T00:15:00.000Z",matched_at:"2026-09-17T00:15:00.000Z",price:99,change_pct:-1,direction:"DOWN"},
          t60:{status:"CERTIFIED",target_at:"2026-09-17T01:00:00.000Z",matched_at:"2026-09-17T01:00:00.000Z",price:100,change_pct:0,direction:"FLAT"}
        }
      }]
    });
    const valid = certify(sample);
    const invalid = certify({...sample, decisions:[{...sample.decisions[0], horizons:{...sample.decisions[0].horizons, t60:{...sample.decisions[0].horizons.t60,status:"WAITING",matched_at:null,price:null,change_pct:null}}}], certified_horizons:2, outcome_labels:"NOT_CERTIFIED"});
    const checks = Object.freeze({
      valid_pass: valid.pass === true && valid.outcome_labels === "CERTIFIED" && valid.certified_horizons === 3,
      waiting_does_not_pass: invalid.pass === false && invalid.outcome_labels === "NOT_CERTIFIED",
      gate_stays_pending: valid.g3 === "PENDING",
      no_economic_backtest: valid.economic_backtest === false,
      no_real_order: valid.real_order === false
    });
    return Object.freeze({schema:"agent_crypto_g3_outcome_certification_self_test_v1",build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }

  function schedule() {
    if (queued) return;
    queued = true;
    const run = () => { queued = false; render(); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  globalThis.AgentCryptoStrategyAG3OutcomeCertification = Object.freeze({
    build: BUILD,
    owner: OWNER,
    root_id: ROOT_ID,
    snapshot: certify,
    render,
    schedule,
    self_test: selfTest,
    certification_scope: "POST_T0_DESCRIPTIVE_OUTCOME_LABELS_ONLY",
    recurring_timer: false,
    observer: false,
    storage_write: false,
    business_network_request: false,
    current_oracle_applied_to_past: false,
    future_outcomes_used_as_t0_input: false,
    economic_backtest: false,
    gate_promotion: false,
    live_unlock: false,
    real_order: false,
    paper_only: true,
    g3: "PENDING",
    g9: "LOCKED"
  });

  if (typeof document !== "undefined") {
    document.addEventListener("agent-crypto:evidence-data-changed", schedule);
    document.addEventListener("agent-crypto:evidence-refresh-complete", schedule);
    document.addEventListener("agent-crypto:market-series-updated", schedule);
    window.addEventListener("pageshow", schedule);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, {once:true});
    else schedule();
  }
})();