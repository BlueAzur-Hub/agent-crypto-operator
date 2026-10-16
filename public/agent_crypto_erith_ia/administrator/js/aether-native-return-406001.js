/* Agent-Crypto @erith.IA — Aether VEILLE native-row return bridge
   Build 40.6.1 · interaction only.
   Runtime owner remains js/aether.js; presentation owner remains admin-ribbons.css.
   No timer, observer, fetch, storage write or business-state mutation is added. */
(() => {
  "use strict";
  const BUILD = "40.6.1";
  const RETURN_ATTR = "aetherNativeReturn406001";

  function phaseNodes(bar){
    const ids = [
      "btnLivecheck","btnRefresh","decisionCard","sourceActiveCard","sourceTimeCard",
      "atlasAetherRibbon","atlasAetherRibbonMarket","atlasAetherRibbonAtlas",
      "atlasAetherRibbonOracle","atlasAetherRibbonSources","atlasAetherRibbonBook",
      "atlasAetherVeille","atlasAetherSystem"
    ];
    const nodes = ids.map(id => document.getElementById(id)).filter(Boolean);
    const brand = bar?.querySelector("#atlasAetherRibbon .atlas-aether-ribbon-brand");
    if(brand) nodes.push(brand);
    return [...new Set(nodes)];
  }

  function returnNative406001(){
    const bar = document.getElementById("livecheck");
    if(!bar) return false;
    const nativeIds = new Set(["btnLivecheck","btnRefresh","decisionCard","sourceActiveCard","sourceTimeCard"]);
    const nodes = phaseNodes(bar);

    // One-frame restart of the EXISTING 270 s CSS phase owner. This does not create
    // a second cadence: it only returns that owner to its 0% NORMAL state.
    for(const node of nodes){
      node.style.setProperty("animation","none","important");
      if(nativeIds.has(node.id)){
        node.style.setProperty("opacity","1","important");
        node.style.setProperty("visibility","visible","important");
      }else{
        node.style.setProperty("opacity","0","important");
        node.style.setProperty("visibility","hidden","important");
      }
    }
    bar.dataset[RETURN_ATTR] = "native";
    void bar.offsetWidth;
    requestAnimationFrame(() => {
      for(const node of nodes){
        node.style.removeProperty("animation");
        node.style.removeProperty("opacity");
        node.style.removeProperty("visibility");
      }
      bar.dataset[RETURN_ATTR] = "cycle-restarted";
    });
    return true;
  }

  function bind406001(){
    const feed = document.getElementById("atlasAetherVeille");
    const brand = feed?.querySelector(".atlas-aether-veille-brand");
    if(!feed || !brand || brand.dataset.aetherNativeReturnBound === "1") return false;
    brand.dataset.aetherNativeReturnBound = "1";
    brand.setAttribute("role","button");
    brand.setAttribute("tabindex","0");
    brand.setAttribute("aria-label","Revenir au menu normal");
    brand.setAttribute("title","Revenir au menu normal");
    // Interaction affordance only; no visual layout/geometry ownership is moved from admin-ribbons.css.
    brand.style.setProperty("pointer-events","auto","important");
    brand.style.setProperty("cursor","pointer","important");

    const activate = event => {
      event.preventDefault();
      event.stopPropagation();
      returnNative406001();
    };
    brand.addEventListener("click", activate);
    brand.addEventListener("keydown", event => {
      if(event.key === "Enter" || event.key === " ") activate(event);
    });
    return true;
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind406001, {once:true});
  else bind406001();

  globalThis.ErithAetherNativeReturn = Object.freeze({
    build: BUILD,
    bind: bind406001,
    returnNative: returnNative406001,
    target: "♥ VEILLE",
    native_row: "Relancer · Rafraîchir · Décision · Sources · Chronos",
    existing_phase_owner_restarted: true,
    new_timer: false,
    new_observer: false,
    new_fetch: false,
    storage_write: false,
    business_state_write: false
  });
})();
