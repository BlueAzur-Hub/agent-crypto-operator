import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {gzipSync} from "node:zlib";
import {webcrypto,createHash} from "node:crypto";

const script=fs.readFileSync(
 "public/agent_crypto_erith_ia/administrator/js/shared-historical-view.js","utf8");
const url="https://blueazur-hub.github.io";
const root="/erith-ia-memory/public/agent_crypto_erith_ia/data/historical_archive_prototype/shared_monthly_views/";
const END=Date.UTC(2026,9,1),MIN=60000;
const sha=bytes=>createHash("sha256").update(bytes).digest("hex");
function createFixture(){
 const assets=[];
 const content=new Map();
 for(const [id,pair,tag,rank] of [
     ["bitcoin","BTCUSDT","crypto-spot-bulk-2026-09-1m",1],
     ["polkadot","DOTUSDT","crypto-spot-bulk-add-2026-09-1m-688070fa4d52",51]]){
  function series(step,count){
   return Array.from({length:count},(_,i)=>
    [END-(count-i)*step,100,102,99,101,1,101,2]);
  }
  const data={
   schema:"aerith.public.ohlcv.shared.monthly-projection.v1",
   asset_id:id,pair,month:"2026-09",quote:"USDT",
   source:"Binance Spot official monthly 1m ZIP",
   source_release:tag,source_zip_sha256:"a".repeat(64),
   scope:"latest_verified_closed_month",is_live:false,max_is_all_time:false,
   first_open_ms:END-30*86400000,last_open_ms:END-MIN,native_1m_count:43200,
   columns:["open_time_ms","open","high","low","close","base_volume","quote_volume","trade_count"],
   series:{"1m":series(MIN,1440),"5m":series(5*MIN,8640),"1h":series(60*MIN,720)}
  };
  const file=id+".json.gz",compressed=gzipSync(Buffer.from(JSON.stringify(data)));
  content.set(file,compressed);
  assets.push({id,rank,name:id,symbol:id.toUpperCase(),
   pair,month:"2026-09",file,release:tag,source_zip_sha256:"a".repeat(64),
   first_open_ms:data.first_open_ms,last_open_ms:data.last_open_ms,
   native_1m_count:43200,sha256:sha(compressed),bytes:compressed.length,
   series_counts:{"1m":1440,"5m":8640,"1h":720}});
 }
 const index={
  schema:"aerith.public.ohlcv.shared.monthly-index.v1",
  source:"Binance Spot official monthly 1m ZIPs",quote:"USDT",
  scope:"latest_verified_closed_month",is_live:false,max_is_all_time:false,
  archived_assets:2,assets
 };
 content.set("index.json",Buffer.from(JSON.stringify(index)));
 return {content,index};
}
function harness(change=()=>{},alternative=null){
 const fixture=createFixture();
 const requests=[],nodes=new Map(),window={};
 function element(id){
  if(nodes.has(id))return nodes.get(id);
  const events={};
  const el={id,value:id==="shared-asset"?"bitcoin":"30j",textContent:"",
   disabled:false,children:[],append(...a){this.children.push(...a)},
   replaceChildren(...a){this.children=[...a]},
   addEventListener(n,fn){events[n]=fn},dispatch(n){return events[n]?.()},
   getContext(){return {fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}}}};
  nodes.set(id,el);return el;
 }
 const document={
  currentScript:{src:url+"/erith-ia-memory/public/agent_crypto_erith_ia/administrator/js/shared-historical-view.js"},
  getElementById:element,
  addEventListener(){},
  createElement:()=>element("created"+nodes.size)
 };
 const fetchMock=async href=>{
  const u=new URL(href);
  assert.equal(u.origin,url);
  if(alternative&&u.pathname.endsWith("/bitget_verified_views/index.json")){
   requests.push("bitget/index.json");
   return new Response(JSON.stringify(alternative),{status:200});
  }
  assert.ok(u.pathname.startsWith(root));
  const filename=u.pathname.slice(root.length),raw=fixture.content.get(filename);
  assert.ok(raw,"Unexpected archive: "+filename);
  requests.push(filename);
  return new Response(change(filename,raw)??raw,{status:200});
 };
 vm.runInNewContext(script,{
   window,document,fetch:fetchMock,URL,location:{origin:url},
   crypto:webcrypto,Blob,Response,DecompressionStream,TextDecoder,
   TextEncoder,Uint8Array
 },{timeout:5000});
 return {window,node:element,requests};
}
test("shared vault uses one remote projection per asset; all period changes are local",async()=>{
 const x=harness();
 const idx=await x.window.SevenSharedHistory.index();
 assert.equal(idx.archived_assets,2);
 assert.equal(x.requests.length,1);
 const first=await x.window.SevenSharedHistory.loadOne("bitcoin");
 const read=x.window.SevenSharedHistory.selectPeriod;
 assert.equal(read(first,"24h").rows.length,1440);
 assert.equal(read(first,"7j").rows.length,2016);
 assert.equal(read(first,"30j").rows.length,8640);
 assert.equal(read(first,"mois").rows.length,720);
 assert.equal(read(first,"mois").maxIsAllTime,false);
 await x.window.SevenSharedHistory.loadOne("bitcoin");
 assert.deepEqual(x.requests,["index.json","bitcoin.json.gz"]);
 const second=await x.window.SevenSharedHistory.loadOne("polkadot");
 assert.equal(read(second,"30j").pair,"DOTUSDT");
 assert.deepEqual(x.requests,["index.json","bitcoin.json.gz","polkadot.json.gz"]);
});
test("sha256 mismatch rejects a forged gzip before display",async()=>{
 const x=harness((filename,raw)=>{
  if(filename==="bitcoin.json.gz"){const r=Buffer.from(raw);r[6]^=1;return r;}
 });
 await assert.rejects(x.window.SevenSharedHistory.loadOne("bitcoin"),/SHA-256/);
});
test("wrong identity/quote is rejected even with intact compressed transport SHA",async()=>{
 const x=harness((filename,raw)=>{
  if(filename==="index.json"){
   const bad=JSON.parse(raw);bad.quote="USD";
   return Buffer.from(JSON.stringify(bad));
  }
 });
 await assert.rejects(x.window.SevenSharedHistory.index(),/Contrat d'index/);
});
test("missing minutes are not silently called a complete 30-day period",async()=>{
 const x=harness(),obj=await x.window.SevenSharedHistory.loadOne("bitcoin");
 const trimmed={data:{...obj.data,series:{...obj.data.series,
  "5m":obj.data.series["5m"].slice(300)}},metadata:obj.metadata};
 assert.throws(()=>x.window.SevenSharedHistory.selectPeriod(trimmed,"30j"),
   /ne contient pas 30j complets/);
});
test("single HTML vault, no generated sibling dashboard",()=>{
 const html=fs.readFileSync(
   "public/agent_crypto_erith_ia/administrator/historical-vault.html","utf8");
 const secondary=fs.readFileSync(
   "public/agent_crypto_erith_ia/administrator/historical-archive-reader.html","utf8");
 const slots=["top250-coverage","shared-month-reader","btc-year-lab","r6-archive-adapter","r7-btc-comparator","r9-compact"];
 const positions=slots.map(id=>html.indexOf('id="'+id+'"'));
 assert.ok(positions.every(p=>p>0));
 assert.ok(positions.every((p,i)=>i===0||p>positions[i-1]));
 assert.match(html,/src="\.\/js\/shared-historical-view\.js"/);
 assert.doesNotMatch(secondary,/id="shared-month-reader"/);
});


test("Bitget asset with no display name never shows undefined in shared dropdown",async()=>{
 const sample={
  schema:"aerith.public.ohlcv.verified-bitget-spot-month-views.v1",
  source:"Bitget Spot public native 1m API",quote:"USDT",
  not_exchange_signed:true,trade_count_available:false,archived_assets:1,
  assets:[{
   id:"cosmos",rank:75,symbol:"ATOM",pair:"ATOMUSDT",
   month:"2026-09",months:["2026-08","2026-09"],
   file:"cosmos-bitget-month.json.gz",
   release:"crypto-spot-bitget-2026-09-1m-cosmos",
   sha256:"a".repeat(64),source_zip_sha256:"b".repeat(64),
   bytes:12000,native_1m_count:43200,total_verified_1m_count:87840,
   series_counts:{"1m":1440,"5m":8640,"1h":720}
  }]
 };
 const x=harness(()=>{},sample);
 let options=[];
 for(let tries=0;tries<40;tries++){
  options=x.node("shared-asset").children;
  if(options.length===3)break;
  await new Promise(done=>setImmediate(done));
 }
 assert.equal(options.length,3);
 const atom=options.find(o=>o.value==="cosmos");
 assert.ok(atom,"Verified ATOM pair must be included in unified reader");
 assert.equal(atom.textContent,"#75 · ATOM (ATOMUSDT)");
 assert.doesNotMatch(atom.textContent,/undefined/);
 assert.match(x.node("shared-status").textContent,/3 cryptos disponibles/);
});
