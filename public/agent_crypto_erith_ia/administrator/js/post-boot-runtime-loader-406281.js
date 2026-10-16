/* Agent-Crypto Administrator — 40.6.289 STORAGE PRIMARY TRUTH RESIDENCY
   Same application, staged residency.
   Heavy secondary runtimes wait until the consultation surface and Aether are resident.
   This prevents background Strategy/Tradus/Admin work from competing with Book consultation.
   No feature removal, no Book-lite fork, no recurring timer, no storage schema change. */
(()=>{
  "use strict";
  const BUILD="40.6.397";
  const MEMORY_MODULES=Object.freeze([
  ]);
  const SECONDARY_MODULES=Object.freeze([
    "./js/strategy-a-replay.js",
    "./js/strategy-a-canonical-spec.js",
    "./js/strategy-a-replay-acceptance.js?v=40.6.273",
    "./js/strategy-a-paper-lifecycle.js",
    "./js/strategy-a-auto-lifecycle-bridge.js",
    "./js/strategy-a-after-cost-metrics.js",
    "./js/strategy-a-durable-evidence-store.js",
    "./js/strategy-a-safety-certification.js",
    "./js/strategy-a-evidence-dossier.js",
    "./js/strategy-a-paper-after-cost-acceptance.js",
    "./js/tradus-shadow-adapter.js",
    "./js/tradus-shadow-ledger.js",
    "./js/tradus-paper-shadow.js",
    "./js/tradus-paper-observability.js",
    "./js/tradus-data-ui-decoupling.js",
    "./js/atlas-heartbeat-rearm.js",
    "./js/markets-domain-contract.js",
    "./js/views/system-demand-residency.js",
    "./js/views/secondary-domain-demand-residency.js",
    "./js/views/private-source-demand-loader.js",
    "./js/views/atlas-family-demand-residency.js",
    "./js/views/analysis-aux-demand-loader.js",
    "./js/layout-repair.js?v=40.6.299",
    "./js/views/peripheral-diagnostics-loader.js",
    "./js/market-stack.js",
    "./js/parallel-markets.js",
    "./js/admin-theme-glass.js",
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
    "./js/market-reading-depth.js",
    "./js/version-truth.js",
    "./js/storage-ownership-audit-406287.js",
    "./js/storage-relief-controlled-406288.js",
    "./js/storage-primary-truth-406344.js"
  ]);

  const MARKET_DEMAND_MODULES=Object.freeze([
    "./js/markets-domain-contract.js",
    "./js/market-stack.js",
    "./js/parallel-markets.js",
    "./js/cross-market-owner-map.js",
    "./js/market-reading-depth.js"
  ]);

  const state={started:false,done:false,reason:"",loaded:0,failed:[],marketDemandStarted:false,marketDemandReady:false,marketDemandReason:"",marketDemandFailed:[]};
  let marketDemandPromise=null;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  // 40.6.299 — operator-input backpressure.
  // Late modules wait for a short quiet window before parse/eval so background
  // loading cannot continuously compete with direct human input.
  const OPERATOR_QUIET_MS=1400;
  const POINTERMOVE_SAMPLE_MS=120;
  let lastOperatorInputAt=performance.now();
  let lastPointerMoveSampleAt=0;
  const markOperatorInput=()=>{lastOperatorInputAt=performance.now();};
  const markOperatorPointerMove=()=>{
    const now=performance.now();
    if(now-lastPointerMoveSampleAt<POINTERMOVE_SAMPLE_MS)return;
    lastPointerMoveSampleAt=now;
    lastOperatorInputAt=now;
  };
  window.addEventListener("pointerdown",markOperatorInput,{capture:true,passive:true});
  window.addEventListener("pointermove",markOperatorPointerMove,{capture:true,passive:true});
  window.addEventListener("keydown",markOperatorInput,{capture:true,passive:true});
  window.addEventListener("wheel",markOperatorInput,{capture:true,passive:true});
  window.addEventListener("touchstart",markOperatorInput,{capture:true,passive:true});
  async function waitForOperatorQuiet(){
    while(performance.now()-lastOperatorInputAt<OPERATOR_QUIET_MS) await sleep(180);
  }
  const yieldMain=(timeout=2000)=>new Promise(resolve=>{
    if(typeof requestIdleCallback==="function"){
      requestIdleCallback(()=>requestAnimationFrame(()=>resolve()),{timeout});
    }else{
      setTimeout(()=>requestAnimationFrame(()=>resolve()),Math.min(timeout,750));
    }
  });
  const loadOne=src=>new Promise(resolve=>{
    const existing=[...document.scripts].find(s=>s.dataset.postBootSrc===src);
    if(existing){
      if(existing.dataset.loaded==="1"){resolve(true);return;}
      if(existing.dataset.loaded==="0"){resolve(false);return;}
      existing.addEventListener("load",()=>resolve(true),{once:true});
      existing.addEventListener("error",()=>resolve(false),{once:true});
      return;
    }
    const script=document.createElement("script");
    script.src=src;
    script.async=false;
    script.dataset.postBootSrc=src;
    script.addEventListener("load",()=>{script.dataset.loaded="1";resolve(true);},{once:true});
    script.addEventListener("error",()=>{script.dataset.loaded="0";resolve(false);},{once:true});
    document.body.appendChild(script);
  });

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

  async function loadGroup(list,group){
    const pauseMs=group==="memory"?180:700;
    const idleTimeout=group==="memory"?1200:3000;
    for(const src of list){
      await sleep(pauseMs);
      await waitForOperatorQuiet();
      await yieldMain(idleTimeout);
      await waitForOperatorQuiet();
      const ok=await loadOne(src);
      state.loaded+=ok?1:0;
      if(!ok) state.failed.push(src);
      try{globalThis.AgentCryptoBootProbe?.mark?.("postboot-module",{group,src,ok,loaded:state.loaded});}catch(_){}
    }
  }

  async function start(reason="aether-ready"){
    if(state.started)return false;
    state.started=true; state.reason=String(reason||"unknown");
    try{globalThis.AgentCryptoBootProbe?.markOnce?.("postboot-runtime-start",{reason:state.reason});}catch(_){}
    await loadGroup(MEMORY_MODULES,"memory");
    try{window.dispatchEvent(new CustomEvent("agent-crypto:late-memory-ready",{detail:{build:BUILD}}));}catch(_){}
    await sleep(2500);
    await yieldMain(4000);
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
  function scheduleAfterAether(reason){setTimeout(()=>{if(!state.started)void start(reason);},1500);}
  function onAetherReady(){window.removeEventListener("agent-crypto:aether-ready",onAetherReady);scheduleAfterAether("aether-ready+1500ms");}
  function onAetherFailed(){setTimeout(()=>{if(!state.started)void start("aether-failed-fallback+5000ms");},5000);}

  if(seen("aether-ready")||consultationAetherReady()) scheduleAfterAether("aether-ready-already+1500ms");
  else {
    window.addEventListener("agent-crypto:aether-ready",onAetherReady,{once:true,passive:true});
    window.addEventListener("agent-crypto:aether-failed",onAetherFailed,{once:true,passive:true});
  }

  globalThis.AgentCryptoPostBootRuntime=Object.freeze({
    build:BUILD,
    start,
    snapshot:()=>Object.freeze({started:state.started,done:state.done,reason:state.reason,loaded:state.loaded,total:MEMORY_MODULES.length+SECONDARY_MODULES.length,failed:Object.freeze(state.failed.slice()),memory_modules:MEMORY_MODULES.length,secondary_modules:SECONDARY_MODULES.length,backpressure:"CONSULTATION_THEN_AETHER_THEN_IDLE_PACED_PLUS_OPERATOR_QUIET_POINTERMOVE_406397",operator_quiet_ms:OPERATOR_QUIET_MS,pointermove_sample_ms:POINTERMOVE_SAMPLE_MS,background_owner:"AFTER_AETHER_READY",market_demand_started:state.marketDemandStarted,market_demand_ready:state.marketDemandReady,market_demand_reason:state.marketDemandReason,market_demand_failed:Object.freeze(state.marketDemandFailed.slice())}),
    loadMarketsNow:loadMarketModulesNow,
    marketDemandModules:MARKET_DEMAND_MODULES.slice(),
    market_lazy_cycle_guard:true,
    same_application:true,
    book_lite:false,
    parser_critical_path_relieved:true,
    recurring_timer:false,
    storage_schema_changed:false
  });
})();
