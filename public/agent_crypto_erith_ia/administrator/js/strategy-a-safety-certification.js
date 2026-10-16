/*
  Agent-Crypto Administrator — Strategy A Auto A safety governor integration
  Build: 40.6.163
  Responsibility: circuit-break NEW Auto A Paper entries while preserving the
  ability to monitor/reconcile an already-open local Paper position.
  Manual reset never restarts Auto A. Micro-live stays LOCKED.
  40.6.163: preserve the canonical 40.6.159 explicit foundation terrain receipt
  across reloads without rerunning tests, storage writes or fabricated PASS.
*/
(() => {
  "use strict";
  const BUILD="40.6.163";
  const SCHEMA="agent_crypto_strategy_a_safety_certification_v3";
  const LEVELS=Object.freeze(["NORMAL","PAUSE","DEFENSIVE","EMERGENCY"]);
  const FOUNDATION_RECEIPT=Object.freeze({
    schema:"agent_crypto_strategy_a_foundation_receipt_v1",
    source_build:"40.6.159",
    source_handoff:"coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_FINAL_HANDOFF_40.6.160.md",
    result:"PASS",
    pass:true,
    at:"2026-09-15T23:27:11.071Z",
    gates:Object.freeze({2:"FOUNDATION_PASS",7:"FOUNDATION_PASS"}),
    terrain_proof:true,
    operator_action:true,
    automatic:false,
    immutable:true
  });
  const state={level:"NORMAL",reason:"INITIAL",history:[],runtime_errors:0};
  let lastFoundationTest=null;
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const stamp=(action,detail={})=>{const row={at:new Date().toISOString(),action,level:state.level,reason:state.reason,detail:clone(detail)||{}};state.history.push(row);if(state.history.length>100)state.history.splice(0,state.history.length-100);return row;};
  function foundationTruth(){
    const session=clone(lastFoundationTest);
    const explicit=!!session;
    const pass=explicit?session.pass===true:FOUNDATION_RECEIPT.pass===true;
    return {
      schema:"agent_crypto_strategy_a_foundation_truth_v1",
      build:BUILD,
      pass,
      source:explicit?"SESSION_EXPLICIT_TEST":"CANONICAL_TERRAIN_RECEIPT",
      receipt:clone(FOUNDATION_RECEIPT),
      session_test:session,
      implicit_tests_executed:false,
      storage_write:false
    };
  }
  function setLevel(level,reason,detail={}){if(!LEVELS.includes(level))throw new Error(`Unknown safety level ${level}`);state.level=level;state.reason=String(reason||"UNSPECIFIED");stamp("LEVEL_CHANGE",detail);render();return snapshot();}
  function signal(kind,detail={}){
    const k=String(kind||"").toUpperCase();
    if(k==="DATA_STALE")return setLevel("PAUSE","DATA_STALE",detail);
    if(k==="AUTO_RUNTIME_ERROR"){state.runtime_errors+=1;return setLevel(state.runtime_errors>=2?"DEFENSIVE":"PAUSE",state.runtime_errors>=2?"REPEATED_AUTO_RUNTIME_ERRORS":"AUTO_RUNTIME_ERROR",{...detail,runtime_errors:state.runtime_errors});}
    if(k==="REPEATED_ERRORS")return setLevel("DEFENSIVE","REPEATED_ERRORS_CIRCUIT_BREAKER",detail);
    if(k==="EVIDENCE_PIPELINE_FAILURE")return setLevel("PAUSE","EVIDENCE_PIPELINE_FAILURE",detail);
    if(k==="LIFECYCLE_BRIDGE_FAILURE"||k==="UNKNOWN_EXECUTION_STATE")return setLevel("DEFENSIVE",k,{...detail,blind_retry_forbidden:true});
    if(k==="PROTECTION_FAILURE")return setLevel("EMERGENCY","PROTECTION_FAILURE",detail);
    if(k==="POSITION_MISMATCH")return setLevel("EMERGENCY","POSITION_MISMATCH",detail);
    stamp("SIGNAL_IGNORED",{kind:k,...detail});return snapshot();
  }
  function manualReset(reason="HUMAN_VALIDATION"){
    state.level="NORMAL";state.reason=String(reason);state.runtime_errors=0;stamp("MANUAL_GOVERNOR_RESET",{automatic_resume:false,auto_start:false});render();return snapshot();
  }
  function snapshot(){return {schema:SCHEMA,build:BUILD,level:state.level,reason:state.reason,history:clone(state.history)||[],runtime_errors:state.runtime_errors,automatic_live_resume:false,automatic_auto_a_resume:false,new_trades_allowed:state.level==="NORMAL",existing_paper_monitoring_allowed:true,paper_only:true,real_orders:false,network:false,auto_a_governor_connected:true,micro_live_locked:true,foundation_truth:foundationTruth()};}
  function passiveModule(name,api){return {name,available:!!api,build:api?.build||null,last_self_test:lastFoundationTest?.modules?.[name]||null};}
  function certificationMatrix(){
    const replay=globalThis.AgentCryptoStrategyAReplay;
    const lifecycle=globalThis.AgentCryptoStrategyAPaperLifecycle;
    const metrics=globalThis.AgentCryptoStrategyAAfterCostMetrics;
    const bridge=globalThis.AgentCryptoStrategyAAutoLifecycleBridge;
    const m=metrics?.summary?.()||{trades:0,sample_state:"INSUFFICIENT_SAMPLE",sample_min:30,cost_model_complete:false};
    const foundation=foundationTruth();
    const tested=foundation.pass===true;
    const foundationLabel=foundation.source==="CANONICAL_TERRAIN_RECEIPT"?"receipt terrain 40.6.159":"test explicite de cette session";
    return {schema:"agent_crypto_strategy_a_certification_matrix_v3",build:BUILD,generated_at:new Date().toISOString(),modules:{deterministic_replay:passiveModule("deterministic_replay",replay),paper_lifecycle:passiveModule("paper_lifecycle",lifecycle),auto_lifecycle_bridge:passiveModule("auto_lifecycle_bridge",bridge),after_cost_metrics:passiveModule("after_cost_metrics",metrics)},gates:[
      {gate:1,label:"QUALITÉ DES DONNÉES",state:"EVIDENCE_REQUIRED"},
      {gate:2,label:"COHÉRENCE LOGIQUE",state:tested?"FOUNDATION_PASS":"EVIDENCE_REQUIRED",note:`Fondation : ${foundationLabel} · ${tested?"PASS":"NON PASS"}.`},
      {gate:3,label:"BACKTEST RÉALISTE",state:"PENDING"},{gate:4,label:"OUT-OF-SAMPLE",state:"PENDING"},{gate:5,label:"WALK-FORWARD",state:"PENDING"},{gate:6,label:"MONTE CARLO / STRESS",state:"PENDING"},
      {gate:7,label:"CHAOS TESTING",state:tested?"FOUNDATION_PASS":"EVIDENCE_REQUIRED",note:`Circuit breaker raccordé aux nouvelles entrées Auto A ; position Paper ouverte reste monitorable. Fondation : ${foundationLabel} · ${tested?"PASS":"NON PASS"}.`},
      {gate:8,label:"PAPER TRADING",state:String(m.sample_state||"INSUFFICIENT_SAMPLE"),note:`${Number(m.trades||0)} trade(s) après coûts · coût complet=${m.cost_model_complete===true?"oui":"non"}.`},
      {gate:9,label:"MICRO-LIVE CONTRÔLÉ",state:"LOCKED"}
    ],foundation_proof:foundation,safety:snapshot(),profitability_claim:false,certified_for_live:false,paper_only:true,real_orders:false,passive_read:true,implicit_self_tests:false,auto_a_governor_connected:true};
  }
  function runFoundationTests(){
    const replay=globalThis.AgentCryptoStrategyAReplay,lifecycle=globalThis.AgentCryptoStrategyAPaperLifecycle,metrics=globalThis.AgentCryptoStrategyAAfterCostMetrics,bridge=globalThis.AgentCryptoStrategyAAutoLifecycleBridge;
    const call=api=>{try{return api?.self_test?.()||{pass:!!api,reason:api?"NO_SELF_TEST_REQUIRED":"UNAVAILABLE"};}catch(error){return {pass:false,error:String(error?.message||error)}}};
    const modules={deterministic_replay:call(replay),paper_lifecycle:call(lifecycle),after_cost_metrics:call(metrics),auto_lifecycle_bridge:{pass:bridge?.preflight?.().ready===true}};
    const pass=Object.values(modules).every(x=>x?.pass===true);
    lastFoundationTest={at:new Date().toISOString(),pass,modules:clone(modules)||{},source:"EXPLICIT_OPERATOR_ACTION"};
    render();
    return clone(lastFoundationTest);
  }
  function selfTest(){
    const saved=clone(state),savedFoundation=clone(lastFoundationTest);
    try{
      lastFoundationTest=null;
      const receiptPass=foundationTruth().pass===true&&foundationTruth().source==="CANONICAL_TERRAIN_RECEIPT";
      lastFoundationTest={at:"SELF_TEST",pass:false,modules:{},source:"SELF_TEST"};
      const explicitFailOverrides=foundationTruth().pass===false&&foundationTruth().source==="SESSION_EXPLICIT_TEST";
      lastFoundationTest={at:"SELF_TEST",pass:true,modules:{},source:"SELF_TEST"};
      const explicitPassOverrides=foundationTruth().pass===true&&foundationTruth().source==="SESSION_EXPLICIT_TEST";
      signal("DATA_STALE");const a=state.level==="PAUSE";
      manualReset();signal("UNKNOWN_EXECUTION_STATE");const b=state.level==="DEFENSIVE";
      manualReset();signal("PROTECTION_FAILURE");const c=state.level==="EMERGENCY";
      manualReset();const d=state.level==="NORMAL"&&snapshot().new_trades_allowed===true&&snapshot().automatic_auto_a_resume===false;
      return {schema:"agent_crypto_strategy_a_safety_self_test_v4",build:BUILD,pass:a&&b&&c&&d&&receiptPass&&explicitFailOverrides&&explicitPassOverrides,checks:{data_pause:a,unknown_defensive:b,protection_emergency:c,manual_reset_does_not_autostart:d,canonical_receipt_restored_without_execution:receiptPass,explicit_session_fail_overrides_receipt:explicitFailOverrides,explicit_session_pass_overrides_receipt:explicitPassOverrides}};
    }finally{
      state.level=saved.level;state.reason=saved.reason;state.history=saved.history||[];state.runtime_errors=saved.runtime_errors||0;lastFoundationTest=savedFoundation;render();
    }
  }
  function exportJson(){const payload={...certificationMatrix(),foundation_receipt:clone(FOUNDATION_RECEIPT),foundation_truth:foundationTruth(),last_foundation_test:clone(lastFoundationTest)};if(typeof document!=="undefined"){const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="STRATEGY_A_CERTIFICATION_MATRIX.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),0);}return payload;}
  function ensureStyle(){if(typeof document==="undefined")return;if(document.getElementById("strategyASafetyStyle"))return;const st=document.createElement("style");st.id="strategyASafetyStyle";st.textContent=`#strategyASafety{margin-top:10px;padding:10px;border:1px solid rgba(255,159,122,.25);border-radius:10px;background:rgba(29,12,7,.44)}#strategyASafety .sac-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}#strategyASafety .sac-title{font-size:9px;font-weight:950;letter-spacing:.09em;color:#ffc9ac;text-transform:uppercase}#strategyASafety .sac-sub{font-size:8px;color:#a58d81;margin-top:3px}#strategyASafety .sac-actions{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0}#strategyASafety .sac-level{padding:7px;border-radius:8px;border:1px solid rgba(255,255,255,.07);font-size:9px;color:#f6eee9}#strategyASafety .sac-proof{margin-top:6px;padding:6px 7px;border:1px solid rgba(102,240,171,.18);border-radius:7px;background:rgba(12,45,31,.18);font-size:8px;color:#9be8bd}#strategyASafety .sac-gates{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:7px}#strategyASafety .sac-g{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px}#strategyASafety .sac-g span{font-size:7px;color:#947f76;display:block}#strategyASafety .sac-g b{font-size:8px;color:#f7eee9;display:block;margin-top:2px}@media(max-width:950px){#strategyASafety .sac-gates{grid-template-columns:1fr}}`;document.head.appendChild(st);}
  function render(){
    if(typeof document==="undefined")return false;
    ensureStyle();
    const anchor=document.getElementById("strategyAAfterCost")||document.getElementById("strategyAPaperLifecycle");
    if(!anchor)return false;
    document.getElementById("strategyASafety")?.remove();
    const p=document.createElement("section");
    p.id="strategyASafety";
    p.innerHTML=`<div class="sac-head"><div><div class="sac-title">STRATEGY A · SAFETY GOVERNOR</div><div class="sac-sub">Auto A raccordé · bloque les NOUVELLES entrées hors NORMAL · monitoring/clôture d’un Paper ouvert préservés.</div></div><button class="btn small" id="strategyASafetyExport" type="button">EXPORTER MATRICE</button></div><div class="sac-actions"><button class="btn small" data-safety="DATA_STALE">DATA STALE</button><button class="btn small" data-safety="UNKNOWN_EXECUTION_STATE">UNKNOWN</button><button class="btn small" data-safety="PROTECTION_FAILURE">PROTECTION FAIL</button><button class="btn small" data-safety="RUN_TESTS">TESTS EXPLICITES</button><button class="btn small" data-safety="RESET">RESET GOUVERNEUR</button></div><div class="sac-level" data-safety-level>—</div><div class="sac-proof" data-foundation-proof>—</div><div class="sac-gates" data-safety-gates></div>`;
    anchor.insertAdjacentElement("afterend",p);
    p.querySelectorAll("[data-safety]").forEach(b=>b.addEventListener("click",()=>b.dataset.safety==="RESET"?manualReset():b.dataset.safety==="RUN_TESTS"?runFoundationTests():signal(b.dataset.safety)));
    p.querySelector("#strategyASafetyExport")?.addEventListener("click",exportJson);
    const snap=snapshot(),matrix=certificationMatrix(),foundation=matrix.foundation_proof;
    p.querySelector("[data-safety-level]").textContent=`${snap.level} · ${snap.reason} · Auto A raccordé : OUI · nouveaux trades : ${snap.new_trades_allowed?"OUI":"NON"} · reprise auto : NON`;
    p.querySelector("[data-foundation-proof]").textContent=foundation.source==="CANONICAL_TERRAIN_RECEIPT"
      ?`Fondation : RECEIPT PASS · terrain 40.6.159 · ${FOUNDATION_RECEIPT.at} · aucun test relancé`
      :`Fondation : ${foundation.pass?"PASS":"FAIL / INCOMPLET"} · test explicite de cette session · ${foundation.session_test?.at||"—"}`;
    const g=p.querySelector("[data-safety-gates]");
    for(const row of matrix.gates){const d=document.createElement("div");d.className="sac-g";d.innerHTML=`<span>GATE ${row.gate} · ${row.label}</span><b>${row.state}</b>`;g.appendChild(d);}
    return true;
  }
  const api=Object.freeze({build:BUILD,schema:SCHEMA,signal,manual_reset:manualReset,manual_reset_sandbox:manualReset,snapshot,certification_matrix:certificationMatrix,run_foundation_tests:runFoundationTests,foundation_receipt:()=>clone(FOUNDATION_RECEIPT),foundation_truth:foundationTruth,self_test:selfTest,export_json:exportJson,render,levels:LEVELS,automatic_live_resume:false,automatic_auto_a_resume:false,paper_only:true,real_orders:false,network:false,storage_write:false,passive_read:true,implicit_self_tests:false,auto_a_governor_connected:true});
  globalThis.AgentCryptoStrategyASafetyCertification=api;
  if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();}
})();
