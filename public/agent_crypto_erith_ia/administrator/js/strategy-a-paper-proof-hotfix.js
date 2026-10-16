/* Agent-Crypto @erith.IA — 40.6.95 Strategy A Paper proof click/autorun hotfix
   Scope: repair proof trigger only. No version bump, no trading, no network,
   no storage write, no timer, no observer. */
(()=>{
  "use strict";
  const KEY="__ERITH_STRATEGY_A_PAPER_PROOF_HOTFIX_406095__";
  if(globalThis[KEY])return;

  let autoRan=false;
  let lastReason="";
  const api=()=>globalThis.AgentCryptoStrategyAPaperAfterCostAcceptance||null;

  function mark(state,reason=""){
    document.documentElement.dataset.strategyAPaperProofHotfix=state;
    if(reason)document.documentElement.dataset.strategyAPaperProofHotfixReason=reason;
  }

  function run(reason="auto"){
    const owner=api();
    if(!owner||typeof owner.run!=="function"){
      mark("owner-unavailable",reason);
      return null;
    }
    try{owner.mount?.();}catch(_){}
    try{
      const receipt=owner.run();
      autoRan=true;
      lastReason=reason;
      mark(receipt?.pass===true?"pass":"fail",reason);
      try{document.dispatchEvent(new CustomEvent("agentcrypto:strategy-a-paper-proof",{detail:{reason,receipt}}));}catch(_){}
      try{queueMicrotask(()=>owner.mount?.());}catch(_){}
      return receipt||null;
    }catch(error){
      mark("exception",reason);
      try{console.error("[Agent-Crypto] Strategy A Paper proof hotfix",error);}catch(_){}
      return null;
    }
  }

  function delegatedClick(event){
    const element=event.target instanceof Element?event.target:null;
    if(!element)return;
    const button=element.closest("#strategyAPaperAfterCostRun406063,#strategyAPaperAfterCostExport406063");
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(button.id==="strategyAPaperAfterCostRun406063")run("delegated-click");
    else{
      const owner=api();
      try{owner?.mount?.();owner?.export_receipt?.();mark("exported","delegated-export");}catch(_){mark("export-fail","delegated-export");}
    }
  }

  function boot(){
    const owner=api();
    if(!owner){mark("owner-unavailable","boot");return;}
    try{owner.mount?.();}catch(_){}
    if(!autoRan)run("automatic-once");
  }

  document.addEventListener("click",delegatedClick,true);
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",boot,{once:true});
    window.addEventListener("load",()=>{if(!autoRan)boot();},{once:true});
  }else{
    try{queueMicrotask(boot);}catch(_){boot();}
  }
  window.addEventListener("pageshow",()=>{try{api()?.mount?.();}catch(_){}if(!autoRan)boot();},{once:true});

  globalThis[KEY]=Object.freeze({
    build:"40.6.95-hotfix",
    run,
    boot,
    snapshot:()=>Object.freeze({auto_ran:autoRan,last_reason:lastReason,state:document.documentElement.dataset.strategyAPaperProofHotfix||"idle"}),
    delegated_click:true,
    automatic_once:true,
    recurring_timer:false,
    observer:false,
    storage_write:false,
    network:false,
    trading:false
  });
})();
