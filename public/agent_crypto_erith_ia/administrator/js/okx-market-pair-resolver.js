/* Agent-Crypto — shared OKX market pair resolver.
   Stable owner for selected market asset + ordered quote candidates used by Candles and Depth.
   Read-only: no fetch, timer, observer, storage, order, wallet or Market Core mutation. */
(()=>{
  "use strict";
  const BUILD="40.6.620";
  const ASSET_RE=/^[A-Z0-9]{1,16}$/;
  const QUOTE_RE=/^[A-Z0-9]{2,16}$/;
  const PAIR_RE=/^([A-Z0-9]{1,16})[-/]([A-Z0-9]{2,16})$/;
  const DOM_STOP=new Set(["AUCUN","ACTIF","SELECT","SELECTED","SELECTION","SÉLECTION","PRIX","PRICE","USD","EUR","USDC","USDT","CRYPTO","MARCHE","MARCHÉ","MARKET"]);

  const normalizeAsset=value=>{
    const asset=String(value??"").trim().toUpperCase();
    return ASSET_RE.test(asset)?asset:null;
  };
  const normalizeQuote=value=>{
    const quote=String(value??"").trim().toUpperCase();
    return QUOTE_RE.test(quote)?quote:null;
  };
  const normalizeInstrument=value=>{
    const raw=String(value??"").trim().toUpperCase().replace("/","-");
    const match=raw.match(PAIR_RE);
    return match?(match[1]+"-"+match[2]):null;
  };
  const externalContext=()=>{try{return globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()||{active:false};}catch(_){return {active:false};}};
  const displayCurrency=()=>{try{return String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"EUR").toUpperCase()==="USD"?"USD":"EUR";}catch(_){return "EUR";}};

  function symbolFromText(value){
    const tokens=String(value??"").toUpperCase().match(/\b[A-Z][A-Z0-9]{0,15}\b/g)||[];
    for(const token of tokens){
      if(!DOM_STOP.has(token)&&ASSET_RE.test(token))return token;
    }
    return null;
  }

  function selectedAsset(){
    const ext=externalContext();
    const external=normalizeAsset(ext?.active?ext.base:null);
    if(external)return external;
    try{
      const coin=typeof globalThis.getSelectedCoin==="function"?globalThis.getSelectedCoin():null;
      const canonical=normalizeAsset(coin?.symbol);
      if(canonical)return canonical;
    }catch(_){}
    if(typeof document!=="undefined"){
      const candidates=[
        document.getElementById("detailCompactAsset")?.textContent,
        document.getElementById("selectedAssetTitle")?.textContent,
        document.querySelector("#marketRows tr.is-active [data-symbol]")?.getAttribute?.("data-symbol"),
        document.querySelector("#marketRows tr.is-active")?.textContent,
        document.querySelector("#top5Track .is-active")?.textContent
      ];
      for(const value of candidates){
        const symbol=symbolFromText(value);
        if(symbol)return symbol;
      }
    }
    return "BTC";
  }

  function quoteCandidates({currency=displayCurrency(),externalQuote=null}={}){
    const exact=normalizeQuote(externalQuote);
    if(exact)return Object.freeze([exact]);
    const mode=String(currency||"EUR").toUpperCase()==="USD"?"USD":"EUR";
    return Object.freeze(mode==="USD"?["USDC","USDT"]:["EUR","USDC","USDT"]);
  }

  function instrumentCandidates({asset=selectedAsset(),currency=displayCurrency(),externalInstrument=null,externalQuote=null}={}){
    const exact=normalizeInstrument(externalInstrument);
    if(exact)return Object.freeze([exact]);
    const base=normalizeAsset(asset)||"BTC";
    return Object.freeze(quoteCandidates({currency,externalQuote}).map(quote=>base+"-"+quote));
  }

  function canTryNext(error){
    const code=String(error?.code||"");
    if(code==="OKX_CANDLES_UNAVAILABLE"||code==="BACKEND_STATUS"||code==="BOOK_EMPTY"||code==="QUOTE_UNAVAILABLE")return true;
    if(code==="OKX_HTTP"||code==="BACKEND_HTTP"){
      const status=Number(error?.status);
      return status===400||status===404;
    }
    return false;
  }

  function snapshot(){
    const asset=selectedAsset(),currency=displayCurrency(),instruments=instrumentCandidates({asset,currency});
    return Object.freeze({build:BUILD,asset,currency,instruments,read_only:true});
  }

  function selfTest(){
    const usd=instrumentCandidates({asset:"OKB",currency:"USD"});
    const eur=instrumentCandidates({asset:"BTC",currency:"EUR"});
    const meme=instrumentCandidates({asset:"M",currency:"USD"});
    const e400=Object.assign(new Error("400"),{code:"OKX_HTTP",status:400});
    const e500=Object.assign(new Error("500"),{code:"OKX_HTTP",status:500});
    const pass=
      normalizeAsset("okb")==="OKB"&&
      normalizeAsset("m")==="M"&&
      normalizeInstrument("okb/usdt")==="OKB-USDT"&&
      normalizeInstrument("m/usdt")==="M-USDT"&&
      JSON.stringify(usd)===JSON.stringify(["OKB-USDC","OKB-USDT"])&&
      JSON.stringify(eur)===JSON.stringify(["BTC-EUR","BTC-USDC","BTC-USDT"])&&
      JSON.stringify(meme)===JSON.stringify(["M-USDC","M-USDT"])&&
      canTryNext(e400)===true&&canTryNext(e500)===false;
    return Object.freeze({build:BUILD,pass,checks:Object.freeze({
      okb_asset_normalized:normalizeAsset("okb")==="OKB",
      single_char_asset_normalized:normalizeAsset("m")==="M",
      okb_usdt_normalized:normalizeInstrument("okb/usdt")==="OKB-USDT",
      single_char_usdt_normalized:normalizeInstrument("m/usdt")==="M-USDT",
      usd_candidates_usdc_then_usdt:JSON.stringify(usd)===JSON.stringify(["OKB-USDC","OKB-USDT"]),
      single_char_candidates_usdc_then_usdt:JSON.stringify(meme)===JSON.stringify(["M-USDC","M-USDT"]),
      eur_candidates_eur_then_stables:JSON.stringify(eur)===JSON.stringify(["BTC-EUR","BTC-USDC","BTC-USDT"]),
      http_400_pair_fallback:canTryNext(e400)===true,
      http_500_no_pair_fallback:canTryNext(e500)===false,
      no_network:true,no_timer:true,no_observer:true,no_storage:true,no_order:true,no_wallet:true
    })});
  }

  globalThis.AgentCryptoOkxMarketPairResolver=Object.freeze({
    build:BUILD,
    selectedAsset,
    displayCurrency,
    quoteCandidates,
    instrumentCandidates,
    normalizeAsset,
    normalizeQuote,
    normalizeInstrument,
    canTryNext,
    snapshot,
    self_test:selfTest,
    read_only:true,
    network_request:false,
    recurring_timer:false,
    mutation_observer:false,
    storage_write:false,
    real_order:false,
    wallet:false,
    market_core_changed:false
  });
})();
