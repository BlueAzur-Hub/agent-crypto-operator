/* Agent-Crypto @erith.IA — 40.6.185 GATE LABEL NATIVE SURVIVAL
   Presentation-only readability layer for Strategy A Evidence Dossier.
   Visible standalone G1..G9 labels become GATE 1..GATE 9.
   40.6.185 hardens 40.6.184 by binding the visual normalization to the existing
   Evidence Dossier render owner, idempotently and without MutationObserver/timer.
   Internal IDs, object keys, gate numbers, certification states and business logic are untouched.
   No storage, network, exchange or order path. */
(() => {
  "use strict";

  const BUILD = "40.6.185";
  const ROOT_ID = "strategyADossier";
  const LABEL_RE = /\bG([1-9])\b/g;
  let applyCount = 0;
  let replacementCount = 0;
  let dossierHookInstalled = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;

  function normalizeText(text = "") {
    return String(text).replace(LABEL_RE, (_, n) => `GATE ${n}`);
  }

  function apply() {
    applyCount += 1;
    if (typeof document === "undefined") return { applied:false, reason:"NO_DOCUMENT" };
    const root = byId(ROOT_ID);
    if (!root) return { applied:false, reason:"DOSSIER_UNAVAILABLE", apply_count:applyCount };

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    let changed = 0;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || /^(SCRIPT|STYLE|TEXTAREA)$/i.test(parent.tagName)) continue;
      const before = node.nodeValue || "";
      const after = normalizeText(before);
      if (after !== before) {
        node.nodeValue = after;
        changed += 1;
      }
    }

    replacementCount += changed;
    root.dataset.gateLabelClarityBuild = BUILD;
    root.dataset.gateLabelClarity = "GATE_WORD_VISIBLE_ONLY";
    root.dataset.gateLabelNativeSurvival = dossierHookInstalled ? "true" : "false";
    return {
      applied: true,
      build: BUILD,
      changed_text_nodes: changed,
      apply_count: applyCount,
      replacement_count: replacementCount,
      dossier_hook_installed: dossierHookInstalled,
      internal_gate_keys_modified: false,
      ids_modified: false,
      business_logic_modified: false,
      recurring_timer: false,
      observer: false,
      storage_write: false,
      network: false,
      real_order: false,
      paper_only: true
    };
  }

  function schedule() {
    try { queueMicrotask(apply); } catch (_) { apply(); }
  }

  function installDossierHook() {
    if (dossierHookInstalled) return true;
    const api = globalThis.AgentCryptoStrategyAEvidenceDossier || null;
    if (!api || typeof api.render !== "function") return false;
    if (api.gate_label_clarity_native_survival === true) {
      dossierHookInstalled = true;
      return true;
    }

    const originalRender = api.render.bind(api);
    const wrappedRender = (...args) => {
      const result = originalRender(...args);
      /* The existing 40.6.181 supplement owner queues its mount during render.
         Queue this after it so newly mounted supplement text is normalized too. */
      queueMicrotask(schedule);
      return result;
    };

    try {
      globalThis.AgentCryptoStrategyAEvidenceDossier = Object.freeze({
        ...api,
        render: wrappedRender,
        gate_label_clarity_native_survival: true,
        gate_label_clarity_build: BUILD
      });
      dossierHookInstalled = true;
      return true;
    } catch (_) {
      return false;
    }
  }

  function boot() {
    installDossierHook();
    schedule();
  }

  globalThis.AgentCryptoStrategyAGateLabelClarity = Object.freeze({
    build: BUILD,
    owner: "strategy-a-gate-label-clarity",
    root_id: ROOT_ID,
    apply,
    normalize_text: normalizeText,
    install_dossier_hook: installDossierHook,
    snapshot: () => ({
      build: BUILD,
      root_present: !!byId(ROOT_ID),
      apply_count: applyCount,
      replacement_count: replacementCount,
      dossier_hook_installed: dossierHookInstalled,
      display_contract: "G1..G9 => GATE 1..GATE 9",
      internal_gate_keys_modified: false,
      ids_modified: false,
      business_logic_modified: false,
      recurring_timer: false,
      observer: false,
      storage_write: false,
      network: false,
      real_order: false,
      paper_only: true
    })
  });

  document.addEventListener("agent-crypto:evidence-view-refreshed", boot);
  document.addEventListener("agent-crypto:evidence-data-changed", boot);
  document.addEventListener("agent-crypto:runtime-modules-ready", boot, { once:true });
  window.addEventListener("pageshow", boot);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once:true });
    window.addEventListener("load", boot, { once:true });
  } else {
    boot();
  }
})();
