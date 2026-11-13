/* ERITH.IA — PAPER realism bridge for Administrator + mirrored Trader.
 * This module never sends orders, requests credentials, or changes V5/V6.
 * Public OKX lot/min/tick metadata: frozen observed 2026-11-13 01:41 UTC.
 * The panel is comparative/educational, not proof of EEA account eligibility.
 */
(()=>{
"use strict";
if(globalThis.SevenHeavenPaperSpotRealism)return;
const ID="sevenHeavenPaperSpotRealism";
const META=Object.freeze({
  "BTC-USDC":Object.freeze({instId:"BTC-USDC",instType:"SPOT",state:"live",minSz:"0.00001",lotSz:"0.00000001",tickSz:"0.1"}),
  "ETH-USDC":Object.freeze({instId:"ETH-USDC",instType:"SPOT",state:"live",minSz:"0.001",lotSz:"0.000001",tickSz:"0.01"})
});
const SPEC_DATE="2026-11-13T01:41:02Z";
const warn="Simulation PAPER sur règles publiques figées, frais fictifs en USDC. Ni ordonnance réelle, ni conformité du compte européen certifiée.";
const bad=(code,message)=>Object.freeze({ok:false,code,message,read_only:true,orders:0});
const pure=()=>globalThis.SevenHeavenSpotPaperLotAdapter;
const v5=()=>globalThis.ErithMarketPaperBacktestV5;
const v6=()=>globalThis.ErithMarketBookPaperV6;
function money(n){return Number(n).toLocaleString("fr-FR",{maximumFractionDigits:6});}
function fixedPrice(value){
  if(!Number.isFinite(value)||value<=0||value>=1e12)throw Error("Prix invalide");
  // Only BTC/ETH USDC, declared quantization is a PAPER approximation, not a limit order.
  return value.toFixed(8);
}
function feePpm(pct){
  const p=Number(pct);
  if(!Number.isFinite(p)||p<0||p>2)throw Error("Frais PAPER invalides");
  return Math.round(p*10000);
}
function compareV5(snapshot,cross,settings,nowMs=Date.now()){
  const engine=v5(),adapter=pure();
  if(!engine||!adapter)return bad("DEPENDENCY_UNAVAILABLE","Moteur PAPER V5 ou adaptateur de calcul absent.");
  const original=engine.simulate(snapshot,cross,settings,nowMs);
  if(!original.ok)return bad(original.code,"V5 refuse la simulation : "+original.message);
  const spec=META[original.pair];
  if(!spec)return bad("INSTRUMENT_NOT_STUDIED","Comparaison limitée à BTC-USDC et ETH-USDC.");
  if(!original.comparison||!Array.isArray(original.closedTrades))
    return bad("V5_CONTRACT","Rapport V5 incomplet.");
  try{
    const fee=feePpm(settings.feePercent);
    let cash=String(settings.initialCapital),inventory="0";
    let blocked=0,completed=0,tradeLog=[];
    for(const t of original.closedTrades){
      if(inventory!=="0")throw Error("Inventaire déjà ouvert avant l'achat suivant");
      const entry=adapter.referenceBuy({spec,budget:cash,referencePrice:fixedPrice(t.entryPrice),feePpm:fee,slipPpm:0});
      if(!entry.ok){
        blocked++;
        tradeLog.push({entryAt:t.entryAt,status:entry.code,side:"BUY"});
        continue;
      }
      cash=entry.cash_remainder_usdc;
      inventory=entry.quantity_base;
      const exit=adapter.referenceSell({spec,inventoryBase:inventory,referencePrice:fixedPrice(t.exitPrice),feePpm:fee,slipPpm:0});
      if(!exit.ok)throw Error("Vente refusée après achat accepté : "+exit.code);
      // Keep the complete PAPER ledger in exact 12-decimal fixed-point arithmetic.
      cash=decimalSum(entry.cash_remainder_usdc,exit.net_proceeds_usdc);
      if(exit.inventory_after_base!=="0")throw Error("Inventaire résiduel inattendu");
      inventory="0";completed++;
      tradeLog.push({entryAt:t.entryAt,exitAt:t.exitAt,quantity_base:entry.quantity_base,
        cash_after_sell_usdc:cash,status:"PAPER_CLOSED"});
    }
    if(original.openPosition){
      const entry=adapter.referenceBuy({spec,budget:cash,referencePrice:fixedPrice(original.openPosition.entryPrice),feePpm:fee,slipPpm:0});
      if(entry.ok){cash=entry.cash_remainder_usdc;inventory=entry.quantity_base;}
      else {blocked++;tradeLog.push({entryAt:original.openPosition.entryAt,side:"BUY",status:entry.code});}
    }
    let liquidatable=Number(cash);
    if(inventory!=="0"){
      const rows=snapshot.rows;
      const finalRow=rows.find(r=>Number(r.t)===Number(original.lastClosedAt));
      if(!finalRow)throw Error("Dernière clôture non retrouvée");
      const slip=Number(settings.slippagePercent)/100;
      const exit=adapter.referenceSell({spec,inventoryBase:inventory,
        referencePrice:fixedPrice(Number(finalRow.c)*(1-slip)),feePpm:fee,slipPpm:0});
      if(!exit.ok)throw Error("Liquidation fictive indisponible");
      liquidatable+=Number(exit.net_proceeds_usdc);
    }
    const v5Final=original.comparison.emaFinal;
    return Object.freeze({ok:true,orders:0,read_only:true,mode:"PAPER_SAME_V5_TRADES_LOT_FLOORED",
      pair:original.pair,metadataObservedAt:SPEC_DATE,
      original_v5_final:v5Final,
      rounded_paper_final:liquidatable,
      difference_usdc:liquidatable-v5Final,
      original_closed_trade_count:original.closedTrades.length,
      rounded_closed_trade_count:completed,
      min_size_blocked_buy_count:blocked,
      rounded_open_quantity_base:inventory,
      remaining_cash_usdc:cash,
      initial_capital_usdc:settings.initialCapital,
      audit:"Rejoue les mêmes entrées et sorties fictives que V5; frais sur lots arrondis, reliquat cash préservé. Aucun nouvel ordre ni signal."});
  }catch(e){return bad("ROUNDING_REPLAY_FAILED",String(e.message||e).slice(0,300));}
}
function decimalSum(a,b){
  const atom=s=>{
    const x=String(s),neg=x.startsWith("-");
    const z=neg?x.slice(1):x,parts=z.split(".");
    if(!/^\d+$/.test(parts[0])||!/^(\d{0,12})$/.test(parts[1]||""))throw Error("Précision inattendue");
    let v=BigInt(parts[0])*1000000000000n+BigInt((parts[1]||"").padEnd(12,"0"));
    return neg?-v:v;
  };
  const v=atom(a)+atom(b),z=v<0n?-v:v,d=(z%1000000000000n).toString().padStart(12,"0").replace(/0+$/,"");
  return (v<0n?"-":"")+(z/1000000000000n).toString()+(d?"."+d:"");
}
function compareV6(book,chart,settings,nowMs=Date.now()){
  const adapter=pure(),engine=v6();
  if(!adapter||!engine)return bad("DEPENDENCY_UNAVAILABLE","Carnet V6 ou adaptateur absent.");
  const source=engine.simulate(book,chart,{side:"BUY",quoteBudget:Number(settings.quoteBudget),feePercent:Number(settings.feePercent)},nowMs);
  if(!source.ok)return bad(source.code,"V6 refuse la lecture du carnet : "+source.message);
  const spec=META[source.pair];
  if(!spec)return bad("INSTRUMENT_NOT_STUDIED","Comparaison limitée à BTC-USDC et ETH-USDC.");
  try{
    const clean={instId:source.pair,sourceObservedAt:book.sourceObservedAt,asks:book.asks,bids:book.bids};
    const rounded=adapter.bookRoundTrip({spec,budget:String(settings.quoteBudget),
      book:clean,nowMs,feePpm:feePpm(settings.feePercent)});
    if(!rounded.ok)return bad(rounded.code,"Contraintes papier : "+rounded.reason);
    return Object.freeze({ok:true,orders:0,read_only:true,mode:"PAPER_INSTANT_SAME_BOOK_ROUNDTRIP",
      pair:source.pair,metadataObservedAt:SPEC_DATE,
      raw_v6_base_quantity:source.baseQuantity,
      rounded_buy_sell_base_quantity:rounded.entry.quantity_base,
      remaining_cash_usdc:rounded.entry.cash_remainder_usdc,
      roundtrip_book_friction_usdc:rounded.pnl_quote_usdc,
      budget_usdc:rounded.start_quote_usdc,
      note:"Carnet instantané FRESH, quantité BUY = SELL; mesure seulement le spread, la profondeur et les frais, pas un profit futur."});
  }catch(e){return bad("V6_ROUNDING_FAILED",String(e.message||e).slice(0,300));}
}
function node(tag,attrs={},value){
  const x=document.createElement(tag);
  for(const [k,v]of Object.entries(attrs))x.setAttribute(k,String(v));
  if(value!==undefined)x.textContent=String(value);
  return x;
}
function mount(){
  if(typeof document==="undefined")return false;
  const host=document.getElementById("erithStrategyOptionsPanel");
  if(!host)return false;
  if(document.getElementById(ID))return true;
  const section=node("section",{id:ID,"aria-label":"Comparateur PAPER des quantités OKX",
    style:"border-top:1px solid #316b7f;margin-top:14px;padding-top:13px"});
  section.append(node("strong",{},"PAPER · Réalisme des quantités OKX — BTC/ETH USDC"));
  section.append(node("p",{style:"margin:6px 0;font-size:12px;opacity:.9"},
    "Comparer les résultats V5 et V6 aux tailles minimales, pas de quantité et frais simulés. Aucune transaction."));
  const button=node("button",{type:"button","data-seven-paper-run":"true"},"Comparer V5 + carnet V6 (PAPER)");
  button.style.margin="5px 0 8px";
  section.append(button);
  const out=node("div",{id:ID+"Results",role:"status","aria-live":"polite"});
  out.append(node("p",{},'Choisir BTC/USDC ou ETH/USDC dans les Bougies, puis cliquer pour effectuer une comparaison fictive.'));
  section.append(out);
  section.append(node("small",{style:"display:block;margin-top:7px;color:#b7c7d2"},
    "Métadonnées OKX publiques observées le 13/11/2026 à 01:41 UTC, non actualisées. "+
    "Frais en USDC supposés, taille minimale de notionnel et droit du compte EEE non vérifiés. "+
    "Aucune modification des simulations V5/V6."));
  button.addEventListener("click",()=>{
    out.replaceChildren();
    const source=globalThis.AgentCryptoMarketMicroscope;
    const v5Panel=document.getElementById("erithPaperBacktestV5");
    const getV5=(key,defaultValue)=>{
      const val=Number(v5Panel?.querySelector('[data-v5="'+key+'"]')?.value);
      return Number.isFinite(val)?val:defaultValue;
    };
    const v5Settings={initialCapital:getV5("capital",1000),feePercent:getV5("fee",0.1),slippagePercent:getV5("slippage",0.05)};
    const historical=compareV5(source?.snapshot?.(),source?.paperEmaCrossSnapshot?.(),v5Settings);
    const hdr=node("p",{},"V5 — quantités arrondies");
    hdr.style.fontWeight="bold";out.append(hdr);
    if(historical.ok){
      out.append(node("p",{},historical.pair+" · V5 original : "+money(historical.original_v5_final)+" USDC"+
       " · avec lots OKX : "+money(historical.rounded_paper_final)+" USDC"+
       " · différence : "+money(historical.difference_usdc)+" USDC."));
      out.append(node("small",{},"Allers-retours arrondis : "+historical.rounded_closed_trade_count+
       " · achats sous minimum refusés : "+historical.min_size_blocked_buy_count+
       " · position ouverte : "+historical.rounded_open_quantity_base+" "+historical.pair.split("-")[0]));
    }else out.append(node("p",{},"V5 indisponible : "+historical.message+" ["+historical.code+"]"));
    const v6Panel=document.getElementById("erithBookPaperV6");
    const quoteInput=Number(v6Panel?.querySelector('[data-v6="quoteBudget"]')?.value);
    const feeInput=Number(v6Panel?.querySelector('[data-v6="feePercent"]')?.value);
    const v6Settings={quoteBudget:Number.isFinite(quoteInput)&&quoteInput>=10?quoteInput:v5Settings.initialCapital,
      feePercent:Number.isFinite(feeInput)&&feeInput>=0?feeInput:v5Settings.feePercent};
    const chart=source?.snapshot?.();
    const v6Read=compareV6(globalThis.AgentCryptoOkxMicrostructure?.snapshot?.(),chart,v6Settings);
    const v6Hdr=node("p",{},"V6 — carnet FRESH, quantité réelle conservée");
    v6Hdr.style.fontWeight="bold";v6Hdr.style.marginTop="9px";out.append(v6Hdr);
    if(v6Read.ok){
      out.append(node("p",{},v6Read.pair+" · achat/vente : "+v6Read.rounded_buy_sell_base_quantity+
        " "+v6Read.pair.split("-")[0]+" · cash restant : "+money(v6Read.remaining_cash_usdc)+
        " USDC · friction aller-retour : "+money(v6Read.roundtrip_book_friction_usdc)+" USDC."));
    }else out.append(node("p",{},"V6 non calculé : "+v6Read.message+" ["+v6Read.code+"]. Ouvrir Profondeur et actualiser le carnet FRESH si nécessaire."));
    out.append(node("small",{style:"display:block;margin-top:7px;color:#c9bec6"},warn));
  });
  host.append(section);
  return true;
}
const api=Object.freeze({version:"2026-11-13-paper-market-realism",read_only:true,real_order:false,
  orders:0,api_credentials:false,metadataObservedAt:SPEC_DATE,compareV5,compareV6,mount});
globalThis.SevenHeavenPaperSpotRealism=api;
if(typeof document!=="undefined"){
  const boot=()=>mount();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  globalThis.addEventListener?.("pageshow",boot,{passive:true});
  // Existing Options panel may be opened after first paint; no timer or polling.
  document.addEventListener("click",e=>{
    if(e.target?.closest?.("#erithStrategyOptionsButton"))queueMicrotask(boot);
  });
}
})();