/* Agent-Crypto @erith.IA — 40.4.89
   PERIPHERAL DIAGNOSTICS DEMAND LOADER
   Architecture Freeze + Residency Audit are diagnostic-only and no longer
   parser-blocking residents. They load only on explicit operator request.
   40.4.89 refreshes only the Residency Audit cache identity for the owner-aware audit.
   No timer, observer, fetch loop, storage owner, Market Core, CURRENT, Oracle,
   Bridge or Private Backend behavior is added here. */
(()=>{
  "use strict";
  const BUILD="40.4.89";
  const DEFINITIONS=Object.freeze({
    residency:Object.freeze({
      src:"./js/views/residency-audit.js?v=administrator-build-40.4.89",
      ready:()=>!!globalThis.ErithResidencyAudit,
      value:()=>globalThis.ErithResidencyAudit||null
    }),
    architecture:Object.freeze({
      src:"./js/architecture-freeze.js?v=administrator-build-40.4.62",
      ready:()=>!!globalThis.atlasArchitectureFreeze,
      value:()=>globalThis.atlasArchitectureFreeze||null
    })
  });
  const inflight=new Map();
  const loadedAt=new Map();

  function normalized(name){
    const value=String(name||"").trim().toLowerCase();
    if(["residency","residency-audit","audit"].includes(value))return "residency";
    if(["architecture","architecture-freeze","freeze"].includes(value))return "architecture";
    return "";
  }

  function load(name){
    const key=normalized(name);
    const def=DEFINITIONS[key];
    if(!def)return Promise.reject(new Error(`Diagnostic inconnu: ${String(name||"—")}`));
    if(def.ready())return Promise.resolve(def.value());
    if(inflight.has(key))return inflight.get(key);
    const promise=new Promise((resolve,reject)=>{
      const script=document.createElement("script");
      script.src=def.src;
      script.async=true;
      script.dataset.erithPeripheralDiagnostic40464=key;
      script.addEventListener("load",()=>{
        if(!def.ready()){
          reject(new Error(`Diagnostic chargé sans API: ${key}`));
          return;
        }
        loadedAt.set(key,new Date().toISOString());
        resolve(def.value());
      },{once:true});
      script.addEventListener("error",()=>reject(new Error(`Chargement diagnostic impossible: ${key}`)),{once:true});
      document.head.appendChild(script);
    }).finally(()=>inflight.delete(key));
    inflight.set(key,promise);
    return promise;
  }

  async function runResidencyAudit(){
    const api=await load("residency");
    return typeof api?.run==="function"?api.run():null;
  }

  async function renderArchitectureFreeze(){
    const api=await load("architecture");
    return typeof api?.render==="function"?api.render():null;
  }

  function snapshot(){
    return Object.freeze({
      build:BUILD,
      mode:"DEMAND_ONLY",
      residency_loaded:DEFINITIONS.residency.ready(),
      architecture_loaded:DEFINITIONS.architecture.ready(),
      residency_loaded_at:loadedAt.get("residency")||null,
      architecture_loaded_at:loadedAt.get("architecture")||null,
      parser_blocking_residency_audit:false,
      parser_blocking_architecture_freeze:false,
      new_timer:false,
      new_observer:false,
      storage_owner_added:false,
      market_core_changed:false,
      current_changed:false,
      oracle_changed:false,
      bridge_changed:false,
      private_backend_changed:false
    });
  }

  window.addEventListener("erith:peripheral-diagnostic-request",event=>{
    const name=event?.detail?.name||event?.detail?.diagnostic||"";
    const action=String(event?.detail?.action||"load").toLowerCase();
    if(normalized(name)==="residency"&&action==="run")void runResidencyAudit();
    else if(normalized(name)==="architecture"&&["run","render"].includes(action))void renderArchitectureFreeze();
    else if(normalized(name))void load(name);
  });

  const api=Object.freeze({
    build:BUILD,
    mode:"DEMAND_ONLY",
    load,
    runResidencyAudit,
    renderArchitectureFreeze,
    snapshot,
    shortcuts:Object.freeze({
      residency:"ErithPeripheralDiagnostics40464.runResidencyAudit()",
      architecture:"ErithPeripheralDiagnostics40464.renderArchitectureFreeze()"
    })
  });
  globalThis.ErithPeripheralDiagnostics40489=api;
  globalThis.ErithPeripheralDiagnostics40464=api;
  globalThis.ErithPeripheralDiagnostics=api;
  globalThis.__AGENT_CRYPTO_PERIPHERAL_DIAGNOSTICS_40489__=snapshot();
  globalThis.__AGENT_CRYPTO_PERIPHERAL_DIAGNOSTICS_40464__=snapshot();
})();
