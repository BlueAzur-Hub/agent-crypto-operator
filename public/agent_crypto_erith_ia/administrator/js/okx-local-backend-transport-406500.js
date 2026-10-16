/* Agent-Crypto — 40.6.500 OKX LOCAL BACKEND TRANSPORT
   Bounded transport repair for 40.6.498 candles + 40.6.499 microstructure.
   Rewrites only allowlisted OKX public market GETs to Private Backend 127.0.0.1:8790.
   No timers, no storage, no private API, no order, no wallet, no Strategy/Market Core mutation. */
(()=>{
  "use strict";
  const BUILD="40.6.500";
  const BACKEND="http://127.0.0.1:8790/okx-public";
  const OKX_HOSTS=new Set(["eea.okx.com","www.okx.com"]);
  const ALLOWED=Object.freeze({
    candles:new Set(["instId","bar","limit"]),
    ticker:new Set(["instId"]),
    books:new Set(["instId","sz"]),
    "books-rpi":new Set(["instId","sz"]),
    trades:new Set(["instId","limit"])
  });
  const nativeFetch=globalThis.__AgentCryptoNativeFetch406500||globalThis.fetch?.bind(globalThis);
  if(!nativeFetch)return;
  if(!globalThis.__AgentCryptoNativeFetch406500)Object.defineProperty(globalThis,"__AgentCryptoNativeFetch406500",{value:nativeFetch,writable:false,configurable:false});
  let routed=0;
  function route(input){
    let u;
    try{u=new URL(typeof input==="string"?input:input?.url);}catch(_){return null;}
    if(!OKX_HOSTS.has(u.hostname))return null;
    const m=u.pathname.match(/^\/api\/v5\/market\/(candles|ticker|books|books-rpi|trades)$/);
    if(!m)return null;
    const endpoint=m[1],allowed=ALLOWED[endpoint],b=new URL(BACKEND);
    b.searchParams.set("endpoint",endpoint);
    u.searchParams.forEach((value,key)=>{if(allowed.has(key))b.searchParams.set(key,value);});
    return b.toString();
  }
  async function routedFetch(input,init){
    const method=String(init?.method||(typeof input!=="string"?input?.method:"GET")||"GET").toUpperCase();
    const target=(method==="GET"||method==="HEAD")?route(input):null;
    if(!target)return nativeFetch(input,init);
    routed++;
    return nativeFetch(target,{method:"GET",cache:"no-store",headers:{Accept:"application/json"}});
  }
  routedFetch.__agentCrypto406500=true;
  globalThis.fetch=routedFetch;
  function selfTest(){
    const a=route("https://eea.okx.com/api/v5/market/candles?instId=BTC-EUR&bar=15m&limit=300");
    const b=route("https://eea.okx.com/api/v5/market/books-rpi?instId=BTC-EUR&sz=20");
    const c=route("https://example.com/api/v5/market/ticker?instId=BTC-EUR");
    const pass=!!a&&a.includes("endpoint=candles")&&a.includes("instId=BTC-EUR")&&!!b&&b.includes("endpoint=books-rpi")&&c===null;
    return Object.freeze({build:BUILD,pass,checks:{candles_routed:!!a,books_rpi_routed:!!b,foreign_host_untouched:c===null,no_timer:true,no_storage:true,no_order:true}});
  }
  globalThis.AgentCryptoOkxLocalTransport=Object.freeze({build:BUILD,backend:BACKEND,route,self_test:selfTest,routed_count:()=>routed,read_only:true,allowlisted_only:true,recurring_timer:false,mutation_observer:false,storage_write:false,private_api:false,real_order:false,wallet:false,market_core_changed:false,strategy_changed:false});
})();