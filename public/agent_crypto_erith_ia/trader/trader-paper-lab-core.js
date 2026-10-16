/* ERITH.IA · Laboratoire PAPER BTC/CT : modeles arithmetiques purs.
   ZERO ordre, fonds, HTTP, calendrier, cache ou acces prive. */
((root,factory)=>{
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.AgentCryptoPaperLabCore=api;
})(typeof globalThis!=="undefined"?globalThis:null,()=>{
"use strict";
const assets=Object.freeze(["BTC","CT"]);
const finite=n=>typeof n==="number"&&Number.isFinite(n);
const range=(n,min,max)=>finite(n)&&n>=min&&n<=max;
const reject=reason=>Object.freeze({ok:false,reason});
function qualify(input,now=Date.now()){
  if(!input||!assets.includes(input.asset))return reject("BTC ou CT uniquement");
  if(input.currency!=="USD")return reject("Prix et devise USD non attestés");
  if(!Array.isArray(input.series)||input.series.length<21||input.series.length>2000)
    return reject("21 à 2000 points de source réelle nécessaires");
  const source=String(input.source||"");
  if(input.asset==="BTC" &&
     !(input.instrument==="BTC-USD"&&input.provider==="coingecko"&&/coingecko/i.test(source)))
    return reject("Provenance BTC/USD CoinGecko absente");
  const canonicalInstrument=String(input.instrument||"").toUpperCase().replace("/","-");
  if(input.asset==="CT" &&
     !(canonicalInstrument==="CT-USDT"&&input.provider==="okx"&&
       /OKX.*CT[/\-]USDT/i.test(source)&&/USDT[/\-]USD.*CoinGecko/i.test(source)))
    return reject("CT/USDT et conversion USDT/USD CoinGecko non démontrés");
  let prev=0;
  for(const p of input.series){
    if(!Array.isArray(p)||p.length<2||!finite(p[0])||!finite(p[1])||p[0]<=prev||p[1]<=0)
      return reject("Points absents, hors chronologie ou prix invalide");
    prev=p[0];
  }
  const age=now-prev;
  if(!finite(now)||age<0||age>15*60000)return reject("Cours différé ou horodatage non cohérent (15 min max)");
  const price=input.series[input.series.length-1][1];
  return Object.freeze({ok:true,asset:input.asset,instrument:canonicalInstrument,
    currency:"USD",provider:input.provider,source,points:input.series.length,
    lastAt:new Date(prev).toISOString(),capturedAt:new Date(now).toISOString(),
    price,ageMs:age,sourceIdentity:input.provider+"|"+canonicalInstrument+"|USD"});
}
function assess(config){
  const c=config||{};
  const capital=Number(c.capital),entryFee=Number(c.entryFeePct),
    exitFee=Number(c.exitFeePct),spread=Number(c.spreadPct),slippage=Number(c.slippagePct),
    price=Number(c.price);
  if(!range(capital,0.01,1000000)||!range(price,1e-12,1e12))
    return reject("Capital notionnel ou prix invalide");
  if(!range(entryFee,0,10)||!range(exitFee,0,10)||
     !range(spread,0,25)||!range(slippage,0,25))
    return reject("Coûts hypothétiques hors bornes");
  const b=1+spread/200+slippage/100;
  const s=1-spread/200-slippage/100;
  if(s<=0)return reject("Coûts de sortie incohérents");
  const quantity=capital*(1-entryFee/100)/(price*b);
  const future=move=>{
    const priceAfter=price*(1+move/100);
    const net=quantity*priceAfter*s*(1-exitFee/100);
    return Object.freeze({movePct:move,priceAfter,net,profit:net-capital,
      returnPct:100*(net-capital)/capital});
  };
  const threshold=100*(capital/(quantity*price*s*(1-exitFee/100))-1);
  return Object.freeze({ok:true,capital,price,quantity,entryFeePct:entryFee,
    exitFeePct:exitFee,spreadPct:spread,slippagePct:slippage,
    breakEvenMovePct:threshold,scenarios:Object.freeze([-5,0,5].map(future)),
    simulate:future,notional:"USD papier seulement ; USDC/USD non présumé 1:1",
    realOrders:false,feesProven:false});
}
function prospective(entry,current,config){
  if(!entry?.ok||!current?.ok)return reject("Deux preuves datées requises");
  if(entry.asset!==current.asset||entry.sourceIdentity!==current.sourceIdentity)
    return reject("Paire, fournisseur ou devise différents");
  const start=Date.parse(entry.lastAt),end=Date.parse(current.lastAt);
  if(!finite(start)||!finite(end)||end<=start)return reject("Nouvelle observation postérieure nécessaire");
  const plan=assess({...config,price:entry.price});
  if(!plan.ok)return plan;
  const movePct=100*(current.price/entry.price-1);
  if(!finite(movePct)||movePct<=-100)return reject("Cours ultérieur incohérent");
  const result=plan.simulate(movePct);
  return Object.freeze({ok:true,asset:entry.asset,entryAt:entry.lastAt,exitAt:current.lastAt,
    entryPrice:entry.price,exitPrice:current.price,sourceIdentity:entry.sourceIdentity,
    movePct,capital:plan.capital,paperNet:result.net,paperProfit:result.profit,
    paperReturnPct:result.returnPct,assumptions:Object.freeze({
      entryFeePct:plan.entryFeePct,exitFeePct:plan.exitFeePct,
      spreadPct:plan.spreadPct,slippagePct:plan.slippagePct}),
    paper:true,actualExecution:false,marketDepthChecked:false,
    minimumOrderChecked:false,realOrders:false});
}
return Object.freeze({qualify,assess,prospective,realOrders:false,storage:false,
  fetch:false,readOnly:true,versionlessFiles:true});
});
