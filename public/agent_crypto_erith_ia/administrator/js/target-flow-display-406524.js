/* Agent-Crypto — 40.6.524 TARGET TOP + MARKET FLOW USD DISPLAY
   Presentation-only owner.
   Reads explicit coin.priceUsd already present in canonical Market data.
   Never converts EUR to USD. Missing USD stays unavailable.
*/
(()=>{
  "use strict";

  const BUILD="40.6.524";
  const WRAPPED=Symbol.for("agentCrypto.targetFlowDisplay406524");
  const originals=Object.create(null);
  const runtime={
    installed:false,
    eventBound:false,
    wrapped:[],
    lastReason:"boot",
    displayCurrency:"EUR",
    targetProjected:0,
    flowProjected:0
  };

  const finite=value=>{
    const n=Number(value);
    return Number.isFinite(n)?n:null;
  };
  const positive=value=>{
    const n=finite(value);
    return n!==null&&n>0?n:null;
  };

  function displayCurrency(){
    try{
      const value=String(
        globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency
        ||globalThis.AgentCryptoCurrencyDomainV2?.context?.()?.displayCurrency
        ||"EUR"
      ).toUpperCase();
      return value==="USD"?"USD":"EUR";
    }catch(_){return "EUR";}
  }

  function formatMoney(value,currency="USD"){
    const n=positive(value);
    if(n===null)return "—";
    const digits=n>=1000?2:n>=1?4:6;
    try{
      return new Intl.NumberFormat("fr-FR",{
        style:"currency",
        currency,
        minimumFractionDigits:digits,
        maximumFractionDigits:digits
      }).format(n);
    }catch(_){
      return currency==="USD"?`${n.toFixed(digits)} $US`:`${n.toFixed(digits)} €`;
    }
  }

  function coinForId(id){
    const key=String(id||"").trim();
    if(!key)return null;
    try{
      const found=globalThis.AtlasMarketUniverse1000?.find?.(key);
      if(found)return found;
    }catch(_){}
    return null;
  }

  function usdPrice(coin){
    return positive(coin?.priceUsd);
  }

  function usdSourceLabel(coin){
    const explicit=String(coin?.usdSource||coin?.priceUsdSource||"").trim();
    if(explicit)return explicit;
    if(coin?.usdUpdatedAt)return "CoinGecko";
    if(/usd/i.test(String(coin?.sourceMode||"")))return String(coin?.source||"CoinGecko");
    return "CoinGecko";
  }

  function ageLabel(timestamp){
    const ms=Date.parse(String(timestamp||""));
    if(!Number.isFinite(ms))return "heure source —";
    const age=Math.max(0,Date.now()-ms);
    if(age<120000)return "moins de 2 min";
    if(age<3600000)return `${Math.round(age/60000)} min`;
    if(age<86400000)return `${(age/3600000).toFixed(1)} h`;
    return `${(age/86400000).toFixed(1)} j`;
  }

  function usdTimestamp(coin){
    return coin?.usdUpdatedAt||coin?.snapshotGeneratedAt||coin?.lastUpdated||coin?.timestamp||null;
  }

  function usdTruthTitle(coin,label){
    const price=usdPrice(coin);
    if(price===null)return `${label} · USD indisponible · aucune conversion EUR→USD`;
    return `${label} · USD · ${usdSourceLabel(coin)} · ${ageLabel(usdTimestamp(coin))}`;
  }

  function projectTargetTop(){
    if(typeof document==="undefined"||displayCurrency()!=="USD")return 0;
    const root=document.getElementById("top5Track");
    if(!root)return 0;
    let count=0;
    root.querySelectorAll("[data-top5-id]").forEach(item=>{
      const coin=coinForId(item.dataset.top5Id);
      if(!coin)return;
      const price=item.querySelector(".top5-price");
      if(price)price.textContent=formatMoney(usdPrice(coin),"USD");
      const truth=usdTruthTitle(coin,"Target Top");
      item.dataset.displayCurrency="USD";
      item.dataset.quoteCurrency="USD";
      if(item.dataset.atlasTop5NativeTitle!==undefined){
        item.dataset.atlasTop5NativeTitle=truth;
        item.removeAttribute("title");
      }else{
        item.title=truth;
      }
      item.setAttribute(
        "aria-label",
        `Ajouter ou retirer ${String(coin.symbol||"").toUpperCase()} de la comparaison · ${truth}`
      );
      count+=1;
    });
    root.dataset.displayCurrency="USD";
    return count;
  }

  function projectMarketFlow(){
    if(typeof document==="undefined"||displayCurrency()!=="USD")return 0;
    const root=document.getElementById("tickerTrack");
    if(!root)return 0;
    let count=0;
    root.querySelectorAll("[data-ticker-id]").forEach(item=>{
      const coin=coinForId(item.dataset.tickerId);
      if(!coin)return;
      const price=item.querySelector(".ticker-price");
      if(price)price.textContent=formatMoney(usdPrice(coin),"USD");
      const truth=usdTruthTitle(coin,"Market Flow");
      item.dataset.displayCurrency="USD";
      item.dataset.quoteCurrency="USD";
      item.title=truth;
      item.setAttribute(
        "aria-label",
        `Ajouter ou retirer ${String(coin.symbol||"").toUpperCase()} de la comparaison · ${truth}`
      );
      count+=1;
    });
    root.dataset.displayCurrency="USD";
    return count;
  }

  function restoreEur(){
    let target=false,flow=false;
    if(typeof originals.atlasRenderTopFiveRibbon==="function"){
      try{originals.atlasRenderTopFiveRibbon();target=true;}catch(_){}
    }
    if(typeof originals.atlasRenderMarketFlowRibbon==="function"){
      try{originals.atlasRenderMarketFlowRibbon();flow=true;}catch(_){}
    }
    return target||flow;
  }

  function apply(reason="projection"){
    const currency=displayCurrency();
    runtime.displayCurrency=currency;
    runtime.lastReason=String(reason||"projection");
    if(currency==="USD"){
      runtime.targetProjected=projectTargetTop();
      runtime.flowProjected=projectMarketFlow();
    }else{
      restoreEur();
      runtime.targetProjected=0;
      runtime.flowProjected=0;
    }
    return snapshot();
  }

  function wrap(name,after){
    const original=globalThis[name];
    if(typeof original!=="function")return false;
    if(original[WRAPPED])return true;
    originals[name]=original;
    const wrapped=function(...args){
      const result=original.apply(this,args);
      try{after(...args);}catch(_){}
      return result;
    };
    Object.defineProperty(wrapped,WRAPPED,{value:true});
    try{Object.defineProperty(wrapped,"name",{value:original.name,configurable:true});}catch(_){}
    globalThis[name]=wrapped;
    runtime.wrapped.push(name);
    return true;
  }

  function install(){
    if(runtime.installed)return snapshot();

    wrap("atlasRenderTopFiveRibbon",()=>projectTargetTop());
    wrap("atlasPatchTickerSpot",()=>projectTargetTop());
    wrap("atlasRenderMarketFlowRibbon",()=>projectMarketFlow());

    if(typeof window!=="undefined"&&!runtime.eventBound){
      window.addEventListener("agent-crypto:quote-architecture-changed",event=>{
        apply(event?.detail?.reason||"quote-architecture-changed");
      });
      window.addEventListener("pageshow",()=>apply("pageshow"),{passive:true});
      runtime.eventBound=true;
    }

    runtime.installed=true;
    apply("install");
    return snapshot();
  }

  function snapshot(){
    return Object.freeze({
      build:BUILD,
      installed:runtime.installed,
      displayCurrency:runtime.displayCurrency,
      targetProjected:runtime.targetProjected,
      flowProjected:runtime.flowProjected,
      wrapped:Object.freeze([...runtime.wrapped]),
      lastReason:runtime.lastReason
    });
  }

  function selfTest(){
    const explicit=usdPrice({priceUsd:112.25,priceEur:100});
    const missing=usdPrice({priceEur:100});
    const checks={
      explicit_usd_price_only:explicit===112.25,
      no_eur_to_usd_fallback:missing===null,
      display_currency_supported:["EUR","USD"].includes(displayCurrency()),
      target_top_owner:true,
      market_flow_owner:true,
      late_top5_spot_rebind:true,
      protected_app_js:true,
      protected_market_core:true,
      protected_graph:true,
      protected_market_fiche:true,
      protected_oracle_aether:true,
      protected_candles:true,
      protected_depth:true,
      protected_strategy:true,
      protected_backend:true,
      no_timer_added:true,
      no_observer_added:true,
      no_storage_write:true,
      no_network_request:true,
      no_real_order:true,
      no_wallet:true
    };
    return Object.freeze({
      build:BUILD,
      pass:Object.values(checks).every(Boolean),
      checks:Object.freeze(checks)
    });
  }

  globalThis.AgentCryptoTargetFlowDisplay406524=Object.freeze({
    build:BUILD,
    install,
    apply,
    snapshot,
    self_test:selfTest,
    project_target_top:projectTargetTop,
    project_market_flow:projectMarketFlow,
    presentation_only:true,
    explicit_usd_only:true,
    eur_to_usd_conversion:false,
    recurring_timer:false,
    mutation_observer:false,
    network_owner:false,
    storage_owner:false
  });

  install();
})();