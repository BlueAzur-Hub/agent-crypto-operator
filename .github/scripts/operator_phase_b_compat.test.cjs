'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'../../public/agent_crypto_erith_ia');
const get=p=>fs.readFileSync(path.join(base,p),'utf8');
const app=get('administrator/app.js');
const graph=get('administrator/js/graph-native-usd.js');
const interfaceHtml=get('administrator/index.html');
const desk=get('trader/trading-desk.html');
function namedFunction(source,name){const match=source.match(new RegExp('^(?:async )?function '+name+'\\([^]*?^\\}\\n','m'));assert.ok(match,`Missing ${name}`);return match[0];}
test('Market canonical 50/100/250/500/1000 and Yoann Trader entry unchanged',()=>{
  for(const n of [50,100,250,500,1000])assert.match(interfaceHtml,new RegExp('data-market-limit="'+n+'"'));
  assert.match(desk,/surface=trader&amp;view=intermediate&amp;profile=yohan/);
  assert.match(desk,/trader-runtime-mirror\.js/);
});
test('Scanner requires exactly five compatible histories before commit',()=>{
  const commit=namedFunction(app,'atlasScannerCommit');
  const run=namedFunction(app,'atlasScannerRun');
  assert.match(commit,/finalEntries\.length !== ATLAS_SCANNER_TARGET/);
  assert.match(commit,/prevalidated\.length !== ATLAS_SCANNER_TARGET/);
  assert.match(run,/finalEntries\.length === ATLAS_SCANNER_TARGET/);
  assert.match(run,/pas de panier partiel/);
  assert.match(namedFunction(app,'atlasValidateChartSeries'),/historique 24 h discontinu/);
});
test('CoinGecko comparison request slots reserved before async wait',async()=>{
  const state={dataBroker:{comparison:{lastDirectRequestAt:0}}};const wait=[];
  const f=new Function('state','ATLAS_COMPARISON_LONG_HORIZON_SPACING_MS','ATLAS_COMPARISON_REQUEST_SPACING_MS','atlasWaitWithSignal','Date',namedFunction(app,'atlasRespectComparisonRequestSpacing')+'return atlasRespectComparisonRequestSpacing;')(state,3000,1000,ms=>{wait.push(ms);return Promise.resolve()}, {now:()=>1000000});
  await Promise.all([f(null,1),f(null,1)]);
  assert.equal(state.dataBroker.comparison.lastDirectRequestAt,1001000);
  assert.deepEqual(wait,[1000]);
});
test('Freshness cannot be inferred from cache save time for incomplete 24h history',()=>{
  const f=new Function('atlasChartRules','atlasSanitizeChartRows','Date',namedFunction(app,'atlasChartNeedsRefresh')+'return atlasChartNeedsRefresh;')(()=>({refreshMs:500000}),x=>x,{now:()=>100000000});
  const points=Array.from({length:25},(_,i)=>[100000000-86400000+i*3600000,100+i]);
  const cache={savedAt:100000000,series:points,integrity:{metrics:{freshness:{level:'fresh'}}}};
  assert.equal(f(cache,1),false);
  assert.equal(f({...cache,series:points.slice(5)},1),true);
});
test('USD owner self-test and missing timestamp fail closed',()=>{
  const context=vm.createContext({AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:'USD'})}});
  new vm.Script(graph).runInContext(context);
  const api=context.AgentCryptoGraphNativeUsd;
  assert.equal(api?.self_test?.().pass,true);
  assert.equal(api.self_test().checks.top5_stale_usd_refused,true);
  assert.equal(api.self_test().checks.top5_missing_change_refused,true);
  const unknown=api.usdTooltipSource({dataset:{atlasCoin:{id:'btc',priceUsd:100,change24hUsd:1}}},Date.now());
  assert.notEqual(unknown.source,'coingecko-usd-snapshot','No timestamp cannot be qualified as fresh');
  assert.equal(api.real_order,false);
});
test('Public Spot OHLCV reader does not enable account or orders',()=>{
  const api=require(path.join(base,'administrator/js/okx-public-chart-history.js'));
  assert.equal(api.readonly,true);
  assert.equal(api.orders_enabled,false);
  assert.equal(api.eligible({id:'bitcoin',symbol:'BTC'}),true);
  assert.equal(api.eligible({id:'bitcoin',symbol:'BTC'},{peers:[{id:'other',symbol:'BTC'}]}),false);
  assert.throws(()=>api.validateArchive({},'BTC-USDC'),/identity|currency/i);
});
test('Market listings use canonical owner and documented external prices',()=>{
  const market=get('administrator/js/new-listings-native-category.js');
  const micro=get('administrator/js/okx-microstructure-406499.js');
  const lab=get('administrator/js/learning-lab.js');
  assert.match(app,/AtlasMarketRadarCategory=Object.freeze/);
  assert.match(app,/state.assetFilter === "radar"/);
  assert.match(market,/SEGMENT_OPTIONS/);
  assert.match(market,/PUBLIC_DATA_RAW/);
  assert.match(market,/quoteSnapshotAt/);
  assert.match(micro,/bookFreshnessAt/);
  assert.match(lab,/AXIS/);
  const publicReader=interfaceHtml.indexOf('./js/okx-public-chart-history.js');
  const core=interfaceHtml.indexOf('<script src="./app.js?');
  assert.ok(publicReader>=0&&core>publicReader,'Public archive reader must register before chart core');
});
test('Read-only canonical archives and candle source remain independent of private credentials',()=>{
  const reader=get('administrator/js/verified-periods-reader.js');
  const microscope=get('administrator/js/market-microscope-candles.js');
  assert.match(reader,/raw\.githubusercontent\.com\/BlueAzur-Hub\/erith-ia-memory/);
  assert.match(microscope,/read_only:true/);
  assert.match(microscope,/real_order:false/);
  assert.doesNotMatch(microscope,/apiKey|secretKey|placeOrder\(/);
});

test('Canonical Master historical archives use verified public read-only paths',()=>{
 const files=['top250-history-catalog.js','shared-historical-view.js','shared-hourly-history.js','btc-annual-view.js','historical-archive-adapter.js','historical-compact-reader.js'];
 for(const file of files){
  const src=get('administrator/js/'+file);
  assert.match(src,/raw\.githubusercontent\.com\/BlueAzur-Hub\/erith-ia-memory\/main\/public\/agent_crypto_erith_ia\/data\/historical_archive_prototype\//,file);
  assert.match(src,/credentials:"omit"/,file);
  assert.doesNotMatch(src,/location\.origin|apiKey|secretKey|placeOrder\(/,file);
 }
});
test('Radar uses the canonical Market table with only supplementary read-only research',()=>{
 const native=get('administrator/js/market-radar-native.js');
 const category=get('administrator/js/new-listings-native-category.js');
 assert.match(native,/Canonical #marketRows renders all Radar quote rankings/);
 assert.doesNotMatch(native,/Classement Radar détaillé|function printMarket\(root,model\)|data-radar-native="rows"/);
 assert.match(native,/printOpportunities\(root,model\)/);
 assert.match(native,/printQualification\(root,model\)/);
 assert.match(native,/printOkxHourly\(root,model\)/);
 assert.match(native,/https:\/\/blueazur-hub\.github\.io\/erith-ia-memory\/public\/agent_crypto_erith_ia\/laboratoire\/radar\.html/);
 assert.match(category,/AtlasMarketRadarCategory\?\.set\?\.\(true\)/);
 assert.match(category,/AtlasMarketRadarCategory\?\.set\?\.\(false\)/);
 assert.doesNotMatch(native,/api\/v5\/trade\/order|placeOrder\(|localStorage\.setItem/);
});

test('BTC comparator and yearly explorer read only canonical public archives',()=>{
 const btc=get('administrator/js/historical-btc-comparator.js');
 const yearly=get('administrator/js/historical-yearly-browser.js');
 assert.match(btc,/raw\.githubusercontent\.com\/BlueAzur-Hub\/erith-ia-memory\/main\/public\/agent_crypto_erith_ia\/data\/crypto\/latest\.json/);
 assert.match(btc,/credentials:"omit"/);
 assert.match(yearly,/raw\.githubusercontent\.com\/BlueAzur-Hub\/erith-ia-memory\/main\/public\/agent_crypto_erith_ia\/data\/historical_archive_prototype\/calendar_year_hourly_shards\//);
 assert.doesNotMatch(btc+yearly,/location\.origin|apiKey|secretKey|placeOrder\(/);
});
