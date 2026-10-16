/* Agent-Crypto Trader · Compte OKX réel · READ ONLY via Aether Trust / Bridge 8787. */
(()=>{
"use strict";
const PANEL_ID="traderOkxAccountPanel";
const STYLE_ID="traderOkxAccountStyle";
const TOKEN_KEY="agent_crypto_bridge_owner_token_v1";
const ROLE_KEY="agent_crypto_local_access_session_v1";
const BRIDGE="http://127.0.0.1:8787";
const AUTO_REFRESH_MS=60000;
const LEDGER_REFRESH_MS=300000;
const EUR_REFRESH_MS=60000;
const EUR_MAX_AGE_MS=120000;
const ENTRY_RETRY_MS=300000;
let timer=0;
let inflight=null;
let ledgerInFlight=null;
let ledgerCheckedAt=0;
let ledgerPosition=null;
let currentBtcHeld=NaN;
let lastBtcAccount=null;
let lastCapitalEvidence=null;
let ctCycleAccount=null;
let ctCycleFills=null;
let ctCycleLedgers=null;
let lastSpotExecutions=0;
let eurQuote=null;
let eurCheckedAt=0;
let eurInFlight=null;
let entryQuote=null;
let entryAttemptAt=0;
let entryInFlight=null;

const panel=()=>document.getElementById(PANEL_ID);
const q=(name)=>panel()?.querySelector(`[data-okx-${name}]`)||null;
const text=(name,value)=>{const el=q(name);if(el)el.textContent=String(value??"—");};
const token=()=>{try{return sessionStorage.getItem(TOKEN_KEY)||"";}catch(_){return"";}};
const owner=()=>{try{return sessionStorage.getItem(ROLE_KEY)==="owner";}catch(_){return false;}};
const saveToken=value=>{try{if(value)sessionStorage.setItem(TOKEN_KEY,value);else sessionStorage.removeItem(TOKEN_KEY);}catch(_){}};
const fmt=value=>{const n=Number(value);if(!Number.isFinite(n))return"—";const digits=Math.abs(n)>0&&Math.abs(n)<1?16:8;return n.toLocaleString("fr-FR",{maximumFractionDigits:digits});};
const shortError=error=>String(error?.message||error||"Erreur inconnue").replace(/\s+/g," ").slice(0,180);

async function bridge(path,{method="GET",body=null,auth=true,keepalive=false}={}){
  const headers={Accept:"application/json"};
  const t=token();
  if(auth){if(!t)throw Object.assign(new Error("Aether Trust Bridge requis"),{status:401});headers.Authorization=`Bearer ${t}`;}
  if(body!==null)headers["Content-Type"]="application/json";
  const response=await fetch(BRIDGE+path,{method,headers,body:body===null?undefined:JSON.stringify(body),cache:"no-store",keepalive});
  let data=null;try{data=await response.json();}catch(_){}
  if(!response.ok){const err=new Error(data?.error||`Bridge HTTP ${response.status}`);err.status=response.status;throw err;}
  return data||{};
}

async function login(secret,{silent=false}={}){
  const clean=String(secret||"");
  if(clean.length<6)throw new Error("Mot de passe Aether Trust requis");
  const response=await bridge("/auth/login",{method:"POST",body:{secret:clean},auth:false});
  if(!response?.token)throw new Error("Le Bridge n'a pas retourné de session Aether Trust");
  ctCycleAccount=null;ctCycleFills=null;ctCycleLedgers=null;ledgerCheckedAt=0;
  saveToken(String(response.token));
  try{sessionStorage.setItem(ROLE_KEY,"owner");}catch(_){}
  window.dispatchEvent(new CustomEvent("agent-crypto:bridge-owner-session",{detail:{source:"trader-okx-account",bridge_version:response.bridge_version||null}}));
  if(!silent)await refresh({force:true});
  return response;
}

function tradingRows(account){
  return (Array.isArray(account?.trading)?account.trading:[]).flatMap(row=>Array.isArray(row?.details)?row.details:[]);
}
function fundingRows(account){return Array.isArray(account?.funding)?account.funding:[];}
function asset(account,ccy){
  const code=String(ccy||"").toUpperCase();
  const tr=tradingRows(account).find(row=>String(row?.ccy||"").toUpperCase()===code)||null;
  const fu=fundingRows(account).find(row=>String(row?.ccy||"").toUpperCase()===code)||null;
  const trTotal=Number(tr?.cashBal??tr?.eq),trAvail=Number(tr?.availBal),trFrozen=Number(tr?.frozenBal);
  const fuTotal=Number(fu?.bal),fuAvail=Number(fu?.availBal),fuFrozen=Number(fu?.frozenBal);
  const trEqUsd=Number(tr?.eqUsd);
  const present=Boolean(tr||fu);
  const sum=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)?a+b:Number.isFinite(a)?a:Number.isFinite(b)?b:NaN;
  return {present,total:sum(trTotal,fuTotal),available:sum(trAvail,fuAvail),frozen:sum(trFrozen,fuFrozen),trading:Number.isFinite(trTotal)?trTotal:NaN,funding:Number.isFinite(fuTotal)?fuTotal:NaN,eqUsd:Number.isFinite(trEqUsd)?trEqUsd:NaN};
}
function feeLabel(payload){
  const row=Array.isArray(payload?.fees)?payload.fees[0]:null;
  if(!row)return"—";
  const maker=row.maker??row.makerU??row.makerUSDC,taker=row.taker??row.takerU??row.takerUSDC;
  if(maker==null&&taker==null)return"OK";
  const pct=v=>Number.isFinite(Number(v))?(Number(v)*100).toLocaleString("fr-FR",{maximumFractionDigits:4})+" %":"—";
  return `Maker ${pct(maker)}\nTaker ${pct(taker)}`;
}
function paintAsset(code,data){
  text(code.toLowerCase(),data.present?`${fmt(data.total)} ${code}`:"—");
  text(code.toLowerCase()+"detail",data.present?`Trading ${fmt(data.trading)} · Funding ${fmt(data.funding)} · disponible ${fmt(data.available)}`:"Non retourné par OKX");
}
function setState(state,message){
  const p=panel();if(!p)return;
  p.dataset.state=state;
  text("state",message);
}
function showAuth(show,message="Session Aether Trust Bridge requise"){
  const auth=q("auth");if(auth)auth.hidden=!show;
  if(show)text("authstatus",message);
}


/* Cotation de marché PUBLIQUE, sans clé Aether Trust ou solde personnel.
   Son heure de réception n'est pas une garantie d'exécution chez OKX. */
const moneyEUR=n=>n.toLocaleString("fr-FR",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2});
function freshEuroQuote(){
  if(!eurQuote||!Number.isFinite(eurQuote.price)||eurQuote.price<=1000)return null;
  const age=Date.now()-eurQuote.receivedAt;
  return age>=0&&age<EUR_MAX_AGE_MS?eurQuote:null;
}
async function marketBtcEur(){
  const sources=[
    {name:"Binance Spot BTC/EUR",url:"https://api.binance.com/api/v3/ticker/price?symbol=BTCEUR",
      price:d=>d?.symbol==="BTCEUR"?Number(d.price):NaN},
    {name:"Kraken Spot XBT/EUR",url:"https://api.kraken.com/0/public/Ticker?pair=XBTEUR",
      price:d=>Array.isArray(d?.error)&&d.error.length===0?Number(d?.result?.XXBTZEUR?.c?.[0]):NaN}
  ];
  for(const source of sources){
    const controller=new AbortController();
    const deadline=setTimeout(()=>controller.abort(),6500);
    try{
      const response=await fetch(source.url,{method:"GET",cache:"no-store",credentials:"omit",signal:controller.signal});
      if(!response.ok)continue;
      const price=source.price(await response.json());
      if(Number.isFinite(price)&&price>1000&&price<10000000)
        return {price,source:source.name,receivedAt:Date.now()};
    }catch(_){/* repli sur la seconde source publique */}
    finally{clearTimeout(deadline);}
  }
  return null;
}
async function refreshEuroPrice(force=false){
  if(!token()||!Number.isFinite(currentBtcHeld)||currentBtcHeld<=0)return false;
  if(eurInFlight)return eurInFlight;
  if(!force&&Date.now()-eurCheckedAt<EUR_REFRESH_MS)return Boolean(freshEuroQuote());
  eurCheckedAt=Date.now();
  eurInFlight=(async()=>{
    const next=await marketBtcEur();
    if(!token())return false;
    eurQuote=next;
    updatePositionView();
    return Boolean(next);
  })().catch(()=>{eurQuote=null;if(token())updatePositionView();return false;})
    .finally(()=>{eurInFlight=null;});
  return eurInFlight;
}


/* Comparaison historique : clôture d'une bougie Binance BTC/EUR d'une minute
   précédant le mouvement OKX, non prix exact de transaction ni commission PayPal. */
