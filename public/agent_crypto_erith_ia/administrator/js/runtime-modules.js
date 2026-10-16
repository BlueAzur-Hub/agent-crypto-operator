/* Agent-Crypto Administrator — canonical runtime module registry.
   Stable filenames only. Release history belongs to Git and build.json; module
   selection never branches on a release number. */
(() => {
  "use strict";

  if (globalThis.AgentCryptoRuntimeModules) return;

  const MODULES = Object.freeze([
    "./js/views/private-source-demand-loader.js",
    "./js/generated-report-version-truth.js",
    "./js/pedagogy-version-truth.js",
    "./js/local-ai-contract-consistency.js",
    "./js/tradus-strategy-a-reconcile.js",
    "./js/dex-freshness-guard.js",
    "./js/local-dialogue-presentation.js",
    "./js/local-ai-ux-clarity.js",
    "./js/memory-boundary-presentation.js",
    "./js/auto-reader-presentation.js",
    "./js/analysis-subsection-presentation.js",
    "./js/retrospective-history-presentation.js",
    "./js/current-final-state-rebind.js",
    "./js/tradus-canonical-strategy-reader.js",
    "./js/strategy-a-auto-start.js",
    "./js/strategy-a-paper-v2-proof-bridge.js",
    "./js/strategy-a-evidence-gate-audit.js",
    "./js/strategy-a-evidence-gate-audit-anchor-repair.js",
    "./js/strategy-a-evidence-lifecycle-truth.js",
    "./js/strategy-a-foundation-applicability-truth.js",
    "./js/strategy-a-time-semantics-truth.js",
    "./js/strategy-a-g3-structured-data-truth.js",
    "./js/strategy-a-g3-history-owner-discovery.js",
    "./js/strategy-a-g3-historical-evidence-adapter.js",
    "./js/strategy-a-gate-canonical-truth.js",
    "./js/tradus-autonomous-refresh.js"
  ]);

  const loaded = new Set();
  let loading = null;

  function absolute(src) { return new URL(src, document.baseURI).href; }
  function alreadyPresent(src) {
    const wanted = absolute(src).split("?")[0];
    return Array.from(document.scripts).some(script => {
      try { return script.src && new URL(script.src, document.baseURI).href.split("?")[0] === wanted; }
      catch (_) { return false; }
    });
  }
  function loadOne(src) {
    if (loaded.has(src) || alreadyPresent(src)) { loaded.add(src); return Promise.resolve(src); }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const url = new URL(src, document.baseURI);
      url.searchParams.set("reload", String(Date.now()));
      script.src = url.href; script.async = false; script.dataset.agentCryptoRuntimeModule = src;
      script.addEventListener("load", () => { loaded.add(src); resolve(src); }, { once: true });
      script.addEventListener("error", () => reject(new Error(`runtime module failed: ${src}`)), { once: true });
      document.head.appendChild(script);
    });
  }
  async function load() {
    if (loading) return loading;
    loading = (async () => {
      for (const src of MODULES) await loadOne(src);
      try { document.dispatchEvent(new CustomEvent("agent-crypto:runtime-modules-ready", { detail: { modules: MODULES.slice() } })); } catch (_) {}
      return MODULES.slice();
    })();
    try { return await loading; } finally { loading = null; }
  }
  globalThis.AgentCryptoRuntimeModules = Object.freeze({ modules: MODULES, load, loaded: () => Object.freeze(Array.from(loaded)), version_branching: false, versioned_filenames: false, owner: "runtime-modules" });
})();