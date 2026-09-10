/*
  Agent-Crypto Administrator — Strategy A Paper V2 evidence dossier + dataset readiness
  Build: 40.4.294
  Responsibility: aggregate existing Paper evidence without upgrading PENDING gates into fake PASS.
  No backtest fabrication, no network, no exchange call, no real order.
*/
(() => {
  "use strict";
  const BUILD="40.4.294";
  const SCHEMA="agent_crypto_strategy_a_evidence_dossier_v1";
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  function datasetReadiness(rows=[]){
    const list=(Array.isArray(rows)?rows:[]).filter(r=>r&&typeof r==="object");
    const ids=new Set(),dups=[];let chronological=true,last=-Infinity,complete=0;
    for(const row of list){const id=String(row.trade_id||row.cycle_id||row.replay_id||"");if(id){if(ids.has(id))dups.push(id);ids.add(id);}const t=Date.parse(row.at||row.captured_at||row.timestamp||row.created_at||"");if(Number.isFinite(t)){if(t<last)chronological=false;last=Math.max(last,t);}if(row.trade_id&&Number.isFinite(Number(row.net_pnl_eur)))complete++;}
    return {schema:"agent_crypto_strategy_a_dataset_readiness_v1",build:BUILD,rows:list.length,unique_ids:ids.size,duplicate_ids:[...new Set(dups)],chronological,after_cost_complete_rows:complete,backtest_ready:false,out_of_sample_ready:false,walk_forward_ready:false,monte_carlo_ready:complete>=30,reason:list.length?"Evidence collected; historical market replay dataset and certified outcome labels still required.":"No evidence rows supplied.",fabricated_data:false};
  }
  function safeCall(fn,fallback=null){try{return typeof fn==="function"?fn():fallback;}catch(error){return {error:String(error?.message||error)}}}
  function snapshot(){
    const experiment=globalThis.AgentCryptoStrategyAExperimentLedger404289;
    const replay=globalThis.AgentCryptoStrategyAReplay404290;
    const lifecycle=globalThis.AgentCryptoStrategyAPaperLifecycle404291;
    const metrics=globalThis.AgentCryptoStrategyAAfterCostMetrics404292;
    const safety=globalThis.AgentCryptoStrategyASafetyCertification404293;
    const experimentRows=safeCall(experiment?.read,[])||[];
    const afterRows=safeCall(metrics?.read,[])||[];
    const safetyMatrix=safeCall(safety?.certification_matrix,{gates:[]})||{gates:[]};
    const metricsSummary=safeCall(metrics?.summary,{trades:0,sample_state:"INSUFFICIENT_SAMPLE"})||{};
    const replayTest=safeCall(replay?.self_test,{pass:false});
    const lifecycleTest=safeCall(lifecycle?.self_test,{pass:false});
    const metricsTest=safeCall(metrics?.self_test,{pass:false});
    const safetyTest=safeCall(safety?.self_test,{pass:false});
    const deterministicPass=[replayTest,lifecycleTest,metricsTest,safetyTest].every(r=>r?.pass===true);
    const gates=(Array.isArray(safetyMatrix.gates)?safetyMatrix.gates:[]).map(g=>({...g}));
    const unresolved=gates.filter(g=>!["FOUNDATION_PASS","PASS"].includes(String(g.state))).map(g=>({gate:g.gate,state:g.state,label:g.label}));
    return {
      schema:SCHEMA,build:BUILD,generated_at:new Date().toISOString(),
      deterministic_foundation:{pass:deterministicPass,replay:replayTest,lifecycle:lifecycleTest,after_cost:metricsTest,safety:safetyTest},
      experiment_ledger:{summary:safeCall(experiment?.summary,{}),cycles:clone(experimentRows)||[]},
      after_cost:{summary:metricsSummary,trades:clone(afterRows)||[]},
      dataset:{experiment:datasetReadiness(experimentRows),after_cost:datasetReadiness(afterRows)},
      certification:{gates,unresolved,certified_for_live:false,micro_live_locked:true},
      next_evidence:["historical realistic backtest dataset","out-of-sample holdout","walk-forward windows","Monte Carlo / stress after adequate Paper outcome sample","continued real Paper observation"],
      paper_only:true,real_orders:false,network:false,credentials:false,wallet:false,profitability_claim:false,fabricated_backtest:false
    };
  }
  function selfTest(){const ds=datasetReadiness([{trade_id:"A",at:"2026-01-01T00:00:00Z",net_pnl_eur:1},{trade_id:"A",at:"2026-01-02T00:00:00Z",net_pnl_eur:-1}]);const d=snapshot();const pass=ds.duplicate_ids.length===1&&ds.backtest_ready===false&&d.certification.certified_for_live===false&&d.fabricated_backtest===false&&d.paper_only===true;return {schema:"agent_crypto_strategy_a_evidence_dossier_self_test_v1",build:BUILD,pass,checks:{duplicate_detection:ds.duplicate_ids.length===1,no_fake_backtest:ds.backtest_ready===false&&!d.fabricated_backtest,micro_live_locked:d.certification.micro_live_locked===true,paper_only:d.paper_only===true}};}
  function exportJson(){const payload=snapshot();if(typeof document!=="undefined"){const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="STRATEGY_A_EVIDENCE_DOSSIER.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),0);}return payload;}
  function ensureStyle(){if(typeof document==="undefined"||document.getElementById("strategyADossierStyle404294"))return;const st=document.createElement("style");st.id="strategyADossierStyle404294";st.textContent=`#strategyADossier404294{margin-top:10px;padding:10px;border:1px solid rgba(132,174,255,.22);border-radius:10px;background:rgba(7,15,31,.48)}#strategyADossier404294 .sad-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}#strategyADossier404294 .sad-title{font-size:9px;font-weight:950;letter-spacing:.09em;color:#bdd2ff;text-transform:uppercase}#strategyADossier404294 .sad-sub{font-size:8px;color:#8598b7;margin-top:3px}#strategyADossier404294 .sad-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin-top:8px}#strategyADossier404294 .sad-k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px}#strategyADossier404294 .sad-k span{font-size:7px;color:#7588a7;display:block;text-transform:uppercase}#strategyADossier404294 .sad-k b{font-size:9px;color:#edf3ff;display:block;margin-top:3px}#strategyADossier404294 .sad-foot{font-size:8px;color:#8190a9;margin-top:7px}@media(max-width:950px){#strategyADossier404294 .sad-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;document.head.appendChild(st);}
  function render(){if(typeof document==="undefined")return false;ensureStyle();const anchor=document.getElementById("strategyASafety404293")||document.getElementById("strategyAAfterCost404292");if(!anchor)return false;let p=document.getElementById("strategyADossier404294");if(!p){p=document.createElement("section");p.id="strategyADossier404294";p.innerHTML=`<div class="sad-head"><div><div class="sad-title">STRATEGY A · PAPER V2 · EVIDENCE DOSSIER</div><div class="sad-sub">Ce dossier distingue ce qui est prouvé, ce qui est seulement testé, et ce qui reste PENDING.</div></div><button class="btn small" id="strategyADossierExport404294" type="button">EXPORTER DOSSIER</button></div><div class="sad-grid"><div class="sad-k"><span>Fondation déterministe</span><b data-sad="det">—</b></div><div class="sad-k"><span>Cycles réels</span><b data-sad="cycles">0</b></div><div class="sad-k"><span>Trades après coûts</span><b data-sad="trades">0</b></div><div class="sad-k"><span>Gates non soldés</span><b data-sad="pending">—</b></div><div class="sad-k"><span>Micro-live</span><b data-sad="live">LOCKED</b></div></div><div class="sad-foot">Aucun backtest inventé · aucun résultat de rentabilité fabriqué · PAPER ONLY. Le prochain opérateur peut reprendre directement depuis ce dossier.</div>`;anchor.insertAdjacentElement("afterend",p);p.querySelector("#strategyADossierExport404294")?.addEventListener("click",exportJson);}const d=snapshot();const set=(k,v)=>{const n=p.querySelector(`[data-sad="${k}"]`);if(n)n.textContent=v;};set("det",d.deterministic_foundation.pass?"PASS":"À VÉRIFIER");set("cycles",num(d.experiment_ledger?.summary?.cycles));set("trades",num(d.after_cost?.summary?.trades));set("pending",d.certification.unresolved.length);set("live","LOCKED");return true;}
  const api=Object.freeze({build:BUILD,schema:SCHEMA,snapshot,dataset_readiness:datasetReadiness,self_test:selfTest,export_json:exportJson,render,paper_only:true,real_orders:false,network:false,profitability_claim:false,fabricated_backtest:false});
  globalThis.AgentCryptoStrategyAEvidenceDossier404294=api;
  if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();}
})();
