/* Agent-Crypto @erith.IA — Market Regime Context V1 (crypto breadth only)
   Build 40.5.9. Read-only context from existing Collector snapshots.
   This is NOT a full macro/cross-market regime model. */
(() => {
  "use strict";
  const BUILD="40.5.9",SCHEMA="atlas_market_regime_context_v1";
  const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  const time=v=>{const n=Date.parse(String(v||""));return Number.isFinite(n)?n:null;};
  function records(){try{return globalThis.AgentCryptoEventReactionSource405005?.snapshot?.()?.records||[];}catch(_){return [];}}
  function classify(record){
    if(!record)return null;const rows=(record.assets||[]).map(a=>({symbol:String(a?.symbol||"").toUpperCase(),change:finite(a?.change_24h)})).filter(a=>a.symbol&&a.change!==null);
    if(!rows.length)return Object.freeze({schema:SCHEMA,build:BUILD,snapshot_id:record.snapshot_id||null,timestamp:record.timestamp||null,status:"NO_24H_BREADTH",scope:"crypto_breadth_24h_only",risk_tone:"UNKNOWN",full_market_regime:false});
    const pos=rows.filter(a=>a.change>.25).length,neg=rows.filter(a=>a.change<-.25).length,stable=rows.length-pos-neg,breadth=((pos-neg)/rows.length)*100;
    const vals=rows.map(a=>a.change),avg=vals.reduce((s,v)=>s+v,0)/vals.length;const variance=vals.reduce((s,v)=>s+(v-avg)**2,0)/vals.length;const dispersion=Math.sqrt(variance);
    const anchor=s=>rows.find(a=>a.symbol===s)?.change??null;const btc=anchor("BTC");
    const riskTone=breadth>=25&&(btc===null||btc>=0)?"RISK_ON":breadth<=-25&&(btc===null||btc<=0)?"RISK_OFF":"MIXED";
    return Object.freeze({schema:SCHEMA,build:BUILD,snapshot_id:record.snapshot_id||null,timestamp:record.timestamp||null,collector_id:record.collector_id||null,scope:"crypto_breadth_24h_only",risk_tone:riskTone,breadth:{positive:pos,negative:neg,stable,total:rows.length,score_100:breadth,average_change_24h_pct:avg,cross_section_dispersion_pct:dispersion},anchors:{BTC:btc,ETH:anchor("ETH"),SOL:anchor("SOL")},full_market_regime:false,includes_macro:false,includes_derivatives:false,includes_cross_market:false,causal_claim:false,prediction:false});
  }
  function latest(){const rs=records().filter(r=>time(r?.timestamp)!==null).sort((a,b)=>time(a.timestamp)-time(b.timestamp));return classify(rs.at(-1)||null);}
  function bySnapshot(id){return classify(records().find(r=>String(r?.snapshot_id||"")===String(id||""))||null);}
  function forEvent(event){const row=globalThis.AtlasEventReactionLedger405006?.project?.(event)||null;const id=row?.reaction_windows?.T0?.snapshot_id||null;return id?bySnapshot(id):null;}
  function compatibility(a,b){
    if(!a||!b||a.status==="NO_24H_BREADTH"||b.status==="NO_24H_BREADTH")return null;
    let score=0,weight=0;const add=(s,w)=>{score+=Math.max(0,Math.min(1,s))*w;weight+=w;};
    add(Number(a.risk_tone===b.risk_tone),.5);const ba=finite(a?.breadth?.score_100),bb=finite(b?.breadth?.score_100);if(ba!==null&&bb!==null)add(1-Math.min(1,Math.abs(ba-bb)/100),.3);
    const da=finite(a?.breadth?.cross_section_dispersion_pct),db=finite(b?.breadth?.cross_section_dispersion_pct);if(da!==null&&db!==null)add(1-Math.min(1,Math.abs(da-db)/Math.max(1,da,db)),.2);
    return weight?score/weight:null;
  }
  globalThis.AtlasMarketRegimeContext405009=Object.freeze({build:BUILD,schema:SCHEMA,classify,latest,by_snapshot:bySnapshot,for_event:forEvent,compatibility,read_only:true,scope:"crypto_breadth_24h_only",full_market_regime:false,new_storage_owner:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,causal_claim:false,prediction:false,financial_signal:false,automatic_order:false,next_required:"40.5.10 Cross-Market Context must map existing metals/indices/energy/cross owners before adding any new source."});
})();
