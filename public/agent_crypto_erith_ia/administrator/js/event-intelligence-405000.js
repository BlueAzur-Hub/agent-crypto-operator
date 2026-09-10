/* Agent-Crypto @erith.IA — Event Intelligence Foundation
   Build 40.5.0. Read-only normalization over the existing News Sentinel archive.
   No fetch, no timer, no storage write, no trading action, no causal claim. */
(() => {
  "use strict";
  const BUILD="40.5.0";
  const SCHEMA="atlas_market_event_intelligence_v1";
  const WINDOWS=Object.freeze(["T0","+1h","+4h","+12h","+24h","+48h","+7d"]);
  const finite=value=>{const n=Number(value);return Number.isFinite(n)?n:null;};
  const text=value=>String(value??"").replace(/\s+/g," ").trim();
  const list=value=>Array.isArray(value)?[...new Set(value.map(v=>text(v)).filter(Boolean))]:[];
  function family(event){
    const type=text(event?.event_type).toLowerCase();
    const label=text(event?.event_label).toLowerCase();
    const headline=text(event?.headline_original||event?.headline||event?.display_headline).toLowerCase();
    const domains=list(event?.driver_domains).map(v=>v.toLowerCase());
    const topics=list(event?.matched_topics).map(v=>v.toLowerCase());
    const haystack=[type,label,headline,...domains,...topics].join(" ");
    if(type==="security"||/hack|exploit|cybers[ée]curit|attaque|pirat|breach/.test(haystack))return "security";
    if(/faillite|bankrupt|bankruptcy|insolv|retraits?|withdrawals?|bank run/.test(haystack))return "liquidity";
    if(domains.includes("institutional_flows")||/\betf\b|institution|inflows?|outflows?|fonds cot|treasury buy|accumulat/.test(haystack))return "institutional_flows";
    if(domains.includes("regulation")||/r[ée]glement|\bsec\b|\bcftc\b|\bmica\b|enforcement|congress|white house/.test(haystack))return "regulation";
    if(domains.includes("leverage")||/liquidat|leverage|funding rate|futures?|open interest|short squeeze|long squeeze/.test(haystack))return "leverage";
    if(domains.includes("macro_liquidity")||/federal reserve|\bfed\b|\bbce\b|\becb\b|treasury|taux|rates?|inflation|emploi|jobs|liquidit|jackson hole/.test(haystack))return "macro_liquidity";
    return "market_event";
  }
  function normalize(event){
    if(!event||typeof event!=="object")return null;
    const id=text(event.event_id||event.id||event.fingerprint);
    const eventTime=text(event.event_time||event.published_at||event.first_seen_at||event.last_seen_at);
    const sourceName=text(event.source_name||event.source_host||event.source_class);
    const eventFamily=family(event);
    const assets=list(event.assets).map(v=>v.toUpperCase());
    const sectors=list(event.sectors);
    const driverDomains=list(event.driver_domains);
    const matchedTopics=list(event.matched_topics);
    const sourceGroup=text(event.source_group).toLowerCase();
    const displayLanguage=text(event.display_language).toLowerCase()||null;
    const translationStatus=text(event.translation_status)||null;
    const headlineOriginal=text(event.headline_original||event.headline)||null;
    const displayHeadline=text(event.display_headline)||null;
    const record={
      schema:SCHEMA,
      build:BUILD,
      event_id:id||null,
      event_family:eventFamily,
      event_label:text(event.event_label)||null,
      event_time:eventTime||null,
      actor:null,
      action:null,
      amount:null,
      novelty:null,
      surprise:null,
      assets,
      sectors,
      affected_markets:[...new Set([assets.length?"crypto":null,...driverDomains].filter(Boolean))],
      driver_domains:driverDomains,
      matched_topics:matchedTopics,
      source:{
        name:sourceName||null,
        host:text(event.source_host)||null,
        url:text(event.source_url||event.url)||null,
        group:sourceGroup||null,
        class:text(event.source_class)||null,
        count:finite(event.source_count),
        primary:sourceGroup==="primary"
      },
      evidence:{score:finite(event?.evidence?.score),level:text(event?.evidence?.level)||null},
      impact:{score:finite(event?.impact?.score),level:text(event?.impact?.level)||null},
      decision:{action:text(event?.decision?.action)||null,tone:text(event?.decision?.tone)||null,checks:text(event?.decision?.checks)||null},
      language:{display:displayLanguage,translation_status:translationStatus,headline_original:headlineOriginal,display_headline:displayHeadline},
      reaction_windows:[...WINDOWS],
      reaction_memory:null,
      causal_claim:false,
      financial_signal:false,
      automatic_order:false,
      ready_for_reaction_memory:Boolean(id&&eventTime&&sourceName),
      missing_structured_fields:["actor","action","amount","novelty","surprise"]
    };
    return Object.freeze(record);
  }
  function sourceSnapshot(){
    try{
      const owner=globalThis.AgentCryptoNewsEventSource405000;
      return owner&&typeof owner.snapshot==="function"?(owner.snapshot()||null):null;
    }catch(_){return null;}
  }
  function archive(){
    const source=sourceSnapshot();
    const events=Array.isArray(source?.events)?source.events:[];
    return Object.freeze(events.map(normalize).filter(Boolean));
  }
  function current(){
    const source=sourceSnapshot();
    return normalize(source?.current||null);
  }
  globalThis.AtlasEventIntelligence405000=Object.freeze({
    build:BUILD,schema:SCHEMA,normalize,archive,current,reaction_windows:WINDOWS,
    read_only:true,new_fetch:false,new_timer:false,new_storage_owner:false,storage_write:false,
    causal_claim:false,financial_signal:false,automatic_order:false,
    source_owner:"AgentCryptoNewsEventSource405000 read-only bridge over News Sentinel canonical archive",
    next_owner_required:"Event Reaction Memory persistence must reuse a validated memory owner before 40.5.1"
  });
})();
