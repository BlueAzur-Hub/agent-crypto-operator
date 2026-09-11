/* Agent-Crypto @erith.IA — 40.4.94 + 40.6.71 R1
   SECONDARY NEWS EARLY RESIDENCY · DOMCONTENTLOADED RELIEF
   News Sentinel, News-to-Market explanation and extended News source plan keep their summaries resident.
   Their already-bound closed bodies leave the live document at DOMContentLoaded instead of waiting for window.load,
   then continue to use the existing same-node presentation lifecycle for restore/detach.

   40.6.71 R1 — BOOT ORDER REARM
   If this module is parsed before view-lifecycle.js, canonical registration is deferred
   once to DOMContentLoaded. The existing early-detach transaction then runs immediately,
   before the lifecycle window.load sweep. No polling, recurring timer, observer, clone,
   fetch, storage write, business engine or UI control is added. Metals 40.4.66 is unchanged. */
(()=>{
  "use strict";
  const BUILD="40.4.94";
  const BOOT_FIX="40.6.72";
  const BOOT_FIX_SOURCE="40.6.71 R1";
  const selectors=Object.freeze([
    '#news-sentinel',
    '#news-market-explanation',
    'details[data-collapse-key="news-plan"]'
  ]);
  let installed=false;
  let earlySweepDone=false;
  let earlyDetachedDetails=0;

  function earlyDetachClosedBodies40494(){
    if(earlySweepDone)return earlyDetachedDetails;
    earlySweepDone=true;
    const details=[...new Set(selectors.flatMap(selector=>[...document.querySelectorAll(selector)]))]
      .filter(node=>node instanceof HTMLDetailsElement);
    details.forEach(detail=>{
      if(detail.open||detail.dataset.presentationResidency==="detached")return;
      /* registerClosedBodyFamily already owns the toggle listener. A synthetic
         closed-state toggle invokes that existing owner immediately; window.load
         initialSweep later becomes a no-op for the same detached record. */
      try{detail.dispatchEvent(new Event("toggle"));}catch(_){}
      if(detail.dataset.presentationResidency==="detached")earlyDetachedDetails+=1;
    });
    return earlyDetachedDetails;
  }

  function installSecondaryResidency406071R1(){
    if(installed)return true;
    const life=globalThis.ErithPresentationLifecycle;
    if(!life)return false;

    const registration=life.registerClosedBodyFamily({id:"secondary-analysis",label:"Analyse secondaire · News",selectors});
    installed=true;

    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",earlyDetachClosedBodies40494,{once:true});
    else earlyDetachClosedBodies40494();

    globalThis.ErithSecondaryDomainDemand40494=Object.freeze({
      build:BUILD,
      boot_fix:BOOT_FIX,
      boot_fix_source:BOOT_FIX_SOURCE,
      strategy:"closed-body-same-node-detach-at-domcontentloaded",
      selectors,
      registered:!!registration,
      lifecycle_late_boot_rearm:true,
      lifecycle_rearm_event:"DOMContentLoaded",
      early_detach_event:"DOMContentLoaded",
      early_detach_target_details:selectors.length,
      early_detached_details:()=>earlyDetachedDetails,
      news_runtime_network_gate:"news disclosure open + document visible",
      metals_runtime:"40.4.66 demand owner preserved",
      clone_used:false,
      fetch_added:false,
      timer_added:false,
      observer_added:false,
      storage_write_added:false,
      engine_state_changed:false,
      snapshot:()=>life.residencySnapshot()
    });
    try{document.documentElement.dataset.secondaryDemandResidency406071R1=registration?"ready":"registered-empty";}catch(_){}
    return true;
  }

  function rearmSecondaryResidency406071R1(){
    if(installSecondaryResidency406071R1())return;
    if(document.readyState!=="complete")window.addEventListener("load",installSecondaryResidency406071R1,{once:true});
  }

  if(!installSecondaryResidency406071R1()){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",rearmSecondaryResidency406071R1,{once:true});
    else if(document.readyState!=="complete")window.addEventListener("load",installSecondaryResidency406071R1,{once:true});
  }
})();
