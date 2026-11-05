"use strict";
// Updated runtime 40.6.719 contract: exactly one native USD acquisition per
// scanner transaction attempt. The archived MASTER test expected two internal
// retries, now prohibited by the canonical acquisition budget.
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const app=fs.readFileSync(path.join(__dirname,"../administrator/app.js"),"utf8");
function extracted(from,to){
 const i=app.indexOf(from),j=app.indexOf(to,i+from.length);
 assert.ok(i>=0&&j>i,"Missing scanner runtime boundary: "+from);
 return app.slice(i,j);
}
const helpers=extracted("function atlasScannerNativeUsdRequested(","\nasync function atlasScannerYieldToUi(");
const direct=extracted("async function atlasScannerFetchDirect(","\nconst ATLAS_SCANNER_COLLECTOR_SCHEMA");
const now=Date.now();
const coin={id:"bedrock-token",symbol:"BR"};
const series=[[now-24*3600000,0.47],[now-23*3600000,0.48],[now-3*60000,0.49]];
const tx={period:1,windowEnd:now,controller:{signal:{aborted:false}}};
function scenario({fetch=async()=>{throw Error("unused")},mode="USD"}={}){
 let calls=0,fallback=0,stored=0;
 const cache={};
 const c={
  state:{dataBroker:{comparison:{results:{}}},chartCache:{}},
  AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:mode})},
  AgentCryptoGraphNativeUsd:{
   usdStorageKey:(coin,period,family)=>coin.id+":"+period+":"+family+":USD",
   fetchCoinGeckoUsd:async(...args)=>{calls++;return fetch(...args)}
  },
  atlasHistoryQuoteProvenance:result=>({
   quoteCurrency:result?.quoteCurrency,
   historySourceFamily:"coingecko",
   historyInstrument:"market_chart?vs_currency=usd"
  }),
  atlasGetStoredChartResult:(_coin,_period,_provider,quote)=>quote==="USD"?cache.valid:null,
  atlasReadLocalChartStore:()=>cache,
  atlasNormalizeChartPayload:raw=>raw.prices,
  atlasValidateChartSeries:({prices})=>({ok:prices.length>=2,metrics:{lastTimestamp:prices.at(-1)[0]}}),
  atlasStoreChartResult:(_coin,_period,result)=>{stored++;cache.valid=result;},
  atlasRespectComparisonRequestSpacing:async()=>{},
  atlasComparisonAbortError:()=>false,
  atlasWaitWithSignal:async()=>{},
  atlasSanitizeChartRows:rows=>rows,
  atlasChartRules:()=>({minPoints:2}),
  fetchCoinGeckoChartDirect:async()=>{fallback++;throw Error("EUR collector forbidden")},
  atlasFetchBridgeHistory:async()=>{fallback++;throw Error("EUR Bridge forbidden")},
  fetchBinanceChartDirectDynamic:async()=>{fallback++;throw Error("EUR Binance forbidden")},
  Date,Set,Map,Number,String,Array,Error,Object,AbortController
 };
 c.globalThis=c;
 vm.runInNewContext(helpers+"\n"+direct,c);
 // Coverage has an independent full-window contract in test_scanner_full_window.
 c.atlasScannerSeriesCoversWindow=()=>({ok:true});
 return{c,cache,stats:()=>({calls,fallback,stored})};
}
test("native USD scanner reuses Solo's quote-qualified cache, never EUR",()=>{
 const {c,cache}=scenario();
 const valid={series,currency:"USD",quoteCurrency:"USD",savedAt:now};
 cache.valid=valid;
 assert.equal(c.atlasScannerNativeUsdRequested(tx),true);
 assert.equal(c.atlasScannerNativeUsdStored(coin,1).quoteCurrency,"USD");
 assert.equal(c.atlasScannerStoredHistory(coin,1,tx).series.length,3);
 assert.equal(c.atlasScannerNativeUsdRequested({period:7}),true);
 assert.equal(c.atlasScannerNativeUsdRequested({period:3}),false);
 cache.valid={...valid,currency:"EUR",quoteCurrency:"EUR"};
 assert.equal(c.atlasScannerNativeUsdStored(coin,1),null);
});
test("one canonical CoinGecko native USD request per scanner attempt",async()=>{
 const {c,stats}=scenario({fetch:async(requested,period,opt)=>{
  assert.equal(requested.id,"bedrock-token");
  assert.equal(period,1);
  assert.ok(opt.timeoutMs>=20000);
  return {series,currency:"USD",quoteCurrency:"USD",source:"CoinGecko market_chart USD",sourceMode:"coingecko-direct"};
 }});
 const value=await c.atlasScannerFetchDirect(tx,coin);
 assert.equal(value.provider,"coingecko-usd-native-solo");
 assert.equal(value.result.quoteCurrency,"USD");
 assert.deepEqual(stats(),{calls:1,fallback:0,stored:1});
});
test("missing USD source never substitutes EUR, Binance, or another coin",async()=>{
 const {c,stats}=scenario({fetch:async()=>{throw Error("HTTP 429")}});
 const value=await c.atlasScannerFetchDirect(tx,coin);
 assert.equal(value.result,null);
 assert.match(value.error.message,/CoinGecko USD/);
 assert.deepEqual(stats(),{calls:1,fallback:0,stored:0});
});
