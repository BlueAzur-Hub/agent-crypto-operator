/* Seven Heaven · Trader-only long-period historical reader.
   Binance Spot USDT, verified immutable OHLCV; 60d may derive from verified 90d.
   No graph, Market, storage, timers, orders, or network except selected archive. */
(()=>{"use strict";
const ROOT=new URL("../data/historical_archive_prototype/universe/long-periods/",document.currentScript.src);
const INDEX="aerith.public.ohlcv.spot.long-periods.index.v1";
const BLOCK="aerith.public.ohlcv.spot.long-periods.block.v1";
const SPECS={"60d":["4h",14400000,360],"90d":["4h",14400000,540],"1y":["1d",86400000,365]};
const SHA=/^[a-f0-9]{64}$/;
let waiting=null;
function requireProof(ok,why){if(!ok)throw Error(why);}
async function sha256(raw){
 const digest=await crypto.subtle.digest("SHA-256",raw);
 return Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,"0")).join("");
}
async function request(path){
 requireProof(path==="index.json"||/^blocks\/[a-z0-9-]+_(90d|60d|1y)_[a-f0-9]{16}\.json\.gz$/.test(path),"Chemin période longue refusé");
 const url=new URL(path,ROOT);
 requireProof(url.origin===location.origin&&url.pathname.startsWith(ROOT.pathname),"Origine OHLCV interdite");
 const result=await fetch(url.href,{credentials:"omit",cache:path==="index.json"?"no-store":"force-cache",redirect:"error"});
 requireProof(result.ok,"Coffre long HTTP "+result.status);
 const bytes=await result.arrayBuffer();
 requireProof(bytes.byteLength>0&&bytes.byteLength<=(path==="index.json"?1500000:2000000),"Archive trop volumineuse");
 return bytes;
}
async function decode(bytes){
 requireProof(typeof DecompressionStream==="function","Décompression gzip indisponible");
 const inflated=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
 requireProof(inflated.byteLength<=10000000,"Archive longue décompressée trop volumineuse");
 return JSON.parse(new TextDecoder().decode(inflated));
}
function checkInfo(b,asset){
 const spec=SPECS[b?.period];
 requireProof(spec&&b.asset_id===asset.id&&b.pair===asset.pair&&b.interval===spec[0]&&
  b.candles===spec[2]&&Number.isSafeInteger(b.first_ms)&&Number.isSafeInteger(b.last_ms)&&
  b.first_ms%spec[1]===0&&b.last_ms===b.first_ms+(spec[2]-1)*spec[1]&&
  SHA.test(b.sha256)&&b.file==="blocks/"+asset.id+"_"+b.period+"_"+b.sha256.slice(0,16)+".json.gz",
  "Bloc historique long non qualifié");
}
async function catalog(){
 if(!waiting)waiting=(async()=>{
  const documentBytes=await request("index.json");
  const index=JSON.parse(new TextDecoder().decode(documentBytes));
  requireProof(index.schema===INDEX&&index.source==="Binance Spot"&&index.quote==="USDT"&&
   index.status==="VERIFIED_MANUAL_BACKFILL"&&index.max_status==="NOT_AVAILABLE_FROM_THIS_SNAPSHOT"&&
   Number.isSafeInteger(index.snapshotted_at_ms)&&index.snapshotted_at_ms>0&&
   Array.isArray(index.assets)&&index.assets.length>=24&&index.assets.length<=50&&
   Array.isArray(index.blocks)&&index.blocks.length>0&&
   index.verified_blocks===index.blocks.length,
   "Index longues périodes non qualifié");
  const assets=new Map();
  for(const a of index.assets){
   requireProof(typeof a.id==="string"&&/^[a-z0-9-]{2,100}$/.test(a.id)&&
    typeof a.symbol==="string"&&/^[A-Z0-9]{2,22}$/.test(a.symbol)&&
    a.pair===a.symbol+"USDT"&&!assets.has(a.id)&&
    a.long_periods&&typeof a.long_periods==="object",
    "Actif longue période non qualifié");
   assets.set(a.id,a);
  }
  const blocks=new Map();let total=0;
  for(const b of index.blocks){
   const a=assets.get(b.asset_id),key=b.asset_id+"|"+b.period;
   requireProof(a&&!blocks.has(key),"Bloc longue période inconnu ou dupliqué");
   checkInfo(b,a);
   requireProof(a.long_periods[b.period]?.status==="verified"&&b.last_ms<index.snapshotted_at_ms,
    "Bloc long sans preuve de couverture");
   blocks.set(key,b);total+=b.candles;
  }
  requireProof(total===index.verified_candles,"Comptage long invalide");
  for(const a of assets.values()){
   for(const period of Object.keys(SPECS)){
    const status=a.long_periods[period]?.status,key=a.id+"|"+period;
    if(status==="verified")requireProof(blocks.has(key),"Couverture non enregistrée");
    else requireProof(!blocks.has(key),"Bloc non qualifié par son actif");
    if(status==="derived_from_90d")requireProof(period==="60d"&&
     blocks.has(a.id+"|90d"),"Découpe 60j sans archive 90j");
   }
  }
  const coverage=[];
  for(const a of assets.values())for(const period of Object.keys(SPECS)){
   const s=SPECS[period],derived=period==="60d"&&a.long_periods[period]?.status==="derived_from_90d";
   const src=blocks.get(a.id+"|"+(derived?"90d":period));
   if(!src)continue;
   const count=derived?SPECS["60d"][2]:src.candles;
   coverage.push({id:a.id,pair:a.pair,period,interval:s[0],candles:count,
    first_open_ms:src.last_ms-(count-1)*s[1],last_open_ms:src.last_ms,
    derived_from_90d:derived});
  }
  return{index,assets,blocks,coverage};
 })().catch(error=>{waiting=null;throw error;});
 return waiting;
}
async function listCoverage(){
 const c=await catalog();
 return{snapshot:true,quote:"USDT",archiveFamily:"long-periods",source:"Binance Spot",
  updatedAt:new Date(c.index.snapshotted_at_ms).toISOString(),coverage:c.coverage};
}
function refreshIndex(){waiting=null;return listCoverage();}
async function readSeries({assetId,period}){
 requireProof(typeof assetId==="string"&&Object.hasOwn(SPECS,period),"Période longue inconnue");
 const c=await catalog(),asset=c.assets.get(assetId),status=asset?.long_periods[period]?.status;
 const derived=period==="60d"&&status==="derived_from_90d";
 requireProof(status==="verified"||derived,"Période longue indisponible pour cet actif");
 const meta=c.blocks.get(assetId+"|"+(derived?"90d":period));
 requireProof(meta,"Archive historique longue absente");
 const packed=await request(meta.file);
 requireProof(await sha256(packed)===meta.sha256,"SHA-256 de la période longue invalide");
 const blob=await decode(packed),s=SPECS[meta.period];
 requireProof(blob.schema===BLOCK&&blob.source==="Binance Spot"&&blob.quote==="USDT"&&
  blob.asset_id===assetId&&blob.pair===meta.pair&&blob.period===meta.period&&
  blob.interval===meta.interval&&blob.first_ms===meta.first_ms&&blob.last_ms===meta.last_ms&&
  Array.isArray(blob.rows)&&blob.rows.length===meta.candles,
  "Archive longue hors contexte");
 for(let i=0;i<blob.rows.length;i++){
  const row=blob.rows[i];
  requireProof(Array.isArray(row)&&row.length===8&&row.every(v=>typeof v==="number"&&Number.isFinite(v))&&
   Number.isSafeInteger(row[0])&&row[0]===meta.first_ms+i*s[1]&&
   Number.isSafeInteger(row[7])&&row[7]>=0&&row[3]>0&&
   row[3]<=Math.min(row[1],row[4])&&Math.max(row[1],row[4])<=row[2]&&
   row[5]>=0&&row[6]>=0,"Chandelle historique longue invalide");
 }
 const rows=derived?blob.rows.slice(-SPECS["60d"][2]):blob.rows;
 return{metadata:{id:assetId,pair:meta.pair,period,interval:SPECS[period][0],
  quote:"USDT",source:"Binance Spot",archiveFamily:"long-periods",
  sourceIndexUpdatedAt:new Date(c.index.snapshotted_at_ms).toISOString(),
  status:"VALIDATED_ARCHIVE",graphConnected:false,isLive:false,
  firstOpenMs:rows[0][0],lastOpenMs:rows.at(-1)[0],points:rows.length,
  derivedFrom90d:derived},candles:rows};
}
globalThis.SevenHistoricalLongReader=Object.freeze({listCoverage,refreshIndex,readSeries});
})();