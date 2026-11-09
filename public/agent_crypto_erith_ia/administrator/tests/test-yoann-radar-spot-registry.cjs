"use strict";
/* Yoann Operator + Trader: shared MASTER public identity contract.
 * Synthetic Bitget data only; no private account, network, orders or token guesses. */
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const reader=require("../../laboratoire/radar.js");
const native=fs.readFileSync(path.join(__dirname,"../js/market-radar-native.js"),"utf8");
const standalone=fs.readFileSync(path.join(__dirname,"../../laboratoire/radar.js"),"utf8");
const shared="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/administrator/data/new-listings-public-feed.json";
const exact={provider:"bitget",instrument_type:"SPOT",identity_status:"EXACT_CONTRACT_AND_VENUE_REGISTRY",canonicalId:"example-coin",providerSymbol:"XYZUSDT",base:"XYZ",quote:"USDT",pair:"XYZ/USDT"};
const feed=(entries=[exact])=>({
 schema:"erith.seven.public-spot-listings-feed.v1",read_only:true,
 trade_permission:false,real_orders:0,no_ticker_to_contract_identity_inference:true,entries
});
const row=(symbol,quote)=>({
 symbol,baseCoin:"XYZ",quoteCoin:quote,launchTime:Date.now()-3600000,
 status:"online",symbolType:"crypto",isRwa:"NO"
});
const ticker=symbol=>({symbol,lastPrice:"1.50",turnover24h:"200000",price24hPcnt:"0.10"});
test("both Operator Radars read MASTER canonical feed, without copying logo memory",()=>{
 for(const source of [native,standalone]){
  assert.ok(source.includes(shared));
  assert.ok(!source.includes("new-listings-identities.json"));
 }
});
test("only exact contract + venue matches qualify as verified Bitget identity",()=>{
 const verified=reader.verifyRegistry(feed());
 assert.equal(verified.size,1);
 const a=reader.verifyBitget({code:"00000",data:[row("XYZUSDT","USDT")]},
  {code:"00000",data:[ticker("XYZUSDT")]},verified,Date.now());
 assert.equal(a.length,1);
 assert.equal(a[0].identityProved,true);
 assert.equal(a[0].pair,"XYZ/USDT");
 const b=reader.verifyBitget({code:"00000",data:[row("XYZUSDC","USDC")]},
  {code:"00000",data:[ticker("XYZUSDC")]},verified,Date.now());
 assert.equal(b[0].identityProved,false);
 assert.equal(b[0].status,"IDENTITÉ À VÉRIFIER");
});
test("venue-only symbol and legacy logo memory must not certify trading identity",()=>{
 assert.equal(reader.verifyRegistry(feed([{...exact,identity_status:"VENUE_SYMBOL_ONLY"}])).size,0);
 assert.throws(()=>reader.verifyRegistry({schema:"agent_crypto_new_listings_identity_registry_v1",identities:{XYZ:{verified:true,coingeckoId:"example-coin",symbol:"XYZ"}}}),/Catalogue d'identités Spot public invalide/);
 assert.throws(()=>reader.verifyRegistry({...feed(),trade_permission:true}),/Catalogue d'identités Spot public invalide/);
});
