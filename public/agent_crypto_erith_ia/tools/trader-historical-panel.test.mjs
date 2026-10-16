import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const panel=fs.readFileSync("public/agent_crypto_erith_ia/trader/trader-historical-panel.js","utf8");
const mirror=fs.readFileSync("public/agent_crypto_erith_ia/trader/trader-runtime-mirror.js","utf8");
const r10=fs.readFileSync(".github/workflows/agent-crypto-historical-ohlcv-incremental-r4.yml","utf8");
const r11=fs.readFileSync(".github/workflows/agent-crypto-historical-partitions-r11.yml","utf8");
const flush=async()=>{for(let i=0;i<5;i++)await new Promise(ok=>setImmediate(ok));};
function data(id="bitcoin",period="24h"){
 return {metadata:{id,period,pair:id==="bitcoin"?"BTCUSDT":id==="dogecoin"?"DOGEUSDT":"ETHUSDT",
  source:"Binance Spot",quote:"USDT",status:"VALIDATED_SNAPSHOT",
  isLive:false,graphConnected:false,interval:"5m",
  firstOpenMs:1791430800000,lastOpenMs:1791431100000,
  sourceIndexUpdatedAt:"2026-10-08T04:51:17Z"},
  candles:[[1791430800000,1,2,0.5,1.5,3,5,5],[1791431100000,1.5,2,1,1.8,6,7,5]]};
}
function env({pending=false,withUniverse=false}={}){
 let selected={id:"bitcoin",symbol:"BTC"},pendingResolve;
 const listeners={},counts={reader:0,index:0,blocks:[]};
 function element(tag="div"){
  const events={};return {tag,children:[],id:"",value:"24h",open:false,textContent:"",
   appendChild(x){this.children.push(x);return x;},replaceChildren(){this.children=[];},
   setAttribute(){},remove(){},
   querySelector(q){return this.parts?.[q]||null;},
   addEventListener(k,fn){events[k]=fn;},fire(k){events[k]?.();}};
 }
 const head=element("head"),zone=element("section");
 let mounted=null;
 zone.appendChild=x=>{
  if(x.tag==="details"){
   mounted=x;
   const names=["status","detail","period","meta","rows","reload"];
   x.parts=Object.fromEntries(names.map(name=>["[data-history-"+name+"]",element(name)]));
   x.parts["[data-history-period]"].value="24h";
  }
  zone.children.push(x);return x;
 };
 const catalog={quote:"USDT",snapshot:true,coverage:[]};
 for(const id of ["bitcoin","ethereum","binancecoin","solana","ripple","tron","zcash"]){
  for(const period of ["24h","7d","30d"]){
   catalog.coverage.push({id,period,pair:id==="bitcoin"?"BTCUSDT":"ETHUSDT",candles:2});
  }
 }
 const reader={
  async refreshIndex(){counts.index++;return catalog;},
  readSeries(x){counts.blocks.push(x);return pending?new Promise(ok=>pendingResolve=ok):Promise.resolve(data(x.assetId,x.period));}
 };
 const universeCatalog={quote:"USDT",snapshot:true,archiveFamily:"universe",
  coverage:[{id:"dogecoin",period:"24h",pair:"DOGEUSDT",candles:2}]};
 const universeReader={
  async refreshIndex(){counts.universeIndex=(counts.universeIndex||0)+1;return universeCatalog;},
  async readSeries(x){counts.universeBlocks=(counts.universeBlocks||[]).concat([x]);
   const result=data(x.assetId,x.period);result.metadata.archiveFamily="universe";return result;}
 };
 const document={readyState:"complete",
  baseURI:"https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/index.html",
  head,createElement:element,getElementById(id){
   if(id==="market-zone")return zone;
   if(id==="traderVerifiedHistory")return mounted;
   return null;
  }};
 const context={Date,URL,document,getSelectedCoin:()=>selected,addEventListener(k,fn){listeners[k]=fn;}};
 head.appendChild=x=>{
  head.children.push(x);
  if(x.tag==="script"){
    counts.reader++;
    if(x.src?.includes("historical-universe-reader")) {
      if(withUniverse)context.SevenHistoricalUniverseReader=universeReader;
    }else context.SevenCompactArchiveReader=reader;
    x.onload?.();
  }
  return x;
 };
 vm.runInNewContext(panel,vm.createContext(context),{timeout:3000});
 return {counts,p:()=>mounted,
  open(){mounted.open=true;mounted.fire("toggle");},
  close(){mounted.open=false;mounted.fire("toggle");},
  select(id,symbol){selected={id,symbol};listeners["agent-crypto:selected-market-changed"]?.();},
  period(value){mounted.parts["[data-history-period]"].value=value;mounted.parts["[data-history-period]"].fire("change");},
  resolve(v){pendingResolve(v);}
 };
}
test("Shared Administrator runtime is retained and no duplicate market owner is introduced",()=>{
 assert.match(mirror,/traderHistoricalPanelScript/);
 assert.match(panel,/SevenCompactArchiveReader/);
 assert.doesNotMatch(panel,/AgentCryptoMarketMicroscope\s*=|AgentCryptoMarketInstrumentResolver\s*=/);
});
test("Closed history viewer makes no archive requests; opening reads one series",async()=>{
 const f=env();assert.equal(f.counts.reader,0);assert.equal(f.counts.index,0);
 f.open();await flush();
 assert.equal(f.counts.reader,1);assert.equal(f.counts.index,1);
 assert.equal(f.counts.blocks.length,1);
 assert.equal(f.p().parts["[data-history-rows]"].children.length,2);
 assert.match(f.p().parts["[data-history-meta]"].textContent,/USDT.*SHA-256/);
});
test("OKB is explicitly unavailable, without Bitcoin fallback",async()=>{
 const f=env();f.select("okb","OKB");f.open();await flush();
 assert.equal(f.counts.blocks.length,0);
 assert.match(f.p().parts["[data-history-status]"].textContent,/archive non disponible/);
 assert.match(f.p().parts["[data-history-detail]"].textContent,/Jamais de substitution BTC/);
});
test("Period reload requests one new series, without new index; closed is inert",async()=>{
 const f=env();f.open();await flush();f.period("7d");await flush();
 assert.equal(f.counts.index,1);assert.equal(f.counts.blocks.length,2);
 assert.equal(f.counts.blocks[1].period,"7d");
 f.close();f.period("30d");await flush();assert.equal(f.counts.blocks.length,2);
});
test("A delayed BTC response is ignored after switching to OKB",async()=>{
 const f=env({pending:true});f.open();await flush();
 assert.equal(f.counts.blocks.length,1);
 f.select("okb","OKB");await flush();
 f.resolve(data());await flush();
 assert.equal(f.p().parts["[data-history-rows]"].children.length,0);
 assert.match(f.p().parts["[data-history-status]"].textContent,/archive non disponible/);
});
test("R10 fallback and R11 workflow_run chain exist, crons remain",()=>{
 assert.match(r10,/workflows: \["Atlas Public Crypto Market"\]/);
 assert.match(r10,/cron: '17 \* \* \* \*'/);
 assert.match(r10,/52\*60/);
 assert.match(r11,/workflows: \["Agent Crypto Historical OHLCV R10 Synchronized Hourly Pilot"\]/);
 assert.match(r11,/cron: '52 \* \* \* \*'/);
});

