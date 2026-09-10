/* Agent-Crypto @erith.IA — Operator bridge
   Build 40.6.2 · COLD BOOT WARM START + VEILLE NATIVE HOLD.
   Reuses the existing Livecheck button exactly once on an empty cold boot.
   VEILLE can escape to the native operator row and stays there until Aether is reopened or the page reloads.
   No recurring timer, observer, fetch owner, storage write, trading state or market algorithm is added. */
(() => {
  "use strict";

  const BUILD = "40.6.2";
  const HOLD_KEY = "aetherManualNative406002";
  const BOOT_KEY = "aetherColdBoot406002";
  const NATIVE_IDS = ["btnLivecheck", "btnRefresh", "decisionCard", "sourceActiveCard", "sourceTimeCard"];
  const AETHER_IDS = ["atlasAetherRibbon4084", "atlasAetherVeille4087", "atlasAetherSystem4086"];

  function text406002(id) {
    return String(document.getElementById(id)?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function nativeNodes406002() {
    return NATIVE_IDS.map(id => document.getElementById(id)).filter(Boolean);
  }

  function aetherNodes406002() {
    return AETHER_IDS.map(id => document.getElementById(id)).filter(Boolean);
  }

  function setImportant406002(node, name, value) {
    if (node) node.style.setProperty(name, value, "important");
  }

  function clearManualVisibility406002(node) {
    if (!node) return;
    for (const name of ["animation", "opacity", "visibility", "pointer-events"]) node.style.removeProperty(name);
  }

  function holdNative406002() {
    const bar = document.getElementById("livecheck");
    if (!bar) return false;

    for (const node of nativeNodes406002()) {
      setImportant406002(node, "animation", "none");
      setImportant406002(node, "opacity", "1");
      setImportant406002(node, "visibility", "visible");
      setImportant406002(node, "pointer-events", "auto");
    }
    for (const node of aetherNodes406002()) {
      setImportant406002(node, "animation", "none");
      setImportant406002(node, "opacity", "0");
      setImportant406002(node, "visibility", "hidden");
      setImportant406002(node, "pointer-events", "none");
    }

    bar.dataset[HOLD_KEY] = "native";
    return true;
  }

  function releaseNative406002() {
    const bar = document.getElementById("livecheck");
    if (!bar) return false;
    for (const node of [...nativeNodes406002(), ...aetherNodes406002()]) clearManualVisibility406002(node);
    delete bar.dataset[HOLD_KEY];
    // Restoring the CSS animation property restarts the existing canonical phase owner.
    void bar.offsetWidth;
    return true;
  }

  function bindVeilleEscape406002() {
    const feed = document.getElementById("atlasAetherVeille4087");
    const brand = feed?.querySelector(".atlas-aether-veille-brand-4087");
    if (!feed || !brand || brand.dataset.aetherNativeBound406002 === "1") return false;

    brand.dataset.aetherNativeBound406002 = "1";
    brand.setAttribute("role", "button");
    brand.setAttribute("tabindex", "0");
    brand.setAttribute("aria-label", "Revenir au menu normal");
    brand.setAttribute("title", "Revenir au menu normal");
    setImportant406002(brand, "pointer-events", "auto");
    brand.style.cursor = "pointer";

    const escape = event => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      holdNative406002();
    };

    brand.addEventListener("click", escape, true);
    brand.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") escape(event);
    }, true);

    const aetherToggle = document.getElementById("atlasAetherStatusToggle4084");
    if (aetherToggle && aetherToggle.dataset.aetherResumeBound406002 !== "1") {
      aetherToggle.dataset.aetherResumeBound406002 = "1";
      aetherToggle.addEventListener("click", () => {
        if (document.getElementById("livecheck")?.dataset?.[HOLD_KEY] === "native") releaseNative406002();
      }, true);
    }
    return true;
  }

  function isColdBootEmpty406002() {
    const live = text406002("liveStatus");
    const decision = text406002("tableDecision");
    const source = text406002("sourceName");
    const chart = text406002("chartStatus") || text406002("analysisSummary");

    const explicitEmpty = /livecheck requis/i.test(live)
      || /refus[eé] avant livecheck/i.test(decision)
      || /aucune source consult[eé]e/i.test(source);

    const alreadyWarm = /livecheck ok|binance|coingecko|kraken|websocket|5\/5/i.test(`${live} ${decision} ${source} ${chart}`)
      && !/aucune source consult[eé]e/i.test(source);

    return explicitEmpty && !alreadyWarm;
  }

  function warmColdBootOnce406002() {
    const bar = document.getElementById("livecheck");
    const button = document.getElementById("btnLivecheck");
    if (!bar || !button || document.hidden) return false;
    if (bar.dataset[BOOT_KEY] === "attempted") return false;
    if (!isColdBootEmpty406002()) return false;

    // One attempt only. The canonical button remains the sole business/network owner.
    bar.dataset[BOOT_KEY] = "attempted";
    button.dataset.aetherColdBoot406002 = "1";
    button.click();
    return true;
  }

  function bind406002() {
    bindVeilleEscape406002();
    // DOMContentLoaded fires only after the existing synchronous scripts have executed.
    // Two paint turns let their canonical listeners settle without adding a timer/retry loop.
    requestAnimationFrame(() => requestAnimationFrame(() => warmColdBootOnce406002()));
    return true;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind406002, { once: true });
  else bind406002();

  globalThis.ErithAetherOperatorBridge406002 = Object.freeze({
    build: BUILD,
    holdNative: holdNative406002,
    releaseNative: releaseNative406002,
    warmColdBootOnce: warmColdBootOnce406002,
    canonical_livecheck_owner_reused: true,
    cold_boot_attempts_max: 1,
    veille_escape_persistent_until_resume_or_reload: true,
    recurring_timer: false,
    observer: false,
    fetch_owner: false,
    storage_write: false,
    trading_state_write: false,
    market_algorithm_changed: false
  });
})();
