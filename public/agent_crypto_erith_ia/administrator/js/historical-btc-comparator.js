/* Seven Heaven — R7: explicit BTC comparison, no chart modification.
 * Read-only public CoinGecko GitHub snapshot + verified Binance archive +
 * optional public BTC-USDC OKX ticker through existing localhost bridge.
 */
(()=>{"use strict";
const current=document.currentScript;
const marketURL=new URL("../../data/crypto/latest.json",current.src);
const proxy="http://127.0.0.1:8790/okx-public?endpoint=ticker&instId=BTC-USDC";
const assetId="bitcoin",period="24h";
function ensure(cond,message){if(!cond)throw Error(message)}
function time(value){const n=Date.parse(value);ensure(Number.isFinite(n)&&n>0,"Horodatage CoinGecko invalide");return n}
function number(value){const n=Number(value);ensure(Number.isFinite(n)&&n>0,"Prix non disponible");return n}
function isFetchOriginSafe(){return marketURL.origin===location.origin}
async function fetchMarket(){
 ensure(isFetchOriginSafe(),"Source CoinGecko externe interdite");
 const r=await fetch(marketURL.href,{method:"GET",cache:"no-store",credentials:"omit",redirect:"error"});
 ensure(r.ok,"Snapshot CoinGecko HTTP "+r.status);
 const content=await r.arrayBuffer();ensure(content.byteLength<3000000,"Snapshot CoinGecko trop volumineux");
 const snap=JSON.parse(new TextDecoder().decode(content));
 ensure(snap.schema==="agent_crypto_public_market_snapshot_v1"&&snap.source?.provider_id==="coingecko"&&snap.source?.quote_currency==="USD","Snapshot CoinGecko non qualifié");
 ensure(Array.isArray(snap.coins)&&snap.coins.length>0,"Aucune cotation CoinGecko");
 const btc=snap.coins.find(x=>x.id===assetId);
 ensure(btc&&btc.symbol?.toUpperCase()==="BTC","BTC CoinGecko absent");
 const price=number(btc.priceUsd);
 const sampledAt=time(btc.lastUpdated||btc.timestamp||snap.generated_at);
 const publishedAt=time(snap.generated_at);
 ensure(sampledAt<=publishedAt+300000,"Snapshot CoinGecko futur incohérent");
 return Object.freeze({provider:"CoinGecko",market:"BTC · Market public",quote:"USD",
   price,observedAt:new Date(sampledAt).toISOString(),publishedAt:new Date(publishedAt).toISOString(),
   kind:"MARKET_SNAPSHOT",live:false,verified:"SCHEMA_CHECKED"});
}
async function fetchArchive(){
 ensure(window.SevenHistoricalArchive&&typeof window.SevenHistoricalArchive.readSeries==="function","Adaptateur R6 indisponible");
 const data=await window.SevenHistoricalArchive.readSeries({assetId,period});
 const m=data.metadata;
 ensure(m.id==="bitcoin"&&m.pair==="BTCUSDT"&&m.quote==="USDT"&&m.source==="Binance Spot"&&m.intervalMs===300000
 &&m.archiveStatus==="VALIDATED"&&m.isLive===false&&m.targetGraphConnected===false,"Contrat Binance R6 invalide");
 ensure(Array.isArray(data.candles)&&data.candles.length>=288,"Historique Binance insuffisant");
 const last=data.candles.at(-1);
 ensure(Array.isArray(last)&&last.length===8&&last[0]===m.lastOpenMs,"Dernière chandelle incohérente");
 const price=number(last[4]),closeAt=m.lastOpenMs+m.intervalMs;
 ensure(closeAt<=Date.now()+60000,"Horodatage Binance futur");
 return Object.freeze({provider:"Binance Spot",market:m.pair,quote:"USDT",price,
   observedAt:new Date(closeAt).toISOString(),openedAt:new Date(m.lastOpenMs).toISOString(),
   publishedAt:m.archiveUpdatedAt,kind:"ARCHIVED_CANDLE_CLOSE",period:"24h",interval:"5m",
   totalCandles:data.candles.length,live:false,verified:"SHA256_AND_OHLCV"});
}
async function fetchOkx(){
 // This is only a public, unauthenticated market GET; no private backend/order routes.
 const url=new URL(proxy);
 ensure(url.hostname==="127.0.0.1"&&url.port==="8790"&&url.pathname==="/okx-public"
   &&url.searchParams.get("endpoint")==="ticker"&&url.searchParams.get("instId")==="BTC-USDC","Route OKX non autorisée");
 const opts={method:"GET",cache:"no-store",credentials:"omit",redirect:"error"};
 if(typeof AbortSignal!=="undefined"&&typeof AbortSignal.timeout==="function")opts.signal=AbortSignal.timeout(6000);
 const r=await fetch(url.href,opts);
 ensure(r.ok,"Backend OKX HTTP "+r.status);
 const j=await r.json();
 ensure(String(j.code)==="0"&&Array.isArray(j.data)&&j.data.length>0,"Réponse OKX non qualifiée");
 const row=j.data.find(x=>x.instId==="BTC-USDC");
 ensure(row&&typeof row.ts==="string"&&/^\d{13}$/.test(row.ts),"Horodatage/instrument OKX manquant");
 const price=number(row.last),observedAt=Number(row.ts);
 ensure(observedAt>0&&observedAt<=Date.now()+60000,"Horodatage OKX invalide");
 return Object.freeze({provider:"OKX via Backend local",market:"BTC-USDC",quote:"USDC",
  price,observedAt:new Date(observedAt).toISOString(),
  kind:"SPOT_TICKER",live:false,verified:"PUBLIC_API_SHAPE",source:"http://127.0.0.1:8790/okx-public"});
}
function classify(row,asOf){
 if(!row)return{status:"UNAVAILABLE",ageMinutes:null};
 const t=Date.parse(row.observedAt);
 const ageMinutes=Math.max(0,Math.floor((asOf-t)/60000));
 const max=row.kind==="SPOT_TICKER"?3:row.kind==="MARKET_SNAPSHOT"?15:15;
 return{status:ageMinutes>max?"STALE":"CURRENT_AT_SNAPSHOT",ageMinutes};
}
async function compare(){
 const asOf=Date.now();
 const outcomes=await Promise.allSettled([fetchMarket(),fetchArchive(),fetchOkx()]);
 const providers=["CoinGecko","Binance Spot","OKX via Backend local"];
 const rows=outcomes.map((item,i)=>{
   if(item.status==="fulfilled"){const v=item.value,c=classify(v,asOf);
    return {...v,status:c.status,ageMinutes:c.ageMinutes}}
   return{provider:providers[i],status:"UNAVAILABLE",error:String(item.reason?.message||item.reason).slice(0,200)};
 });
 return{schema:"seven_heaven_btc_sources_r7",comparedAt:new Date(asOf).toISOString(),
  rows,quoteRule:"USD != USDT != USDC",timeAlignment:"UNALIGNED",
  priceSpreadCalculated:false,graphModified:false,ordersPlaced:false,
  note:"Sources, monnaies et horodatages distincts. Ne pas interpréter comme arbitrage."};
}
window.SevenBTCSourceComparator=Object.freeze({compare,fetchMarket,fetchArchive,fetchOkx});
})();