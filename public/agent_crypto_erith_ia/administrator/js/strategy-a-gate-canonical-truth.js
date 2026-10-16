/* Agent-Crypto @erith.IA — 40.6.170 GATE CANONICAL TRUTH
   Presentation-only canonical gate identity/state/source truth.
   Never renumbers unresolved gates by list position and never turns unavailable evidence into zero.
   FOUNDATION_PASS remains foundation-scoped, not full certification.
   No certification mutation, no timer/observer/storage/network/order path. */
(() => {
  "use strict";
  const BUILD = "40.6.170";
  const ROOT_ID = "strategyAGateCanonicalTruth";
  const BRIDGE_ID = "strategyAPaperV2ProofBridge";

  const OWNER_BY_GATE = Object.freeze({
    1:"Evidence Dossier · datasetReadiness",
    2:"Safety Certification · foundation",
    3:"Evidence Dossier · realistic replay",
    4:"Evidence Dossier · out-of-sample",
    5:"Evidence Dossier · walk-forward",
    6:"Evidence Dossier · Monte Carlo / stress",
    7:"Safety Certification · chaos/foundation",
    8:"After-Cost Metrics + Experiment Ledger",
    9:"Safety Certification · micro-live lock"
  });
  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const safeCall = (fn, fallback=null) => { try{return typeof fn==="function"?fn():fallback;}catch(_){return fallback;} };
  const text = value => value === null || value === undefined || String(value).trim()==="" ? null : String(value).trim();
  const timeValue = gate => text(gate?.evidence_at ?? gate?.certified_at ?? gate?.tested_at ?? gate?.at ?? gate?.updated_at);

  function canonicalSnapshot(overrides={}) {
    const safety = Object.prototype.hasOwnProperty.call(overrides,"safety") ? overrides.safety : globalThis.AgentCryptoStrategyASafetyCertification;
    const dossier = Object.prototype.hasOwnProperty.call(overrides,"dossier") ? overrides.dossier : globalThis.AgentCryptoStrategyAEvidenceDossier;
    const matrix = Object.prototype.hasOwnProperty.call(overrides,"matrix") ? overrides.matrix : safeCall(safety?.certification_matrix,null);
    const evidence = Object.prototype.hasOwnProperty.call(overrides,"evidence") ? overrides.evidence : safeCall(dossier?.snapshot,null);
    const source = Array.isArray(matrix?.gates) ? matrix.gates : Array.isArray(evidence?.certification?.gates) ? evidence.certification.gates : null;
    if (!source) {
      return {schema:"agent_crypto_strategy_a_gate_canonical_truth_v1",build:BUILD,available:false,state:"UNAVAILABLE",gate_count:null,unresolved_count:null,rows:[],paper_only:true,real_order:false};
    }
    const rows = source.map((gate,index)=>{
      const canonical = Number(gate?.gate);
      const number = Number.isInteger(canonical)&&canonical>0 ? canonical : null;
      const state = text(gate?.state)?.toUpperCase() || "UNKNOWN";
      const label = text(gate?.label ?? gate?.name) || (number ? `GATE ${number}` : "GATE UNKNOWN");
      return {
        gate:number,
        source_index:index,
        label,
        state,
        owner:number ? OWNER_BY_GATE[number] || "Certification matrix" : "Certification matrix",
        proof_at:timeValue(gate),
        note:text(gate?.note ?? gate?.reason ?? gate?.detail),
        foundation_scope_only:state==="FOUNDATION_PASS"
      };
    });
    const unresolved=rows.filter(row=>!["PASS","FOUNDATION_PASS"].includes(row.state));
    return {
      schema:"agent_crypto_strategy_a_gate_canonical_truth_v1",build:BUILD,available:true,state:"AVAILABLE",
      gate_count:rows.length,unresolved_count:unresolved.length,rows,unresolved,
      unavailable_is_zero:false,canonical_numbers_preserved:true,exact_states_preserved:true,
      foundation_pass_is_full_certification:false,paper_only:true,real_order:false
    };
  }

  function escapeHtml(value){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");}
  function ensureStyle(){
    if(typeof document==="undefined"||byId("strategyAGateCanonicalTruthStyle"))return;
    const st=document.createElement("style"); st.id="strategyAGateCanonicalTruthStyle";
    st.textContent=`#${ROOT_ID}{margin:8px 0;padding:9px;border:1px solid rgba(170,146,255,.22);border-radius:9px;background:rgba(19,13,38,.3)}#${ROOT_ID} .gct-title{font:950 8px/1.25 system-ui,sans-serif;letter-spacing:.08em;color:#c7b5ff;text-transform:uppercase}#${ROOT_ID} .gct-sub{margin-top:3px;font:600 8px/1.4 system-ui,sans-serif;color:#978bb4}#${ROOT_ID} .gct-grid{display:grid;gap:4px;margin-top:7px}#${ROOT_ID} .gct-row{display:grid;grid-template-columns:42px minmax(150px,.8fr) 140px minmax(180px,1.3fr) 150px;gap:7px;align-items:center;padding:6px 7px;border:1px solid rgba(255,255,255,.055);border-radius:7px;background:rgba(5,10,22,.42)}#${ROOT_ID} .gct-row b{font-size:8px;color:#eef2ff}#${ROOT_ID} .gct-row span,#${ROOT_ID} .gct-row small{font-size:7.5px;color:#96a0b4;overflow-wrap:anywhere}#${ROOT_ID} .gct-state{font-weight:900!important;color:#f2d471!important}#${ROOT_ID} .gct-state[data-pass="true"]{color:#8df0bb!important}#${ROOT_ID} .gct-empty{margin-top:7px;padding:7px;border:1px solid rgba(255,190,90,.2);border-radius:7px;color:#f2cd82;font-size:8px}@media(max-width:1000px){#${ROOT_ID} .gct-row{grid-template-columns:42px 1fr 130px}#${ROOT_ID} .gct-owner,#${ROOT_ID} .gct-time{grid-column:2 / span 2}}`;
    document.head.appendChild(st);
  }

  function patchBridgeUnresolved(data){
    if(typeof document==="undefined")return false;
    const bridge=byId(BRIDGE_ID); if(!bridge||!data.available)return false;
    const rows=[...bridge.querySelectorAll(".sapv2-gate-row")];
    const unresolved=data.unresolved||[];
    rows.forEach((node,index)=>{
      const truth=unresolved[index]; if(!truth)return;
      const idx=node.querySelector(".sapv2-gate-index");
      const status=node.querySelector(".sapv2-gate-status");
      if(idx)idx.textContent=truth.gate?`G${truth.gate}`:"G?";
      if(status)status.textContent=truth.state;
      node.dataset.canonicalGate=truth.gate?String(truth.gate):"unknown";
      node.dataset.canonicalState=truth.state;
    });
    return true;
  }

  function ensureRoot(){
    if(typeof document==="undefined")return null;
    const bridge=byId(BRIDGE_ID); if(!bridge)return null;
    let root=byId(ROOT_ID);
    if(!root){root=document.createElement("section");root.id=ROOT_ID;bridge.insertAdjacentElement("afterend",root);}
    return root;
  }

  function render(){
    const data=canonicalSnapshot();
    patchBridgeUnresolved(data);
    const root=ensureRoot(); if(!root)return data;
    ensureStyle();
    if(!data.available){
      root.innerHTML=`<div class="gct-title">GATE CANONICAL TRUTH · ${BUILD}</div><div class="gct-empty">Certification matrix / Evidence Dossier indisponible : état et nombre de gates = INCONNU, jamais 0.</div>`;
      return data;
    }
    root.innerHTML=`<div class="gct-title">GATE CANONICAL TRUTH · ${BUILD}</div><div class="gct-sub">Numéro canonique · état exact · owner · date de preuve. FOUNDATION_PASS reste limité à la fondation.</div><div class="gct-grid">${data.rows.map(row=>`<div class="gct-row"><b>${row.gate?`G${row.gate}`:"G?"}</b><span>${escapeHtml(row.label)}</span><span class="gct-state" data-pass="${["PASS","FOUNDATION_PASS"].includes(row.state)}">${escapeHtml(row.state)}</span><small class="gct-owner">${escapeHtml(row.owner)}</small><small class="gct-time">${escapeHtml(row.proof_at||"DATE INCONNUE")}</small></div>`).join("")}</div>`;
    root.dataset.available="true"; root.dataset.canonicalNumbers="true"; root.dataset.exactStates="true";
    return data;
  }

  function selfTest(){
    const unavailable=canonicalSnapshot({matrix:null,evidence:null,safety:null,dossier:null});
    const sample=canonicalSnapshot({matrix:{gates:[{gate:1,label:"QUALITÉ",state:"EVIDENCE_REQUIRED"},{gate:2,label:"COHÉRENCE",state:"FOUNDATION_PASS",at:"2026-09-15T23:27:11.071Z"},{gate:9,label:"MICRO",state:"LOCKED"}]},evidence:null});
    const pass=unavailable.gate_count===null&&unavailable.unresolved_count===null&&unavailable.available===false&&sample.rows[0].gate===1&&sample.rows[1].gate===2&&sample.rows[1].state==="FOUNDATION_PASS"&&sample.rows[1].foundation_scope_only===true&&sample.rows[2].gate===9&&sample.rows[2].state==="LOCKED"&&sample.unresolved_count===2;
    return {schema:"agent_crypto_strategy_a_gate_canonical_truth_self_test_v1",build:BUILD,pass,checks:{unavailable_not_zero:unavailable.gate_count===null&&unavailable.unresolved_count===null,canonical_numbers_preserved:sample.rows.map(r=>r.gate).join(",")==="1,2,9",exact_states_preserved:sample.rows.map(r=>r.state).join(",")==="EVIDENCE_REQUIRED,FOUNDATION_PASS,LOCKED",foundation_scope_not_full_certification:sample.rows[1].foundation_scope_only===true}};
  }

  globalThis.AgentCryptoStrategyAGateCanonicalTruth=Object.freeze({build:BUILD,snapshot:canonicalSnapshot,render,self_test:selfTest,certification_mutation:false,recurring_timer:false,observer:false,storage_write:false,network:false,real_order:false,paper_only:true});
  if(typeof document!=="undefined"){
    const schedule=()=>{try{requestAnimationFrame(()=>render());}catch(_){queueMicrotask(render);}};
    document.addEventListener("agent-crypto:evidence-view-refreshed",schedule);
    document.addEventListener("agent-crypto:evidence-data-changed",schedule);
    document.addEventListener("agent-crypto:runtime-modules-ready",schedule,{once:true});
    window.addEventListener("pageshow",schedule);
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
  }
})();