/* Agent-Crypto @erith.IA — 40.6.467 STRATEGY A AFTER-COST COMPLETENESS TRUTH
   Read-only diagnosis of the uniquely linked after-cost ↔ PAPER evidence established by 40.6.461.
   Reveals exactly which cost components or accounting checks block COMPLETE + VERIFIED.
   No mutation, no certification, no network, no storage write, no real order. */
(()=>{
  "use strict";
  const BUILD="40.6.467";
  const ROOT="strategyAAfterCostCompletenessTruth";
  const STYLE=ROOT+"Style";
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const arr=v=>Array.isArray(v)?v:[];
  const text=v=>String(v??"").trim();
  const unwrap=row=>row&&typeof row==="object"&&row.payload&&typeof row.payload==="object"?row.payload:row;
  const safe=(fn,fallback=[])=>{try{const v=typeof fn==="function"?fn():fallback;return v??fallback;}catch(_){return fallback;}};
  const finite=v=>{
    if(v===null||v===undefined||typeof v==="boolean")return false;
    if(typeof v==="string"&&!v.trim())return false;
    return Number.isFinite(Number(v));
  };
  const nonneg=v=>finite(v)&&Number(v)>=0;

  function analyzeAfter(raw){
    const r=unwrap(raw)||{};
    const costs=r.costs&&typeof r.costs==="object"?r.costs:{};
    const blockers=[];
    const entryFee=costs.entry_fee_eur;
    const exitFee=costs.exit_fee_eur;
    const impact=costs.impact_eur;
    const spread=costs.spread_eur;
    const slippage=costs.slippage_eur;

    if(!nonneg(entryFee)||!nonneg(exitFee))blockers.push("fees_eur");
    if(!nonneg(impact))blockers.push("impact_eur");
    if(!nonneg(spread))blockers.push("spread_eur");
    if(!nonneg(slippage))blockers.push("slippage_eur");

    const baseFacts=[];
    if(!(finite(r.quantity_btc)&&Number(r.quantity_btc)>0))baseFacts.push("quantity_btc");
    if(!(finite(r.entry_reference_eur)&&Number(r.entry_reference_eur)>0))baseFacts.push("entry_reference_eur");
    if(!(finite(r.exit_reference_eur)&&Number(r.exit_reference_eur)>0))baseFacts.push("exit_reference_eur");
    if(!finite(r.net_pnl_eur??r.authoritative_net_pnl_eur))baseFacts.push("net_pnl_eur");

    const completeness=text(r.cost_completeness||"UNKNOWN").toUpperCase();
    const accounting=text(r.accounting_identity_status||"UNKNOWN").toUpperCase();
    const accountingOk=r.accounting_identity_ok===true;
    const completeVerified=completeness==="COMPLETE"&&accounting==="VERIFIED"&&accountingOk===true&&blockers.length===0&&baseFacts.length===0;
    const mismatch=accounting==="MISMATCH"||r.accounting_identity_ok===false;
    const state=completeVerified?"COMPLETE_VERIFIED":
      mismatch?"ACCOUNTING_MISMATCH":
      baseFacts.length?"BASE_FACTS_INCOMPLETE":
      blockers.length?"COST_INPUTS_INCOMPLETE":"REVIEW_REQUIRED";
    return Object.freeze({
      identity:text(r.identity||r.reconciliation_id||r.execution_id||r.trade_id||"UNKNOWN"),
      execution_id:text(r.execution_id||""),
      reconciliation_id:text(r.reconciliation_id||""),
      trade_id:text(r.trade_id||""),
      cost_completeness:completeness,
      accounting_identity_status:accounting,
      accounting_identity_ok:r.accounting_identity_ok===true?true:r.accounting_identity_ok===false?false:null,
      blockers:Object.freeze(blockers),
      base_fact_blockers:Object.freeze(baseFacts),
      complete_verified:completeVerified,
      state
    });
  }

  function summarize(afterRows,paperRows,crosswalkApi){
    const after=arr(afterRows).map(unwrap);
    const paper=arr(paperRows).map(unwrap);
    const cw=crosswalkApi&&typeof crosswalkApi.summarize==="function"
      ?crosswalkApi.summarize(after,paper)
      :{unique_links:[],ambiguous_candidate_links:0,truly_orphan_after_cost:after.length,truly_orphan_paper:paper.length};
    const unique=arr(cw.unique_links);
    const linked=unique.map(link=>{
      const row=after[link.after_index];
      return Object.freeze({
        after_index:link.after_index,
        paper_index:link.paper_index,
        classification:link.classification||"UNKNOWN",
        shared_values:Object.freeze(arr(link.shared_values)),
        analysis:analyzeAfter(row)
      });
    });
    const countBlocker=name=>linked.filter(x=>x.analysis.blockers.includes(name)).length;
    const completeVerified=linked.filter(x=>x.analysis.complete_verified).length;
    const partial=linked.filter(x=>!x.analysis.complete_verified).length;
    const mismatch=linked.filter(x=>x.analysis.state==="ACCOUNTING_MISMATCH").length;
    const baseIncomplete=linked.filter(x=>x.analysis.state==="BASE_FACTS_INCOMPLETE").length;
    const state=(cw.ambiguous_candidate_links||0)>0?"IDENTITY_AMBIGUOUS":
      linked.length===0?"NO_UNIQUE_LINKS":
      mismatch>0?"ACCOUNTING_MISMATCH_REVIEW":
      completeVerified===linked.length?"COMPLETE_VERIFIED_FOR_REVIEW":
      "COST_INPUTS_INCOMPLETE";
    return Object.freeze({
      schema:"agent_crypto_strategy_a_after_cost_completeness_truth_v1",
      build:BUILD,
      after_cost_rows:after.length,
      paper_rows:paper.length,
      unique_linked_rows:linked.length,
      identity_ambiguous_links:cw.ambiguous_candidate_links||0,
      complete_verified:completeVerified,
      incomplete_or_unverified:partial,
      accounting_mismatch:mismatch,
      base_facts_incomplete:baseIncomplete,
      missing_fees_rows:countBlocker("fees_eur"),
      missing_impact_rows:countBlocker("impact_eur"),
      missing_spread_rows:countBlocker("spread_eur"),
      missing_slippage_rows:countBlocker("slippage_eur"),
      true_orphan_after_cost:cw.truly_orphan_after_cost??null,
      true_orphan_paper:cw.truly_orphan_paper??null,
      linked_rows:Object.freeze(linked.map(clone)),
      state,
      diagnostic_only:true,
      certifies_g1:false,
      certifies_g8:false,
      promotes_gate:false,
      mutates_evidence:false,
      storage_write:false,
      paper_only:true,
      real_orders:false
    });
  }

  function durableReady(){
    try{return globalThis.AgentCryptoStrategyADurableEvidence?.snapshot?.()?.ready===true;}catch(_){return false;}
  }
  function snapshot(){
    const durable=globalThis.AgentCryptoStrategyADurableEvidence;
    const crosswalk=globalThis.AgentCryptoStrategyAEvidenceIdentityCrosswalk;
    const after=safe(durable?.read_after_cost,[]);
    const paper=safe(durable?.read_paper_states,[]);
    const s=summarize(after,paper,crosswalk);
    return durableReady()?s:Object.freeze({...s,state:"DURABLE_LOADING",durable_ready:false});
  }

  function selfTest(){
    const crosswalk={
      summarize(after,paper){
        return {
          unique_links:[
            {after_index:0,paper_index:0,classification:"MULTI_ID_MATCH",shared_values:["E1","R1"]},
            {after_index:1,paper_index:1,classification:"EXACT_EXECUTION_MATCH",shared_values:["E2"]},
            {after_index:2,paper_index:2,classification:"RECONCILIATION_MATCH",shared_values:["R3"]}
          ],
          ambiguous_candidate_links:0,truly_orphan_after_cost:0,truly_orphan_paper:1
        };
      }
    };
    const after=[
      {identity:"R1",execution_id:"E1",reconciliation_id:"R1",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,net_pnl_eur:4,
       costs:{entry_fee_eur:1,exit_fee_eur:1,impact_eur:1,spread_eur:2,slippage_eur:1},cost_completeness:"COMPLETE",accounting_identity_status:"VERIFIED",accounting_identity_ok:true},
      {identity:"R2",execution_id:"E2",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,net_pnl_eur:6,
       costs:{entry_fee_eur:1,exit_fee_eur:1,impact_eur:2,spread_eur:"UNKNOWN",slippage_eur:"UNKNOWN"},cost_completeness:"PARTIAL_MODEL",accounting_identity_status:"INDETERMINATE_COSTS",accounting_identity_ok:null},
      {identity:"R3",reconciliation_id:"R3",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,net_pnl_eur:5,
       costs:{entry_fee_eur:null,exit_fee_eur:null,impact_eur:"UNKNOWN",spread_eur:1,slippage_eur:1},cost_completeness:"PARTIAL_MODEL",accounting_identity_status:"INDETERMINATE_COSTS",accounting_identity_ok:null}
    ];
    const paper=[{execution_id:"E1"},{execution_id:"E2"},{reconciliation_id:"R3"},{execution_id:"P9"}];
    const s=summarize(after,paper,crosswalk);
    const checks=Object.freeze({
      three_unique_links:s.unique_linked_rows===3,
      one_complete_verified:s.complete_verified===1,
      spread_missing_detected:s.missing_spread_rows===1,
      slippage_missing_detected:s.missing_slippage_rows===1,
      fees_missing_detected:s.missing_fees_rows===1,
      impact_missing_detected:s.missing_impact_rows===1,
      orphan_paper_preserved:s.true_orphan_paper===1,
      no_certification:s.certifies_g1===false&&s.certifies_g8===false&&s.promotes_gate===false,
      read_only:s.mutates_evidence===false&&s.storage_write===false
    });
    return Object.freeze({schema:"agent_crypto_strategy_a_after_cost_completeness_self_test_v1",build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }

  function ensureStyle(){
    if(typeof document==="undefined"||document.getElementById(STYLE))return;
    const st=document.createElement("style");st.id=STYLE;
    st.textContent=`#${ROOT}{margin-top:10px;padding:10px;border:1px solid rgba(255,190,92,.22);border-radius:10px;background:rgba(28,17,5,.42)}#${ROOT} .ac-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}#${ROOT} .ac-title{font-size:10px;font-weight:950;letter-spacing:.08em;color:#ffd48a;text-transform:uppercase}#${ROOT} .ac-sub,#${ROOT} .ac-foot{font-size:8px;line-height:1.4;color:#b9a37d;margin-top:4px}#${ROOT} .ac-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:9px}#${ROOT} .ac-k{padding:7px;border:1px solid rgba(255,255,255,.065);border-radius:8px;background:rgba(18,11,3,.34)}#${ROOT} .ac-k span{display:block;font-size:7px;color:#a58e68;text-transform:uppercase;font-weight:900}#${ROOT} .ac-k b{display:block;margin-top:3px;font-size:10px;color:#fff5e5}#${ROOT} .ac-list{margin-top:8px;display:grid;gap:5px}#${ROOT} .ac-row{display:grid;grid-template-columns:1.2fr .8fr 1fr 2fr;gap:6px;padding:6px 7px;border:1px solid rgba(255,255,255,.06);border-radius:7px;font-size:8px;color:#ddcdb3}#${ROOT} .ac-row b{color:#fff4df}#${ROOT} .ac-state{margin-top:8px;padding:8px;border:1px solid rgba(255,211,92,.18);border-radius:8px;color:#ecd7a2;font-size:8px;line-height:1.4}@media(max-width:1000px){#${ROOT} .ac-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#${ROOT} .ac-row{grid-template-columns:1fr 1fr}}`;
    document.head.appendChild(st);
  }

  function exportJson(){
    const payload={...snapshot(),exported_at:new Date().toISOString()};
    if(typeof document!=="undefined"){
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download="STRATEGY_A_AFTER_COST_COMPLETENESS_TRUTH_40_6_462.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),0);
    }
    return payload;
  }

  function render(){
    if(typeof document==="undefined")return false;
    ensureStyle();
    const anchor=document.getElementById("strategyAEvidenceIdentityCrosswalk")||document.getElementById("strategyADurableEvidenceReconciliation");
    if(!anchor)return false;
    let root=document.getElementById(ROOT);
    if(!root){root=document.createElement("section");root.id=ROOT;anchor.insertAdjacentElement("afterend",root);}
    const s=snapshot(),ready=s.state!=="DURABLE_LOADING",show=v=>ready?String(v):"…";
    const rows=ready?s.linked_rows.map((x,i)=>{
      const a=x.analysis;
      const miss=[...a.blockers,...a.base_fact_blockers];
      return `<div class="ac-row"><div><b>Lien ${i+1}</b> · ${x.classification}</div><div>${a.cost_completeness}</div><div>${a.accounting_identity_status}</div><div>${miss.length?miss.join(" · "):"aucun blocage détecté"}</div></div>`;
    }).join(""):"";
    root.innerHTML=`<div class="ac-head"><div><div class="ac-title">STRATEGY A · AFTER-COST COMPLETENESS TRUTH · ${BUILD}</div><div class="ac-sub">Analyse uniquement les liens 1↔1 uniques établis par le Crosswalk. Montre pourquoi COMPLETE + VERIFIED n'est pas atteint.</div></div><button class="btn small" id="${ROOT}Export" type="button">EXPORTER</button></div>
      <div class="ac-grid">
        <div class="ac-k"><span>Liens uniques analysés</span><b>${show(s.unique_linked_rows)}</b></div>
        <div class="ac-k"><span>COMPLETE + VERIFIED</span><b>${ready?(s.complete_verified+"/"+s.unique_linked_rows):"…"}</b></div>
        <div class="ac-k"><span>Frais manquants</span><b>${show(s.missing_fees_rows)}</b></div>
        <div class="ac-k"><span>Impact manquant</span><b>${show(s.missing_impact_rows)}</b></div>
        <div class="ac-k"><span>Spread manquant</span><b>${show(s.missing_spread_rows)}</b></div>
        <div class="ac-k"><span>Slippage manquant</span><b>${show(s.missing_slippage_rows)}</b></div>
        <div class="ac-k"><span>Mismatch comptable</span><b>${show(s.accounting_mismatch)}</b></div>
        <div class="ac-k"><span>Faits de base incomplets</span><b>${show(s.base_facts_incomplete)}</b></div>
        <div class="ac-k"><span>PAPER orphelins conservés</span><b>${show(s.true_orphan_paper)}</b></div>
      </div>
      <div class="ac-list">${ready?(rows||'<div class="ac-row"><div>Aucun lien unique à analyser</div></div>'):'<div class="ac-row"><div>Preuve durable en cours de chargement…</div></div>'}</div>
      <div class="ac-state"><b>État : ${s.state}</b> · cette vue ne complète aucun coût et ne certifie aucun gate. UNKNOWN reste UNKNOWN.</div>
      <div class="ac-foot">Composants vérifiés : fees_eur · impact_eur · spread_eur · slippage_eur + faits de base et identité comptable. Aucun enregistrement n'est modifié.</div>`;
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",exportJson,{once:true});
    return true;
  }

  const api=Object.freeze({
    build:BUILD,snapshot,summarize,analyze_after:analyzeAfter,self_test:selfTest,render,export_json:exportJson,
    diagnostic_only:true,certifies_g1:false,certifies_g8:false,promotes_gate:false,
    mutates_evidence:false,storage_write:false,paper_only:true,real_orders:false,
    network:false,thresholds_changed:false,recurring_timer:false,observer:false
  });
  globalThis.AgentCryptoStrategyAAfterCostCompletenessTruth=api;
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