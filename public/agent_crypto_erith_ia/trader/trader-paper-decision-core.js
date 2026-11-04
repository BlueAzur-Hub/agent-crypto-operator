/* ERITH.IA Trader · Pure PAPER decision reading, no I/O and no trading. */
(function(root,factory){"use strict";const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.AgentCryptoTraderPaperDecision=api;
})(typeof globalThis!=="undefined"?globalThis:null,()=>{
"use strict";
const SCHEMA="erith.trader.paper-decision-reading.v1";
const insufficient=reason=>Object.freeze({schema:SCHEMA,decision:"PREUVES_INSUFFISANTES",
 reason,executable:false,orders_enabled:false,strategy_certified:false});
const rejected=(reason,info)=>Object.freeze({schema:SCHEMA,decision:"REJETER",reason,...info,
 executable:false,orders_enabled:false,strategy_certified:false});
const review=(reason,info)=>Object.freeze({schema:SCHEMA,decision:"A_ETUDIER",reason,...info,
 executable:false,orders_enabled:false,strategy_certified:false});
const stamp=value=>{
 if(typeof value!=="string"||!value.endsWith("Z"))return NaN;
 const time=Date.parse(value);return Number.isFinite(time)?time:NaN;
};
function validSignal(doc){
 return doc?.schema==="erith.radar.signal-evidence-audit.v1"&&
  doc.kind==="RESEARCH_AUDIT_NOT_STRATEGY_SELECTION"&&
  doc.orders_enabled===false&&doc.strategy_certified===false&&
  doc.real_orders===0&&doc.paper_fills===0&&
  doc.top50_retro_7d?.true_unseen_holdout===false&&
  doc.top50_retro_7d?.source_quote==="USD"&&
  doc.radar_forward_j1?.quote==="USD"&&
  doc.okx_context?.quote==="USDT"&&
  doc.okx_context?.no_executable_returns_derived_from_usd===true;
}
function cohortContext(doc){
 if(!validSignal(doc))return "Études Radar historiques non validées.";
 const v=doc.top50_retro_7d?.periods?.later_descriptive_validation;
 const count=v?.signals_total,seen=v?.followups_observed,missing=v?.followups_missing;
 if(!Number.isInteger(count)||!Number.isInteger(seen)||!Number.isInteger(missing)||
    count<=0||count!==seen+missing)return "Études Radar: statistiques de période manquantes.";
 const change=v.mean_observed_gross_change_pct;
 return "Contexte global Top50 à 7 jours (USD, pas cette paire) : "+
   seen+"/"+count+" suivis ; "+missing+" manquants ; "+
   (typeof change==="number"&&Number.isFinite(change)?
    "variation brute moyenne "+change.toFixed(2)+" %.":"variation non mesurable.")+
   " Audit rétrospectif non validant, ni preuve d'exécution OKX.";
}
function assess({selected,qualification,signal,engine,now=Date.now()}={}){
 if(!Number.isFinite(now))return insufficient("Horloge non vérifiable.");
 if(selected?.ok&&selected.asset==="BTC"&&selected.provider==="coingecko"&&
    selected.instrument==="BTC-USD")
   return insufficient("BTC : l'étude historique du graphique est disponible ci-dessus. "+
     "La qualification Radar Spot des 20 candidats ne certifie pas ici de carnet BTC OKX "+
     "récent ni de revente pour ce compte ; ne pas confondre USD et USDT.");
 if(selected?.ok&&selected.asset==="CT"&&selected.provider==="okx")
   return insufficient("CT : étude historique possible si la source externe est qualifiée ; "+
     "le diagnostic des candidats Radar ne fournit pas de preuve de lot et carnet CT/USDC "+
     "pour un ordre. Aucun ordre OKX n'est déclenché.");
 if(!selected?.ok||selected.currency!=="USD"||
    typeof selected.asset!=="string"||!/^[A-Z0-9]{1,20}$/.test(selected.asset)||
    !/^[a-z0-9][a-z0-9-]{1,99}$/.test(String(selected.coinId||""))||
    selected.provider!=="coingecko"||
    selected.sourceIdentity!=="coingecko|"+selected.asset+"-USD|USD|"+selected.coinId||
    !Number.isFinite(selected.ageMs)||selected.ageMs<0||selected.ageMs>15*60000)
  return insufficient("Actif ou graphique Solo 24 h USD non qualifié ; aucune substitution de paire. CT et les listings externes demandent une identité spécifique.");
 if(!validSignal(signal))return insufficient("Rapport des signaux absent ou non conforme ; aucune conclusion de stratégie.");
 if(qualification?.schema!=="erith.radar.spot-qualification.v1"||
    qualification.real_orders_enabled!==false||
    qualification.coin_id_matches_exchange_symbol_verified!==false||
    qualification.actual_execution_permissions!==false||
    qualification.quote!=="USDT"||!Array.isArray(qualification.candidates)||
    qualification.candidates.length!==20)
  return insufficient("Qualification Radar Spot incompatible ou absente.");
 const matches=qualification.candidates.filter(c=>
   c?.id===selected.coinId||c?.symbol===selected.asset);
 if(matches.length!==1||matches[0].id!==selected.coinId||
    matches[0].symbol!==selected.asset)
  return insufficient("Aucune identité unique CoinGecko ↔ candidat Radar du jour ; une correspondance de symbole ne suffit pas.");
 const c=matches[0],spot=c.okx_spot;
 if(spot?.venue!=="OKX"||spot.quote!=="USDT"||
    spot.pair!==selected.asset+"-USDT"||
    spot.pair_observed!==true||spot.native_rules_verified!==true||
    spot.contract_identity_proven!==false||spot.account_access_proven!==false||
    spot.real_fees_proven!==false||spot.real_orders_enabled!==false||
    spot.rules?.source!=="OKX_PUBLIC_SPOT_INSTRUMENT")
  return insufficient("Instrument Spot OKX/USDT et ses règles non prouvés pour cet actif.");
 const book=spot.best_book;
 const sourceTime=stamp(book?.exchange_time_utc),collected=stamp(book?.collected_at_utc);
 if(book?.schema!=="erith.radar.okx.spot-best-book.v1"||
    book.source!=="OKX_PUBLIC_SPOT_BOOK"||book.pair!==spot.pair||
    book.quote!=="USDT"||book.market_execution_proven!==false||
    book.fees_verified!==false||book.orders_enabled!==false||
    !Number.isFinite(sourceTime)||!Number.isFinite(collected)||
    sourceTime>collected+5000||collected-sourceTime>120000)
  return insufficient("Carnet OKX absent, non daté ou incohérent.");
 const historical=cohortContext(signal);
 if(sourceTime>now+30000||now-sourceTime>5*60000)
  return insufficient("Dernier carnet OKX daté du "+new Date(sourceTime).toISOString()+
    " : trop ancien pour une décision actuelle. "+historical);
 if(typeof engine?.previewOkxSpot!=="function")
  return insufficient("Moteur Spot PAPER non chargé ; aucun calcul de revente certifié.");
 const p=engine.previewOkxSpot(c);
 const info={asset:selected.asset,coin_id:selected.coinId,pair:spot.pair,
  book_at_utc:book.exchange_time_utc,quote:"USDT",context:historical,
  assumptions:"Billet fictif 100 USDT ; frais hypothétiques achat BASE 0,1 %, vente USDT 0,1 %, glissement 0,2 % par côté.",
  contract_identity_proven:false,account_access_verified:false,
  actual_fees_verified:false,source_book_only:true,
  executable:false,orders_enabled:false,strategy_certified:false};
 if(p.status==="HYPOTHETICAL_IMMEDIATE_ROUNDTRIP_ONLY"){
  const threshold=p.approximateBidRiseToBreakEvenPct;
  if(!Number.isFinite(threshold)||threshold<0)return insufficient("Seuil de coût PAPER invalide.");
  return review("Coût de l'aller-retour immédiat évaluable sur un carnet public daté. "+
    "Ce n'est ni un signal d'achat, ni une rentabilité prédite.",{
    ...info,break_even_bid_rise_pct:threshold,
    immediate_paper_loss_pct:p.hypotheticalImmediatePnlPct,
    sellable_quantity:p.netSellableQuantity});
 }
 if(p.status==="NOT_EVALUABLE"&&[
   "NET_QUANTITY_BELOW_OKX_EXIT_MINIMUM","GROSS_QUANTITY_BELOW_OKX_MINIMUM",
   "ASK_BEST_LEVEL_DEPTH_INSUFFICIENT","BID_BEST_LEVEL_DEPTH_INSUFFICIENT",
   "PAPER_BUDGET_EXCEEDED"].includes(p.reason))
  return rejected("Billet PAPER de 100 USDT non négociable au meilleur niveau observé : "+p.reason+".",info);
 return insufficient("Carnet, quantité ou règles incompatibles : "+String(p.reason||"preuve absente")+
   ". Aucun ordre ni profit retenu.");
}
/* Qualification du graphique différé : contrôle strict du contenu avec l'horloge
   DU DERNIER POINT, pas avec l'horloge actuelle. Réservé à la rétrospective ;
   la qualification Spot/live garde sa limite existante de 15 minutes. */
function qualifyHistoricalAsOf(input,lab,now=Date.now()){
 const series=input?.series,last=Array.isArray(series)?series[series.length-1]:null;
 const at=Array.isArray(last)?last[0]:NaN;
 if(!Number.isFinite(now)||!Number.isFinite(at)||at>now||
    now-at>48*60*60*1000)return Object.freeze({ok:false,
   reason:"Historique absent, futur ou âgé de plus de 48 h ; collecte graphique à actualiser."});
 if(typeof lab?.qualify!=="function"||typeof lab?.historicalStudy!=="function")
   return Object.freeze({ok:false,reason:"Laboratoire historique indisponible."});
 // This is an observation-time validation, NOT a live current-time quote.
 const q=lab.qualify(input,at);
 if(!q?.ok)return Object.freeze({ok:false,reason:q?.reason||"Série historique invalide."});
 return Object.freeze({ok:true,qualified:q,asOf:at,ageMinutes:(now-at)/60000,
  historicalOnly:true,realOrders:false,spotExecutionPermitted:false});
}
/* Reuse the existing PAPER laboratory study: it is descriptive, immediate,
   overlapping, in notional USD, and never exchange-executable. */
function summarizeHistorical(study,selected){
 if(!selected?.ok)return Object.freeze({status:"NOT_AVAILABLE",
   reason:"Graphique non qualifié. Le diagnostic n'attribue jamais une série à un autre actif.",
   orders_enabled:false,strategy_certified:false});
 if(study?.ok!==true||study.asset!==selected.asset||
    study.sourceIdentity!==selected.sourceIdentity||
    study.overlapping!==true||study.retrospective!==true||
    study.predictive!==false||study.realOrders!==false||
    study.feesProven!==false||!Number.isInteger(study.windows)||
    study.windows<10||!Number.isFinite(study.profitablePct)||
    study.profitablePct<0||study.profitablePct>100||
    !Number.isFinite(study.medianProfit)||!Number.isFinite(study.bestProfit)||
    !Number.isFinite(study.worstProfit)||
    !Number.isFinite(study.capital)||study.capital<=0)
   return Object.freeze({status:"NOT_AVAILABLE",
     reason:"Étude historique indisponible ou incohérente. Aucune rentabilité conclue.",
     orders_enabled:false,strategy_certified:false});
 return Object.freeze({status:"HISTORICAL_ONLY",asset:study.asset,
   windows:study.windows,positive_windows_pct:study.profitablePct,
   median_profit_notional_usd:study.medianProfit,
   best_profit_notional_usd:study.bestProfit,
   worst_profit_notional_usd:study.worstProfit,
   capital_notional_usd:study.capital,
   source_from_utc:study.firstAt,source_to_utc:study.lastAt,
   overlapping:true,independent_portfolio_trials:false,
   okx_costs_verified:false,actual_executions:0,
   reason:"Observation historique immédiate : fenêtres de 60 minutes chevauchantes, "+
   "frais supposés. Aucun signal d'achat ni gain de portefeuille démontré.",
   orders_enabled:false,strategy_certified:false});
}

/* Read-only OKX LIMIT ticket preflight from an exact PUBLIC Spot hourly snapshot.
   Funds are hypothetical; actual Trading balance/fees/order permissions are
   NEVER inferred from a screenshot, WebSocket, market maker quote or Funding. */
const TICKET="erith.trader.okx-spot-limit-preflight.v1",UNIT=10n**18n;
// Small bounded tolerance for clock/network jitter; never waive book age.
const CT_BOOK_CLOCK_LEEWAY_MS=2000;
const CANONICAL_COINS=Object.freeze({BTC:"bitcoin",ETH:"ethereum",SOL:"solana",
 XRP:"ripple",OKB:"okb"});
function exact(raw){
 if(typeof raw!=="string"||!/^\d{1,14}(?:\.\d{1,18})?$/.test(raw))
   throw Error("Décimal natif non vérifié");
 const [whole,frac=""]=raw.split(".");
 return BigInt(whole)*UNIT+BigInt(frac.padEnd(18,"0"));
}
function exactFmt(n){
 if(n<0n)throw Error("Montant négatif");
 return String(n/UNIT)+"."+String(n%UNIT).padStart(18,"0").replace(/0+$/,"").padEnd(1,"0");
}
function ceiling(n,step){return (n+step-1n)/step*step}
function ticketBlocked(reason,extras={}){
 return Object.freeze({schema:TICKET,status:"BLOQUE",reason,
  ...extras,account_verified:false,fees_verified:false,
  trading_balance_verified:false,market_execution_proven:false,
  orders_enabled:false,real_orders:0,trade_endpoint:null,
  executable:false,has_submit_action:false});
}
/* Multi-instrument public OKX Spot evidence gate. A verified native instrument
   and native book are pair-specific; the chart never supplies limit prices.
   Bridge public route and anonymous OKX metadata only. No account/order IO. */
function nativeSpotPair(pair){
 if(typeof pair!=="string"||!/^[A-Z][A-Z0-9]{0,19}-(?:USDC|USDT|EUR)$/.test(pair))return null;
 const index=pair.lastIndexOf("-");
 return Object.freeze({pair,base:pair.slice(0,index),quote:pair.slice(index+1)});
}
function verifiedSpotLiveBook(payload,pair,now){
 const instrument=nativeSpotPair(pair);
 if(!instrument||payload?.status!=="ok"||payload?.provider!=="okx"||
    payload?.pair!==pair||payload?.quote!==instrument.quote||
    !Number.isFinite(now))return null;
 const when=Date.parse(payload.observed_at_utc);
 if(!Number.isFinite(when)||when>now+CT_BOOK_CLOCK_LEEWAY_MS||
    now-when>20000)return null;
 const bids=payload.bids,asks=payload.asks;
 if(!Array.isArray(bids)||!Array.isArray(asks)||!bids.length||!asks.length)return null;
 try{
  for(const [side,descending] of [[bids,true],[asks,false]]){
   let previous=null;
   for(const row of side.slice(0,5)){
    if(!Array.isArray(row)||row.length<2)return null;
    const price=exact(row[0]),qty=exact(row[1]);
    if(price<=0n||qty<=0n)return null;
    if(previous!==null&&(descending?price>previous:price<previous))return null;
    previous=price;
   }
  }
  if(exact(bids[0][0])>=exact(asks[0][0]))return null;
  return Object.freeze({source_at_utc:payload.observed_at_utc,
    market_fill_proven:false,bids,asks});
 }catch(_){return null;}
}
function diagnoseSpotLiveBook(payload,pair,now=Date.now()){
 const fail=(code,reason)=>Object.freeze({accepted:false,code,reason});
 const instrument=nativeSpotPair(pair);
 if(!instrument)return fail("PAIR_SELECTION","Paire Spot native non qualifiée.");
 if(!payload)return fail("NO_LOCAL_BOOK","Aucun carnet local reçu.");
 if(payload.status!=="ok"||payload.provider!=="okx"||
    payload.pair!==pair||payload.quote!==instrument.quote)
   return fail("PAIR_OR_SOURCE","Source, actif ou paire du carnet local non conforme à "+pair+".");
 const at=Date.parse(payload.observed_at_utc||"");
 if(!Number.isFinite(now)||!Number.isFinite(at))
   return fail("TIMESTAMP_INVALID","Horodatage du carnet OKX absent ou invalide.");
 if(at>now+CT_BOOK_CLOCK_LEEWAY_MS)
   return fail("TIMESTAMP_FUTURE","Heure du carnet en avance de "+
      ((at-now)/1000).toFixed(3)+" s sur Firefox (tolérance 2 s dépassée).");
 if(now-at>20000)
   return fail("BOOK_STALE","Carnet local trop ancien ("+
     Math.round((now-at)/1000)+" secondes) ; aucun prix actuel accepté.");
 if(!verifiedSpotLiveBook(payload,pair,now))
   return fail("BOOK_INVALID","Niveaux de prix ou quantités invalides, mal triés ou croisés.");
 return Object.freeze({accepted:true,code:"LOCAL_OK",
   reason:(at>now?"Petit écart d'horloge de "+((at-now)/1000).toFixed(3)+
      " s toléré. ":"")+"Carnet OKX "+pair+" récent qualifié (sans garantie d'exécution)."});
}
function verifiedSpotRules(source,pair,now){
 const instrument=nativeSpotPair(pair);
 if(!instrument||!Number.isFinite(now))return null;
 const at=Date.parse(source?.observed_at_utc||"");
 if(!Number.isFinite(at)||at>now||now-at>120000||
    source?.payload?.code!=="0"||!Array.isArray(source.payload.data))return null;
 const hits=source.payload.data.filter(r=>r?.instId===pair&&r?.instType==="SPOT");
 if(hits.length!==1)return null;
 const r=hits[0];
 if(r.state!=="live"||r.baseCcy!==instrument.base||
    r.quoteCcy!==instrument.quote)return null;
 try{
  const min=exact(r.minSz),lot=exact(r.lotSz),tick=exact(r.tickSz);
  if(!min||!lot||!tick)return null;
  return Object.freeze({minSz:r.minSz,lotSz:r.lotSz,
    tickSz:r.tickSz,at:source.observed_at_utc});
 }catch(_){return null;}
}
/* Legacy CT-only entrypoints intentionally kept for strict regression tests. */
function verifiedCtLiveBook(payload,pair,now){
 return pair==="CT-USDC"?verifiedSpotLiveBook(payload,pair,now):null;
}
function diagnoseCtLiveBook(payload,pair,now=Date.now()){
 return pair==="CT-USDC"?diagnoseSpotLiveBook(payload,pair,now):
   Object.freeze({accepted:false,code:"PAIR_SELECTION",reason:"Le ticket ne concerne pas CT-USDC."});
}
function verifiedCtSpotRules(source,pair,now){
 return pair==="CT-USDC"?verifiedSpotRules(source,pair,now):null;
}

/* Shared PAPER-only instrument selection contract.
 * The chart is a source of identity, NEVER the price/rules of the Spot order.
 * Proves symbol/source consistency, not a tradable exchange pair.
 * Exchange eligibility is checked independently against the exact native
 * archived Spot market, and later its dated account-level evidence. */
function qualifyPaperSpotSelection({selected,pair}={}){
 const reject=(code,reason)=>Object.freeze({ok:false,status:code,reason,
   executable:false,orders_enabled:false,exchange_pair_verified:false});
 const asset=String(selected?.asset||"");
 if(!/^[A-Z][A-Z0-9]{0,19}$/.test(asset))
  return reject("IDENTITE_ABSENTE","Symbole d'actif absent ou non canonique.");
 const normalizedChart=String(selected?.instrument||"").toUpperCase().replace("/","-");
 const canonical=Object.prototype.hasOwnProperty.call(CANONICAL_COINS,asset)&&
    selected?.coinId===CANONICAL_COINS[asset]&&
    selected?.currency==="USD"&&selected?.provider==="coingecko"&&
    selected?.instrument===asset+"-USD";
 const ctExternal=asset==="CT"&&selected?.provider==="okx"&&
    normalizedChart==="CT-USDT"&&selected?.currency==="USD"&&
    /OKX.*CT[/-]USDT/i.test(String(selected?.source||""))&&
    /USDT[/-]USD.*CoinGecko/i.test(String(selected?.source||""));
 if(!canonical&&!ctExternal)
   return reject("GRAPHIQUE_NON_QUALIFIE",
     "Le graphique ne certifie pas l'identité de l'actif. "+
     "CT exige une source explicite OKX CT-USDT distincte de la paire Spot CT-USDC.");
 const quotes=["USDC","USDT","EUR"];
 if(typeof pair!=="string"||!quotes.some(q=>pair===asset+"-"+q))
   return reject("PAIRE_INCOHERENTE",
     "La paire Spot demandée ne correspond pas à l'actif et à la cotation explicite.");
 const quote=pair.slice(asset.length+1);
 return Object.freeze({ok:true,status:"SELECTION_PAPER_COHERENTE",
   asset,coin_id:selected.coinId||null,pair,base:asset,quote,
   chart_instrument:selected.instrument,chart_provider:selected.provider,
   chart_currency:selected.currency,
   exchange:"okx",native_spot_market_verified:false,
   account_limits_verified:false,orders_enabled:false,executable:false,
   requires_exact_native_spot_book:true,requires_exact_native_spot_rules:true,
   requires_account_pair_specific_preflight:true});
}
function prepareSpotTicket({selected,archive,pair,budgetQuote="10",now=Date.now(),liveBook=null,instrumentEvidence=null}={}){
 try{
  if(!Number.isFinite(now))return ticketBlocked("Horloge non vérifiable.");
  const choice=qualifyPaperSpotSelection({selected,pair});
  if(!choice.ok)return ticketBlocked(choice.reason);
  const asset=choice.asset;
  // From here only the exact native Spot archive may establish a pair.
  // No chart quote (USD/USDT conversion) ever replaces its order book.
  if(archive?.schema!=="erith.radar.okx-hourly-spot.v1"||
     archive?.orders_enabled!==false||archive?.real_orders!==0||
     archive?.paper_fills!==0||!Array.isArray(archive.hours)||
     archive.hours.length===0||archive.hours.length>24)
    return ticketBlocked("Archives OKX publiques absentes ou incompatibles.");
  const sorted=[...archive.hours].sort((a,b)=>
    String(a?.hour_utc).localeCompare(String(b?.hour_utc)));
  const last=sorted.at(-1);
  if(last?.schema!==archive.schema||last?.orders_enabled!==false||
     last?.real_orders!==0||last?.paper_fills!==0||
     last?.instrument_type!=="SPOT"||last?.no_quote_conversion!==true||
     !Array.isArray(last.markets)||last.hour_utc.slice(0,10)!==archive.date_utc)
    return ticketBlocked("Dernier relevé Spot non qualifié.");
  const matches=last.markets.filter(m=>m?.pair===pair);
  if(matches.length!==1||matches[0].base!==asset||
     !["USDC","USDT","EUR"].includes(matches[0].quote)||
     matches[0].pair!==asset+"-"+matches[0].quote)
    return ticketBlocked("Paire absente ou identité du carnet ambiguë.");
  const m=matches[0],archivedBook=m.book5;
  const localBook=verifiedSpotLiveBook(liveBook,pair,now);
  const book=localBook||archivedBook;
  if(m.status!=="VERIFIED_PUBLIC_BOOK"||!archivedBook||
     book.market_fill_proven!==false||!Array.isArray(book.bids)||
     !Array.isArray(book.asks)||!Array.isArray(book.bids[0])||
     !Array.isArray(book.asks[0]))
    return ticketBlocked("Carnet public absent ou non qualifié.");
  const quote=m.quote,ts=Date.parse(book.source_at_utc),
        observed=Date.parse(last.observed_at_utc);
  if(!Number.isFinite(ts)||!Number.isFinite(observed)||
     ts>now+30000||
     (!localBook&&Math.abs(ts-observed)>180000)||
     observed>now+30000)
    return ticketBlocked("Heure du carnet ou observation incohérente.");
  const age=Math.max(0,Math.round((now-ts)/60000));
  const freshRules=verifiedSpotRules(instrumentEvidence,pair,now);
  const rules=freshRules||m.rules;
  const tick=exact(rules?.tickSz),lot=exact(rules?.lotSz),
        minimum=exact(rules?.minSz);
  const ask=exact(book.asks[0][0]),bid=exact(book.bids[0][0]),
        askQty=exact(book.asks[0][1]),bidQty=exact(book.bids[0][1]),
        budget=exact(budgetQuote);
  if(!tick||!lot||!minimum||!ask||!bid||bid>=ask||
     ask%tick||bid%tick||!askQty||!bidQty||!budget||
     budget>10000n*UNIT)
    return ticketBlocked("Prix, lot, frais ou budget d'étude invalides.");
  // QUOTE used for cost; 0.1% BASE buy fee is a conservative HYPOTHESIS.
  const gross=((budget*UNIT)/ask)/lot*lot;
  const feeBase=(gross*10n+9999n)/10000n;
  const net=gross>feeBase?gross-feeBase:0n;
  const sellable=net/lot*lot;
  const notional=gross*ask/UNIT;
  const minBuyQuote=minimum*ask/UNIT;
  const exitQuote=sellable*bid/UNIT;
  const saleFee=(exitQuote*10n+9999n)/10000n;
  const proceeds=exitQuote>saleFee?exitQuote-saleFee:0n;
  const possibleAtBook=proceeds>=notional?"0":exactFmt(notional-proceeds);
  const budgetCoversMinimum=gross>=minimum;
  const canResellAtSize=sellable>=minimum;
  // Base-fee conservative illustration: sufficient whole lots to leave
  // minSz sellable if fees happen to be debited in CT at a 0.10% rate.
  const minSellable=ceiling(minimum,lot);
  // ceilDivide is NOT the same as ceiling(): the latter rounds to a
  // quantity multiple. Never multiply a fee by 10 accidentally.
  const ceilDivide=(a,b)=>(a+b-1n)/b;
  let minimumGrossWithBaseFee=ceiling(
    ceilDivide(minSellable*10000n,9990n),lot);
  while(minimumGrossWithBaseFee-
      ceilDivide(minimumGrossWithBaseFee*10n,10000n)<minSellable)
    minimumGrossWithBaseFee+=lot;
  const minimumGrossCost=minimumGrossWithBaseFee*ask/UNIT;
  // Price to cover exact hypothetically BASE buy fee + QUOTE sell fee.
  const theoreticalBreakEven=sellable>0n?
    ceiling(((notional*10000n*UNIT)/(sellable*9990n)),tick):null;
  const limits=[
    ...(budgetCoversMinimum?[]:["Budget d'étude sous le minimum natif de quantité : "+
      exactFmt(minimum)+" "+asset+" (environ "+exactFmt(minBuyQuote)+" "+quote+
      " au carnet "+(localBook?"local récent":"archivé")+")."]),
    ...(canResellAtSize?[]:["Quantité nette après frais BASE et arrondi au lot "+
      "insuffisante pour une revente au minimum natif."]),
    ...(gross<=askQty&&sellable<=bidQty?[]:["Profondeur au meilleur niveau insuffisante "+
      "pour le scénario complet (aucune exécution présumée)."]),
    "Solde du compte Trading et devise réellement disponibles non vérifiés.",
    "Frais réels de ce compte et de cette paire non vérifiés.",
    "Minimum de valeur/notionnel et autres filtres d'ordre à confirmer par OKX.",
    ...(age>2?["Carnet public différé de "+age+" min : aucun prix actuel certifié."]:
       ["Même récent, un carnet public n'est pas une garantie d'exécution."])
  ];
  return ticketBlocked("PRÉPARATION UNIQUEMENT · validation nécessaire avant tout ordre.",{
   status:"PREPARATION_NON_EXECUTABLE",pair,quote,base:asset,
   source_book_at_utc:book.source_at_utc,book_age_minutes:age,
   source_book_kind:localBook?(pair==="CT-USDC"?
    "LOCAL_BACKEND_OKX_CT_USDC":"LOCAL_BACKEND_OKX_SPOT"):"DATED_PUBLIC_HOURLY_ARCHIVE",
   native_rules_observed_at_utc:freshRules?freshRules.at:last.observed_at_utc,
   native_rules_kind:freshRules?(pair==="CT-USDC"?
    "OKX_PUBLIC_INSTRUMENTS_CT_USDC":"OKX_PUBLIC_SPOT_INSTRUMENT"):"DATED_PUBLIC_HOURLY_ARCHIVE",
   native_rules_verified:!!freshRules,
   fee_debit_currency_verified:false,
   minimum_gross_buy_to_resell_with_assumed_base_fee:exactFmt(minimumGrossWithBaseFee),
   minimum_gross_buy_cost_at_ask_with_assumed_base_fee:exactFmt(minimumGrossCost),
   study_budget_quote:exactFmt(budget),best_ask_quote:exactFmt(ask),
   best_bid_quote:exactFmt(bid),native_min_quantity:exactFmt(minimum),
   native_lot:exactFmt(lot),native_tick:exactFmt(tick),
   minimum_buy_at_recorded_ask_quote:exactFmt(minBuyQuote),
   gross_buy_quantity:exactFmt(gross),estimated_base_fee:exactFmt(feeBase),
   net_base_quantity:exactFmt(net),sellable_lot_quantity:exactFmt(sellable),
   unsellable_dust:exactFmt(net-sellable),
   hypothetical_buy_cost_quote:exactFmt(notional),
   hypothetical_immediate_exit_quote:exactFmt(proceeds),
   hypothetical_immediate_loss_quote:possibleAtBook,
   hypothetical_break_even_bid_quote:theoreticalBreakEven===null?null:exactFmt(theoreticalBreakEven),
   buy_quantity_minimum_met:budgetCoversMinimum,
   net_exit_quantity_minimum_met:canResellAtSize,
   assumptions:"Frais achat BASE 0,1 % ; frais vente QUOTE 0,1 % · hypothétiques.",
   blockers:limits,notional_filter_verified:false,
   can_place_limit_order:false,can_sell_net_quantity_certified:false
  });
 }catch(_){
  return ticketBlocked("Précision de l'instrument, horodatage ou montant non exploitable.");
 }
}

/* Account constraints are distinct from a public quote. This pure check
   compares the PAPER amount with a fresh CT-USDC read-only proof. It does
   not turn a market snapshot or historical price into an executable order. */
function checkSpotOrderGates(ticket,context,now=Date.now()){
 const unknown=reason=>Object.freeze({verified:false,reason,
  proposed_within_max_buy:false,account_max_buy_base:null,
  capped_buy_quantity:null,reference_price_within_buy_limit:false,
  book_fresh:false,rules_match:false,orders_enabled:false});
 if(ticket?.pair!=="CT-USDC"||ticket?.orders_enabled!==false||
    context?.instId!=="CT-USDC"||context?.read_only!==true||
    context?.orders_enabled!==false||context?.real_orders!==0)
   return unknown("Preuve Spot privée ou instrument exact absent.");
 const stamp=Date.parse(context.order_gates_at_utc||"");
 if(context.order_gates_verified!==true||!Number.isFinite(now)||
    !Number.isFinite(stamp)||stamp>now+30000||now-stamp>120000)
   return unknown("Limites du compte non prouvées ou périmées.");
 const gates=context.order_gates;
 if(!gates?.account_eligible||gates?.account_max_verified!==true||
    gates?.public_rules_verified!==true||gates?.price_limits_verified!==true||
    gates?.orders_enabled!==false)
   return unknown("Éligibilité ou règles de prix non vérifiées.");
 try{
   const gross=exact(ticket.gross_buy_quantity),cap=exact(gates.maxBuy),
     min=exact(gates.minSz),lot=exact(gates.lotSz),
     tick=exact(gates.tickSz),buyPriceLimit=exact(gates.buyLmt),
     ask=exact(ticket.best_ask_quote);
   if(!gross||!cap||!min||!lot||!tick||!buyPriceLimit||!ask)
     return unknown("Quantité, prix ou plafond inutilisable.");
   const rulesMatch=gates.minSz===ticket.native_min_quantity||
     (exact(ticket.native_min_quantity)===min);
   const allRulesMatch=rulesMatch&&
     exact(ticket.native_lot)===lot&&exact(ticket.native_tick)===tick;
   const capLots=(cap/lot)*lot;
   const sourceAt=Date.parse(ticket.source_book_at_utc||"");
   const bookFresh=Number.isFinite(sourceAt)&&
      sourceAt<=now+CT_BOOK_CLOCK_LEEWAY_MS&&
      now-sourceAt<=20000&&ticket.source_book_kind==="LOCAL_BACKEND_OKX_CT_USDC";
   const priceInLimit=ask<=buyPriceLimit&&ask%tick===0n;
   const qtyWithin=gross<=cap&&gross<=capLots;
   return Object.freeze({verified:true,reason:null,
      proposed_within_max_buy:qtyWithin,
      account_max_buy_base:exactFmt(cap),
      capped_buy_quantity:exactFmt(capLots),
      reference_price_within_buy_limit:priceInLimit,
      book_fresh:bookFresh,rules_match:allRulesMatch,
      orders_enabled:false});
 }catch(_){return unknown("Comparaison décimale des limites impossible.");}
}
/* Combine an already-blocked PUBLIC ticket with a tiny private READ-ONLY
   snapshot from the existing OKX account owner. Even a verified balance never
   authorizes a trade, converts Funding to Trading or asserts maker execution. */
function reviewSpotTicketAccount(ticket,context,now=Date.now()){
 const blocked=(reason,extra={})=>Object.freeze({status:"COMPTE_NON_VERIFIE",
   reason,account_at_utc:null,account_quote:null,available_trading_quote:null,
   available_funding_quote:null,fee_maker_pct:null,fee_taker_pct:null,
   funds_cover_public_scenario:false,account_verified:false,fees_verified:false,
   orders_enabled:false,real_orders:0,can_place_limit_order:false,...extra});
 if(ticket?.schema!==TICKET||ticket.orders_enabled!==false||
    ticket.real_orders!==0||ticket.executable!==false||
    !Number.isFinite(now)||typeof ticket.pair!=="string")
   return blocked("Ticket public invalide.");
 if(context?.read_only!==true||context.orders_enabled!==false||
    context.real_orders!==0||context.instId!==ticket.pair)
   return blocked("Compte privé absent ou autre paire : aucune donnée empruntée.");
 const at=Date.parse(context.account_at_utc);
 if(!context.account_fresh||!Number.isFinite(at)||at>now+30000||
    now-at>120000)
   return blocked("Lecture OKX du compte Trading trop ancienne.");
 const quote=ticket.quote;
 if(ticket.pair!==ticket.base+"-"+quote||!["USDC","USDT","EUR"].includes(quote))
   return blocked("Devise ou paire incohérente.");
 const raw=context.trading_available_quote;
 let available=null,funding=null;
 try{if(raw!==null&&raw!==undefined)available=exact(raw);
     if(context.funding_available_quote!==null&&context.funding_available_quote!==undefined)
       funding=exact(context.funding_available_quote);}
 catch(_){return blocked("Solde privé numérique invalide.");}
 const feeGood=context.fee_pair_verified===true&&
   context.fee_maker_rate!==null&&context.fee_taker_rate!==null;
 let maker=null,taker=null;
 try{
   if(feeGood){maker=exact(context.fee_maker_rate);
     taker=exact(context.fee_taker_rate);
     if(maker>2n*UNIT/100n||taker>2n*UNIT/100n)throw Error("Fee invalid");}
 }catch(_){return blocked("Frais OKX de cette paire non vérifiables.");}
 const accountVerified=context.verified===true&&available!==null;
 const modeAt=Date.parse(context.fee_type_at_utc||"");
 const modeVerified=ticket.pair==="CT-USDC"&&
   context.fee_type_verified===true&&
   (context.fee_type==="0"||context.fee_type==="1")&&
   context.fee_currency_for_spot_buy_ct_usdc===(context.fee_type==="0"?"CT":"USDC")&&
   Number.isFinite(modeAt)&&modeAt<=now+30000&&now-modeAt<=120000;
 const mode=modeVerified?context.fee_type:null;
 const hypotCost=ticket.hypothetical_buy_cost_quote?
   exact(ticket.hypothetical_buy_cost_quote):null;
 // In quote-fee mode, the public BASE-fee calculation is NOT an all-in
 // budget. Quote fee is additional, and must be counted before claiming
 // the original gross-buy quantity is affordable.
 const conservativeRate=feeGood?(maker>taker?maker:taker):exact("0.001");
 const costWithFee=mode==="1"&&hypotCost!==null?
   hypotCost+(hypotCost*conservativeRate+UNIT-1n)/UNIT:hypotCost;
 const enough=accountVerified&&costWithFee!==null&&available>=costWithFee;
 const gatesCheck=checkSpotOrderGates(ticket,context,now);
 const capExcess=gatesCheck.verified&&
   !gatesCheck.proposed_within_max_buy;
 const reasons=[
  ...(!accountVerified?["Solde disponible dans Trading non prouvé."]:[]),
  ...(accountVerified&&!enough?["Solde Trading insuffisant pour le scénario public."]:[]),
  ...(!feeGood?["Frais maker/taker propres à la paire non certifiés."]:[]),
  ...(capExcess?["Quantité PAPER supérieure au maximum d'achat CT renvoyé par OKX."]:[]),
  ...(gatesCheck.verified&&!gatesCheck.rules_match?
    ["Règles du carnet daté différentes de la lecture du compte."]:[]),
  ...(gatesCheck.verified&&!gatesCheck.book_fresh?
    ["Carnet non récent au moment du contrôle : aucune cotation actuelle."]:[]),
  "Les frais réels de l'actif de débit et les frais nets de revente restent à appliquer.",
  ticket.source_book_kind==="LOCAL_BACKEND_OKX_CT_USDC"?
   "Carnet public local récent : aucune garantie de prix ni d'exécution.":
   "Prix du carnet archivé : aucune cotation négociable actuelle garantie.",
  "Minimum notionnel OKX, solde après réservations et confirmation humaine restent à vérifier.",
 ];
 return Object.freeze({status:!accountVerified?"COMPTE_NON_VERIFIE":
      !enough?"TRADING_INSUFFISANT":
      capExcess?"DEPASSE_PLAFOND_ACHAT":"SOLDE_SUFFISANT_POUR_ETUDE",
   reason:reasons.join(" "),
   account_at_utc:context.account_at_utc,account_quote:quote,
   available_trading_quote:available===null?null:exactFmt(available),
   available_funding_quote:funding===null?null:exactFmt(funding),
   fee_maker_pct:feeGood?exactFmt(maker*100n):null,
   fee_taker_pct:feeGood?exactFmt(taker*100n):null,
   funds_cover_public_scenario:Boolean(enough),
   spot_gates:gatesCheck,scenario_within_account_max_buy:
     gatesCheck.verified&&gatesCheck.proposed_within_max_buy,
   account_verified:accountVerified,fees_verified:Boolean(feeGood),
   fee_mode_verified:modeVerified,fee_type:mode,
   fee_buy_currency:mode==="1"?"USDC":mode==="0"?"CT":null,
   original_gross_cost_including_quote_fee:costWithFee===null?null:exactFmt(costWithFee),
   orders_enabled:false,real_orders:0,can_place_limit_order:false,
   has_submit_action:false});
}


/* Pure, non-executable exit PREVIEW. The real feeType affects whether
   the buy fee reduces CT or increases USDC consumed. A verified quote-fee
   mode first RE-SIZES the hypothetical buy to fit the same PAPER budget.
   Fee amounts and exchange rounding remain estimates, never real fills. */
function previewSpotExit({ticket,context,targetPriceQuote,now=Date.now()}={}){
 const no=reason=>Object.freeze({status:"SORTIE_NON_EVALUABLE",reason,
   orders_enabled:false,real_orders:0,can_place_limit_order:false});
 if(ticket?.schema!==TICKET||ticket.status!=="PREPARATION_NON_EXECUTABLE"||
    ticket.orders_enabled!==false||ticket.real_orders!==0||ticket.executable!==false)
   return no("Carnet et règles exacts de la paire non vérifiés.");
 try{
  const target=exact(targetPriceQuote),tick=exact(ticket.native_tick),
        lot=exact(ticket.native_lot),minimum=exact(ticket.native_min_quantity),
        initialGross=exact(ticket.gross_buy_quantity),
        ask=exact(ticket.best_ask_quote),budget=exact(ticket.study_budget_quote);
  if(!target||!tick||target%tick||!lot||!minimum||!initialGross||!ask||!budget)
    return no("Prix de revente incompatible avec le pas autorisé par OKX.");
  const account=reviewSpotTicketAccount(ticket,context,now);
  const feesVerified=account.fees_verified===true&&account.account_verified===true;
  const maker=feesVerified?exact(context.fee_maker_rate):exact("0.001");
  const taker=feesVerified?exact(context.fee_taker_rate):exact("0.001");
  const feeRate=maker>taker?maker:taker;
  const mode=account.fee_mode_verified===true?account.fee_type:null;
  let gross=initialGross,feeBase=0n,feeQuoteBuy=0n,cost=0n;
  if(mode==="1"){
    // floor(budget / (ask * (1 + feeRate))) to the instrument lot.
    // Integer arithmetic only; verify after rounding fees upward.
    const possible=(budget*UNIT*UNIT)/(ask*(UNIT+feeRate));
    gross=(possible/lot)*lot;
    if(gross>initialGross)gross=initialGross;
    const calc=()=>{const notion=gross*ask/UNIT;
      feeQuoteBuy=(notion*feeRate+UNIT-1n)/UNIT;cost=notion+feeQuoteBuy;};
    calc();
    while(gross>0n&&cost>budget){gross-=lot;calc();}
  }else{
    feeBase=(gross*feeRate+UNIT-1n)/UNIT;
    cost=gross*ask/UNIT;
  }
  // R25's maxBuy is a point-in-time base-CT cap. This clamps the
  // PAPER preview only; it is not a guaranteed maximum at the archived ask.
  const gateCheck=checkSpotOrderGates(ticket,context,now);
  const initialProposed=initialGross;
  if(gateCheck.verified&&gateCheck.rules_match){
    const availableLots=exact(gateCheck.capped_buy_quantity);
    if(gross>availableLots){
      gross=availableLots;
      if(mode==="1"){
        const notion=gross*ask/UNIT;
        feeQuoteBuy=(notion*feeRate+UNIT-1n)/UNIT;
        cost=notion+feeQuoteBuy;
        while(gross>0n&&cost>budget){
          gross-=lot;
          const nextNotion=gross*ask/UNIT;
          feeQuoteBuy=(nextNotion*feeRate+UNIT-1n)/UNIT;
          cost=nextNotion+feeQuoteBuy;
        }
      }else{
        feeBase=(gross*feeRate+UNIT-1n)/UNIT;
        cost=gross*ask/UNIT;
      }
    }
  }
  if(!gross)return no("Budget PAPER insuffisant avec frais d'achat.");
  if(feeBase>=gross)return no("Frais supérieurs à la quantité achetée.");
  const net=gross-feeBase,sellable=net/lot*lot,dust=net-sellable;
  const saleGross=sellable*target/UNIT;
  const saleFee=(saleGross*feeRate+UNIT-1n)/UNIT;
  const proceeds=saleGross>saleFee?saleGross-saleFee:0n;
  const profit=proceeds-cost;
  let fundsCover=false;
  if(account.account_verified&&account.available_trading_quote!==null){
    fundsCover=exact(account.available_trading_quote)>=cost;
  }
  return Object.freeze({status:sellable>=minimum?"ETUDE_SORTIE":"REVENTE_MINIMUM_IMPOSSIBLE",
   pair:ticket.pair,quote:ticket.quote,base:ticket.base,
   target_sell_price_quote:exactFmt(target),
   buy_quantity:exactFmt(gross),estimated_buy_fee_base:exactFmt(feeBase),
   estimated_buy_fee_quote:exactFmt(feeQuoteBuy),
   buy_fee_currency:mode==="1"?"USDC":"CT",
   buy_fee_currency_verified:mode!==null,
   quote_fee_budget_adjusted:mode==="1",
   paper_budget_quote:exactFmt(budget),
   limit_proof_verified:gateCheck.verified,
   order_gates_adjusted:gateCheck.verified&&gateCheck.rules_match&&gross<initialProposed,
   account_max_buy_base:gateCheck.account_max_buy_base,
   original_paper_buy_quantity:exactFmt(initialProposed),
   book_fresh_for_execution:gateCheck.book_fresh,
   total_buy_cost_quote:exactFmt(cost),
   paper_budget_covers_total_cost:cost<=budget,
   estimated_net_base:exactFmt(net),
   maximum_sellable_base:exactFmt(sellable),residual_dust_base:exactFmt(dust),
   full_exit_without_dust:dust===0n,
   meets_native_exit_minimum:sellable>=minimum,
   hypothetical_sale_gross_quote:exactFmt(saleGross),
   hypothetical_sale_fee_quote:exactFmt(saleFee),
   hypothetical_sale_net_quote:exactFmt(proceeds),
   hypothetical_profit_quote:profit<0n?"-"+exactFmt(-profit):exactFmt(profit),
   assumed_fee_pct:exactFmt(feeRate*100n),fees_verified:feesVerified,
   fee_status:feesVerified?"MAKER_TAKER_EXACT_PAIR_READ_ONLY":"HYPOTHESE_0_10_PCT",
   trading_balance_verified:account.account_verified,
   funds_cover_public_scenario:fundsCover,
   book_age_minutes:ticket.book_age_minutes,
   no_guaranteed_fill:true,lot_rounding_may_differ:true,
   other_order_filters_unverified:true,
   orders_enabled:false,real_orders:0,can_place_limit_order:false});
 }catch(_){return no("Quantité, prix, frais ou règle Spot non exploitable.");}
}
/* In-memory Spot LIMIT simulation. It consumes only the already checked
   PAPER snapshot, never an exchange order id or an OKX private credential.
   Its states resemble an order's life, but every transition is invented by a
   deliberate user click. There is no network, retry, queue, or persistence. */
const PAPER_CYCLE="erith.trader.paper-limit-cycle.v1";
const PAPER_TERMINAL=new Set(["PAPER_FILLED","PAPER_REJECTED","PAPER_CANCELLED"]);
/* The snapshot was qualified during the user's preceding PAPER check.
   A simulation can start later, but must not pretend an old quote is live.
   No exchange order can ever be sent by this code. */
function startPaperLimitCycle({ticket,context,preview,qualifiedAt,now=Date.now(),nonce}={}){
 const fail=reason=>Object.freeze({ok:false,reason,
  orders_enabled:false,real_orders:0,network:false});
 if(ticket?.schema!==TICKET||ticket?.pair!=="CT-USDC"||
    ticket?.status!=="PREPARATION_NON_EXECUTABLE"||
    ticket?.source_book_kind!=="LOCAL_BACKEND_OKX_CT_USDC"||
    ticket?.orders_enabled!==false||ticket?.real_orders!==0||
    context?.read_only!==true||context?.orders_enabled!==false||
    context?.real_orders!==0||context?.instId!=="CT-USDC"||
    context?.fee_type_verified!==true||!["0","1"].includes(context.fee_type)||
    context?.order_gates_verified!==true||
    preview?.status!=="ETUDE_SORTIE"||preview?.orders_enabled!==false||
    preview?.real_orders!==0||preview?.limit_proof_verified!==true||
    preview?.book_fresh_for_execution!==true||
    preview?.meets_native_exit_minimum!==true||
    preview?.paper_budget_covers_total_cost!==true||
    !Number.isSafeInteger(nonce)||nonce<1||!Number.isFinite(now))
   return fail("Étude PAPER CT/USDC non qualifiée : refaire Vérifier ce scénario.");
 const qualified=typeof qualifiedAt==="number"?qualifiedAt:Date.parse(qualifiedAt||"");
 if(!Number.isFinite(qualified)||qualified>now||now-qualified>15*60*1000)
   return fail("Photographie du ticket trop ancienne (15 minutes) : revérifier avant la simulation.");
 try{
  const at=Date.parse(ticket.source_book_at_utc);
  const proof=Date.parse(context.order_gates_at_utc);
  const price=exact(ticket.best_ask_quote),qty=exact(preview.buy_quantity);
  const lot=exact(ticket.native_lot),min=exact(ticket.native_min_quantity);
  const tick=exact(ticket.native_tick),cap=exact(context.order_gates?.maxBuy);
  const fee=exact(context.fee_taker_rate);
  if(!Number.isFinite(at)||at>qualified+CT_BOOK_CLOCK_LEEWAY_MS||
     qualified-at>20000)
   return fail("Carnet non récent à l'instant de validation du ticket.");
  if(!Number.isFinite(proof)||proof>qualified+30000||qualified-proof>120000)
   return fail("Contrôles du compte périmés lors de l'étude : relancer Vérifier.");
  if(!price||!tick||price%tick!==0n)
   return fail("Prix fictif non conforme au tickSz de CT/USDC.");
  if(!qty||!lot||!min||qty<min||qty%lot!==0n)
   return fail("Quantité fictive inférieure au minimum ou non multiple de lotSz.");
  if(!cap||qty>cap)
   return fail("Quantité fictive supérieure à maxBuy du compte lors de l'étude.");
  if(fee<0n||fee>=UNIT)
   return fail("Taux de frais de la paire non vérifiable.");
  const snapshot=Object.freeze({
   schema:PAPER_CYCLE,ok:true,paper:true,
   phase:"PAPER_DRAFT",id:"PAPER-CT-"+now+"-"+nonce,
   pair:"CT-USDC",side:"buy",type:"limit",
   price:exactFmt(price),quantity:exactFmt(qty),
   min_size:exactFmt(min),lot_size:exactFmt(lot),
   fee_rate:exactFmt(fee),fee_type:context.fee_type,
   filled:"0.0",remaining:exactFmt(qty),
   net_received:"0.0",sellable:"0.0",dust:"0.0",
   below_min_sell:true,unknown:false,send_attempts:0,
   studied_at:new Date(qualified).toISOString(),
   snapshot_age_seconds:Math.floor((now-qualified)/1000),
   snapshot_only:true,not_a_live_quote:true,
   created_at:new Date(now).toISOString(),updated_at:new Date(now).toISOString(),
   events:Object.freeze([{type:"PAPER_PREPARE",at:new Date(now).toISOString()}]),
   real_orders:0,orders_enabled:false,trade_endpoint:null,
   network:false,storage:false});
  return snapshot;
 }catch(_){return fail("Décimales ou règles CT/USDC incompatibles avec cette étude.");}
}
function advancePaperLimitCycle(state,action,now=Date.now()){
 if(state?.schema!==PAPER_CYCLE||state?.paper!==true||
    state?.orders_enabled!==false||state?.real_orders!==0||
    state?.network!==false||state?.send_attempts!==0||
    !Number.isFinite(now)||!action||typeof action.type!=="string")
   throw Error("Simulation PAPER absente, altérée ou action invalide.");
 const phase=state.phase,type=action.type;
 const permitted={
  PAPER_DRAFT:["PAPER_CONFIRM"],
  PAPER_SUBMITTED:["PAPER_ACCEPT","PAPER_REJECT","PAPER_UNKNOWN"],
  PAPER_ACCEPTED:["PAPER_FILL_PART","PAPER_FILL_REST","PAPER_CANCEL","PAPER_UNKNOWN"],
  PAPER_PARTIAL:["PAPER_FILL_PART","PAPER_FILL_REST","PAPER_CANCEL","PAPER_UNKNOWN"],
  PAPER_UNKNOWN:["PAPER_RECONCILE_OPEN","PAPER_RECONCILE_REJECT","PAPER_RECONCILE_CANCEL"]
 };
 if(!permitted[phase]?.includes(type))
   throw Error("Transition interdite ; aucun renvoi automatique.");
 // A PAPER-only button click is sufficient: no real funds and no API.
 // Preserve explicit confirmation metadata, but no arbitrary two-minute timer.
 if(type==="PAPER_CONFIRM"&&
    (action.confirmation!=="SIMULER"||now<Date.parse(state.created_at)))
   throw Error("Confirmation explicite de la simulation requise.");
 if(type==="PAPER_RECONCILE_REJECT"&&exact(state.filled)>0n)
   throw Error("Un ordre partiellement rempli ne peut être réconcilié en rejet intégral.");
 let next=phase,filled=exact(state.filled),quantity=exact(state.quantity);
 if(type==="PAPER_CONFIRM")next="PAPER_SUBMITTED";
 if(type==="PAPER_ACCEPT")next="PAPER_ACCEPTED";
 if(type==="PAPER_REJECT"||type==="PAPER_RECONCILE_REJECT")next="PAPER_REJECTED";
 if(type==="PAPER_UNKNOWN")next="PAPER_UNKNOWN";
 if(type==="PAPER_CANCEL"||type==="PAPER_RECONCILE_CANCEL")next="PAPER_CANCELLED";
 if(type==="PAPER_RECONCILE_OPEN")next=filled>0n?"PAPER_PARTIAL":"PAPER_ACCEPTED";
 if(type==="PAPER_FILL_PART"||type==="PAPER_FILL_REST"){
   const remaining=quantity-filled;
   let add=remaining;
   if(type==="PAPER_FILL_PART"){
     add=exact(String(action.quantity_ct||""));
     if(add<=0n||add>=remaining)throw Error("Partiel : quantité strictement entre zéro et le restant.");
     if(add%exact(state.lot_size)!==0n)
       throw Error("Le remplissage PAPER doit respecter le pas de quantité.");
   }
   if(remaining<=0n)throw Error("Ordre fictif déjà intégralement rempli.");
   filled+=add;
   next=filled===quantity?"PAPER_FILLED":"PAPER_PARTIAL";
 }
 const feeBase=state.fee_type==="0"?(filled*exact(state.fee_rate)+UNIT-1n)/UNIT:0n;
 const net=filled-feeBase,lot=exact(state.lot_size),sellable=net/lot*lot,
   min=exact(state.min_size);
 const events=Object.freeze([...state.events,
   Object.freeze({type,at:new Date(now).toISOString()})].slice(-24));
 return Object.freeze({...state,phase:next,filled:exactFmt(filled),
  remaining:exactFmt(quantity-filled),net_received:exactFmt(net),
  sellable:exactFmt(sellable),dust:exactFmt(net-sellable),
  below_min_sell:sellable<min,unknown:next==="PAPER_UNKNOWN",
  updated_at:new Date(now).toISOString(),events,
  send_attempts:0,orders_enabled:false,real_orders:0,
  network:false,storage:false});
}
return Object.freeze({SCHEMA,assess,cohortContext,validSignal,summarizeHistorical,qualifyHistoricalAsOf,qualifyPaperSpotSelection,prepareSpotTicket,verifiedSpotLiveBook,diagnoseSpotLiveBook,verifiedSpotRules,
  verifiedCtLiveBook,diagnoseCtLiveBook,verifiedCtSpotRules,checkSpotOrderGates,reviewSpotTicketAccount,previewSpotExit,startPaperLimitCycle,advancePaperLimitCycle,PAPER_CYCLE,realOrders:false,network:false,storage:false});
});