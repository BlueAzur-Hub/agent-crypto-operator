/* Agent-Crypto — 40.6.517 CURRENCY DOMAIN V2
   Additive data-contract foundation only.
   It does not mutate Market Core, state.coins, dataBroker, Graphique, Oracle, Aether,
   execution instrument, settlement asset, Strategy, Evidence, Depth or Candles.
   No DOM write, timer, observer, storage write, market request, wallet or order. */
(()=>{
  "use strict";

  const BUILD="40.6.517";
  const SUPPORTED_CURRENCIES=Object.freeze(["EUR","USD","USDC","USDT"]);
  const DISPLAY_CURRENCIES=Object.freeze(["EUR","USD"]);
  const ANALYSIS_CURRENCY="EUR";
  const METHODS=Object.freeze(["native","fx-converted","cross-derived","legacy-eur"]);

  const upper=value=>String(value??"").trim().toUpperCase();
  const positive=value=>{
    const n=Number(value);
    return Number.isFinite(n)&&n>0?n:null;
  };
  const iso=value=>{
    if(value===null||value===undefined||value==="")return null;
    const n=typeof value==="number"?value:Date.parse(String(value));
    const ms=typeof value==="number"?(value<1e12?value*1000:value):n;
    return Number.isFinite(ms)?new Date(ms).toISOString():null;
  };
  const freeze=value=>Object.freeze(value);

  function normalizeCurrency(value){
    const currency=upper(value);
    return SUPPORTED_CURRENCIES.includes(currency)?currency:null;
  }

  function normalizeInstrument(value){
    const instrument=upper(value);
    return /^[A-Z0-9]+-[A-Z0-9]+$/.test(instrument)?instrument:null;
  }

  function makeQuoteValue(input={}){
    const value=positive(input.value);
    const currency=normalizeCurrency(input.currency);
    const timestamp=iso(input.timestamp);
    const sourceId=String(input.sourceId??"").trim();
    const sourceName=String(input.sourceName??"").trim();
    const method=String(input.method??"").trim().toLowerCase();
    const freshnessState=String(input.freshnessState??"").trim().toUpperCase();
    const instrument=input.instrument?normalizeInstrument(input.instrument):null;
    const convertedFrom=input.convertedFrom?normalizeCurrency(input.convertedFrom):null;
    const fxTimestamp=input.fxTimestamp?iso(input.fxTimestamp):null;
    const fxSource=String(input.fxSource??"").trim()||null;
    const ageMs=Number(input.ageMs);

    if(value===null||currency===null||timestamp===null)return null;
    if(!sourceId&&!sourceName)return null;
    if(!METHODS.includes(method))return null;
    if(input.instrument&&instrument===null)return null;
    if(method==="fx-converted"&&(!convertedFrom||!fxSource||!fxTimestamp))return null;
    if(convertedFrom===currency)return null;

    return freeze({
      value,
      currency,
      sourceId:sourceId||null,
      sourceName:sourceName||null,
      timestamp,
      freshnessState:freshnessState||"UNKNOWN",
      ageMs:Number.isFinite(ageMs)&&ageMs>=0?ageMs:null,
      instrument,
      method,
      convertedFrom,
      fxSource,
      fxTimestamp
    });
  }

  function makeQuoteBundle(input={}){
    const assetId=String(input.assetId??"").trim();
    if(!assetId)return null;
    const source=input.quotes&&typeof input.quotes==="object"?input.quotes:{};
    const quotes={};
    for(const currency of SUPPORTED_CURRENCIES){
      const candidate=source[currency];
      if(!candidate)continue;
      const normalized=makeQuoteValue(candidate);
      if(!normalized||normalized.currency!==currency)return null;
      quotes[currency]=normalized;
    }
    if(!Object.keys(quotes).length)return null;
    return freeze({
      assetId,
      quotes:freeze(quotes)
    });
  }

  function quoteFor(bundle,currency){
    const key=normalizeCurrency(currency);
    return key&&bundle?.quotes?.[key]||null;
  }

  function context(){
    let legacy={};
    try{legacy=globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()||{};}catch(_){}
    const display=DISPLAY_CURRENCIES.includes(upper(legacy.displayCurrency))?upper(legacy.displayCurrency):"EUR";
    const execution=normalizeInstrument(legacy.executionInstrument)||"BTC-EUR";
    const settlement=normalizeCurrency(legacy.settlementAsset)||"EUR";
    return freeze({
      build:BUILD,
      displayCurrency:display,
      analysisCurrency:ANALYSIS_CURRENCY,
      executionInstrument:execution,
      settlementAsset:settlement,
      displayChangesAnalysis:false,
      displayChangesExecution:false,
      displayChangesSettlement:false
    });
  }

  function project(bundle,currency=context().displayCurrency){
    /* Projection is selection only. No conversion is performed here. */
    return quoteFor(bundle,currency);
  }

  function chartStorageKey({assetId,period,sourceFamily,currency}={}){
    const asset=String(assetId??"").trim().toLowerCase();
    const days=Number(period);
    const family=String(sourceFamily??"").trim().toLowerCase();
    const quote=normalizeCurrency(currency);
    if(!asset||!Number.isFinite(days)||days<=0||!family||!quote)return null;
    return `${asset}:${days}:${family}:${quote}`;
  }

  function chartContextKey({assetIds,period,currency}={}){
    const ids=(Array.isArray(assetIds)?assetIds:[])
      .map(value=>String(value??"").trim().toLowerCase())
      .filter(Boolean);
    const days=Number(period);
    const quote=normalizeCurrency(currency);
    if(!ids.length||!Number.isFinite(days)||days<=0||!quote)return null;
    return ids.length===1
      ? `single:${ids[0]}:${days}:${quote}`
      : `comparison:${ids.join(",")}:${days}:${quote}`;
  }

  function selfTest(){
    const stamp="2026-10-03T20:00:00.000Z";
    const eur=makeQuoteValue({
      value:100,currency:"EUR",sourceId:"test-eur",timestamp:stamp,
      freshnessState:"FRESH",instrument:"BTC-EUR",method:"native"
    });
    const usd=makeQuoteValue({
      value:117,currency:"USD",sourceId:"test-usd",timestamp:stamp,
      freshnessState:"FRESH",method:"native"
    });
    const usdc=makeQuoteValue({
      value:116.9,currency:"USDC",sourceId:"test-usdc",timestamp:stamp,
      freshnessState:"FRESH",instrument:"BTC-USDC",method:"native"
    });
    const converted=makeQuoteValue({
      value:100,currency:"EUR",sourceId:"test-fx",timestamp:stamp,
      freshnessState:"FRESH",method:"fx-converted",convertedFrom:"USD",
      fxSource:"ECB",fxTimestamp:stamp
    });
    const bundle=makeQuoteBundle({assetId:"bitcoin",quotes:{EUR:eur,USD:usd,USDC:usdc}});
    const eurKey=chartStorageKey({assetId:"bitcoin",period:1,sourceFamily:"coingecko",currency:"EUR"});
    const usdKey=chartStorageKey({assetId:"bitcoin",period:1,sourceFamily:"coingecko",currency:"USD"});
    const eurContext=chartContextKey({assetIds:["bitcoin"],period:1,currency:"EUR"});
    const usdContext=chartContextKey({assetIds:["bitcoin"],period:1,currency:"USD"});
    const ctx=context();
    const stablecoinDistinct=quoteFor(bundle,"USD")?.currency==="USD"
      &&quoteFor(bundle,"USDC")?.currency==="USDC"
      &&quoteFor(bundle,"USD")!==quoteFor(bundle,"USDC");
    const pass=!!(
      eur&&usd&&usdc&&converted&&bundle
      &&project(bundle,"USD")?.currency==="USD"&&project(bundle,"USD")?.value===117
      &&stablecoinDistinct
      &&eurKey&&usdKey&&eurKey!==usdKey
      &&eurContext&&usdContext&&eurContext!==usdContext
      &&ctx.analysisCurrency==="EUR"
      &&ctx.executionInstrument==="BTC-EUR"
      &&ctx.settlementAsset==="EUR"
      &&makeQuoteValue({value:1,currency:"USD",timestamp:stamp,method:"native"})===null
      &&makeQuoteValue({value:1,currency:"EUR",sourceId:"x",timestamp:stamp,method:"fx-converted",convertedFrom:"USD"})===null
    );
    return freeze({
      build:BUILD,
      pass,
      checks:freeze({
        explicit_currency_required:!!eur,
        source_required:true,
        timestamp_required:true,
        usd_usdc_not_aliased:stablecoinDistinct,
        projection_does_not_convert:project(bundle,"USD")?.currency==="USD"&&project(bundle,"USD")?.value===117,
        chart_cache_key_contains_currency:eurKey!==usdKey,
        chart_context_contains_currency:eurContext!==usdContext,
        analysis_currency_locked_eur:ctx.analysisCurrency==="EUR",
        display_does_not_mutate_execution:ctx.executionInstrument==="BTC-EUR",
        settlement_remains_eur:ctx.settlementAsset==="EUR",
        no_dom_write:true,
        no_timer:true,
        no_observer:true,
        no_storage_write:true,
        no_network_request:true,
        no_market_core_mutation:true,
        no_strategy_mutation:true,
        no_real_order:true,
        no_wallet:true
      })
    });
  }

  globalThis.AgentCryptoCurrencyDomainV2=freeze({
    build:BUILD,
    supportedCurrencies:SUPPORTED_CURRENCIES,
    displayCurrencies:DISPLAY_CURRENCIES,
    analysisCurrency:ANALYSIS_CURRENCY,
    normalizeCurrency,
    normalizeInstrument,
    makeQuoteValue,
    makeQuoteBundle,
    quoteFor,
    project,
    context,
    chartStorageKey,
    chartContextKey,
    self_test:selfTest,
    additive_only:true,
    visual_change:false,
    legacy_price_semantics_changed:false,
    spot_broker_changed:false,
    chart_owner_changed:false,
    oracle_changed:false,
    aether_changed:false,
    depth_changed:false,
    candles_changed:false,
    market_core_changed:false,
    strategy_changed:false,
    recurring_timer:false,
    mutation_observer:false,
    storage_write:false,
    network_request:false,
    real_order:false,
    wallet:false
  });
})();
