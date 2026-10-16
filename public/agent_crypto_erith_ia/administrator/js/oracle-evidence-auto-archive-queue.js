/* Agent-Crypto @erith.IA — 40.6.486 ORACLE EVIDENCE AUTOMATIC SEQUENTIAL COLD ARCHIVE
   One operator action archives the current backlog in verified 500-row chunks.
   Each chunk is sent only after the previous chunk returned VERIFIED.
   No local Evidence is deleted. No GitHub credential enters the browser.
   Pause/Stop are honored after the current in-flight chunk finishes safely. */
(()=>{
  "use strict";

  const BUILD="40.6.486";
  const SOURCE_BUILD="40.6.482";
  const BRIDGE_BASE="http://127.0.0.1:8787";
  const STATUS_PATH="/oracle-evidence/status";
  const INGEST_PATH="/oracle-evidence/ingest";
  const BRIDGE_TOKEN_KEY="agent_crypto_bridge_auth_40375_token";
  const CHUNK_ROWS=500;
  const REQUEST_TIMEOUT_MS=300000;
  const MAX_ROWS=1000;

  const state={
    mounted:false,
    action:"IDLE",
    error:null,
    running:false,
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
    started_at:null,
    finished_at:null
  };

  function evidenceApi(){
    const api=globalThis.AtlasOracleEvidence;
    if(!api?.database||!api?.store) throw new Error("AtlasOracleEvidence indisponible");
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
      if(!response.ok||payload?.ok===false){
        throw new Error(String(payload?.error||("Bridge HTTP "+response.status)));
      }
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
    const aa=mark(a), bb=mark(b);
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
        const store=tx.objectStore(api.store);
        let index;
        try{index=store.index("t0");}
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

  async function readRowsAfter(watermark,target,limit=CHUNK_ROWS){
    const bounded=Math.max(1,Math.min(MAX_ROWS,Number(limit)||CHUNK_ROWS));
    const api=evidenceApi();
    const db=await openDb();
    const start=mark(watermark);
    const end=mark(target);
    try{
      return await new Promise((resolve,reject)=>{
        const rows=[];
        const tx=db.transaction(api.store,"readonly");
        const store=tx.objectStore(api.store);
        let index;
        try{index=store.index("t0");}
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
    const first=rows[0]||{};
    const last=rows[rows.length-1]||{};
    const firstT0=Number(first.t0||0);
    const lastT0=Number(last.t0||0);
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
    state.finished_at=null;
  }

  async function start(){
    if(state.running) return snapshot();
    resetRun();
    setAction("AUTO_INITIALISING");
    try{
      const status=await bridgeStatus();
      const local=await countLocalRows();
      const target=await latestLocalMark();
      const remoteWatermark=mark(status.watermark);
      state.starting_local_rows=local;
      state.starting_archived_rows=Number(status.archived_rows||0);
      state.pending_at_start=Math.max(0,local-state.starting_archived_rows);
      state.watermark=remoteWatermark;
      state.target_watermark=target;
      state.started_at=new Date().toISOString();

      if(!target||compareMark(target,remoteWatermark)<=0){
        state.running=false;
        state.finished_at=new Date().toISOString();
        setAction("AUTO_ALREADY_COMPLETE");
        return snapshot();
      }

      state.running=true;
      setAction("AUTO_RUNNING");
      void runLoop();
      return snapshot();
    }catch(error){
      state.running=false;
      setAction(error?.code==="BRIDGE_AUTH_REQUIRED"?"AUTH_BRIDGE_REQUISE":"AUTO_ERROR",error);
      throw error;
    }
  }

  async function runLoop(){
    try{
      while(state.running){
        if(state.stop_requested){
          state.running=false;
          state.finished_at=new Date().toISOString();
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
      setAction("AUTO_STOPPED");
    }else{
      setAction("AUTO_STOP_REQUESTED");
    }
    return snapshot();
  }

  function progress(){
    const pending=Math.max(0,Number(state.pending_at_start||0));
    const done=Math.max(0,Number(state.rows_done||0));
    const chunksTotal=pending?Math.ceil(pending/CHUNK_ROWS):0;
    return {
      rows_done:done,
      rows_target:pending,
      chunks_done:Number(state.chunks_done||0),
      chunks_target:chunksTotal,
      percent:pending?Math.min(100,Math.round(done*1000/pending)/10):100
    };
  }

  function snapshot(){
    return Object.freeze({
      build:BUILD,
      bridge_version_required:"1.9.13",
      bridge_base:BRIDGE_BASE,
      chunk_rows:CHUNK_ROWS,
      running:state.running,
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
      started_at:state.started_at,
      finished_at:state.finished_at,
      progress:progress(),
      fixed_target_at_start:true,
      sequential_only:true,
      parallel_uploads:false,
      wait_for_verified_before_next:true,
      pause_after_current_chunk:true,
      stop_after_current_chunk:true,
      resume_from_bridge_watermark_on_new_start:true,
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
    if(document.getElementById("oracleEvidenceAutoArchive406486")) return true;
    const bridgePanel=document.getElementById("oracleEvidenceExistingBridge406485")||document.getElementById("oracleEvidenceExistingBridge406484");
    const root=document.getElementById("oracle-evidence-explorer");
    if(!bridgePanel&&!root) return false;

    const panel=document.createElement("section");
    panel.id="oracleEvidenceAutoArchive406486";
    panel.setAttribute("aria-label","Archivage froid automatique Oracle Evidence 40.6.486");
    panel.style.cssText="margin:8px 0 12px;padding:10px 12px;border:1px solid rgba(255,216,102,.28);border-radius:10px;background:rgba(28,22,5,.68);display:grid;gap:8px";
    panel.innerHTML=
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">'+
        '<div><strong style="color:#ffe28f">ARCHIVAGE FROID AUTOMATIQUE · 40.6.486</strong><br>'+
        '<small>500 Evidence par chunk · séquentiel · VERIFIED obligatoire · zéro purge locale</small></div>'+
        '<span id="oracleAuto486State" style="font-weight:800">IDLE</span>'+
      '</div>'+
      '<div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px">'+
        '<span>Progression <b id="oracleAuto486Progress">0 / 0</b></span>'+
        '<span>Chunks <b id="oracleAuto486Chunks">0 / 0</b></span>'+
        '<span>Avancement <b id="oracleAuto486Percent">0%</b></span>'+
        '<span>Dernier <b id="oracleAuto486Last">—</b></span>'+
      '</div>'+
      '<div style="height:7px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden">'+
        '<div id="oracleAuto486Bar" style="height:100%;width:0%;background:currentColor"></div>'+
      '</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        '<button type="button" id="btnOracleAuto486Start">Archiver automatiquement</button>'+
        '<button type="button" id="btnOracleAuto486Pause" disabled>Pause après ce chunk</button>'+
        '<button type="button" id="btnOracleAuto486Resume" disabled>Reprendre</button>'+
        '<button type="button" id="btnOracleAuto486Stop" disabled>Arrêter après ce chunk</button>'+
      '</div>'+
      '<small id="oracleAuto486Note">La cible est figée au démarrage : les nouvelles Evidence créées pendant le traitement seront laissées pour le prochain passage.</small>';

    if(bridgePanel?.parentNode) bridgePanel.parentNode.insertBefore(panel,bridgePanel.nextSibling);
    else root.prepend(panel);

    document.getElementById("btnOracleAuto486Start")?.addEventListener("click",()=>void start().catch(()=>{}));
    document.getElementById("btnOracleAuto486Pause")?.addEventListener("click",pause);
    document.getElementById("btnOracleAuto486Resume")?.addEventListener("click",resume);
    document.getElementById("btnOracleAuto486Stop")?.addEventListener("click",stop);
    state.mounted=true;
    render();
    return true;
  }

  function render(){
    const snap=snapshot();
    const p=snap.progress;
    const set=(id,value)=>{const n=document.getElementById(id);if(n)n.textContent=String(value);};
    set("oracleAuto486State",snap.error?"ERREUR":snap.action);
    set("oracleAuto486Progress",p.rows_done+" / "+p.rows_target);
    set("oracleAuto486Chunks",p.chunks_done+" / "+p.chunks_target);
    set("oracleAuto486Percent",p.percent+"%");
    set("oracleAuto486Last",snap.last_verified?(snap.last_verified.row_count+" · VERIFIED"):"—");
    const bar=document.getElementById("oracleAuto486Bar");
    if(bar) bar.style.width=Math.max(0,Math.min(100,p.percent))+"%";

    const startBtn=document.getElementById("btnOracleAuto486Start");
    const pauseBtn=document.getElementById("btnOracleAuto486Pause");
    const resumeBtn=document.getElementById("btnOracleAuto486Resume");
    const stopBtn=document.getElementById("btnOracleAuto486Stop");
    if(startBtn) startBtn.disabled=snap.running||snap.paused;
    if(pauseBtn) pauseBtn.disabled=!snap.running||snap.pause_requested||snap.stop_requested;
    if(resumeBtn) resumeBtn.disabled=!snap.paused;
    if(stopBtn) stopBtn.disabled=!snap.running&&!snap.paused;

    const note=document.getElementById("oracleAuto486Note");
    if(note){
      note.textContent=snap.error
        ? ("Erreur · "+snap.error)
        : snap.action==="AUTO_COMPLETE"
          ? ("Terminé · "+p.rows_done+" Evidence archivées pendant ce passage · "+p.chunks_done+" chunks VERIFIED · aucune purge locale.")
          : snap.action==="AUTO_PAUSED"
            ? ("Pause sûre après chunk VERIFIED · "+p.rows_done+" / "+p.rows_target+" Evidence.")
            : snap.action==="AUTO_STOPPED"
              ? ("Arrêt sûr · reprise possible plus tard depuis le watermark GitHub VERIFIED.")
              : snap.current_chunk
                ? ("Chunk en cours · "+snap.current_chunk.row_count+" Evidence · "+snap.current_chunk.sha256.slice(0,16)+"… · ne pas fermer la page pendant ce chunk.")
                : "La cible est figée au démarrage : les nouvelles Evidence créées pendant le traitement seront laissées pour le prochain passage.";
    }
  }

  function mount(){return ensurePanel();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
  window.addEventListener("agent-crypto:postboot-runtime-ready",mount,{once:true});

  globalThis.AtlasOracleEvidenceAutoArchive406486=Object.freeze({
    build:BUILD,
    role:"AUTOMATIC_SEQUENTIAL_COLD_ARCHIVE_QUEUE",
    start,
    pause,
    resume,
    stop,
    state:snapshot,
    mount,
    chunk_rows:CHUNK_ROWS,
    fixed_target_at_start:true,
    sequential_only:true,
    parallel_uploads:false,
    wait_for_verified_before_next:true,
    local_retention_allowed:false,
    local_delete_api_exposed:false,
    browser_github_write:false,
    github_token_in_browser:false,
    automatic_delete:false,
    real_order:false
  });
})();