/* Seven Heaven Historical Archive — stable, read-only pilot adapter.
   NO modifications to administrator/app.js, Chart, Trader, Bridge or IndexedDB. */
(() => {
"use strict";
const root=new URL("../../data/historical_archive_prototype/ohlcv_spot_pilot/",document.currentScript.src);
const S={"24h":[300000,"5m"],"7d":[3600000,"1h"],"30d":[14400000,"4h"]};
let promise=null;
function check(v,msg){if(!v)throw Error(msg)}
function finite(v){return typeof v==="number"&&Number.isFinite(v)}
async function get(path){
 const u=new URL(path,root);
 check(u.origin===location.origin&&u.pathname.startsWith(root.pathname),"Source externe refusée");
 const r=await fetch(u.href,{credentials:"omit",cache:"no-store",redirect:"error"});
 check(r.ok,"HTTP "+r.status+" : "+path);
 const bin=await r.arrayBuffer();check(bin.byteLength<=2000000,"Fichier trop volumineux");return bin;
}
async function json(path){return JSON.parse(new TextDecoder().decode(await get(path)))}
async function gzip(meta,isSeed){
 const path=meta?.file;
 check(typeof path==="string"&&(isSeed
 ? /^ohlcv_top10_\d{4}-\d\d-\d\d\.json\.gz$/.test(path)
 : /^deltas\/delta_\d{8}T\d{6}Z\.json\.gz$/.test(path)),"Nom archive interdit");
 check(/^[a-f0-9]{64}$/i.test(meta.sha256),"SHA-256 absent");
 const bin=await get(path);check(bin.byteLength===meta.bytes,"Taille incompatible : "+path);
 const hash=await crypto.subtle.digest("SHA-256",bin);
 const digest=Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,"0")).join("");
 check(digest===meta.sha256.toLowerCase(),"SHA-256 incorrect : "+path);
 check(typeof DecompressionStream==="function","Décompression gzip indisponible");
 const txt=await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
 check(new TextEncoder().encode(txt).byteLength<=10000000,"Contenu trop volumineux");
 return JSON.parse(txt);
}
function add(series,key,rows,step,cutoff){
 check(Array.isArray(rows)&&rows.length>0,"Série vide");
 let rec=series.get(key)||{first:null,last:null,rows:[]};
 for(const row of rows){
  check(Array.isArray(row)&&row.length===8&&row.every(finite),"Ligne OHLCV invalide");
  const [t,o,h,l,c,v,q,n]=row;
  check(Number.isInteger(t)&&t%step===0&&Number.isInteger(n)&&n>=0,"Timestamp/trans. invalide");
  check(t+step<=cutoff&&Number.isFinite(cutoff),"Chandelle non clôturée");
  check(l>0&&l<=Math.min(o,c)&&Math.max(o,c)<=h&&v>=0&&q>=0,"OHLC ou volume invalide");
  if(rec.last!==null)check(t===rec.last+step,"Doublon ou trou dans "+key);
  if(rec.first===null)rec.first=t;
  rec.last=t;rec.rows.push(row);
 }
 series.set(key,rec);
}
async function verify(){
 const idx=await json("index.json"), m=await json("manifest.json");
 check(idx.schema==="aerith.public.ohlcv.spot.cumulative.index.v1","Index inconnu");
 check(m.schema==="aerith.public.ohlcv.spot.top10.pilot.manifest.v1","Manifeste inconnu");
 check(idx.source==="Binance Spot"&&idx.quote_asset==="USDT"&&m.quote_asset==="USDT","Source/devise invalide");
 check(idx.basket_reference===m.reference&&idx.seed?.file===m.archive&&idx.seed?.bytes===m.archive_gzip_bytes&&idx.seed?.sha256===m.archive_sha256,"Archive initiale discordante");
 check(Array.isArray(idx.deltas)&&idx.deltas.length<=150&&Array.isArray(idx.coverage),"Index non supporté");
 const seed=await gzip(idx.seed,true);
 check(seed.schema==="aerith.public.ohlcv.spot.top10.pilot.v1"&&seed.kind==="REAL_BINANCE_SPOT_OHLCV_NO_SYNTHETIC_BARS"&&seed.quote_asset==="USDT"&&seed.basket_reference===m.reference&&seed.captured_at===m.created_at,"Seed non qualifié");
 check(seed.columns?.join(",")==="open_time_ms,open,high,low,close,base_volume,quote_volume,trade_count","Colonnes non qualifiées");
 const ids=Object.keys(seed.assets||{}),seen=new Set(),series=new Map(),pairs={};
 check(ids.length===7&&m.spot_pairs_qualified===7&&Array.isArray(m.complete_assets)&&ids.every(x=>m.complete_assets.includes(x)),"Panier d'actifs incohérent");
 let totalSeed=0,deltaTotal=0;const capture=Date.parse(seed.captured_at);
 for(const id of ids){
  const a=seed.assets[id];check(a.quote==="USDT"&&/^[A-Z0-9]+USDT$/.test(a.pair)&&!seen.has(a.pair),"Paire non qualifiée");
  seen.add(a.pair);pairs[id]=a.pair;
  for(const [period,[step,interval]]of Object.entries(S)){
   const v=a.periods?.[period];check(v?.interval===interval&&Array.isArray(v.rows)&&v.rows.length===m.periods?.[period]?.candles_expected,"Période initiale invalide");
   check(v.start_open_ms===v.rows[0][0]&&v.last_open_ms===v.rows.at(-1)[0],"Bornes initiales incorrectes");
   add(series,id+"|"+period,v.rows,step,capture);totalSeed+=v.rows.length;
  }
 }
 check(totalSeed===4452,"Seed R2 inattendu");
 let prev="";
 for(const d of idx.deltas){
  check(d.file>prev,"Deltas dupliqués ou désordonnés");prev=d.file;
  const delta=await gzip(d,false);
  check(delta.schema==="aerith.public.ohlcv.spot.increment.v1"&&delta.source==="Binance Spot"&&delta.quote_asset==="USDT"&&delta.basket_reference===m.reference,"Delta non qualifié");
  check(Array.isArray(delta.updates)&&delta.updates.length===d.updates,"Comptage mises à jour invalide");
  const cutoff=Date.parse(delta.collected_at),keys=new Set();let count=0;
  for(const p of delta.updates){
   const spec=S[p.period],key=p.id+"|"+p.period;
   check(spec&&pairs[p.id]===p.pair&&p.interval===spec[1]&&!keys.has(key),"Instrument/période du delta invalide");
   keys.add(key);check(Array.isArray(p.rows)&&p.rows.length<=240,"Delta trop grand");
   add(series,key,p.rows,spec[0],cutoff);count+=p.rows.length;
  }
  check(count===d.candles,"Total delta incohérent");deltaTotal+=count;
 }
 check(series.size===21&&idx.series_count===21&&idx.coverage.length===21,"21 séries attendues");
 const cover=new Map(idx.coverage.map(c=>[c.id+"|"+c.period,c]));
 check(cover.size===21,"Doublon d'index");let grandTotal=0;
 for(const [k,v] of series){
  const c=cover.get(k),[id,period]=k.split("|");
  check(c&&c.pair===pairs[id]&&c.interval===S[period][1]&&c.first_open_ms===v.first&&c.last_open_ms===v.last&&c.candles===v.rows.length,"Couverture incohérente : "+k);
  grandTotal+=v.rows.length;
 }
 check(grandTotal===idx.candles_total&&grandTotal===totalSeed+deltaTotal,"Total d'archive incorrect");
 return {series,pairs,coverage:idx.coverage,asOf:idx.updated_at,total:grandTotal,deltas:idx.deltas.length};
}
function load(){if(!promise)promise=verify().catch(e=>{promise=null;throw e});return promise}
async function listCoverage(){const d=await load();return {source:"Binance Spot",quote:"USDT",updatedAt:d.asOf,candlesTotal:d.total,deltaCount:d.deltas,coverage:d.coverage.map(x=>({...x}))}}
async function readSeries({assetId,period}){
 check(typeof assetId==="string"&&Object.hasOwn(S,period),"Période incorrecte");
 const d=await load(),rec=d.series.get(assetId+"|"+period);
 check(Object.hasOwn(d.pairs,assetId)&&rec,"Instrument non qualifié");
 return {metadata:{id:assetId,pair:d.pairs[assetId],period,interval:S[period][1],intervalMs:S[period][0],
 source:"Binance Spot",quote:"USDT",unit:"USDT par actif",archiveStatus:"VALIDATED",
 archiveUpdatedAt:d.asOf,firstOpenMs:rec.first,lastOpenMs:rec.last,points:rec.rows.length,
 isLive:false,targetGraphConnected:false},
 columns:["open_time_ms","open","high","low","close","base_volume","quote_volume","trade_count"],
 candles:rec.rows.map(r=>r.slice())};
}
window.SevenHistoricalArchive=Object.freeze({listCoverage,readSeries});
})();
