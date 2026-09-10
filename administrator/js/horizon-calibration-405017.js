/* Agent-Crypto @erith.IA — 24/48H Calibration Foundation V1
   Build 40.5.17. Auditable empirical frequencies over regime-qualified analogs.
   Frequencies and intervals are NOT a live trading probability. */
(() => {
  "use strict";
  const BUILD="40.5.17",SCHEMA="atlas_horizon_calibration_foundation_v1",BAND=.10;
  const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  function qApi(){return globalThis.AtlasRegimeQualifiedAnalogs405016||null;}
  function wilson(success,total,z=1.96){
    if(!Number.isFinite(success)||!Number.isFinite(total)||total<=0)return null;
    const p=success/total,z2=z*z,den=1+z2/total,centre=(p+z2/(2*total))/den,half=(z*Math.sqrt((p*(1-p)+z2/(4*total))/total))/den;
    return {low_pct:Math.max(0,(centre-half)*100),high_pct:Math.min(100,(centre+half)*100)};
  }
  function horizon(target,horizon,options={}){
    const q=qApi()?.qualify?.(target,{...options,horizon,limit:50})||null;if(!q)return null;
    const vals=(q.qualified_analogs||[]).map(x=>finite(x.reaction_pct)).filter(Number.isFinite);
    const pos=vals.filter(v=>v>BAND).length,neg=vals.filter(v=>v<-BAND).length,neu=vals.length-pos-neg,dir=pos+neg;
    const status=vals.length>=30?"CALIBRATION_CANDIDATE":vals.length>=8?"DESCRIPTIVE_SAMPLE":vals.length?"INSUFFICIENT_SAMPLE":"NO_SAMPLE";
    return {horizon,sample_size:vals.length,directional_sample_size:dir,positive:pos,negative:neg,neutral:neu,empirical_up_frequency_pct:dir?pos/dir*100:null,empirical_down_frequency_pct:dir?neg/dir*100:null,neutral_frequency_pct:vals.length?neu/vals.length*100:null,wilson95_up_pct:dir?wilson(pos,dir):null,median_reaction_pct:finite(q?.distribution?.median_pct),mean_reaction_pct:finite(q?.distribution?.mean_pct),min_reaction_pct:finite(q?.distribution?.min_pct),max_reaction_pct:finite(q?.distribution?.max_pct),status,qualified_analog_count:vals.length,regime_scope:q.regime_scope,calibrated_probability:false,historical_frequency_not_forecast_probability:true};
  }
  function analyze(targetInput,options={}){
    const target=targetInput?.memory_id?targetInput:(globalThis.AtlasEventMemory405014?.derive?.(targetInput)||null);if(!target)return null;
    const h24=horizon(target,"+24h",options),h48=horizon(target,"+48h",options),sample=Math.min(h24?.sample_size||0,h48?.sample_size||0);
    const status=sample>=30?"CALIBRATION_CANDIDATE":sample>=8?"DESCRIPTIVE_ONLY":sample?"INSUFFICIENT_SAMPLE":"NO_SAMPLE";
    return Object.freeze({schema:SCHEMA,build:BUILD,target_event_id:target.event_id,asset:String(options.asset||target.assets?.[0]||"BTC").toUpperCase(),horizons:{"+24h":h24,"+48h":h48},status,calibration_rule:"n>=30 only marks candidate for later out-of-sample calibration; it does not certify a forecast probability",calibrated_probability:false,probability_claim:false,causal_claim:false,financial_signal:false,automatic_order:false});
  }
  function current(options={}){return analyze(globalThis.AtlasEventMemory405014?.current?.()||null,options);}
  globalThis.AtlasHorizonCalibration405017=Object.freeze({build:BUILD,schema:SCHEMA,analyze,current,horizon,wilson,read_only:true,new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,calibrated_probability:false,probability_claim:false,causal_claim:false,financial_signal:false,automatic_order:false});
})();
