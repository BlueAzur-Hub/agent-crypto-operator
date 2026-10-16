/* Agent-Crypto @erith.IA — Operator bridge
   Build 40.6.425 · MENU ESCAPE / CONTINUITY RECOVERY.
   ♥ VEILLE requests the native menu without pausing or destroying the canonical Aether deadline.
   Aether resumes automatically on the next canonical phase transition; Aether ATTENTION may resume the
   suspended visual phase immediately. This bridge owns no timer, visibility style, layout restart or storage. */
(() => {
  "use strict";
  const BUILD = "40.6.425";
  const BOOT_KEY = "aetherColdBoot";
  function text406425(id){return String(document.getElementById(id)?.textContent||"").replace(/\s+/g," ").trim();}
  function phaseApi(){return globalThis.ErithAether||globalThis.AgentCryptoAether||null;}
  function menuEscape406425(reason="operator-bridge"){
    const bar=document.getElementById("livecheck");if(!bar)return false;
    const api=phaseApi();let accepted=false;
    try{
      if(typeof api?.phase_menu_escape==="function")accepted=api.phase_menu_escape(reason)===true;
      else if(typeof api?.phase_hold_native==="function")accepted=api.phase_hold_native(reason)===true;
      else{window.dispatchEvent(new CustomEvent("erith:aether-native-hold",{detail:{reason}}));accepted=true;}
    }catch(_){try{window.dispatchEvent(new CustomEvent("erith:aether-native-hold",{detail:{reason}}));accepted=true;}catch(__){accepted=false;}}
    return accepted&&bar.dataset.aetherPhase==="native";
  }
  function resumeNow406425(reason="operator-bridge"){
    const bar=document.getElementById("livecheck");if(!bar||bar.dataset.aetherMenuEscape!=="1")return false;
    const api=phaseApi();let resumed=false;
    try{
      if(typeof api?.phase_resume_automatic==="function")resumed=api.phase_resume_automatic(reason)===true;
      else{window.dispatchEvent(new CustomEvent("erith:aether-native-resume",{detail:{reason}}));resumed=true;}
    }catch(_){try{window.dispatchEvent(new CustomEvent("erith:aether-native-resume",{detail:{reason}}));resumed=true;}catch(__){resumed=false;}}
    return resumed;
  }
  function bindVeilleEscape(){
    const feed=document.getElementById("atlasAetherVeille"),brand=feed?.querySelector(".atlas-aether-veille-brand");
    if(!feed||!brand||brand.dataset.aetherNativeBound==="1")return false;
    brand.dataset.aetherNativeBound="1";brand.setAttribute("role","button");brand.setAttribute("tabindex","0");
    brand.setAttribute("aria-label","Revenir au menu normal");brand.setAttribute("title","Revenir au menu normal");
    brand.style.setProperty("pointer-events","auto","important");brand.style.cursor="pointer";
    const escape=event=>{event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();menuEscape406425("veille-brand");};
    brand.addEventListener("click",escape,true);
    brand.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" ")escape(event);},true);
    const toggle=document.getElementById("atlasAetherStatusToggle");
    if(toggle&&toggle.dataset.aetherResumeBound!=="1"){
      toggle.dataset.aetherResumeBound="1";
      toggle.addEventListener("click",()=>{resumeNow406425("aether-toggle");},true);
    }
    return true;
  }
  function isColdBootEmpty(){
    const live=text406425("liveStatus"),decision=text406425("tableDecision"),source=text406425("sourceName");
    const chart=text406425("chartStatus")||text406425("analysisSummary");
    const explicitEmpty=/livecheck requis/i.test(live)||/refus[eé] avant livecheck/i.test(decision)||/aucune source consult[eé]e/i.test(source);
    const alreadyWarm=/livecheck ok|binance|coingecko|kraken|websocket|5\/5/i.test(`${live} ${decision} ${source} ${chart}`)&&!/aucune source consult[eé]e/i.test(source);
    return explicitEmpty&&!alreadyWarm;
  }
  function warmColdBootOnce406425(){
    const bar=document.getElementById("livecheck"),button=document.getElementById("btnLivecheck");
    if(!bar||!button||document.hidden||bar.dataset[BOOT_KEY]==="attempted"||!isColdBootEmpty())return false;
    bar.dataset[BOOT_KEY]="attempted";button.dataset.aetherColdBoot="1";button.click();return true;
  }
  function bind406425(){bindVeilleEscape();requestAnimationFrame(()=>requestAnimationFrame(()=>warmColdBootOnce406425()));return true;}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind406425,{once:true});else bind406425();
  globalThis.ErithAetherOperatorBridge=Object.freeze({
    build:BUILD,menuEscape:menuEscape406425,holdNative:menuEscape406425,releaseNative:resumeNow406425,
    warmColdBootOnce:warmColdBootOnce406425,canonical_phase_owner:"aether.js 40.6.425",
    direct_visibility_write:false,forced_animation_restart:false,cold_boot_attempts_max:1,
    veille_escape_persistent_until_resume_or_reload:false,veille_escape_auto_return:true,manual_cadence_pause:false,
    recurring_timer:false,observer:false,fetch_owner:false,storage_write:false,trading_state_write:false,market_algorithm_changed:false
  });
})();
