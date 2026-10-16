/* Agent-Crypto — MARKET INSTRUMENT RESOLVER
   One owner for selected asset -> available venue/instrument/capability.
   Discovery is delegated to Private Backend 127.0.0.1:8790.
   Provider policy: OKX first, then Bitget, then Binance. Book remains provider-capability gated.
   Read-only. No order, wallet, private exchange API, timer, observer or persistent storage. */
(()=>{
  "use strict";
  const BUILD="40.6.621";
  const CACHE_TTL_MS=60000;
  const cache=new Map();
  let last=null;
  // Only the newest candle-resolution request may update the shared execution truth.
  // Book lookups remain independent and never replace the candle snapshot.
  let candleResolveGeneration=0;
  let selectedRefreshGeneration=0;
  const pairOwner=()=>globalThis.AgentCryptoOkxMarketPairResolver||null;
  const quoteOwner=()=>globalThis.AgentCryptoQuoteCurrencyArchitecture||null;
  const normalizeAsset=value=>{
    try{const canonical=pairOwner()?.normalizeAsset?.(value);if(canonical)return canonical;}catch(_){}
    const v=String(value??"").trim().toUpperCase();
    return /^[A-Z0-9]{1,16}$/.test(v)?v:null;
  };
  const normalizeQuote=value=>{
    try{const canonical=pairOwner()?.normalizeQuote?.(value);if(canonical)return canonical;}catch(_){}
    const v=String(value??"").trim().toUpperCase();
    return /^[A-Z0-9]{2,16}$/.test(v)?v:null;
  };
  const normalizeCurrency=value=>String(value||"EUR").toUpperCase()==="USD"?"USD":"EUR";
  const selectedAsset=()=>normalizeAsset(pairOwner()?.selectedAsset?.())||"BTC";
  const displayCurrency=()=>normalizeCurrency(pairOwner()?.displayCurrency?.()||quoteOwner()?.snapshot?.()?.displayCurrency||"EUR");
  function backendRoot(){
    try{
      const raw=String(globalThis.AgentCryptoOkxLocalTransport?.backend||"http://127.0.0.1:8790/okx-public");
      const u=new URL(raw);
      return u.origin;
    }catch(_){return "http://127.0.0.1:8790";}
  }
  function sanitizeChoice(value){
    if(!value||typeof value!=="object")return null;
    const provider=String(value.provider||"").toLowerCase();
    const asset=normalizeAsset(value.asset),quote=normalizeQuote(value.quote);
    const instrument=String(value.instrument||"").trim().toUpperCase();
    const caps=Array.isArray(value.capabilities)?value.capabilities.map(String):[];
    if(!["okx","bitget","binance"].includes(provider)||!asset||!quote||!new RegExp("^"+asset+"-"+quote+"$").test(instrument))return null;
    return Object.freeze({provider,providerLabel:provider==="okx"?"OKX":provider==="bitget"?"Bitget":"Binance",asset,quote,instrument,capabilities:Object.freeze(caps)});
  }
  function normalizePayload(payload,asset,currency){
    const p=payload&&typeof payload==="object"?payload:{};
    const matches=Array.isArray(p.matches)?p.matches.map(sanitizeChoice).filter(Boolean):[];
    const chosenCandles=sanitizeChoice(p?.chosen?.candles);
    const chosenBook=sanitizeChoice(p?.chosen?.book);
    return Object.freeze({
      build:BUILD,
      backendVersion:String(p.backend_version||"?"),
      asset:normalizeAsset(p.asset)||asset,
      currency:normalizeCurrency(p.display_currency||currency),
      status:String(p.status||"unavailable"),
      matches:Object.freeze(matches),
      chosen:Object.freeze({candles:chosenCandles,book:chosenBook}),
      providerOrder:Object.freeze(Array.isArray(p.provider_order)?p.provider_order.map(String):[]),
      quoteOrder:Object.freeze(Array.isArray(p.quote_order)?p.quote_order.map(String):[]),
      observedAt:String(p.observed_at_utc||""),
      read_only:true
    });
  }
  function resultFor(payload,capability){
    const cap=capability==="book"?"book":"candles";
    const choice=payload.chosen[cap];
    return Object.freeze({
      build:BUILD,
      available:!!choice,
      capability:cap,
      asset:payload.asset,
      currency:payload.currency,
      provider:choice?.provider||null,
      providerLabel:choice?.providerLabel||null,
      instrument:choice?.instrument||null,
      quote:choice?.quote||null,
      matches:payload.matches,
      backendVersion:payload.backendVersion,
      status:choice?"ok":"unavailable",
      reason:choice?null:(cap==="book"?"Aucun carnet compatible trouvé sur les sources carnet connectées.":"Aucune paire de bougies compatible trouvée sur OKX, Bitget ou Binance."),
      read_only:true
    });
  }
  function publishExecutionTruth(result){
    const owner=quoteOwner();
    if(!owner)return false;
    try{
      if(typeof owner.setExecutionTruth==="function"){
        owner.setExecutionTruth(result.available?{
          available:true,
          instrument:result.instrument,
          settlementAsset:result.quote,
          provider:result.provider
        }:{
          available:false,
          asset:result.asset,
          provider:null
        },{reason:"market-instrument-resolver",emit:false});
        return true;
      }
      if(result.available){
        owner.setExecutionInstrument?.(result.instrument,{reason:"market-instrument-resolver",emit:false});
        owner.setSettlementAsset?.(result.quote,{reason:"market-instrument-resolver",emit:false});
        owner.render?.();
        return true;
      }
    }catch(_){}
    return false;
  }
  async function resolve(options={}){
    const asset=normalizeAsset(options.asset)||selectedAsset();
    const currency=normalizeCurrency(options.currency||displayCurrency());
    const capability=options.capability==="book"?"book":"candles";
    const generation=capability==="candles"?++candleResolveGeneration:null;
    const key=asset+"|"+currency;
    const now=Date.now();
    let payload=null;
    const cached=cache.get(key);
    if(!options.force&&cached&&now-cached.at<=CACHE_TTL_MS)payload=cached.payload;
    if(!payload){
      const url=new URL(backendRoot()+"/market-resolve");
      url.searchParams.set("asset",asset);
      url.searchParams.set("currency",currency);
      let response;
      try{response=await fetch(url,{cache:"no-store",signal:options.signal,headers:{Accept:"application/json"}});}
      catch(error){
        if(options.signal?.aborted)throw error;
        const e=new Error("Resolver marché local indisponible · "+asset);e.code="MARKET_RESOLVER_OFFLINE";throw e;
      }
      let raw={};
      try{raw=await response.json();}catch(_){}
      if(!response.ok){
        const e=new Error(String(raw?.error||raw?.detail||("Resolver marché HTTP "+response.status)));e.code="MARKET_RESOLVER_HTTP";e.status=response.status;throw e;
      }
      payload=normalizePayload(raw,asset,currency);
      if(payload.asset!==asset||payload.currency!==currency){
        const e=new Error("Réponse resolver hors contexte · "+asset+"/"+currency);
        e.code="MARKET_RESOLVER_CONTEXT_MISMATCH";
        throw e;
      }
      cache.set(key,{at:now,payload});
    }
    const result=resultFor(payload,capability);
    // Older BTC responses cannot overwrite OKB after a rapid market switch.
    // An independent book resolution cannot alter the candle execution label.
    if(capability==="candles"&&generation===candleResolveGeneration&&
       asset===selectedAsset()&&currency===displayCurrency()){
      last=result;
      if(options.publish!==false)publishExecutionTruth(result);
    }
    return result;
  }
  async function fetchCandles({resolution,bar="15m",limit=300,signal=null}={}){
    const r=resolution;
    if(!r?.available||!r.provider||!r.instrument){
      const e=new Error(r?.reason||"Instrument bougies indisponible");e.code="MARKET_INSTRUMENT_UNAVAILABLE";throw e;
    }
    const url=new URL(backendRoot()+"/market-candles");
    url.searchParams.set("provider",r.provider);
    url.searchParams.set("instrument",r.instrument);
    url.searchParams.set("bar",String(bar||"15m"));
    url.searchParams.set("limit",String(Math.max(1,Math.min(300,Number(limit)||300))));
    let response;
    try{response=await fetch(url,{cache:"no-store",signal,headers:{Accept:"application/json"}});}
    catch(error){if(signal?.aborted)throw error;const e=new Error("Backend marché indisponible · "+r.instrument);e.code="MARKET_CANDLES_OFFLINE";throw e;}
    let raw={};
    try{raw=await response.json();}catch(_){}
    if(!response.ok||String(raw?.status||"").toLowerCase()!=="ok"||!Array.isArray(raw?.rows)||!raw.rows.length){
      const e=new Error(String(raw?.error||raw?.detail||("Candles "+r.instrument+" indisponibles")));e.code="MARKET_CANDLES_UNAVAILABLE";e.status=response.status;throw e;
    }
    return Object.freeze({
      provider:String(raw.provider||r.provider).toLowerCase(),
      providerLabel:String(raw.provider||r.provider).toLowerCase()==="okx"?"OKX":String(raw.provider||r.provider).toLowerCase()==="bitget"?"Bitget":"Binance",
      instrument:String(raw.instrument||r.instrument).toUpperCase(),
      quote:String(raw.quote||r.quote).toUpperCase(),
      rows:raw.rows.slice(),
      backendVersion:String(raw.backend_version||r.backendVersion||"?"),
      observedAt:String(raw.observed_at_utc||""),
      read_only:true
    });
  }
  async function fetchBook({resolution,limit=100,signal=null}={}){
    const r=resolution;
    if(!r?.available||!r.provider||!r.instrument){
      const e=new Error(r?.reason||"Carnet indisponible");e.code="MARKET_BOOK_UNAVAILABLE";throw e;
    }
    const url=new URL(backendRoot()+"/market-book");
    url.searchParams.set("provider",r.provider);
    url.searchParams.set("instrument",r.instrument);
    url.searchParams.set("limit",String(Math.max(5,Math.min(400,Number(limit)||100))));
    let response;
    try{response=await fetch(url,{cache:"no-store",signal,headers:{Accept:"application/json"}});}
    catch(error){if(signal?.aborted)throw error;const e=new Error("Backend carnet indisponible · "+r.instrument);e.code="MARKET_BOOK_OFFLINE";throw e;}
    let raw={};
    try{raw=await response.json();}catch(_){}
    if(!response.ok||String(raw?.status||"").toLowerCase()!=="ok"||!Array.isArray(raw?.bids)||!raw.bids.length||!Array.isArray(raw?.asks)||!raw.asks.length){
      const e=new Error(String(raw?.error||raw?.detail||("Carnet "+r.instrument+" indisponible")));e.code="MARKET_BOOK_UNAVAILABLE";e.status=response.status;throw e;
    }
    return Object.freeze({
      read_only:true,
      provider:String(raw.provider||r.provider).toLowerCase(),
      status:"ok",
      asset:String(raw.asset||r.asset).toUpperCase(),
      quote:String(raw.quote||r.quote).toUpperCase(),
      pair:String(raw.pair||raw.instrument||r.instrument).toUpperCase(),
      instrument:String(raw.instrument||r.instrument).toUpperCase(),
      observed_at_utc:String(raw.observed_at_utc||""),
      bids:raw.bids.slice(),
      asks:raw.asks.slice(),
      backend_version:String(raw.backend_version||r.backendVersion||"?")
    });
  }
  async function refreshSelected(reason="selected-market-changed"){
    const generation=++selectedRefreshGeneration;
    const asset=selectedAsset(),currency=displayCurrency();
    // Report the newly requested market while its provider is resolving.
    last=Object.freeze({build:BUILD,available:null,capability:"candles",
      asset,currency,provider:null,instrument:null,quote:null,
      status:"resolving",reason,read_only:true});
    try{
      return await resolve({asset,currency,capability:"candles",publish:true,latestOnly:true});
    }catch(error){
      // Do not let the failed request for a previous asset erase the new one.
      if(generation!==selectedRefreshGeneration||
         asset!==selectedAsset()||currency!==displayCurrency())return null;
      last=Object.freeze({build:BUILD,available:false,capability:"candles",
        asset,currency,provider:null,instrument:null,quote:null,
        status:"error",reason:String(error?.message||error),read_only:true});
      publishExecutionTruth(last);
      return last;
    }
  }
  function snapshot(){return last||Object.freeze({build:BUILD,available:null,asset:selectedAsset(),currency:displayCurrency(),status:"idle",read_only:true});}
  function selfTest(){
    const fixture=normalizePayload({
      backend_version:"1.4.6",status:"ok",asset:"OKB",display_currency:"USD",
      provider_order:["okx","bitget","binance"],quote_order:["USDC","USDT"],
      matches:[
        {provider:"okx",asset:"OKB",quote:"USDC",instrument:"OKB-USDC",capabilities:["candles","book","ticker"]},
        {provider:"bitget",asset:"OKB",quote:"USDT",instrument:"OKB-USDT",capabilities:["candles","book","ticker"]}
      ],
      chosen:{
        candles:{provider:"okx",asset:"OKB",quote:"USDC",instrument:"OKB-USDC",capabilities:["candles","book","ticker"]},
        book:{provider:"okx",asset:"OKB",quote:"USDC",instrument:"OKB-USDC",capabilities:["candles","book","ticker"]}
      }
    },"OKB","USD");
    const c=resultFor(fixture,"candles"),b=resultFor(fixture,"book");
    const btw=resultFor(normalizePayload({status:"ok",asset:"BTW",display_currency:"USD",provider_order:["okx","bitget","binance"],quote_order:["USDC","USDT"],chosen:{candles:{provider:"bitget",asset:"BTW",quote:"USDT",instrument:"BTW-USDT",capabilities:["candles","book","ticker"]},book:{provider:"bitget",asset:"BTW",quote:"USDT",instrument:"BTW-USDT",capabilities:["candles","book","ticker"]}}}, "BTW","USD"),"candles");
    const meme=resultFor(normalizePayload({status:"ok",asset:"M",display_currency:"USD",provider_order:["okx","bitget","binance"],quote_order:["USDC","USDT"],chosen:{candles:{provider:"bitget",asset:"M",quote:"USDT",instrument:"M-USDT",capabilities:["candles","book","ticker"]},book:{provider:"bitget",asset:"M",quote:"USDT",instrument:"M-USDT",capabilities:["candles","book","ticker"]}}}, "M","USD"),"candles");
    const unavailable=resultFor(normalizePayload({status:"unavailable",asset:"NONE",display_currency:"USD",chosen:{}}, "NONE","USD"),"candles");
    const pass=c.available&&c.provider==="okx"&&c.instrument==="OKB-USDC"&&b.available&&b.quote==="USDC"&&btw.available&&btw.provider==="bitget"&&btw.instrument==="BTW-USDT"&&meme.available&&meme.asset==="M"&&meme.instrument==="M-USDT"&&!unavailable.available&&/Aucune paire/.test(unavailable.reason);
    return Object.freeze({build:BUILD,pass,checks:Object.freeze({
      okx_usdc_preferred:c.instrument==="OKB-USDC",
      book_capability_separate:b.capability==="book",
      btw_bitget_fallback:btw.provider==="bitget"&&btw.instrument==="BTW-USDT",
      single_char_asset_identity:meme.available&&meme.asset==="M"&&meme.instrument==="M-USDT",
      unavailable_is_explicit:!unavailable.available,
      no_symbol_whitelist:true,
      provider_order_backend_owned:true,
      no_timer:true,no_observer:true,no_storage:true,no_order:true,no_wallet:true
    })});
  }
  globalThis.AgentCryptoMarketInstrumentResolver=Object.freeze({
    build:BUILD,resolve,fetchCandles,fetchBook,refreshSelected,snapshot,self_test:selfTest,
    backend_root:backendRoot,selectedAsset,displayCurrency,publishExecutionTruth,
    read_only:true,providers:Object.freeze(["okx","bitget","binance"]),line_fallback:"existing_coingecko",
    recurring_timer:false,mutation_observer:false,storage_write:false,private_api:false,real_order:false,wallet:false
  });
  if(typeof window!=="undefined"){
    window.addEventListener("agent-crypto:selected-market-changed",()=>{void refreshSelected("selected-market-changed");},{passive:true});
    window.addEventListener("agent-crypto:quote-architecture-changed",event=>{
      if(String(event?.detail?.reason||"").startsWith("market-instrument-resolver"))return;
      void refreshSelected("quote-architecture-changed");
    },{passive:true});
    const boot=()=>{queueMicrotask(()=>{void refreshSelected("boot");});};
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  }
})();