'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const reader=require('./radar.js');
const now=Date.UTC(2026,9,16,8,0,0);
const coins=Array.from({length:250},(_,i)=>({id:'asset-'+i,rank:i+1,
  name:i===0?'Bitcoin':'Asset '+i,symbol:i===0?'BTC':'X'+i,
  priceUsd:i+1,change24h:i/10-4,change7d:i/20,volume24hUsd:1000+i,
  image:i===0?'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png':'',marketCapUsd:5000+i,lastUpdated:'2026-10-16T07:50:00Z'}));
const example={schema:'agent_crypto_public_market_snapshot_v1',source:{provider_id:'coingecko'},
  generated_at:'2026-10-16T07:51:00Z',coins};
const validated=reader.validMarket(example);
assert.equal(validated.rows.length,250);
assert.equal(validated.rows[0].marketCapUsd,5000);
assert.equal(validated.rows[0].image,coins[0].image);
const extendedExample={schema:'agent_crypto_public_extended_market_snapshot_v1',
 source:{provider_id:'coingecko'},generated_at:'2026-10-16T07:35:00Z',
 coins:Array.from({length:750},(_,i)=>({id:'extended-'+i,rank:251+i,symbol:'T'+i,
 name:'Research '+i,priceUsd:1,marketCapUsd:50000000,volume24hUsd:4000000,
 change24h:i===2?15:8,change7d:i===2?-4:12,change30d:2}))};
const watch=reader.selectOpportunities({...example,generated_at:'2026-10-16T07:51:00Z'},extendedExample);
assert.equal(watch.universe,1000);
assert.equal(watch.eligible,750);
assert.equal(watch.trend.length,12);
assert.equal(watch.rebound.length,1);
assert.equal(watch.rebound[0].rank,253);
assert.equal(watch.rebound[0].graphEligible,false);
assert.equal(watch.filters.exchange_spread_orderbook_checked,false);
assert.throws(()=>reader.selectOpportunities(example,{...extendedExample,generated_at:'2026-10-12T07:35:00Z'}),/non contemporains/);
assert.throws(()=>reader.selectOpportunities(example,{...extendedExample,coins:[]}),/incomplet/);
assert.equal(reader.observeMarket({change24h:1,change7d:2}).tone,'up');
assert.equal(reader.observeMarket({change24h:-1,change7d:-2}).tone,'down');
assert.equal(reader.observeMarket({change24h:1,change7d:-2}).tone,'mixed');
assert.equal(reader.observeMarket({change24h:-1,change7d:2}).tone,'mixed');
assert.equal(reader.observeMarket({change24h:null,change7d:2}).tone,'unknown');
assert.match(reader.observeMarket({change24h:0,change7d:0}).detail,/aucune tendance/i);
for(const tier of reader.TIERS){
  const rows=reader.selectMarket(validated.rows,tier);
  assert.equal(rows.length,tier);
  assert.equal(rows.at(-1).rank,tier);
}
assert.equal(reader.selectMarket(validated.rows,20,'Bitcoin').length,1);
assert.equal(reader.selectMarket(validated.rows,10,'BTC')[0].rank,1);
assert.equal(reader.selectMarket(validated.rows,20,'','change24h')[0].rank,20);
assert.equal(reader.selectMarket(validated.rows,20,'','drop24h')[0].rank,1);
assert.throws(()=>reader.selectMarket(validated.rows,500),/invalide/i);
assert.throws(()=>reader.validMarket({...example,source:{provider_id:'unknown'}}),/canonique/i);
const clash=coins.map(v=>({...v}));clash[3].rank=1;
assert.throws(()=>reader.validMarket({...example,coins:clash}),/invalide/i);
const registries={schema:'agent_crypto_new_listings_identity_registry_v1',identities:{
 'magic-hash':{symbol:'MHA',displayName:'MAGNE.AI',coingeckoId:'magic-hash',image:'./assets/crypto/new-listings/magic-hash.png',verified:true},
 bogus:{symbol:'X',coingeckoId:'made-up',verified:false}
}};
const registry=reader.verifyRegistry(registries);
assert.equal(registry.size,1);
const launch=now-2*86400000;
const instruments={code:'00000',data:[
 {symbol:'MHAUSDT',baseCoin:'MHA',quoteCoin:'USDT',launchTime:launch,status:'online',symbolType:'crypto'},
 {symbol:'LITPERP',baseCoin:'LIT',quoteCoin:'USDT',launchTime:launch,status:'online',symbolType:'futures'},
 {symbol:'XYZUSDT',baseCoin:'XYZ',quoteCoin:'USDT',launchTime:now-4*86400000,status:'online',symbolType:'crypto'},
 {symbol:'OLDUSDT',baseCoin:'OLD',quoteCoin:'USDT',launchTime:now-35*86400000,status:'online',symbolType:'crypto'},
 {symbol:'RWAUSDT',baseCoin:'RWA',quoteCoin:'USDT',launchTime:launch,status:'online',symbolType:'crypto',isRwa:'YES'}
]};
const tickers={code:'00000',data:[
 {symbol:'MHAUSDT',lastPrice:'0.0037',turnover24h:'24000',price24hPcnt:'0.2'},
 {symbol:'LITPERP',lastPrice:'3.4',turnover24h:'200',price24hPcnt:'0.15'},
 {symbol:'XYZUSDT',lastPrice:'0.0041',turnover24h:'50',price24hPcnt:'-0.1'},
 {symbol:'OLDUSDT',lastPrice:'1',turnover24h:'100'},
 {symbol:'RWAUSDT',lastPrice:'2',turnover24h:'100'}
]};
const listings=reader.verifyBitget(instruments,tickers,registry,now);
assert.deepEqual(listings.map(x=>x.symbol).sort(),['MHA','XYZ']);
assert.equal(listings.find(x=>x.symbol==='MHA').identityProved,true);
assert.equal(listings.find(x=>x.symbol==='XYZ').identityProved,false);
assert.equal(listings.find(x=>x.symbol==='MHA').pair,'MHA/USDT');
assert.equal(listings.find(x=>x.symbol==='MHA').image,'./assets/crypto/new-listings/magic-hash.png');
assert.equal(listings.find(x=>x.symbol==='XYZ').image,'');
assert.throws(()=>reader.verifyBitget({},tickers,registry,now),/invalides/i);
const paper=reader.verifyPaper({schema:'erith.btc-ct.hourly-paper.v1',
 simulation_only:true,orders_enabled:false,account_access:false,
 markets:{BTC:{decision:'WAIT',source_time:'2026-10-16T01:00:00Z',last_price_usdt:82000,closed:0},
 CT:{decision:'WAIT',source_time:'2026-10-16T01:00:00Z',last_price_usdt:.38,closed:0}}});
