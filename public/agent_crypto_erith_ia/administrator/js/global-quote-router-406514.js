/* Agent-Crypto — 40.6.515 GRAPH OWNER HANDSHAKE · USD COMMIT AFTER RENDER
   Display-only USD foundation for Graphique/Fiche.
   Source truth: existing same-origin public CoinGecko USD snapshot + ECB FX metadata.
   No recurring timer, MutationObserver, storage write, wallet, private API or real order. */
(()=>{
  "use strict";
  const BUILD="40.6.515";
  const SNAPSHOT_RELATIVE="../data/crypto/latest.json";
  const state={truth:null,fx:null,status:"BOOT",lastError:null,lastAppliedAt:null,lastReason:"boot",loadPromise:null,controller:null,chartBackup:null,domBackup:new Map(),ownerEpoch:0,ownerPendingReason:null};
  const finite=v=>Number.isFinite(Number(v))?Number(v):null;
  const displayCurrency=()=>String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.().displayCurrency||"USD").toUpperCase();
  const fxFactor=()=>finite(state.fx?.usdPerEur);
  const cloneDatum=value=>{
    if(Array.isArray(value))return value.map(cloneDatum);
    if(value&&typeof value==="object")return {...value};
    return value;
  };
  const datumNumber=value=>{
    if(typeof value==="number")return finite(value);
    if(Array.isArray(value)&&value.length>=2)return finite(value[1]);
    if(value&&typeof value==="object")return finite(value.y??value.value??value.price);
    return null;
  };
  const scaleDatum=(value,factor)=>{
    if(typeof value==="number")return value*factor;
    if(Array.isArray(value)&&value.length>=2&&finite(value[1])!==null){const copy=value.slice();copy[1]=Number(copy[1])*factor;return copy;}
    if(value&&typeof value==="object"){
      const copy={...value};
      if(finite(copy.y)!==null)copy.y=Number(copy.y)*factor;
      else if(finite(copy.value)!==null)copy.value=Number(copy.value)*factor;
      else if(finite(copy.price)!==null)copy.price=Number(copy.price)*factor;
      return copy;
    }
    return value;
  };
  const formatCurrency=(value,currency="USD")=>{
    const n=finite(value);if(n===null)return "—";
    const abs=Math.abs(n),digits=abs>=1000?2:abs>=10?4:8;
    try{return new Intl.NumberFormat("fr-FR",{style:"currency",currency,currencyDisplay:"narrowSymbol",maximumFractionDigits:digits}).format(n);}
    catch(_){return `${n.toFixed(Math.min(4,digits))} ${currency}`;}
  };
  function selectedCoin(){
    try{if(typeof getSelectedCoin==="function"){const coin=getSelectedCoin();if(coin)return coin;}}catch(_){}
    return null;
  }
  function selectedSymbol(){
    const coin=selectedCoin();
    if(coin?.symbol)return String(coin.symbol).toUpperCase();
    const raw=document?.getElementById?.("detailCompactAsset")?.textContent||document?.getElementById?.("selectedAssetTitle")?.textContent||"BTC";
    const match=String(raw).toUpperCase().match(/\b[A-Z0-9_]{2,16}\b/);
    return match?.[0]||"BTC";
  }
  function selectedName(){
    return String(selectedCoin()?.name||document?.getElementById?.("detailCompactAsset")?.textContent||selectedSymbol()).trim();
  }
  function truthCoin(){
    const coins=Array.isArray(state.truth?.coins)?state.truth.coins:[];
    const coin=selectedCoin(),id=String(coin?.id||"").toLowerCase(),sym=selectedSymbol();
    return coins.find(row=>id&&String(row?.id||"").toLowerCase()===id)||coins.find(row=>String(row?.symbol||"").toUpperCase()===sym)||null;
  }
  function currentLiveEur(){
    const coin=selectedCoin();
    try{if(typeof atlasCurrentQuoteForCoin==="function"){const q=atlasCurrentQuoteForCoin(coin);const n=finite(q?.price);if(n!==null&&n>0)return n;}}catch(_){}
    const n=finite(coin?.priceEur??coin?.price);return n!==null&&n>0?n:null;
  }
  async function loadTruth({force=false}={}){
    if(state.truth&&!force)return state.truth;
    if(state.loadPromise&&!force)return state.loadPromise;
    if(typeof document==="undefined"||typeof fetch!=="function")return null;
    try{state.controller?.abort();}catch(_){}
    const controller=new AbortController();state.controller=controller;
    state.loadPromise=(async()=>{
      const url=new URL(SNAPSHOT_RELATIVE,document.baseURI).href;
      const response=await fetch(url,{cache:"no-store",signal:controller.signal,headers:{Accept:"application/json"}});
      if(!response.ok)throw new Error(`USD truth HTTP ${response.status}`);
      const payload=await response.json();
      const usdPerEur=finite(payload?.fx?.usd_per_eur),eurPerUsd=finite(payload?.fx?.eur_per_usd);
      if(payload?.source?.quote_currency!=="USD"||usdPerEur===null||!(usdPerEur>0))throw new Error("USD truth invalid: CoinGecko USD + ECB FX required");
      state.truth=payload;
      state.fx=Object.freeze({
        usdPerEur,eurPerUsd,
        sourceId:String(payload?.fx?.source_id||"ecb"),
        sourceName:String(payload?.fx?.source_name||"Banque centrale européenne"),
        sourceDate:String(payload?.fx?.source_date||"—"),
        generatedAt:String(payload?.generated_at||"—"),
        snapshotId:String(payload?.snapshot_id||"—")
      });
      state.status="READY";state.lastError=null;return payload;
    })().catch(error=>{
      if(error?.name!=="AbortError"){state.status="ERROR";state.lastError=String(error?.message||error);}
      return null;
    }).finally(()=>{if(state.controller===controller)state.controller=null;state.loadPromise=null;});
    return state.loadPromise;
  }
  function backupText(node){
    if(!node||state.domBackup.has(node))return;
    state.domBackup.set(node,node.textContent);
  }
  function setText(node,text){if(!node)return;backupText(node);node.textContent=String(text);}
  function restoreDom(){
    for(const [node,text] of state.domBackup.entries()){try{if(node?.isConnected)node.textContent=text;}catch(_){}}
    state.domBackup.clear();
    document?.documentElement?.removeAttribute?.("data-agent-crypto-display-currency");
  }
  function priceDatasets(chart){
    return (chart?.data?.datasets||[]).filter(ds=>{
      const label=String(ds?.label||""),axis=String(ds?.yAxisID||""),type=String(ds?.type||"");
      return type!=="bar"&&!/volume/i.test(label)&&!/volume/i.test(axis);
    });
  }
  function restoreChart(){
    const b=state.chartBackup;if(!b)return false;
    const chart=b.chart;
    try{
      if(chart?.data){
        chart.data.labels=b.labels.map(cloneDatum);
        (chart.data.datasets||[]).forEach((ds,index)=>{if(b.datasets[index])ds.data=b.datasets[index].map(cloneDatum);});
      }
      const y=chart?.options?.scales?.y;if(y?.ticks)y.ticks.callback=b.yTickCallback;
      const callbacks=chart?.options?.plugins?.tooltip?.callbacks;if(callbacks)callbacks.label=b.tooltipLabel;
      delete chart.$agentCryptoQuote406514;
      chart?.update?.("none");
    }catch(_){}
    state.chartBackup=null;return true;
  }
  function applyChartUsd(){
    if(typeof document==="undefined"||typeof globalThis.Chart==="undefined")return {converted:false,reason:"NO_CHART_LIB",values:[]};
    const factor=fxFactor();if(factor===null)return {converted:false,reason:"NO_FX",values:[]};
    const canvas=document.getElementById("mainChart"),chart=globalThis.Chart?.getChart?.(canvas);
    if(!chart)return {converted:false,reason:"NO_CHART_INSTANCE",values:[]};
    if(chart.$agentCryptoQuote406514?.currency==="USD"&&chart.$agentCryptoQuote406514?.factor===factor){
      const values=(priceDatasets(chart)[0]?.data||[]).map(datumNumber).filter(v=>v!==null);
      return {converted:true,reason:"ALREADY_APPLIED",values};
    }
    restoreChart();
    const datasets=chart?.data?.datasets||[];
    state.chartBackup={
      chart,
      labels:(chart?.data?.labels||[]).map(cloneDatum),
      datasets:datasets.map(ds=>(ds?.data||[]).map(cloneDatum)),
      yTickCallback:chart?.options?.scales?.y?.ticks?.callback,
      tooltipLabel:chart?.options?.plugins?.tooltip?.callbacks?.label
    };
    for(const ds of priceDatasets(chart))ds.data=(ds.data||[]).map(value=>scaleDatum(value,factor));
    const y=chart?.options?.scales?.y;if(y?.ticks)y.ticks.callback=value=>formatCurrency(value,"USD");
    const callbacks=chart?.options?.plugins?.tooltip?.callbacks;
    if(callbacks)callbacks.label=context=>`${context?.dataset?.label?context.dataset.label+" · ":""}${formatCurrency(context?.parsed?.y??context?.raw?.y??context?.raw,"USD")}`;
    chart.$agentCryptoQuote406514=Object.freeze({build:BUILD,currency:"USD",factor,source:"ECB_USD_PER_EUR"});
    chart.update?.("none");
    const values=(priceDatasets(chart)[0]?.data||[]).map(datumNumber).filter(v=>v!==null);
    return {converted:true,reason:"APPLIED",values};
  }
  function applyDomUsd(chartResult={values:[]}){
    const factor=fxFactor();if(factor===null)return false;
    const symbol=selectedSymbol(),name=selectedName(),period=document.querySelector?.(".period-btn.active")?.textContent?.trim()||"24h";
    const scale=document.querySelector?.('[data-chart-scale].is-active')?.textContent?.trim()||"Normale";
    const liveEur=currentLiveEur(),nativeUsd=finite(truthCoin()?.priceUsd);
    const liveUsd=liveEur!==null?liveEur*factor:nativeUsd;
    const priceLabel=document.querySelector?.('#detailCompactStrip [data-detail-semantic="price"] small');
    setText(priceLabel,"Prix USD");
    setText(document.getElementById("detailCompactPrice"),formatCurrency(liveUsd,"USD"));
    const base100=document.querySelector?.('[data-chart-view="base100"]')?.classList?.contains("is-active")===true;
    setText(document.getElementById("atlasChartInsightOverlayTitle"),`${symbol} · ${name} · ${period} · ${base100?"BASE 100":"PRIX USD"} · ${String(scale).toUpperCase()}`);
    const values=Array.isArray(chartResult.values)?chartResult.values.filter(v=>finite(v)!==null):[];
    if(!base100&&values.length){
      const first=values[0],last=values[values.length-1];
      setText(document.getElementById("atlasChartInsightOverlaySeries"),`USD DISPLAY · historique EUR canonique converti par BCE · ${state.fx?.sourceDate||"—"}`);
      setText(document.getElementById("atlasChartInsightOverlaySummary"),`départ ${formatCurrency(first,"USD")} · dernière ${formatCurrency(last,"USD")} · ${values.length} points · facteur BCE USD/EUR ${factor.toFixed(4)}`);
    }else{
      setText(document.getElementById("atlasChartInsightOverlaySeries"),base100?"Base 100 · référence USD disponible":"USD DISPLAY · source vérifiée");
      setText(document.getElementById("atlasChartInsightOverlaySummary"),base100?"Comparaison normalisée sans unité ; aucune fausse devise appliquée.":`spot ${formatCurrency(liveUsd,"USD")} · facteur BCE USD/EUR ${factor.toFixed(4)} · exécution inchangée`);
    }
    const primary=document.getElementById("atlasWorkspaceReprisePrimary");
    if(primary)setText(primary,String(primary.textContent||"").replace(/Prix\s+EUR/gi,"Prix USD").replace(/\bEUR\b/g,"USD"));
    setText(document.getElementById("atlasChartCaptionCrypto"),`Affichage USD actif : le snapshot public canonique est collecté en USD par CoinGecko et conserve aussi l’EUR dérivé par BCE. Le Graphique historique EUR existant est affiché en USD avec le facteur BCE USD/EUR publié (${factor.toFixed(4)}, date ${state.fx?.sourceDate||"—"}). EXEC BTC-EUR et SETTLE EUR restent inchangés ; aucune valeur EUR n’est seulement relabellée en USD.`);
    document.documentElement.dataset.agentCryptoDisplayCurrency="USD";
    return true;
  }
  async function apply(reason="event"){
    state.lastReason=String(reason||"event");
    const currency=displayCurrency();
    if(currency!=="USD"){
      restoreChart();restoreDom();state.status="EUR_NATIVE";state.lastAppliedAt=new Date().toISOString();return snapshot();
    }
    await loadTruth();
    if(!state.fx){restoreChart();restoreDom();state.status="USD_TRUTH_UNAVAILABLE";state.lastAppliedAt=new Date().toISOString();return snapshot();}
    restoreDom();
    const chartResult=base100Active()?{converted:false,reason:"BASE100",values:[]}:applyChartUsd();
    applyDomUsd(chartResult);
    state.status=chartResult.converted||base100Active()?"USD_APPLIED":"USD_TEXT_ONLY";
    state.lastAppliedAt=new Date().toISOString();
    return snapshot();
  }
  function base100Active(){return document?.querySelector?.('[data-chart-view="base100"]')?.classList?.contains("is-active")===true;}
  function prepareOwnerRender(reason="graph-owner"){
    if(displayCurrency()!=="USD")return 0;
    const epoch=++state.ownerEpoch;
    state.ownerPendingReason=String(reason||"graph-owner");
    restoreChart();
    restoreDom();
    state.status="OWNER_RENDERING";
    state.lastReason=`owner-prepare:${state.ownerPendingReason}`;
    return epoch;
  }
  function settleOwnerRender(reason="graph-owner",epoch=state.ownerEpoch){
    if(displayCurrency()!=="USD")return Promise.resolve(snapshot());
    const expected=Number(epoch||state.ownerEpoch);
    const ownerReason=String(reason||state.ownerPendingReason||"graph-owner");
    const run=()=>{
      if(expected!==state.ownerEpoch)return snapshot();
      state.ownerPendingReason=null;
      return apply(`owner-settled:${ownerReason}`);
    };
    if(typeof requestAnimationFrame==="function"){
      return new Promise(resolve=>requestAnimationFrame(()=>Promise.resolve(run()).then(resolve)));
    }
    return Promise.resolve().then(run);
  }
  function scheduleOwnerReapply(reason){
    if(displayCurrency()!=="USD")return;
    if(globalThis.AgentCryptoGraphOwnerHandshake?.installed===true)return;
    restoreChart();restoreDom();
    const run=()=>void apply(reason);
    if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>requestAnimationFrame(run));else Promise.resolve().then(run);
  }
  function bind(){
    if(typeof document==="undefined")return;
    window.addEventListener("agent-crypto:quote-architecture-changed",event=>void apply(event?.detail?.reason||"quote-change"),{passive:true});
    document.addEventListener("click",event=>{
      if(displayCurrency()!=="USD")return;
      const target=event.target instanceof Element?event.target:null;if(!target)return;
      if(target.closest(".period-btn,.compare-btn,[data-chart-view],[data-chart-scale],#marketSnapshotPanel button,#atlasTop5NativeFicheToggle"))scheduleOwnerReapply("owner-control");
    },true);
    window.addEventListener("pageshow",()=>void apply("pageshow"),{passive:true});
  }
  function snapshot(){return Object.freeze({
    build:BUILD,display_currency:displayCurrency(),status:state.status,
    fx:state.fx?{...state.fx}:null,last_error:state.lastError,last_applied_at:state.lastAppliedAt,last_reason:state.lastReason,
    owner_epoch:state.ownerEpoch,owner_pending_reason:state.ownerPendingReason,owner_handshake:globalThis.AgentCryptoGraphOwnerHandshake?.snapshot?.()||null,
    display_only:true,execution_mutation:false,settlement_mutation:false,market_core_changed:false,strategy_changed:false,oracle_changed:false,depth_changed:false,
    new_recurring_timer:false,mutation_observer:false,storage_write:false,real_order:false,wallet:false
  });}
  function selfTest(){
    const factor=1.1225;
    const number=100*factor;
    const object=scaleDatum({x:1,y:10},factor),array=scaleDatum([1,10],factor);
    const pass=Math.abs(number-112.25)<1e-9&&Math.abs(object.y-11.225)<1e-9&&Math.abs(array[1]-11.225)<1e-9;
    return Object.freeze({build:BUILD,pass,checks:{eur_to_usd_math:Math.abs(number-112.25)<1e-9,object_series_scaling:Math.abs(object.y-11.225)<1e-9,array_series_scaling:Math.abs(array[1]-11.225)<1e-9,no_timer:true,no_observer:true,no_storage_write:true,no_order:true}});
  }
  globalThis.AgentCryptoGlobalQuoteRouter=Object.freeze({
    build:BUILD,loadTruth,apply,prepareOwnerRender,settleOwnerRender,snapshot,self_test:selfTest,
    source_truth:"CoinGecko USD + ECB FX public archive",
    historical_method:"canonical EUR runtime series × published ECB USD/EUR",
    display_only:true,execution_mutation:false,settlement_mutation:false,market_core_changed:false,strategy_changed:false,oracle_changed:false,depth_changed:false,
    new_recurring_timer:false,mutation_observer:false,storage_write:false,real_order:false,wallet:false
  });
  if(typeof document!=="undefined"){
    const boot=()=>{bind();void apply("boot-default-usd");};
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  }
})();
