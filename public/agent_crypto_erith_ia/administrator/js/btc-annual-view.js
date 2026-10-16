/* Seven Heaven · BTC annual 1m archive view, offline/readonly after fetch.
 * Independent lab: never touches Trader, Market, Graph, Bridge, IndexedDB.
 */
(() => {
"use strict";
const base=new URL("../../data/historical_archive_prototype/btc_annual_view/",document.currentScript.src);
const specs={"24h":["1m",1440],"7j":["5m",2016],"30j":["5m",8640],
             "60j":["1h",1440],"90j":["1h",2160],"1an":["1h",8760],"Max":["1h",null]};
const step={"1m":60000,"5m":300000,"1h":3600000};
const byId=(id)=>document.getElementById(id);
const strict=(ok,msg)=>{if(!ok)throw Error(msg)};
let loaded=null,loading=null;
function digestHex(buffer){return crypto.subtle.digest("SHA-256",buffer).then(d=>
 Array.from(new Uint8Array(d),v=>v.toString(16).padStart(2,"0")).join(""))}
async function read(relative,cap) {
 strict(/^(?:index\.json|btc-history-year\.json\.gz)$/.test(relative),"Chemin inconnu");
 const u=new URL(relative,base);
 strict(u.origin===location.origin&&u.pathname.startsWith(base.pathname),"Origine d'archive interdite");
 const response=await fetch(u.href,{credentials:"omit",redirect:"error",cache:"no-store"});
 strict(response.ok,"HTTP "+response.status+" : "+relative);
 const buffer=await response.arrayBuffer();
 strict(buffer.byteLength>0&&buffer.byteLength<=cap,"Taille du fichier incorrecte");
 return buffer;
}
function validate(data,index){
 strict(data?.schema==="aerith.public.ohlcv.btc.verified-monthly-view.v1"&&
        index?.schema==="aerith.public.ohlcv.btc.verified-monthly-index.v1",
        "Contrat d'archive incorrect");
 strict(data.asset_id==="bitcoin"&&data.pair==="BTCUSDT"&&data.quote==="USDT"&&
        data.is_live===false&&data.max_is_all_time===false&&
        index.quote==="USDT"&&index.pair==="BTCUSDT"&&index.max_is_all_time===false,
        "Source ou devise non qualifiée");
 strict(data.columns?.join(",")==="open_time_ms,open,high,low,close,base_volume,quote_volume,trade_count",
        "Colonnes d'archive non qualifiées");
 strict(data.first_open_ms===index.first_open_ms&&
        data.last_open_ms===index.last_open_ms&&
        data.native_1m_count===index.native_1m_count&&
        Array.isArray(data.sources)&&data.sources.length===12&&
        data.sources.map(s=>s.month).join(",")===index.source_months?.join(","),
        "Mois de source ou bornes incohérents");
 strict(data.sources.every(s=>s.tag==="crypto-spot-bulk-"+s.month+"-1m"&&
        /^[a-f0-9]{64}$/.test(s.sha256)&&Number.isInteger(s.candles)&&s.candles>0),
        "Provenance mensuelle invalide");
 for(const [interval,expected]of [["1m",1440],["5m",8640],["1h",null]]){
   const rows=data.series?.[interval];
   strict(Array.isArray(rows)&&rows.length===(index.series_counts?.[interval])&&
          (expected===null||rows.length===expected),
          "Nombre de chandelles incompatible : "+interval);
   let last=null;
   for(const r of rows){
     strict(Array.isArray(r)&&r.length===8&&r.every(v=>typeof v==="number"&&Number.isFinite(v)),
            "Chandelle malformée");
     const [t,o,h,l,c,v,q,n]=r;
     strict(Number.isInteger(t)&&t%step[interval]===0&&
            (last===null||t===last+step[interval])&&
            o>0&&l>0&&l<=Math.min(o,c)&&Math.max(o,c)<=h&&
            v>=0&&q>=0&&Number.isInteger(n)&&n>=0,
            "OHLCV absent, altéré ou troué");
     last=t;
   }
   strict(last===Math.floor(index.last_open_ms/step[interval])*step[interval],
          "La dernière bougie ne correspond pas à l'archive");
 }
 strict(data.series["1h"].length===8760||data.series["1h"].length===8784,
        "Couverture annuelle incomplète");
}
async function getData(){
 if(loaded)return loaded;
 if(!loading)loading=(async()=>{
   strict(!!crypto?.subtle&&typeof DecompressionStream==="function",
          "Firefox requiert HTTPS et DecompressionStream");
   const index=JSON.parse(new TextDecoder().decode(await read("index.json",32000)));
   strict(index.file==="btc-history-year.json.gz"&&/^[0-9a-f]{64}$/.test(index.sha256),
          "Index non qualifié");
   const zipped=await read(index.file,3500000);
   strict(index.bytes===zipped.byteLength&&await digestHex(zipped)===index.sha256,
          "Empreinte SHA-256 de l'archive incorrecte");
   const decoded=await new Response(new Blob([zipped]).stream().pipeThrough(
                  new DecompressionStream("gzip"))).text();
   strict(new TextEncoder().encode(decoded).byteLength<=8000000,
          "Contenu décompressé excessif");
   const data=JSON.parse(decoded);
   validate(data,index);
   return {data,index};
 })().then(v=>(loaded=v,v)).catch(e=>{loading=null;throw e});
 return loading;
}
function readPeriod(archive,period){
 strict(Object.hasOwn(specs,period),"Période invalide");
 const [interval,count]=specs[period];
 const all=archive.data.series[interval],rows=count===null?all:all.slice(-count);
 strict(rows.length===(count??all.length),"Couverture insuffisante pour "+period);
 return {rows,interval,first:rows[0][0],last:rows.at(-1)[0],
         source:"Binance Spot",quote:"USDT",maxIsAllTime:false,isLive:false};
}
function fmt(time){return new Date(time).toLocaleString("fr-FR",{timeZone:"UTC"})+" UTC"}
function curve(rows){
 const c=byId("btc-year-curve"),ctx=c.getContext("2d");
 const w=c.width,h=c.height;ctx.clearRect(0,0,w,h);
 ctx.fillStyle="#0b1a29";ctx.fillRect(0,0,w,h);
 const take=Math.max(1,Math.ceil(rows.length/(w-36)));
 const prices=[];for(let i=0;i<rows.length;i+=take)prices.push(rows[i][4]);
 prices.push(rows.at(-1)[4]);
 const low=Math.min(...prices),high=Math.max(...prices),range=high-low||1;
 ctx.strokeStyle="#6cd6e9";ctx.lineWidth=1.65;ctx.beginPath();
 prices.forEach((p,i)=>{const x=12+i*(w-24)/(prices.length-1);
   const y=12+(high-p)*(h-24)/range;
   i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
 ctx.stroke();
}
function output(rows,interval,period,index){
 curve(rows);
 byId("btc-year-status").textContent="Archive vérifiée · "+period+" · "+rows.length.toLocaleString("fr-FR")+" bougies "+interval+" · pas de réseau lors du changement de période";
 byId("btc-year-coverage").textContent="BTC/USDT · Binance Spot · "+
   fmt(rows[0][0])+" → "+fmt(rows.at(-1)[0])+
   " · source 1m : "+index.native_1m_count.toLocaleString("fr-FR")+
   " bougies · Max = couverture archivée, pas toute l'histoire Bitcoin · aucune donnée temps réel";
 const t=byId("btc-year-table");t.replaceChildren();
 const head=document.createElement("tr");
 for(const label of ["UTC","Ouv.","Haut","Bas","Clôt.","Volume BTC"]){
   const th=document.createElement("th");th.textContent=label;head.append(th)}
 t.append(head);
 for(const r of rows.slice(-8)){
   const tr=document.createElement("tr");
   for(const v of [fmt(r[0]),...r.slice(1,6)]){
     const td=document.createElement("td");td.textContent=String(v);tr.append(td)}
   t.append(tr);
 }
}
async function show(){
 const button=byId("btc-year-read");
 button.disabled=true;byId("btc-year-status").textContent="Lecture et validation de l'archive annuelle…";
 try {
   const a=await getData();
   const period=byId("btc-year-period").value;
   const r=readPeriod(a,period);
   output(r.rows,r.interval,period,a.index);
 }catch(e){
   byId("btc-year-status").textContent="ÉCHEC de lecture : "+String(e?.message||e);
   byId("btc-year-table").replaceChildren();
 }finally{button.disabled=false}
}
byId("btc-year-read")?.addEventListener("click",show);
byId("btc-year-period")?.addEventListener("change",()=>{if(loaded)show()});
window.SevenBTCAnnualView=Object.freeze({load:getData,readPeriod});
})();