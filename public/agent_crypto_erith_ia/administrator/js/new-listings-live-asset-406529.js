/* Agent-Crypto — 40.6.529 NEW LISTINGS LIVE ASSET PIPELINE V1
   Read-only external-asset context for very recent SPOT listings.
   Purpose: a recent asset may be absent from CoinGecko Top 1000 but must still be loadable
   into the existing Graphique / Bougies / Profondeur surfaces.
   Providers V1: OKX public (through the existing 40.6.526 local transport) + Bitget public.
   Discovery V1: Bitget SPOT instruments launchTime, operator-triggered only.
   No state.coins injection, ranking mutation, storage write, recurring timer, observer, order or wallet. */
(()=>{
  "use strict";

  const BUILD="40.6.534";
  const BITGET="https://api.bitget.com";
  const OKX="https://www.okx.com";
  const EVENT="agent-crypto:external-asset-changed";
  const DISCOVERY_ID="atlasNewListingsLive529";
  const ACTIVE_ID="atlasNewListingActive529";
  const state={loadRevision:0,loadController:null,active:null,discovered:[],discovering:false,lastDiscoveryAt:null,lastError:null};

  const n=v=>{if(v===null||v===undefined||String(v).trim()==="")return null;const x=Number(v);return Number.isFinite(x)?x:null;};
  const upper=v=>String(v??"").trim().toUpperCase();
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const isoMs=v=>{const x=Number(v);return Number.isFinite(x)&&x>0?new Date(x).toISOString():null;};
  const frozen=v=>Object.freeze(v);

  function normalizePair(value){
    const m=upper(value).replace(/_/g,"-").match(/^([A-Z0-9]+)[\/-]?([A-Z0-9]+)$/);
    return m?{base:m[1],quote:m[2],display:`${m[1]}/${m[2]}`,dash:`${m[1]}-${m[2]}`,compact:`${m[1]}${m[2]}`}:null;
  }

  function normalizeContext(input={}){
    const provider=String(input.provider||"").trim().toLowerCase();
    if(!["okx","bitget"].includes(provider))return null;
    const base=upper(input.base||input.symbol);
    const quote=upper(input.quote);
    const providerSymbol=upper(input.providerSymbol||input.instrument);
    if(!base||!quote||!providerSymbol)return null;
    const expected=provider==="okx"?`${base}-${quote}`:`${base}${quote}`;
    if(providerSymbol!==expected)return null;
    const listedAt=input.listedAt?new Date(input.listedAt).toISOString():null;
    return frozen({
      active:true,
      domain:"NEW_LISTING",
      id:String(input.id||`${provider}:${providerSymbol.toLowerCase()}`),
      name:String(input.name||base),
      symbol:base,
      base,
      quote,
      provider,
      providerLabel:provider==="okx"?"OKX":"Bitget",
      providerSymbol,
      pair:`${base}/${quote}`,
      instrument:`${base}-${quote}`,
      listedAt,
      loadedAt:new Date().toISOString(),
      readOnly:true,
      sourceFamily:`new-listing-${provider}`
    });
  }

  function snapshot(){return state.active?frozen({...state.active}):frozen({active:false,domain:"MARKET"});}

  function emit(reason){
    try{window.dispatchEvent(new CustomEvent(EVENT,{detail:{...snapshot(),reason}}));}catch(_){}
  }

  async function json(url,{signal=null,timeoutMs=12000}={}){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    const forward=()=>{try{controller.abort();}catch(_){}};
    if(signal){
      if(signal.aborted)forward();
      else signal.addEventListener("abort",forward,{once:true});
    }
    try{
      const r=await fetch(url,{cache:"no-store",signal:controller.signal,headers:{Accept:"application/json"}});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      return await r.json();
    }finally{
      clearTimeout(timer);
      try{signal?.removeEventListener?.("abort",forward);}catch(_){}
    }
  }

  async function probeContext(ctx,{signal=null}={}){
    if(ctx.provider==="okx"){
      const u=new URL(OKX+"/api/v5/market/ticker");
      u.searchParams.set("instId",ctx.providerSymbol);
      const j=await json(u,{signal});
      const row=Array.isArray(j?.data)?j.data[0]:null;
      const px=n(row?.last),ts=n(row?.ts);
      if(String(j?.code)!=="0"||!(px>0)||!(ts>0))throw new Error(`OKX ${ctx.providerSymbol} indisponible`);
      return frozen({provider:"okx",lastPrice:px,timestamp:new Date(ts).toISOString(),change24h:null,quoteCurrency:ctx.quote});
    }
    const u=new URL(BITGET+"/api/v3/market/tickers");
    u.searchParams.set("category","SPOT");u.searchParams.set("symbol",ctx.providerSymbol);
    const j=await json(u,{signal});
    const row=Array.isArray(j?.data)?j.data[0]:null;
    const px=n(row?.lastPrice),ts=n(row?.ts),chg=n(row?.price24hPcnt);
    if(String(j?.code)!=="00000"||!(px>0)||!(ts>0))throw new Error(`Bitget ${ctx.providerSymbol} indisponible`);
    return frozen({provider:"bitget",lastPrice:px,timestamp:new Date(ts).toISOString(),change24h:Number.isFinite(chg)?chg*100:null,quoteCurrency:ctx.quote});
  }

  async function load(input={},options={}){
    const ctx=normalizeContext(input);
    if(!ctx)throw new Error("Contexte New Listing invalide");
    // Only the latest operator intent may publish an exchange context.
    const revision=++state.loadRevision;
    try{state.loadController?.abort();}catch(_){}
    const controller=new AbortController();
    state.loadController=controller;
    const forward=()=>controller.abort();
    const signal=options.signal;
    if(signal?.aborted)forward();
    else signal?.addEventListener("abort",forward,{once:true});
    let marketTicker;
    try{
      marketTicker=await probeContext(ctx,{signal:controller.signal});
      if(controller.signal.aborted||revision!==state.loadRevision)return null;
    }catch(error){
      if(controller.signal.aborted||revision!==state.loadRevision)return null;
      throw error;
    }finally{
      signal?.removeEventListener("abort",forward);
      if(revision===state.loadRevision)state.loadController=null;
    }
    state.active=frozen({...ctx,marketTicker,nativeMarket:options?.nativeMarket===true});
    state.lastError=null;
    renderActiveRibbon();
    emit("operator-load");
    try{globalThis.AgentCryptoMarketMicroscope?.setMode?.("native");}catch(_){}
    try{
      const depth=globalThis.AgentCryptoOkxMicrostructure?.snapshot?.();
      if(depth?.open)void globalThis.AgentCryptoOkxMicrostructure?.refresh?.({asset:ctx.base,quote:ctx.quote});
    }catch(_){}
    // Selecting a public instrument changes the chart, not the operator's
    // viewport. An explicit navigation button remains responsible for scrolling.
    return snapshot();
  }

  function deactivate(){
    ++state.loadRevision;
    try{state.loadController?.abort();}catch(_){}
    state.loadController=null;
    const previous=state.active;
    state.active=null;state.lastError=null;
    renderActiveRibbon();
    emit("operator-return-market");
    try{globalThis.AgentCryptoMarketMicroscope?.setMode?.("native");}catch(_){}
    try{
      const depth=globalThis.AgentCryptoOkxMicrostructure?.snapshot?.();
      if(depth?.open)void globalThis.AgentCryptoOkxMicrostructure?.refresh?.();
    }catch(_){}
    return previous?true:false;
  }

  const BAR_BITGET=Object.freeze({"1m":"1m","5m":"5m","15m":"15m","1h":"1H","4h":"4H","1j":"1D"});
  const BAR_OKX=Object.freeze({"1m":"1m","5m":"5m","15m":"15m","1h":"1H","4h":"4H","1j":"1D"});

  function normalizeCandles(rows){
    return (Array.isArray(rows)?rows:[]).map(r=>({
      t:n(r?.[0]),o:n(r?.[1]),h:n(r?.[2]),l:n(r?.[3]),c:n(r?.[4]),v:n(r?.[5])
    })).filter(r=>[r.t,r.o,r.h,r.l,r.c].every(Number.isFinite)).sort((a,b)=>a.t-b.t);
  }

  // Every asynchronous public book/candle response must still belong to the
  // exact active request. A prior CT/USDT response cannot be reused after BTC,
  // Q, or a new CT request takes ownership of the display.
  function requireCurrentMarket(revision,ctx){
    if(revision!==state.loadRevision||!state.active||
       state.active.id!==ctx.id||state.active.provider!==ctx.provider||
       state.active.providerSymbol!==ctx.providerSymbol)
      throw new Error("Contexte externe modifié pendant le chargement · données anciennes refusées");
  }

  async function fetchCandles({bar="15m",limit=300,signal=null}={}){
    const ctx=snapshot(),revision=state.loadRevision;
    if(!ctx.active)throw new Error("Aucun New Listing actif");
    const lim=Math.max(20,Math.min(1000,Number(limit)||300));
    if(ctx.provider==="okx"){
      const u=new URL(OKX+"/api/v5/market/candles");
      u.searchParams.set("instId",ctx.providerSymbol);
      u.searchParams.set("bar",BAR_OKX[bar]||"15m");
      u.searchParams.set("limit",String(Math.min(300,lim)));
      const j=await json(u,{signal});
      requireCurrentMarket(revision,ctx);
      if(String(j?.code)!=="0")throw new Error(j?.msg||"OKX candles error");
      const rows=normalizeCandles(j?.data);
      if(!rows.length)throw new Error(`Aucune bougie OKX ${ctx.providerSymbol}`);
      return frozen({provider:"okx",providerLabel:"OKX",instrument:ctx.instrument,pair:ctx.pair,quote:ctx.quote,rows});
    }
    const u=new URL(BITGET+"/api/v3/market/candles");
    u.searchParams.set("category","SPOT");
    u.searchParams.set("symbol",ctx.providerSymbol);
    u.searchParams.set("interval",BAR_BITGET[bar]||"15m");
    u.searchParams.set("limit",String(lim));
    const j=await json(u,{signal});
      requireCurrentMarket(revision,ctx);
    if(String(j?.code)!=="00000")throw new Error(j?.msg||"Bitget candles error");
    const rows=normalizeCandles(j?.data);
    if(!rows.length)throw new Error(`Aucune bougie Bitget ${ctx.providerSymbol}`);
    return frozen({provider:"bitget",providerLabel:"Bitget",instrument:ctx.instrument,pair:ctx.pair,quote:ctx.quote,rows});
  }

  async function fetchOrderBook({limit=100,signal=null}={}){
    const ctx=snapshot(),revision=state.loadRevision;
    if(!ctx.active)throw new Error("Aucun New Listing actif");
    const lim=Math.max(5,Math.min(1000,Number(limit)||100));
    if(ctx.provider==="okx"){
      const u=new URL(OKX+"/api/v5/market/books");
      u.searchParams.set("instId",ctx.providerSymbol);u.searchParams.set("sz",String(Math.min(400,lim)));
      const j=await json(u,{signal});
      requireCurrentMarket(revision,ctx);
      const row=Array.isArray(j?.data)?j.data[0]:null;
      const ts=n(row?.ts);
      if(String(j?.code)!=="0"||!(ts>0))throw new Error(j?.msg||"OKX orderbook error");
      return frozen({read_only:true,provider:"okx",status:"ok",asset:ctx.base,pair:ctx.instrument,observed_at_utc:new Date(ts).toISOString(),bids:row?.bids||[],asks:row?.asks||[],backend_version:"okx-public-via-8790",external_asset:true});
    }
    const u=new URL(BITGET+"/api/v3/market/orderbook");
    u.searchParams.set("category","SPOT");u.searchParams.set("symbol",ctx.providerSymbol);u.searchParams.set("limit",String(lim));
    const j=await json(u,{signal});
      requireCurrentMarket(revision,ctx);
    const row=j?.data||{},ts=n(row?.ts);
    if(String(j?.code)!=="00000"||!(ts>0))throw new Error(j?.msg||"Bitget orderbook error");
    return frozen({read_only:true,provider:"bitget",status:"ok",asset:ctx.base,pair:ctx.instrument,observed_at_utc:new Date(ts).toISOString(),bids:row?.b||[],asks:row?.a||[],backend_version:"bitget-public-v3",external_asset:true});
  }

  async function discoverBitget({days=30,signal=null}={}){
    if(state.discovering)return state.discovered.slice();
    state.discovering=true;state.lastError=null;
    try{
      const u=new URL(BITGET+"/api/v3/market/instruments");u.searchParams.set("category","SPOT");
      const j=await json(u,{signal,timeoutMs:15000});
      if(String(j?.code)!=="00000"||!Array.isArray(j?.data))throw new Error(j?.msg||"Bitget instruments error");
      const horizon=Math.max(1,Math.min(30,Number(days)||30))*86400000,now=Date.now();
      const rows=j.data.map(row=>{
        const launch=n(row?.launchTime),base=upper(row?.baseCoin),quote=upper(row?.quoteCoin),symbol=upper(row?.symbol);
        if(!(launch>0)||!base||!quote||!symbol)return null;
        const age=now-launch;
        if(age<0||age>horizon)return null;
        if(String(row?.status||"").toLowerCase()!=="online")return null;
        if(String(row?.symbolType||"crypto").toLowerCase()!=="crypto")return null;
        if(String(row?.isRwa||"NO").toUpperCase()==="YES")return null;
        return frozen({
          id:`bitget:${symbol.toLowerCase()}`,
          name:base,
          symbol:base,
          base,quote,
          provider:"bitget",
          providerLabel:"Bitget",
          providerSymbol:symbol,
          pair:`${base}/${quote}`,
          instrument:`${base}-${quote}`,
          listedAt:new Date(launch).toISOString(),
          launchTime:launch,
          ageDays:age/86400000,
          status:"DISCOVERED_LIVE",
          identityScope:"EXCHANGE_INSTRUMENT"
        });
      }).filter(Boolean).sort((a,b)=>b.launchTime-a.launchTime);
      state.discovered=rows;state.lastDiscoveryAt=new Date().toISOString();
      renderDiscovery();
      return rows.slice();
    }catch(error){
      state.lastError=String(error?.message||error);renderDiscovery();throw error;
    }finally{state.discovering=false;}
  }

  function ensureStyle(){
    if(document.getElementById(DISCOVERY_ID+"Style"))return;
    const s=document.createElement("style");s.id=DISCOVERY_ID+"Style";s.textContent=`
#${DISCOVERY_ID}{margin:9px 0;padding:10px;border:1px solid rgba(113,231,255,.24);border-radius:11px;background:rgba(2,15,24,.52)}
#${DISCOVERY_ID} .nlp-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
#${DISCOVERY_ID} .nlp-head b{color:#a7f3ff;font:950 11px/1.1 system-ui}#${DISCOVERY_ID} .nlp-head small{display:block;margin-top:3px;color:#7999a7;font:800 8px/1.3 system-ui}
#${DISCOVERY_ID} .nlp-actions{display:flex;gap:5px;flex-wrap:wrap}#${DISCOVERY_ID} button{cursor:pointer}
#${DISCOVERY_ID} .nlp-truth{margin:7px 0;padding:6px 8px;border-radius:8px;background:rgba(255,205,103,.06);border:1px solid rgba(255,205,103,.13);color:#cdbd8b;font:800 8px/1.35 system-ui}
#${DISCOVERY_ID} .nlp-known,#${DISCOVERY_ID} .nlp-list{display:grid;gap:6px}
#${DISCOVERY_ID} .nlp-row{display:grid;grid-template-columns:minmax(150px,.8fr) minmax(140px,.8fr) minmax(160px,1fr) auto;gap:7px;align-items:center;padding:7px 8px;border:1px solid rgba(255,255,255,.07);border-radius:9px;background:rgba(0,0,0,.14)}
#${DISCOVERY_ID} .nlp-row b{color:#eefaff;font:950 10px/1.2 system-ui}#${DISCOVERY_ID} .nlp-row small{color:#7f9ba9;font:800 8px/1.25 system-ui}#${DISCOVERY_ID} .nlp-row code{color:#8eeaf4;font:900 9px/1 ui-monospace,monospace}
#${DISCOVERY_ID} .nlp-search{display:flex;gap:5px;margin:7px 0}#${DISCOVERY_ID} input{flex:1;min-width:0;padding:7px 9px;border:1px solid rgba(110,230,246,.20);border-radius:8px;background:#06141e;color:#e7f7fb}
#${ACTIVE_ID}{display:flex;align-items:center;gap:6px;padding:4px 7px;border-radius:999px;border:1px solid rgba(255,196,80,.28);background:rgba(77,46,3,.20);font:900 8px/1 system-ui;color:#ffe0a0}
#${ACTIVE_ID}[hidden]{display:none!important}#${ACTIVE_ID} button{padding:3px 6px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:#dceef5;font:900 7px/1 system-ui;cursor:pointer}
@media(max-width:900px){#${DISCOVERY_ID} .nlp-row{grid-template-columns:1fr 1fr}#${DISCOVERY_ID} .nlp-row .nlp-load{grid-column:1 / -1}}`;
    document.head.appendChild(s);
  }

  function knownConcreteHtml(){
    return `<div class="nlp-row" data-live-known="concrete"><div><b>Concrete · CT</b><small>listing 30/09/2026 · cas terrain</small></div><code>CT/USDT</code><small>OKX ou Bitget · pipeline complet</small><div class="nlp-load"><button type="button" class="btn small primary" data-live-load data-provider="okx" data-name="Concrete" data-base="CT" data-quote="USDT" data-symbol="CT-USDT" data-listed="2026-09-30T10:00:00Z">Charger OKX</button> <button type="button" class="btn small" data-live-load data-provider="bitget" data-name="Concrete" data-base="CT" data-quote="USDT" data-symbol="CTUSDT" data-listed="2026-09-30T10:00:00Z">Charger Bitget</button></div></div>`;
  }

  function bindLoadButtons(root){
    root.querySelectorAll("[data-live-load]").forEach(btn=>{
      if(btn.dataset.bound529==="1")return;btn.dataset.bound529="1";
      btn.addEventListener("click",async()=>{
        btn.disabled=true;const old=btn.textContent;btn.textContent="Chargement…";
        try{
          await load({provider:btn.dataset.provider,name:btn.dataset.name,base:btn.dataset.base,quote:btn.dataset.quote,providerSymbol:btn.dataset.symbol,listedAt:btn.dataset.listed});
          btn.textContent="Chargé";
        }catch(error){
          state.lastError=String(error?.message||error);btn.textContent="Échec";renderDiscovery();
        }finally{btn.disabled=false;setTimeout(()=>{btn.textContent=old;},1200);}
      });
    });
  }

  function renderDiscovery(){
    const root=document.getElementById(DISCOVERY_ID);if(!root)return;
    const list=root.querySelector("[data-live-list]"),status=root.querySelector("[data-live-status]");
    const q=String(root.querySelector("[data-live-search]")?.value||"").trim().toUpperCase();
    const rows=state.discovered.filter(x=>!q||[`${x.base}`,x.pair,x.providerSymbol].join(" ").includes(q)).slice(0,80);
    if(status)status.textContent=state.lastError?`ERREUR · ${state.lastError}`:state.lastDiscoveryAt?`${state.discovered.length} instrument(s) ≤30 j · actualisé ${new Date(state.lastDiscoveryAt).toLocaleTimeString("fr-FR")}`:"En attente d’une actualisation opérateur.";
    if(list)list.innerHTML=rows.length?rows.map(x=>`<div class="nlp-row"><div><b>${esc(x.base)}</b><small>${(x.ageDays).toFixed(1)} j · Bitget</small></div><code>${esc(x.pair)}</code><small>instrument exchange · launchTime vérifié</small><div class="nlp-load"><button type="button" class="btn small primary" data-live-load data-provider="bitget" data-name="${esc(x.name)}" data-base="${esc(x.base)}" data-quote="${esc(x.quote)}" data-symbol="${esc(x.providerSymbol)}" data-listed="${esc(x.listedAt)}">Charger</button></div></div>`).join(""):'<div class="nlp-truth">Aucun résultat live chargé dans ce filtre.</div>';
    bindLoadButtons(root);
  }

  function ensureRadarPanel(){
    const radar=document.getElementById("atlasNewListingsRadar406528");if(!radar)return false;
    ensureStyle();
    let root=document.getElementById(DISCOVERY_ID);
    if(!root){
      root=document.createElement("section");root.id=DISCOVERY_ID;root.setAttribute("aria-label","New Listings Live Asset Pipeline");
      root.innerHTML=`<div class="nlp-head"><div><b>LIVE ASSET PIPELINE · 40.6.529</b><small>Découvrir → charger → Graphique / Bougies / Profondeur · hors Top 1000</small></div><div class="nlp-actions"><button type="button" class="btn small primary" data-live-discover>Actualiser listings ≤30 j</button></div></div><div class="nlp-truth">Concrete : pipeline complet disponible via CT/USDT (OKX ou Bitget). CT/USDC MEXC reste une paire vérifiée du Radar, mais V1 privilégie les sources qui fournissent aussi un timestamp de carnet exploitable.</div><div class="nlp-known">${knownConcreteHtml()}</div><div class="nlp-search"><input type="search" data-live-search placeholder="Filtrer les listings live : ticker ou paire"><button type="button" class="btn small" data-live-filter>Filtrer</button></div><small data-live-status>En attente d’une actualisation opérateur.</small><div class="nlp-list" data-live-list></div>`;
      const anchor=radar.querySelector(".anl-rule");
      if(anchor?.nextSibling)radar.insertBefore(root,anchor.nextSibling);else radar.appendChild(root);
      root.querySelector("[data-live-discover]")?.addEventListener("click",async e=>{const b=e.currentTarget;b.disabled=true;const old=b.textContent;b.textContent="Actualisation…";try{await discoverBitget({days:30});}catch(_){}finally{b.disabled=false;b.textContent=old;}});
      root.querySelector("[data-live-filter]")?.addEventListener("click",renderDiscovery);
      root.querySelector("[data-live-search]")?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();renderDiscovery();}});
      bindLoadButtons(root);
    }
    renderDiscovery();return true;
  }

  function nativeCategoryOwnsUx(){
    try{return globalThis.AgentCryptoNewListingsNativeCategory?.native_only===true;}catch(_){return false;}
  }

  function renderActiveRibbon(){
    if(typeof document==="undefined")return;
    if(nativeCategoryOwnsUx()){
      const existing=document.getElementById(ACTIVE_ID);
      if(existing){existing.hidden=true;existing.replaceChildren();}
      return;
    }
    ensureStyle();
    const host=document.querySelector("#analyste .chart-v2-control-deck")||document.querySelector("#analyste .chart-v2-toolbar-reading");
    if(!host)return;
    let root=document.getElementById(ACTIVE_ID);
    if(!root){root=document.createElement("span");root.id=ACTIVE_ID;root.hidden=true;host.appendChild(root);}
    const ctx=snapshot();
    if(!ctx.active){root.hidden=true;root.replaceChildren();return;}
    root.hidden=false;root.innerHTML=`<span>NEW · ${esc(ctx.name)} · ${esc(ctx.pair)} · ${esc(ctx.providerLabel)}</span><button type="button" data-live-return>Retour Market</button>`;
    root.querySelector("[data-live-return]")?.addEventListener("click",deactivate,{once:true});
  }

  function bind(){
    ensureStyle();
    const radarButton=document.getElementById("atlasNewListingsButton406528");
    if(radarButton&&radarButton.dataset.live529!=="1"&&!nativeCategoryOwnsUx()){
      radarButton.dataset.live529="1";
      radarButton.addEventListener("click",()=>{ensureRadarPanel();});
    }
    const legacy=document.getElementById(DISCOVERY_ID);
    if(nativeCategoryOwnsUx()&&legacy)legacy.hidden=true;
    renderActiveRibbon();
  }

  function selfTest(){
    const okx=normalizeContext({provider:"okx",name:"Concrete",base:"CT",quote:"USDT",providerSymbol:"CT-USDT",listedAt:"2026-09-30T10:00:00Z"});
    const bitget=normalizeContext({provider:"bitget",name:"Concrete",base:"CT",quote:"USDT",providerSymbol:"CTUSDT",listedAt:"2026-09-30T10:00:00Z"});
    const bad=normalizeContext({provider:"bitget",base:"CT",quote:"USDT",providerSymbol:"BTCUSDT"});
    const bars=normalizeCandles([["2","1","3","0.5","2","10"],["1","1","2","0.8","1.5","8"]]);
    const pass=!!okx&&!!bitget&&!bad&&bars.length===2&&bars[0].t===1;
    return frozen({build:BUILD,pass,checks:frozen({okx_context:!!okx,bitget_context:!!bitget,wrong_symbol_rejected:!bad,candle_normalization:bars.length===2&&bars[0].t===1,discovery_operator_only:true,no_top1000_injection:true,no_storage:true,no_recurring_timer:true,no_observer:true,no_order:true,no_wallet:true})});
  }

  globalThis.AgentCryptoNewListingLiveAsset=frozen({
    build:BUILD,snapshot,load,deactivate,probeContext,fetchCandles,fetchOrderBook,discoverBitget,ensureRadarPanel,renderActiveRibbon,self_test:selfTest,
    event:EVENT,providers:frozen(["okx","bitget"]),read_only:true,top1000_injection:false,ranking_mutation:false,storage_write:false,recurring_timer:false,mutation_observer:false,real_order:false,wallet:false,strategy_changed:false,market_core_changed:false
  });

  if(typeof document!=="undefined"){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
    window.addEventListener("pageshow",bind,{passive:true});
  }
})();
