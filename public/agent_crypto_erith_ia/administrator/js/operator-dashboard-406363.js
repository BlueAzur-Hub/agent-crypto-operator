/* Agent-Crypto Administrator — 40.6.363
   OPERATOR DASHBOARD · REDIVIDER CONFIRMATION MODAL
   Math/REDIVIDER cockpit presentation is frozen from 40.6.362; browser confirmation is replaced by an in-cockpit REDIVIDER confirmation instrument with native confirm only as fallback. */
(()=>{
  "use strict";
  if(globalThis.AgentCryptoOperatorDashboard406363)return;

  const BUILD="40.6.363";
  const ROOT_ID="agentCryptoOperatorDashboard406363";
  const STYLE_ID="agentCryptoOperatorDashboardStyle406363";
  const MANUAL_STOP_KEY="agent_crypto_strategy_a_auto_manual_stop_v1";
  const MATH_BOOT_PROBE_MAX=30;
  const MATH_BOOT_PROBE_MS=500;
  const state={
    mathMode:"mini",
    killMode:"mini",
    mounted:false,
    bound:false,
    stop_pending:false,
    confirm_open:false,
    confirm_return_focus:null,
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
      return {kind:"function",run:()=>globalThis.strategyAAutoStop("KILL SWITCH · arrêt opérateur depuis le tableau de bord 40.6.363.")};
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

  function scoreNumberOf(math){
    if(Number.isFinite(math.score))return String(Math.round(math.score));
    if(!math.raw||math.raw==="—")return "—";
    const n=numberFrom(math.raw);
    return Number.isFinite(n)?String(Math.round(n)):"—";
  }

  function setWingMode(wing,mode){
    if(!["math","kill"].includes(wing)||!["normal","mini","hidden"].includes(mode))return false;
    if(wing==="math")state.mathMode=mode;
    else state.killMode=mode;
    render();
    emit("DASHBOARD_"+wing.toUpperCase()+"_"+mode.toUpperCase());
    return true;
  }

  function executeOperatorStop(owner=stopOwner()){
    if(!owner){
      state.last_error="STOP_OWNER_NOT_RESIDENT";
      state.confirm_open=false;
      render();
      return false;
    }
    state.confirm_open=false;
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

  function legacyConfirmFallback(owner){
    const ok=window.confirm(
      "REDIVIDER · KILL SWITCH\n\nCouper le scheduler Auto A Paper ?\n"+
      "Une position Paper éventuelle reste intacte et surveillable.\n"+
      "L’interface, Math Core, Oracle, Atlas et le graphique restent lisibles.\n"+
      "Aucun ordre réel, wallet ou suppression n’est déclenché."
    );
    return ok?executeOperatorStop(owner):false;
  }

  function closeStopConfirm(reason="CANCEL"){
    if(!state.confirm_open)return false;
    state.confirm_open=false;
    render();
    emit("CONFIRM_"+String(reason).toUpperCase(),{paper_only:true,real_orders:false});
    const target=state.confirm_return_focus;
    state.confirm_return_focus=null;
    if(target&&typeof target.focus==="function"){
      requestAnimationFrame(()=>{try{target.focus({preventScroll:true});}catch(_){try{target.focus();}catch(__){}}});
    }
    return true;
  }

  function openStopConfirm(trigger=null){
    const owner=stopOwner();
    if(!owner){
      state.last_error="STOP_OWNER_NOT_RESIDENT";
      render();
      return false;
    }
    const overlay=byId("acOperatorRedividerConfirm406363");
    if(!overlay)return legacyConfirmFallback(owner);
    state.confirm_return_focus=trigger instanceof HTMLElement?trigger:null;
    state.confirm_open=true;
    state.last_error=null;
    render();
    emit("CONFIRM_OPEN",{paper_only:true,real_orders:false});
    requestAnimationFrame(()=>{
      const cancel=byId("acOperatorRedividerCancel406363");
      if(cancel&&typeof cancel.focus==="function")cancel.focus({preventScroll:true});
    });
    return true;
  }

  function confirmOperatorStop(){
    const owner=stopOwner();
    if(!owner){
      state.last_error="STOP_OWNER_NOT_RESIDENT";
      state.confirm_open=false;
      render();
      return false;
    }
    emit("CONFIRM_ACCEPT",{owner:owner.kind,owner_id:owner.id||null,paper_only:true,real_orders:false});
    state.confirm_return_focus=null;
    return executeOperatorStop(owner);
  }

  function operatorStop(trigger=null){
    return openStopConfirm(trigger);
  }

  function ensureStyle(){
    if(byId(STYLE_ID))return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
#${ROOT_ID}{
  position:fixed;inset:0;z-index:2147482400;pointer-events:none;
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --cyan:#37dde2;--cyan-hot:#8ef5f2;--crimson:#9f1d2b;--crimson-hot:#c6303d;--crimson-deep:#5d1019;--gold:#d9bf7b;
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
  left:16px;width:clamp(292px,23vw,372px);
}
#${ROOT_ID}[data-kill-mode="normal"] .kill-wing{
  right:16px;width:clamp(292px,23vw,372px);
}
#${ROOT_ID} .panel{
  position:relative;overflow:hidden;border-radius:21px;
  border:1px solid rgba(135,180,190,.25);
  background:linear-gradient(145deg,rgba(9,14,19,.32),rgba(5,8,12,.23));
  backdrop-filter:blur(11px) saturate(108%);
  box-shadow:0 14px 30px rgba(0,0,0,.27),inset 0 0 0 1px rgba(255,255,255,.018);
}
#${ROOT_ID} .kill-wing .panel{
  border-color:rgba(133,37,49,.34);
  background:linear-gradient(145deg,rgba(15,10,12,.34),rgba(6,7,10,.25));
  box-shadow:0 14px 30px rgba(0,0,0,.31),inset 0 0 0 1px rgba(255,255,255,.014);
}
#${ROOT_ID} .panel:before{
  content:"";position:absolute;left:15px;top:0;width:48%;height:1px;
  background:linear-gradient(90deg,rgba(115,217,232,.72),rgba(217,191,123,.34),transparent);
  filter:drop-shadow(0 0 3px rgba(115,217,232,.28));
}
#${ROOT_ID} .kill-wing .panel:before{
  left:auto;right:15px;
  background:linear-gradient(270deg,rgba(159,29,43,.82),rgba(93,16,25,.48),transparent);
  filter:drop-shadow(0 0 3px rgba(159,29,43,.24));
}
#${ROOT_ID} .head{
  height:46px;display:flex;align-items:center;justify-content:space-between;
  padding:8px 11px;border-bottom:1px solid rgba(255,255,255,.055);
}
#${ROOT_ID} .kicker{
  font-size:10px;font-weight:1000;letter-spacing:.15em;color:#b9e7eb;
  text-shadow:0 0 3px rgba(115,217,232,.24);
}
#${ROOT_ID} .kill-wing .kicker{
  color:#d8d4cf;text-shadow:0 0 3px rgba(159,29,43,.22);
}
#${ROOT_ID} .controls{display:flex;gap:6px;align-items:center}
#${ROOT_ID} .ctrl{
  width:28px;height:28px;padding:0;border-radius:50%;display:grid;place-items:center;
  border:1px solid rgba(255,217,120,.22);background:rgba(255,255,255,.035);
  color:#e9f7fb;font-size:14px;font-weight:900;cursor:pointer;
}
#${ROOT_ID} .ctrl:hover{transform:scale(1.05)}
#${ROOT_ID} .body{padding:10px 11px 11px}

