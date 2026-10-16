'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const ct=require('./ai-ct-contract.js');
const now=Date.UTC(2026,9,16,10,0);
const fixture={
 schema:ct.SCHEMA,read_only:true,orders_enabled:false,market:'CT-USDC',
 observed_at:new Date(now-1200).toISOString(),
 position:{verified:true,qty_ct:8},
 acquisition:{status:'reconciled_fills_only',spent_usdc:2.5},
 order_assessment:{rows:[{share_pct:100,quantity_status:'below_minimum'}]},
 instrument_rules:{status:'verified',checked_at:new Date(now-1300).toISOString()},
 partial_exit_grid:{observed_at:new Date(now-1100).toISOString(),
  rows:[{share_pct:100,status:'indicative',net_usdc:2.9}]}
};
test('manual CT Convert quote yields provisional USDC difference and return vs proven purchase',()=>{
 const r=ct.compareCtExitDecisions(fixture,'2,75',now);
 assert.equal(r.status,'manual_comparison');
 assert.equal(r.manual_convert_usdc,2.75);
 assert.equal(r.convert_difference_usdc,.25);
 assert.equal(r.convert_return_pct,10);
 assert.equal(r.manual_convert_unverified,true);
 assert.equal(r.order_enabled,false);
 assert.equal(r.spot_net_illustration_usdc,null);
 assert.equal(r.choice_hold_realized_usdc,null);
});
test('a spot book is NOT executable if the quantity is below verified minSize',()=>{
 const r=ct.compareCtExitDecisions(fixture,'2.75',now);
 assert.equal(r.spot_size_status,'below_minimum');
 assert.equal(r.spot_net_illustration_usdc,null);
 assert.equal(r.status,'manual_comparison');
});
test('with good size and fresh book Spot shows illustration, not an order',()=>{
 const r=ct.compareCtExitDecisions({...fixture,
  order_assessment:{rows:[{share_pct:100,quantity_status:'size_matches'}]}},'2.8',now);
 assert.equal(r.spot_net_illustration_usdc,2.9);
 assert.equal(r.hypothetical_spot_difference_usdc,2.9-2.5);
 assert.equal(r.order_enabled,false);
});
test('stale book blocks Spot even if official lot filters match',()=>{
 const r=ct.compareCtExitDecisions({...fixture,
  order_assessment:{rows:[{share_pct:100,quantity_status:'size_matches'}]},
  partial_exit_grid:{observed_at:new Date(now-21000).toISOString(),
   rows:[{share_pct:100,status:'indicative',net_usdc:2.9}]}},'2.8',now);
 assert.equal(r.spot_net_illustration_usdc,null);
});
test('unverified official filters block Spot but do not invent Convert restrictions',()=>{
 const r=ct.compareCtExitDecisions({...fixture,instrument_rules:{status:'unverified'},
  order_assessment:{rows:[{share_pct:100,quantity_status:'unverified'}]}},'2.8',now);
 assert.equal(r.spot_net_illustration_usdc,null);
 assert.equal(r.manual_convert_usdc,2.8);
});
test('historical purchase not proven prevents false net profit declaration',()=>{
 const r=ct.compareCtExitDecisions({...fixture,acquisition:{status:'unknown'}},'2.75',now);
 assert.equal(r.convert_difference_usdc,null);
 assert.equal(r.convert_return_pct,null);
 assert.equal(r.acquisition_cost_usdc,null);
});
test('stale reading or non-private wrong-asset evidence fails closed',()=>{
 for(const doc of [
  {...fixture,observed_at:new Date(now-122000).toISOString()},
  {...fixture,observed_at:new Date(now+2000).toISOString()},
  {...fixture,read_only:false},
  {...fixture,orders_enabled:true},
  {...fixture,market:'CT-USDT'},
  {...fixture,position:{verified:false,qty_ct:8}},
  {...fixture,position:{verified:true,qty_ct:0}}
 ]){
  const r=ct.compareCtExitDecisions(doc,'2.75',now);
  assert.equal(r.status,'unavailable');
  assert.equal(r.order_enabled,false);
 }
});
test('invalid manual quote cannot be treated as a fresh executable offer',()=>{
 for(const quote of [null,undefined,'','0','-2','Infinity','2abc','2.123456789','10,10,2']){
  const r=ct.compareCtExitDecisions(fixture,quote,now);
  assert.equal(r.status,'unavailable',String(quote));
 }
});
test('a lower Convert quote correctly expresses downside instead of forced profit',()=>{
 const r=ct.compareCtExitDecisions(fixture,'2',now);
 assert.equal(r.convert_difference_usdc,-.5);
 assert.equal(r.convert_return_pct,-20);
});
test('the existing CT panel compares on human click with no bridge order or storage',()=>{
 const source=fs.readFileSync(path.join(__dirname,'ai-ct-panel.js'),'utf8');
 assert.match(source,/function showCtChoiceComparison\(parent,doc\)/);
 assert.match(source,/showCtChoiceComparison\(wrapper,doc\)/);
 assert.match(source,/model\.compareCtExitDecisions\(doc,input\.value,Date\.now\(\)\)/);
 assert.match(source,/Devis Convert SAISI MANUELLEMENT/);
 const block=source.split('function showCtChoiceComparison(parent,doc){')[1]
  ?.split('function showEvidence(target,doc){')[0]||'';
 assert.ok(block.length>500);
 assert.doesNotMatch(block,/fetch\(|localStorage|sessionStorage|scrollIntoView|\/api\/v5\/trade\/order|\/okx\/place-order/);
});
