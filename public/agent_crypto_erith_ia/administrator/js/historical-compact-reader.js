/* Seven Heaven R9 — isolated, read-only compact archive pilot.
 * Fetch ONE index + ONE selected gzip; do not modify R5/R6/R7 or live charts.
 */
(()=>{"use strict";
const urlRoot=new URL("../../data/historical_archive_prototype/compact_v1/",document.currentScript.src);
const NS="aerith.public.ohlcv.spot.compact.index.v1";
const BLOCK="aerith.public.ohlcv.spot.compact.series.v1";
const SPECS={"24h":[300000,"5m"],"7d":[3600000,"1h"],"30d":[14400000,"4h"]};
const COLS=["open_time_ms","open","high","low","close","base_volume","quote_volume","trade_count"];
let indexPromise=null;
function ok(cond,msg){if(!cond)throw Error(msg)}
function validnum(v){return typeof v==="number"&&Number.isFinite(v)}
async function read(path) {
 ok(typeof path==="string"&&
    (path==="index.json"||/^series\/[a-z0-9-]+_(24h|7d|30d)_[a-f0-9]{16}\.json\.gz$/.test(path)),
    "Chemin R9 interdit");
 const url=new URL(path,urlRoot);
 ok(url.origin===location.origin&&url.pathname.startsWith(urlRoot.pathname),"Archive externe refusée");
 const response=await fetch(url.href,{credentials:"omit",cache:"no-store",redirect:"error"});
 ok(response.ok,"Archive R9 HTTP "+response.status);
 const data=await response.arrayBuffer();
 ok(data.byteLength<=2000000,"Archive R9 trop volumineuse");
 return data;
}
async function index(){
 if(!indexPromise)indexPromise=(async()=>{
 const data=JSON.parse(new TextDecoder().decode(await read("index.json")));
 ok(data.schema===NS&&data.source==="Binance Spot"&&data.quote_asset==="USDT"&&
    data.status==="PILOT_SNAPSHOT_READ_ONLY","Index R9 non qualifié");
 ok(/^[a-f0-9]{64}$/i.test(data.source_index_sha256),"Empreinte R8 absente");
 ok(data.series_count===21&&Array.isArray(data.series)&&data.series.length===21,"21 séries attendues");
 ok(data.series.reduce((s,x)=>s+x.candles,0)===data.candles_total,"Comptage R9 non concordant");
 const seen=new Set();
 for(const entry of data.series){
  const key=entry.id+"|"+entry.period;
  ok(!seen.has(key),"Index R9 dupliqué");seen.add(key);
  const spec=SPECS[entry.period];
  ok(spec&&entry.interval===spec[1]&&/^[a-z0-9-]+$/.test(entry.id)
     &&/^[A-Z0-9]+USDT$/.test(entry.pair),"Série R9 non qualifiée");
  ok(Number.isInteger(entry.candles)&&entry.candles>0&&
    Number.isInteger(entry.first_open_ms)&&Number.isInteger(entry.last_open_ms)&&
    entry.candles===(entry.last_open_ms-entry.first_open_ms)/spec[0]+1,"Couverture temporelle R9 incohérente");
  ok(/^[a-f0-9]{64}$/i.test(entry.sha256)&&entry.file===
    "series/"+entry.id+"_"+entry.period+"_"+entry.sha256.slice(0,16)+".json.gz","Fichier bloc R9 incohérent");
 }
 return data;
 })().catch(e=>{indexPromise=null;throw e});
 return indexPromise;
}
// R10: re-check the tiny public catalog when a panel opens; no polling.
async function refreshIndex(){
 indexPromise=null;
 return listCoverage();
}
async function listCoverage(){
 const catalog=await index();
 return{source:catalog.source,quote:catalog.quote_asset,updatedAt:catalog.source_index_updated_at,
  sourceIndexSha256:catalog.source_index_sha256,total:catalog.candles_total,
  snapshot:true,coverage:catalog.series.map(({id,pair,period,interval,candles,first_open_ms,last_open_ms})=>
  ({id,pair,period,interval,candles,first_open_ms,last_open_ms}))};
}
async function readSeries({assetId,period}){
 ok(typeof assetId==="string"&&Object.hasOwn(SPECS,period),"Période R9 non qualifiée");
 const catalog=await index();
 const entry=catalog.series.find(x=>x.id===assetId&&x.period===period);
 ok(!!entry,"Aucune série R9 qualifiée");
 const compressed=await read(entry.file);
 ok(compressed.byteLength===entry.bytes,"Taille du bloc R9 invalide");
 const digest=await crypto.subtle.digest("SHA-256",compressed);
 const hex=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,"0")).join("");
 ok(hex===entry.sha256,"Empreinte SHA-256 du bloc R9 invalide");
 ok(typeof DecompressionStream==="function","Décompression gzip non disponible");
 const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
 const text=await new Response(stream).text();
 ok(new TextEncoder().encode(text).byteLength<=10000000,"Bloc décompressé excessif");
 const b=JSON.parse(text),spec=SPECS[period];
 ok(b.schema===BLOCK&&b.source==="Binance Spot"&&b.quote_asset==="USDT"&&
    b.id===assetId&&b.pair===entry.pair&&b.period===period&&b.interval===spec[1]&&
    b.candles===entry.candles&&b.first_open_ms===entry.first_open_ms&&
    b.last_open_ms===entry.last_open_ms&&JSON.stringify(b.columns)===JSON.stringify(COLS),"Bloc R9 incompatible");
 ok(Array.isArray(b.rows)&&b.rows.length===entry.candles,"Bloc R9 incomplet");
 let last=null;
 for(const row of b.rows){
  ok(Array.isArray(row)&&row.length===8&&row.every(validnum),"OHLCV R9 incorrect");
  const [t,o,h,l,c,v,q,n]=row;
  ok(Number.isInteger(t)&&t%spec[0]===0&&(last===null||t===last+spec[0])
   &&Number.isInteger(n)&&n>=0,"Chronologie R9 incorrecte");
  ok(l>0&&l<=Math.min(o,c)&&Math.max(o,c)<=h&&v>=0&&q>=0,"OHLCV R9 incohérent");
  last=t;
 }
 ok(b.rows[0][0]===entry.first_open_ms&&last===entry.last_open_ms,"Bornes R9 discordantes");
 return{metadata:{id:assetId,pair:entry.pair,period,interval:spec[1],quote:"USDT",
    source:"Binance Spot",sourceIndexUpdatedAt:catalog.source_index_updated_at,
    status:"VALIDATED_SNAPSHOT",isLive:false,graphConnected:false,points:entry.candles,
    firstOpenMs:entry.first_open_ms,lastOpenMs:entry.last_open_ms,
    downloadedArchives:1,readMode:"INDEX_PLUS_ONE_SERIES"},
  columns:COLS.slice(),candles:b.rows};
}
window.SevenCompactArchiveReader=Object.freeze({listCoverage,readSeries,refreshIndex});
})();