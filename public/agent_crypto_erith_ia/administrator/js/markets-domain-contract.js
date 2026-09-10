/* Agent-Crypto @erith.IA — 40.4.213
   MARKET ARCHITECTURE TRUTH CONVERGENCE
   Passive compatibility facade. The active router is market-stack.js;
   parallel domain runtime is parallel-markets.js. No shell, fetch,
   timer, observer, storage or engine ownership is created here. */
(() => {
  "use strict";
  const BUILD="40.4.213";
  const ORDER=Object.freeze(["crypto","metals","indices","energy","cross-market"]);
  const ACTIVE_PARALLEL=Object.freeze(["indices","energy","cross-market"]);
  const CONTRACT=Object.freeze({
    schema:"agent_crypto_markets_domain_contract_v2",
    build:BUILD,
    state:"CANONICAL_PASSIVE_TRUTH_FACADE",
    order:ORDER,
    owners:Object.freeze({
      router:"js/market-stack.js::ErithDomainSkeletonMirror404174",
      crypto:"app.js · Market Core 38.15.11",
      metals:"existing app.js Metals runtime + AtlasParallelMarketDemand40465.ensure",
      parallel:"js/parallel-markets.js::ErithParallelMarketsRuntime",
      deep_reading:"js/market-reading-depth.js"
    }),
    native_domains:Object.freeze(["crypto","metals"]),
    parallel_domains:ACTIVE_PARALLEL,
    legacy:Object.freeze({
      parallel_router_404166:"HISTORICAL_SUPERSEDED",
      market_cascade_404167:"HISTORICAL_SUPERSEDED",
      commodities_separate_domain:"SUPERSEDED_BY_ENERGY_SCOPE"
    }),
    crypto_geometry_master:true,
    source_truth_per_domain:true,
    second_engine_created:false,
    new_network_owner:false,
    new_timer:false,
    new_observer:false,
    new_storage_owner:false,
    readiness(){
      const stack=globalThis.ErithDomainSkeletonMirror404174;
      const parallel=globalThis.ErithParallelMarketsRuntime;
      return Object.freeze({
        router:Boolean(stack && Array.isArray(stack.order) && stack.order.join("|")===ORDER.join("|")),
        crypto:true,
        metals:true,
        indices:Boolean(parallel?.active?.includes?.("indices")),
        energy:Boolean(parallel?.active?.includes?.("energy")),
        cross_market:Boolean(parallel?.active?.includes?.("cross-market"))
      });
    }
  });
  globalThis.ErithMarketsDomainContract404213=CONTRACT;
  // Historical public names remain as compatibility aliases, but they no
  // longer claim the obsolete 40.4.166/167 architecture as current truth.
  globalThis.ErithParallelMarketsRouter404166=Object.freeze({
    build:"40.4.166", state:"HISTORICAL_NAME_CURRENT_FACADE", superseded_by:BUILD,
    active_domains:Object.freeze({crypto:{state:"ACTIVE_NATIVE"},metals:{state:"ACTIVE_NATIVE_DEMAND"},indices:{state:"ACTIVE_PARALLEL"},energy:{state:"ACTIVE_PARALLEL"},"cross-market":{state:"ACTIVE_PARALLEL"}}),
    future_domains:Object.freeze({}), readiness:CONTRACT.readiness,
    direct_reinitialize_forbidden:true, second_engine_created:false
  });
  globalThis.ErithMarketCascade404167=Object.freeze({
    build:"40.4.167", state:"HISTORICAL_SUPERSEDED", superseded_by:BUILD,
    order:ORDER, shell_visible_does_not_mean_runtime_active:true,
    snapshot:()=>Object.freeze({build:BUILD,state:"SUPERSEDED_BY_CYCLIC_SINGLE_SURFACE",order:ORDER})
  });
  document.documentElement.dataset.marketsDomainContractBuild=BUILD;
  document.documentElement.dataset.marketsDomainContractRevision="ARCHITECTURE_TRUTH_V2";
})();
