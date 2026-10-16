/* Agent-Crypto Administrator — 40.6.356
   OPERATOR DASHBOARD · TEMPERED CRIMSON
   Single DOM/CSS authority. Crimson intensity moderated; geometry unchanged. */
(()=>{
  "use strict";
  if(globalThis.AgentCryptoOperatorDashboard406356)return;

  const BUILD="40.6.356";
  const ROOT_ID="agentCryptoOperatorDashboard406356";
  const STYLE_ID="agentCryptoOperatorDashboardStyle406356";
  const MANUAL_STOP_KEY="agent_crypto_strategy_a_auto_manual_stop_v1";
  const MATH_BOOT_PROBE_MAX=30;
  const MATH_BOOT_PROBE_MS=500;
  const state={
    mathMode:"mini",
    killMode:"mini",
    mounted:false,
    bound:false,
    stop_pending:false,
    last_stop:null,
    last_error:null,
    math_hydrated:false,
    math_probe_attempts:0
  };

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
    const inlineRing=numberFrom(byId("scoreRing")?.style?.getPropertyValue("--score"));
    const progress=Number.isFinite(inlineRing)
      ?Math.max(0,Math.min(100,inlineRing))
      :(Number.isFinite(score)?Math.max(0,Math.min(100,score)):0);
    return Object.freeze({
      raw,
      score:Number.isFinite(score)?score:null,
      progress,
      label:compact(byId("scoreLabel")?.textContent||"En attente",64),
      context:compact(byId("atlasMathContextLine")?.textContent||"Contexte Market : en attente",100),
      verdict:compact(byId("atlasHumanVerdict")?.innerText||byId("atlasHumanVerdict")?.textContent||"Lecture Math Core en attente.",160),
      source:"CANONICAL_MATH_DOM"
    });
  }

  function mathReady(math=mathSnapshot()){
    const t=(String(math.label||"")+" "+String(math.context||"")).toLowerCase();
    return Number.isFinite(math.score)&&math.score>=0&&!/données insuffisantes|donnees insuffisantes|en attente/.test(t);
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
      last_action:summary||(stopped?"Arrêt opérateur persistant pour cette session.":"État Auto A non résident."),
      paper_only:true,
      real_orders:false,
      fallback:true
    });
  }

  function stopOwner(){
    if(typeof globalThis.strategyAAutoStop==="function"){
      return {kind:"function",run:()=>globalThis.strategyAAutoStop("KILL SWITCH · arrêt opérateur depuis le tableau de bord 40.6.356.")};
    }
    for(const id of ["strategyAAutoStop","strategyAOperatorStop","strategyAVisualStop404269"]){
      const button=byId(id);
      if(button instanceof HTMLElement){
        return {kind:"button",id,run:()=>{button.click();return autoSnapshot();}};
      }
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
    try{
      window.dispatchEvent(new CustomEvent("agent-crypto:operator-kill-switch",{
        detail:{build:BUILD,action,operator_action:true,...detail}
      }));
    }catch(_){}
  }

  function scoreTextOf(math){
    if(!math.raw||math.raw==="—")return "—";
    return String(math.raw).includes("/")?math.raw:math.raw+"/100";
  }

  function setWingMode(wing,mode){
    if(!["math","kill"].includes(wing)||!["normal","mini","hidden"].includes(mode))return false;
    if(wing==="math")state.mathMode=mode;
    else state.killMode=mode;
    render();
    emit("DASHBOARD_"+wing.toUpperCase()+"_"+mode.toUpperCase());
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
      "KILL SWITCH\n\nCouper le scheduler Auto A Paper ?\n"+
      "Une position Paper éventuelle reste intacte et surveillable.\n"+
      "L’interface, Math Core, Oracle, Atlas et le graphique restent lisibles.\n"+
      "Aucun ordre réel, wallet ou suppression n’est déclenché."
    );
    if(!ok)return false;
    state.stop_pending=true;
    render();
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
    if(byId(STYLE_ID))return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
#${ROOT_ID}{
  position:fixed;inset:0;z-index:2147482400;pointer-events:none;
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --cyan:#72efff;--cyan-hot:#a5f8ff;--red:#d85b72;--red-hot:#ee9baa;--gold:#ffd978;
  --math-score:0;
}
#${ROOT_ID} *{box-sizing:border-box}
#${ROOT_ID} button{font:inherit}
#${ROOT_ID} .wing{
  position:absolute;bottom:18px;pointer-events:auto;color:#eaf8fb;
}
#${ROOT_ID} .normal,#${ROOT_ID} .mini,#${ROOT_ID} .recall{display:none}

