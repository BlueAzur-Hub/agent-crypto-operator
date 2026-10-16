/* Agent-Crypto @erith.IA — 40.6.468 STRATEGY A EVIDENCE RECONCILIATION + RUNTIME GAP TRUTH
   Read-only reconciliation between visible Experiment Ledger, Durable Evidence IndexedDB,
   After-cost evidence, PAPER states and runtime gaps.
   40.6.468 aligns after-cost ↔ PAPER summary with the same Multi-ID truth used by Crosswalk
   and separates historical open gaps from gaps active in the current page session.
   No mutation, no gate promotion, no threshold change, no network, no storage write, no real order. */
(()=>{
  "use strict";
  const BUILD="40.6.468";
  const ROOT="strategyADurableEvidenceReconciliation";
  const STYLE=ROOT+"Style";
  const FIELDS=Object.freeze(["execution_id","reconciliation_id","trade_id","identity"]);
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const arr=v=>Array.isArray(v)?v:[];
  const text=v=>String(v??"").trim();
  const unwrap=row=>row&&typeof row==="object"&&row.payload&&typeof row.payload==="object"?row.payload:row;
  const safe=(fn,fallback=[])=>{try{const v=typeof fn==="function"?fn():fallback;return v??fallback;}catch(_){return fallback;}};

  function idOf(kind,row){
    const r=unwrap(row)||{};
    if(kind==="cycle")return text(r.cycle_id||r.decision_id||r.proposal_id||r.id);
    if(kind==="after")return text(r.reconciliation_id||r.execution_id||r.trade_id||r.identity||r.id);
    if(kind==="paper")return text(r.execution_id||r.trade_id||r.reconciliation_id||r.identity||r.id);
    return text(r.id);
  }
  function indexRows(kind,rows){
    const ids=new Map(),missing=[];
    arr(rows).forEach((raw,position)=>{
      const row=unwrap(raw),id=idOf(kind,row);
      if(!id){missing.push({position,row:clone(row)});return;}
      if(!ids.has(id))ids.set(id,[]);
      ids.get(id).push({position,row:clone(row)});
    });
    const duplicates=[...ids.entries()].filter(([,items])=>items.length>1).map(([id,items])=>({id,count:items.length}));
    return {rows:arr(rows).length,unique_ids:ids.size,missing_id_rows:missing.length,duplicates,ids};
  }
  function overlap(a,b){
    const left=new Set(a?.ids?.keys?.()||[]),right=new Set(b?.ids?.keys?.()||[]);
    const shared=[...left].filter(id=>right.has(id));
    const leftOnly=[...left].filter(id=>!right.has(id));
    const rightOnly=[...right].filter(id=>!left.has(id));
    return {shared:shared.length,left_only:leftOnly.length,right_only:rightOnly.length,shared_ids:shared,left_only_ids:leftOnly,right_only_ids:rightOnly};
  }
  function idBag(raw){
    const row=unwrap(raw)||{},values=[];
    for(const field of FIELDS){const value=text(row?.[field]);if(value)values.push({field,value});}
    return {values,unique_values:[...new Set(values.map(x=>x.value))]};
  }
  function pairMatch(afterRaw,paperRaw){
    const after=idBag(afterRaw),paper=idBag(paperRaw),shared=[];
    for(const a of after.values)for(const p of paper.values)if(a.value===p.value)shared.push({value:a.value,after_field:a.field,paper_field:p.field});
    const distinct=[...new Set(shared.map(x=>x.value))];
    if(!distinct.length)return null;
    let classification="CROSS_FIELD_MATCH";
    if(distinct.length>1)classification="MULTI_ID_MATCH";
    else{
      const same=shared.filter(x=>x.after_field===x.paper_field);
      if(same.some(x=>x.after_field==="execution_id"))classification="EXACT_EXECUTION_MATCH";
      else if(same.some(x=>x.after_field==="reconciliation_id"))classification="RECONCILIATION_MATCH";
      else if(same.some(x=>x.after_field==="trade_id"))classification="TRADE_MATCH";
    }
    return {classification,shared_values:distinct,evidence:shared};
  }
  function multiIdSummary(afterRows,paperRows){
    const after=arr(afterRows).map((row,index)=>({index,row:unwrap(row)}));
    const paper=arr(paperRows).map((row,index)=>({index,row:unwrap(row)}));
    const candidates=[];
    for(const a of after)for(const p of paper){const match=pairMatch(a.row,p.row);if(match)candidates.push({after_index:a.index,paper_index:p.index,...match});}
    const byAfter=new Map(),byPaper=new Map();
    for(const c of candidates){
      if(!byAfter.has(c.after_index))byAfter.set(c.after_index,[]);
      if(!byPaper.has(c.paper_index))byPaper.set(c.paper_index,[]);
      byAfter.get(c.after_index).push(c);byPaper.get(c.paper_index).push(c);
    }
    const unique=candidates.filter(c=>(byAfter.get(c.after_index)?.length||0)===1&&(byPaper.get(c.paper_index)?.length||0)===1);
    const ambiguous=candidates.filter(c=>(byAfter.get(c.after_index)?.length||0)>1||(byPaper.get(c.paper_index)?.length||0)>1);
    const linkedAfter=new Set(candidates.map(c=>c.after_index)),linkedPaper=new Set(candidates.map(c=>c.paper_index));
    const orphanAfter=after.filter(x=>!linkedAfter.has(x.index)),orphanPaper=paper.filter(x=>!linkedPaper.has(x.index));
    return Object.freeze({
      candidate_links:candidates.length,unique_one_to_one_links:unique.length,ambiguous_candidate_links:ambiguous.length,
      truly_orphan_after_cost:orphanAfter.length,truly_orphan_paper:orphanPaper.length,
      candidates:Object.freeze(candidates.map(clone)),unique_links:Object.freeze(unique.map(clone)),
      source:"MULTI_ID",fields:FIELDS
    });
  }
  function verifiedAfter(row){
    const r=unwrap(row)||{};
    return r.cost_completeness==="COMPLETE"&&r.accounting_identity_status==="VERIFIED"&&r.accounting_identity_ok===true;
  }
  function runtimeSessionStartMs(){
    try{const n=Number(globalThis.performance?.timeOrigin);if(Number.isFinite(n)&&n>0)return n;}catch(_){}
    return Date.now();
  }
  function summarizeGaps(rows,sessionStartMs=runtimeSessionStartMs()){
    const list=arr(rows).map(unwrap).filter(Boolean),open=list.filter(r=>!r.ended_at),closed=list.filter(r=>!!r.ended_at);
    const durations=closed.map(r=>Number(r.duration_ms)).filter(Number.isFinite);
    const active=[],historical=[],unclassified=[];
    for(const row of open){
      const started=Date.parse(String(row?.started_at||""));
      if(!Number.isFinite(started)){unclassified.push(row);continue;}
      if(started>=Number(sessionStartMs)-1000)active.push(row);else historical.push(row);
    }
    return {
      total:list.length,open_raw:open.length,active_open:active.length,historical_open:historical.length,unclassified_open:unclassified.length,closed:closed.length,
      max_duration_ms:durations.length?Math.max(...durations):0,total_duration_ms:durations.reduce((a,v)=>a+v,0),
      session_start_ms:Number(sessionStartMs),
      kinds:Object.fromEntries([...new Set(list.map(r=>text(r.kind||r.reason||"UNKNOWN")||"UNKNOWN"))].map(k=>[k,list.filter(r=>(text(r.kind||r.reason||"UNKNOWN")||"UNKNOWN")===k).length])),
      active_open_ids:active.map(r=>text(r.id)).filter(Boolean),historical_open_ids:historical.map(r=>text(r.id)).filter(Boolean)
    };
  }
  function reconcile(input={},options={}){
    const visibleCycles=indexRows("cycle",input.visible_cycles),durableCycles=indexRows("cycle",input.durable_cycles);
    const visibleAfter=indexRows("after",input.visible_after),durableAfter=indexRows("after",input.durable_after),durablePaper=indexRows("paper",input.durable_paper);
    const cycleLink=overlap(visibleCycles,durableCycles),afterLink=overlap(visibleAfter,durableAfter);
    const primaryAfterPaper=overlap(durableAfter,durablePaper);
    const identity=multiIdSummary(input.durable_after,input.durable_paper);
    const afterPaper={
      shared:identity.unique_one_to_one_links,left_only:identity.truly_orphan_after_cost,right_only:identity.truly_orphan_paper,
      ambiguous:identity.ambiguous_candidate_links,candidate_links:identity.candidate_links,source:"MULTI_ID",
      fields:FIELDS
    };
    const verified=arr(input.durable_after).map(unwrap).filter(verifiedAfter).length;
    const gaps=summarizeGaps(input.runtime_gaps,options.sessionStartMs??runtimeSessionStartMs());
    const hasDurableEvidence=durableCycles.rows>0||durableAfter.rows>0||durablePaper.rows>0||gaps.total>0;
    const reviewRequired=hasDurableEvidence&&(
      durableCycles.missing_id_rows>0||durableAfter.missing_id_rows>0||durablePaper.missing_id_rows>0||
      durableCycles.duplicates.length>0||durableAfter.duplicates.length>0||durablePaper.duplicates.length>0||
      identity.ambiguous_candidate_links>0||afterPaper.left_only>0||afterPaper.right_only>0||
      gaps.active_open>0||gaps.unclassified_open>0||verified<durableAfter.rows
    );
    return Object.freeze({
      schema:"agent_crypto_strategy_a_durable_evidence_reconciliation_v2",build:BUILD,
      visible_ledger:{rows:visibleCycles.rows,unique_ids:visibleCycles.unique_ids,missing_id_rows:visibleCycles.missing_id_rows,duplicates:visibleCycles.duplicates.length},
      durable_cycles:{rows:durableCycles.rows,unique_ids:durableCycles.unique_ids,missing_id_rows:durableCycles.missing_id_rows,duplicates:durableCycles.duplicates.length},
      cycle_reconciliation:cycleLink,
      visible_after_cost:{rows:visibleAfter.rows,unique_ids:visibleAfter.unique_ids,missing_id_rows:visibleAfter.missing_id_rows,duplicates:visibleAfter.duplicates.length},
      durable_after_cost:{rows:durableAfter.rows,unique_ids:durableAfter.unique_ids,missing_id_rows:durableAfter.missing_id_rows,duplicates:durableAfter.duplicates.length,complete_verified:verified},
      after_reconciliation:afterLink,
      durable_paper:{rows:durablePaper.rows,unique_ids:durablePaper.unique_ids,missing_id_rows:durablePaper.missing_id_rows,duplicates:durablePaper.duplicates.length},
      after_to_paper:afterPaper,primary_id_after_to_paper:primaryAfterPaper,identity_crosswalk:identity,
      runtime_gaps:gaps,
      state:!hasDurableEvidence?"NO_DURABLE_EVIDENCE":reviewRequired?"REVIEW_REQUIRED":"RECONCILED_FOR_REVIEW",
      diagnostic_only:true,certifies_g1:false,certifies_g8:false,promotes_gate:false,paper_only:true,real_orders:false
    });
  }
  function durableReadiness(){
    const durable=globalThis.AgentCryptoStrategyADurableEvidence;let snap=null;
    try{snap=durable?.snapshot?.()||null;}catch(_){}
    return Object.freeze({api_present:!!durable,ready:snap?.ready===true,indexeddb_ready:snap?.indexeddb_ready===true,last_error:snap?.last_error||null});
  }
  function snapshot(){
    const durable=globalThis.AgentCryptoStrategyADurableEvidence,ledger=globalThis.AgentCryptoStrategyAExperimentLedger,after=globalThis.AgentCryptoStrategyAAfterCostMetrics;
    const visibleCycles=safe(ledger?.read,[]),visibleAfter=safe(after?.read,[]);
    const durableCycles=safe(durable?.read_cycles,[]),durableAfter=safe(durable?.read_after_cost,[]),durablePaper=safe(durable?.read_paper_states,[]),gaps=safe(durable?.read_runtime_gaps,[]);
    const s=reconcile({visible_cycles:visibleCycles,durable_cycles:durableCycles,visible_after:visibleAfter,durable_after:durableAfter,durable_paper:durablePaper,runtime_gaps:gaps});
    const readiness=durableReadiness();
    return Object.freeze({...s,durable_readiness:readiness,state:readiness.ready?s.state:"DURABLE_LOADING"});
  }
  function selfTest(){
    const sessionStart=Date.parse("2026-01-02T00:00:00Z");
    const s=reconcile({
      visible_cycles:[{cycle_id:"C1"},{cycle_id:"C2"}],durable_cycles:[{payload:{cycle_id:"C1"}},{payload:{cycle_id:"C3"}}],
      visible_after:[{execution_id:"E1"}],
      durable_after:[
        {payload:{reconciliation_id:"R1",execution_id:"E1",cost_completeness:"PARTIAL_MODEL",accounting_identity_status:"INDETERMINATE_COSTS",accounting_identity_ok:null}},
        {payload:{reconciliation_id:"R2",execution_id:"E2",cost_completeness:"COMPLETE",accounting_identity_status:"VERIFIED",accounting_identity_ok:true}}
      ],
      durable_paper:[
        {payload:{execution_id:"E1",status:"CLOSED_SYNCED"}},
        {payload:{trade_id:"E2",status:"CLOSED_SYNCED"}},
        {payload:{execution_id:"P9",status:"OPEN_SYNCED"}}
      ],
      runtime_gaps:[
        {id:"OLD",kind:"PAGEHIDE",started_at:"2026-01-01T23:59:00Z"},
        {id:"ACTIVE",kind:"TAB_HIDDEN",started_at:"2026-01-02T00:00:05Z"},
        {id:"CLOSED",kind:"TAB_HIDDEN",started_at:"2026-01-01T20:00:00Z",ended_at:"2026-01-01T20:01:00Z",duration_ms:60000}
      ]
    },{sessionStartMs:sessionStart});
    const checks=Object.freeze({
      cycle_overlap:s.cycle_reconciliation.shared===1,
      primary_id_overlap_can_be_zero:s.primary_id_after_to_paper.shared===0,
      multi_id_restores_links:s.after_to_paper.shared===2&&s.after_to_paper.left_only===0&&s.after_to_paper.right_only===1,
      no_identity_ambiguity:s.after_to_paper.ambiguous===0,
      historical_gap_distinguished:s.runtime_gaps.historical_open===1,
      active_gap_distinguished:s.runtime_gaps.active_open===1,
      closed_gap_preserved:s.runtime_gaps.closed===1,
      historical_open_does_not_equal_active:s.runtime_gaps.open_raw===2&&s.runtime_gaps.active_open===1,
      diagnostic_only:s.certifies_g1===false&&s.certifies_g8===false&&s.promotes_gate===false
    });
    return Object.freeze({schema:"agent_crypto_strategy_a_durable_evidence_reconciliation_self_test_v2",build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }
  function ensureStyle(){
    if(typeof document==="undefined"||document.getElementById(STYLE))return;
    const st=document.createElement("style");st.id=STYLE;
    st.textContent=`#${ROOT}{margin-top:10px;padding:10px;border:1px solid rgba(124,237,212,.24);border-radius:10px;background:rgba(4,20,23,.52)}#${ROOT} .der-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}#${ROOT} .der-title{font-size:10px;font-weight:950;letter-spacing:.08em;color:#8af0d8;text-transform:uppercase}#${ROOT} .der-sub,#${ROOT} .der-foot{font-size:8px;line-height:1.4;color:#83aaa2;margin-top:4px}#${ROOT} .der-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:9px}#${ROOT} .der-k{padding:7px;border:1px solid rgba(255,255,255,.065);border-radius:8px;background:rgba(2,13,17,.34)}#${ROOT} .der-k span{display:block;font-size:7px;color:#75958f;text-transform:uppercase;font-weight:900}#${ROOT} .der-k b{display:block;margin-top:3px;font-size:10px;color:#eefbf8}#${ROOT} .der-warn{margin-top:8px;padding:8px;border:1px solid rgba(255,199,92,.18);border-radius:8px;color:#e9d49f;font-size:8px;line-height:1.4}#${ROOT} button{white-space:nowrap}@media(max-width:950px){#${ROOT} .der-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
    document.head.appendChild(st);
  }
  function exportJson(){
    const payload={...snapshot(),exported_at:new Date().toISOString()};
    if(typeof document!=="undefined"){const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="STRATEGY_A_EVIDENCE_RECONCILIATION_RUNTIME_GAP_TRUTH_40_6_468.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),0);}
    return payload;
  }
  function render(){
    if(typeof document==="undefined")return false;ensureStyle();
    const anchor=document.getElementById("strategyADurableEvidence")||document.getElementById("strategyAExperimentLedger")||document.getElementById("strategyAAfterCost");
    if(!anchor)return false;
    let root=document.getElementById(ROOT);if(!root){root=document.createElement("section");root.id=ROOT;anchor.insertAdjacentElement("afterend",root);}
    const s=snapshot(),g=s.runtime_gaps,ready=s.durable_readiness?.ready===true,show=v=>ready?String(v):"…";
    root.innerHTML=`<div class="der-head"><div><div class="der-title">STRATEGY A · EVIDENCE RECONCILIATION + RUNTIME GAP TRUTH · ${BUILD}</div><div class="der-sub">Multi-ID after-cost ↔ PAPER · gaps actifs de cette page séparés des gaps historiques ouverts · diagnostic passif.</div></div><button class="btn small" id="${ROOT}Export" type="button">EXPORTER</button></div>
      <div class="der-grid">
        <div class="der-k"><span>Ledger visible / durable</span><b>${s.visible_ledger.rows} / ${show(s.durable_cycles.rows)}</b></div>
        <div class="der-k"><span>Cycles IDs communs</span><b>${show(s.cycle_reconciliation.shared)}</b></div>
        <div class="der-k"><span>After-cost visible / durable</span><b>${s.visible_after_cost.rows} / ${show(s.durable_after_cost.rows)}</b></div>
        <div class="der-k"><span>After-cost COMPLETE+VERIFIED</span><b>${ready?(s.durable_after_cost.complete_verified+"/"+s.durable_after_cost.rows):"…"}</b></div>
        <div class="der-k"><span>After-cost ↔ PAPER · Multi-ID</span><b>${show(s.after_to_paper.shared)}</b></div>
        <div class="der-k"><span>After-cost vraiment orphelins</span><b>${show(s.after_to_paper.left_only)}</b></div>
        <div class="der-k"><span>PAPER vraiment orphelins</span><b>${show(s.after_to_paper.right_only)}</b></div>
        <div class="der-k"><span>Gaps · total / actifs / hist. ouverts</span><b>${ready?(g.total+" / "+g.active_open+" / "+g.historical_open):"…"}</b></div>
      </div>
      <div class="der-warn"><b>État : ${s.state}</b> · identité : ${ready?("Multi-ID "+s.after_to_paper.shared+" lien(s), "+s.after_to_paper.ambiguous+" ambigu"):"…"} · gaps ouverts bruts : ${ready?g.open_raw:"…"}, dont ${ready?g.active_open:"…"} actif(s) dans cette page et ${ready?g.historical_open:"…"} hérités d'anciennes sessions. Les historiques restent conservés mais ne sont plus confondus avec un gap actif.</div>
      <div class="der-foot">Aucun seuil modifié · aucune fusion de preuve · aucune suppression de gap · aucune écriture IndexedDB · aucun réseau · PAPER ONLY.</div>`;
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",exportJson,{once:true});return true;
  }
  const api=Object.freeze({build:BUILD,snapshot,reconcile,multi_id_summary:multiIdSummary,summarize_gaps:summarizeGaps,self_test:selfTest,render,export_json:exportJson,diagnostic_only:true,certifies_g1:false,certifies_g8:false,promotes_gate:false,paper_only:true,real_orders:false,network:false,storage_write:false,thresholds_changed:false,recurring_timer:false,observer:false});
  globalThis.AgentCryptoStrategyADurableEvidenceReconciliation=api;
  if(typeof document!=="undefined"){
    const attempt=()=>{try{return render();}catch(_){return false;}};
    document.addEventListener("agent-crypto:strategy-a-audits-ready",attempt,{passive:true});
    document.addEventListener("agent-crypto:strategy-a-durable-evidence-ready",attempt,{passive:true});
    document.addEventListener("agent-crypto:evidence-data-changed",()=>queueMicrotask(attempt),{passive:true});
    window.addEventListener("agent-crypto:strategy-core-ready",()=>queueMicrotask(attempt),{passive:true});
    window.addEventListener("agent-crypto:postboot-runtime-ready",()=>queueMicrotask(attempt),{passive:true});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attempt,{once:true});else queueMicrotask(attempt);
  }
})();