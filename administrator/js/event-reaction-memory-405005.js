/* Agent-Crypto @erith.IA — Event Reaction Memory read-only foundation
   Build 40.5.5. Derives observed reaction windows from existing Collector snapshots.
   No storage write, no causal claim, no prediction, no order. */
(() => {
  "use strict";
  const BUILD="40.5.5",SCHEMA="atlas_event_reaction_memory_v1";
  const WINDOWS=Object.freeze([
    {key:"T0",offset_ms:0,tolerance_ms:45*60*1000},
    {key:"+1h",offset_ms:60*60*1000,tolerance_ms:45*60*1000},
    {key:"+4h",offset_ms:4*60*60*1000,tolerance_ms:75*60*1000},
    {key:"+12h",offset_ms:12*60*60*1000,tolerance_ms:2*60*60*1000},
    {key:"+24h",offset_ms:24*60*60*1000,tolerance_ms:4*60*60*1000},
    {key:"+48h",offset_ms:48*60*60*1000,tolerance_ms:6*60*60*1000},
    {key:"+7d",offset_ms:7*24*60*60*1000,tolerance_ms:12*60*60*1000}
  ]);
  const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  const time=v=>{const t=Date.parse(String(v||""));return Number.isFinite(t)?t:null;};
  const pct=(a,b)=>Number.isFinite(a)&&a>0&&Number.isFinite(b)?((b-a)/a)*100:null;
  function source(){try{return globalThis.AgentCryptoEventReactionSource405005?.snapshot?.()||null;}catch(_){return null;}}
  function eventApi(){return globalThis.AtlasEventIntelligence405000||null;}
  function nearest(records,target,tolerance){
    let best=null,bestDelta=Infinity;
    for(const row of records){const t=time(row?.timestamp);if(t===null)continue;const d=Math.abs(t-target);if(d<=tolerance&&d<bestDelta){best=row;bestDelta=d;}}
    return best?{row:best,delta_ms:bestDelta}:null;
  }
  function priceMap(row){const map=new Map();for(const a of row?.assets||[]){const s=String(a?.symbol||"").toUpperCase(),p=finite(a?.price_eur);if(s&&p!==null&&p>0)map.set(s,p);}return map;}
  function derive(event){
    if(!event||typeof event!=="object")return null;
    const eventTime=time(event.event_time);const eventId=String(event.event_id||"").trim();
    const assets=Array.isArray(event.assets)?[...new Set(event.assets.map(v=>String(v||"").toUpperCase()).filter(Boolean))]:[];
    const src=source(),records=Array.isArray(src?.records)?src.records:[];
    if(eventTime===null||!eventId)return Object.freeze({schema:SCHEMA,build:BUILD,event_id:eventId||null,event_time:event.event_time||null,assets,windows:[],coverage:{observed:0,total:WINDOWS.length},status:"EVENT_TIME_OR_ID_MISSING",causal_claim:false,financial_signal:false});
    const rows=WINDOWS.map(w=>{const hit=nearest(records,eventTime+w.offset_ms,w.tolerance_ms);return {key:w.key,target_time:new Date(eventTime+w.offset_ms).toISOString(),tolerance_ms:w.tolerance_ms,observed_at:hit?.row?.timestamp||null,snapshot_id:hit?.row?.snapshot_id||null,collector_id:hit?.row?.collector_id||null,source:hit?.row?.source||null,delta_to_target_ms:hit?.delta_ms??null,prices:hit?Object.fromEntries(priceMap(hit.row)):null};});
    const t0=rows.find(r=>r.key==="T0"),base=t0?.prices||null;
    const windows=rows.map(r=>{const reactions={};for(const symbol of assets){const a=finite(base?.[symbol]),b=finite(r.prices?.[symbol]);reactions[symbol]={price_eur:b,change_from_t0_pct:pct(a,b)};}return {...r,reactions};});
    const observed=windows.filter(r=>r.snapshot_id).length;
    return Object.freeze({schema:SCHEMA,build:BUILD,event_id:eventId,event_family:event.event_family||null,event_time:event.event_time,assets,windows,coverage:{observed,total:WINDOWS.length,ratio:WINDOWS.length?observed/WINDOWS.length:0},status:observed?"PARTIAL_OBSERVATION":"NO_MATCHING_MARKET_SNAPSHOTS",causal_claim:false,financial_signal:false,automatic_order:false,storage_write:false});
  }
  function current(){return derive(eventApi()?.current?.()||null);}
  function archive(){const events=eventApi()?.archive?.()||[];return Object.freeze(events.map(derive).filter(Boolean));}
  globalThis.AtlasEventReactionMemory405005=Object.freeze({build:BUILD,schema:SCHEMA,windows:WINDOWS,derive,current,archive,read_only:true,source_owner:"AgentCryptoEventReactionSource405005 over existing Collector snapshots",new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,causal_claim:false,financial_signal:false,automatic_order:false});
})();