async function fetchEntryMinute(timestamp){
  if(!Number.isFinite(timestamp)||timestamp<=0)return null;
  const minute=Math.floor((timestamp-5000)/60000)*60000;
  const hosts=["https://data-api.binance.vision/api/v3/klines","https://api.binance.com/api/v3/klines"];
  for(const host of hosts){
    const url=host+"?symbol=BTCEUR&interval=1m&startTime="+minute+"&endTime="+(minute+59999)+"&limit=1";
    const controller=new AbortController(),deadline=setTimeout(()=>controller.abort(),6500);
    try{
      const response=await fetch(url,{method:"GET",cache:"no-store",credentials:"omit",signal:controller.signal});
      if(!response.ok)continue;
      const data=await response.json();
      const candle=Array.isArray(data)?data[0]:null;
      if(!Array.isArray(candle)||Number(candle[0])!==minute)continue;
      const [open,high,low,close]=[1,2,3,4].map(i=>Number(candle[i]));
      const volume=Number(candle[5]),trades=Number(candle[8]);
      if([open,high,low,close,volume,trades].some(n=>!Number.isFinite(n)) ||
         low<=1000||high>=10000000||low>high||open<low||open>high||close<low||close>high||
         volume<=0||trades<=0)continue;
      return {minute,open,high,low,close,source:"Binance Spot BTC/EUR · bougie 1 minute"};
    }catch(_){/* Repli sur l'autre hôte public */}
    finally{clearTimeout(deadline);}
  }
  return null;
}
async function refreshEntryQuote(force=false){
  const match=ledgerPosition?.matched;
  if(!token()||!match||!Number.isFinite(match.timestamp))return false;
  const timestamp=match.timestamp;
  if(entryQuote&&entryQuote.timestamp===timestamp)return true;
  if(entryInFlight)return entryInFlight;
  if(!force&&Date.now()-entryAttemptAt<ENTRY_RETRY_MS)return false;
  entryAttemptAt=Date.now();
  entryInFlight=(async()=>{
    const benchmark=await fetchEntryMinute(timestamp);
    if(!token()||ledgerPosition?.matched?.timestamp!==timestamp)return false;
    entryQuote=benchmark?{...benchmark,timestamp}:null;
    updatePositionView();
    return Boolean(benchmark);
  })().catch(()=>{entryQuote=null;if(token())updatePositionView();return false;})
    .finally(()=>{entryInFlight=null;});
  return entryInFlight;
}
function signedMoney(amount){
  return (amount>0?"+":amount<0?"−":"")+moneyEUR(Math.abs(amount));
}
function updateCostBreakdown(position,quote){
  const match=position?.matched;
  if(!match||!quote||!Number.isFinite(currentBtcHeld) ||
    Math.abs(currentBtcHeld-match.btc)>=Math.max(1e-12,match.btc*1e-7)){
    text("costbreakdown","Coût initial et variation du marché : données concordantes attendues.");
    return;
  }
  if(!entryQuote||entryQuote.timestamp!==match.timestamp){
    text("costbreakdown","Écart de prix initial et évolution du Bitcoin : référence BTC/EUR historique non vérifiée. Aucuns frais supposés.");
    return;
  }
  const oldValue=match.btc*entryQuote.close;
  const initial=oldValue-match.eur;
  const later=currentBtcHeld*quote.price-oldValue;
  const total=currentBtcHeld*quote.price-match.eur;
  const time=new Date(entryQuote.minute).toLocaleString("fr-FR",{timeZone:"UTC",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
  text("costbreakdown","Écart de prix initial estimé : "+signedMoney(initial)+
    " · Variation du Bitcoin depuis l'achat : "+signedMoney(later)+
    " · Différence totale : "+signedMoney(total)+
    " | Référence "+entryQuote.source+" du "+time+" UTC"+
    ", cours indicatif "+moneyEUR(entryQuote.close)+"/BTC"+
    " (plus bas "+moneyEUR(entryQuote.low)+", plus haut "+moneyEUR(entryQuote.high)+
    "). Ce n'est pas une commission PayPal mesurée.");
}

/* Le coût et la performance sont qualifiés séparément. Une écriture OKX n'est pas une facture PayPal. */

/* Lecture BTC explicative à partir des données déjà consultées par le panneau OKX.
   Jamais de nouveaux endpoints privés, jamais de nouveau calcul de frais supposés. */

/* Only balance arithmetic from existing private ledger; never a trade receipt. */
function btcQuantityChain({movements,acquisition,held,complete,usdcEntries=[]}={}){
  const missing=reason=>Object.freeze({status:"unknown",reason,read_only:true});
  if(complete!==true||!Array.isArray(movements)||!acquisition||
    !Number.isFinite(acquisition.btc)||acquisition.btc<=0||
    !Number.isFinite(acquisition.timestamp)||!Number.isFinite(held)||held<0)
    return missing("Relevé BTC incomplet ou incohérent");
  const btc=movements.filter(x=>x?.currency==="BTC");
  if(btc.length!==2||btc.some(x=>x.source!=="Compte de trading"||
    !Number.isFinite(x.balanceChange)||!Number.isFinite(x.timestamp)))
    return missing("Il existe d'autres mouvements BTC non réconciliés");
  const credit=btc.find(x=>x.balanceChange>0&&x.type==="30"&&x.subType==="320"&&
    Math.abs(x.timestamp-acquisition.timestamp)<=120000&&
    Math.abs(x.balanceChange-acquisition.btc)<=Math.max(1e-12,acquisition.btc*1e-8));
  const exits=btc.filter(x=>x.balanceChange<0&&x.timestamp>=acquisition.timestamp);
  if(!credit||exits.length!==1)return missing("Crédit d'origine ou sortie BTC non appariables");
  const debit=-exits[0].balanceChange;
  if(debit<=0||debit>acquisition.btc)return missing("Débit BTC non vérifiable");
  const remainder=acquisition.btc-debit;
  if(Math.abs(remainder-held)>Math.max(1e-12,acquisition.btc*1e-8))
    return Object.freeze({status:"mismatch",read_only:true,expected_btc:remainder,held_btc:held});
  const matches=Array.isArray(usdcEntries)?usdcEntries.filter(x=>
    x?.currency==="USDC"&&x.source==="Compte de trading"&&
    Number.isFinite(x.timestamp)&&Math.abs(x.timestamp-exits[0].timestamp)<=120000&&
    Number.isFinite(x.balanceChange)&&x.balanceChange>0):[];
  const counter=matches.length===1?matches[0]:null;
  return Object.freeze({status:"balanced",read_only:true,credit_btc:acquisition.btc,
    debit_btc:debit,remaining_btc:remainder,
    debit_at:new Date(exits[0].timestamp).toISOString(),
    paired_usdc:counter!==null,credit_usdc:counter?.balanceChange??null});
}

/* BTC : hypothèses sur une cotation PUBLIQUE BTC/EUR seulement.
   Pas de carnet BTC/USDC comparable, donc aucun net après frais revendiqué. */
function btcScenarioGrid(evidence={},now=Date.now()){
 const unavailable=reason=>Object.freeze({status:"unavailable",read_only:true,
   currency:"EUR",reason,rows:Object.freeze([])});
 const a=evidence.account||null, t=Date.parse(String(a?.fetched_at||""));
 const quantity=evidence.quantity,quote=evidence.quote||null;
 const received=quote?.receivedAt;
 if(a?.ok!==true||a?.read_only!==true||!Number.isFinite(t)||
    now-t<0||now-t>120000||typeof quantity!=="number"||
    !Number.isFinite(quantity)||quantity<=0)
  return unavailable("Position BTC privée absente, nulle ou ancienne");
 if(typeof quote.price!=="number"||!Number.isFinite(quote.price)||
    quote.price<=0||typeof received!=="number"||
    !Number.isFinite(received)||now-received<0||now-received>EUR_MAX_AGE_MS)
  return unavailable("Cotation publique BTC/EUR indisponible ou ancienne");
 const current=quantity*quote.price;
 if(!Number.isFinite(current)||current<=0)
  return unavailable("Valeur BTC/EUR incohérente");
 const rows=[-5,0,5].map(shock=>Object.freeze({
   shock_pct:shock,
   hypothetical_value_eur:current*(1+shock/100),
   movement_vs_spot_eur:current*shock/100
 }));
 return Object.freeze({status:"hypothetical",read_only:true,
   currency:"EUR",source:String(quote.source||"BTC/EUR public"),
   quote_received_at:new Date(received).toISOString(),
   btc_held:quantity,fee_included:false,rows:Object.freeze(rows),
   caveat:"±5 % de la cotation BTC/EUR, sans carnet BTC exécutable, commission, spread, coût PayPal ni bénéfice net."});
}
function btcPositionReport(evidence={},now=Date.now()){
  const lines=[];
  const account=evidence.account||null;
  const qty=evidence.quantity;
  const observed=Date.parse(String(account?.fetched_at||""));
  const accountReady=account?.ok===true&&account?.read_only===true
    &&Number.isFinite(observed)&&now-observed>=0&&now-observed<=120000;
  if(!accountReady||typeof qty!=="number"||!Number.isFinite(qty)||qty<0){
    lines.push("Compte OKX : lecture du solde BTC absente, ancienne ou non vérifiée. Ouvre une session Aether Trust et actualise.");
    return Object.freeze({status:"unavailable",read_only:true,lines:Object.freeze(lines),indicative_delta_eur:null});
  }
  lines.push("Compte OKX (Trading + Funding) : "+fmt(qty)+" BTC détenus selon le relevé du "+new Date(observed).toLocaleString("fr-FR")+".");
  if(qty===0){
    lines.push("Aucun BTC détenu selon ce relevé. Il ne prouve pas l'absence d'autres avoirs hors de ce compte.");
    return Object.freeze({status:"empty",read_only:true,lines:Object.freeze(lines),indicative_delta_eur:null});
  }
  const quote=evidence.quote;
  const received=Number(quote?.receivedAt);
  const quoteReady=typeof quote?.price==="number"&&Number.isFinite(quote.price)&&quote.price>0
    &&Number.isFinite(received)&&now-received>=0&&now-received<=EUR_MAX_AGE_MS;
  const euroValue=quoteReady?qty*quote.price:null;
  if(quoteReady){
    lines.push("Valeur indicatrice du BTC : "+moneyEUR(euroValue)+" au cours public "
      +String(quote.source||"BTC/EUR")+" ("+moneyEUR(quote.price)+"/BTC, reçu à "
      +new Date(received).toLocaleTimeString("fr-FR")+"). Aucun prix de vente garanti.");
  }else{
    lines.push("Valorisation BTC/EUR indisponible : aucune somme en euros ne peut être déduite de ce seul relevé.");
  }
  const grid=btcScenarioGrid(evidence,now);
  if(grid.status==="hypothetical"){
    lines.push("Scénarios BTC/EUR sur le BTC détenu : choc fictif sur le prix public, ±5 % ; montants AVANT frais et spread, sans carnet exécutable.");
    for(const row of grid.rows){
      const label=row.shock_pct>0?"+":"";
      lines.push(label+row.shock_pct+" % de prix → valorisation théorique "
        +moneyEUR(row.hypothetical_value_eur)+
        " ; mouvement théorique de valeur "+signedMoney(row.movement_vs_spot_eur)+
        " par rapport au cours actuel (pas un gain réalisé).");
    }
    lines.push("Ce n'est pas une prévision, un prix de revente OKX garanti ni un calcul du rendement après PayPal.");
  }else lines.push("Scénarios BTC indisponibles : "+grid.reason+".");
  const ledger=evidence.ledger||null;
  const ledgerAt=Number(evidence.ledgerCheckedAt);
  const ledgerRecent=Number.isFinite(ledgerAt)&&ledgerAt>0&&now-ledgerAt>=0&&now-ledgerAt<=1800000;
  const matched=ledgerRecent?ledger?.matched:null;
  const matchValid=matched&&Number.isFinite(matched.btc)&&matched.btc>0
    &&Number.isFinite(matched.eur)&&matched.eur>0&&Number.isFinite(matched.timestamp)&&matched.timestamp>0;
  let delta=null;
  if(matchValid){
    const sameHolding=Math.abs(qty-matched.btc)<Math.max(1e-12,matched.btc*1e-7);
    lines.push("Écritures OKX rapprochées : "+moneyEUR(matched.eur)+" sortis pour "
      +fmt(matched.btc)+" BTC crédités. Ce rapprochement ne prouve pas le coût PayPal ni tous les frais.");
    if(sameHolding&&quoteReady){
      delta=euroValue-matched.eur;
      lines.push("Différence INDICATIVE à cet instant : "+signedMoney(delta)
        +" entre la cotation publique et les écritures rapprochées, avant frais de revente, spread et éventuels coûts PayPal. Ce n'est ni un bénéfice réalisé ni un P&L net certifié.");
    }else if(!sameHolding){
      const chain=ledger?.btcChain;
      if(chain?.status==="balanced"&&chain.credit_btc===matched.btc&&
        Math.abs(chain.remaining_btc-qty)<=Math.max(1e-12,matched.btc*1e-8)){
        lines.push("Quantités BTC rapprochées : "+fmt(chain.credit_btc)+" BTC reçus − "
          +fmt(chain.debit_btc)+" BTC sortis le "+chain.debit_at+" = "
          +fmt(chain.remaining_btc)+" BTC restants.");
        if(chain.paired_usdc&&Number.isFinite(chain.credit_usdc))
          lines.push(fmt(chain.credit_usdc)+" USDC crédités au compte de trading au même moment : flux compatibles avec une conversion BTC/USDC. La nature exacte de l'opération reste à vérifier dans l'historique OKX.");
        else lines.push("La contrepartie USDC n'est pas attestée par le Bridge : le débit BTC n'est pas à lui seul une preuve de conversion.");
        lines.push("Le coût d'acquisition PayPal, le coût résiduel du BTC et le gain net restent NON PROUVÉS. Aucune imputation automatique du coût initial.");
      }else lines.push("La quantité BTC détenue diffère du mouvement rapproché : celui-ci ne permet pas de déduire le coût de la position actuelle.");
    }else{
      lines.push("Différence indicative non calculable sans cotation BTC/EUR récente.");
    }
  }else{
    lines.push("Prix moyen et coût total NON PROUVÉS : l'historique consulté ne rapproche pas entièrement les entrées BTC et sorties EUR. Un transfert n'est pas un achat.");
    if(Number.isInteger(evidence.executions)&&evidence.executions>0)
      lines.push("Les exécutions Spot récentes ("+evidence.executions+") ne constituent pas, seules, le coût de toutes les acquisitions.");
  }
  const entry=evidence.entryQuote;
  if(matchValid&&entry?.timestamp===matched.timestamp&&Number.isFinite(entry.close)&&entry.close>0){
    lines.push("Repère historique : clôture indicative Binance BTC/EUR de la minute précédant le mouvement : "
      +moneyEUR(entry.close)+"/BTC. Ce n'est ni le taux de l'opération OKX ni une commission PayPal.");
  }
  lines.push("Les frais affichés pour la paire BTC/USDC ne doivent pas être appliqués arbitrairement à l'acquisition EUR/BTC. Aucune recommandation d'achat ou de vente ; aucun ordre.");
  return Object.freeze({status:matchValid&&quoteReady&&delta!==null?"estimated":"partial",
    read_only:true,lines:Object.freeze(lines),indicative_delta_eur:delta});
}

/* Synthèse de parcours issue exclusivement des lectures privées existantes.
   Concordance comptable ne signifie ni provenance exhaustive ni gain réalisé. */
function capitalJourneyReport(info={},now=Date.now()){
 const msg=[],observed=Date.parse(String(info.observedAt||'')),age=now-observed;
 if(info.read_only!==true||!Number.isFinite(age)||age<0||age>120000)
  return Object.freeze({status:'unavailable',read_only:true,coherent_usdc:false,
    lines:Object.freeze(['Relevé OKX trop ancien ou non autorisé : actualise le compte avant cette lecture privée.'])});
 const show=n=>Number.isFinite(n)&&n>=0?fmt(n):'inconnu';
 msg.push('Soldes OKX observés au '+new Date(observed).toLocaleString('fr-FR')+
   ' : '+show(info.btc)+' BTC, '+show(info.ct)+' CT et '+show(info.usdc)+' USDC.');
 const ledgerAt=now-Number(info.ledgerCheckedAt);
 const current=Number.isFinite(ledgerAt)&&ledgerAt>=0&&ledgerAt<=1800000;
 const origin=current?info.ledger?.matched:null;
 const chain=current?info.ledger?.btcChain:null;
 const start=origin&&Number.isFinite(origin.eur)&&origin.eur>0&&
   Number.isFinite(origin.btc)&&origin.btc>0;
 if(start)
  msg.push('EUR → BTC : '+moneyEUR(origin.eur)+' sortis, '+show(origin.btc)+
    ' BTC crédités selon les écritures rapprochées. Frais et paiement PayPal non certifiés.');
 else msg.push('EUR → BTC : source historique absente, partielle ou ancienne ; coût initial non établi.');
 const btcOkay=start&&chain?.status==='balanced'&&Number.isFinite(info.btc)&&
   Math.abs(chain.remaining_btc-info.btc)<=Math.max(1e-12,origin.btc*1e-8);
 if(btcOkay)
  msg.push('BTC conservés : '+show(chain.credit_btc)+' reçus − '+show(chain.debit_btc)+
   ' sortis = '+show(chain.remaining_btc)+' BTC. Égalité des quantités, non preuve du type d’opération.');
 else msg.push('BTC : débit et quantité restante non rapprochés avec suffisamment de preuves.');
 const usdcLeg=btcOkay&&chain.paired_usdc===true&&
   Number.isFinite(chain.credit_usdc)&&chain.credit_usdc>0;
 if(usdcLeg)
  msg.push('BTC → USDC : '+show(chain.credit_usdc)+
   ' USDC crédités près de la sortie BTC. Flux compatibles avec une conversion, sans certifier sa nature exacte.');
 else msg.push('BTC → USDC : contrepartie USDC non démontrée par les écritures disponibles.');
 const buy=info.ctAcquisition;
 const ctOkay=buy?.status==='reconciled_fills_only'&&Number.isFinite(buy.spent_usdc)&&buy.spent_usdc>0&&
   Number.isFinite(buy.net_acquired_ct)&&buy.net_acquired_ct>0&&Number.isFinite(info.ct)&&
   Math.abs(info.ct-buy.net_acquired_ct)<=Math.max(1e-6,info.ct*1e-4);
 if(ctOkay)
  msg.push('USDC → CT : '+show(buy.spent_usdc)+' USDC pour '+show(buy.net_acquired_ct)+
   ' CT nets, selon '+buy.fill_count+' exécution(s) CT/USDC retrouvée(s), frais constatés inclus. Autres opérations non certifiées.');
 else msg.push('USDC → CT : achats et solde Concrete insuffisamment rapprochés.');
 let coherent=false;
 if(usdcLeg&&ctOkay&&Number.isFinite(info.usdc)&&info.usdc>=0){
  const leftover=chain.credit_usdc-buy.spent_usdc;
  if(leftover>=0&&Math.abs(leftover-info.usdc)<=Math.max(1e-7,chain.credit_usdc*1e-7)){
   coherent=true;
   msg.push('Concordance arithmétique USDC : '+show(chain.credit_usdc)+' reçus − '+
     show(buy.spent_usdc)+' engagés = '+show(info.usdc)+
     ' restants. Elle ne démontre pas une traçabilité exhaustive des fonds.');
  }else msg.push('Les montants USDC ne se réconcilient pas exactement : d’autres mouvements peuvent intervenir.');
 }else msg.push('Chaîne USDC incomplète : aucun financement direct de CT par ce BTC n’est affirmé.');
 msg.push('Coût PayPal, coût résiduel BTC, frais de conversion et profit global NON PROUVÉS. Lecture seule ; aucun ordre.');
 return Object.freeze({status:coherent?'coherent':'partial',coherent_usdc:coherent,
   read_only:true,lines:Object.freeze(msg)});
}

/* Résultat CT après sortie totale, dans le même panneau privé, jamais dans
   GitHub, un cache, une commande d'ordre ou le propriétaire du Graphique. */
function updateCtClosedCycle(){
  const container=q('ctcyclebody');
  const status=q('ctcyclestatus');
  if(!container||!status)return;
  if(!token()||!owner()){
    status.textContent='Aether Trust requis';
    container.textContent='Connecte le Bridge pour lire ce rapprochement privé.';
    return;
  }
  const core=globalThis.AgentCryptoAiCtContract;
  const recent=ledgerCheckedAt>0&&Date.now()-ledgerCheckedAt<=1800000;
  const result=core?.ctClosedCycleReport&&recent
    ?core.ctClosedCycleReport({account:ctCycleAccount,fills:ctCycleFills,
       ctLedger:ctCycleLedgers?.CT?.payload,usdcLedger:ctCycleLedgers?.USDC?.payload})
    :{status:'unavailable',reason:'Journaux CT/USDC non chargés ou trop anciens'};
  const label=result.status==='classified_ledger_pair'
    ?'Mouvements rapprochés · catégorie Convert à confirmer'
    :result.status==='compatible_movements'
      ?'Mouvements compatibles · Convert non confirmé'
      :result.status==='position_open'
        ?'Position CT encore détenue'
        :'Preuve CT indisponible';
  status.textContent=label;
  container.replaceChildren();
  const add=message=>{const p=document.createElement('p');p.textContent=message;container.append(p);};
  if(!['classified_ledger_pair','compatible_movements'].includes(result.status)){
    add(String(result.reason||'Preuves insuffisantes'));
    add('Aucun bénéfice ni ordre inféré à partir des seuls soldes.');
    return;
  }
  add('Débit CT : '+fmt(result.outgoing_ct)+' CT ; crédit USDC : '+fmt(result.incoming_usdc)+' USDC.');
  add('Compte : '+(result.source_account==='trading_account'?'Trading':'Funding')+
    ' ; mouvements rapprochés à '+new Date(result.paired_at).toLocaleString('fr-FR')+'.');
  if(Number.isFinite(result.acquisition_cost_usdc)){
    add('Achats Spot CT/USDC rapprochés : '+fmt(result.acquisition_cost_usdc)+' USDC.');
    add('Écart ARITHMÉTIQUE INDICATIF : '+
      (result.indicative_difference_usdc>0?'+':'')+
      result.indicative_difference_usdc.toLocaleString('fr-FR',{maximumFractionDigits:8})+
      ' USDC ('+(result.indicative_return_pct>0?'+':'')+
      result.indicative_return_pct.toLocaleString('fr-FR',{maximumFractionDigits:2})+
      ' %). Non certifié comme bénéfice réalisé par le journal.');
  }else add('Coût d’acquisition non démontré après liquidation : aucun résultat calculé.');
  add(result.reason);
  add(result.caveat);
}

function updateCapitalJourney(){
 const container=q('capitalpathbody');
 if(!q('capitalpath')?.open||!container)return;
 container.replaceChildren();
 if(!token()||!owner()){
  container.textContent='Aether Trust requis : aucune donnée privée affichée.';
  return;
 }
 const report=capitalJourneyReport({...lastCapitalEvidence,ledger:ledgerPosition,ledgerCheckedAt});
 for(const line of report.lines){
  const p=document.createElement('p');p.textContent=line;container.append(p);
 }
 container.dataset.state=report.status;
}

function updateBtcReading(){
  const brief=q("btcreading");
  if(!brief||!q("btcreadingdetails")?.open)return;
  brief.replaceChildren();
  if(!token()||!owner()){
    brief.textContent="Session Aether Trust requise : aucune lecture privée conservée pour ce rapport.";
    return;
  }
  const report=btcPositionReport({
    account:lastBtcAccount,quantity:currentBtcHeld,quote:freshEuroQuote(),
    ledger:ledgerPosition,ledgerCheckedAt,entryQuote,executions:lastSpotExecutions
  });
  for(const line of report.lines){
    const p=document.createElement("p");
    p.textContent=line;
    brief.append(p);
  }
  brief.dataset.state=report.status;
}

function updatePositionView(){
  updateBtcReading();
  const position=ledgerPosition;
  updateCostBreakdown(position,freshEuroQuote());
  const quote=freshEuroQuote();
  text("eurestimate",quote&&Number.isFinite(currentBtcHeld)&&currentBtcHeld>0
    ?"Estimation en EUR : "+moneyEUR(currentBtcHeld*quote.price)+" · "+quote.source
    :"Estimation en EUR : cours BTC/EUR indisponible");
  if(position?.matched){
    const sameHolding=Number.isFinite(currentBtcHeld)&&Math.abs(currentBtcHeld-position.matched.btc)<Math.max(1e-12,position.matched.btc*1e-7);
    if(sameHolding){
      const euro=v=>v.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2});
      text("avgcost",euro(position.matched.eur/position.matched.btc)+" €/BTC");
      text("committed",euro(position.matched.eur)+" € rapprochés");
      if(quote){
        const valeurEur=currentBtcHeld*quote.price;
        const resultat=valeurEur-position.matched.eur;
        const sens=resultat>0?"+":resultat<0?"−":"";
        const pourcent=Math.abs(100*resultat/position.matched.eur).toLocaleString("fr-FR",{minimumFractionDigits:1,maximumFractionDigits:2});
        text("pnl",sens+moneyEUR(Math.abs(resultat))+" ("+sens+pourcent+" %)");
        text("positionproof","Estimation sur l'achat EUR/BTC rapproché et la cotation publique "+quote.source+
          " reçue à "+new Date(quote.receivedAt).toLocaleTimeString("fr-FR")+
          ". Paiement PayPal non recertifié par l'API, frais et écarts d'exécution exclus.");
      }else{
        text("pnl","COURS BTC/EUR INDISPONIBLE");
        text("positionproof","Achat EUR/BTC rapproché ; aucun résultat calculé sans cotation publique BTC/EUR accessible.");
      }
      text("avgcosthint","Taux déduit des écritures OKX, non prix moyen certifié");
      text("committedhint","Montant du mouvement, paiement externe à confirmer");
      text("pnlhint",quote?"Gain / perte estimé en EUR, hors frais de revente":"En attente d’un cours BTC/EUR vérifiable");
      return;
    }
    text("positionproof","Mouvement EUR/BTC retrouvé, mais quantité BTC détenue différente. Coût de la position totale non établi.");
  }else if(position?.recordsCount>0){
    text("positionproof",position.recordsCount+" mouvements financiers retrouvés, mais acquisition complète non démontrée.");
  }else{
    text("positionproof",lastSpotExecutions
      ?lastSpotExecutions+" exécutions Spot récentes ; acquisition totale non démontrée."
      :"0 exécution Spot sur 3 mois ; l'achat en euros relève d'un historique financier distinct.");
  }
  text("avgcost","NON PROUVÉ");
  text("committed","NON PROUVÉ");
  text("pnl","À VÉRIFIER");
  text("avgcosthint","Historique d'acquisition à rapprocher");
  text("committedhint","Achats + frais prouvés");
  text("pnlhint","Valeur actuelle et montant investi doivent être dans la même devise");
}

