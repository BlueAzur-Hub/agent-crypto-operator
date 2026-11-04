/* ERITH.IA · Seven Heaven — comparaison historique PAPER.
   Trader only; lazy public summaries, no account, order, storage or market owner. */
(function(root){
"use strict";
const BASE="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/trader_flux/";
const FILES=Object.freeze({
  study:"radar20_portfolio/summary.json",
  stress:"radar20_retro_stress/summary.json"
});
const PERIODS=Object.freeze({
  study:["2026-07-01","2026-09-30"],
  stress:["2026-04-01","2026-06-30"]
});
const COSTS=Object.freeze([0.8,1.2,1.6]);
const PERIOD_SPEC=Object.freeze({
  "7j":Object.freeze({bars:2016,step:300000}),
  "30j":Object.freeze({bars:720,step:3600000}),
  "60j":Object.freeze({bars:1440,step:3600000}),
  "90j":Object.freeze({bars:2160,step:3600000})
});
const PASSIVE_PAIRS=Object.freeze({bitcoin:"BTCUSDT",ethereum:"ETHUSDT"});
const END_ARCHIVE=Date.UTC(2026,9,1);
const numeric=v=>typeof v==="number"&&Number.isFinite(v);
const near=(a,b)=>Math.abs(a-b)<0.02;
function qualifyReport(raw,kind){
  const schema=kind==="study"?"erith.trader.radar20.shared-capital-paper.v1":
    kind==="stress"?"erith.trader.radar20.retrospective-stress.v1":null;
  if(!schema||!raw||raw.schema!==schema||raw.orders_enabled!==false||
      raw.strategy_certified!==false)throw Error("Contrat PAPER ou origine du rapport non conforme");
  const period=kind==="study"?raw.period_utc:raw.period;
  if(!Array.isArray(period)||period.join("|")!==PERIODS[kind].join("|"))
    throw Error("Période d'archive inattendue");
  const p=raw.primary;
  if(!p||p.capital_usdt!==400||p.assumed_roundtrip_fee_pct!==0.8||
      p.hold_hours!==48||!Number.isInteger(p.completed_trades)||
      !Number.isInteger(p.winners)||!Number.isInteger(p.losers)||
      p.completed_trades!==p.winners+p.losers||
      ![p.total_profit_net_usdt,p.final_cash_usdt,p.drawdown_pct,p.fees_paid_usdt].every(numeric)||
      !near(p.final_cash_usdt-400,p.total_profit_net_usdt)||
      p.final_cash_usdt<0||p.drawdown_pct<0||p.drawdown_pct>100||
      p.fees_paid_usdt<0)throw Error("Résultat portefeuille non vérifiable");
  if(kind==="stress"&&(raw.capital_usdt!==400||
      raw.frozen_parameters?.roundtrip_cost_pct!==0.8))
    throw Error("Paramètres du stress historique incompatibles");
  const sensitivity=kind==="study"?raw.primary_fixed_trade_cost_sensitivity_usdt:null;
  if(kind==="study"&&(!sensitivity||
      !COSTS.every(c=>numeric(sensitivity[(c/100).toFixed(3)]))||
      !near(sensitivity["0.008"],p.total_profit_net_usdt)))
    throw Error("Sensibilité aux coûts absente ou contradictoire");
  return Object.freeze({
    kind,period:Object.freeze([...period]),quote:"USDT",capital:400,
    costs:0.8,trades:p.completed_trades,wins:p.winners,losses:p.losers,
    final:p.final_cash_usdt,net:p.total_profit_net_usdt,
    drawdown:p.drawdown_pct,fees:p.fees_paid_usdt,
    sensitivity:sensitivity?Object.freeze(Object.fromEntries(
      COSTS.map(c=>[String(c),sensitivity[(c/100).toFixed(3)]]))):null,
    historical:true,prospective:false,certified:false,realOrders:false
  });
}
function compare(reports,capital,cost){
  if(!Number.isFinite(capital)||![10,10.94,50,100,400].includes(capital)||
      !COSTS.includes(cost))throw Error("Choix PAPER hors protocole");
  if(!reports?.study||!reports?.stress)throw Error("Rapports historiques indisponibles");
  const study=reports.study,stress=reports.stress;
  if(study.kind!=="study"||stress.kind!=="stress")throw Error("Rapports inversés");
  return Object.freeze({
    reserve:Object.freeze({amount:capital,quote:"USDC",change:0,referenceOnly:true}),
    protocolCapital:400,protocolQuote:"USDT",capitalComparable:capital===400,
    cost,study:Object.freeze({
      net:study.sensitivity[String(cost)],
      isOriginalCost:cost===0.8,
      drawdown:cost===0.8?study.drawdown:null,
      trades:study.trades,
      sameTradesSensitivity:cost!==0.8
    }),
    stress:Object.freeze({
      net:cost===0.8?stress.net:null,
      drawdown:cost===0.8?stress.drawdown:null,
      trades:cost===0.8?stress.trades:null,
      uncomputed:cost!==0.8
    }),
    conversionCertified:false,spotExecutable:false,paper:true,realOrders:false
  });
}
/* BTC and ETH share this verified Binance Spot Top5 reader; NO assumption that
   Binance USDT buying power is the user's OKX USDC balance. */
function qualifyPassiveHistory(snapshot,id,period){
  const spec=PERIOD_SPEC[period],pair=PASSIVE_PAIRS[id],m=snapshot?.metadata,r=snapshot?.rows;
  if(!spec||!pair||!m||m.id!==id||m.pair!==pair||
      m.quote!=="USDT"||m.period!==period||m.gaps!==0||
      m.source!=="Binance Spot vérifié"||
      m.end_exclusive_ms!==END_ARCHIVE||m.bars!==spec.bars||
      !Number.isInteger(m.start_ms)||m.start_ms!==END_ARCHIVE-spec.step*spec.bars||
      !Array.isArray(r)||r.length!==spec.bars)
    throw Error("Provenance BTC/ETH ou période Top 5 non vérifiée");
  const start=r[0],end=r.at(-1);let maxClose=0,drawdown=0;
  for(let i=0;i<r.length;i++){
    const row=r[i];
    if(!Array.isArray(row)||row.length!==8||!row.every(numeric)||
        row[0]!==m.start_ms+i*spec.step||
        row[3]<=0||row[3]>Math.min(row[1],row[4])||
        Math.max(row[1],row[4])>row[2]||
        row[5]<0||row[6]<0||!Number.isInteger(row[7])||row[7]<0)
      throw Error("Bougies passives non continues ou OHLCV invalide");
    maxClose=Math.max(maxClose,row[4]);
    drawdown=Math.max(drawdown,(maxClose-row[4])/maxClose*100);
  }
  if(!(start[1]>0&&end[4]>0))
    throw Error("Prix d'ouverture ou de clôture non valide");
  return Object.freeze({
    asset:id,pair,period,quote:"USDT",startAt:m.start_ms,endAt:END_ARCHIVE,
    open:start[1],close:end[4],grossChangePct:(end[4]/start[1]-1)*100,
    maxDrawdownPct:drawdown,verified:true,live:false,
    realOrders:false,spotExecutable:false
  });
}
function passiveEstimate(evidence,capital,cost){
  if(!evidence?.verified||evidence.quote!=="USDT"||
      !Object.hasOwn(PASSIVE_PAIRS,evidence.asset)||PASSIVE_PAIRS[evidence.asset]!==evidence.pair||
      !Object.hasOwn(PERIOD_SPEC,evidence.period)||!PERIOD_SPEC[evidence.period]||
      !Number.isFinite(capital)||![10,10.94,50,100,400].includes(capital)||
      !COSTS.includes(cost)||!numeric(evidence.open)||evidence.open<=0||
      !numeric(evidence.close)||evidence.close<=0)
    throw Error("Comparaison passive non qualifiée");
  const final=capital*(evidence.close/evidence.open)*(1-cost/100);
  return Object.freeze({
    asset:evidence.asset,pair:evidence.pair,capital,quote:"USDT",
    net:final-capital,final,returnPct:(final/capital-1)*100,
    drawdown:evidence.maxDrawdownPct,grossChangePct:evidence.grossChangePct,
    period:evidence.period,startAt:evidence.startAt,endAt:evidence.endAt,
    noMinOrderCheck:true,notCurrencyConverted:true,realOrders:false
  });
}
/* Descriptive only: compare exactly two independently dated public OKX-USDC
 * hourly observations. This is NOT the five Binance Top5 charts, and does
 * not turn five recent trades / a rolling 24h volume into hourly turnover. */
function studyNativeUsdcPressure(health,archive,clockMs=Date.now()){
  if(health?.schema!=="erith.radar.okx-hourly-health.v1"||
     archive?.schema!=="erith.radar.okx-hourly-spot.v1"||
     health.orders_enabled!==false||archive.orders_enabled!==false||
     health.real_orders!==0||archive.real_orders!==0||
     archive.date_utc!==health.date_utc||
     !/^\d{4}-\d{2}-\d{2}$/.test(archive.date_utc||"")||
     !Array.isArray(archive.hours)||archive.hours.length<2||
     archive.hours.length>26||!numeric(clockMs))
    throw Error("Journaux OKX publics manquants ou incohérents");
  const ordered=[...archive.hours].sort((a,b)=>Date.parse(a.observed_at_utc)-Date.parse(b.observed_at_utc));
  const prev=ordered.at(-2),last=ordered.at(-1);
  const prevAt=Date.parse(prev?.observed_at_utc),lastAt=Date.parse(last?.observed_at_utc);
  if(![prevAt,lastAt].every(Number.isFinite)||lastAt<=prevAt||
     lastAt-prevAt>3*3600000||
     archive.date_utc!==new Date(lastAt).toISOString().slice(0,10)||
     health.last_observed_at_utc!==last.observed_at_utc||
     ![prev,last].every(h=>h?.orders_enabled===false&&h?.real_orders===0&&
       Array.isArray(h.markets)&&h.status==="READY"))
    throw Error("Horodatage du marché non comparable");
  const symbols=["BTC","ETH","SOL","XRP","OKB","CT"];
  const sample=[];
  for(const symbol of symbols){
    const pair=symbol+"-USDC",a=prev.markets.find(x=>x.pair===pair),
      z=last.markets.find(x=>x.pair===pair);
    if(!a||!z||a.quote!=="USDC"||z.quote!=="USDC"||
       a.status!=="VERIFIED_PUBLIC_BOOK"||z.status!=="VERIFIED_PUBLIC_BOOK")
      continue;
    const oldPrice=Number(a.ticker?.last),price=Number(z.ticker?.last),
      spread=Number(z.book5?.spread_bps),oldSpread=Number(a.book5?.spread_bps);
    const bb=z.book5?.bids?.[0],ab=z.book5?.asks?.[0],
      bidValue=Number(bb?.[0])*Number(bb?.[1]),
      askValue=Number(ab?.[0])*Number(ab?.[1]);
    if(![oldPrice,price,spread,oldSpread,bidValue,askValue].every(n=>Number.isFinite(n))||
       oldPrice<=0||price<=0||spread<0||oldSpread<0||
       bidValue<=0||askValue<=0)continue;
    sample.push(Object.freeze({
      symbol,pair,change_pct:(price/oldPrice-1)*100,
      spread_bps:spread,spread_change_bps:spread-oldSpread,
      best_bid_value_usdc:bidValue,best_ask_value_usdc:askValue,
      observed_quote:"USDC",status:"OBSERVE_ONLY",paper_trade_approved:false
    }));
  }
  if(sample.length<3)throw Error("Pas assez de paires OKX USDC observées");
  const breadth={falling:sample.filter(x=>x.change_pct<0).length,
    rising:sample.filter(x=>x.change_pct>0).length,
    flat:sample.filter(x=>x.change_pct===0).length,total:sample.length};
  const orderedStrength=[...sample].sort((a,b)=>b.change_pct-a.change_pct);
  return Object.freeze({
    schema:"erith.seven.radar.native-usdc-pressure.v1",mode:"HISTORICAL_PUBLIC_OBSERVATION",
    start_at_utc:prev.observed_at_utc,end_at_utc:last.observed_at_utc,
    age_minutes:Math.round((clockMs-lastAt)/60000),
    is_stale:clockMs-lastAt>120*60000||clockMs<lastAt,
    breadth,assets:orderedStrength,quote:"USDC",
    historical:true,not_a_live_24h_chart:true,not_a_trade_signal:true,
    fills:0,real_orders:0,trade_count_measured:false,
    note:"Two dated hourly market observations, 24h volume is rolling, not interval turnover; BNB is not covered."
  });
}

const api=Object.freeze({qualifyReport,compare,qualifyPassiveHistory,passiveEstimate,studyNativeUsdcPressure,
  readOnly:true,realOrders:false,storage:false,privateAccount:false});
if(typeof module==="object"&&module.exports)module.exports=api;
if(!root||typeof document==="undefined")return;
if(root.AgentCryptoStrategyComparator)return;
const ID="traderStrategyComparator";
const CAPITAL_REPORT="../data/trader_flux/seven_capital_scout/status.json";
const SPOT_GATE_REPORT="../data/trader_flux/seven_capital_scout/spot_gate.json";
const PAPER_QUOTE_REPORT="../data/trader_flux/seven_capital_spot/paper_evaluation.json";
const $=selector=>document.getElementById(ID)?.querySelector(selector);
const nfmt=(v,d=2)=>numeric(v)?v.toLocaleString("fr-FR",{
  minimumFractionDigits:d,maximumFractionDigits:d}):"non calculé";
const signed=v=>numeric(v)?(v>0?"+":"")+nfmt(v)+" USDT":"non calculé";
let reports=null,active=null,loading=false;
let benchmark=null,benchmarkBusy=false,benchmarkToken=0,readerPending=null;
function status(message){const node=$("[data-strategy-status]");if(node)node.textContent=message;}
function render(){
  if(!reports)return;
  let v;
  try{v=compare(reports,Number($("[data-strategy-capital]").value),
    Number($("[data-strategy-cost]").value));}
  catch(error){status(String(error.message||error));return;}
  const cash=$("[data-strategy-cash]");
  if(cash)cash.textContent=nfmt(v.reserve.amount)+" USDC · référence de liquidité sans rendement simulé";
  const note=$("[data-strategy-capital-note]");
  if(note)note.textContent=v.capitalComparable?
    "Même montant nominal 400, MAIS USDC ≠ USDT : conversion et exécution non certifiées.":
    "Les archives Radar ont été exécutées fictivement avec 400 USDT, pas "+
      v.reserve.amount+" USDC. Ne pas extrapoler les profits à ce montant.";
  const target=$("[data-strategy-rows]");
  if(target){
    target.replaceChildren();
    const lines=[
      ["Réserve stable fictive","USDC",nfmt(v.reserve.amount)+" USDC","0 (référence)","—","Aucun trade, aucun rendement simulé ; risque USDC non modélisé."],
      ["Radar 20 · juillet–sept. 2026","USDT","400 USDT",signed(v.study.net),
        numeric(v.study.drawdown)?nfmt(v.study.drawdown)+" %":"non recalculé",
        v.study.sameTradesSensitivity?"Sensibilité des mêmes 149 opérations ; trésorerie NON rejouée.":"149 opérations PAPER archivées."],
      ["Radar 20 · avril–juin 2026","USDT","400 USDT",signed(v.stress.net),
        numeric(v.stress.drawdown)?nfmt(v.stress.drawdown)+" %":"non recalculé",
        v.stress.uncomputed?"Autre hypothèse de frais : non calculée ici.":
          "109 opérations PAPER rétrospectives ; biais de sélection possible."]
    ];
    for(const line of lines){
      const row=document.createElement("tr");
      for(const val of line){const cell=document.createElement("td");cell.textContent=val;row.appendChild(cell);}
      target.appendChild(row);
    }
  }
  renderBenchmark();
  status("Deux rapports publics contrôlés · 400 USDT historiques · coûts "+nfmt(v.cost,1)+
    " % · aucune donnée privée ni exécution. BTC/ETH disponibles à la demande ; CT/DNA non qualifiés ici.");
}
function renderBenchmark(){
  const body=$("[data-strategy-bench-rows]"),label=$("[data-strategy-bench-status]");
  if(!body||!label)return;
  body.replaceChildren();
  const period=$("[data-strategy-period]")?.value;
  if(!benchmark||benchmark.period!==period){
    label.textContent="Aucun calcul BTC/ETH pour cette période : cliquer sur « Étudier BTC et ETH ».";
    return;
  }
  const capital=Number($("[data-strategy-capital]")?.value);
  const cost=Number($("[data-strategy-cost]")?.value);
  const rows=[];
  try{for(const id of ["bitcoin","ethereum"])
    rows.push(passiveEstimate(benchmark[id],capital,cost));}
  catch(error){label.textContent="Étude refusée : "+String(error.message||error);return;}
  for(const r of rows){
    const tr=document.createElement("tr");
    for(const value of [
      r.asset==="bitcoin"?"BTC · détention passive":"ETH · détention passive",
      nfmt(r.capital)+" USDT",signed(r.net),
      nfmt(r.returnPct)+" %",nfmt(r.drawdown)+" %",
      "Binance Spot "+r.pair+" · prix archives USDT · aucune exécution ni minimum OKX prouvés"
    ]){
      const td=document.createElement("td");td.textContent=value;tr.appendChild(td);
    }
    body.appendChild(tr);
  }
  const a=benchmark.bitcoin;
  const stamp=t=>new Date(t).toISOString().slice(0,10);
  label.textContent="BTC/ETH : fenêtre commune "+stamp(a.startAt)+" → "+stamp(a.endAt)+
    " (borne exclusive), "+period+" · SHA-256, identité et continuité validées par le Coffre. "+
    "Capital théorique en USDT, pas les "+nfmt(capital)+" USDC du compte. "+
    "Dates distinctes du portefeuille Radar 20 (01/07 → 30/09) ; pas de comparaison directe de performances.";
}
function verifiedReader(){
  if(root.SevenVerifiedPeriods?.load)return Promise.resolve(root.SevenVerifiedPeriods);
  if(readerPending)return readerPending;
  readerPending=new Promise((resolve,reject)=>{
    const script=document.createElement("script");
    script.src=new URL("../administrator/js/verified-periods-reader.js",document.baseURI).href;
    script.onload=()=>{
      if(root.SevenVerifiedPeriods?.load)resolve(root.SevenVerifiedPeriods);
      else reject(Error("Contrat du lecteur Coffre indisponible"));
    };
    script.onerror=()=>{script.remove();reject(Error("Lecteur du Coffre impossible à charger"));};
    document.head.appendChild(script);
  }).catch(error=>{readerPending=null;throw error;});
  return readerPending;
}
async function studyPassive(){
  const pane=document.getElementById(ID),period=$("[data-strategy-period]")?.value;
  if(!pane?.open||benchmarkBusy||!PERIOD_SPEC[period])return;
  const token=++benchmarkToken;benchmarkBusy=true;
  const btn=$("[data-strategy-study-passive]");
  if(btn)btn.disabled=true;
  const label=$("[data-strategy-bench-status]");
  if(label)label.textContent="Lecture sur demande du Coffre BTC / ETH · "+period+"…";
  try{
    const reader=await verifiedReader();
    const b=qualifyPassiveHistory(await reader.load("bitcoin",period),"bitcoin",period);
    if(token!==benchmarkToken||!pane.open)return;
    const e=qualifyPassiveHistory(await reader.load("ethereum",period),"ethereum",period);
    if(token!==benchmarkToken||!pane.open)return;
    if(b.startAt!==e.startAt||b.endAt!==e.endAt)
      throw Error("Fenêtres historiques différentes : comparaison annulée");
    benchmark=Object.freeze({period,bitcoin:b,ethereum:e});
    renderBenchmark();
  }catch(error){
    if(token!==benchmarkToken||!pane.open)return;
    if(label)label.textContent="Étude BTC/ETH non disponible : "+String(error.message||error);
  }finally{
    benchmarkBusy=false;
    if(btn)btn.disabled=false;
  }
}
async function readReport(kind,signal){
  const url=BASE+FILES[kind];
  const response=await fetch(url,{cache:"no-store",credentials:"omit",redirect:"error",signal});
  if(!response.ok)throw Error("Rapport "+kind+" indisponible (HTTP "+response.status+")");
  const raw=await response.text();
  if(raw.length>200000)throw Error("Rapport anormalement volumineux");
  return qualifyReport(JSON.parse(raw),kind);
}
async function load(force=false){
  const node=document.getElementById(ID);
  if(!node?.open||active)return;
  if(reports&&!force){render();return;}
  const controller=new AbortController();active=controller;loading=true;
  const timeout=setTimeout(()=>controller.abort(),12000);
  status("Lecture des deux rapports PAPER archivés…");
  try{
    const [study,stress]=await Promise.all([
      readReport("study",controller.signal),readReport("stress",controller.signal)
    ]);
    if(active!==controller||!node.open)return;
    reports=Object.freeze({study,stress});
    render();
  }catch(error){
    if(active!==controller||!node.open)return;
    status("Aucune performance affichée sans preuve : "+String(error?.message||error));
    reports=null;const target=$("[data-strategy-rows]");target?.replaceChildren();
  }finally{
    clearTimeout(timeout);
    if(active===controller){active=null;loading=false;}
  }
}
// The automatic journal belongs INSIDE the existing PAPER comparator. No
// orphan sibling after #traderPaperLab and no second market/network owner.

/* One read-only view inside the existing comparator; the archive is computed by
 * GitHub from SHA-verified public candles/books, never re-priced in Firefox. */
function mountPaperQuoteEvidence(comparator){
  if(document.getElementById("sevenCapitalPaperEvidence"))return;
  const body=comparator.querySelector(".sc-body");if(!body)return;
  const pane=document.createElement("details");pane.id="sevenCapitalPaperEvidence";
  pane.style.cssText="margin:10px 0 16px;padding:10px;border:1px solid #44677a;border-radius:10px;background:#102638";
  pane.innerHTML=[
    '<summary style="cursor:pointer;font-weight:700">SEVEN CAPITAL · Suivi PAPER 10 USDC · cotations datées</summary>',
    '<p class="sc-note">Trois études alternatives indépendantes, jamais 30 USDC engagés. 0 ordre, 0 position. Frais 0,1 % hypothétiques par côté ; réserve 0,94 USDC à part.</p>',
    '<p data-paper-quote-status role="status" aria-live="polite">Ouvrir pour lire le journal public horodaté.</p>',
    '<div class="sc-scroll"><table><thead><tr><th>Actif</th><th>Contrôle</th><th>Dernier bid</th><th>Résultat conditionnel 10 USDC</th></tr></thead>',
    '<tbody data-paper-quote-rows></tbody></table></div>',
    '<h4>Bilans prospectifs · 4 h / 24 h / 48 h</h4>',
    '<p class="sc-note">Premier relevé daté disponible après chaque échéance (tolérance 4 h) ; aucun prix choisi a posteriori.</p>',
    '<div class="sc-scroll"><table><thead><tr><th>Horizon</th><th>Actif</th><th>Statut</th><th>Résultat conditionnel</th></tr></thead>',
    '<tbody data-paper-horizon-rows><tr><td colspan="4">En attente de lecture.</td></tr></tbody></table></div>',
    '<p class="sc-note">Un bid futur est une cotation, non un fill. Disponibilité réelle et frais du compte non certifiés. Aucune transaction lancée.</p>',
    '<p><a href="../data/trader_flux/seven_capital_spot/index.json" target="_blank" rel="noopener noreferrer">Journal et empreintes SHA-256 ↗</a></p>'
  ].join("");
  const first=body.firstChild;
  body.insertBefore(pane,first?first.nextSibling:null);
  const status=pane.querySelector("[data-paper-quote-status]");
  const rows=pane.querySelector("[data-paper-quote-rows]");
  const horizonRows=pane.querySelector("[data-paper-horizon-rows]");
  const spotCompact=comparator.querySelector("[data-spot-compact]");
  let busy=false;
  pane.addEventListener("toggle",async()=>{
    if(!pane.open||busy)return;busy=true;
    const ctl=new AbortController(),stop=setTimeout(()=>ctl.abort(),10000);
    try{
      status.textContent="Lecture du rapport GitHub archivé…";
      const response=await fetch(new URL(PAPER_QUOTE_REPORT,document.baseURI),{
        cache:"no-store",credentials:"omit",redirect:"error",signal:ctl.signal
      });
      if(!response.ok)throw Error("aucun rapport publié");
      const source=await response.text();
      if(source.length>350000)throw Error("rapport trop volumineux");
      const d=JSON.parse(source);
      if(d.schema!=="erith.seven.capital.spot-paper-quote-evaluation.v1"||
         d.mode!=="PROSPECTIVE_PUBLIC_QUOTE_ONLY"||d.quote!=="USDC"||
         d.budget_per_alternative_usdc!==10||
         d.reserve_separate_usdc!==0.94||
         d.orders_enabled!==false||d.real_orders!==0||
         d.paper_fills!==0||d.positions_opened!==0||d.positions_closed!==0||
         d.real_profit_usdc!==null||d.paper_realized_profit_usdc!==null||
         !Array.isArray(d.cohorts)||d.cohorts.length>100)
        throw Error("contrat PAPER non conforme");
      const cohort=d.cohorts.at(-1);
      if(!cohort||!Array.isArray(cohort.candidates)||
         cohort.candidates.length>3)throw Error("cohorte non disponible");
      rows.replaceChildren();
      const labels={AWAITING_FUTURE_BOOK:"En attente d’un bid futur",
        ENTRY_REJECTED:"Entrée refusée",
        ENTRY_INVALID:"Entrée non évaluable",
        EXIT_NOT_EVALUABLE:"Sortie non évaluable",
        LATEST_BID_EVALUABLE:"Dernier bid PAPER évalué"};
      for(const x of cohort.candidates){
        if(!/^[A-Z0-9]{2,15}$/.test(x.symbol||"")||
          x.pair!==x.symbol+"-USDC"||!Object.hasOwn(labels,x.status)||
          x.orders_enabled!==false||x.paper_fills!==0||
          x.position_closed!==false||x.real_profit_usdc!==null)
          throw Error("Ligne de cotation incompatible");
        const tr=document.createElement("tr");
        const cells=[
          x.symbol+" / USDC",
          labels[x.status],
          x.latest_bid_usdc?x.latest_bid_usdc+" USDC":"—",
          x.status==="LATEST_BID_EVALUABLE"&&
          /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(x.hypothetical_pnl_usdc||"")?
            x.hypothetical_pnl_usdc+" USDC hypothétiques":"Non établi"];
        for(const value of cells){const td=document.createElement("td");td.textContent=value;tr.appendChild(td);}
        rows.appendChild(tr);
      }
      if(spotCompact)spotCompact.textContent="SEVEN SPOT/USDC · cohorte "+
        cohort.cohort_id+" · "+cohort.observations+" relevé(s) · 0 ordre";
      horizonRows.replaceChildren();
      const horizonLabels={AWAITING_HORIZON:"En attente",HORIZON_MISSED_WINDOW:"Fenêtre sans relevé",
        ENTRY_REJECTED:"Entrée refusée",ENTRY_INVALID:"Entrée non évaluable",
        EXIT_NOT_EVALUABLE:"Carnet non évaluable",LATEST_BID_EVALUABLE:"Cot. sortie théorique"};
      const horizons=Array.isArray(cohort.horizons)?cohort.horizons:[];
      if(horizons.length && (horizons.length!==3||
          horizons.map(x=>x.hours).join(",")!=="4,24,48"))
        throw Error("Horizons PAPER non conformes");
      for(const h of horizons){
        if(!Array.isArray(h.candidates)||h.candidates.length>3||
          h.no_hindsight_selection!==true)throw Error("Horodatage horizon invalide");
        for(const x of h.candidates){
          if(!Object.hasOwn(horizonLabels,x.status)||x.orders_enabled!==false||
             x.paper_fills!==0||x.position_closed!==false||x.real_profit_usdc!==null)
            throw Error("Evaluation horizon invalide");
          const tr=document.createElement("tr");
          const pnl=x.status==="LATEST_BID_EVALUABLE"&&
             typeof x.hypothetical_pnl_usdc==="string"?
              x.hypothetical_pnl_usdc+" USDC · hypothétique":"Non établi";
          for(const value of [h.hours+" h",x.symbol,horizonLabels[x.status],pnl]){
            const td=document.createElement("td");td.textContent=value;tr.appendChild(td);
          }
          horizonRows.appendChild(tr);
        }
      }
      if(!horizons.length){
        const tr=document.createElement("tr"),td=document.createElement("td");
        td.colSpan=4;td.textContent="Bilans 4 h / 24 h / 48 h non publiés.";
        tr.appendChild(td);horizonRows.appendChild(tr);
      }
      status.textContent="Cohorte "+cohort.cohort_id+" · "+
        cohort.observations+" relevé(s) · 0 ordre · aucune position ouverte.";
    }catch(_){
      rows.replaceChildren();
      horizonRows.replaceChildren();
      if(spotCompact)spotCompact.textContent="SEVEN SPOT/USDC · journal indisponible · 0 ordre";
      status.textContent="Journal PAPER public indisponible ou non conforme · résultat non établi.";
    }finally{clearTimeout(stop);busy=false;}
  });
}


/* Inspect already published Radar selections without launching Atlas, altering
 * Market selection or invoking any exchange endpoint. Both source dates remain
 * independently visible, and no historical candidate is labelled actionable. */
function mountRadarSelectionViewer(comparator){
  if(document.getElementById("sevenRadarSelectionViewer"))return;
  const body=comparator.querySelector(".sc-body");if(!body)return;
  const pane=document.createElement("details");pane.id="sevenRadarSelectionViewer";
  pane.style.cssText="margin:10px 0 16px;padding:10px;border:1px solid #365e72;border-radius:10px;background:#0b2333";
  pane.innerHTML=[
    '<summary style="font-weight:700;cursor:pointer">RADAR · Cryptos déjà retenues · sélection et provenance</summary>',
    '<p class="sc-note">Deux journaux publics distincts : Seven Capital Spot/USDC et ancien Radar dynamique Spot/USDT. Ici, « retenue » signifie étudiée, pas achetée ni recommandée.</p>',
    '<div class="sc-controls"><label>Afficher<select data-radar-selection-filter>',
    '<option value="all">Les deux listes</option><option value="capital">Seven Capital · récent</option>',
    '<option value="legacy">Radar dynamique · historique</option></select></label>',
    '<button type="button" data-radar-selection-refresh>Actualiser depuis GitHub</button></div>',
    '<p data-radar-selection-status role="status" aria-live="polite">Ouvrir pour lire les sélections datées.</p>',
    '<div class="sc-scroll"><table><thead><tr><th>Journal</th><th>Crypto</th><th>État de l’étude</th><th>Source et date</th></tr></thead>',
    '<tbody data-radar-selection-rows><tr><td colspan="4">Aucune archive chargée.</td></tr></tbody></table></div>',
    '<p class="sc-note">Le bouton relit les fichiers publics déjà publiés. Il ne lance pas une collecte, ne recalcule aucun signal et ne transmet aucun ordre. Une archive ancienne reste historique.</p>'
  ].join("");
  const quote=document.getElementById("sevenCapitalPaperEvidence");
  if(quote?.parentElement===body)quote.insertAdjacentElement("afterend",pane);
  else body.insertBefore(pane,body.firstChild);
  const status=pane.querySelector("[data-radar-selection-status]");
  const rows=pane.querySelector("[data-radar-selection-rows]");
  const filter=pane.querySelector("[data-radar-selection-filter]");
  let current=[],busy=false;
  function render(){
    rows.replaceChildren();
    const chosen=filter.value;
    let count=0;
    for(const item of current){
      if(chosen!=="all"&&item.group!==chosen)continue;
      const tr=document.createElement("tr");
      for(const value of [item.journal,item.symbol,item.status,item.provenance]){
        const td=document.createElement("td");td.textContent=value;tr.appendChild(td);
      }
      rows.appendChild(tr);count++;
    }
    if(!count){
      const tr=document.createElement("tr"),td=document.createElement("td");
      td.colSpan=4;td.textContent="Aucune sélection publique admissible pour ce filtre.";
      tr.appendChild(td);rows.appendChild(tr);
    }
  }
  async function jsonFile(url,signal){
    const response=await fetch(new URL(url,document.baseURI),{
      cache:"no-store",credentials:"omit",redirect:"error",signal});
    if(!response.ok)throw Error("HTTP "+response.status);
    const data=await response.text();
    if(data.length>350000)throw Error("Archive volumineuse");
    return JSON.parse(data);
  }
  async function refresh(){
    if(busy||!pane.open)return;busy=true;
    const button=pane.querySelector("[data-radar-selection-refresh]");
    if(button)button.disabled=true;
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
    try{
      status.textContent="Lecture des deux archives indépendantes…";
      const settled=await Promise.allSettled([
        jsonFile(PAPER_QUOTE_REPORT,controller.signal),
        jsonFile("../data/crypto/radar-opportunities/qualification-latest.json",controller.signal)
      ]);
      const found=[];let errors=0;const dates=[];
      const a=settled[0];
      if(a.status==="fulfilled"){
        const d=a.value;
        if(d?.schema!=="erith.seven.capital.spot-paper-quote-evaluation.v1"||
          d.orders_enabled!==false||d.real_orders!==0||d.paper_fills!==0||
          d.quote!=="USDC"||!Array.isArray(d.cohorts)||d.cohorts.length>100)
          errors++;
        else{
          const cohort=d.cohorts.at(-1);
          if(cohort&&Array.isArray(cohort.candidates)&&cohort.candidates.length<=3){
            const date=cohort.cohort_id;
            dates.push("Seven Capital "+date);
            const statuses={
              LATEST_BID_EVALUABLE:"Dernier bid PAPER évalué (sans ordre)",
              AWAITING_FUTURE_BOOK:"En attente de nouvelle cotation",
              ENTRY_REJECTED:"Entrée refusée au contrôle",
              ENTRY_INVALID:"Entrée non qualifiée",
              EXIT_NOT_EVALUABLE:"Sortie non évaluable"};
            for(const item of cohort.candidates){
              if(!/^[A-Z0-9]{2,15}$/.test(item.symbol||"")||
                !Object.hasOwn(statuses,item.status)||
                item.orders_enabled!==false||item.paper_fills!==0){
                errors++;continue;
              }
              found.push({group:"capital",journal:"Seven Capital · Spot/USDC",
                symbol:item.symbol,status:statuses[item.status],
                provenance:"Cohorte "+date+" · "+cohort.observations+" relevé(s)"});
            }
          }else errors++;
        }
      }else errors++;
      const b=settled[1];
      if(b.status==="fulfilled"){
        const d=b.value;
        if(d?.schema!=="erith.radar.spot-qualification.v1"||
          d.real_orders_enabled!==false||d.actual_execution_permissions!==false||
          d.coin_id_matches_exchange_symbol_verified!==false||
          !Array.isArray(d.priority_research_ids)||
          !Array.isArray(d.candidates)||d.priority_research_ids.length>20)
          errors++;
        else{
          const date=d.source_observation_date_utc||"date inconnue";
          dates.push("Radar dynamique "+date);
          for(const id of d.priority_research_ids){
            const item=d.candidates.find(c=>c.id===id);
            if(!item||!/^[A-Z0-9]{1,15}$/.test(item.symbol||"")||
              !["RESEARCH_DATA_QUALIFIED_IDENTITY_REVIEW","NO_OBSERVED_SPOT_PAIR"].includes(item.status)){
              errors++;continue;
            }
            found.push({group:"legacy",journal:"Radar historique · Spot/USDT",
              symbol:item.symbol,status:item.status==="NO_OBSERVED_SPOT_PAIR"?
               "Paire Spot non observée":"Identité et conditions Spot à vérifier",
              provenance:"Qualification du "+date+" · données anciennes"});
          }
        }
      }else errors++;
      current=found;render();
      status.textContent=found.length+" candidats consultables · "+dates.join(" · ")+
        (errors?" · "+errors+" source(s) ou ligne(s) non conformes":"")+
        " · zéro ordre. Les dates indiquent les données, pas l’heure du clic.";
    }catch(_){
      current=[];render();
      status.textContent="Archives indisponibles · aucune sélection ne peut être certifiée.";
    }finally{clearTimeout(timeout);if(button)button.disabled=false;busy=false;}
  }
  pane.addEventListener("toggle",()=>{if(pane.open)void refresh();});
  filter.addEventListener("change",render);
  pane.querySelector("[data-radar-selection-refresh]")?.addEventListener("click",()=>{void refresh();});
}


function mountRadarMarketPressure(comparator){
  if(document.getElementById("sevenRadarMarketPressure"))return;
  const body=comparator.querySelector(".sc-body");if(!body)return;
  const pane=document.createElement("details");pane.id="sevenRadarMarketPressure";
  pane.style.cssText="margin:10px 0 16px;padding:10px;border:1px solid #3b6871;border-radius:10px;background:#0b2631";
  pane.innerHTML=[
   '<summary style="cursor:pointer;font-weight:700">RADAR · Pression collective et résistance relative · OKX USDC</summary>',
   '<p class="sc-note">Observation sur deux relevés horaires publics de six paires natives USDC. Ce n’est pas le Top 5 Binance, et BNB n’est pas couvert. Les variations à 24 h du Market ne sont pas des résultats PAPER.</p>',
   '<div class="sc-controls"><button type="button" data-pressure-refresh>Relire les archives OKX publiques</button></div>',
   '<p data-pressure-status role="status" aria-live="polite">Ouvrir pour comparer les derniers relevés archivés.</p>',
   '<div class="sc-scroll"><table><thead><tr><th>Paire Spot</th><th>Entre deux relevés</th><th>Spread actuel</th><th>Meilleur bid / ask visible</th><th>Lecture Seven</th></tr></thead>',
   '<tbody data-pressure-rows></tbody></table></div>',
   '<p class="sc-note">Comparer des mouvements ne prouve pas leur cause. La profondeur au meilleur niveau est un instantané, non un fill. Le volume 24 h est glissant, les cinq transactions récentes ne permettent pas de mesurer une fréquence horaire. Aucune recommandation d’achat.</p>'
  ].join("");
  const ref=document.getElementById("sevenRadarSelectionViewer");
  if(ref?.parentElement===body)ref.insertAdjacentElement("afterend",pane);
  else body.insertBefore(pane,body.firstChild);
  const status=pane.querySelector("[data-pressure-status]");
  const rows=pane.querySelector("[data-pressure-rows]");
  let busy=false;
  async function refresh(){
    if(!pane.open||busy)return;busy=true;
    const button=pane.querySelector("[data-pressure-refresh]");
    if(button)button.disabled=true;
    const ctl=new AbortController(),stop=setTimeout(()=>ctl.abort(),10000);
    try{
      status.textContent="Lecture des heures OKX/USDC archivées…";
      const load=async url=>{
        const r=await fetch(new URL(url,document.baseURI),{
          cache:"no-store",credentials:"omit",redirect:"error",signal:ctl.signal});
        if(!r.ok)throw Error("Archive indisponible");
        const raw=await r.text();
        if(raw.length>450000)throw Error("Archive trop volumineuse");
        return JSON.parse(raw);
      };
      const h=await load("../data/crypto/okx-hourly/latest.json");
      if(!/^\d{4}-\d{2}-\d{2}$/.test(h.date_utc||""))
        throw Error("Index UTC invalide");
      const d=await load("../data/crypto/okx-hourly/"+h.date_utc+".json");
      const result=studyNativeUsdcPressure(h,d);
      rows.replaceChildren();
      for(const m of result.assets){
        const tr=document.createElement("tr");
        // A resilience label describes the last two data points, not an order.
        const label=m.change_pct>0?
          "Résilience relative, à confirmer":m.change_pct<0?
          "Recul constaté, surveiller l'évolution":"Stable sur les deux relevés";
        const items=[m.pair,
          (m.change_pct>=0?"+":"")+m.change_pct.toFixed(3)+" %",
          m.spread_bps.toFixed(2)+" pb"+(m.spread_change_bps>0?" · élargi":""),
          m.best_bid_value_usdc.toFixed(2)+" / "+m.best_ask_value_usdc.toFixed(2)+" USDC",
          label];
        for(const value of items){const td=document.createElement("td");td.textContent=value;tr.appendChild(td);}
        rows.appendChild(tr);
      }
      const breadth=result.breadth;
      status.textContent="OKX "+result.start_at_utc+" → "+result.end_at_utc+
        " · "+breadth.falling+"/"+breadth.total+" en recul ; "+
        breadth.rising+" en progression · "+
        (result.is_stale?"archive périmée, pas du temps réel":
        "dernier relevé : "+result.age_minutes+" min")+
        " · 0 ordre. Comparaison descriptive, aucune opportunité qualifiée.";
    }catch(_){
      rows.replaceChildren();
      status.textContent="Archives OKX incohérentes ou absentes : aucun signal établi.";
    }finally{clearTimeout(stop);if(button)button.disabled=false;busy=false;}
  }
  pane.addEventListener("toggle",()=>{if(pane.open)void refresh();});
  pane.querySelector("[data-pressure-refresh]")?.addEventListener("click",()=>{void refresh();});
}

/* Reserved integration slot in the EXISTING Trader. No second Operator runtime,
 * no iframe, no API credentials and no automatic synchronization. */
function mountYoannOperatorSection(comparator){
  if(document.getElementById("traderYoannOperatorSection"))return;
  const section=document.createElement("details");
  section.id="traderYoannOperatorSection";
  section.className="sc operator-yoann-section";
  section.style.cssText="margin:16px 0;padding:12px 16px;border:1px solid #336476;border-radius:12px;background:#0b2232;color:#dfedf3";
  section.innerHTML=[
    '<summary style="cursor:pointer;font-weight:750;color:#efcf88">OPERATOR · YOANN — Développements indépendants et passerelle future</summary>',
    '<div style="padding:12px 4px 4px">',
    '<p>Emplacement de liaison dans le Trader Administrator, <strong>pas</strong> un nouveau Trader Operator et pas un atelier Docker. Yoann développe dans son dépôt privé. Toute reprise ici exige revue, tests et autorisation.</p>',
    '<p><strong>Développement source :</strong> <a href="https://github.com/malabaryo/tradus/tree/main/public/agent_crypto_erith_ia" target="_blank" rel="noopener noreferrer">malabaryo/tradus · privé ↗</a></p>',
    '<p><strong>Code Trader Yoann :</strong> <a href="https://github.com/malabaryo/tradus/blob/main/public/agent_crypto_erith_ia/trader/trading-desk.html" target="_blank" rel="noopener noreferrer">Trader dans le privé ↗</a></p>',
    '<p><strong>Rendu public Operator :</strong> <a href="https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/trader/trading-desk.html" target="_blank" rel="noopener noreferrer">Ouvrir son Trader ↗</a></p>',
    '<p><strong>Règles :</strong> pas de copie de comptes, clés, Bridge, données personnelles ou privilèges Administrator ; pas de fusion automatique. Sur le dépôt public, conserver seulement les dépendances web effectivement nécessaires, après inventaire et tests des liens. Ne jamais supprimer du privé de Yoann.</p>',
    '<p>Les futures évolutions compatibles pourront être présentées ici en lecture seule, puis intégrées par PR contrôlée dans le MASTER. Aucun ordre, aucune communication automatique avec le PC de Yoann.</p>',
    '</div>'
  ].join("");
  comparator.insertAdjacentElement("afterend",section);
}

function mountCapitalPulse(comparator){
  if(document.getElementById("sevenCapitalPulse"))return;
  const body=comparator.querySelector(".sc-body");
  if(!body)return;
  const compact=comparator.querySelector("[data-capital-compact]");
  const pulse=document.createElement("aside");pulse.id="sevenCapitalPulse";
  pulse.setAttribute("role","status");
  pulse.style.cssText="margin:0 0 14px;padding:12px 14px;border:1px solid #456b80;border-radius:10px;background:#0a2632;color:#d5f1ef;font:13px/1.5 system-ui";
  body.insertBefore(pulse,body.firstChild);
  const write=(detail,short)=>{
    pulse.textContent=detail;
    if(compact)compact.textContent=short;
  };
  write("SEVEN AUTO · Radar quotidien · budget 10 USDC · réserve 0,94 USDC…",
    "SEVEN AUTO · Radar quotidien · 0 ordre");
  const c=new AbortController();
  const stop=setTimeout(()=>c.abort(),10000);
  fetch(new URL(CAPITAL_REPORT,document.baseURI),{
    cache:"no-store",credentials:"omit",redirect:"error",signal:c.signal
  }).then(async r=>{
    if(!r.ok)throw Error("rapport quotidien non publié");
    const raw=await r.text();
    if(raw.length>100000)throw Error("rapport public trop volumineux");
    const data=JSON.parse(raw);
    if(data.schema!=="erith.seven.capital-scout.paper.v1"||
       data.mode!=="AUTOMATED_PROSPECTIVE_RESEARCH_ONLY"||
       data.orders_enabled!==false||data.private_account_access!==false||
       data.real_orders_submitted!==0||data.profit_real_usdc!==null||
       data.simulation_budget_usdc!==10||data.reserved_cost_buffer_usdc!==0.94||
       !Array.isArray(data.milestones_usdc)||
       data.milestones_usdc.join(",")!=="12,15,17"||
       !Array.isArray(data.observations))
       throw Error("contrat de sécurité du rapport non conforme");
    let spot="Spot Gate Radar quotidien en attente (journal séparé du Spot daté)";
    try{
      // Second tiny public JSON, no polling or OKX API call from Firefox.
      const answer=await fetch(new URL(SPOT_GATE_REPORT,document.baseURI),{
        cache:"no-store",credentials:"omit",redirect:"error",signal:c.signal
      });
      if(!answer.ok)throw Error("Rapport Spot indisponible");
      const rawGate=await answer.text();
      if(rawGate.length>20000)throw Error("Rapport Spot trop grand");
      const gate=JSON.parse(rawGate);
      if(gate.schema!=="erith.seven.public-usdc-spot-gate.v1"||
         gate.mode!=="READ_ONLY_PUBLIC_MARKET_PRECHECK"||
         gate.quote!=="USDC"||gate.budget_usdc!==10||
         gate.cost_buffer_usdc!==0.94||
         gate.real_orders_enabled!==false||gate.real_orders_submitted!==0||
         gate.private_account_access!==false||gate.actual_profit_usdc!==null||
         !Array.isArray(gate.candidates)||
         gate.candidates.some(x=>x.trade_approved!==false||
           x.real_order_sent!==false||x.can_trade_10_usdc!==false||
           x.actual_profit_usdc!==null))
        throw Error("Contrat Spot non conforme");
      if(gate.input_last_archive_utc===data.latest_archive_date_utc){
        const screens=gate.candidates.filter(x=>
          x.status==="PUBLIC_BOOK_AND_SIZE_PAPER_SCREEN_PASSED").length;
        spot="Spot Gate Radar quotidien "+screens+"/"+gate.candidates.length+
          " présélection(s) · identité/frais/ordres NON certifiés";
      }
    }catch(_){ /* Optional public report; retain the proven Radar status. */ }
    write("SEVEN AUTO · Radar quotidien · 10 USDC à étudier + 0,94 USDC réservés · "+
      "objectifs 12 → 15 → 17 · archive Radar "+(data.latest_archive_date_utc||"absente")+
      " · "+data.observations.length+" observation(s) Radar · "+
      spot+" · 0 ordre réel.",
      "SEVEN AUTO · archive "+(data.latest_archive_date_utc||"absente")+
      " · Radar quotidien "+data.observations.length+" observation(s) · 0 ordre");
  }).catch(()=>{
    write("SEVEN AUTO · Radar quotidien · 10 USDC + réserve 0,94 USDC · "+
      "journal Radar indisponible ; suivi Spot/USDC ci-dessous indépendant · aucun ordre réel.",
      "SEVEN AUTO · Radar quotidien indisponible · 0 ordre réel");
  }).finally(()=>clearTimeout(stop));
}
function mount(){
  if(document.getElementById(ID))return true;
  const host=document.getElementById("traderPaperLab");
  if(!host)return false;
  if(!document.getElementById("traderStrategyComparatorStyle")){
    const style=document.createElement("style");style.id="traderStrategyComparatorStyle";
    style.textContent=[
      "#traderStrategyComparator{grid-column:1/-1;display:block;margin:12px 0 28px;background:#0a1e2c;color:#e5f6fa;border:1px solid #456b80;border-radius:12px;font:13px/1.5 system-ui,sans-serif;overflow:hidden}",
      "#traderStrategyComparator>summary{padding:14px;cursor:pointer;font-weight:750;color:#f0d79e;background:#11283b}",
      "#traderStrategyComparator>summary [data-capital-compact],#traderStrategyComparator>summary [data-spot-compact]{display:block;color:#b7deea;font-weight:500;font-size:12px;line-height:1.45;margin:4px 0 0 14px}",
      "#traderStrategyComparator .sc-body{padding:14px}",
      "#traderStrategyComparator .sc-controls{display:flex;flex-wrap:wrap;gap:12px;margin:12px 0}",
      "#traderStrategyComparator label{display:grid;gap:5px;font-size:12px}",
      "#traderStrategyComparator select,#traderStrategyComparator button{background:#143d54;color:#f1feff;border:1px solid #52889c;border-radius:7px;padding:8px;font:inherit}",
      "#traderStrategyComparator button{cursor:pointer;align-self:end}",
      "#traderStrategyComparator .sc-scroll{max-width:100%;overflow-x:auto}",
      "#traderStrategyComparator table{width:100%;border-collapse:collapse;min-width:800px}",
      "#traderStrategyComparator th,#traderStrategyComparator td{padding:8px;border-bottom:1px solid #345367;text-align:left;vertical-align:top}",
      "#traderStrategyComparator .sc-note{color:#bdd0df;font-size:12px}",
      "#traderStrategyComparator [data-strategy-status],#traderStrategyComparator [data-strategy-bench-status]{color:#f2d8a4}"
    ].join("\n");document.head.appendChild(style);
  }
  const node=document.createElement("details");node.id=ID;
  node.innerHTML=[
    '<summary>SEVEN HEAVEN · Comparateur de stratégies PAPER · archives et réserve USDC<span data-capital-compact>SEVEN AUTO · Radar quotidien · 0 ordre</span><span data-spot-compact>SEVEN SPOT/USDC · ouvrir le suivi daté pour actualiser · 0 ordre</span></summary>',
    '<div class="sc-body">',
    '<p>Étude documentaire, pas un signal. La réserve fictive est en USDC ; les expériences historiques du Radar 20 sont en USDT Binance. Aucune parité ou rentabilité n’est certifiée entre les deux.</p>',
    '<div class="sc-controls">',
    '<label>Réserve fictive (USDC)<select data-strategy-capital><option>10</option><option value="10.94" selected>10,94 · relevé manuel (non live)</option><option>50</option><option>100</option><option>400</option></select></label>',
    '<label>Coût aller-retour du modèle (%)<select data-strategy-cost><option value="0.8" selected>0,8 %</option><option value="1.2">1,2 %</option><option value="1.6">1,6 %</option></select></label>',
    '<button type="button" data-strategy-refresh>Relire les rapports publics</button>',
    '</div><p><strong data-strategy-cash>Réserve : sélectionner pour commencer</strong></p>',
    '<p class="sc-note" data-strategy-capital-note>Archives Radar : capital fixe 400 USDT.</p>',
    '<div class="sc-scroll"><table><thead><tr><th>Scénario</th><th>Devise</th><th>Capital initial</th><th>Résultat PAPER</th><th>Repli maximal</th><th>Limite de comparaison</th></tr></thead>',
    '<tbody data-strategy-rows><tr><td colspan="6">Ouvre le comparateur pour lire les preuves.</td></tr></tbody></table></div>',
    '<p role="status" aria-live="polite" data-strategy-status>En attente d’ouverture · aucune requête.</p>',
    '<p class="sc-note">Les sensibilités de juillet–septembre à 1,2 et 1,6 % réévaluent les mêmes opérations, sans refaire la simulation avec contraintes de trésorerie. Avril–juin utilise 0,8 % ici. Les données ne démontrent pas la rentabilité prospective ni l’exécution sur OKX.</p>',
    '<h4>BTC / ETH · détention passive · Coffre vérifié</h4>',
    '<p class="sc-note">Calcul rétroactif : acheter à l’ouverture et vendre à la dernière clôture, coût A/R hypothétique sélectionné. Le capital utilisé pour ce calcul est un ticket fictif USDT de même montant nominal que la réserve USDC, sans transfert, conversion ni garantie d’exécution.</p>',
    '<div class="sc-controls"><label>Période commune BTC / ETH<select data-strategy-period><option value="7j">7 jours</option><option value="30j">30 jours</option><option value="60j">60 jours</option><option value="90j" selected>90 jours</option></select></label>',
    '<button type="button" data-strategy-study-passive>Étudier BTC et ETH (Coffre)</button></div>',
    '<div class="sc-scroll"><table><thead><tr><th>Actif</th><th>Capital fictif</th><th>Résultat</th><th>Variation nette</th><th>Repli max. cours</th><th>Source / limites</th></tr></thead>',
    '<tbody data-strategy-bench-rows></tbody></table></div>',
    '<p role="status" aria-live="polite" data-strategy-bench-status>À la demande uniquement · aucune archive BTC/ETH téléchargée.</p>',
    '<p class="sc-note">La fenêtre BTC/ETH finit au 30 septembre 2026 et diffère du portefeuille Radar qui démarre le 1er juillet. Les frais sont hypothétiques ; aucune équivalence USDT/USDC implicite ni minimum Spot certifié. CT / DNA restent hors classement sans données comparables.</p>',
    '<p><a href="../laboratoire/radar-historique.html" target="_blank" rel="noopener noreferrer">Radar 20 historique ↗</a> · ',
    '<a href="../administrator/historical-vault.html" target="_blank" rel="noopener noreferrer">Coffre vérifié ↗</a> · ',
    '<a href="../laboratoire/crypto-knowledge.html" target="_blank" rel="noopener noreferrer">Dossiers Crypto ↗</a></p>',
    '</div>'
  ].join("");
  host.insertAdjacentElement("afterend",node);
  mountCapitalPulse(node);
  mountPaperQuoteEvidence(node);
  mountRadarSelectionViewer(node);
  mountRadarMarketPressure(node);
  mountYoannOperatorSection(node);
  node.addEventListener("toggle",()=>{
    if(!node.open){
      ++benchmarkToken;
      if(active){active.abort();active=null;loading=false;}
      return;
    }
    void load();
  });
  $("[data-strategy-capital]")?.addEventListener("change",()=>{render();renderBenchmark();});
  $("[data-strategy-cost]")?.addEventListener("change",()=>{render();renderBenchmark();});
  $("[data-strategy-period]")?.addEventListener("change",()=>{
    ++benchmarkToken;benchmark=null;renderBenchmark();
  });
  $("[data-strategy-study-passive]")?.addEventListener("click",()=>{void studyPassive();});
  $("[data-strategy-refresh]")?.addEventListener("click",()=>{void load(true);});
  return true;
}
root.AgentCryptoStrategyComparator=Object.freeze({...api,mount,snapshot:()=>({
  mounted:!!document.getElementById(ID),loaded:!!reports,loading,
  passiveLoaded:!!benchmark,passiveBusy:benchmarkBusy,
  privateAccount:false,realOrders:false,storage:false,archiveQuote:"USDT",reserveQuote:"USDC"
})});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
})(typeof globalThis!=="undefined"?globalThis:null);
