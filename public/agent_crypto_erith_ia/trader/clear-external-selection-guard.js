/* Trader only. The canonical V7 handler of Vider/Reset owns the saved
   selection; this guard merely cancels the live CT request before its
   normal handler runs. No duplicate persistence, no synthetic clicks. */
(() => {
  "use strict";
  if (document.documentElement?.dataset?.agentCryptoSurface !== "trader") return;
  if (globalThis.AgentCryptoTraderClearExternalGuard) return;
  let cancellations=0;
  function handle(event) {
    if (event.isTrusted !== true) return;
    const button=event.target?.closest?.("#btnChartClear, #btnChartReset");
    if (!button || !["btnChartClear","btnChartReset"].includes(button.id)) return;
    const owner=globalThis.AgentCryptoNewListingsNativeCategory;
    const state=owner?.snapshot?.()||{};
    const external=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()||{};
    // Cancelling pending work matters as much as removing an already drawn CT.
    if (!state.selectedId && !state.pendingId && !external.active) return;
    if (typeof owner?.deactivate !== "function") return;
    // The existing button's handler subsequently owns Market empty/reset,
    // Graph Context V7 storage, and the canvas cleanup. Do not duplicate it.
    owner.deactivate({clearChart:false});
    cancellations++;
  }
  function start() { document.addEventListener("click",handle,true); }
  globalThis.AgentCryptoTraderClearExternalGuard=Object.freeze({
    snapshot:()=>Object.freeze({cancellations,owner:"canonical-V7",no_scroll:true,read_only:true}),
    real_orders:false,storage_write:false,recurring_timer:false
  });
  if (document.readyState==="loading")
    document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
