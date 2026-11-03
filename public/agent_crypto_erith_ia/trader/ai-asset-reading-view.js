/* ERITH.IA · One shared Technical Reading shell, CT's native details.
   Seven renders only alternate asset contents; no second details or shortcut.
   The original CT subtree and its private data owner remain unchanged. */
(()=>{'use strict';
function mount(){
const core=globalThis.AgentCryptoAiAssetReading;
const host=document.getElementById('detailPanelBody');
const ct=document.getElementById('aiCtPanel');
const ctBody=ct?.querySelector('.ai-ct-panel-body');
const ctSummary=ct?.querySelector('summary');
const heading=ctSummary?.querySelector('b');
const caption=ctSummary?.querySelector('small');
if(!core?.createReading||!host||!ct||!ctBody||!heading||!caption||
  document.getElementById('sevenAssetReading'))return;
const el=(tag,cls='',value='')=>{
 const x=document.createElement(tag);if(cls)x.className=cls;
 if(value!==null&&value!==undefined)x.textContent=String(value);return x;
};
const panel=el('div','seven-asset-reading');
panel.id='sevenAssetReading';panel.hidden=true;
const content=el('div','seven-asset-body');
const intro=el('p','seven-asset-intro','Dossier indépendant de Concrete · aucune permission Trade.');
const modes=el('div','seven-asset-modes');
const learn=el('button','','Apprendre'),analyze=el('button','','Analyser');
const publicButton=el('button','','Actualiser les sources publiques');
const privateButton=el('button','','Lire mon compte (lecture seule)');
for(const btn of [learn,analyze,publicButton,privateButton])btn.type='button';
modes.append(learn,analyze);
const state=el('p','seven-asset-state','En attente de la sélection du Market.');
state.setAttribute('role','status');
const help=el('div','seven-asset-help');
const actions=el('div','seven-asset-actions');actions.append(publicButton,privateButton);
const cards=el('div','seven-asset-cards');
content.append(intro,modes,help,actions,state,cards);panel.append(content);
// Exactly one outer details node: CT's own native panel.
ct.append(panel);
const sheet=el('link');sheet.rel='stylesheet';sheet.id='sevenAssetReadingStyle';
sheet.href=new URL('../trader/ai-asset-reading.css',document.baseURI).href;
document.head.append(sheet);
let key='',coin=null,selection=null,market=null,chart=null,book=null,rules=null,
 account=null,position=null,mode='learn',epoch=0,busy=false;
const marketCoin=()=>globalThis.AgentCryptoTraderMarket?.selected?.()||
  globalThis.getSelectedCoin?.()||null;
const microscope=()=>globalThis.AgentCryptoMarketMicroscope?.snapshot?.()||null;
const externalListing=()=>globalThis.AgentCryptoNewListingsNativeCategory?.snapshot?.()||null;
// Reuse the existing CT navigation button; no additional IA button.
const quick=document.getElementById('aiCtToggle');
const privateAllowed=()=>typeof globalThis.AgentCryptoTraderOkxAccount?.ticketReadOnly==='function'&&
  typeof globalThis.AgentCryptoTraderOkxAccount?.basePositionReadOnly==='function';
if(!privateAllowed())privateButton.textContent='Lecture compte indisponible (Operator)';
const available=(v)=>v===null||v===undefined||v===''?'Non certifié':String(v);
const money=(v,unit)=>available(v)+(v===null||v===undefined?'':' '+unit);
const row=(label,value)=>{
 const r=el('div','seven-asset-row');
 r.append(el('span','',label),el('strong','',available(value)));return r;
};
const block=(title,text)=>{
 const p=el('p','');p.append(el('b','',title+' · '),document.createTextNode(text));return p;
};
const format=(v,dec=8)=>{
 const n=Number(v);return Number.isFinite(n)?
  n.toLocaleString('fr-FR',{maximumFractionDigits:dec}):'non qualifié';
};
function chosen(){
 const c=marketCoin(),g=microscope(),external=externalListing();
 const graphPair=String(g?.loadedInstrument||'').toUpperCase().replace('/','-');
 const graphBase=graphPair.match(/^([A-Z0-9]{1,20})-([A-Z0-9]{2,12})$/)?.[1]||'';
 const symbol=String(c?.symbol||'').toUpperCase();
 const extId=String(external?.selectedId||'').trim();
 const extSymbol=String(external?.selectedSymbol||'').toUpperCase();
 const extPair=String(external?.selectedPair||'').toUpperCase().replace('/','-');
 const provider=String(external?.selectedProvider||'').toLowerCase();
 // A New Listing belongs to its exchange selection, NOT a stale BTC Market.
 if(extId&&extSymbol){
   if(extSymbol==='CT'||graphBase==='CT')return {ct:true,c,g};
   const exact=extPair.match(/^([A-Z0-9]{1,20})-(USDC|USDT|EUR)$/);
   const publicCoin=globalThis.AgentCryptoNewListingsNativeCategory?.selectedMarketCoin?.();
   // No stale Top-250/BTC profile can be used as the New Listing's price.
   const publicMatches=publicCoin?.id===extId&&
     String(publicCoin?.symbol||'').toUpperCase()===extSymbol&&
     String(publicCoin?.listingPair||'').toUpperCase().replace('/','-')===extPair&&
     String(publicCoin?.listingProvider||'').toLowerCase()===provider;
   const externalCoin=publicMatches?publicCoin:
     {id:extId,symbol:extSymbol,name:extSymbol};
   if(!exact||exact[1]!==extSymbol||
      !['bitget','okx','binance'].includes(provider))
     return {pending:true,c:externalCoin,g};
   if(graphPair&&graphPair!==extPair)
     return {conflict:true,c:externalCoin,g,graphBase};
   if(graphPair!==extPair||g?.external!==true)
     return {pending:true,c:externalCoin,g};
   return {c:externalCoin,g,
     selection:{id:extId,symbol:extSymbol,quote:exact[2],provider},
     identity:'listing|'+provider+'|'+extId+'|'+extPair};
 }
 // CT's restored module is always the sole CT owner.
 if(symbol==='CT'||graphBase==='CT')return {ct:true,c,g};
 if(!c?.id||!/^[A-Z][A-Z0-9]{0,19}$/.test(symbol))return {pending:true,c,g};
 if(graphBase&&graphBase!==symbol)return {conflict:true,c,g,graphBase};
 const quote=String(c?.rawQuoteCurrency||c?.quote||
   c?.providerContext?.quote||'USDC').toUpperCase();
 if(!['USDC','USDT','EUR'].includes(quote))return {pending:true,c,g};
 return {c,g,selection:{id:String(c.id),symbol,quote,provider:'okx'},
  identity:String(c.id)+'|'+symbol+'|'+quote};
}
function resetReading(){
 book=null;rules=null;account=null;position=null;busy=false;
 state.textContent='Nouvel actif : seules ses propres preuves seront utilisées.';
}
function same(original,seq){
 const now=chosen();return !now.ct&&!now.conflict&&!now.pending&&
    now.identity===original&&epoch===seq;
}
function change(){
 const choice=chosen();
 if(choice.ct){
  panel.hidden=true;ctBody.hidden=false;
  heading.textContent='IA · Concrete (CT)';
  caption.textContent='Apprendre · Analyser · position privée CT/USDC';
  if(quick)quick.textContent='IA · Concrete';
  key='CT';coin=null;selection=null;epoch++;resetReading();return;
 }
 if(choice.conflict||choice.pending){
  ctBody.hidden=true;panel.hidden=false;
  if(quick)quick.textContent='IA · Lecture';
  heading.textContent='IA · Sources en attente';
  caption.textContent='Identité Market, exchange et bougies à vérifier';
  cards.replaceChildren();help.replaceChildren();
  key='';coin=null;selection=null;epoch++;resetReading();
  state.textContent=choice.conflict?
    'Conflit : Market '+choice.c?.symbol+' · graphique '+
      choice.graphBase+'. Aucune analyse ou position n’est mélangée.':
    'Sélection non qualifiée : aucune ancienne position ou analyse conservée.';
  publicButton.disabled=true;privateButton.disabled=true;
  return;
 }
 if(choice.identity!==key){
   key=choice.identity;coin=choice.c;selection=choice.selection;
   epoch++;resetReading();
 }else{
   // A refreshed native Market quote does not change the listing identity.
   // Its newest verified timestamp/price must still reach Seven.
   coin=choice.c;
 }
 ctBody.hidden=true;panel.hidden=false;
 if(quick)quick.textContent='IA · '+selection.symbol;
 const isNativeOkx=selection.provider==='okx';
 publicButton.disabled=busy||!isNativeOkx;
 privateButton.disabled=busy||!isNativeOkx||!privateAllowed();
 if(!isNativeOkx)
   state.textContent='Lecture '+selection.symbol+'/'+selection.quote+
     ' · '+selection.provider.toUpperCase()+
     ' public. Carnet, règles et compte OKX non applicables à cette place ; aucune donnée privée supposée.';
 heading.textContent='IA · Dossier '+selection.symbol+' · Seven';
 caption.textContent=String(coin?.name||selection.symbol)+' · '+selection.symbol+
   '/'+selection.quote+' · '+selection.provider.toUpperCase()+
   ' · Market, position, règles et scénarios PAPER';
 intro.textContent='Même structure que Concrete (CT), données propres à '+
   selection.symbol+'. Concrete conserve intégralement son panneau et sa lecture privée.';
 paint();
}
function safeChart(){
 const info=microscope();
 const pair=String(info?.loadedInstrument||'').toUpperCase().replace('/','-');
 if(pair.split('-')[0]!==selection?.symbol)return null;
 if(selection?.provider!=='okx'){
   const statedSource=String(info?.source||'').toLowerCase();
   if(info?.external!==true||pair!==selection.symbol+'-'+selection.quote||
      !statedSource.startsWith(selection.provider+' '))return null;
 }
 return info;
}
function paint(){
 if(!selection||panel.hidden)return;
 const ch=safeChart(),now=Date.now();
 const study=core.createReading({selection,market:coin,chart:ch,
   book,rules,account,position,now});
 if(study.status!=='PAPER_READ_ONLY'){
   cards.replaceChildren(block('Lecture indisponible',study.reason));
   return;
 }
 learn.setAttribute('aria-pressed',String(mode==='learn'));
 analyze.setAttribute('aria-pressed',String(mode==='analyze'));
 help.replaceChildren();
 if(mode==='learn'){
   help.append(block('Apprendre',
    'La paire du graphique peut différer de la paire Spot. La variation 24 h, les bougies, le carnet et ton solde proviennent de sources différentes. Aucune direction future ne se déduit d’une seule bougie.'));
 }else{
   help.append(block('Analyser',
    'Rapprocher la fraîcheur, les volumes, la profondeur disponible, les frais et les minima Spot avant d’évaluer une hypothèse. Une estimation PAPER n’est pas un ordre ni un gain réalisé.'));
 }
 const previouslyOpen=new Set([...cards.children]
   .filter(x=>x.open===true).map(x=>x.dataset?.sectionName).filter(Boolean));
 const firstPaint=cards.children.length===0;
 cards.replaceChildren();
 const sections=study.sections;
 sections.forEach((entry,index)=>{
   const d=el('details','seven-asset-card');
   d.dataset.sectionName=entry.label;
   d.open=firstPaint?index<2:previouslyOpen.has(entry.label);
   const s=el('summary','');
   s.append(el('b','',entry.label),el('small','',entry.status));
   d.append(s,el('p','seven-asset-note',entry.details));
   const sub=el('div','seven-asset-values');
   const put=(name,value)=>sub.append(row(name,value));
   if(index===0){
     put('Instrument graphique',study.public.chart_instrument||'Non qualifié');
     put('Source des bougies',study.public.chart_source_verified?
       'Attestée et récente':'Non certifiée / à vérifier');
     if(study.public.chart_warning)put('Séparation des sources',study.public.chart_warning);
     if(ch&&study.public.chart_instrument){
       put('Période',study.public.chart_interval||'Non vérifiée');
       const last=ch.rows?.at(-1),values=['o','h','l','c','v'];
       if(last&&values.every(k=>last[k]!==null&&Number.isFinite(Number(last[k]))&&Number(last[k])>=0)){
         put('Bougie O / H / B / C',
           ['o','h','l','c'].map(k=>format(last[k])).join(' / '));
         put('Volume de la bougie',format(last.v)+' '+selection.symbol);
       }
       const lv=globalThis.AgentCryptoMarketMicroscope?.technicalLevels?.();
       if(lv?.instrument===study.public.chart_instrument&&
          lv?.bar===study.public.chart_interval){
         if(Number.isFinite(Number(lv?.support?.price)))
           put('Support historique',format(lv.support.price)+' (non garanti)');
         if(Number.isFinite(Number(lv?.resistance?.price)))
           put('Résistance historique',format(lv.resistance.price)+' (non garantie)');
       }
     }
   }
   if(index===1){
     put('Prix Market',money(study.public.market_price_usd,'USD'));
     put('Variation 24 h',study.public.change_24h===null?'Non certifiée':
       format(study.public.change_24h,2)+' %');
     put('Source Market',study.public.market_source);
     put('Horodatage Market',study.public.market_timestamp_verified?
       'Récent':'Non certifié');
     put('Capitalisation',money(coin?.marketCapUsd,'USD'));
     put('Volume 24 h',money(coin?.volume24hUsd,'USD'));
     put('Carnet natif',study.asset.pair+' · '+
       (study.public.book_verified?'récent':'non vérifié'));
     put('Meilleur bid',money(study.public.best_bid_quote,study.asset.quote));
     put('Meilleur ask',money(study.public.best_ask_quote,study.asset.quote));
   }
   if(index===2){
     put('Trading '+study.asset.base,study.private.trading_base===null?
       'Non certifié':money(study.private.trading_base,study.asset.base)+' · daté');
     put('Funding '+study.asset.base,study.private.funding_base===null?
       'Non certifié':money(study.private.funding_base,study.asset.base)+' · daté');
     const labels={EMPTY:'Vide vérifié',FUNDING_ONLY:'Funding uniquement',
       DUST:'Poussières · sous minimum Spot',
       SIZE_FILTER_MATCHES:'Quantité conforme aux filtres minSz/lotSz',
       RULES_UNVERIFIED:'Minimum Spot non vérifié',UNKNOWN:'Non certifié'};
     put('État de la position',labels[study.private.holding_status]||'Non certifié');
     if(study.private.sellable_size_base!==null)
       put('Quantité conforme aux filtres',money(study.private.sellable_size_base,study.asset.base));
     if(study.private.residual_base!==null)
       put('Résidu / poussières',money(study.private.residual_base,study.asset.base));
     put('Portée du contrôle','Lecture seulement · aucune vente exécutée ni autorisée');
     put('Trading '+study.asset.quote,
       money(study.private.trading_quote,study.asset.quote));
     put('Funding '+study.asset.quote,
       money(study.private.funding_quote,study.asset.quote));
     put('Coût d’acquisition','Non prouvé sans mouvements complets');
     put('P&L personnel','Non calculable sans historique rapproché');
   }
   if(index===3){
     put('Paire native OKX',study.asset.pair);
     put('Minimum minSz',money(study.public.min_size_base,study.asset.base));
     put('Pas lotSz',money(study.public.lot_size_base,study.asset.base));
     put('Pas de prix tickSz',money(study.public.tick_size_quote,study.asset.quote));
     put('Taux maker / taker',
       study.private.maker_rate===null?'Non certifiés':
         study.private.maker_rate+' / '+study.private.taker_rate+' (taux, pas débit effectif)');
     put('Devise réelle des frais','Non certifiée');
     put('Plafond de compte maxBuy','Non certifié');
   }
   if(index===4){
     study.simulations.forEach(sim=>{
       const desc=sim.status==='NET_HYPOTHESIS'?
         sim.quantity_base+' '+study.asset.base+' → '+sim.net_quote+' '+
         study.asset.quote+' NET PAPER hypothétique (frais estimés '+
         sim.estimated_fee_quote+' '+study.asset.quote+') · AUCUN ORDRE':
         sim.status==='GROSS_ONLY'?
         sim.quantity_base+' '+study.asset.base+' → '+sim.gross_quote+
         ' '+study.asset.quote+' BRUT fictif · NET non certifié':
         sim.detail;
       put('Revente '+sim.percent+' %',desc);
     });
     put('Autorisation de vente','Aucune · simulation seulement');
   }
   if(index===5){
     put('Analyse des acquisitions','En attente des exécutions et transferts rapprochés');
     put('Prix de revient','Non prouvé');
     put('P&L réel','Non prouvé');
     put('Écart graphique / carnet','Sources distinctes, aucune assimilation');
   }
   if(index===6){
     put('Actif étudié',String(coin?.name||selection.symbol)+' ('+selection.symbol+')');
     put('Contexte','Historique, volumes, liquidité, minima et volatilité');
     put('Règle Seven','Aucune donnée manquante n’est remplacée par celle d’un autre actif');
     put('Trading','PAPER uniquement, sans ordre, transfert ou fonds engagés');
   }
   d.append(sub);cards.append(d);
 });
}
async function getPublic(url,ms=6500){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),ms);
 try{
  const response=await fetch(url,{cache:'no-store',signal:controller.signal});
  if(!response.ok)throw Error('HTTP '+response.status);
  return await response.json();
 }finally{clearTimeout(timeout);}
}
async function publicRead(){
 const initial=chosen();
 if(!initial.selection||busy||initial.selection.provider!=='okx')return;
 const pair=initial.selection.symbol+'-'+initial.selection.quote,token=epoch;
 busy=true;publicButton.disabled=true;privateButton.disabled=true;
 state.textContent='Lecture des preuves publiques exactes de '+pair+'…';
 try{
  const res=await Promise.allSettled([
   getPublic('http://127.0.0.1:8790/market-book?provider=okx&instrument='+
     encodeURIComponent(pair)+'&limit=100'),
   getPublic('https://www.okx.com/api/v5/public/instruments?instType=SPOT&instId='+
     encodeURIComponent(pair))
  ]);
  if(!same(initial.identity,token))return;
  book=res[0].status==='fulfilled'?res[0].value:null;
  const native=res[1].status==='fulfilled'?res[1].value:null;
  const rr=Array.isArray(native?.data)?native.data.filter(x=>x.instId===pair):[];
  rules=native?.code==='0'&&rr.length===1?
    {...rr[0],observed_at_utc:new Date().toISOString()}:null;
  state.textContent='Preuves publiques '+pair+' : '+
    (book?'carnet reçu':'carnet indisponible')+' · '+
    (rules?'règles reçues':'règles indisponibles')+
    '. Chaque donnée est encore vérifiée par le contrat.';
 }catch(_){
  if(same(initial.identity,token)){
   book=null;rules=null;state.textContent='Lecture publique indisponible ; aucune valeur de substitution.';
  }
 }finally{
  if(same(initial.identity,token)){
   busy=false;publicButton.disabled=false;privateButton.disabled=!privateAllowed();paint();
  }
 }
}
async function privateRead(){
 const initial=chosen();
 if(!initial.selection||busy||initial.selection.provider!=='okx')return;
 const pair=initial.selection.symbol+'-'+initial.selection.quote,token=epoch;
 const owner=globalThis.AgentCryptoTraderOkxAccount;
 if(typeof owner?.ticketReadOnly!=='function'||typeof owner?.basePositionReadOnly!=='function'){
   state.textContent='Compte OKX indisponible ou ancien Bridge : aucun solde inventé.';return;
 }
 busy=true;privateButton.disabled=true;publicButton.disabled=true;
 state.textContent='Lecture propriétaire '+pair+' sur demande (sans ordre)…';
 try{
  const [a,p]=await Promise.all([owner.ticketReadOnly(pair),owner.basePositionReadOnly(pair)]);
  if(!same(initial.identity,token))return;
  account=a?.instId===pair&&a?.read_only===true&&a?.orders_enabled===false&&
    a?.real_orders===0&&a?.verified===true?a:null;
  position=p?.pair===pair&&p?.read_only===true&&p?.orders_enabled===false&&
    p?.real_orders===0?p:null;
  state.textContent='Lecture '+pair+' terminée · Trading/Funding isolés. '+
    (position?.verified?'Deux sous-soldes de base qualifiés.':
     'Sous-soldes incomplets : aucune quantité de vente supposée.');
 }catch(_){
  if(same(initial.identity,token)){
   account=null;position=null;
   state.textContent='Compte privé non accessible ; aucune valeur précédemment lue n’est reprise.';
  }
 }finally{
  if(same(initial.identity,token)){
   busy=false;privateButton.disabled=false;publicButton.disabled=false;paint();
  }
 }
}
learn.addEventListener('click',()=>{mode='learn';paint();});
analyze.addEventListener('click',()=>{mode='analyze';paint();});
publicButton.addEventListener('click',()=>void publicRead());
privateButton.addEventListener('click',()=>void privateRead());
function schedule(){queueMicrotask(change);}
for(const event of ['agent-crypto:trader-selection-changed',
 'agent-crypto:external-asset-changed','agent-crypto:new-listing-line-ready',
 'agent-crypto:trader-line-loaded','agent-crypto:market-candles-loaded',
 'agent-crypto:candles-technical-levels','agent-crypto:quote-architecture-changed']){
 window.addEventListener(event,schedule,{passive:true});
}
window.addEventListener('pageshow',schedule,{passive:true});
ct.addEventListener('toggle',()=>{if(ct.open)change();});
schedule();
globalThis.AgentCryptoSevenAssetReadingView=Object.freeze({
 active:()=>selection?.symbol||null,refresh:change,read_only:true,
 ct_modified:false,orders_enabled:false,real_orders:false,
 shared_shell:'aiCtPanel',secondary_details:false});
}
if(document.getElementById('aiCtPanel'))mount();
else {
 // CT is injected asynchronously after its contract is loaded. Wait for
 // its existing node, then disconnect immediately; never construct a rival.
 const target=document.getElementById('detailPanelBody');
 if(!target||typeof MutationObserver==='undefined')return;
 const observer=new MutationObserver(()=>{
   if(document.getElementById('aiCtPanel')){observer.disconnect();mount();}
 });
 observer.observe(target,{childList:true});
}
})();
