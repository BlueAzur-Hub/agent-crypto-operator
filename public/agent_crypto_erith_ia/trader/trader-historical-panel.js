/* Seven Heaven · Trader verified R9 archive; read-only, no live-chart changes. */
(()=>{"use strict";
const ID="traderVerifiedHistory",LABEL={"24h":"5 min","7d":"1 h","30d":"4 h","60d":"4 h","90d":"4 h","1y":"1 j"};
let reader=null,catalog=null,sequence=0,universeReader=null,universeCatalog=null,cohortReader=null,cohortCatalog=null,longReader=null,longCatalog=null;
const panel=()=>document.getElementById(ID);
const displayCurrency=()=>{try{return globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency==="EUR"?"EUR":"USD";}catch(_){return"USD";}};
function layout(p,currency){
 const isEur=currency==="EUR",r9=p.querySelector("[data-history-r9]"),controls=p.querySelector("[data-history-controls]");
 if(r9)r9.hidden=isEur;if(controls)controls.hidden=isEur;
}
/* Explicit historical consultation never mutates the live Market selection.
   When Market has no selection, use an identity VERIFIED from the observed
   external chart. The pinned pedagogical lab is deliberately not an owner. */
const MANUAL=Object.freeze({bitcoin:"BTC",ethereum:"ETH",binancecoin:"BNB",
 ripple:"XRP",solana:"SOL","quack-ai":"Q",concrete:"CT"});
function selected(){
 const choice=panel()?.querySelector("[data-history-asset]")?.value||"auto";
 if(choice!=="auto"&&Object.hasOwn(MANUAL,choice))
   return {id:choice,symbol:MANUAL[choice],origin:"manual"};
 // An explicitly displayed external asset wins over the retained Market
 // subprofile, which can still be BTC. During a CT request, show CT waiting,
 // never silently substitute BTC until the external data is confirmed.
 let ext=null;
 try{ext=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();}catch(_){}
 const base=String(ext?.base||"").toUpperCase(),quote=String(ext?.quote||"").toUpperCase();
 if(ext?.active&&typeof ext.id==="string"&&ext.id&&
   /^[A-Z0-9]+$/.test(base)&&/^(USDT|USDC|USD|EUR)$/.test(quote)&&
   String(ext.instrument||"").toUpperCase()===base+"-"+quote){
   const observed=inspectedChart(displayCurrency());
   return observed&&observed.id===ext.id&&observed.symbol===base&&observed.quote===quote
     ?{id:ext.id,symbol:base,origin:"external",quote}:null;
 }
 try{
  const c=globalThis.getSelectedCoin?.();
  if(c&&typeof c.id==="string"&&c.id&&typeof c.symbol==="string"&&c.id)
   return {id:c.id,symbol:c.symbol.toUpperCase(),origin:"market"};
 }catch(_){}
 return null;
}
function utc(x){const d=new Date(x);return Number.isFinite(d.getTime())?d.toLocaleString("fr-FR",{timeZone:"UTC",dateStyle:"short",timeStyle:"short"})+" UTC":"date inconnue";}
function write(p,name,value){const e=p.querySelector("[data-history-"+name+"]");if(e)e.textContent=value;}
function empty(p){p.querySelector("[data-history-rows]")?.replaceChildren();write(p,"meta","—");const t=p.querySelector("[data-history-r9] .history-scroll");if(t)t.hidden=true;const native=p.querySelector("[data-history-native]");if(native){native.hidden=true;native.querySelector("[data-native-rows]")?.replaceChildren();}}
function loadReader(){
 if(globalThis.SevenCompactArchiveReader?.readSeries)return Promise.resolve(globalThis.SevenCompactArchiveReader);
 if(reader)return reader;
 reader=new Promise((resolve,reject)=>{
  const s=document.createElement("script");s.id="traderHistoryR9Loader";
  s.src=new URL("../administrator/js/historical-compact-reader.js",document.baseURI).href;
  s.onload=()=>{const x=globalThis.SevenCompactArchiveReader;x?.readSeries&&x?.refreshIndex?resolve(x):reject(Error("API R9 indisponible"));};
  s.onerror=()=>reject(Error("Chargement lecteur R9 impossible"));
  document.head.appendChild(s);
 }).catch(e=>{reader=null;document.getElementById("traderHistoryR9Loader")?.remove();throw e;});
 return reader;
}

function loadUniverseReader(){
 if(globalThis.SevenHistoricalUniverseReader?.readSeries)return Promise.resolve(globalThis.SevenHistoricalUniverseReader);
 if(universeReader)return universeReader;
 universeReader=new Promise((resolve,reject)=>{
  const script=document.createElement("script");script.id="traderHistoricalUniverseLoader";
  script.src=new URL("../trader/trader-historical-universe-reader.js?reader=cumulative-universe",document.baseURI).href;
  script.onload=()=>{
   const api=globalThis.SevenHistoricalUniverseReader;
   api?.readSeries&&api?.refreshIndex?resolve(api):reject(Error("Lecteur Univers indisponible"));
  };
  script.onerror=()=>reject(Error("Chargement lecteur Univers impossible"));
  document.head.appendChild(script);
 }).catch(e=>{universeReader=null;document.getElementById("traderHistoricalUniverseLoader")?.remove();throw e;});
 return universeReader;
}

function loadCohortReader(){
 if(globalThis.SevenHistoricalCohortReader?.readSeries)return Promise.resolve(globalThis.SevenHistoricalCohortReader);
 if(cohortReader)return cohortReader;
 cohortReader=new Promise((resolve,reject)=>{
  const script=document.createElement("script");script.id="traderHistoricalCohortLoader";
  script.src=new URL("../trader/trader-historical-cohort-reader.js",document.baseURI).href;
  script.onload=()=>{
   const api=globalThis.SevenHistoricalCohortReader;
   api?.readSeries&&api?.refreshIndex?resolve(api):reject(Error("Lecteur Top50 indisponible"));
  };
  script.onerror=()=>reject(Error("Chargement lecteur Top50 impossible"));
  document.head.appendChild(script);
 }).catch(error=>{cohortReader=null;document.getElementById("traderHistoricalCohortLoader")?.remove();throw error;});
 return cohortReader;
}
function loadLongReader(){
 if(globalThis.SevenHistoricalLongReader?.readSeries)return Promise.resolve(globalThis.SevenHistoricalLongReader);
 if(longReader)return longReader;
 longReader=new Promise((resolve,reject)=>{
  const script=document.createElement("script");script.id="traderHistoricalLongLoader";
  script.src=new URL("../trader/trader-historical-long-reader.js",document.baseURI).href;
  script.onload=()=>{
   const api=globalThis.SevenHistoricalLongReader;
   api?.readSeries&&api?.refreshIndex?resolve(api):reject(Error("Lecteur longues périodes indisponible"));
  };
  script.onerror=()=>reject(Error("Chargement lecteur longues périodes impossible"));
  document.head.appendChild(script);
 }).catch(e=>{longReader=null;document.getElementById("traderHistoricalLongLoader")?.remove();throw e;});
 return longReader;
}
/* Read-only projection of the native CoinGecko USD chart broker.
   NOT Binance R9 and NOT OHLCV. No new fetch, timer, storage or graph owner. */
function nativeChart(coin,currency="USD"){
 let chart=null;
 try{chart=typeof state!=="undefined"?state?.dataBroker?.chart:null;}catch(_){}
 if(!chart||chart.status!=="ready"||chart.coinId!==coin.id||chart.result?.blocked)return null;
 const r=chart.result;
 const source=String([r?.sourceFamily,r?.source,chart.source,r?.originalSourceMode,r?.sourceMode].join(" "));
 const family=/binance/i.test(source)?"Binance":/coingecko/i.test(source)?"CoinGecko":null;
 if(!family)return null;
 const explicit=String(r?.currency||r?.quoteCurrency||"").toUpperCase();
 if(explicit&&explicit!==currency)return null;
 if(currency==="USD"){
   if(String(r?.currency||"").toUpperCase()!=="USD"||String(r?.quoteCurrency||"").toUpperCase()!=="USD"||family!=="CoinGecko")return null;
 }else{
   // Legacy EUR chart uses native context without :USD suffix; no relabel/conversion.
   const context=String(chart.contextKey||"");
   const nativeEurContext=context===`single:${coin.id}:${Number(chart.period||0)}`;
   const directEur=/\bEUR\b|BTCEUR|\/EUR\b/i.test(String(r.source||""));
   if(!explicit&&!nativeEurContext&&!directEur)return null;
   if(/:USD$/.test(context))return null;
 }
 if(!Array.isArray(r.series)||r.series.length<2)return null;
 const rows=r.series.filter(v=>Array.isArray(v)&&v.length>=2&&
   Number.isFinite(v[0])&&v[0]>0&&Number.isFinite(v[1])&&v[1]>0);
 if(rows.length<2||rows.some((v,i)=>i&&v[0]<=rows[i-1][0]))return null;
 return{rows:rows.slice(-12),count:rows.length,days:Number(chart.period||0),currency,
   source:String(r.source||chart.source||family+" "+currency),asOf:r.generatedAt||chart.seriesTimestamp||null,
   first:rows[0][0],last:rows[rows.length-1][0]};
}

/* External CT/Q graph and R9 are different owners. Read without refetching. */
function inspectedChart(currency="USD"){
 let ext=null,chart=null,micro=null;
 try{ext=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();}catch(_){}
 try{chart=typeof state!=="undefined"?state?.dataBroker?.chart:null;}catch(_){}
 const base=String(ext?.base||"").toUpperCase(),quote=String(ext?.quote||"").toUpperCase(),
   provider=String(ext?.provider||"").toLowerCase(),pair=base+"/"+quote;
 if(!ext?.active||!ext.id||!/^[A-Z0-9]+$/.test(base)||!/^(USDT|USDC|USD|EUR)$/.test(quote)||
   String(ext.instrument||"").toUpperCase()!==base+"-"+quote)return null;
 const verified=(rows)=>Array.isArray(rows)&&rows.length>=2&&rows.every((v,i)=>
   Array.isArray(v)&&v.length>=2&&Number.isFinite(v[0])&&v[0]>0&&
   Number.isFinite(v[1])&&v[1]>0&&(!i||v[0]>rows[i-1][0]));
 let rows,source,unit,days,asOf;
 const r=chart?.result||{};
 const name=String(r.source||"");
 if(chart?.status==="ready"&&chart.coinId===ext.id&&!r.blocked
   &&r.sourceMode==="new-listing-exchange-native"
   &&String(r.provider||"").toLowerCase()===provider
   &&String(r.currency||"").toUpperCase()===currency
   &&String(r.quoteCurrency||"").toUpperCase()===currency
   &&name.includes(pair)&&name.toLowerCase().includes(provider)
   &&(quote===currency||name.includes(quote+"/"+currency+" CoinGecko"))
   &&verified(r.series)){
    rows=r.series;source=name;unit=currency;days=Number(chart.period||r.periodDays||0);
    asOf=r.generatedAt||chart.seriesTimestamp||null;
 }else{
    try{micro=globalThis.AgentCryptoMarketMicroscope?.snapshot?.();}catch(_){}
    const raw=micro?.rows;
    if(!micro?.external||micro.loading||
       String(micro.loadedInstrument||"").toUpperCase()!==base+"-"+quote||
       !String(micro.source||"").toLowerCase().includes(provider)
       ||!Array.isArray(raw)||raw.length<2||
       !raw.every((v,i)=>[v.t,v.o,v.h,v.l,v.c].every(z=>Number.isFinite(z)&&z>0)
         &&v.h>=Math.max(v.o,v.c,v.l)&&v.l<=Math.min(v.o,v.c,v.h)
         &&(v.v==null||(Number.isFinite(v.v)&&v.v>=0))
         &&(!i||v.t>raw[i-1].t)))return null;
    rows=raw.map(v=>[v.t,v.c]);unit=quote;days=null;
    source=String(micro.source)+" · clôtures natives "+String(micro.loadedBar||micro.bar||"");
    asOf=micro.lastLoadedAt||null;
 }
 return {external:true,symbol:base,id:ext.id,pair,quote,
   currency:unit,rows:rows.slice(-12),count:rows.length,days,
   source,first:rows[0][0],last:rows[rows.length-1][0],asOf};
}
/* The fallback belongs to the *selected* identity, never to whichever
   unrelated external chart happens to be resident (e.g. BTC selected, CT loaded). */
function matchingChart(coin,currency){
 const native=nativeChart(coin,currency);
 if(native)return native;
 const external=inspectedChart(currency);
 return external&&external.id===coin.id&&external.symbol===coin.symbol&&
   (!coin.quote||coin.quote===external.quote)?external:null;
}
function paintNative(p,coin,currency="USD"){
 const host=p.querySelector("[data-history-native]");if(!host)return false;
 host.hidden=false;
 const label=host.querySelector("[data-native-status]"),body=host.querySelector("[data-native-rows]");
 body?.replaceChildren();
 const heading=host.querySelector("[data-native-title]"),priceHeading=host.querySelector("[data-native-price-heading]");
 const view=matchingChart(coin,currency);
 if(heading)heading.textContent=(view?.external?"GRAPHIQUE EXTERNE CONSULTÉ · ":"HISTORIQUE DU GRAPHIQUE · ")+(view?.currency||currency)+" · HORS R9";
 if(priceHeading)priceHeading.textContent="Prix "+(view?.currency||currency);
 if(!view){host.hidden=true;return false;}
 const periodLabel=({"1":"24 h","7":"7 j","30":"30 j","60":"60 j","90":"90 j","365":"1 an"})[String(view.days)]||(view.days?"fenêtre "+view.days+" j":"bougies chargées");
 if(label)label.textContent=(view.external?view.symbol:coin.symbol)+" · "+view.count+" points "+view.source+" · "+view.currency+" · fenêtre graphique "+periodLabel+
   " · "+utc(view.first)+" → "+utc(view.last)+
   " · "+(view.asOf?"série "+utc(view.asOf)+" · ":"")+
   (view.external?"Graphique "+view.symbol+" "+view.pair+
    (view.id!==coin.id?(coin.origin==="manual"?" · consultation historique "+coin.symbol+" distincte":" · sélection Market "+coin.symbol+" différente"):"")+
    " · source externe, NON CERTIFIÉ COFFRE":"lecture du graphique natif · NON LIVE")+" · NON R9";
 for(const [t,value] of view.rows.slice().reverse()){
  const tr=document.createElement("tr"),a=document.createElement("td"),b=document.createElement("td");
  a.textContent=utc(t);b.textContent=value.toLocaleString("fr-FR",{maximumFractionDigits:8})+" "+view.currency;
  tr.append(a,b);body?.appendChild(tr);
 }
 return true;
}
function paint(p,result){
 const m=result.metadata,rows=result.candles;
 if(m.source!=="Binance Spot"||m.quote!=="USDT"||(m.status!=="VALIDATED_SNAPSHOT"&&m.status!=="VALIDATED_ARCHIVE")||
  m.isLive!==false||m.graphConnected!==false||!Array.isArray(rows))throw Error("Archive non qualifiée");
 write(p,"meta",m.pair+" · Binance Spot · USDT · "+m.interval+" · "+rows.length+
  " chandelles · "+utc(m.firstOpenMs)+" → "+utc(m.lastOpenMs)+
  (m.archiveFamily==="long-periods"?" · capture longue ":m.status==="VALIDATED_ARCHIVE"?" · cumul vérifié ":m.archiveFamily==="universe"?" · borne fenêtre ":" · capture ")+utc(m.sourceIndexUpdatedAt)+" · SHA-256 vérifié · NON LIVE");
 const table=p.querySelector("[data-history-r9] .history-scroll");if(table)table.hidden=false;
 const body=p.querySelector("[data-history-rows]");body?.replaceChildren();
 for(const row of rows.slice(-12).reverse()){
  const tr=document.createElement("tr");
  for(const v of [utc(row[0]),...row.slice(1,6)]){
   const td=document.createElement("td");
   td.textContent=typeof v==="number"?v.toLocaleString("fr-FR",{maximumFractionDigits:8}):v;
   tr.appendChild(td);
  }body?.appendChild(tr);
 }
}
async function refresh({reload=false}={}){
 const p=panel();if(!p?.open)return;
 const seq=++sequence,c=selected(),period=p.querySelector("[data-history-period]")?.value||"24h",currency=displayCurrency();
 empty(p);layout(p,currency);
 if(!c){
  let external=null;
  try{external=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();}catch(_){}
  const pending=external?.active&&external.id&&external.base;
  write(p,"status",pending?String(external.base).toUpperCase()+" · historique externe en attente":"Aucun actif historique identifié");
  write(p,"detail",pending
    ?"Graphique externe non confirmé : aucune donnée du Market BTC ne remplace cet actif."
    :"Choisir un actif ci-dessus ou charger son graphique : aucune archive ni donnée ne sera inventée.");
  return;
 }
 if(c.origin==="external"){
  const found=paintNative(p,c,currency);
  write(p,"status",c.symbol+" · graphique externe consulté · "+(found?"POINTS DISPONIBLES":"EN ATTENTE"));
  write(p,"detail","Source du graphique "+c.symbol+" · cotation native "+c.quote+
    " · hors Top 250 et hors Coffre R9. Le choix d'archive « "+(LABEL[period]||period)+
    " » ne découpe pas les bougies externes : le tableau montre la résolution et les dates réellement chargées par le graphique. Aucun autre actif ni ordre réel.");
  return;
 }
 if(currency==="EUR"){
   const found=paintNative(p,c,"EUR");
   // A CT-USDT external graph stays USDT even if the operator selected EUR.
   const shown=found?p.querySelector("[data-native-price-heading]")?.textContent?.replace(/^Prix\s+/,"")||"EUR":"EUR";
   write(p,"status",c.symbol+" · "+shown+" · "+(found?"HISTORIQUE NATIF":"EN ATTENTE DU GRAPHIQUE"));
   write(p,"detail",shown==="EUR"
     ?"Affichage EUR du graphique existant, distinct des archives Binance R9 en USDT. Aucune conversion cachée."
     :"Affichage EUR demandé ; le graphique consulté fournit des prix natifs "+shown+
      ", affichés sans conversion ni assimilation à un cours EUR.");
   if(!found&&typeof globalThis.setTimeout==="function"){
     for(const delay of [1200,4500])globalThis.setTimeout(()=>{
       if(seq!==sequence||!p.open||selected()?.id!==c.id||displayCurrency()!=="EUR")return;
       if(paintNative(p,c,"EUR")){
         const unit=p.querySelector("[data-native-price-heading]")?.textContent?.replace(/^Prix\s+/,"")||"EUR";
         write(p,"status",c.symbol+" · "+unit+" · HISTORIQUE NATIF");
       }
     },delay);
   }
   return;
 }
 write(p,"status",c.symbol+" · recherche d'archive…");
 write(p,"detail","Archive Binance Spot USDT, distincte des Bougies OKX USDC.");
 if(period==="60d"||period==="90d"||period==="1y"){
  try{
   const api=await loadLongReader();
   if(seq!==sequence||!p.open||selected()?.id!==c.id)return;
   if(reload||!longCatalog)longCatalog=await api.refreshIndex();
   if(seq!==sequence||!p.open||selected()?.id!==c.id)return;
   if(longCatalog?.archiveFamily!=="long-periods"||longCatalog.quote!=="USDT"||
      !Array.isArray(longCatalog.coverage))throw Error("Catalogue longues périodes non qualifié");
   const entry=longCatalog.coverage.find(x=>x.id===c.id&&x.period===period);
   if(!entry){
    write(p,"status",c.symbol+" · période longue indisponible");
    write(p,"detail","Aucune archive complète Binance Spot USDT pour cette période. Aucune période inventée ni Max implicite.");
    paintNative(p,c);
    return;
   }
   write(p,"status",c.symbol+" · "+period+" · SHA-256 en cours…");
   const data=await api.readSeries({assetId:c.id,period});
   if(seq!==sequence||!p.open||selected()?.id!==c.id||
      p.querySelector("[data-history-period]")?.value!==period)return;
   if(data.metadata.id!==c.id||data.metadata.period!==period||
      data.metadata.pair!==entry.pair||data.candles.length!==entry.candles)
    throw Error("Longue série hors contexte");
   paint(p,data);
   write(p,"status",c.symbol+" · "+period+" · "+(data.metadata.derivedFrom90d?"DÉCOUPE 90J · ":"")+"ARCHIVE VÉRIFIÉE");
   write(p,"detail","Archives longues Binance Spot USDT vérifiées : lecture seule, pas de conversion USDT/USD, aucun ordre, Max non mesuré.");
  }catch(e){
   if(seq!==sequence||!p.open)return;
   empty(p);write(p,"status",c.symbol+" · longue archive indisponible");
   write(p,"detail","Erreur longues périodes : "+String(e?.message||e).slice(0,150));
   paintNative(p,c);
  }
  return;
 }
 try{
  const api=await loadReader();if(seq!==sequence||!p.open)return;
  if(reload||!catalog)catalog=await api.refreshIndex();
  if(seq!==sequence||!p.open)return;
  if(!catalog?.snapshot||catalog.quote!=="USDT"||catalog.coverage?.length!==21)throw Error("Catalogue non qualifié");
  let entry=catalog.coverage.find(x=>x.id===c.id&&x.period===period);
  let source=api,archiveName="R9",extensionError="";
  if(!entry){
   try{
    const ext=await loadUniverseReader();
    if(seq!==sequence||!p.open||selected()?.id!==c.id)return;
    if(reload||!universeCatalog)universeCatalog=await ext.refreshIndex();
    if(seq!==sequence||!p.open||selected()?.id!==c.id)return;
    if(!universeCatalog?.snapshot||universeCatalog.quote!=="USDT"||
      universeCatalog.archiveFamily!=="universe"||!Array.isArray(universeCatalog.coverage))
      throw Error("Catalogue Univers non qualifié");
    entry=universeCatalog.coverage.find(x=>x.id===c.id&&x.period===period);
    if(entry){source=ext;archiveName="UNIVERS";}
   }catch(e){extensionError=String(e?.message||e).slice(0,100);}
  }
  if(!entry){
   try{
    const ext=await loadCohortReader();
    if(seq!==sequence||!p.open||selected()?.id!==c.id)return;
    if(reload||!cohortCatalog)cohortCatalog=await ext.refreshIndex();
    if(seq!==sequence||!p.open||selected()?.id!==c.id)return;
    if(!cohortCatalog?.snapshot||cohortCatalog.quote!=="USDT"||
       cohortCatalog.archiveFamily!=="top50"||cohortCatalog.coverage?.length!==57)
     throw Error("Catalogue Top50 non qualifié");
    entry=cohortCatalog.coverage.find(x=>x.id===c.id&&x.period===period);
    if(entry){
     source=ext;
     archiveName=entry.family==="top50-additional"?"TOP50 COMPLÉMENTAIRE":"TOP50";
    }
   }catch(e){extensionError+=(extensionError?" · ":"")+String(e?.message||e).slice(0,100);}
  }
  if(!entry){
   write(p,"status",c.symbol+" · archive non disponible");
   write(p,"detail","Pas d’archive Binance Spot R9/Univers/Top50 pour cet actif. Jamais de substitution BTC. Historique graphique natif séparé ci-dessous."+(extensionError?" · "+extensionError:""));
   paintNative(p,c);
   return;
  }
  write(p,"status",c.symbol+" · "+archiveName+" · contrôle SHA-256…");
  const data=await source.readSeries({assetId:c.id,period});
  if(seq!==sequence||!p.open||selected()?.id!==c.id||
   p.querySelector("[data-history-period]")?.value!==period)return;
  if(data.metadata.id!==c.id||data.metadata.pair!==entry.pair||
   data.metadata.period!==period||data.candles.length!==entry.candles)
   throw Error("Réponse R9 hors contexte");
  paint(p,data);
  write(p,"status",c.symbol+" · "+LABEL[period]+" · "+archiveName+" · ARCHIVE VÉRIFIÉE");
  write(p,"detail","Archive "+archiveName+" historique vérifiée : aucune conversion USDT/USDC, aucun ordre.");
 }catch(e){if(seq!==sequence||!p.open)return;empty(p);
  write(p,"status",c.symbol+" · archive indisponible");
  write(p,"detail","Erreur historique : "+String(e?.message||e).slice(0,150)+" · aucune donnée inventée.");
  paintNative(p,c);
 }
}
function mount(){
 if(panel())return true;
 const zone=document.getElementById("market-zone");if(!zone)return false;
 if(!document.getElementById("traderVerifiedHistoryStyle")){
  const style=document.createElement("style");style.id="traderVerifiedHistoryStyle";
  style.textContent=[
   "#traderVerifiedHistory{grid-column:1/-1;display:block;box-sizing:border-box;width:99%;margin:14px auto 24px;",
   "color:#d7eff0;background:#071d2a;border:1px solid #2b5965;border-radius:14px;overflow:hidden;",
   "font:12px system-ui,sans-serif}",
   "#traderVerifiedHistory>summary{padding:14px;cursor:pointer;display:flex;gap:12px;flex-wrap:wrap;",
   "font-size:14px;font-weight:bold;list-style:none}",
   "#traderVerifiedHistory [data-history-status]{color:#83e9db;font-weight:normal;font-size:12px}",
   "#traderVerifiedHistory .history-body{border-top:1px solid #325461;padding:12px}",
   "#traderVerifiedHistory .history-controls{display:flex;align-items:center;flex-wrap:wrap;gap:10px}",
   "#traderVerifiedHistory select,#traderVerifiedHistory button{color:#fff;background:#123743;",
   "border:1px solid #436d7a;border-radius:8px;padding:7px 10px;cursor:pointer}",
   "#traderVerifiedHistory .history-note{color:#a9c3cf}",
   "#traderVerifiedHistory .history-links{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0}",
   "#traderVerifiedHistory .history-links a{color:#8cdbdf;text-decoration:underline}",
   "#traderVerifiedHistory [data-history-meta]{color:#ffe0a0;line-height:1.5}",
   "#traderVerifiedHistory .history-scroll{overflow-x:auto}",
   "#traderVerifiedHistory [data-history-native]{margin-top:12px;padding:11px;border:1px solid #2d6370;border-radius:10px;background:#0a2b31}",
   "#traderVerifiedHistory [data-history-native][hidden]{display:none!important}",
   "#traderVerifiedHistory [data-history-r9][hidden],#traderVerifiedHistory [data-history-controls][hidden]{display:none!important}",
   "#traderVerifiedHistory [data-history-native] h4{margin:0 0 7px;color:#9cfff1}",
   "#traderVerifiedHistory table{min-width:550px;width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}",
   "#traderVerifiedHistory td,#traderVerifiedHistory th{padding:7px;border-bottom:1px solid #2a4b59;text-align:right}",
   "#traderVerifiedHistory td:first-child,#traderVerifiedHistory th:first-child{text-align:left}"
  ].join("");document.head.appendChild(style);
 }
 const p=document.createElement("details");p.id=ID;
 p.setAttribute("aria-label","Historique Binance Spot vérifié · lecture seule");
 p.innerHTML=[
 '<summary><strong>HISTORIQUE VÉRIFIÉ · R9 + UNIVERS + TOP50 + LONG</strong>',
 '<span data-history-status>Fermé · aucune lecture</span></summary>',
 '<div class="history-body"><div class="history-controls" data-history-controls>',
 '<label for="traderHistoryAsset">Actif historique</label><select id="traderHistoryAsset" data-history-asset aria-label="Actif du Coffre">',
 '<option value="auto">Graphique / Market · automatique</option>',
 '<option value="bitcoin">BTC · Bitcoin</option><option value="ethereum">ETH · Ethereum</option>',
 '<option value="binancecoin">BNB · Binance Coin</option><option value="ripple">XRP</option>',
 '<option value="solana">SOL · Solana</option><option value="quack-ai">Q · Quack AI</option>',
 '<option value="concrete">CT · Concrete</option></select>',
 '<label for="traderHistoryPeriod">Période</label><select id="traderHistoryPeriod" data-history-period>',
 '<option value="24h">24 h · 5 min</option><option value="7d">7 j · 1 h</option>',
 '<option value="30d">30 j · 4 h</option><option value="60d">60 j · 4 h</option><option value="90d">90 j · 4 h</option><option value="1y">1 an · 1 jour</option></select>',
 '<button type="button" data-history-reload>Actualiser le catalogue</button></div>',
 '<p class="history-note" data-history-detail>Lecture à la demande, sans impact sur OKX.</p>',
 '<nav class="history-links" aria-label="Outils autonomes du Coffre">',
 '<a href="../trader/historical-inventory.html" target="_blank" rel="noopener noreferrer">Inventaire Top 250 ↗</a>',
 '<a href="../trader/source-catalogue.html" target="_blank" rel="noopener noreferrer">Catalogue des sources ↗</a>',
 '<a href="../trader/verified-reader.html" target="_blank" rel="noopener noreferrer">Lire les bougies vérifiées ↗</a>',
 '</nav>',
 '<section data-history-r9><p data-history-meta>—</p><div class="history-scroll"><table>',
 '<thead><tr><th>Ouverture UTC</th><th>Ouverture USDT</th><th>Haut</th><th>Bas</th>',
 '<th>Clôture</th><th>Volume actif</th></tr></thead><tbody data-history-rows></tbody>',
 '</table></div></section><section data-history-native hidden aria-label="Historique du graphique natif, distinct de R9">',
 '<h4 data-native-title>HISTORIQUE DU GRAPHIQUE · USD · HORS R9</h4>',
 '<p class="history-note" data-native-status>En attente du graphique existant.</p>',
 '<div class="history-scroll"><table><thead><tr><th>Heure UTC</th><th data-native-price-heading>Prix USD</th></tr></thead>',
 '<tbody data-native-rows></tbody></table></div></section></div>'
 ].join("");
 zone.appendChild(p);
 p.addEventListener("toggle",()=>{
  if(p.open)void refresh({reload:true});
  else{sequence++;empty(p);write(p,"status","Fermé · aucune lecture");}
 });
 p.querySelector("[data-history-period]")?.addEventListener("change",()=>{if(p.open)void refresh();});
 p.querySelector("[data-history-asset]")?.addEventListener("change",()=>{sequence++;if(p.open)void refresh();});
 p.querySelector("[data-history-reload]")?.addEventListener("click",()=>{if(p.open)void refresh({reload:true});});
 globalThis.addEventListener("agent-crypto:selected-market-changed",()=>{sequence++;if(p.open)void refresh();},{passive:true});
 globalThis.addEventListener("agent-crypto:quote-architecture-changed",()=>{sequence++;if(p.open)void refresh();},{passive:true});
 for(const name of ["agent-crypto:new-listing-line-ready","agent-crypto:external-asset-changed","agent-crypto:trader-line-loaded"]){
  globalThis.addEventListener(name,()=>{
   if(!p.open)return;
   const coin=selected();
   if(!coin)return;
   if(coin.origin==="external"){
    const found=paintNative(p,coin,displayCurrency());
    write(p,"status",coin.symbol+" · graphique externe consulté · "+(found?"POINTS DISPONIBLES":"EN ATTENTE"));
   }else paintNative(p,coin,displayCurrency());
  },{passive:true});
 }
 return true;
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
globalThis.AgentCryptoTraderHistoricalPanel=Object.freeze({mount,refresh,inspectChart:inspectedChart,selected,read_only:true,is_live:false,quote:"USDT",real_orders:false});
})();