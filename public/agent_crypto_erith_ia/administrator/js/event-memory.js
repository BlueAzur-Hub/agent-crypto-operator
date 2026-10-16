/* Agent-Crypto @erith.IA — Event Memory V1
   Build 40.5.14. Reproducible read-only event memory over existing News archive + Collector snapshots.
   Runtime projection uses one sorted timestamp index per shared record set and derives T0 regime from the matched snapshot directly.
   No new storage owner, no causal claim, no prediction, no order. */
(() => {
  "use strict";
  const BUILD="40.5.14",SCHEMA="atlas_event_memory_v1";
  const WINDOWS=Object.freeze([
    {key:"T0",offset_ms:0,tolerance_ms:45*60*1000},
    {key:"+15m",offset_ms:15*60*1000,tolerance_ms:20*60*1000},
    {key:"+1h",offset_ms:60*60*1000,tolerance_ms:45*60*1000},
    {key:"+4h",offset_ms:4*60*60*1000,tolerance_ms:75*60*1000},
    {key:"+12h",offset_ms:12*60*60*1000,tolerance_ms:2*60*60*1000},
    {key:"+24h",offset_ms:24*60*60*1000,tolerance_ms:4*60*60*1000},
    {key:"+48h",offset_ms:48*60*60*1000,tolerance_ms:6*60*60*1000},
    {key:"+7d",offset_ms:7*24*60*60*1000,tolerance_ms:12*60*60*1000}
  ]);
  const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  const time=v=>{const n=Date.parse(String(v||""));return Number.isFinite(n)?n:null;};
  const pct=(a,b)=>Number.isFinite(a)&&a>0&&Number.isFinite(b)?((b-a)/a)*100:null;
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  function source(){try{return globalThis.AgentCryptoEventReactionSource?.snapshot?.()||null;}catch(_){return null;}}
  function sourceSnapshot(options={}){
    if(options?.source_snapshot && typeof options.source_snapshot==="object")return options.source_snapshot;
    return source();
  }
  function sourceRecords(options={}){
    if(Array.isArray(options?.records))return options.records;
    const snapshot=sourceSnapshot(options);
    return Array.isArray(snapshot?.records)?snapshot.records:[];
  }
  function buildRecordIndex(records){
    const out=[];
    for(let order=0;order<(records||[]).length;order++){
      const row=records[order],t=time(row?.timestamp);
      if(t!==null)out.push({t,row,order});
    }
    out.sort((a,b)=>a.t-b.t||a.order-b.order);
    return Object.freeze(out);
  }
  function lowerBound(index,target){
    let lo=0,hi=index.length;
    while(lo<hi){
      const mid=(lo+hi)>>1;
      if(index[mid].t<target)lo=mid+1;
      else hi=mid;
    }
    return lo;
  }
  function nearest(index,target,tolerance){
    if(!Array.isArray(index)||!index.length)return null;
    const pos=lowerBound(index,target),times=new Set();
    if(pos<index.length)times.add(index[pos].t);
    if(pos>0)times.add(index[pos-1].t);
    let best=null,bestDelta=Infinity,bestOrder=Infinity;
    for(const candidateTime of times){
      const delta=Math.abs(candidateTime-target);
      if(delta>tolerance||delta>bestDelta)continue;
      const start=lowerBound(index,candidateTime);
      for(let i=start;i<index.length&&index[i].t===candidateTime;i++){
        const entry=index[i];
        if(delta<bestDelta||(delta===bestDelta&&entry.order<bestOrder)){
          best=entry;bestDelta=delta;bestOrder=entry.order;
        }
      }
    }
    return best?{row:best.row,delta_ms:bestDelta}:null;
  }
  function eventApi(){return globalThis.AtlasEventSemanticEnrichment||globalThis.AtlasEventIntelligence||null;}
  function regimeApi(){return globalThis.AtlasMarketRegimeContext||null;}
  function priceMap(row){
    const out={};
    for(const a of row?.assets||[]){
      const symbol=String(a?.symbol||"").toUpperCase(),price=finite(a?.price_eur);
      if(symbol&&price!==null&&price>0)out[symbol]=price;
    }
    return out;
  }
  function eventOf(input){return eventApi()?.enrich?.(input)||input||null;}
  function derive(input,options={}){
    const event=eventOf(input);if(!event)return null;
    const eventMs=time(event?.event_time),eventId=String(event?.event_id||"").trim();
    const now=finite(options?.now_ms)??Date.now();
    const assets=[...new Set((event?.assets||[]).map(v=>String(v||"").toUpperCase()).filter(Boolean))];
    if(eventMs===null||!eventId)return Object.freeze({schema:SCHEMA,build:BUILD,event_id:eventId||null,status:"EVENT_ID_OR_TIME_MISSING",read_only:true});
    const records=sourceRecords(options);
    const recordIndex=Array.isArray(options?.record_index)?options.record_index:buildRecordIndex(records);
    const matchedRows=new Map();
    const observations=WINDOWS.map(w=>{
      const target=eventMs+w.offset_ms,due=now>=target;
      const hit=due?nearest(recordIndex,target,w.tolerance_ms):null;
      if(hit?.row)matchedRows.set(w.key,hit.row);
      return {
        key:w.key,target_time:new Date(target).toISOString(),due,tolerance_ms:w.tolerance_ms,
        observed_at:hit?.row?.timestamp||null,snapshot_id:hit?.row?.snapshot_id||null,
        collector_id:hit?.row?.collector_id||null,source:hit?.row?.source||null,
        delta_to_target_ms:hit?.delta_ms??null,prices:hit?priceMap(hit.row):null
      };
    });
    const t0=observations.find(x=>x.key==="T0"),base=t0?.prices||{};
    const windows={};
    for(const row of observations){
      const reactions={};
      for(const symbol of assets){
        const a=finite(base?.[symbol]),b=finite(row?.prices?.[symbol]);
        reactions[symbol]={price_eur:b,change_from_t0_pct:pct(a,b)};
      }
      windows[row.key]={...row,reactions};
    }
    const observed=Object.values(windows).filter(x=>x.snapshot_id).length;
    const due=Object.values(windows).filter(x=>x.due).length;
    const postObserved=Object.entries(windows).filter(([k,v])=>k!=="T0"&&v.snapshot_id).length;
    let regime=null;try{regime=regimeApi()?.classify?.(matchedRows.get("T0")||null)||null;}catch(_){}
    const semantic=event?.semantic_enrichment||{};
    return Object.freeze({
      schema:SCHEMA,build:BUILD,memory_id:eventId,event_id:eventId,event_time:event.event_time||null,
      event_family:event.event_family||null,event_label:event.event_label||null,
      assets,sectors:[...(event?.sectors||[])],source:clone(event?.source)||null,
      evidence_score:finite(event?.evidence?.score),impact_score:finite(event?.impact?.score),
      semantic:{actor:semantic.actor||null,action:semantic.action||null,amount:clone(semantic.amount)||null},
      event:clone(event),reaction_windows:windows,regime_t0:clone(regime),
      coverage:{observed,due,total:WINDOWS.length,post_event_observed:postObserved,ratio_due:due?observed/due:0},
      quality:{t0_available:Boolean(windows.T0?.snapshot_id),post_event_observed:postObserved,eligible_for_analog:Boolean(windows.T0?.snapshot_id&&postObserved),future_windows_not_invented:true},
      status:!windows.T0?.snapshot_id?"T0_MISSING":postObserved?"OBSERVED_MEMORY":"WAITING_POST_EVENT",
      persistence:"reproducible_projection_over_existing_news_and_collector_memory",
      new_storage_owner:false,storage_write:false,read_only:true,causal_claim:false,prediction:false,financial_signal:false,automatic_order:false
    });
  }
  function sharedOptions(options={}){
    const source_snapshot=sourceSnapshot(options);
    const records=Array.isArray(options?.records)
      ? options.records
      : Array.isArray(source_snapshot?.records)
        ? source_snapshot.records
        : [];
    const record_index=Array.isArray(options?.record_index)
      ? options.record_index
      : buildRecordIndex(records);
    return {...options,source_snapshot,records,record_index};
  }
  function archive(options={}){
    const shared=sharedOptions(options);
    const src=eventApi()?.archive?.()||[],seen=new Set(),out=[];
    for(const event of src){const row=derive(event,shared);if(!row?.event_id||seen.has(row.event_id))continue;seen.add(row.event_id);out.push(row);}
    out.sort((a,b)=>(time(a.event_time)||0)-(time(b.event_time)||0));
    return Object.freeze(out);
  }
  function current(options={}){
    const shared=sharedOptions(options);
    return derive(eventApi()?.current?.()||null,shared);
  }
  function snapshot(options={}){
    const shared=sharedOptions(options);
    return Object.freeze({schema:SCHEMA,build:BUILD,captured_at:new Date().toISOString(),rows:archive(shared),current:current(shared),read_only:true});
  }
  globalThis.AtlasEventMemory=Object.freeze({build:BUILD,schema:SCHEMA,windows:WINDOWS,derive,archive,current,snapshot,prepare:sharedOptions,read_only:true,new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,causal_claim:false,prediction:false,financial_signal:false,automatic_order:false});
})();
