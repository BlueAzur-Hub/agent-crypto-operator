/* Agent-Crypto @erith.IA — 40.6.214 G3 POST-HORIZON OUTCOME OWNER
   Terrain 40.6.213 proved: 24H contract certified, durable PAPER evidence survives
   reload, one T0 decision is joined to the certified market window, and the replay
   dataset is READY_FOR_DECISION_REPLAY. This owner attaches read-only descriptive
   market outcomes strictly AFTER T0 at explicit T+5 / T+15 / T+60 horizons.
   No current Oracle is applied to the past, no backfill is invented, no outcome is
   used as a T0 input, no economic result or Gate PASS is created. PAPER ONLY. */
(() => {
  "use strict";

  const BUILD = "40.6.214";
  const ROOT_ID = "strategyAG3PostHorizonOutcome";
  const HOST_ID = "strategyAEvidenceSupplements";
  const OVERLAP_ID = "strategyAG3T0WindowOverlapProof";
  const HORIZONS_MIN = Object.freeze([5, 15, 60]);
  let queued = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const finite = v => { const n = Number(v); return Number.isFinite(n) ? n : null; };
  const esc = v => String(v ?? "—").replace(/[&<>\"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[m]));
  const iso = ms => Number.isFinite(ms) ? new Date(ms).toISOString() : null;
  const pct = (a,b) => Number.isFinite(a) && a > 0 && Number.isFinite(b)
    ? Math.round((((b / a) - 1) * 100) * 10000) / 10000
    : null;

  function checkpoint() {
    try { return globalThis.AgentCryptoStrategyAG3CascadeCheckpoint?.snapshot?.() || null; }
    catch (_) { return null; }
  }

  function normalizeRows(rows) {
    return (Array.isArray(rows) ? rows : [])
      .map(row => Array.isArray(row) ? [finite(row[0]), finite(row[1])] : [null, null])
      .filter(row => row[0] !== null && row[1] !== null && row[1] > 0)
      .sort((a,b) => a[0] - b[0]);
  }

  function baseRowAtOrBefore(rows, t0, cadenceMin) {
    let best = null;
    for (const row of rows) {
      if (row[0] <= t0) best = row;
      else break;
    }
    if (!best) return null;
    const toleranceMs = Math.max(90_000, (finite(cadenceMin) || 5) * 60_000 * 1.25);
    return (t0 - best[0]) <= toleranceMs ? best : null;
  }

  function futureRow(rows, t0, horizonMin, cadenceMin) {
    const target = t0 + horizonMin * 60_000;
    const toleranceMs = Math.max(90_000, (finite(cadenceMin) || 5) * 60_000 * 0.40);
    const candidate = rows.find(row => row[0] > t0 && row[0] >= target) || null;
    if (!candidate) return Object.freeze({status:"WAITING",target_at:iso(target),matched_at:null,price:null,gap_sec:null});
    const gap = candidate[0] - target;
    if (gap > toleranceMs) {
      return Object.freeze({status:"UNRESOLVED_GAP",target_at:iso(target),matched_at:iso(candidate[0]),price:candidate[1],gap_sec:Math.round(gap/1000)});
    }
    return Object.freeze({status:"CERTIFIED",target_at:iso(target),matched_at:iso(candidate[0]),price:candidate[1],gap_sec:Math.round(gap/1000)});
  }

  function classifyMove(value) {
    if (!Number.isFinite(value)) return "WAITING";
    if (Math.abs(value) < 0.0001) return "FLAT";
    return value > 0 ? "UP" : "DOWN";
  }

  function snapshot() {
    const cp = checkpoint();
    const temporal = cp?.temporal || null;
    const dataset = cp?.dataset || null;
    const rows = normalizeRows(temporal?.rows);
    const joined = Array.isArray(dataset?.joined) ? dataset.joined : [];
    const cadence = finite(temporal?.observed_cadence_min);

    const decisions = joined.map(item => {
      const d = item?.decision || {};
      const t0 = finite(d.market_at);
      const base = t0 === null ? null : baseRowAtOrBefore(rows, t0, cadence);
      const outcomes = {};
      for (const h of HORIZONS_MIN) {
        const future = t0 === null ? {status:"WAITING",target_at:null,matched_at:null,price:null,gap_sec:null} : futureRow(rows, t0, h, cadence);
        const change = base && future.status === "CERTIFIED" ? pct(base[1], future.price) : null;
        outcomes[`t${h}`] = Object.freeze({...future,change_pct:change,direction:classifyMove(change)});
      }
      const values = Object.values(outcomes);
      const certified = values.filter(v => v.status === "CERTIFIED").length;
      const unresolved = values.filter(v => v.status === "UNRESOLVED_GAP").length;
      const status = !base ? "T0_BASE_PRICE_UNPROVEN"
        : unresolved ? "TEMPORAL_GAP_UNRESOLVED"
        : certified === HORIZONS_MIN.length ? "OUTCOMES_CERTIFIED"
        : certified > 0 ? "OUTCOMES_PARTIAL"
        : "WAITING_POST_HORIZON_DATA";
      return Object.freeze({
        id: d.id || null,
        asset: d.asset || temporal?.asset || "BTC",
        decision: d.decision || null,
        t0_at: iso(t0),
        t0_price_at: base ? iso(base[0]) : null,
        t0_price: base?.[1] ?? null,
        horizons: Object.freeze(outcomes),
        certified_horizons: certified,
        expected_horizons: HORIZONS_MIN.length,
        status
      });
    });

    const totalExpected = decisions.length * HORIZONS_MIN.length;
    const totalCertified = decisions.reduce((sum,d) => sum + d.certified_horizons, 0);
    const allCertified = decisions.length > 0 && decisions.every(d => d.status === "OUTCOMES_CERTIFIED");
    const state = !dataset?.ready ? "WAITING_REPLAY_JOIN"
      : !decisions.length ? "WAITING_REPLAY_JOIN"
      : allCertified ? "OUTCOME_LABELS_CERTIFIED"
      : totalCertified > 0 ? "PARTIAL_POST_HORIZON_DATA"
      : "WAITING_POST_HORIZON_DATA";

    return Object.freeze({
      schema: "agent_crypto_g3_post_horizon_outcome_v1",
      build: BUILD,
      checkpoint_build: cp?.build || null,
      replay_dataset: dataset?.status || "NOT_READY",
      checkpoint_blocker: cp?.checkpoint?.blocker || null,
      state,
      horizons_min: HORIZONS_MIN.slice(),
      joined_decisions: decisions.length,
      certified_horizons: totalCertified,
      expected_horizons: totalExpected,
      outcome_labels: allCertified ? "CERTIFIED" : "NOT_CERTIFIED",
      decisions: Object.freeze(decisions),
      current_oracle_applied_to_past: false,
      future_outcomes_used_as_t0_input: false,
      lookahead: false,
      economic_result: false,
      gate_promotion: false,
      paper_only: true,
      real_order: false,
      g3: "PENDING",
      g9: "LOCKED"
    });
  }

  function ensureStyle() {
    if (typeof document === "undefined" || byId(`${ROOT_ID}Style`)) return;
    const style = document.createElement("style");
    style.id = `${ROOT_ID}Style`;
    style.textContent = `
      #${ROOT_ID}{margin-top:10px;padding:10px;border:1px solid rgba(133,232,255,.30);border-radius:10px;background:linear-gradient(135deg,rgba(7,30,40,.56),rgba(14,24,41,.50))}
      #${ROOT_ID} .pho-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap}
      #${ROOT_ID} .pho-title{font-size:9px;font-weight:950;letter-spacing:.09em;color:#8cefff;text-transform:uppercase}
      #${ROOT_ID} .pho-state{font-size:9px;font-weight:950;color:#fff0bd;border:1px solid rgba(255,211,110,.24);border-radius:999px;padding:5px 8px}
      #${ROOT_ID} .pho-sub{margin-top:4px;font-size:8px;color:#9bb8c3}
      #${ROOT_ID} .pho-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px;margin-top:8px}
      #${ROOT_ID} .pho-k{padding:7px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(2,11,18,.26)}
      #${ROOT_ID} .pho-k span{display:block;font-size:7px;color:#7fa2af;text-transform:uppercase}.pho-k b{display:block;margin-top:2px;font-size:9px;color:#edfaff}
      #${ROOT_ID} .pho-row{margin-top:8px;padding:8px;border:1px solid rgba(140,220,255,.12);border-radius:8px}
      #${ROOT_ID} .pho-row-head{display:flex;gap:8px;flex-wrap:wrap;font-size:8px;color:#bfefff;font-weight:900}
      #${ROOT_ID} .pho-grid{display:grid;grid-template-columns:repeat(3,minmax(150px,1fr));gap:6px;margin-top:6px}
      #${ROOT_ID} .pho-h{padding:6px;border-radius:7px;background:rgba(255,255,255,.035);font-size:8px;color:#b8cbd5}
      #${ROOT_ID} .pho-h b{display:block;color:#fff4d0;margin-bottom:2px}.pho-note{margin-top:7px;font-size:8px;color:#829faa;line-height:1.4}
      @media(max-width:900px){#${ROOT_ID} .pho-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function render() {
    const s = snapshot();
    if (typeof document === "undefined") return s;
    const host = byId(HOST_ID);
    if (!host) return s;
    ensureStyle();
    let root = byId(ROOT_ID);
    if (!root) { root = document.createElement("section"); root.id = ROOT_ID; }
    const overlap = byId(OVERLAP_ID);
    if (overlap?.parentElement === host) overlap.insertAdjacentElement("afterend", root);
    else if (root.parentElement !== host) host.appendChild(root);
    root.dataset.build = BUILD;
    root.dataset.readOnly = "true";

    const rows = s.decisions.map(d => {
      const horizons = HORIZONS_MIN.map(h => {
        const o = d.horizons[`t${h}`];
        const value = Number.isFinite(o.change_pct) ? `${o.change_pct >= 0 ? "+" : ""}${o.change_pct.toFixed(4)} %` : "en attente";
        return `<div class="pho-h"><b>Après ${h} min · ${esc(o.status)}</b>Prix: ${esc(o.price ?? "—")} · variation: ${esc(value)} · ${esc(o.direction)}</div>`;
      }).join("");
      return `<div class="pho-row"><div class="pho-row-head"><span>${esc(d.id || "—")}</span><span>${esc(d.asset)}</span><span>Décision: ${esc(d.decision || "—")}</span><span>T0: ${esc(d.t0_at || "—")}</span></div><div class="pho-grid">${horizons}</div></div>`;
    }).join("");

    root.innerHTML = `
      <div class="pho-head"><div><div class="pho-title">G3 · RÉSULTATS APRÈS DÉCISION · ${BUILD}</div><div class="pho-sub">Lecture seule · observations réelles strictement postérieures à T0 · aucun verdict de performance.</div></div><div class="pho-state">${esc(s.state)}</div></div>
      <div class="pho-summary">
        <div class="pho-k"><span>Replay</span><b>${esc(s.replay_dataset)}</b></div>
        <div class="pho-k"><span>Décisions raccordées</span><b>${esc(s.joined_decisions)}</b></div>
        <div class="pho-k"><span>Horizons disponibles</span><b>${esc(s.certified_horizons)} / ${esc(s.expected_horizons)}</b></div>
        <div class="pho-k"><span>Outcome labels</span><b>${esc(s.outcome_labels)}</b></div>
        <div class="pho-k"><span>Gate 3</span><b>PENDING</b></div>
      </div>
      ${rows || '<div class="pho-note">Aucune décision raccordée disponible pour observer le futur.</div>'}
      <div class="pho-note">T+5 / T+15 / T+60 décrivent uniquement le marché observé après la décision. Ces valeurs ne peuvent jamais réécrire le signal T0, ni créer un PASS de Gate 3.</div>`;
    return s;
  }

  function selfTest() {
    const rows = [[0,100],[300000,101],[900000,99],[3600000,102]];
    const base = baseRowAtOrBefore(rows, 0, 5);
    const f5 = futureRow(rows, 0, 5, 5);
    const f15 = futureRow(rows, 0, 15, 5);
    const checks = Object.freeze({
      base_at_or_before_t0: base?.[1] === 100,
      t5_future_only: f5.status === "CERTIFIED" && f5.price === 101,
      t15_future_only: f15.status === "CERTIFIED" && f15.price === 99,
      no_gate_promotion: snapshot().g3 === "PENDING",
      no_real_order: snapshot().real_order === false
    });
    return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks});
  }

  function schedule() {
    if (queued) return;
    queued = true;
    const run = () => { queued = false; render(); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  globalThis.AgentCryptoStrategyAG3PostHorizonOutcome = Object.freeze({
    build: BUILD,
    owner: "POST_HORIZON_OUTCOME_OWNER",
    root_id: ROOT_ID,
    horizons_min: HORIZONS_MIN.slice(),
    snapshot,
    render,
    schedule,
    self_test: selfTest,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    business_network_request: false,
    current_oracle_applied_to_past: false,
    future_outcomes_used_as_t0_input: false,
    economic_backtest: false,
    gate_promotion: false,
    real_order: false,
    paper_only: true,
    g3: "PENDING",
    g9: "LOCKED"
  });

  if (typeof document !== "undefined") {
    document.addEventListener("agent-crypto:evidence-data-changed", schedule);
    document.addEventListener("agent-crypto:evidence-refresh-complete", schedule);
    document.addEventListener("agent-crypto:market-series-updated", schedule);
    document.addEventListener("click", event => {
      const b = event?.target?.closest?.("button");
      if (b && /rafraîchir\s+marché/i.test(String(b.textContent || ""))) schedule();
    }, false);
    window.addEventListener("pageshow", schedule);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule,{once:true});
    else schedule();
  }
})();
