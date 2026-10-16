import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {gzipSync} from "node:zlib";
import {createHash,webcrypto} from "node:crypto";

const source=fs.readFileSync("public/agent_crypto_erith_ia/trader/trader-historical-long-reader.js","utf8");
const sha=raw=>createHash("sha256").update(raw).digest("hex");
function fixture({tamper=false,missingYear=false,corruptRow=false,badIdentity=false}={}){
 const stamp=1_800_000_000_000;
 const periods={"90d":["4h",14400000,540],"1y":["1d",86400000,365]};
 const files=new Map(),blocks=[],archived={};
 for(const [period,[interval,step,count]] of Object.entries(periods)){
  if(period==="1y"&&missingYear)continue;
  const end=Math.floor((stamp-90000)/step)*step;
  const rows=Array.from({length:count},(_,i)=>[end-count*step+i*step,10,12,9,11,4,44,3]);
  if(corruptRow&&period==="90d")rows[3][0]+=step;
  const doc={schema:"aerith.public.ohlcv.spot.long-periods.block.v1",source:"Binance Spot",
   quote:"USDT",asset_id:"dogecoin",pair:"DOGEUSDT",period,interval,
   first_ms:rows[0][0],last_ms:rows.at(-1)[0],rows};
  const gzip=gzipSync(JSON.stringify(doc)),hash=sha(gzip);
  const file="blocks/dogecoin_"+period+"_"+hash.slice(0,16)+".json.gz";
  blocks.push({file,sha256:hash,asset_id:"dogecoin",pair:"DOGEUSDT",
   period,interval,first_ms:doc.first_ms,last_ms:doc.last_ms,candles:count});
  files.set(file,tamper&&period==="90d"?Buffer.concat([gzip,Buffer.from("tamper")]):gzip);
  archived[period]={status:"verified"};
 }
 archived["60d"]={status:"derived_from_90d"};
 archived["Max"]={status:"NOT_AVAILABLE_FROM_THIS_SNAPSHOT"};
 const other={long_periods:{"90d":{status:"unavailable"},"60d":{status:"unavailable"},"1y":{status:"unavailable"}}};
 const assets=[{id:"dogecoin",symbol:badIdentity?"DOGEOTHER":"DOGE",pair:"DOGEUSDT",
  long_periods:{"90d":{status:"verified"},"60d":{status:"derived_from_90d"},
   "1y":{status:missingYear?"unavailable":"verified"},Max:{status:"NOT_AVAILABLE_FROM_THIS_SNAPSHOT"}}},
  ...Array.from({length:23},(_,i)=>({id:"other-"+i,symbol:"T"+i,pair:"T"+i+"USDT",...other}))];
 const index={schema:"aerith.public.ohlcv.spot.long-periods.index.v1",source:"Binance Spot",
  quote:"USDT",status:"VERIFIED_MANUAL_BACKFILL",max_status:"NOT_AVAILABLE_FROM_THIS_SNAPSHOT",
  snapshotted_at_ms:stamp,assets,blocks,verified_blocks:blocks.length,
  verified_candles:blocks.reduce((n,b)=>n+b.candles,0)};
 const requests=[],fetch=async url=>{
  requests.push(url);
  const path=new URL(url).pathname;
  const key=path.slice(path.indexOf("/long-periods/")+"/long-periods/".length);
  const bytes=key==="index.json"?Buffer.from(JSON.stringify(index)):files.get(key);
  if(!bytes)throw Error("Unexpected HTTP route: "+url);
  return{ok:true,status:200,arrayBuffer:async()=>Uint8Array.from(bytes).buffer};
 };
 const context={document:{currentScript:{src:"https://example.org/public/agent_crypto_erith_ia/trader/trader-historical-long-reader.js"}},
  location:{origin:"https://example.org"},URL,fetch,
  Date,TextDecoder,TextEncoder,crypto:webcrypto,Blob,Response,DecompressionStream};
 vm.runInNewContext(source,vm.createContext(context),{timeout:3000});
 return{reader:context.SevenHistoricalLongReader,requests};
}
test("long period catalog stays lazy and gives actual verified horizons",async()=>{
 const f=fixture();
 assert.equal(f.requests.length,0);
 const catalog=await f.reader.listCoverage();
 assert.equal(f.requests.length,1);
 assert.equal(catalog.quote,"USDT");
 assert.equal(catalog.coverage.length,3);
 assert.equal(catalog.coverage.find(x=>x.period==="60d").candles,360);
 assert.equal(catalog.coverage.find(x=>x.period==="1y").candles,365);
});
test("60d derives exactly 360 closed 4h candles from verified 90d SHA archive",async()=>{
 const f=fixture();
 const series=await f.reader.readSeries({assetId:"dogecoin",period:"60d"});
 assert.equal(f.requests.length,2);
 assert.equal(series.metadata.period,"60d");
 assert.equal(series.metadata.derivedFrom90d,true);
 assert.equal(series.metadata.quote,"USDT");
 assert.equal(series.candles.length,360);
 assert.equal(series.candles[1][0]-series.candles[0][0],14400000);
});
test("90d and 1y have independently verified timelines",async()=>{
 const f=fixture();
 const a=await f.reader.readSeries({assetId:"dogecoin",period:"90d"});
 const b=await f.reader.readSeries({assetId:"dogecoin",period:"1y"});
 assert.equal(a.candles.length,540);
 assert.equal(b.candles.length,365);
 assert.equal(b.metadata.interval,"1d");
});
test("Missing one-year coverage is never fabricated",async()=>{
 const f=fixture({missingYear:true});
 const catalog=await f.reader.listCoverage();
 assert.equal(catalog.coverage.length,2);
 await assert.rejects(()=>f.reader.readSeries({assetId:"dogecoin",period:"1y"}),/indisponible/);
 assert.equal(f.requests.length,1);
});
test("SHA-256 corruption refuses tampered archive",async()=>{
 const f=fixture({tamper:true});
 await assert.rejects(()=>f.reader.readSeries({assetId:"dogecoin",period:"90d"}),/SHA-256/);
});
test("Chronological gap is refused",async()=>{
 const f=fixture({corruptRow:true});
 await assert.rejects(()=>f.reader.readSeries({assetId:"dogecoin",period:"90d"}),/Chandelle historique longue invalide/);
});
test("Ticker mismatch and unknown instruments fail closed",async()=>{
 const a=fixture({badIdentity:true});
 await assert.rejects(()=>a.reader.listCoverage(),/Actif longue période non qualifié/);
 const b=fixture();
 await assert.rejects(()=>b.reader.readSeries({assetId:"bitcoin",period:"90d"}),/indisponible/);
});
