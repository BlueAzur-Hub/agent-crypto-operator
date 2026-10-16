/* Agent-Crypto Administrator — pedagogical surface build labels.
   Stable filename. Build truth is read from the canonical runtime authority. */
(() => {
  "use strict";

  const OWNER = "pedagogy-version-truth";
  const PEDAGOGY_RE = /Parcours pédagogique 28\.3\.44 actif · Interface \d+\.\d+\.\d+/g;

  const currentBuild = () => String(
    globalThis.ErithVersionTruth?.build ||
    globalThis.AgentCryptoBootTruth?.build ||
    document.querySelector('meta[name="administrator-build"]')?.content ||
    "UNKNOWN"
  ).trim();

  const expected = () => /^\d+\.\d+\.\d+$/.test(currentBuild())
    ? `Parcours pédagogique 28.3.44 actif · Interface ${currentBuild()}`
    : "";

  function normalizeText(value) {
    const label = expected();
    if (!label || typeof value !== "string" || !value.includes("Parcours pédagogique 28.3.44 actif · Interface")) return value;
    return value.replace(PEDAGOGY_RE, label);
  }

  function reconcile(root = document.body) {
    const label = expected();
    if (!root || !label) return Object.freeze({ owner: OWNER, build: currentBuild(), matches: 0, changed: 0 });
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let matches = 0;
    let changed = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const current = String(node.nodeValue || "");
      if (!current.includes("Parcours pédagogique 28.3.44 actif · Interface")) continue;
      matches += 1;
      const next = normalizeText(current);
      if (next !== current) {
        node.nodeValue = next;
        changed += 1;
      }
    }
    document.documentElement.dataset.pedagogyVersionTruth = matches ? "active" : "not-found";
    return Object.freeze({ owner: OWNER, build: currentBuild(), matches, changed });
  }

  const run = () => { try { reconcile(); } catch (_) {} };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else queueMicrotask(run);
  window.addEventListener("erith:system-hydrated", run, { once: true, passive: true });
  window.addEventListener("load", run, { once: true, passive: true });

  globalThis.AgentCryptoPedagogyVersionTruth = Object.freeze({
    owner: OWNER,
    build: currentBuild,
    expected,
    reconcile,
    normalizeText,
    recurring_timer: false,
    observer: false,
    network_owner: false,
    storage_write: false,
    trading: false,
    wallet: false
  });
})();
