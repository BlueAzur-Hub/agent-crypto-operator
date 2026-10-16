/* Agent-Crypto Administrator — 40.6.286 AETHER FEED DATA-GATED ACTIVATION
   Probe-only correction on top of Consultation First.
   Graph and Market Flow readiness are now causally gated by the canonical market-ready mark,
   so their timestamps cannot be emitted from placeholder/static DOM before market data exists.
   Aether scheduling and all business logic remain unchanged. */
(()=>{
  "use strict";
  if(globalThis.AgentCryptoConsultationFirst406286)return;

  const BUILD="40.6.286";
  const AETHER_SRC="./js/aether.js?v=40.6.286";
  const MAX_CHECKS=120;
  const CHECK_MS=500;
  const state={checks:0,consultationReady:false,consultationReason:"",aetherState:"pending",aetherReason:"",signals:{}};

  const textOf=id=>String(document.getElementById(id)?.textContent||"").replace(/\s+/g," ").trim();
  const meaningful=value=>Boolean(value&&!/^(?:—|en attente|calcul…|calcul\.\.\.|livecheck requis)$/i.test(value));
  const bootSeen=name=>{
    try{return Number.isFinite(Number(globalThis.AgentCryptoBootProbe?.snapshot?.()?.first_ms?.[name]));}
    catch(_){return false;}
  };

  function signalState(){
    const chrono=document.getElementById("atlasCelestialClockHeader");
    const chronoTime=chrono?.querySelector?.('[data-chrono="time"]');
    const chartCanvas=document.getElementById("mainChart");
    let chartReady=false;
    try{
      const chart=globalThis.Chart?.getChart?.(chartCanvas);
      chartReady=Boolean(chart&&Array.isArray(chart.data?.datasets)&&chart.data.datasets.some(ds=>Array.isArray(ds?.data)&&ds.data.length>0));
    }catch(_){}
    if(!chartReady){
      const overlay=textOf("atlasChartInsightOverlaySeries");
      chartReady=Boolean(chartCanvas&&meaningful(overlay)&&!/historique en attente/i.test(overlay));
    }
    const detailAsset=textOf("detailCompactAsset");
    const detailPrice=textOf("detailCompactPrice");
    const top5=document.getElementById("top5Track");
    const flow=textOf("tickerTrack");
    const rows=document.getElementById("marketRows");
    const mathContext=textOf("atlasMathContextLine");
    const mathScore=textOf("scoreValue");
    const marketReady=bootSeen("market-ready");
    return {
      navigation:Boolean(document.querySelector(".atlas-v2-nav")),
      chronos:Boolean(chrono&&meaningful(String(chronoTime?.textContent||"").trim())),
      graph:Boolean(marketReady&&chartReady),
      detail:Boolean(meaningful(detailAsset)&&meaningful(detailPrice)),
      target_top:Boolean(top5&&!top5.querySelector(".market-ribbon-empty")&&!/livecheck requis/i.test(String(top5.textContent||""))),
      market_flow:Boolean(marketReady&&meaningful(flow)&&!/livecheck requis|aucune donnée chiffrée chargée/i.test(flow)),
      market_snapshot:Boolean(rows&&rows.querySelector("tr")&&!rows.querySelector("td.empty")),
      math_core:Boolean(meaningful(mathContext)&&!/en attente/i.test(mathContext)&&meaningful(mathScore))
    };
  }

  function markSignals(signals){
    const probe=globalThis.AgentCryptoBootProbe;
    if(!probe?.markOnce)return;
    const mapping=[
      ["chronos","chronos-ready"],["graph","graph-ready"],["detail","detail-ready"],
      ["target_top","target-top-ready"],["market_flow","market-flow-ready"],
      ["market_snapshot","market-snapshot-ready"],["math_core","math-core-ready"]
    ];
    for(const [key,name] of mapping)if(signals[key])try{probe.markOnce(name,{build:BUILD,owner:"consultation-first-406286"});}catch(_){}
  }

  function publishReady(reason){
    if(state.consultationReady)return true;
    state.consultationReady=true;
    state.consultationReason=String(reason||"signals-ready");
    try{globalThis.AgentCryptoBootProbe?.markOnce?.("consultation-ready",{build:BUILD,reason:state.consultationReason});}catch(_){}
    try{window.dispatchEvent(new CustomEvent("agent-crypto:consultation-ready",{detail:{build:BUILD,reason:state.consultationReason,signals:{...state.signals}}}));}catch(_){}
    return true;
  }

  function aetherAlreadyLoaded(){return !!globalThis.AgentCryptoAether;}

  function loadAether(reason="consultation-ready"){
    if(aetherAlreadyLoaded()){
      state.aetherState="ready";state.aetherReason=String(reason||"already-loaded");
      try{globalThis.AgentCryptoBootProbe?.markOnce?.("aether-ready",{build:BUILD,reason:"already-loaded"});}catch(_){}
      try{window.dispatchEvent(new CustomEvent("agent-crypto:aether-ready",{detail:{build:BUILD,reason:"already-loaded"}}));}catch(_){}
      return Promise.resolve(true);
    }
    const existing=document.querySelector('script[data-agent-crypto-aether-406286="1"]');
    if(existing&&state.aetherState==="loading")return existing.__agentCryptoAetherPromise||Promise.resolve(false);
    state.aetherState="loading";state.aetherReason=String(reason||"consultation-ready");
    const script=existing||document.createElement("script");
    script.src=AETHER_SRC;script.async=false;script.dataset.agentCryptoAether406286="1";
    const promise=new Promise(resolve=>{
      script.addEventListener("load",()=>{
        state.aetherState="ready";
        try{globalThis.AgentCryptoBootProbe?.markOnce?.("aether-ready",{build:BUILD,reason:state.aetherReason});}catch(_){}
        try{window.dispatchEvent(new CustomEvent("agent-crypto:aether-ready",{detail:{build:BUILD,reason:state.aetherReason}}));}catch(_){}
        resolve(true);
      },{once:true});
      script.addEventListener("error",()=>{
        state.aetherState="failed";
        try{window.dispatchEvent(new CustomEvent("agent-crypto:aether-failed",{detail:{build:BUILD,reason:state.aetherReason}}));}catch(_){}
        resolve(false);
      },{once:true});
    });
    script.__agentCryptoAetherPromise=promise;
    if(!existing)document.body.appendChild(script);
    return promise;
  }

  async function checkConsultation(){
    if(state.consultationReady)return;
    state.checks+=1;state.signals=signalState();markSignals(state.signals);
    if(Object.values(state.signals).every(Boolean)){
      publishReady("all-consultation-signals");
      await loadAether("consultation-ready");
      return;
    }
    if(state.checks>=MAX_CHECKS){
      state.consultationReason="bounded-readiness-fallback";
      await loadAether("consultation-bounded-fallback");
      return;
    }
    setTimeout(checkConsultation,CHECK_MS);
  }

  function bindExplicitDemand(){
    document.addEventListener("pointerover",event=>{
      const target=event.target instanceof Element?event.target.closest("#atlasAetherStatusToggle"):null;
      if(target&&state.aetherState==="pending")void loadAether("operator-pointerover");
    },{passive:true,capture:true});
    document.addEventListener("focusin",event=>{
      const target=event.target instanceof Element?event.target.closest("#atlasAetherStatusToggle"):null;
      if(target&&state.aetherState==="pending")void loadAether("operator-focus");
    },true);
    document.addEventListener("click",event=>{
      const target=event.target instanceof Element?event.target.closest("#atlasAetherStatusToggle"):null;
      if(!target||aetherAlreadyLoaded())return;
      event.preventDefault();event.stopImmediatePropagation();
      void loadAether("operator-click").then(ok=>{if(ok)queueMicrotask(()=>target.click());});
    },true);
  }

  bindExplicitDemand();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>void checkConsultation(),{once:true});
  else void checkConsultation();

  globalThis.AgentCryptoConsultationFirst406286=Object.freeze({
    build:BUILD,loadAether,
    snapshot:()=>Object.freeze({build:BUILD,consultation_ready:state.consultationReady,consultation_reason:state.consultationReason,signals:Object.freeze({...state.signals}),aether_state:state.aetherState,aether_reason:state.aetherReason,checks:state.checks,max_checks:MAX_CHECKS,check_ms:CHECK_MS}),
    order:Object.freeze(["shell-menu-chronos","market-graph-technical-top5-flow-snapshot-math","aether","postboot","strategy-evidence"]),
    aether_parser_blocking:false,explicit_aether_demand:true,recurring_timer:false,bounded_probe_timer:true,observer:false,business_logic_changed:false,market_core_changed:false,book_lite:false,probe_causal_market_gate:Object.freeze(["graph-ready","market-flow-ready"])
  });
})();