/* MATH OPEN — balanced Atlas Math Core V3 instrument */
#${ROOT_ID} .math-stage{
  min-height:148px;display:grid;grid-template-rows:1fr auto;gap:8px;place-items:center;position:relative;
}
#${ROOT_ID} .math-hud{
  width:100%;display:grid;grid-template-columns:minmax(56px,1fr) 108px minmax(56px,1fr);
  align-items:center;gap:7px;position:relative;
}
#${ROOT_ID} .math-balance-rail{
  height:30px;position:relative;overflow:hidden;opacity:.82;
}
#${ROOT_ID} .math-balance-rail:before{
  content:"";position:absolute;left:0;right:0;top:50%;height:1px;transform:translateY(-50%);
  background:linear-gradient(90deg,transparent,rgba(43,146,152,.30) 12%,rgba(55,221,226,.70) 48%,rgba(43,146,152,.30) 88%,transparent);
  box-shadow:0 0 4px rgba(55,221,226,.14);
}
#${ROOT_ID} .math-balance-rail:after{
  content:"";position:absolute;left:10px;right:10px;top:9px;height:12px;
  border-top:1px solid rgba(55,221,226,.18);border-bottom:1px solid rgba(55,221,226,.12);
  background:repeating-linear-gradient(90deg,transparent 0 8px,rgba(55,221,226,.14) 8px 10px,transparent 10px 16px);
  clip-path:polygon(0 38%,90% 38%,100% 50%,90% 62%,0 62%);
}
#${ROOT_ID} .math-balance-rail.right:after{transform:scaleX(-1)}
#${ROOT_ID} .math-balance-rail .rail-mark{
  position:absolute;top:50%;width:6px;height:6px;transform:translateY(-50%) rotate(45deg);
  border:1px solid rgba(78,229,232,.44);background:rgba(5,38,42,.72);
}
#${ROOT_ID} .math-balance-rail.left .rail-mark{right:2px}
#${ROOT_ID} .math-balance-rail.right .rail-mark{left:2px}
#${ROOT_ID} .math-ring,
#${ROOT_ID} .math-mini-ring{
  display:grid;place-items:center;border:0;padding:8px;border-radius:50%;
  background:conic-gradient(from -90deg,
    rgba(55,221,226,.98) calc(var(--math-score) * 1%),
    rgba(80,108,114,.28) 0 100%);
  box-shadow:0 0 0 1px rgba(55,221,226,.10),0 0 10px rgba(55,221,226,.18);
}
#${ROOT_ID} .math-ring{width:108px;height:108px;position:relative;z-index:2}
#${ROOT_ID} .ring-core,
#${ROOT_ID} .mini-math-core{
  width:100%;height:100%;border-radius:50%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  background:radial-gradient(circle at 45% 30%,rgba(38,81,87,.15),rgba(6,17,22,.96) 68%,rgba(3,8,12,.99));
  border:1px solid rgba(111,182,187,.20);
  box-shadow:inset 0 0 16px rgba(0,0,0,.45);
}
#${ROOT_ID} .math-ring .value{
  color:#4ee5e8;font-size:27px;line-height:1;font-weight:1000;
  text-shadow:0 0 5px rgba(55,221,226,.28);
}
#${ROOT_ID} .ring-label,
#${ROOT_ID} .mini-math-label{
  max-width:72px;color:#66e8e8;font-size:6.5px;font-weight:900;line-height:1.05;text-align:center;
  text-shadow:0 0 3px rgba(55,221,226,.18);
}
#${ROOT_ID} .math-status{
  display:flex;align-items:center;justify-content:center;gap:7px;min-height:18px;
  max-width:100%;padding:0 8px;color:#76bfc4;font-size:7px;font-weight:900;letter-spacing:.08em;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;
}
#${ROOT_ID} .math-status:before,
#${ROOT_ID} .math-status:after{
  content:"";flex:0 0 22px;height:1px;background:linear-gradient(90deg,transparent,rgba(55,221,226,.42));
}
#${ROOT_ID} .math-status:after{transform:scaleX(-1)}

