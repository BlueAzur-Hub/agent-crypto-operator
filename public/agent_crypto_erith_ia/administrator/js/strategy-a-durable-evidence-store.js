/* Agent-Crypto @erith.IA — Strategy A Durable Evidence Continuity
   Build 40.6.463 extends the recovered 40.6.272 / 40.6.268 capability.
   PAPER state fingerprint now includes execution-cost evidence capture revision/state,
   so an asynchronous open/close evidence update is durably persisted without changing the DB schema.
   Same IndexedDB schema as 40.6.268, but bounded:
   - no market-series listener
   - no recurring timer
   - no MutationObserver
   - no initial full capture during page boot
   - coalesced idle capture on bounded evidence/CURRENT events
   - pagehide/hidden checkpoint only
   - cached merged reads instead of rebuild/clone on every hot event
   PAPER ONLY. No network. No threshold change. No real order. */
(() => {
  "use strict";

  const BUILD="40.6.463";
  const DB_NAME="agent_crypto_strategy_a_durable_evidence_v1";
  const DB_VERSION=1;
  const STORE_CYCLES="cycles";
  const STORE_AFTER="after_cost";
  const STORE_PAPER="paper_states";
  const STORE_GAPS="runtime_gaps";
  const STORE_META="meta";
  const LEGACY_G3_KEY="agent_crypto_erith_ia_strategy_a_g3_prospective_t0_40_6_205";
  const PANEL_ID="strategyADurableEvidence";
  const STYLE_ID=PANEL_ID+"Style";

  const stores={cycles:new Map(),after_cost:new Map(),paper_states:new Map(),runtime_gaps:new Map()};
  const versions={cycles:0,after_cost:0,paper_states:0,runtime_gaps:0};
  const mergedCache={
    cycles:{sig:"",rows:[]},
    after_cost:{sig:"",rows:[]},
    paper_states:{sig:"",rows:[]}
  };

  let dbPromise=null;
  let ready=false;
  let dbReady=false;
  let lastError=null;
  let lastCaptureAt=null;
  let capturePending=false;
  let captureReasons=new Set();
  let ledgerBase=null, ledgerFacade=null;
  let afterBase=null, afterFacade=null;
  let activeGapId=null;

  const text=v=>String(v??"").trim();
  const nowIso=()=>new Date().toISOString();
  const clone=v=>{
    try{
      if(typeof structuredClone==="function")return structuredClone(v);
      return JSON.parse(JSON.stringify(v));
    }catch(_){return null;}
  };
  const hash=v=>{
    let h=2166136261;
    for(const c of String(v??"")){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
    return (h>>>0).toString(16).padStart(8,"0");
  };
  const safe=(fn,fallback,...args)=>{
    try{return typeof fn==="function"?fn(...args):fallback;}
    catch(_){return fallback;}
  };

  function cycleId(row){
    const direct=text(row?.cycle_id||row?.decision_id||row?.proposal_id||row?.id);
    if(direct)return direct;
    const at=row?.captured_at||row?.at||row?.timestamp||null;
    const phase=row?.phase||row?.decision||row?.proposal_status||null;
    return at||phase?"cycle-"+hash(String(at)+"|"+String(phase)+"|"+String(row?.market?.price_eur??"")):null;
  }
  function afterId(row){
    const direct=text(row?.reconciliation_id||row?.execution_id||row?.trade_id||row?.identity);
    if(direct)return direct;
    const at=row?.at||row?.closed_at||null;
    return at?"after-"+hash(String(at)+"|"+String(row?.symbol||"BTC")+"|"+String(row?.net_pnl_eur??row?.authoritative_net_pnl_eur??"")):null;
  }
  function paperId(row){
    const direct=text(row?.execution_id||row?.trade_id||row?.reconciliation_id||row?.id);
    if(direct)return direct;
    const at=row?.opened_at||row?.at||row?.timestamp||null;
    return at?"paper-"+hash(String(at)+"|"+String(row?.status||row?.phase||"")):null;
  }
  const idFor=(name,row)=>name===STORE_CYCLES?cycleId(row):name===STORE_AFTER?afterId(row):paperId(row);
  const mapFor=name=>name===STORE_CYCLES?stores.cycles:name===STORE_AFTER?stores.after_cost:name===STORE_PAPER?stores.paper_states:stores.runtime_gaps;
  const versionKey=name=>name===STORE_CYCLES?"cycles":name===STORE_AFTER?"after_cost":name===STORE_PAPER?"paper_states":"runtime_gaps";

  function openDb(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      if(!globalThis.indexedDB){reject(new Error("INDEXEDDB_UNAVAILABLE"));return;}
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{
        const db=req.result;
        for(const name of [STORE_CYCLES,STORE_AFTER,STORE_PAPER,STORE_GAPS,STORE_META]){
          if(!db.objectStoreNames.contains(name))db.createObjectStore(name,{keyPath:"id"});
        }
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error("INDEXEDDB_OPEN_FAILED"));
      req.onblocked=()=>{lastError="INDEXEDDB_BLOCKED";};
    }).then(db=>{dbReady=true;return db;}).catch(error=>{
      dbReady=false;
      lastError=String(error?.message||error);
      throw error;
    });
    return dbPromise;
  }
  const txDone=tx=>new Promise((resolve,reject)=>{
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>reject(tx.error||new Error("INDEXEDDB_TX_FAILED"));
    tx.onabort=()=>reject(tx.error||new Error("INDEXEDDB_TX_ABORTED"));
  });

  async function hydrate(name){
    const db=await openDb();
    const rows=await new Promise((resolve,reject)=>{
      const tx=db.transaction(name,"readonly");
      const req=tx.objectStore(name).getAll();
      req.onsuccess=()=>resolve(Array.isArray(req.result)?req.result:[]);
      req.onerror=()=>reject(req.error||new Error("INDEXEDDB_READ_FAILED"));
    });
    const target=mapFor(name);
    target.clear();
    for(const row of rows)if(row?.id)target.set(String(row.id),row);
    versions[versionKey(name)]++;
    return rows.length;
  }

  async function putEntries(name,entries){
    if(!entries.length)return 0;
    const db=await openDb();
    const tx=db.transaction(name,"readwrite");
    const store=tx.objectStore(name);
    for(const entry of entries)store.put(entry);
    await txDone(tx);
    return entries.length;
  }

  function liveSignature(name,rows){
    const list=Array.isArray(rows)?rows:[];
    const last=list.length?idFor(name,list[list.length-1])||"":"";
    return list.length+"|"+last+"|"+versions[versionKey(name)];
  }

  // Read-order repair: persist and source rows remain unchanged. Invalid timestamps stay missing.
  // Scope only the evidence lists: Paper lifecycle/state ordering is not touched.
  function evidenceTime(row){
    const raw=row?.at||row?.captured_at||row?.timestamp||row?.created_at||"";
    const n=Date.parse(String(raw));
    return Number.isFinite(n)?n:null;
  }
  function chronologicalEvidenceRead(name,rows){
    if(name!==STORE_CYCLES&&name!==STORE_AFTER)return rows;
    const ordered=rows.slice();
    ordered.sort((a,b)=>{
      const ta=evidenceTime(a),tb=evidenceTime(b);
      if(ta===null)return tb===null?0:1;
      if(tb===null)return -1;
      return ta-tb;
    });
    return ordered;
  }

  function mergedRows(name,liveRows){
    const list=Array.isArray(liveRows)?liveRows:[];
    const key=name===STORE_CYCLES?"cycles":name===STORE_AFTER?"after_cost":"paper_states";
    const sig=liveSignature(name,list);
    const cache=mergedCache[key];
    if(cache.sig===sig)return cache.rows.slice();
    const merged=new Map();
    for(const entry of mapFor(name).values())if(entry?.id&&entry?.payload)merged.set(String(entry.id),entry.payload);
    for(const row of list){const id=idFor(name,row);if(id)merged.set(String(id),row);}
    cache.sig=sig;
    cache.rows=chronologicalEvidenceRead(name,[...merged.values()]);
    return cache.rows.slice();
  }

  function liveLedgerRows(){
    const rows=safe((ledgerBase||globalThis.AgentCryptoStrategyAExperimentLedger)?.read,[]);
    return Array.isArray(rows)?rows:[];
  }
  function liveAfterRows(){
    const rows=safe((afterBase||globalThis.AgentCryptoStrategyAAfterCostMetrics)?.read,[]);
    return Array.isArray(rows)?rows:[];
  }
  function livePaperRows(){
    const rows=safe(globalThis.AgentCryptoStrategyAAutoLifecycleBridge?.read,[]);
    return Array.isArray(rows)?rows:[];
  }

  function paperFingerprint(row){
    const evidence=row?.execution_cost_evidence||null;
    return [row?.status,row?.phase,row?.state,row?.closed_at,row?.filled_at,row?.quantity_btc,row?.fill_price_eur,row?.reconciliation_id,
      evidence?.build,evidence?.revision,evidence?.state,evidence?.opened_capture?.state,evidence?.opened_capture?.captured_at,evidence?.closed_capture?.state,evidence?.closed_capture?.captured_at]
      .map(v=>String(v??"")).join("|");
  }

  async function persistRows(name,rows,source,{allowUpdate=false}={}){
    const target=mapFor(name);
    const entries=[];
    for(const row of Array.isArray(rows)?rows:[]){
      if(!row||typeof row!=="object")continue;
      const id=idFor(name,row);
      if(!id)continue;
      const key=String(id);
      const previous=target.get(key);
      if(previous&&!allowUpdate)continue;
      if(previous&&allowUpdate&&paperFingerprint(previous.payload)===paperFingerprint(row))continue;
      const entry={
        id:key,
        source:String(source||"runtime"),
        captured_at:previous?.captured_at||nowIso(),
        updated_at:nowIso(),
        payload:clone(row)
      };
      if(!entry.payload)continue;
      entries.push(entry);
      target.set(key,entry);
    }
    if(entries.length){
      await putEntries(name,entries);
      versions[versionKey(name)]++;
    }
    return entries.length;
  }

  async function importLegacy(){
    let rows=[];
    try{
      const raw=JSON.parse(localStorage.getItem(LEGACY_G3_KEY)||"[]");
      if(Array.isArray(raw))rows=raw;
    }catch(_){}
    return persistRows(STORE_CYCLES,rows,"LEGACY_G3_PROSPECTIVE");
  }

  function installLedgerFacade(){
    const current=globalThis.AgentCryptoStrategyAExperimentLedger;
    if(!current)return false;
    if(current?.durable_evidence_facade_406272===true)return true;
    ledgerBase=current;
    ledgerFacade=Object.freeze({
      ...current,
      read:()=>mergedRows(STORE_CYCLES,safe(ledgerBase?.read,[])||[]),
      summary:()=>{
        const live=safe(ledgerBase?.summary,{})||{};
        const rows=mergedRows(STORE_CYCLES,safe(ledgerBase?.read,[])||[]);
        return Object.freeze({...live,cycles:rows.length,rows:rows.length,durable_cycles:stores.cycles.size,merged_rows:rows.length,durable_store_build:BUILD});
      },
      durable_read:()=>mergedRows(STORE_CYCLES,[]),
      durable_evidence_facade_406272:true,
      durable_store_build:BUILD
    });
    try{globalThis.AgentCryptoStrategyAExperimentLedger=ledgerFacade;}catch(_){}
    return globalThis.AgentCryptoStrategyAExperimentLedger===ledgerFacade;
  }

  function patchAfterPanel(){
    if(typeof document==="undefined")return false;
    const panel=document.getElementById("strategyAAfterCost");
    if(!panel||!afterFacade)return false;
    const s=afterFacade.summary();
    const set=(k,v)=>{const n=panel.querySelector('[data-sam="'+k+'"]');if(n)n.textContent=String(v);};
    const eur=v=>typeof v==="number"&&Number.isFinite(v)?v.toFixed(2)+" €":"UNKNOWN";
    set("trades",s.trades??0);
    set("complete",(s.complete_cost_trades??0)+"/"+(s.trades??0));
    set("gross",eur(s.reference_gross_pnl_eur));
    set("costs",eur(s.known_costs_eur));
    set("net",eur(s.net_pnl_eur));
    set("sample",s.sample_state||"INSUFFICIENT_SAMPLE");
    return true;
  }

  function installAfterFacade(){
    const current=globalThis.AgentCryptoStrategyAAfterCostMetrics;
    if(!current)return false;
    if(current?.durable_evidence_facade_406272===true)return true;
    afterBase=current;
    const readMerged=()=>mergedRows(STORE_AFTER,safe(afterBase?.read,[])||[]);
    const persistResult=result=>{
      if(result?.ok&&result?.row){
        void persistRows(STORE_AFTER,[result.row],"AFTER_COST_RUNTIME")
          .then(()=>{lastCaptureAt=nowIso();render();patchAfterPanel();})
          .catch(error=>{lastError=String(error?.message||error);});
      }
      return result;
    };
    afterFacade=Object.freeze({
      ...current,
      read:readMerged,
      summary:rows=>safe(afterBase?.summary,{},Array.isArray(rows)?rows:readMerged())||{},
      from_reconciliation:row=>persistResult(afterBase.from_reconciliation(row)),
      record_from_reconciliation:row=>persistResult(
        typeof afterBase.record_from_reconciliation==="function"
          ? afterBase.record_from_reconciliation(row)
          : afterBase.from_reconciliation(row)
      ),
      render:()=>{const result=safe(afterBase?.render,false);queueMicrotask(()=>{patchAfterPanel();render();});return result;},
      durable_read:()=>mergedRows(STORE_AFTER,[]),
      durable_evidence_facade_406272:true,
      durable_store_build:BUILD
    });
    try{globalThis.AgentCryptoStrategyAAfterCostMetrics=afterFacade;}catch(_){}
    return globalThis.AgentCryptoStrategyAAfterCostMetrics===afterFacade;
  }

  function ensureFacades(){installLedgerFacade();installAfterFacade();}

  async function captureRuntime(reason="manual"){
    ensureFacades();
    const [cycles,after,paper]=await Promise.all([
      persistRows(STORE_CYCLES,liveLedgerRows(),"RUNTIME:"+reason),
      persistRows(STORE_AFTER,liveAfterRows(),"RUNTIME:"+reason),
      persistRows(STORE_PAPER,livePaperRows(),"RUNTIME:"+reason,{allowUpdate:true})
    ]);
    lastCaptureAt=nowIso();
    try{
      const db=await openDb();
      const tx=db.transaction(STORE_META,"readwrite");
      tx.objectStore(STORE_META).put({id:"last_capture",at:lastCaptureAt,reason:String(reason),counts:{cycles:stores.cycles.size,after_cost:stores.after_cost.size,paper_states:stores.paper_states.size}});
      await txDone(tx);
    }catch(error){lastError=String(error?.message||error);}
    render();
    return {cycles,after_cost:after,paper_states:paper};
  }

  function scheduleCapture(reason){
    captureReasons.add(String(reason||"event"));
    if(capturePending)return;
    capturePending=true;
    const run=()=>{
      capturePending=false;
      const why=[...captureReasons].join("+");
      captureReasons.clear();
      void captureRuntime(why).catch(error=>{lastError=String(error?.message||error);render();});
    };
    if(typeof requestIdleCallback==="function")requestIdleCallback(run,{timeout:3000});
    else setTimeout(run,250);
  }

  function gapRecord(id,kind,startedAt,endedAt=null,detail=null){
    return {id,kind,started_at:startedAt,ended_at:endedAt,detail:clone(detail),source:"BROWSER_RUNTIME",build:BUILD};
  }
  async function persistGap(entry){
    stores.runtime_gaps.set(entry.id,entry);
    await putEntries(STORE_GAPS,[entry]);
    versions.runtime_gaps++;
  }
  function openGap(kind){
    if(activeGapId)return;
    const at=nowIso();
    activeGapId="gap-"+hash(kind+"|"+at);
    void persistGap(gapRecord(activeGapId,kind,at,null,{document_hidden:document.hidden===true}))
      .catch(error=>{lastError=String(error?.message||error);});
  }
  function closeGap(reason){
    if(!activeGapId)return;
    const id=activeGapId; activeGapId=null;
    const existing=stores.runtime_gaps.get(id);
    if(!existing)return;
    const ended=nowIso();
    const closed={...existing,ended_at:ended,duration_ms:Math.max(0,Date.parse(ended)-Date.parse(existing.started_at)),detail:{...(existing.detail||{}),closed_reason:reason}};
    void persistGap(closed).catch(error=>{lastError=String(error?.message||error);});
  }

  function snapshot(){
    const paper=[...stores.paper_states.values()].map(e=>e?.payload).filter(Boolean);
    const open=paper.filter(row=>String(row?.status||row?.state||"").toUpperCase().includes("OPEN"));
    return Object.freeze({
      schema:"agent_crypto_strategy_a_durable_evidence_v1",build:BUILD,recovered_from:"40.6.268",database:DB_NAME,
      ready,indexeddb_ready:dbReady,cycles:stores.cycles.size,after_cost:stores.after_cost.size,paper_states:stores.paper_states.size,
      runtime_gaps:stores.runtime_gaps.size,unresolved_open_paper:open.length,review_required:open.length>0,last_capture_at:lastCaptureAt,last_error:lastError,
      hot_market_listener:false,initial_full_capture:false,recurring_timer:false,mutation_observer:false,network:false,thresholds_changed:false,real_orders:false
    });
  }

  function ensureStyle(){
    if(typeof document==="undefined"||document.getElementById(STYLE_ID))return;
    const s=document.createElement("style");
    s.id=STYLE_ID;
    s.textContent=
      "#"+PANEL_ID+"{margin-top:9px;padding:9px;border:1px solid rgba(105,220,255,.22);border-radius:10px;background:rgba(4,18,28,.50)}"+
      "#"+PANEL_ID+" .de-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;flex-wrap:wrap}"+
      "#"+PANEL_ID+" .de-title{font-size:9px;font-weight:950;letter-spacing:.08em;color:#92edff;text-transform:uppercase}"+
      "#"+PANEL_ID+" .de-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin-top:7px}"+
      "#"+PANEL_ID+" .de-k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px}"+
      "#"+PANEL_ID+" .de-k span{display:block;font-size:7px;color:#7795a0;text-transform:uppercase}"+
      "#"+PANEL_ID+" .de-k b{display:block;margin-top:3px;font-size:9px;color:#eafcff}"+
      "#"+PANEL_ID+" .de-note{margin-top:7px;font-size:8px;line-height:1.35;color:#8ba6af}"+
      "@media(max-width:950px){#"+PANEL_ID+" .de-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}";
    document.head.appendChild(s);
  }

  function render(){
    if(typeof document==="undefined")return false;
    ensureStyle();
    const anchor=document.getElementById("strategyAAfterCost")||document.getElementById("strategyAExperimentLedger");
    if(!anchor)return false;
    let panel=document.getElementById(PANEL_ID);
    if(!panel){panel=document.createElement("section");panel.id=PANEL_ID;anchor.insertAdjacentElement("afterend",panel);}
    const s=snapshot();
    panel.innerHTML=
      '<div class="de-head"><div><div class="de-title">STRATEGY A · DURABLE EVIDENCE · '+BUILD+'</div>'+
      '<div class="de-note">Récupération bornée de .268 · IndexedDB local · aucun listener marché chaud · aucune décision Strategy A modifiée.</div></div>'+
      '<div><button type="button" class="btn small" id="'+PANEL_ID+'Capture">CAPTURER</button></div></div>'+
      '<div class="de-grid">'+
      '<div class="de-k"><span>Cycles durables</span><b>'+s.cycles+'</b></div>'+
      '<div class="de-k"><span>After-cost</span><b>'+s.after_cost+'</b></div>'+
      '<div class="de-k"><span>États PAPER</span><b>'+s.paper_states+'</b></div>'+
      '<div class="de-k"><span>Gaps runtime</span><b>'+s.runtime_gaps+'</b></div>'+
      '<div class="de-k"><span>État</span><b>'+(s.review_required?"REVIEW REQUIRED":s.indexeddb_ready?"DURABLE READY":"INITIALISATION")+'</b></div>'+
      '</div><div class="de-note">'+(s.last_error?("ERREUR · "+s.last_error):("Dernière capture : "+(s.last_capture_at?new Date(s.last_capture_at).toLocaleTimeString("fr-FR"):"—")+". Les preuves .268 existantes sont relues sans lancer de boucle marché."))+'</div>';
    panel.querySelector("#"+PANEL_ID+"Capture")?.addEventListener("click",()=>scheduleCapture("operator"),{once:true});
    patchAfterPanel();
    return true;
  }

  async function init(){
    try{
      await Promise.all([hydrate(STORE_CYCLES),hydrate(STORE_AFTER),hydrate(STORE_PAPER),hydrate(STORE_GAPS)]);
      ready=true;
      ensureFacades();
      render();
      const legacy=()=>void importLegacy().then(()=>render()).catch(error=>{lastError=String(error?.message||error);});
      if(typeof requestIdleCallback==="function")requestIdleCallback(legacy,{timeout:4000});
      else setTimeout(legacy,500);
      try{document.dispatchEvent(new CustomEvent("agent-crypto:strategy-a-durable-evidence-ready",{detail:snapshot()}));}catch(_){}
      return true;
    }catch(error){
      ready=true;
      lastError=String(error?.message||error);
      render();
      return false;
    }
  }

  if(typeof document!=="undefined"){
    for(const name of ["agentcrypto:current-finalized","agent-crypto:evidence-refresh-complete","agent-crypto:evidence-data-changed"]){
      document.addEventListener(name,()=>scheduleCapture(name),{passive:true});
    }
    document.addEventListener("visibilitychange",()=>{
      if(document.hidden){
        openGap("TAB_HIDDEN");
        void captureRuntime("visibility-hidden").catch(error=>{lastError=String(error?.message||error);});
      }else{
        closeGap("VISIBLE_AGAIN");
        ensureFacades();
        render();
      }
    },{passive:true});
    window.addEventListener("pagehide",()=>{
      openGap("PAGEHIDE");
      void captureRuntime("pagehide").catch(()=>{});
    },{passive:true});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>void init(),{once:true});
    else void init();
  }

  globalThis.AgentCryptoStrategyADurableEvidence=Object.freeze({
    build:BUILD,recovered_from:"40.6.268",database:DB_NAME,snapshot,
    capture:reason=>captureRuntime(reason||"api"),
    read_cycles:()=>mergedRows(STORE_CYCLES,[]),
    read_after_cost:()=>mergedRows(STORE_AFTER,[]),
    read_paper_states:()=>mergedRows(STORE_PAPER,[]),
    read_runtime_gaps:()=>[...stores.runtime_gaps.values()].map(e=>clone(e)),
    ensure_facades:ensureFacades,render,paper_only:true,real_orders:false,network:false,thresholds_changed:false,
    recurring_timer:false,mutation_observer:false,hot_market_listener:false,indexeddb:true
  });
})();
