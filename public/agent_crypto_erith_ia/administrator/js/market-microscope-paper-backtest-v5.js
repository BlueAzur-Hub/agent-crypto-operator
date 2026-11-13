/* ERITH.IA — V5 historical PAPER EMA simulation. Read-only; standalone; no order endpoints. */
(function v5Factory(){
  "use strict";
  if(globalThis.ErithMarketPaperBacktestV5)return;
  const BAR_MS=Object.freeze({"1m":60000,"5m":300000,"15m":900000,"30m":1800000,"1h":3600000,"4h":14400000,"1j":86400000});
  const DEFAULT=Object.freeze({initialCapital:1000,feePercent:0.1,slippagePercent:0.05});
  const ID="erithPaperBacktestV5";
  const currencyCode=instrument=>String(instrument).split("-")[1]||"COTATION";
  const error=(code,message)=>Object.freeze({ok:false,code,message,read_only:true,orders:0});
  function settingsValid(s){return s&&typeof s==="object"&&Number.isFinite(s.initialCapital)&&s.initialCapital>=10&&s.initialCapital<=1000000&&Number.isFinite(s.feePercent)&&s.feePercent>=0&&s.feePercent<=2&&Number.isFinite(s.slippagePercent)&&s.slippagePercent>=0&&s.slippagePercent<=2;}
  function simulate(snapshot,cross,settings=DEFAULT,nowMs=Date.now()){
    if(!settingsValid(settings))return error("INVALID_SETTINGS","Capital 10–1 000 000, frais et glissement 0–2 %.");
    if(!Number.isFinite(nowMs)||nowMs<=0)return error("CLOCK_INVALID","Horloge invalide.");
    if(!snapshot||!cross||snapshot.loading||snapshot.error||snapshot.archivePeriod||snapshot.mode!=="candles")return error("SERIES_UNAVAILABLE","Bougies OKX en attente, en erreur ou hors vue Bougies.");
    const pair=String(snapshot.loadedInstrument||""),bar=String(snapshot.loadedBar||""),source=String(snapshot.source||"");
    const duration=BAR_MS[bar];
    if(!duration||!/^OKX\b/i.test(source)||!/^([A-Z0-9]+)-([A-Z0-9]+)$/.test(pair)
       ||cross.instrument!==pair||cross.bar!==bar||cross.archiveSupported!==true||!Array.isArray(cross.events)
       ||!Array.isArray(snapshot.emaPeriods)||cross.fastPeriod!==snapshot.emaPeriods[0]||cross.slowPeriod!==snapshot.emaPeriods[1]
       ||!Array.isArray(snapshot.rows))return error("CONTEXT_MISMATCH","Source, paire, période ou paramètres EMA incohérents : simulation refusée.");
    if(!Number.isInteger(cross.fastPeriod)||!Number.isInteger(cross.slowPeriod)||cross.fastPeriod<2||cross.fastPeriod>=cross.slowPeriod||cross.slowPeriod>200)return error("EMA_INVALID","Périodes EMA invalides.");
    const raw=snapshot.rows;
    if(raw.length<cross.slowPeriod+3)return error("HISTORY_TOO_SHORT","Historique insuffisant pour simuler les EMA sélectionnées.");
    const rows=[];let unfinished=0;
    for(let i=0;i<raw.length;i++){
      const r=raw[i];const t=Number(r?.t),o=Number(r?.o),h=Number(r?.h),l=Number(r?.l),c=Number(r?.c);
      if(![t,o,h,l,c].every(Number.isFinite)||t<=0||o<=0||h<=0||l<=0||c<=0||h<Math.max(o,c,l)||l>Math.min(o,c,h))return error("OHLC_INVALID","OHLC historique invalide : simulation refusée.");
      if(i&&t-Number(raw[i-1]?.t)!==duration)return error("HISTORY_GAP","Trou, doublon ou inversion dans les bougies : simulation refusée.");
      if(t+duration>nowMs||String(r?.confirm)==="0"||String(r?.confirm)==="false"){
        if(i!==raw.length-1)return error("UNCONFIRMED_HISTORY","Bougie non clôturée au milieu de l'historique.");
        unfinished++;continue;
      }
      rows.push({t,o,h,l,c});
    }
    if(rows.length<cross.slowPeriod+3)return error("CLOSED_HISTORY_TOO_SHORT","Pas assez de bougies clôturées.");
    const events=[];const seen=new Set();
    for(const e of cross.events){
      const i=e?.index;
      if(!Number.isInteger(i)||i<=0||i>=raw.length||seen.has(i)||!(["UP","DOWN"].includes(e.direction))
        ||Number(e.t)!==Number(raw[i]?.t)||Number(e.price)!==Number(raw[i]?.c))return error("SIGNAL_INVALID","Événement V4 incohérent : simulation refusée.");
      seen.add(i);
      if(i>=rows.length)continue;
      events.push({index:i,direction:e.direction,t:rows[i].t});
    }
    events.sort((a,b)=>a.index-b.index);
    const fee=settings.feePercent/100,slip=settings.slippagePercent/100;
    let cash=settings.initialCapital,position=null,ignored=0,pending=null;
    const trades=[];
    for(const signal of events){
      const nextIndex=signal.index+1;
      if(nextIndex>=rows.length){pending={direction:signal.direction,t:signal.t};continue;}
      const next=rows[nextIndex];
      if(signal.direction==="UP"){
        if(position){ignored++;continue;}
        const fill=next.o*(1+slip);
        const quantity=cash/(fill*(1+fee));
        if(!(quantity>0)||!Number.isFinite(quantity))return error("FILL_INVALID","Quantité simulée invalide.");
        position={signalAt:signal.t,entryAt:next.t,entryPrice:fill,quantity,capitalCommitted:cash};cash=0;
      }else{
        if(!position){ignored++;continue;}
        const fill=next.o*(1-slip),gross=position.quantity*fill,proceeds=gross*(1-fee);
        const profit=proceeds-position.capitalCommitted;
        trades.push(Object.freeze({entrySignalAt:position.signalAt,exitSignalAt:signal.t,entryAt:position.entryAt,exitAt:next.t,entryPrice:position.entryPrice,exitPrice:fill,quantity:position.quantity,capitalBefore:position.capitalCommitted,capitalAfter:proceeds,pnl:profit,returnPercent:100*profit/position.capitalCommitted}));
        cash=proceeds;position=null;
      }
    }
    const closedNetPnL=trades.reduce((sum,t)=>sum+t.pnl,0);
    // Comparison V5: same eligible entry opportunity after slow-EMA warm-up,
    // and same last CLOSED bar. Both equity figures include hypothetical exit costs.
    // The existing realized (closed trades only) V5 profit remains unchanged.
    const firstTradable=rows[cross.slowPeriod+1],lastClosed=rows.at(-1);
    const holdEntryPrice=firstTradable.o*(1+slip);
    const holdQuantity=settings.initialCapital/(holdEntryPrice*(1+fee));
    const hypotheticalExitPrice=lastClosed.c*(1-slip);
    const holdFinal=holdQuantity*hypotheticalExitPrice*(1-fee);
    const emaFinal=position?position.quantity*hypotheticalExitPrice*(1-fee):cash;
    if(![holdEntryPrice,holdQuantity,hypotheticalExitPrice,holdFinal,emaFinal].every(Number.isFinite)
       ||Math.min(holdEntryPrice,holdQuantity,hypotheticalExitPrice,holdFinal,emaFinal)<0)
      return error("COMPARISON_INVALID","Comparaison de valeur finale impossible.");
    const comparison=Object.freeze({
      read_only:true,orders:0,startAt:firstTradable.t,endAt:lastClosed.t,
      quote:currencyCode(pair),initialCapital:settings.initialCapital,
      holdEntryPrice,holdQuantity,holdFinal,
      holdNetPnL:holdFinal-settings.initialCapital,
      holdReturnPercent:100*(holdFinal/settings.initialCapital-1),
      emaFinal,emaNetPnL:emaFinal-settings.initialCapital,
      emaReturnPercent:100*(emaFinal/settings.initialCapital-1),
      emaHasOpenPosition:!!position,
      advantage:emaFinal-holdFinal,
      method:"Same eligible entry date after slow EMA warm-up, same last closed candle; buy and hold enters once at next open; both valued at hypothetical liquidation with entry/exit fees and slippage, no real trades"
    });
    return Object.freeze({ok:true,mode:"HISTORICAL_PAPER_LONG_ONLY",read_only:true,orders:0,source,pair,bar,quote:currencyCode(pair),bars:rows.length,excludedFormingBars:unfinished,fastPeriod:cross.fastPeriod,slowPeriod:cross.slowPeriod,settings:Object.freeze({...settings}),events:events.length,ignoredSignals:ignored,pendingSignal:pending,openPosition:position?Object.freeze({...position}):null,closedTrades:Object.freeze(trades),closedNetPnL,closedReturnPercent:100*closedNetPnL/settings.initialCapital,comparison,capitalAfterClosedTrades:settings.initialCapital+closedNetPnL,lastClosedAt:rows.at(-1).t,method:"Closed OKX OHLC, V4 EMA cross; next contiguous bar open; long-only spot; fee/slippage each side; no look-ahead, mark-to-market or orders"});
  }
  function node(tag,attributes={},value){const el=document.createElement(tag);for(const [k,v] of Object.entries(attributes))el.setAttribute(k,String(v));if(value!==undefined)el.textContent=value;return el;}
  function mount(){
    if(typeof document==="undefined")return false;
    const host=document.getElementById("erithStrategyOptionsPanel");if(!host||document.getElementById(ID))return !!host;
    const section=node("section",{id:ID,"aria-label":"V5 Simulation historique PAPER",style:"border-top:1px solid #316b7f;margin-top:12px;padding-top:12px"});
    section.append(node("strong",{},"V5 · Simulation historique PAPER — EMA"));
    section.append(node("p",{},"Long uniquement : P↑ → achat fictif à l'ouverture de la bougie suivante ; P↓ → vente fictive. Bougies OKX clôturées, aucune exécution réelle."));
    const inputs=node("div",{class:"erith-row",style:"display:flex;gap:8px;flex-wrap:wrap"});
    for(const [name,title,min,max,step,value] of [["capital","Capital fictif",10,1000000,10,1000],["fee","Frais par côté (%)",0,2,.01,.1],["slippage","Glissement par côté (%)",0,2,.01,.05]]){
      const label=node("label",{},title);
      const attrs=name==="fee"
        ? {type:"text",inputmode:"decimal",value:"0,10","data-v5":name,
           "aria-label":"Frais OKX Spot Taker par côté : 0,10 %",style:"width:110px;display:block"}
        : {type:"number",min,max,step,value,"data-v5":name,style:"width:110px;display:block"};
      label.append(node("input",attrs));inputs.append(label);
    }
    section.append(inputs);
    const action=node("button",{type:"button","data-v5-run":"true"},"Calculer la simulation PAPER");section.append(action);
    const output=node("p",{id:"erithPaperV5Result",role:"status","aria-live":"polite"},"À la demande uniquement ; aucun ordre, aucune connexion supplémentaire.");section.append(output);
    const details=node("div",{id:"erithPaperV5Trades"});section.append(details);
    const comparisonPanel=node("div",{id:"erithPaperV5BuyHold",style:"margin-top:12px;padding:10px;border:1px solid #397b81;border-radius:9px;background:#061d29"});
    comparisonPanel.append(node("strong",{},"Comparer à Acheter et conserver (Buy & Hold)"));
    const comparisonBody=node("div",{id:"erithPaperV5BuyHoldResult",role:"status","aria-live":"polite"});
    comparisonBody.append(node("p",{},"Cliquez sur « Calculer la simulation PAPER » : le comparatif utilisera les mêmes bougies, le même capital, les mêmes frais et le même glissement."));
    comparisonPanel.append(comparisonBody);section.insertBefore(comparisonPanel,details);
    action.addEventListener("click",()=>{
      const value=key=>{
        const raw=section.querySelector(`[data-v5="${key}"]`)?.value;
        return raw==null||String(raw).trim()===""?NaN:Number(String(raw).trim().replace(",","."));
      };
      const source=globalThis.AgentCryptoMarketMicroscope;
      const result=simulate(source?.snapshot?.(),source?.paperEmaCrossSnapshot?.(),{initialCapital:value("capital"),feePercent:value("fee"),slippagePercent:value("slippage")});
      details.replaceChildren();comparisonBody.replaceChildren();
      if(!result.ok){
        output.textContent="Simulation refusée : "+result.message+" ["+result.code+"]";
        comparisonBody.append(node("p",{},"Comparaison indisponible : simulation V5 refusée, aucune valeur inventée."));
        return;
      }
      const f=n=>Number(n).toLocaleString("fr-FR",{maximumFractionDigits:2});
      output.textContent=`${result.pair} · ${result.bar} · ${result.bars} bougies clôturées · ${result.events} signaux · ${result.closedTrades.length} allers-retours · PnL clôturé ${f(result.closedNetPnL)} ${result.quote} (${f(result.closedReturnPercent)} %) · ${result.openPosition?"position fictive EN COURS, résultat non réalisé exclu":"aucune position ouverte"}.`;
      details.append(node("small",{},`Capital fictif initial ${f(result.settings.initialCapital)} ${result.quote} · frais ${f(result.settings.feePercent)} %/côté · glissement ${f(result.settings.slippagePercent)} %/côté · ${result.pendingSignal?"dernier signal en attente d'une bougie suivante clôturée":"aucun signal en attente"}. Résultat historique non prédictif.`));
      const cmp=result.comparison;
      comparisonBody.append(node("p",{},"Même période : "+new Date(cmp.startAt).toISOString().slice(0,10)
        +" → "+new Date(cmp.endAt).toISOString().slice(0,10)+" UTC · capital fictif "+f(cmp.initialCapital)+" "+cmp.quote+"."));
      const grid=node("div",{style:"display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px"});
      for(const [label,finalValue,pnl,pct] of [
        ["EMA "+result.fastPeriod+"/"+result.slowPeriod,cmp.emaFinal,cmp.emaNetPnL,cmp.emaReturnPercent],
        ["Acheter et conserver",cmp.holdFinal,cmp.holdNetPnL,cmp.holdReturnPercent]
      ]){
        const card=node("div",{style:"min-width:0;border:1px solid #385e6d;border-radius:7px;padding:8px;background:#082637"});
        card.append(node("strong",{},label));
        card.append(node("div",{style:"margin-top:5px;font-weight:900;color:#dcf7ff"},f(finalValue)+" "+cmp.quote));
        card.append(node("div",{style:"font-size:11px;color:"+(pnl>=0?"#a9e8cd":"#ffb7ad")},(pnl>=0?"+":"")+f(pnl)+" "+cmp.quote+" ("+(pct>=0?"+":"")+f(pct)+" %)"));
        grid.append(card);
      }
      comparisonBody.append(grid);
      const better=cmp.advantage>0?"EMA devant de ":cmp.advantage<0?"Acheter et conserver devant de ":"Égalité (écart : ";
      comparisonBody.append(node("p",{style:"font-weight:800;color:#ffdfa0"},better+f(Math.abs(cmp.advantage))+" "+cmp.quote+(cmp.advantage===0?").":".")));
      comparisonBody.append(node("small",{},"Valeurs de liquidation FICTIVE à la dernière clôture : frais et glissement appliqués à l'entrée et à la sortie hypothétique. "+
        (cmp.emaHasOpenPosition?"Une position EMA reste fictivement ouverte ; sa valeur est estimée, non réalisée. ":"Aucune position EMA ouverte. ")+
        "Le PnL clôturé V5 ci-dessus reste inchangé. Historique non prédictif, aucun ordre."));
      for(const trade of result.closedTrades.slice(-8))details.append(node("p",{},`${new Date(trade.entryAt).toISOString().slice(0,16)} → ${new Date(trade.exitAt).toISOString().slice(0,16)} UTC · PnL ${f(trade.pnl)} ${result.quote} (${f(trade.returnPercent)} %)`));
    });
    const anchor=host.querySelector("#erithStrategyName")?.closest(".erith-row")?.previousElementSibling;
    if(anchor)host.insertBefore(section,anchor);else host.append(section);
    return true;
  }
  const api=Object.freeze({version:"2026-11-07-v5-historical-paper-ema-buy-hold",simulate,mount,defaults:DEFAULT,read_only:true,real_order:false,paper_execution:false,api_credentials:false});
  globalThis.ErithMarketPaperBacktestV5=api;
  if(typeof document!=="undefined"){
    const boot=()=>mount();
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
    globalThis.addEventListener?.("pageshow",boot,{passive:true});
    globalThis.addEventListener?.("atlas:v2mode",()=>queueMicrotask(boot),{passive:true});
  }
})();
