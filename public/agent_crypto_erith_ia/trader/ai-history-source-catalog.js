/* Seven Heaven · source resolver, no market owner or secret. */
(()=>{"use strict";
let catalog=null;
const PERIODS=["24h","7j","30j","60j","90j","1an","Max"];
const INDEX="../data/historical_archive_prototype/verified_periods/index.json";
const SHA=/^[a-f0-9]{64}$/;
function need(v,m){if(!v)throw Error("Catalogue IA : "+m);}
function compile(inventory,verified){
 need(inventory?.schema==="seven.crypto.source-inventory.readonly","inventaire absent");
 need(verified?.schema==="seven.crypto.verified-period-index"&&verified.core_assets===5,"périodes vérifiées");
 const assets=new Map();
 for(const a of inventory.assets){
  need(!assets.has(a.id),"identité doublée");
  assets.set(a.id,{id:a.id,rank:a.rank,symbol:a.symbol,
    nativeMinute:a.minute?{...a.minute,resolution:"1m",retrievable:false,
      reason:"Métadonnées mensuelles; sélectionner un fichier source certifié avant lecture"}:null,
    nativeDaily:a.daily.map(d=>({...d,resolution:"1D",retrievable:!!(SHA.test(d.sha256)&&d.file&&d.release),
      provenance:"1D native, horaires et lacunes propres à la plateforme"})),
    prepared:[]});
 }
 const used=new Set();
 for(const entry of verified.assets){
  need(assets.has(entry.id)&&!used.has(entry.id),"identité pilote incompatible");used.add(entry.id);
  need(Array.isArray(entry.periods)&&entry.periods.length===7,"sept périodes requises "+entry.id);
  for(const p of entry.periods){
   need(PERIODS.includes(p.period)&&SHA.test(p.sha256),"période ou preuve invalide");
   need(p.file===entry.id+"-"+p.period+".json.gz","fichier période non canonique");
   need(["1m","5m","1h","1d"].includes(p.resolution),"résolution non autorisée");
   need(Number.isInteger(p.bars)&&p.bars>0&&Number.isInteger(p.bytes)&&p.bytes>0,
    "dimensions de l'archive manquantes");
   const a=assets.get(entry.id);
   need(!a.prepared.some(x=>x.period===p.period),"période doublée");
   a.prepared.push({period:p.period,resolution:p.resolution,points:p.bars,bytes:p.bytes,
    sha256:p.sha256,file:p.file,path:"../data/historical_archive_prototype/verified_periods/"+p.file,
    quote:verified.quote,venue:"Binance Spot",derived:true,retrievable:true,
    snapshot:true,isLive:false,isAllTime:false,
    warning:"Période archivée figée : ne pas la confondre avec une période glissante en direct."});
  }
 }
 return {schema:"seven.crypto.history-source-catalog.readonly",version:1,
  count:assets.size,ranked:inventory.totals.ranked,
  outOfUniverse:inventory.outOfUniverse,assets:[...assets.values()],
  quoteConversion:false,realOrders:false};
}
function query(book,{id,period=null,granularity=null}={}){
 const a=book.assets.find(x=>x.id===id);
 if(!a)return {status:"UNKNOWN_ASSET",id};
 if(period!=null){
  const p=a.prepared.find(x=>x.period===period);
  return p?{status:"PREPARED_SNAPSHOT",assetId:id,symbol:a.symbol,source:p}:
   {status:"PERIOD_NOT_PREPARED",assetId:id,available:a.prepared.map(x=>x.period)};
 }
 if(granularity==="1d"){
  return a.nativeDaily.length?
   {status:"NATIVE_DAILY",assetId:id,symbol:a.symbol,sources:a.nativeDaily}:
   {status:"NO_NATIVE_DAILY",assetId:id};
 }
 if(granularity==="1m")return a.nativeMinute?
  {status:"NATIVE_MINUTE_CATALOG",assetId:id,symbol:a.symbol,source:a.nativeMinute}:
  {status:"NO_NATIVE_MINUTE",assetId:id};
 return {status:"AVAILABLE_SOURCES",assetId:id,symbol:a.symbol,
  minute:!!a.nativeMinute,daily:a.nativeDaily.length,prepared:a.prepared.map(x=>x.period)};
}
async function load(){
 const inv=await globalThis.AgentCryptoHistoryInventory.load();
 const url=new URL(INDEX,globalThis.location?.href||document.currentScript?.src);
 const r=await fetch(url.href,{credentials:"omit",cache:"no-store"});
 need(r.ok,"index de périodes indisponible");
 const verified=await r.json();
 catalog=compile(inv,verified);return catalog;
}
function init(){
 const node=document.getElementById("catalog-output");
 if(!node)return;
 load().then(book=>{
  node.replaceChildren();
  for(const id of ["bitcoin","ethereum","binancecoin","ripple","solana","quack-ai","concrete"]){
   const q=query(book,{id});const p=document.createElement("p");
   p.textContent=id+" : "+(q.status==="AVAILABLE_SOURCES"?
    (q.minute?"minute native · ":"")+(q.daily?"journalière native · ":"")+
      (q.prepared.length?q.prepared.join(", "):"pas de vue préparée"):"absent");
   node.appendChild(p);
  }
 }).catch(e=>{node.textContent="Échec de validation (aucune substitution) : "+e.message;});
}
globalThis.AgentCryptoHistorySourceCatalog=Object.freeze({compile,query,load,snapshot:()=>catalog});
if(typeof document!=="undefined"){
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
 else init();
}
})();
