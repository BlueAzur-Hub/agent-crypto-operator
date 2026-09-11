/* Agent-Crypto @erith.IA — 40.4.89 + 40.6.71 R1
   SYSTEM 04 GENERIC RESIDENCY OWNER CONSOLIDATION
   Simulation keeps same-node closed-body residency.
   Commandes / Backend / Safety / Physical Security remain owned by the canonical true-lazy System presentation.
   Storage Health + Grey Plate Forensic remain resident and keep their canonical runtime bindings.

   40.6.71 R1 — BOOT ORDER REARM
   This module may be parsed before view-lifecycle.js. If the canonical presentation
   lifecycle is not available yet, registration is deferred once to DOMContentLoaded
   (with a one-shot load fallback). No polling, recurring timer, observer, clone,
   fetch, storage write, engine OFF, Window Manager rewrite or DOM reparent owner is added. */
(()=>{
  "use strict";
  const BUILD="40.4.89";
  const BOOT_FIX="40.6.72";
  const BOOT_FIX_SOURCE="40.6.71 R1";
  const selectors=Object.freeze([
    'details[data-collapse-key="simulation"]'
  ]);
  let installed=false;

  function installSystemResidency406071R1(){
    if(installed)return true;
    const life=globalThis.ErithPresentationLifecycle;
    if(!life)return false;

    const registration=life.registerClosedBodyFamily({
      id:"system",
      label:"04 · Expérimentation & système",
      selectors
    });

    const api=Object.freeze({
      build:BUILD,
      boot_fix:BOOT_FIX,
      boot_fix_source:BOOT_FIX_SOURCE,
      restored_contract:"40.4.14-simulation-only",
      strategy:"closed-body-same-node-detach",
      selectors,
      registered:!!registration,
      lifecycle_late_boot_rearm:true,
      lifecycle_rearm_event:"DOMContentLoaded",
      storage_health_resident:true,
      grey_plate_forensic_resident:true,
      simulation_experiment_family_included:true,
      true_lazy_system_peripherals_excluded:true,
      diagnostic_placeholder_owner_removed:true,
      exact_panel_replace_with_removed:true,
      engine_state_changed:false,
      window_manager_changed:false,
      clone_used:false,
      fetch_added:false,
      timer_added:false,
      observer_added:false,
      storage_write_added:false,
      snapshot:()=>life.residencySnapshot()
    });

    globalThis.ErithSystemDemandResidency=api;
    globalThis.ErithSystemDemandResidency40489=api;
    globalThis.ErithSystemDemandResidency40488=api;
    globalThis.ErithSystemDemandResidency40414=api;
    globalThis.__AGENT_CRYPTO_SYSTEM04_RECOVERY_40488__=api;
    globalThis.__AGENT_CRYPTO_SYSTEM04_OWNER_CONSOLIDATION_40489__=api;
    installed=true;
    try{document.documentElement.dataset.systemDemandResidency406071R1=registration?"ready":"registered-empty";}catch(_){}
    return true;
  }

  function rearmSystemResidency406071R1(){
    if(installSystemResidency406071R1())return;
    if(document.readyState!=="complete")window.addEventListener("load",installSystemResidency406071R1,{once:true});
  }

  if(!installSystemResidency406071R1()){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",rearmSystemResidency406071R1,{once:true});
    else if(document.readyState!=="complete")window.addEventListener("load",installSystemResidency406071R1,{once:true});
  }
})();
