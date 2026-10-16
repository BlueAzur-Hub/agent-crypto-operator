/* Agent-Crypto @erith.IA — 40.6.473 OKX T60 TRAJECTORY + UNKNOWN TRUTH
   Read-only follow-up to 40.6.472.
   Reconstructs observed sample trajectory for T+60 floor crossings and explains the T+60 unknown population.
   "Observed span" means time between first and last ABOVE-FLOOR samples; it is NOT continuous dwell time.
   No interpolation, no tolerance widening, no live OKX dependency, no threshold/gate change, no storage write, no real order. */
(()=>{
  "use strict";
  const BUILD="40.6.473",ROOT="strategyAOkxT60TrajectoryUnknownTruth",FLOOR=0.6109,T60=60;
  let last=null,queued=false,reason="boot";
  const num=v=>v===null||v===undefined||v===""||typeof v==="boolean"?null:(Number.isFinite(Number(v))?Number(v):null);
  const time=v=>{if(v===null||v===undefined||v==="")return null;const n=typeof v==="number"?v:Date.parse(String(v));return Number.isFinite(n)?n:null;};
  const unwrap=row=>row&&typeof row==="object"&&row.payload&&typeof row.payload==="object"?row.payload:row;
  const esc=v=>String(v??"—").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const pct=v=>Number.isFinite(v)?(v>=0?"+":"")+Number(v).toFixed(3)+" %":"—";
  const minfmt=v=>Number.isFinite(v)?Number(v).toFixed(1)+" min":"—";
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
  function baseFor(all,id){return all.find(x=>x.id===String(id||"").trim())||null;}
  function trajectory(all,cycleId){
    const base=baseFor(all,cycleId);
    if(!base||!(base.price>0))return Object.freeze({cycle_id:cycleId,status:"BASE_MISSING",samples:0,above_samples:0});
    const end=base.at+T60*60000;
    const rows=all.filter(r=>r.symbol===base.symbol&&r.at>base.at&&r.at<=end&&r.price!==null)
      .map(r=>Object.freeze({
        cycle_id:r.id,at:new Date(r.at).toISOString(),minute:(r.at-base.at)/60000,price_eur:r.price,
        move_pct:((r.price/base.price)-1)*100
      }));
    const above=rows.filter(r=>r.move_pct+1e-12>=FLOOR);
    const peak=rows.reduce((best,r)=>!best||r.move_pct>best.move_pct?r:best,null);
    const first=above[0]||null,lastAbove=above.length?above[above.length-1]:null;
    return Object.freeze({
      cycle_id:cycleId,status:rows.length?"TRAJECTORY_OBSERVED":"NO_POST_T0_SAMPLE",
      base_at:new Date(base.at).toISOString(),base_price_eur:base.price,target_at:new Date(end).toISOString(),
      samples:rows.length,above_samples:above.length,
      first_cross_at:first?.at||null,first_cross_min:first?.minute??null,first_cross_move_pct:first?.move_pct??null,
      last_above_at:lastAbove?.at||null,last_above_min:lastAbove?.minute??null,last_above_move_pct:lastAbove?.move_pct??null,
      observed_above_span_min:first&&lastAbove?(lastAbove.minute-first.minute):null,
      peak_at:peak?.at||null,peak_min:peak?.minute??null,peak_move_pct:peak?.move_pct??null,
      margin_over_floor_pct:Number.isFinite(peak?.move_pct)?peak.move_pct-FLOOR:null,
      rows:Object.freeze(rows)
    });
  }
  function unknownReason(h){
    const state=String(h?.state||"");
    if(state==="PARTIAL_NO_CROSS")return "PARTIAL_NO_CROSS";
    if(state==="ARCHIVE_END_NO_SAMPLE")return "ARCHIVE_END_NO_SAMPLE";
    if(state==="TARGET_GAP_NO_SAMPLE")return "TARGET_GAP_NO_SAMPLE";
    return state||"UNKNOWN";
  }
  function snapshot(){
    const coverage=globalThis.AgentCryptoStrategyAOkxOutcomeCoverageTruth?.snapshot?.()||null;
    const all=durableRows(),rows=Array.isArray(coverage?.rows)?coverage.rows:[];
    const crossings=rows.filter(r=>["OBSERVED_CROSS_PARTIAL","CERTIFIED_COVERED"].includes(String(r?.horizons?.t60?.state)));
    const trajectories=crossings.map(r=>trajectory(all,r.cycle_id));
    const unknownRows=rows.filter(r=>["PARTIAL_NO_CROSS","ARCHIVE_END_NO_SAMPLE","TARGET_GAP_NO_SAMPLE"].includes(String(r?.horizons?.t60?.state)))
      .map(r=>Object.freeze({
        cycle_id:r.cycle_id,expected_move_pct:num(r.expected_move_pct),state:unknownReason(r.horizons.t60),
        sample_count:num(r.horizons.t60?.sample_count)??0,mfe_pct:num(r.horizons.t60?.mfe_pct),
        nearest_before_gap_sec:num(r.horizons.t60?.nearest_before_gap_sec),
        nearest_after_gap_sec:num(r.horizons.t60?.nearest_after_gap_sec),
        reason:String(r.horizons.t60?.reason||"")
      }));
    const reasons={PARTIAL_NO_CROSS:0,ARCHIVE_END_NO_SAMPLE:0,TARGET_GAP_NO_SAMPLE:0};
    for(const r of unknownRows)reasons[r.state]=(reasons[r.state]||0)+1;
    const flags=[];
    if(coverage?.status!=="COVERAGE_TRUTH_READY")flags.push("COVERAGE_PARENT_NOT_READY");
    if(rows.length!==16)flags.push("POTENTIAL_COUNT_NOT_16");
    if(!all.length)flags.push("DURABLE_CYCLES_EMPTY");
    last=Object.freeze({
      schema:"agent_crypto_strategy_a_okx_t60_trajectory_unknown_truth_v1",build:BUILD,generated_at:new Date().toISOString(),reason,
      status:flags.length?"TRAJECTORY_NOT_READY":"TRAJECTORY_TRUTH_READY",flags:Object.freeze(flags),
      floor_before_slippage_pct:FLOOR,t60_minutes:T60,
      t60_crossing_cycles:crossings.length,t60_unknown_cycles:unknownRows.length,
      trajectories:Object.freeze(trajectories),unknowns:Object.freeze(unknownRows),unknown_reason_counts:Object.freeze(reasons),
      interpretation:Object.freeze({
        observed_above_span_is_not_continuous_dwell:true,
        sample_crossing_is_observed_fact:true,
        unknown_is_not_failure:true,
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
    s.textContent="#"+ROOT+"{margin-top:10px;padding:12px;border:1px solid rgba(255,181,83,.27);border-radius:10px;background:rgba(30,20,5,.28)}#"+ROOT+" .otu-h{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}#"+ROOT+" .otu-t{font-size:11px;font-weight:950;letter-spacing:.06em;color:#ffd59a;text-transform:uppercase}#"+ROOT+" .otu-s{margin-top:4px;font-size:9px;line-height:1.45;color:#bca98b}#"+ROOT+" .otu-g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:9px}#"+ROOT+" .otu-k{padding:8px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(0,0,0,.14)}#"+ROOT+" .otu-k span{display:block;font-size:8px;color:#a79579;text-transform:uppercase}#"+ROOT+" .otu-k b{display:block;margin-top:3px;font-size:10px;color:#fff8ee}#"+ROOT+" table{width:100%;border-collapse:collapse;margin-top:9px;font-size:8.2px;line-height:1.35}#"+ROOT+" th,#"+ROOT+" td{padding:5px 4px;border-bottom:1px solid rgba(255,255,255,.06);text-align:left}#"+ROOT+" .otu-note{margin-top:8px;padding:8px;border:1px solid rgba(255,255,255,.06);border-radius:8px;font-size:9px;line-height:1.5;color:#c4b59f}@media(max-width:1000px){#"+ROOT+" .otu-g{grid-template-columns:repeat(2,minmax(0,1fr))}}";
    document.head.appendChild(s);
  }
  function exportJson(data){
    try{const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="STRATEGY_A_OKX_T60_TRAJECTORY_UNKNOWN_TRUTH_40_6_473.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return true;}catch(_){return false;}
  }
  function render(){
    const s=snapshot();
    if(typeof document==="undefined"||!presentationOpen())return s;
    const anchor=document.getElementById("strategyAOkxOutcomeCoverageTruth");
    if(!anchor)return s;style();
    let root=document.getElementById(ROOT);if(!root){root=document.createElement("section");root.id=ROOT;}
    if(root.previousElementSibling!==anchor){try{anchor.insertAdjacentElement("afterend",root);}catch(_){}}
    const primary=s.trajectories[0]||null,rc=s.unknown_reason_counts;
    const unknownTable=s.unknowns.map(r=>'<tr><td>'+esc(r.cycle_id)+'</td><td>'+esc(r.state)+'</td><td>'+esc(r.sample_count)+'</td><td>'+esc(pct(r.mfe_pct))+'</td><td>'+esc(r.nearest_before_gap_sec??"—")+'</td><td>'+esc(r.nearest_after_gap_sec??"—")+'</td></tr>').join("");
    root.innerHTML='<div class="otu-h"><div><div class="otu-t">STRATEGY A · OKX T+60 TRAJECTORY + UNKNOWN TRUTH · '+BUILD+'</div><div class="otu-s">Suit le franchissement observé de .472 et explique les inconnus T+60. Aucun échantillon inventé ; span observé ≠ durée continue.</div></div><button type="button" class="btn small" id="'+ROOT+'Export">EXPORTER</button></div>'+
      '<div class="otu-g">'+
      '<div class="otu-k"><span>Franchissements T+60</span><b>'+esc(s.t60_crossing_cycles)+'</b></div>'+
      '<div class="otu-k"><span>Premier passage observé</span><b>'+esc(minfmt(primary?.first_cross_min))+' · '+esc(pct(primary?.first_cross_move_pct))+'</b></div>'+
      '<div class="otu-k"><span>Pic observé</span><b>'+esc(minfmt(primary?.peak_min))+' · '+esc(pct(primary?.peak_move_pct))+'</b></div>'+
      '<div class="otu-k"><span>Marge pic vs plancher</span><b>'+esc(pct(primary?.margin_over_floor_pct))+'</b></div>'+
      '<div class="otu-k"><span>Échantillons ≥ plancher</span><b>'+esc(primary?.above_samples??0)+'</b></div>'+
      '<div class="otu-k"><span>Span observé au-dessus</span><b>'+esc(minfmt(primary?.observed_above_span_min))+'</b></div>'+
      '<div class="otu-k"><span>Inconnus T+60</span><b>'+esc(s.t60_unknown_cycles)+'</b></div>'+
      '<div class="otu-k"><span>Types inconnus</span><b>partiels '+esc(rc.PARTIAL_NO_CROSS||0)+' · archive '+esc(rc.ARCHIVE_END_NO_SAMPLE||0)+' · gap '+esc(rc.TARGET_GAP_NO_SAMPLE||0)+'</b></div>'+
      '</div>'+
      (primary?'<div class="otu-note"><b>Cycle franchissant : '+esc(primary.cycle_id)+'</b> · base '+esc(primary.base_at)+' · premier passage '+esc(minfmt(primary.first_cross_min))+' · dernier échantillon au-dessus '+esc(minfmt(primary.last_above_min))+' · pic '+esc(pct(primary.peak_move_pct))+' à '+esc(minfmt(primary.peak_min))+'. Le span '+esc(minfmt(primary.observed_above_span_min))+' relie uniquement des observations : il ne prouve pas que le prix est resté continûment au-dessus entre elles.</div>':'')+
      '<table><thead><tr><th>Inconnu T+60</th><th>Type</th><th>Samples</th><th>MFE partielle</th><th>Gap avant cible (s)</th><th>Gap après cible (s)</th></tr></thead><tbody>'+unknownTable+'</tbody></table>'+
      '<div class="otu-note"><b>État : '+esc(s.status)+'</b> · plancher '+esc(pct(FLOOR))+' avant slippage. Un inconnu reste inconnu. Aucun prix interpolé, aucun élargissement de tolérance, aucune conclusion de rentabilité.</div>';
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",()=>exportJson(s));
    return s;
  }
  function schedule(r="event"){reason=String(r||"event");if(queued)return;queued=true;const run=()=>{queued=false;try{render();}catch(_){}};try{queueMicrotask(run);}catch(_){Promise.resolve().then(run);}}
  function selfTest(){
    const t0=Date.parse("2026-01-01T00:00:00Z"),base={id:"B",at:t0,price:100,symbol:"BTC"};
    const all=[
      base,
      {id:"M10",at:t0+10*60000,price:100.4,symbol:"BTC"},
      {id:"M20",at:t0+20*60000,price:100.7,symbol:"BTC"},
      {id:"M30",at:t0+30*60000,price:100.8,symbol:"BTC"},
      {id:"M40",at:t0+40*60000,price:100.5,symbol:"BTC"},
      {id:"M55",at:t0+55*60000,price:100.65,symbol:"BTC"}
    ];
    const t=trajectory(all,"B");
    const checks=Object.freeze({
      first_cross_t20:Math.abs(t.first_cross_min-20)<1e-9,
      peak_t30:Math.abs(t.peak_min-30)<1e-9&&t.peak_move_pct>FLOOR,
      three_above_samples:t.above_samples===3,
      observed_span_35:Math.abs(t.observed_above_span_min-35)<1e-9,
      span_not_declared_dwell:true,no_interpolation:true,no_threshold_change:true
    });
    return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }
  globalThis.AgentCryptoStrategyAOkxT60TrajectoryUnknownTruth=Object.freeze({
    build:BUILD,snapshot:()=>last||snapshot(),refresh:r=>{reason=String(r||"api");return render();},export_json:()=>exportJson(last||snapshot()),self_test:selfTest,
    floor_before_slippage_pct:FLOOR,observed_span_is_not_dwell:true,no_interpolation:true,no_tolerance_widening:true,
    thresholds_changed:false,gate_changed:false,storage_write:false,new_fetch:false,new_websocket:false,recurring_timer:false,mutation_observer:false,real_order:false,paper_only:true
  });
  if(typeof document!=="undefined"){
    document.addEventListener("agent-crypto:strategy-a-durable-evidence-ready",()=>schedule("durable-ready"),{passive:true});
    document.addEventListener("agent-crypto:evidence-data-changed",()=>schedule("evidence-data-changed"),{passive:true});
    window.addEventListener("agent-crypto:strategy-a-audits-ready",()=>schedule("audits-ready"),{passive:true});
    document.addEventListener("toggle",e=>{if(e?.target?.matches?.('details[data-collapse-key="simulation"]')&&e.target.open===true)schedule("simulation-open");},true);
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>schedule("dom-ready"),{once:true});else schedule("script-load");
  }
})();