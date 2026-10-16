import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {gzipSync} from "node:zlib";
import {createHash,webcrypto} from "node:crypto";

const script=fs.readFileSync("public/agent_crypto_erith_ia/trader/trader-historical-universe-reader.js","utf8");
const sha=raw=>createHash("sha256").update(raw).digest("hex");
function fixture({corrupt=false,unapproved=false,marketAlias=false,approvedAlias=false,incremental=false,ledgerTamper=false,gap=false,corruptIncremental=false}={}){
 const end=1_800_000_000_000,step=300_000,count=288,start=end-count*step;
 const rows=Array.from({length:count},(_,i)=>[start+i*step,10,12,9,11,3,33,2]);
 const block={schema:"aerith.public.ohlcv.spot.universe.block.v1",source:"Binance Spot",
  asset_id:"dogecoin",symbol:"DOGE",pair:"DOGEUSDT",quote:"USDT",period:"24h",interval:"5m",
  first_ms:start,last_ms:end-step,rows};
 const compressed=gzipSync(JSON.stringify(block));
 const checksum=sha(compressed);
 const index={schema:"aerith.public.ohlcv.spot.universe.index.v1",
  source:"Binance Spot REST /api/v3/klines",quote:"USDT",
  publication:"MANUAL_BOUNDED_PILOT_NOT_LIVE",
  universe_size:marketAlias?2:1,verified_series:1,verified_candles:count,
  registry_sha256:"a".repeat(64),market:{sha256:"b".repeat(64)},
  snapshot_end_ms:end,assets:[{id:"dogecoin",symbol:"DOGE",rank:1,
    qualification:unapproved?"identity_review_required":"qualified_spot",
    candidate_pair:"DOGEUSDT"},...(marketAlias?[{id:"figure-heloc",symbol:"FIGR_HELOC",rank:2,
     qualification:approvedAlias?"qualified_spot":"identity_review_required",
     candidate_pair:approvedAlias?"FIGR_HELOCUSDT":null}]:[])],
  blocks:[{file:"blocks/dogecoin_24h_"+checksum.slice(0,16)+".json.gz",
    sha256:checksum,asset_id:"dogecoin",pair:"DOGEUSDT",period:"24h",
    interval:"5m",candles:count,first_ms:start,last_ms:end-step}]};
 const indexBytes=Buffer.from(JSON.stringify(index));
 const extraFirst=end+(gap?step:0),extraCount=3;
 const extraRows=Array.from({length:extraCount},(_,i)=>[extraFirst+i*step,10,12,9,11,3,33,2]);
 const chunk={schema:"aerith.public.ohlcv.spot.universe.incremental.chunk.v1",
  source:"Binance Spot",quote:"USDT",asset_id:"dogecoin",pair:"DOGEUSDT",
  period:"24h",interval:"5m",first_ms:extraFirst,
  last_ms:extraFirst+(extraCount-1)*step,rows:extraRows};
 const extraGzip=gzipSync(JSON.stringify(chunk)),chunkHash=sha(extraGzip);
 const chunkMeta={asset_id:"dogecoin",pair:"DOGEUSDT",period:"24h",interval:"5m",
  first_ms:chunk.first_ms,last_ms:chunk.last_ms,candles:extraCount,sha256:chunkHash,
  file:"blocks/dogecoin_24h_"+chunk.first_ms+"_"+chunk.last_ms+"_"+chunkHash.slice(0,16)+".json.gz"};
 const ledger={schema:"aerith.public.ohlcv.spot.universe.incremental.index.v1",
  baseline_sha256:ledgerTamper?"0".repeat(64):sha(indexBytes),
  quote:"USDT",source:"Binance Spot",mode:"MANUAL_APPEND_ONLY_CLOSED_CANDLES",
  chunks:incremental?[chunkMeta]:[]};
 const requests=[];
 const get=async url=>{
  // The optional manifest may be absent for older snapshots; keep old test counts unchanged.
  if(url.endsWith("incremental/index.json")&&!incremental)return {ok:false,status:404};
  requests.push(url);
  let buffer;
  if(url.endsWith("incremental/index.json"))buffer=Buffer.from(JSON.stringify(ledger));
  else if(url.endsWith("/index.json"))buffer=indexBytes;
  else if(url.includes("/incremental/blocks/"))buffer=corruptIncremental?
       Buffer.concat([extraGzip,Buffer.from("corrupt")]):extraGzip;
  else buffer=corrupt?Buffer.concat([compressed,Buffer.from("corrupt")]):compressed;
  return{ok:true,status:200,arrayBuffer:async()=>Uint8Array.from(buffer).buffer};
 };
 const context={document:{currentScript:{src:"https://example.org/public/agent_crypto_erith_ia/trader/trader-historical-universe-reader.js"}},
  location:{origin:"https://example.org"},URL,fetch:get,
  Date,TextDecoder,TextEncoder,crypto:webcrypto,Blob,Response,DecompressionStream};
 vm.runInNewContext(script,vm.createContext(context),{timeout:3000});
 return{api:context.SevenHistoricalUniverseReader,requests};
}
test("Universe is lazy; catalog checks identity and lists one series",async()=>{
 const f=fixture();
 assert.equal(f.requests.length,0);
 const c=await f.api.listCoverage();
 assert.equal(f.requests.length,1);
 assert.equal(c.archiveFamily,"universe");
 assert.equal(c.coverage.length,1);
 assert.equal(c.coverage[0].pair,"DOGEUSDT");
 assert.equal(f.requests.length,1);
});
test("One selected gzip is verified and decoded without other downloads",async()=>{
 const f=fixture();
 const data=await f.api.readSeries({assetId:"dogecoin",period:"24h"});
 assert.equal(f.requests.length,2);
 assert.equal(data.metadata.quote,"USDT");
 assert.equal(data.metadata.archiveFamily,"universe");
 assert.equal(data.candles.length,288);
 assert.equal(data.candles[287][0],1_800_000_000_000-300000);
});
test("SHA alteration fails closed",async()=>{
 const f=fixture({corrupt:true});
 await assert.rejects(()=>f.api.readSeries({assetId:"dogecoin",period:"24h"}),/SHA-256/);
});
test("Non-approved coin never downloads a compressed block",async()=>{
 const f=fixture({unapproved:true});
 await assert.rejects(()=>f.api.listCoverage(),/non qualifiée/);
 assert.equal(f.requests.length,1);
});
test("Unknown selection never receives a substituted asset",async()=>{
 const f=fixture();
 await assert.rejects(()=>f.api.readSeries({assetId:"bitcoin",period:"24h"}),/absente/);
 assert.equal(f.requests.length,1);
});

