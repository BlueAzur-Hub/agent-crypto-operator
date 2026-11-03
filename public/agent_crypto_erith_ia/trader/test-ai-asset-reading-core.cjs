'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createReading}=require('./ai-asset-reading-core.js');
const NOW=Date.parse('2026-10-21T06:30:00Z'),ISO=new Date(NOW-1000).toISOString();
function fixture(base='BTC',id='bitcoin',quote='USDC'){
 const pair=base+'-'+quote;
 return {
  selection:{symbol:base,id,quote},
  market:{id,symbol:base,priceUsd:base==='BTC'?82700:2443.1,
   change24h:1.5,usdSource:'CoinGecko USD',usdUpdatedAt:ISO},
  chart:{loadedInstrument:base+'-'+quote,mode:'candles',loadedBar:'5m',
   rows:[{o:80000,h:81000,l:79000,c:80500,v:10,t:NOW-30000}]},
  rules:{instId:pair,instType:'SPOT',state:'live',baseCcy:base,
   quoteCcy:quote,minSz:base==='BTC'?'0.0001':'0.001',
   lotSz:base==='BTC'?'0.00000001':'0.000001',tickSz:'0.1',
   observed_at_utc:ISO},
  book:{status:'ok',provider:'okx',pair,quote,
   observed_at_utc:ISO,bids:[['80000','0.01'],['79900','1']],
   asks:[['80010','0.02'],['80020','1']]},
  account:{instId:pair,read_only:true,orders_enabled:false,real_orders:0,
   verified:true,account_at_utc:ISO,
   trading_available_quote:'3.2',funding_available_quote:'1.18668749',
   fee_pair_verified:true,fee_maker_rate:'0.0008',fee_taker_rate:'0.001'},
  position:{pair,read_only:true,verified:true,orders_enabled:false,real_orders:0,
   observed_at_utc:ISO,trading_base:base==='BTC'?'0.002':'0.4',funding_base:'0.001'},
  now:NOW
 };
}
test('BTC dossier has complete CT-equivalent sections without touching CT',()=>{
 const doc=createReading(fixture());
 assert.equal(doc.status,'PAPER_READ_ONLY');
 assert.deepEqual(doc.sections.map(s=>s.label),[
  'Lecture Technique','Fiche publique','Position personnelle','Règles OKX',
  'Simulations de revente','Analyse Seven','Cas d école']);
 assert.equal(doc.asset.pair,'BTC-USDC');
 assert.equal(doc.public.best_bid_quote,'80000');
 assert.equal(doc.public.min_size_base,'0.0001');
 assert.equal(doc.private.trading_quote,'3.2');
 assert.equal(doc.private.funding_quote,'1.18668749');
 assert.equal(doc.private.trading_base,'0.002');
 assert.equal(doc.private.funding_base,'0.001');
 assert.equal(doc.private.fee_currency_verified,false);
 assert.equal(doc.private.max_buy_verified,false);
 assert.equal(doc.private.pnl_proven,false);
 assert.equal(doc.private.pnl,null);
 assert.equal(doc.orders_enabled,false);
 assert.equal(doc.transfer_enabled,false);
 assert.equal(doc.executable,false);
});
test('PAPER sale fractions use only Trading BTC, exact bid depth and preserve decimals',()=>{
 const doc=createReading(fixture());
 assert.deepEqual(doc.simulations.map(s=>s.percent),[25,50,100]);
 assert.deepEqual(doc.simulations.map(s=>s.quantity_base),['0.0005','0.001','0.002']);
 assert.deepEqual(doc.simulations.map(s=>s.gross_quote),['40','80','160']);
 for(const s of doc.simulations){
  assert.equal(s.status,'GROSS_ONLY');
  assert.equal(s.net_quote,null);
  assert.equal(s.orders_enabled,false);
 }
});
test('same engine works for ETH without treating it as CT or BTC',()=>{
 const f=fixture('ETH','ethereum');
 f.book.bids=[['2440','0.2'],['2439','1']];
 f.book.asks=[['2441','1']];
 const d=createReading(f);
 assert.equal(d.asset.base,'ETH');
 assert.equal(d.asset.pair,'ETH-USDC');
 assert.equal(d.private.trading_base,'0.4');
 assert.equal(d.simulations[0].quantity_base,'0.1');
 assert.equal(d.simulations[0].gross_quote,'244');
 assert.equal(d.orders_enabled,false);
});
test('Concrete legacy is protected, not overwritten by the generic reader',()=>{
 const d=createReading(fixture('CT','concrete'));
 assert.equal(d.status,'CT_PROTECTED');
 assert.equal(d.orders_enabled,false);
 assert.equal(d.sections.length,0);
 const legacy=fs.readFileSync(path.join(__dirname,'ai-ct-panel.js'),'utf8');
 assert.match(legacy,/Lire ma position CT\/USDC/);
 assert.match(legacy,/async function loadCtEvidence\(\)/);
 assert.doesNotMatch(legacy,/AgentCryptoAiAssetReading/);
});
test('wrong Market id is blocked; wrong chart never borrows OHLC',()=>{
 const f=fixture();f.market.id='ethereum';
 assert.equal(createReading(f).status,'MARKET_MISMATCH');
 const g=fixture();g.chart.loadedInstrument='CT-USDT';
 const d=createReading(g);
 assert.equal(d.public.chart_source_verified,false);
 assert.match(d.public.chart_warning,/différentes de BTC/);
 assert.equal(d.public.book_verified,true);
});
test('chart pairing alone is not a verified data source or timestamp',()=>{
 const f=fixture();
 const guess=createReading(f);
 assert.equal(guess.public.chart_identity_matched,true);
 assert.equal(guess.public.chart_source_verified,false);
 f.chart.source_verified=true;
 f.chart.provider='okx';
 f.chart.observed_at_utc=ISO;
 assert.equal(createReading(f).public.chart_source_verified,true);
 f.chart.observed_at_utc=new Date(NOW-3600000).toISOString();
 assert.equal(createReading(f).public.chart_source_verified,false);
});
test('account and base holding proofs must match the same exact Spot pair',()=>{
 const f=fixture();f.account.instId='CT-USDC';f.position.pair='CT-USDC';
 const d=createReading(f);
 assert.equal(d.private.quote_account_verified,false);
 assert.equal(d.private.base_position_verified,false);
 assert.equal(d.private.trading_base,null);
 assert.equal(d.private.trading_quote,null);
 assert.deepEqual(d.simulations.map(s=>s.status),Array(3).fill('POSITION_UNVERIFIED'));
});
test('Funding is separated and never sells or transfers automatically',()=>{
 const f=fixture();f.position.trading_base='0';f.position.funding_base='0.01';
 const d=createReading(f);
 assert.equal(d.private.total_base,'0.01');
 assert.equal(d.private.trading_base,'0');
 assert.deepEqual(d.simulations.map(s=>s.status),Array(3).fill('FUNDING_ONLY'));
});
test('verified zero remains zero while an absent balance stays unknown',()=>{
 const f=fixture();f.position.trading_base='0';f.position.funding_base='0';
 const d=createReading(f);
 assert.equal(d.private.base_position_verified,true);
 assert.equal(d.private.total_base,'0');
 assert.equal(d.simulations[0].status,'NO_TRADING_POSITION');
 f.position.trading_base=null;
 const u=createReading(f);
 assert.equal(u.private.base_position_verified,false);
 assert.equal(u.private.total_base,null);
});
test('minimum lot filter applies separately to fractional sales',()=>{
 const f=fixture();f.position.trading_base='0.0002';f.position.funding_base='0';
 const d=createReading(f);
 assert.equal(d.simulations[0].status,'BELOW_MINIMUM');
 assert.equal(d.simulations[0].quantity_base,'0.00005');
 assert.equal(d.simulations[1].status,'GROSS_ONLY');
});
test('public book wrong pair, quote, crossed, stale or thin refuses gross valuation',()=>{
 for(const mutate of [
  f=>{f.book.pair='CT-USDC';},
  f=>{f.book.quote='USDT';},
  f=>{f.book.bids=[['90000','1']];},
  f=>{f.book.observed_at_utc=new Date(NOW-60000).toISOString();},
  f=>{f.book.bids=[['80000','0.00001']];}
 ]){
  const f=fixture();mutate(f);const d=createReading(f);
  if(d.public.book_verified===false)
   assert.deepEqual(d.simulations.map(s=>s.status),Array(3).fill('PUBLIC_EVIDENCE_MISSING'));
  else assert.equal(d.simulations[2].status,'BOOK_DEPTH_INSUFFICIENT');
  assert.equal(d.simulations[2].net_quote,null);
 }
});
test('fee rate alone cannot certify fee currency or realized net',()=>{
 const f=fixture();f.account.fee_pair_verified=true;
 const d=createReading(f);
 assert.equal(d.private.maker_rate,'0.0008');
 assert.equal(d.private.taker_rate,'0.001');
 assert.equal(d.private.fee_currency_verified,false);
 assert.equal(d.simulations[2].net_quote,null);
});
test('stale account/rules and invalid numeric values fail closed',()=>{
 const f=fixture();f.account.account_at_utc=new Date(NOW-180000).toISOString();
 f.rules.observed_at_utc=new Date(NOW-180000).toISOString();
 f.position.trading_base='1.2e-3';
 const d=createReading(f);
 assert.equal(d.private.quote_account_verified,false);
 assert.equal(d.public.rules_verified,false);
 assert.equal(d.private.base_position_verified,false);
 assert.equal(d.simulations[0].status,'POSITION_UNVERIFIED');
});


