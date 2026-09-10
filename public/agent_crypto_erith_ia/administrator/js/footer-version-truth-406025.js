(() => {
  "use strict";
  const BUILD = "40.6.25";
  const MANIFEST = "../web/version.json";
  const meta = name => document.querySelector(`meta[name="${name}"]`)?.content?.trim() || "UNKNOWN";
  async function render(){
    const admin = meta("administrator-build");
    const engine = meta("atlas-engine-build");
    const footer = document.getElementById("footerRelease");
    const classic = document.getElementById("atlasClassicVersionTruth406025");
    if (footer) footer.textContent = `Agent-Crypto @erith.IA · Administrator ${admin} · Market Core ${engine} · Web Classic · vérification…`;
    try {
      const response = await fetch(MANIFEST,{cache:"no-store"});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const manifest = await response.json();
      const webBuild = String(manifest?.build || "").trim();
      const webEngine = String(manifest?.engine?.reference_build || "").trim() || engine;
      if(!webBuild) throw new Error("classic build absent");
      if(classic){
        classic.textContent = `CLASSIC ${webBuild}`;
        classic.title = `Ouvrir la Web Classique ${webBuild} · Engine ${webEngine}`;
        classic.dataset.versionTruth = "manifest";
      }
      if(footer) footer.textContent = `Agent-Crypto @erith.IA · Administrator ${admin} · Market Core ${engine} · Web Classic ${webBuild}`;
      globalThis.__AGENT_CRYPTO_FOOTER_VERSION_TRUTH_406025__ = Object.freeze({build:BUILD,administrator_build:admin,market_core:engine,classic_build:webBuild,classic_engine:webEngine,classic_source:MANIFEST,one_shot_fetch:true,recurring_timer:false,observer:false,storage_write:false});
    } catch(error) {
      if(classic){ classic.textContent="CLASSIC · version inconnue"; classic.dataset.versionTruth="unknown"; }
      if(footer) footer.textContent = `Agent-Crypto @erith.IA · Administrator ${admin} · Market Core ${engine} · Web Classic · version inconnue`;
      globalThis.__AGENT_CRYPTO_FOOTER_VERSION_TRUTH_406025__ = Object.freeze({build:BUILD,administrator_build:admin,market_core:engine,classic_build:null,classic_source:MANIFEST,error:String(error?.message||error||"unknown"),one_shot_fetch:true,recurring_timer:false,observer:false,storage_write:false});
    }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",render,{once:true}); else render();
})();
