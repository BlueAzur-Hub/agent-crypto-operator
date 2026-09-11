/*
  Agent-Crypto Administrator — TRADUS Paper Observability
  Build: 40.6.68
  Parent: 40.6.67 R1
  Responsibility: expose a read-only Paper Shadow snapshot and a bounded local evaluation archive of CLOSED paper trades.
  Source owner remains AgentCryptoTradusPaperShadow406067. No order endpoint, key, wallet, market polling, timer or Strategy A mutation.
*/
(() => {
  "use strict";

  const BUILD = "40.6.68";
  const SOURCE_BUILD = "40.6.67";
  const SOURCE_EVENT = "agentcrypto:tradus-shadow-observation";
  const SNAPSHOT_EVENT = "agentcrypto:tradus-paper-snapshot";
  const PANEL_ID = "tradusPaperObservability406068";
  const STYLE_ID = "tradusPaperObservabilityStyle406068";
  const ARCHIVE_KEY = "agent_crypto_tradus_paper_evaluation_406068_v1";
  const MAX_ARCHIVE_TRADES = 500;

  let archive = loadArchive();
  let lastSnapshot = null;
  let mounted = false;

  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const num = value => { const n = Number(value); return Number.isFinite(n) ? n : null; };
  const money = value => num(value) === null ? "N/D" : new Intl.NumberFormat("fr-FR", { style:"currency", currency:"EUR", minimumFractionDigits:2, maximumFractionDigits:2 }).format(Number(value));
  const price = value => num(value) === null ? "N/D" : Number(value).toLocaleString("fr-FR", { minimumFractionDigits:2, maximumFractionDigits:2 });
  const pct = value => num(value) === null ? "N/D" : `${(Number(value) * 100).toFixed(1)} %`;
  const iso = value => { const ms = Date.parse(String(value || "")); return Number.isFinite(ms) ? new Date(ms).toISOString() : null; };

  function freshArchive() {
    return { schema:"agent_crypto_tradus_paper_evaluation_archive_v1", build:BUILD, trades:[], updated_at:null, paper_only:true, real_orders:false };
  }

  function loadArchive() {
    try {
      const raw = localStorage.getItem(ARCHIVE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.schema === "agent_crypto_tradus_paper_evaluation_archive_v1" && Array.isArray(parsed.trades)) {
        parsed.trades = parsed.trades.slice(-MAX_ARCHIVE_TRADES);
        return parsed;
      }
    } catch (_) {}
    return freshArchive();
  }

  function persistArchive() {
    try {
      archive.updated_at = new Date().toISOString();
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
      return true;
    } catch (_) { return false; }
  }

  function normalizeClosedTrade(trade) {
    if (!trade || typeof trade !== "object" || !trade.id) return null;
    const net = num(trade.net_pnl_after_all_fees);
    const gross = num(trade.gross_pnl);
    return {
      id:String(trade.id), source_build:SOURCE_BUILD, observed_by:BUILD,
      side:String(trade.side || "N/D"), opened_at:iso(trade.opened_at), closed_at:iso(trade.closed_at),
      entry_price:num(trade.entry_price), exit_price:num(trade.exit_price), qty:num(trade.qty),
      entry_notional:num(trade.entry_notional), entry_fee:num(trade.entry_fee) || 0, exit_fee:num(trade.exit_fee) || 0,
      gross_pnl:gross, net_pnl_after_all_fees:net, close_reason:String(trade.close_reason || "N/D"),
      exit_signal:String(trade.exit_signal || "N/D"), paper_only:true, real_order:false
    };
  }

  function captureClosedTrades(paperState) {
    const trades = Array.isArray(paperState?.trades) ? paperState.trades : [];
    if (!trades.length) return 0;
    const known = new Set(archive.trades.map(row => row.id));
    let added = 0;
    for (const trade of trades) {
      const row = normalizeClosedTrade(trade);
      if (!row || known.has(row.id)) continue;
      archive.trades.push(row); known.add(row.id); added++;
    }
    if (archive.trades.length > MAX_ARCHIVE_TRADES) archive.trades = archive.trades.slice(-MAX_ARCHIVE_TRADES);
    if (added) persistArchive();
    return added;
  }

  function archiveStats(rows = archive.trades) {
    const valid = (Array.isArray(rows) ? rows : []).filter(row => num(row?.net_pnl_after_all_fees) !== null);
    let net = 0, gross = 0, fees = 0, wins = 0, losses = 0, flats = 0, peak = 0, curve = 0, maxDrawdown = 0;
    for (const row of valid) {
      const n = Number(row.net_pnl_after_all_fees);
      const g = num(row.gross_pnl) || 0;
      const f = (num(row.entry_fee) || 0) + (num(row.exit_fee) || 0);
      net += n; gross += g; fees += f;
      if (n > 0) wins++; else if (n < 0) losses++; else flats++;
      curve += n; peak = Math.max(peak, curve); maxDrawdown = Math.max(maxDrawdown, peak - curve);
    }
    return {
      trades:valid.length, wins, losses, flats, net, gross, fees,
      win_rate:valid.length ? wins / valid.length : null,
      avg_net:valid.length ? net / valid.length : null,
      max_drawdown:maxDrawdown,
      updated_at:archive.updated_at
    };
  }

  function openMark(paperState, row) {
    const position = paperState?.position;
    const bid = num(row?.tick?.bid), ask = num(row?.tick?.ask);
    if (!position || bid === null || ask === null) return null;
    const qty = num(position.qty), entry = num(position.entry_price), entryFee = num(position.entry_fee) || 0;
    if (qty === null || entry === null) return null;
    const mark = String(position.side).toUpperCase() === "LONG" ? bid : ask;
    const gross = String(position.side).toUpperCase() === "LONG" ? (mark - entry) * qty : (entry - mark) * qty;
    const feeRate = num(globalThis.AgentCryptoTradusPaperShadow406067?.assumptions?.fee_rate_per_fill) || 0.001;
    const exitFee = Math.abs(qty * mark) * feeRate;
    return {
      mark, gross, exit_fee:exitFee,
      trade_net_if_close:gross - entryFee - exitFee,
      balance_effect_if_close:gross - exitFee
    };
  }

  function buildSnapshot(row = null, source = "read") {
    const paperApi = globalThis.AgentCryptoTradusPaperShadow406067;
    const paperState = paperApi?.read?.() || null;
    const sourceRow = row || globalThis.AgentCryptoTradusShadow406066?.read?.() || null;
    if (!paperState) return null;
    captureClosedTrades(paperState);

    const startCapital = num(paperState.capital_start) || num(paperApi?.assumptions?.start_capital_eur) || 1000;
    const realizedNet = num(paperState.realized_net) || 0;
    const balance = startCapital + realizedNet;
    const mark = openMark(paperState, sourceRow);
    const stats = archiveStats();
    const observedAt = iso(sourceRow?.at || paperState.last_observation_at);
    const age = observedAt ? Math.max(0, (Date.now() - Date.parse(observedAt)) / 1000) : null;
    const signal = String(sourceRow?.signal?.action || "N/D").toUpperCase();
    const reason = String(sourceRow?.signal?.reason || "UNKNOWN");
    const side = String(paperState.position?.side || "FLAT").toUpperCase();

    return Object.freeze({
      schema:"agent_crypto_tradus_paper_observability_snapshot_v1", build:BUILD, source_build:SOURCE_BUILD,
      created_at:new Date().toISOString(), observed_at:observedAt, observation_age_seconds:age, source,
      book_ok:sourceRow?.ok === true, signal, signal_reason:reason,
      imbalance:num(sourceRow?.signal?.imbalance), spread_ratio:num(sourceRow?.signal?.spread_ratio),
      position:clone(paperState.position), side,
      session:{
        start_capital:startCapital, balance_after_realized_and_entry_fees:balance,
        realized_net:realizedNet, fees:num(paperState.fees) || 0,
        closed_trades:Array.isArray(paperState.trades) ? paperState.trades.length : 0,
        last_action:String(paperState.last_action || "N/D")
      },
      mark:mark ? Object.freeze({...mark, equity_if_close:balance + mark.balance_effect_if_close}) : null,
      archive:Object.freeze(stats),
      safety:Object.freeze({paper_only:true, real_orders:false, credentials:false, wallet:false, strategy_a_mutated:false, network_owner:false, recurring_timer:false})
    });
  }

  function ensureStyle() {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${PANEL_ID}{margin-top:10px;padding:12px;border:1px solid rgba(106,221,255,.28);border-radius:12px;background:linear-gradient(135deg,rgba(3,19,31,.70),rgba(10,27,28,.58));box-shadow:inset 0 0 0 1px rgba(255,255,255,.025)}
      #${PANEL_ID} .tpo-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap}
      #${PANEL_ID} .tpo-kicker{font-size:8px;font-weight:950;letter-spacing:.13em;color:#79e9ff;text-transform:uppercase}
      #${PANEL_ID} .tpo-title{margin-top:2px;font-size:13px;font-weight:950;letter-spacing:.03em}
      #${PANEL_ID} .tpo-sub{margin-top:3px;font-size:8px;line-height:1.45;opacity:.74}
      #${PANEL_ID} .tpo-actions{display:flex;gap:6px;flex-wrap:wrap}
      #${PANEL_ID} .tpo-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin-top:10px}
      #${PANEL_ID} .tpo-card{min-width:0;padding:8px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(2,13,20,.50)}
      #${PANEL_ID} .tpo-card span{display:block;font-size:7px;letter-spacing:.07em;text-transform:uppercase;opacity:.62;font-weight:900}
      #${PANEL_ID} .tpo-card b{display:block;margin-top:4px;font-size:10px;overflow-wrap:anywhere}
      #${PANEL_ID} .tpo-status{margin-top:8px;padding:8px 9px;border:1px solid rgba(255,255,255,.07);border-radius:9px;font-size:9px;line-height:1.45}
      #${PANEL_ID} .tpo-list{margin-top:8px;border:1px solid rgba(255,255,255,.065);border-radius:9px;overflow:hidden}
      #${PANEL_ID} .tpo-row{display:grid;grid-template-columns:74px 62px 88px minmax(120px,1fr);gap:8px;padding:6px 8px;border-top:1px solid rgba(255,255,255,.05);font-size:8px;align-items:center}
      #${PANEL_ID} .tpo-row:first-child{border-top:0} #${PANEL_ID} .tpo-row.head{font-size:7px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;opacity:.58}
      #${PANEL_ID} .tpo-empty{padding:8px;font-size:8px;opacity:.62}
      #${PANEL_ID} .tpo-foot{margin-top:7px;font-size:7.5px;line-height:1.45;opacity:.68}
      #${PANEL_ID}[data-side="LONG"] [data-tpo="position"]{color:#71efbd} #${PANEL_ID}[data-side="SHORT"] [data-tpo="position"]{color:#ff8d9a}
      @media(max-width:1100px){#${PANEL_ID} .tpo-grid{grid-template-columns:repeat(3,minmax(0,1fr))}#${PANEL_ID} .tpo-row{grid-template-columns:64px 54px 78px minmax(100px,1fr)}}
    `;
    document.head.appendChild(style);
  }

  function render(snapshot = lastSnapshot) {
    if (typeof document === "undefined") return false;
    const panel = document.getElementById(PANEL_ID); if (!panel || !snapshot) return false;
    panel.dataset.side = snapshot.side;
    const set = (key, value) => { const node = panel.querySelector(`[data-tpo="${key}"]`); if (node) node.textContent = value; };
    set("signal", snapshot.signal);
    set("freshness", snapshot.observation_age_seconds === null ? "N/D" : `${snapshot.observation_age_seconds.toFixed(1)} s`);
    set("position", snapshot.side);
    set("equity", snapshot.mark ? money(snapshot.mark.equity_if_close) : money(snapshot.session.balance_after_realized_and_entry_fees));
    set("archiveTrades", `${snapshot.archive.trades} · ${snapshot.archive.wins}G/${snapshot.archive.losses}P`);
    set("archiveNet", money(snapshot.archive.net));
    set("status", `${snapshot.session.last_action} · signal ${snapshot.signal} (${snapshot.signal_reason}) · imbalance ${pct(snapshot.imbalance)} · spread ${pct(snapshot.spread_ratio)}`);
    set("sessionNet", money(snapshot.session.realized_net));
    set("sessionFees", money(snapshot.session.fees));
    set("drawdown", money(snapshot.archive.max_drawdown));

    const list = panel.querySelector("[data-tpo-list]");
    if (list) {
      const recent = archive.trades.slice(-5).reverse();
      list.innerHTML = `<div class="tpo-row head"><span>Clôture</span><span>Side</span><span>Net</span><span>Cause</span></div>` +
        (recent.length ? recent.map(row => `<div class="tpo-row"><span>${row.closed_at ? new Date(row.closed_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) : "—"}</span><b>${row.side}</b><span>${money(row.net_pnl_after_all_fees)}</span><span>${row.close_reason}</span></div>`).join("") : `<div class="tpo-empty">Aucun trade PAPER clôturé dans l’archive d’évaluation locale.</div>`);
    }
    syncAetherContract(snapshot);
    return true;
  }

  function syncAetherContract(snapshot) {
    if (typeof document === "undefined" || !snapshot) return false;
    const stage = document.querySelector('[data-aether-component-stage-406046]');
    if (!stage) return false;
    stage.dataset.tradusPaper406068 = snapshot.side;
    stage.dataset.tradusSignal406068 = snapshot.signal;
    stage.dataset.tradusArchiveTrades406068 = String(snapshot.archive.trades);
    return true;
  }

  function mount() {
    if (typeof document === "undefined") return false;
    const existing = document.getElementById(PANEL_ID);
    if (existing) { mounted = true; if (lastSnapshot) render(); return true; }
    const anchor = document.getElementById("tradusPaperShadow406067");
    if (!anchor) return false;
    ensureStyle();
    const panel = document.createElement("section");
    panel.id = PANEL_ID; panel.dataset.tradusPaperObservabilityBuild = BUILD;
    panel.innerHTML = `
      <div class="tpo-head"><div><div class="tpo-kicker">TRADUS PAPER · OBSERVABILITÉ 40.6.68</div><div class="tpo-title">Équité exécutable + archive locale des trades clôturés</div><div class="tpo-sub">Le moteur 40.6.67 reste propriétaire du lifecycle. Cette couche lit son état, mesure l’équité si clôture maintenant et conserve uniquement les trades PAPER clôturés pour évaluation multi-session.</div></div><div class="tpo-actions"><button type="button" class="btn small" id="tradusPaperObsExport406068">EXPORTER ÉVALUATION</button><button type="button" class="btn small" id="tradusPaperObsClear406068">EFFACER ARCHIVE</button></div></div>
      <div class="tpo-grid"><div class="tpo-card"><span>Signal TRADUS</span><b data-tpo="signal">N/D</b></div><div class="tpo-card"><span>Fraîcheur</span><b data-tpo="freshness">N/D</b></div><div class="tpo-card"><span>Position PAPER</span><b data-tpo="position">FLAT</b></div><div class="tpo-card"><span>Équité si clôture</span><b data-tpo="equity">1 000,00 €</b></div><div class="tpo-card"><span>Archive clôturée</span><b data-tpo="archiveTrades">0 · 0G/0P</b></div><div class="tpo-card"><span>Net archive</span><b data-tpo="archiveNet">0,00 €</b></div></div>
      <div class="tpo-status" data-tpo="status">En attente d’une observation TRADUS.</div>
      <div class="tpo-list" data-tpo-list></div>
      <div class="tpo-foot">SESSION net <b data-tpo="sessionNet">0,00 €</b> · frais session <b data-tpo="sessionFees">0,00 €</b> · drawdown archive <b data-tpo="drawdown">0,00 €</b> · PAPER ONLY · aucun ordre réel · aucune clé · aucun wallet · aucun polling · Strategy A inchangée.</div>`;
    anchor.insertAdjacentElement("afterend", panel);
    panel.querySelector("#tradusPaperObsExport406068")?.addEventListener("click", exportEvaluation);
    panel.querySelector("#tradusPaperObsClear406068")?.addEventListener("click", clearArchive);
    mounted = true;
    return true;
  }

  function publish(row = null, source = "event") {
    if (!mounted) mount();
    const snapshot = buildSnapshot(row, source);
    if (!snapshot) return null;
    lastSnapshot = snapshot;
    render(snapshot);
    if (typeof document !== "undefined") {
      try { document.dispatchEvent(new CustomEvent(SNAPSHOT_EVENT, { detail:clone(snapshot) })); } catch (_) {}
    }
    return clone(snapshot);
  }

  function exportEvaluation() {
    const payload = {
      schema:"agent_crypto_tradus_paper_evaluation_export_v1", build:BUILD, source_build:SOURCE_BUILD,
      exported_at:new Date().toISOString(), snapshot:clone(lastSnapshot), archive:clone(archive), stats:archiveStats(),
      assumptions:clone(globalThis.AgentCryptoTradusPaperShadow406067?.assumptions || null),
      paper_only:true, real_orders:false, credentials:false, wallet:false
    };
    if (typeof document !== "undefined") {
      const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"});
      const url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = "TRADUS_PAPER_EVALUATION_40_6_68.json"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
    return clone(payload);
  }

  function clearArchive() {
    if (typeof document !== "undefined" && typeof confirm === "function" && !confirm("Effacer uniquement l’archive locale d’évaluation TRADUS Paper 40.6.68 ?")) return false;
    archive = freshArchive();
    try { localStorage.removeItem(ARCHIVE_KEY); } catch (_) {}
    publish(null, "archive_reset");
    return true;
  }

  function selfTest() {
    const rows = [
      {net_pnl_after_all_fees:1.2,gross_pnl:1.4,entry_fee:.1,exit_fee:.1},
      {net_pnl_after_all_fees:-.5,gross_pnl:-.3,entry_fee:.1,exit_fee:.1},
      {net_pnl_after_all_fees:.3,gross_pnl:.5,entry_fee:.1,exit_fee:.1}
    ];
    const stats = archiveStats(rows);
    const pass = stats.trades===3 && stats.wins===2 && stats.losses===1 && Math.abs(stats.net-1.0)<1e-9 && Math.abs(stats.fees-.6)<1e-9 && Math.abs(stats.max_drawdown-.5)<1e-9;
    return {build:BUILD,pass,checks:{trades:stats.trades,wins:stats.wins,losses:stats.losses,net:stats.net,fees:stats.fees,max_drawdown:stats.max_drawdown},paper_only:true,real_orders:false,network_owner:false,recurring_timer:false};
  }

  const api = Object.freeze({
    build:BUILD, source_build:SOURCE_BUILD, source_event:SOURCE_EVENT, snapshot_event:SNAPSHOT_EVENT,
    read:()=>clone(lastSnapshot), archive:()=>clone(archive), stats:()=>archiveStats(), publish, mount,
    export_evaluation:exportEvaluation, clear_archive:clearArchive, self_test:selfTest,
    paper_only:true, real_orders:false, credentials:false, wallet:false, strategy_a_mutated:false,
    network_owner:false, recurring_timer:false, persistent_evaluation_storage:true
  });
  globalThis.AgentCryptoTradusPaperObservability406068 = api;

  if (typeof document !== "undefined") {
    document.addEventListener(SOURCE_EVENT, event => queueMicrotask(() => publish(event?.detail, "tradus_event")));
    const boot = () => { if (mount()) publish(null, "mount"); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true}); else boot();
    window.addEventListener("pageshow", () => { if (mount()) publish(null, "pageshow"); });
    document.addEventListener("click", () => { if (!mounted && mount()) publish(null, "late_mount"); }, {capture:true});
  }
})();