test("Real Top 20 includes unapproved FIGR_HELOC; DOGE archive still verifies",async()=>{
 const f=fixture({marketAlias:true});
 const catalog=await f.api.listCoverage();
 assert.equal(catalog.coverage.length,1);
 const doge=await f.api.readSeries({assetId:"dogecoin",period:"24h"});
 assert.equal(doge.candles.length,288);
 assert.equal(f.requests.length,2);
});
test("Exchange approved instrument cannot use the non-Spot underscore ticker",async()=>{
 const f=fixture({marketAlias:true,approvedAlias:true});
 await assert.rejects(()=>f.api.listCoverage(),/Paire non qualifiée/);
 assert.equal(f.requests.length,1);
});

test("Verified Universe cumulative snapshot plus incremental OHLCV",async()=>{
 const f=fixture({incremental:true});
 const catalog=await f.api.listCoverage();
 assert.equal(catalog.coverage[0].candles,291);
 assert.equal(catalog.coverage[0].last_open_ms,1_800_000_000_000+2*300000);
 const series=await f.api.readSeries({assetId:"dogecoin",period:"24h"});
 assert.equal(series.metadata.status,"VALIDATED_ARCHIVE");
 assert.equal(series.candles.length,291);
 assert.equal(series.candles.at(-1)[0],1_800_000_000_000+2*300000);
});
test("Ledger bound to original SHA-256: tampering rejected",async()=>{
 const f=fixture({incremental:true,ledgerTamper:true});
 await assert.rejects(()=>f.api.listCoverage(),/Journal Universe non qualifié/);
});
test("Universe chronology gap rejected before reading OHLCV blocks",async()=>{
 const f=fixture({incremental:true,gap:true});
 await assert.rejects(()=>f.api.listCoverage(),/Continuité ou identité/);
 assert.equal(f.requests.length,2);
});
test("Incremental SHA-256 tampering is rejected",async()=>{
 const f=fixture({incremental:true,corruptIncremental:true});
 await assert.rejects(()=>f.api.readSeries({assetId:"dogecoin",period:"24h"}),/SHA-256/);
});
