(() => {
  "use strict";

  const BUILD="40.6.597";
  const $=id=>document.getElementById(id);
  const state={revision:0,pair:null,lastReason:"boot",lastAudit:null,auditTimer:0};

  const displayCurrency=()=>String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"USD").toUpperCase()==="EUR"?"EUR":"USD";
  const selected=()=>globalThis.AgentCryptoTraderMarket?.selected?.()||globalThis.getSelectedCoin?.()||null;
  const external=()=>{try{return globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()||{active:false};}catch(_){return{active:false};}};

  function canonical(){
    const coin=selected(),ext=external(),symbol=String(ext.active&&ext.base?ext.base:coin?.symbol||"").trim().toUpperCase();
    if(!symbol)return null;
    const quote=String(
      ext.active&&ext.quote?ext.quote:
      coin?.rawQuoteCurrency||coin?.quote||coin?.providerContext?.quote||
      (displayCurrency()==="USD"?"USDC":"EUR")
    ).trim().toUpperCase();
    return Object.freeze({
      id:String(ext.active&&ext.id?ext.id:coin?.id||symbol.toLowerCase()),
      symbol,
      quote,
      pair:symbol+"/"+quote,
      display_currency:displayCurrency(),
      external:!!ext.active,
      source:ext.active?"new-listing":"market"
    });
  }

  function setPill(pair,status="sync"){
    const pill=$("traderPairTruthPill");if(!pill)return;
    pill.textContent=pair?"PAIR · "+pair.pair+" · "+status.toUpperCase():"PAIR · EN ATTENTE";
    pill.dataset.state=status;
    pill.classList.toggle("warn",status==="mismatch");
    pill.classList.toggle("ok",status!=="mismatch");
  }

  function ownerState(){
    const market=globalThis.AgentCryptoTraderMarket?.snapshot?.()||null;
    const line=globalThis.AgentCryptoTraderLineChart?.snapshot?.()||null;
    const candles=globalThis.AgentCryptoMarketMicroscope?.snapshot?.()||null;
    const depth=globalThis.AgentCryptoOkxMicrostructure?.snapshot?.()||null;
    const source=globalThis.AgentCryptoTraderSourceDock?.snapshot?.()||null;
    const math=globalThis.AgentCryptoTraderMathCore?.snapshot?.()||null;
    const detail=$("detailPanel");
    return {market,line,candles,depth,source,math,detail_asset_id:detail?.dataset?.activeAsset||null};
  }

  function normalizeInstrument(value){return String(value||"").trim().toUpperCase().replace("/", "-");}
  function audit(reason="audit"){
    const pair=state.pair||canonical(),owners=ownerState(),checks=[];
    if(!pair)return Object.freeze({build:BUILD,status:"pending",reason,pair:null,checks:[]});

    const expectId=pair.id,expectSymbol=pair.symbol,expectInstrument=pair.symbol+"-"+pair.quote;
    const add=(owner,status,actual,expected,note="")=>checks.push(Object.freeze({owner,status,actual:actual??null,expected:expected??null,note}));

    add("Market",owners.market?.selected_id===expectId?"pass":"mismatch",owners.market?.selected_id,expectId);

    if(owners.line?.coin_id) add("Ligne",owners.line.coin_id===expectId?"pass":"mismatch",owners.line.coin_id,expectId);
    else add("Ligne","pending",null,expectId,"pas encore chargée");

    const candleMode=String(owners.candles?.mode||"");
    if(candleMode==="candles"){
      const requested=normalizeInstrument(owners.candles?.requestedInstrument||owners.candles?.instrument);
      const loaded=normalizeInstrument(owners.candles?.loadedInstrument||"");
      add("Bougies",requested===expectInstrument||loaded===expectInstrument?"pass":"syncing",loaded||requested,expectInstrument);
    }else add("Bougies","idle",candleMode||"native","candles","mode Ligne actif");

    if(owners.depth?.open){
      const actualAsset=String(owners.depth?.requestedAsset||owners.depth?.loadedAsset||"").toUpperCase();
      const actualQuote=String(owners.depth?.requestedQuote||owners.depth?.loadedQuote||"").toUpperCase();
      add("Profondeur",actualAsset===expectSymbol&&actualQuote===pair.quote?"pass":"syncing",(actualAsset||"—")+"/"+(actualQuote||"—"),pair.pair);
    }else add("Profondeur","idle","fermée",pair.pair);

    if(owners.source?.active_coin_id) add("Source Dock",owners.source.active_coin_id===expectId?"pass":"syncing",owners.source.active_coin_id,expectId);
    else add("Source Dock","pending",null,expectId);

    if(owners.math?.selected) add("Math Core",owners.math.selected===expectId?"pass":"mismatch",owners.math.selected,expectId);
    else add("Math Core","pending",null,expectId);

    if(owners.detail_asset_id) add("Lecture Technique",owners.detail_asset_id===expectId?"pass":"syncing",owners.detail_asset_id,expectId);
    else add("Lecture Technique","pending",null,expectId);

    const hardMismatch=checks.some(c=>c.status==="mismatch");
    const syncing=checks.some(c=>c.status==="syncing"||c.status==="pending");
    const status=hardMismatch?"mismatch":syncing?"syncing":"pass";
    const result=Object.freeze({build:BUILD,status,reason,pair,revision:state.revision,checks:Object.freeze(checks)});
    state.lastAudit=result;
    document.documentElement.dataset.traderPairTruth=status;
    setPill(pair,status==="pass"?"sync":status);
    try{window.dispatchEvent(new CustomEvent("agent-crypto:trader-pair-audit",{detail:result}));}catch(_){}
    return result;
  }

  function scheduleAudit(reason){
    clearTimeout(state.auditTimer);
    audit(reason+":now");
    state.auditTimer=setTimeout(()=>audit(reason+":settled"),900);
  }

  function publish(reason="selection"){
    const next=canonical();if(!next)return null;
    const changed=!state.pair||state.pair.id!==next.id||state.pair.quote!==next.quote||state.pair.display_currency!==next.display_currency;
    state.pair=next;state.lastReason=reason;if(changed)state.revision+=1;
    setPill(next,"syncing");
    document.documentElement.dataset.traderPair=next.pair;
    try{window.dispatchEvent(new CustomEvent("agent-crypto:trader-pair-truth-changed",{detail:Object.freeze({...next,revision:state.revision,reason})}));}catch(_){}
    scheduleAudit(reason);
    return next;
  }

  function reconcile(reason="reconcile"){
    const pair=state.pair||canonical();if(!pair)return false;
    const coin=selected();
    try{globalThis.AgentCryptoTraderMathCore?.render?.();}catch(_){}
    try{if(coin)globalThis.AgentCryptoTraderSourceDock?.select?.(coin);}catch(_){}
    try{globalThis.AgentCryptoTraderTechnicalData?.render?.("pair-truth:"+reason);}catch(_){}
    scheduleAudit(reason);
    return true;
  }

  function bind(){
    window.addEventListener("agent-crypto:trader-selection-changed",()=>queueMicrotask(()=>publish("market-selection")),{passive:true});
    window.addEventListener("agent-crypto:external-asset-changed",()=>queueMicrotask(()=>publish("external-selection")),{passive:true});
    window.addEventListener("agent-crypto:quote-architecture-changed",()=>queueMicrotask(()=>publish("currency")),{passive:true});
    window.addEventListener("agent-crypto:trader-line-loaded",()=>scheduleAudit("line-loaded"),{passive:true});
    window.addEventListener("agent-crypto:candles-technical-levels",()=>scheduleAudit("candles-loaded"),{passive:true});
    setTimeout(()=>publish("boot"),0);
  }

  globalThis.AgentCryptoTraderPairTruth=Object.freeze({
    build:BUILD,current:()=>state.pair||canonical(),publish,reconcile,audit,
    snapshot:()=>Object.freeze({build:BUILD,revision:state.revision,pair:state.pair||canonical(),last_reason:state.lastReason,last_audit:state.lastAudit}),
    read_only:true,real_order:false,single_pair_truth:true
  });

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
})();