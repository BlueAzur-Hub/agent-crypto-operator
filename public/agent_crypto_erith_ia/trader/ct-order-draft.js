/* ERITH.IA · Spot CT/USDC · brouillon non exécutable.
   Reuses the existing AgentCryptoAiCtContract exact-pair quantity checks.
   No I/O, account token, cache, order submission or exchange transport. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.AgentCryptoCtOrderDraft=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const MARKET='CT-USDC', SCALE=1000000000000n, MAX_AGE_MS=120000;
  function decimal(raw){
    const text=String(raw??'').trim().replace(',','.');
    if(!/^\d+(?:\.\d{1,12})?$/.test(text))return null;
    const [whole,fraction='']=text.split('.');
    if(whole.length>12)return null;
    const value=BigInt(whole)*SCALE+BigInt(fraction.padEnd(12,'0'));
    return value>0n&&value<1000000000000n*SCALE?value:null;
  }
  function display(n){
    if(typeof n!=='bigint'||n<0n)return null;
    return (n/SCALE).toString()+'.'+(n%SCALE).toString().padStart(12,'0').replace(/0+$/,'').padEnd(1,'0');
  }
  function fresh(timestamp,now){
    const t=Date.parse(String(timestamp||''));
    return Number.isFinite(t)&&now>=t&&now-t<=MAX_AGE_MS;
  }
  function prepare(doc,proposal,model,now=Date.now()){
    const reasons=[];
    const side=proposal?.side==='buy'?'buy':proposal?.side==='sell'?'sell':null;
    const quantity=decimal(proposal?.quantity_ct);
    const price=decimal(proposal?.limit_price_usdc);
    if(!side)reasons.push('Choisir Acheter ou Vendre.');
    if(quantity===null)reasons.push('Quantité CT positive, au maximum 12 décimales, requise.');
    if(price===null)reasons.push('Prix limite en USDC/CT positif, au maximum 12 décimales, requis.');
    if(doc?.schema!=='erith.ai.gateway.ct.readonly.v1'||doc?.market!==MARKET||
       doc?.quote!=='USDC'||doc?.read_only!==true||doc?.orders_enabled!==false)
      reasons.push('Contrat privé CT/USDC non vérifié ; ne jamais remplacer par CT/USDT.');
    if(!fresh(doc?.observed_at,now))reasons.push('Lecture du compte trop ancienne : actualiser l’analyse CT.');
    const rules=doc?.instrument_rules;
    if(rules?.status!=='verified'||rules?.market!==MARKET||
       rules?.quote!=='USDC'||rules?.base!=='CT'||!fresh(rules?.checked_at,now))
      reasons.push('Règles Spot CT/USDC absentes ou périmées.');
    else{
      if(rules.state!=='live')reasons.push('Marché Spot CT/USDC non déclaré actif.');
      if(price!==null){
        const tick=decimal(rules.tick_sz);
        if(tick===null||price%tick!==0n)reasons.push('Prix hors du pas OKX tickSz ('+rules.tick_sz+' USDC).');
      }
      if(quantity!==null){
        const test=typeof model?.assessSpotQuantity==='function'
          ?model.assessSpotQuantity(Number(proposal.quantity_ct?.toString().replace(',','.')),rules)
          :null;
        if(test?.status!=='size_matches')
          reasons.push(test?.message||'Contrôle du minimum minSz et pas lotSz indisponible.');
        // Recheck the original decimal, without floating point or silent rounding.
        const min=decimal(rules.min_sz),lot=decimal(rules.lot_sz);
        if(min===null||lot===null||quantity<min||quantity%lot!==0n)
          reasons.push('Contrôle décimal exact minSz / lotSz non satisfait.');
      }
    }
    const portfolio=doc?.portfolio?.assets||{};
    const balance=side==='sell'?portfolio.CT:portfolio.USDC;
    if(balance?.verified!==true||!Number.isFinite(balance.qty)||balance.qty<0)
      reasons.push('Solde '+(side==='sell'?'CT':'USDC')+' non vérifié.');
    const notional=quantity!==null&&price!==null?quantity*price/SCALE:null;
    const held=decimal(side==='sell'?doc?.position?.qty_ct:portfolio?.USDC?.qty);
    if(side==='sell'&&quantity!==null&&balance?.verified===true&&balance.qty===0)
      reasons.push('Aucun CT observé : vente impossible après liquidation.');
    if(side==='sell'&&quantity!==null&&held!==null&&quantity>held)
      reasons.push('Quantité demandée supérieure au total CT observé.');
    if(side==='buy'&&notional!==null&&held!==null&&notional>held)
      reasons.push('Montant supérieur au total USDC observé.');
    const fee=doc?.fee_taker_fraction;
    if(!Number.isFinite(fee)||fee<0||fee>=1)
      reasons.push('Frais futurs non suffisamment documentés.');
    // Intentionally not approved: Funding + Trading totals are not proof of
    // free Spot balance, future fee currency, account restrictions or minNotional.
    reasons.push('Solde réellement disponible pour Spot et restrictions du compte non certifiés.');
    reasons.push('Minimum notionnel, devise réelle des frais et contrôle de risque non certifiés.');
    reasons.push('Exécution désactivée : aucun ordre OKX n’est émis par ce ticket.');
    return Object.freeze({
      schema:'erith.trader.ct.order_draft.v1',market:MARKET,venue:'OKX',kind:'SPOT',
      side,order_type:'limit',status:'blocked',read_only:true,executable:false,
      quantity_ct:quantity===null?null:display(quantity),
      limit_price_usdc:price===null?null:display(price),
      notional_usdc:notional===null?null:display(notional),
      fee_taker_fraction:Number.isFinite(fee)&&fee>=0&&fee<1?fee:null,
      fee_estimate_note:'Hypothèse de frais taker, devise effective non prouvée.',
      input_verified:reasons.length===3,
      reasons:Object.freeze(reasons),generated_at:new Date(now).toISOString(),
    });
  }
  return Object.freeze({MARKET,MAX_AGE_MS,prepare});
});
