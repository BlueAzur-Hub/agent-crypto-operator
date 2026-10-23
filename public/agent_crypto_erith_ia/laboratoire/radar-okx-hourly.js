/* ERITH.IA Radar · Existing public page, dated OKX EEA observations only.
   No market API calls from Firefox, private account, execution or prediction. */
(function(root,factory){
"use strict";
const api=factory();
if(typeof module==="object"&&module.exports)module.exports=api;
if(root){root.AgentCryptoRadarOkxHourly=api;if(root.document)api.mount(root.document);}
})(typeof globalThis!=="undefined"?globalThis:null,()=>{
"use strict";
const SCHEMA="erith.radar.okx-hourly-evidence.v1";
const PAIRS=new Set(["BTC","ETH","SOL","XRP","OKB","CT"].flatMap(
 base=>["USDC","USDT","EUR"].map(quote=>base+"-"+quote)));
const allowedQuote=new Set(["USDC","USDT","EUR"]);
function utc(value){
 if(typeof value!=="string"||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(value))return NaN;
 const t=Date.parse(value);
 return Number.isFinite(t)?t:NaN;
}
function nonnegative(value){
 if(typeof value!=="string"||!/^(\d+)(\.\d+)?$/.test(value))return null;
 const n=Number(value);
 return Number.isFinite(n)&&n>=0?n:null;
}
function positive(value){const n=nonnegative(value);return n!==null&&n>0?n:null;}
function valid(input,now=Date.now()){
 if(!Number.isFinite(now)||input?.schema!==SCHEMA||
    input.kind!=="public_observational_spreads_and_native_quote_prices"||
    input.orders_enabled!==false||input.real_orders!==0||input.paper_fills!==0||
    input.trading_signals_issued!==0||input.strategy_certified!==false||
    input.no_interpolation!==true||input.no_quote_conversion!==true||
    !Array.isArray(input.quotes_separate)||
    input.quotes_separate.join("|")!=="USDC|USDT|EUR"||
    !Number.isInteger(input.observed_hours_total)||input.observed_hours_total<1||
    !Number.isInteger(input.pairs_with_public_books)||
    !Number.isInteger(input.pairs_with_two_or_more_hours)||
    !Array.isArray(input.pairs)||input.pairs.length<1||input.pairs.length>PAIRS.size||
    input.pairs_with_public_books!==input.pairs.length||
    input.pairs_with_two_or_more_hours>input.pairs.length)
  throw Error("Bilan public OKX non vérifié ou incompatible");
 const asOf=utc(input.as_of_utc);
 if(!Number.isFinite(asOf)||asOf>now+30000)
  throw Error("Horodatage global invalide ou futur");
 const seen=new Set();
 const rows=input.pairs.map(p=>{
   if(!PAIRS.has(p?.pair)||seen.has(p.pair)||!allowedQuote.has(p.quote)||
      !p.pair.endsWith("-"+p.quote)||p.market_fill_proven!==false||
      p.trading_signal!==false||!Number.isInteger(p.book_samples)||
      p.book_samples<1||p.book_samples>input.observed_hours_total||
      p.status!==(p.book_samples===1?"AWAITING_SECOND_HOUR":"DESCRIPTIVE_ONLY"))
     throw Error("Paire OKX, devise ou nombre d'observations incohérents");
   seen.add(p.pair);
   const first=utc(p.first_source_utc),last=utc(p.last_source_utc);
   if(!Number.isFinite(first)||!Number.isFinite(last)||first>last||
      last>asOf+180000||last<asOf-24*3600000-180000)
     throw Error("Observations des carnets absentes ou incohérentes");
   const spread=nonnegative(p.latest_spread_bps),
      median=nonnegative(p.median_spread_bps),
      askDepth=nonnegative(p.best_ask_level_value_native_quote),
      bidDepth=nonnegative(p.best_bid_level_value_native_quote),
      mid=positive(p.latest_mid_native_quote),
      change=p.observed_mid_change_pct===null?null:Number(p.observed_mid_change_pct);
   if(spread===null||median===null||askDepth===null||bidDepth===null||mid===null||
      (p.book_samples===1&&p.observed_mid_change_pct!==null)||
      (p.book_samples>=2&&(!/^-?\d+(\.\d+)?$/.test(String(p.observed_mid_change_pct))||
       !Number.isFinite(change))))
      throw Error("Spreads, profondeur ou évolution sans preuve valide");
   return{pair:p.pair,quote:p.quote,observations:p.book_samples,
      lastAt:last,spreadBps:spread,medianBps:median,
      bidDepth,askDepth,mid,change,
      status:p.book_samples===1?"UNE_HEURE":"DESCRIPTIF"};
 });
 if(rows.filter(p=>p.observations>=2).length!==input.pairs_with_two_or_more_hours)
   throw Error("Couverture des heures déclarée incohérente");
 // Keep native quotes separate; lexical pair order is not an opportunity ranking.
 rows.sort((a,b)=>a.pair.localeCompare(b.pair));
 const ageMinutes=Math.max(0,Math.round((now-asOf)/60000));
 return Object.freeze({asOf:input.as_of_utc,ageMinutes,
   stale:ageMinutes>120,observedHours:input.observed_hours_total,
   pairs:rows,withTrend:input.pairs_with_two_or_more_hours,
   realOrders:false,strategyCertified:false,noQuoteConversion:true});
}
function formatNumber(x,digits=2){
 return Number.isFinite(x)?new Intl.NumberFormat("fr-FR",{
 maximumFractionDigits:digits}).format(x):"—";
}
function percent(x){
 return x===null?"— (1 heure)":(x>0?"+":"")+formatNumber(x,3)+" %";
}
function render(doc,model){
 const status=doc.getElementById("radar-okx-hourly-status");
 const body=doc.getElementById("radar-okx-hourly-body");
 if(!status||!body)return;
 const age=model.stale?"Archive différée · "+model.ageMinutes+" min depuis le relevé.":"Archive datée · "+model.ageMinutes+" min depuis le relevé.";
 status.textContent="OKX EEE Spot · "+model.pairs.length+" paires · "+
   model.observedHours+" heure(s) réellement archivée(s) · "+
   model.withTrend+" paire(s) avec deux relevés ou plus. "+age+
   " Il ne s'agit ni de cotations en direct ni d'une stratégie validée.";
 body.replaceChildren();
 for(const p of model.pairs){
   const tr=doc.createElement("tr");
   const values=[p.pair,String(p.observations),formatNumber(p.mid,8)+" "+p.quote,
     formatNumber(p.spreadBps)+" pb",
     formatNumber(p.bidDepth)+" "+p.quote,
     formatNumber(p.askDepth)+" "+p.quote,
     percent(p.change)];
   for(const value of values){
     const td=doc.createElement("td");td.textContent=value;tr.appendChild(td);
   }
   body.appendChild(tr);
 }
}
function unavailable(doc,reason){
 const s=doc.getElementById("radar-okx-hourly-status");
 const b=doc.getElementById("radar-okx-hourly-body");
 if(s)s.textContent="Bilan OKX horaire indisponible : "+reason+
   ". Aucun mouvement de prix ni opportunité reconstitués.";
 if(b)b.replaceChildren();
}
async function refresh(doc,loader){
 try{
   const data=await loader();
   render(doc,valid(data));
 }catch(e){unavailable(doc,e?.message||"source non publiée");}
}
function mount(doc){
 function boot(){
   if(!doc.getElementById("radar-okx-hourly-status"))return;
   const loader=async()=>{
     const response=await fetch("../data/crypto/okx-hourly/research-latest.json",
       {cache:"no-store",credentials:"omit"});
     if(!response.ok)throw Error("HTTP "+response.status);
     return response.json();
   };
   let inflight=false;
   const run=async()=>{if(inflight)return;inflight=true;
     try{await refresh(doc,loader);}finally{inflight=false;}};
   void run();doc.getElementById("refresh")?.addEventListener("click",run);
 }
 if(doc.readyState==="loading")doc.addEventListener("DOMContentLoaded",boot,{once:true});
 else boot();
}
return Object.freeze({SCHEMA,valid,render,refresh,mount});
});