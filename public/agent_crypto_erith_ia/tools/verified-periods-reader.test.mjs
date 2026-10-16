import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {webcrypto,createHash} from "node:crypto";
import {gzipSync} from "node:zlib";

const moduleJS=fs.readFileSync(
 "public/agent_crypto_erith_ia/administrator/js/verified-periods-reader.js","utf8");
const commonJS=fs.readFileSync(
 "public/agent_crypto_erith_ia/administrator/js/shared-historical-view.js","utf8");
const origin="https://blueazur-hub.github.io";
const prefix="/erith-ia-memory/public/agent_crypto_erith_ia/data/historical_archive_prototype/";
const end=Date.UTC(2026,9,1),day=86400000;
const hash=bytes=>createHash("sha256").update(bytes).digest("hex");
const pairs={bitcoin:"BTCUSDT",ethereum:"ETHUSDT",binancecoin:"BNBUSDT",
 ripple:"XRPUSDT",solana:"SOLUSDT"};
const periods={"24h":["1m",1440,60000],"7j":["5m",2016,300000],
 "30j":["1h",720,3600000],"60j":["1h",1440,3600000],
 "90j":["1h",2160,3600000],"1an":["1d",365,day],"Max":["1d",370,day]};
function fixture(){
 const blobs=new Map(),assets=[],before={},gaps=(rows,step)=>{
  const out=[];
  for(let i=1;i<rows.length;i++)if(rows[i][0]!==rows[i-1][0]+step)
   out.push({start_ms:rows[i-1][0]+step,end_exclusive_ms:rows[i][0],
             missing_bars:(rows[i][0]-rows[i-1][0])/step-1});
  return out;
 };
 for(const [id,pair] of Object.entries(pairs)){
  const metadata={id,pair,quote:"USDT",verified_closed_months:12,
   verified_native_minutes:525600,first_month:"2025-10",last_month:"2026-09",
   max_scope:"materialized_calendar_year_shards_not_all_time",periods:[]};
  for(const [period,[interval,count,step]] of Object.entries(periods)){
   const excluded=period==="Max"?new Set([end-100*day]):new Set();
   const rows=[];
   // 370 rows over 371 days for Max; one absent date must be declared.
   for(let i=period==="Max"?count:count;i>0;i--){
    const timestamp=end-i*step-(period==="Max"&&i>=100?day:0);
    if(excluded.has(timestamp))continue;
    rows.push([timestamp,100,104,99,101,2,200,3]);
   }
   if(period==="Max"){
    // Preserve one explicit discontinuity without changing end and count.
    rows.length=0;
    for(let i=370;i>=0;i--){if(i!==100)rows.push([end-(i+1)*day,100,104,99,101,2,200,3]);}
    // First and last times do not matter beyond their consistency with metadata.
   }
   const missing=gaps(rows,step),projections=period==="Max"?["a".repeat(64)]:
       ["b".repeat(64),"c".repeat(64)];
   const data={
    schema:"seven.crypto.verified-period-projection",asset_id:id,pair,
    quote:"USDT",is_live:false,period,resolution:interval,
    columns:["open_time_ms","open","high","low","close","base_volume","quote_volume","trade_count"],
    is_all_time:false,scope:period==="Max"?"materialized_verified_history":"last_verified_closed_archive_window",
    source:"Binance Spot original checked 1m monthly ZIP",
    last_source_month:"2026-09",native_source_months:Array.from({length:12},(_,i)=>({month:i<3?"2025-"+(10+i):"2026-"+String(i-2).padStart(2,"0")})),
    source_projection_sha256:projections,start_ms:rows[0][0],
    end_exclusive_ms:rows.at(-1)[0]+step,gaps:missing,rows
   };
   const filename=id+"-"+period+".json.gz";
   const compressed=gzipSync(Buffer.from(JSON.stringify(data)));
   blobs.set("verified_periods/"+filename,compressed);
   metadata.periods.push({period,resolution:interval,file:filename,
    sha256:hash(compressed),bytes:compressed.length,bars:rows.length,
    start_ms:data.start_ms,end_exclusive_ms:data.end_exclusive_ms,gaps:missing.length,
    source_projections:projections});
   before[id+"/"+period]=data;
  }
  assets.push(metadata);
 }
 const index={schema:"seven.crypto.verified-period-index",quote:"USDT",
  is_live:false,is_all_time:false,source:"Binance Spot native verified 1m ZIPs",
  scope:"12 verified closed months plus available annual shards",
  core_assets:5,periods_per_asset:7,assets};
 blobs.set("verified_periods/index.json",Buffer.from(JSON.stringify(index)));
 // Published deep-BTC source fixture: 2018-05..2026-09, 3,049 true daily
 // observations, one discontinuity for 24 March 2023 and 25 earlier days.
 const first=Date.UTC(2018,4,1),missing=new Set([
  ...Array.from({length:25},(_,i)=>Date.UTC(2018,5,1+i)),
  Date.UTC(2023,2,24)
 ]);
 const deepRows=[];
 for(let t=first;t<end;t+=day){
  if(!missing.has(t))deepRows.push([t,100,105,99,101,2,201,3]);
 }
 assert.equal(deepRows.length,3049);
 const deepGaps=gaps(deepRows,day);
 const sourceMonths=[];
 for(let y=2018;y<=2026;y++)for(let month=1;month<=12;month++){
  const d=Date.UTC(y,month-1,1);
  if(d<first||d>=end)continue;
  const iso=y+"-"+String(month).padStart(2,"0");
  const partial=(iso==="2023-03"||sourceMonths.filter(x=>x.type==="partial").length<20);
  sourceMonths.push({month:iso,type:partial?"partial":"complete",
   source_sha256:"a".repeat(64),native_rows:partial?44560:44640,
   ...(iso==="2023-03"?{missing_source_minutes:80,valid_daily_rows:30,
    omitted_incomplete_days:[{day_ms:Date.UTC(2023,2,24),observed_minutes:1360,missing_minutes:80}]}:{})});
 }
 assert.equal(sourceMonths.length,101);
 const deep={schema:"seven.crypto.btc.integrated-max.v1",asset_id:"bitcoin",
  pair:"BTCUSDT",quote:"USDT",is_live:false,is_all_time:false,
  source:"Binance Spot native monthly ZIPs, checked SHA-256",
  interval:"1d",scope:"complete_and_qualified_partial_2018_2026",
  columns:["open_time_ms","open","high","low","close","base_volume","quote_volume","trade_count"],
  first_open_ms:first,last_open_ms:end-day,
  gaps:deepGaps,source_months:sourceMonths,rows:deepRows};
 const deepZip=gzipSync(Buffer.from(JSON.stringify(deep)));
 const deepMeta={schema:"seven.crypto.btc.integrated-max-index.v1",
  asset_id:"bitcoin",pair:"BTCUSDT",quote:"USDT",is_live:false,is_all_time:false,
  file:"bitcoin-Max.json.gz",bytes:deepZip.length,sha256:hash(deepZip),bars:3049,
  first_open_ms:first,last_open_ms:end-day,source_months:101,
  complete_months:80,partial_months:21,missing_days:26,
  missing_source_minutes:5881,gaps:deepGaps,
  source_catalog_sha256:{full:"b".repeat(64),partial:"c".repeat(64),
    annual:"d".repeat(64)}};
 blobs.set("btc_max_integrated/index.json",Buffer.from(JSON.stringify(deepMeta)));
 blobs.set("btc_max_integrated/bitcoin-Max.json.gz",deepZip);
 // Synthetic fixture for tests ONLY. Production prices originate exclusively
 // from verified Binance official 1d ZIPs, not from this mock test file.
 const nativeRows=[];
 for(let t=first;t<end;t+=day)nativeRows.push([t,100,105,99,101,2,201,3]);
 const recovered=[...missing].sort((a,b)=>a-b).map(ts=>({
    open_time_ms:ts,date:new Date(ts).toISOString().slice(0,10),
    native_1d:{interval:"1d",venue:"Binance Spot",pair:"BTCUSDT",
      quote:"USDT",archive_url:"https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1d/BTCUSDT-1d-2018-06.zip",
      checksum_url:"https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1d/BTCUSDT-1d-2018-06.zip.CHECKSUM",
      zip_sha256:"d".repeat(64),checksum_sha256:"e".repeat(64)},
    corroborated_days:20,matching_days:20,mismatched_reference_days:[],
    native_1m_missing_minutes:80
 }));
 const native={schema:"seven.crypto.btc.native-1d-reconciliation.v1",
    asset_id:"bitcoin",pair:"BTCUSDT",quote:"USDT",interval:"1d",
    is_live:false,is_all_time:false,
    scope:"qualified_1m_daily_plus_official_native_1d",
    columns:deep.columns,
    source:"Binance Spot original verified 1m and native 1d",
    native_1m_gaps_preserved:true,rows:nativeRows,
    native_1d_overrides:recovered,gaps:[],
    original_btc_max_sha256:deepMeta.sha256};
 const nativeZip=gzipSync(Buffer.from(JSON.stringify(native)));
 const nativeMeta={schema:"seven.crypto.btc.native-1d-reconciliation-index.v1",
    asset_id:"bitcoin",pair:"BTCUSDT",quote:"USDT",
    is_live:false,is_all_time:false,
    file:"bitcoin-Max.json.gz",bytes:nativeZip.length,sha256:hash(nativeZip),
    bars:3075,original_bars:3049,native_1d_recovered:26,unresolved_count:0,
    unresolved_dates:[],missing_minutes_unchanged:5881,
    first_open_ms:first,last_open_ms:end-day,gaps:[],
    source_catalog_sha256:{full:"a".repeat(64),partial:"b".repeat(64)},
    original_btc_max_sha256:deepMeta.sha256,
    source_dates:recovered.map(p=>({date:p.date,open_time_ms:p.open_time_ms,
       status:"recovered",source:p.native_1d})),
    source_model:"different_native_1d_and_1m_provenance",
    reconciliation_policy:"official_native_1d_with_majority_source_corroboration_v2"};
 blobs.set("btc_native_daily_reconciliation/index.json",Buffer.from(JSON.stringify(nativeMeta)));
 blobs.set("btc_native_daily_reconciliation/bitcoin-Max.json.gz",nativeZip);
 return {blobs,index,before,deep,deepMeta,native,nativeMeta};
}
function harness(modifier=null,withCommon=false){
 const fx=fixture(), requests=[],nodes=new Map(),window={},events={};
 const noop=()=>{};
 const ctx={fillRect:noop,beginPath:noop,moveTo:noop,lineTo:noop,stroke:noop,fillText:noop,clearRect:noop};
 function element(id){
  if(nodes.has(id))return nodes.get(id);
  const handlers={};
  const obj={id,value:id==="shared-asset"?"bitcoin":id==="shared-period"?"30j":"candles",
   width:1100,height:370,textContent:"",disabled:false,children:[],open:false,
   append(...x){this.children.push(...x)},
   replaceChildren(...x){this.children=[...x]},
   addEventListener(n,f){handlers[n]=f},dispatch(n,data){return handlers[n]?.(data)},
   getContext:()=>ctx,getBoundingClientRect:()=>({left:0,width:1100}),
   scrollIntoView:noop};
  nodes.set(id,obj);return obj;
 }
 const document={
  currentScript:{src:origin+prefix.replace("data/historical_archive_prototype/","administrator/js/")+"verified-periods-reader.js"},
  getElementById:element,
  createElement:tag=>element(tag+Math.random()),
  addEventListener(n,f){events[n]=f}
 };
 if(withCommon){
  const monthly={schema:"aerith.public.ohlcv.shared.monthly-index.v1",
    source:"Binance Spot official monthly 1m ZIPs",
    quote:"USDT",scope:"latest_verified_closed_month",is_live:false,max_is_all_time:false,
    archived_assets:5,assets:fx.index.assets.map((a,i)=>({
      id:a.id,rank:i+1,name:a.id,symbol:a.pair.slice(0,-4),pair:a.pair,
      month:"2026-09",file:a.id+".json.gz",release:"crypto-spot-bulk-2026-09-1m",
      source_zip_sha256:"a".repeat(64),sha256:"a".repeat(64),bytes:12000,
      native_1m_count:43200,series_counts:{"1m":1440,"5m":8640,"1h":720}
    }))};
  fx.blobs.set("shared_monthly_views/index.json",Buffer.from(JSON.stringify(monthly)));
 }
 async function fetchMock(u){
  const parsed=new URL(u),path=parsed.pathname;
  assert.equal(parsed.origin,origin);
  assert.ok(path.startsWith(prefix));
  const key=path.slice(prefix.length);
  requests.push(key);
  if(withCommon&&key==="bitget_verified_views/index.json")return new Response("",{status:404});
  let bytes=fx.blobs.get(key);
  assert.ok(bytes,"Unexpected remote fetch "+key);
  bytes=modifier?.(key,bytes,fx)??bytes;
  return new Response(bytes,{status:200});
 }
 const scope={window,document,fetch:fetchMock,location:{origin},crypto:webcrypto,
   URL,Response,Blob,TextDecoder,TextEncoder,DecompressionStream,Uint8Array,
   Intl,Date,Math,Number,Array,Object,Set,Map,console};
 vm.runInNewContext(moduleJS,scope,{timeout:5000});
 if(withCommon){
  document.currentScript.src=origin+"/erith-ia-memory/public/agent_crypto_erith_ia/administrator/js/shared-historical-view.js";
  vm.runInNewContext(commonJS,scope,{timeout:5000});
 }
 return {window,requests,fx,node:element,events};
}
test("seven windows across five original-source-qualified market identities",async()=>{
 const x=harness(),catalog=await x.window.SevenVerifiedPeriods.index();
 assert.equal(catalog.core_assets,5);
 assert.equal(catalog.assets.length,5);
 for(const id of Object.keys(pairs))for(const period of Object.keys(periods)){
  const result=await x.window.SevenVerifiedPeriods.load(id,period);
  assert.equal(result.rows.length,id==="bitcoin"&&period==="Max"?3075:periods[period][1]);
  assert.equal(result.data.quote,"USDT");
  assert.equal(result.data.pair,pairs[id]);
  assert.equal(result.data.gaps.length,id==="bitcoin"&&period==="Max"?0:period==="Max"?1:0);
 }
 assert.equal(x.requests.length,37);
 await x.window.SevenVerifiedPeriods.load("solana","Max");
 assert.equal(x.requests.length,37,"Last period remains cached");
 assert.ok(x.requests.includes("btc_native_daily_reconciliation/bitcoin-Max.json.gz"));
 assert.ok(!x.requests.includes("btc_max_integrated/bitcoin-Max.json.gz"));
 assert.ok(!x.requests.includes("verified_periods/bitcoin-Max.json.gz"));
});
test("SHA-256 tampering refuses display even for plausible OHLCV",async()=>{
 const x=harness((filename,raw)=>{
  if(filename==="verified_periods/bitcoin-24h.json.gz"){
   const altered=Buffer.from(raw);altered[8]^=1;return altered;
  }
 });
 await assert.rejects(x.window.SevenVerifiedPeriods.load("bitcoin","24h"),/SHA-256/);
});
test("USDT source identity cannot become USD in an otherwise valid catalog",async()=>{
 const x=harness((filename,raw)=>{
  if(filename==="verified_periods/index.json"){
   const altered=JSON.parse(raw);altered.quote="USD";
   return Buffer.from(JSON.stringify(altered));
  }
 });
 await assert.rejects(x.window.SevenVerifiedPeriods.index(),/Catalogue Top 5/);
});
test("missing gap must be declared even with valid gzip checksum",async()=>{
 const x=harness((filename,raw,fx)=>{
  if(filename==="verified_periods/index.json"){
   const j=JSON.parse(raw);
   const a=j.assets.find(a=>a.id==="solana").periods.find(p=>p.period==="Max");
   const mutated={...fx.before["solana/Max"],gaps:[]};
   const zip=gzipSync(Buffer.from(JSON.stringify(mutated)));
   fx.blobs.set("verified_periods/solana-Max.json.gz",zip);
   a.sha256=hash(zip);a.bytes=zip.length;
   return Buffer.from(JSON.stringify(j));
  }
 });
 await assert.rejects(x.window.SevenVerifiedPeriods.load("solana","Max"),/Lacunes Max/);
});
test("single Coffre HTML mounts certified source ahead of legacy reader",()=>{
 const html=fs.readFileSync("public/agent_crypto_erith_ia/administrator/historical-vault.html","utf8");
 const verified=html.indexOf('src="./js/verified-periods-reader.js"');
 const legacy=html.indexOf('src="./js/shared-historical-view.js"');
 assert.ok(verified>0&&legacy>verified);
 assert.match(html,/id="shared-style"/);
 assert.match(html,/id="shared-hover"/);
 assert.match(html,/id="shared-curve"/);
 assert.doesNotMatch(html,/id="second-vault-reader"/);
});
test("UI changing pilot and period routes to verified archive and renders OHLCV table",async()=>{
 const x=harness(null,true);
 const select=x.node("shared-asset");
 // The legacy reader fills common select asynchronously; wait for init.
 for(let i=0;i<100&&select.children.length!==5;i++)
  await new Promise(resolve=>setImmediate(resolve));
 assert.equal(select.children.length,5);
 select.value="bitcoin";
 x.node("shared-period").value="1an";
 x.node("shared-read").dispatch("click");
 for(let i=0;i<500&&!x.node("shared-status").textContent.includes("SHA-256 vérifié");i++)
  await new Promise(resolve=>setTimeout(resolve,5));
 assert.match(x.node("shared-status").textContent,/SHA-256 vérifié/);
 assert.match(x.node("shared-status").textContent,/365 bougies 1d/);
 assert.match(x.node("shared-source").textContent,/Max inclut d’autres partitions annuelles archivées/);
 assert.equal(x.node("shared-table").children.length,9);
 assert.ok(x.requests.includes("verified_periods/bitcoin-1an.json.gz"));
 x.node("shared-period").value="Max";
 x.node("shared-period").dispatch("change");
 for(let i=0;i<500&&!x.node("shared-source").textContent.includes("MAX QUOTIDIEN");i++)
  await new Promise(resolve=>setTimeout(resolve,5));
 assert.match(x.node("shared-status").textContent,/aucune lacune/);
 assert.match(x.node("shared-source").textContent,/26 bougies Binance Spot 1d natives/);
 assert.equal(x.node("shared-table").children.length,9);
});


