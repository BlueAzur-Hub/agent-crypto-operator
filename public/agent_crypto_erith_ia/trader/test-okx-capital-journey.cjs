'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {capitalJourneyReport}=require('./trader-okx-account.js');

const now=Date.UTC(2026,9,15,8,30,0);
const info=Object.freeze({
 read_only:true,observedAt:new Date(now-2000).toISOString(),
 btc:0.0012,ct:9.75,usdc:10,
 ledgerCheckedAt:now-5000,
 ledger:{matched:{btc:.002,eur:100,timestamp:now-864000000},
  btcChain:{status:'balanced',credit_btc:.002,debit_btc:.0008,
   remaining_btc:.0012,paired_usdc:true,credit_usdc:65}},
 ctAcquisition:{status:'reconciled_fills_only',spent_usdc:55,
  net_acquired_ct:9.75,fill_count:1}
});
test('reconstruct a coherent hypothetical EUR BTC USDC CT chain without profit claims',()=>{
 const report=capitalJourneyReport(info,now);
 assert.equal(report.status,'coherent');
 assert.equal(report.coherent_usdc,true);
 assert.equal(report.read_only,true);
 const txt=report.lines.join(' ');
 for(const segment of ['EUR → BTC','BTC → USDC','USDC → CT','Concordance arithmétique USDC','NON PROUVÉS'])
  assert.ok(txt.includes(segment),segment);
 assert.match(txt,/ne démontre pas une traçabilité exhaustive/);
 assert.doesNotMatch(txt,/gain net certifié|ordre envoyé|conseil d'achat/);
});
test('if the USDC credit is not proven, never assert source of capital for CT',()=>{
 const x=capitalJourneyReport({...info,ledger:{...info.ledger,
  btcChain:{...info.ledger.btcChain,paired_usdc:false,credit_usdc:null}}},now);
 assert.equal(x.status,'partial');
 assert.equal(x.coherent_usdc,false);
 assert.match(x.lines.join(' '),/contrepartie USDC non démontrée/);
 assert.match(x.lines.join(' '),/aucun financement direct/);
});
test('if acquisitions do not match CT holdings, refuse the USDC subtraction',()=>{
 const x=capitalJourneyReport({...info,ct:7.75},now);
 assert.equal(x.coherent_usdc,false);
 assert.match(x.lines.join(' '),/achats et solde Concrete insuffisamment rapprochés/);
});
test('if USDC balance differs from accounting remainder, do not certify coherence',()=>{
 const x=capitalJourneyReport({...info,usdc:11},now);
 assert.equal(x.coherent_usdc,false);
 assert.match(x.lines.join(' '),/ne se réconcilient pas exactement/);
});
test('account older than 2 minutes cannot display prior private amounts',()=>{
 const x=capitalJourneyReport({...info,observedAt:new Date(now-125000).toISOString()},now);
 assert.equal(x.status,'unavailable');
 assert.doesNotMatch(x.lines.join(' '),/9,75|65|100,00/);
});
test('no owner-verifiable read-only source cannot display private positions',()=>{
 const x=capitalJourneyReport({...info,read_only:false},now);
 assert.equal(x.status,'unavailable');
});
test('expired ledger must not produce investment-flow claims',()=>{
 const x=capitalJourneyReport({...info,ledgerCheckedAt:now-2000000},now);
 assert.equal(x.status,'partial');assert.equal(x.coherent_usdc,false);
 assert.match(x.lines.join(' '),/historique absent|source historique absente/);
});
test('BTC mismatch is not reconciled even when CT costs and USDC match',()=>{
 const x=capitalJourneyReport({...info,btc:.0011},now);
 assert.equal(x.status,'partial');assert.equal(x.coherent_usdc,false);
 assert.match(x.lines.join(' '),/quantité restante non rapprochés/);
});
test('unknown CT acquisition cannot claim USDC financing',()=>{
 const x=capitalJourneyReport({...info,ctAcquisition:{status:'unknown'}},now);
 assert.equal(x.coherent_usdc,false);
});
test('existing OKX account hosts collapsed journey; no forced scrolling or asset switching',()=>{
 const source=fs.readFileSync(path.join(__dirname,'trader-okx-account.js'),'utf8');
 assert.match(source,/data-okx-capitalpath/);
 assert.match(source,/data-okx-capitalpathbody/);
 const listener=source.split('p.querySelector("[data-okx-capitalpath]")?.addEventListener("toggle",event=>{')[1]
  ?.split('p.querySelector("[data-okx-btcreadingdetails]")')[0]||'';
 assert.ok(listener.includes('updateCapitalJourney()'));
 assert.doesNotMatch(listener,/scrollIntoView|detailPanelToggle|atlasSelectMarketCoin|window.location|readForAccount/);
 assert.match(source,/lastCapitalEvidence=null;\s*const capital=q\("capitalpathbody"\)/);
});
test('USDC source not required to validate independent BTC and EUR ledger truth',()=>{
 const source=fs.readFileSync(path.join(__dirname,'trader-okx-account.js'),'utf8');
 assert.match(source,/const coreComplete=\['BTC','EUR'\]/);
 assert.match(source,/matches\.length===1&&credits\.length===1&&debits\.length===1&&coreComplete/);
 assert.match(source,/complete:coreComplete,usdcEntries:usdc/);
});
