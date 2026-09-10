/* Agent-Crypto @erith.IA — 24/48H Explainability / No-Advice Output
   Build 40.5.21. Human-readable historical orientation with explicit limits and risk gate.
   Never emits buy/sell advice and never authorizes execution. */
(() => {
  "use strict";
  const BUILD="40.5.21",SCHEMA="atlas_horizon_explainability_no_advice_v1";
  const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  const uniq=a=>[...new Set((a||[]).filter(Boolean))];
  function memoryApi(){return globalThis.AtlasEventMemory405014||null;}
  function calibrationApi(){return globalThis.AtlasHorizonCalibration405017||null;}
  function survivalApi(){return globalThis.AtlasCapitalSurvival405018||null;}
  function acceptanceApi(){return globalThis.AtlasDecisionIntelligenceAcceptance405020||null;}
  function direction(h){
    const n=Number(h?.directional_sample_size||0),up=finite(h?.empirical_up_frequency_pct),down=finite(h?.empirical_down_frequency_pct);
    if(n<8||up===null||down===null)return {code:"INSUFFICIENT_SAMPLE",label:"Échantillon insuffisant",strength:"NONE"};
    if(up>=65&&up-down>=15)return {code:"HISTORICAL_UP_BIAS",label:"Analogues historiquement plutôt haussiers",strength:up>=75?"STRONG_DESCRIPTIVE":"MODERATE_DESCRIPTIVE"};
    if(down>=65&&down-up>=15)return {code:"HISTORICAL_DOWN_BIAS",label:"Analogues historiquement plutôt baissiers",strength:down>=75?"STRONG_DESCRIPTIVE":"MODERATE_DESCRIPTIVE"};
    return {code:"MIXED_HISTORY",label:"Analogues historiquement mixtes",strength:"LOW_DESCRIPTIVE"};
  }
  function horizonBlock(cal,h){
    const row=cal?.horizons?.[h]||null,d=direction(row),forReasons=[],against=[],missing=[];
    const up=finite(row?.empirical_up_frequency_pct),down=finite(row?.empirical_down_frequency_pct),med=finite(row?.median_reaction_pct),n=Number(row?.directional_sample_size||0),total=Number(row?.sample_size||0);
    if(total>=8)forReasons.push(`${total} analogues qualifiés disponibles`); else missing.push(`moins de 8 analogues qualifiés pour ${h}`);
    if(up!==null&&up>=55)forReasons.push(`fréquence historique positive ${up.toFixed(1)} % sur l'échantillon directionnel`);
    if(down!==null&&down>=55)against.push(`fréquence historique négative ${down.toFixed(1)} % sur l'échantillon directionnel`);
    if(med!==null&&med>0.10)forReasons.push(`médiane historique ${med>=0?"+":""}${med.toFixed(2)} %`);
    if(med!==null&&med<-0.10)against.push(`médiane historique ${med.toFixed(2)} %`);
    if(n<30)against.push("fréquence descriptive non certifiée hors échantillon");
    if(row?.wilson95_up_pct){const w=row.wilson95_up_pct;against.push(`incertitude Wilson 95 % : hausse ${Number(w.low_pct).toFixed(1)}–${Number(w.high_pct).toFixed(1)} %`);}
    return {horizon:h,status:row?.status||"NO_SAMPLE",direction:d,sample_size:total,directional_sample_size:n,for:uniq(forReasons),against:uniq(against),missing:uniq(missing),historical_only:true,forecast_probability:false};
  }
  function explain(targetInput=null,options={}){
    const target=targetInput?.memory_id?targetInput:(targetInput?memoryApi()?.derive?.(targetInput):memoryApi()?.current?.())||null;
    if(!target)return Object.freeze({schema:SCHEMA,build:BUILD,status:"NO_CURRENT_EVENT",operator_action:"CONSULTATION_ONLY",for:[],against:["Aucun événement courant exploitable"],invalidation:["Attendre un événement structuré et horodaté"],missing_data:["Event Memory courant"],investment_advice:false,execution_authorized:false,automatic_order:false});
    const asset=String(options.asset||target.assets?.[0]||"BTC").toUpperCase();
    const cal=calibrationApi()?.analyze?.(target,{asset})||null;
    const simulation={...(options.simulation||{}),asset,calibration:cal};
    const survival=survivalApi()?.evaluate?.(simulation)||null;
    const h24=horizonBlock(cal,"+24h"),h48=horizonBlock(cal,"+48h");
    const forReasons=[],against=[],invalidation=[],missing=[];
    const evidence=finite(target?.evidence_score),impact=finite(target?.impact_score);
    if(evidence!==null&&evidence>=70)forReasons.push(`événement documenté : évidence ${evidence.toFixed(0)}/100`); else if(evidence!==null)against.push(`évidence événement limitée : ${evidence.toFixed(0)}/100`); else missing.push("score d'évidence événement");
    if(impact!==null&&impact>=70)forReasons.push(`impact événement élevé : ${impact.toFixed(0)}/100`);
    forReasons.push(...h24.for.map(x=>`24h · ${x}`),...h48.for.map(x=>`48h · ${x}`));
    against.push(...h24.against.map(x=>`24h · ${x}`),...h48.against.map(x=>`48h · ${x}`));
    missing.push(...h24.missing,...h48.missing);
    if(target?.regime_t0?.scope==="crypto_breadth_24h_only")missing.push("régime macro/cross-market complet non inclus");
    invalidation.push("changement significatif du régime de marché par rapport aux analogues");
    invalidation.push("nouvelle information matérielle postérieure à T0");
    invalidation.push("données de marché trop anciennes ou source non qualifiée");
    if(survival?.risk_gate==="REFUSE")against.push(...(survival.reasons||[]).map(x=>`Capital Survival · ${x}`));
    const orientations=[h24.direction.code,h48.direction.code];
    const same=orientations[0]===orientations[1]&&["HISTORICAL_UP_BIAS","HISTORICAL_DOWN_BIAS"].includes(orientations[0]);
    const orientation=same?orientations[0]:"MIXED_OR_UNCERTAIN";
    const acceptance=acceptanceApi()?.matrix?.()||null;
    return Object.freeze({schema:SCHEMA,build:BUILD,status:"EXPLAINED",asset,event_id:target.event_id||null,event_label:target.event_label||null,operator_action:"CONSULTATION_ONLY",orientation_24_48:orientation,horizons:{"+24h":h24,"+48h":h48},for:uniq(forReasons),against:uniq(against),invalidation:uniq(invalidation),missing_data:uniq(missing),capital_survival:survival,architecture_acceptance:acceptance?.status||null,wording_lock:"historical orientation, never buy/sell instruction",investment_advice:false,execution_authorized:false,automatic_order:false,financial_signal:false,forecast_probability:false});
  }
  function current(options={}){return explain(null,options);}
  globalThis.AtlasDecisionExplainability405021=Object.freeze({build:BUILD,schema:SCHEMA,explain,current,read_only:true,new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,investment_recommendation:false,execution_authorized:false,automatic_order:false,financial_signal:false,forecast_probability:false});
})();