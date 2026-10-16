/* Agent-Crypto Administrator — 40.6.384
   OPERATOR DASHBOARD · SINGLE REDIVIDER STATUS
   Presentation-only REDIVIDER cleanup: removes the redundant second visible status line below the ring. Orbit HUD, Math, 360° ring, STOP/RESUME logic and protected owners remain unchanged. */
(()=>{
  "use strict";
  if(globalThis.AgentCryptoOperatorDashboard406384)return;

  const BUILD="40.6.384";
  const ROOT_ID="agentCryptoOperatorDashboard406384";
  const STYLE_ID="agentCryptoOperatorDashboardStyle406384";
  const MANUAL_STOP_KEY="agent_crypto_strategy_a_auto_manual_stop_v1";
  const MANUAL_STOP_REASON_KEY="agent_crypto_strategy_a_auto_manual_stop_reason_v1";
  const MATH_BOOT_PROBE_MAX=30;
  const MATH_BOOT_PROBE_MS=500;
  const state={
    mathMode:"mini",
    killMode:"mini",
    mounted:false,
    bound:false,
    action_pending:false,
    confirm_open:false,
    confirm_action:"stop",
    confirm_return_focus:null,
    kill_hover_suppressed:false,
    hover_kind:null,
    operator_stopped:null,
    last_stop:null,
    last_start:null,
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

  function atlasMathScoreBand(score){
    const value=Number(score);
    if(!Number.isFinite(value))return {id:"neutral",color:"#8EA4BA"};
    if(value<25)return {id:"red",color:"#FF5C78"};
    if(value<55)return {id:"orange",color:"#FF9F1C"};
    if(value<75)return {id:"turquoise",color:"#42E8E0"};
    return {id:"green",color:"#64EFA0"};
  }

  function canonicalMathColor(math=mathSnapshot()){
    const shell=byId("math");
    try{
      const live=String(getComputedStyle(shell).getPropertyValue("--math-score-color")||"").trim();
      if(/^#[0-9a-f]{6}$/i.test(live)||/^rgb/i.test(live)||/^hsl/i.test(live))return {id:String(shell?.dataset?.mathScoreBand||"canonical"),color:live,source:"CANONICAL_DOM"};
    }catch(_){}
    const fallback=atlasMathScoreBand(math.score);
    return {...fallback,source:"CANONICAL_BAND_FALLBACK"};
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

  function clearManualStop(){
    try{
      sessionStorage.removeItem(MANUAL_STOP_KEY);
      sessionStorage.removeItem(MANUAL_STOP_REASON_KEY);
      return true;
    }catch(_){return false;}
  }

  function stopOwner(){
    if(typeof globalThis.strategyAAutoStop==="function"){
      return {kind:"function",id:"strategyAAutoStop",run:()=>globalThis.strategyAAutoStop("REDIVIDER · arrêt opérateur depuis le tableau de bord 40.6.384.")};
    }
    for(const id of ["strategyAAutoStop","strategyAOperatorStop","strategyAVisualStop404269"]){
      const button=byId(id);
      if(button instanceof HTMLElement){
        return {kind:"button",id,run:()=>{button.click();return autoSnapshot();}};
      }
    }
    return null;
  }

  function startOwner(){
    if(typeof globalThis.strategyAAutoStart==="function"){
      return {kind:"function",id:"strategyAAutoStart",run:()=>globalThis.strategyAAutoStart()};
    }
    const runner=globalThis.AgentCryptoAutoPaperRunner;
    if(runner&&typeof runner.start==="function"){
      return {kind:"owner-api",id:"AgentCryptoAutoPaperRunner.start",run:()=>{clearManualStop();return runner.start();}};
    }
    const bootstrap=globalThis.AgentCryptoStrategyAAutoStart;
    if(bootstrap&&typeof bootstrap.restart_bootstrap==="function"){
      return {kind:"owner-bootstrap",id:"AgentCryptoStrategyAAutoStart.restart_bootstrap",run:()=>{clearManualStop();return bootstrap.restart_bootstrap();}};
    }
    for(const id of ["strategyAAutoStart","strategyAOperatorStart","strategyAVisualStart404269"]){
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
    if(state.operator_stopped===null)state.operator_stopped=persisted;
    const stopped=state.operator_stopped===true||persisted===true;
    const stop_available=!!stopOwner();
    const start_available=!!startOwner();
    return Object.freeze({
      available:stopped?start_available:stop_available,
      stop_available,
      start_available,
      stopped,
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

  function setHoverKind(kind){
    if(!["math","kill"].includes(kind))return false;
    if(state.hover_kind===kind)return true;
    state.hover_kind=kind;
    render();
    return true;
  }

  function clearHoverKind(kind){
    if(state.hover_kind!==kind)return false;
    state.hover_kind=null;
    render();
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
    state.action_pending=true;
    render();
    try{
      const result=owner.run();
      state.last_stop={at:new Date().toISOString(),owner:owner.kind,id:owner.id||null,result:result||null};
      state.operator_stopped=true;
      state.last_error=null;
      emit("STOP",{owner:owner.kind,owner_id:owner.id||null,paper_only:true,real_orders:false});
      return true;
    }catch(error){
      state.last_error=String(error?.message||error);
      emit("STOP_FAILED",{error:state.last_error});
      return false;
    }finally{
      state.action_pending=false;
      render();
    }
  }

  function executeOperatorStart(owner=startOwner()){
    if(!owner){
      state.last_error="START_OWNER_NOT_RESIDENT";
      state.confirm_open=false;
      render();
      return false;
    }
    state.confirm_open=false;
    state.action_pending=true;
    render();
    try{
      const result=owner.run();
      state.last_start={at:new Date().toISOString(),owner:owner.kind,id:owner.id||null,result:result||null};
      state.operator_stopped=false;
      state.last_error=null;
      emit("START",{owner:owner.kind,owner_id:owner.id||null,paper_only:true,real_orders:false,replay:false});
      return true;
    }catch(error){
      state.last_error=String(error?.message||error);
      emit("START_FAILED",{error:state.last_error});
      return false;
    }finally{
      state.action_pending=false;
      render();
      window.setTimeout(scheduleRender,180);
    }
  }

  function legacyConfirmFallback(action,owner){
    const restart=action==="start";
    const ok=window.confirm(restart
      ?"REDIVIDER · SWITCH OPÉRATEUR\n\nRelancer Auto A Paper ?\nRéactivation de l’automatisme existant sur l’état courant uniquement.\nAucun ordre réel, wallet ou suppression n’est déclenché."
      :"REDIVIDER · KILL SWITCH\n\nCouper Auto A Paper ?\nUne position Paper éventuelle reste intacte et surveillable.\nL’interface, Math Core, Oracle, Atlas et le graphique restent lisibles.\nAucun ordre réel, wallet ou suppression n’est déclenché."
    );
    if(!ok)return false;
    return restart?executeOperatorStart(owner):executeOperatorStop(owner);
  }

  function closeStopConfirm(reason="CANCEL"){
    if(!state.confirm_open)return false;
    state.confirm_open=false;
    state.kill_hover_suppressed=true;
    render();
    requestAnimationFrame(()=>{
      const root=byId(ROOT_ID);
      const stillHovered=root?.querySelector(".kill-ring:hover,.kill-mini-ring:hover");
      if(!stillHovered&&state.kill_hover_suppressed){
        state.kill_hover_suppressed=false;
        render();
      }
    });
    emit("CONFIRM_"+String(reason).toUpperCase(),{action:state.confirm_action,paper_only:true,real_orders:false});
    const target=state.confirm_return_focus;
    state.confirm_return_focus=null;
    if(target&&typeof target.focus==="function"){
      requestAnimationFrame(()=>{try{target.focus({preventScroll:true});}catch(_){try{target.focus();}catch(__){}}});
    }
    return true;
  }

  function openSwitchConfirm(trigger=null){
    const ks=stopState();
    const action=ks.stopped?"start":"stop";
    const owner=action==="start"?startOwner():stopOwner();
    if(!owner){
      state.last_error=action==="start"?"START_OWNER_NOT_RESIDENT":"STOP_OWNER_NOT_RESIDENT";
      render();
      return false;
    }
    const overlay=byId("acOperatorRedividerConfirm406384");
    if(!overlay)return legacyConfirmFallback(action,owner);
    state.confirm_action=action;
    state.confirm_return_focus=trigger instanceof HTMLElement?trigger:null;
    state.kill_hover_suppressed=false;
    state.confirm_open=true;
    state.last_error=null;
    render();
    emit("CONFIRM_OPEN",{action,paper_only:true,real_orders:false});
    requestAnimationFrame(()=>{
      const cancel=byId("acOperatorRedividerCancel406384");
      if(cancel&&typeof cancel.focus==="function")cancel.focus({preventScroll:true});
    });
    return true;
  }

  function confirmOperatorSwitch(){
    const action=state.confirm_action==="start"?"start":"stop";
    const owner=action==="start"?startOwner():stopOwner();
    if(!owner){
      state.last_error=action==="start"?"START_OWNER_NOT_RESIDENT":"STOP_OWNER_NOT_RESIDENT";
      state.confirm_open=false;
      render();
      return false;
    }
    emit("CONFIRM_ACCEPT",{action,owner:owner.kind,owner_id:owner.id||null,paper_only:true,real_orders:false});
    state.confirm_return_focus=null;
    return action==="start"?executeOperatorStart(owner):executeOperatorStop(owner);
  }

  function operatorSwitch(trigger=null){
    return openSwitchConfirm(trigger);
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
  --math-score:0;--math-tone:#8EA4BA;--redivider-ready:100;
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
  left:16px;width:clamp(268px,20.5vw,332px);
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
#${ROOT_ID} .math-wing .panel{
  border-color:rgba(93,203,216,.20);
  background:
    radial-gradient(circle at 50% 34%,rgba(55,221,226,.055),transparent 38%),
    linear-gradient(150deg,rgba(7,16,22,.20),rgba(3,8,13,.12));
  backdrop-filter:blur(8px) saturate(92%);
  box-shadow:0 14px 30px rgba(0,0,0,.22),inset 0 0 0 1px rgba(255,255,255,.010),0 0 18px rgba(55,221,226,.035);
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
#${ROOT_ID} .math-wing .head{
  position:relative;justify-content:flex-end;
  background:linear-gradient(180deg,rgba(4,15,20,.08),transparent);
}
#${ROOT_ID} .math-wing .head .kicker{
  position:absolute;left:50%;transform:translateX(-50%);
  width:max-content;max-width:calc(100% - 92px);
  text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
#${ROOT_ID} .math-wing .controls{margin-left:auto}
#${ROOT_ID}[data-math-mode="normal"] .math-wing .head{height:42px;padding:7px 10px}
#${ROOT_ID}[data-math-mode="normal"] .math-wing .body{padding:8px 9px 9px}
#${ROOT_ID} .controls{display:flex;gap:6px;align-items:center}
#${ROOT_ID} .normal.panel .controls{opacity:0;pointer-events:none;transform:translateY(-2px);transition:opacity .14s ease,transform .14s ease}
#${ROOT_ID} .normal.panel:hover .controls,
#${ROOT_ID} .normal.panel:focus-within .controls{opacity:1;pointer-events:auto;transform:translateY(0)}
#${ROOT_ID} .ctrl{
  width:28px;height:28px;padding:0;border-radius:50%;display:grid;place-items:center;
  border:1px solid rgba(255,217,120,.22);background:rgba(255,255,255,.035);
  color:#e9f7fb;font-size:14px;font-weight:900;cursor:pointer;
}
#${ROOT_ID} .ctrl:hover{transform:scale(1.05)}
#${ROOT_ID} .body{padding:10px 11px 11px}

/* MATH OPEN — balanced Atlas Math Core V3 instrument */
#${ROOT_ID} .math-stage{
  min-height:132px;display:grid;grid-template-rows:1fr auto;gap:8px;place-items:center;position:relative;
  text-align:center;padding-left:2px;padding-right:2px;
}
#${ROOT_ID} .math-hud{
  width:100%;display:grid;grid-template-columns:minmax(44px,1fr) 94px minmax(44px,1fr);
  align-items:center;justify-items:center;gap:6px;position:relative;
}
#${ROOT_ID} .math-balance-rail{
  width:100%;height:30px;position:relative;overflow:hidden;opacity:.66;
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
  display:grid;place-items:center;border:0;padding:0;border-radius:50%;position:relative;overflow:hidden;
  background:conic-gradient(
    var(--math-tone) calc(var(--math-score) * 1%),
    rgba(255,255,255,.10) 0
  );
  box-shadow:0 0 24px color-mix(in srgb,var(--math-tone) 18%,transparent);
}
#${ROOT_ID} .math-ring{width:94px;height:94px;z-index:2}
#${ROOT_ID} .ring-core,
#${ROOT_ID} .mini-math-core{
  position:absolute;inset:8px;width:auto;height:auto;border-radius:50%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  background:#0b1c30;
  border:1px solid color-mix(in srgb,var(--math-tone) 28%,rgba(120,150,170,.28));
  box-shadow:none;
}
#${ROOT_ID} .math-ring .value,
#${ROOT_ID} .mini-score{
  position:relative;z-index:3;color:var(--math-tone);line-height:1;font-weight:950;
  text-shadow:0 0 16px color-mix(in srgb,var(--math-tone) 18%,transparent);
}
#${ROOT_ID} .math-ring .value{font-size:24px}
#${ROOT_ID} .mini-score{font-size:23px}
#${ROOT_ID} .ring-label,
#${ROOT_ID} .mini-math-label{
  position:relative;z-index:3;max-width:72px;color:var(--math-tone);font-size:6.5px;font-weight:850;line-height:1.05;text-align:center;
  text-shadow:none;
}
#${ROOT_ID} .math-status{
  display:flex;align-items:center;justify-content:center;gap:7px;min-height:18px;
  width:100%;max-width:94%;margin:0 auto;padding:0 8px;color:#82c7cb;font-size:7px;font-weight:900;letter-spacing:.08em;
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
#${ROOT_ID} .kill-ring,
#${ROOT_ID} .kill-mini-ring{
  display:grid;place-items:center;border:0;padding:8px;border-radius:50%;cursor:pointer;
  background:rgba(104,30,40,.72);
  box-shadow:0 0 0 1px rgba(126,35,46,.14),0 0 5px rgba(89,10,23,.10);
  filter:brightness(.84) saturate(.88);
  transform-origin:center;
  transition:transform .14s ease,filter .16s ease,box-shadow .20s ease,background .20s ease;
}
#${ROOT_ID} .kill-ring{width:108px;height:108px;position:relative;z-index:2}

/* REDIVIDER LAMP LOGIC
   READY = full ring but dark
   ARMED/HOVER = bright crimson
   STOPPED = muted/desaturated
   UNAVAILABLE = almost off */
#${ROOT_ID}[data-kill-lamp="ready"] .kill-ring,
#${ROOT_ID}[data-kill-lamp="ready"] .kill-mini-ring{
  background:rgba(104,30,40,.72);
  filter:brightness(.84) saturate(.88);
}
#${ROOT_ID}[data-kill-lamp="stopped"] .kill-ring,
#${ROOT_ID}[data-kill-lamp="stopped"] .kill-mini-ring{
  background:rgba(43,55,63,.70);
  filter:brightness(.66) saturate(.52);
  box-shadow:0 0 0 1px rgba(92,115,126,.16),0 0 7px rgba(50,72,84,.10);
}
#${ROOT_ID}[data-kill-state="stopped"] .redivider-brand{color:#9aaeb6}
#${ROOT_ID}[data-kill-state="stopped"] .redivider-glyphs{color:#6f8994;text-shadow:none}
#${ROOT_ID}[data-kill-lamp="unavailable"] .kill-ring,
#${ROOT_ID}[data-kill-lamp="unavailable"] .kill-mini-ring{
  background:rgba(76,69,72,.28);
  filter:brightness(.48) saturate(.30);
  box-shadow:0 0 0 1px rgba(90,80,82,.10);
}
#${ROOT_ID}[data-kill-lamp="confirm"] .kill-ring,
#${ROOT_ID}[data-kill-lamp="confirm"] .kill-mini-ring{
  background:rgba(124,29,41,.82);
  filter:brightness(.98) saturate(.96);
  box-shadow:0 0 0 1px rgba(146,36,49,.22),0 0 10px rgba(104,12,27,.18),0 0 18px rgba(73,8,20,.08);
}

