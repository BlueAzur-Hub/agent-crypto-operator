/* Agent-Crypto @erith.IA — Decision Intelligence Acceptance Matrix
   Architecture/safety acceptance only.
   Runtime data is supplied by the canonical Decision Intelligence owner and is never recomputed here.
   No model mutation, network, timer or order. */
(() => {
  "use strict";
  const SCHEMA="atlas_decision_intelligence_acceptance_matrix_v1";
  const owner=name=>globalThis[name]||null;
  const runtimeBuild=()=>{
    try{
      return String(
        owner("ErithVersionTruth")?.snapshot?.()?.loaded
        || document.documentElement.dataset.agentCryptoLoadedBuild
        || globalThis.AGENT_CRYPTO_EFFECTIVE_BUILD
        || ""
      ).trim()||null;
    }catch(_){return null;}
  };
  const REQUIRED=Object.freeze([
    ["Event Intelligence","AtlasEventIntelligence"],
    ["Event Memory","AtlasEventMemory"],
    ["Historical Analogs","AtlasHistoricalAnalogEngine405015"],
    ["Regime Qualified Analogs","AtlasRegimeQualifiedAnalogs"],
    ["Horizon Calibration","AtlasHorizonCalibration"],
    ["Capital Survival","AtlasCapitalSurvival"]
  ]);
  const bool=v=>v===true;
  const falseIfDeclared=(api,key)=>!(key in api)||api[key]===false;
  function safety(api,label){
    if(!api)return {label,status:"MISSING_OWNER",pass:false};
    const checks={
      read_only:bool(api.read_only),
      storage_write_disabled:api.storage_write===false,
      new_fetch_disabled:api.new_fetch===false,
      new_timer_disabled:api.new_timer===false,
      new_observer_disabled_or_not_declared:falseIfDeclared(api,"new_observer"),
      new_storage_owner_disabled_or_not_declared:falseIfDeclared(api,"new_storage_owner"),
      automatic_order_disabled:api.automatic_order===false
    };
    if(label==="Capital Survival"){
      checks.execution_not_authorized=api.execution_authorized===false;
      checks.no_investment_recommendation=api.investment_recommendation===false;
    }
    return {
      label,
      module_build:api.build||null,
      status:Object.values(checks).every(Boolean)?"PASS":"SAFETY_CONTRACT_MISMATCH",
      pass:Object.values(checks).every(Boolean),
      checks
    };
  }
  function matrix(options={}){
    const owners=REQUIRED.map(([label,name])=>{
      const api=owner(name);
      return {label,name,available:!!api,module_build:api?.build||null,safety:safety(api,label)};
    });
    const ownerPass=owners.every(x=>x.available);
    const safetyPass=owners.every(x=>x.safety.pass);
    const version=owner("ErithVersionTruth")?.snapshot?.()||null;
    const versionOwner=owner("ErithVersionTruth");
    const falsePropagationCompatible=!version||!("false_propagation" in version)||version.false_propagation===false;
    const versionLock=!!version
      && versionOwner?.single_visible_owner===true
      && versionOwner?.build_json_authority===true
      && versionOwner?.version_branching===false
      && versionOwner?.reload_current_build===false
      && falsePropagationCompatible;
    const architecturePass=ownerPass&&safetyPass&&versionLock;
    const runtime=Array.isArray(options.runtime)?options.runtime:[];
    return Object.freeze({
      schema:SCHEMA,
      build:runtimeBuild(),
      status:architecturePass?"PASS":"FAIL",
      architecture_pass:architecturePass,
      owners,
      safety_pass:safetyPass,
      version_truth:{
        available:!!version,
        single_visible_owner:versionOwner?.single_visible_owner===true,
        build_json_authority:versionOwner?.build_json_authority===true,
        version_branching_disabled:versionOwner?.version_branching===false,
        reload_current_build_disabled:versionOwner?.reload_current_build===false,
        false_propagation_legacy_compatible:falsePropagationCompatible,
        loaded:version?.loaded||null,
        published:version?.published||null
      },
      current_data_status:String(options.current_data_status||"NOT_EVALUATED"),
      runtime,
      acceptance_scope:"architecture_and_safety_contracts; runtime data supplied externally",
      runtime_recomputed:false,
      models_modified:false,
      new_source:false,
      new_fetch:false,
      new_timer:false,
      new_observer:false,
      storage_write:false,
      automatic_order:false,
      financial_advice:false
    });
  }
  globalThis.AtlasDecisionIntelligenceAcceptance=Object.freeze({
    schema:SCHEMA,
    matrix,
    snapshot:matrix,
    required_owners:REQUIRED,
    read_only:true,
    models_modified:false,
    new_storage_owner:false,
    storage_write:false,
    new_fetch:false,
    new_timer:false,
    new_observer:false,
    financial_signal:false,
    investment_recommendation:false,
    automatic_order:false
  });
})();