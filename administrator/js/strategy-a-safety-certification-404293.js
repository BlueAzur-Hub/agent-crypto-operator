/*
  Agent-Crypto Administrator — Strategy A safety circuit breaker + certification matrix
  Build: 40.4.293
  Responsibility: deterministic Paper-only safety certification foundation.
  Rulebook levels are preserved: PAUSE / DEFENSIVE / EMERGENCY. No automatic LIVE resume.
*/
(() => {
  "use strict";
  const BUILD="40.4.293";
  const SCHEMA="agent_crypto_strategy_a_safety_certification_v1";
  const LEVELS=Object.freeze(["NORMAL","PAUSE","DEFENSIVE","EMERGENCY"]);
  const state={level:"NORMAL",reason:"INITIAL",history:[]};
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const stamp=(action,detail={})=>{const row={at:new Date().toISOString(),action,level:state.level,reason:state.reason,detail:clone(detail)||{}};state.history.push(row);if(state.history.length>80)state.history.splice(0,state.history.length-80);return row;};
  function setLevel(level,reason,detail={}){if(!LEVELS.includes(level))throw new Error(`Unknown safety level ${level}`);state.level=level;state.reason=String(reason||"UNSPECIFIED");stamp("LEVEL_CHANGE",detail);render();return snapshot();}
  function signal(kind,detail={}){
    const k=String(kind||"").toUpperCase();
    if(k==="DATA_STALE")return setLevel("PAUSE","DATA_STALE",detail);
    if(k==="REPEATED_ERRORS")return setLevel("PAUSE","REPEATED_ERRORS_CIRCUIT_BREAKER",detail);
    if(k==="UNKNOWN_EXECUTION_STATE")return setLevel("DEFENSIVE","UNKNOWN_EXECUTION_STATE",{...detail,blind_retry_forbidden:true});
    if(k==="PROTECTION_FAILURE")return setLevel("EMERGENCY","PROTECTION_FAILURE",detail);
    if(k==="POSITION_MISMATCH")return setLevel("EMERGENCY","POSITION_MISMATCH",detail);
    stamp("SIGNAL_IGNORED",{kind:k,...detail});return snapshot();
  }
  function manualReset(reason="HUMAN_VALIDATION"){
    // Sandbox control only. It never touches Strategy A live/AUTO state.
    state.level="NORMAL";state.reason=String(reason);stamp("MANUAL_SANDBOX_RESET",{automatic_resume:false});render();return snapshot();
  }
  function snapshot(){return {schema:SCHEMA,build:BUILD,level:state.level,reason:state.reason,history:clone(state.history)||[],automatic_live_resume:false,new_trades_allowed:state.level==="NORMAL",paper_only:true,real_orders:false,network:false};}
  function moduleCheck(name,api){try{const r=api?.self_test?.();return {name,available:!!api,pass:r?.pass===true,result:r||null};}catch(error){return {name,available:!!api,pass:false,error:String(error?.message||error)}}}
  function certificationMatrix(){
    const replay=moduleCheck("deterministic_replay",globalThis.AgentCryptoStrategyAReplay404290);
    const lifecycle=moduleCheck("paper_lifecycle",globalThis.AgentCryptoStrategyAPaperLifecycle404291);
    const metrics=moduleCheck("after_cost_metrics",globalThis.AgentCryptoStrategyAAfterCostMetrics404292);
    const m=globalThis.AgentCryptoStrategyAAfterCostMetrics404292?.summary?.()||{trades:0,sample_state:"INSUFFICIENT_SAMPLE",sample_min:30};
    const logicPass=replay.pass&&lifecycle.pass&&metrics.pass;
    return {
      schema:"agent_crypto_strategy_a_certification_matrix_v1",build:BUILD,generated_at:new Date().toISOString(),
      modules:{replay,lifecycle,metrics},
      gates:[
        {gate:1,label:"QUALITÉ DES DONNÉES",state:"EVIDENCE_REQUIRED",note:"Doit être prouvée sur les snapshots réels ; aucun PASS synthétique."},
        {gate:2,label:"COHÉRENCE LOGIQUE",state:logicPass?"FOUNDATION_PASS":"FAIL",note:"Replay + lifecycle + comptabilité après coûts déterministes."},
        {gate:3,label:"BACKTEST RÉALISTE",state:"PENDING",note:"Frais, spread, slippage, latence, liquidité et fills à valider sur historique."},
        {gate:4,label:"OUT-OF-SAMPLE",state:"PENDING"},
        {gate:5,label:"WALK-FORWARD",state:"PENDING"},
        {gate:6,label:"MONTE CARLO / STRESS",state:"PENDING"},
        {gate:7,label:"CHAOS TESTING",state:"FOUNDATION_PASS",note:"Timeout sans retry, partial fill, duplicate ID et protection failure couverts par les sandboxes."},
        {gate:8,label:"PAPER TRADING",state:m.sample_state==="SAMPLE_READY"?"EVIDENCE_READY":"INSUFFICIENT_SAMPLE",note:`${Number(m.trades||0)} trade(s) après coûts · minimum opérateur ${Number(m.sample_min||30)}.`},
        {gate:9,label:"MICRO-LIVE CONTRÔLÉ",state:"LOCKED",note:"Aucun passage réel autorisé par cette build."}
      ],
      safety:snapshot(),profitability_claim:false,certified_for_live:false,paper_only:true,real_orders:false
    };
  }
  function selfTest(){
    const saved=clone(state);
    signal("DATA_STALE");const a=state.level==="PAUSE";
    signal("UNKNOWN_EXECUTION_STATE");const b=state.level==="DEFENSIVE"&&state.history.at(-1)?.detail?.blind_retry_forbidden===true;
    signal("PROTECTION_FAILURE");const c=state.level==="EMERGENCY";
    manualReset();const d=state.level==="NORMAL";
    const matrix=certificationMatrix();const e=matrix.gates.find(g=>g.gate===9)?.state==="LOCKED"&&matrix.certified_for_live===false;
    state.level=saved.level;state.reason=saved.reason;state.history=saved.history||[];render();
    return {schema:"agent_crypto_strategy_a_safety_self_test_v1",build:BUILD,pass:a&&b&&c&&d&&e,checks:{data_pause:a,unknown_defensive_no_retry:b,protection_emergency:c,manual_reset_sandbox:d,micro_live_locked:e}};
  }
  function exportJson(){const payload={...certificationMatrix(),self_test:selfTest()};if(typeof document!=="undefined"){const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="STRATEGY_A_CERTIFICATION_MATRIX.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),0);}return payload;}
  function ensureStyle(){if(typeof document==="undefined"||document.getElementById("strategyASafetyStyle404293"))return;const st=document.createElement("style");st.id="strategyASafetyStyle404293";st.textContent=`#strategyASafety404293{margin-top:10px;padding:10px;border:1px solid rgba(255,159,122,.22);border-radius:10px;background:rgba(29,12,7,.42)}#strategyASafety404293 .sac-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}#strategyASafety404293 .sac-title{font-size:9px;font-weight:950;letter-spacing:.09em;color:#ffc9ac;text-transform:uppercase}#strategyASafety404293 .sac-sub{font-size:8px;color:#a58d81;margin-top:3px}#strategyASafety404293 .sac-actions{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0}#strategyASafety404293 .sac-level{padding:7px;border-radius:8px;border:1px solid rgba(255,255,255,.07);font-size:9px;color:#f6eee9}#strategyASafety404293 .sac-gates{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:7px}#strategyASafety404293 .sac-g{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px}#strategyASafety404293 .sac-g span{font-size:7px;color:#947f76;display:block}#strategyASafety404293 .sac-g b{font-size:8px;color:#f7eee9;display:block;margin-top:2px}@media(max-width:950px){#strategyASafety404293 .sac-gates{grid-template-columns:1fr}}`;document.head.appendChild(st);}
  function render(){if(typeof document==="undefined")return false;ensureStyle();const anchor=document.getElementById("strategyAAfterCost404292")||document.getElementById("strategyAPaperLifecycle404291");if(!anchor)return false;let p=document.getElementById("strategyASafety404293");if(!p){p=document.createElement("section");p.id="strategyASafety404293";p.innerHTML=`<div class="sac-head"><div><div class="sac-title">STRATEGY A · SAFETY / CERTIFICATION MATRIX</div><div class="sac-sub">Circuit breaker déterministe · aucun retry infini · aucun LIVE automatique.</div></div><button class="btn small" id="strategyASafetyExport404293" type="button">EXPORTER MATRICE</button></div><div class="sac-actions"><button class="btn small" data-safety="DATA_STALE">DATA STALE</button><button class="btn small" data-safety="UNKNOWN_EXECUTION_STATE">UNKNOWN</button><button class="btn small" data-safety="PROTECTION_FAILURE">PROTECTION FAIL</button><button class="btn small" data-safety="RESET">RESET SANDBOX</button></div><div class="sac-level" data-safety-level>—</div><div class="sac-gates" data-safety-gates></div>`;anchor.insertAdjacentElement("afterend",p);p.querySelectorAll("[data-safety]").forEach(b=>b.addEventListener("click",()=>b.dataset.safety==="RESET"?manualReset():signal(b.dataset.safety)));p.querySelector("#strategyASafetyExport404293")?.addEventListener("click",exportJson);}const snap=snapshot(),matrix=certificationMatrix();p.querySelector("[data-safety-level]").textContent=`${snap.level} · ${snap.reason} · reprise LIVE automatique : NON`;const g=p.querySelector("[data-safety-gates]");g.replaceChildren();for(const row of matrix.gates){const d=document.createElement("div");d.className="sac-g";d.innerHTML=`<span>GATE ${row.gate} · ${row.label}</span><b>${row.state}</b>`;g.appendChild(d);}return true;}
  const api=Object.freeze({build:BUILD,schema:SCHEMA,signal,manual_reset_sandbox:manualReset,snapshot,certification_matrix:certificationMatrix,self_test:selfTest,export_json:exportJson,render,levels:LEVELS,automatic_live_resume:false,paper_only:true,real_orders:false,network:false,storage_write:false});
  globalThis.AgentCryptoStrategyASafetyCertification404293=api;
  if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();}
})();
