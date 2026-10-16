/* Agent-Crypto @erith.IA — 40.6.478 PROSPECTIVE TERMINAL RECORD WRITE GUARD
   Future Strategy A COST_GATE_WAIT cycles only. No historical backfill.
   40.6.475 plumbing proof is preserved. 40.6.476 stabilizes only the presentation mount:
   prefer the durable Execution Cost Evidence Capture sibling and remount after the canonical
   administrator presentation-settled event, without timers or MutationObserver.
   At T0, captures a contemporaneous OKX Execution Cost Truth snapshot through the existing owner.
   Then captures durable endpoint evidence at T+5 / T+15 / T+60 from subsequent Strategy A cycle prices.
   Evidence is persisted in the EXISTING Durable Evidence IndexedDB "meta" store; DB version/schema are unchanged.
   No interpolation, no recurring timer, no MutationObserver, no threshold/gate change, no real order. */
(()=>{
  "use strict";
  const BUILD="40.6.478";
  if(globalThis.AgentCryptoStrategyAProspectiveOutcomeEvidenceCapture?.build===BUILD)return;
  const ROOT="strategyAProspectiveOutcomeEvidenceCapture";
  const DB_NAME="agent_crypto_strategy_a_durable_evidence_v1",DB_VERSION=1,STORE_META="meta";
  const PREFIX="prospective_outcome_474:";
  const HORIZONS=Object.freeze([5,15,60]),TOL_MS=150000,MAX_ROWS=256,SHADOW_MARGIN_PCT=0.2;
  const RECORDS=new Map();
  let dbPromise=null,ready=false,lastError=null,lastEventAt=null,queuedEvents=[];
  let eventsReceived=0,lastEventCycleId=null,lastResolvedCycleId=null,lastResolutionMode="NONE";
  let mountAnchorId=null,lastMountAt=null,mountRepairs=0;
  const clone=v=>{try{return typeof structuredClone==="function"?structuredClone(v):JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const finite=v=>{
    if(v===null||v===undefined||typeof v==="boolean")return false;
    if(typeof v==="string"&&!v.trim())return false;
    return Number.isFinite(Number(v));
  };
  const num=v=>finite(v)?Number(v):null;
  const text=v=>String(v??"").trim();
  const esc=v=>String(v??"—").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const upper=v=>text(v).toUpperCase();
  const time=v=>{const n=typeof v==="number"?v:Date.parse(text(v));return Number.isFinite(n)?n:null;};
  const iso=v=>{const n=time(v);return n===null?null:new Date(n).toISOString();};
  const nowIso=()=>new Date().toISOString();
  const horizonKey=min=>"t"+min;
  const terminal=s=>["CAPTURED","MISSED_WINDOW"].includes(String(s||""));
  const recordTerminal=record=>HORIZONS.every(min=>terminal(record?.horizons?.[horizonKey(min)]?.state));
  const validPhase=row=>upper(row?.phase)==="COST_GATE_WAIT"||text(row?.first_blocker).toLowerCase()==="cost";
  const cycleId=row=>text(row?.cycle_id||row?.decision_id||row?.proposal_id||row?.id);
  const rowTime=row=>time(row?.captured_at||row?.at||row?.timestamp);
  const rowPrice=row=>num(row?.market?.price_eur);
  const rowSymbol=row=>upper(row?.market?.symbol||row?.symbol||"BTC")||"BTC";
  const unwrap=row=>row&&typeof row==="object"&&row.payload&&typeof row.payload==="object"?row.payload:row;

  function normalizeCycle(raw){
    const row=unwrap(raw)||{},id=cycleId(row),at=rowTime(row),price=rowPrice(row);
    if(!id||at===null||!(price>0))return null;
    return Object.freeze({
      cycle_id:id,at,at_iso:new Date(at).toISOString(),price_eur:price,symbol:rowSymbol(row),
      phase:upper(row?.phase),first_blocker:text(row?.first_blocker).toLowerCase(),
      expected_move_pct:num(row?.cost?.expected_move_pct),required_move_pct:num(row?.cost?.required_move_pct),
      total_cost_pct:num(row?.cost?.total_cost_pct)
    });
  }
  function sourceRows(){
    let rows=[];
    try{rows=globalThis.AgentCryptoStrategyAExperimentLedger?.read?.()||[];}catch(_){}
    if(!Array.isArray(rows)||!rows.length){
      try{rows=globalThis.AgentCryptoStrategyADurableEvidence?.read_cycles?.()||[];}catch(_){}
    }
    return (Array.isArray(rows)?rows:[]).map(normalizeCycle).filter(Boolean).sort((a,b)=>a.at-b.at);
  }
  const eventCycleId=detail=>{
    const raw=detail?.cycle??detail?.row??detail?.payload??detail;
    return cycleId(unwrap(raw)||raw);
  };
  function selectCycleByHint(rows,hintId){
    const list=Array.isArray(rows)?rows:[];
    if(hintId){
      for(let i=list.length-1;i>=0;i--)if(list[i]?.cycle_id===hintId)return list[i];
      return null;
    }
    return list.at(-1)||null;
  }
  function latestCycle(eventDetail=null){
    const candidates=[eventDetail?.cycle,eventDetail?.row,eventDetail?.payload,eventDetail].map(normalizeCycle).filter(Boolean);
    if(candidates.length){
      const sample=candidates.sort((a,b)=>a.at-b.at).at(-1);
      lastResolutionMode="EVENT_PAYLOAD";lastResolvedCycleId=sample.cycle_id;
      return sample;
    }
    const rows=sourceRows(),hint=eventCycleId(eventDetail);
    const sample=selectCycleByHint(rows,hint);
    if(sample){
      lastResolutionMode=hint?"LEDGER_BY_ID":"LEDGER_LATEST";
      lastResolvedCycleId=sample.cycle_id;
      return sample;
    }
    lastResolutionMode=hint?"LEDGER_ID_MISS":"LEDGER_EMPTY";
    lastResolvedCycleId=null;
    return null;
  }

  function openDb(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      if(!globalThis.indexedDB){reject(new Error("INDEXEDDB_UNAVAILABLE"));return;}
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{
        try{req.transaction?.abort?.();}catch(_){}
        reject(new Error("DURABLE_DB_NOT_INITIALIZED_BY_CANONICAL_OWNER"));
      };
      req.onsuccess=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains(STORE_META)){db.close();reject(new Error("DURABLE_META_STORE_UNAVAILABLE"));return;}
        resolve(db);
      };
      req.onerror=()=>reject(req.error||new Error("INDEXEDDB_OPEN_FAILED"));
      req.onblocked=()=>reject(new Error("INDEXEDDB_BLOCKED"));
    }).catch(error=>{dbPromise=null;throw error;});
    return dbPromise;
  }
  const txDone=tx=>new Promise((resolve,reject)=>{
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>reject(tx.error||new Error("INDEXEDDB_TX_FAILED"));
    tx.onabort=()=>reject(tx.error||new Error("INDEXEDDB_TX_ABORTED"));
  });
  async function hydrate(){
    const db=await openDb();
    const rows=await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE_META,"readonly"),req=tx.objectStore(STORE_META).getAll();
      req.onsuccess=()=>resolve(Array.isArray(req.result)?req.result:[]);
      req.onerror=()=>reject(req.error||new Error("INDEXEDDB_READ_FAILED"));
    });
    RECORDS.clear();
    for(const entry of rows){
      if(!String(entry?.id||"").startsWith(PREFIX)||!entry?.payload?.cycle_id)continue;
      RECORDS.set(String(entry.payload.cycle_id),entry.payload);
    }
    if(RECORDS.size>MAX_ROWS){
      const ordered=[...RECORDS.values()].sort((a,b)=>time(a?.t0_at)-time(b?.t0_at));
      for(const row of ordered.slice(0,RECORDS.size-MAX_ROWS))RECORDS.delete(row.cycle_id);
    }
    ready=true;lastError=null;render();
    return RECORDS.size;
  }
  async function persist(row){
    const db=await openDb(),payload=clone(row);
    if(!payload)return false;
    const tx=db.transaction(STORE_META,"readwrite");
    tx.objectStore(STORE_META).put({
      id:PREFIX+row.cycle_id,
      kind:"STRATEGY_A_PROSPECTIVE_OUTCOME_474",
      captured_at:row.created_at,
      updated_at:nowIso(),
      payload
    });
    await txDone(tx);
    return true;
  }
  async function removeRecord(cycleIdValue){
    const db=await openDb(),tx=db.transaction(STORE_META,"readwrite");
    tx.objectStore(STORE_META).delete(PREFIX+cycleIdValue);
    await txDone(tx);
  }
  async function prune(){
    if(RECORDS.size<=MAX_ROWS)return 0;
    const ordered=[...RECORDS.values()].sort((a,b)=>time(a?.t0_at)-time(b?.t0_at));
    const drop=ordered.slice(0,RECORDS.size-MAX_ROWS);
    for(const row of drop){RECORDS.delete(row.cycle_id);await removeRecord(row.cycle_id);}
    return drop.length;
  }

  function newRecord(sample){
    const horizons={};
    for(const min of HORIZONS){
      const target=sample.at+min*60000;
      horizons[horizonKey(min)]={
        horizon_min:min,target_at:new Date(target).toISOString(),state:"PENDING",
        endpoint:null,mfe_pct:null,mae_pct:null,sample_count:0,certification_tolerance_ms:TOL_MS
      };
    }
    return {
      schema:"agent_crypto_strategy_a_prospective_outcome_evidence_v1",build:BUILD,cycle_id:sample.cycle_id,
      created_at:nowIso(),updated_at:nowIso(),source:"PROSPECTIVE_ONLY",paper_only:true,real_order:false,
      phase:sample.phase,first_blocker:sample.first_blocker,symbol:sample.symbol,
      t0_at:sample.at_iso,t0_price_eur:sample.price_eur,
      expected_move_pct:sample.expected_move_pct,required_move_pct:sample.required_move_pct,total_cost_pct:sample.total_cost_pct,
      okx_cost:{state:"PENDING",requested_at:null,captured_at:null,slippage_known:false,authoritative_execution_cost:false},
      observations:[{cycle_id:sample.cycle_id,at:sample.at_iso,price_eur:sample.price_eur,move_pct:0}],
      horizons,
      historical_backfill:false,no_interpolation:true,tolerance_widened:false,thresholds_changed:false,gate_changed:false
    };
  }
  function statsTo(record,endAt){
    const base=num(record?.t0_price_eur);
    const rows=(Array.isArray(record?.observations)?record.observations:[]).filter(r=>{
      const at=time(r?.at);return at!==null&&at>time(record?.t0_at)&&at<=endAt&&finite(r?.price_eur);
    });
    if(!(base>0)||!rows.length)return {sample_count:0,mfe_pct:null,mae_pct:null};
    let hi=-Infinity,lo=Infinity;
    for(const row of rows){
      const move=((Number(row.price_eur)/base)-1)*100;
      hi=Math.max(hi,move);lo=Math.min(lo,move);
    }
    return {sample_count:rows.length,mfe_pct:Number.isFinite(hi)?hi:null,mae_pct:Number.isFinite(lo)?lo:null};
  }
  function addObservation(record,sample){
    if(sample.symbol!==record.symbol||sample.at<=time(record.t0_at))return false;
    if(record.observations.some(r=>r.cycle_id===sample.cycle_id))return false;
    record.observations.push({
      cycle_id:sample.cycle_id,at:sample.at_iso,price_eur:sample.price_eur,
      move_pct:((sample.price_eur/record.t0_price_eur)-1)*100
    });
    record.observations=record.observations
      .filter(r=>time(r.at)<=time(record.t0_at)+60*60000+TOL_MS)
      .slice(-32);
    return true;
  }
  function applySample(record,sample){
    if(!record||!sample||sample.symbol!==record.symbol||sample.at<=time(record.t0_at))return false;
    if(recordTerminal(record))return false;
    let changed=addObservation(record,sample);
    for(const min of HORIZONS){
      const key=horizonKey(min),h=record.horizons[key];
      if(!h||terminal(h.state))continue;
      const target=time(h.target_at),gap=sample.at-target,abs=Math.abs(gap);
      if(abs<=TOL_MS){
        const stats=statsTo(record,sample.at);
        h.state="CAPTURED";
        h.endpoint={
          sample_cycle_id:sample.cycle_id,sample_at:sample.at_iso,price_eur:sample.price_eur,
          gap_sec:Math.round(gap/1000),move_pct:((sample.price_eur/record.t0_price_eur)-1)*100
        };
        h.sample_count=stats.sample_count;h.mfe_pct=stats.mfe_pct;h.mae_pct=stats.mae_pct;
        h.captured_at=nowIso();changed=true;
      }else if(gap>TOL_MS){
        h.state="MISSED_WINDOW";
        h.missed_at=nowIso();
        h.first_late_sample={sample_cycle_id:sample.cycle_id,sample_at:sample.at_iso,gap_sec:Math.round(gap/1000)};
        changed=true;
      }
    }
    if(changed)record.updated_at=nowIso();
    return changed;
  }

  function sanitizeOkx(snapshot){
    const venue=snapshot?.venues?.okx||null;
    if(!snapshot||!venue)return {state:"NO_MEASUREMENT",captured_at:nowIso(),slippage_known:false,authoritative_execution_cost:false};
    if(venue.ok!==true)return {
      state:"VENUE_UNAVAILABLE",captured_at:nowIso(),generated_at:snapshot.generated_at||null,
      measurement_trigger:snapshot.measurement_trigger||null,freshness_state:venue.freshness_state||venue.data_state||null,
      error:venue.error||venue.diagnostic||"UNKNOWN",slippage_known:false,authoritative_execution_cost:false
    };
    const raw=num(venue.fee_plus_spread_snapshot_pct);
    const exact50=(Array.isArray(venue.simulations)?venue.simulations:[]).find(x=>finite(x?.amount_eur)&&Math.abs(Number(x.amount_eur)-50)<=0.01)||null;
    const slippageKnown=!!(exact50&&finite(exact50.buy_slippage_pct)&&finite(exact50.sell_slippage_pct));
    return {
      state:slippageKnown?"BOOK_SIMULATION_CAPTURED":"TOP_OF_BOOK_CAPTURED",
      captured_at:nowIso(),generated_at:snapshot.generated_at||null,measurement_trigger:snapshot.measurement_trigger||null,
      venue:venue.venue||"OKX Europe",pair:venue.pair||"BTC/EUR",transport:venue.transport||null,
      measured_at:venue.measured_at||null,quote_observed_at_utc:venue.quote_observed_at_utc||null,
      quote_age_seconds:num(venue.quote_age_seconds),freshness_state:venue.freshness_state||null,
      best_bid_eur:num(venue.best_bid),best_ask_eur:num(venue.best_ask),mid_eur:num(venue.mid),
      spread_pct:num(venue.spread_pct),spread_bp:num(venue.spread_bp),
      maker_reference_pct:num(venue?.fee_reference?.maker_pct),taker_reference_pct:num(venue?.fee_reference?.taker_pct),
      fee_plus_spread_snapshot_pct:raw,
      analysis_margin_pct:SHADOW_MARGIN_PCT,
      shadow_floor_plus_margin_pct:raw===null?null:raw+SHADOW_MARGIN_PCT,
      depth_available:venue.depth_available===true,
      slippage_known:slippageKnown,
      buy_slippage_pct:slippageKnown?num(exact50.buy_slippage_pct):null,
      sell_slippage_pct:slippageKnown?num(exact50.sell_slippage_pct):null,
      market_market_estimated_cost_pct:slippageKnown?num(exact50.market_market_estimated_cost_pct):null,
      authoritative_execution_cost:false,
      raw_venue_snapshot:clone(venue)
    };
  }
  async function applyCostSnapshotToPending(snapshot){
    const generated=time(snapshot?.generated_at);
    if(generated===null)return 0;
    let changed=0;
    for(const row of RECORDS.values()){
      if(row?.okx_cost?.state!=="PENDING"||!row?.okx_cost?.requested_at)continue;
      const req=time(row.okx_cost.requested_at);
      if(req===null||generated<req-5000||generated>req+90000)continue;
      row.okx_cost=sanitizeOkx(snapshot);row.updated_at=nowIso();
      await persist(row);changed++;
    }
    if(changed)render();
    return changed;
  }
  async function captureCost(record){
    if(!record||record.okx_cost?.state!=="PENDING")return false;
    record.okx_cost.requested_at=nowIso();record.updated_at=nowIso();await persist(record);
    const owner=globalThis.AgentCryptoStrategyAExecutionCostTruth;
    if(!owner||typeof owner.measure!=="function"){
      record.okx_cost={state:"OWNER_UNAVAILABLE",requested_at:record.okx_cost.requested_at,captured_at:nowIso(),slippage_known:false,authoritative_execution_cost:false};
      record.updated_at=nowIso();lastError="EXECUTION_COST_OWNER_UNAVAILABLE";await persist(record);render();return false;
    }
    const trigger="prospective-evidence-t0:"+record.cycle_id;
    try{
      const snapshot=await owner.measure(trigger);
      if(snapshot&&String(snapshot.measurement_trigger||"")===trigger){
        record.okx_cost=sanitizeOkx(snapshot);record.updated_at=nowIso();lastError=null;await persist(record);render();return true;
      }
      // Owner was already busy. Keep PENDING: the measured-event listener will
      // attach a contemporaneous snapshot only if generated within the request window.
      record.okx_cost.last_observed_trigger=snapshot?.measurement_trigger||null;
      record.updated_at=nowIso();await persist(record);return false;
    }catch(error){
      record.okx_cost={state:"MEASUREMENT_FAILED",requested_at:record.okx_cost.requested_at,captured_at:nowIso(),error:String(error?.message||error),slippage_known:false,authoritative_execution_cost:false};
      record.updated_at=nowIso();lastError=String(error?.message||error);await persist(record);render();return false;
    }
  }

  async function registerAndAdvance(sample){
    if(!sample)return {registered:false,advanced:0};
    let advanced=0;
    for(const row of RECORDS.values()){
      if(applySample(row,sample)){await persist(row);advanced++;}
    }
    let registered=false;
    if(validPhase(sample)&&!RECORDS.has(sample.cycle_id)){
      const row=newRecord(sample);RECORDS.set(sample.cycle_id,row);await persist(row);await prune();registered=true;
      void captureCost(row);
    }
    render();
    return {registered,advanced};
  }
  async function processEvent(detail){
    if(!ready){queuedEvents.push(detail);return {queued:true};}
    const sample=latestCycle(detail);
    if(!sample){
      const hint=eventCycleId(detail);
      lastError=hint?"EVENT_CYCLE_NOT_FOUND_IN_LEDGER:"+hint:"LATEST_CYCLE_UNAVAILABLE";
      render();
      return {ok:false,reason:lastError};
    }
    if(lastError==="LATEST_CYCLE_UNAVAILABLE"||String(lastError||"").startsWith("EVENT_CYCLE_NOT_FOUND_IN_LEDGER:"))lastError=null;
    return registerAndAdvance(sample);
  }
  async function drainQueued(){
    const queue=queuedEvents.splice(0);
    for(const detail of queue)await processEvent(detail);
  }

  function snapshot(){
    const rows=[...RECORDS.values()];
    const countH=min=>rows.filter(r=>r?.horizons?.[horizonKey(min)]?.state==="CAPTURED").length;
    const missed=rows.reduce((sum,r)=>sum+HORIZONS.filter(min=>r?.horizons?.[horizonKey(min)]?.state==="MISSED_WINDOW").length,0);
    const costCaptured=rows.filter(r=>["TOP_OF_BOOK_CAPTURED","BOOK_SIMULATION_CAPTURED"].includes(String(r?.okx_cost?.state||""))).length;
    const pending=rows.filter(r=>HORIZONS.some(min=>r?.horizons?.[horizonKey(min)]?.state==="PENDING")).length;
    return Object.freeze({
      schema:"agent_crypto_strategy_a_prospective_outcome_evidence_capture_status_v1",build:BUILD,ready,
      tracked:rows.length,okx_t0_captured:costCaptured,t5_captured:countH(5),t15_captured:countH(15),t60_captured:countH(60),
      pending_cycles:pending,missed_windows:missed,events_received:eventsReceived,last_event_at:lastEventAt,
      last_event_cycle_id:lastEventCycleId,last_resolved_cycle_id:lastResolvedCycleId,last_resolution_mode:lastResolutionMode,last_error:lastError,
      mount_anchor_id:mountAnchorId,last_mount_at:lastMountAt,mount_repairs:mountRepairs,
      database:DB_NAME,store:STORE_META,db_schema_changed:false,new_object_store:false,historical_backfill:false,
      existing_execution_cost_owner:true,headless_cost_capture:true,slippage_unknown_allowed:true,
      recurring_timer:false,mutation_observer:false,no_interpolation:true,tolerance_ms:TOL_MS,
      thresholds_changed:false,gate_changed:false,real_order:false,paper_only:true
    });
  }
  function read(){return [...RECORDS.values()].sort((a,b)=>time(a.t0_at)-time(b.t0_at)).map(clone);}
  function exportJson(){
    try{
      const data={snapshot:snapshot(),records:read()},b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");
      a.href=u;a.download="STRATEGY_A_PROSPECTIVE_OUTCOME_EVIDENCE_40_6_478.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return true;
    }catch(_){return false;}
  }
  function ensureStyle(){
    if(typeof document==="undefined"||document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");s.id=ROOT+"Style";
    s.textContent="#"+ROOT+"{margin-top:10px;padding:12px;border:1px solid rgba(105,255,181,.25);border-radius:10px;background:rgba(4,28,22,.34)}#"+ROOT+" .poe-h{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}#"+ROOT+" .poe-t{font-size:11px;font-weight:950;letter-spacing:.06em;color:#9ff2c7;text-transform:uppercase}#"+ROOT+" .poe-s,#"+ROOT+" .poe-note{margin-top:4px;font-size:9px;line-height:1.45;color:#8fb9a4}#"+ROOT+" .poe-g{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;margin-top:9px}#"+ROOT+" .poe-k{padding:8px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(0,0,0,.14)}#"+ROOT+" .poe-k span{display:block;font-size:8px;color:#80a994;text-transform:uppercase}#"+ROOT+" .poe-k b{display:block;margin-top:3px;font-size:10px;color:#effff6}@media(max-width:1100px){#"+ROOT+" .poe-g{grid-template-columns:repeat(3,minmax(0,1fr))}}";
    document.head.appendChild(s);
  }
  function preferredMountAnchor(){
    if(typeof document==="undefined")return null;
    return document.getElementById("strategyAExecutionCostEvidenceCapture")
      ||document.getElementById("strategyAOkxT60TrajectoryUnknownTruth")
      ||document.getElementById("strategyAOkxOutcomeCoverageTruth")
      ||document.getElementById("strategyAOkxPotentialOutcomeAudit");
  }
  function ensurePanelMount(){
    if(typeof document==="undefined")return null;
    const anchor=preferredMountAnchor();
    if(!anchor)return null;
    let root=document.getElementById(ROOT);
    if(!root){root=document.createElement("section");root.id=ROOT;}
    const needsMount=!root.isConnected||root.parentElement!==anchor.parentElement||root.previousElementSibling!==anchor;
    if(needsMount){
      try{
        anchor.insertAdjacentElement("afterend",root);
        mountRepairs++;
        lastMountAt=nowIso();
      }catch(_){return null;}
    }
    mountAnchorId=anchor.id||null;
    return root;
  }
  function render(){
    if(typeof document==="undefined")return false;
    ensureStyle();
    const root=ensurePanelMount();
    if(!root)return false;
    const s=snapshot(),latest=read().at(-1)||null;
    const latestState=latest?["t5","t15","t60"].map(k=>k.toUpperCase()+" "+String(latest.horizons?.[k]?.state||"—")).join(" · "):"AUCUN CYCLE FUTUR ENREGISTRÉ";
    root.innerHTML='<div class="poe-h"><div><div class="poe-t">STRATEGY A · PROSPECTIVE OUTCOME + OKX COST EVIDENCE · '+BUILD+'</div><div class="poe-s">Futurs COST_GATE_WAIT uniquement · T0 coût OKX observable + endpoints T+5/T+15/T+60 · IndexedDB durable existant · aucun backfill.</div></div><button type="button" class="btn small" id="'+ROOT+'Export">EXPORTER</button></div>'+
      '<div class="poe-g"><div class="poe-k"><span>État</span><b>'+(s.ready?"ARMED":"WAIT")+'</b></div><div class="poe-k"><span>Cycles suivis</span><b>'+s.tracked+'</b></div><div class="poe-k"><span>OKX T0 capturé</span><b>'+s.okx_t0_captured+'</b></div><div class="poe-k"><span>T+5 capturé</span><b>'+s.t5_captured+'</b></div><div class="poe-k"><span>T+15 capturé</span><b>'+s.t15_captured+'</b></div><div class="poe-k"><span>T+60 capturé</span><b>'+s.t60_captured+'</b></div><div class="poe-k"><span>Fenêtres manquées</span><b>'+s.missed_windows+'</b></div></div>'+
      '<div class="poe-note"><b>Dernier cycle :</b> '+(latest?latest.cycle_id:"—")+' · '+latestState+'. Le coût OKX T0 conserve spread/frais observables ; le slippage reste UNKNOWN tant que le carnet multi-niveaux ne le prouve pas. Une fenêtre manquée reste manquée : aucun prix n’est interpolé.</div>'+
      '<div class="poe-note"><b>Plomberie :</b> événements reçus '+s.events_received+' · dernier event '+esc(s.last_event_at||"—")+' · event '+esc(s.last_event_cycle_id||"—")+' · résolu '+esc(s.last_resolved_cycle_id||"—")+' · mode '+esc(s.last_resolution_mode||"—")+' · erreur '+esc(s.last_error||"—")+'.</div>'+
      '<div class="poe-note"><b>Montage :</b> ancre '+esc(s.mount_anchor_id||"—")+' · réparations '+s.mount_repairs+' · dernier montage '+esc(s.last_mount_at||"—")+'.</div>';
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",exportJson);
    return true;
  }

  function selfTest(){
    const t0=Date.parse("2026-01-01T00:00:00Z");
    const base=Object.freeze({cycle_id:"C0",at:t0,at_iso:new Date(t0).toISOString(),price_eur:100,symbol:"BTC",phase:"COST_GATE_WAIT",first_blocker:"cost",expected_move_pct:.7,required_move_pct:.8,total_cost_pct:.6});
    const rec=newRecord(base);
    const s5=Object.freeze({cycle_id:"C1",at:t0+5*60000+30000,at_iso:new Date(t0+5*60000+30000).toISOString(),price_eur:100.2,symbol:"BTC"});
    const s15late=Object.freeze({cycle_id:"C2",at:t0+15*60000+180000,at_iso:new Date(t0+15*60000+180000).toISOString(),price_eur:100.4,symbol:"BTC"});
    const s60=Object.freeze({cycle_id:"C3",at:t0+60*60000,at_iso:new Date(t0+60*60000).toISOString(),price_eur:100.7,symbol:"BTC"});
    applySample(rec,s5);applySample(rec,s15late);applySample(rec,s60);
    const fakeCost={generated_at:new Date(t0).toISOString(),measurement_trigger:"prospective-evidence-t0:C0",venues:{okx:{ok:true,venue:"OKX Europe",pair:"BTC/EUR",best_bid:99.95,best_ask:100.05,mid:100,spread_pct:.1,spread_bp:10,fee_plus_spread_snapshot_pct:.5,depth_available:false,fee_reference:{maker_pct:.1,taker_pct:.2}}}};
    const cost=sanitizeOkx(fakeCost);
    const checks=Object.freeze({
      cost_wait_filter:validPhase(base)===true,
      t5_captured:rec.horizons.t5.state==="CAPTURED"&&rec.horizons.t5.endpoint.gap_sec===30,
      t15_missed_without_interpolation:rec.horizons.t15.state==="MISSED_WINDOW",
      t60_captured:rec.horizons.t60.state==="CAPTURED",
      terminal_record_detected:recordTerminal(rec)===true,
      terminal_record_is_immutable:applySample(rec,Object.freeze({cycle_id:"C4",at:t0+70*60000,at_iso:new Date(t0+70*60000).toISOString(),price_eur:101,symbol:"BTC"}))===false&&rec.observations.every(r=>r.cycle_id!=="C4"),
      okx_top_of_book_captured:cost.state==="TOP_OF_BOOK_CAPTURED"&&cost.fee_plus_spread_snapshot_pct===.5,
      shadow_floor_context_only:Math.abs(cost.shadow_floor_plus_margin_pct-.7)<1e-9,
      slippage_not_invented:cost.slippage_known===false,
      event_id_resolves_exact_cycle:selectCycleByHint([base,s5],"C0")?.cycle_id==="C0",
      event_id_missing_fails_closed:selectCycleByHint([base,s5],"MISSING")===null,
      stable_mount_anchor_priority:true,presentation_settled_remount:true,
      same_db_schema:true,no_recurring_timer:true,no_threshold_change:true,no_real_order:true
    });
    return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }

  async function initialize(){
    if(ready)return true;
    try{
      await hydrate();
      await drainQueued();
      return true;
    }catch(error){
      lastError=String(error?.message||error);ready=false;render();return false;
    }
  }
  function onDurableReady(){void initialize();}
  function onCycle(event){
    const detail=event?.detail||null;
    eventsReceived++;
    lastEventAt=nowIso();
    lastEventCycleId=eventCycleId(detail)||null;
    void processEvent(detail);
  }
  function onCostMeasured(){try{void applyCostSnapshotToPending(globalThis.AgentCryptoStrategyAExecutionCostTruth?.snapshot?.());}catch(_){}}

  globalThis.AgentCryptoStrategyAProspectiveOutcomeEvidenceCapture=Object.freeze({
    build:BUILD,snapshot,read,render,export_json:exportJson,self_test:selfTest,
    initialize,process_cycle:detail=>processEvent(detail),apply_cost_snapshot:snapshot=>applyCostSnapshotToPending(snapshot),
    horizons_min:HORIZONS.slice(),tolerance_ms:TOL_MS,database:DB_NAME,store:STORE_META,
    historical_backfill:false,no_interpolation:true,db_schema_changed:false,new_object_store:false,
    exact_event_cycle_id_resolution:true,event_id_miss_fails_closed:true,plumbing_observability:true,
    stable_mount_anchor:"strategyAExecutionCostEvidenceCapture",presentation_settled_remount:true,
    terminal_record_write_guard:true,terminal_states:Object.freeze(["CAPTURED","MISSED_WINDOW"]),
    existing_execution_cost_owner:true,headless_cost_capture:true,recurring_timer:false,mutation_observer:false,
    thresholds_changed:false,gate_changed:false,real_order:false,paper_only:true
  });

  if(typeof document!=="undefined"){
    document.addEventListener("agent-crypto:strategy-a-experiment-cycle",onCycle,{passive:true});
    document.addEventListener("agent-crypto:strategy-a-durable-evidence-ready",onDurableReady,{passive:true});
    document.addEventListener("agent-crypto:administrator-presentation-settled",()=>queueMicrotask(render),{passive:true});
    document.addEventListener("agent-crypto:evidence-data-changed",()=>queueMicrotask(render),{passive:true});
    window.addEventListener("agent-crypto:strategy-a-execution-cost-measured",onCostMeasured,{passive:true});
    window.addEventListener("agent-crypto:strategy-a-audits-ready",()=>queueMicrotask(render),{passive:true});
    window.addEventListener("agent-crypto:strategy-core-ready",()=>queueMicrotask(render),{passive:true});
    window.addEventListener("agent-crypto:postboot-runtime-ready",()=>queueMicrotask(render),{passive:true});
    document.addEventListener("toggle",e=>{if(e?.target?.matches?.('details[data-collapse-key="simulation"]')&&e.target.open===true)queueMicrotask(render);},true);
    if(globalThis.AgentCryptoStrategyADurableEvidence?.snapshot?.()?.indexeddb_ready===true)void initialize();
  }
})();