"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const app = fs.readFileSync(path.resolve(__dirname, "../administrator/app.js"), "utf8");
const names = ["atlasChartDisplayCurrency","atlasChartStorageKey","atlasChartKey",
  "atlasHistoryQuoteProvenance","atlasHistoricalDisplayQuote","atlasChartQuoteBasis",
  "atlasStoreChartResult","atlasGetStoredChartResult","atlasChartAxisPriceLabel"];
function extract(name) {
  const p=app.indexOf("function "+name+"(");
  assert.ok(p>=0, "missing "+name);
  const brace=app.indexOf("{",p),end=/^}\s*$/m.exec(app.slice(brace));
  assert.ok(end,"unclosed "+name);
  return app.slice(p,brace+end.index+1);
}
function sandbox(){
 let display="EUR", local={};
 const state={chartCache:{},chartPeriodDays:1};
 const context={
   state, Date, Intl,
   atlasChartPreferredSourceFamily:()=>"coingecko",
   atlasChartResultSourceFamily:r=>r?.sourceFamily||"coingecko",
   atlasReadLocalChartStore:()=>local,
   atlasWriteLocalChartStore:x=>{local=x},
   atlasNormalizeChartPayload:({prices})=>prices,
   atlasValidateChartSeries:({prices})=>({ok:Array.isArray(prices)&&prices.length>0,metrics:{}}),
   globalThis:{AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:display})}}
 };
 vm.runInNewContext(names.map(extract).join("\n"),context,{timeout:3000});
 return {context,state,getLocal:()=>local,setLocal:x=>{local=x},setDisplay:x=>{display=x}};
}
const coin={id:"bitcoin",symbol:"BTC"};
const eur={source:"CoinGecko market_chart EUR",sourceFamily:"coingecko",series:[[1,70000],[2,71000]]};
const usd={source:"CoinGecko market_chart USD",sourceFamily:"coingecko",series:[[1,78000],[2,79000]]};
test("Only native historical evidence qualifies an EUR/USD comparison",()=>{
 const h=sandbox(),a=h.context;
 assert.equal(a.atlasHistoricalDisplayQuote(eur).currency,"EUR");
 assert.equal(a.atlasHistoricalDisplayQuote(usd).currency,"USD");
 assert.equal(a.atlasChartQuoteBasis({...eur,currency:"USD"}),null);
 h.setDisplay("USD");
 assert.equal(a.atlasChartQuoteBasis({source:"legacy cache"}),null);
 assert.equal(a.atlasHistoricalDisplayQuote({source:"legacy",currency:"USD"}).currency,null);
});
test("Binance EUR direct and derived are identified without inventing USD",()=>{
 const a=sandbox().context;
 const direct=a.atlasHistoryQuoteProvenance({source:"Binance Spot BTC/EUR · chandelles",sourceFamily:"binance"});
 assert.equal(direct.quoteCurrency,"EUR");
 assert.equal(direct.historySourceFamily,"binance");
 const derived=a.atlasHistoryQuoteProvenance({source:"Binance Spot BTC/USDT ÷ EUR/USDT · chandelles",sourceFamily:"binance",sourceMode:"binance-derived-klines"});
 assert.equal(derived.quoteCurrency,"EUR");
 assert.equal(derived.historySourceFamily,"binance");
});
test("Cache scoped by quote; legacy survives but cannot cross currencies",()=>{
 const h=sandbox(),a=h.context;
 a.atlasStoreChartResult(coin,1,eur);
 a.atlasStoreChartResult(coin,1,usd);
 assert.equal(Object.keys(h.getLocal()).length,2);
 assert.equal(a.atlasGetStoredChartResult(coin,1)?.originalSource,eur.source);
 h.setDisplay("USD");
 assert.equal(a.atlasGetStoredChartResult(coin,1)?.originalSource,usd.source);
 h.setLocal({"bitcoin:1:coingecko":eur});
 h.state.chartCache={};
 assert.equal(a.atlasGetStoredChartResult(coin,1),null);
 h.setDisplay("EUR");
 assert.equal(a.atlasGetStoredChartResult(coin,1)?.originalSource,eur.source);
 assert.ok(h.getLocal()["bitcoin:1:coingecko"]);
});
test("Canvas axis quote comes from result, unknown is visibly uncertain",()=>{
 const a=sandbox().context;
 assert.match(a.atlasChartAxisPriceLabel(1000,"price",null),/\?/);
 assert.match(a.atlasChartAxisPriceLabel(1000,"price","EUR"),/€/);
 assert.notEqual(a.atlasChartAxisPriceLabel(1000,"price","USD"),a.atlasChartAxisPriceLabel(1000,"price","EUR"));
 assert.match(app,/chart\.\$atlasQuoteCurrency = options\.quoteCurrency \|\| null/);
 assert.match(app,/atlasChartAxisPriceLabel\(tick\.value, view, chart\.\$atlasQuoteCurrency\)/);
 assert.match(app,/visibleCurrency = atlasHistoricalDisplayQuote\(result\)\.currency \|\| "UNKNOWN"/);
});

