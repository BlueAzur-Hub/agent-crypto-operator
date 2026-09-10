/* Agent-Crypto @erith.IA — 40.4.20
   PROJECT @ERITH.IA TRUE BODY LAZY HYDRATION / WINDOW MANAGER SHELL PARITY LOCK
   The Missions hero + five top-level <details> shells are parser-mounted so canonical
   layout, role visibility and Window Manager ownership remain available at boot.
   Heavy project bodies are read from views/projects.html only when their own disclosure
   is opened. One same-origin static fetch is shared and cached in memory for the session.
   No timer, observer, engine duplication, storage write or business-state mutation. */
(()=>{
  "use strict";
  const BUILD="40.4.20";
  const SOURCE="./views/projects.html";
  const host=document.getElementById("projects-view-host");
  if(!host)return;
  const shellHtml="<section aria-labelledby=\"missions-vie-title\" class=\"life-missions-intro glass\" id=\"missions-vie\">\n<img alt=\"\" aria-hidden=\"true\" class=\"life-missions-atmosphere\" decoding=\"async\" fetchpriority=\"low\" height=\"768\" loading=\"lazy\" src=\"./assets/images/missions_de_vie_constellation_bg.png\" width=\"2048\"/>\n<div class=\"life-missions-copy\">\n<p class=\"eyebrow\">✦ ERITH.IA · MISSIONS DE VIE</p>\n<h2 id=\"missions-vie-title\">Financer la création et protéger le vivant</h2>\n<p>Ces cinq programmes sont des cadres de conception. Ils ne collectent aucun argent dans cette page, ne promettent aucun rendement et ne remplacent ni un conseil juridique ni les obligations fiscales. Chaque lancement réel exigera une structure, des comptes séparés, des partenaires vérifiés et un rapport d’impact public.</p>\n</div>\n<span class=\"pill warn\">Conception · aucun paiement actif</span>\n</section>\n\n<details class=\"atlas-collapse glass life-project-collapse\" data-collapse-key=\"fonds-erith\" data-project-lazy-shell-40420=\"true\">\n<summary class=\"atlas-collapse-summary\">\n<span aria-hidden=\"true\" class=\"atlas-collapse-icon\">▶</span>\n<span class=\"atlas-collapse-title\">✦ Fonds ERITH.IA — Crypto + Monnaies</span>\n<span class=\"atlas-collapse-subtitle\">Financer l’infrastructure, la recherche et la création</span>\n<span id=\"fonds-erith-ia\" data-project-lazy-anchor-40420=\"true\" aria-hidden=\"true\" style=\"display:inline-block;width:0;height:0;overflow:hidden;pointer-events:none\"></span>\n</summary>\n<div class=\"atlas-collapse-body\" data-project-lazy-body-40420=\"fonds-erith\" data-project-hydration-40420=\"placeholder\"></div>\n</details>\n\n<details class=\"atlas-collapse glass life-project-collapse\" data-collapse-key=\"association-erith\" data-project-lazy-shell-40420=\"true\">\n<summary class=\"atlas-collapse-summary\">\n<span aria-hidden=\"true\" class=\"atlas-collapse-icon\">▶</span>\n<span class=\"atlas-collapse-title\">⚖ Association ERITH.IA</span>\n<span class=\"atlas-collapse-subtitle\">Architecture internationale, gouvernance non lucrative et relais locaux</span>\n<span id=\"association-erith-ia\" data-project-lazy-anchor-40420=\"true\" aria-hidden=\"true\" style=\"display:inline-block;width:0;height:0;overflow:hidden;pointer-events:none\"></span>\n</summary>\n<div class=\"atlas-collapse-body\" data-project-lazy-body-40420=\"association-erith\" data-project-hydration-40420=\"placeholder\"></div>\n</details>\n\n<details class=\"atlas-collapse glass life-project-collapse\" data-collapse-key=\"aerith-enfance\" data-project-lazy-shell-40420=\"true\">\n<summary class=\"atlas-collapse-summary\">\n<span aria-hidden=\"true\" class=\"atlas-collapse-icon\">▶</span>\n<span class=\"atlas-collapse-title\">🕊 Aerith Enfance</span>\n<span class=\"atlas-collapse-subtitle\">Protection, éducation et autonomie des enfants confiés</span>\n<span id=\"aerith-enfance\" data-project-lazy-anchor-40420=\"true\" aria-hidden=\"true\" style=\"display:inline-block;width:0;height:0;overflow:hidden;pointer-events:none\"></span>\n</summary>\n<div class=\"atlas-collapse-body\" data-project-lazy-body-40420=\"aerith-enfance\" data-project-hydration-40420=\"placeholder\"></div>\n</details>\n\n<details class=\"atlas-collapse glass life-project-collapse\" data-collapse-key=\"aerith-animaux\" data-project-lazy-shell-40420=\"true\">\n<summary class=\"atlas-collapse-summary\">\n<span aria-hidden=\"true\" class=\"atlas-collapse-icon\">▶</span>\n<span class=\"atlas-collapse-title\">🐾 Aerith Animaux</span>\n<span class=\"atlas-collapse-subtitle\">Refuges, soins, familles d’accueil et lutte contre l’abandon</span>\n<span id=\"aerith-animaux\" data-project-lazy-anchor-40420=\"true\" aria-hidden=\"true\" style=\"display:inline-block;width:0;height:0;overflow:hidden;pointer-events:none\"></span>\n</summary>\n<div class=\"atlas-collapse-body\" data-project-lazy-body-40420=\"aerith-animaux\" data-project-hydration-40420=\"placeholder\"></div>\n</details>\n\n<details class=\"atlas-collapse glass life-project-collapse\" data-collapse-key=\"aerith-terre-vivante\" data-project-lazy-shell-40420=\"true\">\n<summary class=\"atlas-collapse-summary\">\n<span aria-hidden=\"true\" class=\"atlas-collapse-icon\">▶</span>\n<span class=\"atlas-collapse-title\">🌿 Aerith Terre Vivante</span>\n<span class=\"atlas-collapse-subtitle\">Nature, biodiversité, eau, sols et éducation environnementale</span>\n<span id=\"aerith-terre-vivante\" data-project-lazy-anchor-40420=\"true\" aria-hidden=\"true\" style=\"display:inline-block;width:0;height:0;overflow:hidden;pointer-events:none\"></span>\n</summary>\n<div class=\"atlas-collapse-body\" data-project-lazy-body-40420=\"aerith-terre-vivante\" data-project-hydration-40420=\"placeholder\"></div>\n</details>\n";
  const KEYS=Object.freeze(["fonds-erith", "association-erith", "aerith-enfance", "aerith-animaux", "aerith-terre-vivante"]);
  const ANCHORS=Object.freeze({"fonds-erith": "fonds-erith-ia", "association-erith": "association-erith-ia", "aerith-enfance": "aerith-enfance", "aerith-animaux": "aerith-animaux", "aerith-terre-vivante": "aerith-terre-vivante"});
  let sourcePromise=null;
  let sourceTemplate=null;
  let sourceFetchCount=0;
  let hydrationCount=0;
  let lastError="";

  host.insertAdjacentHTML("beforebegin",shellHtml);
  host.remove();

  const detailsByKey=()=>Object.fromEntries(KEYS.map(key=>[key,document.querySelector(`details[data-project-lazy-shell-40420="true"][data-collapse-key="${key}"]`)]));

  async function sourceDocument(){
    if(sourceTemplate)return sourceTemplate;
    if(sourcePromise)return sourcePromise;
    sourceFetchCount+=1;
    sourcePromise=fetch(SOURCE,{credentials:"same-origin",cache:"default"})
      .then(response=>{if(!response.ok)throw new Error(`Projects source HTTP ${response.status}`);return response.text();})
      .then(text=>{
        const template=document.createElement("template");
        template.innerHTML=text;
        sourceTemplate=template;
        lastError="";
        return template;
      })
      .catch(error=>{lastError=String(error?.message||error||"Projects source unavailable");sourcePromise=null;throw error;});
    return sourcePromise;
  }

  function reconcileAfterHydration(key){
    try{globalThis.atlasV2ClassifySections?.();}catch(_ ){}
    try{const mode=globalThis.atlasV2Mode?.()||document.documentElement.dataset.atlasView||"essential";globalThis.atlasV2ApplySectionVisibility?.(mode);globalThis.atlasV2ApplySemanticRoleIsolation40312?.(mode);}catch(_ ){}
    try{window.dispatchEvent(new CustomEvent("erith:projects-hydrated",{detail:{build:BUILD,key}}));}catch(_ ){}
  }

  async function hydrate(key){
    key=String(key||"");
    if(!KEYS.includes(key))return false;
    const detail=document.querySelector(`details[data-project-lazy-shell-40420="true"][data-collapse-key="${key}"]`);
    if(!(detail instanceof HTMLDetailsElement))return false;
    const body=detail.querySelector(":scope > .atlas-collapse-body");
    if(!(body instanceof HTMLElement))return false;
    if(body.dataset.projectHydration40420==="ready")return true;
    if(body.dataset.projectHydration40420==="loading"){
      try{await sourcePromise;}catch(_ ){}
      return body.dataset.projectHydration40420==="ready";
    }
    body.dataset.projectHydration40420="loading";
    try{
      const template=await sourceDocument();
      const sourceDetail=template.content.querySelector(`details[data-collapse-key="${key}"]`);
      const sourceBody=sourceDetail?.querySelector(":scope > .atlas-collapse-body");
      if(!(sourceBody instanceof HTMLElement))throw new Error(`Projects body missing: ${key}`);
      const children=[...sourceBody.childNodes].map(node=>node.cloneNode(true));
      const anchorId=ANCHORS[key];
      // Keep the canonical routing anchor in the always-connected summary shell.
      // The autonomous source fragment retains its canonical id, but the hydrated clone
      // must not create a duplicate id in the live document.
      children.forEach(node=>{
        if(!(node instanceof Element))return;
        const matches=[];
        if(node.id===anchorId)matches.push(node);
        matches.push(...node.querySelectorAll(`[id="${CSS.escape(anchorId)}"]`));
        matches.forEach(match=>{
          match.dataset.projectSourceAnchor40420=anchorId;
          match.removeAttribute("id");
        });
      });
      body.replaceChildren(...children);
      body.dataset.projectHydration40420="ready";
      hydrationCount+=1;
      reconcileAfterHydration(key);
      return true;
    }catch(error){
      body.dataset.projectHydration40420="error";
      body.dataset.projectHydrationError40420=String(error?.message||error||"unknown");
      console.warn(`Agent-Crypto ${BUILD} · Project body hydration failed`,key,error);
      return false;
    }
  }

  function bindDetail(detail){
    if(!(detail instanceof HTMLDetailsElement)||detail.dataset.projectLazyBound40420==="1")return;
    detail.dataset.projectLazyBound40420="1";
    const ensure=()=>{if(detail.open)hydrate(detail.dataset.collapseKey);};
    detail.addEventListener("toggle",()=>{if(detail.open)queueMicrotask(ensure);});
    // 40.4.20 parity bridge: the existing lifecycle emits this after restoring a
    // demand-resident body. This covers programmatic opens used by the canonical
    // router/Window Manager without adding a timer, observer or second lifecycle owner.
    detail.addEventListener("erith:presentation-resident",ensure);
  }
  Object.values(detailsByKey()).forEach(bindDetail);

  // A hash to an inner Project anchor opens the existing shell through the canonical
  // app router; its toggle then hydrates only that body. No extra navigation owner.
  function keyForHash(hash=location.hash){
    const id=decodeURIComponent(String(hash||"").replace(/^#/,""));
    return Object.entries(ANCHORS).find(([,anchor])=>anchor===id)?.[0]||"";
  }
  function hydrateHashIfOpen(){const key=keyForHash();if(!key)return;const detail=document.querySelector(`details[data-collapse-key="${key}"]`);if(detail?.open)hydrate(key);}
  window.addEventListener("hashchange",hydrateHashIfOpen,{passive:true});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",hydrateHashIfOpen,{once:true});else hydrateHashIfOpen();

  function snapshot(){
    const rows=KEYS.map(key=>{const detail=document.querySelector(`details[data-collapse-key="${key}"]`);const body=detail?.querySelector(":scope > .atlas-collapse-body");return Object.freeze({key,open:detail?.open===true,body_state:body?.dataset?.projectHydration40420||"detached-or-missing",anchor_present:!!document.getElementById(ANCHORS[key])});});
    return Object.freeze({build:BUILD,source:SOURCE,strategy:"parser-shell + on-demand body hydration",full_source_tags:177,boot_shell_tags:42,deferred_tags:135,source_fetch_count:sourceFetchCount,hydration_count:hydrationCount,last_error:lastError||null,rows:Object.freeze(rows),window_manager_shell_parity:true,audience_excluded:true,sources_excluded:true,new_timer:false,new_observer:false,storage_write_added:false,business_engine_changed:false});
  }
  const api=Object.freeze({build:BUILD,source:SOURCE,ensureBody:hydrate,snapshot,keys:KEYS,anchors:ANCHORS,window_manager_shell_parity:true,network_fetch:"same-origin static source on first disclosure only",new_timer:false,new_observer:false,storage_write_added:false,business_engine_changed:false});
  globalThis.ErithProjectsPresentation40420=api;
  globalThis.__AGENT_CRYPTO_PROJECTS_PRESENTATION_MOUNT_40420__=snapshot();
})();
