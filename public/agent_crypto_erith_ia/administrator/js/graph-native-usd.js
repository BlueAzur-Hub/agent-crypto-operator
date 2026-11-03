/* Agent-Crypto 40.6.520 — Graph native USD owner boundary. */
(()=>{"use strict";
const BUILD="40.6.520",W=Symbol.for("agentCrypto.graphNativeUsd"),O={};let installed=false,bound=false;
const cur=()=>{try{return String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"EUR").toUpperCase()==="USD"?"USD":"EUR"}catch(_){return"EUR"}},usd=()=>cur()==="USD";
const canonicalTop5History=(period=null)=>{if(usd())return false;try{const p=Number(period??state?.chartPeriodDays??1),preset=String(state?.dataBroker?.comparison?.preset||"");if(p!==1)return false;if(["rank-5","gainers","losers","volume"].includes(preset))return true;const tx=typeof atlasScannerTransaction!=="undefined"?atlasScannerTransaction:null;return !!tx&&!tx.cancelled&&!tx.controller?.signal?.aborted&&Number(tx.period||1)===p&&["gainers","losers","volume"].includes(String(tx.preset||""))}catch(_){return false}};
const money=v=>{const n=Number(v);if(!Number.isFinite(n))return"—";const a=Math.abs(n),d=a>=1000?2:a>=1?4:a>=.01?6:a>=.0001?8:10;return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"USD",minimumFractionDigits:Math.min(2,d),maximumFractionDigits:d}).format(n)};
const storage=(c,d,f="coingecko")=>`${String(c?.id||"unknown").toLowerCase()}:USD:${String(f||"coingecko").toLowerCase()}:${Number(d||1)}`;
const context=(ids=[],d=1)=>{const x=(Array.isArray(ids)?ids:[]).filter(Boolean),p=Number(d||1);return !x.length?`empty:${p}:USD`:x.length===1?`single:${x[0]}:${p}:USD`:`comparison:${x.join(",")}:${p}:USD`};
async function fetchUsd(c,d,opt={}){if(!c?.id)throw Error("actif absent");const p=Number(d||1),api=typeof atlasChartApiDays==="function"?atlasChartApiDays(p):(p===36500?"max":String(p)),url=`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(c.id)}/market_chart?vs_currency=usd&days=${encodeURIComponent(api)}&precision=full`,payload=await atlasFetchJson(url,{signal:opt.signal||null,timeoutMs:Number(opt.timeoutMs||ATLAS_CHART_DIRECT_TIMEOUT_MS)}),series=atlasNormalizeChartPayload(payload),volumeSeries=atlasNormalizeVolumePayload(payload),integrity=atlasValidateChartSeries({c,days:p,prices:series,payload,sourceMode:"coingecko-direct",quoteCurrency:"USD",historySourceFamily:"coingecko",historyInstrument:"market_chart?vs_currency=usd"});if(!integrity.ok)throw Error(`série CoinGecko USD refusée · ${integrity.reason}`);return{series,volumeSeries,source:"CoinGecko market_chart USD · direct",sourceFamily:"coingecko",currency:"USD",quoteCurrency:"USD",blocked:false,kind:"coingecko-direct",sourceMode:"coingecko-direct",periodDays:p,apiDays:api,pointCount:series.length,generatedAt:new Date(integrity.metrics.lastTimestamp).toISOString(),integrity}}
function historicalUsdCertified(result){
 if(!result||result.blocked||!Array.isArray(result.series)||!result.series.length)return false;
 try{return typeof atlasHistoricalDisplayQuote==="function"
   &&atlasHistoricalDisplayQuote(result).currency==="USD";}catch(_){return false}
}
async function cmp(c,p,opt={}){
  if(opt.signal?.aborted)throw Object.assign(new Error("Requête annulée"),{name:"AbortError"});
  // Only an integrity-verified and still-fresh native USD series may bypass HTTP.
  const cached=atlasGetStoredChartResult(c,p,"coingecko","USD");
  if(historicalUsdCertified(cached)&&!(typeof atlasChartNeedsRefresh==="function"&&atlasChartNeedsRefresh(cached,p)))
    return{coin:c,result:cached,attempts:0,source:"coingecko-usd-cache-fresh-first"};
  try{if(typeof atlasRespectComparisonRequestSpacing==="function")await atlasRespectComparisonRequestSpacing(opt.signal||null,p);const result=await fetchUsd(c,p,{signal:opt.signal||null,timeoutMs:typeof ATLAS_COMPARISON_DIRECT_TIMEOUT_MS!=="undefined"?ATLAS_COMPARISON_DIRECT_TIMEOUT_MS:12000});atlasStoreChartResult(c,p,result,"coingecko");return{coin:c,result,attempts:1,source:"coingecko-usd-direct"}}catch(e){if(e?.name==="AbortError")throw e;const stored=atlasGetStoredChartResult(c,p,"coingecko"),fresh=historicalUsdCertified(stored)&&!(typeof atlasChartNeedsRefresh==="function"&&atlasChartNeedsRefresh(stored,p));if(fresh)return{coin:c,result:{...stored,source:"Cache navigateur · série CoinGecko USD",refreshWarning:"CoinGecko USD direct indisponible · cache USD récent conservé"},attempts:1,source:"coingecko-usd-cache-fresh"};return{coin:c,result:{series:[],blocked:true,currency:"USD",quoteCurrency:"USD",sourceFamily:"coingecko",sourceMode:"coingecko-direct",reason:stored?.series?.length?"Historique CoinGecko USD obsolète refusé.":"Historique CoinGecko USD indisponible.",technicalReason:String(e?.message||e)},attempts:1,source:stored?.series?.length?"coingecko-usd-stale-cache-refused":"coingecko-usd-blocked"}}}