function extractAsync(name) {
 const prefix="async function "+name+"(";
 const p=app.indexOf(prefix);
 assert.ok(p>=0,"missing async "+name);
 const brace=app.indexOf("{",p),end=/^}\s*$/m.exec(app.slice(brace));
 assert.ok(end,"unclosed async "+name);
 return app.slice(p,brace+end.index+1);
}
test("USD requests use the native CoinGecko collector even when Binance is preferred",async()=>{
 const calls=[];
 const context={
   atlasChartDisplayCurrency:()=>"USD",
   globalThis:{AgentCryptoGraphNativeUsd:{fetchCoinGeckoUsd:async(c,period)=>{
     calls.push(c.id+":"+period);return {...usd,quoteCurrency:"USD",currency:"USD"};
   }}},
   fetchBinanceChartDirect:async()=>{throw Error("EUR Binance must not run")},
   fetchCoinGeckoChartDirect:async()=>{throw Error("EUR CoinGecko must not run")}
 };
 vm.runInNewContext(extractAsync("atlasFetchChartDirectForFamily"),context);
 const result=await context.atlasFetchChartDirectForFamily(coin,1,"binance");
 assert.equal(result.quoteCurrency,"USD");
 assert.deepEqual(calls,["bitcoin:1"]);
 context.globalThis.AgentCryptoGraphNativeUsd=null;
 await assert.rejects(()=>context.atlasFetchChartDirectForFamily(coin,1,"binance"),/USD natif indisponible/);
});
test("CoinGecko direct route never silently requests EUR when display is USD",async()=>{
 let calls=0;
 const context={
   atlasChartDisplayCurrency:()=>"USD",
   globalThis:{AgentCryptoGraphNativeUsd:{fetchCoinGeckoUsd:async()=>{
     calls++;return {...usd,currency:"USD",quoteCurrency:"USD"};
   }}}
 };
 vm.runInNewContext(extractAsync("fetchCoinGeckoChartDirect"),context);
 const result=await context.fetchCoinGeckoChartDirect(coin,1);
 assert.equal(calls,1);
 assert.equal(result.currency,"USD");
});
test("Solo rejects a caller-supplied EUR cache when USD is selected",async()=>{
 const context={
   atlasChartDisplayCurrency:()=>"USD",
   atlasChartPreferredSourceFamily:()=>"binance",
   atlasGetStoredChartResult:()=>null,
   atlasHistoricalDisplayQuote:r=>({currency:r?.source?.includes(" EUR")?"EUR":null}),
   atlasFetchChartDirectForFamily:async()=>{throw Error("native USD offline")},
   atlasExactTimestampLabel:()=>"legacy"
 };
 vm.runInNewContext(extractAsync("fetchChartSeries"),context);
 const result=await context.fetchChartSeries(coin,1,{fallback:eur});
 assert.equal(result.blocked,true);
 assert.equal(result.series.length,0);
});
test("USD comparison does not use an EUR Bridge or Binance series",async()=>{
 let fetches=0,stores=0;
 const context={
   atlasChartDisplayCurrency:()=>"USD",
   atlasGetStoredChartResult:()=>eur,
   atlasHistoricalDisplayQuote:r=>({currency:r?.source?.includes(" USD")?"USD":r?.source?.includes(" EUR")?"EUR":null}),
   atlasChartNeedsRefresh:()=>false,
   atlasRespectComparisonRequestSpacing:async()=>{},
   atlasFetchChartDirectForFamily:async()=>{fetches++;return {...usd,currency:"USD",quoteCurrency:"USD"};},
   atlasStoreChartResult:()=>{stores++},
   atlasComparisonAbortError:()=>false,
   ATLAS_COMPARISON_DIRECT_TIMEOUT_MS:12000
 };
 vm.runInNewContext(extractAsync("atlasFetchComparisonSeriesResilient"),context);
 const result=await context.atlasFetchComparisonSeriesResilient(coin,1);
 assert.equal(result.result.quoteCurrency,"USD");
 assert.equal(result.source,"coingecko-usd-native-direct");
 assert.equal(fetches,1);
 assert.equal(stores,1);
 context.atlasFetchChartDirectForFamily=async()=>{throw Error("network offline")};
 const blocked=await context.atlasFetchComparisonSeriesResilient(coin,1);
 assert.equal(blocked.result.blocked,true);
 assert.equal(blocked.result.series.length,0);
});

