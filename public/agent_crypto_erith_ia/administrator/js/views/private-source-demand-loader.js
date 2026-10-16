/* Agent-Crypto @erith.IA — stable Source Truth demand loader
   40.6.93 removes build-specific ownership from the loader.
   40.6.95 hotfix loads the Strategy A Paper proof trigger repair without a build bump.
   40.6.96+ loads the bounded post-handoff stabilization layer by immutable entry build.
   40.6.98+ loads DEX exclusion diagnostics as a read-only observability layer.
   40.6.101+ loads the fresh-CEX divergence fail-closed quality gate.
   40.6.113+ routes DEX exclusion diagnostics to the canonical unversioned owner.
   40.6.114+ loads the canonical read-only Atlas Decision Context composer.
   40.6.115+ loads the visible Strategy A ↔ TRADUS comparative intelligence owner.
   40.6.116 visual hotfix: Operator Cockpit injection removed; 40.6.115 presentation restored.
   40.6.117 bounded hotfix: loads derived Strategy A ↔ TRADUS Outcome Memory without a new panel.
   40.6.241 canonical repair: loads DEX freshness fail-closed guard after Source Truth and
   before the source-runtime-ready event consumed by diagnostics / Atlas readers.
   40.6.242 hardening: removes eager source-reader boot and settles loader ready state only
   after Source Truth -> DEX freshness -> downstream source readers are ordered.
   Source Truth stays in its canonical Backend / API host.
   40.6.440 restores deterministic Backend/API demand: replay when Backend is already open,
   bounded source-owner loading, and real retry after a failed/stale script node.
   40.6.456 makes runtime READY fail-closed: Source owner + freshness guard + bounded downstream ordering
   must all succeed before state=ready and before erith:private-source-runtime-loaded is emitted.
   40.6.457 hardens Source owner readiness: mount() must explicitly return true, mount-false is fail-closed,
   and the duplicate pre-mount call is removed so one demand performs one owner mount attempt.
   private-backend-sources.js remains the single Source Truth runtime owner.
   No polling, observer, loader storage write, wallet or trading endpoint is introduced. */
