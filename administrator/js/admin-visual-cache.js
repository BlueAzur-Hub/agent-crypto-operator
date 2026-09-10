(() => {
  "use strict";

  const BUILD = "40.4.254";
  const DB_NAME = "agent_crypto_visual_cache_v1";
  const DB_VERSION = 1;
  const STORE = "assets";
  const GENERATION = "administrator-visuals-2026-09-05-404254-v2";
  const CHART_OFFICE = "./assets/visual/admin-chart-office.png";
  const objectUrls = new Map();
  const stats = { memory: 0, indexeddb: 0, network: 0, miss: 0, error: 0 };

  function absolute(input) {
    try { return new URL(String(input || ""), document.baseURI).href; }
    catch (_) { return String(input || ""); }
  }

  function isCacheable(url) {
    try {
      const u = new URL(url, document.baseURI);
      if (u.origin !== location.origin) return false;
      return /\/assets\/(?:visual|images)\//.test(u.pathname) && /\.(?:png|jpe?g|webp|avif)$/i.test(u.pathname);
    } catch (_) { return false; }
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!globalThis.indexedDB) return reject(new Error("IndexedDB unavailable"));
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("Visual cache DB open failed"));
    });
  }

  async function read(id) {
    const db = await openDb();
    try {
      return await new Promise((resolve, reject) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error || new Error("Visual cache read failed"));
      });
    } finally { db.close(); }
  }

  async function write(record) {
    const db = await openDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error("Visual cache write failed"));
        tx.objectStore(STORE).put(record);
      });
    } finally { db.close(); }
  }

  function objectUrlFor(key, blob) {
    const existing = objectUrls.get(key);
    if (existing) {
      stats.memory += 1;
      return existing;
    }
    const url = URL.createObjectURL(blob);
    objectUrls.set(key, url);
    return url;
  }

  async function resolve(input, { allowNetwork = true } = {}) {
    const id = absolute(input);
    if (!isCacheable(id)) return { url: id, source: "direct", cached: false };

    const memoryUrl = objectUrls.get(id);
    if (memoryUrl) {
      stats.memory += 1;
      return { url: memoryUrl, source: "memory", cached: true };
    }

    try {
      const record = await read(id);
      if (record?.generation === GENERATION && record?.blob instanceof Blob && record.blob.size > 0) {
        stats.indexeddb += 1;
        return { url: objectUrlFor(id, record.blob), source: "indexeddb", cached: true, bytes: record.blob.size };
      }
    } catch (_) {
      stats.error += 1;
    }

    if (!allowNetwork) {
      stats.miss += 1;
      return null;
    }

    try {
      const response = await fetch(id, { cache: "reload", credentials: "same-origin" });
      if (!response.ok) throw new Error(`visual fetch ${response.status}`);
      const blob = await response.blob();
      if (!blob || !blob.size || (blob.type && !blob.type.startsWith("image/"))) throw new Error("invalid visual blob");
      try {
        await write({ id, generation: GENERATION, blob, mime: blob.type || "", bytes: blob.size, cached_at: Date.now() });
      } catch (_) {
        /* Cache persistence is an optimization. A failed write must never block the interface. */
      }
      stats.network += 1;
      return { url: objectUrlFor(id, blob), source: "network", cached: false, bytes: blob.size };
    } catch (error) {
      stats.error += 1;
      throw error;
    }
  }

  async function has(input) {
    const id = absolute(input);
    if (objectUrls.has(id)) return true;
    try {
      const record = await read(id);
      return Boolean(record?.generation === GENERATION && record?.blob instanceof Blob && record.blob.size > 0);
    } catch (_) { return false; }
  }

  async function clear() {
    for (const url of objectUrls.values()) {
      try { URL.revokeObjectURL(url); } catch (_) {}
    }
    objectUrls.clear();
    return await new Promise((resolve) => {
      try {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
        req.onblocked = () => resolve(false);
      } catch (_) { resolve(false); }
    });
  }

  function setChartBackground(url, source) {
    if (!url) return false;
    document.documentElement.style.setProperty("--agent-crypto-chart-office-cached", `url("${String(url).replaceAll('"', '%22')}")`);
    document.documentElement.dataset.visualChartSource = source || "unknown";
    return true;
  }

  function scheduleNetwork(task) {
    const run = () => { try { void task(); } catch (_) {} };
    if (typeof requestIdleCallback === "function") requestIdleCallback(run, { timeout: 1400 });
    else requestAnimationFrame(run);
  }

  async function bootChartBackground() {
    try {
      const local = await resolve(CHART_OFFICE, { allowNetwork: false });
      if (local?.url) {
        setChartBackground(local.url, local.source);
        return;
      }
    } catch (_) {}
    scheduleNetwork(async () => {
      try {
        const resolved = await resolve(CHART_OFFICE, { allowNetwork: true });
        if (resolved?.url) setChartBackground(resolved.url, resolved.source);
      } catch (_) {
        /* Last-resort direct URL. The graph remains usable even if the decorative background fails. */
        setChartBackground(CHART_OFFICE, "direct-fallback");
      }
    });
  }

  globalThis.AgentCryptoVisualCache40326 = Object.freeze({
    build: BUILD,
    database: DB_NAME,
    generation: GENERATION,
    resolve,
    has,
    clear,
    stats: () => Object.freeze({ ...stats }),
    chart_asset: CHART_OFFICE,
    persistent_blob_cache: true,
    network_on_cache_miss_only: true,
    preloads_full_library: false
  });

  document.documentElement.dataset.visualCacheBuild = BUILD;
  void bootChartBackground();
})();