/* REDIVIDER — circular safety core + deployable normal-mode wings */
#${ROOT_ID} .redivider-stage{
  min-height:148px;display:grid;grid-template-rows:1fr auto;gap:8px;place-items:center;position:relative;
}
#${ROOT_ID} .redivider-hud{
  width:100%;display:grid;grid-template-columns:minmax(56px,1fr) 108px minmax(56px,1fr);
  align-items:center;gap:7px;position:relative;
}
#${ROOT_ID} .redivider-rail{
  height:34px;position:relative;overflow:hidden;opacity:.92;
}
#${ROOT_ID} .redivider-rail:before{
  content:"";position:absolute;left:0;right:0;top:50%;height:2px;transform:translateY(-50%);
  background:linear-gradient(90deg,transparent,rgba(111,18,31,.58) 12%,rgba(174,30,45,.86) 46%,rgba(111,18,31,.58) 88%,transparent);
  box-shadow:0 0 5px rgba(130,13,29,.22);
}
#${ROOT_ID} .redivider-rail:after{
  content:"";position:absolute;left:7px;right:7px;top:8px;height:18px;
  border-top:1px solid rgba(144,25,38,.42);border-bottom:1px solid rgba(144,25,38,.32);
  background:repeating-linear-gradient(90deg,rgba(157,28,43,.00) 0 7px,rgba(157,28,43,.30) 7px 11px,rgba(157,28,43,.00) 11px 17px);
  clip-path:polygon(0 32%,88% 32%,100% 50%,88% 68%,0 68%);
}
#${ROOT_ID} .redivider-rail.right:after{transform:scaleX(-1)}
#${ROOT_ID} .redivider-rail .rail-mark{
  position:absolute;top:50%;width:7px;height:7px;transform:translateY(-50%) rotate(45deg);
  border:1px solid rgba(188,42,56,.66);background:rgba(67,11,19,.66);
  box-shadow:0 0 5px rgba(145,16,31,.20);
}
#${ROOT_ID} .redivider-rail.left .rail-mark{right:2px}
#${ROOT_ID} .redivider-rail.right .rail-mark{left:2px}
#${ROOT_ID} .redivider-status{
  display:flex;align-items:center;justify-content:center;gap:7px;min-height:18px;
  color:#a46a70;font-size:7px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;
}
#${ROOT_ID} .redivider-status:before,
#${ROOT_ID} .redivider-status:after{
  content:"";width:22px;height:1px;background:linear-gradient(90deg,transparent,rgba(155,29,43,.54));
}
#${ROOT_ID} .redivider-status:after{transform:scaleX(-1)}
#${ROOT_ID}[data-kill-state="active"] .redivider-status{color:#bd7a80}
#${ROOT_ID}[data-kill-state="stopped"] .redivider-status{color:#73545a}

