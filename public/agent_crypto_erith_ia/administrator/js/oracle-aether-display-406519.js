/* Agent-Crypto — 40.6.519 ORACLE + AETHER USD PRESENTATION
   Oracle: presentation projection only; Oracle model / math / evidence stay EUR.
   Aether: js/aether.js reads the same DISPLAY context for its BTC presentation.
   No Graphique, Market/Fiche, Bougies, Profondeur, Strategy, Evidence, broker or execution mutation.
   No recurring timer, MutationObserver, storage write, network request, wallet or order. */
(()=>{
  "use strict";

  const BUILD="40.6.519";
  const WRAPPED=Symbol.for("agentCrypto.oracleDisplay406519");
  let installed=false;
  let originalOracleRender=null;
  let eventBound=false;

  function displayCurrency(){
    try{
      return String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"EUR").toUpperCase()==="USD"
        ?"USD"
        :"EUR";
    }catch(_){return"EUR";}
  }

  function positive(value){
    const n=Number(value);
    return Number.isFinite(n)&&n>0?n:null;
  }

  function formatMoney(value,currency){
    const n=positive(value);
    if(n===null)return"—";
    const abs=Math.abs(n);
    const digits=abs>=1000?2:abs>=1?4:abs>=.01?6:abs>=.0001?8:10;
    return new Intl.NumberFormat("fr-FR",{
      style:"currency",
      currency,
      minimumFractionDigits:Math.min(2,digits),
      maximumFractionDigits:digits
    }).format(n);
  }

  function oracleCoin(){
    try{
      const hero=String(document.getElementById("atlasOracleHeroAsset")?.textContent||"").trim().toUpperCase();
      if(!hero||hero==="TOP 5"||hero==="—")return null;
      if(typeof atlasOracleSelectCoin==="function"){
        const selected=atlasOracleSelectCoin();
        if(selected&&String(selected.symbol||selected.name||"").toUpperCase()===hero)return selected;
      }
      if(typeof state!=="undefined"&&Array.isArray(state?.coins)){
        return state.coins.find(coin=>String(coin?.symbol||coin?.name||"").toUpperCase()===hero)||null;
      }
    }catch(_){}
    return null;
  }

  function projectOraclePrice(coin,currency=displayCurrency()){
    const selected=String(currency).toUpperCase()==="USD"?"USD":"EUR";
    if(!coin)return Object.freeze({currency:selected,value:null,explicit:false,converted:false});
    const value=selected==="USD"
      ?positive(coin.priceUsd)
      :positive(coin.priceEur??coin.price);
    return Object.freeze({
      currency:selected,
      value,
      explicit:value!==null,
      converted:false
    });
  }

  function applyOraclePresentation(reason="projection"){
    if(typeof document==="undefined")return false;
    const root=document.getElementById("atlasOracleV0");
    const priceNode=document.getElementById("atlasOraclePrice");
    if(!root||!priceNode)return false;

    const currency=displayCurrency();
    root.dataset.displayCurrency=currency;
    root.dataset.currencyProjectionBuild=BUILD;

    const hero=String(document.getElementById("atlasOracleHeroAsset")?.textContent||"").trim().toUpperCase();
    if(hero==="TOP 5"||/LIVE/i.test(String(priceNode.textContent||"")))return true;

    if(currency==="USD"){
      const projection=projectOraclePrice(oracleCoin(),"USD");
      priceNode.textContent=projection.value!==null
        ?formatMoney(projection.value,"USD")
        :"USD indisponible";
      priceNode.title=projection.value!==null
        ?"Prix USD explicite du snapshot marché · Oracle Math inchangé en EUR"
        :"Prix USD explicite indisponible · aucune conversion EUR→USD";
      priceNode.dataset.displayCurrency="USD";
      priceNode.dataset.presentationOnly="true";
    }else{
      priceNode.dataset.displayCurrency="EUR";
      priceNode.dataset.presentationOnly="true";
      priceNode.removeAttribute("title");
    }

    root.dataset.currencyProjectionReason=String(reason||"projection");
    return true;
  }

  function wrapOracle(){
    if(typeof globalThis.atlasRenderOracleV0!=="function")return false;
    if(globalThis.atlasRenderOracleV0[WRAPPED])return true;

    originalOracleRender=globalThis.atlasRenderOracleV0;
    const wrapped=function(...args){
      const result=originalOracleRender.apply(this,args);
      try{applyOraclePresentation("oracle-render");}catch(_){}
      return result;
    };
    Object.defineProperty(wrapped,WRAPPED,{value:true});
    try{Object.defineProperty(wrapped,"name",{value:originalOracleRender.name,configurable:true});}catch(_){}
    globalThis.atlasRenderOracleV0=wrapped;
    return true;
  }

  function renderForCurrencyChange(reason="quote-architecture-changed"){
    try{
      if(typeof globalThis.atlasRenderOracleV0==="function")globalThis.atlasRenderOracleV0();
      else applyOraclePresentation(reason);
    }catch(_){}
    try{
      document.documentElement.dataset.oracleAetherDisplayCurrency=displayCurrency();
    }catch(_){}
  }

  function install(){
    if(installed)return snapshot();
    wrapOracle();
    if(typeof window!=="undefined"&&!eventBound){
      window.addEventListener("agent-crypto:quote-architecture-changed",event=>{
        renderForCurrencyChange(event?.detail?.reason||"quote-architecture-changed");
      },{passive:true});
      window.addEventListener("pageshow",()=>{
        try{applyOraclePresentation("pageshow");}catch(_){}
      },{passive:true});
      eventBound=true;
    }
    installed=true;
    try{applyOraclePresentation("install");}catch(_){}
    return snapshot();
  }

  function snapshot(){
    return Object.freeze({
      build:BUILD,
      installed,
      oracleWrapped:Boolean(globalThis.atlasRenderOracleV0?.[WRAPPED]),
      displayCurrency:displayCurrency(),
      oraclePresentationOnly:true,
      aetherOwner:"js/aether.js"
    });
  }

  function selfTest(){
    const coin={price:100,priceEur:100,priceUsd:112.25};
    const usd=projectOraclePrice(coin,"USD");
    const eur=projectOraclePrice(coin,"EUR");
    const missing=projectOraclePrice({price:100,priceEur:100},"USD");
    const pass=Boolean(
      usd.value===112.25
      &&usd.currency==="USD"
      &&eur.value===100
      &&eur.currency==="EUR"
      &&missing.value===null
      &&displayCurrency()==="EUR"
    );
    return Object.freeze({
      build:BUILD,
      pass,
      checks:Object.freeze({
        oracle_usd_uses_explicit_priceUsd:usd.value===112.25,
        oracle_eur_preserves_priceEur:eur.value===100,
        no_eur_to_usd_fallback:missing.value===null,
        default_display_remains_eur:displayCurrency()==="EUR",
        oracle_model_changed:false,
        oracle_math_changed:false,
        oracle_evidence_changed:false,
        graph_changed:false,
        market_fiche_changed:false,
        candles_changed:false,
        depth_changed:false,
        broker_changed:false,
        strategy_changed:false,
        timer_added:false,
        observer_added:false,
        storage_write:false,
        network_request:false,
        real_order:false,
        wallet:false
      })
    });
  }

  globalThis.AgentCryptoOracleAetherDisplay406519=Object.freeze({
    build:BUILD,
    install,
    applyOraclePresentation,
    projectOraclePrice,
    snapshot,
    self_test:selfTest,
    owners:Object.freeze(["Oracle presentation","Aether presentation"]),
    display_projection_only:true,
    oracle_model_changed:false,
    oracle_math_changed:false,
    oracle_evidence_changed:false,
    eur_to_usd_conversion:false,
    graph_changed:false,
    market_fiche_changed:false,
    candles_changed:false,
    depth_changed:false,
    broker_changed:false,
    strategy_changed:false,
    recurring_timer:false,
    mutation_observer:false,
    storage_write:false,
    network_request:false,
    real_order:false,
    wallet:false
  });

  if(typeof document!=="undefined"){
    const mount=()=>{try{install();}catch(_){}};
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
    else mount();
  }
})();
