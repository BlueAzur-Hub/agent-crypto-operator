/* ERITH.IA · premier panneau de lecture commun IA/Trader, opt-in manuel. */
(()=>{'use strict';
const model=globalThis.AgentCryptoAiCtContract;
if(!model)return;
const BRIDGE='http://127.0.0.1:8787';
const BACKEND='http://127.0.0.1:8790';
const TOKEN_KEY='agent_crypto_bridge_owner_token_v1';
const ROLE_KEY='agent_crypto_local_access_session_v1';
const detailBody=document.getElementById('detailPanelBody');
if(!detailBody||document.getElementById('aiCtPanel'))return;
const template=document.createElement('template');
template.innerHTML="<details id=\"aiCtPanel\" class=\"atlas-detail-subwindow atlas-primary-detail-window ai-ct-reading\" data-detail-window=\"ai-ct\">\n  <summary><span><b>IA · Concrete (CT)</b><small>Apprendre · Analyser · position privée CT/USDC</small></span><em id=\"aiCtExpandState\" data-window-state>Ouvrir</em></summary>\n  <div class=\"atlas-detail-subwindow-body ai-ct-panel-body\">\n    <p class=\"ai-ct-intro\">Assistance à la lecture du marché Concrete · aucun ordre réel. Le graphique public CT/USDT et ta position CT/USDC restent distincts.</p>\n    <div class=\"ai-ct-modes\" role=\"group\" aria-label=\"Mode d'assistance Concrete\">\n      <button id=\"aiCtModeLearn\" type=\"button\" aria-controls=\"aiCtLesson\" aria-pressed=\"true\">Apprendre</button>\n      <button id=\"aiCtModeAnalyze\" type=\"button\" aria-controls=\"aiCtLesson\" aria-pressed=\"false\">Analyser</button>\n    </div>\n    <div id=\"aiCtLesson\" class=\"ai-ct-lesson\" role=\"status\" aria-live=\"polite\"></div>\n    <div class=\"ai-ct-actions\">\n      <button id=\"aiCtRead\" type=\"button\">Lire ma position CT/USDC</button>\n      <button id=\"aiCtCopy\" type=\"button\" disabled>Copier le résumé privé</button>\n    </div>\n    <p id=\"aiCtStatus\" role=\"status\" aria-live=\"polite\">Prêt · aucune consultation privée automatique.</p>\n    <div id=\"aiCtDetails\"></div>\n    <details class=\"ai-ct-case\">\n      <summary>Cas d'école · Concrete CT — lecture et risques</summary>\n      <p><strong>Position réelle :</strong> marché CT/USDC, quantité et frais lus via le Bridge local uniquement sur demande. Une vente fictive estimée à partir du carnet ne garantit aucun prix réel.</p>\n      <p><strong>Analyse publique :</strong> les bougies CT/USDT proviennent d'un autre marché. Elles servent au contexte, sans être assimilées au prix CT/USDC ou à une mesure de ton gain personnel.</p>\n      <p><strong>Contrôles :</strong> volatilité, volumes, liquidité, commissions, fraîcheur et archives doivent être qualifiés. Aucun ordre automatique.</p>\n    </details>\n  </div>\n</details>";
const panel=template.content.firstElementChild;
const body=panel.querySelector('#aiCtDetails'),status=panel.querySelector('#aiCtStatus');
const read=panel.querySelector('#aiCtRead'),copy=panel.querySelector('#aiCtCopy');
const anchor=detailBody.querySelector('#detailCompactStrip');
if(anchor)anchor.insertAdjacentElement('afterend',panel);else detailBody.prepend(panel);
/* Raccourci Trader : ouvre la Lecture Technique existante, jamais un second panneau. */
const nav=document.querySelector('#accueil .atlas-v2-nav-essential');
if(nav&&!document.getElementById('aiCtToggle')){
 const btn=document.createElement('button');
 btn.id='aiCtToggle';btn.type='button';btn.className='atlas-quick-link';
 btn.textContent='IA · Concrete';
 btn.setAttribute('aria-controls','aiCtPanel');
 btn.setAttribute('aria-expanded','false');
 nav.appendChild(btn);
 btn.addEventListener('click',()=>{
  const detail=document.getElementById('detailPanel');
  if(detail?.hidden||document.getElementById('analyste')?.classList.contains('detail-collapsed')){
   document.getElementById('detailPanelToggle')?.click();
  }
  panel.open=true;
  btn.setAttribute('aria-expanded','true');
  panel.scrollIntoView({behavior:'auto',block:'nearest'});
 });
 panel.addEventListener('toggle',()=>{
  btn.setAttribute('aria-expanded',String(panel.open));
 });
}
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.id='aiCtNativeStyle';
sheet.href=new URL('../trader/ai-ct-panel.css?scope=native',document.baseURI).href;
document.head.appendChild(sheet);
let latest=null;
function state(message){status.textContent=message;}
function field(label,value){const row=document.createElement('div');row.className='ai-ct-row';
 const a=document.createElement('span');a.textContent=label;
 const b=document.createElement('strong');b.textContent=value;
 row.append(a,b);body.append(row);}
function number(value,decimals=6){return typeof value==='number' && Number.isFinite(value)
 ?value.toLocaleString('fr-FR',{maximumFractionDigits:decimals}):'Non disponible';}
async function get(url,token){const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
 try{const response=await fetch(url,{method:'GET',headers:{Accept:'application/json',...(token?{Authorization:'Bearer '+token}:{})},cache:'no-store',signal:controller.signal});
 if(!response.ok)throw new Error('Lecture indisponible ('+response.status+')');return await response.json();}
 finally{clearTimeout(timeout);}}

function el(tag,className='',content=''){
 const node=document.createElement(tag);
 if(className)node.className=className;
 if(content!==null)node.textContent=content;
 return node;
}

function showNetBuyPlanner(parent,doc){
 // Planificateur local : aucune API privée, aucun transfert ni commande.
 const area=el('details','ai-ct-buy-planner');
 area.append(el('summary','','Prévoir un achat CT net après frais · sans ordre'));
 const intro=el('p','ai-ct-buy-intro',
  'Objectif : conserver au minimum une quantité CT revendable au pas Spot. Les frais d’un futur achat sont une HYPOTHÈSE, jamais ceux garantis par une ancienne transaction.');
 area.append(intro);
 const fields=el('div','ai-ct-buy-fields');
 const labelInput=(caption,placeholder,value)=>{
  const label=el('label','ai-ct-buy-label');
  label.append(el('span','',caption));
  const input=el('input','');
  input.type='text';input.inputMode='decimal';
  input.setAttribute('autocomplete','off');input.setAttribute('spellcheck','false');
  input.placeholder=placeholder;input.value=value||'';
  label.append(input);fields.append(label);
  return input;
 };
 const official=doc.instrument_rules?.status==='verified';
 const min=labelInput('Minimum CT (Spot)', 'ex. 10',official?doc.instrument_rules.min_sz:'');
 const lot=labelInput('Pas de quantité CT','ex. 0,01',official?doc.instrument_rules.lot_sz:'');
 if(official){min.readOnly=true;lot.readOnly=true;}
 const rate=labelInput('Frais supposés de l’achat (%)','ex. 0,1','');
 const ccyLabel=el('label','ai-ct-buy-label');
 ccyLabel.append(el('span','','Frais prélevés en'));
 const feeCcy=el('select','');
 for(const ccy of ['CT','USDC']){
  const opt=el('option','',ccy);opt.value=ccy;feeCcy.append(opt);
 }
 ccyLabel.append(feeCcy);fields.append(ccyLabel);
 area.append(fields);
 const provenance=el('p','ai-ct-buy-source',official
  ?'Règles CT/USDC officielles observées à '+doc.instrument_rules.checked_at+'.'
  :'Règles OKX NON VÉRIFIÉES : si tu saisis un minimum et un pas, le résultat restera une illustration manuelle, pas un ordre admissible.');
 area.append(provenance);
 const historical=doc.acquisition?.observed_buy_ct_fee_pct;
 if(Number.isFinite(historical)&&historical>=0&&historical<=5){
  const note=el('p','ai-ct-buy-historic',
   'Ancien achat rapproché : frais en CT observés ≈ '+number(historical,6)+' %. Ce taux passé ne garantit pas les frais du prochain achat.');
  const use=el('button','ai-ct-buy-suggest','Utiliser ce taux comme hypothèse');
  use.type='button';
  use.addEventListener('click',()=>{rate.value=String(historical);feeCcy.value='CT';});
  note.append(document.createTextNode(' '),use);
  area.append(note);
 }
 const run=el('button','ai-ct-buy-compute','Calculer la quantité brute');
 run.type='button';area.append(run);
 const out=el('div','ai-ct-buy-result','Renseigne une hypothèse de frais et calcule la quantité. Aucun ordre ne sera envoyé.');
 out.setAttribute('aria-live','polite');area.append(out);
 run.addEventListener('click',()=>{
  out.replaceChildren();
  const rule=official?doc.instrument_rules:{
    status:'manual',market:'CT-USDC',min_sz:min.value.trim().replace(',','.'),
    lot_sz:lot.value.trim().replace(',','.'),state:'unknown'
  };
  const estimate=model.planGrossBuyForNetSpot(rule,rate.value.trim().replace(',','.'),feeCcy.value);
  if(estimate.status!=='hypothetical'){
   out.textContent='Calcul indisponible : '+estimate.reason+'.';
   return;
  }
  const heading=el('strong','',estimate.rules_verified
   ?'Simulation avec règles Spot publiées par OKX'
   :'Simulation MANUELLE · règles Spot non vérifiées');
  out.append(heading);
  const table=el('dl','ai-ct-buy-result-grid');
  const add=(name,value)=>{
   const slot=el('div','');
   slot.append(el('dt','',name),el('dd','',value));table.append(slot);
  };
  add('Minimum revendable visé',estimate.sale_quantity_target_ct+' CT');
  add('CT bruts à acheter',estimate.gross_purchase_ct+' CT');
  add('Frais CT supposés',estimate.assumed_fee_ct===null
    ?'Non calculés : frais supposés en USDC':estimate.assumed_fee_ct+' CT');
  add('CT nets hypothétiques',estimate.net_received_ct+' CT');
  add('CT revendables au pas',estimate.quantity_saleable_ct+' CT');
  add('Reste sous le pas',estimate.residual_ct+' CT');
  out.append(table);
  out.append(el('p','ai-ct-buy-source',
   'Simulation uniquement. Commission future, prix d’achat USDC, minimum notionnel, disponibilité et acceptation d’ordre NON vérifiés. Aucune transaction.'));
 });
 parent.append(area);
}

function showCtChoiceComparison(parent,doc){
 // Devis recopié par l'opérateur : JAMAIS tiré d'une ancienne capture,
 // JAMAIS assimilé à un devis authentifié et JAMAIS enregistré.
 const pane=el('details','ai-ct-choice-compare');
 pane.append(el('summary','','Décision CT · comparer Convert, Spot et conserver'));
 pane.append(el('p','',
  'Saisis le nouveau montant USDC affiché pour tes CT par OKX Convert. Ce devis expire rapidement : ce calcul ne le réserve pas et ne passe aucun ordre.'));
 const label=el('label','ai-ct-choice-label');
 label.append(el('span','','USDC proposés sur OKX Convert pour toute ma position'));
 const input=el('input','');
 input.type='text';input.inputMode='decimal';input.placeholder='Montant du nouveau devis, ex. 3,76';
 input.autocomplete='off';input.spellcheck=false;
 label.append(input);pane.append(label);
 const btn=el('button','ai-ct-choice-button','Comparer les trois choix');
 btn.type='button';pane.append(btn);
 const results=el('div','ai-ct-choice-results',
  'Aucun devis saisi. Les anciennes cotations ne sont pas réutilisées.');
 results.setAttribute('aria-live','polite');pane.append(results);
 btn.addEventListener('click',()=>{
  results.replaceChildren();
  const report=model.compareCtExitDecisions(doc,input.value,Date.now());
  if(report.status!=='manual_comparison'){
   results.textContent='Calcul indisponible : '+report.reason+'. Recharge la lecture CT si nécessaire.';
   return;
  }
  const rows=el('div','ai-ct-choice-grid');
  function add(heading,value,detail){
   const cell=el('section','ai-ct-choice-cell');
   cell.append(el('span','',heading),el('strong','',value),el('small','',detail));
   rows.append(cell);
  }
  const sign=n=>n>0?'+':'';
  add('Convert · devis manuel',number(report.manual_convert_usdc,8)+' USDC',
    report.convert_difference_usdc===null
     ?'Coût d’achat non prouvé · gain non calculable'
     :'Écart aux achats retrouvés : '+sign(report.convert_difference_usdc)+
      number(report.convert_difference_usdc,8)+' USDC ('+
      sign(report.convert_return_pct)+number(report.convert_return_pct,2)+' %).');
  add('Spot · carnet actuel',
    report.spot_net_illustration_usdc===null?'Non négociable ou non vérifié':
     number(report.spot_net_illustration_usdc,8)+' USDC',
    report.spot_net_illustration_usdc===null
     ?'Filtres Spot non concordants, inconnus ou carnet périmé.'
     :'Taille conforme aux filtres observés ; autres contrôles d’ordre et exécution NON garantis.');
  add('Conserver · CT',
    number(report.held_ct,8)+' CT',
    'Aucun gain réalisé ; exposition à la hausse ET à la baisse maintenue.');
  results.append(rows);
  results.append(el('p','ai-ct-choice-warning',
    'Devis Convert SAISI MANUELLEMENT : non vérifié et périssable. Comparaison d’une seule opération CT, pas du rendement de tout le capital investi en euros. Aucune action sur le compte.'));
 });
 parent.append(pane);
}
function showEvidence(target,doc){
 const wrapper=el('section','ai-ct-execution');
 const top=el('div','ai-ct-execution-top');
 top.append(el('div','ai-ct-execution-title','CONCRETE · CT/USDC · OKX'),
   el('p','ai-ct-execution-sub','Simulations en lecture seule · aucune transaction'));
 wrapper.append(top);
 const rules=doc.instrument_rules||{};
 const full=doc.partial_exit_grid?.rows?.find(x=>x.share_pct===100);
 const metrics=el('div','ai-ct-execution-metrics');
 const addMetric=(title,value,description)=>{
  const card=el('div','ai-ct-execution-metric');
  card.append(el('span','',title),el('strong','',value),el('small','',description));
  metrics.append(card);
 };
 addMetric('Position',number(doc.position?.qty_ct,8)+' CT','Solde OKX Trading + Funding');
 addMetric('Revente totale simulée',
  full?.status==='indicative'?number(full.net_usdc,6)+' USDC':'Non calculable',
  'Carnet acheteur · frais estimés inclus');
 addMetric('Frais de vente',
  doc.fee_taker_fraction===null?'Non vérifiés':number(doc.fee_taker_fraction*100,3)+' %',
  'Taker CT/USDC du compte');
 addMetric('Minimum d’ordre',
  rules.status==='verified'?number(Number(rules.min_sz),8)+' CT':'Non vérifié',
  rules.status==='verified'
   ?'Pas quantité '+rules.lot_sz+' CT · état '+rules.state
   :'API publique OKX inaccessible ou données absentes');
 wrapper.append(metrics);
 const note=el('div','ai-ct-execution-status',
  rules.status==='verified'
    ?'Règles publiques OKX consultées le '+new Date(rules.checked_at).toLocaleString('fr-FR')+
      ' · min '+rules.min_sz+' CT · lot '+rules.lot_sz+' CT · tick '+rules.tick_sz+' USDC'
    :'Règles OKX non vérifiées : les simulations NE prouvent pas la possibilité de passer un ordre.');
 note.dataset.source=rules.status==='verified'?'verified':'unverified';
 wrapper.append(note);
 const title=el('h4','','Revente hypothétique selon le carnet acheteur');
 wrapper.append(title);
 const scroller=el('div','ai-ct-table-scroll');
 const table=el('table','ai-ct-scenario-table');
 const head=el('thead'),hrow=el('tr');
 for(const name of ['Fraction','CT simulés','Nets estimés','CT restants','Contrôle OKX']){
  hrow.append(el('th','',name));
 }
 head.append(hrow);table.append(head);
 const tbody=el('tbody');
 for(const entry of (doc.order_assessment?.rows||[])){
  const part=doc.partial_exit_grid?.rows?.find(x=>x.share_pct===entry.share_pct);
  const tr=el('tr');
  const vals=[
   entry.share_pct+' %',
   Number.isFinite(entry.requested_ct)?number(entry.requested_ct,8)+' CT':'—',
   part?.status==='indicative'?number(part.net_usdc,6)+' USDC':'Indisponible',
   part?.status==='indicative'?number(part.remaining_ct,8)+' CT':'—',
   entry.quantity_message
  ];
  vals.forEach((value,i)=>{
    const cell=el('td',i===4?'ai-ct-rule-state':'',value);
    if(i===4)cell.dataset.state=entry.quantity_status;
    tr.append(cell);
  });
  tbody.append(tr);
 }
 table.append(tbody);scroller.append(table);wrapper.append(scroller);
 const shock=doc.scenario_grid;
 if(shock?.status==='hypothetical'){
  wrapper.append(el('h4','','Hypothèses de prix · carnet à volumes constants'));
  const band=el('div','ai-ct-price-scenarios');
  for(const row of shock.rows){
   const card=el('div','ai-ct-price-scenario');
   card.dataset.shock=String(row.shock_pct);
   card.append(el('span','', (row.shock_pct>0?'+':'')+row.shock_pct+' %'),
     el('strong','',number(row.net_exit_usdc,6)+' USDC'),
     el('small','','Revente nette fictive'));
   band.append(card);
  }
  wrapper.append(band);
 }
 showNetBuyPlanner(wrapper,doc);
 showCtChoiceComparison(wrapper,doc);
 const warning=el('p','ai-ct-execution-warning',
 'Le carnet décrit des offres momentanées ; une quantité conforme à minSz/lotSz ne garantit ni acceptation, ni exécution. Autres contrôles OKX et frais éventuels non certifiés.');
 wrapper.append(warning);
 target.append(wrapper);
}
function showFullReport(target,report){
 const details=el('details','ai-ct-analysis-details');
 const summary=el('summary','','Explications complètes de Seven · sources et limites');
 details.append(summary);
 for(const line of report.lines)details.append(el('p','',line));
 target.append(details);
}
async function publicCtSpotInstrument(){
 // OKX Public Data : une lecture anonyme sans token ni envoi au Bridge.
 // Certains navigateurs / territoires bloquent CORS : état NON VÉRIFIÉ.
 const ctrl=new AbortController();
 const timeout=setTimeout(()=>ctrl.abort(),4500);
 try{
  const url='https://www.okx.com/api/v5/public/instruments?instType=SPOT&instId=CT-USDC';
  const res=await fetch(url,{method:'GET',mode:'cors',credentials:'omit',
    cache:'no-store',headers:{Accept:'application/json'},signal:ctrl.signal});
  if(!res.ok)throw new Error('Règles OKX indisponibles');
  const payload=await res.json();
  return {observed_at_utc:new Date().toISOString(),payload};
 }finally{clearTimeout(timeout);}
}
function paint(doc){body.replaceChildren();
 // Le compte rendu réunit les calculs déjà prouvés et la courbe publique chargée.
 const chart=model.publicCandles(globalThis.AgentCryptoMarketMicroscope?.snapshot?.()||null);
 const report=model.explain(doc,chart);
 showEvidence(body,doc);
 const brief=document.createElement('section');brief.className='ai-ct-seven-brief';
 brief.setAttribute('aria-label','Synthèse Seven de la position Concrete');
 const heading=document.createElement('strong');heading.textContent='SEVEN · Analyse de ma position CT';
 brief.append(heading);
 brief.append(el('p','', 'Analyse vérifiée et limites · voir les détails pour les sources de chaque calcul.'));
 body.append(brief);
 showFullReport(body,report);
 const balances=doc.portfolio?.assets||{};
 for(const code of ['BTC','CT','USDC','EUR']){
  const entry=balances[code];
  field('Compte OKX · '+code,entry?.verified===true?number(entry.qty,code==='BTC'?16:8)+' '+code:'Non retourné / non vérifié');
 }
 field('Marché exact',doc.market+' (pas CT/USDT)');
 field('Solde vérifié',number(doc.position.qty_ct,8)+' CT');
 field('Prix d’acquisition',doc.acquisition.status==='reconciled_fills_only'?number(doc.acquisition.cost_per_ct_usdc,7)+' USDC/CT':'Non confirmé');
 field('Montant acheté',doc.acquisition.status==='reconciled_fills_only'?number(doc.acquisition.spent_usdc,7)+' USDC':'Non confirmé');
 field('Frais de revente',doc.fee_taker_fraction===null?'Non vérifiés':number(doc.fee_taker_fraction*100,4)+' %');
 field('Valeur revente fictive',doc.liquidation_illustrative.status==='indicative'?number(doc.liquidation_illustrative.net_usdc,6)+' USDC':'Non disponible');
 field('Différence indicative après frais',doc.pnl_illustrative_usdc===null?'Non calculable':(doc.pnl_illustrative_usdc>=0?'+':'')+number(doc.pnl_illustrative_usdc,6)+' USDC');
 const warn=document.createElement('p');warn.className='ai-ct-warning';
 warn.textContent=doc.acquisition.status!=='reconciled_fills_only'?doc.acquisition.reason:
 doc.liquidation_illustrative.status!=='indicative'?doc.liquidation_illustrative.reason:
 'Estimation du carnet à un instant donné, pas un bénéfice réalisé ni une recommandation d’achat/vente.';
 body.append(warn);}
// Une seule lecture métier, deux présentations ; la consultation depuis OKX
// ne doit ni ouvrir la Lecture Technique ni reconstruire son contenu.
async function loadCtEvidence(){
 const session=sessionStorage.getItem(TOKEN_KEY)||'';
 if(sessionStorage.getItem(ROLE_KEY)!=='owner'||!session)
  throw new Error('Active d’abord ta session propriétaire Aether Trust dans le Trader.');
 const endpoints=[BRIDGE+'/okx/account',BRIDGE+'/okx/fills',BRIDGE+'/okx/fees?instId=CT-USDC',
  BACKEND+'/market-book?provider=okx&instrument=CT-USDC&limit=100'];
 const results=await Promise.allSettled([
  ...endpoints.map((url,i)=>get(url,i<3?session:null)),
  publicCtSpotInstrument()
 ]);
 if(sessionStorage.getItem(ROLE_KEY)!=='owner'||sessionStorage.getItem(TOKEN_KEY)!==session)
  throw new Error('La session Aether Trust a changé pendant la lecture.');
 if(results[0].status!=='fulfilled')throw new Error('Solde privé OKX non accessible.');
 const data=results.map(x=>x.status==='fulfilled'?x.value:null);
 return model.compose({account:data[0],fills:data[1],fees:data[2],book:data[3],instruments:data[4]});
}
async function refresh(){
 latest=null;copy.disabled=true;read.disabled=true;body.replaceChildren();
 state('Lecture locale en cours…');
 try{
  const doc=await loadCtEvidence();
  latest=doc;paint(doc);
  state('Lecture seule · provenance OKX · '+new Date().toLocaleTimeString('fr-FR'));
  copy.disabled=false;
 }catch(e){state('Non disponible : '+String(e.message||e).slice(0,140));}
 finally{read.disabled=false;}
}
async function readForAccount(target){
 // Réutilise le calcul de Seven, mais affiche le résultat à l'endroit du clic.
 // Aucun scroll, aucune modification de l'actif, aucun mouvement du graphique.
 if(!target?.isConnected||!target.closest?.('#traderOkxAccountPanel'))return false;
 target.replaceChildren();
 const waiting=document.createElement('p');
 waiting.textContent='Lecture privée CT/USDC en cours…';
 target.append(waiting);
 try{
  const doc=await loadCtEvidence();
  if(!target.isConnected||target.hidden||sessionStorage.getItem(ROLE_KEY)!=='owner')
   return false;
  const chart=model.publicCandles(globalThis.AgentCryptoMarketMicroscope?.snapshot?.()||null);
  const report=model.explain(doc,chart);
  target.replaceChildren();
  showEvidence(target,doc);
  showFullReport(target,report);
  return true;
 }catch(e){
  if(target.isConnected&&!target.hidden){
   target.replaceChildren();
   const p=document.createElement('p');
   p.textContent='Analyse CT indisponible : '+String(e.message||e).slice(0,140);
   target.append(p);
  }
  return false;
 }
}
const lesson=panel.querySelector('#aiCtLesson');
const learnButton=panel.querySelector('#aiCtModeLearn');
const analyzeButton=panel.querySelector('#aiCtModeAnalyze');
const expandLabel=panel.querySelector('#aiCtExpandState');
let helpMode='learn',helpTopic='';
const INDICATORS=Object.freeze({
 ma:'MA : moyenne des derniers prix de clôture. Elle lisse les variations ; elle ne prévoit pas le prochain mouvement.',
 ema:'EMA : moyenne qui accorde plus de poids aux prix récents ; elle peut réagir plus vite, mais générer de faux signaux.',
 sr:'S/R : support et résistance sont des zones repérées dans les cours passés, pas des barrières garanties.',
 supertrend:'SUPER : indicateur calculé avec la volatilité. Un changement de couleur ou de sens peut être tardif.',
 boll:'BOLL : bandes de Bollinger mesurant la dispersion autour d’une moyenne ; toucher une bande ne suffit pas pour acheter ou vendre.',
 sar:'SAR : points de suivi de tendance ; en marché hésitant, ils peuvent changer de côté fréquemment.',
 vwap:'VWAP : prix moyen pondéré par les volumes sur la fenêtre calculée ; ce n’est pas un prix d’exécution garanti.',
 vp:'VP : répartition estimée du volume par zone de prix à partir des bougies ; ce n’est pas le carnet d’ordres réel.'
});
const periods=Object.freeze({'1m':60000,'5m':300000,'15m':900000,'1h':3600000,'4h':14400000,'1d':86400000});
const fmt=(n,d=6)=>Number(n).toLocaleString('fr-FR',{maximumFractionDigits:d});
function paintLesson(){
 const info=globalThis.AgentCryptoMarketMicroscope?.snapshot?.()||{};
 const instrument=String(info.loadedInstrument||'').toUpperCase();
 const interval=String(info.loadedBar||'');
 const rows=Array.isArray(info.rows)?info.rows:[];
 const valid=info.mode==='candles'&&/^CT-(USDT|USDC)$/.test(instrument)&&rows.length>0;
 const lines=[];
 if(!valid){
   lines.push('Sélectionne Concrete (CT), affiche Bougies et charge sa période. Aucune analyse ne sera inventée pour un autre actif.');
 }else{
   const bar=rows[rows.length-1],open=Number(bar.o),close=Number(bar.c);
   const volume=Number(bar.v),time=Number(bar.t),age=Date.now()-time;
   const fresh=Number.isFinite(age)&&age>=0&&age<=(periods[interval]||900000)*2;
   lines.push('Source graphique : '+instrument+' · période '+interval+' · '+rows.length+' bougies. CT/USDT ne représente pas le prix de revente de ta position CT/USDC.');
   if(!fresh)lines.push('DONNÉES ANCIENNES ou heure non vérifiée : suspendre toute interprétation de mouvement récent et actualiser les bougies.');
   if(Number.isFinite(open)&&Number.isFinite(close)){
     const color=close>open?'verte (progression)':close<open?'rouge (recul)':'neutre';
     lines.push('Bougie affichée : '+color+' · ouverture '+fmt(open)+' · dernier cours '+fmt(close)+' '+instrument.split('-')[1]+'. La bougie en cours peut encore changer.');
   }
   if(helpMode==='learn'){
     lines.push('Une bougie indique quatre prix : ouverture, plus haut, plus bas et dernier cours/clôture pour l’intervalle sélectionné.');
     lines.push('Le volume mesure la quantité négociée sur la période, pas la quantité des ordres en attente. '+(Number.isFinite(volume)?'Volume de cette bougie : '+fmt(volume,2)+' CT (potentiellement en cours).':'Volume de cette bougie indisponible.'));
     lines.push('Le carnet montre des intentions d’achat et de vente qui peuvent être retirées. Pour une vente réelle, vérifie le marché CT/USDC.');
   }else{
     const levels=globalThis.AgentCryptoMarketMicroscope?.technicalLevels?.();
     if(levels?.instrument===instrument&&levels?.bar===interval){
       const support=Number(levels.support?.price),resistance=Number(levels.resistance?.price);
       if(Number.isFinite(support)&&Number.isFinite(resistance))
         lines.push('Repères du graphique : support '+fmt(support)+' · résistance '+fmt(resistance)+' '+instrument.split('-')[1]+'. Ce sont des zones d’observation, pas des ordres ni des prévisions.');
     }
     lines.push('Analyse prudente : une seule bougie ou un déséquilibre visible du carnet ne confirme pas une tendance. Croiser plusieurs bougies, volumes, fraîcheur et liquidité avant d’interpréter.');
     lines.push('Ta position est en CT/USDC. Pour son solde, ses frais et une estimation de revente, utilise « Lire ma position CT/USDC » ci-dessous ; cette lecture privée est manuelle.');
   }
   if(!fresh)lines.push('Les données anciennes ne doivent jamais être qualifiées de signal actuel.');
 }
 if(helpMode==='learn'&&helpTopic&&INDICATORS[helpTopic])lines.push('Indicateur choisi — '+INDICATORS[helpTopic]);
 lesson.replaceChildren();
 lines.forEach((line,i)=>{const p=document.createElement('p');p.textContent=line;if(i===0)p.className='ai-ct-source';lesson.appendChild(p);});
}
function setHelpMode(mode){
 helpMode=mode==='analyze'?'analyze':'learn';
 learnButton.setAttribute('aria-pressed',String(helpMode==='learn'));
 analyzeButton.setAttribute('aria-pressed',String(helpMode==='analyze'));
 paintLesson();
}
learnButton.addEventListener('click',()=>setHelpMode('learn'));
analyzeButton.addEventListener('click',()=>setHelpMode('analyze'));
panel.addEventListener('toggle',()=>{expandLabel.textContent=panel.open?'Réduire':'Ouvrir';if(panel.open)paintLesson();});
document.getElementById('atlasMarketMicroscope')?.addEventListener('click',event=>{
 const chosen=event.target?.closest?.('[data-amm-indicator]');
 if(!chosen||!INDICATORS[chosen.dataset.ammIndicator])return;
 helpTopic=chosen.dataset.ammIndicator;
 if(panel.open&&helpMode==='learn')queueMicrotask(paintLesson);
});
window.addEventListener('agent-crypto:candles-technical-levels',()=>{if(panel.open)paintLesson();},{passive:true});
setHelpMode('learn');
read.addEventListener('click',refresh);
// Point d'entrée interne pour le bouton du Compte OKX, sans navigation forcée.
globalThis.AgentCryptoAiCtPanel=Object.freeze({readForAccount,read_only:true});
window.addEventListener('aether-trust:logout-requested',()=>{
 latest=null;copy.disabled=true;body.replaceChildren();
 const local=document.querySelector('#traderOkxAccountPanel [data-okx-ctreading]');
 if(local){local.hidden=true;local.replaceChildren();}
},{passive:true});
copy.addEventListener('click',async()=>{
 if(!latest)return;
 // Explicit user action: private overview copied locally, never uploaded automatically.
 const sanitized={schema:latest.schema,market:latest.market,quote:latest.quote,read_only:true,
 portfolio:latest.portfolio,position:latest.position,acquisition:latest.acquisition,fee_taker_fraction:latest.fee_taker_fraction,
 exit_metrics:latest.exit_metrics,
 instrument_rules:latest.instrument_rules,order_assessment:latest.order_assessment,
 scenario_grid:latest.scenario_grid,partial_exit_grid:latest.partial_exit_grid,
 liquidation_illustrative:latest.liquidation_illustrative,
 pnl_illustrative_usdc:latest.pnl_illustrative_usdc,profit_proven:false};
 try{await navigator.clipboard.writeText(JSON.stringify(sanitized,null,2));state('Résumé privé copié. Partage uniquement si tu le souhaites.');}
 catch(_){state('Copie bloquée par le navigateur.');}
});
})();