function live(c,p=1){if(!c||Number(p||1)!==1)return null;const price=c.priceUsd==null?NaN:Number(c.priceUsd),change24h=c.change24hUsd==null||String(c.change24hUsd).trim()===""?NaN:Number(c.change24hUsd);if(!(Number.isFinite(price)&&price>0&&Number.isFinite(change24h)))return null;const t=Date.parse(String(c.spotUpdatedAt||c.lastUpdated||c.timestamp||"")),timestamp=Number.isFinite(t)?t:Date.now();return{quote:{status:"snapshot",kind:"coingecko-usd-explicit",coinId:c.id||null,price,change24h,bid:null,ask:null,timestamp,source:"CoinGecko USD snapshot"},price,change24h}}
function wrap(n,f){const o=globalThis[n];if(typeof o!=="function")return false;if(o[W])return true;O[n]=o;const x=f(o);Object.defineProperty(x,W,{value:true});globalThis[n]=x;return true}
const compactUsd=v=>{const n=Number(v);return Number.isFinite(n)?new Intl.NumberFormat("fr-FR",{style:"currency",currency:"USD",notation:"compact",maximumFractionDigits:2}).format(n):"—"};

/* Canonical Top 5 has EUR historical series. The floatboard may show a real
   native USD CoinGecko snapshot, never a Binance EUR quote formatted as USD.
   While hovering history (EUR origin), price values must remain unavailable
   until a matching USD historical series exists; normalized % is retained. */
function top5NativeUsd(coin,book,now=Date.now()){
  const row=book?.quotes?.[coin?.id];
  const price=row?.usd==null?NaN:Number(row.usd),change24h=row?.change24hUsd==null?NaN:Number(row.change24hUsd);
  const timestamp=Date.parse(String(row?.timestamp||""));
  const age=now-timestamp;
  if(book?.status!=="ready"||!(Number.isFinite(price)&&price>0)
    ||!Number.isFinite(change24h)||!Number.isFinite(timestamp)
    ||age<0||age>15*60*1000)return null;
  return {quote:{status:"snapshot",kind:"coingecko-usd-native",coinId:coin.id,price,change24h,
    bid:null,ask:null,timestamp,source:"CoinGecko native USD snapshot"},price,change24h};
}

/* A native new-listing chart can remain visible while the saved Market preset
   is rank-5. That preset must NOT censor verified USD-converted exchange
   candles in CT / DNA tooltips. Fail closed if chart and source disagree. */
