/* ERITH.IA Trader · Automatic read-only study INSIDE the existing PAPER laboratory.
   No timer, private account read, trading endpoint or independent market owner. */
(()=>{
"use strict";
const core=globalThis.AgentCryptoTraderPaperDecision;
const paper=globalThis.AgentCryptoPaperLabCore;
if(!core||!paper||typeof document==="undefined")return;
const ID="traderPaperDecision",BASE="../data/crypto/radar-opportunities/";
const safe=fn=>{try{return fn()}catch(_){return null}};
const strCompact=v=>v===null||v===undefined?"inconnu":String(v);
const fmt=(value,digits=3)=>Number.isFinite(value)?
 Number(value).toLocaleString("fr-FR",{maximumFractionDigits:digits}):"indisponible";
let requestId=0,lastStudyKey="",reportCache=null,reportAt=0,reportInFlight=null;
let ticketRequest=0;
let cyclePlan=null,cycleState=null,cycleNumber=0,cycleError="";
/* Entirely local PAPER lifecycle; this UI never talks to an order endpoint. */
function cycleStatus(){
 const section=document.getElementById("traderOkxTicket");
 const out=section?.querySelector("[data-cycle-status]");
 if(!out)return;
 const state=cycleState,phase=state?.phase||"";
 const labels={
  PAPER_DRAFT:"Brouillon préparé · aucun ordre transmis",
  PAPER_SUBMITTED:"Demande fictive soumise · choisir Accepté ou Refusé",
  PAPER_ACCEPTED:"Accepté fictivement · choisir Exécution, Annulation ou État inconnu",
  PAPER_PARTIAL:"Exécution partielle · le restant peut être exécuté ou annulé",
  PAPER_FILLED:"Exécution fictive complète",
  PAPER_REJECTED:"Refus fictif · aucun nouvel achat",
  PAPER_CANCELLED:"Annulé fictivement · les quantités déjà remplies restent acquises dans l'étude",
  PAPER_UNKNOWN:"Statut incertain · aucune nouvelle soumission, réconciliation uniquement"
 };
 const lines=state?[
  "SIMULATION LOCALE · aucun ordre OKX, aucun fonds engagé",
  "ÉTAT : "+(labels[phase]||phase),
  "CT/USDC · achat LIMIT fictif : "+state.quantity+" CT à "+state.price+" USDC",
  "Exécutés fictivement : "+state.filled+" CT · restant : "+state.remaining+" CT",
  "CT revendables estimés : "+state.sellable+" · poussière : "+state.dust,
  ...(state.below_min_sell&&Number(state.filled)>0?
    ["ATTENTION : moins de "+state.min_size+" CT revendables après frais estimés."]:[]),
  "Photographie PAPER du "+state.studied_at+" · prix non garanti, aucun droit Trade."
 ]:[
  "Simulation CT/USDC · aucun ordre réel",
  "Après « Vérifier ce scénario », clique sur « Préparer la simulation ».",
  "Seules les actions possibles sont proposées à chaque étape."
 ];
 if(cycleError)lines.push("DIAGNOSTIC : "+cycleError);
 out.textContent=lines.join("\n");
 globalThis.AgentCryptoTraderOrderEntryView?.updateCycle?.(state);
 const allowed={
  create:!state||["PAPER_FILLED","PAPER_REJECTED","PAPER_CANCELLED"].includes(phase),
  abandon:phase==="PAPER_DRAFT",
  confirm:phase==="PAPER_DRAFT",accept:phase==="PAPER_SUBMITTED",
  reject:phase==="PAPER_SUBMITTED",
  unknown:["PAPER_SUBMITTED","PAPER_ACCEPTED","PAPER_PARTIAL"].includes(phase),
  partial:["PAPER_ACCEPTED","PAPER_PARTIAL"].includes(phase),
  full:["PAPER_ACCEPTED","PAPER_PARTIAL"].includes(phase),
  cancel:["PAPER_ACCEPTED","PAPER_PARTIAL"].includes(phase),
  reconcile_open:phase==="PAPER_UNKNOWN",
  reconcile_reject:phase==="PAPER_UNKNOWN"&&Number(state?.filled)===0,
  reconcile_cancel:phase==="PAPER_UNKNOWN"
 };
 for(const btn of section.querySelectorAll("[data-cycle-command]")){
  const cmd=btn.getAttribute("data-cycle-command");
  const possible=Boolean(allowed[cmd]);
  btn.hidden=!possible;
  btn.style.display=possible?"":"none";
  btn.disabled=!possible||(cmd==="create"&&!cyclePlan);
 }
 const qtyLabel=section.querySelector("[data-cycle-qty-label]");
 if(qtyLabel)qtyLabel.style.display=allowed.partial?"":"none";
}
function cycleAction(command){
 const section=document.getElementById("traderOkxTicket");
 if(!section)return;
 cycleError="";
 try{
  if(command==="abandon"){
   if(cycleState?.phase!=="PAPER_DRAFT")throw Error("Seul un brouillon peut être abandonné.");
   cycleState=null; // no trade, no pending order, no network
  }else if(command==="create"){
   if(cycleState&&!["PAPER_FILLED","PAPER_REJECTED","PAPER_CANCELLED"].includes(cycleState.phase))
     throw Error("Terminer la simulation en cours avant d'en créer une autre.");
   if(!cyclePlan)throw Error("Vérifie d'abord le ticket CT/USDC.");
   cycleState=core.startPaperLimitCycle({...cyclePlan,now:Date.now(),nonce:++cycleNumber});
   if(cycleState.ok!==true){cycleError=cycleState.reason;cycleState=null;}
  }else{
   if(!cycleState)throw Error("Créer d'abord un brouillon fictif.");
   const types={confirm:"PAPER_CONFIRM",accept:"PAPER_ACCEPT",reject:"PAPER_REJECT",
     unknown:"PAPER_UNKNOWN",partial:"PAPER_FILL_PART",full:"PAPER_FILL_REST",
     cancel:"PAPER_CANCEL",reconcile_open:"PAPER_RECONCILE_OPEN",
     reconcile_reject:"PAPER_RECONCILE_REJECT",
     reconcile_cancel:"PAPER_RECONCILE_CANCEL"};
   // The click itself is deliberate confirmation: no pointless typed
   // secret for a zero-network, non-executable PAPER state transition.
   const confirmation=command==="confirm"?"SIMULER":null;
   const quantity_ct=String(section.querySelector("[data-cycle-qty]")?.value||"").replace(",",".");
   cycleState=core.advancePaperLimitCycle(cycleState,{type:types[command],
     confirmation,quantity_ct},Date.now());
  }
 }catch(error){cycleError=String(error?.message||error).slice(0,220);}
 cycleStatus();
}

function selection(){
 const from=safe(()=>globalThis.AgentCryptoTraderPaperLab?.source?.());
 if(!from?.input)return{reason:from?.reason||
   "Graphique Solo 24 h non prêt : aucune série attribuée artificiellement."};
 const live=safe(()=>paper.qualify(from.input));
 const archived=safe(()=>core.qualifyHistoricalAsOf(from.input,paper,Date.now()));
 return{input:from.input,
   qualified:live?.ok?live:null,
   historical:archived?.ok?archived:null,
   reason:live?.ok?null:(live?.reason||"Cours actuel non qualifié."),
   historicalReason:archived?.ok?null:(archived?.reason||"Historique non qualifié.")};
}
function panel(){return document.getElementById(ID)}
function result(){return panel()?.querySelector("[data-decision-result]")}
function historyTarget(){return panel()?.querySelector("[data-decision-history]")}
function collectorTarget(){return panel()?.querySelector("[data-decision-collector]")}
function renderSpot(out){
 const element=result();if(!element)return;
 const label={PREUVES_INSUFFISANTES:"PREUVES INSUFFISANTES · marché OKX",
  REJETER:"REJETER · seulement le billet PAPER 100 USDT",
  A_ETUDIER:"À ÉTUDIER · coûts de sortie PAPER seulement"}[out?.decision]||
  "PREUVES INSUFFISANTES";
 const lines=[label,out?.reason||"Dossier public indisponible."];
 if(out?.pair)lines.push("Paire : "+out.pair+" · carnet : "+out.book_at_utc);
 if(Number.isFinite(out?.break_even_bid_rise_pct)){
   lines.push("Hausse du bid estimée pour couvrir les coûts : ≈+"+
     fmt(out.break_even_bid_rise_pct)+" % (hypothèses, sans prévision).");
   lines.push("Sortie immédiate fictive : "+fmt(out.immediate_paper_loss_pct)+
     " % · ordre non exécuté.");
 }
 if(out?.assumptions)lines.push(out.assumptions);
 if(out?.context)lines.push(out.context);
 lines.push("Aucun ordre · aucun fill · aucune suggestion d'achat · aucune donnée privée.");
 element.textContent=lines.join("\n");
 element.dataset.decision=out?.decision||"PREUVES_INSUFFISANTES";
}
function assumptions(){
 const lab=document.getElementById("traderPaperLab");
 const keys=["capital","entryFeePct","exitFeePct","spreadPct","slippagePct"];
 const obj={};
 for(const k of keys){
   const raw=lab?.querySelector("[data-lab-"+k+"]")?.value;
   const val=Number(String(raw??"").replace(",","."));
   if(!Number.isFinite(val)||String(raw??"").trim()==="")
     return null;
   obj[k]=val;
 }
 return obj;
}
function renderHistory(s){
 const element=historyTarget();if(!element)return;
 if(!s.input||!s.historical){
   element.textContent="ÉTUDE HISTORIQUE NON DISPONIBLE\n"+
     (s.historicalReason||s.reason||"Graphique ou actif non qualifié.")+
     "\nLe marché public reste consultable, sans ordre.";
   element.dataset.study="NOT_AVAILABLE";return;
 }
 const cfg=assumptions();
 if(!cfg){element.textContent="Étude historique : paramètres PAPER absents ou invalides.";
   element.dataset.study="NOT_AVAILABLE";return;}
 const key=s.historical.qualified.sourceIdentity+"|"+
   s.historical.qualified.lastAt+"|"+JSON.stringify(cfg);
 if(key===lastStudyKey)return;
 lastStudyKey=key;
 // Historical evaluation is explicitly as-of the recorded last point.
 // Never use this as-of qualification for OKX Spot or current execution.
 const study=safe(()=>paper.historicalStudy(s.input,cfg,s.historical.asOf));
 const info=core.summarizeHistorical(study,s.historical.qualified);
 if(info.status!=="HISTORICAL_ONLY"){
   element.textContent="ÉTUDE HISTORIQUE NON DISPONIBLE · "+
     (study?.reason||info.reason)+"\nAucune transaction ni performance inventée.";
   element.dataset.study="NOT_AVAILABLE";return;
 }
 element.textContent=[
   "ÉTUDE HISTORIQUE DIFFÉRÉE · "+info.asset+" · 24 heures de cours USD",
   "Dernier prix de la série : "+info.source_to_utc+
     " · décalage ≈ "+fmt(s.historical.ageMinutes,1)+" min. "+
     "Ce cours n'est PAS une cotation de trading actuelle.",
   info.windows+" fenêtres de 60 min chevauchantes · "+
     fmt(info.positive_windows_pct,1)+" % positives après frais fictifs.",
   "Médiane : "+fmt(info.median_profit_notional_usd,5)+
     " USD notionnels par fenêtre pour "+fmt(info.capital_notional_usd,2)+" USD fictifs.",
   "Meilleure : "+fmt(info.best_profit_notional_usd,5)+
     " USD · pire : "+fmt(info.worst_profit_notional_usd,5)+" USD.",
   "Du "+info.source_from_utc+" au "+info.source_to_utc+".",
   info.reason,
   "Ce calcul lit le graphique actuel, pas un carnet OKX. Il ne suppose aucun gain réel."
 ].join("\n");
 element.dataset.study="HISTORICAL_ONLY";
}
async function reports(){
 if(reportCache&&Date.now()-reportAt<5*60000)return reportCache;
 if(reportInFlight)return reportInFlight;
 reportInFlight=(async()=>{
   const [qResp,sResp]=await Promise.all([
     fetch(BASE+"qualification-latest.json",{cache:"no-store"}),
     fetch(BASE+"signal-evidence.json",{cache:"no-store"})
   ]);
   if(!qResp.ok||!sResp.ok)throw Error("Rapports publics non disponibles");
   const [qualification,signal]=await Promise.all([qResp.json(),sResp.json()]);
   // A missing new prospective journal is NOT zero studies or an outage of history.
   const [journal,health]=await Promise.all([
     fetch(BASE+"okx-hurdle-followups.json",{cache:"no-store"})
       .then(r=>r.ok?r.json():null).catch(()=>null),
     fetch(BASE+"radar-automation-health.json",{cache:"no-store"})
       .then(r=>r.ok?r.json():null).catch(()=>null)
   ]);
   return{qualification,signal,journal,health};
 })();
 try{
   const x=await reportInFlight;
   reportCache=x;reportAt=Date.now();return x;
 }finally{reportInFlight=null;}
}
async function evaluate(force=false){
 const container=panel();
 if(!container?.open||!document.getElementById("traderPaperLab")?.open)return;
 const s=selection();
 const key=s.historical?s.historical.qualified.sourceIdentity+"|"+
   s.historical.qualified.lastAt:
   "unavailable|"+(s.historicalReason||s.reason);
 if(!force&&key===container.dataset.lastSelection)return;
 container.dataset.lastSelection=key;
 const currentId=++requestId;
 renderHistory(s);
 if(!s.qualified){
   renderSpot({decision:"PREUVES_INSUFFISANTES",
     reason:"Cotation actuelle indisponible : "+(s.reason||
       "graphique hors fenêtre live 15 min")+
       ". Le calcul historique ci-dessus est indépendant."});
 }else{
   const target=result();if(target)target.textContent=
      "Diagnostic OKX : vérification du dernier rapport public…";
 }
 try{
   const {qualification,signal,journal,health}=await reports();
   if(currentId!==requestId||!container.open)return;
   const collector=collectorTarget();
   if(collector){
     const valid=journal?.schema==="erith.radar.okx.hurdle-followups.v1"&&
       journal.orders_enabled===false&&journal.real_orders===0&&
       Array.isArray(journal.studies)&&Array.isArray(journal.snapshots);
     const count=valid?journal.studies.length:0;
     const follow=valid?journal.studies.reduce((n,s)=>n+(
       Array.isArray(s.followups)?s.followups.length:0),0):0;
     const states={
       WAITING_DAILY_ARCHIVE:"Archive Radar du jour en attente de collecte.",
       DAILY_ARCHIVE_MISSING:"Archive Radar du jour ABSENTE après la collecte de secours.",
       WAITING_TODAY_QUALIFICATION:"Archive reçue, qualification Spot du jour en attente.",
       QUALIFICATION_MISSING:"Qualification Spot du jour ABSENTE après la collecte de secours.",
       JOURNAL_NOT_PUBLISHED_FOR_TODAY:"Qualification reçue, journal PAPER du jour MANQUANT.",
       PROSPECTIVE_JOURNAL_PUBLISHED:"Qualification et journal PAPER du jour publiés."
     };
     const lastHealth=health?.schema==="erith.radar.automation-health.v1"&&
       health.orders_enabled===false&&health.real_orders===0&&
       typeof health.checked_at_utc==="string"&&
       Number.isFinite(Date.parse(health.checked_at_utc))?health:null;
     const healthAge=lastHealth?Date.now()-Date.parse(lastHealth.checked_at_utc):Infinity;
     const status=lastHealth&&healthAge>=0&&healthAge<=18*3600000?
       (states[lastHealth.status]||"État de collecte non reconnu.") :
       "Qualification Radar Spot/USDT : contrôle GitHub du collecteur historique absent ou périmé ; état du journal Seven Spot/USDC indépendant.";
     collector.textContent="Radar automatique · ancien collecteur de qualification Spot/USDT : "+status+
       "\nDernier contrôle : "+(lastHealth?.checked_at_utc||"non publié")+
       " · dernière qualification : "+(qualification?.qualified_at_utc||"inconnue")+
       "\n"+(valid?("Journal OKX publié : "+count+" études PAPER datées · "+follow+
         " observations futures. Aucun fill certifié.") :
         "Journal OKX non publié : aucune observation future ne peut être affirmée.")+
       "\nLes horaires programmés ne constituent pas une preuve d'exécution.";
   }
   // Report status is independent of the ability to trade on a live graph.
   if(s.qualified){
     const latest=selection();
     if(!latest.qualified||latest.qualified.sourceIdentity!==s.qualified.sourceIdentity||
        latest.qualified.lastAt!==s.qualified.lastAt)return;
     renderSpot(core.assess({selected:latest.qualified,qualification,signal,
       engine:globalThis.AgentCryptoSpotPaperOrders,now:Date.now()}));
   }
 }catch(_){
   if(currentId===requestId){const collector=collectorTarget();
     if(collector)collector.textContent="Qualification Radar Spot/USDT : rapports momentanément inaccessibles. Le journal Spot/USDC Seven Capital est indépendant.";
     if(s.qualified)renderSpot({decision:"PREUVES_INSUFFISANTES",
       reason:"Rapports publics Radar momentanément inaccessibles ; "+
       "l'étude historique ci-dessus reste disponible."});}
 }
}
/* A new candle is not a new market: ticket identity excludes lastAt. */
function ticketSourceKey(input){
 if(!input)return "";
 return [String(input.asset||"").toUpperCase(),
  String(input.coinId||"").toLowerCase(),
  String(input.provider||"").toLowerCase(),
  String(input.instrument||"").toUpperCase().replace("/","-"),
  String(input.currency||"").toUpperCase(),
  String(input.source||"")].join("|");
}
function invalidate(){
 const box=panel();if(!box?.open)return;
 const s=selection();
 const nextSourceKey=ticketSourceKey(s.input);
 const ticket=document.getElementById("traderOkxTicket");
 if(ticket?.open&&ticket.dataset.ticketSourceKey&&
    nextSourceKey!==ticket.dataset.ticketSourceKey){
   ticketRequest++;
   cyclePlan=null;cycleState=null;
   globalThis.AgentCryptoTraderOrderEntryView?.reset?.();
   if(typeof cycleStatus==="function")cycleStatus();
   ticket.dataset.ticketSourceKey=nextSourceKey;
   ticketStatus("Actif du graphique modifié. Refaire le ticket ; aucun ancien prix n'est réutilisé.");
 }
 const next=s.historical?s.historical.qualified.sourceIdentity+"|"+
   s.historical.qualified.lastAt:
   "unavailable|"+(s.historicalReason||s.reason);
 if(next===box.dataset.lastSelection)return;
 requestId++;
 lastStudyKey="";
 void evaluate(false);
}
/* Order planning never reads account secrets or creates an exchange order.
   Only the owner's separate read-only Bridge panel can verify Trading funds. */
function ticketTarget(){return document.getElementById("traderOkxTicket")?.querySelector("[data-ticket-report]")}
function ticketStatus(text,brief=null){
 const target=ticketTarget();
 if(target)target.textContent=text;
 const summary=document.getElementById("traderOkxTicket")?.querySelector("[data-ticket-brief]");
 if(summary)summary.textContent=brief||
   "Vérification en cours ou à relancer · AUCUN ordre possible.";
}
/* Reconcile the public archive's preliminary blockers only after the
   existing read-only account owner provides a qualified private snapshot. */
function ticketRemainingBlockers(ticket,review){
 const src=Array.isArray(ticket?.blockers)?ticket.blockers:[];
 const balance="Solde du compte Trading et devise réellement disponibles non vérifiés.";
 const fees="Frais réels de ce compte et de cette paire non vérifiés.";
 const accountOk=review?.account_verified===true&&review.available_trading_quote!==null;
 const feesOk=review?.fees_verified===true;
 const remaining=src.filter(message=>
   !(message===balance&&accountOk)&&!(message===fees&&feesOk));
 if(accountOk&&!review.funds_cover_public_scenario)
   remaining.push("Couverture du coût fictif par le solde Trading non démontrée.");
 if(review?.spot_gates?.verified&&!review.spot_gates.proposed_within_max_buy)
   remaining.push("Quantité PAPER supérieure au plafond d'achat du compte : ce scénario brut est incompatible avec maxBuy.");
 if(review?.spot_gates?.verified&&!review.spot_gates.rules_match)
   remaining.push("Les règles Spot du carnet et celles du compte ne concordent pas.");
 if(review?.spot_gates?.verified&&!review.spot_gates.book_fresh)
   remaining.push("Carnet non actuel : nouvelle cotation indispensable avant tout projet d'ordre.");
 return [...new Set(remaining)];
}
/* Public CT/USDC Backend route, also used by IA Concrete.
   Only when a human verifies the PAPER ticket; never polls or sends keys. */
async function readSpotPublicBook(pair){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),6500);
 try{
  const response=await fetch(
   "http://127.0.0.1:8790/market-book?provider=okx&instrument="+encodeURIComponent(pair)+"&limit=100",
   {method:"GET",cache:"no-store",credentials:"omit",signal:controller.signal});
  if(!response.ok)throw Error("Backend carnet "+pair+" HTTP "+response.status);
  return await response.json();
 }finally{clearTimeout(timeout);}
}
/* OKX Public Data already used by IA Concrete. One anonymous request per
   operator-triggered PAPER ticket check; does not grant order access. */
