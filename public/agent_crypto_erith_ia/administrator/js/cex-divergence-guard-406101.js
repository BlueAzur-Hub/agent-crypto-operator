/* Agent-Crypto @erith.IA — 40.6.101
   CEX DIVERGENCE FAIL-CLOSED · SOURCE INTELLIGENCE READ-SIDE QUALITY GATE
   Wraps the existing 40.6.98 freshness-guarded Source Truth API only after that
   guard is active. Fresh CEX disagreement above the existing WATCH threshold
   downgrades Source Intelligence to PARTIAL. Binance remains canonical primary.
   No fetch owner, timer, observer, storage write, wallet, order or trading path. */
(()=>{
  "use strict";

  const BUILD="40.6.101";
  const MARKER="__cex_divergence_guard_406101";
  const WATCH_LIMIT_PCT=0.75;
  let sourceApi=null,guardApi=null;

  const num=value=>(value===null||value===undefined||value==="")?null:(Number.isFinite(Number(value))?Number(value):null);
  const rowsFrom=truth=>Array.isArray(truth?.assets)?truth.assets:[];

  function qualityFromTruth(truth){
    const rows=rowsFrom(truth);
    const divergent=[],watch=[],coherent=[],insufficient=[],spreads=[];
    for(const row of rows){
      const verdict=String(row?.consensus?.verdict||"insufficient").toLowerCase();
      const spread=num(row?.consensus?.spread_pct);
      const asset=String(row?.asset||"?").toUpperCase();
      if(spread!==null)spreads.push(spread);
      if(verdict==="divergent")divergent.push(asset);
      else if(verdict==="watch")watch.push(asset);
      else if(verdict==="coherent")coherent.push(asset);
      else insufficient.push(asset);
    }
    return Object.freeze({
      mode:"FAIL_CLOSED_FRESH_CEX_DIVERGENCE",
      watch_limit_pct:WATCH_LIMIT_PCT,
      total_assets:rows.length,
      coherent_assets:Object.freeze(coherent),
      watch_assets:Object.freeze(watch),
      divergent_assets:Object.freeze(divergent),
      insufficient_assets:Object.freeze(insufficient),
      divergent_count:divergent.length,
      watch_count:watch.length,
      max_fresh_spread_pct:spreads.length?Math.max(...spreads):null,
      ready:divergent.length===0
    });
  }

  function guardIntelligence(raw,truth){
    if(!raw)return raw;
    const quality=qualityFromTruth(truth);
    const cex=Object.freeze({
      ...(raw.cex||{}),
      max_spread_pct:quality.max_fresh_spread_pct,
      coherent_assets:quality.coherent_assets.length,
      watch_assets:quality.watch_count,
      divergent_assets:quality.divergent_count,
      divergent_asset_symbols:quality.divergent_assets,
      quality_gate:quality.mode,
      quality_gate_ready:quality.ready
    });
    const rules=Object.freeze({
      ...(raw.rules||{}),
      cex_divergence_fail_closed:true,
      cex_divergence_threshold_pct:WATCH_LIMIT_PCT,
      cex_primary_remains_binance:true
    });
    return Object.freeze({
      ...raw,
      state:quality.ready?raw.state:"partial",
      cex,
      rules,
      cex_quality_gate:quality
    });
  }

  function sourceGridArticle(label){
    const grid=document.getElementById("privateSourceIntelligenceGrid");
    if(!grid)return null;
    return Array.from(grid.querySelectorAll(":scope > article")).find(article=>String(article.querySelector("span")?.textContent||"").trim()===label)||null;
  }

  function applyUi(){
    if(!guardApi)return null;
    const truth=guardApi.snapshot?.()||null;
    const intel=guardApi.sourceIntelligence?.()||null;
    const quality=intel?.cex_quality_gate||qualityFromTruth(truth);
    document.documentElement.dataset.cexDivergenceGuard=quality.ready?"ready":"divergent";
    document.documentElement.dataset.cexDivergenceCount=String(quality.divergent_count||0);

    if(quality.ready)return quality;

    const symbols=quality.divergent_assets.join(" · ")||"CEX";
    const cexArticle=sourceGridArticle("CEX");
    if(cexArticle){
      const b=cexArticle.querySelector("b"),small=cexArticle.querySelector("small");
      if(b)b.textContent=`${Number(intel?.cex?.comparable_assets||0)}/${Number(intel?.cex?.total_assets||quality.total_assets||0)} · DIVERGENCE`;
      if(small)small.textContent=`${symbols} · écart frais max ${quality.max_fresh_spread_pct===null?"—":quality.max_fresh_spread_pct.toFixed(3)+" %"}`;
    }

    const badge=document.getElementById("privateSourceIntelligenceStatus");
    if(badge){badge.className="pill warn";badge.textContent="CEX DIVERGENT";}
    const detail=document.getElementById("privateSourceIntelligenceDetail");
    if(detail)detail.textContent=`Source Intelligence PARTIEL · divergence CEX fraîche : ${symbols} · Binance reste primaire · aucune promotion de prix`;
    const backendBadge=document.getElementById("privateBackendStatus");
    if(backendBadge){backendBadge.className="pill warn";backendBadge.textContent="CEX DIVERGENT";}
    return quality;
  }

  function install(){
    const api=globalThis.ErithPrivateBackendSources;
    if(!api)return false;
    if(api[MARKER]===true){guardApi=api;return true;}
    // 40.6.101 must compose after the 40.6.98 per-provider freshness gate.
    if(api.__freshness_guard_406098!==true)return false;

    sourceApi=api;
    const wrapper={...api};
    wrapper.snapshot=()=>sourceApi.snapshot?.()||null;
    wrapper.sourceIntelligence=()=>guardIntelligence(sourceApi.sourceIntelligence?.()||null,wrapper.snapshot());
    wrapper.refresh=async(...args)=>{const result=await sourceApi.refresh?.(...args);queueMicrotask(applyUi);return result;};
    wrapper.refreshAll=async(...args)=>{const result=await sourceApi.refreshAll?.(...args);queueMicrotask(applyUi);return result;};
    wrapper.autoRefresh=async(...args)=>{const result=await sourceApi.autoRefresh?.(...args);queueMicrotask(applyUi);return result;};
    wrapper[MARKER]=true;
    wrapper.cex_divergence_guard_build=BUILD;
    wrapper.cex_divergence_fail_closed=true;
    wrapper.cex_divergence_threshold_pct=WATCH_LIMIT_PCT;
    wrapper.source_owner_replaced=false;
    wrapper.new_fetch_owner=false;
    wrapper.new_timer=false;
    wrapper.new_observer=false;
    wrapper.new_storage_owner=false;
    wrapper.trade_endpoint=false;

    guardApi=Object.freeze(wrapper);
    globalThis.__ERITH_PRIVATE_BACKEND_SOURCES_FRESHNESS_406101__=sourceApi;
    globalThis.ErithPrivateBackendSources=guardApi;
    applyUi();
    return true;
  }

  const installAfterCurrentTurn=()=>queueMicrotask(()=>{try{install();applyUi();}catch(_){}});
  installAfterCurrentTurn();
  window.addEventListener("erith:private-source-runtime-loaded",installAfterCurrentTurn,{passive:true});
  document.addEventListener("erith:source-intelligence",installAfterCurrentTurn,{passive:true});
  document.addEventListener("agentcrypto:current-finalized",installAfterCurrentTurn,{passive:true});
  window.addEventListener("pageshow",installAfterCurrentTurn,{passive:true});

  globalThis.AgentCryptoCexDivergenceGuard=Object.freeze({
    build:BUILD,
    install,
    applyUi,
    qualityFromTruth,
    guardIntelligence,
    threshold_pct:WATCH_LIMIT_PCT,
    requires_freshness_guard_406098:true,
    fail_closed:true,
    canonical_primary:"binance",
    source_owner_added:false,
    recurring_timer:false,
    observer:false,
    storage_write:false,
    trading:false
  });
})();