test("Solo graphical board uses the certified historical quote in every field",()=>{
  let captured=null;
  const context={
    state:{chartPeriodDays:1}, Date, Intl,
    getSelectedCoin:()=>coin,
    atlasHistoricalDisplayQuote:r=>({currency:r?.currency||null}),
    atlasChartPeriodLabel:()=>"24h",
    atlasChartV2EffectiveView:()=>"price",
    atlasChartV2EffectiveScale:()=>"normal",
    atlasChartOverlayTruth:()=>({label:"HISTORIQUE DIRECT COINGECKO"}),
    atlasFormatNativeChartQuote:(value,quote)=>quote==="USD" ? value+" $US" : value+" €",
    fmtPct:x=>(Number(x)>0?"+":"")+x+" %",
    atlasExactTimestampLabel:()=>"04/11/2026 14:05",
    atlasChartProviderLabel:()=>"CoinGecko",
    atlasChartOverlayTitleHtml:(head,mode,truth)=>head+" / "+mode+" / "+truth,
    atlasChartOverlayCoinColor:()=>"#ff9b15",
    escapeHtml:s=>String(s),
    atlasChartOverlaySet:(title,series,detail)=>{captured={title,series,detail}}
  };
  vm.runInNewContext(extract("atlasChartOverlaySolo"),context);
  const base={
    coin,source:"CoinGecko market_chart USD",currency:"USD",
    integrity:{metrics:{firstPrice:77000,lastPrice:78340.69,minPrice:76000,maxPrice:79000,
      changePct:1.44,pointCount:289,lastTimestamp:1793797520000}}
  };
  context.atlasChartOverlaySolo({result:base},1);
  assert.match(captured.title,/PRIX USD/);
  assert.match(captured.series,/78340.69 \$US/);
  assert.match(captured.detail,/77000 \$US/);
  assert.doesNotMatch(captured.series+captured.detail,/€/);
  context.atlasChartOverlaySolo({result:{...base,currency:"EUR"}},1);
  assert.match(captured.title,/PRIX EUR/);
  assert.match(captured.series,/78340.69 €/);
  assert.doesNotMatch(captured.series,/\$US/);
  context.atlasChartOverlaySolo({result:{...base,currency:null}},1);
  assert.match(captured.title,/DEVISE NON QUALIFIÉE/);
  assert.doesNotMatch(captured.series,/78340.69/);
});

test("Historical price board shows USD/EUR only when the dataset proves that quote",()=>{
  const node={dataset:{},innerHTML:"",hidden:true,setAttribute:()=>{}};
  const ctx={
    state:{chartPeriodDays:1}, Date,
    atlasChartTooltipNode:()=>node,
    atlasHideChartTooltip:()=>{},
    atlasComparisonTooltipRows:()=>[],
    atlasChartPriceDatasets:()=>[],
    atlasCryptoPalette:()=>({primary:"#ff9900"}),
    atlasCryptoGradientCss:()=>"#ff9900",
    atlasFormatNativeChartQuote:(value,quote)=>value+(quote==="USD"?" $US":quote==="EUR"?" €":" USDC"),
    atlasChartTooltipCoinMarkup:c=>c.symbol,
    atlasChartTooltipChangeMarkup:()=>"",
    atlasChartPeriodLabel:()=>"24h",
    atlasComparisonCurrencyTransition:()=>null,
    atlasPositionChartTooltip:()=>{},
    requestAnimationFrame:f=>f(),
    escapeHtml:s=>String(s)
  };
  vm.runInNewContext(extract("atlasExternalChartTooltip"),ctx);
  function display(quote){
    const series={atlasCoin:coin,atlasHistoricalQuote:{currency:quote,source:"CoinGecko market_chart "+quote},
      atlasPrimaryColor:"#ff9900",data:[{x:1,y:1},{x:2,y:2}]};
    const point={dataset:series,dataIndex:0,parsed:{x:1},raw:{rawPrice:78340.69,y:101,x:1}};
    ctx.atlasExternalChartTooltip({chart:{$atlasMode:"single",$atlasCoin:coin,$atlasPeriod:1},tooltip:{opacity:1,dataPoints:[point]}});
    return node.innerHTML;
  }
  assert.match(display("USD"),/PRIX HISTORIQUES USD/);
  assert.match(node.innerHTML,/78340.69 \$US/);
  assert.doesNotMatch(node.innerHTML,/€/);
  assert.equal(node.dataset.displayCurrency,"USD");
  assert.match(display("EUR"),/PRIX HISTORIQUES EUR/);
  assert.match(node.innerHTML,/78340.69 €/);
  assert.doesNotMatch(node.innerHTML,/\$US/);
  assert.match(display(null),/DEVISE NON QUALIFIÉE/);
  assert.doesNotMatch(node.innerHTML,/78340.69/);
});

test("Comparison and tooltip series carry source quote metadata, not a fixed EUR label",()=>{
  const comparison=extract("drawComparisonChart");
  const overlay=extract("atlasChartOverlayComparison");
  const tooltipRows=extract("atlasComparisonTooltipRows");
  assert.match(comparison,/atlasHistoricalQuote: atlasHistoricalDisplayQuote\(entry\.result\)/);
  assert.match(comparison,/comparisonCurrencyLabel/);
  assert.doesNotMatch(comparison,/comparisonProvider === "CoinGecko" \? "CoinGecko EUR"/);
  assert.match(overlay,/atlasHistoricalDisplayQuote\(entry\?\.result\)\.currency/);
  assert.doesNotMatch(overlay,/providerLabel\} EUR/);
  assert.match(tooltipRows,/quoteCurrency: dataset\.atlasHistoricalQuote\?\.currency \|\| null/);
  assert.doesNotMatch(extract("atlasExternalChartTooltip"),/atlasFormatEUR\(historicalPrice\)/);
});
