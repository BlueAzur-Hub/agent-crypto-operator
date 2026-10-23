/* ERITH.IA · Market -> Radar selection mirror (public, read-only).
 * Administrator is the only Market/graph owner. No quote mutation, fetch,
 * polling, storage, order or synthetic UI events.
 */
(()=>{
 "use strict";
 const global=globalThis;
 if(global.AgentCryptoMarketRadarSelectionSync)return;

 function selectedMarketIdentity(){
  // The external Spot graph is an independent identity; do not overwrite it
  // with the previous primary row kept in Administrator's Market.
  if(global.AtlasExternalChart?.state?.()?.active===true)return null;
  const panel=document.getElementById("marketSnapshotPanel");
  const row=panel?.querySelector('tr[data-id].is-selected[aria-selected="true"]');
  const id=String(row?.dataset?.id||"").trim();
  if(!id)return null;
  const coin=global.AtlasMarketUniverse1000?.find?.(id);
  if(!coin||String(coin.id)!==id||!coin.symbol)return null;
  const verified=global.AgentCryptoCommands?.asset?.(id);
  if(verified?.ok!==true||String(verified.payload?.id||"")!==id)return null;
  return Object.freeze({kind:"market",id,symbol:String(coin.symbol).toUpperCase()});
 }

 function sync(force=false){
  const selected=selectedMarketIdentity();
  if(!selected)return false;
  let updated=false;
  for(const root of document.querySelectorAll('[data-radar-native-mounted="1"]')){
   const model=root.radarModel;
   if(!model||(!force&&model.activeIdentity?.kind==="listing"))continue;
   model.activeIdentity={kind:selected.kind,id:selected.id};
   for(const row of root.querySelectorAll(".radar-native-selectable")){
    const active=row.dataset.radarKind==="market"&&row.dataset.radarId===selected.id;
    row.classList.toggle("is-selected",active);
    row.setAttribute("aria-selected",String(active));
   }
   updated=true;
  }
  return updated;
 }

 const inMarket=target=>{
  const node=target?.closest?.("#marketSnapshotPanel");
  return !!node&&node.id==="marketSnapshotPanel";
 };
 function afterMarketAction(event){
  if(!inMarket(event.target))return;
  // Only a native Market table action can change the canonical selection.
  // Clicks inside the Radar itself must keep their own Spot/graph intent.
  const control=event.target?.closest?.("tr[data-id], [data-market-action]");
  if(!control)return;
  // The existing delegated Market handler finishes before this read.
  global.requestAnimationFrame?.(()=>sync(true));
 }
 document.addEventListener("click",afterMarketAction,{passive:true});
 document.addEventListener("keydown",event=>{
  if(event.key==="Enter"||event.key===" ")afterMarketAction(event);
 },{passive:true});
 global.addEventListener?.("agent-crypto:graph-context-ready",()=>sync(),{passive:true});
 global.addEventListener?.("agent-crypto:workspace-restored",()=>sync(),{passive:true});
 global.AgentCryptoMarketRadarSelectionSync=Object.freeze({
  sync,
  owner:"administrator-market",
  scope:"public-top250-identity-only",
  no_quote_mutation:true,
  no_graph_owner:true,
  no_fetch:true,
  no_polling:true,
  no_orders:true
 });
 sync();
})();
