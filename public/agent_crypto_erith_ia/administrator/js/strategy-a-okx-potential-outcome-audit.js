/* Agent-Crypto @erith.IA — 40.6.471 OKX POTENTIAL DURABLE BASELINE RECOVERY
   Read-only analytical replay of the operator-validated 40.6.467 OKX shadow baseline.
   Frozen reference: first 144 COST_GATE_WAIT cases, OKX observable floor + canonical margin = 0.6109%,
   expected 16 POTENTIAL before slippage. Measures sampled cumulative MFE at T+5/T+15/T+60
   exclusively from Strategy A Durable Evidence cycle prices.
   No live OKX dependency, no threshold change, no gate promotion, no storage write, no real order. */
(()=>{
  "use strict";
  const BUILD="40.6.471",ROOT="strategyAOkxPotentialOutcomeAudit";
  const BASELINE=Object.freeze({
    source:"OPERATOR_TERRAIN_40.6.467",
    durable_source:"AgentCryptoStrategyADurableEvidence.read_cycles()",
    cost_wait_population:144,
    okx_required_floor_before_slippage_pct:0.6109,
    expected_potential_count:16,
    meaning:"OKX taker round-trip + observed spread + canonical margin, before slippage",
    historical_execution_cost_proof:false,
    profitability_claim:false
  });
  const H=Object.freeze([5,15,60]),TOL_MS=150000;
  let last=null,queued=false,reason="boot";
  const num=v=>v===null||v===undefined||v===""||typeof v==="boolean"?null:(Number.isFinite(Number(v))?Number(v):null);
  const time=v=>{if(v===null||v===undefined||v==="")return null;const n=typeof v==="number"?v:Date.parse(String(v));return Number.isFinite(n)?n:null;};
  const esc=v=>String(v??"—").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const pct=v=>Number.isFinite(v)?(v>=0?"+":"")+Number(v).toFixed(3)+" %":"—";
  const presentationOpen=()=>{if(typeof document==="undefined")return true;const node=document.querySelector('details[data-collapse-key="simulation"]');return !(node instanceof HTMLDetailsElement)||node.open===true;};

  function durableReady(){
    try{return globalThis.AgentCryptoStrategyADurableEvidence?.snapshot?.()?.ready===true;}catch(_){return false;}
  }
  function normalizeCycles(input){
    const map=new Map();
    for(const wrapped of Array.isArray(input)?input:[]){
      const row=wrapped&&typeof wrapped==="object"&&wrapped.payload&&typeof wrapped.payload==="object"?wrapped.payload:wrapped;
      const id=String(row?.cycle_id||row?.decision_id||"").trim(),at=time(row?.captured_at),price=num(row?.market?.price_eur);
      if(!id||at===null)continue;
      map.set(id,Object.freeze({
        id,at,price,symbol:String(row?.market?.symbol||"BTC").toUpperCase(),
        phase:String(row?.phase||""),blocker:String(row?.first_blocker||"").toLowerCase(),
        expected_move_pct:num(row?.cost?.expected_move_pct),required_move_pct:num(row?.cost?.required_move_pct),
        total_cost_pct:num(row?.cost?.total_cost_pct)
      }));
    }
    return [...map.values()].sort((a,b)=>a.at-b.at);
  }
  function rawCycles(){
    let rows=[];
    try{rows=globalThis.AgentCryptoStrategyADurableEvidence?.read_cycles?.()||[];}catch(_){}
    return normalizeCycles(rows);
  }
  function match(all,base,min){
    const target=base.at+min*60000;let best=null,abs=Infinity;
    for(const row of all){
      if(row.symbol!==base.symbol||row.at<=base.at||row.price===null)continue;
      const d=Math.abs(row.at-target);
      if(d<abs){best=row;abs=d;}
      if(row.at>target+TOL_MS&&abs<Infinity)break;
    }
    if(!best||abs>TOL_MS)return Object.freeze({status:"UNRESOLVED_GAP",target_at:new Date(target).toISOString(),matched_at:best?new Date(best.at).toISOString():null,gap_sec:best?Math.round((best.at-target)/1000):null});
    return Object.freeze({status:"CERTIFIED_SAMPLED",target_at:new Date(target).toISOString(),matched_at:new Date(best.at).toISOString(),matched_ms:best.at,gap_sec:Math.round((best.at-target)/1000),price_eur:best.price});
  }
  function mfeTo(all,base,matched){
    if(matched?.status!=="CERTIFIED_SAMPLED"||!(base.price>0))return Object.freeze({sample_count:0,mfe_pct:null,mae_pct:null});
    const future=all.filter(row=>row.symbol===base.symbol&&row.at>base.at&&row.at<=matched.matched_ms&&row.price!==null);
    if(!future.length)return Object.freeze({sample_count:0,mfe_pct:null,mae_pct:null});
    let hi=-Infinity,lo=Infinity;
    for(const row of future){const change=((row.price/base.price)-1)*100;hi=Math.max(hi,change);lo=Math.min(lo,change);}
    return Object.freeze({sample_count:future.length,mfe_pct:Number.isFinite(hi)?hi:null,mae_pct:Number.isFinite(lo)?lo:null});
  }
  const costWait=row=>row?.blocker==="cost"||row?.phase==="COST_GATE_WAIT";
  function baselineCases(all){
    return (Array.isArray(all)?all:[]).filter(costWait).filter(row=>row.price!==null).slice(0,BASELINE.cost_wait_population);
  }
  function potentialCases(all){
    const floor=BASELINE.okx_required_floor_before_slippage_pct;
    return baselineCases(all).filter(row=>Number.isFinite(row?.expected_move_pct)&&row.expected_move_pct+1e-12>=floor);
  }
  function one(all,row){
    const horizons={};
    for(const min of H){
      const m=match(all,row,min),e=mfeTo(all,row,m);
      horizons["t"+min]=Object.freeze({...m,...e,covers_floor:Number.isFinite(e.mfe_pct)&&e.mfe_pct+1e-12>=BASELINE.okx_required_floor_before_slippage_pct});
    }
    const earliest=H.find(min=>horizons["t"+min]?.covers_floor===true)||null;
    return Object.freeze({
      cycle_id:row.id,captured_at:new Date(row.at).toISOString(),symbol:row.symbol,
      expected_move_pct:row.expected_move_pct,legacy_required_move_pct:row.required_move_pct,
      reference_floor_before_slippage_pct:BASELINE.okx_required_floor_before_slippage_pct,
      horizons:Object.freeze(horizons),earliest_floor_cover_min:earliest,
      floor_cover_observed:earliest!==null,slippage_unknown:true,profitability_claim:false
    });
  }
  function summarize(cases,min){
    const rows=cases.map(x=>x.horizons["t"+min]),resolved=rows.filter(x=>x.status==="CERTIFIED_SAMPLED"&&Number.isFinite(x.mfe_pct));
    const covered=resolved.filter(x=>x.covers_floor===true);
    const below=resolved.filter(x=>x.covers_floor!==true);
    return Object.freeze({potential_total:cases.length,resolved:resolved.length,covered_floor_before_slippage:covered.length,below_floor:below.length,unknown:cases.length-resolved.length,coverage_rate_resolved_pct:resolved.length?covered.length/resolved.length*100:null});
  }
  function snapshot(){
    const ready=durableReady(),all=rawCycles(),costWaitTotal=all.filter(costWait).filter(row=>row.price!==null).length;
    const baseline=baselineCases(all),potential=potentialCases(all),cases=potential.map(row=>one(all,row));
    const baselineMatch=baseline.length===BASELINE.cost_wait_population&&potential.length===BASELINE.expected_potential_count;
    const summaries=Object.freeze({t5:summarize(cases,5),t15:summarize(cases,15),t60:summarize(cases,60)});
    const rowsWithAny=cases.filter(x=>x.floor_cover_observed).length;
    const flags=[];
    if(!ready)flags.push("DURABLE_EVIDENCE_NOT_READY");
    if(!all.length)flags.push("DURABLE_CYCLES_EMPTY");
    if(baseline.length!==BASELINE.cost_wait_population)flags.push("BASELINE_POPULATION_MISMATCH");
    if(potential.length!==BASELINE.expected_potential_count)flags.push("BASELINE_POTENTIAL_COUNT_MISMATCH");
    last=Object.freeze({
      schema:"agent_crypto_strategy_a_okx_potential_outcome_audit_v2",build:BUILD,generated_at:new Date().toISOString(),reason,
      status:!ready?"DURABLE_LOADING":flags.length?"BASELINE_DRIFT":"REFERENCE_REPLAY_READY",flags:Object.freeze(flags),
      baseline:BASELINE,
      source_truth:Object.freeze({durable_ready:ready,durable_cycles_total:all.length,durable_cost_wait_total:costWaitTotal,visible_ledger_used:false,outcome_audit_snapshot_used:false}),
      reconstructed:Object.freeze({baseline_cases:baseline.length,potential_cases:potential.length,baseline_match:baselineMatch,potential_cycle_ids:Object.freeze(potential.map(x=>x.id))}),
      summaries,cases:Object.freeze(cases),covered_at_any_horizon:rowsWithAny,
      interpretation:Object.freeze({
        observed_mfe_is_sampled_market_movement_not_executed_pnl:true,
        reference_floor_excludes_slippage:true,
        floor_cover_is_not_profitability:true,
        current_okx_snapshot_not_used:true,
        historical_execution_cost_proof:false,
        durable_baseline_recovery:true
      }),
      thresholds_changed:false,gate_changed:false,strategy_decision_changed:false,oracle_changed:false,risk_changed:false,paper_changed:false,market_core_changed:false,
      storage_write:false,new_fetch:false,new_websocket:false,recurring_timer:false,mutation_observer:false,real_order:false,paper_only:true,profitability_claim:false
    });
    return last;
  }
  function style(){
    if(typeof document==="undefined"||document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");s.id=ROOT+"Style";
    s.textContent="#"+ROOT+"{margin-top:10px;padding:12px;border:1px solid rgba(183,143,255,.30);border-radius:10px;background:rgba(20,10,34,.28)}#"+ROOT+" .opa-h{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}#"+ROOT+" .opa-t{font-size:11px;font-weight:950;letter-spacing:.06em;color:#d9bbff;text-transform:uppercase}#"+ROOT+" .opa-s{margin-top:4px;font-size:9px;line-height:1.45;color:#aa9cba}#"+ROOT+" .opa-g{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:9px}#"+ROOT+" .opa-k{padding:8px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(0,0,0,.14)}#"+ROOT+" .opa-k span{display:block;font-size:8px;color:#8f839a;text-transform:uppercase}#"+ROOT+" .opa-k b{display:block;margin-top:3px;font-size:10px;color:#f5efff}#"+ROOT+" table{width:100%;border-collapse:collapse;margin-top:9px;font-size:8.5px;line-height:1.35}#"+ROOT+" th,#"+ROOT+" td{padding:5px 4px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right}#"+ROOT+" th:first-child,#"+ROOT+" td:first-child{text-align:left}#"+ROOT+" .opa-note{margin-top:8px;padding:8px;border:1px solid rgba(255,255,255,.06);border-radius:8px;font-size:9px;line-height:1.5;color:#b8acc4}#"+ROOT+" .warn{color:#ffd48a;font-weight:850}#"+ROOT+" .good{color:#9debc5;font-weight:850}@media(max-width:950px){#"+ROOT+" .opa-g{grid-template-columns:repeat(2,minmax(0,1fr))}}";
    document.head.appendChild(s);
  }
  function exportJson(data){
    try{const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="STRATEGY_A_OKX_POTENTIAL_OUTCOME_AUDIT_40_6_470.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return true;}catch(_){return false;}
  }
  function render(){
    const s=snapshot();
    if(typeof document==="undefined"||!presentationOpen())return s;
    const anchor=document.getElementById("strategyARealVenueCostShadowTruth")||document.getElementById("strategyACostWaitOutcomeAudit406429");
    if(!anchor)return s;style();
    let root=document.getElementById(ROOT);if(!root){root=document.createElement("section");root.id=ROOT;}
    if(root.previousElementSibling!==anchor){try{anchor.insertAdjacentElement("afterend",root);}catch(_){}}
    const t5=s.summaries.t5,t15=s.summaries.t15,t60=s.summaries.t60;
    const rows=s.cases.map(x=>'<tr><td>'+esc(x.cycle_id)+'</td><td>'+esc(pct(x.expected_move_pct))+'</td><td>'+esc(pct(x.horizons.t5?.mfe_pct))+'</td><td>'+esc(pct(x.horizons.t15?.mfe_pct))+'</td><td>'+esc(pct(x.horizons.t60?.mfe_pct))+'</td><td>'+esc(pct(x.reference_floor_before_slippage_pct))+'</td><td>'+(x.earliest_floor_cover_min?'<span class="good">T+'+esc(x.earliest_floor_cover_min)+'</span>':'<span class="warn">NON / INCONNU</span>')+'</td></tr>').join("");
    root.innerHTML='<div class="opa-h"><div><div class="opa-t">STRATEGY A · OKX POTENTIAL OUTCOME AUDIT · '+BUILD+'</div><div class="opa-s">Source Durable Evidence uniquement · référence .467 : 144 COST WAIT · plancher 0,6109 % avant slippage · 16 POTENTIAL attendus.</div></div><button type="button" class="btn small" id="'+ROOT+'Export">EXPORTER</button></div>'+
      '<div class="opa-g"><div class="opa-k"><span>Baseline reconstruite</span><b>'+esc(s.reconstructed.baseline_cases)+'/144</b></div><div class="opa-k"><span>POTENTIAL reconstruits</span><b>'+esc(s.reconstructed.potential_cases)+'/16</b></div><div class="opa-k"><span>T+5 couvre plancher</span><b>'+esc(t5.covered_floor_before_slippage)+' / '+esc(t5.resolved)+'</b></div><div class="opa-k"><span>T+15 couvre plancher</span><b>'+esc(t15.covered_floor_before_slippage)+' / '+esc(t15.resolved)+'</b></div><div class="opa-k"><span>T+60 couvre plancher</span><b>'+esc(t60.covered_floor_before_slippage)+' / '+esc(t60.resolved)+'</b></div></div>'+
      '<table><thead><tr><th>Cycle</th><th>Expected</th><th>MFE T+5</th><th>MFE T+15</th><th>MFE T+60</th><th>Plancher</th><th>1er franchissement</th></tr></thead><tbody>'+rows+'</tbody></table>'+
      '<div class="opa-note"><b>État : '+esc(s.status)+'</b> · '+(s.reconstructed.baseline_match?'<span class="good">baseline .467 reconstituée</span>':'<span class="warn">baseline drift : ne pas interpréter les ratios comme la population .467</span>')+'. MFE = pic favorable échantillonné dans les cycles Strategy A, pas un P/L exécuté. Le plancher 0,6109 % exclut toujours le slippage OKX : <b>franchir le plancher ne prouve ni rentabilité ni PASS de gate.</b></div>';
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",()=>exportJson(s));
    root.dataset.auditBuild=BUILD;root.dataset.readOnly="true";return s;
  }
  function schedule(r="event"){reason=String(r||"event");if(queued)return;queued=true;const run=()=>{queued=false;try{render();}catch(_){}};try{queueMicrotask(run);}catch(_){Promise.resolve().then(run);}}
  function selfTest(){
    const t0=Date.parse("2026-01-01T00:00:00Z"),wrapped=[];
    for(let i=0;i<150;i++)wrapped.push({payload:{
      cycle_id:"C"+String(i).padStart(3,"0"),captured_at:new Date(t0+i*5*60000).toISOString(),
      phase:"COST_GATE_WAIT",first_blocker:"cost",market:{symbol:"BTC",price_eur:100+i*.01},
      cost:{expected_move_pct:i<16?.70:.50,required_move_pct:.80,total_cost_pct:.60}
    }});
    const all=normalizeCycles(wrapped),baseline=baselineCases(all),p=potentialCases(all),base=all[0];
    const mini=[base,{id:"F5",at:base.at+5*60000,price:base.price*1.002,symbol:"BTC"},{id:"F15",at:base.at+15*60000,price:base.price*1.007,symbol:"BTC"},{id:"F60",at:base.at+60*60000,price:base.price*1.008,symbol:"BTC"}].sort((a,b)=>a.at-b.at);
    const e5=mfeTo(mini,base,match(mini,base,5)),e15=mfeTo(mini,base,match(mini,base,15)),e60=mfeTo(mini,base,match(mini,base,60));
    const checks=Object.freeze({
      unwraps_durable_payload:all.length===150,
      frozen_baseline_population:baseline.length===144&&baseline[0].id==="C000"&&baseline[143].id==="C143",
      frozen_potential_count:p.length===16,
      t5_below_floor:e5.mfe_pct<BASELINE.okx_required_floor_before_slippage_pct,
      t15_covers_floor:e15.mfe_pct>=BASELINE.okx_required_floor_before_slippage_pct,
      t60_covers_floor:e60.mfe_pct>=BASELINE.okx_required_floor_before_slippage_pct,
      visible_ledger_not_required:true,current_okx_not_required:true,no_threshold_change:true,no_profitability_claim:true
    });
    return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }
  globalThis.AgentCryptoStrategyAOkxPotentialOutcomeAudit=Object.freeze({
    build:BUILD,snapshot:()=>last||snapshot(),refresh:r=>{reason=String(r||"api");return render();},export_json:()=>exportJson(last||snapshot()),self_test:selfTest,
    baseline:BASELINE,source:"DURABLE_EVIDENCE_ONLY",thresholds_changed:false,gate_changed:false,strategy_decision_changed:false,oracle_changed:false,risk_changed:false,paper_changed:false,market_core_changed:false,
    storage_write:false,new_fetch:false,new_websocket:false,recurring_timer:false,mutation_observer:false,real_order:false,paper_only:true,profitability_claim:false
  });
  if(typeof document!=="undefined"){
    document.addEventListener("agent-crypto:evidence-data-changed",()=>schedule("evidence-data-changed"),{passive:true});
    document.addEventListener("agent-crypto:strategy-a-durable-evidence-ready",()=>schedule("durable-evidence-ready"),{passive:true});
    window.addEventListener("agent-crypto:strategy-a-audits-ready",()=>schedule("audits-ready"),{passive:true});
    document.addEventListener("toggle",e=>{if(e?.target?.matches?.('details[data-collapse-key="simulation"]')&&e.target.open===true)schedule("simulation-open");},true);
    window.addEventListener("pageshow",()=>schedule("pageshow"),{passive:true});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>schedule("dom-ready"),{once:true});else schedule("script-load");
  }
})();