#${ROOT_ID}:not([data-kill-hover-suppressed="true"]) .kill-ring:hover,
#${ROOT_ID}:not([data-kill-hover-suppressed="true"]) .kill-mini-ring:hover{
  filter:brightness(1.02) saturate(.98);
  background:rgba(132,30,43,.84);
  box-shadow:0 0 0 1px rgba(150,39,51,.22),0 0 9px rgba(112,13,28,.20),0 0 18px rgba(78,8,21,.07);
}
#${ROOT_ID}:not([data-kill-hover-suppressed="true"]) .kill-ring:hover .redivider-core,
#${ROOT_ID}:not([data-kill-hover-suppressed="true"]) .kill-mini-ring:hover .redivider-core{
  background:radial-gradient(circle at 50% 42%,rgba(115,16,29,.18),rgba(14,9,12,.97) 62%,rgba(5,6,8,.99));
  border-color:rgba(143,43,53,.34);
  box-shadow:inset 0 0 18px rgba(76,7,18,.24);
}
#${ROOT_ID}:not([data-kill-hover-suppressed="true"]) .kill-ring:hover .redivider-brand,
#${ROOT_ID}:not([data-kill-hover-suppressed="true"]) .kill-mini-ring:hover .redivider-brand{
  color:#e4d8d4;text-shadow:0 0 3px rgba(143,27,42,.16);
}
#${ROOT_ID}:not([data-kill-hover-suppressed="true"]) .kill-ring:hover .redivider-glyphs,
#${ROOT_ID}:not([data-kill-hover-suppressed="true"]) .kill-mini-ring:hover .redivider-glyphs{
  color:#9f303b;text-shadow:0 0 4px rgba(121,12,28,.24);
}
#${ROOT_ID}:not([data-kill-hover-suppressed="true"]) .kill-ring:hover .redivider-glyphs b,
#${ROOT_ID}:not([data-kill-hover-suppressed="true"]) .kill-mini-ring:hover .redivider-glyphs b{
  color:#b93643;text-shadow:0 0 5px rgba(137,15,31,.30);
}
#${ROOT_ID}[data-kill-hover-suppressed="true"] .kill-ring,
#${ROOT_ID}[data-kill-hover-suppressed="true"] .kill-mini-ring{
  filter:brightness(.84) saturate(.88) !important;
  background:rgba(104,30,40,.72) !important;
  box-shadow:0 0 0 1px rgba(126,35,46,.14),0 0 5px rgba(89,10,23,.10) !important;
}
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

