/* Agent-Crypto 40.4.300 — Glass theme switch. Presentation only. */
(() => {
  "use strict";
  const BUILD="40.4.300",KEY="agent_crypto_erith_ia_admin_surface_theme_v1",ALLOWED=new Set(["metal","glass"]);
  function read(){try{const v=localStorage.getItem(KEY);return ALLOWED.has(v)?v:"metal";}catch(_){return "metal";}}
  function apply(theme,{persist=true}={}){const value=ALLOWED.has(theme)?theme:"metal";document.documentElement.dataset.adminTheme=value;if(persist){try{localStorage.setItem(KEY,value);}catch(_){}}const b=document.getElementById("atlasThemeGlassToggle404300");if(b){const glass=value==="glass";b.setAttribute("aria-pressed",glass?"true":"false");b.textContent=glass?"THÈME · GLASS":"THÈME · METAL";b.title=glass?"Revenir au thème Metal":"Activer le thème Glass transparent";}return value;}
  function toggle(){return apply(read()==="glass"?"metal":"glass");}
  function install(){try{document.documentElement.dataset.glassCompositor=/firefox\//i.test(String(navigator.userAgent||""))?"firefox-safe":"standard";}catch(_){}const b=document.getElementById("atlasThemeGlassToggle404300");if(b&&!b.dataset.bound404300){b.dataset.bound404300="1";b.addEventListener("click",toggle);}apply(read(),{persist:false});}
  const api=Object.freeze({build:BUILD,read,apply,toggle,storage_key:KEY,presentation_only:true,business_logic_changed:false,window_manager_changed:false,market_core_changed:false,network:false,timer:false,observer:false});globalThis.AgentCryptoAdminGlassTheme404300=api;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
})();
