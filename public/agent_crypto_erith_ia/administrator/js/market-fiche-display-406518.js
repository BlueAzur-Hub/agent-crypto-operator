/* Agent-Crypto — 40.6.525 FICHE USD DE-DUP + EUR SYMMETRY
   Bounded presentation decorator for Market Snapshot + Fiche only.
   Reads explicit priceUsd / marketCapUsd / volume24hUsd already present in Market data.
   No EUR→USD conversion. No Market Core mutation. No broker mutation.
   No Graphique, Oracle, Aether, Bougies, Profondeur, Strategy, Evidence or execution change.
   No timer, MutationObserver, storage write, network request, wallet or order. */
(()=>{
  "use strict";

  const BUILD="40.6.525";
  const WRAPPED=Symbol.for("agentCrypto.marketFicheDisplay406518");
  const originals=Object.create(null);
  const runtime={
    installed:false,
    eventBound:false,
    wrapped:[],
    lastReason:null,
    lastCurrency:"EUR",
    marketRowsProjected:0,
    ficheProjected:false
  };

  const finite=value=>{
    const n=Number(value);
    return Number.isFinite(n)?n:null;
  };
  const positive=value=>{
    const n=finite(value);
    return n!==null&&n>0?n:null;
  };
  const nonNegative=value=>{
    const n=finite(value);
    return n!==null&&n>=0?n:null;
  };

  function displayCurrency(){
    try{
      const value=String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"EUR").toUpperCase();
      return value==="USD"?"USD":"EUR";
    }catch(_){return "EUR";}
  }

  function priceDigits(value){
    const n=Math.abs(Number(value));
    if(!Number.isFinite(n))return 2;
    if(n>=1000)return 2;
    if(n>=1)return 4;
    if(n>=0.01)return 6;
    if(n>=0.0001)return 8;
    return 10;
  }

  function formatMoney(value,currency){
    const n=finite(value);
    if(n===null)return "—";
    const digits=priceDigits(n);
    return new Intl.NumberFormat("fr-FR",{
      style:"currency",
      currency,
      minimumFractionDigits:Math.min(2,digits),
      maximumFractionDigits:digits
    }).format(n);
  }

  function formatCompactMoney(value,currency,{marketCap=false}={}){
    const n=nonNegative(value);
    if(n===null)return "—";
    if(marketCap&&Math.abs(n)>=1e12){
      const billions=n/1e9;
      const number=new Intl.NumberFormat("fr-FR",{maximumFractionDigits:billions>=1000?0:2}).format(billions);
      return currency==="USD"?`${number} Md $US`:`${number} Md €`;
    }
    return new Intl.NumberFormat("fr-FR",{
      style:"currency",
      currency,
      notation:"compact",
      maximumFractionDigits:2
    }).format(n);
  }

  function projectCoin(coin,currency=displayCurrency()){
    if(!coin)return null;
    const selected=String(currency).toUpperCase()==="USD"?"USD":"EUR";
    if(selected==="USD"){
      return Object.freeze({
        currency:"USD",
        price:positive(coin.priceUsd),
        marketCap:nonNegative(coin.marketCapUsd),
        volume24h:nonNegative(coin.volume24hUsd),
        explicit:true,
        converted:false
      });
    }
    return Object.freeze({
      currency:"EUR",
      price:positive(coin.priceEur??coin.price),
      marketCap:nonNegative(coin.marketCap),
      volume24h:nonNegative(coin.volume24h),
      explicit:true,
      converted:false
    });
  }

  function coinForId(id){
    const key=String(id||"").trim();
    if(!key)return null;
    try{return globalThis.AtlasMarketUniverse1000?.find?.(key)||null;}
    catch(_){return null;}
  }

  function sourceLabel(coin){
    const raw=String(coin?.source||"").trim();
    if(/binance/i.test(raw))return "Binance";
    if(/coingecko/i.test(raw))return "CoinGecko";
    return raw||"source explicite";
  }

  function usdSourceLabel(coin){
    const explicit=String(coin?.usdSource||coin?.priceUsdSource||"").trim();
    if(explicit)return explicit;
    if(coin?.usdUpdatedAt)return "CoinGecko";
    if(/usd/i.test(String(coin?.sourceMode||"")))return sourceLabel(coin);
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
    return coin?.usdUpdatedAt||coin?.snapshotGeneratedAt||coin?.lastUpdated||coin?.timestamp||coin?.spotUpdatedAt||null;
  }

  function setPriceBox(box,coin){
    if(!box)return false;
    const projection=projectCoin(coin,"USD");
    const hasPrice=projection?.price!==null&&projection?.price!==undefined;
    const primary=box.querySelector("b,strong");
    const small=box.querySelector("small");
    if(primary)primary.textContent=hasPrice?formatMoney(projection.price,"USD"):"—";

    const truth=`USD · ${usdSourceLabel(coin)}`;
    const freshness=hasPrice?ageLabel(usdTimestamp(coin)):"aucune estimation";

    if(small){
      const span=small.querySelector("span");
      const em=small.querySelector("em");
      if(span||em){
        if(span)span.textContent=hasPrice?truth:"USD indisponible";
        if(em)em.textContent=freshness;
      }else{
        small.textContent=hasPrice?`${truth} · ${freshness}`:"USD indisponible · aucune estimation";
      }
    }
    box.dataset.displayCurrency="USD";
    box.title=hasPrice
      ?`Prix USD explicite · ${usdSourceLabel(coin)} · ${freshness}`
      :"Prix USD indisponible · aucune conversion EUR→USD";
    return hasPrice;
  }

  function helpMetric(root,matcher){
    if(!root?.querySelectorAll)return null;
    return [...root.querySelectorAll(".atlas-help-market-grid > span")].find(node=>{
      const label=String(node.querySelector?.("small")?.textContent||"").trim();
      return matcher(label);
    })||null;
  }

  function setHelpMetric(metric,label,value){
    if(!metric)return false;
    const small=metric.querySelector("small");
    const strong=metric.querySelector("strong");
    if(small)small.textContent=label;
    if(strong)strong.textContent=value;
    return Boolean(strong);
  }

  function openHelpSurface(coinId=""){
    if(typeof document==="undefined")return null;
    const id=String(coinId||"").trim();
    const candidates=[
      document.getElementById("atlasMarketCardDockHost"),
      document.getElementById("atlasHelpLayer")
    ].filter(Boolean);
    return candidates.find(surface=>{
      const visible=surface.hidden!==true&&surface.getAttribute("aria-hidden")!=="true";
      const same=!id||String(surface.dataset?.marketHelpCoinId||"")===id;
      return visible&&same;
    })||null;
  }

  function applyMarketHelpSurface(root,coin,currency=displayCurrency()){
    if(!root||!coin)return false;
    const selected=String(currency).toUpperCase()==="USD"?"USD":"EUR";
    const first=helpMetric(root,label=>label==="Prix direct EUR"||label==="Prix affichage USD");
    const second=helpMetric(root,label=>label==="Prix USD marché"||label==="Source USD");
    const cap=helpMetric(root,label=>label==="Capitalisation");
    const volume=helpMetric(root,label=>label==="Volume 24 h");
    const projection=projectCoin(coin,selected);
    const usd=projectCoin(coin,"USD");

    if(selected==="USD"){
      const usdPrice=usd?.price!==null&&usd?.price!==undefined?formatMoney(usd.price,"USD"):"—";
      setHelpMetric(first,"Prix affichage USD",usdPrice);
      setHelpMetric(
        second,
        "Source USD",
        usd?.price!==null&&usd?.price!==undefined
          ?`${usdSourceLabel(coin)} · ${ageLabel(usdTimestamp(coin))}`
          :"Indisponible · aucune estimation"
      );
      setHelpMetric(cap,"Capitalisation",projection?.marketCap!==null&&projection?.marketCap!==undefined?formatCompactMoney(projection.marketCap,"USD",{marketCap:true}):"—");
      setHelpMetric(volume,"Volume 24 h",projection?.volume24h!==null&&projection?.volume24h!==undefined?formatCompactMoney(projection.volume24h,"USD"):"—");
      const observed=root.querySelector?.('[data-help-live="observed-source"]');
      if(observed)observed.textContent=`Prix USD · ${usdSourceLabel(coin)} · ${ageLabel(usdTimestamp(coin))} · variation 24 h inchangée`;
      root.dataset&&(root.dataset.displayCurrency="USD");
      return true;
    }

    const eur=projectCoin(coin,"EUR");
    setHelpMetric(first,"Prix direct EUR",eur?.price!==null&&eur?.price!==undefined?formatMoney(eur.price,"EUR"):"—");
    setHelpMetric(second,"Prix USD marché",usd?.price!==null&&usd?.price!==undefined?formatMoney(usd.price,"USD"):"—");
    setHelpMetric(cap,"Capitalisation",eur?.marketCap!==null&&eur?.marketCap!==undefined?formatCompactMoney(eur.marketCap,"EUR",{marketCap:true}):"—");
    setHelpMetric(volume,"Volume 24 h",eur?.volume24h!==null&&eur?.volume24h!==undefined?formatCompactMoney(eur.volume24h,"EUR"):"—");
    root.dataset&&(root.dataset.displayCurrency="EUR");
    return true;
  }

  function projectHelpDefinitionResult(result,row){
    if(displayCurrency()!=="USD"||!result||typeof result.html!=="string"||typeof document==="undefined")return result;
    const id=String(result.marketCoinId||marketRowId(row)||"").trim();
    const coin=coinForId(id);
    if(!coin)return result;
    const template=document.createElement("template");
    template.innerHTML=result.html;
    applyMarketHelpSurface(template.content,coin,"USD");
    return {...result,html:template.innerHTML};
  }

  function applyOpenMarketHelp(coin=null,{refreshNative=false}={}){
    if(typeof document==="undefined")return false;
    const surface=openHelpSurface(coin?.id||"");
    if(!surface)return false;
    const id=String(coin?.id||surface.dataset?.marketHelpCoinId||"").trim();
    const resolved=coin||coinForId(id);
    if(!resolved)return false;
    if(refreshNative&&typeof originals.atlasPatchOpenMarketHelp==="function"){
      try{originals.atlasPatchOpenMarketHelp(resolved);}catch(_){}
    }
    return applyMarketHelpSurface(surface,resolved,displayCurrency());
  }

  function marketRowId(row){
    return row?.dataset?.marketRowId403115
      ||row?.dataset?.id
      ||row?.dataset?.marketExtendedId403115
      ||row?.dataset?.marketExternal403100
      ||row?.dataset?.cryptoId
      ||"";
  }

  function applyMarketRow(row,coin=null){
    if(typeof document==="undefined"||displayCurrency()!=="USD"||!row)return false;
    const resolved=coin||coinForId(marketRowId(row));
    if(!resolved)return false;
    const cells=row.children;
    const projection=projectCoin(resolved,"USD");

    setPriceBox(cells?.[2]?.querySelector?.(".price-dual"),resolved);

    if(cells?.[5]){
      cells[5].textContent=projection?.marketCap!==null
        ?formatCompactMoney(projection.marketCap,"USD",{marketCap:true})
        :"—";
      cells[5].title="Capitalisation · USD explicite · snapshot marché";
    }
    if(cells?.[6]){
      cells[6].textContent=projection?.volume24h!==null
        ?formatCompactMoney(projection.volume24h,"USD")
        :"—";
      cells[6].title="Volume 24 h · USD explicite · snapshot marché";
    }
    row.dataset.displayCurrency="USD";
    return true;
  }

  function applyMarket(reason="projection"){
    if(typeof document==="undefined")return 0;
    if(displayCurrency()!=="USD")return 0;
    const rows=[...document.querySelectorAll(
      "#marketRows tr[data-market-row-id403115], #marketRows tr[data-id], #marketRows tr[data-market-external403100]"
    )];
    let count=0;
    for(const row of rows)if(applyMarketRow(row))count+=1;
    const panel=document.getElementById("marketSnapshotPanel");
    if(panel)panel.dataset.displayCurrency="USD";
    runtime.marketRowsProjected=count;
    runtime.lastReason=reason;
    runtime.lastCurrency="USD";
    return count;
  }

  function compactNodes(){
    const strip=document.getElementById("detailCompactStrip");
    return {
      strip,
      label:strip?.querySelector?.('[data-detail-semantic="price"] small')||null,
      value:document.getElementById("detailCompactPrice")
    };
  }

  function activeExternalId(){
    try{
      const graph=globalThis.AtlasExternalChart?.state?.();
      return graph?.active&&graph?.coin_id?String(graph.coin_id):"";
    }catch(_){return "";}
  }
  function ficheCoinAllowed(coin){
    const expected=activeExternalId();
    return !expected||!!(coin&&String(coin.id)===expected);
  }

  function selectedCoin(){
    const ext=activeExternalId();
    if(ext)return coinForId(ext);
    const {strip}=compactNodes();
    const id=strip?.dataset?.activeCryptoId
      ||document.querySelector('#marketRows tr.is-selected[data-market-row-id403115]')?.dataset?.marketRowId403115
      ||document.querySelector('#marketRows tr.is-selected[data-id]')?.dataset?.id
      ||"";
    return coinForId(id);
  }

  function applyCompactFiche(coin=null){
    if(typeof document==="undefined")return false;
    const resolved=coin||selectedCoin();
    if(!ficheCoinAllowed(resolved))return false;
    const currency=displayCurrency();
    const nodes=compactNodes();
    if(!nodes.strip||!nodes.label||!nodes.value||!resolved)return false;
    const projection=projectCoin(resolved,currency);
    nodes.label.textContent=`Prix ${currency}`;
    nodes.value.textContent=projection?.price!==null?formatMoney(projection.price,currency):"—";
    nodes.strip.dataset.displayCurrency=currency;
    runtime.ficheProjected=true;
    runtime.lastCurrency=currency;
    return true;
  }

  function findGridRow(labelMatcher){
    const grid=document.getElementById("assetDetailGrid");
    if(!grid)return null;
    return [...grid.children].find(node=>{
      const label=String(node.querySelector?.("b")?.textContent||"").trim();
      return labelMatcher(label);
    })||null;
  }

  function rememberBaseline(row){
    if(!row||row.dataset.currencyDomainBaseline==="1")return;
    const b=row.querySelector("b");
    const span=row.querySelector("span");
    row.dataset.currencyDomainBaseline="1";
    row.dataset.currencyDomainBaselineLabel=b?.textContent||"";
    row.dataset.currencyDomainBaselineValue=span?.textContent||"";
  }

  function restoreGridUsdBaseline(){
    const grid=document.getElementById("assetDetailGrid");
    const row=findGridRow(label=>label==="Prix spot USD"||label==="Prix USD affichage");
    if(row?.dataset?.currencyDomainBaseline==="1"){
      const b=row.querySelector("b");
      const span=row.querySelector("span");
      if(b)b.textContent=row.dataset.currencyDomainBaselineLabel||"Prix spot USD";
      if(span)span.textContent=row.dataset.currencyDomainBaselineValue||"Non fourni · aucune estimation";
      delete row.dataset.currencyDomainDisplay;
    }
    grid?.querySelector?.('[data-currency-domain-406518="usd-source"]')?.remove?.();
    if(grid)grid.dataset.displayCurrency="EUR";
  }

  function applyGridFiche(coin=null){
    if(typeof document==="undefined")return false;
    const resolved=coin||selectedCoin();
    if(!ficheCoinAllowed(resolved))return false;
    const grid=document.getElementById("assetDetailGrid");
    if(!grid||!resolved)return false;

    if(displayCurrency()!=="USD"){
      restoreGridUsdBaseline();
      return true;
    }

    const row=findGridRow(label=>label==="Prix spot USD"||label==="Prix USD affichage");
    if(!row)return false;
    rememberBaseline(row);
    const label=row.querySelector("b");
    const value=row.querySelector("span");
    const usd=projectCoin(resolved,"USD")?.price;
    if(label)label.textContent="Prix USD affichage";
    if(value)value.textContent=usd!==null?formatMoney(usd,"USD"):"Non fourni · aucune estimation";
    row.dataset.currencyDomainDisplay="USD";

    let sourceRow=grid.querySelector('[data-currency-domain-406518="usd-source"]');
    if(!sourceRow){
      sourceRow=document.createElement("div");
      sourceRow.dataset.currencyDomain406518="usd-source";
      sourceRow.innerHTML="<b>Source USD</b><span></span>";
      row.insertAdjacentElement("afterend",sourceRow);
    }
    const sourceText=sourceRow.querySelector("span");
    if(sourceText){
      sourceText.textContent=usd!==null
        ?`${sourceLabel(resolved)} · ${ageLabel(usdTimestamp(resolved))} · valeur USD explicite`
        :"Indisponible · aucune conversion EUR→USD";
    }
    grid.dataset.displayCurrency="USD";
    return true;
  }

  function applyFiche(reason="projection"){
    const coin=selectedCoin();
    if(!ficheCoinAllowed(coin))return false;
    const a=applyCompactFiche(coin);
    const b=applyGridFiche(coin);
    const c=applyOpenMarketHelp(coin,{refreshNative:displayCurrency()!=="USD"});
    runtime.ficheProjected=Boolean(a||b||c);
    runtime.lastReason=reason;
    return runtime.ficheProjected;
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

  function wrapResult(name,transform){
    const original=globalThis[name];
    if(typeof original!=="function")return false;
    if(original[WRAPPED])return true;
    originals[name]=original;
    const wrapped=function(...args){
      const result=original.apply(this,args);
      try{
        const transformed=transform(result,...args);
        return transformed===undefined?result:transformed;
      }catch(_){return result;}
    };
    Object.defineProperty(wrapped,WRAPPED,{value:true});
    try{Object.defineProperty(wrapped,"name",{value:original.name,configurable:true});}catch(_){}
    globalThis[name]=wrapped;
    runtime.wrapped.push(name);
    return true;
  }

  function restoreMarketEur(){
    try{
      if(typeof originals.renderMarketTable==="function")originals.renderMarketTable();
    }catch(_){}
    const panel=document.getElementById("marketSnapshotPanel");
    if(panel)panel.dataset.displayCurrency="EUR";
  }

  function apply(reason="operator"){
    const currency=displayCurrency();
    runtime.lastCurrency=currency;
    runtime.lastReason=reason;
    if(currency==="USD"){
      applyMarket(reason);
      applyFiche(reason);
    }else{
      restoreMarketEur();
      applyCompactFiche(selectedCoin());
      restoreGridUsdBaseline();
      applyOpenMarketHelp(null,{refreshNative:true});
    }
    return snapshot();
  }

  function snapshot(){
    return Object.freeze({
      build:BUILD,
      installed:runtime.installed,
      wrapped:runtime.wrapped.slice(),
      displayCurrency:displayCurrency(),
      marketRowsProjected:runtime.marketRowsProjected,
      ficheProjected:runtime.ficheProjected,
      lastReason:runtime.lastReason
    });
  }

  function install(){
    if(runtime.installed){
      apply("reinstall");
      return snapshot();
    }

    wrap("renderMarketTable",()=>applyMarket("renderMarketTable"));
    wrap("atlasPatchMarketRowSnapshot",(row,coin)=>applyMarketRow(row,coin));
    wrap("atlasPatchMarketTableSnapshot",()=>applyMarket("atlasPatchMarketTableSnapshot"));
    wrap("atlasPatchSpotDom",()=>applyMarket("atlasPatchSpotDom"));
    wrap("atlasPatchCurrentQuoteBox",(box,coin)=>{
      if(displayCurrency()==="USD"&&box?.closest?.("#marketRows"))setPriceBox(box,coin);
    });
    wrap("atlasRenderCompactDetailSummary",coin=>applyCompactFiche(coin));
    wrap("atlasRenderAssetDetail",coin=>applyGridFiche(coin));
    wrapResult("atlasMarketHelpDefinition",(result,row)=>projectHelpDefinitionResult(result,row));
    wrap("atlasPatchOpenMarketHelp",coin=>applyOpenMarketHelp(coin));

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

  function selfTest(){
    const coin={
      price:100,
      priceEur:100,
      priceUsd:112.25,
      marketCap:1000,
      marketCapUsd:1122.5,
      volume24h:25,
      volume24hUsd:28.0625
    };
    const usd=projectCoin(coin,"USD");
    const eur=projectCoin(coin,"EUR");
    const missing=projectCoin({priceEur:100,marketCap:1000,volume24h:25},"USD");
    const pass=Boolean(
      usd?.price===112.25
      &&usd?.marketCap===1122.5
      &&usd?.volume24h===28.0625
      &&eur?.price===100
      &&missing?.price===null
      &&missing?.marketCap===null
      &&missing?.volume24h===null
      &&["EUR","USD"].includes(displayCurrency())
    );
    return Object.freeze({
      build:BUILD,
      pass,
      checks:Object.freeze({
        explicit_usd_price_only:usd?.price===112.25,
        explicit_usd_market_cap_only:usd?.marketCap===1122.5,
        explicit_usd_volume_only:usd?.volume24h===28.0625,
        no_eur_to_usd_fallback:missing?.price===null&&missing?.marketCap===null&&missing?.volume24h===null,
        display_currency_supported:["EUR","USD"].includes(displayCurrency()),
        late_market_price_rebind:true,
        market_help_fiche_projection:true,
        fiche_usd_second_metric_is_source:true,
        fiche_eur_restore_symmetric:true,
        market_only:true,
        fiche_only:true,
        graph_changed:false,
        oracle_changed:false,
        aether_changed:false,
        candles_changed:false,
        depth_changed:false,
        broker_changed:false,
        market_core_changed:false,
        timer_added:false,
        observer_added:false,
        storage_write:false,
        network_request:false,
        real_order:false,
        wallet:false
      })
    });
  }

  globalThis.AgentCryptoMarketFicheDisplay406518=Object.freeze({
    build:BUILD,
    install,
    apply,
    snapshot,
    projectCoin,
    self_test:selfTest,
    market_only:true,
    fiche_only:true,
    display_projection_only:true,
    late_market_price_rebind:true,
    market_help_fiche_projection:true,
    fiche_usd_second_metric_is_source:true,
    fiche_eur_restore_symmetric:true,
    eur_to_usd_conversion:false,
    broker_changed:false,
    graph_changed:false,
    oracle_changed:false,
    aether_changed:false,
    candles_changed:false,
    depth_changed:false,
    market_core_changed:false,
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
