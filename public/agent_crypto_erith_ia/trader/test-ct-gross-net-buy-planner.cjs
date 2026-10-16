'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ct=require('./ai-ct-contract.js');
const rules={status:'verified',market:'CT-USDC',state:'live',min_sz:'10',lot_sz:'0.01',tick_sz:'0.0001',checked_at:'2026-10-16T08:00:00Z'};
const plan=(p='0.1',ccy='CT',r=rules)=>ct.planGrossBuyForNetSpot(r,p,ccy);

test('historical example: 10 CT gross minus 0.01 CT fee leaves 9.99 CT',()=>{
 const gross=10,observedFee=.01;
 assert.equal(gross-observedFee,9.99);
 const forecast=plan('0.1','CT');
 assert.equal(forecast.status,'hypothetical');
 assert.equal(forecast.gross_purchase_ct,'10.02');
 assert.equal(forecast.assumed_fee_ct,'0.01002');
 assert.equal(forecast.net_received_ct,'10.00998');
 assert.equal(forecast.sale_quantity_target_ct,'10');
 assert.equal(forecast.quantity_saleable_ct,'10');
 assert.equal(forecast.residual_ct,'0.00998');
 assert.equal(forecast.order_enabled,false);
 assert.equal(forecast.capital_committed_proven,false);
 assert.equal(forecast.rules_verified,true);
});
test('if fee debits USDC rather than CT, the CT count is not reduced',()=>{
 const forecast=plan('0.1','USDC');
 assert.equal(forecast.status,'hypothetical');
 assert.equal(forecast.gross_purchase_ct,'10');
 assert.equal(forecast.net_received_ct,'10');
 assert.equal(forecast.assumed_fee_ct,null);
 assert.equal(forecast.cost_usdc,null);
 assert.equal(forecast.quantity_saleable_ct,'10');
});
test('zero fee does not add unnecessary CT units',()=>{
 const p=plan('0','CT');
 assert.equal(p.gross_purchase_ct,'10');
 assert.equal(p.assumed_fee_ct,'0');
 assert.equal(p.quantity_saleable_ct,'10');
});
test('no future fee hypothesis refuses to invent a purchase quantity',()=>{
 for(const value of [undefined,null,'','0,1','-1','6','0.000000001','NaN']){
  const r=ct.planGrossBuyForNetSpot(rules,value,'CT');
  assert.equal(r.status,'unavailable');
  assert.equal(r.order_enabled,false);
 }
});
test('no official rules requires explicit manual values, never a fixed minimum 10',()=>{
 const unverified={status:'unverified',market:'CT-USDC'};
 const r=plan('0.1','CT',unverified);
 assert.equal(r.status,'unavailable');
 const explicit={status:'manual',market:'CT-USDC',state:'unknown',min_sz:'10',lot_sz:'0.01'};
 const hypothetical=plan('0.1','CT',explicit);
 assert.equal(hypothetical.status,'hypothetical');
 assert.equal(hypothetical.rules_verified,false);
 assert.equal(hypothetical.official_filters_checked_at,null);
 assert.match(hypothetical.rule_source,/NON VERIFIEE/);
});
test('future fee in an unknown currency is not silently treated as CT or USDC',()=>{
 assert.equal(plan('0.1','BTC').status,'unavailable');
 assert.equal(ct.planGrossBuyForNetSpot(rules,'0.1',undefined).status,'unavailable');
});
test('when minimum is not a multiple of lot, target next legal sellable lot',()=>{
 const r={...rules,min_sz:'10.005',lot_sz:'0.01'};
 const out=plan('0','CT',r);
 assert.equal(out.sale_quantity_target_ct,'10.01');
 assert.equal(out.gross_purchase_ct,'10.01');
});
test('coarse spot step rounds gross conservatively and never under target',()=>{
 const r={...rules,min_sz:'10',lot_sz:'0.25'};
 const out=plan('1','CT',r);
 assert.equal(out.gross_purchase_ct,'10.25');
 assert.equal(out.assumed_fee_ct,'0.1025');
 assert.equal(out.net_received_ct,'10.1475');
 assert.equal(out.quantity_saleable_ct,'10');
});
test('small decimal lot, 0.1% fee: precision remains exact',()=>{
 const r={...rules,min_sz:'0.0001',lot_sz:'0.00000001'};
 const out=plan('0.1','CT',r);
 assert.equal(out.status,'hypothetical');
 assert.ok(Number(out.quantity_saleable_ct)>=.0001);
 assert.ok(Number(out.gross_purchase_ct)>Number(out.minimum_ct));
});
test('suspended official market cannot produce an executable-looking buy plan',()=>{
 assert.equal(plan('0.1','CT',{...rules,state:'suspend'}).status,'unavailable');
});
test('multiple invalid manual rules fail closed',()=>{
 for(const r of [{...rules,min_sz:'0'},{...rules,lot_sz:'0'},
  {...rules,min_sz:'foo'},{...rules,lot_sz:'0.0000000000001'},
  {...rules,market:'CT-USDT'}]){
  assert.equal(plan('0.1','CT',r).status,'unavailable');
 }
});
test('old fee from CT-denominated fills appears explicitly as observed, not future verified',()=>{
 const qty=9.99;
 const purchases={ok:true,read_only:true,fills_3m:[{
  instId:'CT-USDC',side:'buy',tradeId:'SYNTHETIC_1',fillPx:'0.35',
  fillSz:'10',fee:'-0.01',feeCcy:'CT'
 }]};
 const a=ct.acquisition(purchases,qty);
 assert.equal(a.status,'reconciled_fills_only');
 assert.equal(a.observed_buy_ct_fee_pct,.1);
 assert.equal(a.observed_buy_ct_fee_qty,.01);
 assert.equal(a.historical_gross_ct,10);
 assert.equal(plan('0.1','CT').status,'hypothetical');
});
test('fees in USDC cannot be presented as observed CT fees',()=>{
 const purchases={ok:true,read_only:true,fills_3m:[{
  instId:'CT-USDC',side:'buy',tradeId:'SYNTHETIC_2',fillPx:'0.35',
  fillSz:'10',fee:'-0.007',feeCcy:'USDC'
 }]};
 const a=ct.acquisition(purchases,10);
 assert.equal(a.status,'reconciled_fills_only');
 assert.equal(a.observed_buy_ct_fee_pct,null);
});
test('the existing two CT panels share one fee-aware planner with manual confirmation',()=>{
 const src=fs.readFileSync(path.join(__dirname,'ai-ct-panel.js'),'utf8');
 assert.match(src,/function showNetBuyPlanner\(parent,doc\)/);
 assert.match(src,/showNetBuyPlanner\(wrapper,doc\)/);
 assert.match(src,/run\.addEventListener\('click'/);
 assert.match(src,/model\.planGrossBuyForNetSpot\(rule,rate\.value\.trim\(\)/);
 assert.match(src,/Utiliser ce taux comme hypothèse/);
 assert.match(src,/Règles OKX NON VÉRIFIÉES/);
 assert.doesNotMatch(src,/planGrossBuyForNetSpot\(.*\)\s*;\s*fetch\(/);
});
