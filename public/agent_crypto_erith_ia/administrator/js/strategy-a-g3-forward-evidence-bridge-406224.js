/* Agent-Crypto @erith.IA — 40.6.224 G3 FORWARD EVIDENCE BRIDGE
   Presentation/read-only bridge: reconciles the legacy Gate-3 audit wording with
   the canonical 40.6.222 outcome certification and 40.6.223 realistic-readiness truth.
   It never changes a Gate state, never runs a backtest, and never creates evidence. */
(() => {
  "use strict";

  const BUILD = "40.6.224";
  const OWNER = "G3_FORWARD_EVIDENCE_BRIDGE";
  const AUDIT_ID = "strategyAEvidenceGateAudit";
  let queued = false;

  const safe = (fn, fallback=null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; } };

  function snapshot() {
    const outcome = safe(globalThis.AgentCryptoStrategyAG3OutcomeCertification?.snapshot, null);
    const readiness = safe(globalThis.AgentCryptoStrategyAG3RealisticReplayReadiness?.snapshot, null);
    const certified = outcome?.pass === true && outcome?.outcome_labels === "CERTIFIED";
    const ready = readiness?.ready === true;
    const blockers = Array.isArray(readiness?.blockers) ? readiness.blockers.slice() : [];
    return Object.freeze({
      schema:"agent_crypto_g3_forward_evidence_bridge_v1",
      build:BUILD,
      owner:OWNER,
      outcome_labels_certified:certified,
      certified_horizons:Number(outcome?.certified_horizons||0),
      expected_horizons:Number(outcome?.expected_horizons||0),
      replay_dataset:outcome?.replay_dataset||"NOT_READY",
      realistic_replay_ready:ready,
      realistic_state:readiness?.state||"UNAVAILABLE",
      blockers:Object.freeze(blockers),
      g3:"PENDING",
      gate_state_changed:false,
      paper_only:true,
      real_order:false
    });
  }

  function humanBlocker(code) {
    const map = {
      REPLAY_DATASET_NOT_READY:"dataset de replay non prêt",
      OUTCOME_LABELS_NOT_CERTIFIED:"résultats post-T0 non certifiés",
      AFTER_COST_OWNER_UNAVAILABLE:"owner after-cost indisponible",
      NO_AFTER_COST_PAPER_EVIDENCE:"aucune preuve PAPER after-cost certifiable",
      AFTER_COST_COST_MODEL_INCOMPLETE:"coûts d’exécution incomplets",
      AFTER_COST_LEDGER_NOT_VERIFIED:"comptabilité after-cost non vérifiée",
      PARTIAL_FILL_LIFECYCLE_UNPROVEN:"partial fills non prouvés",
      LATENCY_MODEL_UNPROVEN:"latence non prouvée",
      LIQUIDITY_MODEL_UNPROVEN:"liquidité non prouvée"
    };
    return map[code] || String(code || "preuve inconnue");
  }

  function findG3Row() {
    const audit = document.getElementById(AUDIT_ID);
    if (!audit) return null;
    return Array.from(audit.querySelectorAll(".saga-row")).find(row =>
      String(row.querySelector(".saga-n")?.textContent || "").trim() === "03"
    ) || null;
  }

  function render() {
    const s = snapshot();
    if (typeof document === "undefined") return s;
    const row = findG3Row();
    if (!row) return s;

    const proof = row.querySelector(".saga-proof");
    const state = row.querySelector(".saga-state");
    if (!proof || !state) return s;

    const market = s.replay_dataset === "READY_FOR_DECISION_REPLAY" ? "replay marché PRÊT" : `replay ${s.replay_dataset}`;
    const outcomes = s.outcome_labels_certified
      ? `résultats post-T0 CERTIFIÉS ${s.certified_horizons}/${s.expected_horizons}`
      : `résultats post-T0 ${s.certified_horizons}/${s.expected_horizons}`;
    const next = s.realistic_replay_ready
      ? "Contrat de réalisme complet : le backtest réaliste peut être exécuté par un owner dédié, sans promotion automatique."
      : `Reste à prouver : ${s.blockers.slice(0,5).map(humanBlocker).join(" · ") || "réalisme d’exécution"}.`;

    proof.innerHTML = `<b>Preuve canonique :</b> ${market} · ${outcomes}.<span class="saga-next"><b>Suite :</b> ${next}</span>`;
    state.textContent = "WAIT";
    row.dataset.forwardBridge = BUILD;
    row.dataset.canonicalOutcomeLabels = s.outcome_labels_certified ? "CERTIFIED" : "NOT_CERTIFIED";
    row.dataset.realisticReplayReady = String(s.realistic_replay_ready);
    return s;
  }

  function schedule() {
    if (queued || typeof document === "undefined") return;
    queued = true;
    const run=()=>{queued=false;render();};
    try{requestAnimationFrame(()=>requestAnimationFrame(run));}catch(_){queueMicrotask(run);}
  }

  function selfTest() {
    const s=snapshot();
    const checks=Object.freeze({
      never_promotes_gate:s.g3==="PENDING"&&s.gate_state_changed===false,
      read_only:true,
      paper_only:s.paper_only===true,
      no_real_order:s.real_order===false
    });
    return Object.freeze({schema:"agent_crypto_g3_forward_evidence_bridge_self_test_v1",build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }

  globalThis.AgentCryptoStrategyAG3ForwardEvidenceBridge=Object.freeze({
    build:BUILD,owner:OWNER,snapshot,render,schedule,self_test:selfTest,
    presentation_only:true,certification_mutation:false,gate_promotion:false,
    recurring_timer:false,observer:false,storage_write:false,business_network_request:false,
    paper_only:true,real_order:false,g3:"PENDING",g9:"LOCKED"
  });

  if(typeof document!=="undefined"){
    document.addEventListener("agent-crypto:evidence-data-changed",schedule);
    document.addEventListener("agent-crypto:evidence-refresh-complete",schedule);
    document.addEventListener("agent-crypto:runtime-modules-ready",schedule);
    window.addEventListener("pageshow",schedule);
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});
    else schedule();
  }
})();