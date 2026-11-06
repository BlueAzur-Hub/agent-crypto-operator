/* ERITH.IA — V6 instant OKX order-book PAPER execution estimate.
 * Uses the already validated public book snapshot. No new request, order, key or Bridge write.
 * This is a present-time liquidity estimate, NEVER a historical backtest.
 */
(function orderBookPaperV6(){
  "use strict";
  if(globalThis.ErithMarketBookPaperV6)return;
  const ID="erithBookPaperV6",FRESH_MS=15000,FUTURE_MS=5000;
  const fail=(code,message)=>Object.freeze({ok:false,code,message,read_only:true,orders:0});
  const finite=v=>typeof v==="number"&&Number.isFinite(v);
  function validRows(rows,ascending){
    if(!Array.isArray(rows)||rows.length===0||rows.length>400)return false;
    let previous=null;
    for(const level of rows){
      if(!Array.isArray(level)||level.length<2)return false;
      const p=Number(level[0]),q=Number(level[1]);
      if(!finite(p)||!finite(q)||p<=0||q<=0)return false;
      if(previous!==null&&(ascending?p<=previous:p>=previous))return false;
      previous=p;
    }
    return true;
  }
  function simulate(book,chart,settings,nowMs=Date.now()){
    const side=settings?.side,quoteBudget=Number(settings?.quoteBudget),feePercent=Number(settings?.feePercent);
    if(!["BUY","SELL"].includes(side)||!finite(quoteBudget)||quoteBudget<10||quoteBudget>1000000
       ||!finite(feePercent)||feePercent<0||feePercent>2)return fail("SETTINGS_INVALID","Montant fictif de 10 à 1 000 000 et frais Taker de 0 à 2 %.");
    if(!finite(nowMs)||nowMs<=0)return fail("CLOCK_INVALID","Horloge invalide.");
    const instrument=String(chart?.loadedInstrument||"").toUpperCase();
    const match=/^([A-Z0-9]+)-([A-Z0-9]+)$/.exec(instrument);
    if(chart?.loading||chart?.error||chart?.archivePeriod||!match||!/^OKX\b/i.test(String(chart?.source||"")))
      return fail("CHART_UNAVAILABLE","Graphique OKX actif requis pour identifier l'instrument.");
    if(!book||book.loading||book.error||book.external||String(book.provider||"").toLowerCase()!=="okx"
       ||book.freshness!=="FRESH"||String(book.loadedAsset||"").toUpperCase()!==match[1]
       ||String(book.loadedQuote||"").toUpperCase()!==match[2]
       ||String(book.pair||"").toUpperCase().replace("/","-")!==instrument)
      return fail("BOOK_CONTEXT","Carnet OKX absent, non frais ou sur une autre paire ; aucune estimation.");
    const observedAt=Date.parse(book.sourceObservedAt||"");
    const age=nowMs-observedAt;
    if(!finite(observedAt)||age>FRESH_MS||age < -FUTURE_MS)
      return fail("BOOK_STALE","Horodatage source du carnet absent, périmé ou futur ; estimation refusée.");
    if(!validRows(book.asks,true)||!validRows(book.bids,false))
      return fail("BOOK_LEVELS","Niveaux de carnet vides, malformés ou mal triés.");
    const bestBid=Number(book.bids[0][0]),bestAsk=Number(book.asks[0][0]);
    if(bestBid>=bestAsk)return fail("BOOK_CROSSED","Carnet incohérent ou croisé.");
    const mid=(bestBid+bestAsk)/2,feeRate=feePercent/100;
    // BUY: quoteBudget is total available quote, including the modeled taker fee.
    // SELL: quoteBudget is an indicative gross reference at mid, converted to base quantity.
    const buy=side==="BUY",levels=buy?book.asks:book.bids;
    let remaining=buy?quoteBudget/(1+feeRate):quoteBudget/mid;
    let baseQuantity=0,grossQuote=0,levelsUsed=0;
    const starting=remaining;
    for(const [priceRaw,quantityRaw] of levels){
      if(remaining<=1e-10)break;
      const price=Number(priceRaw),quantity=Number(quantityRaw);
      const takeBase=buy?Math.min(quantity,remaining/price):Math.min(quantity,remaining);
      if(takeBase<=0)continue;
      baseQuantity+=takeBase;grossQuote+=price*takeBase;
      remaining-=buy?price*takeBase:takeBase;
      levelsUsed++;
    }
    const tolerance=Math.max(1e-9,starting*1e-9);
    if(remaining>tolerance)return fail("INSUFFICIENT_LIQUIDITY","Profondeur visible insuffisante : simulation refusée, pas de remplissage partiel.");
    if(!(baseQuantity>0)||!(grossQuote>0))return fail("FILL_INVALID","Remplissage fictif impossible.");
    const vwap=grossQuote/baseQuantity,feeQuote=grossQuote*feeRate;
    const totalQuote=buy?grossQuote+feeQuote:grossQuote-feeQuote;
    const impactBestBps=(buy?(vwap-bestAsk)/bestAsk:(bestBid-vwap)/bestBid)*10000;
    const deviationMidBps=(buy?(vwap-mid)/mid:(mid-vwap)/mid)*10000;
    return Object.freeze({
      ok:true,mode:"LIVE_BOOK_INSTANT_PAPER",read_only:true,orders:0,
      pair:instrument,quote:match[2],base:match[1],side,quoteBudget,feePercent,
      observedAt:book.sourceObservedAt,ageMs:Math.max(0,age),
      bestBid,bestAsk,mid,spread:bestAsk-bestBid,
      baseQuantity,grossQuote,feeQuote,totalQuote,vwap,levelsUsed,
      impactBestBps:Math.max(0,impactBestBps),deviationMidBps,
      method:"Same-time public OKX depth snapshot; volume-weighted visible-level sweep; hypothetical taker quote fee; no execution or historical inference"
    });
  }
  // Manual one-click bridge to the existing public-only OKX depth viewer.
  // This is an instant snapshot, never a historical execution or order.
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function waitForBook(book,now=Date.now,sleep=pause){
    const deadline=now()+13500; // Existing backend request has a 12s timeout.
    while(book.snapshot?.()?.loading){
      if(now()>=deadline)return false;
      await sleep(100);
    }
    return true;
  }
  function openDepthView(){
    if(typeof document==="undefined")return false;
    const tab=document.querySelector('#atlasOkxMicrostructure [data-oms-tab="depth"]');
    if(!tab)return false;
    if(!tab.classList.contains("is-active"))tab.click();
    return true;
  }
  // The native Lecture Technique rail is the only supported authority for
  // reopening a collapsed #detailPanel. Do not size Depth against a hidden panel.
  async function ensureTechnicalReading(){
    if(typeof document==="undefined")return false;
    const deck=document.getElementById("analyste");
    const panel=document.getElementById("detailPanel");
    if(!deck||!panel)return false;
    if(deck.classList.contains("detail-collapsed")){
      const rail=document.getElementById("detailPanelRail");
      if(!rail||typeof rail.click!=="function")return false;
      rail.click(); // native delegated action: also maintains existing UI/persistence.
    }
    // Two layout frames allow the native grid to expose the real dock rectangle.
    if(typeof globalThis.requestAnimationFrame==="function"){
      await new Promise(resolve=>globalThis.requestAnimationFrame(
        ()=>globalThis.requestAnimationFrame(resolve)));
    }
    if(deck.classList.contains("detail-collapsed"))return false;
    const rect=panel.getBoundingClientRect?.();
    return Boolean(rect&&rect.width>=140&&rect.height>=120);
  }
  async function openDepthAndEstimate(bookService,market,settings,options={}){
    const readChart=()=>market?.snapshot?.();
    const chart=readChart(),pair=String(chart?.loadedInstrument||"").toUpperCase();
    const matched=/^([A-Z0-9]+)-([A-Z0-9]+)$/.exec(pair);
    if(!matched||chart?.loading||chart?.error||chart?.archivePeriod
       ||!/^OKX\b/i.test(String(chart?.source||"")))
      return fail("CHART_UNAVAILABLE","Choisir d'abord une paire et des bougies OKX valides.");
    if(!["BUY","SELL"].includes(settings?.side)||!Number.isFinite(settings?.quoteBudget)
       ||settings.quoteBudget<10||settings.quoteBudget>1000000
       ||!Number.isFinite(settings?.feePercent)||settings.feePercent<0||settings.feePercent>2)
      return fail("SETTINGS_INVALID","Montant fictif de 10 à 1 000 000 et frais de 0 à 2 %.");
    if(!bookService?.setOpen||!bookService?.snapshot||!bookService?.refresh)
      return fail("BOOK_SERVICE_UNAVAILABLE","Service de profondeur OKX indisponible.");
    const now=options.now||Date.now,sleep=options.sleep||pause,showDepth=options.showDepth||openDepthView;
    const ensureReading=options.ensureReading||ensureTechnicalReading;
    try{
      if(await ensureReading()!==true)
        return fail("TECH_PANEL_UNAVAILABLE","Lecture technique non affichable : ouverture de Profondeur annulée.");
      // Restore any manually detached/maximized window to the native Lecture dock.
      // Required order: unmaximize first, since maximization restores detachment.
      if(bookService.snapshot()?.maximized)bookService.setMaximized?.(false);
      if(bookService.snapshot()?.detached)bookService.setDetached?.(false);
      bookService.setMinimized?.(false);
      if(bookService.setOpen(true)!==true)return fail("DEPTH_OPEN_FAILED","Impossible d'ouvrir Profondeur.");
      if(showDepth()!==true)return fail("DEPTH_TAB_UNAVAILABLE","Onglet Profondeur indisponible.");
      // setOpen starts the existing asynchronous fetch for an empty book.
      const wasLoading=Boolean(bookService.snapshot()?.loading);
      if(wasLoading&&!(await waitForBook(bookService,now,sleep)))
        return fail("BOOK_LOADING_TIMEOUT","Le carnet OKX ne s'est pas chargé dans le délai prévu.");
      let result=simulate(bookService.snapshot(),readChart(),settings,now());
      if(result.ok)return result;
      // Force an explicit update only if opening didn't already start a fetch.
      if(!wasLoading&&["BOOK_CONTEXT","BOOK_STALE"].includes(result.code)){
        await bookService.refresh({asset:matched[1],quote:matched[2]});
        if(!(await waitForBook(bookService,now,sleep)))
          return fail("BOOK_LOADING_TIMEOUT","La mise à jour du carnet a dépassé le délai prévu.");
        result=simulate(bookService.snapshot(),readChart(),settings,now());
      }
      return result;
    }catch(e){
      return fail("BOOK_OPEN_ERROR","Impossible de préparer le carnet OKX : "+String(e?.message||e));
    }
  }
  function el(tag,attrs={},text){
    const n=document.createElement(tag);
    for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));
    if(text!==undefined)n.textContent=text;
    return n;
  }
  function mount(){
    if(typeof document==="undefined")return false;
    const host=document.getElementById("erithStrategyOptionsPanel");
    if(!host)return false;
    if(document.getElementById(ID))return true;
    const sec=el("section",{id:ID,"aria-label":"V6 Instantané de profondeur PAPER",style:"border-top:1px solid #316b7f;margin-top:12px;padding-top:12px"});
    sec.append(el("strong",{},"V6 · Impact réel du carnet — PAPER instantané"));
    sec.append(el("p",{},"Simulation fictive sur la profondeur OKX ACTUELLE uniquement. Ne remplace pas les carnets historiques de la V5. Aucun ordre."));
    const controls=el("div",{style:"display:flex;gap:8px;flex-wrap:wrap;align-items:end"});
    const sideLabel=el("label",{},"Sens fictif");
    const side=el("select",{"data-v6":"side",style:"display:block;min-width:115px"});
    side.append(el("option",{value:"BUY"},"Acheter"),el("option",{value:"SELL"},"Vendre"));sideLabel.append(side);controls.append(sideLabel);
    for(const [key,label,value,min,max,step] of [
      ["quoteBudget","Montant fictif (cotation)",1000,10,1000000,10],
      ["feePercent","Frais Taker (%)",0.1,0,2,0.01]
    ]){
      const lb=el("label",{},label);
      lb.append(el("input",{type:"number","data-v6":key,value,min,max,step,style:"display:block;width:130px"}));controls.append(lb);
    }
    sec.append(controls);
    const button=el("button",{type:"button","data-v6-run":"true"},"Estimer sur le carnet FRESH");
    sec.append(button);
    const out=el("p",{id:"erithBookPaperV6Result",role:"status","aria-live":"polite"},"Un clic : ouverture de Lecture technique puis Profondeur, carnet OKX FRESH et estimation fictive. Aucun ordre.");
    sec.append(out);
    button.addEventListener("click",async()=>{
      if(button.disabled)return;
      const val=key=>sec.querySelector('[data-v6="'+key+'"]')?.value;
      button.disabled=true;
      out.textContent="Ouverture de Lecture technique → Profondeur → lecture du carnet OKX…";
      let result;
      try{
        result=await openDepthAndEstimate(
          globalThis.AgentCryptoOkxMicrostructure,
          globalThis.AgentCryptoMarketMicroscope,
          {side:val("side"),quoteBudget:Number(val("quoteBudget")),feePercent:Number(val("feePercent"))}
        );
      }finally{button.disabled=false;}
      if(!result.ok){out.textContent="Estimation refusée : "+result.message+" ["+result.code+"]";return;}
      const fmt=(n,d=4)=>n.toLocaleString("fr-FR",{maximumFractionDigits:d});
      out.textContent=result.pair+" · "+(result.side==="BUY"?"ACHAT":"VENTE")+" fictif · snapshot OKX "+result.observedAt+
        " · budget indicatif "+fmt(result.quoteBudget,2)+" "+result.quote+
        " · prix moyen "+fmt(result.vwap,6)+" "+result.quote+"/"+result.base+
        " · "+fmt(result.baseQuantity,8)+" "+result.base+" sur "+result.levelsUsed+" niveau(x)"+
        " · coût carnet vs meilleur prix "+fmt(result.impactBestBps,4)+" bp"+
        " · écart au mid "+fmt(result.deviationMidBps,4)+" bp"+
        " · frais Taker fictifs "+fmt(result.feeQuote,5)+" "+result.quote+
        " · "+(result.side==="BUY"?"dépense totale ":"produit net ")+fmt(result.totalQuote,4)+" "+result.quote+
        ". Indication instantanée non prédictive ; aucune exécution réelle.";
    });
    const anchor=host.querySelector("#erithStrategyName")?.closest(".erith-row")?.previousElementSibling;
    if(anchor)host.insertBefore(sec,anchor);else host.append(sec);
    return true;
  }
  const api=Object.freeze({version:"2026-11-06-v6-technical-reading-dock",simulate,ensureTechnicalReading,openDepthAndEstimate,mount,read_only:true,
    orders:0,real_order:false,api_credentials:false,uses_historical_book:false});
  globalThis.ErithMarketBookPaperV6=api;
  if(typeof document!=="undefined"){
    const boot=()=>mount();
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
    globalThis.addEventListener?.("pageshow",boot,{passive:true});
    globalThis.addEventListener?.("atlas:v2mode",()=>queueMicrotask(boot),{passive:true});
  }
})();
