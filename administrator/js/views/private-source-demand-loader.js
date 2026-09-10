/* Agent-Crypto @erith.IA — 40.4.86
   PRIVATE BACKEND / SOURCE INTELLIGENCE SCRIPT DEMAND LOADER
   The existing private-backend-sources.js owner is unchanged and is no longer parser-loaded on Crypto cold boot.
   It is injected once after explicit operator demand for Sources or Backend/API.
   No polling, observer, storage write, wallet or trading endpoint is introduced. */
(()=>{
  "use strict";
  const BUILD="40.4.86";
  const SRC="./js/views/private-backend-sources.js?v=administrator-build-40.4.62";
  let state="idle",promise=null,reason="",loadedAt=0,lastError="";

  function ensure(why="operator"){
    reason=String(why||"operator");
    if(state==="ready"||globalThis.__AGENT_CRYPTO_SOURCE_INTELLIGENCE_40459__)return Promise.resolve(true);
    if(promise)return promise;
    state="loading";
    promise=new Promise(resolve=>{
      const existing=document.querySelector('script[data-private-source-demand-40486="true"]');
      if(existing){
        existing.addEventListener("load",()=>{state="ready";loadedAt=Date.now();resolve(true);},{once:true});
        existing.addEventListener("error",()=>{state="error";lastError="load-error";resolve(false);},{once:true});
        return;
      }
      const script=document.createElement("script");
      script.src=SRC;
      script.async=true;
      script.dataset.privateSourceDemand40486="true";
      script.addEventListener("load",()=>{state="ready";loadedAt=Date.now();lastError="";try{window.dispatchEvent(new CustomEvent("erith:private-source-runtime-loaded",{detail:{build:BUILD,reason}}));}catch(_){}resolve(true);},{once:true});
      script.addEventListener("error",()=>{state="error";lastError="script-load-error";resolve(false);},{once:true});
      document.head.appendChild(script);
    }).finally(()=>{promise=null;});
    return promise;
  }

  function clickDemand(event){
    const target=event.target instanceof Element?event.target:null;
    if(!target)return;
    const sourceNav=target.closest('[data-atlas-essential-target="sources"],[aria-controls="sources"],a[href="#sources"]');
    const backend=target.closest('details[data-collapse-key="backend"] > summary,a[href="#backend"],a[href="#privateBackendV1"]');
    if(sourceNav)void ensure("sources");
    else if(backend)void ensure("backend");
  }
  document.addEventListener("click",clickDemand,true);

  const backend=document.querySelector('details[data-collapse-key="backend"]');
  backend?.addEventListener("toggle",()=>{if(backend.open)void ensure("backend-open");});
  window.addEventListener("erith:system-hydrated",event=>{if(String(event?.detail?.key||"")==="backend"&&document.querySelector('details[data-collapse-key="backend"]')?.open)void ensure("backend-hydrated");},{passive:true});

  const hash=String(location.hash||"");
  if(["#sources","#backend","#privateBackendV1","#privateSourceIntelligence4056"].includes(hash))void ensure("direct-hash");

  globalThis.ErithPrivateSourceDemand40486=Object.freeze({
    build:BUILD,
    ensure,
    snapshot:()=>Object.freeze({state,reason,loaded_at:loadedAt,last_error:lastError,parser_boot_loaded:false,source:SRC}),
    new_timer:false,
    new_observer:false,
    new_storage_owner:false,
    new_network_owner:false
  });
})();
