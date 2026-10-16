/* Seven Heaven · Trader dossier PAPER : lecture seule des proprietaires existants.
   Zero ordre, fetch, stockage, score ou moteur parallele. */
(()=>{"use strict";
const ID="traderPaperPreparation",byId=id=>document.getElementById(id);
const safe=(fn,f=null)=>{try{return typeof fn==="function"?fn():f}catch(_){return f}};
const label=v=>v===null||v===undefined||String(v).trim()===""?"Non disponible":String(v);
const currency=()=>safe(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot,null)?.displayCurrency==="EUR"?"EUR":"USD";
const when=v=>{const n=typeof v==="number"?v:Date.parse(String(v??""));return Number.isFinite(n)&&n>0?new Date(n).toLocaleString("fr-FR",{timeZone:"UTC",dateStyle:"short",timeStyle:"short"})+" UTC":"Inconnue"};
const coin=()=>{const c=safe(globalThis.getSelectedCoin,null);return c&&typeof c.id==="string"&&c.id&&typeof c.symbol==="string"?c:null};
function chartEvidence(c,u){
 let chart=null;try{chart=typeof state!=="undefined"?state?.dataBroker?.chart:null}catch(_){}
 if(!chart||chart.status!=="ready"||chart.coinId!==c?.id||chart.result?.blocked)return{qualified:false,reason:"Graphique indisponible pour cet actif"};
 const r=chart.result||{},raw=String(r.currency||r.quoteCurrency||"").toUpperCase();
 const p=Number(chart.period||0),expected="single:"+c.id+":"+p+(u==="USD"?":USD":"");
 if(String(chart.contextKey||"")!==expected||(raw&&raw!==u))return{qualified:false,reason:"Contexte devise, actif ou periode non concordant"};
 if(!Array.isArray(r.series)||r.series.length<2)return{qualified:false,reason:"Historique natif incomplet"};
 const rows=r.series.filter(v=>Array.isArray(v)&&v.length>=2&&Number.isFinite(v[0])&&v[0]>0&&Number.isFinite(v[1])&&v[1]>0);
 if(rows.length<2||rows.some((v,i)=>i>0&&v[0]<=rows[i-1][0]))return{qualified:false,reason:"Points historiques non qualifies"};
 const source=String(r.source||chart.source||"").trim();
 if(!/binance|coingecko/i.test([source,r.sourceFamily,chart.source].join(" ")))return{qualified:false,reason:"Provenance non qualifiee"};
 return{qualified:true,source:label(source),currency:u,points:rows.length,period:p,
   first:rows[0][0],last:rows[rows.length-1][0],generatedAt:r.generatedAt||chart.seriesTimestamp||null,
   isCache:/cache/i.test(source)};
}

function timeMs(value){const n=typeof value==="number"?value:Date.parse(String(value||""));return Number.isFinite(n)&&n>0?n:null;}
function pairParts(value){
 const match=String(value||"").trim().toUpperCase().replace("_","-").match(/^([A-Z0-9]+)[/-]([A-Z0-9]+)$/);
 return match?{asset:match[1],quote:match[2]}:null;
}
function candlesEvidence(c){
 const api=globalThis.AgentCryptoMarketMicroscope, row=safe(api?.snapshot,null);
 if(!c)return{ready:false,reason:"Aucun actif selectionne"};
 if(!row)return{ready:false,reason:"Lecteur Bougies non charge"};
 const pair=pairParts(row.loadedInstrument),symbol=String(c.symbol||"").toUpperCase();
 if(!pair||pair.asset!==symbol)return{ready:false,reason:"Bougies non synchronisees avec "+symbol};
 if(!Array.isArray(row.rows)||row.rows.length<2)return{ready:false,reason:"Bougies absentes"};
 if(row.loading)return{ready:false,reason:"Bougies en chargement"};
 return{ready:true,instrument:row.loadedInstrument,bar:label(row.loadedBar),count:row.rows.length,source:label(row.source),
   updatedAt:row.lastLoadedAt||null,hasError:!!row.error,warning:row.error?String(row.error):null};
}
function bookEvidence(c){
 const api=globalThis.AgentCryptoOkxMicrostructure,row=safe(api?.snapshot,null);
 if(!c)return{ready:false,reason:"Aucun actif selectionne"};
 if(!row)return{ready:false,reason:"Carnet OKX non charge"};
 const symbol=String(c.symbol||"").toUpperCase();
 const pair=pairParts(row.pair),base=String(row.loadedAsset||"").toUpperCase();
 const quote=String(row.loadedQuote||"").toUpperCase();
 if(!pair||pair.asset!==symbol||base!==symbol||pair.quote!==quote)
   return{ready:false,reason:"Carnet indisponible pour "+symbol+" (paire non concordante)"};
 if(!row.bids?.length||!row.asks?.length)return{ready:false,reason:"Carnet vide"};
 const age=timeMs(row.sourceObservedAt||row.capturedAt);
 const max=Number(api.validation_contract?.fresh_max_age_ms);
 const within=age!==null&&Number.isFinite(max)&&max>0&&Date.now()-age>=-2000&&Date.now()-age<=max;
 if(String(row.freshness||"").toUpperCase()!=="FRESH"||!within)
   return{ready:false,reason:"Carnet conserve mais fraicheur non prouvee",instrument:row.pair,quote};
 return{ready:true,instrument:row.pair,quote,bids:row.bids.length,asks:row.asks.length,
   provider:label(row.provider),sourceAt:row.sourceObservedAt||row.capturedAt,ageMs:Date.now()-age};
}
function gateEvidence(){
 const canonical=safe(globalThis.AgentCryptoStrategyAGateCanonicalTruth?.snapshot,null);
 if(canonical?.available===true&&Array.isArray(canonical.rows)){
   const unresolved=canonical.rows.filter(r=>!["PASS","FOUNDATION_PASS"].includes(String(r.state||"").toUpperCase()));
   return{available:true,source:"Gate Canonical Truth",state:label(canonical.state),
     count:canonical.rows.length,unresolved:unresolved.length,
     rows:canonical.rows.map(r=>({id:r.gate??null,state:label(r.state),owner:label(r.owner)}))};
 }
 const direct=safe(globalThis.AgentCryptoStrategyASafetyCertification?.certification_matrix,null);
 const evidence=safe(globalThis.AgentCryptoStrategyAEvidenceDossier?.snapshot,null);
 const rows=Array.isArray(direct?.gates)?direct.gates:Array.isArray(evidence?.certification?.gates)?evidence.certification.gates:null;
 if(rows){
   const source=Array.isArray(direct?.gates)?"Safety Certification · matrice canonique":"Evidence Dossier · matrice";
   return{available:true,source,state:"LECTURE GLOBALE",
     count:rows.length,unresolved:rows.filter(r=>!["PASS","FOUNDATION_PASS"].includes(String(r.state||"").toUpperCase())).length,
     rows:rows.map(r=>({id:r.gate??null,state:label(r.state),owner:source}))};
 }
 return{available:false,source:"Strategy A",
   description:canonical?"Gates non disponibles : matrice de preuve absente":"Gate Canonical Truth non charge ; matrice Strategy A indisponible"};
}
function governorEvidence(){
 const safety=safe(globalThis.AgentCryptoStrategyASafetyCertification?.snapshot,null);
 if(safety)return{available:true,source:"Safety Certification",level:label(safety.level),reason:label(safety.reason),
    paperGateForAsset:false,globalNewTrades:safety.new_trades_allowed===true};
 const lifecycle=safe(globalThis.AgentCryptoStrategyAPaperLifecycle?.safety_gate_snapshot,null);
 if(lifecycle)return{available:true,source:"Paper Lifecycle · gouverneur",level:label(lifecycle.level),
    reason:label(lifecycle.reason),paperGateForAsset:false,globalNewTrades:lifecycle.new_trades_allowed===true};
 return{available:false,source:"Strategy A",level:"INCONNU",reason:"Gouverneur non charge dans cette vue",paperGateForAsset:false};
}
function blockingReasons(m){
 const list=[];
 if(!m.asset)list.push("Actif absent");
 if(!m.chart.qualified)list.push("Courbe : "+m.chart.reason);
 if(!m.candles.ready)list.push("Bougies : "+m.candles.reason);
 if(!m.book.ready)list.push("Carnet : "+m.book.reason);
 if(!m.gates.available)list.push("Gates : "+m.gates.description);
 else if(m.gates.unresolved>0)list.push("Gates globaux non resolus : "+m.gates.unresolved);
 if(!m.governor.available)list.push("Gouverneur : "+m.governor.reason);
 else if(m.governor.level!=="NORMAL")list.push("Gouverneur global : "+m.governor.level);
 list.push("Preuve canonique Strategy A associee a cet actif : absente");
 return list;
}

function snapshot(){
 const c=coin(),u=currency();
 const evidence={asset:c?{id:c.id,symbol:String(c.symbol).toUpperCase(),name:label(c.name||c.symbol)}:null,
   displayCurrency:u,chart:chartEvidence(c,u),candles:candlesEvidence(c),book:bookEvidence(c),
   gates:gateEvidence(),governor:governorEvidence(),
   paper:"NON AUTORISE",strategyLinkedToAsset:false,realOrder:false};
 return{...evidence,blockingReasons:blockingReasons(evidence)};
}
function set(p,k,v){const e=p.querySelector("[data-paper-"+k+"]");if(e)e.textContent=String(v??"—")}
function render(){
 const p=byId(ID);if(!p?.open)return false;
 const m=snapshot(),ch=m.chart,asset=m.asset;
 set(p,"asset",asset?asset.symbol+" · "+asset.name+" ("+asset.id+")":"Aucun actif selectionne");
 set(p,"currency",m.displayCurrency+" · affichage existant");
 set(p,"source",ch.qualified?ch.source:ch.reason);
 set(p,"coverage",ch.qualified?ch.points+" points · "+ch.period+" jour(s) · "+when(ch.first)+" → "+when(ch.last):"Aucune couverture qualifiee");
 set(p,"date",ch.qualified?when(ch.generatedAt):"Inconnue");
 set(p,"quality",ch.qualified?(ch.isCache?"Cache date ; pas de preuve LIVE":"Historique natif date ; pas de preuve LIVE"):"Aucune valeur inventee");
 set(p,"candles",m.candles.ready?m.candles.instrument+" · "+m.candles.bar+" · "+m.candles.count+" bougies · "+m.candles.source+" · "+when(m.candles.updatedAt)+(m.candles.hasError?" · ATTENTION : "+m.candles.warning:""):m.candles.reason);
 set(p,"book",m.book.ready?m.book.instrument+" · "+m.book.provider+" · "+m.book.bids+" bids / "+m.book.asks+" asks · source "+when(m.book.sourceAt):m.book.reason);
 set(p,"gates",m.gates.available?m.gates.source+" · "+m.gates.count+" gates globaux · non resolus : "+m.gates.unresolved+" · "+m.gates.rows.map(r=>"G"+(r.id??"?")+":"+r.state).join(" ; "):m.gates.description);
 set(p,"governor",m.governor.available?m.governor.source+" · "+m.governor.level+" · "+m.governor.reason+" · SANS permission actif":m.governor.reason);
 set(p,"blockers",m.blockingReasons.join(" ; "));
 set(p,"decision","NON ETABLIE · aucune conclusion de strategie attribuee a cet actif");
 set(p,"paper","BLOQUE · preparation humaine ; aucune entree Paper declenchee");
 return true;
}
function mount(){
 if(byId(ID))return true;
 const zone=byId("market-zone");if(!zone)return false;
 if(!byId("traderPaperPreparationStyle")){
  const st=document.createElement("style");st.id="traderPaperPreparationStyle";
  st.textContent=[
   "#traderPaperPreparation{grid-column:1/-1;display:block;width:99%;box-sizing:border-box;margin:12px auto 32px;border:1px solid #37616a;border-radius:14px;background:#071c28;color:#d9f0ef;font:12px system-ui,sans-serif;overflow:hidden}",
   "#traderPaperPreparation>summary{cursor:pointer;list-style:none;padding:14px;font-size:14px;font-weight:750;color:#ecdbb2}",
   "#traderPaperPreparation .paper-inner{border-top:1px solid #30535c;padding:13px}",
   "#traderPaperPreparation .paper-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}",
   "#traderPaperPreparation .paper-cell{border:1px solid #284a57;border-radius:9px;padding:10px;background:#0a2734;overflow-wrap:anywhere}",
   "#traderPaperPreparation .paper-cell small{display:block;color:#91b0bb;margin-bottom:6px}",
   "#traderPaperPreparation .paper-cell strong{font-weight:650}",
   "#traderPaperPreparation .paper-note{color:#a8c4cb;line-height:1.5}",
   "#traderPaperPreparation button{cursor:pointer;color:#eaffff;background:#133f4a;border:1px solid #42727e;border-radius:8px;padding:7px 12px}",
   "@media(max-width:740px){#traderPaperPreparation .paper-grid{grid-template-columns:1fr}}"
  ].join("\n");document.head.appendChild(st);
 }
 const p=document.createElement("details");p.id=ID;
 p.setAttribute("aria-label","Dossier preparation Strategy A Paper en lecture seule");
 p.innerHTML=[
  '<summary>DOSSIER DE PREPARATION · ACTIF / STRATEGY A PAPER — lecture seule</summary>',
  '<div class="paper-inner"><p class="paper-note">Sources de l’actif selectionne et garde-fous Strategy A globaux : aucune fusion ni execution. Aucun conseil d’achat ou de vente.</p>',
  '<div class="paper-grid">',
  '<div class="paper-cell"><small>Actif</small><strong data-paper-asset>—</strong></div>',
  '<div class="paper-cell"><small>Devise</small><strong data-paper-currency>—</strong></div>',
  '<div class="paper-cell"><small>Source du graphique</small><strong data-paper-source>—</strong></div>',
  '<div class="paper-cell"><small>Historique disponible</small><strong data-paper-coverage>—</strong></div>',
  '<div class="paper-cell"><small>Horodatage de la serie</small><strong data-paper-date>—</strong></div>',
  '<div class="paper-cell"><small>Qualite / fraicheur</small><strong data-paper-quality>—</strong></div>',
  '<div class="paper-cell"><small>Bougies · instrument reel et source</small><strong data-paper-candles>—</strong></div>',
  '<div class="paper-cell"><small>Carnet · paire et fraicheur</small><strong data-paper-book>—</strong></div>',
  '<div class="paper-cell"><small>Strategy A : gates GLOBAUX (non lies a cet actif)</small><strong data-paper-gates>—</strong></div>',
  '<div class="paper-cell"><small>Gouverneur Strategy A · global</small><strong data-paper-governor>—</strong></div>',
  '<div class="paper-cell" style="grid-column:1/-1"><small>Preuves manquantes / blocages documentaires</small><strong data-paper-blockers>—</strong></div>',
  '<div class="paper-cell"><small>Decision de strategie pour cet actif</small><strong data-paper-decision>—</strong></div>',
  '<div class="paper-cell"><small>Execution Paper</small><strong data-paper-paper>—</strong></div>',
  '</div><p class="paper-note">La preparation par actif exigera une preuve d’instrument, source, strategie et gates. Les gates globaux ne valent jamais autorisation pour cet actif.</p>',
  '<button type="button" data-paper-refresh>Relire les sources</button></div>'
 ].join("");
 zone.appendChild(p);
 p.addEventListener("toggle",()=>{if(p.open)render()});
 p.querySelector("[data-paper-refresh]")?.addEventListener("click",render);
 for(const event of ["agent-crypto:selected-market-changed","agent-crypto:quote-architecture-changed","agent-crypto:candles-technical-levels","agent-crypto:evidence-data-changed"])
  globalThis.addEventListener(event,()=>{if(p.open)render()},{passive:true});
 return true;
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
globalThis.AgentCryptoTraderPaperPreparation=Object.freeze({snapshot,render,mount,read_only:true,paper_only:true,real_order:false,fetch:false,storage_write:false,recurring_timer:false});
})();