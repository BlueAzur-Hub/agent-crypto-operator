/* Agent-Crypto @erith.IA — Event Reaction Ledger read-only foundation
   Build 40.5.6. Canonical read-only ledger projection over Event Intelligence + Event Reaction Memory.
   No storage write, no prediction, no causal claim, no order. */
(() => {
  "use strict";
  const BUILD="40.5.6",SCHEMA="atlas_event_reaction_ledger_v1";
  const text=v=>String(v??"").replace(/\s+/g," ").trim();
  const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const eventApi=()=>globalThis.AtlasEventIntelligence405000||null;
  const reactionApi=()=>globalThis.AtlasEventReactionMemory405005||null;
  function windowMap(memory){
    const out={};
    for(const row of Array.isArray(memory?.windows)?memory.windows:[]){
      const key=text(row?.key);if(!key)continue;
      out[key]={
        target_time:row?.target_time||null,observed_at:row?.observed_at||null,
        snapshot_id:row?.snapshot_id||null,collector_id:row?.collector_id||null,
        source:row?.source||null,delta_to_target_ms:finite(row?.delta_to_target_ms),
        reactions:clone(row?.reactions)||{}
      };
    }
    return out;
  }
  function project(event){
    if(!event||typeof event!=="object")return null;
    const memory=reactionApi()?.derive?.(event)||null;
    const windows=windowMap(memory);
    const t0=windows.T0||null;
    const observed=Object.values(windows).filter(v=>v?.snapshot_id).length;
    const laterObserved=Object.entries(windows).filter(([k,v])=>k!=="T0"&&v?.snapshot_id).length;
    const targetKeys=(reactionApi()?.windows||[]).map(w=>w.key);
    const missing=targetKeys.filter(k=>!windows[k]?.snapshot_id);
    const evidenceScore=finite(event?.evidence?.score);
    const impactScore=finite(event?.impact?.score);
    const status=!event?.event_id||!event?.event_time?"EVENT_ID_OR_TIME_MISSING":!t0?.snapshot_id?"T0_MISSING":laterObserved?"OBSERVED":"NO_POST_EVENT_OBSERVATION";
    return Object.freeze({
      schema:SCHEMA,build:BUILD,ledger_id:text(event.event_id)||null,event_id:text(event.event_id)||null,
      event_family:event.event_family||null,event_label:event.event_label||null,event_time:event.event_time||null,
      assets:Array.isArray(event.assets)?[...event.assets]:[],sectors:Array.isArray(event.sectors)?[...event.sectors]:[],
      source:clone(event.source)||null,evidence_score:evidenceScore,impact_score:impactScore,
      reaction_windows:windows,coverage:{observed,total:targetKeys.length,ratio:targetKeys.length?observed/targetKeys.length:0,post_event_observed:laterObserved,missing},
      quality:{t0_available:Boolean(t0?.snapshot_id),primary_source:Boolean(event?.source?.primary),evidence_score:evidenceScore,eligible_for_analog:Boolean(t0?.snapshot_id&&laterObserved)},
      status,read_only:true,storage_write:false,causal_claim:false,prediction:false,financial_signal:false,automatic_order:false
    });
  }
  function archive(){
    const seen=new Set(),rows=[];
    for(const event of eventApi()?.archive?.()||[]){
      const row=project(event);if(!row?.event_id||seen.has(row.event_id))continue;seen.add(row.event_id);rows.push(row);
    }
    rows.sort((a,b)=>Date.parse(a.event_time||0)-Date.parse(b.event_time||0));
    return Object.freeze(rows);
  }
  function current(){return project(eventApi()?.current?.()||null);}
  function snapshot(){return Object.freeze({schema:SCHEMA,build:BUILD,captured_at:new Date().toISOString(),rows:archive(),current:current(),read_only:true});}
  globalThis.AtlasEventReactionLedger405006=Object.freeze({build:BUILD,schema:SCHEMA,project,archive,current,snapshot,read_only:true,new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,causal_claim:false,prediction:false,financial_signal:false,automatic_order:false,source_owners:["AtlasEventIntelligence405000","AtlasEventReactionMemory405005"]});
})();
