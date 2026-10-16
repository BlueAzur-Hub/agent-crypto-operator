/* Seven Heaven · Shared read-only OHLCV reader for the verified historical vault.
 * One common Top250 catalog, one monthly projection per genuinely archived asset.
 * No network on period changes. Never trades, writes IndexedDB, or changes Trader.
 */
(() => {
"use strict";
const base=new URL("../../data/historical_archive_prototype/shared_monthly_views/",document.currentScript.src);
const bitgetBase=new URL("../../data/historical_archive_prototype/bitget_verified_views/",document.currentScript.src);
const periods={"24h":["1m",1440],"7j":["5m",2016],"30j":["5m",8640],
               "mois":["1h",null]};
const intervalMs={"1m":60000,"5m":300000,"1h":3600000};
const byId=id=>document.getElementById(id);
const need=(ok,msg)=>{if(!ok)throw Error(msg)};
let index=null,loadingIndex=null,bitgetIndex=null,bitgetLoading=null,seq=0;
const cache=new Map(),inflight=new Map();
const sha256=raw=>crypto.subtle.digest("SHA-256",raw).then(h=>
 Array.from(new Uint8Array(h),x=>x.toString(16).padStart(2,"0")).join(""));
async function fetchAsset(name,cap){
 need(/^(?:index\.json|[a-z0-9-]{1,90}\.json\.gz)$/.test(name),"Archive non autorisée");
 const u=new URL(name,base);
 need(u.origin===location.origin&&u.pathname.startsWith(base.pathname),"Origine interdite");
 const r=await fetch(u.href,{cache:"no-store",credentials:"omit",redirect:"error"});
 need(r.ok,"HTTP "+r.status+" : "+name);
 const bytes=await r.arrayBuffer();
 need(bytes.byteLength>0&&bytes.byteLength<=cap,"Taille d'archive inattendue");
 return bytes;
}
function validateIndex(j){
 need(j?.schema==="aerith.public.ohlcv.shared.monthly-index.v1"&&
      j.quote==="USDT"&&j.scope==="latest_verified_closed_month"&&
      j.source==="Binance Spot official monthly 1m ZIPs"&&
      j.is_live===false&&j.max_is_all_time===false&&
      Number.isInteger(j.archived_assets)&&j.archived_assets>0&&
      j.archived_assets<=250&&j.assets?.length===j.archived_assets,
      "Contrat d'index historique incorrect");
 const seen=new Set();
 for(const a of j.assets){
  need(/^[a-z0-9-]{1,90}$/.test(a.id)&&!seen.has(a.id)&&
       /^[A-Z0-9]{2,22}USDT$/.test(a.pair)&&
       /^\d{4}-(0[1-9]|1[0-2])$/.test(a.month)&&
       a.file===a.id+".json.gz"&&
       /^[a-f0-9]{64}$/.test(a.sha256)&&
       /^[a-f0-9]{64}$/.test(a.source_zip_sha256)&&
       Number.isInteger(a.bytes)&&a.bytes>0&&a.bytes<=2000000&&
       Number.isInteger(a.native_1m_count)&&
       a.native_1m_count>=40320&&a.native_1m_count<=44640&&
       a.release.startsWith("crypto-spot-bulk-")&&
       a.series_counts?.["1m"]===1440&&
       a.series_counts?.["5m"]>=8064&&
       [672,696,720,744].includes(a.series_counts?.["1h"]),
       "Index d'actif non qualifié");
  seen.add(a.id);
 }
}
async function getIndex(){
 if(index)return index;
 if(!loadingIndex)loadingIndex=(async()=>{
  need(crypto?.subtle&&typeof DecompressionStream==="function",
       "Firefox doit supporter HTTPS, SHA-256 et gzip");
  const raw=await fetchAsset("index.json",150000);
  const j=JSON.parse(new TextDecoder().decode(raw));
  validateIndex(j);
  return index=j;
 })().catch(e=>{loadingIndex=null;throw e});
 return loadingIndex;
}

async function getBitgetIndex(){
 if(bitgetIndex)return bitgetIndex;
 if(!bitgetLoading)bitgetLoading=(async()=>{
  need(crypto?.subtle&&typeof DecompressionStream==="function","Contrôle Bitget impossible");
  const r=await fetch(new URL("index.json",bitgetBase),{cache:"no-store",credentials:"omit",redirect:"error"});
  need(r.ok,"Index Bitget HTTP "+r.status);
  const text=await r.text();
  need(text.length>0&&text.length<150000,"Index Bitget trop volumineux");
  const j=JSON.parse(text);
  need(j.schema==="aerith.public.ohlcv.verified-bitget-spot-month-views.v1"&&
   j.quote==="USDT"&&j.trade_count_available===false&&j.not_exchange_signed===true&&
   j.source==="Bitget Spot public native 1m API"&&
   j.assets?.length===j.archived_assets,"Index Bitget incorrect");
  const seen=new Set();
  for(const a of j.assets){
   need(/^[a-z0-9-]{2,100}$/.test(a.id)&&!seen.has(a.id)&&
    a.file===a.id+"-bitget-month.json.gz"&&
    /^[A-Z0-9]{2,30}USDT$/.test(a.pair)&&
    /^\d{4}-(?:0[1-9]|1[0-2])$/.test(a.month)&&
    Array.isArray(a.months)&&a.months.includes(a.month)&&
    /^crypto-spot-bitget-\d{4}-(?:0[1-9]|1[0-2])-1m-[a-z0-9-]+$/.test(a.release)&&
    a.release.endsWith("-"+a.id)&&
    /^[a-f0-9]{64}$/.test(a.sha256)&&
    /^[a-f0-9]{64}$/.test(a.source_zip_sha256)&&
    Number.isInteger(a.bytes)&&a.bytes>0&&a.bytes<=2000000&&
    a.series_counts?.["1m"]===1440&&
    [672,696,720,744].includes(a.series_counts?.["1h"])&&
    Number.isInteger(a.native_1m_count)&&
    Number.isInteger(a.total_verified_1m_count)&&
    a.total_verified_1m_count>=a.native_1m_count,
    "Identité ou intégrité Bitget incorrecte");
   seen.add(a.id);
  }
  return bitgetIndex=j;
 })().catch(e=>{bitgetLoading=null;throw e});
 return bitgetLoading;
}
function verifyBitget(data,m){
 need(data.schema==="aerith.public.ohlcv.verified-bitget-spot-month.v1"&&
  data.asset_id===m.id&&data.pair===m.pair&&data.month===m.month&&
  data.quote==="USDT"&&data.source==="Bitget Spot public native 1m API"&&
  data.is_live===false&&data.not_exchange_signed===true&&
  data.trade_count_available===false&&
  data.native_columns?.join(",")==="open_time_ms,open,high,low,close,base_volume,quote_turnover"&&
  data.source_release===m.release&&data.source_zip_sha256===m.source_zip_sha256&&
  data.native_1m_count===m.native_1m_count&&
  data.first_open_ms===m.first_open_ms&&data.last_open_ms===m.last_open_ms,
  "Provenance native Bitget incorrecte");
 for(const [interval,count] of Object.entries(m.series_counts)){
  need(Object.hasOwn(intervalMs,interval),"Intervalle Bitget inconnu");
  const series=data.series?.[interval],step=intervalMs[interval];
  need(Array.isArray(series)&&series.length===count,"Série Bitget incomplète");
  let previous=null;
  for(const row of series){
   need(Array.isArray(row)&&row.length===7&&row.every(Number.isFinite),
    "Bitget utilise sept champs natifs");
   const [ts,o,h,l,c,volume,quote]=row;
   need(Number.isInteger(ts)&&ts%step===0&&(previous===null||ts===previous+step)&&
    l>0&&l<=Math.min(o,c)&&Math.max(o,c)<=h&&volume>=0&&quote>=0,
    "Continuité ou OHLCV Bitget incohérents");
   previous=ts;
  }
  need(previous===Math.floor(m.last_open_ms/step)*step,"Fin de série Bitget incohérente");
 }
}
async function loadBitget(id){
 const cached=cache.get(id);if(cached)return cached;
 if(inflight.has(id))return inflight.get(id);
 const job=(async()=>{
  const metadata=(await getBitgetIndex()).assets.find(a=>a.id===id);
  need(!!metadata,"Cette crypto Bitget n'est pas archivée");
  const url=new URL(metadata.file,bitgetBase);
  need(url.origin===location.origin&&url.pathname.startsWith(bitgetBase.pathname),"Origine Bitget interdite");
  const response=await fetch(url.href,{cache:"no-store",credentials:"omit",redirect:"error"});
  need(response.ok,"Archive Bitget HTTP "+response.status);
  const compressed=await response.arrayBuffer();
  need(compressed.byteLength===metadata.bytes&&
       await sha256(compressed)===metadata.sha256,"SHA-256 Bitget incorrect");
  const plain=await new Response(new Blob([compressed]).stream().pipeThrough(
     new DecompressionStream("gzip"))).text();
  need(plain.length<7500000,"Archive Bitget décompressée trop grande");
  const data=JSON.parse(plain);
  verifyBitget(data,metadata);
  const item={data,metadata:{...metadata,source:"Bitget Spot",months:metadata.months.length}};
  cache.set(id,item);if(cache.size>3)cache.delete(cache.keys().next().value);
  return item;
 })().finally(()=>inflight.delete(id));
 inflight.set(id,job);
 return job;
}

function validateData(obj,m){
 need(obj?.schema==="aerith.public.ohlcv.shared.monthly-projection.v1"&&
      obj.asset_id===m.id&&obj.pair===m.pair&&obj.month===m.month&&
      obj.quote==="USDT"&&obj.source==="Binance Spot official monthly 1m ZIP"&&
      obj.source_release===m.release&&obj.source_zip_sha256===m.source_zip_sha256&&
      obj.scope==="latest_verified_closed_month"&&
      obj.is_live===false&&obj.max_is_all_time===false&&
      obj.native_1m_count===m.native_1m_count&&
      obj.first_open_ms===m.first_open_ms&&obj.last_open_ms===m.last_open_ms&&
      obj.columns?.join(",")==="open_time_ms,open,high,low,close,base_volume,quote_volume,trade_count",
      "Provenance ou devise non qualifiée");
 for(const [interval,expected]of Object.entries(m.series_counts)){
  need(Object.hasOwn(intervalMs,interval),"Résolution inconnue");
  const rows=obj.series?.[interval],step=intervalMs[interval];
  need(Array.isArray(rows)&&rows.length===expected,"Couverture de période incohérente");
  let previous=null;
  for(const row of rows){
   need(Array.isArray(row)&&row.length===8&&row.every(Number.isFinite),
        "Bougie altérée");
   const [t,o,h,l,c,v,q,n]=row;
   need(Number.isInteger(t)&&t%step===0&&
        (previous===null||t===previous+step)&&
        l>0&&l<=Math.min(o,c)&&Math.max(o,c)<=h&&
        v>=0&&q>=0&&Number.isInteger(n)&&n>=0,
        "Prix, volume, horodatage ou continuité invalide");
   previous=t;
  }
  need(previous===Math.floor(m.last_open_ms/step)*step,
       "Dernière bougie incohérente");
 }
}
async function loadOne(id){
 if(cache.has(id)){const x=cache.get(id);cache.delete(id);cache.set(id,x);return x}
 if(inflight.has(id))return inflight.get(id);
 const work=(async()=>{
   const metadata=(await getIndex()).assets.find(a=>a.id===id);
   need(!!metadata,"Cryptomonnaie non archivée");
   const compressed=await fetchAsset(metadata.file,2000000);
   need(compressed.byteLength===metadata.bytes&&
        await sha256(compressed)===metadata.sha256,
        "Empreinte SHA-256 de la projection incorrecte");
   const plain=await new Response(new Blob([compressed]).stream().pipeThrough(
      new DecompressionStream("gzip"))).text();
   need(new TextEncoder().encode(plain).byteLength<=7500000,
        "Données décompressées trop volumineuses");
   const data=JSON.parse(plain);
   validateData(data,metadata);
   cache.set(id,{data,metadata});
   if(cache.size>3)cache.delete(cache.keys().next().value);
   return {data,metadata};
 })().finally(()=>inflight.delete(id));
 inflight.set(id,work);
 return work;
}
function selectPeriod(archive,period){
 need(Object.hasOwn(periods,period),"Période inconnue");
 const [interval,size]=periods[period],all=archive.data.series[interval];
 const rows=size===null?all:all.slice(-size);
 need(size===null||rows.length===size,
      "Cette archive ne contient pas "+period+" complets (aucune bougie inventée)");
 need(rows.length>0,"Période absente");
 return {rows,interval,pair:archive.data.pair,quote:"USDT",
  asset_id:archive.data.asset_id,month:archive.data.month,
  isLive:false,maxIsAllTime:false};
}
function format(t){return new Date(t).toLocaleString("fr-FR",{timeZone:"UTC"})+" UTC"}
function chart(rows){
 const node=byId("shared-curve"),ctx=node.getContext("2d");
 const w=node.width,h=node.height;
 ctx.fillStyle="#0b1a29";ctx.fillRect(0,0,w,h);
 const step=Math.max(1,Math.ceil(rows.length/(w-28)));
 const values=[];
 for(let n=0;n<rows.length;n+=step)values.push(rows[n][4]);
 if(values.at(-1)!==rows.at(-1)[4])values.push(rows.at(-1)[4]);
 const low=Math.min(...values),high=Math.max(...values),range=high-low||1;
 ctx.beginPath();ctx.lineWidth=1.5;ctx.strokeStyle="#79d8eb";
 values.forEach((p,i)=>{
  const x=12+i*(w-24)/Math.max(1,values.length-1),y=12+(high-p)*(h-24)/range;
  if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
 });
 ctx.stroke();
}
let visual=null,hoverInstalled=false;
function verifiedChart(rows,interval,gaps,pair){
 const canvas=byId("shared-curve"),ctx=canvas.getContext("2d"),w=canvas.width,h=canvas.height;
 const left=94,right=w-77,top=30,bottom=h-35,priceBottom=Math.floor(h*.71);
 const volumeTop=Math.floor(h*.77),volumeBottom=h-34,space=Math.max(1,right-left);
 const begin=rows[0][0],finish=rows.at(-1)[0],step=({"1m":60000,"5m":300000,"1h":3600000,"1d":86400000})[interval];
 const xOf=t=>left+(t-begin)/(finish-begin||1)*space;
 const lo=Math.min(...rows.map(r=>r[3])),hi=Math.max(...rows.map(r=>r[2])),range=hi-lo||1;
 const yOf=p=>top+(hi-p)/range*(priceBottom-top);
 const groupWidth=5;const groups=[];let current=null,previous=null;
 // Rendering aggregation only: do not change the 35 certified source arrays.
 for(const r of rows){
  const t=r[0],slot=Math.floor((xOf(t)-left)/groupWidth);
  const separated=previous!==null && t!==previous+step;
  if(separated)current=null;
  if(!current||current.slot!==slot){
   current={slot,first:t,last:t,o:r[1],h:r[2],l:r[3],c:r[4],
     base:r[5],quote:r[6],trades:r[7],n:1,breakBefore:separated};
   groups.push(current);
  }else{
   current.last=t;current.h=Math.max(current.h,r[2]);current.l=Math.min(current.l,r[3]);
   current.c=r[4];current.base+=r[5];current.quote+=r[6];current.trades+=r[7];current.n++;
  }
  previous=t;
 }
 ctx.fillStyle="#0b1a29";ctx.fillRect(0,0,w,h);
 ctx.font="12px system-ui";ctx.textAlign="right";ctx.fillStyle="#b8d5e4";
 for(let i=0;i<=4;i++){
  const p=lo+(hi-lo)*i/4,y=yOf(p);
  ctx.strokeStyle="rgba(124,162,184,.17)";ctx.lineWidth=1;ctx.beginPath();
  ctx.moveTo(left,y);ctx.lineTo(right,y);ctx.stroke();
  ctx.fillText(new Intl.NumberFormat("fr-FR",{maximumFractionDigits:2}).format(p),left-7,y+3);
 }
 for(const gap of gaps||[]){
  const gx=xOf(gap.start_ms),gr=xOf(gap.end_exclusive_ms);
  ctx.fillStyle="rgba(226,166,77,.18)";
  ctx.fillRect(gx,top,Math.max(2,gr-gx),volumeBottom-top);
  ctx.strokeStyle="#d9aa59";ctx.beginPath();ctx.moveTo(gx,top);ctx.lineTo(gx,volumeBottom);ctx.stroke();
 }
 ctx.textAlign="left";ctx.fillStyle="#bfd5e4";
 ctx.fillText(pair.replace("USDT","/USDT")+" · bougies "+interval+" · prix en USDT",left,17);
 ctx.fillText("Volume moyen par bougie ("+pair.replace("USDT","")+")",left,volumeTop-5);
 // Buckets contain different numbers of genuine candles. Compare *mean* native volume,
 // never raw bucket sums, otherwise a multi-day column looks artificially enormous.
 const maxVolume=Math.max(...groups.map(g=>g.base/g.n),1);
 const choice=byId("shared-style")?.value||"candles";
 let drawing=false;
 for(const g of groups){
  const x=xOf((g.first+g.last)/2),bull=g.c>=g.o;
  const color=bull?"#69cbae":"#f29289";
  const barHeight=((g.base/g.n)/maxVolume)*(volumeBottom-volumeTop);
  ctx.fillStyle=bull?"rgba(89,183,152,.45)":"rgba(220,115,112,.45)";
  ctx.fillRect(x-2,volumeBottom-barHeight,4,barHeight);
  if(choice==="line"){
   if(g.breakBefore&&drawing){ctx.stroke();drawing=false;}
   if(!drawing){ctx.beginPath();ctx.moveTo(x,yOf(g.c));drawing=true;}
   else ctx.lineTo(x,yOf(g.c));
  }else{
   ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();
   ctx.moveTo(x,yOf(g.h));ctx.lineTo(x,yOf(g.l));ctx.stroke();
   ctx.fillStyle=color;
   ctx.fillRect(x-2,Math.min(yOf(g.o),yOf(g.c)),Math.max(2,Math.min(groupWidth-1,4)),Math.max(1,Math.abs(yOf(g.c)-yOf(g.o))));
  }
 }
 if(choice==="line"&&drawing){ctx.strokeStyle="#8cd7ef";ctx.lineWidth=1.5;ctx.stroke();}
 ctx.fillStyle="#b8d5e4";
 for(let i=0;i<=4;i++){
  const time=begin+(finish-begin)*i/4,x=xOf(time);
  ctx.textAlign=i===0?"left":i===4?"right":"center";
  ctx.fillText(new Date(time).toLocaleDateString("fr-FR",{timeZone:"UTC"}),x,h-12);
 }
 visual={canvas,groups,xOf,gaps:gaps||[],pair};
 if(!hoverInstalled&&typeof canvas.addEventListener==="function"){
  canvas.addEventListener("pointermove",ev=>{
   if(!visual)return;
   const bounds=visual.canvas.getBoundingClientRect();
   const at=(ev.clientX-bounds.left)*visual.canvas.width/bounds.width;
   for(const gap of visual.gaps){
    if(at>=visual.xOf(gap.start_ms)&&at<=visual.xOf(gap.end_exclusive_ms)){
     byId("shared-hover").textContent="ARCHIVES ABSENTES : "+dateOnly(gap.start_ms)+
       " → "+dateOnly(gap.end_exclusive_ms-86400000)+" · "+
       gap.missing_bars+" bougies journalières non certifiées. Des minutes sources peuvent exister ; aucune bougie inventée.";
     return;
    }
   }
   let g=null,distance=Infinity;
   for(const item of visual.groups){
    const dx=Math.abs(visual.xOf((item.first+item.last)/2)-at);
    if(dx<distance){distance=dx;g=item;}
   }
   if(!g||distance>15)return;
   const fmt=n=>new Intl.NumberFormat("fr-FR",{maximumFractionDigits:8}).format(n);
   byId("shared-hover").textContent=
     format(g.first)+(g.n>1?" → "+format(g.last):"")+
     " · O "+fmt(g.o)+" · H "+fmt(g.h)+" · B "+fmt(g.l)+" · C "+fmt(g.c)+
     " USDT · Vol total "+fmt(g.base)+" "+visual.pair.replace("USDT","")+
     " · Vol moyen "+fmt(g.base/g.n)+" par bougie · Transactions "+fmt(g.trades)+
     (g.n>1?" · "+g.n+" bougies réelles regroupées à l’écran":"");
  });
  hoverInstalled=true;
 }
}
const dateOnly=ms=>new Date(ms).toLocaleDateString("fr-FR",{timeZone:"UTC",day:"2-digit",month:"long",year:"numeric"});
let activeCertified=null,displayStart=0,displayEnd=0;
const navigationIds=["shared-prev","shared-zoom-in","shared-zoom-out","shared-next","shared-reset"];
function drawWindow(){
 if(!activeCertified)return;
 const v=activeCertified,rows=v.rows.slice(displayStart,displayEnd);
 if(!rows.length)return;
 const ms=({"1m":60000,"5m":300000,"1h":3600000,"1d":86400000})[v.interval];
 const gaps=v.gaps.filter(g=>g.start_ms>=rows[0][0]&&g.end_exclusive_ms<=rows.at(-1)[0]+ms);
 verifiedChart(rows,v.interval,gaps,v.pair);
 byId("shared-range").textContent="Affichage : "+dateOnly(rows[0][0])+" → "+
    dateOnly(rows.at(-1)[0])+" · "+rows.length.toLocaleString("fr-FR")+
    " bougies visibles / "+v.rows.length.toLocaleString("fr-FR")+
    " dans l'archive. Zoom sans téléchargement.";
 byId("shared-prev").disabled=displayStart===0;
 byId("shared-next").disabled=displayEnd===v.rows.length;
 byId("shared-zoom-in").disabled=rows.length<=48;
 byId("shared-zoom-out").disabled=rows.length===v.rows.length;
 byId("shared-reset").disabled=rows.length===v.rows.length;
}
function moveWindow(direction){
 if(!activeCertified)return;
 const total=activeCertified.rows.length,span=displayEnd-displayStart;
 const shift=Math.max(1,Math.floor(span*.75))*direction;
 displayStart=Math.max(0,Math.min(total-span,displayStart+shift));
 displayEnd=displayStart+span;
 drawWindow();
}
function zoomWindow(inward){
 if(!activeCertified)return;
 const total=activeCertified.rows.length,old=displayEnd-displayStart;
 const span=inward?Math.max(48,Math.floor(old/2)):Math.min(total,old*2);
 // Zoom towards the newest observations in the currently selected window.
 displayStart=Math.max(0,Math.min(total-span,displayEnd-span));
 displayEnd=displayStart+span;
 drawWindow();
}
function display(view,metadata){
 const certified=metadata.scope==="certified-core5";
 visual=null;activeCertified=null;
 if(certified){
  activeCertified=view;displayStart=0;displayEnd=view.rows.length;
  drawWindow();
 }else{
  chart(view.rows);
  navigationIds.forEach(id=>byId(id).disabled=true);
  byId("shared-range").textContent="Navigation détaillée réservée aux cinq archives certifiées.";
  byId("shared-explanation").textContent="Lecture historique de "+view.pair+
    " · cotation en USDT, pas un prix en direct.";
  byId("shared-gaps").textContent="Historique hérité : couverture limitée aux périodes publiées pour cet actif.";
 }
 const suffix=certified?" · SHA-256 vérifié · "+view.period+" · "+
   (view.gaps.length?view.gaps.length+" interruption(s) documentée(s)":"aucune lacune"):
   " · périodes suivantes lues sans téléchargement";
 byId("shared-status").textContent="Vérifié · "+view.pair+" · "+view.rows.length.toLocaleString("fr-FR")+
   " bougies "+view.interval+suffix;
 byId("shared-source").textContent=certified?
   (metadata.native_daily?
     "BTC/USDT · MAX QUOTIDIEN : 3 075 jours · 26 bougies Binance Spot 1d natives vérifiées et 3 049 journées dérivées des minutes complètes · 5 881 minutes originales toujours absentes · USDT, jamais USD converti · sans interpolation":
    metadata.integrated?
     "BTC/USDT · MAX SOURCE RECONSTRUIT · 80 mois complets + 21 mois partiels authentiques de mai 2018 à septembre 2026 · "+
     metadata.missing_days+" journées sans bougie 1j complète, minutes sources conservées · Binance Spot USDT · pas de temps réel ni interpolation":
     "Binance Spot · "+view.pair+" · prix cotés en USDT · "+dateOnly(view.rows[0][0])+" → "+dateOnly(view.rows.at(-1)[0])+
     " · Derniers 12 mois clos vérifiés à la minute (oct. 2025 à sept. 2026) ; Max inclut d’autres partitions annuelles archivées · "+
     "Aucune interpolation · pas de prix en direct ni de conversion en USD"):
   (metadata.source==="Bitget Spot"?"Bitget Spot (7 champs natifs, sans transactions)":"Binance Spot")+
   " · "+view.quote+" · mois "+metadata.month+
   " · "+format(view.rows[0][0])+" → "+format(view.rows.at(-1)[0])+
   " · source native : "+metadata.native_1m_count.toLocaleString("fr-FR")+
   " bougies 1m"+(metadata.months?" · "+metadata.months+" mois validés":"")+
   " · pas de temps réel · Max = historique contigu archivé, pas historique total";
 if(certified){
  const step=({"1m":60000,"5m":300000,"1h":3600000,"1d":86400000})[view.interval];
  const begin=dateOnly(view.rows[0][0]),end=dateOnly(view.rows.at(-1)[0]);
  const period=view.period==="Max"?(metadata.native_daily?"Max BTC vérifié · journées natives Binance 1d":metadata.integrated?"Max BTC reconstruit · sources complètes et partielles":"Max (partitions publiées)"):view.period;
  byId("shared-explanation").textContent=
    "VOUS REGARDEZ : "+view.pair+" · "+period+" · du "+begin+" au "+end+
    " · "+view.rows.length.toLocaleString("fr-FR")+" bougies de "+
    (view.interval==="1d"?"1 jour":view.interval==="1h"?"1 heure":view.interval==="1m"?"1 minute":"5 minutes")+
    ". Cotation historique Binance Spot USDT, pas les prix d’aujourd’hui."+
    (metadata.native_daily?" Les 26 anciennes journées incomplètes à la minute utilisent les véritables bougies quotidiennes Binance 1d.":"");
  byId("shared-gaps").textContent=view.gaps.length?
    "ATTENTION — archive incomplète : "+view.gaps.map(g=>
      "du "+dateOnly(g.start_ms)+" au "+dateOnly(g.end_exclusive_ms-step)+
      " ("+g.missing_bars+" "+(view.interval==="1d"?"journées sans bougie quotidienne complète":"bougies absentes")+")").join(" ; ")+
    ". Bande orange = absence de bougie certifiée, pas une chute du prix. Des minutes partielles peuvent exister dans le Coffre.":
    (metadata.native_daily?
      "COUVERTURE 1 JOUR : 3 075/3 075 journées. Les 26 journées rétablies proviennent de bougies Binance 1d officielles ; les 5 881 minutes manquantes à la résolution 1m restent signalées dans le Coffre.":
      "COUVERTURE : aucune lacune dans la période affichée.");
 }
 byId("shared-hover").textContent=certified?
   "Survole les bougies pour voir les cours et les volumes exacts ; les colonnes condensées portent leur nombre de bougies sources.":
   "Courbe historique · aucun prix inventé · source en USDT.";
 const node=byId("shared-table"),head=document.createElement("tr");
 const columns=certified?["UTC","Ouverture","Haut","Bas","Clôture","Volume base","Volume quote","Transactions"]:
   ["UTC","Ouverture","Haut","Bas","Clôture","Volume base"];
 for(const title of columns){
  const th=document.createElement("th");th.textContent=title;head.append(th);
 }
 node.replaceChildren(head);
 for(const r of view.rows.slice(-8)){
  const tr=document.createElement("tr");
  const values=certified?[format(r[0]),...r.slice(1)]:[format(r[0]),...r.slice(1,6)];
  for(const v of values){
   const td=document.createElement("td");td.textContent=String(v);tr.append(td);
  }
  node.append(tr);
 }
}
async function show(){
 const ticket=++seq,button=byId("shared-read");
 const id=byId("shared-asset").value,period=byId("shared-period").value;
 button.disabled=true;
 byId("shared-status").textContent="Lecture de l'archive vérifiée…";
 byId("shared-table").replaceChildren();
 const canvas=byId("shared-curve");
 canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);
 try{
  if(window.SevenVerifiedPeriods?.isPilot(id)&&period!=="mois"){
   const archive=await window.SevenVerifiedPeriods.load(id,period);
   if(ticket===seq)display({rows:archive.rows,interval:archive.data.resolution,
      pair:archive.data.pair,quote:"USDT",asset_id:id,month:archive.metadata.month,
      gaps:archive.data.gaps,period},archive.metadata);
  }else{
   const extra=Object.hasOwn({"60j":1,"90j":1,"1an":1,"Max":1},period);
   const alternative=(await getBitgetIndex().catch(()=>({assets:[]}))).assets.some(a=>a.id===id);
   if(alternative&&extra)throw Error("Bitget : 60j/90j/1an/Max non matérialisés ; choisir 24h, 7j, 30j ou Mois source.");
   const archive=alternative?await loadBitget(id):extra
     ? await window.SevenHourlyHistory.loadOne(id)
     : await loadOne(id);
   const selection=extra
     ? window.SevenHourlyHistory.selectPeriod(archive,period)
     : selectPeriod(archive,period);
   if(ticket===seq)display(selection,archive.metadata);
  }
 }catch(e){
  if(ticket===seq){
   byId("shared-status").textContent="Lecture refusée : "+String(e?.message||e);
   byId("shared-table").replaceChildren();
  }
 }finally{if(ticket===seq)button.disabled=false}
}
async function init(){
 try{
  const x=await getIndex();
  let alt={assets:[]},warning="";
  try{alt=await getBitgetIndex()}catch(e){warning=" · Bitget indisponible : "+String(e?.message||e)}
  const select=byId("shared-asset");select.replaceChildren();
  for(const a of [...x.assets,...alt.assets].sort((a,b)=>a.rank-b.rank)){
   const option=document.createElement("option");
   option.value=a.id;option.textContent="#"+a.rank+" · "+(a.name||a.symbol||a.id)+" ("+a.pair+")";
   select.append(option);
  }
  byId("shared-status").textContent=(x.archived_assets+alt.assets.length)+
   " cryptos disponibles · dernier mois vérifié · lecture sur demande"+warning;
  byId("shared-read").disabled=false;
 }catch(e){
  byId("shared-status").textContent="Index indisponible : "+String(e?.message||e);
 }
}
byId("shared-read")?.addEventListener("click",()=>void show());
byId("shared-period")?.addEventListener("change",()=>{
 if(window.SevenVerifiedPeriods?.isPilot(byId("shared-asset").value)||
    Object.hasOwn({"60j":1,"90j":1,"1an":1,"Max":1},byId("shared-period").value) ||
    cache.has(byId("shared-asset").value))void show();
});
byId("shared-style")?.addEventListener("change",()=>{
 if(activeCertified)drawWindow();else if(visual)void show();
});
byId("shared-prev")?.addEventListener("click",()=>moveWindow(-1));
byId("shared-next")?.addEventListener("click",()=>moveWindow(1));
byId("shared-zoom-in")?.addEventListener("click",()=>zoomWindow(true));
byId("shared-zoom-out")?.addEventListener("click",()=>zoomWindow(false));
byId("shared-reset")?.addEventListener("click",()=>{
 if(!activeCertified)return;
 displayStart=0;displayEnd=activeCertified.rows.length;drawWindow();
});
byId("shared-asset")?.addEventListener("change",()=>{
 if(window.SevenVerifiedPeriods?.isPilot(byId("shared-asset").value))void show();
 else byId("shared-status").textContent="Actif sélectionné · cliquer pour lire le mois archivé";
});
document.addEventListener("seven-vault-select",event=>{
 const id=event.detail?.id,select=byId("shared-asset");
 if(![...select.options].some(option=>option.value===id)){
  byId("shared-status").textContent="Archive non disponible pour "+String(id);
  return;
 }
 select.value=id;
 byId("shared-month-reader").open=true;
 void show();
 byId("shared-month-reader").scrollIntoView({behavior:"smooth",block:"start"});
});
byId("shared-read").disabled=true;
void init();
window.SevenSharedHistory=Object.freeze({index:getIndex,loadOne,loadBitget,selectPeriod});
})();