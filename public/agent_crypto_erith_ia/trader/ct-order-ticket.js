/* ERITH.IA · CT order draft UI inside the existing Trader OKX analysis.
   No network, no transaction button, no new pane, no scroll and no saved state. */
(()=>{'use strict';
 const draft=globalThis.AgentCryptoCtOrderDraft;
 const rules=globalThis.AgentCryptoAiCtContract;
 if(!draft||!rules)return;
 function el(tag,cls,text){
  const n=document.createElement(tag);
  if(cls)n.className=cls;
  if(text!==undefined)n.textContent=text;
  return n;
 }
 function label(name,input){
  const l=el('label','ct-ticket-field');
  l.append(el('span','',name),input);
  return l;
 }
 function mount(target,doc){
  if(!target?.isConnected||!target.closest('#traderOkxAccountPanel'))return false;
  if(doc?.market!=='CT-USDC'||doc?.read_only!==true||doc?.orders_enabled!==false)return false;
  if(!document.getElementById('ctOrderTicketStyle')){
   const link=el('link');link.id='ctOrderTicketStyle';link.rel='stylesheet';
   link.href=new URL('../trader/ct-order-ticket.css',document.baseURI).href;
   document.head.append(link);
  }
  const section=el('details','ct-order-ticket');
  section.dataset.ctOrderDraft='true';
  section.append(el('summary','','Ticket d’ordre CT/USDC · Achat / Vente · brouillon'));
  const inner=el('div','ct-ticket-body');
  inner.append(el('p','ct-ticket-explainer',
   'Simulation de préparation uniquement. La paire est CT/USDC Spot, jamais CT/USDT. Pas de validation bancaire ni d’ordre envoyé.'));
  const grid=el('div','ct-ticket-grid');
  const side=el('select');side.setAttribute('aria-label','Sens de l’ordre');
  for(const [value,text] of [['buy','Acheter CT'],['sell','Vendre CT']]){
   const opt=el('option','',text);opt.value=value;side.append(opt);
  }
  const type=el('input');type.value='Limite (fixe)';type.readOnly=true;
  type.setAttribute('aria-label','Type d’ordre en simulation');
  const quantity=el('input');quantity.type='text';quantity.inputMode='decimal';
  quantity.placeholder='ex. 10';quantity.autocomplete='off';quantity.spellcheck=false;
  quantity.setAttribute('aria-label','Quantité CT');
  const price=el('input');price.type='text';price.inputMode='decimal';
  price.placeholder='ex. 0,3522';price.autocomplete='off';price.spellcheck=false;
  price.setAttribute('aria-label','Prix limite en USDC par CT');
  grid.append(label('Sens',side),label('Type',type),
              label('Quantité (CT)',quantity),label('Prix limite (USDC / CT)',price));
  inner.append(grid);
  const button=el('button','ct-ticket-compute','Vérifier mon brouillon');
  button.type='button';
  inner.append(button);
  const result=el('div','ct-ticket-results','Saisis un sens, une quantité et un prix limite pour afficher le brouillon.');
  result.setAttribute('role','status');result.setAttribute('aria-live','polite');
  inner.append(result);
  const status=el('p','ct-ticket-safety','EXÉCUTION BLOQUÉE · pas de clé Trade, pas d’ordre, pas de bot actif.');
  inner.append(status);
  section.append(inner);
  button.addEventListener('click',()=>{
   const proposed=draft.prepare(doc,{
     side:side.value,quantity_ct:quantity.value,limit_price_usdc:price.value
   },rules,Date.now());
   result.replaceChildren();
   const heading=el('strong','',proposed.input_verified
     ?'Brouillon calculé · NON exécutable'
     :'Brouillon incomplet ou règles non vérifiées · NON exécutable');
   result.append(heading);
   const table=el('dl','ct-ticket-values');
   for(const [name,value] of [
    ['Instrument','OKX Spot · CT/USDC'],
    ['Action',proposed.side==='buy'?'Acheter':proposed.side==='sell'?'Vendre':'Non renseignée'],
    ['Ordre','Limite'],
    ['Quantité',proposed.quantity_ct===null?'Non vérifiée':proposed.quantity_ct+' CT'],
    ['Prix limite',proposed.limit_price_usdc===null?'Non vérifié':proposed.limit_price_usdc+' USDC/CT'],
    ['Montant brut',proposed.notional_usdc===null?'Non calculable':proposed.notional_usdc+' USDC'],
    ['Frais',proposed.fee_taker_fraction===null?'Non vérifiés':
       'Hypothèse taker '+(proposed.fee_taker_fraction*100).toLocaleString('fr-FR',{maximumFractionDigits:5})+' % (devise réelle inconnue)']
   ]){
    const row=el('div','');row.append(el('dt','',name),el('dd','',value));table.append(row);
   }
   result.append(table);
   result.append(el('strong','ct-ticket-lock','Bloqué pour exécution :'));
   const list=el('ul','ct-ticket-reasons');
   for(const reason of proposed.reasons)list.append(el('li','',reason));
   result.append(list);
   result.append(el('small','ct-ticket-foot',
    'Les soldes affichés peuvent inclure Funding : ce n’est pas un solde Spot disponible certifié. Aucun ordre ne part du navigateur.'));
  });
  target.append(section);
  return true;
 }
 globalThis.AgentCryptoCtOrderTicket=Object.freeze({mount,read_only:true,orders_enabled:false});
})();
