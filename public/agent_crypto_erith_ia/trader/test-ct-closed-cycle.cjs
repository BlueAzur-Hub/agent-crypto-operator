'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {ctClosedCycleReport}=require('./ai-ct-contract.js');
const now=Date.UTC(2025,1,19,12,31,0),when=Date.UTC(2025,1,19,12,30,0);
const account=()=>({ok:true,read_only:true,fetched_at:new Date(now-500).toISOString(),
 trading:[{details:[{ccy:'BTC',cashBal:'0.027'},{ccy:'USDC',cashBal:'12.25'}]}],
 funding:[]});
const fills=()=>({ok:true,read_only:true,fills_3m:[{
 instId:'CT-USDC',side:'buy',tradeId:'spot-buy-11',fillSz:'8',
 fillPx:'0.2',fee:'-0.5',feeCcy:'CT',ts:String(when-86400000)
}]});
const ledger=(ccy,items=[])=>({ok:true,read_only:true,ccy,sources:{
 trading_account:{state:'ok',has_more:false,records:items},
 funding_account:{state:'ok',has_more:false,records:[]}
}});
const ct=()=>ledger('CT',[{billId:'debit-ct-1',ccy:'CT',ts:String(when),balChg:'-7.5'}]);
const usdc=()=>ledger('USDC',[{billId:'credit-usdc-1',ccy:'USDC',
 ts:String(when+500),balChg:'1.8765'}]);
const evidence=()=>({account:account(),fills:fills(),ctLedger:ct(),usdcLedger:usdc()});
const get=(custom={})=>ctClosedCycleReport({...evidence(),...custom},now);

