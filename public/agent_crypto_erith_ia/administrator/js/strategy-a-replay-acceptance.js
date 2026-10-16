/* Agent-Crypto Administrator — Strategy A Replay Acceptance Matrix
   Build: 40.6.192 · Acceptance requires both the 7 deterministic paths and
   proof that self-test left the replay result store unchanged.
   No automatic execution. No live ledger mutation, network, storage, timer or observer. */
(() => {
  "use strict";
  const BUILD="40.6.192";
  const EXPECTED=Object.freeze({PASS_TO_PAPER:"PAPER_SIMULATED",DATA_STALE_STOP:"STOP",DIRECTION_WAIT:"WAIT",BTC24_WAIT:"WAIT",COST_WAIT:"WAIT",DUPLICATE_STOP:"STOP",RISK_REJECT:"STOP"});
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const replay=()=>globalThis.AgentCryptoStrategyAReplay||null;
  const spec=()=>globalThis.AgentCryptoStrategyACanonicalSpec||null;
  function normalize(raw){const source=Array.isArray(raw?.checks)?raw.checks:[];const rows=Object.entries(EXPECTED).map(([scenario,expected])=>{const hit=source.find(x=>x?.scenario===scenario)||null,actual=hit?.actual??null;return{scenario,expected,actual,pass:actual===expected};});return{schema:'agent_crypto_strategy_a_replay_acceptance_matrix_v2',build:BUILD,replay_build:replay()?.build||null,spec_build:spec()?.build||null,passed:rows.filter(x=>x.pass).length,total:rows.length,scenario_pass:rows.every(x=>x.pass),pass:false,rows,spec_audit:typeof spec()?.audit==='function'?spec().audit():null,safety:{deterministic:true,isolated_from_live:true,experiment_ledger_mutated:false,live_paper_ledger_mutated:false,local_storage_write:false,network_request:false,kraken_network:false,wallet:false,credentials:false,real_orders:false}};}
  function run(){const r=replay();if(!r||typeof r.self_test!=='function')return normalize({checks:[]});const before=typeof r.read==='function'?JSON.stringify(r.read()):null;const raw=r.self_test();try{r.render?.();}catch(_){}const after=typeof r.read==='function'?JSON.stringify(r.read()):null;const result=normalize(raw);const observedUnchanged=(before===null||after===null)?null:before===after;const reportedUnchanged=raw?.state_unchanged===true||raw?.integrity?.result_store_unchanged===true;result.safety.replay_result_store_unchanged=observedUnchanged;result.safety.replay_self_test_reports_state_unchanged=reportedUnchanged;result.safety.null_numeric_inputs_rejected=raw?.integrity?.null_numeric_inputs_rejected===true;result.state_integrity_pass=(observedUnchanged!==false)&&reportedUnchanged;result.pass=result.scenario_pass&&raw?.pass===true&&result.state_integrity_pass;renderResult(result);return clone(result);}
  function ensureStyle(){if(typeof document==='undefined'||document.getElementById('strategyAReplayAcceptanceStyle'))return;const s=document.createElement('style');s.id='strategyAReplayAcceptanceStyle';s.textContent=`#strategyAReplayAcceptance{margin:8px 0;padding:9px 10px;border:1px solid rgba(150,120,255,.24);border-radius:10px;background:rgba(9,8,24,.48)}#strategyAReplayAcceptance .sara-head{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}#strategyAReplayAcceptance .sara-title{font:950 9px/1.2 system-ui,sans-serif;letter-spacing:.08em;color:#c7b6ff}#strategyAReplayAcceptance .sara-actions{display:flex;gap:5px;flex-wrap:wrap}#strategyAReplayAcceptance .sara-summary{margin-top:6px;font:800 9px/1.25 system-ui,sans-serif;color:#9ab0c0}#strategyAReplayAcceptance .sara-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:7px}#strategyAReplayAcceptance .sara-case{padding:6px;border-radius:7px;border:1px solid rgba(255,255,255,.07);font:700 8px/1.2 system-ui,sans-serif;color:#b8cad7}#strategyAReplayAcceptance .sara-case[data-pass="true"]{border-color:rgba(91,219,171,.3);color:#9aefc3}#strategyAReplayAcceptance .sara-case[data-pass="false"]{border-color:rgba(255,112,112,.35);color:#ffaaaa}@media(max-width:950px){#strategyAReplayAcceptance .sara-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;document.head.appendChild(s);}
  function renderResult(result){if(typeof document==='undefined')return false;const panel=document.getElementById('strategyAReplayAcceptance');if(!panel)return false;const summary=panel.querySelector('#strategyAReplayAcceptanceSummary'),grid=panel.querySelector('#strategyAReplayAcceptanceGrid');if(summary)summary.textContent=result?`${result.pass?'PASS':'FAIL'} · ${result.passed}/${result.total} scénarios · état replay ${result.state_integrity_pass?'PRÉSERVÉ':'NON PRÉSERVÉ'} · replay ${result.replay_build||'N/D'} · spec ${result.spec_audit?.status||'N/D'}`:'Non exécutée — clic opérateur requis.';if(grid){grid.replaceChildren();for(const row of result?.rows||[]){const el=document.createElement('div');el.className='sara-case';el.dataset.pass=String(row.pass);el.textContent=`${row.scenario} · ${row.actual??'N/D'} / ${row.expected}`;grid.appendChild(el);}}return true;}
  function exportJson(result){const payload=result||run();if(typeof document!=='undefined'&&typeof Blob!=='undefined'){const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='STRATEGY_A_REPLAY_ACCEPTANCE.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);}return clone(payload);}
  function render(){if(typeof document==='undefined')return false;ensureStyle();const anchor=document.getElementById('strategyAReplaySandbox')||document.getElementById('strategyACanonicalSpec');if(!anchor)return false;let panel=document.getElementById('strategyAReplayAcceptance');if(!panel){panel=document.createElement('section');panel.id='strategyAReplayAcceptance';panel.innerHTML='<div class="sara-head"><div class="sara-title">REPLAY ACCEPTANCE MATRIX · 7 CHEMINS · ISOLÉE DU LIVE</div><div class="sara-actions"><button type="button" class="btn small" id="strategyAReplayAcceptanceRun">EXÉCUTER 7/7</button><button type="button" class="btn small" id="strategyAReplayAcceptanceExport">EXPORTER</button></div></div><div class="sara-summary" id="strategyAReplayAcceptanceSummary">Non exécutée — clic opérateur requis.</div><div class="sara-grid" id="strategyAReplayAcceptanceGrid"></div>';anchor.insertAdjacentElement('afterend',panel);panel.querySelector('#strategyAReplayAcceptanceRun')?.addEventListener('click',run);panel.querySelector('#strategyAReplayAcceptanceExport')?.addEventListener('click',()=>exportJson());}return true;}
  const api=Object.freeze({build:BUILD,expected:clone(EXPECTED),run,normalize,render,export_json:exportJson,automatic_run:false,acceptance_requires_state_preservation:true,paper_only:true,real_orders:false,network:false,storage_write:false,recurring_timer:false,observer:false});
  globalThis.AgentCryptoStrategyAReplayAcceptance=api;
  if(typeof document!=='undefined'){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',render,{once:true});window.addEventListener('load',render,{once:true});}else render();}
})();

/* 40.6.273 — LEGACY EVIDENCE BOOTSTRAP RETIRED.
   Canonical evidence loading is now owned by strategy-a-evidence-demand-loader.js.
   Compatibility API remains, but it never auto-starts at window.load. */
(() => {
  "use strict";
  const BOOTSTRAP_BUILD="40.6.273";
  function start(reason="legacy-compat-request"){
    const owner=globalThis.AgentCryptoCanonicalEvidenceWiring;
    if(owner&&typeof owner.load==="function")return owner.load(reason);
    return Promise.resolve([]);
  }
  globalThis.AgentCryptoEvidenceSupplementBootstrap=Object.freeze({
    build:BOOTSTRAP_BUILD,
    modules:Object.freeze([]),
    start,
    loaded:()=>Object.freeze([]),
    auto_start:false,
    retired_to:"strategy-a-evidence-demand-loader.js",
    unrelated_runtime_registry_loaded:false,
    recurring_timer:false,
    observer:false,
    storage_write:false,
    business_network_request:false,
    real_order:false,
    paper_only:true
  });
})();