test("Trader reads DOGE from verified Universe when absent from original R9",async()=>{
 const f=env({withUniverse:true});
 f.select("dogecoin","DOGE");
 f.open();await flush();
 assert.equal(f.counts.blocks.length,0);
 assert.equal(f.counts.universeBlocks.length,1);
 assert.equal(f.counts.universeBlocks[0].assetId,"dogecoin");
 assert.equal(f.p().parts["[data-history-rows]"].children.length,2);
 assert.match(f.p().parts["[data-history-status]"].textContent,/UNIVERS · ARCHIVE VÉRIFIÉE/);
 assert.match(f.p().parts["[data-history-meta]"].textContent,/DOGEUSDT.*SHA-256/);
});

function observedFixture({foreign=false,missingFx=false,rawCandles=false}={}){
 const series=Array.from({length:300},(_,i)=>[1791940000000+i*300000,0.35+i/100000]);
 const ctx={active:true,id:"concrete",base:"CT",quote:"USDT",provider:"okx",instrument:"CT-USDT"};
 const chart={status:"ready",coinId:foreign?"quack-ai":"concrete",period:1,
  result:{blocked:false,provider:"okx",sourceMode:"new-listing-exchange-native",
   currency:"USD",quoteCurrency:"USD",source:missingFx?"OKX CT/USDT candles":"OKX CT/USDT candles · USDT/USD CoinGecko",
   series,generatedAt:"2026-10-14T01:10:00Z"}};
 const microscope=rawCandles?{external:true,loadedInstrument:"CT-USDT",source:"OKX public candles",loadedBar:"5m",
  rows:Array.from({length:300},(_,i)=>({t:1791940000000+i*300000,o:.35,h:.38,l:.34,c:.36,v:100}))}:null;
 const box={document:{readyState:"loading",addEventListener(){}},state:{dataBroker:{chart}},
  AgentCryptoNewListingLiveAsset:{snapshot:()=>ctx},
  AgentCryptoMarketMicroscope:{snapshot:()=>microscope}};
 vm.runInNewContext(panel,vm.createContext(box),{timeout:3000});
 return box.AgentCryptoTraderHistoricalPanel.inspectChart("USD");
}
test("CT external graph numbers remain accessible while Market selection is Q",()=>{
 const x=observedFixture();assert.ok(x);
 assert.equal(x.id,"concrete");assert.equal(x.symbol,"CT");assert.equal(x.currency,"USD");
 assert.equal(x.quote,"USDT");assert.equal(x.count,300);assert.equal(x.rows.length,12);
 assert.match(x.source,/USDT\/USD CoinGecko/);
});
test("External data must not be relabelled as native USD without explicit FX proof",()=>{
 assert.equal(observedFixture({foreign:true}),null);
 assert.equal(observedFixture({missingFx:true}),null);
 const native=observedFixture({foreign:true,rawCandles:true});
 assert.ok(native);assert.equal(native.id,"concrete");assert.equal(native.count,300);
 assert.equal(native.currency,"USDT");assert.equal(native.rows.length,12);
});
test("The view uses no second account owner, fetch or archive mutation",()=>{
 assert.match(panel,/GRAPHIQUE EXTERNE CONSULTÉ/);
 assert.match(panel,/sélection Market/);
 assert.doesNotMatch(panel,/AgentCryptoNewListingLiveAsset\s*=|AgentCryptoMarketMicroscope\s*=/);
});

