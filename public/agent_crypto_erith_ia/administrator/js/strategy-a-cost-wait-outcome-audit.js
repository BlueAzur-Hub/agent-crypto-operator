/* Agent-Crypto @erith.IA — 40.6.439 STRATEGY A COST-WAIT OUTCOME AUDIT · PROGRESSIVE RECOVERY
   Read-only. Existing Auto A cycle rows only. No threshold, Oracle, Risk, Paper,
   Market Core, network, polling timer, MutationObserver or storage change. */
(() => {
  "use strict";
  const BUILD="40.6.439", ROOT="strategyACostWaitOutcomeAudit406429";
  const presentationOpen=()=>{const node=document.getElementById("simulation");return !(node instanceof HTMLDetailsElement)||node.open===true;};
  const EVENT="agent-crypto:strategy-a-experiment-cycle", H=[5,15,60];
  const TOL=150000, MIN60=6;
  let last=null, queued=false, reason="boot";
  const num=v=>v===null||v===undefined||v===""||typeof v==="boolean"?null:(Number.isFinite(Number(v))?Number(v):null);
  const time=v=>{if(v===null||v===undefined||v==="")return null;const n=typeof v==="number"?v:Date.parse(String(v));return Number.isFinite(n)?n:null;};
  const esc=v=>String(v??"—").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const pct=v=>Number.isFinite(v)?(v>=0?"+":"")+v.toFixed(3)+" %":"—";

  function read(){
    try{const r=globalThis.AgentCryptoStrategyAExperimentLedger?.read?.();if(Array.isArray(r))return r;}catch(_){}
    try{const r=globalThis.AgentCryptoStrategyADurableEvidence?.read_cycles?.();if(Array.isArray(r))return r;}catch(_){}
    return [];
  }
  function rows(input=read()){
    const m=new Map();
    for(const raw of Array.isArray(input)?input:[]){
      const id=String(raw?.cycle_id||raw?.decision_id||"").trim(), at=time(raw?.captured_at), price=num(raw?.market?.price_eur);
      if(!id||at===null)continue;
      m.set(id,{raw,id,at,price,phase:String(raw?.phase||""),blocker:String(raw?.first_blocker||"").toLowerCase(),symbol:String(raw?.market?.symbol||"BTC").toUpperCase()});
    }
    return [...m.values()].sort((a,b)=>a.at-b.at);
  }
  const costWait=r=>r?.blocker==="cost"||r?.phase==="COST_GATE_WAIT";

  function match(all,base,min){
    const target=base.at+min*60000;let best=null,abs=Infinity;
    for(const r of all){
      if(r.symbol!==base.symbol||r.at<=base.at||r.price===null)continue;
      const d=Math.abs(r.at-target);
      if(d<abs){best=r;abs=d;}
      if(r.at>target+TOL&&abs<Infinity)break;
    }
    if(!best||abs>TOL)return {status:"UNRESOLVED_GAP",target_at:new Date(target).toISOString(),matched_at:best?new Date(best.at).toISOString():null,gap_sec:best?Math.round((best.at-target)/1000):null,price_eur:best?.price??null,change_pct:null};
    const change=base.price>0?((best.price/base.price)-1)*100:null;
    return {status:"CERTIFIED_SAMPLED",target_at:new Date(target).toISOString(),matched_at:new Date(best.at).toISOString(),gap_sec:Math.round((best.at-target)/1000),price_eur:best.price,change_pct:Number.isFinite(change)?change:null};
  }
  function excursions(all,base){
    const end=base.at+60*60000+TOL,f=all.filter(r=>r.symbol===base.symbol&&r.at>base.at&&r.at<=end&&r.price!==null);
    if(!(base.price>0)||!f.length)return {sample_count:f.length,mfe_pct:null,mae_pct:null};
    let hi=-Infinity,lo=Infinity;
    for(const r of f){const x=((r.price/base.price)-1)*100;hi=Math.max(hi,x);lo=Math.min(lo,x);}
    return {sample_count:f.length,mfe_pct:Number.isFinite(hi)?hi:null,mae_pct:Number.isFinite(lo)?lo:null};
  }
  function classify(base,e,h){
    const req=num(base?.raw?.cost?.required_move_pct),cost=num(base?.raw?.cost?.total_cost_pct),mfe=num(e?.mfe_pct);
    if(h?.t60?.status!=="CERTIFIED_SAMPLED"||Number(e?.sample_count||0)<MIN60||mfe===null||req===null||cost===null)return "INCONNU";
    if(mfe>=req)return "SEUIL_DEPASSE_APRES_REFUS";
    if(mfe>=cost)return "COUVRE_COUTS_SANS_MARGE";
    return "REFUS_PROTECTEUR_OBSERVE";
  }
  function one(all,base){
    const h={};for(const x of H)h["t"+x]=match(all,base,x);
    const e=excursions(all,base),cost=num(base.raw?.cost?.total_cost_pct);
    return Object.freeze({
      cycle_id:base.id,captured_at:new Date(base.at).toISOString(),symbol:base.symbol,t0_price_eur:base.price,
      regime:String(base.raw?.oracle?.regime||"UNKNOWN"),direction_score:num(base.raw?.oracle?.direction_score),
      confidence:num(base.raw?.oracle?.confidence),btc_24h_pct:num(base.raw?.market?.change_24h_pct),
      expected_move_pct:num(base.raw?.cost?.expected_move_pct),required_move_pct:num(base.raw?.cost?.required_move_pct),
      total_cost_pct:cost,horizons:Object.freeze(h),sampled_60m:Object.freeze(e),
      sampled_net_peak_after_cost_pct:e.mfe_pct!==null&&cost!==null?e.mfe_pct-cost:null,
      classification:classify(base,e,h),profitability_claim:false
    });
  }
  function q(values,p){
    const a=values.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;
    const pos=(a.length-1)*p,lo=Math.floor(pos),hi=Math.ceil(pos);return lo===hi?a[lo]:a[lo]+(a[hi]-a[lo])*(pos-lo);
  }
  function snapshot(){
    const all=rows(),cases=all.filter(costWait).filter(r=>r.price!==null).map(r=>one(all,r));
    const c={total_cost_wait:cases.length,resolved_t60:0,protective:0,covers_costs_without_margin:0,threshold_exceeded_after_refusal:0,unknown:0};
    for(const x of cases){
      if(x.horizons.t60?.status==="CERTIFIED_SAMPLED")c.resolved_t60++;
      if(x.classification==="REFUS_PROTECTEUR_OBSERVE")c.protective++;
      else if(x.classification==="COUVRE_COUTS_SANS_MARGE")c.covers_costs_without_margin++;
      else if(x.classification==="SEUIL_DEPASSE_APRES_REFUS")c.threshold_exceeded_after_refusal++;
      else c.unknown++;
    }
    const resolved=cases.filter(x=>x.classification!=="INCONNU");
    const mfe=resolved.map(x=>x.sampled_60m?.mfe_pct).filter(Number.isFinite);
    const exp=resolved.map(x=>x.expected_move_pct).filter(Number.isFinite);
    const delta=resolved.filter(x=>Number.isFinite(x.sampled_60m?.mfe_pct)&&Number.isFinite(x.expected_move_pct)).map(x=>x.sampled_60m.mfe_pct-x.expected_move_pct);
    last=Object.freeze({
      schema:"agent_crypto_strategy_a_cost_wait_outcome_audit_v1",build:BUILD,reason,generated_at:new Date().toISOString(),
      horizons_min:H.slice(),match_tolerance_sec:TOL/1000,min_future_samples_60m:MIN60,
      source:"Strategy A Experiment Ledger / Durable Evidence cycle prices",outcome_sampling:"AUTO_A_CYCLE_PRICE_SAMPLED",
      counts:Object.freeze(c),statistics:Object.freeze({mfe_median_pct:q(mfe,.5),mfe_p75_pct:q(mfe,.75),mfe_p90_pct:q(mfe,.9),expected_move_median_pct:q(exp,.5),sampled_mfe_minus_expected_median_pct:q(delta,.5)}),
      cases:Object.freeze(cases),thresholds_changed:false,oracle_changed:false,risk_changed:false,paper_changed:false,market_core_changed:false,
      new_fetch:false,new_websocket:false,recurring_timer:false,mutation_observer:false,storage_write:false,real_order:false,paper_only:true,profitability_claim:false
    });
    return last;
  }
  function style(){
    if(typeof document==="undefined"||document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");s.id=ROOT+"Style";
    s.textContent="#"+ROOT+"{margin-top:9px;padding:10px;border:1px solid rgba(255,210,110,.22);border-radius:10px;background:rgba(24,16,4,.28)}#"+ROOT+" .cwo-h{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}#"+ROOT+" .cwo-t{font-size:9px;font-weight:950;letter-spacing:.08em;color:#ffe09b;text-transform:uppercase}#"+ROOT+" .cwo-s{margin-top:3px;font-size:8px;line-height:1.4;color:#a99d83}#"+ROOT+" .cwo-g{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;margin-top:8px}#"+ROOT+" .cwo-k{padding:7px;border:1px solid rgba(255,255,255,.06);border-radius:8px;background:rgba(0,0,0,.14)}#"+ROOT+" .cwo-k span{display:block;font-size:7px;color:#8f866f;text-transform:uppercase}#"+ROOT+" .cwo-k b{display:block;margin-top:3px;font-size:9px;color:#fff5da}#"+ROOT+" .cwo-stat{margin-top:7px;padding:7px;border:1px solid rgba(255,255,255,.05);border-radius:8px;font-size:8px;line-height:1.45;color:#b9ae94}@media(max-width:1050px){#"+ROOT+" .cwo-g{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:700px){#"+ROOT+" .cwo-g{grid-template-columns:repeat(2,minmax(0,1fr))}}";
    document.head.appendChild(s);
  }
  function exportJson(data){
    try{const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="STRATEGY_A_COST_WAIT_OUTCOME_AUDIT_40_6_439.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return true;}catch(_){return false;}
  }
  function render(){
    if(typeof document==="undefined")return snapshot();
    if(!presentationOpen())return last;
    const s=snapshot(),a=document.getElementById("strategyADurableEvidence")||document.getElementById("strategyAExperimentLedger")||document.querySelector("#strategyAVisualConsole .avc-body");
    if(!a)return s;style();let root=document.getElementById(ROOT);if(!root){root=document.createElement("section");root.id=ROOT;}
    if(root.previousElementSibling!==a){try{a.insertAdjacentElement("afterend",root);}catch(_){}}
    const c=s.counts,st=s.statistics;
    root.innerHTML='<div class="cwo-h"><div><div class="cwo-t">STRATEGY A · COST-WAIT OUTCOME AUDIT · '+BUILD+'</div><div class="cwo-s">Lecture seule · vrais cycles Auto A · T+5/T+15/T+60 échantillonnés par les cycles suivants · aucun seuil modifié.</div></div><button type="button" class="btn small" id="'+ROOT+'Export">EXPORTER</button></div>'+
      '<div class="cwo-g"><div class="cwo-k"><span>Cost Wait</span><b>'+c.total_cost_wait+'</b></div><div class="cwo-k"><span>T+60 résolus</span><b>'+c.resolved_t60+'</b></div><div class="cwo-k"><span>Refus protecteurs</span><b>'+c.protective+'</b></div><div class="cwo-k"><span>Couvre coûts</span><b>'+c.covers_costs_without_margin+'</b></div><div class="cwo-k"><span>Seuil dépassé après refus</span><b>'+c.threshold_exceeded_after_refusal+'</b></div><div class="cwo-k"><span>Inconnus</span><b>'+c.unknown+'</b></div></div>'+
      '<div class="cwo-stat">MFE médiane : <b>'+esc(pct(st.mfe_median_pct))+'</b> · P75 : <b>'+esc(pct(st.mfe_p75_pct))+'</b> · P90 : <b>'+esc(pct(st.mfe_p90_pct))+'</b> · expected_move médian : <b>'+esc(pct(st.expected_move_median_pct))+'</b> · MFE − expected médian : <b>'+esc(pct(st.sampled_mfe_minus_expected_median_pct))+'</b>.<br>Pic favorable observé sur les cycles Auto A, pas un P/L exécuté. Données manquantes = INCONNU.</div>';
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",()=>exportJson(s));root.dataset.auditBuild=BUILD;root.dataset.readOnly="true";return s;
  }
  function schedule(r="event"){reason=String(r||"event");if(queued)return;queued=true;const run=()=>{queued=false;try{render();}catch(_){}};try{queueMicrotask(run);}catch(_){setTimeout(run,0);}}
  function selfTest(){
    const t0=Date.parse("2026-01-01T00:00:00Z"),make=(min,price,phase="NO_TRADE",blocker="")=>({cycle_id:"T-"+min,captured_at:new Date(t0+min*60000).toISOString(),phase,first_blocker:blocker,market:{symbol:"BTC",price_eur:price},oracle:{regime:"TENDANCE HAUSSIÈRE",confidence:90,direction_score:30},cost:{expected_move_pct:.62,required_move_pct:.80,total_cost_pct:.60}});
    const all=rows([make(0,100,"COST_GATE_WAIT","cost"),make(5,100.2),make(10,100.4),make(15,100.65),make(20,100.7),make(30,100.82),make(45,100.88),make(60,100.9)]),x=one(all,all[0]);
    const checks={t5:x.horizons.t5.status==="CERTIFIED_SAMPLED",t15:x.horizons.t15.status==="CERTIFIED_SAMPLED",t60:x.horizons.t60.status==="CERTIFIED_SAMPLED",threshold:x.classification==="SEUIL_DEPASSE_APRES_REFUS",no_profit:x.profitability_claim===false};
    return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks:Object.freeze(checks)});
  }
  globalThis.AgentCryptoStrategyACostWaitOutcomeAudit406429=Object.freeze({build:BUILD,snapshot:()=>last||snapshot(),refresh:r=>{reason=String(r||"api");return render();},export_json:()=>exportJson(last||snapshot()),self_test:selfTest,horizons_min:H.slice(),thresholds_changed:false,oracle_changed:false,risk_changed:false,paper_changed:false,market_core_changed:false,new_fetch:false,new_websocket:false,recurring_timer:false,mutation_observer:false,storage_write:false,real_order:false,paper_only:true,profitability_claim:false});
  if(typeof document!=="undefined"){
    document.addEventListener(EVENT,()=>schedule(EVENT),{passive:true});
    document.addEventListener("agent-crypto:strategy-a-durable-evidence-ready",()=>schedule("durable-evidence-ready"),{passive:true});
    document.addEventListener("toggle",e=>{if(e?.target?.id==="simulation"&&e.target.open===true)schedule("simulation-open");},true);
    window.addEventListener("pageshow",()=>schedule("pageshow"),{passive:true});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>schedule("dom-ready"),{once:true});else schedule("script-load");
  }
})();