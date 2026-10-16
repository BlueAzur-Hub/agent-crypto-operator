'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const ct=require('./ai-ct-contract.js');
const {btcScenarioGrid,btcPositionReport}=require('./trader-okx-account.js');
const now=Date.UTC(2026,9,15,10,20,0);
const account={ok:true,read_only:true,fetched_at:new Date(now-1000).toISOString(),
 trading:[{details:[{ccy:'CT',cashBal:'8'}]}],funding:[]};
const fills={ok:true,read_only:true,fills_3m:[{
 instId:'CT-USDC',side:'buy',tradeId:'SYNTHETIC_1',fillPx:'0.36',
 fillSz:'8',fee:'0',feeCcy:'CT'
}]};
const fees={ok:true,read_only:true,instId:'CT-USDC',fees:[{taker:'-0.002'}]};
const book={status:'ok',provider:'okx',pair:'CT-USDC',quote:'USDC',
 observed_at_utc:new Date(now-1000).toISOString(),bids:[['0.4','3'],['0.39','6']]};
const hypot=()=>ct.compose({account,fills,fees,book},now);
test('CT three scenarios are recomputed across full fictitious bid depth including taker fees',()=>{
 const doc=hypot(), rows=doc.scenario_grid.rows;
 assert.equal(doc.scenario_grid.status,'hypothetical');
 assert.deepEqual(rows.map(x=>x.shock_pct),[-5,0,5]);
 assert.equal(doc.scenario_grid.fee_rate_fraction,.002);
 assert.equal(doc.scenario_grid.fixed_depth_assumption,true);
 const baseline=(3*.4+5*.39)*.998;
 for(const row of rows){
   const expected=baseline*(1+row.shock_pct/100);
   assert.ok(Math.abs(row.net_exit_usdc-expected)<1e-10);
   assert.ok(Math.abs(row.estimated_sell_fee_usdc-
     row.gross_exit_usdc*.002)<1e-10);
   assert.equal(row.indicative_difference_usdc!==null,true);
 }
 assert.equal(doc.orders_enabled,false);
 assert.equal(doc.profit_proven,false);
});
test('CT refuses real-time projections when native book is old, from another pair, or shallow',()=>{
 for(const changed of [
  {...book,observed_at_utc:new Date(now-90000).toISOString()},
  {...book,pair:'CT-USDT'},
  {...book,bids:[['0.4','3']]}
 ]){
   const r=ct.compose({account,fills,fees,book:changed},now);
   assert.equal(r.scenario_grid.status,'unavailable');
   assert.equal(r.scenario_grid.rows.length,0);
   assert.equal(r.pnl_illustrative_usdc,null);
 }
});
test('CT missing rate cannot estimate net receipt or treat net as gross',()=>{
 const r=ct.compose({account,fills,fees:null,book},now);
 assert.equal(r.scenario_grid.status,'unavailable');
 assert.equal(r.scenario_grid.rows.length,0);
});
test('CT cost unproven does not prevent hypothetical exit values but withholds return',()=>{
 const missing={...fills,fills_3m:[]};
 const r=ct.compose({account,fills:missing,fees,book},now);
 assert.equal(r.scenario_grid.status,'hypothetical');
 assert.ok(r.scenario_grid.rows.every(x=>x.indicative_difference_usdc===null));
 assert.equal(r.pnl_illustrative_usdc,null);
 assert.match(ct.explain(r).lines.join(' '),/coût d’acquisition non rapproché/);
});
test('CT scenarios do not mutate the observed bids',()=>{
 const before=JSON.stringify(book);
 ct.compose({account,fills,fees,book},now);
 assert.equal(JSON.stringify(book),before);
});
test('CT report in both existing panels explains non-predictive nature',()=>{
 const report=ct.explain(hypot());
 const txt=report.lines.join(' ');
 assert.match(txt,/Scénarios CT\/USDC/);
 assert.match(txt,/revente nette fictive/);
 assert.match(txt,/pas une prévision ni un ordre/);
 assert.doesNotMatch(txt,/bénéfice garanti/);
});
const btcAccount={ok:true,read_only:true,fetched_at:new Date(now-1000).toISOString()};
const btcInput={account:btcAccount,quantity:.002,quote:{
  price:80000,source:'Binance Spot BTC/EUR',receivedAt:now-1000}};
