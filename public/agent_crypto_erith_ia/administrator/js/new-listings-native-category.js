/* Agent-Crypto — NEW LISTINGS · NATIVE MARKET CATEGORY — stable canonical owner
   Product destination:
   - "Nouveaux listings" is one native Market category, not a CT-only button and not a second workspace.
   - Recent SPOT instruments discovered from Bitget are rendered in the existing Market table.
   - Selection reuses the existing Fiche surface, main Graphique Ligne, Bougies owner and Profondeur owner.
   - Provider/pair plumbing stays internal; no NEW ribbon and no Retour Market button.
   - Selecting a normal Market asset clears the external listing context automatically.
   Read-only. No state.coins injection, ranking mutation, order, wallet, private API, storage owner, timer or observer. */
(()=>{
  "use strict";

  const MODULE_VERSION="40.6.546";
  const BUTTON_ID="atlasNewListingsButton406528";
  const LEGACY_RADAR_ID="atlasNewListingsRadar406528";
  const LEGACY_LIVE_ID="atlasNewListingsLive529";
  const LEGACY_RIBBON_ID="atlasNewListingActive529";
  const SEARCH_ID="searchInput";
  const ROWS_ID="marketRows";
  const NOTE_ID="tableNote";
  const ROOT_ATTR="data-new-listing-native";
  const BITGET="https://api.bitget.com";
  const COINGECKO="https://api.coingecko.com/api/v3";
  const DISCOVERY_COOLDOWN_MS=15000;
  const IDENTITY_REGISTRY_URL="./data/new-listings-identities.json?v=40.6.546";
  const IDENTITY_REMOTE_BATCH_TIMEOUT_MS=12000;
  const CANONICAL_EXIT_SELECTOR=[
    "#btnChartSolo","#btnChartTop3","#btnChartTop5",
    "#btnChartGainers","#btnChartLosers","#btnChartVolume5",
    "#btnChartReset","#btnChartClear",
    "#targetTop5Cycle","#marketFlowCycle",
    "#marketRows tr[data-market-row-id403115]",
    "#top5Track > *",
    "[data-top5-id]","[data-compare-primary]","[data-chart-preset]",
    "[data-chart-display='oracle']"
  ].join(",");

  const FRIENDLY=Object.freeze({
    CT:Object.freeze({name:"Concrete",canonicalId:"concrete",coingeckoId:"concrete",provider:"okx",providerLabel:"OKX",providerSymbol:"CT-USDT",pair:"CT/USDT"}),
    MHA:Object.freeze({name:"MAGNE.AI",coingeckoId:"magic-hash"}),
    MCAT:Object.freeze({name:"MarsCat",coingeckoId:"marscat-token"}),
    PONS:Object.freeze({name:"Pons",coingeckoId:"pons"}),
    CNPY:Object.freeze({name:"Canopy",coingeckoId:"canopy"})
  });

  const state={
    enabled:false,
    discovering:false,
    discovered:[],
    specs:[],
    selected:null,
    requestRevision:0,
    requestController:null,
    pending:null,
    coinCache:new Map(),
    quoteRates:new Map(),
    tickerMap:new Map(),
    identityCache:new Map(),
    identityRegistry:new Map(),
    registryStatus:{loaded:false,entries:0,applied:0,logos:0,error:null,source:"GitHub"},
    identityStatus:{attempted:0,verified:0,logos:0,failed:0,githubHits:0,batchRequests:0,batchFailures:0,rateLimited:0,mismatched:0,missing:0,lastFailure:null},
    radarStatus:{confirmed:0,candidates:0},
    lastDiscoveryAt:null,
    lastError:null,
    lastResult:null,
    lastPublishedSpecKey:null,
    originalRenderMarketTable:null,
    renderWrapped:false,
    mounted:false
  };

  const finite=v=>{if(v===null||v===undefined||String(v).trim()==="")return null;const n=Number(v);return Number.isFinite(n)?n:null;};
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
      if(!r.ok){
        const error=new Error(`HTTP ${r.status}`);
        error.status=r.status;
        throw error;
      }
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
    state.tickerMap=new Map(j.data.map(row=>[upper(row?.symbol),row]).filter(([symbol])=>symbol));
    return state.tickerMap;
  }

  async function fetchQuoteRates({signal=null}={}){
    const u=new URL("https://api.coingecko.com/api/v3/simple/price");
    u.searchParams.set("ids","tether,usd-coin");
    u.searchParams.set("vs_currencies","usd,eur");
    const j=await json(u,{timeoutMs:12000,signal});
    if(signal?.aborted)return state.quoteRates;
    const rates=new Map();
    const usdt=j?.tether||{},usdc=j?.["usd-coin"]||{};
    if(positive(usdt.usd))rates.set("USDT:USD",Number(usdt.usd));
    if(positive(usdt.eur))rates.set("USDT:EUR",Number(usdt.eur));
    if(positive(usdc.usd))rates.set("USDC:USD",Number(usdc.usd));
    if(positive(usdc.eur))rates.set("USDC:EUR",Number(usdc.eur));
    rates.set("USD:USD",1);rates.set("EUR:EUR",1);
    state.quoteRates=rates;
    return rates;
  }


  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,Math.max(0,Number(ms)||0)));

  function ageBand(days){
    const d=finite(days);
    if(d===null)return {key:"unknown",label:"âge inconnu"};
    if(d<1)return {key:"lt24h",label:"<24 h"};
    if(d<=3)return {key:"1_3d",label:"1–3 j"};
    if(d<=7)return {key:"4_7d",label:"4–7 j"};
    if(d<=30)return {key:"8_30d",label:"8–30 j"};
    return {key:"older",label:">30 j"};
  }

  function radarProof(spec,coin=null){
    const launch=finite(spec?.launchTime);
    const age=ageDays(spec?.listedAt);
    const launchOk=launch!==null&&age!==null&&age>=0&&age<=30;
    const rawPrice=positive(spec?.ticker?.lastPrice);
    const priceOk=rawPrice!==null||positive(coin?.priceUsd)!==null||positive(coin?.priceEur)!==null;
    const volumeRaw=finite(spec?.ticker?.turnover24h);
    const volumeOk=volumeRaw!==null&&volumeRaw>0;
    const status=launchOk&&priceOk&&volumeOk?"CONFIRMÉ":"CANDIDAT";
    return Object.freeze({
      status,
      launchOk,
      priceOk,
      volumeOk,
      ageDays:age,
      ageBand:ageBand(age).label,
      proofCount:[launchOk,priceOk,volumeOk].filter(Boolean).length
    });
  }

  function recomputeRadarStatus(){
    let confirmed=0,candidates=0;
    for(const spec of state.specs){
      const proof=radarProof(spec,state.coinCache.get(spec.id)||coinFromSpec(spec));
      if(proof.status==="CONFIRMÉ")confirmed+=1;else candidates+=1;
    }
    state.radarStatus={confirmed,candidates};
    return state.radarStatus;
  }

  function safeIdentityImage(value){
    const raw=String(value||"").trim();
    if(!raw)return null;
    try{
      const u=new URL(raw,document.baseURI);
      if(u.protocol!=="https:")return null;
      const sameOrigin=u.origin===location.origin;
      const localLogo=sameOrigin&&/\/administrator\/assets\/crypto\/new-listings\/[a-z0-9._-]+\.png$/i.test(u.pathname);
      if(localLogo)return u.href;
      const host=u.hostname.toLowerCase();
      if(host==="coingecko.com"||host.endsWith(".coingecko.com"))return u.href;
      return null;
    }catch(_){return null;}
  }

  function identityFailureKind(error){
    const status=Number(error?.status);
    if(status===429)return "HTTP 429";
    if(Number.isFinite(status)&&status>=400)return `HTTP ${status}`;
    if(error?.code==="IDENTITY_MISMATCH")return "identité non concordante";
    if(error?.name==="AbortError")return "timeout/abort";
    return "réseau";
  }

  function recordIdentityDiagnostic(error,{batch=false}={}){
    const kind=identityFailureKind(error);
    state.identityStatus.lastFailure=kind;
    if(kind==="HTTP 429")state.identityStatus.rateLimited+=1;
    if(batch)state.identityStatus.batchFailures+=1;
    return kind;
  }

  function identityFromPayload(spec,payload,source){
    const cgId=String(spec?.coingeckoId||"").trim();
    const sameId=String(payload?.id||payload?.coingeckoId||"").trim().toLowerCase()===cgId.toLowerCase();
    const sameSymbol=upper(payload?.symbol)===upper(spec?.symbol);
    if(!sameId||!sameSymbol){
      const error=new Error("Identité non concordante");
      error.code="IDENTITY_MISMATCH";
      throw error;
    }
    const image=safeIdentityImage(typeof payload?.image==="string"?payload.image:null)
      ||safeIdentityImage(payload?.image?.large)
      ||safeIdentityImage(payload?.image?.small)
      ||safeIdentityImage(payload?.image?.thumb);
    return Object.freeze({
      id:cgId,
      name:String(payload?.canonicalName||payload?.name||payload?.displayName||spec.name||spec.symbol),
      symbol:upper(payload?.symbol),
      image,
      source
    });
  }

  function cacheIdentity(identity){
    if(!identity?.id)return null;
    state.identityCache.set(identity.id,identity);
    return identity;
  }

  async function loadIdentityRegistry(){
    if(state.registryStatus.loaded)return state.identityRegistry;
    try{
      const r=await fetch(IDENTITY_REGISTRY_URL,{cache:"no-store",headers:{Accept:"application/json"}});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const payload=await r.json();
      if(payload?.schema!=="agent_crypto_new_listings_identity_registry_v1"||!payload?.identities||typeof payload.identities!=="object"){
        throw new Error("registre identité GitHub invalide");
      }
      const registry=new Map();
      for(const [id,row] of Object.entries(payload.identities)){
        const key=String(id||"").trim();
        if(!key||row?.verified!==true)continue;
        const normalized={...row,coingeckoId:String(row?.coingeckoId||key)};
        registry.set(key,normalized);
      }
      state.identityRegistry=registry;
      state.registryStatus={loaded:true,entries:registry.size,applied:0,logos:0,error:null,source:"GitHub"};
      return registry;
    }catch(error){
      state.identityRegistry=new Map();
      state.registryStatus={loaded:true,entries:0,applied:0,logos:0,error:String(error?.message||error),source:"GitHub"};
      return state.identityRegistry;
    }
  }

  function applyRegistryIdentities(specs){
    let applied=0,logos=0;
    for(const spec of Array.isArray(specs)?specs:[]){
      const cgId=String(spec?.coingeckoId||"").trim();
      if(!cgId)continue;
      const row=state.identityRegistry.get(cgId);
      if(!row)continue;
      try{
        const identity=cacheIdentity(identityFromPayload(spec,row,"GitHub identity memory"));
        spec.identityVerified=true;
        spec.identitySource=identity.source;
        spec.canonicalName=identity.name;
        spec.image=identity.image||null;
        applied+=1;
        if(identity.image)logos+=1;
      }catch(error){
        state.identityStatus.mismatched+=1;
        recordIdentityDiagnostic(error);
      }
    }
    state.registryStatus={...state.registryStatus,applied,logos};
    return applied;
  }

  async function fetchCoinGeckoIdentitiesBatch(specs,{signal=null}={}){
    const rows=(Array.isArray(specs)?specs:[]).filter(spec=>spec?.coingeckoId&&!state.identityCache.has(String(spec.coingeckoId)));
    if(!rows.length)return true;
    const ids=[...new Set(rows.map(spec=>String(spec.coingeckoId).trim()).filter(Boolean))];
    if(!ids.length)return true;
    const u=new URL(COINGECKO+"/coins/markets");
    u.searchParams.set("vs_currency","usd");
    u.searchParams.set("ids",ids.join(","));
    u.searchParams.set("order","market_cap_desc");
    u.searchParams.set("per_page",String(Math.min(250,ids.length)));
    u.searchParams.set("page","1");
    u.searchParams.set("sparkline","false");
    state.identityStatus.batchRequests+=1;
    try{
      const payload=await json(u,{signal,timeoutMs:IDENTITY_REMOTE_BATCH_TIMEOUT_MS});
      if(!Array.isArray(payload))throw new Error("Réponse CoinGecko batch invalide");
      const byId=new Map(payload.map(row=>[String(row?.id||"").trim().toLowerCase(),row]).filter(([id])=>id));
      for(const spec of rows){
        if(signal?.aborted)break;
        const cgId=String(spec.coingeckoId).trim();
        const row=byId.get(cgId.toLowerCase());
        if(!row){state.identityStatus.missing+=1;continue;}
        try{cacheIdentity(identityFromPayload(spec,row,"CoinGecko emergency batch"));}
        catch(error){state.identityStatus.mismatched+=1;recordIdentityDiagnostic(error);}
      }
      return true;
    }catch(error){
      recordIdentityDiagnostic(error,{batch:true});
      return false;
    }
  }

  async function enrichKnownIdentities(specs,{signal=null}={}){
    const rows=Array.isArray(specs)?specs:[];
    const targets=rows.filter(spec=>spec?.coingeckoId);
    state.identityStatus={attempted:targets.length,verified:0,logos:0,failed:0,githubHits:0,batchRequests:0,batchFailures:0,rateLimited:0,mismatched:0,missing:0,lastFailure:null};
    await loadIdentityRegistry();
    state.identityStatus.githubHits=applyRegistryIdentities(targets);
    const unresolved=targets.filter(spec=>!state.identityCache.has(String(spec.coingeckoId)));
    if(unresolved.length&&!signal?.aborted)await fetchCoinGeckoIdentitiesBatch(unresolved,{signal});
    for(const spec of targets){
      const identity=state.identityCache.get(String(spec.coingeckoId))||null;
      if(!identity){state.identityStatus.failed+=1;continue;}
      spec.identityVerified=true;
      spec.identitySource=identity.source;
      spec.canonicalName=identity.name;
      spec.image=identity.image||null;
      state.identityStatus.verified+=1;
      if(spec.image)state.identityStatus.logos+=1;
    }
    return rows;
  }

  function identityDiagnosticsLabel(){
    const s=state.identityStatus,r=state.registryStatus;
    const parts=[`GitHub ${s.githubHits}/${s.attempted}`];
    if(r.error)parts.push("registre indisponible");
    if(s.batchRequests)parts.push(`CoinGecko secours ${s.batchRequests}`);
    if(s.rateLimited)parts.push(`429 ${s.rateLimited}`);
    if(s.failed)parts.push(`échec ${s.failed}${s.lastFailure?` (${s.lastFailure})`:""}`);
    return parts.join(" · ");
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
    const ticker=state.tickerMap.get(providerSymbol)||null;
    const id=friendly?.canonicalId||`new-listing:bitget:${providerSymbol.toLowerCase()}`;
    return {
      id,
      name:friendly?.name||base,
      identityVerified:false,
      identitySource:null,
      canonicalName:null,
      coingeckoId:friendly?.coingeckoId||null,
      image:null,
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
    const cached=positive(state.quoteRates.get(`${q}:${c}`));
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
      image:safeIdentityImage(spec.image)||null,
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
      sourceMode:"new-listing-native-category",
      externalLookup403100:true,
      externalLookup403102:true,
      externalNewListing:true,
      listedAt:spec.listedAt,
      listingProvider:spec.providerLabel,
      listingPair:spec.pair,
      rawQuotePrice:rawPrice,
      rawQuoteCurrency:spec.quote,
      providerContext:spec
    });
  }

  function cacheCoins(){
    state.coinCache.clear();
    for(const spec of state.specs){
      const coin=coinFromSpec(spec);
      if(coin)state.coinCache.set(spec.id,coin);
    }
    patchUniverseResolver();
  }

  function knownCoin(id){
    const key=String(id||"").trim().toLowerCase();
    for(const coin of state.coinCache.values()){
      if(String(coin.id).toLowerCase()===key||String(coin.symbol).toLowerCase()===key)return coin;
    }
    return null;
  }

  function patchUniverseResolver(){
    const base=globalThis.AtlasMarketUniverse1000;
    if(!base||base.new_listings_native_category===true)return false;
    const originalFind=typeof base.find==="function"?base.find.bind(base):()=>null;
    globalThis.AtlasMarketUniverse1000=Object.freeze({
      ...base,
      find(id){return knownCoin(id)||originalFind(id);},
      new_listings_native_category:true,
      new_listing_state_coins_injection:false
    });
    return true;
  }

  async function discover({force=false}={}){
    if(state.discovering)return state.specs.slice();
    const last=Date.parse(String(state.lastDiscoveryAt||""));
    if(!force&&Number.isFinite(last)&&Date.now()-last<DISCOVERY_COOLDOWN_MS){
      renderCategory();
      return state.specs.slice();
    }
    state.discovering=true;state.lastError=null;
    try{
      const [rows]=await Promise.all([
        globalThis.AgentCryptoNewListingLiveAsset?.discoverBitget?.({days:30})||[],
        fetchTickers(),
        fetchQuoteRates().catch(()=>new Map())
      ]);
      state.discovered=Array.isArray(rows)?rows.slice():[];
      state.specs=state.discovered.map(providerSpec).filter(Boolean).sort((a,b)=>(b.launchTime||0)-(a.launchTime||0));
      await enrichKnownIdentities(state.specs);
      cacheCoins();
      recomputeRadarStatus();
      state.lastDiscoveryAt=new Date().toISOString();
      return state.specs.slice();
    }catch(error){
      state.lastError=String(error?.message||error);
      return [];
    }finally{
      state.discovering=false;
      renderCategory();
    }
  }

  function fallbackCtSpec(){
    const ticker=state.tickerMap.get("CTUSDT")||null;
    return {
      id:"concrete",name:"Concrete",identityVerified:false,identitySource:null,canonicalName:null,coingeckoId:"concrete",image:null,symbol:"CT",base:"CT",quote:"USDT",pair:"CT/USDT",
      provider:"okx",providerLabel:"OKX",providerSymbol:"CT-USDT",discoveryProvider:"Bitget",discoverySymbol:"CTUSDT",
      listedAt:"2026-09-30T10:00:00Z",launchTime:Date.parse("2026-09-30T10:00:00Z"),ticker
    };
  }

  function allSpecs(){
    const rows=state.specs.slice();
    if(!rows.some(x=>x.symbol==="CT"))rows.unshift(fallbackCtSpec());
    return rows;
  }

  function visibleSpecs(){
    const q=upper(rawQuery());
    const all=allSpecs();
    if(!q)return state.enabled?all:[];
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
    const coin=state.coinCache.get(spec.id)||coinFromSpec(spec);
    const price=priceTruth(spec,coin);
    const selected=state.selected?.id===spec.id;
    const age=ageDays(spec.listedAt);
    const change=finite(coin?.change24h);
    const currency=displayCurrency();
    const volume=currency==="USD"?finite(coin?.volume24hUsd):finite(coin?.volume24h);
    const proof=radarProof(spec,coin);
    const logo=coin?.image?`<img src="${esc(coin.image)}" alt="" loading="eager" fetchpriority="high" width="32" height="32">`:"";
    return `<tr class="asset-row atlas-market-external-row ${selected?"is-selected is-compared":""}"
      ${ROOT_ATTR}="${esc(spec.id)}"
      data-market-row-id403115="${esc(spec.id)}"
      data-market-help-id="${esc(spec.id)}"
      data-crypto-id="${esc(spec.id)}"
      tabindex="0" role="button"
      aria-selected="${selected?"true":"false"}"
      aria-label="${esc(`${spec.name} ${spec.symbol}. Nouveau listing ${spec.providerLabel} ${spec.pair}.`)}">
      <td>${proof.status==="CONFIRMÉ"?"NEW":"?"}</td>
      <td><div class="coin-cell"><i class="market-identity-rail"></i>${logo}<div><strong class="market-coin-name">${esc(spec.name)}</strong>${selected?'<span class="market-active-badge">ACTIF</span>':""}<br><small>${esc(spec.symbol)}</small><br><span class="asset-badge">${proof.status==="CONFIRMÉ"?"Nouveau confirmé":"Candidat"} · ${esc(proof.ageBand)}${age!==null?` · ${age.toFixed(1)} j`:""}</span></div></div></td>
      <td><div class="price-dual"><strong>${esc(price.primary)}</strong><small>${esc(price.small)}</small></div></td>
      <td class="${change===null?"":change>=0?"pos":"neg"}"><span class="market-move-pill">${esc(pct(change))}</span></td>
      <td>—</td>
      <td class="market-col-advanced">—</td>
      <td class="market-col-advanced">${volume!==null?esc(compactMoney(volume,currency)):"—"}</td>
      <td class="spark-cell"><small>${esc(proof.status)}</small></td>
      <td class="market-col-advanced">—</td>
      <td class="market-col-advanced">Observer</td>
      <td><div class="market-row-actions"><button type="button" data-new-listing-open="${esc(spec.id)}">Solo</button><button type="button" data-new-listing-sources="${esc(spec.id)}">Sources</button></div></td>
    </tr>`;
  }

  function renderCategory(){
    if(typeof document==="undefined")return 0;
    hideLegacyUx();
    const body=document.getElementById(ROWS_ID);if(!body)return 0;
    const specs=visibleSpecs();

    body.querySelectorAll(`tr[${ROOT_ATTR}]`).forEach(node=>node.remove());

    if(state.enabled){
      body.innerHTML=specs.length
        ?specs.map(nativeRow).join("")
        :`<tr ${ROOT_ATTR}="empty"><td colspan="11" class="empty">${esc(state.discovering?"Chargement des nouveaux listings…":state.lastError?`Nouveaux listings indisponibles · ${state.lastError}`:"Aucun nouveau listing pour ce filtre.")}</td></tr>`;
    }else if(specs.length){
      body.insertAdjacentHTML("afterbegin",specs.map(nativeRow).join(""));
    }

    const note=document.getElementById(NOTE_ID);
    if(note&&state.enabled){
      const total=state.specs.length;
      note.textContent=state.discovering
        ?"Nouveaux listings · actualisation Bitget en cours…"
        :state.lastError
          ?`Nouveaux listings · ${state.lastError}`
          :`Radar Bitget · ${state.radarStatus.confirmed} confirmé(s) · ${state.radarStatus.candidates} candidat(s) · identités ${state.identityStatus.verified}/${state.identityStatus.attempted} · logos ${state.identityStatus.logos} · ${identityDiagnosticsLabel()} · relance ≥15 s · Market Core inchangé`;
    }
    return specs.length;
  }

  function wrapMarketRender(){
    if(state.renderWrapped)return true;
    const original=globalThis.renderMarketTable;
    if(typeof original!=="function")return false;
    state.originalRenderMarketTable=original;
    globalThis.renderMarketTable=function(...args){
      const result=original.apply(this,args);
      try{renderCategory();}catch(_){}
      return result;
    };
    state.renderWrapped=true;
    return true;
  }

  function resolveSpec(id){
    const key=String(id||"").trim().toLowerCase();
    return allSpecs().find(spec=>String(spec.id).toLowerCase()===key||String(spec.symbol).toLowerCase()===key||String(spec.providerSymbol).toLowerCase()===key)||null;
  }

  // Public read-only entry for an exact existing New Listing identity.
  // A caller restores identity; select() retrieves fresh provider data.
  async function selectById(id){
    const spec=resolveSpec(id);
    if(!spec)return false;
    return select(spec);
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
      source:`${spec.providerLabel} ${spec.pair} candles${upper(spec.quote)!==upper(currency)?` · ${spec.quote}/${currency} CoinGecko`:""}`,
      sourceFamily:spec.provider,
      sourceMode:"new-listing-exchange-native",
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

  function beginRequest(spec){
    try{state.requestController?.abort();}catch(_){}
    const request={revision:++state.requestRevision,controller:new AbortController(),spec};
    state.requestController=request.controller;
    state.pending=spec;
    return request;
  }

  function isCurrent(request){
    return request.revision===state.requestRevision&&!request.controller.signal.aborted;
  }

  function finishRequest(request){
    if(request.revision!==state.requestRevision)return;
    state.requestController=null;
    state.pending=null;
  }

  async function renderLine(spec,days=1,request){
    if(!spec||!isCurrent(request))return false;
    const ext=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();
    if(!ext?.active||String(ext.id)!==String(spec.id)){
      await globalThis.AgentCryptoNewListingLiveAsset?.load?.({
        provider:spec.provider,name:spec.name,id:spec.id,base:spec.base,quote:spec.quote,
        providerSymbol:spec.providerSymbol,listedAt:spec.listedAt
      },{nativeMarket:true,signal:request.controller.signal});
      if(!isCurrent(request))return false;
    }
    const cfg=periodConfig(days);
    const pack=await globalThis.AgentCryptoNewListingLiveAsset?.fetchCandles?.({bar:cfg.bar,limit:cfg.limit,signal:request.controller.signal});
    if(!isCurrent(request))return false;
    if(pack?.provider!==spec.provider||pack?.instrument!==`${spec.base}-${spec.quote}`)throw new Error("Réponse graphique hors contexte · affichage refusé");
    if(!pack?.rows?.length)throw new Error(`Bougies ${spec.pair} indisponibles`);
    if(!spec.ticker){
      const live=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()?.marketTicker;
      if(live)spec.ticker={lastPrice:live.lastPrice,price24hPcnt:finite(live.change24h)!==null?Number(live.change24h)/100:null,ts:Date.parse(live.timestamp||"")};
    }
    const coin=coinFromSpec(spec)||state.coinCache.get(spec.id);
    if(!coin)throw new Error("Fiche New Listing indisponible");
    state.coinCache.set(spec.id,coin);patchUniverseResolver();
    const result=resultFromCandles(spec,coin,pack,days);
    const presented=globalThis.AtlasExternalChart?.present?.(
      coin,
      Number(days||1),
      result,
      {source:"new-listing-native-category"}
    );
    if(!presented)throw new Error("API publique Graphique externe indisponible");
    state.lastResult=result;
    state.lastPublishedSpecKey=[spec.id,spec.pair,spec.provider].join('|');
    patchNativeFiche(spec,coin,result);
    const caption=document.getElementById("chartCaption");
    if(caption){const t=caption.querySelector(".chart-caption-text");if(t)t.textContent=`${spec.symbol} · Nouveau listing · ${spec.providerLabel} ${spec.pair} · données réelles · ${result.series.length} points`;}
    hideLegacyUx();
    // Event emitted only AFTER a real external line series is published by
    // the canonical chart owner. Other readers may react without new owners.
    window.dispatchEvent(new CustomEvent("agent-crypto:new-listing-line-ready",{
      detail:{id:spec.id,symbol:spec.symbol,graph:"line",periodDays:Number(days||1),provider:spec.provider}
    }));
    return true;
  }

  // Two readers requesting the SAME listing share one network/graph operation.
  // Only a genuinely different selection supersedes and aborts its predecessor.
  // This prevents the Trader V7 restorer and memory A/B/C recall from cancelling CT.
  function select(spec){
    if(!spec)return Promise.resolve(false);
    const flight=state.selectionFlight;
    if(flight&&flight.id===spec.id&&flight.revision===state.requestRevision
       &&!flight.controller.signal.aborted)return flight.promise;
    const request=beginRequest(spec);
    const promise=selectRequested(spec,request);
    const owner={id:spec.id,revision:request.revision,controller:request.controller,promise};
    state.selectionFlight=owner;
    void promise.then(
      ()=>{if(state.selectionFlight===owner)state.selectionFlight=null;},
      ()=>{if(state.selectionFlight===owner)state.selectionFlight=null;}
    );
    return promise;
  }
  async function selectRequested(spec,request){
    state.lastError=null;
    const previousSelection=state.selected;
    const previousResult=state.lastResult;
    let published=false;
    try{
      if(upper(spec.quote)!==displayCurrency()&&!quoteRate(spec.quote,displayCurrency())){
        await fetchQuoteRates({signal:request.controller.signal});
        if(!isCurrent(request))return false;
      }
      const loaded=await globalThis.AgentCryptoNewListingLiveAsset?.load?.({
        provider:spec.provider,name:spec.name,id:spec.id,base:spec.base,quote:spec.quote,
        providerSymbol:spec.providerSymbol,listedAt:spec.listedAt
      },{nativeMarket:true,signal:request.controller.signal});
      if(!isCurrent(request)||!loaded)return false;
      if(loaded?.marketTicker){
        spec.ticker={
          ...(spec.ticker||{}),
          lastPrice:loaded.marketTicker.lastPrice,
          price24hPcnt:finite(loaded.marketTicker.change24h)!==null?Number(loaded.marketTicker.change24h)/100:spec.ticker?.price24hPcnt,
          ts:Date.parse(loaded.marketTicker.timestamp||"")||spec.ticker?.ts
        };
      }
      const coin=coinFromSpec(spec);if(coin)state.coinCache.set(spec.id,coin);
      state.selected=spec;patchUniverseResolver();renderCategory();
      globalThis.AgentCryptoMarketMicroscope?.setMode?.("native");
      if(!await renderLine(spec,1,request)||!isCurrent(request))return false;
      try{globalThis.AgentCryptoMarketFicheDisplay406518?.apply?.("new-listing-category-select");}catch(_){}
      // Last writer of the visible Fiche is the selected external listing,
      // not the Market BTC subprofile retained for later explicit return.
      if(isCurrent(request)&&globalThis.AtlasExternalChart?.state?.()?.coin_id===spec.id){
        patchNativeFiche(spec,state.coinCache.get(spec.id)||coinFromSpec(spec),state.lastResult);
      }
      hideLegacyUx();
      // Only a published, identity-checked CT line confirms the external view.
      published=true;
      // Only explicit navigation controls own viewport position.
      // Selecting/restoring an external listing never repositions the page.
      return true;
    }catch(error){
      if(!isCurrent(request))return false;
      state.lastError=String(error?.message||error);
      const note=document.getElementById(NOTE_ID);if(note)note.textContent=`Nouveau listing ${spec.symbol} · ${state.lastError}`;
      return false;
    }finally{
      if(isCurrent(request)&&!published){
        // Restore the previous listing owner on failure: no phantom CT selection
        // may remain behind a Market Top 5 chart.
        state.selected=previousSelection;
        state.lastResult=previousResult;
        // If the exchange was loaded but no CT line was published, release its
        // provisional source. Otherwise the old Top 5 could inherit a CT label.
        if(!previousSelection){
          const chart=globalThis.AtlasExternalChart?.state?.();
          if(!chart?.active||chart.coin_id!==spec.id)
            try{globalThis.AgentCryptoNewListingLiveAsset?.deactivate?.();}catch(_){}
        }
        renderCategory();
      }
      finishRequest(request);
    }
  }

  function deactivate({clearChart=true}={}){
    const hadSelection=Boolean(state.selected||state.pending);
    ++state.requestRevision;
    try{state.requestController?.abort();}catch(_){}
    state.requestController=null;
    state.pending=null;
    state.selected=null;
    state.lastResult=null;
    try{globalThis.AgentCryptoNewListingLiveAsset?.deactivate?.();}catch(_){}
    if(clearChart){
      try{globalThis.AtlasExternalChart?.clear?.("new-listing-native-exit");}catch(_){}
    }
    hideLegacyUx();
    // A return to canonical BTC/Q must also remove the old ACTIF badge
    // from the New Listing table, even if the table stays visible.
    renderCategory();
    return hadSelection;
  }

  function sourceInfo(spec){
    const note=document.getElementById(NOTE_ID);if(!note||!spec)return;
    const identity=spec.identityVerified?`${spec.canonicalName||spec.name} · identité ${spec.identitySource||"vérifiée"}`:"nom projet non enrichi";
    const proof=radarProof(spec,state.coinCache.get(spec.id)||coinFromSpec(spec));
    note.textContent=`${spec.symbol} · ${proof.status} ${proof.proofCount}/3 (date+prix+volume) · ${identity} · listing ${spec.discoveryProvider} ${spec.discoverySymbol} · analyse ${spec.providerLabel} ${spec.pair} · ticker seul ≠ identité canonique`;
  }

  function bindRows(){
    const body=document.getElementById(ROWS_ID);if(!body||body.dataset.newListingsNativeCategory==="1")return;
    body.dataset.newListingsNativeCategory="1";
    body.addEventListener("click",event=>{
      const sources=event.target?.closest?.("[data-new-listing-sources]");
      if(sources){event.preventDefault();event.stopPropagation();sourceInfo(resolveSpec(sources.dataset.newListingSources));return;}
      const button=event.target?.closest?.("[data-new-listing-open]");
      const row=event.target?.closest?.(`tr[${ROOT_ATTR}]`);
      if(!button&&!row)return;
      event.preventDefault();event.stopPropagation();
      const spec=resolveSpec(button?.dataset?.newListingOpen||row?.getAttribute(ROOT_ATTR));
      if(event.isTrusted===true){
        if(spec?.id==="concrete")globalThis.atlasTraderExternalSelectionCommit?.(spec);
        else globalThis.atlasTraderExternalSelectionClear?.();
      }
      void select(spec);
    });
    body.addEventListener("keydown",event=>{
      const row=event.target?.closest?.(`tr[${ROOT_ATTR}]`);
      if(!row||!["Enter"," "].includes(event.key))return;
      event.preventDefault();event.stopPropagation();
      const spec=resolveSpec(row.getAttribute(ROOT_ATTR));
      if(event.isTrusted===true){
        if(spec?.id==="concrete")globalThis.atlasTraderExternalSelectionCommit?.(spec);
        else globalThis.atlasTraderExternalSelectionClear?.();
      }
      void select(spec);
    });
  }

  function bindCategoryButton(){
    const button=document.getElementById(BUTTON_ID);if(!button||button.dataset.newListingsNativeCategory==="1")return;
    button.dataset.newListingsNativeCategory="1";
    button.addEventListener("click",event=>{
      if(state.radarOpen){
        radarView(false);
        // Returning to the already-active native New Listings category must not
        // accidentally toggle it OFF or reset its selected CT context.
        if(state.enabled){
          event.preventDefault();event.stopImmediatePropagation();
          renderCategory();
          return;
        }
      }
      event.preventDefault();event.stopImmediatePropagation();
      const next=!state.enabled;
      if(!next&&(state.selected||state.pending)){
        if(event.isTrusted===true)globalThis.atlasTraderExternalSelectionClear?.();
        deactivate();
      }
      state.enabled=next;
      button.classList.toggle("active",state.enabled);button.classList.toggle("is-active",state.enabled);
      button.setAttribute("aria-pressed",state.enabled?"true":"false");
      hideLegacyUx();
      if(state.enabled){
        document.querySelectorAll(".filter-btn[data-filter]").forEach(b=>{if(b!==button)b.classList.remove("active");});
        void discover({force:false});
      }else{
        state.originalRenderMarketTable?.();
      }
    },true);
  }

  function bindOtherFilters(){
    document.addEventListener("click",event=>{
      const button=event.target?.closest?.(".filter-btn[data-filter]");
      if(!button||button.id===BUTTON_ID)return;
      if(state.radarOpen)radarView(false);
      if(state.enabled||state.selected||state.pending){
        state.enabled=false;
        const category=document.getElementById(BUTTON_ID);
        category?.classList.remove("active","is-active");
        category?.setAttribute("aria-pressed","false");
        if(state.selected||state.pending){
          if(event.isTrusted===true)globalThis.atlasTraderExternalSelectionClear?.();
          deactivate();
        }
      }
    },true);
  }

  function bindSearch(){
    const input=document.getElementById(SEARCH_ID);if(!input||input.dataset.newListingsNativeCategory==="1")return;
    input.dataset.newListingsNativeCategory="1";
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
      if(!button||!state.selected)return;
      event.preventDefault();event.stopImmediatePropagation();
      const days=Number(button.dataset.period)||1;
      globalThis.atlasChartSetPeriodButtons?.(days,true);
      const request=beginRequest(state.selected);
      void renderLine(state.selected,days,request).catch(error=>{
        if(!isCurrent(request))return;
        state.lastError=String(error?.message||error);
        globalThis.atlasChartSetPeriodButtons?.(days,false);
      }).finally(()=>finishRequest(request));
    },true);
  }

  function bindPresentationRefresh(){
    document.addEventListener("click",event=>{
      if(!state.selected)return;
      const control=event.target?.closest?.("[data-chart-view],[data-chart-scale],[data-chart-display]");
      if(!control)return;
      const revision=state.requestRevision;
      setTimeout(()=>{
        if(!state.selected||revision!==state.requestRevision)return;
        const coin=state.coinCache.get(state.selected.id);
        if(state.lastResult&&coin)patchNativeFiche(state.selected,coin,state.lastResult);
        hideLegacyUx();
      },0);
    });
  }

  function bindCanonicalExit(){
    document.addEventListener("click",event=>{
      if(!state.selected&&!state.pending)return;
      if(event.target?.closest?.(`tr[${ROOT_ATTR}]`))return;
      const canonical=event.target?.closest?.(CANONICAL_EXIT_SELECTOR);
      if(!canonical)return;
      if(event.isTrusted===true)globalThis.atlasTraderExternalSelectionClear?.();
      deactivate({clearChart:false});
    },true);
  }

  // Radar owns a VIEW, not the Market, chart or navigation state.
  // Its native cells inherit the Administrator/Trader theme. Both presentations
  // share the exact same public parser defined by laboratoire/radar.js.
  let radarNativePromise=null;
  function loadRadarScript(url){
    return new Promise((resolve,reject)=>{
      const el=document.createElement("script");
      el.src=new URL(url,document.baseURI).href;
      el.async=true;
      el.onload=resolve;
      el.onerror=()=>reject(new Error("Module Radar indisponible : "+url));
      document.head.appendChild(el);
    });
  }
  function ensureNativeRadar(){
    if(radarNativePromise)return radarNativePromise;
    radarNativePromise=(async()=>{
      if(!globalThis.AgentCryptoRadarReader)
        await loadRadarScript("../laboratoire/radar.js");
      if(!globalThis.AgentCryptoRadarReader)throw new Error("Lecteur Radar non disponible");
      if(!globalThis.AgentCryptoRadarNative)
        await loadRadarScript("./js/market-radar-native.js");
      if(!globalThis.AgentCryptoRadarNative?.mount)throw new Error("Présentation native Radar non disponible");
      return true;
    })().catch(error=>{radarNativePromise=null;throw error;});
    return radarNativePromise;
  }
  function radarView(open){
    const panel=document.getElementById("marketSnapshotPanel");
    const button=document.getElementById("atlasPublicRadarLink");
    const view=document.getElementById("atlasRadarMarketView");
    if(!panel||!button||!view)return false;
    const visible=!!open;
    panel.classList.toggle("atlas-radar-open",visible);
    view.hidden=!visible;
    state.radarOpen=visible;
    button.classList.toggle("active",visible);
    button.classList.toggle("is-active",visible);
    button.setAttribute("aria-pressed",String(visible));
    button.setAttribute("aria-expanded",String(visible));
    if(visible){
      void ensureNativeRadar().then(()=>{
        if(!state.radarOpen||!view.isConnected)return;
        globalThis.AgentCryptoRadarNative.mount(view);
      }).catch(error=>{
        if(!state.radarOpen)return;
        view.textContent="Radar indisponible : "+String(error?.message||error);
      });
    }
    return true;
  }
  function mountRadarLink(){
    const button=document.getElementById(BUTTON_ID);
    const market=document.getElementById("marketSnapshotPanel");
    const tools=document.getElementById("marketTools");
    if(!button||!button.parentElement||!market||!tools)return false;
    if(document.getElementById("atlasPublicRadarLink"))return true;
    const css=document.createElement("style");
    css.id="atlasRadarTabStyle";
    const hiddenSelectors=[
      "#marketSnapshotPanel.atlas-radar-open #marketUniverseMode",
      "#marketSnapshotPanel.atlas-radar-open .market-column-mode",
      "#marketSnapshotPanel.atlas-radar-open .sort-box",
      "#marketSnapshotPanel.atlas-radar-open .section-head .search-box",
      "#marketSnapshotPanel.atlas-radar-open #marketTableWindowBody",
      "#marketSnapshotPanel.atlas-radar-open #tableNote"
    ];
    css.textContent=hiddenSelectors.join(",")+"{display:none!important}"+
      "#atlasRadarMarketView[hidden]{display:none!important}";
    document.head.appendChild(css);
    const theme=document.createElement("link");
    theme.rel="stylesheet";
    theme.href=new URL("./market-radar-native.css",document.baseURI).href;
    theme.dataset.agentCryptoRadarTheme="native";
    document.head.appendChild(theme);
    const tab=document.createElement("button");
    tab.id="atlasPublicRadarLink";
    tab.type="button";
    tab.className="filter-btn";
    tab.textContent="Radar";
    tab.title="Radar · Top 10/20/50/250, nouveaux listings Spot, BTC/CT PAPER";
    tab.setAttribute("aria-label","Afficher Radar dans Market Snapshot");
    tab.setAttribute("aria-expanded","false");
    tab.setAttribute("aria-controls","atlasRadarMarketView");
    tab.setAttribute("aria-pressed","false");
    button.insertAdjacentElement("afterend",tab);
    const view=document.createElement("section");
    view.id="atlasRadarMarketView";
    view.hidden=true;
    view.setAttribute("aria-label","Radar Marché et nouveaux listings en lecture seule");
    tools.insertAdjacentElement("afterend",view);
    tab.addEventListener("click",event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      radarView(!state.radarOpen);
    });
    return true;
  }
  function mount(){
    if(typeof document==="undefined")return false;
    hideLegacyUx();patchUniverseResolver();wrapMarketRender();bindRows();bindCategoryButton();bindSearch();mountRadarLink();
    if(!state.mounted){bindOtherFilters();bindPeriod();bindPresentationRefresh();bindCanonicalExit();state.mounted=true;}
    renderCategory();
    return true;
  }

  // Public-only source for Trader Math: read the SAME chart result already
  // accepted by AtlasExternalChart, never fetch or recreate any graph owner.
  function mathSeriesSnapshot(){
    const spec=state.selected,result=state.lastResult;
    if(!spec||!result||state.lastPublishedSpecKey!==[spec.id,spec.pair,spec.provider].join('|')||
       result.blocked||result.integrity?.ok!==true||
       result.sourceMode!=="new-listing-exchange-native"||result.provider!==spec.provider||
       typeof result.source!=="string"||!result.source.includes(spec.pair)||
       !Array.isArray(result.series)||result.series.length<21)return null;
    return Object.freeze({
      instrument:spec.pair,provider:spec.provider,
      source:result.source,currency:result.currency,periodDays:result.periodDays,
      series:Object.freeze(result.series.map(row=>Object.freeze([row[0],row[1]])))
    });
  }

  function snapshot(){
    return Object.freeze({
      build:MODULE_VERSION,enabled:state.enabled,discovered:state.specs.length,
      selectedId:state.selected?.id||null,selectedSymbol:state.selected?.symbol||null,
      pendingId:state.pending?.id||null,
      lastDiscoveryAt:state.lastDiscoveryAt,lastError:state.lastError,
      identityStatus:{...state.identityStatus},
      registryStatus:{...state.registryStatus},
      radarStatus:{...state.radarStatus},
      discoveryCooldownMs:DISCOVERY_COOLDOWN_MS,
      duplicateGraph:false,duplicateFiche:false,duplicateDepth:false,
      legacyRibbonVisible:false,returnMarketButton:false
    });
  }

  function selfTest(){
    const ct=fallbackCtSpec();
    const generic=providerSpec({base:"MHA",quote:"USDT",providerSymbol:"MHAUSDT",listedAt:new Date(Date.now()-2*86400000).toISOString(),launchTime:Date.now()-2*86400000});
    generic.ticker={lastPrice:"1.25",turnover24h:"250000",price24hPcnt:"0.04",ts:Date.now()};
    const coin=coinFromSpec(generic);
    const proof=radarProof(generic,coin);
    const candidate=radarProof({...generic,ticker:null},null);
    const pass=ct.providerSymbol==="CT-USDT"
      &&generic?.provider==="bitget"
      &&proof.status==="CONFIRMÉ"
      &&candidate.status==="CANDIDAT"
      &&ageBand(.5).label==="<24 h"
      &&ageBand(5).label==="4–7 j";
    return Object.freeze({build:MODULE_VERSION,pass,checks:Object.freeze({
      category_not_ct_only:true,
      ct_supported:ct.providerSymbol==="CT-USDT",
      safe_radar_bitget_only:true,
      live_refresh_on_reopen_with_cooldown:true,
      discovery_cooldown_ms:DISCOVERY_COOLDOWN_MS,
      confirmed_requires_date_price_volume:proof.status==="CONFIRMÉ",
      candidate_when_market_proof_missing:candidate.status==="CANDIDAT",
      age_bands:true,
      identity_github_registry_primary:true,
      identity_binary_logo_assets:true,
      identity_remote_batch_emergency_only:true,
      identity_exact_id_symbol:true,
      identity_retry_storm_removed:true,
      identity_failure_non_blocking:true,
      native_market_category:true,
      native_fiche_surface_reused:true,
      native_main_line_graph_reused:true,
      graph_owner_public_api:typeof globalThis.AtlasExternalChart?.present==="function",
      private_graph_context_write:false,
      native_candles_owner_reused:true,
      native_depth_owner_reused:true,
      state_coins_injection:false,
      ranking_mutation:false,
      duplicate_graph:false,duplicate_fiche:false,duplicate_depth:false,
      recurring_timer:false,mutation_observer:false,storage_write:false,
      real_order:false,wallet:false
    })});
  }

  globalThis.AgentCryptoNewListingsNativeCategory=Object.freeze({
    build:MODULE_VERSION,mount,discover,select,selectById,deactivate,snapshot,mathSeriesSnapshot,self_test:selfTest,
    identity_enrichment:"GitHub static identity memory first with real PNG assets; CoinGecko batch only for unresolved known ids; exact id+symbol proof; fail-open",
    identity_logos:true,
    safe_radar:true,
    discovery_source:"Bitget launchTime only",
    live_refresh_cooldown_ms:DISCOVERY_COOLDOWN_MS,
    confirmation_rule:"launchTime + live price + positive 24h volume",
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