/* OPERATOR HOVER STATUS — replaces native browser tooltip for MINI controls */
#${ROOT_ID} .operator-hover-readout{
  position:absolute;z-index:18;bottom:108px;width:min(286px,calc(100vw - 36px));min-height:54px;
  display:grid;place-items:center;place-content:center;justify-items:center;padding:7px 18px;border-radius:11px;
  background:rgba(4,10,15,.93);backdrop-filter:blur(9px) saturate(90%);
  font-size:9px;line-height:1.28;font-weight:900;letter-spacing:.055em;
  white-space:pre-line;overflow:hidden;text-align:center;
  opacity:0;transform:translateY(4px);pointer-events:none;
  transition:opacity .14s ease,transform .14s ease;
  box-shadow:0 8px 22px rgba(0,0,0,.32);
}
#${ROOT_ID} .math-hover-readout{
  left:16px;justify-items:center;text-align:center;color:var(--math-tone);border:1px solid color-mix(in srgb,var(--math-tone) 28%,transparent);
  box-shadow:0 8px 22px rgba(0,0,0,.32),0 0 12px color-mix(in srgb,var(--math-tone) 8%,transparent);
}
#${ROOT_ID} .kill-hover-readout{
  right:16px;justify-items:center;text-align:center;color:#c8868d;border:1px solid rgba(159,29,43,.30);
  box-shadow:0 8px 22px rgba(0,0,0,.32),0 0 12px rgba(159,29,43,.045);
}
#${ROOT_ID}[data-hover-target="math"] .math-hover-readout,
#${ROOT_ID}[data-hover-target="kill"] .kill-hover-readout{opacity:1;transform:translateY(0)}
#${ROOT_ID}[data-math-mode="normal"] .math-hover-readout{
  left:16px;width:clamp(268px,20.5vw,332px);bottom:198px;
}
#${ROOT_ID}[data-kill-mode="normal"] .kill-hover-readout{
  right:16px;width:clamp(292px,23vw,372px);bottom:214px;
}
#${ROOT_ID}[data-math-mode="hidden"] .math-hover-readout,
#${ROOT_ID}[data-kill-mode="hidden"] .kill-hover-readout{bottom:82px}
@media(max-width:620px){
  #${ROOT_ID} .operator-hover-readout{width:min(330px,calc(100vw - 24px));font-size:8px}
  #${ROOT_ID} .math-hover-readout{left:12px}
  #${ROOT_ID} .kill-hover-readout{right:12px}
}

