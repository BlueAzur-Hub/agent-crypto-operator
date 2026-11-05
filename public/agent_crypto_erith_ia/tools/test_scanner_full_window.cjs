'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../administrator/app.js'),'utf8');
function owner(name){
 const needle='function '+name+'(';const start=app.indexOf(needle);
 assert(start>0,`Missing runtime owner: ${name}`);
 const end=app.indexOf('\nfunction ',start+needle.length);
 assert(end>start,`Missing function boundary: ${name}`);
 return app.slice(start,end);
}
const ms=60000, hour=60*ms;
const now=Date.now();
const windowEnd=now;const windowStart=now-24*hour;
function series(start,end,step=5*ms){
 const out=[];for(let t=start;t<=end;t+=step)out.push([t,100+t/1e12]);return out;
}
const ctx={Date,Number,Math,Array,console,
 atlasSanitizeChartRows:rows=>[...rows].sort((a,b)=>a[0]-b[0]),
 atlasChartRules:()=>({minPoints:20,refreshMs:5*ms}),
 atlasScannerHistoryKind:()=> 'cache',
 atlasScannerMarketMetric:()=>0,
 atlasScannerMarketMetricLabel:()=> 'Market 24 h'};
vm.createContext(ctx);
for(const name of ['atlasChartNeedsRefresh','atlasScannerSeriesCoversWindow','atlasScannerDecorateEntry']){
 vm.runInContext(owner(name),ctx);
}
const tx={period:1,windowEnd};
test('17h series fails actual window coverage despite recent cache write',()=>{
 const data={series:series(now-17*hour,now),savedAt:now,integrity:{metrics:{freshness:{level:'fresh'}}}};
 assert.equal(ctx.atlasScannerSeriesCoversWindow(data,tx).ok,false);
 assert.equal(ctx.atlasChartNeedsRefresh(data,1),true);
});
test('One 24h raw source passes, but neither a late start nor an early end does',()=>{
 assert.equal(ctx.atlasScannerSeriesCoversWindow({series:series(windowStart,now)},tx).ok,true);
 assert.equal(ctx.atlasScannerSeriesCoversWindow({series:series(windowStart+20*ms,now)},tx).ok,false);
 assert.equal(ctx.atlasScannerSeriesCoversWindow({series:series(windowStart,now-20*ms)},tx).ok,false);
});
test('Scanner retains full archive but trims only displayed in-memory historical view',()=>{
 const full=series(now-7*24*hour,now,5*ms);
 const result={series:full,source:'history'};
 const entry=ctx.atlasScannerDecorateEntry(tx,{id:'cap',symbol:'CAP'},result,'cache');
 assert.equal(result.series.length,full.length);
 assert(entry.result.series.length<full.length);
 assert(entry.result.series[0][0]>=windowStart-12*ms);
 assert(entry.result.series.at(-1)[0]<=now+12*ms);
 assert.equal(entry.coin.id,'cap');
});
test('Every full-window scanner acquisition is checked before being cached',()=>{
 const start=app.indexOf('async function atlasScannerFetchDirect(');
 const end=app.indexOf('\nconst ATLAS_SCANNER_COLLECTOR_SCHEMA',start);
 assert(start>0&&end>start);
 const route=app.slice(start,end);
 const checks=(route.match(/atlasScannerSeriesCoversWindow\(result,\s*tx\)/g)||[]).length;
 assert.equal(checks,7,'USD, CoinGecko EUR direct and hourly fallback, Bridge and Binance each verify coverage');
 assert(route.indexOf('fetchCoinGeckoChartDirect(')<route.indexOf('atlasFetchBridgeHistory('));
});