/* EXCLUSIVE STATE AUTHORITY */
#${ROOT_ID}[data-math-mode="normal"] .math-wing .normal{display:block}
#${ROOT_ID}[data-math-mode="mini"] .math-wing .mini{display:grid}
#${ROOT_ID}[data-math-mode="hidden"] .math-wing{display:none}
#${ROOT_ID}[data-math-mode="hidden"] .math-recall{display:grid}
#${ROOT_ID}[data-kill-mode="normal"] .kill-wing .normal{display:block}
#${ROOT_ID}[data-kill-mode="mini"] .kill-wing .mini{display:grid}
#${ROOT_ID}[data-kill-mode="hidden"] .kill-wing{display:none}
#${ROOT_ID}[data-kill-mode="hidden"] .kill-recall{display:grid}

/* OPEN PANELS */
#${ROOT_ID}[data-math-mode="normal"] .math-wing{
  left:16px;width:clamp(258px,20.5vw,334px);
}
#${ROOT_ID}[data-kill-mode="normal"] .kill-wing{
  right:16px;width:clamp(236px,18.5vw,292px);
}
#${ROOT_ID} .panel{
  position:relative;overflow:hidden;border-radius:21px;
  border:1px solid rgba(114,239,255,.58);
  background:linear-gradient(145deg,rgba(4,18,29,.53),rgba(4,10,18,.40));
  backdrop-filter:blur(12px) saturate(130%);
  box-shadow:0 14px 34px rgba(0,0,0,.28),0 0 28px rgba(74,220,255,.12),inset 0 0 28px rgba(70,220,255,.045);
}
#${ROOT_ID} .kill-wing .panel{
  border-color:rgba(216,91,114,.42);
  background:linear-gradient(145deg,rgba(22,9,18,.50),rgba(8,8,14,.43));
  box-shadow:0 14px 34px rgba(0,0,0,.30),0 0 22px rgba(216,91,114,.075),inset 0 0 24px rgba(216,91,114,.028);
}
#${ROOT_ID} .panel:before{
  content:"";position:absolute;left:15px;top:0;width:48%;height:1px;
  background:linear-gradient(90deg,var(--cyan),rgba(255,217,120,.56),transparent);
  filter:drop-shadow(0 0 5px rgba(114,239,255,.5));
}
#${ROOT_ID} .kill-wing .panel:before{
  left:auto;right:15px;
  background:linear-gradient(270deg,rgba(216,91,114,.78),rgba(255,217,120,.44),transparent);
  filter:drop-shadow(0 0 4px rgba(216,91,114,.30));
}
#${ROOT_ID} .head{
  height:46px;display:flex;align-items:center;justify-content:space-between;
  padding:8px 11px;border-bottom:1px solid rgba(255,255,255,.055);
}
#${ROOT_ID} .kicker{
  font-size:10px;font-weight:1000;letter-spacing:.15em;color:var(--cyan-hot);
  text-shadow:0 0 5px rgba(114,239,255,.58);
}
#${ROOT_ID} .kill-wing .kicker{
  color:#eaa4b0;text-shadow:0 0 4px rgba(216,91,114,.34);
}
#${ROOT_ID} .controls{display:flex;gap:6px;align-items:center}
#${ROOT_ID} .ctrl{
  width:28px;height:28px;padding:0;border-radius:50%;display:grid;place-items:center;
  border:1px solid rgba(255,217,120,.22);background:rgba(255,255,255,.035);
  color:#e9f7fb;font-size:14px;font-weight:900;cursor:pointer;
}
#${ROOT_ID} .ctrl:hover{transform:scale(1.05)}
#${ROOT_ID} .body{padding:10px 11px 11px}

