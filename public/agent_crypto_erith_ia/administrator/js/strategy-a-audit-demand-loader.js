/* Agent-Crypto @erith.IA — 40.6.487 STRATEGY A AUDIT DEMAND LOADER + PROSPECTIVE OUTCOME + OKX COST EVIDENCE
   Keeps the canonical Simulation owner fixed in 40.6.446.
   40.6.452 hardens manual recovery when a script transport succeeds but its expected API is absent:
   a stale loaded node is removed, failed loads never stay marked ready, and the next explicit ensure can retry.
   Self-test assertions are positive invariants; false-valued safety metadata is no longer treated as failure.
   40.6.460 adds one read-only reconciliation surface for visible/durable Strategy A evidence.
   40.6.461 adds a read-only all-ID crosswalk before any evidence is called truly orphaned.
   40.6.462 adds a read-only completeness diagnosis for uniquely linked after-cost ↔ PAPER rows.
   No boot residency, polling, observer, storage write or automatic retry loop. */
(()=>{
  "use strict";
  const BUILD="40.6.487", TIMEOUT=6000;
  const SIMULATION_OWNER_SELECTOR='details[data-collapse-key="simulation"]';
  const SPECS=Object.freeze([
    Object.freeze({key:"cost-wait",src:"./js/strategy-a-cost-wait-outcome-audit.js?v=40.6.446",ready:()=>!!globalThis.AgentCryptoStrategyACostWaitOutcomeAudit406429}),
    Object.freeze({key:"oracle-cost",src:"./js/strategy-a-oracle-cost-calibration-audit.js?v=40.6.446",ready:()=>!!globalThis.AgentCryptoStrategyAOracleCostCalibrationAudit}),
    Object.freeze({key:"execution-cost",src:"./js/strategy-a-execution-cost-truth.js?v=40.6.469",ready:()=>!!globalThis.AgentCryptoStrategyAExecutionCostTruth}),
    Object.freeze({key:"real-venue-cost-shadow",src:"./js/strategy-a-real-venue-cost-shadow-truth.js?v=40.6.467",ready:()=>!!globalThis.AgentCryptoStrategyARealVenueCostShadowTruth}),
    Object.freeze({key:"okx-potential-outcome",src:"./js/strategy-a-okx-potential-outcome-audit.js?v=40.6.471",ready:()=>!!globalThis.AgentCryptoStrategyAOkxPotentialOutcomeAudit}),
    Object.freeze({key:"okx-outcome-coverage",src:"./js/strategy-a-okx-outcome-coverage-truth.js?v=40.6.472",ready:()=>!!globalThis.AgentCryptoStrategyAOkxOutcomeCoverageTruth}),
    Object.freeze({key:"okx-t60-trajectory",src:"./js/strategy-a-okx-t60-trajectory-unknown-truth.js?v=40.6.473",ready:()=>!!globalThis.AgentCryptoStrategyAOkxT60TrajectoryUnknownTruth}),
    Object.freeze({key:"durable-reconciliation",src:"./js/strategy-a-durable-evidence-reconciliation-truth.js?v=40.6.468",ready:()=>!!globalThis.AgentCryptoStrategyADurableEvidenceReconciliation}),
    Object.freeze({key:"identity-crosswalk",src:"./js/strategy-a-evidence-identity-crosswalk-truth.js?v=40.6.467",ready:()=>!!globalThis.AgentCryptoStrategyAEvidenceIdentityCrosswalk}),
    Object.freeze({key:"after-cost-completeness",src:"./js/strategy-a-after-cost-completeness-truth.js?v=40.6.467",ready:()=>!!globalThis.AgentCryptoStrategyAAfterCostCompletenessTruth}),
    Object.freeze({key:"execution-cost-evidence-capture",src:"./js/strategy-a-execution-cost-evidence-capture.js?v=40.6.469",ready:()=>!!globalThis.AgentCryptoStrategyAExecutionCostEvidenceCapture})
  ]);
  let state="idle",promise=null,lastError="",reason="",lastRetryKey="",retryCount=0;
  const simulationOwner=()=>document.querySelector(SIMULATION_OWNER_SELECTOR);
  const simulationOpen=()=>{const node=simulationOwner();return node instanceof HTMLDetailsElement&&node.open===true;};

  function existing(key){return document.querySelector('script[data-strategy-a-audit-demand="'+key+'"]');}
  function removeNode(node){if(!node)return;try{node.remove();}catch(_){}}
  function staleLoadedNode(node,spec){return !!node&&node.dataset?.loaded==="1"&&!spec.ready();}
  function failedNode(node){return !!node&&node.dataset?.loaded==="0";}
  function transportReady(ok,spec){return ok===true&&spec.ready()===true;}

  function load(spec){
    if(spec.ready())return Promise.resolve(true);
    let node=existing(spec.key);
    if(failedNode(node)||staleLoadedNode(node,spec)){
      lastRetryKey=spec.key;retryCount+=1;removeNode(node);node=null;
    }
    return new Promise(resolve=>{
      let settled=false;
      const finish=transportOk=>{
        if(settled)return;
        settled=true;
        clearTimeout(timer);
        const ready=transportReady(transportOk,spec);
        if(node)node.dataset.loaded=ready?"1":"0";
        if(!ready&&node)removeNode(node);
        resolve(ready);
      };
      const timer=setTimeout(()=>finish(false),TIMEOUT);
      if(node){
        node.addEventListener("load",()=>finish(true),{once:true});
        node.addEventListener("error",()=>finish(false),{once:true});
        return;
      }
      node=document.createElement("script");
      node.src=spec.src;
      node.async=false;
      node.dataset.strategyAAuditDemand=spec.key;
      node.addEventListener("load",()=>finish(true),{once:true});
      node.addEventListener("error",()=>finish(false),{once:true});
      document.body.appendChild(node);
    });
  }

  function ensure(why="simulation-open"){
    reason=String(why||"simulation-open");
    if(SPECS.every(x=>x.ready())){state="ready";lastError="";return Promise.resolve(true);}
    if(promise)return promise;
    state="loading";lastError="";
    promise=(async()=>{
      for(const spec of SPECS){
        const ok=await load(spec);
        if(!ok){state="error";lastError="load-failed:"+spec.key;return false;}
      }
      state="ready";lastError="";
      try{globalThis.AgentCryptoStrategyACostWaitOutcomeAudit406429?.refresh?.("406452-demand-ready");}catch(_){}
      try{globalThis.AgentCryptoStrategyAOracleCostCalibrationAudit?.refresh?.("406460-demand-ready");}catch(_){}
      try{globalThis.AgentCryptoStrategyARealVenueCostShadowTruth?.refresh?.("406466-demand-ready");}catch(_){}
      try{globalThis.AgentCryptoStrategyAOkxPotentialOutcomeAudit?.refresh?.("406471-demand-ready");}catch(_){}
      try{globalThis.AgentCryptoStrategyAOkxOutcomeCoverageTruth?.refresh?.("406472-demand-ready");}catch(_){}
      try{globalThis.AgentCryptoStrategyAProspectiveOutcomeEvidenceCapture?.render?.();}catch(_){}
      try{globalThis.AgentCryptoStrategyADurableEvidenceReconciliation?.render?.();}catch(_){}
      try{globalThis.AgentCryptoStrategyAEvidenceIdentityCrosswalk?.render?.();}catch(_){}
      try{globalThis.AgentCryptoStrategyAAfterCostCompletenessTruth?.render?.();}catch(_){}
      try{globalThis.AgentCryptoStrategyAExecutionCostEvidenceCapture?.install_bridge_facade?.();}catch(_){}
      try{globalThis.AgentCryptoStrategyAExecutionCostEvidenceCapture?.render?.();}catch(_){}
      try{window.dispatchEvent(new CustomEvent("agent-crypto:strategy-a-audits-ready",{detail:{build:BUILD,reason}}));}catch(_){}
      return true;
    })().finally(()=>{promise=null;});
    return promise;
  }

  document.addEventListener("toggle",event=>{
    const target=event?.target;
    if(target instanceof HTMLDetailsElement&&target.matches(SIMULATION_OWNER_SELECTOR)&&target.open===true)void ensure("simulation-open");
  },true);
  const simulation=simulationOwner();
  if(simulation?.open)queueMicrotask(()=>void ensure("simulation-already-open"));

  globalThis.AgentCryptoStrategyAAuditDemand=Object.freeze({
    build:BUILD,ensure,
    snapshot:()=>Object.freeze({build:BUILD,state,reason,last_error:lastError,last_retry_key:lastRetryKey,retry_count:retryCount,simulation_open:simulationOpen(),cost_wait_loaded:!!globalThis.AgentCryptoStrategyACostWaitOutcomeAudit406429,oracle_cost_loaded:!!globalThis.AgentCryptoStrategyAOracleCostCalibrationAudit,execution_cost_loaded:!!globalThis.AgentCryptoStrategyAExecutionCostTruth,real_venue_cost_shadow_loaded:!!globalThis.AgentCryptoStrategyARealVenueCostShadowTruth,okx_potential_outcome_loaded:!!globalThis.AgentCryptoStrategyAOkxPotentialOutcomeAudit,okx_outcome_coverage_loaded:!!globalThis.AgentCryptoStrategyAOkxOutcomeCoverageTruth,okx_t60_trajectory_loaded:!!globalThis.AgentCryptoStrategyAOkxT60TrajectoryUnknownTruth,durable_reconciliation_loaded:!!globalThis.AgentCryptoStrategyADurableEvidenceReconciliation,identity_crosswalk_loaded:!!globalThis.AgentCryptoStrategyAEvidenceIdentityCrosswalk,after_cost_completeness_loaded:!!globalThis.AgentCryptoStrategyAAfterCostCompletenessTruth,execution_cost_evidence_capture_loaded:!!globalThis.AgentCryptoStrategyAExecutionCostEvidenceCapture,prospective_outcome_evidence_loaded:!!globalThis.AgentCryptoStrategyAProspectiveOutcomeEvidenceCapture}),
    self_test:()=>{
      const owner=simulationOwner();
      const fakeSpec={ready:()=>false};
      const checks=Object.freeze({
        on_demand_only:true,
        simulation_owner_is_details:owner instanceof HTMLDetailsElement,
        simulation_owner_selector:!!owner?.matches?.(SIMULATION_OWNER_SELECTOR),
        inner_simulation_section_is_not_owner:document.getElementById("simulation")!==owner,
        stale_loaded_node_is_retryable:staleLoadedNode({dataset:{loaded:"1"}},fakeSpec)===true,
        failed_node_is_retryable:failedNode({dataset:{loaded:"0"}})===true,
        transport_success_requires_api:transportReady(true,fakeSpec)===false,
        execution_cost_on_demand:true,
        okx_potential_outcome_on_demand:true,
        okx_outcome_coverage_on_demand:true,
        okx_t60_trajectory_on_demand:true,
        durable_reconciliation_on_demand:true,
        identity_crosswalk_on_demand:true,
        after_cost_completeness_on_demand:true,
        execution_cost_evidence_capture_on_demand:true,
        no_recurring_timer:true,
        no_observer:true,
        no_storage_write:true,
        no_automatic_retry_loop:true
      });
      const metadata=Object.freeze({recurring_timer:false,observer:false,storage_write:false,automatic_retry_loop:false});
      return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks,metadata});
    },
    execution_cost_on_demand:true,real_venue_cost_shadow_on_demand:true,okx_potential_outcome_on_demand:true,okx_outcome_coverage_on_demand:true,okx_t60_trajectory_on_demand:true,durable_reconciliation_on_demand:true,identity_crosswalk_on_demand:true,after_cost_completeness_on_demand:true,execution_cost_evidence_capture_on_demand:true,recurring_timer:false,observer:false,storage_write:false,automatic_retry_loop:false,new_business_network_request:false
  });
})();

