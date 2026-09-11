/*
  Agent-Crypto Administrator — Aether runtime
  Responsibility: Aether status synthesis + read-only system/weather/BTC values.
  Presentation/animation belongs to admin-ribbons.css.
  Build: 40.5.13
  Revision: 40.5.1 Aether News content truth corrective lock. The ribbon shows the actual event content; metadata never replaces the news itself.
*/
(() => {
  "use strict";
  function aetherText4084(id,fallback="—"){const n=document.getElementById(id);const v=String(n?.textContent||"").replace(/\s+/g," ").trim();return v||fallback;}
  function aetherCurrent4084(){try{return typeof atlasCurrentStateRead==="function"?(atlasCurrentStateRead()||null):null;}catch(_){return null;}}
  const AETHER_VEILLE_TOP_4087=12;
  const AETHER_MARQUEE_SPEED_PX_S_40121=72;
  const AETHER_MARQUEE_MIN_OVERFLOW_PX_40121=48;
  const AETHER_MARQUEE_DELAY_S_40121=0.55;
  const aetherVeilleState4087={index:0,kind:"alert",fingerprint:"",viewportWidth:0,last:null,storyEvent:null,storyContext:null,feedWasVisible:false};
  function aetherVeilleOperatorEligible404286(event){
  const canonical=aetherNewsCanonicalEvent404288(event)||event||{};
  const assets=(Array.isArray(canonical?.assets)?canonical.assets:[]).map(v=>String(v||"").trim().toUpperCase()).filter(Boolean);
  const domains=(Array.isArray(canonical?.driver_domains)?canonical.driver_domains:[]).map(v=>String(v||"").trim().toLowerCase()).filter(Boolean);
  const topics=(Array.isArray(canonical?.matched_topics)?canonical.matched_topics:[]).map(v=>String(v||"").trim().toLowerCase()).filter(Boolean);
  const label=String(canonical?.event_label||"").toLowerCase();
  const headline=String(canonical?.display_headline||canonical?.headline_fr_display||canonical?.headline_fr||canonical?.headline||"").toLowerCase();
  const semanticText=[label,headline,...topics].join(" ");
  const cryptoSymbols=new Set([
    "BTC","ETH","BNB","XRP","SOL","USDT","USDC","DOGE","ADA","TRX","LINK","XLM","BCH","LTC",
    "AVAX","DOT","SUI","APT","ARB","OP","MATIC","UNI","AAVE","ONDO","MKR","PENDLE","NEAR","TAO",
    "RNDR","ICP","SHIB","PEPE","XMR","ZEC"
  ]);
  const assetAnchor=assets.some(symbol=>cryptoSymbols.has(symbol));
  const cryptoAnchor=assetAnchor||/(?:\bbitcoin\b|\bbtc\b|\bethereum\b|\bether\b|\beth\b|\bsolana\b|\bsol\b|\bxrp\b|\bbnb\b|\bcrypto(?:monnaie|currency)?s?\b|\bblockchain\b|\bdefi\b|\bstablecoin\b|\bweb3\b|\bwallet\b|\btoken\b|\baltcoin\b|\bmemecoin\b|\bon[- ]?chain\b|\bstaking\b|\bmining\b|\bminage\b|\bperpetuals?\b)/i.test(semanticText);
  const macroDomain=domains.includes("macro_liquidity");
  const macroAnchor=macroDomain&&/(?:federal reserve|\bfed\b|\bbce\b|\becb\b|treasury|banque centrale|central bank|taux|rates?|inflation|emploi|jobs|liquidit|jackson hole)/i.test(semanticText);
  // 40.4.286 — Aether owns a scarce operator lane, not the full News Sentinel archive.
  // A generic "marché global" sector, a crypto-media source, or a high impact score alone
  // never makes an unrelated world story eligible. The canonical archive remains untouched.
  return cryptoAnchor||macroAnchor;
}
function aetherNewsCanonicalEvent404288(event){
    if(!event)return event;
    const id=String(event?.event_id||event?.id||event?.fingerprint||"").trim();
    const headline=String(event?.headline_original||event?.headline||"").replace(/\s+/g," ").trim();
    const sourceUrl=String(event?.source_url||event?.url||"").trim();
    const mergedIds=new Set((Array.isArray(event?.merged_event_ids)?event.merged_event_ids:[]).map(v=>String(v||"").trim()).filter(Boolean));
    try{
      const pools=[];
      if(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.payload?.events))pools.push(newsFeedState.payload.events);
      if(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.events))pools.push(newsFeedState.events);
      for(const pool of pools){
        const match=pool.find(row=>{
          if(!String(row?.display_headline||row?.headline_fr_display||row?.headline_fr||row?.headline||"").trim())return false;
          const rowId=String(row?.event_id||row?.id||row?.fingerprint||"").trim();
          const rowMerged=Array.isArray(row?.merged_event_ids)?row.merged_event_ids.map(v=>String(v||"").trim()):[];
          const sameId=Boolean(id&&(rowId===id||rowMerged.includes(id)||mergedIds.has(rowId)));
          const sameUrl=Boolean(sourceUrl&&String(row?.source_url||row?.url||"").trim()===sourceUrl);
          const sameHeadline=Boolean(headline&&String(row?.headline_original||row?.headline||"").replace(/\s+/g," ").trim()===headline);
          return sameId||sameUrl||sameHeadline;
        });
        if(match)return match;
      }
    }catch(_){}
    return event;
  }
  function aetherNewsContractReady404288(event){
    return String(event?.translation_contract_build||"")==="40.4.291"
      && String(event?.translation_contract_schema||"")==="atlas_news_native_fr_v1"
      && Boolean(String(event?.display_headline||"").trim());
  }
  function aetherNewsOperatorReady404292(event){
    if(!aetherNewsContractReady404288(event))return false;
    const language=String(event?.display_language||"").trim().toLowerCase();
    const status=String(event?.translation_status||"").trim().toUpperCase();
    const display=String(event?.display_headline||"").replace(/\s+/g," ").trim();
    if(!display)return false;
    if(language==="fr"&&status==="ORIGINAL_FR"&&!/^\[EN\]\s/i.test(display))return true;
    if(language==="en"&&status==="FALLBACK_ORIGINAL"&&/^\[EN\]\s/i.test(display))return true;
    return false;
  }
  function aetherVeilleLanguageWeight404292(event){
    const language=String(event?.display_language||"").trim().toLowerCase();
    return language==="fr"?120:0; // French-first preference, never an exclusion of qualified English evidence.
  }
  function aetherNewsDisplayHeadline404288(event,fallback="Événement à qualifier"){
    const canonical=aetherNewsCanonicalEvent404288(event)||event||{};
    // 40.4.291 — Aether never translates. Native French is operator-visible; English remains explicit archive evidence.
    if(aetherNewsContractReady404288(canonical)){
      const value=String(canonical.display_headline||"").replace(/\s+/g," ").trim();
      const status=String(canonical?.translation_status||"");
      if(status==="FALLBACK_ORIGINAL"||status==="TRANSLATION_REJECTED")return value.startsWith("[EN] ")?value:`[EN] ${value}`;
      return value||fallback;
    }
    const original=String(canonical?.headline_original||canonical?.headline||"").replace(/\s+/g," ").trim();
    return original?`[EN] ${original}`:fallback;
  }
  function aetherNewsFamilyLabelFr404301(event){
    const family=aetherVeilleFamily40128(event);
    const labels={
      security:"Sécurité / hack",
      institutional:"ETF / flux institutionnels",
      regulation:"Régulation",
      leverage:"Levier / liquidations",
      macro:"Macro / liquidité",
      liquidity:"Liquidité / retraits",
      market:"Marché"
    };
    return labels[family]||"Actualité marché";
  }
  function aetherNewsOperatorSummaryFr404301(event,fallback="Actualité qualifiée"){
    const canonical=aetherNewsCanonicalEvent404288(event)||event||{};
    const language=String(canonical?.display_language||"").trim().toLowerCase();
    const status=String(canonical?.translation_status||"").trim().toUpperCase();
    const display=String(canonical?.display_headline||"").replace(/\s+/g," ").trim();
    // 40.5.1 — CONTENT TRUTH. Aether must show the event itself, never a sentence saying
    // that the event can be read somewhere else. Native French remains verbatim producer truth.
    if(language==="fr"&&status==="ORIGINAL_FR"&&display&&!/^\[EN\]\s/i.test(display))return display;
    // When no qualified French headline exists, preserve the exact English evidence in the ribbon.
    // The French metadata lane (family/scope/criticality/source language) already orients the reading.
    const original=String(canonical?.headline_original||canonical?.headline||display||"").replace(/\s+/g," ").trim();
    if(original){
      const clean=original.replace(/^\[EN\]\s*/i,"").trim();
      return clean?`[EN] ${clean}`:fallback;
    }
    const eventLabel=String(canonical?.event_label||"").replace(/\s+/g," ").trim();
    return eventLabel||aetherNewsFamilyLabelFr404301(canonical)||fallback;
  }
  function aetherNewsOperatorDisplay404301(event,fallback="Actualité qualifiée"){
    return aetherNewsOperatorSummaryFr404301(event,fallback);
  }

  function aetherFrenchMechanismLabel40110(value){
    const label=String(value||"").replace(/\s+/g," ").trim();
    if(/^SHORT SQUEEZE \/ LIQUIDATIONS$/i.test(label))return "LIQUIDATIONS DE POSITIONS VENDEUSES";
    if(/^LONG SQUEEZE \/ LIQUIDATIONS$/i.test(label))return "LIQUIDATIONS DE POSITIONS ACHETEUSES";
    return label;
  }
  const aetherVeilleNumber4087=value=>{const n=Number(value);return Number.isFinite(n)?n:0;};
  function aetherVeilleTimestamp4087(event){
    try{if(typeof newsFeedEventTimestamp==="function")return Number(newsFeedEventTimestamp(event)||0);}catch(_){}
    const parsed=Date.parse(event?.event_time||event?.published_at||event?.updated_at||event?.last_seen_at||"");
    return Number.isFinite(parsed)?parsed:0;
  }
  function aetherVeilleFreshnessWeight4087(event){
    const ts=aetherVeilleTimestamp4087(event);if(!ts)return 0;
    const hours=Math.max(0,(Date.now()-ts)/3600000);
    if(hours<2)return 90;if(hours<12)return 70;if(hours<48)return 50;if(hours<168)return 20;return 0;
  }
  function aetherVeilleDecisionWeight4087(event){
    const action=String(event?.decision?.action||"").toLowerCase(),tone=String(event?.decision?.tone||"").toLowerCase();
    let score=/alerte prioritaire/.test(action)?500:/surveillance renforc/.test(action)?360:/attendre.*source|vérifier|verifier/.test(action)?300:/archiver/.test(action)?60:140;
    if(tone==="danger")score+=120;else if(tone==="warn")score+=60;else if(tone==="ok")score+=20;
    return score;
  }
  function aetherVeilleContextWeight4087(event){
    const assets=(Array.isArray(event?.assets)?event.assets:[]).map(v=>String(v||"").toUpperCase());
    const sectors=(Array.isArray(event?.sectors)?event.sectors:[]).map(v=>String(v||"").toLowerCase());
    const active=`${aetherText4084("selectedAssetTitle","")} ${aetherText4084("atlasOracleAsset","")}`.toUpperCase();
    const top5=new Set(["BTC","ETH","BNB","XRP","SOL"]);
    let score=assets.some(symbol=>symbol&&active.includes(symbol))?80:0;
    if(assets.some(symbol=>top5.has(symbol)))score+=40;
    if(sectors.some(value=>value.includes("marché global")||value.includes("marche global")))score+=35;
    return score;
  }
  function aetherVeilleRank4087(event){
    return aetherVeilleDecisionWeight4087(event)
      +aetherVeilleNumber4087(event?.impact?.score)*10
      +aetherVeilleNumber4087(event?.evidence?.score)*2
      +Math.min(30,Math.max(0,aetherVeilleNumber4087(event?.source_count))*5)
      +aetherVeilleFreshnessWeight4087(event)
      +aetherVeilleContextWeight4087(event)
      +aetherVeilleLanguageWeight404292(event);
  }
  function aetherVeilleStoryTokens40127(event){
    const canonical=aetherNewsCanonicalEvent404288(event)||event||{};
    const tokens=[];
    const push=(prefix,value)=>{const v=String(value||"").replace(/\s+/g," ").trim().toLowerCase();if(v)tokens.push(`${prefix}:${v}`);};
    push("id",canonical?.event_id||canonical?.id||canonical?.fingerprint);
    for(const id of (Array.isArray(canonical?.merged_event_ids)?canonical.merged_event_ids:[]))push("id",id);
    push("url",canonical?.source_url);
    push("fr",aetherNewsDisplayHeadline404288(canonical,""));
    push("raw",canonical?.headline||canonical?.event_label);
    return [...new Set(tokens)];
  }
  function aetherVeilleFamily40128(event){
    const canonical=aetherNewsCanonicalEvent404288(event)||event||{};
    const type=String(canonical?.event_type||"").toLowerCase();
    const label=String(canonical?.event_label||"").toLowerCase();
    const headline=String(canonical?.headline_original||canonical?.headline||canonical?.display_headline||canonical?.headline_fr_display||canonical?.headline_fr||"").toLowerCase();
    const domains=(Array.isArray(canonical?.driver_domains)?canonical.driver_domains:[]).map(v=>String(v||"").toLowerCase());
    const topics=(Array.isArray(canonical?.matched_topics)?canonical.matched_topics:[]).map(v=>String(v||"").toLowerCase());
    const sectors=(Array.isArray(canonical?.sectors)?canonical.sectors:[]).map(v=>String(v||"").toLowerCase());
    const text=[type,label,headline,...domains,...topics,...sectors].join(" " );
    if(type==="security"||/hack|exploit|cybers[ée]curit|attaque|pirat/.test(`${label} ${headline}`))return "security";
    if(domains.includes("institutional_flows")||/\betf\b|institution|inflows?|outflows?|fonds cot/.test(text))return "institutional";
    if(domains.includes("regulation")||/r[ée]glement|\bsec\b|\bcftc\b|\bmica\b|custody rule|congress|white house/.test(text))return "regulation";
    if(domains.includes("leverage")||/liquidat|leverage|funding rate|futures?|open interest|short squeeze|long squeeze|positions? vendeuses?|positions? acheteuses?/.test(text))return "leverage";
    if(domains.includes("macro_liquidity")||/federal reserve|\bfed\b|\bbce\b|\becb\b|treasury|taux|rates?|inflation|emploi|jobs|liquidit|jackson hole/.test(text))return "macro";
    if(type)return type;
    return "market";
  }
  function aetherVeilleEvents4087(){
    const events=[];
    const addPool=pool=>{if(!Array.isArray(pool))return;for(const event of pool)if(event)events.push(event);};
    try{
      if(typeof newsFeedState!=="undefined"){
        const canonicalAll=(Array.isArray(newsFeedState?.payload?.events)?newsFeedState.payload.events:[])
          .filter(aetherNewsContractReady404288)
          .filter(aetherNewsOperatorReady404292);
        const canonical=canonicalAll.filter(aetherVeilleOperatorEligible404286);
        // 40.4.292 — bilingual operator lane: native French is preferred by rank,
        // qualified English evidence remains explicit [EN] and fills the lane instead of disappearing.
        // Aether never translates either language and never mutates the canonical News archive.
        if(canonical.length)addPool(canonical);
      }
    }catch(_){}
    const ranked=events.map((event,order)=>({event,order,rank:aetherVeilleRank4087(event),time:aetherVeilleTimestamp4087(event)})).sort((a,b)=>b.rank-a.rank||b.time-a.time||a.order-b.order);
    const canonicalRows=[];const seenTokens=new Set();
    for(const row of ranked){
      const tokens=aetherVeilleStoryTokens40127(row.event);
      if(tokens.length&&tokens.some(token=>seenTokens.has(token)))continue;
      tokens.forEach(token=>seenTokens.add(token));
      canonicalRows.push({...row,family:aetherVeilleFamily40128(row.event)});
    }
    if(!canonicalRows.length)return [];
    const sevenDays=Date.now()-7*24*60*60*1000;
    const recent=canonicalRows.filter(row=>!row.time||row.time>=sevenDays);
    const pool=recent.length>=AETHER_VEILLE_TOP_4087?recent:canonicalRows;
    const chosen=[];const usedEvents=new Set();const usedFamilies=new Set();const usedSources=new Set();
    const key=row=>String(row?.event?.event_id||row?.event?.id||row?.event?.fingerprint||row?.order);
    const source=row=>String(row?.event?.source_host||row?.event?.source_name||"").toLowerCase();
    const take=row=>{if(!row||usedEvents.has(key(row)))return false;chosen.push(row);usedEvents.add(key(row));if(row.family)usedFamilies.add(row.family);if(source(row))usedSources.add(source(row));return true;};
    const anchor24=pool.find(row=>row.time&&row.time>=Date.now()-24*60*60*1000)||pool[0];
    take(anchor24);
    const preferred=["macro","institutional","regulation","leverage","security","market"];
    for(const family of preferred){
      if(chosen.length>=AETHER_VEILLE_TOP_4087)break;
      if(usedFamilies.has(family))continue;
      const candidates=pool.filter(row=>row.family===family&&!usedEvents.has(key(row)));
      const diverse=candidates.find(row=>!source(row)||!usedSources.has(source(row)))||candidates[0];
      take(diverse);
    }
    for(const row of pool){
      if(chosen.length>=AETHER_VEILLE_TOP_4087)break;
      if(usedEvents.has(key(row)))continue;
      if(usedFamilies.has(row.family)&&source(row)&&usedSources.has(source(row)))continue;
      take(row);
    }
    for(const row of pool){if(chosen.length>=AETHER_VEILLE_TOP_4087)break;take(row);}
    return chosen.slice(0,AETHER_VEILLE_TOP_4087).map(row=>row.event);
  }
  function aetherVeilleScope4087(event){
    const assets=(Array.isArray(event?.assets)?event.assets:[]).map(v=>String(v||"").trim()).filter(Boolean);
    if(assets.length)return assets.slice(0,3).join("/");
    const sectors=(Array.isArray(event?.sectors)?event.sectors:[]).map(v=>String(v||"").trim()).filter(Boolean);
    return sectors[0]||"GLOBAL";
  }
  function aetherVeilleStatus4087(){
    let status="idle",payload=null,events=[];try{if(typeof newsFeedState!=="undefined"){status=String(newsFeedState.status||"idle");payload=newsFeedState.payload||null;events=Array.isArray(newsFeedState.events)?newsFeedState.events:[];}}catch(_){}
    let stats=null;try{if(typeof newsFeedUniqueStats==="function")stats=newsFeedUniqueStats()||null;}catch(_){}
    const cutoff24h=Date.now()-24*60*60*1000;
    const recent=events.filter(event=>{const ts=aetherVeilleTimestamp4087(event);return ts>0&&ts>=cutoff24h;});
    const derivedStats={
      events24:recent.length,
      priority24:recent.filter(event=>aetherVeilleNumber4087(event?.impact?.score)>=68).length,
      critical24:recent.filter(event=>aetherVeilleNumber4087(event?.impact?.score)>=85).length
    };
    const canonicalStats=stats&&[stats.events24,stats.priority24,stats.critical24].every(value=>Number.isFinite(Number(value)))?stats:derivedStats;
    const events24=Math.max(0,Math.round(aetherVeilleNumber4087(canonicalStats.events24)));
    stats={
      events24,
      priority24:Math.min(events24,Math.max(0,Math.round(aetherVeilleNumber4087(canonicalStats.priority24)))),
      critical24:Math.min(events24,Math.max(0,Math.round(aetherVeilleNumber4087(canonicalStats.critical24))))
    };
    const decision=String(payload?.summary?.decision||"").trim();
    if((status==="idle"||status==="loading")&&!events.length)return{label:"EN ATTENTE",text:"Veille non chargée · News Sentinel en attente",tone:"neutral",events:[],stats,status,decision};
    if(status==="error"&&!events.length)return{label:"INDISPONIBLE",text:"Archive News Sentinel indisponible · aucune actualité inventée",tone:"danger",events:[],stats,status,decision};
    if(!events.length)return{label:"0 PRIORITAIRE",text:status==="ok"?"Archive chargée · aucun événement prioritaire":"Archive partielle · aucun événement exploitable",tone:status==="partial"?"warn":"ok",events:[],stats,status,decision};
    const ranked=aetherVeilleEvents4087();
    if(!ranked.length)return{label:"VEILLE EN ATTENTE",text:"Archive chargée · aucun événement FR/EN qualifié pour la voie opérateur",tone:status==="partial"?"warn":"neutral",events:[],stats,status,decision};
    // 40.4.292 — ribbon counts describe the bilingual operator lane; native FR remains preferred, EN stays explicit.
    const operatorRecent=ranked.filter(event=>{const ts=aetherVeilleTimestamp4087(event);return ts>0&&ts>=cutoff24h;});
    const operatorStats={
      events24:operatorRecent.length,
      priority24:operatorRecent.filter(event=>aetherVeilleNumber4087(event?.impact?.score)>=68).length,
      critical24:operatorRecent.filter(event=>aetherVeilleNumber4087(event?.impact?.score)>=85).length
    };
    const globalTone=operatorStats.critical24>0?"danger":operatorStats.priority24>0||status==="partial"?"warn":"ok";
    const label=operatorStats.priority24>0?`${operatorStats.priority24} PRIORITAIRE${operatorStats.priority24>1?"S":""} 24H`:"VEILLE QUALIFIÉE";
    return{label,text:decision||"Surveillance",tone:globalTone,events:ranked,stats:operatorStats,archiveStats:stats,status,decision};
  }
  function aetherNewsMarketContext4089(currentEvent=null){
    try{
      const owner=globalThis.AtlasNewsToMarketOperatorIntelligence40235;
      if(!owner||typeof owner.compute!=="function")return null;
      const n=currentEvent?owner.compute(currentEvent):owner.compute();
      if(!n||n.status!=="observed")return null;
      const lead=currentEvent||n.current_event||n.lead_event||n.event||null;
      if(!lead)return null;
      const proof=n?.base?.amplifier?.evidence||n?.flow?.evidence||lead?.evidence||n?.event?.evidence||null;
      const proofScore=aetherVeilleNumber4087(proof?.score);
      const assets=(Array.isArray(lead?.assets)?lead.assets:Array.isArray(n?.event?.assets)?n.event.assets:[])
        .map(value=>String(value||"").trim().toUpperCase()).filter(Boolean).slice(0,3);
      const scope=assets.length?assets.join("/"):"MARCHÉ";
      const headline=aetherNewsOperatorDisplay404301(lead||n?.event,"Contexte News Sentinel");
      const source=String(lead?.source_name||lead?.source_host||n?.event?.source_name||n?.event?.source_host||"").replace(/^www\./,"").trim();
      const mechanismTitle=aetherFrenchMechanismLabel40110(n?.mechanism?.title||"");
      const mechanismDirection=String(n?.mechanism?.direction||"").trim();
      const explains=String(n?.mechanism?.explains||"").replace(/\s+/g," ").trim();
      const flowLabel=String(n?.flow?.label||"").trim();
      const flowDirection=String(n?.flow?.direction||"").trim();
      const breadth=String(n?.market_confirmation?.breadth||"").replace(/\s+/g," ").trim();
      const marketTone=String(n?.market_confirmation?.tone||"").replace(/\s+/g," ").trim();
      return {n,lead,proofScore,scope,headline,source,mechanismTitle,mechanismDirection,explains,flowLabel,flowDirection,breadth,marketTone,assets};
    }catch(_){return null;}
  }
  const AETHER_NON_INFORMATION_RE_40122=/(?:pas une pr[eé]vision|aucune recommandation|recommandation financi[eè]re|conseil d[’']achat|signal d[’']achat|causalit[eé]|non d[eé]montr[eé]|ne prouve|sans preuve causale|preuve causale|r[oô]le plausible|ne suffit pas|ne peut pas conclure|insuffisant[^·.]*conclure|aucune conclusion|aucune cause|narration causale|prudence|prudent|non qualifi[eé]|non identifi[eé]|ind[eé]termin[eé]|inconnu|indisponible|non comparable|information insuffisante)/i;
  function aetherInformationFact40122(value){
    const text=String(value||"").replace(/\s+/g," " ).trim();
    if(!text||AETHER_NON_INFORMATION_RE_40122.test(text))return "";
    return text;
  }
  function aetherInformationLine40122(value){
    return String(value||"").split("·").map(part=>aetherInformationFact40122(part)).filter(Boolean).join(" · " );
  }
  function aetherContextCurrent4089(model=null){
    const c=model;if(!c)return null;
    const proof=c.proofScore>0?`PREUVE ${Math.round(c.proofScore)}/100`:"PREUVE N/D";
    const qualified=value=>{
      return aetherInformationFact40122(value);
    };
    const marketRows=(()=>{
      try{
        const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];
        const top5=new Set(["BTC","ETH","BNB","XRP","SOL"]);
        return coins.filter(row=>top5.has(String(row?.symbol||"").toUpperCase()))
          .map(row=>({symbol:String(row?.symbol||"").toUpperCase(),change:aetherSystemNumber4086(row?.change24h)}))
          .filter(row=>row.change!==null);
      }catch(_){return[];}
    })();
    const focusRows=marketRows.filter(row=>(c.assets||[]).includes(row.symbol));
    const positives=marketRows.filter(row=>row.change>0).length;
    const negatives=marketRows.filter(row=>row.change<0).length;
    const marketSummary=marketRows.length?`Top 5 ${positives}/${marketRows.length} positifs${negatives?` · ${negatives} négatif${negatives>1?"s":""}`:""}`:"";
    const focusSummary=focusRows.slice(0,3).map(row=>`${row.symbol} ${row.change>=0?"+":""}${row.change.toFixed(2)} %`).join(" · ");
    const mechanism=qualified(c.mechanismTitle);
    const direction=qualified(c.mechanismDirection);
    const flow=qualified(c.flowLabel);
    const flowDirection=qualified(c.flowDirection);
    // 40.4.123 — context is a compact fact stack, not a prose explanation.
    // The previous generic “le mécanisme peut expliquer…” sentence is deliberately not repeated in the scarce ribbon lane.
    const facts=[];
    const pushFact=value=>{const fact=qualified(value);if(fact&&!facts.includes(fact))facts.push(fact);};
    // 40.4.125 — keep the translated News Sentinel fact visible through the paired CONTEXTE phase.
    // Context enriches the story; it no longer replaces the story with mechanism-only telemetry.
    pushFact(c.headline);
    pushFact(mechanism?`${mechanism}${direction?` · ${direction}`:""}`:"");
    pushFact(flow?`${flow}${flowDirection?` · ${flowDirection}`:""}`:"");
    pushFact(focusSummary);
    pushFact(marketSummary);
    if(!marketSummary)pushFact(c.breadth);
    pushFact(c.marketTone);
    pushFact(c.source);
    if(!facts.length){pushFact(c.headline);pushFact(c.source);}
    return {kind:"context",brand:"♥ CONTEXTE",tone:"context",index:0,total:1,event:c.lead,meta:`${c.scope} · ${proof}`,detail:facts.join(" · "),context:c.n};
  }
  function aetherNewsFamilyShortFr404303(event){
    const family=aetherVeilleFamily40128(event);
    const labels={security:"SÉCURITÉ",liquidity:"LIQUIDITÉ",institutional:"INSTITUTIONS",regulation:"RÉGULATION",leverage:"LEVIER",macro:"MACRO",market:"MARCHÉ"};
    return labels[family]||"MARCHÉ";
  }
  function aetherNewsSeverity404303(event){
    const score=aetherVeilleNumber4087(event?.impact?.score);
    return score>=85?"critical":score>=68?"high":score>=45?"medium":"low";
  }
  function aetherNewsLanguageTag404303(event){
    return String(event?.display_language||"").trim().toLowerCase()==="en"?"SOURCE EN":"FR";
  }

  function aetherVeilleCurrent4087(){
    const snapshot=aetherVeilleStatus4087(),events=snapshot.events||[];
    if(!events.length)return{...snapshot,kind:"alert",brand:"♥ VEILLE",index:0,total:0,event:null,meta:snapshot.label,detail:snapshot.text};
    aetherVeilleState4087.index=((aetherVeilleState4087.index%events.length)+events.length)%events.length;
    if(aetherVeilleState4087.kind==="context"){
      const story=aetherVeilleState4087.storyEvent||events[aetherVeilleState4087.index]||null;
      const context=aetherVeilleState4087.storyContext||aetherNewsMarketContext4089(story);
      if(context){const current=aetherContextCurrent4089(context);if(current)return current;}
      aetherVeilleState4087.kind="alert";
      aetherVeilleState4087.storyEvent=null;
      aetherVeilleState4087.storyContext=null;
    }
    const event=events[aetherVeilleState4087.index],impactLevel=String(event?.impact?.level||"Impact").toUpperCase(),impact=Math.round(aetherVeilleNumber4087(event?.impact?.score));
    const scope=aetherVeilleScope4087(event),evidence=Math.round(aetherVeilleNumber4087(event?.evidence?.score));
    const source=String(event?.source_name||event?.source_host||event?.source_class||"").replace(/^www\./,"").trim();
    const freshness=String(event?.freshness?.label||"").trim();
    const headline=aetherNewsOperatorDisplay404301(event,"Actualité à qualifier");
    const family=aetherVeilleFamily40128(event);
    const familyLabel=aetherNewsFamilyShortFr404303(event);
    const severity=aetherNewsSeverity404303(event);
    const language=aetherNewsLanguageTag404303(event);
    // 40.5.11 — scarce-lane truth: category + scope + impact score only.
    // Severity, source language and queue position remain machine-visible in fullMeta/datasets
    // while the actual event headline receives the horizontal reading space.
    const fullMeta=`${familyLabel} · ${scope} · ${impactLevel} ${impact}/100 · ${language} · ${aetherVeilleState4087.index+1}/${events.length}`;
    const meta=[familyLabel,scope,`${impact}/100`].filter(Boolean).join(" · ");
    const detail=[headline,source?`source ${source}`:null,freshness||null].filter(Boolean).join(" · ");
    return{...snapshot,kind:"alert",brand:"♥ VEILLE",index:aetherVeilleState4087.index,total:events.length,event,meta,fullMeta,detail,family,severity,language};
  }
  function aetherVeilleMarqueeSync40121(host,viewport,marquee,copy,fingerprint,fingerprintChanged){
    if(!host||!viewport||!marquee||!copy)return;
    const viewportWidth=Math.max(0,Math.round(viewport.clientWidth));
    const geometryChanged=Math.abs(viewportWidth-aetherVeilleState4087.viewportWidth)>1;
    if(!fingerprintChanged&&!geometryChanged)return;
    aetherVeilleState4087.viewportWidth=viewportWidth;
    // 40.4.121: speed is a velocity, not a fixed duration.
    // Fixed 8.6 s made short overflows crawl and long overflows race.
    host.dataset.scroll="0";
    host.style.removeProperty("--aether-veille-shift-4087");
    host.style.removeProperty("--aether-veille-duration-40121");
    host.style.removeProperty("--aether-veille-delay-40121");
    void marquee.offsetWidth;
    requestAnimationFrame(()=>{
      if(aetherVeilleState4087.fingerprint!==fingerprint||!copy.isConnected||!viewport.isConnected)return;
      const overflow=Math.max(0,Math.ceil(copy.scrollWidth-viewport.clientWidth+12));
      host.style.setProperty("--aether-veille-shift-4087",`${-overflow}px`);
      if(overflow>AETHER_MARQUEE_MIN_OVERFLOW_PX_40121){
        const duration=Math.max(0.01,overflow/AETHER_MARQUEE_SPEED_PX_S_40121);
        host.style.setProperty("--aether-veille-duration-40121",`${duration.toFixed(3)}s`);
        host.style.setProperty("--aether-veille-delay-40121",`${AETHER_MARQUEE_DELAY_S_40121}s`);
        host.dataset.scrollSpeed=String(AETHER_MARQUEE_SPEED_PX_S_40121);
        host.dataset.scroll="0";
        void marquee.offsetWidth;
        host.dataset.scroll="1";
      }else{
        host.dataset.scrollSpeed="0";
        host.dataset.scroll="0";
      }
    });
  }
  function renderAetherVeille4087(){
    const host=document.getElementById("atlasAetherVeille4087"),meta=document.getElementById("atlasAetherVeilleMeta4087"),viewport=document.getElementById("atlasAetherVeilleViewport4087");
    if(!host||!meta||!viewport)return null;
    const current=aetherVeilleCurrent4087(),copy=host.querySelector("[data-aether-veille-copy-4087]"),brand=host.querySelector(".atlas-aether-veille-brand-4087"),marquee=host.querySelector(".atlas-aether-veille-marquee-4087");
    if(meta.textContent!==current.meta)meta.textContent=current.meta;
    meta.title=current.fullMeta||current.meta||"";
    if(brand&&brand.textContent!==current.brand)brand.textContent=current.brand;
    host.dataset.tone=current.tone||"neutral";
    host.dataset.kind=current.kind||"alert";
    host.dataset.newsFamily=current.family||"market";
    host.dataset.newsSeverity=current.severity||"low";
    host.dataset.newsLanguage=current.language||"FR";
    host.dataset.contextFacet=current.kind==="context"?String(current.facet??0):"";
    host.setAttribute("aria-label",current.kind==="context"?"Aether Contexte · même événement News Sentinel · mécanisme, flux et réaction marché":"Aether Veille · synthèse prioritaire News Sentinel");
    const fingerprint=`${current.kind}|${current.eventKey||""}|${current.meta}|${current.detail}`;
    const fingerprintChanged=aetherVeilleState4087.fingerprint!==fingerprint;
    if(fingerprintChanged){
      // Stop the previous message before mutating its text; motion restarts only after re-measure.
      host.dataset.scroll="0";
      host.style.removeProperty("--aether-veille-shift-4087");
      host.style.removeProperty("--aether-veille-duration-40121");
      host.style.removeProperty("--aether-veille-delay-40121");
      if(copy&&copy.textContent!==current.detail)copy.textContent=current.detail;
      if(copy)copy.title=current.detail;
      aetherVeilleState4087.fingerprint=fingerprint;
    }
    aetherVeilleMarqueeSync40121(host,viewport,marquee,copy,fingerprint,fingerprintChanged);
    aetherVeilleState4087.last=current;
    return current;
  }
  function aetherVeilleAdvance4087(){
    const ranked=aetherVeilleEvents4087();
    if(!ranked.length){
      aetherVeilleState4087.index=0;aetherVeilleState4087.kind="alert";aetherVeilleState4087.storyEvent=null;aetherVeilleState4087.storyContext=null;aetherVeilleState4087.fingerprint="";
      return renderAetherVeille4087();
    }
    // 40.4.126+ / 40.4.130 — scarce FEED time belongs to News stories only.
    // 40.4.129 continuity is preserved: the cursor is not reset when a FEED window closes.
    aetherVeilleState4087.index=(aetherVeilleState4087.index+1)%ranked.length;
    aetherVeilleState4087.kind="alert";
    aetherVeilleState4087.storyEvent=null;
    aetherVeilleState4087.storyContext=null;
    aetherVeilleState4087.fingerprint="";
    return renderAetherVeille4087();
  }
  function aetherCompact4088(value, max=88){
    const text=String(value||"").replace(/\s+/g," ").trim();
    return text.length>max?`${text.slice(0,Math.max(8,max-1)).trimEnd()}…`:text;
  }
  function aetherMarketBrief4088(){
    try{
      const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];
      const top5=new Set(["BTC","ETH","BNB","XRP","SOL"]);
      const rows=coins.filter(row=>top5.has(String(row?.symbol||"").toUpperCase()));
      const btc=rows.find(row=>String(row?.symbol||"").toUpperCase()==="BTC")||coins.find(row=>row?.id==="bitcoin");
      const price=aetherSystemNumber4086(btc?.price),change=aetherSystemNumber4086(btc?.change24h);
      const leader=rows.filter(row=>aetherSystemNumber4086(row?.change24h)!==null).sort((x,y)=>Number(y.change24h)-Number(x.change24h))[0]||null;
      const parts=[];
      if(price!==null&&price>0){
        parts.push(`BTC ${new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(price)}`);
        if(change!==null)parts.push(`${change>=0?"+":""}${change.toFixed(2)} %`);
      }
      const leaderChange=aetherSystemNumber4086(leader?.change24h);
      if(leader&&leaderChange!==null)parts.push(`${String(leader.symbol||"").toUpperCase()} leader ${leaderChange>=0?"+":""}${leaderChange.toFixed(2)} %`);
      return parts.join(" · ")||"marché en attente";
    }catch(_){return"marché en attente";}
  }
  function aetherOracleBrief4088(){
    const identity=aetherText4084("atlasOracleOperatorIdentity","");
    const bias=aetherText4084("atlasOracleOperatorBias","").replace(/^BIAIS\s*/i,"").trim();
    const confidence=aetherText4084("atlasOracleOperatorConfidence","").replace(/^CONF\.\s*/i,"").trim();
    const legacyAsset=aetherText4084("atlasOracleAsset","");
    const legacyBias=aetherText4084("atlasOracleBias","").replace(/^Biais mesuré\s*:\s*/i,"").trim();
    const legacyConfidence=aetherText4084("atlasOracleConfidence","").replace(/^Confiance données\s*/i,"").trim();
    const readyIdentity=identity&&!/EN ATTENTE|LIVE CHECK|LIVECHECK/i.test(identity)?identity:legacyAsset&&!/EN ATTENTE/i.test(legacyAsset)?legacyAsset:"";
    const readyBias=bias&&!/[—-]$|ATTENTE|REQUIS/i.test(bias)?bias:legacyBias&&!/ATTENTE|REQUIS/i.test(legacyBias)?legacyBias:"";
    const readyConfidence=confidence&&!/[—-]$|ATTENTE/i.test(confidence)?confidence:legacyConfidence&&!/[—-]$/.test(legacyConfidence)?legacyConfidence:"";
    return [readyIdentity,readyBias,readyConfidence].filter(Boolean).join(" · ")||"en attente";
  }
  function aetherAtlasBrief4088(){
    const current=aetherCurrent4084();
    const status=String(current?.status||"").trim().toUpperCase();
    const operator=aetherText4084("atlasOracleAtlas","").replace(/^Atlas\s*:\s*/i,"").trim();
    if(operator&&!/en attente/i.test(operator)){
      const first=operator.split("·").map(v=>v.trim()).filter(Boolean)[0]||"";
      const score=(operator.match(/(?:score\s+direction|direction)\s*([+−-]?\s*\d+\s*\/\s*100)/i)||[])[1]||"";
      const scoreClean=score.replace(/\s+/g,"").replace("−","-");
      let signal=first.replace(/^momentum\s*/i,"").trim();
      if(/partag/i.test(first))signal="PARTAGÉ";
      else if(/hauss|bull/i.test(first))signal="HAUSSIER";
      else if(/baiss|bear/i.test(first))signal="BAISSIER";
      else signal=aetherCompact4088(signal||first,20).toUpperCase();
      return [status&&status!=="IDLE"?status:null,signal||null,scoreClean||null].filter(Boolean).join(" · ");
    }
    const reports=Number.isFinite(Number(current?.atlas_reports))?Math.max(0,Number(current.atlas_reports)):Array.isArray(current?.reports)?current.reports.length:0;
    return `${status||"VEILLE"}${reports?` · ${reports}/4`:""}`;
  }
  function aetherSourcesBrief4088(){
    const live=aetherText4084("liveStatus","");
    const raw=live&&!/requis|attente/i.test(live)?live:aetherText4084("sourceName","Aucune source");
    const ratio=(raw.match(/\b\d+\s*\/\s*\d+\b/)||[])[0]?.replace(/\s+/g,"")||"";
    if(/binance/i.test(raw))return `Binance${ratio?` · ${ratio}`:""}`;
    return aetherCompact4088(raw.replace(/^Prix live\s*/i,""),34);
  }
  function aetherBreadthBrief40121(){
    try{
      const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];
      const top5=new Set(["BTC","ETH","BNB","XRP","SOL"]);
      const rows=coins.filter(row=>top5.has(String(row?.symbol||"").toUpperCase()))
        .map(row=>({symbol:String(row?.symbol||"").toUpperCase(),change:aetherSystemNumber4086(row?.change24h)}))
        .filter(row=>row.symbol&&row.change!==null);
      if(!rows.length)return "en attente";
      const pos=rows.filter(row=>row.change>0).length,neg=rows.filter(row=>row.change<0).length,flat=rows.length-pos-neg;
      const ordered=rows.slice().sort((a,b)=>b.change-a.change),leader=ordered[0],laggard=ordered.at(-1);
      const breadth=`${pos}/${rows.length} positifs${neg?` · ${neg} négatif${neg>1?"s":""}`:""}${flat?` · ${flat} neutre${flat>1?"s":""}`:""}`;
      const edges=[];
      if(leader)edges.push(`${leader.symbol} ${leader.change>=0?"+":""}${leader.change.toFixed(2)} %`);
      if(laggard&&laggard.symbol!==leader?.symbol)edges.push(`${laggard.symbol} ${laggard.change>=0?"+":""}${laggard.change.toFixed(2)} %`);
      return [breadth,...edges].filter(Boolean).join(" · ");
    }catch(_){return "en attente";}
  }
  function aetherAnalysisBrief40121(){
    // 40.4.123 — the prime INFO lane always exposes breadth + both edges.
    // This is denser and more stable than mirroring an arbitrary moves sentence.
    const breadth=aetherBreadthBrief40121();
    return `Top 5 · ${aetherCompact4088(breadth,86)}`;
  }
  function aetherOraclePriorityBrief40123(){
    const identity=aetherText4084("atlasOracleOperatorIdentity","");
    const legacyAsset=aetherText4084("atlasOracleAsset","");
    const parts=identity.split("·").map(v=>v.trim()).filter(Boolean);
    const asset=(parts[0]&&!/ATTENTE|LIVE CHECK|LIVECHECK/i.test(parts[0]))?parts[0]:(legacyAsset&&!/ATTENTE/i.test(legacyAsset)?legacyAsset:"");
    const mode=parts.slice(1).join(" · ");
    const bias=aetherText4084("atlasOracleOperatorBias","").replace(/^BIAIS\s*/i,"").trim()
      ||aetherText4084("atlasOracleBias","").replace(/^Biais mesuré\s*:\s*/i,"").trim();
    const confidence=aetherText4084("atlasOracleOperatorConfidence","").replace(/^CONF\.\s*/i,"").trim()
      ||aetherText4084("atlasOracleConfidence","").replace(/^Confiance données\s*/i,"").trim();
    const clean=value=>String(value||"").trim();
    const ready=[asset,(!/ATTENTE|REQUIS|^[—-]$/i.test(clean(bias))?clean(bias):""),(!/ATTENTE|^[—-]$/i.test(clean(confidence))?clean(confidence):""),mode].filter(Boolean);
    return ready.join(" · ");
  }
  function aetherSignalBrief40121(){
    const oracle=aetherInformationLine40122(aetherOraclePriorityBrief40123());
    if(oracle&&!/en attente/i.test(oracle))return `Oracle · ${aetherCompact4088(oracle,78)}`;
    const risk=aetherInformationLine40122(aetherText4084("atlasOperatorRisk35",""));
    const riskDetail=aetherInformationLine40122(aetherText4084("atlasOperatorRiskDetail35",""));
    // A positive anomaly is information; “pas d’anomalie / aucune donnée” is filler.
    if(risk&&!/attente|aucune|pas d|non /i.test(risk))return `Signal · ${aetherCompact4088([risk,riskDetail].filter(Boolean).join(" · "),78)}`;
    return `Top 5 · ${aetherCompact4088(aetherBreadthBrief40121(),78)}`;
  }
  function aetherVeilleBrief40121(){
    try{
      const snapshot=aetherVeilleStatus4087(),events=snapshot.events||[];
      if(!events.length)return `Veille · ${snapshot.label||"aucun événement prioritaire"}`;
      const event=events[0],scope=aetherVeilleScope4087(event),impact=Math.round(aetherVeilleNumber4087(event?.impact?.score));
      const headline=aetherNewsOperatorDisplay404301(event,"");
      // 40.4.288 — information first: producer-owned canonical display headline leads; scope/impact follow.
      return `Veille · ${aetherCompact4088(headline,88)}${scope?` · ${scope}`:""}${impact?` ${impact}/100`:""}`;
    }catch(_){return "Veille · News Sentinel";}
  }
  const aetherNewsWake4088={attempted:false,inflight:null};
  function aetherWakeNewsSentinel4088(){
    if(aetherNewsWake4088.inflight)return aetherNewsWake4088.inflight;
    try{
      const events=(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.events))?newsFeedState.events:[];
      const status=typeof newsFeedState!=="undefined"?String(newsFeedState?.status||"idle"):"unavailable";
      const runtimeFresh=typeof newsFeedState!=="undefined"
        && newsFeedState?.startupSucceeded===true
        && status==="ok";
      const canonicalDisplayReady=events.length>0
        && events.every(aetherNewsContractReady404288);
      if(status==="loading"||aetherNewsWake4088.attempted||typeof loadNewsLiveFeed!=="function")return Promise.resolve(false);
      // 40.4.112: cached events are a continuity fallback, never proof that the current archive was fetched.
      // Wake the existing News owner once on page start, even when a previous localStorage cache populated the ribbon.
      if(runtimeFresh&&canonicalDisplayReady)return Promise.resolve(false);
      aetherNewsWake4088.attempted=true;
      aetherNewsWake4088.inflight=Promise.resolve(loadNewsLiveFeed({force:true,automatic:false}))
        .catch(()=>false)
        .finally(()=>{
          aetherNewsWake4088.inflight=null;
          try{aetherVeilleState4087.fingerprint="";renderAether4084();renderAetherVeille4087();}catch(_){}
        });
      return aetherNewsWake4088.inflight;
    }catch(_){return Promise.resolve(false);}
  }

  function aetherSnapshot4084(){
    const current=aetherCurrent4084();
    const reports=Number.isFinite(Number(current?.atlas_reports))?Math.max(0,Number(current.atlas_reports)):Array.isArray(current?.reports)?current.reports.length:0;
    const currentStatus=String(current?.status||"").trim().toUpperCase();
    const atlas=aetherAtlasBrief4088();
    const oracle=aetherOracleBrief4088();
    const sources=aetherSourcesBrief4088();
    const market=aetherMarketBrief4088();
    const analysis=aetherAnalysisBrief40121();
    const signal=aetherSignalBrief40121();
    const veilleBrief=aetherVeilleBrief40121();
    let book="APRÈS AUTH";
    try{
      if(typeof atlasBookMirrorBridgeState40377!=="undefined"){
        book=atlasBookMirrorBridgeState40377.credentialReady===true?"PRÊT":atlasBookMirrorBridgeState40377.credentialReady===false?"CREDENTIAL REQUIS":"EN VEILLE";
      }
    }catch(_){}
    const veille=aetherVeilleCurrent4087();
    const news=veille.detail||veille.text||"Veille non chargée";
    const graphTop5=document.getElementById("btnChartTop5")?.classList?.contains("active")===true;
    const graphTitle=aetherText4084("selectedAssetTitle","Aucune sélection");
    const graph=graphTop5?"TOP 5":graphTitle;
    return {current,reports,currentStatus,atlas,oracle,sources,book,market,analysis,signal,veilleBrief,news,graph};
  }
  function aetherMarketBreadth40133(){
  try{const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];const rows=coins.map(r=>aetherSystemNumber4086(r?.change24h)).filter(v=>v!==null);if(!rows.length)return "Marché non chargé";const up=rows.filter(v=>v>.05).length,down=rows.filter(v=>v<-.05).length,flat=rows.length-up-down;const bias=down>up*1.35?"largeur négative":up>down*1.35?"largeur positive":"largeur mixte";return `${up} hausses · ${down} baisses · ${flat} stables · ${bias}`;}catch(_){return "Marché non chargé";}
}
function aetherAtlasAuto40133(){
  try{
    const current=aetherCurrent4084()||null;
    let pending=null;
    try{if(typeof atlasCurrentPendingMarket137==="function")pending=atlasCurrentPendingMarket137()||null;}catch(_){}
    const status=String(current?.status||"").trim().toUpperCase();
    const reports=Number.isFinite(Number(current?.atlas_reports))?Number(current.atlas_reports):Array.isArray(current?.reports)?current.reports.length:0;
    if(pending){const id=String(pending?.market_id||pending?.snapshot_id||pending?.id||"").trim();return `PENDING · nouveau snapshot${id?` · ${id}`:""}`;}
    if(status==="CURRENT")return `REPOS · dernier CURRENT ${reports?`${reports}/4`:'couverture N/D'}`;
    if(status)return `${status} · état Atlas canonique`;
    return "État Atlas inconnu";
  }catch(_){return "État Atlas indisponible";}
}
function aetherSystemBrief40133(){
  const sys=aetherSystemState4086.system||{},cpu=aetherSystemPercent4086(sys?.cpu?.usage_pct),ct=aetherSystemTemperature4086(sys?.cpu?.temperature_c),gs=String(sys?.gpu?.status||"").trim().toLowerCase(),gpu=gs&&gs!=="ok"?null:aetherSystemPercent4086(sys?.gpu?.usage_pct),gt=gs&&gs!=="ok"?null:aetherSystemTemperature4086(sys?.gpu?.temperature_c),ram=aetherSystemPercent4086(sys?.memory?.usage_pct);const part=(l,v,t=null)=>`${l} ${v===null?"N/D":`${Math.round(v)}%${t===null?"":` ${Math.round(t)}°`}`}`;return `${part("CPU",cpu,ct)} · ${part("GPU",gpu,gt)} · ${part("RAM",ram)}`;
}
function aetherWeatherOutlook40133(){return String(aetherSystemState4086.weather?.daily_summary||"Prévisions 5 jours en attente").trim();}
function aetherWeatherRisk40133(){return String(aetherSystemState4086.weather?.electrical_risk||"Risque orage/rafales en attente").trim();}
function aetherAttention40133(){
  const w=aetherSystemState4086.weather||{};if(w.risk_level==="danger"||w.risk_level==="warn")return `Météo · ${aetherWeatherRisk40133()}`;const sys=aetherSystemState4086.system||{},cpu=aetherSystemPercent4086(sys?.cpu?.usage_pct),gpu=aetherSystemPercent4086(sys?.gpu?.usage_pct),ram=aetherSystemPercent4086(sys?.memory?.usage_pct),ct=aetherSystemTemperature4086(sys?.cpu?.temperature_c),gt=aetherSystemTemperature4086(sys?.gpu?.temperature_c);if((cpu!==null&&cpu>=88)||(gpu!==null&&gpu>=92)||(ram!==null&&ram>=90)||(ct!==null&&ct>=90)||(gt!==null&&gt>=84))return `Système · ${aetherSystemBrief40133()}`;const a=aetherAtlasAuto40133();if(/NON ARMÉ|indisponible/i.test(a))return `Atlas AUTO · ${a}`;return `Marché · ${aetherMarketBreadth40133()}`;
}
function aetherOperatorWhy405012(){
  try{
    const feed=aetherVeilleCurrent4087();
    if(!feed?.event)return "Aucune actualité prioritaire qualifiée pour l’instant.";
    const parts=[];
    if(feed.meta)parts.push(feed.meta);
    if(feed.detail)parts.push(feed.detail);
    const breadth=aetherMarketBreadth40133();
    if(breadth&&!/non charg|en attente/i.test(breadth))parts.push(`Marché · ${breadth}`);
    const oracle=aetherOracleBrief4088();
    if(oracle&&!/en attente/i.test(oracle))parts.push(`Oracle · ${oracle}`);
    parts.push("Décision humaine · aucune exécution automatique");
    return parts.join(" · ");
  }catch(_){return "Contexte opérateur indisponible · aucune action automatique.";}
}
function aetherNewsMarketSemantic405013(){
  try{
    const feed=aetherVeilleCurrent4087();
    const event=feed?.event||null;
    if(!event)return "News Sentinel · aucun événement prioritaire qualifié.";
    const owner=globalThis.AtlasNewsToMarketOperatorIntelligence40235;
    const narrative=owner&&typeof owner.compute==="function"?owner.compute(event):null;
    if(!narrative||narrative.status!=="observed")return "Événement qualifié · réaction marché à observer · causalité non établie.";
    const parts=[];
    const mechanism=String(narrative?.mechanism?.title||"").trim();
    const direction=String(narrative?.mechanism?.direction||"").trim();
    if(mechanism&&!/NON QUALIFIÉ/i.test(mechanism))parts.push(`${mechanism}${direction?` · ${direction}`:""}`);
    const flow=String(narrative?.flow?.label||"").trim();
    const flowDirection=String(narrative?.flow?.direction||"").trim();
    if(flow)parts.push(`${flow}${flowDirection?` · ${flowDirection}`:""}`);
    const breadth=String(narrative?.market_confirmation?.breadth||"").trim();
    const focus=String(narrative?.market_confirmation?.focus||"").trim();
    if(breadth)parts.push(breadth);
    if(focus&&!/non comparable/i.test(focus))parts.push(focus);
    const proof=Number(event?.evidence?.score);
    if(Number.isFinite(proof))parts.push(`Preuve ${Math.round(proof)}/100`);
    const causality=String(narrative?.verdict?.causality||"NON ÉTABLIE").trim().toUpperCase();
    parts.push(`Causalité ${causality}`);
    return parts.join(" · ");
  }catch(_){return "Lecture News → Marché indisponible · causalité non établie.";}
}
  function aetherDirectionalWord406026(value){
    const text=String(value||"").toLowerCase();
    if(/hauss|bull|positif|positive|risk-on|risk on|inflow|entrants?/.test(text))return 1;
    if(/baiss|bear|n[ée]gatif|negative|risk-off|risk off|outflow|sortants?/.test(text))return -1;
    if(/mixte|partag|neutre|stable|lat[ée]ral|non [ée]tablie/.test(text))return 0;
    return null;
  }
  function aetherOracleDirection406026(){
    try{
      const host=document.getElementById("atlasOracleV0");
      const text=String(host?.textContent||"").replace(/\s+/g," ");
      const up=Number((text.match(/HAUSSE\s*(\d+)\s*\/\s*100/i)||[])[1]);
      const down=Number((text.match(/BAISSE\s*(\d+)\s*\/\s*100/i)||[])[1]);
      if(Number.isFinite(up)&&Number.isFinite(down)){
        if(up>=down+2)return 1;
        if(down>=up+2)return -1;
        return 0;
      }
      return aetherDirectionalWord406026(aetherText4084("atlasOracleOperatorBias","")||aetherText4084("atlasOracleBias",""));
    }catch(_){return null;}
  }
  function aetherMarketDirection406026(){
    try{
      const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];
      const values=coins.map(row=>aetherSystemNumber4086(row?.change24h)).filter(v=>v!==null);
      if(!values.length)return null;
      const up=values.filter(v=>v>.05).length,down=values.filter(v=>v<-.05).length;
      if(up>=down*1.25&&up-down>=3)return 1;
      if(down>=up*1.25&&down-up>=3)return -1;
      return 0;
    }catch(_){return null;}
  }
  function aetherNewsDirection406026(){
    try{
      const feed=aetherVeilleCurrent4087();
      const event=feed?.event||null;
      if(!event)return null;
      const owner=globalThis.AtlasNewsToMarketOperatorIntelligence40235;
      const narrative=owner&&typeof owner.compute==="function"?owner.compute(event):null;
      const fields=[narrative?.mechanism?.direction,narrative?.flow?.direction,narrative?.market_confirmation?.focus,narrative?.verdict?.direction,feed?.tone];
      const votes=fields.map(aetherDirectionalWord406026).filter(v=>v!==null&&v!==0);
      if(votes.length){const sum=votes.reduce((a,b)=>a+b,0);return sum>0?1:sum<0?-1:0;}
      return aetherDirectionalWord406026([event?.event_label,event?.decision?.tone,event?.sentiment].filter(Boolean).join(" "));
    }catch(_){return null;}
  }
  function aetherAtlasDirection406026(){
    try{return aetherDirectionalWord406026(`${aetherAtlasBrief4088()} ${aetherText4084("atlasOracleAtlas","")}`);}catch(_){return null;}
  }
  function aetherDirectionMatrix406058(){
    const layers=[
      {name:"News",value:aetherNewsDirection406026()},
      {name:"Marché",value:aetherMarketDirection406026()},
      {name:"Atlas",value:aetherAtlasDirection406026()},
      {name:"Oracle",value:aetherOracleDirection406026()},
    ];
    const present=layers.filter(row=>row.value!==null);
    const positive=present.filter(row=>row.value===1),negative=present.filter(row=>row.value===-1),neutral=present.filter(row=>row.value===0);
    const directional=[...positive,...negative];
    const dominant=positive.length>negative.length?1:negative.length>positive.length?-1:0;
    const leaders=dominant===1?positive:dominant===-1?negative:[];
    const opposed=dominant===1?negative:dominant===-1?positive:directional;
    const opposition=positive.length>0&&negative.length>0;
    const coverage=present.length;
    const alignmentPct=directional.length&&dominant!==0?Math.round(leaders.length/directional.length*100):null;
    return {layers,present,positive,negative,neutral,directional,dominant,leaders,opposed,opposition,coverage,total:layers.length,alignmentPct};
  }
  function aetherOperatorWatch406026(){
    const m=aetherDirectionMatrix406058();
    const sourcesModel=aetherSourcesModel406042(aetherSnapshot4084());
    const systemModel=aetherSystemModel406042();
    const sourceReady=sourcesModel.status==="PRÊTES";
    const systemReady=!['INDISPONIBLE','CRITIQUE'].includes(systemModel.status);
    const feed=aetherVeilleCurrent4087();
    const impact=Number(feed?.event?.impact?.score),evidence=Number(feed?.event?.evidence?.score);
    const attentionBase=aetherAttention40133();
    let level="MODÉRÉ",cause="Marché",proof=aetherMarketBreadth40133();
    if(/Système/i.test(attentionBase)&&/danger|critique|indisponible/i.test(attentionBase)){level="CRITIQUE";cause="Système";proof=aetherSystemBrief40133();}
    else if(Number.isFinite(impact)&&impact>=95&&Number.isFinite(evidence)&&evidence>=85){level="CRITIQUE";cause="News";proof=`impact ${Math.round(impact)}/100 · preuve ${Math.round(evidence)}/100`;}
    else if(Number.isFinite(impact)&&impact>=85){level="ÉLEVÉ";cause="News";proof=`impact ${Math.round(impact)}/100${Number.isFinite(evidence)?` · preuve ${Math.round(evidence)}/100`:''}`;}
    else if(m.alignmentPct!==null&&m.alignmentPct>=75&&m.directional.length>=2){level="ÉLEVÉ";cause="Convergence";proof=`${m.leaders.map(x=>x.name).join(' · ')} · ${m.alignmentPct}% des couches directionnelles`;}
    else if(!m.coverage||(!sourceReady&&!systemReady)){level="FAIBLE";cause="Couverture";proof=`${m.coverage}/${m.total} couches · ${sourcesModel.status.toLowerCase()}`;}
    const dirLabel=m.opposition?"OPPOSÉE":m.directional.length>=2&&m.dominant>0?"HAUSSIÈRE":m.directional.length>=2&&m.dominant<0?"BAISSIÈRE":m.directional.length===1?"DIRECTION SEULE":m.coverage>=2?"NEUTRE":"INSUFFISANTE";
    const convergence=m.coverage?`couverture ${m.coverage}/${m.total} · ${m.directional.length} directionnelle${m.directional.length>1?'s':''} · ${dirLabel}`:"Données directionnelles insuffisantes";
    let divergence="Aucune opposition directionnelle démontrée";
    if(m.opposition)divergence=`Opposition ${m.positive.map(x=>x.name).join(' + ')} / ${m.negative.map(x=>x.name).join(' + ')}`;
    else if(m.neutral.length)divergence=`Neutralité : ${m.neutral.map(x=>x.name).join(' + ')}`;
    const watch=[];
    if(m.opposition)watch.push("Résoudre l’opposition entre couches");
    if(m.neutral.length)watch.push(`${m.neutral.map(x=>x.name).join(' / ')} : attendre une direction`);
    if(!sourceReady)watch.push("Sources : retour à un état complet et frais");
    if(Number.isFinite(impact)&&impact>=80)watch.push("News : nouvelle preuve ou changement de ton");
    if(!watch.length)watch.push("Prochaine variation directionnelle significative");
    const note=m.coverage<2?"Comparaison insuffisante : ne pas interpréter un pourcentage d’accord.":m.opposition?"Divergence réelle : aucune synthèse directionnelle unique.":m.directional.length<2?"Couverture présente mais comparaison directionnelle insuffisante.":"Lecture descriptive : aucune probabilité de gain n’est déduite de cette convergence.";
    return {level:`${level} · ${sourceReady?"sources prêtes":"sources partielles"} · ${systemReady?"système lisible":"système partiel"}`,convergence,divergence,watch:watch.slice(0,4).join(" · "),note,why:`${cause} · ${proof}`,cause,proof,evaluated_at:Date.now(),matrix:m};
  }
  const aetherTimelineState406027={entries:[],last:null,max:8};
  function aetherTimelineClip406027(value,max=150){
    const text=String(value??"").replace(/\s+/g," ").trim();
    return text.length>max?`${text.slice(0,max-1)}…`:text;
  }
  function aetherTimelineNewsKey406027(){
    try{
      const status=aetherVeilleStatus4087();
      const ids=(Array.isArray(status?.events)?status.events:[]).map(event=>String(event?.event_id||event?.id||event?.fingerprint||event?.source_url||event?.display_headline||event?.headline||"").trim()).filter(Boolean).sort();
      return ids.join("|");
    }catch(_){return "";}
  }
  function aetherTimelineSnapshot406027(watch){
    return {
      news:aetherTimelineNewsKey406027(),
      market:aetherMarketDirection406026(),
      atlas:aetherAtlasDirection406026(),
      oracle:aetherOracleDirection406026(),
      level:String(watch?.level||"").split("·")[0].trim()||"N/D"
    };
  }
  function aetherTimelinePush406027(type,level,detail,meta={}){
    const full=String(detail||"État actualisé").replace(/\s+/g," ").trim();
    const entry=Object.freeze({at:Date.now(),detected_at:Date.now(),type:String(type||"AETHER"),level:String(level||"N/D"),detail:full,preview:aetherTimelineClip406027(full,150),source_id:meta?.source_id||null,published_at:meta?.published_at||null,source_url:meta?.source_url||null});
    aetherTimelineState406027.entries.unshift(entry);
    if(aetherTimelineState406027.entries.length>aetherTimelineState406027.max)aetherTimelineState406027.entries.length=aetherTimelineState406027.max;
  }
  function aetherTimelineCapture406027(watch){
    try{
      const current=aetherTimelineSnapshot406027(watch),previous=aetherTimelineState406027.last;
      if(!previous){
        aetherTimelinePush406027("AETHER",current.level,watch?.convergence||"Surveillance initialisée");
        aetherTimelineState406027.last=current;return;
      }
      const changes=[];
      if(current.news!==previous.news){
        const status=aetherVeilleStatus4087();
        changes.push(["NEWS",`${Array.isArray(status?.events)?status.events.length:0} événement(s) qualifié(s) · archive ${String(status?.status||'N/D').toUpperCase()}`]);
      }
      if(current.oracle!==previous.oracle)changes.push(["ORACLE",aetherOracleBrief4088()]);
      if(current.market!==previous.market)changes.push(["MARCHÉ",aetherMarketBreadth40133()]);
      if(current.atlas!==previous.atlas)changes.push(["ATLAS",aetherAtlasBrief4088()]);
      if(current.level!==previous.level)changes.push(["AETHER",watch?.convergence||watch?.divergence||"Niveau d’attention modifié"]);
      for(const [type,detail] of changes)aetherTimelinePush406027(type,current.level,detail);
      aetherTimelineState406027.last=current;
    }catch(_){}
  }
  const AETHER_TIMELINE_PREVIEW_406028=3;
  function aetherTimelineRow406028(entry){
    const row=document.createElement("div");row.className="aether-timeline-row-406027";
    const time=document.createElement("span");time.className="aether-timeline-time-406027";time.textContent=new Date(entry.at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const type=document.createElement("b");type.className="aether-timeline-type-406027";type.textContent=entry.type;
    const level=document.createElement("span");level.className="aether-timeline-level-406027";level.textContent=entry.level;
    const detail=document.createElement("span");detail.className="aether-timeline-detail-406027";detail.textContent=entry.detail;
    row.append(time,type,level,detail);return row;
  }
  function aetherTimelineFill406028(host,entries){
    if(!host)return;
    host.replaceChildren();
    if(!entries.length){
      const empty=document.createElement("span");empty.className="aether-timeline-empty-406027";empty.textContent="Aucun changement significatif enregistré dans cette session.";host.appendChild(empty);return;
    }
    entries.forEach(entry=>host.appendChild(aetherTimelineRow406028(entry)));
  }
  /* 40.6.37 — GRAPH-FIRST LAZY HYDRATION · INTERACTION-ON-DEMAND LOCK */
  function aetherTimelineRender406027(panel,{includeFull=false}={}){
    const preview=panel?.querySelector('[data-aether-timeline-preview-406028]');
    const full=panel?.querySelector('[data-aether-timeline-406027]');
    if(!preview&&!full)return;
    const entries=aetherTimelineState406027.entries;
    aetherTimelineFill406028(preview,entries.slice(0,AETHER_TIMELINE_PREVIEW_406028));
    if(includeFull)aetherTimelineFill406028(full,entries);
    const count=panel?.querySelector('[data-aether-history-count-406030]');
    if(count)count.textContent=`${entries.length}/${aetherTimelineState406027.max}`;
  }
  function aetherWeatherFirstGlance406030(){
    try{
      const days=Array.isArray(aetherSystemState4086.weather?.daily)?aetherSystemState4086.weather.daily:[];
      if(!days.length)return 'Prévision 5 j indisponible';
      const compact=(value,today=false)=>{
        let text=String(value||'').replace(/\s+/g,' ').trim();
        if(today)text=text.replace(/^[^\s]+\s+\d{2}\s+/,'AUJ. ');
        else text=text.replace(/\s+·\s+raf\.\s+\d+\s+km\/h.*$/i,'').replace(/\s+·\s+pluie\s+(\d+)%/i,' · $1%');
        return text;
      };
      const first=compact(days[0]?.text,true);
      const next=days.slice(1,4).map(day=>compact(day?.text,false)).join('  ·  ');
      return next?`${first}\n${next}`:first;
    }catch(_){return 'Prévision 5 j indisponible';}
  }
  /* 40.6.39 — AETHER WORKBENCH FOCUS · READABILITY · Z-ORDER LOCK */
  const AETHER_WORKBENCH_SRC_406039='./js/aether-workbench-406039.js?v=administrator-build-40.6.39';
  let aetherWorkbenchPromise406039=null;
  function aetherWorkbenchLoad406039(){
    if(globalThis.AgentCryptoAetherWorkbench406039)return Promise.resolve(globalThis.AgentCryptoAetherWorkbench406039);
    if(aetherWorkbenchPromise406039)return aetherWorkbenchPromise406039;
    aetherWorkbenchPromise406039=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=AETHER_WORKBENCH_SRC_406039;
      script.async=true;
      script.dataset.aetherWorkbench406039='1';
      script.onload=()=>globalThis.AgentCryptoAetherWorkbench406039?resolve(globalThis.AgentCryptoAetherWorkbench406039):reject(new Error('Aether Workbench API absent'));
      script.onerror=()=>{aetherWorkbenchPromise406039=null;reject(new Error('Aether Workbench load failed'));};
      document.head.appendChild(script);
    });
    return aetherWorkbenchPromise406039;
  }
  function aetherWorkbenchPayload406039(mode){
    const snapshot=aetherSnapshot4084();
    const watch=aetherOperatorWatch406026();
    return Object.freeze({
      build:'40.6.39',
      mode,
      timeline:aetherTimelineState406027.entries.map(row=>Object.freeze({...row})),
      details:Object.freeze({
        why:aetherOperatorWhy405012(),
        semantic:aetherNewsMarketSemantic405013(),
        attention:aetherAttention40133(),
        news:snapshot.news
      }),
      watch:Object.freeze({...watch})
    });
  }
  function aetherPanelFocusEmbedded406039(target,panel){
    if(!panel)return;
    const embedded=['glance','history','details'].includes(target)?target:'glance';
    panel.dataset.aetherFocus406030=embedded;
    panel.querySelectorAll('[data-aether-focus-view-406030]').forEach(node=>{node.hidden=node.getAttribute('data-aether-focus-view-406030')!==embedded;});
    panel.querySelectorAll('[data-aether-focus-button-406030]').forEach(button=>{
      const active=button.getAttribute('data-aether-focus-button-406030')===embedded;
      button.setAttribute('aria-pressed',active?'true':'false');
      button.dataset.active=active?'1':'0';
    });
    if(embedded==='history')aetherTimelineRender406027(panel,{includeFull:true});
    if(embedded==='details')aetherDetailsRender406037(panel);
  }
  function aetherWorkbenchOpen406039(mode,panel=document.getElementById('atlasAetherStatusPanel4084')){
    const target=mode==='details'?'details':mode==='history'?'history':'events';
    return aetherWorkbenchLoad406039()
      .then(api=>api.open(aetherWorkbenchPayload406039(target)))
      .catch(()=>aetherPanelFocusEmbedded406039(target==='events'?'history':target,panel));
  }
  function aetherPanelFocus406030(mode,panel=document.getElementById('atlasAetherStatusPanel4084')){
    if(!panel)return;
    const target=['glance','history','details'].includes(mode)?mode:'glance';
    if(target==='glance')return aetherPanelFocusEmbedded406039('glance',panel);
    // Rich reading stays lazy and floats ABOVE the artwork; embedded surfaces are failure fallback only.
    aetherPanelFocusEmbedded406039('glance',panel);
    void aetherWorkbenchOpen406039(target,panel);
  }
  function aetherDetailsRender406037(panel=document.getElementById('atlasAetherStatusPanel4084')){
    if(!panel)return;
    const row=(key,value)=>{const node=panel.querySelector(`[data-aether-row-4084="${key}"]`);if(node)node.textContent=value;};
    row('why',aetherOperatorWhy405012());
    row('semantic',aetherNewsMarketSemantic405013());
    row('attention',aetherAttention40133());
    row('news',aetherSnapshot4084().news);
    panel.dataset.aetherDetailsHydrated406037='1';
  }

  /* 40.6.42 — AETHER COMPONENT FOUNDATION · RESPONSIVE INFORMATION ARCHITECTURE */
  /*
     Aether Watch becomes a data-first responsive UI. The historical 16:9 artwork is now
     only a low-contrast backplate; it no longer owns card geometry or window dimensions.
     This layer reads existing owners only: no fetch, timer, observer, storage or order path.
  */
  function aetherNumberFromText406042(value,pattern){
    const match=String(value||'').match(pattern);
    if(!match)return null;
    const n=Number(String(match[1]||'').replace('−','-').replace(',','.').replace(/\s+/g,''));
    return Number.isFinite(n)?n:null;
  }
  function aetherPctText406042(value){return value===null||value===undefined?'N/D':`${Math.round(value)} %`;}
  function aetherTone406042(value,{warn=80,danger=92,invert=false}={}){
    if(value===null||value===undefined)return 'muted';
    if(invert)return value>=danger?'danger':value>=warn?'warn':'good';
    return value>=danger?'danger':value>=warn?'warn':'good';
  }
  function aetherSet406042(stage,key,value,tone=null){
    const node=stage?.querySelector(`[data-aether46="${key}"]`);if(!node)return;
    const text=String(value??'—');if(node.textContent!==text)node.textContent=text;
    if(tone)node.dataset.tone=tone;else delete node.dataset.tone;
  }
  function aetherCardTone406042(stage,key,tone){const card=stage?.querySelector(`[data-aether-card-406046="${key}"]`);if(card)card.dataset.tone=tone||'neutral';}
  function aetherMarketModel406042(){
    try{
      const coins=(typeof state!=='undefined'&&Array.isArray(state?.coins))?state.coins:[];
      const rows=coins.map(row=>({symbol:String(row?.symbol||'').toUpperCase(),change:aetherSystemNumber4086(row?.change24h)})).filter(row=>row.change!==null);
      if(!rows.length)return {ready:false,up:null,down:null,flat:null,bias:'EN ATTENTE',top5:'N/D',top:[]};
      const up=rows.filter(row=>row.change>.05).length,down=rows.filter(row=>row.change<-.05).length,flat=rows.length-up-down;
      const bias=down>up*1.35?'NÉGATIVE':up>down*1.35?'POSITIVE':'MIXTE';
      const focusOrder=['BTC','ETH','BNB','XRP','SOL'];
      const bySymbol=new Map(rows.map(row=>[row.symbol,row]));
      const top=focusOrder.map(symbol=>bySymbol.get(symbol)).filter(Boolean);
      const pos=top.filter(row=>row.change>0).length,neg=top.filter(row=>row.change<0).length,zero=top.length-pos-neg;
      return {ready:true,up,down,flat,bias,top5:top.length?`${pos}/${top.length} + · ${neg} −${zero?` · ${zero} =`:''}`:'N/D',top};
    }catch(_){return {ready:false,up:null,down:null,flat:null,bias:'EN ATTENTE',top5:'N/D',top:[]};}
  }
  function aetherSystemModel406042(){
    const sys=aetherSystemState4086.system||{};
    const cpu=aetherSystemPercent4086(sys?.cpu?.usage_pct),cpuTemp=aetherSystemTemperature4086(sys?.cpu?.temperature_c);
    const gpuStatus=String(sys?.gpu?.status||'').trim().toLowerCase();
    const gpu=gpuStatus&&gpuStatus!=='ok'?null:aetherSystemPercent4086(sys?.gpu?.usage_pct),gpuTemp=gpuStatus&&gpuStatus!=='ok'?null:aetherSystemTemperature4086(sys?.gpu?.temperature_c);
    const ram=aetherSystemPercent4086(sys?.memory?.usage_pct);
    let status='STABLE',tone='good';
    if(cpu===null&&ram===null){status='INDISPONIBLE';tone='muted';}
    else if((cpu!==null&&cpu>=92)||(ram!==null&&ram>=96)||(cpuTemp!==null&&cpuTemp>=90)||(gpuTemp!==null&&gpuTemp>=84)){status='CRITIQUE';tone='danger';}
    else if((cpu!==null&&cpu>=80)||(ram!==null&&ram>=90)){status='SOUS CHARGE';tone='warn';}
    else if(gpu===null){status='PARTIEL';tone='neutral';}
    return {cpu,cpuTemp,gpu,gpuTemp,ram,status,tone};
  }
  function aetherSourcesModel406042(snapshot){
    let newsCount=0,newsLabel='VEILLE',newsStatus='idle';
    try{const ns=aetherVeilleStatus4087();newsCount=Array.isArray(ns?.events)?ns.events.length:0;newsLabel=newsCount?'ACTIVES':String(ns?.label||'VEILLE').toUpperCase();newsStatus=String(ns?.status||'idle').toLowerCase();}catch(_){}
    const ratio=(String(snapshot?.sources||'').match(/\b\d+\s*\/\s*\d+\b/)||[])[0]?.replace(/\s+/g,'')||'N/D';
    const match=ratio.match(/^(\d+)\/(\d+)$/);const num=match?Number(match[1]):null,den=match?Number(match[2]):null;
    const binanceComplete=Number.isFinite(num)&&Number.isFinite(den)&&den>0&&num===den;
    const book=String(snapshot?.book||'EN VEILLE').toUpperCase();
    const bookReady=/^PRÊT/.test(book)&&!/REQUIS|VEILLE|INDISPONIBLE|ERREUR/.test(book);
    const atlasData=String(snapshot?.currentStatus||'').toUpperCase()==='CURRENT'?'CURRENT':snapshot?.reports?'DISPONIBLE':'VEILLE';
    const atlasReady=atlasData==='CURRENT'||atlasData==='DISPONIBLE';
    const newsReady=newsCount>0&&newsStatus!=='error';
    const sourceReady=binanceComplete&&bookReady&&atlasReady&&newsReady;
    return {ratio,book,news:newsCount?`${newsCount} QUALIFIÉ${newsCount>1?'S':''}`:newsLabel,atlasData,status:sourceReady?'PRÊTES':'PARTIELLES',tone:sourceReady?'good':'warn',checks:{binanceComplete,bookReady,atlasReady,newsReady}};
  }
  function aetherAtlasModel406042(snapshot){
    const raw=String(snapshot?.atlas||'').trim();
    const score=aetherNumberFromText406042(raw,/([+−-]?\s*\d+)\s*\/\s*100/);
    const parts=raw.split('·').map(v=>v.trim()).filter(Boolean);
    const status=String(snapshot?.currentStatus||parts[0]||'VEILLE').toUpperCase();
    const signal=parts.find(v=>!/CURRENT|IDLE|VEILLE|\d+\s*\/\s*100/i.test(v))||parts[1]||'Lecture en attente';
    const resident=aetherAtlasAuto40133();
    const reports=Number(snapshot?.reports)||0;
    const tone=/indisponible/i.test(resident)?'danger':/CURRENT|REPOS|PENDING|PARTAG|HAUSS|BAISS/i.test(`${status} ${resident} ${signal}`)?'good':'neutral';
    return {status,signal,score:score===null?'N/D':`${score>=0?'+':''}${score}/100`,reports:reports?`${reports}/4`:'N/D',resident,tone};
  }
  function aetherOracleModel406042(){
    const identity=aetherText4084('atlasOracleOperatorIdentity','')||aetherText4084('atlasOracleAsset','');
    const parts=String(identity||'').split('·').map(v=>v.trim()).filter(Boolean);
    const asset=parts[0]&&!/ATTENTE|LIVECHECK/i.test(parts[0])?parts[0]:'N/D';
    const scenario=parts[1]||'EN ATTENTE';
    const regime=(aetherText4084('atlasOracleOperatorBias','')||aetherText4084('atlasOracleBias','')).replace(/^BIAIS\s*|^Biais mesuré\s*:\s*/i,'').trim()||'N/D';
    const confidenceRaw=(aetherText4084('atlasOracleOperatorConfidence','')||aetherText4084('atlasOracleConfidence','')).replace(/^CONF\.\s*|^Confiance données\s*/i,'').trim();
    const confidence=aetherNumberFromText406042(confidenceRaw,/(\d+(?:[.,]\d+)?)/);
    const text=String(document.getElementById('atlasOracleV0')?.textContent||'').replace(/\s+/g,' ');
    const up=aetherNumberFromText406042(text,/HAUSSE\s*(\d+)\s*\/\s*100/i),down=aetherNumberFromText406042(text,/BAISSE\s*(\d+)\s*\/\s*100/i),coherence=aetherNumberFromText406042(text,/Cohérence\s*(\d+)\s*\/\s*100/i);
    let summary='Lecture en attente',tone='neutral';
    if(up!==null&&down!==null){const gap=up-down;summary=Math.abs(gap)<6?'Équilibre serré':gap>0?'Avantage haussier':'Avantage baissier';tone=Math.abs(gap)<6?'neutral':gap>0?'good':'warn';}
    return {asset,scenario,regime,confidence:confidence===null?'N/D':`${Math.round(confidence)}/100`,up:up===null?'N/D':`${Math.round(up)}/100`,down:down===null?'N/D':`${Math.round(down)}/100`,coherence:coherence===null?'N/D':`${Math.round(coherence)}/100`,summary,tone};
  }
  function aetherConvergenceModel406042(watch){
    const m=watch?.matrix||aetherDirectionMatrix406058();
    const coveragePct=m.total?Math.round((m.coverage/m.total)*100):0;
    const comparable=m.directional.length>=2;
    let dominant='COUVERTURE FAIBLE';
    if(m.opposition)dominant='OPPOSITION';
    else if(comparable&&m.dominant>0)dominant='HAUSSIÈRE';
    else if(comparable&&m.dominant<0)dominant='BAISSIÈRE';
    else if(m.directional.length===1)dominant='DIRECTION SEULE';
    else if(m.coverage>=2)dominant='NEUTRE';
    const confirm=m.opposition
      ?'Aucune synthèse unique'
      :m.leaders.length>=2
        ?m.leaders.map(row=>row.name).join(' · ')
        :m.directional.length===1
          ?`${m.directional[0].name} seule`
          :'Aucune confirmation directionnelle';
    const confirmLabel=m.opposition?'opposition':m.leaders.length>=2?'confirment':m.directional.length===1?'direction seule':'direction';
    const oppose=m.opposition?`${m.positive.map(x=>x.name).join(' + ')} / ${m.negative.map(x=>x.name).join(' + ')}`:'Aucune';
    const pct=`${coveragePct}% couv.`;
    const tone=m.opposition?'warn':comparable&&m.alignmentPct!==null&&m.alignmentPct>=75?(m.dominant<0?'warn':'good'):'neutral';
    return {ratio:`${m.coverage}/${m.total}`,pct,coveragePct,alignmentPct:m.alignmentPct,dominant,confirm,confirmLabel,oppose,neutral:m.neutral.map(x=>x.name).join(' · ')||'Aucune',tone,raw:String(watch?.convergence||''),coverage:m.coverage,total:m.total};
  }
  function aetherDivergenceModel406042(watch,convergence){
    const m=watch?.matrix||aetherDirectionMatrix406058();
    if(m.opposition)return {status:'OPPOSITION',detail:`${m.positive.map(x=>x.name).join(' + ')} / ${m.negative.map(x=>x.name).join(' + ')}`,opposed:convergence?.oppose||'Aucune',tone:'warn'};
    if(m.neutral.length)return {status:'NEUTRALITÉ',detail:`${m.neutral.map(x=>x.name).join(' + ')} restent neutres`,opposed:'Aucune',tone:'neutral'};
    if(m.coverage<2)return {status:'COUVERTURE FAIBLE',detail:`${m.coverage}/${m.total} couches disponibles · comparaison insuffisante`,opposed:'Aucune',tone:'neutral'};
    return {status:'AUCUNE FORTE',detail:'Aucune opposition directionnelle démontrée',opposed:'Aucune',tone:'good'};
  }
  function aetherWeatherModel406042(){
    const weather=aetherSystemState4086.weather||{},days=Array.isArray(weather?.daily)?weather.daily:[];
    const today=days[0]||{};const text=String(today?.text||'Prévision en attente');
    const tempPair=(text.match(/(-?\d+)\s*\/\s*(-?\d+)°/)||[]);const rain=(text.match(/pluie\s*(\d+)%/i)||[])[1];
    const level=String(weather?.risk_level||'').toLowerCase();const hasMeasure=Boolean(tempPair.length||rain||weather?.max_gust_kmh!==null&&weather?.max_gust_kmh!==undefined);const risk=!hasMeasure?'INDISPONIBLE':level==='danger'?'ORAGE':level==='warn'?'ALERTE':level==='watch'?'SURVEILLER':level==='ok'?'CALME':'INCONNU';
    return {today:tempPair.length?`${tempPair[1]}° / ${tempPair[2]}°`:'N/D',rain:rain?`${rain}%`:'N/D',gust:weather?.max_gust_kmh===null||weather?.max_gust_kmh===undefined?'N/D':`${Math.round(weather.max_gust_kmh)} km/h`,risk,detail:hasMeasure?aetherWeatherRisk40133():'Prévision indisponible',tone:!hasMeasure?'muted':level==='danger'?'danger':level==='warn'?'warn':level==='watch'?'neutral':level==='ok'?'good':'muted'};
  }
  function aetherComponentViewModel406042(snapshot,watch){
    const market=aetherMarketModel406042(),system=aetherSystemModel406042(),sources=aetherSourcesModel406042(snapshot),atlas=aetherAtlasModel406042(snapshot),oracle=aetherOracleModel406042(),convergence=aetherConvergenceModel406042(watch),divergence=aetherDivergenceModel406042(watch,convergence),weather=aetherWeatherModel406042();
    const level=String(watch?.level||'MODÉRÉ').split('·')[0].trim()||'MODÉRÉ';
    const coreTone=level==='CRITIQUE'?'danger':level==='ÉLEVÉ'?'warn':level==='FAIBLE'?'muted':'neutral';
    const why=String(watch?.why||'Évaluation Aether en attente');
    return {market,system,sources,atlas,oracle,convergence,divergence,weather,core:{level,tone:coreTone,why,watch:String(watch?.watch||'Surveillance en attente'),note:String(watch?.note||'Lecture en cours'),convergence:convergence.pct}};
  }
  function aetherComponentEventRow406042(entry){
    const row=document.createElement('div');row.className='aether46-event-row';
    const time=document.createElement('time');time.textContent=new Date(entry.at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    const type=document.createElement('b');type.textContent=entry.type;
    const detail=document.createElement('span');detail.textContent=aetherTimelineClip406027(entry.preview||entry.detail,88);detail.title=entry.detail||'';
    row.append(time,type,detail);return row;
  }
  function aetherComponentPaint406042(panel,snapshot=aetherSnapshot4084(),watch=aetherOperatorWatch406026()){
    const stage=panel?.querySelector('[data-aether-component-stage-406046]');if(!stage)return;
    const vm=aetherComponentViewModel406042(snapshot,watch);
    const now=new Date();
    const dateText=new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).format(now);
    const timeText=new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);

    aetherSet406042(stage,'status_system',vm.system.status==='STABLE'?'SYSTÈME OPÉRATIONNEL':vm.system.status==='PARTIEL'?'SYSTÈME PARTIEL':vm.system.status==='SOUS CHARGE'?'SYSTÈME SOUS CHARGE':vm.system.status==='CRITIQUE'?'SYSTÈME CRITIQUE':'SYSTÈME INDISPONIBLE',vm.system.tone);
    aetherSet406042(stage,'status_modules',vm.sources.status==='PRÊTES'?'TOUTES LES SOURCES PRÊTES':'SOURCES PARTIELLES',vm.sources.tone);
    aetherSet406042(stage,'status_date',dateText);
    aetherSet406042(stage,'status_time',timeText);

    aetherSet406042(stage,'attention_level',vm.core.level,vm.core.tone);
    aetherSet406042(stage,'attention_why',vm.core.why);
    aetherSet406042(stage,'attention_watch',vm.core.watch);
    aetherSet406042(stage,'attention_note',vm.core.note);
    aetherSet406042(stage,'attention_convergence',vm.core.convergence);
    aetherCardTone406042(stage,'core',vm.core.tone);

    aetherSet406042(stage,'system_status',vm.system.status,vm.system.tone);
    aetherSet406042(stage,'system_cpu',aetherPctText406042(vm.system.cpu),aetherTone406042(vm.system.cpu));
    aetherSet406042(stage,'system_ram',aetherPctText406042(vm.system.ram),aetherTone406042(vm.system.ram,{warn:88,danger:95}));
    aetherSet406042(stage,'system_gpu',aetherPctText406042(vm.system.gpu),vm.system.gpu===null?'muted':'good');
    aetherSet406042(stage,'system_cpu_temp',vm.system.cpuTemp===null?'N/D':`${Math.round(vm.system.cpuTemp)}°C`);
    aetherSet406042(stage,'system_gpu_temp',vm.system.gpuTemp===null?'N/D':`${Math.round(vm.system.gpuTemp)}°C`);
    aetherCardTone406042(stage,'system',vm.system.tone);

    aetherSet406042(stage,'sources_status',vm.sources.status,vm.sources.tone);
    aetherSet406042(stage,'sources_binance',vm.sources.ratio);
    aetherSet406042(stage,'sources_book',vm.sources.book);
    aetherSet406042(stage,'sources_news',vm.sources.news);
    aetherSet406042(stage,'sources_atlas',vm.sources.atlasData);
    aetherCardTone406042(stage,'sources',vm.sources.tone);

    aetherSet406042(stage,'atlas_status',vm.atlas.status,vm.atlas.tone);
    aetherSet406042(stage,'atlas_signal',vm.atlas.signal);
    aetherSet406042(stage,'atlas_score',vm.atlas.score);
    aetherSet406042(stage,'atlas_reports',vm.atlas.reports);
    aetherSet406042(stage,'atlas_resident',vm.atlas.resident);
    aetherCardTone406042(stage,'atlas',vm.atlas.tone);

    aetherSet406042(stage,'oracle_status',vm.oracle.summary,vm.oracle.tone);
    aetherSet406042(stage,'oracle_asset',vm.oracle.asset);
    aetherSet406042(stage,'oracle_scenario',vm.oracle.scenario);
    aetherSet406042(stage,'oracle_regime',vm.oracle.regime);
    aetherSet406042(stage,'oracle_confidence',vm.oracle.confidence);
    aetherCardTone406042(stage,'oracle',vm.oracle.tone);

    aetherSet406042(stage,'market_status',vm.market.ready?`largeur ${vm.market.bias.toLowerCase()}`:'EN ATTENTE',vm.market.bias==='POSITIVE'?'good':vm.market.bias==='NÉGATIVE'?'warn':'neutral');
    aetherSet406042(stage,'market_up',vm.market.up===null?'N/D':vm.market.up,'good');
    aetherSet406042(stage,'market_down',vm.market.down===null?'N/D':vm.market.down,'warn');
    aetherSet406042(stage,'market_flat',vm.market.flat===null?'N/D':vm.market.flat);
    aetherSet406042(stage,'market_top5',vm.market.top5);
    for(let i=0;i<5;i++){
      const row=vm.market.top?.[i]||null;
      aetherSet406042(stage,`market_coin_${i}_symbol`,row?.symbol||'—');
      aetherSet406042(stage,`market_coin_${i}_change`,row?`${row.change>=0?'+':''}${row.change.toFixed(2)}%`:'—',row?.change>0?'good':row?.change<0?'warn':'neutral');
    }
    aetherCardTone406042(stage,'market',vm.market.bias==='POSITIVE'?'good':vm.market.bias==='NÉGATIVE'?'warn':'neutral');

    aetherSet406042(stage,'convergence_ratio',vm.convergence.ratio);
    aetherSet406042(stage,'convergence_pct',vm.convergence.pct,vm.convergence.tone);
    aetherSet406042(stage,'convergence_dominant',vm.convergence.dominant);
    aetherSet406042(stage,'convergence_confirm_label',vm.convergence.confirmLabel);
    aetherSet406042(stage,'convergence_confirm',vm.convergence.confirm);
    aetherSet406042(stage,'convergence_oppose',vm.convergence.oppose);
    aetherCardTone406042(stage,'convergence',vm.convergence.tone);

    aetherSet406042(stage,'divergence_status',vm.divergence.status,vm.divergence.tone);
    aetherSet406042(stage,'divergence_detail',vm.divergence.detail);
    aetherSet406042(stage,'divergence_oppose',vm.divergence.opposed);
    aetherCardTone406042(stage,'divergence',vm.divergence.tone);

    aetherSet406042(stage,'weather_status',vm.weather.risk,vm.weather.tone);
    aetherSet406042(stage,'weather_today',vm.weather.today);
    aetherSet406042(stage,'weather_rain',vm.weather.rain);
    aetherSet406042(stage,'weather_gust',vm.weather.gust);
    aetherSet406042(stage,'weather_detail',vm.weather.detail);
    aetherCardTone406042(stage,'weather',vm.weather.tone);

    const events=stage.querySelector('[data-aether46-events]');
    if(events){
      events.replaceChildren();
      const rows=aetherTimelineState406027.entries.slice(0,3);
      if(rows.length)rows.forEach(entry=>events.appendChild(aetherComponentEventRow406042(entry)));
      else{const empty=document.createElement('span');empty.className='aether46-empty';empty.textContent='Aucun changement significatif dans cette session.';events.appendChild(empty);}
    }
    aetherSet406042(stage,'events_count',`${aetherTimelineState406027.entries.length}/${aetherTimelineState406027.max}`);
    stage.dataset.attention=vm.core.tone;
  }
  function aetherComponentEnsure406042(panel){
    if(!panel)return null;
    const existing=panel.querySelector('[data-aether-component-stage-406046]');
    if(existing)return existing;

    // 40.6.49 keeps the 40.6.46 CLEAN REBUILD runtime: old Aether presentation is not hidden under the new one;
    // it is removed from this runtime panel. Data owners/functions remain untouched.
    panel.querySelectorAll('.aether-first-glance-grid-406030,[data-aether-component-stage-406042],.aether42-backplate,.aether42-surface').forEach(node=>node.remove());
    panel.dataset.aetherComponentFoundation406046='1';
    delete panel.dataset.aetherComponentFoundation406042;

    const stage=document.createElement('div');
    stage.className='aether46-stage';
    stage.setAttribute('data-aether-component-stage-406046','1');
    stage.innerHTML=`
      <div class="aether46-system-banner">
        <div><b data-aether46="status_system">SYSTÈME OPÉRATIONNEL</b><span data-aether46="status_modules">SOURCES EN VEILLE</span></div>
        <div class="aether46-clock"><small data-aether46="status_date">—</small><strong data-aether46="status_time">—</strong></div>
      </div>
      <div class="aether46-quote" aria-hidden="true">“L’information devient clarté quand elle est reliée.”<small>Agent-Crypto @erith.IA</small></div>

      <main class="aether46-grid" aria-label="Aether Markets Observatory">
        <article class="aether46-card" data-aether-card-406046="system">
          <header><span>SYSTÈME</span><b data-aether46="system_status">—</b></header>
          <div class="aether46-system-metrics"><div><small>CPU</small><strong data-aether46="system_cpu">—</strong></div><div><small>RAM</small><strong data-aether46="system_ram">—</strong></div><div><small>GPU</small><strong data-aether46="system_gpu">—</strong></div></div>
          <footer>Backend local · lecture seule</footer>
        </article>

        <article class="aether46-card" data-aether-card-406046="sources">
          <header><span>SOURCES</span><b data-aether46="sources_status">—</b></header>
          <div class="aether46-source-metrics"><div><small>Binance</small><strong data-aether46="sources_binance">—</strong></div><div><small>Book</small><strong data-aether46="sources_book">—</strong></div><div><small>News</small><strong data-aether46="sources_news">—</strong></div><div><small>Atlas Data</small><strong data-aether46="sources_atlas">—</strong></div></div>
          <footer>Données vérifiées et à jour</footer>
        </article>

        <article class="aether46-card" data-aether-card-406046="atlas">
          <header><span>ATLAS</span><b data-aether46="atlas_status">—</b></header>
          <div class="aether46-atlas-main"><strong data-aether46="atlas_score">—</strong><span data-aether46="atlas_signal">—</span></div>
          <div class="aether46-atlas-sub"><b data-aether46="atlas_reports">—</b><span data-aether46="atlas_resident">—</span></div>
        </article>

        <article class="aether46-card" data-aether-card-406046="convergence">
          <header><span>CONVERGENCE</span><b data-aether46="convergence_dominant">—</b></header>
          <div class="aether46-convergence-main"><strong data-aether46="convergence_ratio">—</strong><span>couches · <b data-aether46="convergence_pct">—</b></span></div>
          <footer><span data-aether46="convergence_confirm_label">direction</span> · <b data-aether46="convergence_confirm">—</b></footer>
        </article>

        <article class="aether46-card" data-aether-card-406046="divergence">
          <header><span>DIVERGENCE</span><b data-aether46="divergence_status">—</b></header>
          <p data-aether46="divergence_detail">—</p><footer>Contradiction · <b data-aether46="divergence_oppose">—</b></footer>
        </article>

        <article class="aether46-card" data-aether-card-406046="market">
          <header><span>MARCHÉ</span><b data-aether46="market_status">—</b></header>
          <div class="aether46-breadth"><b><strong data-aether46="market_up">—</strong> hausses</b><b><strong data-aether46="market_down">—</strong> baisses</b><b><strong data-aether46="market_flat">—</strong> stables</b></div>
          <div class="aether46-coins">${[0,1,2,3,4].map(i=>`<span><b data-aether46="market_coin_${i}_symbol">—</b><strong data-aether46="market_coin_${i}_change">—</strong></span>`).join('')}</div>
        </article>

        <article class="aether46-card aether46-events" data-aether-card-406046="events" role="button" tabindex="0" aria-label="Ouvrir les événements récents">
          <header><span>ÉVÉNEMENTS RÉCENTS</span><b data-aether46="events_count">0/8</b></header>
          <div data-aether46-events aria-live="polite"></div><footer>Lecture partagée · ouvrir l’historique</footer>
        </article>

        <article class="aether46-card" data-aether-card-406046="oracle">
          <header><span>ORACLE</span><b data-aether46="oracle_status">—</b></header>
          <div class="aether46-oracle-metrics"><div><small>Actif</small><strong data-aether46="oracle_asset">—</strong></div><div><small>Scénario</small><strong data-aether46="oracle_scenario">—</strong></div><div><small>Régime</small><strong data-aether46="oracle_regime">—</strong></div><div><small>Confiance</small><strong data-aether46="oracle_confidence">—</strong></div></div>
        </article>

        <article class="aether46-card" data-aether-card-406046="weather">
          <header><span>MÉTÉO 5 J</span><b data-aether46="weather_status">—</b></header>
          <div class="aether46-weather-metrics"><div><small>Aujourd’hui</small><strong data-aether46="weather_today">—</strong></div><div><small>Pluie</small><strong data-aether46="weather_rain">—</strong></div><div><small>Rafales</small><strong data-aether46="weather_gust">—</strong></div></div>
          <footer data-aether46="weather_detail">—</footer>
        </article>

        <article class="aether46-core" data-aether-card-406046="core">
          <span>NIVEAU D’ATTENTION</span><strong data-aether46="attention_level">—</strong>
          <small>Cause principale</small><p data-aether46="attention_why">—</p>
          <b>À surveiller maintenant</b><p data-aether46="attention_watch">—</p>
        </article>
      </main>

      <div class="aether46-bottom-left" aria-hidden="true">MARKETS OBSERVATORY<small>L’ATTENTION ÉCLAIRE LES OPPORTUNITÉS</small></div>
      <div class="aether46-bottom-center" aria-hidden="true">MARCHÉS · ATLAS · ORACLE · SYNTHÈSE · DÉCISION</div>
      <div class="aether46-bottom-right" aria-hidden="true">AGENT-CRYPTO @ERITH.IA<small>DONNÉES AU SERVICE DU BON SENS</small></div>
      <nav class="aether46-actions" aria-label="Lectures Aether"><button type="button" data-aether46-open="history">Historique</button><button type="button" data-aether46-open="details">Détails</button></nav>`;

    panel.appendChild(stage);
    stage.querySelector('[data-aether46-open="history"]')?.addEventListener('click',()=>void aetherWorkbenchOpen406039('history',panel));
    stage.querySelector('[data-aether46-open="details"]')?.addEventListener('click',()=>void aetherWorkbenchOpen406039('details',panel));
    const events=stage.querySelector('[data-aether-card-406046="events"]');
    const openEvents=()=>void aetherWorkbenchOpen406039('events',panel);
    events?.addEventListener('click',openEvents);
    events?.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openEvents();}});
    return stage;
  }

  function aetherPanelEnsure4084(){
    let panel=document.getElementById("atlasAetherStatusPanel4084");
    if(panel){
      if(!panel.dataset.aetherOperatorOpen406046)panel.dataset.aetherOperatorOpen406046="0";
      aetherComponentEnsure406042(panel);
      return panel;
    }
    panel=document.createElement("section");
    panel.id="atlasAetherStatusPanel4084";
    panel.hidden=true;
    panel.dataset.aetherOperatorOpen406046="0";
    panel.setAttribute("aria-label","Synthèse Aether");
    panel.innerHTML=`<div class="atlas-aether-panel-head-4084"><b>AETHER · ATTENTION WATCH</b><button type="button" data-aether-close-4084 aria-label="Fermer Aether">×</button></div>`;
    document.body.appendChild(panel);
    aetherComponentEnsure406042(panel);
    panel.querySelector("[data-aether-close-4084]")?.addEventListener("click",()=>aetherPanelSet4084(false));
    return panel;
  }
  /* 40.6.40 — AETHER NATIVE WINDOW MANAGER BRIDGE */
  function aetherNativeWindowManager406040(){
    const manager=globalThis.ErithAdministratorWindows;
    return manager?.getWindow?.('aether-watch')?manager:null;
  }
  function aetherPanelSet4084(open){
    const button=document.getElementById("atlasAetherStatusToggle4084");
    const panel=open?aetherPanelEnsure4084():document.getElementById("atlasAetherStatusPanel4084");
    const manager=aetherNativeWindowManager406040();
    if(panel){
      panel.dataset.aetherOperatorOpen406046=open?"1":"0";
      if(manager){
        // 40.6.46: Window Manager keeps geometry only; visibility is operator-owned.
        panel.hidden=false;
        if(open){
          manager.hide('aether-watch',false);
          manager.minimize('aether-watch',false);
          manager.focus('aether-watch');
        }else{
          manager.hide('aether-watch',true);
        }
      }else{
        panel.hidden=!open;
      }
    }
    if(button)button.setAttribute("aria-expanded",open?"true":"false");
    if(open){
      aetherPanelFocus406030("glance",panel);
      aetherCorePaint406037();
      if(aetherMarketDataReady406037())aetherMarkMarketReady406037("operator-open");
    }
  }
  function renderAether4084(){
    const s=aetherSnapshot4084();
    const put=(id,value)=>{const n=document.getElementById(id);if(n&&n.textContent!==value)n.textContent=value;};
    // 40.4.130 — restore the healthy semantic INFO contract. No global INFO marquee.
    // Long News text belongs only to the dedicated VEILLE phase.
    put("atlasAetherRibbonMarket4088","");
    put("atlasAetherRibbonAtlas4084",`Atlas · ${s.atlas}`);
    put("atlasAetherRibbonOracle4084",`Oracle · ${s.oracle}`);
    put("atlasAetherRibbonSources4084",`Sources · ${s.sources}`);
    put("atlasAetherRibbonBook4084",`Book · ${s.book}`);
    renderAetherVeille4087();
    let stateLabel="VEILLE";if(/open|running|active|produ/i.test(s.currentStatus))stateLabel="CURRENT";else if(s.reports>=4)stateLabel="ATLAS 4/4";else if(s.oracle&&!/ATTENTE/.test(s.oracle))stateLabel="ORACLE";try{const feed=aetherVeilleCurrent4087();if(feed.kind==="context")stateLabel="CONTEXTE";else if(feed.tone==="danger")stateLabel="ATTENTION";}catch(_){}put("atlasAetherStatusLabel4084",`Aether · ${stateLabel}`);
    const watch406027=aetherOperatorWatch406026();aetherTimelineCapture406027(watch406027);const panel=document.getElementById("atlasAetherStatusPanel4084");if(panel&&panel.dataset.aetherOperatorOpen406046==="1"&&!panel.hidden){const row=(k,v)=>{const n=panel.querySelector(`[data-aether-row-4084="${k}"]`);if(n)n.textContent=v;};const watch406026=aetherOperatorWatch406026();row("level",watch406026.level);row("convergence",watch406026.convergence);row("divergence",watch406026.divergence);row("watch",watch406026.watch);row("note",watch406026.note);aetherTimelineRender406027(panel,{includeFull:panel.dataset.aetherFocus406030==="history"});row("market",aetherMarketBreadth40133());row("atlas_auto",aetherAtlasAuto40133());row("atlas",`${s.atlas} · Graphe ${s.graph}`);row("oracle",s.oracle);row("sources",`${s.sources} · Book ${s.book}`);row("system",aetherSystemBrief40133());row("weather",aetherWeatherFirstGlance406030());row("weather_risk",aetherWeatherRisk40133());if(panel.dataset.aetherFocus406030==="details")aetherDetailsRender406037(panel);aetherComponentPaint406042(panel,s,watch406026);}
  }

  const AETHER_SYSTEM_BACKEND_4086="http://127.0.0.1:8790/system";
  const AETHER_WEATHER_4086=Object.freeze({latitude:48.5876,longitude:1.5784,timezone:"Europe/Paris",ttl:15*60*1000,label:"Maintenon",days:5});
  const aetherSystemState4086={system:null,systemAt:0,systemInflight:null,weather:null,weatherAt:0,weatherInflight:null,weatherStale:false};
  const aetherSystemNumber4086=value=>{
    if(value===null||value===undefined)return null;
    if(typeof value==="string"&&!value.trim())return null;
    const n=Number(value);
    return Number.isFinite(n)?n:null;
  };
  const aetherSystemPercent4086=value=>{const n=aetherSystemNumber4086(value);return n!==null&&n>=0&&n<=100?n:null;};
  const aetherSystemTemperature4086=value=>{const n=aetherSystemNumber4086(value);return n!==null&&n>0&&n<150?n:null;};
  function aetherSystemSet4086(key,value,{icon=null,tone=null,title=null}={}){
    const item=document.querySelector(`#atlasAetherSystem4086 [data-aether-system-4086="${key}"]`);if(!item)return;
    const out=item.querySelector(".atlas-aether-system-value-4086");if(out&&out.textContent!==String(value))out.textContent=String(value);
    if(icon){const node=item.querySelector(".atlas-aether-system-icon-4086");if(node&&node.textContent!==icon)node.textContent=icon;}
    if(title)item.title=title;
    if(key==="btc")item.dataset.tone=tone||"flat";
  }
  function aetherWeatherIcon4086(code){const c=aetherSystemNumber4086(code);if(c===null)return"·";if(c===0)return"☀";if([1,2,3].includes(c))return"☁";if([45,48].includes(c))return"≋";if((c>=51&&c<=67)||(c>=80&&c<=82))return"☂";if((c>=71&&c<=77)||(c>=85&&c<=86))return"❄";if(c>=95)return"⚡";return"☁";}
  function aetherBtc4086(){
    try{
      const coin=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins.find(row=>String(row?.symbol||"").toUpperCase()==="BTC"||row?.id==="bitcoin"):null;
      const price=aetherSystemNumber4086(coin?.price),change=aetherSystemNumber4086(coin?.change24h);
      if(price===null||price<=0)return{value:"—",tone:"flat",title:"BTC live indisponible"};
      const priceText=new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:price>=1000?0:2}).format(price);
      const changeText=change===null?"":` · ${change>=0?"+":""}${change.toFixed(2)} %`;
      return{value:`${priceText}${changeText}`,tone:change>0?"positive":change<0?"negative":"flat",title:"Bitcoin · prix live Agent-Crypto"};
    }catch(_){return{value:"—",tone:"flat",title:"BTC live indisponible"};}
  }
  function renderAetherSystem4086(){
    const sys=aetherSystemState4086.system||{};
    const cpu=aetherSystemPercent4086(sys?.cpu?.usage_pct),cpuTemp=aetherSystemTemperature4086(sys?.cpu?.temperature_c);
    const gpuStatus=String(sys?.gpu?.status||"").trim().toLowerCase();
    const gpu=gpuStatus&&gpuStatus!=="ok"?null:aetherSystemPercent4086(sys?.gpu?.usage_pct);
    const gpuTemp=gpuStatus&&gpuStatus!=="ok"?null:aetherSystemTemperature4086(sys?.gpu?.temperature_c);
    const ram=aetherSystemPercent4086(sys?.memory?.usage_pct),used=aetherSystemNumber4086(sys?.memory?.used_gb),total=aetherSystemNumber4086(sys?.memory?.total_gb);
    aetherSystemSet4086("cpu",cpu===null?"N/D":`${Math.round(cpu)} %${cpuTemp===null?"":` · ${Math.round(cpuTemp)}°`}`,{title:sys?.cpu?.name||"CPU Windows · backend local 8790"});
    aetherSystemSet4086("gpu",gpu===null?"N/D":`${Math.round(gpu)} %${gpuTemp===null?"":` · ${Math.round(gpuTemp)}°`}`,{title:sys?.gpu?.name||"GPU · backend local 8790"});
    const ramDetail=used!==null&&total!==null&&total>0&&used>=0&&used<=total?` · ${used.toFixed(1)}/${total.toFixed(1)} Go`:"";
    aetherSystemSet4086("ram",ram===null?"N/D":`${Math.round(ram)} %${ramDetail}`,{title:"RAM Windows · backend local 8790"});
    const weather=aetherSystemState4086.weather;
    const weatherTemp=aetherSystemNumber4086(weather?.temperature_c);
    aetherSystemSet4086("weather",weatherTemp!==null&&weatherTemp>=-80&&weatherTemp<=60?`${Math.round(weatherTemp)} °C${aetherSystemState4086.weatherStale?" · cache":""}`:"N/D",{icon:aetherWeatherIcon4086(weather?.weather_code),title:`Maintenon · Eure-et-Loir · Open-Meteo${aetherSystemState4086.weatherStale?" · dernière valeur valide conservée":""}`});
    const btc=aetherBtc4086();aetherSystemSet4086("btc",btc.value,{tone:btc.tone,title:btc.title});
  }
  function aetherSystemBackend4086(force=false){
    const now=Date.now();if(aetherSystemState4086.systemInflight)return aetherSystemState4086.systemInflight;
    if(!force&&now-aetherSystemState4086.systemAt<15000){renderAetherSystem4086();return Promise.resolve(aetherSystemState4086.system);}
    const controller=new AbortController(),timeout=window.setTimeout(()=>controller.abort(),1800);
    aetherSystemState4086.systemInflight=fetch(AETHER_SYSTEM_BACKEND_4086,{cache:"no-store",headers:{Accept:"application/json"},signal:controller.signal})
      .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();})
      .then(payload=>{aetherSystemState4086.system=payload&&payload.read_only===true?payload:null;aetherSystemState4086.systemAt=Date.now();return aetherSystemState4086.system;})
      .catch(()=>{aetherSystemState4086.system=null;aetherSystemState4086.systemAt=Date.now();return null;})
      .finally(()=>{window.clearTimeout(timeout);aetherSystemState4086.systemInflight=null;renderAetherSystem4086();});
    return aetherSystemState4086.systemInflight;
  }
  function aetherWeatherForecast40133(payload){
  const t=aetherSystemNumber4086(payload?.current?.temperature_2m),c=aetherSystemNumber4086(payload?.current?.weather_code),d=payload?.daily||{},times=Array.isArray(d.time)?d.time:[],codes=Array.isArray(d.weather_code)?d.weather_code:[],maxs=Array.isArray(d.temperature_2m_max)?d.temperature_2m_max:[],mins=Array.isArray(d.temperature_2m_min)?d.temperature_2m_min:[],probs=Array.isArray(d.precipitation_probability_max)?d.precipitation_probability_max:[],gusts=Array.isArray(d.wind_gusts_10m_max)?d.wind_gusts_10m_max:[],fmt=new Intl.DateTimeFormat("fr-FR",{weekday:"short",day:"2-digit"});
  const daily=times.slice(0,5).map((time,i)=>{let label=time;try{label=fmt.format(new Date(`${time}T12:00:00`));}catch(_){}const hi=aetherSystemNumber4086(maxs[i]),lo=aetherSystemNumber4086(mins[i]),pr=aetherSystemNumber4086(probs[i]),gu=aetherSystemNumber4086(gusts[i]),co=aetherSystemNumber4086(codes[i]);return {time,code:co,gust:gu,text:`${label} ${aetherWeatherIcon4086(co)} ${hi===null||lo===null?"N/D":`${Math.round(hi)}/${Math.round(lo)}°`}${pr===null?"":` · pluie ${Math.round(pr)}%`}${gu===null?"":` · raf. ${Math.round(gu)} km/h`}`};});
  const h=payload?.hourly||{},ht=Array.isArray(h.time)?h.time:[],hc=Array.isArray(h.weather_code)?h.weather_code:[],hp=Array.isArray(h.precipitation_probability)?h.precipitation_probability:[],hg=Array.isArray(h.wind_gusts_10m)?h.wind_gusts_10m:[];let thunder=null,maxG=null,maxAt="",maxP=null;for(let i=0;i<ht.length;i++){const co=aetherSystemNumber4086(hc[i]),gu=aetherSystemNumber4086(hg[i]),pr=aetherSystemNumber4086(hp[i]);if(co!==null&&co>=95&&!thunder)thunder={time:ht[i],gust:gu,prob:pr};if(gu!==null&&(maxG===null||gu>maxG)){maxG=gu;maxAt=ht[i];}if(pr!==null&&(maxP===null||pr>maxP))maxP=pr;}
  const when=x=>{try{return new Intl.DateTimeFormat("fr-FR",{weekday:"short",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(x));}catch(_){return x||"";}};let level="ok",risk="";if(thunder){level="danger";risk=`⚡ Orage prévu ${when(thunder.time)}${thunder.prob===null?"":` · pluie ${Math.round(thunder.prob)}%`}${thunder.gust===null?"":` · raf. ${Math.round(thunder.gust)} km/h`}`;}else if(maxG!==null&&maxG>=70){level="warn";risk=`Rafales fortes prévues ${when(maxAt)} · max ${Math.round(maxG)} km/h · surveiller alimentation/réseau`;}else if(maxG!==null&&maxG>=55){level="watch";risk=`Vent soutenu sur 5 j · rafales max ${Math.round(maxG)} km/h · aucun orage WMO signalé`;}else risk=`Aucun orage WMO signalé sur 5 j${maxG===null?"":` · rafales max ${Math.round(maxG)} km/h`}${maxP===null?"":` · pluie max ${Math.round(maxP)}%`}`;return {temperature_c:t,weather_code:c,daily,daily_summary:daily.map(x=>x.text).join(" | "),risk_level:level,electrical_risk:risk,max_gust_kmh:maxG,first_thunder:thunder};
}
  function aetherSystemWeather4086(force=false){
    const now=Date.now();if(aetherSystemState4086.weatherInflight)return aetherSystemState4086.weatherInflight;
    if(!force&&now-aetherSystemState4086.weatherAt<AETHER_WEATHER_4086.ttl){renderAetherSystem4086();return Promise.resolve(aetherSystemState4086.weather);}
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${AETHER_WEATHER_4086.latitude}&longitude=${AETHER_WEATHER_4086.longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_gusts_10m_max&hourly=weather_code,precipitation_probability,wind_gusts_10m&forecast_days=${AETHER_WEATHER_4086.days}&timezone=${encodeURIComponent(AETHER_WEATHER_4086.timezone)}`;
    aetherSystemState4086.weatherInflight=fetch(url,{cache:"no-store",headers:{Accept:"application/json"}})
      .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();})
      .then(payload=>{const forecast=aetherWeatherForecast40133(payload);aetherSystemState4086.weather=forecast;aetherSystemState4086.weatherStale=false;aetherSystemState4086.weatherAt=Date.now();return forecast;})
      .catch(()=>{aetherSystemState4086.weatherStale=Boolean(aetherSystemState4086.weather);aetherSystemState4086.weatherAt=Date.now();return aetherSystemState4086.weather;})
      .finally(()=>{aetherSystemState4086.weatherInflight=null;renderAetherSystem4086();renderAether4084();});
    return aetherSystemState4086.weatherInflight;
  }
  function aetherSystemRefresh4086({force=false}={}){
    renderAetherSystem4086();
    if(document.hidden)return Promise.resolve(false);
    return Promise.allSettled([aetherSystemBackend4086(force),aetherSystemWeather4086(force)]);
  }

  const aetherLazyState406037={marketReady:false,corePainted:false,networkScheduled:false,newsScheduled:false,reason:"boot"};
  function aetherMarketDataReady406037(){
    try{return typeof state!=="undefined"&&Array.isArray(state?.coins)&&state.coins.length>0;}catch(_){return false;}
  }
  function aetherIdle406037(callback){
    if(typeof window.requestIdleCallback==="function")return window.requestIdleCallback(()=>callback(),{timeout:1200});
    return window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>callback()));
  }
  function aetherCorePaint406037(){
    aetherLazyState406037.corePainted=true;
    renderAether4084();
    renderAetherSystem4086();
    renderAetherVeille4087();
  }
  function aetherScheduleNews406037(){
    if(aetherLazyState406037.newsScheduled)return;
    aetherLazyState406037.newsScheduled=true;
    aetherIdle406037(()=>{void aetherWakeNewsSentinel4088();});
  }
  function aetherScheduleNetwork406037({force=false}={}){
    if(aetherLazyState406037.networkScheduled||document.hidden)return;
    aetherLazyState406037.networkScheduled=true;
    aetherIdle406037(()=>{
      aetherLazyState406037.networkScheduled=false;
      Promise.resolve(aetherSystemRefresh4086({force})).finally(()=>aetherScheduleNews406037());
    });
  }
  function aetherMarkMarketReady406037(reason="market"){
    aetherLazyState406037.marketReady=true;
    aetherLazyState406037.reason=reason;
    aetherCorePaint406037();
    aetherScheduleNetwork406037({force:false});
  }
  function aetherBindOracleCompletion4088(){
    if(globalThis.__AGENT_CRYPTO_AETHER_ORACLE_RENDER_HOOK_4088__===true)return true;
    try{
      if(typeof atlasRenderOracleV0!=="function")return false;
      const base=atlasRenderOracleV0;
      atlasRenderOracleV0=function atlasRenderOracleV0Aether4088(){
        const result=base.apply(this,arguments);
        if(aetherLazyState406037.corePainted)queueMicrotask(()=>{try{renderAether4084();}catch(_){}});
        return result;
      };
      globalThis.__AGENT_CRYPTO_AETHER_ORACLE_RENDER_HOOK_4088__=true;
      return true;
    }catch(_){return false;}
  }

  function aetherBindMarketCompletion4086(){
    if(globalThis.__AGENT_CRYPTO_AETHER_MARKET_COMPLETION_HOOK_4086__===true)return true;
    try{
      if(typeof atlasAfterLivecheck!=="function")return false;
      const base=atlasAfterLivecheck;
      atlasAfterLivecheck=function atlasAfterLivecheckAether4086(options={}){
        const result=base.apply(this,arguments);
        const settle=()=>{try{aetherMarkMarketReady406037("atlasAfterLivecheck");}catch(_){}};
        if(result&&typeof result.finally==="function")result.finally(settle);else queueMicrotask(settle);
        return result;
      };
      globalThis.__AGENT_CRYPTO_AETHER_MARKET_COMPLETION_HOOK_4086__=true;
      return true;
    }catch(_){return false;}
  }


  function refreshAether({force=false}={}){
    // Explicit/manual refresh keeps the historical public API contract; automatic boot does not call it.
    aetherCorePaint406037();
    void aetherWakeNewsSentinel4088();
    return aetherSystemRefresh4086({force});
  }

  function bindAether(){
    const button=document.getElementById("atlasAetherStatusToggle4084");
    if(button&&button.dataset.aetherBound!=="1"){
      button.dataset.aetherBound="1";
      button.addEventListener("click",()=>{
        const manager=aetherNativeWindowManager406040();
        const panel=document.getElementById("atlasAetherStatusPanel4084");
        let nativeHidden=false;
        try{nativeHidden=Boolean(panel&&(panel.hidden||getComputedStyle(panel).display==='none'||panel.getClientRects().length===0));}catch(_){}
        const shouldOpen=!panel||panel.dataset?.aetherOperatorOpen406046!=="1"||nativeHidden;
        aetherPanelSet4084(shouldOpen);
      });
    }
    const quickPanel=document.getElementById("atlasAetherSystem4086");
    if(quickPanel&&quickPanel.dataset.aetherDetailBound404134!=="1"){
      quickPanel.dataset.aetherDetailBound404134="1";
      quickPanel.setAttribute("role","button");
      quickPanel.setAttribute("tabindex","0");
      quickPanel.setAttribute("aria-label","Ouvrir Aether : météo Maintenon 5 jours, risque météo, système et Atlas AUTO");
      quickPanel.setAttribute("title","Ouvrir Aether · météo 5 j · risque · système · Atlas AUTO");
      quickPanel.style.cursor="pointer";
      const openDetail404134=()=>aetherPanelSet4084(true);
      quickPanel.addEventListener("click",openDetail404134);
      quickPanel.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();openDetail404134();}});
    }
    window.addEventListener("erith:operator-priority-release",()=>{renderAether4084();renderAetherSystem4086();renderAetherVeille4087();},{passive:true});
    const feed=document.getElementById("atlasAetherVeille4087");
    if(feed&&feed.dataset.aetherNewsNavBound404292!=="1"){
      feed.dataset.aetherNewsNavBound404292="1";
      feed.setAttribute("role","button");
      feed.setAttribute("tabindex","0");
      feed.setAttribute("aria-label","Ouvrir News Sentinel · actualités françaises et anglaises qualifiées");
      feed.setAttribute("title","Ouvrir News Sentinel · FR + EN");
      feed.style.cursor="pointer";
      const openNews=()=>{
        const details=document.getElementById("news-sentinel");
        if(!details)return false;
        const activeEvent=aetherVeilleState4087.last?.event||null;
        const activeId=String(activeEvent?.id||activeEvent?.event_id||activeEvent?.fingerprint||"").trim();
        try{details.open=true;}catch(_){}
        if(activeId&&typeof newsSelectLiveEvent==="function"){try{newsSelectLiveEvent(activeId);}catch(_){}}
        requestAnimationFrame(()=>{
          let target=null;
          if(activeId){
            try{target=[...document.querySelectorAll("[data-live-news-id]")].find(node=>String(node?.dataset?.liveNewsId||"")===activeId)?.closest(".news-live-item")||null;}catch(_){}
          }
          try{(target||details).scrollIntoView({behavior:"smooth",block:target?"center":"start"});}catch(_){try{(target||details).scrollIntoView();}catch(__){}}
        });
        try{details.dispatchEvent(new CustomEvent("erith:aether-news-open",{bubbles:true,detail:{build:"40.4.303",source:"aether-veille",event_id:activeId||null}}));}catch(_){}
        return true;
      };
      feed.addEventListener("click",openNews);
      feed.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();openNews();}});
    }
    if(feed&&feed.dataset.aetherFeedPulseBound40120!=="1"){
      feed.dataset.aetherFeedPulseBound40120="1";
      feed.addEventListener("animationiteration",event=>{
        if(event.target!==feed||event.animationName!=="atlasAetherFeedPulse40112"||document.hidden)return;
        const style=getComputedStyle(feed);
        const visible=style.visibility==="visible"&&Number.parseFloat(style.opacity||"0")>.5;
        if(visible){
          // 40.4.131 — first visible pulse arms the batch; story 1 keeps its full reading slot.
          if(!aetherVeilleState4087.feedWasVisible){
            aetherVeilleState4087.feedWasVisible=true;
            return;
          }
          aetherVeilleAdvance4087();
        }else if(aetherVeilleState4087.feedWasVisible){
          aetherVeilleState4087.feedWasVisible=false;
          aetherVeilleState4087.kind="alert";
          aetherVeilleState4087.storyEvent=null;
          aetherVeilleState4087.storyContext=null;
          aetherVeilleState4087.fingerprint="";
          renderAetherVeille4087();
        }
      },{passive:true});
    }
    aetherBindMarketCompletion4086();
    aetherBindOracleCompletion4088();
    // 40.6.37: do not wake Aether/Weather/News on DOMContentLoaded. Market/graph gets first useful paint.
    if(aetherMarketDataReady406037())aetherMarkMarketReady406037("state-ready");
    else window.addEventListener("load",()=>{if(aetherMarketDataReady406037())aetherMarkMarketReady406037("window-load-ready");},{once:true,passive:true});
  }

  const api=Object.freeze({
    build:"40.4.139",
    backend:AETHER_SYSTEM_BACKEND_4086,
    weather:"Maintenon · Eure-et-Loir",
    refresh:refreshAether,
    pulse:()=>refreshAether(),
    snapshot:()=>Object.freeze({
      status:aetherSnapshot4084(),
      system:aetherSystemState4086.system,
      weather:aetherSystemState4086.weather,
      system_at:aetherSystemState4086.systemAt,
      weather_at:aetherSystemState4086.weatherAt,
      veille:aetherVeilleState4087.last||aetherVeilleCurrent4087()
    }),
    single_lane:true,
    presentation_owner:"admin-ribbons.css",
    new_recurring_timer:false,
    bridge_telemetry_owner:false,
    telemetry_null_is_zero:false,
    market_completion_refresh:true,
    veille_owner:"News Sentinel state (read-only) via existing loadNewsLiveFeed owner",
    veille_top:AETHER_VEILLE_TOP_4087,
    veille_new_timer:false,
    veille_feed_pulse_seconds:18,
    veille_alert_context_pairing:false,
    veille_same_event_context:true,
    veille_new_fetch:false,
    veille_existing_owner_wake:true,
    info_operator_synthesis:true,
    oracle_render_refresh:true,
    cadence_seconds:270,
    normal_seconds:30,
    info_seconds:15,
    veille_seconds:216,
    system_seconds:9,
    veille_full_batch_before_system:true,
    veille_first_visible_pulse_advances:false,
    veille_marquee_phase_synced:true,
    veille_marquee_constant_speed_px_s:AETHER_MARQUEE_SPEED_PX_S_40121,
    info_operator_fact_cells:true,
    explanatory_context_owner:"AtlasNewsToMarketOperatorIntelligence40235 (read-only compute)",
    explanatory_context_alternation:false,
    explanatory_context_new_fetch:false,
    explanatory_context_new_timer:false,
    explanatory_context_causal_claim:false,
    operator_disclaimer_segments:false,
    operator_non_conclusion_segments:false,
    context_label_deduplicated:true,
    news_display_language:"Bilingual operator lane; native FR preferred; qualified EN explicit [EN]",
    news_source_original_headline_first:false,
    news_translation_contract_schema:"atlas_news_native_fr_v1",
    news_translation_contract_build:"40.4.291",
    news_french_operator_lane_build:"40.4.291",
    news_bilingual_operator_lane_build:"40.4.292",
    news_aether_french_operator_summary_build:"40.4.301",
    news_aether_english_raw_headline_visible:false,
    news_aether_english_summary_source:"structured canonical metadata only",
    news_aether_english_original_location:"News Sentinel",
    news_aether_operator_context_build:"40.4.303",
    news_aether_exact_event_navigation:true,
    news_aether_semantic_family_dataset:true,
    news_aether_criticality_dataset:true,
    news_rejected_english_archive_preserved:true,
    news_rejected_english_operator_rotation:true,
    news_browser_editorial_repair:false,
    news_machine_translation:false,
    news_source_policy:"native French first; English archive evidence only; zero paid provider; zero external secret",
    news_translation_preferred:"display_headline only when native-French contract 40.4.291/v1 is current AND display_language=fr; explicit [EN] source remains archive-only",
    news_translation_story_owner:"News Sentinel owns the original/display headline; Aether keeps native FR verbatim and renders deterministic French metadata summaries for EN fallback",
    consumer_must_not_fallback_silently_to_headline:true,
    news_feed_news_only_rotation:true,
    news_feed_context_interleave:false,
    news_feed_ranked_story_count:12,
    news_feed_click_opens_news_sentinel:true,
    news_feed_selection:"representative digest: priority anchor + distinct recent families",
    news_feed_family_order:"macro + institutional + regulation + leverage + security + market",
    news_feed_source_diversity_tiebreak:true,
    news_feed_recent_family_window_days:7,
    news_feed_pool_union:"canonical newsFeedState.payload.events only",
    news_feed_primary_pool:"newsFeedState.payload.events",
    news_feed_canonical_headline_required:true,
    news_feed_derived_rows_reading_fallback_only:false,
    news_feed_derived_rows_can_displace_canonical_story:false,
    news_feed_unique_before_limit:true,
    news_feed_unique_tokens:"canonical id + merged ids + source URL + display_headline + raw headline",
    news_feed_truthful_total:true,
    news_feed_story_detail:"headline + source",
    news_feed_cursor_persists_between_windows:true,
    info_semantic_owners:"Atlas + Oracle + Sources + Book",
    info_global_marquee:false,
    info_news_preview:false,
    news_translation_context_keeps_headline:true,
    news_translation_compact_headline_first:true,
    news_translation_fallback:"producer quality rejection → labelled [EN] canonical original",
    news_translation_browser_runtime:false,
    news_translation_raw_english_in_aether:"false since 40.4.301; qualified EN evidence remains accessible in News Sentinel",
    news_source_original_preserved_not_display_owner:true,
    news_display_contract_build:"40.4.288",
    weather_forecast_days:5,
    weather_storm_warning:true,
    weather_high_gust_warning_kmh:70,
    aether_attention_operator_watch:true,
    aether_attention_event_timeline:true,
    aether_attention_event_timeline_build:"40.6.27",
    aether_attention_compact_watch:true,
    aether_attention_compact_watch_build:"40.6.28",
    aether_attention_timeline_preview:3,
    aether_attention_native_disclosures:true,
    aether_attention_normal_state_no_permanent_scrollbar:true,
    aether_attention_compact_new_timer:false,
    aether_attention_compact_new_storage:false,
    aether_attention_compact_new_network_owner:false,
    aether_attention_first_glance:true,
    aether_attention_first_glance_build:"40.6.30",
    aether_attention_large_text:true,
    aether_attention_weather_first_glance:true,
    aether_attention_single_detail_zone:true,
    aether_attention_focus_modes:"glance|history|details",
    aether_attention_panel_resets_to_glance_on_open:true,
    aether_attention_first_glance_new_timer:false,
    aether_attention_first_glance_new_storage:false,
    aether_attention_first_glance_new_network_owner:false,
    aether_attention_graph_first_lazy:true,
    aether_attention_graph_first_lazy_build:"40.6.37",
    aether_attention_floating_workbench:true,
    aether_attention_floating_workbench_build:"40.6.39",
    aether_attention_native_window_manager:true,
    aether_attention_native_window_build:"40.6.40",
    aether_attention_native_window_id:"aether-watch",
    aether_attention_native_window_direct_fixed:true,
    aether_attention_native_window_controls:"move|minimize|dock|maximize|hide",
    aether_attention_native_window_default:"floating-hidden",
    aether_attention_native_window_geometry_persistence:"existing-admin-window-manager",
    aether_attention_native_window_fullscreen_path:"native maximize 97vw x 97vh / Firefox F11 viewport",
    aether_attention_component_foundation:true,
    aether_attention_component_foundation_build:"40.6.42",
    aether_attention_component_layout:"responsive-grid",
    aether_attention_backplate_geometry_owner:false,
    aether_attention_information_cards_structured:true,
    aether_attention_final_wide_textless_background_pending:true,
    aether_attention_workbench_lazy_script:true,
    aether_attention_workbench_modes:"events|history|details",
    aether_attention_workbench_local_drag:true,
    aether_attention_workbench_local_maximize:true,
    aether_attention_workbench_focus_scrim:true,
    aether_attention_workbench_above_observatory:true,
    aether_attention_workbench_readability_lock:true,
    aether_attention_workbench_storage:false,
    aether_attention_workbench_global_window_manager:false,
    aether_attention_boot_order:"market_graph -> aether_core -> system_weather -> news_history_on_demand",
    aether_attention_boot_eager_refresh:false,
    aether_attention_history_dom_lazy:true,
    aether_attention_details_dom_lazy:true,
    aether_attention_new_recurring_timer:false,
    aether_attention_timeline_max:8,
    aether_attention_timeline_persistence:"runtime-session-only",
    aether_attention_timeline_new_timer:false,
    aether_attention_timeline_new_storage:false,
    aether_attention_timeline_new_network_owner:false,
    timeline:()=>aetherTimelineState406027.entries.map(row=>Object.freeze({...row})),
    aether_attention_new_timer:false,
    aether_attention_new_network_owner:false,
    news_translation_canonical_original_untouched:true,
    news_translation_canonical_original_preserved:true
  });
  globalThis.AgentCryptoAether=api;
  /* Compatibility read-only alias for diagnostics that knew the R6/R7 object. */
  globalThis.AgentCryptoAetherSystem4086=api;

  /* 40.6.40 — DOM shell preseed only. This runs before app.js initializes the
     canonical Administrator Window Manager. No Aether data, weather, news or
     history hydration is started here; 40.6.37 graph-first scheduling remains intact. */
  try{aetherPanelEnsure4084();}catch(_){}


  /* 40.6.46 — CLEAN REBUILD · TRUE EXPLICIT OPEN. Geometry may be restored; visibility never is. */
  function aetherBootClosed406046(){
    const panel=document.getElementById("atlasAetherStatusPanel4084");
    const button=document.getElementById("atlasAetherStatusToggle4084");
    if(panel)panel.dataset.aetherOperatorOpen406046="0";
    if(button)button.setAttribute("aria-expanded","false");
    const manager=aetherNativeWindowManager406040();
    if(manager){
      if(panel)panel.hidden=false;
      manager.hide('aether-watch',true);
      return true;
    }
    if(panel)panel.hidden=true;
    return false;
  }
  window.addEventListener("erith:administrator-mirror-ready",aetherBootClosed406046,{once:true});
  window.addEventListener("pageshow",event=>{if(event.persisted)aetherBootClosed406046();},{passive:true});

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bindAether,{once:true});
  else bindAether();
})();