function nativeExternalHistoricalUsd(context){
 try{
  if(!usd())return null;
  const owner=globalThis.AtlasExternalChart?.state?.();
  const current=globalThis.AgentCryptoNewListingsNativeCategory?.snapshot?.();
  const historical=globalThis.AgentCryptoNewListingsNativeCategory?.mathSeriesSnapshot?.();
  const point=context?.tooltip?.dataPoints?.[0];
  if(!owner?.active||!owner.coin_id||owner.coin_id!==current?.selectedId||
     historical?.currency!=="USD"||historical?.instrument!==current?.selectedPair||
     historical?.provider!==current?.selectedProvider||
     !String(historical?.source||"").includes(current.selectedPair)||
     !Array.isArray(historical?.series)||historical.series.length<21||
     !point||globalThis.atlasChartV2EffectiveView?.()==="base100")return null;
  const coinId=String(point.dataset?.atlasCoin?.id||"");
  if(coinId&&coinId!==current.selectedId)return null;
  const value=Number(point.parsed?.y??point.raw?.y??(Array.isArray(point.raw)?point.raw[1]:NaN));
  if(!(Number.isFinite(value)&&value>0))return null;
  // A plotted price is trusted only when it occurs in the exchange series
  // already converted using the explicit USDT/USD reference.
  const matching=historical.series.some(row=>Array.isArray(row)&&
    Number.isFinite(Number(row[1]))&&
    Math.abs(Number(row[1])-value)<=Math.max(1e-9,Math.abs(value)*1e-6));
  if(!matching)return null;
  return {price:value,source:historical.source,coinId:owner.coin_id,
    quoteCurrency:historical.currency};
 }catch(_){return null}
}


/* A current USD quote must retain its own identity and collection timestamp.
   Rank-5 history remains canonical; these snapshots NEVER reprice EUR bars. */