test("External CT is a valid inspected selection when main Market is empty",()=>{
 const ctx={document:{readyState:"loading",addEventListener(){},getElementById:()=>null},
   getSelectedCoin:()=>null,state:{dataBroker:{chart:{status:"ready",coinId:"concrete",period:1,
    result:{sourceMode:"new-listing-exchange-native",provider:"okx",currency:"USD",quoteCurrency:"USD",
     source:"OKX CT/USDT candles · USDT/USD CoinGecko",series:[[1791940000000,.35],[1791940300000,.36]]}}}},
   AgentCryptoNewListingLiveAsset:{snapshot:()=>({active:true,id:"concrete",base:"CT",quote:"USDT",instrument:"CT-USDT",provider:"okx"})},
   AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:"USD"})}};
 vm.runInNewContext(panel,vm.createContext(ctx),{timeout:3000});
 assert.equal(ctx.AgentCryptoTraderHistoricalPanel.selected().id,"concrete");
 assert.equal(ctx.AgentCryptoTraderHistoricalPanel.selected().origin,"external");
});
test("Manual Q consultation remains independent from external CT and the Lab",()=>{
 let selection="quack-ai";
 const ctx={document:{readyState:"loading",addEventListener(){},
   getElementById:()=>({querySelector:q=>q==="[data-history-asset]"?{value:selection}:null})},
   getSelectedCoin:()=>null,
   AgentCryptoNewListingLiveAsset:{snapshot:()=>({active:true,id:"concrete",base:"CT",quote:"USDT",instrument:"CT-USDT",provider:"okx"})},
   AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:"USD"})}};
 vm.runInNewContext(panel,vm.createContext(ctx),{timeout:3000});
 assert.equal(ctx.AgentCryptoTraderHistoricalPanel.selected().id,"quack-ai");
 assert.equal(ctx.AgentCryptoTraderHistoricalPanel.selected().origin,"manual");
 selection="auto";
 assert.equal(ctx.AgentCryptoTraderHistoricalPanel.selected(),null);
 assert.match(panel,/historical-inventory\.html/);
 assert.match(panel,/source-catalogue\.html/);
 assert.match(panel,/verified-reader\.html/);
});
