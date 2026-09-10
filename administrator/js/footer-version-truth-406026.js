(() => {
  "use strict";
  const BUILD="40.6.26", MANIFEST="../web/version.json", SIGNATURE="Version : Parker Lewis Can't Lose";
  const meta=name=>document.querySelector(`meta[name="${name}"]`)?.content?.trim()||"UNKNOWN";
  async function render(){
    const admin=meta("administrator-build"),engine=meta("atlas-engine-build"),footer=document.getElementById("footerRelease"),classic=document.getElementById("atlasClassicVersionTruth406025");
    const base=web=>`Administrator ${admin} · Market Core ${engine} · Web Classic ${web} · ${SIGNATURE}`;
    if(footer)footer.textContent=base("vérification…");
    try{
      const response=await fetch(MANIFEST,{cache:"no-store"});if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const manifest=await response.json(),web=String(manifest?.build||"").trim(),webEngine=String(manifest?.engine?.reference_build||"").trim()||engine;if(!web)throw new Error("classic build absent");
      if(classic){classic.textContent=`CLASSIC ${web}`;classic.title=`Ouvrir la Web Classique ${web} · Engine ${webEngine}`;classic.dataset.versionTruth="manifest";}
      if(footer)footer.textContent=base(web);
      globalThis.__AGENT_CRYPTO_FOOTER_VERSION_TRUTH_406026__=Object.freeze({build:BUILD,administrator_build:admin,market_core:engine,classic_build:web,classic_engine:webEngine,signature:SIGNATURE,one_shot_fetch:true,recurring_timer:false,observer:false,storage_write:false});
    }catch(error){
      if(classic){classic.textContent="CLASSIC · version inconnue";classic.dataset.versionTruth="unknown";}
      if(footer)footer.textContent=base("version inconnue");
      globalThis.__AGENT_CRYPTO_FOOTER_VERSION_TRUTH_406026__=Object.freeze({build:BUILD,administrator_build:admin,market_core:engine,classic_build:null,signature:SIGNATURE,error:String(error?.message||error||"unknown"),one_shot_fetch:true,recurring_timer:false,observer:false,storage_write:false});
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();
})();
