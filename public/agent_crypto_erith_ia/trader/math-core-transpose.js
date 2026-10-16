(function mathCoreTranspose(){
  "use strict";
  const BUILD="40.6.580";
  const KEY="agent_crypto_erith_ia_v2_math_dock";
  const $=id=>document.getElementById(id);
  const clamp=(a,b,v)=>Math.max(a,Math.min(b,v));
  const finite=v=>{if(v===null||v===undefined||v==="")return null;const n=Number(v);return Number.isFinite(n)?n:null;};
  const selected=()=>globalThis.AgentCryptoTraderMarket?.selected?.()||globalThis.getSelectedCoin?.()||null;
  const rows=()=>globalThis.AgentCryptoMarketMicroscope?.snapshot?.()?.rows||[];
  function scoreCoin(c){
    if(!c)return{score:null,label:"En attente",parts:{}};
    const cap=finite(c.marketCap),vol=finite(c.volume24h),change=finite(c.change24h);
    const parts={
      information:12,
      market:cap?14:6,
      liquidity:vol&&cap?clamp(3,15,(vol/cap)*350):4,
      momentum:change!==null?clamp(1,10,8-Math.abs(change)/7):4,
      risk:8
    };
    const base=parts.information/15*18+parts.market/15*22+parts.liquidity/15*22+parts.momentum/10*18+parts.risk/15*20;
    let penalty=16;
    if(change!==null&&Math.abs(change)>18)penalty+=12;
    if(vol&&cap&&vol/cap<.01)penalty+=10;
    penalty+=2; // même source github-public que l'Administrator.
    const score=Math.round(clamp(0,100,base-penalty));
    let label=score<=40?"Données fragiles":score<=55?"Lecture prudente":score<=65?"Mouvement modéré":score<=75?"Mouvement marqué":"Volatilité élevée";
    label+=" · public";
    return{score,label,parts,penalty};
  }
  function scoreBand(score){
    if(score===null||score===undefined||score==="")return{id:"neutral",color:"#8EA4BA",label:"En attente"};
    const value=Number(score);
    if(!Number.isFinite(value))return{id:"neutral",color:"#8EA4BA",label:"Analyse suspendue"};
    if(value<25)return{id:"red",color:"#FF5C78",label:"Données insuffisantes"};
    if(value<55)return{id:"orange",color:"#FF9F1C",label:"Lecture prudente"};
    if(value<75)return{id:"turquoise",color:"#42E8E0",label:"Lecture structurée"};
    return{id:"green",color:"#64EFA0",label:"Lecture étayée"};
  }
  function median(values){
    const a=values.map(Number).filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;
    const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;
  }
  function mean(values){const a=values.map(Number).filter(Number.isFinite);return a.length?a.reduce((s,v)=>s+v,0)/a.length:null;}
  function sampleStd(values){
    const a=values.map(Number).filter(Number.isFinite);if(a.length<2)return null;
    const m=mean(a),v=a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1);return Math.sqrt(Math.max(0,v));
  }
  function quantile(values,p){
    const a=values.map(Number).filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;
    const i=(a.length-1)*clamp(0,1,p),lo=Math.floor(i),hi=Math.ceil(i);return lo===hi?a[lo]:a[lo]+(a[hi]-a[lo])*(i-lo);
  }
  function maxDrawdown(points){
    if(!points.length)return null;let peak=points[0][1],max=0;
    for(const [,price] of points){if(price>peak)peak=price;const d=peak>0?(price/peak)-1:0;if(d<max)max=d;}
    return Math.abs(max)*100;
  }
  function metrics(){
    const source=rows().map(r=>[Number(r?.t),Number(r?.c)]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])&&p[1]>0).sort((a,b)=>a[0]-b[0]);
    const ret=[];for(let i=1;i<source.length;i++){const v=Math.log(source[i][1]/source[i-1][1]);if(Number.isFinite(v))ret.push(v);}
    const gaps=source.slice(1).map((p,i)=>p[0]-source[i][0]).filter(v=>v>0),step=median(gaps);
    const coverage=source.length>1?source[source.length-1][0]-source[0][0]:null;
    const expected=step&&coverage?Math.max(2,Math.round(coverage/step)+1):null;
    const completeness=expected?Math.min(100,source.length/expected*100):null;
    const std=ret.length>=2?sampleStd(ret):null;
    const vol=std!==null?std*Math.sqrt(ret.length)*100:null;
    const q05=ret.length?quantile(ret,.05):null;
    return{
      points:source.length,returns:ret.length,step,completeness,
      volatilityWindow:vol,drawdown:maxDrawdown(source),
      var95:q05!==null?Math.max(0,-q05*100):null
    };
  }
  const pct=(v,d=2)=>v===null||!Number.isFinite(Number(v))?"Indisponible":Number(v).toFixed(d)+" %";
  const stepLabel=ms=>!Number.isFinite(Number(ms))?"inconnu":ms<3600000?Math.round(ms/60000)+" min":Number(ms/3600000).toFixed(1)+" h";
  function render(){
    const c=selected(),s=scoreCoin(c),m=metrics(),symbol=String(c?.symbol||"—").toUpperCase(),band=scoreBand(s.score);
    const shell=$("math"),ring=$("scoreRing"),value=$("scoreValue"),label=$("scoreLabel");
    if(shell){shell.style.setProperty("--math-score-color",band.color);shell.dataset.mathScoreBand=band.id;}
    if(ring){ring.style.setProperty("--score",String(s.score??0));ring.style.setProperty("--math-score-color",band.color);}
    if(value){value.textContent=s.score??"—";value.style.setProperty("--math-score-color",band.color);}
    if(label){label.textContent=band.label+(s.score===null?"":" · public");label.style.setProperty("--math-score-color",band.color);}
    const rail=$("atlasMathRailScore");if(rail){rail.textContent=s.score??"—";rail.style.color=band.color;}
    const context=$("atlasMathContextLine");
    if(context)context.textContent=c?symbol+" · "+(c.name||symbol)+" · CoinGecko public · Bougies "+stepLabel(m.step)+" · "+m.points+" pts":"Contexte Market : en attente";
    const verdict=$("atlasHumanVerdict");
    if(verdict)verdict.innerHTML=
      "<b>Fenêtre réelle :</b> "+m.points+" points · pas médian "+stepLabel(m.step)+" · complétude "+(m.completeness===null?"—":m.completeness.toFixed(1)+" %")+".<br>"+
      "<b>Risque historique :</b> volatilité "+pct(m.volatilityWindow)+" sur la fenêtre · drawdown max "+pct(m.drawdown)+" · VaR 95 % "+pct(m.var95)+" par pas.<br>"+
      "<b>Limites :</b> mesures de marché historiques seulement ; aucun risque de protocole, contrepartie, réglementation, liquidité d’exécution ou on-chain.";
    const summary=$("atlasSummaryGrid");
    if(summary)summary.innerHTML=
      "<div><span>Série réelle</span><b>"+m.points+" pts</b></div>"+
      "<div><span>Volatilité fenêtre</span><b>"+pct(m.volatilityWindow)+"</b></div>"+
      "<div><span>Drawdown maximal</span><b>"+pct(m.drawdown)+"</b></div>"+
      "<div><span>VaR 95 % / pas</span><b>"+pct(m.var95)+"</b></div>";
    const breakdown=$("scoreBreakdown");
    if(breakdown)breakdown.innerHTML=
      "<div><span>Information</span><b>"+Math.round(s.parts.information||0)+"/15</b></div>"+
      "<div><span>Marché</span><b>"+Math.round(s.parts.market||0)+"/15</b></div>"+
      "<div><span>Liquidité</span><b>"+Math.round(s.parts.liquidity||0)+"/15</b></div>"+
      "<div><span>Momentum</span><b>"+Math.round(s.parts.momentum||0)+"/10</b></div>"+
      "<div><span>Pénalité</span><b>"+(s.penalty??"—")+"</b></div>";
    const core=$("atlasMathCorePanel");
    if(core&&c){
      const vol=finite(c.volume24h),cap=finite(c.marketCap),ratio=vol!==null&&cap>0?vol/cap*100:null;
      const hi=finite(c.high24hUsd??c.high24h),lo=finite(c.low24hUsd??c.low24h),amp=hi!==null&&lo!==null&&lo>0?(hi-lo)/lo*100:null;
      core.innerHTML=
        '<div class="atlas-math-card"><span>Actif</span><b>'+symbol+'</b><small>'+(c.name||symbol)+'</small></div>'+
        '<div class="atlas-math-card"><span>Couverture des données</span><b>'+(m.completeness===null?"—":m.completeness.toFixed(1)+" %")+'</b><small>'+m.points+' points</small></div>'+
        '<div class="atlas-math-card"><span>Variation 24 h</span><b>'+pct(finite(c.change24h))+'</b><small>snapshot public</small></div>'+
        '<div class="atlas-math-card"><span>Variation 7 j</span><b>'+pct(finite(c.change7d))+'</b><small>snapshot public</small></div>'+
        '<div class="atlas-math-card"><span>Ratio volume / capitalisation</span><b>'+pct(ratio)+'</b><small>snapshot public</small></div>'+
        '<div class="atlas-math-card"><span>Granularité</span><b>'+stepLabel(m.step)+'</b><small>Bougies réelles</small></div>'+
        '<div class="atlas-math-card"><span>Amplitude observée 24 h</span><b>'+pct(amp)+'</b><small>high / low public</small></div>'+
        '<div class="atlas-math-card"><span>Risque global</span><b>'+(m.returns>=20?"Partiel — marché historique":"Non évalué")+'</b><small>'+(m.returns>=20?"historique mesuré":"série insuffisante")+'</small></div>';
    }
    const v=$("atlasMathVerdict");if(v)v.innerHTML="<b>Math Core V3 actif</b> · marché historique mesuré · validation humaine";
    document.documentElement.dataset.traderMath="ready";
    return true;
  }
  function setPosition(position,persist=true){
    const allowed=new Set(["rail","side","top"]),next=allowed.has(position)?position:"side";
    const grid=$("marketWorkspaceGrid"),math=$("math"),top=$("mathTopDock");if(!grid||!math||!top)return false;
    grid.classList.remove("math-dock-side","math-dock-rail","math-dock-top");math.classList.remove("is-side","is-rail","is-top");
    math.dataset.mathDock=next;
    if(next==="top"){top.hidden=false;top.appendChild(math);grid.classList.add("math-dock-top");math.classList.add("is-top");}
    else{top.hidden=true;grid.appendChild(math);grid.classList.add(next==="rail"?"math-dock-rail":"math-dock-side");math.classList.add(next==="rail"?"is-rail":"is-side");}
    document.querySelectorAll("[data-math-position]").forEach(b=>b.classList.toggle("is-active",b.dataset.mathPosition===next));
    if(persist)try{localStorage.setItem(KEY,next);}catch(_){}
    requestAnimationFrame(()=>window.dispatchEvent(new Event("resize")));return true;
  }
  function bind(){
    document.addEventListener("click",e=>{const b=e.target.closest("[data-math-position]");if(b)setPosition(b.dataset.mathPosition||"side",true);});
    $("atlasMathRailTrigger")?.addEventListener("click",()=>setPosition("side",true));
    window.addEventListener("agent-crypto:trader-selection-changed",render,{passive:true});
    window.addEventListener("agent-crypto:candles-technical-levels",render,{passive:true});
    window.addEventListener("agent-crypto:quote-architecture-changed",render,{passive:true});
  }
  function start(){
    bind();let pos="side";try{pos=localStorage.getItem(KEY)||"side";}catch(_){}
    setPosition(pos,false);render();
  }
  globalThis.AgentCryptoTraderMathCore=Object.freeze({build:BUILD,start,render,score:()=>scoreCoin(selected()),scoreBand,metrics,setPosition,snapshot:()=>Object.freeze({build:BUILD,selected:selected()?.id||null,score:scoreCoin(selected()).score,band:scoreBand(scoreCoin(selected()).score).id,metrics:metrics(),dock:$("math")?.dataset?.mathDock||"side"}),formula_owner:"ADMINISTRATOR_SCORECOIN_TRANSPOSE",score_palette_owner:"ADMINISTRATOR_ATLAS_MATH_SCORE_BAND",history_owner:"AGENT_CRYPTO_MARKET_MICROSCOPE_ROWS",prediction:false,real_order:false});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
