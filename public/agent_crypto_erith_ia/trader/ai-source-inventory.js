/* Seven Heaven · inventory: source-index observer, no orders, no storage. */
(()=>{"use strict";
const MINUTE="../data/historical_archive_prototype/top250_multisource_coverage/index.json";
const DAILY="../data/historical_archive_prototype/top250_multiresolution_sources/index.json";
let snapshot=null;
function ensure(ok,why){if(!ok)throw Error("Inventaire Coffre : "+why);}
function assemble(minute,daily){
 ensure(minute?.schema==="aerith.public.ohlcv.top250.federated-native-archives.v1","schéma minute");
 ensure(daily?.schema==="aerith.public.crypto.multiresolution-sources.v1","schéma journalier");
 ensure(minute.ranked===250&&Array.isArray(minute.assets)&&minute.assets.length===250,"univers 250");
 ensure(Array.isArray(daily.assets)&&daily.asset_count===daily.assets.length,"nombre journalier");
 const byId=new Map(), dailySeen=new Set(), outOfUniverse=[];
 for(const a of minute.assets){
  ensure(/^[a-z0-9-]+$/.test(a.id||"")&&!byId.has(a.id),"identité minute unique");
  ensure(Number.isInteger(a.rank)&&a.rank>=1&&a.rank<=250,"rang minute");
  ensure(typeof a.symbol==="string"&&a.symbol.length>0,"symbole minute");
  ensure(Number.isFinite(a.native_1m_count||0)&&(a.native_1m_count||0)>=0,"compte minute");
  byId.set(a.id,{id:a.id,rank:a.rank,symbol:a.symbol,minute:
   a.native_1m_count>0?{source:String(a.source||"Source native"),quote:String(a.quote||"USDT"),
    months:a.months,points:a.native_1m_count}:null,daily:[]});
 }
 ensure(new Set([...byId.values()].map(x=>x.rank)).size===250,"rangs uniques");
 for(const a of daily.assets){
  ensure(/^[a-z0-9-]+$/.test(a.id||"")&&!dailySeen.has(a.id),"identité journalière invalide ou double");
  dailySeen.add(a.id);
  // Daily indexes may keep assets from a PREVIOUS top250 ranking.
  // Preserve them as out-of-universe evidence, never count them as current Top250.
  if(!byId.has(a.id)){outOfUniverse.push({id:a.id,rank:a.rank,symbol:a.symbol,venue:a.venue,points:a.native_candles});continue;}
  const base=byId.get(a.id);
  ensure(base.symbol===a.symbol,"symboles contradictoires "+a.id);
  ensure(Number.isInteger(a.native_candles)&&a.native_candles>0,"bougies journalières");
  ensure(typeof a.quote==="string"&&a.quote.length>0,"devise journalière");
  ensure(Number.isInteger(a.gaps_within_observed_span)&&a.gaps_within_observed_span>=0,"lacunes journalières");
  base.daily.push({venue:a.venue,pair:a.market,quote:a.quote,points:a.native_candles,
   gaps:a.gaps_within_observed_span,first:a.earliest_source_ms,last:a.latest_source_ms,
   sessionUtcOffsetMs:a.native_session_start_modulo_utc_day_ms,
   file:a.filename,sha256:a.sha256,release:a.release_url});
 }
 const assets=[...byId.values()].sort((a,b)=>a.rank-b.rank);
 const minuteCount=assets.filter(a=>a.minute).length;
 const dailyCount=assets.filter(a=>a.daily.length).length;
 const either=assets.filter(a=>a.minute||a.daily.length).length;
 ensure(minuteCount===minute.archived_assets&&dailyCount+outOfUniverse.length===daily.asset_count,
  "comptes discordants, actualiser catalogues");
 const totals={ranked:250,minute:minuteCount,daily:dailyCount,either,
  both:minuteCount+dailyCount-either,missing:250-either,
  dailyCatalog:daily.asset_count,outOfUniverse:outOfUniverse.length,
  minuteBars:minute.native_1m_candles,dailyBars:daily.native_daily_candles};
 return {schema:"seven.crypto.source-inventory.readonly",snapshot:true,verifiedCompleteness:false,
  warning:"Présence de source ≠ continuité, absence de trou ou fraîcheur; jamais de conversion implicite.",
  totals,assets,outOfUniverse};
}
async function request(url){
 const r=await fetch(url,{credentials:"omit",cache:"no-store"});
 ensure(r.ok,"réseau "+r.status);return r.json();
}
async function load(){
 const root=document.currentScript?.src||location.href;
 const [minute,daily]=await Promise.all([request(new URL(MINUTE,root)),request(new URL(DAILY,root))]);
 snapshot=assemble(minute,daily);return snapshot;
}
function render(view,node){
 node.replaceChildren();
 const summary=document.getElementById("summary");
 if(summary)summary.textContent="Minute : "+view.totals.minute+" · Journalier : "+view.totals.daily+
  " · Dans le Top250 (union) : "+view.totals.either+"/250 · Sans source : "+view.totals.missing+
  " · Archives 1D hors univers actuel : "+view.totals.outOfUniverse;
 const others=document.getElementById("outside");
 if(others)others.textContent=view.outOfUniverse.length
  ?"Archives du catalogue quotidien conservées, hors classement actuel : "+
   view.outOfUniverse.map(x=>x.symbol+" ("+x.id+", ancien rang "+x.rank+")").join(" ; ")+"."
  :"Aucune archive hors univers courant.";
 for(const a of view.assets){
  const tr=document.createElement("tr");
  const fields=[String(a.rank),a.symbol,a.minute?"1m · "+a.minute.months+" mois":"—",
   a.daily.map(x=>"1D · "+x.points+" points · "+x.venue).join(" ; ")||"—",
   a.daily.map(x=>x.gaps+" lacunes").join(" ; ")||"—",
   a.minute||a.daily.length?"Source présente · couverture à qualifier":"Sans source dans ces deux registres"];
  for(const v of fields){const td=document.createElement("td");td.textContent=v;tr.appendChild(td);}
  node.appendChild(tr);
 }
}
function boot(){
 const target=document.getElementById("assets");if(!target)return;
 load().then(x=>render(x,target)).catch(e=>{
  const status=document.getElementById("summary");
  if(status)status.textContent="Échec de lecture (aucun chiffre inventé) : "+e.message;
 });
}
globalThis.AgentCryptoHistoryInventory=Object.freeze({assemble,load,snapshot:()=>snapshot});
if(typeof document!=="undefined"){
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
}
})();
