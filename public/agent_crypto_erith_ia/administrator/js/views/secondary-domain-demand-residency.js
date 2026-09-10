/* Agent-Crypto @erith.IA — 40.4.94
   SECONDARY NEWS EARLY RESIDENCY · DOMCONTENTLOADED RELIEF
   News Sentinel, News-to-Market explanation and extended News source plan keep their summaries resident.
   Their already-bound closed bodies leave the live document at DOMContentLoaded instead of waiting for window.load,
   then continue to use the existing same-node presentation lifecycle for restore/detach.
   No clone, fetch, timer, observer, storage write, business engine or UI control is added.
   Metals 40.4.66 remains unchanged. */
(()=>{
  "use strict";
  const BUILD="40.4.94";
  const life=globalThis.ErithPresentationLifecycle;
  if(!life)return;
  const selectors=Object.freeze([
    '#news-sentinel',
    '#news-market-explanation',
    'details[data-collapse-key="news-plan"]'
  ]);
  const registration=life.registerClosedBodyFamily({id:"secondary-analysis",label:"Analyse secondaire · News",selectors});
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

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",earlyDetachClosedBodies40494,{once:true});
  }else{
    earlyDetachClosedBodies40494();
  }

  globalThis.ErithSecondaryDomainDemand40494=Object.freeze({
    build:BUILD,
    strategy:"closed-body-same-node-detach-at-domcontentloaded",
    selectors,
    registered:!!registration,
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
})();
