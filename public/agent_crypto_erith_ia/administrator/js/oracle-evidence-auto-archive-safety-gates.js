/* Agent-Crypto @erith.IA — 40.6.491 ORACLE EVIDENCE AUTO ARCHIVE SINGLE-FLIGHT + WATERMARK PROGRESS
   Automatic sequential cold archive with exact-receipt proof.
   Fixed target at start. One chunk in flight. VERIFIED before next.
   Pause/Stop only after current chunk. No local deletion. */
(()=>{
  "use strict";

  const BUILD="40.6.491";
  const SOURCE_BUILD="40.6.482";
  const BRIDGE_BASE="http://127.0.0.1:8787";
  const STATUS_PATH="/oracle-evidence/status";
  const INGEST_PATH="/oracle-evidence/ingest";
  const BRIDGE_TOKEN_KEY="agent_crypto_bridge_auth_40375_token";
  const ARCHIVE_LOCK_KEY="__ATLAS_ORACLE_EVIDENCE_ARCHIVE_LOCK__";
  const AUTO_LOCK_OWNER="auto-40.6.491";
  const CHUNK_ROWS=500;
  const MAX_ROWS=1000;
  const REQUEST_TIMEOUT_MS=300000;

  const state={
    mounted:false,
    action:"IDLE",
    error:null,
    running:false,
    starting:false,
    paused:false,
    pause_requested:false,
    stop_requested:false,
    watermark:null,
    target_watermark:null,
    starting_local_rows:0,
    starting_archived_rows:0,
    pending_at_start:0,
    rows_done:0,
    chunks_done:0,
    current_chunk:null,
    last_verified:null,
    final_public:null,
    started_at:null,
    finished_at:null
  };

  function evidenceApi(){
    const api=globalThis.AtlasOracleEvidence;
    if(!api?.database||!api?.store) throw new Error("AtlasOracleEvidence indisponible");
    return api;
  }

  function foundation(){
    const api=globalThis.AtlasOracleEvidenceTieredStorageFoundation406482;
    if(!api?.load_manifest||!api?.verify_cold_chunk) throw new Error("Fondation Oracle Evidence 40.6.482 indisponible");
    return api;
  }

  function archiveLockOwner(){
    const lock=globalThis[ARCHIVE_LOCK_KEY];
    return lock&&typeof lock==="object"?String(lock.owner||""):"";
  }

  function acquireArchiveLock(){
    const current=archiveLockOwner();
    if(current&&current!==AUTO_LOCK_OWNER) throw new Error("Archivage Oracle Evidence déjà actif · "+current);
    globalThis[ARCHIVE_LOCK_KEY]=Object.freeze({owner:AUTO_LOCK_OWNER,since:Date.now()});
  }

  function releaseArchiveLock(){
    if(archiveLockOwner()===AUTO_LOCK_OWNER){
      try{delete globalThis[ARCHIVE_LOCK_KEY];}
      catch(_){globalThis[ARCHIVE_LOCK_KEY]=null;}
    }
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

  function setAction(action,error=null){
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
    const timer=setTimeout(()=>controller.abort(),Number(options.timeout_ms)||REQUEST_TIMEOUT_MS);
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
      if(!response.ok||payload?.ok===false) throw new Error(String(payload?.error||("Bridge HTTP "+response.status)));
      return payload;
    }finally{
      clearTimeout(timer);
    }
  }

  function openDb(){
    return new Promise((resolve,reject)=>{
      const api=evidenceApi();
      const request=indexedDB.open(api.database);
      let settled=false;
      request.onupgradeneeded=()=>{
        try{request.transaction?.abort();}catch(_){}
        if(!settled){settled=true;reject(new Error("Oracle Evidence IndexedDB absent — aucune création autorisée"));}
      };
      request.onsuccess=()=>{
        if(settled){try{request.result?.close?.();}catch(_){};return;}
        settled=true;resolve(request.result);
      };
      request.onerror=()=>{if(!settled){settled=true;reject(request.error||new Error("Ouverture Oracle Evidence refusée"));}};
      request.onblocked=()=>{if(!settled){settled=true;reject(new Error("Ouverture Oracle Evidence bloquée"));}};
    });
  }

  async function countLocalRows(){
    const api=evidenceApi();
    const db=await openDb();
    try{
      return await new Promise((resolve,reject)=>{
        const tx=db.transaction(api.store,"readonly");
        const req=tx.objectStore(api.store).count();
        req.onsuccess=()=>resolve(Number(req.result)||0);
        req.onerror=()=>reject(req.error||new Error("Count Oracle Evidence refusé"));
      });
    }finally{try{db.close();}catch(_){}}
  }

  function mark(value){
    if(!value||!Number.isFinite(Number(value.t0))) return null;
    return {t0:Number(value.t0),id:String(value.id||"")};
  }

  function compareMark(a,b){
    const aa=mark(a),bb=mark(b);
    if(!aa&&!bb) return 0;
    if(!aa) return -1;
    if(!bb) return 1;
    if(aa.t0<bb.t0) return -1;
    if(aa.t0>bb.t0) return 1;
    if(aa.id<bb.id) return -1;
    if(aa.id>bb.id) return 1;
    return 0;
  }

  async function latestLocalMark(){
    const api=evidenceApi();
    const db=await openDb();
    try{
      return await new Promise((resolve,reject)=>{
        const tx=db.transaction(api.store,"readonly");
        let index;
        try{index=tx.objectStore(api.store).index("t0");}
        catch(error){reject(error);return;}
        const req=index.openCursor(null,"prev");
        req.onsuccess=()=>{
          const cursor=req.result;
          if(!cursor){resolve(null);return;}
          resolve({t0:Number(cursor.key),id:String(cursor.primaryKey||"")});
        };
        req.onerror=()=>reject(req.error||new Error("Dernier watermark local indisponible"));
      });
    }finally{try{db.close();}catch(_){}}
  }

  async function countRowsAfter(watermark,target){
    const api=evidenceApi();
    const db=await openDb();
    const start=mark(watermark),end=mark(target);
    try{
      return await new Promise((resolve,reject)=>{
        let count=0;
        const tx=db.transaction(api.store,"readonly");
        let index;
        try{index=tx.objectStore(api.store).index("t0");}
        catch(error){reject(error);return;}
        const range=start?IDBKeyRange.lowerBound(start.t0):null;
        const req=index.openCursor(range,"next");
        req.onsuccess=()=>{
          const cursor=req.result;
          if(!cursor){resolve(count);return;}
          const current={t0:Number(cursor.key),id:String(cursor.primaryKey||"")};
          if(end&&compareMark(current,end)>0){resolve(count);return;}
          if(!start||compareMark(current,start)>0) count+=1;
          cursor.continue();
        };
        req.onerror=()=>reject(req.error||new Error("Count watermark Oracle Evidence refusé"));
        tx.onabort=()=>reject(tx.error||new Error("Count watermark Oracle Evidence annulé"));
      });
    }finally{try{db.close();}catch(_){}}
  }

  async function readRowsAfter(watermark,target,limit=CHUNK_ROWS){
    const bounded=Math.max(1,Math.min(MAX_ROWS,Number(limit)||CHUNK_ROWS));
    const api=evidenceApi();
    const db=await openDb();
    const start=mark(watermark),end=mark(target);
    try{
      return await new Promise((resolve,reject)=>{
        const rows=[];
        const tx=db.transaction(api.store,"readonly");
        let index;
        try{index=tx.objectStore(api.store).index("t0");}
        catch(error){reject(error);return;}
        const range=start?IDBKeyRange.lowerBound(start.t0):null;
        const req=index.openCursor(range,"next");
        req.onsuccess=()=>{
          const cursor=req.result;
          if(!cursor||rows.length>=bounded){resolve(rows);return;}
          const current={t0:Number(cursor.key),id:String(cursor.primaryKey||"")};
          if(end&&compareMark(current,end)>0){resolve(rows);return;}
          if(!start||compareMark(current,start)>0) rows.push(cursor.value);
          if(rows.length>=bounded){resolve(rows);return;}
          cursor.continue();
        };
        req.onerror=()=>reject(req.error||new Error("Cursor archive automatique refusé"));
        tx.onabort=()=>reject(tx.error||new Error("Lecture archive automatique annulée"));
      });
    }finally{try{db.close();}catch(_){}}
  }

  function canonicalJsonl(rows){
    const source=Array.isArray(rows)?rows:[];
    return source.map(row=>JSON.stringify(row)).join("\n")+(source.length?"\n":"");
  }

  async function sha256Hex(text){
    if(!globalThis.crypto?.subtle) throw new Error("SHA-256 WebCrypto indisponible");
    const bytes=new TextEncoder().encode(String(text||""));
    const digest=await crypto.subtle.digest("SHA-256",bytes);
    return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,"0")).join("");
  }

  function utcParts(ms){
    const d=new Date(Number(ms)||Date.now());
    return {
      year:String(d.getUTCFullYear()).padStart(4,"0"),
      month:String(d.getUTCMonth()+1).padStart(2,"0"),
      day:String(d.getUTCDate()).padStart(2,"0")
    };
  }

  async function makeBundle(rows){
    if(!Array.isArray(rows)||!rows.length) return null;
    const jsonl=canonicalJsonl(rows);
    const sha256=await sha256Hex(jsonl);
    const first=rows[0]||{},last=rows[rows.length-1]||{};
    const firstT0=Number(first.t0||0),lastT0=Number(last.t0||0);
    const date=utcParts(firstT0);
    const chunk=Object.freeze({
      schema:"agent_crypto_oracle_evidence_cold_chunk_v1",
      build:SOURCE_BUILD,
      payload_format:"jsonl",
      relative_path:date.year+"/"+date.month+"/"+date.day+"/evidence-"+firstT0+"-"+lastT0+"-"+rows.length+".jsonl",
      row_count:rows.length,
      first_t0:firstT0,
      last_t0:lastT0,
      first_id:String(first.id||""),
      last_id:String(last.id||""),
      sha256,
      source_database:evidenceApi().database,
      source_store:evidenceApi().store,
      watermark_after:Object.freeze({t0:lastT0,id:String(last.id||"")}),
      local_rows_deleted:false,
      local_retention_allowed:false
    });
    return Object.freeze({
      schema:"agent_crypto_oracle_evidence_transport_bundle_v1",
      build:SOURCE_BUILD,
      created_at:new Date().toISOString(),
      chunk,
      jsonl,
      intended_cold_root:"public/agent_crypto_erith_ia/data/oracle_evidence/",
      manifest_path:"public/agent_crypto_erith_ia/data/oracle_evidence/manifest.json",
      bridge_ingest_required:true,
      browser_github_write:false,
      github_token_embedded:false,
      local_delete_authorized:false
    });
  }

  async function bridgeStatus(){
    const payload=await bridgeJson(STATUS_PATH,{timeout_ms:15000});
    if(String(payload?.bridge_version||"")!=="1.9.13") throw new Error("Bridge V1.9.13 requis");
    if(payload?.enabled!==true) throw new Error("Bridge Oracle Evidence désactivé · enabled=false");
    if(payload?.credential_ready!==true) throw new Error("Credential GitHub local absent dans le Bridge");
    return payload;
  }

  async function ingestBundle(bundle){
    const result=await bridgeJson(INGEST_PATH,{method:"POST",body:bundle,timeout_ms:REQUEST_TIMEOUT_MS});
    if(String(result?.status||"").toUpperCase()!=="VERIFIED") throw new Error("Le Bridge n'a pas retourné VERIFIED");
    if(String(result.relative_path||"")!==String(bundle.chunk.relative_path||"")) throw new Error("Chemin froid divergent");
    if(String(result.sha256||"")!==String(bundle.chunk.sha256||"")) throw new Error("SHA-256 froid divergent");
    if(Number(result.row_count)!==Number(bundle.chunk.row_count)) throw new Error("row_count froid divergent");
    if(result.local_rows_deleted!==false||result.local_retention_allowed!==false) throw new Error("Verrou local invalide");
    return result;
  }

  function resetRun(){
    state.error=null;
    state.pause_requested=false;
    state.stop_requested=false;
    state.paused=false;
    state.rows_done=0;
    state.chunks_done=0;
    state.current_chunk=null;
    state.last_verified=null;
    state.final_public=null;
    state.finished_at=null;
  }

  async function start(){
    if(state.running||state.starting||state.paused) return snapshot();
    state.starting=true;
    resetRun();
    setAction("AUTO_INITIALISING");
    try{
      acquireArchiveLock();
      const status=await bridgeStatus();
      const local=await countLocalRows();
      const target=await latestLocalMark();
      const remoteWatermark=mark(status.watermark);
      state.starting_local_rows=local;
      state.starting_archived_rows=Number(status.archived_rows||0);
      state.watermark=remoteWatermark;
      state.target_watermark=target;
      state.pending_at_start=await countRowsAfter(remoteWatermark,target);
      state.started_at=new Date().toISOString();
      if(!target||compareMark(target,remoteWatermark)<=0||state.pending_at_start===0){
        state.running=false;
        state.finished_at=new Date().toISOString();
        releaseArchiveLock();
        setAction("AUTO_ALREADY_COMPLETE");
        return snapshot();
      }
      state.running=true;
      setAction("AUTO_RUNNING");
      void runLoop();
      return snapshot();
    }catch(error){
      state.running=false;
      releaseArchiveLock();
      setAction(error?.code==="BRIDGE_AUTH_REQUIRED"?"AUTH_BRIDGE_REQUISE":"AUTO_ERROR",error);
      throw error;
    }finally{
      state.starting=false;
      render();
    }
  }

  async function runLoop(){
    try{
      while(state.running){
        if(state.stop_requested){
          state.running=false;
          state.finished_at=new Date().toISOString();
          releaseArchiveLock();
          setAction("AUTO_STOPPED");
          return;
        }
        if(state.pause_requested){
          state.running=false;
          state.paused=true;
          setAction("AUTO_PAUSED");
          return;
        }
        const rows=await readRowsAfter(state.watermark,state.target_watermark,CHUNK_ROWS);
        if(!rows.length){
          state.running=false;
          state.finished_at=new Date().toISOString();
          releaseArchiveLock();
          setAction("AUTO_COMPLETE");
          return;
        }
        const bundle=await makeBundle(rows);
        if(!bundle?.chunk) throw new Error("Préparation automatique du chunk impossible");
        state.current_chunk=Object.freeze({
          relative_path:bundle.chunk.relative_path,
          row_count:bundle.chunk.row_count,
          sha256:bundle.chunk.sha256,
          first_t0:bundle.chunk.first_t0,
          last_t0:bundle.chunk.last_t0
        });
        setAction("AUTO_CHUNK_INGESTING");
        const result=await ingestBundle(bundle);
        state.watermark=mark(bundle.chunk.watermark_after);
        state.rows_done+=Number(bundle.chunk.row_count||0);
        state.chunks_done+=1;
        state.last_verified=Object.freeze({
          relative_path:String(result.relative_path||""),
          row_count:Number(result.row_count||0),
          sha256:String(result.sha256||""),
          write_commit:String(result.write_commit||""),
          verify_commit:String(result.verify_commit||""),
          idempotent:result.idempotent===true
        });
        state.current_chunk=null;
        setAction("AUTO_CHUNK_VERIFIED");
        const localNow=await countLocalRows();
        if(localNow<state.starting_local_rows) throw new Error("Invariant violé : le compteur Evidence local a diminué");
        if(state.stop_requested){
          state.running=false;
          state.finished_at=new Date().toISOString();
          releaseArchiveLock();
          setAction("AUTO_STOPPED");
          return;
        }
        if(state.pause_requested){
          state.running=false;
          state.paused=true;
          setAction("AUTO_PAUSED");
          return;
        }
      }
    }catch(error){
      state.running=false;
      state.paused=false;
      state.current_chunk=null;
      state.finished_at=new Date().toISOString();
      releaseArchiveLock();
      setAction(error?.code==="BRIDGE_AUTH_REQUIRED"?"AUTH_BRIDGE_REQUISE":"AUTO_ERROR",error);
    }
  }

  function pause(){
    if(!state.running) return snapshot();
    state.pause_requested=true;
    setAction("AUTO_PAUSE_REQUESTED");
    return snapshot();
  }

  function resume(){
    if(state.running||!state.paused) return snapshot();
    acquireArchiveLock();
    state.pause_requested=false;
    state.stop_requested=false;
    state.paused=false;
    state.running=true;
    setAction("AUTO_RUNNING");
    void runLoop();
    return snapshot();
  }

  function stop(){
    if(!state.running&&!state.paused) return snapshot();
    state.stop_requested=true;
    state.pause_requested=false;
    if(state.paused){
      state.running=false;
      state.paused=false;
      state.finished_at=new Date().toISOString();
      releaseArchiveLock();
      setAction("AUTO_STOPPED");
    }else{
      setAction("AUTO_STOP_REQUESTED");
    }
    return snapshot();
  }

  async function verifyFinalPublished(){
    if(state.running) throw new Error("Attends la fin ou mets la file en pause");
    const expected=state.last_verified;
    if(!expected?.relative_path) throw new Error("Aucun reçu final exact dans cette session");
    setAction("FINAL_PUBLIC_VERIFY_LOADING");
    try{
      const base=foundation();
      const manifest=await base.load_manifest();
      const chunks=Array.isArray(manifest?.chunks)?manifest.chunks:[];
      const entry=chunks.find(x=>String(x?.relative_path||"")===String(expected.relative_path));
      if(!entry) throw new Error("Le chunk final exact n'est pas encore publié dans le manifest public");
      if(String(entry.status||"").toUpperCase()!=="VERIFIED") throw new Error("Le chunk final exact n'est pas VERIFIED");
      if(String(entry.sha256||"")!==String(expected.sha256||"")) throw new Error("SHA-256 final publié divergent");
      if(Number(entry.row_count)!==Number(expected.row_count)) throw new Error("row_count final publié divergent");
      const proof=await base.verify_cold_chunk(expected.relative_path,{sha256:expected.sha256,row_count:expected.row_count});
      if(proof?.verified!==true) throw new Error("Relecture publique du chunk final exact échouée");
      state.final_public=Object.freeze({
        verified:true,
        exact_receipt:true,
        relative_path:String(expected.relative_path),
        sha256:String(proof.sha256||""),
        row_count:Number(proof.row_count||0)
      });
      setAction("FINAL_PUBLIC_EXACT_VERIFY_PASS");
      return state.final_public;
    }catch(error){
      state.final_public=null;
      setAction("FINAL_PUBLIC_VERIFY_ERROR",error);
      throw error;
    }
  }

  function progress(){
    const pending=Math.max(0,Number(state.pending_at_start||0));
    const done=Math.max(0,Number(state.rows_done||0));
    return {
      rows_done:done,
      rows_target:pending,
      chunks_done:Number(state.chunks_done||0),
      chunks_target:pending?Math.ceil(pending/CHUNK_ROWS):0,
      percent:pending?Math.min(100,Math.round(done*1000/pending)/10):100
    };
  }

  function snapshot(){
    return Object.freeze({
      build:BUILD,
      bridge_version_required:"1.9.13",
      bridge_enabled_required:true,
      bridge_base:BRIDGE_BASE,
      chunk_rows:CHUNK_ROWS,
      running:state.running,
      starting:state.starting,
      paused:state.paused,
      pause_requested:state.pause_requested,
      stop_requested:state.stop_requested,
      action:state.action,
      error:state.error,
      watermark:state.watermark,
      target_watermark:state.target_watermark,
      starting_local_rows:state.starting_local_rows,
      starting_archived_rows:state.starting_archived_rows,
      pending_at_start:state.pending_at_start,
      rows_done:state.rows_done,
      chunks_done:state.chunks_done,
      current_chunk:state.current_chunk,
      last_verified:state.last_verified,
      final_public:state.final_public,
      archive_lock_owner:archiveLockOwner(),
      started_at:state.started_at,
      finished_at:state.finished_at,
      progress:progress(),
      fixed_target_at_start:true,
      progress_count_mode:"ROWS_AFTER_VERIFIED_WATERMARK_TO_FIXED_TARGET",
      single_flight_start:true,
      sequential_only:true,
      parallel_uploads:false,
      wait_for_verified_before_next:true,
      pause_after_current_chunk:true,
      stop_after_current_chunk:true,
      resume_from_bridge_watermark_on_new_start:true,
      exact_public_receipt_required:true,
      manual_mass_ingest_disabled:true,
      local_retention_allowed:false,
      local_delete_api_exposed:false,
      browser_github_write:false,
      github_token_in_browser:false,
      automatic_delete:false,
      storage_schema_changed:false,
      oracle_math_changed:false,
      strategy_a_changed:false,
      market_core_changed:false,
      real_order:false
    });
  }

  function ensurePanel(){
    if(document.getElementById("oracleEvidenceAutoArchive406487")) return true;
    const bridgePanel=document.getElementById("oracleEvidenceExistingBridge406484");
    const root=document.getElementById("oracle-evidence-explorer");
    if(!bridgePanel&&!root) return false;

    const panel=document.createElement("section");
    panel.id="oracleEvidenceAutoArchive406487";
    panel.setAttribute("aria-label","Archivage froid automatique Oracle Evidence 40.6.491");
    panel.style.cssText="margin:8px 0 12px;padding:10px 12px;border:1px solid rgba(255,216,102,.28);border-radius:10px;background:rgba(28,22,5,.68);display:grid;gap:8px";
    panel.innerHTML=
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">'+
        '<div><strong style="color:#ffe28f">ARCHIVAGE FROID AUTOMATIQUE · 40.6.491</strong><br>'+
        '<small>500/chunk · séquentiel · VERIFIED avant suivant · cible figée · zéro purge</small></div>'+
        '<span id="oracleAuto487State" style="font-weight:800">IDLE</span>'+
      '</div>'+
      '<div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px">'+
        '<span>Progression <b id="oracleAuto487Progress">0 / 0</b></span>'+
        '<span>Chunks <b id="oracleAuto487Chunks">0 / 0</b></span>'+
        '<span>Avancement <b id="oracleAuto487Percent">0%</b></span>'+
        '<span>Dernier <b id="oracleAuto487Last">—</b></span>'+
        '<span>Publié exact <b id="oracleAuto487Published">—</b></span>'+
      '</div>'+
      '<div style="height:7px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden">'+
        '<div id="oracleAuto487Bar" style="height:100%;width:0%;background:currentColor"></div>'+
      '</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        '<button type="button" id="btnOracleAuto487Start">Archiver automatiquement</button>'+
        '<button type="button" id="btnOracleAuto487Pause" disabled>Pause après ce chunk</button>'+
        '<button type="button" id="btnOracleAuto487Resume" disabled>Reprendre</button>'+
        '<button type="button" id="btnOracleAuto487Stop" disabled>Arrêter après ce chunk</button>'+
        '<button type="button" id="btnOracleAuto487Verify" disabled>Vérifier fin publiée</button>'+
      '</div>'+
      '<small id="oracleAuto487Note">Les nouvelles Evidence créées pendant le traitement restent pour le prochain passage. Le bouton manuel 500 est verrouillé.</small>';

    if(bridgePanel?.parentNode) bridgePanel.parentNode.insertBefore(panel,bridgePanel.nextSibling); else root.prepend(panel);

    document.getElementById("btnOracleAuto487Start")?.addEventListener("click",()=>void start().catch(()=>{}));
    document.getElementById("btnOracleAuto487Pause")?.addEventListener("click",pause);
    document.getElementById("btnOracleAuto487Resume")?.addEventListener("click",resume);
    document.getElementById("btnOracleAuto487Stop")?.addEventListener("click",stop);
    document.getElementById("btnOracleAuto487Verify")?.addEventListener("click",()=>void verifyFinalPublished().catch(()=>{}));

    const manual=document.getElementById("btnOracleBridge484Ingest");
    if(manual){
      manual.disabled=true;
      manual.textContent="Manuel désactivé · utilise AUTO";
      manual.title="40.6.491 verrouille l'archivage de masse sur la file séquentielle";
    }

    state.mounted=true;
    render();
    return true;
  }

  function render(){
    const snap=snapshot(),p=snap.progress;
    const set=(id,value)=>{const n=document.getElementById(id);if(n)n.textContent=String(value);};
    set("oracleAuto487State",snap.error?"ERREUR":snap.action);
    set("oracleAuto487Progress",p.rows_done+" / "+p.rows_target);
    set("oracleAuto487Chunks",p.chunks_done+" / "+p.chunks_target);
    set("oracleAuto487Percent",p.percent+"%");
    set("oracleAuto487Last",snap.last_verified?(snap.last_verified.row_count+" · VERIFIED"):"—");
    set("oracleAuto487Published",snap.final_public?.verified?"VERIFIED EXACT":"—");

    const bar=document.getElementById("oracleAuto487Bar");
    if(bar) bar.style.width=Math.max(0,Math.min(100,p.percent))+"%";

    const startBtn=document.getElementById("btnOracleAuto487Start");
    const pauseBtn=document.getElementById("btnOracleAuto487Pause");
    const resumeBtn=document.getElementById("btnOracleAuto487Resume");
    const stopBtn=document.getElementById("btnOracleAuto487Stop");
    const verifyBtn=document.getElementById("btnOracleAuto487Verify");
    if(startBtn) startBtn.disabled=snap.starting||snap.running||snap.paused;
    if(pauseBtn) pauseBtn.disabled=!snap.running||snap.pause_requested||snap.stop_requested;
    if(resumeBtn) resumeBtn.disabled=!snap.paused;
    if(stopBtn) stopBtn.disabled=!snap.running&&!snap.paused;
    if(verifyBtn) verifyBtn.disabled=snap.running||!snap.last_verified;

    const note=document.getElementById("oracleAuto487Note");
    if(note){
      note.textContent=snap.error
        ? ("Erreur · "+snap.error)
        : snap.action==="AUTO_COMPLETE"
          ? ("Terminé · "+p.rows_done+" Evidence · "+p.chunks_done+" chunks VERIFIED · aucune purge. Attends Pages puis vérifie le reçu final exact.")
          : snap.action==="AUTO_PAUSED"
            ? ("Pause sûre après chunk VERIFIED · "+p.rows_done+" / "+p.rows_target+" Evidence.")
            : snap.action==="AUTO_STOPPED"
              ? "Arrêt sûr · reprise depuis le watermark GitHub VERIFIED au prochain démarrage."
              : snap.current_chunk
                ? ("Chunk en cours · "+snap.current_chunk.row_count+" Evidence · SHA "+snap.current_chunk.sha256.slice(0,16)+"…")
                : "Cible figée au démarrage · nouvelles Evidence reportées · bouton manuel 500 verrouillé.";
    }
  }

  function mount(){return ensurePanel();}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mount,{once:true}); else mount();
  window.addEventListener("agent-crypto:postboot-runtime-ready",mount,{once:true});

  const autoArchiveApi406491=Object.freeze({
    build:BUILD,
    role:"AUTOMATIC_SEQUENTIAL_COLD_ARCHIVE_SINGLE_FLIGHT",
    start,
    pause,
    resume,
    stop,
    verify_final_published:verifyFinalPublished,
    state:snapshot,
    mount,
    chunk_rows:CHUNK_ROWS,
    bridge_enabled_required:true,
    fixed_target_at_start:true,
    progress_count_mode:"ROWS_AFTER_VERIFIED_WATERMARK_TO_FIXED_TARGET",
    single_flight_start:true,
    sequential_only:true,
    parallel_uploads:false,
    wait_for_verified_before_next:true,
    exact_public_receipt_required:true,
    manual_mass_ingest_disabled:true,
    local_retention_allowed:false,
    local_delete_api_exposed:false,
    browser_github_write:false,
    github_token_in_browser:false,
    automatic_delete:false,
    real_order:false
  });
  globalThis.AtlasOracleEvidenceAutoArchive406487=autoArchiveApi406491;
  globalThis.AtlasOracleEvidenceAutoArchive406491=autoArchiveApi406491;
})();
