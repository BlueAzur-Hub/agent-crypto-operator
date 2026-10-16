'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const ct=require('./ai-ct-contract.js');
const now=Date.UTC(2026,9,16,6,0);
const records=(min='10',lot='0.01',state='live')=>({
 observed_at_utc:new Date(now-1000).toISOString(),
 payload:{code:'0',data:[{instType:'SPOT',instId:'CT-USDC',state,
 minSz:min,lotSz:lot,tickSz:'0.0001'}]}
});
test('public SPOT CT-USDC exact pair parses minimum, lot step and tick',()=>{
 const r=ct.spotTradingRules(records(),now);
 assert.equal(r.status,'verified');
 assert.equal(r.market,'CT-USDC');
 assert.equal(r.min_sz,'10');assert.equal(r.lot_sz,'0.01');
 assert.equal(r.tick_sz,'0.0001');assert.equal(r.state,'live');
});
test('9.99 CT fails a SYNTHETIC 10 CT minimum even though book could show liquidity',()=>{
 const rules=ct.spotTradingRules(records(),now);
 const grid={rows:[25,50,100].map(share_pct=>({share_pct,status:'indicative'}))};
 const result=ct.assessPartialRules(grid,9.99,rules);
 assert.deepEqual(result.rows.map(x=>x.quantity_status),
  ['below_minimum','below_minimum','below_minimum']);
 assert.equal(result.order_accepted,false);
 assert.ok(result.rows.every(x=>x.simulated_status==='indicative'));
});
test('with synthetic minimum 1 CT lot .01 CT a full 9.99 CT size matches but 25 and 50 do not',()=>{
 const r=ct.spotTradingRules(records('1','0.01'),now);
 const grid={rows:[25,50,100].map(share_pct=>({share_pct,status:'indicative'}))};
 assert.deepEqual(ct.assessPartialRules(grid,9.99,r).rows.map(x=>x.quantity_status),
  ['invalid_step','invalid_step','size_matches']);
});
test('valid size is only a filter match not exchange acceptance',()=>{
 const a=ct.assessSpotQuantity(10,ct.spotTradingRules(records(),now));
 assert.equal(a.status,'size_matches');
 assert.match(a.message,/NON garantie/);
});
test('suspended or post-only pair can never be advertised as normal executable SPOT',()=>{
 for(const state of ['suspend','post_only','preopen','rebase']){
  const r=ct.spotTradingRules(records('1','0.01',state),now);
  assert.equal(ct.assessSpotQuantity(10,r).status,'not_live');
 }
});
test('unknown official rules always refuse to infer a minimum of 10',()=>{
 const r=ct.spotTradingRules(null,now);
 assert.equal(r.status,'unverified');
 assert.equal(ct.assessSpotQuantity(9.99,r).status,'unverified');
 assert.doesNotMatch(JSON.stringify(r),/"min_sz":10/);
});
test('expired API response cannot provide trading quantity confirmation',()=>{
 const stale=records();
 stale.observed_at_utc=new Date(now-121000).toISOString();
 assert.equal(ct.spotTradingRules(stale,now).status,'unverified');
});
test('CT-USDT is not accepted as CT-USDC instrument regardless of visible chart',()=>{
 const altered=records();altered.payload.data[0].instId='CT-USDT';
 assert.equal(ct.spotTradingRules(altered,now).status,'unverified');
});
test('ambiguous, invalid lot/tick/min and missing SPOT type are rejected',()=>{
 for(const change of [
  v=>v.payload.data.push({...v.payload.data[0]}),
  v=>{v.payload.data[0].minSz='0'},
  v=>{v.payload.data[0].lotSz='not-verified'},
  v=>{v.payload.data[0].tickSz=''},
  v=>{v.payload.data[0].instType='MARGIN'}
 ]){
  const r=records();change(r);
  assert.equal(ct.spotTradingRules(r,now).status,'unverified');
 }
});
test('no float rounding silently makes arbitrary quantity a multiple of lot',()=>{
 const rules=ct.spotTradingRules(records('1','0.01'),now);
 assert.equal(ct.assessSpotQuantity(2.4975,rules).status,'invalid_step');
 assert.equal(ct.assessSpotQuantity(2.5,rules).status,'size_matches');
 assert.equal(ct.assessSpotQuantity(null,rules).status,'unverified');
});
test('the existing CT explanatory contract separates carnet from order size filter',()=>{
 const nowIso=new Date(now-1000).toISOString();
 const account={ok:true,read_only:true,fetched_at:nowIso,
  trading:[{details:[{ccy:'CT',cashBal:'9.99'}]}],funding:[]};
 const fees={ok:true,read_only:true,instId:'CT-USDC',fees:[{taker:'-0.002'}]};
 const book={status:'ok',provider:'okx',pair:'CT-USDC',quote:'USDC',
  observed_at_utc:nowIso,bids:[['0.386','100']]};
 const composed=ct.compose({account,fills:null,fees,book,instruments:records()},now);
 assert.equal(composed.partial_exit_grid.status,'hypothetical');
 assert.equal(composed.order_assessment.rows[2].quantity_status,'below_minimum');
 assert.equal(composed.orders_enabled,false);
 const explanation=ct.explain(composed).lines.join(' ');
 assert.match(explanation,/Sous le minimum OKX/);
 assert.match(explanation,/Filtres SPOT OKX/);
 assert.match(explanation,/Aucune recommandation/);
});
test('both existing CT screens render same structured HTML without changing charts',()=>{
 const code=fs.readFileSync(path.join(__dirname,'ai-ct-panel.js'),'utf8');
 assert.match(code,/function showEvidence\(target,doc\)/);
 assert.match(code,/showEvidence\(body,doc\)/);
 assert.match(code,/showEvidence\(target,doc\)/);
 assert.match(code,/function showFullReport\(target,report\)/);
 assert.match(code,/publicCtSpotInstrument\(\)/);
 const src=code.split('async function readForAccount(target){')[1]
   ?.split('const lesson=panel.querySelector')[0]||'';
 assert.doesNotMatch(src,/scrollIntoView|detailPanelToggle|atlasSelectMarketCoin|window.location/);
 assert.match(code,/credentials:'omit'/);
 assert.doesNotMatch(code,/Authorization:'Bearer '\+session.*publicCtSpotInstrument/);
});
