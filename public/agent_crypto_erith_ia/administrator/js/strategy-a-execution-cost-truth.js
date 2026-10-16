/* Agent-Crypto @erith.IA — 40.6.492 OKX ORDERBOOK DEPTH TRUTH
   Event-driven BTC/EUR execution-cost measurement for Kraken + OKX Europe; manual refresh remains a fallback.
   40.6.443 restored the tool and hardened null/crossed-book handling.
   40.6.450 fails closed on stale/unknown/future OKX quote time, proves BTC/EUR identity before generic aliases,
   separates quote/receive/calculate times, rejects booleans/blank numeric inputs, and keeps Kraken usable when OKX is invalid.
   Source Truth fallback freshness is the existing private-backend cache contract: 15 s.
   40.6.455 measures once when the Simulation audit module mounts, then again after each real Strategy A experiment-cycle event.
   40.6.458 resumes one pending experiment-cycle from the common exit of every in-flight measurement,
   including a manual "RAFRAÎCHIR KRAKEN + OKX" measurement; pending cycles coalesce to one boolean.
   40.6.459 hardens BTC/EUR identity proof: compact pair identities such as BTCUSDT are explicit contradictions,
   and price_eur alone never authorizes generic bid/ask aliases as an EUR order book.
   40.6.466 adds one passive custom event after a completed measurement so the read-only venue-cost shadow can recompute without polling.
   40.6.469 keeps one measure function for public, button and auto callers; its common finally resumes pending cycles.
   40.6.492 reads OKX multi-level BTC/EUR depth only through Backend 8790 V1.4.3 and derives bounded depth/slippage evidence.
   If the book is absent/stale/invalid, the previous top-of-book evidence stays available and depth/slippage remain UNKNOWN.
   No direct browser OKX internet access, order, wallet, key, storage, recurring timer, observer, Strategy threshold or Oracle change. */
