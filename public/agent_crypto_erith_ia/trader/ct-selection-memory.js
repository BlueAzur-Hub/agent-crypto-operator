/* ERITH.IA — Trader CT replay from canonical Graph Context V7.
   The trusted operator click writes the existing IndexedDB V7 row elsewhere.
   This module only reads intent and loads genuine public OKX data.
   No extra localStorage owner, timer, observer, order or private data. */
(()=>{
"use strict";
if(document.documentElement?.dataset?.agentCryptoSurface!=="trader")return;
if(globalThis.AgentCryptoTraderCtSelectionMemory)return;
const ID="concrete",PAIR="CT-USDT";
const owner=()=>globalThis.AgentCryptoNewListingsNativeCategory;
const exchange=()=>globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()||null;
const line=()=>globalThis.AtlasExternalChart?.state?.()||{};
const intent=()=>{
  try{return typeof atlasTraderExternalSelectionRead==="function"
    ?atlasTraderExternalSelectionRead():null;}catch(_){return null;}
};
let attempted=false,restoring=false,restored=false,lastError=null;
function isLine(){
  const ext=exchange(),graph=line();
  return !!(ext?.active&&ext?.id===ID&&ext.provider==="okx"
    &&ext.providerSymbol===PAIR&&ext.nativeMarket===true
    &&graph.active&&graph.coin_id===ID&&Number(graph.period)===1
    &&!graph.loading&&!graph.error);
}
function status(message,error=false){
  let el=document.getElementById("traderCtRestoreState");
  if(!el){
    const host=document.querySelector("#analyste .chart-v2-control-deck")
      ||document.querySelector("#analyste .chart-v2-toolbar-reading");
    if(!host)return;
    el=document.createElement("span");
    el.id="traderCtRestoreState";
    el.setAttribute("role","status");
    el.style.cssText="display:inline-flex;align-items:center;max-width:290px;padding:4px 8px;margin-left:6px;border-radius:7px;border:1px solid #427b88;background:#092733;color:#b6eff3;font:600 11px/1.3 system-ui,sans-serif";
    host.appendChild(el);
  }
  el.textContent=message;
  el.hidden=!message;
  el.style.color=error?"#ffce98":"#b6eff3";
}
function canonicalReady(){
  try{return document.documentElement?.dataset?.atlasGraphBootPhase==="ready"
    &&typeof atlasWorkspaceRestored!=="undefined"
    &&atlasWorkspaceRestored===true;}catch(_){return false;}
}
async function restore(){
  if(!intent()||attempted||restoring||!canonicalReady()
      ||document.visibilityState==="hidden")return false;
  if(isLine()){restored=true;status("");return true;}
  if(exchange()?.active&&exchange()?.id!==ID)return false;
  const api=owner();
  if(typeof api?.selectById!=="function"){
    lastError="Propriétaire Nouveaux listings non disponible";
    status("CT · "+lastError,true);
    return false;
  }
  attempted=true;restoring=true;
  status("CT · lecture de la courbe réelle OKX en cours…");
  try{
    const ok=await api.selectById(ID);
    if(!intent())return false;
    if(ok&&isLine()){restored=true;lastError=null;status("");return true;}
    lastError=String(api.snapshot?.()?.lastError||"Courbe Ligne non publiée");
    status("CT · "+lastError+" · nouvelle sélection manuelle possible",true);
    return false;
  }catch(error){
    if(intent()){lastError=String(error?.message||error);status("CT · "+lastError,true);}
    return false;
  }finally{restoring=false;}
}
function boot(){
  if(!intent())return;
  if(isLine()){restored=true;status("");return;}
  if(canonicalReady())void restore();
}
window.addEventListener("agent-crypto:graph-context-ready",boot,{passive:true});
window.addEventListener("agent-crypto:workspace-restored",boot,{passive:true});
window.addEventListener("pageshow",boot,{passive:true});
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible")boot();
},{passive:true});
window.addEventListener("agent-crypto:new-listing-line-ready",event=>{
  if(event?.detail?.id===ID&&intent()&&isLine()){
    restored=true;lastError=null;status("");
  }
},{passive:true});
window.addEventListener("agent-crypto:external-asset-changed",event=>{
  if(event?.detail?.reason==="operator-return-market"&&!intent()){
    restored=false;status("");
  }
},{passive:true});
globalThis.AgentCryptoTraderCtSelectionMemory=Object.freeze({
  snapshot:()=>Object.freeze({
    selected:isLine(),saved:!!intent(),restoring,restored,attempts:attempted?1:0,
    lineReady:isLine(),lastError,identity:intent()?.instrument||null,
    backend:"Graph Context V7 / IndexedDB"
  }),
  restore,clear:()=>globalThis.atlasTraderExternalSelectionClear?.()||false,
  read_only:true,real_orders:false,canonical_line_owner:true,
  canonical_workspace_top250_untouched:true,stores_identity_only:true
});
boot();
})();