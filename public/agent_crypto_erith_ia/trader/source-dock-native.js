(() => {
  "use strict";

  const BUILD="40.6.596";
  const CACHE_KEY="agent_crypto_erith_ia_trader_source_dock_v1";
  const CACHE_TTL_MS=6*60*60*1000;
  const STALE_MAX_MS=7*24*60*60*1000;
  const MIN_ATTEMPT_GAP_MS=15000;
  const RETRY_STEPS_MS=Object.freeze([60000,300000,900000]);

  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const state={records:{},activeCoinId:null,status:"idle",token:0,controller:null,lastAttemptAt:{},failures:{},nextRetryAt:{},lastError:null,cacheLoaded:false,retryTimer:null};

  function selected(){return globalThis.AgentCryptoTraderMarket?.selected?.()||globalThis.getSelectedCoin?.()||null;}
  function safeUrl(value){
    const raw=String(value||"").trim(); if(!raw)return null;
    try{const u=new URL(raw,window.location.href);return ["http:","https:"].includes(u.protocol)?u.href:null;}catch{return null;}
  }
  function uniqueUrls(values=[]){
    const out=[],seen=new Set();
    for(const v of values.flat(Infinity)){const u=safeUrl(v);if(!u||seen.has(u))continue;seen.add(u);out.push(u);}
    return out;
  }
  function urlKey(value){
    const u=safeUrl(value);if(!u)return null;
    try{const x=new URL(u),p=x.pathname.replace(/\/+$/,"")||"/";return x.protocol+"//"+x.hostname.toLowerCase()+p+x.search;}catch{return null;}
  }
  function distinct(record){
    const used=new Set(),take=value=>{const u=safeUrl(value),k=urlKey(u);if(!u||!k||used.has(k))return null;used.add(k);return u;};
    return {homepage:take(record?.homepage),explorer:take(record?.explorer),whitepaper:take(record?.whitepaper),repository:take(record?.repository),community:take(record?.community)};
  }
  function age(record){const t=Date.parse(record?.fetchedAt||0);return Number.isFinite(t)?Math.max(0,Date.now()-t):Infinity;}
  function ageLabel(record){
    const a=age(record); if(!Number.isFinite(a))return "—";
    if(a<60000)return "à l’instant"; if(a<3600000)return Math.max(1,Math.round(a/60000))+" min";
    if(a<86400000)return Math.max(1,Math.round(a/3600000))+" h"; return Math.max(1,Math.round(a/86400000))+" j";
  }
  function retryDelay(count){return RETRY_STEPS_MS[Math.min(RETRY_STEPS_MS.length-1,Math.max(0,Number(count||1)-1))];}
  function retryRemaining(id){return Math.max(0,Number(state.nextRetryAt[id]||0)-Date.now());}
  function retryLabel(ms){const v=Math.max(0,Number(ms)||0);return v<1000?"maintenant":v<60000?Math.ceil(v/1000)+" s":Math.ceil(v/60000)+" min";}
  function errorLabel(error){
    const t=String(error?.message||error||"").toLowerCase();
    if(!t)return "Métadonnées indisponibles"; if(t.includes("429"))return "Quota CoinGecko atteint";
    if(t.includes("403"))return "Accès CoinGecko refusé"; if(/500|502|503|504/.test(t))return "CoinGecko temporairement indisponible";
    if(t.includes("timeout")||t.includes("timed out")||t.includes("abort"))return "Délai dépassé";
    if(t.includes("failed to fetch")||t.includes("network"))return "Réseau indisponible"; return "Métadonnées indisponibles";
  }
  function loadCache(){
    if(state.cacheLoaded)return;state.cacheLoaded=true;
    try{
      const parsed=JSON.parse(localStorage.getItem(CACHE_KEY)||"{}"),now=Date.now();
      Object.entries(parsed?.records||{}).forEach(([id,r])=>{const t=Date.parse(r?.fetchedAt||0);if(id&&Number.isFinite(t)&&now-t<=STALE_MAX_MS)state.records[id]=r;});
    }catch{}
  }
  function saveCache(){
    try{
      const rows=Object.values(state.records).filter(r=>r?.coinId&&r?.fetchedAt).sort((a,b)=>Date.parse(b.fetchedAt)-Date.parse(a.fetchedAt)).slice(0,60);
      localStorage.setItem(CACHE_KEY,JSON.stringify({schema:"agent_crypto_trader_source_dock_v1",build:BUILD,savedAt:new Date().toISOString(),records:Object.fromEntries(rows.map(r=>[r.coinId,r]))}));
    }catch{}
  }
  function normalize(payload,coin){
    const links=payload?.links||{};
    return {
      coinId:String(payload?.id||coin?.id||""),webSlug:String(payload?.web_slug||payload?.id||coin?.id||""),
      name:String(payload?.name||coin?.name||""),symbol:String(payload?.symbol||coin?.symbol||"").toUpperCase(),
      homepage:uniqueUrls(links.homepage||[])[0]||null,
      explorer:uniqueUrls(links.blockchain_site||[])[0]||null,
      whitepaper:uniqueUrls([links.whitepaper,links.whitepaper_link])[0]||null,
      repository:uniqueUrls([...(links?.repos_url?.github||[]),...(links?.repos_url?.bitbucket||[])])[0]||null,
      community:uniqueUrls([...(links.official_forum_url||[]),...(links.announcement_url||[]),...(links.chat_url||[]),links.subreddit_url])[0]||null,
      fetchedAt:new Date().toISOString(),source:"CoinGecko /coins/{id}"
    };
  }
  function coinGeckoUrl(coin,record){const slug=String(record?.webSlug||coin?.id||"").trim();return slug?safeUrl("https://www.coingecko.com/en/coins/"+encodeURIComponent(slug)):null;}
  function newsUrl(coin){if(!coin)return null;const q=((coin.name||"")+" "+(coin.symbol||"")+" crypto").trim();return safeUrl("https://news.google.com/search?q="+encodeURIComponent(q)+"&hl=fr&gl=FR&ceid=FR%3Afr");}
  function portal(kind,label,url,note="",unavailable="Indisponible"){
    const u=safeUrl(url);
    if(!u)return '<span class="source-portal is-disabled" data-portal-kind="'+esc(kind)+'"><b>'+esc(label)+'</b><small>'+esc(unavailable)+'</small></span>';
    let host="";try{host=new URL(u).hostname.replace(/^www\./,"");}catch{}
    return '<a class="source-portal" data-portal-kind="'+esc(kind)+'" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer nofollow"><b>'+esc(label)+'</b><small>'+esc(note||host)+'</small></a>';
  }
  function sentinelPortal(){
    return '<span class="source-portal is-disabled trader-source-sentinel-disabled" data-portal-kind="sentinel"><b>News Sentinel</b><small>hors Trader</small></span>';
  }
  function set(id,value){const n=$(id);if(n)n.textContent=value;}
  function render(coin,record=null,mode="idle",error=""){
    const dock=$("source-dock"),host=$("sourceDockPortals");if(!dock||!host)return false;
    if(!coin){
      set("sourceDockAsset","Aucun actif sélectionné");set("sourceDockCompactState","En attente");set("sourceDockStatus","En attente de sélection");
      set("sourceDockOrigin","CoinGecko · en attente");set("sourceDockUpdated","—");
      host.innerHTML=[portal("coingecko","CoinGecko",null),portal("homepage","Site officiel",null),portal("explorer","Explorateur",null),portal("whitepaper","Whitepaper",null),portal("repository","Code source",null),portal("community","Communauté",null),portal("news","Actualités",null),sentinelPortal()].join("");
      dock.dataset.status="idle";return true;
    }
    const d=distinct(record),cg=coinGeckoUrl(coin,record),news=newsUrl(coin);
    const urls=[cg,d.homepage,d.explorer,d.whitepaper,d.repository,d.community,news],count=urls.filter(Boolean).length;
    const remaining=retryRemaining(coin.id),label=errorLabel(error||state.lastError);
    const status=mode==="direct"?"Direct · "+count+"/7 portails"
      :mode==="cache"?(remaining>0?"Cache "+ageLabel(record)+" · "+label+" · nouvel essai "+retryLabel(remaining):"Cache local "+ageLabel(record)+" · "+count+"/7 portails")
      :mode==="loading"?"Lecture CoinGecko en cours"
      :mode==="stale"?"Cache "+ageLabel(record)+" visible · actualisation en cours"
      :mode==="external"?"Nouveau listing · métadonnées CoinGecko non garanties"
      :remaining>0?label+" · nouvel essai "+retryLabel(remaining):label+" · actualisation manuelle disponible";
    set("sourceDockAsset",(coin.name||coin.symbol||"Actif")+" · "+String(coin.symbol||"").toUpperCase());
    set("sourceDockCompactState",mode==="direct"?count+"/7 · direct":record?count+"/7 · cache":mode==="loading"||mode==="stale"?"Chargement":count+"/7 · limité");
    set("sourceDockStatus",status);
    set("sourceDockOrigin",mode==="direct"?"CoinGecko direct · métadonnées":record?"CoinGecko · cache navigateur":coin.externalNewListing?"Exchange externe · fiche limitée":"CoinGecko · fiche marché uniquement");
    set("sourceDockUpdated",record?.fetchedAt?new Date(record.fetchedAt).toLocaleString("fr-FR"):"En attente");
    host.innerHTML=[
      portal("coingecko","CoinGecko",cg,"fiche marché"),portal("homepage","Site officiel",d.homepage,"déclaré"),
      portal("explorer","Explorateur",d.explorer,"blockchain"),portal("whitepaper","Whitepaper",d.whitepaper,"document"),
      portal("repository","Code source",d.repository,"dépôt"),portal("community","Communauté",d.community,"officiel / forum"),
      portal("news","Actualités",news,"recherche ciblée"),sentinelPortal()
    ].join("");
    dock.dataset.status=mode;dock.dataset.coinId=String(coin.id||"");dock.dataset.portalCount=String(count);
    return true;
  }
  function clearRetry(){if(state.retryTimer){clearTimeout(state.retryTimer);state.retryTimer=null;}}
  function scheduleRetry(coin){
    clearRetry();const ms=retryRemaining(coin?.id);if(!coin?.id||ms<=0)return;
    state.retryTimer=setTimeout(()=>{state.retryTimer=null;if(state.activeCoinId===coin.id&&!document.hidden)void load(coin,{retry:true});},Math.max(1000,ms));
  }
  async function fetchJson(url,signal,timeout=12000){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
    const relay=()=>controller.abort();signal?.addEventListener?.("abort",relay,{once:true});
    try{const r=await fetch(url,{signal:controller.signal,cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);return await r.json();}
    finally{clearTimeout(timer);signal?.removeEventListener?.("abort",relay);}
  }
  async function load(coin,options={}){
    if(!coin?.id)return false;loadCache();
    if(coin.externalNewListing){state.activeCoinId=coin.id;state.status="external";render(coin,null,"external");return false;}
    const id=String(coin.id),current=state.records[id]||null,a=age(current),now=Date.now(),remaining=retryRemaining(id),last=Number(state.lastAttemptAt[id]||0);
    state.activeCoinId=id;
    if(!options.force&&current&&a<CACHE_TTL_MS){state.status="cache";render(coin,current,"cache");return true;}
    if(!options.force&&remaining>0&&!options.retry){state.status=current?"cache":"cooldown";render(coin,current,current?"cache":"cooldown",state.lastError);scheduleRetry(coin);return false;}
    if(!options.force&&now-last<MIN_ATTEMPT_GAP_MS){render(coin,current,current?"cache":"cooldown",state.lastError);return false;}
    try{state.controller?.abort?.();}catch{} clearRetry();
    const controller=new AbortController(),token=++state.token;state.controller=controller;state.status="loading";state.lastAttemptAt[id]=now;state.lastError=null;
    render(coin,current,current?"stale":"loading");
    const endpoint="https://api.coingecko.com/api/v3/coins/"+encodeURIComponent(id)+"?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false";
    try{
      const payload=await fetchJson(endpoint,controller.signal,12000);
      if(token!==state.token)return false;if(!payload?.id||String(payload.id)!==id)throw new Error("Réponse CoinGecko incohérente");
      const record=normalize(payload,coin);state.records[id]=record;state.status="direct";state.lastError=null;delete state.failures[id];delete state.nextRetryAt[id];saveCache();
      if(state.activeCoinId===id)render(coin,record,"direct");return true;
    }catch(err){
      if(controller.signal.aborted||token!==state.token)return false;
      const failures=Number(state.failures[id]||0)+1;state.failures[id]=failures;state.nextRetryAt[id]=Date.now()+retryDelay(failures);state.lastError=errorLabel(err);state.status=current?"cache":"cooldown";
      if(state.activeCoinId===id){render(coin,current,current?"cache":"cooldown",state.lastError);scheduleRetry(coin);}return false;
    }finally{if(token===state.token)state.controller=null;}
  }
  function select(coin,options={}){
    if(!coin)return false;
    const id=String(coin.id||"");if(!id)return false;
    const changed=state.activeCoinId!==id;
    if(changed){clearRetry();try{state.controller?.abort?.();}catch{}state.controller=null;}
    void load(coin,options);return true;
  }
  function refresh(){const coin=selected();if(!coin)return false;delete state.nextRetryAt[coin.id];state.failures[coin.id]=0;return select(coin,{force:true});}
  function bind(){
    $("btnSourceDockRefresh")?.addEventListener("click",()=>void refresh());
    window.addEventListener("agent-crypto:trader-selection-changed",e=>{const coin=e?.detail?.coin||selected();if(coin)select(coin);},{passive:true});
    document.addEventListener("visibilitychange",()=>{if(document.hidden){clearRetry();return;}const coin=selected();if(coin&&state.activeCoinId===coin.id&&retryRemaining(coin.id)>0)scheduleRetry(coin);});
    setTimeout(()=>{const coin=selected();if(coin)select(coin);else render(null);},0);
  }

  globalThis.AgentCryptoTraderSourceDock=Object.freeze({
    build:BUILD,select,refresh,render,
    snapshot:()=>Object.freeze({build:BUILD,active_coin_id:state.activeCoinId,status:state.status,portal_count:Number($("source-dock")?.dataset.portalCount||0),cached_records:Object.keys(state.records).length,last_error:state.lastError}),
    administrator_contract:"Source Dock / Market Portals",news_sentinel_active:false,real_order:false
  });

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
})();