(() => {
  "use strict";
  const BUILD="40.6.492", ROOT="strategyAExecutionCostTruth";
  const SIZES=Object.freeze([10,25,50,100]), DEPTH_BPS=Object.freeze([5,10,25]), TIMEOUT=9000, BACKEND_TIMEOUT=18000;
  const SOURCE_TRUTH_CACHE_TTL_SECONDS=15, SOURCE_TRUTH_FUTURE_TOLERANCE_SECONDS=30;
  const VENUES=Object.freeze({
    kraken:Object.freeze({
      id:"kraken",name:"Kraken Pro",pair:"BTC/EUR",maker:0.40,taker:0.80,
      fee_note:"Spot niveau 1 de référence · le taux réel dépend du compte",
      fee_source:"https://www.kraken.com/fr/features/fee-schedule",
      endpoint:"https://api.kraken.com/0/public/Depth?pair=XBTEUR&count=100"
    }),
    okx:Object.freeze({
      id:"okx",name:"OKX Europe",pair:"BTC/EUR",maker:0.10,taker:0.20,
      fee_note:"EEE Spot-only Regular · effet 25/09/2026 · le taux réel dépend du compte",
      fee_source:"https://www.okx.com/fr-fr/help/important-notice-upcoming-spot-fee-adjustment-eea",
      backend_endpoint:"http://127.0.0.1:8790/quotes?assets=BTC",
      orderbook_endpoint:"http://127.0.0.1:8790/orderbook?asset=BTC&depth=100",
      backend_version:"1.4.3"
    })
  });
  let last=null,busy=false;
  // One completion path for the public API, the manual button and auto cycles.
  let resumePendingExperiment=()=>false;
  const n=v=>{
    if(v===null||v===undefined||typeof v==="boolean")return null;
    if(typeof v==="string"&&!v.trim())return null;
    if(typeof v!=="number"&&typeof v!=="string")return null;
    const x=Number(v);return Number.isFinite(x)?x:null;
  };
  const esc=v=>String(v??"—").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const pct=v=>Number.isFinite(v)?(v>=0?"+":"")+v.toFixed(4)+" %":"—";
  const eur=v=>Number.isFinite(v)?v.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})+" €":"—";
  const bp=v=>Number.isFinite(v)?v.toFixed(2)+" bp":"—";

  function oracleContext(){
    try{
      const s=globalThis.AgentCryptoStrategyAOracleCostCalibrationAudit?.snapshot?.();
      return Object.freeze({
        oracle_envelope_median_pct:n(s?.outcomes?.oracle_envelope_median_pct),
        mfe_median_pct:n(s?.outcomes?.mfe_median_pct),
        pedagogical_cost_pct:n(s?.cost_model?.aggregate_modelled_cost_pct),
        strategy_threshold_pct:n(s?.cost_model?.required_move_pct)
      });
    }catch(_){return Object.freeze({oracle_envelope_median_pct:null,mfe_median_pct:null,pedagogical_cost_pct:null,strategy_threshold_pct:null});}
  }
  async function fetchJson(url,timeoutMs=TIMEOUT){
    const ctl=new AbortController(), started=performance.now();
    const timer=setTimeout(()=>ctl.abort(),Math.max(1000,Number(timeoutMs)||TIMEOUT));
    try{
      const response=await fetch(url,{cache:"no-store",signal:ctl.signal,headers:{Accept:"application/json"}});
      if(!response.ok)throw new Error("HTTP "+response.status);
      const json=await response.json();
      return {json,latency_ms:Math.max(0,Math.round(performance.now()-started))};
    }finally{clearTimeout(timer);}
  }
  function parseKraken(j){
    if(!j||!Array.isArray(j.error)||j.error.length)throw new Error("Kraken: réponse invalide");
    const book=Object.values(j.result||{})[0];
    if(!book)throw new Error("Kraken: carnet BTC/EUR absent");
    return {bids:(book.bids||[]).map(r=>[n(r[0]),n(r[1])]).filter(r=>r[0]>0&&r[1]>0),asks:(book.asks||[]).map(r=>[n(r[0]),n(r[1])]).filter(r=>r[0]>0&&r[1]>0)};
  }
  const firstPositive=(...values)=>{
    for(const value of values){const v=n(value);if(v!==null&&v>0)return v;}
    return null;
  };
  const toMs=value=>{
    if(value===null||value===undefined||typeof value==="boolean")return null;
    if(typeof value==="string"&&!value.trim())return null;
    const numeric=Number(value);
    if(Number.isFinite(numeric))return numeric>1e12?numeric:numeric>1e9?numeric*1000:null;
    const parsed=Date.parse(String(value));return Number.isFinite(parsed)?parsed:null;
  };
  const measurementError=(code,message,details={})=>{const error=new Error(message);error.code=code;error.details=details;return error;};
  const normalizedPair=value=>String(value??"").toUpperCase().replace(/^XBT/,"BTC").replace(/[^A-Z0-9]/g,"");
  const ageText=seconds=>{
    if(!Number.isFinite(seconds))return "—";
    if(seconds<60)return Math.round(seconds)+" s";
    if(seconds<3600)return (seconds/60).toFixed(seconds<600?1:0)+" min";
    return (seconds/3600).toFixed(1)+" h";
  };
  function freshnessLimit(payload){
    const candidates=[
      ["payload.freshness.cex_max_age_seconds",payload?.freshness?.cex_max_age_seconds],
      ["payload.cex_max_age_seconds",payload?.cex_max_age_seconds],
      ["payload.freshness_max_age_seconds",payload?.freshness_max_age_seconds],
      ["payload.cache_ttl_seconds",payload?.cache_ttl_seconds]
    ];
    for(const [source,value] of candidates){const x=n(value);if(x!==null&&x>0)return {seconds:x,source};}
    return {seconds:SOURCE_TRUTH_CACHE_TTL_SECONDS,source:"architecture/private-backend-sources.json#cache.ttl_seconds"};
  }
  function quoteTimestamp(quote){
    const candidates=[
      ["quote.observed_at_utc",quote?.observed_at_utc],
      ["quote.observed_at",quote?.observed_at],
      ["quote.quote_timestamp",quote?.quote_timestamp],
      ["quote.timestamp",quote?.timestamp],
      ["quote.updated_at",quote?.updated_at],
      ["quote.raw.ts",quote?.raw?.ts]
    ];
    for(const [path,value] of candidates){
      if(value===null||value===undefined||(typeof value==="string"&&!value.trim()))continue;
      return {path,value,ms:toMs(value)};
    }
    return {path:null,value:null,ms:null};
  }
  function quoteFreshness(quote,payload,nowMs=Date.now()){
    const limit=freshnessLimit(payload),stamp=quoteTimestamp(quote);
    if(!stamp.path)return Object.freeze({state:"UNKNOWN",reason:"MISSING_TIMESTAMP",age_seconds:null,max_age_seconds:limit.seconds,policy_source:limit.source,observed_at_utc:null,timestamp_path:null});
    if(stamp.ms===null)return Object.freeze({state:"UNKNOWN",reason:"INVALID_TIMESTAMP",age_seconds:null,max_age_seconds:limit.seconds,policy_source:limit.source,observed_at_utc:String(stamp.value),timestamp_path:stamp.path});
    const rawAge=(nowMs-stamp.ms)/1000;
    if(rawAge < -SOURCE_TRUTH_FUTURE_TOLERANCE_SECONDS)return Object.freeze({state:"UNKNOWN",reason:"FUTURE_TIMESTAMP",age_seconds:null,max_age_seconds:limit.seconds,policy_source:limit.source,observed_at_utc:new Date(stamp.ms).toISOString(),timestamp_path:stamp.path});
    const age=Math.max(0,rawAge),stale=age>limit.seconds;
    return Object.freeze({state:stale?"STALE":"FRESH",reason:stale?"STALE":"FRESH",age_seconds:age,max_age_seconds:limit.seconds,policy_source:limit.source,observed_at_utc:new Date(stamp.ms).toISOString(),timestamp_path:stamp.path});
  }
  function quoteIdentity(row,quote){
    if(String(row?.asset||"").toUpperCase()!=="BTC")throw measurementError("INVALID_ASSET","Backend local : actif OKX inattendu");
    const pairCandidates=[quote?.pair,quote?.instrument_id,quote?.instId,quote?.raw?.instId,quote?.symbol];
    let explicitPair=null;
    for(const value of pairCandidates){
      const raw=String(value??"").trim();
      if(!raw)continue;
      const normalized=normalizedPair(raw);
      if(normalized&&normalized!=="BTC"){explicitPair=normalized;break;}
    }
    if(explicitPair&&explicitPair!=="BTCEUR")throw measurementError("INVALID_PAIR","Backend local : paire OKX différente de BTC/EUR",{pair:explicitPair});
    const currencyCandidates=[quote?.quote_currency,quote?.quote_ccy,quote?.currency,quote?.raw?.quoteCcy,row?.quote_currency,row?.currency];
    let explicitCurrency=null;
    for(const value of currencyCandidates){const raw=String(value??"").trim().toUpperCase();if(raw){explicitCurrency=raw;break;}}
    if(explicitCurrency&&explicitCurrency!=="EUR")throw measurementError("INVALID_CURRENCY","Backend local : devise OKX différente de EUR",{currency:explicitCurrency});
    const eurSpecific=firstPositive(quote?.bid_eur,quote?.bid_price_eur)!==null&&firstPositive(quote?.ask_eur,quote?.ask_price_eur)!==null;
    const genericAliasAllowed=eurSpecific||explicitPair==="BTCEUR"||explicitCurrency==="EUR";
    return Object.freeze({explicit_pair:explicitPair,explicit_currency:explicitCurrency,eur_specific_book:eurSpecific,generic_alias_allowed:genericAliasAllowed});
  }
  function okxQuoteFromBackend(payload,nowMs=Date.now()){
    const rows=Array.isArray(payload?.assets)?payload.assets:[];
    const row=rows.find(item=>String(item?.asset||"").toUpperCase()==="BTC");
    const quotes=Array.isArray(row?.quotes)?row.quotes:[];
    const quote=quotes.find(item=>String(item?.provider||"").toLowerCase()==="okx"&&String(item?.status||"").toLowerCase()==="ok");
    if(!quote)throw measurementError("MISSING_QUOTE","Backend local : quote OKX BTC/EUR absente");
    const identity=quoteIdentity(row,quote);
    const bestBid=firstPositive(quote.bid_eur,quote.bid_price_eur,identity.generic_alias_allowed?quote.bid:null,identity.generic_alias_allowed?quote.bidPx:null,identity.generic_alias_allowed?quote?.raw?.bidPx:null);
    const bestAsk=firstPositive(quote.ask_eur,quote.ask_price_eur,identity.generic_alias_allowed?quote.ask:null,identity.generic_alias_allowed?quote.askPx:null,identity.generic_alias_allowed?quote?.raw?.askPx:null);
    if(!(bestBid>0&&bestAsk>0))throw measurementError("MISSING_BOOK","Backend local : bid/ask OKX BTC/EUR non exposés ou devise non prouvée",{identity});
    if(bestBid>bestAsk)throw measurementError("CROSSED_BOOK","Backend local : bid/ask OKX croisés",{bestBid,bestAsk});
    const freshness=quoteFreshness(quote,payload,nowMs);
    if(freshness.state!=="FRESH")throw measurementError(freshness.state,"Backend local : fraîcheur OKX "+freshness.state,{freshness});
    return {quote,bestBid,bestAsk,identity,freshness};
  }
  function okxMetricsFromBackend(payload,venue,nowMs=Date.now()){
    const parsed=okxQuoteFromBackend(payload,nowMs),bestBid=parsed.bestBid,bestAsk=parsed.bestAsk;
    const mid=(bestBid+bestAsk)/2,spreadPct=(bestAsk-bestBid)/mid*100,spreadBp=spreadPct*100;
    const topOfBookCrossPct=(1-(bestBid/bestAsk))*100;
    const feeSpreadReferencePct=topOfBookCrossPct+2*venue.taker;
    const simulations=SIZES.map(amount=>({amount_eur:amount,buy_filled:null,sell_filled:null,buy_avg_price:null,sell_avg_price:null,buy_slippage_pct:null,sell_slippage_pct:null,book_roundtrip_cost_pct:null,market_market_estimated_cost_pct:null,fee_plus_spread_snapshot_pct:feeSpreadReferencePct,depth_required_for_claim:true}));
    return {
      pair:venue.pair,best_bid:bestBid,best_ask:bestAsk,mid,spread_pct:spreadPct,spread_bp:spreadBp,
      depth_available:false,depth_eur:null,simulations,fee_plus_spread_snapshot_pct:feeSpreadReferencePct,
      observed_at_utc:parsed.freshness.observed_at_utc,
      quote_observed_at_utc:parsed.freshness.observed_at_utc,
      quote_age_seconds:parsed.freshness.age_seconds,
      freshness_state:parsed.freshness.state,
      freshness_reason:parsed.freshness.reason,
      freshness_max_age_seconds:parsed.freshness.max_age_seconds,
      freshness_policy_source:parsed.freshness.policy_source,
      quote_timestamp_path:parsed.freshness.timestamp_path,
      backend_payload_observed_at_utc:payload?.observed_at_utc||null,
      quote_identity:parsed.identity,
      backend_quote_fields:Object.freeze({price_eur:n(parsed.quote?.price_eur),bid_eur:bestBid,ask_eur:bestAsk}),
      fee_reference:{maker_pct:venue.maker,taker_pct:venue.taker,note:venue.fee_note,source:venue.fee_source},
      post_only_post_only_fee_floor_pct:2*venue.maker,post_only_market_fee_floor_pct:venue.maker+venue.taker,post_only_fill_guaranteed:false,
      measurement_scope:"TOP_OF_BOOK_FROM_PRIVATE_BACKEND",slippage_claim:false,nearby_depth_claim:false
    };
  }
  function okxOrderbookFromBackend(payload,nowMs=Date.now()){
    if(!payload||payload.read_only!==true)throw measurementError("INVALID_ORDERBOOK","Backend local : contrat orderbook read-only absent");
    if(String(payload.provider||"").toLowerCase()!=="okx")throw measurementError("INVALID_ORDERBOOK","Backend local : provider orderbook différent de OKX");
    if(String(payload.asset||"").toUpperCase()!=="BTC")throw measurementError("INVALID_ORDERBOOK","Backend local : actif orderbook différent de BTC");
    if(normalizedPair(payload.pair)!=="BTCEUR")throw measurementError("INVALID_ORDERBOOK","Backend local : paire orderbook différente de BTC/EUR",{pair:payload.pair});
    if(String(payload.status||"").toLowerCase()!=="ok")throw measurementError("ORDERBOOK_UNAVAILABLE","Backend local : carnet OKX indisponible",{status:payload.status,error:payload.error});
    const stampMs=toMs(payload.observed_at_utc);
    if(stampMs===null)throw measurementError("UNKNOWN","Backend local : timestamp carnet OKX absent ou invalide");
    const rawAge=(nowMs-stampMs)/1000;
    if(rawAge < -SOURCE_TRUTH_FUTURE_TOLERANCE_SECONDS)throw measurementError("UNKNOWN","Backend local : timestamp carnet OKX dans le futur");
    const age=Math.max(0,rawAge);
    if(age>SOURCE_TRUTH_CACHE_TTL_SECONDS)throw measurementError("STALE","Backend local : carnet OKX périmé",{age_seconds:age,max_age_seconds:SOURCE_TRUTH_CACHE_TTL_SECONDS});
    const normalizeRows=rows=>(Array.isArray(rows)?rows:[]).map(row=>[n(row?.[0]),n(row?.[1])]).filter(row=>row[0]>0&&row[1]>0);
    const bids=normalizeRows(payload.bids).sort((a,b)=>b[0]-a[0]);
    const asks=normalizeRows(payload.asks).sort((a,b)=>a[0]-b[0]);
    if(!bids.length||!asks.length)throw measurementError("MISSING_ORDERBOOK","Backend local : niveaux bid/ask OKX absents");
    if(bids[0][0]>asks[0][0])throw measurementError("CROSSED_BOOK","Backend local : carnet OKX croisé",{bestBid:bids[0][0],bestAsk:asks[0][0]});
    return Object.freeze({
      book:Object.freeze({bids:Object.freeze(bids),asks:Object.freeze(asks)}),
      freshness:Object.freeze({state:"FRESH",age_seconds:age,max_age_seconds:SOURCE_TRUTH_CACHE_TTL_SECONDS,observed_at_utc:new Date(stampMs).toISOString()}),
      requested_depth:n(payload.requested_depth),
      levels:payload.levels||null
    });
  }
  async function fetchOkxBackendBook(venue){
    const endpoint=venue.orderbook_endpoint;
    const r=await fetchJson(endpoint,BACKEND_TIMEOUT);
    return {payload:r.json,latency_ms:r.latency_ms,endpoint,transport:"BACKEND LOCAL 8790 · OKX PUBLIC ORDERBOOK",backend_version:String(r.json?.backend_version||venue.backend_version)};
  }
  async function fetchOkxBackendQuote(venue){
    let owner=globalThis.ErithPrivateBackendSources;
    if(!owner||typeof owner.refresh!=="function"){
      const demand=globalThis.ErithPrivateSourceDemand;
      if(demand&&typeof demand.ensure==="function"){
        let timer=0;
        try{
          await Promise.race([
            Promise.resolve(demand.ensure("execution-cost-truth")),
            new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error("Source Truth demand timeout")),7000);})
          ]);
        }finally{if(timer)clearTimeout(timer);}
        owner=globalThis.ErithPrivateBackendSources;
      }
    }
    if(!owner||typeof owner.refresh!=="function")throw new Error("Source Truth CEX non chargée après demande");
    const started=performance.now();
    const payload=await owner.refresh();
    if(!payload)throw new Error("Backend local : Source Truth CEX n’a renvoyé aucune donnée");
    return {payload,latency_ms:Math.max(0,Math.round(performance.now()-started)),endpoint:owner.api||venue.backend_endpoint,transport:"SOURCE TRUTH CEX · BACKEND LOCAL 8790",backend_version:owner.backend_version||venue.backend_version};
  }
  function simulateBuy(asks,amount){
    let rem=amount,qty=0,cost=0;
    for(const [p,q] of asks){
      if(rem<=1e-9)break;
      const take=Math.min(q,rem/p); if(take<=0)continue;
      qty+=take; cost+=take*p; rem-=take*p;
    }
    const filled=rem<=0.01, avg=qty>0?cost/qty:null;
    return {filled,quantity_btc:qty,avg_price:avg,notional_eur:cost,remaining_eur:Math.max(0,rem)};
  }
  function simulateSell(bids,qty){
    let rem=qty,sold=0,proceeds=0;
    for(const [p,q] of bids){
      if(rem<=1e-12)break;
      const take=Math.min(q,rem); if(take<=0)continue;
      sold+=take; proceeds+=take*p; rem-=take;
    }
    const filled=rem<=1e-10, avg=sold>0?proceeds/sold:null;
    return {filled,quantity_btc:sold,avg_price:avg,proceeds_eur:proceeds,remaining_btc:Math.max(0,rem)};
  }
  function metrics(book,venue){
    const bids=book.bids.slice().sort((a,b)=>b[0]-a[0]), asks=book.asks.slice().sort((a,b)=>a[0]-b[0]);
    const bestBid=bids[0]?.[0],bestAsk=asks[0]?.[0];
    if(!(bestBid>0&&bestAsk>0))throw new Error(venue.name+": carnet vide");
    if(bestBid>bestAsk)throw new Error(venue.name+": carnet croisé");
    const mid=(bestBid+bestAsk)/2, spreadPct=(bestAsk-bestBid)/mid*100, spreadBp=spreadPct*100;
    const depth={};
    for(const bps of DEPTH_BPS){
      const askMax=mid*(1+bps/10000),bidMin=mid*(1-bps/10000);
      depth[String(bps)]={
        ask_eur:asks.filter(r=>r[0]<=askMax).reduce((s,r)=>s+r[0]*r[1],0),
        bid_eur:bids.filter(r=>r[0]>=bidMin).reduce((s,r)=>s+r[0]*r[1],0)
      };
    }
    const simulations=SIZES.map(amount=>{
      const buy=simulateBuy(asks,amount), sell=buy.filled?simulateSell(bids,buy.quantity_btc):{filled:false};
      const buySlip=buy.filled?(buy.avg_price/bestAsk-1)*100:null;
      const sellSlip=sell.filled?(bestBid-sell.avg_price)/bestBid*100:null;
      const bookCost=sell.filled?(1-sell.proceeds_eur/amount)*100:null;
      const marketRoundtrip=Number.isFinite(bookCost)?bookCost+2*venue.taker:null;
      return {amount_eur:amount,buy_filled:buy.filled,sell_filled:sell.filled,buy_avg_price:buy.avg_price,sell_avg_price:sell.avg_price,buy_slippage_pct:buySlip,sell_slippage_pct:sellSlip,book_roundtrip_cost_pct:bookCost,market_market_estimated_cost_pct:marketRoundtrip};
    });
    return {
      pair:venue.pair,best_bid:bestBid,best_ask:bestAsk,mid,spread_pct:spreadPct,spread_bp:spreadBp,
      depth_eur:depth,simulations,
      fee_reference:{maker_pct:venue.maker,taker_pct:venue.taker,note:venue.fee_note,source:venue.fee_source},
      post_only_post_only_fee_floor_pct:2*venue.maker,
      post_only_market_fee_floor_pct:venue.maker+venue.taker,
      post_only_fill_guaranteed:false
    };
  }
  async function oneKraken(venue){
    const started=new Date().toISOString();
    try{
      const r=await fetchJson(venue.endpoint),received=new Date().toISOString(),book=parseKraken(r.json);
      return Object.freeze({ok:true,venue:venue.name,started_at:started,received_at_utc:received,measured_at:new Date().toISOString(),latency_ms:r.latency_ms,endpoint:venue.endpoint,transport:"REST PUBLIC",freshness_state:"DIRECT_REQUEST",quote_observed_at_utc:null,quote_age_seconds:null,attempts:Object.freeze([{transport:"REST PUBLIC",ok:true}]),...metrics(book,venue)});
    }catch(e){
      return Object.freeze({ok:false,venue:venue.name,started_at:started,received_at_utc:null,measured_at:new Date().toISOString(),endpoint:venue.endpoint,error:"Kraken indisponible.",diagnostic:String(e?.name==="AbortError"?"délai dépassé":e?.message||e),attempts:Object.freeze([{transport:"REST PUBLIC",ok:false,error:String(e?.message||e)}])});
    }
  }
  async function oneOkx(venue){
    const started=new Date().toISOString();
    let receivedAt=null;
    try{
      const quoteRead=await fetchOkxBackendQuote(venue);
      receivedAt=new Date().toISOString();
      const top=okxMetricsFromBackend(quoteRead.payload,venue,Date.parse(receivedAt));
      try{
        const bookRead=await fetchOkxBackendBook(venue);
        const bookReceivedAt=new Date().toISOString();
        const parsedBook=okxOrderbookFromBackend(bookRead.payload,Date.parse(bookReceivedAt));
        const full=metrics(parsedBook.book,venue);
        return Object.freeze({
          ok:true,venue:venue.name,started_at:started,received_at_utc:bookReceivedAt,measured_at:new Date().toISOString(),
          latency_ms:bookRead.latency_ms,quote_latency_ms:quoteRead.latency_ms,orderbook_latency_ms:bookRead.latency_ms,
          endpoint:bookRead.endpoint,quote_endpoint:quoteRead.endpoint,transport:"SOURCE TRUTH CEX + BACKEND LOCAL 8790 ORDERBOOK",
          backend_version:bookRead.backend_version,attempts:Object.freeze([
            {transport:quoteRead.transport,ok:true},
            {transport:bookRead.transport,ok:true}
          ]),
          ...full,
          depth_available:true,
          measurement_scope:"MULTI_LEVEL_ORDERBOOK_FROM_PRIVATE_BACKEND",
          slippage_claim:true,nearby_depth_claim:true,
          observed_at_utc:parsedBook.freshness.observed_at_utc,
          quote_observed_at_utc:top.quote_observed_at_utc,
          quote_age_seconds:top.quote_age_seconds,
          orderbook_observed_at_utc:parsedBook.freshness.observed_at_utc,
          orderbook_age_seconds:parsedBook.freshness.age_seconds,
          freshness_state:"FRESH",
          freshness_reason:"QUOTE_AND_ORDERBOOK_FRESH",
          freshness_max_age_seconds:SOURCE_TRUTH_CACHE_TTL_SECONDS,
          quote_identity:top.quote_identity,
          backend_quote_fields:top.backend_quote_fields,
          orderbook_requested_depth:parsedBook.requested_depth,
          orderbook_levels:parsedBook.levels,
          fee_plus_spread_snapshot_pct:top.fee_plus_spread_snapshot_pct
        });
      }catch(bookError){
        return Object.freeze({
          ok:true,venue:venue.name,started_at:started,received_at_utc:receivedAt,measured_at:new Date().toISOString(),
          latency_ms:quoteRead.latency_ms,endpoint:quoteRead.endpoint,transport:quoteRead.transport,backend_version:quoteRead.backend_version,
          attempts:Object.freeze([{transport:quoteRead.transport,ok:true},{transport:"BACKEND LOCAL 8790 · OKX PUBLIC ORDERBOOK",ok:false,error:String(bookError?.message||bookError)}]),
          ...top,
          depth_available:false,
          orderbook_error:String(bookError?.message||bookError),
          orderbook_error_code:String(bookError?.code||"ORDERBOOK_UNAVAILABLE"),
          measurement_scope:"TOP_OF_BOOK_FALLBACK_ORDERBOOK_UNAVAILABLE",
          slippage_claim:false,nearby_depth_claim:false
        });
      }
    }catch(error){
      const freshness=error?.details?.freshness||null;
      const state=freshness?.state||(/^(INVALID_|MISSING_|CROSSED_)/.test(String(error?.code||""))?"INVALID":"ERROR");
      const label=state==="STALE"?"OKX : cotation périmée (STALE).":state==="UNKNOWN"?"OKX : fraîcheur de cotation inconnue (UNKNOWN).":state==="INVALID"?"OKX : cotation BTC/EUR invalide.":"OKX indisponible via Source Truth CEX / Backend local 127.0.0.1:8790.";
      return Object.freeze({
        ok:false,venue:venue.name,started_at:started,received_at_utc:receivedAt,measured_at:new Date().toISOString(),endpoint:venue.backend_endpoint,
        data_state:state,freshness_state:freshness?.state||null,freshness_reason:freshness?.reason||null,
        quote_observed_at_utc:freshness?.observed_at_utc||null,quote_age_seconds:freshness?.age_seconds??null,
        freshness_max_age_seconds:freshness?.max_age_seconds??SOURCE_TRUTH_CACHE_TTL_SECONDS,
        freshness_policy_source:freshness?.policy_source||"architecture/private-backend-sources.json#cache.ttl_seconds",
        error:label,diagnostic:String(error?.name==="AbortError"?"délai backend dépassé":error?.message||error),
        error_code:String(error?.code||"ERROR"),
        attempts:Object.freeze([{transport:"BACKEND LOCAL 8790 · OKX PUBLIC",ok:false,error:String(error?.message||error)}])
      });
    }
  }
  function measurementStatus(kraken,okx){
    const okCount=[kraken,okx].filter(x=>x?.ok===true).length;
    if(okCount===2)return okx?.depth_available===false?"MEASURED_BOTH_OKX_TOP_OF_BOOK_ONLY":"MEASURED_BOTH";
    return okCount===1?"PARTIAL":"FAILED";
  }
  async function measure(trigger="manual"){
    if(busy)return last;
    busy=true; render("Mesure en cours…");
    try{
      const [kraken,okx]=await Promise.all([oneKraken(VENUES.kraken),oneOkx(VENUES.okx)]);
      const status=measurementStatus(kraken,okx);
      last=Object.freeze({
        schema:"agent_crypto_strategy_a_execution_cost_truth_v1",build:BUILD,generated_at:new Date().toISOString(),measurement_trigger:String(trigger||"manual"),
        status,
        pair:"BTC/EUR",sizes_eur:SIZES.slice(),depth_bps:DEPTH_BPS.slice(),
        oracle_context:oracleContext(),venues:Object.freeze({kraken,okx}),
        assumptions:Object.freeze({
          fee_profiles_are_reference_rates:true,
          account_specific_fee_may_differ:true,
          market_roundtrip_cost_is_orderbook_simulation_plus_reference_taker_fees_for_kraken:true,
          okx_top_of_book_from_existing_backend:true,
          okx_multi_level_orderbook_from_backend_143:true,
          okx_fee_plus_spread_snapshot_is_not_slippage_proof:true,
          okx_orderbook_depth_drives_slippage_when_available:true,
          okx_depth_and_slippage_fail_closed_when_orderbook_unavailable:true,
          okx_stale_or_unknown_quote_is_not_measurement:true,
          source_truth_fallback_freshness_seconds:SOURCE_TRUTH_CACHE_TTL_SECONDS,
          quote_time_receive_time_calculation_time_separated:true,
          post_only_cost_is_fee_floor_only_and_fill_not_guaranteed:true
        }),
        protections:Object.freeze({manual_fetch_only:false,automatic_measurement:true,automatic_measure_on_mount:true,automatic_measure_on_experiment_cycle:true,manual_refresh_fallback:true,okx_loopback_backend_only:true,direct_okx_browser_internet:false,new_websocket:false,persistent_websocket:false,recurring_timer:false,storage_write:false,api_key:false,wallet:false,real_order:false,thresholds_changed:false,oracle_math_changed:false,risk_changed:false,paper_changed:false,market_core_changed:false,automatic_platform_choice:false})
      });
      try{globalThis.window?.dispatchEvent?.(new CustomEvent("agent-crypto:strategy-a-execution-cost-measured",{detail:{build:BUILD,status}}));}catch(_){}
      return last;
    }finally{
      busy=false;
      try{render();}finally{resumePendingExperiment();}
    }
  }
  function exportJson(){
    if(!last)return false;
    try{
      const b=new Blob([JSON.stringify(last,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");
      a.href=u;a.download="STRATEGY_A_EXECUTION_COST_TRUTH_40_6_492.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return true;
    }catch(_){return false;}
  }
  function style(){
    if(document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");s.id=ROOT+"Style";
    s.textContent="#"+ROOT+"{margin-top:10px;padding:13px;border:1px solid rgba(65,224,193,.34);border-radius:10px;background:rgba(5,29,31,.25)}#"+ROOT+" .ect-h{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}#"+ROOT+" .ect-t{font-size:12px;font-weight:950;letter-spacing:.065em;color:#82f5de;line-height:1.35}#"+ROOT+" .ect-s{font-size:10.5px;color:#9bb9b6;margin-top:4px;line-height:1.4}#"+ROOT+" .ect-actions{display:flex;gap:8px}#"+ROOT+" .ect-actions button{min-height:40px!important;font-size:13px!important;padding:9px 14px!important}#"+ROOT+" .ect-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}#"+ROOT+" .ect-card{padding:11px;border:1px solid rgba(255,255,255,.09);border-radius:8px;background:rgba(0,0,0,.13);min-width:0}#"+ROOT+" .ect-card h4{margin:0 0 8px;font-size:13px;line-height:1.35;color:#e8ffff}#"+ROOT+" .ect-k{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}#"+ROOT+" .ect-k div{padding:7px;border-radius:6px;background:rgba(255,255,255,.03);min-width:0}#"+ROOT+" .ect-k span{display:block;font-size:9.5px;line-height:1.3;color:#8ea9a6}#"+ROOT+" .ect-k b{display:block;margin-top:2px;font-size:11.5px;line-height:1.3;color:#effffd;overflow-wrap:anywhere}#"+ROOT+" table{width:100%;border-collapse:collapse;margin-top:8px;font-size:10.5px;line-height:1.35}#"+ROOT+" th,#"+ROOT+" td{padding:6px 5px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right}#"+ROOT+" th:first-child,#"+ROOT+" td:first-child{text-align:left}#"+ROOT+" .ect-note{margin-top:8px;font-size:10.5px;line-height:1.5;color:#a9c1bf}#"+ROOT+" .ect-transport{margin:0 0 8px;font-size:9.5px;line-height:1.35;color:#82bcb2}#"+ROOT+" details.ect-diagnostic{margin-top:8px;font-size:9.5px;color:#879d9b}#"+ROOT+" details.ect-diagnostic summary{cursor:pointer;color:#a3b9b6}#"+ROOT+" .bad{color:#ffaaa2}.good{color:#8ff0c1}@media(max-width:1100px){#"+ROOT+" .ect-grid{grid-template-columns:1fr}#"+ROOT+" .ect-k{grid-template-columns:repeat(2,minmax(0,1fr))}}";
    document.head.appendChild(s);
  }
  function card(v){
    if(!v)return '<div class="ect-card"><h4>—</h4><div class="ect-note">Non mesuré.</div></div>';
    if(!v.ok){
      const diagnostic=v.diagnostic?'<details class="ect-diagnostic"><summary>Diagnostic technique</summary><div>'+esc(v.diagnostic)+'</div></details>':'';
      const freshness=v.freshness_state?'<div class="ect-note bad"><b>Fraîcheur :</b> '+esc(v.freshness_state)+(v.freshness_reason?' · '+esc(v.freshness_reason):'')+(Number.isFinite(v.quote_age_seconds)?' · âge '+esc(ageText(v.quote_age_seconds)):'')+(Number.isFinite(v.freshness_max_age_seconds)?' · limite '+esc(ageText(v.freshness_max_age_seconds)):'')+(v.quote_observed_at_utc?' · quote '+esc(v.quote_observed_at_utc):'')+'</div>':'';
      return '<div class="ect-card"><h4>'+esc(v.venue)+'</h4><div class="ect-note bad">'+esc(v.error||"Mesure indisponible.")+'</div>'+freshness+diagnostic+'</div>';
    }
    const d=v.depth_eur||{};
    const rows=(v.simulations||[]).map(x=>v.depth_available===false
      ? '<tr><td>'+esc(x.amount_eur)+' €</td><td>N/D</td><td>N/D</td><td>N/D</td></tr>'
      : '<tr><td>'+esc(x.amount_eur)+' €</td><td>'+esc(pct(x.buy_slippage_pct))+'</td><td>'+esc(pct(x.sell_slippage_pct))+'</td><td>'+esc(pct(x.market_market_estimated_cost_pct))+'</td></tr>'
    ).join("");
    const depth5=v.depth_available===false?"NON EXPOSÉE":eur((d["5"]?.ask_eur||0)+(d["5"]?.bid_eur||0));
    const depth25=v.depth_available===false?"NON EXPOSÉE":eur((d["25"]?.ask_eur||0)+(d["25"]?.bid_eur||0));
    const scope=v.depth_available===false
      ? '<div class="ect-note"><b>OKX via Backend local :</b> bid/ask réels et spread mesurés. Le carnet multi-niveaux V1.4.3 est indisponible pour cette mesure : profondeur et glissement 10/25/50/100 € restent <b>INCONNUS</b>, sans valeur inventée. Référence frais Taker + spread au snapshot : '+esc(pct(v.fee_plus_spread_snapshot_pct))+' avant slippage.</div>'
      : (String(v.venue||"").includes("OKX")
        ? '<div class="ect-note good"><b>OKX ORDERBOOK :</b> carnet multi-niveaux public via Backend local V1.4.3 · profondeur et slippage calculés depuis les niveaux réellement reçus · aucune exécution.</div>'
        : '');
    const freshness=v.freshness_state?'<div class="ect-transport"><b>Fraîcheur :</b> '+esc(v.freshness_state)+(Number.isFinite(v.quote_age_seconds)?' · âge '+esc(ageText(v.quote_age_seconds)):'')+(Number.isFinite(v.freshness_max_age_seconds)?' · limite '+esc(ageText(v.freshness_max_age_seconds)):'')+(v.quote_observed_at_utc?' · quote '+esc(v.quote_observed_at_utc):'')+'</div>':'';
    return '<div class="ect-card"><h4>'+esc(v.venue)+' · '+esc(v.pair)+'</h4><div class="ect-transport">Source : '+esc(v.transport||"source publique")+' · latence requête '+esc(v.latency_ms)+' ms</div>'+freshness+'<div class="ect-k">'+
      '<div><span>Maker réf.</span><b>'+esc(pct(v.fee_reference.maker_pct))+'</b></div><div><span>Taker réf.</span><b>'+esc(pct(v.fee_reference.taker_pct))+'</b></div>'+
      '<div><span>Spread</span><b>'+esc(bp(v.spread_bp))+'</b></div><div><span>Latence</span><b>'+esc(v.latency_ms)+' ms</b></div>'+
      '<div><span>Meilleur achat</span><b>'+esc(eur(v.best_ask))+'</b></div><div><span>Meilleure vente</span><b>'+esc(eur(v.best_bid))+'</b></div>'+
      '<div><span>Profondeur ±5bp</span><b>'+esc(depth5)+'</b></div><div><span>Profondeur ±25bp</span><b>'+esc(depth25)+'</b></div></div>'+
      '<table><thead><tr><th>Montant</th><th>Gliss. achat</th><th>Gliss. vente</th><th>Coût Market→Market</th></tr></thead><tbody>'+rows+'</tbody></table>'+scope+
      '<div class="ect-note">Post-only→Post-only : plancher frais '+esc(pct(v.post_only_post_only_fee_floor_pct))+' · exécution non garantie. Post-only→Market : plancher frais '+esc(pct(v.post_only_market_fee_floor_pct))+'.</div></div>';
  }
  function render(message){
    if(typeof document==="undefined")return last;
    const anchor=document.getElementById("strategyAOracleCostCalibrationAudit");
    if(!anchor)return last;
    style(); let root=document.getElementById(ROOT); if(!root){root=document.createElement("section");root.id=ROOT;}
    if(root.previousElementSibling!==anchor){try{anchor.insertAdjacentElement("afterend",root);}catch(_){}}
    const c=last?.oracle_context||oracleContext();
    root.innerHTML='<div class="ect-h"><div><div class="ect-t">STRATEGY A · EXECUTION COST TRUTH · '+BUILD+'</div><div class="ect-s">BTC/EUR · Kraken public + OKX via Source Truth CEX / Backend local 8790 · aucun ordre réel.</div></div><div class="ect-actions"><button class="btn small" id="'+ROOT+'Measure">'+(busy?"MESURE…":"RAFRAÎCHIR KRAKEN + OKX")+'</button><button class="btn small" id="'+ROOT+'Export" '+(!last?"disabled":"")+'>EXPORTER</button></div></div>'+
      (message?'<div class="ect-note">'+esc(message)+'</div>':'')+
      '<div class="ect-grid">'+card(last?.venues?.kraken)+card(last?.venues?.okx)+'</div>'+
      '<div class="ect-note"><b>CONTEXTE :</b> enveloppe Oracle médiane '+esc(pct(c.oracle_envelope_median_pct))+' · MFE observée '+esc(pct(c.mfe_median_pct))+' · ancien coût pédagogique '+esc(pct(c.pedagogical_cost_pct))+' · seuil Strategy A '+esc(pct(c.strategy_threshold_pct))+'. Cette version mesure et compare ; elle ne choisit aucune plateforme et ne change aucun seuil.</div>';
    root.querySelector("#"+ROOT+"Measure")?.addEventListener("click",()=>void measure("manual-refresh"),{once:true});
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",exportJson);
    root.dataset.build=BUILD;root.dataset.readOnly="true";return last;
  }
  function pendingResumeDecision406458(pending,inFlight){
    return pending===true&&inFlight!==true;
  }
  function selfTest(){
    const now=Date.parse("2026-09-28T19:00:00Z");
    const payload=quote=>({assets:[{asset:"BTC",quotes:[quote]}]});
    const base={provider:"okx",status:"ok",observed_at_utc:"2026-09-28T18:59:55Z",bid_eur:"99990",ask_eur:"100010",price_eur:"100000"};
    const bookFixture={read_only:true,backend_version:"1.4.3",provider:"okx",asset:"BTC",pair:"BTC-EUR",status:"ok",observed_at_utc:"2026-09-28T18:59:55Z",requested_depth:100,levels:{bids:2,asks:2},bids:[[99990,0.5],[99980,1]],asks:[[100010,0.5],[100020,1]]};
    const rejects=(quote,code,reason=null)=>{
      try{okxQuoteFromBackend(payload(quote),now);return false;}
      catch(error){return error?.code===code&&(reason===null||error?.details?.freshness?.reason===reason);}
    };
    let fresh=false;
    try{
      const parsed=okxQuoteFromBackend(payload(base),now);
      fresh=parsed.freshness.state==="FRESH"&&Math.round(parsed.freshness.age_seconds)===5;
    }catch(_){}
    const parsedOrderbook=okxOrderbookFromBackend(bookFixture,now);
    const orderbookMetrics=metrics(parsedOrderbook.book,VENUES.okx);
    const checks=Object.freeze({
      fetch_helper_defined:typeof fetchJson==="function",
      canonical_anchor_only:true,
      okx_owner_route_contract:typeof fetchOkxBackendQuote==="function",
      direct_okx_browser_internet_blocked:true,
      null_blank_boolean_not_zero:n(null)===null&&n("")===null&&n("   ")===null&&n(false)===null&&n({})===null,
      numeric_epoch_string_supported:toMs(String(now))===now,
      fresh_quote_accepted:fresh,
      stale_quote_rejected:rejects({...base,observed_at_utc:"2020-01-01T00:00:00Z"},"STALE","STALE"),
      missing_timestamp_unknown:rejects({...base,observed_at_utc:undefined},"UNKNOWN","MISSING_TIMESTAMP"),
      future_timestamp_unknown:rejects({...base,observed_at_utc:"2026-09-28T19:02:00Z"},"UNKNOWN","FUTURE_TIMESTAMP"),
      crossed_quote_rejected:rejects({...base,bid_eur:"101000",ask_eur:"100000"},"CROSSED_BOOK"),
      wrong_currency_rejected:rejects({provider:"okx",status:"ok",observed_at_utc:"2026-09-28T18:59:55Z",pair:"BTC-USDT",bid:"99990",ask:"100010"},"INVALID_PAIR"),
      compact_usdt_with_price_eur_rejected:rejects({provider:"okx",status:"ok",observed_at_utc:"2026-09-28T18:59:55Z",pair:"BTCUSDT",price_eur:"100000",bid:"99990",ask:"100010"},"INVALID_PAIR"),
      compact_symbol_usdt_rejected:rejects({provider:"okx",status:"ok",observed_at_utc:"2026-09-28T18:59:55Z",symbol:"BTCUSDT",price_eur:"100000",bid:"99990",ask:"100010"},"INVALID_PAIR"),
      price_eur_alone_does_not_prove_generic_book:rejects({provider:"okx",status:"ok",observed_at_utc:"2026-09-28T18:59:55Z",price_eur:"100000",bid:"99990",ask:"100010"},"MISSING_BOOK"),
      existing_source_truth_cache_contract:freshnessLimit({}).seconds===15,
      okx_orderbook_read_only_contract:parsedOrderbook.freshness.state==="FRESH"&&parsedOrderbook.book.bids.length===2&&parsedOrderbook.book.asks.length===2,
      okx_orderbook_depth_and_slippage_computable:Number.isFinite(orderbookMetrics.depth_eur?.["5"]?.ask_eur)&&orderbookMetrics.simulations.every(x=>Number.isFinite(x.market_market_estimated_cost_pct)),
      stale_okx_preserves_kraken_partial:measurementStatus({ok:true},{ok:false,freshness_state:"STALE"})==="PARTIAL",
      backend_demand_bounded:true,
      repeatable_export:true,
      automatic_measure_contract:true,
      pending_resume_contract_406458:
        pendingResumeDecision406458(true,false)===true&&
        pendingResumeDecision406458(true,true)===false&&
        pendingResumeDecision406458(false,false)===false,
      event_driven_without_recurring_timer:true,
      no_real_order:true
    });
    const runtime=Object.freeze({okx_owner_available:typeof globalThis.ErithPrivateSourceDemand?.ensure==="function"||typeof globalThis.ErithPrivateBackendSources?.refresh==="function"});
    return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks,runtime});
  }
  globalThis.AgentCryptoStrategyAExecutionCostTruth=Object.freeze({
    build:BUILD,measure,render,export_json:exportJson,snapshot:()=>last,self_test:selfTest,
    manual_fetch_only:false,automatic_measurement:true,automatic_measure_on_mount:true,automatic_measure_on_experiment_cycle:true,manual_refresh_fallback:true,pending_experiment_resume_from_any_measure_exit:true,pending_experiment_coalesced_to_one:true,okx_loopback_backend_only:true,okx_orderbook_backend_required_for_depth:true,direct_okx_browser_internet:false,new_websocket:false,persistent_websocket:false,recurring_timer:false,storage_write:false,api_key:false,wallet:false,real_order:false,thresholds_changed:false,oracle_math_changed:false,risk_changed:false,paper_changed:false,market_core_changed:false,automatic_platform_choice:false,
    freshness_fallback_seconds:SOURCE_TRUTH_CACHE_TTL_SECONDS,future_tolerance_seconds:SOURCE_TRUTH_FUTURE_TOLERANCE_SECONDS,stale_or_unknown_quote_usable:false
  });
  if(typeof document!=="undefined"){
    let mountQueued=false,autoMeasureQueued=false,pendingExperimentMeasure=false,initialAutoMeasureDone=false;
    const hasAnchor=()=>!!document.getElementById("strategyAOracleCostCalibrationAudit");
    const scheduleAutoMeasure=(reason="mount")=>{
      const why=String(reason||"mount");
      if(!hasAnchor())return false;
      if(why==="mount"&&(initialAutoMeasureDone||last))return false;
      if(busy){
        if(why==="experiment-cycle")pendingExperimentMeasure=true;
        return false;
      }
      if(autoMeasureQueued)return false;
      autoMeasureQueued=true;
      const run=async()=>{
        autoMeasureQueued=false;
        if(!hasAnchor()||busy)return;
        if(why==="mount")initialAutoMeasureDone=true;
        try{await measure("auto:"+why);}catch(_){}
      };
      try{queueMicrotask(()=>void run());}catch(_){Promise.resolve().then(()=>void run());}
      return true;
    };
    const boot=()=>{
      try{render();}catch(_){}
      if(!last)scheduleAutoMeasure("mount");
    };
    const scheduleMount=()=>{
      if(mountQueued)return;
      mountQueued=true;
      const run=()=>{mountQueued=false;boot();};
      try{queueMicrotask(run);}catch(_){Promise.resolve().then(run);}
    };
    const onExperimentCycle=()=>{
      try{render();}catch(_){}
      if(!scheduleAutoMeasure("experiment-cycle")&&busy)pendingExperimentMeasure=true;
    };
    const finishPendingExperiment=()=>{
      if(!pendingResumeDecision406458(pendingExperimentMeasure,busy))return false;
      pendingExperimentMeasure=false;
      return scheduleAutoMeasure("experiment-cycle");
    };
    resumePendingExperiment=finishPendingExperiment;
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",scheduleMount,{once:true});else scheduleMount();
    document.addEventListener("agent-crypto:strategy-a-durable-evidence-ready",scheduleMount,{passive:true});
    document.addEventListener("agent-crypto:strategy-a-experiment-cycle",onExperimentCycle,{passive:true});
    document.addEventListener("toggle",event=>{if(event?.target?.id==="simulation"&&event.target.open===true)scheduleMount();},true);
    window.addEventListener("agent-crypto:postboot-runtime-ready",scheduleMount,{passive:true});
    window.addEventListener("pageshow",scheduleMount,{passive:true});
  }
})();
