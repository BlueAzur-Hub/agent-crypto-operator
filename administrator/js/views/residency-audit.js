/* Agent-Crypto @erith.IA — 40.4.89 · Residency Audit Owner-Aware
   READ-ONLY / DEMAND-ONLY / OWNER-AWARE
   Manual diagnostic only; no automatic mutation or sweep. */
(()=>{
  "use strict";

  const BUILD="40.4.89";
  const PROTECTED=Object.freeze([
    "#analyste",
    "#detailPanel",
    "#atlasStorageHealth40198",
    "#atlasGreyPlateForensic40393"
  ]);
  const EXPECTED_REGISTERED=Object.freeze(["system","atlas"]);
  const EXPECTED_TRUE_LAZY=Object.freeze(["projects","operations","system","oracle"]);
  const SYSTEM_GENERIC_KEYS=Object.freeze(["simulation"]);

  const now=()=>new Date().toISOString();
  const safeCount=node=>{try{return node?1+node.querySelectorAll("*").length:0;}catch{return node?1:0;}};

  function duplicateIds(){
    const seen=new Map(),dupes=[];
    document.querySelectorAll("[id]").forEach(node=>{
      const id=String(node.id||"");
      if(!id)return;
      const count=(seen.get(id)||0)+1;
      seen.set(id,count);
      if(count===2)dupes.push(id);
    });
    return dupes;
  }

  function protectedSnapshot(){
    return PROTECTED.map(selector=>{
      const node=document.querySelector(selector);
      return Object.freeze({selector,exists:!!node,connected:node?.isConnected===true,subtree_nodes:safeCount(node)});
    });
  }

  function familyRollup(registrations){
    return Object.freeze(registrations.map(reg=>{
      const records=Array.isArray(reg?.records)?reg.records:[];
      const detached=records.filter(record=>record?.detached===true);
      const trackedNodes=records.reduce((sum,record)=>sum+(Number(record?.cached_nodes)||0),0);
      const detachedNodes=detached.reduce((sum,record)=>sum+(Number(record?.cached_nodes)||0),0);
      return Object.freeze({id:String(reg?.id||""),details:Number(reg?.details||records.length||0),records:records.length,keys:Object.freeze(records.map(record=>String(record?.key||""))),detached_records:detached.length,resident_records:records.length-detached.length,tracked_subtree_nodes:trackedNodes,detached_subtree_nodes:detachedNodes});
    }));
  }

  function lazyTransports(){
    return Object.freeze({
      projects:globalThis.ErithProjectsPresentation40420?.snapshot?.()||null,
      operations:globalThis.ErithOperationsPresentation40421?.snapshot?.()||null,
      system:globalThis.ErithSystemPresentation40424?.snapshot?.()||null,
      oracle:globalThis.ErithOraclePresentation?.snapshot?.()||null
    });
  }

  function run(){
    const life=globalThis.ErithPresentationLifecycle;
    const lifecyclePresent=!!life;
    const registrations=lifecyclePresent&&typeof life.residencySnapshot==="function"?life.residencySnapshot():[];
    const measurements=lifecyclePresent&&typeof life.measurementSnapshot==="function"?life.measurementSnapshot():[];
    const protectedState=protectedSnapshot();
    const ids=duplicateIds();
    const transports=lazyTransports();
    const violations=[];

    if(!lifecyclePresent)violations.push("lifecycle-missing");
    protectedState.forEach(item=>{if(!item.exists)violations.push(`protected-missing:${item.selector}`);else if(!item.connected)violations.push(`protected-disconnected:${item.selector}`);});
    ids.forEach(id=>violations.push(`duplicate-id:${id}`));

    const registrationIds=registrations.map(reg=>String(reg?.id||"")).filter(Boolean);
    EXPECTED_REGISTERED.forEach(id=>{if(!registrationIds.includes(id))violations.push(`missing-registration:${id}`);});
    registrationIds.forEach(id=>{if(!EXPECTED_REGISTERED.includes(id))violations.push(`unexpected-registration:${id}`);});
    EXPECTED_TRUE_LAZY.forEach(id=>{if(!transports[id])violations.push(`missing-true-lazy-owner:${id}`);});

    registrations.forEach(reg=>{(reg.records||[]).forEach(record=>{if(record.open&&record.detached)violations.push(`open-detached:${reg.id}:${record.key}`);if(!record.connected)violations.push(`details-disconnected:${reg.id}:${record.key}`);});});

    const systemRegistration=registrations.find(reg=>String(reg?.id||"")==="system")||null;
    const systemKeys=(systemRegistration?.records||[]).map(record=>String(record?.key||""));
    SYSTEM_GENERIC_KEYS.forEach(key=>{if(!systemKeys.includes(key))violations.push(`system-generic-missing:${key}`);});
    systemKeys.forEach(key=>{if(!SYSTEM_GENERIC_KEYS.includes(key))violations.push(`system-generic-unexpected:${key}`);});

    const rollup=familyRollup(registrations);
    const totalRecords=rollup.reduce((n,item)=>n+item.records,0);
    const detachedRecords=rollup.reduce((n,item)=>n+item.detached_records,0);
    const trackedNodes=rollup.reduce((n,item)=>n+item.tracked_subtree_nodes,0);
    const detachedNodes=rollup.reduce((n,item)=>n+item.detached_subtree_nodes,0);

    return Object.freeze({build:BUILD,generated_at:now(),mode:"read-only-manual-owner-aware-audit",lifecycle_present:lifecyclePresent,lifecycle_build:String(life?.build||""),expected_registered_families:Object.freeze([...EXPECTED_REGISTERED]),expected_true_lazy_families:Object.freeze([...EXPECTED_TRUE_LAZY]),expected_system_generic_keys:Object.freeze([...SYSTEM_GENERIC_KEYS]),active_registrations:Number(life?.activeRegistrations?.()||0),registered_records:totalRecords,protected_nodes:Object.freeze(protectedState),duplicate_ids:Object.freeze(ids),detached_records:detachedRecords,resident_records:totalRecords-detachedRecords,tracked_subtree_nodes:trackedNodes,detached_subtree_nodes:detachedNodes,cached_subtree_nodes:detachedNodes,family_rollup:rollup,lazy_transports:transports,measurements,registrations,healthy:violations.length===0,violations:Object.freeze(violations),mutations_performed:false,timer_added:false,observer_added:false,fetch_added:false,websocket_added:false,storage_write_added:false,engine_state_changed:false});
  }

  const api=Object.freeze({build:BUILD,run,protected_selectors:PROTECTED,expected_registered_families:EXPECTED_REGISTERED,expected_true_lazy_families:EXPECTED_TRUE_LAZY,expected_system_generic_keys:SYSTEM_GENERIC_KEYS,read_only:true,automatic_run:false,timer_added:false,observer_added:false,fetch_added:false,websocket_added:false,storage_write_added:false,dom_mutation_added:false});

  globalThis.ErithResidencyAudit=api;
  globalThis.ErithResidencyAudit40489=api;
  globalThis.ErithResidencyAuditVNext=api;
})();
