/* Seven Heaven - Trader-only verified Top50 immutable+incremental archive reader. */
(()=>{"use strict";
const ROOT=new URL("../data/historical_archive_prototype/universe/cohorts/",document.currentScript.src);
const FAMILIES=["top50","top50-additional"],SPECS={"24h":["5m",300000,288],"7d":["1h",3600000,168],"30d":["4h",14400000,180]};
const SNAP="aerith.public.ohlcv.spot.cohort.index.v1",SB="aerith.public.ohlcv.spot.universe.block.v1",
LEDGER="aerith.public.ohlcv.spot.cohort.incremental.index.v1",
CHUNK="aerith.public.ohlcv.spot.universe.incremental.chunk.v1",
PART="aerith.public.ohlcv.spot.incremental.partition.v1",SHA=/^[a-f0-9]{64}$/;
let pending=null;
function need(x,message){if(!x)throw Error(message);}
async function digest(bytes){const d=await crypto.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(d),b=>b.toString(16).padStart(2,"0")).join("");}
function path(family,file){
 need(FAMILIES.includes(family),"Cohorte inconnue");
 need(file==="index.json"||file==="incremental/index.json"||
 /^(incremental\/)?blocks\/[a-z0-9-]+_(24h|7d|30d)_(?:[0-9]{13}_[0-9]{13}_)?[a-f0-9]{16}\.json\.gz$/.test(file)||
 /^incremental\/partitions\/part_[0-9]{6}_[a-f0-9]{16}\.json\.gz$/.test(file),"Chemin OHLCV refusé");
 const url=new URL(family+"/"+file,ROOT);
 need(url.origin===location.origin&&url.pathname.startsWith(ROOT.pathname),"Origine OHLCV refusée");
 return url.href;
}
async function fetchBytes(family,file){
 const response=await fetch(path(family,file),{credentials:"omit",redirect:"error",cache:file.endsWith("index.json")?"no-store":"force-cache"});
 
 need(response.ok,"Coffre HTTP "+response.status);
 const bytes=await response.arrayBuffer();
 need(bytes.byteLength>0&&bytes.byteLength<=(file.endsWith(".gz")?4000000:1500000),"Fichier Coffre trop volumineux");
 return bytes;
}
async function unzip(bytes){
 need(bytes&&typeof DecompressionStream==="function","gzip indisponible");
 const decoded=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
 need(decoded.byteLength<=10000000,"Archive OHLCV trop volumineuse");
 return JSON.parse(new TextDecoder().decode(decoded));
}
function validateMeta(b,pair,increment){
 const s=SPECS[b?.period];
 need(s&&b.pair===pair&&b.interval===s[0]&&typeof b.asset_id==="string"&&
 /^[a-z0-9-]{2,100}$/.test(b.asset_id)&&Number.isSafeInteger(b.first_ms)&&
 Number.isSafeInteger(b.last_ms)&&Number.isSafeInteger(b.candles)&&b.candles>0&&
 b.candles<=(increment?288:s[2])&&b.first_ms%s[1]===0&&
 b.last_ms===b.first_ms+(b.candles-1)*s[1]&&SHA.test(b.sha256),"Métadonnées OHLCV invalides");
 const name="blocks/"+b.asset_id+"_"+b.period+"_"+
 (increment?b.first_ms+"_"+b.last_ms+"_":"")+b.sha256.slice(0,16)+".json.gz";
 need(b.file===name&&(!increment||b.candles<=288),"Nom de bloc OHLCV invalide");
 if(!increment)need(b.candles===s[2],"Snapshot Top50 incomplet");
}
function checkRows(data,b,increment){
 const s=SPECS[b.period],rows=data?.rows;
 need(data.schema===(increment?CHUNK:SB)&&data.source==="Binance Spot"&&data.quote==="USDT"&&
 data.asset_id===b.asset_id&&data.pair===b.pair&&data.period===b.period&&
 data.interval===s[0]&&data.first_ms===b.first_ms&&data.last_ms===b.last_ms&&
 Array.isArray(rows)&&rows.length===b.candles,"Bloc OHLCV incohérent");
 if(!increment)need(data.symbol+"USDT"===b.pair,"Identité OHLCV non qualifiée");
 for(let i=0;i<rows.length;i++){
 const r=rows[i];
 need(Array.isArray(r)&&r.length===8&&r.every(x=>typeof x==="number"&&Number.isFinite(x))&&
 Number.isSafeInteger(r[0])&&r[0]===b.first_ms+i*s[1]&&Number.isSafeInteger(r[7])&&r[7]>=0&&
 r[3]>0&&r[3]<=Math.min(r[1],r[4])&&Math.max(r[1],r[4])<=r[2]&&r[5]>=0&&r[6]>=0,
 "Chandelle OHLCV invalide");
 }
 return rows;
}
async function readBlock(family,b,increment){
 const bytes=await fetchBytes(family,(increment?"incremental/":"")+b.file);
 need(await digest(bytes)===b.sha256,"SHA-256 OHLCV invalide");
 return checkRows(await unzip(bytes),b,increment);
}
async function loadFamily(family){
 const bytes=await fetchBytes(family,"index.json"),doc=JSON.parse(new TextDecoder().decode(bytes));
 need(doc.schema===SNAP&&doc.source==="Binance Spot REST /api/v3/klines"&&
 doc.quote==="USDT"&&doc.cohort==="top50"&&doc.status==="VERIFIED_MANUAL_SNAPSHOT"&&
 Array.isArray(doc.assets)&&doc.assets.length===50&&Array.isArray(doc.blocks)&&
 doc.verified_series===doc.blocks.length&&SHA.test(doc.market_sha256)&&
 SHA.test(doc.registry_sha256)&&SHA.test(doc.universe_sha256),"Catalogue Top50 non qualifié");
 if(family==="top50-additional")need(doc.extension_schema==="aerith.public.ohlcv.spot.remaining.snapshot.v1","Source complémentaire non qualifiée");
 const approved=new Map(doc.assets.filter(a=>a.status==="archived_spot").map(a=>[a.id,a]));
 need(approved.size===(family==="top50"?12:7)&&doc.blocks.length===approved.size*3,
 "Couverture Top50 non qualifiée");
 for(const a of approved.values())need(a.pair===a.symbol+"USDT"&&/^[A-Z0-9]{2,22}$/.test(a.symbol),"Paire Top50 non qualifiée");
 const byKey=new Map();let count=0;
 for(const b of doc.blocks){
 const key=b.asset_id+"|"+b.period;
 need(!byKey.has(key)&&approved.get(b.asset_id)?.pair===b.pair,"Série Top50 dupliquée ou étrangère");
 validateMeta(b,b.pair,false);
 need(b.last_ms<doc.snapshot_end_ms,"Snapshot Top50 hors fenêtre");
 byKey.set(key,{baseline:b,segments:[]});count+=b.candles;
 }
 need(count===doc.verified_candles,"Compteurs Top50 incohérents");
 const baselineSha=await digest(bytes),ledgerBytes=await fetchBytes(family,"incremental/index.json");
 const ledger=ledgerBytes?JSON.parse(new TextDecoder().decode(ledgerBytes)):
 {schema:LEDGER,baseline_sha256:baselineSha,source:"Binance Spot",quote:"USDT",mode:"MANUAL_APPEND_ONLY_CLOSED_CANDLES",chunks:[]};
 need(ledger.schema===LEDGER&&ledger.baseline_sha256===baselineSha&&ledger.source==="Binance Spot"&&
 ledger.quote==="USDT"&&ledger.mode==="MANUAL_APPEND_ONLY_CLOSED_CANDLES"&&
 Array.isArray(ledger.chunks)&&ledger.chunks.length<=5000&&
 Array.isArray(ledger.partitions||[])&&(ledger.partitions||[]).length<=10000,
 "Journal Top50 non qualifié");
 const chunks=[];
 for(let i=0;i<(ledger.partitions||[]).length;i++){
 const p=ledger.partitions[i],filename="partitions/part_"+String(i+1).padStart(6,"0")+"_"+p.sha256?.slice(0,16)+".json.gz";
 need(p.file===filename&&SHA.test(p.sha256)&&Number.isSafeInteger(p.chunks)&&
 p.chunks>0&&p.chunks<=1000,"Partition Top50 invalide");
 const raw=await fetchBytes(family,"incremental/"+p.file);
 need(await digest(raw)===p.sha256,"SHA-256 partition Top50 invalide");
 const block=await unzip(raw);
 need(block.schema===PART&&block.ordinal===i+1&&Array.isArray(block.chunks)&&
 block.chunks.length===p.chunks&&block.chunks.reduce((n,x)=>n+x.candles,0)===p.candles,
 "Partition Top50 incohérente");
 chunks.push(...block.chunks);
 }
 chunks.push(...ledger.chunks);
 const latest=new Map(doc.blocks.map(b=>[b.asset_id+"|"+b.period,b.last_ms])),names=new Set();
 for(const b of chunks){
 const key=b.asset_id+"|"+b.period,entry=byKey.get(key);
 need(entry&&entry.baseline.pair===b.pair&&!names.has(b.file),"Bloc additionnel étranger ou dupliqué");
 validateMeta(b,entry.baseline.pair,true);
 need(b.first_ms===latest.get(key)+SPECS[b.period][1],"Trou ou doublon chronologique Top50");
 latest.set(key,b.last_ms);names.add(b.file);entry.segments.push(b);
 }
 return {family,series:byKey};
}
async function catalog(){
 if(!pending)pending=(async()=>{
 const families=await Promise.all(FAMILIES.map(loadFamily)),coverage=[],seen=new Set();
 for(const f of families)for(const [key,item] of f.series){
 need(!seen.has(key),"Identité dupliquée entre cohortes");seen.add(key);
 const b=item.baseline,extra=item.segments;
 coverage.push({id:b.asset_id,pair:b.pair,period:b.period,interval:b.interval,
 candles:b.candles+extra.reduce((n,x)=>n+x.candles,0),
 first_open_ms:b.first_ms,last_open_ms:extra.at(-1)?.last_ms||b.last_ms,family:f.family});
 }
 return {families,coverage};
 })().catch(err=>{pending=null;throw err;});
 return pending;
}
async function listCoverage(){const x=await catalog();return {snapshot:true,quote:"USDT",source:"Binance Spot",archiveFamily:"top50",coverage:x.coverage};}
function refreshIndex(){pending=null;return listCoverage();}
async function readSeries({assetId,period}){
 need(typeof assetId==="string"&&Object.hasOwn(SPECS,period),"Sélection Top50 invalide");
 const x=await catalog(),key=assetId+"|"+period,owner=x.families.find(f=>f.series.has(key));
 need(owner,"Historique Top50 absent");
 const item=owner.series.get(key),b=item.baseline,rows=await readBlock(owner.family,b,false);
 for(const part of item.segments)rows.push(...await readBlock(owner.family,part,true));
 const last=item.segments.at(-1)?.last_ms||b.last_ms;
 need(rows.length===b.candles+item.segments.reduce((n,v)=>n+v.candles,0)&&
 rows[0][0]===b.first_ms&&rows.at(-1)[0]===last,"Série Top50 cumulative incomplète");
 return {metadata:{id:assetId,pair:b.pair,period,interval:b.interval,quote:"USDT",
 source:"Binance Spot",sourceIndexUpdatedAt:new Date(last).toISOString(),
 status:"VALIDATED_ARCHIVE",isLive:false,graphConnected:false,archiveFamily:owner.family,
 firstOpenMs:b.first_ms,lastOpenMs:last,points:rows.length},candles:rows};
}
globalThis.SevenHistoricalCohortReader=Object.freeze({listCoverage,refreshIndex,readSeries});
})();