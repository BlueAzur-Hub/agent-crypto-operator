/* Agent-Crypto @erith.IA — 40.4.21
   OPERATIONS 03 TRUE BODY LAZY HYDRATION / RUNTIME ACTION REBIND LOCK
   Family header + four stable <details> shells mount during parsing so role visibility,
   canonical order and Window Manager ownership remain available before shared runtime init.
   Heavy bodies are read from views/operations.html only when their own disclosure opens.
   One same-origin static fetch is shared/cached for the session. Existing questionnaire
   and command actions are rebound only inside the hydrated body; no duplicate engine owner.
   No timer, observer, WebSocket, storage policy change or business-state mutation added. */
(()=>{
  "use strict";
  const BUILD="40.4.21";
  const SOURCE="./views/operations.html";
  const host=document.getElementById("operations-view-host");
  if(!host)return;
  const shellHtml="<section aria-labelledby=\"atlasLayoutFamily03\" class=\"atlas-layout-family atlas-layout-family-operations\">\n<span aria-hidden=\"true\" class=\"atlas-layout-family-index\">03</span>\n<div class=\"atlas-layout-family-copy\">\n<p>PARCOURS ADMINISTRATEUR</p>\n<h2 class=\"atlas-icon-heading-40290\" data-semantic-tone-40290=\"operations\" id=\"atlasLayoutFamily03\"><span aria-hidden=\"true\" class=\"atlas-heading-icon-40290\"><svg aria-hidden=\"true\" viewbox=\"0 0 24 24\"><path d=\"M5 5h14v14H5z\"></path><path d=\"m8 10 2 2 4-4M8 16h8\"></path></svg></span>Préparation &amp; opérations</h2>\n<span>Suivre l’état du projet, cadrer l’opérateur et préparer les accès sans action financière réelle.</span>\n</div>\n<span aria-hidden=\"true\" class=\"atlas-layout-family-signal\"></span>\n</section>\n\n<details class=\"atlas-collapse glass atlas-family-member atlas-tone-operations\" data-collapse-key=\"situation\" data-layout-family=\"operations\" data-operations-lazy-shell-40421=\"true\">\n<summary class=\"atlas-collapse-summary\">\n<span aria-hidden=\"true\" class=\"atlas-collapse-icon\">▶</span>\n<span class=\"atlas-collapse-title\">Situation du projet</span>\n<span class=\"atlas-collapse-subtitle\">Synthèse d’état</span>\n<span id=\"situation\" data-operations-lazy-anchor-40421=\"true\" aria-hidden=\"true\" style=\"display:inline-block;width:0;height:0;overflow:hidden;pointer-events:none\"></span></summary>\n<div class=\"atlas-collapse-body\" data-operations-lazy-body-40421=\"situation\" data-operations-hydration-40421=\"placeholder\"></div>\n</details>\n\n<details class=\"atlas-collapse glass atlas-family-member atlas-tone-operations\" data-collapse-key=\"questionnaire\" data-layout-family=\"operations\" data-operations-lazy-shell-40421=\"true\">\n<summary class=\"atlas-collapse-summary\">\n<span aria-hidden=\"true\" class=\"atlas-collapse-icon\">▶</span>\n<span class=\"atlas-collapse-title\">Questionnaire opérateur</span>\n<span class=\"atlas-collapse-subtitle\">Cadre humain et limites</span>\n<span id=\"questionnaire\" data-operations-lazy-anchor-40421=\"true\" aria-hidden=\"true\" style=\"display:inline-block;width:0;height:0;overflow:hidden;pointer-events:none\"></span></summary>\n<div class=\"atlas-collapse-body\" data-operations-lazy-body-40421=\"questionnaire\" data-operations-hydration-40421=\"placeholder\"></div>\n</details>\n\n<details class=\"atlas-collapse glass atlas-family-member atlas-tone-operations\" data-collapse-key=\"briefing\" data-layout-family=\"operations\" data-operations-lazy-shell-40421=\"true\">\n<summary class=\"atlas-collapse-summary\">\n<span aria-hidden=\"true\" class=\"atlas-collapse-icon\">▶</span>\n<span class=\"atlas-collapse-title\">Briefing opérateur</span>\n<span class=\"atlas-collapse-subtitle\">Lecture de contexte</span>\n<span id=\"briefing\" data-operations-lazy-anchor-40421=\"true\" aria-hidden=\"true\" style=\"display:inline-block;width:0;height:0;overflow:hidden;pointer-events:none\"></span></summary>\n<div class=\"atlas-collapse-body\" data-operations-lazy-body-40421=\"briefing\" data-operations-hydration-40421=\"placeholder\"></div>\n</details>\n\n<details class=\"atlas-collapse glass atlas-family-member atlas-tone-operations\" data-collapse-key=\"planning\" data-layout-family=\"operations\" data-operations-lazy-shell-40421=\"true\">\n<summary class=\"atlas-collapse-summary\">\n<span aria-hidden=\"true\" class=\"atlas-collapse-icon\">▶</span>\n<span class=\"atlas-collapse-title\">Plan exchange / accès déporté</span>\n<span class=\"atlas-collapse-subtitle\">Préparation hors GitHub Pages</span>\n<span id=\"planning\" data-operations-lazy-anchor-40421=\"true\" aria-hidden=\"true\" style=\"display:inline-block;width:0;height:0;overflow:hidden;pointer-events:none\"></span></summary>\n<div class=\"atlas-collapse-body\" data-operations-lazy-body-40421=\"planning\" data-operations-hydration-40421=\"placeholder\"></div>\n</details>\n";
  const KEYS=Object.freeze(["situation", "questionnaire", "briefing", "planning"]);
  const ANCHORS=Object.freeze({"situation": "situation", "questionnaire": "questionnaire", "briefing": "briefing", "planning": "planning"});
  let sourcePromise=null;
  let sourceTemplate=null;
  let sourceFetchCount=0;
  let hydrationCount=0;
  let actionBindCount=0;
  let lastError="";

  host.insertAdjacentHTML("beforebegin",shellHtml);
  host.remove();

  function detailFor(key){return document.querySelector(`details[data-operations-lazy-shell-40421="true"][data-collapse-key="${key}"]`);}

  async function sourceDocument(){
    if(sourceTemplate)return sourceTemplate;
    if(sourcePromise)return sourcePromise;
    sourceFetchCount+=1;
    sourcePromise=fetch(SOURCE,{credentials:"same-origin",cache:"default"})
      .then(response=>{if(!response.ok)throw new Error(`Operations source HTTP ${response.status}`);return response.text();})
      .then(text=>{const template=document.createElement("template");template.innerHTML=text;sourceTemplate=template;lastError="";return template;})
      .catch(error=>{lastError=String(error?.message||error||"Operations source unavailable");sourcePromise=null;throw error;});
    return sourcePromise;
  }

  function bindOnce(node,tag,handler){
    if(!(node instanceof HTMLElement)||node.dataset[tag]==="1")return false;
    node.dataset[tag]="1";
    node.addEventListener("click",handler);
    actionBindCount+=1;
    return true;
  }

  function bindRuntimeActions(key,body){
    body.querySelectorAll('.cmd-preset[data-command]').forEach(button=>{
      bindOnce(button,'operationsCommandBound40421',()=>{
        try{globalThis.runCommandFromInput?.(button.dataset.command);}catch(error){console.warn(`Agent-Crypto ${BUILD} · Operations command bridge failed`,error);}
      });
    });
    if(key!=="questionnaire")return;
    try{globalThis.loadQuestionnaire?.();}catch(_){}
    bindOnce(document.getElementById('btnSaveQuestionnaire'),'operationsQuestionnaireBound40421',()=>{
      try{globalThis.saveQuestionnaire?.();const out=document.getElementById('questionnaireOutput');if(out)out.textContent='Fiche sauvegardée localement dans ce navigateur.';}catch(error){console.warn(`Agent-Crypto ${BUILD} · Questionnaire save bridge failed`,error);}
    });
    bindOnce(document.getElementById('btnBuildBrief'),'operationsQuestionnaireBound40421',()=>{try{globalThis.buildSessionBrief?.();}catch(error){console.warn(`Agent-Crypto ${BUILD} · Questionnaire brief bridge failed`,error);}});
    bindOnce(document.getElementById('btnCopyBrief'),'operationsQuestionnaireBound40421',()=>{try{void globalThis.copySessionBrief?.();}catch(error){console.warn(`Agent-Crypto ${BUILD} · Questionnaire copy bridge failed`,error);}});
    bindOnce(document.getElementById('btnDownloadBrief'),'operationsQuestionnaireBound40421',()=>{try{globalThis.downloadSessionBrief?.();}catch(error){console.warn(`Agent-Crypto ${BUILD} · Questionnaire download bridge failed`,error);}});
    bindOnce(document.getElementById('btnClearQuestionnaire'),'operationsQuestionnaireBound40421',()=>{try{globalThis.clearQuestionnaire?.();}catch(error){console.warn(`Agent-Crypto ${BUILD} · Questionnaire clear bridge failed`,error);}});
  }

  function reconcileAfterHydration(key,body){
    bindRuntimeActions(key,body);
    if(key==="situation"){try{globalThis.atlasSyncReleaseLabels?.();}catch(_){}}
    try{globalThis.atlasV2ClassifySections?.();}catch(_){}
    try{const mode=globalThis.atlasV2Mode?.()||document.documentElement.dataset.atlasView||"essential";globalThis.atlasV2ApplySectionVisibility?.(mode);globalThis.atlasV2ApplySemanticRoleIsolation40312?.(mode);}catch(_){}
    try{window.dispatchEvent(new CustomEvent("erith:operations-hydrated",{detail:{build:BUILD,key}}));}catch(_){}
  }

  async function hydrate(key){
    key=String(key||"");
    if(!KEYS.includes(key))return false;
    const detail=detailFor(key);
    if(!(detail instanceof HTMLDetailsElement))return false;
    const body=detail.querySelector(':scope > .atlas-collapse-body');
    if(!(body instanceof HTMLElement))return false;
    if(body.dataset.operationsHydration40421==="ready"){bindRuntimeActions(key,body);return true;}
    if(body.dataset.operationsHydration40421==="loading"){try{await sourcePromise;}catch(_){}return body.dataset.operationsHydration40421==="ready";}
    body.dataset.operationsHydration40421="loading";
    try{
      const template=await sourceDocument();
      const sourceDetail=template.content.querySelector(`details[data-collapse-key="${key}"]`);
      const sourceBody=sourceDetail?.querySelector(':scope > .atlas-collapse-body');
      if(!(sourceBody instanceof HTMLElement))throw new Error(`Operations body missing: ${key}`);
      const children=[...sourceBody.childNodes].map(node=>node.cloneNode(true));
      // Keep the canonical routing anchor permanently connected in the summary shell.
      // Remove only the matching source section id from the hydrated clone to prevent duplicate IDs.
      children.forEach(node=>{
        if(!(node instanceof Element))return;
        const candidates=[node,...node.querySelectorAll('[id]')];
        candidates.forEach(candidate=>{
          if(candidate.id===ANCHORS[key]){candidate.dataset.operationsSourceAnchor40421=ANCHORS[key];candidate.removeAttribute('id');}
        });
      });
      body.replaceChildren(...children);
      body.dataset.operationsHydration40421="ready";
      hydrationCount+=1;
      reconcileAfterHydration(key,body);
      return true;
    }catch(error){
      body.dataset.operationsHydration40421="error";
      body.dataset.operationsHydrationError40421=String(error?.message||error||"unknown");
      console.warn(`Agent-Crypto ${BUILD} · Operations body hydration failed`,key,error);
      return false;
    }
  }

  function bindDetail(detail){
    if(!(detail instanceof HTMLDetailsElement)||detail.dataset.operationsLazyBound40421==="1")return;
    detail.dataset.operationsLazyBound40421="1";
    const ensure=()=>{if(detail.open)hydrate(detail.dataset.collapseKey);};
    detail.addEventListener('toggle',()=>{if(detail.open)queueMicrotask(ensure);});
    // Existing closed-body lifecycle restores its fragment before emitting this event.
    detail.addEventListener('erith:presentation-resident',ensure);
  }
  KEYS.map(detailFor).forEach(bindDetail);

  function keyForHash(hash=location.hash){const id=decodeURIComponent(String(hash||'').replace(/^#/,''));return KEYS.includes(id)?id:'';}
  function hydrateHashIfOpen(){const key=keyForHash();if(!key)return;const detail=detailFor(key);if(detail?.open)hydrate(key);}
  window.addEventListener('hashchange',hydrateHashIfOpen,{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hydrateHashIfOpen,{once:true});else hydrateHashIfOpen();

  function snapshot(){
    const rows=KEYS.map(key=>{const detail=detailFor(key);const body=detail?.querySelector(':scope > .atlas-collapse-body');return Object.freeze({key,open:detail?.open===true,body_state:body?.dataset?.operationsHydration40421||'detached-or-missing',anchor_present:!!document.getElementById(ANCHORS[key])});});
    return Object.freeze({build:BUILD,source:SOURCE,strategy:'parser-shell + on-demand operations body hydration',full_source_tags:255,boot_shell_tags:39,deferred_tags:216,source_fetch_count:sourceFetchCount,hydration_count:hydrationCount,action_bind_count:actionBindCount,last_error:lastError||null,rows:Object.freeze(rows),window_manager_shell_parity:true,questionnaire_rebind:true,command_rebind:true,new_timer:false,new_observer:false,storage_policy_changed:false,business_engine_changed:false});
  }
  const api=Object.freeze({build:BUILD,source:SOURCE,ensureBody:hydrate,snapshot,keys:KEYS,anchors:ANCHORS,window_manager_shell_parity:true,network_fetch:'same-origin static source on first Operations disclosure only',new_timer:false,new_observer:false,storage_policy_changed:false,business_engine_changed:false});
  globalThis.ErithOperationsPresentation40421=api;
  globalThis.__AGENT_CRYPTO_OPERATIONS_PRESENTATION_MOUNT_40421__=snapshot();
})();
