/* ERITH.IA · Seven · contrat de dossier multi-actifs PAPER.
 * Pur, sans transport, mutation ni accès au compte. Le panneau CT existant
 * reste propriétaire exclusif de Concrete, de son historique et de ses calculs.
 * Aucun statut ici ne permet d'envoyer un ordre.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.AgentCryptoAiAssetReading=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const UNIT=10n**18n,MAX_AGE=120000,BOOK_AGE=20000;
 const pattern=/^(?:0|[1-9]\d{0,18})(?:\.\d{1,18})?$/;
 const raw=v=>typeof v==='string'?v:typeof v==='number'&&Number.isFinite(v)?String(v):null;
 function scaled(value){
  const s=raw(value);
  if(!s||!pattern.test(s))return null;
  const [a,b='']=s.split('.');
  return BigInt(a)*UNIT+BigInt(b.padEnd(18,'0'));
 }
 function print(v){
  if(typeof v!=='bigint')return null;
  const sign=v<0n?'-':'',n=v<0n?-v:v;
  return sign+String(n/UNIT)+(n%UNIT===0n?'':'.'+String(n%UNIT).padStart(18,'0').replace(/0+$/,''));
 }
 function time(value,now,age=MAX_AGE){
  const t=Date.parse(typeof value==='string'?value:'');
  return Number.isFinite(now)&&Number.isFinite(t)&&t<=now+30000&&now-t<=age;
 }
 const frozen=(o)=>Object.freeze(o);
 function blocked(reason,code='INCOMPLETE'){
  return frozen({schema:'erith.seven.asset-reading.v1',status:code,
    reason,read_only:true,orders_enabled:false,executable:false,
    sections:frozen([]),simulations:frozen([])});
 }
 function entry(label,status,details){
  return frozen({label,status,details:String(details||'')});
 }
 function validateBook(book,pair,quote,now){
  if(book?.status!=='ok'||book?.provider!=='okx'||book.pair!==pair||
     book.quote!==quote||!time(book.observed_at_utc,now,BOOK_AGE))return null;
  if(!Array.isArray(book.bids)||!book.bids.length||
     !Array.isArray(book.asks)||!book.asks.length)return null;
  const parseSide=(rows,descending)=>{
   let prev=null;
   const out=[];
   for(const row of rows.slice(0,100)){
    if(!Array.isArray(row)||row.length<2)return null;
    const price=scaled(row[0]),quantity=scaled(row[1]);
    if(price===null||quantity===null||price<=0n||quantity<=0n)return null;
    if(prev!==null&&(descending?price>prev:price<prev))return null;
    out.push(frozen({price,quantity}));prev=price;
   }
   return out;
  };
  const bids=parseSide(book.bids,true),asks=parseSide(book.asks,false);
  if(!bids||!asks||bids[0].price>=asks[0].price)return null;
  return frozen({bids:frozen(bids),asks:frozen(asks),
    observed_at_utc:book.observed_at_utc,provider:'OKX public'});
 }
 // Consume the same validated OKX rules as Concrete, not a second validator.
 // The browser contract is mounted by Trader; Node loads it only for tests.
 function commonSpotRules(){
  const shared=globalThis.AgentCryptoAiCtContract;
  if(typeof shared?.spotTradingRulesFor==='function')return shared;
  if(typeof module==='object'&&module.exports&&typeof require==='function')
    return require('./ai-ct-contract.js');
  return null;
 }
 function validateRules(rules,pair,base,quote,now){
  const owner=commonSpotRules();
  if(!rules||rules.instId!==pair||rules.instType!=='SPOT'||
     rules.baseCcy!==base||rules.quoteCcy!==quote||
     typeof owner?.spotTradingRulesFor!=='function')return null;
  const proof=owner.spotTradingRulesFor({base,quote,venue:'okx'},rules,now);
  if(proof?.status!=='verified'||proof.state!=='live'||
    proof.market!==pair)return null;
  const min=scaled(proof.min_sz),lot=scaled(proof.lot_sz),tick=scaled(proof.tick_sz);
  if(min===null||lot===null||tick===null||min<=0n||lot<=0n||tick<=0n)return null;
  return frozen({minimum:min,lot,tick,observed_at_utc:proof.checked_at,
   source:'OKX Public Data · Spot rules',market:pair});
 }
 function quoteAccount(data,pair,now){
  const quote=pair.split('-')[1];
  if(data?.instId!==pair||data?.read_only!==true||
     data?.orders_enabled!==false||data?.real_orders!==0||
     data?.verified!==true||!time(data.account_at_utc,now))return null;
  const trading=scaled(data.trading_available_quote);
  if(trading===null)return null;
  const funding=scaled(data.funding_available_quote);
  const pairFees=data.fee_pair_verified===true;
  const maker=pairFees?scaled(data.fee_maker_rate):null;
  const taker=pairFees?scaled(data.fee_taker_rate):null;
  return frozen({quote,trading:print(trading),funding:print(funding),
    maker_rate:maker===null?null:print(maker),
    taker_rate:taker===null?null:print(taker),
    fee_currency_verified:data.fee_currency_verified===true&&
      data.fee_currency===quote&&pairFees,
    observed_at_utc:data.account_at_utc,max_buy_verified:false});
 }
 function basePosition(position,pair,now){
  if(position?.pair!==pair||position?.read_only!==true||position?.verified!==true||
    !time(position.observed_at_utc,now))return null;
  const trading=scaled(position.trading_base),funding=scaled(position.funding_base);
  // Both subaccounts are required: missing does not imply zero.
  if(trading===null||funding===null)return null;
  return frozen({trading, funding,total:trading+funding,
    observed_at_utc:position.observed_at_utc});
 }
 // The CT contract owns both Spot rules and the native bid-depth walk.
 // Seven supplies validated identity, position, public evidence and fee proof.
 function fractions({base,quote,position,book,rawBook,rules,account,now}){
  const percentages=[25,50,100],rows=[];
  const owner=commonSpotRules();
  for(const percent of percentages){
   const unavailable=(status,detail,qty=null)=>frozen({percent,status,detail,
     quantity_base:qty,gross_quote:null,net_quote:null,
     estimated_fee_quote:null,remaining_base:null,orders_enabled:false});
   if(!position){rows.push(unavailable('POSITION_UNVERIFIED','Solde '+base+' non prouvé.'));continue;}
   if(position.trading===0n){
    rows.push(unavailable(position.funding>0n?'FUNDING_ONLY':'NO_TRADING_POSITION',
      position.funding>0n?'Fonds '+base+' uniquement en Funding ; aucun transfert automatique.':
      'Aucun '+base+' disponible en Trading.'));continue;
   }
   if(!rules||!book||!rawBook||typeof owner?.spotBookEstimateFor!=='function'){
    rows.push(unavailable('PUBLIC_EVIDENCE_MISSING',
      'Carnet récent et règles Spot exactes nécessaires.'));continue;
   }
   const proposed=position.trading*BigInt(percent)/100n;
   const qty=proposed/rules.lot*rules.lot;
   if(qty<rules.minimum){
    rows.push(unavailable('BELOW_MINIMUM',
      'Sous minSz/lotSz ; aucune vente admissible.',print(qty)));continue;
   }
   const feeRate=account?.fee_currency_verified===true&&
     account.quote===quote&&account.taker_rate!==null?
     Number(account.taker_rate):null;
   // Limit the same raw bids to the 100 levels that were certified above.
   const source={...rawBook,bids:rawBook.bids.slice(0,book.bids.length)};
   const estimate=owner.spotBookEstimateFor(
     {base,quote,venue:'okx'},source,print(qty),feeRate,now);
   if(estimate?.status!=='indicative'){
     rows.push(unavailable(estimate?.reason?.includes('Profondeur')?
       'BOOK_DEPTH_INSUFFICIENT':'PUBLIC_EVIDENCE_MISSING',
       estimate?.reason||'Carnet insuffisant',print(qty)));continue;
   }
   const net=account?.fee_currency_verified===true?estimate.net_quote:null;
   rows.push(frozen({percent,status:net===null?'GROSS_ONLY':'NET_HYPOTHESIS',
     detail:net===null?
       'Produit brut fictif sur carnet daté ; frais de débit, net et exécution non certifiés.':
       'Net PAPER hypothétique avec frais en devise de cotation attestée ; ordre non garanti.',
     quantity_base:print(qty),gross_quote:estimate.gross_quote,
     net_quote:net,estimated_fee_quote:net===null?null:estimate.fee_quote,
     remaining_base:print(position.trading-qty),
     orders_enabled:false}));
  }
  return frozen(rows);
 }
 function createReading({selection,market,chart,book,rules,account,position,fills=null,now=Date.now()}={}){
  const base=String(selection?.symbol||'').toUpperCase(),
    coinId=String(selection?.id||''),quote=String(selection?.quote||'USDC').toUpperCase();
  if(!/^[A-Z][A-Z0-9]{0,19}$/.test(base)||!coinId||!['USDC','USDT','EUR'].includes(quote))
    return blocked('Identité de la cryptomonnaie ou devise de cotation non qualifiée.','IDENTITY_UNVERIFIED');
  if(base==='CT')return blocked('Concrete (CT) reste géré exclusivement par sa Lecture Technique restaurée.','CT_PROTECTED');
  const pair=base+'-'+quote;
  if(market&&((market.id&&market.id!==coinId)||
    (market.symbol&&String(market.symbol).toUpperCase()!==base)))
    return blocked('Fiche Market appartenant à une autre cryptomonnaie.','MARKET_MISMATCH');
  const chartPair=String(chart?.loadedInstrument||'').toUpperCase().replace('/','-');
  const chartParts=chartPair.match(/^([A-Z0-9]{1,20})-([A-Z0-9]{2,12})$/);
  const chartValid=chartParts&&chartParts[1]===base&&chart?.mode==='candles'&&
    Array.isArray(chart.rows)&&chart.rows.length>0;
  // The native Microscope publishes lastLoadedAt/source/request_key, not the
  // older source_verified/observed_at_utc keys. Keep both contracts explicit.
  const sourceText=String(chart?.source||'').trim();
  const nativeSource=sourceText.match(/^(OKX|Bitget|Binance|CoinGecko)\b/i);
  const nativeProvider=nativeSource?.[1]?.toLowerCase()||null;
  const nativeProof=Boolean(chartValid&&nativeProvider&&
    typeof chart?.request_key==='string'&&chart.request_key.length>0&&
    typeof chart?.loadedBar==='string'&&chart.loadedBar.length>0&&
    chart?.loading===false&&!chart?.errorCode&&
    time(chart?.lastLoadedAt,now));
  const explicitProof=Boolean(chartValid&&chart?.source_verified===true&&
    ['okx','binance','bitget','coingecko'].includes(String(chart?.provider||'').toLowerCase())&&
    time(chart?.observed_at_utc,now));
  const chartProvenance=nativeProof||explicitProof;
  const chartProvider=nativeProof?nativeProvider:
    explicitProof?String(chart.provider).toLowerCase():null;
  const marketFresh=Boolean(time(market?.usdUpdatedAt||market?.lastUpdated,now)&&
    typeof market?.usdSource==='string'&&market.usdSource.trim());
  const mPrice=marketFresh?scaled(market?.priceUsd):null;
  const validBook=validateBook(book,pair,quote,now),
    validRules=validateRules(rules,pair,base,quote,now),
    validAccount=quoteAccount(account,pair,now),
    validPosition=basePosition(position,pair,now);
  // Private receipts are opt-in inputs only. Reuse the existing CT
  // reconciliation, but do not turn partial fills into proven lifetime P&L.
  const owner=commonSpotRules();
  const amount=validPosition?Number(print(validPosition.total)):NaN;
  const receipt=validPosition&&fills&&Number.isFinite(amount)&&
    (!selection?.provider||String(selection.provider).toLowerCase()==='okx')&&
    typeof owner?.acquisitionFor==='function'
      ?owner.acquisitionFor({base,quote,venue:'okx'},fills,amount):null;
  const remaining=typeof owner?.remainingFor==='function'&&
    (!selection?.provider||String(selection.provider).toLowerCase()==='okx')?
    owner.remainingFor({base,quote,venue:'okx'},position,rules,now):null;
  const publicData=frozen({market_price_usd:print(mPrice),
    market_timestamp_verified:marketFresh,
    market_source:market?.usdSource||'non certifiée',
    change_24h:typeof market?.change24h==='number'&&Number.isFinite(market.change24h)?
      market.change24h:null,
    chart_instrument:chartValid?chartPair:null,
    chart_interval:chartValid?String(chart.loadedBar||''):null,
    chart_identity_matched:Boolean(chartValid),
    chart_source_verified:chartProvenance,
    chart_provider:chartProvider,
    chart_same_spot_pair:Boolean(chartValid&&chartPair===pair),
    chart_warning:chartPair&&!chartValid?
      'Bougies '+chartPair+' différentes de '+base+' : refus de substitution.':
      chartValid&&chartPair!==pair?
        'Graphique '+chartPair+' distinct du Spot '+pair+
        ' : aucune conversion de prix implicite.':null,
    native_pair:pair,book_verified:Boolean(validBook),rules_verified:Boolean(validRules),
    best_bid_quote:validBook?print(validBook.bids[0].price):null,
    best_ask_quote:validBook?print(validBook.asks[0].price):null,
    min_size_base:validRules?print(validRules.minimum):null,
    lot_size_base:validRules?print(validRules.lot):null,
    tick_size_quote:validRules?print(validRules.tick):null});
  const privateData=frozen({quote_account_verified:Boolean(validAccount),
    base_position_verified:Boolean(validPosition),
    trading_quote:validAccount?.trading||null,
    funding_quote:validAccount?.funding??null,
    trading_base:validPosition?print(validPosition.trading):null,
    funding_base:validPosition?print(validPosition.funding):null,
    total_base:validPosition?print(validPosition.total):null,
    maker_rate:validAccount?.maker_rate??null,
    taker_rate:validAccount?.taker_rate??null,
    fee_currency_verified:validAccount?.fee_currency_verified===true,
    max_buy_verified:false,holding_status:remaining?.status||'UNKNOWN',
    holding_reason:remaining?.reason||'Non certifié',
    sellable_size_base:remaining?.sellable_size_base??null,
    residual_base:remaining?.residual_base??null,
    acquisition_cost_proven:false,pnl_proven:false,
    acquisition_cost:null,pnl:null});
  const sections=frozen([
    entry('Lecture Technique',chartValid?'DATA':'WAITING',
      chartValid?'Bougies '+chartPair+' ; source '+
       (chartProvenance?'identifiée et datée ('+chartProvider+')':'non qualifiée')+
       (chartPair===pair?' ; paire identique au Spot '+pair+'.':
        ' ; paire distincte du Spot '+pair+' (conversion interdite).'):
        'Bougies exactes '+base+' non chargées.'),
    entry('Fiche publique',mPrice===null?'WAITING':'DATA',
      (mPrice===null?'Prix USD frais et sourcé indisponible. ':
       'Prix USD daté et sourcé. ')+
      'Market indépendant du carnet natif '+pair+'.'),
    entry('Position personnelle',validPosition?(remaining?.status||'VERIFIED'):'UNKNOWN',
      validPosition?'Trading et Funding '+base+' datés séparément ; état '+
        (remaining?.status||'non qualifié')+'.':
        'Aucune position '+base+' prouvée ; absence ne signifie pas zéro.'),
    entry('Règles OKX',validRules?'VERIFIED':'UNKNOWN',
      validRules?'minSz, lotSz et tickSz de '+pair+' uniquement.':
        'Règles publiques natives manquantes, aucune substitution.'),
    entry('Simulations de revente',validBook&&validRules&&validPosition?'PAPER':'BLOCKED',
      '25/50/100 % sur Trading uniquement ; net éventuel seulement avec frais attestés dans la devise de cotation.'),
    entry('Analyse Seven','INSUFFICIENT_EVIDENCE',
      'Coût d acquisition et P&L non prouvés sans rapprochement complet des transactions.'),
    entry('Cas d école','EDUCATIONAL',
      'Sources, risques, liquidité et limites propres à '+pair+' ; aucune transaction.')
  ]);
  return frozen({schema:'erith.seven.asset-reading.v1',status:'PAPER_READ_ONLY',
    asset:frozen({base,quote,coin_id:coinId,pair}),
    public:publicData,private:privateData,sections,
    simulations:fractions({base,quote,position:validPosition,book:validBook,
      rawBook:book,rules:validRules,account:validAccount,now}),
    acquisition_receipts:receipt?frozen(receipt):null,
    read_only:true,orders_enabled:false,executable:false,transfer_enabled:false,
    caveat:'Étude de marché et compte en lecture seule. Aucun ordre ou gain garanti.'});
 }
 return frozen({createReading});
});