function paintData(account,orders,fills,fees){
  const btc=asset(account,"BTC"),ct=asset(account,"CT"),usdc=asset(account,"USDC"),eur=asset(account,"EUR");
  const fillRows=Array.isArray(fills?.fills_3m)?fills.fills_3m:[];
  paintAsset("BTC",btc);
  paintAsset("CT",ct);
  paintAsset("USDC",usdc);
  paintAsset("EUR",eur);
  currentBtcHeld=btc.present?btc.total:NaN;
  lastBtcAccount=account?.ok===true&&account?.read_only===true?{ok:true,read_only:true,fetched_at:account.fetched_at}:null;
  lastSpotExecutions=fillRows.length;
  const ctCore=globalThis.AgentCryptoAiCtContract;
  const ctAcquisition=ctCore?.acquisition
    ?ctCore.acquisition(fills,ct.present&&Number.isFinite(ct.total)?ct.total:null)
    :{status:'unknown'};
  lastCapitalEvidence={
    read_only:account?.ok===true&&account?.read_only===true,
    observedAt:account?.fetched_at??null,
    btc:btc.present&&Number.isFinite(btc.total)?btc.total:null,
    ct:ct.present&&Number.isFinite(ct.total)?ct.total:null,
    usdc:usdc.present&&Number.isFinite(usdc.total)?usdc.total:null,
    ctAcquisition
  };
  updateCapitalJourney();
  ctCycleAccount=account;
  ctCycleFills=fills;
  updateCtClosedCycle();
  text("positionvalue",Number.isFinite(btc.eqUsd)?btc.eqUsd.toLocaleString("fr-FR",{style:"currency",currency:"USD",maximumFractionDigits:2}):"—");
  updatePositionView();
  void refreshEuroPrice();
  text("pending",Array.isArray(orders?.pending)?orders.pending.length:0);
  text("history",Array.isArray(orders?.history_3m)?orders.history_3m.length:0);
  text("fills",fillRows.length);
  text("fees",feeLabel(fees));
  text("bridge",`Bridge ${account?.bridge_version||orders?.bridge_version||"—"} · ${account?.site||"OKX"} · LECTURE SEULE`);
  const date=new Date(account?.fetched_at||Date.now());
  text("updated",Number.isFinite(date.getTime())?date.toLocaleString("fr-FR"):"à l'instant");
  setState("ready","COMPTE OKX RÉEL · CONNECTÉ");
  showAuth(false);
}


