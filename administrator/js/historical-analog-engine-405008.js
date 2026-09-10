/* Agent-Crypto @erith.IA — Historical Analog Engine V1 read-only
   Build 40.5.8. Explainable similarity over enriched News events + observed reaction ledger.
   Historical frequencies are not probabilities and never become orders. */
(() => {
  "use strict";
  const BUILD="40.5.8",SCHEMA="atlas_historical_analog_engine_v1";
  const text=v=>String(v??"").trim();const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  const set=v=>new Set((Array.isArray(v)?v:[]).map(x=>String(x).toUpperCase()).filter(Boolean));
  const jac=(A,B)=>{A=A instanceof Set?A:set(A);B=B instanceof Set?B:set(B);if(!A.size&&!B.size)return 0;let i=0;for(const x of A)if(B.has(x))i++;return i/(A.size+B.size-i||1);};
  const med=v=>{const a=v.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};
  const mean=v=>{const a=v.filter(Number.isFinite);return a.length?a.reduce((s,x)=>s+x,0)/a.length:null;};
  function amountScore(a,b){a=finite(a);b=finite(b);if(a===null||b===null||a<=0||b<=0)return null;return Math.max(0,1-Math.abs(Math.log10(a/b))/2);}
  function semantic(e){return e?.semantic_enrichment||{};}
  function similarity(target,candidate){
    const reasons=[];let weighted=0,total=0;
    const add=(name,score,weight)=>{if(score===null||score===undefined)return;const s=Math.max(0,Math.min(1,score));weighted+=s*weight;total+=weight;reasons.push({name,score:s,weight});};
    add("event_family",target?.event_family&&candidate?.event_family?Number(target.event_family===candidate.event_family):0,0.30);
    add("assets",jac(target?.assets,candidate?.assets),0.22);
    const ta=semantic(target),ca=semantic(candidate);
    add("action",ta.action&&ca.action?Number(ta.action===ca.action):null,0.16);
    add("actor",ta.actor&&ca.actor?Number(ta.actor===ca.actor):null,0.10);
    add("amount",amountScore(ta.amount?.value_base,ca.amount?.value_base),0.06);
    add("sectors",jac(target?.sectors,candidate?.sectors),0.06);
    const ht=jac(new Set(ta.headline_tokens||[]),new Set(ca.headline_tokens||[]));add("headline_tokens",ht,0.10);
    return {score:total?weighted/total:0,score_100:total?Math.round(weighted/total*100):0,reasons};
  }
  function ledgerById(){const m=new Map();for(const r of globalThis.AtlasEventReactionLedger405006?.archive?.()||[])if(r?.event_id)m.set(r.event_id,r);return m;}
  function clusterMembership(){const m=new Map();for(const c of globalThis.AtlasEventSemanticEnrichment405007?.clusters?.()||[])for(const id of c.member_event_ids||[])m.set(id,c.cluster_id);return m;}
  function reaction(row,horizon,symbol){const w=row?.reaction_windows?.[horizon];return finite(w?.reactions?.[symbol]?.change_from_t0_pct);}
  function distribution(values){const a=values.filter(Number.isFinite);const neutralBand=.10;return {count:a.length,positive:a.filter(v=>v>neutralBand).length,negative:a.filter(v=>v<-neutralBand).length,neutral:a.filter(v=>Math.abs(v)<=neutralBand).length,mean_pct:mean(a),median_pct:med(a),min_pct:a.length?Math.min(...a):null,max_pct:a.length?Math.max(...a):null,label:"historical_frequency_not_probability"};}
  function analyze(targetInput,options={}){
    const enrich=globalThis.AtlasEventSemanticEnrichment405007;const target=enrich?.enrich?.(targetInput)||targetInput;if(!target)return null;
    const ledger=ledgerById(),clusters=clusterMembership(),targetCluster=clusters.get(target.event_id)||null;
    const asset=String(options.asset||target.assets?.[0]||"BTC").toUpperCase();const horizon=String(options.horizon||"+24h");const minScore=Number.isFinite(Number(options.min_score))?Number(options.min_score):55;
    const candidates=[];
    for(const candidate of enrich?.archive?.()||[]){
      if(!candidate?.event_id||candidate.event_id===target.event_id)continue;if(targetCluster&&clusters.get(candidate.event_id)===targetCluster)continue;
      const row=ledger.get(candidate.event_id);if(!row?.quality?.eligible_for_analog)continue;
      const sim=similarity(target,candidate);if(sim.score_100<minScore)continue;
      const value=reaction(row,horizon,asset);candidates.push({event_id:candidate.event_id,event_time:candidate.event_time,event_family:candidate.event_family,actor:semantic(candidate).actor||null,action:semantic(candidate).action||null,assets:candidate.assets||[],source:candidate.source||null,similarity:sim,reaction_pct:value,coverage:row.coverage});
    }
    candidates.sort((a,b)=>b.similarity.score_100-a.similarity.score_100||Math.abs(b.reaction_pct||0)-Math.abs(a.reaction_pct||0));
    const top=candidates.slice(0,Number.isFinite(Number(options.limit))?Math.max(1,Math.min(50,Number(options.limit))):20);const dist=distribution(top.map(x=>x.reaction_pct));
    return Object.freeze({schema:SCHEMA,build:BUILD,target_event_id:target.event_id||null,asset,horizon,min_similarity_score:minScore,analogs:top,distribution:dist,status:dist.count>=8?"DESCRIPTIVE_SAMPLE":dist.count?"INSUFFICIENT_SAMPLE":"NO_ANALOG",historical_frequency_only:true,probability_claim:false,causal_claim:false,prediction:false,financial_signal:false,automatic_order:false});
  }
  function current(options={}){return analyze(globalThis.AtlasEventSemanticEnrichment405007?.current?.()||null,options);}
  globalThis.AtlasHistoricalAnalogEngine405008=Object.freeze({build:BUILD,schema:SCHEMA,similarity,analyze,current,read_only:true,new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,historical_frequency_only:true,probability_claim:false,causal_claim:false,prediction:false,financial_signal:false,automatic_order:false});
})();
