/* Agent-Crypto @erith.IA — 40.4.95
   LEARNING JOURNEY TRUE PRE-PARSE DEMAND HYDRATION / 40.4.47 RECOVERY FALLBACK LOCK
   Normal path: learning-parser-gate.js removes Learning 01→11 from the System HTML string
   before browser parsing and leaves one stable lightweight shell. First disclosure fetches
   canonical views/system.html, extracts the validated Learning sibling range, injects once,
   then rebinds the protected app.js Learning runtime through the 40.4.42 boundary.
   Fallback path: if the pre-parse gate did not run or markers changed, preserve the proven
   40.4.47 post-parse same-DOM recovery instead of risking a blank Learning cockpit.
   Learning state/progress/IndexedDB schemas and Simulation truth are unchanged. */
(()=>{
  "use strict";
  const BUILD="40.4.95";
  const SOURCE="./views/system.html";
  const FIRST_ID="learningExerciseGuide";
  const LAST_ID="expertLearningRoadmap";
  let sourcePromise=null;
  let sourceTemplate=null;
  let sourceFetchCount=0;
  let hydrationCount=0;
  let fallbackStrippedNodeCount=0;
  let fallbackPostParse=false;
  let lastError="";
  let hydrationPromise=null;

  function siblingRange(first,last){
    if(!(first instanceof Element)||!(last instanceof Element)||first.parentNode!==last.parentNode)return null;
    const nodes=[];let node=first;
    while(node){
      nodes.push(node);
      if(node===last)return nodes;
      node=node.nextSibling;
    }
    return null;
  }

  function createShell(){
    const shell=document.createElement("details");
    shell.className="atlas-collapse glass learning-lazy-shell-40443";
    shell.dataset.learningLazyShell40443="true";
    shell.dataset.learningLazyShell40495="true";
    shell.innerHTML=`<summary class="atlas-collapse-summary"><span class="atlas-collapse-icon" aria-hidden="true">▶</span><span class="atlas-collapse-title">Learning Journey · 01→11</span><span class="atlas-collapse-subtitle">Progression et IndexedDB conservées · contenu détaillé à la demande</span></summary><div class="atlas-collapse-body" data-learning-hydration-40443="empty" data-learning-hydration-40495="empty"><div class="learning-lazy-placeholder-40443"><b>Parcours pédagogique prêt</b><span>Ouvre cette section pour matérialiser le cockpit, les leçons et la feuille de route.</span></div></div>`;
    return shell;
  }

  let shell=document.querySelector('details[data-learning-lazy-shell-40495="true"]');
  if(!(shell instanceof HTMLDetailsElement)){
    const liveFirst=document.getElementById(FIRST_ID);
    const liveLast=document.getElementById(LAST_ID);
    const liveRange=siblingRange(liveFirst,liveLast);
    if(!liveRange?.length){
      globalThis.__AGENT_CRYPTO_LEARNING_PRESENTATION_40495__=Object.freeze({build:BUILD,state:"unavailable",reason:"shell-and-learning-range-not-found",preparse_gate:globalThis.__AGENT_CRYPTO_LEARNING_PARSE_GATE_40495__?.state||null,new_timer:false,new_observer:false,new_storage_owner:false,indexeddb_schema_changed:false});
      return;
    }
    fallbackPostParse=true;
    const parent=liveFirst.parentNode;
    shell=createShell();
    parent.insertBefore(shell,liveFirst);
    liveRange.forEach(node=>{
      if(node.nodeType===Node.ELEMENT_NODE)fallbackStrippedNodeCount+=1+node.querySelectorAll("*").length;
      node.remove();
    });
  }

  const body=shell.querySelector(':scope > .atlas-collapse-body');
  if(!body)return;
  if(!body.dataset.learningHydration40495)body.dataset.learningHydration40495=body.dataset.learningHydration40443||"empty";

  function sourceDocument(){
    if(sourceTemplate)return Promise.resolve(sourceTemplate);
    if(sourcePromise)return sourcePromise;
    sourceFetchCount+=1;
    sourcePromise=fetch(SOURCE,{credentials:"same-origin",cache:"default"})
      .then(response=>{if(!response.ok)throw new Error(`Learning source HTTP ${response.status}`);return response.text();})
      .then(text=>{const template=document.createElement("template");template.innerHTML=text;sourceTemplate=template;lastError="";return template;})
      .catch(error=>{lastError=String(error?.message||error||"Learning source unavailable");sourcePromise=null;throw error;});
    return sourcePromise;
  }

  function sourceRange(template){
    const first=template.content.querySelector(`#${FIRST_ID}`);
    const last=template.content.querySelector(`#${LAST_ID}`);
    const nodes=siblingRange(first,last);
    if(!nodes?.length)throw new Error("Learning source range missing");
    return nodes;
  }

  function rebind(){
    try{globalThis.atlasRebindLearningRuntime?.(body)||globalThis.atlasRebindLearningRuntime40442?.(body);}catch(error){console.warn(`Agent-Crypto ${BUILD} · Learning runtime rebind failed`,error);}
  }

  function scrollTarget(targetId){
    if(!targetId)return;
    requestAnimationFrame(()=>document.getElementById(targetId)?.scrollIntoView?.({block:"start",behavior:"smooth"}));
  }

  async function ensure(targetId=""){
    if(body.dataset.learningHydration40495==="ready"||body.dataset.learningHydration40443==="ready"){
      rebind();scrollTarget(targetId);return true;
    }
    if(hydrationPromise){
      try{await hydrationPromise;}catch(_){}
      const ready=body.dataset.learningHydration40495==="ready";
      if(ready){rebind();scrollTarget(targetId);}return ready;
    }
    body.dataset.learningHydration40495="loading";
    body.dataset.learningHydration40443="loading";
    hydrationPromise=(async()=>{
      try{
        const template=await sourceDocument();
        const nodes=sourceRange(template).map(node=>node.cloneNode(true));
        body.replaceChildren(...nodes);
        body.dataset.learningHydration40495="ready";
        body.dataset.learningHydration40443="ready";
        hydrationCount+=1;
        rebind();
        try{window.dispatchEvent(new CustomEvent("erith:learning-hydrated",{detail:{build:BUILD,target_id:String(targetId||""),preparse:!fallbackPostParse}}));}catch(_){}
        scrollTarget(targetId);
        return true;
      }catch(error){
        body.dataset.learningHydration40495="error";
        body.dataset.learningHydration40443="error";
        body.innerHTML=`<div class="learning-lazy-placeholder-40443"><b>Présentation Learning indisponible</b><span>${String(error?.message||error||"Erreur inconnue")}</span></div>`;
        console.warn(`Agent-Crypto ${BUILD} · Learning hydration failed`,error);
        return false;
      }finally{
        hydrationPromise=null;
      }
    })();
    return hydrationPromise;
  }

  shell.addEventListener("toggle",()=>{if(shell.open)ensure();});

  const EXACT_IDS=new Set([FIRST_ID,LAST_ID,"learningJourneyCockpit","learningFoundationPanel","learningFoundationLab","learningLessonPanel","learningCompletionPanel","learningIntegrityPanel"]);
  function hashTarget(){
    const id=decodeURIComponent(String(location.hash||"").replace(/^#/,""));
    if(EXACT_IDS.has(id)||/^learning/i.test(id)||/^expertLearning/i.test(id))return id;
    return "";
  }
  function openSimulationParent(){
    const simulation=document.querySelector('details[data-collapse-key="simulation"]');
    if(simulation instanceof HTMLDetailsElement&&!simulation.open)simulation.open=true;
  }
  function hydrateHash(){
    const id=hashTarget();if(!id)return;
    openSimulationParent();
    requestAnimationFrame(()=>{shell.open=true;ensure(id);});
  }
  window.addEventListener("hashchange",hydrateHash,{passive:true});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",hydrateHash,{once:true});else hydrateHash();

  function snapshot(){return Object.freeze({
    build:BUILD,
    state:body.dataset.learningHydration40495||"empty",
    source:SOURCE,
    preparse_gate_state:globalThis.__AGENT_CRYPTO_LEARNING_PARSE_GATE_40495__?.state||null,
    preparse_gate_stripped:globalThis.__AGENT_CRYPTO_LEARNING_PARSE_GATE_40495__?.stripped===true,
    fallback_post_parse:fallbackPostParse,
    fallback_stripped_nodes:fallbackStrippedNodeCount,
    source_fetch_count:sourceFetchCount,
    hydration_count:hydrationCount,
    last_error:lastError||null,
    runtime_owner:"app.js",
    runtime_rebind:"atlasRebindLearningRuntime40442",
    indexeddb_schema_changed:false,
    learning_state_reset:false,
    new_timer:false,
    new_observer:false,
    new_storage_owner:false,
    business_engine_changed:false
  });}
  const api=Object.freeze({build:BUILD,source:SOURCE,shell,ensure,snapshot,runtime_owner:"app.js",preparse_gate:true,indexeddb_schema_changed:false,learning_state_reset:false,new_timer:false,new_observer:false,new_storage_owner:false,business_engine_changed:false});
  globalThis.ErithLearningPresentation40495=api;
  globalThis.ErithLearningPresentation40447=api;
  globalThis.ErithLearningPresentation40445=api;
  globalThis.ErithLearningPresentation40444=api;
  globalThis.ErithLearningPresentation40443=api;
  globalThis.ErithLearningPresentation=api;
  globalThis.__AGENT_CRYPTO_LEARNING_PRESENTATION_40495__=snapshot();
  globalThis.__AGENT_CRYPTO_LEARNING_PRESENTATION_40447__=snapshot();
})();
