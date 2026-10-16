/* ERITH.IA Radar20 — preuve publique, lecture seule, sans compte/ordre. */
(() => {
"use strict";
const ROOT="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/trader_flux/radar20_forward/";
const SHA=/^[0-9a-f]{64}$/i;
const VARIANTS=["A_0.8","A_1.2","A_1.6","B_0.8","B_1.2","B_1.6"];
function num(v,name){if(typeof v!=="number"||!Number.isFinite(v))throw Error("Valeur non contrôlée : "+name);return v;}
function evaluate(protocol,index,summary){
  if(protocol?.schema!=="erith.trader.radar20.forward-protocol.v1"||
    index?.schema!=="erith.radar20.forward.index.v1"||
    summary?.schema!=="erith.radar20.forward.summary.v1")throw Error("Schéma de source inattendu");
  if(protocol.simulation_only!==true||protocol.trading_orders_enabled!==false||
    index.orders_enabled!==false||summary.no_live_orders!==true||
    protocol.strategy_certified!==false||summary.strategy_certified!==false)
    throw Error("Contrat recherche seule non confirmé");
  if(!SHA.test(index.config_sha256||"")||summary.protocol_sha256!==index.config_sha256)
    throw Error("Contrat SHA-256 incohérent");
  if(!Array.isArray(protocol.symbols)||protocol.symbols.length!==20||
    new Set(protocol.symbols).size!==20||protocol.test_days!==90||
    protocol.holding_hours!==48)throw Error("Paramètres de recherche modifiés");
  if(!Array.isArray(index.days)||index.days.length>92||
    num(summary.days_collected,"days_collected")!==index.days.length||
    summary.hours_per_market!==24)throw Error("Compteurs de journées incohérents");
  if(index.days.some((d,i)=>!(/^\d{4}-\d{2}-\d{2}$/.test(d.day||""))||
    !SHA.test(d.sha256||"")||d.file!=="observations/"+d.day+".json"||
    (i>0&&d.day<=index.days[i-1].day)))throw Error("Index journées non conforme");
  const rows=VARIANTS.map(key=>{
    const v=summary.variants?.[key];
    if(!v||!Number.isInteger(v.signals)||v.signals<0||
      !Number.isInteger(v.closed_trades)||v.closed_trades<0||
      !Number.isInteger(v.open_positions)||v.open_positions<0)throw Error("Variante invalide : "+key);
    return {name:key.startsWith("A")?"A · modèle initial":"B · filtre tendance",
      cost:num(v.cost_pct,key+" cost"),signals:v.signals,open:v.open_positions,
      closed:v.closed_trades,equity:num(v.equity_usdt,key+" equity"),
      pnl:num(v.realized_usdt,key+" realized"),
      drawdown:num(v.worst_drawdown_usdt,key+" drawdown")};
  });
  return {days:index.days.length,signalsDays:Math.min(index.days.length,90),
    lastDay:index.days.at(-1)?.day||null,status:String(summary.status||"INCONNU"),
    rows,closed:rows.reduce((n,r)=>n+r.closed,0),
    protocolSha:index.config_sha256,
    summarySha:index.outputs?.find(v=>v.file==="summary.json")?.sha256||null};
}
if(typeof module!=="undefined"&&module.exports)module.exports=Object.freeze({evaluate});
if(typeof document==="undefined")return;
const id=x=>document.getElementById(x);
const show=(name,v)=>{id(name).textContent=v;};
const number=(v,d=2)=>new Intl.NumberFormat("fr-FR",{minimumFractionDigits:d,maximumFractionDigits:d}).format(v);
async function source(name){
  const r=await fetch(ROOT+name,{cache:"no-store",credentials:"omit",mode:"cors"});
  if(!r.ok)throw Error("Fichier indisponible : "+name+" (HTTP "+r.status+")");
  return r.text();
}
async function checksum(s){
  if(!globalThis.crypto?.subtle)throw Error("SHA-256 indisponible dans ce navigateur");
  const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));
  return Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,"0")).join("");
}
function fillTable(rows){
  const tbody=id("variants");tbody.replaceChildren();
  for(const r of rows){
    const tr=document.createElement("tr");
    for(const [text,cls] of [[r.name,""],[number(r.cost,1)+" %",""],
       [String(r.signals),""],[String(r.open),""],[String(r.closed),""],
       [number(r.equity)+" USDT",""],[number(r.pnl)+" USDT",r.pnl>0?"pos":r.pnl<0?"neg":""],
       [number(r.drawdown)+" USDT",""]]){
      const td=document.createElement("td");td.textContent=text;
      if(cls)td.className=cls;tr.append(td);
    }
    tbody.append(tr);
  }
}
let loading=false;
async function refresh(){
 if(loading)return;loading=true;id("refresh").disabled=true;show("verification","Contrôle des sources et SHA-256…");
 try{
  const [p,i,s]=await Promise.all([source("experiment.json"),source("index.json"),source("summary.json")]);
  const data=evaluate(JSON.parse(p),JSON.parse(i),JSON.parse(s));
  if(await checksum(p)!==data.protocolSha||!SHA.test(data.summarySha||"")||
     await checksum(s)!==data.summarySha)throw Error("Empreinte protocole / résumé différente : chiffres refusés");
  show("days",data.signalsDays+" / 90");show("archives",data.days+" / 92 max.");
  show("closed",String(data.closed));show("last-day",data.lastDay||"Aucune");
  show("state",data.status);fillTable(data.rows);
  show("observation",data.closed===0?"Aucune transaction simulée clôturée : cela ne prouve ni gain ni perte.":"Transactions fictives seulement : frais estimés, aucune exécution OKX prouvée.");
  show("verification","Protocole et résumé contrôlés par SHA-256 · "+new Date().toLocaleString("fr-FR")+
    ". Les fichiers quotidiens ne sont pas retéléchargés ici ; leur intégrité relève du contrôle scientifique GitHub Actions.");
 }catch(e){
   ["days","archives","closed","last-day","state"].forEach(n=>show(n,"—"));
   id("variants").replaceChildren();show("observation","Aucune conclusion sans preuve cohérente.");
   show("verification","Lecture non validée : "+String(e?.message||e).slice(0,190));
 }finally{loading=false;id("refresh").disabled=false;}
}
function boot(){id("refresh").addEventListener("click",refresh);void refresh();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
else boot();
})();