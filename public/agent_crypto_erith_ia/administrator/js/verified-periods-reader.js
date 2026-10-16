/* Seven Heaven — seven certified historical windows, in the ONE existing Coffre.
 * Uses GitHub Pages only; no Trader/Interface/IndexedDB writes and no live prices.
 * Distinct Binance Spot USDT OHLCV. Max is materialized history, not all-time.
 */
(() => {
"use strict";
const root=new URL("../../data/historical_archive_prototype/verified_periods/",document.currentScript.src);
const btcDeepRoot=new URL("../btc_max_integrated/",root);
const btcDailyRoot=new URL("../btc_native_daily_reconciliation/",root);
const pairs=Object.freeze({bitcoin:"BTCUSDT",ethereum:"ETHUSDT",binancecoin:"BNBUSDT",ripple:"XRPUSDT",solana:"SOLUSDT"});
const windows=Object.freeze({"24h":["1m",1440],"7j":["5m",2016],"30j":["1h",720],
  "60j":["1h",1440],"90j":["1h",2160],"1an":["1d",365],"Max":["1d",null]});
const steps=Object.freeze({"1m":60000,"5m":300000,"1h":3600000,"1d":86400000});
const cols="open_time_ms,open,high,low,close,base_volume,quote_volume,trade_count";
const shaPattern=/^[a-f0-9]{64}$/;
const need=(v,s)=>{if(!v)throw Error(s)};
let index=null,pendingIndex=null;
const cache=new Map(),pending=new Map();

async function digest(raw){
 const hash=await crypto.subtle.digest("SHA-256",raw);
 return Array.from(new Uint8Array(hash),c=>c.toString(16).padStart(2,"0")).join("");
}
async function read(filename,cap){
 need(filename==="index.json"||
   /^(?:bitcoin|ethereum|binancecoin|ripple|solana)-(?:24h|7j|30j|60j|90j|1an|Max)\.json\.gz$/.test(filename),
   "Fichier historique non autorisé");
 const url=new URL(filename,root);
 need(url.origin===location.origin&&url.pathname.startsWith(root.pathname),"Source hors du Coffre");
 const reply=await fetch(url.href,{credentials:"omit",redirect:"error",cache:"no-store"});
 need(reply.ok,"Archive HTTP "+reply.status+" : "+filename);
 const raw=await reply.arrayBuffer();
 need(raw.byteLength>0&&raw.byteLength<=cap,"Taille d'archive invalide");
 return raw;
}
async function readDeep(filename,cap){
 need(filename==="index.json"||filename==="bitcoin-Max.json.gz",
      "Fichier BTC source non autorisé");
 const url=new URL(filename,btcDeepRoot);
 need(url.origin===location.origin&&url.pathname.startsWith(btcDeepRoot.pathname),
      "Source profonde BTC hors du Coffre");
 const response=await fetch(url.href,{credentials:"omit",redirect:"error",cache:"no-store"});
 need(response.ok,"Historique BTC approfondi non publié : HTTP "+response.status);
 const raw=await response.arrayBuffer();
 need(raw.byteLength>0&&raw.byteLength<=cap,"Taille BTC profonde inattendue");
 return raw;
}
async function loadDeepBtc(){
 const rawManifest=await readDeep("index.json",250000);
 const meta=JSON.parse(new TextDecoder().decode(rawManifest));
 need(meta.schema==="seven.crypto.btc.integrated-max-index.v1"&&
      meta.asset_id==="bitcoin"&&meta.pair==="BTCUSDT"&&meta.quote==="USDT"&&
      meta.is_live===false&&meta.is_all_time===false&&
      meta.file==="bitcoin-Max.json.gz"&&
      Number.isInteger(meta.bytes)&&meta.bytes>0&&meta.bytes<=300000&&
      shaPattern.test(meta.sha256)&&
      meta.source_months>=101&&meta.complete_months>=80&&meta.partial_months>=21&&
      Number.isInteger(meta.bars)&&meta.bars>=3000&&
      meta.first_open_ms===Date.UTC(2018,4,1)&&
      meta.last_open_ms===Date.UTC(2026,8,30)&&
      Number.isInteger(meta.missing_days)&&meta.missing_days>=0&&
      Number.isInteger(meta.missing_source_minutes)&&meta.missing_source_minutes>=0&&
      Array.isArray(meta.gaps)&&
      Object.values(meta.source_catalog_sha256||{}).length===3&&
      Object.values(meta.source_catalog_sha256).every(v=>shaPattern.test(v)),
      "Index BTC Max 2018–2026 non certifié");
 const compressed=await readDeep(meta.file,300000);
 need(compressed.byteLength===meta.bytes&&
      await digest(compressed)===meta.sha256,
      "SHA-256 archive Max BTC intégrée incorrect");
 const plain=await new Response(new Blob([compressed]).stream()
              .pipeThrough(new DecompressionStream("gzip"))).text();
 need(new TextEncoder().encode(plain).byteLength<13000000,
      "Projection BTC profonde décompressée trop grande");
 const obj=JSON.parse(plain),rows=obj.rows;
 need(obj.schema==="seven.crypto.btc.integrated-max.v1"&&
      obj.asset_id==="bitcoin"&&obj.pair==="BTCUSDT"&&obj.quote==="USDT"&&
      obj.is_live===false&&obj.is_all_time===false&&
      obj.interval==="1d"&&obj.is_all_time===false&&
      obj.columns?.join(",")===cols&&
      obj.scope==="complete_and_qualified_partial_2018_2026"&&
      obj.source==="Binance Spot native monthly ZIPs, checked SHA-256"&&
      Array.isArray(rows)&&rows.length===meta.bars&&
      rows[0]?.[0]===meta.first_open_ms&&
      rows.at(-1)?.[0]===meta.last_open_ms&&
      Array.isArray(obj.source_months)&&obj.source_months.length===meta.source_months,
      "BTC Max profond ne correspond pas aux archives certifiées");
 let previous=null;
 for(const r of rows){
  need(Array.isArray(r)&&r.length===8&&r.every(Number.isFinite),
       "OHLCV BTC non numérique");
  const [t,o,h,l,close,base,quote,trades]=r;
  need(Number.isInteger(t)&&t%steps["1d"]===0&&
      (previous===null||t>previous)&&
      l>0&&l<=Math.min(o,close)&&Math.max(o,close)<=h&&
      base>=0&&quote>=0&&Number.isInteger(trades)&&trades>=0,
      "OHLCV ou chronologie BTC Max invalide");
  previous=t;
 }
 const computedGaps=listGaps(rows,steps["1d"]);
 need(JSON.stringify(computedGaps)===JSON.stringify(meta.gaps)&&
      JSON.stringify(computedGaps)===JSON.stringify(obj.gaps)&&
      computedGaps.reduce((sum,g)=>sum+g.missing_bars,0)===meta.missing_days,
      "Incohérence des interruptions BTC Max");
 const march=obj.source_months.find(m=>m.month==="2023-03");
 need(march?.type==="partial"&&march.native_rows===44560&&
      march.missing_source_minutes===80&&march.valid_daily_rows===30&&
      march.omitted_incomplete_days?.length===1&&
      march.omitted_incomplete_days[0].missing_minutes===80,
      "Mars 2023 ne conserve pas ses 30 journées vérifiées");
 return {data:{...obj,resolution:"1d",period:"Max",gaps:computedGaps},
         metadata:{scope:"certified-core5",integrated:true,
            source:"Binance Spot vérifié",pair:"BTCUSDT",quote:"USDT",
            complete_months:meta.complete_months,partial_months:meta.partial_months,
            missing_days:meta.missing_days,month:"2026-09",
            native_1m_count:525600},
         rows};
}
async function loadOfficialDailyBtc(){
 async function fetchNative(filename,maxBytes){
  need(filename==="index.json"||filename==="bitcoin-Max.json.gz",
       "Fichier BTC 1d non autorisé");
  const url=new URL(filename,btcDailyRoot);
  need(url.origin===location.origin&&url.pathname.startsWith(btcDailyRoot.pathname),
       "Archive journalière hors du Coffre");
  const response=await fetch(url.href,{credentials:"omit",redirect:"error",cache:"no-store"});
  need(response.ok,"Bougies Binance quotidiennes non publiées : HTTP "+response.status);
  const raw=await response.arrayBuffer();
  need(raw.byteLength>0&&raw.byteLength<=maxBytes,"Taille du Max quotidien incohérente");
  return raw;
 }
 const manifest=JSON.parse(new TextDecoder().decode(await fetchNative("index.json",180000)));
 const count=manifest.native_1d_recovered;
 need(manifest.schema==="seven.crypto.btc.native-1d-reconciliation-index.v1"&&
      manifest.asset_id==="bitcoin"&&manifest.pair==="BTCUSDT"&&manifest.quote==="USDT"&&
      manifest.is_live===false&&manifest.is_all_time===false&&
      manifest.file==="bitcoin-Max.json.gz"&&
      manifest.source_model==="different_native_1d_and_1m_provenance"&&
      manifest.reconciliation_policy==="official_native_1d_with_majority_source_corroboration_v2"&&
      Number.isInteger(manifest.original_bars)&&manifest.original_bars===3049&&
      Number.isInteger(count)&&count===26&&manifest.unresolved_count===0&&
      manifest.bars===3075&&manifest.missing_minutes_unchanged===5881&&
      Number.isInteger(manifest.bytes)&&manifest.bytes>0&&manifest.bytes<350000&&
      shaPattern.test(manifest.sha256)&&shaPattern.test(manifest.original_btc_max_sha256)&&
      manifest.first_open_ms===Date.UTC(2018,4,1)&&
      manifest.last_open_ms===Date.UTC(2026,8,30)&&
      Array.isArray(manifest.gaps)&&manifest.gaps.length===0&&
      Array.isArray(manifest.source_dates)&&manifest.source_dates.length===26&&
      manifest.source_dates.every(s=>s.status==="recovered"&&
             s.source?.pair==="BTCUSDT"&&s.source?.quote==="USDT"&&
             s.source?.interval==="1d"&&shaPattern.test(s.source?.zip_sha256)&&
             shaPattern.test(s.source?.checksum_sha256)),
      "Le registre BTC 1d complet n'est pas certifié (ne pas réutiliser l'ancien Max)");
 const zipped=await fetchNative(manifest.file,350000);
 need(zipped.byteLength===manifest.bytes&&await digest(zipped)===manifest.sha256,
      "Empreinte SHA-256 du nouveau Max Binance 1d incorrecte");
 const plain=await new Response(new Blob([zipped]).stream()
                  .pipeThrough(new DecompressionStream("gzip"))).text();
 need(new TextEncoder().encode(plain).byteLength<13000000,
      "Bougies BTC 1d décompressées trop volumineuses");
 const data=JSON.parse(plain),rows=data.rows;
 need(data.schema==="seven.crypto.btc.native-1d-reconciliation.v1"&&
      data.asset_id==="bitcoin"&&data.pair==="BTCUSDT"&&data.quote==="USDT"&&
      data.interval==="1d"&&data.is_live===false&&data.is_all_time===false&&
      data.scope==="qualified_1m_daily_plus_official_native_1d"&&
      data.source==="Binance Spot original verified 1m and native 1d"&&
      data.columns?.join(",")===cols&&
      data.native_1m_gaps_preserved===true&&
      data.original_btc_max_sha256===manifest.original_btc_max_sha256&&
      Array.isArray(rows)&&rows.length===manifest.bars&&
      rows[0]?.[0]===manifest.first_open_ms&&
      rows.at(-1)?.[0]===manifest.last_open_ms&&
      Array.isArray(data.native_1d_overrides)&&data.native_1d_overrides.length===26,
      "Le contenu Binance 1d ne correspond pas à son manifeste");
 let previous=null;
 for(const r of rows){
  need(Array.isArray(r)&&r.length===8&&r.every(Number.isFinite),
       "Une bougie native quotidienne est non numérique");
  const [t,o,h,l,close,base,quote,trades]=r;
  need(Number.isInteger(t)&&t%steps["1d"]===0&&
       (previous===null||t===previous+steps["1d"])&&
       l>0&&l<=Math.min(o,close)&&Math.max(o,close)<=h&&
       base>=0&&quote>=0&&Number.isInteger(trades)&&trades>=0,
       "Max quotidien non continu ou OHLCV incorrect");
  previous=t;
 }
 need(JSON.stringify(data.gaps)===JSON.stringify(manifest.gaps)&&
      listGaps(rows,steps["1d"]).length===0,
      "La projection est interrompue malgré la certification native 1d");
 const existing=new Set(rows.map(r=>r[0])),added=new Set();
 for(const proof of data.native_1d_overrides){
  const ts=proof.open_time_ms;
  need(Number.isInteger(ts)&&existing.has(ts)&&!added.has(ts)&&
       proof.native_1d?.interval==="1d"&&
       proof.native_1d?.venue==="Binance Spot"&&
       proof.native_1d?.pair==="BTCUSDT"&&
       proof.native_1d?.quote==="USDT"&&
       proof.native_1d?.archive_url?.startsWith("https://data.binance.vision/data/spot/")&&
       shaPattern.test(proof.native_1d?.zip_sha256)&&
       shaPattern.test(proof.native_1d?.checksum_sha256)&&
       proof.native_1m_missing_minutes>0,
       "Une bougie native 1d n'a pas sa provenance officielle certifiée");
  added.add(ts);
 }
 return {data:{...data,resolution:"1d",period:"Max"},
  metadata:{scope:"certified-core5",integrated:true,native_daily:true,
    source:"Binance Spot 1m vérifié + 1d officiel",pair:"BTCUSDT",
    quote:"USDT",month:"2026-09",missing_days:0,
    missing_source_minutes:5881,native_1d_recovered:26,native_1m_count:525600},
  rows};
}
function validIndex(j){
 need(j?.schema==="seven.crypto.verified-period-index"&&
   j.quote==="USDT"&&j.is_live===false&&j.is_all_time===false&&
   j.source==="Binance Spot native verified 1m ZIPs"&&
   j.core_assets===5&&j.periods_per_asset===7&&j.assets?.length===5,
   "Catalogue Top 5 non certifié");
 const seen=new Set();
 for(const a of j.assets){
  need(Object.hasOwn(pairs,a.id)&&!seen.has(a.id)&&
    a.pair===pairs[a.id]&&a.quote==="USDT"&&
    a.verified_closed_months===12&&a.verified_native_minutes===525600&&
    a.first_month==="2025-10"&&a.last_month==="2026-09"&&
    a.max_scope==="materialized_calendar_year_shards_not_all_time"&&
    a.periods?.length===7,"Identité historique ou couverture incorrecte");
  seen.add(a.id);
  const periods=new Set();
  for(const p of a.periods){
   const wanted=windows[p.period];
   need(wanted&&!periods.has(p.period)&&
     p.file===a.id+"-"+p.period+".json.gz"&&p.resolution===wanted[0]&&
     (wanted[1]===null?p.bars>=365:p.bars===wanted[1])&&
     Number.isInteger(p.start_ms)&&Number.isInteger(p.end_exclusive_ms)&&
     p.end_exclusive_ms>p.start_ms&&p.end_exclusive_ms===Date.UTC(2026,9,1)&&
     Number.isInteger(p.bytes)&&p.bytes>0&&p.bytes<=200000&&
     shaPattern.test(p.sha256)&&Number.isInteger(p.gaps)&&p.gaps>=0&&
     (p.period==="Max"||p.gaps===0)&&
     Array.isArray(p.source_projections)&&p.source_projections.length>0&&
     p.source_projections.every(s=>shaPattern.test(s)),
     "Manifeste de période incorrect");
   periods.add(p.period);
  }
 }
 need(seen.size===5,"Univers pilote incomplet");
 return j;
}
async function getIndex(){
 if(index)return index;
 if(!pendingIndex)pendingIndex=(async()=>{
   need(crypto?.subtle&&typeof DecompressionStream==="function",
     "Firefox doit prendre en charge HTTPS, SHA-256 et gzip");
   const raw=await read("index.json",250000);
   return index=validIndex(JSON.parse(new TextDecoder().decode(raw)));
 })().catch(err=>{pendingIndex=null;throw err});
 return pendingIndex;
}
function listGaps(rows,ms){
 const gaps=[];
 for(let i=1;i<rows.length;i++){
  if(rows[i][0]!==rows[i-1][0]+ms)gaps.push({
    start_ms:rows[i-1][0]+ms,end_exclusive_ms:rows[i][0],
    missing_bars:(rows[i][0]-rows[i-1][0])/ms-1
  });
 }
 return gaps;
}
function validate(obj,meta,a){
 const [resolution,n]=windows[meta.period],step=steps[resolution];
 need(obj?.schema==="seven.crypto.verified-period-projection"&&
    obj.asset_id===a.id&&obj.pair===a.pair&&
    obj.quote==="USDT"&&obj.is_live===false&&obj.is_all_time===false&&
    obj.period===meta.period&&obj.resolution===resolution&&
    obj.columns?.join(",")===cols&&
    obj.start_ms===meta.start_ms&&
    obj.end_exclusive_ms===meta.end_exclusive_ms&&
    obj.last_source_month==="2026-09"&&
    obj.source==="Binance Spot original checked 1m monthly ZIP"&&
    obj.scope===(meta.period==="Max"?"materialized_verified_history":
                "last_verified_closed_archive_window")&&
    Array.isArray(obj.native_source_months)&&obj.native_source_months.length>=12&&
    Array.isArray(obj.source_projection_sha256)&&
    obj.source_projection_sha256.join(",")===meta.source_projections.join(","),
    "Provenance ou période non conforme");
 const rows=obj.rows;
 need(Array.isArray(rows)&&rows.length===meta.bars&&
   (n===null||rows.length===n)&&
   rows[0]?.[0]===meta.start_ms&&
   rows.at(-1)?.[0]+step===meta.end_exclusive_ms,
   "Bougies ou bornes UTC absentes");
 let last=null;
 for(const r of rows){
  need(Array.isArray(r)&&r.length===8&&r.every(Number.isFinite),
      "Bougie OHLCV non numérique");
  const [t,o,h,l,c,base,quote,trades]=r;
  need(Number.isInteger(t)&&t%step===0&&
    (last===null||t>last)&&
    (meta.period==="Max"||last===null||t===last+step)&&
    l>0&&l<=Math.min(o,c)&&Math.max(o,c)<=h&&
    base>=0&&quote>=0&&Number.isInteger(trades)&&trades>=0,
    "Valeur, volume, transaction ou chronologie invalide");
  last=t;
 }
 const found=listGaps(rows,step);
 need(JSON.stringify(obj.gaps)===JSON.stringify(found)&&found.length===meta.gaps,
   "Lacunes Max absentes ou différentes du registre");
 return {data:obj,metadata:{...a,...meta,month:a.last_month,
  native_1m_count:a.verified_native_minutes,source:"Binance Spot vérifié",
  scope:"certified-core5"},rows};
}
function isPilot(id){return Object.hasOwn(pairs,id)}
async function load(id,period){
 need(isPilot(id)&&Object.hasOwn(windows,period),"Actif ou période non certifiés Top 5");
 const key=id+"/"+period;
 if(cache.has(key)){
  const hit=cache.get(key);cache.delete(key);cache.set(key,hit);return hit;
 }
 if(pending.has(key))return pending.get(key);
 const work=(async()=>{
  let result;
  if(id==="bitcoin"&&period==="Max"){
   // Fail closed: the rebuilt 3,075-day Binance-native daily series is
   // the ONLY accepted BTC Max. Never display obsolete 1,795/3,049-day Max.
   result=await loadOfficialDailyBtc();
  }else{
   const a=(await getIndex()).assets.find(x=>x.id===id);
   need(!!a,"Identité non indexée");
   const meta=a.periods.find(x=>x.period===period);
   need(!!meta,"Période non publiée");
   const compressed=await read(meta.file,200000);
   need(compressed.byteLength===meta.bytes&&await digest(compressed)===meta.sha256,
        "Empreinte SHA-256 du Coffre incorrecte");
   const plain=await new Response(new Blob([compressed]).stream()
             .pipeThrough(new DecompressionStream("gzip"))).text();
   need(new TextEncoder().encode(plain).byteLength<=8000000,
        "Projection décompressée trop grande");
   result=validate(JSON.parse(plain),meta,a);
  }
  cache.set(key,result);
  if(cache.size>8)cache.delete(cache.keys().next().value);
  return result;
 })().finally(()=>pending.delete(key));
 pending.set(key,work);return work;
}
window.SevenVerifiedPeriods=Object.freeze({index:getIndex,load,isPilot,windows});
})();
