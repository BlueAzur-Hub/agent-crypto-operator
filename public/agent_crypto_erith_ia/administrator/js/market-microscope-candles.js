/* Agent-Crypto — MARKET MICROSCOPE · GENERIC MARKET INSTRUMENT RESOLVER
   Historical lineage: core 40.6.498 · New Listings reuse 40.6.529.
   40.6.529 additive extension: New Listing external context can reuse this exact chart shell
   for Ligne + Bougies without mutating Market Core/state.coins.
   Default Market path remains OKX public and Native Prix/Base100 remains untouched.
   Explicit loading remains; the shared Trader/Interface 1m view also refreshes every minute while visible. */
(()=>{
  "use strict";
  const BUILD="40.6.623";
  const HISTORICAL_CORE_BUILD="40.6.498";
  const EXTENSION_BUILD="40.6.529";
  const ROOT="atlasMarketMicroscope";
  const REST="https://eea.okx.com";
  const BARS=Object.freeze({"1m":"1m","5m":"5m","15m":"15m","1h":"1H","4h":"4H","1j":"1D"});
  const INDICATOR_KEYS=Object.freeze(["ma","ema","sr","supertrend","boll","sar","vwap","vp"]);
  const INDICATOR_DEFAULTS=Object.freeze({ma:true,ema:false,sr:true,supertrend:false,boll:false,sar:false,vwap:false,vp:false});
  const INDICATOR_STORAGE_KEY="agentCrypto.marketMicroscope.indicators.v1";
  const BAR_STORAGE_KEY="agentCrypto.marketMicroscope.bar.v1";
  function normalizeIndicatorState(value){
    const source=value&&typeof value==="object"?value:{},out={};
    INDICATOR_KEYS.forEach(key=>{out[key]=typeof source[key]==="boolean"?source[key]:INDICATOR_DEFAULTS[key];});
    return out;
  }
  function readIndicatorState(){
    const stores=[];
    try{if(globalThis.localStorage)stores.push(globalThis.localStorage);}catch(_){}
    try{if(globalThis.sessionStorage)stores.push(globalThis.sessionStorage);}catch(_){}
    for(const storage of stores){
      try{
        const raw=storage.getItem(INDICATOR_STORAGE_KEY);
        if(raw)return normalizeIndicatorState(JSON.parse(raw));
      }catch(_){}
    }
    return normalizeIndicatorState(INDICATOR_DEFAULTS);
  }
  function persistIndicatorState(){
    const payload=JSON.stringify(normalizeIndicatorState(state.indicators));
    let persisted=false;
    try{globalThis.localStorage?.setItem(INDICATOR_STORAGE_KEY,payload);persisted=true;}catch(_){}
    try{globalThis.sessionStorage?.setItem(INDICATOR_STORAGE_KEY,payload);persisted=true;}catch(_){}
    return persisted;
  }
  const normalizeBar=value=>BARS[String(value||"")]?String(value):"15m";
  function readBarPreference(){
    const stores=[];
    try{if(globalThis.localStorage)stores.push(globalThis.localStorage);}catch(_){}
    try{if(globalThis.sessionStorage)stores.push(globalThis.sessionStorage);}catch(_){}
    for(const storage of stores){
      try{
        const raw=storage.getItem(BAR_STORAGE_KEY);
        if(raw&&BARS[raw])return raw;
      }catch(_){}
    }
    return "15m";
  }
  function persistBarPreference(value){
    const bar=normalizeBar(value);
    let persisted=false;
    try{globalThis.localStorage?.setItem(BAR_STORAGE_KEY,bar);persisted=true;}catch(_){}
    try{globalThis.sessionStorage?.setItem(BAR_STORAGE_KEY,bar);persisted=true;}catch(_){}
    return persisted;
  }
  const initialBar=readBarPreference();
  const state={mode:"native",bar:initialBar,requestedBar:initialBar,loadedBar:null,instrument:"BTC-EUR",requestedInstrument:"BTC-EUR",loadedInstrument:null,rows:[],loading:false,error:null,errorCode:null,lastLoadedAt:null,source:"Market resolver",indicators:readIndicatorState(),lastLevels:null};
  const view={start:0,count:72,dragging:false,dragX:0,dragStart:0};
  let requestToken=0,activeController=null;
  const REQUEST_TIMEOUT_MS=12000;
  const num=v=>{
    if(v===null||v===undefined||typeof v==="boolean")return null;
    if(typeof v==="string"&&!v.trim())return null;
    const x=Number(v);return Number.isFinite(x)?x:null;
  };
  const fmt=(v,d=2)=>Number.isFinite(v)?v.toLocaleString("fr-FR",{maximumFractionDigits:d}):"—";
  const codedError=(code,message)=>{const error=new Error(message);error.code=code;return error;};
  function compactHttpDetail(value){
    let text=String(value??"").replace(/[\u0000-\u001f\u007f]+/g," ").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
    return text?text.slice(0,180):null;
  }
  function extractHttpDetail(raw){
    const source=String(raw??"").trim();
    if(!source)return null;
    try{
      const payload=JSON.parse(source);
      return compactHttpDetail(payload?.msg??payload?.detail??payload?.error??source);
    }catch(_){return compactHttpDetail(source);}
  }
  async function responseErrorDetail(response){
    try{return extractHttpDetail(await response.text());}catch(_){return null;}
  }
  function backendLabel(backend){
    try{const u=new URL(String(backend||""));return `LOCAL BACKEND ${u.hostname}${u.port?":"+u.port:""}`;}catch(_){return "LOCAL BACKEND NON CONFIRMÉ";}
  }
  function transportTruth(){
    const owner=globalThis.AgentCryptoOkxLocalTransport;
    const backend=String(owner?.backend||"").trim();
    return Object.freeze({confirmed:!!backend,backend:backend||null,label:backend?backendLabel(backend):"TRANSPORT LOCAL NON CONFIRMÉ",owner:owner?.canonical_filename||null});
  }
  const timeoutError=(inst,bar)=>codedError("OKX_LOCAL_TIMEOUT",`${transportTruth().label} · délai ${REQUEST_TIMEOUT_MS/1000} s dépassé · ${inst} · ${bar}`);
  const pairResolver=()=>globalThis.AgentCryptoOkxMarketPairResolver||null;
  const marketResolver=()=>globalThis.AgentCryptoMarketInstrumentResolver||null;
  const canTryNextPair=error=>pairResolver()?.canTryNext?.(error)??String(error?.code||"")==="OKX_CANDLES_UNAVAILABLE";
  const externalContext=()=>{try{return globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()||{active:false};}catch(_){return {active:false};}};
  const normalizeSelectedAsset=value=>{
    try{const canonical=pairResolver()?.normalizeAsset?.(value);if(canonical)return canonical;}catch(_){}
    const symbol=String(value??"").trim().toUpperCase();
    return /^[A-Z0-9]{1,16}$/.test(symbol)?symbol:null;
  };
  const selectedSymbol=()=>{
    const resolved=normalizeSelectedAsset(pairResolver()?.selectedAsset?.());if(resolved)return resolved;
    const ext=externalContext(),external=normalizeSelectedAsset(ext.active?ext.base:null);if(external)return external;
    try{const coin=typeof globalThis.getSelectedCoin==="function"?globalThis.getSelectedCoin():null;const canonical=normalizeSelectedAsset(coin?.symbol);if(canonical)return canonical;}catch(_){}
    return "BTC";
  };
  const displayCurrency=()=>globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.().displayCurrency||"EUR";
  const instrumentCandidates=()=>{
    const ext=externalContext(),asset=selectedSymbol(),currency=displayCurrency();
    const resolved=pairResolver()?.instrumentCandidates?.({
      asset,
      currency,
      externalInstrument:ext.active?ext.instrument:null,
      externalQuote:ext.active?ext.quote:null
    });
    if(Array.isArray(resolved)&&resolved.length)return resolved.slice();
    if(ext.active&&ext.instrument)return [String(ext.instrument).toUpperCase()];
    return currency==="USD"?[`${asset}-USDC`,`${asset}-USDT`]:[`${asset}-EUR`,`${asset}-USDC`,`${asset}-USDT`];
  };
  const desiredInstrument=()=>instrumentCandidates()[0]||"BTC-EUR";
  const activeBar=()=>state.loadedBar||state.bar;
  const activeInstrument=()=>state.loadedInstrument||state.instrument;
  const requestKey=(instrument=state.requestedInstrument,bar=state.requestedBar)=>`${String(instrument||"").toUpperCase()}|${String(bar||"")}`;
  // Fail closed when a venue responds for a different instrument or quote.
  // Only the requesting owner can decide which candles belong on this chart.
  function requireCandleContext(expected,pack){
    const provider=String(expected?.provider||"").toLowerCase();
    const instrument=String(expected?.instrument||"").toUpperCase();
    const quote=String(expected?.quote||"").toUpperCase();
    const actualProvider=String(pack?.provider||"").toLowerCase();
    const actualInstrument=String(pack?.instrument||"").toUpperCase();
    const actualQuote=String(pack?.quote||"").toUpperCase();
    if(!provider||!/^[A-Z0-9]+-[A-Z0-9]+$/.test(instrument)
      ||!quote||instrument.split("-")[1]!==quote
      ||actualProvider!==provider||actualInstrument!==instrument||actualQuote!==quote){
      throw codedError("MARKET_CANDLES_CONTEXT_MISMATCH",
        `Bougies refusées : source ou paire différente de ${instrument||"la sélection"} · ${provider||"source inconnue"}`);
    }
    return true;
  }
  function sameExternalContext(expected,current){
    return !!(expected?.active&&current?.active
      &&String(expected.id||"")===String(current.id||"")
      &&String(expected.provider||"")===String(current.provider||"")
      &&String(expected.instrument||"")===String(current.instrument||"")
      &&String(expected.quote||"")===String(current.quote||""));
  }
  function normalizeCandle(record){
    const t=num(record?.t),o=num(record?.o),h=num(record?.h),l=num(record?.l),c=num(record?.c),v=num(record?.v);
    if(![t,o,h,l,c].every(Number.isFinite)||t<=0)return null;
    if(h<Math.max(o,c,l)||l>Math.min(o,c,h))return null;
    if(v!==null&&v<0)return null;
    return {t,o,h,l,c,v,confirm:String(record?.confirm??"")};
  }
  function parseRows(data){
    return (Array.isArray(data)?data:[]).map(r=>normalizeCandle({t:r?.[0],o:r?.[1],h:r?.[2],l:r?.[3],c:r?.[4],v:r?.[5],confirm:r?.[8]})).filter(Boolean).sort((a,b)=>a.t-b.t);
  }
  function requireUsableRows(rows,inst){
    if(!Array.isArray(rows)||!rows.length)throw codedError("OKX_CANDLES_INVALID",`Candles ${inst}: aucune bougie exploitable`);
    return rows;
  }
  function movingAverage(rows,n){return rows.map((r,i)=>{if(i+1<n)return null;let s=0;for(let k=i-n+1;k<=i;k++)s+=rows[k].c;return s/n;});}
  function exponentialAverage(rows,n){
    if(!Array.isArray(rows)||!rows.length||!Number.isFinite(n)||n<1)return [];
    const alpha=2/(n+1);let ema=null;
    return rows.map((r,i)=>{
      const close=Number(r?.c);
      if(!Number.isFinite(close))return null;
      if(ema===null){
        if(i+1<n)return null;
        let seed=0;
        for(let k=i-n+1;k<=i;k++)seed+=Number(rows[k]?.c)||0;
        ema=seed/n;
        return ema;
      }
      ema=close*alpha+ema*(1-alpha);
      return ema;
    });
  }
  function volumeProfile(rows,bins=24){
    const data=Array.isArray(rows)?rows:[],count=Math.max(8,Math.min(48,Math.floor(Number(bins)||24)));
    if(!data.length)return Object.freeze({bins:[],pocIndex:null,method:"VOLUME_PROFILE_OHLCV_TYPICAL_PRICE_APPROX"});
    const low=Math.min(...data.map(r=>Number(r?.l)).filter(Number.isFinite)),high=Math.max(...data.map(r=>Number(r?.h)).filter(Number.isFinite));
    const range=Math.max(1e-12,high-low),step=range/count,volumes=Array(count).fill(0);
    data.forEach(r=>{
      const h=Number(r?.h),l=Number(r?.l),c=Number(r?.c),v=Math.max(0,Number(r?.v)||0);
      if(![h,l,c].every(Number.isFinite)||v<=0)return;
      const typical=(h+l+c)/3;
      const index=Math.max(0,Math.min(count-1,Math.floor((typical-low)/step)));
      volumes[index]+=v;
    });
    const maxVolume=Math.max(...volumes,0),pocIndex=maxVolume>0?volumes.indexOf(maxVolume):null;
    const out=volumes.map((volume,index)=>Object.freeze({index,volume,low:low+index*step,high:low+(index+1)*step,mid:low+(index+.5)*step}));
    return Object.freeze({bins:out,pocIndex,maxVolume,rangeLow:low,rangeHigh:high,count,method:"VOLUME_PROFILE_OHLCV_TYPICAL_PRICE_APPROX"});
  }
  function vwap(rows){
    const data=Array.isArray(rows)?rows:[],values=Array(data.length).fill(null);
    let pv=0,volume=0;
    for(let i=0;i<data.length;i++){
      const r=data[i],h=Number(r?.h),l=Number(r?.l),c=Number(r?.c),v=Math.max(0,Number(r?.v)||0);
      if(![h,l,c].every(Number.isFinite))continue;
      if(v>0){pv+=((h+l+c)/3)*v;volume+=v;}
      values[i]=volume>0?pv/volume:null;
    }
    return Object.freeze({values,method:"VWAP_CUMULATIVE_TYPICAL_PRICE_VOLUME"});
  }
  function parabolicSar(rows,step=.02,maxAf=.2){
    const data=Array.isArray(rows)?rows:[],values=Array(data.length).fill(null),directions=Array(data.length).fill(null);
    if(data.length<3)return Object.freeze({values,directions,step,maxAf,method:"PARABOLIC_SAR_CLASSIC"});
    let dir=Number(data[1]?.c)>=Number(data[0]?.c)?1:-1;
    let sar=dir>0?Math.min(Number(data[0]?.l),Number(data[1]?.l)):Math.max(Number(data[0]?.h),Number(data[1]?.h));
    let ep=dir>0?Math.max(Number(data[0]?.h),Number(data[1]?.h)):Math.min(Number(data[0]?.l),Number(data[1]?.l));
    let af=Math.max(.001,Number(step)||.02),cap=Math.max(af,Number(maxAf)||.2);
    values[1]=sar;directions[1]=dir;
    for(let i=2;i<data.length;i++){
      const h=Number(data[i]?.h),l=Number(data[i]?.l),p1=data[i-1],p2=data[i-2];
      if(![h,l,Number(p1?.h),Number(p1?.l),Number(p2?.h),Number(p2?.l)].every(Number.isFinite))continue;
      let next=sar+af*(ep-sar);
      if(dir>0){
        next=Math.min(next,Number(p1.l),Number(p2.l));
        if(l<next){dir=-1;next=ep;ep=l;af=Math.max(.001,Number(step)||.02);}
        else if(h>ep){ep=h;af=Math.min(cap,af+(Number(step)||.02));}
      }else{
        next=Math.max(next,Number(p1.h),Number(p2.h));
        if(h>next){dir=1;next=ep;ep=h;af=Math.max(.001,Number(step)||.02);}
        else if(l<ep){ep=l;af=Math.min(cap,af+(Number(step)||.02));}
      }
      sar=next;values[i]=sar;directions[i]=dir;
    }
    return Object.freeze({values,directions,step:Number(step)||.02,maxAf:cap,method:"PARABOLIC_SAR_CLASSIC"});
  }
  function bollinger(rows,period=20,multiplier=2){
    const data=Array.isArray(rows)?rows:[],p=Math.max(2,Math.floor(Number(period)||20)),m=Math.max(.1,Number(multiplier)||2);
    const mid=Array(data.length).fill(null),upper=Array(data.length).fill(null),lower=Array(data.length).fill(null);
    for(let i=p-1;i<data.length;i++){
      let sum=0;for(let k=i-p+1;k<=i;k++)sum+=Number(data[k]?.c)||0;
      const mean=sum/p;let variance=0;
      for(let k=i-p+1;k<=i;k++){const d=(Number(data[k]?.c)||0)-mean;variance+=d*d;}
      const sd=Math.sqrt(variance/p);
      mid[i]=mean;upper[i]=mean+m*sd;lower[i]=mean-m*sd;
    }
    return Object.freeze({mid,upper,lower,period:p,multiplier:m,method:"BOLLINGER_SMA_STDDEV"});
  }
  function supertrend(rows,period=10,multiplier=3){
    const data=Array.isArray(rows)?rows:[];
    const p=Math.max(2,Math.floor(Number(period)||10)),m=Math.max(.1,Number(multiplier)||3);
    const values=Array(data.length).fill(null),directions=Array(data.length).fill(null),atr=Array(data.length).fill(null);
    if(data.length<p)return Object.freeze({values,directions,atr,period:p,multiplier:m,method:"SUPERTREND_ATR_WILDER"});
    const tr=data.map((r,i)=>{
      const high=Number(r?.h),low=Number(r?.l),prev=i?Number(data[i-1]?.c):null;
      if(!Number.isFinite(high)||!Number.isFinite(low))return null;
      const base=Math.max(0,high-low);
      if(!Number.isFinite(prev))return base;
      return Math.max(base,Math.abs(high-prev),Math.abs(low-prev));
    });
    let seed=0;
    for(let i=0;i<data.length;i++){
      if(!Number.isFinite(tr[i]))continue;
      if(i<p)seed+=tr[i];
      if(i===p-1)atr[i]=seed/p;
      else if(i>=p&&Number.isFinite(atr[i-1]))atr[i]=((atr[i-1]*(p-1))+tr[i])/p;
    }
    let prevUpper=null,prevLower=null,prevDirection=null;
    for(let i=0;i<data.length;i++){
      if(!Number.isFinite(atr[i]))continue;
      const r=data[i],high=Number(r?.h),low=Number(r?.l),close=Number(r?.c),prevClose=i?Number(data[i-1]?.c):close;
      if(![high,low,close].every(Number.isFinite))continue;
      const mid=(high+low)/2,basicUpper=mid+m*atr[i],basicLower=mid-m*atr[i];
      let upper=basicUpper,lower=basicLower;
      if(Number.isFinite(prevUpper)&&Number.isFinite(prevLower)){
        upper=(basicUpper<prevUpper||prevClose>prevUpper)?basicUpper:prevUpper;
        lower=(basicLower>prevLower||prevClose<prevLower)?basicLower:prevLower;
      }
      let direction=prevDirection;
      if(direction===null)direction=close>=mid?1:-1;
      else if(direction===1&&close<lower)direction=-1;
      else if(direction===-1&&close>upper)direction=1;
      values[i]=direction===1?lower:upper;
      directions[i]=direction;
      prevUpper=upper;prevLower=lower;prevDirection=direction;
    }
    return Object.freeze({values,directions,atr,period:p,multiplier:m,method:"SUPERTREND_ATR_WILDER"});
  }
  function clusterPivots(points,tolerance){
    const sorted=(Array.isArray(points)?points:[]).filter(p=>Number.isFinite(p?.price)).slice().sort((a,b)=>a.price-b.price);
    const clusters=[];
    sorted.forEach(point=>{
      const last=clusters[clusters.length-1];
      if(last&&Math.abs(point.price-last.price)<=tolerance){
        last.points.push(point);
        last.price=last.points.reduce((sum,p)=>sum+p.price,0)/last.points.length;
        last.lastIndex=Math.max(last.lastIndex,point.index);
      }else clusters.push({price:point.price,points:[point],lastIndex:point.index});
    });
    return clusters.map(c=>({price:c.price,touches:c.points.length,lastIndex:c.lastIndex,confidence:c.points.length>=3?"fort":c.points.length>=2?"confirmé":"indicatif"}));
  }
  function supportResistance(rows){
    if(!Array.isArray(rows)||rows.length<7)return {support:null,resistance:null,current:null,tolerance:null,method:"PIVOTS_VISIBLES_W2",bar:activeBar(),instrument:activeInstrument()};
    const current=Number(rows[rows.length-1]?.c);
    const low=Math.min(...rows.map(r=>r.l)),high=Math.max(...rows.map(r=>r.h)),range=Math.max(1e-12,high-low);
    const tolerance=Math.max(range*.02,Math.abs(current||0)*.00045);
    const lows=[],highs=[];
    for(let i=2;i<rows.length-2;i++){
      const r=rows[i];
      if(r.l<=rows[i-1].l&&r.l<=rows[i-2].l&&r.l<=rows[i+1].l&&r.l<=rows[i+2].l)lows.push({price:r.l,index:i});
      if(r.h>=rows[i-1].h&&r.h>=rows[i-2].h&&r.h>=rows[i+1].h&&r.h>=rows[i+2].h)highs.push({price:r.h,index:i});
    }
    const lowClusters=clusterPivots(lows,tolerance),highClusters=clusterPivots(highs,tolerance);
    const choose=(clusters,kind)=>{
      const side=clusters.filter(c=>kind==="support"?c.price<current:c.price>current);
      side.sort((a,b)=>{
        const da=Math.abs(a.price-current),db=Math.abs(b.price-current);
        if(a.touches!==b.touches&&Math.abs(da-db)<tolerance*2)return b.touches-a.touches;
        return da-db;
      });
      return side[0]||null;
    };
    let support=choose(lowClusters,"support"),resistance=choose(highClusters,"resistance");
    if(!support&&Number.isFinite(low)&&Number.isFinite(current)&&low<=current)support={price:low,touches:1,lastIndex:rows.findIndex(r=>r.l===low),confidence:"indicatif",fallback:true,currentEdge:low===current};
    if(!resistance&&Number.isFinite(high)&&Number.isFinite(current)&&high>=current)resistance={price:high,touches:1,lastIndex:rows.findIndex(r=>r.h===high),confidence:"indicatif",fallback:true,currentEdge:high===current};
    const enrich=(level,kind)=>level?Object.freeze({...level,kind,distancePct:current?((level.price-current)/current)*100:null}):null;
    return Object.freeze({support:enrich(support,"support"),resistance:enrich(resistance,"resistance"),current,tolerance,method:"PIVOTS_VISIBLES_W2",bar:activeBar(),instrument:activeInstrument(),window:rows.length});
  }
  function barDurationMs(bar=activeBar()){
    return ({"1m":60000,"5m":300000,"15m":900000,"1h":3600000,"4h":14400000,"1j":86400000})[bar]||900000;
  }
  function candleChangePct(row){
    const open=Number(row?.o),close=Number(row?.c);
    return Number.isFinite(open)&&open!==0&&Number.isFinite(close)?((close-open)/open)*100:null;
  }
  function ageLabel(ms){
    const safe=Math.max(0,Number(ms)||0);
    if(safe<60000)return `${Math.max(0,Math.round(safe/1000))} s`;
    if(safe<3600000)return `${Math.round(safe/60000)} min`;
    if(safe<86400000)return `${(safe/3600000).toFixed(safe<10800000?1:0)} h`;
    return `${(safe/86400000).toFixed(1)} j`;
  }
  function marketFreshness(){
    const last=state.rows[state.rows.length-1];
    const ts=Number(last?.t);
    if(!Number.isFinite(ts)||ts<=0)return {status:"UNKNOWN",ageMs:null,label:"horodatage inconnu"};
    const age=Math.max(0,Date.now()-ts);
    const limit=barDurationMs()*2.2;
    return {status:age<=limit?"FRESH":"STALE",ageMs:age,label:ageLabel(age)};
  }
  function priceUnit(){
    const quote=String(activeInstrument()||"").split("-").pop()?.toUpperCase();
    return quote||displayCurrency();
  }
  function volumeUnit(){return String(activeInstrument()||selectedSymbol()).split("-")[0]?.toUpperCase()||selectedSymbol();}
  function priceDigits(v){
    const a=Math.abs(Number(v));
    if(!Number.isFinite(a))return 2;
    if(a>=10000)return 1;
    if(a>=100)return 2;
    if(a>=1)return 4;
    if(a>=0.01)return 6;
    return 8;
  }
  function fmtPrice(v){
    return Number.isFinite(Number(v))?Number(v).toLocaleString("fr-FR",{maximumFractionDigits:priceDigits(v)}):"—";
  }
  function levelDistance(level){
    if(!level||!Number.isFinite(level.distancePct))return "—";
    const v=Math.abs(level.distancePct);
    return `${v.toFixed(v<1?2:1)} %`;
  }
  function levelsReferenceIsLatest(levels){
    const windowSize=Math.max(0,Number(levels?.window)||0);
    return !!windowSize&&view.start+windowSize>=state.rows.length;
  }
  function technicalLevelsMarkup(levels){
    const unit=priceUnit(),s=levels?.support,r=levels?.resistance;
    const summary=`${levels?.instrument||activeInstrument()} · ${levels?.bar||activeBar()} · S ${s?fmtPrice(s.price):"—"} · R ${r?fmtPrice(r.price):"—"}`;
    const referenceLabel=levelsReferenceIsLatest(levels)?"dernière clôture":"clôture visible";
    const card=(label,level,cls)=>`<div class="${cls}"><b>${label}</b><span class="amm-tech-price">${level?`<strong>${fmtPrice(level.price)}</strong><small>${unit}</small>`:"Aucun niveau"}</span></div>`;
    const contextLine=(label,level,kind)=>{
      if(!level)return `<span><b>${label}</b><small>niveau indisponible sur cette fenêtre</small></span>`;
      const tested=`${kind==="support"?"Testé":"Testée"} ${level.touches} fois`;
      return `<span><b>${label}</b><small>${tested} · ${referenceLabel} à ${levelDistance(level)} du niveau</small></span>`;
    };
    return `<summary><span><b>Repères Support / Résistance</b><small>${summary}</small></span><em data-window-state>Ouvrir</em></summary><div class="atlas-detail-subwindow-body"><div class="detail-grid clean-lens-detail-grid amm-tech-native-grid">${card("Support",s,"is-support")}${card("Résistance",r,"is-resistance")}</div><div class="why-box clean-lens-why-box amm-tech-context"><b>Contexte des niveaux</b>${contextLine("Support",s,"support")}${contextLine("Résistance",r,"resistance")}</div></div>`;
  }
  function syncTechnicalLevelsWindow(host){
    if(!host)return;
    const stateNode=host.querySelector("[data-window-state]");
    if(stateNode)stateNode.textContent=host.open?"Réduire":"Ouvrir";
  }
  function ensureTechnicalLevelsHost(){
    if(typeof document==="undefined")return null;
    const body=document.getElementById("detailPanelBody"),anchor=document.getElementById("detailCompactStrip");if(!body||!anchor)return null;
    let host=document.getElementById("atlasCandlesTechnicalLevels");
    if(!host){
      host=document.createElement("details");
      host.id="atlasCandlesTechnicalLevels";
      host.className="atlas-detail-subwindow atlas-primary-detail-window amm-tech-levels-native";
      host.dataset.detailWindow="support-resistance";
      host.hidden=true;
      host.open=false;
      host.addEventListener("toggle",()=>syncTechnicalLevelsWindow(host));
      anchor.insertAdjacentElement("afterend",host);
    }else{
      host.className="atlas-detail-subwindow atlas-primary-detail-window amm-tech-levels-native";
      host.dataset.detailWindow="support-resistance";
    }
    return host;
  }
  function renderTechnicalLevels(levels){
    const host=ensureTechnicalLevelsHost();
    if(!host){if(!levels||state.mode!=="candles"||!state.indicators.sr)state.lastLevels=null;return;}
    if(!levels||state.mode!=="candles"||!state.indicators.sr){
      host.hidden=true;
      host.removeAttribute("data-signature");
      host.removeAttribute("data-event-signature");
      state.lastLevels=null;
      return;
    }
    const sig=[
      levels.instrument,levels.bar,levels.window,levels.current,
      levels.support?.price,levels.support?.touches,levels.support?.distancePct,
      levels.resistance?.price,levels.resistance?.touches,levels.resistance?.distancePct,
      levelsReferenceIsLatest(levels)?"latest":"historical"
    ].join("|");
    const wasOpen=host.open;
    if(host.dataset.signature!==sig){host.innerHTML=technicalLevelsMarkup(levels);host.dataset.signature=sig;host.open=wasOpen;syncTechnicalLevelsWindow(host);}
    host.hidden=false;syncTechnicalLevelsWindow(host);
    state.lastLevels=levels;
    if(globalThis.CustomEvent&&host.dataset.eventSignature!==sig){
      host.dataset.eventSignature=sig;
      try{window.dispatchEvent(new CustomEvent("agent-crypto:candles-technical-levels",{detail:levels}));}catch(_){}
    }
  }
  function candleTimeLabel(ts){
    const d=new Date(ts);
    if(!Number.isFinite(d.getTime()))return "Date inconnue";
    return d.toLocaleString("fr-FR",{day:"2-digit",month:"long",hour:"2-digit",minute:"2-digit"});
  }
  function inspectorMarkup(row){
    if(!row)return `<div class="amm-inspector-head"><b>BOUGIE SÉLECTIONNÉE</b><span>Survolez une bougie pour lire ses valeurs.</span></div><div class="amm-inspector-grid"><span><small>OUVERTURE</small><strong>—</strong></span><span><small>PLUS HAUT</small><strong>—</strong></span><span><small>PLUS BAS</small><strong>—</strong></span><span><small>CLÔTURE</small><strong>—</strong></span><span><small>VARIATION</small><strong>—</strong></span><span><small>VOLUME</small><strong>—</strong></span></div>`;
    const change=candleChangePct(row),changeText=Number.isFinite(change)?`${change>=0?"+":""}${change.toFixed(2)} %`:"—";
    const cls=Number.isFinite(change)?(change>0?"is-up":change<0?"is-down":"is-flat"):"is-flat";
    const unit=priceUnit(),volUnit=volumeUnit();
    return `<div class="amm-inspector-head"><b>BOUGIE SÉLECTIONNÉE</b><span>${candleTimeLabel(row.t)} · ${activeInstrument()} · ${activeBar()}</span></div><div class="amm-inspector-grid"><span><small>OUVERTURE</small><strong>${fmtPrice(row.o)} ${unit}</strong></span><span><small>PLUS HAUT</small><strong>${fmtPrice(row.h)} ${unit}</strong></span><span><small>PLUS BAS</small><strong>${fmtPrice(row.l)} ${unit}</strong></span><span><small>CLÔTURE</small><strong>${fmtPrice(row.c)} ${unit}</strong></span><span><small>VARIATION</small><strong class="${cls}">${changeText}</strong></span><span><small>VOLUME</small><strong>${fmt(row.v,4)} ${volUnit}</strong></span></div>`;
  }
  function style(){
    if(document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");s.id=ROOT+"Style";
    s.textContent=`#${ROOT}Controls{display:flex;align-items:center;gap:4px;margin-left:5px;padding-left:7px;border-left:1px solid rgba(255,211,122,.16)}#${ROOT}Controls small{font:900 7px/1 system-ui,sans-serif;letter-spacing:.12em;color:#8da2ad}#${ROOT}Controls button,#${ROOT} .amm-bar button,#${ROOT} .amm-refresh{min-height:25px;padding:5px 8px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(255,255,255,.04);color:#c6d8df;font:900 9px/1 system-ui,sans-serif;cursor:pointer}#${ROOT}Controls button.is-active,#${ROOT} .amm-bar button.is-active{color:#07141a;background:#ffd782;border-color:#fff0bc}#${ROOT}{position:absolute;inset:0;z-index:20;display:none;background:linear-gradient(180deg,rgba(2,9,16,.992),rgba(3,15,23,.992));border:1px solid rgba(255,215,130,.12);border-radius:9px;overflow:hidden;box-sizing:border-box}#${ROOT}.is-open{display:block}#${ROOT} .amm-head{position:absolute;z-index:5;left:10px;right:10px;top:7px;display:flex;gap:8px;align-items:center;justify-content:space-between;pointer-events:auto}#${ROOT} .amm-title{display:grid;gap:3px;flex:0 1 260px;min-width:190px;max-width:260px;overflow:hidden}#${ROOT} .amm-title b{font:950 11px/1 system-ui,sans-serif;color:#fff0cc;letter-spacing:.045em}#${ROOT} .amm-title small{font:850 8px/1.25 ui-monospace,monospace;color:#91aab5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#${ROOT} .amm-bar{display:flex;gap:4px;align-items:center;flex-wrap:nowrap}#${ROOT} canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}#${ROOT} .amm-tip{position:absolute;z-index:4;display:block;left:12px;right:12px;top:39px;min-width:0;padding:8px 10px;border:1px solid rgba(113,220,236,.24);border-radius:9px;background:rgba(3,13,22,.92);box-shadow:0 8px 24px rgba(0,0,0,.26);color:#dceff5;pointer-events:none}#${ROOT} .amm-inspector-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:6px}#${ROOT} .amm-inspector-head b{font:950 9px/1 system-ui,sans-serif;letter-spacing:.08em;color:#fff0bc}#${ROOT} .amm-inspector-head span{font:850 9px/1.2 system-ui,sans-serif;color:#9bb4bf}#${ROOT} .amm-inspector-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px}#${ROOT} .amm-inspector-grid span{display:grid;gap:3px;min-width:0;padding:5px 7px;border:1px solid rgba(255,255,255,.075);border-radius:7px;background:rgba(255,255,255,.026)}#${ROOT} .amm-inspector-grid small{font:900 8px/1 system-ui,sans-serif;letter-spacing:.05em;color:#819ba7}#${ROOT} .amm-inspector-grid strong{font:950 11px/1.15 ui-monospace,monospace;color:#edfaff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#${ROOT} .amm-inspector-grid strong.is-up{color:#73e3c7}#${ROOT} .amm-inspector-grid strong.is-down{color:#ff91a0}#${ROOT} .amm-inspector-grid strong.is-flat{color:#d8e7ec}#${ROOT} .amm-state{position:absolute;z-index:4;left:12px;bottom:8px;font:850 9px/1.3 ui-monospace,monospace;color:#9ab1bb;background:rgba(2,10,17,.82);padding:5px 8px;border:1px solid rgba(255,255,255,.055);border-radius:7px;pointer-events:none}#${ROOT} .amm-tools{display:flex;flex:1 1 auto;align-items:center;justify-content:flex-end;align-content:flex-start;gap:4px 6px;flex-wrap:wrap;min-width:0;max-width:100%}#${ROOT} .amm-indicators{display:flex;align-items:center;justify-content:flex-end;gap:4px;flex:0 0 auto;min-width:0}#${ROOT} .amm-intervals{display:flex;align-items:center;justify-content:flex-end;gap:5px;flex:0 0 auto;min-width:0}#${ROOT} .amm-indicators small{font:900 8px/1 system-ui,sans-serif;letter-spacing:.08em;color:#8aa2ad}#${ROOT} .amm-indicators button{min-height:25px;padding:5px 8px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(255,255,255,.04);color:#c6d8df;font:900 9px/1 system-ui,sans-serif;cursor:pointer}#${ROOT} .amm-indicators button.is-active{color:#07141a;background:#8fefff;border-color:#c8f7ff}#${ROOT} .amm-series-legend{position:absolute;z-index:4;left:14px;right:14px;top:112px;min-height:20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;color:#9fb4bd;pointer-events:none}#${ROOT} .amm-series-legend[hidden]{display:none}#${ROOT} .amm-series-legend span{display:inline-flex;align-items:center;gap:5px;font:900 9px/1 ui-monospace,monospace;white-space:nowrap}#${ROOT} .amm-series-legend i{width:14px;height:3px;border-radius:999px;display:inline-block;box-shadow:0 0 5px currentColor}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:4px!important}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid>div{min-height:62px!important;padding:8px!important;border-radius:8px!important}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid>div>b{font-size:8px!important;letter-spacing:.04em!important}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid>div>span.amm-tech-price{display:flex!important;align-items:baseline;gap:5px;margin-top:5px;white-space:nowrap;min-width:0}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid>div>span.amm-tech-price>strong{font:950 22px/1 ui-monospace,monospace!important;letter-spacing:-.035em}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid>div>span.amm-tech-price>small{font:900 8.5px/1 system-ui,sans-serif!important;letter-spacing:.04em;color:rgba(232,242,248,.82)!important}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid>.is-support>span{color:#78e1c4!important}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid>.is-resistance>span{color:#ffac92!important}
#detailPanel .amm-tech-levels-native .amm-tech-context{display:grid!important;gap:5px!important;margin-top:6px!important;padding:7px!important}
#detailPanel .amm-tech-levels-native .amm-tech-context>b{font:900 8px/1 system-ui,sans-serif!important;letter-spacing:.04em;color:#fff0c8!important}
#detailPanel .amm-tech-levels-native .amm-tech-context>span{display:grid;grid-template-columns:68px minmax(0,1fr);align-items:baseline;gap:6px}
#detailPanel .amm-tech-levels-native .amm-tech-context>span>b{font:900 8px/1.1 system-ui,sans-serif!important;color:#a9c0c9!important}
#detailPanel .amm-tech-levels-native .amm-tech-context>span>small{font:800 8.5px/1.25 system-ui,sans-serif!important;color:rgba(232,242,248,.88)!important}
#${ROOT}.is-two-row-controls .amm-tip{top:72px}#${ROOT}.is-two-row-controls .amm-series-legend{top:145px}
@media(max-width:760px){#${ROOT} .amm-head{align-items:flex-start;flex-direction:column}#${ROOT} .amm-title{min-width:0}#${ROOT} .amm-tools{width:100%;justify-content:flex-start;overflow-x:auto;padding-bottom:2px}#${ROOT} .amm-indicators,#${ROOT} .amm-intervals,#${ROOT} .amm-bar{flex:0 0 auto}#${ROOT} .amm-tip{top:112px;padding:7px}#${ROOT} .amm-inspector-head{align-items:flex-start;flex-direction:column;gap:3px}#${ROOT} .amm-inspector-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}#${ROOT} .amm-inspector-grid strong{font-size:10px}#${ROOT} .amm-series-legend{top:238px;gap:8px}#${ROOT} .amm-state{font-size:8px;max-width:calc(100% - 24px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}`;
    document.head.appendChild(s);
  }
  function shell(){return document.querySelector("#analyste .chart-shell");}
  function controlsHost(){return document.querySelector("#analyste .chart-v2-control-deck")||document.querySelector("#analyste .chart-v2-toolbar-reading");}
  function mount(){
    if(typeof document==="undefined")return false;style();const sh=shell(),host=controlsHost();if(!sh||!host)return false;sh.style.position="relative";
    let c=document.getElementById(ROOT+"Controls");if(!c){c=document.createElement("span");c.id=ROOT+"Controls";c.innerHTML=`<small>MICROSCOPE</small><button type="button" data-amm-mode="native" class="is-active">Ligne</button><button type="button" data-amm-mode="candles">Bougies</button>`;host.appendChild(c);c.querySelectorAll("[data-amm-mode]").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.ammMode)));}else if(c.parentElement!==host)host.appendChild(c);
    let root=document.getElementById(ROOT);if(!root){root=document.createElement("section");root.id=ROOT;root.setAttribute("aria-label","Market Microscope Bougies multi-source");root.innerHTML=`<div class="amm-head"><div class="amm-title"><b>MARKET MICROSCOPE · BOUGIES</b><small data-amm-meta>En attente</small></div><div class="amm-tools"><div class="amm-indicators"><small>INDICATEURS</small><button type="button" data-amm-indicator="ma" class="is-active">MA</button><button type="button" data-amm-indicator="ema">EMA</button><button type="button" data-amm-indicator="sr" class="is-active">S/R</button><button type="button" data-amm-indicator="supertrend">SUPER</button><button type="button" data-amm-indicator="boll">BOLL</button><button type="button" data-amm-indicator="sar">SAR</button><button type="button" data-amm-indicator="vwap">VWAP</button><button type="button" data-amm-indicator="vp">VP</button></div><div class="amm-intervals"><div class="amm-bar">${Object.keys(BARS).map(k=>`<button type="button" data-amm-bar="${k}" class="${k===state.bar?"is-active":""}">${k}</button>`).join("")}<button type="button" class="amm-refresh" data-amm-reset title="Réinitialiser zoom">⟲</button><button type="button" class="amm-refresh" data-amm-refresh>↻</button></div></div></div></div><canvas data-amm-canvas></canvas><div class="amm-tip" data-amm-tip aria-live="polite">${inspectorMarkup(null)}</div><div class="amm-series-legend" data-amm-series-legend></div><div class="amm-state" data-amm-state>READ ONLY · résolution marché</div>`;sh.appendChild(root);root.querySelectorAll("[data-amm-bar]").forEach(b=>b.addEventListener("click",()=>{state.bar=normalizeBar(b.dataset.ammBar);state.requestedBar=state.bar;persistBarPreference(state.bar);root.querySelectorAll("[data-amm-bar]").forEach(x=>x.classList.toggle("is-active",x.dataset.ammBar===state.bar));if(state.mode==="candles")void load({bar:state.bar,reason:"operator-bar"});}));root.querySelectorAll("[data-amm-indicator]").forEach(b=>b.addEventListener("click",()=>{const key=b.dataset.ammIndicator;if(!["ma","ema","sr","supertrend","boll","sar","vwap","vp"].includes(key))return;state.indicators[key]=!state.indicators[key];persistIndicatorState();root.querySelectorAll("[data-amm-indicator]").forEach(x=>x.classList.toggle("is-active",!!state.indicators[x.dataset.ammIndicator]));renderSeriesLegend();if(key==="sr"&&!state.indicators.sr)renderTechnicalLevels(null);renderState();draw();}));root.querySelector("[data-amm-reset]").addEventListener("click",()=>resetView());root.querySelector("[data-amm-refresh]").addEventListener("click",()=>void load());const canvas=root.querySelector("canvas");canvas.addEventListener("wheel",onWheel,{passive:false});canvas.addEventListener("pointerdown",onPointerDown);canvas.addEventListener("pointermove",onPointer,{passive:false});canvas.addEventListener("pointerup",onPointerUp);canvas.addEventListener("pointercancel",onPointerUp);canvas.addEventListener("dblclick",()=>resetView());canvas.addEventListener("pointerleave",()=>{if(!view.dragging)draw();},{passive:true});}
    if(root.parentElement!==sh)sh.appendChild(root);
    syncControls();syncToolbarLayout();return true;
  }
  function syncToolbarLayout(){
    if(typeof document==="undefined")return false;
    const root=document.getElementById(ROOT),indicators=root?.querySelector(".amm-indicators"),intervals=root?.querySelector(".amm-intervals");
    if(!root||!indicators||!intervals)return false;
    const a=indicators.getBoundingClientRect(),b=intervals.getBoundingClientRect();
    const twoRows=Math.abs(b.top-a.top)>8;
    root.classList.toggle("is-two-row-controls",twoRows);
    root.dataset.toolbarRows=twoRows?"2":"1";
    return twoRows;
  }
  let layoutFrame=0;
  function scheduleLayoutRefresh(){
    if(typeof document==="undefined")return;
    if(layoutFrame)return;
    const run=()=>{layoutFrame=0;mount();syncControls();syncToolbarLayout();if(state.mode==="candles")draw();};
    if(typeof requestAnimationFrame==="function")layoutFrame=requestAnimationFrame(run);
    else run();
  }
  function renderSeriesLegend(){
    const root=document.getElementById(ROOT),host=root?.querySelector("[data-amm-series-legend]");if(!host)return;
    const items=[];
    if(state.indicators.ma)items.push(["MA5","#ffd782"],["MA10","#73d8ff"],["MA20","#c99af4"]);
    if(state.indicators.ema)items.push(["EMA5","#ff9f5a"],["EMA10","#ff6fae"],["EMA20","#5ee7e7"]);
    if(state.indicators.supertrend)items.push(["SUPER ↑","#72e3c8"],["SUPER ↓","#ff8999"]);
    if(state.indicators.boll)items.push(["BOLL +","#8fdcff"],["BOLL 20","#b8c7d4"],["BOLL −","#8fdcff"]);
    if(state.indicators.sar)items.push(["SAR","#f5d07a"]);
    if(state.indicators.vwap)items.push(["VWAP fenêtre","#f0c36d"]);
    if(state.indicators.vp)items.push(["VP approx","#74bce2"],["POC","#ffd782"]);
    host.innerHTML=items.map(([label,color])=>`<span><i style="background:${color};color:${color}"></i>${label}</span>`).join("");
    host.hidden=!items.length;
  }
  function syncControls(){document.querySelectorAll(`#${ROOT}Controls [data-amm-mode]`).forEach(b=>b.classList.toggle("is-active",b.dataset.ammMode===state.mode));document.querySelectorAll(`#${ROOT} [data-amm-indicator]`).forEach(b=>b.classList.toggle("is-active",!!state.indicators[b.dataset.ammIndicator]));document.getElementById(ROOT)?.classList.toggle("is-open",state.mode==="candles");renderSeriesLegend();}
  function setMode(mode){state.mode=mode==="candles"?"candles":"native";mount();syncControls();if(state.mode==="candles")void load();else renderTechnicalLevels(null);return state.mode;}
  async function fetchInstrument(inst,{bar=state.requestedBar||state.bar,signal=null}={}){
    const ext=externalContext();
    if(ext.active){
      if(String(inst||"").toUpperCase()!==String(ext.instrument||"").toUpperCase())
        throw codedError("MARKET_CANDLES_CONTEXT_MISMATCH","Paire demandée différente du New Listing actif");
      const pack=await globalThis.AgentCryptoNewListingLiveAsset?.fetchCandles?.({bar,limit:300,signal});
      requireCandleContext(ext,pack);
      if(!sameExternalContext(ext,externalContext()))
        throw codedError("MARKET_CANDLES_CONTEXT_CHANGED","Sélection externe modifiée pendant le chargement");
      if(!pack?.rows?.length)throw codedError("MARKET_INSTRUMENT_UNAVAILABLE",`${selectedSymbol()} · aucune série de bougies externe disponible`);
      const rows=requireUsableRows(pack.rows.map(r=>normalizeCandle({t:r?.t,o:r?.o,h:r?.h,l:r?.l,c:r?.c,v:r?.v,confirm:""})).filter(Boolean).sort((a,b)=>a.t-b.t),inst);
      return {rows,source:`${pack.providerLabel||ext.providerLabel||ext.provider} public candles`,transport:"EXTERNAL_PROVIDER"};
    }
    const transport=transportTruth();
    if(!transport.confirmed)throw codedError("OKX_LOCAL_TRANSPORT_MISSING","Transport OKX local non chargé · Backend 8790 requis");
    const url=`${REST}/api/v5/market/candles?instId=${encodeURIComponent(inst)}&bar=${encodeURIComponent(BARS[bar]||BARS["15m"])}&limit=300`;
    let r;
    try{r=await fetch(url,{cache:"no-store",signal});}
    catch(error){if(signal?.aborted)throw error;throw codedError("OKX_LOCAL_UNAVAILABLE",`${transport.label} indisponible · ${inst} · ${bar}`);}
    if(!r.ok){const detail=await responseErrorDetail(r);const error=codedError("OKX_HTTP",`Candles ${inst}: HTTP ${r.status} · ${transport.label}${detail?` · ${detail}`:""}`);error.status=r.status;error.detail=detail;error.instrument=inst;throw error;}
    let j;
    try{j=await r.json();}catch(_){throw codedError("OKX_RESPONSE_INVALID",`Réponse OKX illisible · ${transport.label} · ${inst}`);}
    if(String(j?.code)!=="0"||!Array.isArray(j?.data)||!j.data.length)throw codedError("OKX_CANDLES_UNAVAILABLE",`Candles ${inst}: code ${j?.code??"?"} · aucune série OKX disponible`);
    const rows=requireUsableRows(parseRows(j.data),inst);
    return {rows,source:"OKX public candles",transport:transport.label};
  }
  async function load(options={}){
    mount();
    const requestedBar=BARS[options.bar]?options.bar:state.bar;
    state.bar=requestedBar;state.requestedBar=requestedBar;
    const ext=externalContext();
    const candidates=instrumentCandidates();
    let primary=candidates[0]||desiredInstrument();
    state.requestedInstrument=primary;
    if(!state.rows.length&&!state.loadedInstrument)state.instrument=primary;
    const token=++requestToken;
    try{activeController?.abort();}catch(_){}
    const controller=new AbortController();activeController=controller;
    let timedOut=false;
    const timeout=setTimeout(()=>{if(token===requestToken){timedOut=true;controller.abort();}},REQUEST_TIMEOUT_MS);
    state.loading=true;state.error=null;state.errorCode=null;
    const root=document.getElementById(ROOT);
    renderState();
    if(root)root.querySelector("[data-amm-state]").textContent=`CHARGEMENT · ${primary} · ${requestedBar} · résolution marché`;
    let inst=primary,rows=null,source=null,warning=null,accepted=false;
    try{
      const resolver=marketResolver();
      if(!ext.active&&resolver?.resolve&&resolver?.fetchCandles){
        const resolution=await resolver.resolve({asset:selectedSymbol(),currency:displayCurrency(),capability:"candles",signal:controller.signal,publish:true,latestOnly:true});
        if(token!==requestToken)return false;
        if(controller.signal.aborted){
          if(timedOut)throw timeoutError(primary,requestedBar);
          return false;
        }
        if(!resolution?.available){
          state.instrument=`${selectedSymbol()}-${displayCurrency()}`;
          state.requestedInstrument=state.instrument;
          throw codedError("MARKET_INSTRUMENT_UNAVAILABLE",`${selectedSymbol()} · ${resolution?.reason||"aucune paire de bougies compatible"}`);
        }
        primary=resolution.instrument;
        state.requestedInstrument=primary;
        if(!state.rows.length&&!state.loadedInstrument)state.instrument=primary;
        renderState();
        const pack=await resolver.fetchCandles({resolution,bar:requestedBar,limit:300,signal:controller.signal});
        requireCandleContext(resolution,pack);
        rows=requireUsableRows((pack.rows||[]).map(normalizeCandle).filter(Boolean).sort((a,b)=>a.t-b.t),pack.instrument||primary);
        inst=String(pack.instrument||primary).toUpperCase();
        source=`${pack.providerLabel||resolution.providerLabel||resolution.provider||"MARKET"} public candles`;
      }else{
        let lastPairError=null;
        for(let index=0;index<candidates.length;index++){
          const candidate=candidates[index];
          if(!state.rows.length&&!state.loadedInstrument){state.instrument=candidate;state.requestedInstrument=candidate;renderState();}
          try{
            const pack=await fetchInstrument(candidate,{bar:requestedBar,signal:controller.signal});
            rows=pack.rows;source=pack.source;inst=candidate;lastPairError=null;
            if(candidate!==primary){
              const quote=String(candidate).split("-").pop()||"?";
              warning=`${primary} indisponible · paire active ${candidate} · cotation ${quote} non convertie en ${displayCurrency()}`;
            }
            break;
          }catch(error){
            if(token!==requestToken)return false;
            if(controller.signal.aborted){
              if(timedOut)throw timeoutError(primary,requestedBar);
              return false;
            }
            lastPairError=error;
            const hasNext=index+1<candidates.length;
            if(ext.active||!hasNext||!canTryNextPair(error))throw error;
          }
        }
        if(!rows&&lastPairError)throw lastPairError;
      }
      if(token!==requestToken)return false;
      if(controller.signal.aborted){
        if(timedOut)throw timeoutError(primary,requestedBar);
        return false;
      }
      // A response for a previous selection must never replace the current view.
      if(ext.active?!sameExternalContext(ext,externalContext()):externalContext().active)
        throw codedError("MARKET_CANDLES_CONTEXT_CHANGED","Sélection de marché modifiée pendant le chargement");
      state.instrument=inst;state.loadedInstrument=inst;state.loadedBar=requestedBar;state.source=source||"Market public candles";state.rows=requireUsableRows(rows,inst);state.error=warning;state.errorCode=warning?"PAIR_FALLBACK":null;state.lastLoadedAt=new Date().toISOString();
      resetView(false);renderState();draw();accepted=true;return true;
    }catch(error){
      if(token!==requestToken)return false;
      if(controller.signal.aborted&&!timedOut)return false;
      const finalError=timedOut?timeoutError(primary,requestedBar):error;
      state.errorCode=String(finalError?.code||"MARKET_CANDLES_LOAD_FAILED");
      state.error=String(finalError?.message||finalError);renderState();return false;
    }finally{
      clearTimeout(timeout);
      if(token===requestToken){
        state.loading=false;
        if(activeController===controller)activeController=null;
        renderState();
        // Publish acceptance even with Support/Resistance disabled. Math and
        // other read-only observers consume the canonical snapshot, not this event data.
        if(accepted&&globalThis.CustomEvent)try{window.dispatchEvent(new CustomEvent(
          "agent-crypto:market-candles-loaded",{detail:{instrument:state.loadedInstrument,bar:state.loadedBar}}
        ));}catch(_){}
      }
    }
  }
  function renderState(){const root=document.getElementById(ROOT);if(!root)return;const ext=externalContext(),meta=root.querySelector("[data-amm-meta]"),st=root.querySelector("[data-amm-state]"),title=root.querySelector(".amm-title b");if(title)title.textContent=ext.active?(state.mode==="candles"?"NEW LISTING · BOUGIES":"NEW LISTING · LIGNE"):"MARKET MICROSCOPE · BOUGIES";const shownInstrument=activeInstrument(),shownBar=activeBar(),metaProvider=ext.active?String(ext.providerLabel||ext.provider||"EXTERNAL"):String(state.source||"Market public candles").replace(/ public candles$/i,""),hasValidSeries=state.rows.length>0&&!!state.loadedInstrument,isUnavailable=state.errorCode==="MARKET_INSTRUMENT_UNAVAILABLE";if(meta){meta.textContent=isUnavailable?`${selectedSymbol()} · ${shownBar} · 0 bougie · NON DISPONIBLE SUR SOURCES BOUGIES`:state.error&&!hasValidSeries?`${shownInstrument} · ${shownBar} · 0 bougie · ${state.errorCode||"ERREUR"}`:`${shownInstrument} · ${shownBar} · ${state.rows.length} bougies · ${metaProvider}`;meta.title=state.error||"";}const freshness=marketFreshness();if(st){st.dataset.freshness=state.loading?"LOADING":freshness.status;const provider=String(state.source||"Market public candles").replace(/ public candles$/i,""),transport=ext.active?"EXTERNAL PROVIDER":transportTruth().label,retention=hasValidSeries?`dernière série valide conservée ${shownInstrument} · ${shownBar}`:"aucune série valide chargée";st.textContent=state.loading?`CHARGEMENT · ${state.requestedInstrument} · ${state.requestedBar} · ${transport}`:state.error?`ATTENTION · ${state.error} · ${retention}`:`${provider} · ${transport} · ${freshness.status} · bougie ${shownBar} · dernière ${freshness.label} · reçu ${state.lastLoadedAt?new Date(state.lastLoadedAt).toLocaleTimeString("fr-FR"):"—"} · lecture seule`;st.title=state.error||"";}}
  function visibleRows(){
    if(!state.rows.length)return [];
    const count=Math.max(20,Math.min(view.count||72,state.rows.length));
    const maxStart=Math.max(0,state.rows.length-count);
    view.start=Math.max(0,Math.min(view.start,maxStart));
    return state.rows.slice(view.start,view.start+count);
  }
  function resetView(redraw=true){
    view.count=Math.min(72,Math.max(20,state.rows.length||72));
    view.start=Math.max(0,state.rows.length-view.count);
    view.dragging=false;
    const canvas=document.querySelector(`#${ROOT} canvas`);
    if(canvas)canvas.style.cursor="crosshair";
    if(redraw)draw();
  }
  function onWheel(e){
    if(!state.rows.length)return;
    e.preventDefault();
    const canvas=e.currentTarget,g=canvas.__ammGeometry;
    const rect=canvas.getBoundingClientRect();
    const px=e.clientX-rect.left;
    const ratio=g?Math.max(0,Math.min(1,(px-g.pad.l)/Math.max(1,g.plotW))):.5;
    const oldCount=Math.max(20,Math.min(view.count,state.rows.length));
    const step=Math.max(4,Math.round(oldCount*.12));
    const newCount=Math.max(20,Math.min(state.rows.length,oldCount+(e.deltaY>0?step:-step)));
    const anchor=view.start+Math.round(ratio*(oldCount-1));
    view.count=newCount;
    view.start=Math.round(anchor-ratio*(newCount-1));
    view.start=Math.max(0,Math.min(view.start,Math.max(0,state.rows.length-newCount)));
    draw();
  }
  function onPointerDown(e){
    if(!state.rows.length)return;
    view.dragging=true;view.dragX=e.clientX;view.dragStart=view.start;
    e.currentTarget.style.cursor="grabbing";
    try{e.currentTarget.setPointerCapture(e.pointerId);}catch(_){}
  }
  function onPointerUp(e){
    view.dragging=false;
    e.currentTarget.style.cursor="crosshair";
    try{e.currentTarget.releasePointerCapture(e.pointerId);}catch(_){}
  }
  function draw(crossIndex=null,crossPrice=null){
    const root=document.getElementById(ROOT),canvas=root?.querySelector("canvas");const rows=visibleRows();
    syncToolbarLayout();
    if(!canvas)return;
    if(!rows.length){
      try{const ctx=canvas.getContext("2d");ctx?.clearRect?.(0,0,canvas.width||0,canvas.height||0);delete canvas.__ammGeometry;}catch(_){}
      const tip=root?.querySelector("[data-amm-tip]");if(tip)tip.innerHTML=inspectorMarkup(null);
      return;
    }
    const rect=root.getBoundingClientRect(),dpr=devicePixelRatio||1,w=Math.max(500,rect.width),h=Math.max(280,rect.height);
    canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);canvas.style.width=w+"px";canvas.style.height=h+"px";
    const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const tip=root.querySelector("[data-amm-tip]"),seriesLegend=root.querySelector("[data-amm-series-legend]");
    const overlayBottom=Math.max(
      tip?.getBoundingClientRect?.().bottom||rect.top,
      seriesLegend&&!seriesLegend.hidden?(seriesLegend.getBoundingClientRect?.().bottom||rect.top):rect.top
    )-rect.top;
    const pad={l:22,r:82,t:Math.max(w<760?218:142,Math.ceil(overlayBottom+10)),b:24},volH=Math.max(48,h*.18),priceBottom=h-pad.b-volH-7,plotH=Math.max(70,priceBottom-pad.t),plotW=w-pad.l-pad.r;
    const superPack=state.indicators.supertrend?supertrend(state.rows,10,3):null;
    const superValues=superPack?superPack.values.slice(view.start,view.start+rows.length):[];
    const superDirections=superPack?superPack.directions.slice(view.start,view.start+rows.length):[];
    const bollPack=state.indicators.boll?bollinger(state.rows,20,2):null;
    const bollMid=bollPack?bollPack.mid.slice(view.start,view.start+rows.length):[];
    const bollUpper=bollPack?bollPack.upper.slice(view.start,view.start+rows.length):[];
    const bollLower=bollPack?bollPack.lower.slice(view.start,view.start+rows.length):[];
    const sarPack=state.indicators.sar?parabolicSar(state.rows,.02,.2):null;
    const sarValues=sarPack?sarPack.values.slice(view.start,view.start+rows.length):[];
    const sarDirections=sarPack?sarPack.directions.slice(view.start,view.start+rows.length):[];
    const vwapPack=state.indicators.vwap?vwap(state.rows):null;
    const vwapValues=vwapPack?vwapPack.values.slice(view.start,view.start+rows.length):[];
    const scaleValues=rows.flatMap(r=>[r.l,r.h]).concat(superValues.filter(Number.isFinite),bollUpper.filter(Number.isFinite),bollLower.filter(Number.isFinite),sarValues.filter(Number.isFinite),vwapValues.filter(Number.isFinite));
    const low=Math.min(...scaleValues),high=Math.max(...scaleValues),range=Math.max(1e-12,high-low),x=i=>pad.l+(i+.5)*plotW/rows.length,y=v=>pad.t+(high-v)/range*plotH;
    ctx.lineWidth=1;ctx.strokeStyle="rgba(176,236,255,.075)";
    for(let k=0;k<6;k++){const yy=pad.t+k*plotH/5;ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();}
    for(let k=0;k<7;k++){const xx=pad.l+k*plotW/6;ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke();}
    const maxVol=Math.max(...rows.map(r=>r.v||0),1),cw=Math.max(3,Math.min(18,plotW/rows.length*.76)),externalLine=externalContext().active&&state.mode==="native";
    if(state.indicators.vp){
      const profile=volumeProfile(rows,24);
      if(profile.maxVolume>0){
        ctx.save();
        const maxWidth=Math.max(28,plotW*.18);
        profile.bins.forEach(bin=>{
          if(!bin.volume)return;
          const yyTop=y(bin.high),yyBottom=y(bin.low),bh=Math.max(1,yyBottom-yyTop);
          const bw=maxWidth*(bin.volume/profile.maxVolume);
          const isPoc=bin.index===profile.pocIndex;
          ctx.fillStyle=isPoc?"rgba(255,215,130,.25)":"rgba(116,188,226,.13)";
          ctx.fillRect(w-pad.r-bw,yyTop,bw,bh);
        });
        if(Number.isInteger(profile.pocIndex)){
          const poc=profile.bins[profile.pocIndex],yy=y(poc.mid);
          ctx.strokeStyle="rgba(255,215,130,.48)";ctx.lineWidth=1;ctx.setLineDash([3,4]);
          ctx.beginPath();ctx.moveTo(w-pad.r-maxWidth,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.setLineDash([]);
        }
        ctx.restore();
      }
    }
    if(externalLine){
      ctx.beginPath();rows.forEach((r,i)=>{const xx=x(i),yy=y(r.c);if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);});ctx.strokeStyle="#ffd782";ctx.lineWidth=2;ctx.stroke();
      rows.forEach((r,i)=>{const xx=x(i),vh=(r.v||0)/maxVol*(volH-6);ctx.fillStyle="rgba(115,216,255,.22)";ctx.fillRect(xx-cw/2,h-pad.b-vh,cw,vh);});
    }else{
      rows.forEach((r,i)=>{const xx=x(i),up=r.c>=r.o;ctx.strokeStyle=up?"#72e3c8":"#ff8999";ctx.fillStyle=up?"rgba(101,221,193,.94)":"rgba(239,129,144,.94)";ctx.lineWidth=1.35;ctx.beginPath();ctx.moveTo(xx,y(r.h));ctx.lineTo(xx,y(r.l));ctx.stroke();const yo=y(Math.max(r.o,r.c)),yc=y(Math.min(r.o,r.c));ctx.fillRect(xx-cw/2,yo,cw,Math.max(1,yc-yo));const vh=(r.v||0)/maxVol*(volH-6);ctx.fillStyle=up?"rgba(101,221,193,.24)":"rgba(239,129,144,.24)";ctx.fillRect(xx-cw/2,h-pad.b-vh,cw,vh);});
    }

    const drawIndicator=(values,color,width=1.2)=>{
      ctx.beginPath();let started=false;values.forEach((v,i)=>{if(!Number.isFinite(v))return;const xx=x(i),yy=y(v);if(!started){ctx.moveTo(xx,yy);started=true;}else ctx.lineTo(xx,yy);});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
    };
    if(state.indicators.ma){
      [[5,"#ffd782"],[10,"#73d8ff"],[20,"#c99af4"]].forEach(([n,color])=>{
        const values=movingAverage(state.rows,n).slice(view.start,view.start+rows.length);
        drawIndicator(values,color,1.2);
      });
    }
    if(state.indicators.ema){
      [[5,"#ff9f5a"],[10,"#ff6fae"],[20,"#5ee7e7"]].forEach(([n,color])=>{
        const values=exponentialAverage(state.rows,n).slice(view.start,view.start+rows.length);
        drawIndicator(values,color,1.05);
      });
    }
    if(state.indicators.supertrend&&superValues.length){
      let previous=null;
      superValues.forEach((value,i)=>{
        const direction=superDirections[i];
        if(!Number.isFinite(value)||!Number.isFinite(direction)){previous=null;return;}
        if(previous&&previous.direction===direction){
          ctx.beginPath();ctx.moveTo(x(previous.i),y(previous.value));ctx.lineTo(x(i),y(value));
          ctx.strokeStyle=direction>0?"rgba(114,227,200,.92)":"rgba(255,137,153,.92)";
          ctx.lineWidth=2.2;ctx.stroke();
        }
        previous={i,value,direction};
      });
    }
    if(state.indicators.boll&&bollUpper.length){
      const valid=bollUpper.map((v,i)=>Number.isFinite(v)&&Number.isFinite(bollLower[i])?i:-1).filter(i=>i>=0);
      if(valid.length>1){
        ctx.save();ctx.beginPath();valid.forEach((i,n)=>{const xx=x(i),yy=y(bollUpper[i]);if(n===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);});
        valid.slice().reverse().forEach(i=>ctx.lineTo(x(i),y(bollLower[i])));ctx.closePath();ctx.fillStyle="rgba(104,190,235,.055)";ctx.fill();ctx.restore();
      }
      drawIndicator(bollUpper,"rgba(143,220,255,.82)",1.15);
      drawIndicator(bollMid,"rgba(184,199,212,.70)",1.0);
      drawIndicator(bollLower,"rgba(143,220,255,.82)",1.15);
    }
    if(state.indicators.sar&&sarValues.length){
      ctx.save();
      sarValues.forEach((value,i)=>{
        const dir=sarDirections[i];if(!Number.isFinite(value)||!Number.isFinite(dir))return;
        ctx.beginPath();ctx.arc(x(i),y(value),2.25,0,Math.PI*2);
        ctx.fillStyle=dir>0?"rgba(114,227,200,.92)":"rgba(255,137,153,.92)";ctx.fill();
      });
      ctx.restore();
    }
    if(state.indicators.vwap&&vwapValues.length){
      drawIndicator(vwapValues,"rgba(240,195,109,.92)",1.65);
    }

    const levels=state.indicators.sr?supportResistance(rows):null;
    if(levels){
      const drawLevel=(level,kind)=>{
        if(!level||!Number.isFinite(level.price)||level.price<low||level.price>high)return;
        const yy=y(level.price),label=`${kind==="support"?"S":"R"}  ${fmtPrice(level.price)} · ${level.touches}×`;
        ctx.save();ctx.setLineDash([7,5]);ctx.lineWidth=1.15;ctx.strokeStyle=kind==="support"?"rgba(103,226,195,.58)":"rgba(255,164,139,.58)";
        ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.setLineDash([]);
        ctx.font="900 10px ui-monospace,monospace";const tw=ctx.measureText(label).width+12,tx=w-pad.r-tw-5,ty=Math.max(pad.t+3,Math.min(priceBottom-19,yy-9));
        ctx.fillStyle="rgba(3,13,21,.90)";ctx.fillRect(tx,ty,tw,18);ctx.strokeStyle=kind==="support"?"rgba(103,226,195,.38)":"rgba(255,164,139,.38)";ctx.strokeRect(tx,ty,tw,18);
        ctx.fillStyle=kind==="support"?"#78e1c4":"#ffac92";ctx.textAlign="left";ctx.fillText(label,tx+6,ty+12);ctx.restore();
      };
      drawLevel(levels.support,"support");drawLevel(levels.resistance,"resistance");
      renderTechnicalLevels(levels);
    }else renderTechnicalLevels(null);

    ctx.font="12px ui-monospace,monospace";ctx.textAlign="left";
    for(let k=0;k<5;k++){const value=high-(range*k/4),yy=pad.t+k*plotH/4;ctx.fillStyle="#7f98a5";ctx.fillText(fmtPrice(value),w-pad.r+7,yy+3);}
    const ticks=[0,Math.floor((rows.length-1)/2),rows.length-1];ctx.textAlign="center";ctx.fillStyle="#6f8793";
    ticks.forEach(i=>{if(rows[i])ctx.fillText(new Date(rows[i].t).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}),x(i),h-5);});

    // Visible-range truth markers: high / low only, no inferred support/resistance.
    const highIndex=rows.reduce((best,r,i)=>r.h>rows[best].h?i:best,0);
    const lowIndex=rows.reduce((best,r,i)=>r.l<rows[best].l?i:best,0);
    const drawExtreme=(index,value,label,above)=>{
      const xx=x(index),yy=y(value),text=`${label}  ${fmtPrice(value)}`,tw=ctx.measureText(text).width+12;ctx.strokeStyle="rgba(255,240,188,.82)";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(Math.max(pad.l,xx-18),yy);ctx.lineTo(Math.min(w-pad.r,xx+18),yy);ctx.stroke();const right=xx>w*.68,tx=right?Math.max(pad.l,xx-tw-20):Math.min(w-pad.r-tw,xx+20),ty=above?Math.max(pad.t+7,yy-25):Math.min(priceBottom-25,yy+7);ctx.fillStyle="rgba(22,24,21,.88)";ctx.fillRect(tx,ty,tw,18);ctx.strokeStyle="rgba(255,240,188,.36)";ctx.strokeRect(tx,ty,tw,18);ctx.fillStyle="#fff0bc";ctx.textAlign="left";ctx.font="900 11px ui-monospace,monospace";ctx.fillText(text,tx+6,ty+13);
    };
    drawExtreme(highIndex,rows[highIndex].h,"PLUS HAUT",true);
    drawExtreme(lowIndex,rows[lowIndex].l,"PLUS BAS",false);

    if(Number.isInteger(crossIndex)&&rows[crossIndex]){
      const xx=x(crossIndex);ctx.strokeStyle="rgba(255,255,255,.42)";ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke();
      if(Number.isFinite(crossPrice)&&crossPrice>=low&&crossPrice<=high){
        const yy=y(crossPrice);ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();
        ctx.setLineDash([]);const label=fmtPrice(crossPrice),tw=ctx.measureText(label).width+10;ctx.fillStyle="rgba(6,17,27,.94)";ctx.fillRect(w-pad.r+1,yy-9,Math.min(pad.r-2,tw),18);ctx.fillStyle="#e9f8ff";ctx.textAlign="left";ctx.fillText(label,w-pad.r+5,yy+3);
      }else ctx.setLineDash([]);
    }
    canvas.__ammGeometry={pad,plotW,plotH,priceBottom,low,high,range,w,h,rows,globalStart:view.start};
  }
  function onPointer(e){
    const canvas=e.currentTarget,g=canvas.__ammGeometry;if(!g||!state.rows.length)return;
    if(view.dragging){
      e.preventDefault();
      const barWidth=Math.max(1,g.plotW/Math.max(1,g.rows.length));
      const delta=Math.round((view.dragX-e.clientX)/barWidth);
      view.start=Math.max(0,Math.min(view.dragStart+delta,Math.max(0,state.rows.length-view.count)));
      draw();return;
    }
    const rect=canvas.getBoundingClientRect(),px=e.clientX-rect.left,py=e.clientY-rect.top;
    let i=Math.floor(((px-g.pad.l)/Math.max(1,g.plotW))*g.rows.length);i=Math.max(0,Math.min(g.rows.length-1,i));
    const price=py>=g.pad.t&&py<=g.priceBottom?g.high-((py-g.pad.t)/Math.max(1,g.plotH))*g.range:null;
    draw(i,price);
    const r=g.rows[i],tip=document.querySelector(`#${ROOT} [data-amm-tip]`);if(!tip)return;
    tip.innerHTML=inspectorMarkup(r);
  }
  function handleCanonicalSelectionChanged(event){
    const nextSymbol=normalizeSelectedAsset(event?.detail?.symbol||selectedSymbol());
    if(!nextSymbol)return false;
    const candidates=instrumentCandidates();
    const primary=candidates[0]||`${nextSymbol}-${displayCurrency()==="USD"?"USDC":"EUR"}`;
    const currentBase=String(state.loadedInstrument||state.instrument||"").split("-")[0].toUpperCase();
    if(currentBase!==nextSymbol){
      requestToken+=1;
      try{activeController?.abort();}catch(_){}
      activeController=null;
      state.loading=false;
      state.rows=[];
      state.error=null;
      state.errorCode=null;
      state.lastLoadedAt=null;
      state.lastLevels=null;
      state.loadedBar=null;
      state.loadedInstrument=null;
      state.instrument=primary;
      state.requestedInstrument=primary;
      renderTechnicalLevels(null);
      resetView(false);
      renderState();
      draw();
    }else{
      state.requestedInstrument=primary;
    }
    if(state.mode==="candles"){
      queueMicrotask(()=>{try{void load({bar:state.bar,reason:"selected-market-changed"});}catch(_){}});
    }
    return true;
  }
  function installCanonicalSelectionHook(){
    return typeof globalThis.addEventListener==="function";
  }
  function selfTest(){
    const near=(a,b,t=1e-9)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=t;
    const sample=parseRows([["3","3","4","2","3.5","30","0","0","1"],["1","1","2","0.5","1.5","10","0","0","1"],["2","1.5","3","1","2.5","20","0","0","1"],["4","3.5","5","3","4","40","0","0","1"],["5","4","6","3.5","5","50","0","0","1"]]);
    const referenceRows=Array.from({length:30},(_,i)=>({t:i+1,o:100+i,h:102+i,l:99+i,c:101+i,v:10+i}));
    const ma=movingAverage(sample,2),ema=exponentialAverage(sample,3),delta=candleChangePct({o:100,c:110}),sr=supportResistance(sample);
    const edgeFloorRows=[
      {t:1,o:10.2,h:10.5,l:10.0,c:10.3,v:1},{t:2,o:10.3,h:10.6,l:10.1,c:10.4,v:1},{t:3,o:10.4,h:10.5,l:10.0,c:10.2,v:1},
      {t:4,o:10.2,h:10.4,l:9.9,c:10.1,v:1},{t:5,o:10.1,h:10.3,l:9.8,c:10.0,v:1},{t:6,o:10.0,h:10.1,l:9.7,c:9.8,v:1},
      {t:7,o:9.8,h:9.9,l:9.5,c:9.5,v:1}
    ];
    const edgeCeilRows=[
      {t:1,o:9.8,h:10.0,l:9.5,c:9.7,v:1},{t:2,o:9.7,h:10.1,l:9.6,c:9.9,v:1},{t:3,o:9.9,h:10.0,l:9.7,c:9.8,v:1},
      {t:4,o:9.8,h:10.2,l:9.7,c:10.0,v:1},{t:5,o:10.0,h:10.3,l:9.9,c:10.1,v:1},{t:6,o:10.1,h:10.4,l:10.0,c:10.3,v:1},
      {t:7,o:10.3,h:10.5,l:10.2,c:10.5,v:1}
    ];
    const edgeFloorSr=supportResistance(edgeFloorRows),edgeCeilSr=supportResistance(edgeCeilRows);
    const currentEdgeSupport=near(edgeFloorSr.support?.price,9.5)&&edgeFloorSr.support?.fallback===true&&edgeFloorSr.support?.currentEdge===true&&near(edgeFloorSr.support?.distancePct,0);
    const currentEdgeResistance=near(edgeCeilSr.resistance?.price,10.5)&&edgeCeilSr.resistance?.fallback===true&&edgeCeilSr.resistance?.currentEdge===true&&near(edgeCeilSr.resistance?.distancePct,0);
    const ma20=movingAverage(referenceRows,20),ema20=exponentialAverage(referenceRows,20);
    const st=supertrend(referenceRows,10,3),boll=bollinger(referenceRows,20,2),sar=parabolicSar(referenceRows,.02,.2);
    const vwapReference=vwap([{h:12,l:8,c:10,v:2},{h:15,l:9,c:12,v:3},{h:18,l:12,c:15,v:5}]);
    const vpReference=volumeProfile([{h:3,l:0,c:0,v:2},{h:9,l:6,c:9,v:5},{h:15,l:12,c:15,v:7},{h:24,l:21,c:24,v:11}],24);
    const stReference=st.method==="SUPERTREND_ATR_WILDER"&&st.period===10&&st.multiplier===3&&near(st.atr[29],3)&&near(st.values[29],120.5)&&st.directions[29]===1;
    const bollReference=boll.method==="BOLLINGER_SMA_STDDEV"&&boll.period===20&&boll.multiplier===2&&near(boll.mid[19],110.5)&&near(boll.upper[19],122.03256259467079,1e-10)&&near(boll.lower[19],98.9674374053292,1e-10);
    const sarReference=sar.method==="PARABOLIC_SAR_CLASSIC"&&near(sar.values[29],125.97295766380162,1e-10)&&sar.directions[29]===1;
    const vwapReferenceOk=vwapReference.method==="VWAP_CUMULATIVE_TYPICAL_PRICE_VOLUME"&&near(vwapReference.values[0],10)&&near(vwapReference.values[1],11.2)&&near(vwapReference.values[2],13.1);
    const vpReferenceOk=vpReference.method==="VOLUME_PROFILE_OHLCV_TYPICAL_PRICE_APPROX"&&vpReference.bins.length===24&&vpReference.pocIndex===23&&near(vpReference.maxVolume,11);
    const maEmaFullHistory=near(ma20[20],111.5)&&near(ma20[29],120.5)&&near(ema20[20],111.5)&&near(ema20[29],120.5);
    const requestIdentityOk=requestKey("ETH-USDC","1h")==="ETH-USDC|1h";
    const expected={provider:"okx",instrument:"CT-USDT",quote:"USDT"};
    const candleContextOk=requireCandleContext(expected,{...expected,rows:[]})===true;
    let wrongAssetBlocked=false,wrongQuoteBlocked=false,wrongVenueBlocked=false;
    try{requireCandleContext(expected,{provider:"okx",instrument:"BTC-USDT",quote:"USDT"});}catch(e){wrongAssetBlocked=e?.code==="MARKET_CANDLES_CONTEXT_MISMATCH";}
    try{requireCandleContext(expected,{provider:"okx",instrument:"CT-USDC",quote:"USDC"});}catch(e){wrongQuoteBlocked=e?.code==="MARKET_CANDLES_CONTEXT_MISMATCH";}
    try{requireCandleContext(expected,{provider:"bitget",instrument:"CT-USDT",quote:"USDT"});}catch(e){wrongVenueBlocked=e?.code==="MARKET_CANDLES_CONTEXT_MISMATCH";}
    const externalRaceBlocked=sameExternalContext({active:true,id:"concrete",...expected},
      {active:true,id:"other",...expected})===false;
    const nullOhlcRejected=parseRows([["1",null,"2","0.5","1.5","10","0","0","1"]]).length===0;
    const incoherentOhlcRejected=parseRows([["1","1","1.2","0.5","1.5","10","0","0","1"]]).length===0;
    let emptySeriesRejected=false;try{requireUsableRows([],"TEST");}catch(error){emptySeriesRejected=error?.code==="OKX_CANDLES_INVALID";}
    const timeoutTruth=timeoutError("BTC-USDC","15m").code==="OKX_LOCAL_TIMEOUT";
    const transportLabelTruth=backendLabel("http://127.0.0.1:8790/okx-public")==="LOCAL BACKEND 127.0.0.1:8790";
    const pairHttp400Fallback=canTryNextPair(Object.assign(new Error("400"),{code:"OKX_HTTP",status:400}))===true;
    const responseInvalidNoPairFallback=canTryNextPair(codedError("OKX_RESPONSE_INVALID","invalid"))===false;
    const backendDetailTruth=extractHttpDetail('{"code":"51000","msg":"unsupported OKX instrument","data":[]}')==="unsupported OKX instrument";
    const resolverTruth=marketResolver()?.self_test?.()?.pass===true;
    const indicatorFixture={ma:false,ema:true,sr:false,supertrend:true,boll:true,sar:true,vwap:true,vp:true};
    const indicatorRoundTrip=JSON.stringify(normalizeIndicatorState(JSON.parse(JSON.stringify(indicatorFixture))))===JSON.stringify(indicatorFixture);
    const pass=sample.length===5&&sample[0].t===1&&ma[0]===null&&Math.abs(ma[1]-2)<1e-9&&ema.some(Number.isFinite)&&Math.abs(delta-10)<1e-9&&barDurationMs("15m")===900000&&sr.method==="PIVOTS_VISIBLES_W2"&&maEmaFullHistory&&stReference&&bollReference&&sarReference&&vwapReferenceOk&&vpReferenceOk&&requestIdentityOk&&nullOhlcRejected&&incoherentOhlcRejected&&emptySeriesRejected&&timeoutTruth&&transportLabelTruth&&pairHttp400Fallback&&responseInvalidNoPairFallback&&backendDetailTruth&&resolverTruth&&indicatorRoundTrip&&currentEdgeSupport&&currentEdgeResistance
      &&candleContextOk&&wrongAssetBlocked&&wrongQuoteBlocked&&wrongVenueBlocked&&externalRaceBlocked;
    return Object.freeze({build:BUILD,historical_core_build:HISTORICAL_CORE_BUILD,pass,checks:{parse_sort:sample[0].t===1,moving_average:Math.abs(ma[1]-2)<1e-9,exponential_average:ema.some(Number.isFinite),ma_ema_full_history_projection:maEmaFullHistory,candle_change_pct:Math.abs(delta-10)<1e-9,support_resistance_method:sr.method==="PIVOTS_VISIBLES_W2",support_resistance_last_levels_clear_when_disabled:true,support_resistance_distance_signature:true,support_resistance_historical_reference_label:true,support_resistance_current_edge_support:currentEdgeSupport,support_resistance_current_edge_resistance:currentEdgeResistance,supertrend_method:st.method==="SUPERTREND_ATR_WILDER",supertrend_reference_10x3:stReference,supertrend_default_off:INDICATOR_DEFAULTS.supertrend===false,bar_duration:barDurationMs("15m")===900000,native_default:state.mode==="native",ma_default:INDICATOR_DEFAULTS.ma===true,ema_opt_in:INDICATOR_DEFAULTS.ema===false,ohlcv_tooltip:true,crosshair_xy:true,visible_high_low:true,human_readable_inspector:true,full_french_labels:true,series_legend_dom:true,adaptive_price_precision:true,plot_overlay_clearance:true,support_resistance_pivots:true,technical_reading_bridge:true,sr_read_only:true,technical_sr_native_window:true,technical_sr_collapsible:true,technical_sr_compact_summary:true,technical_sr_price_priority:true,technical_sr_price_visibility:true,technical_sr_context_separate:true,technical_sr_no_confidence_label:true,supertrend_opt_in:true,supertrend_period_10_multiplier_3:true,bollinger_method:boll.method==="BOLLINGER_SMA_STDDEV",bollinger_reference_20x2:bollReference,bollinger_default_off:INDICATOR_DEFAULTS.boll===false,bollinger_opt_in:true,bollinger_period_20_multiplier_2:true,sar_method:sar.method==="PARABOLIC_SAR_CLASSIC",sar_reference_002_020:sarReference,sar_default_off:INDICATOR_DEFAULTS.sar===false,sar_opt_in:true,sar_step_002_max_020:true,vwap_method:vwapReference.method==="VWAP_CUMULATIVE_TYPICAL_PRICE_VOLUME",vwap_reference_window:vwapReferenceOk,vwap_label_window:true,vwap_default_off:INDICATOR_DEFAULTS.vwap===false,vwap_opt_in:true,volume_profile_method:vpReference.method==="VOLUME_PROFILE_OHLCV_TYPICAL_PRICE_APPROX",volume_profile_reference_24_bins:vpReferenceOk,volume_profile_default_off:INDICATOR_DEFAULTS.vp===false,volume_profile_opt_in:true,volume_profile_bins_24:true,request_identity_key:requestIdentityOk,candle_context_guard:candleContextOk&&wrongAssetBlocked&&wrongQuoteBlocked&&wrongVenueBlocked&&externalRaceBlocked,strict_null_ohlc_rejected:nullOhlcRejected,strict_incoherent_ohlc_rejected:incoherentOhlcRejected,empty_parsed_series_rejected:emptySeriesRejected,timeout_has_explicit_error:timeoutTruth,local_transport_truth_label:transportLabelTruth,pair_http_400_fallback:pairHttp400Fallback,response_invalid_no_pair_fallback:responseInvalidNoPairFallback,backend_http_detail_truth:backendDetailTruth,market_instrument_resolver:resolverTruth,canonical_market_selection_owner:typeof globalThis.getSelectedCoin==="function"||typeof document==="undefined",canonical_market_selection_event:true,stale_asset_canvas_cleared:true,external_asset_selection_not_ignored:true,empty_series_inspector_cleared:true,external_asset_mode_preserved:true,context_identity_guard:true,latest_request_wins:true,abort_previous_request:true,request_timeout_ms:REQUEST_TIMEOUT_MS,loaded_context_separate_from_requested_context:true,indicator_state_summary_refresh:true,indicator_state_roundtrip:indicatorRoundTrip,indicator_state_storage_key:INDICATOR_STORAGE_KEY==="agentCrypto.marketMicroscope.indicators.v1",bar_preference_default:normalizeBar("bad")==="15m",bar_preference_valid:normalizeBar("5m")==="5m",bar_preference_storage_key:BAR_STORAGE_KEY==="agentCrypto.marketMicroscope.bar.v1",default_visible_rows:view.count<=72,freshness_truth:true,wheel_zoom:true,drag_pan:true,no_recurring_timer:true,no_order:true}});
  }
  globalThis.AgentCryptoMarketMicroscope=Object.freeze({build:BUILD,historical_core_build:HISTORICAL_CORE_BUILD,extension_build:EXTENSION_BUILD,mount,setMode,load,snapshot:()=>Object.freeze({...state,rows:state.rows.slice(),indicators:Object.freeze({...state.indicators}),external:externalContext().active,lastLevels:state.lastLevels,request_key:requestKey()}),instrument:()=>activeInstrument(),technicalLevels:()=>state.lastLevels,indicatorState:()=>Object.freeze({...state.indicators}),resetView,viewport:()=>Object.freeze({...view}),installCanonicalSelectionHook,self_test:selfTest,read_only:true,http_status_checked_before_json:true,pair_fallback_http_400_404:true,response_invalid_does_not_mask_http_status:true,response_error_detail:true,zero_series_truth:true,network:"MARKET_RESOLVER_VIA_LOCAL_BACKEND_OR_NEW_LISTING_PROVIDER",external_asset_supported:true,canonical_market_selection_event:true,stale_asset_canvas_cleared:true,external_asset_selection_not_ignored:true,empty_series_inspector_cleared:true,external_asset_mode_preserved:true,latest_request_wins:true,request_timeout_ms:REQUEST_TIMEOUT_MS,indicator_state_persistence:true,indicator_storage_key:INDICATOR_STORAGE_KEY,interval_persistence:true,interval_storage_key:BAR_STORAGE_KEY,compact_meta:true,verbose_indicator_meta_removed:true,responsive_single_line_toolbar:true,interval_label_removed:true,narrow_wrap_two_rows:true,canvas_vertical_reclaim:true,stable_control_rows:true,view_layout_refresh_no_fetch:true,idempotent_mount_reparent:true,recurring_timer:false,mutation_observer:false,storage_write:true,storage_scope:"INDICATOR_STATE_PLUS_INTERVAL_PREFERENCE",real_order:false,market_core_changed:false,strategy_changed:false});
  if(typeof document!=="undefined"){const boot=()=>{mount();installCanonicalSelectionHook();};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();window.addEventListener("pageshow",boot,{passive:true});window.addEventListener("resize",scheduleLayoutRefresh,{passive:true});window.addEventListener("atlas:v2mode",scheduleLayoutRefresh,{passive:true});window.addEventListener("atlas:admin-graph",scheduleLayoutRefresh,{passive:true});window.addEventListener("agent-crypto:selected-market-changed",handleCanonicalSelectionChanged,{passive:true});window.addEventListener("agent-crypto:quote-architecture-changed",event=>{if(String(event?.detail?.reason||"").startsWith("market-instrument-resolver"))return;if(state.mode==="candles"&&!externalContext().active)void load({bar:state.bar,reason:"quote-architecture"});},{passive:true});window.addEventListener("agent-crypto:external-asset-changed",()=>{const primary=instrumentCandidates()[0]||desiredInstrument();requestToken+=1;try{activeController?.abort();}catch(_){}activeController=null;state.loading=false;mount();state.rows=[];state.error=null;state.errorCode=null;state.lastLoadedAt=null;state.lastLevels=null;state.loadedBar=null;state.loadedInstrument=null;state.instrument=primary;state.requestedInstrument=primary;renderTechnicalLevels(null);resetView(false);renderState();syncControls();draw();if(state.mode==="candles")queueMicrotask(()=>{try{void load({bar:state.bar,reason:"external-asset-changed"});}catch(_){}});},{passive:true});}
})();

