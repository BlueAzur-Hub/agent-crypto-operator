import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import vm from "node:vm";import {webcrypto} from "node:crypto";
const root="public/agent_crypto_erith_ia/";
const base=root+"data/historical_archive_prototype/";
const j=p=>JSON.parse(fs.readFileSync(base+p,"utf8"));
const mm=j("top250_multisource_coverage/index.json"),dd=j("top250_multiresolution_sources/index.json"),vv=j("verified_periods/index.json");
const iv=fs.readFileSync(root+"trader/ai-source-inventory.js","utf8");
const cat=fs.readFileSync(root+"trader/ai-history-source-catalog.js","utf8");
const reader=fs.readFileSync(root+"trader/ai-verified-history-reader.js","utf8");
const files=[];
const ctx=vm.createContext({crypto:webcrypto,URL,Blob,Response,DecompressionStream,TextDecoder,
 location:{href:"https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/trader/verified-reader.html"},
 async fetch(url){const name=new URL(url).pathname.split("/").at(-1);files.push(name);
  const raw=fs.readFileSync(base+"verified_periods/"+name);
  return {ok:true,status:200,arrayBuffer:async()=>raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength)};}});
vm.runInContext(iv,ctx);vm.runInContext(cat,ctx);vm.runInContext(reader,ctx);
const inventory=ctx.AgentCryptoHistoryInventory.assemble(mm,dd);
const book=ctx.AgentCryptoHistorySourceCatalog.compile(inventory,vv);
ctx.AgentCryptoHistorySourceCatalog={query:ctx.AgentCryptoHistorySourceCatalog.query,snapshot:()=>book};
test("read source materialization contains authenticated BTC 24h 1m OHLCV",async()=>{
 const p=await ctx.AgentCryptoVerifiedHistoryReader.read({assetId:"bitcoin",period:"24h"});
 assert.equal(p.quote,"USDT");assert.equal(p.points,1440);
 assert.equal(p.resolution,"1m");assert.equal(p.gaps,0);
 assert.equal(p.isLive,false);assert.equal(files.at(-1),"bitcoin-24h.json.gz");
});
test("BTC Max is historical, not unlimited and preserves actual gaps",async()=>{
 const p=await ctx.AgentCryptoVerifiedHistoryReader.read({assetId:"bitcoin",period:"Max"});
 assert.ok(p.points>2000);assert.equal(p.resolution,"1d");
 assert.equal(p.isAllTime,false);assert.ok(p.gaps>=0);
});
test("reader never creates nonexistent Q period or confuses CT identity",async()=>{
 await assert.rejects(ctx.AgentCryptoVerifiedHistoryReader.read({assetId:"quack-ai",period:"24h"}),/période exacte/);
 await assert.rejects(ctx.AgentCryptoVerifiedHistoryReader.read({assetId:"concrete",period:"24h"}),/période exacte/);
});
test("tampering with SHA or OHLCV is rejected",async()=>{
 const source=book.assets.find(x=>x.id==="bitcoin").prepared.find(x=>x.period==="24h");
 const original=source.sha256;
 source.sha256="0".repeat(64);
 await assert.rejects(ctx.AgentCryptoVerifiedHistoryReader.read({assetId:"bitcoin",period:"24h"}),/SHA-256 invalide/);
 source.sha256=original;
 const fake={schema:"seven.crypto.verified-period-projection",asset_id:"bitcoin",pair:"BTCUSDT",quote:"USDT",
  is_live:false,period:"24h",resolution:"1m",scope:"last_verified_closed_archive_window",
  rows:[[1,5,4,2,3,1,1,1],[60001,5,6,2,3,1,1,1]],gaps:[],start_ms:1,end_exclusive_ms:120001};
 assert.throws(()=>ctx.AgentCryptoVerifiedHistoryReader.validate(fake,{period:"24h",resolution:"1m",points:2,sha256:original},"bitcoin","BTC"),/prix ou volume/);
});
