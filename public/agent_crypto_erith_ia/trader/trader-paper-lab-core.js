/* ERITH.IA · Laboratoire PAPER BTC/CT : modeles arithmetiques purs.
   ZERO ordre, fonds, HTTP, calendrier, cache ou acces prive. */
((root,factory)=>{
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.AgentCryptoPaperLabCore=api;
})(typeof globalThis!=="undefined"?globalThis:null,()=>{
"use strict";
const assets=Object.freeze(["BTC","CT"]);
const spotSymbol=/^[A-Z0-9]{1,20}$/;
const coingeckoId=/^[a-z0-9][a-z0-9-]{1,99}$/;
const finite=n=>typeof n==="number"&&Number.isFinite(n);
const range=(n,min,max)=>finite(n)&&n>=min&&n<=max;
const reject=reason=>Object.freeze({ok:false,reason});
function qualify(input,now=Date.now()){
  const symbol=String(input?.asset||"");
  const isMarketCoin=symbol!=="BTC"&&symbol!=="CT"&&spotSymbol.test(symbol);
  if(!input||(symbol!=="BTC"&&symbol!=="CT"&&!isMarketCoin))
    return reject("Symbole crypto absent ou invalide");
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
       /OKX.*CT[/-]USDT/i.test(source)&&/USDT[/-]USD.*CoinGecko/i.test(source)))
    return reject("CT/USDT et conversion USDT/USD CoinGecko non démontrés");
  const id=isMarketCoin?String(input.coinId||""):null;
  if(isMarketCoin&&!(coingeckoId.test(id)&&input.provider==="coingecko"&&
     canonicalInstrument===symbol+"-USD"&&/coingecko/i.test(source)&&
     !/USDT|USDC|conversion|converti|proxy/i.test(source)))
    return reject("Identité CoinGecko, paire directe USD ou fournisseur non vérifiés");
  let prev=0;
  for(const p of input.series){
    if(!Array.isArray(p)||p.length<2||!finite(p[0])||!finite(p[1])||p[0]<=prev||p[1]<=0)
      return reject("Points absents, hors chronologie ou prix invalide");
    prev=p[0];
  }
  const age=now-prev;
  if(!finite(now)||age<0||age>15*60000)return reject("Cours différé ou horodatage non cohérent (15 min max)");
  const price=input.series[input.series.length-1][1];
  return Object.freeze({ok:true,asset:input.asset,coinId:id,instrument:canonicalInstrument,
    currency:"USD",provider:input.provider,source,points:input.series.length,
    lastAt:new Date(prev).toISOString(),capturedAt:new Date(now).toISOString(),
    price,ageMs:age,sourceIdentity:input.provider+"|"+canonicalInstrument+"|USD"+
      (isMarketCoin?"|"+id:"")});
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
// Retrospective rolling example, NOT a signal, a backtested portfolio, or a live result.
// All windows overlap. Each one is an independent hypothetical buy then sale.
function historicalStudy(input,config,now=Date.now()){
  const q=qualify(input,now);
  if(!q.ok)return q;
  const priceRows=input.series,holdMs=60*60000,maxGap=10*60000;
  let j=1,win=0,loss=0;
  const results=[];
  for(let i=0;i<priceRows.length-1;i++){
    const start=priceRows[i][0],target=start+holdMs;
    if(j<=i)j=i+1;
    while(j<priceRows.length&&priceRows[j][0]<target)j++;
    if(j>=priceRows.length)break;
    const elapsed=priceRows[j][0]-start;
    if(elapsed>holdMs+maxGap)continue;
    const plan=assess({...config,price:priceRows[i][1]});
    if(!plan.ok)return plan;
    const movePct=100*(priceRows[j][1]/priceRows[i][1]-1);
    const r=plan.simulate(movePct);
    results.push(r.profit);
    if(r.profit>0)win++;
    else if(r.profit<0)loss++;
  }
  if(results.length<10)return reject("Historique insuffisant pour une étude 1 h (au moins 10 fenêtres).");
  const sorted=results.slice().sort((a,b)=>a-b);
  const n=sorted.length,mid=Math.floor(n/2);
  return Object.freeze({ok:true,asset:q.asset,sourceIdentity:q.sourceIdentity,
    firstAt:new Date(priceRows[0][0]).toISOString(),lastAt:q.lastAt,
    windows:n,profitable:win,losing:loss,profitablePct:100*win/n,
    medianProfit:n%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2,
    bestProfit:sorted[n-1],worstProfit:sorted[0],
    avgProfit:results.reduce((a,b)=>a+b,0)/n,
    capital:Number(config?.capital),holdMinutes:60,
    overlapping:true,independentTrades:true,retrospective:true,
    predictive:false,realOrders:false,feesProven:false});
}
return Object.freeze({qualify,assess,prospective,historicalStudy,realOrders:false,storage:false,
  fetch:false,readOnly:true,versionlessFiles:true});
});
