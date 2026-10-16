/* Agent-Crypto Administrator — 40.6.411 BOOT SURGICAL PROBE
   Diagnostic only. No business rule, market source, Strategy threshold, storage,
   order path or recurring scheduler is changed.
   Purpose: split Livecheck -> Market -> CURRENT -> Graph and script response/eval/load timing. */
(()=>{
  "use strict";
  if(globalThis.AgentCryptoBootSurgicalProbe406411)return;
  const BUILD="40.6.411";
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
    const responseEnd=Number(diag?.response_end_ms);
    const loadEnd=Number(diag?.load_end_ms);
    const enterAt=Number(enter?.t_ms),exitAt=Number(exit?.t_ms);
    const delta=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)?Math.max(0,b-a):null;
    return {
      src,
      response_to_enter_ms:delta(responseEnd,enterAt),
      eval_ms:delta(enterAt,exitAt),
      exit_to_load_ms:delta(exitAt,loadEnd),
      resource_fetch_ms:Number.isFinite(Number(diag?.resource_fetch_ms))?Number(diag.resource_fetch_ms):null,
      total_load_ms:Number.isFinite(Number(diag?.load_event_ms))?Number(diag.load_event_ms):null
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

  const fmt=v=>Number.isFinite(Number(v))?Number(v).toFixed(0)+" ms":"—";
  function humanLines(){
    const lines=["SURGICAL BOOT PROBE · 40.6.411"];
    lines.push("Wrappers installés        "+installed.length+"/20 · diagnostic seulement");
    const top=functionDurations().filter(r=>r.duration_ms>=5).slice(0,15);
    if(top.length){
      lines.push("FUNCTION TIMINGS");
      top.forEach((r,i)=>lines.push(String(i+1).padStart(2,"0")+" · "+r.fn+" · "+fmt(r.duration_ms)+" · "+r.status));
    }
    lines.push("SCRIPT RESPONSE / EVAL / LOAD SPLIT");
    ["private-source-demand-loader.js","strategy-a-canonical-spec.js","atlas-family-demand-residency.js"].forEach(src=>{
      const s=scriptSplit(src);
      lines.push(src+" · resource "+fmt(s.resource_fetch_ms)+" · response→eval "+fmt(s.response_to_enter_ms)+" · eval "+fmt(s.eval_ms)+" · eval→load "+fmt(s.exit_to_load_ms)+" · total "+fmt(s.total_load_ms));
    });
    const postMarks=(globalThis.AgentCryptoBootProbe?.snapshot?.()?.marks||[]).filter(r=>r.name==="postboot-schedule-406411"||r.name==="postboot-schedule-fired-406411");
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

  globalThis.AgentCryptoBootSurgicalProbe406411=Object.freeze({
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
    humanLines
  });
  mark("surgical-probe-ready",{wrappers:installed.length});
})();