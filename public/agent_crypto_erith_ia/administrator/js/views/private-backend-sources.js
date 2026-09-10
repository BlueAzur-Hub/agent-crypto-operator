/* Agent-Crypto @erith.IA — 40.4.62
   AETHER TRUST OPERATOR INTERACTION PRIORITY + BACKGROUND DEFER LOCK
   SOURCE INTELLIGENCE V1.3 · ADDRESS PROOF GATE · AUTO READ-ONLY · PRIVATE LOCAL BACKEND V1.4
   Binance direct EUR WebSocket stays primary runtime owner.
   Kraken + Coinbase remain loopback read-only controls.
   No timer, observer, storage write, wallet, order or trading endpoint. */
(()=>{
  "use strict";
  const BUILD="40.4.62";
  const API="http://127.0.0.1:8790";
  const BACKEND_SELECTOR='details[data-collapse-key="backend"]';
  const ASSETS=Object.freeze(["BTC","ETH","BNB","XRP","SOL"]);
  const COHERENT=0.25, WATCH=0.75;
  // 40.4.60: the backend cold path can legitimately outlive the old 6.5 s
  // browser deadline. Keep finite deadlines, but align them with the bounded
  // backend path instead of aborting a valid request before its HTTP 200.
  const CEX_TIMEOUT_MS=16000, CONTEXT_TIMEOUT_MS=32000;
  let mounted=false,inflight=null,lastHealth=null,lastQuotesPayload=null,lastTruth=null,lastContext=null,lastIntelligence=null;
  const operatorPriorityActive40461=()=>{try{return globalThis.ErithOperatorPriority40461?.active?.()===true;}catch(_){return false;}};

  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const num=value=>(value===null||value===undefined||value==="")?null:(Number.isFinite(Number(value))?Number(value):null);
  const eur=value=>{const n=num(value);return n===null?"—":new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:n<10?4:2}).format(n);};
  const pct=value=>{const n=num(value);return n===null?"—":`${n.toFixed(3)} %`;};
  const usd=value=>{const n=num(value);if(n===null)return "—";const abs=Math.abs(n);const compact=abs>=1e9?`${(n/1e9).toFixed(2)} Md$`:abs>=1e6?`${(n/1e6).toFixed(2)} M$`:abs>=1e3?`${(n/1e3).toFixed(1)} k$`:`${n.toFixed(abs<10?4:2)} $`;return compact;};
  const backendDetails=()=>document.querySelector(BACKEND_SELECTOR);
  const backendBody=()=>backendDetails()?.querySelector(":scope > .atlas-collapse-body")||backendDetails()?.querySelector(".atlas-collapse-body")||null;

  function shell(){return `
    <section class="private-backend-v1" id="privateBackendV1" data-build="${BUILD}" aria-labelledby="privateBackendTitle4054">
      <div class="private-backend-head"><div>
        <p class="eyebrow">SOURCE TRUTH CEX · READ ONLY</p>
        <h3 id="privateBackendTitle4054">Binance + Kraken + Coinbase · concordance EUR</h3>
        <p>Binance reste la cotation LIVE primaire. Kraken et Coinbase sont deux contrôles indépendants via le backend privé local.</p>
      </div><span class="pill warn" id="privateBackendStatus4053">NON TESTÉ</span></div>
      <div class="private-backend-actions">
        <button class="btn" type="button" id="privateBackendHealth4053">Tester backend</button>
        <button class="btn primary" type="button" id="privateBackendRefresh4053">Forcer Source Truth CEX</button>
        <span id="privateBackendDetail4053">Binance runtime + 127.0.0.1:8790 · AUTO borné · secours opérateur</span>
      </div>
      <div class="private-backend-source-grid" id="privateBackendSources4053" aria-live="polite">
        <article><span>Binance Direct</span><b>LIVE RUNTIME</b><small>Source primaire · WebSocket EUR</small></article>
        <article><span>Kraken Public</span><b>EN ATTENTE</b><small>Contrôle spot EUR</small></article>
        <article><span>Coinbase Exchange</span><b>EN ATTENTE</b><small>Contrôle market data EUR</small></article>
        <article><span>Contrat</span><b>READ ONLY</b><small>aucun prix canonique fabriqué</small></article>
      </div>
      <div class="private-backend-table-wrap"><table class="private-backend-table">
        <thead><tr><th>Actif</th><th>Binance LIVE</th><th>Kraken</th><th>Coinbase</th><th>Écart max</th><th>Verdict</th></tr></thead>
        <tbody id="privateBackendRows4053">${ASSETS.map(a=>`<tr><th>${a}</th><td>—</td><td>—</td><td>—</td><td>—</td><td>EN ATTENTE</td></tr>`).join("")}</tbody>
      </table></div>
      <p class="private-backend-note" id="privateBackendNote4053">La concordance compare des observations indépendantes ; Binance reste la source LIVE primaire d'Agent-Crypto et aucune médiane ne remplace son prix.</p>
      <section class="private-context-v2" id="privateDexDefiContext4055" aria-labelledby="privateDexDefiTitle4055">
        <div class="private-context-head"><div><p class="eyebrow">DEX / DEFI CONTEXT · READ ONLY</p><h4 id="privateDexDefiTitle4055">DEX Screener + GeckoTerminal + DefiLlama</h4><p>Contexte de liquidité et d'activité décentralisée séparé de la vérité CEX. Aucun prix DEX n'est promu prix canonique.</p></div><span class="pill warn" id="privateDexDefiStatus4055">NON LU</span></div>
        <div class="private-backend-actions"><button class="btn primary" type="button" id="privateDexDefiRefresh4055">Forcer contexte DEX / DeFi</button><span id="privateDexDefiDetail4055">À la demande · cache local 90 s · aucune boucle</span></div>
        <div class="private-defi-grid" id="privateDefiSummary4055"><article><span>DefiLlama</span><b>EN ATTENTE</b><small>DEX volume par chaîne</small></article><article><span>DEX Screener</span><b>EN ATTENTE</b><small>pool liquide découvert</small></article><article><span>GeckoTerminal</span><b>EN ATTENTE</b><small>pool liquide recoupé</small></article></div>
        <div class="private-backend-table-wrap"><table class="private-backend-table private-context-table"><thead><tr><th>Actif</th><th>DEX Screener</th><th>Liquidité</th><th>GeckoTerminal</th><th>Réserve</th><th>Rôle</th></tr></thead><tbody id="privateDexDefiRows4055">${ASSETS.map(a=>`<tr><th>${a}</th><td>—</td><td>—</td><td>—</td><td>—</td><td>CONTEXTE</td></tr>`).join("")}</tbody></table></div>
        <p class="private-backend-note">Découverte par symbole/pool : utile pour le contexte de liquidité, mais insuffisante pour prouver l'identité d'un actif. Binance/Kraken/Coinbase restent la couche CEX.</p>
      </section>
      <section class="private-intelligence-v1" id="privateSourceIntelligence4056" aria-labelledby="privateSourceIntelligenceTitle4056">
        <div class="private-context-head"><div><p class="eyebrow">SOURCE INTELLIGENCE V1.3 · ADDRESS PROOF GATE · AUTO READ ONLY</p><h4 id="privateSourceIntelligenceTitle4056">Fraîcheur · provenance · preuve adresse inter-source · anomalies</h4><p>Les pools DEX sont filtrés par chaîne + alias puis recoupés par adresse token entre fournisseurs quand disponible. Aucun prix canonique supplémentaire, aucune prévision, aucune exécution.</p></div><span class="pill warn" id="privateSourceIntelligenceStatus4056">EN ATTENTE</span></div>
        <div class="private-backend-actions"><button class="btn primary" type="button" id="privateSourceIntelligenceRefresh4056">Forcer actualisation</button><span id="privateSourceIntelligenceDetail4056">AUTO · démarrage borné + CURRENT fermé · bouton = secours manuel · Atlas lecture seule optionnelle</span></div>
        <div class="private-intelligence-grid" id="privateSourceIntelligenceGrid4056">
          <article><span>CEX</span><b>EN ATTENTE</b><small>concordance</small></article>
          <article><span>DEX</span><b>EN ATTENTE</b><small>couverture contexte</small></article>
          <article><span>Identité DEX</span><b>EN ATTENTE</b><small>adresse recoupée ou bornée</small></article>
          <article><span>Anomalies</span><b>EN ATTENTE</b><small>liquidité / réserve</small></article>
          <article><span>DeFi</span><b>EN ATTENTE</b><small>chaînes</small></article>
          <article><span>Fraîcheur</span><b>EN ATTENTE</b><small>âge maximal mesuré</small></article>
        </div>
        <p class="private-backend-note" id="privateSourceIntelligenceNote4056">PROUVÉE = même réseau autorisé + même adresse token observée par DEX Screener et GeckoTerminal. BORNÉE = chaîne + alias sans preuve d’adresse. INFORMATION MANQUANTE reste information manquante.</p>
      </section>
    </section>`;}

  function setStatus(text,tone="warn",detail=""){
    const badge=document.getElementById("privateBackendStatus4053");if(badge){badge.className=`pill ${tone}`;badge.textContent=text;}
    const d=document.getElementById("privateBackendDetail4053");if(d&&detail)d.textContent=detail;
  }
  async function getJson(path,timeoutMs=6500){
    const controller=new AbortController(),abort=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const r=await fetch(`${API}${path}`,{method:"GET",mode:"cors",cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer",signal:controller.signal,headers:{Accept:"application/json"}});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json();
    }finally{clearTimeout(abort);}
  }
  function renderHealth(data){
    lastHealth=data||null;
    const ready=data?.status==="ready"&&data?.read_only===true;
    setStatus(ready?"LOCAL READY":"À VÉRIFIER",ready?"ok":"warn",ready?`Backend ${data.version||"?"} · READ ONLY · ${data.cache_ttl_seconds||"?"} s cache`:"Réponse locale reçue mais contrat inattendu");
    const grid=document.getElementById("privateBackendSources4053");
    if(grid&&Array.isArray(data?.sources)){
      grid.innerHTML=`<article><span>Binance Direct</span><b>LIVE RUNTIME</b><small>Source primaire · WebSocket EUR</small></article>`+
        data.sources.map(src=>`<article><span>${esc(src.label||src.id)}</span><b>${esc(String(src.mode||"READ ONLY").toUpperCase())}</b><small>${esc(src.role||"")}</small></article>`).join("")+
        `<article><span>Contrat</span><b>READ ONLY</b><small>aucun endpoint trading</small></article>`;
    }
  }
  function providerQuote(asset,provider,quotes){return (quotes||[]).find(q=>q.asset===asset&&q.provider===provider&&q.status==="ok")||null;}
  function providerPrice(asset,provider,quotes){return num(providerQuote(asset,provider,quotes)?.price_eur);}
  function binance(asset){try{return globalThis.ErithCexPrimary4054?.quote?.(asset)||null;}catch{return null;}}
  function consensus(prices){
    const vals=prices.map(num).filter(v=>v!==null&&v>0);if(vals.length<2)return {providers:vals.length,spread_pct:null,verdict:"insufficient"};
    const mean=vals.reduce((a,b)=>a+b,0)/vals.length;const spread=mean?((Math.max(...vals)-Math.min(...vals))/mean*100):null;
    const verdict=spread!==null&&spread<=COHERENT?"coherent":spread!==null&&spread<=WATCH?"watch":"divergent";
    return {providers:vals.length,spread_pct:spread,verdict};
  }
  function renderQuotes(data,emit=true){
    lastQuotesPayload=data||null;
    const tbody=document.getElementById("privateBackendRows4053");
    const rows=data?.assets||[];let binanceOk=0,krakenOk=0,coinbaseOk=0;
    const truthAssets=ASSETS.map(asset=>{
      const row=rows.find(r=>r.asset===asset)||{},bq=binance(asset),bp=num(bq?.price_eur),kq=providerQuote(asset,"kraken",row.quotes),cq=providerQuote(asset,"coinbase",row.quotes),kp=num(kq?.price_eur),cp=num(cq?.price_eur);
      if(bp!==null)binanceOk+=1;if(kp!==null)krakenOk+=1;if(cp!==null)coinbaseOk+=1;
      const c=consensus([bp,kp,cp]);return {asset,binance:bp,kraken:kp,coinbase:cp,consensus:c,binance_source:bq?.source||null,observed:{binance_ms:num(bq?.observed_at_ms),kraken_utc:kq?.observed_at_utc||null,coinbase_utc:cq?.observed_at_utc||null}};
    });
    if(tbody)tbody.innerHTML=truthAssets.map(row=>{const verdict=String(row.consensus.verdict||"insufficient").toUpperCase();const cls=verdict==="COHERENT"?"is-ok":verdict==="WATCH"?"is-watch":verdict==="DIVERGENT"?"is-bad":"is-muted";return `<tr><th>${row.asset}</th><td>${eur(row.binance)}</td><td>${eur(row.kraken)}</td><td>${eur(row.coinbase)}</td><td>${pct(row.consensus.spread_pct)}</td><td><span class="${cls}">${esc(verdict)}</span></td></tr>`;}).join("");
    const providers=[binanceOk,krakenOk,coinbaseOk].filter(n=>n>0).length;
    setStatus(providers>=2?"CEX READY":"PARTIEL",providers>=2?"ok":"warn",`Binance ${binanceOk}/5 · Kraken ${krakenOk}/5 · Coinbase ${coinbaseOk}/5 · ${providers}/3 source(s)`);
    lastTruth=Object.freeze({schema:"agent_crypto_cex_source_truth_v1",build:BUILD,observed_at_utc:data?.observed_at_utc||new Date().toISOString(),primary:"binance",controls:Object.freeze(["kraken","coinbase"]),assets:Object.freeze(truthAssets.map(x=>Object.freeze(x))),canonical_price_created:false,financial_signal:false});
    const note=document.getElementById("privateBackendNote4053");if(note)note.textContent=`Source Truth CEX · écart cohérent ≤ ${COHERENT} % · surveillance ≤ ${WATCH} % · Binance reste primaire · aucune exécution.`;
    if(emit){try{document.dispatchEvent(new CustomEvent("erith:cex-source-truth",{detail:lastTruth}));}catch(_){}}
    renderSourceIntelligence(emit);
  }
  function contextPoolLabel(item){
    if(!item||item.status!=="ok")return "—";
    const chain=item.chain||item.network||"?",dex=item.dex||"pool",name=item.name||`${item.base_symbol||"?"}/${item.quote_symbol||"?"}`;
    return `${chain} · ${dex} · ${name}`;
  }
  function identityLabel(row){
    const identity=row?.identity||{},state=String(identity.status||"unavailable");
    if(state==="proved")return {text:"PROUVÉE",tone:"ok"};
    if(state==="bounded")return {text:"BORNÉE",tone:"ok"};
    if(state==="review")return {text:"REVOIR",tone:"warn"};
    if(state==="partial")return {text:"PARTIEL",tone:"warn"};
    return {text:"INDISP.",tone:"warn"};
  }
  function renderContext(data,emit=true){
    const tbody=document.getElementById("privateDexDefiRows4055");
    const rows=Array.isArray(data?.assets)?data.assets:[];let dsOk=0,gtOk=0,proved=0,bounded=0,reviews=0,mismatches=0,eligible=0;
    const renderedRows=ASSETS.map(asset=>{
      const row=rows.find(r=>r.asset===asset)||{},ds=row.dexscreener||{},gt=row.geckoterminal||{},identity=row.identity||{},label=identityLabel(row);
      if(ds.status==="ok")dsOk++;if(gt.status==="ok")gtOk++;if(identity.status==="proved")proved++;if(identity.status==="bounded")bounded++;if(identity.liquidity_review===true)reviews++;if(identity.address_mismatch===true)mismatches++;if(identity.atlas_eligible===true)eligible++;
      const ratio=num(identity.liquidity_ratio);const role=ratio!==null&&identity.liquidity_review?`${label.text} · ${ratio.toFixed(1)}×`:`${label.text}`;
      return `<tr><th>${asset}</th><td>${esc(contextPoolLabel(ds))}</td><td>${esc(usd(ds.liquidity_usd))}</td><td>${esc(contextPoolLabel(gt))}</td><td>${esc(usd(gt.reserve_usd))}</td><td><span class="${label.tone==="ok"?"is-ok":"is-muted"}">${esc(role)}</span></td></tr>`;
    }).join("");
    if(tbody)tbody.innerHTML=renderedRows;
    const llama=data?.defillama||{},chains=Array.isArray(llama.chains)?llama.chains:[];
    const summary=document.getElementById("privateDefiSummary4055");
    if(summary){
      const chainCards=chains.map(c=>`<article><span>DefiLlama · ${esc(c.chain)}</span><b>${esc(usd(c.dex_volume_24h_usd))}</b><small>volume DEX 24 h · contexte</small></article>`).join("");
      summary.innerHTML=chainCards+`<article><span>DEX Screener</span><b>${dsOk}/${ASSETS.length}</b><small>pools bornés trouvés</small></article><article><span>GeckoTerminal</span><b>${gtOk}/${ASSETS.length}</b><small>pools bornés recoupés</small></article><article><span>Identité</span><b>${proved}P + ${bounded}B</b><small>${mismatches} mismatch · ${reviews} anomalie(s)</small></article>`;
    }
    const status=document.getElementById("privateDexDefiStatus4055");if(status){status.className=`pill ${(bounded>0||chains.length)?"ok":"warn"}`;status.textContent=eligible===ASSETS.length&&!reviews&&!mismatches?"CONTEXT ÉLIGIBLE":"CONTEXT À RELIRE";}
    const detail=document.getElementById("privateDexDefiDetail4055");if(detail)detail.textContent=`DEX DS ${dsOk}/5 · GT ${gtOk}/5 · preuve ${proved}/5 · bornée ${bounded}/5 · éligible Atlas ${eligible}/5 · mismatch ${mismatches} · anomalies ${reviews} · DeFi ${chains.length}/3`;
    lastContext=data||null;
    if(emit){try{document.dispatchEvent(new CustomEvent("erith:dex-defi-context",{detail:data}));}catch(_){}}
    renderSourceIntelligence(emit);
  }

  function observedMs(value){if(value===null||value===undefined)return null;const n=Number(value);if(Number.isFinite(n)&&n>0)return n;const parsed=Date.parse(String(value));return Number.isFinite(parsed)?parsed:null;}
  function ageSeconds(value){const ms=observedMs(value);return ms===null?null:Math.max(0,Math.round((Date.now()-ms)/1000));}
  function freshnessText(seconds){if(seconds===null)return "—";if(seconds<60)return `${seconds}s`;if(seconds<3600)return `${Math.round(seconds/60)} min`;return `${(seconds/3600).toFixed(1)} h`;}
  function buildSourceIntelligence(){
    if(!lastTruth&&!lastContext)return null;
    const cexAssets=Array.isArray(lastTruth?.assets)?lastTruth.assets:[];
    const contextAssets=Array.isArray(lastContext?.assets)?lastContext.assets:[];
    const spreads=cexAssets.map(x=>num(x?.consensus?.spread_pct)).filter(x=>x!==null);
    const cexComparable=cexAssets.filter(x=>Number(x?.consensus?.providers||0)>=2).length;
    const dsOk=contextAssets.filter(x=>x?.dexscreener?.status==="ok").length;
    const gtOk=contextAssets.filter(x=>x?.geckoterminal?.status==="ok").length;
    const identityProved=contextAssets.filter(x=>x?.identity?.status==="proved").length;
    const identityBounded=contextAssets.filter(x=>x?.identity?.status==="bounded").length;
    const identityReview=contextAssets.filter(x=>x?.identity?.status==="review").length;
    const addressMismatch=contextAssets.filter(x=>x?.identity?.address_mismatch===true).length;
    const atlasEligible=contextAssets.filter(x=>x?.identity?.atlas_eligible===true).length;
    const liquidityReviews=contextAssets.filter(x=>x?.identity?.liquidity_review===true).length;
    const chains=Array.isArray(lastContext?.defillama?.chains)?lastContext.defillama.chains:[];
    const ages=[];
    cexAssets.forEach(x=>{const o=x?.observed||{};[o.binance_ms,o.kraken_utc,o.coinbase_utc].forEach(v=>{const a=ageSeconds(v);if(a!==null)ages.push(a);});});
    contextAssets.forEach(x=>{[x?.dexscreener?.observed_at_utc,x?.geckoterminal?.observed_at_utc].forEach(v=>{const a=ageSeconds(v);if(a!==null)ages.push(a);});});
    chains.forEach(x=>{const a=ageSeconds(x?.observed_at_utc);if(a!==null)ages.push(a);});
    const maxAge=ages.length?Math.max(...ages):null;
    const ready=cexComparable===ASSETS.length&&atlasEligible>=Math.max(1,ASSETS.length-1)&&addressMismatch===0&&chains.length>0;
    return Object.freeze({schema:"agent_crypto_source_intelligence_v3",build:BUILD,generated_at_utc:new Date().toISOString(),state:ready?"ready":"partial",cex:Object.freeze({primary:"binance",controls:Object.freeze(["kraken","coinbase"]),comparable_assets:cexComparable,total_assets:ASSETS.length,max_spread_pct:spreads.length?Math.max(...spreads):null}),dex:Object.freeze({dexscreener_ok:dsOk,geckoterminal_ok:gtOk,total_assets:ASSETS.length,context_only:true,identity_proved:identityProved,identity_bounded:identityBounded,identity_review:identityReview,address_mismatch:addressMismatch,atlas_eligible:atlasEligible,liquidity_review:liquidityReviews,address_level_proof:"INTER_PROVIDER_WHEN_AVAILABLE"}),defi:Object.freeze({chains_ok:chains.length,chains:Object.freeze(chains.map(x=>x.chain))}),freshness:Object.freeze({max_age_seconds:maxAge,samples:ages.length}),provenance:Object.freeze({spot_primary:"Binance direct EUR WebSocket",cex_controls:Object.freeze(["Kraken Public","Coinbase Exchange"]),dex_context:Object.freeze(["DEX Screener","GeckoTerminal"]),defi_context:"DefiLlama"}),rules:Object.freeze({canonical_price_created:false,dex_price_promoted:false,financial_signal:false,missing_data_fabricated:false,atlas_consumer_enabled:true,atlas_consumer_mode:"OPTIONAL_READ_ONLY_FILTERED",identity_level:"CHAIN_ALIAS_PLUS_INTER_PROVIDER_ADDRESS",address_level_identity_proof:"INTER_PROVIDER_WHEN_AVAILABLE",address_mismatch_excluded:true,liquidity_review_excluded:true,wrong_chain_symbol_collision_rejected:true})});
  }
  function renderSourceIntelligence(emit=true){
    const intel=buildSourceIntelligence();if(!intel)return null;lastIntelligence=intel;
    const badge=document.getElementById("privateSourceIntelligenceStatus4056");if(badge){badge.className=`pill ${intel.state==="ready"?"ok":"warn"}`;badge.textContent=intel.state==="ready"?"INTELLIGENCE FILTRÉE":"PARTIEL";}
    const grid=document.getElementById("privateSourceIntelligenceGrid4056");if(grid){grid.innerHTML=`<article><span>CEX</span><b>${intel.cex.comparable_assets}/${intel.cex.total_assets}</b><small>écart max ${pct(intel.cex.max_spread_pct)}</small></article><article><span>DEX</span><b>${intel.dex.dexscreener_ok}/${intel.dex.total_assets} + ${intel.dex.geckoterminal_ok}/${intel.dex.total_assets}</b><small>DS + GeckoTerminal</small></article><article><span>Identité DEX</span><b>${intel.dex.identity_proved}P + ${intel.dex.identity_bounded}B</b><small>${intel.dex.atlas_eligible}/${intel.dex.total_assets} éligibles Atlas</small></article><article><span>Anomalies</span><b>${intel.dex.liquidity_review}</b><small>ratio liquidité/réserve ≥ 20×</small></article><article><span>DeFi</span><b>${intel.defi.chains_ok}/3</b><small>${esc(intel.defi.chains.join(" · ")||"—")}</small></article><article><span>Fraîcheur</span><b>${freshnessText(intel.freshness.max_age_seconds)}</b><small>${intel.freshness.samples} observation(s) horodatée(s)</small></article>`;}
    const d=document.getElementById("privateSourceIntelligenceDetail4056");if(d)d.textContent=`CEX ${intel.cex.comparable_assets}/5 · preuve DEX ${intel.dex.identity_proved}/5 · bornée ${intel.dex.identity_bounded}/5 · éligible Atlas ${intel.dex.atlas_eligible}/5 · mismatch ${intel.dex.address_mismatch} · anomalies ${intel.dex.liquidity_review} · DeFi ${intel.defi.chains_ok}/3 · Atlas AUTO FILTRÉ READ ONLY`;
    if(emit){try{document.dispatchEvent(new CustomEvent("erith:source-intelligence",{detail:intel}));}catch(_){}}
    return intel;
  }

  async function refreshAll(options={}){
    if(options?.automatic===true&&operatorPriorityActive40461())return null;
    const quotes=await refresh();
    if(options?.automatic===true&&operatorPriorityActive40461())return null;
    const context=await refreshContext();
    if(options?.automatic===true&&operatorPriorityActive40461())return null;
    if(!quotes||!context)return renderSourceIntelligence();
    return renderSourceIntelligence();
  }

  async function refreshContext(){
    const badge=document.getElementById("privateDexDefiStatus4055");if(badge){badge.className="pill warn";badge.textContent="LECTURE…";}
    try{const data=await getJson(`/context?assets=${encodeURIComponent(ASSETS.join(","))}`,CONTEXT_TIMEOUT_MS);renderContext(data);return data;}catch(error){if(badge){badge.className="pill warn";badge.textContent="INDISPONIBLE";}const d=document.getElementById("privateDexDefiDetail4055");if(d)d.textContent=`Contexte DEX / DeFi indisponible · ${error?.name==="AbortError"?"timeout":String(error?.message||error)}`;return null;}
  }

  async function probe(){if(inflight)return inflight;setStatus("TEST…","warn","Connexion à 127.0.0.1:8790…");inflight=getJson("/health").then(data=>{renderHealth(data);return data;}).catch(error=>{setStatus("OFFLINE","warn",`Backend local indisponible · ${error?.name==="AbortError"?"timeout":String(error?.message||error)}`);return null;}).finally(()=>{inflight=null;});return inflight;}
  async function refresh(){setStatus("LECTURE…","warn","Binance LIVE + Kraken + Coinbase…");try{const data=await getJson(`/quotes?assets=${encodeURIComponent(ASSETS.join(","))}`,CEX_TIMEOUT_MS);renderQuotes(data);return data;}catch(error){setStatus("INDISPONIBLE","warn",`Lecture sources impossible · ${error?.name==="AbortError"?"timeout":String(error?.message||error)}`);return null;}}
  const AUTO_MIN_INTERVAL_MS=240000;
  const AUTO_STARTUP_RETRY_MS=Object.freeze([5000,15000,30000]);
  const autoState={started:false,running:false,lastRunAt:0,lastSuccessAt:0,lastReason:"",lastFingerprint:"",retryTimer:0,pending:null};
  function autoSnapshot(){return Object.freeze({started:autoState.started,running:autoState.running,last_run_at:autoState.lastRunAt||null,last_success_at:autoState.lastSuccessAt||null,last_reason:autoState.lastReason||null,last_fingerprint:autoState.lastFingerprint||null,min_interval_ms:AUTO_MIN_INTERVAL_MS,polling:false});}
  async function autoRefresh(reason="automatic",options={}){
    const fingerprint=String(options?.fingerprint||"").trim();
    if(fingerprint&&fingerprint===autoState.lastFingerprint&&lastIntelligence)return lastIntelligence;
    if(operatorPriorityActive40461()){autoState.pending={reason,fingerprint};return null;}
    if(autoState.running){autoState.pending={reason,fingerprint};return lastIntelligence;}
    const now=Date.now();
    if(options?.force!==true&&autoState.lastSuccessAt&&(now-autoState.lastSuccessAt)<AUTO_MIN_INTERVAL_MS)return lastIntelligence;
    autoState.running=true;autoState.lastRunAt=now;autoState.lastReason=String(reason||"automatic");
    try{
      const health=await getJson("/health",3500);
      if(health?.status!=="ready"||health?.read_only!==true)return null;
      if(operatorPriorityActive40461()){autoState.pending={reason,fingerprint};return null;}
      const truthBefore=lastTruth,contextBefore=lastContext;
      const intel=await refreshAll({automatic:true});
      const truthFresh=!!lastTruth&&lastTruth!==truthBefore;
      const contextFresh=!!lastContext&&lastContext!==contextBefore;
      // 40.4.60: a partial timeout must not count as startup success and suppress
      // the bounded +5 s / +15 s / +30 s recovery window for four minutes.
      if(intel&&truthFresh&&contextFresh){autoState.lastSuccessAt=Date.now();if(fingerprint)autoState.lastFingerprint=fingerprint;try{document.dispatchEvent(new CustomEvent("erith:source-intelligence-auto",{detail:{reason:autoState.lastReason,fingerprint:fingerprint||null,intelligence:intel}}));}catch(_){}return intel;}
      return null;
    }catch(_){return null;}
    finally{
      autoState.running=false;
      const pending=autoState.pending;autoState.pending=null;
      if(pending)window.setTimeout(()=>void autoRefresh(pending.reason,{fingerprint:pending.fingerprint,force:true}),250);
    }
  }
  function scheduleStartupRetry(index){
    if(index>=AUTO_STARTUP_RETRY_MS.length||autoState.lastSuccessAt)return false;
    if(operatorPriorityActive40461()){autoState.pending={reason:"startup-retry",fingerprint:""};return true;}
    if(autoState.retryTimer)window.clearTimeout(autoState.retryTimer);
    autoState.retryTimer=window.setTimeout(async()=>{autoState.retryTimer=0;const intel=await autoRefresh("startup-retry",{force:true});if(!intel)scheduleStartupRetry(index+1);},AUTO_STARTUP_RETRY_MS[index]);
    return true;
  }
  function startAutomatic(){
    if(autoState.started)return false;autoState.started=true;
    const first=async()=>{if(operatorPriorityActive40461()){autoState.pending={reason:"startup",fingerprint:""};return;}const intel=await autoRefresh("startup",{force:true});if(!intel)scheduleStartupRetry(0);};
    if(typeof window.requestIdleCallback==="function")window.requestIdleCallback(()=>void first(),{timeout:2500});
    else window.setTimeout(()=>void first(),900);
    return true;
  }
  function mount(){if(mounted&&document.getElementById("privateBackendV1"))return true;const body=backendBody();if(!body)return false;if(!document.getElementById("privateBackendV1"))body.insertAdjacentHTML("beforeend",shell());document.getElementById("privateBackendHealth4053")?.addEventListener("click",probe);document.getElementById("privateBackendRefresh4053")?.addEventListener("click",refresh);document.getElementById("privateDexDefiRefresh4055")?.addEventListener("click",refreshContext);document.getElementById("privateSourceIntelligenceRefresh4056")?.addEventListener("click",refreshAll);mounted=true;
    // TRUE-LAZY replay: automatic collection may finish before Backend/API exists.
    // Repaint already collected state without refetching or re-emitting consumers.
    if(lastHealth)renderHealth(lastHealth);
    if(lastQuotesPayload)renderQuotes(lastQuotesPayload,false);
    if(lastContext)renderContext(lastContext,false);
    else if(lastIntelligence)renderSourceIntelligence(false);
    if(!lastHealth)probe();
    return true;}
  function bind(){const detail=backendDetails();if(!detail)return false;if(detail.dataset.privateBackend4054!=="1"){detail.dataset.privateBackend4054="1";detail.addEventListener("toggle",()=>{if(detail.open)mount();});}if(detail.open)mount();return true;}
  bind();
  // 40.4.55 canonical System true-lazy handoff: system-presentation replaces the
  // backend body only after its asynchronous hydration completes. Re-mount the
  // Source Truth panel after that owner signals the real body is resident.
  window.addEventListener("erith:system-hydrated",event=>{
    if(String(event?.detail?.key||"")!=="backend")return;
    mounted=false;
    bind();
    mount();
  });
  // Compatibility with same-node residency restoration. The lifecycle event is
  // non-bubbling, so bind directly on the backend <details> when available.
  const detail=backendDetails();
  detail?.addEventListener("erith:presentation-resident",()=>{mounted=false;bind();if(detail.open)mount();});
  window.addEventListener("erith:operator-priority-release",()=>{
    const pending=autoState.pending;autoState.pending=null;
    if(!pending&&!autoState.started)return;
    const reason=pending?.reason||(!autoState.lastSuccessAt?"operator-release-startup":"");
    if(!reason)return;
    const run=async()=>{const intel=await autoRefresh(reason,{fingerprint:pending?.fingerprint||"",force:true});if(!intel&&!autoState.lastSuccessAt)scheduleStartupRetry(0);};
    if(typeof window.requestIdleCallback==="function")window.requestIdleCallback(()=>void run(),{timeout:2500});
    else window.setTimeout(()=>void run(),900);
  });
  document.addEventListener("agentcrypto:current-finalized",event=>{
    const fingerprint=String(event?.detail?.fingerprint||"").trim();
    void autoRefresh("current-finalized",{fingerprint,force:true});
  });
  startAutomatic();
  globalThis.ErithPrivateBackendSources4054=Object.freeze({build:BUILD,backend_version:"1.4.0",api:API,mode:"READ_ONLY",mount,probe,refresh,refreshContext,refreshAll,autoRefresh,automationSnapshot:autoSnapshot,snapshot:()=>lastTruth,contextSnapshot:()=>lastContext,sourceIntelligence:()=>lastIntelligence,system_hydration_rebind:true,automatic_startup:true,automatic_current_finalized:true,operator_click_required:false,polling:false,bounded_startup_retry:true,cold_path_timeout_aligned:true,lazy_state_replay:true,operator_priority_aware:true,operator_priority_build:"40.4.62",cex_timeout_ms:CEX_TIMEOUT_MS,context_timeout_ms:CONTEXT_TIMEOUT_MS,new_observer:false,storage_owner_added:false,trade_endpoint:false,canonical_price_created:false,atlas_consumer_enabled:true,atlas_consumer_mode:"OPTIONAL_READ_ONLY_FILTERED"});
})();
