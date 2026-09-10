/* Agent-Crypto @erith.IA — Regime-Qualified Analogs V1
   Build 40.5.16. Adds crypto-breadth regime compatibility to historical analogs.
   Cross-market/macro regime is NOT claimed here. */
(() => {
  "use strict";
  const BUILD="40.5.16",SCHEMA="atlas_regime_qualified_analogs_v1";
  const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  function memoryApi(){return globalThis.AtlasEventMemory405014||null;}
  function analogApi(){return globalThis.AtlasHistoricalAnalogEngine405015||null;}
  function regimeApi(){return globalThis.AtlasMarketRegimeContext405009||null;}
  function qualify(targetInput,options={}){
    const target=targetInput?.memory_id?targetInput:memoryApi()?.derive?.(targetInput);if(!target)return null;
    const base=analogApi()?.analyze?.(target,options)||null;if(!base)return null;
    const minRegime=Number.isFinite(Number(options.min_regime_compatibility))?Number(options.min_regime_compatibility):0.55;
    const targetRegime=target.regime_t0||regimeApi()?.latest?.()||null,qualified=[];
    for(const row of base.analogs||[]){
      const rc=finite(regimeApi()?.compatibility?.(targetRegime,row.regime_t0));if(rc===null||rc<minRegime)continue;
      const semanticScore=finite(row?.similarity?.score)??((finite(row?.similarity?.score_100)||0)/100);
      qualified.push({...row,regime_compatibility:rc,combined_similarity_100:Math.round((semanticScore*0.70+rc*0.30)*100)});
    }
    qualified.sort((a,b)=>b.combined_similarity_100-a.combined_similarity_100);
    const dist=analogApi()?.distribution?.(qualified.map(x=>x.reaction_pct))||{count:0};
    return Object.freeze({schema:SCHEMA,build:BUILD,target_event_id:target.event_id,asset:base.asset,horizon:base.horizon,regime_scope:"crypto_breadth_24h_only",target_regime:targetRegime,minimum_regime_compatibility:minRegime,prequalified_count:(base.analogs||[]).length,qualified_analogs:qualified,distribution:dist,status:dist.count>=8?"REGIME_DESCRIPTIVE_SAMPLE":dist.count?"REGIME_INSUFFICIENT_SAMPLE":"NO_REGIME_ANALOG",full_market_regime:false,includes_cross_market:false,includes_macro:false,historical_frequency_only:true,probability_claim:false,causal_claim:false,prediction:false,financial_signal:false,automatic_order:false});
  }
  function current(options={}){return qualify(memoryApi()?.current?.()||null,options);}
  globalThis.AtlasRegimeQualifiedAnalogs405016=Object.freeze({build:BUILD,schema:SCHEMA,qualify,current,read_only:true,new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,regime_scope:"crypto_breadth_24h_only",historical_frequency_only:true,probability_claim:false,causal_claim:false,prediction:false,financial_signal:false,automatic_order:false});
})();
