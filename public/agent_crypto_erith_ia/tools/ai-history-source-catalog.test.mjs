import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import vm from "node:vm";
const root="public/agent_crypto_erith_ia/";
function obj(file){return JSON.parse(fs.readFileSync(root+file,"utf8"));}
const min=obj("data/historical_archive_prototype/top250_multisource_coverage/index.json");
const day=obj("data/historical_archive_prototype/top250_multiresolution_sources/index.json");
const verified=obj("data/historical_archive_prototype/verified_periods/index.json");
const inv=fs.readFileSync(root+"trader/ai-source-inventory.js","utf8");
const source=fs.readFileSync(root+"trader/ai-history-source-catalog.js","utf8");
const ctx=vm.createContext({});
vm.runInContext(inv,ctx);vm.runInContext(source,ctx);
const one=ctx.AgentCryptoHistoryInventory.assemble(min,day);
const cat=ctx.AgentCryptoHistorySourceCatalog.compile(one,verified);
const query=options=>ctx.AgentCryptoHistorySourceCatalog.query(cat,options);
test("one owner per exact ID, no cross-source conversion",()=>{
 assert.equal(cat.count,250);assert.equal(cat.quoteConversion,false);assert.equal(cat.realOrders,false);
 assert.equal(cat.outOfUniverse.length,2);
});
test("Q daily Bitget survives missing minute R9 and retains source proof",()=>{
 const q=query({id:"quack-ai",granularity:"1d"});
 assert.equal(q.status,"NATIVE_DAILY");assert.equal(q.sources[0].points,390);
 assert.equal(q.sources[0].gaps,4);assert.equal(q.sources[0].quote,"USDT");
 assert.match(q.sources[0].sha256,/^[a-f0-9]{64}$/);
 assert.equal(query({id:"quack-ai",granularity:"1m"}).status,"NO_NATIVE_MINUTE");
});
test("five pilot assets supply exactly seven prepared historical periods",()=>{
 for(const id of ["bitcoin","ethereum","binancecoin","ripple","solana"]){
  const p=cat.assets.find(a=>a.id===id).prepared;
  assert.equal(p.length,7);
  assert.ok(p.every(x=>x.snapshot&&!x.isLive&&!x.isAllTime&&x.points>0&&x.bytes>0));
  assert.equal(query({id,period:"Max"}).status,"PREPARED_SNAPSHOT");
 }
 assert.equal(query({id:"concrete",period:"24h"}).status,"UNKNOWN_ASSET");
});
test("reader refuses fabricated periods, unsupported asset and replacement quote",()=>{
 assert.equal(query({id:"fabricated",period:"24h"}).status,"UNKNOWN_ASSET");
 const corrupted=structuredClone(verified);corrupted.assets[0].periods[0].file="another-asset.json.gz";
 assert.throws(()=>ctx.AgentCryptoHistorySourceCatalog.compile(one,corrupted),/fichier période/);
});
