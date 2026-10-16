/* Agent-Crypto @erith.IA — 40.6.487 ORACLE EVIDENCE EXISTING BRIDGE INTEGRATION
   Supersedes the uninstalled 40.6.483 standalone 8791 transport.
   Reuses the proven 40.6.482 chunk foundation and the established authenticated
   Atlas-10 Crypto Bridge on 127.0.0.1:8787.
   No GitHub credential enters browser JavaScript. No local Evidence is deleted. */
(()=>{
  "use strict";

  const BUILD="40.6.487";
  const BRIDGE_BASE="http://127.0.0.1:8787";
  const STATUS_PATH="/oracle-evidence/status";
  const INGEST_PATH="/oracle-evidence/ingest";
  const BRIDGE_TOKEN_KEY="agent_crypto_bridge_auth_40375_token";
  const CHUNK_ROWS=500;
  const INGEST_TIMEOUT_MS=300000;
  const ARCHIVE_LOCK_KEY="__ATLAS_ORACLE_EVIDENCE_ARCHIVE_LOCK__";

  function archiveLockOwner(){
    const lock=globalThis[ARCHIVE_LOCK_KEY];
    return lock&&typeof lock==="object"?String(lock.owner||""):"";
  }

  function acquireArchiveLock(owner){
    const current=archiveLockOwner();
    if(current&&current!==owner) throw new Error("Archivage Oracle Evidence déjà actif · "+current);
    globalThis[ARCHIVE_LOCK_KEY]=Object.freeze({owner:String(owner),since:Date.now()});
  }

  function releaseArchiveLock(owner){
    const current=archiveLockOwner();
    if(current===owner){
      try{delete globalThis[ARCHIVE_LOCK_KEY];}
      catch(_){globalThis[ARCHIVE_LOCK_KEY]=null;}
    }
  }

  const state={
    mounted:false,
    action:"IDLE",
    error:null,
    bridge:null,
    ingest:null,
    published:null
  };

  function foundation(){
    const api=globalThis.AtlasOracleEvidenceTieredStorageFoundation406482;
    if(!api?.prepare_next_chunk||!api?.count_local_rows||!api?.load_manifest||!api?.verify_cold_chunk){
      throw new Error("Fondation Oracle Evidence 40.6.482 indisponible");
    }
    return api;
  }

  function bridgeToken(){
    try{return String(sessionStorage.getItem(BRIDGE_TOKEN_KEY)||"").trim();}
    catch(_){return "";}
  }

  function requireBridgeAuth(){
    try{
      if(typeof globalThis.atlasAccessOpen==="function") globalThis.atlasAccessOpen("#local-ai-hub");
    }catch(_){}
  }

  function setState(action,error=null){
    state.action=String(action||"IDLE");
    state.error=error?String(error?.message||error):null;
    render();
  }

  async function bridgeJson(path,options={}){
    const token=bridgeToken();
    if(!token){
      requireBridgeAuth();
      const err=new Error("AUTH BRIDGE REQUISE · ouvre Administration / Aether Trust");
      err.code="BRIDGE_AUTH_REQUIRED";
      throw err;
    }
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),Number(options.timeout_ms)||10000);
    try{
      const response=await fetch(BRIDGE_BASE+path,{
        method:options.method||"GET",
        mode:"cors",
        cache:"no-store",
        credentials:"omit",
        referrerPolicy:"no-referrer",
        signal:controller.signal,
        headers:{
          "Accept":"application/json",
          "Authorization":"Bearer "+token,
          ...(options.body?{"Content-Type":"application/json; charset=utf-8"}:{})
        },
        body:options.body?JSON.stringify(options.body):undefined
      });
      let payload={};
      try{payload=await response.json();}catch(_){payload={};}
      if(response.status===401||response.status===403){
        requireBridgeAuth();
        const err=new Error(String(payload?.error||"AUTH BRIDGE REQUISE"));
        err.code="BRIDGE_AUTH_REQUIRED";
        throw err;
      }
      if(!response.ok||payload?.ok===false){
        throw new Error(String(payload?.error||("Bridge HTTP "+response.status)));
      }
      return payload;
    }finally{
      clearTimeout(timer);
    }
  }

  async function testBridge(){
    setState("BRIDGE_8787_CHECK");
    try{
      const payload=await bridgeJson(STATUS_PATH,{timeout_ms:7000});
      state.bridge=Object.freeze({
        ready:payload?.enabled===true,
        version:String(payload?.bridge_version||""),
        credential_ready:payload?.credential_ready===true,
        credential_mode:String(payload?.credential_mode||""),
        repository:String(payload?.repository||""),
        branch:String(payload?.branch||""),
        archived_rows:Number(payload?.archived_rows||0),
        chunks:Number(payload?.chunks||0),
        verified_chunks:Number(payload?.verified_chunks||0)
      });
      if(state.bridge.version!=="1.9.13") throw new Error("Bridge V1.9.13 requis");
      if(!state.bridge.ready) throw new Error("Bridge Oracle Evidence désactivé · enabled=false");
      if(!state.bridge.credential_ready) throw new Error("Credential GitHub local absent dans le Bridge");
      setState("BRIDGE_8787_READY");
      return state.bridge;
    }catch(error){
      state.bridge=null;
      setState(error?.code==="BRIDGE_AUTH_REQUIRED"?"AUTH_BRIDGE_REQUISE":"BRIDGE_8787_ERROR",error);
      throw error;
    }
  }

  async function ingestNext500(){
    const owner="manual-40.6.487";
    acquireArchiveLock(owner);
    const base=foundation();
    setState("PREPARE_500");
    try{
      const before=await base.count_local_rows();
      const bridge=await testBridge();
      if(!bridge?.ready) throw new Error("Bridge Oracle Evidence désactivé");
      if(!bridge?.credential_ready) throw new Error("Credential GitHub local absent dans le Bridge");
      if(Number(bridge.archived_rows||0)>0){
        throw new Error("Archivage manuel 500 désactivé après bootstrap · utilise Archivage froid automatique");
      }
      const bundle=await base.prepare_next_chunk({limit:CHUNK_ROWS});
      if(!bundle?.chunk||!bundle?.jsonl) throw new Error("Aucun lot Oracle Evidence à ingérer");
      setState("BRIDGE_8787_INGESTING");
      const result=await bridgeJson(INGEST_PATH,{method:"POST",body:bundle,timeout_ms:INGEST_TIMEOUT_MS});
      if(String(result?.status||"").toUpperCase()!=="VERIFIED") throw new Error("Le Bridge n'a pas retourné VERIFIED");
      if(String(result.relative_path||"")!==String(bundle.chunk.relative_path||"")) throw new Error("Chemin froid divergent");
      if(String(result.sha256||"")!==String(bundle.chunk.sha256||"")) throw new Error("SHA-256 froid divergent");
      if(Number(result.row_count)!==Number(bundle.chunk.row_count)) throw new Error("row_count froid divergent");
      if(result.local_rows_deleted!==false||result.local_retention_allowed!==false) throw new Error("Verrou de rétention locale invalide");
      const after=await base.count_local_rows();
      if(Number(after)<Number(before)) throw new Error("Invariant violé : le compteur Evidence local a diminué");
      state.ingest=Object.freeze({
        status:"VERIFIED",
        relative_path:String(result.relative_path),
        sha256:String(result.sha256),
        row_count:Number(result.row_count),
        write_commit:String(result.write_commit||""),
        verify_commit:String(result.verify_commit||""),
        idempotent:result.idempotent===true,
        local_before:Number(before),
        local_after:Number(after)
      });
      setState("BRIDGE_8787_INGEST_VERIFIED");
      return state.ingest;
    }catch(error){
      setState(error?.code==="BRIDGE_AUTH_REQUIRED"?"AUTH_BRIDGE_REQUISE":"BRIDGE_8787_INGEST_ERROR",error);
      throw error;
    }finally{
      releaseArchiveLock(owner);
    }
  }

  function verifiedEntry(manifest){
    const chunks=Array.isArray(manifest?.chunks)?manifest.chunks:[];
    const rows=chunks.filter(x=>String(x?.status||"").toUpperCase()==="VERIFIED");
    return rows.length?rows[rows.length-1]:null;
  }

  function exactExpectedReceipt(){
    if(state.ingest?.relative_path) return state.ingest;
    try{
      const queue=globalThis.AtlasOracleEvidenceAutoArchive406487?.state?.();
      if(queue?.last_verified?.relative_path) return queue.last_verified;
    }catch(_){}
    return null;
  }

  async function verifyPublishedLatest(){
    const base=foundation();
    setState("PUBLISHED_VERIFY_LOADING");
    try{
      const expected=exactExpectedReceipt();
      if(!expected) throw new Error("Aucun reçu exact à vérifier dans cette session");
      const manifest=await base.load_manifest();
      const chunks=Array.isArray(manifest?.chunks)?manifest.chunks:[];
      const entry=chunks.find(x=>String(x?.relative_path||"")===String(expected.relative_path||""));
      if(!entry) throw new Error("Le chunk exact n'est pas encore publié dans le manifest public");
      if(String(entry.status||"").toUpperCase()!=="VERIFIED") throw new Error("Le chunk exact publié n'est pas VERIFIED");
      if(String(entry.sha256||"")!==String(expected.sha256||"")) throw new Error("SHA-256 du reçu exact divergent");
      if(Number(entry.row_count)!==Number(expected.row_count)) throw new Error("row_count du reçu exact divergent");
      const proof=await base.verify_cold_chunk(entry.relative_path,{sha256:expected.sha256,row_count:expected.row_count});
      if(proof?.verified!==true) throw new Error("Vérification publique du reçu exact échouée");
      state.published=Object.freeze({
        verified:true,
        exact_receipt:true,
        relative_path:String(entry.relative_path||""),
        sha256:String(proof.sha256||""),
        row_count:Number(proof.row_count||0)
      });
      setState("PUBLISHED_EXACT_VERIFY_PASS");
      return state.published;
    }catch(error){
      state.published=null;
      setState("PUBLISHED_VERIFY_ERROR",error);
      throw error;
    }
  }

  function snapshot(){
    return Object.freeze({
      build:BUILD,
      transport:"EXISTING_ATLAS10_BRIDGE_8787",
      bridge_base:BRIDGE_BASE,
      bridge_version_required:"1.9.13",
      ingest_timeout_ms:INGEST_TIMEOUT_MS,
      backend_8790_modified:false,
      standalone_8791_superseded:true,
      action:state.action,
      error:state.error,
      bridge:state.bridge,
      ingest:state.ingest,
      published:state.published,
      local_retention_allowed:false,
      local_delete_api_exposed:false,
      browser_github_write:false,
      github_token_in_browser:false,
      automatic_upload:false,
      operator_triggered:true,
      storage_schema_changed:false,
      oracle_math_changed:false,
      strategy_a_changed:false,
      market_core_changed:false,
      real_order:false,
      recurring_timer:false,
      observer:false
    });
  }

  function ensurePanel(){
    if(document.getElementById("oracleEvidenceExistingBridge406484")) return true;
    const cold=document.getElementById("oracleEvidenceColdArchive406482");
    const root=document.getElementById("oracle-evidence-explorer");
    if(!cold&&!root) return false;
    const panel=document.createElement("section");
    panel.id="oracleEvidenceExistingBridge406484";
    panel.setAttribute("aria-label","Oracle Evidence via Bridge existant 8787 · 40.6.487");
    panel.style.cssText="margin:8px 0 12px;padding:10px 12px;border:1px solid rgba(103,255,190,.24);border-radius:10px;background:rgba(6,24,25,.72);display:grid;gap:8px";
    panel.innerHTML=
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">'+
        '<div><strong style="color:#8fffd0">MÉMOIRE FROIDE · BRIDGE EXISTANT 8787 · 40.6.487</strong><br>'+
        '<small>Atlas-10 Bridge V1.9.13 · session Administrator · GitHub froid · zéro purge locale</small></div>'+
        '<span id="oracleBridge484State" style="font-weight:800">IDLE</span>'+
      '</div>'+
      '<div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px">'+
        '<span>Bridge <b id="oracleBridge484Health">NON TESTÉ</b></span>'+
        '<span>GitHub local <b id="oracleBridge484Credential">—</b></span>'+
        '<span>Ingest <b id="oracleBridge484Ingest">—</b></span>'+
        '<span>Publié <b id="oracleBridge484Published">—</b></span>'+
      '</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        '<button type="button" id="btnOracleBridge484Health">Tester Bridge 8787</button>'+
        '<button type="button" id="btnOracleBridge484Ingest">Envoyer 500 Evidence</button>'+
        '<button type="button" id="btnOracleBridge484Verify">Vérifier dernier chunk publié</button>'+
      '</div>'+
      '<small id="oracleBridge484Note">40.6.487 : archivage manuel de masse désactivé ; file automatique + reçu public exact. Aucune Evidence locale ne peut être supprimée.</small>';
    if(cold?.parentNode) cold.parentNode.insertBefore(panel,cold.nextSibling); else root.prepend(panel);
    document.getElementById("btnOracleBridge484Health")?.addEventListener("click",()=>void testBridge().catch(()=>{}));
    document.getElementById("btnOracleBridge484Ingest")?.addEventListener("click",()=>void ingestNext500().catch(()=>{}));
    document.getElementById("btnOracleBridge484Verify")?.addEventListener("click",()=>void verifyPublishedLatest().catch(()=>{}));
    state.mounted=true;
    render();
    return true;
  }

  function render(){
    const snap=snapshot();
    const set=(id,value)=>{const n=document.getElementById(id);if(n)n.textContent=String(value);};
    set("oracleBridge484State",snap.error?"ERREUR":snap.action);
    set("oracleBridge484Health",snap.bridge?.ready?("READY · V"+snap.bridge.version):(snap.action==="AUTH_BRIDGE_REQUISE"?"AUTH REQUISE":"NON TESTÉ"));
    set("oracleBridge484Credential",snap.bridge?snap.bridge.credential_ready?"PRÊT":"ABSENT":"—");
    set("oracleBridge484Ingest",snap.ingest?(String(snap.ingest.row_count)+" · VERIFIED"):"—");
    set("oracleBridge484Published",snap.published?.verified?"VERIFIED":"—");
    const note=document.getElementById("oracleBridge484Note");
    if(note){
      note.textContent=snap.error
        ? ("Erreur · "+snap.error)
        : snap.ingest
          ? (String(snap.ingest.row_count)+" Evidence · SHA-256 "+snap.ingest.sha256.slice(0,16)+"… · local "+String(snap.ingest.local_before)+" → "+String(snap.ingest.local_after)+" · aucune purge")
          : "40.6.487 attend Bridge V1.9.13 : timeout GitHub durci + relecture large-file via Git Blob. Aucune Evidence locale ne peut être supprimée.";
    }
  }

  function mount(){return ensurePanel();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
  window.addEventListener("agent-crypto:postboot-runtime-ready",mount,{once:true});

  globalThis.AtlasOracleEvidenceExistingBridge406484=Object.freeze({
    build:BUILD,
    role:"EXISTING_AUTHENTICATED_BRIDGE_8787_COLD_INGEST",
    bridge_base:BRIDGE_BASE,
    test_bridge:testBridge,
    ingest_next_500:ingestNext500,
    verify_published_latest:verifyPublishedLatest,
    mount,
    state:snapshot,
    backend_8790_modified:false,
    standalone_8791_superseded:true,
    local_retention_allowed:false,
    local_delete_api_exposed:false,
    browser_github_write:false,
    github_token_in_browser:false,
    automatic_upload:false,
    operator_triggered:true,
    storage_schema_changed:false,
    oracle_math_changed:false,
    strategy_a_changed:false,
    market_core_changed:false,
    real_order:false,
    recurring_timer:false,
    observer:false
  });
})();