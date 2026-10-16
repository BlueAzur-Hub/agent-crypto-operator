(() => {
  "use strict";
  const BUILD="40.6.600";
  const PERIODS=Object.freeze([1,7,30,60,90,365,36500]);
  const LABELS=Object.freeze({1:"24h",7:"7j",30:"30j",60:"60j",90:"90j",365:"1a",36500:"Max"});
  const state={period:1,token:0,controller:null,rows:[],volumes:[],source:"",currency:"USD",coin:null,error:null,loading:false,volume:true,legend:true,analysis:true,lastLoadedAt:null,external:false,truth:"pending",hoverIndex:-1,loadedContextKey:"",refreshWarning:null,integrity:null,ownerOrigin:"",family:""};
  const $=id=>document.getElementById(id);
  const finite=v=>{if(v===null||v===undefined||v==="")return null;const n=Number(v);return Number.isFinite(n)?n:null;};
  const displayCurrency=()=>String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"USD").toUpperCase()==="EUR"?"EUR":"USD";
  const selectedCoin=()=>globalThis.AgentCryptoTraderMarket?.selected?.()||globalThis.getSelectedCoin?.()||null;
  const lineMode=()=>{
    const native=document.querySelector("#atlasMarketMicroscopeControls [data-amm-mode='native']");
    return native ? native.classList.contains("is-active") : !document.getElementById("atlasMarketMicroscope")?.classList.contains("is-open");
  };
  const periodLabel=p=>LABELS[Number(p)]||String(p)+"j";
  const currencyFormatter=(currency,value)=>{
    const n=finite(value);if(n===null)return"—";
    const digits=Math.abs(n)>=1000?2:Math.abs(n)>=1?4:Math.abs(n)>=.01?6:8;
    try{return new Intl.NumberFormat("fr-FR",{style:"currency",currency,maximumFractionDigits:digits}).format(n);}
    catch(_){return n.toLocaleString("fr-FR",{maximumFractionDigits:digits})+" "+currency;}
  };
  const quoteFormatter=(quote,value)=>{
    const n=finite(value);if(n===null)return"—";
    const digits=Math.abs(n)>=1000?2:Math.abs(n)>=1?5:Math.abs(n)>=.01?7:9;
    return n.toLocaleString("fr-FR",{maximumFractionDigits:digits})+" "+quote;
  };
  const escapeHtml=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  const historyOwner=()=>globalThis.AgentCryptoChartHistoryOwner||null;


  function externalContext(){
    const snap=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();
    const coin=selectedCoin();
    const active=!!snap?.active && !!coin?.externalNewListing;
    return active?{...snap,coin}:null;
  }
  function colorFor(coin){
    const symbol=String(coin?.symbol||"").toUpperCase();
    const map={BTC:"#F7931A",ETH:"#8193b5",USDT:"#26a17b",USDC:"#2775ca",BNB:"#F3BA2F",XRP:"#f2f4f7",SOL:"#6ee7c7",CT:"#ffd782"};
    return map[symbol]||"#62ecff";
  }
  function normalizeSeries(raw){
    const map=new Map();
    (Array.isArray(raw)?raw:[]).forEach(point=>{
      const t=finite(point?.[0]??point?.t),v=finite(point?.[1]??point?.price??point?.c);
      if(t!==null&&t>0&&v!==null&&v>0)map.set(t,v);
    });
    return [...map.entries()].sort((a,b)=>a[0]-b[0]);
  }
  function normalizeVolumes(raw){
    const map=new Map();
    (Array.isArray(raw)?raw:[]).forEach(point=>{
      const t=finite(point?.[0]??point?.t),v=finite(point?.[1]??point?.volume??point?.v);
      if(t!==null&&t>0&&v!==null&&v>=0)map.set(t,v);
    });
    return [...map.entries()].sort((a,b)=>a[0]-b[0]);
  }
  function externalPlan(period,ageDays){
    const p=Number(period||1),age=Math.max(0,Number(ageDays||0));
    if(p<=1)return{bar:"5m",limit:300,coverage:"≈24 h"};
    if(p<=7)return{bar:"1h",limit:Math.min(300,Math.max(48,Math.ceil(Math.min(age||7,7)*24))),coverage:"≤7 j"};
    if(p<=30)return{bar:"4h",limit:Math.min(300,Math.max(42,Math.ceil(Math.min(age||30,30)*6))),coverage:"≤30 j"};
    if(p<=90)return{bar:"1j",limit:Math.min(300,Math.max(30,Math.ceil(Math.min(age||p,p)))),coverage:"quotidien"};
    return{bar:"1j",limit:Math.min(300,Math.max(30,Math.ceil(Math.min(age||300,p===36500?300:p)))),coverage:"quotidien"};
  }
  async function fetchExternal(ctx,period,signal){
    const plan=externalPlan(period,ctx?.ageDays??ctx?.coin?.providerContext?.ageDays);
    const pack=await globalThis.AgentCryptoNewListingLiveAsset?.fetchCandles?.({bar:plan.bar,limit:plan.limit,signal});
    const rows=normalizeSeries((pack?.rows||[]).map(r=>[r.t,r.c]));
    const volumes=normalizeVolumes((pack?.rows||[]).map(r=>[r.t,r.v]));
    if(rows.length<2)throw new Error("Série externe vide");
    return{rows,volumes,source:(pack?.providerLabel||ctx?.providerLabel||ctx?.provider||"Exchange")+" "+(pack?.pair||ctx?.pair||"")+" · "+plan.bar,currency:String(pack?.quote||ctx?.quote||"USDT").toUpperCase(),external:true,plan,truth:"direct"};
  }
  function fallbackMicroscope(coin,period){
    if(Number(period)!==1)return null;
    const snap=globalThis.AgentCryptoMarketMicroscope?.snapshot?.();
    if(!Array.isArray(snap?.rows)||snap.rows.length<2)return null;
    const ctx=externalContext();
    if(!!snap.external!==!!ctx)return null;
    const rows=normalizeSeries(snap.rows.map(r=>[r.t,r.c])),volumes=normalizeVolumes(snap.rows.map(r=>[r.t,r.v]));
    if(rows.length<2)return null;
    return{rows,volumes,source:String(snap.source||"Market Microscope OHLCV")+" · repli",currency:ctx?String(ctx.quote||"USDT").toUpperCase():displayCurrency(),external:!!ctx,truth:"cache"};
  }
  function setLoading(label){
    const root=$("traderNativeLineChart");if(!root)return;
    root.classList.toggle("is-loading",state.loading);
    root.classList.toggle("is-error",!!state.error);
    root.dataset.stateLabel=label||"";
  }
  function syncPeriods(){
    const ext=externalContext();
    const age=Number((ext?.ageDays ?? ext?.coin?.providerContext?.ageDays) || 0);
    document.querySelectorAll("[data-trader-line-period]").forEach(btn=>{
      const p=Number(btn.dataset.traderLinePeriod||1);
      let disabled=false;
      if(ext&&age>0&&p!==36500)disabled=p>Math.max(7,age*1.2);
      btn.disabled=disabled;
      btn.classList.toggle("active",p===state.period);
      btn.classList.toggle("is-active",p===state.period);
      btn.setAttribute("aria-pressed",p===state.period?"true":"false");
    });
    const truth=$("traderLinePeriodTruth");
    if(truth)truth.textContent=ext?(age>0?Math.min(age,state.period===36500?age:state.period).toFixed(age<10?1:0)+" j dispo":periodLabel(state.period)):periodLabel(state.period);
  }
  function updatePresentation(){
    const legend=$("traderLineLegend"),overlay=$("traderLineInsightOverlay");
    if(legend)legend.hidden=!state.legend;
    if(overlay){overlay.hidden=!state.analysis;overlay.setAttribute("aria-hidden",state.analysis?"false":"true");}
  }
  function analysisText(){
    const rows=state.rows;if(rows.length<2)return{change:null,min:null,max:null,first:null,last:null,amplitude:null};
    const first=rows[0][1],last=rows.at(-1)[1],values=rows.map(x=>x[1]),min=Math.min(...values),max=Math.max(...values);
    return{change:first>0?(last/first-1)*100:null,min,max,first,last,amplitude:min>0?(max/min-1)*100:null};
  }
  function syncText(){
    const coin=state.coin||selectedCoin()||{},symbol=String(coin.symbol||"ACTIF").toUpperCase(),name=String(coin.name||symbol),a=analysisText(),color=colorFor(coin);
    const change=a.change,changeText=change===null?"—":(change>=0?"+":"")+change.toFixed(2)+" %";
    const legend=$("traderLineLegend");
    if(legend)legend.innerHTML='<i style="color:'+escapeHtml(color)+'"></i><b>'+escapeHtml(symbol)+'</b><span>'+escapeHtml(changeText)+'</span>';
    const title=$("traderLineInsightTitle"),series=$("traderLineInsightSeries"),summary=$("traderLineInsightSummary"),overlay=$("traderLineInsightOverlay");
    if(title)title.textContent=symbol+" · "+name+" · "+periodLabel(state.period)+" · PRIX "+state.currency+" · NORMALE";
    if(series){
      series.className="atlas-hud-truth";
      const truthLabel=state.external?"HISTORIQUE EXCHANGE":state.truth==="cache"?"HISTORIQUE INTERFACE · CACHE EXACT VALIDÉ":state.truth==="refresh"?"HISTORIQUE INTERFACE · DIRECT ACTUALISÉ":"HISTORIQUE INTERFACE · DIRECT";
      series.textContent=truthLabel;
    }
    if(overlay)overlay.dataset.truth=state.truth==="cache"||state.truth==="database"?"cache":"direct";
    if(summary){
      const amp=a.amplitude===null?"—":a.amplitude.toFixed(2)+" %";
      const stamp=state.rows.length?new Date(state.rows.at(-1)[0]).toLocaleString("fr-FR"):"—";
      summary.innerHTML=
        '<span class="atlas-hud-summary-row"><span><b>'+escapeHtml(symbol)+'</b> '+escapeHtml(formatPrice(a.last))+'</span><span>'+escapeHtml(changeText)+'</span><span>bas '+escapeHtml(formatPrice(a.min))+'</span><span>haut '+escapeHtml(formatPrice(a.max))+'</span><span>amplitude '+escapeHtml(amp)+'</span></span>'+
        '<span class="atlas-hud-summary-row atlas-hud-summary-secondary"><span>départ '+escapeHtml(formatPrice(a.first))+'</span><span>dernière '+escapeHtml(formatPrice(a.last))+'</span><span>'+state.rows.length+' points</span><span class="atlas-hud-datetime">série '+escapeHtml(stamp)+'</span><span>'+escapeHtml(state.source||"historique réel")+'</span></span>';
    }
    const caption=$("traderLineCaption");
    if(caption)caption.textContent=symbol+" · "+periodLabel(state.period)+" · "+state.source+" · "+state.rows.length+" points · "+(state.lastLoadedAt?new Date(state.lastLoadedAt).toLocaleTimeString("fr-FR"):"—")+" · lecture seule";
    updatePresentation();
  }
  function formatPrice(value){
    return state.external?quoteFormatter(state.currency,value):currencyFormatter(state.currency,value);
  }
  function timeLabel(ts){
    const d=new Date(Number(ts));
    if(state.period<=1)return d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
    if(state.period<=7)return d.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"})+" "+d.toLocaleTimeString("fr-FR",{hour:"2-digit"});
    if(state.period<=90)return d.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"});
    return d.toLocaleDateString("fr-FR",{month:"short",year:"2-digit"});
  }
  function canvasGeometry(){
    const canvas=$("traderMainChart"),root=$("traderNativeLineChart");if(!canvas||!root)return null;
    const rect=root.getBoundingClientRect(),dpr=window.devicePixelRatio||1,w=Math.max(600,Math.round(rect.width||980)),h=Math.max(340,Math.round(rect.height||480));
    const pw=Math.round(w*dpr),ph=Math.round(h*dpr);
    if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;canvas.style.width=w+"px";canvas.style.height=h+"px";}
    const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);return{canvas,ctx,w,h};
  }
  function draw(){
    const g=canvasGeometry();if(!g)return;
    const {ctx,w,h}=g;ctx.clearRect(0,0,w,h);
    const rows=state.rows;if(rows.length<2)return;
    const pad={l:38,r:94,t:82,b:46},plotW=w-pad.l-pad.r,plotH=h-pad.t-pad.b;
    const times=rows.map(r=>r[0]),prices=rows.map(r=>r[1]),minP=Math.min(...prices),maxP=Math.max(...prices),span=Math.max(maxP-minP,Math.abs(maxP)*.002,1e-9);
    const lo=minP-span*.08,hi=maxP+span*.08,t0=times[0],t1=times.at(-1),x=t=>pad.l+(t-t0)/(t1-t0||1)*plotW,y=v=>pad.t+(hi-v)/(hi-lo||1)*plotH;
    ctx.save();
    ctx.strokeStyle="rgba(176,236,255,.075)";ctx.lineWidth=1;
    for(let i=0;i<6;i++){const yy=pad.t+i*plotH/5;ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();}
    for(let i=0;i<7;i++){const xx=pad.l+i*plotW/6;ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke();}
    if(state.volume){
      const vols=state.volumes,maxV=Math.max(...vols.map(v=>v[1]),1),vmap=new Map(vols);
      rows.forEach(([t])=>{const v=vmap.get(t);if(!(v>=0))return;const xx=x(t),vh=(v/maxV)*Math.min(88,plotH*.18);ctx.fillStyle="rgba(98,236,255,.11)";ctx.fillRect(xx-1.5,h-pad.b-vh,3,vh);});
    }
    const color=colorFor(state.coin),grad=ctx.createLinearGradient(0,pad.t,0,h-pad.b);grad.addColorStop(0,"rgba(91,123,145,.16)");grad.addColorStop(1,"rgba(52,75,92,.01)");
    ctx.beginPath();rows.forEach(([t,p],i)=>{const xx=x(t),yy=y(p);if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);});ctx.lineTo(x(t1),h-pad.b);ctx.lineTo(x(t0),h-pad.b);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
    ctx.beginPath();rows.forEach(([t,p],i)=>{const xx=x(t),yy=y(p);if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);});ctx.strokeStyle=color;ctx.lineWidth=2.4;ctx.stroke();
    const last=rows.at(-1);ctx.beginPath();ctx.arc(x(last[0]),y(last[1]),4.2,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
    if(Number.isInteger(state.hoverIndex)&&state.hoverIndex>=0&&state.hoverIndex<rows.length){
      const hovered=rows[state.hoverIndex],hx=x(hovered[0]),hy=y(hovered[1]);
      ctx.beginPath();ctx.arc(hx,hy,6.4,0,Math.PI*2);ctx.fillStyle="rgba(3,10,20,.90)";ctx.fill();
      ctx.lineWidth=2;ctx.strokeStyle=color;ctx.stroke();
      ctx.beginPath();ctx.arc(hx,hy,2.1,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
    }
    ctx.font="750 11px system-ui,sans-serif";ctx.fillStyle="rgba(224,244,252,.76)";ctx.textAlign="left";ctx.textBaseline="middle";
    for(let i=0;i<6;i++){const v=hi-(hi-lo)*i/5,yy=pad.t+i*plotH/5;ctx.fillText(formatPrice(v),w-pad.r+8,yy);}
    ctx.textAlign="center";ctx.textBaseline="top";
    for(let i=0;i<6;i++){const t=t0+(t1-t0)*i/5,xx=x(t);ctx.fillText(timeLabel(t),xx,h-pad.b+10);}
    ctx.restore();
    g.canvas.__traderLineGeom={pad,plotW,plotH,t0,t1,lo,hi,x,y,w,h};
  }
  function nearestAt(clientX){
    const canvas=$("traderMainChart"),geom=canvas?.__traderLineGeom;if(!canvas||!geom||!state.rows.length)return null;
    const rect=canvas.getBoundingClientRect(),px=clientX-rect.left,t=geom.t0+((px-geom.pad.l)/geom.plotW)*(geom.t1-geom.t0);
    let index=-1,delta=Infinity;
    for(let i=0;i<state.rows.length;i+=1){const d=Math.abs(state.rows[i][0]-t);if(d<delta){delta=d;index=i;}}
    return index>=0?{row:state.rows[index],index}:null;
  }
  function historicalChangeAt(index){
    const first=Number(state.rows?.[0]?.[1]),price=Number(state.rows?.[index]?.[1]);
    if(!(first>0)||!(price>0))return null;
    const change=(price/first-1)*100;
    return Math.abs(change)<0.005?0:change;
  }
  function showTooltip(event){
    if(!lineMode())return;
    const hit=nearestAt(event.clientX),tip=$("atlasChartTooltip"),canvas=$("traderMainChart"),coin=state.coin||selectedCoin();
    if(!hit||!tip||!canvas||!coin)return;
    const {row,index}=hit,rect=canvas.getBoundingClientRect(),color=colorFor(coin);
    if(state.hoverIndex!==index){state.hoverIndex=index;draw();}
    const symbol=String(coin.symbol||"ACTIF").toUpperCase(),name=String(coin.name||symbol);
    const ch=historicalChangeAt(index),hasChange=Number.isFinite(ch),changeText=hasChange?((ch>0?"+":"")+ch.toFixed(2)+" %"):"—";
    const changeClass=!hasChange?"is-missing":ch>0?"is-positive":ch<0?"is-negative":"is-neutral";
    const arrow=!hasChange?"":ch>0?"▲ ":ch<0?"▼ ":"• ";
    const image=coin.image?'<img src="'+escapeHtml(coin.image)+'" alt="" loading="lazy">':'<span class="atlas-chart-tooltip-fallback">'+escapeHtml(symbol.slice(0,3))+'</span>';
    const title="PRIX HISTORIQUE · VARIATION "+periodLabel(state.period);
    tip.innerHTML=
      '<div class="atlas-chart-tooltip-date">'+escapeHtml(title)+'</div>'+
      '<div class="atlas-chart-tooltip-row" style="--atlas-series-color:'+escapeHtml(color)+';--atlas-series-gradient:linear-gradient(90deg,'+escapeHtml(color)+','+escapeHtml(color)+')">'+
        '<div class="atlas-chart-tooltip-identity">'+image+'<span><b>'+escapeHtml(symbol)+'</b><small>'+escapeHtml(name)+'</small></span></div>'+
        '<span class="atlas-chart-tooltip-color-bridge" aria-hidden="true"><i></i></span>'+
        '<div class="atlas-chart-tooltip-values"><strong>'+escapeHtml(formatPrice(row[1]))+'</strong><span class="atlas-chart-tooltip-change '+changeClass+'" title="Variation depuis le début de la période">'+escapeHtml(arrow+changeText)+'</span></div>'+
      '</div>';
    tip.hidden=false;tip.setAttribute("aria-hidden","false");tip.dataset.displayCurrency=state.currency;
    const width=Math.min(344,Math.max(250,rect.width-20));
    const geom=canvas.__traderLineGeom,anchorX=geom?.x?geom.x(row[0]):event.clientX-rect.left,anchorY=geom?.y?geom.y(row[1]):event.clientY-rect.top;
    const roomRight=rect.width-anchorX-18,roomLeft=anchorX-18;
    let left=roomRight>=width||roomRight>=roomLeft?anchorX+18:anchorX-width-18;
    left=Math.max(8,Math.min(rect.width-width-8,left));
    const top=Math.max(8,Math.min(rect.height-118,anchorY-58));
    tip.style.left=Math.round(left)+"px";tip.style.top=Math.round(top)+"px";
  }
  function hideTooltip(){
    const tip=$("atlasChartTooltip");
    if(tip){tip.hidden=true;tip.setAttribute("aria-hidden","true");}
    if(state.hoverIndex!==-1){state.hoverIndex=-1;draw();}
  }
  function applyResult(coin,result,contextKey,origin="direct",warning=null){
    const rows=normalizeSeries(result?.series||result?.rows),volumes=normalizeVolumes(result?.volumeSeries||result?.volumes);
    if(rows.length<2)return false;
    state.hoverIndex=-1;
    state.rows=rows;state.volumes=volumes;state.source=String(result?.source||"Historique réel");
    state.currency=String(result?.currency||(state.external?state.currency:displayCurrency())).toUpperCase();
    state.external=!!result?.external;
    state.truth=state.external?"direct":(result?.sourceMode==="browser-cache"||String(origin).startsWith("cache")?"cache":origin==="refresh"?"refresh":"direct");
    state.loadedContextKey=contextKey;state.refreshWarning=warning||result?.refreshWarning||null;
    state.integrity=result?.integrity||null;state.ownerOrigin=origin;state.family=String(result?.sourceFamily||"");
    state.lastLoadedAt=new Date().toISOString();state.loading=false;state.error=null;
    setLoading("");syncText();draw();dispatchLoaded();return true;
  }

  async function load(reason="operator"){
    if(!lineMode()&&reason!=="selection")return false;
    const coin=selectedCoin();if(!coin)return false;
    state.token+=1;const token=state.token;
    try{state.controller?.abort?.();}catch(_){}
    const controller=new AbortController();state.controller=controller;state.coin=coin;state.loading=true;state.error=null;state.refreshWarning=null;syncPeriods();
    const ctx=externalContext();

    if(ctx){
      setLoading("Chargement historique exchange…");
      try{
        const result=await fetchExternal(ctx,state.period,controller.signal);
        if(token!==state.token)return false;
        return applyResult(coin,result,"external:"+String(ctx.pair||coin.id)+":"+state.period,"direct");
      }catch(error){
        if(error?.name==="AbortError"||token!==state.token)return false;
        const fallback=fallbackMicroscope(coin,state.period);
        if(fallback)return applyResult(coin,fallback,"external:"+String(ctx.pair||coin.id)+":"+state.period,"cache",String(error?.message||error));
        state.loading=false;state.error=String(error?.message||error);setLoading("Graphique Ligne indisponible · "+state.error);draw();return false;
      }
    }

    const history=historyOwner();
    if(!history){state.loading=false;state.error="Owner historique Administrator absent";setLoading(state.error);return false;}
    const currency=displayCurrency(),family=history.preferredFamily(coin,currency),requestedKey=history.storageKey(coin,state.period,currency,family);
    setLoading("Historique Interface · période exacte…");
    try{
      const pack=await history.load(coin,state.period,currency,{signal:controller.signal,forceStore:reason==="selection"||reason==="currency"});
      if(token!==state.token)return false;
      const applied=pack?.result?applyResult(coin,{...pack.result,currency,external:false},requestedKey,pack.origin,pack.result?.refreshWarning||null):false;
      if(pack?.refresh){
        pack.refresh.then(refreshed=>{
          if(!refreshed||token!==state.token||controller.signal.aborted)return;
          const current=selectedCoin();
          if(current?.id!==coin.id||displayCurrency()!==currency||Number(state.period)!==Number(refreshed.periodDays||state.period))return;
          applyResult(coin,{...refreshed,currency,external:false},requestedKey,"refresh",null);
        }).catch(error=>{if(error?.name!=="AbortError"&&token===state.token){state.refreshWarning=String(error?.message||error);syncText();}});
      }
      return applied;
    }catch(error){
      if(error?.name==="AbortError"||token!==state.token)return false;
      const fallback=fallbackMicroscope(coin,state.period);
      if(fallback)return applyResult(coin,fallback,requestedKey,"cache",String(error?.message||error));
      state.loading=false;state.error=String(error?.message||error||"Historique indisponible");state.refreshWarning=state.error;
      setLoading("Historique indisponible · "+state.error);syncText();draw();dispatchLoaded();return false;
    }
  }

  function setPeriod(period){
    const p=Number(period);if(!PERIODS.includes(p))return false;
    state.period=p;syncPeriods();if(lineMode())void load("period");return true;
  }
  function snapshotState(){
    const a=analysisText(),coin=state.coin||selectedCoin()||null;
    return Object.freeze({build:BUILD,period:state.period,period_label:periodLabel(state.period),points:state.rows.length,source:state.source,currency:state.currency,external:state.external,truth:state.truth,volume:state.volume,loading:state.loading,error:state.error,refresh_warning:state.refreshWarning,loaded_context_key:state.loadedContextKey,last_loaded_at:state.lastLoadedAt,owner_origin:state.ownerOrigin,source_family:state.family,integrity:state.integrity,network_on_period_change:"only_if_exact_canonical_cache_missing_or_stale",coin_id:coin?.id||null,symbol:coin?.symbol||null,name:coin?.name||null,first:a.first,last:a.last,min:a.min,max:a.max,change:a.change,amplitude:a.amplitude});
  }
  function dispatchLoaded(){try{window.dispatchEvent(new CustomEvent("agent-crypto:trader-line-loaded",{detail:snapshotState()}));}catch(_){}}
  function bind(){
    syncPeriods();updatePresentation();
    document.addEventListener("click",event=>{
      const period=event.target.closest?.("[data-trader-line-period]");
      if(period&&!period.disabled){event.preventDefault();setPeriod(Number(period.dataset.traderLinePeriod));return;}
      const mode=event.target.closest?.("#atlasMarketMicroscopeControls [data-amm-mode]");
      if(mode?.dataset.ammMode==="native"){queueMicrotask(()=>void load("line-mode"));}
      if(mode?.dataset.ammMode==="candles"){hideTooltip();}
    });
    $("traderVolumeToggle")?.addEventListener("click",()=>{
      state.volume=!state.volume;
      const button=$("traderVolumeToggle");if(button){button.classList.toggle("is-active",state.volume);button.setAttribute("aria-pressed",String(state.volume));}
      draw();dispatchLoaded();
    });
    $("traderLegendToggle")?.addEventListener("click",()=>{state.legend=!state.legend;updatePresentation();});
    $("traderAnalysisToggle")?.addEventListener("click",()=>{state.analysis=!state.analysis;updatePresentation();});
    $("traderMainChart")?.addEventListener("pointermove",showTooltip,{passive:true});
    $("traderMainChart")?.addEventListener("pointerleave",hideTooltip,{passive:true});
    window.addEventListener("agent-crypto:trader-selection-changed",()=>{state.period=1;syncPeriods();if(lineMode())void load("selection");},{passive:true});
    window.addEventListener("agent-crypto:external-asset-changed",()=>{state.period=1;syncPeriods();if(lineMode())void load("external");},{passive:true});
    window.addEventListener("agent-crypto:quote-architecture-changed",()=>{if(lineMode()&&!externalContext())void load("currency");},{passive:true});
    let frame=0;window.addEventListener("resize",()=>{if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=0;draw();});},{passive:true});
    setTimeout(()=>{syncPeriods();if(lineMode())void load("boot");},0);
  }
  globalThis.AgentCryptoTraderLineChart=Object.freeze({
    build:BUILD,load,setPeriod,snapshot:snapshotState,
    native_interface_transpose:true,administrator_history_owner:true,exact_period_validation:true,covering_period_alias:false,trader_period_cache_added:false,real_order:false,market_core_changed:false,recurring_timer:false
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
})();