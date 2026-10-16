(() => {
  "use strict";
  const BUILD="40.6.589";
  const BUTTON_ID="atlasNewListingsButton406528";
  const ROOT_ATTR="data-new-listing-id";
  const BITGET="https://api.bitget.com";
  const IDENTITIES="../administrator/data/new-listings-identities.json";
  const state={enabled:false,discovering:false,specs:[],tickerMap:new Map(),rates:new Map(),identityBySymbol:new Map(),selectedId:null,lastError:null,lastDiscoveryAt:null};
  const $=id=>document.getElementById(id);
  const finite=v=>{if(v===null||v===undefined||v==="")return null;const n=Number(v);return Number.isFinite(n)?n:null;};
  const positive=v=>{const n=finite(v);return n!==null&&n>0?n:null;};
  const upper=v=>String(v??"").trim().toUpperCase();
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const pct=v=>{const n=finite(v);return n===null?"—":(n>=0?"+":"")+n.toFixed(2)+" %";};
  const displayCurrency=()=>String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"USD").toUpperCase()==="EUR"?"EUR":"USD";
  const money=(v,currency=displayCurrency())=>{
    const n=finite(v);if(n===null)return"—";
    const a=Math.abs(n),digits=a>=1000?2:a>=1?4:a>=.01?6:a>=.0001?8:10;
    try{return new Intl.NumberFormat("fr-FR",{style:"currency",currency,minimumFractionDigits:Math.min(2,digits),maximumFractionDigits:digits}).format(n);}
    catch(_){return String(n)+" "+currency;}
  };
  const compact=(v,currency=displayCurrency())=>{
    const n=finite(v);if(n===null)return"—";
    try{return new Intl.NumberFormat("fr-FR",{style:"currency",currency,notation:"compact",maximumFractionDigits:2}).format(n);}
    catch(_){return String(n);}
  };
  async function json(url,{timeoutMs=15000}={}){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const r=await fetch(url,{cache:"no-store",signal:controller.signal,headers:{Accept:"application/json"}});
      if(!r.ok)throw new Error("HTTP "+r.status);
      return await r.json();
    }finally{clearTimeout(timer);}
  }
  async function loadIdentities(){
    try{
      const r=await fetch(IDENTITIES+"?trader="+Date.now(),{cache:"no-store"});
      if(!r.ok)return;
      const j=await r.json();
      const map=new Map();
      Object.values(j?.identities||{}).forEach(item=>{
        const sym=upper(item?.symbol);if(!sym)return;
        map.set(sym,{...item,image:item?.image?"../administrator/"+String(item.image).replace(/^\.\//,""):""});
      });
      state.identityBySymbol=map;
    }catch(_){}
  }
  async function fetchTickers(){
    const u=new URL(BITGET+"/api/v3/market/tickers");u.searchParams.set("category","SPOT");
    const j=await json(u);
    if(String(j?.code)!=="00000"||!Array.isArray(j?.data))throw new Error(j?.msg||"Bitget tickers indisponibles");
    state.tickerMap=new Map(j.data.map(row=>[upper(row?.symbol),row]).filter(([symbol])=>symbol));
  }
  async function fetchRates(){
    const u=new URL("https://api.coingecko.com/api/v3/simple/price");
    u.searchParams.set("ids","tether,usd-coin");u.searchParams.set("vs_currencies","usd,eur");
    try{
      const j=await json(u,{timeoutMs:12000}),rates=new Map();
      const usdt=j?.tether||{},usdc=j?.["usd-coin"]||{};
      if(positive(usdt.usd))rates.set("USDT:USD",Number(usdt.usd));
      if(positive(usdt.eur))rates.set("USDT:EUR",Number(usdt.eur));
      if(positive(usdc.usd))rates.set("USDC:USD",Number(usdc.usd));
      if(positive(usdc.eur))rates.set("USDC:EUR",Number(usdc.eur));
      rates.set("USD:USD",1);rates.set("EUR:EUR",1);
      state.rates=rates;
    }catch(_){
      state.rates=new Map([["USD:USD",1],["EUR:EUR",1]]);
    }
  }
  function rate(quote,currency){
    const q=upper(quote),c=upper(currency);if(q===c)return 1;
    return positive(state.rates.get(q+":"+c));
  }
  function enrich(row){
    const base=upper(row?.base),quote=upper(row?.quote),providerSymbol=upper(row?.providerSymbol);
    if(!base||!quote||!providerSymbol)return null;
    const idn=state.identityBySymbol.get(base)||null;
    const isCt=base==="CT";
    const provider=isCt?"okx":"bitget";
    const providerSymbolFinal=isCt?"CT-USDT":providerSymbol;
    const quoteFinal=isCt?"USDT":quote;
    const ticker=state.tickerMap.get(providerSymbol)||null;
    return {
      id:idn?.coingeckoId||"new-listing:bitget:"+providerSymbol.toLowerCase(),
      name:idn?.displayName||base,
      canonicalName:idn?.canonicalName||null,
      symbol:base,base,quote:quoteFinal,
      provider,providerLabel:isCt?"OKX":"Bitget",
      providerSymbol:providerSymbolFinal,
      discoverySymbol:providerSymbol,
      pair:base+"/"+quoteFinal,
      instrument:base+"-"+quoteFinal,
      listedAt:row?.listedAt||null,
      launchTime:Number(row?.launchTime||Date.parse(row?.listedAt||""))||null,
      ageDays:finite(row?.ageDays),
      image:idn?.image||"",
      identityVerified:!!idn?.verified,
      ticker
    };
  }
  function coinFromSpec(spec){
    const ticker=spec?.ticker||{},raw=positive(ticker.lastPrice),changeRaw=finite(ticker.price24hPcnt),turnover=finite(ticker.turnover24h);
    const usdRate=rate(spec.quote,"USD"),eurRate=rate(spec.quote,"EUR");
    const priceUsd=raw&&usdRate?raw*usdRate:null,priceEur=raw&&eurRate?raw*eurRate:null;
    const volumeUsd=turnover!==null&&usdRate?turnover*usdRate:null,volumeEur=turnover!==null&&eurRate?turnover*eurRate:null;
    const ts=finite(ticker.ts),lastUpdated=ts?new Date(ts).toISOString():new Date().toISOString();
    return Object.freeze({
      id:spec.id,name:spec.name,symbol:spec.symbol,rank:null,image:spec.image||null,
      price:priceEur,priceEur,priceUsd,marketCap:null,marketCapUsd:null,volume24h:volumeEur,volume24hUsd:volumeUsd,
      change24h:changeRaw===null?null:changeRaw*100,change7d:null,change30d:null,lastUpdated,usdUpdatedAt:lastUpdated,
      source:spec.providerLabel+" "+spec.pair+" · marché public",
      usdSource:usdRate?spec.providerLabel+" "+spec.pair+" × "+spec.quote+"/USD CoinGecko":null,
      externalNewListing:true,listedAt:spec.listedAt,listingProvider:spec.providerLabel,listingPair:spec.pair,
      rawQuotePrice:raw,rawQuoteCurrency:spec.quote,quote:spec.quote,providerContext:spec
    });
  }
  async function discover(){
    if(state.discovering)return state.specs.slice();
    state.discovering=true;state.lastError=null;
    try{
      await Promise.all([loadIdentities(),fetchTickers(),fetchRates()]);
      const rows=await globalThis.AgentCryptoNewListingLiveAsset?.discoverBitget?.({days:30});
      state.specs=(Array.isArray(rows)?rows:[]).map(enrich).filter(Boolean).sort((a,b)=>(b.launchTime||0)-(a.launchTime||0));
      state.lastDiscoveryAt=new Date().toISOString();
      render();
      return state.specs.slice();
    }catch(error){
      state.lastError=String(error?.message||error);render();return [];
    }finally{state.discovering=false;}
  }
  function visible(){
    const q=String($("searchInput")?.value||"").trim().toUpperCase();
    let rows=state.specs.filter(spec=>!q||[spec.id,spec.name,spec.symbol,spec.pair,spec.providerLabel,spec.discoverySymbol].join(" ").toUpperCase().includes(q));
    const sort=$("sortSelect")?.value||"rank-asc";
    if(sort==="change24-desc")rows.sort((a,b)=>(finite(b.ticker?.price24hPcnt)??-Infinity)-(finite(a.ticker?.price24hPcnt)??-Infinity));
    else if(sort==="change24-asc")rows.sort((a,b)=>(finite(a.ticker?.price24hPcnt)??Infinity)-(finite(b.ticker?.price24hPcnt)??Infinity));
    else if(sort==="volume-desc")rows.sort((a,b)=>(finite(b.ticker?.turnover24h)??-Infinity)-(finite(a.ticker?.turnover24h)??-Infinity));
    else rows.sort((a,b)=>(b.launchTime||0)-(a.launchTime||0));
    return rows;
  }
  function rowMarkup(spec){
    const coin=coinFromSpec(spec),cur=displayCurrency(),price=cur==="USD"?finite(coin.priceUsd):finite(coin.priceEur);
    const selected=state.selectedId===spec.id,ch24=finite(coin.change24h),tone=ch24===null?"":ch24>0?"pos":ch24<0?"neg":"flat";
    const age=finite(spec.ageDays);
    return '<tr '+ROOT_ATTR+'="'+esc(spec.id)+'" data-market-help-id="'+esc(spec.id)+'" class="'+(selected?"is-selected":"")+'" tabindex="0" role="button" aria-selected="'+selected+'">'+
      '<td><b>NEW</b></td>'+
      '<td><span class="trader-market-identity">'+(spec.image?'<img src="'+esc(spec.image)+'" alt="" loading="lazy">':"")+'<span><b>'+esc(spec.name)+'</b><small>'+esc(spec.symbol)+'</small><em class="asset-badge">Nouveau listing'+(age!==null?" · "+age.toFixed(1)+" j":"")+'</em></span></span></td>'+
      '<td><b>'+esc(price!==null?money(price,cur):(positive(spec.ticker?.lastPrice)!==null?Number(spec.ticker.lastPrice).toLocaleString("fr-FR",{maximumFractionDigits:10})+" "+spec.quote:"—"))+'</b><small class="trader-market-source">'+esc(spec.providerLabel+" "+spec.pair)+'</small></td>'+
      '<td class="'+tone+'">'+esc(pct(ch24))+'</td><td>—</td>'+
      '<td class="market-col-advanced">—</td><td class="market-col-advanced">'+esc(compact(cur==="USD"?coin.volume24hUsd:coin.volume24h,cur))+'</td>'+
      '<td><button class="trader-market-select '+(selected?"is-active":"")+'" type="button" data-new-listing-select="'+esc(spec.id)+'">'+(selected?"ACTIF":"Choisir")+'</button></td>'+
      '<td><button class="trader-market-select" type="button" data-new-listing-select="'+esc(spec.id)+'">Solo</button></td></tr>';
  }
  function render(){
    if(!state.enabled)return false;
    const body=$("marketRows");if(!body)return false;
    const rows=visible();
    body.innerHTML=rows.length?rows.map(rowMarkup).join(""):'<tr><td colspan="9" class="empty">'+esc(state.discovering?"Chargement des nouveaux listings…":state.lastError?"Nouveaux listings indisponibles · "+state.lastError:"Aucun nouveau listing pour ce filtre.")+'</td></tr>';
    const btn=$(BUTTON_ID);btn?.classList.add("active","is-active");btn?.setAttribute("aria-pressed","true");
    document.querySelectorAll(".filter-btn[data-filter]").forEach(b=>b.classList.remove("active"));
    const st=$("marketUniverseStatus");if(st)st.textContent=state.lastError?"Nouveaux listings · "+state.lastError:"Nouveaux listings · "+state.specs.length+" instrument(s) ≤30 j · Bitget SPOT";
    const note=$("tableNote");if(note)note.textContent="Nouveaux listings · Market natif · aucune mutation du Market Core 38.15.11";
    return true;
  }
  function findSpec(id){const key=String(id||"");return state.specs.find(x=>x.id===key)||null;}
  async function select(spec){
    if(!spec)return false;
    try{
      const loaded=await globalThis.AgentCryptoNewListingLiveAsset?.load?.({
        provider:spec.provider,name:spec.name,id:spec.id,base:spec.base,quote:spec.quote,
        providerSymbol:spec.providerSymbol,listedAt:spec.listedAt
      },{nativeMarket:true});
      if(loaded?.marketTicker){
        spec.ticker={...(spec.ticker||{}),lastPrice:loaded.marketTicker.lastPrice,price24hPcnt:finite(loaded.marketTicker.change24h)!==null?Number(loaded.marketTicker.change24h)/100:spec.ticker?.price24hPcnt,ts:Date.parse(loaded.marketTicker.timestamp||"")||spec.ticker?.ts};
      }
      state.selectedId=spec.id;
      const coin=coinFromSpec(spec);
      await globalThis.AgentCryptoTraderMarket?.selectExternal?.(coin,"new-listing-native");
      render();
      return true;
    }catch(error){
      state.lastError=String(error?.message||error);render();return false;
    }
  }
  function setEnabled(value){
    state.enabled=!!value;
    const btn=$(BUTTON_ID);if(btn){btn.classList.toggle("active",state.enabled);btn.classList.toggle("is-active",state.enabled);btn.setAttribute("aria-pressed",String(state.enabled));}
    if(state.enabled){
      document.querySelectorAll(".filter-btn[data-filter]").forEach(b=>b.classList.remove("active"));
      if(!state.specs.length)void discover();else render();
    }
    return state.enabled;
  }
  function bind(){
    const button=$(BUTTON_ID);
    button?.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();setEnabled(!state.enabled);if(!state.enabled)document.querySelector('.filter-btn[data-filter="all"]')?.click();},true);
    document.addEventListener("click",e=>{
      const normal=e.target.closest?.(".filter-btn[data-filter]");
      if(normal&&state.enabled){setEnabled(false);}
    },true);
    $("searchInput")?.addEventListener("input",e=>{if(!state.enabled)return;e.stopImmediatePropagation();render();},true);
    $("sortSelect")?.addEventListener("change",e=>{if(!state.enabled)return;e.stopImmediatePropagation();render();},true);
    document.querySelectorAll("[data-market-limit]").forEach(b=>b.addEventListener("click",e=>{if(!state.enabled)return;e.preventDefault();e.stopImmediatePropagation();},true));
    $("marketRows")?.addEventListener("click",e=>{
      const target=e.target.closest?.("[data-new-listing-select],tr["+ROOT_ATTR+"]");if(!target)return;
      const row=target.closest?.("tr["+ROOT_ATTR+"]")||target;
      const id=target.dataset.newListingSelect||row?.getAttribute(ROOT_ATTR);
      const spec=findSpec(id);if(!spec)return;
      e.preventDefault();e.stopImmediatePropagation();void select(spec);
    },true);
    $("marketRows")?.addEventListener("keydown",e=>{
      const row=e.target.closest?.("tr["+ROOT_ATTR+"]");if(!row||!["Enter"," "].includes(e.key))return;
      e.preventDefault();e.stopImmediatePropagation();void select(findSpec(row.getAttribute(ROOT_ATTR)));
    },true);
  }
  function snapshot(){return Object.freeze({build:BUILD,enabled:state.enabled,discovered:state.specs.length,selected_id:state.selectedId,last_error:state.lastError,last_discovery_at:state.lastDiscoveryAt,native_only:true,duplicate_graph:false,duplicate_fiche:false,duplicate_depth:false});}
  const api=Object.freeze({build:BUILD,native_only:true,discover,select,setEnabled,snapshot,real_order:false,market_core_changed:false,ranking_mutation:false,state_coins_injection:false,duplicate_graph:false,duplicate_fiche:false,duplicate_depth:false});
  globalThis.AgentCryptoNewListingsNativeCategory=api;
  globalThis.AgentCryptoNewListingsNativeCategory406588=api;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
})();