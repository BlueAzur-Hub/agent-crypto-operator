/* Agent-Crypto Administrator — 40.6.345
   OPERATOR DASHBOARD · MATH CORE + KILL SWITCH
   - Math wing mirrors the existing canonical Math Core DOM.
   - KILL SWITCH delegates STOP to the existing Strategy A Auto Paper STOP owner.
   - No new market score, safety engine, storage owner, network request, recurring timer,
     MutationObserver, real order or wallet behavior. */
(()=>{
  "use strict";
  if(globalThis.AgentCryptoOperatorDashboard406345)return;

  const BUILD="40.6.345";
  const ROOT_ID="agentCryptoOperatorDashboard406345";
  const MANUAL_STOP_KEY="agent_crypto_strategy_a_auto_manual_stop_v1";
  const state={mode:"normal",mounted:false,bound:false,last_stop:null,last_error:null,stop_pending:false};

  const byId=id=>document.getElementById(id);
  const compact=(value,max=150)=>{
    const s=String(value??"").replace(/\s+/g," ").trim();
    return s.length>max?s.slice(0,max-1)+"…":s;
  };
  const numberFrom=value=>{
    const m=String(value??"").replace(",",".").match(/-?\d+(?:\.\d+)?/);
    return m?Number(m[0]):null;
  };

  function mathSnapshot(){
    const raw=compact(byId("scoreValue")?.textContent||byId("atlasMathRailScore")?.textContent||"—",24);
    const score=numberFrom(raw);
    return Object.freeze({
      raw,
      score:Number.isFinite(score)?score:null,
      label:compact(byId("scoreLabel")?.textContent||"En attente",64),
      context:compact(byId("atlasMathContextLine")?.textContent||"Contexte Market : en attente",100),
      verdict:compact(byId("atlasHumanVerdict")?.innerText||byId("atlasHumanVerdict")?.textContent||"Lecture Math Core en attente.",160),
      source:"CANONICAL_MATH_DOM"
    });
  }

  function autoSnapshot(){
    try{
      if(typeof globalThis.strategyAAutoSnapshot==="function"){
        const snap=globalThis.strategyAAutoSnapshot();
        if(snap&&typeof snap==="object")return snap;
      }
    }catch(_){}
    const summary=compact(byId("strategyAAutoSummary")?.textContent||"",180);
    const visual=compact(byId("strategyAOperatorStatus")?.textContent||byId("strategyAVisualState404269")?.textContent||"",80);
    let stopped=false;
    try{stopped=sessionStorage.getItem(MANUAL_STOP_KEY)==="1";}catch(_){}
    return Object.freeze({
      build:null,
      enabled:visual?/ACTIF|ARM|OUVERT/i.test(visual):null,
      phase:stopped?"OFF":visual||"UNKNOWN",
      last_action:summary|| (stopped?"Arrêt opérateur persistant pour cette session.":"État Auto A non résident."),
      paper_only:true,
      real_orders:false,
      fallback:true
    });
  }

  function stopOwner(){
    if(typeof globalThis.strategyAAutoStop==="function"){
      return {kind:"function",run:()=>globalThis.strategyAAutoStop("KILL SWITCH · arrêt opérateur depuis le tableau de bord 40.6.345.")};
    }
    for(const id of ["strategyAAutoStop","strategyAOperatorStop","strategyAVisualStop404269"]){
      const button=byId(id);
      if(button instanceof HTMLElement)return {kind:"button",id,run:()=>{button.click();return autoSnapshot();}};
    }
    return null;
  }

  function stopState(){
    const snap=autoSnapshot();
    let persisted=false;
    try{persisted=sessionStorage.getItem(MANUAL_STOP_KEY)==="1";}catch(_){}
    return Object.freeze({
      available:!!stopOwner(),
      enabled:snap?.enabled===true,
      phase:String(snap?.phase||"UNKNOWN"),
      last_action:compact(snap?.last_action||"—",120),
      persisted,
      paper_only:snap?.paper_only!==false,
      real_orders:snap?.real_orders===true
    });
  }

  function emit(action,detail={}){
    try{window.dispatchEvent(new CustomEvent("agent-crypto:operator-kill-switch",{detail:{build:BUILD,action,operator_action:true,...detail}}));}catch(_){}
  }

  function render(){
    const root=byId(ROOT_ID);
    if(!root)return false;
    root.dataset.mode=state.mode;

    const math=mathSnapshot();
    const scoreText=math.raw==="—"?"—":math.raw+(String(math.raw).includes("/")?"":"/100");
    byId("acOperatorMathScore406345")&&(byId("acOperatorMathScore406345").textContent=scoreText);
    byId("acOperatorMathHead406345")?.setAttribute("data-mini-score",scoreText);
    byId("acOperatorMathLabel406345")&&(byId("acOperatorMathLabel406345").textContent=math.label);
    byId("acOperatorMathContext406345")&&(byId("acOperatorMathContext406345").textContent=math.context);
    byId("acOperatorMathVerdict406345")&&(byId("acOperatorMathVerdict406345").textContent=math.verdict);

    const ks=stopState();
    const status=state.stop_pending?"ARRÊT…":ks.persisted||ks.enabled===false?"STOP":ks.enabled===true?"AUTO A ACTIF":ks.available?"PRÊT":"INDISPONIBLE";
    root.dataset.killState=(ks.persisted||ks.enabled===false)?"stopped":ks.enabled===true?"active":"idle";
    byId("acOperatorKillState406345")&&(byId("acOperatorKillState406345").textContent=status);
    byId("acOperatorKillDetail406345")&&(byId("acOperatorKillDetail406345").textContent=ks.persisted?"Arrêt opérateur persistant · session actuelle":ks.last_action);
    byId("acOperatorPaperOnly406345")&&(byId("acOperatorPaperOnly406345").textContent=ks.paper_only&&!ks.real_orders?"PAPER ONLY":"ÉTAT À VÉRIFIER");
    root.querySelectorAll("[data-ac-kill-stop]").forEach(button=>{
      button.disabled=state.stop_pending||!ks.available;
      button.setAttribute("aria-pressed",ks.persisted||ks.enabled===false?"true":"false");
      button.title=ks.available?"Arrêter le scheduler Auto A Paper existant.":"STOP Auto A non encore résident.";
    });
    return true;
  }

  let raf=0;
  function scheduleRender(){
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;render();});
  }

  function setMode(mode){
    if(!["normal","mini","hidden"].includes(mode))return false;
    state.mode=mode;
    render();
    emit("DASHBOARD_"+mode.toUpperCase());
    return true;
  }

  function operatorStop(){
    const owner=stopOwner();
    if(!owner){
      state.last_error="STOP_OWNER_NOT_RESIDENT";
      render();
      return false;
    }
    const ok=window.confirm(
      "KILL SWITCH · STOP\n\n"+
      "Arrêter le scheduler Auto A Paper ?\n"+
      "Une position Paper éventuelle reste intacte et surveillable.\n"+
      "L’interface, Math Core, Oracle, Atlas et le graphique restent lisibles.\n"+
      "Aucun ordre réel, wallet ou suppression n’est déclenché."
    );
    if(!ok)return false;
    state.stop_pending=true;render();
    try{
      const result=owner.run();
      state.last_stop={at:new Date().toISOString(),owner:owner.kind,id:owner.id||null,result:result||null};
      state.last_error=null;
      emit("STOP",{owner:owner.kind,owner_id:owner.id||null,paper_only:true,real_orders:false});
      return true;
    }catch(error){
      state.last_error=String(error?.message||error);
      emit("STOP_FAILED",{error:state.last_error});
      return false;
    }finally{
      state.stop_pending=false;
      render();
    }
  }

  function ensureStyle(){
    if(byId("agentCryptoOperatorDashboardStyle406345"))return;
    const style=document.createElement("style");
    style.id="agentCryptoOperatorDashboardStyle406345";
    style.textContent=`
#${ROOT_ID}{position:fixed;left:12px;right:12px;bottom:14px;z-index:2147482400;pointer-events:none;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--cyan:#65e8ff;--gold:#ffe19a;--red:#ff717d}
#${ROOT_ID} *{box-sizing:border-box}
#${ROOT_ID} .od-panel{position:absolute;bottom:0;pointer-events:auto;color:#e9f7fb;border:1px solid rgba(101,232,255,.28);border-radius:18px;background:linear-gradient(145deg,rgba(5,20,31,.96),rgba(5,12,21,.93));box-shadow:0 18px 48px rgba(0,0,0,.42),inset 0 0 0 1px rgba(255,255,255,.025);backdrop-filter:blur(16px);overflow:hidden}
#${ROOT_ID} .od-math{left:0;width:clamp(285px,24vw,385px);min-height:156px;border-color:rgba(101,232,255,.34)}
#${ROOT_ID} .od-kill{right:0;width:clamp(250px,21vw,330px);min-height:156px;border-color:rgba(255,113,125,.34)}
#${ROOT_ID} .od-head{display:flex;align-items:center;justify-content:space-between;gap:9px;padding:11px 13px 9px;border-bottom:1px solid rgba(255,255,255,.055)}
#${ROOT_ID} .od-kicker{font-size:10px;font-weight:950;letter-spacing:.14em;color:var(--cyan);white-space:nowrap}
#${ROOT_ID} .od-kill .od-kicker{color:#ffc1c6}
#${ROOT_ID} button{font:900 10px/1 system-ui,sans-serif;letter-spacing:.04em;border-radius:999px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.045);color:#dcecf2;padding:8px 11px;cursor:pointer}
#${ROOT_ID} button:hover{background:rgba(255,255,255,.09)}
#${ROOT_ID} button:focus-visible{outline:2px solid rgba(101,232,255,.82);outline-offset:2px}
#${ROOT_ID} button:disabled{opacity:.36;cursor:not-allowed}
#${ROOT_ID} .od-body{padding:12px 14px 14px}
#${ROOT_ID} .od-score-row{display:flex;align-items:center;gap:13px}
#${ROOT_ID} .od-score{display:grid;place-items:center;min-width:94px;height:78px;padding:0 12px;border-radius:18px;border:1px solid rgba(101,232,255,.32);background:radial-gradient(circle at 50% 20%,rgba(101,232,255,.13),rgba(3,14,23,.68));font-size:26px;font-weight:1000;color:#effdff;text-shadow:0 0 18px rgba(101,232,255,.24)}
#${ROOT_ID} .od-score-copy{min-width:0}
#${ROOT_ID} .od-score-copy b{display:block;font-size:13px;color:#fff0bc}
#${ROOT_ID} .od-score-copy small{display:block;margin-top:5px;color:#8fa9b5;font-size:9px;line-height:1.35}
#${ROOT_ID} .od-verdict{margin:10px 0 0;padding-top:9px;border-top:1px solid rgba(255,255,255,.055);font-size:10px;line-height:1.38;color:#bad0da}
#${ROOT_ID} .od-kill-state{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(255,255,255,.025)}
#${ROOT_ID} .od-kill-state strong{font-size:18px;color:#f7fbfc}
#${ROOT_ID}[data-kill-state="stopped"] .od-kill-state strong{color:#ff939d}
#${ROOT_ID}[data-kill-state="active"] .od-kill-state strong{color:#ffe09a}
#${ROOT_ID} .od-paper{padding:5px 8px;border-radius:999px;border:1px solid rgba(167,255,156,.25);color:#b8ffad;background:rgba(45,105,49,.12);font-size:8px;font-weight:950}
#${ROOT_ID} .od-kill-detail{min-height:30px;margin:8px 2px 10px;font-size:9px;line-height:1.35;color:#92aab5}
#${ROOT_ID} .od-stop{width:100%;min-height:42px;border-color:rgba(255,113,125,.60);color:#ffe1e4;background:linear-gradient(180deg,rgba(157,35,49,.38),rgba(91,20,31,.30));font-size:13px}
#${ROOT_ID} .od-mini-open,#${ROOT_ID} .od-stop-mini{display:none}
#${ROOT_ID} .od-reopen{display:none;pointer-events:auto;position:absolute;left:0;bottom:0;border-color:rgba(101,232,255,.35);background:rgba(5,20,31,.95);color:#bdefff}
#${ROOT_ID}[data-mode="mini"] .od-panel{min-height:0;height:52px;border-radius:16px}
#${ROOT_ID}[data-mode="mini"] .od-math{width:230px}
#${ROOT_ID}[data-mode="mini"] .od-kill{width:335px}
#${ROOT_ID}[data-mode="mini"] .od-body,#${ROOT_ID}[data-mode="mini"] .od-hide-normal{display:none!important}
#${ROOT_ID}[data-mode="mini"] .od-head{height:50px;padding:7px 9px;border-bottom:0}
#${ROOT_ID}[data-mode="mini"] .od-math .od-head::after{content:attr(data-mini-score);font-size:18px;font-weight:1000;color:#effdff;margin-left:auto}
#${ROOT_ID}[data-mode="mini"] .od-kill .od-head{justify-content:flex-start}
#${ROOT_ID}[data-mode="mini"] .od-mini-open,#${ROOT_ID}[data-mode="mini"] .od-stop-mini{display:inline-flex}
#${ROOT_ID}[data-mode="mini"] .od-mini-open{margin-left:auto}
#${ROOT_ID}[data-mode="mini"] .od-stop-mini{border-color:rgba(255,113,125,.62);color:#ffe0e3;background:rgba(132,31,42,.34)}
#${ROOT_ID}[data-mode="hidden"] .od-panel{display:none}
#${ROOT_ID}[data-mode="hidden"] .od-reopen{display:inline-flex}
@media(max-width:900px){#${ROOT_ID}{left:8px;right:8px;bottom:8px}#${ROOT_ID} .od-math{width:min(46vw,340px)}#${ROOT_ID} .od-kill{width:min(43vw,300px)}#${ROOT_ID}[data-mode="mini"] .od-math{width:195px}#${ROOT_ID}[data-mode="mini"] .od-kill{width:305px}}
@media(max-width:620px){#${ROOT_ID} .od-math{left:0;width:calc(100vw - 16px);bottom:166px}#${ROOT_ID} .od-kill{right:auto;left:0;width:calc(100vw - 16px)}#${ROOT_ID}[data-mode="mini"] .od-math{width:42vw;bottom:0}#${ROOT_ID}[data-mode="mini"] .od-kill{left:auto;right:0;width:54vw}}
`;
    document.head.appendChild(style);
  }

  function mount(){
    if(byId(ROOT_ID)){state.mounted=true;scheduleRender();return true;}
    ensureStyle();
    const root=document.createElement("div");
    root.id=ROOT_ID;root.dataset.mode=state.mode;root.dataset.killState="idle";
    root.setAttribute("aria-label","Tableau de bord opérateur Math Core et Kill Switch");
    root.innerHTML=`
<section class="od-panel od-math" aria-label="Math Core synthétique">
  <div class="od-head" id="acOperatorMathHead406345" data-mini-score="—">
    <span class="od-kicker">MATH CORE</span>
    <button type="button" class="od-hide-normal" data-dashboard-mode="mini">MINI</button>
  </div>
  <div class="od-body">
    <div class="od-score-row"><div class="od-score" id="acOperatorMathScore406345">—</div><div class="od-score-copy"><b id="acOperatorMathLabel406345">En attente</b><small id="acOperatorMathContext406345">Contexte Market : en attente</small></div></div>
    <p class="od-verdict" id="acOperatorMathVerdict406345">Lecture Math Core en attente.</p>
  </div>
</section>
<section class="od-panel od-kill" aria-label="Kill Switch opérateur">
  <div class="od-head">
    <span class="od-kicker">KILL SWITCH</span>
    <button type="button" class="od-hide-normal" data-dashboard-mode="hidden">MASQUER</button>
    <button type="button" class="od-mini-open" data-dashboard-mode="normal">OUVRIR</button>
    <button type="button" class="od-stop-mini" data-ac-kill-stop>STOP</button>
  </div>
  <div class="od-body">
    <div class="od-kill-state"><strong id="acOperatorKillState406345">PRÊT</strong><span class="od-paper" id="acOperatorPaperOnly406345">PAPER ONLY</span></div>
    <div class="od-kill-detail" id="acOperatorKillDetail406345">STOP Auto A · lecture et monitoring préservés.</div>
    <button type="button" class="od-stop" data-ac-kill-stop>STOP</button>
  </div>
</section>
<button type="button" class="od-reopen" data-dashboard-mode="normal">TABLEAU DE BORD · OUVRIR</button>`;
    document.body.appendChild(root);
    root.querySelectorAll("[data-dashboard-mode]").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.dashboardMode)));
    root.querySelectorAll("[data-ac-kill-stop]").forEach(b=>b.addEventListener("click",operatorStop));
    state.mounted=true;render();return true;
  }

  function bind(){
    if(state.bound)return;state.bound=true;
    ["agent-crypto:market-series-updated","agentcrypto:current-finalized","agent-crypto:current-finalized","agent-crypto:evidence-data-changed","agent-crypto:evidence-refresh-complete","agent-crypto:runtime-modules-ready","agent-crypto:postboot-runtime-ready","erith:system-hydrated","pageshow"].forEach(name=>window.addEventListener(name,scheduleRender,{passive:true}));
    document.addEventListener("visibilitychange",()=>{if(!document.hidden)scheduleRender();},{passive:true});
  }

  function start(){mount();bind();scheduleRender();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();

  globalThis.AgentCryptoOperatorDashboard406345=Object.freeze({
    build:BUILD,mount,render:scheduleRender,set_mode:setMode,stop:operatorStop,
    snapshot:()=>Object.freeze({build:BUILD,mode:state.mode,mounted:state.mounted,math:mathSnapshot(),kill:stopState(),last_stop:state.last_stop,error:state.last_error}),
    math_source:"CANONICAL_MATH_DOM",
    kill_owner:"strategyAAutoStop / existing STOP controls",
    kill_scope:"AUTO_A_PAPER_SCHEDULER_ONLY",
    paper_position_preserved:true,
    reading_preserved:true,
    paper_only:true,
    real_orders:false,
    wallet:false,
    storage_owner:false,
    network:false,
    recurring_timer:false,
    mutation_observer:false
  });
})();