/* MATH OPEN */
#${ROOT_ID} .math-row{display:flex;align-items:center;gap:11px}
#${ROOT_ID} .math-ring,
#${ROOT_ID} .math-mini-ring{
  display:grid;place-items:center;border:0;padding:6px;border-radius:50%;
  background:conic-gradient(from -90deg,
    rgba(120,248,255,.98) calc(var(--math-score) * 1%),
    rgba(114,239,255,.12) 0 100%);
  box-shadow:0 0 12px rgba(114,239,255,.30),0 0 28px rgba(46,190,255,.15);
}
#${ROOT_ID} .math-ring{width:82px;height:82px;flex:0 0 82px}
#${ROOT_ID} .ring-core{
  width:100%;height:100%;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle at 42% 26%,rgba(120,248,255,.22),rgba(0,74,108,.16) 38%,rgba(2,12,22,.90) 76%);
  border:1px solid rgba(114,239,255,.36);
}
#${ROOT_ID} .math-ring .value{
  color:#79eaff;font-size:21px;font-weight:1000;
  text-shadow:0 0 2px rgba(149,244,255,.72),0 0 7px rgba(61,205,255,.24);
}
#${ROOT_ID} .math-copy{min-width:0}
#${ROOT_ID} .math-copy b{
  display:block;color:#8ff2ff;font-size:12px;
  text-shadow:0 0 3px rgba(143,242,255,.45);
}
#${ROOT_ID} .math-copy small{
  display:block;margin-top:5px;color:#9fc7d4;font-size:8.5px;line-height:1.35;
}

/* KILL OPEN */
#${ROOT_ID} .kill-layout{
  display:grid;grid-template-columns:minmax(0,1fr) 92px;gap:10px;align-items:center;
}
#${ROOT_ID} .kill-state{
  padding:8px;border:1px solid rgba(255,217,120,.13);border-radius:14px;background:rgba(9,8,13,.22);
}
#${ROOT_ID} .kill-state strong{
  display:block;font-size:16px;color:var(--gold);text-shadow:0 0 7px rgba(255,217,120,.34);
}
#${ROOT_ID}[data-kill-state="stopped"] .kill-state strong{
  color:#e996a6;text-shadow:0 0 4px rgba(216,91,114,.34);
}
#${ROOT_ID} .paper{
  display:inline-block;margin-top:6px;padding:4px 7px;border-radius:999px;
  background:rgba(95,255,128,.08);border:1px solid rgba(95,255,128,.18);
  color:#a9ffb5;font-size:8px;font-weight:1000;
}
#${ROOT_ID} .kill-detail{margin-top:6px;color:#9db0b8;font-size:8px;line-height:1.3}
#${ROOT_ID} .kill-ring,
#${ROOT_ID} .kill-mini-ring{
  display:grid;place-items:center;border:0;padding:6px;border-radius:50%;cursor:pointer;
  background:conic-gradient(from -90deg,
    rgba(216,91,114,.92) 0 79%,
    rgba(240,205,125,.90) 79% 82%,
    rgba(216,91,114,.92) 82% 100%);
  box-shadow:0 0 11px rgba(216,91,114,.24),0 0 24px rgba(190,48,78,.11);
  transform-origin:center;transition:transform .14s ease,filter .14s ease;
}
#${ROOT_ID} .kill-ring{width:90px;height:90px}
#${ROOT_ID} .kill-ring:active,#${ROOT_ID} .kill-mini-ring:active{transform:scale(1.10);filter:brightness(1.14)}
#${ROOT_ID} .kill-core{
  width:100%;height:100%;border-radius:50%;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:2px;
  background:radial-gradient(circle at 45% 28%,rgba(216,91,114,.22),rgba(72,18,34,.62) 48%,rgba(22,7,14,.94) 78%);
  border:1px solid rgba(225,137,151,.34);
}
#${ROOT_ID} .kill-core .kill-word{color:var(--gold);font-size:9px;font-weight:1000;text-shadow:0 0 4px rgba(255,217,120,.45)}
#${ROOT_ID} .kill-core .switch-word{color:#eca1ae;font-size:17px;font-weight:1000;text-shadow:0 0 3px rgba(216,91,114,.42)}

