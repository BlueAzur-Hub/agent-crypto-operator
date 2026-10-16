/* Agent-Crypto @erith.IA — Decision Intelligence Current Truth
   Canonical read-only owner.
   40.6.263 canonical mount: Decision Intelligence is physically contained by a dedicated top-level Section 01 family slot.
   Computes the existing Event → Memory → Analogs → Regime → Calibration → Survival → Explainability chain once,
   shares prepared inputs across owners, leaves semantic clustering lazy inside Historical Analog, caches the current result, and renders without recursive recomputation.
   No hard-coded runtime build, no fetch, no timer, no observer, no storage write, no order. */
(() => {
  "use strict";

  const DETAILS_ID="decisionIntelligenceCurrentTruth";
  const HOST_ID="decisionIntelligenceCurrentTruthHost";
  let cachedState=null;
  let cachedEventId=null;
  let dirty=true;
  let running=false;

  const esc=value=>String(value??"")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  const finite=value=>{const n=Number(value);return Number.isFinite(n)?n:null;};

  function runtimeBuild(){
    try{
      return String(
        globalThis.ErithVersionTruth?.snapshot?.()?.loaded
        || document.documentElement.dataset.agentCryptoLoadedBuild
        || globalThis.AGENT_CRYPTO_EFFECTIVE_BUILD
        || ""
      ).trim()||"current";
    }catch(_){return "current";}
  }

  function safe(fn,fallback=null){
    try{return typeof fn==="function"?fn():fallback;}
    catch(error){return {__error:String(error?.message||error)};}
  }

  function currentNewsEvent(){
    const source=safe(globalThis.AgentCryptoNewsEventSource?.snapshot);
    return source?.current||safe(globalThis.AtlasEventIntelligence?.current)||null;
  }

  function eventIdOf(event){
    return String(event?.event_id||event?.id||"").trim()||null;
  }

  function runtimeRows(state){
    return [
      {stage:"Event Memory",available:!!state.memory,status:state.memory?.status||"NO_CURRENT_EVENT"},
      {stage:"Historical Analogs",available:!!state.analog24||!!state.analog48,status:state.analog24?.status||state.analog48?.status||"NO_OUTPUT"},
      {stage:"Regime Qualified",available:!!state.regime24||!!state.regime48,status:state.regime24?.status||state.regime48?.status||"NO_OUTPUT"},
      {stage:"Calibration",available:!!state.calibration,status:state.calibration?.status||"NO_OUTPUT"},
      {stage:"Capital Survival",available:!!state.survival,status:state.survival?.risk_gate||state.survival?.status||"NO_OUTPUT"}
    ];
  }

  function compute(){
    const event=currentNewsEvent();
    const eventId=eventIdOf(event);
    if(!event){
      const acceptance=safe(()=>globalThis.AtlasDecisionIntelligenceAcceptance?.matrix?.({
        current_data_status:"NO_CURRENT_EVENT",
        runtime:[]
      }));
      return Object.freeze({
        build:runtimeBuild(),
        event_id:null,
        event:null,
        memory:null,
        analog24:null,
        analog48:null,
        regime24:null,
        regime48:null,
        calibration:null,
        survival:null,
        acceptance,
        explainability:null,
        status:"NO_CURRENT_EVENT",
        operator_action:"CONSULTATION_ONLY"
      });
    }

    const reactionSnapshot=safe(globalThis.AgentCryptoEventReactionSource?.snapshot);
    const records=Array.isArray(reactionSnapshot?.records)?reactionSnapshot.records:[];
    const rawMemoryOptions={source_snapshot:reactionSnapshot,records};
    const preparedMemoryOptions=safe(()=>globalThis.AtlasEventMemory?.prepare?.(rawMemoryOptions));
    const memoryOptions=preparedMemoryOptions&&!preparedMemoryOptions.__error
      ? preparedMemoryOptions
      : rawMemoryOptions;

    const memory=safe(()=>globalThis.AtlasEventMemory?.derive?.(event,memoryOptions));
    if(!memory||memory.__error){
      return Object.freeze({
        build:runtimeBuild(),
        event_id:eventId,
        event,
        memory:null,
        status:"MEMORY_UNAVAILABLE",
        operator_action:"CONSULTATION_ONLY",
        error:memory?.__error||null
      });
    }

    const memoryArchive=safe(()=>globalThis.AtlasEventMemory?.archive?.(memoryOptions),[]);

    const asset=String(memory.assets?.[0]||"BTC").toUpperCase();
    const shared={
      asset,
      memory_archive:memoryArchive,
      memory_options:memoryOptions,
      similarity_cache:new Map()
    };

    const analog24=safe(()=>globalThis.AtlasHistoricalAnalogEngine405015?.analyze?.(memory,{...shared,horizon:"+24h",limit:50}));
    const analog48=safe(()=>globalThis.AtlasHistoricalAnalogEngine405015?.analyze?.(memory,{...shared,horizon:"+48h",limit:50}));

    const regime24=safe(()=>globalThis.AtlasRegimeQualifiedAnalogs?.qualify?.(memory,{...shared,horizon:"+24h",limit:50,analog_result:analog24}));
    const regime48=safe(()=>globalThis.AtlasRegimeQualifiedAnalogs?.qualify?.(memory,{...shared,horizon:"+48h",limit:50,analog_result:analog48}));

    const calibration=safe(()=>globalThis.AtlasHorizonCalibration?.analyze?.(memory,{
      asset,
      qualified_by_horizon:{"+24h":regime24,"+48h":regime48}
    }));

    const survival=safe(()=>globalThis.AtlasCapitalSurvival?.evaluate?.({asset,calibration}));
    const provisional={
      memory,analog24,analog48,regime24,regime48,calibration,survival
    };
    const acceptance=safe(()=>globalThis.AtlasDecisionIntelligenceAcceptance?.matrix?.({
      current_data_status:memory?.status||"EVENT_AVAILABLE",
      runtime:runtimeRows(provisional)
    }));
    const explainability=safe(()=>globalThis.AtlasDecisionExplainability?.explain?.(memory,{
      asset,calibration,survival,acceptance
    }));

    return Object.freeze({
      build:runtimeBuild(),
      event_id:eventId||memory.event_id||null,
      event,
      asset,
      memory,
      analog24,
      analog48,
      regime24,
      regime48,
      calibration,
      survival,
      acceptance,
      explainability,
      status:explainability?.status||memory?.status||"READY",
      operator_action:explainability?.operator_action||"CONSULTATION_ONLY"
    });
  }

  function card(label,value,small=""){
    return `<article><span>${esc(label)}</span><b>${esc(value)}</b><small>${esc(small)}</small></article>`;
  }

  function count(row){return Number(row?.distribution?.count||row?.qualified_analogs?.length||0);}
  function calibrationCount(cal,h){return Number(cal?.horizons?.[h]?.sample_size||0);}

  function bodyMarkup(state){
    const noEvent=!state?.memory;
    const eventLabel=state?.memory?.event_label||state?.event?.event_label||state?.event?.display_headline||state?.event?.headline||"Aucun événement courant";
    const analogText=noEvent?"NO_OUTPUT":`24h n=${count(state.analog24)} · 48h n=${count(state.analog48)}`;
    const regimeText=noEvent?"NO_OUTPUT":`24h n=${count(state.regime24)} · 48h n=${count(state.regime48)}`;
    const calibrationText=noEvent?"NO_OUTPUT":`24h n=${calibrationCount(state.calibration,"+24h")} · 48h n=${calibrationCount(state.calibration,"+48h")}`;
    const acceptance=state?.acceptance?.status||"UNKNOWN";
    const orientation=state?.explainability?.orientation_24_48||state?.status||"NO_OUTPUT";
    return `
      <section id="${HOST_ID}" class="news-sentinel" data-mode="canonical-shared-state">
        <div class="section-head compact">
          <div>
            <p class="eyebrow">DECISION INTELLIGENCE · CURRENT TRUTH</p>
            <h2>Chaîne décisionnelle observée</h2>
          </div>
          <span class="pill">${esc(acceptance)}</span>
        </div>
        <div class="news-live-kpis">
          ${card("Événement",state?.memory?.status||"NO_CURRENT_EVENT",eventLabel)}
          ${card("Analogues",state?.analog24?.status||state?.analog48?.status||"NO_OUTPUT",analogText)}
          ${card("Régime",state?.regime24?.status||state?.regime48?.status||"NO_OUTPUT",regimeText)}
          ${card("Calibration",state?.calibration?.status||"NO_OUTPUT",calibrationText)}
          ${card("Capital Survival",state?.survival?.risk_gate||state?.survival?.status||"NO_OUTPUT","simulation uniquement")}
          ${card("Sortie",state?.operator_action||"CONSULTATION_ONLY",orientation)}
        </div>
        <p class="private-backend-note">
          Calcul partagé une fois par état courant · aucune mutation des modèles · aucun ordre · aucune autorisation d’exécution.
        </p>
      </section>`;
  }

  function waitingMarkup(){
    return `
      <section id="${HOST_ID}" class="news-sentinel" data-mode="canonical-shared-state">
        <div class="section-head compact">
          <div>
            <p class="eyebrow">DECISION INTELLIGENCE · CURRENT TRUTH</p>
            <h2>Chaîne décisionnelle observée</h2>
          </div>
          <span class="pill">PRÊT</span>
        </div>
        <p class="private-backend-note">
          Ouvrir cette section calcule une seule fois l’état courant à partir des propriétaires canoniques déjà chargés.
        </p>
      </section>`;
  }

  function markup(){
    return `
      <details class="atlas-collapse glass atlas-family-member atlas-tone-analysis"
               id="${DETAILS_ID}"
               data-collapse-key="decision-intelligence-current-truth"
               data-layout-family="analysis">
        <summary class="atlas-collapse-summary">
          <span class="atlas-collapse-copy">
            <span class="atlas-collapse-title">Decision Intelligence · vérité courante</span>
            <span class="atlas-collapse-subtitle">Event → mémoire → analogues → régime → calibration → survie capital</span>
          </span>
          <span class="atlas-collapse-state" data-open-label="Replier" data-closed-label="Déplier">Déplier</span>
        </summary>
        <div class="atlas-collapse-body">${waitingMarkup()}</div>
      </details>`;
  }

  function section01Slot(){
    /* 40.6.263 — canonical Section 01 subsection slot.
       Section 01 is owned by the Administrator Window Manager as a top-level
       semantic family. The slot is itself a top-level analysis-family member;
       Decision Intelligence is physically mounted inside it, so the panel is
       contained by 01 without wrapping or restructuring the existing family. */
    return document.getElementById("decisionIntelligenceSection01Slot");
  }

  function render(state){
    const host=document.getElementById(HOST_ID);
    if(!host)return false;
    host.outerHTML=bodyMarkup(state);
    return true;
  }

  function refresh(options={}){
    if(running)return cachedState;
    const event=currentNewsEvent();
    const eventId=eventIdOf(event);
    if(!options.force&&!dirty&&cachedState&&cachedEventId===eventId){
      render(cachedState);
      return cachedState;
    }
    running=true;
    try{
      const state=compute();
      cachedState=state;
      cachedEventId=eventIdOf(state?.event)||state?.event_id||eventId;
      dirty=false;
      render(state);
      return state;
    }finally{
      running=false;
    }
  }

  function invalidate(){
    dirty=true;
    return true;
  }

  function syncDisclosureState(details){
    const state=details?.querySelector?.(".atlas-collapse-state");
    if(!state)return false;
    const label=details.open?state.dataset.openLabel:state.dataset.closedLabel;
    if(label)state.textContent=label;
    return true;
  }

  function bind(details){
    if(!(details instanceof HTMLDetailsElement)||details.dataset.decisionTruthBound==="1")return false;
    details.dataset.decisionTruthBound="1";
    syncDisclosureState(details);
    details.addEventListener("toggle",()=>{
      syncDisclosureState(details);
      if(details.open)queueMicrotask(()=>refresh());
    },{passive:true});
    return true;
  }

  function mount(){
    const slot=section01Slot();
    if(!slot)return false;

    let details=document.getElementById(DETAILS_ID);
    if(!details){
      slot.insertAdjacentHTML("beforeend",markup());
      details=document.getElementById(DETAILS_ID);
    }else if(details.parentElement!==slot){
      slot.append(details);
    }

    bind(details);
    syncDisclosureState(details);
    return !!details;
  }

  function boot(){
    mount();
    document.addEventListener("agentcrypto:current-finalized",invalidate,{passive:true});
    document.addEventListener("erith:aether-news-open",invalidate,{passive:true});
  }

  globalThis.AgentCryptoDecisionIntelligenceCurrentTruth=Object.freeze({
    mount,refresh,invalidate,compute,
    snapshot:()=>cachedState,
    read_only:true,
    shared_state:true,
    storage_write:false,
    new_fetch:false,
    new_timer:false,
    new_observer:false,
    automatic_order:false,
    execution_authorized:false,
    financial_signal:false,
    presentation_family:"analysis",
    presentation_family_number:"01",
    presentation_move_in:"40.6.263"
  });

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();