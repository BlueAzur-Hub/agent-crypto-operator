/* Agent-Crypto Administrator — 40.6.414 DECISION BOARD CONTINUITY PROBE
   Diagnostic only. Confirms that 40.6.412 coalescing remains active on later builds. */
(()=>{
  "use strict";
  if(globalThis.AgentCryptoBootContinuityProbe406414)return;
  const BUILD="40.6.414";
  const fmt=v=>(v==null||v==="")?"non mesuré":(Number.isFinite(Number(v))?Number(v).toFixed(0)+" ms":"non mesuré");
  function snapshot(){
    try{return globalThis.AgentCryptoDecisionBoardGate406412?.snapshot?.()||null;}catch(_){return null;}
  }
  function humanLines(){
    const s=snapshot();
    const lines=["DECISION BOARD CONTINUITY · 40.6.414"];
    if(!s){lines.push("gate API · unavailable");return lines;}
    lines.push("active "+(s.active_build?"YES":"NO")+" · rendered "+Number(s.rendered||0)+" · deferred "+Number(s.deferred||0)+" · deduped "+Number(s.deduped||0)+" · forced "+Number(s.forced||0)+" · errors "+Number(s.errors||0));
    const strategyState=s.strategy_failed?"FAILED":(s.strategy_ready?"READY":"WAIT");
    lines.push("strategy "+strategyState+" · postboot "+(s.postboot_ready?"READY":"WAIT")+" · pending "+(s.pending?"YES":"NO")+" · last "+fmt(s.last_duration_ms)+" · reason "+String(s.strategy_failure_reason||s.last_reason||"—"));
    lines.push("continuity fix "+String(s.continuity_fix||"—")+" · presentation-only");
    return lines;
  }
  const api=Object.freeze({
    build:BUILD,
    snapshot,
    humanLines,
    diagnostic_only:true,
    business_logic_changed:false,
    market_core_changed:false,
    strategy_changed:false,
    aether_changed:false,
    storage_write:false,
    network:false,
    recurring_timer:false
  });
  globalThis.AgentCryptoBootContinuityProbe406414=api;
  try{globalThis.AgentCryptoBootProbe?.mark?.("decision-board-continuity-probe-ready",{build:BUILD});}catch(_){}
})();