/* MINI — SAME GEOMETRY BOTH SIDES */
#${ROOT_ID}[data-math-mode="mini"] .math-wing,
#${ROOT_ID}[data-kill-mode="mini"] .kill-wing{
  bottom:-10px;width:104px;height:104px;
}
#${ROOT_ID}[data-math-mode="mini"] .math-wing{left:-10px}
#${ROOT_ID}[data-kill-mode="mini"] .kill-wing{right:-10px}
#${ROOT_ID} .mini{
  width:104px;height:104px;place-items:center;position:relative;
}
#${ROOT_ID} .math-mini-ring,
#${ROOT_ID} .kill-mini-ring{
  width:94px;height:94px;
}
#${ROOT_ID} .math-mini-ring{cursor:pointer}
#${ROOT_ID} .mini-math-core{
  width:100%;height:100%;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;
  background:radial-gradient(circle at 44% 26%,rgba(112,243,255,.20),rgba(0,74,108,.16) 40%,rgba(3,14,23,.94) 76%);
  border:1px solid rgba(114,239,255,.38);
}
#${ROOT_ID} .mini-title{
  color:var(--gold);font-size:7.5px;font-weight:1000;letter-spacing:.09em;text-shadow:0 0 4px rgba(255,217,120,.34);
}
#${ROOT_ID} .mini-score{
  color:#79eaff;font-size:19px;font-weight:1000;
  text-shadow:0 0 2px rgba(149,244,255,.72),0 0 7px rgba(61,205,255,.22);
}
#${ROOT_ID} .kill-mini-ring .switch-word{font-size:15px}
#${ROOT_ID} .mini-open{
  position:absolute;z-index:3;top:3px;left:3px;width:27px;height:27px;padding:0;border-radius:50%;
  display:grid;place-items:center;border:1px solid rgba(255,217,120,.24);
  background:rgba(7,20,30,.86);color:#e9f7fb;font-size:13px;font-weight:1000;cursor:pointer;
}
#${ROOT_ID}[data-math-mode="mini"] .math-wing:hover{transform:translate(4px,-4px)}
#${ROOT_ID}[data-kill-mode="mini"] .kill-wing:hover{transform:translate(-4px,-4px)}
#${ROOT_ID} .wing{transition:transform .18s ease}

/* HIDDEN RECALL */
#${ROOT_ID} .recall{
  position:absolute;bottom:11px;width:62px;height:62px;border-radius:50%;
  place-items:center;padding:5px;pointer-events:auto;cursor:pointer;
  font-size:7px;font-weight:1000;letter-spacing:.08em;line-height:1.05;text-align:center;
  background:rgba(4,15,24,.82);box-shadow:0 12px 28px rgba(0,0,0,.38);
}
#${ROOT_ID} .math-recall{
  left:-8px;color:var(--cyan-hot);border:1px solid rgba(114,239,255,.60);
}
#${ROOT_ID} .kill-recall{
  right:-8px;color:#eaa4b0;border:1px solid rgba(216,91,114,.48);
}

/* HARD EXCLUSIVITY — no ghost MINI when NORMAL */
#${ROOT_ID}[data-math-mode="normal"] .math-wing .mini,
#${ROOT_ID}[data-kill-mode="normal"] .kill-wing .mini{display:none!important}
#${ROOT_ID}[data-math-mode="mini"] .math-wing .normal,
#${ROOT_ID}[data-kill-mode="mini"] .kill-wing .normal{display:none!important}

@media(max-width:620px){
  #${ROOT_ID}[data-math-mode="mini"] .math-wing,
  #${ROOT_ID}[data-kill-mode="mini"] .kill-wing{bottom:-8px;width:100px;height:100px}
  #${ROOT_ID}[data-math-mode="mini"] .math-wing{left:-8px}
  #${ROOT_ID}[data-kill-mode="mini"] .kill-wing{right:-8px}
  #${ROOT_ID} .mini{width:100px;height:100px}
  #${ROOT_ID} .math-mini-ring,#${ROOT_ID} .kill-mini-ring{width:90px;height:90px}
  #${ROOT_ID}[data-math-mode="normal"] .math-wing{left:8px;width:min(330px,calc(100vw - 16px));bottom:154px}
  #${ROOT_ID}[data-kill-mode="normal"] .kill-wing{right:8px;width:min(292px,calc(100vw - 16px))}
}
`;
    document.head.appendChild(style);
  }

  function mount(){
    if(byId(ROOT_ID)){
      state.mounted=true;
      render();
      return true;
    }
    ensureStyle();
    const root=document.createElement("div");
    root.id=ROOT_ID;
    root.dataset.mathMode=state.mathMode;
    root.dataset.killMode=state.killMode;
    root.dataset.killState="idle";
    root.setAttribute("aria-label","Tableau de bord opérateur Math Core et Kill Switch");
    root.innerHTML=`