test('BTC ±5% EUR scenarios are valuations without fees or executable-book claims',()=>{
 const r=btcScenarioGrid(btcInput,now);
 assert.equal(r.status,'hypothetical');
 assert.deepEqual(r.rows.map(x=>x.shock_pct),[-5,0,5]);
 assert.deepEqual(r.rows.map(x=>x.hypothetical_value_eur),[152,160,168]);
 assert.deepEqual(r.rows.map(x=>x.movement_vs_spot_eur),[-8,0,8]);
 assert.equal(r.fee_included,false);
 assert.equal(r.read_only,true);
});
test('BTC explanation exposes scenarios but never represents delta as realized return',()=>{
 const report=btcPositionReport({...btcInput,ledger:null},now);
 const text=report.lines.join(' ');
 assert.match(text,/Scénarios BTC\/EUR/);
 assert.match(text,/AVANT frais et spread/);
 assert.match(text,/pas un gain réalisé/);
 assert.match(text,/Prix moyen et coût total NON PROUVÉS/);
 assert.equal(report.indicative_delta_eur,null);
});
test('BTC no stale account, stale price, future quote, missing holdings or zero BTC used',()=>{
 for(const changed of [
  {...btcInput,account:{...btcAccount,fetched_at:new Date(now-160000).toISOString()}},
  {...btcInput,quote:{...btcInput.quote,receivedAt:now-200000}},
  {...btcInput,quote:{...btcInput.quote,receivedAt:now+6000}},
  {...btcInput,quantity:null},
  {...btcInput,quantity:0},
  {...btcInput,account:{...btcAccount,read_only:false}}
 ]){
   const r=btcScenarioGrid(changed,now);
   assert.equal(r.status,'unavailable');
   assert.equal(r.rows.length,0);
 }
});
test('BTC unproven fees never produce hypothetical net proceeds',()=>{
 const r=btcScenarioGrid(btcInput,now);
 assert.ok(r.rows.every(x=>!Object.hasOwn(x,'net_exit_eur')));
 assert.ok(r.rows.every(x=>!Object.hasOwn(x,'profit_eur')));
 assert.match(r.caveat,/sans carnet BTC exécutable/);
});

test('CT 25 50 100 pct partial exits walk the same observed orderbook and known taker fee',()=>{
 const r=ct.ctPartialExitGrid(book,8,.002,now);
 assert.equal(r.status,'hypothetical');assert.equal(r.read_only,true);
 assert.equal(r.cost_basis_assigned,false);
 assert.deepEqual(r.rows.map(x=>x.share_pct),[25,50,100]);
 assert.deepEqual(r.rows.map(x=>x.requested_ct),[2,4,8]);
 assert.deepEqual(r.rows.map(x=>x.remaining_ct),[6,4,0]);
 const gross=[2*.4,3*.4+1*.39,3*.4+5*.39];
 for(let i=0;i<3;i++){
  assert.equal(r.rows[i].status,'indicative');
  assert.ok(Math.abs(r.rows[i].net_usdc-gross[i]*.998)<1e-10);
  assert.ok(Math.abs(r.rows[i].estimated_fee_usdc-gross[i]*.002)<1e-10);
 }
});
test('CT limited depth may support 25 and 50 pct but refuse total sale',()=>{
 const shallow={...book,bids:[['0.4','2'],['0.39','2']]};
 const r=ct.ctPartialExitGrid(shallow,8,.002,now);
 assert.equal(r.status,'hypothetical');
 assert.equal(r.rows[0].status,'indicative');
 assert.equal(r.rows[1].status,'indicative');
 assert.equal(r.rows[2].status,'unavailable');
 assert.equal(r.rows[2].net_usdc,null);
 assert.equal(r.rows[2].remaining_ct,null);
});
test('CT stale, wrong-pair, unpriced fees or absent balance never give an exit figure',()=>{
 const rows=[
  [book,null,.002],
  [book,0,.002],
  [book,8,null],
  [{...book,pair:'CT-USDT'},8,.002],
  [{...book,observed_at_utc:new Date(now-70000).toISOString()},8,.002]
 ];
 for(const [candidate,qty,rate] of rows){
  const result=ct.ctPartialExitGrid(candidate,qty,rate,now);
  assert.equal(result.status,'unavailable');
  assert.equal(result.rows.length,0);
 }
});
test('CT partial liquidation cannot mutate orderbook and cannot assign partial cost basis',()=>{
 const original=JSON.stringify(book);
 const doc=ct.compose({account,fills,fees,book},now);
 assert.equal(JSON.stringify(book),original);
 assert.equal(doc.partial_exit_grid.status,'hypothetical');
 assert.equal(doc.partial_exit_grid.cost_basis_assigned,false);
 assert.equal(doc.profit_proven,false);
 assert.ok(doc.partial_exit_grid.rows.every(x=>!Object.hasOwn(x,'pnl_usdc')));
});
test('CT report in both existing panels explains 25 50 100 percent without ordering',()=>{
 const doc=ct.compose({account,fills,fees,book},now);
 const t=ct.explain(doc).lines.join(' ');
 assert.match(t,/Revente partielle FICTIVE CT\/USDC/);
 assert.match(t,/25 % du CT/);
 assert.match(t,/50 % du CT/);
 assert.match(t,/100 % du CT/);
 assert.match(t,/Aucune exécution ni affectation arbitraire du coût/);
});
test('CT actual balance unavailable cannot manufacture a partial payout',()=>{
 const missing={...account,trading:[]};
 const doc=ct.compose({account:missing,fills,fees,book},now);
 assert.equal(doc.partial_exit_grid.status,'unavailable');
 assert.equal(doc.partial_exit_grid.rows.length,0);
});
test('manual private summary copy includes all currently requested CT scenarios',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const code=fs.readFileSync(path.join(__dirname,'ai-ct-panel.js'),'utf8');
 assert.match(code,/scenario_grid:latest\.scenario_grid,partial_exit_grid:latest\.partial_exit_grid/);
 assert.match(code,/navigator\.clipboard\.writeText/);
 assert.doesNotMatch(code,/upload.*summary|fetch\(.+summary.*POST/);
});
