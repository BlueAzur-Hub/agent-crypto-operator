/* Agent-Crypto @erith.IA — 40.6.439 STRATEGY A ORACLE / COST CALIBRATION TRUTH · PROGRESSIVE RECOVERY
   Read-only semantic and calibration audit.
   No threshold, Oracle math, Strategy A decision, Risk, Paper, Market Core, network,
   recurring timer, observer or storage mutation. */
(() => {
  "use strict";
  const BUILD="40.6.439";
  const ROOT="strategyAOracleCostCalibrationAudit";
  const presentationOpen=()=>{const node=document.getElementById("simulation");return !(node instanceof HTMLDetailsElement)||node.open===true;};
  const EVENT="agent-crypto:strategy-a-experiment-cycle";
  let last=null,queued=false,reason="boot";
  const num=v=>v===null||v===undefined||v===""||typeof v==="boolean"?null:(Number.isFinite(Number(v))?Number(v):null);
  const pct=v=>Number.isFinite(v)?(v>=0?"+":"")+Number(v).toFixed(3)+" %":"—";
  const esc=v=>String(v??"—").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  function costTruth(){
    let costs=null,spec=null;
    try{costs=globalThis.AgentCryptoStrategyAV2?.costs?.()||null;}catch(_){}
    try{spec=globalThis.AgentCryptoStrategyACanonicalSpec?.spec||null;}catch(_){}
    const buy=num(costs?.buy_fee_pct),entry=num(costs?.entry_impact_pct),sell=num(costs?.sell_fee_pct),exit=num(costs?.exit_impact_pct);
    const total=num(costs?.total_pct),required=num(costs?.required_move_pct);
    const safety=num(spec?.policy?.cost_safety_margin_pct)??0.20;
    return Object.freeze({
      buy_fee_pct:buy,entry_impact_pct:entry,sell_fee_pct:sell,exit_impact_pct:exit,
      aggregate_modelled_cost_pct:total,required_move_pct:required,safety_margin_pct:safety,
      source_owner:"Strategy A Simulation cost fields / pedagogical fallback",
      real_platform_fee_verified:false,real_spread_verified:false,real_slippage_verified:false,
      semantic_status:"MODELLED_SIMULATION_COST_NOT_REAL_EXECUTION_PROOF",
      note:String(spec?.cost_model_note||"0.60% is a modelled cost floor; no verified real fee/spread/slippage breakdown is asserted.")
    });
  }

  function oracleTruth(){
    return Object.freeze({
      strategy_source:"atlasOracleBuildModel(BTC).bullAmplitude",
      strategy_alias:"expected_move_pct",
      canonical_semantic:"UPSIDE_ENVELOPE_AMPLITUDE",
      trained_probability:false,
      calibrated_expected_return:false,
      formula_family:"riskEnvelope × horizon amplitudeScale × directional strength / short tilt, then clamp",
      horizon_scales:Object.freeze({"1m":0.085,"5m":0.180,"15m":0.320}),
      source_owner:"administrator/app.js · atlasOracleBuildModel",
      semantic_status:"ENVELOPE_USED_AS_EXPECTED_MOVE_ALIAS"
    });
  }

  function outcomeTruth(){
    let s=null;
    try{s=globalThis.AgentCryptoStrategyACostWaitOutcomeAudit406429?.snapshot?.()||null;}catch(_){}
    const c=s?.counts||{},st=s?.statistics||{};
    const total=num(c.total_cost_wait)||0,resolved=num(c.resolved_t60)||0,unknown=num(c.unknown)||0;
    const mfe=num(st.mfe_median_pct),expected=num(st.expected_move_median_pct);
    const delta=Number.isFinite(mfe)&&Number.isFinite(expected)?mfe-expected:num(st.sampled_mfe_minus_expected_median_pct);
    return Object.freeze({
      total_cost_wait:total,resolved_t60:resolved,unknown,
      protective:num(c.protective)||0,covers_costs_without_margin:num(c.covers_costs_without_margin)||0,
      threshold_exceeded_after_refusal:num(c.threshold_exceeded_after_refusal)||0,
      mfe_median_pct:mfe,mfe_p75_pct:num(st.mfe_p75_pct),mfe_p90_pct:num(st.mfe_p90_pct),
      oracle_envelope_median_pct:expected,mfe_minus_oracle_envelope_median_pct:delta,
      coverage_pct:total>0?resolved/total*100:null,
      source_build:s?.build||null,
      source_sampling:s?.outcome_sampling||null
    });
  }

  function snapshot(){
    const cost=costTruth(),oracle=oracleTruth(),outcomes=outcomeTruth();
    const flags=[];
    if(cost.real_platform_fee_verified!==true)flags.push("COST_MODEL_NOT_VERIFIED_REAL");
    if(oracle.calibrated_expected_return!==true)flags.push("ORACLE_ENVELOPE_NOT_CALIBRATED_EXPECTED_RETURN");
    if(Number.isFinite(outcomes.mfe_minus_oracle_envelope_median_pct)&&outcomes.mfe_minus_oracle_envelope_median_pct<0)flags.push("OBSERVED_MFE_BELOW_ORACLE_ENVELOPE");
    if(outcomes.unknown>0)flags.push("OUTCOME_COVERAGE_INCOMPLETE");
    last=Object.freeze({
      schema:"agent_crypto_strategy_a_oracle_cost_calibration_truth_v1",
      build:BUILD,generated_at:new Date().toISOString(),reason,
      status:flags.length?"REVIEW_REQUIRED":"OBSERVED_OK",
      flags:Object.freeze(flags),cost_model:cost,oracle_semantics:oracle,outcomes,
      conclusion:"Do not change Strategy A thresholds from this audit alone. First separate verified execution costs from the pedagogical model and calibrate Oracle bullAmplitude against observed forward MFE.",
      thresholds_changed:false,oracle_math_changed:false,strategy_decision_changed:false,risk_changed:false,paper_changed:false,market_core_changed:false,
      new_fetch:false,new_websocket:false,recurring_timer:false,mutation_observer:false,storage_write:false,real_order:false,paper_only:true
    });
    return last;
  }

  function style(){
    if(typeof document==="undefined"||document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");s.id=ROOT+"Style";
    s.textContent="#"+ROOT+"{margin-top:9px;padding:10px;border:1px solid rgba(168,132,255,.25);border-radius:10px;background:rgba(19,11,35,.28)}#"+ROOT+" .occ-h{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}#"+ROOT+" .occ-t{font-size:9px;font-weight:950;letter-spacing:.08em;color:#d7c1ff;text-transform:uppercase}#"+ROOT+" .occ-s{margin-top:3px;font-size:8px;line-height:1.4;color:#a89bbc}#"+ROOT+" .occ-g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:8px}#"+ROOT+" .occ-k{padding:7px;border:1px solid rgba(255,255,255,.06);border-radius:8px;background:rgba(0,0,0,.14)}#"+ROOT+" .occ-k span{display:block;font-size:7px;color:#9184a8;text-transform:uppercase}#"+ROOT+" .occ-k b{display:block;margin-top:3px;font-size:9px;color:#f2ebff}#"+ROOT+" .occ-note{margin-top:7px;padding:7px;border:1px solid rgba(255,255,255,.05);border-radius:8px;font-size:8px;line-height:1.5;color:#b8accb}#"+ROOT+" .occ-warn{color:#ffd38a;font-weight:800}@media(max-width:900px){#"+ROOT+" .occ-g{grid-template-columns:repeat(2,minmax(0,1fr))}}";
    document.head.appendChild(s);
  }

  function exportJson(data){
    try{const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="STRATEGY_A_ORACLE_COST_CALIBRATION_TRUTH_40_6_439.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return true;}catch(_){return false;}
  }

  function render(){
    if(typeof document==="undefined")return snapshot();
    if(!presentationOpen())return last;
    const data=snapshot();
    const anchor=document.getElementById("strategyACostWaitOutcomeAudit406429")||document.getElementById("strategyADurableEvidence")||document.getElementById("strategyAExperimentLedger");
    if(!anchor)return data;
    style();
    let root=document.getElementById(ROOT);if(!root){root=document.createElement("section");root.id=ROOT;}
    if(root.previousElementSibling!==anchor){try{anchor.insertAdjacentElement("afterend",root);}catch(_){}}
    const c=data.cost_model,o=data.oracle_semantics,x=data.outcomes;
    root.innerHTML='<div class="occ-h"><div><div class="occ-t">STRATEGY A · ORACLE / COST CALIBRATION TRUTH · '+BUILD+'</div><div class="occ-s">Audit sémantique en lecture seule · aucun seuil ni moteur modifié.</div></div><button type="button" class="btn small" id="'+ROOT+'Export">EXPORTER</button></div>'+
      '<div class="occ-g"><div class="occ-k"><span>Coût modélisé</span><b>'+esc(pct(c.aggregate_modelled_cost_pct))+'</b></div><div class="occ-k"><span>Seuil actuel</span><b>'+esc(pct(c.required_move_pct))+'</b></div><div class="occ-k"><span>Enveloppe Oracle médiane</span><b>'+esc(pct(x.oracle_envelope_median_pct))+'</b></div><div class="occ-k"><span>MFE médiane observée</span><b>'+esc(pct(x.mfe_median_pct))+'</b></div></div>'+
      '<div class="occ-note"><span class="occ-warn">COÛT :</span> '+esc(pct(c.aggregate_modelled_cost_pct))+' = achat '+esc(pct(c.buy_fee_pct))+' + impact entrée '+esc(pct(c.entry_impact_pct))+' + vente '+esc(pct(c.sell_fee_pct))+' + impact sortie '+esc(pct(c.exit_impact_pct))+'. Ces valeurs viennent des champs Simulation / fallback pédagogique ; frais réels de plateforme, spread réel et slippage réel non vérifiés.<br><span class="occ-warn">ORACLE :</span> Strategy A appelle <b>expected_move_pct</b> la valeur <b>bullAmplitude</b>. C\'est une enveloppe déterministe de scénario, pas une probabilité entraînée ni un rendement attendu calibré.<br><span class="occ-warn">OBSERVÉ :</span> couverture T+60 '+esc(Number.isFinite(x.coverage_pct)?x.coverage_pct.toFixed(1)+" %":"—")+' · MFE − enveloppe médiane '+esc(pct(x.mfe_minus_oracle_envelope_median_pct))+'.<br><b>Conclusion :</b> ne pas recalibrer le seuil à partir de cette seule mesure ; séparer d\'abord coût d\'exécution vérifié et modèle pédagogique, puis calibrer bullAmplitude contre la MFE réelle.</div>';
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",()=>exportJson(data));
    root.dataset.auditBuild=BUILD;root.dataset.readOnly="true";return data;
  }

  function schedule(r="event"){reason=String(r||"event");if(queued)return;queued=true;const run=()=>{queued=false;try{render();}catch(_){}};try{queueMicrotask(run);}catch(_){setTimeout(run,0);}}

  function selfTest(){
    const c=costTruth(),o=oracleTruth();
    const checks={
      cost_components:Number.isFinite(c.buy_fee_pct)&&Number.isFinite(c.entry_impact_pct)&&Number.isFinite(c.sell_fee_pct)&&Number.isFinite(c.exit_impact_pct),
      cost_unverified:c.real_platform_fee_verified===false&&c.real_spread_verified===false&&c.real_slippage_verified===false,
      oracle_envelope:o.canonical_semantic==="UPSIDE_ENVELOPE_AMPLITUDE",
      oracle_not_probability:o.trained_probability===false&&o.calibrated_expected_return===false,
      read_only:true
    };
    return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks:Object.freeze(checks)});
  }

  globalThis.AgentCryptoStrategyAOracleCostCalibrationAudit=Object.freeze({
    build:BUILD,snapshot:()=>last||snapshot(),refresh:r=>{reason=String(r||"api");return render();},export_json:()=>exportJson(last||snapshot()),self_test:selfTest,
    thresholds_changed:false,oracle_math_changed:false,strategy_decision_changed:false,risk_changed:false,paper_changed:false,market_core_changed:false,
    new_fetch:false,new_websocket:false,recurring_timer:false,mutation_observer:false,storage_write:false,real_order:false,paper_only:true
  });
  if(typeof document!=="undefined"){
    document.addEventListener(EVENT,()=>schedule(EVENT),{passive:true});
    document.addEventListener("agent-crypto:strategy-a-durable-evidence-ready",()=>schedule("durable-evidence-ready"),{passive:true});
    document.addEventListener("toggle",e=>{if(e?.target?.id==="simulation"&&e.target.open===true)schedule("simulation-open");},true);
    window.addEventListener("pageshow",()=>schedule("pageshow"),{passive:true});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>schedule("dom-ready"),{once:true});else schedule("script-load");
  }
})();