/* Agent-Crypto Administrator — 40.6.519 ORACLE + AETHER USD PRESENTATION
   Extends the existing Aether-first Strategy Core residency with the existing Execution Cost Truth owner
   plus a bounded PAPER open/close capture facade. Same application; no new recurring timer or DB schema.
   Historical after-cost rows are not modified.
   Previous residency lineage: 40.6.289 / 40.6.414.
   Same application, staged residency.
   Heavy secondary runtimes wait until the consultation surface and Aether are resident.
   This prevents background Strategy/Tradus/Admin work from competing with Book consultation.
   No feature removal, no Book-lite fork, no recurring timer, no storage schema change. */
(()=>{
  "use strict";
  const BUILD="40.6.533";
  const MEMORY_MODULES=Object.freeze([
  ]);
  const STRATEGY_CORE_MODULES=Object.freeze([
    "./js/strategy-a-canonical-spec.js",
    "./js/strategy-a-paper-lifecycle.js?v=40.6.405",
    "./js/strategy-a-auto-lifecycle-bridge.js",
    "./js/strategy-a-after-cost-metrics.js?v=40.6.405",
    "./js/strategy-a-durable-evidence-store.js?v=40.6.463",
    "./js/strategy-a-execution-cost-truth.js?v=40.6.492",
    "./js/strategy-a-okx-micro-execution-shadow-truth.js?v=40.6.516",
    "./js/strategy-a-execution-cost-evidence-capture.js?v=40.6.469",
    "./js/strategy-a-prospective-outcome-evidence-capture.js?v=40.6.478",
    "./js/strategy-a-input-freshness-truth.js?v=40.6.479",
    "./js/strategy-a-safety-certification.js",
    "./js/strategy-a-evidence-dossier.js",
    "./js/strategy-a-paper-after-cost-acceptance.js"
  ]);
  const STRATEGY_DIAGNOSTIC_MODULES=Object.freeze([
    "./js/strategy-a-replay.js",
    "./js/strategy-a-replay-acceptance.js?v=40.6.405"
  ]);
  const TRADUS_AUTO_MODULES=Object.freeze([
    "./js/tradus-shadow-ledger.js?v=40.6.405",
    "./js/tradus-paper-shadow.js?v=40.6.405",
    "./js/tradus-paper-observability.js?v=40.6.405",
    "./js/tradus-data-ui-decoupling.js?v=40.6.405"
  ]);
  const SECONDARY_MODULES=Object.freeze([
    "./js/tradus-shadow-adapter.js",
    "./js/atlas-heartbeat-rearm.js",
    "./js/markets-domain-contract.js",
    "./js/views/system-demand-residency.js",
    "./js/views/secondary-domain-demand-residency.js",
    "./js/views/private-source-demand-loader.js?v=40.6.457",
    "./js/views/atlas-family-demand-residency.js",
    "./js/views/analysis-aux-demand-loader.js?v=40.6.413-probe",
    "./js/layout-repair.js?v=40.6.413-probe",
    "./js/views/peripheral-diagnostics-loader.js",
    "./js/oracle-evidence-tiered-storage-foundation.js?v=40.6.482",
    "./js/oracle-evidence-existing-bridge-integration.js?v=40.6.487",
    "./js/oracle-evidence-auto-archive-safety-gates.js?v=40.6.491",
    "./js/oracle-evidence-hot-window-sizing-406489.js?v=40.6.489",
    "./js/oracle-evidence-retention-atomicity-406491.js?v=40.6.491",
    "./js/market-stack.js?v=40.6.413-probe",
    "./js/parallel-markets.js",
    "./js/admin-theme-glass.js?v=40.6.413-probe",
    "./js/event-intelligence.js",
    "./js/event-reaction-memory.js",
    "./js/event-reaction-ledger.js",
    "./js/event-semantic-enrichment.js",
    "./js/historical-analog-engine-405008.js",
    "./js/market-regime-context.js",
    "./js/event-memory.js",
    "./js/historical-analog-engine-405015.js",
    "./js/regime-qualified-analogs.js",
    "./js/horizon-calibration.js",
    "./js/capital-survival.js",
    "./js/decision-intelligence-acceptance.js",
    "./js/decision-explainability.js",
    "./js/decision-intelligence-current-truth.js",
    "./js/cross-market-owner-map.js",
    "./js/canonical-freeze.js",
    "./js/market-reading-depth.js?v=40.6.413-probe",
    "./js/version-truth.js",
    "./js/storage-ownership-audit-406287.js",
    "./js/storage-relief-controlled-406288.js",
    "./js/storage-primary-truth-406344.js"
  ]);

  const MARKET_DEMAND_MODULES=Object.freeze([
    "./js/markets-domain-contract.js",
    "./js/market-stack.js?v=40.6.413-probe",
    "./js/parallel-markets.js",
    "./js/cross-market-owner-map.js",
    "./js/market-reading-depth.js?v=40.6.413-probe"
  ]);

  const state={started:false,done:false,reason:"",loaded:0,failed:[],strategyCoreStarted:false,strategyCoreReady:false,strategyCoreLoaded:0,strategyCoreFailed:[],marketDemandStarted:false,marketDemandReady:false,marketDemandReason:"",marketDemandFailed:[],tradusAutoStarted:false,tradusAutoReady:false,tradusAutoFailed:[],strategyAutoStarted:false,strategyAutoReason:""};
  let marketDemandPromise=null;
  let strategyCorePromise=null;
  let tradusAutoPromise=null;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const yieldTask=()=>new Promise(resolve=>{
    if(typeof MessageChannel!=="function"){
      setTimeout(resolve,0);
      return;
    }
    const channel=new MessageChannel();
    const finish=()=>{
      try{channel.port1.onmessage=null;channel.port1.close();channel.port2.close();}catch(_){}
      resolve();
    };
    channel.port1.onmessage=finish;
    channel.port2.postMessage(0);
  });

  // 40.6.408 — diagnostic only: decompose scheduler queue, Resource Timing,
  // script evaluation/load-event tail and Long Tasks without changing residency order.
  const LOAD_DIAGNOSTICS=new Map();
  const LONG_TASKS=[];
  const LONG_TASK_SUPPORTED=typeof PerformanceObserver!=="undefined"
    && Array.isArray(PerformanceObserver.supportedEntryTypes)
    && PerformanceObserver.supportedEntryTypes.includes("longtask");
  try{performance.setResourceTimingBufferSize?.(1000);}catch(_){}
  let longTaskObserver=null;
  if(LONG_TASK_SUPPORTED){
    try{
      longTaskObserver=new PerformanceObserver(list=>{
        for(const entry of list.getEntries()){
          LONG_TASKS.push({startTime:Number(entry.startTime||0),duration:Number(entry.duration||0),name:String(entry.name||"longtask")});
          if(LONG_TASKS.length>400)LONG_TASKS.splice(0,LONG_TASKS.length-400);
        }
      });
      longTaskObserver.observe({type:"longtask",buffered:true});
    }catch(_){}
  }
  const roundMs=value=>(value==null||value==="")?null:(Number.isFinite(Number(value))?Number(Number(value).toFixed(3)):null);
  const absoluteSrc=src=>{try{return new URL(String(src||""),document.baseURI).href;}catch(_){return String(src||"");}};
  function resourceTimingFor(src,startMs,endMs){
    try{
      const absolute=absoluteSrc(src);
      const entries=performance.getEntriesByType("resource")
        .filter(entry=>entry?.initiatorType==="script" && String(entry.name||"")===absolute)
        .filter(entry=>Number(entry.startTime)<=Number(endMs)+5)
        .sort((a,b)=>Number(b.startTime)-Number(a.startTime));
      const entry=entries.find(row=>Number(row.responseEnd)>=Number(startMs)-5)||entries[0]||null;
      if(!entry)return null;
      const requestStart=Number(entry.requestStart||entry.fetchStart||entry.startTime);
      const responseEnd=Number(entry.responseEnd||0);
      const transferSize=Number(entry.transferSize||0);
      const encodedBodySize=Number(entry.encodedBodySize||0);
      const decodedBodySize=Number(entry.decodedBodySize||0);
      let cacheHint="UNKNOWN";
      if(transferSize>0)cacheHint="NETWORK_OR_REVALIDATED";
      else if(encodedBodySize>0||decodedBodySize>0)cacheHint="CACHE_OR_LOCAL";
      return {
        resource_start_ms:roundMs(Number(entry.startTime||0)),
        request_start_ms:roundMs(requestStart),
        response_end_ms:roundMs(responseEnd),
        resource_fetch_ms:responseEnd>0&&requestStart>=0?roundMs(Math.max(0,responseEnd-requestStart)):null,
        transfer_size:Number.isFinite(transferSize)?transferSize:null,
        encoded_body_size:Number.isFinite(encodedBodySize)?encodedBodySize:null,
        decoded_body_size:Number.isFinite(decodedBodySize)?decodedBodySize:null,
        protocol:String(entry.nextHopProtocol||"—"),
        cache_hint:cacheHint
      };
    }catch(_){return null;}
  }
  function longTaskOverlap(startMs,endMs){
    if(!LONG_TASK_SUPPORTED)return {supported:false,count:0,total_ms:null,max_ms:null};
    let count=0,total=0,max=0;
    for(const row of LONG_TASKS){
      const start=Math.max(Number(startMs),Number(row.startTime));
      const end=Math.min(Number(endMs),Number(row.startTime)+Number(row.duration));
      const overlap=end-start;
      if(overlap>0){count+=1;total+=overlap;max=Math.max(max,overlap);}
    }
    return {supported:true,count,total_ms:roundMs(total),max_ms:roundMs(max)};
  }
  function recordLoadDiagnostic(src,startMs,endMs,mode,ok){
    const resource=resourceTimingFor(src,startMs,endMs);
    const responseEnd=Number(resource?.response_end_ms);
    const evalTail=Number.isFinite(responseEnd)&&responseEnd>0?Math.max(0,Number(endMs)-responseEnd):null;
    const row={
      src:String(src||""),
      absolute_src:absoluteSrc(src),
      mode:String(mode||"dynamic"),
      ok:ok!==false,
      load_start_ms:roundMs(startMs),
      load_end_ms:roundMs(endMs),
      load_event_ms:roundMs(Math.max(0,Number(endMs)-Number(startMs))),
      eval_load_event_ms:roundMs(evalTail),
      ...(resource||{resource_fetch_ms:null,transfer_size:null,encoded_body_size:null,decoded_body_size:null,protocol:"—",cache_hint:"NO_RESOURCE_ENTRY"})
    };
    LOAD_DIAGNOSTICS.set(String(src||""),row);
    return row;
  }
  const latestLoadDiagnostic=src=>LOAD_DIAGNOSTICS.get(String(src||""))||null;

  // 40.6.400 — cooperative bounded residency; operator input never gates progress.
  const yieldMain=(timeout=220)=>new Promise(resolve=>{
    if(typeof requestIdleCallback==="function")requestIdleCallback(()=>requestAnimationFrame(()=>resolve()),{timeout});
    else setTimeout(()=>requestAnimationFrame(()=>resolve()),Math.min(timeout,120));
  });
  const loadOne=(src,diagnosticStart=performance.now())=>new Promise(resolve=>{
    const existing=[...document.scripts].find(s=>s.dataset.postBootSrc===src);
    const finish=(ok,mode,node)=>{
      const ended=performance.now();
      try{recordLoadDiagnostic(src,diagnosticStart,ended,mode,ok);}catch(_){}
      resolve(ok);
    };
    if(existing){
      if(existing.dataset.loaded==="1"){finish(true,"existing-loaded",existing);return;}
      if(existing.dataset.loaded==="0"){finish(false,"existing-failed",existing);return;}
      existing.addEventListener("load",()=>finish(true,"existing-pending",existing),{once:true});
      existing.addEventListener("error",()=>finish(false,"existing-pending",existing),{once:true});
      return;
    }
    const script=document.createElement("script");
    script.src=src;
    script.async=false;
    script.dataset.postBootSrc=src;
    script.addEventListener("load",()=>{script.dataset.loaded="1";finish(true,"dynamic",script);},{once:true});
    script.addEventListener("error",()=>{script.dataset.loaded="0";finish(false,"dynamic",script);},{once:true});
    document.body.appendChild(script);
  });

  function strategyManualStopActive405(){
    try{return sessionStorage.getItem("agent_crypto_strategy_a_auto_manual_stop_v1")==="1";}catch(_){return false;}
  }
  function strategyPresentationOpen405(){
    const simulation=document.getElementById("simulation");
    return !(simulation instanceof HTMLDetailsElement)||simulation.open===true;
  }
  function installStrategyHeadlessPresentationGate405(){
    const current=globalThis.renderStrategySandboxExtensions;
    if(typeof current!=="function"||current.__agentCryptoHeadlessGate405===true)return;
    const wrapped=function(...args){
      if(!strategyPresentationOpen405())return false;
      return current.apply(this,args);
    };
    Object.defineProperty(wrapped,"__agentCryptoHeadlessGate405",{value:true});
    Object.defineProperty(wrapped,"__agentCryptoOriginal405",{value:current});
    globalThis.renderStrategySandboxExtensions=wrapped;
  }
  function syncStrategyPresentation405(){
    try{globalThis.AgentCryptoStrategyAPaperLifecycle?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAAfterCostMetrics?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyASafetyCertification?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAEvidenceDossier?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAPaperAfterCostAcceptance?.render?.();}catch(_){}
    try{globalThis.renderStrategySandboxExtensions?.();}catch(_){}
    try{
      const panel=document.getElementById("strategyAAutoPaperRunner");
      const label=[...(panel?.querySelectorAll?.("span")||[])].find(node=>/DEFAULT OFF|AUTO START/i.test(String(node.textContent||"")));
      if(label)label.textContent="SESSION-LOCAL · 5 MIN · AUTO START";
    }catch(_){}
  }
  function ensureStrategyWorkspace405(){
    try{
      const active=String(globalThis.strategyALocalContext?.()?.active_workspace||"");
      if(active==="strategy_a")return true;
      if(typeof globalThis.switchPaperWorkspace!=="function")return false;
      globalThis.switchPaperWorkspace("strategy_a",{render:false});
      return String(globalThis.strategyALocalContext?.()?.active_workspace||"")==="strategy_a";
    }catch(_){return false;}
  }
  function autoStartStrategy405(reason="strategy-core-ready"){
    state.strategyAutoReason=String(reason||"strategy-core-ready");
    installStrategyHeadlessPresentationGate405();
    if(strategyManualStopActive405()){
      try{globalThis.AgentCryptoBootProbe?.mark?.("strategy-auto-autostart-skipped",{reason:"manual-stop",source:state.strategyAutoReason});}catch(_){}
      return false;
    }
    const before=globalThis.strategyAAutoSnapshot?.();
    if(before?.enabled===true){state.strategyAutoStarted=true;return true;}
    if(!ensureStrategyWorkspace405()){
      try{globalThis.AgentCryptoBootProbe?.mark?.("strategy-auto-autostart-failed",{reason:"workspace-unavailable",source:state.strategyAutoReason});}catch(_){}
      return false;
    }
    let result=null;
    try{result=globalThis.strategyAAutoStart?.()||null;}catch(error){
      try{globalThis.AgentCryptoBootProbe?.mark?.("strategy-auto-autostart-failed",{reason:String(error?.message||error),source:state.strategyAutoReason});}catch(_){}
      return false;
    }
    state.strategyAutoStarted=result?.enabled===true;
    try{globalThis.AgentCryptoBootProbe?.mark?.("strategy-auto-autostart",{ok:state.strategyAutoStarted,phase:String(result?.phase||"—"),reason:state.strategyAutoReason});}catch(_){}
    return state.strategyAutoStarted;
  }
  async function ensureTradusAutoResidency405(detail,reason="first-tradus-event"){
    if(state.tradusAutoReady){
      try{globalThis.AgentCryptoTradusShadowLedger?.capture?.(detail,"406405-event");}catch(_){}
      try{globalThis.AgentCryptoTradusPaperShadow?.process_observation?.(detail,"406405-event");}catch(_){}
      try{globalThis.AgentCryptoTradusPaperObservability?.publish?.(detail,"406405-event");}catch(_){}
      try{globalThis.AgentCryptoTradusDataUiDecoupling?.publish_truth?.("406405-event");}catch(_){}
      return true;
    }
    if(tradusAutoPromise)return tradusAutoPromise;
    state.tradusAutoStarted=true;
    tradusAutoPromise=(async()=>{
      const failed=[];
      for(let index=0;index<TRADUS_AUTO_MODULES.length;index++){
        const src=TRADUS_AUTO_MODULES[index];
        await yieldMain(160); await sleep(18);
        const ok=await loadOne(src);
        if(!ok)failed.push(src);
        try{globalThis.AgentCryptoBootProbe?.mark?.("tradus-auto-module",{src,index:index+1,total:TRADUS_AUTO_MODULES.length,ok,reason});}catch(_){}
        if(!ok)break;
      }
      state.tradusAutoFailed=failed;
      state.tradusAutoReady=failed.length===0;
      if(state.tradusAutoReady){
        try{globalThis.AgentCryptoTradusShadowLedger?.capture?.(detail,"406405-first-event");}catch(_){}
        try{globalThis.AgentCryptoTradusPaperShadow?.process_observation?.(detail,"406405-first-event");}catch(_){}
        try{globalThis.AgentCryptoTradusPaperObservability?.publish?.(detail,"406405-first-event");}catch(_){}
        try{globalThis.AgentCryptoTradusDataUiDecoupling?.publish_truth?.("406405-first-event");}catch(_){}
      }
      try{window.dispatchEvent(new CustomEvent("agent-crypto:tradus-auto-residency-ready",{detail:{build:BUILD,ok:state.tradusAutoReady,failed:failed.slice(),reason}}));}catch(_){}
      return state.tradusAutoReady;
    })();
    return tradusAutoPromise;
  }
  document.addEventListener("agentcrypto:tradus-shadow-observation",event=>{
    void ensureTradusAutoResidency405(event?.detail||null,"first-tradus-event");
  },{passive:true});
  document.addEventListener("toggle",event=>{
    const target=event.target;
    if(target?.id==="simulation"&&target.open===true)queueMicrotask(syncStrategyPresentation405);
  },true);

  async function loadMarketModulesNow(reason="operator-market-click"){
    if(globalThis.ErithDomainSkeletonMirror){
      state.marketDemandReady=true;
      return true;
    }
    if(marketDemandPromise)return marketDemandPromise;
    state.marketDemandStarted=true;
    state.marketDemandReason=String(reason||"operator-market-click");
    marketDemandPromise=(async()=>{
      const failed=[];
      for(const src of MARKET_DEMAND_MODULES){
        const ok=await loadOne(src);
        if(!ok)failed.push(src);
        try{globalThis.AgentCryptoBootProbe?.mark?.("market-demand-module",{src,ok,reason:state.marketDemandReason});}catch(_){}
        if(!ok)break;
      }
      state.marketDemandFailed=failed;
      state.marketDemandReady=failed.length===0 && !!globalThis.ErithDomainSkeletonMirror;
      try{
        window.dispatchEvent(new CustomEvent("agent-crypto:market-demand-ready",{detail:{build:BUILD,ok:state.marketDemandReady,failed:failed.slice()}}));
      }catch(_){}
      return state.marketDemandReady;
    })();
    return marketDemandPromise;
  }

  function earlyMarketDomain(button){
    const native=String(button?.dataset?.domain||"").toLowerCase();
    if(native==="metals")return "metals";
    const value=String(document.getElementById("atlasMarketDomainSwitchValue")?.textContent||"").toUpperCase();
    return value.includes("MÉTAUX")||value.includes("METAUX")?"metals":"crypto";
  }

  function onEarlyMarketSwitch(event){
    if(globalThis.ErithDomainSkeletonMirror)return;
    const button=event.target instanceof Element ? event.target.closest("#atlasMarketDomainSwitch") : null;
    if(!button)return;
    const domain=earlyMarketDomain(button);
    if(domain==="crypto"){
      void loadMarketModulesNow("first-market-click-warmup");
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    button.setAttribute("aria-busy","true");
    document.documentElement.dataset.marketLazyTransition="loading";
    void loadMarketModulesNow("metals-next-click").then(ok=>{
      button.removeAttribute("aria-busy");
      document.documentElement.dataset.marketLazyTransition=ok?"ready":"failed";
      if(ok)globalThis.ErithDomainSkeletonMirror?.go?.("indices");
    });
  }
  document.addEventListener("click",onEarlyMarketSwitch,true);

  async function loadStrategyCoreNow(reason="boot-priority"){
    if(state.strategyCoreReady)return true;
    if(strategyCorePromise)return strategyCorePromise;
    state.strategyCoreStarted=true;
    strategyCorePromise=(async()=>{
      const failed=[];
      for(let index=0; index<STRATEGY_CORE_MODULES.length; index++){
        const src=STRATEGY_CORE_MODULES[index];
        const cycleStart=performance.now();
        try{globalThis.AgentCryptoBootProbe?.mark?.("strategy-core-module-cycle-start",{group:"strategy",src,index:index+1,total:STRATEGY_CORE_MODULES.length,reason});}catch(_){}
        // 40.6.410 — Aether-first Strategy scheduler.
        // Strategy Core no longer races the cockpit at DOMContentLoaded.
        // After Aether/Consultation readiness, keep the same sequential module
        // order and allow one zero-delay MessageChannel task boundary between
        // modules. No requestIdleCallback and no artificial sleep are used.
        const yieldStart=performance.now();
        if(index>0)await yieldTask();
        const yieldEnd=performance.now();
        const sleepStart=yieldEnd;
        const sleepEnd=sleepStart;
        const loadStart=performance.now();
        try{globalThis.AgentCryptoBootProbe?.mark?.("strategy-core-module-load-start",{group:"strategy",src,index:index+1,total:STRATEGY_CORE_MODULES.length,reason});}catch(_){}
        const ok=await loadOne(src,loadStart);
        const loadEnd=performance.now();
        if(ok)state.strategyCoreLoaded+=1; else failed.push(src);
        const diag=latestLoadDiagnostic(src)||{};
        const long=longTaskOverlap(cycleStart,loadEnd);
        try{globalThis.AgentCryptoBootProbe?.mark?.("strategy-core-module-load-end",{group:"strategy",src,index:index+1,total:STRATEGY_CORE_MODULES.length,ok,loaded:state.strategyCoreLoaded,reason,load_ms:roundMs(loadEnd-loadStart),cycle_ms:roundMs(loadEnd-cycleStart),queue_wait_ms:roundMs(loadStart-cycleStart),yield_wait_ms:roundMs(yieldEnd-yieldStart),sleep_wait_ms:roundMs(sleepEnd-sleepStart),resource_fetch_ms:diag.resource_fetch_ms??null,eval_load_event_ms:diag.eval_load_event_ms??null,transfer_size:diag.transfer_size??null,encoded_body_size:diag.encoded_body_size??null,decoded_body_size:diag.decoded_body_size??null,protocol:diag.protocol||"—",cache_hint:diag.cache_hint||"UNKNOWN",load_mode:diag.mode||"unknown",long_task_supported:long.supported,long_task_count:long.count,long_task_ms:long.total_ms,long_task_max_ms:long.max_ms});}catch(_){}
        try{globalThis.AgentCryptoBootProbe?.mark?.("strategy-core-module",{src,ok,loaded:state.strategyCoreLoaded,reason,index:index+1,total:STRATEGY_CORE_MODULES.length});}catch(_){}
      }
      state.strategyCoreFailed=failed; state.strategyCoreReady=failed.length===0;
      try{globalThis.AgentCryptoBootProbe?.markOnce?.("strategy-core-ready",{loaded:state.strategyCoreLoaded,failed:failed.length,reason});}catch(_){}
      try{window.dispatchEvent(new CustomEvent("agent-crypto:strategy-core-ready",{detail:{build:BUILD,ok:state.strategyCoreReady,failed:failed.slice()}}));}catch(_){}
      if(state.strategyCoreReady)queueMicrotask(()=>autoStartStrategy405("strategy-core-ready"));
      return state.strategyCoreReady;
    })();
    return strategyCorePromise;
  }
  async function loadGroup(list,group){
    const pauseMs=group==="memory"?18:28, idleTimeout=group==="memory"?160:220;
    for(let index=0; index<list.length; index++){
      const src=list[index];
      const cycleStart=performance.now();
      try{globalThis.AgentCryptoBootProbe?.mark?.("postboot-module-cycle-start",{group,src,index:index+1,total:list.length});}catch(_){}
      const sleepStart=performance.now();
      await sleep(pauseMs);
      const sleepEnd=performance.now();
      const yieldStart=performance.now();
      await yieldMain(idleTimeout);
      const yieldEnd=performance.now();
      const loadStart=performance.now();
      try{globalThis.AgentCryptoBootProbe?.mark?.("postboot-module-load-start",{group,src,index:index+1,total:list.length});}catch(_){}
      const ok=await loadOne(src,loadStart);
      const loadEnd=performance.now();
      state.loaded+=ok?1:0; if(!ok)state.failed.push(src);
      const diag=latestLoadDiagnostic(src)||{};
      const long=longTaskOverlap(cycleStart,loadEnd);
      try{globalThis.AgentCryptoBootProbe?.mark?.("postboot-module-load-end",{group,src,index:index+1,total:list.length,ok,loaded:state.loaded,load_ms:roundMs(loadEnd-loadStart),cycle_ms:roundMs(loadEnd-cycleStart),queue_wait_ms:roundMs(loadStart-cycleStart),yield_wait_ms:roundMs(yieldEnd-yieldStart),sleep_wait_ms:roundMs(sleepEnd-sleepStart),resource_fetch_ms:diag.resource_fetch_ms??null,eval_load_event_ms:diag.eval_load_event_ms??null,transfer_size:diag.transfer_size??null,encoded_body_size:diag.encoded_body_size??null,decoded_body_size:diag.decoded_body_size??null,protocol:diag.protocol||"—",cache_hint:diag.cache_hint||"UNKNOWN",load_mode:diag.mode||"unknown",long_task_supported:long.supported,long_task_count:long.count,long_task_ms:long.total_ms,long_task_max_ms:long.max_ms});}catch(_){}
      try{globalThis.AgentCryptoBootProbe?.mark?.("postboot-module",{group,src,ok,loaded:state.loaded,index:index+1,total:list.length});}catch(_){}
    }
  }

  async function start(reason="aether-ready"){
    if(state.started)return false;
    state.started=true; state.reason=String(reason||"unknown");
    try{globalThis.AgentCryptoBootProbe?.markOnce?.("postboot-runtime-start",{reason:state.reason});}catch(_){}
    await loadStrategyCoreNow("postboot-join");
    await loadGroup(MEMORY_MODULES,"memory");
    try{window.dispatchEvent(new CustomEvent("agent-crypto:late-memory-ready",{detail:{build:BUILD}}));}catch(_){}
    await sleep(120); await yieldMain(220);
    await loadGroup(SECONDARY_MODULES,"secondary");
    state.done=true;
    try{globalThis.AgentCryptoBootProbe?.markOnce?.("postboot-runtime-ready",{loaded:state.loaded,failed:state.failed.length});}catch(_){}
    try{window.dispatchEvent(new CustomEvent("agent-crypto:postboot-runtime-ready",{detail:{build:BUILD,loaded:state.loaded,failed:state.failed.slice()}}));}catch(_){}
    return state.failed.length===0;
  }

  function seen(name){
    try{return Number.isFinite(Number(globalThis.AgentCryptoBootProbe?.snapshot?.()?.first_ms?.[name]));}
    catch(_){return false;}
  }
  function consultationAetherReady(){
    try{return globalThis.AgentCryptoConsultationFirst406286?.snapshot?.()?.aether_state==="ready";}
    catch(_){return false;}
  }
  function scheduleAfterAether(reason){
    const delayMs=1500,scheduledAt=performance.now(),expectedAt=scheduledAt+delayMs;
    try{globalThis.AgentCryptoBootProbe?.mark?.("postboot-schedule-406412",{reason:String(reason||""),delay_ms:delayMs,scheduled_at_ms:Number(scheduledAt.toFixed(3)),expected_at_ms:Number(expectedAt.toFixed(3))});}catch(_){}
    setTimeout(()=>{
      const firedAt=performance.now(),drift=Math.max(0,firedAt-expectedAt);
      try{globalThis.AgentCryptoBootProbe?.mark?.("postboot-schedule-fired-406412",{reason:String(reason||""),delay_ms:delayMs,fired_at_ms:Number(firedAt.toFixed(3)),drift_ms:Number(drift.toFixed(3)),already_started:state.started===true});}catch(_){}
      if(!state.started)void start(reason);
    },delayMs);
  }
  function onAetherReady(){window.removeEventListener("agent-crypto:aether-ready",onAetherReady);scheduleAfterAether("aether-ready+1500ms");}
  function onAetherFailed(){setTimeout(()=>{if(!state.started)void start("aether-failed-fallback+5000ms");},5000);}

  if(seen("aether-ready")||consultationAetherReady()) scheduleAfterAether("aether-ready-already+1500ms");
  else {
    window.addEventListener("agent-crypto:aether-ready",onAetherReady,{once:true,passive:true});
    window.addEventListener("agent-crypto:aether-failed",onAetherFailed,{once:true,passive:true});
  }

  // 40.6.410 — Strategy Core is automatic but Aether-first.
  // The existing Aether-ready schedule calls start(), which then joins
  // loadStrategyCoreNow("postboot-join"). No DOMContentLoaded Strategy race.

  globalThis.AgentCryptoPostBootRuntime=Object.freeze({
    build:BUILD,
    start,
    snapshot:()=>Object.freeze({started:state.started,done:state.done,reason:state.reason,loaded:state.loaded,total:MEMORY_MODULES.length+SECONDARY_MODULES.length,failed:Object.freeze(state.failed.slice()),strategy_core_started:state.strategyCoreStarted,strategy_core_ready:state.strategyCoreReady,strategy_core_loaded:state.strategyCoreLoaded,strategy_core_total:STRATEGY_CORE_MODULES.length,strategy_core_failed:Object.freeze(state.strategyCoreFailed.slice()),strategy_diagnostic_total:STRATEGY_DIAGNOSTIC_MODULES.length,strategy_auto_started:state.strategyAutoStarted,strategy_auto_reason:state.strategyAutoReason,tradus_auto_started:state.tradusAutoStarted,tradus_auto_ready:state.tradusAutoReady,tradus_auto_failed:Object.freeze(state.tradusAutoFailed.slice()),tradus_auto_modules:TRADUS_AUTO_MODULES.length,memory_modules:MEMORY_MODULES.length,secondary_modules:SECONDARY_MODULES.length,backpressure:"AUTO_HEADLESS_EVENT_DRIVEN_406405",operator_quiet_ms:0,background_owner:"AFTER_AETHER_READY",market_demand_started:state.marketDemandStarted,market_demand_ready:state.marketDemandReady,market_demand_reason:state.marketDemandReason,market_demand_failed:Object.freeze(state.marketDemandFailed.slice()),pipeline_diagnostic:"RESIDENCY_PIPELINE_406414",strategy_core_priority_scheduler:false,strategy_core_aether_first:true,strategy_core_task_yield:"MESSAGE_CHANNEL",strategy_core_waits_removed:true,resource_timing:true,long_task_supported:LONG_TASK_SUPPORTED,long_task_count:LONG_TASKS.length}),
    loadMarketsNow:loadMarketModulesNow,
    loadStrategyCoreNow,
    ensureTradusAutoResidency:ensureTradusAutoResidency405,
    autoStartStrategy:autoStartStrategy405,
    diagnostics:()=>Object.freeze({build:BUILD,schema:"agent_crypto_residency_pipeline_diagnostic_v1",long_task_supported:LONG_TASK_SUPPORTED,long_task_count:LONG_TASKS.length,long_tasks:Object.freeze(LONG_TASKS.map(row=>Object.freeze({...row}))),loads:Object.freeze([...LOAD_DIAGNOSTICS.values()].map(row=>Object.freeze({...row}))),scheduler_unchanged:false,module_order_unchanged:true,strategy_core_waits_removed:true,strategy_core_aether_first:true,strategy_core_task_yield:"MESSAGE_CHANNEL",surgical_probe_406411:true,secondary_split_probe_406413:true,decision_board_continuity_fix_406414:true}),
    marketDemandModules:MARKET_DEMAND_MODULES.slice(),
    market_lazy_cycle_guard:true,
    same_application:true,
    book_lite:false,
    parser_critical_path_relieved:true,
    recurring_timer:false,
    storage_schema_changed:false
  });
})();