/* Les journaux OKX sont lus à la demande et restent en mémoire vive uniquement.
   Ils prouvent des mouvements, jamais automatiquement le coût d'un achat PayPal. */
function ledgerClear(message){
  ctCycleLedgers=null;
  ledgerCheckedAt=0;
  ledgerPosition=null;
  updateCapitalJourney();
  updateCtClosedCycle();
  eurQuote=null;
  eurCheckedAt=0;
  entryQuote=null;
  entryAttemptAt=0;
  updatePositionView();
  text("ledgerstatus",message);
  const entries=q("ledgerentries");
  if(entries)entries.replaceChildren();
  const references=q("ledgerreferences");if(references)references.replaceChildren();
  text("ledgercoverage","—");
  text("ledgerwarning","");
  text("ledgerdetailcount","Afficher les mouvements détaillés");
  const summary=q("ledgersummary");if(summary)summary.hidden=true;
}
function ledgerDate(row){
  const raw=Number(row?.ts??row?.cTime??row?.uTime);
  if(!Number.isFinite(raw)||raw<=0)return "date inconnue";
  const when=new Date(raw<1e11?raw*1000:raw);
  return Number.isFinite(when.getTime())?when.toLocaleString("fr-FR"):"date inconnue";
}
function ledgerMovement(row,ccy,sourceLabel){
  const raw=String(row?.balChg??row?.sz??row?.amt??"").trim();
  const valid=/^[+-]?\d+(?:\.\d+)?$/.test(raw)&&Number.isFinite(Number(raw));
  const amount=valid?Number(raw):NaN;
  const unsigned=raw.replace(/^[+-]/,"");
  const [integer,decimal]=unsigned.split(".");
  const value=!valid?"montant non disponible":ccy==="EUR"?Math.abs(amount).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2}):integer.replace(/\B(?=(\d{3})+(?!\d))/g," ")+(decimal!==undefined?","+decimal:"");
  const direction=!valid?"Variation indisponible":amount>0?"Entrée sur le compte":amount<0?"Sortie du compte":"Aucune variation";
  const sign=valid&&amount>0?"+":valid&&amount<0?"−":"";
  const type=String(row?.type??"").slice(0,12);
  const subType=String(row?.subType??"").slice(0,12);
  return {
    timestamp:Number(row?.ts??row?.cTime??row?.uTime)||0,
    balanceChange:amount,
    originalAmount:raw,
    type,subType,
    date:ledgerDate(row),
    source:sourceLabel==="Trading"?"Compte de trading":"Compte de financement",
    currency:ccy,
    direction,
    amount:valid?sign+value+" "+ccy:"Montant indisponible",
    sign:amount>0?"credit":amount<0?"debit":"neutral",
    reference:[type,subType].filter(Boolean).join("/")
  };
}
function ledgerPaint(results){
  const list=q("ledgerentries");
  const references=q("ledgerreferences");
  if(list)list.replaceChildren();
  if(references)references.replaceChildren();
  const issues=[];
  const totals=[];
  const recent=[];
  let success=0,recordsCount=0,hasMore=false;
  for(const ccy of ["BTC","EUR","CT","USDC"]){
    const item=results[ccy];
    if(!item?.ok){
      issues.push(ccy+" : "+(item?.status===404?"Bridge ancien : route financière absente":item?.status===403?"accès Aether Trust requis":item?.status===401?"session expirée":"lecture indisponible"));
      continue;
    }
    const payload=item.payload;
    if(payload?.ccy!==ccy||payload?.read_only!==true||!payload?.sources){
      issues.push(ccy+" : réponse financière inattendue");continue;
    }
    for(const [key,label] of [["trading_account","Trading"],["funding_account","Financement"]]){
      const stream=payload.sources[key];
      if(!stream||!Array.isArray(stream.records)){
        issues.push(label+" "+ccy+" : format indisponible");continue;
      }
      const state=String(stream.state||"unavailable");
      const count=stream.records.length;
      if(state==="ok")success++;else issues.push(label+" "+ccy+" : "+(state==="partial"?"lecture partielle":"source indisponible"));
      recordsCount+=count;
      hasMore=hasMore||Boolean(stream.has_more);
      totals.push(label+" "+ccy+" : "+count+" mouvement"+(count!==1?"s":"")+(stream.has_more?" (suite possible)":""));
      for(const row of stream.records){
        if(row&&typeof row==="object")recent.push(ledgerMovement(row,ccy,label));
      }
    }
  }
  recent.sort((a,b)=>b.timestamp-a.timestamp);
  text("ledgerdetailcount","Afficher les "+recordsCount+" mouvements détaillés");
  /* Association prudente de deux écritures OKX : sortie EUR 30/321 et entrée BTC 30/320.
     Une paire de mouvements ne certifie ni le mode de paiement externe, ni tout le coût historique. */
  const credits=recent.filter(x=>x.source==="Compte de trading"&&x.currency==="BTC"&&x.type==="30"&&x.subType==="320"&&Number.isFinite(x.balanceChange)&&x.balanceChange>0);
  const debits=recent.filter(x=>x.source==="Compte de trading"&&x.currency==="EUR"&&x.type==="30"&&x.subType==="321"&&Number.isFinite(x.balanceChange)&&x.balanceChange<0);
  const matches=credits.flatMap(btc=>debits.filter(eur=>Math.abs(btc.timestamp-eur.timestamp)<=120000).map(eur=>({btc,eur})));
  const summary=q("ledgersummary");
  if(summary)summary.hidden=matches.length!==1||credits.length!==1||debits.length!==1;
  ledgerPosition={recordsCount,matched:null,btcChain:null};
  // USDC is optional evidence; its unavailability must not erase valid BTC/EUR records.
  const coreComplete=['BTC','EUR'].every(ccy=>{
    const p=results[ccy]?.payload;
    return results[ccy]?.ok===true&&p?.read_only===true&&p?.ccy===ccy&&
      ['trading_account','funding_account'].every(k=>{
        const st=p.sources?.[k];
        return st?.state==='ok'&&st.has_more!==true&&Array.isArray(st.records);
      });
  });
  if(matches.length===1&&credits.length===1&&debits.length===1&&coreComplete){
    ledgerPosition.matched={btc:matches[0].btc.balanceChange,eur:Math.abs(matches[0].eur.balanceChange),timestamp:matches[0].btc.timestamp};
    if(entryQuote?.timestamp!==matches[0].btc.timestamp)entryQuote=null;
  }
  if(ledgerPosition.matched){
    const source=results.USDC?.payload;
    const journal=source?.sources?.trading_account;
    const usdcComplete=results.USDC?.ok===true&&source.ccy==="USDC"&&
      source.read_only===true&&['trading_account','funding_account'].every(k=>{
        const x=source.sources?.[k];
        return x?.state==='ok'&&x.has_more!==true&&Array.isArray(x.records);
      })&&journal?.state==="ok"&&journal.has_more!==true&&Array.isArray(journal.records);
    const usdc=usdcComplete?journal.records.filter(Boolean).map(x=>ledgerMovement(x,"USDC","Trading")):[];
    ledgerPosition.btcChain=btcQuantityChain({movements:recent,
      acquisition:ledgerPosition.matched,held:currentBtcHeld,
      complete:coreComplete,usdcEntries:usdc});
  }
  if(summary&&!summary.hidden){
    const {btc,eur}=matches[0];
    const eurPaid=Math.abs(eur.balanceChange);
    const euro=v=>v.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2});
    text("ledgersummarydate",btc.date.split(" ")[0]);
    text("ledgersummaryeur",euro(eurPaid)+" € sortis");
    text("ledgersummarybtc",fmt(btc.balanceChange)+" BTC reçus");
    text("ledgersummaryrate",euro(eurPaid/btc.balanceChange)+" €/BTC");
  }
  if(list){
    for(const entry of recent.slice(0,20)){
      const li=document.createElement("li");
      li.className="okx-ledger-item";
      const meta=document.createElement("div");
      meta.className="okx-ledger-meta";
      const source=document.createElement("strong");
      source.textContent=entry.source;
      const date=document.createElement("span");
      date.textContent=entry.date;
      meta.append(source,date);
      const direction=document.createElement("div");
      direction.className="okx-ledger-direction";
      direction.textContent=entry.direction;
      const amount=document.createElement("strong");
      amount.className="okx-ledger-amount okx-ledger-"+entry.sign;
      amount.textContent=entry.amount;
      li.append(meta,direction,amount);
      list.appendChild(li);
      if(references){
        const technical=document.createElement("li");
        technical.textContent=entry.date+" · "+entry.source+" · "+entry.currency+" · montant exact "+(entry.originalAmount||"non fourni")+" · type/sous-type "+(entry.reference||"non fournis");
        references.appendChild(technical);
      }
    }
    if(!recent.length){
      const li=document.createElement("li");
      li.className="okx-ledger-empty";
      li.textContent=success?"Aucun mouvement renvoyé sur les périodes accessibles.":"Aucune écriture vérifiable retournée.";
      list.appendChild(li);
    }
  }
  text("ledgerstatus",recordsCount?recordsCount+" mouvements financiers retrouvés":"Aucun mouvement financier retrouvé");
  const technicalStatus=totals.concat(issues.length?["À vérifier : "+issues.join(" ; ")]:[],hasMore?["D'autres pages d'historique peuvent exister."]:[]);
  text("ledgercoverage",technicalStatus.join(" · ")||"Aucune source disponible.");
  text("ledgerwarning",issues.length?"Attention : certaines sources ne sont pas disponibles ; les résultats peuvent être incomplets.":hasMore?"Attention : d'autres mouvements peuvent exister dans l'historique.":"Ces écritures incluent éventuellement des transferts entre comptes : elles ne représentent pas nécessairement des achats distincts.");
  updatePositionView();
  updateCapitalJourney();
  ctCycleLedgers=results;
  updateCtClosedCycle();
  void refreshEuroPrice();
  void refreshEntryQuote();
}

