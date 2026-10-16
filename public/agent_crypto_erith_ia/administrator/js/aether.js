/*
  Agent-Crypto Administrator — Aether runtime
  Responsibility: Aether status synthesis + read-only system/weather/BTC values.
  Presentation/animation belongs to admin-ribbons.css.
  Build: 40.6.425
  Revision: 40.6.425 Aether Single Phase Owner. One JavaScript state machine owns INFO → 12 News → SYSTEM; the native menu is manual-only after Aether exposure, eliminating multi-clock blank seams.
*/
(() => {
  "use strict";
  const AETHER_SURFACE=String(document.documentElement.dataset.agentCryptoSurface||"administrator");
  const AETHER_RIBBON_ENABLED=AETHER_SURFACE!=="trader";
  if(!AETHER_RIBBON_ENABLED){
    document.documentElement.dataset.aetherRibbonLoaded="0";
    document.documentElement.dataset.aetherRibbonPolicy="disabled";
  }
  function aetherText(id,fallback="—"){const n=document.getElementById(id);const v=String(n?.textContent||"").replace(/\s+/g," ").trim();return v||fallback;}
  function aetherCurrent(){try{return typeof atlasCurrentStateRead==="function"?(atlasCurrentStateRead()||null):null;}catch(_){return null;}}
  const AETHER_VEILLE_TOP=12;
  const AETHER_MARQUEE_SPEED_PX_S=72;
  const AETHER_MARQUEE_MIN_OVERFLOW_PX=48;
  const AETHER_MARQUEE_DELAY_S=0.55;
  const AETHER_PHASE_INFO_MS=15000;
  const AETHER_PHASE_NEWS_MS=18000;
  const AETHER_PHASE_SYSTEM_MS=9000;
  const aetherVeilleState={
    index:0,kind:"alert",fingerprint:"",viewportWidth:0,last:null,storyEvent:null,storyContext:null,feedWasVisible:false,
    batch:[],batchKeys:[],batchId:0,batchStartedAt:0,batchCompleted:false,batchReason:"boot",
    batchRenderLog:[],batchVisibleLog:[],batchReadCompleteLog:[],
    cadencePaused:false,visibilityPauses:0,lastVisibilityReason:"boot"
  };
  const AETHER_NEWS_SET_MIN_EVENTS=12;
  const aetherExposureState={newsSetReady:false,exposed:false,exposedAt:0,reason:"boot",status:"idle",events:0};
  const aetherPhaseState={
    phase:"native",suspendedPhase:"info",started:false,timer:0,deadline:0,remaining:0,nextAction:"",
    hiddenPaused:false,manualPaused:false,generation:0,transitions:0,lastReason:"boot",lastTransitionAt:0
  };
  // 40.6.386 — entity truth guard. LINK is an ambiguous English word/company token.
  // Trust it as the Chainlink asset only when the canonical story contains an explicit Chainlink anchor.
  // This prevents regulatory stories such as "OTC Link LLC" from entering Aether as false LINK crypto alerts.
  function aetherVeilleTrustedAssets(event){
    const canonical=aetherNewsCanonicalEvent(event)||event||{};
    const assets=(Array.isArray(canonical?.assets)?canonical.assets:[]).map(v=>String(v||"").trim().toUpperCase()).filter(Boolean);
    const headline=String(canonical?.headline_original||canonical?.headline||canonical?.display_headline||canonical?.event_label||"").toLowerCase();
    return assets.filter(symbol=>symbol!=="LINK"||/(?:\\bchainlink\\b|\\blink token\\b|\\$link\\b)/i.test(headline));
  }
  function aetherVeilleOperatorEligible(event){
  const canonical=aetherNewsCanonicalEvent(event)||event||{};
  // 40.6.418 — producer relevance gate is authoritative when present.
  // The historical local guard remains as a backward-compatible second line of defense.
  if(canonical?.operator_relevance?.eligible===false)return false;
  const assets=aetherVeilleTrustedAssets(canonical);
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
function aetherNewsCanonicalEvent(event){
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
  function aetherNewsContractReady(event){
    return String(event?.translation_contract_build||"")==="40.4.291"
      && String(event?.translation_contract_schema||"")==="atlas_news_native_fr_v1"
      && Boolean(String(event?.display_headline||"").trim());
  }
  function aetherNewsOperatorReady(event){
    if(!aetherNewsContractReady(event))return false;
    const language=String(event?.display_language||"").trim().toLowerCase();
    const status=String(event?.translation_status||"").trim().toUpperCase();
    const display=String(event?.display_headline||"").replace(/\s+/g," ").trim();
    if(!display)return false;
    if(language==="fr"&&status==="ORIGINAL_FR"&&!/^\[EN\]\s/i.test(display))return true;
    if(language==="en"&&status==="FALLBACK_ORIGINAL"&&/^\[EN\]\s/i.test(display))return true;
    return false;
  }
  function aetherVeilleLanguageWeight(event){
    const language=String(event?.display_language||"").trim().toLowerCase();
    return language==="fr"?120:0; // French-first preference, never an exclusion of qualified English evidence.
  }
  function aetherNewsDisplayHeadline(event,fallback="Événement à qualifier"){
    const canonical=aetherNewsCanonicalEvent(event)||event||{};
    // 40.4.291 — Aether never translates. Native French is operator-visible; English remains explicit archive evidence.
    if(aetherNewsContractReady(canonical)){
      const value=String(canonical.display_headline||"").replace(/\s+/g," ").trim();
      const status=String(canonical?.translation_status||"");
      if(status==="FALLBACK_ORIGINAL"||status==="TRANSLATION_REJECTED")return value.startsWith("[EN] ")?value:`[EN] ${value}`;
      return value||fallback;
    }
    const original=String(canonical?.headline_original||canonical?.headline||"").replace(/\s+/g," ").trim();
    return original?`[EN] ${original}`:fallback;
  }
  function aetherNewsFamilyLabelFr(event){
    const family=aetherVeilleFamily(event);
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
  function aetherNewsOperatorSummaryFr(event,fallback="Actualité qualifiée"){
    const canonical=aetherNewsCanonicalEvent(event)||event||{};
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
    return eventLabel||aetherNewsFamilyLabelFr(canonical)||fallback;
  }
  function aetherNewsOperatorDisplay(event,fallback="Actualité qualifiée"){
    return aetherNewsOperatorSummaryFr(event,fallback);
  }

  function aetherFrenchMechanismLabel(value){
    const label=String(value||"").replace(/\s+/g," ").trim();
    if(/^SHORT SQUEEZE \/ LIQUIDATIONS$/i.test(label))return "LIQUIDATIONS DE POSITIONS VENDEUSES";
    if(/^LONG SQUEEZE \/ LIQUIDATIONS$/i.test(label))return "LIQUIDATIONS DE POSITIONS ACHETEUSES";
    return label;
  }
  const aetherVeilleNumber=value=>{const n=Number(value);return Number.isFinite(n)?n:0;};
  function aetherVeilleTimestamp(event){
    try{if(typeof newsFeedEventTimestamp==="function")return Number(newsFeedEventTimestamp(event)||0);}catch(_){}
    const parsed=Date.parse(event?.event_time||event?.published_at||event?.updated_at||event?.last_seen_at||"");
    return Number.isFinite(parsed)?parsed:0;
  }
  function aetherVeilleFreshnessWeight(event){
    const ts=aetherVeilleTimestamp(event);if(!ts)return 0;
    const hours=Math.max(0,(Date.now()-ts)/3600000);
    if(hours<2)return 90;if(hours<12)return 70;if(hours<48)return 50;if(hours<168)return 20;return 0;
  }
  function aetherVeilleDecisionWeight(event){
    const action=String(event?.decision?.action||"").toLowerCase(),tone=String(event?.decision?.tone||"").toLowerCase();
    let score=/alerte prioritaire/.test(action)?500:/surveillance renforc/.test(action)?360:/attendre.*source|vérifier|verifier/.test(action)?300:/archiver/.test(action)?60:140;
    if(tone==="danger")score+=120;else if(tone==="warn")score+=60;else if(tone==="ok")score+=20;
    return score;
  }
  function aetherVeilleContextWeight(event){
    const assets=(Array.isArray(event?.assets)?event.assets:[]).map(v=>String(v||"").toUpperCase());
    const sectors=(Array.isArray(event?.sectors)?event.sectors:[]).map(v=>String(v||"").toLowerCase());
    const active=`${aetherText("selectedAssetTitle","")} ${aetherText("atlasOracleAsset","")}`.toUpperCase();
    const top5=new Set(["BTC","ETH","BNB","XRP","SOL"]);
    let score=assets.some(symbol=>symbol&&active.includes(symbol))?80:0;
    if(assets.some(symbol=>top5.has(symbol)))score+=40;
    if(sectors.some(value=>value.includes("marché global")||value.includes("marche global")))score+=35;
    return score;
  }
  function aetherVeilleRank(event){
    return aetherVeilleDecisionWeight(event)
      +aetherVeilleNumber(event?.impact?.score)*10
      +aetherVeilleNumber(event?.evidence?.score)*2
      +Math.min(30,Math.max(0,aetherVeilleNumber(event?.source_count))*5)
      +aetherVeilleFreshnessWeight(event)
      +aetherVeilleContextWeight(event)
      +aetherVeilleLanguageWeight(event);
  }
  function aetherVeilleStoryTokens(event){
    const canonical=aetherNewsCanonicalEvent(event)||event||{};
    const tokens=[];
    const push=(prefix,value)=>{const v=String(value||"").replace(/\s+/g," ").trim().toLowerCase();if(v)tokens.push(`${prefix}:${v}`);};
    push("id",canonical?.event_id||canonical?.id||canonical?.fingerprint);
    for(const id of (Array.isArray(canonical?.merged_event_ids)?canonical.merged_event_ids:[]))push("id",id);
    push("url",canonical?.source_url);
    push("fr",aetherNewsDisplayHeadline(canonical,""));
    push("raw",canonical?.headline||canonical?.event_label);
    return [...new Set(tokens)];
  }
  function aetherVeilleFamily(event){
    const canonical=aetherNewsCanonicalEvent(event)||event||{};
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
  function aetherVeilleEvents(){
    const events=[];
    const addPool=pool=>{if(!Array.isArray(pool))return;for(const event of pool)if(event)events.push(event);};
    try{
      if(typeof newsFeedState!=="undefined"){
        const canonicalAll=(Array.isArray(newsFeedState?.payload?.events)?newsFeedState.payload.events:[])
          .filter(aetherNewsContractReady)
          .filter(aetherNewsOperatorReady);
        const canonical=canonicalAll.filter(aetherVeilleOperatorEligible);
        // 40.4.292 — bilingual operator lane: native French is preferred by rank,
        // qualified English evidence remains explicit [EN] and fills the lane instead of disappearing.
        // Aether never translates either language and never mutates the canonical News archive.
        if(canonical.length)addPool(canonical);
      }
    }catch(_){}
    const ranked=events.map((event,order)=>({event,order,rank:aetherVeilleRank(event),time:aetherVeilleTimestamp(event)})).sort((a,b)=>b.rank-a.rank||b.time-a.time||a.order-b.order);
    const canonicalRows=[];const seenTokens=new Set();
    for(const row of ranked){
      const tokens=aetherVeilleStoryTokens(row.event);
      if(tokens.length&&tokens.some(token=>seenTokens.has(token)))continue;
      tokens.forEach(token=>seenTokens.add(token));
      canonicalRows.push({...row,family:aetherVeilleFamily(row.event)});
    }
    if(!canonicalRows.length)return [];
    const sevenDays=Date.now()-7*24*60*60*1000;
    const recent=canonicalRows.filter(row=>!row.time||row.time>=sevenDays);
    const pool=recent.length>=AETHER_VEILLE_TOP?recent:canonicalRows;
    const chosen=[];const usedEvents=new Set();const usedFamilies=new Set();const usedSources=new Set();
    const key=row=>String(row?.event?.event_id||row?.event?.id||row?.event?.fingerprint||row?.order);
    const source=row=>String(row?.event?.source_host||row?.event?.source_name||"").toLowerCase();
    const take=row=>{if(!row||usedEvents.has(key(row)))return false;chosen.push(row);usedEvents.add(key(row));if(row.family)usedFamilies.add(row.family);if(source(row))usedSources.add(source(row));return true;};
    const anchor24=pool.find(row=>row.time&&row.time>=Date.now()-24*60*60*1000)||pool[0];
    take(anchor24);
    const preferred=["macro","institutional","regulation","leverage","security","market"];
    for(const family of preferred){
      if(chosen.length>=AETHER_VEILLE_TOP)break;
      if(usedFamilies.has(family))continue;
      const candidates=pool.filter(row=>row.family===family&&!usedEvents.has(key(row)));
      const diverse=candidates.find(row=>!source(row)||!usedSources.has(source(row)))||candidates[0];
      take(diverse);
    }
    for(const row of pool){
      if(chosen.length>=AETHER_VEILLE_TOP)break;
      if(usedEvents.has(key(row)))continue;
      if(usedFamilies.has(row.family)&&source(row)&&usedSources.has(source(row)))continue;
      take(row);
    }
    for(const row of pool){if(chosen.length>=AETHER_VEILLE_TOP)break;take(row);}
    return chosen.slice(0,AETHER_VEILLE_TOP).map(row=>row.event);
  }

  /* 40.6.422 — AETHER 12/12 BATCH TRUTH
     The live archive may refresh and re-rank at any time, but one VEILLE window owns one immutable
     list of story identities. A moving rank can no longer turn cursor N into another story. */
  function aetherVeilleEventKey(event,index=0){
    const canonical=aetherNewsCanonicalEvent(event)||event||{};
    const raw=canonical?.event_id||canonical?.id||canonical?.fingerprint||canonical?.source_url||canonical?.url
      ||canonical?.display_headline||canonical?.headline_original||canonical?.headline||`row-${index}`;
    return String(raw||`row-${index}`).replace(/\s+/g," ").trim().toLowerCase();
  }
  function aetherVeilleBatchPublish(){
    const total=aetherVeilleState.batch.length;
    const rendered=aetherVeilleState.batchRenderLog.length;
    const renderedUnique=new Set(aetherVeilleState.batchRenderLog).size;
    const visible=aetherVeilleState.batchVisibleLog.length;
    const visibleUnique=new Set(aetherVeilleState.batchVisibleLog).size;
    const readingComplete=aetherVeilleState.batchReadCompleteLog.length;
    const readingCompleteSet=new Set(aetherVeilleState.batchReadCompleteLog);
    const readingCompleteUnique=readingCompleteSet.size;
    // 40.6.423 — duplicates are measured from actual visible slot starts.
    // They are never removed before counting.
    const duplicates=Math.max(0,visible-visibleUnique);
    const complete=total>0&&aetherVeilleState.batchKeys.every(key=>key&&readingCompleteSet.has(key));
    aetherVeilleState.batchCompleted=complete;
    const host=document.getElementById("atlasAetherVeille");
    const root=document.documentElement;
    const values={
      aetherBatchId:String(aetherVeilleState.batchId),
      aetherBatchIndex:String(total?Math.min(total,aetherVeilleState.index+1):0),
      aetherBatchTotal:String(total),
      aetherBatchRendered:String(rendered),
      aetherBatchRenderedUnique:String(renderedUnique),
      aetherBatchVisible:String(visible),
      aetherBatchVisibleUnique:String(visibleUnique),
      aetherBatchReadComplete:String(readingComplete),
      aetherBatchReadCompleteUnique:String(readingCompleteUnique),
      // compatibility names now map to visible truth, not selection truth.
      aetherBatchDisplayed:String(visible),
      aetherBatchUnique:String(visibleUnique),
      aetherBatchDuplicates:String(duplicates),
      aetherBatchComplete:complete?"1":"0"
    };
    if(host)for(const [key,value] of Object.entries(values))host.dataset[key]=value;
    if(root){
      root.dataset.aetherVeilleBatch=`${readingCompleteUnique}/${total}`;
      root.dataset.aetherVeilleBatchComplete=complete?"1":"0";
      root.dataset.aetherVeilleBatchDuplicates=String(duplicates);
      root.dataset.aetherVeilleRendered=String(renderedUnique);
      root.dataset.aetherVeilleVisible=String(visibleUnique);
      root.dataset.aetherVeilleReadComplete=String(readingCompleteUnique);
    }
    return Object.freeze({
      id:aetherVeilleState.batchId,total,rendered,rendered_unique:renderedUnique,
      visible,visible_unique:visibleUnique,reading_complete:readingComplete,
      reading_complete_unique:readingCompleteUnique,displayed:visible,unique:visibleUnique,
      duplicates,complete,index:aetherVeilleState.index,reason:aetherVeilleState.batchReason
    });
  }
  function aetherVeilleBatchLog(kind,index=aetherVeilleState.index){
    const key=aetherVeilleState.batchKeys[index]||"";
    if(!key)return aetherVeilleBatchPublish();
    if(kind==="rendered")aetherVeilleState.batchRenderLog.push(key);
    else if(kind==="visible")aetherVeilleState.batchVisibleLog.push(key);
    else if(kind==="reading-complete")aetherVeilleState.batchReadCompleteLog.push(key);
    return aetherVeilleBatchPublish();
  }
  function aetherVeilleBatchRenderRecord(current){
    if(!current||current.kind!=="alert"||!current.event)return aetherVeilleBatchPublish();
    return aetherVeilleBatchLog("rendered",Number.isFinite(Number(current.index))?Number(current.index):aetherVeilleState.index);
  }
  function aetherVeilleBatchVisibleRecord(index=aetherVeilleState.index){
    return aetherVeilleBatchLog("visible",index);
  }
  function aetherVeilleBatchReadCompleteRecord(index=aetherVeilleState.index){
    return aetherVeilleBatchLog("reading-complete",index);
  }
  function aetherVeilleBatchStart(reason="batch-start"){
    const events=aetherVeilleEvents().slice(0,AETHER_VEILLE_TOP);
    aetherVeilleState.batch=events;
    aetherVeilleState.batchKeys=events.map((event,index)=>aetherVeilleEventKey(event,index));
    aetherVeilleState.batchId+=1;
    aetherVeilleState.batchStartedAt=Date.now();
    aetherVeilleState.batchCompleted=false;
    aetherVeilleState.batchRenderLog=[];
    aetherVeilleState.batchVisibleLog=[];
    aetherVeilleState.batchReadCompleteLog=[];
    aetherVeilleState.batchReason=reason;
    aetherVeilleState.index=0;
    aetherVeilleState.kind="alert";
    aetherVeilleState.storyEvent=null;
    aetherVeilleState.storyContext=null;
    aetherVeilleState.fingerprint="";
    aetherVeilleBatchPublish();
    return events;
  }
  function aetherVeilleBatchEvents(){
    return aetherVeilleState.batch.length?aetherVeilleState.batch:aetherVeilleBatchStart("lazy-batch");
  }
  function aetherVeilleBatchSnapshot(){
    const published=aetherVeilleBatchPublish();
    return Object.freeze({
      ...published,
      expected:AETHER_VEILLE_TOP,
      keys:Object.freeze([...aetherVeilleState.batchKeys]),
      rendered_keys:Object.freeze([...aetherVeilleState.batchRenderLog]),
      visible_keys:Object.freeze([...aetherVeilleState.batchVisibleLog]),
      reading_complete_keys:Object.freeze([...aetherVeilleState.batchReadCompleteLog]),
      started_at:aetherVeilleState.batchStartedAt||0,
      cadence_paused:aetherVeilleState.cadencePaused,
      visibility_pauses:aetherVeilleState.visibilityPauses,
      visibility_reason:aetherVeilleState.lastVisibilityReason
    });
  }
  /* 40.6.425 — AETHER MENU ESCAPE / CONTINUITY RECOVERY
     One state machine still owns the visible lane and its single pending deadline.
     Hidden tabs preserve remaining duration. Manual ♥ VEILLE now only shows the native menu:
     it does not pause or destroy the canonical deadline, so Aether resumes automatically. */
  function aetherPhaseBar(){return document.getElementById("livecheck");}
  function aetherPhasePaused(){return aetherPhaseState.hiddenPaused||aetherPhaseState.manualPaused;}
  function aetherPhaseClearTimer(){
    if(aetherPhaseState.timer){clearTimeout(aetherPhaseState.timer);aetherPhaseState.timer=0;}
    aetherPhaseState.deadline=0;
  }
  function aetherPhaseApply(phase,reason="phase"){
    const bar=aetherPhaseBar(),root=document.documentElement;
    if(!AETHER_RIBBON_ENABLED){
      if(bar){
        bar.dataset.aetherPhase="native";
        bar.dataset.aetherPhaseOwner="trader-disabled";
        bar.dataset.aetherPhaseReason="trader-ribbon-disabled";
      }
      if(root)root.dataset.aetherPhase="native";
      const ribbon=document.getElementById("atlasAetherRibbon");
      if(ribbon)ribbon.setAttribute("aria-hidden","true");
      return "native";
    }
    aetherPhaseState.phase=phase;
    aetherPhaseState.lastReason=reason;
    aetherPhaseState.lastTransitionAt=Date.now();
    aetherPhaseState.transitions+=1;
    if(bar){
      bar.dataset.aetherPhase=phase;
      bar.dataset.aetherPhaseOwner="40.6.425";
      bar.dataset.aetherPhaseReason=reason;
      if(phase!=="native"){
        delete bar.dataset.aetherMenuEscape;
        delete bar.dataset.aetherManualNative;
      }
    }
    if(root){
      root.dataset.aetherPhase=phase;
      root.dataset.aetherPhaseOwner="40.6.425";
    }
    const ribbon=document.getElementById("atlasAetherRibbon");
    if(ribbon)ribbon.setAttribute("aria-hidden",phase==="native"?"true":"false");
    if(phase==="info")aetherCorePaint();
    else if(phase==="veille")renderAetherVeille();
    else if(phase==="system")renderAetherSystem();
    return phase;
  }
  function aetherPhaseDispatch(action){
    if(aetherPhasePaused())return false;
    if(action==="start-veille")return aetherPhaseEnterVeille("deadline-info");
    if(action==="next-veille")return aetherPhaseCompleteVeilleSlot();
    if(action==="start-info")return aetherPhaseEnterInfo("deadline-system");
    return false;
  }
  function aetherPhaseSchedule(ms,action){
    if(!AETHER_RIBBON_ENABLED)return false;
    aetherPhaseClearTimer();
    aetherPhaseState.remaining=Math.max(0,Number(ms)||0);
    aetherPhaseState.nextAction=String(action||"");
    if(aetherPhasePaused()||!aetherPhaseState.nextAction)return false;
    const generation=++aetherPhaseState.generation;
    aetherPhaseState.deadline=performance.now()+aetherPhaseState.remaining;
    aetherPhaseState.timer=window.setTimeout(()=>{
      if(generation!==aetherPhaseState.generation||aetherPhasePaused())return;
      aetherPhaseState.timer=0;
      aetherPhaseState.deadline=0;
      aetherPhaseState.remaining=0;
      aetherPhaseDispatch(aetherPhaseState.nextAction);
    },aetherPhaseState.remaining);
    return true;
  }
  function aetherPhasePause(reason="hidden"){
    if(!aetherPhasePaused()&&aetherPhaseState.timer&&aetherPhaseState.deadline>0){
      aetherPhaseState.remaining=Math.max(0,aetherPhaseState.deadline-performance.now());
    }
    if(reason==="manual")aetherPhaseState.manualPaused=true;
    else aetherPhaseState.hiddenPaused=true;
    aetherPhaseState.generation+=1;
    aetherPhaseClearTimer();
    return true;
  }
  function aetherPhaseResume(reason="visible"){
    if(reason==="manual")aetherPhaseState.manualPaused=false;
    else aetherPhaseState.hiddenPaused=false;
    if(aetherPhasePaused())return false;
    if(aetherPhaseState.nextAction){
      if(aetherPhaseState.remaining>0)return aetherPhaseSchedule(aetherPhaseState.remaining,aetherPhaseState.nextAction);
      return aetherPhaseDispatch(aetherPhaseState.nextAction);
    }
    return true;
  }
  function aetherPhaseEnterInfo(reason="cycle"){
    if(!aetherExposureState.exposed)return aetherPhaseApply("native","not-exposed");
    aetherVeilleState.feedWasVisible=false;
    aetherPhaseApply("info",reason);
    aetherPhaseSchedule(AETHER_PHASE_INFO_MS,"start-veille");
    return true;
  }
  function aetherPhaseEnterVeille(reason="cycle"){
    if(!aetherExposureState.exposed)return false;
    aetherVeilleBatchStart("single-phase-cycle");
    aetherVeilleState.index=0;
    aetherVeilleState.feedWasVisible=true;
    aetherVeilleState.fingerprint="";
    const current=renderAetherVeille();
    aetherPhaseApply("veille",reason);
    if(current?.kind==="alert")aetherVeilleBatchVisibleRecord(0);
    aetherPhaseSchedule(AETHER_PHASE_NEWS_MS,"next-veille");
    return true;
  }
  function aetherPhaseCompleteVeilleSlot(){
    const ranked=aetherVeilleBatchEvents();
    if(!ranked.length)return aetherPhaseEnterSystem("empty-batch");
    aetherVeilleBatchReadCompleteRecord(aetherVeilleState.index);
    if(aetherVeilleState.index<ranked.length-1){
      const next=aetherVeilleAdvance();
      if(next?.kind==="alert")aetherVeilleBatchVisibleRecord(aetherVeilleState.index);
      aetherPhaseSchedule(AETHER_PHASE_NEWS_MS,"next-veille");
      return true;
    }
    aetherVeilleState.feedWasVisible=false;
    aetherVeilleBatchPublish();
    return aetherPhaseEnterSystem("batch-complete");
  }
  function aetherPhaseEnterSystem(reason="cycle"){
    aetherPhaseApply("system",reason);
    aetherPhaseSchedule(AETHER_PHASE_SYSTEM_MS,"start-info");
    return true;
  }
  function aetherPhaseStart(reason="start"){
    if(!AETHER_RIBBON_ENABLED)return false;
    if(!aetherExposureState.exposed)return false;
    if(aetherPhaseState.started)return true;
    aetherPhaseState.started=true;
    aetherPhaseState.hiddenPaused=document.hidden===true;
    aetherPhaseState.manualPaused=false;
    return aetherPhaseEnterInfo(reason);
  }
  function aetherPhaseHoldNative(reason="operator"){
    if(!aetherExposureState.exposed)return false;
    const current=aetherPhaseState.phase;
    if(current!=="native")aetherPhaseState.suspendedPhase=current;
    const bar=aetherPhaseBar();
    aetherPhaseApply("native",reason);
    if(bar){
      bar.dataset.aetherMenuEscape="1";
      delete bar.dataset.aetherManualNative;
    }
    return true;
  }
  function aetherPhaseResumeAutomatic(reason="operator"){
    const bar=aetherPhaseBar();
    if(!bar||bar.dataset.aetherMenuEscape!=="1")return false;
    delete bar.dataset.aetherMenuEscape;
    delete bar.dataset.aetherManualNative;
    const restore=aetherPhaseState.suspendedPhase||"info";
    aetherPhaseApply(restore,reason);
    if(aetherPhaseState.timer)return true;
    if(aetherPhaseState.nextAction){
      if(aetherPhaseState.remaining>0)return aetherPhaseSchedule(aetherPhaseState.remaining,aetherPhaseState.nextAction);
      return aetherPhaseDispatch(aetherPhaseState.nextAction);
    }
    return true;
  }
  function aetherCadenceVisibilitySync(reason="visibilitychange"){
    const hidden=document.hidden===true,root=document.documentElement;
    aetherVeilleState.cadencePaused=hidden;
    aetherVeilleState.lastVisibilityReason=reason;
    if(hidden){
      aetherVeilleState.visibilityPauses+=1;
      aetherPhasePause("hidden");
    }else{
      aetherPhaseResume("hidden");
    }
    if(root){
      root.dataset.aetherCadencePaused=hidden?"1":"0";
      root.dataset.aetherCadenceVisibility=hidden?"hidden":"visible";
    }
    return hidden;
  }
  function aetherPhaseSnapshot(){
    return Object.freeze({
      owner_build:"40.6.425",phase:aetherPhaseState.phase,suspended_phase:aetherPhaseState.suspendedPhase,
      started:aetherPhaseState.started,hidden_paused:aetherPhaseState.hiddenPaused,manual_paused:aetherPhaseState.manualPaused,
      remaining_ms:Math.max(0,Math.round(aetherPhaseState.remaining||0)),next_action:aetherPhaseState.nextAction,
      timer_pending:aetherPhaseState.timer!==0,generation:aetherPhaseState.generation,
      menu_escape:aetherPhaseBar()?.dataset?.aetherMenuEscape==="1",
      transitions:aetherPhaseState.transitions,last_reason:aetherPhaseState.lastReason,last_transition_at:aetherPhaseState.lastTransitionAt,
      automatic_native_menu:false,manual_native_menu_pauses_cadence:false,manual_native_menu_auto_return:true
    });
  }

  function aetherVeilleScope(event){
    const assets=aetherVeilleTrustedAssets(event).map(v=>String(v||"").trim()).filter(Boolean);
    if(assets.length)return assets.slice(0,3).join("/");
    const sectors=(Array.isArray(event?.sectors)?event.sectors:[]).map(v=>String(v||"").trim()).filter(Boolean);
    return sectors[0]||"GLOBAL";
  }
  function aetherVeilleStatus(){
    let status="idle",payload=null,events=[];try{if(typeof newsFeedState!=="undefined"){status=String(newsFeedState.status||"idle");payload=newsFeedState.payload||null;events=Array.isArray(newsFeedState.events)?newsFeedState.events:[];}}catch(_){}
    let stats=null;try{if(typeof newsFeedUniqueStats==="function")stats=newsFeedUniqueStats()||null;}catch(_){}
    const cutoff24h=Date.now()-24*60*60*1000;
    const recent=events.filter(event=>{const ts=aetherVeilleTimestamp(event);return ts>0&&ts>=cutoff24h;});
    const derivedStats={
      events24:recent.length,
      priority24:recent.filter(event=>aetherVeilleNumber(event?.impact?.score)>=68).length,
      critical24:recent.filter(event=>aetherVeilleNumber(event?.impact?.score)>=85).length
    };
    const canonicalStats=stats&&[stats.events24,stats.priority24,stats.critical24].every(value=>Number.isFinite(Number(value)))?stats:derivedStats;
    const events24=Math.max(0,Math.round(aetherVeilleNumber(canonicalStats.events24)));
    stats={
      events24,
      priority24:Math.min(events24,Math.max(0,Math.round(aetherVeilleNumber(canonicalStats.priority24)))),
      critical24:Math.min(events24,Math.max(0,Math.round(aetherVeilleNumber(canonicalStats.critical24))))
    };
    const decision=String(payload?.summary?.decision||"").trim();
    if((status==="idle"||status==="loading")&&!events.length)return{label:"EN ATTENTE",text:"Veille non chargée · News Sentinel en attente",tone:"neutral",events:[],stats,status,decision};
    if(status==="error"&&!events.length)return{label:"INDISPONIBLE",text:"Archive News Sentinel indisponible · aucune actualité inventée",tone:"danger",events:[],stats,status,decision};
    if(!events.length)return{label:"0 PRIORITAIRE",text:status==="ok"?"Archive chargée · aucun événement prioritaire":"Archive partielle · aucun événement exploitable",tone:status==="partial"?"warn":"ok",events:[],stats,status,decision};
    const ranked=aetherVeilleEvents();
    if(!ranked.length)return{label:"VEILLE EN ATTENTE",text:"Archive chargée · aucun événement FR/EN qualifié pour la voie opérateur",tone:status==="partial"?"warn":"neutral",events:[],stats,status,decision};
    // 40.4.292 — ribbon counts describe the bilingual operator lane; native FR remains preferred, EN stays explicit.
    const operatorRecent=ranked.filter(event=>{const ts=aetherVeilleTimestamp(event);return ts>0&&ts>=cutoff24h;});
    const operatorStats={
      events24:operatorRecent.length,
      priority24:operatorRecent.filter(event=>aetherVeilleNumber(event?.impact?.score)>=68).length,
      critical24:operatorRecent.filter(event=>aetherVeilleNumber(event?.impact?.score)>=85).length
    };
    const globalTone=operatorStats.critical24>0?"danger":operatorStats.priority24>0||status==="partial"?"warn":"ok";
    const label=operatorStats.priority24>0?`${operatorStats.priority24} PRIORITAIRE${operatorStats.priority24>1?"S":""} 24H`:"VEILLE QUALIFIÉE";
    return{label,text:decision||"Surveillance",tone:globalTone,events:ranked,stats:operatorStats,archiveStats:stats,status,decision};
  }
  function aetherNewsSetReadiness(){
    let status="idle",startupSucceeded=false;
    try{
      if(typeof newsFeedState!=="undefined"){
        status=String(newsFeedState?.status||"idle").trim().toLowerCase();
        startupSucceeded=newsFeedState?.startupSucceeded===true;
      }
    }catch(_){}
    const settled=status!=="idle"&&status!=="loading"&&status!=="unavailable";
    let ranked=[];
    if(settled){try{ranked=aetherVeilleEvents();}catch(_){ranked=[];}}
    const ready=settled&&ranked.length>=AETHER_NEWS_SET_MIN_EVENTS;
    return Object.freeze({ready,status,startupSucceeded,events:ranked.length,min_events:AETHER_NEWS_SET_MIN_EVENTS});
  }
  function aetherExposeWhenNewsSetReady(reason="news-set-ready"){
    const readiness=aetherNewsSetReadiness();
    aetherExposureState.status=readiness.status;
    aetherExposureState.events=readiness.events;
    aetherExposureState.newsSetReady=readiness.ready;
    aetherExposureState.reason=reason;
    if(!readiness.ready)return false;
    if(!aetherExposureState.exposed){
      aetherExposureState.exposed=true;
      aetherExposureState.exposedAt=Date.now();
      const body=document.body;
      const root=document.documentElement;
      if(body)body.dataset.aetherNewsSetReady="1";
      if(root)root.dataset.aetherNewsSetReady="1";
      const ribbon=document.getElementById("atlasAetherRibbon");
      if(ribbon&&AETHER_RIBBON_ENABLED){ribbon.dataset.aetherNewsSetReady="1";ribbon.setAttribute("aria-hidden","false");}
      else if(ribbon)ribbon.setAttribute("aria-hidden","true");
      aetherVeilleState.index=0;
      aetherVeilleState.kind="alert";
      aetherVeilleState.storyEvent=null;
      aetherVeilleState.storyContext=null;
      aetherVeilleState.feedWasVisible=false;
      aetherVeilleState.fingerprint="";
      aetherPhaseStart("news-set-exposed");
    }
    aetherCorePaint();
    return true;
  }

  function aetherNewsMarketContext(currentEvent=null){
    try{
      const owner=globalThis.AtlasNewsToMarketOperatorIntelligence;
      if(!owner||typeof owner.compute!=="function")return null;
      const n=currentEvent?owner.compute(currentEvent):owner.compute();
      if(!n||n.status!=="observed")return null;
      const lead=currentEvent||n.current_event||n.lead_event||n.event||null;
      if(!lead)return null;
      const proof=n?.base?.amplifier?.evidence||n?.flow?.evidence||lead?.evidence||n?.event?.evidence||null;
      const proofScore=aetherVeilleNumber(proof?.score);
      const assets=(Array.isArray(lead?.assets)?lead.assets:Array.isArray(n?.event?.assets)?n.event.assets:[])
        .map(value=>String(value||"").trim().toUpperCase()).filter(Boolean).slice(0,3);
      const scope=assets.length?assets.join("/"):"MARCHÉ";
      const headline=aetherNewsOperatorDisplay(lead||n?.event,"Contexte News Sentinel");
      const source=String(lead?.source_name||lead?.source_host||n?.event?.source_name||n?.event?.source_host||"").replace(/^www\./,"").trim();
      const mechanismTitle=aetherFrenchMechanismLabel(n?.mechanism?.title||"");
      const mechanismDirection=String(n?.mechanism?.direction||"").trim();
      const explains=String(n?.mechanism?.explains||"").replace(/\s+/g," ").trim();
      const flowLabel=String(n?.flow?.label||"").trim();
      const flowDirection=String(n?.flow?.direction||"").trim();
      const breadth=String(n?.market_confirmation?.breadth||"").replace(/\s+/g," ").trim();
      const marketTone=String(n?.market_confirmation?.tone||"").replace(/\s+/g," ").trim();
      return {n,lead,proofScore,scope,headline,source,mechanismTitle,mechanismDirection,explains,flowLabel,flowDirection,breadth,marketTone,assets};
    }catch(_){return null;}
  }
  const AETHER_NON_INFORMATION_RE=/(?:pas une pr[eé]vision|aucune recommandation|recommandation financi[eè]re|conseil d[’']achat|signal d[’']achat|causalit[eé]|non d[eé]montr[eé]|ne prouve|sans preuve causale|preuve causale|r[oô]le plausible|ne suffit pas|ne peut pas conclure|insuffisant[^·.]*conclure|aucune conclusion|aucune cause|narration causale|prudence|prudent|non qualifi[eé]|non identifi[eé]|ind[eé]termin[eé]|inconnu|indisponible|non comparable|information insuffisante)/i;
  function aetherInformationFact(value){
    const text=String(value||"").replace(/\s+/g," " ).trim();
    if(!text||AETHER_NON_INFORMATION_RE.test(text))return "";
    return text;
  }
  function aetherInformationLine(value){
    return String(value||"").split("·").map(part=>aetherInformationFact(part)).filter(Boolean).join(" · " );
  }
  function aetherContextCurrent(model=null){
    const c=model;if(!c)return null;
    const proof=c.proofScore>0?`PREUVE ${Math.round(c.proofScore)}/100`:"PREUVE N/D";
    const qualified=value=>{
      return aetherInformationFact(value);
    };
    const marketRows=(()=>{
      try{
        const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];
        const top5=new Set(["BTC","ETH","BNB","XRP","SOL"]);
        return coins.filter(row=>top5.has(String(row?.symbol||"").toUpperCase()))
          .map(row=>({symbol:String(row?.symbol||"").toUpperCase(),change:aetherSystemNumber(row?.change24h)}))
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
  function aetherNewsFamilyShortFr(event){
    const family=aetherVeilleFamily(event);
    const labels={security:"SÉCURITÉ",liquidity:"LIQUIDITÉ",institutional:"INSTITUTIONS",regulation:"RÉGULATION",leverage:"LEVIER",macro:"MACRO",market:"MARCHÉ"};
    return labels[family]||"MARCHÉ";
  }
  function aetherNewsSeverity(event){
    const score=aetherVeilleNumber(event?.impact?.score);
    return score>=85?"critical":score>=68?"high":score>=45?"medium":"low";
  }
  function aetherNewsLanguageTag(event){
    return String(event?.display_language||"").trim().toLowerCase()==="en"?"SOURCE EN":"FR";
  }

  function aetherVeilleCurrent(){
    const snapshot=aetherVeilleStatus(),events=aetherVeilleBatchEvents();
    if(!events.length)return{...snapshot,kind:"alert",brand:"♥ VEILLE",index:0,total:0,event:null,meta:snapshot.label,detail:snapshot.text};
    aetherVeilleState.index=((aetherVeilleState.index%events.length)+events.length)%events.length;
    if(aetherVeilleState.kind==="context"){
      const story=aetherVeilleState.storyEvent||events[aetherVeilleState.index]||null;
      const context=aetherVeilleState.storyContext||aetherNewsMarketContext(story);
      if(context){const current=aetherContextCurrent(context);if(current)return current;}
      aetherVeilleState.kind="alert";
      aetherVeilleState.storyEvent=null;
      aetherVeilleState.storyContext=null;
    }
    const event=events[aetherVeilleState.index],impactLevel=String(event?.impact?.level||"Impact").toUpperCase(),impact=Math.round(aetherVeilleNumber(event?.impact?.score));
    const scope=aetherVeilleScope(event),evidence=Math.round(aetherVeilleNumber(event?.evidence?.score));
    const source=String(event?.source_name||event?.source_host||event?.source_class||"").replace(/^www\./,"").trim();
    const freshness=String(event?.freshness?.label||"").trim();
    const headline=aetherNewsOperatorDisplay(event,"Actualité à qualifier");
    const family=aetherVeilleFamily(event);
    const familyLabel=aetherNewsFamilyShortFr(event);
    const severity=aetherNewsSeverity(event);
    const language=aetherNewsLanguageTag(event);
    // 40.5.11 — scarce-lane truth: category + scope + impact score only.
    // Severity, source language and queue position remain machine-visible in fullMeta/datasets
    // while the actual event headline receives the horizontal reading space.
    const fullMeta=`${familyLabel} · ${scope} · ${impactLevel} ${impact}/100 · ${language} · ${aetherVeilleState.index+1}/${events.length}`;
    const meta=[familyLabel,scope,`${impact}/100`].filter(Boolean).join(" · ");
    const detail=[headline,source?`source ${source}`:null,freshness||null].filter(Boolean).join(" · ");
    return{...snapshot,kind:"alert",brand:"♥ VEILLE",index:aetherVeilleState.index,total:events.length,event,meta,fullMeta,detail,family,severity,language};
  }
  function aetherVeilleMarqueeSync(host,viewport,marquee,copy,fingerprint,fingerprintChanged){
    if(!host||!viewport||!marquee||!copy)return;
    const viewportWidth=Math.max(0,Math.round(viewport.clientWidth));
    const geometryChanged=Math.abs(viewportWidth-aetherVeilleState.viewportWidth)>1;
    if(!fingerprintChanged&&!geometryChanged)return;
    aetherVeilleState.viewportWidth=viewportWidth;
    // 40.4.121: speed is a velocity, not a fixed duration.
    // Fixed 8.6 s made short overflows crawl and long overflows race.
    host.dataset.scroll="0";
    host.style.removeProperty("--aether-veille-shift-4087");
    host.style.removeProperty("--aether-veille-duration-40121");
    host.style.removeProperty("--aether-veille-delay-40121");
    void marquee.offsetWidth;
    requestAnimationFrame(()=>{
      if(aetherVeilleState.fingerprint!==fingerprint||!copy.isConnected||!viewport.isConnected)return;
      const overflow=Math.max(0,Math.ceil(copy.scrollWidth-viewport.clientWidth+12));
      host.style.setProperty("--aether-veille-shift-4087",`${-overflow}px`);
      if(overflow>AETHER_MARQUEE_MIN_OVERFLOW_PX){
        const duration=Math.max(0.01,overflow/AETHER_MARQUEE_SPEED_PX_S);
        host.style.setProperty("--aether-veille-duration-40121",`${duration.toFixed(3)}s`);
        host.style.setProperty("--aether-veille-delay-40121",`${AETHER_MARQUEE_DELAY_S}s`);
        host.dataset.scrollSpeed=String(AETHER_MARQUEE_SPEED_PX_S);
        host.dataset.scroll="0";
        void marquee.offsetWidth;
        host.dataset.scroll="1";
      }else{
        host.dataset.scrollSpeed="0";
        host.dataset.scroll="0";
      }
    });
  }
  function renderAetherVeille(){
    if(!aetherExposureState.exposed)return null;
    const host=document.getElementById("atlasAetherVeille"),meta=document.getElementById("atlasAetherVeilleMeta"),viewport=document.getElementById("atlasAetherVeilleViewport");
    if(!host||!meta||!viewport)return null;
    const current=aetherVeilleCurrent(),copy=host.querySelector("[data-aether-veille-copy]"),brand=host.querySelector(".atlas-aether-veille-brand"),marquee=host.querySelector(".atlas-aether-veille-marquee");
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
    const fingerprintChanged=aetherVeilleState.fingerprint!==fingerprint;
    if(fingerprintChanged){
      // Stop the previous message before mutating its text; motion restarts only after re-measure.
      host.dataset.scroll="0";
      host.style.removeProperty("--aether-veille-shift-4087");
      host.style.removeProperty("--aether-veille-duration-40121");
      host.style.removeProperty("--aether-veille-delay-40121");
      if(copy&&copy.textContent!==current.detail)copy.textContent=current.detail;
      if(copy)copy.title=current.detail;
      aetherVeilleState.fingerprint=fingerprint;
      // Rendered means the story content was actually committed to the VEILLE DOM.
      aetherVeilleBatchRenderRecord(current);
    }
    aetherVeilleMarqueeSync(host,viewport,marquee,copy,fingerprint,fingerprintChanged);
    aetherVeilleState.last=current;
    return current;
  }
  function aetherVeilleAdvance(){
    const ranked=aetherVeilleBatchEvents();
    if(!ranked.length){
      aetherVeilleState.index=0;aetherVeilleState.kind="alert";aetherVeilleState.storyEvent=null;aetherVeilleState.storyContext=null;aetherVeilleState.fingerprint="";
      aetherVeilleBatchPublish();
      return renderAetherVeille();
    }
    // 40.6.423 — advance inside the frozen batch only. Never wrap inside one VEILLE window.
    if(aetherVeilleState.index<ranked.length-1)aetherVeilleState.index+=1;
    aetherVeilleState.kind="alert";
    aetherVeilleState.storyEvent=null;
    aetherVeilleState.storyContext=null;
    aetherVeilleState.fingerprint="";
    return renderAetherVeille();
  }
  function aetherCompact(value, max=88){
    const text=String(value||"").replace(/\s+/g," ").trim();
    return text.length>max?`${text.slice(0,Math.max(8,max-1)).trimEnd()}…`:text;
  }
  function aetherDisplayCurrency(){
    try{return String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"EUR").toUpperCase()==="USD"?"USD":"EUR";}
    catch(_){return"EUR";}
  }
  function aetherDisplayPrice(coin){
    const currency=aetherDisplayCurrency();
    const raw=currency==="USD"?coin?.priceUsd:(coin?.priceEur??coin?.price);
    const value=aetherSystemNumber(raw);
    return{currency,value:value!==null&&value>0?value:null};
  }
  function aetherFormatDisplayPrice(value,currency,maximumFractionDigits=2){
    const n=aetherSystemNumber(value);
    if(n===null||n<=0)return"—";
    return new Intl.NumberFormat("fr-FR",{style:"currency",currency,maximumFractionDigits}).format(n);
  }

  function aetherMarketBrief(){
    try{
      const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];
      const top5=new Set(["BTC","ETH","BNB","XRP","SOL"]);
      const rows=coins.filter(row=>top5.has(String(row?.symbol||"").toUpperCase()));
      const btc=rows.find(row=>String(row?.symbol||"").toUpperCase()==="BTC")||coins.find(row=>row?.id==="bitcoin");
      const display=aetherDisplayPrice(btc),price=display.value,change=aetherSystemNumber(btc?.change24h);
      const leader=rows.filter(row=>aetherSystemNumber(row?.change24h)!==null).sort((x,y)=>Number(y.change24h)-Number(x.change24h))[0]||null;
      const parts=[];
      if(price!==null&&price>0){
        parts.push(`BTC ${aetherFormatDisplayPrice(price,display.currency,0)}`);
        if(change!==null)parts.push(`${change>=0?"+":""}${change.toFixed(2)} %`);
      }
      const leaderChange=aetherSystemNumber(leader?.change24h);
      if(leader&&leaderChange!==null)parts.push(`${String(leader.symbol||"").toUpperCase()} leader ${leaderChange>=0?"+":""}${leaderChange.toFixed(2)} %`);
      return parts.join(" · ")||"marché en attente";
    }catch(_){return"marché en attente";}
  }
  function aetherOracleBrief(){
    const identity=aetherText("atlasOracleOperatorIdentity","");
    const bias=aetherText("atlasOracleOperatorBias","").replace(/^BIAIS\s*/i,"").trim();
    const confidence=aetherText("atlasOracleOperatorConfidence","").replace(/^CONF\.\s*/i,"").trim();
    const legacyAsset=aetherText("atlasOracleAsset","");
    const legacyBias=aetherText("atlasOracleBias","").replace(/^Biais mesuré\s*:\s*/i,"").trim();
    const legacyConfidence=aetherText("atlasOracleConfidence","").replace(/^Confiance données\s*/i,"").trim();
    const readyIdentity=identity&&!/EN ATTENTE|LIVE CHECK|LIVECHECK/i.test(identity)?identity:legacyAsset&&!/EN ATTENTE/i.test(legacyAsset)?legacyAsset:"";
    const readyBias=bias&&!/[—-]$|ATTENTE|REQUIS/i.test(bias)?bias:legacyBias&&!/ATTENTE|REQUIS/i.test(legacyBias)?legacyBias:"";
    const readyConfidence=confidence&&!/[—-]$|ATTENTE/i.test(confidence)?confidence:legacyConfidence&&!/[—-]$/.test(legacyConfidence)?legacyConfidence:"";
    return [readyIdentity,readyBias,readyConfidence].filter(Boolean).join(" · ")||"en attente";
  }
  function aetherAtlasBrief(){
    const current=aetherCurrent();
    const status=String(current?.status||"").trim().toUpperCase();
    const operator=aetherText("atlasOracleAtlas","").replace(/^Atlas\s*:\s*/i,"").trim();
    if(operator&&!/en attente/i.test(operator)){
      const first=operator.split("·").map(v=>v.trim()).filter(Boolean)[0]||"";
      const score=(operator.match(/(?:score\s+direction|direction)\s*([+−-]?\s*\d+\s*\/\s*100)/i)||[])[1]||"";
      const scoreClean=score.replace(/\s+/g,"").replace("−","-");
      let signal=first.replace(/^momentum\s*/i,"").trim();
      if(/partag/i.test(first))signal="PARTAGÉ";
      else if(/hauss|bull/i.test(first))signal="HAUSSIER";
      else if(/baiss|bear/i.test(first))signal="BAISSIER";
      else signal=aetherCompact(signal||first,20).toUpperCase();
      return [status&&status!=="IDLE"?status:null,signal||null,scoreClean||null].filter(Boolean).join(" · ");
    }
    const reports=Number.isFinite(Number(current?.atlas_reports))?Math.max(0,Number(current.atlas_reports)):Array.isArray(current?.reports)?current.reports.length:0;
    return `${status||"VEILLE"}${reports?` · ${reports}/4`:""}`;
  }
  function aetherSourcesBrief(){
    const live=aetherText("liveStatus","");
    const raw=live&&!/requis|attente/i.test(live)?live:aetherText("sourceName","Aucune source");
    const ratio=(raw.match(/\b\d+\s*\/\s*\d+\b/)||[])[0]?.replace(/\s+/g,"")||"";
    if(/binance/i.test(raw))return `Binance${ratio?` · ${ratio}`:""}`;
    return aetherCompact(raw.replace(/^Prix live\s*/i,""),34);
  }
  function aetherBreadthBrief(){
    try{
      const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];
      const top5=new Set(["BTC","ETH","BNB","XRP","SOL"]);
      const rows=coins.filter(row=>top5.has(String(row?.symbol||"").toUpperCase()))
        .map(row=>({symbol:String(row?.symbol||"").toUpperCase(),change:aetherSystemNumber(row?.change24h)}))
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
  function aetherAnalysisBrief(){
    // 40.4.123 — the prime INFO lane always exposes breadth + both edges.
    // This is denser and more stable than mirroring an arbitrary moves sentence.
    const breadth=aetherBreadthBrief();
    return `Top 5 · ${aetherCompact(breadth,86)}`;
  }
  function aetherOraclePriorityBrief(){
    const identity=aetherText("atlasOracleOperatorIdentity","");
    const legacyAsset=aetherText("atlasOracleAsset","");
    const parts=identity.split("·").map(v=>v.trim()).filter(Boolean);
    const asset=(parts[0]&&!/ATTENTE|LIVE CHECK|LIVECHECK/i.test(parts[0]))?parts[0]:(legacyAsset&&!/ATTENTE/i.test(legacyAsset)?legacyAsset:"");
    const mode=parts.slice(1).join(" · ");
    const bias=aetherText("atlasOracleOperatorBias","").replace(/^BIAIS\s*/i,"").trim()
      ||aetherText("atlasOracleBias","").replace(/^Biais mesuré\s*:\s*/i,"").trim();
    const confidence=aetherText("atlasOracleOperatorConfidence","").replace(/^CONF\.\s*/i,"").trim()
      ||aetherText("atlasOracleConfidence","").replace(/^Confiance données\s*/i,"").trim();
    const clean=value=>String(value||"").trim();
    const ready=[asset,(!/ATTENTE|REQUIS|^[—-]$/i.test(clean(bias))?clean(bias):""),(!/ATTENTE|^[—-]$/i.test(clean(confidence))?clean(confidence):""),mode].filter(Boolean);
    return ready.join(" · ");
  }
  function aetherSignalBrief(){
    const oracle=aetherInformationLine(aetherOraclePriorityBrief());
    if(oracle&&!/en attente/i.test(oracle))return `Oracle · ${aetherCompact(oracle,78)}`;
    const risk=aetherInformationLine(aetherText("atlasOperatorRisk35",""));
    const riskDetail=aetherInformationLine(aetherText("atlasOperatorRiskDetail35",""));
    // A positive anomaly is information; “pas d’anomalie / aucune donnée” is filler.
    if(risk&&!/attente|aucune|pas d|non /i.test(risk))return `Signal · ${aetherCompact([risk,riskDetail].filter(Boolean).join(" · "),78)}`;
    return `Top 5 · ${aetherCompact(aetherBreadthBrief(),78)}`;
  }
  function aetherVeilleBrief(){
    try{
      const snapshot=aetherVeilleStatus(),events=snapshot.events||[];
      if(!events.length)return `Veille · ${snapshot.label||"aucun événement prioritaire"}`;
      const event=events[0],scope=aetherVeilleScope(event),impact=Math.round(aetherVeilleNumber(event?.impact?.score));
      const headline=aetherNewsOperatorDisplay(event,"");
      // 40.4.288 — information first: producer-owned canonical display headline leads; scope/impact follow.
      return `Veille · ${aetherCompact(headline,88)}${scope?` · ${scope}`:""}${impact?` ${impact}/100`:""}`;
    }catch(_){return "Veille · News Sentinel";}
  }
  const aetherNewsWake={attempted:false,inflight:null};
  function aetherWakeNewsSentinel(){
    if(aetherNewsWake.inflight)return aetherNewsWake.inflight;
    try{
      const events=(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.events))?newsFeedState.events:[];
      const status=typeof newsFeedState!=="undefined"?String(newsFeedState?.status||"idle"):"unavailable";
      const runtimeFresh=typeof newsFeedState!=="undefined"
        && newsFeedState?.startupSucceeded===true
        && status==="ok";
      const canonicalDisplayReady=events.length>0
        && events.every(aetherNewsContractReady);
      if(aetherNewsWake.attempted||typeof loadNewsLiveFeed!=="function")return Promise.resolve(false);
      // 40.6.419 — cached/previous News may be used, but Aether is exposed only after a settled plural operator set exists.
      // If News is already fully ready, consume it without forcing another collection.
      if(runtimeFresh&&canonicalDisplayReady){
        try{aetherExposeWhenNewsSetReady("news-already-ready");}catch(_){}
        return Promise.resolve(true);
      }
      if(status==="loading")return Promise.resolve(false);
      aetherNewsWake.attempted=true;
      aetherNewsWake.inflight=Promise.resolve(loadNewsLiveFeed({force:true,automatic:false}))
        .catch(()=>false)
        .finally(()=>{
          aetherNewsWake.inflight=null;
          try{aetherVeilleState.fingerprint="";aetherExposeWhenNewsSetReady("news-owner-settled");}catch(_){}
        });
      return aetherNewsWake.inflight;
    }catch(_){return Promise.resolve(false);}
  }

  function aetherSnapshot(){
    const current=aetherCurrent();
    const reports=Number.isFinite(Number(current?.atlas_reports))?Math.max(0,Number(current.atlas_reports)):Array.isArray(current?.reports)?current.reports.length:0;
    const currentStatus=String(current?.status||"").trim().toUpperCase();
    const atlas=aetherAtlasBrief();
    const oracle=aetherOracleBrief();
    const sources=aetherSourcesBrief();
    const market=aetherMarketBrief();
    const analysis=aetherAnalysisBrief();
    const signal=aetherSignalBrief();
    const veilleBrief=aetherVeilleBrief();
    let book="APRÈS AUTH";
    try{
      if(typeof atlasBookMirrorBridgeState!=="undefined"){
        book=atlasBookMirrorBridgeState.credentialReady===true?"PRÊT":atlasBookMirrorBridgeState.credentialReady===false?"CREDENTIAL REQUIS":"EN VEILLE";
      }
    }catch(_){}
    const veille=aetherVeilleCurrent();
    const news=veille.detail||veille.text||"Veille non chargée";
    const graphTop5=document.getElementById("btnChartTop5")?.classList?.contains("active")===true;
    const graphTitle=aetherText("selectedAssetTitle","Aucune sélection");
    const graph=graphTop5?"TOP 5":graphTitle;
    return {current,reports,currentStatus,atlas,oracle,sources,book,market,analysis,signal,veilleBrief,news,graph};
  }
  function aetherMarketBreadth(){
  try{const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];const rows=coins.map(r=>aetherSystemNumber(r?.change24h)).filter(v=>v!==null);if(!rows.length)return "Marché non chargé";const up=rows.filter(v=>v>.05).length,down=rows.filter(v=>v<-.05).length,flat=rows.length-up-down;const bias=down>up*1.35?"largeur négative":up>down*1.35?"largeur positive":"largeur mixte";return `${up} hausses · ${down} baisses · ${flat} stables · ${bias}`;}catch(_){return "Marché non chargé";}
}
function aetherAtlasAuto(){
  try{
    const current=aetherCurrent()||null;
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
function aetherSystemBrief(){
  const sys=aetherSystemState.system||{},cpu=aetherSystemPercent(sys?.cpu?.usage_pct),ct=aetherSystemTemperature(sys?.cpu?.temperature_c),gs=String(sys?.gpu?.status||"").trim().toLowerCase(),gpu=gs&&gs!=="ok"?null:aetherSystemPercent(sys?.gpu?.usage_pct),gt=gs&&gs!=="ok"?null:aetherSystemTemperature(sys?.gpu?.temperature_c),ram=aetherSystemPercent(sys?.memory?.usage_pct);const part=(l,v,t=null)=>`${l} ${v===null?"N/D":`${Math.round(v)}%${t===null?"":` ${Math.round(t)}°`}`}`;return `${part("CPU",cpu,ct)} · ${part("GPU",gpu,gt)} · ${part("RAM",ram)}`;
}
function aetherWeatherOutlook(){return String(aetherSystemState.weather?.daily_summary||"Prévisions 5 jours en attente").trim();}
function aetherWeatherRisk(){return String(aetherSystemState.weather?.electrical_risk||"Risque orage/rafales en attente").trim();}
function aetherAttention(){
  const w=aetherSystemState.weather||{};if(w.risk_level==="danger"||w.risk_level==="warn")return `Météo · ${aetherWeatherRisk()}`;const sys=aetherSystemState.system||{},cpu=aetherSystemPercent(sys?.cpu?.usage_pct),gpu=aetherSystemPercent(sys?.gpu?.usage_pct),ram=aetherSystemPercent(sys?.memory?.usage_pct),ct=aetherSystemTemperature(sys?.cpu?.temperature_c),gt=aetherSystemTemperature(sys?.gpu?.temperature_c);if((cpu!==null&&cpu>=88)||(gpu!==null&&gpu>=92)||(ram!==null&&ram>=90)||(ct!==null&&ct>=90)||(gt!==null&&gt>=84))return `Système · ${aetherSystemBrief()}`;const a=aetherAtlasAuto();if(/NON ARMÉ|indisponible/i.test(a))return `Atlas AUTO · ${a}`;return `Marché · ${aetherMarketBreadth()}`;
}
function aetherOperatorWhy(){
  try{
    const feed=aetherVeilleCurrent();
    if(!feed?.event)return "Aucune actualité prioritaire qualifiée pour l’instant.";
    const parts=[];
    if(feed.meta)parts.push(feed.meta);
    if(feed.detail)parts.push(feed.detail);
    const breadth=aetherMarketBreadth();
    if(breadth&&!/non charg|en attente/i.test(breadth))parts.push(`Marché · ${breadth}`);
    const oracle=aetherOracleBrief();
    if(oracle&&!/en attente/i.test(oracle))parts.push(`Oracle · ${oracle}`);
    parts.push("Décision humaine · aucune exécution automatique");
    return parts.join(" · ");
  }catch(_){return "Contexte opérateur indisponible · aucune action automatique.";}
}
function aetherNewsMarketSemantic(){
  try{
    const feed=aetherVeilleCurrent();
    const event=feed?.event||null;
    if(!event)return "News Sentinel · aucun événement prioritaire qualifié.";
    const owner=globalThis.AtlasNewsToMarketOperatorIntelligence;
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
  function aetherDirectionalWord(value){
    const text=String(value||"").toLowerCase();
    if(/hauss|bull|positif|positive|risk-on|risk on|inflow|entrants?/.test(text))return 1;
    if(/baiss|bear|n[ée]gatif|negative|risk-off|risk off|outflow|sortants?/.test(text))return -1;
    if(/mixte|partag|neutre|stable|lat[ée]ral|non [ée]tablie/.test(text))return 0;
    return null;
  }
  function aetherOracleDirection(){
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
      return aetherDirectionalWord(aetherText("atlasOracleOperatorBias","")||aetherText("atlasOracleBias",""));
    }catch(_){return null;}
  }
  function aetherMarketDirection(){
    try{
      const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];
      const values=coins.map(row=>aetherSystemNumber(row?.change24h)).filter(v=>v!==null);
      if(!values.length)return null;
      const up=values.filter(v=>v>.05).length,down=values.filter(v=>v<-.05).length;
      if(up>=down*1.25&&up-down>=3)return 1;
      if(down>=up*1.25&&down-up>=3)return -1;
      return 0;
    }catch(_){return null;}
  }
  function aetherNewsDirection(){
    try{
      const feed=aetherVeilleCurrent();
      const event=feed?.event||null;
      if(!event)return null;
      const owner=globalThis.AtlasNewsToMarketOperatorIntelligence;
      const narrative=owner&&typeof owner.compute==="function"?owner.compute(event):null;
      const fields=[narrative?.mechanism?.direction,narrative?.flow?.direction,narrative?.market_confirmation?.focus,narrative?.verdict?.direction,feed?.tone];
      const votes=fields.map(aetherDirectionalWord).filter(v=>v!==null&&v!==0);
      if(votes.length){const sum=votes.reduce((a,b)=>a+b,0);return sum>0?1:sum<0?-1:0;}
      return aetherDirectionalWord([event?.event_label,event?.decision?.tone,event?.sentiment].filter(Boolean).join(" "));
    }catch(_){return null;}
  }
  function aetherAtlasDirection(){
    try{return aetherDirectionalWord(`${aetherAtlasBrief()} ${aetherText("atlasOracleAtlas","")}`);}catch(_){return null;}
  }
  function aetherDirectionMatrix(){
    const layers=[
      {name:"News",value:aetherNewsDirection()},
      {name:"Marché",value:aetherMarketDirection()},
      {name:"Atlas",value:aetherAtlasDirection()},
      {name:"Oracle",value:aetherOracleDirection()},
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
  function aetherOperatorWatch(){
    const m=aetherDirectionMatrix();
    const sourcesModel=aetherSourcesModel(aetherSnapshot());
    const systemModel=aetherSystemModel();
    const sourceReady=sourcesModel.status==="PRÊTES";
    const systemReady=!['INDISPONIBLE','CRITIQUE'].includes(systemModel.status);
    const feed=aetherVeilleCurrent();
    const impact=Number(feed?.event?.impact?.score),evidence=Number(feed?.event?.evidence?.score);
    const attentionBase=aetherAttention();
    let level="MODÉRÉ",cause="Marché",proof=aetherMarketBreadth();
    if(/Système/i.test(attentionBase)&&/danger|critique|indisponible/i.test(attentionBase)){level="CRITIQUE";cause="Système";proof=aetherSystemBrief();}
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
  const aetherTimelineState={entries:[],last:null,max:8};
  function aetherTimelineClip(value,max=150){
    const text=String(value??"").replace(/\s+/g," ").trim();
    return text.length>max?`${text.slice(0,max-1)}…`:text;
  }
  function aetherTimelineNewsKey(){
    try{
      const status=aetherVeilleStatus();
      const ids=(Array.isArray(status?.events)?status.events:[]).map(event=>String(event?.event_id||event?.id||event?.fingerprint||event?.source_url||event?.display_headline||event?.headline||"").trim()).filter(Boolean).sort();
      return ids.join("|");
    }catch(_){return "";}
  }
  function aetherTimelineSnapshot(watch){
    return {
      news:aetherTimelineNewsKey(),
      market:aetherMarketDirection(),
      atlas:aetherAtlasDirection(),
      oracle:aetherOracleDirection(),
      level:String(watch?.level||"").split("·")[0].trim()||"N/D"
    };
  }
  function aetherTimelinePush(type,level,detail,meta={}){
    const full=String(detail||"État actualisé").replace(/\s+/g," ").trim();
    const entry=Object.freeze({at:Date.now(),detected_at:Date.now(),type:String(type||"AETHER"),level:String(level||"N/D"),detail:full,preview:aetherTimelineClip(full,150),source_id:meta?.source_id||null,published_at:meta?.published_at||null,source_url:meta?.source_url||null});
    aetherTimelineState.entries.unshift(entry);
    if(aetherTimelineState.entries.length>aetherTimelineState.max)aetherTimelineState.entries.length=aetherTimelineState.max;
  }
  function aetherTimelineCapture(watch){
    try{
      const current=aetherTimelineSnapshot(watch),previous=aetherTimelineState.last;
      if(!previous){
        aetherTimelinePush("AETHER",current.level,watch?.convergence||"Surveillance initialisée");
        aetherTimelineState.last=current;return;
      }
      const changes=[];
      if(current.news!==previous.news){
        const status=aetherVeilleStatus();
        changes.push(["NEWS",`${Array.isArray(status?.events)?status.events.length:0} événement(s) qualifié(s) · archive ${String(status?.status||'N/D').toUpperCase()}`]);
      }
      if(current.oracle!==previous.oracle)changes.push(["ORACLE",aetherOracleBrief()]);
      if(current.market!==previous.market)changes.push(["MARCHÉ",aetherMarketBreadth()]);
      if(current.atlas!==previous.atlas)changes.push(["ATLAS",aetherAtlasBrief()]);
      if(current.level!==previous.level)changes.push(["AETHER",watch?.convergence||watch?.divergence||"Niveau d’attention modifié"]);
      for(const [type,detail] of changes)aetherTimelinePush(type,current.level,detail);
      aetherTimelineState.last=current;
    }catch(_){}
  }
  const AETHER_TIMELINE_PREVIEW=3;
  function aetherTimelineRow(entry){
    const row=document.createElement("div");row.className="aether-timeline-row";
    const time=document.createElement("span");time.className="aether-timeline-time";time.textContent=new Date(entry.at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const type=document.createElement("b");type.className="aether-timeline-type";type.textContent=entry.type;
    const level=document.createElement("span");level.className="aether-timeline-level";level.textContent=entry.level;
    const detail=document.createElement("span");detail.className="aether-timeline-detail";detail.textContent=entry.detail;
    row.append(time,type,level,detail);return row;
  }
  function aetherTimelineFill(host,entries){
    if(!host)return;
    host.replaceChildren();
    if(!entries.length){
      const empty=document.createElement("span");empty.className="aether-timeline-empty";empty.textContent="Aucun changement significatif enregistré dans cette session.";host.appendChild(empty);return;
    }
    entries.forEach(entry=>host.appendChild(aetherTimelineRow(entry)));
  }
  /* 40.6.37 — GRAPH-FIRST LAZY HYDRATION · INTERACTION-ON-DEMAND LOCK */
  function aetherTimelineRender(panel,{includeFull=false}={}){
    const preview=panel?.querySelector('[data-aether-timeline-preview]');
    const full=panel?.querySelector('[data-aether-timeline]');
    if(!preview&&!full)return;
    const entries=aetherTimelineState.entries;
    aetherTimelineFill(preview,entries.slice(0,AETHER_TIMELINE_PREVIEW));
    if(includeFull)aetherTimelineFill(full,entries);
    const count=panel?.querySelector('[data-aether-history-count]');
    if(count)count.textContent=`${entries.length}/${aetherTimelineState.max}`;
  }
  function aetherWeatherFirstGlance(){
    try{
      const days=Array.isArray(aetherSystemState.weather?.daily)?aetherSystemState.weather.daily:[];
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
  const AETHER_WORKBENCH_SRC='./js/aether-workbench.js?v=administrator-build-40.6.39';
  let aetherWorkbenchPromise=null;
  function aetherWorkbenchLoad(){
    if(globalThis.AgentCryptoAetherWorkbench406039)return Promise.resolve(globalThis.AgentCryptoAetherWorkbench406039);
    if(aetherWorkbenchPromise)return aetherWorkbenchPromise;
    aetherWorkbenchPromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=AETHER_WORKBENCH_SRC;
      script.async=true;
      script.dataset.aetherWorkbench='1';
      script.onload=()=>globalThis.AgentCryptoAetherWorkbench406039?resolve(globalThis.AgentCryptoAetherWorkbench406039):reject(new Error('Aether Workbench API absent'));
      script.onerror=()=>{aetherWorkbenchPromise=null;reject(new Error('Aether Workbench load failed'));};
      document.head.appendChild(script);
    });
    return aetherWorkbenchPromise;
  }
  function aetherWorkbenchPayload(mode){
    const snapshot=aetherSnapshot();
    const watch=aetherOperatorWatch();
    return Object.freeze({
      build:'40.6.39',
      mode,
      timeline:aetherTimelineState.entries.map(row=>Object.freeze({...row})),
      details:Object.freeze({
        why:aetherOperatorWhy(),
        semantic:aetherNewsMarketSemantic(),
        attention:aetherAttention(),
        news:snapshot.news
      }),
      watch:Object.freeze({...watch})
    });
  }
  function aetherPanelFocusEmbedded(target,panel){
    if(!panel)return;
    const embedded=['glance','history','details'].includes(target)?target:'glance';
    panel.dataset.aetherFocus=embedded;
    panel.querySelectorAll('[data-aether-focus-view]').forEach(node=>{node.hidden=node.getAttribute('data-aether-focus-view')!==embedded;});
    panel.querySelectorAll('[data-aether-focus-button]').forEach(button=>{
      const active=button.getAttribute('data-aether-focus-button')===embedded;
      button.setAttribute('aria-pressed',active?'true':'false');
      button.dataset.active=active?'1':'0';
    });
    if(embedded==='history')aetherTimelineRender(panel,{includeFull:true});
    if(embedded==='details')aetherDetailsRender(panel);
  }
  function aetherWorkbenchOpen(mode,panel=document.getElementById('atlasAetherStatusPanel')){
    const target=mode==='details'?'details':mode==='history'?'history':'events';
    return aetherWorkbenchLoad()
      .then(api=>api.open(aetherWorkbenchPayload(target)))
      .catch(()=>aetherPanelFocusEmbedded(target==='events'?'history':target,panel));
  }
  function aetherPanelFocus(mode,panel=document.getElementById('atlasAetherStatusPanel')){
    if(!panel)return;
    const target=['glance','history','details'].includes(mode)?mode:'glance';
    if(target==='glance')return aetherPanelFocusEmbedded('glance',panel);
    // Rich reading stays lazy and floats ABOVE the artwork; embedded surfaces are failure fallback only.
    aetherPanelFocusEmbedded('glance',panel);
    void aetherWorkbenchOpen(target,panel);
  }
  function aetherDetailsRender(panel=document.getElementById('atlasAetherStatusPanel')){
    if(!panel)return;
    const row=(key,value)=>{const node=panel.querySelector(`[data-aether-row="${key}"]`);if(node)node.textContent=value;};
    row('why',aetherOperatorWhy());
    row('semantic',aetherNewsMarketSemantic());
    row('attention',aetherAttention());
    row('news',aetherSnapshot().news);
    panel.dataset.aetherDetailsHydrated='1';
  }

  /* 40.6.42 — AETHER COMPONENT FOUNDATION · RESPONSIVE INFORMATION ARCHITECTURE */
  /*
     Aether Watch becomes a data-first responsive UI. The historical 16:9 artwork is now
     only a low-contrast backplate; it no longer owns card geometry or window dimensions.
     This layer reads existing owners only: no fetch, timer, observer, storage or order path.
  */
  function aetherNumberFromText(value,pattern){
    const match=String(value||'').match(pattern);
    if(!match)return null;
    const n=Number(String(match[1]||'').replace('−','-').replace(',','.').replace(/\s+/g,''));
    return Number.isFinite(n)?n:null;
  }
  function aetherPctText(value){return value===null||value===undefined?'N/D':`${Math.round(value)} %`;}
  function aetherTone(value,{warn=80,danger=92,invert=false}={}){
    if(value===null||value===undefined)return 'muted';
    if(invert)return value>=danger?'danger':value>=warn?'warn':'good';
    return value>=danger?'danger':value>=warn?'warn':'good';
  }
  function aetherSet(stage,key,value,tone=null){
    const node=stage?.querySelector(`[data-aether46="${key}"]`);if(!node)return;
    const text=String(value??'—');if(node.textContent!==text)node.textContent=text;
    if(tone)node.dataset.tone=tone;else delete node.dataset.tone;
  }
  function aetherCardTone(stage,key,tone){const card=stage?.querySelector(`[data-aether-card-406046="${key}"]`);if(card)card.dataset.tone=tone||'neutral';}
  function aetherMarketModel(){
    try{
      const coins=(typeof state!=='undefined'&&Array.isArray(state?.coins))?state.coins:[];
      const rows=coins.map(row=>({symbol:String(row?.symbol||'').toUpperCase(),change:aetherSystemNumber(row?.change24h)})).filter(row=>row.change!==null);
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
  function aetherSystemModel(){
    const sys=aetherSystemState.system||{};
    const cpu=aetherSystemPercent(sys?.cpu?.usage_pct),cpuTemp=aetherSystemTemperature(sys?.cpu?.temperature_c);
    const gpuStatus=String(sys?.gpu?.status||'').trim().toLowerCase();
    const gpu=gpuStatus&&gpuStatus!=='ok'?null:aetherSystemPercent(sys?.gpu?.usage_pct),gpuTemp=gpuStatus&&gpuStatus!=='ok'?null:aetherSystemTemperature(sys?.gpu?.temperature_c);
    const ram=aetherSystemPercent(sys?.memory?.usage_pct);
    let status='STABLE',tone='good';
    if(cpu===null&&ram===null){status='INDISPONIBLE';tone='muted';}
    else if((cpu!==null&&cpu>=92)||(ram!==null&&ram>=96)||(cpuTemp!==null&&cpuTemp>=90)||(gpuTemp!==null&&gpuTemp>=84)){status='CRITIQUE';tone='danger';}
    else if((cpu!==null&&cpu>=80)||(ram!==null&&ram>=90)){status='SOUS CHARGE';tone='warn';}
    else if(gpu===null){status='PARTIEL';tone='neutral';}
    return {cpu,cpuTemp,gpu,gpuTemp,ram,status,tone};
  }
  /* 40.6.453 SOURCE READINESS PURE START */
  function aetherSourceTruthReadiness(){
    const api=globalThis.ErithPrivateBackendSources;
    if(!api||typeof api.sourceIntelligence!=="function"){
      return Object.freeze({known:false,ready:false,state:"missing",freshness_ready:false,cex_ready:false,cex_comparable:null,cex_total:null});
    }
    let intel=null;
    try{intel=api.sourceIntelligence?.()||null;}catch(_){}
    if(!intel||typeof intel!=="object"){
      return Object.freeze({known:false,ready:false,state:"unknown",freshness_ready:false,cex_ready:false,cex_comparable:null,cex_total:null});
    }
    const state=String(intel?.state||"unknown").trim().toLowerCase();
    const gate=intel?.freshness_gate||null;
    const freshnessReady=gate?.ready===true;
    const comparable=Number(intel?.cex?.comparable_assets),total=Number(intel?.cex?.total_assets);
    const cexReady=Number.isFinite(comparable)&&Number.isFinite(total)&&total>0&&comparable===total;
    const ready=state==="ready"&&freshnessReady&&cexReady;
    return Object.freeze({known:true,ready,state,freshness_ready:freshnessReady,cex_ready:cexReady,cex_comparable:Number.isFinite(comparable)?comparable:null,cex_total:Number.isFinite(total)?total:null});
  }
  /* 40.6.453 SOURCE READINESS PURE END */
  function aetherSourcesModel(snapshot){
    let newsCount=0,newsLabel='VEILLE',newsStatus='idle';
    try{const ns=aetherVeilleStatus();newsCount=Array.isArray(ns?.events)?ns.events.length:0;newsLabel=newsCount?'ACTIVES':String(ns?.label||'VEILLE').toUpperCase();newsStatus=String(ns?.status||'idle').toLowerCase();}catch(_){}
    const ratio=(String(snapshot?.sources||'').match(/\b\d+\s*\/\s*\d+\b/)||[])[0]?.replace(/\s+/g,'')||'N/D';
    const match=ratio.match(/^(\d+)\/(\d+)$/);const num=match?Number(match[1]):null,den=match?Number(match[2]):null;
    const binanceComplete=Number.isFinite(num)&&Number.isFinite(den)&&den>0&&num===den;
    const book=String(snapshot?.book||'EN VEILLE').toUpperCase();
    const bookReady=/^PRÊT/.test(book)&&!/REQUIS|VEILLE|INDISPONIBLE|ERREUR/.test(book);
    const atlasData=String(snapshot?.currentStatus||'').toUpperCase()==='CURRENT'?'CURRENT':snapshot?.reports?'DISPONIBLE':'VEILLE';
    const atlasReady=atlasData==='CURRENT'||atlasData==='DISPONIBLE';
    const newsReady=newsCount>0&&newsStatus!=='error';
    const sourceTruth=aetherSourceTruthReadiness();
    const sourceReady=binanceComplete&&bookReady&&atlasReady&&newsReady&&sourceTruth.ready;
    return {ratio,book,news:newsCount?`${newsCount} QUALIFIÉ${newsCount>1?'S':''}`:newsLabel,atlasData,status:sourceReady?'PRÊTES':'PARTIELLES',tone:sourceReady?'good':'warn',checks:{binanceComplete,bookReady,atlasReady,newsReady,sourceTruthKnown:sourceTruth.known,sourceTruthReady:sourceTruth.ready,sourceTruthState:sourceTruth.state,sourceTruthFreshnessReady:sourceTruth.freshness_ready,sourceTruthCexReady:sourceTruth.cex_ready}};
  }
  function aetherAtlasModel(snapshot){
    const raw=String(snapshot?.atlas||'').trim();
    const score=aetherNumberFromText(raw,/([+−-]?\s*\d+)\s*\/\s*100/);
    const parts=raw.split('·').map(v=>v.trim()).filter(Boolean);
    const status=String(snapshot?.currentStatus||parts[0]||'VEILLE').toUpperCase();
    const signal=parts.find(v=>!/CURRENT|IDLE|VEILLE|\d+\s*\/\s*100/i.test(v))||parts[1]||'Lecture en attente';
    const resident=aetherAtlasAuto();
    const reports=Number(snapshot?.reports)||0;
    const tone=/indisponible/i.test(resident)?'danger':/CURRENT|REPOS|PENDING|PARTAG|HAUSS|BAISS/i.test(`${status} ${resident} ${signal}`)?'good':'neutral';
    return {status,signal,score:score===null?'N/D':`${score>=0?'+':''}${score}/100`,reports:reports?`${reports}/4`:'N/D',resident,tone};
  }
  function aetherOracleModel(){
    const identity=aetherText('atlasOracleOperatorIdentity','')||aetherText('atlasOracleAsset','');
    const parts=String(identity||'').split('·').map(v=>v.trim()).filter(Boolean);
    const asset=parts[0]&&!/ATTENTE|LIVECHECK/i.test(parts[0])?parts[0]:'N/D';
    const scenario=parts[1]||'EN ATTENTE';
    const regime=(aetherText('atlasOracleOperatorBias','')||aetherText('atlasOracleBias','')).replace(/^BIAIS\s*|^Biais mesuré\s*:\s*/i,'').trim()||'N/D';
    const confidenceRaw=(aetherText('atlasOracleOperatorConfidence','')||aetherText('atlasOracleConfidence','')).replace(/^CONF\.\s*|^Confiance données\s*/i,'').trim();
    const confidence=aetherNumberFromText(confidenceRaw,/(\d+(?:[.,]\d+)?)/);
    const text=String(document.getElementById('atlasOracleV0')?.textContent||'').replace(/\s+/g,' ');
    const up=aetherNumberFromText(text,/HAUSSE\s*(\d+)\s*\/\s*100/i),down=aetherNumberFromText(text,/BAISSE\s*(\d+)\s*\/\s*100/i),coherence=aetherNumberFromText(text,/Cohérence\s*(\d+)\s*\/\s*100/i);
    let summary='Lecture en attente',tone='neutral';
    if(up!==null&&down!==null){const gap=up-down;summary=Math.abs(gap)<6?'Équilibre serré':gap>0?'Avantage haussier':'Avantage baissier';tone=Math.abs(gap)<6?'neutral':gap>0?'good':'warn';}
    return {asset,scenario,regime,confidence:confidence===null?'N/D':`${Math.round(confidence)}/100`,up:up===null?'N/D':`${Math.round(up)}/100`,down:down===null?'N/D':`${Math.round(down)}/100`,coherence:coherence===null?'N/D':`${Math.round(coherence)}/100`,summary,tone};
  }
  function aetherConvergenceModel(watch){
    const m=watch?.matrix||aetherDirectionMatrix();
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
  function aetherDivergenceModel(watch,convergence){
    const m=watch?.matrix||aetherDirectionMatrix();
    if(m.opposition)return {status:'OPPOSITION',detail:`${m.positive.map(x=>x.name).join(' + ')} / ${m.negative.map(x=>x.name).join(' + ')}`,opposed:convergence?.oppose||'Aucune',tone:'warn'};
    if(m.neutral.length)return {status:'NEUTRALITÉ',detail:`${m.neutral.map(x=>x.name).join(' + ')} restent neutres`,opposed:'Aucune',tone:'neutral'};
    if(m.coverage<2)return {status:'COUVERTURE FAIBLE',detail:`${m.coverage}/${m.total} couches disponibles · comparaison insuffisante`,opposed:'Aucune',tone:'neutral'};
    return {status:'AUCUNE FORTE',detail:'Aucune opposition directionnelle démontrée',opposed:'Aucune',tone:'good'};
  }
  function aetherWeatherModel(){
    const weather=aetherSystemState.weather||{},days=Array.isArray(weather?.daily)?weather.daily:[];
    const today=days[0]||{};const text=String(today?.text||'Prévision en attente');
    const tempPair=(text.match(/(-?\d+)\s*\/\s*(-?\d+)°/)||[]);const rain=(text.match(/pluie\s*(\d+)%/i)||[])[1];
    const level=String(weather?.risk_level||'').toLowerCase();const hasMeasure=Boolean(tempPair.length||rain||weather?.max_gust_kmh!==null&&weather?.max_gust_kmh!==undefined);const risk=!hasMeasure?'INDISPONIBLE':level==='danger'?'ORAGE':level==='warn'?'ALERTE':level==='watch'?'SURVEILLER':level==='ok'?'CALME':'INCONNU';
    return {today:tempPair.length?`${tempPair[1]}° / ${tempPair[2]}°`:'N/D',rain:rain?`${rain}%`:'N/D',gust:weather?.max_gust_kmh===null||weather?.max_gust_kmh===undefined?'N/D':`${Math.round(weather.max_gust_kmh)} km/h`,risk,detail:hasMeasure?aetherWeatherRisk():'Prévision indisponible',tone:!hasMeasure?'muted':level==='danger'?'danger':level==='warn'?'warn':level==='watch'?'neutral':level==='ok'?'good':'muted'};
  }
  function aetherComponentViewModel(snapshot,watch){
    const market=aetherMarketModel(),system=aetherSystemModel(),sources=aetherSourcesModel(snapshot),atlas=aetherAtlasModel(snapshot),oracle=aetherOracleModel(),convergence=aetherConvergenceModel(watch),divergence=aetherDivergenceModel(watch,convergence),weather=aetherWeatherModel();
    const level=String(watch?.level||'MODÉRÉ').split('·')[0].trim()||'MODÉRÉ';
    const coreTone=level==='CRITIQUE'?'danger':level==='ÉLEVÉ'?'warn':level==='FAIBLE'?'muted':'neutral';
    const why=String(watch?.why||'Évaluation Aether en attente');
    return {market,system,sources,atlas,oracle,convergence,divergence,weather,core:{level,tone:coreTone,why,watch:String(watch?.watch||'Surveillance en attente'),note:String(watch?.note||'Lecture en cours'),convergence:convergence.pct}};
  }
  function aetherComponentEventRow(entry){
    const row=document.createElement('div');row.className='aether46-event-row';
    const time=document.createElement('time');time.textContent=new Date(entry.at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    const type=document.createElement('b');type.textContent=entry.type;
    const detail=document.createElement('span');detail.textContent=aetherTimelineClip(entry.preview||entry.detail,88);detail.title=entry.detail||'';
    row.append(time,type,detail);return row;
  }
  function aetherComponentReadinessPaint(panel){
    const stage=panel?.querySelector('[data-aether-component-stage-406046]');if(!stage)return;
    if(stage.dataset.aetherReadiness406418==='hydrated')return;
    stage.dataset.aetherReadiness406418='waiting';
    aetherSet(stage,'status_system','SHELL READY','neutral');
    aetherSet(stage,'status_modules','HYDRATATION PROGRESSIVE','neutral');
    aetherSet(stage,'attention_level','EN ATTENTE','neutral');
    aetherSet(stage,'attention_why','Hydratation progressive des couches');
    aetherSet(stage,'attention_watch','Marché · News · Atlas · Oracle');
    aetherSet(stage,'system_status','EN ATTENTE','neutral');
    aetherSet(stage,'system_cpu','N/D','muted');
    aetherSet(stage,'system_ram','N/D','muted');
    aetherSet(stage,'system_gpu','N/D','muted');
    aetherSet(stage,'sources_status','EN ATTENTE','neutral');
    aetherSet(stage,'sources_binance','EN ATTENTE');
    aetherSet(stage,'sources_book','EN ATTENTE');
    aetherSet(stage,'sources_news','EN ATTENTE');
    aetherSet(stage,'sources_atlas','EN ATTENTE');
    aetherSet(stage,'atlas_status','EN ATTENTE','neutral');
    aetherSet(stage,'atlas_signal','CURRENT en attente');
    aetherSet(stage,'atlas_score','—');
    aetherSet(stage,'atlas_reports','0/4');
    aetherSet(stage,'atlas_resident','EN ATTENTE');
    aetherSet(stage,'oracle_status','EN ATTENTE','neutral');
    aetherSet(stage,'oracle_asset','—');
    aetherSet(stage,'oracle_scenario','EN ATTENTE');
    aetherSet(stage,'oracle_regime','—');
    aetherSet(stage,'oracle_confidence','—');
    aetherSet(stage,'market_status','EN ATTENTE','neutral');
    aetherSet(stage,'market_up','—');
    aetherSet(stage,'market_down','—');
    aetherSet(stage,'market_flat','—');
    ['BTC','ETH','BNB','XRP','SOL'].forEach((symbol,i)=>{aetherSet(stage,`market_coin_${i}_symbol`,symbol);aetherSet(stage,`market_coin_${i}_change`,'—');});
    aetherSet(stage,'convergence_ratio','0/4');
    aetherSet(stage,'convergence_pct','0% couv.','neutral');
    aetherSet(stage,'convergence_dominant','EN ATTENTE');
    aetherSet(stage,'convergence_confirm_label','hydratation');
    aetherSet(stage,'convergence_confirm','couches en attente');
    aetherSet(stage,'divergence_status','EN ATTENTE','neutral');
    aetherSet(stage,'divergence_detail','Couches en cours de disponibilité');
    aetherSet(stage,'divergence_oppose','—');
    aetherSet(stage,'weather_status','EN ATTENTE','neutral');
    aetherSet(stage,'weather_today','—');
    aetherSet(stage,'weather_rain','—');
    aetherSet(stage,'weather_gust','—');
    aetherSet(stage,'weather_detail','Source météo différée');
    aetherCardTone(stage,'system','neutral');
    aetherCardTone(stage,'sources','neutral');
    aetherCardTone(stage,'atlas','neutral');
    aetherCardTone(stage,'oracle','neutral');
    aetherCardTone(stage,'market','neutral');
    aetherCardTone(stage,'convergence','neutral');
    aetherCardTone(stage,'divergence','neutral');
    aetherCardTone(stage,'weather','neutral');
    aetherCardTone(stage,'core','neutral');
  }
  function aetherComponentPaint(panel,snapshot=aetherSnapshot(),watch=aetherOperatorWatch()){
    const stage=panel?.querySelector('[data-aether-component-stage-406046]');if(!stage)return;
    const vm=aetherComponentViewModel(snapshot,watch);
    stage.dataset.aetherReadiness406418='hydrated';
    const now=new Date();
    const dateText=new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).format(now);
    const timeText=new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);

    aetherSet(stage,'status_system',vm.system.status==='STABLE'?'SYSTÈME OPÉRATIONNEL':vm.system.status==='PARTIEL'?'SYSTÈME PARTIEL':vm.system.status==='SOUS CHARGE'?'SYSTÈME SOUS CHARGE':vm.system.status==='CRITIQUE'?'SYSTÈME CRITIQUE':'SYSTÈME INDISPONIBLE',vm.system.tone);
    aetherSet(stage,'status_modules',vm.sources.status==='PRÊTES'?'TOUTES LES SOURCES PRÊTES':'SOURCES PARTIELLES',vm.sources.tone);
    aetherSet(stage,'status_date',dateText);
    aetherSet(stage,'status_time',timeText);

    aetherSet(stage,'attention_level',vm.core.level,vm.core.tone);
    aetherSet(stage,'attention_why',vm.core.why);
    aetherSet(stage,'attention_watch',vm.core.watch);
    aetherSet(stage,'attention_note',vm.core.note);
    aetherSet(stage,'attention_convergence',vm.core.convergence);
    aetherCardTone(stage,'core',vm.core.tone);

    aetherSet(stage,'system_status',vm.system.status,vm.system.tone);
    aetherSet(stage,'system_cpu',aetherPctText(vm.system.cpu),aetherTone(vm.system.cpu));
    aetherSet(stage,'system_ram',aetherPctText(vm.system.ram),aetherTone(vm.system.ram,{warn:88,danger:95}));
    aetherSet(stage,'system_gpu',aetherPctText(vm.system.gpu),vm.system.gpu===null?'muted':'good');
    aetherSet(stage,'system_cpu_temp',vm.system.cpuTemp===null?'N/D':`${Math.round(vm.system.cpuTemp)}°C`);
    aetherSet(stage,'system_gpu_temp',vm.system.gpuTemp===null?'N/D':`${Math.round(vm.system.gpuTemp)}°C`);
    aetherCardTone(stage,'system',vm.system.tone);

    aetherSet(stage,'sources_status',vm.sources.status,vm.sources.tone);
    aetherSet(stage,'sources_binance',vm.sources.ratio);
    aetherSet(stage,'sources_book',vm.sources.book);
    aetherSet(stage,'sources_news',vm.sources.news);
    aetherSet(stage,'sources_atlas',vm.sources.atlasData);
    aetherCardTone(stage,'sources',vm.sources.tone);

    aetherSet(stage,'atlas_status',vm.atlas.status,vm.atlas.tone);
    aetherSet(stage,'atlas_signal',vm.atlas.signal);
    aetherSet(stage,'atlas_score',vm.atlas.score);
    aetherSet(stage,'atlas_reports',vm.atlas.reports);
    aetherSet(stage,'atlas_resident',vm.atlas.resident);
    aetherCardTone(stage,'atlas',vm.atlas.tone);

    aetherSet(stage,'oracle_status',vm.oracle.summary,vm.oracle.tone);
    aetherSet(stage,'oracle_asset',vm.oracle.asset);
    aetherSet(stage,'oracle_scenario',vm.oracle.scenario);
    aetherSet(stage,'oracle_regime',vm.oracle.regime);
    aetherSet(stage,'oracle_confidence',vm.oracle.confidence);
    aetherCardTone(stage,'oracle',vm.oracle.tone);

    aetherSet(stage,'market_status',vm.market.ready?`largeur ${vm.market.bias.toLowerCase()}`:'EN ATTENTE',vm.market.bias==='POSITIVE'?'good':vm.market.bias==='NÉGATIVE'?'warn':'neutral');
    aetherSet(stage,'market_up',vm.market.up===null?'N/D':vm.market.up,'good');
    aetherSet(stage,'market_down',vm.market.down===null?'N/D':vm.market.down,'warn');
    aetherSet(stage,'market_flat',vm.market.flat===null?'N/D':vm.market.flat);
    aetherSet(stage,'market_top5',vm.market.top5);
    for(let i=0;i<5;i++){
      const row=vm.market.top?.[i]||null;
      aetherSet(stage,`market_coin_${i}_symbol`,row?.symbol||'—');
      aetherSet(stage,`market_coin_${i}_change`,row?`${row.change>=0?'+':''}${row.change.toFixed(2)}%`:'—',row?.change>0?'good':row?.change<0?'warn':'neutral');
    }
    aetherCardTone(stage,'market',vm.market.bias==='POSITIVE'?'good':vm.market.bias==='NÉGATIVE'?'warn':'neutral');

    aetherSet(stage,'convergence_ratio',vm.convergence.ratio);
    aetherSet(stage,'convergence_pct',vm.convergence.pct,vm.convergence.tone);
    aetherSet(stage,'convergence_dominant',vm.convergence.dominant);
    aetherSet(stage,'convergence_confirm_label',vm.convergence.confirmLabel);
    aetherSet(stage,'convergence_confirm',vm.convergence.confirm);
    aetherSet(stage,'convergence_oppose',vm.convergence.oppose);
    aetherCardTone(stage,'convergence',vm.convergence.tone);

    aetherSet(stage,'divergence_status',vm.divergence.status,vm.divergence.tone);
    aetherSet(stage,'divergence_detail',vm.divergence.detail);
    aetherSet(stage,'divergence_oppose',vm.divergence.opposed);
    aetherCardTone(stage,'divergence',vm.divergence.tone);

    aetherSet(stage,'weather_status',vm.weather.risk,vm.weather.tone);
    aetherSet(stage,'weather_today',vm.weather.today);
    aetherSet(stage,'weather_rain',vm.weather.rain);
    aetherSet(stage,'weather_gust',vm.weather.gust);
    aetherSet(stage,'weather_detail',vm.weather.detail);
    aetherCardTone(stage,'weather',vm.weather.tone);

    const events=stage.querySelector('[data-aether46-events]');
    if(events){
      events.replaceChildren();
      const rows=aetherTimelineState.entries.slice(0,3);
      if(rows.length)rows.forEach(entry=>events.appendChild(aetherComponentEventRow(entry)));
      else{const empty=document.createElement('span');empty.className='aether46-empty';empty.textContent='Aucun changement significatif dans cette session.';events.appendChild(empty);}
    }
    aetherSet(stage,'events_count',`${aetherTimelineState.entries.length}/${aetherTimelineState.max}`);
    stage.dataset.attention=vm.core.tone;
  }
  function aetherComponentEnsure(panel){
    if(!panel)return null;
    const existing=panel.querySelector('[data-aether-component-stage-406046]');
    if(existing)return existing;

    // 40.6.49 keeps the 40.6.46 CLEAN REBUILD runtime: old Aether presentation is not hidden under the new one;
    // it is removed from this runtime panel. Data owners/functions remain untouched.
    panel.querySelectorAll('.aether-first-glance-grid,[data-aether-component-stage-406042],.aether42-backplate,.aether42-surface').forEach(node=>node.remove());
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
    aetherComponentReadinessPaint(panel);
    stage.querySelector('[data-aether46-open="history"]')?.addEventListener('click',()=>void aetherWorkbenchOpen('history',panel));
    stage.querySelector('[data-aether46-open="details"]')?.addEventListener('click',()=>void aetherWorkbenchOpen('details',panel));
    const events=stage.querySelector('[data-aether-card-406046="events"]');
    const openEvents=()=>void aetherWorkbenchOpen('events',panel);
    events?.addEventListener('click',openEvents);
    events?.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openEvents();}});
    return stage;
  }

  function aetherPanelEnsure(){
    let panel=document.getElementById("atlasAetherStatusPanel");
    if(panel){
      if(!panel.dataset.aetherOperatorOpen)panel.dataset.aetherOperatorOpen="0";
      aetherComponentEnsure(panel);
      return panel;
    }
    panel=document.createElement("section");
    panel.id="atlasAetherStatusPanel";
    panel.hidden=true;
    panel.dataset.aetherOperatorOpen="0";
    panel.setAttribute("aria-label","Synthèse Aether");
    panel.innerHTML=`<div class="atlas-aether-panel-head"><b>AETHER · ATTENTION WATCH</b><button type="button" data-aether-close aria-label="Fermer Aether">×</button></div>`;
    document.body.appendChild(panel);
    aetherComponentEnsure(panel);
    panel.querySelector("[data-aether-close]")?.addEventListener("click",()=>aetherPanelSet(false));
    return panel;
  }
  /* 40.6.40 — AETHER NATIVE WINDOW MANAGER BRIDGE */
  function aetherNativeWindowManager(){
    const manager=globalThis.ErithAdministratorWindows;
    return manager?.getWindow?.('aether-watch')?manager:null;
  }
  function aetherPanelSet(open){
    const button=document.getElementById("atlasAetherStatusToggle");
    const panel=open?aetherPanelEnsure():document.getElementById("atlasAetherStatusPanel");
    const manager=aetherNativeWindowManager();
    if(panel){
      panel.dataset.aetherOperatorOpen=open?"1":"0";
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
      aetherPanelFocus("glance",panel);
      aetherCorePaint();
      if(aetherMarketDataReady())aetherMarkMarketReady("operator-open");
    }
  }
  function renderAether(){
    if(!aetherExposureState.exposed)return null;
    const s=aetherSnapshot();
    const put=(id,value)=>{const n=document.getElementById(id);if(n&&n.textContent!==value)n.textContent=value;};
    // 40.4.130 — restore the healthy semantic INFO contract. No global INFO marquee.
    // Long News text belongs only to the dedicated VEILLE phase.
    if(AETHER_RIBBON_ENABLED){
      put("atlasAetherRibbonMarket","");
      put("atlasAetherRibbonAtlas",`Atlas · ${s.atlas}`);
      put("atlasAetherRibbonOracle",`Oracle · ${s.oracle}`);
      put("atlasAetherRibbonSources",`Sources · ${s.sources}`);
      put("atlasAetherRibbonBook",`Book · ${s.book}`);
      renderAetherVeille();
      let stateLabel="VEILLE";if(/open|running|active|produ/i.test(s.currentStatus))stateLabel="CURRENT";else if(s.reports>=4)stateLabel="ATLAS 4/4";else if(s.oracle&&!/ATTENTE/.test(s.oracle))stateLabel="ORACLE";try{const feed=aetherVeilleCurrent();if(feed.kind==="context")stateLabel="CONTEXTE";else if(feed.tone==="danger")stateLabel="ATTENTION";}catch(_){}put("atlasAetherStatusLabel",`Aether · ${stateLabel}`);
    }
    const watch406027=aetherOperatorWatch();aetherTimelineCapture(watch406027);const panel=document.getElementById("atlasAetherStatusPanel");if(panel&&panel.dataset.aetherOperatorOpen==="1"&&!panel.hidden){const row=(k,v)=>{const n=panel.querySelector(`[data-aether-row="${k}"]`);if(n)n.textContent=v;};const watch406026=aetherOperatorWatch();row("level",watch406026.level);row("convergence",watch406026.convergence);row("divergence",watch406026.divergence);row("watch",watch406026.watch);row("note",watch406026.note);aetherTimelineRender(panel,{includeFull:panel.dataset.aetherFocus==="history"});row("market",aetherMarketBreadth());row("atlas_auto",aetherAtlasAuto());row("atlas",`${s.atlas} · Graphe ${s.graph}`);row("oracle",s.oracle);row("sources",`${s.sources} · Book ${s.book}`);row("system",aetherSystemBrief());row("weather",aetherWeatherFirstGlance());row("weather_risk",aetherWeatherRisk());if(panel.dataset.aetherFocus==="details")aetherDetailsRender(panel);aetherComponentPaint(panel,s,watch406026);}
  }

  const AETHER_SYSTEM_BACKEND="http://127.0.0.1:8790/system";
  const AETHER_WEATHER=Object.freeze({latitude:48.5876,longitude:1.5784,timezone:"Europe/Paris",ttl:15*60*1000,label:"Maintenon",days:5});
  const aetherSystemState={system:null,systemAt:0,systemInflight:null,weather:null,weatherAt:0,weatherInflight:null,weatherStale:false};
  const aetherSystemNumber=value=>{
    if(value===null||value===undefined)return null;
    if(typeof value==="string"&&!value.trim())return null;
    const n=Number(value);
    return Number.isFinite(n)?n:null;
  };
  const aetherSystemPercent=value=>{const n=aetherSystemNumber(value);return n!==null&&n>=0&&n<=100?n:null;};
  const aetherSystemTemperature=value=>{const n=aetherSystemNumber(value);return n!==null&&n>0&&n<150?n:null;};
  function aetherSystemSet(key,value,{icon=null,tone=null,title=null}={}){
    const item=document.querySelector(`#atlasAetherSystem [data-aether-system="${key}"]`);if(!item)return;
    const out=item.querySelector(".atlas-aether-system-value");if(out&&out.textContent!==String(value))out.textContent=String(value);
    if(icon){const node=item.querySelector(".atlas-aether-system-icon");if(node&&node.textContent!==icon)node.textContent=icon;}
    if(title)item.title=title;
    if(key==="btc")item.dataset.tone=tone||"flat";
  }
  function aetherWeatherIcon(code){const c=aetherSystemNumber(code);if(c===null)return"·";if(c===0)return"☀";if([1,2,3].includes(c))return"☁";if([45,48].includes(c))return"≋";if((c>=51&&c<=67)||(c>=80&&c<=82))return"☂";if((c>=71&&c<=77)||(c>=85&&c<=86))return"❄";if(c>=95)return"⚡";return"☁";}
  function aetherBtc(){
    try{
      const coin=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins.find(row=>String(row?.symbol||"").toUpperCase()==="BTC"||row?.id==="bitcoin"):null;
      const display=aetherDisplayPrice(coin),price=display.value,change=aetherSystemNumber(coin?.change24h);
      if(price===null||price<=0)return{value:"—",tone:"flat",title:`BTC ${display.currency} indisponible · aucune estimation`};
      const priceText=aetherFormatDisplayPrice(price,display.currency,price>=1000?0:2);
      const changeText=change===null?"":` · ${change>=0?"+":""}${change.toFixed(2)} %`;
      return{value:`${priceText}${changeText}`,tone:change>0?"positive":change<0?"negative":"flat",title:`Bitcoin · prix ${display.currency} explicite · Agent-Crypto`};
    }catch(_){return{value:"—",tone:"flat",title:"BTC live indisponible"};}
  }
  function renderAetherSystem(){
    const sys=aetherSystemState.system||{};
    const cpu=aetherSystemPercent(sys?.cpu?.usage_pct),cpuTemp=aetherSystemTemperature(sys?.cpu?.temperature_c);
    const gpuStatus=String(sys?.gpu?.status||"").trim().toLowerCase();
    const gpu=gpuStatus&&gpuStatus!=="ok"?null:aetherSystemPercent(sys?.gpu?.usage_pct);
    const gpuTemp=gpuStatus&&gpuStatus!=="ok"?null:aetherSystemTemperature(sys?.gpu?.temperature_c);
    const ram=aetherSystemPercent(sys?.memory?.usage_pct),used=aetherSystemNumber(sys?.memory?.used_gb),total=aetherSystemNumber(sys?.memory?.total_gb);
    aetherSystemSet("cpu",cpu===null?"N/D":`${Math.round(cpu)} %${cpuTemp===null?"":` · ${Math.round(cpuTemp)}°`}`,{title:sys?.cpu?.name||"CPU Windows · backend local 8790"});
    aetherSystemSet("gpu",gpu===null?"N/D":`${Math.round(gpu)} %${gpuTemp===null?"":` · ${Math.round(gpuTemp)}°`}`,{title:sys?.gpu?.name||"GPU · backend local 8790"});
    const ramDetail=used!==null&&total!==null&&total>0&&used>=0&&used<=total?` · ${used.toFixed(1)}/${total.toFixed(1)} Go`:"";
    aetherSystemSet("ram",ram===null?"N/D":`${Math.round(ram)} %${ramDetail}`,{title:"RAM Windows · backend local 8790"});
    const weather=aetherSystemState.weather;
    const weatherTemp=aetherSystemNumber(weather?.temperature_c);
    aetherSystemSet("weather",weatherTemp!==null&&weatherTemp>=-80&&weatherTemp<=60?`${Math.round(weatherTemp)} °C${aetherSystemState.weatherStale?" · cache":""}`:"N/D",{icon:aetherWeatherIcon(weather?.weather_code),title:`Maintenon · Eure-et-Loir · Open-Meteo${aetherSystemState.weatherStale?" · dernière valeur valide conservée":""}`});
    const btc=aetherBtc();aetherSystemSet("btc",btc.value,{tone:btc.tone,title:btc.title});
  }
  function aetherSystemBackend(force=false){
    const now=Date.now();if(aetherSystemState.systemInflight)return aetherSystemState.systemInflight;
    if(!force&&now-aetherSystemState.systemAt<15000){renderAetherSystem();return Promise.resolve(aetherSystemState.system);}
    const controller=new AbortController(),timeout=window.setTimeout(()=>controller.abort(),1800);
    aetherSystemState.systemInflight=fetch(AETHER_SYSTEM_BACKEND,{cache:"no-store",headers:{Accept:"application/json"},signal:controller.signal})
      .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();})
      .then(payload=>{aetherSystemState.system=payload&&payload.read_only===true?payload:null;aetherSystemState.systemAt=Date.now();return aetherSystemState.system;})
      .catch(()=>{aetherSystemState.system=null;aetherSystemState.systemAt=Date.now();return null;})
      .finally(()=>{window.clearTimeout(timeout);aetherSystemState.systemInflight=null;renderAetherSystem();});
    return aetherSystemState.systemInflight;
  }
  function aetherWeatherForecast(payload){
  const t=aetherSystemNumber(payload?.current?.temperature_2m),c=aetherSystemNumber(payload?.current?.weather_code),d=payload?.daily||{},times=Array.isArray(d.time)?d.time:[],codes=Array.isArray(d.weather_code)?d.weather_code:[],maxs=Array.isArray(d.temperature_2m_max)?d.temperature_2m_max:[],mins=Array.isArray(d.temperature_2m_min)?d.temperature_2m_min:[],probs=Array.isArray(d.precipitation_probability_max)?d.precipitation_probability_max:[],gusts=Array.isArray(d.wind_gusts_10m_max)?d.wind_gusts_10m_max:[],fmt=new Intl.DateTimeFormat("fr-FR",{weekday:"short",day:"2-digit"});
  const daily=times.slice(0,5).map((time,i)=>{let label=time;try{label=fmt.format(new Date(`${time}T12:00:00`));}catch(_){}const hi=aetherSystemNumber(maxs[i]),lo=aetherSystemNumber(mins[i]),pr=aetherSystemNumber(probs[i]),gu=aetherSystemNumber(gusts[i]),co=aetherSystemNumber(codes[i]);return {time,code:co,gust:gu,text:`${label} ${aetherWeatherIcon(co)} ${hi===null||lo===null?"N/D":`${Math.round(hi)}/${Math.round(lo)}°`}${pr===null?"":` · pluie ${Math.round(pr)}%`}${gu===null?"":` · raf. ${Math.round(gu)} km/h`}`};});
  const h=payload?.hourly||{},ht=Array.isArray(h.time)?h.time:[],hc=Array.isArray(h.weather_code)?h.weather_code:[],hp=Array.isArray(h.precipitation_probability)?h.precipitation_probability:[],hg=Array.isArray(h.wind_gusts_10m)?h.wind_gusts_10m:[];let thunder=null,maxG=null,maxAt="",maxP=null;for(let i=0;i<ht.length;i++){const co=aetherSystemNumber(hc[i]),gu=aetherSystemNumber(hg[i]),pr=aetherSystemNumber(hp[i]);if(co!==null&&co>=95&&!thunder)thunder={time:ht[i],gust:gu,prob:pr};if(gu!==null&&(maxG===null||gu>maxG)){maxG=gu;maxAt=ht[i];}if(pr!==null&&(maxP===null||pr>maxP))maxP=pr;}
  const when=x=>{try{return new Intl.DateTimeFormat("fr-FR",{weekday:"short",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(x));}catch(_){return x||"";}};let level="ok",risk="";if(thunder){level="danger";risk=`⚡ Orage prévu ${when(thunder.time)}${thunder.prob===null?"":` · pluie ${Math.round(thunder.prob)}%`}${thunder.gust===null?"":` · raf. ${Math.round(thunder.gust)} km/h`}`;}else if(maxG!==null&&maxG>=70){level="warn";risk=`Rafales fortes prévues ${when(maxAt)} · max ${Math.round(maxG)} km/h · surveiller alimentation/réseau`;}else if(maxG!==null&&maxG>=55){level="watch";risk=`Vent soutenu sur 5 j · rafales max ${Math.round(maxG)} km/h · aucun orage WMO signalé`;}else risk=`Aucun orage WMO signalé sur 5 j${maxG===null?"":` · rafales max ${Math.round(maxG)} km/h`}${maxP===null?"":` · pluie max ${Math.round(maxP)}%`}`;return {temperature_c:t,weather_code:c,daily,daily_summary:daily.map(x=>x.text).join(" | "),risk_level:level,electrical_risk:risk,max_gust_kmh:maxG,first_thunder:thunder};
}
  function aetherSystemWeather(force=false){
    const now=Date.now();if(aetherSystemState.weatherInflight)return aetherSystemState.weatherInflight;
    if(!force&&now-aetherSystemState.weatherAt<AETHER_WEATHER.ttl){renderAetherSystem();return Promise.resolve(aetherSystemState.weather);}
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${AETHER_WEATHER.latitude}&longitude=${AETHER_WEATHER.longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_gusts_10m_max&hourly=weather_code,precipitation_probability,wind_gusts_10m&forecast_days=${AETHER_WEATHER.days}&timezone=${encodeURIComponent(AETHER_WEATHER.timezone)}`;
    aetherSystemState.weatherInflight=fetch(url,{cache:"no-store",headers:{Accept:"application/json"}})
      .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();})
      .then(payload=>{const forecast=aetherWeatherForecast(payload);aetherSystemState.weather=forecast;aetherSystemState.weatherStale=false;aetherSystemState.weatherAt=Date.now();return forecast;})
      .catch(()=>{aetherSystemState.weatherStale=Boolean(aetherSystemState.weather);aetherSystemState.weatherAt=Date.now();return aetherSystemState.weather;})
      .finally(()=>{aetherSystemState.weatherInflight=null;renderAetherSystem();renderAether();});
    return aetherSystemState.weatherInflight;
  }
  function aetherSystemRefresh({force=false}={}){
    renderAetherSystem();
    if(document.hidden)return Promise.resolve(false);
    return Promise.allSettled([aetherSystemBackend(force),aetherSystemWeather(force)]);
  }

  const aetherLazyState={marketReady:false,corePainted:false,networkScheduled:false,newsScheduled:false,reason:"boot"};
  function aetherMarketDataReady(){
    try{return typeof state!=="undefined"&&Array.isArray(state?.coins)&&state.coins.length>0;}catch(_){return false;}
  }
  function aetherIdle(callback){
    if(typeof window.requestIdleCallback==="function")return window.requestIdleCallback(()=>callback(),{timeout:1200});
    return window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>callback()));
  }
  function aetherCorePaint(){
    if(!aetherExposureState.exposed)return false;
    aetherLazyState.corePainted=true;
    renderAether();
    if(AETHER_RIBBON_ENABLED){
      renderAetherSystem();
      renderAetherVeille();
    }
    return true;
  }
  function aetherScheduleNews(){
    if(aetherLazyState.newsScheduled)return;
    aetherLazyState.newsScheduled=true;
    aetherIdle(()=>{
      Promise.resolve(aetherWakeNewsSentinel()).finally(()=>{
        try{aetherExposeWhenNewsSetReady("news-schedule-settled");}catch(_){}
      });
    });
  }
  function aetherScheduleNetwork({force=false}={}){
    if(aetherLazyState.networkScheduled||document.hidden)return;
    aetherLazyState.networkScheduled=true;
    aetherIdle(()=>{
      aetherLazyState.networkScheduled=false;
      Promise.resolve(aetherSystemRefresh({force})).finally(()=>aetherScheduleNews());
    });
  }
  function aetherMarkMarketReady(reason="market"){
    aetherLazyState.marketReady=true;
    aetherLazyState.reason=reason;
    // 40.6.419 — invert the old causality: do not paint Aether here.
    // Primary UI stays native while system/network work runs; News settles first, then exposes Aether.
    aetherScheduleNetwork({force:false});
  }
  function aetherBindOracleCompletion(){
    if(globalThis.__AGENT_CRYPTO_AETHER_ORACLE_RENDER_HOOK_4088__===true)return true;
    try{
      if(typeof atlasRenderOracleV0!=="function")return false;
      const base=atlasRenderOracleV0;
      atlasRenderOracleV0=function atlasRenderOracleV0Aether(){
        const result=base.apply(this,arguments);
        if(aetherLazyState.corePainted)queueMicrotask(()=>{try{renderAether();}catch(_){}});
        return result;
      };
      globalThis.__AGENT_CRYPTO_AETHER_ORACLE_RENDER_HOOK_4088__=true;
      return true;
    }catch(_){return false;}
  }

  function aetherBindMarketCompletion(){
    if(globalThis.__AGENT_CRYPTO_AETHER_MARKET_COMPLETION_HOOK_4086__===true)return true;
    try{
      if(typeof atlasAfterLivecheck!=="function")return false;
      const base=atlasAfterLivecheck;
      atlasAfterLivecheck=function atlasAfterLivecheckAether(options={}){
        const result=base.apply(this,arguments);
        const settle=()=>{try{aetherMarkMarketReady("atlasAfterLivecheck");}catch(_){}};
        if(result&&typeof result.finally==="function")result.finally(settle);else queueMicrotask(settle);
        return result;
      };
      globalThis.__AGENT_CRYPTO_AETHER_MARKET_COMPLETION_HOOK_4086__=true;
      return true;
    }catch(_){return false;}
  }


  function refreshAether({force=false}={}){
    // 40.6.419 — manual refresh respects the same exposure contract as automatic boot.
    const news=Promise.resolve(aetherWakeNewsSentinel()).finally(()=>{
      try{aetherExposeWhenNewsSetReady("manual-refresh-news-settled");}catch(_){}
    });
    return Promise.allSettled([aetherSystemRefresh({force}),news]);
  }

  function bindAether(){
    const button=document.getElementById("atlasAetherStatusToggle");
    if(button&&button.dataset.aetherBound!=="1"){
      button.dataset.aetherBound="1";
      button.addEventListener("click",()=>{
        const manager=aetherNativeWindowManager();
        const panel=document.getElementById("atlasAetherStatusPanel");
        let nativeHidden=false;
        try{nativeHidden=Boolean(panel&&(panel.hidden||getComputedStyle(panel).display==='none'||panel.getClientRects().length===0));}catch(_){}
        const shouldOpen=!panel||panel.dataset?.aetherOperatorOpen!=="1"||nativeHidden;
        if(!AETHER_RIBBON_ENABLED&&shouldOpen&&!aetherExposureState.exposed){
          aetherExposureState.exposed=true;
          aetherExposureState.exposedAt=Date.now();
          aetherExposureState.reason="trader-operator-open";
        }
        aetherPanelSet(shouldOpen);
      });
    }
    if(!AETHER_RIBBON_ENABLED){
      // Trader keeps the native status lane permanently. The Aether ribbon is
      // resident but disabled on this surface, so its phase must never hide
      // Relancer / Rafraîchir / Décision / Sources / Chronos.
      aetherPhaseApply("native","trader-ribbon-disabled");
      const ribbon=document.getElementById("atlasAetherRibbon");
      if(ribbon){
        ribbon.dataset.aetherRuntime="disabled";
        ribbon.setAttribute("aria-hidden","true");
      }
      document.documentElement.dataset.aetherRibbonLoaded="0";
      return;
    }
    const quickPanel=document.getElementById("atlasAetherSystem");
    if(quickPanel&&quickPanel.dataset.aetherDetailBound!=="1"){
      quickPanel.dataset.aetherDetailBound="1";
      quickPanel.setAttribute("role","button");
      quickPanel.setAttribute("tabindex","0");
      quickPanel.setAttribute("aria-label","Ouvrir Aether : météo Maintenon 5 jours, risque météo, système et Atlas AUTO");
      quickPanel.setAttribute("title","Ouvrir Aether · météo 5 j · risque · système · Atlas AUTO");
      quickPanel.style.cursor="pointer";
      const openDetail=()=>aetherPanelSet(true);
      quickPanel.addEventListener("click",openDetail);
      quickPanel.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();openDetail();}});
    }
    window.addEventListener("erith:operator-priority-release",()=>{if(aetherExposureState.exposed){renderAether();renderAetherSystem();renderAetherVeille();}},{passive:true});
    const feed=document.getElementById("atlasAetherVeille");
    if(feed&&feed.dataset.aetherNewsNavBound!=="1"){
      feed.dataset.aetherNewsNavBound="1";
      feed.setAttribute("role","button");
      feed.setAttribute("tabindex","0");
      feed.setAttribute("aria-label","Ouvrir News Sentinel · actualités françaises et anglaises qualifiées");
      feed.setAttribute("title","Ouvrir News Sentinel · FR + EN");
      feed.style.cursor="pointer";
      const openNews=()=>{
        const details=document.getElementById("news-sentinel");
        if(!details)return false;
        const activeEvent=aetherVeilleState.last?.event||null;
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
    // 40.6.425 — CSS animationiteration is retired as a phase owner.
    // Operator bridge requests enter the same canonical state machine.
    if(document.documentElement.dataset.aetherSinglePhaseBridgeBound!=="1"){
      document.documentElement.dataset.aetherSinglePhaseBridgeBound="1";
      window.addEventListener("erith:aether-native-hold",event=>aetherPhaseHoldNative(event?.detail?.reason||"operator-bridge"),{passive:true});
      window.addEventListener("erith:aether-native-resume",event=>aetherPhaseResumeAutomatic(event?.detail?.reason||"operator-bridge"),{passive:true});
    }
    if(document.documentElement.dataset.aetherCadenceVisibilityBound!=="1"){
      document.documentElement.dataset.aetherCadenceVisibilityBound="1";
      document.addEventListener("visibilitychange",()=>aetherCadenceVisibilitySync("visibilitychange"),{passive:true});
      window.addEventListener("pageshow",()=>aetherCadenceVisibilitySync("pageshow"),{passive:true});
      aetherCadenceVisibilitySync("bind");
    }
    // 40.6.453 — Source readiness truth is event-driven: Aether repaints when Source Intelligence settles.
    if(document.documentElement.dataset.aetherSourceTruth406453Bound!=="1"){
      document.documentElement.dataset.aetherSourceTruth406453Bound="1";
      const refreshSourceTruth406453=()=>{if(aetherExposureState.exposed)queueMicrotask(()=>{try{renderAether();}catch(_){}});};
      document.addEventListener("erith:source-intelligence",refreshSourceTruth406453,{passive:true});
      document.addEventListener("erith:source-intelligence-auto",refreshSourceTruth406453,{passive:true});
      window.addEventListener("erith:private-source-runtime-loaded",refreshSourceTruth406453,{passive:true});
    }
    aetherBindMarketCompletion();
    aetherBindOracleCompletion();
    // 40.6.37: do not wake Aether/Weather/News on DOMContentLoaded. Market/graph gets first useful paint.
    if(aetherMarketDataReady())aetherMarkMarketReady("state-ready");
    else window.addEventListener("load",()=>{if(aetherMarketDataReady())aetherMarkMarketReady("window-load-ready");},{once:true,passive:true});
  }

  const api=Object.freeze({
    build:"40.6.425",
    backend:AETHER_SYSTEM_BACKEND,
    weather:"Maintenon · Eure-et-Loir",
    refresh:refreshAether,
    pulse:()=>refreshAether(),
    snapshot:()=>Object.freeze({
      status:aetherSnapshot(),
      system:aetherSystemState.system,
      weather:aetherSystemState.weather,
      system_at:aetherSystemState.systemAt,
      weather_at:aetherSystemState.weatherAt,
      veille:aetherVeilleState.last||aetherVeilleCurrent(),
      veille_batch:aetherVeilleBatchSnapshot(),
      phase:aetherPhaseSnapshot()
    }),
    single_lane:AETHER_RIBBON_ENABLED,
    ribbon_enabled:AETHER_RIBBON_ENABLED,
    surface:AETHER_SURFACE,
    phase_owner_build:"40.6.425",
    phase_snapshot:aetherPhaseSnapshot,
    phase_menu_escape:aetherPhaseHoldNative,
    phase_hold_native:aetherPhaseHoldNative,
    phase_resume_automatic:aetherPhaseResumeAutomatic,
    veille_batch_truth_build:"40.6.425",
    veille_batch_size:AETHER_VEILLE_TOP,
    veille_batch_snapshot:aetherVeilleBatchSnapshot,
    phase_visibility_truth:true,
    reading_completion_truth:true,
    single_phase_owner:true,
    automatic_native_menu:false,
    manual_native_menu:true,
    cadence_visibility_pause:true,
    presentation_owner:"admin-ribbons.css",
    phase_time_owner:"aether.js single pending setTimeout state machine",
    new_recurring_timer:true,
    bridge_telemetry_owner:false,
    telemetry_null_is_zero:false,
    market_completion_refresh:true,
    veille_owner:"News Sentinel state (read-only) via existing loadNewsLiveFeed owner",
    veille_top:AETHER_VEILLE_TOP,
    veille_new_timer:true,
    veille_feed_pulse_seconds:18,
    veille_alert_context_pairing:false,
    veille_same_event_context:true,
    veille_new_fetch:false,
    veille_existing_owner_wake:true,
    info_operator_synthesis:true,
    oracle_render_refresh:true,
    cadence_seconds:240,
    normal_seconds:0,
    info_seconds:15,
    veille_seconds:216,
    system_seconds:9,
    veille_full_batch_before_system:true,
    veille_first_visible_pulse_advances:false,
    veille_marquee_phase_synced:true,
    veille_marquee_constant_speed_px_s:AETHER_MARQUEE_SPEED_PX_S,
    info_operator_fact_cells:true,
    explanatory_context_owner:"AtlasNewsToMarketOperatorIntelligence (read-only compute)",
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
    ambiguous_asset_entity_guard_build:"40.6.386",
    ambiguous_asset_entity_guard:"LINK requires explicit Chainlink/link-token anchor before Aether eligibility or scope",
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
    aether_attention_boot_order:"market_graph -> system_weather -> news_set_ready -> aether_operator_exposure",
    aether_attention_boot_eager_refresh:false,
    aether_attention_news_set_exposure_gate:true,
    aether_attention_news_set_exposure_gate_build:"40.6.419",
    aether_attention_news_set_min_events:AETHER_NEWS_SET_MIN_EVENTS,
    aether_attention_news_set_ready:()=>aetherNewsSetReadiness(),
    aether_attention_operator_exposed:()=>aetherExposureState.exposed,
    aether_attention_progressive_readiness:false,
    aether_attention_progressive_readiness_build:"40.6.418_SUPERSEDED",
    aether_attention_progressive_readiness_network:false,
    aether_attention_progressive_readiness_timer:false,
    aether_attention_progressive_readiness_observer:false,
    aether_attention_history_dom_lazy:true,
    aether_attention_details_dom_lazy:true,
    aether_attention_new_recurring_timer:false,
    aether_attention_timeline_max:8,
    aether_attention_timeline_persistence:"runtime-session-only",
    aether_attention_timeline_new_timer:false,
    aether_attention_timeline_new_storage:false,
    aether_attention_timeline_new_network_owner:false,
    timeline:()=>aetherTimelineState.entries.map(row=>Object.freeze({...row})),
    aether_attention_new_timer:false,
    aether_attention_new_network_owner:false,
    news_translation_canonical_original_untouched:true,
    news_translation_canonical_original_preserved:true
  });
  window.addEventListener("agent-crypto:quote-architecture-changed",()=>{
    try{renderAetherSystem();renderAether();}catch(_){}
  },{passive:true});
  globalThis.AgentCryptoAether=api;
  /* Compatibility read-only alias for diagnostics that knew the R6/R7 object. */
  globalThis.AgentCryptoAetherSystem=api;

  /* 40.6.40 — DOM shell preseed only. This runs before app.js initializes the
     canonical Administrator Window Manager. No Aether data, weather, news or
     history hydration is started here; 40.6.37 graph-first scheduling remains intact. */
  try{aetherPanelEnsure();}catch(_){}


  /* 40.6.46 — CLEAN REBUILD · TRUE EXPLICIT OPEN. Geometry may be restored; visibility never is. */
  function aetherBootClosed(){
    const panel=document.getElementById("atlasAetherStatusPanel");
    const button=document.getElementById("atlasAetherStatusToggle");
    if(panel)panel.dataset.aetherOperatorOpen="0";
    if(button)button.setAttribute("aria-expanded","false");
    const manager=aetherNativeWindowManager();
    if(manager){
      if(panel)panel.hidden=false;
      manager.hide('aether-watch',true);
      return true;
    }
    if(panel)panel.hidden=true;
    return false;
  }
  window.addEventListener("erith:administrator-mirror-ready",aetherBootClosed,{once:true});
  window.addEventListener("pageshow",event=>{if(event.persisted)aetherBootClosed();},{passive:true});

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bindAether,{once:true});
  else bindAether();
})();
