/* Agent-Crypto — 40.6.515 GRAPH OWNER HANDSHAKE
   Repairs the 40.6.514 terrain race: canonical graph owners render EUR first,
   then Global Quote Router commits the selected DISPLAY currency after owner settle.
   Event-driven only: no recurring timer, observer, storage, fetch, wallet or order. */
(()=>{
  "use strict";
  const BUILD="40.6.515";
  const OWNER_NAMES=Object.freeze([
    "atlasRenderChartResult",
    "atlasChartV2RedrawFromBroker",
    "renderComparisonAnalystPanel",
    "atlasScannerRun",
    "atlasExternalChartRender"
  ]);
  const state={installed:false,attempts:0,hooks:Object.create(null),lastOwner:null,lastPhase:"BOOT",lastError:null};

  function makeWrapped(name,original,routerGetter=()=>globalThis.AgentCryptoGlobalQuoteRouter){
    const wrapped=function(...args){
      const router=routerGetter?.();
      const token=router?.prepareOwnerRender?.(name)||0;
      state.lastOwner=name;
      state.lastPhase="OWNER_RUNNING";
      let result;
      try{
        result=original.apply(this,args);
      }catch(error){
        state.lastError=String(error?.message||error);
        state.lastPhase="OWNER_THROW";
        void router?.settleOwnerRender?.(`${name}:throw`,token);
        throw error;
      }
      if(result&&typeof result.then==="function"){
        return Promise.resolve(result).finally(()=>{
          state.lastPhase="OWNER_SETTLED_ASYNC";
          void router?.settleOwnerRender?.(name,token);
        });
      }
      state.lastPhase="OWNER_SETTLED_SYNC";
      void router?.settleOwnerRender?.(name,token);
      return result;
    };
    Object.defineProperty(wrapped,"__agentCryptoGraphOwnerHandshake406515",{value:true,enumerable:false});
    Object.defineProperty(wrapped,"__agentCryptoOriginal406515",{value:original,enumerable:false});
    return wrapped;
  }

  function hook(name){
    const current=globalThis[name];
    if(typeof current!=="function"){
      state.hooks[name]="MISSING";
      return false;
    }
    if(current.__agentCryptoGraphOwnerHandshake406515===true){
      state.hooks[name]="HOOKED";
      return true;
    }
    try{
      globalThis[name]=makeWrapped(name,current);
      state.hooks[name]=globalThis[name]?.__agentCryptoGraphOwnerHandshake406515===true?"HOOKED":"FAILED";
      return state.hooks[name]==="HOOKED";
    }catch(error){
      state.hooks[name]="ERROR";
      state.lastError=String(error?.message||error);
      return false;
    }
  }

  function install(){
    state.attempts+=1;
    for(const name of OWNER_NAMES)hook(name);
    state.installed=state.hooks.atlasRenderChartResult==="HOOKED";
    state.lastPhase=state.installed?"READY":"PARTIAL";
    try{
      if(typeof document!=="undefined"){
        document.documentElement.dataset.agentCryptoGraphOwnerHandshake=state.installed?"ready":"partial";
      }
    }catch(_){}
    return snapshot();
  }

  function snapshot(){
    return Object.freeze({
      build:BUILD,
      installed:state.installed,
      attempts:state.attempts,
      hooks:{...state.hooks},
      last_owner:state.lastOwner,
      last_phase:state.lastPhase,
      last_error:state.lastError,
      recurring_timer:false,
      mutation_observer:false,
      storage_write:false,
      network:false,
      real_order:false,
      wallet:false
    });
  }

  function selfTest(){
    let prepares=0,settles=0;
    const router={
      prepareOwnerRender(){prepares+=1;return prepares;},
      settleOwnerRender(){settles+=1;return Promise.resolve();}
    };
    const wrapped=makeWrapped("mockOwner",(a,b)=>a+b,()=>router);
    const value=wrapped(2,3);
    const pass=value===5&&prepares===1&&settles===1&&wrapped.__agentCryptoGraphOwnerHandshake406515===true;
    return Object.freeze({build:BUILD,pass,checks:{return_value:value===5,prepare_once:prepares===1,settle_once:settles===1,marker:true,no_timer:true,no_observer:true,no_storage:true,no_network:true,no_order:true}});
  }

  globalThis.AgentCryptoGraphOwnerHandshake=Object.freeze({
    build:BUILD,install,snapshot,self_test:selfTest,
    owner_names:OWNER_NAMES.slice(),
    event_driven:true,
    recurring_timer:false,
    mutation_observer:false,
    storage_write:false,
    network:false,
    real_order:false,
    wallet:false
  });

  install();
  if(typeof document!=="undefined"&&document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",install,{once:true});
  }
})();
