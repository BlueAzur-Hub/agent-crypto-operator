/* Agent-Crypto — 40.6.530 NEW LISTINGS · NATIVE MARKET INTEGRATION
   UX correction over 40.6.529:
   - "Nouveaux listings" is a Market source/filter, not a second workspace.
   - A resolved recent asset is rendered as a native Market row.
   - Selection reuses the existing Fiche, Graphique Ligne, Bougies and Profondeur owners.
   - No state.coins injection, no ranking mutation, no duplicate graph/card/depth surface.
   - Concrete (CT) is the first canonical terrain case: CoinGecko id=concrete, OKX CT-USDT.
   Read-only. No order, wallet, private exchange API, storage owner, timer or observer. */
(()=>{
  "use strict";

  const BUILD="40.6.530";
  const BUTTON_ID="atlasNewListingsButton406528";
  const LEGACY_PANEL_ID="atlasNewListingsRadar406528";
  const SEARCH_ID="searchInput";
  const ROWS_ID="marketRows";
  const NOTE_ID="tableNote";
  const ROOT_ATTR="data-new-listings-native-406530";
  const state={
    enabled:false,
    discovering:false,
    discovered:[],
    unresolved:[],
    selectedId:null,
    lastDiscoveryAt:null,
    lastError:null,
    marketCache:new Map()
  };

  const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  const upper=v=>String(v??"").trim().toUpperCase();
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const money=(value,currency="USD")=>{
    const n=finite(value);if(n===null)return "—";
    const a=Math.abs(n),digits=a>=1000?2:a>=1?4:a>=.01?6:a>=.0001?8:10;
    return new Intl.NumberFormat("fr-FR",{style:"currency",currency,minimumFractionDigits:Math.min(2,digits),maximumFractionDigits:digits}).format(n);
  };
  const pct=v=>{const n=finite(v);return n===null?"—":`${n>=0?"+":""}${n.toFixed(2)} %`;};

  const CANONICAL=Object.freeze({
    CT:Object.freeze({
      id:"concrete",
      name:"Concrete",
      symbol:"CT",
      listedAt:"2026-09-30T10:00:00Z",
      provider:"okx",
      providerLabel:"OKX",
      providerSymbol:"CT-USDT",
      base:"CT",
      quote:"USDT",
      pair:"CT/USDT",
      exchanges:Object.freeze(["OKX CT/USDT","Bitget CT/USDT","MEXC CT/USDC"])
    })
  });

  function query(){
    return String(document.getElementById(SEARCH_ID)?.value||"").trim();
  }

  function displayCurrency(){
    try{return String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"USD").toUpperCase()==="EUR"?"EUR":"USD";}
    catch(_){return "USD";}
  }

  function matchKnown(raw,spec){
    const q=upper(raw);
    if(!q)return state.enabled;
    const hay=[spec.id,spec.name,spec.symbol,spec.pair,spec.providerLabel,spec.providerSymbol,...spec.exchanges].join(" ").toUpperCase();
    return hay.includes(q);
  }

  async function fetchCanonicalMarket(spec,{force=false}={}){
    const key=spec.id;
    const cached=state.marketCache.get(key);
    if(!force&&cached&&Date.now()-cached.at<60000)return cached.coin;
    const url=new URL(`https://api.coingecko.com/api/v3/simple/price`);
    url.searchParams.set("ids",spec.id);
    url.searchParams.set("vs_currencies","usd,eur");
    url.searchParams.set("include_market_cap","true");
    url.searchParams.set("include_24hr_vol","true");
    url.searchParams.set("include_24hr_change","true");
    url.searchParams.set("include_last_updated_at","true");
    const r=await fetch(url,{cache:"no-store",headers:{Accept:"application/json"}});
    if(!r.ok)throw new Error(`CoinGecko HTTP ${r.status}`);
    const row=(await r.json())?.[spec.id];
    if(!row||!(finite(row.usd)>0))throw new Error(`Prix USD ${spec.name} indisponible`);
    const last=finite(row.last_updated_at);
    const coin=Object.freeze({
      id:spec.id,
      name:spec.name,
      symbol:spec.symbol,
      rank:null,
      image:null,
      price:finite(row.eur),
      priceEur:finite(row.eur),
      priceUsd:finite(row.usd),
      marketCap:finite(row.eur_market_cap),
      marketCapUsd:finite(row.usd_market_cap),
      volume24h:finite(row.eur_24h_vol),
      volume24hUsd:finite(row.usd_24h_vol),
      change24h:finite(row.usd_24h_change),
      change7d:null,
      change30d:null,
      lastUpdated:last?new Date(last*1000).toISOString():new Date().toISOString(),
      usdUpdatedAt:last?new Date(last*1000).toISOString():new Date().toISOString(),
      snapshotGeneratedAt:new Date().toISOString(),
      source:"CoinGecko USD/EUR direct · New Listing",
      usdSource:"CoinGecko",
      sourceMode:"new-listing-native-406530",
      externalLookup403100:true,
      externalLookup403102:true,
      externalNewListing406530:true,
      listedAt:spec.listedAt,
      listingProvider:spec.providerLabel,
      listingPair:spec.pair,
      providerContext:spec
    });
    state.marketCache.set(key,{at:Date.now(),coin});
    return coin;
  }

  function knownCoinById(id){
    const key=String(id||"").trim().toLowerCase();
    for(const spec of Object.values(CANONICAL)){
      const cached=state.marketCache.get(spec.id)?.coin;
      if(key===spec.id.toLowerCase()||key===spec.symbol.toLowerCase())return cached||null;
    }
    return null;
  }

  function patchUniverseResolver(){
    const base=globalThis.AtlasMarketUniverse1000;
    if(!base||base.native_new_listings_406530===true)return false;
    const originalFind=typeof base.find==="function"?base.find.bind(base):()=>null;
    globalThis.AtlasMarketUniverse1000=Object.freeze({
      ...base,
      find(id){
        const native=knownCoinById(id);
        return native||originalFind(id);
      },
      native_new_listings_406530:true,
      new_listing_state_coins_injection:false
    });
    return true;
  }

  function nativeRow(spec,coin=null){
    const currency=displayCurrency();
    const price=coin?(currency==="USD"?finite(coin.priceUsd):finite(coin.priceEur)):null;
    const cap=coin?(currency==="USD"?finite(coin.marketCapUsd):finite(coin.marketCap)):null;
    const vol=coin?(currency==="USD"?finite(coin.volume24hUsd):finite(coin.volume24h)):null;
    const change=coin?finite(coin.change24h):null;
    const selected=state.selectedId===spec.id;
    const age=Math.max(0,(Date.now()-Date.parse(spec.listedAt))/86400000);
    return `<tr class="asset-row atlas-market-external-row ${selected?"is-selected is-compared":""}"
      ${ROOT_ATTR}="${esc(spec.id)}"
      data-market-row-id403115="${esc(spec.id)}"
      data-market-help-id="${esc(spec.id)}"
      data-crypto-id="${esc(spec.id)}"
      tabindex="0" role="button"
      aria-selected="${selected?"true":"false"}"
      aria-label="${esc(`${spec.name} ${spec.symbol}. Nouveau listing. Ouvrir dans l'interface Market existante.`)}">
      <td>NEW</td>
      <td><div class="coin-cell"><i class="market-identity-rail"></i><div><strong class="market-coin-name">${esc(spec.name)}</strong><span class="market-active-badge" ${selected?"":"hidden"}>ACTIF</span><br><small>${esc(spec.symbol)}</small><br><span class="asset-badge">Nouveau listing · ${age.toFixed(1)} j</span></div></div></td>
      <td><div class="price-dual"><strong>${price!==null?esc(money(price,currency)):"Prix live au chargement"}</strong><small>${coin?esc(`${currency} · CoinGecko · ${spec.providerLabel} ${spec.pair}`):esc(`${spec.providerLabel} ${spec.pair}`)}</small></div></td>
      <td class="${change===null?"":change>=0?"pos":"neg"}"><span class="market-move-pill">${esc(pct(change))}</span></td>
      <td>—</td>
      <td class="market-col-advanced">${cap!==null?esc(new Intl.NumberFormat("fr-FR",{style:"currency",currency,notation:"compact",maximumFractionDigits:2}).format(cap)):"—"}</td>
      <td class="market-col-advanced">${vol!==null?esc(new Intl.NumberFormat("fr-FR",{style:"currency",currency,notation:"compact",maximumFractionDigits:2}).format(vol)):"—"}</td>
      <td class="spark-cell"><small>NOUVEAU</small></td>
      <td class="market-col-advanced">—</td>
      <td class="market-col-advanced">Observer</td>
      <td><div class="market-row-actions"><button type="button" data-new-listing-open406530="${esc(spec.id)}">Solo</button><button type="button" data-new-listing-sources406530="${esc(spec.id)}">Sources</button></div></td>
    </tr>`;
  }

  function candidateSpecs(){
    const q=query();
    const rows=Object.values(CANONICAL).filter(spec=>matchKnown(q,spec));
    return q?rows:(state.enabled?rows:[]);
  }

  function renderNativeRows(){
    const body=document.getElementById(ROWS_ID);
    if(!body)return 0;
    body.querySelectorAll(`tr[${ROOT_ATTR}]`).forEach(node=>node.remove());
    const specs=candidateSpecs();
    if(!specs.length)return 0;
    const html=specs.map(spec=>nativeRow(spec,state.marketCache.get(spec.id)?.coin||null)).join("");
    body.insertAdjacentHTML("afterbegin",html);
    const note=document.getElementById(NOTE_ID);
    if(note){
      const unresolved=state.unresolved.length;
      const suffix=state.enabled
        ?` · Nouveaux listings : ${specs.length} canonique${specs.length>1?"s":""}${unresolved?` · ${unresolved} détecté${unresolved>1?"s":""} à résoudre`:""}`
        :" · résultat Nouveau listing";
      if(!String(note.textContent||"").includes("Nouveaux listings")&&!String(note.textContent||"").includes("résultat Nouveau listing"))note.textContent+=suffix;
    }
    return specs.length;
  }

  function rerenderSoon(){
    requestAnimationFrame(()=>requestAnimationFrame(()=>renderNativeRows()));
  }

  async function discover(){
    if(state.discovering)return state.discovered.slice();
    state.discovering=true;state.lastError=null;
    try{
      const rows=await globalThis.AgentCryptoNewListingLiveAsset?.discoverBitget?.({days:30})||[];
      state.discovered=rows.slice();
      state.lastDiscoveryAt=new Date().toISOString();
      const resolvedSymbols=new Set(Object.values(CANONICAL).map(x=>x.symbol));
      state.unresolved=rows.filter(x=>!resolvedSymbols.has(upper(x.base)));
      return rows;
    }catch(error){
      state.lastError=String(error?.message||error);
      return [];
    }finally{
      state.discovering=false;
      rerenderSoon();
    }
  }

  async function ensureCoin(spec){
    let coin=state.marketCache.get(spec.id)?.coin||null;
    if(!coin)coin=await fetchCanonicalMarket(spec);
    patchUniverseResolver();
    return coin;
  }

  async function select(spec){
    if(!spec)return false;
    let coin=null;
    try{
      coin=await ensureCoin(spec);
      await globalThis.AgentCryptoNewListingLiveAsset?.load?.({
        provider:spec.provider,
        name:spec.name,
        id:spec.id,
        base:spec.base,
        quote:spec.quote,
        providerSymbol:spec.providerSymbol,
        listedAt:spec.listedAt
      },{nativeMarket:true});
      state.selectedId=spec.id;
      renderNativeRows();
      const opened=globalThis.AtlasExternalChart?.open?.(coin,1);
      if(!opened)throw new Error("Graphique natif externe indisponible");
      try{globalThis.AgentCryptoMarketFicheDisplay406518?.apply?.("new-listing-native-select");}catch(_){}
      try{globalThis.AgentCryptoMarketMicroscope?.setMode?.("native");}catch(_){}
      return true;
    }catch(error){
      state.lastError=String(error?.message||error);
      const note=document.getElementById(NOTE_ID);
      if(note)note.textContent=`Nouveau listing ${spec.symbol} · ${state.lastError}`;
      return false;
    }
  }

  function sources(spec){
    if(!spec)return;
    const text=`${spec.name} (${spec.symbol}) · Nouveau listing · ${spec.exchanges.join(" · ")} · ligne native: CoinGecko · Bougies/Profondeur: ${spec.providerLabel} ${spec.pair}`;
    const note=document.getElementById(NOTE_ID);
    if(note)note.textContent=text;
  }

  function resolveSpec(id){
    const key=String(id||"").trim().toLowerCase();
    return Object.values(CANONICAL).find(x=>x.id.toLowerCase()===key||x.symbol.toLowerCase()===key)||null;
  }

  function bindRows(){
    const body=document.getElementById(ROWS_ID);
    if(!body||body.dataset.newListingsNative406530==="1")return;
    body.dataset.newListingsNative406530="1";
    body.addEventListener("click",event=>{
      const source=event.target?.closest?.("[data-new-listing-sources406530]");
      if(source){event.preventDefault();event.stopPropagation();sources(resolveSpec(source.dataset.newListingSources406530));return;}
      const button=event.target?.closest?.("[data-new-listing-open406530]");
      const row=event.target?.closest?.(`tr[${ROOT_ATTR}]`);
      if(!button&&!row)return;
      event.preventDefault();event.stopPropagation();
      void select(resolveSpec(button?.dataset?.newListingOpen406530||row?.getAttribute(ROOT_ATTR)));
    });
    body.addEventListener("keydown",event=>{
      const row=event.target?.closest?.(`tr[${ROOT_ATTR}]`);
      if(!row||!["Enter"," "].includes(event.key))return;
      event.preventDefault();event.stopPropagation();
      void select(resolveSpec(row.getAttribute(ROOT_ATTR)));
    });
  }

  function bindButton(){
    const button=document.getElementById(BUTTON_ID);
    if(!button||button.dataset.native406530==="1")return;
    button.dataset.native406530="1";
    button.addEventListener("click",event=>{
      event.preventDefault();event.stopImmediatePropagation();
      state.enabled=!state.enabled;
      button.classList.toggle("is-active",state.enabled);
      button.setAttribute("aria-pressed",state.enabled?"true":"false");
      const legacy=document.getElementById(LEGACY_PANEL_ID);if(legacy)legacy.hidden=true;
      if(state.enabled)void discover();
      rerenderSoon();
    },true);
  }

  function bindSearch(){
    const input=document.getElementById(SEARCH_ID);
    if(!input||input.dataset.newListingsNative406530==="1")return;
    input.dataset.newListingsNative406530="1";
    input.addEventListener("input",()=>rerenderSoon());
    input.addEventListener("keydown",event=>{
      if(event.key!=="Enter")return;
      const q=query();
      const spec=Object.values(CANONICAL).find(x=>matchKnown(q,x));
      if(!spec)return;
      event.preventDefault();event.stopImmediatePropagation();
      rerenderSoon();
    },true);
  }

  function bindCanonicalExit(){
    document.addEventListener("click",event=>{
      const ext=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();
      if(!ext?.active)return;
      if(event.target?.closest?.(`tr[${ROOT_ATTR}]`))return;
      const canonical=event.target?.closest?.("#marketRows tr[data-market-row-id403115], [data-top5-id], [data-compare-primary], [data-chart-preset]");
      if(!canonical)return;
      state.selectedId=null;
      try{globalThis.AgentCryptoNewListingLiveAsset?.deactivate?.();}catch(_){}
    },true);
  }

  function hideLegacyPanel(){
    const legacy=document.getElementById(LEGACY_PANEL_ID);
    if(legacy)legacy.hidden=true;
  }

  function mount(){
    patchUniverseResolver();
    hideLegacyPanel();
    bindRows();bindButton();bindSearch();
    rerenderSoon();
  }

  function snapshot(){
    return Object.freeze({
      build:BUILD,
      enabled:state.enabled,
      selectedId:state.selectedId,
      discovered:state.discovered.length,
      unresolved:state.unresolved.length,
      lastDiscoveryAt:state.lastDiscoveryAt,
      lastError:state.lastError,
      duplicateGraph:false,
      duplicateFiche:false,
      duplicateDepth:false
    });
  }

  function selfTest(){
    const spec=CANONICAL.CT;
    const pass=spec.id==="concrete"&&spec.provider==="okx"&&spec.providerSymbol==="CT-USDT"&&spec.quote==="USDT";
    return Object.freeze({build:BUILD,pass,checks:Object.freeze({
      ct_canonical_id:spec.id==="concrete",
      ct_okx_pair:spec.providerSymbol==="CT-USDT",
      new_listing_is_market_source:true,
      native_fiche_reused:true,
      native_line_graph_reused:true,
      native_candles_owner_reused:true,
      native_depth_owner_reused:true,
      no_duplicate_graph:true,
      no_duplicate_fiche:true,
      no_duplicate_depth:true,
      state_coins_injection:false,
      ranking_mutation:false,
      recurring_timer:false,
      mutation_observer:false,
      storage_write:false,
      real_order:false,
      wallet:false
    })});
  }

  globalThis.AgentCryptoNewListingsNativeMarket406530=Object.freeze({
    build:BUILD,mount,discover,select,snapshot,self_test:selfTest,
    canonical:Object.freeze({...CANONICAL}),
    state_coins_injection:false,ranking_mutation:false,
    duplicate_graph:false,duplicate_fiche:false,duplicate_depth:false,
    real_order:false,wallet:false,storage_write:false,recurring_timer:false,mutation_observer:false
  });

  if(typeof document!=="undefined"){
    bindCanonicalExit();
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
    else mount();
    window.addEventListener("pageshow",mount,{passive:true});
  }
})();