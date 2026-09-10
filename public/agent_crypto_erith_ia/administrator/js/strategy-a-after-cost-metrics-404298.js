/*
  Agent-Crypto Administrator — Strategy A actual Paper after-cost evidence
  Build: 40.6.17
  Responsibility: preserve one canonical after-cost row per Paper reconciliation.
  Complete accounting identity is verified only when every required cost is known.
  Null, blank, boolean, missing and invalid external numeric facts stay UNKNOWN.
  Negative cost facts are invalid evidence, never silently clamped to zero.
  Incomplete cost models remain evidence but their identity is INDETERMINATE.
  UNKNOWN cost components are never promoted to a verified zero. No profitability claim.
*/
(() => {
  "use strict";
  const BUILD="40.6.17";
  const SCHEMA="agent_crypto_strategy_a_after_cost_metrics_v2";
  const SAMPLE_MIN=30;
  const ACCOUNTING_TOLERANCE_EUR=1e-8;
  const ROWS=[];
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const finite=v=>{
    if(v===null||v===undefined||typeof v==="boolean")return false;
    if(typeof v==="string"&&!v.trim())return false;
    return Number.isFinite(Number(v));
  };
  const val=v=>finite(v)?Number(v):null;
  const nonneg=v=>{const n=val(v);return n!==null&&n>=0?n:null;};
  function identity(row){return String(row?.reconciliation_id||row?.execution_id||"").trim();}
  function fromReconciliation(row={}){
    const id=identity(row); if(!id)return {ok:false,reason:"RECONCILIATION_ID_MISSING"};
    if(ROWS.some(r=>r.identity===id))return {ok:false,reason:"DUPLICATE_RECONCILIATION",identity:id};
    const qty=val(row.quantity_btc),entryRef=val(row.entry_reference_eur),exitRef=val(row.exit_reference_eur),net=val(row.net_pnl_eur);
    if(!(qty>0)||!(entryRef>0)||!(exitRef>0)||net===null)return {ok:false,reason:"INCOMPLETE_RECONCILIATION_FACTS",identity:id};

    const entryFee=nonneg(row.entry_fee_eur),exitFee=nonneg(row.exit_fee_eur),impact=nonneg(row.estimated_total_impact_eur);
    const spread=nonneg(row.spread_eur),slippage=nonneg(row.slippage_eur);
    const unknown=[];
    if(entryFee===null||exitFee===null)unknown.push("fees_eur");
    if(impact===null)unknown.push("impact_eur");
    if(spread===null)unknown.push("spread_eur");
    if(slippage===null)unknown.push("slippage_eur");

    const fees=entryFee===null||exitFee===null?null:entryFee+exitFee;
    const knownComponents=[entryFee,exitFee,impact,spread,slippage].filter(v=>v!==null);
    const knownCostCount=knownComponents.length;
    const knownCosts=knownComponents.reduce((sum,v)=>sum+v,0);
    const knownCostsValue=knownCostCount>0?knownCosts:"UNKNOWN";
    const referenceGross=(exitRef-entryRef)*qty;
    const modeledNetKnown=referenceGross-knownCosts;
    const complete=unknown.length===0;
    const totalCosts=complete?knownCosts:"UNKNOWN";
    const expectedNet=complete?referenceGross-knownCosts:null;
    const identityError=complete?net-expectedNet:null;
    const accountingOk=complete?Math.abs(identityError)<=ACCOUNTING_TOLERANCE_EUR:null;
    const accountingStatus=complete?(accountingOk?"VERIFIED":"MISMATCH"):"INDETERMINATE_COSTS";

    // A complete cost model with a contradictory accounting identity must never
    // enter the canonical evidence ledger. Partial models are retained, but
    // they are explicitly non-verifiable until their missing costs are known.
    if(complete && !accountingOk){
      return {
        ok:false,reason:"ACCOUNTING_IDENTITY_MISMATCH",identity:id,
        observed_net_pnl_eur:net,expected_net_pnl_eur:expectedNet,
        accounting_identity_error_eur:identityError,
        accounting_tolerance_eur:ACCOUNTING_TOLERANCE_EUR
      };
    }

    const out={
      schema:SCHEMA,build:BUILD,identity:id,reconciliation_id:row.reconciliation_id||null,execution_id:row.execution_id||null,trade_id:row.execution_id||id,
      at:String(row.closed_at||new Date().toISOString()),symbol:String(row.symbol||"BTC").toUpperCase(),paper_only:true,real_order:false,
      quantity_btc:qty,entry_reference_eur:entryRef,exit_reference_eur:exitRef,reference_gross_pnl_eur:referenceGross,
      costs:{entry_fee_eur:entryFee,exit_fee_eur:exitFee,fees_eur:fees===null?"UNKNOWN":fees,impact_eur:impact===null?"UNKNOWN":impact,spread_eur:spread===null?"UNKNOWN":spread,slippage_eur:slippage===null?"UNKNOWN":slippage},
      known_costs_eur:knownCostsValue,known_cost_components:knownCostCount,total_costs_eur:totalCosts,cost_completeness:complete?"COMPLETE":"PARTIAL_MODEL",unknown_cost_components:unknown,
      authoritative_net_pnl_eur:net,net_pnl_eur:net,modeled_net_known_costs_eur:modeledNetKnown,
      expected_net_pnl_eur:expectedNet,accounting_identity_error_eur:identityError,accounting_identity_ok:accountingOk,
      accounting_identity_status:accountingStatus,accounting_tolerance_eur:ACCOUNTING_TOLERANCE_EUR,
      ledger_consistency_status:complete?"VERIFIED":"PARTIAL_COST_MODEL",
      profitability_claim:false,source_owner:"strategyAReconcile404264"
    };
    ROWS.push(out);render();return {ok:true,row:clone(out)};
  }
  function summary(rows=ROWS){
    const list=(Array.isArray(rows)?rows:[]).filter(Boolean),n=list.length,complete=list.filter(r=>r.cost_completeness==="COMPLETE").length;
    const verified=list.filter(r=>r.accounting_identity_status==="VERIFIED").length;
    const indeterminate=list.filter(r=>r.accounting_identity_status==="INDETERMINATE_COSTS").length;
    const wins=list.filter(r=>val(r.net_pnl_eur)>0).length,losses=list.filter(r=>val(r.net_pnl_eur)<0).length;
    const refGross=list.reduce((a,r)=>a+(val(r.reference_gross_pnl_eur)??0),0),net=list.reduce((a,r)=>a+(val(r.net_pnl_eur)??0),0);
    const knownValues=list.map(r=>val(r.known_costs_eur)).filter(v=>v!==null);
    const known=knownValues.length?knownValues.reduce((a,v)=>a+v,0):"UNKNOWN";
    let equity=0,peak=0,maxDd=0;for(const r of list){equity+=val(r.net_pnl_eur)??0;peak=Math.max(peak,equity);maxDd=Math.max(maxDd,peak-equity);}
    const allComplete=n>0&&complete===n;
    const allVerified=n>0&&verified===n;
    return {schema:"agent_crypto_strategy_a_after_cost_summary_v2",build:BUILD,trades:n,complete_cost_trades:complete,verified_accounting_trades:verified,indeterminate_accounting_trades:indeterminate,winners:wins,losers:losses,win_rate_pct:n?wins/n*100:0,reference_gross_pnl_eur:refGross,known_cost_rows:knownValues.length,known_costs_eur:known,total_costs_eur:allComplete?list.reduce((a,r)=>a+Number(r.total_costs_eur),0):"UNKNOWN",net_pnl_eur:net,expectancy_eur_per_trade:n?net/n:0,max_drawdown_eur:maxDd,sample_state:n<SAMPLE_MIN?"INSUFFICIENT_SAMPLE":allComplete&&allVerified?"SAMPLE_READY":"COST_MODEL_INCOMPLETE",sample_min:SAMPLE_MIN,cost_model_complete:allComplete,ledger_consistency_complete:allVerified,profitability_claim:false,paper_only:true};
  }
  function selfTest(){
    const saved=ROWS.splice(0);try{
      const partial={reconciliation_id:"T317-P",execution_id:"E317-P",closed_at:"2026-01-01T00:00:00Z",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,entry_fee_eur:1,exit_fee_eur:1,estimated_total_impact_eur:2,net_pnl_eur:6};
      const p=fromReconciliation(partial),dup=fromReconciliation(partial);
      const complete={reconciliation_id:"T317-C",execution_id:"E317-C",closed_at:"2026-01-01T00:01:00Z",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,entry_fee_eur:1,exit_fee_eur:1,estimated_total_impact_eur:1,spread_eur:2,slippage_eur:1,net_pnl_eur:4};
      const c=fromReconciliation(complete);
      const mismatch=fromReconciliation({...complete,reconciliation_id:"T317-M",execution_id:"E317-M",net_pnl_eur:5});
      const unknown=fromReconciliation({reconciliation_id:"T317-U",execution_id:"E317-U",closed_at:"2026-01-01T00:02:00Z",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,entry_fee_eur:null,exit_fee_eur:"",estimated_total_impact_eur:false,spread_eur:null,slippage_eur:"   ",net_pnl_eur:10});
      const s=summary();
      const unknownTruth=unknown.ok===true&&unknown.row.known_costs_eur==="UNKNOWN"&&unknown.row.known_cost_components===0&&unknown.row.total_costs_eur==="UNKNOWN"&&unknown.row.accounting_identity_ok===null&&unknown.row.accounting_identity_status==="INDETERMINATE_COSTS"&&unknown.row.unknown_cost_components.includes("fees_eur")&&unknown.row.unknown_cost_components.includes("impact_eur")&&unknown.row.unknown_cost_components.includes("spread_eur")&&unknown.row.unknown_cost_components.includes("slippage_eur");
      const pass=p.ok===true&&dup.reason==="DUPLICATE_RECONCILIATION"&&p.row.cost_completeness==="PARTIAL_MODEL"&&p.row.total_costs_eur==="UNKNOWN"&&p.row.accounting_identity_ok===null&&c.ok===true&&c.row.accounting_identity_ok===true&&c.row.total_costs_eur===6&&mismatch.reason==="ACCOUNTING_IDENTITY_MISMATCH"&&unknownTruth&&s.trades===3&&s.verified_accounting_trades===1&&s.indeterminate_accounting_trades===2&&s.known_cost_rows===2&&s.total_costs_eur==="UNKNOWN"&&s.profitability_claim===false;
      return {schema:"agent_crypto_strategy_a_after_cost_self_test_v4",build:BUILD,pass,checks:{unknown_null_blank_boolean_not_zero:unknownTruth,partial_identity_indeterminate:p.row.accounting_identity_ok===null,duplicate_refused:dup.reason==="DUPLICATE_RECONCILIATION",complete_identity_verified:c.row.accounting_identity_ok===true,spread_slippage_in_complete_identity:c.row.total_costs_eur===6,contradictory_complete_identity_refused:mismatch.reason==="ACCOUNTING_IDENTITY_MISMATCH",mismatch_not_recorded:s.trades===3,no_profitability_claim:s.profitability_claim===false}};
    }finally{ROWS.splice(0);ROWS.push(...saved);render();}
  }
  function exportJson(){const payload={schema:"agent_crypto_strategy_a_after_cost_export_v2",build:BUILD,exported_at:new Date().toISOString(),summary:summary(),trades:clone(ROWS)||[],paper_only:true,real_orders:false};if(typeof document!=="undefined"){const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="STRATEGY_A_AFTER_COST_METRICS.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),0);}return payload;}
  function ensureStyle(){if(typeof document==="undefined")return;document.getElementById("strategyAAfterCostStyle404292")?.remove();if(document.getElementById("strategyAAfterCostStyle404298"))return;const st=document.createElement("style");st.id="strategyAAfterCostStyle404298";st.textContent=`#strategyAAfterCost404292{margin-top:10px;padding:10px;border:1px solid rgba(95,220,182,.22);border-radius:10px;background:rgba(3,23,20,.48)}#strategyAAfterCost404292 .sam-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:flex-start}#strategyAAfterCost404292 .sam-title{font-size:9px;font-weight:950;letter-spacing:.09em;color:#a8f1dc;text-transform:uppercase}#strategyAAfterCost404292 .sam-sub{font-size:8px;color:#7faaa0;margin-top:3px}#strategyAAfterCost404292 .sam-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;margin-top:8px}#strategyAAfterCost404292 .sam-k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px}#strategyAAfterCost404292 .sam-k span{display:block;font-size:7px;color:#78958e;text-transform:uppercase;font-weight:900}#strategyAAfterCost404292 .sam-k b{display:block;margin-top:3px;font-size:9px;color:#eefaf6}#strategyAAfterCost404292 .sam-foot{font-size:8px;color:#7e9c95;margin-top:7px}@media(max-width:950px){#strategyAAfterCost404292 .sam-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;document.head.appendChild(st);}
  function render(){if(typeof document==="undefined")return false;ensureStyle();const anchor=document.getElementById("strategyAPaperLifecycle404291")||document.getElementById("strategyAExperimentLedger404289");if(!anchor)return false;let p=document.getElementById("strategyAAfterCost404292");if(!p){p=document.createElement("section");p.id="strategyAAfterCost404292";anchor.insertAdjacentElement("afterend",p);}p.innerHTML=`<div class="sam-head"><div><div class="sam-title">PAPER V2 · ACTUAL AFTER-COST EVIDENCE</div><div class="sam-sub">Réconciliation Paper · identité comptable vérifiée seulement avec coûts complets · modèle partiel = indéterminé.</div></div><button class="btn small" type="button" id="strategyAAfterCostExport404298">EXPORTER</button></div><div class="sam-grid"><div class="sam-k"><span>Trades</span><b data-sam="trades">0</b></div><div class="sam-k"><span>Coûts complets</span><b data-sam="complete">0</b></div><div class="sam-k"><span>Brut référence</span><b data-sam="gross">0,00 €</b></div><div class="sam-k"><span>Coûts connus</span><b data-sam="costs">0,00 €</b></div><div class="sam-k"><span>Net moteur</span><b data-sam="net">0,00 €</b></div><div class="sam-k"><span>Échantillon</span><b data-sam="sample">INSUFFICIENT_SAMPLE</b></div></div><div class="sam-foot">Ledger : doublon refusé · identité complète contradictoire refusée · UNKNOWN reste non vérifiable tant que le coût manque.</div>`;p.querySelector("#strategyAAfterCostExport404298")?.addEventListener("click",exportJson);const s=summary(),set=(k,v)=>{const n=p.querySelector(`[data-sam="${k}"]`);if(n)n.textContent=v;};set("trades",s.trades);set("complete",`${s.complete_cost_trades}/${s.trades}`);const eur=v=>typeof v==="number"&&Number.isFinite(v)?`${v.toFixed(2)} €`:"UNKNOWN";set("gross",eur(s.reference_gross_pnl_eur));set("costs",eur(s.known_costs_eur));set("net",eur(s.net_pnl_eur));set("sample",s.sample_state);return true;}
  const api=Object.freeze({build:BUILD,schema:SCHEMA,from_reconciliation:fromReconciliation,record_from_reconciliation:fromReconciliation,read:()=>clone(ROWS)||[],summary,self_test:selfTest,export_json:exportJson,render,sample_min:SAMPLE_MIN,paper_only:true,real_orders:false,network:false,storage_write:false,profitability_claim:false,unknown_cost_is_zero:false,actual_paper_connected:true,ledger_consistency_406016:true,strict_unknown_semantics_406017:true,null_blank_boolean_unknown:true,negative_cost_not_zero:true,known_costs_unknown_when_none_known:true,complete_identity_mismatch_rejected:true,partial_cost_identity_indeterminate:true,accounting_tolerance_eur:ACCOUNTING_TOLERANCE_EUR});
  globalThis.AgentCryptoStrategyAAfterCostMetrics404298=api;
  globalThis.AgentCryptoStrategyAAfterCostMetrics404292=api;
  if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();}
})();
