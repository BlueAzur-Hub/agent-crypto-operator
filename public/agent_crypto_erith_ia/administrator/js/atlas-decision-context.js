/* Agent-Crypto @erith.IA — Atlas Decision Context
   Introduced by Administrator 40.6.114.
   40.6.117 R2 repair: canonical readers + presentation-independent DOM fallbacks.
   Purpose: compose existing read-only truths into one descriptive operator context.
   Sources: market/oracle presentation, CEX+DEX Source Intelligence, News Event Intelligence,
   Strategy A state and TRADUS shadow state.
   No fetch, recurring timer, MutationObserver, storage write, strategy mutation,
   canonical price, wallet, order or financial signal. */
(()=>{
  "use strict";

  const OWNER="atlas-decision-context";
  const REPAIR="40.6.117-r2";
  const ROOT_ID="atlasDecisionContext";
  const STYLE_ID="atlasDecisionContextStyle";
  let lastModel=null;

  const upper=value=>String(value??"").trim().toUpperCase();
  const finite=value=>{
    if(value===null||value===undefined)return null;
    if(typeof value==="string"&&!value.trim())return null;
    const n=Number(value);
    return Number.isFinite(n)?n:null;
  };
  const clone=value=>{try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}};
  const runtimeBuild=()=>String(globalThis.ErithVersionTruth?.build||new URLSearchParams(location.search).get("ac-build")||document.querySelector('meta[name="administrator-build"]')?.content||"runtime").trim();
  // textContent is intentional: Decision Context must read canonical DOM truth even when
  // an Administrator window is collapsed, offscreen or temporarily display:none.
  const bodyText=()=>String(document.body?.textContent||"").replace(/\u00a0/g," ");

  function safeCall(fn,fallback=null){try{return typeof fn==="function"?fn():fallback;}catch(_){return fallback;}}
  function firstMatch(texts,patterns,group=1){
    for(const text of texts){
      if(!text)continue;
      for(const pattern of patterns){
        const match=String(text).match(pattern);
        if(match?.[group]!=null)return match[group];
      }
    }
    return null;
  }

  function readOracleAndMarket(){
    const oracleNode=document.getElementById("atlasOracleV0")||document.querySelector('[data-atlas-oracle], [aria-label*="Oracle"]');
    const local=String(oracleNode?.textContent||oracleNode?.innerText||"").replace(/\u00a0/g," ");
    const body=bodyText();
    const texts=[local,body];

    const bias=firstMatch(texts,[
      /Biais mesur[ée]\s*:\s*(MIXTE|HAUSSIER|BAISSIER|NEUTRE)/i,
      /ORACLE\s+(?:OP[ÉE]RATEUR\s*)?.*?\b(MIXTE|HAUSSIER|BAISSIER|NEUTRE)\b/i,
      /R[ÉE]GIME\s*(MIXTE|HAUSSIER|BAISSIER|NEUTRE)/i
    ]);
    const confidence=finite(firstMatch(texts,[
      /Confiance donn[ée]es\s*(\d+)\s*\/\s*100/i,
      /CONF\.?\s*(\d+)\s*\/\s*100/i,
      /Confiance\s*(\d+)\s*\/\s*100/i
    ]));
    const direction=finite(firstMatch(texts,[
      /Atlas\s*:\s*[^\n]*?score direction\s*([+-]?\d+)\s*\/\s*100/i,
      /score direction\s*([+-]?\d+)\s*\/\s*100/i
    ]));

    let positive=null,negative=null,stable=null;
    const top5=body.match(/Top\s*5\s*[:·-]?\s*(\d+)\s*(?:\/\s*5\s*)?positifs?[\s\S]{0,40}?(\d+)\s*n[ée]gatifs?/i)
      ||body.match(/Target\s*Top\s*5[\s\S]{0,120}?(\d+)\s*actifs?\s*positifs?[\s\S]{0,40}?(\d+)\s*actifs?\s*n[ée]gatifs?[\s\S]{0,40}?(\d+)\s*actifs?\s*stables?/i);
    if(top5){
      positive=finite(top5[1]);
      negative=finite(top5[2]);
      stable=finite(top5[3]);
      if(stable===null&&positive!==null&&negative!==null)stable=Math.max(0,5-positive-negative);
    }

    const broadMarket=body.match(/(\d+)\s*hausses?[\s\S]{0,40}?(\d+)\s*baisses?[\s\S]{0,40}?(\d+)\s*stables?/i);
    const marketUp=finite(broadMarket?.[1]),marketDown=finite(broadMarket?.[2]),marketStable=finite(broadMarket?.[3]);
    const explicitTone=firstMatch([body],[/largeur\s+(n[ée]gative|positive|partag[ée]e)/i]);
    const marketTone=marketUp!==null&&marketDown!==null
      ?(marketUp>marketDown?"POSITIVE":marketDown>marketUp?"NÉGATIVE":"PARTAGÉE")
      :(positive!==null&&negative!==null
        ?(positive>negative?"POSITIVE":negative>positive?"NÉGATIVE":"PARTAGÉE")
        :explicitTone?upper(explicitTone).replace("NEGATIVE","NÉGATIVE"):"INCONNUE");

    return Object.freeze({
      oracle:Object.freeze({bias:bias?upper(bias):"INCONNU",confidence,direction_score:direction}),
      market:Object.freeze({tone:marketTone,top5_positive:positive,top5_negative:negative,top5_stable:stable,breadth_up:marketUp,breadth_down:marketDown,breadth_stable:marketStable})
    });
  }

  function readSources(){
    const api=globalThis.ErithPrivateBackendSources;
    const intel=safeCall(api?.sourceIntelligence,null);
    const cex=safeCall(api?.snapshot,null);
    const dexDiag=safeCall(globalThis.AgentCryptoDexExclusionDiagnostics?.report,null);
    const body=bodyText();
    const cexVisible=body.match(/\bCEX\s*(\d+)\s*\/\s*(\d+)/i)
      ||body.match(/Binance[^\d\n]{0,24}(\d+)\s*\/\s*(\d+)/i);
    const dexVisible=body.match(/[ée]ligibles?\s+Atlas\s*(\d+)\s*\/\s*(\d+)/i)
      ||body.match(/(\d+)\s*\/\s*(\d+)\s*[ée]ligibles?\s+Atlas/i);
    const freshnessVisible=finite(firstMatch([body],[/Fra[îi]cheur\s*(\d+)\s*s\b/i]));
    const visibleReady=/TOUTES\s+LES\s+SOURCES\s+PR[ÊE]TES|SOURCES\s+PR[ÊE]TES/i.test(body);
    const intelState=String(intel?.state||"unknown").toLowerCase();
    const visibleCex=finite(cexVisible?.[1]),visibleCexTotal=finite(cexVisible?.[2]);
    const visibleDex=finite(dexVisible?.[1]),visibleDexTotal=finite(dexVisible?.[2]);
    const visiblePartial=Number.isFinite(visibleDex)&&Number.isFinite(visibleDexTotal)&&visibleDex<visibleDexTotal;
    const visibleSourceTruth=Boolean(cexVisible||dexVisible||visibleReady);
    const state=intelState!=="unknown"?intelState:(visiblePartial?"partial":visibleSourceTruth?"visible-ready":"unknown");
    return Object.freeze({
      state,
      cex_comparable:finite(intel?.cex?.comparable_assets??visibleCex),
      cex_total:finite(intel?.cex?.total_assets??visibleCexTotal),
      cex_max_spread_pct:finite(intel?.cex?.max_spread_pct),
      dex_eligible:finite(intel?.dex?.atlas_eligible??visibleDex),
      dex_total:finite(intel?.dex?.total_assets??visibleDexTotal),
      dex_proved:finite(intel?.dex?.identity_proved),
      dex_bounded:finite(intel?.dex?.identity_bounded),
      dex_mismatch:finite(intel?.dex?.address_mismatch),
      dex_anomalies:finite(intel?.dex?.liquidity_review),
      freshness_seconds:finite(intel?.freshness?.max_age_seconds??freshnessVisible),
      dex_excluded:finite(dexDiag?.excluded_assets),
      dex_reasons:clone(dexDiag?.reasons)||{},
      cex_available:Boolean(cex||cexVisible),
      visible_fallback:!intel&&visibleSourceTruth
    });
  }

  function readNews(){
    const current=safeCall(globalThis.AtlasEventIntelligence?.current,null);
    if(current){
      return Object.freeze({
        state:"READY",
        headline:String(current?.language?.display_headline||current?.language?.headline_original||current?.event_label||"Événement qualifié"),
        family:String(current?.event_family||"market_event"),
        evidence:finite(current?.evidence?.score),
        impact:finite(current?.impact?.score),
        action:String(current?.decision?.action||"OBSERVATION"),
        causal_claim:current?.causal_claim===true,
        source:"event-intelligence"
      });
    }

    const body=bodyText();
    const visible=/News\s*Sentinel\s*[:·]?\s*(?:op[ée]rationnel|ok)|NEWS\s*\d+\s*QUALIFI[ÉE]S/i.test(body);
    if(!visible)return Object.freeze({state:"NO_DATA",headline:null,evidence:null,impact:null,action:null,causal_claim:false,source:"none"});
    const headline=firstMatch([body],[/Év[ée]nement directeur\s*:\s*([^\n]+)/i])||"News Sentinel opérationnel";
    const evidence=finite(firstMatch([body],[/News[^\n]{0,180}?preuve\s*(\d+)\s*\/\s*100/i]));
    const impact=finite(firstMatch([body],[/News[^\n]{0,180}?impact\s*(\d+)\s*\/\s*100/i]));
    return Object.freeze({state:"VISIBLE",headline:String(headline),family:"news_visible",evidence,impact,action:"OBSERVATION",causal_claim:false,source:"visible-runtime"});
  }

  function readStrategyTradus(){
    const body=bodyText();
    const compareAt=body.search(/COMPARATEUR\s+STRAT[ÉE]GIE\s+A\s*[↔<>\-]*\s*TRADUS/i);
    const compareText=compareAt>=0?body.slice(compareAt,compareAt+3200):"";
    const comparative=safeCall(globalThis.AgentCryptoStrategyTradusComparativeIntelligence?.model,null);
    if(comparative?.strategy&&comparative?.tradus){
      const strategy=Object.freeze({
        decision:String(comparative.strategy.decision||"INCONNU"),
        phase:comparative.strategy.phase||null,
        direction_score:finite(comparative.strategy.direction_score),
        state:String(comparative.strategy.state||"UNKNOWN"),
        blocker:comparative.strategy.blocker||comparative.blocker||null,
        source:comparative.strategy.source||"comparative-intelligence"
      });
      const tradusState=comparative.tradus.available?(comparative.tradus.fresh?"FRESH":"STALE"):"NO_DATA";
      const tradus=Object.freeze({
        state:tradusState,
        action:upper(comparative.tradus.action||"NO_TRADE")||"NO_TRADE",
        imbalance:finite(comparative.tradus.imbalance),
        spread:finite(comparative.tradus.spread),
        comparison:String(comparative.comparison?.state||"NON COMPARABLE"),
        comparison_text:String(comparative.comparison?.plain||comparative.comparison?.raw_text||""),
        fresh:Boolean(comparative.tradus.fresh),
        source:"comparative-intelligence"
      });
      return Object.freeze({strategy,tradus});
    }

    const canonical=globalThis.AgentCryptoTradusStrategyFailClosed;
    const historical=globalThis.AgentCryptoTradusStrategyReconcile;
    const raw=safeCall(canonical?.readStrategyA,null)
      ||safeCall(historical?.readStrategyA,{decision:"INCONNU",phase:null,direction_score:null})
      ||{decision:"INCONNU"};
    const state=canonical?.stateOf?.(raw)||"UNKNOWN";
    let strategy=Object.freeze({decision:String(raw.decision||"INCONNU"),phase:raw.phase||null,direction_score:finite(raw.direction_score),state,blocker:raw.blocker||null,source:raw.source||"fallback"});

    if(upper(strategy.state)==="UNKNOWN"&&compareText){
      const visibleDecision=firstMatch([compareText],[/Strategy\s*A\s*(NO\s*TRADE|PAPER|BUY|SELL|OFF|STOP)\b/i]);
      const visibleState=firstMatch([compareText],[/Strategy\s*A\s*(?:NO\s*TRADE|PAPER|BUY|SELL|OFF|STOP)?\s*[·|\-]?\s*(WAIT|PAPER|BUY|SELL|OFF|STOP)\b/i]);
      const visibleDirection=finite(firstMatch([compareText],[/Strategy\s*A[\s\S]{0,120}?direction\s*([+-]?\d+)\s*\/\s*100/i]));
      if(visibleDecision){
        strategy=Object.freeze({
          decision:String(visibleDecision).toUpperCase(),
          phase:null,
          direction_score:visibleDirection,
          state:String(visibleState||(/NO\s*TRADE/i.test(visibleDecision)?"WAIT":visibleDecision)).toUpperCase().replace(/\s+/g,"_"),
          blocker:firstMatch([compareText],[/verrou\s+([^\n·]+)/i])||null,
          source:"visible-comparative-runtime"
        });
      }
    }

    const row=clone(safeCall(globalThis.AgentCryptoTradusShadow?.read,null));
    if(!row){
      const visibleAction=firstMatch([compareText],[/TRADUS\s*(BUY|SELL|NO[_\s-]?TRADE)\b/i]);
      if(!visibleAction)return Object.freeze({strategy,tradus:Object.freeze({state:"NO_DATA",action:"NO_TRADE",imbalance:null,spread:null,comparison:"EN ATTENTE",comparison_text:"",fresh:false,source:"none"})});
      const visibleImbalance=finite(firstMatch([compareText],[/imbalance\s*([+-]?\d+(?:[.,]\d+)?)\s*%/i])?.replace?.(",","."));
      const visibleSpread=finite(firstMatch([compareText],[/spread\s*([+-]?\d+(?:[.,]\d+)?)\s*%/i])?.replace?.(",","."));
      const visibleComparison=firstMatch([compareText],[/Comparaison\s+maintenant\s*(CONVERGENCE|DIVERGENCE|NON\s+COMPARABLE|ACCORD|D[ÉE]SACCORD)/i])||"VISIBLE";
      const visibleFresh=/\bFRAIS\b/i.test(compareText);
      return Object.freeze({strategy,tradus:Object.freeze({
        state:visibleFresh?"FRESH":"VISIBLE",
        action:upper(visibleAction).replace(/[\s-]+/g,"_"),
        imbalance:Number.isFinite(visibleImbalance)?visibleImbalance/100:null,
        spread:Number.isFinite(visibleSpread)?visibleSpread/100:null,
        comparison:String(visibleComparison).toUpperCase(),
        comparison_text:"lecture comparative visible",
        fresh:visibleFresh,
        source:"visible-comparative-runtime"
      })});
    }
    const action=upper(row?.signal?.action||"NO_TRADE")||"NO_TRADE";
    const age=(()=>{const at=Date.parse(String(row?.at||""));return Number.isFinite(at)?Math.max(0,(Date.now()-at)/1000):null;})();
    const fresh=row?.ok===true&&age!==null&&age<=15;
    const comparison=canonical?.compare?.(strategy,row?.signal)||historical?.compare?.(strategy,row?.signal)||row?.comparison||{state:"NON COMPARABLE"};
    const tradus=Object.freeze({
      state:row?.ok===true?(fresh?"FRESH":"STALE"):"UNAVAILABLE",
      action,
      imbalance:finite(row?.signal?.imbalance),
      spread:finite(row?.signal?.spread_ratio),
      comparison:String(comparison?.state||"NON COMPARABLE"),
      comparison_text:String(comparison?.text||""),
      fresh,
      source:"tradus-shadow"
    });
    return Object.freeze({strategy,tradus});
  }

  function descriptiveDirection(market,tradus,oracle){
    const notes=[];
    if(market?.tone==="NÉGATIVE"&&tradus?.action==="SELL")notes.push("Marché et TRADUS orientés vendeurs");
    if(market?.tone==="POSITIVE"&&tradus?.action==="BUY")notes.push("Marché et TRADUS orientés acheteurs");
    if(Number.isFinite(oracle?.direction_score)&&oracle.direction_score<=-12&&tradus?.action==="SELL")notes.push("Atlas directionnel et TRADUS convergent à la baisse");
    if(Number.isFinite(oracle?.direction_score)&&oracle.direction_score>=12&&tradus?.action==="BUY")notes.push("Atlas directionnel et TRADUS convergent à la hausse");
    return notes;
  }

  function buildModel(parts){
    const market=parts.market||{},oracle=parts.oracle||{},sources=parts.sources||{},news=parts.news||{},strategy=parts.strategy||{},tradus=parts.tradus||{};
    const convergence=descriptiveDirection(market,tradus,oracle);
    const divergences=[];
    const blockers=[];

    if(upper(oracle.bias)==="MIXTE"||upper(oracle.bias)==="NEUTRE")divergences.push(`Oracle ${upper(oracle.bias)}`);
    if(["WAIT","OFF","STOP","UNKNOWN"].includes(upper(strategy.state))&&["BUY","SELL"].includes(upper(tradus.action)))divergences.push(`Strategy A ${strategy.decision||strategy.state} ne confirme pas TRADUS ${tradus.action}`);
    if(tradus.state==="STALE")blockers.push("TRADUS à rafraîchir");
    if(sources.state==="unknown")blockers.push("Source Intelligence indisponible");
    else if(sources.state==="partial")blockers.push("Source Intelligence partielle");
    if(Number.isFinite(sources.dex_total)&&Number.isFinite(sources.dex_eligible)&&sources.dex_eligible<sources.dex_total)blockers.push(`DEX ${sources.dex_eligible}/${sources.dex_total} éligibles Atlas`);
    if(news.state==="NO_DATA")blockers.push("News Intelligence indisponible");
    if(upper(strategy.state)==="STOP")blockers.push("Strategy A en STOP");
    if(upper(strategy.state)==="UNKNOWN")blockers.push("Strategy A inconnue");

    const known=[market.tone!=="INCONNUE",upper(oracle.bias)!=="INCONNU",sources.state!=="unknown",news.state!=="NO_DATA",upper(strategy.state)!=="UNKNOWN",tradus.state!=="NO_DATA"].filter(Boolean).length;
    let verdict="OBSERVER";
    if(known<4)verdict="INCOMPLET";
    else if(upper(strategy.state)==="STOP")verdict="STOP / OBSERVER";
    else if(blockers.length===0&&convergence.length>=1&&!["MIXTE","NEUTRE","INCONNU"].includes(upper(oracle.bias)))verdict="COHÉRENCE DESCRIPTIVE";
    else if(convergence.length>=1)verdict="CONVERGENCE DESCRIPTIVE · OBSERVER";

    const summary=[];
    if(market.tone&&market.tone!=="INCONNUE")summary.push(`marché ${market.tone.toLowerCase()}`);
    if(oracle.bias&&upper(oracle.bias)!=="INCONNU")summary.push(`Oracle ${oracle.bias}${Number.isFinite(oracle.confidence)?` ${oracle.confidence}/100`:""}`);
    if(strategy.decision)summary.push(`Strategy A ${strategy.decision}`);
    if(tradus.action)summary.push(`TRADUS ${tradus.action}`);
    if(sources.state!=="unknown")summary.push(`sources ${sources.state==="ready"?"prêtes":sources.state==="visible-ready"?"visibles prêtes":"partielles"}`);

    return Object.freeze({
      schema:"agent_crypto_atlas_decision_context_v2",
      owner:OWNER,
      repair:REPAIR,
      build:runtimeBuild(),
      generated_at_utc:new Date().toISOString(),
      market:Object.freeze({...market}),oracle:Object.freeze({...oracle}),sources:Object.freeze({...sources}),news:Object.freeze({...news}),strategy:Object.freeze({...strategy}),tradus:Object.freeze({...tradus}),
      convergence:Object.freeze(convergence),divergences:Object.freeze(divergences),blockers:Object.freeze(blockers),
      completeness:`${known}/6`,
      verdict,
      summary:summary.join(" · "),
      stop_point:blockers.length?blockers.join(" · "):"Aucun verrou technique supplémentaire détecté ; validation humaine maintenue.",
      contract:Object.freeze({read_only:true,descriptive_only:true,financial_signal:false,automatic_order:false,canonical_price_created:false,strategy_mutation:false,market_data_mutation:false,fetch:false,recurring_timer:false,observer:false,storage_write:false})
    });
  }

  function snapshot(){
    const om=readOracleAndMarket();
    const pair=readStrategyTradus();
    return buildModel({market:om.market,oracle:om.oracle,sources:readSources(),news:readNews(),strategy:pair.strategy,tradus:pair.tradus});
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
      #${ROOT_ID}{margin:12px 0;padding:14px;border:1px solid rgba(94,232,207,.32);border-radius:14px;background:linear-gradient(135deg,rgba(4,26,37,.91),rgba(11,17,38,.92));box-shadow:0 14px 32px rgba(0,0,0,.16),inset 0 0 0 1px rgba(255,255,255,.025)}
      #${ROOT_ID} .adc-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap}
      #${ROOT_ID} .adc-kicker{font-size:8px;font-weight:950;letter-spacing:.16em;text-transform:uppercase;color:#74f2dc}
      #${ROOT_ID} .adc-title{margin:3px 0 0;font-size:15px;font-weight:950;color:#fff1b3}
      #${ROOT_ID} .adc-sub{margin-top:4px;font-size:9px;line-height:1.5;opacity:.76}
      #${ROOT_ID} .adc-verdict{padding:8px 11px;border-radius:999px;border:1px solid rgba(255,217,125,.38);background:rgba(255,217,125,.08);font-size:9px;font-weight:950;color:#ffe39a;white-space:nowrap}
      #${ROOT_ID} .adc-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:12px}
      #${ROOT_ID} .adc-card{padding:9px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(2,14,23,.52);min-width:0}
      #${ROOT_ID} .adc-card span{display:block;font-size:7px;font-weight:950;letter-spacing:.09em;text-transform:uppercase;opacity:.64}
      #${ROOT_ID} .adc-card b{display:block;margin-top:4px;font-size:10.5px;line-height:1.35;overflow-wrap:anywhere}
      #${ROOT_ID} .adc-card small{display:block;margin-top:4px;font-size:7.5px;line-height:1.4;opacity:.68}
      #${ROOT_ID} .adc-read{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}
      #${ROOT_ID} .adc-box{padding:9px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.07);background:rgba(1,10,18,.44);font-size:8.5px;line-height:1.5}
      #${ROOT_ID} .adc-box strong{color:#7ff0d5}
      #${ROOT_ID} .adc-stop{margin-top:8px;padding:9px 10px;border-left:3px solid #ffd97d;background:rgba(255,217,125,.055);font-size:8.5px;line-height:1.5}
      #${ROOT_ID}[data-verdict^="INCOMPLET"] .adc-verdict,#${ROOT_ID}[data-verdict^="STOP"] .adc-verdict{border-color:rgba(255,133,151,.44);color:#ff9eae;background:rgba(255,93,120,.07)}
      @media(max-width:1100px){#${ROOT_ID} .adc-grid{grid-template-columns:repeat(3,minmax(0,1fr))}#${ROOT_ID} .adc-read{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function ensureRoot(){
    let root=document.getElementById(ROOT_ID);
    if(root)return root;
    const anchor=document.getElementById("decisionDualMemory395")||document.getElementById("decisionMemoryV2")||document.getElementById("decision-board");
    if(!anchor)return null;
    ensureStyle();
    root=document.createElement("section");
    root.id=ROOT_ID;
    root.setAttribute("aria-label","Atlas Decision Context · lecture seule");
    root.innerHTML=`
      <div class="adc-head"><div><div class="adc-kicker">ATLAS DECISION CONTEXT · READ ONLY</div><h3 class="adc-title">Convergence, contradictions et raison d’attendre</h3><div class="adc-sub">Les moteurs restent indépendants. Cette carte ne recalibre rien et ne produit aucun ordre.</div></div><div class="adc-verdict" data-adc="verdict">EN ATTENTE</div></div>
      <div class="adc-grid">
        <article class="adc-card"><span>Marché</span><b data-adc="market">—</b><small data-adc="market-detail">largeur observée</small></article>
        <article class="adc-card"><span>Oracle</span><b data-adc="oracle">—</b><small data-adc="oracle-detail">biais + confiance</small></article>
        <article class="adc-card"><span>Sources</span><b data-adc="sources">—</b><small data-adc="sources-detail">CEX + DEX qualifié</small></article>
        <article class="adc-card"><span>News</span><b data-adc="news">—</b><small data-adc="news-detail">preuve sans causalité forcée</small></article>
        <article class="adc-card"><span>Strategy A</span><b data-adc="strategy">—</b><small data-adc="strategy-detail">état du pilote Paper</small></article>
        <article class="adc-card"><span>TRADUS</span><b data-adc="tradus">—</b><small data-adc="tradus-detail">shadow microstructure</small></article>
      </div>
      <div class="adc-read"><div class="adc-box"><strong>Convergences descriptives</strong><div data-adc="convergence">—</div></div><div class="adc-box"><strong>Contradictions / réserves</strong><div data-adc="divergences">—</div></div></div>
      <div class="adc-stop"><strong>STOP POINT · </strong><span data-adc="stop">—</span></div>`;
    anchor.insertAdjacentElement("afterend",root);
    return root;
  }

  function set(root,key,value){const node=root?.querySelector?.(`[data-adc="${key}"]`);if(node)node.textContent=String(value??"—");}

  function render(){
    const root=ensureRoot();
    if(!root)return null;
    const model=snapshot();lastModel=model;
    root.dataset.verdict=model.verdict;
    root.dataset.owner=OWNER;
    root.dataset.repair=REPAIR;
    set(root,"verdict",model.verdict);
    const m=model.market;
    set(root,"market",m.tone||"INCONNU");
    set(root,"market-detail",Number.isFinite(m.breadth_up)?`${m.breadth_up} hausses · ${m.breadth_down} baisses · ${m.breadth_stable} stables`:Number.isFinite(m.top5_positive)?`Top 5 · ${m.top5_positive} positifs · ${m.top5_negative} négatifs`:"largeur non lue");
    set(root,"oracle",`${model.oracle.bias}${Number.isFinite(model.oracle.confidence)?` · ${model.oracle.confidence}/100`:""}`);
    set(root,"oracle-detail",Number.isFinite(model.oracle.direction_score)?`score direction ${model.oracle.direction_score}/100`:"direction non lue");
    const sourceReady=model.sources.state==="ready"||model.sources.state==="visible-ready";
    set(root,"sources",model.sources.state==="ready"?"CEX/DEX FILTRÉS":sourceReady?"SOURCES PRÊTES":"PARTIEL");
    set(root,"sources-detail",`${Number.isFinite(model.sources.cex_comparable)?`CEX ${model.sources.cex_comparable}/${model.sources.cex_total}`:"CEX —"} · ${Number.isFinite(model.sources.dex_eligible)?`DEX ${model.sources.dex_eligible}/${model.sources.dex_total} Atlas`:sourceReady?"DEX détail non chargé":"DEX —"}`);
    set(root,"news",model.news.state!=="NO_DATA"?(model.news.action||"OBSERVATION"):"INDISPONIBLE");
    set(root,"news-detail",model.news.state!=="NO_DATA"?`${model.news.family}${Number.isFinite(model.news.evidence)?` · preuve ${model.news.evidence}/100`:""}`:"aucun événement courant structuré");
    set(root,"strategy",`${model.strategy.decision||"INCONNU"}`);
    set(root,"strategy-detail",upper(model.strategy.state)!=="UNKNOWN"&&Number.isFinite(model.strategy.direction_score)?`direction ${model.strategy.direction_score}/100 · état ${model.strategy.state}`:`état ${model.strategy.state}`);
    set(root,"tradus",`${model.tradus.action||"NO_TRADE"}`);
    set(root,"tradus-detail",`${model.tradus.state}${Number.isFinite(model.tradus.imbalance)?` · imbalance ${(model.tradus.imbalance*100).toFixed(1)} %`:""} · ${model.tradus.comparison}`);
    set(root,"convergence",model.convergence.length?model.convergence.join(" · "):"Aucune convergence directionnelle suffisante.");
    set(root,"divergences",[...model.divergences,...model.blockers].length?[...model.divergences,...model.blockers].join(" · "):"Aucune contradiction majeure détectée.");
    set(root,"stop",`${model.stop_point} · Aucun ordre automatique.`);
    document.documentElement.dataset.atlasDecisionContext=model.verdict.toLowerCase().replace(/[^a-z0-9]+/g,"-");
    document.documentElement.dataset.atlasDecisionContextReaderRepair=REPAIR;
    try{document.dispatchEvent(new CustomEvent("agentcrypto:atlas-decision-context",{detail:model}));}catch(_){}
    return model;
  }

  function schedule(){queueMicrotask(()=>{try{requestAnimationFrame(()=>render());}catch(_){try{render();}catch(__){}}});}

  ["erith:source-intelligence","erith:private-source-runtime-loaded","agentcrypto:dex-exclusion-diagnostics","agentcrypto:tradus-shadow-observation","agentcrypto:strategy-a-auto-cycle","agentcrypto:strategy-tradus-comparative-intelligence","agentcrypto:current-finalized"].forEach(name=>document.addEventListener(name,schedule,{passive:true}));
  window.addEventListener("erith:system-hydrated",schedule,{passive:true});
  window.addEventListener("pageshow",schedule,{passive:true});
  document.addEventListener("click",event=>{const label=upper(event.target instanceof Element?event.target.closest("button")?.innerText:"");if(/RAFRAÎCHIR|RELANCER|FORCER|TRADUS|D[ÉE]CISION/.test(label))schedule();},true);
  if(document.readyState==="complete")schedule();else window.addEventListener("load",schedule,{once:true,passive:true});

  function selfTest(){
    const base={market:{tone:"NÉGATIVE"},oracle:{bias:"MIXTE",confidence:87,direction_score:-4},sources:{state:"visible-ready"},news:{state:"VISIBLE"},strategy:{decision:"NO TRADE",state:"WAIT"},tradus:{state:"FRESH",action:"SELL"}};
    const a=buildModel(base);
    const b=buildModel({market:{tone:"INCONNUE"},oracle:{bias:"INCONNU"},sources:{state:"unknown"},news:{state:"NO_DATA"},strategy:{decision:"INCONNU",state:"UNKNOWN"},tradus:{state:"NO_DATA",action:"NO_TRADE"}});
    const c=buildModel({market:{tone:"POSITIVE"},oracle:{bias:"HAUSSIER",confidence:90,direction_score:20},sources:{state:"ready",dex_eligible:5,dex_total:5},news:{state:"READY"},strategy:{decision:"PAPER",state:"PAPER"},tradus:{state:"FRESH",action:"BUY"}});
    const checks=[
      finite(null)===null&&finite("")===null,
      a.verdict.includes("OBSERVER")&&a.contract.financial_signal===false,
      b.verdict==="INCOMPLET"&&b.contract.automatic_order===false,
      c.verdict==="COHÉRENCE DESCRIPTIVE"&&c.contract.strategy_mutation===false,
      c.contract.fetch===false&&c.contract.recurring_timer===false&&c.contract.storage_write===false,
      ["visible-ready","ready"].includes(base.sources.state)&&base.news.state==="VISIBLE"
    ];
    return Object.freeze({pass:checks.every(Boolean),total:checks.length,passed:checks.filter(Boolean).length,checks:Object.freeze(checks)});
  }

  globalThis.AgentCryptoAtlasDecisionContext=Object.freeze({owner:OWNER,repair:REPAIR,build:runtimeBuild(),snapshot,render,read:()=>lastModel,selfTest,read_only:true,descriptive_only:true,financial_signal:false,automatic_order:false,fetch:false,recurring_timer:false,observer:false,storage_write:false,strategy_mutation:false,trading:false,wallet:false,canonical_strategy_reader:true,late_runtime_rebind:true,presentation_independent_dom_fallback:true});
})();