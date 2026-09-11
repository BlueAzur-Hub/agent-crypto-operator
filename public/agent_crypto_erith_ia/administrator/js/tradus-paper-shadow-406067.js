/*
  Agent-Crypto Administrator — TRADUS Paper Shadow
  Build: 40.6.67
  Parent: 40.6.66 R1
  Responsibility: convert validated TRADUS shadow observations into an isolated, session-local PAPER lifecycle.
  No broker/exchange order endpoint. No API key. No wallet. No mutation of Strategy A or historical Strategy B.
  Entry uses executable top-of-book side (BUY=ask, SELL=bid). Exit uses opposite executable side.
  Local fee assumption: 0.10% per fill, explicitly an assumption, not an exchange fee claim.
*/
(() => {
  "use strict";

  const BUILD="40.6.67";
  const EVENT_NAME="agentcrypto:tradus-shadow-observation";
  const PANEL_ID="tradusPaperShadow406067";
  const STYLE_ID="tradusPaperShadowStyle406067";
  const STORAGE_KEY="agent_crypto_tradus_paper_shadow_406067";
  const START_CAPITAL=1000;
  const TICKET_EUR=50;
  const FEE_RATE=0.001;
  const MAX_TRADES=200;

  let mounted=false;
  let state=freshState();

  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const finite=v=>Number.isFinite(Number(v));
  const money=v=>finite(v)?new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v)):"N/D";
  const price=v=>finite(v)?Number(v).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2}):"N/D";

  function freshState(){return {
    schema:"agent_crypto_tradus_paper_shadow_state_v1", build:BUILD, capital_start:START_CAPITAL,
    realized_net:0, fees:0, position:null, trades:[], last_action:"INITIALISÉ", last_observation_at:null,
    paper_only:true, real_orders:false, credentials:false, wallet:false
  };}

  function load(){
    try{
      const raw=sessionStorage.getItem(STORAGE_KEY); const x=raw?JSON.parse(raw):null;
      if(x&&x.schema==="agent_crypto_tradus_paper_shadow_state_v1") state=x;
    }catch(_){}
    return clone(state);
  }
  function persist(){try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch(_){return false;}}

  function usable(row){
    if(!row||row.ok!==true||!row.tick||!row.signal)return [false,"BOOK_INDISPONIBLE"];
    if(!finite(row.tick.bid)||!finite(row.tick.ask)||Number(row.tick.bid)<=0||Number(row.tick.ask)<=0||Number(row.tick.bid)>Number(row.tick.ask))return [false,"BOOK_INVALIDE"];
    if(row.signal.reason==="SPREAD_TOO_WIDE"||row.signal.reason==="STALE_DATA"||row.signal.reason==="FUTURE_DATA")return [false,row.signal.reason];
    return [true,"OK"];
  }

  function openPosition(side,row){
    const fill=side==="LONG"?Number(row.tick.ask):Number(row.tick.bid);
    const qty=TICKET_EUR/fill;
    const fee=TICKET_EUR*FEE_RATE;
    state.fees+=fee;
    state.realized_net-=fee;
    state.position={side,qty,entry_price:fill,entry_at:row.at||new Date().toISOString(),entry_notional:TICKET_EUR,entry_fee:fee,entry_signal:String(row.signal.action),entry_imbalance:finite(row.signal.imbalance)?Number(row.signal.imbalance):null};
    state.last_action=`OUVERTURE ${side} PAPER · ${price(fill)} €`;
  }

  function closePosition(row,reason){
    const p=state.position;if(!p)return null;
    const exit=p.side==="LONG"?Number(row.tick.bid):Number(row.tick.ask);
    const exitNotional=Math.abs(p.qty*exit);
    const exitFee=exitNotional*FEE_RATE;
    const gross=p.side==="LONG"?(exit-p.entry_price)*p.qty:(p.entry_price-exit)*p.qty;
    const net=gross-exitFee; // entry fee already deducted when opened
    state.fees+=exitFee; state.realized_net+=net;
    const trade={id:`TP-${Date.now()}-${state.trades.length+1}`,side:p.side,opened_at:p.entry_at,closed_at:row.at||new Date().toISOString(),entry_price:p.entry_price,exit_price:exit,qty:p.qty,entry_notional:p.entry_notional,entry_fee:p.entry_fee,exit_fee:exitFee,gross_pnl:gross,net_pnl_after_all_fees:gross-p.entry_fee-exitFee,close_reason:reason,exit_signal:String(row.signal.action||"NO_TRADE"),paper_only:true};
    state.trades.push(trade); if(state.trades.length>MAX_TRADES)state.trades=state.trades.slice(-MAX_TRADES);
    state.position=null; state.last_action=`CLÔTURE ${p.side} · ${reason} · net ${money(trade.net_pnl_after_all_fees)}`;
    return trade;
  }

  function mark(row){
    const p=state.position;if(!p||!row?.tick)return {gross:0,exit_fee:0,net:0,mark:null};
    const px=p.side==="LONG"?Number(row.tick.bid):Number(row.tick.ask);
    if(!finite(px))return {gross:null,exit_fee:null,net:null,mark:null};
    const gross=p.side==="LONG"?(px-p.entry_price)*p.qty:(p.entry_price-px)*p.qty;
    const exitFee=Math.abs(p.qty*px)*FEE_RATE;
    return {gross,exit_fee:exitFee,net:gross-p.entry_fee-exitFee,mark:px};
  }

  function process(row,source="event"){
    const [ok,why]=usable(row);
    state.last_observation_at=String(row?.at||new Date().toISOString());
    if(!ok){state.last_action=`ATTENTE DONNÉES · ${why}`;persist();render(row);return {action:"WAIT_DATA",reason:why,state:clone(state)};}
    const action=String(row.signal.action||"NO_TRADE").toUpperCase();
    const p=state.position;
    if(!p){
      if(action==="BUY")openPosition("LONG",row);
      else if(action==="SELL")openPosition("SHORT",row);
      else state.last_action="FLAT · AUCUN EDGE TRADUS";
    }else if((p.side==="LONG"&&action==="BUY")||(p.side==="SHORT"&&action==="SELL")){
      state.last_action=`MAINTIEN ${p.side} · SIGNAL CONFIRMÉ`;
    }else if(action==="NO_TRADE"){
      closePosition(row,"EDGE_DISPARU");
    }else{
      closePosition(row,"SIGNAL_INVERSE"); // no same-tick flip: next observation may open the new side
    }
    persist(); render(row);
    return {action:state.last_action,source,state:clone(state),mark:mark(row)};
  }

  function summary(row=null){
    const wins=state.trades.filter(t=>t.net_pnl_after_all_fees>0).length;
    const losses=state.trades.filter(t=>t.net_pnl_after_all_fees<0).length;
    const m=mark(row);
    return {capital:START_CAPITAL+state.realized_net,realized_net:state.realized_net,fees:state.fees,position:clone(state.position),open_mark:clone(m),trades:state.trades.length,wins,losses,last_action:state.last_action};
  }

  function ensureStyle(){if(typeof document==="undefined"||document.getElementById(STYLE_ID))return;const st=document.createElement("style");st.id=STYLE_ID;st.textContent=`
    #${PANEL_ID}{margin-top:10px;padding:12px;border:1px solid rgba(255,199,91,.30);border-radius:12px;background:rgba(30,21,5,.46);box-shadow:inset 0 0 0 1px rgba(255,255,255,.025)}
    #${PANEL_ID} .tp-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}
    #${PANEL_ID} .tp-kicker{font-size:8px;font-weight:950;letter-spacing:.12em;color:#ffd77c;text-transform:uppercase}
    #${PANEL_ID} .tp-title{margin-top:2px;font-size:13px;font-weight:950;letter-spacing:.035em}
    #${PANEL_ID} .tp-sub{margin-top:3px;font-size:8px;line-height:1.45;opacity:.76}
    #${PANEL_ID} .tp-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin-top:10px}
    #${PANEL_ID} .tp-card{padding:8px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(2,13,20,.48);min-width:0}
    #${PANEL_ID} .tp-card span{display:block;font-size:7px;letter-spacing:.07em;text-transform:uppercase;opacity:.62;font-weight:900}
    #${PANEL_ID} .tp-card b{display:block;margin-top:4px;font-size:10px;overflow-wrap:anywhere}
    #${PANEL_ID} .tp-status{margin-top:8px;padding:8px 9px;border:1px solid rgba(255,255,255,.07);border-radius:9px;font-size:9px;line-height:1.45}
    #${PANEL_ID} .tp-foot{margin-top:7px;font-size:7.5px;opacity:.66;line-height:1.4}
    #${PANEL_ID}[data-side="LONG"] [data-tp="position"]{color:#71efbd} #${PANEL_ID}[data-side="SHORT"] [data-tp="position"]{color:#ff8d9a}
    @media(max-width:1100px){#${PANEL_ID} .tp-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
  `;document.head.appendChild(st);}

  function render(row=null){if(typeof document==="undefined")return false;const p=document.getElementById(PANEL_ID);if(!p)return false;const x=summary(row);const set=(k,v)=>{const n=p.querySelector(`[data-tp="${k}"]`);if(n)n.textContent=v;};
    const side=state.position?.side||"FLAT";p.dataset.side=side;set("capital",money(x.capital));set("position",side);set("entry",state.position?`${price(state.position.entry_price)} €`:"—");set("mark",x.open_mark?.mark?`${price(x.open_mark.mark)} €`:"—");set("pnl",state.position&&finite(x.open_mark?.net)?money(x.open_mark.net):money(x.realized_net));set("trades",`${x.trades} · ${x.wins}G/${x.losses}P`);set("status",x.last_action);set("fees",money(x.fees));return true;}

  function exportJournal(){const payload={schema:"agent_crypto_tradus_paper_shadow_journal_v1",build:BUILD,exported_at:new Date().toISOString(),assumptions:{start_capital_eur:START_CAPITAL,ticket_eur:TICKET_EUR,fee_rate_per_fill:FEE_RATE,entry_fill:"BUY ask / SELL bid",exit_fill:"LONG bid / SHORT ask",same_tick_flip:false},summary:summary(),state:clone(state),paper_only:true,real_orders:false};if(typeof document!=="undefined"){const b=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="TRADUS_PAPER_SHADOW_40_6_67.json";a.click();setTimeout(()=>URL.revokeObjectURL(u),0);}return clone(payload);}

  function reset(){state=freshState();persist();render();return clone(state);}

  function mount(){if(typeof document==="undefined")return false;const old=document.getElementById(PANEL_ID);if(old){mounted=true;render();return true;}const anchor=document.getElementById("multiStrategyShadowLedger406066")||document.getElementById("tradusShadow406066");if(!anchor)return false;ensureStyle();const p=document.createElement("section");p.id=PANEL_ID;p.dataset.tradusPaperBuild=BUILD;p.innerHTML=`
    <div class="tp-head"><div><div class="tp-kicker">TRADUS PAPER SHADOW · INDÉPENDANT</div><div class="tp-title">Simulation micro-transactions · lifecycle + P/L après coûts</div><div class="tp-sub">Capital virtuel 1 000 € · ticket 50 € · une position max · LONG/SHORT synthétique PAPER · frais locaux supposés 0,10 %/fill · spread payé par le côté exécutable du carnet.</div></div><button type="button" class="btn small" id="tradusPaperExport406067">EXPORTER JOURNAL</button></div>
    <div class="tp-grid"><div class="tp-card"><span>Capital PAPER</span><b data-tp="capital">1 000,00 €</b></div><div class="tp-card"><span>Position</span><b data-tp="position">FLAT</b></div><div class="tp-card"><span>Entrée</span><b data-tp="entry">—</b></div><div class="tp-card"><span>Mark exécutable</span><b data-tp="mark">—</b></div><div class="tp-card"><span>P/L net</span><b data-tp="pnl">0,00 €</b></div><div class="tp-card"><span>Trades</span><b data-tp="trades">0 · 0G/0P</b></div></div>
    <div class="tp-status" data-tp="status">EN ATTENTE D'UNE OBSERVATION TRADUS.</div><div class="tp-foot">PAPER ONLY · frais cumulés <b data-tp="fees">0,00 €</b> · aucun Kraken · aucune clé · aucun wallet · aucun ordre réel · Strategy A et ancien workspace « STRATÉGIE B » non modifiés.</div>`;anchor.insertAdjacentElement("afterend",p);p.querySelector("#tradusPaperExport406067")?.addEventListener("click",exportJournal);mounted=true;render();return true;}

  function onObservation(e){if(!mounted)mount();process(e?.detail,"tradus_event");}

  function selfTest(){const row=(action,bid,ask,imb=0)=>({ok:true,at:new Date().toISOString(),tick:{bid,ask},signal:{action,reason:action==="NO_TRADE"?"INSUFFICIENT_EDGE":action==="BUY"?"POSITIVE_IMBALANCE":"NEGATIVE_IMBALANCE",imbalance:imb}});const saved=clone(state);state=freshState();const a=process(row("BUY",99.9,100.0,.3),"test");const opened=state.position?.side==="LONG";const b=process(row("NO_TRADE",100.5,100.6,0),"test");const closed=!state.position&&state.trades.length===1;const netLong=state.trades[0]?.net_pnl_after_all_fees;const c=process(row("SELL",100.0,100.1,-.3),"test");const shortOpened=state.position?.side==="SHORT";const d=process(row("BUY",99.4,99.5,.3),"test");const shortClosed=!state.position&&state.trades.length===2;const netShort=state.trades[1]?.net_pnl_after_all_fees;const pass=opened&&closed&&finite(netLong)&&netLong>0&&shortOpened&&shortClosed&&finite(netShort)&&netShort>0;const receipt={build:BUILD,pass,checks:{long_open:opened,long_close:closed,long_net:netLong,short_open:shortOpened,short_close_on_reverse:shortClosed,short_net:netShort},fee_rate:FEE_RATE,ticket_eur:TICKET_EUR,real_orders:false};state=saved||freshState();persist();render();return receipt;}

  const api=Object.freeze({build:BUILD,process_observation:process,read:()=>clone(state),summary:()=>summary(),mount,export_journal:exportJournal,reset,self_test:selfTest,assumptions:Object.freeze({start_capital_eur:START_CAPITAL,ticket_eur:TICKET_EUR,fee_rate_per_fill:FEE_RATE}),paper_only:true,real_orders:false,credentials:false,wallet:false,recurring_timer:false,network_owner:false});
  globalThis.AgentCryptoTradusPaperShadow406067=api;load();
  if(typeof document!=="undefined"){document.addEventListener(EVENT_NAME,onObservation);const boot=()=>{mount();};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();window.addEventListener("load",boot,{once:true});window.addEventListener("pageshow",boot);document.addEventListener("click",()=>{if(!mounted)mount();},{capture:true});}
})();
