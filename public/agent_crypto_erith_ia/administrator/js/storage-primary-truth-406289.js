/* Agent-Crypto Administrator — 40.6.289
   STORAGE PRIMARY TRUTH · FINAL THREAD HANDOFF
   Proven cause:
   - scanner archive + chart cache are ASYNC PRIMARY IndexedDB keys.
   - primary writes stop refreshing preserved localStorage backups.
   - therefore local != IndexedDB is expected after new writes.
   - legacy 40.3.91 plan required equality and safe-blocked .288.
   - canonical retireVerified already has the correct IDB-primary branch.
   Operator only. No schema change. No generic cleanup. */
(()=>{
  "use strict";
  if(globalThis.AgentCryptoStoragePrimaryTruth406289)return;

  const BUILD="40.6.289";
  const TARGETS=Object.freeze([
    "agent_crypto_scanner_live_archive_v1",
    "agent_crypto_erith_ia_real_charts_v1_1_alpha_26_37_top50"
  ]);
  const state={mounted:false,plan:null,result:null,error:null};

  const size=v=>{try{return new Blob([String(v??"")]).size;}catch(_){return String(v??"").length*2;}};
  const fmt=n=>{const v=Math.max(0,Number(n)||0);return v<1024?v+" B":v<1048576?(v/1024).toFixed(1)+" KiB":(v/1048576).toFixed(2)+" MiB";};
  const shape=raw=>{
    if(raw==null)return {ok:false,type:"absent",count:null};
    try{const v=JSON.parse(String(raw));if(Array.isArray(v))return {ok:true,type:"array",count:v.length};if(v&&typeof v==="object")return {ok:true,type:"object",count:Object.keys(v).length};return {ok:true,type:typeof v,count:null};}
    catch(_){return {ok:false,type:"text",count:null};}
  };
  const api=()=>({relief:globalThis.AtlasStorageRelief40278||null,backup:globalThis.AtlasStorageRetirement||null,audit:globalThis.AgentCryptoStorageOwnershipAudit406287||null});
  const snapshot=()=>{let count=0,total=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k==null)continue;let v="";try{v=localStorage.getItem(k)??"";}catch(_){}count++;total+=size(k)+size(v);}return {count,bytes:total};};

  function renderPlan(plan){
    const box=document.getElementById("atlasStoragePrimaryTruth289");
    const badge=document.getElementById("atlasStoragePrimaryTruthState289");
    if(!box)return;
    const candidates=plan.rows.filter(r=>r.retireable);
    const reclaim=candidates.reduce((s,r)=>s+r.local_bytes,0);
    const lines=["À RETENIR",plan.all_primary_verified?"IndexedDB PRIMARY vérifié. Les différences avec localStorage sont des sauvegardes figées attendues.":"STOP : PRIMARY IndexedDB non suffisamment vérifié.",""];
    for(const r of plan.rows){
      lines.push(r.label);
      lines.push("  localStorage : "+(r.local_present?fmt(r.local_bytes):"ABSENT")+" · "+r.local_shape.type+(r.local_shape.count!=null?" ("+r.local_shape.count+")":""));
      lines.push("  IndexedDB PRIMARY : "+fmt(r.primary_bytes)+" · "+r.primary_shape.type+(r.primary_shape.count!=null?" ("+r.primary_shape.count+")":""));
      lines.push("  identiques : "+(r.exact?"OUI":"NON — normal après activation PRIMARY"));
      lines.push("  preuve PRIMARY : "+(r.primary_verified?"VÉRIFIÉE":"NON"));
      lines.push("  décision : "+(r.retireable?"COPIE LOCALE RETIRABLE après backup + confirmation":"BLOQUÉE"));
      lines.push("");
    }
    lines.push("Copies retirables : "+candidates.length+"/"+plan.rows.length+" · environ "+fmt(reclaim));
    lines.push("Market REVIEW_REQUIRED, IndexedDB et Evidence : NON TOUCHÉS.");
    box.textContent=lines.join("\n");
    if(badge)badge.textContent="PRIMARY TRUTH · "+candidates.length+"/"+plan.rows.length+" · "+fmt(reclaim);
    const b=document.getElementById("btnAtlasStoragePrimaryRetire289");if(b)b.disabled=!plan.all_primary_verified||!candidates.length;
  }

  async function prepare(){
    const a=api();
    if(!a.relief?.ready||typeof a.relief.copyTargets!=="function"||typeof a.relief.readSync!=="function")throw new Error("Storage Relief canonique indisponible");
    try{await a.relief.ready;}catch(_){}
    const copy=await a.relief.copyTargets();
    const copyRows=Array.isArray(copy?.rows)?copy.rows:[];
    const primaryKeys=new Set(Array.isArray(a.relief.async_primary_keys)?a.relief.async_primary_keys:[]);
    const rows=[];
    for(const key of TARGETS){
      const localRaw=localStorage.getItem(key);
      const primaryRaw=a.relief.readSync(key);
      const cr=copyRows.find(x=>String(x?.key||"")===key)||null;
      const verified=primaryKeys.has(key)&&/VÉRIFIÉ\s*·\s*IDB PRIMARY/i.test(String(cr?.state||""));
      const ps=shape(primaryRaw);
      rows.push({
        key,
        label:key.includes("scanner")?"Scanner archive actif":"Cache graphique actif",
        local_present:localRaw!==null,
        local_bytes:localRaw===null?0:size(localRaw),
        primary_bytes:primaryRaw==null?0:size(primaryRaw),
        local_shape:shape(localRaw),
        primary_shape:ps,
        exact:localRaw!==null&&primaryRaw!==null&&String(localRaw)===String(primaryRaw),
        primary_verified:verified,
        retireable:localRaw!==null&&verified&&ps.ok
      });
    }
    const plan={build:BUILD,root_cause:"ASYNC_PRIMARY_EXPECTED_DIVERGENCE",rows,all_primary_verified:rows.every(r=>r.primary_verified&&r.primary_shape.ok),local_before:snapshot()};
    state.plan=plan;renderPlan(plan);return plan;
  }

  async function retire(){
    if(!state.plan)await prepare();
    const plan=state.plan;
    const candidates=plan.rows.filter(r=>r.retireable);
    if(!plan.all_primary_verified||!candidates.length)throw new Error("STOP : aucune copie locale prouvée retirable");
    const a=api();
    if(typeof a.backup?.exportBackup!=="function"||typeof a.relief?.retireVerified!=="function")throw new Error("API canonique incomplète");
    a.backup.exportBackup();
    const reclaim=candidates.reduce((s,r)=>s+r.local_bytes,0);
    const ok=window.confirm("40.6.289 · PRIMARY IndexedDB vérifié. Retirer uniquement "+candidates.length+" ancienne(s) copie(s) localStorage (~"+fmt(reclaim)+") ? Backup complet exporté. IndexedDB/Market/Evidence conservés.");
    if(!ok)return {status:"ANNULÉ PAR OPÉRATEUR"};
    const before=snapshot();
    const retired=await a.relief.retireVerified();
    const rr=Array.isArray(retired?.rows)?retired.rows:[];
    const rows=TARGETS.map(key=>{const item=rr.find(x=>String(x?.key||"")===key)||{state:"NON RAPPORTÉ"};return {key,state:String(item.state||""),local_absent:localStorage.getItem(key)===null,read_after_ok:shape(a.relief.readSync(key)).ok};});
    const after=snapshot();
    const result={build:BUILD,status:"TERMINÉ",before,after,reclaimed_bytes:Math.max(0,before.bytes-after.bytes),rows,completed_at:new Date().toISOString()};
    state.result=result;
    const box=document.getElementById("atlasStoragePrimaryTruth289");
    const badge=document.getElementById("atlasStoragePrimaryTruthState289");
    if(box)box.textContent=["TERMINÉ · 40.6.289","localStorage : "+fmt(before.bytes)+" → "+fmt(after.bytes)+" · libéré "+fmt(result.reclaimed_bytes),"",...rows.map(r=>"- "+r.key+" · "+r.state+" · lecture PRIMARY après retrait : "+(r.read_after_ok?"OK":"À VÉRIFIER")),"","IndexedDB conservé. Market REVIEW_REQUIRED conservé."].join("\n");
    if(badge)badge.textContent="TERMINÉ · -"+fmt(result.reclaimed_bytes);
    try{await a.audit?.audit?.();}catch(_){}
    return result;
  }

  function mount(){
    const host=document.getElementById("atlasStorageHealth");if(!host)return false;
    if(document.getElementById("atlasStoragePrimaryTruth289")){state.mounted=true;return true;}
    const old=document.getElementById("atlasStorageReliefCard288");if(old){old.hidden=true;old.style.display="none";}
    const card=document.createElement("section");
    card.id="atlasStoragePrimaryTruthCard289";
    card.className="atlas-storage-health";
    card.style.cssText="font-size:15px;line-height:1.55;border:2px solid currentColor;padding:14px;margin-top:16px";
    card.innerHTML='<div class="atlas-storage-health-head" style="font-size:16px"><div><strong>Storage Primary Truth · 40.6.289</strong><span>Comprendre d’abord. Retirer seulement une ancienne copie locale après preuve PRIMARY.</span></div><span class="atlas-storage-health-state" id="atlasStoragePrimaryTruthState289">DORMANT</span></div><div class="atlas-storage-health-actions" style="margin:12px 0;gap:10px"><button type="button" id="btnAtlasStoragePrimaryPrepare289" style="font-size:15px;padding:9px 14px">1 · Comprendre / vérifier</button><button type="button" id="btnAtlasStoragePrimaryRetire289" style="font-size:15px;padding:9px 14px" disabled>2 · Backup + retirer copies locales</button></div><pre id="atlasStoragePrimaryTruth289" class="atlas-storage-health-list" style="font-size:14px;line-height:1.55;white-space:pre-wrap">À RETENIR\nClique d’abord sur « 1 · Comprendre / vérifier ». Aucun retrait à cette étape.</pre><p class="muted-line" style="font-size:14px">Cause prouvée : en mode IndexedDB PRIMARY, localStorage reste une sauvegarde figée. Une différence local ≠ IndexedDB est attendue.</p>';
    const anchor=document.getElementById("atlasStorageReliefCard288")||document.getElementById("atlasStorageOwnership287")?.parentElement||host;
    anchor.insertAdjacentElement("afterend",card);
    document.getElementById("btnAtlasStoragePrimaryPrepare289")?.addEventListener("click",async e=>{e.currentTarget.disabled=true;try{await prepare();}catch(err){state.error=String(err?.message||err);document.getElementById("atlasStoragePrimaryTruth289").textContent="STOP · "+state.error;}finally{e.currentTarget.disabled=false;}});
    document.getElementById("btnAtlasStoragePrimaryRetire289")?.addEventListener("click",async e=>{e.currentTarget.disabled=true;try{await retire();}catch(err){state.error=String(err?.message||err);document.getElementById("atlasStoragePrimaryTruth289").textContent="STOP · "+state.error;}finally{e.currentTarget.disabled=false;}});
    state.mounted=true;return true;
  }
  const remount=()=>{try{mount();}catch(_){}};
  remount();
  window.addEventListener("erith:system-hydrated",remount,{passive:true});
  window.addEventListener("pageshow",remount,{passive:true});

  globalThis.AgentCryptoStoragePrimaryTruth406289=Object.freeze({
    build:BUILD,targets:TARGETS,prepare,retire,mount,
    snapshot:()=>Object.freeze({build:BUILD,mounted:state.mounted,prepared:!!state.plan,all_primary_verified:state.plan?.all_primary_verified??null,reclaimed_bytes:state.result?.reclaimed_bytes??null,error:state.error}),
    root_cause:"ASYNC_PRIMARY_EXPECTED_DIVERGENCE",operator_only:true,backup_required:true,confirmation_required:true,
    generic_cleanup:false,market_review_required_touched:false,indexeddb_delete:false,indexeddb_clear:false,automatic_cleanup:false,
    recurring_timer:false,mutation_observer:false,network:false,trading:false,real_order:false
  });
})();