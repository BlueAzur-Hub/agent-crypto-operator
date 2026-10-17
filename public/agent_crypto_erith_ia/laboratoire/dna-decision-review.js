/* ERITH.IA — DNA/USDT Spot PAPER : retrospective observations, not orders. */
(function(root,factory){
 "use strict";
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root&&root.document)root.ErithDnaReview=api;
})(typeof globalThis==="object"?globalThis:this,function(){
 "use strict";
 const finite=n=>typeof n==="number"&&Number.isFinite(n);
 function stop(reason){throw Error("DNA REVIEW STOP: "+reason)}
 function study(s){
  if(!s||s.schema!=="erith.dna.paper.48h.v1"||s.mode!=="PAPER"||
     s.executed_order!==false||s.order_permissions!==false||
     s.private_account_access!==false||s.market!=="DNAUSDT"||
     s.venue!=="Bitget"||s.type!=="SPOT"||s.quote!=="USDT"||
     s.token?.contract!=="0xA991F61940095AEA0724ef54077223B048c5CF7b")
    stop("identity/policy");
  if(!Array.isArray(s.observations)||!Array.isArray(s.scenarios)||
     s.scenarios.length!==3||[10,25,100].some((n,i)=>s.scenarios[i].capital_usdc!==n))
    stop("missing independent scenarios");
  let previous=0;
  const rows=s.observations.map(o=>{
   const time=Date.parse(o.observed_at);
   if(!Number.isFinite(time)||time<=previous&&previous!==0||
      !Number.isFinite(Date.parse(o.dna_book_at))||
      Math.abs(Date.parse(o.dna_book_at)-time)>120000)stop("unverified time");
   previous=time;
   if(![o.dna_bid,o.dna_ask,o.dna_spread_pct,o.fx_bid,o.fx_ask].every(finite)||
      o.dna_bid<=0||o.dna_ask<=o.dna_bid||o.fx_bid<=0||
      o.fx_ask<=o.fx_bid||o.dna_spread_pct<0||
      Math.abs(o.dna_spread_pct-200*(o.dna_ask-o.dna_bid)/(o.dna_ask+o.dna_bid))>0.01)
     stop("book integrity");
   if(!Array.isArray(o.scenarios)||o.scenarios.length!==3||
      o.scenarios.some((p,i)=>p.capital_usdc!==s.scenarios[i].capital_usdc||
         !["valued","blocked","unpriced"].includes(p.status)||
         p.status==="valued"&&(!finite(p.pnl_pct)||!finite(p.pnl_usdc))))
     stop("valuation integrity");
   return {at:o.observed_at,epoch:time,bid:o.dna_bid,ask:o.dna_ask,
       spread:o.dna_spread_pct,pnl:o.scenarios};
  });
  const candidates=[];
  for(let i=2;i<rows.length;i++){
   const [a,b,c]=rows.slice(i-2,i+1);
   if(a.bid<b.bid&&b.bid<c.bid&&[a,b,c].every(x=>x.spread<=0.5)&&
      b.epoch-a.epoch<=21600000&&c.epoch-b.epoch<=21600000)
     candidates.push(c.at);
  }
  const portfolios=s.scenarios.map((sc,i)=>{
   const valid=rows.filter(r=>r.pnl[i].status==="valued");
   const best=valid.reduce((a,b)=>!a||b.pnl[i].pnl_pct>a.pnl[i].pnl_pct?b:a,null);
   const worst=valid.reduce((a,b)=>!a||b.pnl[i].pnl_pct<a.pnl[i].pnl_pct?b:a,null);
   const trigger=valid.find(r=>r.pnl[i].pnl_pct<=-3||r.pnl[i].pnl_pct>=1);
   const last=rows.at(-1);
   return {capital_usdc:sc.capital_usdc,
    best:best&&{at:best.at,pnl_pct:best.pnl[i].pnl_pct},
    worst:worst&&{at:worst.at,pnl_pct:worst.pnl[i].pnl_pct},
    last:last&&last.pnl[i].status==="valued"?last.pnl[i].pnl_pct:null,
    first_threshold:trigger&&{at:trigger.at,kind:trigger.pnl[i].pnl_pct<=-3?"loss":"profit",
      observed_pct:trigger.pnl[i].pnl_pct}};
  });
  return {schema:"erith.dna.decision-review.v1",source:"Bitget Spot DNAUSDT",
    count:rows.length,last_at:rows.at(-1)?.at||null,
    candidate_spot_timestamps:candidates,portfolios,order_decision:"NO_ORDER",
    futures_decision:"INSUFFICIENT_OKX_FUTURES_DATA",
    disclaimer:"Rétrospectif et ponctuel. Aucun ordre stop/TP exécuté. Prix entre relevés et exécution inconnus."};
 }
 return Object.freeze({study});
});
