import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {webcrypto,createHash} from "node:crypto";
import {gzipSync} from "node:zlib";

const js=fs.readFileSync(
 "public/agent_crypto_erith_ia/administrator/js/shared-hourly-history.js","utf8");
const origin="https://blueazur-hub.github.io";
const path="/erith-ia-memory/public/agent_crypto_erith_ia/data/historical_archive_prototype/shared_hourly_views/";
const end=Date.UTC(2026,9,1);
const hash=b=>createHash("sha256").update(b).digest("hex");

function fixtures(tamper=()=>{}){
 const content=new Map();
 const rows=(count)=>Array.from({length:count},(_,i)=>
   [end-(count-i)*3600000,10,12,9,11,0.5,5.5,2]);
 const monthNames=["2025-10","2025-11","2025-12",
   ...Array.from({length:9},(_,i)=>"2026-"+String(i+1).padStart(2,"0"))];
 const entries=[
   {id:"bitcoin",pair:"BTCUSDT",rank:1,months:monthNames,hours:8760},
   {id:"polkadot",pair:"DOTUSDT",rank:51,months:["2026-07","2026-08","2026-09"],hours:2208}
 ];
 const assets=entries.map(({id,pair,rank,months,hours})=>{
  const data={
   schema:"aerith.public.ohlcv.shared.contiguous-hourly-history.v1",
   asset_id:id,pair,quote:"USDT",
   source:"Binance Spot official monthly 1m ZIPs",
   scope:"contiguous_verified_closed_months",
   is_live:false,max_is_all_time:false,interval:"1h",
   native_1m_count:hours*60,
   first_open_ms:end-hours*3600000,last_open_ms:end-3600000,
   columns:["open_time_ms","open","high","low","close","base_volume","quote_volume","trade_count"],
   source_months:months.map(m=>({month:m,
     release:"crypto-spot-bulk-"+m+"-1m",
     source_zip_sha256:"a".repeat(64),native_1m_count:43200})),
   series:rows(hours)
  };
  const name=id+"-hourly.json.gz",packed=gzipSync(Buffer.from(JSON.stringify(data)));
  content.set(name,packed);
  return {id,rank,name:id,symbol:id.toUpperCase(),pair,quote:"USDT",
   first_month:months[0],last_month:months.at(-1),
   months:months.length,hourly_count:hours,native_1m_count:hours*60,
   first_open_ms:data.first_open_ms,last_open_ms:data.last_open_ms,
   file:name,bytes:packed.length,sha256:hash(packed)};
 });
 content.set("index.json",Buffer.from(JSON.stringify({
  schema:"aerith.public.ohlcv.shared.contiguous-hourly-index.v1",
  quote:"USDT",source:"Binance Spot official monthly 1m ZIPs",
  scope:"contiguous_verified_closed_months",is_live:false,max_is_all_time:false,
  archived_assets:2,assets})));
 const window={},requests=[];
 const document={currentScript:{src:origin+"/erith-ia-memory/public/agent_crypto_erith_ia/administrator/js/shared-hourly-history.js"}};
 const fetch=async href=>{
  const u=new URL(href);assert.equal(u.origin,origin);
  assert.ok(u.pathname.startsWith(path));
  const name=u.pathname.slice(path.length),raw=content.get(name);
  assert.ok(raw,"Unexpected file: "+name);
  requests.push(name);
  return new Response(tamper(name,raw)??raw,{status:200});
 };
 vm.runInNewContext(js,{window,document,fetch,crypto:webcrypto,location:{origin},
   URL,Blob,Response,DecompressionStream,TextEncoder,TextDecoder,Uint8Array},
   {timeout:5000});
 return {window,requests};
}
test("annual BTC and three-month DOT share lazy source and period changes do not fetch",async()=>{
 const f=fixtures();
 assert.deepEqual(f.requests,[]);
 const h=f.window.SevenHourlyHistory;
 const btc=await h.loadOne("bitcoin");
 assert.equal(h.selectPeriod(btc,"60j").rows.length,1440);
 assert.equal(h.selectPeriod(btc,"90j").rows.length,2160);
 assert.equal(h.selectPeriod(btc,"1an").rows.length,8760);
 assert.equal(h.selectPeriod(btc,"Max").rows.length,8760);
 assert.equal(h.selectPeriod(btc,"Max").maxIsAllTime,false);
 await h.loadOne("bitcoin");
 assert.deepEqual(f.requests,["index.json","bitcoin-hourly.json.gz"]);
 const dot=await h.loadOne("polkadot");
 assert.equal(h.selectPeriod(dot,"90j").rows.length,2160);
 assert.throws(()=>h.selectPeriod(dot,"1an"),/Historique 1an absent/);
 assert.deepEqual(f.requests,["index.json","bitcoin-hourly.json.gz","polkadot-hourly.json.gz"]);
});
test("modified compressed historical price data is rejected by SHA-256",async()=>{
 const f=fixtures((name,raw)=>{
  if(name==="bitcoin-hourly.json.gz"){
   const altered=Buffer.from(raw);altered[9]^=1;return altered;
  }
 });
 await assert.rejects(f.window.SevenHourlyHistory.loadOne("bitcoin"),/SHA-256/);
});
test("USDT cannot be confused with USD in source index",async()=>{
 const f=fixtures((name,raw)=>{
  if(name==="index.json"){
   const obj=JSON.parse(raw);obj.quote="USD";
   return Buffer.from(JSON.stringify(obj));
  }
 });
 await assert.rejects(f.window.SevenHourlyHistory.index(),/Contrat de séries/);
});
test("canonical vault carries both short and annual periods with no separate page",()=>{
 const html=fs.readFileSync("public/agent_crypto_erith_ia/administrator/historical-vault.html","utf8");
 const legacy=fs.readFileSync("public/agent_crypto_erith_ia/administrator/historical-archive-reader.html","utf8");
 for(const value of ["24h","7j","30j","60j","90j","1an","Max"]){
  assert.match(html,new RegExp('<option value="'+value+'"'));
 }
 assert.match(html,/js\/shared-hourly-history\.js/);
 assert.match(html,/id="shared-month-reader"/);
 assert.doesNotMatch(legacy,/shared-hourly-history/);
});
