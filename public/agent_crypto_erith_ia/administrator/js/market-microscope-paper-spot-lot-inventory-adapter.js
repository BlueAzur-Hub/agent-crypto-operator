/* ERITH.IA — browser-only read-only PAPER lot, fee and inventory arithmetic. No order APIs. */
"use strict";
/*
 * Seven Heaven — isolated mathematical PAPER adapter for OKX Spot quantity,
 * minimum-size, fee and BUY->SELL inventory reconciliation.
 * No network, no credentials, no broker interfaces, no side effects.
 * Loaded only for hypothetical PAPER comparison by the Interface and mirrored Trader.
 * Pinned public instrument snapshot: 2026-11-13 01:41 UTC.
 */
const SCALE=1000000000000n, PPM=1000000n;
const AUDIT_ONLY=true;
function fail(code,reason){return {ok:false,code,reason,orders:0,read_only:true};}
function atoms(value,name="decimal"){
  const s=String(value);
  if(!/^(0|[1-9]\d{0,20})(?:\.\d{1,12})?$/.test(s))
    throw new Error("Invalid nonnegative fixed-point "+name+": "+s);
  const [whole,fraction=""]=s.split(".");
  return BigInt(whole)*SCALE+BigInt(fraction.padEnd(12,"0"));
}
function str(a){
  const negative=a<0n;let z=negative?-a:a;
  const dec=(z%SCALE).toString().padStart(12,"0").replace(/0+$/,"");
  return (negative?"-":"")+(z/SCALE).toString()+(dec?"."+dec:"");
}
function divUp(a,b){if(b<=0n||a<0n)throw Error("Invalid ceil divide");return(a+b-1n)/b;}
function min(a,b){return a<b?a:b;}
function positive(v,name){const x=atoms(v,name);if(x<=0n)throw Error(name+" must be positive");return x;}
function rates(feePpm=1000,slipPpm=500){
  const f=BigInt(feePpm),s=BigInt(slipPpm);
  if(f<0n||f>20000n||s<0n||s>20000n)throw Error("fee/slippage PPM outside 0..20000");
  return {fee:f,slip:s};
}
function instrument(spec){
  if(!spec||spec.instType!=="SPOT"||spec.state!=="live"||!/^([A-Z0-9]+)-USDC$/.test(String(spec.instId||"")))
    throw Error("Invalid or unavailable Spot USDC instrument");
  const minSz=positive(spec.minSz,"minSz"),lotSz=positive(spec.lotSz,"lotSz"),tickSz=positive(spec.tickSz,"tickSz");
  if(minSz<lotSz||SCALE%lotSz!==0n||SCALE%tickSz!==0n)throw Error("Unusable instrument precision");
  return {id:spec.instId,minSz,lotSz,tickSz};
}
function baseResult(contract,qty,amounts={}){
  return {ok:true,code:"KNOWN_PUBLIC_CONSTRAINTS_ONLY",orders:0,read_only:true,
    instrument:contract.id,quantity_base:str(qty),
    public_min_size_checked:true,public_lot_step_checked:true,
    account_trading_permission_checked:false,other_quote_minimum_checked:false,
    fee_currency_hypothesis:"USDC",...amounts};
}
function roundLotDown(qty,lot){return qty/lot*lot;}
function costBuy(qty,price,fee){
  const gross=divUp(qty*price,SCALE),feeQuote=divUp(gross*fee,PPM);
  return {gross,feeQuote,total:gross+feeQuote};
}
function costSell(qty,price,fee){
  const gross=qty*price/SCALE,feeQuote=divUp(gross*fee,PPM);
  return {gross,feeQuote,net:gross-feeQuote};
}
function affordableQuantity(budget,lot,maxLotCount,costFn){
  let l=0n,h=maxLotCount;
  while(l<h){
    const mid=(l+h+1n)/2n;
    if(costFn(mid*lot).total<=budget)l=mid;else h=mid-1n;
  }
  return l*lot;
}
function referenceBuy({spec,budget,referencePrice,feePpm=1000,slipPpm=500}){
  const ins=instrument(spec),cash=positive(budget,"budget"),price=positive(referencePrice,"reference price");
  const {fee,slip}=rates(feePpm,slipPpm);
  const fill=divUp(price*(PPM+slip),PPM);
  const maxLots=cash*SCALE/(fill*ins.lotSz);
  const qty=affordableQuantity(cash,ins.lotSz,maxLots,q=>costBuy(q,fill,fee));
  if(qty<ins.minSz)return fail("MIN_SIZE_AFTER_LOT","Budget does not produce public minSz");
  const c=costBuy(qty,fill,fee);
  return baseResult(ins,qty,{budget_usdc:str(cash),reference_price:str(price),model_fill_price:str(fill),
    fee_quote_usdc:str(c.feeQuote),notional_usdc:str(c.gross),
    total_debit_usdc:str(c.total),cash_remainder_usdc:str(cash-c.total),
    model:"V5_NEXT_OPEN_REFERENCE_WITH_FIXED_SLIPPAGE"});
}
function referenceSell({spec,inventoryBase,referencePrice,feePpm=1000,slipPpm=500}){
  const ins=instrument(spec),inventory=positive(inventoryBase,"inventory"),price=positive(referencePrice,"reference price");
  const {fee,slip}=rates(feePpm,slipPpm);
  const qty=roundLotDown(inventory,ins.lotSz);
  if(qty<ins.minSz)return fail("MIN_SIZE_AFTER_LOT","Inventory below public minSz");
  const fill=price*(PPM-slip)/PPM,c=costSell(qty,fill,fee);
  return baseResult(ins,qty,{inventory_before_base:str(inventory),inventory_after_base:str(inventory-qty),
    reference_price:str(price),model_fill_price:str(fill),
    gross_proceeds_usdc:str(c.gross),fee_quote_usdc:str(c.feeQuote),
    net_proceeds_usdc:str(c.net),model:"V5_NEXT_OPEN_REFERENCE_WITH_FIXED_SLIPPAGE"});
}
function referenceRoundTrip({spec,budget,entryPrice,exitPrice,feePpm=1000,slipPpm=500}){
  const bought=referenceBuy({spec,budget,referencePrice:entryPrice,feePpm,slipPpm});
  if(!bought.ok)return{...bought,stage:"BUY"};
  const sold=referenceSell({spec,inventoryBase:bought.quantity_base,referencePrice:exitPrice,feePpm,slipPpm});
  if(!sold.ok)return{...sold,stage:"SELL"};
  const end=atoms(bought.cash_remainder_usdc)+atoms(sold.net_proceeds_usdc);
  return {ok:true,code:"KNOWN_PUBLIC_CONSTRAINTS_ONLY",read_only:true,orders:0,
    model:"V5_REFERENCE_ROUND_TRIP",instrument:bought.instrument,
    start_quote_usdc:bought.budget_usdc,end_quote_usdc:str(end),
    pnl_quote_usdc:str(end-atoms(bought.budget_usdc)),
    inventory_remaining_base:sold.inventory_after_base,
    entry:bought,exit:sold,account_trading_permission_checked:false,
    other_quote_minimum_checked:false};
}
function assertBook(book,ins,nowMs){
  if(!book||book.instId!==ins.id||!Number.isFinite(nowMs))throw Error("Invalid pair or clock");
  const observed=Date.parse(book.sourceObservedAt);
  if(!Number.isFinite(observed)||nowMs-observed>15000||observed-nowMs>5000)
    throw Error("Missing/stale/future book timestamp");
  const out={};
  for(const [side,ascending] of [["asks",true],["bids",false]]){
    const levels=book[side];
    if(!Array.isArray(levels)||levels.length<1||levels.length>400)throw Error("No valid book depth");
    let prev=null;
    out[side]=levels.map(z=>{
      if(!Array.isArray(z)||z.length<2)throw Error("Invalid book level");
      const p=positive(z[0],"book price"),q=positive(z[1],"book volume");
      if(p%ins.tickSz!==0n)throw Error("Book level not on tickSz");
      if(prev!==null&&(ascending?p<=prev:p>=prev))throw Error("Invalid book order");
      prev=p;return{price:p,base:q};
    });
  }
  if(out.bids[0].price>=out.asks[0].price)throw Error("Crossed book");
  return out;
}
function sweep(qty,levels,side){
  let left=qty,weighted=0n,used=0;
  for(const level of levels){
    if(left===0n)break;
    const take=min(left,level.base);
    if(take>0n){weighted+=take*level.price;left-=take;used++;}
  }
  if(left!==0n)return null;
  const gross=side==="BUY"?divUp(weighted,SCALE):weighted/SCALE;
  return {gross,used};
}
function buyFromBook({spec,budget,book,nowMs,feePpm=1000}){
  const ins=instrument(spec),cash=positive(budget,"budget"),{fee}=rates(feePpm,0);
  const levels=assertBook(book,ins,nowMs).asks;
  const available=levels.reduce((sum,x)=>sum+x.base,0n);
  const maxLots=available/ins.lotSz;
  const costFn=qty=>{const x=sweep(qty,levels,"BUY");if(!x)return{total:cash+1n};
    const feeQuote=divUp(x.gross*fee,PPM);return {gross:x.gross,feeQuote,total:x.gross+feeQuote,used:x.used}};
  const qty=affordableQuantity(cash,ins.lotSz,maxLots,costFn);
  if(qty<ins.minSz)return fail("MIN_SIZE_AFTER_LOT","Budget produces less than public minSz");
  const c=costFn(qty);
  // Preserve original V6 all-or-nothing-on-visible-depth policy: only lot-sized
  // residual budget may remain, not material unfilled quantity.
  if(qty===maxLots && c.total<cash &&
    cash-c.total>divUp(ins.lotSz*levels.at(-1).price,SCALE)+divUp(c.gross*fee,PPM))
    return fail("INSUFFICIENT_LIQUIDITY","Visible book too shallow for budget");
  return baseResult(ins,qty,{budget_usdc:str(cash),notional_usdc:str(c.gross),
    fee_quote_usdc:str(c.feeQuote),total_debit_usdc:str(c.total),
    cash_remainder_usdc:str(cash-c.total),levels_used:c.used,
    model:"V6_PUBLIC_ORDERBOOK_BUY_WITH_QUANTITY_FLOOR"});
}
function sellInventoryToBook({spec,inventoryBase,book,nowMs,feePpm=1000}){
  const ins=instrument(spec),original=positive(inventoryBase,"inventory"),{fee}=rates(feePpm,0);
  const qty=roundLotDown(original,ins.lotSz);
  if(qty<ins.minSz)return fail("MIN_SIZE_AFTER_LOT","Base inventory below public minSz");
  const levels=assertBook(book,ins,nowMs).bids;
  const s=sweep(qty,levels,"SELL");
  if(!s)return fail("INSUFFICIENT_LIQUIDITY","Full base quantity cannot be sold in visible depth");
  const c=costSell(qty,divUp(s.gross*SCALE,qty),fee);
  // Use the weighted quote gross directly to avoid double rounding through VWAP.
  const feeQuote=divUp(s.gross*fee,PPM),net=s.gross-feeQuote;
  return baseResult(ins,qty,{inventory_before_base:str(original),
    inventory_after_base:str(original-qty),gross_proceeds_usdc:str(s.gross),
    fee_quote_usdc:str(feeQuote),net_proceeds_usdc:str(net),
    levels_used:s.used,model:"V6_PUBLIC_ORDERBOOK_SELL_ACTUAL_INVENTORY"});
}
function bookRoundTrip({spec,budget,book,nowMs,feePpm=1000}){
  const buy=buyFromBook({spec,budget,book,nowMs,feePpm});
  if(!buy.ok)return{...buy,stage:"BUY"};
  const sell=sellInventoryToBook({spec,inventoryBase:buy.quantity_base,book,nowMs,feePpm});
  if(!sell.ok)return{...sell,stage:"SELL"};
  const final=atoms(buy.cash_remainder_usdc)+atoms(sell.net_proceeds_usdc);
  return {ok:true,code:"KNOWN_PUBLIC_CONSTRAINTS_ONLY",read_only:true,orders:0,
    instrument:buy.instrument,model:"V6_SAME_BOOK_NO_TIME_ELAPSED_FRICTION_ONLY",
    start_quote_usdc:buy.budget_usdc,end_quote_usdc:str(final),
    pnl_quote_usdc:str(final-atoms(buy.budget_usdc)),
    inventory_remaining_base:sell.inventory_after_base,
    entry:buy,exit:sell,account_trading_permission_checked:false,
    other_quote_minimum_checked:false};
}
function validateLimitPrice({spec,price}){
  const ins=instrument(spec),p=positive(price,"limit price");
  return {valid_tick:p%ins.tickSz===0n,price:str(p),tick_sz:str(ins.tickSz),
    order_submission_performed:false};
}
globalThis.SevenHeavenSpotPaperLotAdapter=Object.freeze({version:"2026-11-13-browser-readonly",
  read_only:true,orders:0,api_credentials:false,real_order:false,public_eligibility_guaranteed:false,
  referenceBuy,referenceSell,referenceRoundTrip,buyFromBook,sellInventoryToBook,bookRoundTrip,
  validateLimitPrice});