assert.equal(paper.CT.price,.38);
assert.equal(paper.BTC.quote,'USDT');
assert.throws(()=>reader.verifyPaper({orders_enabled:true}),/invalide/i);
const native=fs.readFileSync(path.resolve(__dirname,'../administrator/js/new-listings-native-category.js'),'utf8');
const html=fs.readFileSync(path.resolve(__dirname,'radar.html'),'utf8');
const js=fs.readFileSync(path.resolve(__dirname,'radar.js'),'utf8');
assert(native.includes('mountRadarLink()')&&native.includes('atlasPublicRadarLink'));
assert(native.includes('atlasRadarMarketView')); // standalone path lives in native renderer
assert(html.includes('Top 10')&&html.includes('Top 20')&&html.includes('Top 50')&&html.includes('Top 250'));
assert(html.includes('new listings')||html.includes('nouveaux listings'));
assert(!js.includes('api/v5/trade/order'));
assert(!js.includes('secretKey'));
assert(!js.includes('api/v5/account/balance'));
assert(!js.includes('localStorage.'));
const tabStart=native.indexOf("function radarView(open)");
const tabEnd=native.indexOf("function mathSeriesSnapshot()",tabStart);
assert(tabStart>0&&tabEnd>tabStart);
const tab=native.slice(tabStart,tabEnd);
const nativeView=fs.readFileSync(path.resolve(__dirname,'../administrator/js/market-radar-native.js'),'utf8');
const nativeCss=fs.readFileSync(path.resolve(__dirname,'../administrator/market-radar-native.css'),'utf8');
const marketFiche=fs.readFileSync(path.resolve(__dirname,'../trader/market-fiche-native.js'),'utf8');
assert(tab.includes('marketSnapshotPanel')&&tab.includes('marketTools'),"Native Radar stays in existing Market Snapshot");
assert(tab.includes('atlasRadarMarketView')&&tab.includes('view.hidden=!visible'),"Native Radar hides and shows without replacing Market");
assert(tab.includes('supplementary.hidden=!visible'),"Closing Radar hides the supplementary Spot/PAPER sections");
assert(tab.includes('aria-pressed')&&tab.includes('aria-expanded'),"Native Radar supports accessible toggling");
assert(native.includes('loadRadarScript("../laboratoire/radar.js")'),"Native Radar reuses exact standalone public parser");
assert(native.includes('loadRadarScript("./js/market-radar-native.js")'),"Native Radar loads a dedicated themed renderer");
assert(native.includes('await Promise.all(loads)'),"Radar reader and renderer load concurrently");
assert(native.includes('queueMicrotask(()=>warmNativeRadar(view))'),"Trader warms the Radar before the first click");
assert(native.includes('if(new URLSearchParams(location.search).get("surface")==="trader")'),"Prewarm isolated to Trader");
assert(native.includes('if(view.isConnected)globalThis.AgentCryptoRadarNative.mount(view)'),"Radar pre-renders inside its hidden native view");
assert(native.includes('if(radarNativePromise)return radarNativePromise'),"Multiple callers reuse a single preload");
assert(tab.includes('theme.href=new URL("./market-radar-native.css"'),"Native Radar includes its scoped theme");
assert(!tab.includes('iframe')&&!tab.includes('frame.src'),"Nested standalone iframe removed");
assert(native.includes('if(state.radarOpen)radarView(false)'),"Canonical Market buttons return to native table");
assert(native.includes('if(state.enabled)'),"Returning to an active New Listings preserves native CT selection");
assert(!tab.includes('placeOrder')&&!tab.includes('fetch(')&&!tab.includes('localStorage.'),"No duplicated Market owner or order execution");
assert(nativeView.includes('radar-native-head')&&nativeView.includes('market-universe-mode')&&nativeView.includes('table-wrap'),"Reuse canonical Trader UI classes");
assert(nativeView.includes('Agrandir ↗')&&nativeView.includes('../laboratoire/radar.html'),"Standalone view remains available");
assert(nativeView.includes('global.AgentCryptoRadarReader'),"Renderer shares public parser with standalone");
assert(!nativeView.includes('createElement("iframe")')&&!nativeView.includes('placeOrder')&&!nativeView.includes('api/v5/trade/order'),"No iframe or private trading routes");
assert(nativeCss.includes(':is(#marketSnapshotPanel, #atlasRadarBelowMarket) .radar-native')&&nativeCss.includes('var(--text)')&&nativeCss.includes('var(--line)'),"Shared Market/Radar CSS is scoped correctly");
assert(!nativeCss.includes('color:#fff1c7')&&!nativeCss.includes('background:#06131f'),"Standalone palette not duplicated");
assert(js.includes('global.AgentCryptoRadarReader=API'),"Standalone and Market-native views share same validators");
assert(js.includes('!document.getElementById("tiers")'),"Standalone renderer does not auto-mount in Trader");
assert(js.includes('registre inaccessible (chargement réseau ou publication)'),"Unreachable registry identified accurately");
console.log('PASS Radar 10/20/50/250, real listing eligibility, PAPER, public-only integration');

