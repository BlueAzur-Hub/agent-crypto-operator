/* Seven · Radar: public-only view, no execution or private access. */
(function(global){
"use strict";
const TIERS=[10,20,50,250],DAY=86400000;
const finite=x=>typeof x==="number"&&Number.isFinite(x)?x:null;
const positive=x=>finite(x)!==null&&x>0?x:null;
const safe=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pct=x=>finite(x)===null?"—":(x>0?"+":"")+x.toFixed(2)+" %";
const compact=x=>finite(x)===null?"—":new Intl.NumberFormat("fr-FR",{notation:"compact",maximumFractionDigits:2}).format(x);
const price=x=>positive(x)===null?"—":new Intl.NumberFormat("fr-FR",{maximumFractionDigits:x>=100?2:x>=1?4:x>=.01?6:10}).format(x);
function validMarket(src){
 if(src?.schema!=="agent_crypto_public_market_snapshot_v1"||src.source?.provider_id!=="coingecko"||!Array.isArray(src.coins)||src.coins.length<250)throw Error("Top 250 canonique indisponible");
 const ids=new Set(),ranks=new Set(),rows=src.coins.map(c=>{
  if(!Number.isInteger(c?.rank)||c.rank<1||c.rank>250||!c.id||!c.symbol||ids.has(c.id)||ranks.has(c.rank))throw Error("Top 250 : rang ou identité invalide");
  ids.add(c.id);ranks.add(c.rank);
  return {id:String(c.id),symbol:String(c.symbol).toUpperCase(),name:String(c.name||c.symbol),rank:c.rank,
    priceUsd:positive(c.priceUsd),change24h:finite(c.change24h),change7d:finite(c.change7d),change30d:finite(c.change30d),
    volume24hUsd:finite(c.volume24hUsd),marketCapUsd:finite(c.marketCapUsd),image:typeof c.image==='string'?c.image:''};
 }).sort((a,b)=>a.rank-b.rank);
 if(rows.length!==250||rows[0].rank!==1||rows[249].rank!==250)throw Error("Top 250 discontinu");
 return {rows,at:String(src.generated_at),source:"CoinGecko"};
}
function selectMarket(rows,tier=10,query="",sort="rank"){
 if(!TIERS.includes(tier))throw Error("Niveau Radar invalide");
 const q=String(query).toLowerCase().trim();
 const sorts={
  rank:(a,b)=>a.rank-b.rank,
  change24h:(a,b)=>(b.change24h??-Infinity)-(a.change24h??-Infinity)||a.rank-b.rank,
  change7d:(a,b)=>(b.change7d??-Infinity)-(a.change7d??-Infinity)||a.rank-b.rank,
  drop24h:(a,b)=>(a.change24h??Infinity)-(b.change24h??Infinity)||a.rank-b.rank,
  volume24hUsd:(a,b)=>(b.volume24hUsd??-Infinity)-(a.volume24hUsd??-Infinity)||a.rank-b.rank
 };
 return rows.filter(r=>r.rank<=tier&&(!q||r.symbol.toLowerCase().includes(q)||r.name.toLowerCase().includes(q))).sort(sorts[sort]||sorts.rank);
}
function verifyPaper(state){
 if(state?.schema!=="erith.btc-ct.hourly-paper.v1"||state.orders_enabled!==false||state.account_access!==false||state.simulation_only!==true)throw Error("Journal PAPER invalide");
 return Object.fromEntries(["BTC","CT"].map(asset=>{
  const m=state.markets?.[asset];if(!m||typeof m.decision!=="string")throw Error("Donnée PAPER absente : "+asset);
  return [asset,{price:positive(m.last_price_usdt),quote:"USDT",decision:m.decision,
    sourceTime:m.source_time,closed:Number.isInteger(m.closed)?m.closed:0,reason:String(m.reason||"")}];
 }));
}
function verifyRegistry(obj){
 if(obj?.schema!=="agent_crypto_new_listings_identity_registry_v1")throw Error("Registre identité invalide");
 return new Map(Object.values(obj.identities||{}).filter(x=>x?.verified===true&&x.symbol&&x.coingeckoId)
  .map(x=>[String(x.symbol).toUpperCase(),x]));
}
function verifyBitget(inst,tickers,registry,now){
 if(String(inst?.code)!=="00000"||!Array.isArray(inst.data)||String(tickers?.code)!=="00000"||!Array.isArray(tickers.data))throw Error("Réponses Spot Bitget invalides");
 const byTicker=new Map(tickers.data.map(x=>[String(x?.symbol||"").toUpperCase(),x])),found=new Map();
 for(const row of inst.data){
  const start=Number(row?.launchTime),symbol=String(row?.symbol||"").toUpperCase(),
        base=String(row?.baseCoin||"").toUpperCase(),quote=String(row?.quoteCoin||"").toUpperCase();
  if(!symbol||!base||!quote||!Number.isFinite(start)||start>now||now-start>30*DAY||
     String(row?.status||"").toLowerCase()!=="online"||
     String(row?.symbolType||"crypto").toLowerCase()!=="crypto"||
     String(row?.isRwa||"NO").toUpperCase()==="YES")continue;
  const t=byTicker.get(symbol),last=Number(t?.lastPrice),turnover=Number(t?.turnover24h),change=Number(t?.price24hPcnt);
  if(!Number.isFinite(last)||last<=0||!Number.isFinite(turnover)||turnover<=0)continue;
  const identity=registry.get(base),value={symbol:base,name:identity?.displayName||base,
   providerSymbol:symbol,provider:"bitget",
   venue:"Bitget Spot",pair:base+"/"+quote,quote,price:last,volume:turnover,
   ageDays:(now-start)/DAY,change24h:Number.isFinite(change)?change*100:null,
   image:identity?.image||'',identityProved:!!identity,status:identity?"IDENTITÉ VÉRIFIÉE":"IDENTITÉ À VÉRIFIER",source:"Bitget Spot launchTime+ticker"};
  if(!found.has(base)||value.volume>found.get(base).volume)found.set(base,value);
 }
 return [...found.values()].sort((a,b)=>a.ageDays-b.ageDays).slice(0,50);
}
function observeMarket(asset){
 const day=finite(asset?.change24h),week=finite(asset?.change7d);
 if(day===null||week===null)return {label:"Données à compléter",tone:"unknown",detail:"Variations 24 h et 7 j nécessaires ; aucune interprétation possible."};
 if(day>0&&week>0)return {label:"Hausse 24 h / 7 j",tone:"up",detail:"Deux variations positives observées ; aucune prévision de poursuite."};
 if(day<0&&week<0)return {label:"Repli 24 h / 7 j",tone:"down",detail:"Deux variations négatives observées ; aucune prévision."};
 if(day>0&&week<0)return {label:"Rebond 24 h",tone:"mixed",detail:"24 h positif, 7 j négatif ; ce contraste ne confirme pas un retournement."};
 if(day<0&&week>0)return {label:"Repli 24 h",tone:"mixed",detail:"24 h négatif, 7 j positif ; ce contraste n'est pas un signal de vente."};
 return {label:"Variation neutre",tone:"flat",detail:"Au moins un des deux horizons est à zéro ; aucune tendance confirmée."};
}
// A research watchlist, never an execution or exchange-liquidity signal.
const EXCLUDED_SYMBOLS=new Set(("USDT USDC DAI FDUSD USDE USDS PYUSD TUSD EURC RLUSD USDD FRAX USD1 USDF USDG USDB AVUSD USD0 CUSD USDX GHO SUSD XAUT PAXG WBTC WETH WEETH STETH WSTETH CBETH WBETH JITOSOL MSOL RETH LSETH").split(" "));
function selectOpportunities(core,extended){
 if(core?.schema!=="agent_crypto_public_market_snapshot_v1"||core?.source?.provider_id!=="coingecko"||
    extended?.schema!=="agent_crypto_public_extended_market_snapshot_v1"||extended?.source?.provider_id!=="coingecko"||
    !Array.isArray(core.coins)||core.coins.length!==250||!Array.isArray(extended.coins)||extended.coins.length!==750)
    throw Error("Univers public Top 1000 incomplet, veille suspendue");
 const a=Date.parse(core.generated_at||""),b=Date.parse(extended.generated_at||"");
 if(!Number.isFinite(a)||!Number.isFinite(b)||Math.abs(a-b)>6*3600000)
    throw Error("Snapshots Top 250 et Extended non contemporains, veille suspendue");
 // Each public producer proves its OWN full rank interval. The pair is
 // not atomic: an ID can cross ranks 250/251 between their timestamps.
 // Retain both dated rows as evidence, never reassign a price to a new rank.
 const owners=new Map(),ranks=new Set(),observations=[],overlaps=[];
 for(const [source,arr] of [["core",core.coins],["extended",extended.coins]]){
  for(const x of arr){
   const rank=Number(x?.rank),id=String(x?.id||""),symbol=String(x?.symbol||"").toUpperCase();
   if(!id||!symbol||!Number.isInteger(rank)||
      (source==="core"&&(rank<1||rank>250))||
      (source==="extended"&&(rank<251||rank>1000))||ranks.has(rank))
      throw Error("Identités de rang Top 1000 incohérentes");
   ranks.add(rank);
   const previous=owners.get(id);
   if(previous){
    // The only known benign collision is the exact SAME coin crossing the
    // 250/251 boundary in independently timestamped source snapshots.
    // Same-source repeats, identity collisions and broad rank drift fail closed.
    if(previous.source!=="core"||source!=="extended"||
       previous.rank!==250||rank!==251||previous.symbol!==symbol||a===b)
       throw Error("Identités de rang Top 1000 incohérentes");
    overlaps.push({id,symbol,core:{rank:previous.rank,generated_at:core.generated_at},
                   extended:{rank,generated_at:extended.generated_at}});
   }else owners.set(id,{source,rank,symbol});
   observations.push({source,rank,id,symbol,coin:x});
  }
 }
 if(ranks.size!==1000||owners.size!==1000-overlaps.length)
   throw Error("Rangs Top 1000 discontinus");
 const ambiguous=new Set(overlaps.map(x=>x.id)),candidates=[];
 for(const row of observations){
  // Conflicting snapshot observations remain in boundaryOverlaps below,
  // but neither observation becomes a research/trading suggestion.
  if(ambiguous.has(row.id))continue;
  const x=row.coin,{id,symbol,rank,source}=row;
  const price=positive(x.priceUsd),cap=positive(x.marketCapUsd),vol=positive(x.volume24hUsd),
   day=finite(x.change24h),week=finite(x.change7d),month=finite(x.change30d);
  if(EXCLUDED_SYMBOLS.has(symbol)||price===null||cap===null||vol===null||day===null||week===null||
     cap<25000000||vol<1000000||vol/cap<0.015||vol/cap>2)continue;
  candidates.push({id,name:String(x.name||symbol),symbol,rank,priceUsd:price,
   change24h:day,change7d:week,change30d:month,marketCapUsd:cap,volume24hUsd:vol,
   turnoverPct:Math.round(vol/cap*10000)/100,
   sourceSnapshot:source==="core"?core.generated_at:extended.generated_at,
   riskNote:Math.abs(day)>=25?"Variation 24 h extrême · risque de retournement":"Spread et carnet non vérifiés",
   graphEligible:false});
 }
 const sort=(a,b)=>b.change24h-a.change24h||a.rank-b.rank;
 const trend=candidates.filter(c=>c.change24h>=4&&c.change7d>0).sort(sort).slice(0,12);
 const rebound=candidates.filter(c=>c.change24h>=4&&c.change7d<0).sort(sort).slice(0,12);
 // Ranked from the same qualified-for-research universe; never a Spot execution list.
 const take=(key)=>[...candidates].sort((a,b)=>b[key]-a[key]||a.rank-b.rank).slice(0,10);
 const rankings={rise24:take("change24h"),rise7:take("change7d"),
   volume:take("volume24hUsd"),fall24:[...candidates].sort((a,b)=>a.change24h-b.change24h||a.rank-b.rank).slice(0,10)};
 return {sourceTimes:{core:core.generated_at,extended:extended.generated_at},
  status:overlaps.length?"MIXED_SNAPSHOT_BOUNDARY":"DISTINCT_IDENTITIES",
  observedRows:observations.length,
  snapshotSkewSeconds:Math.abs(a-b)/1000,
  boundaryOverlaps:overlaps,
  ambiguousIdsExcludedFromResearch:[...ambiguous],
  filters:{market_cap_min_usd:25000000,volume_24h_min_usd:1000000,turnover_min_pct:1.5,turnover_max_pct:200,
   excludes_symbols:[...EXCLUDED_SYMBOLS].sort(),exchange_spread_orderbook_checked:false},
  universe:owners.size,eligible:candidates.length,trend,rebound,rankings,
   // Expose complete pre-ranked validated research pool, without changing top-12.
   scoutUniverse:candidates,
  disclaimer:"Observations transversales de snapshots, non opportunités négociables ni conseils d'achat. Aucune paire d'exécution vérifiée."};
}
const API=Object.freeze({TIERS,validMarket,selectMarket,verifyPaper,verifyRegistry,verifyBitget,observeMarket,selectOpportunities});
if(typeof module!=="undefined"&&module.exports)module.exports=API;
// Shared pure parser between standalone Radar and Trader-native view; never start
// the standalone UI in a page without its own #tiers control.
global.AgentCryptoRadarReader=API;
if(typeof document==="undefined"||!document.getElementById("tiers"))return;
const $=s=>document.getElementById(s);
const display=(s,value)=>{const el=$(s);if(el)el.textContent=String(value)};
const emptyRow=(s,cols,msg)=>{const body=$(s);body.replaceChildren();const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=cols;td.textContent=msg;tr.append(td);body.append(tr)};
let tier=10,market=null,paper=null,listing=[],registry=new Map(),loading=false;
function marketRender(){
 if(!market){emptyRow("market-body",6,"Classement indisponible : aucune source substituée");return}
 const rows=selectMarket(market.rows,tier,$("search").value,$("sort").value);
 display("universe","Top "+tier);
 display("tier-note",rows.length+" actifs dans le filtre · classement par capitalisation, pas critère d'achat · source CoinGecko du "+new Date(market.at).toLocaleString("fr-FR"));
 for(const b of $("tiers").querySelectorAll("[data-tier]"))b.setAttribute("aria-pressed",String(Number(b.dataset.tier)===tier));
 if(!rows.length){emptyRow("market-body",6,"Aucun actif pour ce filtre");return}
 $("market-body").innerHTML=rows.map(c=>"<tr><td>"+safe(c.name)+" <span class='muted'>· "+safe(c.symbol)+"</span></td><td>"+c.rank+"</td><td>"+price(c.priceUsd)+
 "</td><td class='"+(c.change24h>0?"positive":c.change24h<0?"negative":"")+"'>"+pct(c.change24h)+
 "</td><td class='"+(c.change7d>0?"positive":c.change7d<0?"negative":"")+"'>"+pct(c.change7d)+
 "</td><td>"+compact(c.volume24hUsd)+"</td></tr>").join("");
}
function listingRender(){
 const rows=listing.slice();
 if(paper?.CT?.price)rows.unshift({symbol:"CT",name:"Concrete",pair:"CT/USDT",quote:"USDT",venue:"OKX Spot",price:paper.CT.price,
  ageDays:null,change24h:null,source:"Observateur public CT",status:"SUIVI PAPER · DATE NON REVÉRIFIÉE"});
 if(!rows.length){emptyRow("listings-body",5,"Aucun listing suffisamment documenté à afficher");return}
 $("listings-body").innerHTML=rows.map(a=>"<tr><td>"+safe(a.name)+" <span class='muted'>· "+safe(a.pair)+" · "+safe(a.venue)+"</span></td><td>"+
 (a.ageDays===null?"—":a.ageDays.toFixed(1)+" j")+"</td><td>"+price(a.price)+" "+safe(a.quote)+"</td><td>"+pct(a.change24h)+
 "</td><td><span class='chip' title='"+safe(a.source)+"'>"+safe(a.status)+"</span></td></tr>").join("");
}
function watchRender(){
 const mha=listing.find(x=>x.symbol==="MHA");
 const rows=[
  {name:"BTC · Bitcoin",quote:"USDT",price:paper?.BTC?.price,why:"PAPER Binance",decision:paper?.BTC?.decision},
  {name:"CT · Concrete",quote:"USDT",price:paper?.CT?.price,why:"PAPER OKX",decision:paper?.CT?.decision},
  {name:"MHA · MAGNE.AI",quote:mha?.quote||"USDT",price:mha?.price,why:"Listing Bitget · sans stratégie",decision:"OBSERVER"}
 ];
 $("watch-list").innerHTML=rows.map(r=>"<div class='stat'><small>"+safe(r.name)+"</small><b>"+price(r.price)+" "+safe(r.quote)+"</b><span>"+safe(r.why)+"</span><span>État : "+safe(r.decision||"DONNÉE ABSENTE")+"</span></div>").join("");
 display("paper-count",paper?(paper.BTC.closed+paper.CT.closed)+" clôtures":"Indisponible");
 display("paper-time",paper?"BTC "+(paper.BTC.sourceTime||"—")+" · CT "+(paper.CT.sourceTime||"—"):"Aucun journal chargé");
 display("paper-proof",paper?"BTC : "+paper.BTC.decision+" · "+paper.BTC.reason+" | CT : "+paper.CT.decision+" · "+paper.CT.reason+". Aucune exécution réelle.":"Journal absent : ne pas inventer de décision.");
}
async function get(url){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
 try{const r=await fetch(url,{cache:"no-store",credentials:"omit",signal:ctrl.signal});
  if(!r.ok)throw Error("HTTP "+r.status);return await r.json();
 }finally{clearTimeout(timer)}
}
async function refresh(){
 if(loading)return;loading=true;$("refresh").disabled=true;display("status","Lecture des sources publiques…");
 const errors=[];
 try{
  const sources=await Promise.allSettled([
   get("../data/crypto/latest.json"),
   get("../data/trader_flux/btc_ct_auto_paper/state.json"),
   get("../administrator/data/new-listings-identities.json")
  ]);
  try{market=validMarket(sources[0].value)}catch(e){market=null;errors.push("Top 250 : "+e.message)}
  try{paper=verifyPaper(sources[1].value)}catch(e){paper=null;errors.push("PAPER : "+e.message)}
  try{if(sources[2].status!=="fulfilled")throw Error("registre inaccessible (chargement réseau ou publication)");
   registry=verifyRegistry(sources[2].value)}catch(e){registry=new Map();errors.push("Identités : "+e.message)}
  const live=await Promise.allSettled([
   get("https://api.bitget.com/api/v3/market/instruments?category=SPOT"),
   get("https://api.bitget.com/api/v3/market/tickers?category=SPOT")
  ]);
  try{listing=verifyBitget(live[0].value,live[1].value,registry,Date.now())}
  catch(e){listing=[];errors.push("Nouveaux listings Bitget : données non vérifiées")}
  display("new-count",String(listing.length));
  display("new-source","Bitget Spot · lancements ≤30 j · prix et volume valides");
  display("listings-proof",listing.length+" instruments récents observés, "+listing.filter(x=>x.identityProved).length+
   " identités vérifiées par le registre · CT suivi séparément sur OKX.");
  display("market-age",market?new Date(market.at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):"Indisponible");
  display("market-source",market?"CoinGecko "+new Date(market.at).toLocaleDateString("fr-FR"):"Aucun classement inventé");
  marketRender();listingRender();watchRender();
  display("status",errors.length?"Radar partiel · "+errors.join(" · "):
      "Radar prêt · Top 250, nouveaux listings Spot, PAPER BTC/CT · aucun ordre.");
 }finally{loading=false;$("refresh").disabled=false}
}
function mount(){
 $("tiers").addEventListener("click",e=>{const el=e.target.closest("[data-tier]");if(el){tier=Number(el.dataset.tier);marketRender()}});
 $("search").addEventListener("input",marketRender);
 $("sort").addEventListener("change",marketRender);
 $("refresh").addEventListener("click",refresh);
 void refresh();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})(typeof globalThis!=="undefined"?globalThis:this);