test('CT absent from complete account is treated as zero and matches ONE accounting pair',()=>{
 const r=get();
 assert.equal(r.status,'compatible_movements');
 assert.equal(r.read_only,true);
 assert.equal(r.orders_enabled,false);
 assert.equal(r.conversion_proven,false);
 assert.equal(r.profit_proven,false);
 assert.equal(r.outgoing_ct,7.5);
 assert.equal(r.incoming_usdc,1.8765);
 assert.ok(Math.abs(r.acquisition_cost_usdc-1.6)<1e-10);
 assert.ok(Math.abs(r.indicative_difference_usdc-0.2765)<1e-10);
 assert.ok(Math.abs(r.indicative_return_pct-100*.2765/1.6)<1e-8);
 assert.match(r.reason,/non|vérifier/i);
});
test('explicit cross-reference alone still does not certify a Convert',()=>{
 const a=ct();a.sources.trading_account.records[0].refId='ref-99';
 const b=usdc();b.sources.trading_account.records[0].refId='ref-99';
 const r=get({ctLedger:a,usdcLedger:b});
 assert.equal(r.shared_reference,true);
 assert.equal(r.conversion_proven,false);
});
test('cross-reference AND two explicit Convert labels distinguish classified pair',()=>{
 const a=ct();a.sources.trading_account.records[0].refId='ref-99';
 a.sources.trading_account.records[0].category='Convert';
 const b=usdc();b.sources.trading_account.records[0].refId='ref-99';
 b.sources.trading_account.records[0].category='Convert';
 const r=get({ctLedger:a,usdcLedger:b});
 assert.equal(r.status,'classified_ledger_pair');
 assert.equal(r.conversion_proven,true);
 assert.equal(r.profit_proven,false);
});
test('open CT position blocks full liquidation declaration',()=>{
 const a=account();a.trading[0].details.push({ccy:'CT',cashBal:'1'});
 const r=get({account:a});assert.equal(r.status,'position_open');
 assert.equal(r.indicative_difference_usdc,undefined);
});
test('stale account forbids private numbers',()=>{
 const a=account();a.fetched_at=new Date(now-120001).toISOString();
 const r=get({account:a});assert.equal(r.status,'unavailable');
 assert.equal(r.incoming_usdc,undefined);
});
test('incomplete Trading/Funding account blocked',()=>{
 const a=account();delete a.funding;
 assert.equal(get({account:a}).status,'unavailable');
});
test('empty account payload cannot masquerade as a zero CT balance',()=>{
 const a=account();a.trading=[];
 assert.equal(get({account:a}).status,'unavailable');
});
test('journals posted after account snapshot demand a new balance read',()=>{
 const a=account();a.fetched_at=new Date(when-2000).toISOString();
 assert.equal(get({account:a}).status,'unavailable');
});
test('partial or paginated CT ledger does not qualify as complete proof',()=>{
 const a=ct();a.sources.trading_account.has_more=true;
 assert.equal(get({ctLedger:a}).status,'unavailable');
 a.sources.trading_account.has_more=false;a.sources.trading_account.state='partial';
 assert.equal(get({ctLedger:a}).status,'unavailable');
});
test('incomplete USDC ledger blocked',()=>{
 const a=usdc();a.sources.funding_account.state='unavailable';
 const r=get({usdcLedger:a});assert.equal(r.status,'unavailable');
});
test('same-time unrelated funding USDC cannot correlate with trading CT',()=>{
 const a=usdc();
 a.sources.funding_account.records=a.sources.trading_account.records;
 a.sources.trading_account.records=[];
 assert.equal(get({usdcLedger:a}).status,'not_reconciled');
});
test('two matching USDC credits are ambiguous, refuse to pick one',()=>{
 const a=usdc();a.sources.trading_account.records.push({
 billId:'credit-usdc-2',balChg:'5',ts:String(when+800)
 });
 assert.match(get({usdcLedger:a}).reason,/ambigus/i);
});
test('repeated billId blocks duplicated ledger proof',()=>{
 const a=ct();a.sources.trading_account.records.push({...a.sources.trading_account.records[0]});
 assert.equal(get({ctLedger:a}).status,'unavailable');
});
test('invalid or missing bill amount rejects ledger proof',()=>{
 const a=ct();a.sources.trading_account.records[0].balChg='-7.5foo';
 assert.equal(get({ctLedger:a}).status,'unavailable');
});
test('ledger record whose currency contradicts its requested asset is rejected',()=>{
 const a=ct();a.sources.trading_account.records[0].ccy='BTC';
 assert.equal(get({ctLedger:a}).status,'unavailable');
});
test('missing CT purchase fill keeps USD cost and result unknown',()=>{
 const r=get({fills:{ok:true,read_only:true,fills_3m:[]}});
 assert.equal(r.status,'compatible_movements');
 assert.equal(r.acquisition_cost_usdc,null);
 assert.equal(r.indicative_difference_usdc,null);
});
test('purchase occurring after liquidation must not be interpreted as prior cost',()=>{
 const a=fills();a.fills_3m[0].ts=String(when+60000);
 const r=get({fills:a});
 assert.equal(r.acquisition_cost_usdc,null);
});
test('extra sell in fills disables cost basis',()=>{
 const a=fills();a.fills_3m.push({...a.fills_3m[0],tradeId:'later-sale',side:'sell'});
 const r=get({fills:a});assert.equal(r.acquisition_cost_usdc,null);
});
test('no trustworthy timestamp prevents matching',()=>{
 const a=ct();a.sources.trading_account.records[0].ts='';
 assert.equal(get({ctLedger:a}).status,'unavailable');
});
test('source code has no new trading bridge route, no storage of private ledger, no viewport jump',()=>{
 const accountJS=fs.readFileSync(path.join(__dirname,'trader-okx-account.js'),'utf8');
 assert.match(accountJS,/bridge\("\/okx\/ledger\?ccy="\+ccy\+"&pages=1"\)/);
 assert.match(accountJS,/for\(const ccy of \["BTC","EUR","USDC","CT"\]\)/);
 assert.match(accountJS,/data-okx-ctcyclebody/);
 assert.match(accountJS,/updateCtClosedCycle\(\)/);
 const block=accountJS.split('function updateCtClosedCycle(){')[1]
   .split('function updateCapitalJourney(){')[0];
 assert.doesNotMatch(block,/scrollIntoView|localStorage|indexedDB|trade\/order|withdraw/);
});