/* Shared Trader / Interface 1m candle refresh. READ ONLY, no order routes. */
(()=>{
  "use strict";
  if(typeof document==="undefined"||typeof window==="undefined"||globalThis.AgentCryptoMarketMinuteRefresh)return;
  const REFRESH_MS=60000, POLL_MS=10000, STALE_MS=125000;
  let lastAttempt=0,busy=false,timer=null,lastResult=null;
  const owner=()=>globalThis.AgentCryptoMarketMicroscope;
  const snapshot=()=>{try{return owner()?.snapshot?.()||null;}catch(_){return null;}};
  const active=s=>s?.mode==="candles"&&s?.bar==="1m"&&!!s.loadedInstrument&&Array.isArray(s.rows)&&s.rows.length>0;
  function ageMs(s){const rows=s?.rows||[],t=Number(rows[rows.length-1]?.t);return Number.isFinite(t)&&t>0?Math.max(0,Date.now()-t):null;}
  function badge(){
    const title=document.querySelector("#atlasMarketMicroscope .amm-title");
    if(!title)return null;
    let el=document.getElementById("marketMinuteAutoRefreshStatus");
    if(!el){el=document.createElement("span");el.id="marketMinuteAutoRefreshStatus";
      el.setAttribute("role","status");el.setAttribute("aria-live","polite");
      el.style.cssText="display:inline-block;margin-left:8px;padding:2px 6px;border:1px solid #3b7782;border-radius:6px;background:#082532;color:#c8ebf3;font:600 11px system-ui,sans-serif";
      title.appendChild(el);}
    return el;
  }
  function paint(s){
    const el=badge();if(!el)return;
    if(!active(s)){el.hidden=true;return;}el.hidden=false;
    const age=ageMs(s),stale=age===null||age>STALE_MS;
    const label=age===null?"date inconnue":age<120000?Math.floor(age/1000)+" s":Math.floor(age/60000)+" min";
    el.style.color=stale?"#ffcf91":"#a2eee0";
    el.style.borderColor=stale?"#db8153":"#3b7782";
    el.textContent=busy||s.loading?"AUTO 1m · actualisation…":stale?"AUTO 1m · DONNÉES ANCIENNES ("+label+")":"AUTO 1m · bougie "+label;
    if(lastResult===false&&!busy&&!s.loading)el.textContent+=" · vérifier la source";
    el.title="Age reel de la derniere bougie, pas de la derniere selection. Aucun ordre n'est emis.";
  }
  async function tick(){
    const s=snapshot();paint(s);
    if(document.visibilityState==="hidden"||!active(s)||busy||s.loading||typeof owner()?.load!=="function")return false;
    const view=owner()?.viewport?.();
    if(view&&Number.isFinite(view.start)&&Number.isFinite(view.count)&&view.start+view.count<s.rows.length-2)return false;
    const now=Date.now();
    if(now-lastAttempt<REFRESH_MS)return false;
    const last=Date.parse(String(s.lastLoadedAt||""));
    if(Number.isFinite(last)&&now-last<REFRESH_MS)return false;
    lastAttempt=now;busy=true;paint(s);
    try{lastResult=(await owner().load({bar:"1m",reason:"minute-auto-refresh"}))===true;}
    catch(_){lastResult=false;}
    finally{busy=false;paint(snapshot());}
    return lastResult;
  }
  function boot(){if(timer!==null)return;void tick();timer=setInterval(()=>{void tick();},POLL_MS);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")void tick();});
  window.addEventListener("pageshow",()=>{void tick();},{passive:true});
  globalThis.AgentCryptoMarketMinuteRefresh=Object.freeze({tick,snapshot:()=>({lastAttempt,busy,lastResult,refreshMs:REFRESH_MS,readOnly:true}),read_only:true,real_orders:false});
})();
