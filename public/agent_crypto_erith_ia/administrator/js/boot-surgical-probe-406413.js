/* Agent-Crypto Administrator — 40.6.413 SECONDARY POSTBOOT SPLIT PROBE
   Diagnostic only. No business rule, market source, Strategy threshold, storage,
   order path or recurring scheduler is changed.
   Purpose: split Livecheck -> Market -> CURRENT -> Graph and script response/eval/load timing. */
(()=>{
  "use strict";
  if(globalThis.AgentCryptoBootSurgicalProbe406413)return;
  const BUILD="40.6.413";
  const rows=[];
  const installed=[];
  const now=()=>performance.now();
  const short=value=>{const s=String(value||"");const clean=s.split("?")[0];return clean.split("/").pop()||clean||"—";};
  const mark=(name,detail={})=>{
    const row={name:String(name||"probe"),t_ms:Number(now().toFixed(3)),detail:{...detail}};
    rows.push(row);
    if(rows.length>500)rows.splice(0,rows.length-500);
    try{globalThis.AgentCryptoBootProbe?.mark?.(row.name,{build:BUILD,...detail});}catch(_){}
    return row;
  };
  const endRow=(fn,id,t0,status,error="")=>{
    const duration=Math.max(0,now()-t0);
    mark("surgical-probe-fn-end",{fn,id,status,duration_ms:Number(duration.toFixed(3)),error:String(error||"")});
    return duration;
  };
  function wrapGlobal(name){
    const original=globalThis[name];
    if(typeof original!=="function"||original.__agentCryptoProbe406411===true)return false;
    let seq=0;
    const wrapped=function(...args){
      const id=++seq,t0=now();
      mark("surgical-probe-fn-start",{fn:name,id});
      let result;
      try{result=original.apply(this,args);}
      catch(error){endRow(name,id,t0,"throw",error?.message||error);throw error;}
      if(result&&typeof result.then==="function"){
        return Promise.resolve(result).then(
          value=>{endRow(name,id,t0,"fulfilled");return value;},
          error=>{endRow(name,id,t0,"rejected",error?.message||error);throw error;}
        );
      }
      endRow(name,id,t0,"return");
      return result;
    };
    try{Object.assign(wrapped,original);}catch(_){}
    try{Object.defineProperty(wrapped,"__agentCryptoProbe406411",{value:true});}catch(_){}
    globalThis[name]=wrapped;
    installed.push(name);
    return true;
  }

  [
    "runLivecheck",
    "atlasApplyCanonicalSnapshot",
    "atlasMergeSpotBookIntoCoins",
    "atlasPatchMarketSnapshotDom",
    "atlasStartSelectedChart",
    "atlasWaitForChartIdle",
    "atlasCanonicalCurrentUiTruth389",
    "atlasCanonicalCurrentProof389",
    "atlasCurrentStateRead388Base389",
    "atlasCanonicalCurrentStateFromProof389",
    "atlasCurrentStateWrite388Base389",
    "atlasCanonicalCurrentJournalEnsure389",
    "atlasCanonicalCurrentMemoryEnsure389",
    "atlasCurrentRenderBanner",
    "atlasCurrentJournalRender33",
    "atlasMemoryLedgerRender34",
    "atlasMemoryLedgerRender35",
    "atlasMemoryIntelligenceRender",
    "renderDecisionBoard",
    "atlasSharedSynthesisRenderCore"
  ].forEach(wrapGlobal);

  const resourceLabel=url=>{
    try{const u=new URL(String(url||""),document.baseURI);return u.host+u.pathname;}catch(_){return String(url||"").slice(0,120);}
  };
  const resourceRows=()=>{try{
    return (performance.getEntriesByType("resource")||[])
      .filter(e=>/127\.0\.0\.1:8790|open-meteo|atlas_news|news|coingecko|binance|githubusercontent|github\.io/i.test(String(e?.name||"")))
      .map(e=>({name:resourceLabel(e.name),start:Number(e.startTime||0),end:Number(e.responseEnd||0),duration:Number(e.duration||0),kind:String(e.initiatorType||"—")}))
      .filter(e=>e.end>0)
      .sort((a,b)=>a.start-b.start);
  }catch(_){return[];}};

  function scriptSplit(src){
    const snap=globalThis.AgentCryptoBootProbe?.snapshot?.();
    const marks=Array.isArray(snap?.marks)?snap.marks:[];
    const enter=marks.find(r=>r.name==="probe-script-eval-enter"&&String(r.detail?.src||"")===src);
    const exit=marks.find(r=>r.name==="probe-script-eval-exit"&&String(r.detail?.src||"")===src);
    let diag=null;
    try{
      diag=(globalThis.AgentCryptoPostBootRuntime?.diagnostics?.()?.loads||[])
        .find(r=>short(r.src)===src)||null;
    }catch(_){}
    const finiteOrNull=value=>(value==null||value==="")?null:(Number.isFinite(Number(value))?Number(value):null);
    const responseEnd=finiteOrNull(diag?.response_end_ms);
    const loadEnd=finiteOrNull(diag?.load_end_ms);
    const enterAt=finiteOrNull(enter?.t_ms),exitAt=finiteOrNull(exit?.t_ms);
    const delta=(a,b)=>a!=null&&b!=null?Math.max(0,b-a):null;
    return {
      src,
      response_to_enter_ms:delta(responseEnd,enterAt),
      eval_ms:delta(enterAt,exitAt),
      exit_to_load_ms:delta(exitAt,loadEnd),
      resource_fetch_ms:finiteOrNull(diag?.resource_fetch_ms),
      total_load_ms:finiteOrNull(diag?.load_event_ms)
    };
  }

  function functionDurations(){
    const starts=new Map(),out=[];
    for(const row of rows){
      if(row.name==="surgical-probe-fn-start")starts.set(row.detail.fn+":"+row.detail.id,row);
      if(row.name==="surgical-probe-fn-end"){
        out.push({fn:String(row.detail.fn||"—"),duration_ms:Number(row.detail.duration_ms||0),status:String(row.detail.status||"—")});
      }
    }
    return out.sort((a,b)=>b.duration_ms-a.duration_ms);
  }

  const fmt=v=>(v==null||v==="")?"non mesuré":(Number.isFinite(Number(v))?Number(v).toFixed(0)+" ms":"non mesuré");
  function humanLines(){
    const lines=["SURGICAL BOOT PROBE · 40.6.413"];
    lines.push("Wrappers installés        "+installed.length+"/20 · diagnostic seulement");
    const top=functionDurations().filter(r=>r.duration_ms>=5).slice(0,15);
    if(top.length){
      lines.push("FUNCTION TIMINGS");
      top.forEach((r,i)=>lines.push(String(i+1).padStart(2,"0")+" · "+r.fn+" · "+fmt(r.duration_ms)+" · "+r.status));
    }
    try{
      const db=globalThis.AgentCryptoDecisionBoardGate406412?.snapshot?.();
      if(db){
        lines.push("DECISION BOARD COALESCING · 40.6.412 · RETAINED");
        lines.push("rendered "+Number(db.rendered||0)+" · deferred "+Number(db.deferred||0)+" · deduped "+Number(db.deduped||0)+" · forced "+Number(db.forced||0)+" · errors "+Number(db.errors||0));
        lines.push("gate strategy "+(db.strategy_ready?"READY":"WAIT")+" · postboot "+(db.postboot_ready?"READY":"WAIT")+" · pending "+(db.pending?"YES":"NO")+" · last "+fmt(db.last_duration_ms)+" · reason "+String(db.last_reason||"—"));
      }
    }catch(_){}
    lines.push("SECONDARY SCRIPT RESPONSE / EVAL / LOAD SPLIT · 40.6.413");
    ["analysis-aux-demand-loader.js","market-reading-depth.js","layout-repair.js","admin-theme-glass.js","market-stack.js"].forEach(src=>{
      const s=scriptSplit(src);
      lines.push(src+" · resource "+fmt(s.resource_fetch_ms)+" · response→eval "+fmt(s.response_to_enter_ms)+" · eval "+fmt(s.eval_ms)+" · eval→load "+fmt(s.exit_to_load_ms)+" · total "+fmt(s.total_load_ms));
    });
    const postMarks=(globalThis.AgentCryptoBootProbe?.snapshot?.()?.marks||[]).filter(r=>r.name==="postboot-schedule-406412"||r.name==="postboot-schedule-fired-406412");
    if(postMarks.length){
      lines.push("POSTBOOT TIMER");
      postMarks.slice(-4).forEach(r=>lines.push(r.name+" · t="+fmt(r.t_ms)+" · reason="+String(r.detail?.reason||"—")+" · drift="+fmt(r.detail?.drift_ms)));
    }
    const ext=resourceRows().filter(r=>r.start<=120000).slice(0,20);
    if(ext.length){
      lines.push("EXTERNAL RESOURCE TRACE · <=120 s");
      ext.forEach((r,i)=>lines.push(String(i+1).padStart(2,"0")+" · "+r.name+" · start "+fmt(r.start)+" · response "+fmt(r.end)+" · duration "+fmt(r.duration)+" · "+r.kind));
    }
    return lines;
  }

  document.addEventListener("DOMContentLoaded",()=>mark("surgical-probe-dom-content-loaded"),{once:true,capture:true});
  window.addEventListener("load",()=>mark("surgical-probe-window-load"),{once:true,capture:true});

  const API=Object.freeze({
    build:BUILD,
    diagnostic_only:true,
    business_logic_changed:false,
    market_core_changed:false,
    strategy_thresholds_changed:false,
    storage_write:false,
    fetch_added:false,
    recurring_timer:false,
    installed:Object.freeze(installed.slice()),
    snapshot:()=>Object.freeze({build:BUILD,rows:Object.freeze(rows.map(r=>Object.freeze({name:r.name,t_ms:r.t_ms,detail:Object.freeze({...r.detail})}))),resources:Object.freeze(resourceRows().map(r=>Object.freeze({...r})))}),
    scriptSplit,
    humanLines,
    secondary_split_targets:Object.freeze(["analysis-aux-demand-loader.js","market-reading-depth.js","layout-repair.js","admin-theme-glass.js","market-stack.js"])
  });
  globalThis.AgentCryptoBootSurgicalProbe406413=API;
  globalThis.AgentCryptoBootSurgicalProbe406411=API;
  mark("surgical-probe-ready",{wrappers:installed.length,secondary_split_probe:true});
})();