test('Seven BTC and ETH use CT-origin shared Spot filter values, not a second rules algorithm',()=>{
 const contract=require('./ai-ct-contract.js');
 for(const [base,id] of [['BTC','bitcoin'],['ETH','ethereum']]){
  const f=fixture(base,id);
  const validated=contract.spotTradingRulesFor({base,quote:'USDC',venue:'okx'},f.rules,f.now);
  const study=createReading(f);
  assert.equal(validated.status,'verified');
  assert.equal(study.public.rules_verified,true);
  assert.equal(study.public.min_size_base,validated.min_sz);
  assert.equal(study.public.lot_size_base,validated.lot_sz);
  assert.equal(study.public.tick_size_quote,validated.tick_sz);
  assert.equal(study.asset.pair,validated.market);
 }
});
test('Seven cannot use a different quote, paused venue or missing base/quote evidence',()=>{
 const f=fixture('ETH','ethereum');
 for(const altered of [
  {...f.rules,baseCcy:'BTC'},
  {...f.rules,quoteCcy:'USDT'},
  {...f.rules,state:'suspend'},
  {...f.rules,baseCcy:undefined},
  {...f.rules,lotSz:'0.0000000000000000001'}
 ]){
  const d=createReading({...f,rules:altered});
  assert.equal(d.public.rules_verified,false);
  assert.deepEqual(d.simulations.map(x=>x.status),Array(3).fill('PUBLIC_EVIDENCE_MISSING'));
  assert.equal(d.orders_enabled,false);
 }
});


