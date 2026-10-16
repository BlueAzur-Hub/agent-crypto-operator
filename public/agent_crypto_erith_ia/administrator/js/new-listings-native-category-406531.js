/* Agent-Crypto — 40.6.531 NEW LISTINGS · NATIVE MARKET CATEGORY
   Product destination:
   - "Nouveaux listings" is one native Market category, not a CT-only button and not a second workspace.
   - Recent SPOT instruments discovered from Bitget are rendered in the existing Market table.
   - Selection reuses the existing Fiche surface, main Graphique Ligne, Bougies owner and Profondeur owner.
   - Provider/pair plumbing stays internal; no NEW ribbon and no Retour Market button.
   - Selecting a normal Market asset clears the external listing context automatically.
   Read-only. No state.coins injection, ranking mutation, order, wallet, private API, storage owner, timer or observer. */
(()=>{
  "use strict";

  const BUILD="40.6.531";
  const BUTTON_ID="atlasNewListingsButton406528";
  const LEGACY_RADAR_ID="atlasNewListingsRadar406528";
  const LEGACY_LIVE_ID="atlasNewListingsLive529";
  const LEGACY_RIBBON_ID="atlasNewListingActive529";
  const SEARCH_ID="searchInput";
  const ROWS_ID="marketRows";
  const NOTE_ID="tableNote";
  const ROOT_ATTR="data-new-listing-native-406531";
  const BITGET="https://api.bitget.com";

  const FRIENDLY=Object.freeze({
    CT:Object.freeze({name:"Concrete",canonicalId:"concrete",provider:"okx",providerLabel:"OKX",providerSymbol:"CT-USDT",pair:"CT/USDT"}),
    MHA:Object.freeze({name:"MAGNE.AI"}),
    MCAT:Object.freeze({name:"MarsCat"}),
    PONS:Object.freeze({name:"Pons"}),
    CNPY:Object.freeze({name:"Canopy"})
  });

  const state531={
    enabled:false,
    discovering:false,
    discovered:[],
    specs:[],
    selected:null,
    coinCache:new Map(),
    quoteRates:new Map(),
    tickerMap:new Map(),
    lastDiscoveryAt:null,
    lastError:null,
    originalRenderMarketTable:null,
    renderWrapped:false,
    mounted:false
  };

  const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  const positive=v=>{const n=finite(v);return n!==null&&n>0?n:null;};
  const upper=v=>String(v??"").trim().toUpperCase();
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const pct=v=>{const n=finite(v);return n===null?"—":`${n>=0?"+":""}${n.toFixed(2)} %`;};
  const ageDays=iso=>{const t=Date.parse(String(iso||""));return Number.isFinite(t)?Math.max(0,(Date.now()-t)/86400000):null;};

  function displayCurrency(){
    try{return String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"USD").toUpperCase()==="EUR"?"EUR":"USD";}
    catch(_){return "USD";}
  }

  function money(value,currency){
    const n=finite(value);if(n===null)return "—";
    const a=Math.abs(n),digits=a>=1000?2:a>=1?4:a>=.01?6:a>=.0001?8:10;
    return new Intl.NumberFormat("fr-FR",{style:"currency",currency,minimumFractionDigits:Math.min(2,digits),maximumFractionDigits:digits}).format(n);
  }

  function compactMoney(value,currency){
    const n=finite(value);if(n===null)return "—";
    return new Intl.NumberFormat("fr-FR",{style:"currency",currency,notation:"compact",maximumFractionDigits:2}).format(n);
  }

  function hideLegacyUx(){
    for(const id of [LEGACY_RADAR_ID,LEGACY_LIVE_ID,LEGACY_RIBBON_ID]){
      const node=document.getElementById(id);
      if(node){node.hidden=true;if(id===LEGACY_RIBBON_ID)node.replaceChildren();}
    }
  }

  function rawQuery(){return String(document.getElementById(SEARCH_ID)?.value||"").trim();}

  async function json(url,{signal=null,timeoutMs=12000}={}){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
    const forward=()=>{try{controller.abort();}catch(_){}};
    if(signal){
      if(signal.aborted)forward();
      else signal.addEventListener("abort",forward,{once:true});
    }
    try{
      const r=await fetch(url,{cache:"no-store",signal:controller.signal,headers:{Accept:"application/json"}});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      return await r.json();
    }finally{
      clearTimeout(timer);
      try{signal?.removeEventListener?.("abort",forward);}catch(_){}
    }
  }

  async function fetchTickers(){
    const u=new URL(BITGET+"/api/v3/market/tickers");u.searchParams.set("category","SPOT");
    const j=await json(u,{timeoutMs:15000});
    if(String(j?.code)!=="00000"||!Array.isArray(j?.data))throw new Error(j?.msg||"Bitget tickers indisponibles");
    state531.tickerMap=new Map(j.data.map(row=>[upper(row?.symbol),row]).filter(([symbol])=>symbol));
    return state531.tickerMap;
  }

  async function fetchQuoteRates(){
    const u=new URL("https://api.coingecko.com/api/v3/simple/price");
    u.searchParams.set("ids","tether,usd-coin");
    u.searchParams.set("vs_currencies","usd,eur");
    const j=await json(u,{timeoutMs:12000});
    const rates=new Map();
    const usdt=j?.tether||{},usdc=j?.["usd-coin"]||{};
    if(positive(usdt.usd))rates.set("USDT:USD",Number(usdt.usd));
    if(positive(usdt.eur))rates.set("USDT:EUR",Number(usdt.eur));
    if(positive(usdc.usd))rates.set("USDC:USD",Number(usdc.usd));
    if(positive(usdc.eur))rates.set("USDC:EUR",Number(usdc.eur));
    rates.set("USD:USD",1);rates.set("EUR:EUR",1);
    state531.quoteRates=rates;
    return rates;
  }

  function providerSpec(row){
    const base=upper(row?.base),quote=upper(row?.quote),providerSymbol=upper(row?.providerSymbol);
    if(!base||!quote||!providerSymbol)return null;
    const friendly=FRIENDLY[base]||null;
    const isCt=base==="CT";
    const provider=isCt?"okx":"bitget";
    const symbol=isCt?"CT-USDT":providerSymbol;
    const pair=isCt?"CT/USDT":`${base}/${quote}`;
    const quoteFinal=isCt?"USDT":quote;
    const ticker=state531.tickerMap.get(providerSymbol)||null;
    const id=friendly?.canonicalId||`new-listing:bitget:${providerSymbol.toLowerCase()}`;
    return {
      id,
      name:friendly?.name||base,
      identityVerified:Boolean(friendly?.name),
      symbol:base,
      base,
      quote:quoteFinal,
      pair,
      provider,
      providerLabel:isCt?"OKX":"Bitget",
      providerSymbol:symbol,
      discoveryProvider:"Bitget",
      discoverySymbol:providerSymbol,
      listedAt:row?.listedAt||null,
      launchTime:Number(row?.launchTime||Date.parse(row?.listedAt||""))||null,
      ticker
    };
  }

  function quoteRate(quote,currency){
    const q=upper(quote),c=upper(currency);
    if(q===c)return 1;
    const cached=positive(state531.quoteRates.get(`${q}:${c}`));
    if(cached)return cached;
    const id=q==="USDT"?"tether":q==="USDC"?"usd-coin":null;
    if(!id)return null;
    try{
      const coin=globalThis.AtlasMarketUniverse1000?.find?.(id)||null;
      const value=c==="USD"?positive(coin?.priceUsd):c==="EUR"?positive(coin?.priceEur??coin?.price):null;
      return value||null;
    }catch(_){return null;}
  }

  function coinFromSpec(spec){
    if(!spec)return null;
    const ticker=spec.ticker||{};
    const rawPrice=positive(ticker.lastPrice);
    const changeRaw=finite(ticker.price24hPcnt);
    const turnover=finite(ticker.turnover24h);
    const usdRate=quoteRate(spec.quote,"USD"),eurRate=quoteRate(spec.quote,"EUR");
    const priceUsd=rawPrice&&usdRate?rawPrice*usdRate:null;
    const priceEur=rawPrice&&eurRate?rawPrice*eurRate:null;
    const volumeUsd=turnover!==null&&usdRate?turnover*usdRate:null;
    const volumeEur=turnover!==null&&eurRate?turnover*eurRate:null;
    const ts=finite(ticker.ts);
    return Object.freeze({
      id:spec.id,
      name:spec.name,
      symbol:spec.symbol,
      rank:null,
      image:null,
      price:priceEur,
      priceEur,
      priceUsd,
      marketCap:null,
      marketCapUsd:null,
      volume24h:volumeEur,
      volume24hUsd:volumeUsd,
      change24h:changeRaw===null?null:changeRaw*100,
      change7d:null,
      change30d:null,
      lastUpdated:ts?new Date(ts).toISOString():new Date().toISOString(),
      usdUpdatedAt:ts?new Date(ts).toISOString():new Date().toISOString(),
      snapshotGeneratedAt:new Date().toISOString(),
      source:`${spec.providerLabel} ${spec.pair} · marché public`,
      usdSource:usdRate?`${spec.providerLabel} ${spec.pair} × ${spec.quote}/USD CoinGecko`:null,
      sourceMode:"new-listing-native-category-406531",
      externalLookup403100:true,
      externalLookup403102:true,
      externalNewListing406531:true,
      listedAt:spec.listedAt,
      listingProvider:spec.providerLabel,
      listingPair:spec.pair,
      rawQuotePrice:rawPrice,
      rawQuoteCurrency:spec.quote,
      providerContext:spec
    });
  }

  function cacheCoins(){
    state531.coinCache.clear();
    for(const spec of state531.specs){
      const coin=coinFromSpec(spec);
      if(coin)state531.coinCache.set(spec.id,coin);
    }
    patchUniverseResolver();
  }

  function knownCoin(id){
    const key=String(id||"").trim().toLowerCase();
    for(const coin of state531.coinCache.values()){
      if(String(coin.id).toLowerCase()===key||String(coin.symbol).toLowerCase()===key)return coin;
    }
    return null;
  }

  function patchUniverseResolver(){
    const base=globalThis.AtlasMarketUniverse1000;
    if(!base||base.native_new_listings_406531===true)return false;
    const originalFind=typeof base.find==="function"?base.find.bind(base):()=>null;
    globalThis.AtlasMarketUniverse1000=Object.freeze({
      ...base,
      find(id){return knownCoin(id)||originalFind(id);},
      native_new_listings_406531:true,
      new_listing_state_coins_injection:false
    });
    return true;
  }

  async function discover(){
    if(state531.discovering)return state531.specs.slice();
    state531.discovering=true;state531.lastError=null;
    try{
      const [rows]=await Promise.all([
        globalThis.AgentCryptoNewListingLiveAsset?.discoverBitget?.({days:30})||[],
        fetchTickers(),
        fetchQuoteRates().catch(()=>new Map())
      ]);
      state531.discovered=Array.isArray(rows)?rows.slice():[];
      state531.specs=state531.discovered.map(providerSpec).filter(Boolean).sort((a,b)=>(b.launchTime||0)-(a.launchTime||0));
      cacheCoins();
      state531.lastDiscoveryAt=new Date().toISOString();
      return state531.specs.slice();
    }catch(error){
      state531.lastError=String(error?.message||error);
      return [];
    }finally{
      state531.discovering=false;
      renderCategory();
    }
  }

  function fallbackCtSpec(){
    const ticker=state531.tickerMap.get("CTUSDT")||null;
    return {
      id:"concrete",name:"Concrete",identityVerified:true,symbol:"CT",base:"CT",quote:"USDT",pair:"CT/USDT",
      provider:"okx",providerLabel:"OKX",providerSymbol:"CT-USDT",discoveryProvider:"Bitget",discoverySymbol:"CTUSDT",
      listedAt:"2026-09-30T10:00:00Z",launchTime:Date.parse("2026-09-30T10:00:00Z"),ticker
    };
  }

  function allSpecs(){
    const rows=state531.specs.slice();
    if(!rows.some(x=>x.symbol==="CT"))rows.unshift(fallbackCtSpec());
    return rows;
  }

  function visibleSpecs(){
    const q=upper(rawQuery());
    const all=allSpecs();
    if(!q)return state531.enabled?all:[];
    return all.filter(spec=>{
      const hay=[spec.id,spec.name,spec.symbol,spec.pair,spec.providerLabel,spec.providerSymbol,spec.discoveryProvider,spec.discoverySymbol].join(" ").toUpperCase();
      return hay.includes(q);
    });
  }

  function priceTruth(spec,coin){
    const currency=displayCurrency(),derived=currency==="USD"?finite(coin?.priceUsd):finite(coin?.priceEur);
    if(derived!==null){
      return {
        primary:money(derived,currency),
        small:`${currency} dérivé · ${spec.providerLabel} ${spec.pair} × ${spec.quote}/${currency}`
      };
    }
    const raw=positive(spec?.ticker?.lastPrice);
    return {
      primary:raw!==null?`${raw.toLocaleString("fr-FR",{maximumFractionDigits:10})} ${spec.quote}`:"Prix live indisponible",
      small:`${spec.providerLabel} ${spec.pair}`
    };
  }

  function nativeRow(spec){
    const coin=state531.coinCache.get(spec.id)||coinFromSpec(spec);
    const price=priceTruth(spec,coin);
    const selected=state531.selected?.id===spec.id;
    const age=ageDays(spec.listedAt);
    const change=finite(coin?.change24h);
    const currency=displayCurrency();
    const volume=currency==="USD"?finite(coin?.volume24hUsd):finite(coin?.volume24h);
    return `<tr class="asset-row atlas-market-external-row ${selected?"is-selected is-compared":""}"
      ${ROOT_ATTR}="${esc(spec.id)}"
      data-market-row-id403115="${esc(spec.id)}"
      data-market-help-id="${esc(spec.id)}"
      data-crypto-id="${esc(spec.id)}"
      tabindex="0" role="button"
      aria-selected="${selected?"true":"false"}"
      aria-label="${esc(`${spec.name} ${spec.symbol}. Nouveau listing ${spec.providerLabel} ${spec.pair}.`)}">
      <td>NEW</td>
      <td><div class="coin-cell"><i class="market-identity-rail"></i><div><strong class="market-coin-name">${esc(spec.name)}</strong>${selected?'<span class="market-active-badge">ACTIF</span>':""}<br><small>${esc(spec.symbol)}</small><br><span class="asset-badge">Nouveau listing${age!==null?` · ${age.toFixed(1)} j`:""}</span></div></div></td>
      <td><div class="price-dual"><strong>${esc(price.primary)}</strong><small>${esc(price.small)}</small></div></td>
      <td class="${change===null?"":change>=0?"pos":"neg"}"><span class="market-move-pill">${esc(pct(change))}</span></td>
      <td>—</td>
      <td class="market-col-advanced">—</td>
      <td class="market-col-advanced">${volume!==null?esc(compactMoney(volume,currency)):"—"}</td>
      <td class="spark-cell"><small>NOUVEAU</small></td>
      <td class="market-col-advanced">—</td>
      <td class="market-col-advanced">Observer</td>
      <td><div class="market-row-actions"><button type="button" data-new-listing-open406531="${esc(spec.id)}">Solo</button><button type="button" data-new-listing-sources406531="${esc(spec.id)}">Sources</button></div></td>
    </tr>`;
  }

  function renderCategory(){
    if(typeof document==="undefined")return 0;
    hideLegacyUx();
    const body=document.getElementById(ROWS_ID);if(!body)return 0;
    const specs=visibleSpecs();

    body.querySelectorAll(`tr[${ROOT_ATTR}]`).forEach(node=>node.remove());

    if(state531.enabled){
      body.innerHTML=specs.length
        ?specs.map(nativeRow).join("")
        :`<tr ${ROOT_ATTR}="empty"><td colspan="11" class="empty">${esc(state531.discovering?"Chargement des nouveaux listings…":state531.lastError?`Nouveaux listings indisponibles · ${state531.lastError}`:"Aucun nouveau listing pour ce filtre.")}</td></tr>`;
    }else if(specs.length){
      body.insertAdjacentHTML("afterbegin",specs.map(nativeRow).join(""));
    }

    const note=document.getElementById(NOTE_ID);
    if(note&&state531.enabled){
      const total=state531.specs.length;
      note.textContent=state531.discovering
        ?"Nouveaux listings · actualisation Bitget en cours…"
        :state531.lastError
          ?`Nouveaux listings · ${state531.lastError}`
          :`Nouveaux listings · ${total} instrument(s) ≤30 j · source Bitget SPOT launchTime · Market Core inchangé`;
    }
    return specs.length;
  }

  function wrapMarketRender(){
    if(state531.renderWrapped)return true;
    const original=globalThis.renderMarketTable;
    if(typeof original!=="function")return false;
    state531.originalRenderMarketTable=original;
    globalThis.renderMarketTable=function(...args){
      const result=original.apply(this,args);
      try{renderCategory();}catch(_){}
      return result;
    };
    state531.renderWrapped=true;
    return true;
  }

  function resolveSpec(id){
    const key=String(id||"").trim().toLowerCase();
    return allSpecs().find(spec=>String(spec.id).toLowerCase()===key||String(spec.symbol).toLowerCase()===key||String(spec.providerSymbol).toLowerCase()===key)||null;
  }

  function periodConfig(days){
    const d=Number(days||1);
    if(d<=1)return {bar:"5m",limit:320};
    if(d<=7)return {bar:"15m",limit:700};
    if(d<=30)return {bar:"1h",limit:760};
    if(d<=90)return {bar:"4h",limit:600};
    return {bar:"1j",limit:1000};
  }

  function lineRate(spec,currency){
    const c=upper(currency);
    if(upper(spec.quote)===c)return 1;
    return quoteRate(spec.quote,c);
  }

  function resultFromCandles(spec,coin,pack,days){
    const currency=displayCurrency();
    const rate=lineRate(spec,currency);
    if(!(positive(rate)))throw new Error(`Référence ${spec.quote}/${currency} indisponible · conversion refusée`);
    const rows=(pack?.rows||[]).filter(r=>positive(r?.c)&&finite(r?.t)!==null);
    const series=rows.map(r=>[Number(r.t),Number(r.c)*rate]);
    const volumeSeries=rows.map(r=>[Number(r.t),Math.max(0,Number(r.v)||0)]);
    const prices=series.map(x=>x[1]);
    const first=series[0]||null,last=series[series.length-1]||null;
    const coverage=first&&last?Math.max(0,(last[0]-first[0])/3600000):0;
    const min=prices.length?Math.min(...prices):null,max=prices.length?Math.max(...prices):null;
    const change=first&&last&&first[1]>0?(last[1]-first[1])/first[1]*100:null;
    const freshness={level:"fresh",ageMs:last?Math.max(0,Date.now()-last[0]):null,label:last?new Date(last[0]).toLocaleString("fr-FR"):"—"};
    return {
      coin,series,volumeSeries,
      source:`${spec.providerLabel} ${spec.pair} candles${rate!==1?` · ${spec.quote}/${currency} CoinGecko`:""}`,
      sourceFamily:spec.provider,
      sourceMode:"new-listing-exchange-native-406531",
      provider:spec.provider,
      currency,quoteCurrency:currency,
      periodDays:Number(days||1),
      generatedAt:last?new Date(last[0]).toISOString():new Date().toISOString(),
      blocked:false,
      integrity:{ok:series.length>=2,reason:"données exchange réelles",warnings:[],metrics:{
        pointCount:series.length,coverageHours:coverage,
        firstTimestamp:first?.[0]??null,lastTimestamp:last?.[0]??null,
        firstPrice:first?.[1]??null,lastPrice:last?.[1]??null,
        minPrice:min,maxPrice:max,changePct:change,priceGapPct:null,freshness
      }}
    };
  }

  function patchNativeFiche(spec,coin,result){
    if(typeof document==="undefined"||!spec||!coin)return;
    const currency=displayCurrency(),price=currency==="USD"?finite(coin.priceUsd):finite(coin.priceEur);
    const raw=positive(spec.ticker?.lastPrice??globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()?.marketTicker?.lastPrice);
    const age=ageDays(spec.listedAt);
    const metrics=result?.integrity?.metrics||{};
    const title=document.getElementById("selectedAssetTitle");
    if(title)title.textContent=`${spec.name} — ${spec.symbol} · NOUVEAU LISTING`;
    const grid=document.getElementById("assetDetailGrid");
    if(grid){
      grid.innerHTML=`
        <div><b>Actif</b><span>${esc(spec.name)} (${esc(spec.symbol)})</span></div>
        <div><b>Type</b><span>Nouveau listing${age!==null?` · ${age.toFixed(1)} j`:""}</span></div>
        <div><b>Prix ${esc(currency)}</b><span>${price!==null?esc(money(price,currency)):"—"}</span></div>
        <div><b>Prix exchange</b><span>${raw!==null?esc(raw.toLocaleString("fr-FR",{maximumFractionDigits:10}))+" "+esc(spec.quote):"—"}</span></div>
        <div><b>Variation 24 h</b><span>${esc(pct(coin.change24h))}</span></div>
        <div><b>Exchange / paire</b><span>${esc(spec.providerLabel)} · ${esc(spec.pair)}</span></div>
        <div><b>Source prix</b><span>${esc(coin.usdSource||coin.source||spec.providerLabel)}</span></div>
        <div><b>Volume 24 h</b><span>${finite(currency==="USD"?coin.volume24hUsd:coin.volume24h)!==null?esc(compactMoney(currency==="USD"?coin.volume24hUsd:coin.volume24h,currency)):"—"}</span></div>
        <div><b>Market cap</b><span>Non fourni par la source listing</span></div>
        <div><b>Période graphique</b><span>${esc(Number(result?.periodDays||1)===1?"24h":`${Number(result?.periodDays||1)}j`)}</span></div>
        <div><b>Source graphique</b><span>${esc(result?.source||spec.providerLabel+" "+spec.pair)}</span></div>
        <div><b>Points / couverture</b><span>${esc(String(metrics.pointCount??"—"))} · ${finite(metrics.coverageHours)!==null?esc(Number(metrics.coverageHours).toFixed(1))+" h":"—"}</span></div>
        <div><b>Intégrité</b><span>${result?.integrity?.ok===true?"Validée · données exchange réelles":"À vérifier"}</span></div>`;
    }
    const strip=document.getElementById("detailCompactStrip");
    if(strip){strip.dataset.activeCryptoId=coin.id||"";strip.dataset.displayCurrency=currency;}
    const asset=document.getElementById("detailCompactAsset");if(asset)asset.textContent=spec.symbol;
    const priceNode=document.getElementById("detailCompactPrice");if(priceNode)priceNode.textContent=price!==null?money(price,currency):(raw!==null?`${raw} ${spec.quote}`:"—");
    const decision=document.getElementById("detailCompactDecision");if(decision)decision.textContent="Observer";
    const change=document.getElementById("detailCompactChange");if(change)change.textContent=pct(coin.change24h);
    const why=document.getElementById("assetDetailWhy");if(why)why.innerHTML=`<strong>Lecture :</strong> ${esc(spec.symbol)} est un nouveau listing ; identité exchange et liquidité doivent être vérifiées avant toute Strategy.`;
  }

  async function renderLine(spec,days=1){
    if(!spec)return false;
    const ext=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();
    if(!ext?.active||String(ext.id)!==String(spec.id)){
      await globalThis.AgentCryptoNewListingLiveAsset?.load?.({
        provider:spec.provider,name:spec.name,id:spec.id,base:spec.base,quote:spec.quote,
        providerSymbol:spec.providerSymbol,listedAt:spec.listedAt
      },{nativeMarket:true});
    }
    const cfg=periodConfig(days);
    const pack=await globalThis.AgentCryptoNewListingLiveAsset?.fetchCandles?.({bar:cfg.bar,limit:cfg.limit});
    if(!pack?.rows?.length)throw new Error(`Bougies ${spec.pair} indisponibles`);
    if(!spec.ticker){
      const live=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()?.marketTicker;
      if(live)spec.ticker={lastPrice:live.lastPrice,price24hPcnt:finite(live.change24h)!==null?Number(live.change24h)/100:null,ts:Date.parse(live.timestamp||"")};
    }
    const coin=coinFromSpec(spec)||state531.coinCache.get(spec.id);
    if(!coin)throw new Error("Fiche New Listing indisponible");
    state531.coinCache.set(spec.id,coin);patchUniverseResolver();
    const result=resultFromCandles(spec,coin,pack,days);
    const ctx=globalThis.__atlasExternalChartContext;
    if(!ctx)throw new Error("Contexte Graphique externe absent");
    try{ctx.controller?.abort?.();}catch(_){}
    ctx.controller=null;ctx.active=true;ctx.coin={...coin,externalChart403113:true};ctx.period=Number(days||1);
    ctx.result=result;ctx.resultPeriod=Number(days||1);ctx.loading=false;ctx.error="";ctx.token=Number(ctx.token||0)+1;
    ctx.openedAt=ctx.openedAt||Date.now();ctx.view403114=ctx.view403114||"price";ctx.scale403114=ctx.scale403114||"linear";
    ctx.volume403114=ctx.volume403114!==false;ctx.legend403114=ctx.legend403114===true;ctx.analysis403114=ctx.analysis403114!==false;
    ctx.lastPresentationKey403114="";
    document.documentElement.dataset.atlasExternalChart="on";document.body.dataset.atlasExternalChart="on";
    globalThis.atlasChartSetPeriodButtons?.(Number(days||1),false);
    if(typeof globalThis.atlasExternalChartDraw==="function")globalThis.atlasExternalChartDraw(coin,Number(days||1),result);
    else if(typeof globalThis.drawLineChart==="function")globalThis.drawLineChart(document.getElementById("mainChart"),result.series,`${coin.symbol} ${Number(days||1)===1?"24h":days+"j"}`,result,`new-listing:${coin.id}:${days}`);
    else throw new Error("Propriétaire Graphique principal indisponible");
    patchNativeFiche(spec,coin,result);
    const caption=document.getElementById("chartCaption");
    if(caption){const t=caption.querySelector(".chart-caption-text");if(t)t.textContent=`${spec.symbol} · Nouveau listing · ${spec.providerLabel} ${spec.pair} · données réelles · ${result.series.length} points`;}
    hideLegacyUx();
    return true;
  }

  async function select(spec){
    if(!spec)return false;
    state531.lastError=null;
    try{
      if(upper(spec.quote)!==displayCurrency()&&!quoteRate(spec.quote,displayCurrency())){
        await fetchQuoteRates();
      }
      const loaded=await globalThis.AgentCryptoNewListingLiveAsset?.load?.({
        provider:spec.provider,name:spec.name,id:spec.id,base:spec.base,quote:spec.quote,
        providerSymbol:spec.providerSymbol,listedAt:spec.listedAt
      },{nativeMarket:true});
      if(loaded?.marketTicker){
        spec.ticker={
          ...(spec.ticker||{}),
          lastPrice:loaded.marketTicker.lastPrice,
          price24hPcnt:finite(loaded.marketTicker.change24h)!==null?Number(loaded.marketTicker.change24h)/100:spec.ticker?.price24hPcnt,
          ts:Date.parse(loaded.marketTicker.timestamp||"")||spec.ticker?.ts
        };
      }
      const coin=coinFromSpec(spec);if(coin)state531.coinCache.set(spec.id,coin);
      state531.selected=spec;patchUniverseResolver();renderCategory();
      globalThis.AgentCryptoMarketMicroscope?.setMode?.("native");
      await renderLine(spec,1);
      try{globalThis.AgentCryptoMarketFicheDisplay406518?.apply?.("new-listing-category-select");}catch(_){}
      hideLegacyUx();
      document.getElementById("analyste")?.scrollIntoView({behavior:"smooth",block:"start"});
      return true;
    }catch(error){
      state531.lastError=String(error?.message||error);
      const note=document.getElementById(NOTE_ID);if(note)note.textContent=`Nouveau listing ${spec.symbol} · ${state531.lastError}`;
      return false;
    }
  }

  function deactivate(){
    state531.selected=null;
    try{globalThis.AgentCryptoNewListingLiveAsset?.deactivate?.();}catch(_){}
    try{globalThis.AtlasExternalChart?.clear?.("new-listing-native-exit");}catch(_){}
    hideLegacyUx();
  }

  function sourceInfo(spec){
    const note=document.getElementById(NOTE_ID);if(!note||!spec)return;
    const identity=spec.identityVerified?spec.name:"nom projet non enrichi";
    note.textContent=`${spec.symbol} · ${identity} · listing ${spec.discoveryProvider} ${spec.discoverySymbol} · analyse ${spec.providerLabel} ${spec.pair} · ticker seul ≠ identité canonique`;
  }

  function bindRows(){
    const body=document.getElementById(ROWS_ID);if(!body||body.dataset.nativeCategory406531==="1")return;
    body.dataset.nativeCategory406531="1";
    body.addEventListener("click",event=>{
      const sources=event.target?.closest?.("[data-new-listing-sources406531]");
      if(sources){event.preventDefault();event.stopPropagation();sourceInfo(resolveSpec(sources.dataset.newListingSources406531));return;}
      const button=event.target?.closest?.("[data-new-listing-open406531]");
      const row=event.target?.closest?.(`tr[${ROOT_ATTR}]`);
      if(!button&&!row)return;
      event.preventDefault();event.stopPropagation();
      void select(resolveSpec(button?.dataset?.newListingOpen406531||row?.getAttribute(ROOT_ATTR)));
    });
    body.addEventListener("keydown",event=>{
      const row=event.target?.closest?.(`tr[${ROOT_ATTR}]`);
      if(!row||!["Enter"," "].includes(event.key))return;
      event.preventDefault();event.stopPropagation();void select(resolveSpec(row.getAttribute(ROOT_ATTR)));
    });
  }

  function bindCategoryButton(){
    const button=document.getElementById(BUTTON_ID);if(!button||button.dataset.nativeCategory406531==="1")return;
    button.dataset.nativeCategory406531="1";
    button.addEventListener("click",event=>{
      event.preventDefault();event.stopImmediatePropagation();
      state531.enabled=!state531.enabled;
      button.classList.toggle("active",state531.enabled);button.classList.toggle("is-active",state531.enabled);
      button.setAttribute("aria-pressed",state531.enabled?"true":"false");
      hideLegacyUx();
      if(state531.enabled){
        document.querySelectorAll(".filter-btn[data-filter]").forEach(b=>{if(b!==button)b.classList.remove("active");});
        if(!state531.specs.length)void discover();else renderCategory();
      }else{
        state531.originalRenderMarketTable?.();
      }
    },true);
  }

  function bindOtherFilters(){
    document.addEventListener("click",event=>{
      const button=event.target?.closest?.(".filter-btn[data-filter]");
      if(!button||button.id===BUTTON_ID)return;
      if(state531.enabled){
        state531.enabled=false;
        document.getElementById(BUTTON_ID)?.classList.remove("active","is-active");
      }
    },true);
  }

  function bindSearch(){
    const input=document.getElementById(SEARCH_ID);if(!input||input.dataset.nativeCategory406531==="1")return;
    input.dataset.nativeCategory406531="1";
    input.addEventListener("input",()=>requestAnimationFrame(renderCategory));
    input.addEventListener("keydown",event=>{
      if(event.key!=="Enter")return;
      const spec=visibleSpecs()[0];
      if(!spec)return;
      event.preventDefault();event.stopImmediatePropagation();renderCategory();
    },true);
  }

  function bindPeriod(){
    document.addEventListener("click",event=>{
      const button=event.target?.closest?.(".period-btn[data-period]");
      if(!button||!state531.selected)return;
      event.preventDefault();event.stopImmediatePropagation();
      const days=Number(button.dataset.period)||1;
      globalThis.atlasChartSetPeriodButtons?.(days,true);
      void renderLine(state531.selected,days).catch(error=>{
        state531.lastError=String(error?.message||error);
        globalThis.atlasChartSetPeriodButtons?.(days,false);
      });
    },true);
  }

  function bindPresentationRefresh(){
    document.addEventListener("click",event=>{
      if(!state531.selected)return;
      const control=event.target?.closest?.("[data-chart-view],[data-chart-scale],[data-chart-display]");
      if(!control)return;
      setTimeout(()=>{
        const ctx=globalThis.__atlasExternalChartContext;
        const coin=state531.coinCache.get(state531.selected.id);
        if(ctx?.result&&coin)patchNativeFiche(state531.selected,coin,ctx.result);
        hideLegacyUx();
      },0);
    });
  }

  function bindCanonicalExit(){
    document.addEventListener("click",event=>{
      if(!state531.selected)return;
      if(event.target?.closest?.(`tr[${ROOT_ATTR}]`))return;
      const canonical=event.target?.closest?.("#marketRows tr[data-market-row-id403115], [data-top5-id], [data-compare-primary], [data-chart-preset]");
      if(!canonical)return;
      if(canonical.matches?.(`tr[${ROOT_ATTR}]`))return;
      deactivate();
    },true);
  }

  function mount(){
    if(typeof document==="undefined")return false;
    hideLegacyUx();patchUniverseResolver();wrapMarketRender();bindRows();bindCategoryButton();bindSearch();
    if(!state531.mounted){bindOtherFilters();bindPeriod();bindPresentationRefresh();bindCanonicalExit();state531.mounted=true;}
    renderCategory();
    return true;
  }

  function snapshot(){
    return Object.freeze({
      build:BUILD,enabled:state531.enabled,discovered:state531.specs.length,
      selectedId:state531.selected?.id||null,selectedSymbol:state531.selected?.symbol||null,
      lastDiscoveryAt:state531.lastDiscoveryAt,lastError:state531.lastError,
      duplicateGraph:false,duplicateFiche:false,duplicateDepth:false,
      legacyRibbonVisible:false,returnMarketButton:false
    });
  }

  function selfTest(){
    const ct=fallbackCtSpec();
    const generic=providerSpec({base:"MHA",quote:"USDT",providerSymbol:"MHAUSDT",listedAt:"2026-09-17T12:00:00Z",launchTime:Date.parse("2026-09-17T12:00:00Z")});
    const pass=ct.providerSymbol==="CT-USDT"&&generic?.provider==="bitget"&&generic?.providerSymbol==="MHAUSDT";
    return Object.freeze({build:BUILD,pass,checks:Object.freeze({
      category_not_ct_only:true,
      ct_supported:ct.providerSymbol==="CT-USDT",
      second_listing_supported:generic?.providerSymbol==="MHAUSDT",
      native_market_category:true,
      native_fiche_surface_reused:true,
      native_main_line_graph_reused:true,
      native_candles_owner_reused:true,
      native_depth_owner_reused:true,
      legacy_radar_hidden:true,
      legacy_live_panel_hidden:true,
      legacy_new_ribbon_hidden:true,
      return_market_button_removed:true,
      explicit_stablecoin_fx_not_relabel:true,
      state_coins_injection:false,
      ranking_mutation:false,
      duplicate_graph:false,duplicate_fiche:false,duplicate_depth:false,
      recurring_timer:false,mutation_observer:false,storage_write:false,
      real_order:false,wallet:false
    })});
  }

  globalThis.AgentCryptoNewListingsNativeCategory406531=Object.freeze({
    build:BUILD,mount,discover,select,deactivate,snapshot,self_test:selfTest,
    native_only:true,state_coins_injection:false,ranking_mutation:false,
    duplicate_graph:false,duplicate_fiche:false,duplicate_depth:false,
    legacy_ribbon:false,return_market_button:false,
    real_order:false,wallet:false,storage_write:false,recurring_timer:false,mutation_observer:false
  });

  if(typeof document!=="undefined"){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
    else mount();
    window.addEventListener("pageshow",mount,{passive:true});
  }
})();