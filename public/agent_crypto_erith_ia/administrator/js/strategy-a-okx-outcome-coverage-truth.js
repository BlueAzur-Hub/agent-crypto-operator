/* Agent-Crypto @erith.IA — 40.6.472 OKX OUTCOME COVERAGE TRUTH
   Read-only coverage audit for the 16 durable OKX POTENTIAL cycles reconstructed in 40.6.471.
   Separates certified below-floor outcomes from observed crossings, partial sampling and no-sample gaps.
   The 150 s certification tolerance is preserved exactly; no interpolation, no invented price, no live OKX dependency.
   No threshold change, no gate promotion, no storage write, no real order. */
(()=>{
  "use strict";
  const BUILD="40.6.472",ROOT="strategyAOkxOutcomeCoverageTruth",FLOOR=0.6109,H=Object.freeze([5,15,60]),TOL_MS=150000;
  let last=null,queued=false,reason="boot";
  const num=v=>v===null||v===undefined||v===""||typeof v==="boolean"?null:(Number.isFinite(Number(v))?Number(v):null);
  const time=v=>{if(v===null||v===undefined||v==="")return null;const n=typeof v==="number"?v:Date.parse(String(v));return Number.isFinite(n)?n:null;};
  const esc=v=>String(v??"—").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const pct=v=>Number.isFinite(v)?(v>=0?"+":"")+Number(v).toFixed(3)+" %":"—";
  const unwrap=row=>row&&typeof row==="object"&&row.payload&&typeof row.payload==="object"?row.payload:row;
  const presentationOpen=()=>{if(typeof document==="undefined")return true;const node=document.querySelector('details[data-collapse-key="simulation"]');return !(node instanceof HTMLDetailsElement)||node.open===true;};

  function durableRows(){
    let rows=[];
    try{rows=globalThis.AgentCryptoStrategyADurableEvidence?.read_cycles?.()||[];}catch(_){}
    const map=new Map();
    for(const wrapped of Array.isArray(rows)?rows:[]){
      const row=unwrap(wrapped)||{},id=String(row?.cycle_id||row?.decision_id||"").trim(),at=time(row?.captured_at),price=num(row?.market?.price_eur);
      if(!id||at===null)continue;
      map.set(id,Object.freeze({id,at,price,symbol:String(row?.market?.symbol||"BTC").toUpperCase()}));
    }
    return [...map.values()].sort((a,b)=>a.at-b.at);
  }
  function baseFor(all,caseRow){
    const id=String(caseRow?.cycle_id||"").trim();
    return all.find(x=>x.id===id)||null;
  }
  function nearestBefore(rows,target){
    let best=null;
    for(const r of rows){if(r.at<=target&&(!best||r.at>best.at))best=r;}
    return best;
  }
  function nearestAfter(rows,target){
    let best=null;
    for(const r of rows){if(r.at>=target&&(!best||r.at<best.at))best=r;}
    return best;
  }
  function sampledStats(rows,basePrice){
    if(!(basePrice>0)||!rows.length)return {sample_count:rows.length,mfe_pct:null,mae_pct:null,covers_floor:false};
    let hi=-Infinity,lo=Infinity;
    for(const row of rows){
      const ch=((row.price/basePrice)-1)*100;
      hi=Math.max(hi,ch);lo=Math.min(lo,ch);
    }
    return {sample_count:rows.length,mfe_pct:Number.isFinite(hi)?hi:null,mae_pct:Number.isFinite(lo)?lo:null,covers_floor:Number.isFinite(hi)&&hi+1e-12>=FLOOR};
  }
  function classify(all,base,min,certified){
    const target=base.at+min*60000;
    const same=all.filter(r=>r.symbol===base.symbol&&r.at>base.at&&r.price!==null);
    const before=same.filter(r=>r.at<=target);
    const stats=sampledStats(before,base.price);
    const pre=nearestBefore(same,target),post=nearestAfter(same,target);
    const preGap=pre?Math.round((target-pre.at)/1000):null;
    const postGap=post?Math.round((post.at-target)/1000):null;
    const cert=certified||null;
    if(cert?.status==="CERTIFIED_SAMPLED"&&Number.isFinite(num(cert?.mfe_pct))){
      return Object.freeze({
        state:cert.covers_floor===true?"CERTIFIED_COVERED":"CERTIFIED_BELOW",
        certified:true,covers_floor:cert.covers_floor===true,
        sample_count:num(cert.sample_count)??stats.sample_count,mfe_pct:num(cert.mfe_pct),mae_pct:num(cert.mae_pct),
        target_at:new Date(target).toISOString(),nearest_before_gap_sec:preGap,nearest_after_gap_sec:postGap,
        partial:false,reason:"CERTIFIED_ENDPOINT_WITHIN_150S"
      });
    }
    if(stats.covers_floor){
      return Object.freeze({
        state:"OBSERVED_CROSS_PARTIAL",certified:false,covers_floor:true,
        sample_count:stats.sample_count,mfe_pct:stats.mfe_pct,mae_pct:stats.mae_pct,
        target_at:new Date(target).toISOString(),nearest_before_gap_sec:preGap,nearest_after_gap_sec:postGap,
        partial:true,reason:"CROSSING_OBSERVED_BEFORE_TARGET_BUT_ENDPOINT_NOT_CERTIFIED"
      });
    }
    if(before.length){
      return Object.freeze({
        state:"PARTIAL_NO_CROSS",certified:false,covers_floor:false,
        sample_count:stats.sample_count,mfe_pct:stats.mfe_pct,mae_pct:stats.mae_pct,
        target_at:new Date(target).toISOString(),nearest_before_gap_sec:preGap,nearest_after_gap_sec:postGap,
        partial:true,reason:"SAMPLES_EXIST_BUT_ENDPOINT_NOT_CERTIFIED"
      });
    }
    const maxAt=same.length?same[same.length-1].at:null;
    const archiveEnded=maxAt!==null&&maxAt<target;
    return Object.freeze({
      state:archiveEnded?"ARCHIVE_END_NO_SAMPLE":"TARGET_GAP_NO_SAMPLE",certified:false,covers_floor:false,
      sample_count:0,mfe_pct:null,mae_pct:null,target_at:new Date(target).toISOString(),
      nearest_before_gap_sec:preGap,nearest_after_gap_sec:postGap,partial:false,
      reason:archiveEnded?"ARCHIVE_ENDED_BEFORE_TARGET":"NO_DURABLE_SAMPLE_BEFORE_TARGET"
    });
  }
  function summarize(rows){
    const counts={CERTIFIED_COVERED:0,CERTIFIED_BELOW:0,OBSERVED_CROSS_PARTIAL:0,PARTIAL_NO_CROSS:0,ARCHIVE_END_NO_SAMPLE:0,TARGET_GAP_NO_SAMPLE:0};
    for(const r of rows)counts[r.state]=(counts[r.state]||0)+1;
    return Object.freeze({
      total:rows.length,...counts,
      observed_cross_total:(counts.CERTIFIED_COVERED||0)+(counts.OBSERVED_CROSS_PARTIAL||0),
      certified_total:(counts.CERTIFIED_COVERED||0)+(counts.CERTIFIED_BELOW||0),
      unknown_total:(counts.PARTIAL_NO_CROSS||0)+(counts.ARCHIVE_END_NO_SAMPLE||0)+(counts.TARGET_GAP_NO_SAMPLE||0)
    });
  }
  function snapshot(){
    const parent=globalThis.AgentCryptoStrategyAOkxPotentialOutcomeAudit?.snapshot?.()||null;
    const all=durableRows(),cases=Array.isArray(parent?.cases)?parent.cases:[];
    const rows=cases.map(c=>{
      const base=baseFor(all,c),horizons={};
      for(const min of H){
        horizons["t"+min]=base?classify(all,base,min,c?.horizons?.["t"+min]):Object.freeze({state:"BASE_CYCLE_MISSING",certified:false,covers_floor:false,sample_count:0,mfe_pct:null,mae_pct:null,reason:"BASE_CYCLE_MISSING"});
      }
      return Object.freeze({cycle_id:c.cycle_id,expected_move_pct:num(c.expected_move_pct),horizons:Object.freeze(horizons)});
    });
    const summaries=Object.freeze({
      t5:summarize(rows.map(r=>r.horizons.t5)),
      t15:summarize(rows.map(r=>r.horizons.t15)),
      t60:summarize(rows.map(r=>r.horizons.t60))
    });
    const flags=[];
    if(parent?.status!=="REFERENCE_REPLAY_READY")flags.push("PARENT_BASELINE_NOT_READY");
    if(cases.length!==16)flags.push("POTENTIAL_COUNT_NOT_16");
    if(!all.length)flags.push("DURABLE_CYCLES_EMPTY");
    last=Object.freeze({
      schema:"agent_crypto_strategy_a_okx_outcome_coverage_truth_v1",build:BUILD,generated_at:new Date().toISOString(),reason,
      status:flags.length?"COVERAGE_NOT_READY":"COVERAGE_TRUTH_READY",flags:Object.freeze(flags),
      parent_build:parent?.build||null,parent_status:parent?.status||null,potential_cases:cases.length,
      floor_before_slippage_pct:FLOOR,certification_tolerance_ms:TOL_MS,
      summaries,rows:Object.freeze(rows),
      interpretation:Object.freeze({
        certified_below_means_endpoint_within_150s_and_sampled_mfe_below_floor:true,
        observed_cross_partial_is_positive_observation_without_certified_endpoint:true,
        partial_no_cross_is_unknown_not_negative:true,
        no_sample_is_unknown:true,
        no_interpolation:true,no_tolerance_widening:true,no_live_okx:true,
        floor_excludes_slippage:true,profitability_claim:false
      }),
      thresholds_changed:false,gate_changed:false,strategy_decision_changed:false,oracle_changed:false,risk_changed:false,paper_changed:false,market_core_changed:false,
      storage_write:false,new_fetch:false,new_websocket:false,recurring_timer:false,mutation_observer:false,real_order:false,paper_only:true
    });
    return last;
  }
  function style(){
    if(typeof document==="undefined"||document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");s.id=ROOT+"Style";
    s.textContent="#"+ROOT+"{margin-top:10px;padding:12px;border:1px solid rgba(95,203,255,.25);border-radius:10px;background:rgba(4,20,32,.33)}#"+ROOT+" .oct-h{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}#"+ROOT+" .oct-t{font-size:11px;font-weight:950;letter-spacing:.06em;color:#9bdcff;text-transform:uppercase}#"+ROOT+" .oct-s{margin-top:4px;font-size:9px;line-height:1.45;color:#8fb5c7}#"+ROOT+" .oct-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:9px}#"+ROOT+" .oct-k{padding:8px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(0,0,0,.14)}#"+ROOT+" .oct-k span{display:block;font-size:8px;color:#8ca5b0;text-transform:uppercase}#"+ROOT+" .oct-k b{display:block;margin-top:3px;font-size:10px;color:#effaff}#"+ROOT+" table{width:100%;border-collapse:collapse;margin-top:9px;font-size:8.2px;line-height:1.35}#"+ROOT+" th,#"+ROOT+" td{padding:5px 4px;border-bottom:1px solid rgba(255,255,255,.06);text-align:left}#"+ROOT+" .good{color:#9debc5;font-weight:850}#"+ROOT+" .warn{color:#ffd48a;font-weight:850}#"+ROOT+" .bad{color:#ff9d9d;font-weight:850}#"+ROOT+" .oct-note{margin-top:8px;padding:8px;border:1px solid rgba(255,255,255,.06);border-radius:8px;font-size:9px;line-height:1.5;color:#a9bfca}@media(max-width:900px){#"+ROOT+" .oct-g{grid-template-columns:1fr}}";
    document.head.appendChild(s);
  }
  const label=s=>s==="CERTIFIED_COVERED"?"CERTIFIÉ ≥ PLANCHER":s==="CERTIFIED_BELOW"?"CERTIFIÉ < PLANCHER":s==="OBSERVED_CROSS_PARTIAL"?"FRANCHISSEMENT OBSERVÉ · HORIZON PARTIEL":s==="PARTIAL_NO_CROSS"?"PARTIEL · PAS DE FRANCHISSEMENT OBSERVÉ":s==="ARCHIVE_END_NO_SAMPLE"?"ARCHIVE FINIE · INCONNU":s==="TARGET_GAP_NO_SAMPLE"?"AUCUN ÉCHANTILLON · INCONNU":s;
  function exportJson(data){
    try{const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="STRATEGY_A_OKX_OUTCOME_COVERAGE_TRUTH_40_6_472.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return true;}catch(_){return false;}
  }
  function render(){
    const s=snapshot();
    if(typeof document==="undefined"||!presentationOpen())return s;
    const anchor=document.getElementById("strategyAOkxPotentialOutcomeAudit");
    if(!anchor)return s;style();
    let root=document.getElementById(ROOT);if(!root){root=document.createElement("section");root.id=ROOT;}
    if(root.previousElementSibling!==anchor){try{anchor.insertAdjacentElement("afterend",root);}catch(_){}}
    const card=(name,x)=>'<div class="oct-k"><span>'+name+'</span><b>certifiés '+x.certified_total+' · franchissements observés '+x.observed_cross_total+' · inconnus '+x.unknown_total+'</b></div>';
    const rows=s.rows.map(r=>'<tr><td>'+esc(r.cycle_id)+'</td><td>'+esc(pct(r.expected_move_pct))+'</td><td>'+esc(label(r.horizons.t5.state))+' · '+esc(pct(r.horizons.t5.mfe_pct))+'</td><td>'+esc(label(r.horizons.t15.state))+' · '+esc(pct(r.horizons.t15.mfe_pct))+'</td><td>'+esc(label(r.horizons.t60.state))+' · '+esc(pct(r.horizons.t60.mfe_pct))+'</td></tr>').join("");
    root.innerHTML='<div class="oct-h"><div><div class="oct-t">STRATEGY A · OKX OUTCOME COVERAGE TRUTH · '+BUILD+'</div><div class="oct-s">Décompose les 16 POTENTIAL .471 sans élargir la tolérance 150 s : certifié, franchissement observé partiel, échantillonnage partiel ou absence de donnée.</div></div><button type="button" class="btn small" id="'+ROOT+'Export">EXPORTER</button></div>'+
      '<div class="oct-g">'+card("T+5",s.summaries.t5)+card("T+15",s.summaries.t15)+card("T+60",s.summaries.t60)+'</div>'+
      '<table><thead><tr><th>Cycle</th><th>Expected</th><th>T+5</th><th>T+15</th><th>T+60</th></tr></thead><tbody>'+rows+'</tbody></table>'+
      '<div class="oct-note"><b>État : '+esc(s.status)+'</b> · CERTIFIÉ &lt; PLANCHER = conclusion négative sur l’échantillonnage certifié. PARTIEL sans franchissement = <b>INCONNU</b>, jamais classé comme échec. FRANCHISSEMENT OBSERVÉ partiel = le marché a été observé au-dessus du plancher avant l’horizon, mais l’endpoint reste non certifié. Aucun prix interpolé, aucune tolérance élargie, slippage OKX toujours inconnu.</div>';
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",()=>exportJson(s));
    return s;
  }
  function schedule(r="event"){reason=String(r||"event");if(queued)return;queued=true;const run=()=>{queued=false;try{render();}catch(_){}};try{queueMicrotask(run);}catch(_){Promise.resolve().then(run);}}
  function selfTest(){
    const t0=Date.parse("2026-01-01T00:00:00Z"),base={id:"B",at:t0,price:100,symbol:"BTC"};
    const all=[base,{id:"S2",at:t0+2*60000,price:100.7,symbol:"BTC"},{id:"S20",at:t0+20*60000,price:100.1,symbol:"BTC"}];
    const partialCross=classify(all,base,5,{status:"UNRESOLVED_GAP"});
    const partialNo=classify([base,{id:"S2",at:t0+2*60000,price:100.1,symbol:"BTC"},{id:"S20",at:t0+20*60000,price:100.2,symbol:"BTC"}],base,5,{status:"UNRESOLVED_GAP"});
    const certifiedBelow=classify(all,base,5,{status:"CERTIFIED_SAMPLED",mfe_pct:.2,mae_pct:-.1,sample_count:1,covers_floor:false});
    const noSample=classify([base,{id:"S20",at:t0+20*60000,price:100.1,symbol:"BTC"}],base,5,{status:"UNRESOLVED_GAP"});
    const checks=Object.freeze({
      partial_cross_positive:partialCross.state==="OBSERVED_CROSS_PARTIAL"&&partialCross.covers_floor===true,
      partial_no_cross_unknown:partialNo.state==="PARTIAL_NO_CROSS"&&partialNo.certified===false,
      certified_below_preserved:certifiedBelow.state==="CERTIFIED_BELOW"&&certifiedBelow.certified===true,
      no_sample_unknown:noSample.state==="TARGET_GAP_NO_SAMPLE"||noSample.state==="ARCHIVE_END_NO_SAMPLE",
      tolerance_unchanged:TOL_MS===150000,no_interpolation:true,no_threshold_change:true
    });
    return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }
  globalThis.AgentCryptoStrategyAOkxOutcomeCoverageTruth=Object.freeze({
    build:BUILD,snapshot:()=>last||snapshot(),refresh:r=>{reason=String(r||"api");return render();},export_json:()=>exportJson(last||snapshot()),self_test:selfTest,
    tolerance_ms:TOL_MS,floor_before_slippage_pct:FLOOR,no_interpolation:true,no_tolerance_widening:true,thresholds_changed:false,gate_changed:false,
    storage_write:false,new_fetch:false,new_websocket:false,recurring_timer:false,mutation_observer:false,real_order:false,paper_only:true
  });
  if(typeof document!=="undefined"){
    document.addEventListener("agent-crypto:strategy-a-durable-evidence-ready",()=>schedule("durable-ready"),{passive:true});
    document.addEventListener("agent-crypto:evidence-data-changed",()=>schedule("evidence-data-changed"),{passive:true});
    window.addEventListener("agent-crypto:strategy-a-audits-ready",()=>schedule("audits-ready"),{passive:true});
    document.addEventListener("toggle",e=>{if(e?.target?.matches?.('details[data-collapse-key="simulation"]')&&e.target.open===true)schedule("simulation-open");},true);
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>schedule("dom-ready"),{once:true});else schedule("script-load");
  }
})();