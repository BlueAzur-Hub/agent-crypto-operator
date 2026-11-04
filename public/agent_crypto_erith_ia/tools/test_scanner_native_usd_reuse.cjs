"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const app = fs.readFileSync(path.join(__dirname, "../administrator/app.js"), "utf8");
const extracted = (begin, end) => {
  const i=app.indexOf(begin), j=app.indexOf(end,i+begin.length);
  assert.ok(i>=0 && j>i, "Missing scanned code boundary");
  return app.slice(i,j);
};
const helpers = extracted("function atlasScannerNativeUsdRequested(", "\nasync function atlasScannerYieldToUi(");
const direct = extracted("async function atlasScannerFetchDirect(", "\nconst ATLAS_SCANNER_COLLECTOR_SCHEMA");
function context({fetch,mode="USD"}={}) {
  const cache={};
  const states={dataBroker:{comparison:{results:{}}},chartCache:{}};
  let stored=0, calls=0, fallback=0, pauses=0;
  const c={
    state:states,
    AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:mode})},
    AgentCryptoGraphNativeUsd406520:{
      usdStorageKey:(coin,period,family)=>`${coin.id}:USD:${family}:${period}`,
      fetchCoinGeckoUsd:async (...args)=>{calls++;return fetch(...args);}
    },
    atlasHistoryQuoteProvenance:result=>({
      quoteCurrency:result.quoteCurrency,
      historySourceFamily:"coingecko",
      historyInstrument:"market_chart?vs_currency=usd"
    }),
    atlasReadLocalChartStore:()=>cache,
    atlasWriteLocalChartStore:()=>{stored++;},
    atlasNormalizeChartPayload:({prices})=>prices,
    atlasValidateChartSeries:({prices})=>({ok:prices.length>=2,metrics:{lastTimestamp:prices.at(-1)[0]}}),
    atlasRespectComparisonRequestSpacing:async()=>{},
    atlasScannerSeriesCoversWindow:()=>({ok:true}),
    atlasComparisonAbortError:()=>false,
    atlasWaitWithSignal:async()=>{pauses++},
    fetchCoinGeckoChartDirect:async()=>{fallback++;throw Error("EUR collector must never run")},
    atlasFetchBridgeHistory:async()=>{fallback++;throw Error("EUR Bridge must never run")},
    fetchBinanceChartDirectDynamic:async()=>{fallback++;throw Error("EUR Binance must never run")},
    Date,Set,Map,Number,String,Array,Error
  };
  c.globalThis=c;
  vm.runInNewContext(helpers + "\n" + direct, c);
  return {c,cache,states,counts:()=>({stored,calls,fallback,pauses})};
}
const coin={id:"bedrock-token",symbol:"BR"};
const tx={period:1,windowEnd:Date.now(),controller:{signal:{aborted:false}}};
const series=[[Date.now()-24*3600000,0.47],[Date.now(),0.49]];
test("24h USD scanner reads Solo's verified cache without calling EUR family",()=>{
  const {c,cache}=context({fetch:async()=>{throw Error("unused")}});
  const key="bedrock-token:USD:coingecko:1";
  cache[key]={series,currency:"USD",quoteCurrency:"USD",savedAt:Date.now()};
  assert.equal(c.atlasScannerNativeUsdRequested(tx),true);
  assert.equal(c.atlasScannerNativeUsdStored(coin,1).quoteCurrency,"USD");
  assert.equal(c.atlasScannerStoredHistory(coin,1,tx).series.length,2);
  assert.equal(c.atlasScannerNativeUsdRequested({period:7}),true);
  assert.equal(c.atlasScannerNativeUsdRequested({period:3}),false);
  cache[key]={series,currency:"EUR",quoteCurrency:"EUR",savedAt:Date.now()};
  assert.equal(c.atlasScannerNativeUsdStored(coin,1),null,"EUR cache cannot masquerade as USD");
});
test("native BR 24h acquisition retries exact CoinGecko USD identity, stores its currency",async()=>{
  let attempt=0;
  const {c,cache,counts}=context({fetch:async(requested,days,options)=>{
    attempt++;
    assert.equal(requested.id,"bedrock-token");
    assert.equal(days,1);
    assert.ok(options.timeoutMs>=20000);
    if(attempt===1)throw Error("HTTP 429");
    return {series,currency:"USD",quoteCurrency:"USD",source:"CoinGecko market_chart USD",sourceMode:"coingecko-direct"};
  }});
  const result=await c.atlasScannerFetchDirect(tx,coin);
  assert.equal(result.provider,"coingecko-usd-native-solo");
  assert.equal(result.result.quoteCurrency,"USD");
  assert.equal(counts().calls,2);
  assert.equal(counts().pauses,1);
  assert.equal(counts().fallback,0);
  assert.equal(cache["bedrock-token:USD:coingecko:1"].currency,"USD");
});
test("failed USD acquisitions never substitute EUR, Binance, or another coin",async()=>{
  const {c,counts}=context({fetch:async()=>{throw Error("HTTP 429")}});
  const result=await c.atlasScannerFetchDirect(tx,coin);
  assert.equal(result.result,null);
  assert.match(result.error.message,/CoinGecko USD tentative 2/);
  assert.equal(counts().calls,2);
  assert.equal(counts().fallback,0);
});
