/* Agent-Crypto @erith.IA — Cross-Market Owner Map / Data-Age Integrity
   Build 40.5.22. Maps existing owners only; does not invent Indices/Energy/Cross engines or add a data source. */
(() => {
  "use strict";
  const BUILD="40.5.22",SCHEMA="atlas_cross_market_owner_map_v1";
  const parseTime=v=>{const n=Date.parse(String(v||""));return Number.isFinite(n)?n:null;};
  const age=(t,now)=>{const n=parseTime(t);return n===null?null:Math.max(0,now-n);};
  const ageLabel=ms=>ms===null?"AGE_UNKNOWN":ms<=2*60*1000?"LIVE_OR_NEAR_LIVE":ms<=45*60*1000?"CURRENT":ms<=24*60*60*1000?"DELAYED":"HISTORICAL_OR_STALE";
  function crypto(now){
    let rows=[];try{rows=globalThis.AgentCryptoEventReactionSource405005?.snapshot?.()?.records||[];}catch(_){}
    const latest=[...rows].filter(r=>parseTime(r?.timestamp)!==null).sort((a,b)=>parseTime(a.timestamp)-parseTime(b.timestamp)).at(-1)||null;
    const a=age(latest?.timestamp,now);
    return {domain:"crypto",runtime_owner:"AgentCryptoEventReactionSource405005 + canonical market broker",owner_available:!!globalThis.AgentCryptoEventReactionSource405005,data_timestamp:latest?.timestamp||null,data_age_ms:a,data_age_state:ageLabel(a),data_scope:"collector snapshot / crypto market",active:true};
  }
  function metals(now){
    const demand=globalThis.AtlasParallelMarketDemand40465||null;
    let quote=null,summary=null;
    try{quote=typeof globalThis.atlasMetalsQuoteFoundationQuote==="function"?globalThis.atlasMetalsQuoteFoundationQuote("gold"):null;}catch(_){}
    try{summary=typeof globalThis.atlasMetalsQuoteFoundationSummaryCore==="function"?globalThis.atlasMetalsQuoteFoundationSummaryCore():null;}catch(_){}
    const t=quote?.source_time||quote?.received_at||null,a=age(t,now),snap=demand?.snapshot?.()||null;
    return {domain:"metals",runtime_owner:"atlasMetalsQuoteFoundation* + AtlasParallelMarketDemand40465",owner_available:!!demand||typeof globalThis.atlasMetalsQuoteFoundationQuote==="function",data_timestamp:t,data_age_ms:a,data_age_state:ageLabel(a),quote_count:Number(summary?.quoteCount||0),history_available:summary?.historyAvailable===true,demand_state:snap?.state||null,data_scope:"Gold API current indicative quotes + Yahoo Futures history + qualified references",active:true};
  }
  function planned(domain){return {domain,runtime_owner:null,owner_available:false,data_timestamp:null,data_age_ms:null,data_age_state:"NO_RUNTIME_OWNER",data_scope:"visual/planned cross-market architecture only",active:false,truth:"NOT_ACTIVATED_NO_DATA_INVENTED"};}
  function integrity(options={}){
    const now=Number.isFinite(Number(options.now_ms))?Number(options.now_ms):Date.now();
    const domains=[crypto(now),metals(now),planned("indices"),planned("energy"),planned("cross")];
    const available=domains.filter(x=>x.owner_available),aged=available.filter(x=>x.data_age_state==="AGE_UNKNOWN"||x.data_age_state==="HISTORICAL_OR_STALE");
    const comparable=available.filter(x=>x.data_age_state!=="AGE_UNKNOWN").length>=2;
    return Object.freeze({schema:SCHEMA,build:BUILD,status:aged.length?"AGE_WARNING":available.length>=2?"OWNER_MAP_READY":"PARTIAL_OWNER_MAP",domains,comparison_gate:{cross_market_comparison_authorized:comparable&&aged.length===0,reason:!comparable?"moins de deux domaines actifs et horodatés":aged.length?"au moins un domaine actif est trop ancien ou d'âge inconnu":"domaines actifs horodatés; la comparaison reste descriptive"},owner_truth:"Indices/Energy/Cross are not promoted to runtime owners until real code/data owners exist",new_source:false,new_fetch:false,new_timer:false,new_observer:false,storage_write:false,automatic_order:false});
  }
  globalThis.AtlasCrossMarketOwnerMap405022=Object.freeze({build:BUILD,schema:SCHEMA,integrity,snapshot:integrity,read_only:true,new_source:false,new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,financial_signal:false,investment_recommendation:false,automatic_order:false});
})();