async function readSpotPublicInstrument(pair){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),4500);
 try{
  const response=await fetch(
   "https://www.okx.com/api/v5/public/instruments?instType=SPOT&instId="+encodeURIComponent(pair),
   {method:"GET",mode:"cors",credentials:"omit",cache:"no-store",
    headers:{Accept:"application/json"},signal:controller.signal});
  if(!response.ok)throw Error("Règles OKX publiques HTTP "+response.status);
  const payload=await response.json();
  return {observed_at_utc:new Date().toISOString(),payload};
 }finally{clearTimeout(timeout);}
}
async function prepareTicket(){
 cyclePlan=null;cycleStatus();
 globalThis.AgentCryptoTraderOrderEntryView?.reset?.();
 const box=document.getElementById("traderOkxTicket");
 if(!box?.open)return;
 const current=++ticketRequest;
 const from=safe(()=>globalThis.AgentCryptoTraderPaperLab?.source?.());
 const source=from?.input;
 if(!source){
   ticketStatus("Aucun graphique Solo 24 h identifié. "+(from?.reason||"Aucune source.")+
     "\nAucun ordre ni réservation de fonds.");return;
 }
 const sourceKey=ticketSourceKey(source);
 box.dataset.ticketSourceKey=sourceKey;
 const quote=box.querySelector("[data-ticket-quote]")?.value;
 const money=String(box.querySelector("[data-ticket-budget]")?.value||"").trim().replace(",",".");
 const desired=String(box.querySelector("[data-ticket-exit]")?.value||"").trim().replace(",",".");
 const pair=String(source.asset||"")+"-"+quote;
 const warning=box.querySelector("[data-od-ticket-warning]");
 if(warning)warning.textContent="Étude PAPER de la paire native "+pair+
   " ; carnet OKX public exact et archivé si la lecture actuelle échoue. "+
   "Aucun fonds engagé, aucune permission Trade. "+
   (pair==="CT-USDC"?"Compte OKX lu via le Bridge existant, en lecture seule.":
    "Compte "+pair+" : solde Trading et frais consultables via le Bridge après vérification de la paire exacte ; maxBuy non certifié.");
 const choice=core.qualifyPaperSpotSelection({selected:source,pair});
 if(!choice?.ok){
   ticketStatus("Paire non qualifiée : "+String(choice?.reason||"identité absente")+
     " Aucun carnet ni règle d'un autre actif n'a été utilisé.");
   return;
 }
 // First checked UI cohort; no silent public pair substitution or exchange fill.
 if(!["CT-USDC","BTC-USDC"].includes(pair)){
   ticketStatus("Golden Ticket en extension : "+pair+
     ". Aucune preuve privée ni aucun ordre sur cette paire.");
   return;
 }
 ticketStatus("Vérification des preuves publiques du carnet "+pair+
   " et des contrôles du compte disponibles (PAPER uniquement)…");
 try{
   const stateResponse=await fetch("../data/crypto/okx-hourly/latest.json",
     {cache:"no-store",credentials:"omit"});
   if(!stateResponse.ok)throw Error("État de collecte non publié : HTTP "+stateResponse.status);
   const state=await stateResponse.json();
   if(state?.schema!=="erith.radar.okx-hourly-health.v1"||
      state.orders_enabled!==false||state.real_orders!==0||
      !/^\d{4}-\d\d-\d\d$/.test(String(state.date_utc||"")))
     throw Error("Index public de collecte incompatible.");
   const archiveResponse=await fetch("../data/crypto/okx-hourly/"+
     state.date_utc+".json",{cache:"no-store",credentials:"omit"});
   if(!archiveResponse.ok)throw Error("Carnet daté absent : HTTP "+archiveResponse.status);
   const archive=await archiveResponse.json();
   const fresh=safe(()=>globalThis.AgentCryptoTraderPaperLab?.source?.()?.input);
   if(current!==ticketRequest||!box.open||
      ticketSourceKey(fresh)!==sourceKey)return;
   // Read ONLY exact public pairs. Native book/rules remain independent
   // from chart prices and from private CT-specific account capabilities.
   let liveBook=null,instrumentEvidence=null,bookTransportIssue=null;
   const [book,rule]=await Promise.allSettled([
     readSpotPublicBook(pair),readSpotPublicInstrument(pair)]);
   if(book.status==="fulfilled")liveBook=book.value;
   else{
     const failure=book.reason;
     const http=String(failure?.message||"").match(/HTTP (\d{3})/);
     bookTransportIssue=failure?.name==="AbortError"?
       "TIMEOUT : Backend local non répondu en 6,5 s.":
       http?"HTTP "+http[1]+" : route du carnet "+pair+" inaccessible.":
       "RÉSEAU LOCAL : Backend arrêté ou accès refusé par Firefox/CORS.";
   }
   if(rule.status==="fulfilled")instrumentEvidence=rule.value;
   const afterBook=safe(()=>globalThis.AgentCryptoTraderPaperLab?.source?.()?.input);
   if(current!==ticketRequest||!box.open||
      ticketSourceKey(afterBook)!==sourceKey)return;
   const evaluatedAt=Date.now();
   const bookDiagnostic=bookTransportIssue?
     {accepted:false,code:"LOCAL_REQUEST_FAILED",reason:bookTransportIssue}:
     core.diagnoseSpotLiveBook(liveBook,pair,evaluatedAt);
   const answer=core.prepareSpotTicket({selected:source,archive,pair,
     budgetQuote:money,liveBook,instrumentEvidence,now:evaluatedAt});
   const lines=[
     "TICKET D'ÉTUDE SPOT · LECTURE SEULE",
     "Paire recherchée : "+pair+" · budget d'étude : "+money+" "+quote+
       " (PAS le solde de ton compte)",
     answer.source_book_at_utc?
       "Carnet "+pair+" : "+(["LOCAL_BACKEND_OKX_CT_USDC","LOCAL_BACKEND_OKX_SPOT"].includes(answer.source_book_kind)?
         "Backend public local OKX":"archive horaire GitHub")+ " · "+
         answer.source_book_at_utc+" · décalage "+answer.book_age_minutes+" min.":
       "Source non qualifiée.",
     answer.reason,
   ];
   lines.push("DIAGNOSTIC CARNET "+pair+" · "+bookDiagnostic.code+
     " · "+bookDiagnostic.reason);
   if(bookDiagnostic.accepted&&
      !["LOCAL_BACKEND_OKX_CT_USDC","LOCAL_BACKEND_OKX_SPOT"].includes(answer.source_book_kind))
     lines.push("Carnet reçu mais étude non retenue : prix/tick/règles à comparer.");
   if(!bookDiagnostic.accepted)
     lines.push("Repli historique GitHub uniquement : aucune cotation "+pair+" actuelle prouvée.");
   if(answer.native_min_quantity){
     lines.push(answer.native_rules_verified?
       "Règles Spot "+pair+" : OKX Public Data vérifié · état LIVE · lues "+
         answer.native_rules_observed_at_utc+".":
       "Règles Spot issues du relevé daté "+answer.native_rules_observed_at_utc+
         " ; validité actuelle à confirmer auprès d'OKX.");
     lines.push("minSz "+answer.native_min_quantity+" "+answer.base+" · lotSz "+
       answer.native_lot+" "+answer.base+" · tickSz "+answer.native_tick+" "+quote+".");
     lines.push("Minimum brut pour revendre au moins "+answer.native_min_quantity+
       " "+answer.base+" après des frais hypothétiques de 0,10 % prélevés en "+
       answer.base+" : "+answer.minimum_gross_buy_to_resell_with_assumed_base_fee+
       " "+answer.base+" · coût fictif à l'ask : "+
       answer.minimum_gross_buy_cost_at_ask_with_assumed_base_fee+" "+quote+".");
     lines.push("Frais débités en "+answer.base+
       " : HYPOTHÈSE, devise réelle et arrondis non prouvés.");
     lines.push("Notionnel minimal, maxima et filtres du compte : NON CERTIFIÉS par le public.");
     lines.push("Minimum natif : "+answer.native_min_quantity+" "+answer.base+
       " · valeur indicative "+answer.minimum_buy_at_recorded_ask_quote+" "+quote);
     lines.push("Étude publique AVANT plafonds du compte — quantité non définitive.");
     lines.push("Achat LIMIT étudié au ask "+(["LOCAL_BACKEND_OKX_CT_USDC","LOCAL_BACKEND_OKX_SPOT"].includes(answer.source_book_kind)?
       "récent du Backend":"archivé")+" : "+answer.best_ask_quote+" "+quote+
       " · quantité brute "+answer.gross_buy_quantity+" "+answer.base);
     lines.push("Après frais BASE fictifs et arrondi au lot : "+
       answer.sellable_lot_quantity+" "+answer.base+
       " revendables en taille (pas un fill).");
     lines.push("Coût fictif : "+answer.hypothetical_buy_cost_quote+" "+quote+
       " · sortie fictive au bid "+(["LOCAL_BACKEND_OKX_CT_USDC","LOCAL_BACKEND_OKX_SPOT"].includes(answer.source_book_kind)?
         "récent":"archivé")+" après frais : "+
       answer.hypothetical_immediate_exit_quote+" "+quote);
     if(answer.hypothetical_break_even_bid_quote)
       lines.push("Bid théorique d'équilibre après frais fictifs : "+
         answer.hypothetical_break_even_bid_quote+" "+quote+
         " · ni cible de cours ni signal d'achat.");
     lines.push(answer.assumptions);
   }
   if(answer.blockers?.length)lines.push("BLOCAGES :\n• "+answer.blockers.join("\n• "));
   lines.push("STATUT : AUCUN ORDRE POSSIBLE DEPUIS CE TICKET.");
   ticketStatus(lines.join("\n")+"\nCOMPTE OKX : vérification lecture seule en cours…");
   box.dataset.ticketResult=answer.status;
   // Reuse the only Aether Trust account owner, not a second private fetch.
   let context=null,privateIssue="";
   // Shared account owner already supports exact BTC-USDC account + fee
   // reads. Only CT/USDC has account-specific R25 max-size/feeType proof;
   // BTC never receives those CT-only gates from this routine.
   try{
     const owner=globalThis.AgentCryptoTraderOkxAccount;
     if(typeof owner?.ticketReadOnly==="function"){
       context=await owner.ticketReadOnly(pair);
       if(context?.instId!==pair||context?.read_only!==true||
          context?.orders_enabled!==false||context?.real_orders!==0){
         context=null;
         privateIssue="Provenance du compte "+pair+" non qualifiée : lecture rejetée.";
       }else privateIssue=String(context?.reason||"").slice(0,180);
     }else privateIssue="Module de compte OKX indisponible.";
   }catch(_){
     privateIssue="Lecture du compte "+pair+" interrompue ; session Bridge à vérifier.";
   }
   const currentSource=safe(()=>globalThis.AgentCryptoTraderPaperLab?.source?.()?.input);
   if(current!==ticketRequest||!box.open||
      ticketSourceKey(currentSource)!==sourceKey||
      box.querySelector("[data-ticket-quote]")?.value!==quote||
      String(box.querySelector("[data-ticket-budget]")?.value||"").trim().replace(",",".")!==money||
      String(box.querySelector("[data-ticket-exit]")?.value||"").trim().replace(",",".")!==desired)
     return;
   const review=core.reviewSpotTicketAccount(answer,context,Date.now());
   const accountLines=[
     "COMPTE OKX · "+(review.account_at_utc||"lecture non validée"),
     ...(privateIssue?["Contrôle privé : "+privateIssue]:[]),
     review.available_trading_quote===null?
       "Solde disponible Trading "+quote+" : INCONNU.":
       "Solde disponible Trading "+quote+" : "+review.available_trading_quote+" "+quote+".",
     review.available_funding_quote===null?
       "Solde Financement "+quote+" : inconnu.":
       "Solde Financement "+quote+" : "+review.available_funding_quote+" "+quote+
         " (NON utilisable comme solde Trading).",
     review.fees_verified?
       "Frais du compte "+pair+" · maker "+review.fee_maker_pct+
         " % · taker "+review.fee_taker_pct+" %.":
       "Frais de cette paire : non certifiés ; les frais fictifs restent séparés.",
     ...(!review.fees_verified&&context?.fee_reason?
       ["Diagnostic frais : "+context.fee_reason]:[]),
     ...(pair==="CT-USDC"?[review.fee_mode_verified?
       "Mode des frais d'achat OKX vérifié à "+context.fee_type_at_utc+
         " : feeType="+review.fee_type+" · prélèvement en "+review.fee_buy_currency+
         " (mode du compte, non preuve d'un fill).":
       "Mode des frais d'achat CT/USDC : NON CONFIRMÉ · "+
         String(context?.fee_type_reason||"Bridge privé ou session Aether Trust à vérifier.")]:
       ["Mode des frais d'achat "+pair+" : NON CERTIFIÉ malgré la lecture éventuelle des taux maker/taker."]),
     ...(pair==="CT-USDC"?(()=>{
       const gates=context?.order_gates;
       if(!gates)return ["CONTROLES SPOT COMPTE : NON CONFIRMÉS · "+
          String(context?.order_gates_reason||"Bridge R25 et Aether Trust requis.")];
       const result=[
         "CONTROLES SPOT COMPTE · "+
           String(context.order_gates_at_utc||"heure inconnue")+
           " · "+(context.order_gates_verified?"preuves de lecture complètes":"preuves PARTIELLES"),
         "Identité du compte : "+(gates.account_eligible?"CT-USDC · règlement USDC reconnu":
           "NON CERTIFIÉ — aucune paire substituée (CT-USD reste distincte)."),
         "OKX max-avail-size : "+(gates.available_verified?
            "achat disponible "+gates.availBuy+" USDC · vente disponible "+gates.availSell+" CT":
            "NON CERTIFIÉ"),
         "OKX max-size : "+(gates.account_max_verified?
            "quantité achat "+gates.maxBuy+" CT · quantité vente "+gates.maxSell+
              " (vérifier unités selon réponse OKX)":"NON CERTIFIÉ"),
         "Limites publiques : "+(gates.public_rules_verified?
            "min "+gates.minSz+" CT · lot "+gates.lotSz+
             " CT · tick "+gates.tickSz+" USDC":"NON CERTIFIÉ"),
         "Plafonds LIMIT : maxLmtSz "+(gates.maxLmtSz||"NON CONFIRMÉ")+
            " CT · maxLmtAmt "+(gates.maxLmtAmt||"NON CONFIRMÉ")+" USD (distinct d'USDC).",
         "Bandes de prix : "+(gates.price_limits_verified?
            "borne achat "+gates.buyLmt+" · borne vente "+gates.sellLmt+" (cotation native)":
            "NON CERTIFIÉ"),
       ];
       if(Array.isArray(gates.blocked_reasons)&&gates.blocked_reasons.length)
         result.push("Raisons : "+gates.blocked_reasons.join(" ; "));
       result.push("PREPARATION SEULEMENT · aucune autorisation Trade ; aucun ordre envoyable.");
       return result;
     })():[]),
     review.spot_gates?.verified&&!review.scenario_within_account_max_buy?
       "ALERTE : montant USDC potentiellement suffisant, MAIS quantité PAPER supérieure à maxBuy OKX · vérifier la simulation plafonnée.":
       review.fee_type==="1"&&review.fee_mode_verified?
       "Frais en USDC : le coût du premier achat brut dépasse éventuellement le budget ; voir scénario réajusté ci-dessous.":
       review.funds_cover_public_scenario?
       "Solde Trading couvrant uniquement le coût FICTIF du carnet choisi (pas une preuve de faisabilité).":
       "Solde Trading insuffisant ou non vérifié pour ce scénario.",
     review.reason,
     "AUCUN achat, vente, transfert ni réservation de fonds."
   ];
   let verifiedExit=null;
   if(desired){
    const qualifiedAt=Date.now();
    const exit=core.previewSpotExit({ticket:answer,context,
      targetPriceQuote:desired,now:qualifiedAt});
    verifiedExit=exit;
    if(pair==="CT-USDC"&&exit?.status==="ETUDE_SORTIE")
      cyclePlan={ticket:answer,context,preview:exit,qualifiedAt};
    const exitLines=[
      "REVENTE À TON PRIX · "+desired+" "+quote+" · SIMULATION, AUCUN ORDRE",
      exit.status==="SORTIE_NON_EVALUABLE"?
        "Calcul indisponible : "+exit.reason:
        "Achat étudié : "+exit.buy_quantity+" "+exit.base+
          " (prix du carnet "+(["LOCAL_BACKEND_OKX_CT_USDC","LOCAL_BACKEND_OKX_SPOT"].includes(answer.source_book_kind)?
            "récent":"archivé")+", pas un achat actuel)."
    ];
    if(exit.maximum_sellable_base!==undefined){
      if(exit.limit_proof_verified){
        exitLines.push("Contrôle R25 : quantité limite du compte "+exit.account_max_buy_base+
          " CT · comparaison indicative, max-size ne garantit pas le prix du carnet.");
        if(exit.order_gates_adjusted)
          exitLines.push("QUANTITÉ PAPER CORRIGÉE : "+exit.original_paper_buy_quantity+
            " CT → "+exit.buy_quantity+" CT pour ne pas dépasser le maxBuy lu.");
      }else{
        exitLines.push("Plafond de quantité R25 non prouvé : calcul indicatif non qualifié.");
      }
      if(!exit.book_fresh_for_execution)
        exitLines.push("Carnet ancien ou non qualifié : prix historique uniquement, aucun ordre possible.");
      if(exit.quote_fee_budget_adjusted){
        exitLines.push("Mode compte USDC : quantité PAPER recalculée pour inclure les frais d'achat dans le budget fictif.");
        exitLines.push("Frais d'achat estimés : "+exit.estimated_buy_fee_quote+
          " USDC · coût total estimé "+exit.total_buy_cost_quote+" USDC (non exécuté).");
      }else if(exit.buy_fee_currency_verified){
        exitLines.push("Mode compte CT : frais d'achat prélevés en CT ; arrondis d'exécution non prouvés.");
      }else{
        exitLines.push("Devise des frais non certifiée : simulation hypothétique avec frais d'achat en CT.");
      }
      exitLines.push("Après frais d'achat estimés : "+exit.estimated_net_base+" "+exit.base+".");
      exitLines.push("À revendre au maximum : "+exit.maximum_sellable_base+" "+exit.base+
        " · poussière restante : "+exit.residual_dust_base+" "+exit.base+".");
      exitLines.push(exit.meets_native_exit_minimum?
        "Minimum de vente respecté dans la simulation.":
        "ATTENTION : pas assez de "+exit.base+" après frais pour respecter le minimum de vente !");
      if(exit.meets_native_exit_minimum===false){
        exitLines.push("VENTE NON ADMISSIBLE : "+exit.maximum_sellable_base+
          " "+exit.base+" sous le minimum Spot ; aucune somme encaissable dans ce scénario.");
        exitLines.push("Valorisation MATHÉMATIQUE seulement à "+desired+" : "+
          exit.hypothetical_sale_net_quote+" "+quote+
          " ; ceci N'EST PAS le produit d'une vente réalisable.");
        exitLines.push("Variation mathématique NON RÉALISABLE : "+
          exit.hypothetical_profit_quote+" "+quote+
          " (frais et poussière supposés ; aucun gain).");
      }else{
        exitLines.push("Si la vente était admissible et exécutée entièrement à "+
          desired+" : "+exit.hypothetical_sale_net_quote+
          " "+quote+" hypothétiques après frais.");
        exitLines.push("Variation conditionnelle de l'étude : "+
          exit.hypothetical_profit_quote+" "+quote+
          " (poussière non valorisée ; aucun ordre exécuté).");
      }
      exitLines.push(exit.fees_verified?
        "Frais de la paire exacte lus via le compte OKX, taux le plus défavorable retenu.":
        "Frais "+pair+" NON certifiés : hypothèse de 0,10 % de chaque côté.");
      exitLines.push(exit.funds_cover_public_scenario?
        "Solde Trading couvrant le scénario PAPER plafonné, sans garantie de marché ni permission d'ordre.":
        "Solde Trading indisponible, inconnu ou insuffisant pour ce scénario.");
      if(!exit.full_exit_without_dust)
        exitLines.push("100 % peut laisser cette poussière : sortie exactement à zéro "+
          exit.base+" non garantie.");
    }
    exitLines.push("Aucun ordre. Le prix futur, l'exécution et les arrondis exacts "+
      "de l'échange ne sont pas garantis.");
    accountLines.push("\n"+exitLines.join("\n"));
  }
  const remaining=ticketRemainingBlockers(answer,review);
  const finalLines=lines.map(line=>
    line.startsWith("BLOCAGES :\n")?
      "BLOCAGES RESTANTS :\n• "+remaining.join("\n• "):
    line.startsWith("Frais débités en CT : HYPOTHÈSE")&&review.fee_mode_verified?
      "Calcul public initial : hypothèse frais CT ; mode du compte qualifié et simulation recalculée plus bas.":
    line);
  const actualLive=bookDiagnostic?.accepted&&
    ["LOCAL_BACKEND_OKX_CT_USDC","LOCAL_BACKEND_OKX_SPOT"].includes(answer.source_book_kind);
  const brief=[
    "CARNET "+pair+" · "+(actualLive?"RÉCENT OKX ACCEPTÉ":
      "ARCHIVE UNIQUEMENT — "+(bookDiagnostic?.code||"INCONNU")),
    "COMPTE · "+(pair!=="CT-USDC"?
      (review.account_verified?"Trading "+strCompact(review.available_trading_quote)+
        " "+quote+" vérifié pour "+pair+" ; maxBuy et feeType NON CERTIFIÉS.":
        "Solde Trading non certifié pour "+pair+" ; PAPER uniquement."):
     review.spot_gates?.verified?
      (review.scenario_within_account_max_buy?
        "Contrôles du compte lus · scénario brut dans maxBuy.":
        "Quantité brute supérieure à maxBuy · simulation plafonnée."):
      "Limites de compte non entièrement vérifiées."),
    "PRIX · "+(actualLive?"Carnet daté récent, sans garantie d'exécution.":
      "Aucune cotation actuelle certifiée."),
    "ORDRES · AUCUN achat ni vente possible depuis ce ticket.",
    "Le rapport technique complet est replié ci-dessous."
  ].join("\n");
  ticketStatus(finalLines.join("\n")+"\n\n"+accountLines.join("\n"),brief);
  globalThis.AgentCryptoTraderOrderEntryView?.update?.({
    ticket:answer,context,review,preview:verifiedExit,bookDiagnostic,
    checkedAt:context?.order_gates_at_utc||null
  });
  cycleStatus();
 }catch(error){
   if(current===ticketRequest)ticketStatus("Ticket indisponible : "+
     String(error?.message||error)+
     "\nAucun ordre ni montant engagé.");
 }
}
function mount(){
 const lab=document.getElementById("traderPaperLab");
 if(!lab||panel())return Boolean(lab);
 const parent=lab.querySelector(".pl-body");if(!parent)return false;
 const section=document.createElement("details");
 section.id=ID;section.className="pl-more";
 const summary=document.createElement("summary");
 summary.textContent="Diagnostic automatique · historique et Spot OKX · lecture seule";
 const content=document.createElement("div");
 const explanation=document.createElement("p");
 explanation.textContent="À l'ouverture, étudie automatiquement la crypto Solo 24 h "+
  "déjà qualifiée. L'historique utilise les prix USD du graphique et des frais "+
  "hypothétiques ; la possibilité de vendre sur OKX demande des preuves distinctes.";
 const history=document.createElement("pre");
 history.setAttribute("data-decision-history","");
 history.setAttribute("role","status");
 history.textContent="Étude du graphique en attente d'ouverture.";
 const label=document.createElement("p");
 label.textContent="Faisabilité du carnet OKX/USDT (lecture des derniers rapports publics) :";
 const button=document.createElement("button");
 button.type="button";button.textContent="Actualiser l'analyse";
 button.setAttribute("data-decision-evaluate","");
 const collector=document.createElement("pre");
 collector.setAttribute("data-decision-collector","");
 collector.textContent="Collectes GitHub : état en attente de vérification publique.";
 const evidence=document.createElement("pre");
 evidence.setAttribute("data-decision-result","");
 evidence.setAttribute("role","status");evidence.setAttribute("aria-live","polite");
 evidence.textContent="Preuves Spot OKX en attente. Aucun ordre.";
 const ticket=document.createElement("details");
 ticket.id="traderOkxTicket";ticket.className="pl-more";
 const ticketHeading=document.createElement("summary");
 ticketHeading.textContent="Préparer un ticket OKX LIMIT · sans ordre ni fonds engagés";
 const ticketBox=document.createElement("div");
 const warning=document.createElement("p");
 warning.textContent="Étude PAPER de la paire Spot sélectionnée, sans ordre ni fonds engagés.";
 warning.setAttribute("data-od-ticket-warning","");
 const quoteLabel=document.createElement("label");
 quoteLabel.textContent="Devise de cotation (paire OKX vérifiée) ";
 const quoteSelect=document.createElement("select");
 quoteSelect.setAttribute("data-ticket-quote","");
 for(const q of ["USDC","USDT","EUR"]){
   const option=document.createElement("option");
   option.value=q;option.textContent=q;quoteSelect.appendChild(option);
 }
 quoteLabel.appendChild(quoteSelect);
 const budgetLabel=document.createElement("label");
 budgetLabel.textContent="Budget fictif, pas un solde du compte ";
 const budget=document.createElement("input");
 budget.setAttribute("data-ticket-budget","");
 budget.setAttribute("inputmode","decimal");budget.value="5";
 budgetLabel.appendChild(budget);
 const exitLabel=document.createElement("label");
 exitLabel.textContent="Prix de vente souhaité par unité de crypto (USDC) ";
 const exitInput=document.createElement("input");
 exitInput.setAttribute("data-ticket-exit","");
 exitInput.setAttribute("inputmode","decimal");
 exitInput.placeholder="0,39";
 exitLabel.appendChild(exitInput);
 const compute=document.createElement("button");
 compute.type="button";compute.textContent="Vérifier ce scénario (aucun ordre)";
 const brief=document.createElement("pre");
 brief.setAttribute("data-ticket-brief","");
 brief.setAttribute("role","status");brief.setAttribute("aria-live","polite");
 brief.textContent="Vérification non lancée · Aucun ordre.";
 const technical=document.createElement("details");
 technical.setAttribute("data-ticket-technical","");
 const technicalHeading=document.createElement("summary");
 technicalHeading.textContent="Afficher le rapport technique complet";
 const output=document.createElement("pre");
 output.setAttribute("data-ticket-report","");
 output.setAttribute("role","status");output.setAttribute("aria-live","off");
 output.textContent="Ouvre ce panneau et lance la vérification des contraintes OKX. Aucun ordre.";
 technical.append(technicalHeading,output);
 const cycle=document.createElement("details");
 cycle.setAttribute("data-cycle-paper","");
 cycle.className="pl-more";
 const cycleHeading=document.createElement("summary");
 cycleHeading.textContent="Cycle LIMIT · laboratoire de validation (simulation)";
 const cycleContents=document.createElement("div");
 const cycleWarning=document.createElement("p");
 cycleWarning.textContent="Simulation LOCALE : aucune requête OKX et aucun achat. "+
   "Les boutons apparaissent uniquement lorsqu'ils ont un sens. "+
   "Refuser se fait avant acceptation ; annuler, après acceptation.";
 const cycleReadout=document.createElement("pre");
 cycleReadout.setAttribute("data-cycle-status","");
 cycleReadout.setAttribute("role","status");
 cycleReadout.setAttribute("aria-live","polite");
 const cycleQty=document.createElement("input");
 cycleQty.setAttribute("data-cycle-qty","");
 cycleQty.setAttribute("aria-label","Quantité fictive partiellement exécutée en CT");
 cycleQty.setAttribute("inputmode","decimal");cycleQty.value="3.00";
 const cycleControls=document.createElement("div");
 cycleControls.style.cssText="display:flex;flex-wrap:wrap;gap:8px;margin:10px 0";
 const commands=[
  ["create","Préparer la simulation"],["confirm","Soumettre fictivement"],
  ["abandon","Abandonner le brouillon"],
  ["accept","Accepter (simulation)"],["reject","Refuser (avant acceptation)"],
  ["unknown","Statut incertain"],["partial","Exécuter une partie"],
  ["full","Exécuter le restant"],["cancel","Annuler (après acceptation)"],
  ["reconcile_open","Réconciliation : ouvert"],
  ["reconcile_reject","Réconciliation : rejeté"],
  ["reconcile_cancel","Réconciliation : annulé"]
 ];
 for(const [command,label] of commands){
  const control=document.createElement("button");
  control.type="button";control.textContent=label;
  control.setAttribute("data-cycle-command",command);
  control.addEventListener("click",()=>cycleAction(command));
  cycleControls.append(control);
 }
 const qtyLabel=document.createElement("label");
 qtyLabel.setAttribute("data-cycle-qty-label","");
 qtyLabel.textContent="Quantité exécutée fictivement (CT) ";
 qtyLabel.append(cycleQty);
 cycleContents.append(cycleWarning,cycleReadout,qtyLabel,cycleControls);
 cycle.append(cycleHeading,cycleContents);
 const orderEntry=globalThis.AgentCryptoTraderOrderEntryView?.mount?.({
   quoteLabel,budgetLabel,exitLabel,compute
 });
 if(orderEntry){
  // Preserve existing owner, ids, PAPER events and safety gates.
  // Attach the very same report nodes to the back of the Golden Ticket.
  const backReports=orderEntry.querySelector(".erith-golden-back-reports");
  if(backReports){
   backReports.append(brief,cycle,technical);
   ticketBox.append(warning,orderEntry);
  }else ticketBox.append(warning,orderEntry,brief,cycle,technical);
 }else ticketBox.append(warning,quoteLabel,budgetLabel,exitLabel,compute,brief,cycle,technical);
 cycleStatus();
 ticket.append(ticketHeading,ticketBox);
 content.append(explanation,history,label,button,collector,evidence,ticket);
 compute.addEventListener("click",()=>void prepareTicket());
 ticket.addEventListener("toggle",()=>{
   ticketRequest++;
   if(ticket.open){
    const input=safe(()=>globalThis.AgentCryptoTraderPaperLab?.source?.()?.input);
    if(input?.asset==="CT"&&input?.provider==="okx"){
      quoteSelect.value="USDC";
      exitInput.placeholder="0,39";
      if(!exitInput.value)exitInput.value="0,39";
      if(budget.value==="5")budget.value="3,20";
    }else if(input?.asset==="BTC"&&input?.provider==="coingecko"){
      quoteSelect.value="USDC";
      exitInput.placeholder="85000";
      if(!exitInput.value)exitInput.value="85000";
      if(budget.value==="5")budget.value="10";
    }
    void prepareTicket();
  }
 });
 for(const input of [quoteSelect,budget,exitInput])input.addEventListener("change",()=>{
   ticketRequest++;cyclePlan=null;cycleState=null;
   globalThis.AgentCryptoTraderOrderEntryView?.reset?.();
   ticketStatus("Paramètres modifiés : relancer l'étude. Aucun ordre.");
   cycleStatus();
 });
 section.append(summary,content);
 const more=parent.querySelector(".pl-more");
 if(more)parent.insertBefore(section,more);else parent.appendChild(section);
 button.addEventListener("click",()=>{lastStudyKey="";void evaluate(true);});
 section.addEventListener("toggle",()=>{if(section.open){lastStudyKey="";
   void evaluate(true);}else requestId++;});
 for(const event of ["agent-crypto:selected-market-changed",
   "agent-crypto:new-listing-line-ready","agent-crypto:workspace-restored",
   "agent-crypto:graph-context-ready"])
   globalThis.addEventListener(event,invalidate,{passive:true});
 const controls=lab.querySelector(".pl-fields");
 controls?.addEventListener("change",()=>{lastStudyKey="";
   if(section.open)void evaluate(true);});
 return true;
}
globalThis.AgentCryptoTraderPaperDecisionView=Object.freeze({
 mount,evaluate,prepareTicket,realOrders:false,accountAccess:false,readOnly:true,
 snapshot:()=>({mounted:!!panel(),active:!!panel()?.open,
   historical:historyTarget()?.dataset.study||null,
   result:result()?.dataset.decision||null})
});
if(document.readyState==="loading")
 document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
})();