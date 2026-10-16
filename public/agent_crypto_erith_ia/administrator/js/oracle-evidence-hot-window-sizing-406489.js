/* Agent-Crypto @erith.IA — 40.6.489 ORACLE EVIDENCE HOT WINDOW SIZING PROBE
   READ ONLY / MEASUREMENT ONLY.
   Measures local Evidence count, a bounded systematic sample of payload sizes,
   origin storage estimate and cold-manifest coverage.
   It does not modify Oracle Evidence or activate retention. */
(() => {
  "use strict";

  const BUILD = "40.6.489";
  const SAMPLE_TARGET = 1000;
  const HOT_OPTIONS = Object.freeze([10000, 5000, 2500]);
  const MANIFEST_RELATIVE = "../data/oracle_evidence/manifest.json";
  const state = {
    mounted: false,
    running: false,
    auto_started: false,
    last_action: "IDLE",
    last_error: null,
    measured_at: null,
    result: null
  };

  function evidenceApi(){
    const api=globalThis.AtlasOracleEvidence;
    if(!api?.database || !api?.store) throw new Error("AtlasOracleEvidence indisponible");
    return api;
  }

  function openExistingEvidenceDb(){
    return new Promise((resolve,reject)=>{
      const api=evidenceApi();
      const req=indexedDB.open(api.database);
      let settled=false;
      req.onupgradeneeded=()=>{
        try{req.transaction?.abort();}catch(_){}
        if(!settled){settled=true;reject(new Error("Oracle Evidence IndexedDB absent — aucune création autorisée"));}
      };
      req.onsuccess=()=>{
        if(settled){try{req.result?.close?.();}catch(_){};return;}
        settled=true;resolve(req.result);
      };
      req.onerror=()=>{if(!settled){settled=true;reject(req.error||new Error("Ouverture Oracle Evidence refusée"));}};
      req.onblocked=()=>{if(!settled){settled=true;reject(new Error("Ouverture Oracle Evidence bloquée"));}};
    });
  }

  function byteSize(value){
    const text=JSON.stringify(value);
    return new TextEncoder().encode(text==null?"null":text).byteLength;
  }

  function percentile(sorted,p){
    if(!sorted.length) return 0;
    const pos=(sorted.length-1)*p;
    const lo=Math.floor(pos),hi=Math.ceil(pos);
    if(lo===hi) return sorted[lo];
    return sorted[lo]+(sorted[hi]-sorted[lo])*(pos-lo);
  }

  function fmtBytes(value){
    const n=Number(value)||0;
    if(n>=1024*1024*1024) return (n/(1024*1024*1024)).toFixed(2)+" GiB";
    if(n>=1024*1024) return (n/(1024*1024)).toFixed(2)+" MiB";
    if(n>=1024) return (n/1024).toFixed(2)+" KiB";
    return Math.round(n)+" B";
  }

  async function countAndSample(target=SAMPLE_TARGET){
    const api=evidenceApi();
    const db=await openExistingEvidenceDb();
    try{
      const total=await new Promise((resolve,reject)=>{
        const tx=db.transaction(api.store,"readonly");
        const req=tx.objectStore(api.store).count();
        req.onsuccess=()=>resolve(Number(req.result)||0);
        req.onerror=()=>reject(req.error||new Error("Count Oracle Evidence refusé"));
      });
      if(!total) return {total:0,target:0,sampled:0,stride:0,sizes:[],duration_ms:0};

      const wanted=Math.min(Math.max(1,Number(target)||SAMPLE_TARGET),total);
      const stride=Math.max(1,Math.floor(total/wanted));
      const sizes=[];
      const started=performance.now();

      await new Promise((resolve,reject)=>{
        const tx=db.transaction(api.store,"readonly");
        const store=tx.objectStore(api.store);
        let source=store;
        try{source=store.index("t0");}catch(_){}
        const req=source.openCursor(null,"next");
        let done=false;
        const finish=()=>{if(!done){done=true;resolve();}};
        req.onerror=()=>{if(!done){done=true;reject(req.error||new Error("Cursor Oracle Evidence refusé"));}};
        req.onsuccess=()=>{
          if(done) return;
          const cursor=req.result;
          if(!cursor || sizes.length>=wanted){finish();return;}
          try{sizes.push(byteSize(cursor.value));}
          catch(error){done=true;reject(error);return;}
          if(sizes.length>=wanted){finish();return;}
          try{cursor.advance(stride);}catch(error){done=true;reject(error);}
        };
        tx.onabort=()=>{if(!done){done=true;reject(tx.error||new Error("Transaction échantillon annulée"));}};
      });

      return {
        total,
        target:wanted,
        sampled:sizes.length,
        stride,
        sizes,
        duration_ms:Number((performance.now()-started).toFixed(1))
      };
    } finally {
      try{db.close();}catch(_){}
    }
  }

  async function readColdManifest(){
    const url=new URL(MANIFEST_RELATIVE,document.baseURI).href;
    const response=await fetch(url,{cache:"no-store",credentials:"same-origin"});
    if(!response.ok) throw new Error("Manifest froid HTTP "+response.status);
    const manifest=await response.json();
    if(manifest?.schema!=="agent_crypto_oracle_evidence_cold_archive_manifest_v1") throw new Error("Manifest froid invalide");
    const chunks=Array.isArray(manifest.chunks)?manifest.chunks:[];
    const verified=chunks.filter(row=>String(row?.status||"").toUpperCase()==="VERIFIED").length;
    return {
      archived_rows:Number(manifest.archived_rows)||0,
      chunks:chunks.length,
      verified_chunks:verified,
      watermark:manifest.watermark||null,
      local_retention_allowed:manifest.local_retention_allowed===true,
      transport_status:String(manifest?.transport?.status||"")
    };
  }

  async function originEstimate(){
    if(!navigator.storage?.estimate) return {supported:false,usage:null,quota:null};
    const estimate=await navigator.storage.estimate();
    return {supported:true,usage:Number(estimate?.usage)||0,quota:Number(estimate?.quota)||0};
  }

  function pageMemory(){
    const mem=performance?.memory;
    if(mem && Number.isFinite(Number(mem.usedJSHeapSize))){
      return {
        supported:true,
        used_js_heap:Number(mem.usedJSHeapSize)||0,
        total_js_heap:Number(mem.totalJSHeapSize)||0,
        js_heap_limit:Number(mem.jsHeapSizeLimit)||0,
        note:"JS heap exposé par ce navigateur — ce n'est pas la RAM totale du processus Firefox."
      };
    }
    return {
      supported:false,
      used_js_heap:null,
      total_js_heap:null,
      js_heap_limit:null,
      note:"RAM processus non exposée automatiquement par Firefox à la page. Utiliser about:processes pour la mesure processus."
    };
  }

  function summarizeSample(sample){
    const sorted=sample.sizes.slice().sort((a,b)=>a-b);
    const sum=sorted.reduce((a,b)=>a+b,0);
    const mean=sorted.length?sum/sorted.length:0;
    return {
      local_rows:sample.total,
      sample_target:sample.target,
      sample_rows:sample.sampled,
      stride:sample.stride,
      duration_ms:sample.duration_ms,
      mean_bytes:mean,
      median_bytes:percentile(sorted,0.50),
      p95_bytes:percentile(sorted,0.95),
      min_bytes:sorted[0]||0,
      max_bytes:sorted[sorted.length-1]||0,
      estimated_payload_bytes:mean*sample.total
    };
  }

  function buildScenarios(summary,cold){
    return HOT_OPTIONS.map(hot=>{
      const beyondHot=Math.max(0,summary.local_rows-hot);
      const upper=Math.min(beyondHot,Number(cold.archived_rows)||0);
      return {
        hot_rows:hot,
        upper_bound_rows:upper,
        upper_bound_bytes:upper*summary.mean_bytes,
        label:"borne haute seulement — sélection réelle interdite sans preuve watermark/chunk VERIFIED"
      };
    });
  }

  async function measure(){
    if(state.running) return state.result;
    state.running=true;
    state.last_action="MEASURING";
    state.last_error=null;
    render();
    try{
      const sample=await countAndSample(SAMPLE_TARGET);
      const summary=summarizeSample(sample);
      const [cold,origin]=await Promise.all([readColdManifest(),originEstimate()]);
      const memory=pageMemory();
      const result={
        schema:"agent_crypto_oracle_hot_window_sizing_measurement_v1",
        build:BUILD,
        measured_at:new Date().toISOString(),
        evidence:summary,
        cold,
        origin_storage:origin,
        page_memory:memory,
        scenarios:buildScenarios(summary,cold),
        safety:{
          read_only:true,
          indexeddb_mode:"readonly",
          local_modification:false,
          retention_activated:false,
          storage_schema_changed:false
        }
      };
      state.result=result;
      state.measured_at=result.measured_at;
      state.last_action="MEASURED";
      return result;
    } catch(error){
      state.last_error=String(error?.message||error);
      state.last_action="ERROR";
      throw error;
    } finally {
      state.running=false;
      render();
    }
  }

  function snapshot(){
    return JSON.parse(JSON.stringify({
      mounted:state.mounted,
      running:state.running,
      auto_started:state.auto_started,
      last_action:state.last_action,
      last_error:state.last_error,
      measured_at:state.measured_at,
      result:state.result
    }));
  }

  function ensurePanel(){
    if(document.getElementById("oracleEvidenceHotWindowSizing406489")) return true;
    const auto=document.getElementById("oracleEvidenceAutoArchive406487");
    const cold=document.getElementById("oracleEvidenceColdArchive406482");
    const root=document.getElementById("oracle-evidence-explorer");
    if(!auto&&!cold&&!root) return false;

    const panel=document.createElement("section");
    panel.id="oracleEvidenceHotWindowSizing406489";
    panel.setAttribute("aria-label","Mesure Hot Window Oracle Evidence 40.6.489");
    panel.style.cssText="margin:8px 0 12px;padding:10px 12px;border:1px solid rgba(102,225,255,.30);border-radius:10px;background:rgba(5,23,31,.72);display:grid;gap:9px";
    panel.innerHTML=
      '<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">'+
        '<div><strong style="color:#9beeff">ORACLE EVIDENCE · HOT WINDOW SIZING · 40.6.489</strong><br>'+
        '<small>Mesure automatique · échantillon borné · aucune suppression</small></div>'+
        '<span id="oracleHot489State" style="font-weight:800;color:#9beeff">IDLE</span>'+
      '</div>'+
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:7px;font-size:12px">'+
        '<span>Local <b id="oracleHot489Local">—</b></span>'+
        '<span>Échantillon <b id="oracleHot489Sample">—</b></span>'+
        '<span>Moyenne <b id="oracleHot489Mean">—</b></span>'+
        '<span>Médiane <b id="oracleHot489Median">—</b></span>'+
        '<span>P95 <b id="oracleHot489P95">—</b></span>'+
        '<span>Payload estimé <b id="oracleHot489Payload">—</b></span>'+
        '<span>Origin usage <b id="oracleHot489Origin">—</b></span>'+
        '<span>GitHub froid <b id="oracleHot489Cold">—</b></span>'+
      '</div>'+
      '<div id="oracleHot489Scenarios" style="display:grid;gap:5px"></div>'+
      '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'+
        '<button type="button" id="btnOracleHot489Measure">Mesurer — aucune suppression</button>'+
        '<small id="oracleHot489Memory">RAM processus Firefox : en attente de mesure</small>'+
      '</div>'+
      '<small id="oracleHot489Note">READ ONLY · aucune modification locale · rétention non activée.</small>';

    const anchor=auto||cold;
    if(anchor?.parentNode) anchor.parentNode.insertBefore(panel,anchor.nextSibling);
    else root.prepend(panel);

    document.getElementById("btnOracleHot489Measure")?.addEventListener("click",()=>void measure().catch(()=>{}));
    state.mounted=true;
    render();

    if(!state.auto_started){
      state.auto_started=true;
      const start=()=>void measure().catch(()=>{});
      if(typeof requestAnimationFrame==="function") requestAnimationFrame(()=>requestAnimationFrame(start));
      else Promise.resolve().then(start);
    }
    return true;
  }

  function render(){
    const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=String(value);};
    set("oracleHot489State",state.last_error?"ERREUR":state.running?"MEASURING":state.last_action);
    const button=document.getElementById("btnOracleHot489Measure");
    if(button) button.disabled=state.running;

    const r=state.result;
    if(!r){
      const note=document.getElementById("oracleHot489Note");
      if(note && state.last_error) note.textContent="Erreur de mesure · "+state.last_error+" · aucune donnée modifiée.";
      return;
    }
    const e=r.evidence,o=r.origin_storage,c=r.cold,m=r.page_memory;
    set("oracleHot489Local",e.local_rows);
    set("oracleHot489Sample",e.sample_rows+" / "+e.sample_target+" · pas "+e.stride);
    set("oracleHot489Mean",fmtBytes(e.mean_bytes));
    set("oracleHot489Median",fmtBytes(e.median_bytes));
    set("oracleHot489P95",fmtBytes(e.p95_bytes));
    set("oracleHot489Payload",fmtBytes(e.estimated_payload_bytes));
    set("oracleHot489Origin",o.supported?(fmtBytes(o.usage)+" / "+fmtBytes(o.quota)):"non exposé");
    set("oracleHot489Cold",c.archived_rows+" · "+c.verified_chunks+"/"+c.chunks+" VERIFIED");

    const scenarios=document.getElementById("oracleHot489Scenarios");
    if(scenarios){
      scenarios.innerHTML=r.scenarios.map(row=>
        '<div style="display:grid;grid-template-columns:110px 1fr 150px;gap:8px;padding:6px 8px;border:1px solid rgba(255,255,255,.07);border-radius:7px">'+
          '<b>HOT '+row.hot_rows.toLocaleString("fr-FR")+'</b>'+
          '<span>borne haute libérable : '+row.upper_bound_rows.toLocaleString("fr-FR")+' Evidence</span>'+
          '<span>≈ '+fmtBytes(row.upper_bound_bytes)+'</span>'+
        '</div>'
      ).join("");
    }

    set("oracleHot489Memory",m.supported
      ? ("JS heap : "+fmtBytes(m.used_js_heap)+" · "+m.note)
      : m.note);

    const note=document.getElementById("oracleHot489Note");
    if(note) note.textContent=
      "Mesuré "+new Date(r.measured_at).toLocaleTimeString("fr-FR")+
      " · "+e.duration_ms+" ms d'échantillonnage · scénarios = estimation seulement · aucune rétention activée.";
  }

  function mount(){return ensurePanel();}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mount,{once:true}); else mount();
  window.addEventListener("agent-crypto:postboot-runtime-ready",mount,{once:true});

  globalThis.AtlasOracleEvidenceHotWindowSizing406489=Object.freeze({
    build:BUILD,
    role:"READ_ONLY_HOT_WINDOW_SIZING_PROBE",
    measure,
    state:snapshot,
    mount,
    sample_target:SAMPLE_TARGET,
    hot_options:HOT_OPTIONS.slice(),
    read_only:true,
    indexeddb_mode:"readonly",
    automatic_measure_once:true,
    local_modification:false,
    retention_activated:false,
    storage_schema_changed:false,
    recurring_timer:false,
    observer:false,
    oracle_math_changed:false,
    strategy_a_changed:false,
    market_core_changed:false,
    real_order:false
  });
})();
