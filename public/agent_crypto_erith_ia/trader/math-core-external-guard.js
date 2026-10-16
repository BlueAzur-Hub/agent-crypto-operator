/* Trader-only Math Core venue identity guard.
   The Administrator's internal Math owner is bound to its canonical Market,
   while a Trader external asset (CT/Q) owns a separate chart. Never display
   the previous BTC score as if it described an external instrument. */
(() => {
  "use strict";
  const STYLE_ID="traderMathExternalStyle";
  const GUARD_ID="traderMathExternalGuard";
  const activeTrader=()=>document.documentElement?.dataset?.agentCryptoSurface==="trader";
  const math=()=>document.getElementById("math");
  const external=()=>{try{return globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()||null;}catch(_){return null;}};
  const microscope=()=>{try{return globalThis.AgentCryptoMarketMicroscope?.snapshot?.()||null;}catch(_){return null;}};
  const number=v=>v===null||v===undefined||v===""?null:(Number.isFinite(Number(v))?Number(v):null);
  const listing=()=>{try{return globalThis.AgentCryptoNewListingsNativeCategory?.mathSeriesSnapshot?.()||null;}catch(_){return null;}};
  function analyzeRows(rows,source,kind,instrument,bar,periodDays){
    if(!Array.isArray(rows)||rows.length<21)return null;
    const points=[];
    for(const entry of rows){
      const t=number(entry?.[0]),p=number(entry?.[1]);
      if(t===null||t<=0||p===null||p<=0||
        (points.length&&t<=points[points.length-1][0]))return null;
      points.push([t,p]);
    }
    const now=Date.now(),last=points[points.length-1][0];
    const maxAge=kind==="line"?(periodDays>=30?48*3600000:periodDays>=7?8*3600000:30*60000):bar==="1d"||bar==="1j"?48*3600000:bar==="4h"?12*3600000:bar==="1h"?3*3600000:30*60000;
    if(last>now+120000||now-last>maxAge)return null;
    const returns=[];
    for(let i=1;i<points.length;i++){
      const change=Math.log(points[i][1]/points[i-1][1]);
      if(!Number.isFinite(change))return null;
      returns.push(change);
    }
    const average=returns.reduce((a,b)=>a+b,0)/returns.length;
    const std=Math.sqrt(returns.reduce((sum,v)=>sum+(v-average)**2,0)/(returns.length-1));
    let peak=points[0][1],drawdown=0;
    for(const [,p] of points){peak=Math.max(peak,p);drawdown=Math.min(drawdown,p/peak-1);}
    return Object.freeze({points:points.length,volatility:std*Math.sqrt(returns.length)*100,
      drawdown:Math.abs(drawdown)*100,source,kind,instrument,
      lastAt:new Date(last).toISOString(),bar,periodDays});
  }
  function verifiedSeries(ctx){
    const pair=String(ctx.instrument||"").toUpperCase(),snap=microscope();
    // Prefer exact candles, when they have actually been loaded and published.
    if(snap?.external&&snap.mode==="candles"&&!snap.loading&&!snap.error&&
       String(snap.loadedInstrument||"").toUpperCase()===pair&&
       Array.isArray(snap.rows)){
      const bars=snap.rows.map(row=>[row?.t,row?.c]);
      const verified=analyzeRows(bars,String(snap.source||"Bougies externes"),"candles",
        pair,String(snap.loadedBar||""),null);
      if(verified)return verified;
    }
    // In NEW LISTINGS the owner deliberately switches to native LINE mode;
    // read the chart owner's published result, not inactive microscope rows.
    const line=listing();
    if(!line||String(line.instrument||"").toUpperCase()!==pair||
       String(line.provider||"").toLowerCase()!==String(ctx.provider||"").toLowerCase()||
       !Array.isArray(line.series))return null;
    return analyzeRows(line.series,String(line.source||"Ligne publique"),"line",
      pair,null,Number(line.periodDays)||1);
  }
  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const node=document.createElement("style");node.id=STYLE_ID;
    node.textContent='html[data-agent-crypto-surface="trader"] #math.trader-math-external > :not(.atlas-math-dock-head):not(.atlas-math-rail-trigger):not(#traderMathExternalGuard){display:none!important}' +
      '#traderMathExternalGuard{padding:16px;border:1px solid rgba(118,216,236,.35);border-radius:12px;background:rgba(3,20,32,.8);color:#e9f7ff;line-height:1.65}' +
      '#traderMathExternalGuard strong{color:#8be9f6}' +
      'html[data-agent-crypto-surface="trader"] #math.trader-math-external #atlasMathContextLine{display:none!important}' +
      '#math.trader-math-external #atlasMathRailScore{font-size:0!important}' +
      '#math.trader-math-external #atlasMathRailScore:after{content:attr(data-external-symbol);font-size:16px}';
    document.head.appendChild(node);
  }
  function ensureGuard(root){
    let node=document.getElementById(GUARD_ID);
    if(node)return node;
    node=document.createElement("section");node.id=GUARD_ID;
    node.setAttribute("role","status");
    node.setAttribute("aria-live","polite");
    root.appendChild(node);
    return node;
  }
  function render(){
    if(!activeTrader())return false;
    const root=math();if(!root)return false;
    const ctx=external();
    if(!ctx?.active||!ctx?.instrument||!ctx?.base){
      root.classList.remove("trader-math-external");
      delete root.dataset.mathExternalInstrument;
      const old=document.getElementById(GUARD_ID);if(old)old.hidden=true;
      const rail=document.getElementById("atlasMathRailScore");if(rail)delete rail.dataset.externalSymbol;
      return true;
    }
    ensureStyle();
    const node=ensureGuard(root);
    node.hidden=false;
    root.classList.add("trader-math-external");
    root.dataset.mathExternalInstrument=ctx.instrument;
    const rail=document.getElementById("atlasMathRailScore");if(rail)rail.dataset.externalSymbol=String(ctx.base).toUpperCase();
    const title=document.createElement("strong");
    title.textContent="Math Core · "+String(ctx.base).toUpperCase()+"/"+String(ctx.quote).toUpperCase();
    const detail=document.createElement("div");
    const m=verifiedSeries(ctx);
    detail.textContent=m
      ? String(m.points)+" points "+(m.kind==="line"?"de la ligne":"de bougies")+" · "+m.source+
        " · volatilité de fenêtre "+m.volatility.toFixed(2)+" %"+
        " · drawdown historique "+m.drawdown.toFixed(2)+" %"+
        " · dernière donnée "+new Date(m.lastAt).toLocaleString("fr-FR")+
        ". Mesures descriptives "+String(ctx.instrument)+" ; ni score, ni signal d'ordre."
      : "Contexte "+String(ctx.instrument)+" : aucune série complète, assez récente et "+
        "identifiée pour ce marché. Les mesures restent suspendues, sans substitution BTC.";
    node.replaceChildren(title,detail);
    return true;
  }
  function queue(){
    queueMicrotask(()=>{if(typeof requestAnimationFrame==="function")requestAnimationFrame(render);else render();});
  }
  function start(){
    if(!activeTrader())return;
    const events=["agent-crypto:external-asset-changed","agent-crypto:trader-selection-changed",
      "agent-crypto:candles-technical-levels","agent-crypto:market-candles-loaded","agent-crypto:new-listing-line-ready","agent-crypto:graph-context-ready",
      "agent-crypto:workspace-restored","agent-crypto:selected-market-changed","pageshow"];
    for(const event of events)window.addEventListener(event,queue,{passive:true});
    render();
  }
  globalThis.AgentCryptoTraderExternalMathGuard=Object.freeze({
    render,snapshot:()=>Object.freeze({active:!!math()?.classList?.contains("trader-math-external"),
      instrument:math()?.dataset?.mathExternalInstrument||null,read_only:true}),
    real_orders:false,recurring_timer:false,math_core_replaced:false
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
