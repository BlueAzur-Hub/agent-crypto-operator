'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const api=require('./ai-ct-contract.js');
const now=Date.UTC(2026,9,13,5,0,0);
const acct={ok:true,read_only:true,fetched_at:new Date(now).toISOString(),trading:[{details:[{ccy:'CT',cashBal:'9.99'}]}],funding:[]};
const fills={ok:true,read_only:true,fills_3m:[{instId:'CT-USDC',side:'buy',tradeId:'123',fillPx:'0.3522',fillSz:'10',fee:'-0.01',feeCcy:'CT'}]};
const fees={ok:true,read_only:true,instId:'CT-USDC',fees:[{taker:'-0.002'}]};
const book={status:'ok',provider:'okx',pair:'CT-USDC',quote:'USDC',observed_at_utc:new Date(now-1500).toISOString(),bids:[['0.355','100']]};
test('solde OKX CT et coût acquisition net reconcilié',()=>{
 const r=api.compose({account:acct,fills,fees,book},now);
 assert.equal(r.position.qty_ct,9.99);assert.equal(r.acquisition.status,'reconciled_fills_only');
 assert.ok(Math.abs(r.acquisition.spent_usdc-3.522)<1e-9);assert.equal(r.fee_taker_fraction,.002);
 assert.ok(r.pnl_illustrative_usdc!==null); assert.equal(r.orders_enabled,false);
});
test('sans solde vérifié, refus',()=>assert.throws(()=>api.compose({account:{},fills,fees,book},now)));
test('ne jamais confondre CT-USDT et CT-USDC',()=>{
 const r=api.compose({account:acct,fills,fees,book:{...book,pair:'CT-USDT'}},now);
 assert.equal(r.liquidation_illustrative.status,'unknown');assert.equal(r.pnl_illustrative_usdc,null);
});
test('carnet périmé et profondeur insuffisante refusés',()=>{
 const stale=api.compose({account:acct,fills,fees,book:{...book,observed_at_utc:new Date(now-23000).toISOString()}},now);
 assert.equal(stale.pnl_illustrative_usdc,null);
 const shallow=api.compose({account:acct,fills,fees,book:{...book,bids:[['0.355','4']] }},now);
 assert.equal(shallow.pnl_illustrative_usdc,null);
});
test('frais non prouvés, pas de gain chiffré',()=>{
 const r=api.compose({account:acct,fills,fees:null,book},now);
 assert.equal(r.fee_taker_fraction,null);assert.equal(r.pnl_illustrative_usdc,null);
});
test('solde et transactions discordants, pas de coût annoncé',()=>{
 const r=api.compose({account:{...acct,trading:[{details:[{ccy:'CT',cashBal:'8'}]}]},fills,fees,book},now);
 assert.equal(r.acquisition.status,'unknown');assert.equal(r.pnl_illustrative_usdc,null);
});
test('vendre sur prix acheteur, consommation de plusieurs niveaux',()=>{
 const r=api.compose({account:acct,fills,fees,book:{...book,bids:[['0.355','4'],['0.354','9']] }},now);
 assert.equal(r.liquidation_illustrative.status,'indicative');
 assert.ok(r.liquidation_illustrative.net_usdc>0);
});
test('pas de solde zéro imaginaire lorsque CT absent',()=>{
 const r=api.compose({account:{...acct,trading:[]},fills,fees,book},now);
 assert.equal(r.position.qty_ct,null);assert.equal(r.pnl_illustrative_usdc,null);
});
test('fills partiellement disponibles => coûts non prouvés',()=>{
 const r=api.compose({account:acct,fills:{...fills,fills_3m:[]},fees,book},now);
 assert.equal(r.acquisition.status,'unknown');assert.equal(r.pnl_illustrative_usdc,null);
});
test('en cas de vente partielle, calcul d’acquisition refuse',()=>{
 const r=api.compose({account:acct,fills:{...fills,fills_3m:[...fills.fills_3m,{...fills.fills_3m[0],side:'sell',tradeId:'125'}]},fees,book},now);
 assert.equal(r.acquisition.status,'unknown');
});
test('solde périmé refusé',()=>{
 const old={...acct,fetched_at:new Date(now-180000).toISOString()};
 assert.throws(()=>api.compose({account:old,fills,fees,book},now),/ancien/);
});
test('frais manquants sur execution refusés',()=>{
 const missing={...fills,fills_3m:[{...fills.fills_3m[0],fee:undefined}]};
 const r=api.compose({account:acct,fills:missing,fees,book},now);
 assert.equal(r.acquisition.status,'unknown');
});

