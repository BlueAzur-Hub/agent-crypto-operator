/*
  Agent-Crypto Administrator — Multi-Strategy Shadow Ledger
  Build: 40.6.66
  Parent: 40.6.65
  Responsibility: retain a bounded, session-local comparative evidence stream for Strategy A ↔ TRADUS.
  No market polling, no order endpoint, no wallet, no credentials, no mutation of Strategy A or Paper owners.
*/
(() => {
  "use strict";

  const BUILD = "40.6.66";
  const PANEL_ID = "multiStrategyShadowLedger406066";
  const STYLE_ID = "multiStrategyShadowLedgerStyle406066";
  const STORAGE_KEY = "agent_crypto_multi_strategy_shadow_ledger_406066";
  const EVENT_NAME = "agentcrypto:tradus-shadow-observation";
  const MAX_ROWS = 120;
  let rows = [];
  let storageMode = "MEMORY";
  let mounted = false;

  const clone = v => { try { return JSON.parse(JSON.stringify(v)); } catch (_) { return null; } };
  const finite = v => Number.isFinite(Number(v));
  const pct = v => finite(v) ? `${(Number(v) * 100).toFixed(1)} %` : "N/D";

  function load() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      rows = Array.isArray(parsed) ? parsed.slice(-MAX_ROWS) : [];
      storageMode = "SESSION";
    } catch (_) {
      rows = [];
      storageMode = "MEMORY";
    }
    return clone(rows);
  }

  function persist() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(-MAX_ROWS)));
      storageMode = "SESSION";
      return true;
    } catch (_) {
      storageMode = "MEMORY";
      return false;
    }
  }

  function normalize(row, source = "event") {
    if (!row || typeof row !== "object") return null;
    const signal = row.signal || {};
    const strategyA = row.strategy_a || {};
    const comparison = row.comparison || {};
    const tick = row.tick || {};
    const at = String(row.at || new Date().toISOString());
    const item = {
      schema: "agent_crypto_multi_strategy_shadow_observation_v1",
      build: BUILD,
      at,
      source,
      trigger: String(row.trigger || "unknown"),
      book_ok: row.ok === true,
      symbol: String(tick.symbol || "BTCEUR"),
      bid: finite(tick.bid) ? Number(tick.bid) : null,
      ask: finite(tick.ask) ? Number(tick.ask) : null,
      signal: String(signal.action || "NO_TRADE").toUpperCase(),
      reason: String(signal.reason || "UNKNOWN"),
      imbalance: finite(signal.imbalance) ? Number(signal.imbalance) : null,
      spread_ratio: finite(signal.spread_ratio) ? Number(signal.spread_ratio) : null,
      strategy_a: String(strategyA.decision || strategyA.phase || "INCONNU").toUpperCase(),
      strategy_a_direction: finite(strategyA.direction_score) ? Number(strategyA.direction_score) : null,
      comparison: String(comparison.state || "COMPARAISON").toUpperCase(),
      comparison_text: String(comparison.text || ""),
      paper_only: true,
      shadow_only: true,
      real_order: false
    };
    item.id = [item.at,item.trigger,item.bid,item.ask,item.signal,item.imbalance,item.strategy_a,item.comparison].join("|");
    return item;
  }

  function capture(row, source = "event") {
    const item = normalize(row, source);
    if (!item) return { added:false, reason:"INVALID_ROW" };
    if (rows.some(x => x.id === item.id)) return { added:false, reason:"DUPLICATE", row:clone(item) };
    rows.push(item);
    if (rows.length > MAX_ROWS) rows = rows.slice(-MAX_ROWS);
    persist();
    render();
    return { added:true, row:clone(item), count:rows.length };
  }

  function summary() {
    const out = { observations:rows.length, buy:0, sell:0, no_trade:0, convergence:0, divergence:0, opposition:0, other:0 };
    for (const row of rows) {
      if (row.signal === "BUY") out.buy++;
      else if (row.signal === "SELL") out.sell++;
      else out.no_trade++;
      if (/CONVERGENCE|ACCORD/.test(row.comparison)) out.convergence++;
      else if (/DIVERGENCE/.test(row.comparison)) out.divergence++;
      else if (/OPPOSITION/.test(row.comparison)) out.opposition++;
      else out.other++;
    }
    return out;
  }

  function ensureStyle() {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${PANEL_ID}{margin-top:10px;padding:12px;border:1px solid rgba(112,188,255,.26);border-radius:12px;background:rgba(4,18,31,.60)}
      #${PANEL_ID} .ms-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}
      #${PANEL_ID} .ms-kicker{font-size:8px;font-weight:950;letter-spacing:.12em;color:#79d8ff;text-transform:uppercase}
      #${PANEL_ID} .ms-title{margin-top:2px;font-size:13px;font-weight:950;letter-spacing:.035em}
      #${PANEL_ID} .ms-sub{margin-top:3px;font-size:8px;line-height:1.45;opacity:.76}
      #${PANEL_ID} .ms-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin-top:10px}
      #${PANEL_ID} .ms-card{padding:8px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(2,13,20,.48);min-width:0}
      #${PANEL_ID} .ms-card span{display:block;font-size:7px;letter-spacing:.07em;text-transform:uppercase;opacity:.62;font-weight:900}
      #${PANEL_ID} .ms-card b{display:block;margin-top:4px;font-size:10px;overflow-wrap:anywhere}
      #${PANEL_ID} .ms-list{margin-top:9px;border:1px solid rgba(255,255,255,.07);border-radius:9px;overflow:hidden}
      #${PANEL_ID} .ms-row{display:grid;grid-template-columns:72px 90px 90px 95px minmax(120px,1fr);gap:8px;padding:7px 9px;border-top:1px solid rgba(255,255,255,.055);font-size:8px;align-items:center}
      #${PANEL_ID} .ms-row:first-child{border-top:0}
      #${PANEL_ID} .ms-row.ms-headrow{font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;opacity:.6}
      #${PANEL_ID} .ms-empty{padding:9px;font-size:8px;opacity:.65}
      #${PANEL_ID} .ms-foot{margin-top:7px;font-size:7.5px;opacity:.66;line-height:1.4}
      @media(max-width:1100px){#${PANEL_ID} .ms-grid{grid-template-columns:repeat(3,minmax(0,1fr))}#${PANEL_ID} .ms-row{grid-template-columns:64px 78px 80px 86px minmax(100px,1fr)}}
    `;
    document.head.appendChild(style);
  }

  function exportLedger() {
    const payload = {
      schema:"agent_crypto_multi_strategy_shadow_ledger_v1",
      build:BUILD,
      exported_at:new Date().toISOString(),
      storage:storageMode,
      max_rows:MAX_ROWS,
      summary:summary(),
      observations:clone(rows),
      paper_only:true,
      real_orders:false
    };
    if (typeof document !== "undefined") {
      const blob = new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href=url; a.download="MULTI_STRATEGY_SHADOW_LEDGER_40_6_66.json"; a.click();
      setTimeout(()=>URL.revokeObjectURL(url),0);
    }
    return clone(payload);
  }

  function render() {
    if (typeof document === "undefined") return false;
    const p=document.getElementById(PANEL_ID); if(!p) return false;
    const s=summary();
    const set=(k,v)=>{const n=p.querySelector(`[data-ms="${k}"]`); if(n)n.textContent=v;};
    set("observations",String(s.observations)); set("buy",String(s.buy)); set("sell",String(s.sell));
    set("wait",String(s.no_trade)); set("convergence",String(s.convergence)); set("divergence",String(s.divergence+s.opposition));
    set("storage",storageMode);
    const list=p.querySelector("[data-ms-list]"); if(!list)return true;
    const recent=rows.slice(-5).reverse();
    list.innerHTML=`<div class="ms-row ms-headrow"><span>Heure</span><span>TRADUS</span><span>Imbalance</span><span>Strategy A</span><span>Comparaison</span></div>`+
      (recent.length?recent.map(r=>`<div class="ms-row"><span>${new Date(r.at).toLocaleTimeString("fr-FR")}</span><b>${r.signal}</b><span>${pct(r.imbalance)}</span><span>${r.strategy_a}</span><span>${r.comparison}</span></div>`).join(""):`<div class="ms-empty">Aucune observation TRADUS capturée dans cette session.</div>`);
    return true;
  }

  function mount() {
    if (typeof document === "undefined") return false;
    const existing=document.getElementById(PANEL_ID); if(existing){mounted=true;render();return true;}
    const anchor=document.getElementById("tradusShadow406066");
    if(!anchor)return false;
    ensureStyle();
    const p=document.createElement("section"); p.id=PANEL_ID; p.dataset.multiStrategyBuild=BUILD;
    p.innerHTML=`
      <div class="ms-head">
        <div><div class="ms-kicker">MULTI-STRATEGY SHADOW LEDGER</div><div class="ms-title">Mémoire comparative Strategy A ↔ TRADUS</div><div class="ms-sub">Une ligne par lecture TRADUS · session locale · maximum ${MAX_ROWS} observations · aucune exécution réelle.</div></div>
        <button type="button" class="btn small" id="multiStrategyShadowExport406066">EXPORTER LEDGER</button>
      </div>
      <div class="ms-grid">
        <div class="ms-card"><span>Observations</span><b data-ms="observations">0</b></div>
        <div class="ms-card"><span>TRADUS BUY</span><b data-ms="buy">0</b></div>
        <div class="ms-card"><span>TRADUS SELL</span><b data-ms="sell">0</b></div>
        <div class="ms-card"><span>TRADUS attend</span><b data-ms="wait">0</b></div>
        <div class="ms-card"><span>Convergences</span><b data-ms="convergence">0</b></div>
        <div class="ms-card"><span>Diverg./Oppos.</span><b data-ms="divergence">0</b></div>
      </div>
      <div class="ms-list" data-ms-list></div>
      <div class="ms-foot">STOCKAGE <b data-ms="storage">${storageMode}</b> · session uniquement · aucune mutation Strategy A · aucun timer · aucun ordre · export JSON opérateur.</div>`;
    anchor.insertAdjacentElement("afterend",p);
    p.querySelector("#multiStrategyShadowExport406066")?.addEventListener("click",exportLedger);
    mounted=true; render();
    try {
      const current=globalThis.AgentCryptoTradusShadow406066?.read?.();
      if(current)capture(current,"mount_snapshot");
    } catch (_) {}
    return true;
  }

  function onObservation(event) {
    capture(event?.detail,"tradus_event");
    if(!mounted)mount();
  }

  const api=Object.freeze({build:BUILD,event:EVENT_NAME,max_rows:MAX_ROWS,capture,read:()=>clone(rows),summary,export_ledger:exportLedger,mount,storage:()=>storageMode,paper_only:true,shadow_only:true,real_orders:false,recurring_timer:false,network_owner:false});
  globalThis.AgentCryptoTradusShadowLedger406066=api;
  load();

  if(typeof document!=="undefined"){
    document.addEventListener(EVENT_NAME,onObservation);
    const boot=()=>{mount();};
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true}); else boot();
    window.addEventListener("load",boot,{once:true});
    window.addEventListener("pageshow",boot);
    document.addEventListener("click",()=>{if(!mounted)mount();},{capture:true});
  }
})();
