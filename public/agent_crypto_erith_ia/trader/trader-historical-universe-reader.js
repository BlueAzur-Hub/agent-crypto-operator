/* Seven Heaven · Trader-only historical universe reader. Immutable public blocks; no storage or trading. */
(()=>{"use strict";
const ROOT=new URL("../data/historical_archive_prototype/universe/",document.currentScript.src);
const INDEX="aerith.public.ohlcv.spot.universe.index.v1";
const BLOCK="aerith.public.ohlcv.spot.universe.block.v1";
const LEDGER="aerith.public.ohlcv.spot.universe.incremental.index.v1";
const CHUNK="aerith.public.ohlcv.spot.universe.incremental.chunk.v1";
const PARTITION="aerith.public.ohlcv.spot.incremental.partition.v1";
const SHA=/^[a-f0-9]{64}$/;
const BLOCK_NAME=/^blocks\/([a-z0-9-]+)_(24h|7d|30d)_([0-9]{13})_([0-9]{13})_([a-f0-9]{16})\.json\.gz$/;
const SPECS={"24h":[300000,"5m",288],"7d":[3600000,"1h",168],"30d":[14400000,"4h",180]};
let pending=null;
function need(condition,reason){if(!condition)throw Error(reason);}
const finite=v=>typeof v==="number"&&Number.isFinite(v);
async function download(path,optional=false){
 need(path==="index.json"||path==="incremental/index.json"||
      /^blocks\/[a-z0-9-]+_(24h|7d|30d)_[a-f0-9]{16}\.json\.gz$/.test(path)||
      /^incremental\/blocks\/[a-z0-9-]+_(24h|7d|30d)_[0-9]{13}_[0-9]{13}_[a-f0-9]{16}\.json\.gz$/.test(path)||
      /^incremental\/partitions\/part_[0-9]{6}_[a-f0-9]{16}\.json\.gz$/.test(path),
      "Chemin Universe refusé");
 const url=new URL(path,ROOT);
 need(url.origin===location.origin&&url.pathname.startsWith(ROOT.pathname),"Origine Universe interdite");
 const response=await fetch(url.href,{credentials:"omit",cache:path.endsWith("index.json")?"no-store":"force-cache",redirect:"error"});
 if(optional&&path==="incremental/index.json"&&response.status===404)return null;
 need(response.ok,"Archive Universe HTTP "+response.status);
 const raw=await response.arrayBuffer();
 need(raw.byteLength>0&&raw.byteLength<=(path.includes("partitions/")?4000000:2000000),"Bloc Universe trop volumineux");
 return raw;
}
async function digest(bytes){
 const result=await crypto.subtle.digest("SHA-256",bytes);
 return Array.from(new Uint8Array(result),b=>b.toString(16).padStart(2,"0")).join("");
}
async function unzip(raw){
 need(typeof DecompressionStream==="function","Décompression gzip indisponible");
 const bytes=await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
 need(bytes.byteLength<=10000000,"Archive décompressée trop volumineuse");
 return JSON.parse(new TextDecoder().decode(bytes));
}
async function catalog(){
 if(!pending)pending=(async()=>{
  const indexBytes=await download("index.json");
  const index=JSON.parse(new TextDecoder().decode(indexBytes));
  need(index.schema===INDEX&&index.quote==="USDT"&&index.source==="Binance Spot REST /api/v3/klines"&&
   index.publication==="MANUAL_BOUNDED_PILOT_NOT_LIVE","Index Universe non qualifié");
  need(Number.isInteger(index.universe_size)&&index.universe_size>0&&index.universe_size<=250&&
   Array.isArray(index.assets)&&index.assets.length===index.universe_size,"Univers incohérent");
  need(/^[a-f0-9]{64}$/.test(index.registry_sha256)&&
   /^[a-f0-9]{64}$/.test(index.market?.sha256||""),"Provenance Universe absente");
  need(Array.isArray(index.blocks)&&Number.isInteger(index.verified_series)&&
   index.blocks.length===index.verified_series&&index.blocks.length>0,"Séries Universe incohérentes");
  need(Number.isInteger(index.snapshot_end_ms)&&index.snapshot_end_ms>0,
       "Horodatage de collecte invalide");
  const approvals=new Map();
  for(const asset of index.assets){
   // Unapproved Market tickers may contain underscores (e.g. FIGR_HELOC).
   need(/^[a-z0-9-]{2,100}$/.test(asset.id)&&
     typeof asset.symbol==="string"&&/^[A-Z0-9_-]{2,40}$/.test(asset.symbol),
     "Identité d'actif invalide");
   if(asset.qualification==="qualified_spot"){
    need(/^[A-Z0-9]{2,22}$/.test(asset.symbol)&&
     asset.candidate_pair===asset.symbol+"USDT","Paire non qualifiée");
    approvals.set(asset.id,asset.candidate_pair);
   }
  }
  const seen=new Set();
  let total=0;
  for(const block of index.blocks){
   const spec=SPECS[block.period],key=block.asset_id+"|"+block.period;
   need(!seen.has(key)&&spec&&approvals.get(block.asset_id)===block.pair,
        "Série Universe non qualifiée ou dupliquée");
   seen.add(key);
   need(block.interval===spec[1]&&block.candles===spec[2]&&
       Number.isInteger(block.first_ms)&&Number.isInteger(block.last_ms)&&
       block.last_ms===block.first_ms+(block.candles-1)*spec[0]&&
       block.first_ms%spec[0]===0&&block.last_ms<index.snapshot_end_ms,
       "Couverture Universe incohérente");
   need(/^[a-f0-9]{64}$/.test(block.sha256)&&
       block.file==="blocks/"+block.asset_id+"_"+block.period+"_"+block.sha256.slice(0,16)+".json.gz",
       "Identité SHA-256 Universe invalide");
   total+=block.candles;
  }
  need(total===index.verified_candles,"Comptage Universe incorrect");
  // The manifest binds every append to these exact immutable snapshot bytes.
  const sourceDigest=await digest(indexBytes);
  const ledgerBytes=await download("incremental/index.json",true);
  const ledger=ledgerBytes?JSON.parse(new TextDecoder().decode(ledgerBytes)):
    {schema:LEDGER,baseline_sha256:sourceDigest,source:"Binance Spot",quote:"USDT",
     mode:"MANUAL_APPEND_ONLY_CLOSED_CANDLES",chunks:[]};
  need(ledger.schema===LEDGER&&ledger.baseline_sha256===sourceDigest&&
       ledger.source==="Binance Spot"&&ledger.quote==="USDT"&&
       ledger.mode==="MANUAL_APPEND_ONLY_CLOSED_CANDLES"&&
       Array.isArray(ledger.chunks)&&ledger.chunks.length<=5000&&
       Array.isArray(ledger.partitions||[])&&(ledger.partitions||[]).length<=10000,
       "Journal Universe non qualifié");
  const chunks=[],partitions=ledger.partitions||[];
  for(let i=0;i<partitions.length;i++){
   const part=partitions[i],name="partitions/part_"+String(i+1).padStart(6,"0")+"_"+part?.sha256?.slice(0,16)+".json.gz";
   need(SHA.test(part?.sha256)&&part.file===name&&Number.isInteger(part.chunks)&&
        part.chunks>=1&&part.chunks<=1000&&Number.isInteger(part.candles)&&part.candles>=1,
        "Partition Universe non qualifiée");
   const raw=await download("incremental/"+part.file);
   need(await digest(raw)===part.sha256,"SHA-256 partition Universe invalide");
   const body=await unzip(raw);
   need(body.schema===PARTITION&&body.ordinal===i+1&&Array.isArray(body.chunks)&&
        body.chunks.length===part.chunks&&
        body.chunks.reduce((sum,b)=>sum+b.candles,0)===part.candles,
        "Contenu de partition Universe incohérent");
   chunks.push(...body.chunks);
  }
  chunks.push(...ledger.chunks);
  const source=new Map(index.blocks.map(b=>[b.asset_id+"|"+b.period,b]));
  const end=new Map(index.blocks.map(b=>[b.asset_id+"|"+b.period,b.last_ms]));
  const segments=new Map(index.blocks.map(b=>[b.asset_id+"|"+b.period,[]]));
  const seenFiles=new Set();
  for(const b of chunks){
   const match=BLOCK_NAME.exec(b?.file||""),key=b?.asset_id+"|"+b?.period;
   const initial=source.get(key),spec=SPECS[b?.period];
   need(match&&initial&&spec&&!seenFiles.has(b.file)&&
        match[1]===b.asset_id&&match[2]===b.period&&match[3]===String(b.first_ms)&&
        match[4]===String(b.last_ms)&&SHA.test(b.sha256)&&
        match[5]===b.sha256.slice(0,16)&&
        b.pair===initial.pair&&b.interval===spec[1]&&
        Number.isInteger(b.candles)&&b.candles>=1&&b.candles<=288&&
        Number.isInteger(b.first_ms)&&Number.isInteger(b.last_ms)&&
        b.last_ms===b.first_ms+(b.candles-1)*spec[0]&&
        b.first_ms===end.get(key)+spec[0],
        "Continuité ou identité du journal Universe invalide");
   end.set(key,b.last_ms);segments.get(key).push(b);seenFiles.add(b.file);
  }
  return {...index,segments};
 })().catch(e=>{pending=null;throw e;});
 return pending;
}
async function listCoverage(){
 const c=await catalog();
 return{snapshot:true,quote:c.quote,source:"Binance Spot",archiveFamily:"universe",
  updatedAt:new Date(c.snapshot_end_ms).toISOString(),
  coverage:c.blocks.map(b=>{const ext=c.segments.get(b.asset_id+"|"+b.period)||[];
   return {id:b.asset_id,pair:b.pair,period:b.period,interval:b.interval,
           candles:b.candles+ext.reduce((n,s)=>n+s.candles,0),
           first_open_ms:b.first_ms,last_open_ms:ext.at(-1)?.last_ms||b.last_ms};})};
}
function refreshIndex(){pending=null;return listCoverage();}
async function readSeries({assetId,period}){
 need(typeof assetId==="string"&&Object.hasOwn(SPECS,period),"Sélection Universe invalide");
 const c=await catalog(),entry=c.blocks.find(b=>b.asset_id===assetId&&b.period===period);
 need(entry,"Archive Universe absente");
 const compressed=await download(entry.file);
 need(await digest(compressed)===entry.sha256,"Empreinte SHA-256 Universe invalide");
 const b=await unzip(compressed),spec=SPECS[period];
 need(b.schema===BLOCK&&b.asset_id===assetId&&b.pair===entry.pair&&b.period===period&&
      b.interval===spec[1]&&b.quote==="USDT"&&b.source==="Binance Spot"&&
      b.first_ms===entry.first_ms&&b.last_ms===entry.last_ms&&b.symbol+"USDT"===b.pair,
      "Archive Universe hors contexte");
 need(Array.isArray(b.rows)&&b.rows.length===entry.candles,"Archive Universe incomplète");
 for(let i=0;i<b.rows.length;i++){
  const r=b.rows[i];
  need(Array.isArray(r)&&r.length===8&&r.every(finite),"OHLCV Universe invalide");
  const [t,o,h,l,close,v,q,n]=r;
  need(Number.isInteger(t)&&t===entry.first_ms+i*spec[0]&&
       Number.isInteger(n)&&n>=0&&l>0&&l<=Math.min(o,close)&&
       Math.max(o,close)<=h&&v>=0&&q>=0,"Chronologie ou prix Universe invalide");
 }
 const rows=b.rows,added=c.segments.get(assetId+"|"+period)||[];
 for(const segment of added){
  const raw=await download("incremental/"+segment.file);
  need(await digest(raw)===segment.sha256,"SHA-256 incrémental Universe invalide");
  const record=await unzip(raw),extra=record?.rows;
  need(record.schema===CHUNK&&record.source==="Binance Spot"&&record.quote==="USDT"&&
       record.asset_id===assetId&&record.pair===entry.pair&&record.period===period&&
       record.interval===spec[1]&&record.first_ms===segment.first_ms&&
       record.last_ms===segment.last_ms&&Array.isArray(extra)&&extra.length===segment.candles,
       "Bloc incrémental Universe hors contexte");
  for(let i=0;i<extra.length;i++){
   const r=extra[i],expected=segment.first_ms+i*spec[0];
   need(Array.isArray(r)&&r.length===8&&r.every(finite)&&
        Number.isInteger(r[0])&&r[0]===expected&&Number.isInteger(r[7])&&r[7]>=0&&
        r[3]>0&&r[3]<=Math.min(r[1],r[4])&&Math.max(r[1],r[4])<=r[2]&&
        r[5]>=0&&r[6]>=0&&
        expected===(rows.at(-1)?.[0]||0)+spec[0],"Chandelle ou continuité incrémentale invalide");
   rows.push(r);
  }
 }
 const last=added.at(-1)?.last_ms||entry.last_ms;
 need(rows.length===entry.candles+added.reduce((sum,x)=>sum+x.candles,0)&&
      rows.at(-1)[0]===last,"Historique Universe incomplet");
 return {metadata:{id:assetId,pair:entry.pair,period,interval:spec[1],quote:"USDT",
   source:"Binance Spot",sourceIndexUpdatedAt:new Date(last).toISOString(),
   status:added.length?"VALIDATED_ARCHIVE":"VALIDATED_SNAPSHOT",
   isLive:false,graphConnected:false,archiveFamily:"universe",
   firstOpenMs:entry.first_ms,lastOpenMs:last,points:rows.length},
   candles:rows};
}
globalThis.SevenHistoricalUniverseReader=Object.freeze({listCoverage,refreshIndex,readSeries});
})();