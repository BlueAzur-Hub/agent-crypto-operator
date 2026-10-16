/* Agent-Crypto @erith.IA — 40.6.467 STRATEGY A REAL VENUE COST SHADOW TRUTH
   Read-only counterfactual audit. Replays historical COST_GATE_WAIT cycle expected_move values
   against the current measured execution-cost snapshot without changing Strategy A, Risk, Paper,
   Oracle, Market Core, storage or thresholds. Kraken can produce a complete market->market shadow
   estimate for measured ticket sizes. OKX remains an observable lower-bound only until backend
   multi-level depth/slippage is exposed; OKX can therefore be POTENTIAL, never certified PASS. */
(() => {
  "use strict";
  const BUILD="40.6.467", ROOT="strategyARealVenueCostShadowTruth", CANONICAL_TICKET_EUR=50;
  let last=null,queued=false,reason="boot";
  const num=v=>v===null||v===undefined||v===""||typeof v==="boolean"?null:(Number.isFinite(Number(v))?Number(v):null);
  const pct=v=>Number.isFinite(v)?(v>=0?"+":"")+Number(v).toFixed(4)+" %":"—";
  const esc=v=>String(v??"—").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const presentationOpen=()=>{if(typeof document==="undefined")return true;const node=document.querySelector('details[data-collapse-key="simulation"]');return !(node instanceof HTMLDetailsElement)||node.open===true;};

  function inputs(){
    let audit=null,execution=null,calibration=null,spec=null;
    try{audit=globalThis.AgentCryptoStrategyACostWaitOutcomeAudit406429?.snapshot?.()||null;}catch(_){}
    try{execution=globalThis.AgentCryptoStrategyAExecutionCostTruth?.snapshot?.()||null;}catch(_){}
    try{calibration=globalThis.AgentCryptoStrategyAOracleCostCalibrationAudit?.snapshot?.()||null;}catch(_){}
    try{spec=globalThis.AgentCryptoStrategyACanonicalSpec?.spec||null;}catch(_){}
    return {audit,execution,calibration,spec};
  }
  function cyclesFromAudit(audit){
    return (Array.isArray(audit?.cases)?audit.cases:[]).map(row=>Object.freeze({
      cycle_id:String(row?.cycle_id||""),captured_at:row?.captured_at||null,
      expected_move_pct:num(row?.expected_move_pct),legacy_required_move_pct:num(row?.required_move_pct),
      legacy_total_cost_pct:num(row?.total_cost_pct),classification:String(row?.classification||"UNKNOWN")
    })).filter(row=>row.cycle_id);
  }
  function compareComplete(cycles,costPct,marginPct){
    const cost=num(costPct),margin=num(marginPct),required=cost!==null&&margin!==null?cost+margin:null;
    let pass=0,wait=0,unknown=0;
    const pass_ids=[],wait_ids=[];
    for(const row of cycles){
      const x=num(row.expected_move_pct);
      if(x===null||required===null){unknown++;continue;}
      if(x+1e-12>=required){pass++;pass_ids.push(row.cycle_id);}else{wait++;wait_ids.push(row.cycle_id);}
    }
    return Object.freeze({cost_pct:cost,safety_margin_pct:margin,shadow_required_move_pct:required,shadow_pass:pass,shadow_wait:wait,unknown,shadow_pass_cycle_ids:Object.freeze(pass_ids),shadow_wait_cycle_ids:Object.freeze(wait_ids)});
  }
  function compareLowerBound(cycles,floorCostPct,marginPct){
    const floor=num(floorCostPct),margin=num(marginPct),requiredFloor=floor!==null&&margin!==null?floor+margin:null;
    let potential=0,definiteWait=0,unknown=0;
    const potentialIds=[],waitIds=[];
    for(const row of cycles){
      const x=num(row.expected_move_pct);
      if(x===null||requiredFloor===null){unknown++;continue;}
      if(x+1e-12>=requiredFloor){potential++;potentialIds.push(row.cycle_id);}else{definiteWait++;waitIds.push(row.cycle_id);}
    }
    return Object.freeze({observable_cost_floor_pct:floor,safety_margin_pct:margin,required_floor_before_slippage_pct:requiredFloor,potential_pass_before_slippage:potential,definite_wait_before_slippage:definiteWait,unknown,certified_pass:0,potential_cycle_ids:Object.freeze(potentialIds),definite_wait_cycle_ids:Object.freeze(waitIds),slippage_status:"UNKNOWN",depth_status:"NOT_EXPOSED"});
  }
  function legacySummary(cycles){
    let pass=0,wait=0,unknown=0;const passIds=[];
    for(const row of cycles){const x=num(row.expected_move_pct),req=num(row.legacy_required_move_pct);if(x===null||req===null){unknown++;continue;}if(x+1e-12>=req){pass++;passIds.push(row.cycle_id);}else wait++;}
    return Object.freeze({pass,wait,unknown,pass_cycle_ids:Object.freeze(passIds)});
  }
  function snapshot(){
    const {audit,execution,calibration,spec}=inputs(),cycles=cyclesFromAudit(audit);
    const margin=num(calibration?.cost_model?.safety_margin_pct)??num(spec?.policy?.cost_safety_margin_pct);
    const ticket=num(spec?.profile?.ticket_eur)??CANONICAL_TICKET_EUR;
    const ticketSource=num(spec?.profile?.ticket_eur)!==null?"CANONICAL_SPEC_RUNTIME":"CANONICAL_SPEC_FALLBACK_50";
    const kraken=execution?.venues?.kraken||null,okx=execution?.venues?.okx||null;
    const krakenRows=[];
    for(const sim of Array.isArray(kraken?.simulations)?kraken.simulations:[]){
      const amount=num(sim?.amount_eur),cost=num(sim?.market_market_estimated_cost_pct);
      if(amount===null)continue;
      krakenRows.push(Object.freeze({amount_eur:amount,source_cost_complete:Number.isFinite(cost),...compareComplete(cycles,cost,margin)}));
    }
    const okxFloor=num(okx?.fee_plus_spread_snapshot_pct);
    const okxShadow=compareLowerBound(cycles,okxFloor,margin);
    const comparable=cycles.filter(x=>Number.isFinite(x.expected_move_pct)).length;
    const ticketRow=krakenRows.find(x=>ticket!==null&&Math.abs(x.amount_eur-ticket)<1e-9)||null;
    const flags=[];
    if(!audit)flags.push("COST_WAIT_AUDIT_NOT_READY");
    if(!execution)flags.push("EXECUTION_COST_SNAPSHOT_NOT_READY");
    if(margin===null)flags.push("SAFETY_MARGIN_UNKNOWN");
    if(!kraken?.ok)flags.push("KRAKEN_MEASUREMENT_UNAVAILABLE");
    if(!okx?.ok)flags.push("OKX_MEASUREMENT_UNAVAILABLE");
    if(okx?.ok&&okx?.depth_available===false)flags.push("OKX_SLIPPAGE_UNKNOWN");
    last=Object.freeze({
      schema:"agent_crypto_strategy_a_real_venue_cost_shadow_truth_v1",build:BUILD,generated_at:new Date().toISOString(),reason,
      status:flags.some(x=>/NOT_READY|UNKNOWN|UNAVAILABLE/.test(x))?"REVIEW_REQUIRED":"SHADOW_READY",
      flags:Object.freeze(flags),
      population:Object.freeze({cost_wait_cycles:cycles.length,expected_move_comparable:comparable,source_build:audit?.build||null,source_sampling:audit?.outcome_sampling||null}),
      canonical_profile:Object.freeze({ticket_eur:ticket,ticket_source:ticketSource,safety_margin_pct:margin,legacy_gate_policy_pct:num(spec?.policy?.cost_required_move_pct)}),
      legacy:legacySummary(cycles),
      execution_snapshot:Object.freeze({build:execution?.build||null,generated_at:execution?.generated_at||null,status:execution?.status||null,pair:execution?.pair||"BTC/EUR"}),
      kraken:Object.freeze({available:kraken?.ok===true,venue:kraken?.venue||"Kraken Pro",measurement_scope:kraken?.measurement_scope||"ORDERBOOK_SIMULATION",rows:Object.freeze(krakenRows),canonical_ticket_row:ticketRow}),
      okx:Object.freeze({available:okx?.ok===true,venue:okx?.venue||"OKX Europe",measurement_scope:okx?.measurement_scope||null,freshness_state:okx?.freshness_state||null,fee_plus_spread_snapshot_pct:okxFloor,shadow:okxShadow}),
      cycles:Object.freeze(cycles),
      interpretation:Object.freeze({
        kraken:"Counterfactual only: historical Oracle envelope values are compared with the CURRENT Kraken order-book cost snapshot plus the canonical safety margin.",
        okx:"Lower-bound counterfactual only: fee + current spread + safety margin are known, but multi-level depth/slippage are unknown. POTENTIAL is not PASS.",
        historical_cost_proof:false,profitability_claim:false,platform_choice:false
      }),
      thresholds_changed:false,strategy_decision_changed:false,oracle_math_changed:false,risk_changed:false,paper_changed:false,market_core_changed:false,
      storage_write:false,new_fetch:false,new_websocket:false,recurring_timer:false,mutation_observer:false,real_order:false,paper_only:true,automatic_platform_choice:false
    });
    return last;
  }
  function style(){
    if(typeof document==="undefined"||document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");s.id=ROOT+"Style";
    s.textContent="#"+ROOT+"{margin-top:10px;padding:12px;border:1px solid rgba(94,195,255,.32);border-radius:10px;background:rgba(5,20,32,.28)}#"+ROOT+" .rvc-h{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}#"+ROOT+" .rvc-t{font-size:11px;font-weight:950;letter-spacing:.06em;color:#a9e0ff;text-transform:uppercase}#"+ROOT+" .rvc-s{margin-top:4px;font-size:9px;line-height:1.45;color:#93aebe}#"+ROOT+" .rvc-g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:9px}#"+ROOT+" .rvc-k{padding:8px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(0,0,0,.15)}#"+ROOT+" .rvc-k span{display:block;font-size:8px;color:#879ca8;text-transform:uppercase}#"+ROOT+" .rvc-k b{display:block;margin-top:3px;font-size:10px;color:#ecf8ff}#"+ROOT+" table{width:100%;border-collapse:collapse;margin-top:9px;font-size:9px;line-height:1.35}#"+ROOT+" th,#"+ROOT+" td{padding:6px 5px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right}#"+ROOT+" th:first-child,#"+ROOT+" td:first-child{text-align:left}#"+ROOT+" .rvc-note{margin-top:8px;padding:8px;border:1px solid rgba(255,255,255,.06);border-radius:8px;font-size:9px;line-height:1.5;color:#a9bec9}#"+ROOT+" .rvc-warn{color:#ffd48a;font-weight:850}#"+ROOT+" .rvc-good{color:#99efc8;font-weight:850}@media(max-width:900px){#"+ROOT+" .rvc-g{grid-template-columns:repeat(2,minmax(0,1fr))}}";
    document.head.appendChild(s);
  }
  function exportJson(data){
    try{const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="STRATEGY_A_REAL_VENUE_COST_SHADOW_TRUTH_40_6_466.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return true;}catch(_){return false;}
  }
  function render(){
    const data=snapshot();
    if(typeof document==="undefined"||!presentationOpen())return data;
    const anchor=document.getElementById("strategyAExecutionCostTruth")||document.getElementById("strategyAOracleCostCalibrationAudit");
    if(!anchor)return data;
    style();let root=document.getElementById(ROOT);if(!root){root=document.createElement("section");root.id=ROOT;}
    if(root.previousElementSibling!==anchor){try{anchor.insertAdjacentElement("afterend",root);}catch(_){}}
    const p=data.population,legacy=data.legacy,ticket=data.kraken.canonical_ticket_row,ok=data.okx.shadow;
    const krRows=(data.kraken.rows||[]).map(row=>'<tr><td>Kraken · '+esc(row.amount_eur)+' €</td><td>'+esc(pct(row.cost_pct))+'</td><td>'+esc(pct(row.shadow_required_move_pct))+'</td><td>'+esc(row.shadow_pass)+'</td><td>'+esc(row.shadow_wait)+'</td><td>'+esc(row.unknown)+'</td><td>'+(row.source_cost_complete?'<span class="rvc-good">COMPLET SNAPSHOT</span>':'<span class="rvc-warn">INCONNU</span>')+'</td></tr>').join("");
    const okStatus=data.okx.available?'<span class="rvc-warn">POTENTIEL ≠ PASS · SLIPPAGE INCONNU</span>':'<span class="rvc-warn">MESURE INDISPONIBLE</span>';
    root.innerHTML='<div class="rvc-h"><div><div class="rvc-t">STRATEGY A · REAL VENUE COST SHADOW TRUTH · '+BUILD+'</div><div class="rvc-s">Lecture seule · cycles COST WAIT historiques × snapshot de coût venue courant · aucune modification Strategy A.</div></div><button type="button" class="btn small" id="'+ROOT+'Export">EXPORTER</button></div>'+
      '<div class="rvc-g"><div class="rvc-k"><span>Cost Wait historiques</span><b>'+esc(p.cost_wait_cycles)+'</b></div><div class="rvc-k"><span>Expected comparables</span><b>'+esc(p.expected_move_comparable)+'</b></div><div class="rvc-k"><span>Legacy PASS</span><b>'+esc(legacy.pass)+'</b></div><div class="rvc-k"><span>Ticket canonique</span><b>'+esc(ticket?ticket.amount_eur:(data.canonical_profile.ticket_eur??"—"))+' €</b></div></div>'+
      '<table><thead><tr><th>Shadow</th><th>Coût snapshot</th><th>Coût + marge</th><th>PASS / potentiel</th><th>WAIT certain</th><th>Inconnu</th><th>Preuve</th></tr></thead><tbody>'+krRows+
      '<tr><td>OKX · Market→Market</td><td>'+esc(pct(ok.observable_cost_floor_pct))+'</td><td>'+esc(pct(ok.required_floor_before_slippage_pct))+'</td><td>'+esc(ok.potential_pass_before_slippage)+'</td><td>'+esc(ok.definite_wait_before_slippage)+'</td><td>'+esc(ok.unknown)+'</td><td>'+okStatus+'</td></tr></tbody></table>'+
      '<div class="rvc-note"><b>Lecture :</b> Kraken peut produire un shadow complet pour les tickets dont le carnet est mesuré. Au ticket canonique '+esc(data.canonical_profile.ticket_eur??"—")+' €, le résultat est <b>'+esc(ticket?.shadow_pass??"—")+' PASS shadow</b> / '+esc(ticket?.shadow_wait??"—")+' WAIT. OKX montre <b>'+esc(ok.potential_pass_before_slippage)+'</b> cycle(s) qui franchissent le plancher frais + spread + marge <b>avant slippage</b>; ils restent INDETERMINATE tant que le backend n’expose pas la profondeur multi-niveaux. <span class="rvc-warn">Snapshot courant appliqué à l’historique = contrefactuel, pas preuve de coût historique ni de rentabilité.</span></div>';
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",()=>exportJson(data));
    root.dataset.auditBuild=BUILD;root.dataset.readOnly="true";return data;
  }
  function schedule(r="event"){reason=String(r||"event");if(queued)return;queued=true;const run=()=>{queued=false;try{render();}catch(_){}};try{queueMicrotask(run);}catch(_){Promise.resolve().then(run);}}
  function selfTest(){
    const cycles=[.30,.45,.55,.90].map((x,i)=>({cycle_id:"T"+i,expected_move_pct:x,legacy_required_move_pct:.80}));
    const legacy=legacySummary(cycles),kr=compareComplete(cycles,.30,.20),ok=compareLowerBound(cycles,.20,.20);
    const fallbackTicket=(num(null)??CANONICAL_TICKET_EUR)===50;
    const checks=Object.freeze({legacy:legacy.pass===1&&legacy.wait===3,kraken:kr.shadow_pass===2&&kr.shadow_wait===2&&Math.abs(kr.shadow_required_move_pct-.50)<1e-9,okx:ok.potential_pass_before_slippage===3&&ok.definite_wait_before_slippage===1&&ok.certified_pass===0,okx_unknown_slippage:ok.slippage_status==="UNKNOWN",canonical_ticket_fallback:fallbackTicket,read_only:true});
    return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }
  globalThis.AgentCryptoStrategyARealVenueCostShadowTruth=Object.freeze({build:BUILD,snapshot:()=>last||snapshot(),refresh:r=>{reason=String(r||"api");return render();},export_json:()=>exportJson(last||snapshot()),self_test:selfTest,thresholds_changed:false,strategy_decision_changed:false,oracle_math_changed:false,risk_changed:false,paper_changed:false,market_core_changed:false,storage_write:false,new_fetch:false,new_websocket:false,recurring_timer:false,mutation_observer:false,real_order:false,paper_only:true,automatic_platform_choice:false});
  if(typeof document!=="undefined"){
    document.addEventListener("agent-crypto:strategy-a-experiment-cycle",()=>schedule("experiment-cycle"),{passive:true});
    window.addEventListener("agent-crypto:strategy-a-audits-ready",()=>schedule("audits-ready"),{passive:true});
    window.addEventListener("agent-crypto:strategy-a-execution-cost-measured",()=>schedule("execution-cost-measured"),{passive:true});
    document.addEventListener("toggle",e=>{if(e?.target?.matches?.('details[data-collapse-key="simulation"]')&&e.target.open===true)schedule("simulation-open");},true);
    window.addEventListener("pageshow",()=>schedule("pageshow"),{passive:true});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>schedule("dom-ready"),{once:true});else schedule("script-load");
  }
})();