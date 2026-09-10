/* Agent-Crypto @erith.IA — Event Semantic Enrichment + conservative dedup foundation
   Build 40.5.7. Deterministic extraction only from existing event text/metadata.
   Unknown stays null. Dedup is conservative and preserves every member/source. */
(() => {
  "use strict";
  const BUILD="40.5.7",SCHEMA="atlas_event_semantic_enrichment_v1";
  const text=v=>String(v??"").replace(/\s+/g," ").trim();
  const norm=v=>text(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const tokens=v=>new Set(norm(v).split(/[^a-z0-9]+/).filter(x=>x.length>2&&!STOP.has(x)));
  const STOP=new Set(["the","and","for","with","from","this","that","after","amid","into","sur","les","des","une","dans","pour","avec","apres","aux","crypto","bitcoin","ethereum","solana"]);
  const jaccard=(a,b)=>{const A=a instanceof Set?a:new Set(a||[]),B=b instanceof Set?b:new Set(b||[]);if(!A.size&&!B.size)return 0;let i=0;for(const x of A)if(B.has(x))i++;return i/(A.size+B.size-i||1);};
  const assetScore=(a,b)=>jaccard(new Set((a||[]).map(x=>String(x).toUpperCase())),new Set((b||[]).map(x=>String(x).toUpperCase())));
  const ACTORS=[
    ["Federal Reserve",/\bfederal reserve\b|\bthe fed\b/i],["ECB",/\beuropean central bank\b|\bbce\b|\becb\b/i],
    ["SEC",/\bu\.?s\.? sec\b|\bsecurities and exchange commission\b|\bsec\b/i],["CFTC",/\bcftc\b|commodity futures trading commission/i],
    ["U.S. Treasury",/\bu\.?s\.? treasury\b|\btreasury department\b/i],["BlackRock",/\bblackrock\b/i],["Fidelity",/\bfidelity\b/i],
    ["Strategy",/\bmicrostrategy\b|\bstrategy\b/i],["Coinbase",/\bcoinbase\b/i],["Binance",/\bbinance\b/i],["Kraken",/\bkraken\b/i],
    ["Tether",/\btether\b/i],["Circle",/\bcircle\b/i],["Ripple",/\bripple\b/i]
  ];
  const ACTIONS=[
    ["security_exploit",/\bhack(?:ed|er|ers|ing)?\b|\bexploit(?:ed|s)?\b|\bbreach(?:ed)?\b/i],
    ["liquidation",/\bliquidat(?:ion|ions|ed|es|ing)\b/i],["inflow",/\binflow(?:s)?\b|\bnet inflow(?:s)?\b|\bflows? into\b/i],
    ["outflow",/\boutflow(?:s)?\b|\bnet outflow(?:s)?\b|\bflows? out\b/i],["purchase",/\bbuy(?:s|ing)?\b|\bbought\b|\bpurchase(?:s|d)?\b|\bacquir(?:e|es|ed|ing)\b/i],
    ["sale",/\bsell(?:s|ing)?\b|\bsold\b|\bdivest(?:s|ed|ing)?\b/i],["investment",/\binvest(?:s|ed|ment|ments|ing)\b|\bcapital injection\b/i],
    ["approval",/\bapprov(?:e|es|ed|al)\b/i],["rejection",/\breject(?:s|ed|ion)\b|\bden(?:y|ies|ied)\b/i],
    ["rate_cut",/\brate cut\b|\bcuts? rates?\b|\blower(?:s|ed|ing)? rates?\b/i],["rate_hike",/\brate hike\b|\braises? rates?\b|\bhikes? rates?\b/i],
    ["bankruptcy",/\bbankrupt(?:cy)?\b|\binsolven(?:t|cy)\b/i],["withdrawal_halt",/\bhalt(?:s|ed)? withdrawals?\b|\bfreeze(?:s|ing)? withdrawals?\b/i]
  ];
  function headline(event){return text(event?.language?.headline_original||event?.language?.display_headline||event?.headline_original||event?.headline||event?.display_headline);}
  function actorOf(h){for(const [name,re] of ACTORS)if(re.test(h))return {value:name,confidence:"EXPLICIT_TEXT"};return {value:null,confidence:"UNKNOWN"};}
  function actionOf(h){for(const [name,re] of ACTIONS)if(re.test(h))return {value:name,confidence:"EXPLICIT_TEXT"};return {value:null,confidence:"UNKNOWN"};}
  function amountOf(h){
    const m=h.match(/(?:([$€£])\s*)?([0-9]+(?:[.,][0-9]+)?)\s*(trillion|billion|million|bn|mn|[tbmk])\b/i);if(!m)return null;
    const value=Number(String(m[2]).replace(",","."));if(!Number.isFinite(value))return null;
    const unit=String(m[3]||"").toLowerCase();const mult=/trillion|\bt\b/.test(unit)?1e12:/billion|bn|\bb\b/.test(unit)?1e9:/million|mn|\bm\b/.test(unit)?1e6:/\bk\b/.test(unit)?1e3:1;
    const currency=m[1]==="$"?"USD":m[1]==="€"?"EUR":m[1]==="£"?"GBP":null;
    return {raw:m[0],value,value_base:value*mult,currency,confidence:currency?"EXPLICIT_TEXT":"AMOUNT_WITHOUT_CURRENCY"};
  }
  function enrich(event){
    if(!event||typeof event!=="object")return null;const h=headline(event),actor=actorOf(h),action=actionOf(h),amount=amountOf(h);
    return Object.freeze({...event,semantic_enrichment:{schema:SCHEMA,build:BUILD,actor:actor.value,actor_confidence:actor.confidence,action:action.value,action_confidence:action.confidence,amount,novelty:null,surprise:null,headline_tokens:[...tokens(h)],unknown_preserved:true,causal_claim:false,financial_signal:false}});
  }
  function timeMs(e){const t=Date.parse(e?.event_time||"");return Number.isFinite(t)?t:null;}
  function sameEvent(a,b){
    if(!a||!b||a.event_id===b.event_id)return false;if(a.event_family!==b.event_family)return false;
    const ta=timeMs(a),tb=timeMs(b);if(ta===null||tb===null||Math.abs(ta-tb)>36*60*60*1000)return false;
    const ah=headline(a),bh=headline(b),hs=jaccard(tokens(ah),tokens(bh)),as=assetScore(a.assets,b.assets);
    const ea=a.semantic_enrichment||{},eb=b.semantic_enrichment||{};
    const actorSame=ea.actor&&eb.actor&&ea.actor===eb.actor,actionSame=ea.action&&eb.action&&ea.action===eb.action;
    const amountA=ea.amount?.value_base,amountB=eb.amount?.value_base,amountSame=Number.isFinite(amountA)&&Number.isFinite(amountB)&&Math.abs(amountA-amountB)/Math.max(amountA,amountB)<=0.03;
    return (as>=0.5&&hs>=0.52)||(hs>=0.68&&(actorSame||actionSame))||(as>=0.5&&actionSame&&amountSame);
  }
  function canonical(members){return [...members].sort((a,b)=>Number(Boolean(b?.source?.primary))-Number(Boolean(a?.source?.primary))||Number(b?.evidence?.score||0)-Number(a?.evidence?.score||0)||(timeMs(a)||0)-(timeMs(b)||0))[0];}
  function clusters(){
    const enriched=(globalThis.AtlasEventIntelligence405000?.archive?.()||[]).map(enrich).filter(Boolean);const groups=[];
    for(const event of enriched){let group=groups.find(g=>g.some(x=>sameEvent(event,x)));if(!group){group=[];groups.push(group);}group.push(event);}
    return Object.freeze(groups.map((members,i)=>{const c=canonical(members);const sources=[];for(const e of members){const key=[e?.source?.name,e?.source?.url].filter(Boolean).join("|");if(key&&!sources.some(s=>s.key===key))sources.push({key,name:e?.source?.name||null,url:e?.source?.url||null,primary:Boolean(e?.source?.primary)});}return Object.freeze({schema:"atlas_event_cluster_v1",build:BUILD,cluster_id:`cluster-${c?.event_id||i}`,canonical_event_id:c?.event_id||null,canonical:c,member_event_ids:members.map(e=>e.event_id).filter(Boolean),member_count:members.length,sources:sources.map(({key,...s})=>s),dedup_rule:"family + time<=36h + conservative headline/assets/action/amount similarity",causal_claim:false});}));
  }
  function archive(){return Object.freeze((globalThis.AtlasEventIntelligence405000?.archive?.()||[]).map(enrich).filter(Boolean));}
  function current(){return enrich(globalThis.AtlasEventIntelligence405000?.current?.()||null);}
  globalThis.AtlasEventSemanticEnrichment405007=Object.freeze({build:BUILD,schema:SCHEMA,enrich,archive,current,clusters,same_event:sameEvent,read_only:true,new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,unknown_fields_stay_null:true,causal_claim:false,financial_signal:false,automatic_order:false});
})();
