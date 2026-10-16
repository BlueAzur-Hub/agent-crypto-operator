/* Seven Heaven · one canonical Top250 view, read-only · Binance + Bitget. */
(() => {
"use strict";
const ROOT=new URL("../../data/historical_archive_prototype/",document.currentScript.src);
const $=id=>document.getElementById(id);
const check=(ok,msg)=>{if(!ok)throw Error(msg)};
let catalog=null,binance=null,bitget=null,yearDepth=null,privateWBT=null;
function metric(label,value){
 const div=document.createElement("div"),small=document.createElement("small"),b=document.createElement("b");
 div.className="metric";small.textContent=label;b.textContent=value;div.append(small,b);return div;
}
function cell(row,value){
 const td=document.createElement("td");td.textContent=String(value);row.append(td);return td;
}
async function getJson(name,limit=2000000){
 const path=new URL(name,ROOT);
 check(path.origin===location.origin&&path.pathname.startsWith(ROOT.pathname),"Origine du Coffre interdite");
 const res=await fetch(path.href,{credentials:"omit",cache:"no-store",redirect:"error"});
 check(res.ok,"Index indisponible : "+name+" HTTP "+res.status);
 const body=await res.text();check(body.length>0&&body.length<=limit,"Index trop volumineux : "+name);
 return JSON.parse(body);
}
function validate(fed,bin,alt,depth){
  // Each index is a dated, internally consistent snapshot. Rank is NOT
  // an immutable identity and cannot join Binance/Bitget histories.
  check(fed?.schema==="aerith.public.ohlcv.top250.federated-native-archives.v1"&&
   fed.ranked===250&&fed.quote==="USDT"&&fed.is_live===false&&
   fed.assets?.length===250&&Number.isInteger(fed.archived_assets)&&
   fed.archived_assets===fed.binance_archived_assets+fed.bitget_archived_assets,
   "Index fédéré incorrect");
  check(bin?.schema==="aerith.public.ohlcv.top250.monthly-coverage-catalog.v1"&&
   bin.ranked===250&&bin.assets?.length===250&&
   Number.isInteger(bin.archived_assets)&&Number.isInteger(bin.native_1m_candles),
   "Index Binance incorrect");
  check(alt?.schema==="aerith.public.ohlcv.verified-bitget-spot-month-views.v1"&&
   alt.quote==="USDT"&&alt.assets?.length===alt.archived_assets,
   "Index Bitget incorrect");
  check(depth?.schema==="aerith.public.ohlcv.top250.verifiable-year-depth.v1"&&
   depth.ranked===250&&depth.assets?.length===250&&
   depth.assets_with_at_least_24_consecutive_closed_months<=depth.assets_with_at_least_12_consecutive_closed_months&&
   depth.archive_assets<=bin.archived_assets&&
   depth.source_catalog_minutes<=bin.native_1m_candles,
   "Index de profondeur annuel incorrect");
  const oldIds=new Map(),oldSymbols=new Map(),currentIds=new Map();
  let fedTotal=0,fedBin=0,fedBitget=0,binTotal=0,binArchived=0;
  for(let i=0;i<250;i++){
    const f=fed.assets[i],b=bin.assets[i];
    check(f?.rank===i+1&&typeof f.id==="string"&&f.id&&
     typeof f.symbol==="string"&&f.symbol&&typeof f.name==="string"&&
     !oldIds.has(f.id),"Identité du classement fédéré incorrecte : "+(i+1));
    oldIds.set(f.id,f);
    if(!oldSymbols.has(f.symbol))oldSymbols.set(f.symbol,new Set());
    oldSymbols.get(f.symbol).add(f.id);
    const count=Number(f.native_1m_count);
    check(Number.isInteger(count)&&count>=0&&f.quote==="USDT"&&
     (f.source===null||f.source==="Binance Spot official native 1m ZIPs"||
      f.source==="Bitget Spot native 1m HTTPS")&&
     (f.source===null)===(count===0),
     "Source fédérée non conforme : "+f.id);
    fedTotal+=count;
    if(f.source==="Binance Spot official native 1m ZIPs")fedBin++;
    if(f.source==="Bitget Spot native 1m HTTPS")fedBitget++;
    check(b?.rank===i+1&&typeof b.id==="string"&&b.id&&
     typeof b.symbol==="string"&&b.symbol&&Array.isArray(b.months)&&
     Number.isInteger(b.candles)&&b.candles>=0&&!currentIds.has(b.id),
     "Identité ou comptage Binance incorrect : rang "+(i+1));
    currentIds.set(b.id,b);
    const expected=b.months.reduce((n,m)=>n+m.candles,0);
    check(expected===b.candles&&b.months.every(m=>
     /^\d{4}-(?:0[1-9]|1[0-2])$/.test(m.month)&&
     Number.isInteger(m.candles)&&m.candles>0&&
     m.pair===b.symbol+"USDT"&&/^[a-f0-9]{64}$/.test(m.sha256)),
     "Sources mensuelles Binance incohérentes : "+b.id);
    if(b.months.length)binArchived++;
    binTotal+=b.candles;
  }
  check(fedBin===fed.binance_archived_assets&&fedBitget===fed.bitget_archived_assets&&
   fedTotal===fed.native_1m_candles&&fedBin+fedBitget===fed.archived_assets,
   "Comptes fédérés incohérents");
  check(binArchived===bin.archived_assets&&binTotal===bin.native_1m_candles,
   "Comptes Binance incohérents");
  // Same exact ID must retain its symbol. Reject an archived instrument that
  // steals an old ID's ticker; do not confuse a new rank with new ownership.
  for(const b of currentIds.values()){
    const old=oldIds.get(b.id);
    check(!old||old.symbol===b.symbol,
     "Identité ou comptage Binance incorrect : "+b.id);
    if(b.months.length)
      check(!oldSymbols.has(b.symbol)||oldSymbols.get(b.symbol).has(b.id),
       "Identité ou comptage Binance incorrect : "+b.id);
  }
  const altIds=new Set();
  for(const a of alt.assets){
    const historical=oldIds.get(a.id),current=currentIds.get(a.id);
    check(historical&&!altIds.has(a.id)&&
     a.rank===historical.rank&&a.symbol===historical.symbol&&
     (!current||current.symbol===a.symbol)&&
     a.pair===a.symbol+"USDT"&&a.quote==="USDT"&&
     /^[a-f0-9]{64}$/.test(a.sha256)&&
     /^[a-f0-9]{64}$/.test(a.source_zip_sha256)&&
     Array.isArray(a.months)&&a.months.length>0&&
     Number.isInteger(a.total_verified_1m_count)&&a.total_verified_1m_count>0,
     "Source Bitget invalide : "+a.id);
    check(a.months.every(m=>/^\d{4}-(?:0[1-9]|1[0-2])$/.test(m))&&
     new Set(a.months).size===a.months.length,
     "Mois Bitget incorrects : "+a.id);
    const expectedMinuteCount=a.months.reduce((n,m)=>{
      const year=Number(m.slice(0,4)),month=Number(m.slice(5,7));
      return n+(Date.UTC(year,month,1)-Date.UTC(year,month-1,1))/60000;
    },0);
    check(expectedMinuteCount===a.total_verified_1m_count,
     "Source Bitget native minute count invalid: "+a.id);
    altIds.add(a.id);
  }
}
function currentView(){
  // Latest ranked Binance catalog is the displayed Top250 universe.
  // Older Bitget and federated records remain independent dated evidence.
  const alternatives=new Map(bitget.assets.map(a=>[a.id,a]));
  return catalog.assets.map(a=>{
   const secondary=alternatives.get(a.id),binActive=a.months.length>0;
   return {asset:a,primary:binActive?"Binance":secondary?"Bitget":null,
    months:binActive?a.months.length:(secondary?.months?.length||0),
    count:binActive?a.candles:(secondary?.total_verified_1m_count||0),
    first:binActive?a.months[0]?.month:(secondary?.months?.[0]||"—"),
    lastMonth:binActive?a.months.at(-1)?.month:(secondary?.month||"—"),
    release:binActive?a.months.at(-1)?.release:(secondary?.release||null),
    both:binActive&&!!secondary};
  });
}
function show(){
 if(!catalog||!binance||!bitget)return;
 const limit=Number($("top250-limit").value),query=$("top250-search").value.trim().toLowerCase();
 const only=$("top250-available").checked;
 const view=currentView();
 const rows=view.filter(v=>{
  const a=v.asset,wbt=a.id==="whitebit"&&privateWBT;
  return a.rank<=limit&&(!only||v.primary||wbt)&&
   (!query||[a.id,a.symbol,a.name,String(a.rank)].some(x=>x.toLowerCase().includes(query)));
 });
 const frag=document.createDocumentFragment();
 for(const v of rows){
  const a=v.asset,wbt=a.id==="whitebit"&&privateWBT;
  const row=document.createElement("tr");
  cell(row,a.rank);cell(row,a.name+" · "+a.symbol);
  cell(row,v.primary?(v.primary==="Binance"?"Binance Spot":"Bitget Spot")+(v.both?" · Bitget aussi":""):
   wbt?"WhiteBIT Spot · privé vérifié":"À collecter");
  cell(row,v.primary?v.months:"—");
  cell(row,v.primary?v.count.toLocaleString("fr-FR"):(wbt?privateWBT.candle_rows.toLocaleString("fr-FR")+" (privé)":"0"));
  cell(row,v.primary?v.first:(wbt?privateWBT.first_open_utc.slice(0,10):"—"));
  const last=cell(row,wbt?privateWBT.last_open_utc.slice(0,10)+" · privé":"—");
  if(v.primary&&/^crypto-spot-(?:bulk|bitget)-[a-zA-Z0-9-]+$/.test(v.release||"")){
   const link=document.createElement("a");
   link.href="https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/"+encodeURIComponent(v.release);
   link.textContent=v.lastMonth+" · ZIP";link.rel="noopener noreferrer";link.target="_blank";
   last.replaceChildren(link);
  }else if(v.primary){last.textContent=v.lastMonth+" · archives";}
  const action=cell(row,"");
  if(v.primary){
   const btn=document.createElement("button");btn.type="button";
   btn.textContent="Voir les bougies";btn.className="vault-select";
   btn.setAttribute("aria-label","Consulter les bougies de "+a.name);
   btn.addEventListener("click",()=>document.dispatchEvent(new CustomEvent(
    "seven-vault-select",{detail:{id:a.id}})));
   action.append(btn);
  }else if(wbt){
   const link=document.createElement("a");link.href="#wbt-private-proof";
   link.textContent="Statut privé";action.append(link);
  }else action.textContent="—";
  frag.append(row);
 }
 $("top250-rows").replaceChildren(frag);
 $("top250-listed").textContent=rows.length+" actifs affichés · données publiques Binance / Bitget · WBT archivé en privé et non consultable en ligne";
}
function validatePrivateWbt(v){
 check(v?.schema==="seven.crypto.wbt.private-evidence.status.v1"&&
  v.asset_id==="whitebit"&&v.symbol==="WBT"&&v.venue==="WhiteBIT Spot"&&
  v.market==="WBT_USDT"&&v.quote==="USDT"&&v.resolution==="1m"&&
  v.publication_status==="SUMMARY_METADATA_ONLY_SOURCE_CANDLES_NOT_PUBLISHED"&&
  v.not_live===true&&v.trader_imported===false,"Preuve WBT privée non conforme");
 check(Number.isInteger(v.candle_rows)&&v.candle_rows>0&&
  Number.isInteger(v.represented_days)&&v.represented_days>0&&
  v.partial_first_day_rows===601&&
  v.full_days+1===v.represented_days&&
  v.years?.reduce((sum,a)=>sum+a.days,0)===v.represented_days&&
  v.years?.reduce((sum,a)=>sum+a.rows,0)===v.candle_rows,
  "Comptage WBT privé non conforme");
 check(v.first_open_utc==="2022-08-25T13:59:00Z"&&
  v.last_open_utc==="2026-10-11T23:59:00Z"&&
  /^[a-f0-9]{64}$/.test(v.private_manifest_sha256),
  "Provenance WBT privée incorrecte");
}
function showPrivateWbt(){
 const host=$("wbt-private-metrics"),status=$("wbt-private-status");
 if(!host||!status||!privateWBT)return;
 const v=privateWBT,frag=document.createDocumentFragment();
 for(const [label,value] of [
  ["Bougies originales 1m",v.candle_rows.toLocaleString("fr-FR")],
  ["Journées représentées",v.represented_days.toLocaleString("fr-FR")],
  ["Première bougie UTC","25/08/2022 · 13:59"],
  ["Dernière archive UTC","11/10/2026"],
  ["Minutes manquantes observées",String(v.internal_missing_minute_slots)],
  ["Disponibilité","Privé · hors GitHub"]
 ])frag.append(metric(label,value));
 host.replaceChildren(frag);
 status.textContent="Métadonnées publiques uniquement · source WhiteBIT Spot WBT/USDT vérifiée sur fichiers privés · aucun prix publié, aucune lecture Trader.";
}
async function init(){
 const status=$("top250-status");status.textContent="Contrôle indépendant des index en cours…";
 try{
  const [fed,bin,alt,depth]=await Promise.all([
   getJson("top250_multisource_coverage/index.json",300000),
   getJson("top250_history_catalog/index.json"),
   getJson("bitget_verified_views/index.json",150000),
   getJson("year_depth_index.json",1200000)
  ]);
  validate(fed,bin,alt,depth);
  catalog=bin;binance=bin;bitget=alt;yearDepth=depth;
  const view=currentView(),pub=view.filter(v=>v.primary);
  const binCount=view.filter(v=>v.primary==="Binance").length;
  const bitOnly=view.filter(v=>v.primary==="Bitget").length;
  const overlap=view.filter(v=>v.both).length;
  const nativeRows=pub.reduce((s,v)=>s+v.count,0);
  const srcDifferent=bin.archived_assets!==fed.binance_archived_assets||
   bin.native_1m_candles+alt.assets.reduce((s,a)=>s+a.total_verified_1m_count,0)!==fed.native_1m_candles;
  $("top250-title").textContent="Coffre Top 250 · archives publiques ("+pub.length+"/250)";
  const metrics=document.createDocumentFragment();
  for(const [label,value] of [
   ["Univers classé","250"],["Au moins une archive publique",pub.length+"/250"],
   ["≥ 12 mois dans l'indice annuel Binance",String(depth.assets_with_at_least_12_consecutive_closed_months)],
   ["≥ 24 mois dans l'indice annuel Binance",String(depth.assets_with_at_least_24_consecutive_closed_months)],
   ["Sources principales Binance / Bitget",binCount+" / "+bitOnly],
   ["Bougies 1 min dans la sélection de sources",nativeRows.toLocaleString("fr-FR")]
  ])metrics.append(metric(label,value));
  $("top250-summary").replaceChildren(metrics);
  $("top250-counts").textContent=[10,50,100,250].map(n=>
   "Top "+n+" : "+view.filter(v=>v.asset.rank<=n&&v.primary).length+"/"+n).join(" · ")+
   (overlap?" · "+overlap+" actif également sur Bitget, sans double comptage":"");
  status.textContent="Sources indépendantes validées · Binance et Bitget sans doublon"+
   (srcDifferent?" · instantanés historiques distincts, sources reliées par identifiant exact":"")+
   " · aucun prix inventé";
  show();
 }catch(e){
  $("top250-title").textContent="Coffre Top 250 · sources indisponibles";
  status.textContent="Vérification refusée : "+String(e?.message||e);
 }
}
for(const key of ["top250-limit","top250-search","top250-available"])
 $(key)?.addEventListener(key==="top250-search"?"input":"change",show);
void getJson("wbt_private_status.json",12000).then(v=>{
 validatePrivateWbt(v);privateWBT=v;showPrivateWbt();show();
}).catch(e=>{
 const target=$("wbt-private-status");
 if(target)target.textContent="Fiche WBT non chargée : "+String(e?.message||e);
});
void init();
window.SevenTop250Catalog=Object.freeze({read:()=>catalog});
})();