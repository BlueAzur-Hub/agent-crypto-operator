/* Agent-Crypto @erith.IA — 40.6.467 STRATEGY A EVIDENCE IDENTITY CROSSWALK TRUTH
   Read-only identity crosswalk between Durable Evidence after-cost and PAPER states.
   Compares every available execution_id / reconciliation_id / trade_id / identity value.
   No merge, no mutation, no certification, no network, no storage write, no real order. */
(()=>{
  "use strict";
  const BUILD="40.6.467";
  const ROOT="strategyAEvidenceIdentityCrosswalk";
  const STYLE=ROOT+"Style";
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const arr=v=>Array.isArray(v)?v:[];
  const text=v=>String(v??"").trim();
  const unwrap=row=>row&&typeof row==="object"&&row.payload&&typeof row.payload==="object"?row.payload:row;
  const safe=(fn,fallback=[])=>{try{const v=typeof fn==="function"?fn():fallback;return v??fallback;}catch(_){return fallback;}};
  const FIELDS=Object.freeze(["execution_id","reconciliation_id","trade_id","identity"]);

  function idBag(raw){
    const row=unwrap(raw)||{};
    const values=[];
    for(const field of FIELDS){
      const value=text(row?.[field]);
      if(value)values.push({field,value});
    }
    return Object.freeze({
      row:clone(row),
      values:Object.freeze(values),
      unique_values:Object.freeze([...new Set(values.map(x=>x.value))])
    });
  }
  function pairMatch(afterRaw,paperRaw){
    const after=idBag(afterRaw),paper=idBag(paperRaw);
    const shared=[];
    for(const a of after.values){
      for(const p of paper.values){
        if(a.value===p.value)shared.push({value:a.value,after_field:a.field,paper_field:p.field});
      }
    }
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
    return Object.freeze({
      classification,
      shared_values:Object.freeze(distinct),
      evidence:Object.freeze(shared.map(clone))
    });
  }
  function summarizeRows(afterRows,paperRows){
    const after=arr(afterRows).map((row,index)=>({index,row:unwrap(row)}));
    const paper=arr(paperRows).map((row,index)=>({index,row:unwrap(row)}));
    const candidates=[];
    for(const a of after){
      for(const p of paper){
        const match=pairMatch(a.row,p.row);
        if(match)candidates.push({after_index:a.index,paper_index:p.index,...match});
      }
    }
    const byAfter=new Map(),byPaper=new Map();
    for(const c of candidates){
      if(!byAfter.has(c.after_index))byAfter.set(c.after_index,[]);
      if(!byPaper.has(c.paper_index))byPaper.set(c.paper_index,[]);
      byAfter.get(c.after_index).push(c);
      byPaper.get(c.paper_index).push(c);
    }
    const uniqueLinks=candidates.filter(c=>
      (byAfter.get(c.after_index)?.length||0)===1 &&
      (byPaper.get(c.paper_index)?.length||0)===1
    );
    const ambiguous=candidates.filter(c=>
      (byAfter.get(c.after_index)?.length||0)>1 ||
      (byPaper.get(c.paper_index)?.length||0)>1
    );
    const linkedAfter=new Set(candidates.map(c=>c.after_index));
    const linkedPaper=new Set(candidates.map(c=>c.paper_index));
    const orphanAfter=after.filter(x=>!linkedAfter.has(x.index));
    const orphanPaper=paper.filter(x=>!linkedPaper.has(x.index));
    const counts={};
    for(const name of ["EXACT_EXECUTION_MATCH","RECONCILIATION_MATCH","TRADE_MATCH","CROSS_FIELD_MATCH","MULTI_ID_MATCH"]){
      counts[name]=candidates.filter(c=>c.classification===name).length;
    }
    const state=ambiguous.length?"AMBIGUOUS_REVIEW_REQUIRED":
      candidates.length?"CROSSWALK_ESTABLISHED_FOR_REVIEW":"NO_IDENTITY_LINK_FOUND";
    return Object.freeze({
      schema:"agent_crypto_strategy_a_evidence_identity_crosswalk_v1",
      build:BUILD,
      after_cost_rows:after.length,
      paper_rows:paper.length,
      candidate_links:candidates.length,
      unique_one_to_one_links:uniqueLinks.length,
      ambiguous_candidate_links:ambiguous.length,
      truly_orphan_after_cost:orphanAfter.length,
      truly_orphan_paper:orphanPaper.length,
      match_classes:Object.freeze(counts),
      candidates:Object.freeze(candidates.map(clone)),
      unique_links:Object.freeze(uniqueLinks.map(clone)),
      orphan_after_indexes:Object.freeze(orphanAfter.map(x=>x.index)),
      orphan_paper_indexes:Object.freeze(orphanPaper.map(x=>x.index)),
      state,
      diagnostic_only:true,
      mutates_evidence:false,
      merges_records:false,
      certifies_g1:false,
      certifies_g8:false,
      promotes_gate:false,
      paper_only:true,
      real_orders:false
    });
  }
  function durableReady(){
    try{return globalThis.AgentCryptoStrategyADurableEvidence?.snapshot?.()?.ready===true;}catch(_){return false;}
  }
  function snapshot(){
    const durable=globalThis.AgentCryptoStrategyADurableEvidence;
    const after=safe(durable?.read_after_cost,[]);
    const paper=safe(durable?.read_paper_states,[]);
    const s=summarizeRows(after,paper);
    return durableReady()?s:Object.freeze({...s,state:"DURABLE_LOADING",durable_ready:false});
  }
  function selfTest(){
    const after=[
      {reconciliation_id:"R1",execution_id:"E1",trade_id:"T1"},
      {reconciliation_id:"R2",execution_id:"E2"},
      {execution_id:"E3"},
      {reconciliation_id:"RX",execution_id:"EX"}
    ];
    const paper=[
      {execution_id:"E1",reconciliation_id:"R1",trade_id:"T1"},
      {execution_id:"R2"},
      {trade_id:"E3"},
      {execution_id:"P9"}
    ];
    const s=summarizeRows(after,paper);
    const checks=Object.freeze({
      multi_id_detected:s.match_classes.MULTI_ID_MATCH===1,
      cross_field_reconciliation_to_execution_detected:s.match_classes.CROSS_FIELD_MATCH>=1,
      cross_field_execution_to_trade_detected:s.candidates.some(c=>c.evidence.some(e=>e.after_field==="execution_id"&&e.paper_field==="trade_id")),
      one_true_after_orphan:s.truly_orphan_after_cost===1,
      one_true_paper_orphan:s.truly_orphan_paper===1,
      no_mutation:s.mutates_evidence===false&&s.merges_records===false,
      never_certifies:s.certifies_g1===false&&s.certifies_g8===false&&s.promotes_gate===false
    });
    return Object.freeze({schema:"agent_crypto_strategy_a_evidence_identity_crosswalk_self_test_v1",build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }
  function ensureStyle(){
    if(typeof document==="undefined"||document.getElementById(STYLE))return;
    const st=document.createElement("style");st.id=STYLE;
    st.textContent=`#${ROOT}{margin-top:10px;padding:10px;border:1px solid rgba(126,198,255,.24);border-radius:10px;background:rgba(5,18,30,.54)}#${ROOT} .xw-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}#${ROOT} .xw-title{font-size:10px;font-weight:950;letter-spacing:.08em;color:#9fd8ff;text-transform:uppercase}#${ROOT} .xw-sub,#${ROOT} .xw-foot{font-size:8px;line-height:1.4;color:#89a9bb;margin-top:4px}#${ROOT} .xw-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:9px}#${ROOT} .xw-k{padding:7px;border:1px solid rgba(255,255,255,.065);border-radius:8px;background:rgba(2,12,22,.36)}#${ROOT} .xw-k span{display:block;font-size:7px;color:#7898aa;text-transform:uppercase;font-weight:900}#${ROOT} .xw-k b{display:block;margin-top:3px;font-size:10px;color:#eff8ff}#${ROOT} .xw-state{margin-top:8px;padding:8px;border:1px solid rgba(255,211,92,.18);border-radius:8px;color:#ead9a5;font-size:8px;line-height:1.4}@media(max-width:950px){#${ROOT} .xw-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
    document.head.appendChild(st);
  }
  function exportJson(){
    const payload={...snapshot(),exported_at:new Date().toISOString()};
    if(typeof document!=="undefined"){
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download="STRATEGY_A_EVIDENCE_IDENTITY_CROSSWALK_40_6_461.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),0);
    }
    return payload;
  }
  function render(){
    if(typeof document==="undefined")return false;
    ensureStyle();
    const anchor=document.getElementById("strategyADurableEvidenceReconciliation")||document.getElementById("strategyADurableEvidence");
    if(!anchor)return false;
    let root=document.getElementById(ROOT);
    if(!root){root=document.createElement("section");root.id=ROOT;anchor.insertAdjacentElement("afterend",root);}
    const s=snapshot(),m=s.match_classes,ready=s.state!=="DURABLE_LOADING",show=v=>ready?String(v):"…";
    root.innerHTML=`<div class="xw-head"><div><div class="xw-title">STRATEGY A · EVIDENCE IDENTITY CROSSWALK · ${BUILD}</div><div class="xw-sub">Tous les IDs disponibles sont comparés avant de déclarer une preuve orpheline. Aucune fusion automatique.</div></div><button class="btn small" id="${ROOT}Export" type="button">EXPORTER</button></div>
      <div class="xw-grid">
        <div class="xw-k"><span>After-cost / PAPER</span><b>${ready?(s.after_cost_rows+" / "+s.paper_rows):"… / …"}</b></div>
        <div class="xw-k"><span>Liens candidats</span><b>${show(s.candidate_links)}</b></div>
        <div class="xw-k"><span>Liens 1↔1 uniques</span><b>${show(s.unique_one_to_one_links)}</b></div>
        <div class="xw-k"><span>Liens ambigus</span><b>${show(s.ambiguous_candidate_links)}</b></div>
        <div class="xw-k"><span>Execution exact</span><b>${show(m.EXACT_EXECUTION_MATCH)}</b></div>
        <div class="xw-k"><span>Reconciliation exact</span><b>${show(m.RECONCILIATION_MATCH)}</b></div>
        <div class="xw-k"><span>Trade exact</span><b>${show(m.TRADE_MATCH)}</b></div>
        <div class="xw-k"><span>Cross-field / Multi-ID</span><b>${ready?(m.CROSS_FIELD_MATCH+" / "+m.MULTI_ID_MATCH):"… / …"}</b></div>
        <div class="xw-k"><span>After-cost vraiment orphelins</span><b>${show(s.truly_orphan_after_cost)}</b></div>
        <div class="xw-k"><span>PAPER vraiment orphelins</span><b>${show(s.truly_orphan_paper)}</b></div>
      </div>
      <div class="xw-state"><b>État : ${s.state}</b> · candidat ≠ preuve fusionnée. Un lien ambigu reste REVIEW REQUIRED. Aucun enregistrement local n'est modifié.</div>
      <div class="xw-foot">Champs comparés : execution_id · reconciliation_id · trade_id · identity. Aucun seuil modifié · aucune certification · aucune écriture IndexedDB · PAPER ONLY.</div>`;
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",exportJson,{once:true});
    return true;
  }
  const api=Object.freeze({
    build:BUILD,snapshot,summarize:summarizeRows,pair_match:pairMatch,self_test:selfTest,render,export_json:exportJson,
    fields:FIELDS,diagnostic_only:true,mutates_evidence:false,merges_records:false,
    certifies_g1:false,certifies_g8:false,promotes_gate:false,paper_only:true,real_orders:false,
    network:false,storage_write:false,thresholds_changed:false,recurring_timer:false,observer:false
  });
  globalThis.AgentCryptoStrategyAEvidenceIdentityCrosswalk=api;
  if(typeof document!=="undefined"){
    const attempt=()=>{try{return render();}catch(_){return false;}};
    document.addEventListener("agent-crypto:strategy-a-audits-ready",attempt,{once:true});
    document.addEventListener("agent-crypto:strategy-a-durable-evidence-ready",attempt,{passive:true});
    window.addEventListener("agent-crypto:strategy-core-ready",()=>queueMicrotask(attempt),{passive:true});
    window.addEventListener("agent-crypto:postboot-runtime-ready",()=>queueMicrotask(attempt),{passive:true});
    document.addEventListener("agent-crypto:evidence-data-changed",()=>queueMicrotask(attempt),{passive:true});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attempt,{once:true});else queueMicrotask(attempt);
  }
})();