/* 40.6.384 — QUIET CHROME + TACTICAL REDIVIDER
   Presentation only. Controls stay invisible at rest and return on hover/focus.
   The REDIVIDER keeps its frozen 360° ring and logic; only the surrounding HUD
   receives a restrained angular crimson frame inspired by the operator reference. */
#${ROOT_ID} .kill-wing .mini-open{
  opacity:0;pointer-events:none;transform:translate(-2px,2px) scale(.94);
  transition:opacity .14s ease,transform .14s ease;
}
#${ROOT_ID} .kill-wing:hover .mini-open,
#${ROOT_ID} .kill-wing:focus-within .mini-open{
  opacity:1;pointer-events:auto;transform:translate(0,0) scale(1);
}
#${ROOT_ID} .redivider-hud:before,
#${ROOT_ID} .redivider-hud:after{
  content:"";position:absolute;left:16%;right:16%;height:1px;pointer-events:none;z-index:1;
  background:linear-gradient(90deg,transparent,rgba(115,18,31,.20) 10%,rgba(172,31,46,.52) 34%,transparent 48%,transparent 52%,rgba(172,31,46,.52) 66%,rgba(115,18,31,.20) 90%,transparent);
  opacity:.42;transition:opacity .16s ease,filter .16s ease;
}
#${ROOT_ID} .redivider-hud:before{top:3px}
#${ROOT_ID} .redivider-hud:after{bottom:3px}
#${ROOT_ID} .redivider-rail{
  opacity:.72;transition:opacity .16s ease,filter .16s ease;
}
#${ROOT_ID} .redivider-rail:after{
  left:4px;right:4px;top:6px;height:22px;
  border-top-color:rgba(164,28,43,.48);border-bottom-color:rgba(164,28,43,.34);
  background:
    repeating-linear-gradient(90deg,transparent 0 6px,rgba(167,29,44,.34) 6px 10px,transparent 10px 16px),
    linear-gradient(90deg,rgba(110,16,29,.10),rgba(165,27,43,.18),rgba(110,16,29,.08));
  clip-path:polygon(0 34%,10% 34%,15% 18%,23% 18%,28% 34%,84% 34%,100% 50%,84% 66%,28% 66%,23% 82%,15% 82%,10% 66%,0 66%);
}
#${ROOT_ID} .kill-wing .normal.panel:hover .redivider-rail,
#${ROOT_ID} .kill-wing .normal.panel:focus-within .redivider-rail{
  opacity:1;filter:brightness(1.06);
}
#${ROOT_ID} .kill-wing .normal.panel:hover .redivider-hud:before,
#${ROOT_ID} .kill-wing .normal.panel:hover .redivider-hud:after,
#${ROOT_ID} .kill-wing .normal.panel:focus-within .redivider-hud:before,
#${ROOT_ID} .kill-wing .normal.panel:focus-within .redivider-hud:after{
  opacity:.74;filter:drop-shadow(0 0 3px rgba(126,15,30,.16));
}
#${ROOT_ID} .redivider-brand{
  font-size:9px;font-weight:1000;letter-spacing:.185em;
}
#${ROOT_ID} .operator-hover-readout{font-weight:1000}

