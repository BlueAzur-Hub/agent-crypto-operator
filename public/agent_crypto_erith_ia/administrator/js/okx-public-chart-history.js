/* ERITH.IA · Public OKX Spot history adapter.
 * No order, private API, Bridge, browser storage, scheduler or new chart engine.
 * The existing Administrator external-chart renderer stays the only renderer.
 */
(function(root){
"use strict";
const BASE="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/";
const INDEX=BASE+"spot-candles/coverage.json";
const QUARTER=15*60*1000,HOUR=60*60*1000,DAY=24*HOUR;
const CONTRACT="erith.okx-native-spot-candles.v1";
const VALID_PERIODS=[1,7,30,60,90,365,36500];
function demand(v,message){if(!v)throw new Error(message);}
function eligible(coin,options={}){
  const id=String(coin?.id||""),base=String(coin?.symbol||"").toUpperCase();
  if(!id||!/^([A-Z0-9]{2,15})$/.test(base)||base!==coin.symbol?.toUpperCase())return false;
  const peers=Array.isArray(options.peers)?options.peers:[];
  // An identical ticker for two different CoinGecko IDs is not a proven pair.
  if(peers.some(p=>p&&p.id!==id&&String(p.symbol||"").toUpperCase()===base))return false;
  return true;
}
async function readJson(url,options={}){
  const request=options.fetchImpl||root.fetch?.bind(root);
  demand(typeof request==="function","Public data transport unavailable");
  const response=await request(url,{signal:options.signal,cache:"no-store"});
  demand(response?.ok,"Public OKX archive HTTP "+String(response?.status||"missing"));
  return await response.json();
}
function validateArchive(doc,pair){
  const base=pair.slice(0,-5);
  demand(doc?.schema===CONTRACT&&doc.pair===pair&&doc.base===base&&
    doc.quote==="USDC"&&doc.venue==="OKX_EEA"&&doc.instrument_type==="SPOT"&&
    doc.orders_enabled===false&&doc.account_access===false&&doc.no_quote_conversion===true,
    "Native Spot instrument identity or currency invalid");
  demand(Number.isFinite(Date.parse(doc.generated_at_utc)),"Archive missing UTC publication");
  for(const [bar,step] of Object.entries({"15m":QUARTER,"1H":HOUR,"1Dutc":DAY})){
    demand(Number(doc.bar_interval_ms?.[bar])===step,"Incorrect bar interval: "+bar);
    const series=doc.candles?.[bar];
    demand(Array.isArray(series)&&series.length>=2&&series.length<=10000,"Missing Spot OHLCV: "+bar);
    let prior=0;
    for(const item of series){
      demand(Array.isArray(item)&&item.length>=8,"Malformed OHLCV point");
      const n=item.slice(0,8).map(Number);
      const [ts,o,h,l,c,vol,qv]=n;
      demand(n.every(Number.isFinite)&&Number.isInteger(ts)&&ts>prior&&ts>0&&
         ts%step===0&&o>0&&h>=Math.max(o,c)&&l>0&&l<=Math.min(o,c)&&c>0&&
         vol>=0&&qv>=0,"Untrusted candle values/timestamp");
      prior=ts;
    }
  }
  return doc;
}
function normalize(doc,period){
  const bar=period===1?"15m":period<=90?"1H":"1Dutc";
  const source=doc.candles[bar];
  // Last point is the latest confirmed native bar in the public archive.
  const end=Number(source[source.length-1][0]);
  const earliest=period===36500?0:end-period*DAY;
  const selected=source.filter(x=>Number(x[0])>=earliest);
  demand(selected.length>=2,"Insufficient confirmed native history for selected period");
  const series=selected.map(x=>[Number(x[0]),Number(x[4])]);
  const volumeSeries=selected.map(x=>[Number(x[0]),Number(x[7])]);
  const values=series.map(x=>x[1]);
  const first=series[0],last=series[series.length-1];
  const available=(last[0]-first[0])/DAY;
  const partial=period!==36500&&available<period*.92;
  const coverageNote=partial?`Couverture réelle partielle : ${Math.round(available)} j / ${period} j demandés`:
    period===36500?`Maximum archivé : ${Math.round(available)} jours`:"";
  const timeMs=Date.parse(doc.generated_at_utc);
  demand(last[0]<timeMs+2*DAY,"Archive contains candles far beyond publication");
  const lastPrice=last[1],firstPrice=first[1];
  return {series,volumeSeries,coin:null,periodDays:period,
    source:`OKX Spot ${doc.pair} · bougies closes ${bar}${coverageNote?" · "+coverageNote:""}`,
    sourceMode:"okx-github-spot-candles",sourceFamily:"okx",currency:"USDC",quoteCurrency:"USDC",
    nativeSpotVerified:true,partialCoverage:partial,coverageNote,periodLabel:coverageNote,
    generatedAt:doc.generated_at_utc,pointCount:series.length,blocked:false,
    integrity:{ok:true,reason:coverageNote||"Bougies Spot confirmées, identité et horodatage vérifiés",
      warnings:coverageNote?[coverageNote]:[],
      metrics:{pointCount:series.length,coverageHours:available*24,coverageDays:available,
        firstTimestamp:first[0],lastTimestamp:last[0],firstPrice,lastPrice,
        minPrice:Math.min(...values),maxPrice:Math.max(...values),
        changePct:(lastPrice/firstPrice-1)*100,
        freshness:{level:"archive",label:"Archive publique "+doc.generated_at_utc,ageMs:Math.max(0,Date.now()-timeMs)}}}};
}
async function load(coin,period=365,options={}){
  if(!eligible(coin,options)||!VALID_PERIODS.includes(Number(period)))return null;
  const base=coin.symbol.toUpperCase(),pair=base+"-USDC";
  const manifest=options.manifest||await readJson(INDEX,options);
  demand(manifest?.schema==="erith.okx-spot-universe-coverage.v1"&&
    Array.isArray(manifest.archives)&&manifest.native_quote==="USDC",
    "Untrusted public Spot archive index");
  if(!manifest.archives.some(row=>row?.pair===pair&&row?.quote==="USDC")){
    // IRYS is recorded under the first standalone native archive.
    if(pair!=="IRYS-USDC")return null;
  }
  const filename=pair==="IRYS-USDC"?
    BASE+"irys-spot-candles.json":
    BASE+"spot-candles/"+base.toLowerCase()+"-usdc.json";
  const archive=validateArchive(await readJson(filename,options),pair);
  return normalize(archive,Number(period));
}
const API=Object.freeze({eligible,load,normalize,validateArchive,readonly:true,orders_enabled:false});
root.AtlasOkxPublicChartHistory=API;
if(typeof module!=="undefined"&&module.exports)module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
