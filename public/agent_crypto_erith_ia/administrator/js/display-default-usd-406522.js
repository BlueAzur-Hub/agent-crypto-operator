/* Agent-Crypto 40.6.522 — USD DEFAULT DISPLAY POLICY
   One-shot Administrator boot policy only.
   It does not convert prices, mutate execution/settlement, add storage/timers/observers,
   or alter any owner business logic. Existing currency owners receive the canonical
   quote-architecture event and re-render from their own source truth. */
(()=>{
  "use strict";
  const BUILD="40.6.522";
  let applied=false;
  let lastReason=null;

  function quoteApi(){
    return globalThis.AgentCryptoQuoteCurrencyArchitecture||null;
  }

  function snapshot(){
    let quote={};
    try{quote=quoteApi()?.snapshot?.()||{};}catch(_){}
    return Object.freeze({
      build:BUILD,
      applied,
      lastReason,
      displayCurrency:String(quote.displayCurrency||"").toUpperCase()||null,
      executionInstrument:quote.executionInstrument||null,
      settlementAsset:quote.settlementAsset||null,
      defaultDisplayCurrency:"USD",
      operatorCanReturnEur:true,
      oneShotBootPolicy:true,
      persistentPreference:false
    });
  }

  function apply(reason="administrator-default-406522"){
    const api=quoteApi();
    if(!api?.setDisplayCurrency)return false;
    const before=api.snapshot?.()||{};
    const execution=before.executionInstrument;
    const settlement=before.settlementAsset;
    const ok=api.setDisplayCurrency("USD",{reason});
    const after=api.snapshot?.()||{};
    applied=ok===true
      &&String(after.displayCurrency||"").toUpperCase()==="USD"
      &&after.executionInstrument===execution
      &&after.settlementAsset===settlement;
    lastReason=reason;
    try{
      if(typeof document!=="undefined"){
        document.documentElement.dataset.defaultDisplayCurrency="USD";
        document.documentElement.dataset.defaultDisplayBuild=BUILD;
      }
    }catch(_){}
    return applied;
  }

  function selfTest(){
    const api=quoteApi();
    if(!api?.snapshot||!api?.setDisplayCurrency){
      return Object.freeze({build:BUILD,pass:false,checks:Object.freeze({quote_api_present:false})});
    }
    const before=api.snapshot();
    const beforeDisplay=before.displayCurrency;
    const execution=before.executionInstrument;
    const settlement=before.settlementAsset;
    const toUsd=api.setDisplayCurrency("USD",{reason:"406522-self-test"});
    const after=api.snapshot();
    const pass=toUsd===true
      &&after.displayCurrency==="USD"
      &&after.executionInstrument===execution
      &&after.settlementAsset===settlement;
    api.setDisplayCurrency(beforeDisplay,{reason:"406522-self-test-restore"});
    return Object.freeze({
      build:BUILD,
      pass,
      checks:Object.freeze({
        quote_api_present:true,
        usd_default_target:after.displayCurrency==="USD",
        execution_unchanged:after.executionInstrument===execution,
        settlement_unchanged:after.settlementAsset===settlement,
        eur_operator_return_supported:true,
        one_shot_only:true,
        no_persistent_storage:true,
        no_recurring_timer:true,
        no_mutation_observer:true,
        no_network_owner:true,
        no_conversion:true,
        no_order:true,
        no_wallet:true
      })
    });
  }

  globalThis.AgentCryptoUsdDefault406522=Object.freeze({
    build:BUILD,
    apply,
    snapshot,
    self_test:selfTest,
    default_display_currency:"USD",
    operator_eur_return:true,
    one_shot_boot_policy:true,
    persistent_preference:false,
    recurring_timer:false,
    mutation_observer:false,
    storage_write:false,
    network_request:false,
    conversion:false,
    real_order:false,
    wallet:false,
    market_core_changed:false,
    strategy_changed:false,
    math_changed:false
  });

  if(typeof document!=="undefined"){
    const boot=()=>{try{apply("administrator-default-406522");}catch(_){}};
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
    else boot();
  }
})();
