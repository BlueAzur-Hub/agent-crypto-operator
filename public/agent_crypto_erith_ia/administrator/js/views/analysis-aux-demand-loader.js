/* Agent-Crypto @erith.IA — 40.4.87
   READ-ONLY AUXILIARY READER TRUE-DEMAND LOADER / PHASE-2 SEAL
   Retrospective Validation and Memory Health are unchanged read-only owners.
   They no longer parse/derive on normal Crypto cold boot.
   Memory Health loads when Atlas local surface is opened; Retrospective loads when Decision Board is requested.
   No fetch owner, polling, timer, observer, storage write, CURRENT mutation or market engine is added. */
(()=>{
  "use strict";
  const BUILD="40.4.87";
  const defs=Object.freeze({
    memory:Object.freeze({src:"./js/memory-health-audit.js?v=administrator-build-40.4.62",event:"erith:memory-health-runtime-loaded"}),
    retrospective:Object.freeze({src:"./js/retrospective-validation.js?v=administrator-build-40.4.62",event:"erith:retrospective-runtime-loaded"})
  });
  const state={memory:"idle",retrospective:"idle"};
  const reasons={memory:"",retrospective:""};
  const loadedAt={memory:0,retrospective:0};
  const errors={memory:"",retrospective:""};
  const promises={memory:null,retrospective:null};

  function ensure(key,why="operator"){
    const def=defs[key];if(!def)return Promise.resolve(false);
    reasons[key]=String(why||"operator");
    if(state[key]==="ready")return Promise.resolve(true);
    if(promises[key])return promises[key];
    state[key]="loading";
    const promise=new Promise(resolve=>{
      const script=document.createElement("script");
      script.src=def.src;
      script.async=true;
      script.dataset.analysisAuxDemand40487=key;
      script.addEventListener("load",()=>{
        state[key]="ready";loadedAt[key]=Date.now();errors[key]="";
        try{window.dispatchEvent(new CustomEvent(def.event,{detail:{build:BUILD,key,reason:reasons[key]}}));}catch(_){}
        resolve(true);
      },{once:true});
      script.addEventListener("error",()=>{state[key]="error";errors[key]="script-load-error";resolve(false);},{once:true});
      document.head.appendChild(script);
    }).finally(()=>{promises[key]=null;});
    promises[key]=promise;
    return promise;
  }

  const atlas=document.getElementById("atlas-local-ai-collapse");
  atlas?.addEventListener("toggle",()=>{if(atlas.open)void ensure("memory","atlas-open");});

  document.addEventListener("click",event=>{
    const target=event.target instanceof Element?event.target:null;if(!target)return;
    const href=target.closest('a[href^="#"]')?.getAttribute("href")||"";
    if(["#decision-board","#decisionMemoryV2","#decisionDualMemory395"].includes(href))void ensure("retrospective","decision-board");
    if(["#local-ai-hub","#shared-memory","#atlasMemoryHealth3980"].includes(href))void ensure("memory","atlas-memory");
  },true);

  const hash=String(location.hash||"");
  if(["#decision-board","#decisionMemoryV2","#decisionDualMemory395"].includes(hash))void ensure("retrospective","direct-hash");
  if(["#local-ai-hub","#shared-memory","#atlasMemoryHealth3980"].includes(hash))void ensure("memory","direct-hash");
  if(atlas?.open)void ensure("memory","open-at-boot");

  globalThis.ErithAnalysisAuxDemand40487=Object.freeze({
    build:BUILD,
    ensure,
    snapshot:()=>Object.freeze({
      memory:Object.freeze({state:state.memory,reason:reasons.memory,loaded_at:loadedAt.memory,last_error:errors.memory,parser_boot_loaded:false}),
      retrospective:Object.freeze({state:state.retrospective,reason:reasons.retrospective,loaded_at:loadedAt.retrospective,last_error:errors.retrospective,parser_boot_loaded:false})
    }),
    new_timer:false,
    new_observer:false,
    new_network_owner:false,
    new_storage_owner:false
  });
})();