<section class="wing math-wing" aria-label="Math Core synthétique">
  <div class="normal panel">
    <div class="head">
      <span class="kicker">MATH CORE</span>
      <div class="controls">
        <button class="ctrl" type="button" data-wing="math" data-mode="mini" aria-label="Minimiser Math Core">−</button>
        <button class="ctrl" type="button" data-wing="math" data-mode="hidden" aria-label="Masquer Math Core">×</button>
      </div>
    </div>
    <div class="body">
      <div class="math-row">
        <div class="math-ring"><div class="ring-core"><span class="value" id="acOperatorMathScore406356">—</span></div></div>
        <div class="math-copy">
          <b id="acOperatorMathLabel406356">En attente</b>
          <small id="acOperatorMathContext406356">Contexte Market : en attente</small>
        </div>
      </div>
    </div>
  </div>
  <div class="mini">
    <button class="math-mini-ring" type="button" data-wing="math" data-mode="normal" aria-label="Ouvrir Math Core">
      <span class="mini-math-core">
        <span class="mini-title">MATH CORE</span>
        <span class="mini-score" id="acOperatorMathMiniScore406356">—</span>
      </span>
    </button>
  </div>
</section>

<section class="wing kill-wing" aria-label="Kill Switch opérateur">
  <div class="normal panel">
    <div class="head">
      <span class="kicker">KILL SWITCH</span>
      <div class="controls">
        <button class="ctrl" type="button" data-wing="kill" data-mode="mini" aria-label="Minimiser Kill Switch">−</button>
        <button class="ctrl" type="button" data-wing="kill" data-mode="hidden" aria-label="Masquer Kill Switch">×</button>
      </div>
    </div>
    <div class="body">
      <div class="kill-layout">
        <div>
          <div class="kill-state">
            <strong id="acOperatorKillState406356">PRÊT</strong>
            <span class="paper" id="acOperatorPaperOnly406356">PAPER ONLY</span>
          </div>
          <div class="kill-detail" id="acOperatorKillDetail406356">Auto A Paper · lecture et monitoring préservés.</div>
        </div>
        <button class="kill-ring" type="button" data-kill-stop aria-label="KILL SWITCH">
          <span class="kill-core"><span class="kill-word">KILL</span><span class="switch-word">SWITCH</span></span>
        </button>
      </div>
    </div>
  </div>
  <div class="mini">
    <div style="position:relative;width:104px;height:104px;display:grid;place-items:center">
      <button class="mini-open" type="button" data-wing="kill" data-mode="normal" aria-label="Ouvrir Kill Switch">↗</button>
      <button class="kill-mini-ring" type="button" data-kill-stop aria-label="KILL SWITCH">
        <span class="kill-core"><span class="mini-title">KILL</span><span class="switch-word">SWITCH</span></span>
      </button>
    </div>
  </div>
</section>

