(()=>{
  "use strict";
  if(globalThis.AgentCryptoReadinessTrace406403)return;
  const BUILD="40.6.405";
  const EVENTS=Object.freeze([
    "agent-crypto:consultation-ready",
    "agent-crypto:aether-ready",
    "agent-crypto:aether-failed",
    "agent-crypto:strategy-core-ready",
    "agent-crypto:market-demand-ready",
    "agent-crypto:late-memory-ready",
    "agent-crypto:postboot-runtime-ready",
    "agentcrypto:current-finalized",
    "erith:system-hydrated",
    "agent-crypto:administrator-presentation-settled",
    "agent-crypto:evidence-data-changed",
    "agent-crypto:evidence-refresh-complete"
  ]);
  const rows=[];
  function compact(detail){
    if(!detail||typeof detail!=="object")return{};
    const out={};
    for(const [key,value] of Object.entries(detail)){
      if(value==null||["string","number","boolean"].includes(typeof value))out[key]=value;
      else if(key==="signals"&&value&&typeof value==="object"){
        out.signals=Object.fromEntries(Object.entries(value).map(([k,v])=>[k,!!v]));
      }else if(Array.isArray(value)&&value.length<=16){
        out[key]=value.map(item=>typeof item==="string"||typeof item==="number"||typeof item==="boolean"?item:String(item)).slice(0,16);
      }
    }
    return out;
  }
  function record(name,event){
    const row=Object.freeze({name:String(name||""),t_ms:Number(performance.now().toFixed(3)),detail:Object.freeze(compact(event?.detail))});
    rows.push(row);
    try{globalThis.AgentCryptoBootProbe?.mark?.("readiness-event:"+row.name,{...row.detail});}catch(_){}
  }
  for(const name of EVENTS)window.addEventListener(name,event=>record(name,event),{passive:true});
  globalThis.AgentCryptoReadinessTrace406403=Object.freeze({
    build:BUILD,
    events:EVENTS,
    snapshot:()=>Object.freeze({
      build:BUILD,
      rows:Object.freeze(rows.map(row=>Object.freeze({name:row.name,t_ms:row.t_ms,detail:Object.freeze({...row.detail})}))),
      recurring_timer:false,observer:false,network:false,storage:false,scheduler_changed:false
    })
  });
  try{globalThis.AgentCryptoBootProbe?.markOnce?.("readiness-trace-ready",{build:BUILD,event_count:EVENTS.length});}catch(_){}
})();