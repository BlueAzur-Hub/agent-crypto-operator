/* ERITH.IA — OHLC on the original Chart.js LINE chart. Source remains the
 * existing Market Microscope snapshot. No new trading or synthetic candles. */
(()=>{'use strict';
 const N=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
 const T=v=>{const n=N(v);if(n!==null)return n>1e12?n:n>1e9?n*1000:null;const d=typeof v==='string'?Date.parse(v):NaN;return Number.isFinite(d)?d:null;};
 function barsFrom(s){
   if(!Array.isArray(s?.rows)||s.rows.length<2||s.loading||!s.loadedInstrument||!s.loadedBar)return [];
   const rows=s.rows.map(r=>{const t=T(r?.t),o=N(r?.o),h=N(r?.h),l=N(r?.l),c=N(r?.c);
     return t!==null&&o>0&&c>0&&l>0&&h>=Math.max(o,c,l)&&l<=Math.min(o,c,h)?{t,o,h,l,c}:null;
   }).filter(Boolean).sort((a,b)=>a.t-b.t);
   return rows.length>1?rows:[];
 }
 const mode=()=>globalThis.AgentCryptoMarketMicroscope?.snapshot?.()?.mode==='hybrid';
 // The chart period owns candle cadence. This is a read-only, bounded mapping.
 const PERIODS=Object.freeze({
  '24h':Object.freeze({label:'24h',days:1,bar:'5m',step:300000}),
  '7j':Object.freeze({label:'7j',days:7,bar:'1h',step:3600000}),
  '30j':Object.freeze({label:'30j',days:30,bar:'4h',step:14400000}),
  '60j':Object.freeze({label:'60j',days:60,bar:'1j',step:86400000}),
  '90j':Object.freeze({label:'90j',days:90,bar:'1j',step:86400000}),
  '1a':Object.freeze({label:'1a',days:365,bar:'1j',step:86400000})
 });
 function periodConfig(){
   if(typeof document==='undefined'||typeof document.getElementById!=='function')return null;
   const title=String(document.getElementById('atlasChartInsightOverlayTitle')?.textContent||'');
   const m=title.match(/(?:^|[\s·])(24h|7j|30j|60j|90j|1a|1\s+an|max)(?=[\s·]|$)/i);
   const periodKey=m?.[1]?.toLowerCase().replace(/\s+/g,'')==='1an'?'1a':m?.[1]?.toLowerCase();
   return periodKey?(PERIODS[periodKey]||null):null;
 }
 function nativeDate(v,base){
   const t=T(v);if(t!==null)return t;
   if(typeof v!=='string')return null;
   const m=v.trim().match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{4}))?(?:[,\s]+(\d{1,2}):(\d{2}))?$/);
   if(!m)return null;
   const b=new Date(base),d=Number(m[1]),mo=Number(m[2])-1,y=m[3]?Number(m[3]):b.getFullYear();
   const t2=new Date(y,mo,d,Number(m[4]||0),Number(m[5]||0)).getTime();
   return new Date(t2).getDate()===d?t2:null;
 }
 function nativeTimeline(chart,i,anchor){
   const values=chart?.data?.datasets?.[i]?.data||[],labels=chart?.data?.labels||[];
   if(values.length<12)return null;
   const times=values.map((p,j)=>p&&typeof p==='object'?(nativeDate(p.t??p.timestamp??p.time??p.x,anchor)??nativeDate(labels[j],anchor)):nativeDate(labels[j],anchor));
   if(times.every(Number.isFinite)&&times.every((t,j)=>!j||t>times[j-1]))return times;
   // Only for the real French 24h time axis; resolve midnight BACKWARDS.
   const clock=labels.length===values.length?labels.map(v=>typeof v==='string'?v.trim().match(/^(\d{1,2}):(\d{2})$/):null):[];
   if(!clock.length||!clock.every(Boolean))return historicalPeriodTimeline(chart,i,anchor);
   const b=new Date(anchor),result=new Array(clock.length);
   let day=new Date(b.getFullYear(),b.getMonth(),b.getDate()).getTime();
   for(let j=clock.length-1;j>=0;j--){
     const hh=Number(clock[j][1]),mm=Number(clock[j][2]);if(hh>23||mm>59)return null;
     let t=day+hh*3600000+mm*60000;
     if(j<clock.length-1&&t>=result[j+1]){
       const d=new Date(day);
       day=new Date(d.getFullYear(),d.getMonth(),d.getDate()-1).getTime();
       t=day+hh*3600000+mm*60000;
     }
     result[j]=t;
   }
   return result;
 }
 // CoinGecko can omit per-point labels on any historical period.
 // Only X positions are estimated from its verified last sample timestamp.
 // Prices and OHLC are never reconstructed.
 function historicalPeriodTimeline(chart,i,anchor){
   if(typeof document==='undefined'||typeof document.getElementById!=='function')return null;
   const price=chart?.data?.datasets?.[i]?.data||[];
   const period=periodConfig();
   if(price.length<12||!period)return null;
   const summary=String(document.getElementById('atlasChartInsightOverlaySummary')?.textContent||'');
   if(!/CoinGecko/i.test(summary))return null;
   const stamp=summary.match(/série\s+(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/i);
   if(!stamp)return null;
   const [_,dd,mm,yyyy,hh,mi,ss]=stamp;
   const last=new Date(Number(yyyy),Number(mm)-1,Number(dd),Number(hh),Number(mi),Number(ss||0)).getTime();
   if(!Number.isFinite(last)||new Date(last).getDate()!==Number(dd))return null;
   const duration=period.days*86400000;
   // Cached 7j/30j end points need not be live, but must still overlap the
   // real exchange series (enforced independently by matching).
   if(last>anchor+period.step*2||anchor-last>duration)return null;
   const result=price.map((v,j)=>last-duration+duration*j/(price.length-1));
   result.approximate=true; // Source sample time exact; intermediate native cadence estimated.
   return result;
 }
 function owner(chart){
   if(!chart?.data?.datasets||!chart.getDatasetMeta)return null;
   const a=[];chart.data.datasets.forEach((ds,i)=>{const meta=chart.getDatasetMeta(i);
     if(meta?.type==='line'&&!meta.hidden&&ds?.atlasCoin?.symbol&&meta.data?.length>=12&&meta.yScale?.getPixelForValue)a.push({ds,meta,i});
   });
   return a.length===1?a[0]:null;
 }

 // Unlike Market Solo, public New Listing DNA/CT can keep a hidden BTC
 // getSelectedCoin(). Verify the exact EXTERNAL chart + historic series owner.
 function externalLineTruth(ref,loadedInstrument,period=periodConfig()){
   if(!period)return {reason:'Ligne conservée · période externe sans OHLC vérifiées'};
   const ext=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();
   if(!ext?.active)return null;
   const n=globalThis.AgentCryptoNewListingsNativeCategory?.snapshot?.();
   const h=globalThis.AgentCryptoNewListingsNativeCategory?.mathSeriesSnapshot?.();
   const chart=globalThis.AtlasExternalChart?.state?.();
   const id=String(n?.selectedId||''),sym=String(n?.selectedSymbol||'').toUpperCase();
   const requested=String(loadedInstrument||'').toUpperCase();
   const selectedPair=String(n?.selectedPair||'').toUpperCase().replace(/\//g,'-');
   const chartId=String(ref?.ds?.atlasCoin?.id||'');
   if(!id||!sym||!n?.selectedProvider||!selectedPair||
     id!==String(ext.id||'')||String(ext.base||'').toUpperCase()!==sym||
     selectedPair!==String(ext.instrument||'').toUpperCase()||
     requested!==selectedPair||!chart?.active||String(chart.coin_id||'')!==id||
     chartId!==id||String(ref?.ds?.atlasCoin?.symbol||'').toUpperCase()!==sym||
     !h||h.instrument!==n.selectedPair||h.provider!==n.selectedProvider||
     Number(h.periodDays)!==period.days||h.currency!=='USD'||!String(h.source||'').includes(n.selectedPair))
     return {reason:'Ligne conservée · contexte externe non confirmé'};
   if(!Array.isArray(h.series)||h.series.length!==ref.ds.data.length||
      h.series.length!==ref.meta.data.length||h.series.length<21)
     return {reason:'Ligne conservée · historique externe non aligné'};
   const times=h.series.map(pair=>Array.isArray(pair)?T(pair[0]):null);
   if(!times.every(Number.isFinite)||times.some((t,i)=>i>0&&t<=times[i-1]))
     return {reason:'Ligne conservée · heures externes invalides'};
   const price=v=>N(Array.isArray(v)?v[1]:v&&typeof v==='object'?(v.y??v.price??v.value):v);
   for(const i of [...new Set([0,Math.floor(times.length/2),times.length-1])]){
     const chartP=price(ref.ds.data[i]),historyP=N(h.series[i]?.[1]);
     if(!(chartP>0&&historyP>0)||Math.abs(chartP/historyP-1)>0.001)
       return {reason:'Ligne conservée · série externe incohérente'};
   }
   return {times,coinId:id,symbol:sym,source:h.source};
 }
 function matching(chart,s){
   const ref=owner(chart),period=periodConfig(),rows=barsFrom(s);
   if(!ref)return {reason:'Hybride : disponible en Solo · prix normal'};
   if(!period)return {reason:'Ligne conservée · période sans couverture OHLC confirmée'};
   if(typeof document==='undefined'||document.querySelector('[data-chart-view="base100"].is-active')||document.querySelector('[data-chart-scale="logarithmic"].is-active'))
     return {reason:'Hybride : sélectionner Prix · Normale'};
   if(s?.loading)return {reason:'Chargement des bougies '+period.bar+'…'};
   if(!rows.length)return {reason:s?.errorCode?'OHLC indisponibles · '+String(s.errorCode).slice(0,45):'Bougies '+period.bar+' non chargées'};
   if(s.loadedBar!==period.bar)return {reason:'Bougies '+period.bar+' attendues · série '+String(s.loadedBar||'absente')};
   const gaps=rows.slice(1).map((row,i)=>row.t-rows[i].t);
   const validGaps=gaps.filter(ms=>ms>=period.step*.8&&ms<=period.step*1.2).length;
   const expected=Math.ceil(period.days*86400000/period.step);
   if(rows.length<Math.ceil(expected*(period.days>=365?.95:.8))||!gaps.length||validGaps<gaps.length*.83)
     return {reason:'Ligne conservée · couverture OHLC '+period.label+' insuffisante'};
   const symbol=String(ref.ds.atlasCoin.symbol||'').toUpperCase(),instrument=String(s.loadedInstrument||'').toUpperCase();
   const external=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();
   const extTruth=external?.active?externalLineTruth(ref,instrument,period):null;
   if(extTruth?.reason)return extTruth;
   if(!symbol||!instrument.startsWith(symbol+'-'))
     return {reason:'Ligne conservée · actifs différents'};
   if(!external?.active){
     const selected=globalThis.getSelectedCoin?.();
     if(selected?.id&&selected.id!==ref.ds.atlasCoin.id)
       return {reason:'Ligne conservée · actifs différents'};
   }
   const quote=instrument.slice(symbol.length+1),currency=String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||'USD').toUpperCase();
   if(!(quote===currency||(currency==='USD'&&(quote==='USDC'||quote==='USDT'))))
     return {reason:'Ligne conservée · cotation incompatible'};
   const times=extTruth?.times||nativeTimeline(chart,ref.i,rows.at(-1).t),points=ref.meta.data;
   if(!times||times.length!==points.length)return {reason:'Ligne conservée · dates non vérifiables'};
   const first=times[0],last=times.at(-1),duration=last-first,target=period.days*86400000;
   if(!(duration>=target*.78&&duration<=target*1.16))
     return {reason:'Ligne conservée · période historique différente'};
   const overlapStart=Math.max(first,rows[0].t),overlapEnd=Math.min(last,rows.at(-1).t);
   if(Math.max(0,overlapEnd-overlapStart)<target*(period.days>=365?.95:.78))
     return {reason:'Ligne conservée · OHLC historiques insuffisants pour '+period.label};
   // Compare price with the candle at the HISTORICAL graph end, never today's
   // last candle when displaying a cached 7j or 30j chart.
   const atEnd=rows.reduce((closest,row)=>Math.abs(row.t-last)<Math.abs(closest.t-last)?row:closest,rows[0]);
   if(Math.abs(atEnd.t-last)>period.step*2)
     return {reason:'Ligne conservée · fin des bougies non alignée'};
   const tail=ref.ds.data.at(-1),endLine=N(Array.isArray(tail)?tail[1]:tail&&typeof tail==='object'?(tail.y??tail.price??tail.value):tail);
   if(!(endLine>0)||Math.abs(atEnd.c/endLine-1)>.035)
     return {reason:'Ligne conservée · prix/quote divergents'};
   return {ref,rows,times,first,last,quote,currency,instrument,source:s.source,period,approximate:!!times.approximate,warning:s.errorCode||null};
 }
 function px(t,ref,times){
   if(t<times[0]||t>times.at(-1))return null;
   let a=0,b=times.length-1;
   while(a+1<b){const m=(a+b)>>1;if(times[m]<=t)a=m;else b=m;}
   const x=ref.meta.data[a]?.x,y=ref.meta.data[b]?.x;
   return Number.isFinite(x)&&Number.isFinite(y)&&times[b]>times[a]?x+(y-x)*(t-times[a])/(times[b]-times[a]):null;
 }
 // Hybrid draws only individual colored candle shapes in the native bottom area,
 // never a shaded band, frame, extra panel or secondary price plot. True exchange OHLC values remain untouched.
 // All lows are placed on one visual baseline (like the native volume bars);
 // height compares each candle's intrabar high-low amplitude, NOT absolute price.
 function miniLane(area){
   if(!area||![area.left,area.right,area.top,area.bottom].every(Number.isFinite))return null;
   const plotH=area.bottom-area.top,plotW=area.right-area.left;
   if(plotH<230||plotW<220)return null;
   const height=Math.max(60,Math.min(170,plotH*.24));
   const bottom=area.bottom-5,top=bottom-height;
   return {left:area.left+1,right:area.right-1,top,bottom,height,
     bodyTop:top+19,bodyBottom:bottom-7};
 }
 function miniGeometry(area,ohlcRows){
   const lane=miniLane(area);
   if(!lane||!Array.isArray(ohlcRows)||ohlcRows.length<2)return null;
   if(!ohlcRows.every(r=>Number.isFinite(r.h)&&Number.isFinite(r.l)&&r.h>=r.l&&r.l>0))return null;
   const maxRange=Math.max(...ohlcRows.map(r=>r.h-r.l));
   if(!(Number.isFinite(maxRange)&&maxRange>0))return null;
   // Each candle gets the same pixels per unit of intrabar range. This
   // preserves relative magnitudes while translating lows to the shared bottom.
   const height=(lane.bodyBottom-lane.bodyTop)*.92;
   // Display-only square-root boost keeps smaller bars visible despite
   // a single large wick; original OHLC prices and candle direction remain exact.
   const y=(row,value)=>lane.bodyBottom-Math.sqrt(Math.max(0,Math.min(1,(value-row.l)/maxRange)))*height;
   return {...lane,maxRange,scale:'sqrt-amplitude-display',y};
 }
 function drawBars(chart,g){
   const {ref,rows,times,first,last}=g,ctx=chart.ctx,area=chart.chartArea;
   if(!ctx||!area||typeof ctx.save!=='function')return 0;
   const inside=rows.filter(r=>r.t>=first&&r.t<=last),lane=miniGeometry(area,inside);
   if(!lane)return 0;
   // The cadence follows the real chart period (5m, 1h, 4h or 1j).
   // No synthetic candles or forced 24h display in a 7j/30j chart.
   const spacing=(lane.right-lane.left)/Math.max(inside.length,1);
   const width=Math.max(1,Math.min(5,spacing*.78));
   let count=0;
   // No panel, no background, no header and no separator: transparent OHLC
   // candles share the native plot and align their lows to its bottom baseline.
   // Chart.js clips the candle paint to the existing chart area; the original
   // artwork, line data, controls and volume dataset are never modified.
   ctx.save();ctx.beginPath();ctx.rect(lane.left,lane.top,lane.right-lane.left,lane.height);ctx.clip();
   inside.forEach(r=>{
     const x=px(r.t,ref,times);if(x===null||x<lane.left||x>lane.right)return;
     const yh=lane.y(r,r.h),yl=lane.y(r,r.l),yo=lane.y(r,r.o),yc=lane.y(r,r.c);
     if(![yh,yl,yo,yc].every(Number.isFinite))return;
     const up=r.c>=r.o;
     ctx.strokeStyle=up?'rgba(97,235,184,.97)':'rgba(255,119,152,.97)';
     ctx.fillStyle=up?'rgba(83,224,169,.96)':'rgba(250,101,142,.96)';
     ctx.lineWidth=Math.min(1.2,Math.max(.65,width*.30));ctx.beginPath();ctx.moveTo(x,yh);ctx.lineTo(x,yl);ctx.stroke();
     // 5m bodies are deliberately narrow: no inflated 1h blocks.
     // Direction comes exclusively from exchange O/C, not CoinGecko samples.
     const actual=Math.abs(yc-yo);
     const bodyHeight=Math.max(1.5,actual);
     const center=(yo+yc)/2;
     const bodyTop=Math.max(lane.bodyTop,Math.min(lane.bodyBottom-bodyHeight,center-bodyHeight/2));
     ctx.fillRect(x-width/2,bodyTop,width,Math.min(bodyHeight,lane.bodyBottom-bodyTop));
     count++;
   });
   ctx.restore();return count;
 }
 function hint(message,title=''){
   if(typeof document==='undefined')return;
   let el=document.getElementById('atlasNativeLineCandleStatus');
   if(!mode()){if(el)el.hidden=true;return;}
   if(!el){const shell=document.querySelector('#analyste .chart-shell');if(!shell)return;
     el=document.createElement('small');el.id='atlasNativeLineCandleStatus';
     Object.assign(el.style,{position:'absolute',right:'12px',top:'48px',zIndex:'8',font:'750 9px system-ui,sans-serif',padding:'3px 6px',background:'rgba(2,12,20,.72)',color:'#afd5e0',borderRadius:'5px',pointerEvents:'none',maxWidth:'55%',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'});
     el.setAttribute('aria-live','polite');shell.appendChild(el);
   }
   el.hidden=false;el.textContent=message;el.title=title;
 }

 // The requested hybrid is a SIMPLE PERIOD SUMMARY, not a candlestick panel.
 // Each vertical bar represents the price movement over a larger time bucket.
 // Derived from the ALREADY plotted native price series: no OHLC invented,
 // no exchange fetch, no second chart and no duplicate market selection.
 const SUMMARY_RULES=Object.freeze({
  '24h':Object.freeze({label:'24h',segments:24,unit:'heure',days:1}),
  '7j':Object.freeze({label:'7j',segments:7,unit:'jour',days:7}),
  '30j':Object.freeze({label:'30j',segments:30,unit:'jour',days:30}),
  '60j':Object.freeze({label:'60j',segments:60,unit:'jour',days:60}),
  '90j':Object.freeze({label:'90j',segments:13,unit:'semaine environ',days:90}),
  '1a':Object.freeze({label:'1a',segments:12,unit:'mois environ',days:365}),
  'max':Object.freeze({label:'Max',segments:12,unit:'segment historique',days:null})
 });
 function summaryPeriodConfig(){
   if(typeof document==='undefined'||typeof document.getElementById!=='function')return null;
   const title=String(document.getElementById('atlasChartInsightOverlayTitle')?.textContent||'');
   const m=title.match(/(?:^|[\s·])(24h|7j|30j|60j|90j|1a|1\s+an|max)(?=[\s·]|$)/i);
   const periodKey=m?.[1]?.toLowerCase().replace(/\s+/g,'')==='1an'?'1a':m?.[1]?.toLowerCase();
   return periodKey?SUMMARY_RULES[periodKey]||null:null;
 }
 const priceValue=v=>N(Array.isArray(v)?v[1]:v&&typeof v==='object'?(v.y??v.price??v.value):v);
 // Verified short external series: never pad 7 hours of listings into a fake day.
 // Must match the ALREADY plotted line and exact Bitget/OKX public source.
 function verifiedPartialListingTimes(ref,period){
   if(period?.label!=='24h')return null;
   const ext=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();
   const view=globalThis.AgentCryptoNewListingsNativeCategory;
   const selection=view?.snapshot?.(),history=view?.mathSeriesSnapshot?.();
   if(!ext?.active||!selection||!history||
     ext.id!==selection.selectedId||ext.base!==selection.selectedSymbol||
     ext.provider!==selection.selectedProvider||
     String(ext.pair||'')!==String(selection.selectedPair||'')||
     history.instrument!==selection.selectedPair||
     history.provider!==selection.selectedProvider||
     history.periodDays!==1||history.currency!=='USD'||
     history.series?.length!==ref?.ds?.data?.length||
     history.series?.length!==ref?.meta?.data?.length||
     history.series.length<21)return null;
   const times=history.series.map(pair=>Array.isArray(pair)?T(pair[0]):null);
   if(times.some((v,i)=>!Number.isFinite(v)||(i>0&&v<=times[i-1])))return null;
   for(const i of [...new Set([0,Math.floor(times.length/2),times.length-1])]){
     const plotted=priceValue(ref.ds.data[i]),source=N(history.series[i]?.[1]);
     if(!(plotted>0&&source>0)||Math.abs(plotted/source-1)>.001)return null;
   }
   return times;
 }
 function summaryOwnership(ref,period=summaryPeriodConfig()){
   if(!ref?.ds?.atlasCoin?.id||!ref?.ds?.atlasCoin?.symbol)return false;
   const external=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();
   if(external?.active){
     // CT V7 can restore the canonical plotted series after the transient
     // AtlasExternalChart controller has become inactive. Prove the chart
     // line with the same validated native series instead of a controller
     // boolean. NEVER borrow the retained Market BTC identity or quote.
     const native=globalThis.AgentCryptoNewListingsNativeCategory;
     const n=native?.snapshot?.(),h=native?.mathSeriesSnapshot?.();
     const chartOwner=globalThis.AtlasExternalChart?.state?.();
     const id=String(external.id||''),symbol=String(external.base||'').toUpperCase();
     const pair=v=>String(v||'').toUpperCase().replace(/\//g,'-');
     const wantedPair=pair(external.instrument),selectedPair=pair(n?.selectedPair);
     if(!id||!symbol||
       id!==String(ref.ds.atlasCoin.id||'')||
       symbol!==String(ref.ds.atlasCoin.symbol||'').toUpperCase()||
       id!==String(n?.selectedId||''))return false;
     // Preserve the original owner handshake for ordinary active external
     // charts (DNA, CT, and other listings): do not require extra readers.
     if(chartOwner?.active)return String(chartOwner.coin_id||'')===id;
     // Fallback is ONLY for a restored chart without an active controller;
     // it requires independent exact source and plotted price concordance.
     if(!period||!wantedPair||
       symbol!==String(n?.selectedSymbol||'').toUpperCase()||
       external.provider!==n?.selectedProvider||
       wantedPair!==selectedPair||
       !h||pair(h.instrument)!==wantedPair||
       h.provider!==external.provider||h.currency!=='USD'||
       Number(h.periodDays)!==period.days||
       !String(h.source||'').includes(String(n.selectedPair||''))||
       !Array.isArray(h.series)||h.series.length<21||
       h.series.length!==ref.ds.data?.length||h.series.length!==ref.meta.data?.length)
       return false;
     for(const i of [...new Set([0,Math.floor(h.series.length/2),h.series.length-1])]){
       const plotted=priceValue(ref.ds.data[i]),verified=N(h.series[i]?.[1]);
       if(!(plotted>0&&verified>0)||Math.abs(plotted/verified-1)>0.001)
         return false;
     }
     return true;
   }
   const selected=globalThis.getSelectedCoin?.();
   return !selected?.id||String(selected.id)===String(ref.ds.atlasCoin.id);
 }
 function variationSummary(chart){
   const ref=owner(chart),period=summaryPeriodConfig();
   if(!period)return {reason:'Période de synthèse non reconnue'};
   if(!ref||!summaryOwnership(ref))return {reason:'Synthèse indisponible · actif non confirmé'};
   if(typeof document==='undefined'||document.querySelector('[data-chart-view="base100"].is-active')||
     document.querySelector('[data-chart-scale="logarithmic"].is-active'))
     return {reason:'Synthèse disponible en Solo · Prix · Normale'};
   const values=ref.ds.data,points=ref.meta.data;
   if(!Array.isArray(values)||values.length<period.segments*2||points?.length!==values.length)
     return {reason:'Synthèse indisponible · échantillons insuffisants'};
   const native=nativeTimeline(chart,ref.i,Date.now());
   const observed=verifiedPartialListingTimes(ref,period);
   const times=observed||native;
   if(!times||times.length!==values.length||times.some((t,i)=>!Number.isFinite(t)||(i>0&&t<=times[i-1])))
     return {reason:'Synthèse indisponible · dates non vérifiables'};
   const first=times[0],last=times.at(-1),span=last-first;
   if(!(span>0))return {reason:'Synthèse indisponible · durée inconnue'};
   let partial=false;
   if(period.days){
     const expected=period.days*86400000;
     if(span<expected*.73||span>expected*1.18){
       // Only a matching, chronologically VERIFIED 24h new-listing series can
       // earn a partial badge. The other historical durations stay strict.
       if(period.label==='24h'&&observed===times&&span>=2*3600000&&
          span<expected*.73&&last<=Date.now()+300000&&
          Date.now()-last<=30*60000)partial=true;
       else return {reason:'Synthèse indisponible · couverture '+period.label+' incohérente'};
     }
   }else if(span<7*86400000){
     return {reason:'Synthèse Max · durée réelle trop courte'};
   }
   const segments=partial?Math.min(24,Math.max(2,Math.floor(span/3600000))):period.segments;
   const buckets=Array.from({length:segments},()=>[]);
   for(let i=0;i<values.length;i++){
     const price=priceValue(values[i]);if(!(price>0))continue;
     const bin=Math.min(segments-1,Math.max(0,Math.floor((times[i]-first)/span*segments)));
     buckets[bin].push({price,t:times[i]});
   }
   const bars=buckets.map((bucket,i)=>{
     if(bucket.length<2)return null;
     const p0=bucket[0].price,p1=bucket.at(-1).price;
     const change=(p1/p0-1)*100;
     return Number.isFinite(change)?{index:i,t:bucket[0].t,end:bucket.at(-1).t,open:p0,close:p1,change,direction:change>0?'up':change<0?'down':'flat',samples:bucket.length}:null;
   });
   // Refuse partial archives rather than silently presenting nonexistent days.
   if(bars.some(x=>!x))return {reason:'Synthèse indisponible · intervalles historiques incomplets'};
   return {period,ref,times,first,last,bars,approximate:!!times.approximate,
     partial,coverageHours:Number((span/3600000).toFixed(2)),sourceExact:!!observed,
     coinId:String(ref.ds.atlasCoin.id),symbol:String(ref.ds.atlasCoin.symbol)};
 }
 function drawVariationSummary(chart,summary){
   const lane=miniLane(chart.chartArea),ctx=chart.ctx,bars=summary?.bars;
   if(!lane||!ctx||!Array.isArray(bars)||bars.length<2)return 0;
   const abs=bars.map(b=>Math.abs(b.change)).filter(v=>v>0).sort((a,b)=>a-b);
   const max=abs.length?abs[Math.min(abs.length-1,Math.floor(abs.length*.9))]:0;
   const usable=lane.bodyBottom-lane.bodyTop;
   const step=(lane.right-lane.left)/bars.length;
   const width=Math.max(1.5,Math.min(60,step*.62));
   const toHeight=pct=>pct===0?2:Math.min(usable,Math.max(5,usable*Math.sqrt(Math.abs(pct)/Math.max(max,1e-10))*.87));
   ctx.save();ctx.beginPath();ctx.rect(lane.left,lane.top,lane.right-lane.left,lane.height);ctx.clip();
   bars.forEach((b,i)=>{
     const x=lane.left+step*(i+.5);
     const height=toHeight(b.change);
     ctx.fillStyle=b.direction==='up'?'rgba(76,224,170,.90)':
       b.direction==='down'?'rgba(250,105,143,.90)':'rgba(170,185,195,.75)';
     ctx.fillRect(x-width/2,lane.bodyBottom-height,width,height);
   });
   ctx.restore();return bars.length;
 }
 const plugin={id:'agentCryptoNativeLineCandles',
   // Suppress the native lower-volume BAR dataset only in Hybrid. Preserve its
   // data, tooltip source and the user's Volume toggle for the other modes.
   beforeDatasetDraw(chart,args){
     if(chart?.canvas?.id!=='mainChart'||!mode())return;
     if(chart.getDatasetMeta?.(args.index)?.type==='bar')return false;
   },
   afterDatasetsDraw(chart){
     if(chart?.canvas?.id!=='mainChart'||!mode())return;
     const summary=variationSummary(chart);
     if(!summary.bars){hint(summary.reason);return;}
     const count=drawVariationSummary(chart,summary);
     hint(count?'Ligne + '+count+' barres · '+
       (summary.partial?'listing partiel '+summary.coverageHours.toLocaleString('fr-FR')+' h sur 24 h':
         summary.period.label+' · '+summary.period.unit)+
       (summary.approximate?' · temps estimé':''):'Ligne conservée · barres indisponibles',
       'Variations en pourcentage du prix historique affiché. Vert : hausse ; rouge : baisse. '+
       'Hauteur visuelle compressée pour rester lisible ; aucune bougie OHLC reconstituée.');
   }
 };
 function refresh(){
   if(typeof document==='undefined')return;
   const chart=globalThis.Chart?.getChart?.(document.getElementById('mainChart'));
   if(chart?.draw)try{chart.draw();}catch(_){}
   if(!mode())hint('');
 }
 if(globalThis.Chart?.register)globalThis.Chart.register(plugin);
 if(typeof window!=='undefined')for(const event of ['agent-crypto:market-candles-loaded','agent-crypto:quote-architecture-changed','agent-crypto:selected-market-changed','agent-crypto:external-asset-changed'])
   window.addEventListener(event,refresh,{passive:true});
 globalThis.AgentCryptoLineCandleOverlay=Object.freeze({refresh,barsFrom,periodConfig,summaryPeriodConfig,summaryOwnership,variationSummary,drawVariationSummary,nativeTimeline,verifiedPartialListingTimes,externalLineTruth,matching,miniLane,miniGeometry,drawBars,plugin,strip_ratio:.24,read_only:true,real_order:false,market_core_changed:false});
})();