test('un relevé privé commun expose BTC, CT, USDC, EUR sans conversion',()=>{
 const mixed={...acct,trading:[{details:[{ccy:'CT',cashBal:'9.99'},{ccy:'BTC',cashBal:'0.0001'},{ccy:'USDC',cashBal:'0.6'}]}],funding:[{ccy:'EUR',bal:'10'},{ccy:'BTC',bal:'0.00002'}]};
 const r=api.compose({account:mixed,fills,fees,book},now);
 assert.equal(r.portfolio.assets.CT.qty,9.99);
 assert.ok(Math.abs(r.portfolio.assets.BTC.qty-0.00012)<1e-12);
 assert.equal(r.portfolio.assets.USDC.qty,.6);
 assert.equal(r.portfolio.assets.EUR.qty,10);
 assert.equal(r.portfolio.read_only,true);assert.equal(r.orders_enabled,false);
});
test('devise absente non convertie en solde fictif zéro',()=>{
 const r=api.compose({account:acct,fills,fees,book},now);
 assert.equal(r.portfolio.assets.BTC.qty,null);
 assert.equal(r.portfolio.assets.BTC.verified,false);
});
test('BTC non valide reste inconnu, CT vérifié reste exploitable',()=>{
 const invalid={...acct,trading:[{details:[{ccy:'CT',cashBal:'9.99'},{ccy:'BTC',cashBal:'unknown'}]}]};
 const r=api.compose({account:invalid,fills,fees,book},now);
 assert.equal(r.portfolio.assets.CT.qty,9.99);
 assert.equal(r.portfolio.assets.BTC.qty,null);
});
test('un faux relevé privé est refusé',()=>assert.throws(()=>api.portfolio({ok:true,read_only:false}),/non vérifié/));

test('Seven relie solde CT, frais, revente et fenêtre publique sans ordre',()=>{
 const doc=api.compose({account:acct,fills,fees,book},now);
 assert.equal(doc.exit_metrics.best_bid_usdc_ct,.355);
 assert.ok(Math.abs(doc.exit_metrics.weighted_exit_usdc_ct-.355)<1e-10);
 assert.equal(doc.exit_metrics.book_impact_pct,0);
 const candles=api.publicCandles({mode:'candles',loadedInstrument:'CT-USDT',loadedBar:'5m',rows:[
   {t:now-300000,c:.32,v:10},{t:now-60000,c:.34,v:20}],source:'OKX CT-USDT'},now);
 assert.equal(candles.status,'observed');
 const report=api.explain(doc,candles);
 assert.equal(report.read_only,true);
 assert.match(report.lines.join(' '),/Revente FICTIVE/);
 assert.match(report.lines.join(' '),/Contexte marché public/);
 assert.match(report.lines.join(' '),/aucune exécution garantie/i);
});
test('deux niveaux du carnet impliquent un impact et un spread mesurés',()=>{
 const b={...book,bids:[['0.355','4'],['0.350','12']],asks:[['0.360','20']]};
 const doc=api.compose({account:acct,fills,fees,book:b},now);
 assert.ok(doc.exit_metrics.book_impact_pct>0);
 assert.ok(doc.exit_metrics.spread_pct>0);
 assert.ok(doc.exit_metrics.weighted_exit_usdc_ct<doc.exit_metrics.best_bid_usdc_ct);
});
test('carnet expiré ou acquisition non prouvée : refus de faux gains',()=>{
 const stale=api.compose({account:acct,fills,fees,book:{...book,observed_at_utc:new Date(now-45000).toISOString()}},now);
 assert.equal(stale.exit_metrics,null);
 assert.match(api.explain(stale).lines.join(' '),/Revente fictive NON CALCULABLE/);
 const missing=api.compose({account:acct,fills:null,fees,book},now);
 assert.match(api.explain(missing).lines.join(' '),/Coût d’acquisition NON PROUVÉ/);
 assert.match(api.explain(missing).lines.join(' '),/Gain \/ perte NON CALCULABLE/);
});
test('aucune bougie BTC ou en mode Ligne sous le titre CT/USDT',()=>{
 const snap={mode:'candles',loadedInstrument:'BTC-USDT',loadedBar:'5m',rows:[
   {t:now-100000,c:100,v:12},{t:now-1000,c:101,v:5}]};
 assert.equal(api.publicCandles(snap,now).status,'unavailable');
 assert.equal(api.publicCandles({...snap,loadedInstrument:'CT-USDT',mode:'native'},now).status,'unavailable');
});
test('courbe publique ancienne ou horodatage incohérent non validés',()=>{
 const old={mode:'candles',loadedInstrument:'CT-USDT',loadedBar:'5m',rows:[
   {t:now-3600000,c:.31,v:10},{t:now-3300000,c:.32,v:15}]};
 assert.equal(api.publicCandles(old,now).status,'stale');
 assert.equal(api.publicCandles({...old,rows:[old.rows[1],old.rows[0]]},now).status,'unavailable');
 const doc=api.compose({account:acct,fills,fees,book},now);
 assert.match(api.explain(doc,api.publicCandles(old,now)).lines.join(' '),/trop ancien/);
});
test('un faux contrat privé ne produit pas de rapport Seven',()=>{
 assert.throws(()=>api.explain({schema:'public',read_only:false}),/non validé/);
});
