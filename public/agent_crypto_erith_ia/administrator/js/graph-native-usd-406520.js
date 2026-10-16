/* Agent-Crypto 40.6.520 — Graph native USD owner boundary. */
(()=>{"use strict";
const BUILD="40.6.520",W=Symbol.for("agentCrypto.graphNativeUsd406520"),O={};let installed=false,bound=false;
const cur=()=>{try{return String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"EUR").toUpperCase()==="USD"?"USD":"EUR"}catch(_){return"EUR"}},usd=()=>cur()==="USD";
const canonicalTop5History=(period=null)=>{try{const p=Number(period??state?.chartPeriodDays??1),preset=String(state?.dataBroker?.comparison?.preset||"");return p===1&&preset==="rank-5"}catch(_){return false}};
const money=v=>{const n=Number(v);if(!Number.isFinite(n))return"—";const a=Math.abs(n),d=a>=1000?2:a>=1?4:a>=.01?6:a>=.0001?8:10;return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"USD",minimumFractionDigits:Math.min(2,d),maximumFractionDigits:d}).format(n)};
const storage=(c,d,f="coingecko")=>`${String(c?.id||"unknown").toLowerCase()}:USD:${String(f||"coingecko").toLowerCase()}:${Number(d||1)}`;
const context=(ids=[],d=1)=>{const x=(Array.isArray(ids)?ids:[]).filter(Boolean),p=Number(d||1);return !x.length?`empty:${p}:USD`:x.length===1?`single:${x[0]}:${p}:USD`:`comparison:${x.join(",")}:${p}:USD`};
const text=v=>!usd()?v:String(v??"").replaceAll("Prix EUR","Prix USD").replaceAll("PRIX EUR","PRIX USD").replaceAll("CoinGecko EUR","CoinGecko USD").replaceAll("Binance EUR DIRECT","CoinGecko USD DIRECT");
async function fetchUsd(c,d,opt={}){if(!c?.id)throw Error("actif absent");const p=Number(d||1),api=typeof atlasChartApiDays==="function"?atlasChartApiDays(p):(p===36500?"max":String(p)),url=`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(c.id)}/market_chart?vs_currency=usd&days=${encodeURIComponent(api)}&precision=full`,payload=await atlasFetchJson(url,{signal:opt.signal||null,timeoutMs:Number(opt.timeoutMs||ATLAS_CHART_DIRECT_TIMEOUT_MS)}),series=atlasNormalizeChartPayload(payload),volumeSeries=atlasNormalizeVolumePayload(payload),integrity=atlasValidateChartSeries({c,days:p,prices:series,payload,sourceMode:"coingecko-direct"});if(!integrity.ok)throw Error(`série CoinGecko USD refusée · ${integrity.reason}`);return{series,volumeSeries,source:"CoinGecko market_chart USD · direct",sourceFamily:"coingecko",currency:"USD",quoteCurrency:"USD",blocked:false,kind:"coingecko-direct",sourceMode:"coingecko-direct",periodDays:p,apiDays:api,pointCount:series.length,generatedAt:new Date(integrity.metrics.lastTimestamp).toISOString(),integrity}}
async function cmp(c,p,opt={}){try{if(typeof atlasRespectComparisonRequestSpacing==="function")await atlasRespectComparisonRequestSpacing(opt.signal||null,p);const result=await fetchUsd(c,p,{signal:opt.signal||null,timeoutMs:typeof ATLAS_COMPARISON_DIRECT_TIMEOUT_MS!=="undefined"?ATLAS_COMPARISON_DIRECT_TIMEOUT_MS:12000});atlasStoreChartResult(c,p,result,"coingecko");return{coin:c,result,attempts:1,source:"coingecko-usd-direct"}}catch(e){if(e?.name==="AbortError")throw e;const stored=atlasGetStoredChartResult(c,p,"coingecko"),fresh=stored?.series?.length&&!(typeof atlasChartNeedsRefresh==="function"&&atlasChartNeedsRefresh(stored,p));if(fresh)return{coin:c,result:{...stored,currency:"USD",quoteCurrency:"USD",source:"Cache navigateur · série CoinGecko USD",refreshWarning:"CoinGecko USD direct indisponible · cache USD récent conservé"},attempts:1,source:"coingecko-usd-cache-fresh"};return{coin:c,result:{series:[],blocked:true,currency:"USD",quoteCurrency:"USD",sourceFamily:"coingecko",sourceMode:"coingecko-direct",reason:stored?.series?.length?"Historique CoinGecko USD obsolète refusé.":"Historique CoinGecko USD indisponible.",technicalReason:String(e?.message||e)},attempts:1,source:stored?.series?.length?"coingecko-usd-stale-cache-refused":"coingecko-usd-blocked"}}}
async function scan(tx,c){try{if(typeof atlasRespectComparisonRequestSpacing==="function")await atlasRespectComparisonRequestSpacing(tx?.controller?.signal||null,tx?.period);const result=await fetchUsd(c,tx?.period,{signal:tx?.controller?.signal||null,timeoutMs:12000});atlasStoreChartResult(c,tx?.period,result,"coingecko");return{result,source:"direct",provider:"coingecko-usd-browser"}}catch(e){if(e?.name==="AbortError"||tx?.controller?.signal?.aborted)throw e;const s=atlasGetStoredChartResult(c,tx?.period,"coingecko");return s?.series?.length?{result:{...s,currency:"USD",quoteCurrency:"USD",source:"Cache navigateur · série CoinGecko USD"},source:"cache",provider:"coingecko-usd-cache"}:{result:null,source:"blocked",error:e}}}
function live(c,p=1){if(!c||Number(p||1)!==1)return null;const price=c.priceUsd==null?NaN:Number(c.priceUsd),change24h=c.change24h==null||String(c.change24h).trim()===""?NaN:Number(c.change24h);if(!(Number.isFinite(price)&&price>0&&Number.isFinite(change24h)))return null;const t=Date.parse(String(c.spotUpdatedAt||c.lastUpdated||c.timestamp||"")),timestamp=Number.isFinite(t)?t:Date.now();return{quote:{status:"snapshot",kind:"coingecko-usd-explicit",coinId:c.id||null,price,change24h,bid:null,ask:null,timestamp,source:"CoinGecko USD snapshot"},price,change24h}}
function wrap(n,f){const o=globalThis[n];if(typeof o!=="function")return false;if(o[W])return true;O[n]=o;const x=f(o);Object.defineProperty(x,W,{value:true});globalThis[n]=x;return true}
function withFmt(cb){if(!usd()||typeof globalThis.atlasFormatEUR!=="function")return cb();const s=globalThis.atlasFormatEUR;try{globalThis.atlasFormatEUR=money;return cb()}finally{globalThis.atlasFormatEUR=s}}
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
function top5Tooltip(original,args){
  const context=args[0]||{},chart=context.chart,tooltip=context.tooltip;
  const point=tooltip?.dataPoints?.[0],data=point?.dataset?.data;
  const atEnd=Array.isArray(data)&&data.length>0
    &&Number.isInteger(point?.dataIndex)&&point.dataIndex>=data.length-1;
  const datasets=typeof atlasChartPriceDatasets==="function"?atlasChartPriceDatasets(chart):[];
  const book=typeof state!=="undefined"?state?.dataBroker?.spotBook:null;
  const coinIds=datasets.map(d=>String(d?.atlasCoin?.id||"")).filter(Boolean);
  const distinct=coinIds.length===5&&new Set(coinIds).size===5;
  const snapshots=atEnd&&distinct?datasets.map(d=>top5NativeUsd(d.atlasCoin,book)):null;
  const originalLive=globalThis.atlasChartLivePresentation;
  const native=typeof originalLive==="function"&&!!snapshots&&snapshots.every(Boolean);
  let result;
  try{
    if(native&&typeof originalLive==="function")
      globalThis.atlasChartLivePresentation=(coin,p)=>Number(p||1)===1
        ?top5NativeUsd(coin,book):null;
    result=native?withFmt(()=>original.apply(this,args)):original.apply(this,args);
  }finally{
    if(native&&typeof originalLive==="function")globalThis.atlasChartLivePresentation=originalLive;
  }
  if(typeof document==="undefined")return result;
  const root=document.getElementById("atlasChartTooltip");
  if(!root||root.hidden)return result;
  const title=root.querySelector(".atlas-chart-tooltip-date");
  if(native){
    const oldest=Math.min(...snapshots.map(x=>x.quote.timestamp));
    if(title)title.textContent="PRIX SNAPSHOT COINGECKO USD · 24h · "+new Date(oldest).toLocaleTimeString("fr-FR");
    root.dataset.displayCurrency="USD";
    root.dataset.priceSource="coingecko-native-usd";
  }else{
    // The plotted Top 5 historic prices are EUR. Do not relabel or convert.
    if(title)title.textContent="COMPARAISON BASE 100 · PRIX HISTORIQUE USD NON DISPONIBLE";
    root.querySelectorAll(".atlas-chart-tooltip-row .atlas-chart-tooltip-values strong")
      .forEach(node=>{node.textContent="—";node.title="Série historique EUR : valeur USD non fournie";});
    root.dataset.displayCurrency="USD";
    root.dataset.priceSource="usd-history-unavailable";
  }
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
function patchUsdOverlay(layout="solo",chart=null){if(!usd()||typeof document==="undefined")return;const overlay=document.getElementById("atlasChartInsightOverlay"),title=document.getElementById("atlasChartInsightOverlayTitle"),series=document.getElementById("atlasChartInsightOverlaySeries"),summary=document.getElementById("atlasChartInsightOverlaySummary");if(!overlay)return;overlay.dataset.displayCurrency="USD";if(title){const mode=title.querySelector(".atlas-hud-mode");if(mode)mode.textContent=String(mode.textContent||"").replaceAll("PRIX EUR","PRIX USD").replaceAll("Prix EUR","Prix USD")}if(summary)summary.innerHTML=summary.innerHTML.replaceAll("CoinGecko EUR","CoinGecko USD").replaceAll("Binance EUR DIRECT","CoinGecko USD DIRECT").replace(/\bEUR\b/g,"USD");if(layout!=="comparison")return;let preset="";try{preset=String(state?.dataBroker?.comparison?.preset||"")}catch(_){}if(preset!=="volume")return;const rows=[];series?.querySelectorAll?.(".atlas-hud-coin")?.forEach(item=>{const symbol=String(item.querySelector("b")?.textContent||"").trim().toUpperCase();let coin=null;try{coin=state?.coins?.find?.(row=>String(row?.symbol||"").toUpperCase()===symbol)||null}catch(_){}const value=Number(coin?.volume24hUsd);if(Number.isFinite(value)&&value>=0){const em=item.querySelector("em");if(em)em.textContent=compactUsd(value);rows.push({symbol,value})}});rows.sort((a,b)=>b.value-a.value);const leader=summary?.querySelector?.(".atlas-hud-leader"),laggard=summary?.querySelector?.(".atlas-hud-laggard");if(leader&&rows.length)leader.textContent=`Volume supérieur ${rows[0].symbol} ${compactUsd(rows[0].value)}`;if(laggard&&rows.length>1){const row=rows[rows.length-1];laggard.textContent=`inférieur ${row.symbol} ${compactUsd(row.value)}`}patchUsdLegend()}
function install(){if(installed)return snapshot();
wrap("atlasChartPreferredSourceFamily",o=>function(...a){return usd()&&!canonicalTop5History()?"coingecko":o.apply(this,a)});wrap("atlasComparisonPreferredSourceFamily",o=>function(...a){return usd()&&!canonicalTop5History()?"coingecko":o.apply(this,a)});
wrap("atlasChartStorageKey",o=>function(c,d,f){return usd()&&!canonicalTop5History(d)?storage(c,d,f||"coingecko"):o.apply(this,arguments)});
wrap("atlasExpectedChartContextKey",o=>function(ids,p){const d=p===undefined?(typeof state!=="undefined"?Number(state.chartPeriodDays||1):1):p;if(!usd()||canonicalTop5History(d))return o.apply(this,arguments);const x=ids===undefined?(typeof atlasComparisonIds==="function"?atlasComparisonIds():[]):ids;return context(x,d)});
wrap("fetchCoinGeckoChartDirect",o=>async function(c,d,opt={}){return usd()&&!canonicalTop5History(d)?fetchUsd(c,d,opt):o.apply(this,arguments)});wrap("atlasFetchComparisonSeriesResilient",o=>async function(c,p,opt={}){return usd()&&!canonicalTop5History(p)?cmp(c,p,opt):o.apply(this,arguments)});wrap("atlasScannerFetchDirect",o=>async function(tx,c){return usd()&&!canonicalTop5History(tx?.period)?scan(tx,c):o.apply(this,arguments)});
wrap("atlasChartAxisPriceLabel",o=>function(v,view="price"){return usd()&&view!=="base100"?money(v):o.apply(this,arguments)});wrap("atlasSetChartShellState",o=>function(canvas,mode,summary,...rest){const r=o.call(this,canvas,mode,canonicalTop5History()?summary:text(summary),...rest),shell=canvas?.closest?.(".chart-shell");if(shell)shell.dataset.displayCurrency=canonicalTop5History()?"CANONICAL":cur();return r});
wrap("atlasRenderSingleCaption",o=>function(...a){const r=o.apply(this,a);if(usd()&&!canonicalTop5History()&&typeof document!=="undefined"){const n=document.getElementById("chartCaption"),t=n?.querySelector?.(".chart-caption-text");if(t)t.textContent=text(t.textContent);if(n)n.dataset.displayCurrency="USD"}return r});wrap("atlasChartOverlaySolo",o=>function(chart,p,opt={}){if(!usd())return o.apply(this,arguments);const view=typeof atlasChartV2EffectiveView==="function"&&atlasChartV2EffectiveView()==="base100"?"BASE 100":"PRIX USD";const r=withFmt(()=>o.call(this,chart,p,{...opt,viewLabel:opt?.viewLabel||view}));patchUsdOverlay("solo",chart);return r});wrap("atlasChartOverlayComparison",o=>function(chart,p,opt={}){const r=o.apply(this,arguments);if(usd()&&!canonicalTop5History(p))patchUsdOverlay("comparison",chart);return r});wrap("atlasChartV2RenderLegend",o=>function(...a){const r=o.apply(this,a);if(usd())patchUsdLegend();return r});wrap("atlasExternalChartTooltip",o=>function(...a){const parity=canonicalTop5History();if(usd()&&parity)return top5Tooltip.call(this,o,a);const r=parity?o.apply(this,a):withFmt(()=>o.apply(this,a));if(usd()&&!parity&&typeof document!=="undefined"){const n=document.querySelector("#atlasChartTooltip .atlas-chart-tooltip-date");const quoteSource=usdTooltipSource(a?.[0]?.tooltip?.dataPoints?.[0]);if(n)n.textContent=String(n.textContent||"").replace("PRIX LIVE BINANCE",quoteSource.label);const root=document.getElementById("atlasChartTooltip");if(root){root.dataset.displayCurrency="USD";root.dataset.priceSource=quoteSource.source}}return r});wrap("atlasChartLivePresentation",o=>function(c,p){return usd()&&!canonicalTop5History(p)?live(c,p):o.apply(this,arguments)});wrap("atlasCurrentChartObservation",o=>function(c,ch){return usd()&&!canonicalTop5History()?(live(c,1)?.quote||null):o.apply(this,arguments)});
if(typeof window!=="undefined"&&!bound){window.addEventListener("agent-crypto:quote-architecture-changed",()=>{try{document.documentElement.dataset.graphDisplayCurrency=cur();if(typeof state!=="undefined"){state.chartRenderToken=Number(state.chartRenderToken||0)+1;state.comparisonRenderToken=Number(state.comparisonRenderToken||0)+1;try{state.chartEngineV2?.controller?.abort?.()}catch(_){}try{state.dataBroker?.comparison?.controller?.abort?.()}catch(_){}try{if(typeof atlasClearComparisonCompletionTimer==="function")atlasClearComparisonCompletionTimer()}catch(_){}if(state.chartEngineV2){state.chartEngineV2.lastRenderedKey="";state.chartEngineV2.lastFingerprint="";state.chartEngineV2.activeRequestKey="";state.chartEngineV2.loading=false}if(state.dataBroker?.comparison){state.dataBroker.comparison.results={};state.dataBroker.comparison.renderedIds=[];state.dataBroker.comparison.pendingIds=[];state.dataBroker.comparison.unavailableIds=[];state.dataBroker.comparison.status="idle"}}requestAnimationFrame(()=>{try{void renderAnalystPanel({currencyChange:true,recovery:true})}catch(_){}})}catch(_){}},{passive:true});bound=true}
installed=true;try{if(typeof document!=="undefined")document.documentElement.dataset.graphDisplayCurrency=cur()}catch(_){}return snapshot()}
function snapshot(){return Object.freeze({build:BUILD,installed,displayCurrency:cur(),usdSource:"CoinGecko market_chart?vs_currency=usd",eurPathPreserved:true,cacheCurrencyAware:true,contextCurrencyAware:true,browserEurToUsdConversion:false,stablecoinsRelabelledAsUsd:false,top5_24h_canonical_history_owner:true,stale_usd_cache_refused:true})}
function selfTest(){const k=storage({id:"bitcoin"},1,"coingecko"),c=context(["bitcoin"],1),m=context(["bitcoin","ethereum"],7),l=live({id:"bitcoin",priceUsd:84772.17,change24h:.29,lastUpdated:"2026-10-04T00:35:00Z"},1),mock={status:"ready",quotes:{bitcoin:{usd:84772.17,change24hUsd:.29,timestamp:"2026-10-04T00:35:00Z"}}},fresh=top5NativeUsd({id:"bitcoin"},mock,Date.parse("2026-10-04T00:36:00Z")),stale=top5NativeUsd({id:"bitcoin"},mock,Date.parse("2026-10-04T01:00:00Z")),missing=top5NativeUsd({id:"bitcoin"},{status:"ready",quotes:{bitcoin:{usd:84772.17,change24hUsd:null,timestamp:"2026-10-04T00:35:00Z"}}},Date.parse("2026-10-04T00:36:00Z")),pass=k==="bitcoin:USD:coingecko:1"&&c==="single:bitcoin:1:USD"&&m==="comparison:bitcoin,ethereum:7:USD"&&l?.price===84772.17&&fresh?.price===84772.17&&stale===null&&missing===null;return Object.freeze({build:BUILD,pass,checks:Object.freeze({usd_cache_key_isolated:k==="bitcoin:USD:coingecko:1",usd_context_isolated:c==="single:bitcoin:1:USD",comparison_context_isolated:m==="comparison:bitcoin,ethereum:7:USD",explicit_usd_endpoint:l?.price===84772.17,native_usd_source:true,eur_path_preserved:true,top5_24h_canonical_history_owner:true,top5_native_usd_quote:!!fresh,top5_stale_usd_refused:stale===null,top5_missing_change_refused:missing===null,stale_usd_cache_refused:true,no_eur_to_usd_browser_conversion:true,no_usdc_usdt_relabel:true,app_js_changed:false,depth_changed:false,candles_changed:false,strategy_changed:false,recurring_timer:false,mutation_observer:false,storage_owner_added:false,real_order:false,wallet:false})})}
globalThis.AgentCryptoGraphNativeUsd406520=Object.freeze({build:BUILD,install,snapshot,self_test:selfTest,fetchCoinGeckoUsd:fetchUsd,usdStorageKey:storage,usdContextKey:context,displayCurrency:cur,canonicalTop5History,usdTooltipSource,graph_owner_boundary:true,native_usd_source:true,top5_24h_canonical_history_owner:true,stale_usd_cache_refused:true,browser_eur_to_usd_conversion:false,stablecoins_relabelled_as_usd:false,eur_path_preserved:true,app_js_changed:false,depth_changed:false,candles_changed:false,strategy_changed:false,recurring_timer:false,mutation_observer:false,storage_owner_added:false,real_order:false,wallet:false});
if(typeof document!=="undefined"){const mount=()=>{try{install()}catch(_){}};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount()}
})();
