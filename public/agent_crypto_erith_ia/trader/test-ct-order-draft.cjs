'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const draft=require('./ct-order-draft.js');
const model=require('./ai-ct-contract.js');
const fs=require('node:fs');
const now=Date.UTC(2026,9,16,15,0,0);
const iso=offset=>new Date(now+offset).toISOString();
const account={
 ok:true,read_only:true,fetched_at:iso(-5000),
 trading:[{details:[
  {ccy:'CT',cashBal:'9.99',availBal:'9.99'},
  {ccy:'USDC',cashBal:'100',availBal:'100'}
 ]}],funding:[]
};
const fills={ok:true,read_only:true,fills_3m:[
 {instId:'CT-USDC',side:'buy',tradeId:'test-buy',fillPx:'0.3522',fillSz:'10',fee:'-0.01',feeCcy:'CT'}
]};
const fees={ok:true,read_only:true,instId:'CT-USDC',fees:[{taker:'-0.002'}]};
const book={status:'ok',provider:'okx',pair:'CT-USDC',quote:'USDC',observed_at_utc:iso(-1500),
 bids:[['0.3510','100']],asks:[['0.3530','100']]};
const instruments={observed_at_utc:iso(-1000),payload:{code:'0',data:[
 {instType:'SPOT',instId:'CT-USDC',state:'live',minSz:'10',lotSz:'0.01',tickSz:'0.0001'}
]}};
const doc=()=>model.compose({account,fills,fees,book,instruments},now);
const propose=(side='buy',quantity_ct='10',limit_price_usdc='0.3522')=>({side,quantity_ct,limit_price_usdc});
test('an existing CT/USDC report is reused; draft is forever non-executable',()=>{
 const result=draft.prepare(doc(),propose(),model,now);
 assert.equal(result.market,'CT-USDC');assert.equal(result.kind,'SPOT');
 assert.equal(result.side,'buy');assert.equal(result.order_type,'limit');
 assert.equal(result.quantity_ct,'10.0');assert.equal(result.limit_price_usdc,'0.3522');
 assert.equal(result.notional_usdc,'3.522');
 assert.equal(result.status,'blocked');assert.equal(result.executable,false);
 assert.equal(result.read_only,true);assert.equal(result.input_verified,true);
 assert.match(result.reasons.join(' '),/Exécution désactivée/);
 assert.match(result.reasons.join(' '),/minimum notionnel/i);
});
test('CT-USDT or unknown contract never substitutes for the private CT-USDC market',()=>{
 const other=draft.prepare({...doc(),market:'CT-USDT'},propose(),model,now);
 assert.equal(other.input_verified,false);
 assert.match(other.reasons.join(' '),/CT\/USDT/);
});
test('actual 9.99 CT held cannot be sold on synthetic minimum 10 CT',()=>{
 const result=draft.prepare(doc(),propose('sell','9.99'),model,now);
 assert.equal(result.input_verified,false);
 assert.match(result.reasons.join(' '),/minimum OKX/);
});
test('a 10 CT sell cannot borrow CT that is not present',()=>{
 const result=draft.prepare(doc(),propose('sell','10'),model,now);
 assert.equal(result.input_verified,false);
 assert.match(result.reasons.join(' '),/supérieure au total CT/);
});
test('selling after a proven full liquidation of CT is refused',()=>{
 const before=doc();
 const zero={...before,position:{...before.position,qty_ct:0},
  portfolio:{...before.portfolio,assets:{...before.portfolio.assets,
   CT:{verified:true,qty:0}}}};
 const result=draft.prepare(zero,propose('sell','10'),model,now);
 assert.equal(result.executable,false);
 assert.equal(result.input_verified,false);
 assert.match(result.reasons.join(' '),/Aucun CT observé/);
});
test('ticket is mounted only in native OKX Seven analysis, not in Radar or Chart',()=>{
 const script=fs.readFileSync(require.resolve('./ai-ct-panel.js'),'utf8');
 const inAccount=script.slice(script.indexOf('async function readForAccount('),
  script.indexOf('const lesson='));
 assert.match(inAccount,/showEvidence\(target,doc\);\s*globalThis\.AgentCryptoCtOrderTicket\?\.mount\?\.\(target,doc\)/);
 const other=script.slice(script.indexOf('function paint(doc)'),script.indexOf('async function loadCtEvidence'));
 assert.ok(!other.includes('AgentCryptoCtOrderTicket'));
 assert.match(inAccount,/await ensureCtOrderTicket\(\)/);
 assert.match(script,/function ensureCtOrderTicket\(\)/);
 assert.match(script,/traderCtOrderDraftScript/);
 assert.match(script,/traderCtOrderTicketScript/);
 const mirror=fs.readFileSync(require.resolve('./trader-runtime-mirror.js'),'utf8');
 assert.ok(!mirror.includes('traderCtOrderDraftScript'));
 assert.ok(!mirror.includes('traderCtOrderTicketScript'));
 const css=fs.readFileSync(require.resolve('./ct-order-ticket.css'),'utf8');
 assert.ok(css.includes('#traderOkxAccountPanel .ct-order-ticket'));
 assert.ok(!css.includes('#marketRadar'));
});
test('invalid price tick is refused without silent rounding',()=>{
 const result=draft.prepare(doc(),propose('buy','10','0.35225'),model,now);
 assert.equal(result.input_verified,false);
 assert.match(result.reasons.join(' '),/tickSz/);
});
test('unknown or stale instrument rules suspend the draft',()=>{
 const actual=doc();
 const missing=draft.prepare({...actual,instrument_rules:{status:'unverified'}},propose(),model,now);
 assert.equal(missing.input_verified,false);
 assert.match(missing.reasons.join(' '),/Règles Spot/);
 const old=draft.prepare(actual,propose(),model,now+121000);
 assert.equal(old.input_verified,false);
 assert.match(old.reasons.join(' '),/trop ancienne|périmées/);
});
test('a large buy cannot exceed even the combined observed USDC total',()=>{
 const result=draft.prepare(doc(),propose('buy','1000','0.5'),model,now);
 assert.equal(result.input_verified,false);
 assert.match(result.reasons.join(' '),/total USDC/);
});
test('bad decimal input and an unsupported side fail closed',()=>{
 const out=draft.prepare(doc(),propose('withdraw','10abc','1e-6'),model,now);
 assert.equal(out.input_verified,false);
 assert.equal(out.quantity_ct,null);
 assert.equal(out.limit_price_usdc,null);
 assert.equal(out.side,null);
});
test('fee and account provenance missing never imply approved trading',()=>{
 const actual=doc();
 const out=draft.prepare({...actual,fee_taker_fraction:null,portfolio:{assets:{}}},propose(),model,now);
 assert.equal(out.input_verified,false);
 assert.match(out.reasons.join(' '),/Frais futurs/);
 assert.match(out.reasons.join(' '),/Solde USDC/);
});
test('no trading API transport, credential read, or storage in either ticket module',()=>{
 const code=fs.readFileSync(require.resolve('./ct-order-draft.js'),'utf8')+
  fs.readFileSync(require.resolve('./ct-order-ticket.js'),'utf8');
 for(const forbidden of ['fetch(', 'XMLHttpRequest','localStorage','sessionStorage','/okx/trade/order','postMessage(','submitOrder(','.scrollIntoView('])
   assert.ok(!code.includes(forbidden),'Unexpected operation: '+forbidden);
 assert.match(code,/EXÉCUTION BLOQUÉE/);
});
