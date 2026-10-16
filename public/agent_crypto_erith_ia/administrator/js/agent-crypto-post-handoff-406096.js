/* Agent-Crypto @erith.IA — post-handoff bounded stabilization
   40.6.96: Strategy A Paper V2 self-proof runs once automatically after page load.
   40.6.97: existing retrospective-validation.js is activated after its dependencies exist.
   40.6.98: Source Truth/Source Intelligence gains a read-side per-provider freshness gate.
   40.6.98 hotfix: retrospective reader can mount directly in Decision Board without legacy anchors.
   40.6.98 hotfix: freshness UI reflects current CEX ages and requests one bounded recovery refresh when stale.
   No trading, wallet, private API, recurring timer, MutationObserver, or storage owner. */
(()=>{
  "use strict";

  const PATCH="40.6.98";
  const buildFromPath=()=>String(location.pathname||"").match(/(?:^|\/)index-(\d+\.\d+\.\d+)\.html$/i)?.[1]||"";
  const metaBuild=()=>String(document.querySelector('meta[name="administrator-build"]')?.content||"").trim();
  const BUILD=String(globalThis.ErithVersionTruth?.build||buildFromPath()||metaBuild()||"0.0.0").trim();
  const parts=value=>String(value||"").split(".").map(x=>Number.parseInt(x,10)||0);
  const atLeast=target=>{const A=parts(BUILD),B=parts(target),n=Math.max(A.length,B.length);for(let i=0;i<n;i+=1){const d=(A[i]||0)-(B[i]||0);if(d)return d>0;}return true;};
  const onReady=fn=>{
    const run=()=>{try{requestAnimationFrame(()=>requestAnimationFrame(fn));}catch(_){queueMicrotask(fn);}};
    if(document.readyState==="complete")run();
    else window.addEventListener("load",run,{once:true});
  };

  let strategyReceipt=null;
  function runStrategyProofOnce(){
    if(strategyReceipt)return strategyReceipt;
    const api=globalThis.AgentCryptoStrategyAPaperAfterCostAcceptance;
    if(!api||typeof api.run!=="function")return null;
    try{
      const receipt=api.run();
      strategyReceipt=receipt||{pass:false,reason:"EMPTY_RECEIPT"};
      document.documentElement.dataset.strategyAPaperAutoProof=strategyReceipt?.pass===true?"pass":"fail";
      try{document.dispatchEvent(new CustomEvent("agentcrypto:strategy-a-paper-proof-auto",{detail:strategyReceipt}));}catch(_){}
      return strategyReceipt;
    }catch(error){
      strategyReceipt={pass:false,reason:"AUTO_PROOF_EXCEPTION",error:String(error?.message||error)};
      document.documentElement.dataset.strategyAPaperAutoProof="fail";
      return strategyReceipt;
    }
  }

  let retrospectiveRenderFrame=0;
  let retrospectiveLastReason="boot";

  function ensureRetrospectiveStandaloneHost(){
    let root=document.getElementById("decisionRetrospective");
    if(root)return root;
    const board=document.getElementById("decision-board");
    if(!board)return null;

    root=document.createElement("div");
    root.id="decisionRetrospective";
    root.className="decision-memory-v2";
    root.dataset.fallbackMount="true";
    root.setAttribute("aria-label","Decision Board 39.6.0 · Validation rétrospective en lecture seule");
    root.innerHTML=`
      <article><span>Validation rétrospective</span><b id="retroStatus">En attente</b><small id="retroStatusDetail">Le lecteur attend un CURRENT vérifié suivi d’un snapshot marché canonique.</small></article>
      <article><span>CURRENT évaluables</span><b id="retroCount">0 / 0</b><small id="retroCountDetail">Seuls les CURRENT vérifiés avec payload détaillé sont comparables.</small></article>
      <article><span>Dernier CURRENT</span><b id="retroCurrent">—</b><small id="retroCurrentDetail">Analyse figée et jamais réécrite.</small></article>
      <article><span>Premier marché postérieur</span><b id="retroFirst">—</b><small id="retroFirstDetail">L’observation doit être strictement postérieure à la fermeture analytique.</small></article>
      <article><span>TOP5 observé après CURRENT</span><b id="retroTop5">—</b><small id="retroTop5Detail">Rendement EUR observé depuis les prix figés du CURRENT.</small></article>
      <article><span>Largeur post-CURRENT</span><b id="retroBreadth">—</b><small id="retroBreadthDetail">Description du mouvement, pas validation d’une prévision.</small></article>
      <article class="decision-memory-v2-action"><span>Contrat</span><b>OBSERVATION ≠ PRÉDICTION</b><small id="retroContract">Aucun score de réussite, aucune réécriture mémoire, aucun lancement Atlas.</small></article>`;
    board.appendChild(root);
    document.documentElement.dataset.retrospectiveValidation="host-mounted";
    return root;
  }

  function renderRetrospectiveBounded(){
    try{globalThis.atlasDecisionBoardDualMemory?.render?.();}catch(_){}
    const api=globalThis.atlasRetrospectiveValidation;
    let anchor=document.getElementById("decisionDualMemory395")||document.getElementById("decisionMemoryV2");
    let root=document.getElementById("decisionRetrospective");

    if(!root&&!anchor)root=ensureRetrospectiveStandaloneHost();

    if(api&&typeof api.render==="function"&&(anchor||root)){
      try{
        api.render();
        document.documentElement.dataset.retrospectiveValidation="active";
        document.documentElement.dataset.retrospectiveValidationReason=retrospectiveLastReason;
        return true;
      }catch(error){
        document.documentElement.dataset.retrospectiveValidation="render-error";
        document.documentElement.dataset.retrospectiveValidationError=String(error?.message||error).slice(0,180);
        return false;
      }
    }

    if(retrospectiveRenderFrame>=180){
      document.documentElement.dataset.retrospectiveValidation=
        document.getElementById("decision-board")?"waiting-reader":"waiting-decision-board";
      return false;
    }
    retrospectiveRenderFrame+=1;
    try{requestAnimationFrame(renderRetrospectiveBounded);}
    catch(_){queueMicrotask(renderRetrospectiveBounded);}
    return false;
  }

  function scheduleRetrospectiveRender(reason="runtime"){
    retrospectiveLastReason=String(reason||"runtime");
    retrospectiveRenderFrame=0;
    try{requestAnimationFrame(()=>requestAnimationFrame(renderRetrospectiveBounded));}
    catch(_){queueMicrotask(renderRetrospectiveBounded);}
  }

  function activateRetrospective(){
    retrospectiveRenderFrame=0;
    if(globalThis.atlasRetrospectiveValidation){
      scheduleRetrospectiveRender("api-present");
      return true;
    }
    const existing=document.querySelector('script[data-retrospective-activation="true"]');
    if(existing){
      scheduleRetrospectiveRender("script-present");
      return true;
    }
    const script=document.createElement("script");
    script.src=`./js/retrospective-validation.js?v=administrator-build-${encodeURIComponent(BUILD)}`;
    script.async=false;
    script.dataset.retrospectiveActivation="true";
    script.addEventListener("load",()=>scheduleRetrospectiveRender("reader-loaded"),{once:true});
    script.addEventListener("error",()=>{document.documentElement.dataset.retrospectiveValidation="load-error";},{once:true});
    document.head.appendChild(script);
    return true;
  }

  function bindRetrospectiveMountTriggers(){
    if(document.documentElement.dataset.retrospectiveMountTriggers==="1")return;
    document.documentElement.dataset.retrospectiveMountTriggers="1";

    document.addEventListener("click",event=>{
      const target=event.target instanceof Element?event.target:null;
      if(!target)return;
      const decisionIntent=target.closest(
        '[data-admin-cluster-target="decision"],a[href="#decision-board"],[data-atlas-essential-target="decision"],#decision-board'
      );
      if(decisionIntent||document.getElementById("decision-board")){
        scheduleRetrospectiveRender(decisionIntent?"decision-intent":"document-interaction");
      }
    },true);

    window.addEventListener("hashchange",()=>{
      if(String(location.hash||"")==="#decision-board")scheduleRetrospectiveRender("hash-decision");
    },{passive:true});

    window.addEventListener("pageshow",()=>scheduleRetrospectiveRender("pageshow"),{passive:true});
    document.addEventListener("visibilitychange",()=>{
      if(document.visibilityState==="visible")scheduleRetrospectiveRender("visible");
    },{passive:true});

    document.addEventListener("agentcrypto:current-finalized",()=>scheduleRetrospectiveRender("current-finalized"),{passive:true});
    window.addEventListener("erith:system-hydrated",()=>scheduleRetrospectiveRender("system-hydrated"),{passive:true});
  }

  const observedMs=value=>{
    if(value===null||value===undefined||value==="")return null;
    const numeric=Number(value);
    if(Number.isFinite(numeric)&&numeric>0)return numeric;
    const parsed=Date.parse(String(value));
    return Number.isFinite(parsed)?parsed:null;
  };
  const ageSeconds=(value,now=Date.now())=>{const ms=observedMs(value);return ms===null?null:Math.max(0,Math.round((now-ms)/1000));};
  const numeric=value=>(value===null||value===undefined||value==="")?null:(Number.isFinite(Number(value))?Number(value):null);
  const consensus=values=>{
    const vals=values.map(numeric).filter(v=>v!==null&&v>0);
    if(vals.length<2)return {providers:vals.length,spread_pct:null,verdict:"insufficient"};
    const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
    const spread=mean?((Math.max(...vals)-Math.min(...vals))/mean*100):null;
    const verdict=spread!==null&&spread<=0.25?"coherent":spread!==null&&spread<=0.75?"watch":"divergent";
    return {providers:vals.length,spread_pct:spread,verdict};
  };
  const freshnessText=seconds=>{
    const n=numeric(seconds);
    if(n===null)return "—";
    if(n<60)return `${Math.round(n)}s`;
    if(n<3600)return `${Math.round(n/60)} min`;
    return `${(n/3600).toFixed(1)} h`;
  };

  function freshnessLimitSeconds(api){
    try{
      const ms=Number(api?.automationSnapshot?.()?.min_interval_ms);
      if(Number.isFinite(ms)&&ms>0)return Math.max(120,Math.ceil(ms/1000)+60);
    }catch(_){}
    return 300;
  }

  function guardTruth(raw,api){
    if(!raw||!Array.isArray(raw.assets))return raw;
    const limit=freshnessLimitSeconds(api),now=Date.now();
    let maxAge=0,knownAges=0,staleProviders=0,freshComparable=0;
    const assets=raw.assets.map(row=>{
      const observed=row?.observed||{};
      const ages={
        binance:ageSeconds(observed.binance_ms,now),
        kraken:ageSeconds(observed.kraken_utc,now),
        coinbase:ageSeconds(observed.coinbase_utc,now),
        okx:ageSeconds(observed.okx_utc,now)
      };
      const fresh={};
      for(const key of Object.keys(ages)){
        const age=ages[key];
        fresh[key]=age!==null&&age<=limit;
        if(age!==null){knownAges+=1;maxAge=Math.max(maxAge,age);if(age>limit)staleProviders+=1;}
      }
      const prices={
        binance:fresh.binance?numeric(row.binance):null,
        kraken:fresh.kraken?numeric(row.kraken):null,
        coinbase:fresh.coinbase?numeric(row.coinbase):null,
        okx:fresh.okx?numeric(row.okx):null
      };
      const c=consensus([prices.binance,prices.kraken,prices.coinbase,prices.okx]);
      if(c.providers>=2)freshComparable+=1;
      return Object.freeze({...row,...prices,consensus:c,freshness:Object.freeze({limit_seconds:limit,ages:Object.freeze(ages),fresh:Object.freeze(fresh),usable_providers:c.providers})});
    });
    return Object.freeze({...raw,assets:Object.freeze(assets),freshness_gate:Object.freeze({mode:"FAIL_CLOSED_READ_SIDE",limit_seconds:limit,max_age_seconds:knownAges?maxAge:null,known_samples:knownAges,stale_providers:staleProviders,comparable_assets:freshComparable,total_assets:assets.length,ready:freshComparable===assets.length})});
  }

  function guardIntelligence(raw,truth){
    if(!raw)return raw;
    const gate=truth?.freshness_gate||null;
    if(!gate)return raw;
    const cex=Object.freeze({...raw.cex,comparable_assets:Math.min(Number(raw?.cex?.comparable_assets||0),Number(gate.comparable_assets||0)),freshness_gate:true});
    const freshness=Object.freeze({...raw.freshness,max_age_seconds:gate.max_age_seconds,cex_max_age_seconds:gate.max_age_seconds,cex_limit_seconds:gate.limit_seconds,cex_stale_providers:gate.stale_providers,current_age_recomputed:true});
    const rules=Object.freeze({...raw.rules,per_provider_freshness_gate:true,stale_cex_excluded_from_comparison:true});
    return Object.freeze({...raw,state:gate.ready?raw.state:"partial",cex,freshness,rules,freshness_gate:gate});
  }

  let sourceRaw=null,sourceGuard=null;
  let freshnessRecoveryInflight=false,freshnessRecoveryLastAt=0;

  function sourceGridArticle(label){
    const grid=document.getElementById("privateSourceIntelligenceGrid");
    if(!grid)return null;
    return Array.from(grid.querySelectorAll(":scope > article")).find(article=>String(article.querySelector("span")?.textContent||"").trim()===label)||null;
  }

  function requestFreshnessRecovery(gate){
    if(!sourceRaw||!gate||gate.ready||typeof sourceRaw.autoRefresh!=="function")return false;
    const now=Date.now();
    const cooldown=Math.max(60000,Number(gate.limit_seconds||300)*1000);
    if(freshnessRecoveryInflight||now-freshnessRecoveryLastAt<cooldown)return false;
    freshnessRecoveryInflight=true;
    freshnessRecoveryLastAt=now;
    document.documentElement.dataset.sourceFreshnessRecovery="running";
    Promise.resolve(sourceRaw.autoRefresh("freshness-guard",{force:true}))
      .then(result=>{document.documentElement.dataset.sourceFreshnessRecovery=result?"refreshed":"no-result";})
      .catch(error=>{document.documentElement.dataset.sourceFreshnessRecovery="error";document.documentElement.dataset.sourceFreshnessRecoveryError=String(error?.message||error).slice(0,180);})
      .finally(()=>{freshnessRecoveryInflight=false;try{applySourceUiGuard();}catch(_){}});
    return true;
  }

  function applySourceUiGuard(){
    if(!sourceGuard)return null;
    const truth=sourceGuard.snapshot?.()||null;
    const intel=sourceGuard.sourceIntelligence?.()||null;
    const gate=truth?.freshness_gate||intel?.freshness_gate||null;
    if(!gate)return null;

    const cexArticle=sourceGridArticle("CEX");
    if(cexArticle){
      const b=cexArticle.querySelector("b"),small=cexArticle.querySelector("small");
      if(b)b.textContent=`${gate.comparable_assets}/${gate.total_assets}`;
      if(small)small.textContent=gate.ready?"comparaisons CEX fraîches":`${Math.max(0,gate.known_samples-gate.stale_providers)}/${gate.known_samples} cotation(s) fraîche(s) · ${gate.stale_providers} périmée(s)`;
    }
    const freshnessArticle=sourceGridArticle("Fraîcheur");
    if(freshnessArticle){
      const b=freshnessArticle.querySelector("b"),small=freshnessArticle.querySelector("small");
      if(b)b.textContent=freshnessText(gate.max_age_seconds);
      if(small)small.textContent=`âge CEX recalculé maintenant · TTL ${gate.limit_seconds}s · ${gate.known_samples} horodatage(s)`;
    }

    document.documentElement.dataset.sourceFreshnessGateState=gate.ready?"ready":"stale";
    if(gate.ready)return gate;

    const badge=document.getElementById("privateSourceIntelligenceStatus");
    if(badge){badge.className="pill warn";badge.textContent="FRAÎCHEUR PARTIELLE";}
    const detail=document.getElementById("privateSourceIntelligenceDetail");
    if(detail)detail.textContent=`CEX frais ${gate.comparable_assets}/${gate.total_assets} · ${gate.stale_providers} cotation(s) périmée(s) exclue(s) · TTL ${gate.limit_seconds}s · récupération auto bornée`;
    const backendBadge=document.getElementById("privateBackendStatus");
    if(backendBadge){backendBadge.className="pill warn";backendBadge.textContent="CEX À RAFRAÎCHIR";}
    requestFreshnessRecovery(gate);
    return gate;
  }

  function installSourceGuard(){
    const api=globalThis.ErithPrivateBackendSources;
    if(!api||api.__freshness_guard_406098===true)return !!api;
    sourceRaw=api;
    const wrapper={...api};
    wrapper.snapshot=()=>guardTruth(sourceRaw.snapshot?.(),sourceRaw);
    wrapper.sourceIntelligence=()=>guardIntelligence(sourceRaw.sourceIntelligence?.(),wrapper.snapshot());
    wrapper.refresh=async(...args)=>{const result=await sourceRaw.refresh?.(...args);applySourceUiGuard();return result;};
    wrapper.refreshAll=async(...args)=>{const result=await sourceRaw.refreshAll?.(...args);applySourceUiGuard();return result;};
    wrapper.autoRefresh=async(...args)=>{const result=await sourceRaw.autoRefresh?.(...args);applySourceUiGuard();return result;};
    wrapper.__freshness_guard_406098=true;
    wrapper.freshness_guard_build="40.6.98";
    wrapper.freshness_gate_mode="FAIL_CLOSED_READ_SIDE";
    sourceGuard=Object.freeze(wrapper);
    globalThis.__ERITH_PRIVATE_BACKEND_SOURCES_RAW_406098__=sourceRaw;
    globalThis.ErithPrivateBackendSources=sourceGuard;
    applySourceUiGuard();
    document.documentElement.dataset.sourceFreshnessGuard="active";
    return true;
  }

  if(atLeast("40.6.96"))onReady(runStrategyProofOnce);
  if(atLeast("40.6.97")){
    bindRetrospectiveMountTriggers();
    onReady(activateRetrospective);
  }
  if(atLeast("40.6.98")){
    onReady(()=>{installSourceGuard();applySourceUiGuard();});
    window.addEventListener("erith:private-source-runtime-loaded",()=>{installSourceGuard();applySourceUiGuard();},{once:true});
    document.addEventListener("erith:source-intelligence",applySourceUiGuard,{passive:true});
    document.addEventListener("agentcrypto:current-finalized",applySourceUiGuard,{passive:true});
    window.addEventListener("pageshow",applySourceUiGuard,{passive:true});
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")applySourceUiGuard();},{passive:true});
  }

  globalThis.__AGENT_CRYPTO_POST_HANDOFF_406096__=Object.freeze({
    patch:PATCH,
    build:BUILD,
    strategy_auto_proof:atLeast("40.6.96"),
    retrospective_activation:atLeast("40.6.97"),
    retrospective_direct_board_mount:true,
    source_freshness_guard:atLeast("40.6.98"),
    source_freshness_ui_live_age:true,
    source_freshness_auto_recovery:true,
    strategyReceipt:()=>strategyReceipt,
    runStrategyProofOnce,
    activateRetrospective,
    scheduleRetrospectiveRender,
    ensureRetrospectiveStandaloneHost,
    installSourceGuard,
    applySourceUiGuard,
    requestFreshnessRecovery,
    recurring_timer:false,
    observer:false,
    storage_write:false,
    trading:false
  });
})();
