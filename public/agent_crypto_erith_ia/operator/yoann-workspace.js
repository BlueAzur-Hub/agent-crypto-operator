(function(root){
"use strict";
const SCHEMA="erith.operator.yoann.shared-research-snapshot.v1";
function finite(value){return typeof value==="number"&&Number.isFinite(value)}
function calculatePaper(capital,move,fee,friction){
 if(![capital,move,fee,friction].every(finite)||
  capital<1||capital>100000||move < -99||move>1000||
  fee<0||fee>10||friction<0||friction>20)
  throw new RangeError("Paramètres fictifs hors limites");
 // Both entry and exit fee; additive roundtrip friction is only hypothetical.
 const afterBuy=capital*(1-fee/100);
 const afterMarketMove=afterBuy*(1+move/100);
 const finalValue=afterMarketMove*(1-fee/100)*(1-friction/100);
 return Object.freeze({capital,finalValue,pnl:finalValue-capital,
  netPct:(finalValue/capital-1)*100,breakEvenMovePct:
  (1/((1-fee/100)**2*(1-friction/100))-1)*100});
}
function validSnapshot(d){
 return Boolean(d&&d.schema===SCHEMA&&d.mode==="PUBLISHED_REFERENCE_ONLY_NOT_LIVE"&&
 d.isolation?.no_execution===true&&d.isolation?.no_credentials===true&&
 d.seven_capital?.orders===0&&d.seven_capital?.currency==="USDC"&&
 d.radar20_native?.observed_market_hours===86880&&
 d.radar20_native?.buyer_sequences_3h===152&&
 d.radar20_native?.seller_sequences_3h===144&&
 d.native_okx?.quotes?.join(",")==="USDC,USDT,EUR"&&
 /^2026-\d\d-\d\d$/.test(d.generated_from_master_date_utc));
}
function format(num,digits=2){return num.toLocaleString("fr-FR",{maximumFractionDigits:digits})}
async function mount(){
 const get=id=>document.getElementById(id);
 const status=get("proof-status");if(!status)return;
 const refresh=get("reload-proofs");
 async function read(){
  refresh.disabled=true;status.textContent="Vérification du rapport local publié…";
  try{
   const response=await fetch(new URL("./research-snapshot.json",document.baseURI),
     {cache:"no-store",credentials:"omit",redirect:"error"});
   if(!response.ok)throw Error("Source locale manquante");
   const raw=await response.text();
   if(raw.length>20000)throw Error("Données hors limite");
   const d=JSON.parse(raw);if(!validSnapshot(d))throw Error("Contrat non conforme");
   get("proof-hours").textContent=format(d.radar20_native.observed_market_hours,0);
   get("proof-buy").textContent=format(d.radar20_native.buyer_sequences_3h,0);
   get("proof-sell").textContent=format(d.radar20_native.seller_sequences_3h,0);
   get("proof-time").textContent=d.generated_from_master_date_utc;
   get("market-evidence").textContent=d.native_okx.pairs+
    " paires Spot observées · "+d.native_okx.observed_as_of_utc+
    " · 3 devises distinctes, sans conversion implicite.";
   get("market-source").href=d.native_okx.source_url;
   get("strategy-evidence").textContent=
    "Rapport historique : "+format(d.radar20_native.native_trade_executions_count,0)+
    " transactions natives en bougies 1 h ; "+
    format(d.radar20_native.observed_market_hours,0)+
    " observations actif-heure. Aucune rentabilité future démontrée.";
   get("strategy-source").href=d.radar20_native.source_url;
   get("capital-evidence").textContent=
    "Cohorte "+d.seven_capital.cohort_date+" · "+
    d.seven_capital.research_candidates.map(x=>x.symbol+" : "+x.state).join(" · ")+
    ". Aucun ordre. Budget fictif, pas solde du compte.";
   get("capital-source").href=d.seven_capital.source_url;
   status.textContent="Instantané local d'origine GitHub · "+
     d.generated_from_master_date_utc+" · référence datée, pas de flux live.";
  }catch(_){
   for(const id of ["proof-hours","proof-buy","proof-sell","proof-time"])
    get(id).textContent="—";
   status.textContent="Sources absentes ou invalides : aucune sélection ni mesure certifiée.";
  }finally{refresh.disabled=false}
 }
 refresh.addEventListener("click",()=>void read());
 get("ledger-form")?.addEventListener("submit",event=>{
  event.preventDefault();
  const form=event.currentTarget,output=get("ledger-result");
  try{
   const values=["capital","move","fee","friction"].map(k=>{
    const input=form.elements.namedItem(k),s=input?.value;
    if(typeof s!=="string"||!s.trim())throw Error("Paramètre requis");
    return Number(s);
   });
   const r=calculatePaper(...values);
   output.textContent="Valeur finale fictive : "+format(r.finalValue,4)+
    " USDC · résultat : "+(r.pnl>=0?"+":"")+format(r.pnl,4)+
    " USDC ("+(r.netPct>=0?"+":"")+format(r.netPct,2)+
    " %) · hausse théorique minimale pour couvrir ces coûts : "+
    format(r.breakEvenMovePct,3)+" %. Aucun ordre.";
  }catch(_){output.textContent="Entrée invalide : aucun résultat affichable."}
 });
 await read();
}
if(typeof module==="object"&&module.exports)module.exports={calculatePaper,validSnapshot};
if(typeof document!=="undefined"){
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
 else void mount();
}
})(typeof globalThis!=="undefined"?globalThis:this);
