/* Agent-Crypto Administrator — 40.6.288
   STORAGE RELIEF · VERIFIED LOCAL COPY RETIREMENT

   Purpose:
   - Reuse the existing canonical Storage Relief owner already present in app.js.
   - Target ONLY the two canonical heavy relief targets:
       * agent_crypto_scanner_live_archive_v1
       * agent_crypto_erith_ia_real_charts_v1_1_alpha_26_37_top50
   - Step 1: operator-triggered copy/readback/SHA-256 verification in IndexedDB.
   - Step 2: export a full localStorage backup, then run the existing guarded relief flow.
   - Existing relief flow asks for explicit browser confirmation before localStorage removal.
   - No generic cleanup. No REVIEW_REQUIRED market cache retirement. No IndexedDB deletion.
   - No timer, observer, network request, schema change, order path or trading change.
*/
(()=>{
  "use strict";
  if(globalThis.AgentCryptoStorageReliefControlled406288)return;

  const BUILD="40.6.288";
  const TARGETS=Object.freeze([
    "agent_crypto_scanner_live_archive_v1",
    "agent_crypto_erith_ia_real_charts_v1_1_alpha_26_37_top50"
  ]);
  const state={
    mounted:false,
    prepared:false,
    preparing:false,
    executing:false,
    lastPlan:null,
    lastResult:null,
    lastError:null,
    preparedAt:null,
    completedAt:null
  };

  const fmt=n=>{
    const value=Math.max(0,Number(n)||0);
    if(value<1024)return value+" B";
    if(value<1024*1024)return (value/1024).toFixed(1)+" KiB";
    return (value/(1024*1024)).toFixed(2)+" MiB";
  };
  const safe=x=>String(x??"").replace(/[\r\n\t]+/g," ").trim();

  function api(){
    return {
      relief:globalThis.AtlasStorageRelief40278||null,
      guarded:globalThis.AtlasStorageRelief40391||null,
      backup:globalThis.AtlasStorageRetirement||null,
      audit:globalThis.AgentCryptoStorageOwnershipAudit406287||null
    };
  }

  async function waitCanonicalReady(){
    const a=api();
    if(!a.relief?.ready)throw new Error("Storage Relief canonique indisponible");
    try{await a.relief.ready;}catch(_){}
    return api();
  }

  function exactTargets(plan){
    const rows=Array.isArray(plan?.targets)?plan.targets:[];
    return rows.filter(row=>TARGETS.includes(String(row?.key||"")));
  }

  function renderPlan(plan,status="PRÊT"){
    const out=document.getElementById("atlasStorageRelief288");
    const badge=document.getElementById("atlasStorageReliefState288");
    if(!out)return plan;
    const rows=exactTargets(plan);
    const reclaimable=rows.filter(row=>row.local_present&&row.sha256_verified);
    const reclaimableBytes=reclaimable.reduce((sum,row)=>sum+Number(row.local_bytes||0),0);
    const lines=[
      "STORAGE RELIEF · 40.6.288 · VERIFIED LOCAL COPY RETIREMENT",
      `État : ${status}`,
      `Cibles autorisées : ${TARGETS.length} uniquement · retrait générique INTERDIT`,
      "",
      ...rows.map((row,index)=>[
        `${index+1}. ${row.key}`,
        `   local : ${row.local_present?"PRÉSENT":"ABSENT"} · ${fmt(row.local_bytes||0)}`,
        `   IndexedDB : ${row.idb_present?"PRÉSENT":"ABSENT"} · ${fmt(row.idb_bytes||0)}`,
        `   payload exact : ${row.exact_payload_match?"OUI":"NON"} · SHA-256 vérifié : ${row.sha256_verified?"OUI":"NON"}`,
        `   décision : ${safe(row.state||"EN ATTENTE")}`
      ].join("\n")),
      "",
      `Copies localStorage retirables après vérification : ${reclaimable.length}/${TARGETS.length} · ${fmt(reclaimableBytes)}`,
      "Protection : backup localStorage complet avant exécution · confirmation opérateur dans le flux canonique.",
      "Hors périmètre : caches Market anciens, doublons, IndexedDB, Evidence, Source History."
    ];
    out.textContent=lines.join("\n");
    if(badge)badge.textContent=`${status} · ${reclaimable.length}/${TARGETS.length} · ${fmt(reclaimableBytes)}`;
    const exec=document.getElementById("btnAtlasStorageReliefExecute288");
    if(exec)exec.disabled=reclaimable.length===0;
    return plan;
  }

  function renderResult(result){
    const out=document.getElementById("atlasStorageRelief288");
    const badge=document.getElementById("atlasStorageReliefState288");
    if(!out)return result;
    const before=Number(result?.local_storage_before?.bytes)||0;
    const after=Number(result?.local_storage_after?.bytes)||0;
    const reclaimed=Number(result?.reclaimed_bytes)||Math.max(0,before-after);
    const retirement=Array.isArray(result?.retirement_rows)?result.retirement_rows:[];
    out.textContent=[
      "STORAGE RELIEF · 40.6.288 · RÉSULTAT",
      `État : ${safe(result?.status||"TERMINÉ")}`,
      `localStorage : ${fmt(before)} → ${fmt(after)} · libéré ${fmt(reclaimed)}`,
      "",
      ...retirement.map(row=>`- ${safe(row.key)} · ${safe(row.state)}`),
      "",
      "IndexedDB supprimé : NON · caches Market REVIEW_REQUIRED supprimés : NON · nettoyage automatique : NON."
    ].join("\n");
    if(badge)badge.textContent=`TERMINÉ · -${fmt(reclaimed)}`;
    return result;
  }

  function renderError(error){
    const message=safe(error?.message||error||"erreur");
    const out=document.getElementById("atlasStorageRelief288");
    const badge=document.getElementById("atlasStorageReliefState288");
    if(out)out.textContent="STORAGE RELIEF · 40.6.288 · ERREUR\n"+message+"\nAucun retrait automatique n'a été lancé.";
    if(badge)badge.textContent="ERREUR";
    state.lastError=message;
  }

  async function prepare(){
    if(state.preparing||state.executing)return state.lastPlan;
    state.preparing=true;state.lastError=null;
    const prepareBtn=document.getElementById("btnAtlasStorageReliefPrepare288");
    const execBtn=document.getElementById("btnAtlasStorageReliefExecute288");
    if(prepareBtn)prepareBtn.disabled=true;
    if(execBtn)execBtn.disabled=true;
    const badge=document.getElementById("atlasStorageReliefState288");
    if(badge)badge.textContent="VÉRIFICATION SHA-256…";
    try{
      const a=await waitCanonicalReady();
      if(typeof a.relief?.copyTargets!=="function"||typeof a.guarded?.plan!=="function")throw new Error("API Storage Relief canonique incomplète");

      // Non-destructive preparation: copy/verify canonical targets in IndexedDB.
      // No localStorage removal happens here.
      await a.relief.copyTargets();
      const plan=await a.guarded.plan();
      const rows=exactTargets(plan);
      if(rows.length!==TARGETS.length)throw new Error(`Plan incomplet : ${rows.length}/${TARGETS.length} cible(s)`);
      state.lastPlan=plan;
      state.prepared=true;
      state.preparedAt=new Date().toISOString();
      renderPlan(plan,"VÉRIFIÉ");
      try{window.dispatchEvent(new CustomEvent("agent-crypto:storage-relief-288-prepared",{detail:{build:BUILD,reclaimable_keys:Number(plan?.reclaimable_keys)||0,reclaimable_bytes:Number(plan?.reclaimable_bytes)||0}}));}catch(_){}
      return plan;
    }catch(error){
      state.prepared=false;
      renderError(error);
      throw error;
    }finally{
      state.preparing=false;
      if(prepareBtn)prepareBtn.disabled=false;
    }
  }

  async function execute(){
    if(state.executing)return state.lastResult;
    if(!state.prepared)await prepare();
    state.executing=true;state.lastError=null;
    const prepareBtn=document.getElementById("btnAtlasStorageReliefPrepare288");
    const execBtn=document.getElementById("btnAtlasStorageReliefExecute288");
    if(prepareBtn)prepareBtn.disabled=true;
    if(execBtn)execBtn.disabled=true;
    const badge=document.getElementById("atlasStorageReliefState288");
    if(badge)badge.textContent="BACKUP + CONFIRMATION…";
    try{
      const a=await waitCanonicalReady();
      if(typeof a.backup?.exportBackup!=="function")throw new Error("Export backup localStorage indisponible");
      if(typeof a.guarded?.run!=="function")throw new Error("Relief canonique 40.3.91 indisponible");

      // Explicit operator click: export full backup first.
      a.backup.exportBackup();

      // Canonical flow re-verifies copies and displays browser confirmation
      // before any verified localStorage copy is removed.
      const result=await a.guarded.run();
      state.lastResult=result||null;
      if(result?.status==="ANNULÉ PAR OPÉRATEUR"){
        renderPlan(state.lastPlan,"ANNULÉ · AUCUN RETRAIT");
        return result;
      }
      state.completedAt=new Date().toISOString();
      if(result)renderResult(result);

      // Refresh the read-only .287 report after the controlled relief.
      try{await a.audit?.audit?.();}catch(_){}
      try{window.dispatchEvent(new CustomEvent("agent-crypto:storage-relief-288-complete",{detail:{build:BUILD,reclaimed_bytes:Number(result?.reclaimed_bytes)||0}}));}catch(_){}
      return result;
    }catch(error){
      renderError(error);
      throw error;
    }finally{
      state.executing=false;
      if(prepareBtn)prepareBtn.disabled=false;
      const plan=state.lastPlan;
      const reclaimable=Array.isArray(plan?.targets)?plan.targets.filter(row=>TARGETS.includes(String(row?.key||""))&&row.local_present&&row.sha256_verified).length:0;
      if(execBtn)execBtn.disabled=reclaimable===0;
    }
  }

  function mount(){
    const host=document.getElementById("atlasStorageHealth");
    if(!host)return false;
    if(document.getElementById("atlasStorageRelief288")){state.mounted=true;return true;}

    const card=document.createElement("section");
    card.id="atlasStorageReliefCard288";
    card.className="atlas-storage-health";
    card.dataset.storageRelief288="1";
    card.innerHTML=`
      <div class="atlas-storage-health-head">
        <div>
          <strong>Relief contrôlé · 40.6.288</strong>
          <span>Deux copies locales actives seulement · IndexedDB + SHA-256 + confirmation</span>
        </div>
        <span class="atlas-storage-health-state" id="atlasStorageReliefState288">DORMANT</span>
      </div>
      <div class="atlas-storage-health-actions">
        <button type="button" id="btnAtlasStorageReliefPrepare288">1 · Préparer / vérifier .288</button>
        <button type="button" id="btnAtlasStorageReliefExecute288" disabled>2 · Sauvegarder + alléger .288</button>
      </div>
      <pre class="atlas-storage-health-list" id="atlasStorageRelief288">40.6.288 · EN ATTENTE. Étape 1 vérifie les copies IndexedDB sans supprimer localStorage. Étape 2 exporte un backup complet puis demande confirmation avant tout retrait vérifié.</pre>
      <p class="muted-line">Périmètre fermé : scanner archive + gros cache graphique. Les caches Market anciens restent REVIEW_REQUIRED.</p>
    `;

    const anchor=document.getElementById("atlasStorageOwnership287")?.parentElement || document.getElementById("atlasStorageHealth");
    anchor?.insertAdjacentElement("afterend",card);

    document.getElementById("btnAtlasStorageReliefPrepare288")?.addEventListener("click",()=>void prepare());
    document.getElementById("btnAtlasStorageReliefExecute288")?.addEventListener("click",()=>void execute());
    state.mounted=true;
    return true;
  }

  function remount(){try{mount();}catch(_){}}
  remount();
  window.addEventListener("erith:system-hydrated",remount,{passive:true});
  window.addEventListener("pageshow",remount,{passive:true});

  globalThis.AgentCryptoStorageReliefControlled406288=Object.freeze({
    build:BUILD,
    targets:TARGETS,
    mount,
    prepare,
    execute,
    snapshot:()=>Object.freeze({
      build:BUILD,
      mounted:state.mounted,
      prepared:state.prepared,
      preparing:state.preparing,
      executing:state.executing,
      prepared_at:state.preparedAt,
      completed_at:state.completedAt,
      last_error:state.lastError,
      reclaimable_keys:Number(state.lastPlan?.reclaimable_keys)||0,
      reclaimable_bytes:Number(state.lastPlan?.reclaimable_bytes)||0,
      reclaimed_bytes:Number(state.lastResult?.reclaimed_bytes)||0
    }),
    operator_triggered_only:true,
    full_backup_before_retirement:true,
    browser_confirmation_required:true,
    generic_cleanup:false,
    review_required_market_keys_touched:false,
    indexeddb_delete:false,
    indexeddb_clear:false,
    indexeddb_schema_change:false,
    automatic_cleanup:false,
    recurring_timer:false,
    mutation_observer:false,
    network:false,
    trading:false,
    real_order:false
  });
})();