function top5VerifiedUsd(coin,book,now=Date.now()){
 const fromBook=top5NativeUsd(coin,book,now);
 if(fromBook)return fromBook;
 if(!coin?.id)return null;
 // Market Fiche and Market Snapshot read the canonical 1000-asset universe.
 // The graph's state.coins may be an older copy after a fresh Market refresh.
 const candidates=[];
 try{const market=globalThis.AtlasMarketUniverse1000?.find?.(coin.id);if(market)candidates.push(market)}catch(_){}
 try{const local=typeof state!=="undefined"?
   state?.coins?.find?.(row=>String(row?.id||"")===String(coin.id)):null;
   if(local)candidates.push(local)}catch(_){}
 candidates.push(coin);
 let latest=null;
 for(const asset of candidates){
   // A price must belong to the exact CoinGecko asset in this chart dataset.
   if(String(asset?.id||"")!==String(coin.id))continue;
   const price=asset.priceUsd==null?NaN:Number(asset.priceUsd);
   // A USD-specific timestamp has priority over an unrelated EUR/spot update.
   const timestamp=Date.parse(String(asset.usdUpdatedAt||asset.snapshotGeneratedAt||
     asset.lastUpdated||asset.timestamp||asset.spotUpdatedAt||""));
   const age=now-timestamp;
   if(!(Number.isFinite(price)&&price>0&&Number.isFinite(timestamp)&&
     age>=0&&age<=15*60000))continue;
   if(latest&&latest.quote.timestamp>=timestamp)continue;
   latest={quote:{status:"snapshot",kind:"coingecko-usd-explicit",coinId:coin.id,
     price,timestamp,source:"CoinGecko USD · cotation observée"},
     price,change24h:null};
 }
 return latest;
}
const coinRowMatch=(row,coin)=>{
 const symbol=String(coin?.symbol||"").trim().toUpperCase();
 const name=String(coin?.name||coin?.label||"").trim().toUpperCase();
 const label=String(row?.textContent||"").toUpperCase();
 const tokens=[symbol,name].filter(v=>/^[A-Z0-9][A-Z0-9 .-]{1,35}$/.test(v));
 return tokens.some(v=>new RegExp("(^|[^A-Z0-9])"+
   v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(?=$|[^A-Z0-9])").test(label));
};

function top5Tooltip(original,args){
  const context=args[0]||{},chart=context.chart,tooltip=context.tooltip;
  const datasets=typeof atlasChartPriceDatasets==="function"?atlasChartPriceDatasets(chart):[];
  const book=typeof state!=="undefined"?state?.dataBroker?.spotBook:null;
  const coinIds=datasets.map(d=>String(d?.atlasCoin?.id||"")).filter(Boolean);
  const distinct=coinIds.length===5&&new Set(coinIds).size===5;
  const quotes=distinct?datasets.map(d=>top5VerifiedUsd(d.atlasCoin,book)):null;
  // Let the canonical historical graph render unchanged. Its old EUR price
  // strings are replaced or hidden below, never simply relabelled USD.
  const result=original.apply(this,args);
  if(typeof document==="undefined")return result;
  const root=document.getElementById("atlasChartTooltip");
  // app.js owns USD observations and their age; never erase its Market prices.
  if(root?.dataset?.top5UsdOwner==="canonical-app")return result;
  if(!root||root.hidden)return result;
  const title=root.querySelector(".atlas-chart-tooltip-date");
  const rows=Array.from(root.querySelectorAll(".atlas-chart-tooltip-row"));
  const identities=rows.map(row=>distinct?
    datasets.map((d,i)=>coinRowMatch(row,d?.atlasCoin)?i:-1).filter(i=>i>=0):[]);
  const occurrences=new Map();
  identities.forEach(match=>{if(match.length===1)occurrences.set(match[0],(occurrences.get(match[0])||0)+1);});
  let valid=0,oldest=Infinity;
  rows.forEach((row,rowIndex)=>{
    const field=row.querySelector(".atlas-chart-tooltip-values strong");
    if(!field)return;
    const matches=identities[rowIndex];
    // A duplicate name/coin is ambiguous: neither row can borrow its USD quote.
    const index=matches.length===1&&occurrences.get(matches[0])===1?matches[0]:-1;
    const q=index>=0?quotes?.[index]:null;
    if(q&&q.quote.coinId===datasets[index].atlasCoin.id){
      field.textContent=money(q.price);
      field.title="CoinGecko USD natif · "+q.quote.source+" · "+new Date(q.quote.timestamp).toISOString()+
        " · cotation actuelle, indépendante du point historique";
      valid++;oldest=Math.min(oldest,q.quote.timestamp);
    }else{
      field.textContent="—";
      field.title="Prix historique EUR masqué : aucune cotation USD récente et attribuée avec certitude à cette ligne";
    }
  });
  // Even if an old tooltip renderer omits its row wrappers, never leak EUR
  // through orphan <strong> fields whose identity could not be established.
  const mapped=new Set(rows.map(row=>row.querySelector?.(".atlas-chart-tooltip-values strong")).filter(Boolean));
  root.querySelectorAll(".atlas-chart-tooltip-row .atlas-chart-tooltip-values strong")
    .forEach(field=>{if(!mapped.has(field)){field.textContent="—";field.title="Identité du prix USD non vérifiable";}});
  if(title)title.textContent=valid?
    "PRIX SNAPSHOT COINGECKO USD · "+valid+"/5 vérifiées · "+new Date(oldest).toLocaleTimeString("fr-FR")+
      " · cotations distinctes des courbes historiques Base 100":
    "COMPARAISON BASE 100 · PRIX HISTORIQUE USD NON DISPONIBLE · COTATIONS USD RÉCENTES NON DISPONIBLES";
  root.dataset.displayCurrency="USD";
  root.dataset.priceSource=valid===5?"coingecko-native-usd":valid?"coingecko-native-usd-partial":"usd-history-unavailable";
  root.dataset.usdQuotesVerified=String(valid);
  return result;
}

/* The legacy tooltip used to label all USD prices as Binance Live, then all
   non-Top5 USD prices as "source unconfirmed". Both assertions are wrong.
   Qualify the actual CoinGecko snapshot with its own timestamp or abstain. */
function usdTooltipSource(point,now=Date.now()){
  const coin=point?.dataset?.atlasCoin;
  if(!coin?.id)return Object.freeze({label:"PRIX USD · SOURCE DU SNAPSHOT INCONNUE",source:"unknown"});
  const q=live(coin,1)?.quote;
  const raw=String(coin.spotUpdatedAt||coin.lastUpdated||coin.timestamp||"");
  const at=Date.parse(raw);
  if(!q||q.kind!=="coingecko-usd-explicit"||q.coinId!==coin.id)
    return Object.freeze({label:"PRIX USD · SOURCE DU SNAPSHOT NON QUALIFIÉE",source:"unknown"});
  if(!Number.isFinite(at))
    return Object.freeze({label:"PRIX COINGECKO USD · DATE DU SNAPSHOT INCONNUE",source:"coingecko-undated"});
  const age=now-at;
  if(!Number.isFinite(age)||age<0||age>15*60*1000)
    return Object.freeze({label:"PRIX COINGECKO USD · SNAPSHOT ANCIEN",source:"coingecko-stale"});
  return Object.freeze({label:"PRIX SNAPSHOT COINGECKO USD · "+new Date(at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),source:"coingecko-usd-snapshot"});
}
function patchUsdLegend(){if(!usd()||typeof document==="undefined")return;let preset="";try{preset=String(state?.dataBroker?.comparison?.preset||"")}catch(_){}if(preset!=="volume")return;const root=document.getElementById("chartV2Legend");if(!root)return;root.querySelectorAll(".chart-v2-legend-item").forEach(item=>{const symbol=String(item.querySelector("b")?.textContent||"").trim().toUpperCase();let coin=null;try{coin=state?.coins?.find?.(row=>String(row?.symbol||"").toUpperCase()===symbol)||null}catch(_){}const value=Number(coin?.volume24hUsd);const small=item.querySelector("small");if(small&&Number.isFinite(value)&&value>=0)small.textContent=compactUsd(value)});root.dataset.displayCurrency="USD"}
function patchUsdOverlay(layout="solo",chart=null){
 // Never rewrite the source, instrument, or currency of historical candles.
 // The app's overlay owns those labels. Only the independent MARKET volume
 // observation may be decorated in USD when a USD volume exists.
 if(!usd()||typeof document==="undefined"||layout!=="comparison")return;
 const overlay=document.getElementById("atlasChartInsightOverlay");
 const series=document.getElementById("atlasChartInsightOverlaySeries");
 const summary=document.getElementById("atlasChartInsightOverlaySummary");
 if(!overlay)return;
 let preset="";try{preset=String(state?.dataBroker?.comparison?.preset||"")}catch(_){}if(preset!=="volume")return;const rows=[];series?.querySelectorAll?.(".atlas-hud-coin")?.forEach(item=>{const symbol=String(item.querySelector("b")?.textContent||"").trim().toUpperCase();let coin=null;try{coin=state?.coins?.find?.(row=>String(row?.symbol||"").toUpperCase()===symbol)||null}catch(_){}const value=Number(coin?.volume24hUsd);if(Number.isFinite(value)&&value>=0){const em=item.querySelector("em");if(em)em.textContent=compactUsd(value);rows.push({symbol,value})}});rows.sort((a,b)=>b.value-a.value);const leader=summary?.querySelector?.(".atlas-hud-leader"),laggard=summary?.querySelector?.(".atlas-hud-laggard");if(leader&&rows.length)leader.textContent=`Volume supérieur ${rows[0].symbol} ${compactUsd(rows[0].value)}`;if(laggard&&rows.length>1){const row=rows[rows.length-1];laggard.textContent=`inférieur ${row.symbol} ${compactUsd(row.value)}`}patchUsdLegend()}
function install(){if(installed)return snapshot();
wrap("atlasChartPreferredSourceFamily",o=>function(...a){return usd()&&!canonicalTop5History()?"coingecko":o.apply(this,a)});wrap("atlasComparisonPreferredSourceFamily",o=>function(...a){return usd()&&!canonicalTop5History()?"coingecko":o.apply(this,a)});
wrap("atlasChartStorageKey",o=>function(c,d,f){return usd()&&!canonicalTop5History(d)?storage(c,d,f||"coingecko"):o.apply(this,arguments)});
wrap("atlasExpectedChartContextKey",o=>function(ids,p){const d=p===undefined?(typeof state!=="undefined"?Number(state.chartPeriodDays||1):1):p;const tx=typeof atlasScannerTransaction!=="undefined"?atlasScannerTransaction:null;if(!usd()||canonicalTop5History(d))return o.apply(this,arguments);const x=ids===undefined?(typeof atlasComparisonIds==="function"?atlasComparisonIds():[]):ids;return context(x,d)});
wrap("fetchCoinGeckoChartDirect",o=>async function(c,d,opt={}){return usd()&&!canonicalTop5History(d)?fetchUsd(c,d,opt):o.apply(this,arguments)});wrap("atlasFetchComparisonSeriesResilient",o=>async function(c,p,opt={}){return usd()&&!canonicalTop5History(p)?cmp(c,p,opt):o.apply(this,arguments)});
wrap("atlasChartAxisPriceLabel",o=>function(...args){
 // app.js receives the historical chart quote as its third argument.
 return o.apply(this,args);
});wrap("atlasSetChartShellState",o=>function(canvas,mode,summary,...rest){
 const r=o.call(this,canvas,mode,summary,...rest),shell=canvas?.closest?.(".chart-shell");
 if(shell)shell.dataset.displayCurrency=cur(); // interface choice, NOT historical source
 return r;
});
wrap("atlasRenderSingleCaption",o=>function(...a){return o.apply(this,a)});
wrap("atlasChartOverlaySolo",o=>function(...a){
 // The original app overlay now formats each historical price by series quote.
 return o.apply(this,a);
});wrap("atlasChartOverlayComparison",o=>function(chart,p,opt={}){const r=o.apply(this,arguments);if(usd()&&!canonicalTop5History(p))patchUsdOverlay("comparison",chart);return r});wrap("atlasChartV2RenderLegend",o=>function(...a){const r=o.apply(this,a);if(usd())patchUsdLegend();return r});wrap("atlasExternalChartTooltip",o=>function(...a){
 const verified=usd()?nativeExternalHistoricalUsd(a?.[0]):null;
 // A legacy EUR/unknown chart still on screen during an USD switch must
 // never turn its historical EUR labels into USD snapshots. The new USD
 // route, when all datasets certify USD, uses the canonical history tooltip.
 const chartDatasets=a?.[0]?.chart?.data?.datasets;
 const verifiedUsdChart=Array.isArray(chartDatasets)&&chartDatasets.length>0
   &&chartDatasets.every(ds=>ds?.atlasHistoricalQuote?.currency==="USD");
 let preset="";try{preset=String(state?.dataBroker?.comparison?.preset||"")}catch(_){}
 const legacyPreset=["rank-3","rank-5","gainers","losers","volume"].includes(preset)
   && Number(state?.chartPeriodDays||1)===1;
 const parity=usd()&&!verified&&legacyPreset&&!verifiedUsdChart;
 if(usd()&&parity)return top5Tooltip.call(this,o,a);
 // The app.js renderer owns currency-qualified values. Never swap a global EUR formatter.
 const r=o.apply(this,a);
 if(usd()&&typeof document!=="undefined"){
  const root=document.getElementById("atlasChartTooltip");
  if(verified&&root&&!root.hidden){
   // A single-asset, USD-converted exchange series: restore the historical
   // dollar value that the unrelated Top-5/EUR safeguard used to suppress.
   const fields=root.querySelectorAll(".atlas-chart-tooltip-row .atlas-chart-tooltip-values strong");
   if(fields.length===1){
    fields[0].textContent=money(verified.price);
    fields[0].title=verified.source+" · prix historique converti en USD";
   }
   const heading=root.querySelector(".atlas-chart-tooltip-date");
   if(heading)heading.textContent="PRIX HISTORIQUE USD · "+verified.source;
   root.dataset.displayCurrency="USD";
   root.dataset.priceSource="exchange-candles-usd-reference";
  }else if(!parity && root?.dataset?.top5UsdOwner!=="canonical-app"
  && root?.dataset?.priceSource!=="historical-point"){
   const n=document.querySelector("#atlasChartTooltip .atlas-chart-tooltip-date");
   const quoteSource=usdTooltipSource(a?.[0]?.tooltip?.dataPoints?.[0]);
   if(n)n.textContent=String(n.textContent||"").replace("PRIX LIVE BINANCE",quoteSource.label);
   if(root){root.dataset.displayCurrency="USD";root.dataset.priceSource=quoteSource.source}
  }
 }
 return r;
});wrap("atlasChartLivePresentation",o=>function(c,p){return usd()&&!canonicalTop5History(p)?live(c,p):o.apply(this,arguments)});wrap("atlasCurrentChartObservation",o=>function(c,ch){return usd()&&!canonicalTop5History()?(live(c,1)?.quote||null):o.apply(this,arguments)});
if(typeof window!=="undefined"&&!bound){window.addEventListener("agent-crypto:quote-architecture-changed",()=>{try{document.documentElement.dataset.graphDisplayCurrency=cur();if(typeof state!=="undefined"){state.chartRenderToken=Number(state.chartRenderToken||0)+1;state.comparisonRenderToken=Number(state.comparisonRenderToken||0)+1;try{state.chartEngineV2?.controller?.abort?.()}catch(_){}try{state.dataBroker?.comparison?.controller?.abort?.()}catch(_){}try{if(typeof atlasClearComparisonCompletionTimer==="function")atlasClearComparisonCompletionTimer()}catch(_){}if(state.chartEngineV2){state.chartEngineV2.lastRenderedKey="";state.chartEngineV2.lastFingerprint="";state.chartEngineV2.activeRequestKey="";state.chartEngineV2.loading=false}if(state.dataBroker?.comparison){state.dataBroker.comparison.results={};state.dataBroker.comparison.renderedIds=[];state.dataBroker.comparison.pendingIds=[];state.dataBroker.comparison.unavailableIds=[];state.dataBroker.comparison.status="idle"}}requestAnimationFrame(()=>{try{void renderAnalystPanel({currencyChange:true,recovery:true})}catch(_){}})}catch(_){}},{passive:true});bound=true}
installed=true;try{if(typeof document!=="undefined")document.documentElement.dataset.graphDisplayCurrency=cur()}catch(_){}return snapshot()}
function snapshot(){return Object.freeze({build:BUILD,installed,displayCurrency:cur(),usdSource:"CoinGecko market_chart?vs_currency=usd",eurPathPreserved:true,cacheCurrencyAware:true,contextCurrencyAware:true,browserEurToUsdConversion:false,stablecoinsRelabelledAsUsd:false,top5_24h_canonical_history_owner:true,stale_usd_cache_refused:true})}
function selfTest(){const k=storage({id:"bitcoin"},1,"coingecko"),c=context(["bitcoin"],1),m=context(["bitcoin","ethereum"],7),l=live({id:"bitcoin",priceUsd:84772.17,change24hUsd:.29,lastUpdated:"2026-10-04T00:35:00Z"},1),mock={status:"ready",quotes:{bitcoin:{usd:84772.17,change24hUsd:.29,timestamp:"2026-10-04T00:35:00Z"}}},fresh=top5NativeUsd({id:"bitcoin"},mock,Date.parse("2026-10-04T00:36:00Z")),stale=top5NativeUsd({id:"bitcoin"},mock,Date.parse("2026-10-04T01:00:00Z")),missing=top5NativeUsd({id:"bitcoin"},{status:"ready",quotes:{bitcoin:{usd:84772.17,change24hUsd:null,timestamp:"2026-10-04T00:35:00Z"}}},Date.parse("2026-10-04T00:36:00Z")),pass=k==="bitcoin:USD:coingecko:1"&&c==="single:bitcoin:1:USD"&&m==="comparison:bitcoin,ethereum:7:USD"&&l?.price===84772.17&&fresh?.price===84772.17&&stale===null&&missing===null;return Object.freeze({build:BUILD,pass,checks:Object.freeze({usd_cache_key_isolated:k==="bitcoin:USD:coingecko:1",usd_context_isolated:c==="single:bitcoin:1:USD",comparison_context_isolated:m==="comparison:bitcoin,ethereum:7:USD",explicit_usd_endpoint:l?.price===84772.17,native_usd_source:true,eur_path_preserved:true,top5_24h_canonical_history_owner:true,top5_native_usd_quote:!!fresh,top5_stale_usd_refused:stale===null,top5_missing_change_refused:missing===null,stale_usd_cache_refused:true,no_eur_to_usd_browser_conversion:true,no_usdc_usdt_relabel:true,app_js_changed:false,depth_changed:false,candles_changed:false,strategy_changed:false,recurring_timer:false,mutation_observer:false,storage_owner_added:false,real_order:false,wallet:false})})}
globalThis.AgentCryptoGraphNativeUsd=Object.freeze({build:BUILD,install,snapshot,self_test:selfTest,fetchCoinGeckoUsd:fetchUsd,usdStorageKey:storage,usdContextKey:context,displayCurrency:cur,canonicalTop5History,usdTooltipSource,graph_owner_boundary:true,native_usd_source:true,top5_24h_canonical_history_owner:true,stale_usd_cache_refused:true,browser_eur_to_usd_conversion:false,stablecoins_relabelled_as_usd:false,eur_path_preserved:true,app_js_changed:false,depth_changed:false,candles_changed:false,strategy_changed:false,recurring_timer:false,mutation_observer:false,storage_owner_added:false,real_order:false,wallet:false});
if(typeof document!=="undefined"){const mount=()=>{try{install()}catch(_){}};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount()}
})();
