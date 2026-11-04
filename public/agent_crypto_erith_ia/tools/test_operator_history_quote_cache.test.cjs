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
