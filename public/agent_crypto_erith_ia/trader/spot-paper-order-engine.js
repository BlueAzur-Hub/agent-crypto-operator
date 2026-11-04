/* ERITH.IA Trader · Spot PAPER LIMIT engine · NO LIVE TRADING, I/O OR BRIDGE.
   Simulated fills assume ONLY best-level public size; cannot prove execution. */
(function(root,factory){"use strict";const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.AgentCryptoSpotPaperOrders=api})(typeof globalThis!=="undefined"?globalThis:null,()=>{
"use strict";
const SCHEMA="erith.trader.spot-paper-orders.v1",S=100000000n,AGE=120000;
const pairs=Object.freeze({QUSDT:{base:"Q",venue:"Bitget"},ICNTUSDT:{base:"ICNT",venue:"Bitget"},"FLUID-USDT":{base:"FLUID",venue:"OKX"},SANDUSDT:{base:"SAND",venue:"Binance"}});
const fail=m=>{throw Error(m)};
function d(v){const s=String(v??"");if(!/^\d{1,10}(?:\.\d{1,8})?$/.test(s))fail("Décimal exact invalide");const [a,b=""]=s.split(".");return BigInt(a)*S+BigInt(b.padEnd(8,"0"));}
function fmt(v){if(v<0n)fail("Montant négatif");return (v/S)+"."+(v%S).toString().padStart(8,"0").replace(/0+$/,"").padEnd(1,"0")}
// All amounts use atomic units (8 decimals); round base-currency fees UP,
 // then round the net position DOWN to an exchange lot. No float equality.
function feeBase(qty,bps){return (qty*BigInt(bps)+9999n)/10000n}
function exitCheck({grossQuantity,priceUSDT,minQuantity,lotStep,minNotionalUSDT,feeBps,feeCurrency}){
 const qty=d(grossQuantity),price=d(priceUSDT),min=d(minQuantity),
       lot=d(lotStep),minimum=d(minNotionalUSDT);
 if(!qty||!price||!min||!lot||!minimum||!Number.isInteger(feeBps)||
    feeBps<0||feeBps>1000||!["BASE","QUOTE"].includes(feeCurrency))
    fail("Règles de sortie ou devise des frais non vérifiées");
 const fee=feeCurrency==="BASE"?feeBase(qty,feeBps):0n;
 const net=qty-fee;
 const sellable=net/lot*lot;
 const roundDust=net-sellable;
 const sufficient=sellable>=min&&sellable*price/S>=minimum;
 return frozen({ok:sufficient,reason:sufficient?"SIMULATED_EXIT_SIZE_MATCHES":"NET_QUANTITY_BELOW_EXIT_MINIMUM",
   grossQuantity:fmt(qty),buyFeeCurrency:feeCurrency,buyFeeBase:fmt(fee),
   netQuantity:fmt(net),lotSellableQuantity:fmt(sellable),
   unsellableRemainder:fmt(roundDust),minQuantity:fmt(min),lotStep:fmt(lot),
   minNotionalUSDT:fmt(minimum),priceReferenceUSDT:fmt(price),
   marketRulesVerified:false,liquidityVerified:false,orders_enabled:false});
}
function stamp(s){if(typeof s!=="string"||!s.endsWith("Z"))fail("UTC obligatoire");const n=Date.parse(s);if(!Number.isFinite(n))fail("Date UTC invalide");return n}
function frozen(x){if(x&&typeof x==="object"&&!Object.isFrozen(x)){Object.values(x).forEach(frozen);Object.freeze(x)}return x}
function create({capitalUSDT,maxOrderBps=2000,takerFeeBps=10,maxSpreadBps=100,slippageBps=20,
 buyFeeCurrency="QUOTE"}={}){
 const cap=d(capitalUSDT);if(cap<=0n||cap>d("1000000")||![maxOrderBps,takerFeeBps,maxSpreadBps,slippageBps].every(Number.isInteger)||
 maxOrderBps<1||maxOrderBps>10000||takerFeeBps<0||takerFeeBps>1000||maxSpreadBps<1||maxSpreadBps>2000||
 slippageBps<0||slippageBps>1000||!["BASE","QUOTE"].includes(buyFeeCurrency))
 fail("Bornes de risque PAPER invalides ou devise de frais absente");
 return frozen({schema:SCHEMA,quote:"USDT",paper:true,orders_enabled:false,
 cashUSDT:fmt(cap),initialUSDT:fmt(cap),holdings:{},pending:null,events:[],halted:false,sequence:0,
 risk:{maxOrderBps,takerFeeBps,maxSpreadBps,slippageBps,buyFeeCurrency}});
}
function check(s){if(s?.schema!==SCHEMA||s?.paper!==true||s?.quote!=="USDT"||s?.orders_enabled!==false)fail("Compte PAPER invalide")}
function update(s,fields,event){return frozen({...s,...fields,events:[...s.events,...(event?[event]:[])]})}
function place(s,o,at){check(s);if(s.halted||s.pending)fail("Bot PAPER bloqué ou ordre déjà en attente");
 const market=pairs[o?.pair];if(!market||o.venue!==market.venue||o.base!==market.base||
 o.quote!=="USDT"||o.instrumentType!=="SPOT")fail("Identité de paire Spot USDT incorrecte");
 if(o.type!=="LIMIT"||!["BUY","SELL"].includes(o.side))fail("Seuls les ordres LIMIT sont simulés");
 const qty=d(o.quantity),price=d(o.priceUSDT),step=d(o.lotStep),tick=d(o.tickSize),min=d(o.minQuantity),minCost=d(o.minNotionalUSDT);
 if(qty<min||qty===0n||price===0n||step===0n||tick===0n||minCost===0n||qty%step||price%tick)fail("Contraintes tick, lot et taille non satisfaites");
 const notion=qty*price/S;if(notion<minCost)fail("Notionnel insuffisant");
 const feeCurrency=o.buyFeeCurrency??s.risk.buyFeeCurrency;
 if(!["BASE","QUOTE"].includes(feeCurrency))fail("Devise frais achat PAPER inconnue");
 const prospectiveExit=o.side==="BUY"?exitCheck({grossQuantity:o.quantity,priceUSDT:o.priceUSDT,
   minQuantity:o.minQuantity,lotStep:o.lotStep,minNotionalUSDT:o.minNotionalUSDT,
   feeBps:s.risk.takerFeeBps,feeCurrency}):null;
 if(prospectiveExit&&!prospectiveExit.ok)
   fail("ACHAT PAPER REFUSÉ : quantité nette sous minimum de revente (frais + lot)");

 if(notion>d(s.initialUSDT)*BigInt(s.risk.maxOrderBps)/10000n)fail("Concentration PAPER dépassée");
 if(o.side==="BUY"&&notion+notion*BigInt(s.risk.slippageBps+
   (feeCurrency==="QUOTE"?s.risk.takerFeeBps:0))/10000n>d(s.cashUSDT))
   fail("Solde PAPER USDT insuffisant");
 if(o.side==="SELL"&&qty>d(s.holdings[o.base]||"0"))fail("Quantité PAPER non détenue");
 const t=stamp(at),pending={id:s.sequence+1,pair:o.pair,base:o.base,venue:o.venue,side:o.side,kind:"LIMIT",
 quantity:fmt(qty),remaining:fmt(qty),priceUSDT:fmt(price),lotStep:fmt(step),
 minQuantity:fmt(min),minNotionalUSDT:fmt(minCost),
 buyFeeCurrency:feeCurrency,projectedExit:prospectiveExit,
 createdAt:at,expiresAt:new Date(t+3600000).toISOString(),contractIdentityCertified:false};
 return update(s,{pending,sequence:pending.id},{type:"PAPER_ACCEPTED",id:pending.id,at});
}
function tick(s,book,nowRaw){check(s);if(!s.pending||s.halted)return s;
 const o=s.pending,now=stamp(nowRaw);
 if(now>=stamp(o.expiresAt))return update(s,{pending:null},{type:"PAPER_EXPIRED",id:o.id,at:nowRaw});
 const when=stamp(book?.atUTC);
 if(when<=stamp(o.createdAt)||when>now||now-when>AGE)fail("Carnet prospectif périmé ou antérieur");
 if(book.pair!==o.pair||book.venue!==o.venue||book.quote!=="USDT"||book.instrumentType!=="SPOT")fail("Carnet d'une autre paire");
 const bid=d(book.bestBidUSDT),ask=d(book.bestAskUSDT),bidQty=d(book.bestBidQty),askQty=d(book.bestAskQty);
 if(!bid||ask<=bid||!bidQty||!askQty)fail("Carnet croisé ou incomplet");
 const spread=Number((ask-bid)*20000n/(ask+bid));
 if(spread>s.risk.maxSpreadBps)fail("Spread au-dessus du plafond PAPER");
 const price=o.side==="BUY"?ask:bid,limit=d(o.priceUSDT);
 if(o.side==="BUY"?price>limit:price<limit)return s;
 const visible=o.side==="BUY"?askQty:bidQty,qty=d(o.remaining),lot=d(o.lotStep);
 const matched=(qty<visible?qty:visible)/lot*lot;if(!matched)return s;
 const notion=matched*price/S,
       buyBaseFee=o.side==="BUY"&&o.buyFeeCurrency==="BASE"
         ?feeBase(matched,s.risk.takerFeeBps):0n,
       fee=o.side==="BUY"&&o.buyFeeCurrency==="BASE"
         ?0n:notion*BigInt(s.risk.takerFeeBps)/10000n,
       slippage=notion*BigInt(s.risk.slippageBps)/10000n;
 const cash=d(s.cashUSDT),holding=d(s.holdings[o.base]||"0");
 if(o.side==="BUY"&&cash<notion+fee+slippage)fail("Fonds PAPER insuffisants à l'exécution");
 if(o.side==="SELL"&&holding<matched)fail("Position PAPER insuffisante");
 const left=qty-matched,afterHolding=o.side==="BUY"
   ?holding+matched-buyBaseFee:holding-matched;
 // A partial or changed bid may leave a lot below exit filters: never label
 // such a PAPER position as directly sellable.
 const lotSellable=afterHolding/lot*lot;
 const exitNotional=lotSellable*bid/S;
 const exitRuleStatus=lotSellable>=d(o.minQuantity)&&
   exitNotional>=d(o.minNotionalUSDT)?"SIZE_FILTER_MATCHES_AT_BOOK_BID":
   "BLOCKED_NET_SIZE_OR_NOTIONAL";
 return update(s,{cashUSDT:fmt(o.side==="BUY"?cash-notion-fee-slippage:cash+notion-fee-slippage),
 holdings:{...s.holdings,[o.base]:fmt(afterHolding)},
 pending:left?{...o,remaining:fmt(left)}:null},{type:left?"PAPER_PARTIAL":"PAPER_FILLED",id:o.id,at:nowRaw,
 quantity:fmt(matched),priceUSDT:fmt(price),feeUSDT:fmt(fee),
 buyFeeBase:fmt(buyBaseFee),buyFeeCurrency:o.buyFeeCurrency,
 lotSellableQuantity:fmt(lotSellable),exitRuleStatus,
 slippageReserveUSDT:fmt(slippage),
 sourceBookAt:book.atUTC,simulated:true});
}
function cancel(s,at){check(s);if(!s.pending)return s;return update(s,{pending:null},{type:"PAPER_CANCEL",id:s.pending.id,at:new Date(stamp(at)).toISOString()})}
function kill(s,at){check(s);const a=cancel(s,at);return update(a,{pending:null,halted:true},{type:"PAPER_KILL_SWITCH",at:new Date(stamp(at)).toISOString()})}

/* Pure, historical public OKX best-level stress estimate.
   Only a same-snapshot exit-cost hurdle; no prediction, fill, account or order. */
function previewOkxSpot(evidence){
 const blocked=reason=>frozen({status:"NOT_EVALUABLE",reason,orders_enabled:false,executable:false});
 try{
  const info=evidence?.okx_spot,book=info?.best_book,rules=info?.rules;
  if(evidence?.identity_status!=="SYMBOL_ONLY_NOT_COIN_ID_PROVEN"||
     info?.venue!=="OKX"||info?.quote!=="USDT"||
     info.pair!==evidence.symbol+"-USDT"||
     info.pair_observed!==true||info.native_rules_verified!==true||
     info.contract_identity_proven!==false||info.real_orders_enabled!==false||
     rules?.source!=="OKX_PUBLIC_SPOT_INSTRUMENT"||
     rules.contract_identity_proven!==false||rules.fees_proven!==false||
     book?.schema!=="erith.radar.okx.spot-best-book.v1"||
     book.source!=="OKX_PUBLIC_SPOT_BOOK"||book.pair!==info.pair||
     book.quote!=="USDT"||book.market_execution_proven!==false||
     book.orders_enabled!==false||book.fees_verified!==false)
    return blocked("PUBLIC_SPOT_EVIDENCE_MISSING");
  const captured=stamp(book.collected_at_utc),market=stamp(book.exchange_time_utc);
  if(market>captured+5000||captured-market>120000||
     captured> Date.now()+300000) return blocked("BOOK_TIMESTAMP_NOT_TRUSTED");
  // This calculation is tied to the archived book time, never "live" now.
  const U=1000000000000000000n;
  function dec(raw){
   const str=String(raw??"");
   if(!/^\d{1,20}(?:\.\d{1,18})?$/.test(str))throw Error("PRECISION_UNSUPPORTED");
   const [a,b=""]=str.split(".");
   return BigInt(a)*U+BigInt(b.padEnd(18,"0"));
  }
  function fmt18(n){
   if(n<0n)throw Error("NEGATIVE");
   return String(n/U)+"."+String(n%U).padStart(18,"0").replace(/0+$/,"").padEnd(1,"0");
  }
  const tick=dec(rules.tick_sz),lot=dec(rules.lot_sz),min=dec(rules.min_sz),
     bid=dec(book.best_bid_usdt),ask=dec(book.best_ask_usdt),
     bidQty=dec(book.best_bid_qty),askQty=dec(book.best_ask_qty);
  if(!tick||!lot||!min||!bid||!ask||!bidQty||!askQty||
     bid>=ask||bid%tick||ask%tick)return blocked("INVALID_SPOT_BOOK_OR_RULES");
  const ticket=100n*U, buyFeeBps=10n,sellFeeBps=10n,slippageBps=20n;
  // Reserve buy-side slippage within the fixed 100 USDT fictive budget.
  const qty=((ticket*U*10000n)/(ask*(10000n+slippageBps)))/lot*lot;
  if(qty<min||!qty)return blocked("GROSS_QUANTITY_BELOW_OKX_MINIMUM");
  if(qty>askQty)return blocked("ASK_BEST_LEVEL_DEPTH_INSUFFICIENT");
  const buyCost=qty*ask/U;
  // Conservative BASE-denominated hypothetical buy fee (rounded up).
  const feeBase=(qty*buyFeeBps+9999n)/10000n;
  const sellQty=((qty-feeBase)/lot)*lot;
  if(sellQty<min||!sellQty)return blocked("NET_QUANTITY_BELOW_OKX_EXIT_MINIMUM");
  if(sellQty>bidQty)return blocked("BID_BEST_LEVEL_DEPTH_INSUFFICIENT");
  const grossSale=sellQty*bid/U;
  const reserveBuy=(buyCost*slippageBps+9999n)/10000n;
  const feeSell=(grossSale*sellFeeBps+9999n)/10000n;
  const reserveSell=(grossSale*slippageBps+9999n)/10000n;
  if(grossSale<=feeSell+reserveSell)return blocked("COSTS_EXCEED_EXIT_NOTIONAL");
  const netSale=grossSale-feeSell-reserveSell;
  const investment=buyCost+reserveBuy;
  if(investment>ticket)return blocked("PAPER_BUDGET_EXCEEDED");
  const pnl=netSale-investment;
  const pct=(Number(pnl)/Number(investment))*100;
  const hurdle=(Number(investment)/Number(netSale)-1)*100;
  return frozen({
   status:"HYPOTHETICAL_IMMEDIATE_ROUNDTRIP_ONLY",
   pair:info.pair,observed_at_utc:book.exchange_time_utc,quote:"USDT",
   ticketBudgetUSDT:"100",feeBuyBaseAssumedBps:Number(buyFeeBps),
   feeSellQuoteAssumedBps:Number(sellFeeBps),
   stressSlippageAssumedBpsPerSide:Number(slippageBps),
   grossBuyQuantity:fmt18(qty),netSellableQuantity:fmt18(sellQty),
   buyCostUSDT:fmt18(buyCost),immediateExitAfterCostsUSDT:fmt18(netSale),
   hypotheticalImmediatePnlUSDT:fmt18(pnl<0n?-pnl:pnl),
   hypotheticalImmediatePnlSign:pnl<0n?"-":pnl>0n?"+":"0",
   hypotheticalImmediatePnlPct:Number(pct.toFixed(4)),
   approximateBidRiseToBreakEvenPct:Number(Math.max(0,hurdle).toFixed(4)),
   futureExitPriceProven:false,bestLevelOnly:true,
   actualFeesVerified:false,contractIdentityProven:false,
   accountAccessVerified:false,marketExecutionProven:false,
   orders_enabled:false,executable:false
  });
 }catch(_){return blocked("PRECISION_OR_PUBLIC_EVIDENCE_INVALID");}
}

/* Read-only bridge: independently audit Radar shadow entries against the
   SAME net-exit-size check used by place(BUY). Never convert this to a fill. */
function auditRadarShadow(ledger,identity,qualification){
 const failAudit=reason=>frozen({status:"NOT_CERTIFIED",reason,orders_enabled:false,executable:false});
 if(ledger?.schema!=="erith.radar.spot-paper-forward-shadow.v1"||
    ledger.orders_enabled!==false||ledger.real_orders!==0||
    ledger.paper_fills!==0||ledger.execution_proven!==false||
    !Array.isArray(ledger.positions)||
    identity?.schema!=="erith.radar.spot-identity-prospective.v1"||
    identity.orders_enabled!==false||identity.real_orders!==0||
    !Array.isArray(identity.candidates)||
    qualification?.schema!=="erith.radar.spot-qualification.v1"||
    qualification.real_orders_enabled!==false||
    !Array.isArray(qualification.candidates))
   return frozen({status:"SOURCE_REJECTED",orders_enabled:false,executable:false,results:[]});
 function assess(p){
  if(p?.status!=="HYPOTHETICAL_NO_FILL"||p.executed_order!==false||
     p.quote!=="USDT"||p.notional_usdt!=="100")
   return failAudit("SHADOW_RECORD_NOT_PROVEN");
  const ids=identity.candidates.filter(x=>x.coin_id===p.coin_id);
  const markets=qualification.candidates.filter(x=>x.id===p.coin_id);
  if(ids.length!==1||markets.length!==1)return failAudit("IDENTITY_OR_MARKET_MISSING");
  const id=ids[0],m=markets[0].market;
  if(id.identity_proven!==true||id.coin_id!==p.coin_id||
     id.venue!==p.venue||id.pair!==p.pair||
     id.quote!==p.quote||id.platform!==p.platform||
     id.contract_address!==p.contract_address||
     id.paper_entry_decision!=="AWAIT_NEXT_DATED_BOOK_AND_COST_CHECK"||
     m?.provider!==p.venue||m.pair!==p.pair||m.quote!=="USDT")
   return failAudit("CONTRACT_VENUE_OR_PAIR_MISMATCH");
  let book=m.book;
  try{
   const entry=stamp(p.entry_quote_at_utc),observed=stamp(book?.observed_at_utc);
   const qualified=stamp(qualification.qualified_at_utc);
   const acquired=stamp(identity.collected_at_utc);
   if(id.spot_exit_rules===null||!id.spot_exit_rules||
      !id.min_order_usdt)return failAudit("NATIVE_EXIT_FILTERS_MISSING");
   if(qualification.qualified_at_utc!==identity.qualification_at_utc||
      identity.source_radar_day_utc!==qualification.source_observation_date_utc||
      observed!==entry||qualified>entry||entry>acquired||
      acquired-qualified>20*60*1000||
      book.exchange_timestamp_verified!==true)
      return failAudit("DATED_BOOK_PROOF_MISMATCH");
   const rules=id.spot_exit_rules;
   if(rules.rules_source!=="Bitget public SPOT instrument"||
      p.venue!=="Bitget")return failAudit("VENUE_RULES_UNSUPPORTED");
   const ask=d(book.best_ask_usdt),bid=d(book.best_bid_usdt),tick=d(rules.tick_size);
   if(!bid||ask<=bid||d(p.entry_ask_usdt)!==ask||!tick||
      bid%tick!==0n||ask%tick!==0n)
      return failAudit("QUOTE_OR_TICK_MISMATCH");
   const quantity=String(p.hypothetical_quantity);
   if(!/^\d{1,15}(?:\.\d{1,18})?$/.test(quantity))
     return failAudit("PAPER_QUANTITY_INVALID");
   const parts=quantity.split("."),gross=d(parts[0]+"."+(parts[1]||"").padEnd(8,"0").slice(0,8));
   const lot=d(rules.lot_step),lotGross=gross/lot*lot;
   if(!lotGross)return failAudit("PAPER_QUANTITY_UNDER_LOT");
   // Extra BASE fee is conservative: the shadow quantity may already include
   // assumed costs. This checks SIZE only, not P&L or an exchange fill.
   const checked=exitCheck({grossQuantity:fmt(lotGross),
      priceUSDT:fmt(bid),minQuantity:rules.min_quantity,
      lotStep:rules.lot_step,minNotionalUSDT:id.min_order_usdt,
      feeBps:10,feeCurrency:"BASE"});
   return frozen({status:checked.ok?"HYPOTHETICAL_SIZE_OK":"NET_EXIT_SIZE_BLOCKED",
     reason:checked.reason,coin_id:p.coin_id,pair:p.pair,venue:p.venue,
     quantityChecked:checked.grossQuantity,netQuantity:checked.netQuantity,
     lotSellableQuantity:checked.lotSellableQuantity,
     minQuantity:checked.minQuantity,minNotionalUSDT:checked.minNotionalUSDT,
     sourceBookAt:p.entry_quote_at_utc,feeAssumption:"BASE 0.1% extra (conservative)",
     marketRulesVerified:false,liquidityVerified:false,
     orders_enabled:false,executable:false});
  }catch(_){return failAudit("PRECISION_OR_PUBLIC_EVIDENCE_INVALID")}
 }
 const results=ledger.positions.map(assess);
 return frozen({status:"READ_ONLY_AUDIT",orders_enabled:false,executable:false,
   results,checked:results.filter(x=>x.status==="HYPOTHETICAL_SIZE_OK").length,
   notCertified:results.filter(x=>x.status!=="HYPOTHETICAL_SIZE_OK").length});
}
return Object.freeze({SCHEMA,pairs,create,exitCheck,auditRadarShadow,previewOkxSpot,place,tick,cancel,kill,
 realOrders:false,tradeEndpoint:null,network:false,bridge:false,storage:false});
});