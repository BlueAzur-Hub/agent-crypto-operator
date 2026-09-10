(() => {
  "use strict";
  const BUILD = "40.4.229";
  const DEPTH_LEVEL = 203;
  const SHORT_PERIODS = Object.freeze(["7j","30j","90j","1a"]);
  const LONG_PERIODS = Object.freeze(["5a","10a","max"]);
  const ALL_PERIODS = Object.freeze([...SHORT_PERIODS, ...LONG_PERIODS]);
  const DOMAINS = Object.freeze({
    metals: Object.freeze({title:"Métaux", min:199, accent:"gold", source:"Yahoo Finance Futures + Gold API (spot séparé)"}),
    indices: Object.freeze({title:"Indices / Bourse", min:200, accent:"violet", source:"Yahoo Finance chart endpoint"}),
    energy: Object.freeze({title:"Énergie & matières premières", min:201, accent:"orange", source:"Yahoo Finance Futures"}),
    "cross-market": Object.freeze({title:"Cross-Market Observatory", min:202, accent:"silver", source:"Archives canoniques + historique long aligné"})
  });
  const state = {domain:"crypto", open:false, metals:new Map(), json:new Map(), pending:new Map(), requestedPeriod:null};
  const byId = id => document.getElementById(id);
  const safe = v => String(v ?? "");
  const esc = v => safe(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const finite = v => Number.isFinite(Number(v)) ? Number(v) : null;
  const pct = v => Number.isFinite(v) ? `${v >= 0 ? "+" : ""}${v.toFixed(2)} %` : "—";
  const num = (v,d=2) => Number.isFinite(v) ? Number(v).toLocaleString("fr-FR",{maximumFractionDigits:d}) : "—";
  const periodLabel = p => p === "max" ? "MAX" : p;
  const featureEnabled = domain => !!DOMAINS[domain] && DEPTH_LEVEL >= DOMAINS[domain].min;

  function ensureHost(){
    const root = byId("analyste");
    if(!root) return null;
    let host = byId("atlasMarketReadingDepth404199");
    if(!host){
      host = document.createElement("section");
      host.id = "atlasMarketReadingDepth404199";
      host.className = "atlas-market-reading-depth-404199";
      host.hidden = true;
      host.innerHTML = `
        <header class="atlas-market-reading-head-404199">
          <div><small>ERITH.IA · MARKET READING DEPTH</small><strong data-reading-title>Lecture profonde</strong><span data-reading-subtitle>Mesures explicables · observation seulement</span></div>
          <div class="atlas-market-reading-actions-404199"><span data-reading-build>Build ${BUILD}</span><button type="button" data-reading-toggle aria-expanded="false">Ouvrir la lecture détaillée</button></div>
        </header>
        <div class="atlas-market-reading-preview-404199" data-reading-preview>Couche froide · aucun historique supplémentaire chargé.</div>
        <div class="atlas-market-reading-body-404199" data-reading-body hidden></div>`;
      root.appendChild(host);
      host.addEventListener("click", onHostClick);
    }
    return host;
  }

  function currentPeriod(domain){
    if(state.requestedPeriod && ALL_PERIODS.includes(state.requestedPeriod)) return state.requestedPeriod;
    if(domain === "metals"){
      const active = document.querySelector('#atlasMetalsUnifiedToolbar [data-metals-period].is-active, #atlasMetalsUnifiedToolbar [data-metals-period].active, #atlasMetalsUnifiedToolbar [data-metals-period][aria-pressed="true"]');
      return active?.getAttribute("data-metals-period") || "1a";
    }
    try{
      const snap = globalThis.ErithParallelMarketsRuntime?.snapshot?.(domain);
      if(snap?.period) return snap.period;
    }catch(_){}
    return domain === "cross-market" ? "90j" : "1a";
  }

  function renderShell(domain){
    const host = ensureHost(); if(!host) return;
    const cfg = DOMAINS[domain];
    const enabled = featureEnabled(domain);
    host.hidden = !enabled;
    host.dataset.domain = enabled ? domain : "none";
    if(!enabled) return;
    host.querySelector("[data-reading-title]").textContent = `Lecture profonde · ${cfg.title}`;
    host.querySelector("[data-reading-subtitle]").textContent = DEPTH_LEVEL >= 203 ? "Historical Math Core · mesures explicables · aucune prévision" : "Mesures explicables · texte déterministe · aucune prévision";
    host.querySelector("[data-reading-build]").textContent = `Build ${BUILD}`;
    const p = currentPeriod(domain);
    const preview = host.querySelector("[data-reading-preview]");
    if(preview) preview.innerHTML = `<b>${esc(cfg.title)}</b><span>Fenêtre active : ${esc(periodLabel(p))}</span><span>Source : ${esc(cfg.source)}</span><span>Lazy : profondeur chargée seulement à l’appel</span>`;
    const toggle = host.querySelector("[data-reading-toggle]");
    if(toggle){ toggle.setAttribute("aria-expanded", state.open ? "true":"false"); toggle.textContent = state.open ? "Replier la lecture" : "Ouvrir la lecture détaillée"; }
    const body = host.querySelector("[data-reading-body]");
    if(body) body.hidden = !state.open;
  }

  function parsePoint(row){
    if(Array.isArray(row)){
      const time = row[0], close = finite(row[1]);
      return close === null ? null : {time, close};
    }
    if(!row || typeof row !== "object") return null;
    const close = finite(row.close ?? row.price ?? row.value ?? row.c ?? row.last);
    const time = row.time ?? row.date ?? row.timestamp ?? row.t;
    return close === null || time === undefined || time === null ? null : {time, close};
  }

  function extractAssets(payload){
    if(!payload || typeof payload !== "object") return [];
    for(const key of ["assets","metals","series","data"]){
      if(Array.isArray(payload[key]) && payload[key].length && typeof payload[key][0] === "object") return payload[key];
    }
    return [];
  }

  function extractRows(asset){
    if(!asset || typeof asset !== "object") return [];
    for(const key of ["history_points","daily","points","history","series","values"]){
      const rows = asset[key];
      if(Array.isArray(rows)) return rows.map(parsePoint).filter(Boolean).sort((a,b)=>new Date(a.time)-new Date(b.time));
    }
    return [];
  }

  function filterPeriod(rows, period){
    if(!rows.length || LONG_PERIODS.includes(period) || period === "1a") return rows;
    const days = period === "7j" ? 7 : period === "30j" ? 30 : period === "90j" ? 90 : 370;
    const last = new Date(rows[rows.length-1].time).getTime();
    const cut = last - days*86400000;
    return rows.filter(r => new Date(r.time).getTime() >= cut);
  }

  function metrics(rows){
    if(!Array.isArray(rows) || rows.length < 2) return {change:null,volatility:null,drawdown:null,amplitude:null,cagr:null,recoveryDays:null,position:null,points:rows?.length||0};
    const values = rows.map(r=>finite(r.close)).filter(v=>v!==null && v>0);
    if(values.length < 2) return {change:null,volatility:null,drawdown:null,amplitude:null,cagr:null,recoveryDays:null,position:null,points:values.length};
    const first=values[0], last=values[values.length-1];
    const change=((last/first)-1)*100;
    const returns=[]; let peak=values[0], peakIndex=0, worst=0, worstPeakIndex=0, troughIndex=0, low=values[0], high=values[0];
    for(let i=1;i<values.length;i++){
      const cur=values[i], prev=values[i-1];
      if(prev>0) returns.push((cur/prev)-1);
      if(cur>peak){ peak=cur; peakIndex=i; }
      const dd=peak>0 ? (cur/peak)-1 : 0;
      if(dd<worst){ worst=dd; worstPeakIndex=peakIndex; troughIndex=i; }
      low=Math.min(low,cur); high=Math.max(high,cur);
    }
    let vol=null;
    if(returns.length>1){ const mean=returns.reduce((a,b)=>a+b,0)/returns.length; vol=Math.sqrt(returns.reduce((a,b)=>a+(b-mean)**2,0)/(returns.length-1))*100; }
    let recoveryDays=null;
    const priorPeak=values[worstPeakIndex];
    for(let i=troughIndex+1;i<values.length;i++){ if(values[i]>=priorPeak){ const a=new Date(rows[troughIndex].time).getTime(), b=new Date(rows[i].time).getTime(); if(Number.isFinite(a)&&Number.isFinite(b)) recoveryDays=Math.round((b-a)/86400000); break; } }
    const startMs=new Date(rows[0].time).getTime(), endMs=new Date(rows[rows.length-1].time).getTime();
    const years=(endMs-startMs)/(365.2425*86400000);
    const cagr=years>=1 && first>0 && last>0 ? ((last/first)**(1/years)-1)*100 : null;
    const position=high>low ? ((last-low)/(high-low))*100 : 50;
    return {change,volatility:vol,drawdown:worst*100,amplitude:low>0?((high/low)-1)*100:null,cagr,recoveryDays,position,points:rows.length,first,last,low,high,firstTime:rows[0].time,lastTime:rows[rows.length-1].time};
  }

  function snapshotFromAssets(domain, period, payload, assets){
    const out=[];
    for(const asset of assets){
      const all=extractRows(asset), rows=filterPeriod(all,period); if(rows.length<2) continue;
      out.push({asset_id:safe(asset.asset_id||asset.id||asset.symbol||asset.name),name:safe(asset.name||asset.label||asset.symbol||asset.asset_id),symbol:safe(asset.symbol||asset.provider_symbol||asset.asset_id),provider_symbol:safe(asset.provider_symbol||asset.symbol),currency:safe(asset.currency||asset.unit||""),instrument_type:safe(asset.instrument_type||""),series:rows,metric:metrics(rows)});
    }
    return {loaded:true,domain,period,source:safe(payload?.source?.name||payload?.source||DOMAINS[domain]?.source),resolution:safe(payload?.resolution||payload?.source_interval||""),generated_at:payload?.generated_at||payload?.timestamp||null,assets:out,assets_count:out.length};
  }

  async function fetchJson(url){
    const key=`fetch:${url}`;
    if(state.json.has(key)) return Promise.resolve(state.json.get(key));
    if(state.pending.has(key)) return state.pending.get(key);
    const promise=fetch(`${url}${url.includes("?")?"&":"?"}v=${encodeURIComponent(BUILD)}`,{cache:"default",credentials:"same-origin"}).then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();}).then(payload=>{state.json.set(key,payload);return payload;}).finally(()=>state.pending.delete(key));
    state.pending.set(key,promise); return promise;
  }

  async function metalsSnapshot(period, forceLoad=true){
    const key=`metals:${period}`;
    if(state.metals.has(key)) return state.metals.get(key);
    if(!forceLoad) return {loaded:false,domain:"metals",period};
    let payload;
    if(LONG_PERIODS.includes(period)) payload=await fetchJson(`../data/metals/history_long/${period}.json`);
    else payload=await fetchJson("../data/metals/history/public_1y.json");
    const snap=snapshotFromAssets("metals",period,payload,extractAssets(payload));
    state.metals.set(key,snap); return snap;
  }

  async function parallelSnapshot(domain, period, forceLoad=true){
    const rt=globalThis.ErithParallelMarketsRuntime;
    if(!rt?.snapshot) return {loaded:false,domain,period,error:"runtime snapshot indisponible"};
    let snap=rt.snapshot(domain,period);
    if(!snap?.loaded && forceLoad && LONG_PERIODS.includes(period) && rt.ensureHistorical){
      try{ snap=await rt.ensureHistorical(domain,period); }catch(error){ return {loaded:false,domain,period,error:safe(error?.message||error)}; }
    }
    return snap || {loaded:false,domain,period};
  }

  function getSnapshot(domain, period, forceLoad=true){
    return domain === "metals" ? metalsSnapshot(period,forceLoad) : parallelSnapshot(domain,period,forceLoad);
  }

  function ranked(snapshot){
    return (snapshot?.assets||[]).filter(a=>Number.isFinite(a?.metric?.change)).slice().sort((a,b)=>b.metric.change-a.metric.change);
  }

  function summaryText(domain,snapshot){
    const rows=ranked(snapshot); if(!rows.length) return "Données mesurées insuffisantes pour produire une lecture synthétique.";
    const leader=rows[0], lag=rows[rows.length-1], spread=leader.metric.change-lag.metric.change;
    const base=`Sur ${periodLabel(snapshot.period)}, ${leader.name} mène le panier à ${pct(leader.metric.change)}, tandis que ${lag.name} est en retrait à ${pct(lag.metric.change)}. La dispersion mesurée atteint ${num(spread)} points.`;
    if(domain==="metals") return `${base} Les historiques longs sont des futures continus ; la cotation spot reste une source séparée.`;
    if(domain==="indices") return `${base} La comparaison Base 100 mesure des trajectoires relatives ; elle ne neutralise ni les devises ni la composition propre de chaque indice.`;
    if(domain==="energy") return `${base} WTI et Brent décrivent le pétrole ; Natural Gas reste une série distincte et n’est pas agrégé artificiellement au pétrole.`;
    return `${base} Le panier mélange des familles d’actifs différentes ; corrélation et co-mouvement ne valent pas causalité.`;
  }

  function structureHtml(domain){
    const blocks={
      metals:[["Or / Argent","Métaux précieux · monétaire/refuge et usages industriels distincts."],["Platine / Palladium","Métaux précieux à forte composante industrielle."],["Cuivre","Métal industriel · cycle de production et demande physique distincts."]],
      indices:[["CAC 40","Grandes capitalisations françaises · EUR."],["S&P 500","Large marché actions américain · USD."],["Nasdaq-100","Grandes valeurs non financières du Nasdaq · exposition technologique forte."],["DAX","Grandes capitalisations allemandes · EUR."],["Nikkei 225","Actions japonaises · JPY."]],
      energy:[["WTI","Pétrole brut de référence nord-américain · future continu."],["Brent","Pétrole brut de référence international · future continu."],["Natural Gas","Gaz naturel · future continu · dynamique distincte du pétrole."]],
      "cross-market":[["BTC","Actif numérique."],["XAU","Or · composante refuge / métal précieux."],["S&P 500","Actions américaines."],["Brent","Énergie / pétrole."],["HG","Cuivre · activité industrielle."]]
    };
    return `<div class="atlas-reading-structure-404199">${(blocks[domain]||[]).map(([a,b])=>`<article><b>${esc(a)}</b><span>${esc(b)}</span></article>`).join("")}</div>`;
  }

  function measurementTable(snapshot){
    const rows=(snapshot?.assets||[]).map(a=>`<tr><th>${esc(a.symbol||a.name)}<small>${esc(a.name)}</small></th><td>${pct(a.metric.change)}</td><td>${pct(a.metric.volatility)}</td><td>${pct(a.metric.drawdown)}</td><td>${pct(a.metric.amplitude)}</td><td>${a.metric.points||0}</td></tr>`).join("");
    return rows ? `<div class="atlas-reading-table-wrap-404199"><table><thead><tr><th>Actif</th><th>Variation</th><th>Volatilité/session</th><th>Max drawdown</th><th>Amplitude</th><th>Obs.</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<p>Données insuffisantes.</p>`;
  }

  function mathTable(snapshot){
    if(DEPTH_LEVEL < 203) return "";
    const rows=(snapshot?.assets||[]).map(a=>`<tr><th>${esc(a.symbol||a.name)}</th><td>${pct(a.metric.cagr)}</td><td>${pct(a.metric.drawdown)}</td><td>${a.metric.recoveryDays==null?"Non récupéré / n.a.":`${a.metric.recoveryDays} j`}</td><td>${num(a.metric.position,1)} %</td><td>${num(a.metric.points,0)}</td></tr>`).join("");
    return `<details class="atlas-reading-detail-404199" open><summary>Historical Math Core · fenêtre active</summary><div class="atlas-reading-table-wrap-404199"><table><thead><tr><th>Actif</th><th>CAGR*</th><th>Max DD</th><th>Récupération après creux</th><th>Position dans l’amplitude</th><th>Obs.</th></tr></thead><tbody>${rows}</tbody></table></div><small>* CAGR uniquement lorsque la fenêtre mesurée couvre au moins un an. Aucune extrapolation.</small></details>`;
  }

  function periodRow(period,snapshot,current){
    if(snapshot?.loaded){
      const r=ranked(snapshot), leader=r[0], lag=r[r.length-1];
      return `<tr data-period="${esc(period)}"><th>${esc(periodLabel(period))}${period===current?" · ACTIF":""}</th><td>${leader?`${esc(leader.symbol||leader.name)} ${pct(leader.metric.change)}`:"—"}</td><td>${lag?`${esc(lag.symbol||lag.name)} ${pct(lag.metric.change)}`:"—"}</td><td>${leader&&lag?`${num(leader.metric.change-lag.metric.change)} pt`:"—"}</td><td>${snapshot.assets_count||0}</td></tr>`;
    }
    return `<tr data-period="${esc(period)}"><th>${esc(periodLabel(period))}</th><td colspan="3">Non résident · lazy</td><td><button type="button" data-reading-load-period="${esc(period)}">Charger</button></td></tr>`;
  }

  function bucketKey(value,period){
    const d=new Date(value); if(!Number.isFinite(d.getTime())) return null;
    if(period==="max") return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
    const day=(d.getUTCDay()+6)%7; const monday=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-day));
    return monday.toISOString().slice(0,10);
  }

  function pearson(a,b){
    if(a.length!==b.length || a.length<3) return null;
    const ma=a.reduce((x,y)=>x+y,0)/a.length, mb=b.reduce((x,y)=>x+y,0)/b.length;
    let nume=0,da=0,db=0; for(let i=0;i<a.length;i++){const x=a[i]-ma,y=b[i]-mb;nume+=x*y;da+=x*x;db+=y*y;}
    return da>0&&db>0?nume/Math.sqrt(da*db):null;
  }

  function correlationHtml(snapshot){
    if(DEPTH_LEVEL < 202 || snapshot?.domain!=="cross-market" || !snapshot?.loaded) return "";
    const assets=snapshot.assets||[], rows=[];
    for(let i=0;i<assets.length;i++) for(let j=i+1;j<assets.length;j++){
      const left=new Map(assets[i].series.map(p=>[bucketKey(p.time,snapshot.period),p.close]).filter(x=>x[0]));
      const right=new Map(assets[j].series.map(p=>[bucketKey(p.time,snapshot.period),p.close]).filter(x=>x[0]));
      const keys=[...left.keys()].filter(k=>right.has(k)).sort();
      const ra=[],rb=[]; for(let k=1;k<keys.length;k++){const l0=left.get(keys[k-1]),l1=left.get(keys[k]),r0=right.get(keys[k-1]),r1=right.get(keys[k]);if(l0>0&&l1>0&&r0>0&&r1>0){ra.push((l1/l0)-1);rb.push((r1/r0)-1);}}
      const c=pearson(ra,rb); if(c!==null) rows.push(`<tr><th>${esc(assets[i].symbol)} / ${esc(assets[j].symbol)}</th><td>${c.toFixed(3)}</td><td>${ra.length}</td></tr>`);
    }
    return `<details class="atlas-reading-detail-404199" open><summary>Corrélations · dates communes</summary><div class="atlas-reading-table-wrap-404199"><table><thead><tr><th>Paire</th><th>Pearson</th><th>Retours alignés</th></tr></thead><tbody>${rows.join("")||'<tr><td colspan="3">Couverture commune insuffisante.</td></tr>'}</tbody></table></div><small>Corrélation ≠ causalité. Calcul sur rendements de périodes alignées uniquement.</small></details>`;
  }

  async function horizonSnapshots(domain,current){
    const out=new Map();
    for(const p of SHORT_PERIODS){ try{out.set(p,await getSnapshot(domain,p,domain==="metals"));}catch(_){out.set(p,{loaded:false,domain,period:p});} }
    for(const p of LONG_PERIODS){
      if(p===current){ try{out.set(p,await getSnapshot(domain,p,true));}catch(_){out.set(p,{loaded:false,domain,period:p});} }
      else { try{out.set(p,await getSnapshot(domain,p,false));}catch(_){out.set(p,{loaded:false,domain,period:p});} }
    }
    return out;
  }

  async function hydrate(domain,periodOverride=null){
    const host=ensureHost(), body=host?.querySelector("[data-reading-body]");
    if(!host||!body||!featureEnabled(domain)||!state.open) return;
    const cfg=DOMAINS[domain], period=periodOverride||currentPeriod(domain);
    state.requestedPeriod=period;
    body.innerHTML=`<div class="atlas-reading-loading-404199">Lecture mesurée · ${esc(cfg.title)} · ${esc(periodLabel(period))}…</div>`;
    let snapshot;
    try{ snapshot=await getSnapshot(domain,period,true); }catch(error){ snapshot={loaded:false,domain,period,error:safe(error?.message||error)}; }
    if(state.domain!==domain || !state.open) return;
    const horizons=await horizonSnapshots(domain,period);
    const source=snapshot?.source||cfg.source;
    const generated=snapshot?.generated_at ? new Date(snapshot.generated_at).toLocaleString("fr-FR") : "—";
    body.innerHTML=`
      <section class="atlas-reading-hero-404199"><small>LECTURE SYNTHÉTIQUE · ${esc(periodLabel(period))}</small><p>${esc(summaryText(domain,snapshot))}</p><div><span>${snapshot?.assets_count||0} séries mesurées</span><span>${esc(source)}</span><span>Généré : ${esc(generated)}</span><span>Aucune prévision</span></div></section>
      <details class="atlas-reading-detail-404199" open><summary>Mesures de la fenêtre active</summary>${measurementTable(snapshot)}</details>
      <details class="atlas-reading-detail-404199" open><summary>Mémoire multi-horizon · lazy</summary><div class="atlas-reading-table-wrap-404199"><table><thead><tr><th>Horizon</th><th>Leader</th><th>Retard</th><th>Dispersion</th><th>Couverture</th></tr></thead><tbody>${ALL_PERIODS.map(p=>periodRow(p,horizons.get(p),period)).join("")}</tbody></table></div><small>Les longues fenêtres non résidentes ne sont chargées qu’après action explicite.</small></details>
      <details class="atlas-reading-detail-404199" open><summary>Structure du panier</summary>${structureHtml(domain)}</details>
      ${correlationHtml(snapshot)}
      ${mathTable(snapshot)}
      <details class="atlas-reading-detail-404199"><summary>Source Truth · méthode · limites</summary><div class="atlas-reading-limits-404199"><p><b>Base 100 :</b> comparaison relative depuis le premier point de la fenêtre ; ce n’est pas un prix absolu.</p><p><b>Historique :</b> les futures continus restent explicitement distincts du spot et peuvent refléter les mécanismes de roll du fournisseur.</p><p><b>Devises :</b> aucune conversion implicite n’est appliquée pour rendre artificiellement les séries comparables.</p><p><b>Décision :</b> observation seulement · aucune recommandation · aucune exécution · décision humaine uniquement.</p></div></details>`;
    host.dataset.hydratedPeriod=period;
  }

  async function onHostClick(event){
    const toggle=event.target instanceof Element ? event.target.closest("[data-reading-toggle]") : null;
    if(toggle){ state.open=!state.open; state.requestedPeriod=null; renderShell(state.domain); if(state.open) await hydrate(state.domain); return; }
    const load=event.target instanceof Element ? event.target.closest("[data-reading-load-period]") : null;
    if(load){ const p=load.getAttribute("data-reading-load-period"); if(!ALL_PERIODS.includes(p))return; load.disabled=true; load.textContent="Chargement…"; try{await getSnapshot(state.domain,p,true); await hydrate(state.domain,state.requestedPeriod||currentPeriod(state.domain));}finally{load.disabled=false;} }
  }

  function sync(domain){
    state.domain=domain; state.requestedPeriod=null; renderShell(domain); if(state.open&&featureEnabled(domain)) hydrate(domain);
  }

  document.addEventListener("erith:market-domain-change", event=>sync(event?.detail?.domain||document.documentElement.dataset.cyclicMarketDomain||"crypto"));
  document.addEventListener("click", event=>{
    if(!state.open || !featureEnabled(state.domain)) return;
    const button=event.target instanceof Element ? event.target.closest("[data-metals-period],[data-parallel-period],[data-parallel-long-period]") : null;
    if(!button) return;
    const p=button.getAttribute("data-metals-period")||button.getAttribute("data-parallel-period")||button.getAttribute("data-parallel-long-period");
    if(!p) return;
    state.requestedPeriod=p;
    requestAnimationFrame(()=>hydrate(state.domain,p));
  });
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>sync(document.documentElement.dataset.cyclicMarketDomain||"crypto"),{once:true}); else sync(document.documentElement.dataset.cyclicMarketDomain||"crypto");

  globalThis.ErithMarketReadingDepth = Object.freeze({build:BUILD,depth_level:DEPTH_LEVEL,lazy:true,new_timer:false,new_observer:false,orders_allowed:false,refresh:()=>hydrate(state.domain)});
})();
