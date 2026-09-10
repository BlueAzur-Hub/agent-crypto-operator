/*
  Agent-Crypto Administrator — Strategy A Paper V2 after-cost metrics
  Build: 40.4.292
  Responsibility: deterministic accounting over Paper-only closed Trade Envelopes.
  No market fetch, no timer, no credentials, no Kraken, no real order, no profitability claim.
*/
(() => {
  "use strict";
  const BUILD = "40.4.292";
  const SCHEMA = "agent_crypto_strategy_a_after_cost_metrics_v1";
  const SAMPLE_MIN = 30;
  const ROWS = [];
  const clone = v => { try { return JSON.parse(JSON.stringify(v)); } catch (_) { return null; } };
  const finite = v => Number.isFinite(Number(v));
  const num = (v, fallback=0) => finite(v) ? Number(v) : fallback;
  const round = (v, d=8) => Number(num(v).toFixed(d));

  function normalizeCosts(costs={}) {
    return {
      fees_eur: Math.max(0,num(costs.fees_eur)),
      spread_eur: Math.max(0,num(costs.spread_eur)),
      slippage_eur: Math.max(0,num(costs.slippage_eur)),
      impact_eur: Math.max(0,num(costs.impact_eur))
    };
  }
  function record(input={}) {
    const tradeId=String(input.trade_id||"").trim();
    if(!tradeId) throw new Error("trade_id required");
    if(ROWS.some(row=>row.trade_id===tradeId)) return {ok:false,reason:"DUPLICATE_TRADE_ID",trade_id:tradeId};
    const entry=num(input.entry_price_eur), exit=num(input.exit_price_eur), filled=Math.max(0,num(input.filled_notional_eur));
    if(!(entry>0)||!(exit>0)||!(filled>0)) return {ok:false,reason:"INCOMPLETE_PAPER_FACTS",trade_id:tradeId};
    const qty=filled/entry;
    const gross=(exit-entry)*qty;
    const costs=normalizeCosts(input.costs);
    const totalCosts=costs.fees_eur+costs.spread_eur+costs.slippage_eur+costs.impact_eur;
    const net=gross-totalCosts;
    const row={schema:SCHEMA,build:BUILD,trade_id:tradeId,at:new Date().toISOString(),symbol:String(input.symbol||"BTC").toUpperCase(),side:"BUY_PAPER",entry_price_eur:entry,exit_price_eur:exit,filled_notional_eur:filled,quantity:qty,gross_pnl_eur:gross,costs,total_costs_eur:totalCosts,net_pnl_eur:net,after_cost_return_pct:filled>0?net/filled*100:0,paper_only:true,real_order:false};
    ROWS.push(row); render(); return {ok:true,row:clone(row)};
  }
  function fromLifecycle(envelope, options={}) {
    if(!envelope||String(envelope.state)!=="CLOSED") return {ok:false,reason:"LIFECYCLE_NOT_CLOSED"};
    if(envelope.paper_only!==true||envelope.safety?.real_order===true) return {ok:false,reason:"NON_PAPER_ENVELOPE_REFUSED"};
    return record({trade_id:envelope.trade_id,symbol:envelope.symbol,entry_price_eur:envelope.average_fill_price_eur,exit_price_eur:options.exit_price_eur,filled_notional_eur:envelope.filled_notional_eur,costs:options.costs||{}});
  }
  function summary(rows=ROWS) {
    let equity=0,peak=0,maxDd=0;
    const ordered=(Array.isArray(rows)?rows:[]).filter(Boolean);
    for(const row of ordered){equity+=num(row.net_pnl_eur);peak=Math.max(peak,equity);maxDd=Math.max(maxDd,peak-equity);}
    const n=ordered.length,w=ordered.filter(r=>num(r.net_pnl_eur)>0).length,l=ordered.filter(r=>num(r.net_pnl_eur)<0).length;
    const gross=ordered.reduce((a,r)=>a+num(r.gross_pnl_eur),0),costs=ordered.reduce((a,r)=>a+num(r.total_costs_eur),0),net=ordered.reduce((a,r)=>a+num(r.net_pnl_eur),0);
    return {schema:"agent_crypto_strategy_a_after_cost_summary_v1",build:BUILD,trades:n,winners:w,losers:l,flat:n-w-l,win_rate_pct:n?w/n*100:0,gross_pnl_eur:gross,total_costs_eur:costs,net_pnl_eur:net,expectancy_eur_per_trade:n?net/n:0,max_drawdown_eur:maxDd,sample_state:n>=SAMPLE_MIN?"SAMPLE_READY":"INSUFFICIENT_SAMPLE",sample_min:SAMPLE_MIN,profitability_claim:false,paper_only:true};
  }
  function selfTest(){
    const saved=ROWS.splice(0);
    const checks=[];
    checks.push(record({trade_id:"T1",entry_price_eur:100,exit_price_eur:110,filled_notional_eur:50,costs:{fees_eur:.2,spread_eur:.1,slippage_eur:.1,impact_eur:.1}}));
    checks.push(record({trade_id:"T2",entry_price_eur:100,exit_price_eur:95,filled_notional_eur:50,costs:{fees_eur:.2,spread_eur:.1,slippage_eur:.1,impact_eur:.1}}));
    const dup=record({trade_id:"T2",entry_price_eur:100,exit_price_eur:120,filled_notional_eur:50});
    const s=summary();
    const pass=checks.every(x=>x.ok)&&dup.ok===false&&dup.reason==="DUPLICATE_TRADE_ID"&&s.trades===2&&Math.abs(s.total_costs_eur-1)<1e-9&&s.sample_state==="INSUFFICIENT_SAMPLE"&&s.profitability_claim===false;
    ROWS.splice(0); ROWS.push(...saved); render();
    return {schema:"agent_crypto_strategy_a_after_cost_self_test_v1",build:BUILD,pass,checks:{two_rows:checks.every(x=>x.ok),duplicate_refused:dup.reason==="DUPLICATE_TRADE_ID",costs_counted:Math.abs(s.total_costs_eur-1)<1e-9,sample_truth:s.sample_state==="INSUFFICIENT_SAMPLE"}};
  }
  function exportJson(){
    const payload={schema:"agent_crypto_strategy_a_after_cost_export_v1",build:BUILD,exported_at:new Date().toISOString(),summary:summary(),trades:clone(ROWS)||[],paper_only:true,real_orders:false};
    if(typeof document!=="undefined"){const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="STRATEGY_A_AFTER_COST_METRICS.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),0);}return payload;
  }
  function ensureStyle(){if(typeof document==="undefined"||document.getElementById("strategyAAfterCostStyle404292"))return;const st=document.createElement("style");st.id="strategyAAfterCostStyle404292";st.textContent=`#strategyAAfterCost404292{margin-top:10px;padding:10px;border:1px solid rgba(95,220,182,.22);border-radius:10px;background:rgba(3,23,20,.48)}#strategyAAfterCost404292 .sam-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:flex-start}#strategyAAfterCost404292 .sam-title{font-size:9px;font-weight:950;letter-spacing:.09em;color:#a8f1dc;text-transform:uppercase}#strategyAAfterCost404292 .sam-sub{font-size:8px;color:#7faaa0;margin-top:3px}#strategyAAfterCost404292 .sam-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;margin-top:8px}#strategyAAfterCost404292 .sam-k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px}#strategyAAfterCost404292 .sam-k span{display:block;font-size:7px;color:#78958e;text-transform:uppercase;font-weight:900}#strategyAAfterCost404292 .sam-k b{display:block;margin-top:3px;font-size:9px;color:#eefaf6}#strategyAAfterCost404292 .sam-foot{font-size:8px;color:#7e9c95;margin-top:7px}@media(max-width:950px){#strategyAAfterCost404292 .sam-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;document.head.appendChild(st);}
  function render(){if(typeof document==="undefined")return false;ensureStyle();const anchor=document.getElementById("strategyAPaperLifecycle404291");if(!anchor)return false;let p=document.getElementById("strategyAAfterCost404292");if(!p){p=document.createElement("section");p.id="strategyAAfterCost404292";p.innerHTML=`<div class="sam-head"><div><div class="sam-title">PAPER V2 · AFTER-COST METRICS</div><div class="sam-sub">Frais + spread + slippage + impact séparés. Aucun verdict de rentabilité avant échantillon suffisant.</div></div><button class="btn small" type="button" id="strategyAAfterCostExport404292">EXPORTER</button></div><div class="sam-grid"><div class="sam-k"><span>Trades</span><b data-sam="trades">0</b></div><div class="sam-k"><span>Win rate</span><b data-sam="win">0 %</b></div><div class="sam-k"><span>Brut</span><b data-sam="gross">0,00 €</b></div><div class="sam-k"><span>Coûts</span><b data-sam="costs">0,00 €</b></div><div class="sam-k"><span>Net</span><b data-sam="net">0,00 €</b></div><div class="sam-k"><span>Échantillon</span><b data-sam="sample">INSUFFICIENT_SAMPLE</b></div></div><div class="sam-foot">PAPER ONLY · aucun réseau · aucune clé · aucune mutation des règles Strategy A · seuil Cost Gate inchangé.</div>`;anchor.insertAdjacentElement("afterend",p);p.querySelector("#strategyAAfterCostExport404292")?.addEventListener("click",exportJson);}const s=summary();const set=(k,v)=>{const n=p.querySelector(`[data-sam="${k}"]`);if(n)n.textContent=v;};set("trades",s.trades);set("win",`${s.win_rate_pct.toFixed(1)} %`);set("gross",`${s.gross_pnl_eur.toFixed(2)} €`);set("costs",`${s.total_costs_eur.toFixed(2)} €`);set("net",`${s.net_pnl_eur.toFixed(2)} €`);set("sample",s.sample_state);return true;}
  const api=Object.freeze({build:BUILD,schema:SCHEMA,record,from_lifecycle:fromLifecycle,read:()=>clone(ROWS)||[],summary,self_test:selfTest,export_json:exportJson,render,sample_min:SAMPLE_MIN,paper_only:true,real_orders:false,network:false,storage_write:false,profitability_claim:false});
  globalThis.AgentCryptoStrategyAAfterCostMetrics404292=api;
  if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();}
})();