async function refreshLedger(force=false){
  if(ledgerInFlight)return ledgerInFlight;
  if(!token()){ledgerClear("Authentification Aether Trust nécessaire.");return false;}
  if(!force&&Date.now()-ledgerCheckedAt<LEDGER_REFRESH_MS)return true;
  text("ledgerstatus","Lecture des journaux financiers BTC puis EUR…");
  ledgerInFlight=(async()=>{
    const result={};
    for(const ccy of ["BTC","EUR","USDC","CT"]){
      try{
        const payload=await bridge("/okx/ledger?ccy="+ccy+"&pages=1");
        result[ccy]={ok:true,payload};
      }catch(error){
        result[ccy]={ok:false,status:Number(error?.status)||0};
        if(error?.status===401)break;
      }
    }
    if(token())ledgerPaint(result);
    else ledgerClear("Session Aether Trust terminée.");
    if(token())ledgerCheckedAt=Date.now();
    updateBtcReading();
    updateCapitalJourney();
    return true;
  })().catch(()=>{
    text("ledgerstatus","Lecture financière impossible ; les soldes précédents restent disponibles.");
    ledgerCheckedAt=Date.now();
    return false;
  }).finally(()=>{ledgerInFlight=null;});
  return ledgerInFlight;
}

async function refresh({force=false}={}){
  if(inflight&&!force)return inflight;
  const t=token();
  if(!t){
    setState("locked",owner()?"AETHER TRUST ACTIF · SESSION BRIDGE À LIER":"AETHER TRUST REQUIS");
    showAuth(true,owner()?"Entre une fois le mot de passe Aether Trust pour lier cette session navigateur au Bridge.":"Authentifie Aether Trust pour lire le compte OKX réel.");
    return false;
  }
  setState("loading","LECTURE OKX RÉELLE…");
  showAuth(false);
  inflight=(async()=>{
    try{
      await bridge("/auth/status");
      const [account,orders,fills,fees]=await Promise.all([
        bridge("/okx/account"),bridge("/okx/orders"),bridge("/okx/fills"),bridge("/okx/fees?instId=BTC-USDC")
      ]);
      paintData(account,orders,fills,fees);
      void refreshLedger(force);
      return true;
    }catch(error){
      if(error?.status===401){saveToken("");ctCycleAccount=null;ctCycleFills=null;ctCycleLedgers=null;lastCapitalEvidence=null;updateCapitalJourney();const inline=q("ctreading");if(inline){inline.hidden=true;inline.replaceChildren();}ledgerClear("Session Aether Trust expirée.");setState("locked","SESSION BRIDGE À RÉAUTHENTIFIER");showAuth(true,"La session Bridge n'est plus valide. Entre le mot de passe Aether Trust.");}
      else{setState("error","OKX / BRIDGE INDISPONIBLE");text("updated",shortError(error));}
      return false;
    }finally{inflight=null;}
  })();
  return inflight;
}

