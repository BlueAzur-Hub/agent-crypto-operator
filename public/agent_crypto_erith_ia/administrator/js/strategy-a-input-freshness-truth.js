/* Agent-Crypto @erith.IA — 40.6.479 STRATEGY A INPUT FRESHNESS TRUTH
   Read-only audit of the inputs actually visible in the latest Strategy A cycle.
   No threshold/gate change, no network, no storage write, no recurring timer,
   no MutationObserver, no Atlas CURRENT mutation, no real order. */
(()=>{
  "use strict";
  const BUILD="40.6.479";
  const ROOT="strategyAInputFreshnessTruth";
  const STYLE=ROOT+"Style";
  let last=null,queued=false;

  const num=v=>v===null||v===undefined||v===""||typeof v==="boolean"?null:(Number.isFinite(Number(v))?Number(v):null);
  const time=v=>{if(v===null||v===undefined||v==="")return null;const n=typeof v==="number"?v:Date.parse(String(v));return Number.isFinite(n)?n:null;};
  const esc=v=>String(v??"—").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const ageSec=ms=>Number.isFinite(ms)?Math.max(0,(Date.now()-ms)/1000):null;
  const ageText=s=>!Number.isFinite(s)?"N/D":s<60?Math.round(s)+" s":s<3600?(s/60).toFixed(1)+" min":(s/3600).toFixed(1)+" h";
  const stateFromAge=(s,limit)=>!Number.isFinite(s)?"UNKNOWN":s<=limit?"FRESH":"STALE";
  const bodyText=()=>String(document.body?.textContent||"").replace(/\u00a0/g," ").replace(/[ \t]+/g," ");

  function rows(){
    try{const r=globalThis.AgentCryptoStrategyAExperimentLedger?.read?.();if(Array.isArray(r)&&r.length)return r;}catch(_){}
    try{const r=globalThis.AgentCryptoStrategyADurableEvidence?.read_cycles?.();if(Array.isArray(r))return r;}catch(_){}
    return [];
  }
  function latestCycle(){
    return rows().filter(r=>time(r?.captured_at)!==null).sort((a,b)=>time(a.captured_at)-time(b.captured_at)).at(-1)||null;
  }
  function parseFrDate(text){
    const m=String(text||"").match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
    if(!m)return null;
    const iso=`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:${m[6]}`;
    const n=Date.parse(iso); return Number.isFinite(n)?n:null;
  }
  function atlasVisibleTruth(){
    const text=bodyText();
    const snap=text.match(/SNAPSHOT\s+MARCH[ÉE]\s+(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/i)?.[1]||null;
    const current=text.match(/CURRENT\s+PRODUIT\s+(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/i)?.[1]||null;
    const state=/CURRENT\s+ferm[ée]\s*[·•-]\s*moteur\s+au\s+repos/i.test(text)?"CLOSED_REST":(/CURRENT/i.test(text)?"VISIBLE":"UNKNOWN");
    return {snapshot_text:snap,current_text:current,snapshot_at:parseFrDate(snap),current_at:parseFrDate(current),state};
  }
  function executionCost(){
    try{return clone(globalThis.AgentCryptoStrategyAExecutionCostTruth?.snapshot?.())||null;}catch(_){return null;}
  }
  function news(){
    try{return clone(globalThis.AtlasEventIntelligence?.current?.())||null;}catch(_){return null;}
  }
  function model(){
    const cycle=latestCycle(),at=time(cycle?.captured_at),age=ageSec(at);
    const atlas=atlasVisibleTruth(),costShadow=executionCost(),costAt=time(costShadow?.generated_at),newsRow=news(),newsAt=time(newsRow?.generated_at||newsRow?.at||newsRow?.observed_at||newsRow?.published_at);
    const inputs=[
      {
        key:"cycle",label:"Cycle Strategy",role:"DECISION_FRAME",source:"Experiment Ledger / Durable Evidence",
        observed_at:cycle?.captured_at||null,age_seconds:age,freshness:stateFromAge(age,420),
        value:cycle?String(cycle.cycle_id||"cycle"):"AUCUN CYCLE"
      },
      {
        key:"market",label:"BTC prix + 24 h",role:"DIRECT_DECISION_INPUT",source:"cycle.market",
        observed_at:cycle?.captured_at||null,age_seconds:age,freshness:stateFromAge(age,420),
        value:cycle?`BTC ${num(cycle?.market?.price_eur)??"N/D"} € · 24 h ${num(cycle?.market?.change_24h_pct)??"N/D"} %`:"N/D",
        caveat:"Le cycle conserve la valeur et son heure de capture ; le timestamp upstream de la cotation n'est pas conservé dans cette ligne."
      },
      {
        key:"oracle",label:"Oracle / direction",role:"DIRECT_DECISION_INPUT",source:"cycle.oracle",
        observed_at:cycle?.captured_at||null,age_seconds:age,freshness:stateFromAge(age,420),
        value:cycle?`${String(cycle?.oracle?.regime||"UNKNOWN")} · direction ${num(cycle?.oracle?.direction_score)??"N/D"}/100 · conf. ${num(cycle?.oracle?.confidence)??"N/D"}/100`:"N/D",
        caveat:"Fraîcheur de capture connue ; timestamp propre du calcul Oracle non exposé dans la ligne de cycle."
      },
      {
        key:"cost_gate",label:"Cost Gate modèle",role:"DIRECT_DECISION_INPUT",source:"cycle.cost",
        observed_at:cycle?.captured_at||null,age_seconds:age,freshness:stateFromAge(age,420),
        value:cycle?`coût ${num(cycle?.cost?.total_cost_pct)??"N/D"} % · requis ${num(cycle?.cost?.required_move_pct)??"N/D"} % · attendu ${num(cycle?.cost?.expected_move_pct)??"N/D"} %`:"N/D",
        caveat:"Modèle décisionnel du cycle ; distinct de la mesure venue OKX/Kraken."
      },
      {
        key:"atlas_current",label:"Atlas CURRENT",role:"CONTEXT_VISIBLE_NOT_PROVEN_DIRECT",source:"provenance UI CURRENT",
        observed_at:atlas.current_text,age_seconds:ageSec(atlas.current_at),freshness:stateFromAge(ageSec(atlas.current_at),3600),
        value:`${atlas.state} · snapshot ${atlas.snapshot_text||"N/D"} · CURRENT ${atlas.current_text||"N/D"}`,
        caveat:"Ce module n'invente pas de causalité : il expose l'âge du CURRENT visible séparément des champs décisionnels capturés dans le cycle."
      },
      {
        key:"execution_cost",label:"Kraken + OKX mesuré",role:"EVIDENCE_SHADOW_NOT_GATE",source:"Execution Cost Truth",
        observed_at:costShadow?.generated_at||null,age_seconds:ageSec(costAt),freshness:stateFromAge(ageSec(costAt),120),
        value:costShadow?`${String(costShadow.status||"UNKNOWN")} · trigger ${String(costShadow.measurement_trigger||"—")}`:"N/D",
        caveat:"Mesure de preuve : ne remplace pas automatiquement le Cost Gate modélisé."
      },
      {
        key:"news",label:"News Sentinel",role:"CONTEXT_ONLY",source:"Event Intelligence",
        observed_at:newsRow?.generated_at||newsRow?.at||newsRow?.observed_at||newsRow?.published_at||null,
        age_seconds:ageSec(newsAt),freshness:stateFromAge(ageSec(newsAt),3600),
        value:newsRow?String(newsRow?.language?.display_headline||newsRow?.event_label||"événement disponible"):"N/D",
        caveat:"Aucun usage direct comme gate Strategy A n'est affirmé par cet audit."
      }
    ];
    const staleDirect=inputs.filter(x=>x.role==="DIRECT_DECISION_INPUT"&&x.freshness==="STALE");
    const unknownDirect=inputs.filter(x=>x.role==="DIRECT_DECISION_INPUT"&&x.freshness==="UNKNOWN");
    const atlasStale=inputs.find(x=>x.key==="atlas_current")?.freshness==="STALE";
    return Object.freeze({
      schema:"agent_crypto_strategy_a_input_freshness_truth_v1",build:BUILD,generated_at:new Date().toISOString(),
      latest_cycle_id:cycle?.cycle_id||null,latest_cycle_at:cycle?.captured_at||null,
      status:!cycle?"NO_CYCLE":staleDirect.length?"DIRECT_INPUT_STALE":unknownDirect.length?"DIRECT_INPUT_TIME_PARTIAL":atlasStale?"DIRECT_INPUTS_FRESH_AT_CAPTURE_ATLAS_CONTEXT_STALE":"OBSERVED_OK",
      inputs:Object.freeze(inputs.map(Object.freeze)),
      atlas_upstream:Object.freeze({visible:atlas,diagnosis:"CURRENT freshness is independent from Strategy cycle residency. Collector status must be audited separately."}),
      protections:Object.freeze({read_only:true,thresholds_changed:false,gates_changed:false,strategy_decision_changed:false,oracle_changed:false,cost_model_changed:false,market_core_changed:false,fetch:false,storage_write:false,recurring_timer:false,mutation_observer:false,real_order:false,paper_only:true})
    });
  }
  function ensureStyle(){
    if(document.getElementById(STYLE))return;
    const s=document.createElement("style");s.id=STYLE;
    s.textContent="#"+ROOT+"{margin-top:10px;padding:12px;border:1px solid rgba(135,189,255,.30);border-radius:10px;background:rgba(7,19,39,.34)}#"+ROOT+" .ift-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}#"+ROOT+" .ift-title{font-size:11px;font-weight:950;letter-spacing:.07em;color:#a9d8ff}#"+ROOT+" .ift-sub{margin-top:3px;font-size:9px;color:#8fa6bd;line-height:1.4}#"+ROOT+" .ift-status{font-size:10px;font-weight:900;color:#ffe19a}#"+ROOT+" table{width:100%;border-collapse:collapse;margin-top:9px;font-size:9.5px}#"+ROOT+" th,#"+ROOT+" td{padding:7px 6px;border-bottom:1px solid rgba(255,255,255,.06);text-align:left;vertical-align:top}#"+ROOT+" th{color:#8fa6bd;font-size:8px;text-transform:uppercase}#"+ROOT+" .FRESH{color:#8ff0c1}.STALE{color:#ffb17f}.UNKNOWN{color:#ffd77d}#"+ROOT+" .ift-note{margin-top:8px;font-size:9px;line-height:1.5;color:#9eb1c3}";
    document.head.appendChild(s);
  }
  function anchor(){return document.getElementById("strategyAProspectiveOutcomeEvidenceCapture")||document.getElementById("strategyAExecutionCostEvidenceCapture")||document.getElementById("strategyAExperimentLedger");}
  function render(){
    if(typeof document==="undefined")return model();
    const a=anchor();if(!a)return last;
    ensureStyle();let root=document.getElementById(ROOT);if(!root){root=document.createElement("section");root.id=ROOT;}
    if(root.previousElementSibling!==a){try{a.insertAdjacentElement("afterend",root);}catch(_){}}
    const m=model();last=m;
    const rows=m.inputs.map(x=>`<tr><td><b>${esc(x.label)}</b><br><small>${esc(x.role)}</small></td><td>${esc(x.value)}</td><td>${esc(x.observed_at||"N/D")}<br><small>${esc(ageText(x.age_seconds))}</small></td><td class="${esc(x.freshness)}"><b>${esc(x.freshness)}</b></td><td>${esc(x.caveat||"")}</td></tr>`).join("");
    root.innerHTML=`<div class="ift-head"><div><div class="ift-title">STRATEGY A · INPUT FRESHNESS TRUTH · ${BUILD}</div><div class="ift-sub">Sépare données de décision, contexte Atlas et preuves après-coup. Aucun gate n'est modifié.</div></div><div class="ift-status">${esc(m.status)}</div></div><table><thead><tr><th>Entrée</th><th>Valeur / rôle</th><th>Horodatage / âge</th><th>Fraîcheur</th><th>Limite de preuve</th></tr></thead><tbody>${rows}</tbody></table><div class="ift-note"><b>Règle :</b> une donnée capturée dans le cycle peut être récente au moment du cycle alors que son upstream propre n'expose pas de timestamp. UNKNOWN reste UNKNOWN. Atlas CURRENT est affiché séparément : sa vétusté ne prouve pas à elle seule que le cycle Strategy est figé.</div>`;
    root.dataset.build=BUILD;root.dataset.readOnly="true";
    return m;
  }
  function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;try{render();}catch(_){}});}
  function selfTest(){
    const a=stateFromAge(10,60)==="FRESH",b=stateFromAge(61,60)==="STALE",c=stateFromAge(null,60)==="UNKNOWN";
    const d=parseFrDate("29/09/2026 07:38:03")!==null;
    const checks={fresh_boundary:a,stale_boundary:b,unknown_preserved:c,fr_provenance_parsed:d,read_only:true,no_timer:true,no_observer:true};
    return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks:Object.freeze(checks)});
  }
  globalThis.AgentCryptoStrategyAInputFreshnessTruth=Object.freeze({build:BUILD,snapshot:()=>last||model(),refresh:render,self_test:selfTest,read_only:true,thresholds_changed:false,gates_changed:false,strategy_decision_changed:false,fetch:false,storage_write:false,recurring_timer:false,mutation_observer:false,real_order:false,paper_only:true});
  if(typeof document!=="undefined"){
    ["agent-crypto:strategy-a-experiment-cycle","agent-crypto:administrator-presentation-settled","agentcrypto:current-finalized"].forEach(name=>document.addEventListener(name,schedule,{passive:true}));
    window.addEventListener("agent-crypto:strategy-a-execution-cost-measured",schedule,{passive:true});
    window.addEventListener("agent-crypto:postboot-runtime-ready",schedule,{passive:true});
    window.addEventListener("pageshow",schedule,{passive:true});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
  }
})();