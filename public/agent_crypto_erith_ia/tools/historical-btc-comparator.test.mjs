import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {webcrypto} from "node:crypto";

const folder="public/agent_crypto_erith_ia";
const archive=path.resolve(folder+"/data/historical_archive_prototype/ohlcv_spot_pilot");
const current=path.resolve(folder+"/data/crypto/latest.json");
const src1=fs.readFileSync(folder+"/administrator/js/historical-archive-adapter.js","utf8");
const src2=fs.readFileSync(folder+"/administrator/js/historical-btc-comparator.js","utf8");
const origin="https://blueazur-hub.github.io",root="/erith-ia-memory/public/agent_crypto_erith_ia/";
function setup({bridgeDown=false,alterMarket=false}={}){
 let calls=0;const window={};
 const mockFetch=async uri=>{
  const u=new URL(uri);calls++;
  if(u.hostname==="127.0.0.1"){
   assert.equal(u.port,"8790");assert.equal(u.pathname,"/okx-public");
   assert.equal(u.searchParams.get("endpoint"),"ticker");assert.equal(u.searchParams.get("instId"),"BTC-USDC");
   if(bridgeDown)throw Error("Backend local indisponible");
   return new Response(JSON.stringify({code:"0",data:[{instId:"BTC-USDC",last:"83050.25",ts:String(Date.now()-30000)}]}),{status:200});
  }
  assert.equal(u.origin,origin);
  assert.ok(u.pathname.startsWith(root));
  const relative=u.pathname.slice(root.length);
  if(relative==="data/crypto/latest.json"){
   const obj=JSON.parse(fs.readFileSync(current,"utf8"));
   if(alterMarket)obj.source.quote_currency="EUR";
   return new Response(JSON.stringify(obj),{status:200});
  }
  assert.ok(relative.startsWith("data/historical_archive_prototype/ohlcv_spot_pilot/"));
  const file=relative.slice("data/historical_archive_prototype/ohlcv_spot_pilot/".length);
  assert.ok(!file.includes(".."));
  return new Response(fs.readFileSync(path.join(archive,file)),{status:200});
 };
 const ctx={window,document:{currentScript:{src:origin+root+"administrator/js/historical-archive-adapter.js"}},
   location:{origin},fetch:mockFetch,URL,crypto:webcrypto,Blob,Response,DecompressionStream,TextEncoder,TextDecoder,Uint8Array,Date,AbortSignal};
 vm.runInNewContext(src1,ctx,{timeout:3000});
 ctx.document.currentScript.src=origin+root+"administrator/js/historical-btc-comparator.js";
 vm.runInNewContext(src2,ctx,{timeout:3000});
 return{window,getCalls:()=>calls};
}
test("no automatic fetch on module loading",()=>{
 const h=setup();
 assert.equal(h.getCalls(),0);
 assert.equal(typeof h.window.SevenBTCSourceComparator.compare,"function");
});
test("verified archived BTC, public CoinGecko USD and OKX USDC remain separate",async()=>{
 const h=setup();
 const d=await h.window.SevenBTCSourceComparator.compare();
 assert.equal(d.priceSpreadCalculated,false);
 assert.equal(d.graphModified,false);
 assert.equal(d.quoteRule,"USD != USDT != USDC");
 const [cg,bi,ok]=d.rows;
 assert.equal(cg.provider,"CoinGecko");assert.equal(cg.quote,"USD");assert.ok(cg.price>0);
 assert.equal(cg.kind,"MARKET_SNAPSHOT");
 assert.equal(bi.market,"BTCUSDT");assert.equal(bi.quote,"USDT");assert.equal(bi.totalCandles,294);
 assert.equal(bi.kind,"ARCHIVED_CANDLE_CLOSE");
 assert.equal(ok.market,"BTC-USDC");assert.equal(ok.quote,"USDC");assert.equal(ok.price,83050.25);
 assert.equal(ok.kind,"SPOT_TICKER");
 assert.equal(d.rows.filter(r=>r.status==="UNAVAILABLE").length,0);
});
test("Bridge failure does not suppress CoinGecko or verified archived candles",async()=>{
 const d=await setup({bridgeDown:true}).window.SevenBTCSourceComparator.compare();
 assert.equal(d.rows[0].quote,"USD");assert.equal(d.rows[1].quote,"USDT");
 assert.equal(d.rows[2].status,"UNAVAILABLE");
 assert.match(d.rows[2].error,/Backend local indisponible/);
});
test("market source with wrong declared currency fails closed",async()=>{
 const d=await setup({alterMarket:true}).window.SevenBTCSourceComparator.compare();
 assert.equal(d.rows[0].status,"UNAVAILABLE");assert.match(d.rows[0].error,/non qualifié/);
 assert.equal(d.rows[1].quote,"USDT");
});
