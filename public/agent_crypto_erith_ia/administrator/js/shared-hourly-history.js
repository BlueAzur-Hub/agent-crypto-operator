/* Seven Heaven · verified contiguous historical 1h derived from original 1m monthly ZIPs.
 * Loaded only when user requests 60d/90d/1y/Max on canonical vault.
 */
(() => {
"use strict";
const root=new URL("../../data/historical_archive_prototype/shared_hourly_views/",document.currentScript.src);
const need=(ok,message)=>{if(!ok)throw Error(message)};
const windows={"60j":1440,"90j":2160,"1an":8760,"Max":null};
const cache=new Map(),pending=new Map();let index=null,indexPromise=null;
const sha=buffer=>crypto.subtle.digest("SHA-256",buffer).then(raw=>
 Array.from(new Uint8Array(raw),c=>c.toString(16).padStart(2,"0")).join(""));
async function read(file,cap){
 need(file==="index.json"||/^[a-z0-9-]{1,90}-hourly\.json\.gz$/.test(file),
      "Nom de projection interdit");
 const url=new URL(file,root);
 need(url.origin===location.origin&&url.pathname.startsWith(root.pathname),
      "Source historique externe interdite");
 const response=await fetch(url.href,{credentials:"omit",redirect:"error",cache:"no-store"});
 need(response.ok,"HTTP "+response.status+" : "+file);
 const raw=await response.arrayBuffer();
 need(raw.byteLength>0&&raw.byteLength<=cap,"Fichier historique trop volumineux");
 return raw;
}
function validateIndex(j){
 need(j?.schema==="aerith.public.ohlcv.shared.contiguous-hourly-index.v1"&&
      j.scope==="contiguous_verified_closed_months"&&
      j.source==="Binance Spot official monthly 1m ZIPs"&&
      j.quote==="USDT"&&j.is_live===false&&j.max_is_all_time===false&&
      j.archived_assets>0&&j.archived_assets<=250&&j.assets?.length===j.archived_assets,
      "Contrat de séries horaires inconnu");
 const ids=new Set();
 for(const m of j.assets){
  need(/^[a-z0-9-]{1,90}$/.test(m.id)&&!ids.has(m.id)&&
       /^[A-Z0-9]{2,22}USDT$/.test(m.pair)&&
       m.file===m.id+"-hourly.json.gz"&&/^[a-f0-9]{64}$/.test(m.sha256)&&
       Number.isInteger(m.bytes)&&m.bytes>0&&m.bytes<=2000000&&
       Number.isInteger(m.hourly_count)&&m.hourly_count>=672&&m.hourly_count<=8784&&
       Number.isInteger(m.months)&&m.months>=1&&m.months<=12&&
       Number.isInteger(m.native_1m_count)&&m.native_1m_count===m.hourly_count*60,
       "Actif historique invalide");
  ids.add(m.id);
 }
}
async function getIndex(){
 if(index)return index;
 if(!indexPromise)indexPromise=(async()=>{
  need(!!crypto?.subtle&&typeof DecompressionStream==="function",
       "SHA-256, HTTPS et gzip requis");
  const j=JSON.parse(new TextDecoder().decode(await read("index.json",250000)));
  validateIndex(j);return index=j;
 })().catch(error=>{indexPromise=null;throw error});
 return indexPromise;
}
function validateSeries(data,meta){
 need(data?.schema==="aerith.public.ohlcv.shared.contiguous-hourly-history.v1"&&
      data.asset_id===meta.id&&data.pair===meta.pair&&data.quote==="USDT"&&
      data.source==="Binance Spot official monthly 1m ZIPs"&&
      data.scope==="contiguous_verified_closed_months"&&
      data.is_live===false&&data.max_is_all_time===false&&data.interval==="1h"&&
      data.native_1m_count===meta.native_1m_count&&
      data.first_open_ms===meta.first_open_ms&&data.last_open_ms===meta.last_open_ms&&
      data.columns?.join(",")==="open_time_ms,open,high,low,close,base_volume,quote_volume,trade_count",
      "Horodatage, origine ou marché non qualifié");
 need(Array.isArray(data.source_months)&&data.source_months.length===meta.months&&
      data.source_months[0]?.month===meta.first_month&&
      data.source_months.at(-1)?.month===meta.last_month&&
      data.source_months.every(s=>/^\d{4}-(?:0[1-9]|1[0-2])$/.test(s.month)&&
             /^[a-f0-9]{64}$/.test(s.source_zip_sha256)&&
             s.release.startsWith("crypto-spot-bulk-")),
      "Provenance mensuelle historique incorrecte");
 const rows=data.series;
 need(Array.isArray(rows)&&rows.length===meta.hourly_count&&
      rows[0]?.[0]===meta.first_open_ms&&rows.at(-1)?.[0]===meta.last_open_ms,
      "Nombre ou bornes horaires incorrects");
 let previous=null;
 for(const row of rows){
  need(Array.isArray(row)&&row.length===8&&row.every(Number.isFinite),
       "Valeur de bougie invalide");
  const [t,o,h,l,c,v,q,n]=row;
  need(Number.isInteger(t)&&t%3600000===0&&
       (previous===null||t===previous+3600000)&&
       l>0&&l<=Math.min(o,c)&&Math.max(o,c)<=h&&
       v>=0&&q>=0&&Number.isInteger(n)&&n>=0,
       "Heures manquantes ou OHLCV incorrect");
  previous=t;
 }
}
async function loadOne(id){
 if(cache.has(id)){const x=cache.get(id);cache.delete(id);cache.set(id,x);return x}
 if(pending.has(id))return pending.get(id);
 const work=(async()=>{
  const m=(await getIndex()).assets.find(x=>x.id===id);
  need(!!m,"Cette crypto n'a pas d'archive mensuelle continue");
  const zip=await read(m.file,2000000);
  need(zip.byteLength===m.bytes&&await sha(zip)===m.sha256,
       "Empreinte SHA-256 historique refusée");
  const decoded=await new Response(new Blob([zip]).stream().pipeThrough(
                 new DecompressionStream("gzip"))).text();
  need(new TextEncoder().encode(decoded).byteLength<7000000,"Données horaires excessives");
  const data=JSON.parse(decoded);
  validateSeries(data,m);
  const archive={data,metadata:{...m,month:m.last_month}};
  cache.set(id,archive);
  if(cache.size>3)cache.delete(cache.keys().next().value);
  return archive;
 })().finally(()=>pending.delete(id));
 pending.set(id,work);
 return work;
}
function selectPeriod(archive,period){
 need(Object.hasOwn(windows,period),"Période historique non autorisée");
 const n=windows[period],all=archive.data.series;
 need(n===null||all.length>=n,
      "Historique "+period+" absent : seulement "+archive.metadata.months+" mois complets contigus");
 const rows=n===null?all:all.slice(-n);
 return {rows,interval:"1h",pair:archive.data.pair,
         quote:"USDT",asset_id:archive.data.asset_id,month:archive.metadata.last_month,
         isLive:false,maxIsAllTime:false};
}
window.SevenHourlyHistory=Object.freeze({index:getIndex,loadOne,selectPeriod});
})();