/* Agent-Crypto @erith.IA — Historical Analog Engine V2
   Build 40.5.15. Explainable analogs over Event Memory V1.
   Historical reaction frequencies are descriptive, never trade probabilities. */
(() => {
  "use strict";
  const BUILD="40.5.15",SCHEMA="atlas_historical_analog_engine_v2";
  const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  const median=a=>{const v=a.filter(Number.isFinite).sort((x,y)=>x-y);if(!v.length)return null;const m=Math.floor(v.length/2);return v.length%2?v[m]:(v[m-1]+v[m])/2;};
  const mean=a=>{const v=a.filter(Number.isFinite);return v.length?v.reduce((s,x)=>s+x,0)/v.length:null;};
  function memoryApi(){return globalThis.AtlasEventMemory405014||null;}
  function similarityApi(){return globalThis.AtlasHistoricalAnalogEngine405008||null;}
  function enrichApi(){return globalThis.AtlasEventSemanticEnrichment405007||null;}
  function clusterMap(){const map=new Map();for(const c of enrichApi()?.clusters?.()||[])for(const id of c?.member_event_ids||[])map.set(String(id),String(c.cluster_id||""));return map;}
  function reaction(memory,horizon,asset){return finite(memory?.reaction_windows?.[horizon]?.reactions?.[asset]?.change_from_t0_pct);}
  function distribution(values){
    const v=values.filter(Number.isFinite),band=.10;
    return {count:v.length,positive:v.filter(x=>x>band).length,negative:v.filter(x=>x<-band).length,neutral:v.filter(x=>Math.abs(x)<=band).length,mean_pct:mean(v),median_pct:median(v),min_pct:v.length?Math.min(...v):null,max_pct:v.length?Math.max(...v):null,label:"historical_frequency_not_probability"};
  }
  function analyze(targetInput,options={}){
    const target=targetInput?.memory_id?targetInput:memoryApi()?.derive?.(targetInput);if(!target)return null;
    const asset=String(options.asset||target.assets?.[0]||"BTC").toUpperCase(),horizon=String(options.horizon||"+24h");
    const minScore=Number.isFinite(Number(options.min_similarity_score))?Number(options.min_similarity_score):55;
    const limit=Math.max(1,Math.min(50,Number(options.limit)||50));
    const clusters=clusterMap(),targetCluster=clusters.get(String(target.event_id))||null,out=[];
    for(const candidate of memoryApi()?.archive?.()||[]){
      if(!candidate?.quality?.eligible_for_analog||candidate.event_id===target.event_id)continue;
      if(targetCluster&&clusters.get(String(candidate.event_id))===targetCluster)continue;
      const sim=similarityApi()?.similarity?.(target.event,candidate.event)||{score_100:0,reasons:[]};
      if((sim?.score_100||0)<minScore)continue;
      const value=reaction(candidate,horizon,asset);if(value===null)continue;
      out.push({event_id:candidate.event_id,event_time:candidate.event_time,event_family:candidate.event_family,actor:candidate.semantic?.actor||null,action:candidate.semantic?.action||null,assets:candidate.assets||[],similarity:sim,reaction_pct:value,coverage:candidate.coverage,regime_t0:candidate.regime_t0||null});
    }
    out.sort((a,b)=>(b.similarity?.score_100||0)-(a.similarity?.score_100||0)||Math.abs(b.reaction_pct)-Math.abs(a.reaction_pct));
    const analogs=out.slice(0,limit),dist=distribution(analogs.map(x=>x.reaction_pct));
    return Object.freeze({schema:SCHEMA,build:BUILD,target_event_id:target.event_id,asset,horizon,min_similarity_score:minScore,analogs,distribution:dist,status:dist.count>=8?"DESCRIPTIVE_SAMPLE":dist.count?"INSUFFICIENT_SAMPLE":"NO_ANALOG",historical_frequency_only:true,probability_claim:false,causal_claim:false,prediction:false,financial_signal:false,automatic_order:false});
  }
  function current(options={}){return analyze(memoryApi()?.current?.()||null,options);}
  globalThis.AtlasHistoricalAnalogEngine405015=Object.freeze({build:BUILD,schema:SCHEMA,analyze,current,distribution,read_only:true,new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,historical_frequency_only:true,probability_claim:false,causal_claim:false,prediction:false,financial_signal:false,automatic_order:false});
})();
