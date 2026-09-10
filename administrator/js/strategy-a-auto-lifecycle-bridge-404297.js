/*
  Agent-Crypto Administrator — Strategy A Auto/Paper ↔ Lifecycle bridge
  Build: 40.6.18
  Responsibility: synchronize actual local Paper execution facts with the deterministic lifecycle.
  External null/blank/boolean/missing numeric facts stay UNKNOWN; they are never defaulted to zero.
  Asset notional may be derived only from price×quantity or authorized-notional−known-fee.
  Contradictory known notional facts fail closed. No network, real order, wallet or credentials.
*/
(() => {
  "use strict";
  const BUILD="40.6.18";
  const SCHEMA="agent_crypto_strategy_a_auto_lifecycle_bridge_v1";
  const BRIDGED=new Map();
  let blockedReason=null;
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const num=v=>{
    if(v===null||v===undefined||typeof v==="boolean")return null;
    if(typeof v==="string"&&!v.trim())return null;
    const n=Number(v);return Number.isFinite(n)?n:null;
  };
  const positive=v=>{const n=num(v);return n!==null&&n>0?n:null;};
  const nonnegative=v=>{const n=num(v);return n!==null&&n>=0?n:null;};
  const NOTIONAL_TOLERANCE_EUR=0.01;
  const lifecycle=()=>globalThis.AgentCryptoStrategyAPaperLifecycle404295||null;
  function apiReady(){const a=lifecycle();return !!(a?.create&&a?.risk_approve&&a?.submit&&a?.acknowledge&&a?.fill&&a?.reconcile&&a?.protect&&a?.close);}
  function preflight(){const a=lifecycle();return {schema:SCHEMA,build:BUILD,ready:apiReady()&&!blockedReason,api_available:apiReady(),blocked_reason:blockedReason,paper_only:true,accounting_owner:"40.4.263/40.4.264",lifecycle_owner:a?.build||null,real_orders:false,network:false};}
  function fail(reason,error=null){blockedReason=String(reason||"LIFECYCLE_BRIDGE_ERROR");return {ok:false,reason:blockedReason,error:error?String(error?.message||error):null,bridge_blocked:true};}
  function normalizeOpenFacts(fill={}){
    const fillPrice=positive(fill?.fill_price_eur);
    const qty=positive(fill?.quantity_btc);
    const authorized=positive(fill?.authorized_notional_eur);
    const entryFee=nonnegative(fill?.entry_fee_eur);
    const direct=fillPrice!==null&&qty!==null?fillPrice*qty:null;
    const derived=authorized!==null&&entryFee!==null&&authorized>entryFee?authorized-entryFee:null;
    const both=direct!==null&&derived!==null;
    const tolerance=both?Math.max(NOTIONAL_TOLERANCE_EUR,Math.max(Math.abs(direct),Math.abs(derived))*1e-6):NOTIONAL_TOLERANCE_EUR;
    const contradictory=both&&Math.abs(direct-derived)>tolerance;
    const assetNotional=contradictory?null:(direct!==null?direct:derived);
    const unknown=[];
    if(fillPrice===null)unknown.push("fill_price_eur");
    if(qty===null)unknown.push("quantity_btc");
    if(authorized===null)unknown.push("authorized_notional_eur");
    if(entryFee===null)unknown.push("entry_fee_eur");
    return {
      fill_price_eur:fillPrice,quantity_btc:qty,authorized_notional_eur:authorized,entry_fee_eur:entryFee,
      direct_asset_notional_eur:direct,derived_asset_notional_eur:derived,asset_notional_eur:assetNotional,
      asset_notional_source:direct!==null?"FILL_PRICE_X_QUANTITY":derived!==null?"AUTHORIZED_MINUS_ENTRY_FEE":null,
      contradictory,notional_tolerance_eur:tolerance,unknown_external_numeric_fields:unknown,
      lifecycle_ready:!contradictory&&fillPrice!==null&&assetNotional!==null&&assetNotional>0
    };
  }
  function selfTest(){
    const direct=normalizeOpenFacts({fill_price_eur:100,quantity_btc:.5,authorized_notional_eur:null,entry_fee_eur:null});
    const incomplete=normalizeOpenFacts({fill_price_eur:100,quantity_btc:null,authorized_notional_eur:51,entry_fee_eur:null});
    const fallback=normalizeOpenFacts({fill_price_eur:100,quantity_btc:null,authorized_notional_eur:51,entry_fee_eur:1});
    const contradiction=normalizeOpenFacts({fill_price_eur:100,quantity_btc:.5,authorized_notional_eur:60,entry_fee_eur:1});
    const blank=normalizeOpenFacts({fill_price_eur:"",quantity_btc:false,authorized_notional_eur:null,entry_fee_eur:"   "});
    const pass=direct.lifecycle_ready===true&&direct.asset_notional_eur===50&&direct.entry_fee_eur===null&&incomplete.lifecycle_ready===false&&incomplete.asset_notional_eur===null&&fallback.lifecycle_ready===true&&fallback.asset_notional_eur===50&&fallback.quantity_btc===null&&contradiction.contradictory===true&&contradiction.asset_notional_eur===null&&blank.fill_price_eur===null&&blank.quantity_btc===null&&blank.entry_fee_eur===null;
    return {schema:"agent_crypto_strategy_a_auto_lifecycle_bridge_self_test_v2",build:BUILD,pass,checks:{direct_without_fee_preserves_unknown:direct.entry_fee_eur===null&&direct.asset_notional_eur===50,missing_fee_cannot_fake_fallback_zero:incomplete.asset_notional_eur===null,known_fee_fallback:fallback.asset_notional_eur===50,contradictory_notional_fails:contradiction.contradictory===true,blank_boolean_null_not_zero:blank.fill_price_eur===null&&blank.quantity_btc===null&&blank.entry_fee_eur===null}};
  }
  function onOpen({proposal=null,risk=null,fill=null}={}){
    try{
      if(!apiReady())return fail("LIFECYCLE_API_UNAVAILABLE");
      const executionId=String(fill?.execution_id||"").trim();
      if(!executionId)return fail("EXECUTION_ID_MISSING");
      if(BRIDGED.has(executionId))return {ok:true,duplicate:true,execution_id:executionId,state:clone(BRIDGED.get(executionId))};
      const facts=normalizeOpenFacts(fill||{});
      if(facts.contradictory)return fail("EXECUTION_FACTS_CONTRADICTORY");
      if(!facts.lifecycle_ready)return fail("EXECUTION_FACTS_INCOMPLETE");
      const fillPrice=facts.fill_price_eur,assetNotional=facts.asset_notional_eur;
      const a=lifecycle();
      let env=a.create({decision_id:String(proposal?.proposal_id||risk?.proposal_id||executionId),trade_id:executionId,proposal_id:proposal?.proposal_id||risk?.proposal_id||null,risk_id:risk?.risk_id||fill?.risk_id||null,symbol:fill?.symbol||"BTC",authorized_notional_eur:assetNotional});
      if(env?.state!=="PROPOSAL")return fail("LIFECYCLE_CREATE_REFUSED");
      env=a.risk_approve(env,String(risk?.decision||"ACCEPT"));
      env=a.submit(env); env=a.acknowledge(env); env=a.fill(env,assetNotional,fillPrice);
      if(!["FILLED","PARTIAL"].includes(String(env?.state)))return fail(`LIFECYCLE_OPEN_SYNC_${String(env?.state||"UNKNOWN")}`);
      const row={schema:SCHEMA,build:BUILD,execution_id:executionId,opened_at:new Date().toISOString(),paper_authorized_notional_eur:facts.authorized_notional_eur,asset_notional_eur:assetNotional,asset_notional_source:facts.asset_notional_source,entry_fee_eur:facts.entry_fee_eur,fill_price_eur:fillPrice,quantity_btc:facts.quantity_btc,unknown_external_numeric_fields:facts.unknown_external_numeric_fields,envelope:env,status:"OPEN_SYNCED",paper_only:true};
      BRIDGED.set(executionId,row);return {ok:true,execution_id:executionId,state:clone(row)};
    }catch(error){return fail("LIFECYCLE_OPEN_SYNC_EXCEPTION",error);}
  }
  function onClose({reconciliation=null}={}){
    try{
      const executionId=String(reconciliation?.execution_id||"").trim();
      if(!executionId)return fail("RECONCILIATION_EXECUTION_ID_MISSING");
      const row=BRIDGED.get(executionId);if(!row)return fail("LIFECYCLE_OPEN_STATE_MISSING");
      const a=lifecycle();if(!apiReady())return fail("LIFECYCLE_API_UNAVAILABLE");
      let env=row.envelope;
      const filledNotional=positive(env?.filled_notional_eur);
      if(filledNotional===null)return fail("LIFECYCLE_FILLED_NOTIONAL_UNKNOWN");
      env=a.reconcile(env,{state:"FILLED",filled_notional_eur:filledNotional});
      if(env?.state!=="RECONCILED")return fail(`LIFECYCLE_RECONCILE_${String(env?.state||"UNKNOWN")}`);
      // Paper-only protection means lifecycle closure was internally reconciled;
      // it is NOT an exchange stop or live market protection claim.
      env=a.protect(env,true); if(env?.state!=="PROTECTED")return fail("LIFECYCLE_PROTECTION_STATE_INVALID");
      env=a.close(env,"ACTUAL_LOCAL_PAPER_RECONCILIATION"); if(env?.state!=="CLOSED")return fail("LIFECYCLE_CLOSE_STATE_INVALID");
      row.closed_at=new Date().toISOString();row.reconciliation_id=reconciliation?.reconciliation_id||null;row.net_pnl_eur=num(reconciliation?.net_pnl_eur);row.envelope=env;row.status="CLOSED_SYNCED";BRIDGED.set(executionId,row);
      return {ok:true,execution_id:executionId,state:clone(row)};
    }catch(error){return fail("LIFECYCLE_CLOSE_SYNC_EXCEPTION",error);}
  }
  function clearBlockForOperatorReview(){blockedReason=null;return preflight();}
  function read(){return [...BRIDGED.values()].map(clone);}
  function summary(){const rows=read();return {schema:SCHEMA,build:BUILD,total:rows.length,open:rows.filter(r=>r.status==="OPEN_SYNCED").length,closed:rows.filter(r=>r.status==="CLOSED_SYNCED").length,blocked_reason:blockedReason,ready:apiReady()&&!blockedReason,paper_only:true,real_orders:false};}
  const api=Object.freeze({build:BUILD,schema:SCHEMA,preflight,on_open:onOpen,on_close:onClose,normalize_open_facts:normalizeOpenFacts,self_test:selfTest,read,summary,operator_clear_bridge_block:clearBlockForOperatorReview,paper_only:true,real_orders:false,network:false,storage_write:false,accounting_owner_changed:false,lifecycle_shadow_connected:true,unknown_propagation_406018:true,unknown_numeric_is_zero:false,contradictory_notional_fails_closed:true});
  globalThis.AgentCryptoStrategyAAutoLifecycleBridge404297=api;
})();