const router=require('../administrator/js/market-radar-native.js');
assert.equal(router.compactMoney(40313967652).includes('40'),true);
assert(!router.compactMoney(40313967652).includes('40313967652'));
assert(nativeView.includes('selectGraph(root,model,identity)'));
assert(nativeView.includes('commands.chart(identity.id,"24h")'));
assert(nativeView.includes('category.selectById(identity.id)'));
assert(nativeView.includes('clickable(r,{kind:"market"')&&nativeView.includes('clickable(r,{kind:"listing"'));
assert(nativeView.includes('model.listings.filter(x=>x.symbol!=="CT")'),"No duplicate CT row");
assert(nativeView.includes('identityRegistry()'),"Canonical public identity registry failover");
assert(nativeView.includes('printMarket(root,model);')&&nativeView.includes('const live=await Promise.allSettled'),"Render market before Bitget finishes");
assert(nativeCss.includes('.radar-native-selectable:focus-visible'),"Keyboard click affordance");
assert(nativeView.includes('identityCell(r,asset)')&&nativeView.includes('identityCell(r,item)'),"Shared identity rendering");
assert(nativeView.includes('global.AgentCryptoTraderNativeFiche?.showAsset?.'),"Existing fiche owner");
assert(marketFiche.includes('showAsset,hide,preferredMode'),"Fiche API exposed");
assert(nativeCss.includes('.market-identity-rail')&&nativeCss.includes('[data-radar-symbol="BTC"]'),"Market color accents");
assert(!nativeView.includes('syncGraphSelection(')&&!nativeView.includes('graphSelection()'),"Rejected graph-state strip removed");
assert(nativeView.includes('radarObservation:movement.label'),"Factual movement is forwarded to the existing fiche");
assert(!nativeView.includes('Voir la fiche')&&!nativeView.includes('focusFiche')&&!nativeView.includes('focusName'),
 "Rejected fiche button and selection banner absent");
