/* Agent-Crypto @erith.IA — 40.4.99 R2 CANDIDATE
   ATLAS COLD ROUTER · DEMAND HYDRATION OWNER · TERMINAL + RETRY
   40.4.98 runtime contract preserved: Atlas cockpit / Bridge / CURRENT compact truth stay HOT.
   Auto Reader, Shared/GitHub Memory, CURRENT audit details and Book/Knowledge cold bodies
   hydrate from views/atlas.html only on explicit disclosure. The old boot-time
   Element.prototype.insertAdjacentHTML interception and 73 KB markup preprocessing are retired.
   No timer, observer, storage owner, scheduler or engine is added. */
(()=>{
  "use strict";
  const BUILD="40.4.99";
  const SOURCE="./views/atlas.html";
  const TARGETS=Object.freeze({
    "auto-reader":Object.freeze({label:"Atlas Auto Reader"}),
    "shared-memory":Object.freeze({label:"Shared Memory"}),
    "github-memory":Object.freeze({label:"GitHub Memory"})
  });
  const BOOK_KNOWLEDGE_SECTIONS=Object.freeze({
    "book-readonly":Object.freeze({id:"atlasBookReadOnlyKnowledge"}),
    "knowledge-library":Object.freeze({id:"atlasKnowledgeLibrary"})
  });
  const AUDIT_SECTIONS=Object.freeze({
    "stable-stack":Object.freeze({id:"atlasStableStack"}),
    "analytical-truth":Object.freeze({id:"atlasAnalyticalTruth"}),
    "frame-truth":Object.freeze({id:"atlasFrameTruth"}),
    "current-truth":Object.freeze({id:"atlasCurrentTruth33"})
  });
  let sourcePromise=null;
  let fetchCount=0;
  const hydrated=new Set();
  const auditHydrated=new Set();
  let bookKnowledgeHydrated=false;

  function escRe(value){return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
  function detailsBounds(source,key){
    const re=new RegExp(`<details\\b[^>]*data-collapse-key=["']${escRe(key)}["'][^>]*>`,"i");
    const hit=re.exec(source); if(!hit)return null;
    const start=hit.index, summaryClose=source.indexOf("</summary>",start); if(summaryClose<0)return null;
    const bodyStart=summaryClose+"</summary>".length, close=source.indexOf("</details>",bodyStart); if(close<0)return null;
    return {start,bodyStart,close};
  }
  function sectionBounds(source,id){
    const re=new RegExp(`<section\\b[^>]*\\bid=["']${escRe(id)}["'][^>]*>`,"i");
    const hit=re.exec(source); if(!hit)return null;
    const start=hit.index,openEnd=start+hit[0].length,token=/<\/?section\b[^>]*>/ig;
    token.lastIndex=start; let depth=0,match;
    while((match=token.exec(source))){
      if(/^<\/section/i.test(match[0]))depth-=1; else depth+=1;
      if(depth===0)return {start,openEnd,close:match.index,end:token.lastIndex};
    }
    return null;
  }
  function targetDetails(key){return document.querySelector(`details[data-collapse-key="${key}"]`);}
  function sourceText(){
    if(!sourcePromise){
      fetchCount+=1;
      sourcePromise=fetch(SOURCE,{cache:"force-cache",credentials:"same-origin"}).then(response=>{
        if(!response.ok)throw new Error(`Atlas source HTTP ${response.status}`);
        return response.text();
      }).catch(error=>{
        // 40.4.99 R2 candidate — a transport failure must not poison every later disclosure.
        sourcePromise=null;
        throw error;
      });
    }
    return sourcePromise;
  }
  function emitResidencyFailure(node,key,error){
    if(!node)return false;
    try{
      node.dispatchEvent(new CustomEvent("erith:presentation-residency-error",{
        bubbles:true,
        detail:{family:"atlas",key,build:BUILD,error:String(error?.message||error||"unknown")}
      }));
      return true;
    }catch(_){return false;}
  }
  function bodyHtml(source,key){
    const b=detailsBounds(source,key); if(!b)throw new Error(`Atlas lazy source missing: ${key}`);
    const fragment=source.slice(b.bodyStart,b.close),template=document.createElement("template");
    template.innerHTML=fragment;
    const body=template.content.querySelector(":scope > .atlas-collapse-body")||template.content.querySelector(".atlas-collapse-body");
    if(!body)throw new Error(`Atlas lazy body missing: ${key}`);
    return body.innerHTML;
  }
  function auditInnerHtml(source,spec){
    const b=sectionBounds(source,spec.id); if(!b)throw new Error(`Atlas audit source missing: ${spec.id}`);
    return source.slice(b.openEnd,b.close);
  }
  async function hydrate(key){
    if(hydrated.has(key))return true;
    const details=targetDetails(key); if(!details)return false;
    details.dataset.atlasHydration40425="loading";
    try{
      const source=await sourceText(); if(!details.open)return false;
      const body=details.querySelector(":scope > .atlas-collapse-body"); if(!body)return false;
      const template=document.createElement("template"); template.innerHTML=bodyHtml(source,key);
      // R2: the HOT shell owns the canonical id only until the real cold body is ready.
      // Release it immediately before insertion so the document never contains duplicate ids.
      if(details.id===key)details.removeAttribute("id");
      body.replaceChildren(template.content.cloneNode(true));
      body.dataset.atlasHydrated40425="1"; details.dataset.atlasHydration40425="ready"; hydrated.add(key);
      try{(globalThis.AgentCryptoAtlasPeripheralRebind||globalThis.AgentCryptoAtlasPeripheralRebind40425)?.rebind?.(key);}catch(error){console.warn("[40.4.99] Atlas peripheral rebind",error);}
      try{details.dispatchEvent(new CustomEvent("erith:presentation-resident",{bubbles:true,detail:{family:"atlas",key,build:BUILD}}));}catch(_){}
      return true;
    }catch(error){
      details.dataset.atlasHydration40425="error";
      const body=details.querySelector(":scope > .atlas-collapse-body");
      if(body)body.innerHTML=`<p class="atlas-local-response-empty">Chargement différé indisponible · ${String(error?.message||error)}</p>`;
      emitResidencyFailure(details,key,error);
      return false;
    }
  }
  async function hydrateAudit(key){
    if(auditHydrated.has(key))return true;
    const spec=AUDIT_SECTIONS[key],root=spec&&document.getElementById(spec.id); if(!spec||!root)return false;
    root.dataset.atlasAuditHydration40431="loading";
    try{
      const source=await sourceText(),template=document.createElement("template"); template.innerHTML=auditInnerHtml(source,spec);
      root.replaceChildren(template.content.cloneNode(true)); root.dataset.atlasAuditHydration40431="ready"; auditHydrated.add(key);
      try{(globalThis.AgentCryptoAtlasPeripheralRebind||globalThis.AgentCryptoAtlasPeripheralRebind40425)?.rebind?.("current-audit");}catch(error){console.warn("[40.4.99] Atlas CURRENT audit rebind",error);}
      try{root.dispatchEvent(new CustomEvent("erith:presentation-resident",{bubbles:true,detail:{family:"atlas",key:`current-audit:${key}`,build:BUILD}}));}catch(_){}
      return true;
    }catch(error){
      root.dataset.atlasAuditHydration40431="error";
      const note=root.querySelector("[data-atlas-current-audit-shell-40431] .planning-intro"); if(note)note.textContent=`Chargement différé indisponible · ${String(error?.message||error)}`;
      emitResidencyFailure(root,`current-audit:${key}`,error);
      return false;
    }
  }
  async function hydrateBookKnowledge(){
    if(bookKnowledgeHydrated)return true;
    const roots=Object.entries(BOOK_KNOWLEDGE_SECTIONS).map(([key,spec])=>[key,spec,document.getElementById(spec.id)]);
    if(roots.some(([, ,root])=>!root))return false;
    roots.forEach(([, ,root])=>root.dataset.atlasBookKnowledgeHydration40434="loading");
    try{
      const source=await sourceText();
      for(const [key,spec,root] of roots){
        const template=document.createElement("template"); template.innerHTML=auditInnerHtml(source,spec);
        root.replaceChildren(template.content.cloneNode(true)); root.dataset.atlasBookKnowledgeHydration40434="ready";
      }
      bookKnowledgeHydrated=true;
      try{globalThis.AgentCryptoAtlasPeripheralRebind?.rebind?.("book-knowledge");}catch(error){console.warn("[40.4.99] Atlas Book/Knowledge rebind",error);}
      roots.forEach(([key,,root])=>{try{root.dispatchEvent(new CustomEvent("erith:presentation-resident",{bubbles:true,detail:{family:"atlas",key:`book-knowledge:${key}`,build:BUILD}}));}catch(_){}});
      return true;
    }catch(error){
      roots.forEach(([key, ,root])=>{
        root.dataset.atlasBookKnowledgeHydration40434="error";
        emitResidencyFailure(root,`book-knowledge:${key}`,error);
      });
      return false;
    }
  }
  function attachPeripheral(){
    for(const key of Object.keys(TARGETS)){
      const details=targetDetails(key); if(!details||details.dataset.atlasPeripheralLazyReady40425==="1")continue;
      details.dataset.atlasPeripheralLazyReady40425="1";
      details.addEventListener("toggle",()=>{if(details.open)hydrate(key);});
      if(details.open)hydrate(key);
    }
  }
  function attachAudit(){
    for(const [key,spec] of Object.entries(AUDIT_SECTIONS)){
      const root=document.getElementById(spec.id); if(!root||root.dataset.atlasCurrentAuditReady40431==="1")continue;
      root.dataset.atlasCurrentAuditReady40431="1";
      root.querySelector(`[data-atlas-current-audit-open-40431="${key}"]`)?.addEventListener("click",()=>hydrateAudit(key));
    }
  }
  function attachBookKnowledge(){
    for(const [key,spec] of Object.entries(BOOK_KNOWLEDGE_SECTIONS)){
      const root=document.getElementById(spec.id); if(!root||root.dataset.atlasBookKnowledgeReady40434==="1")continue;
      root.dataset.atlasBookKnowledgeReady40434="1";
      root.querySelector(`[data-atlas-current-audit-open-40431="${key}"]`)?.addEventListener("click",()=>hydrateBookKnowledge());
    }
  }
  function attach(){attachPeripheral();attachAudit();attachBookKnowledge(); return true;}
  const contract=Object.freeze({
    build:BUILD,source:SOURCE,targets:Object.keys(TARGETS),current_audit_targets:Object.keys(AUDIT_SECTIONS),book_knowledge_targets:Object.keys(BOOK_KNOWLEDGE_SECTIONS),
    boot_shell_precompiled:true,runtime_markup_preprocess:false,element_prototype_interception:false,boot_bodies_absent:true,current_audit_roots_resident:true,current_audit_bodies_absent_at_boot:true,
    fetch_count:()=>fetchCount,hydrated:()=>[...hydrated],current_audit_hydrated:()=>[...auditHydrated],book_knowledge_hydrated:()=>bookKnowledgeHydrated,
    runtime_owner:"app.js",auto_reader_runtime_preserved:true,auto_reader_collection_boot_preserved:true,github_auto_load_preserved:true,current_pipeline_runtime_preserved:true,current_audit_read_only_presentation:true,
    terminal_success_event:"erith:presentation-resident",terminal_failure_event:"erith:presentation-residency-error",source_retry_after_transport_failure:true,
    new_timer:false,new_observer:false,new_scheduler:false,storage_owner_added:false,attach
  });
  globalThis.AgentCryptoAtlasColdRouter40499=contract;
  globalThis.AgentCryptoAtlasPeripheralLazy=contract;
  globalThis.__AGENT_CRYPTO_ATLAS_PERIPHERAL_LAZY_40425__=contract;
  globalThis.__AGENT_CRYPTO_ATLAS_CURRENT_AUDIT_LAZY_40431__=contract;
  globalThis.__AGENT_CRYPTO_ATLAS_COLD_ROUTER_40499__=contract;
})();