test('Seven can reuse CT purchase receipts for ETH without claiming a realized profit',()=>{
 const f=fixture('ETH','ethereum');
 f.position.trading_base='2';f.position.funding_base='0';
 f.fills={ok:true,read_only:true,fills_3m:[{instId:'ETH-USDC',
   side:'buy',tradeId:'eth-1',fillPx:'2400',fillSz:'2',
   fee:'0',feeCcy:'USDC'}]};
 const result=createReading(f);
 assert.equal(result.acquisition_receipts?.status,'reconciled_fills_only');
 assert.equal(result.acquisition_receipts?.market,'ETH-USDC');
 assert.equal(result.acquisition_receipts?.spent_quote,4800);
 assert.equal(result.acquisition_receipts?.profit_proven,false);
 assert.equal(result.private.acquisition_cost_proven,false);
 assert.equal(result.private.pnl,null);
 assert.equal(result.orders_enabled,false);
});
test('Seven never borrows receipts from another pair, venue, or unverified position',()=>{
 const f=fixture('BTC','bitcoin');
 f.position.trading_base='0.002';f.position.funding_base='0';
 f.fills={ok:true,read_only:true,fills_3m:[{instId:'CT-USDC',
   side:'buy',tradeId:'ct-1',fillPx:'0.35',fillSz:'0.002',
   fee:'0',feeCcy:'CT'}]};
 assert.equal(createReading(f).acquisition_receipts.status,'unknown');
 f.fills.fills_3m[0].instId='BTC-USDC';
 f.fills.fills_3m[0].feeCcy='BTC';
 f.selection.provider='bitget';
 assert.equal(createReading(f).acquisition_receipts,null);
 f.selection.provider='okx';
 f.position.trading_base=null;
 assert.equal(createReading(f).acquisition_receipts,null);
});
test('receipt proof remains UNKNOWN if tiny BTC holdings do not reconcile precisely',()=>{
 const f=fixture('BTC','bitcoin');
 f.position.trading_base='0.0002';f.position.funding_base='0';
 f.fills={ok:true,read_only:true,fills_3m:[{instId:'BTC-USDC',
   side:'buy',tradeId:'btc-1',fillPx:'85000',fillSz:'0.0001995',
   fee:'0',feeCcy:'BTC'}]};
 const result=createReading(f);
 assert.equal(result.acquisition_receipts.status,'unknown');
 assert.equal(result.private.acquisition_cost_proven,false);
});