async function submitInlineAuth(event){
  event.preventDefault();
  const input=q("secret"),button=q("connect");
  const secret=String(input?.value||"");
  if(button)button.disabled=true;
  text("authstatus","Connexion Aether Trust au Bridge…");
  try{await login(secret);if(input)input.value="";}
  catch(error){text("authstatus",shortError(error));}
  finally{if(button)button.disabled=false;}
}

function bindCanonicalTrust(){
  const form=document.getElementById("atlasAccessForm"),input=document.getElementById("atlasAccessSecret");
  if(!form||!input||form.dataset.okxBridgeSessionBound==="1")return false;
  form.dataset.okxBridgeSessionBound="1";
  form.addEventListener("submit",()=>{
    const secret=String(input.value||"");
    if(secret.length<6)return;
    void login(secret,{silent:true}).then(()=>refresh({force:true})).catch(()=>{});
  },true);
  return true;
}

function logoutBridge(){
  ctCycleAccount=null;ctCycleFills=null;ctCycleLedgers=null;
  lastCapitalEvidence=null;
  const capital=q("capitalpathbody");if(capital){capital.replaceChildren();capital.textContent="Session terminée : informations privées masquées.";}
  const inline=q("ctreading");
  if(inline){inline.hidden=true;inline.replaceChildren();}
  const t=token();
  if(!t){saveToken("");ledgerClear("Session terminée : journaux financiers masqués.");lastBtcAccount=null;currentBtcHeld=NaN;updateBtcReading();return;}
  fetch(BRIDGE+"/auth/logout",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json",Authorization:`Bearer ${t}`},body:"{}",cache:"no-store",keepalive:true}).catch(()=>{});
  saveToken("");
  lastBtcAccount=null;
  currentBtcHeld=NaN;
  lastSpotExecutions=0;
  for(const code of ["btc","ct","usdc","eur","positionvalue","pending","history","fills","fees"])
    text(code,"—");
  ledgerClear("Session terminée : journaux financiers masqués.");
  setState("locked","AETHER TRUST REQUIS");
}

function mount(){
  if(panel())return true;
  const zone=document.getElementById("market-zone");if(!zone)return false;
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement("style");style.id=STYLE_ID;style.textContent=[
      "#traderOkxAccountPanel{grid-column:1/-1;display:block;box-sizing:border-box;width:99%;margin:14px auto 0;color:#d7eff0;background:linear-gradient(180deg,rgba(7,29,42,.97),rgba(5,19,29,.96));border:1px solid rgba(83,222,222,.34);border-radius:14px;overflow:hidden;font:14px system-ui,sans-serif}",
      "#traderOkxAccountPanel>summary{padding:13px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap;list-style:none;font-size:14px;font-weight:800}",
      "#traderOkxAccountPanel>summary::-webkit-details-marker{display:none}",
      "#traderOkxAccountPanel .okx-live-dot{width:9px;height:9px;border-radius:50%;background:#8796a1;box-shadow:0 0 0 3px rgba(135,150,161,.12)}",
      "#traderOkxAccountPanel[data-state='ready'] .okx-live-dot{background:#58ef9c;box-shadow:0 0 0 3px rgba(88,239,156,.12)}",
      "#traderOkxAccountPanel[data-state='error'] .okx-live-dot{background:#ff8799}",
      "#traderOkxAccountPanel [data-okx-state]{color:#85e9df;font-size:11px;font-weight:700}",
      "#traderOkxAccountPanel .okx-ro{margin-left:auto;padding:4px 8px;border:1px solid rgba(88,239,156,.26);border-radius:999px;color:#8cf2b5;font-size:10px;letter-spacing:.08em}",
      "#traderOkxAccountPanel .okx-body{border-top:1px solid rgba(83,222,222,.14);padding:10px 14px 12px}",
      "#traderOkxAccountPanel .okx-primary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}",
      "#traderOkxAccountPanel .okx-position{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:7px}",
      "#traderOkxAccountPanel .okx-position .okx-card{border-color:rgba(255,209,117,.16)}",
      "#traderOkxAccountPanel .okx-position [data-okx-positionvalue]{color:#fff1c7}",
      "#traderOkxAccountPanel .okx-position [data-okx-avgcost],#traderOkxAccountPanel .okx-position [data-okx-committed],#traderOkxAccountPanel .okx-position [data-okx-pnl]{font-size:13px;color:#d6b879}",
      "#traderOkxAccountPanel .okx-position-proof{margin:6px 2px 0;color:#8ea4ba;font-size:14px;line-height:1.5}",
      "#traderOkxAccountPanel .okx-activity{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:7px}",
      "#traderOkxAccountPanel .okx-card{min-width:0;padding:9px 11px;border:1px solid rgba(142,164,186,.14);border-radius:9px;background:rgba(5,18,28,.58)}",
      "#traderOkxAccountPanel .okx-card.primary{background:linear-gradient(180deg,rgba(8,31,43,.82),rgba(4,19,29,.72));border-color:rgba(83,222,222,.22)}",
      "#traderOkxAccountPanel .okx-card span{display:block;color:#8ea4ba;font-size:12px;text-transform:uppercase;letter-spacing:.07em}",
      "#traderOkxAccountPanel .okx-card b{display:block;margin-top:3px;color:#eefafa;font-size:16px;line-height:1.35;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}",
      "#traderOkxAccountPanel [data-okx-fees]{white-space:pre-line;overflow-wrap:normal;word-break:keep-all}",
      "#traderOkxAccountPanel .okx-card.primary b{font-size:18px;color:#fff1c7}",
      "#traderOkxAccountPanel .okx-card small{display:block;margin-top:3px;color:#91a9b7;font-size:12px;line-height:1.45}",
      "#traderOkxAccountPanel .okx-ledger{margin-top:10px;padding:12px;border:1px solid rgba(83,222,222,.27);border-radius:11px;background:rgba(4,17,27,.76)}",
      "#traderOkxAccountPanel .okx-ledger-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;color:#b6faf0}",
      "#traderOkxAccountPanel .okx-ledger-head strong{font-size:16px;line-height:1.4;letter-spacing:.015em}",
      "#traderOkxAccountPanel .okx-ledger-head button{font-size:13px;min-height:34px;padding:6px 11px}",
      "#traderOkxAccountPanel [data-okx-ledgerstatus]{display:block;font-size:14px;line-height:1.5;font-weight:750;color:#ffe09b;margin:10px 0 6px}",
      "#traderOkxAccountPanel .okx-ledger-note,#traderOkxAccountPanel [data-okx-ledgerwarning]{font-size:13px;line-height:1.5;color:#bed3e3;margin:8px 0}",
      "#traderOkxAccountPanel .okx-ledger-summary{display:flex;flex-wrap:wrap;gap:7px 15px;align-items:center;padding:10px 12px;margin:8px 0;background:rgba(11,42,53,.7);border:1px solid rgba(99,191,190,.25);border-radius:8px;color:#d4e9f0;font-size:13px;line-height:1.5}",
      "#traderOkxAccountPanel .okx-ledger-summary[hidden]{display:none!important}",
      "#traderOkxAccountPanel .okx-ledger-summary strong{color:#f0fcfa;font-size:14px}",
      "#traderOkxAccountPanel .okx-ledger-summary small{flex-basis:100%;font-size:12px;color:#a8bfca;line-height:1.5}",
      "#traderOkxAccountPanel .okx-ledger-movements{margin-top:10px;border-top:1px solid rgba(120,179,197,.18);padding-top:8px}",
      "#traderOkxAccountPanel .okx-ledger-movements>summary{cursor:pointer;font-size:13px;font-weight:650;padding:7px 0;color:#c2e5ed}",
      "#traderOkxAccountPanel .okx-ledger-results{list-style:none;display:grid;gap:7px;margin:12px 0;padding:0;max-height:none;overflow:visible}",
      "#traderOkxAccountPanel .okx-ledger-item{display:grid;grid-template-columns:minmax(220px,1fr) minmax(190px,1fr) minmax(300px,1.3fr);align-items:center;gap:9px;min-width:0;border:1px solid rgba(120,179,197,.25);border-radius:10px;background:rgba(12,36,50,.75);padding:10px 13px}",
      "#traderOkxAccountPanel .okx-ledger-meta{display:flex;flex-direction:column;gap:3px;min-width:0}",
      "#traderOkxAccountPanel .okx-ledger-meta strong{font-size:13px;color:#effbff;font-weight:750}",
      "#traderOkxAccountPanel .okx-ledger-meta span{font-size:12px;color:#c0d2de;line-height:1.45}",
      "#traderOkxAccountPanel .okx-ledger-direction{font-size:13px;font-weight:650;color:#daebf2}",
      "#traderOkxAccountPanel .okx-ledger-amount{font-size:16px;font-weight:750;line-height:1.35;text-align:right;overflow-wrap:anywhere;letter-spacing:.012em;font-variant-numeric:tabular-nums}",
      "#traderOkxAccountPanel .okx-ledger-credit{color:#76f4b5}",
      "#traderOkxAccountPanel .okx-ledger-debit{color:#ffd39b}",
      "#traderOkxAccountPanel .okx-ledger-neutral{color:#e1edf1}",
      "#traderOkxAccountPanel .okx-ledger-empty{font-size:13px;line-height:1.6;padding:12px 0;color:#d6e9ee}",
      "#traderOkxAccountPanel  .okx-ledger-technical{margin-top:10px;border-top:1px solid rgba(120,179,197,.2);padding-top:11px;color:#b6cfdc}",
      "#traderOkxAccountPanel .okx-ledger-technical summary{cursor:pointer;font-size:12px;font-weight:650;line-height:1.5;padding:7px 0}",
      "#traderOkxAccountPanel .okx-ledger-technical p,#traderOkxAccountPanel .okx-ledger-technical li{font-size:12px;line-height:1.6;overflow-wrap:anywhere}",
      "@media(max-width:1050px){#traderOkxAccountPanel .okx-ledger-item{grid-template-columns:minmax(150px,1fr) minmax(150px,1fr)}#traderOkxAccountPanel .okx-ledger-amount{grid-column:1/-1;text-align:left}}",
      "@media(max-width:640px){#traderOkxAccountPanel .okx-ledger-item{grid-template-columns:1fr;gap:7px}#traderOkxAccountPanel .okx-ledger-amount{grid-column:1}#traderOkxAccountPanel .okx-ledger-head strong{font-size:16px}}",
      "#traderOkxAccountPanel .okx-capital-path{margin:10px 0;border:1px solid rgba(121,217,224,.3);border-radius:10px;background:rgba(7,30,40,.93);padding:10px 12px}",
      "#traderOkxAccountPanel .okx-capital-path>summary{cursor:pointer;color:#a9f0e8;font-weight:800;font-size:13px}",
      "#traderOkxAccountPanel .okx-capital-path p{font-size:12px;line-height:1.6;color:#dceef0;overflow-wrap:anywhere;margin:7px 0}",
      "#traderOkxAccountPanel .okx-convert-link{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:32px;margin-top:7px;padding:6px 10px;border:1px solid rgba(215,187,125,.65);border-radius:8px;background:rgba(77,60,28,.28);color:#ffe1a3;font:700 12px/1.35 system-ui,sans-serif;text-decoration:none;white-space:normal}",
      "#traderOkxAccountPanel .okx-convert-link:focus-visible{outline:2px solid #afe4e4;outline-offset:2px}",
      "#traderOkxAccountPanel .okx-convert-notice{color:#c3d3d6;font-size:10px;line-height:1.5;margin-top:6px}",
      "#traderOkxAccountPanel .okx-ct-reading{padding:10px 12px;margin:10px 0;border:1px solid rgba(121,217,224,.3);border-radius:10px;background:rgba(6,28,39,.97);color:#deeff2}",
      "#traderOkxAccountPanel .okx-ct-reading[hidden]{display:none!important}",
      "#traderOkxAccountPanel .okx-ct-reading>strong{display:block;color:#a7eee8;font-size:13px;margin:0 0 8px}",
      "#traderOkxAccountPanel .okx-ct-reading p{margin:7px 0;line-height:1.6;font-size:12px;overflow-wrap:anywhere}",
      "#traderOkxAccountPanel .okx-btc-reading{margin:10px 0;border:1px solid rgba(121,217,224,.28);border-radius:10px;background:rgba(9,36,47,.5);padding:10px 12px}",
      "#traderOkxAccountPanel .okx-btc-reading>summary{cursor:pointer;color:#b2f4f2;font-size:13px;font-weight:750}",
      "#traderOkxAccountPanel .okx-btc-report p{margin:7px 0;color:#d8e8ed;font-size:12px;line-height:1.6;overflow-wrap:anywhere}",
      "#traderOkxAccountPanel .okx-foot{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:8px;color:#8ea4ba;font-size:12px}",
      "#traderOkxAccountPanel button,#traderOkxAccountPanel input{border:1px solid #436d7a;border-radius:8px;background:#123743;color:#fff;padding:7px 10px}",
      "#traderOkxAccountPanel button{cursor:pointer;font-weight:700}",
      "#traderOkxAccountPanel .okx-auth{display:grid;grid-template-columns:auto minmax(220px,1fr) auto;align-items:center;gap:8px;margin:8px 0 0;padding:8px 10px;border:1px solid rgba(255,201,103,.25);border-radius:10px;background:rgba(45,29,8,.25)}",
      "#traderOkxAccountPanel .okx-auth[hidden]{display:none!important}",
      "#traderOkxAccountPanel .okx-auth input{min-width:0;width:100%;height:34px;box-sizing:border-box}",
      "#traderOkxAccountPanel .okx-auth button{height:34px;white-space:nowrap}",
      "#traderOkxAccountPanel .okx-auth small{color:#d9c08d;white-space:nowrap}",
      "@media(max-width:1200px){#traderOkxAccountPanel .okx-primary{grid-template-columns:repeat(2,minmax(0,1fr))}#traderOkxAccountPanel .okx-position,#traderOkxAccountPanel .okx-activity{grid-template-columns:repeat(2,minmax(0,1fr))}}",
      "@media(max-width:760px){#traderOkxAccountPanel .okx-primary,#traderOkxAccountPanel .okx-position,#traderOkxAccountPanel .okx-activity{grid-template-columns:1fr}#traderOkxAccountPanel .okx-auth{grid-template-columns:1fr}#traderOkxAccountPanel .okx-auth small{white-space:normal}.okx-ro{margin-left:0!important}}"
    ].join("");document.head.appendChild(style);
  }
  const p=document.createElement("details");p.id=PANEL_ID;p.open=true;p.dataset.state="loading";
  p.setAttribute("aria-label","Compte OKX réel · lecture seule via Aether Trust");
  p.innerHTML=[
    '<summary><i class="okx-live-dot" aria-hidden="true"></i><strong>COMPTE OKX · RÉEL</strong><span data-okx-state>INITIALISATION…</span><span class="okx-ro">LECTURE SEULE · AUCUN ORDRE</span></summary>',
    '<div class="okx-body"><div class="okx-primary">',
    '<article class="okx-card primary"><span>BTC détenu</span><b data-okx-btc>—</b><small data-okx-btcdetail>Trading / Funding</small></article>',
    '<article class="okx-card primary"><span>CT détenu</span><b data-okx-ct>—</b><small data-okx-ctdetail>Trading / Funding</small><button type="button" data-okx-analyze-ct>Analyser avec Seven · CT</button><a class="okx-convert-link" href="https://www.okx.com/fr-fr/trade-convert" target="_blank" rel="noopener noreferrer" title="Ouvrir OKX Convert dans un nouvel onglet ; aucun ordre depuis ERITH.IA">Convertir mes CT sur OKX ↗</a><small class="okx-convert-notice">À sélectionner manuellement sur OKX (CT → USDC). Vérifie le devis, son délai et le spread possible avant de confirmer.</small></article>',
    '<article class="okx-card primary"><span>USDC disponible</span><b data-okx-usdc>—</b><small data-okx-usdcdetail>Trading / Funding</small></article>',
    '<article class="okx-card primary"><span>EUR disponible</span><b data-okx-eur>—</b><small data-okx-eurdetail>Trading / Funding</small></article>',
    '</div><section class="okx-ct-reading" data-okx-ctreading hidden role="status" aria-live="polite"></section><details class="okx-capital-path" data-okx-ctcycle><summary>Seven · CT liquidé · réconciliation lecture seule</summary><p data-okx-ctcyclestatus>Journaux CT/USDC en attente</p><div data-okx-ctcyclebody>Ouvre ce rapport après actualisation OKX.</div></details><details class="okx-capital-path" data-okx-capitalpath><summary>Seven · Parcours du capital · BTC → USDC → CT</summary><div data-okx-capitalpathbody role="status" aria-live="polite">Ouvre ce rapport pour rapprocher les opérations déjà consultées sur OKX.</div></details><div class="okx-position">',
    '<article class="okx-card"><span>Valeur BTC actuelle</span><b data-okx-positionvalue>—</b><small>Équivalent USD retourné par OKX</small><small data-okx-eurestimate>Estimation en EUR : cotation en attente</small></article>',
    '<article class="okx-card"><span>Prix moyen d’achat</span><b data-okx-avgcost>—</b><small data-okx-avgcosthint>Calculé seulement avec un historique prouvé</small></article>',
    '<article class="okx-card"><span>Montant total investi</span><b data-okx-committed>—</b><small data-okx-committedhint>Achats + frais prouvés</small></article>',
    '<article class="okx-card"><span>Gain / perte actuel</span><b data-okx-pnl>—</b><small data-okx-pnlhint>Valeur actuelle − montant investi</small></article>',
    '</div><p class="okx-position-proof" data-okx-positionproof>Historique d’acquisition en cours de qualification.</p><p class="okx-position-proof" data-okx-costbreakdown>Coût d’entrée et variation du marché : recherche de cotation historique.</p><details class="okx-btc-reading" data-okx-btcreadingdetails><summary>Seven · Analyse de ma position BTC</summary><div class="okx-btc-report" data-okx-btcreading role="status" aria-live="polite">Ouvre ce rapport pour lire ton BTC en lecture seule.</div></details><div class="okx-activity">',
    '<article class="okx-card"><span>Ordres ouverts</span><b data-okx-pending>—</b><small>SPOT OKX</small></article>',
    '<article class="okx-card"><span>Historique Spot</span><b data-okx-history>—</b><small>Ordres Spot · 3 mois, hors achat PayPal</small></article>',
    '<article class="okx-card"><span>Exécutions Spot</span><b data-okx-fills>—</b><small>Transactions Spot · 3 mois, hors achat PayPal</small></article>',
    '<article class="okx-card"><span>Frais BTC-USDC</span><b data-okx-fees>—</b><small>tarification du compte</small></article>',
    '</div><section class="okx-ledger" aria-label="Historique financier OKX en lecture seule"><div class="okx-ledger-head"><strong>HISTORIQUE DU COMPTE OKX</strong><button type="button" data-okx-ledgerrefresh>Actualiser l’historique</button></div><p role="status" data-okx-ledgerstatus>En attente de connexion.</p><div class="okx-ledger-summary" data-okx-ledgersummary hidden><strong data-okx-ledgersummarydate>—</strong><span data-okx-ledgersummaryeur>—</span><span>→</span><strong data-okx-ledgersummarybtc>—</strong><span>· Taux déduit : <b data-okx-ledgersummaryrate>—</b></span><small>Rapprochement indicatif des écritures OKX, pas une preuve du paiement externe ni du coût de toutes les acquisitions.</small></div><p data-okx-ledgerwarning></p><details class="okx-ledger-movements"><summary data-okx-ledgerdetailcount>Afficher les mouvements détaillés</summary><p class="okx-ledger-note">Chaque ligne correspond à une variation de solde, pas nécessairement à un achat distinct.</p><ul class="okx-ledger-results" data-okx-ledgerentries></ul></details><details class="okx-ledger-technical"><summary>Afficher les références et les sources OKX</summary><p data-okx-ledgercoverage>En attente de lecture.</p><ol data-okx-ledgerreferences></ol></details></section><form class="okx-auth" data-okx-auth hidden><small data-okx-authstatus>Aether Trust requis.</small><input data-okx-secret type="password" minlength="6" autocomplete="current-password" placeholder="Mot de passe Aether Trust"><button data-okx-connect type="submit">Connecter</button></form>',
    '<div class="okx-foot"><b data-okx-bridge>Bridge local 8787 · OKX Private REST</b><span>Dernière lecture : <span data-okx-updated>—</span></span><button type="button" data-okx-refresh>Actualiser</button></div></div>'
  ].join("");
  const caseStudy=document.getElementById("traderOkbCaseStudy");
  if(caseStudy?.parentElement===zone)zone.insertBefore(p,caseStudy);
  else{
    const analyst=document.getElementById("analyste");
    if(analyst?.parentElement===zone)analyst.insertAdjacentElement("afterend",p);
    else zone.appendChild(p);
  }
  p.querySelector("[data-okx-ctcycle]")?.addEventListener("toggle",event=>{
    if(!event.currentTarget.open)return;
    updateCtClosedCycle();
    if(token()&&owner())void refreshLedger(false);
  });
  p.querySelector("[data-okx-capitalpath]")?.addEventListener("toggle",event=>{
    if(!event.currentTarget.open)return;
    updateCapitalJourney();
    if(token()&&owner())void refreshLedger(false);
  });
  p.querySelector("[data-okx-btcreadingdetails]")?.addEventListener("toggle",event=>{
    if(!event.currentTarget.open)return;
    updateBtcReading();
    if(token()&&owner())void refresh({force:true});
  });
  p.querySelector("[data-okx-analyze-ct]")?.addEventListener("click",async()=>{
    // Analyse ici, sous le compte OKX. Ni ouverture du panneau graphique,
    // ni scroll forcé, ni modification de l'actif mémorisé V7.
    const target=p.querySelector("[data-okx-ctreading]");
    const button=p.querySelector("[data-okx-analyze-ct]");
    if(!target||button?.disabled)return;
    target.hidden=false;
    if(button)button.disabled=true;
    try{
      const ai=globalThis.AgentCryptoAiCtPanel;
      if(!ai?.readForAccount){
        target.textContent="Analyse Seven CT en cours de chargement. Recharge le Trader.";
        return;
      }
      await ai.readForAccount(target);
    }finally{
      if(button)button.disabled=false;
    }
  });
  p.querySelector("[data-okx-auth]")?.addEventListener("submit",submitInlineAuth);
  p.querySelector("[data-okx-refresh]")?.addEventListener("click",()=>void refresh({force:true}));
  p.querySelector("[data-okx-ledgerrefresh]")?.addEventListener("click",()=>void refreshLedger(true));
  p.addEventListener("toggle",()=>{if(p.open)void refresh({force:true});});
  bindCanonicalTrust();
  window.addEventListener("aether-trust:logout-requested",logoutBridge,{passive:true});
  window.addEventListener("pageshow",()=>{bindCanonicalTrust();if(p.open)void refresh({force:true});},{passive:true});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&p.open)void refresh();},{passive:true});
  clearInterval(timer);timer=setInterval(()=>{if(!document.hidden&&p.open&&token())void refresh();},AUTO_REFRESH_MS);
  void refresh({force:true});
  return true;
}

if(typeof module==="object"&&module.exports)module.exports=Object.freeze({btcPositionReport,btcQuantityChain,capitalJourneyReport,btcScenarioGrid});
if(typeof document==="undefined")return;
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
globalThis.AgentCryptoTraderOkxAccount=Object.freeze({mount,refresh,login,logout:logoutBridge,read_only:true,bridge:BRIDGE,token_storage:"sessionStorage",okx_credentials_in_browser:false,real_orders:false});
})();