assert(nativeView.includes('global.AgentCryptoTraderNativeFiche?.showAsset?.(row,coin'),
 "Radar uses the one native Market fiche on hover");
assert(nativeView.includes("row.addEventListener('pointerenter',show)")&&nativeView.includes("row.addEventListener('focus',show)"),
 "Native fiche shown on hover and keyboard focus");
assert(nativeView.includes("row.addEventListener('pointerleave'")&&nativeView.includes("row.addEventListener('blur'"),
 "Native fiche hide lifecycle retained");
assert(!nativeView.includes('row.title="Afficher "'),"No browser tooltip competing with native fiche");
assert(!nativeCss.includes('.radar-native-focus')&&!nativeCss.includes('.is-radar-active'),"Rejected focus styling removed");
assert(marketFiche.includes('Lecture Radar · descriptive')&&marketFiche.includes('Preuve et limites'),"Fiche includes source limitations");
assert(nativeView.includes('extendedPromise=get("../data/crypto/extended.json")'),"Shared extended archive, no extra network API");
assert(nativeView.includes('printOpportunities(root,model)'),"Opportunity research section present");
delete globalThis.AtlasExternalChart;
const opportunityScript=fs.readFileSync(path.resolve(__dirname,'../tools/radar_opportunity_history.cjs'),'utf8');
assert(opportunityScript.includes('followup_status')&&opportunityScript.includes('record_kind'),"Traceable separate history kinds");
assert(opportunityScript.includes('Math.abs(now.getTime()-newest)>8*3600000'),"Stale sources must be refused");
assert(opportunityScript.includes('observed_followup_price_usd:valid?futurePrice:null'),"Missing history stays null");

(async()=>{
 const status={textContent:""};
 const root={querySelector(selector){assert.equal(selector,'[data-radar-native="status"]');return status;}};
 const model={selectionRevision:0};
 const trace=[];
 globalThis.AgentCryptoCommands={
  asset(id){trace.push("asset:"+id);return {ok:true,payload:{id}};},
  chart(id,period){trace.push("chart:"+id+":"+period);return {ok:true,payload:{selected_asset:{id}}};}
 };
 globalThis.atlasTraderExternalSelectionClear=()=>trace.push("clear-ct");
 let selectedListing=null;
 globalThis.AtlasExternalChart={state:()=>({coin_id:selectedListing})};
 globalThis.AgentCryptoNewListingsNativeCategory={
  deactivate(){trace.push("deactivate-native");},
  async selectById(id){
   trace.push("listing:"+id);
   if(id==="concrete"){selectedListing="concrete";return true;}
   if(id==="MHA"){selectedListing="new-listing:bitget:mhausdt";return true;}
   return false;
  },
  snapshot(){return {selectedId:selectedListing};},
  async discover(){trace.push("discover");}
 };
 globalThis.atlasTraderExternalSelectionCommit=spec=>{trace.push("commit:"+spec.providerSymbol);return true;};
 assert.equal(await router.selectGraph(root,model,{kind:"market",id:"bitcoin",symbol:"BTC"}),true);
 assert.deepEqual(trace.slice(0,4),["asset:bitcoin","clear-ct","deactivate-native","chart:bitcoin:24h"]);
 assert.match(status.textContent,/BTC.*Solo/);
 trace.length=0;
 assert.equal(await router.selectGraph(root,model,{kind:"listing",id:"concrete",symbol:"CT"}),true);
 assert.deepEqual(trace,["listing:concrete","commit:CT-USDT"]);
 assert.match(status.textContent,/CT.*Solo/);
 trace.length=0;
 assert.equal(await router.selectGraph(root,model,{kind:"listing",id:"MHA",symbol:"MHA"}),true);
 assert.deepEqual(trace,["listing:MHA","clear-ct"]);
 trace.length=0;
 assert.equal(await router.selectGraph(root,model,{kind:"listing",id:"NOT",symbol:"NOT"}),false);
 assert.deepEqual(trace,["listing:NOT","discover","listing:NOT"]);
 assert.match(status.textContent,/graphique précédent conservé/);
 trace.length=0;
 globalThis.AgentCryptoCommands.asset=id=>({ok:false,payload:null});
 assert.equal(await router.selectGraph(root,model,{kind:"market",id:"nonexistent",symbol:"BAD"}),false);
 assert.equal(trace.some(x=>x==="clear-ct"||x.startsWith("chart:")),false,
   "Unknown market identity must not clear existing graph");
 console.log("PASS Radar graph routing BTC CT MHA, trusted Solo owner, fail-closed chart on missing data");
})().catch(e=>{console.error(e);process.exitCode=1});