test("Max explains the missing archive dates without making the user guess",async()=>{
 const x=harness(null,true);
 for(let i=0;i<100&&x.node("shared-asset").children.length!==5;i++)
  await new Promise(done=>setImmediate(done));
 x.node("shared-asset").value="bitcoin";
 x.node("shared-period").value="Max";
 x.node("shared-read").dispatch("click");
 for(let i=0;i<500&&!x.node("shared-status").textContent.includes("SHA-256 vérifié");i++)
  await new Promise(done=>setTimeout(done,5));
 assert.match(x.node("shared-status").textContent,/SHA-256 vérifié/);
 assert.match(x.node("shared-explanation").textContent,/VOUS REGARDEZ : BTCUSDT/);
 assert.match(x.node("shared-explanation").textContent,/Max/);
 assert.match(x.node("shared-gaps").textContent,/COUVERTURE 1 JOUR/);
 assert.match(x.node("shared-gaps").textContent,/5 881 minutes manquantes/);
 assert.doesNotMatch(x.node("shared-gaps").textContent,/Bande orange/);
 assert.match(x.node("shared-range").textContent,/3.?075 bougies visibles/);
 assert.equal(x.node("shared-prev").disabled,true);
 assert.equal(x.node("shared-next").disabled,true);
 x.node("shared-zoom-in").dispatch("click");
 assert.match(x.node("shared-range").textContent,/1.?537 bougies visibles/);
 assert.equal(x.node("shared-prev").disabled,false);
 x.node("shared-prev").dispatch("click");
 assert.equal(x.node("shared-next").disabled,false);
 x.node("shared-reset").dispatch("click");
 assert.match(x.node("shared-range").textContent,/3.?075 bougies visibles/);
 assert.equal(x.node("shared-next").disabled,true);
 const n=x.requests.length;
 x.node("shared-style").value="line";
 x.node("shared-style").dispatch("change");
 assert.equal(x.requests.length,n,"Changing display style must not refetch history");
});
test("legacy assets keep their prior reader and navigation stays disabled",()=>{
 const js=fs.readFileSync("public/agent_crypto_erith_ia/administrator/js/shared-historical-view.js","utf8");
 const html=fs.readFileSync("public/agent_crypto_erith_ia/administrator/historical-vault.html","utf8");
 assert.match(js,/navigationIds\.forEach\(id=>byId\(id\)\.disabled=true\)/);
 assert.match(js,/maxVolume=Math\.max\(\.\.\.groups\.map\(g=>g\.base\/g\.n\)/);
 for(const id of ["shared-explanation","shared-legend","shared-gaps","shared-range",
                  "shared-prev","shared-zoom-in","shared-zoom-out","shared-next","shared-reset"]){
  assert.ok(html.includes('id="'+id+'"'),"Missing user-facing control "+id);
 }
});

test("deep BTC SHA-256 tampering must block the new Max",async()=>{
 const x=harness((name,bytes)=>{
  if(name==="btc_native_daily_reconciliation/bitcoin-Max.json.gz"){
   const changed=Buffer.from(bytes);changed[8]^=1;return changed;
  }
 });
 await assert.rejects(x.window.SevenVerifiedPeriods.load("bitcoin","Max"),/SHA-256/);
});
test("old 1,795-day Max may never replace newly verified BTC source silently",async()=>{
 const x=harness((name,bytes)=>{
  if(name==="btc_native_daily_reconciliation/index.json"){
   const index=JSON.parse(bytes);index.bars=1795;
   return Buffer.from(JSON.stringify(index));
  }
 });
 await assert.rejects(x.window.SevenVerifiedPeriods.load("bitcoin","Max"),
  /Le registre BTC 1d complet n.est pas certifié/);
 assert.ok(!x.requests.includes("verified_periods/bitcoin-Max.json.gz"));
});
test("source-qualified partial March remains thirty certified days",async()=>{
 const x=harness();
 const a=await x.window.SevenVerifiedPeriods.load("bitcoin","Max");
 assert.equal(a.metadata.integrated,true);
 assert.equal(a.rows.length,3075);
 assert.equal(a.metadata.native_daily,true);
 const start=Date.UTC(2023,2,1),end=Date.UTC(2023,3,1);
 assert.equal(a.rows.filter(r=>r[0]>=start&&r[0]<end).length,31);
 assert.equal(a.data.gaps.length,0);
 assert.equal(a.data.native_1d_overrides.length,26);
 assert.equal(a.metadata.missing_source_minutes,5881);
});