#${ROOT_ID} .kill-ring,
#${ROOT_ID} .kill-mini-ring{
  display:grid;place-items:center;border:0;padding:8px;border-radius:50%;cursor:pointer;
  background:conic-gradient(from -90deg,
    rgba(167,31,45,.96) 0 86%,
    rgba(85,47,51,.25) 86% 100%);
  box-shadow:0 0 0 1px rgba(159,29,43,.13),0 0 12px rgba(135,12,29,.20);
  transform-origin:center;transition:transform .14s ease,filter .14s ease,box-shadow .18s ease;
}
#${ROOT_ID} .kill-ring{width:108px;height:108px;position:relative;z-index:2}
#${ROOT_ID} .kill-ring:active,#${ROOT_ID} .kill-mini-ring:active{transform:scale(1.10);filter:brightness(1.10)}
#${ROOT_ID} .redivider-core{
  width:100%;height:100%;border-radius:50%;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:7px;
  background:radial-gradient(circle at 50% 42%,rgba(112,13,25,.16),rgba(13,10,13,.96) 62%,rgba(5,6,8,.99));
  border:1px solid rgba(132,44,53,.28);
  box-shadow:inset 0 0 18px rgba(0,0,0,.56);
}
#${ROOT_ID} .redivider-brand{
  color:#d7d3ce;font-size:8px;font-weight:900;letter-spacing:.17em;line-height:1;
  text-shadow:0 0 3px rgba(255,255,255,.08);
}
#${ROOT_ID} .redivider-glyphs{
  display:flex;align-items:center;gap:8px;color:#8f2732;font-size:11px;line-height:1;
  text-shadow:0 0 5px rgba(126,12,29,.30);
}
#${ROOT_ID} .redivider-glyphs b{
  color:#bc2b38;font-size:17px;font-weight:700;text-shadow:0 0 7px rgba(150,14,31,.38);
}
#${ROOT_ID}[data-kill-state="stopped"] .kill-ring,
#${ROOT_ID}[data-kill-state="stopped"] .kill-mini-ring{
  filter:saturate(.62) brightness(.72);box-shadow:0 0 0 1px rgba(117,30,39,.10);
}
#${ROOT_ID} .sr-only{
  position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;
  overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important;
}

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
#${ROOT_ID} .mini-score{
  color:#4ee5e8;font-size:23px;line-height:1;font-weight:1000;
  text-shadow:0 0 5px rgba(55,221,226,.28);
}
#${ROOT_ID} .mini-open{
  position:absolute;z-index:3;top:3px;left:3px;width:27px;height:27px;padding:0;border-radius:50%;
  display:grid;place-items:center;border:1px solid rgba(130,72,77,.28);
  background:rgba(8,11,15,.90);color:#b8b5b1;font-size:13px;font-weight:1000;cursor:pointer;
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
  left:-8px;color:#87e8e7;border:1px solid rgba(55,221,226,.36);
}
#${ROOT_ID} .kill-recall{
  right:-8px;color:#b83b46;border:1px solid rgba(159,29,43,.42);background:rgba(13,8,11,.88);
}

