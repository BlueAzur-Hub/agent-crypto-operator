/* Agent-Crypto @erith.IA — Capital Survival V1
   Build 40.5.18. Pure risk gate for simulation/hypothetical positions.
   Never reads a real wallet, never submits an order, never turns calibration into advice. */
(() => {
  "use strict";
  const BUILD="40.5.18",SCHEMA="atlas_capital_survival_v1";
  const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  const DEFAULT_PROFILE=Object.freeze({name:"Solo Progression 1 000 € · STRATÉGIE A",virtual_profile:true,capital_eur:1000,ticket_eur:50,max_operation_eur:100,max_exposure_eur:300,reserve_min_eur:700,max_drawdown_pct:10,allowed_assets:Object.freeze(["BTC","ETH","SOL"]),source:"existing Agent-Crypto simulation profile; not an actual portfolio"});
  function calibrationRisk(calibration){
    if(!calibration)return {status:"NO_CALIBRATION",risk:"HIGH",reasons:["Aucune calibration disponible"]};
    const h24=calibration?.horizons?.["+24h"],h48=calibration?.horizons?.["+48h"],n=Math.min(h24?.sample_size||0,h48?.sample_size||0);
    const span=Math.max(Math.abs(finite(h24?.min_reaction_pct)||0),Math.abs(finite(h24?.max_reaction_pct)||0),Math.abs(finite(h48?.min_reaction_pct)||0),Math.abs(finite(h48?.max_reaction_pct)||0));
    const reasons=[];if(n<8)reasons.push("Échantillon analogues insuffisant");else if(n<30)reasons.push("Échantillon descriptif non calibré hors échantillon");if(span>=10)reasons.push("Amplitude historique extrême >= 10 %");
    return {status:calibration.status||"UNKNOWN",risk:n<8||span>=10?"HIGH":n<30?"ELEVATED":"MEASURED",sample_size:n,max_observed_abs_pct:span,reasons};
  }
  function evaluate(input={}){
    const profile={...DEFAULT_PROFILE,...(input.profile||{})},calibration=input.calibration||globalThis.AtlasHorizonCalibration405017?.current?.({asset:input.asset})||null,cr=calibrationRisk(calibration);
    const position=finite(input.position_eur),existing=Math.max(0,finite(input.existing_exposure_eur)||0),capital=Math.max(0,finite(profile.capital_eur)||0),reserve=Math.max(0,finite(profile.reserve_min_eur)||0),maxExposure=Math.max(0,finite(profile.max_exposure_eur)||0),maxOperation=Math.max(0,finite(profile.max_operation_eur)||0),drawdown=Math.max(0,finite(input.current_drawdown_pct)||0),asset=String(input.asset||calibration?.asset||"").toUpperCase();
    const reasons=[],warnings=[];if(cr.risk==="HIGH")reasons.push(...cr.reasons);else warnings.push(...cr.reasons);
    if(position===null||position<=0)return Object.freeze({schema:SCHEMA,build:BUILD,status:"OBSERVE_ONLY",risk_gate:"NO_POSITION_TO_EVALUATE",asset:asset||null,profile:{...profile},calibration_risk:cr,reasons:[...new Set(reasons)],warnings:[...new Set(warnings)],execution_authorized:false,investment_recommendation:false,automatic_order:false,real_wallet_read:false,real_order:false});
    const exposureAfter=existing+position,reserveAfter=capital-exposureAfter;
    if(position>maxOperation)reasons.push(`Position ${position.toFixed(2)} € > maximum opération ${maxOperation.toFixed(2)} €`);
    if(exposureAfter>maxExposure)reasons.push(`Exposition ${exposureAfter.toFixed(2)} € > maximum ${maxExposure.toFixed(2)} €`);
    if(reserveAfter<reserve)reasons.push(`Réserve après exposition ${reserveAfter.toFixed(2)} € < minimum ${reserve.toFixed(2)} €`);
    if(drawdown>=Number(profile.max_drawdown_pct||10))reasons.push(`Drawdown ${drawdown.toFixed(2)} % >= seuil ${Number(profile.max_drawdown_pct||10).toFixed(2)} %`);
    if(asset&&Array.isArray(profile.allowed_assets)&&!profile.allowed_assets.includes(asset))reasons.push(`Actif ${asset} hors profil simulé autorisé`);
    if(String(input.liquidity_status||"OK").toUpperCase()!=="OK")reasons.push("Liquidité non qualifiée");
    const riskGate=reasons.length?"REFUSE":warnings.length?"PASS_WITH_CAUTION":"PASS";
    return Object.freeze({schema:SCHEMA,build:BUILD,status:"RISK_EVALUATED",risk_gate:riskGate,asset:asset||null,profile:{...profile},position_eur:position,existing_exposure_eur:existing,exposure_after_eur:exposureAfter,reserve_after_eur:reserveAfter,current_drawdown_pct:drawdown,calibration_risk:cr,reasons:[...new Set(reasons)],warnings:[...new Set(warnings)],execution_authorized:false,investment_recommendation:false,automatic_order:false,real_wallet_read:false,real_order:false});
  }
  function current(){return evaluate({});}
  globalThis.AtlasCapitalSurvival405018=Object.freeze({build:BUILD,schema:SCHEMA,default_profile:DEFAULT_PROFILE,evaluate,current,read_only:true,new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,execution_authorized:false,investment_recommendation:false,automatic_order:false,real_wallet_read:false,real_order:false});
})();
