import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const BASE="public/agent_crypto_erith_ia/administrator/js/";
const resolverSrc=fs.readFileSync(BASE+"market-instrument-resolver.js","utf8");
const depthSrc=fs.readFileSync(BASE+"okx-microstructure-406499.js","utf8");
const traderSrc=fs.readFileSync("public/agent_crypto_erith_ia/trader/trading-desk.html","utf8");
const defer=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<4;i++)await new Promise(done=>setImmediate(done));};

function environment(source,{network=false}={}){
  let asset="BTC",currency="USD";
  const listeners=new Map(),calls=[],published=[];
  const window={
    addEventListener(name,cb){const l=listeners.get(name)||[];l.push(cb);listeners.set(name,l);}
  };
  const document={readyState:"loading",addEventListener(){}};
  const pairOwner={
    selectedAsset:()=>asset,displayCurrency:()=>currency,
    normalizeAsset:code=>/^[A-Z0-9]{1,16}$/.test(String(code||""))?String(code):null,
    normalizeQuote:code=>/^[A-Z0-9]{2,16}$/.test(String(code||""))?String(code):null,
    quoteCandidates:()=>["USDC","USDT"]
  };
  const quoteOwner={
    snapshot:()=>({displayCurrency:currency}),
    setExecutionTruth(x){published.push(x);}
  };
  const context={
    window,document,URL,AbortController,Date,Promise,queueMicrotask,
    setTimeout,clearTimeout,performance:{now:()=>0},
    AgentCryptoOkxMarketPairResolver:pairOwner,
    AgentCryptoQuoteCurrencyArchitecture:quoteOwner,
    getSelectedCoin:()=>({symbol:asset}),
    AgentCryptoOkxLocalTransport:{backend:"http://127.0.0.1:8790/okx-public"}
  };
  if(network)context.fetch=url=>{const p=defer();calls.push({url:String(url),...p});return p.promise;};
  vm.runInNewContext(source,vm.createContext(context));
  return {
    context,calls,published,
    select(next){asset=next;this.emit("agent-crypto:selected-market-changed",{symbol:next});},
    currency(next){currency=next;this.emit("agent-crypto:quote-architecture-changed",{reason:"operator-ui"});},
    emit(name,detail){for(const callback of listeners.get(name)||[])callback({detail});},
    module:(name)=>context[name]
  };
}
function selectionResponse(asset,quote="USDC",provider="okx"){
  const chosen={provider,asset,quote,instrument:asset+"-"+quote,capabilities:["candles","book","ticker"]};
  return {ok:true,async json(){return{status:"ok",asset,display_currency:"USD",
    chosen:{candles:chosen,book:chosen},matches:[chosen]};}};
}

test("Trader embeds the canonical Administrator runtime instead of old market owners",()=>{
  assert.match(traderSrc,/src="\.\.\/administrator\/index\.html\?surface=trader"/);
  assert.doesNotMatch(traderSrc,/line-chart-native\.js|pair-central-truth\.js|market-transpose\.js/);
});

test("BTC -> OKB -> BTC: a late BTC candle resolver cannot overwrite OKB",async()=>{
  const e=environment(resolverSrc,{network:true});
  const resolver=e.module("AgentCryptoMarketInstrumentResolver");
  e.select("BTC");
  assert.equal(e.calls.length,1);
  e.select("OKB");
  assert.equal(e.calls.length,2);
  assert.equal(resolver.snapshot().asset,"OKB");
  e.calls[1].resolve(selectionResponse("OKB"));await flush();
  assert.equal(resolver.snapshot().instrument,"OKB-USDC");
  assert.equal(e.published.at(-1)?.instrument,"OKB-USDC");
  const writes=e.published.length;
  e.calls[0].resolve(selectionResponse("BTC"));await flush();
  assert.equal(resolver.snapshot().instrument,"OKB-USDC");
  assert.equal(e.published.length,writes,"stale BTC published after OKB");
  e.select("BTC");
  assert.equal(resolver.snapshot().asset,"BTC");
  assert.ok(["resolving","ok"].includes(resolver.snapshot().status),
    "a cached BTC resolution may complete synchronously");
  // BTC is cached now and resolves without another network request.
  await flush();
  assert.equal(resolver.snapshot().instrument,"BTC-USDC");
});

test("Book resolution does not replace candle execution truth, even with a different provider",async()=>{
  const e=environment(resolverSrc,{network:true});
  const api=e.module("AgentCryptoMarketInstrumentResolver");
  e.select("OKB");
  e.calls[0].resolve(selectionResponse("OKB"));await flush();
  assert.equal(api.snapshot().capability,"candles");
  const before=e.published.length;
  const book=await api.resolve({asset:"OKB",currency:"USD",capability:"book",publish:false});
  assert.equal(book.capability,"book");
  assert.equal(api.snapshot().capability,"candles");
  assert.equal(e.published.length,before);
});

test("The resolver rejects a backend response for a different selected market",async()=>{
  const e=environment(resolverSrc,{network:true});
  e.select("OKB");
  e.calls[0].resolve(selectionResponse("BTC"));await flush();
  const snapshot=e.module("AgentCryptoMarketInstrumentResolver").snapshot();
  assert.equal(snapshot.asset,"OKB");
  assert.equal(snapshot.available,false);
  assert.match(snapshot.reason,/hors contexte/);
  assert.equal(e.published.at(-1)?.available,false);
});

test("A stale network failure cannot turn a newly selected coin into an error",async()=>{
  const e=environment(resolverSrc,{network:true});
  e.select("BTC");e.select("OKB");
  e.calls[1].resolve(selectionResponse("OKB"));await flush();
  e.calls[0].reject(new Error("old BTC offline"));await flush();
  const snap=e.module("AgentCryptoMarketInstrumentResolver").snapshot();
  assert.equal(snap.asset,"OKB");
  assert.equal(snap.status,"ok");
});

test("Depth listens to canonical selection and clears the previous asset without a currency change",()=>{
  const e=environment(depthSrc);
  const depth=e.module("AgentCryptoOkxMicrostructure");
  assert.equal(depth.snapshot().requestedAsset,"BTC");
  e.select("OKB");
  assert.equal(depth.snapshot().requestedAsset,"OKB");
  assert.equal(depth.snapshot().loadedAsset,null);
  e.select("BTC");
  assert.equal(depth.snapshot().requestedAsset,"BTC");
  assert.equal(depth.snapshot().loadedAsset,null);
  assert.equal(depth.real_order,false);
});

test("The Firefox vault reader and historical R8/R9 files are not modified by this fix",()=>{
  assert.match(fs.readFileSync("public/agent_crypto_erith_ia/administrator/historical-vault.html","utf8"),
    /historical-compact-reader\.js/);
  assert.match(fs.readFileSync("public/agent_crypto_erith_ia/administrator/js/historical-compact-reader.js","utf8"),
    /SevenCompactArchiveReader/);
});
