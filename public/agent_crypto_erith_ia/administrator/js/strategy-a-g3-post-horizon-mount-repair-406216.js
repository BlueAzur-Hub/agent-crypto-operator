/* Agent-Crypto @erith.IA — 40.6.216 G3 POST-HORIZON MOUNT REPAIR
   Terrain 40.6.215 proved the post-horizon owner was loaded canonically but its panel
   was absent from the exported dossier. This repair owns only stable mounting/receipt:
   it calls the existing read-only outcome owner when the Evidence host is available,
   leaves an explicit waiting placeholder instead of disappearing silently, and binds
   only to existing lifecycle/operator events. No timer, observer, storage, network,
   Strategy A mutation, Gate promotion or real order path is added. */
(() => {
  "use strict";

  const BUILD = "40.6.216";
  const HOST_ID = "strategyAEvidenceSupplements";
  const ROOT_ID = "strategyAG3PostHorizonOutcome";
  const OVERLAP_ID = "strategyAG3T0WindowOverlapProof";
  let queued = false;
  let mountCount = 0;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const owner = () => globalThis.AgentCryptoStrategyAG3PostHorizonOutcome || null;

  function ensurePlaceholder(host) {
    let root = byId(ROOT_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = ROOT_ID;
      root.dataset.mountRepairPlaceholder = "true";
      root.style.cssText = "margin-top:10px;padding:10px;border:1px dashed rgba(133,232,255,.28);border-radius:10px;background:rgba(7,24,34,.34);color:#9bb8c3;font:800 10px/1.45 system-ui,sans-serif";
      root.innerHTML = `<b style="color:#8cefff">G3 · RÉSULTATS APRÈS DÉCISION · ${BUILD}</b><div style="margin-top:4px">MODULE EN ATTENTE · le panneau restera visible jusqu’au rendu du propriétaire post-horizon.</div>`;
    }
    const overlap = byId(OVERLAP_ID);
    if (overlap?.parentElement === host && overlap.nextElementSibling !== root) overlap.insertAdjacentElement("afterend", root);
    else if (root.parentElement !== host) host.appendChild(root);
    return root;
  }

  function mount(reason = "explicit") {
    mountCount += 1;
    if (typeof document === "undefined") return {mounted:false,reason:"NO_DOCUMENT",mount_count:mountCount};
    const host = byId(HOST_ID);
    if (!host) return {mounted:false,reason:"EVIDENCE_HOST_UNAVAILABLE",mount_count:mountCount};

    let root = ensurePlaceholder(host);
    const api = owner();
    let ownerCalled = false;
    if (typeof api?.render === "function") {
      try { api.render(); ownerCalled = true; } catch (_) {}
    }

    root = byId(ROOT_ID) || root;
    if (root?.parentElement !== host) {
      const overlap = byId(OVERLAP_ID);
      if (overlap?.parentElement === host) overlap.insertAdjacentElement("afterend", root);
      else host.appendChild(root);
    }
    if (root) {
      root.dataset.mountRepairBuild = BUILD;
      root.dataset.mountRepairReason = String(reason || "explicit");
      const waiting = /MODULE EN ATTENTE/i.test(String(root.textContent || ""));
      root.dataset.mountRepairHydrated = waiting ? "false" : "true";
      if (!waiting) delete root.dataset.mountRepairPlaceholder;
    }

    const hydrated = !!root && !/MODULE EN ATTENTE/i.test(String(root.textContent || ""));
    try {
      document.dispatchEvent(new CustomEvent("agent-crypto:g3-post-horizon-mounted", {
        detail:{build:BUILD,reason:String(reason||"explicit"),owner_called:ownerCalled,hydrated,mount_count:mountCount}
      }));
    } catch (_) {}
    return {mounted:true,owner_called:ownerCalled,hydrated,mount_count:mountCount,root_parent:root?.parentElement?.id||null};
  }

  function schedule(reason = "event") {
    if (queued) return;
    queued = true;
    const run = () => { queued = false; mount(reason); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  function snapshot() {
    const root = byId(ROOT_ID);
    const host = byId(HOST_ID);
    return Object.freeze({
      build: BUILD,
      owner_available: typeof owner()?.render === "function",
      host_present: !!host,
      root_present: !!root,
      stable_parent: !!root && root.parentElement === host,
      hydrated: !!root && !/MODULE EN ATTENTE/i.test(String(root.textContent || "")),
      mount_count: mountCount,
      recurring_timer:false,
      observer:false,
      storage_write:false,
      business_network_request:false,
      gate_promotion:false,
      real_order:false,
      paper_only:true,
      g3:"PENDING",
      g9:"LOCKED"
    });
  }

  globalThis.AgentCryptoStrategyAG3PostHorizonMountRepair = Object.freeze({
    build:BUILD, mount, schedule, snapshot,
    host_id:HOST_ID, root_id:ROOT_ID,
    recurring_timer:false, observer:false, storage_write:false,
    business_network_request:false, gate_promotion:false, real_order:false,
    paper_only:true, g3:"PENDING", g9:"LOCKED"
  });

  if (typeof document !== "undefined") {
    document.addEventListener("agent-crypto:evidence-data-changed", () => schedule("evidence-data-changed"));
    document.addEventListener("agent-crypto:evidence-refresh-complete", () => schedule("evidence-refresh-complete"));
    document.addEventListener("agent-crypto:market-series-updated", () => schedule("market-series-updated"));
    document.addEventListener("agent-crypto:runtime-modules-ready", () => schedule("runtime-modules-ready"), {once:true});
    document.addEventListener("erith:system-hydrated", () => schedule("system-hydrated"), {passive:true});
    document.addEventListener("click", event => {
      const b = event?.target?.closest?.("button");
      if (b && /rafraîchir\s+marché|actualiser\s+preuves/i.test(String(b.textContent || ""))) schedule("operator-refresh");
    }, false);
    window.addEventListener("pageshow", () => schedule("pageshow"));
    window.addEventListener("load", () => schedule("load"), {once:true});
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => schedule("dom-ready"), {once:true});
    else schedule("script-load");
  }
})();
