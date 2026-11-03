/* Operator Trader / TRADUS: read-only projection of the existing SHADOW and
 * PAPER runtime owners. No second signal, fetch owner, timer, storage or order.
 */
(()=>{
"use strict";
const EXPORT="AgentCryptoTraderTradusView";
const SOURCE_EVENT="agentcrypto:tradus-shadow-observation";
const PAPER_EVENT="agentcrypto:tradus-paper-snapshot";
if(globalThis[EXPORT])return;
function allowedLocation(loc=globalThis.location){
  if(!loc)return false;
  const q=new URLSearchParams(String(loc.search||""));
  return q.get("surface")==="trader"&&q.get("profile")==="yohan";
}
function finite(v){
  if(v===null||v===undefined||v==="")return null;
  const n=Number(v);
  return Number.isFinite(n)?n:null;
}
function model(state={},now=Date.now()){
  const shadow=state.shadow||null,paper=state.paper||null,obs=state.observability||null;
  const date=shadow&&shadow.at?Date.parse(String(shadow.at)):NaN;
  const observed=Number.isFinite(date)&&date<=now;
  const age=observed?Math.max(0,(now-date)/1000):null;
  const bookOk=shadow?.ok===true&&shadow.source==="BINANCE_PUBLIC_DEPTH"&&shadow.tick?.symbol==="BTCEUR";
  const fresh=bookOk&&age!==null&&age<=10;
  const candidate=String(shadow?.signal?.action||"").toUpperCase();
  const action=fresh&&["BUY","SELL","NO_TRADE"].includes(candidate)?candidate:"N/D";
  const paperSide=paper?.position?.side?String(paper.position.side).toUpperCase():
    paper&&paper.position===null?"FLAT":"N/D";
  const trades=finite(obs?.archive?.trades);
  let availability="EN ATTENTE DE SOURCE";
  if(shadow&&shadow.ok!==true)availability="CARNET INDISPONIBLE";
  else if(shadow&&(!bookOk||age===null))availability="PROVENANCE OU HEURE INCONNUE";
  else if(shadow&&!fresh)availability="CARNET PÉRIMÉ";
  else if(fresh)availability="OBSERVATION PUBLIQUE · FRAÎCHE";
  return Object.freeze({
    status:availability,action,
    reason:fresh?String(shadow?.signal?.reason||"N/D"):"N/D",
    comparison:fresh?String(shadow?.comparison?.state||"NON COMPARABLE"):"NON COMPARABLE",
    source:shadow?.source==="BINANCE_PUBLIC_DEPTH"?"Binance public · BTCEUR":"Source non confirmée",
    observed_at:observed?new Date(date).toISOString():null,
    age_seconds:age,book_fresh:fresh,
    symbol:shadow?.tick?.symbol==="BTCEUR"?"BTCEUR":"N/D",
    imbalance:fresh?finite(shadow?.signal?.imbalance):null,
    spread_ratio:fresh?finite(shadow?.signal?.spread_ratio):null,
    paper_side:paperSide,paper_trades:trades,
    paper_realized:paper?finite(paper.realized_net):null,
    signal_qualified_is_order_approval:false,
    paper_only:true,shadow_only:true,real_orders:false
  });
}
const safeRead=(owner)=>{try{return typeof owner?.read==="function"?owner.read():null;}catch(_){return null;}};
const read=()=>model({
  shadow:safeRead(globalThis.AgentCryptoTradusShadow),
  paper:safeRead(globalThis.AgentCryptoTradusPaperShadow),
  observability:safeRead(globalThis.AgentCryptoTradusPaperObservability)
});
const value=(n,digits=2)=>n===null?"N/D":Number(n).toLocaleString("fr-FR",
  {minimumFractionDigits:digits,maximumFractionDigits:digits});
const percent=n=>n===null?"N/D":value(n*100,2)+" %";
function render(){
  if(typeof document==="undefined")return null;
  const panel=document.getElementById("traderTradusPanel");
  if(!panel)return null;
  const state=read();
  panel.dataset.bookFresh=state.book_fresh?"true":"false";
  const set=(key,txt)=>{
    const node=panel.querySelector('[data-tt="'+key+'"]');
    if(node)node.textContent=String(txt);
  };
  set("status",state.status);set("source",state.source);set("symbol",state.symbol);
  set("signal",state.action);set("reason",state.reason);set("comparison",state.comparison);
  set("age",state.age_seconds===null?"N/D":value(state.age_seconds,1)+" s");
  set("observed",state.observed_at?new Date(state.observed_at).toLocaleString("fr-FR"):"N/D");
  set("imbalance",percent(state.imbalance));set("spread",percent(state.spread_ratio));
  set("paperSide",state.paper_side);set("trades",state.paper_trades===null?"N/D":String(state.paper_trades));
  set("realized",state.paper_realized===null?"N/D":value(state.paper_realized)+" €");
  const request=panel.querySelector("#traderTradusRefreshSource");
  if(request&&request.dataset.busy!=="true")
    request.disabled=typeof globalThis.AgentCryptoTradusShadow?.refresh!=="function";
  return state;
}
async function refreshSource(){
  const btn=document.getElementById("traderTradusRefreshSource");
  const owner=globalThis.AgentCryptoTradusShadow;
  if(typeof owner?.refresh!=="function"){render();return false;}
  if(btn?.dataset.busy==="true")return false;
  if(btn){btn.dataset.busy="true";btn.disabled=true;}
  try{await owner.refresh("trader_operator_manual_public_read");}
  catch(_){/* Canonical owner or fallback state remains authoritative. */}
  finally{if(btn){delete btn.dataset.busy;btn.disabled=false;}render();}
  return true;
}
function mount(){
  if(typeof document==="undefined"||!allowedLocation())return false;
  // Use the existing bottom handoff zone created by trader-paper-lab-view.js.
  // No new top navigation control, trading workspace, or market owner.
  const operator=document.getElementById("traderYoannOperatorSection");
  const handoffBody=operator?.querySelector(":scope > div");
  if(!operator||!handoffBody)return false;
  if(document.getElementById("traderTradusPanel")){render();return true;}
  const style=document.createElement("style");
  style.id="traderTradusReadonlyStyle";
  style.textContent=[
    "#traderYoannOperatorSection #traderTradusPanel{margin-top:18px!important}",
    "#traderTradusToggle{display:list-item;cursor:pointer;padding:9px 6px;color:#9af6db;font-size:14px;font-weight:800}",
    "#traderTradusPanel[open] > #traderTradusToggle{color:#d7fff4}",
    "#traderTradusPanel .tt-content{padding:10px 4px 5px}",
    "#traderTradusPanel{position:relative;z-index:3;display:block;box-sizing:border-box;width:100%;margin:0 0 12px;padding:15px 18px;border:1px solid rgba(111,233,205,.4);border-radius:15px;background:linear-gradient(135deg,#091b27,#0a1f25);color:#e8f7fb;box-shadow:0 12px 36px rgba(0,0,0,.22)}",
    "#traderTradusPanel .tt-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}",
    "#traderTradusPanel h2{font-size:18px;line-height:1.25;margin:0}",
    "#traderTradusPanel .tt-kicker{font-size:11px;letter-spacing:.11em;color:#9df6d7;font-weight:800}",
    "#traderTradusPanel .tt-meta{color:#9db7c4;font-size:12px;margin:7px 0 12px}",
    "#traderTradusPanel .tt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin:8px 0 14px}",
    "#traderTradusPanel .tt-grid>div{border:1px solid rgba(100,188,207,.25);background:#102a33;border-radius:9px;padding:9px 12px}",
    "#traderTradusPanel dt{color:#9fbbca;font-size:11px;text-transform:uppercase;letter-spacing:.04em}",
    "#traderTradusPanel dd{margin:4px 0 0;font-size:14px;font-weight:700;overflow-wrap:anywhere}",
    "#traderTradusPanel .tt-status{font-weight:800;color:#a8f5df}",
    "#traderTradusPanel[data-book-fresh='false'] .tt-status{color:#ffd38d}",
    "#traderTradusPanel .tt-actions{display:flex;gap:8px;flex-wrap:wrap}",
    "#traderTradusPanel button{border:1px solid #31718a;border-radius:9px;background:#123440;color:#e8fbff;padding:8px 12px;cursor:pointer}",
    "#traderTradusPanel button:disabled{opacity:.55;cursor:not-allowed}",
    "#traderTradusPanel .tt-foot{color:#a4bac6;font-size:12px;margin:12px 0 0;line-height:1.5}",
    "@media(max-width:650px){#traderTradusPanel{padding:10px}#traderTradusPanel .tt-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}"
  ].join("\n");
  document.head.appendChild(style);
  const panel=document.createElement("details");
  panel.id="traderTradusPanel";panel.className="trader-tradus-readonly";
  panel.open=false;panel.setAttribute("aria-label","TRADUS · SHADOW et PAPER sans ordres");
  panel.innerHTML=[
    '<summary id="traderTradusToggle">TRADUS · SHADOW / PAPER — consultation</summary>',
    '<div class="tt-content">',
    '<div class="tt-head"><div><span class="tt-kicker">TRADER YOANN · OBSERVATION SEULE</span>',
    '<h2>TRADUS · SHADOW / PAPER</h2></div>',
    '<button id="traderTradusClose" type="button">Fermer ×</button></div>',
    '<p class="tt-meta">Propriétaire TRADUS existant · carnet public Binance BTCEUR · aucune exécution</p>',
    '<p class="tt-status" data-tt="status" role="status">EN ATTENTE DE SOURCE</p>',
    '<dl class="tt-grid">',
    '<div><dt>Source vérifiée</dt><dd data-tt="source">N/D</dd></div>',
    '<div><dt>Paire</dt><dd data-tt="symbol">N/D</dd></div>',
    '<div><dt>Signal SHADOW</dt><dd data-tt="signal">N/D</dd></div>',
    '<div><dt>Justification</dt><dd data-tt="reason">N/D</dd></div>',
    '<div><dt>Comparaison Strategy A</dt><dd data-tt="comparison">NON COMPARABLE</dd></div>',
    '<div><dt>Imbalance</dt><dd data-tt="imbalance">N/D</dd></div>',
    '<div><dt>Spread</dt><dd data-tt="spread">N/D</dd></div>',
    '<div><dt>Observation</dt><dd data-tt="observed">N/D</dd></div>',
    '<div><dt>Âge du carnet</dt><dd data-tt="age">N/D</dd></div>',
    '<div><dt>Position PAPER locale</dt><dd data-tt="paperSide">N/D</dd></div>',
    '<div><dt>Trades PAPER archivés</dt><dd data-tt="trades">N/D</dd></div>',
    '<div><dt>Résultat réalisé PAPER</dt><dd data-tt="realized">N/D</dd></div>',
    '</dl><div class="tt-actions">',
    '<button type="button" id="traderTradusReadState">Relire l’état</button>',
    '<button type="button" id="traderTradusRefreshSource">Actualiser carnet public</button></div>',
    '<p class="tt-foot">Simulation sans argent réel. BUY/SELL est un signal d’étude, jamais une approbation de risque ou un ordre. Source inconnue, absente ou périmée = N/D. Aucun accès au Bridge privé ni aux clés OKX.</p>',
    '</div>'
  ].join("");
  handoffBody.appendChild(panel);
  const summary=panel.querySelector("#traderTradusToggle");
  const close=()=>{panel.open=false;summary?.focus();};
  panel.addEventListener("toggle",()=>{if(panel.open)render();});
  panel.querySelector("#traderTradusClose").addEventListener("click",close);
  panel.querySelector("#traderTradusReadState").addEventListener("click",render);
  panel.querySelector("#traderTradusRefreshSource").addEventListener("click",refreshSource);
  panel.addEventListener("keydown",event=>{if(event.key==="Escape")close();});
  document.addEventListener(SOURCE_EVENT,()=>{if(panel.open)render();},{passive:true});
  document.addEventListener(PAPER_EVENT,()=>{if(panel.open)render();},{passive:true});
  globalThis.addEventListener("agent-crypto:postboot-runtime-ready",()=>{if(panel.open)render();},{passive:true});
  render();
  return true;
}
function self_test(){
  const now=Date.parse("2026-11-03T20:00:00Z");
  const good={ok:true,at:new Date(now-1000).toISOString(),source:"BINANCE_PUBLIC_DEPTH",
    tick:{symbol:"BTCEUR"},signal:{action:"BUY",reason:"POSITIVE_IMBALANCE",imbalance:.4,spread_ratio:.001,risk_approved:true},
    comparison:{state:"CONVERGENCE POTENTIELLE"}};
  const known=model({shadow:good},now),expired=model({shadow:{...good,at:new Date(now-20000).toISOString()}},now);
  const missing=model({},now);
  return Object.freeze({pass:known.action==="BUY"&&known.book_fresh&&known.symbol==="BTCEUR"&&
    !known.signal_qualified_is_order_approval&&expired.action==="N/D"&&!expired.book_fresh&&
    missing.action==="N/D"&&missing.paper_trades===null,
    checks:{fresh:known.action,stale:expired.action,missing:missing.action},
    real_orders:false,network_owner:false,recurring_timer:false,storage_writes:false});
}
globalThis[EXPORT]=Object.freeze({
  build:"40.6.719",surface:"trader",mode:"TRADUS_READONLY",mount,render,model,allowedLocation,self_test,
  shadow_only:true,paper_only:true,real_orders:false,network_owner:false,recurring_timer:false,
  writes_storage:false,changes_roles:false
});
if(typeof document!=="undefined"&&allowedLocation()){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
}
})();