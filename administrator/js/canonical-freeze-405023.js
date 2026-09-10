/* Agent-Crypto @erith.IA — 40.5 Canonical Freeze / Final Acceptance
   Build 40.5.23. Final read-only closure contract for the 40.5 lineage. */
(() => {
  "use strict";
  const BUILD="40.5.23",SCHEMA="agent_crypto_40_5_canonical_freeze_v1";
  function api(n){return globalThis[n]||null;}
  function snapshot(){
    const acceptance=api("AtlasDecisionIntelligenceAcceptance405020")?.matrix?.()||null;
    const explain=api("AtlasDecisionExplainability405021")?.current?.()||null;
    const cross=api("AtlasCrossMarketOwnerMap405022")?.integrity?.()||null;
    const version=api("ErithVersionTruth")?.snapshot?.()||null;
    const checks={
      loaded_build_is_40_5_23:version?.loaded===BUILD||document.querySelector('meta[name="administrator-build"]')?.content===BUILD,
      false_propagation_locked:version?.false_propagation===false,
      single_visible_version_owner:api("ErithVersionTruth")?.single_visible_owner===true,
      decision_architecture_safe:acceptance?.architecture_pass===true,
      no_advice_output:api("AtlasDecisionExplainability405021")?.investment_recommendation===false&&api("AtlasDecisionExplainability405021")?.execution_authorized===false,
      capital_survival_no_execution:api("AtlasCapitalSurvival405018")?.execution_authorized===false&&api("AtlasCapitalSurvival405018")?.automatic_order===false,
      cross_market_no_invention:cross?.domains?.filter?.(d=>["indices","energy","cross"].includes(d.domain)).every?.(d=>d.active===false&&d.truth==="NOT_ACTIVATED_NO_DATA_INVENTED")===true,
      no_new_timer:true,
      no_new_observer:true,
      no_new_source:true
    };
    const pass=Object.values(checks).every(Boolean);
    return Object.freeze({schema:SCHEMA,build:BUILD,status:pass?"40_5_FREEZE_ACCEPTED":"40_5_FREEZE_BLOCKED",checks,version_truth:version,decision_acceptance:acceptance?.status||null,decision_runtime_data_status:acceptance?.current_data_status||null,explainability_status:explain?.status||null,cross_market_status:cross?.status||null,market_core:"38.15.11 protected",strategy_a:"paper/read-only unchanged",automatic_order:false,execution_authorized:false,investment_recommendation:false,new_source:false,new_fetch:false,new_timer:false,new_observer:false,storage_write:false,freeze:true,next_lineage_rule:"40.6 only for a material, separately validated new capability; 40.5 is closed after Firefox field acceptance"});
  }
  globalThis.AgentCryptoCanonicalFreeze405023=Object.freeze({build:BUILD,schema:SCHEMA,snapshot,read_only:true,freeze:true,new_source:false,new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,investment_recommendation:false,execution_authorized:false,automatic_order:false});
})();