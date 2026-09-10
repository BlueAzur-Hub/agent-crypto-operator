/* Agent-Crypto @erith.IA — 40.4.89
   SYSTEM 04 GENERIC RESIDENCY OWNER CONSOLIDATION
   Simulation keeps same-node closed-body residency.
   Commandes / Backend / Safety / Physical Security remain owned by the canonical true-lazy System presentation.
   Storage Health + Grey Plate Forensic remain resident and keep their canonical runtime bindings.
   No clone, fetch, timer, observer, storage write, engine OFF, Window Manager rewrite or DOM reparent owner is added. */
(()=>{
  "use strict";
  const BUILD="40.4.89";
  const life=globalThis.ErithPresentationLifecycle;
  if(!life)return;

  const selectors=Object.freeze([
    'details[data-collapse-key="simulation"]'
  ]);

  const registration=life.registerClosedBodyFamily({
    id:"system",
    label:"04 · Expérimentation & système",
    selectors
  });

  const api=Object.freeze({
    build:BUILD,
    restored_contract:"40.4.14-simulation-only",
    strategy:"closed-body-same-node-detach",
    selectors,
    registered:!!registration,
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

})();
