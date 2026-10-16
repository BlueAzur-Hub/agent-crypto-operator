/* Agent-Crypto @erith.IA — Strategy A ↔ TRADUS Outcome Memory
   Administrator 40.6.117 bounded V2 hotfix.
   Derived read-only evidence from the existing comparative shadow ledger plus the existing Oracle historical broker.
   Resolves T+5, T+15 and T+60 from real BTC history when a bounded near-target point exists; otherwise preserves the V1 ledger fallback.
   NO_TRADE/OFF/WAIT are never scored as directional calls.
   No fetch, recurring timer, MutationObserver, storage write, strategy mutation, wallet or order path. */
(()=>{
  "use strict";

  const OWNER="strategy-tradus-outcome-memory";
  const STATUS_ID="strategyTradusOutcomeMemoryStatus";
  const EVENT_NAME="agentcrypto:strategy-tradus-outcome-memory";
  const HISTORY_MAX_OFFSET_MS=180_000;
  const HISTORY_MAX_MEDIAN_STEP_MS=390_000;
  const HORIZONS=Object.freeze([
    Object.freeze({key:"t5",label:"T+5",minutes:5,tolerance_seconds:120}),
    Object.freeze({key:"t15",label:"T+15",minutes:15,tolerance_seconds:300}),
    Object.freeze({key:"t60",label:"T+60",minutes:60,tolerance_seconds:900})
  ]);
  let lastModel=null;

  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const finite=v=>{if(v===null||v===undefined||typeof v==="boolean"||String(v).trim()==="")return null;const n=Number(v);return Number.isFinite(n)?n:null;};
  const upper=v=>String(v??"").trim().toUpperCase();
  const runtimeBuild=()=>String(globalThis.ErithVersionTruth?.build||new URLSearchParams(location.search||"").get("ac-build")||document.querySelector('meta[name="administrator-build"]')?.content||"40.6.117").trim();

  function midOf(row){
    const bid=finite(row?.bid??row?.tick?.bid);
    const ask=finite(row?.ask??row?.tick?.ask);
    if(bid===null||ask===null||bid<=0||ask<=0||bid>ask)return null;
    return (bid+ask)/2;
  }

  function atMs(row){
    const value=Date.parse(String(row?.at||""));
    return Number.isFinite(value)?value:null;
  }

  function tradusSignal(row){return upper(row?.signal?.action??row?.signal??"NO_TRADE")||"NO_TRADE";}
  function strategyDecision(row){
    const value=row?.strategy_a;
    if(value&&typeof value==="object")return upper(value.decision||value.phase||"INCONNU")||"INCONNU";
    return upper(value||"INCONNU")||"INCONNU";
  }
  function strategyDirection(row){
    const value=row?.strategy_a;
    return finite(value&&typeof value==="object"?value.direction_score:row?.strategy_a_direction);
  }
  function comparisonState(row){
    const value=row?.comparison;
    if(value&&typeof value==="object")return upper(value.state||"COMPARAISON")||"COMPARAISON";
    return upper(value||"COMPARAISON")||"COMPARAISON";
  }

  function directionClaim(value){
    const state=upper(value);
    if(/\b(BUY|LONG)\b/.test(state))return "BUY";
    if(/\b(SELL|SHORT)\b/.test(state))return "SELL";
    return null;
  }

  function directionalOutcome(claim,returnRatio){
    if(!claim)return "NO_DIRECTIONAL_CLAIM";
    const r=finite(returnRatio);
    if(r===null)return "UNKNOWN";
    if(Math.abs(r)<1e-12)return "FLAT";
    if(claim==="BUY")return r>0?"ALIGNED":"OPPOSED";
    if(claim==="SELL")return r<0?"ALIGNED":"OPPOSED";
    return "NO_DIRECTIONAL_CLAIM";
  }

  function readLedger(){
    try{
      const rows=globalThis.AgentCryptoTradusShadowLedger?.read?.();
      return Array.isArray(rows)?rows.slice():[];
    }catch(_){return [];}
  }

  function normalizeRows(sourceRows=readLedger()){
    const seen=new Set();
    const out=[];
    for(const row of sourceRows){
      const ms=atMs(row),mid=midOf(row);
      if(ms===null||mid===null)continue;
      const id=String(row?.id||[row?.at,mid,tradusSignal(row),strategyDecision(row),comparisonState(row)].join("|"));
      if(seen.has(id))continue;
      seen.add(id);
      out.push(Object.freeze({
        id,at:String(row.at),at_ms:ms,symbol:String(row?.symbol||row?.tick?.symbol||"BTCEUR"),mid_eur:mid,
        tradus_signal:tradusSignal(row),strategy_a:strategyDecision(row),strategy_a_direction:strategyDirection(row),comparison:comparisonState(row)
      }));
    }
    out.sort((a,b)=>a.at_ms-b.at_ms);
    return out;
  }

  function normalizeHistoryPoint(row){
    let rawTime,rawPrice;
    if(Array.isArray(row)){rawTime=row[0];rawPrice=row[1];}
    else if(row&&typeof row==="object"){
      rawTime=row.x??row.time??row.timestamp??row.t??row.at;
      rawPrice=row.y??row.price_eur??row.price??row.value??row.close??row.c;
    }
    let ms=finite(rawTime),price=finite(rawPrice);
    if(ms===null&&rawTime!==undefined&&rawTime!==null){const parsed=Date.parse(String(rawTime));ms=Number.isFinite(parsed)?parsed:null;}
    if(ms!==null&&ms>0&&ms<1e12)ms*=1000;
    if(ms===null||price===null||ms<=0||price<=0)return null;
    return {at_ms:ms,at:new Date(ms).toISOString(),price_eur:price};
  }

  function medianStep(rows){
    const gaps=[];
    for(let i=1;i<rows.length;i++){const gap=rows[i].at_ms-rows[i-1].at_ms;if(gap>0)gaps.push(gap);}
    if(!gaps.length)return null;
    gaps.sort((a,b)=>a-b);
    const m=Math.floor(gaps.length/2);
    return gaps.length%2?gaps[m]:(gaps[m-1]+gaps[m])/2;
  }

  function normalizeHistory(rows,meta={}){
    const byTime=new Map();
    for(const row of Array.isArray(rows)?rows:[]){const point=normalizeHistoryPoint(row);if(point)byTime.set(point.at_ms,point);}
    const clean=[...byTime.values()].sort((a,b)=>a.at_ms-b.at_ms);
    const step=medianStep(clean);
    const denseEnough=clean.length>=2&&Number.isFinite(step)&&step<=HISTORY_MAX_MEDIAN_STEP_MS;
    return Object.freeze({
      available:clean.length>=2,dense_enough:denseEnough,source:String(meta.source||"unknown"),source_mode:String(meta.source_mode||""),
      points:Object.freeze(clean),point_count:clean.length,median_step_ms:Number.isFinite(step)?step:null,
      first_at:clean[0]?.at||null,last_at:clean.at(-1)?.at||null
    });
  }

  function readBtcHistory(){
    try{
      const api=globalThis.AtlasOracleIndependentEngine;
      if(typeof api?.resolveHistory!=="function")return normalizeHistory([],{source:"oracle_history_api_unavailable"});
      const resolved=api.resolveHistory({id:"bitcoin",symbol:"BTC"});
      const result=resolved?.result||null;
      return normalizeHistory(result?.series||[],{source:resolved?.source||result?.source||"AtlasOracleIndependentEngine",source_mode:result?.sourceMode||""});
    }catch(error){
      return Object.freeze({...normalizeHistory([],{source:"oracle_history_read_error"}),error:String(error?.message||error||"history read error")});
    }
  }

  function nearestHistoryPoint(history,targetMs){
    const rows=history?.points||[];
    if(!rows.length)return null;
    let best=null,bestDistance=Infinity;
    for(const row of rows){
      const distance=Math.abs(row.at_ms-targetMs);
      if(distance<bestDistance){best=row;bestDistance=distance;}
    }
    return best?{sample:best,offset_ms:best.at_ms-targetMs,distance_ms:bestDistance}:null;
  }

  function baseOutcome(base,horizon,targetMs){
    return {label:horizon.label,target_at:new Date(targetMs).toISOString(),baseline_mid_eur:base.mid_eur,baseline_source:"tradus_top_of_book_mid",tradus_outcome:"PENDING",strategy_a_outcome:"PENDING"};
  }

  function settleFromHistory(base,history,horizon){
    const targetMs=base.at_ms+horizon.minutes*60_000;
    if(!history?.available||!history?.dense_enough)return null;
    const latest=history.points.at(-1);
    if(!latest||latest.at_ms<targetMs)return null;
    const nearest=nearestHistoryPoint(history,targetMs);
    if(!nearest||nearest.distance_ms>HISTORY_MAX_OFFSET_MS)return null;
    const ret=nearest.sample.price_eur/base.mid_eur-1;
    return Object.freeze({
      ...baseOutcome(base,horizon,targetMs),state:"SETTLED_HISTORY",resolved_at:nearest.sample.at,lateness_seconds:null,
      offset_seconds:Number((nearest.offset_ms/1000).toFixed(3)),resolved_mid_eur:nearest.sample.price_eur,return_ratio:ret,return_pct:ret*100,
      resolved_source:history.source,resolution:"nearest_real_history",history_median_step_seconds:Number((history.median_step_ms/1000).toFixed(3)),
      tradus_outcome:directionalOutcome(directionClaim(base.tradus_signal),ret),strategy_a_outcome:directionalOutcome(directionClaim(base.strategy_a),ret)
    });
  }

  function settleFromLedger(base,quotes,horizon){
    const targetMs=base.at_ms+horizon.minutes*60_000;
    const sample=quotes.find(row=>row.at_ms>=targetMs&&row.at_ms>base.at_ms);
    if(!sample){
      return Object.freeze({...baseOutcome(base,horizon,targetMs),state:"PENDING",resolved_at:null,lateness_seconds:null,offset_seconds:null,resolved_mid_eur:null,return_ratio:null,return_pct:null,resolved_source:null,resolution:null});
    }
    const ret=sample.mid_eur/base.mid_eur-1;
    const late=Math.max(0,(sample.at_ms-targetMs)/1000);
    const state=late<=horizon.tolerance_seconds?"SETTLED_LEDGER":"SETTLED_LATE";
    return Object.freeze({
      ...baseOutcome(base,horizon,targetMs),state,resolved_at:sample.at,lateness_seconds:Number(late.toFixed(3)),offset_seconds:Number(late.toFixed(3)),
      resolved_mid_eur:sample.mid_eur,return_ratio:ret,return_pct:ret*100,resolved_source:"strategy_tradus_shadow_ledger",resolution:"first_later_ledger_quote",
      tradus_outcome:directionalOutcome(directionClaim(base.tradus_signal),ret),strategy_a_outcome:directionalOutcome(directionClaim(base.strategy_a),ret)
    });
  }

  function settle(base,quotes,history,horizon){return settleFromHistory(base,history,horizon)||settleFromLedger(base,quotes,horizon);}

  function modelFromRows(sourceRows=readLedger(),historyOverride=null){
    const rows=normalizeRows(sourceRows);
    const history=historyOverride?normalizeHistory(historyOverride.rows||historyOverride.points||historyOverride.series||historyOverride,historyOverride):readBtcHistory();
    const observations=rows.map(base=>Object.freeze({
      id:base.id,at:base.at,symbol:base.symbol,baseline_mid_eur:base.mid_eur,tradus_signal:base.tradus_signal,
      strategy_a:base.strategy_a,strategy_a_direction:base.strategy_a_direction,comparison:base.comparison,
      horizons:Object.freeze(Object.fromEntries(HORIZONS.map(h=>[h.key,settle(base,rows,history,h)])))
    }));
    const horizonSummary={};
    for(const h of HORIZONS){
      const outcomes=observations.map(row=>row.horizons[h.key]);
      horizonSummary[h.key]=Object.freeze({
        label:h.label,total:outcomes.length,
        settled:outcomes.filter(x=>x.state==="SETTLED_HISTORY"||x.state==="SETTLED_LEDGER"||x.state==="SETTLED_LATE").length,
        history:outcomes.filter(x=>x.state==="SETTLED_HISTORY").length,
        ledger:outcomes.filter(x=>x.state==="SETTLED_LEDGER").length,
        late:outcomes.filter(x=>x.state==="SETTLED_LATE").length,
        pending:outcomes.filter(x=>x.state==="PENDING").length,
        tradus_aligned:outcomes.filter(x=>x.tradus_outcome==="ALIGNED").length,
        tradus_opposed:outcomes.filter(x=>x.tradus_outcome==="OPPOSED").length,
        tradus_no_claim:outcomes.filter(x=>x.tradus_outcome==="NO_DIRECTIONAL_CLAIM").length
      });
    }
    return Object.freeze({
      schema:"agent_crypto_strategy_tradus_outcome_memory_v2",owner:OWNER,build:runtimeBuild(),generated_at_utc:new Date().toISOString(),
      history:Object.freeze({available:history.available,dense_enough:history.dense_enough,source:history.source,source_mode:history.source_mode,point_count:history.point_count,median_step_ms:history.median_step_ms,first_at:history.first_at,last_at:history.last_at,error:history.error||null}),
      observations:Object.freeze(observations),horizons:Object.freeze(horizonSummary),
      interpretation:"Outcome Memory V2 resolves each due horizon from the nearest bounded real BTC historical point when available. The exact TRADUS top-of-book midpoint remains the T0 baseline. The shadow-ledger first-later quote is only a fallback and remains explicitly late when late. Directional alignment is descriptive evidence, not after-cost profitability.",
      contract:Object.freeze({derived_read_only:true,source_owner:"AgentCryptoTradusShadowLedger + AtlasOracleIndependentEngine",paper_shadow_only:true,financial_signal:false,automatic_order:false,real_order:false,fetch:false,recurring_timer:false,mutation_observer:false,storage_write:false,strategy_mutation:false,tradus_mutation:false,wallet:false,graph_mutation:false,oracle_model_mutation:false})
    });
  }

  function statusText(model){
    const parts=HORIZONS.map(h=>{
      const s=model.horizons[h.key]||{settled:0,total:0,history:0,late:0};
      const detail=[];
      if(s.history)detail.push(`hist ${s.history}`);
      if(s.late)detail.push(`${s.late} tardif${s.late>1?"s":""}`);
      return `${h.label} ${s.settled}/${s.total}${detail.length?` · ${detail.join(" · ")}`:""}`;
    });
    return `OUTCOME MEMORY · ${parts.join(" · ")}`;
  }

  function render(){
    const model=modelFromRows();
    lastModel=model;
    if(typeof document!=="undefined"){
      const host=document.querySelector("#multiStrategyShadowLedger .ms-foot")||document.querySelector("#strategyTradusComparativeIntelligence .sti-foot");
      if(host){
        let node=document.getElementById(STATUS_ID);
        if(!node){node=document.createElement("span");node.id=STATUS_ID;node.dataset.owner=OWNER;host.append(document.createTextNode(" · "),node);}
        node.textContent=statusText(model);
        node.title=model.history?.dense_enough
          ?`T0 = midpoint TRADUS. Horizons résolus sur historique BTC réel borné (${model.history.source}; pas médian ${Math.round(Number(model.history.median_step_ms||0)/1000)} s).`
          :"Historique BTC dense indisponible : fallback ledger conservé. Un échantillon tardif reste explicitement tardif.";
      }
      try{document.dispatchEvent(new CustomEvent(EVENT_NAME,{detail:clone(model)}));}catch(_){}
    }
    return model;
  }

  function schedule(){queueMicrotask(()=>{try{requestAnimationFrame(()=>render());}catch(_){render();}});}

  function selfTest(){
    const t0="2026-09-13T10:00:00.000Z";
    const rows=[{id:"a",at:t0,bid:100,ask:100,signal:"BUY",strategy_a:"NO TRADE",comparison:"DIVERGENCE"}];
    const history={source:"self-test-history",rows:[
      [Date.parse("2026-09-13T10:00:00.000Z"),100],
      [Date.parse("2026-09-13T10:05:00.000Z"),101],
      [Date.parse("2026-09-13T10:10:00.000Z"),100],
      [Date.parse("2026-09-13T10:15:00.000Z"),99],
      [Date.parse("2026-09-13T11:00:00.000Z"),102]
    ]};
    const m=modelFromRows(rows,history);
    const a=m.observations[0];
    const checks={
      t5_history:a?.horizons?.t5?.state==="SETTLED_HISTORY"&&a?.horizons?.t5?.resolved_mid_eur===101,
      t5_buy_aligned:a?.horizons?.t5?.tradus_outcome==="ALIGNED",
      t15_history:a?.horizons?.t15?.state==="SETTLED_HISTORY"&&a?.horizons?.t15?.resolved_mid_eur===99,
      t60_history:a?.horizons?.t60?.state==="SETTLED_HISTORY"&&a?.horizons?.t60?.resolved_mid_eur===102,
      no_trade_not_scored:a?.horizons?.t5?.strategy_a_outcome==="NO_DIRECTIONAL_CLAIM",
      history_source:m.history.source==="self-test-history",
      no_side_effect_contract:m.contract.fetch===false&&m.contract.recurring_timer===false&&m.contract.storage_write===false&&m.contract.real_order===false&&m.contract.graph_mutation===false
    };
    return Object.freeze({schema:"agent_crypto_strategy_tradus_outcome_memory_self_test_v2",pass:Object.values(checks).every(Boolean),checks});
  }

  ["agentcrypto:tradus-shadow-observation","agentcrypto:strategy-a-auto-cycle"].forEach(name=>document.addEventListener(name,schedule,{passive:true}));
  window.addEventListener("erith:system-hydrated",schedule,{passive:true});
  window.addEventListener("pageshow",schedule,{passive:true});
  if(document.readyState==="loading")window.addEventListener("load",schedule,{once:true,passive:true});else schedule();

  globalThis.AgentCryptoStrategyTradusOutcomeMemory=Object.freeze({owner:OWNER,event:EVENT_NAME,horizons:HORIZONS,model:modelFromRows,read:()=>clone(lastModel||modelFromRows()),render,self_test:selfTest,contract:Object.freeze({derived_read_only:true,storage_write:false,fetch:false,recurring_timer:false,mutation_observer:false,real_order:false,graph_mutation:false})});
})();
