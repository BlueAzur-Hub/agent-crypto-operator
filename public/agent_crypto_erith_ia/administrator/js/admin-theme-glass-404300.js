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

/* 40.6.72 — AUTHENTICATED OWNER RELOAD MODE RECONCILIATION
   Canonical integration of validated 40.6.71 R2.
   Ctrl+F5 preserves sessionStorage. When the local owner session is already valid,
   a stale persisted Intermediate mode must not demote the authenticated owner on
   a normal reload. Explicit ?view=intermediate remains authoritative.
   One bounded localStorage reconciliation only; no auth grant, network, timer,
   observer, Market Core, Atlas CURRENT or Window Manager ownership is added. */
(() => {
  "use strict";
  const BUILD="40.6.72";
  const SOURCE_FIX="40.6.71 R2";
  const MODE_KEY="agent_crypto_erith_ia_v2_interface_mode";
  const SESSION_KEY="agent_crypto_local_access_session_v1";
  try {
    const explicitIntermediate=new URL(location.href).searchParams.get("view")==="intermediate";
    if(explicitIntermediate)return;
    if(sessionStorage.getItem(SESSION_KEY)!=="owner")return;

    if(localStorage.getItem(MODE_KEY)!=="advanced")localStorage.setItem(MODE_KEY,"advanced");

    const root=document.documentElement;
    root.dataset.atlasView="advanced";
    root.dataset.atlasMode="advanced";
    root.dataset.atlasRole="administrator";
    root.dataset.adminOwnerReloadReconcile406071R2="true";

    globalThis.ErithAdminOwnerReloadReconcile406071R2=Object.freeze({
      build:BUILD,
      source_fix:SOURCE_FIX,
      authenticated_owner_required:true,
      explicit_intermediate_preserved:true,
      mode:"advanced",
      role:"administrator",
      auth_grant_added:false,
      network:false,
      timer:false,
      observer:false,
      market_core_changed:false,
      atlas_current_changed:false,
      window_manager_changed:false
    });
  } catch (_) {}
})();
