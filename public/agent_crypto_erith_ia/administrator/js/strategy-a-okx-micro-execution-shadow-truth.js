/* Agent-Crypto @erith.IA — 40.6.496 OKX DEMO FILL + HORIZON EVIDENCE TRUTH
   Passive evidence laboratory layered after 40.6.492 Execution Cost Truth.
   Distinguishes historical Oracle reference from the linked Strategy cycle, ages current evidence,
   preserves numeric session observations, and makes FULL/PARTIAL OKX coverage explicit.
   EVIDENCE_SHADOW_NOT_GATE: no Strategy threshold, Cost Gate, Risk Governor, Oracle, Market Core or execution capability changes.
   No fetch, WebSocket, key, wallet, order, storage write, recurring timer, MutationObserver or historical backfill. */
(()=>{
  "use strict";
  const BUILD="40.6.496";
  const ROOT="strategyAOkxMicroExecutionShadowTruth";
  const SIZES=Object.freeze([10,25,50,100]);
  const MAX_SESSION_OBSERVATIONS=24;
  const CURRENT_VIEW_MAX_AGE_SECONDS=120;
  const DEMO_V5=Object.freeze({
    source_report:"post_only_fill_horizon_lab_v5_FINAL_20261002_084547.json",
    source_sha256:"930bb9d35cfdbcd3c2a0632063918e8c7a8b2afb424da8d99aa4bf7ae1b4425b",
    mode:"OKX_DEMO",instrument:"BTC-EUR",ticket_eur:10,attempts:10,full_fills:4,partial_fills:0,no_fill:6,
    fill_rate_pct:40.0,first_fill_median_s:20.0,observed_entry_fee_pct:0.1,maker_maker_fee_proxy_pct:0.2,
    horizons:Object.freeze({
      5:Object.freeze({observations:4,median_bid_move_pct:0.14471091461074842,median_after_mm_fee_proxy_pct:-0.05528908538925158,covers_count:1,covers_rate_pct:25.0}),
      15:Object.freeze({observations:4,median_bid_move_pct:0.135735502276726,median_after_mm_fee_proxy_pct:-0.064264497723274,covers_count:0,covers_rate_pct:0.0}),
      30:Object.freeze({observations:4,median_bid_move_pct:0.08432971556435374,median_after_mm_fee_proxy_pct:-0.11567028443564627,covers_count:0,covers_rate_pct:0.0}),
      60:Object.freeze({observations:4,median_bid_move_pct:-0.4500473426133213,median_after_mm_fee_proxy_pct:-0.6500473426133213,covers_count:0,covers_rate_pct:0.0}),
      120:Object.freeze({observations:4,median_bid_move_pct:-0.6458978080861073,median_after_mm_fee_proxy_pct:-0.8458978080861074,covers_count:0,covers_rate_pct:0.0})
    }),
    entry_leg_demo_proven:true,round_trip_fill_proven:false,live_fill_proven:false,exit_post_only_fill_proven:false,
    longer_horizon_validated:false,sample_small:true,strategy_a_v1_status:"FAIL_BENCHMARK_FROZEN",strategy_a2_started:false
  });
  let last=null,lastCapturedKey=null,expiryTimer=null;
  const observations=[];

  const n=v=>{if(v===null||v===undefined||v===""||typeof v==="boolean")return null;const x=Number(v);return Number.isFinite(x)?x:null;};
  const t=v=>{if(v===null||v===undefined||v==="")return null;const x=typeof v==="number"?v:Date.parse(String(v));return Number.isFinite(x)?x:null;};
  const esc=v=>String(v??"—").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const pct=v=>Number.isFinite(v)?(v>=0?"+":"")+v.toFixed(4)+" %":"—";
  const ageText=s=>!Number.isFinite(s)?"N/D":s<60?Math.round(s)+" s":s<3600?(s/60).toFixed(1)+" min":(s/3600).toFixed(1)+" h";
  const sourceSnapshot=()=>{try{return globalThis.AgentCryptoStrategyAExecutionCostTruth?.snapshot?.()||null;}catch(_){return null;}};
  const safetyMargin=c=>{const threshold=n(c?.strategy_threshold_pct),pedagogical=n(c?.pedagogical_cost_pct);return threshold!==null&&pedagogical!==null&&threshold>=pedagogical?threshold-pedagogical:null;};

  function ledgerRows(){
    try{const rows=globalThis.AgentCryptoStrategyAExperimentLedger?.read?.();if(Array.isArray(rows)&&rows.length)return rows;}catch(_){}
    try{const rows=globalThis.AgentCryptoStrategyADurableEvidence?.read_cycles?.();if(Array.isArray(rows)&&rows.length)return rows;}catch(_){}
    return [];
  }
  function latestCycle(){
    return ledgerRows().filter(row=>t(row?.captured_at)!==null).sort((a,b)=>t(a.captured_at)-t(b.captured_at)).at(-1)||null;
  }
  function cycleContext(cycle){
    if(!cycle)return null;
    return Object.freeze({
      cycle_id:String(cycle?.cycle_id||"")||null,
      captured_at:cycle?.captured_at||null,
      oracle_regime:String(cycle?.oracle?.regime||"UNKNOWN"),
      oracle_direction_score:n(cycle?.oracle?.direction_score),
      oracle_confidence:n(cycle?.oracle?.confidence),
      total_cost_pct:n(cycle?.cost?.total_cost_pct),
      required_move_pct:n(cycle?.cost?.required_move_pct),
      expected_move_pct:n(cycle?.cost?.expected_move_pct)
    });
  }
  function sourceAgeSeconds(raw,nowMs=Date.now()){
    const ms=t(raw?.generated_at||raw?.measured_at);
    return ms===null?null:Math.max(0,(nowMs-ms)/1000);
  }
  function sourceCoverage(raw,nowMs=Date.now()){
    if(!raw)return Object.freeze({code:"WAITING_EXECUTION_COST_TRUTH",freshness:"UNKNOWN",age_seconds:null,max_age_seconds:CURRENT_VIEW_MAX_AGE_SECONDS,depth:false,okx:false});
    const okx=raw?.venues?.okx||null,age=sourceAgeSeconds(raw,nowMs);
    if(okx?.ok!==true)return Object.freeze({code:"SOURCE_UNAVAILABLE",freshness:"UNAVAILABLE",age_seconds:age,max_age_seconds:CURRENT_VIEW_MAX_AGE_SECONDS,depth:false,okx:false});
    if(!Number.isFinite(age))return Object.freeze({code:okx?.depth_available===true?"FULL_ORDERBOOK_TIME_UNKNOWN":"PARTIAL_TOP_OF_BOOK_TIME_UNKNOWN",freshness:"UNKNOWN",age_seconds:null,max_age_seconds:CURRENT_VIEW_MAX_AGE_SECONDS,depth:okx?.depth_available===true,okx:true});
    if(age>CURRENT_VIEW_MAX_AGE_SECONDS)return Object.freeze({code:"STALE_HISTORY",freshness:"STALE",age_seconds:age,max_age_seconds:CURRENT_VIEW_MAX_AGE_SECONDS,depth:okx?.depth_available===true,okx:true});
    return Object.freeze({code:okx?.depth_available===true?"FULL_ORDERBOOK_FRESH":"PARTIAL_TOP_OF_BOOK_FRESH",freshness:"FRESH",age_seconds:age,max_age_seconds:CURRENT_VIEW_MAX_AGE_SECONDS,depth:okx?.depth_available===true,okx:true});
  }
  function classify(envelope,required,evidence){
    if(!Number.isFinite(envelope)||!Number.isFinite(required))return "UNKNOWN";
    if(envelope+1e-9<required)return "WAIT";
    return evidence==="MEASURED_ORDERBOOK"?"POTENTIAL_MEASURED":"POTENTIAL_FILL_UNKNOWN";
  }

  function evaluate(raw=sourceSnapshot(),cycleOverride=undefined,nowMs=Date.now()){
    if(!raw)return Object.freeze({schema:"agent_crypto_okx_micro_execution_shadow_v2",build:BUILD,status:"WAITING_EXECUTION_COST_TRUTH",rows:[],coverage:sourceCoverage(null,nowMs)});
    const okx=raw?.venues?.okx||null;
    const c=raw?.oracle_context||{};
    const historicalEnvelope=n(c?.oracle_envelope_median_pct);
    const margin=safetyMargin(c);
    const threshold=n(c?.strategy_threshold_pct);
    const trigger=String(raw?.measurement_trigger||"");
    const latest=cycleOverride===undefined?latestCycle():cycleOverride;
    const cycle=cycleContext(latest);
    const autoLinked=/^auto:experiment-cycle/i.test(trigger)&&cycle?.cycle_id;
    const linkedCycleId=autoLinked?cycle.cycle_id:null;
    const linkedCycleExpected=autoLinked?n(cycle?.expected_move_pct):null;
    const activeEnvelope=linkedCycleExpected!==null?linkedCycleExpected:historicalEnvelope;
    const activeEnvelopeSource=linkedCycleExpected!==null?"LINKED_CYCLE_EXPECTED_MOVE":"HISTORICAL_ORACLE_MEDIAN";
    const coverage=sourceCoverage(raw,nowMs);
    const simByAmount=new Map((Array.isArray(okx?.simulations)?okx.simulations:[]).map(x=>[n(x?.amount_eur),x]));
    const poMarket=n(okx?.post_only_market_fee_floor_pct),poPo=n(okx?.post_only_post_only_fee_floor_pct);
    const rows=SIZES.map(amount=>{
      const sim=simByAmount.get(amount)||null;
      const mm=n(sim?.market_market_estimated_cost_pct);
      const mmMeasured=okx?.ok===true&&okx?.depth_available===true&&mm!==null;
      const mode=(cost,evidence,fill)=>{
        const required=cost!==null&&margin!==null?cost+margin:null;
        return Object.freeze({cost_pct:cost,required_with_margin_pct:required,evidence,fill,state:classify(activeEnvelope,required,evidence)});
      };
      return Object.freeze({
        amount_eur:amount,
        market_market:mode(mm,mmMeasured?"MEASURED_ORDERBOOK":"UNKNOWN","SIMULATED_AGAINST_CURRENT_BOOK"),
        post_only_market:mode(poMarket,"FEE_FLOOR_ONLY","UNKNOWN_NOT_GUARANTEED"),
        post_only_post_only:mode(poPo,"FEE_FLOOR_ONLY","UNKNOWN_NOT_GUARANTEED")
      });
    });
    const count=(name,prefix)=>rows.filter(r=>String(r[name]?.state||"").startsWith(prefix)).length;
    return Object.freeze({
      schema:"agent_crypto_okx_micro_execution_shadow_v2",
      build:BUILD,
      source_build:String(raw?.build||"UNKNOWN"),
      generated_at:new Date(nowMs).toISOString(),
      source_generated_at:raw?.generated_at||null,
      measurement_trigger:trigger||null,
      linked_cycle_id:linkedCycleId,
      latest_cycle_context:cycle,
      coverage,
      status:coverage.code,
      pair:"BTC/EUR",
      sizes_eur:SIZES.slice(),
      context:Object.freeze({
        oracle_envelope_median_pct:historicalEnvelope,
        linked_cycle_expected_move_pct:linkedCycleExpected,
        active_comparator_pct:activeEnvelope,
        active_comparator_source:activeEnvelopeSource,
        current_safety_margin_pct:margin,
        strategy_threshold_pct:threshold,
        pedagogical_cost_pct:n(c?.pedagogical_cost_pct),
        mfe_median_pct:n(c?.mfe_median_pct)
      }),
      rows,
      demo_v5:DEMO_V5,
      summary:Object.freeze({
        market_market_potential:count("market_market","POTENTIAL"),
        market_market_wait:count("market_market","WAIT"),
        post_only_market_potential:count("post_only_market","POTENTIAL"),
        post_only_market_wait:count("post_only_market","WAIT"),
        post_only_post_only_potential:count("post_only_post_only","POTENTIAL"),
        post_only_post_only_wait:count("post_only_post_only","WAIT")
      }),
      interpretation:Object.freeze({
        potential_is_not_pass:true,
        four_of_four_means_four_ticket_sizes_not_four_executable_opportunities:true,
        post_only_is_fee_floor_only:true,
        post_only_entry_demo_proven:true,
        post_only_demo_ticket_eur:DEMO_V5.ticket_eur,
        post_only_demo_fill_rate_pct:DEMO_V5.fill_rate_pct,
        post_only_demo_first_fill_median_s:DEMO_V5.first_fill_median_s,
        post_only_round_trip_fill_not_proven:true,
        live_fill_not_proven:true,
        exit_post_only_fill_not_proven:true,
        queue_position_live_unknown:true,
        longer_horizon_validated:false,
        strategy_a_v1_status:DEMO_V5.strategy_a_v1_status,
        historical_oracle_median_is_not_cycle_proof:true,
        current_strategy_gate_unchanged:true
      }),
      protections:Object.freeze({
        evidence_shadow_not_gate:true,network_fetch:false,websocket:false,storage_write:false,
        recurring_timer:false,mutation_observer:false,api_key:false,wallet:false,real_order:false,
        automatic_order:false,historical_backfill:false,thresholds_changed:false,cost_gate_changed:false,
        risk_governor_changed:false,oracle_math_changed:false,market_core_changed:false,automatic_platform_choice:false
      })
    });
  }

  function compactMode(mode){
    return Object.freeze({
      cost_pct:n(mode?.cost_pct),
      required_with_margin_pct:n(mode?.required_with_margin_pct),
      evidence:String(mode?.evidence||"UNKNOWN"),
      fill:String(mode?.fill||"UNKNOWN"),
      state:String(mode?.state||"UNKNOWN")
    });
  }
  function compactObservation(lab){
    return Object.freeze({
      captured_at:new Date().toISOString(),
      source_generated_at:lab.source_generated_at,
      source_build:lab.source_build,
      measurement_trigger:lab.measurement_trigger,
      linked_cycle_id:lab.linked_cycle_id,
      latest_cycle_context:lab.latest_cycle_context,
      coverage:lab.coverage,
      context:lab.context,
      summary:lab.summary,
      rows:lab.rows.map(r=>Object.freeze({
        amount_eur:r.amount_eur,
        market_market:compactMode(r.market_market),
        post_only_market:compactMode(r.post_only_market),
        post_only_post_only:compactMode(r.post_only_post_only)
      }))
    });
  }

  function capture(){
    const raw=sourceSnapshot();
    const lab=evaluate(raw);
    last=lab;
    const key=String(raw?.generated_at||raw?.measured_at||"");
    if(key&&key!==lastCapturedKey){
      lastCapturedKey=key;
      observations.push(compactObservation(lab));
      while(observations.length>MAX_SESSION_OBSERVATIONS)observations.shift();
    }
    return lab;
  }

  const statusText=s=>s==="POTENTIAL_MEASURED"?"POTENTIEL · MESURÉ":s==="POTENTIAL_FILL_UNKNOWN"?"POTENTIEL · ROUND-TRIP INCONNU":s==="WAIT"?"WAIT":"UNKNOWN";
  const statusClass=s=>String(s).startsWith("POTENTIAL")?"good":s==="WAIT"?"wait":"unknown";
  function cell(mode){
    if(!mode)return '<span class="unknown">UNKNOWN</span>';
    return '<div class="omes-cost">coût '+esc(pct(mode.cost_pct))+'</div><div class="omes-required">avec marge '+esc(pct(mode.required_with_margin_pct))+'</div><b class="'+statusClass(mode.state)+'">'+esc(statusText(mode.state))+'</b>';
  }
  function coverageText(c){
    if(!c)return "UNKNOWN";
    if(c.code==="FULL_ORDERBOOK_FRESH")return "FULL · CARNET MULTI-NIVEAUX · FRESH";
    if(c.code==="PARTIAL_TOP_OF_BOOK_FRESH")return "PARTIAL · TOP OF BOOK ONLY · FRESH";
    if(c.code==="STALE_HISTORY")return "HISTORIQUE · STALE · lecture actuelle non fraîche";
    if(c.code==="SOURCE_UNAVAILABLE")return "SOURCE UNAVAILABLE";
    if(c.code==="FULL_ORDERBOOK_TIME_UNKNOWN")return "FULL · TEMPS UNKNOWN";
    if(c.code==="PARTIAL_TOP_OF_BOOK_TIME_UNKNOWN")return "PARTIAL · TOP OF BOOK ONLY · TEMPS UNKNOWN";
    return c.code;
  }
  function qualityNote(c){
    if(c?.code==="FULL_ORDERBOOK_FRESH")return '<b>Couverture FULL :</b> frais + spread + carnet multi-niveaux disponibles pour Market→Market. Les chemins Post-only restent des planchers de coût ; la preuve Demo d’entrée est affichée séparément et ne prouve ni la sortie ni le live.';
    if(c?.code==="PARTIAL_TOP_OF_BOOK_FRESH")return '<b>Lecture PARTIELLE :</b> frais / top-of-book disponibles, carnet multi-niveaux indisponible. Profondeur et slippage Market→Market restent UNKNOWN.';
    if(c?.code==="STALE_HISTORY")return '<b>Lecture HISTORIQUE :</b> la mesure est conservée mais elle n’est plus fraîche pour une lecture actuelle. Ne pas la traiter comme un état live.';
    return '<b>Source indisponible ou incomplète :</b> UNKNOWN reste UNKNOWN.';
  }

  function demoEvidenceHtml(){
    const h=DEMO_V5.horizons;
    const one=k=>'<b>+'+k+' min</b> '+esc(pct(h[k].median_bid_move_pct))+' · après proxy 0,20 % '+esc(pct(h[k].median_after_mm_fee_proxy_pct))+' · couverture '+esc(h[k].covers_count)+'/'+esc(h[k].observations);
    return '<div class="omes-quality"><b>OKX DEMO V5 · ENTRÉE POST-ONLY · 10 €</b><br>'+
      esc(DEMO_V5.full_fills)+'/'+esc(DEMO_V5.attempts)+' fills complets · '+esc(DEMO_V5.fill_rate_pct.toFixed(1))+' % · médiane premier fill '+esc(DEMO_V5.first_fill_median_s)+' s · fee entrée observé '+esc(DEMO_V5.observed_entry_fee_pct.toFixed(4))+' %.<br>'+
      one(5)+' · '+one(15)+' · '+one(30)+' · '+one(60)+' · '+one(120)+'.<br>'+
      '<b>Conclusion V5 :</b> allongement d’horizon NON VALIDÉ sur cet échantillon. Entrée Demo mesurée ; sortie Post-only, round-trip et fill live non prouvés. Strategy A V1 reste FAIL benchmark figé.</div>';
  }

  function style(){
    if(document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");s.id=ROOT+"Style";
    s.textContent="#"+ROOT+"{margin-top:10px;padding:13px;border:1px solid rgba(74,192,255,.35);border-radius:10px;background:rgba(5,18,32,.38)}#"+ROOT+" .omes-h{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}#"+ROOT+" .omes-t{font-size:12px;font-weight:950;letter-spacing:.065em;color:#8fddff;line-height:1.35}#"+ROOT+" .omes-s,#"+ROOT+" .omes-note{font-size:10.5px;color:#a9bec8;line-height:1.5;margin-top:4px}#"+ROOT+" .omes-actions{display:flex;gap:8px}#"+ROOT+" .omes-actions button{min-height:38px!important;font-size:12px!important;padding:8px 12px!important}#"+ROOT+" .omes-k{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:10px}#"+ROOT+" .omes-k div{padding:8px;border-radius:7px;background:rgba(255,255,255,.035);min-width:0}#"+ROOT+" .omes-k span{display:block;font-size:9.5px;color:#8ca6b2}#"+ROOT+" .omes-k b{display:block;margin-top:2px;font-size:11.5px;color:#effaff;overflow-wrap:anywhere}#"+ROOT+" .omes-table-wrap{overflow-x:auto;margin-top:10px}#"+ROOT+" table{width:100%;min-width:840px;border-collapse:collapse;font-size:10.5px;line-height:1.35}#"+ROOT+" th,#"+ROOT+" td{padding:8px 7px;border-bottom:1px solid rgba(255,255,255,.07);vertical-align:top;text-align:left}#"+ROOT+" th{color:#b9d9e6;font-size:9.5px;letter-spacing:.03em}#"+ROOT+" .omes-cost{color:#eaf8ff;font-weight:700}#"+ROOT+" .omes-required{color:#8faab5;font-size:9.5px;margin:2px 0 4px}#"+ROOT+" .good{color:#8ff0c1}#"+ROOT+" .wait{color:#ffd37a}#"+ROOT+" .unknown{color:#aab0b6}#"+ROOT+" .omes-lock,#"+ROOT+" .omes-quality{margin-top:9px;padding:8px;border-radius:7px;background:rgba(255,211,122,.055);color:#d8c9a2;font-size:10.5px;line-height:1.5}#"+ROOT+" .omes-quality{background:rgba(74,192,255,.055);color:#b9d9e6}@media(max-width:900px){#"+ROOT+" .omes-k{grid-template-columns:repeat(2,minmax(0,1fr))}}";
    document.head.appendChild(s);
  }

  function armFreshnessExpiry(lab,schedule){
    try{if(expiryTimer){clearTimeout(expiryTimer);expiryTimer=null;}}catch(_){}
    const age=lab?.coverage?.age_seconds;
    if(!Number.isFinite(age)||age>CURRENT_VIEW_MAX_AGE_SECONDS)return;
    const wait=Math.max(250,(CURRENT_VIEW_MAX_AGE_SECONDS-age)*1000+100);
    expiryTimer=setTimeout(()=>{expiryTimer=null;schedule();},wait);
  }

  let schedule=()=>{};
  function render(){
    if(typeof document==="undefined")return last;
    const anchor=document.getElementById("strategyAExecutionCostTruth");if(!anchor)return last;
    style();
    const lab=capture();
    let root=document.getElementById(ROOT);if(!root){root=document.createElement("section");root.id=ROOT;}
    if(root.previousElementSibling!==anchor){try{anchor.insertAdjacentElement("afterend",root);}catch(_){}}
    const c=lab.context||{},s=lab.summary||{},rows=Array.isArray(lab.rows)?lab.rows:[],coverage=lab.coverage||{};
    const cycleLabel=lab.linked_cycle_id||"NON LIÉ (référence historique)";
    root.innerHTML='<div class="omes-h"><div><div class="omes-t">STRATEGY A · OKX DEMO FILL + HORIZON EVIDENCE TRUTH · '+BUILD+'</div><div class="omes-s">Laboratoire passif · preuve cycle + exécution Demo bornée · EVIDENCE_SHADOW_NOT_GATE.</div></div><div class="omes-actions"><button class="btn small" id="'+ROOT+'Export" '+(!last?"disabled":"")+'>EXPORTER LAB</button></div></div>'+
      '<div class="omes-k"><div><span>Oracle historique médiane</span><b>'+esc(pct(c.oracle_envelope_median_pct))+'</b></div><div><span>Expected move cycle lié</span><b>'+esc(pct(c.linked_cycle_expected_move_pct))+'</b></div><div><span>Comparateur actif</span><b>'+esc(pct(c.active_comparator_pct))+' · '+esc(c.active_comparator_source||"—")+'</b></div><div><span>Cycle lié</span><b>'+esc(cycleLabel)+'</b></div></div>'+
      '<div class="omes-k"><div><span>Marge dérivée</span><b>'+esc(pct(c.current_safety_margin_pct))+'</b></div><div><span>Cost Gate existant</span><b>'+esc(pct(c.strategy_threshold_pct))+' · INCHANGÉ</b></div><div><span>Observations session</span><b>'+esc(observations.length)+' / '+MAX_SESSION_OBSERVATIONS+'</b></div><div><span>Source actuelle</span><b>'+esc(coverageText(coverage))+' · âge '+esc(ageText(coverage.age_seconds))+'</b></div></div>'+
      '<div class="omes-k"><div><span>Market→Market potentiels</span><b>'+esc(s.market_market_potential??0)+' / 4</b></div><div><span>Post-only→Market potentiels</span><b>'+esc(s.post_only_market_potential??0)+' / 4</b></div><div><span>Post-only→Post-only potentiels</span><b>'+esc(s.post_only_post_only_potential??0)+' / 4</b></div><div><span>Qualité preuve</span><b>'+esc(coverage.code||"UNKNOWN")+'</b></div></div>'+
      '<div class="omes-quality">'+qualityNote(coverage)+'</div>'+
      demoEvidenceHtml()+
      '<div class="omes-table-wrap"><table><thead><tr><th>Ticket</th><th>Market→Market</th><th>Post-only→Market</th><th>Post-only→Post-only</th></tr></thead><tbody>'+rows.map(r=>'<tr><td><b>'+esc(r.amount_eur)+' €</b></td><td>'+cell(r.market_market)+'</td><td>'+cell(r.post_only_market)+'</td><td>'+cell(r.post_only_post_only)+'</td></tr>').join("")+'</tbody></table></div>'+
      '<div class="omes-lock"><b>POTENTIEL ≠ PASS.</b> Le V5 prouve seulement l’entrée Post-only Demo à 10 € : 4/10 fills complets, médiane 20 s. Les quatre tickets du tableau restent des comparaisons de coût ; 25/50/100 € n’ont pas de preuve de fill V5. Sortie, round-trip, file live et fill live restent non prouvés. Strategy A V1 reste FAIL benchmark figé et aucun seuil n’est modifié.</div>'+
      '<div class="omes-note">SESSION ONLY · historique numérique borné à 24 observations · aucune écriture IndexedDB/localStorage · aucune API privée · aucun ordre · aucune clé · aucun wallet.</div>';
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",exportJson);
    root.dataset.build=BUILD;root.dataset.readOnly="true";root.dataset.evidence="shadow-not-gate";root.dataset.coverage=coverage.code||"unknown";
    armFreshnessExpiry(lab,schedule);
    return lab;
  }

  function exportJson(){
    if(!last)return false;
    try{
      const payload={...last,session_observations:observations.slice(),exported_at:new Date().toISOString()};
      const b=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");
      a.href=u;a.download="STRATEGY_A_OKX_DEMO_FILL_HORIZON_EVIDENCE_TRUTH_40_6_496.json";
      document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return true;
    }catch(_){return false;}
  }

  function selfTest(){
    const now=Date.parse("2026-10-01T20:00:30Z");
    const cycle={cycle_id:"A-CYCLE-TEST",captured_at:"2026-10-01T20:00:00Z",oracle:{regime:"MIXTE",direction_score:15,confidence:100},cost:{total_cost_pct:0.60,required_move_pct:0.80,expected_move_pct:0.52}};
    const full={build:"40.6.492",generated_at:"2026-10-01T20:00:20Z",measurement_trigger:"auto:experiment-cycle",oracle_context:{oracle_envelope_median_pct:0.55,pedagogical_cost_pct:0.60,strategy_threshold_pct:0.80,mfe_median_pct:0.14},venues:{okx:{ok:true,depth_available:true,post_only_market_fee_floor_pct:0.30,post_only_post_only_fee_floor_pct:0.20,simulations:SIZES.map(amount=>({amount_eur:amount,market_market_estimated_cost_pct:0.40}))}}};
    const partial={...full,venues:{okx:{...full.venues.okx,depth_available:false,simulations:SIZES.map(amount=>({amount_eur:amount,market_market_estimated_cost_pct:null}))}}};
    const stale={...full,generated_at:"2026-10-01T19:00:00Z"};
    const manual={...full,measurement_trigger:"manual-refresh"};
    const lab=evaluate(full,cycle,now),p=evaluate(partial,cycle,now),st=evaluate(stale,cycle,now),m=evaluate(manual,cycle,now);
    const obs=compactObservation(lab),r=lab.rows[0];
    const checks=Object.freeze({
      build:lab.build===BUILD,
      linked_cycle_id:lab.linked_cycle_id==="A-CYCLE-TEST",
      linked_cycle_expected_move:lab.context.linked_cycle_expected_move_pct===0.52,
      historical_median_preserved:lab.context.oracle_envelope_median_pct===0.55,
      linked_cycle_is_active_comparator:lab.context.active_comparator_source==="LINKED_CYCLE_EXPECTED_MOVE",
      manual_refresh_falls_back_to_historical:m.linked_cycle_id===null&&m.context.active_comparator_source==="HISTORICAL_ORACLE_MEDIAN",
      full_coverage:p.coverage.code!=="FULL_ORDERBOOK_FRESH"&&lab.coverage.code==="FULL_ORDERBOOK_FRESH",
      partial_coverage:p.coverage.code==="PARTIAL_TOP_OF_BOOK_FRESH",
      stale_history:st.coverage.code==="STALE_HISTORY",
      numeric_cost_retained:obs.rows[0].market_market.cost_pct===r.market_market.cost_pct&&obs.rows[0].market_market.required_with_margin_pct===r.market_market.required_with_margin_pct,
      potential_never_pass:JSON.stringify(lab).includes('"PASS"')===false,
      no_storage:lab.protections.storage_write===false,
      no_network:lab.protections.network_fetch===false,
      no_order:lab.protections.real_order===false,
      gate_unchanged:lab.protections.cost_gate_changed===false,
      demo_v5_attached:lab.demo_v5===DEMO_V5,
      demo_entry_fill_truth:DEMO_V5.attempts===10&&DEMO_V5.full_fills===4&&DEMO_V5.fill_rate_pct===40,
      horizon_truth:DEMO_V5.horizons[5].covers_count===1&&DEMO_V5.horizons[15].covers_count===0&&DEMO_V5.horizons[120].median_bid_move_pct<0,
      v1_frozen:DEMO_V5.strategy_a_v1_status==="FAIL_BENCHMARK_FROZEN"&&DEMO_V5.strategy_a2_started===false
    });
    return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }

  globalThis.AgentCryptoOkxMicroExecutionShadowTruth=Object.freeze({
    build:BUILD,render,evaluate,snapshot:()=>last,session_observations:()=>observations.slice(),export_json:exportJson,self_test:selfTest,demo_v5:DEMO_V5,
    evidence_shadow_not_gate:true,network_fetch:false,websocket:false,storage_write:false,recurring_timer:false,mutation_observer:false,
    freshness_expiry_timeout:true,api_key:false,wallet:false,real_order:false,thresholds_changed:false,cost_gate_changed:false,
    risk_governor_changed:false,oracle_math_changed:false,market_core_changed:false,automatic_platform_choice:false
  });

  if(typeof document!=="undefined"){
    let queued=false;
    schedule=()=>{if(queued)return;queued=true;const run=()=>{queued=false;try{render();}catch(_){}};try{queueMicrotask(run);}catch(_){Promise.resolve().then(run);}};
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
    window.addEventListener("agent-crypto:strategy-a-execution-cost-measured",schedule,{passive:true});
    window.addEventListener("agent-crypto:postboot-runtime-ready",schedule,{passive:true});
    window.addEventListener("pageshow",schedule,{passive:true});
    document.addEventListener("toggle",event=>{if(event?.target?.id==="simulation"&&event.target.open===true)schedule();},true);
  }
})();
