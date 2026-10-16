/* Agent-Crypto @erith.IA — 40.6.469 EXECUTION COST EVIDENCE CAPTURE IDEMPOTENCE
   Future-PAPER evidence capture only.
   Wraps the existing Auto Lifecycle bridge before autostart, measures Kraken BTC/EUR
   on PAPER open and PAPER close through the existing Execution Cost Truth owner,
   and projects the raw evidence into the existing durable PAPER state.
   It DOES NOT alter after-cost accounting yet: no historical backfill, no cost synthesis,
   no gate promotion, no threshold change and no real order. */
(()=>{
  "use strict";
  const BUILD="40.6.469";
  const ROOT="strategyAExecutionCostEvidenceCapture";
  const VENUE_KEY="kraken";
  const RECORDS=new Map();
  let installed=false,lastError=null;
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const text=v=>String(v??"").trim();
  const finite=v=>{
    if(v===null||v===undefined||typeof v==="boolean")return false;
    if(typeof v==="string"&&!v.trim())return false;
    return Number.isFinite(Number(v));
  };
  const positive=v=>finite(v)&&Number(v)>0?Number(v):null;
  const nowIso=()=>new Date().toISOString();
  const keyOf=v=>text(v?.execution_id||v?.trade_id||v?.reconciliation_id||v?.identity);
  const exactAmount=(simulations,amount)=>{
    const target=positive(amount);
    if(target===null)return null;
    return (Array.isArray(simulations)?simulations:[]).find(row=>finite(row?.amount_eur)&&Math.abs(Number(row.amount_eur)-target)<=0.01)||null;
  };

  function summarizeMeasurement(snapshot,notionalEur,phase){
    const venue=snapshot?.venues?.[VENUE_KEY]||null;
    if(!snapshot||!venue)return Object.freeze({state:"NO_MEASUREMENT",phase,notional_eur:positive(notionalEur)});
    if(venue.ok!==true)return Object.freeze({
      state:"VENUE_UNAVAILABLE",phase,notional_eur:positive(notionalEur),
      generated_at:snapshot?.generated_at||null,measurement_trigger:snapshot?.measurement_trigger||null,
      venue:venue?.venue||"Kraken Pro",error:venue?.error||venue?.diagnostic||"UNKNOWN"
    });
    const simulation=exactAmount(venue.simulations,notionalEur);
    const simulationUsable=!!(
      simulation&&simulation.buy_filled===true&&simulation.sell_filled===true&&
      finite(simulation.buy_avg_price)&&finite(simulation.sell_avg_price)&&
      finite(simulation.buy_slippage_pct)&&finite(simulation.sell_slippage_pct)
    );
    return Object.freeze({
      state:simulationUsable?"BOOK_SIMULATION_CAPTURED":"TOP_OF_BOOK_CAPTURED",
      phase,
      venue:String(venue.venue||"Kraken Pro"),
      pair:String(venue.pair||"BTC/EUR"),
      generated_at:snapshot.generated_at||null,
      measured_at:venue.measured_at||null,
      measurement_trigger:snapshot.measurement_trigger||null,
      transport:venue.transport||null,
      freshness_state:venue.freshness_state||"DIRECT_REQUEST",
      latency_ms:finite(venue.latency_ms)?Number(venue.latency_ms):null,
      best_bid_eur:positive(venue.best_bid),
      best_ask_eur:positive(venue.best_ask),
      mid_eur:positive(venue.mid),
      spread_pct:finite(venue.spread_pct)?Number(venue.spread_pct):null,
      spread_bp:finite(venue.spread_bp)?Number(venue.spread_bp):null,
      notional_eur:positive(notionalEur),
      exact_simulation_amount_eur:simulation&&finite(simulation.amount_eur)?Number(simulation.amount_eur):null,
      buy_avg_price_eur:simulationUsable?Number(simulation.buy_avg_price):null,
      sell_avg_price_eur:simulationUsable?Number(simulation.sell_avg_price):null,
      buy_slippage_pct:simulationUsable?Number(simulation.buy_slippage_pct):null,
      sell_slippage_pct:simulationUsable?Number(simulation.sell_slippage_pct):null,
      book_roundtrip_cost_pct:simulationUsable&&finite(simulation.book_roundtrip_cost_pct)?Number(simulation.book_roundtrip_cost_pct):null,
      market_market_estimated_cost_pct:simulationUsable&&finite(simulation.market_market_estimated_cost_pct)?Number(simulation.market_market_estimated_cost_pct):null,
      depth_evidence_available:simulationUsable,
      authoritative_after_cost_input:false
    });
  }

  function ensureRecord(executionId,notionalEur){
    const id=text(executionId);
    if(!id)return null;
    let row=RECORDS.get(id);
    if(!row){
      row={
        schema:"agent_crypto_strategy_a_execution_cost_evidence_capture_v1",
        build:BUILD,execution_id:id,venue:"Kraken Pro",pair:"BTC/EUR",
        opened_capture:null,closed_capture:null,
        open_requested_at:null,close_requested_at:null,
        notional_eur:positive(notionalEur),
        revision:0,state:"ARMED",
        after_cost_injection:false,historical_backfill:false,
        paper_only:true,real_orders:false
      };
      RECORDS.set(id,row);
    }else if(row.notional_eur===null&&positive(notionalEur)!==null){
      row.notional_eur=positive(notionalEur);
    }
    return row;
  }

  function publish(row,reason){
    if(!row)return;
    row.revision=(Number(row.revision)||0)+1;
    row.updated_at=nowIso();
    try{
      document.dispatchEvent(new CustomEvent("agent-crypto:strategy-a-execution-cost-evidence",{
        detail:{build:BUILD,execution_id:row.execution_id,revision:row.revision,reason:String(reason||"capture")}
      }));
      document.dispatchEvent(new CustomEvent("agent-crypto:evidence-data-changed",{
        detail:{build:BUILD,source:"execution-cost-evidence-capture",execution_id:row.execution_id,revision:row.revision,reason:String(reason||"capture")}
      }));
    }catch(_){}
    try{render();}catch(_){}
  }

  async function capturePhase(executionId,phase,notionalEur){
    const row=ensureRecord(executionId,notionalEur);
    if(!row)return {ok:false,reason:"EXECUTION_ID_MISSING"};
    const field=phase==="close"?"closed_capture":"opened_capture";
    const requestField=phase==="close"?"close_requested_at":"open_requested_at";
    // A repeated notification is not a new execution. Preserve the first attempt,
    // including PENDING or failure, rather than backfilling it with a later quote.
    if(row[field])return {
      ok:["BOOK_SIMULATION_CAPTURED","TOP_OF_BOOK_CAPTURED"].includes(row[field].state),
      duplicate:true,reason:"CAPTURE_ALREADY_REQUESTED",evidence:clone(row[field])
    };
    row[requestField]=nowIso();
    row[field]={state:"PENDING",phase,requested_at:row[requestField],authoritative_after_cost_input:false};
    row.state=phase==="close"?"CLOSE_CAPTURE_PENDING":"OPEN_CAPTURE_PENDING";
    publish(row,phase+"-pending");

    const owner=globalThis.AgentCryptoStrategyAExecutionCostTruth;
    if(!owner||typeof owner.measure!=="function"){
      row[field]={state:"OWNER_UNAVAILABLE",phase,captured_at:nowIso(),authoritative_after_cost_input:false};
      row.state="CAPTURE_INCOMPLETE";lastError="EXECUTION_COST_OWNER_UNAVAILABLE";publish(row,phase+"-owner-unavailable");
      return {ok:false,reason:lastError};
    }
    const trigger="paper-evidence-"+phase+":"+row.execution_id;
    try{
      const measured=await owner.measure(trigger);
      if(!measured||String(measured.measurement_trigger||"")!==trigger){
        row[field]={state:"BUSY_OR_STALE_MEASUREMENT",phase,captured_at:nowIso(),observed_trigger:measured?.measurement_trigger||null,authoritative_after_cost_input:false};
        row.state="CAPTURE_INCOMPLETE";lastError="MEASUREMENT_TRIGGER_MISMATCH";publish(row,phase+"-trigger-mismatch");
        return {ok:false,reason:lastError};
      }
      row[field]={...summarizeMeasurement(measured,row.notional_eur,phase),captured_at:nowIso()};
      const entryDone=row.opened_capture&&["BOOK_SIMULATION_CAPTURED","TOP_OF_BOOK_CAPTURED"].includes(row.opened_capture.state);
      const closeDone=row.closed_capture&&["BOOK_SIMULATION_CAPTURED","TOP_OF_BOOK_CAPTURED"].includes(row.closed_capture.state);
      row.state=entryDone&&closeDone?"ENTRY_CLOSE_CAPTURED":"CAPTURE_PARTIAL";
      lastError=null;publish(row,phase+"-captured");
      return {ok:true,evidence:clone(row[field])};
    }catch(error){
      row[field]={state:"MEASUREMENT_FAILED",phase,captured_at:nowIso(),error:String(error?.message||error),authoritative_after_cost_input:false};
      row.state="CAPTURE_INCOMPLETE";lastError=String(error?.message||error);publish(row,phase+"-failed");
      return {ok:false,reason:lastError};
    }
  }

  function decorateRows(rows){
    return (Array.isArray(rows)?rows:[]).map(raw=>{
      const row=clone(raw)||raw;
      const id=keyOf(row);
      const evidence=id?RECORDS.get(id):null;
      return evidence?{...row,execution_cost_evidence:clone(evidence)}:row;
    });
  }

  function installBridgeFacade(){
    const current=globalThis.AgentCryptoStrategyAAutoLifecycleBridge;
    if(!current)return false;
    if(current.execution_cost_evidence_capture_406463===true){installed=true;return true;}
    const base=current;
    const wrapped=Object.freeze({
      ...base,
      on_open:args=>{
        const result=base.on_open(args);
        if(result?.ok===true&&result.duplicate!==true){
          const executionId=text(result.execution_id||args?.fill?.execution_id);
          const notional=positive(result?.state?.asset_notional_eur??result?.state?.paper_authorized_notional_eur??args?.fill?.authorized_notional_eur);
          if(executionId)void capturePhase(executionId,"open",notional);
        }
        return result;
      },
      on_close:args=>{
        const executionId=text(args?.reconciliation?.execution_id);
        const before=executionId?(decorateRows(base.read?.()||[]).find(r=>keyOf(r)===executionId)||null):null;
        const result=base.on_close(args);
        if(result?.ok===true&&executionId){
          const notional=positive(before?.asset_notional_eur??before?.paper_authorized_notional_eur);
          void capturePhase(executionId,"close",notional);
        }
        return result;
      },
      read:()=>decorateRows(base.read?.()||[]),
      summary:()=>{
        const src=typeof base.summary==="function"?base.summary():{};
        const s=snapshot();
        return Object.freeze({...src,execution_cost_evidence_capture_build:BUILD,execution_cost_evidence_tracked:s.tracked,execution_cost_evidence_complete:s.entry_close_captured});
      },
      execution_cost_evidence_capture_406463:true,
      execution_cost_evidence_capture_build:BUILD,
      direct_storage_write:false,
      durable_paper_state_projection:true,
      after_cost_injection:false
    });
    try{globalThis.AgentCryptoStrategyAAutoLifecycleBridge=wrapped;}catch(_){}
    installed=globalThis.AgentCryptoStrategyAAutoLifecycleBridge===wrapped;
    return installed;
  }

  function snapshot(){
    const rows=[...RECORDS.values()];
    const stateOf=(row,field)=>String(row?.[field]?.state||"");
    return Object.freeze({
      schema:"agent_crypto_strategy_a_execution_cost_evidence_capture_status_v1",build:BUILD,
      installed,
      execution_cost_owner_available:!!globalThis.AgentCryptoStrategyAExecutionCostTruth,
      tracked:rows.length,
      entry_captured:rows.filter(r=>["BOOK_SIMULATION_CAPTURED","TOP_OF_BOOK_CAPTURED"].includes(stateOf(r,"opened_capture"))).length,
      close_captured:rows.filter(r=>["BOOK_SIMULATION_CAPTURED","TOP_OF_BOOK_CAPTURED"].includes(stateOf(r,"closed_capture"))).length,
      entry_close_captured:rows.filter(r=>["BOOK_SIMULATION_CAPTURED","TOP_OF_BOOK_CAPTURED"].includes(stateOf(r,"opened_capture"))&&["BOOK_SIMULATION_CAPTURED","TOP_OF_BOOK_CAPTURED"].includes(stateOf(r,"closed_capture"))).length,
      pending:rows.filter(r=>/PENDING/.test(stateOf(r,"opened_capture"))||/PENDING/.test(stateOf(r,"closed_capture"))).length,
      failed:rows.filter(r=>/FAILED|UNAVAILABLE|MISMATCH|STALE/.test(stateOf(r,"opened_capture"))||/FAILED|UNAVAILABLE|MISMATCH|STALE/.test(stateOf(r,"closed_capture"))).length,
      last_error:lastError,
      after_cost_injection:false,
      historical_backfill:false,
      persistence:"EXISTING_DURABLE_PAPER_STATES",
      db_schema_changed:false,
      paper_only:true,real_orders:false
    });
  }

  function selfTest(){
    const fake={
      generated_at:"2026-09-29T00:00:00Z",measurement_trigger:"paper-evidence-open:E1",
      venues:{kraken:{ok:true,venue:"Kraken Pro",pair:"BTC/EUR",measured_at:"2026-09-29T00:00:00Z",transport:"REST PUBLIC",freshness_state:"DIRECT_REQUEST",latency_ms:100,best_bid:99,best_ask:101,mid:100,spread_pct:2,spread_bp:200,simulations:[
        {amount_eur:50,buy_filled:true,sell_filled:true,buy_avg_price:101.1,sell_avg_price:98.9,buy_slippage_pct:0.0990099,sell_slippage_pct:0.1010101,book_roundtrip_cost_pct:2.178,market_market_estimated_cost_pct:3.778}
      ]}}
    };
    const exact=summarizeMeasurement(fake,50,"open");
    const offSize=summarizeMeasurement(fake,60,"open");
    const checks=Object.freeze({
      exact_50_book_capture:exact.state==="BOOK_SIMULATION_CAPTURED"&&exact.exact_simulation_amount_eur===50,
      raw_spread_preserved:exact.spread_bp===200&&exact.best_bid_eur===99&&exact.best_ask_eur===101,
      raw_slippage_preserved:finite(exact.buy_slippage_pct)&&finite(exact.sell_slippage_pct),
      unsupported_notional_not_invented:offSize.state==="TOP_OF_BOOK_CAPTURED"&&offSize.buy_slippage_pct===null,
      never_authoritative_after_cost_input:exact.authoritative_after_cost_input===false,
      no_historical_backfill:true
    });
    return Object.freeze({schema:"agent_crypto_strategy_a_execution_cost_evidence_capture_self_test_v1",build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }

  function ensureStyle(){
    if(typeof document==="undefined"||document.getElementById(ROOT+"Style"))return;
    const st=document.createElement("style");st.id=ROOT+"Style";
    st.textContent=`#strategyAExecutionCostEvidenceCapture{margin-top:10px;padding:10px;border:1px solid rgba(96,206,255,.24);border-radius:10px;background:rgba(5,18,29,.50)}#strategyAExecutionCostEvidenceCapture .ece-title{font-size:10px;font-weight:950;letter-spacing:.08em;color:#9fdcff;text-transform:uppercase}#strategyAExecutionCostEvidenceCapture .ece-sub,#strategyAExecutionCostEvidenceCapture .ece-foot{font-size:8px;line-height:1.4;color:#8faebb;margin-top:4px}#strategyAExecutionCostEvidenceCapture .ece-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;margin-top:9px}#strategyAExecutionCostEvidenceCapture .ece-k{padding:7px;border:1px solid rgba(255,255,255,.065);border-radius:8px;background:rgba(3,12,20,.36)}#strategyAExecutionCostEvidenceCapture .ece-k span{display:block;font-size:7px;color:#7697a8;text-transform:uppercase;font-weight:900}#strategyAExecutionCostEvidenceCapture .ece-k b{display:block;margin-top:3px;font-size:10px;color:#eff9ff}@media(max-width:1000px){#strategyAExecutionCostEvidenceCapture .ece-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
    document.head.appendChild(st);
  }
  function render(){
    if(typeof document==="undefined")return false;
    ensureStyle();
    const anchor=document.getElementById("strategyAAfterCostCompletenessTruth")
      ||document.getElementById("strategyAEvidenceIdentityCrosswalk")
      ||document.getElementById("strategyADurableEvidenceReconciliation")
      ||document.getElementById("strategyADurableEvidence")
      ||document.getElementById("strategyAAfterCost");
    if(!anchor)return false;
    let panel=document.getElementById("strategyAExecutionCostEvidenceCapture");
    if(!panel){panel=document.createElement("section");panel.id="strategyAExecutionCostEvidenceCapture";anchor.insertAdjacentElement("afterend",panel);}
    const s=snapshot();
    panel.innerHTML=`<div class="ece-title">STRATEGY A · EXECUTION COST EVIDENCE CAPTURE · ${BUILD}</div><div class="ece-sub">Futurs PAPER uniquement · mesure Kraken BTC/EUR à l'ouverture et à la fermeture · projection dans PAPER durable · aucune injection after-cost dans cette version.</div><div class="ece-grid"><div class="ece-k"><span>État</span><b>${s.installed&&s.execution_cost_owner_available?"ARMED":"WAIT"}</b></div><div class="ece-k"><span>PAPER suivis</span><b>${s.tracked}</b></div><div class="ece-k"><span>Entrées capturées</span><b>${s.entry_captured}</b></div><div class="ece-k"><span>Sorties capturées</span><b>${s.close_captured}</b></div><div class="ece-k"><span>Entrée + sortie</span><b>${s.entry_close_captured}</b></div><div class="ece-k"><span>After-cost injection</span><b>OFF</b></div></div><div class="ece-foot">Stockage : PAPER STATES durable existant · aucun nouveau schéma IndexedDB · aucun backfill historique · coût manquant jamais inventé.</div>`;
    return true;
  }

  const api=Object.freeze({
    build:BUILD,snapshot,self_test:selfTest,summarize_measurement:summarizeMeasurement,
    capture_open:(id,notional)=>capturePhase(id,"open",notional),
    capture_close:(id,notional)=>capturePhase(id,"close",notional),
    decorate_rows:decorateRows,install_bridge_facade:installBridgeFacade,render,
    venue:"Kraken Pro",pair:"BTC/EUR",after_cost_injection:false,historical_backfill:false,
    direct_storage_write:false,durable_paper_state_projection:true,db_schema_changed:false,
    paper_only:true,real_orders:false,thresholds_changed:false
  });
  globalThis.AgentCryptoStrategyAExecutionCostEvidenceCapture=api;

  installBridgeFacade();
  if(typeof document!=="undefined"){
    const attempt=()=>{try{installBridgeFacade();render();}catch(_){return false;}return true;};
    window.addEventListener("agent-crypto:strategy-core-ready",attempt,{once:true,passive:true});
    window.addEventListener("agent-crypto:strategy-a-audits-ready",attempt,{passive:true});
    document.addEventListener("agent-crypto:strategy-a-durable-evidence-ready",attempt,{passive:true});
    document.addEventListener("toggle",event=>{if(event?.target?.id==="simulation"&&event.target.open===true)queueMicrotask(attempt);},true);
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attempt,{once:true});else queueMicrotask(attempt);
  }
})();