/* REDIVIDER CONFIRMATION — native cockpit safety dialog */
#${ROOT_ID} .redivider-confirm-overlay{
  display:none;position:fixed;inset:0;z-index:40;pointer-events:auto;
  place-items:center;padding:24px;background:rgba(1,4,7,.72);
  backdrop-filter:blur(5px) saturate(78%);
}
#${ROOT_ID}[data-confirm-open="true"] .redivider-confirm-overlay{display:grid}
#${ROOT_ID} .redivider-confirm-modal{
  width:min(620px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;
  position:relative;border-radius:28px;padding:22px 24px 20px;color:#eee8e4;
  border:1px solid rgba(151,35,49,.52);
  background:radial-gradient(circle at 50% 29%,rgba(100,12,24,.18),transparent 34%),linear-gradient(160deg,rgba(12,10,13,.98),rgba(4,6,9,.98));
  box-shadow:0 28px 80px rgba(0,0,0,.70),0 0 0 1px rgba(255,255,255,.015),0 0 44px rgba(121,10,26,.12);
}
#${ROOT_ID} .redivider-confirm-modal:before{
  content:"";position:absolute;left:8%;right:8%;top:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(177,31,46,.70),rgba(99,15,27,.35),transparent);
}
#${ROOT_ID} .confirm-eyebrow{text-align:center;color:#b6aca9;font-size:9px;font-weight:1000;letter-spacing:.24em;text-transform:uppercase}
#${ROOT_ID} .confirm-title{margin:6px 0 2px;text-align:center;color:#e9e4df;font-size:18px;font-weight:1000;letter-spacing:.15em}
#${ROOT_ID} .confirm-subtitle{margin:0;text-align:center;color:#9d777b;font-size:9px;font-weight:900;letter-spacing:.10em;text-transform:uppercase}
#${ROOT_ID} .confirm-hud{margin:18px auto 14px;width:min(100%,530px);display:grid;grid-template-columns:minmax(68px,1fr) 156px minmax(68px,1fr);align-items:center;gap:9px}
#${ROOT_ID} .confirm-rail{height:48px;position:relative;overflow:hidden}
#${ROOT_ID} .confirm-rail:before{
  content:"";position:absolute;left:0;right:0;top:50%;height:2px;transform:translateY(-50%);
  background:linear-gradient(90deg,transparent,rgba(103,14,27,.66) 10%,rgba(183,30,46,.94) 46%,rgba(103,14,27,.66) 90%,transparent);
  box-shadow:0 0 8px rgba(144,12,30,.24);
}
#${ROOT_ID} .confirm-rail:after{
  content:"";position:absolute;left:7px;right:7px;top:11px;height:26px;
  border-top:1px solid rgba(164,26,41,.42);border-bottom:1px solid rgba(164,26,41,.28);
  background:repeating-linear-gradient(90deg,transparent 0 8px,rgba(168,29,44,.29) 8px 13px,transparent 13px 20px);
  clip-path:polygon(0 32%,90% 32%,100% 50%,90% 68%,0 68%);
}
#${ROOT_ID} .confirm-rail.right:after{transform:scaleX(-1)}
#${ROOT_ID} .confirm-ring{
  width:156px;height:156px;border-radius:50%;padding:11px;display:grid;place-items:center;
  background:conic-gradient(from -90deg,rgba(176,30,46,.98) 0 88%,rgba(76,28,35,.34) 88% 100%);
  box-shadow:0 0 0 1px rgba(177,31,46,.16),0 0 24px rgba(138,12,30,.24);
}
#${ROOT_ID} .confirm-core{
  width:100%;height:100%;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
  background:radial-gradient(circle at 50% 42%,rgba(116,13,26,.22),rgba(13,9,12,.97) 62%,rgba(4,5,7,.995));
  border:1px solid rgba(142,41,52,.34);box-shadow:inset 0 0 28px rgba(0,0,0,.62);
}
#${ROOT_ID} .confirm-core strong{color:#e5dfdb;font-size:11px;letter-spacing:.21em}
#${ROOT_ID} .confirm-glyphs{display:flex;gap:11px;align-items:center;color:#8c2631;font-size:13px;text-shadow:0 0 5px rgba(126,12,29,.32)}
#${ROOT_ID} .confirm-glyphs b{color:#c32d3b;font-size:22px;text-shadow:0 0 9px rgba(155,13,31,.40)}
#${ROOT_ID} .confirm-question{margin:0 auto 12px;text-align:center;color:#f1ece8;font-size:15px;font-weight:900}
#${ROOT_ID} .confirm-safety{
  margin:0 auto;padding:12px 16px;max-width:500px;border-radius:14px;
  border:1px solid rgba(149,39,51,.20);background:rgba(255,255,255,.018);
  color:#bdb4b0;font-size:11px;line-height:1.55;
}
#${ROOT_ID} .confirm-safety span{display:block}
#${ROOT_ID} .confirm-state{margin-top:12px;text-align:center;color:#aa6d73;font-size:8px;font-weight:1000;letter-spacing:.14em;text-transform:uppercase}
#${ROOT_ID} .confirm-actions{display:flex;justify-content:center;gap:12px;margin-top:18px}
#${ROOT_ID} .confirm-action{min-width:128px;height:39px;border-radius:999px;padding:0 18px;cursor:pointer;font-size:10px;font-weight:1000;letter-spacing:.10em}
#${ROOT_ID} .confirm-action.cancel{color:#d7d0cc;border:1px solid rgba(193,186,180,.20);background:rgba(255,255,255,.045)}
#${ROOT_ID} .confirm-action.confirm{
  color:#f2dddd;border:1px solid rgba(189,43,57,.58);
  background:linear-gradient(180deg,rgba(124,20,33,.86),rgba(72,11,22,.92));
  box-shadow:0 0 12px rgba(135,13,30,.12);
}
#${ROOT_ID} .confirm-action:hover{filter:brightness(1.08)}
#${ROOT_ID} .confirm-action:focus-visible{outline:2px solid rgba(225,190,194,.72);outline-offset:3px}
#${ROOT_ID} .confirm-action:disabled{opacity:.42;cursor:wait}
@media(max-width:620px){
  #${ROOT_ID} .redivider-confirm-overlay{padding:10px}
  #${ROOT_ID} .redivider-confirm-modal{width:calc(100vw - 20px);padding:18px 14px 16px}
  #${ROOT_ID} .confirm-hud{grid-template-columns:minmax(34px,1fr) 132px minmax(34px,1fr)}
  #${ROOT_ID} .confirm-ring{width:132px;height:132px}
  #${ROOT_ID} .confirm-actions{flex-direction:column}
  #${ROOT_ID} .confirm-action{width:100%}
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
  #${ROOT_ID}[data-math-mode="normal"] .math-wing{left:8px;width:min(360px,calc(100vw - 16px));bottom:154px}
  #${ROOT_ID}[data-kill-mode="normal"] .kill-wing{right:8px;width:min(360px,calc(100vw - 16px))}
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
    root.dataset.confirmOpen="false";
    root.setAttribute("aria-label","Tableau de bord opérateur Atlas Math Core V3 et REDIVIDER · Kill Switch");
    root.innerHTML=`
<section class="wing math-wing" aria-label="Math Core synthétique · architecture Atlas Math Core V3">
  <div class="normal panel">
    <div class="head">
      <span class="kicker">ATLAS MATH CORE V3</span>
      <div class="controls">
        <button class="ctrl" type="button" data-wing="math" data-mode="mini" aria-label="Minimiser Math Core">−</button>
        <button class="ctrl" type="button" data-wing="math" data-mode="hidden" aria-label="Masquer Math Core">×</button>
      </div>
    </div>
    <div class="body math-stage">
      <div class="math-hud">
        <span class="math-balance-rail left" aria-hidden="true"><i class="rail-mark"></i></span>
        <div class="math-ring">
          <div class="ring-core">
            <span class="value" id="acOperatorMathScore406363">—</span>
            <small class="ring-label" id="acOperatorMathRingLabel406363">En attente</small>
          </div>
        </div>
        <span class="math-balance-rail right" aria-hidden="true"><i class="rail-mark"></i></span>
      </div>
      <div class="math-status" id="acOperatorMathContext406363">Contexte Market : en attente</div>
    </div>
  </div>
  <div class="mini">
    <button class="math-mini-ring" type="button" data-wing="math" data-mode="normal" aria-label="Ouvrir Math Core">
      <span class="mini-math-core">
        <span class="mini-score" id="acOperatorMathMiniScore406363">—</span>
        <span class="mini-math-label" id="acOperatorMathMiniLabel406363">En attente</span>
      </span>
    </button>
  </div>
</section>

<section class="wing kill-wing" aria-label="REDIVIDER · Kill Switch opérateur">
  <div class="normal panel">
    <div class="head">
      <span class="kicker">REDIVIDER</span>
      <div class="controls">
        <button class="ctrl" type="button" data-wing="kill" data-mode="mini" aria-label="Minimiser REDIVIDER">−</button>
        <button class="ctrl" type="button" data-wing="kill" data-mode="hidden" aria-label="Masquer REDIVIDER">×</button>
      </div>
    </div>
    <div class="body redivider-stage">
      <div class="redivider-hud">
        <span class="redivider-rail left" aria-hidden="true"><i class="rail-mark"></i></span>
        <button class="kill-ring" type="button" data-kill-stop aria-label="REDIVIDER · Kill Switch">
          <span class="redivider-core">
            <span class="redivider-brand">REDIVIDER</span>
            <span class="redivider-glyphs" aria-hidden="true"><span>◈</span><b>◉</b><span>◈</span></span>
          </span>
        </button>
        <span class="redivider-rail right" aria-hidden="true"><i class="rail-mark"></i></span>
      </div>
      <div class="redivider-status" id="acOperatorRedividerStatus406363">PAPER ONLY · PRÊT</div>
      <span class="sr-only" id="acOperatorKillState406363" aria-live="polite">PRÊT</span>
      <span class="sr-only" id="acOperatorPaperOnly406363">PAPER ONLY</span>
      <span class="sr-only" id="acOperatorKillDetail406363">Auto A Paper · lecture et monitoring préservés.</span>
    </div>
  </div>
  <div class="mini">
    <div style="position:relative;width:104px;height:104px;display:grid;place-items:center">
      <button class="mini-open" type="button" data-wing="kill" data-mode="normal" aria-label="Ouvrir REDIVIDER">↗</button>
      <button class="kill-mini-ring" type="button" data-kill-stop aria-label="REDIVIDER · Kill Switch">
        <span class="redivider-core">
          <span class="redivider-brand">REDIVIDER</span>
          <span class="redivider-glyphs" aria-hidden="true"><span>◈</span><b>◉</b><span>◈</span></span>
        </span>
      </button>
    </div>
  </div>
</section>

<button class="recall math-recall" type="button" data-wing="math" data-mode="normal" aria-label="Rappeler Math Core">MATH<br>CORE</button>
<button class="recall kill-recall" type="button" data-wing="kill" data-mode="normal" aria-label="Rappeler REDIVIDER">REDI<br>VIDER</button>

<div class="redivider-confirm-overlay" id="acOperatorRedividerConfirm406363" data-confirm-overlay>
  <section class="redivider-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="acOperatorRedividerConfirmTitle406363" aria-describedby="acOperatorRedividerConfirmDesc406363">
    <div class="confirm-eyebrow">KILL SWITCH OPÉRATEUR</div>
    <h2 class="confirm-title" id="acOperatorRedividerConfirmTitle406363">REDIVIDER</h2>
    <p class="confirm-subtitle">Confirmation de coupure</p>
    <div class="confirm-hud" aria-hidden="true">
      <span class="confirm-rail left"></span>
      <span class="confirm-ring"><span class="confirm-core"><strong>REDIVIDER</strong><span class="confirm-glyphs"><span>◈</span><b>◉</b><span>◈</span></span></span></span>
      <span class="confirm-rail right"></span>
    </div>
    <p class="confirm-question">Couper Auto A Paper ?</p>
    <div class="confirm-safety" id="acOperatorRedividerConfirmDesc406363">
      <span>Position Paper éventuelle préservée et surveillable.</span>
      <span>Interface, Atlas, Oracle, Math Core et graphique restent lisibles.</span>
      <span>Aucun ordre réel.</span>
      <span>Aucun wallet ni suppression de données.</span>
    </div>
    <div class="confirm-state" id="acOperatorRedividerConfirmState406363">PAPER ONLY · PRÊT</div>
    <div class="confirm-actions">
      <button class="confirm-action cancel" id="acOperatorRedividerCancel406363" type="button" data-confirm-cancel>ANNULER</button>
      <button class="confirm-action confirm" id="acOperatorRedividerAccept406363" type="button" data-confirm-accept>CONFIRMER</button>
    </div>
  </section>
</div>
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
        operatorStop(button);
      });
    });
    const overlay=byId("acOperatorRedividerConfirm406363");
    if(overlay)overlay.addEventListener("click",event=>{if(event.target===overlay)closeStopConfirm("BACKDROP");});
    byId("acOperatorRedividerCancel406363")?.addEventListener("click",event=>{
      event.preventDefault();event.stopPropagation();closeStopConfirm("CANCEL");
    });
    byId("acOperatorRedividerAccept406363")?.addEventListener("click",event=>{
      event.preventDefault();event.stopPropagation();confirmOperatorStop();
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
    root.dataset.confirmOpen=state.confirm_open?"true":"false";

    const math=mathSnapshot();
    const scoreText=scoreTextOf(math);
    const scoreNumber=scoreNumberOf(math);
    root.style.setProperty("--math-score",String(math.progress));

    const openScore=byId("acOperatorMathScore406363");
    if(openScore)openScore.textContent=scoreNumber;
    const miniScore=byId("acOperatorMathMiniScore406363");
    if(miniScore)miniScore.textContent=scoreNumber;
    const ringLabel=byId("acOperatorMathRingLabel406363");
    if(ringLabel)ringLabel.textContent=math.label;
    const miniLabel=byId("acOperatorMathMiniLabel406363");
    if(miniLabel)miniLabel.textContent=math.label;
    const context=byId("acOperatorMathContext406363");
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

    const stateNode=byId("acOperatorKillState406363");
    if(stateNode)stateNode.textContent=status;
    const detail=byId("acOperatorKillDetail406363");
    if(detail)detail.textContent=ks.persisted?"Arrêt opérateur persistant · session actuelle":ks.last_action;
    const paper=byId("acOperatorPaperOnly406363");
    const paperText=ks.paper_only&&!ks.real_orders?"PAPER ONLY":"ÉTAT À VÉRIFIER";
    if(paper)paper.textContent=paperText;
    const redividerStatus=byId("acOperatorRedividerStatus406363");
    if(redividerStatus)redividerStatus.textContent=paperText+" · "+status;
    const confirmState=byId("acOperatorRedividerConfirmState406363");
    if(confirmState)confirmState.textContent=paperText+" · "+status;
    const confirmAccept=byId("acOperatorRedividerAccept406363");
    if(confirmAccept)confirmAccept.disabled=state.stop_pending||!ks.available;
    const confirmCancel=byId("acOperatorRedividerCancel406363");
    if(confirmCancel)confirmCancel.disabled=state.stop_pending;

    root.querySelectorAll("[data-kill-stop]").forEach(button=>{
      button.disabled=state.stop_pending||!ks.available;
      button.setAttribute("aria-pressed",ks.persisted||ks.enabled===false?"true":"false");
      button.title=ks.available
        ?"REDIVIDER · Kill Switch · couper Auto A Paper existant."
        :"REDIVIDER · Kill Switch indisponible tant que Auto A n’est pas résident.";
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
    document.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&state.confirm_open){
        event.preventDefault();
        closeStopConfirm("ESCAPE");
      }
    });
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

  globalThis.AgentCryptoOperatorDashboard406363=Object.freeze({
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
      confirm_open:state.confirm_open,
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
    mutation_observer:false,
    cockpit_frozen:false,
    visual_baseline:"40.6.355",
    atlas_quiet_glass:true,
    math_v3_ring_language:true,
    redivider_identity:true,
    redivider_visible_label:"REDIVIDER",
    redivider_glyphs:"◈ ◉ ◈",
    redivider_wings_normal_only:true,
    redivider_status_source:"STOP_STATE + PAPER_ONLY",
    redivider_frozen_from:"40.6.361",
    redivider_confirmation_modal:true,
    confirmation_first_click:"OPEN_MODAL_ONLY",
    confirmation_second_click:"EXECUTE_EXISTING_OWNER",
    browser_confirm:"FALLBACK_ONLY",
    confirmation_escape_cancel:true,
    confirmation_backdrop_cancel:true,
    confirmation_focus_default:"ANNULER",
    fake_countdown:false,
    mini_core_only:true,
    math_normal_balanced:true,
    math_open_ring_geometry:"108x108",
    math_open_footprint:"MATCH_REDIVIDER_372_MAX",
    math_mini_unchanged:true,
    geometry_frozen:true,
    crimson_not_pink:true,
    css_authority:"SINGLE_CLEAN_REWRITE_REDIVIDER_CONFIRMATION_MODAL"
  });
})();
