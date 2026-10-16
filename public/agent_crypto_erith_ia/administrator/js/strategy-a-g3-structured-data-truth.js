/* Agent-Crypto @erith.IA — 40.6.193 GATE 1/GATE 3 TEMPORAL COVERAGE TRUTH
   Structured series quality now separates point validity from time coverage.
   Screen-selected period never proves source period. Expected cadence must come
   from source metadata; otherwise cadence/temporal certification stays UNKNOWN.
   No DOM/text evidence parsing, fetch, timer, observer, storage write or order path.
   GATE 3 remains PENDING. */
(() => {
  "use strict";
  const BUILD = "40.6.193";
  const ROOT_ID = "strategyAG3StructuredTruth";
  const DOSSIER_ID = "strategyADossier";
  const CONTRACT_ID = "strategyAG3RealisticReplayContract";
  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const safeCall = (fn, fallback = null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; } };
  const finiteOrNull = value => { if (value === null || value === undefined || typeof value === "boolean") return null; if (typeof value === "string" && !value.trim()) return null; const n = Number(value); return Number.isFinite(n) ? n : null; };
  const integerOrNull = value => { const n = finiteOrNull(value); return n === null ? null : Math.trunc(n); };
  const timeMsOrNull = value => { const n = finiteOrNull(value); if (n !== null) return n; const ms = Date.parse(value || ""); return Number.isFinite(ms) ? ms : null; };
  const isoOrNull = value => { const ms = timeMsOrNull(value); return ms === null ? null : new Date(ms).toISOString(); };
  const median = values => { const rows = (Array.isArray(values) ? values : []).filter(Number.isFinite).slice().sort((a,b)=>a-b); if (!rows.length) return null; const i = Math.floor(rows.length / 2); return rows.length % 2 ? rows[i] : (rows[i-1] + rows[i]) / 2; };
  const pct = value => Number.isFinite(value) ? Number(value.toFixed(1)) : null;
  const cadenceFrom = (...objects) => {
    const keys = ["expected_cadence_min","cadence_min","step_min","stepMinutes","interval_min","intervalMinutes","granularity_min","granularityMinutes"];
    for (const obj of objects) for (const key of keys) { const n = finiteOrNull(obj?.[key]); if (n !== null && n > 0) return n; }
    return null;
  };
  function runtimeState() { try { return typeof state !== "undefined" && state && typeof state === "object" ? state : null; } catch (_) { return null; } }
  function selectedCoin(s) {
    try { if (typeof getSelectedCoin === "function") { const coin = getSelectedCoin(); if (coin) return coin; } } catch (_) {}
    try { if (typeof findCoinByQuery === "function") { const coin = findCoinByQuery("BTC"); if (coin) return coin; } } catch (_) {}
    return Array.isArray(s?.coins) ? s.coins.find(c => String(c?.symbol || "").toUpperCase() === "BTC") || null : null;
  }
  function normalizeSeries(raw) {
    let rows = Array.isArray(raw) ? raw : [];
    try { if (typeof atlasNormalizeChartPayload === "function") rows = atlasNormalizeChartPayload({prices: rows}) || rows; } catch (_) {}
    const source = Array.isArray(rows) ? rows : [];
    const normalized = [];
    let invalid_time = 0, invalid_price = 0, nonpositive_price = 0;
    for (const row of source) {
      const t = Array.isArray(row) ? timeMsOrNull(row[0]) : timeMsOrNull(row?.t ?? row?.time ?? row?.timestamp ?? row?.at);
      const p = Array.isArray(row) ? finiteOrNull(row[1]) : finiteOrNull(row?.p ?? row?.price ?? row?.value);
      if (t === null) { invalid_time += 1; continue; }
      if (p === null) { invalid_price += 1; continue; }
      if (!(p > 0)) { nonpositive_price += 1; continue; }
      normalized.push([t,p]);
    }
    normalized.sort((a,b)=>a[0]-b[0]);
    let duplicate_timestamps = 0, conflicting_duplicate_timestamps = 0;
    const groups = new Map();
    for (const row of normalized) {
      const bucket = groups.get(row[0]) || [];
      bucket.push(row[1]);
      groups.set(row[0], bucket);
    }
    for (const prices of groups.values()) {
      if (prices.length <= 1) continue;
      duplicate_timestamps += prices.length - 1;
      if (new Set(prices.map(value => Number(value).toPrecision(15))).size > 1) conflicting_duplicate_timestamps += 1;
    }
    return { source_points: source.length, rows: normalized, invalid_time, invalid_price, nonpositive_price, duplicate_timestamps, conflicting_duplicate_timestamps };
  }
  function describeSeries(raw, meta = {}) {
    const n = normalizeSeries(raw), rows = n.rows;
    const sourcePeriodDays = finiteOrNull(meta.source_period_days ?? meta.period_days);
    const expectedSpanMin = sourcePeriodDays !== null && sourcePeriodDays > 0 ? sourcePeriodDays * 1440 : null;
    const expectedCadenceMin = finiteOrNull(meta.expected_cadence_min);
    const steps = [];
    for (let i=1;i<rows.length;i++) { const delta = (rows[i][0]-rows[i-1][0])/60000; if (Number.isFinite(delta) && delta >= 0) steps.push(delta); }
    const positiveSteps = steps.filter(v => v > 0);
    const observedMedian = median(positiveSteps);
    const maxGap = positiveSteps.length ? Math.max(...positiveSteps) : null;
    const firstMs = rows[0]?.[0] ?? null, lastMs = rows.at(-1)?.[0] ?? null;
    const spanMin = firstMs !== null && lastMs !== null ? (lastMs-firstMs)/60000 : null;
    const validPointPct = n.source_points > 0 ? pct((rows.length/n.source_points)*100) : null;
    const spanCoveragePct = expectedSpanMin && Number.isFinite(spanMin) ? pct(Math.min(100,(Math.max(0,spanMin)/expectedSpanMin)*100)) : null;
    let gapCount = null, missingIntervalsEstimate = null, temporalCoveragePct = null, intervalCoveredMin = null;
    if (expectedSpanMin && expectedCadenceMin !== null && expectedCadenceMin > 0) {
      gapCount = positiveSteps.filter(delta => delta > expectedCadenceMin * 1.5).length;
      missingIntervalsEstimate = positiveSteps.reduce((sum,delta)=>sum+Math.max(0,Math.round(delta/expectedCadenceMin)-1),0);
      intervalCoveredMin = positiveSteps.reduce((sum,delta)=>sum+Math.min(delta,expectedCadenceMin),0);
      temporalCoveragePct = pct(Math.min(100,(intervalCoveredMin/expectedSpanMin)*100));
    }
    const spanToleranceMin = expectedSpanMin ? Math.max(expectedCadenceMin || 0, expectedSpanMin * 0.01) : null;
    const spanWithinContract = expectedSpanMin && Number.isFinite(spanMin) ? Math.abs(spanMin-expectedSpanMin) <= spanToleranceMin : false;
    const sourcePeriodProven = sourcePeriodDays !== null && sourcePeriodDays > 0;
    const exact24hSource = sourcePeriodDays === 1;
    const temporalCoverageCertified = exact24hSource && expectedCadenceMin !== null && expectedCadenceMin > 0 && rows.length >= 2 && validPointPct === 100 && n.duplicate_timestamps === 0 && n.conflicting_duplicate_timestamps === 0 && n.nonpositive_price === 0 && gapCount === 0 && spanWithinContract && temporalCoveragePct !== null && temporalCoveragePct >= 99;
    let qualityState = "INSUFFICIENT";
    if (rows.length >= 2) qualityState = n.conflicting_duplicate_timestamps > 0 ? "CONFLICTING_DUPLICATE_TIMESTAMP" : n.duplicate_timestamps > 0 ? "DUPLICATE_TIMESTAMP" : !sourcePeriodProven ? "SOURCE_PERIOD_UNKNOWN" : !exact24hSource ? "NON_24H_SOURCE" : expectedCadenceMin === null ? "CADENCE_CONTRACT_UNKNOWN" : temporalCoverageCertified ? "TEMPORAL_COVERAGE_PROVEN" : "TEMPORAL_COVERAGE_INCOMPLETE";
    return {
      available: rows.length >= 2,
      owner: meta.owner || null,
      owner_path: meta.owner_path || null,
      source_kind: meta.source_kind || null,
      asset_id: meta.asset_id || null,
      symbol: meta.symbol || null,
      source_period_days: sourcePeriodDays,
      source_period_proven: sourcePeriodProven,
      window: exact24hSource ? "24h" : sourcePeriodDays !== null ? `${sourcePeriodDays}j` : null,
      points: rows.length,
      source_points: n.source_points,
      valid_point_pct: validPointPct,
      invalid_time_points: n.invalid_time,
      invalid_price_points: n.invalid_price,
      nonpositive_price_points: n.nonpositive_price,
      duplicate_timestamps: n.duplicate_timestamps,
      conflicting_duplicate_timestamps: n.conflicting_duplicate_timestamps,
      observed_median_step_min: observedMedian,
      expected_cadence_min: expectedCadenceMin,
      max_gap_min: maxGap,
      gap_count: gapCount,
      missing_intervals_estimate: missingIntervalsEstimate,
      first_at: isoOrNull(firstMs),
      last_at: isoOrNull(lastMs),
      actual_span_min: Number.isFinite(spanMin) ? spanMin : null,
      expected_span_min: expectedSpanMin,
      span_coverage_pct: spanCoveragePct,
      temporal_coverage_pct: temporalCoveragePct,
      temporal_coverage_certified: temporalCoverageCertified,
      quality_state: qualityState,
      display_match: meta.display_match === true,
      structured_only: true,
      visible_text_parsing: false,
      rows
    };
  }
  function exact24hSnapshot() {
    const s = runtimeState(), coin = selectedCoin(s);
    if (!s || !coin) return {schema:"agent_crypto_market_series_truth_v2",build:BUILD,available:false,state:"UNAVAILABLE",owner:null,owner_path:null,window:null,points:null,quality_state:"UNAVAILABLE",temporal_coverage_certified:false,reason:"Runtime market state or selected coin unavailable.",paper_only:true,real_order:false};
    const assetId = String(coin.id || "").trim(), symbol = String(coin.symbol || "").trim().toUpperCase(), activePeriod = finiteOrNull(s.chartPeriodDays);
    try {
      const comparison=s?.dataBroker?.comparison, result=comparison?.results?.[assetId], sourcePeriod=finiteOrNull(result?.periodDays ?? comparison?.periodDays ?? comparison?.period);
      if (Array.isArray(result?.series) && result.series.length >= 2 && sourcePeriod === 1) {
        const out=describeSeries(result.series,{owner:"AgentCryptoMarketSeriesTruth",owner_path:`state.dataBroker.comparison.results[${assetId}].series`,source_kind:"ACTIVE_COMPARISON_SERIES",asset_id:assetId,symbol,source_period_days:sourcePeriod,expected_cadence_min:cadenceFrom(result,comparison),display_match:activePeriod===1});
        return {...out,schema:"agent_crypto_market_series_truth_v2",build:BUILD,state:out.temporal_coverage_certified?"QUALITY_PROVEN":"CANDIDATE",paper_only:true,real_order:false,reason:out.temporal_coverage_certified?"Structured 24h source and temporal coverage are proven by source metadata and timestamps.":"Structured 24h source found, but temporal coverage is not certifiable yet; GATE 3 stays PENDING."};
      }
    } catch (_) {}
    try {
      const chart=s?.dataBroker?.chart, result=chart?.result, sourcePeriod=finiteOrNull(result?.periodDays ?? chart?.periodDays ?? chart?.period);
      if (chart?.status === "ready" && String(chart?.coinId || "").toLowerCase() === assetId.toLowerCase() && Array.isArray(result?.series) && result.series.length >= 2 && sourcePeriod === 1) {
        const out=describeSeries(result.series,{owner:"AgentCryptoMarketSeriesTruth",owner_path:"state.dataBroker.chart.result.series",source_kind:"ACTIVE_CHART_SERIES",asset_id:assetId,symbol,source_period_days:sourcePeriod,expected_cadence_min:cadenceFrom(result,chart),display_match:activePeriod===1});
        return {...out,schema:"agent_crypto_market_series_truth_v2",build:BUILD,state:out.temporal_coverage_certified?"QUALITY_PROVEN":"CANDIDATE",paper_only:true,real_order:false,reason:out.temporal_coverage_certified?"Structured 24h chart source and temporal coverage are proven.":"Structured 24h chart source found, but temporal coverage is not certifiable yet."};
      }
    } catch (_) {}
    try {
      if (typeof atlasGetStoredChartResult === "function") {
        const result=atlasGetStoredChartResult(coin,1);
        if (Array.isArray(result?.series) && result.series.length >= 2) {
          const out=describeSeries(result.series,{owner:"AgentCryptoMarketSeriesTruth",owner_path:`atlasGetStoredChartResult(${assetId},1).series`,source_kind:"CANONICAL_STORED_24H_SERIES",asset_id:assetId,symbol,source_period_days:1,expected_cadence_min:cadenceFrom(result),display_match:false});
          return {...out,schema:"agent_crypto_market_series_truth_v2",build:BUILD,state:out.temporal_coverage_certified?"QUALITY_PROVEN":"CANDIDATE",paper_only:true,real_order:false,reason:out.temporal_coverage_certified?"Canonical stored 24h series satisfies temporal coverage contract.":"Canonical stored 24h source is identified, but cadence/coverage evidence is incomplete."};
        }
      }
    } catch (_) {}
    return {schema:"agent_crypto_market_series_truth_v2",build:BUILD,available:false,state:"UNRESOLVED",owner:"AgentCryptoMarketSeriesTruth",owner_path:null,source_kind:null,asset_id:assetId,symbol,source_period_days:null,source_period_proven:false,window:null,points:null,valid_point_pct:null,observed_median_step_min:null,expected_cadence_min:null,max_gap_min:null,gap_count:null,actual_span_min:null,expected_span_min:null,span_coverage_pct:null,temporal_coverage_pct:null,temporal_coverage_certified:false,quality_state:"UNRESOLVED",display_match:false,structured_only:true,visible_text_parsing:false,reason:"No source-proven 24h structured series is currently readable; screen selection alone is never promoted to source truth.",paper_only:true,real_order:false};
  }
  function temporalSelfTest() {
    const base=Date.UTC(2026,8,16,0,0,0), m=x=>base+x*60000;
    const short=describeSeries([[m(0),65000],[m(5),65100]],{source_period_days:1,expected_cadence_min:5});
    const gappy=describeSeries([[m(0),65000],[m(5),65100],[m(1435),65200],[m(1440),65300]],{source_period_days:1,expected_cadence_min:5});
    const seven=describeSeries([[m(0),65000],[m(10080),65100]],{source_period_days:7,expected_cadence_min:5,window_label:"24h"});
    const good=[]; for(let i=0;i<=288;i++) good.push([m(i*5),65000+i]);
    const complete=describeSeries(good,{source_period_days:1,expected_cadence_min:5});
    const cadenceUnknown=describeSeries(good,{source_period_days:1});
    const conflictRows=good.slice(); conflictRows.splice(10,0,[m(50),99999]);
    const conflict=describeSeries(conflictRows,{source_period_days:1,expected_cadence_min:5});
    const pass=short.temporal_coverage_certified===false&&Number(short.temporal_coverage_pct)<1&&gappy.gap_count===1&&gappy.temporal_coverage_certified===false&&seven.window==="7j"&&seven.temporal_coverage_certified===false&&complete.temporal_coverage_certified===true&&complete.gap_count===0&&complete.temporal_coverage_pct===100&&cadenceUnknown.temporal_coverage_certified===false&&cadenceUnknown.quality_state==="CADENCE_CONTRACT_UNKNOWN"&&conflict.temporal_coverage_certified===false&&conflict.quality_state==="CONFLICTING_DUPLICATE_TIMESTAMP"&&conflict.conflicting_duplicate_timestamps===1;
    return {schema:"agent_crypto_market_series_truth_self_test_v3",build:BUILD,pass,checks:{short_5m_not_24h_complete:short.temporal_coverage_certified===false,gappy_24h_rejected:gappy.gap_count===1&&gappy.temporal_coverage_certified===false,screen_label_cannot_override_source_period:seven.window==="7j",regular_24h_contract_passes:complete.temporal_coverage_certified===true,cadence_unknown_stays_rejected:cadenceUnknown.temporal_coverage_certified===false&&cadenceUnknown.quality_state==="CADENCE_CONTRACT_UNKNOWN",conflicting_duplicate_rejected:conflict.temporal_coverage_certified===false&&conflict.quality_state==="CONFLICTING_DUPLICATE_TIMESTAMP"}};
  }
  globalThis.AgentCryptoMarketSeriesTruth=Object.freeze({build:BUILD,snapshot:exact24hSnapshot,self_test:temporalSelfTest,structured_only:true,visible_text_parsing:false,source_period_from_screen:false,temporal_coverage_separate_from_point_validity:true,fetch_added:false,recurring_timer:false,observer:false,storage_write:false,network:false,real_order:false,paper_only:true,g3:"PENDING"});

  function strictTimeSemantics(data){const t=data?.time_truth;return data?.strict_time_semantics===true||!!(t&&t.saved_at_is_market_time===false&&t.last_seen_at_is_market_time===false&&Array.isArray(t.market_fact_time_fields)&&t.market_fact_time_fields.length>0);}
  function marketOwnerSnapshot(){const stats=safeCall(globalThis.atlasDecisionMemoryStats,null);if(!stats||typeof stats!=="object")return null;return{owner:"atlasDecisionMemoryStats",available:true,observations:integerOrNull(stats.canonicalCount??stats.distinctCount??stats.records?.length),source_records:integerOrNull(stats.sourceRecordCount),collectors:Array.isArray(stats.collectors)?stats.collectors.length:null,basis:String(stats.basis||stats.analyticalBasis||"MARKET")};}
  function retrospectiveOwnerSnapshot(){const data=safeCall(globalThis.atlasRetrospectiveValidation?.derive,null);if(!data||typeof data!=="object")return null;return{owner:"atlasRetrospectiveValidation.derive",available:true,strict_time_semantics:strictTimeSemantics(data),time_truth:data.time_truth||null,current_total:Array.isArray(data.currents)?data.currents.length:integerOrNull(data.current_count),current_evaluable:Array.isArray(data.evaluable)?data.evaluable.length:integerOrNull(data.evaluable_count),market_rows:Array.isArray(data.markets)?data.markets.length:null};}
  function explicitSeriesOwnerSnapshot(){for(const[name,api]of[["AgentCryptoMarketSeriesTruth",globalThis.AgentCryptoMarketSeriesTruth],["AgentCryptoHistoricalSeries",globalThis.AgentCryptoHistoricalSeries]]){const raw=safeCall(api?.snapshot,null);if(!raw||typeof raw!=="object"||raw.available===false)continue;return{owner:name,available:true,owner_path:raw.owner_path||null,source_kind:raw.source_kind||null,asset_id:raw.asset_id||null,symbol:raw.symbol||null,window:raw.window||null,source_period_days:finiteOrNull(raw.source_period_days),source_period_proven:raw.source_period_proven===true,points:integerOrNull(raw.points),valid_point_pct:finiteOrNull(raw.valid_point_pct),duplicate_timestamps:integerOrNull(raw.duplicate_timestamps),conflicting_duplicate_timestamps:integerOrNull(raw.conflicting_duplicate_timestamps),observed_median_step_min:finiteOrNull(raw.observed_median_step_min??raw.median_step_min),expected_cadence_min:finiteOrNull(raw.expected_cadence_min),max_gap_min:finiteOrNull(raw.max_gap_min),gap_count:integerOrNull(raw.gap_count),actual_span_min:finiteOrNull(raw.actual_span_min),span_coverage_pct:finiteOrNull(raw.span_coverage_pct),temporal_coverage_pct:finiteOrNull(raw.temporal_coverage_pct),temporal_coverage_certified:raw.temporal_coverage_certified===true,quality_state:raw.quality_state||null,first_at:raw.first_at||null,last_at:raw.last_at||null,display_match:raw.display_match===true};}return null;}
  function buildSnapshot(overrides={}){const market=Object.prototype.hasOwnProperty.call(overrides,"market")?overrides.market:marketOwnerSnapshot(),retrospective=Object.prototype.hasOwnProperty.call(overrides,"retrospective")?overrides.retrospective:retrospectiveOwnerSnapshot(),series=Object.prototype.hasOwnProperty.call(overrides,"series")?overrides.series:explicitSeriesOwnerSnapshot();return{schema:"agent_crypto_strategy_a_g3_structured_data_truth_v3",build:BUILD,source_mode:"STRUCTURED_OWNERS_ONLY",visible_text_parsing:false,dom_text_fallback:false,unknown_numeric_becomes_zero:false,owners:[market?.available?market.owner:null,retrospective?.available?retrospective.owner:null,series?.available?series.owner:null].filter(Boolean),market_memory:{available:!!market?.available,observations:integerOrNull(market?.observations),source_records:integerOrNull(market?.source_records),collectors:integerOrNull(market?.collectors),basis:market?.basis||null},retrospective:{available:!!retrospective?.available,strict_time_semantics:retrospective?.strict_time_semantics===true,time_truth:retrospective?.time_truth||null,evaluable:integerOrNull(retrospective?.current_evaluable),total:integerOrNull(retrospective?.current_total),market_rows:integerOrNull(retrospective?.market_rows)},market_series:{structured_owner_available:!!series?.available,owner:series?.owner||null,owner_path:series?.owner_path||null,source_kind:series?.source_kind||null,asset_id:series?.asset_id||null,symbol:series?.symbol||null,window:series?.window||null,source_period_days:finiteOrNull(series?.source_period_days),source_period_proven:series?.source_period_proven===true,points:integerOrNull(series?.points),valid_point_pct:finiteOrNull(series?.valid_point_pct),duplicate_timestamps:integerOrNull(series?.duplicate_timestamps),conflicting_duplicate_timestamps:integerOrNull(series?.conflicting_duplicate_timestamps),observed_median_step_min:finiteOrNull(series?.observed_median_step_min),expected_cadence_min:finiteOrNull(series?.expected_cadence_min),max_gap_min:finiteOrNull(series?.max_gap_min),gap_count:integerOrNull(series?.gap_count),actual_span_min:finiteOrNull(series?.actual_span_min),span_coverage_pct:finiteOrNull(series?.span_coverage_pct),temporal_coverage_pct:finiteOrNull(series?.temporal_coverage_pct),temporal_coverage_certified:series?.temporal_coverage_certified===true,quality_state:series?.quality_state||null,first_at:series?.first_at||null,last_at:series?.last_at||null,display_match:series?.display_match===true},certified_outcome_labels:false,certified_replay_rows:0,replay_contract_ready:false,backtest_ready:false,g3_state:"PENDING",paper_only:true,real_order:false,fabricated_data:false,reason:!series?.available?"Structured market-memory and retrospective owners are readable; no source-proven 24h series quality proof is currently available.":series.temporal_coverage_certified?"Structured 24h source quality is temporally proven; replay identity, t0 inputs and post-t0 outcome labels are still missing, so GATE 3 remains PENDING.":`Structured 24h candidate found, but temporal quality remains ${series.quality_state||"UNPROVEN"}; GATE 3 remains PENDING.`};}
  function display(value,suffix=""){return value===null||value===undefined||value===""?"INCONNU":`${value}${suffix}`;}
  function ensureStyle(){if(typeof document==="undefined"||byId(`${ROOT_ID}Style`))return;const s=document.createElement("style");s.id=`${ROOT_ID}Style`;s.textContent=`#${ROOT_ID}{margin-top:9px;padding:8px;border:1px solid rgba(117,255,206,.22);border-radius:8px;background:rgba(5,30,24,.28)}#${ROOT_ID} .g3st-title{font-size:8px;font-weight:950;letter-spacing:.08em;color:#79ffd1;text-transform:uppercase}#${ROOT_ID} .g3st-sub,#${ROOT_ID} .g3st-note{font-size:8px;color:#8fb6aa;margin-top:3px}#${ROOT_ID} .g3st-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin-top:7px}#${ROOT_ID} .g3st-k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px}#${ROOT_ID} .g3st-k span{font-size:7px;color:#71998d;display:block;text-transform:uppercase}#${ROOT_ID} .g3st-k b{font-size:9px;color:#effff9;display:block;margin-top:3px}@media(max-width:900px){#${ROOT_ID} .g3st-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;document.head.appendChild(s);}
  function ensureRoot(){if(typeof document==="undefined")return null;const dossier=byId(DOSSIER_ID);if(!dossier)return null;let root=byId(ROOT_ID);if(!root){root=document.createElement("section");root.id=ROOT_ID;const contract=byId(CONTRACT_ID);if(contract&&contract.parentElement===dossier)contract.insertAdjacentElement("afterend",root);else dossier.appendChild(root);}root.dataset.build=BUILD;return root;}
  function render(){const root=ensureRoot(),data=buildSnapshot();if(!root)return data;ensureStyle();const s=data.market_series,r=data.retrospective,m=data.market_memory;root.innerHTML=`<div class="g3st-title">G3 · STRUCTURED DATA TRUTH · ${BUILD}</div><div class="g3st-sub">Validité des points ≠ couverture temporelle · période écran jamais promue en période source.</div><div class="g3st-grid"><div class="g3st-k"><span>Observations marché</span><b>${display(m.observations)}</b></div><div class="g3st-k"><span>Temps strict</span><b>${r.strict_time_semantics?"OUI":"NON / INCONNU"}</b></div><div class="g3st-k"><span>Owner série</span><b>${display(s.owner)}</b></div><div class="g3st-k"><span>Fenêtre source</span><b>${display(s.window)}</b></div><div class="g3st-k"><span>Points valides</span><b>${display(s.valid_point_pct," %")}</b></div><div class="g3st-k"><span>Span réel</span><b>${display(s.actual_span_min," min")}</b></div><div class="g3st-k"><span>Couverture span</span><b>${display(s.span_coverage_pct," %")}</b></div><div class="g3st-k"><span>Cadence attendue</span><b>${display(s.expected_cadence_min," min")}</b></div><div class="g3st-k"><span>Pas observé</span><b>${display(s.observed_median_step_min," min")}</b></div><div class="g3st-k"><span>Max gap</span><b>${display(s.max_gap_min," min")}</b></div><div class="g3st-k"><span>Gaps contrat</span><b>${display(s.gap_count)}</b></div><div class="g3st-k"><span>Couverture temps</span><b>${display(s.temporal_coverage_pct," %")}</b></div><div class="g3st-k"><span>Qualité 24h</span><b>${s.temporal_coverage_certified?"PROVEN":display(s.quality_state)}</b></div><div class="g3st-k"><span>Dataset replay</span><b>NOT READY</b></div><div class="g3st-k"><span>G3</span><b>PENDING</b></div></div><div class="g3st-note">${data.reason}</div>`;root.dataset.g3State="PENDING";root.dataset.visibleTextParsing="false";root.dataset.temporalCoverageCertified=s.temporal_coverage_certified?"true":"false";return data;}
  function selfTest(){const t=temporalSelfTest(),labelOnly=buildSnapshot({market:{available:true,owner:"m",observations:3},retrospective:{available:true,owner:"r",strict_time_semantics:true,current_total:2,current_evaluable:1},series:{available:true,owner:"AgentCryptoMarketSeriesTruth",window:"24h",source_period_days:1,source_period_proven:true,points:4,valid_point_pct:100,expected_cadence_min:5,observed_median_step_min:5,max_gap_min:1430,gap_count:1,actual_span_min:1440,span_coverage_pct:100,temporal_coverage_pct:1,temporal_coverage_certified:false,quality_state:"TEMPORAL_COVERAGE_INCOMPLETE"}});return{schema:"agent_crypto_strategy_a_g3_structured_data_truth_self_test_v3",build:BUILD,pass:t.pass&&labelOnly.market_series.temporal_coverage_certified===false&&labelOnly.g3_state==="PENDING",temporal:t.checks};}
  globalThis.AgentCryptoStrategyAG3StructuredDataTruth=Object.freeze({build:BUILD,snapshot:buildSnapshot,render,self_test:selfTest,visible_text_parsing:false,dom_text_fallback:false,unknown_numeric_becomes_zero:false,source_period_from_screen:false,temporal_coverage_separate_from_point_validity:true,certified_replay_rows:0,backtest_ready:false,g3:"PENDING",recurring_timer:false,observer:false,storage_write:false,network:false,real_order:false,paper_only:true});
  if(typeof document!=="undefined"){const schedule=()=>{try{requestAnimationFrame(()=>render());}catch(_){queueMicrotask(render);}};document.addEventListener("agent-crypto:evidence-data-changed",schedule);document.addEventListener("agent-crypto:runtime-modules-ready",schedule,{once:true});window.addEventListener("pageshow",schedule);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();}
})();