/* ==========================================================================
   40.3.42 — NATIVE SCROLL RESTORE
   Offscreen sleep/prewake remains retired. Persistent visual cache above.
   ========================================================================== */
(() => {
  "use strict";
  const BUILD="40.3.63";
  const add=Document.prototype.addEventListener;
  const remove=Document.prototype.removeEventListener;
  const winAdd=Window.prototype.addEventListener;
  const setI=globalThis.setInterval.bind(globalThis);
  const setT=globalThis.setTimeout.bind(globalThis);
  const clock=()=>globalThis.performance?.now?.()??Date.now();
  const stats={resumeQueued:0,resumeRun:0,resumeDedup:0,oracleRetimed:0,bootRetimed:0,coalesced:0};
  let lastInput=0,resumeUntil=0,resumeGen=0;
  const activity=()=>{lastInput=clock();};
  add.call(document,"pointerdown",activity,{capture:true,passive:true});
  add.call(document,"keydown",activity,{capture:true,passive:true});
  add.call(document,"wheel",activity,{capture:true,passive:true});
  winAdd.call(window,"scroll",activity,{capture:true,passive:true});
  add.call(document,"visibilitychange",()=>{if(!document.hidden){resumeGen++;resumeUntil=clock()+2600;}},{capture:true,passive:true});
  const busy=()=>{try{return Boolean((typeof state!=="undefined"&&(state?.auto?.livecheckBusy||state?.chartEngineV2?.loading))||(typeof atlasLocalReportsState!=="undefined"&&atlasLocalReportsState?.running)||(typeof atlasLocalConclusionState!=="undefined"&&atlasLocalConclusionState?.running));}catch{return false;}};
  const idle=(fn,timeout=1600)=>{if(typeof requestIdleCallback==="function")return requestIdleCallback(()=>{try{fn();}catch{}},{timeout});return setT(()=>{try{fn();}catch{}},32);};

  const wrappers=new WeakMap(),queued=new Set(),jobs=[];
  let draining=false;
  const cap=o=>typeof o==="boolean"?o:Boolean(o?.capture);
  const invoke=(l,ctx,e)=>typeof l==="function"?l.call(ctx,e):l?.handleEvent?.call(l,e);
  function drain(){if(draining)return;draining=true;const step=()=>{if(document.hidden){jobs.length=0;queued.clear();draining=false;return;}const j=jobs.shift();if(j){queued.delete(j.w);stats.resumeRun++;try{invoke(j.l,document,j.e);}catch{}}if(!jobs.length){draining=false;return;}idle(step,180);};requestAnimationFrame(()=>idle(step,220));}
  function wrap(l,o){if(!l)return l;let m=wrappers.get(l);if(!m){m=new Map();wrappers.set(l,m);}const k=cap(o)?1:0;if(m.has(k))return m.get(k);const w=function(e){if(document.hidden)return invoke(l,this,e);if(queued.has(w)){stats.resumeDedup++;return;}queued.add(w);jobs.push({w,l,e});stats.resumeQueued++;drain();};m.set(k,w);return w;}
  Document.prototype.addEventListener=function(t,l,o){return add.call(this,t,this===document&&t==="visibilitychange"?wrap(l,o):l,o);};
  Document.prototype.removeEventListener=function(t,l,o){const w=this===document&&t==="visibilitychange"&&l?wrappers.get(l)?.get(cap(o)?1:0):null;return remove.call(this,t,w||l,o);};

  const src=h=>{try{return typeof h==="function"?Function.prototype.toString.call(h):"";}catch{return "";}};
  const quiet=(h,a)=>idle(()=>{if(document.hidden||clock()-lastInput<1400||clock()<resumeUntil||busy())return;try{h(...a);}catch{}},3500);
  globalThis.setInterval=function(h,d,...a){const s=src(h),ms=Number(d)||0;if(typeof h==="function"&&ms===15000&&s.includes("atlasOracleOutcomeRun")&&s.includes("atlasOracleLongShadowRun40273")){stats.oracleRetimed++;return setI(()=>quiet(h,a),60000);}return setI(h,d,...a);};
  globalThis.setTimeout=function(h,d,...a){const s=src(h),ms=Number(d)||0;if(typeof h==="function"&&ms===2500&&s.includes("atlasOracleOutcomeRun")&&s.includes("atlasOracleLongShadowRun40273")){stats.bootRetimed++;return setT(()=>quiet(h,a),6500);}if(typeof h==="function"&&ms===3500&&s.includes("atlasOracleLongShadowRun40273(true)")){stats.bootRetimed++;return setT(()=>quiet(h,a),70000);}return setT(h,d,...a);};
  window.setInterval=globalThis.setInterval;window.setTimeout=globalThis.setTimeout;

  function coalesce(name,ms=2000,normalize=null){const base=globalThis[name];if(typeof base!=="function"||base.__perf40363)return;let at=-Infinity,result,gen=-1;const f=function(...a){const t=clock(),res=t<resumeUntil;if((res&&gen===resumeGen)||t-at<ms){stats.coalesced++;return result;}at=t;if(res)gen=resumeGen;if(normalize)a=normalize(a,res);result=base.apply(this,a);return result;};Object.defineProperty(f,"__perf40363",{value:true});globalThis[name]=f;}
  function install(){coalesce("atlasBookMirrorFetch36",5000);coalesce("atlasExchangeRefreshDirectRest383",4000,(a,res)=>res&&a[0]&&typeof a[0]==="object"?[{...a[0],force:false},...a.slice(1)]:a);coalesce("atlasCurrentJournalHydrate3814",2200);coalesce("atlasRuntimeTruthApply3813",1800);coalesce("atlasCurrentMemoryEventReconcile3813",2200);coalesce("atlasBookRoleUiLock3812",1800);coalesce("atlasRestoreRuntimeUi",1400);document.documentElement.dataset.firefoxFreezeRecovery40363="1";globalThis.ErithFirefoxFreezeRecovery40363=Object.freeze({build:BUILD,parent:"40.3.62",visibility_resume:"serial_idle",oracle_background_ms:60000,full_snapshot_semantics_changed:false,market_core_changed:false,oracle_math_changed:false,window_manager_changed:false,stats:()=>Object.freeze({...stats,queue:jobs.length})});}
  if(document.readyState==="loading")add.call(document,"DOMContentLoaded",()=>requestAnimationFrame(()=>idle(install,1200)),{once:true});else requestAnimationFrame(()=>idle(install,1200));
})();