<button class="recall math-recall" type="button" data-wing="math" data-mode="normal" aria-label="Rappeler Math Core">MATH<br>CORE</button>
<button class="recall kill-recall" type="button" data-wing="kill" data-mode="normal" aria-label="Rappeler Kill Switch">KILL<br>SWITCH</button>
`;
    document.body.appendChild(root);

    root.querySelectorAll("[data-wing][data-mode]").forEach(button=>{
      button.addEventListener("click",event=>{
        event.preventDefault();
        event.stopPropagation();
        setWingMode(button.dataset.wing,button.dataset.mode);
      });
    });
    root.querySelectorAll("[data-kill-stop]").forEach(button=>{
      button.addEventListener("click",event=>{
        event.preventDefault();
        event.stopPropagation();
        operatorStop();
      });
    });

    state.mounted=true;
    render();
    return true;
  }

  function render(){
    const root=byId(ROOT_ID);
    if(!root)return false;

    root.dataset.mathMode=state.mathMode;
    root.dataset.killMode=state.killMode;

    const math=mathSnapshot();
    const scoreText=scoreTextOf(math);
    root.style.setProperty("--math-score",String(math.progress));

    for(const id of ["acOperatorMathScore406356","acOperatorMathMiniScore406356"]){
      const node=byId(id);
      if(node)node.textContent=scoreText;
    }
    const label=byId("acOperatorMathLabel406356");
    if(label)label.textContent=math.label;
    const context=byId("acOperatorMathContext406356");
    if(context)context.textContent=math.context;

    const ks=stopState();
    const status=state.stop_pending
      ?"COUPURE…"
      :ks.persisted||ks.enabled===false
        ?"COUPÉ"
        :ks.enabled===true
          ?"ACTIF"
          :ks.available?"PRÊT":"INDISPONIBLE";

    root.dataset.killState=(ks.persisted||ks.enabled===false)?"stopped":ks.enabled===true?"active":"idle";

    const stateNode=byId("acOperatorKillState406356");
    if(stateNode)stateNode.textContent=status;
    const detail=byId("acOperatorKillDetail406356");
    if(detail)detail.textContent=ks.persisted?"Arrêt opérateur persistant · session actuelle":ks.last_action;
    const paper=byId("acOperatorPaperOnly406356");
    if(paper)paper.textContent=ks.paper_only&&!ks.real_orders?"PAPER ONLY":"ÉTAT À VÉRIFIER";

    root.querySelectorAll("[data-kill-stop]").forEach(button=>{
      button.disabled=state.stop_pending||!ks.available;
      button.setAttribute("aria-pressed",ks.persisted||ks.enabled===false?"true":"false");
      button.title=ks.available
        ?"KILL SWITCH · couper Auto A Paper existant."
        :"KILL SWITCH indisponible tant que Auto A n’est pas résident.";
    });
    return true;
  }

  let raf=0;
  let mathBootTimer=0;
  function scheduleRender(){
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;render();});
  }

  function armMathBootProbe(reset=false){
    if(reset){
      state.math_probe_attempts=0;
      state.math_hydrated=false;
    }
    if(mathBootTimer||state.math_hydrated||state.math_probe_attempts>=MATH_BOOT_PROBE_MAX)return false;

    const probe=()=>{
      mathBootTimer=0;
      state.math_probe_attempts+=1;
      const math=mathSnapshot();
      state.math_hydrated=mathReady(math);
      scheduleRender();
      if(!state.math_hydrated&&state.math_probe_attempts<MATH_BOOT_PROBE_MAX){
        mathBootTimer=window.setTimeout(probe,MATH_BOOT_PROBE_MS);
      }
    };
    mathBootTimer=window.setTimeout(probe,180);
    return true;
  }

  function bind(){
    if(state.bound)return;
    state.bound=true;
    const onSourceRefresh=()=>{
      scheduleRender();
      if(!mathReady())armMathBootProbe(false);
    };
    [
      "agent-crypto:market-series-updated",
      "agentcrypto:current-finalized",
      "agent-crypto:current-finalized",
      "agent-crypto:evidence-data-changed",
      "agent-crypto:evidence-refresh-complete",
      "agent-crypto:runtime-modules-ready",
      "agent-crypto:postboot-runtime-ready",
      "erith:system-hydrated",
      "pageshow"
    ].forEach(name=>window.addEventListener(name,onSourceRefresh,{passive:true}));

    document.addEventListener("visibilitychange",()=>{
      if(!document.hidden)onSourceRefresh();
    },{passive:true});
  }

  function start(){
    mount();
    bind();
    scheduleRender();
    armMathBootProbe(true);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",start,{once:true});
  }else{
    start();
  }

  globalThis.AgentCryptoOperatorDashboard406356=Object.freeze({
    build:BUILD,
    mount,
    render:scheduleRender,
    set_math_mode:mode=>setWingMode("math",mode),
    set_kill_mode:mode=>setWingMode("kill",mode),
    show_all:()=>{setWingMode("math","normal");setWingMode("kill","normal");return true;},
    stop:operatorStop,
    snapshot:()=>Object.freeze({
      build:BUILD,
      math_mode:state.mathMode,
      kill_mode:state.killMode,
      mounted:state.mounted,
      math_hydrated:state.math_hydrated,
      math_probe_attempts:state.math_probe_attempts,
      math:mathSnapshot(),
      kill:stopState(),
      last_stop:state.last_stop,
      error:state.last_error
    }),
    math_source:"CANONICAL_MATH_DOM",
    math_ring_contract:"CANONICAL_SCORE_PERCENT",
    kill_owner:"strategyAAutoStop / existing STOP controls",
    kill_scope:"AUTO_A_PAPER_SCHEDULER_ONLY",
    clean_rewrite:true,
    exclusive_modes:true,
    independent_wings:true,
    hidden_recall_per_wing:true,
    docked_three_quarter:true,
    paper_position_preserved:true,
    reading_preserved:true,
    paper_only:true,
    real_orders:false,
    wallet:false,
    storage_owner:false,
    network:false,
    recurring_timer:false,
    bounded_math_boot_probe:true,
    mutation_observer:false
  });
})();