/* 40.6.384 — HUD TEXT FRAME
   Side wings remain CSS geometry (rails, clipped polygons, gradients).
   Text ornaments are deliberately restrained and centered around the existing ring. */
#${ROOT_ID} .redivider-hud{
  grid-template-columns:minmax(48px,1fr) 128px minmax(48px,1fr);
}
#${ROOT_ID} .redivider-center-stack{
  width:128px;height:136px;position:relative;display:grid;place-items:center;z-index:2;
}
#${ROOT_ID} .redivider-center-stack .kill-ring{position:relative;z-index:2}
#${ROOT_ID} .redivider-orbit{
  position:absolute;left:50%;transform:translateX(-50%);
  width:max-content;max-width:132px;white-space:nowrap;pointer-events:none;
  color:#a96b72;font-size:6.5px;font-weight:1000;line-height:1;
  letter-spacing:.12em;text-transform:uppercase;text-align:center;
  text-shadow:0 0 4px rgba(116,12,28,.12);
}
#${ROOT_ID} .redivider-orbit-top{top:1px}
#${ROOT_ID} .redivider-orbit-bottom{bottom:1px;color:#8f6268}
#${ROOT_ID}[data-kill-state="stopped"] .redivider-orbit{color:#738990;text-shadow:none}
#${ROOT_ID}[data-kill-lamp="unavailable"] .redivider-orbit{opacity:.46}
#${ROOT_ID} .operator-hover-readout{
  white-space:pre-line;
}
#${ROOT_ID} .kill-hover-readout{
  min-height:68px;line-height:1.34;letter-spacing:.065em;
}
#${ROOT_ID} .math-hover-readout{
  min-height:58px;line-height:1.34;letter-spacing:.06em;
}