test('Seven reading reuses CT remaining classifier for BTC and never assumes an order was sent',()=>{
 const f=fixture('BTC','bitcoin');
 f.position.trading_base='0.000230001';f.position.funding_base='0';
 const d=createReading(f);
 assert.equal(d.private.base_position_verified,true);
 assert.equal(d.private.holding_status,'SIZE_FILTER_MATCHES');
 assert.equal(d.private.sellable_size_base,'0.00023');
 assert.equal(d.private.residual_base,'0.000000001');
 assert.equal(d.orders_enabled,false);
 assert.equal(d.executable,false);
});
test('after a verified sale, zero means EMPTY; incomplete proof remains UNKNOWN',()=>{
 const f=fixture('ETH','ethereum');
 f.position.trading_base='0';f.position.funding_base='0';
 const empty=createReading(f);
 assert.equal(empty.private.holding_status,'EMPTY');
 assert.equal(empty.private.total_base,'0');
 assert.equal(empty.private.sellable_size_base,null);
 f.position.funding_base=null;
 const unproved=createReading(f);
 assert.equal(unproved.private.holding_status,'UNKNOWN');
 assert.equal(unproved.private.base_position_verified,false);
 assert.equal(unproved.private.total_base,null);
});
test('different pair, stale rules and missing market never manufacture a sellable size',()=>{
 const f=fixture('ETH','ethereum');f.position.trading_base='0.004';f.position.funding_base='0';
 f.rules.minSz='0.01';
 assert.equal(createReading(f).private.holding_status,'DUST');
 f.rules.instId='CT-USDC';
 assert.equal(createReading(f).private.holding_status,'RULES_UNVERIFIED');
 f.rules.instId='ETH-USDC';
 f.position.pair='BTC-USDC';
 assert.equal(createReading(f).private.holding_status,'UNKNOWN');
});


test('a position missing the explicit no-order proof remains UNKNOWN',()=>{
 const f=fixture('BTC','bitcoin');
 delete f.position.orders_enabled;
 assert.equal(createReading(f).private.holding_status,'UNKNOWN');
});


test('Seven BTC and ETH 25/50/100 use the Concrete depth owner, gross only without fee currency proof',()=>{
 const ct=require('./ai-ct-contract.js');
 for(const [base,id,qty,bid] of [
  ['BTC','bitcoin','0.002','80000'],
  ['ETH','ethereum','0.4','2400']
 ]){
  const f=fixture(base,id);
  f.position.trading_base=qty;f.position.funding_base='0';
  f.book.bids=[[bid,'1']];f.book.asks=[[String(Number(bid)+1),'1']];
  const d=createReading(f);
  assert.deepEqual(d.simulations.map(x=>x.status),['GROSS_ONLY','GROSS_ONLY','GROSS_ONLY']);
  for(const row of d.simulations){
   const shared=ct.spotBookEstimateFor({base,quote:'USDC',venue:'okx'},
     f.book,row.quantity_base,null,f.now);
   assert.equal(shared.status,'indicative');
   assert.equal(row.gross_quote,shared.gross_quote);
   assert.equal(row.net_quote,null);
   assert.equal(row.estimated_fee_quote,null);
   assert.equal(row.orders_enabled,false);
  }
 }
});
test('net PAPER needs both pair-specific rate and certified fee debit currency',()=>{
 const f=fixture('ETH','ethereum');
 f.book.bids=[['2400','2']];f.book.asks=[['2401','2']];
 f.position.trading_base='0.4';f.position.funding_base='0';
 f.account.fee_currency_verified=true;
 f.account.fee_currency='USDC';
 const doc=createReading(f);
 assert.deepEqual(doc.simulations.map(x=>x.status),Array(3).fill('NET_HYPOTHESIS'));
 assert.equal(doc.simulations[2].gross_quote,'960');
 assert.equal(doc.simulations[2].estimated_fee_quote,'0.96');
 assert.equal(doc.simulations[2].net_quote,'959.04');
 assert.equal(doc.simulations[2].remaining_base,'0');
 assert.equal(doc.private.fee_currency_verified,true);
 assert.equal(doc.private.pnl_proven,false);
 assert.equal(doc.private.pnl,null);
 assert.equal(doc.executable,false);
 f.account.fee_currency='ETH';
 const otherCurrency=createReading(f);
 assert.deepEqual(otherCurrency.simulations.map(x=>x.status),Array(3).fill('GROSS_ONLY'));
 assert.equal(otherCurrency.private.fee_currency_verified,false);
 f.account.fee_currency='USDC';f.account.fee_pair_verified=false;
 assert.deepEqual(createReading(f).simulations.map(x=>x.net_quote),[null,null,null]);
});
test('gross cannot be borrowed from another venue, a different book or an expired market',()=>{
 const f=fixture('BTC','bitcoin');
 f.position.trading_base='0.002';f.position.funding_base='0';
 for(const changed of [
  {...f.book,pair:'CT-USDC'},
  {...f.book,provider:'bitget'},
  {...f.book,observed_at_utc:new Date(NOW-45000).toISOString()},
  {...f.book,bids:[['80000','0.0001']]}
 ]){
  const d=createReading({...f,book:changed});
  assert.deepEqual(d.simulations.map(x=>x.net_quote),[null,null,null]);
  assert.equal(d.simulations[2].gross_quote,null);
  assert.equal(d.orders_enabled,false);
 }
});


