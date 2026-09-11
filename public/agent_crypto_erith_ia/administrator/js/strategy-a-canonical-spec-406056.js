/* Agent-Crypto Administrator — Strategy A canonical spec / gate contract
   Build: 40.6.56 · Additive audit owner only. No strategy threshold is changed here.
   No network, timer, observer, storage or order path. */
(() => {
  "use strict";
  const BUILD="40.6.56";
  const SPEC=Object.freeze({"schema":"agent_crypto_strategy_a_canonical_spec_v1","spec_version":"1.0","runtime_build":"40.6.56","strategy_id":"STRATEGY_A","mode":"PAPER_ONLY","authority":"AERITH_TRADING_RULEBOOK > Strategy A spec > runtime presentation","allowed_assets":["BTC","ETH","SOL"],"profile":{"name":"Solo Progression 1 000 €","capital_eur":1000,"ticket_eur":50,"max_operation_eur":100,"max_exposure_eur":300,"min_reserve_eur":700},"gate_order":["DATA","REGIME","DIRECTION","CONFIDENCE","BTC_24H","REENTRY","COST_GATE","IDENTITY","RISK_GOVERNOR","PAPER"],"policy":{"mixed_direction_min":12,"mixed_confidence_min":70,"mixed_btc24_min_pct":0.1,"bullish_confidence_min":55,"cost_required_move_pct":0.8,"modelled_cost_floor_pct":0.6,"cost_safety_margin_pct":0.2,"allowed_risk_decisions":["ACCEPT","REDUCE"]},"reentry":{"rule":"cooldown + fresh signal","exact_runtime_parameters":"NOT_ASSERTED_BY_SPEC"},"cost_model_note":"0.60% is the current aggregate modelled cost floor shown by the Strategy A runtime; this spec does not invent a fee/spread/slippage breakdown.","paper_contract":{"real_orders":false,"wallet":false,"credentials":false,"kraken_trading":false,"human_validation_before_real_action":true},"protected":{"market_core":"38.15.11","aether_geometry":"40.6.54 checkpoint","aether_backplate_modified":false,"window_manager_modified":false},"sources":{"replay_owner":"js/strategy-a-replay-404290.js","paper_lifecycle_owner":"js/strategy-a-paper-lifecycle-404295.js","auto_lifecycle_bridge":"js/strategy-a-auto-lifecycle-bridge-404297.js","after_cost_owner":"js/strategy-a-after-cost-metrics-404298.js","safety_owner":"js/strategy-a-safety-certification-404299.js","evidence_owner":"js/strategy-a-evidence-dossier-404295.js"}});
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const num=v=>Number.isFinite(Number(v))?Number(v):null;
  function replay(){return globalThis.AgentCryptoStrategyAReplay404290||null;}
  function probe(){
    const r=replay();
    const p=r?.policy||{};
    const live=typeof r?.live_policy_probe==="function"?r.live_policy_probe():{};
    return Object.freeze({
      replay_build:r?.build||null, replay_available:!!r,
      mixed_direction_min:num(live?.mixed_direction_min ?? p?.mixed_direction_min),
      mixed_confidence_min:num(live?.mixed_confidence_min ?? p?.mixed_confidence_min),
      mixed_btc24_min_pct:num(live?.mixed_btc24_min_pct ?? p?.mixed_btc24_min_pct),
      bullish_confidence_min:num(p?.bullish_confidence_min),
      cost_required_move_pct:num(live?.cost_absolute_min_expected_move_pct ?? p?.cost_required_move_pct),
      paper_lifecycle_build:globalThis.AgentCryptoStrategyAPaperLifecycle404295?.build||null,
      auto_lifecycle_bridge_build:globalThis.AgentCryptoStrategyAAutoLifecycleBridge404297?.build||null,
      safety_build:globalThis.AgentCryptoStrategyASafetyCertification404299?.build||null,
      after_cost_build:globalThis.AgentCryptoStrategyAAfterCostMetrics404298?.build||null
    });
  }
  function audit(){
    const observed=probe(), expected=SPEC.policy, checks=[];
    const add=(key,actual,want)=>{
      const known=actual!==null; const pass=known&&Math.abs(Number(actual)-Number(want))<1e-9;
      checks.push({key,observed:actual,expected:want,known,pass});
    };
    add('mixed_direction_min',observed.mixed_direction_min,expected.mixed_direction_min);
    add('mixed_confidence_min',observed.mixed_confidence_min,expected.mixed_confidence_min);
    add('mixed_btc24_min_pct',observed.mixed_btc24_min_pct,expected.mixed_btc24_min_pct);
    add('bullish_confidence_min',observed.bullish_confidence_min,expected.bullish_confidence_min);
    add('cost_required_move_pct',observed.cost_required_move_pct,expected.cost_required_move_pct);
    const known=checks.filter(x=>x.known).length, mismatches=checks.filter(x=>x.known&&!x.pass);
    const status=mismatches.length?'DRIFT':known===checks.length?'OK':'PARTIAL';
    return Object.freeze({schema:'agent_crypto_strategy_a_spec_audit_v1',build:BUILD,status,known_checks:known,total_checks:checks.length,mismatches,checks,observed,paper_only:true,real_orders:false});
  }
  function ensureStyle(){
    if(typeof document==='undefined'||document.getElementById('strategyACanonicalSpecStyle406056'))return;
    const s=document.createElement('style'); s.id='strategyACanonicalSpecStyle406056'; s.textContent=`
      #strategyACanonicalSpec406056{margin:8px 0;padding:8px 10px;border:1px solid rgba(98,236,255,.20);border-radius:10px;background:rgba(5,15,27,.46)}
      #strategyACanonicalSpec406056 .sacs-row{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}
      #strategyACanonicalSpec406056 .sacs-title{font:950 9px/1.2 system-ui,sans-serif;letter-spacing:.08em;color:#9eefff}
      #strategyACanonicalSpec406056 .sacs-state{font:900 9px/1 system-ui,sans-serif;padding:4px 7px;border-radius:999px;border:1px solid rgba(255,255,255,.12)}
      #strategyACanonicalSpec406056[data-status="OK"] .sacs-state{color:#82f5b9;border-color:rgba(130,245,185,.35)}
      #strategyACanonicalSpec406056[data-status="DRIFT"] .sacs-state{color:#ff9b9b;border-color:rgba(255,120,120,.4)}
      #strategyACanonicalSpec406056 .sacs-sub{margin-top:5px;font:500 8px/1.35 system-ui,sans-serif;color:#8da7b8}`; document.head.appendChild(s);
  }
  function render(){
    if(typeof document==='undefined')return false; ensureStyle();
    const anchor=document.getElementById('strategyAReplaySandbox404290')||document.getElementById('strategyAExperimentLedger404289')||document.getElementById('strategyADecisionTrace404278');
    if(!anchor)return false;
    let panel=document.getElementById('strategyACanonicalSpec406056');
    if(!panel){panel=document.createElement('section');panel.id='strategyACanonicalSpec406056';anchor.insertAdjacentElement('beforebegin',panel);}
    const a=audit(); panel.dataset.status=a.status;
    panel.innerHTML=`<div class="sacs-row"><div class="sacs-title">STRATEGY A · SPEC V1.0 · GATE CONTRACT</div><div class="sacs-state">${a.status}</div></div><div class="sacs-sub">BTC · ETH · SOL · MIXTE direction ≥ +12/100 · confiance ≥ 70/100 · BTC 24 h ≥ +0,10 % · Cost Gate ≥ 0,80 % · PAPER ONLY · ${a.known_checks}/${a.total_checks} contrôles runtime observables.</div>`;
    return true;
  }
  const api=Object.freeze({build:BUILD,schema:SPEC.schema,spec:clone(SPEC),probe,audit,render,paper_only:true,real_orders:false,network:false,storage_write:false,recurring_timer:false,observer:false,changes_thresholds:false});
  globalThis.AgentCryptoStrategyACanonicalSpec406056=api;
  if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();}
})();