@media(max-width:620px){
  #${ROOT_ID} .redivider-hud{grid-template-columns:minmax(34px,1fr) 118px minmax(34px,1fr)}
  #${ROOT_ID} .redivider-center-stack{width:118px;height:130px}
  #${ROOT_ID} .redivider-orbit{font-size:6px;max-width:120px}
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
  #${ROOT_ID}[data-math-mode="normal"] .math-wing{left:8px;width:min(324px,calc(100vw - 16px));bottom:146px}
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
            <span class="value" id="acOperatorMathScore406384">—</span>
            <small class="ring-label" id="acOperatorMathRingLabel406384">En attente</small>
          </div>
        </div>
        <span class="math-balance-rail right" aria-hidden="true"><i class="rail-mark"></i></span>
      </div>
      <div class="math-status" id="acOperatorMathContext406384">Contexte Market : en attente</div>
    </div>
  </div>
  <div class="mini">
    <button class="math-mini-ring" type="button" data-wing="math" data-mode="normal" aria-label="Ouvrir Math Core">
      <span class="mini-math-core">
        <span class="mini-score" id="acOperatorMathMiniScore406384">—</span>
        <span class="mini-math-label" id="acOperatorMathMiniLabel406384">En attente</span>
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
        <span class="redivider-center-stack">
          <span class="redivider-orbit redivider-orbit-top" id="acOperatorRedividerOrbitTop406384" aria-hidden="true">- : PRÊT : -</span>
          <button class="kill-ring" type="button" data-redivider-switch aria-label="REDIVIDER · Kill Switch">
            <span class="redivider-core">
              <span class="redivider-brand">REDIVIDER</span>
              <span class="redivider-glyphs" aria-hidden="true"><span>◈</span><b>◉</b><span>◈</span></span>
            </span>
          </button>
          <span class="redivider-orbit redivider-orbit-bottom" id="acOperatorRedividerOrbitBottom406384" aria-hidden="true">— PAPER ONLY · ACTIF —</span>
        </span>
        <span class="redivider-rail right" aria-hidden="true"><i class="rail-mark"></i></span>
      </div>
      <span class="sr-only" id="acOperatorKillState406384" aria-live="polite">PRÊT</span>
      <span class="sr-only" id="acOperatorPaperOnly406384">PAPER ONLY</span>
      <span class="sr-only" id="acOperatorKillDetail406384">Auto A Paper · lecture et monitoring préservés.</span>
    </div>
  </div>
  <div class="mini">
    <div style="position:relative;width:104px;height:104px;display:grid;place-items:center">
      <button class="mini-open" type="button" data-wing="kill" data-mode="normal" aria-label="Ouvrir REDIVIDER">↗</button>
      <button class="kill-mini-ring" type="button" data-redivider-switch aria-label="REDIVIDER · Kill Switch">
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

<div class="operator-hover-readout math-hover-readout" id="acOperatorMathHoverStatus406384" role="status" aria-live="polite"></div>
<div class="operator-hover-readout kill-hover-readout" id="acOperatorRedividerHoverStatus406384" role="status" aria-live="polite"></div>

<div class="redivider-confirm-overlay" id="acOperatorRedividerConfirm406384" data-confirm-overlay>
  <section class="redivider-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="acOperatorRedividerConfirmTitle406384" aria-describedby="acOperatorRedividerConfirmDesc406384">
    <div class="confirm-hud">
      <div class="confirm-hud-art" aria-hidden="true"></div>
      <div class="confirm-hud-copy">
        <div class="confirm-eyebrow">KILL SWITCH OPÉRATEUR</div>
        <h2 class="confirm-title" id="acOperatorRedividerConfirmTitle406384">REDIVIDER</h2>
        <p class="confirm-subtitle" id="acOperatorRedividerConfirmSubtitle406384">Confirmation de coupure</p>
        <div class="confirm-live">
          <span class="confirm-percent" id="acOperatorRedividerConfirmPercent406384">[ 100% ]</span>
          <span class="confirm-glyphs" aria-hidden="true"><span>◈</span><b>◉</b><span>◈</span></span>
          <div class="confirm-state" id="acOperatorRedividerConfirmState406384">PAPER ONLY · PRÊT</div>
        </div>
      </div>
    </div>
    <div class="confirm-command-deck">
      <p class="confirm-question" id="acOperatorRedividerConfirmQuestion406384">Couper Auto A Paper ?</p>
      <div class="confirm-safety" id="acOperatorRedividerConfirmDesc406384">
        <span>Position Paper éventuelle préservée et surveillable.</span>
        <span>Interface, Atlas, Oracle, Math Core et graphique restent lisibles.</span>
        <span>Aucun ordre réel.</span>
        <span>Aucun wallet ni suppression de données.</span>
      </div>
      <div class="confirm-actions">
        <button class="confirm-action cancel" id="acOperatorRedividerCancel406384" type="button" data-confirm-cancel>ANNULER</button>
        <button class="confirm-action confirm" id="acOperatorRedividerAccept406384" type="button" data-confirm-accept>CONFIRMER</button>
      </div>
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
    root.querySelectorAll("[data-redivider-switch]").forEach(button=>{
      button.addEventListener("click",event=>{
        event.preventDefault();
        event.stopPropagation();
        operatorSwitch(button);
      });
      button.addEventListener("mouseleave",()=>{
        if(state.kill_hover_suppressed){
          state.kill_hover_suppressed=false;
          render();
        }
      });
    });
    const bindHover=(selector,kind)=>{
      root.querySelectorAll(selector).forEach(node=>{
        node.addEventListener("mouseenter",()=>setHoverKind(kind));
        node.addEventListener("mouseleave",()=>clearHoverKind(kind));
        node.addEventListener("focus",()=>setHoverKind(kind));
        node.addEventListener("blur",()=>clearHoverKind(kind));
      });
    };
    bindHover(".math-ring,.math-mini-ring,.math-recall","math");
    bindHover(".kill-ring,.kill-mini-ring,.kill-recall","kill");
    const overlay=byId("acOperatorRedividerConfirm406384");
    if(overlay)overlay.addEventListener("click",event=>{if(event.target===overlay)closeStopConfirm("BACKDROP");});
    byId("acOperatorRedividerCancel406384")?.addEventListener("click",event=>{
      event.preventDefault();event.stopPropagation();closeStopConfirm("CANCEL");
    });
    byId("acOperatorRedividerAccept406384")?.addEventListener("click",event=>{
      event.preventDefault();event.stopPropagation();confirmOperatorSwitch();
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
    root.dataset.killHoverSuppressed=state.kill_hover_suppressed?"true":"false";
    root.dataset.hoverTarget=state.hover_kind||"none";

    const math=mathSnapshot();
    const scoreText=scoreTextOf(math);
    const scoreNumber=scoreNumberOf(math);
    const mathTone=canonicalMathColor(math);
    root.style.setProperty("--math-score",String(math.progress));
    root.style.setProperty("--math-tone",mathTone.color);
    root.dataset.mathScoreBand=mathTone.id;
    root.dataset.mathColorSource=mathTone.source;

    const openScore=byId("acOperatorMathScore406384");
    if(openScore)openScore.textContent=scoreNumber;
    const miniScore=byId("acOperatorMathMiniScore406384");
    if(miniScore)miniScore.textContent=scoreNumber;
    const ringLabel=byId("acOperatorMathRingLabel406384");
    if(ringLabel)ringLabel.textContent=math.label;
    const miniLabel=byId("acOperatorMathMiniLabel406384");
    if(miniLabel)miniLabel.textContent=math.label;
    const context=byId("acOperatorMathContext406384");
    if(context)context.textContent=math.context;
    const mathHover=byId("acOperatorMathHoverStatus406384");
    if(mathHover)mathHover.textContent="[ "+scoreText+" ]\n- : "+String(math.label||"EN ATTENTE").toUpperCase()+" : -\n— Appuyez pour ouvrir —";

    const ks=stopState();
    const action=state.confirm_open?state.confirm_action:(ks.stopped?"start":"stop");
    const actionAvailable=action==="start"?ks.start_available:ks.stop_available;
    const readyPct=actionAvailable?100:0;
    root.style.setProperty("--redivider-ready",String(readyPct));
    const status=state.action_pending
      ?(action==="start"?"RELANCE…":"COUPURE…")
      :ks.stopped
        ?"COUPÉ"
        :ks.enabled===true
          ?"ACTIF"
          :actionAvailable?"PRÊT":"INDISPONIBLE";

    root.dataset.killState=ks.stopped?"stopped":ks.enabled===true?"active":"idle";
    root.dataset.killLamp=!actionAvailable
      ?"unavailable"
      :ks.stopped
        ?"stopped"
        :state.confirm_open
          ?"confirm"
          :"ready";

    const stateNode=byId("acOperatorKillState406384");
    if(stateNode)stateNode.textContent=status;
    const detail=byId("acOperatorKillDetail406384");
    if(detail)detail.textContent=ks.persisted?"Arrêt opérateur persistant · session actuelle":ks.last_action;
    const paper=byId("acOperatorPaperOnly406384");
    const paperText=ks.paper_only&&!ks.real_orders?"PAPER ONLY":"ÉTAT À VÉRIFIER";
    if(paper)paper.textContent=paperText;
    const redividerHover=byId("acOperatorRedividerHoverStatus406384");
    if(redividerHover)redividerHover.textContent=!ks.available
      ?"[ OFF ]\n- : INDISPONIBLE : -\n— AUTO A PAPER —\n- Action indisponible -"
      :ks.stopped
        ?"[ COUPÉ ]\n- : ARRÊT : -\n— AUTO A PAPER —\n- Appuyez pour relancer -"
        :"[ 100% ]\n- : PRÊT : -\n— CHARGÉ —\n- Appuyez pour stopper -";

    const orbitTop=byId("acOperatorRedividerOrbitTop406384");
    const orbitBottom=byId("acOperatorRedividerOrbitBottom406384");
    if(orbitTop)orbitTop.textContent=!ks.available
      ?"- : OFF : -"
      :ks.stopped
        ?"- : COUPÉ : -"
        :"- : PRÊT : -";
    if(orbitBottom)orbitBottom.textContent=!ks.available
      ?"— ACTION INDISPONIBLE —"
      :ks.stopped
        ?"— PAPER ONLY · STOP —"
        :"— PAPER ONLY · ACTIF —";

    const confirmSubtitle=byId("acOperatorRedividerConfirmSubtitle406384");
    if(confirmSubtitle)confirmSubtitle.textContent=action==="start"?"Confirmation de relance":"Confirmation de coupure";
    const confirmQuestion=byId("acOperatorRedividerConfirmQuestion406384");
    if(confirmQuestion)confirmQuestion.textContent=action==="start"?"Relancer Auto A Paper ?":"Couper Auto A Paper ?";
    const confirmSafety=byId("acOperatorRedividerConfirmDesc406384");
    if(confirmSafety)confirmSafety.innerHTML=action==="start"
      ?"<span>Réactivation de l’automatisme Auto A Paper.</span><span>Interface, Atlas, Oracle, Math Core et graphique restent inchangés.</span><span>Aucun ordre réel.</span><span>Reprise sur l’état courant uniquement.</span>"
      :"<span>Position Paper éventuelle préservée et surveillable.</span><span>Interface, Atlas, Oracle, Math Core et graphique restent lisibles.</span><span>Aucun ordre réel.</span><span>Aucun wallet ni suppression de données.</span>";

    const confirmPercent=byId("acOperatorRedividerConfirmPercent406384");
    if(confirmPercent)confirmPercent.textContent=action==="start"?"[ COUPÉ ]":"[ 100% ]";
    const confirmState=byId("acOperatorRedividerConfirmState406384");
    if(confirmState)confirmState.textContent=action==="start"
      ?"PAPER ONLY\n— ARRÊT —\n— AUTO A PAPER —"
      :"PAPER ONLY\n— PRÊT —\n— CHARGÉ —";
    const confirmAccept=byId("acOperatorRedividerAccept406384");
    if(confirmAccept)confirmAccept.disabled=state.action_pending||!actionAvailable;
    const confirmCancel=byId("acOperatorRedividerCancel406384");
    if(confirmCancel)confirmCancel.disabled=state.action_pending;

    root.querySelectorAll("[data-redivider-switch]").forEach(button=>{
      button.disabled=state.action_pending||!ks.available;
      button.setAttribute("aria-pressed",ks.stopped?"true":"false");
      const label=!ks.available
        ?"REDIVIDER · interrupteur Auto A Paper indisponible."
        :ks.stopped
          ?"REDIVIDER · Auto A Paper coupé · appuyez pour relancer."
          :"REDIVIDER · Auto A Paper actif · appuyez pour stopper.";
      button.setAttribute("aria-label",label);
      button.removeAttribute("title");
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

  globalThis.AgentCryptoOperatorDashboard406384=Object.freeze({
    build:BUILD,
    mount,
    render:scheduleRender,
    set_math_mode:mode=>setWingMode("math",mode),
    set_kill_mode:mode=>setWingMode("kill",mode),
    show_all:()=>{setWingMode("math","normal");setWingMode("kill","normal");return true;},
    toggle:operatorSwitch,
    stop:operatorSwitch,
    snapshot:()=>Object.freeze({
      build:BUILD,
      math_mode:state.mathMode,
      kill_mode:state.killMode,
      confirm_open:state.confirm_open,
      kill_hover_suppressed:state.kill_hover_suppressed,
      hover_kind:state.hover_kind,
      operator_stopped:state.operator_stopped,
      mounted:state.mounted,
      math_hydrated:state.math_hydrated,
      math_probe_attempts:state.math_probe_attempts,
      math:mathSnapshot(),
      kill:stopState(),
      confirm_action:state.confirm_action,
      last_stop:state.last_stop,
      last_start:state.last_start,
      error:state.last_error
    }),
    math_source:"CANONICAL_MATH_DOM",
    math_ring_contract:"CANONICAL_SCORE_PERCENT",
    kill_owner:"strategyAAutoStop / existing STOP controls",
    start_owner:"strategyAAutoStart / AgentCryptoAutoPaperRunner.start / existing START controls",
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
    confirmation_frozen_from:"40.6.363",
    redivider_hover_signal:true,
    redivider_hover_palette:"DEEP_CRIMSON",
    redivider_ready_ring:"FULL_360_DEG_WHEN_OWNER_AVAILABLE",
    redivider_ring_geometry:"CONTINUOUS_SOLID_360_NO_CONIC_SEAM",
    redivider_lighting_logic:"READY_DIM__HOVER_SOFT_CRIMSON__CONFIRM_SOFT_CRIMSON__STOPPED_MUTED__UNAVAILABLE_OFF",
    redivider_glow_profile:"TEMPERED_LOW_GLOW",
    redivider_visual_reference:"DARK_CRIMSON_NOT_NEON",
    readiness_encoded_by:"RING_FILL",
    interaction_encoded_by:"SUBTLE_LUMINANCE",
    redivider_cancel_resets_hover:true,
    shared_hover_status_line:true,
    native_redivider_tooltip:false,
    hover_status_targets:"MATH_NORMAL_MINI_RECALL + REDIVIDER_NORMAL_MINI_RECALL",
    hover_status_lines:3,
    hover_status_alignment:"CENTER",
    kill_switch_state_truth:"EXPLICIT_OPERATOR_STOP_ONLY",
    transient_auto_off_is_not_operator_stop:true,
    confirmation_ring_percent:100,
    hover_card_center_lock:true,
    hover_card_normal_width:"MATCH_WING_CLAMP",
    atlas_math_color_parity:true,
    math_value_contrast_lock:false,
    canonical_atlas_math_skin:true,
    single_redivider_status_line:true,
    redundant_redivider_status_removed:true,
    hud_text_frame:true,
    hud_text_frame_style:"RESTRAINED_ASCII_OPERATOR",
    redivider_orbit_text:true,
    redivider_orbit_geometry_css_preserved:true,
    confirmation_hud_text_frame:true,
    math_hover_hud_frame:true,
    quiet_chrome:true,
    normal_controls_hover_focus_only:true,
    kill_mini_open_hover_focus_only:true,
    hover_identity_deduplicated:true,
    redivider_tactical_frame:true,
    redivider_tactical_frame_style:"ANGULAR_CRIMSON_RESTRAINED",
    redivider_brand_bold:true,
    redivider_logic_modified:false,
    compact_normal_math:true,
    compact_normal_math_width:"clamp(268px,20.5vw,332px)",
    compact_normal_math_ring_px:94,
    mini_math_geometry_modified:false,
    canonical_inner_disc:"#0b1c30",
    canonical_ring_glow_percent:18,
    canonical_inner_inset_px:8,
    math_value_foreground:"#F7FBFF",
    math_label_foreground:"#EAF2F5",
    math_ring_keeps_canonical_tone:true,
    atlas_math_color_source:"CANONICAL_DOM_WITH_EXACT_BAND_FALLBACK",
    atlas_math_bands:"0-24 RED #FF5C78 | 25-54 ORANGE #FF9F1C | 55-74 TURQUOISE #42E8E0 | 75-100 GREEN #64EFA0",
    hover_binding_phase:"MOUNT",
    hover_normal_mode:true,
    hover_unlock:"POINTER_LEAVE",
    math_glass_alignment:true,
    math_panel_transparency:"LIGHT_GLASS",
    math_text_alignment:"CENTERED",
    confirmation_first_click:"OPEN_MODAL_ONLY",
    confirmation_second_click:"EXECUTE_EXISTING_OWNER",
    redivider_reversible_switch:true,
    explicit_resume_only:true,
    resume_replays_previous_order:false,
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
    css_authority:"SINGLE_CLEAN_REWRITE_FINAL_COCKPIT_FREEZE"
  });
})();