test('native Microscope accepted source/date/pair makes Seven trust its public candles without a second fetch',()=>{
 const f=fixture('ETH','ethereum');
 f.chart={...f.chart,source:'OKX public candles',
  request_key:'ETH-USDC|5m',lastLoadedAt:ISO,loading:false,errorCode:null};
 const d=createReading(f);
 assert.equal(d.public.chart_source_verified,true);
 assert.equal(d.public.chart_provider,'okx');
 assert.equal(d.public.chart_same_spot_pair,true);
 assert.equal(d.public.chart_warning,null);
 assert.match(d.sections[0].details,/paire identique au Spot ETH-USDC/);
 assert.doesNotMatch(d.sections[0].details,/distincte du Spot/);
 assert.equal(d.orders_enabled,false);
});
test('Bitget DNA 5m native candles are dated, but never mistaken for OKX-private balances',()=>{
 const f=fixture('DNA','new-listing:bitget:dnausdt','USDT');
 f.selection.provider='bitget';f.position=null;f.account=null;f.rules=null;f.book=null;
 f.market={id:f.selection.id,symbol:'DNA',priceUsd:0.227363,
  usdSource:'Bitget DNA/USDT × USDT/USD CoinGecko',usdUpdatedAt:ISO};
 f.chart={mode:'candles',loadedInstrument:'DNA-USDT',loadedBar:'5m',
  request_key:'bitget|DNA-USDT|5m',source:'Bitget public candles',
  lastLoadedAt:ISO,loading:false,errorCode:null,
  rows:[{o:0.22762,h:0.22765,l:0.2273,c:0.22758,v:19440.14,t:NOW-30000}]};
 const d=createReading(f);
 assert.equal(d.status,'PAPER_READ_ONLY');
 assert.equal(d.public.chart_source_verified,true);
 assert.equal(d.public.chart_provider,'bitget');
 assert.equal(d.public.market_price_usd,'0.227363');
 assert.equal(d.public.market_timestamp_verified,true);
 assert.match(d.sections[0].details,/paire identique au Spot DNA-USDT/);
 assert.equal(d.private.base_position_verified,false);
 assert.equal(d.orders_enabled,false);
});
test('real historical quote divergence only when pair differs, not on matching pair',()=>{
 const f=fixture('ETH','ethereum');
 f.chart.loadedInstrument='ETH-USDT';
 const d=createReading(f);
 assert.equal(d.public.chart_identity_matched,true);
 assert.equal(d.public.chart_same_spot_pair,false);
 assert.match(d.public.chart_warning,/Graphique ETH-USDT distinct du Spot ETH-USDC/);
 assert.match(d.sections[0].details,/paire distincte du Spot ETH-USDC/);
});
test('untrusted or stale Microscope source does not receive public proof',()=>{
 const f=fixture('BTC','bitcoin');
 f.chart={...f.chart,source:'OKX public candles',request_key:'BTC-USDC|5m',
  lastLoadedAt:ISO,loading:false,errorCode:null};
 assert.equal(createReading(f).public.chart_source_verified,true);
 for(const change of [
  {source:'Unattributed candles'},
  {lastLoadedAt:new Date(NOW-900000).toISOString()},
  {request_key:null},
  {errorCode:'MARKET_CANDLES_LOAD_FAILED'},
  {loading:true}
 ]){
  const d=createReading({...f,chart:{...f.chart,...change}});
  assert.equal(d.public.chart_source_verified,false);
  assert.equal(d.orders_enabled,false);
 }
});
test('stale or unattributed Market quote is not presented as confirmed',()=>{
 const f=fixture('ETH','ethereum');
 f.market.usdUpdatedAt=new Date(NOW-300000).toISOString();
 assert.equal(createReading(f).public.market_price_usd,null);
 f.market.usdUpdatedAt=ISO;f.market.usdSource=null;
 assert.equal(createReading(f).public.market_price_usd,null);
 f.market.usdSource='CoinGecko USD';
 assert.equal(createReading(f).public.market_price_usd,'2443.1');
});
