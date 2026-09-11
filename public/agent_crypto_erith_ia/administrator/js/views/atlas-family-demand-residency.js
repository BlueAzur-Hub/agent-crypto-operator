/* Agent-Crypto @erith.IA — 40.4.139 + 40.6.71 R1 · Atlas collapsed UI / HOT core residency boundary.
   Restores the boundary established by the Atlas Internal Residency recovery:
   the main Atlas-10 + Aerith-10 cockpit stays resident even while its <details>
   is visually closed. Only peripheral presentation bodies remain demand-resident.

   40.6.71 R1 — BOOT ORDER REARM
   If this module is parsed before view-lifecycle.js, registration is deferred once
   to DOMContentLoaded. The HOT cockpit and Forge iframe remain excluded from detach.
   No engine, polling, recurring timer, observer, fetch, storage or CURRENT owner is added. */
(()=>{
  "use strict";
  const BUILD="40.4.139";
  const BOOT_FIX="40.6.72";
  const BOOT_FIX_SOURCE="40.6.71 R1";
  const HOT_ROOT="#atlas-local-ai-collapse";
  const selectors=Object.freeze([
    'details[data-collapse-key="auto-reader"][data-layout-family="intelligence"]',
    'details[data-collapse-key="shared-memory"][data-layout-family="intelligence"]',
    'details[data-collapse-key="github-memory"][data-layout-family="intelligence"]'
  ]);
  let installed=false;

  const closeDefaultDisclosure=(node)=>{
    if(!(node instanceof HTMLDetailsElement))return false;
    node.open=false;
    node.classList.toggle("is-open",false);
    const icon=node.querySelector(":scope > summary .atlas-collapse-icon");
    if(icon)icon.textContent="▶";
    return true;
  };

  const enforceCollapsedDefaults=()=>{
    closeDefaultDisclosure(document.querySelector(HOT_ROOT));
    selectors.forEach(selector=>document.querySelectorAll(selector).forEach(closeDefaultDisclosure));
    try{
      document.documentElement.dataset.atlasDefaultCollapsed404138="true";
      document.documentElement.dataset.atlasHotCoreResident404138="true";
    }catch(_){}
  };

  function installAtlasFamilyResidency406071R1(){
    if(installed)return true;
    const life=globalThis.ErithPresentationLifecycle;
    if(!life)return false;

    /* Close visually before residency registration. The HOT root is deliberately
       NOT registered, therefore closing it can never detach its cockpit/runtime DOM. */
    enforceCollapsedDefaults();

    const registration=life.registerClosedBodyFamily({
      id:"atlas",
      label:"02 · Intelligence, mémoire & création",
      selectors
    });

    /* The lifecycle may restore a stale hash during its initial load sweep.
       Re-assert DEFAULT state after that one boot transaction. Explicit clicks
       occurring after load are untouched. No recurring timer/observer is added. */
    if(document.readyState==="complete")enforceCollapsedDefaults();
    else window.addEventListener("load",enforceCollapsedDefaults,{once:true});

    globalThis.ErithAtlasFamilyDemandResidency40415=Object.freeze({
      build:BUILD,
      boot_fix:BOOT_FIX,
      boot_fix_source:BOOT_FIX_SOURCE,
      parent_owner:"40.4.15",
      strategy:"hot-core-resident + peripheral-closed-body-demand-residency",
      hot_root:HOT_ROOT,
      hot_root_registered_for_detach:false,
      hot_root_default_open:false,
      peripheral_default_open:false,
      selectors,
      registered:!!registration,
      lifecycle_late_boot_rearm:true,
      lifecycle_rearm_event:"DOMContentLoaded",
      forge_iframe_excluded:true,
      existing_internal_residency_preserved:true,
      pending_wake_404137_preserved:true,
      family_02_compact_boot_404139:true,
      atlas_truth_state_engine_changed:false,
      clone_used:false,
      fetch_added:false,
      timer_added:false,
      observer_added:false,
      storage_write_added:false,
      snapshot:()=>life.residencySnapshot()
    });
    installed=true;
    try{document.documentElement.dataset.atlasFamilyDemandResidency406071R1=registration?"ready":"registered-empty";}catch(_){}
    return true;
  }

  function rearmAtlasFamilyResidency406071R1(){
    if(installAtlasFamilyResidency406071R1())return;
    if(document.readyState!=="complete")window.addEventListener("load",installAtlasFamilyResidency406071R1,{once:true});
  }

  if(!installAtlasFamilyResidency406071R1()){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",rearmAtlasFamilyResidency406071R1,{once:true});
    else if(document.readyState!=="complete")window.addEventListener("load",installAtlasFamilyResidency406071R1,{once:true});
  }
})();
