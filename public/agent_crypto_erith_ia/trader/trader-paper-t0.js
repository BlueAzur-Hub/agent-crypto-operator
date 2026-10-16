/* Seven Heaven · T0 data-quality observation; does not certify G1 or trade. */
(()=>{"use strict";
const api=globalThis;
let evidence=null, captureBusy=false, captureSeq=0, strategyReadStatus=null;
let newSession=null;
let paperExperiment=null,paperCaptureBusy=false;
const safe=(fn)=>{try{return typeof fn==="function"?fn():null}catch(_){return null}};
const stamp=v=>{const n=typeof v==="number"?v:Date.parse(String(v||""));return Number.isFinite(n)&&n>0?n:null};
const pair=v=>{const m=String(v||"").toUpperCase().match(/^([A-Z0-9]+)[/-]([A-Z0-9]+)$/);return m?{base:m[1],quote:m[2]}:null};
const BAR=Object.freeze({"1m":60000,"5m":300000,"15m":900000,"1h":3600000,"4h":14400000,"1j":86400000});

/* Existing canonical G1 evidence and current G2/G7 foundation; observation only. */
function g1ProofDiagnostics(dossier,safety){
 const count=v=>Number.isInteger(v)&&v>=0?v:null;
 const str=v=>String(v??"INCONNU").slice(0,120);
 const dataset=kind=>{
  const r=dossier?.dataset?.[kind];
  if(!r||typeof r!=="object")return null;
  return Object.freeze({
   rows:count(r.rows),integrity:r.data_integrity_ready===true?"READY":r.data_integrity_ready===false?"NOT_READY":"UNKNOWN",
   missingIds:count(r.missing_ids),missingDates:count(r.missing_timestamps),
   duplicateIds:Array.isArray(r.duplicate_ids)?Object.freeze(r.duplicate_ids.slice(0,3).map(str)):null,
   duplicates:Array.isArray(r.duplicate_ids)?r.duplicate_ids.length:null,
   chronology:r.chronological===true?"OK":r.chronological===false?"NON":"INCONNUE",
   completed:count(r.after_cost_complete_rows),unknownNumbers:count(r.numeric_unknown_rows),
   unverifiedAccounting:count(r.unverified_after_cost_rows),
   missingDateExamples:Object.freeze((Array.isArray(kind==="experiment"?dossier?.experiment_ledger?.cycles:dossier?.after_cost?.trades)?
    (kind==="experiment"?dossier.experiment_ledger.cycles:dossier.after_cost.trades):[])
    .filter(x=>!Number.isFinite(Date.parse(String(x?.at||x?.captured_at||x?.timestamp||x?.created_at||""))))
    .slice(0,3).map(x=>str(x?.trade_id||x?.cycle_id||x?.replay_id||"ID NON FOURNI")))
  });
 };
 const trades=Array.isArray(dossier?.after_cost?.trades)?dossier.after_cost.trades:[];
 const missingCosts={};let knownCostDetails=0;
 for(const trade of trades){
  if(!Array.isArray(trade?.unknown_cost_components))continue;
  knownCostDetails++;
  for(const key of new Set(trade.unknown_cost_components.map(str)))
   missingCosts[key]=(missingCosts[key]||0)+1;
 }
 const truth=safe(safety?.foundation_truth)||safe(safety?.certification_matrix)?.foundation_proof||null;
 const owners=truth?.current_modules&&typeof truth.current_modules==="object"?truth.current_modules:null;
 const modules=owners?Object.freeze(Object.entries(owners).map(([name,row])=>Object.freeze({
  name:str(name),available:row?.available===true,compatible:row?.compatible===true,
  build:row?.build?str(row.build):null,
  missingMethods:Object.freeze(Array.isArray(row?.missing_methods)?row.missing_methods.map(str):[])
 }))):null;
 return Object.freeze({
  experiment:dataset("experiment"),afterCost:dataset("after_cost"),
  costDetailsCount:knownCostDetails,costComponents:Object.freeze(Object.entries(missingCosts).map(([name,rows])=>Object.freeze({name,rows}))),
  foundation:Object.freeze({available:!!truth,currentPass:truth?.pass===true&&truth?.tested_builds_match_current===true,
   source:truth?.source?str(truth.source):"INCONNUE",
   binding:truth?.binding_reason?str(truth.binding_reason):"NON RENSEIGNE",
   explicitStatus:truth?.latest_explicit_test?.status?str(truth.latest_explicit_test.status):"AUCUN TEST COURANT CONFIRME",
   modules})
 });
}
const diagnosticNumber=v=>v===null||v===undefined?"INCONNU":String(v);
function g1ProofReport(v){
 const d=v.g1Proof||{},f=d.foundation||{},fmt=(label,r)=>{
  if(!r)return label+": module non charge ou preuve non evaluee";
  const samples=r.duplicateIds?.length?" · exemples: "+r.duplicateIds.join(", "):"";
  return label+": "+diagnosticNumber(r.rows)+" lignes · integrite "+r.integrity+
   "\nIDs absents: "+diagnosticNumber(r.missingIds)+" · dates absentes: "+diagnosticNumber(r.missingDates)+
   " · IDs dupliques: "+diagnosticNumber(r.duplicates)+samples+" · chronologie: "+r.chronology+
   (r.missingDateExamples?.length?"\nDates manquantes, IDs exemples: "+r.missingDateExamples.join(", "):"")+
   (label==="AFTER-COST"?"\nLignes numeriques inconnues: "+diagnosticNumber(r.unknownNumbers)+
    " · comptabilites non verifiees: "+diagnosticNumber(r.unverifiedAccounting)+
    " · lignes strictement completes: "+diagnosticNumber(r.completed)+"/"+diagnosticNumber(r.rows):"");
 };
 const g=n=>v.gates.find(x=>Number(x.gate)===n)?.state||"UNKNOWN";
 const modules=f.modules?f.modules.map(m=>m.name+": "+(m.compatible?"compatible":m.available?"methodes manquantes":"ABSENT")+
  (m.build?" (build "+m.build+")":"")+(m.missingMethods.length?" · "+m.missingMethods.join(", "):"")).join("\n"):"Modules requis : details non disponibles";
 return "\n\nDIAGNOSTIC PREUVES G1 (lecture seule)\n"+
  fmt("EXPERIMENT",d.experiment)+"\n"+fmt("AFTER-COST",d.afterCost)+
  "\nCouts incomplets detailles: "+(d.costDetailsCount?d.costComponents.length?
   d.costComponents.map(x=>x.name+" ("+x.rows+" lignes)").join(" ; "):
   "aucune composante inconnue declaree dans "+d.costDetailsCount+" lignes documentees":
   "non documentes par les lignes actuellement lues")+
  "\n\nFONDATION G2 / G7 (aucun test declenche)\nEtats canoniques: G2="+g(2)+" ; G7="+g(7)+
  "\nPreuve actuelle liee aux builds: "+(f.currentPass?"DEMONTRÉE":"NON DEMONTREE")+
  "\nProprietaire/source: "+(f.available?f.source:"NON CHARGE")+" · lien des builds: "+(f.binding||"INCONNU")+
  "\nDernier test explicite: "+(f.explicitStatus||"INCONNU")+"\n"+modules+
  (!f.currentPass&&[2,7].some(n=>["PASS","FOUNDATION_PASS"].includes(g(n)))?"\nDIVERGENCE : PASS affiche par la matrice, mais preuve actuelle liee aux builds NON DEMONTREE; aucune autorisation Paper.":"")+
  "\nObservations uniquement : aucun PASS et aucune permission Paper crees.";
}

function analyze(now=Date.now(),d=api){
 const p=safe(d.AgentCryptoTraderPaperPreparation?.snapshot)||{};
 const candle=safe(d.AgentCryptoMarketMicroscope?.snapshot)||{};
 const book=safe(d.AgentCryptoOkxMicrostructure?.snapshot)||{};
 const gate=safe(d.AgentCryptoStrategyAGateCanonicalTruth?.snapshot);
 const dossier=safe(d.AgentCryptoStrategyAEvidenceDossier?.snapshot);
 const asset=p.asset||null,flags=[],facts=[],rows=Array.isArray(candle.rows)?candle.rows:[];
 if(!asset)flags.push("Actif absent");
 if(!d.AgentCryptoMarketMicroscope?.snapshot)flags.push("Moteur Bougies absent de cette vue");
 if(!d.AgentCryptoOkxMicrostructure?.snapshot)flags.push("Moteur Carnet absent de cette vue");
 if(!candle.loadedInstrument&&!(Array.isArray(candle.rows)&&candle.rows.length))flags.push("Bougies non chargees : mode "+(candle.mode||"inconnu")+" · erreur "+(candle.errorCode||candle.error||"aucune"));
 if(!book.loadedAsset&&(!book.bids?.length||!book.asks?.length))flags.push("Carnet non charge : fenetre "+(book.open?"ouverte":"fermee")+" · etat "+(book.freshness||"inconnu")+" · erreur "+(book.errorCode||book.error||"aucune"));
 if(!p.chart?.qualified)flags.push("Graphique de cet actif non qualifie");
 else facts.push("Graphique: "+p.chart.points+" points, "+p.displayCurrency+", "+p.chart.source+" (non LIVE)");
 const cp=pair(candle.loadedInstrument),bp=pair(book.pair),barMs=BAR[String(candle.loadedBar||"").toLowerCase()]||null;
 let invalid=0,ordering=0,gaps=0,unconfirmed=0;
 rows.forEach((r,i)=>{
  const x=[r?.t,r?.o,r?.h,r?.l,r?.c].map(Number);
  if(x.some(v=>!Number.isFinite(v))||x[0]<=0||x[1]<=0||x[4]<=0||x[2]<Math.max(x[1],x[3],x[4])||x[3]>Math.min(x[1],x[2],x[4])||r?.v!=null&&(!Number.isFinite(Number(r.v))||Number(r.v)<0))invalid++;
  if(i){const dt=Number(r?.t)-Number(rows[i-1]?.t);if(dt<=0)ordering++;else if(barMs&&dt>barMs*1.5)gaps++}
  if(String(r?.confirm)==="0")unconfirmed++;
 });
 const last=rows.length?stamp(rows[rows.length-1]?.t):null;
 const candleAge=last===null?null:now-last;
 const candleLimit=barMs===null?null:barMs*2.2;
 const fresh=!!(barMs&&last&&candleAge>=-2000&&candleAge<=candleLimit);
 const assetMatches=!!(asset&&cp?.base===asset.symbol);
 const candleOk=!!(assetMatches&&rows.length>=2&&!candle.loading&&invalid===0&&ordering===0&&gaps===0&&fresh);
 if(candleOk)facts.push("Bougies "+candle.loadedInstrument+": "+rows.length+" · source "+new Date(last).toISOString());
 if(!assetMatches)flags.push("Bougies: actif "+(asset?.symbol||"?")+" != paire "+(candle.loadedInstrument||"absente"));
 if(rows.length<2)flags.push("Bougies: serie insuffisante ("+rows.length+" points)");
 if(candle.loading)flags.push("Bougies: chargement en cours");
 if(!barMs)flags.push("Bougies: intervalle inconnu ("+(candle.loadedBar||"absent")+")");
 if(invalid)flags.push("Bougies: OHLCV invalides = "+invalid);
 if(ordering)flags.push("Bougies: horodatages non croissants = "+ordering);
 if(gaps)flags.push("Bougies: ruptures temporelles = "+gaps);
 if(last===null)flags.push("Bougies: date de derniere ouverture absente");
 else if(!fresh)flags.push("Bougies: ouverture "+(candleAge<0?"future":"perimee")+" · age "+Math.round(candleAge/1000)+" s · limite "+(candleLimit===null?"inconnue":Math.round(candleLimit/1000)+" s"));
 const seen=stamp(book.sourceObservedAt||book.capturedAt),age=seen===null?null:now-seen;
 const max=Number(d.AgentCryptoOkxMicrostructure?.validation_contract?.fresh_max_age_ms);
 const bookOk=!!(asset&&bp?.base===asset.symbol&&book.loadedAsset===asset.symbol&&bp?.quote===String(book.loadedQuote||"").toUpperCase()&&book.bids?.length&&book.asks?.length&&book.freshness==="FRESH"&&seen!==null&&Number.isFinite(max)&&max>0&&age>=-2000&&age<=max);
 if(bookOk)facts.push("Carnet "+book.pair+" · source "+new Date(seen).toISOString()+" · age "+age+"ms");
 else flags.push("Carnet: paire, source ou fraicheur insuffisante");
 if(cp&&bp&&cp.quote!==bp.quote)flags.push("Devises de cotation differentes: "+cp.quote+" / "+bp.quote);
 if(cp&&cp.quote!==p.displayCurrency)facts.push("Affichage "+p.displayCurrency+" distinct de "+cp.quote+"; aucune conversion");
 const canonicalRows=gate?.available===true&&Array.isArray(gate.rows)?gate.rows:[];
 const g1=canonicalRows.find(x=>Number(x.gate)===1)||null;
 if(!g1)flags.push("G1 canonique inaccessible : "+(strategyReadStatus?.errors?.join("; ")||"source non chargee"));
 if(canonicalRows.length&&canonicalRows.length!==9)flags.push("Matrice canonique partielle : "+canonicalRows.length+" gates");
 const datasets=dossier?.dataset||{};
 const integrity={};
 for(const key of ["experiment","after_cost"]){
  const r=datasets[key];integrity[key]=r?r.data_integrity_ready===true:null;
  if(r)facts.push("Integrite "+key+": "+(integrity[key]?"OK":"NON DEMONTREE")+" ("+r.rows+" lignes)");
  if(r&&!integrity[key])flags.push("Preuve G1, dataset "+key+": integrite non demontree");
  if(!r)flags.push("Preuve G1, dataset "+key+": module non charge ; preuve NON evaluee");
 }
 flags.push("Capture d'observation seulement: ne certifie ni G1 ni Strategy A");
 return Object.freeze({schema:"trader_t0_data_quality_r3",capturedAt:new Date(now).toISOString(),
  asset:asset?Object.freeze({...asset}):null,currency:p.displayCurrency||null,
  market:Object.freeze({candlePair:candle.loadedInstrument||null,bookPair:book.pair||null,
   candleCount:rows.length,invalid,ordering,gaps,unconfirmed,lastCandle:last,
   candleAgeMs:candleAge,candleLimitMs:candleLimit,loadedBar:candle.loadedBar||null,
   loadedInstrument:candle.loadedInstrument||null,selectedAsset:asset?.symbol||null,
   receivedAt:candle.lastLoadedAt||null,assetMatches,loading:!!candle.loading,
   candleAccepted:candleOk,bookTime:seen,candleFresh:fresh,bookFresh:bookOk}),
  g1:Object.freeze({state:g1?.state||"UNKNOWN",owner:g1?.owner||null}),
  gates:Object.freeze(canonicalRows.map(r=>Object.freeze({gate:r.gate,state:r.state,owner:r.owner}))),
  governor:Object.freeze({level:safe(d.AgentCryptoStrategyASafetyCertification?.snapshot)?.level||"UNKNOWN",assetAuthorized:false}),
  canonicalRead:Object.freeze({complete:canonicalRows.length===9,errors:Object.freeze([...(strategyReadStatus?.errors||[])])}),
  datasetIntegrity:Object.freeze(integrity),g1Proof:g1ProofDiagnostics(dossier,d.AgentCryptoStrategyASafetyCertification),complete:candleOk&&bookOk&&!!p.chart?.qualified&&cp?.quote===bp?.quote,
  facts:Object.freeze(facts),flags:Object.freeze(flags),
  marketBrief:marketBrief(asset,candle,book,candleOk,bookOk,p.displayCurrency,d.AgentCryptoMarketMicroscope),
  gatePromoted:false,paperAuthorized:false,orderPlaced:false,persisted:false});
}

/* Market reading from already selected canonical snapshots; no new market owner. */
function marketBrief(asset,candle,book,candleOk,bookOk,currency,owner=api.AgentCryptoMarketMicroscope){
 const label="Observation uniquement. Ni strategie certifiee ni ordre.";
 const cp=pair(candle?.loadedInstrument),bp=pair(book?.pair);
 const rows=Array.isArray(candle?.rows)?candle.rows:[];
 if(!asset||!candleOk||rows.length<10)return Object.freeze({available:false,reason:"Bougies valides/fraiches insuffisantes (minimum 10)",label});
 const win=rows.slice(-20);
 const first=Number(win[0]?.c),last=Number(win.at(-1)?.c);
 const hi=win.map(x=>Number(x.h)),lo=win.map(x=>Number(x.l));
 if(![first,last,...hi,...lo].every(v=>Number.isFinite(v)&&v>0)||first<=0)
  return Object.freeze({available:false,reason:"OHLCV insuffisant pour la fenetre de lecture",label});
 const high=Math.max(...hi),low=Math.min(...lo),change=(last/first-1)*100;
 const v=win.slice(-10).map(r=>Number(r.v));
 const volumeReady=v.length===10&&v.every(x=>Number.isFinite(x)&&x>=0);
 const sum=a=>a.reduce((x,y)=>x+y,0);
 const prior=volumeReady?sum(v.slice(0,5)):null,recent=volumeReady?sum(v.slice(5)):null;
 const volumeRatio=prior>0?recent/prior:null;
 let bid=null,ask=null,spreadBp=null,depthRatio=null;
 if(bookOk&&cp&&bp&&cp.base===bp.base&&cp.quote===bp.quote&&book.bids?.length&&book.asks?.length){
  const b=Number(book.bids[0]?.[0]),a=Number(book.asks[0]?.[0]);
  if(Number.isFinite(b)&&Number.isFinite(a)&&a>=b&&b>0){
   bid=b;ask=a;spreadBp=(a-b)/((a+b)/2)*10000;
   const notional=side=>side.slice(0,20).reduce((acc,r)=>{
    const p=Number(r?.[0]),q=Number(r?.[1]);
    return acc+(Number.isFinite(p)&&p>0&&Number.isFinite(q)&&q>=0?p*q:0);
   },0);
   const askN=notional(book.asks);
   depthRatio=askN>0?notional(book.bids)/askN:null;
  }
 }
 const levels=safe(owner?.technicalLevels);
 const levelsMatch=levels?.instrument===candle.loadedInstrument&&levels?.bar===candle.loadedBar&&
   Number.isFinite(Number(levels.current))&&Math.abs(Number(levels.current)-last)<=Math.max(1e-8,last*1e-8);
 const sl=levelsMatch&&Number.isFinite(levels.support?.price)?levels.support:null;
 const rl=levelsMatch&&Number.isFinite(levels.resistance?.price)?levels.resistance:null;
 return Object.freeze({available:true,asset:asset.symbol,pair:candle.loadedInstrument,quote:cp.quote,bar:candle.loadedBar,
  candles:win.length,lastClose:last,changePct:change,low,high,volumeRatio,
  bestBid:bid,bestAsk:ask,spreadBp,depthRatio,bookComparable:bid!==null&&ask!==null,
  support:sl?Object.freeze({price:sl.price,touches:sl.touches}):null,
  resistance:rl?Object.freeze({price:rl.price,touches:rl.touches}):null,
  sourceLevels:!!(sl||rl),currency,label});
}
const marketFmt=n=>Number.isFinite(n)?Number(n).toLocaleString("fr-FR",{maximumFractionDigits:4}):"indisponible";
function marketReport(m){
 if(!m?.available)return"LECTURE DE MARCHE · non disponible : "+(m?.reason||"source absente");
 const q=m.quote,sign=m.changePct>=0?"+":"";
 return [
  "LECTURE DE MARCHE · "+m.asset+" / "+q+" · "+m.bar+" · "+m.candles+" bougies",
  "Derniere cloture : "+marketFmt(m.lastClose)+" "+q+" · variation sur fenetre : "+sign+marketFmt(m.changePct)+" %",
  "Extremes observes : bas "+marketFmt(m.low)+" / haut "+marketFmt(m.high)+" "+q+" (ne constituent pas des supports certifies)",
  "Volume cinq dernieres / cinq precedentes : "+(m.volumeRatio===null?"non exploitable":marketFmt(m.volumeRatio)+" x")+" (descriptif)",
  m.bookComparable?"Carnet meme paire : BID "+marketFmt(m.bestBid)+" / ASK "+marketFmt(m.bestAsk)+" "+q+" · spread "+marketFmt(m.spreadBp)+" bp":
                    "Carnet : prix non comparables ou source non fraiche",
  "Profondeur BID/ASK (20 niveaux notionnels) : "+(m.depthRatio===null?"indisponible":marketFmt(m.depthRatio)+" x")+" (instantane, non predictif)",
  m.sourceLevels?"Niveaux du moteur Bougies : S "+(m.support?marketFmt(m.support.price):"indisponible")+" / R "+(m.resistance?marketFmt(m.resistance.price):"indisponible")+" "+q:
                  "Supports/resistances canoniques non disponibles ; les extremes ci-dessus sont uniquement descriptifs",
  "Scenarios conditionnels : franchissement du haut observe = extension a surveiller ; rupture du bas = faiblesse a surveiller. Aucun signal.",
  "Graphique "+m.currency+" / Bougies "+q+" : cotations distinctes, aucune conversion.",
  m.label
 ].join("\n");
}

const asUtc=v=>Number.isFinite(v)&&v>0?new Date(v).toISOString():"inconnue";
const seconds=v=>Number.isFinite(v)?(v/1000).toFixed(1)+" s":"inconnu";
function report(v){
 if(!v)return"Pas de capture T0. Aucun stockage.";
 const k=v.market;
 return v.capturedAt+" · "+(v.complete?"OBSERVATIONS CONCORDANTES":"DONNEES INCOMPLETES")+
  "\nG1 CANONIQUE: "+v.g1.state+" (inchangé)"+
  "\nSTRATEGY A · GATES : "+(v.gates.length?v.gates.map(g=>"G"+g.gate+":"+g.state).join(" ; "):"non charges")+
  "\nGouverneur: "+v.governor.level+" · aucun droit Paper pour cet actif"+
  (v.canonicalRead.errors.length?"\nLecteurs canoniques: "+v.canonicalRead.errors.join(" ; "):"")+
  "\n\nDIAGNOSTIC BOUGIES"+
  "\nPaire: "+(k.loadedInstrument||"absente")+" · actif attendu: "+(k.selectedAsset||"?")+" · accord: "+(k.assetMatches?"OUI":"NON")+
  "\nIntervalle: "+(k.loadedBar||"?")+" · nombre de bougies: "+k.candleCount+" · chargement: "+(k.loading?"OUI":"NON")+
  "\nOHLCV invalides: "+k.invalid+" · horodatages non croissants: "+k.ordering+" · ruptures temporelles: "+k.gaps+
  "\nBougies non confirmees: "+k.unconfirmed+" (information, pas un blocage)"+
  "\nDerniere ouverture: "+asUtc(k.lastCandle)+" · reception: "+(k.receivedAt||"inconnue")+
  "\nAge a T0: "+seconds(k.candleAgeMs)+" · seuil: "+seconds(k.candleLimitMs)+" · fraicheur: "+(k.candleFresh?"OUI":"NON")+
  "\nControle Bougies: "+(k.candleAccepted?"CONCORDANT":"NON CONFORME")+
  "\n\n"+marketReport(v.marketBrief)+
  "\n\nSOURCES ET PREUVES\n"+v.facts.join("\n")+g1ProofReport(v)+
  "\n\nLIMITES\n"+v.flags.join("\n");
}
function paint(){
 const output=document.getElementById("traderPaperT0")?.querySelector("[data-t0-report]");
 if(output)output.textContent=report(evidence)+sessionReport()+paperExperimentReport();
 const root=document.getElementById("traderPaperT0");
 const cycle=root?.querySelector("[data-paper-cycle]");
 const finish=root?.querySelector("[data-paper-finish]");
 const start=root?.querySelector("[data-t0-reset]");
 if(cycle)cycle.disabled=!paperExperiment||paperExperiment.closed||paperExperiment.attempts>0||paperCaptureBusy||captureBusy||identity()!==paperExperiment.assetKey;
 if(finish)finish.disabled=!paperExperiment||paperExperiment.closed||paperCaptureBusy||captureBusy;
 if(start)start.disabled=paperCaptureBusy||captureBusy;
}

/* Explicit T0 read; only canonical safety/gate owners and the one missing Replay owner, never the 28-module cascade. */
const CANONICAL_READERS=Object.freeze([
 {src:"./js/strategy-a-safety-certification.js",ready:()=>typeof api.AgentCryptoStrategyASafetyCertification?.certification_matrix==="function"},
 {src:"./js/strategy-a-replay.js",ready:()=>typeof api.AgentCryptoStrategyAReplay?.self_test==="function"},
 {src:"./js/strategy-a-gate-canonical-truth.js",ready:()=>typeof api.AgentCryptoStrategyAGateCanonicalTruth?.snapshot==="function"}
]);
function acquireCanonical(spec){
 if(spec.ready())return Promise.resolve(true);
 const href=new URL(spec.src,document.baseURI).href;
 const existing=Array.from(document.scripts||[]).find(x=>{
  try{return x.src&&new URL(x.src,document.baseURI).pathname===new URL(href).pathname}catch(_){return false}
 });
 if(existing?.dataset?.agentCryptoEvidenceDemandState==="failed")return Promise.reject(new Error("CANONICAL_EXISTING_FAILURE "+spec.src));
 const el=existing||document.createElement("script"),created=!existing;
 return new Promise((resolve,reject)=>{
  let finished=false;
  const end=err=>{
   if(finished)return;finished=true;clearTimeout(deadline);
   el.removeEventListener?.("load",success);el.removeEventListener?.("error",failure);
   if(err)reject(err);else resolve(true);
  };
  const success=()=>end(spec.ready()?null:new Error("CANONICAL_API_NOT_READY "+spec.src));
  const failure=()=>end(new Error("CANONICAL_SCRIPT_UNAVAILABLE "+spec.src));
  const deadline=setTimeout(()=>end(new Error("CANONICAL_LOAD_TIMEOUT "+spec.src)),7000);
  el.addEventListener("load",success,{once:true});el.addEventListener("error",failure,{once:true});
  if(created){el.src=href;el.async=false;el.dataset.agentCryptoTraderStrategyRead="explicit";document.head.appendChild(el)}
  else if(spec.ready())end(null);
 });
}
async function readCanonical(){
 const errors=[];
 for(const spec of CANONICAL_READERS){if(spec.ready())continue;try{await acquireCanonical(spec)}catch(e){errors.push(String(e?.message||e).slice(0,150))}}
 const c=safe(api.AgentCryptoStrategyAGateCanonicalTruth?.snapshot);
 return Object.freeze({available:c?.available===true&&c?.rows?.length===9,errors:Object.freeze(errors)});
}

const identity=()=>{const p=safe(api.AgentCryptoTraderPaperPreparation?.snapshot);return String(p?.asset?.id||"")+"|"+String(p?.asset?.symbol||"")+"|"+String(p?.displayCurrency||"");};
function requireCandles(s,market,now){
 const asset=s?.asset;
 const instrument=pair(market?.loadedInstrument),rows=market?.rows;
 const interval=BAR[String(market?.loadedBar||"").toLowerCase()];
 const last=Array.isArray(rows)&&rows.length?stamp(rows[rows.length-1]?.t):null;
 return !(asset&&instrument?.base===asset.symbol&&Array.isArray(rows)&&rows.length>=2&&!market.loading&&interval&&last&&now-last>=-2000&&now-last<=interval*2.2);
}
function requireBook(s,market,owner,now){
 const asset=s?.asset,loaded=pair(market?.pair),source=stamp(market?.sourceObservedAt||market?.capturedAt);
 const max=Number(owner?.validation_contract?.fresh_max_age_ms);
 return !(asset&&loaded?.base===asset.symbol&&market?.loadedAsset===asset.symbol&&loaded.quote===String(market?.loadedQuote||"").toUpperCase()&&
  market?.bids?.length&&market?.asks?.length&&market?.freshness==="FRESH"&&source&&Number.isFinite(max)&&max>0&&now-source>=-2000&&now-source<=max);
}
async function capture(){
 if(captureBusy)return null;
 const token=++captureSeq,start=identity(),button=document.querySelector("#traderPaperT0 [data-t0-capture]");
 captureBusy=true;
 if(button){button.disabled=true;button.textContent="Lecture ponctuelle des sources…";}
 try{
  const asset=safe(api.AgentCryptoTraderPaperPreparation?.snapshot);
  const candles=api.AgentCryptoMarketMicroscope,book=api.AgentCryptoOkxMicrostructure;
  const current=Date.now();
  if(asset?.asset&&candles&&requireCandles(asset,safe(candles.snapshot),current)&&typeof candles.load==="function"){
   try{await candles.load({reason:"trader-t0-explicit-capture"});}catch(_){}
  }
  if(token!==captureSeq||identity()!==start)return null;
  if(asset?.asset&&book&&requireBook(asset,safe(book.snapshot),book,Date.now())&&typeof book.refresh==="function"){
   try{await book.refresh({asset:asset.asset.symbol,automatic:false});}catch(_){}
  }
  if(token!==captureSeq||identity()!==start)return null;
  strategyReadStatus=await readCanonical();
  if(token!==captureSeq||identity()!==start)return null;
  evidence=analyze();
  if(newSession&&identity()===newSession.assetKey) newSession=Object.freeze({...newSession,captures:newSession.captures+1});
  paint();
  try{api.AgentCryptoTraderPaperPreparation?.render?.()}catch(_){}
  return evidence;
 }finally{
  captureBusy=false;
  if(button){button.disabled=false;button.textContent="Capturer T0 (sans stockage)";}
 }
}

/* Non-destructive voluntary reset: baseline in volatile memory only. */
function evidenceCounts(){
 const d=safe(api.AgentCryptoStrategyAEvidenceDossier?.snapshot)?.dataset||{};
 const n=r=>Number.isInteger(r?.rows)&&r.rows>=0?r.rows:null;
 return Object.freeze({experiment:n(d.experiment),afterCost:n(d.after_cost)});
}
function sessionSnapshot(){
 if(!newSession)return null;
 const current=evidenceCounts(),same=identity()===newSession.assetKey;
 const diff=(now,start)=>same&&Number.isInteger(now)&&Number.isInteger(start)?now-start:null;
 return Object.freeze({since:newSession.since,asset:newSession.asset,captures:newSession.captures,
  sameAsset:same,baseline:newSession.baseline,current,
  experimentDelta:diff(current.experiment,newSession.baseline.experiment),
  afterCostDelta:diff(current.afterCost,newSession.baseline.afterCost),
  historyPreserved:true,stored:false});
}
function sessionReport(){
 const r=sessionSnapshot();if(!r)return "";
 const fmt=x=>x===null?"NON EVALUE":String(x);
 return "\n\nSEANCE T0 · RESET SANS SUPPRESSION"+
  "\nDebut: "+r.since+" · actif "+r.asset+" · captures "+r.captures+
  (r.sameAsset?"":"\nActif change : RESET pour commencer une seance sur cet actif.")+
  "\nExperiment : debut "+fmt(r.baseline.experiment)+" · actuel "+fmt(r.current.experiment)+" · delta "+fmt(r.experimentDelta)+
  "\nAfter-cost : debut "+fmt(r.baseline.afterCost)+" · actuel "+fmt(r.current.afterCost)+" · delta "+fmt(r.afterCostDelta)+
  "\nLes archives et gates ne sont pas effaces. Delta de compteurs, pas une certification."+
  "\nUne capture T0 suffit pour conclure cette seance.";
}
function beginNewSession(){
 if(captureBusy||paperCaptureBusy)return null;
 const p=safe(api.AgentCryptoTraderPaperPreparation?.snapshot);
 if(!p?.asset?.symbol)return null;
 const at=new Date().toISOString(),assetKey=identity(),asset=String(p.asset.symbol);
 newSession=Object.freeze({since:at,assetKey,asset,baseline:evidenceCounts(),captures:0});
 paperExperiment=Object.freeze({startedAt:at,endedAt:null,assetKey,asset,
  baseline:prospectiveRows()?.length??null,attempts:0,closed:false,
  status:"OUVERTE",blocker:null,cycleId:null,receiptOk:false});
 reset();
 return sessionSnapshot();
}


/* Session experiments are volatile; one explicit G3 Paper attempt per session. */
const G3_OWNER=Object.freeze({
 src:"./js/strategy-a-g3-prospective-t0-capture.js",
 ready:()=>typeof api.AgentCryptoStrategyAG3ProspectiveT0Capture?.capture_once==="function"
});
/* Targeted Paper-only owners. Loaded only on explicit operator cycle click. */
const PAPER_ONE_SHOT_OWNERS=Object.freeze([
 {src:"./js/strategy-a-paper-lifecycle.js",ready:()=>typeof api.AgentCryptoStrategyAPaperLifecycle?.create==="function"},
 {src:"./js/strategy-a-auto-lifecycle-bridge.js",ready:()=>typeof api.AgentCryptoStrategyAAutoLifecycleBridge?.preflight==="function"},
 {src:"./js/strategy-a-safety-certification.js",ready:()=>typeof api.AgentCryptoStrategyASafetyCertification?.snapshot==="function"},
 G3_OWNER
]);
function paperRunner(){
 return api.AgentCryptoAutoPaperRunner404265||api.AgentCryptoAutoPaperRunner||null;
}
function paperRunnerState(runner){return safe(runner?.state);}
function paperOneShotPreflight(){
 const selected=safe(api.AgentCryptoTraderPaperPreparation?.snapshot)?.asset;
 const runner=paperRunner(),r=paperRunnerState(runner);
 const safety=safe(api.AgentCryptoStrategyASafetyCertification?.snapshot);
 const bridge=safe(api.AgentCryptoStrategyAAutoLifecycleBridge?.preflight);
 const opened=Number(r?.opened),closed=Number(r?.closed);
 const openKnown=Number.isFinite(opened)&&Number.isFinite(closed);
 const issues=[];
 if(String(selected?.symbol||"").toUpperCase()!=="BTC")issues.push("MOTEUR_AUTO_A_BTC_UNIQUEMENT");
 if(!runner||typeof runner.start!=="function"||typeof runner.stop!=="function"||typeof runner.state!=="function")
  issues.push("AUTO_A_OWNER_START_STOP_ABSENT");
 if(r?.enabled===true)issues.push("AUTO_A_DEJA_ACTIF_STOP_MANUEL_REQUIS");
 if(!r||r.enabled!==false)issues.push("AUTO_A_ETAT_NON_CONFIRME");
 if(!openKnown)issues.push("POSITIONS_PAPER_NON_EVALUABLES");
 else if(opened>closed)issues.push("POSITION_PAPER_DEJA_OUVERTE");
 if(safety?.level!=="NORMAL"||safety?.new_trades_allowed!==true||safety?.auto_a_governor_connected!==true)
  issues.push("SAFETY_GOVERNOR_NON_PRET");
 if(bridge?.ready!==true)issues.push("LIFECYCLE_BRIDGE_NON_PRET"+(bridge?.blocked_reason?":"+String(bridge.blocked_reason).slice(0,80):""));
 if(!G3_OWNER.ready())issues.push("G3_OWNER_ABSENT");
 return Object.freeze({ready:issues.length===0,issues:Object.freeze(issues),runner,runnerState:r});
}

function prospectiveRows(){
 const rows=safe(api.AgentCryptoStrategyAG3ProspectiveT0Capture?.read);
 return Array.isArray(rows)?rows:null;
}
function paperExperimentSnapshot(){
 if(!paperExperiment)return null;
 const rows=prospectiveRows(),current=rows?rows.length:null,baseline=paperExperiment.baseline;
 return Object.freeze({
  startedAt:paperExperiment.startedAt,endedAt:paperExperiment.endedAt,asset:paperExperiment.asset,
  sameAsset:identity()===paperExperiment.assetKey,attempts:paperExperiment.attempts,
  closed:paperExperiment.closed,busy:paperCaptureBusy,status:paperExperiment.status,
  blocker:paperExperiment.blocker,cycleId:paperExperiment.cycleId,receiptOk:paperExperiment.receiptOk,
  baseline,current,delta:Number.isInteger(current)&&Number.isInteger(baseline)?current-baseline:null,
  autoStopped:paperExperiment.autoStopped??null,paperOpen:paperExperiment.paperOpen===true,
  historyPreserved:true,gatesPromoted:false,realOrders:false
 });
}
function paperExperimentReport(){
 const s=paperExperimentSnapshot();if(!s)return "";
 const fmt=x=>x==null?"NON EVALUE":String(x);
 return "\n\nEXPERIENCE STRATEGY A PAPER · "+s.status+
  "\nActif: "+s.asset+" · debut: "+s.startedAt+(s.endedAt?" · fin: "+s.endedAt:"")+
  "\nTentative de cycle: "+s.attempts+" / 1 · ID: "+fmt(s.cycleId)+
  "\nPreuves prospectives G3: depart "+fmt(s.baseline)+" · actuel "+fmt(s.current)+" · variation "+fmt(s.delta)+
  (s.blocker?"\nBlocage/limite: "+s.blocker:"")+
  (s.autoStopped===null?"":"\nAuto A STOP apres tentative: "+(s.autoStopped?"CONFIRME":"NON CONFIRME"))+
  (s.paperOpen?"\nATTENTION: position Paper ouverte, suivi/reconciliation non termines.":"")+
  (s.sameAsset?"":"\nActif change : nouvelle experience requise.")+
  "\nAucune archive effacee ; une tentative ne vaut ni gate PASS ni autorisation Paper."+
  "\nTerminer la seance pour clore ce bilan.";
}
async function capturePaperOnce(){
 if(!paperExperiment||paperExperiment.closed||paperExperiment.attempts>0||captureBusy||paperCaptureBusy)return null;
 if(identity()!==paperExperiment.assetKey){
  paperExperiment=Object.freeze({...paperExperiment,status:"ACTIF_CHANGE",blocker:"SELECTION_NON_CONCORDANTE"});
  paint();return paperExperimentSnapshot();
 }
 const expected=paperExperiment.startedAt;
 paperCaptureBusy=true;paint();
 let receipt=null,blocker=null,prior=null,runner=null,ownerStartAttempted=false,stopConfirmed=false,openPaper=false;
 try{
  // All imports are targeted; never open the global 28-module Evidence cascade.
  for(const spec of PAPER_ONE_SHOT_OWNERS){
   try{await acquireCanonical(spec);}
   catch(e){blocker="DEPENDANCE_PAPER_NON_CHARGEE "+spec.src+": "+String(e?.message||e).slice(0,70);break;}
   if(!paperExperiment||paperExperiment.startedAt!==expected||paperExperiment.closed||identity()!==paperExperiment.assetKey)return null;
  }
  if(!blocker){
   const pre=paperOneShotPreflight();
   if(!pre.ready)blocker=pre.issues.join(" ; ").slice(0,290);
   else {
    runner=pre.runner;
    prior=prospectiveRows();
    // Synchronous owner API: start schedules an immediate timer; before the browser
    // can run it, G3 explicitly ticks once and finally owner.stop cancels the timer.
    // This deliberate click is the only action permitted to lift a manual STOP.
    try{
     ownerStartAttempted=true; // start can throw after arming a timer: STOP must still run
     const started=runner.start();
     const after=paperRunnerState(runner)||started;
     if(after?.enabled!==true)blocker="AUTO_A_START_REFUSE: "+String(after?.phase||after?.last_action||"INCONNU").slice(0,140);
     else{
      receipt=api.AgentCryptoStrategyAG3ProspectiveT0Capture.capture_once();
     }
    }catch(e){blocker="AUTO_A_CYCLE_EXCEPTION: "+String(e?.message||e).slice(0,110);}
    finally{
     // Never leave the recurring Auto A scheduler running after this one-shot.
     if(ownerStartAttempted){
      try{const stopped=runner.stop("Fin cycle unique Paper · arrêt automatique volontaire");
       stopConfirmed=paperRunnerState(runner)?.enabled===false||stopped?.enabled===false;
      }catch(e){blocker="ARRET_AUTO_A_EXCEPTION: "+String(e?.message||e).slice(0,100);}
      try{const afterStop=paperRunnerState(runner);
       openPaper=Number.isFinite(Number(afterStop?.opened))&&Number.isFinite(Number(afterStop?.closed))&&Number(afterStop.opened)>Number(afterStop.closed);
      }catch(_){}
     }
    }
    if(ownerStartAttempted&&!stopConfirmed)blocker="ARRET_AUTO_A_NON_CONFIRME · utiliser STOP operateur immediatement";
    if(openPaper)blocker=(blocker?blocker+" ; ":"")+"POSITION_PAPER_OUVERTE_A_SUIVRE · STOP ne clot pas la position";
   }
  }
  const ok=receipt?.ok===true;
  blocker=blocker||(ok?null:String(receipt?.blocker||"PREUVE_NON_OBTENUE").slice(0,140));
  paperExperiment=Object.freeze({...paperExperiment,
   baseline:Number.isInteger(paperExperiment.baseline)?paperExperiment.baseline:(prior?prior.length:null),
   attempts:1,status:!stopConfirmed&&ownerStartAttempted?"ARRET_NON_CONFIRME":ok?"CYCLE_G3_CAPTURE":"CYCLE_BLOQUE",
   receiptOk:ok,autoStopped:ownerStartAttempted?stopConfirmed:null,paperOpen:openPaper,
   cycleId:receipt?.cycle_id?String(receipt.cycle_id).slice(0,120):null,blocker});
  return paperExperimentSnapshot();
 }finally{
  paperCaptureBusy=false;paint();
 }
}

function finishPaperExperiment(){
 if(!paperExperiment||paperExperiment.closed||captureBusy||paperCaptureBusy)return null;
 paperExperiment=Object.freeze({...paperExperiment,endedAt:new Date().toISOString(),closed:true,
  status:paperExperiment.attempts===0?"TERMINEE_SANS_TENTATIVE":
   paperExperiment.receiptOk?"TERMINEE_AVEC_CYCLE":"TERMINEE_AVEC_BLOCAGE"});
 paint();return paperExperimentSnapshot();
}

function reset(){++captureSeq;evidence=null;strategyReadStatus=null;paint()}
function mount(){
 if(document.getElementById("traderPaperT0"))return true;
 const parent=document.getElementById("traderPaperPreparation")?.querySelector(".paper-inner");
 if(!parent)return false;
 const el=document.createElement("section");el.id="traderPaperT0";
 el.style.cssText="margin-top:14px;border-top:1px solid #375760;padding-top:12px";
 el.innerHTML='<h4>PREUVE T0 · G1 QUALITE DES DONNEES</h4>'+
  '<p class="paper-note">Capture volontaire en lecture seule. Aucune promotion de gate.</p>'+
  '<button type="button" data-t0-capture>Capturer T0 (sans stockage)</button>'+
  '<button type="button" data-t0-reset style="margin-left:8px">Nouvelle expérience Paper · RESET</button>'+
  '<button type="button" data-paper-cycle disabled style="margin-left:8px">Demarrer Auto A · 1 cycle · STOP</button>'+
  '<button type="button" data-paper-finish disabled style="margin-left:8px">Terminer la séance</button>'+
  '<p class="paper-note">Action explicite : leve STOP manuel, demarre Auto A pour un cycle Paper local puis STOP automatique dans la meme action. Peut ouvrir une position Paper simulee qui reste a suivre. Aucun ordre reel.</p>'+
  '<pre data-t0-report style="white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.55 system-ui,sans-serif"></pre>';
 parent.appendChild(el);
 el.querySelector("[data-t0-capture]").addEventListener("click",capture);
 el.querySelector("[data-t0-reset]").addEventListener("click",beginNewSession);
 el.querySelector("[data-paper-cycle]").addEventListener("click",capturePaperOnce);
 el.querySelector("[data-paper-finish]").addEventListener("click",finishPaperExperiment);
 paint();return true;
}
if(!mount()){const onClick=()=>{if(mount())document.removeEventListener("click",onClick,true)};
 document.addEventListener("click",onClick,true);}
for(const e of ["agent-crypto:selected-market-changed","agent-crypto:quote-architecture-changed"])api.addEventListener(e,reset,{passive:true});
api.AgentCryptoTraderT0=Object.freeze({analyze,capture,mount,reset,begin_new_session:beginNewSession,session_snapshot:sessionSnapshot,paper_experiment_snapshot:paperExperimentSnapshot,capture_paper_once:capturePaperOnce,finish_paper_experiment:finishPaperExperiment,report,marketReport,marketBrief,snapshot:()=>evidence,read_only:true,gate_write:false,real_order:false,storage_write:false});
})();