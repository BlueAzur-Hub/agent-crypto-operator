/* Agent-Crypto @erith.IA — 40.4.212
   ATLAS HEARTBEAT · BOOT-COMPLETE ONE-SHOT REARM
   Reuses the canonical 40.4.137 pending-CURRENT owner after the full page
   reaches load. No timer, observer, fetch, WebSocket, storage owner or
   duplicate scheduler is introduced. Existing authorization, device-role,
   readiness, same-snapshot and CLOSED-CURRENT gates remain authoritative. */
(() => {
  "use strict";
  const BUILD = "40.4.212";
  let autoAttempted = false;
  let last = Object.freeze({state:"NOT_RUN", reason:"", result:false});

  const callBool = (name) => {
    try { return typeof globalThis[name] === "function" ? Boolean(globalThis[name]()) : null; }
    catch (_) { return null; }
  };
  const callText = (name) => {
    try { return typeof globalThis[name] === "function" ? String(globalThis[name]() || "").trim() : ""; }
    catch (_) { return ""; }
  };
  function inspect() {
    return Object.freeze({
      build: BUILD,
      compute_allowed: callBool("atlasDeviceComputeAllowed"),
      authorized: callBool("atlasAccessIsAuthorized"),
      busy: callBool("atlasAutomation341IsBusy"),
      current_id: callText("atlasAutomation341SnapshotId"),
      pending_id: callText("atlasAutomation341ReadPendingMarket"),
      last_done_id: callText("atlasAutomation341ReadLastCurrentMarketId"),
      pending_owner_available: typeof globalThis.atlasCurrentPendingMarket137 === "function",
      bridge_rearm_owner_available: typeof globalThis.atlasCurrentPendingAutoKick4051 === "function"
    });
  }
  function classify(before, result, error) {
    if (error) return "ERROR";
    if (before.compute_allowed === false) return "BLOCKED_DEVICE_ROLE";
    if (before.authorized === false) return "BLOCKED_AUTH";
    if (!before.pending_owner_available && !before.bridge_rearm_owner_available) return "OWNER_MISSING";
    if (before.busy === true) return "BUSY";
    if (before.current_id && before.current_id === before.last_done_id) return "REST_SAME_CURRENT";
    if (!before.current_id && !before.pending_id) return "WAITING_CANONICAL";
    if (result) return "REARMED";
    return "WAITING_READINESS";
  }
  function publish(state) {
    try {
      document.documentElement.dataset.atlasHeartbeat404212 = state.state.toLowerCase();
      document.documentElement.dataset.atlasHeartbeatBuild = BUILD;
    } catch (_) {}
  }
  function rearm(reason = "manual") {
    const before = inspect();
    let result = false, error = "";
    try {
      if (typeof globalThis.atlasCurrentPendingMarket137 === "function") {
        result = Boolean(globalThis.atlasCurrentPendingMarket137(`heartbeat-${String(reason || "manual")}`));
      } else if (typeof globalThis.atlasCurrentPendingAutoKick4051 === "function") {
        result = Boolean(globalThis.atlasCurrentPendingAutoKick4051(`heartbeat-${String(reason || "manual")}`));
      }
    } catch (exc) { error = String(exc?.message || exc || "unknown"); }
    last = Object.freeze({build:BUILD,state:classify(before,result,error),reason:String(reason||"manual"),result,error,before,after:inspect()});
    publish(last);
    try { document.dispatchEvent(new CustomEvent("erith:atlas-heartbeat", {detail:last})); } catch (_) {}
    return result;
  }
  function autoRearm() {
    if (autoAttempted) return;
    autoAttempted = true;
    queueMicrotask(() => rearm("boot-complete"));
  }
  if (document.readyState === "complete") autoRearm();
  else window.addEventListener("load", autoRearm, {once:true});

  globalThis.ErithAtlasHeartbeat404212 = Object.freeze({
    build:BUILD,
    strategy:"boot-complete-one-shot-canonical-rearm",
    canonical_pending_owner:"atlasCurrentPendingMarket137",
    fallback_existing_owner:"atlasCurrentPendingAutoKick4051",
    ui_disclosure_dependency:false,
    new_timer:false,
    new_observer:false,
    new_fetch:false,
    new_websocket:false,
    new_storage_owner:false,
    new_scheduler:false,
    inspect,
    rearm,
    last:()=>last
  });
})();
