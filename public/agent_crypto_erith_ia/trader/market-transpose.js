(function marketTranspose(){
  "use strict";
  const BUILD="40.6.589",LATEST="../data/crypto/latest.json",EXTENDED="../data/crypto/extended.json";
  const state={coins:[],extended:[],selectedId:"bitcoin",externalCoin:null,filter:"all",limit:50,columns:"essential",sort:"rank-asc",query:"",loaded:false,extendedLoaded:false};
  const stable=new Set(["USDT","USDC","DAI","FDUSD","USDE","USDS","PYUSD","TUSD","EURC"]);
  const $=id=>document.getElementById(id);
  const finite=v=>{if(v===null||v===undefined||v==="")return null;const n=Number(v);return Number.isFinite(n)?n:null;};
  const displayCurrency=()=>String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"USD").toUpperCase()==="EUR"?"EUR":"USD";
  const allCoins=()=>state.coins.concat(state.extended).sort((a,b)=>Number(a.rank||99999)-Number(b.rank||99999));
  const selectedCoin=()=>state.externalCoin||allCoins().find(c=>c.id===state.selectedId)||state.coins[0]||null;
  const priceOf=c=>finite(displayCurrency()==="USD"?c?.priceUsd:(c?.priceEur??c?.price));
  const capOf=c=>finite(displayCurrency()==="USD"?c?.marketCapUsd:c?.marketCap);
  const volOf=c=>finite(displayCurrency()==="USD"?c?.volume24hUsd:c?.volume24h);
  const money=v=>Number.isFinite(Number(v))?new Intl.NumberFormat("fr-FR",{style:"currency",currency:displayCurrency(),maximumFractionDigits:Math.abs(Number(v))<1?6:2}).format(Number(v)):"—";
  const compact=v=>Number.isFinite(Number(v))?new Intl.NumberFormat("fr-FR",{style:"currency",currency:displayCurrency(),notation:"compact",maximumFractionDigits:2}).format(Number(v)):"—";
  const pct=v=>Number.isFinite(Number(v))?(Number(v)>=0?"+":"")+Number(v).toFixed(2)+" %":"—";
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  function category(c){const sym=String(c?.symbol||"").toUpperCase(),rank=Number(c?.rank||99999);if(["BTC","ETH"].includes(sym))return"pillar";if(stable.has(sym))return"stablecoin";if(rank<=50)return"major";return"speculative";}
  const ratio=c=>{const v=volOf(c),m=capOf(c);return Number.isFinite(v)&&Number.isFinite(m)&&m>0?v/m:null;};
  function filtered(){
    const q=state.query.trim().toLowerCase();
    const rows=allCoins().filter(c=>(state.filter==="all"||category(c)===state.filter)&&(!q||((c.name||"")+" "+(c.symbol||"")+" "+(c.id||"")).toLowerCase().includes(q)));
    const sorters={
      "rank-asc":(a,b)=>Number(a.rank||99999)-Number(b.rank||99999),
      "volume-desc":(a,b)=>(volOf(b)||-Infinity)-(volOf(a)||-Infinity),
      "change24-desc":(a,b)=>(finite(b.change24h)??-Infinity)-(finite(a.change24h)??-Infinity),
      "change24-asc":(a,b)=>(finite(a.change24h)??Infinity)-(finite(b.change24h)??Infinity),
      "ratio-desc":(a,b)=>(ratio(b)||-Infinity)-(ratio(a)||-Infinity)
    };
    rows.sort(sorters[state.sort]||sorters["rank-asc"]);return rows.slice(0,state.limit);
  }
  async function ensureExtended(){
    if(state.extendedLoaded||state.limit<=250)return;
    const r=await fetch(EXTENDED+"?trader="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);
    const j=await r.json();state.extended=Array.isArray(j?.coins)?j.coins:[];state.extendedLoaded=true;
  }
  function syncPair(coin){
    if(!coin)return;
    const quote=String(coin?.rawQuoteCurrency||coin?.quote||coin?.providerContext?.quote||(displayCurrency()==="USD"?"USDC":"EUR")).toUpperCase();
    const symbol=String(coin.symbol||"BTC").toUpperCase();
    document.documentElement.dataset.traderSelectedPair=symbol+"/"+quote;
    // 40.6.597: Market owns selection only. Lecture Technique and the PAIR status pill
    // are rendered by their dedicated owners; no cross-surface DOM write here.
  }
  async function selectCoin(id,reason="market"){
    const coin=allCoins().find(c=>c.id===id)||state.coins[0];if(!coin)return false;
    state.externalCoin=null;
    try{globalThis.AgentCryptoNewListingLiveAsset?.deactivate?.();}catch(_){}
    state.selectedId=coin.id;syncPair(coin);render();
    const candles=globalThis.AgentCryptoMarketMicroscope;
    try{await candles?.load?.({bar:candles?.snapshot?.()?.bar||"5m",reason:"trader:"+reason});}catch(_){}
    try{await globalThis.AgentCryptoOkxMicrostructure?.refresh?.({asset:String(coin.symbol||"BTC").toUpperCase(),quote:displayCurrency()==="USD"?"USDC":"EUR"});}catch(_){}
    window.dispatchEvent(new CustomEvent("agent-crypto:trader-selection-changed",{detail:{coin:Object.freeze({...coin}),source:reason}}));return true;
  }
  async function selectExternal(coin,reason="new-listing"){
    if(!coin||!coin.id)return false;
    state.externalCoin=Object.freeze({...coin});
    syncPair(state.externalCoin);
    const candles=globalThis.AgentCryptoMarketMicroscope;
    try{await candles?.load?.({bar:candles?.snapshot?.()?.bar||"5m",reason:"trader:"+reason});}catch(_){}
    try{await globalThis.AgentCryptoOkxMicrostructure?.refresh?.({asset:String(coin.symbol||"").toUpperCase(),quote:String(coin?.rawQuoteCurrency||coin?.quote||coin?.providerContext?.quote||"USDT").toUpperCase()});}catch(_){}
    window.dispatchEvent(new CustomEvent("agent-crypto:trader-selection-changed",{detail:{coin:state.externalCoin,source:reason,external:true}}));
    return true;
  }
  function rowMarkup(c){
    const selected=!state.externalCoin&&c.id===state.selectedId,ch24=finite(c.change24h),ch7=finite(c.change7d);
    const tone=v=>Number.isFinite(v)?(v>0?"pos":v<0?"neg":"flat"):"";
    return '<tr data-market-id="'+esc(c.id)+'" data-market-help-id="'+esc(c.id)+'" class="'+(selected?"is-selected":"")+'">'+
      '<td><b>'+esc(c.rank??"—")+'</b></td>'+
      '<td><span class="trader-market-identity">'+(c.image?'<img src="'+esc(c.image)+'" alt="" loading="lazy">':"")+'<span><b>'+esc(c.name||c.symbol)+'</b><small>'+esc(String(c.symbol||"").toUpperCase())+'</small></span></span></td>'+
      '<td><b>'+esc(money(priceOf(c)))+'</b><small class="trader-market-source">CoinGecko public</small></td>'+
      '<td class="'+tone(ch24)+'">'+esc(pct(ch24))+'</td><td class="'+tone(ch7)+'">'+esc(pct(ch7))+'</td>'+
      '<td class="market-col-advanced">'+esc(compact(capOf(c)))+'</td><td class="market-col-advanced">'+esc(compact(volOf(c)))+'</td>'+
      '<td><button class="trader-market-select '+(selected?"is-active":"")+'" type="button" data-market-select="'+esc(c.id)+'">'+(selected?"ACTIF":"Choisir")+'</button></td>'+
      '<td><button class="trader-market-select" type="button" data-market-solo="'+esc(c.id)+'">Solo</button></td></tr>';
  }
  function render(){
    const body=$("marketRows");if(!body)return false;const rows=filtered();
    body.innerHTML=rows.length?rows.map(rowMarkup).join(""):'<tr><td colspan="9" class="empty">Aucun actif pour ce filtre.</td></tr>';
    $("marketWorkspaceGrid")?.setAttribute("data-market-columns",state.columns);
    document.querySelectorAll("[data-market-limit]").forEach(b=>{const on=Number(b.dataset.marketLimit)===state.limit;b.classList.toggle("is-active",on);b.setAttribute("aria-pressed",String(on));});
    document.querySelectorAll("[data-market-columns]").forEach(b=>b.classList.toggle("is-active",b.dataset.marketColumns===state.columns));
    document.querySelectorAll("[data-filter]").forEach(b=>b.classList.toggle("active",b.dataset.filter===state.filter));
    const st=$("marketUniverseStatus");if(st)st.textContent="Univers : "+allCoins().length+" actifs chargés · affichage max "+state.limit;return true;
  }
  function bind(){
    $("searchInput")?.addEventListener("input",e=>{state.query=e.target.value||"";render();});
    $("sortSelect")?.addEventListener("change",e=>{state.sort=e.target.value||"rank-asc";render();});
    document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{state.filter=b.dataset.filter||"all";render();}));
    document.querySelectorAll("[data-market-columns]").forEach(b=>b.addEventListener("click",()=>{state.columns=b.dataset.marketColumns==="complete"?"complete":"essential";render();}));
    document.querySelectorAll("[data-market-limit]").forEach(b=>b.addEventListener("click",async()=>{state.limit=Math.max(50,Math.min(1000,Number(b.dataset.marketLimit)||50));try{await ensureExtended();}catch(_){}render();}));
    $("marketRows")?.addEventListener("click",e=>{const target=e.target.closest("[data-market-select],[data-market-solo],tr[data-market-id]");const id=target?.dataset?.marketSelect||target?.dataset?.marketSolo||target?.dataset?.marketId;if(id)void selectCoin(id,target?.dataset?.marketSolo?"market-solo":"market-select");});
  }
  async function start(){
    bind();try{
      const r=await fetch(LATEST+"?trader="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);
      const j=await r.json();if(j?.schema!=="agent_crypto_public_market_snapshot_v1"||!Array.isArray(j.coins))throw new Error("snapshot invalide");
      state.coins=j.coins.slice().sort((a,b)=>Number(a.rank||99999)-Number(b.rank||99999));state.loaded=true;
      if(!state.coins.some(c=>c.id===state.selectedId))state.selectedId=state.coins[0]?.id||"";
      render();await selectCoin(state.selectedId,"market-boot");document.documentElement.dataset.traderMarket="ready";
    }catch(error){const body=$("marketRows");if(body)body.innerHTML='<tr><td colspan="9" class="empty">Market indisponible · '+esc(error?.message||error)+'</td></tr>';document.documentElement.dataset.traderMarket="error";}
  }
  globalThis.getSelectedCoin=()=>selectedCoin();
  globalThis.AgentCryptoTraderMarket=Object.freeze({build:BUILD,start,select:selectCoin,selectExternal,selected:selectedCoin,snapshot:()=>Object.freeze({build:BUILD,loaded:state.loaded,assets:allCoins().length,selected_id:state.externalCoin?.id||state.selectedId,external_selected:!!state.externalCoin,limit:state.limit,filter:state.filter,columns:state.columns,sort:state.sort}),source:"PUBLIC_GITHUB_COINGECKO_ECB",browser_direct_coingecko:false,real_order:false});
  window.addEventListener("agent-crypto:quote-architecture-changed",()=>{syncPair(selectedCoin());render();},{passive:true});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>void start(),{once:true});else void start();
})();
