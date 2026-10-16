/* Agent-Crypto @erith.IA — 40.6.227 G3 STRICT TRUTH MOUNT PROOF
   Presentation/mount repair only. Reuses 40.6.226 strict decision-time truth.
   No Strategy A threshold change. PAPER ONLY · G3 PENDING · G9 LOCKED. */
(()=>{"use strict";
const BUILD="40.6.227",OWNER="G3_STRICT_TRUTH_MOUNT_PROOF_OWNER",ROOT="strategyAG3StrictTruthMountProof406227",SOURCE_ROOT="strategyAG3StrictDecisionTimeTruth406226",OLD_ROOT="strategyAG3CurrentTruthSurface406225";
const ANCHORS=["strategyADossier","strategyAEvidenceSupplements","strategyAEvidenceGateAudit"];
let queued=false,lastReason="boot";
const byId=id=>typeof document!=="undefined"?document.getElementById(id):null;
const esc=v=>String(v??"—").replace(/[&<>\"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const safe=(fn,f=null)=>{try{return typeof fn==="function"?fn():f}catch(_){return f}};
function source(){return globalThis.AgentCryptoStrategyAG3StrictDecisionTimeTruth||null}
function chooseAnchor(){for(const id of ANCHORS){const n=byId(id);if(n?.parentElement)return n}return null}
function state(){const src=source(),anchor=chooseAnchor(),root=byId(ROOT),strict=byId(SOURCE_ROOT);return Object.freeze({schema:"agent_crypto_g3_strict_truth_mount_proof_v1",build:BUILD,owner:OWNER,source_build:String(src?.build||""),source_available:!!src,anchor_id:anchor?.id||null,dossier_present:!!byId("strategyADossier"),stable_host_present:!!byId("strategyAEvidenceSupplements"),strict_native_surface_present:!!strict,mount_surface_present:!!root,mount_surface_parent:root?.parentElement?.id||null,last_reason:lastReason,recurring_timer:false,observer:false,storage_write:false,business_network_request:false,gate_promotion:false,real_order:false,paper_only:true,g3:"PENDING",g9:"LOCKED"})}
function ensureStyle(){if(typeof document==="undefined"||byId(ROOT+"Style"))return;const st=document.createElement("style");st.id=ROOT+"Style";st.textContent=`#${ROOT}{margin:12px 0;padding:14px;border:1px solid rgba(255,211,110,.38);border-radius:12px;background:rgba(7,19,27,.93);color:#dbe7ef}#${ROOT} .h{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}#${ROOT} .t{font:950 13px/1.3 system-ui;color:#ffe19b;letter-spacing:.04em}#${ROOT} .tag{font:950 10px/1.2 system-ui;color:#ffe29b}#${ROOT} .sub{margin-top:4px;font:650 10px/1.45 system-ui;color:#a9bfba}#${ROOT} .g{display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:7px;margin-top:10px}#${ROOT} .k{padding:8px;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:rgba(2,10,16,.4)}#${ROOT} .k span{display:block;font:800 8px system-ui;color:#91a8a1;text-transform:uppercase}#${ROOT} .k b{display:block;margin-top:3px;font:950 10px/1.3 system-ui;color:#f5fff9;overflow-wrap:anywhere}#${ROOT} .next{margin-top:9px;padding:8px;border-left:3px solid #f0c765;background:rgba(240,199,101,.08);font:750 10px/1.5 system-ui;color:#f2dfaa}#${ROOT} .proof{margin-top:7px;font:650 9px/1.5 ui-monospace,monospace;color:#8daaa4;overflow-wrap:anywhere}@media(max-width:1000px){#${ROOT} .g{grid-template-columns:repeat(2,1fr)}}`;document.head.appendChild(st)}
function render(reason="explicit"){
  lastReason=String(reason||"explicit");
  if(typeof document==="undefined")return state();
  const src=source(),anchor=chooseAnchor();
  if(!src||!anchor)return state();
  const snap=safe(src.snapshot,null);
  if(!snap)return state();
  ensureStyle();
  const native=byId(SOURCE_ROOT);if(native){native.hidden=true;native.setAttribute("aria-hidden","true");native.dataset.supersededBy=BUILD}
  const old=byId(OLD_ROOT);if(old){old.hidden=true;old.setAttribute("aria-hidden","true");old.dataset.supersededBy=BUILD}
  let root=byId(ROOT);if(!root){root=document.createElement("section");root.id=ROOT}
  if(root.nextElementSibling!==anchor||root.parentElement!==anchor.parentElement)anchor.insertAdjacentElement("beforebegin",root);
  const strictOk=snap.strict_pass===true;
  const next=strictOk?"RÉALISME D’EXÉCUTION":"REVALIDATION DECISION_AT";
  const blockers=Array.isArray(snap.blockers)&&snap.blockers.length?snap.blockers.slice(0,8).join(" · "):"AUCUN";
  root.dataset.build=BUILD;root.dataset.sourceBuild=String(snap.build||"40.6.226");root.dataset.anchor=String(anchor.id||"");root.dataset.strictPass=String(strictOk);root.dataset.mountProof="true";
  root.innerHTML=`<div class="h"><div><div class="t">STRATEGY A · PREUVE T0 STRICTE · ${BUILD}</div><div class="sub">Surface de montage canonique : la vérité temporelle 40.6.226 reste l’owner analytique.</div></div><div class="tag">G3 PENDING · ${esc(next)}</div></div><div class="g"><div class="k"><span>Fenêtre 24 h</span><b>${esc(snap.temporal_contract)}</b></div><div class="k"><span>Replay</span><b>${esc(snap.replay_dataset)}</b></div><div class="k"><span>Décisions jointes</span><b>${esc(snap.joined_decisions)}</b></div><div class="k"><span>Horizons stricts</span><b>${esc(snap.certified_horizons)} / ${esc(snap.expected_horizons)}</b></div><div class="k"><span>Receipt 40.6.222</span><b>${esc(snap.legacy_222?.status)}</b></div></div><div class="next"><b>Ancre canonique : decision_at.</b> market_at reste uniquement la provenance de l’entrée marché. Valeurs absentes = UNKNOWN, jamais zéro.</div><div class="proof">MOUNT PROOF · host=${esc(anchor.id)} · source=${esc(snap.build)} · reason=${esc(lastReason)} · blockers=${esc(blockers)} · G9 LOCKED · PAPER ONLY.</div>`;
  document.documentElement.dataset.agentCryptoG3StrictTruthMount="406227";
  document.documentElement.dataset.agentCryptoG3StrictTruthHost=String(anchor.id||"");
  return state();
}
function schedule(reason="event"){
  if(queued||typeof document==="undefined")return;queued=true;
  const run=()=>{queued=false;render(reason)};
  try{requestAnimationFrame(()=>requestAnimationFrame(run))}catch(_){queueMicrotask(run)}
}
function clickCapture(e){const t=e?.target;const txt=String(t?.closest?.("button,a,summary")?.textContent||"").toLowerCase();if(chooseAnchor())render(txt.includes("export")?"export-click-capture":"click-capture");schedule("click-settled")}
function toggleCapture(e){if(e?.target?.open===false)return;render("toggle-capture");schedule("toggle-settled")}
function selfTest(){const src=source(),s=safe(src?.self_test,null),st=state(),checks={source_406226:src?.build==="40.6.226",source_self_test_pass:s?.pass===true,no_timer:st.recurring_timer===false,no_observer:st.observer===false,no_storage_write:st.storage_write===false,no_network_write:st.business_network_request===false,no_gate_promotion:st.gate_promotion===false,paper_only:st.paper_only===true,g3_pending:st.g3==="PENDING",g9_locked:st.g9==="LOCKED"};return Object.freeze({schema:"agent_crypto_g3_strict_truth_mount_proof_self_test_v1",build:BUILD,pass:Object.values(checks).every(Boolean),checks:Object.freeze(checks)})}
globalThis.AgentCryptoStrategyAG3StrictTruthMountProof=Object.freeze({build:BUILD,owner:OWNER,root_id:ROOT,source_build:"40.6.226",mount:render,render,schedule,snapshot:state,self_test:selfTest,presentation_only:true,strict_truth_owner:"AgentCryptoStrategyAG3StrictDecisionTimeTruth",recurring_timer:false,observer:false,storage_write:false,business_network_request:false,gate_promotion:false,real_order:false,paper_only:true,g3:"PENDING",g9:"LOCKED"});
if(typeof document!=="undefined"){
  document.addEventListener("click",clickCapture,true);
  document.addEventListener("toggle",toggleCapture,true);
  for(const ev of ["erith:system-hydrated","agent-crypto:runtime-modules-ready","agent-crypto:evidence-data-changed","agent-crypto:evidence-refresh-complete","agent-crypto:market-series-updated"])document.addEventListener(ev,()=>{render(ev);schedule(ev+"-settled")});
  window.addEventListener("pageshow",()=>{render("pageshow");schedule("pageshow-settled")});
  window.addEventListener("load",()=>{render("load");schedule("load-settled")},{once:true});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{render("dom-ready");schedule("dom-ready-settled")},{once:true});else{render("script-load");schedule("script-load-settled")}
}
})();
