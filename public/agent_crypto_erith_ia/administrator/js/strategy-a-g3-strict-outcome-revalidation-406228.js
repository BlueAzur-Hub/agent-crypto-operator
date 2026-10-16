/* Agent-Crypto @erith.IA — 40.6.228 G3 STRICT OUTCOME REVALIDATION
   Read-only certification receipt over the 40.6.226 decision-time truth.
   It revalidates T+5/T+15/T+60 against decision_at and never promotes Gate 3.
   PAPER ONLY · G3 PENDING · G9 LOCKED. */
(()=>{"use strict";
const BUILD="40.6.228",OWNER="G3_STRICT_OUTCOME_REVALIDATION_OWNER",ROOT="strategyAG3StrictOutcomeRevalidation406228",SOURCE_BUILD="40.6.226",SOURCE_ROOT="strategyAG3StrictDecisionTimeTruth406226",MOUNT_ROOT="strategyAG3StrictTruthMountProof406227",LEGACY_OUTCOME_ROOT="strategyAG3OutcomeCertification406222",LEGACY_READINESS_ROOT="strategyAG3RealisticReplayReadiness406223",DOSSIER="strategyADossier",H=Object.freeze([5,15,60]);
let queued=false,lastReason="boot";
const byId=id=>typeof document!=="undefined"?document.getElementById(id):null;
const safe=(fn,f=null)=>{try{return typeof fn==="function"?fn():f}catch(_){return f}};
const strictNum=v=>{if(v===null||v===undefined||typeof v==="boolean"||(typeof v==="string"&&!v.trim()))return null;const n=Number(v);return Number.isFinite(n)?n:null};
const tsv=v=>{if(v===null||v===undefined||v==="")return null;const n=typeof v==="number"?v:Date.parse(String(v));return Number.isFinite(n)?n:null};
const esc=v=>String(v??"—").replace(/[&<>\"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
function source(){return globalThis.AgentCryptoStrategyAG3StrictDecisionTimeTruth||null}
function validateDecision(d){
  const blockers=[];const rows=[];const decisionAt=tsv(d?.decision_at);
  if(!d?.id)blockers.push("DECISION_ID_MISSING");
  if(decisionAt===null)blockers.push("DECISION_TIME_MISSING");
  if(d?.pass!==true)blockers.push("STRICT_DECISION_NOT_PASSING");
  let certified=0;
  for(const h of H){
    const x=d?.horizons?.[`t${h}`]||null,target=tsv(x?.target_at),matched=tsv(x?.matched_at),price=strictNum(x?.price),change=strictNum(x?.change_pct);
    let status="CERTIFIED";
    if(x?.certification_status!=="CERTIFIED")status=String(x?.certification_status||x?.status||"NOT_CERTIFIED");
    else if(target===null)status="TARGET_TIME_UNPROVEN";
    else if(matched===null)status="MATCH_TIME_UNPROVEN";
    else if(decisionAt===null)status="DECISION_TIME_UNPROVEN";
    else if(target<decisionAt+h*60000)status="TARGET_BEFORE_DECISION_HORIZON";
    else if(matched<target)status="MATCH_BEFORE_TARGET";
    else if(!(price>0))status="PRICE_INVALID";
    else if(change===null)status="CHANGE_UNPROVEN";
    if(status==="CERTIFIED")certified++;else blockers.push(`T${h}:${status}`);
    rows.push(Object.freeze({decision_id:d?.id||null,horizon_min:h,target_at:x?.target_at||null,matched_at:x?.matched_at||null,price,change_pct:change,direction:x?.direction||null,certification_status:status}));
  }
  return Object.freeze({id:d?.id||null,decision_at:d?.decision_at||null,market_at:d?.market_at||null,pass:blockers.length===0&&certified===H.length,certified_horizons:certified,expected_horizons:H.length,blockers:Object.freeze([...new Set(blockers)]),rows:Object.freeze(rows)});
}
function snapshot(){
  const src=source(),s=safe(src?.snapshot,null),blockers=[],rows=[];
  if(!src||src.build!==SOURCE_BUILD)blockers.push("STRICT_SOURCE_406226_UNAVAILABLE");
  if(!s)blockers.push("STRICT_SNAPSHOT_UNAVAILABLE");
  if(s&&s.temporal_contract!=="CERTIFIED")blockers.push("TEMPORAL_WINDOW_NOT_CERTIFIED");
  if(s&&s.replay_dataset!=="READY_FOR_DECISION_REPLAY")blockers.push("REPLAY_DATASET_NOT_READY");
  if(s&&s.horizon_anchor!=="decision_at")blockers.push("HORIZON_ANCHOR_NOT_DECISION_AT");
  if(s&&s.missing_numeric_coercion_to_zero!==false)blockers.push("NUMERIC_UNKNOWN_COERCION_RISK");
  if(s&&s.cadence_contract_required!==true)blockers.push("CADENCE_CONTRACT_NOT_REQUIRED");
  if(s&&s.observed_cadence_used_as_contract!==false)blockers.push("OBSERVED_CADENCE_INFERENCE_RISK");
  for(const b of Array.isArray(s?.upstream_refusal_blockers)?s.upstream_refusal_blockers:[])blockers.push(`UPSTREAM:${b}`);
  const decisions=(Array.isArray(s?.decisions)?s.decisions:[]).map(validateDecision);
  if(!decisions.length)blockers.push("NO_JOINED_DECISION");
  for(const d of decisions){for(const b of d.blockers)blockers.push(`${d.id||"UNKNOWN"}:${b}`);for(const r of d.rows)rows.push(r)}
  const expected=decisions.length*H.length,certified=rows.filter(r=>r.certification_status==="CERTIFIED").length;
  if(s&&Number(s.joined_decisions)!==decisions.length)blockers.push("STRICT_OWNER_JOINED_COUNT_MISMATCH");
  if(s&&Number(s.expected_horizons)!==expected)blockers.push("STRICT_OWNER_EXPECTED_COUNT_MISMATCH");
  if(s&&Number(s.certified_horizons)!==certified)blockers.push("STRICT_OWNER_CERTIFIED_COUNT_MISMATCH");
  if(s&&s.strict_pass!==true)blockers.push("STRICT_OWNER_NOT_PASSING");
  const pass=blockers.length===0&&expected>0&&certified===expected;
  return Object.freeze({schema:"agent_crypto_g3_strict_outcome_revalidation_v1",build:BUILD,owner:OWNER,source_build:s?.build||null,state:pass?"OUTCOME_LABELS_CERTIFIED_STRICT_DECISION_TIME":"STRICT_OUTCOME_REVALIDATION_REQUIRED",pass,replay_dataset:s?.replay_dataset||"NOT_READY",temporal_contract:s?.temporal_contract||"NOT_CERTIFIED",joined_decisions:decisions.length,horizons_min:H.slice(),certified_horizons:certified,expected_horizons:expected,outcome_labels:pass?"CERTIFIED_STRICT_DECISION_TIME":"NOT_CERTIFIED_STRICT_DECISION_TIME",blockers:Object.freeze([...new Set(blockers)]),decisions:Object.freeze(decisions),rows:Object.freeze(rows),legacy_222_authority:"SUPERSEDED_BY_STRICT_DECISION_TIME_REVALIDATION",next_layer:pass?"EXECUTION_REALISM":"STRICT_OUTCOME_REVALIDATION",horizon_anchor:"decision_at",source_market_time_role:"MARKET_INPUT_PROVENANCE_ONLY",missing_numeric_coercion_to_zero:false,cadence_contract_required:true,observed_cadence_used_as_contract:false,current_runtime_backfill:false,current_oracle_applied_to_past:false,future_outcomes_used_as_t0_input:false,lookahead:false,economic_backtest:false,profitability_claim:false,gate_promotion:false,live_unlock:false,recurring_timer:false,observer:false,storage_write:false,business_network_request:false,paper_only:true,real_order:false,g3:"PENDING",g9:"LOCKED"});
}
function chooseAnchor(){return byId(MOUNT_ROOT)||byId(DOSSIER)||byId("strategyAEvidenceSupplements")||null}
function ensureStyle(){if(typeof document==="undefined"||byId(ROOT+"Style"))return;const st=document.createElement("style");st.id=ROOT+"Style";st.textContent=`#${ROOT}{margin:12px 0;padding:14px;border:1px solid rgba(103,255,190,.34);border-radius:12px;background:rgba(4,25,23,.92);color:#dbe7ef}#${ROOT} .h{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}#${ROOT} .t{font:950 13px/1.3 system-ui;color:#9fffd5;letter-spacing:.04em}#${ROOT} .tag{font:950 10px/1.2 system-ui;color:#a8ffd2}#${ROOT} .sub{margin-top:4px;font:650 10px/1.45 system-ui;color:#96bcb2}#${ROOT} .g{display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:7px;margin-top:10px}#${ROOT} .k{padding:8px;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:rgba(2,10,16,.38)}#${ROOT} .k span{display:block;font:800 8px system-ui;color:#82a89e;text-transform:uppercase}#${ROOT} .k b{display:block;margin-top:3px;font:950 10px/1.3 system-ui;color:#f3fff9;overflow-wrap:anywhere}#${ROOT} .next{margin-top:9px;padding:8px;border-left:3px solid #70f2bd;background:rgba(112,242,189,.07);font:750 10px/1.5 system-ui;color:#c9f6e5}#${ROOT} .proof{margin-top:7px;font:650 9px/1.5 ui-monospace,monospace;color:#86aaa0;overflow-wrap:anywhere}@media(max-width:1000px){#${ROOT} .g{grid-template-columns:repeat(2,1fr)}}`;document.head.appendChild(st)}
function render(reason="explicit"){
  lastReason=String(reason||"explicit");const s=snapshot();if(typeof document==="undefined")return s;const anchor=chooseAnchor();if(!anchor?.parentElement)return s;ensureStyle();
  for(const id of [SOURCE_ROOT,LEGACY_OUTCOME_ROOT,LEGACY_READINESS_ROOT]){const n=byId(id);if(n){n.hidden=true;n.setAttribute("aria-hidden","true");n.dataset.supersededBy=BUILD}}
  let root=byId(ROOT);if(!root){root=document.createElement("section");root.id=ROOT}
  if(root.nextElementSibling!==anchor||root.parentElement!==anchor.parentElement)anchor.insertAdjacentElement("beforebegin",root);
  root.dataset.build=BUILD;root.dataset.pass=String(s.pass);root.dataset.anchor="decision_at";root.dataset.reason=lastReason;
  const blockers=s.blockers.length?s.blockers.slice(0,8).join(" · "):"AUCUN";
  const next=s.pass?"RÉALISME D’EXÉCUTION":"REVALIDATION STRICTE";
  root.innerHTML=`<div class="h"><div><div class="t">STRATEGY A · OUTCOMES STRICTS · ${BUILD}</div><div class="sub">Revalidation descriptive T+5 / T+15 / T+60 sur decision_at. Le receipt 40.6.222 n’est plus autoritaire.</div></div><div class="tag">G3 PENDING · ${esc(next)}</div></div><div class="g"><div class="k"><span>Fenêtre 24 h</span><b>${esc(s.temporal_contract)}</b></div><div class="k"><span>Replay</span><b>${esc(s.replay_dataset)}</b></div><div class="k"><span>Décisions jointes</span><b>${esc(s.joined_decisions)}</b></div><div class="k"><span>Horizons stricts</span><b>${esc(s.certified_horizons)} / ${esc(s.expected_horizons)}</b></div><div class="k"><span>Outcome labels</span><b>${esc(s.outcome_labels)}</b></div></div><div class="next"><b>Ancre : decision_at.</b> ${s.pass?"La couche données + outcomes est strictement revalidée. Prochaine dette : coûts after-cost, partial fills, latence et liquidité.":"La couche outcomes reste ouverte : aucun passage vers le réalisme d’exécution tant que la revalidation stricte n’est pas complète."}</div><div class="proof">STRICT RECEIPT · source=${esc(s.source_build)} · reason=${esc(lastReason)} · legacy222=${esc(s.legacy_222_authority)} · blockers=${esc(blockers)} · G9 LOCKED · PAPER ONLY.</div>`;
  document.documentElement.dataset.agentCryptoG3StrictOutcome="406228";return s;
}
function schedule(reason="event"){if(queued||typeof document==="undefined")return;queued=true;const run=()=>{queued=false;render(reason)};try{requestAnimationFrame(()=>requestAnimationFrame(run))}catch(_){queueMicrotask(run)}}
function selfTest(){
  const base=Date.UTC(2026,8,17,12),mk=(h)=>({target_at:new Date(base+h*60000).toISOString(),matched_at:new Date(base+h*60000).toISOString(),price:100+h,change_pct:h/100,direction:"UP",certification_status:"CERTIFIED"});
  const good=validateDecision({id:"TEST",decision_at:new Date(base).toISOString(),market_at:new Date(base-60000).toISOString(),pass:true,horizons:{t5:mk(5),t15:mk(15),t60:mk(60)}}),bad=validateDecision({id:"BAD",decision_at:new Date(base).toISOString(),market_at:new Date(base-60000).toISOString(),pass:true,horizons:{t5:{...mk(5),change_pct:null},t15:mk(15),t60:mk(60)}}),c={good_certifies:good.pass===true&&good.certified_horizons===3,missing_change_rejected:bad.pass===false&&bad.blockers.some(x=>x.includes("CHANGE_UNPROVEN")),null_is_unknown:strictNum(null)===null&&strictNum("")===null&&strictNum(false)===null,no_gate_promotion:snapshot().g3==="PENDING",no_real_order:snapshot().real_order===false};return Object.freeze({schema:"agent_crypto_g3_strict_outcome_revalidation_self_test_v1",build:BUILD,pass:Object.values(c).every(Boolean),checks:Object.freeze(c)})}
globalThis.AgentCryptoStrategyAG3StrictOutcomeRevalidation=Object.freeze({build:BUILD,owner:OWNER,root_id:ROOT,source_build:SOURCE_BUILD,snapshot,render,schedule,self_test:selfTest,certification_scope:"POST_DECISION_DESCRIPTIVE_OUTCOMES_STRICT_DECISION_TIME",horizon_anchor:"decision_at",read_only:true,gate_promotion:false,economic_backtest:false,profitability_claim:false,current_runtime_backfill:false,current_oracle_applied_to_past:false,future_outcomes_used_as_t0_input:false,lookahead:false,recurring_timer:false,observer:false,storage_write:false,business_network_request:false,paper_only:true,real_order:false,g3:"PENDING",g9:"LOCKED"});
if(typeof document!=="undefined"){
  const rerender=e=>{render(e?.type||"event");schedule((e?.type||"event")+"-settled")};
  document.addEventListener("click",e=>{const txt=String(e?.target?.closest?.("button,a,summary")?.textContent||"").toLowerCase();render(txt.includes("export")?"export-click-capture":"click-capture");schedule("click-settled")},true);
  document.addEventListener("toggle",e=>{if(e?.target?.open===false)return;rerender(e)},true);
  for(const ev of ["erith:system-hydrated","agent-crypto:runtime-modules-ready","agent-crypto:evidence-data-changed","agent-crypto:evidence-refresh-complete","agent-crypto:market-series-updated"])document.addEventListener(ev,rerender);
  window.addEventListener("pageshow",rerender);window.addEventListener("load",()=>{render("load");schedule("load-settled")},{once:true});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{render("dom-ready");schedule("dom-ready-settled")},{once:true});else{render("script-load");schedule("script-load-settled")}
}
})();
