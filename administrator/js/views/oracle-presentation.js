/* Agent-Crypto @erith.IA — 40.4.260
   ORACLE TRUE LAZY PRESENTATION / CANONICAL OWNER CONSOLIDATION LOCK
   Outer live summary + three heavy subsection shells stay parser-mounted.
   Heavy bodies are read from views/oracle.html only when their own disclosure opens.
   One same-origin static presentation fetch is shared/cached for the session.
   Oracle V1, Evidence, Calibration, Shadow, outcomes, IndexedDB and Market Core remain runtime-owned by app.js.
   No timer, observer, storage write, model reset or business-data network owner is added.
   40.4.41 absorbs the former oracle-ui-continuity exclusive-accordion responsibility and retires
   oracle-demand-residency from the production load graph: one presentation owner remains. */
(()=>{
  "use strict";
  const BUILD="40.4.260";
  const SOURCE="./views/oracle.html";
  const host=document.getElementById("oracle-view-host");
  if(!host)return;

  const shellHtml=`
    <details class="atlas-collapse glass atlas-family-member atlas-tone-analysis atlas-oracle-suite" id="oracle-analysis-suite" data-collapse-key="oracle-analysis-suite" data-layout-family="analysis" data-oracle-true-lazy-shell="suite">
      <summary class="atlas-collapse-summary">
        <span class="atlas-collapse-icon" aria-hidden="true">▶</span>
        <span class="atlas-oracle-suite-title"><strong>Oracle — Analyse prospective & preuves</strong><small>Calibration · Evidence · Source Health · Infrastructure · Runtime</small></span>
        <span class="atlas-oracle-suite-kpis" aria-label="Résumé Oracle"><span>Evidence <b id="atlasOracleSuiteEvidence">—</b></span><span>Résolues <b id="atlasOracleSuiteResolved">—</b></span><span>Sources <b id="atlasOracleSuiteSources">—</b></span><span>Qualité <b id="atlasOracleSuiteQuality">—</b></span></span>
        <span class="atlas-collapse-state" data-open-label="Replier" data-closed-label="Déplier">Déplier</span>
        <span class="atlas-oracle-collapsed-preview-40296" id="atlasOracleCollapsedPreview40296" data-bias="unknown" aria-label="Résumé live Oracle replié">
          <span class="atlas-oracle-collapsed-copy-40296"><span>ORACLE LIVE · BIAIS MESURÉ</span><b id="atlasOracleCollapsedBias40296">Livecheck requis</b></span>
          <span class="atlas-oracle-collapsed-meta-40296"><span id="atlasOracleCollapsedConfidence40296">Confiance données —</span><span id="atlasOracleCollapsedHorizon40296">5 MIN</span></span>
          <span class="atlas-oracle-collapsed-directions-40296">
            <span class="atlas-oracle-collapsed-direction-40296 is-bull"><span class="atlas-oracle-collapsed-direction-head-40296"><span>ORACLE HAUSSE</span><b id="atlasOracleCollapsedBull40296">—</b></span><span class="atlas-oracle-collapsed-meter-40296" aria-hidden="true"><i id="atlasOracleCollapsedBullMeter40296"></i></span></span>
            <span class="atlas-oracle-collapsed-direction-40296 is-bear"><span class="atlas-oracle-collapsed-direction-head-40296"><span>ORACLE BAISSE</span><b id="atlasOracleCollapsedBear40296">—</b></span><span class="atlas-oracle-collapsed-meter-40296" aria-hidden="true"><i id="atlasOracleCollapsedBearMeter40296"></i></span></span>
          </span>
        </span>
      </summary>
      <div class="atlas-collapse-body atlas-oracle-suite-body">
        <details class="atlas-collapse atlas-oracle-suite-subsection" id="oracle-models-calibration" data-collapse-key="oracle-models-calibration" data-oracle-accordion-40406="models" data-oracle-true-lazy-shell="models">
          <summary class="atlas-collapse-summary"><span class="atlas-collapse-icon" aria-hidden="true">▶</span><span class="atlas-collapse-copy"><span class="atlas-collapse-title">Modèles & calibration</span><span class="atlas-collapse-subtitle">Oracle V1 · Ensemble · Shadow V2 · long horizon · intégrité</span></span><span class="atlas-collapse-state" data-open-label="Replier" data-closed-label="Déplier">Déplier</span></summary>
          <div class="atlas-collapse-body" data-oracle-lazy-body="models" data-oracle-hydration="placeholder"></div>
        </details>
        <details class="atlas-collapse atlas-oracle-suite-subsection" data-collapse-key="oracle-sources-runtime" data-oracle-accordion-40406="sources" data-oracle-true-lazy-shell="sources">
          <summary class="atlas-collapse-summary"><span class="atlas-collapse-icon" aria-hidden="true">▶</span><span class="atlas-collapse-copy"><span class="atlas-collapse-title">Sources & Source Health</span><span class="atlas-collapse-subtitle">Infrastructure · Runtime · quorum · désaccord · performance prospective</span></span><span class="atlas-collapse-state" data-open-label="Replier" data-closed-label="Déplier">Déplier</span></summary>
          <div class="atlas-collapse-body" data-oracle-lazy-body="sources" data-oracle-hydration="placeholder"></div>
        </details>
        <details class="atlas-collapse glass atlas-family-member atlas-tone-analysis oracle-evidence-explorer atlas-oracle-suite-subsection" id="oracle-evidence-explorer" data-oracle-accordion-40406="evidence" data-collapse-key="oracle-evidence-explorer" data-layout-family="analysis" data-deferred="true" data-oracle-true-lazy-shell="evidence">
          <summary class="atlas-collapse-summary"><span class="atlas-collapse-icon" aria-hidden="true">▶</span><span class="atlas-collapse-copy"><span class="atlas-collapse-title">Evidence & validation</span><span class="atlas-collapse-subtitle">Observations T0 · résultats réels · filtres locaux · Explorer différé</span></span><span class="atlas-collapse-state" data-open-label="Replier" data-closed-label="Déplier">Déplier</span></summary>
          <div class="atlas-collapse-body" data-oracle-lazy-body="evidence" data-oracle-hydration="placeholder"></div>
        </details>
      </div>
    </details>`;

  const KEYS=Object.freeze(["models","sources","evidence"]);
  const SELECTORS=Object.freeze({models:'#oracle-models-calibration',sources:'details[data-collapse-key="oracle-sources-runtime"]',evidence:'#oracle-evidence-explorer'});
  let sourcePromise=null, sourceTemplate=null, sourceFetchCount=0, hydrationCount=0, lastError="";

  host.insertAdjacentHTML("beforebegin",shellHtml);
  host.remove();

  const detailFor=key=>document.querySelector(SELECTORS[key]||"");
  const bodyFor=key=>detailFor(key)?.querySelector(":scope > .atlas-collapse-body")||null;

  async function sourceDocument(){
    if(sourceTemplate)return sourceTemplate;
    if(sourcePromise)return sourcePromise;
    sourceFetchCount+=1;
    sourcePromise=fetch(SOURCE,{credentials:"same-origin",cache:"default"})
      .then(response=>{if(!response.ok)throw new Error(`Oracle source HTTP ${response.status}`);return response.text();})
      .then(text=>{const template=document.createElement("template");template.innerHTML=text;sourceTemplate=template;lastError="";return template;})
      .catch(error=>{lastError=String(error?.message||error||"Oracle source unavailable");sourcePromise=null;throw error;});
    return sourcePromise;
  }

  function reconcile(key){
    try{globalThis.atlasV2ClassifySections?.();}catch(_){}
    try{const mode=globalThis.atlasV2Mode?.()||document.documentElement.dataset.atlasView||"essential";globalThis.atlasV2ApplySectionVisibility?.(mode);globalThis.atlasV2ApplySemanticRoleIsolation40312?.(mode);}catch(_){}
    if(key==="models"){
      try{globalThis.atlasOracleBackupInit?.();}catch(_){}
      try{globalThis.atlasOracleLabRefreshOnDemand40384?.(true)?.catch?.(()=>{});}catch(_){}
      try{globalThis.atlasOracleLabDashboardRefresh?.(true)?.catch?.(()=>{});}catch(_){}
      try{globalThis.atlasOracleIntegrityRefresh?.(true)?.catch?.(()=>{});}catch(_){}
    }else if(key==="sources"){
      try{globalThis.atlasOracleInfrastructureRender4020?.();}catch(_){}
      try{globalThis.atlasOracleSourceHealthPerformanceRefresh4027?.()?.catch?.(()=>{});}catch(_){}
      try{globalThis.atlasOracleThirdSourceReadinessRender4028?.();}catch(_){}
    }else if(key==="evidence"){
      const root=document.getElementById("oracle-evidence-explorer");
      try{if(root)delete root.dataset.oracleExplorerInit;}catch(_){}
      try{globalThis.atlasOracleEvidenceExplorerInit?.();}catch(_){}
      try{globalThis.atlasOracleEvidenceExplorerRefresh?.()?.catch?.(()=>{});}catch(_){}
    }
    try{globalThis.atlasOracleSuiteSummarySync40216?.();}catch(_){}
    try{window.dispatchEvent(new CustomEvent("erith:oracle-hydrated",{detail:{build:BUILD,key}}));}catch(_){}
  }

  async function hydrate(key){
    key=String(key||"");
    if(!KEYS.includes(key))return false;
    const detail=detailFor(key);
    if(!(detail instanceof HTMLDetailsElement))return false;
    let body=bodyFor(key);
    if(!(body instanceof HTMLElement)){
      try{globalThis.ErithPresentationLifecycle?.restoreForHash?.(`#${detail.id||detail.dataset.collapseKey||""}`);}catch(_){}
      body=bodyFor(key);
    }
    if(!(body instanceof HTMLElement))return false;
    if(body.dataset.oracleHydration==="ready")return true;
    if(body.dataset.oracleHydration==="loading"){
      try{await sourcePromise;}catch(_){}
      return body.dataset.oracleHydration==="ready";
    }
    body.dataset.oracleHydration="loading";
    try{
      const template=await sourceDocument();
      const sourceDetail=template.content.querySelector(SELECTORS[key]);
      const sourceBody=sourceDetail?.querySelector(":scope > .atlas-collapse-body");
      if(!(sourceBody instanceof HTMLElement))throw new Error(`Oracle body missing: ${key}`);
      body.replaceChildren(...[...sourceBody.childNodes].map(node=>node.cloneNode(true)));
      body.dataset.oracleHydration="ready";
      hydrationCount+=1;
      reconcile(key);
      return true;
    }catch(error){
      body.dataset.oracleHydration="error";
      body.dataset.oracleHydrationError=String(error?.message||error||"unknown");
      console.warn(`Agent-Crypto ${BUILD} · Oracle body hydration failed`,key,error);
      return false;
    }
  }

  function bind(key){
    const detail=detailFor(key);
    if(!(detail instanceof HTMLDetailsElement)||detail.dataset.oracleTrueLazyBound==="1")return;
    detail.dataset.oracleTrueLazyBound="1";
    const ensure=()=>{if(detail.open)hydrate(key);};
    detail.addEventListener("toggle",()=>{if(detail.open)queueMicrotask(ensure);});
    detail.addEventListener("erith:presentation-resident",ensure);
  }
  KEYS.forEach(bind);
  // 40.4.260 — operator multi-open policy. The three heavy Oracle bodies remain
  // true-lazy and hydrate only on first disclosure, but opening one no longer
  // closes another. This is presentation-only; engines and data owners are unchanged.
  const exclusiveAccordionMembers=0;

  function snapshot(){
    const rows=KEYS.map(key=>{const detail=detailFor(key),body=bodyFor(key);return Object.freeze({key,open:detail?.open===true,body_state:body?.dataset?.oracleHydration||"detached-or-missing",connected:detail?.isConnected===true});});
    return Object.freeze({build:BUILD,source:SOURCE,strategy:"parser-shell + on-demand body hydration",outer_live_summary_resident:true,heavy_subsection_shells_resident:true,source_fetch_count:sourceFetchCount,hydration_count:hydrationCount,last_error:lastError||null,rows:Object.freeze(rows),oracle_engine_changed:false,evidence_history_changed:false,market_core_changed:false,new_timer:false,new_observer:false,storage_write_added:false,business_network_owner_added:false,static_presentation_fetch_on_first_disclosure:true,exclusive_accordion_owner:null,exclusive_accordion_members:exclusiveAccordionMembers,multi_open:true,legacy_ui_continuity_loaded:false,legacy_demand_residency_loaded:false});
  }
  const api=Object.freeze({build:BUILD,source:SOURCE,ensureBody:hydrate,snapshot,keys:KEYS,network_fetch:"one same-origin static presentation source on first heavy disclosure only",oracle_engine_changed:false,evidence_history_changed:false,market_core_changed:false,new_timer:false,new_observer:false,storage_write_added:false,business_network_owner_added:false,exclusive_accordion_owner:false,multi_open:true,legacy_ui_continuity_retired:true,legacy_demand_residency_retired:true});
  globalThis.ErithOraclePresentation=api;
  globalThis.ErithOraclePresentation40441=api;
  globalThis.__AGENT_CRYPTO_ORACLE_PRESENTATION_MOUNT_40441__=snapshot();
})();