(()=>{
  "use strict";
  const __PROBE_406411_SRC="private-source-demand-loader.js";
  const __PROBE_406411_BUILD=String(globalThis.AGENT_CRYPTO_EFFECTIVE_BUILD||document.documentElement?.dataset?.agentCryptoLoadedBuild||"");
  const __PROBE_406411_ON=["40.6.411","40.6.412"].includes(__PROBE_406411_BUILD);
  const __PROBE_406411_T0=__PROBE_406411_ON?performance.now():0;
  if(__PROBE_406411_ON){try{globalThis.AgentCryptoBootProbe?.mark?.("probe-script-eval-enter",{src:__PROBE_406411_SRC,build:__PROBE_406411_BUILD});}catch(_){}}

  const INSTANCE_KEY="__ERITH_PRIVATE_SOURCE_DEMAND_STABLE_BOUND__";
  if(globalThis[INSTANCE_KEY])return;
  globalThis[INSTANCE_KEY]=true;
  const metaBuild=()=>String(document.querySelector('meta[name="administrator-build"]')?.content||"").trim();
  const pathBuild=()=>String(location.pathname||"").match(/(?:^|\/)index-(\d+\.\d+\.\d+)\.html$/i)?.[1]||"";
  const BUILD=String(globalThis.ErithVersionTruth?.build||pathBuild()||metaBuild()||"runtime").trim();
  const runtimeBuild=()=>String(globalThis.ErithVersionTruth?.build||pathBuild()||new URLSearchParams(location.search||"").get("ac-build")||metaBuild()||BUILD||"runtime").trim();
  const SRC=`./js/views/private-backend-sources.js?v=administrator-build-${encodeURIComponent(BUILD)}`;
  const SOURCE_LOAD_TIMEOUT_MS=7000, DOWNSTREAM_TIMEOUT_MS=4500;
  let state="idle",promise=null,reason="",loadedAt=0,lastError="",attempts=0;
  let sourceOwnerApiReadyState=false,sourceOwnerMountedState=false,sourceOwnerReadyState=false,freshnessGuardReady=false,downstreamState="idle";

  const parts=value=>String(value||"").split(".").map(x=>Number.parseInt(x,10)||0);
  const atLeast=target=>{const A=parts(runtimeBuild()),B=parts(target),n=Math.max(A.length,B.length);for(let i=0;i<n;i+=1){const d=(A[i]||0)-(B[i]||0);if(d)return d>0;}return true;};

  function ensureStrategyProofHotfix(){
    if(runtimeBuild()!=="40.6.95")return false;
    if(globalThis.__ERITH_STRATEGY_A_PAPER_PROOF_HOTFIX_406095__)return true;
    if(document.querySelector('script[data-strategy-a-paper-proof-hotfix="true"]'))return true;
    const script=document.createElement("script");
    script.src="./js/strategy-a-paper-proof-hotfix.js?v=hotfix-1";
    script.async=false;
    script.dataset.strategyAPaperProofHotfix="true";
    document.head.appendChild(script);
    return true;
  }

  function ensurePostHandoff(){
    if(!atLeast("40.6.96"))return false;
    if(globalThis.__AGENT_CRYPTO_POST_HANDOFF_406096__)return true;
    if(document.querySelector('script[data-agent-crypto-post-handoff="true"]'))return true;
    const script=document.createElement("script");
    script.src=`./js/agent-crypto-post-handoff-406096.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
    script.async=false;
    script.dataset.agentCryptoPostHandoff="true";
    document.head.appendChild(script);
    return true;
  }

  function ensureDexFreshnessGuard(){
    if(!atLeast("40.6.111"))return Promise.resolve(false);
    if(globalThis.AgentCryptoDexFreshnessGuard?.active===true)return Promise.resolve(true);
    let existing=document.querySelector('script[data-dex-freshness-guard-canonical="true"]');
    if(existing){
      if(globalThis.AgentCryptoDexFreshnessGuard?.active===true)return Promise.resolve(true);
      if(existing.dataset.loaded==="true"||existing.dataset.loaded==="false"){
        try{existing.remove();}catch(_){}
        existing=null;
      }else{
        return new Promise(resolve=>{
          existing.addEventListener("load",()=>{
            existing.dataset.loaded="true";
            resolve(globalThis.AgentCryptoDexFreshnessGuard?.active===true);
          },{once:true});
          existing.addEventListener("error",()=>{
            existing.dataset.loaded="false";
            try{existing.remove();}catch(_){}
            resolve(false);
          },{once:true});
        });
      }
    }
    return new Promise(resolve=>{
      const script=document.createElement("script");
      script.src=`./js/dex-freshness-guard.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
      script.async=false;
      script.dataset.dexFreshnessGuardCanonical="true";
      script.dataset.loaded="pending";
      script.addEventListener("load",()=>{
        script.dataset.loaded="true";
        resolve(globalThis.AgentCryptoDexFreshnessGuard?.active===true);
      },{once:true});
      script.addEventListener("error",()=>{
        script.dataset.loaded="false";
        try{script.remove();}catch(_){}
        resolve(false);
      },{once:true});
      document.head.appendChild(script);
    });
  }

  function ensureDexDiagnostics(){
    if(!atLeast("40.6.98"))return false;
    if(atLeast("40.6.113")){
      if(globalThis.AgentCryptoDexExclusionDiagnostics?.owner==="dex-exclusion-diagnostics")return true;
      if(document.querySelector('script[data-dex-exclusion-diagnostics-canonical="true"]'))return true;
      const script=document.createElement("script");
      script.src=`./js/dex-exclusion-diagnostics.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
      script.async=false;
      script.dataset.dexExclusionDiagnosticsCanonical="true";
      document.head.appendChild(script);
      return true;
    }
    if(globalThis.AgentCryptoDexExclusionDiagnostics406098)return true;
    if(document.querySelector('script[data-dex-exclusion-diagnostics="true"]'))return true;
    const script=document.createElement("script");
    script.src=`./js/dex-exclusion-diagnostics-406098.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
    script.async=false;
    script.dataset.dexExclusionDiagnostics="true";
    document.head.appendChild(script);
    return true;
  }

  function ensureCexDivergenceGuard(){
    if(!atLeast("40.6.101"))return false;
    if(globalThis.AgentCryptoCexDivergenceGuard)return true;
    if(document.querySelector('script[data-cex-divergence-guard="true"]'))return true;
    const script=document.createElement("script");
    script.src=`./js/cex-divergence-guard-406101.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
    script.async=false;
    script.dataset.cexDivergenceGuard="true";
    document.head.appendChild(script);
    return true;
  }

  function ensureAtlasDecisionContext(){
    if(!atLeast("40.6.114"))return false;
    if(globalThis.AgentCryptoAtlasDecisionContext?.owner==="atlas-decision-context")return true;
    if(document.querySelector('script[data-atlas-decision-context="true"]'))return true;
    const script=document.createElement("script");
    script.src=`./js/atlas-decision-context.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
    script.async=false;
    script.dataset.atlasDecisionContext="true";
    document.head.appendChild(script);
    return true;
  }

  function ensureStrategyTradusComparative(){
    if(!atLeast("40.6.115"))return false;
    if(globalThis.AgentCryptoStrategyTradusComparativeIntelligence?.owner==="strategy-tradus-comparative-intelligence")return true;
    if(document.querySelector('script[data-strategy-tradus-comparative-intelligence="true"]'))return true;
    const script=document.createElement("script");
    script.src=`./js/strategy-tradus-comparative-intelligence.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
    script.async=false;
    script.dataset.strategyTradusComparativeIntelligence="true";
    document.head.appendChild(script);
    return true;
  }

  function ensureStrategyTradusOutcomeMemory(){
    if(!atLeast("40.6.117"))return false;
    if(globalThis.AgentCryptoStrategyTradusOutcomeMemory?.owner==="strategy-tradus-outcome-memory")return true;
    if(document.querySelector('script[data-strategy-tradus-outcome-memory="true"]'))return true;
    const script=document.createElement("script");
    script.src=`./js/strategy-tradus-outcome-memory.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
    script.async=false;
    script.dataset.strategyTradusOutcomeMemory="true";
    document.head.appendChild(script);
    return true;
  }

  function settleReady(){state="ready";loadedAt=Date.now();lastError="";downstreamState="ready";return true;}

  /* 40.6.456 READY CONTRACT PURE START */
  function sourceRuntimeOutcome406456(ownerReady,freshnessReady,downstream){
    const ds=String(downstream||"unknown");
    if(ownerReady!==true)return Object.freeze({ready:false,error:"source-owner-not-ready"});
    if(freshnessReady!==true)return Object.freeze({ready:false,error:"freshness-guard-not-ready"});
    if(ds!=="ready")return Object.freeze({ready:false,error:"downstream-"+ds});
    return Object.freeze({ready:true,error:""});
  }
  /* 40.6.456 READY CONTRACT PURE END */

  /* 40.6.457 SOURCE OWNER MOUNT CONTRACT PURE START */
  function sourceOwnerMountOutcome406457(apiReady,mountResult,mountErrored){
    if(apiReady!==true)return Object.freeze({ready:false,error:"source-owner-missing-after-load"});
    if(mountErrored===true)return Object.freeze({ready:false,error:"source-owner-mount-error"});
    if(mountResult!==true)return Object.freeze({ready:false,error:"source-owner-mount-false"});
    return Object.freeze({ready:true,error:""});
  }
  /* 40.6.457 SOURCE OWNER MOUNT CONTRACT PURE END */

  async function afterSourceOwners(){
    // 40.6.456: freshness readiness is a hard prerequisite for the runtime-ready event.
    const freshness=await ensureDexFreshnessGuard();
    freshnessGuardReady=freshness===true&&globalThis.AgentCryptoDexFreshnessGuard?.active===true;
    if(!freshnessGuardReady)return false;
    ensureDexDiagnostics();
    ensureCexDivergenceGuard();
    ensureAtlasDecisionContext();
    ensureStrategyTradusComparative();
    ensureStrategyTradusOutcomeMemory();
    return true;
  }

  const sourceScript=()=>document.querySelector('script[data-private-source-demand-stable="true"],script[data-private-source-demand="true"]');
  const discardSourceScript=node=>{if(!node)return;try{node.dataset.loaded="0";node.remove();}catch(_){}};
  const downstreamBounded=async()=>{
    let timer=0;
    downstreamState="loading";
    try{
      const timeout=new Promise(resolve=>{timer=setTimeout(()=>resolve("timeout"),DOWNSTREAM_TIMEOUT_MS);});
      const result=await Promise.race([
        Promise.resolve(afterSourceOwners()).then(ok=>ok===true?"ready":"freshness-not-ready").catch(()=>"error"),
        timeout
      ]);
      downstreamState=String(result||"error");
      return downstreamState;
    }finally{if(timer)clearTimeout(timer);}
  };
  const sourceOwnerReady=async(node,why)=>{
    if(node)node.dataset.loaded="1";
    const owner=globalThis.ErithPrivateBackendSources;
    sourceOwnerApiReadyState=!!owner&&typeof owner.mount==="function";
    sourceOwnerMountedState=false;
    sourceOwnerReadyState=false;
    if(!sourceOwnerApiReadyState){
      state="error";loadedAt=0;lastError="source-owner-missing-after-load";freshnessGuardReady=false;downstreamState="not-started";
      discardSourceScript(node);
      return false;
    }
    let mountResult=false,mountErrored=false;
    try{mountResult=owner.mount();}catch(_){mountErrored=true;}
    const mountOutcome=sourceOwnerMountOutcome406457(sourceOwnerApiReadyState,mountResult,mountErrored);
    sourceOwnerMountedState=mountOutcome.ready===true;
    sourceOwnerReadyState=sourceOwnerApiReadyState&&sourceOwnerMountedState;
    if(!sourceOwnerReadyState){
      state="error";loadedAt=0;lastError=mountOutcome.error;freshnessGuardReady=false;downstreamState="not-started";
      return false;
    }
    const downstream=await downstreamBounded();
    const outcome=sourceRuntimeOutcome406456(sourceOwnerReadyState,freshnessGuardReady,downstream);
    if(!outcome.ready){
      state="error";loadedAt=0;lastError=outcome.error;
      return false;
    }
    settleReady();
    try{window.dispatchEvent(new CustomEvent("erith:private-source-runtime-loaded",{detail:{build:runtimeBuild(),reason:String(why||reason),downstream,source_owner_ready:true,freshness_guard_ready:true}}));}catch(_){}
    return true;
  };

  function ensure(why="operator"){
    reason=String(why||"operator");
    if(globalThis.ErithPrivateBackendSources){
      return sourceOwnerReady(sourceScript(),reason);
    }
    if(promise)return promise;

    let existing=sourceScript();
    if(existing && (
      state==="error" ||
      existing.dataset.loaded==="0" ||
      existing.dataset.loaded==="false" ||
      existing.dataset.loaded==="true"
    )){
      discardSourceScript(existing);
      existing=null;
    }

    state="loading";loadedAt=0;lastError="";sourceOwnerApiReadyState=false;sourceOwnerMountedState=false;sourceOwnerReadyState=false;freshnessGuardReady=false;downstreamState="loading";attempts+=1;
    promise=new Promise(resolve=>{
      let node=existing,settled=false,timer=0;
      const finish=async(ok,code)=>{
        if(settled)return;
        settled=true;
        if(timer)clearTimeout(timer);
        if(!ok){
          state="error";lastError=String(code||"source-load-failed");
          discardSourceScript(node);
          resolve(false);
          return;
        }
        resolve(await sourceOwnerReady(node,reason));
      };
      timer=setTimeout(()=>void finish(false,"source-load-timeout"),SOURCE_LOAD_TIMEOUT_MS);

      if(node){
        node.addEventListener("load",()=>void finish(true,"existing-load"),{once:true});
        node.addEventListener("error",()=>void finish(false,"existing-load-error"),{once:true});
        return;
      }

      node=document.createElement("script");
      node.src=SRC;
      node.async=true;
      node.dataset.privateSourceDemandStable="true";
      node.dataset.loaded="pending";
      node.addEventListener("load",()=>void finish(true,"script-load"),{once:true});
      node.addEventListener("error",()=>void finish(false,"script-load-error"),{once:true});
      document.head.appendChild(node);
    }).finally(()=>{promise=null;});
    return promise;
  }

  function clickDemand(event){
    const target=event.target instanceof Element?event.target:null;
    if(!target)return;
    const sourceNav=target.closest('[data-atlas-essential-target="sources"],[aria-controls="sources"],a[href="#sources"]');
    const backend=target.closest('details[data-collapse-key="backend"] > summary,a[href="#backend"],a[href="#privateBackendV1"]');
    if(sourceNav)void ensure("sources");
    else if(backend)void ensure("backend");
  }
  document.addEventListener("click",clickDemand,true);

  const backend=document.querySelector('details[data-collapse-key="backend"]');
  backend?.addEventListener("toggle",()=>{if(backend.open)void ensure("backend-open");});
  window.addEventListener("erith:system-hydrated",event=>{if(String(event?.detail?.key||"")==="backend"&&document.querySelector('details[data-collapse-key="backend"]')?.open)void ensure("backend-hydrated");},{passive:true});
  // 40.6.440 — replay demand if the Backend was opened before this loader arrived.
  if(backend?.open)queueMicrotask(()=>void ensure("backend-already-open"));
  window.addEventListener("pageshow",()=>{const node=document.querySelector('details[data-collapse-key="backend"]');if(node?.open&&!globalThis.ErithPrivateBackendSources)void ensure("backend-pageshow-recovery");},{passive:true});

  const hash=String(location.hash||"");
  if(["#sources","#backend","#privateBackendV1","#privateSourceIntelligence"].includes(hash))void ensure("direct-hash");
  ensureStrategyProofHotfix();
  ensurePostHandoff();
  // 40.6.242: source-derived readers are no longer booted eagerly.
  // DEX diagnostics, CEX divergence and Atlas Decision Context are started only
  // by afterSourceOwners(), after Source Truth + DEX freshness are ready.
  ensureStrategyTradusComparative();
  ensureStrategyTradusOutcomeMemory();
  queueMicrotask(()=>{ensureStrategyTradusComparative();ensureStrategyTradusOutcomeMemory();});
  window.addEventListener("load",()=>{ensureStrategyTradusComparative();ensureStrategyTradusOutcomeMemory();},{once:true,passive:true});
  window.addEventListener("pageshow",()=>{ensureStrategyTradusComparative();ensureStrategyTradusOutcomeMemory();},{passive:true});

  const API=Object.freeze({
    build:BUILD,
    active_build:runtimeBuild,
    ensure,
    ensureStrategyProofHotfix,
    ensurePostHandoff,
    ensureDexFreshnessGuard,
    ensureDexDiagnostics,
    ensureCexDivergenceGuard,
    ensureAtlasDecisionContext,
    ensureStrategyTradusComparative,
    ensureStrategyTradusOutcomeMemory,
    snapshot:()=>Object.freeze({state,runtime_ready:state==="ready",reason,loaded_at:loadedAt,last_error:lastError,attempts,source_owner_api_ready:sourceOwnerApiReadyState,source_owner_mounted:sourceOwnerMountedState,source_owner_ready:sourceOwnerReadyState,freshness_guard_ready:freshnessGuardReady,downstream_state:downstreamState,source_load_timeout_ms:SOURCE_LOAD_TIMEOUT_MS,downstream_timeout_ms:DOWNSTREAM_TIMEOUT_MS,parser_boot_loaded:false,source:SRC,source_truth_host:"backend",active_build:runtimeBuild()}),
    self_test:()=>{
      const cases=[
        sourceRuntimeOutcome406456(false,true,"ready").ready===false,
        sourceRuntimeOutcome406456(true,false,"ready").ready===false,
        sourceRuntimeOutcome406456(true,true,"timeout").ready===false,
        sourceRuntimeOutcome406456(true,true,"error").ready===false,
        sourceRuntimeOutcome406456(true,true,"ready").ready===true,
        sourceOwnerMountOutcome406457(false,true,false).ready===false,
        sourceOwnerMountOutcome406457(true,false,false).ready===false,
        sourceOwnerMountOutcome406457(true,true,true).ready===false,
        sourceOwnerMountOutcome406457(true,true,false).ready===true
      ];
      return Object.freeze({pass:cases.every(Boolean),total:cases.length,passed:cases.filter(Boolean).length,cases:Object.freeze(cases)});
    },
    stable_owner:true,
    source_truth_backend_placement_restored:true,
    sources_reparenting:false,
    strategy_paper_proof_hotfix:runtimeBuild()==="40.6.95",
    post_handoff_stabilization:atLeast("40.6.96"),
    dex_freshness_guard_canonical:atLeast("40.6.111"),
    dex_freshness_guard_wiring_repair:atLeast("40.6.241"),
    dex_exclusion_diagnostics:atLeast("40.6.98"),
    dex_exclusion_diagnostics_canonical:atLeast("40.6.113"),
    cex_divergence_fail_closed:atLeast("40.6.101"),
    atlas_decision_context:atLeast("40.6.114"),
    strategy_tradus_comparative_intelligence:atLeast("40.6.115"),
    strategy_tradus_outcome_memory:atLeast("40.6.117"),
    source_owner_mount_contract_hardened:atLeast("40.6.457"),
    operator_cockpit:false,
    new_timer:false,
    new_observer:false,
    new_storage_owner:false,
    new_network_owner:false
  });
  globalThis.ErithPrivateSourceDemand=API;
  globalThis.ErithPrivateSourceDemand40486=API;

  if(__PROBE_406411_ON){try{globalThis.AgentCryptoBootProbe?.mark?.("probe-script-eval-exit",{src:__PROBE_406411_SRC,build:__PROBE_406411_BUILD,eval_ms:Number((performance.now()-__PROBE_406411_T0).toFixed(3))});}catch(_){}}
})();
