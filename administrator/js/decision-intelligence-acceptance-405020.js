/* Agent-Crypto @erith.IA — Decision Intelligence Acceptance Matrix
   Build 40.5.20. Integration acceptance over existing Event→Memory→Analogs→Regime→Calibration→Survival owners.
   No model mutation, no network, no timer, no order. */
(() => {
  "use strict";
  const BUILD="40.5.20",SCHEMA="atlas_decision_intelligence_acceptance_matrix_v1";
  const owner=(name)=>globalThis[name]||null;
  const REQUIRED=Object.freeze([
    ["Event Intelligence","AtlasEventIntelligence405000"],
    ["Event Memory","AtlasEventMemory405014"],
    ["Historical Analogs","AtlasHistoricalAnalogEngine405015"],
    ["Regime Qualified Analogs","AtlasRegimeQualifiedAnalogs405016"],
    ["Horizon Calibration","AtlasHorizonCalibration405017"],
    ["Capital Survival","AtlasCapitalSurvival405018"]
  ]);
  const bool=(v)=>v===true;
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
    if(label==="Capital Survival"){checks.execution_not_authorized=api.execution_authorized===false;checks.no_investment_recommendation=api.investment_recommendation===false;}
    return {label,build:api.build||null,status:Object.values(checks).every(Boolean)?"PASS":"SAFETY_CONTRACT_MISMATCH",pass:Object.values(checks).every(Boolean),checks};
  }
  function safeCall(fn){try{return typeof fn==="function"?fn():null;}catch(error){return {__error:String(error?.message||error)}};}
  function matrix(){
    const owners=REQUIRED.map(([label,name])=>{const api=owner(name);return {label,name,available:!!api,build:api?.build||null,safety:safety(api,label)};});
    const ownerPass=owners.every(x=>x.available),safetyPass=owners.every(x=>x.safety.pass);
    const memory=safeCall(owner("AtlasEventMemory405014")?.current);
    const analog=safeCall(owner("AtlasHistoricalAnalogEngine405015")?.current);
    const regime=safeCall(owner("AtlasRegimeQualifiedAnalogs405016")?.current);
    const calibration=safeCall(owner("AtlasHorizonCalibration405017")?.current);
    const survival=safeCall(owner("AtlasCapitalSurvival405018")?.current);
    const currentEvent=memory && !memory.__error ? memory : null;
    const dataState=!currentEvent?"NO_CURRENT_EVENT":currentEvent.status||"EVENT_AVAILABLE";
    const runtime=[
      {stage:"Event Memory",available:!!currentEvent,status:currentEvent?.status||dataState},
      {stage:"Historical Analogs",available:!!analog&&!analog?.__error,status:analog?.status||(!currentEvent?"NOT_APPLICABLE":"NO_OUTPUT")},
      {stage:"Regime Qualified",available:!!regime&&!regime?.__error,status:regime?.status||(!currentEvent?"NOT_APPLICABLE":"NO_OUTPUT")},
      {stage:"Calibration",available:!!calibration&&!calibration?.__error,status:calibration?.status||(!currentEvent?"NOT_APPLICABLE":"NO_OUTPUT")},
      {stage:"Capital Survival",available:!!survival&&!survival?.__error,status:survival?.risk_gate||survival?.status||"NO_OUTPUT"}
    ];
    const version=owner("ErithVersionTruth")?.snapshot?.()||null;
    const versionLock=!!version && version.false_propagation===false && owner("ErithVersionTruth")?.single_visible_owner===true;
    const architecturePass=ownerPass&&safetyPass&&versionLock;
    return Object.freeze({schema:SCHEMA,build:BUILD,status:architecturePass?"PASS":"FAIL",architecture_pass:architecturePass,owners,safety_pass:safetyPass,version_truth:{available:!!version,single_visible_owner:owner("ErithVersionTruth")?.single_visible_owner===true,false_propagation_locked:version?.false_propagation===false,loaded:version?.loaded||null,published:version?.published||null},current_data_status:dataState,runtime,acceptance_scope:"architecture_and_safety_contracts; data sufficiency reported separately",models_modified:false,new_source:false,new_fetch:false,new_timer:false,new_observer:false,storage_write:false,automatic_order:false,financial_advice:false});
  }
  globalThis.AtlasDecisionIntelligenceAcceptance405020=Object.freeze({build:BUILD,schema:SCHEMA,matrix,snapshot:matrix,required_owners:REQUIRED,read_only:true,models_modified:false,new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,financial_signal:false,investment_recommendation:false,automatic_order:false});
})();