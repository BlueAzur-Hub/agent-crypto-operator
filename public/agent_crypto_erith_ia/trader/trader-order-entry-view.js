/* ERITH.IA Trader · presentation only.
   Dedicated visual entrance + evidence ticket using the existing PAPER owner.
   Never reads secrets, requests OKX, creates orders or stores account data. */
(function(root){
"use strict";
const ID="erithTraderOrderEntry";
const EMPTY="—";
let node=null;
const str=value=>value===null||value===undefined||value===""?EMPTY:String(value);
function el(tag,className,text){
 const n=document.createElement(tag);
 if(className)n.className=className;
 if(text!==undefined)n.textContent=text;
 return n;
}
function field(name,caption){
 const n=el("div","erith-od-stat");
 const captionEl=el("span","",caption);captionEl.dataset.odCaption=name;
 n.append(captionEl);
 const val=el("strong","",EMPTY);val.dataset.odField=name;n.append(val);
 return n;
}
function proof(name,caption){
 const n=el("div","");
 const captionEl=el("small","",caption);captionEl.dataset.odProofCaption=name;n.append(captionEl);
 const val=el("strong","",EMPTY);val.dataset.odProof=name;n.append(val);
 return n;
}
function guard(kind){
 const n=el("details","erith-od-guard");n.dataset.odGuard=kind;
 n.dataset.level="pending";n.open=false;
 const summary=el("summary","erith-od-guard-summary");
 const title=el("strong","","Contrôle de quantité en attente");
 title.dataset.odGuardTitle=kind;
 summary.append(title);
 const detail=el("p","","Relancer la vérification du ticket PAPER ; aucun ordre.");
 detail.dataset.odGuardDetail=kind;
 n.append(summary,detail);return n;
}
// Reading-only decimal comparison: do not round or change the PAPER engine.
const SCALE=10n**24n;
function scaled(v){
 const s=String(v??"").trim().replace(",",".");
 if(!/^\d+(?:\.\d{1,24})?$/.test(s))return null;
 const [whole,frac=""]=s.split(".");
 return BigInt(whole)*SCALE+BigInt(frac.padEnd(24,"0"));
}
function shortfall(required,available){
 const a=scaled(required),b=scaled(available);
 if(a===null||b===null||a<=b)return null;
 const step=SCALE/1000000n; // display rounded UP to six USDC decimals
 const n=(a-b+step-1n)/step;
 const major=n/1000000n,minor=String(n%1000000n).padStart(6,"0").replace(/0+$/,"");
 return major+(minor?","+minor:"");
}
function setGuard(kind,title,detail,level){
 if(!node)return;
 const target=node.querySelector('[data-od-guard="'+kind+'"]');
 if(!target)return;
 target.dataset.level=level;
 const h=target.querySelector('[data-od-guard-title="'+kind+'"]');
 const p=target.querySelector('[data-od-guard-detail="'+kind+'"]');
 if(h)h.textContent=title;
 if(p)p.textContent=detail;
}

// Display-only scenario math. The PAPER core owns exchange rules and prices.
function fmtUsd(n){
 if(n===null||n<0n)return null;
 const step=SCALE/1000000n,q=(n+step-1n)/step;
 const fraction=String(q%1000000n).padStart(6,"0").replace(/0+$/,"");
 return String(q/1000000n)+(fraction?"."+fraction:"");
}
function required(ticket,review,preview){
 const mode=review?.fee_mode_verified?review.fee_buy_currency:null;
 if(mode==="USDC"){
  const min=scaled(ticket.native_min_quantity),ask=scaled(ticket.best_ask_quote);
  const percent=scaled(preview?.assumed_fee_pct??(
   review?.fees_verified===true&&review.fee_taker_pct!==null?
    String(Math.max(Number(review.fee_taker_pct),Number(review.fee_maker_pct||"0"))):""));
  if(min===null||ask===null||percent===null||percent>2n*SCALE)return null;
  const amount=min*ask/SCALE,rate=percent/100n;
  const fee=(amount*rate+SCALE-1n)/SCALE;
  return {gross:min,cost:amount+fee,qty:ticket.native_min_quantity,
   fee:"Frais USDC estimés au taux le plus défavorable (pas un fill)."};
 }
 const gross=scaled(ticket.minimum_gross_buy_to_resell_with_assumed_base_fee);
 const cost=scaled(ticket.minimum_gross_buy_cost_at_ask_with_assumed_base_fee);
 if(gross===null||cost===null)return null;
 return {gross,cost,qty:ticket.minimum_gross_buy_to_resell_with_assumed_base_fee,
  fee:mode==="CT"?"Hypothèse frais en CT à 0,10 %.":
    "Hypothèse frais en CT à 0,10 % (devise réelle non confirmée)."};
}
function verdict(title,message,budget,level,quick){
 if(!node)return;
 const section=node.querySelector("[data-od-verdict]");
 if(!section)return;
 section.dataset.level=level;
 for(const [field,value] of [["title",title],["quick",quick||
   "Aucune validation d'ordre · ouvrir pour les explications."],
   ["detail",message],["budget",budget]]){
  const el=node.querySelector("[data-od-verdict-"+field+"]");
  if(el)el.textContent=value;
 }
}
function assessTicket(ticket,review,preview,context,validBook){
 const min=scaled(ticket.native_min_quantity),buy=scaled(preview?.buy_quantity??ticket.gross_buy_quantity);
 if(min===null||min<=0n||buy===null){
  verdict("FAISABILITÉ NON ÉVALUABLE","Règles ou quantité manquantes. Aucun ordre.",
    "Budget nécessaire : non évaluable.","pending");return;
 }
 const need=required(ticket,review,preview),sell=scaled(preview?.maximum_sellable_base);
 const account=review?.account_verified===true?scaled(review.available_trading_quote):null;
 const paper=scaled(ticket.study_budget_quote);
 const provedCap=review?.spot_gates?.verified===true&&context?.order_gates_verified===true;
 const cap=provedCap?scaled(context?.order_gates?.maxBuy):null;
 const blockers=[];
 if(buy<min)blockers.push("achat sous minSz");
 if(preview?.meets_native_exit_minimum===false||(sell!==null&&sell<min))
  blockers.push("revente sous minSz après frais");
 if(need&&paper!==null&&paper<need.cost)blockers.push("budget fictif insuffisant");
 if(need&&account!==null&&account<need.cost)blockers.push("solde Trading insuffisant");
 if(need&&cap!==null&&cap<need.gross)blockers.push("maxBuy OKX inférieur au seuil requis");
 const uncertain=!validBook||ticket.native_rules_verified!==true||
  !provedCap||review?.fee_mode_verified!==true||
  preview?.limit_proof_verified!==true||preview?.meets_native_exit_minimum!==true;
 const status=blockers.length?"SCÉNARIO NON ADMISSIBLE EN L'ÉTAT":
  uncertain?"FAISABILITÉ NON CERTIFIÉE":"SEUILS PAPER ATTEINTS · TRADE TOUJOURS VERROUILLÉ";
 let budgetLine="Budget pour une revente au minimum : impossible à chiffrer avec ces preuves.";
 if(need){
  const amount=fmtUsd(need.cost);
  const gap=paper!==null?shortfall(amount,ticket.study_budget_quote):null;
  const accountGap=account!==null?shortfall(amount,review.available_trading_quote):null;
  budgetLine="Seuil indicatif : "+need.qty+" CT bruts, env. "+amount+
    " USDC au ask daté. "+need.fee+" "+
    (gap?"Écart budget PAPER : "+gap+" USDC. ":"")+
    (accountGap?"Écart solde Trading : "+accountGap+" USDC. ":"")+
    (cap!==null&&cap<need.gross?
      "Plafond maxBuy relevé ("+context.order_gates.maxBuy+
      " CT) inférieur au seuil : nouveau relevé nécessaire après toute évolution du compte. ":
      cap===null?"Plafond maxBuy non confirmé pour ce seuil. ":"")+
    "Funding distinct de Trading, aucun transfert.";
 }
 const mini="Achat "+str(preview?.buy_quantity??ticket.gross_buy_quantity)+
  " / "+str(ticket.native_min_quantity)+" CT"+(sell!==null?
   " · Revente "+str(preview.maximum_sellable_base)+" CT":"")+
  (need?" · Seuil ≈ "+fmtUsd(need.cost)+" USDC (estimé)":"");
 verdict(status,(blockers.length?"Blocages : "+blockers.join(" ; ")+". ":
  "Seuils de quantité à étudier. ")+
  "Prix, frais et restrictions ne sont pas une garantie d'exécution. Aucun ordre réel.",
  budgetLine,blockers.length?"warning":"pending",mini);
}

function updateGuards(ticket,review,preview,context){
 const min=scaled(ticket?.native_min_quantity);
 const gross=scaled(preview?.buy_quantity??ticket?.gross_buy_quantity);
 const netSell=scaled(preview?.maximum_sellable_base);
 if(min===null||min<=0n||gross===null){
  setGuard("buy","Règles de quantité à confirmer",
    "Aucune conclusion possible : paire CT/USDC, minSz ou quantité indisponible. Aucun ordre.","pending");
  setGuard("sell","Revente non évaluée",
    "Attendre des règles et une projection PAPER valides.","pending");
  return;
 }
 const minLabel=str(ticket.native_min_quantity);
 const note=ticket.native_rules_verified===true?
   "Règles publiques lues ; autres restrictions OKX non certifiées.":
   "Règles d'archive datée : actualisation OKX nécessaire.";
 const account=review?.account_verified===true&&review.available_trading_quote!==null;
 const accountGap=account?shortfall(ticket.minimum_buy_at_recorded_ask_quote,review.available_trading_quote):null;
 const budgetGap=shortfall(ticket.minimum_buy_at_recorded_ask_quote,ticket.study_budget_quote);
 const gates=context?.order_gates;
 const cap= context?.order_gates_verified===true&&gates?.account_max_verified===true?
   scaled(gates.maxBuy):null;
 if(gross<min){
  const reasons=[
   str(preview?.buy_quantity??ticket.gross_buy_quantity)+" CT projetés, alors que minSz = "+minLabel+" CT.",
   ticket.minimum_buy_at_recorded_ask_quote?
    "Coût brut indicatif pour "+minLabel+" CT au ask daté : "+ticket.minimum_buy_at_recorded_ask_quote+" USDC (hors frais en USDC).":null,
   budgetGap?"Écart avec le budget fictif : au moins "+budgetGap+" USDC.":null,
   accountGap?"Écart avec le solde Trading vérifié : au moins "+accountGap+" USDC.":null,
   cap!==null&&cap<min?"Plafond d'achat du compte inférieur à minSz au relevé daté.":null,
   note,"Aucun achat possible depuis ce ticket."
  ];
  setGuard("buy","Minimum d'achat non atteint",reasons.filter(Boolean).join(" "),"warning");
 }else{
  setGuard("buy","Minimum de quantité franchi en simulation",
   "Achat brut "+str(preview?.buy_quantity??ticket.gross_buy_quantity)+
   " CT ≥ minSz "+minLabel+" CT. "+note+
   " Cela ne certifie ni le notionnel, ni le solde, ni l'acceptation d'un ordre.","neutral");
 }
 if(netSell===null){
  setGuard("sell","Revente non évaluée",
   "Aucune projection nette exploitable : renseigner un prix de vente compatible puis vérifier. Aucun ordre.","pending");
 }else if(netSell<min||preview?.meets_native_exit_minimum===false){
  const estimate= ticket.minimum_gross_buy_to_resell_with_assumed_base_fee;
  const feeMode=review?.fee_mode_verified===true?review.fee_buy_currency:null;
  const illustrative=feeMode!=="USDC"&&estimate?
   "Sous l'hypothèse de 0,10 % de frais prélevés en CT, il faudrait environ "+
   estimate+" CT bruts (coût indicatif "+str(ticket.minimum_gross_buy_cost_at_ask_with_assumed_base_fee)+
   " USDC au ask daté), sans garantie des frais ou arrondis réels.":"";
  setGuard("sell","Revente en quantité minimale impossible",
   str(preview.maximum_sellable_base)+" CT revendables en simulation, sous minSz "+
   minLabel+" CT après frais et arrondi au lot. "+illustrative+
   " Le solde réellement détenu n'augmente pas : aucun achat ni vente réalisé.","warning");
 }else{
  const dust=preview?.residual_dust_base;
  setGuard("sell","Seuil de revente atteint en simulation",
   str(preview.maximum_sellable_base)+" CT ≥ "+minLabel+
   " CT ; résidu estimé : "+str(dust)+" CT. Prix de sortie, frais, notionnel et exécution non garantis.","neutral");
 }
}
function strip(name,caption){
 const n=el("div","");
 const captionEl=el("small","",caption);captionEl.dataset.odStripCaption=name;n.append(captionEl);
 const val=el("strong","",EMPTY);val.dataset.odField=name;n.append(val);
 return n;
}
function side(heading,sideName,sub){
 const n=el("section","erith-od-side");n.dataset.side=sideName;
 const head=el("div","erith-od-sidehead");
 const title=el("strong","",heading);title.dataset.odSideTitle=sideName;
 head.append(title,el("span","",sub));
 n.append(head);
 return n;
}
function mount({quoteLabel,budgetLabel,exitLabel,compute}={}){
 if(node?.isConnected)return node;
 if(!quoteLabel||!budgetLabel||!exitLabel||!compute)return null;
 node=el("section","erith-order-desk erith-golden-ticket");node.id=ID;node.dataset.ready="false";
 node.setAttribute("aria-label","Ordre Spot CT/USDC · aperçu et contrôles");
 const head=el("header","erith-od-head");
 const identity=el("div","");
 identity.append(el("span","erith-gt-side-label","RECTO · FACE DE L'OPÉRATION"),
   el("span","erith-od-eyebrow","ERITH.IA · POSTE D'ORDRE SPOT"),
   el("strong","erith-gt-title","TICKET D'OR · CRYPTO"),
   el("strong","erith-od-pair","CT/USDC · LIMIT"));
 const modes=el("div","erith-od-modes");
 modes.append(el("span","erith-od-tag","PAPER · lecture seule"),
   el("span","erith-od-tag erith-od-lock","TRADE VERROUILLÉ"));
 head.append(identity,modes);
 const sides=el("div","erith-od-grid");
 const buy=side("ACHAT · CT","buy","COURS LIMIT · PROJECTION");
 const sell=side("VENTE · CT","sell","OBJECTIF HYPOTHÉTIQUE");
 const buyValues=el("div","erith-od-values");
 buyValues.append(field("buyPrice","Prix ask CT/USDC"),field("buyQty","Quantité projetée CT"),
   field("buyCost","Coût estimé USDC"),field("buyFee","Frais d'achat estimés"));
 const sellValues=el("div","erith-od-values");
 sellValues.append(field("sellQty","CT revendables estimés"),field("sellNet","Valorisation théorique de vente"),
   field("sellFee","Frais de vente estimés"),field("sellDust","Résidu CT"));
 buy.append(quoteLabel,budgetLabel,buyValues,guard("buy"));
 compute.classList.add("erith-od-cta");
 compute.textContent="Vérifier et préparer le ticket · aucun ordre";
 buy.append(compute,el("p","erith-od-note","Le contrôle ne transmet aucun achat à OKX."));
 sell.append(exitLabel,sellValues,guard("sell"),
   el("div","erith-od-inactive","Envoi d'ordre désactivé · autorisation Trade absente"),
   el("p","erith-od-note","Le prix de vente est une cible saisie, pas un prix garanti ni une instruction d'ordre."));
 sides.append(buy,sell);
 const check=el("details","erith-od-verdict");check.dataset.odVerdict="";
 check.dataset.level="pending";check.open=false;
 const verdictSummary=el("summary","erith-od-verdict-summary");
 for(const [tag,field,initial] of [
  ["strong","title","FAISABILITÉ À VÉRIFIER"],
  ["small","quick","Aucun ordre · détails disponibles."]
 ]){const item=el(tag,"",initial);
  item.dataset["odVerdict"+field[0].toUpperCase()+field.slice(1)]="";
  verdictSummary.append(item);}
 check.append(verdictSummary);
 for(const [field,initial] of [
  ["detail","Aucun ordre avant vérification du scénario."],
  ["budget","Budget nécessaire : en attente."]
 ]){const item=el("p",field==="budget"?"erith-od-budget":"",initial);
  item.dataset["odVerdict"+field[0].toUpperCase()+field.slice(1)]="";
  check.append(item);}
 const band=el("div","erith-od-strip");
 band.append(strip("bid","Meilleur bid CT/USDC"),strip("ask","Meilleur ask CT/USDC"),
   strip("buyAvailable","USDC disponible Trading"),strip("sellAvailable","CT disponible à la vente"));
 const ev=el("details","erith-od-detail");ev.dataset.odEvidence="";
 ev.append(el("summary","","Ticket visuel · preuves et limites OKX"));
 const proofGrid=el("div","erith-od-proof");
 for(const [k,label] of [
  ["pair","Instrument & règlement"],["fresh","Origine du carnet"],
  ["rules","Règles de quantité/prix"],["maxbuy","Plafond achat (CT)"],
  ["feeMode","Devise des frais d'achat"],["checktime","Heure des limites du compte OKX"],
  ["funds","Solde Trading et budget"],["orders","Capacité de trading"]
 ])proofGrid.append(proof(k,label));
 ev.append(proofGrid);
 const chron=el("details","erith-od-detail");chron.dataset.odTimeline="";
 chron.append(el("summary","","Journal / chronologie du scénario PAPER"));
 const events=el("ol","erith-od-timeline");events.dataset.odEvents="";
 chron.append(events);
 const disclaimer=el("p","erith-od-disclaimer",
   "L'interface reprend les repères d'OKX sans reproduire ses autorisations. "+
   "Les projections viennent du ticket CT/USDC daté ; le graphique CT/USDT reste une source distincte. "+
   "Aucun ordre réel n'est envoyé par cette version.");
 // Two faces of one PAPER instrument: all existing live fields and controls
 // are MOVED, not cloned. This is strictly a presentation change.
 function face(which,label){
  const shell=el("article","erith-gt-face erith-gt-"+which);
  shell.setAttribute("aria-label",label);
  for(const corner of ["tl","tr","bl","br"]){
   const flourish=el("span","erith-gt-flourish erith-gt-"+corner,"❦");
   flourish.setAttribute("aria-hidden","true");shell.append(flourish);
  }
  const inner=el("div","erith-gt-inner");shell.append(inner);
  return {shell,inner};
 }
 const recto=face("recto","Recto du Ticket d'Or : achat, vente et cotations");
 const verso=face("verso","Verso du Ticket d'Or : preuves OKX et journal PAPER");
 recto.inner.append(head,sides,check,band);
 const hinge=el("div","erith-gt-hinge","✦");
 hinge.setAttribute("aria-hidden","true");
 const backTitle=el("header","erith-gt-back-title");
 backTitle.append(el("span","erith-gt-back-label","VERSO · CERTIFICAT PAPER"),
   el("strong","","PREUVES, LIMITES ET CHRONOLOGIE"),
   el("small","","La face justificative du même ticket"));
 const backGrid=el("div","erith-gt-back-grid");
 // Details stay collapsible; initial opening makes both halves of the
 // physical ticket readable on first visit.
 ev.open=true;chron.open=true;
 backGrid.append(ev,chron);
 const reports=el("div","erith-golden-back-reports");
 verso.inner.append(backTitle,backGrid,reports,disclaimer);
 node.append(recto.shell,hinge,verso.shell);
 reset();
 return node;
}
function set(key,value,group="odField"){
 if(!node)return;
 const item=node.querySelector('[data-'+(group==="odField"?"od-field":"od-proof")+'="'+key+'"]');
 if(item)item.textContent=str(value);
}
function reset(){
 if(!node)return;
 node.dataset.ready="false";
 const label=node.querySelector(".erith-od-pair");
 if(label)label.textContent="CT/USDC · LIMIT · à vérifier";
 for(const entry of node.querySelectorAll("[data-od-field],[data-od-proof]"))entry.textContent=EMPTY;
 set("orders","Non activée","odProof");
 set("pair","CT/USDC · LIMIT","odProof");
 set("fresh","Vérification nécessaire","odProof");
 set("checktime","En attente","odProof");
 verdict("FAISABILITÉ À VÉRIFIER",
   "La vérification précédente est invalidée : aucun ordre.",
   "Budget indicatif : données en attente.","pending");
 setGuard("buy","Contrôle de quantité en attente",
   "Vérifier de nouveau : les anciennes projections ne sont plus valides.","pending");
 setGuard("sell","Contrôle de revente en attente",
   "Aucun chiffre précédent ne vaut confirmation pour cet actif.","pending");
 const events=node.querySelector("[data-od-events]");
 if(events)events.replaceChildren(el("li","","Aucun état PAPER pour ce ticket."));
}
function setIdentityLabels(base,quote){
 if(!node)return;
 node.setAttribute("aria-label","Ticket PAPER Spot "+base+"/"+quote+" · aperçu et contrôles");
 for(const [key,label] of [
  ["bid","Meilleur bid "+base+"/"+quote],
  ["ask","Meilleur ask "+base+"/"+quote],
  ["buyAvailable",quote+" disponible Trading"],
  ["sellAvailable",base+" disponible à la vente"]
 ]){
  const caption=node.querySelector('[data-od-strip-caption="'+key+'"]');
  if(caption)caption.textContent=label;
 }
 for(const [key,label] of [
  ["maxbuy","Plafond achat ("+base+")"],
  ["checktime","Heure des limites du compte OKX"]
 ]){
  const caption=node.querySelector('[data-od-proof-caption="'+key+'"]');
  if(caption)caption.textContent=label;
 }
}
function updatePublicAsset(ticket,context,review,preview,bookDiagnostic){
 // BTC/USDC is a public PAPER study only. No account limits, Trading
 // balance, feeType or PAPER cycle from CT may ever be inherited.
 const base=ticket.base,quote=ticket.quote,pair=ticket.pair;
 setIdentityLabels(base,quote);
 const checkedCaption=node.querySelector('[data-od-proof-caption="checktime"]');
 if(checkedCaption)checkedCaption.textContent="Heure de lecture du solde Trading (non des plafonds)";
 const accountVerified=context?.instId===pair&&context?.read_only===true&&
   context?.orders_enabled===false&&context?.real_orders===0&&
   review?.account_verified===true&&review?.account_quote===quote&&
   review?.available_trading_quote!==null;
 const feesVerified=accountVerified&&review?.fees_verified===true;
 const hasPreview=preview?.maximum_sellable_base!==undefined&&preview?.orders_enabled===false;
 const current=bookDiagnostic?.accepted===true&&
   ticket.source_book_kind==="LOCAL_BACKEND_OKX_SPOT";
 node.dataset.ready=String(current);
 const header=node.querySelector(".erith-od-pair");
 if(header)header.textContent=base+"/"+quote+" · LIMIT · PAPER PUBLIC";
 for(const side of ["buy","sell"]){
  const elTitle=node.querySelector('[data-od-side-title="'+side+'"]');
  if(elTitle)elTitle.textContent=(side==="buy"?"ACHAT":"VENTE")+" · "+base;
 }
 for(const [key,caption] of [
   ["buyPrice","Prix ask "+base+"/"+quote],["buyQty","Quantité projetée "+base],
   ["buyCost","Coût estimé "+quote],["buyFee","Frais d'achat estimés"],
   ["sellQty",base+" revendables estimés"],["sellNet","Valorisation théorique de vente"],
   ["sellFee","Frais de vente estimés"],["sellDust","Résidu "+base]
 ]){
  const label=node.querySelector('[data-od-caption="'+key+'"]');
  if(label)label.textContent=caption;
 }
 set("buyPrice",str(ticket.best_ask_quote)+" "+quote);
 set("buyQty",hasPreview?str(preview.buy_quantity)+" "+base:
   str(ticket.gross_buy_quantity)+" "+base+" · provisoire");
 set("buyCost",hasPreview?str(preview.total_buy_cost_quote)+" "+quote:
   str(ticket.hypothetical_buy_cost_quote)+" "+quote+" · provisoire");
 set("buyFee",hasPreview?str(preview.estimated_buy_fee_base)+" "+base+
   " · hypothèse 0,10 %":"Non évalués");
 set("sellQty",hasPreview?str(preview.maximum_sellable_base)+" "+base:"Non évalué");
 const min=scaled(ticket.native_min_quantity);
 const qty=hasPreview?scaled(preview.maximum_sellable_base):null;
 const below=hasPreview&&(preview.meets_native_exit_minimum===false||
   (min!==null&&qty!==null&&qty<min));
 set("sellNet",hasPreview?(below?"NON RÉALISABLE · ":"PURE HYPOTHÈSE · ")+
   str(preview.hypothetical_sale_net_quote)+" "+quote:"Non évalué");
 set("sellFee",hasPreview?str(preview.hypothetical_sale_fee_quote)+" "+quote+
   " · hypothèse":"Non évalués");
 set("sellDust",hasPreview?str(preview.residual_dust_base)+" "+base:"Non évalué");
 set("bid",str(ticket.best_bid_quote)+" "+quote);
 set("ask",str(ticket.best_ask_quote)+" "+quote);
 set("buyAvailable",accountVerified?
   str(review.available_trading_quote)+" "+quote+" · compte Trading vérifié":
   "NON CERTIFIÉ");
 set("sellAvailable","NON CERTIFIÉ · solde "+base+" non contrôlé pour cette paire");
 set("pair",pair+" · paire Spot de l'archive exacte","odProof");
 set("fresh",current?"OKX local public · récent (non garanti)":
   "Archive datée · pas de cotation actuelle","odProof");
 set("rules",ticket.native_rules_verified?
   "min "+str(ticket.native_min_quantity)+" "+base+
   " · lot "+str(ticket.native_lot)+" "+base+
   " · tick "+str(ticket.native_tick)+" "+quote:
   "Règles publiques actuelles non certifiées","odProof");
 set("maxbuy","Non certifié pour "+pair+" · aucune preuve R25","odProof");
 set("feeMode",feesVerified?
   "Taux du compte : maker "+str(review.fee_maker_pct)+" % · taker "+
   str(review.fee_taker_pct)+" % · devise du débit NON CERTIFIÉE":
   "Taux et devise du débit non certifiés · hypothèse 0,10 % "+base,"odProof");
 set("checktime",accountVerified?str(review.account_at_utc)+" · solde seulement":
   "Aucun solde privé vérifié","odProof");
 set("funds",accountVerified?
   "Solde Trading "+str(review.available_trading_quote)+" "+quote+
   " vérifié ; budget PAPER "+str(ticket.study_budget_quote)+" "+quote+
   " distinct · financement non additionné":
   "Trading/Funding non vérifiés pour "+pair,"odProof");
 set("orders","PAPER public uniquement · Trade verrouillé","odProof");
 const disclaimer=node.querySelector(".erith-od-disclaimer");
 if(disclaimer)disclaimer.textContent=
   "Étude PAPER du carnet Spot public "+pair+
   ". Prix du graphique distinct ; aucun ordre possible. "+
   (accountVerified?"Le solde Trading de la devise "+quote+
     " est lu sur le compte, mais ni feeType ni maxBuy "+pair+
     " ne sont vérifiés.":"Aucun solde privé certifié pour cette paire.")+
   " Funding ne finance pas automatiquement Trading.";
 const buy=scaled(ticket.gross_buy_quantity);
 const gross=hasPreview?scaled(preview.buy_quantity):buy;
 const sell=hasPreview?scaled(preview.maximum_sellable_base):null;
 const belowBuy=min!==null&&gross!==null&&gross<min;
 setGuard("buy",belowBuy?"Minimum d'achat non atteint":
   "Seuil de quantité public à vérifier",
   str(hasPreview?preview.buy_quantity:ticket.gross_buy_quantity)+" "+base+
   " projetés ; minSz "+str(ticket.native_min_quantity)+" "+base+
   ". Pas de solde Trading, de limite de compte ni de frais réels vérifiés.",
   belowBuy?"warning":"pending");
 setGuard("sell",below?"Revente en quantité minimale impossible":
   "Revente non certifiée par le compte",
   hasPreview?str(preview.maximum_sellable_base)+" "+base+
     " revendables hypothétiques ; minSz "+str(ticket.native_min_quantity)+" "+base+
     ". Aucun ordre ni résultat encaissable.":
     "Aucune projection de revente exploitable ; réessayer l'étude.",
   below?"warning":"pending");
 const gap=shortfall(ticket.minimum_gross_buy_cost_at_ask_with_assumed_base_fee,
   ticket.study_budget_quote);
 const amount=str(ticket.minimum_gross_buy_cost_at_ask_with_assumed_base_fee);
 const gapTrading=accountVerified?shortfall(ticket.hypothetical_buy_cost_quote,
   review.available_trading_quote):null;
 const verdictTitle=belowBuy||below?"SCÉNARIO PAPER SOUS MINIMUM":
   gapTrading?"SOLDE TRADING INSUFFISANT · PAPER":
     "FAISABILITÉ COMPTE NON CERTIFIÉE · PAPER";
 const summary="Achat "+str(hasPreview?preview.buy_quantity:ticket.gross_buy_quantity)+
   " / "+str(ticket.native_min_quantity)+" "+base+
   (hasPreview?" · Revente "+str(preview.maximum_sellable_base)+" "+base:"")+
   " · Seuil ≈ "+amount+" "+quote+" (estimé)"+
   (accountVerified?" · Trading "+str(review.available_trading_quote)+" "+quote:"");
 verdict(verdictTitle,
   "Identité et données publiques de "+pair+" étudiées. "+
   (accountVerified?"Solde Trading "+quote+" vérifié à "+
      str(review.account_at_utc)+". ":"Solde Trading non vérifié. ")+
   (feesVerified?"Taux maker/taker spécifiques "+pair+
     " lus ; mode de prélèvement toujours non certifié. ":
     "Frais spécifiques du compte non certifiés. ")+
   "maxBuy et filtres du compte non vérifiés. Aucun ordre, transfert ou exécution.",
   "Seuil indicatif à l'ask daté : "+str(ticket.minimum_gross_buy_to_resell_with_assumed_base_fee)+
     " "+base+" bruts ≈ "+amount+" "+quote+" (hypothèse 0,10 % en "+base+"). "+
     (gap?"Écart au budget PAPER : "+gap+" "+quote+". ":"")+
     (gapTrading?"Écart au coût PAPER hors frais quote éventuels : "+
       gapTrading+" "+quote+" depuis Trading. ":"")+
     (accountVerified?"Funding séparé ; aucun transfert. ":
       "Aucun solde privé ne peut être inféré. ")+
     "MaxBuy et devise des frais non certifiés.",
   belowBuy||below?"warning":"pending",summary);
}
function update({ticket,context,review,preview,bookDiagnostic,checkedAt}={}){
 if(!node)return;
 if(ticket?.pair==="BTC-USDC"&&ticket?.base==="BTC"&&ticket?.quote==="USDC"&&
    ticket?.orders_enabled===false&&ticket?.executable===false&&
    ticket?.status==="PREPARATION_NON_EXECUTABLE"){
  updatePublicAsset(ticket,context,review,preview,bookDiagnostic);return;
 }
 if(ticket?.pair!=="CT-USDC"||ticket?.orders_enabled!==false){
  reset();return;
 }
 for(const side of ["buy","sell"]){
  const label=node.querySelector('[data-od-side-title="'+side+'"]');
  if(label)label.textContent=(side==="buy"?"ACHAT":"VENTE")+" · CT";
 }
 for(const [key,label] of [
  ["buyPrice","Prix ask CT/USDC"],["buyQty","Quantité projetée CT"],
  ["buyCost","Coût estimé USDC"],["buyFee","Frais d'achat estimés"],
  ["sellQty","CT revendables estimés"],["sellNet","Valorisation théorique de vente"],
  ["sellFee","Frais de vente estimés"],["sellDust","Résidu CT"]
 ]){
  const caption=node.querySelector('[data-od-caption="'+key+'"]');
  if(caption)caption.textContent=label;
 }
 setIdentityLabels("CT","USDC");
 const validBook=ticket.source_book_kind==="LOCAL_BACKEND_OKX_CT_USDC"&&bookDiagnostic?.accepted===true;
 node.dataset.ready=String(validBook);
 const header=node.querySelector(".erith-od-pair");
 if(header)header.textContent="CT/USDC · LIMIT";
 const hasPreview=preview?.maximum_sellable_base!==undefined&&preview?.orders_enabled===false;
 set("buyPrice",str(ticket.best_ask_quote)+" USDC");
 set("buyQty",hasPreview?str(preview.buy_quantity)+" CT":str(ticket.gross_buy_quantity)+" CT · provisoire");
 set("buyCost",hasPreview?str(preview.total_buy_cost_quote)+" USDC":str(ticket.hypothetical_buy_cost_quote)+" USDC · provisoire");
 const feeCurrency=review?.fee_mode_verified?review.fee_buy_currency:null;
 set("buyFee",hasPreview?
   (feeCurrency==="USDC"?str(preview.estimated_buy_fee_quote)+" USDC":
     feeCurrency==="CT"?str(preview.estimated_buy_fee_base)+" CT":
     "Hypothèse · devise inconnue"):"Non évalués");
 set("sellQty",hasPreview?str(preview.maximum_sellable_base)+" CT":"Non évalué");
 const exitBlocked=hasPreview&&(
   preview.meets_native_exit_minimum===false||
   (scaled(preview.maximum_sellable_base)!==null&&scaled(ticket.native_min_quantity)!==null&&
    scaled(preview.maximum_sellable_base)<scaled(ticket.native_min_quantity)));
 set("sellNet",hasPreview?
   (exitBlocked?"NON RÉALISABLE · "+str(preview.hypothetical_sale_net_quote)+
      " USDC mathématiques":str(preview.hypothetical_sale_net_quote)+
      " USDC conditionnels"):"Non évalué");
 set("sellFee",hasPreview?str(preview.hypothetical_sale_fee_quote)+" USDC":"Non évalués");
 set("sellDust",hasPreview?str(preview.residual_dust_base)+" CT":"Non évalué");
 set("bid",str(ticket.best_bid_quote)+" USDC");
 set("ask",str(ticket.best_ask_quote)+" USDC");
 const gates=context?.order_gates,account=review?.account_verified===true;
 set("buyAvailable",account&&review.available_trading_quote!==null?
   str(review.available_trading_quote)+" USDC":"Non confirmé");
 set("sellAvailable",gates?.available_verified?str(gates.availSell)+" CT":"Non confirmé");
 set("pair",gates?.account_eligible?"CT/USDC · règlement USDC reconnu":"CT/USDC · éligibilité à confirmer","odProof");
 set("fresh",validBook?"OKX local · récent (non garanti)":"Archive / carnet non qualifié","odProof");
 set("rules",ticket.native_rules_verified?
   "min "+str(ticket.native_min_quantity)+" CT · lot "+str(ticket.native_lot)+
   " CT · tick "+str(ticket.native_tick)+" USDC":"Règles natives non certifiées","odProof");
 set("maxbuy",context?.order_gates_verified&&gates?.maxBuy?
   str(gates.maxBuy)+" CT · relevé daté":"Non confirmé","odProof");
 set("feeMode",review?.fee_mode_verified?
   str(review.fee_buy_currency)+" · feeType "+str(review.fee_type):"Non confirmé","odProof");
 const evidenceTime=Date.parse(checkedAt||"");
 set("checktime",Number.isFinite(evidenceTime)?
   new Date(evidenceTime).toISOString():"Non confirmé","odProof");
 set("funds",account?
   (review.funds_cover_public_scenario?"Couverture du coût PAPER uniquement":"Couverture PAPER non démontrée"):
   "Compte non confirmé","odProof");
 set("orders","Aucun ordre possible · Trade désactivé","odProof");
 const disclaimer=node.querySelector(".erith-od-disclaimer");
 if(disclaimer)disclaimer.textContent=
   "L'interface reprend les repères d'OKX sans reproduire ses autorisations. "+
   "Les projections viennent du ticket CT/USDC daté ; le graphique CT/USDT reste une source distincte. "+
   "Aucun ordre réel n'est envoyé par cette version.";
 updateGuards(ticket,review,hasPreview?preview:null,context);
 assessTicket(ticket,review,hasPreview?preview:null,context,validBook);
}
const descriptions={
 PAPER_PREPARE:"Préparation PAPER",PAPER_CONFIRM:"Soumission simulée",
 PAPER_ACCEPT:"Acceptation simulée",PAPER_REJECT:"Refus simulé",
 PAPER_FILL_PART:"Exécution partielle simulée",PAPER_FILL_REST:"Exécution complète simulée",
 PAPER_CANCEL:"Annulation simulée",PAPER_UNKNOWN:"Statut inconnu simulé",
 PAPER_RECONCILE_OPEN:"Rapprochement : ordre ouvert fictif",
 PAPER_RECONCILE_REJECT:"Rapprochement : rejet simulé",
 PAPER_RECONCILE_CANCEL:"Rapprochement : annulation simulée"
};
function updateCycle(state){
 if(!node)return;
 const target=node.querySelector("[data-od-events]");
 if(!target)return;
 target.replaceChildren();
 if(!state?.paper){target.append(el("li","","Aucun cycle PAPER engagé pour ce ticket."));return;}
 for(const evt of state.events||[]){
  const li=el("li","");
  li.append(el("strong","",descriptions[evt.type]||"Étape PAPER"),
    el("small","",str(evt.at)+" · aucun ordre OKX"));
  target.append(li);
 }
}
root.AgentCryptoTraderOrderEntryView=Object.freeze({mount,reset,update,updateCycle,realOrders:false,readOnly:true});
})(typeof globalThis!=="undefined"?globalThis:{});
