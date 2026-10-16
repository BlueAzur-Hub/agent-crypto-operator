
/* Agent-Crypto Administrator — 40.6.349
   OPERATOR DASHBOARD · LIGHTER GLASS + CLEAN MATH
   Presentation-only luminous/clean refinement of 40.6.348. */
(()=>{
  "use strict";
  if(globalThis.AgentCryptoOperatorDashboard406349)return;

  const BUILD="40.6.349";
  const ROOT_ID="agentCryptoOperatorDashboard406349";
  const MANUAL_STOP_KEY="agent_crypto_strategy_a_auto_manual_stop_v1";
  const state={mathMode:"normal",killMode:"normal",mounted:false,bound:false,last_stop:null,last_error:null,stop_pending:false};

  const byId=id=>document.getElementById(id);
  const compact=(value,max=150)=>{const s=String(value??"").replace(/\s+/g," ").trim();return s.length>max?s.slice(0,max-1)+"…":s;};
  const numberFrom=value=>{const m=String(value??"").replace(",",".").match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):null;};

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
      build:null,enabled:visual?/ACTIF|ARM|OUVERT/i.test(visual):null,
      phase:stopped?"OFF":visual||"UNKNOWN",
      last_action:summary||(stopped?"Arrêt opérateur persistant pour cette session.":"État Auto A non résident."),
      paper_only:true,real_orders:false,fallback:true
    });
  }

  function stopOwner(){
    if(typeof globalThis.strategyAAutoStop==="function"){
      return {kind:"function",run:()=>globalThis.strategyAAutoStop("KILL SWITCH · arrêt opérateur depuis le tableau de bord 40.6.349.")};
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
      available:!!stopOwner(),enabled:snap?.enabled===true,phase:String(snap?.phase||"UNKNOWN"),
      last_action:compact(snap?.last_action||"—",120),persisted,
      paper_only:snap?.paper_only!==false,real_orders:snap?.real_orders===true
    });
  }

  function emit(action,detail={}){
    try{window.dispatchEvent(new CustomEvent("agent-crypto:operator-kill-switch",{detail:{build:BUILD,action,operator_action:true,...detail}}));}catch(_){}
  }

  function scoreTextOf(math){
    if(math.raw==="—"||!math.raw)return "—";
    return math.raw+(String(math.raw).includes("/")?"":"/100");
  }

  function render(){
    const root=byId(ROOT_ID); if(!root)return false;
    root.dataset.mathMode=state.mathMode;
    root.dataset.killMode=state.killMode;
    const math=mathSnapshot();
    const scoreText=scoreTextOf(math);
    for(const id of ["acOperatorMathScore406349","acOperatorMathMiniScore406349"]){const node=byId(id);if(node)node.textContent=scoreText;}
    const label=byId("acOperatorMathLabel406349");if(label)label.textContent=math.label;
    const context=byId("acOperatorMathContext406349");if(context)context.textContent=math.context;
    const verdict=byId("acOperatorMathVerdict406349");if(verdict)verdict.textContent=math.verdict;

    const ks=stopState();
    const status=state.stop_pending?"COUPURE…":ks.persisted||ks.enabled===false?"COUPÉ":ks.enabled===true?"ACTIF":ks.available?"PRÊT":"INDISPONIBLE";
    root.dataset.killState=(ks.persisted||ks.enabled===false)?"stopped":ks.enabled===true?"active":"idle";
    const stateNode=byId("acOperatorKillState406349");if(stateNode)stateNode.textContent=status;
    const detail=byId("acOperatorKillDetail406349");if(detail)detail.textContent=ks.persisted?"Arrêt opérateur persistant · session actuelle":ks.last_action;
    const paper=byId("acOperatorPaperOnly406349");if(paper)paper.textContent=ks.paper_only&&!ks.real_orders?"PAPER ONLY":"ÉTAT À VÉRIFIER";
    root.querySelectorAll("[data-ac-kill-stop]").forEach(button=>{
      button.disabled=state.stop_pending||!ks.available;
      button.setAttribute("aria-pressed",ks.persisted||ks.enabled===false?"true":"false");
      button.title=ks.available?"KILL SWITCH · couper Auto A Paper existant.":"KILL SWITCH indisponible tant que Auto A n’est pas résident.";
    });
    return true;
  }

  let raf=0;
  function scheduleRender(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;render();});}

  function setWingMode(wing,mode){
    if(!["math","kill"].includes(wing)||!["normal","mini","hidden"].includes(mode))return false;
    if(wing==="math")state.mathMode=mode;else state.killMode=mode;
    render();emit("DASHBOARD_"+wing.toUpperCase()+"_"+mode.toUpperCase());return true;
  }

  function operatorStop(){
    const owner=stopOwner();
    if(!owner){state.last_error="STOP_OWNER_NOT_RESIDENT";render();return false;}
    const ok=window.confirm("KILL SWITCH\n\nCouper le scheduler Auto A Paper ?\nUne position Paper éventuelle reste intacte et surveillable.\nL’interface, Math Core, Oracle, Atlas et le graphique restent lisibles.\nAucun ordre réel, wallet ou suppression n’est déclenché.");
    if(!ok)return false;
    state.stop_pending=true;render();
    try{
      const result=owner.run();
      state.last_stop={at:new Date().toISOString(),owner:owner.kind,id:owner.id||null,result:result||null};
      state.last_error=null;emit("STOP",{owner:owner.kind,owner_id:owner.id||null,paper_only:true,real_orders:false});return true;
    }catch(error){
      state.last_error=String(error?.message||error);emit("STOP_FAILED",{error:state.last_error});return false;
    }finally{state.stop_pending=false;render();}
  }

  function ensureStyle(){
    if(byId("agentCryptoOperatorDashboardStyle406349"))return;
    const style=document.createElement("style");
    style.id="agentCryptoOperatorDashboardStyle406349";
    style.textContent="\n#agentCryptoOperatorDashboard406349{position:fixed;inset:0;z-index:2147482400;pointer-events:none;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;--cyan:#65e8ff;--red:#ff717d}\n#agentCryptoOperatorDashboard406349 *{box-sizing:border-box}\n#agentCryptoOperatorDashboard406349 button{font-family:inherit}\n#agentCryptoOperatorDashboard406349 .od-wing{position:absolute;bottom:18px;pointer-events:auto;color:#e9f7fb;border:1px solid rgba(101,232,255,.30);border-radius:24px;background:linear-gradient(145deg,rgba(5,20,31,.60),rgba(5,12,21,.46));box-shadow:0 16px 38px rgba(0,0,0,.30),0 0 24px rgba(101,232,255,.07),inset 0 0 0 1px rgba(255,255,255,.038),inset 0 0 28px rgba(101,232,255,.035);backdrop-filter:blur(12px) saturate(126%);overflow:hidden}\n#agentCryptoOperatorDashboard406349 .od-math{left:16px;width:clamp(288px,23vw,370px);min-height:144px}\n#agentCryptoOperatorDashboard406349 .od-kill{right:16px;width:clamp(252px,20vw,315px);min-height:144px;border-color:rgba(255,113,125,.52);box-shadow:0 16px 38px rgba(0,0,0,.30),0 0 24px rgba(255,113,125,.075),inset 0 0 0 1px rgba(255,255,255,.03),inset 0 0 24px rgba(255,113,125,.025)}\n#agentCryptoOperatorDashboard406349 .od-normal{display:block}\n#agentCryptoOperatorDashboard406349 .od-head{display:flex;align-items:center;justify-content:space-between;gap:9px;padding:9px 11px 8px;border-bottom:1px solid rgba(255,255,255,.055)}\n#agentCryptoOperatorDashboard406349 .od-kicker{font-size:10px;font-weight:1000;letter-spacing:.15em;color:var(--cyan);white-space:nowrap}\n#agentCryptoOperatorDashboard406349 .od-kill .od-kicker{color:#ffc1c6}\n#agentCryptoOperatorDashboard406349 .od-round-controls{display:flex;gap:7px;align-items:center}\n#agentCryptoOperatorDashboard406349 .od-round{width:30px;height:30px;min-width:30px;padding:0;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.045);color:#e5f4f8;font:1000 15px/1 system-ui,sans-serif;cursor:pointer}\n#agentCryptoOperatorDashboard406349 .od-round:hover{background:rgba(255,255,255,.11);transform:translateY(-1px)}\n#agentCryptoOperatorDashboard406349 .od-round:focus-visible,#agentCryptoOperatorDashboard406349 .od-circle-face:focus-visible,#agentCryptoOperatorDashboard406349 .od-stop-circle:focus-visible,#agentCryptoOperatorDashboard406349 .od-recall:focus-visible{outline:2px solid rgba(101,232,255,.88);outline-offset:3px}\n#agentCryptoOperatorDashboard406349 .od-body{padding:10px 13px 12px}\n#agentCryptoOperatorDashboard406349 .od-score-row{display:flex;align-items:center;gap:12px}\n#agentCryptoOperatorDashboard406349 .od-score-orb{width:88px;height:88px;min-width:88px;border-radius:50%;display:grid;place-items:center;padding:10px;text-align:center;border:1px solid rgba(101,232,255,.64);background:radial-gradient(circle at 45% 28%,rgba(101,232,255,.24),rgba(3,14,23,.68) 67%);box-shadow:inset 0 0 30px rgba(101,232,255,.11),0 0 30px rgba(101,232,255,.12);font-size:22px;font-weight:1000;color:#7ef1ff;text-shadow:0 0 9px rgba(126,241,255,.95),0 0 22px rgba(101,232,255,.60)}\n#agentCryptoOperatorDashboard406349 .od-score-copy{min-width:0}\n#agentCryptoOperatorDashboard406349 .od-score-copy b{display:block;font-size:13px;color:#83f3ff;text-shadow:0 0 8px rgba(131,243,255,.72),0 0 16px rgba(101,232,255,.32)}\n#agentCryptoOperatorDashboard406349 .od-score-copy small{display:block;margin-top:6px;color:#8fa9b5;font-size:9px;line-height:1.42}\n#agentCryptoOperatorDashboard406349 .od-verdict{margin:10px 0 0;padding-top:9px;border-top:1px solid rgba(255,255,255,.055);font-size:10px;line-height:1.42;color:#bad0da}\n#agentCryptoOperatorDashboard406349 .od-kill-layout{display:grid;grid-template-columns:minmax(0,1fr) 94px;gap:11px;align-items:center}\n#agentCryptoOperatorDashboard406349 .od-kill-state{padding:9px;border:1px solid rgba(255,255,255,.075);border-radius:15px;background:rgba(255,255,255,.025)}\n#agentCryptoOperatorDashboard406349 .od-kill-state strong{display:block;font-size:17px;color:#f7fbfc}\n#agentCryptoOperatorDashboard406349[data-kill-state=\"stopped\"] .od-kill-state strong{color:#ff939d}\n#agentCryptoOperatorDashboard406349[data-kill-state=\"active\"] .od-kill-state strong{color:#ffe09a}\n#agentCryptoOperatorDashboard406349 .od-paper{display:inline-flex;margin-top:8px;padding:5px 8px;border-radius:999px;border:1px solid rgba(167,255,156,.25);color:#b8ffad;background:rgba(45,105,49,.12);font-size:8px;font-weight:950}\n#agentCryptoOperatorDashboard406349 .od-kill-detail{margin:8px 1px 0;font-size:9px;line-height:1.35;color:#92aab5}\n#agentCryptoOperatorDashboard406349 .od-stop-circle{width:90px;height:90px;border-radius:50%;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:2px solid rgba(255,113,125,.68);background:radial-gradient(circle at 50% 35%,rgba(183,46,61,.32),rgba(72,15,25,.58));color:#ffe4e6;cursor:pointer;box-shadow:0 0 30px rgba(255,64,82,.18),inset 0 0 26px rgba(255,115,126,.12)}\n#agentCryptoOperatorDashboard406349 .od-stop-circle span:first-child{font-size:9px;font-weight:1000;letter-spacing:.12em}\n#agentCryptoOperatorDashboard406349 .od-stop-circle span:last-child{font-size:20px;font-weight:1000;letter-spacing:.04em}\n#agentCryptoOperatorDashboard406349 .od-stop-circle:hover{transform:scale(1.025)}\n#agentCryptoOperatorDashboard406349 .od-stop-circle:disabled{opacity:.34;cursor:not-allowed;transform:none}\n#agentCryptoOperatorDashboard406349 .od-mini-face{display:none}\n#agentCryptoOperatorDashboard406349 .od-circle-face{width:106px;height:106px;border-radius:50%;padding:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(101,232,255,.48);background:radial-gradient(circle at 50% 28%,rgba(101,232,255,.16),rgba(3,14,23,.72) 68%);color:#eefdff;cursor:pointer;box-shadow:0 16px 40px rgba(0,0,0,.42),inset 0 0 24px rgba(101,232,255,.06)}\n#agentCryptoOperatorDashboard406349 .od-circle-face .mini-title{font-size:8px;font-weight:1000;letter-spacing:.13em;color:var(--cyan)}\n#agentCryptoOperatorDashboard406349 .od-circle-face .mini-score{font-size:20px;font-weight:1000;color:#65e8ff;text-shadow:0 0 14px rgba(101,232,255,.46)}\n#agentCryptoOperatorDashboard406349 .od-kill-mini-wrap{position:relative;width:118px;height:118px}\n#agentCryptoOperatorDashboard406349 .od-mini-kill-stop{position:absolute;inset:5px;width:108px;height:108px;border-radius:50%;padding:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;border:2px solid rgba(255,113,125,.68);background:radial-gradient(circle at 50% 32%,rgba(177,45,60,.34),rgba(61,13,23,.72) 70%);color:#ffe3e6;cursor:pointer;box-shadow:0 16px 40px rgba(0,0,0,.46),0 0 22px rgba(255,80,95,.08)}\n#agentCryptoOperatorDashboard406349 .od-mini-kill-stop .mini-title{font-size:8px;font-weight:1000;letter-spacing:.10em}\n#agentCryptoOperatorDashboard406349 .od-mini-kill-stop .mini-stop{font-size:21px;font-weight:1000}\n#agentCryptoOperatorDashboard406349 .od-mini-kill-stop:disabled{opacity:.34;cursor:not-allowed}\n#agentCryptoOperatorDashboard406349 .od-mini-open-round{position:absolute;left:-3px;top:-3px;z-index:3;width:30px;height:30px;border-radius:50%;padding:0;border:1px solid rgba(255,255,255,.20);background:rgba(7,20,30,.72);color:#e9f7fb;display:grid;place-items:center;font-size:15px;font-weight:1000;cursor:pointer}\n#agentCryptoOperatorDashboard406349 .od-recall{display:none;position:absolute;bottom:20px;pointer-events:auto;width:66px;height:66px;border-radius:50%;padding:7px;align-items:center;justify-content:center;text-align:center;border:1px solid rgba(101,232,255,.46);background:rgba(5,20,31,.72);color:#c8f6ff;box-shadow:0 14px 34px rgba(0,0,0,.44);font-size:8px;font-weight:1000;letter-spacing:.08em;line-height:1.14;cursor:pointer}\n#agentCryptoOperatorDashboard406349 .od-recall-math{left:18px}\n#agentCryptoOperatorDashboard406349 .od-recall-kill{right:18px;width:72px;height:72px;border-color:rgba(255,113,125,.52);color:#ffd0d4;background:rgba(28,9,15,.72)}\n#agentCryptoOperatorDashboard406349 .od-recall:hover{transform:scale(1.04)}\n#agentCryptoOperatorDashboard406349[data-math-mode=\"mini\"] .od-math{width:118px;height:118px;min-height:0;border:0;background:transparent;box-shadow:none;backdrop-filter:none;overflow:visible}\n#agentCryptoOperatorDashboard406349[data-math-mode=\"mini\"] .od-math .od-normal{display:none}\n#agentCryptoOperatorDashboard406349[data-math-mode=\"mini\"] .od-math .od-mini-face{display:block}\n#agentCryptoOperatorDashboard406349[data-math-mode=\"hidden\"] .od-math{display:none}\n#agentCryptoOperatorDashboard406349[data-math-mode=\"hidden\"] .od-recall-math{display:flex}\n#agentCryptoOperatorDashboard406349[data-kill-mode=\"mini\"] .od-kill{width:132px;height:132px;min-height:0;border:0;background:transparent;box-shadow:none;backdrop-filter:none;overflow:visible}\n#agentCryptoOperatorDashboard406349[data-kill-mode=\"mini\"] .od-kill .od-normal{display:none}\n#agentCryptoOperatorDashboard406349[data-kill-mode=\"mini\"] .od-kill .od-mini-face{display:block}\n#agentCryptoOperatorDashboard406349[data-kill-mode=\"hidden\"] .od-kill{display:none}\n#agentCryptoOperatorDashboard406349[data-kill-mode=\"hidden\"] .od-recall-kill{display:flex}\n@media(max-width:900px){#agentCryptoOperatorDashboard406349 .od-math{left:9px;width:min(44vw,360px)}#agentCryptoOperatorDashboard406349 .od-kill{right:9px;width:min(39vw,330px)}#agentCryptoOperatorDashboard406349 .od-recall-math{left:9px}#agentCryptoOperatorDashboard406349 .od-recall-kill{right:9px}}\n@media(max-width:620px){#agentCryptoOperatorDashboard406349 .od-math{left:8px;bottom:174px;width:calc(100vw - 16px)}#agentCryptoOperatorDashboard406349 .od-kill{right:8px;width:calc(100vw - 16px)}#agentCryptoOperatorDashboard406349[data-math-mode=\"mini\"] .od-math{left:8px;bottom:8px;width:108px;height:108px}#agentCryptoOperatorDashboard406349[data-math-mode=\"mini\"] .od-circle-face{width:108px;height:108px}#agentCryptoOperatorDashboard406349[data-kill-mode=\"mini\"] .od-kill{right:8px;bottom:8px;width:122px;height:122px}#agentCryptoOperatorDashboard406349[data-kill-mode=\"mini\"] .od-kill-mini-wrap{width:122px;height:122px}#agentCryptoOperatorDashboard406349[data-kill-mode=\"mini\"] .od-mini-kill-stop{width:112px;height:112px}#agentCryptoOperatorDashboard406349 .od-recall{bottom:8px}}\n/* 40.6.349 docked edge choreography */\n#agentCryptoOperatorDashboard406349 .od-wing,\n#agentCryptoOperatorDashboard406349 .od-recall{transition:transform .24s ease,opacity .24s ease,filter .24s ease}\n#agentCryptoOperatorDashboard406349 .od-head{min-height:58px;padding:11px 14px;align-items:center}\n#agentCryptoOperatorDashboard406349 .od-round-controls{display:grid;grid-auto-flow:column;grid-auto-columns:36px;gap:8px;align-items:center;justify-content:end;height:36px}\n#agentCryptoOperatorDashboard406349 .od-round{box-sizing:border-box;width:36px;height:36px;min-width:36px;min-height:36px;max-width:36px;max-height:36px;padding:0;margin:0;border-radius:50%;display:flex;align-items:center;justify-content:center;line-height:1;font-size:17px;transform:none}\n#agentCryptoOperatorDashboard406349 .od-round:hover{transform:scale(1.05)}\n#agentCryptoOperatorDashboard406349[data-math-mode=\"mini\"] .od-math{left:-24px;bottom:-26px;width:118px;height:118px}\n#agentCryptoOperatorDashboard406349[data-kill-mode=\"mini\"] .od-kill{right:-26px;bottom:-28px;width:132px;height:132px}\n#agentCryptoOperatorDashboard406349[data-math-mode=\"mini\"] .od-math:hover{transform:translate(12px,-12px)}\n#agentCryptoOperatorDashboard406349[data-kill-mode=\"mini\"] .od-kill:hover{transform:translate(-12px,-12px)}\n#agentCryptoOperatorDashboard406349[data-math-mode=\"hidden\"] .od-math,\n#agentCryptoOperatorDashboard406349[data-kill-mode=\"hidden\"] .od-kill{display:none}\n#agentCryptoOperatorDashboard406349 .od-recall{display:none;bottom:-30px;width:86px;height:86px;border-radius:50%;opacity:.95}\n#agentCryptoOperatorDashboard406349 .od-recall-math{left:-38px}\n#agentCryptoOperatorDashboard406349 .od-recall-kill{right:-40px;width:92px;height:92px}\n#agentCryptoOperatorDashboard406349[data-math-mode=\"hidden\"] .od-recall-math,\n#agentCryptoOperatorDashboard406349[data-kill-mode=\"hidden\"] .od-recall-kill{display:flex}\n#agentCryptoOperatorDashboard406349 .od-recall-math:hover{transform:translate(18px,-14px) scale(1.03)}\n#agentCryptoOperatorDashboard406349 .od-recall-kill:hover{transform:translate(-18px,-14px) scale(1.03)}\n#agentCryptoOperatorDashboard406349 .od-stop-circle span:first-child{font-size:12px;font-weight:1000;letter-spacing:.10em}\n#agentCryptoOperatorDashboard406349 .od-stop-circle span:last-child{font-size:18px;font-weight:1000;letter-spacing:.10em}\n#agentCryptoOperatorDashboard406349 .od-mini-kill-stop .mini-title{font-size:10px;letter-spacing:.10em}\n#agentCryptoOperatorDashboard406349 .od-mini-kill-stop .mini-stop{font-size:18px;letter-spacing:.10em}\n@media(max-width:620px){\n#agentCryptoOperatorDashboard406349[data-math-mode=\"mini\"] .od-math{left:-20px;bottom:-22px}\n#agentCryptoOperatorDashboard406349[data-kill-mode=\"mini\"] .od-kill{right:-22px;bottom:-24px}\n#agentCryptoOperatorDashboard406349 .od-recall{bottom:-24px}\n#agentCryptoOperatorDashboard406349 .od-recall-math{left:-34px}\n#agentCryptoOperatorDashboard406349 .od-recall-kill{right:-36px}\n}\n";
    style.textContent += "\n/* 40.6.349 glass compact overrides */\n#agentCryptoOperatorDashboard406349 .od-head{min-height:50px;padding:9px 12px;align-items:center}\n#agentCryptoOperatorDashboard406349 .od-round-controls{display:grid;grid-auto-flow:column;grid-auto-columns:30px;gap:7px;align-items:center;justify-content:end;height:30px}\n#agentCryptoOperatorDashboard406349 .od-round{box-sizing:border-box;width:30px;height:30px;min-width:30px;min-height:30px;max-width:30px;max-height:30px;padding:0;margin:0;border-radius:50%;display:flex;align-items:center;justify-content:center;line-height:1;font-size:15px;transform:none}\n#agentCryptoOperatorDashboard406349[data-math-mode=\"mini\"] .od-math{left:-22px;bottom:-23px;width:106px;height:106px}\n#agentCryptoOperatorDashboard406349[data-kill-mode=\"mini\"] .od-kill{right:-24px;bottom:-25px;width:118px;height:118px}\n#agentCryptoOperatorDashboard406349 .od-recall{bottom:-26px;width:76px;height:76px;background:rgba(5,20,31,.72)}\n#agentCryptoOperatorDashboard406349 .od-recall-math{left:-34px}\n#agentCryptoOperatorDashboard406349 .od-recall-kill{right:-36px;width:82px;height:82px;background:rgba(28,9,15,.72)}\n#agentCryptoOperatorDashboard406349 .od-stop-circle span:first-child{font-size:10px}\n#agentCryptoOperatorDashboard406349 .od-stop-circle span:last-child{font-size:16px}\n#agentCryptoOperatorDashboard406349 .od-mini-kill-stop .mini-title{font-size:9px}\n#agentCryptoOperatorDashboard406349 .od-mini-kill-stop .mini-stop{font-size:16px}\n@media(max-width:620px){#agentCryptoOperatorDashboard406349[data-math-mode=\"mini\"] .od-math{left:-18px;bottom:-20px;width:98px;height:98px}#agentCryptoOperatorDashboard406349[data-math-mode=\"mini\"] .od-circle-face{width:98px;height:98px}#agentCryptoOperatorDashboard406349[data-kill-mode=\"mini\"] .od-kill{right:-20px;bottom:-22px;width:108px;height:108px}#agentCryptoOperatorDashboard406349[data-kill-mode=\"mini\"] .od-kill-mini-wrap{width:108px;height:108px}#agentCryptoOperatorDashboard406349[data-kill-mode=\"mini\"] .od-mini-kill-stop{width:98px;height:98px}}\n";
    style.textContent += "\n/* 40.6.349 LIGHTER GLASS + CLEAN MATH */\n\n#agentCryptoOperatorDashboard406349 .od-math .od-head,\n#agentCryptoOperatorDashboard406349 .od-kill .od-head{min-height:50px;height:50px;padding:9px 12px;align-items:center}\n#agentCryptoOperatorDashboard406349 .od-round-controls{align-self:center;height:30px}\n#agentCryptoOperatorDashboard406349 .od-math .od-body{padding-bottom:11px}\n#agentCryptoOperatorDashboard406349 .od-math{border-color:rgba(101,232,255,.48)}\n#agentCryptoOperatorDashboard406349 .od-kill .od-kicker{color:#ffd0d4;text-shadow:0 0 10px rgba(255,113,125,.45)}\n";
    document.head.appendChild(style);
  }

  function mount(){
    if(byId(ROOT_ID)){state.mounted=true;scheduleRender();return true;}
    ensureStyle();
    const root=document.createElement("div");
    root.id=ROOT_ID;root.dataset.mathMode=state.mathMode;root.dataset.killMode=state.killMode;root.dataset.killState="idle";
    root.setAttribute("aria-label","Tableau de bord opérateur Math Core et Kill Switch");
    root.innerHTML="\n<section class=\"od-wing od-math\" aria-label=\"Math Core synthétique\">\n  <div class=\"od-normal\">\n    <div class=\"od-head\">\n      <span class=\"od-kicker\">MATH CORE</span>\n      <div class=\"od-round-controls\">\n        <button type=\"button\" class=\"od-round\" data-dashboard-wing=\"math\" data-dashboard-mode=\"mini\" title=\"Minimiser Math Core\" aria-label=\"Minimiser Math Core\">−</button>\n        <button type=\"button\" class=\"od-round\" data-dashboard-wing=\"math\" data-dashboard-mode=\"hidden\" title=\"Masquer Math Core\" aria-label=\"Masquer Math Core\">×</button>\n      </div>\n    </div>\n    <div class=\"od-body\">\n      <div class=\"od-score-row\">\n        <div class=\"od-score-orb\" id=\"acOperatorMathScore406349\">—</div>\n        <div class=\"od-score-copy\">\n          <b id=\"acOperatorMathLabel406349\">En attente</b>\n          <small id=\"acOperatorMathContext406349\">Contexte Market : en attente</small>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"od-mini-face\">\n    <button type=\"button\" class=\"od-circle-face\" data-dashboard-wing=\"math\" data-dashboard-mode=\"normal\" title=\"Ouvrir Math Core\" aria-label=\"Ouvrir Math Core\">\n      <span class=\"mini-title\">MATH CORE</span>\n      <span class=\"mini-score\" id=\"acOperatorMathMiniScore406349\">—</span>\n    </button>\n  </div>\n</section>\n\n<section class=\"od-wing od-kill\" aria-label=\"Kill Switch opérateur\">\n  <div class=\"od-normal\">\n    <div class=\"od-head\">\n      <span class=\"od-kicker\">KILL SWITCH</span>\n      <div class=\"od-round-controls\">\n        <button type=\"button\" class=\"od-round\" data-dashboard-wing=\"kill\" data-dashboard-mode=\"mini\" title=\"Minimiser Kill Switch\" aria-label=\"Minimiser Kill Switch\">−</button>\n        <button type=\"button\" class=\"od-round\" data-dashboard-wing=\"kill\" data-dashboard-mode=\"hidden\" title=\"Masquer Kill Switch\" aria-label=\"Masquer Kill Switch\">×</button>\n      </div>\n    </div>\n    <div class=\"od-body\">\n      <div class=\"od-kill-layout\">\n        <div>\n          <div class=\"od-kill-state\">\n            <strong id=\"acOperatorKillState406349\">PRÊT</strong>\n            <span class=\"od-paper\" id=\"acOperatorPaperOnly406349\">PAPER ONLY</span>\n          </div>\n          <div class=\"od-kill-detail\" id=\"acOperatorKillDetail406349\">Auto A Paper · lecture et monitoring préservés.</div>\n        </div>\n        <button type=\"button\" class=\"od-stop-circle\" data-ac-kill-stop aria-label=\"KILL SWITCH\">\n          <span>KILL</span><span>SWITCH</span>\n        </button>\n      </div>\n    </div>\n  </div>\n  <div class=\"od-mini-face\">\n    <div class=\"od-kill-mini-wrap\">\n      <button type=\"button\" class=\"od-mini-open-round\" data-dashboard-wing=\"kill\" data-dashboard-mode=\"normal\" title=\"Ouvrir Kill Switch\" aria-label=\"Ouvrir Kill Switch\">↗</button>\n      <button type=\"button\" class=\"od-mini-kill-stop\" data-ac-kill-stop aria-label=\"KILL SWITCH\">\n        <span class=\"mini-title\">KILL</span><span class=\"mini-stop\">SWITCH</span>\n      </button>\n    </div>\n  </div>\n</section>\n\n<button type=\"button\" class=\"od-recall od-recall-math\" data-dashboard-wing=\"math\" data-dashboard-mode=\"normal\" aria-label=\"Rappeler Math Core\">MATH<br>CORE</button>\n<button type=\"button\" class=\"od-recall od-recall-kill\" data-dashboard-wing=\"kill\" data-dashboard-mode=\"normal\" aria-label=\"Rappeler Kill Switch\">KILL<br>SWITCH</button>\n";
    document.body.appendChild(root);
    root.querySelectorAll("[data-dashboard-wing][data-dashboard-mode]").forEach(button=>{
      button.addEventListener("click",()=>setWingMode(button.dataset.dashboardWing,button.dataset.dashboardMode));
    });
    root.querySelectorAll("[data-ac-kill-stop]").forEach(button=>button.addEventListener("click",operatorStop));
    state.mounted=true;render();return true;
  }

  function bind(){
    if(state.bound)return;state.bound=true;
    ["agent-crypto:market-series-updated","agentcrypto:current-finalized","agent-crypto:current-finalized","agent-crypto:evidence-data-changed","agent-crypto:evidence-refresh-complete","agent-crypto:runtime-modules-ready","agent-crypto:postboot-runtime-ready","erith:system-hydrated","pageshow"].forEach(name=>window.addEventListener(name,scheduleRender,{passive:true}));
    document.addEventListener("visibilitychange",()=>{if(!document.hidden)scheduleRender();},{passive:true});
  }

  function start(){mount();bind();scheduleRender();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();

  globalThis.AgentCryptoOperatorDashboard406349=Object.freeze({
    build:BUILD,mount,render:scheduleRender,
    set_math_mode:mode=>setWingMode("math",mode),
    set_kill_mode:mode=>setWingMode("kill",mode),
    show_all:()=>{setWingMode("math","normal");setWingMode("kill","normal");return true;},
    stop:operatorStop,
    snapshot:()=>Object.freeze({build:BUILD,math_mode:state.mathMode,kill_mode:state.killMode,mounted:state.mounted,math:mathSnapshot(),kill:stopState(),last_stop:state.last_stop,error:state.last_error}),
    math_source:"CANONICAL_MATH_DOM",
    kill_owner:"strategyAAutoStop / existing STOP controls",
    kill_scope:"AUTO_A_PAPER_SCHEDULER_ONLY",
    independent_wings:true,round_controls:true,hidden_recall_per_wing:true,docked_three_quarter:true,kill_visible_label:"KILL SWITCH",
    paper_position_preserved:true,reading_preserved:true,paper_only:true,real_orders:false,wallet:false,
    storage_owner:false,network:false,recurring_timer:false,mutation_observer:false
  });
})();