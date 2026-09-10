/* Agent-Crypto @erith.IA — 40.4.95
   LEARNING JOURNEY PRE-PARSE RANGE GATE / SAFE SYSTEM INSERT INTERCEPT
   The stable 40.4.24 System presentation owner remains byte-untouched.
   This gate wraps only #system-view-host.insertAdjacentHTML for its one canonical insertion,
   removes Learning Journey 01→11 from the HTML string before Firefox parses that range,
   and replaces it with the same lightweight demand shell used by the recovered 40.4.47 flow.
   If either canonical marker is missing, the HTML is passed through unchanged and
   learning-presentation.js falls back to the proven post-parse 40.4.47 recovery path.
   No timer, observer, network owner, storage owner, engine owner or Window Manager change. */
(()=>{
  "use strict";
  const BUILD="40.4.95";
  const host=document.getElementById("system-view-host");
  if(!host)return;
  const nativeInsert=host.insertAdjacentHTML;
  const FIRST_ID="learningExerciseGuide";
  const LAST_ID="expertLearningRoadmap";
  let intercepted=false;
  let stripped=false;
  let removedChars=0;
  let reason="armed";

  const shellHtml=`
      <details class="atlas-collapse glass learning-lazy-shell-40443" data-learning-lazy-shell-40443="true" data-learning-lazy-shell-40495="true">
        <summary class="atlas-collapse-summary"><span class="atlas-collapse-icon" aria-hidden="true">▶</span><span class="atlas-collapse-title">Learning Journey · 01→11</span><span class="atlas-collapse-subtitle">Progression et IndexedDB conservées · contenu détaillé à la demande</span></summary>
        <div class="atlas-collapse-body" data-learning-hydration-40443="empty" data-learning-hydration-40495="empty"><div class="learning-lazy-placeholder-40443"><b>Parcours pédagogique prêt</b><span>Ouvre cette section pour matérialiser le cockpit, les leçons et la feuille de route.</span></div></div>
      </details>`;

  function openingSectionStart(html,markerIndex){
    const start=html.lastIndexOf("<section",markerIndex);
    return start>=0?start:-1;
  }

  function matchingSectionEnd(html,openIndex){
    const tag=/<\/?section\b[^>]*>/gi;
    tag.lastIndex=openIndex;
    let depth=0;
    let match;
    while((match=tag.exec(html))){
      const closing=/^<\/section\b/i.test(match[0]);
      if(closing)depth-=1;else depth+=1;
      if(depth===0)return tag.lastIndex;
      if(depth<0)return -1;
    }
    return -1;
  }

  function stripLearningRange(value){
    const html=String(value??"");
    const firstMarker=html.indexOf(`id="${FIRST_ID}"`);
    const lastMarker=html.indexOf(`id="${LAST_ID}"`);
    if(firstMarker<0||lastMarker<0||lastMarker<=firstMarker){reason="canonical-markers-missing";return html;}
    const start=openingSectionStart(html,firstMarker);
    const lastOpen=openingSectionStart(html,lastMarker);
    if(start<0||lastOpen<start){reason="canonical-section-open-missing";return html;}
    const end=matchingSectionEnd(html,lastOpen);
    if(end<=lastOpen){reason="canonical-last-section-close-missing";return html;}
    removedChars=end-start;
    stripped=true;
    reason="preparse-range-replaced";
    return html.slice(0,start)+shellHtml+html.slice(end);
  }

  function publish(){
    try{
      globalThis.__AGENT_CRYPTO_LEARNING_PARSE_GATE_40495__=Object.freeze({
        build:BUILD,
        state:reason,
        intercepted,
        stripped,
        removed_chars:removedChars,
        system_presentation_owner_changed:false,
        fallback_post_parse_available:true,
        new_timer:false,
        new_observer:false,
        new_network_owner:false,
        new_storage_owner:false,
        indexeddb_schema_changed:false,
        market_core_changed:false,
        current_changed:false,
        oracle_changed:false,
        bridge_changed:false,
        window_manager_changed:false
      });
    }catch(_){}
  }

  host.insertAdjacentHTML=function(position,text){
    intercepted=true;
    const filtered=String(position||"").toLowerCase()==="beforebegin"?stripLearningRange(text):String(text??"");
    publish();
    return nativeInsert.call(this,position,filtered);
  };
  publish();
})();
