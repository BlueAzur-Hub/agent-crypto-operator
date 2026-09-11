/*
  Agent-Crypto Administrator — Aether × TRADUS Surface Bridge
  Build: 40.6.69
  Parent: 40.6.68
  Responsibility: expose the existing TRADUS PAPER observability snapshot inside Aether as a discreet status surface
  and read-only Workbench context/history. No trading decision ownership, no order endpoint, no market polling,
  no recurring timer, no durable storage, no mutation of Aether business truth or Strategy A.
*/
(() => {
  "use strict";

  const BUILD = "40.6.69";
  const SOURCE_BUILD = "40.6.68";
  const SNAPSHOT_EVENT = "agentcrypto:tradus-paper-snapshot";
  const PILL_ID = "aetherTradusPill406069";
  const STYLE_ID = "aetherTradusBridgeStyle406069";
  const WORKBENCH_ROOT_ID = "atlasAetherWorkbench406039";
  const MAX_EVENTS = 24;

  let lastSnapshot = null;
  let previousMeaningful = null;
  const events = [];
  let rootObserver = null;
  let workbenchObserver = null;
  let decorating = false;

  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const num = value => { const n = Number(value); return Number.isFinite(n) ? n : null; };
  const money = value => num(value) === null ? "N/D" : new Intl.NumberFormat("fr-FR", { style:"currency", currency:"EUR", minimumFractionDigits:2, maximumFractionDigits:2 }).format(Number(value));
  const shortMoney = value => num(value) === null ? "N/D" : `${Number(value).toLocaleString("fr-FR", { minimumFractionDigits:2, maximumFractionDigits:2 })} €`;
  const pct = value => num(value) === null ? "N/D" : `${(Number(value) * 100).toFixed(1)} %`;
  const upper = value => String(value ?? "").trim().toUpperCase();

  function sourceRead() {
    try {
      return globalThis.AgentCryptoTradusPaperObservability406068?.read?.() || null;
    } catch (_) { return null; }
  }

  function surfaceModel(snapshot) {
    if (!snapshot) return Object.freeze({ label:"TRADUS · N/D", title:"TRADUS PAPER indisponible", tone:"muted" });
    const side = upper(snapshot.side || "FLAT") || "FLAT";
    const signal = upper(snapshot.signal || "N/D") || "N/D";
    const trades = num(snapshot?.archive?.trades) ?? 0;
    const equity = snapshot?.mark ? num(snapshot.mark.equity_if_close) : num(snapshot?.session?.balance_after_realized_and_entry_fees);
    const positionLabel = side === "FLAT" ? "FLAT" : `${side} PAPER`;
    const compact = side === "FLAT"
      ? `TRADUS · ${positionLabel} · ${signal} · ${trades}T`
      : `TRADUS · ${positionLabel} · ${shortMoney(equity)} · ${trades}T`;
    const title = [
      `TRADUS PAPER ${positionLabel}`,
      `signal ${signal}`,
      `équité si clôture ${money(equity)}`,
      `archive ${trades} trade(s)`,
      `net archive ${money(snapshot?.archive?.net)}`
    ].join(" · ");
    const tone = side === "LONG" ? "long" : side === "SHORT" ? "short" : signal === "NO_TRADE" ? "wait" : "neutral";
    return Object.freeze({ label:compact, title, tone, side, signal, trades, equity });
  }

  function meaningful(snapshot) {
    if (!snapshot) return null;
    return {
      side: upper(snapshot.side || "FLAT") || "FLAT",
      signal: upper(snapshot.signal || "N/D") || "N/D",
      trades: num(snapshot?.archive?.trades) ?? 0,
      last_action: String(snapshot?.session?.last_action || "N/D"),
      archive_net: num(snapshot?.archive?.net) ?? 0,
      observed_at: String(snapshot?.observed_at || snapshot?.created_at || "")
    };
  }

  function transitionEvent(prev, next, snapshot) {
    if (!next) return null;
    let kind = null;
    let detail = null;
    let level = "INFO";

    if (!prev) {
      kind = "TRADUS";
      detail = `TRADUS PAPER relié à Aether · ${next.side} · signal ${next.signal} · archive ${next.trades}`;
    } else if (prev.side === "FLAT" && next.side !== "FLAT") {
      kind = "TRADUS OPEN";
      level = "PAPER";
      detail = `${next.side} PAPER ouvert · ${next.last_action}`;
    } else if (prev.side !== "FLAT" && next.side === "FLAT") {
      kind = "TRADUS CLOSE";
      level = "PAPER";
      detail = `Position ${prev.side} PAPER clôturée · ${next.last_action} · archive ${next.trades} · net ${money(next.archive_net)}`;
    } else if (next.trades > prev.trades) {
      kind = "TRADUS CLOSE";
      level = "PAPER";
      detail = `Trade PAPER archivé · ${next.last_action} · ${next.trades} trade(s) · net ${money(next.archive_net)}`;
    } else if (prev.signal !== next.signal) {
      kind = "TRADUS SIGNAL";
      level = next.signal === "NO_TRADE" ? "WAIT" : "PAPER";
      detail = `Signal ${prev.signal} → ${next.signal} · ${next.side}`;
    }

    if (!kind) return null;
    return Object.freeze({
      at: Date.now(),
      type: kind,
      level,
      detail,
      side: next.side,
      signal: next.signal,
      archive_trades: next.trades,
      observed_at: next.observed_at,
      source_build: SOURCE_BUILD,
      bridge_build: BUILD,
      paper_only: true,
      real_orders: false
    });
  }

  function capture(snapshot) {
    const next = meaningful(snapshot);
    const event = transitionEvent(previousMeaningful, next, snapshot);
    previousMeaningful = next;
    if (event) {
      const last = events[0];
      const duplicate = last && last.type === event.type && last.detail === event.detail;
      if (!duplicate) {
        events.unshift(event);
        if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
      }
    }
    return event;
  }

  function ensureStyle() {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${PILL_ID}{
        display:inline-flex;align-items:center;min-width:0;max-width:18cqw;padding:.28cqw .52cqw;
        border:1px solid rgba(113,236,255,.22);border-radius:999px;background:rgba(1,11,23,.62);
        color:#dff8ff;font:800 clamp(8px,.43cqw,9px)/1 ui-sans-serif,system-ui;white-space:nowrap;
        overflow:hidden;text-overflow:ellipsis;pointer-events:auto;cursor:default;
      }
      #${PILL_ID}[data-tone="long"]{color:#78ffd2;border-color:rgba(92,255,207,.36)}
      #${PILL_ID}[data-tone="short"]{color:#ff9ba6;border-color:rgba(255,122,143,.36)}
      #${PILL_ID}[data-tone="wait"]{color:#ffe09a;border-color:rgba(255,210,103,.28)}
      #${WORKBENCH_ROOT_ID} .aether-tradus-bridge-406069{margin-top:16px;padding-top:14px;border-top:1px solid rgba(103,232,255,.16)}
      #${WORKBENCH_ROOT_ID} .aether-tradus-bridge-406069 h4{margin:0 0 10px;color:#75edff;font-size:12px;letter-spacing:.13em;text-transform:uppercase}
      #${WORKBENCH_ROOT_ID} .aether-tradus-bridge-406069 .atb69-summary{margin:0 0 10px;color:#eff9fc;font-size:14px;line-height:1.55;font-weight:650}
      #${WORKBENCH_ROOT_ID} .aether-tradus-bridge-406069 .atb69-meta{color:#91adbd;font-size:11px;line-height:1.45}
      #${WORKBENCH_ROOT_ID} .aether-tradus-bridge-406069 .atb69-list{display:grid;gap:8px;margin-top:10px}
      #${WORKBENCH_ROOT_ID} .aether-tradus-bridge-406069 .atb69-row{display:grid;grid-template-columns:86px 116px 80px minmax(0,1fr);gap:10px;padding:10px 12px;border:1px solid rgba(85,203,232,.18);border-radius:10px;background:rgba(5,26,40,.52);font-size:12px;line-height:1.4}
      #${WORKBENCH_ROOT_ID} .aether-tradus-bridge-406069 .atb69-row time{color:#8be5ff;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
      #${WORKBENCH_ROOT_ID} .aether-tradus-bridge-406069 .atb69-row b{color:#e8f8ff}
      #${WORKBENCH_ROOT_ID} .aether-tradus-bridge-406069 .atb69-row span:nth-child(3){color:#ffd86d;font-weight:850}
      @media(max-width:980px){#${PILL_ID}{max-width:28cqw}#${WORKBENCH_ROOT_ID} .aether-tradus-bridge-406069 .atb69-row{grid-template-columns:72px 92px minmax(0,1fr)}#${WORKBENCH_ROOT_ID} .aether-tradus-bridge-406069 .atb69-row span:nth-child(3){display:none}}
    `;
    document.head.appendChild(style);
  }

  function stage() {
    return typeof document === "undefined" ? null : document.querySelector('[data-aether-component-stage-406046]');
  }

  function mountSurface(snapshot = lastSnapshot || sourceRead()) {
    if (typeof document === "undefined") return false;
    const host = stage();
    if (!host) return false;
    ensureStyle();
    const actions = host.querySelector(".aether46-actions");
    if (!actions) return false;
    let pill = document.getElementById(PILL_ID);
    if (!pill) {
      pill = document.createElement("span");
      pill.id = PILL_ID;
      pill.setAttribute("aria-label", "État TRADUS PAPER");
      actions.insertBefore(pill, actions.firstChild);
    }
    if (snapshot) {
      const vm = surfaceModel(snapshot);
      pill.textContent = vm.label;
      pill.title = vm.title;
      pill.dataset.tone = vm.tone;
      host.dataset.tradusPaper406069 = vm.side || "N/D";
      host.dataset.tradusSignal406069 = vm.signal || "N/D";
      host.dataset.tradusArchiveTrades406069 = String(vm.trades ?? 0);
    } else {
      pill.textContent = "TRADUS · N/D";
      pill.title = "TRADUS PAPER indisponible";
      pill.dataset.tone = "muted";
    }
    return true;
  }

  function workbenchMode(root) {
    const title = upper(root?.querySelector(".awb-title")?.textContent || "");
    if (title.includes("DÉTAIL")) return "details";
    if (title.includes("HISTOR")) return "history";
    return "events";
  }

  function makeDetailsBlock(snapshot) {
    const block = document.createElement("section");
    block.className = "aether-tradus-bridge-406069";
    block.dataset.aetherTradusWorkbench406069 = "details";
    const vm = surfaceModel(snapshot);
    const age = num(snapshot?.observation_age_seconds);
    block.innerHTML = `
      <h4>TRADUS PAPER · ÉVALUATION</h4>
      <p class="atb69-summary"></p>
      <div class="atb69-meta"></div>`;
    block.querySelector(".atb69-summary").textContent = `${vm.side || "N/D"} · signal ${vm.signal || "N/D"} · équité si clôture ${money(vm.equity)} · archive ${vm.trades || 0} trade(s) · net archive ${money(snapshot?.archive?.net)}.`;
    block.querySelector(".atb69-meta").textContent = `Observation ${age === null ? "N/D" : `${age.toFixed(1)} s`} · imbalance ${pct(snapshot?.imbalance)} · spread ${pct(snapshot?.spread_ratio)} · drawdown archive ${money(snapshot?.archive?.max_drawdown)} · PAPER ONLY.`;
    return block;
  }

  function makeHistoryBlock(snapshot) {
    const block = document.createElement("section");
    block.className = "aether-tradus-bridge-406069";
    block.dataset.aetherTradusWorkbench406069 = "history";
    const title = document.createElement("h4");
    title.textContent = "TRADUS PAPER · ÉVÉNEMENTS AETHER";
    block.appendChild(title);
    const meta = document.createElement("div");
    meta.className = "atb69-meta";
    meta.textContent = `Mémoire session du pont Aether · ${events.length}/${MAX_EVENTS} événement(s) significatif(s) · archive PAPER durable ${num(snapshot?.archive?.trades) ?? 0} trade(s).`;
    block.appendChild(meta);
    const list = document.createElement("div");
    list.className = "atb69-list";
    const rows = events.slice(0, 8);
    if (!rows.length) {
      const empty = document.createElement("div");
      empty.className = "atb69-meta";
      empty.textContent = "Aucun changement TRADUS significatif depuis l’activation du pont Aether.";
      list.appendChild(empty);
    } else {
      for (const entry of rows) {
        const row = document.createElement("div");
        row.className = "atb69-row";
        const time = document.createElement("time");
        time.textContent = new Date(entry.at).toLocaleTimeString("fr-FR", {hour:"2-digit", minute:"2-digit", second:"2-digit"});
        const type = document.createElement("b"); type.textContent = entry.type;
        const level = document.createElement("span"); level.textContent = entry.level;
        const detail = document.createElement("span"); detail.textContent = entry.detail;
        row.append(time, type, level, detail);
        list.appendChild(row);
      }
    }
    block.appendChild(list);
    return block;
  }

  function decorateWorkbench() {
    if (typeof document === "undefined" || decorating) return false;
    const root = document.getElementById(WORKBENCH_ROOT_ID);
    const body = root?.querySelector(".awb-body");
    if (!root || !body || root.hidden) return false;
    decorating = true;
    try {
      body.querySelectorAll("[data-aether-tradus-workbench-406069]").forEach(node => node.remove());
      const snapshot = lastSnapshot || sourceRead();
      if (!snapshot) return false;
      const mode = workbenchMode(root);
      body.appendChild(mode === "details" ? makeDetailsBlock(snapshot) : makeHistoryBlock(snapshot));
      return true;
    } finally { decorating = false; }
  }

  function bindWorkbench(root = document.getElementById(WORKBENCH_ROOT_ID)) {
    if (!root) return false;
    const body = root.querySelector(".awb-body");
    if (!body) return false;
    if (!workbenchObserver && typeof MutationObserver !== "undefined") {
      workbenchObserver = new MutationObserver(mutations => {
        if (decorating) return;
        const external = mutations.some(m => Array.from(m.addedNodes || []).some(n => !(n instanceof Element) || !n.matches?.("[data-aether-tradus-workbench-406069]")));
        if (external) queueMicrotask(decorateWorkbench);
      });
      workbenchObserver.observe(body, {childList:true});
    }
    root.addEventListener("click", event => {
      if (event.target?.closest?.("[data-awb-mode]")) requestAnimationFrame(() => decorateWorkbench());
    }, {capture:true});
    queueMicrotask(decorateWorkbench);
    return true;
  }

  function watchWorkbenchRoot() {
    if (typeof document === "undefined" || typeof MutationObserver === "undefined" || rootObserver) return;
    const existing = document.getElementById(WORKBENCH_ROOT_ID);
    if (existing) { bindWorkbench(existing); return; }
    rootObserver = new MutationObserver(() => {
      const root = document.getElementById(WORKBENCH_ROOT_ID);
      if (!root) return;
      rootObserver.disconnect(); rootObserver = null;
      bindWorkbench(root);
    });
    rootObserver.observe(document.documentElement, {childList:true, subtree:true});
  }

  function publish(snapshot, source = "event") {
    const next = snapshot || sourceRead();
    if (!next) return null;
    lastSnapshot = clone(next);
    capture(lastSnapshot);
    mountSurface(lastSnapshot);
    decorateWorkbench();
    return Object.freeze({ build:BUILD, source, surface:surfaceModel(lastSnapshot), events:events.length, snapshot:clone(lastSnapshot) });
  }

  function selfTest() {
    const mk = (side, signal, trades, equity = 1000, net = 0, lastAction = "TEST") => ({
      side, signal, observation_age_seconds:1.5, imbalance:0.3, spread_ratio:0.0001,
      session:{balance_after_realized_and_entry_fees:1000,last_action:lastAction},
      mark:side === "FLAT" ? null : {equity_if_close:equity},
      archive:{trades,net,max_drawdown:0.2}
    });
    const flat = mk("FLAT","NO_TRADE",0);
    const opened = mk("LONG","BUY",0,999.9,0,"OUVERTURE LONG PAPER");
    const closed = mk("FLAT","NO_TRADE",1,1000,0.35,"CLÔTURE LONG · EDGE_DISPARU");
    const vmFlat = surfaceModel(flat);
    const vmOpen = surfaceModel(opened);
    const eOpen = transitionEvent(meaningful(flat), meaningful(opened), opened);
    const eClose = transitionEvent(meaningful(opened), meaningful(closed), closed);
    const pass = vmFlat.label.includes("FLAT") && vmOpen.label.includes("LONG PAPER") && eOpen?.type === "TRADUS OPEN" && eClose?.type === "TRADUS CLOSE";
    return Object.freeze({ build:BUILD, pass, checks:{flat:vmFlat.label, open:vmOpen.label, open_event:eOpen?.type, close_event:eClose?.type}, paper_only:true, real_orders:false, network_owner:false, recurring_timer:false, durable_storage:false });
  }

  const api = Object.freeze({
    build:BUILD, source_build:SOURCE_BUILD, snapshot_event:SNAPSHOT_EVENT,
    read:()=>clone(lastSnapshot), events:()=>clone(events), publish, mount_surface:mountSurface,
    decorate_workbench:decorateWorkbench, self_test:selfTest,
    paper_only:true, real_orders:false, credentials:false, wallet:false,
    strategy_a_mutated:false, aether_truth_mutated:false, aether_geometry_owner:false,
    network_owner:false, recurring_timer:false, durable_storage:false
  });
  globalThis.AgentCryptoAetherTradusBridge406069 = api;

  if (typeof document !== "undefined") {
    document.addEventListener(SNAPSHOT_EVENT, event => queueMicrotask(() => publish(event?.detail, "tradus_snapshot")));
    document.addEventListener("click", event => {
      const target = event.target?.closest?.("#atlasAetherStatusToggle4084,[data-aether46-open],[data-aether-card-406046=\"events\"]");
      if (!target) return;
      requestAnimationFrame(() => { mountSurface(); watchWorkbenchRoot(); decorateWorkbench(); });
    }, {capture:true});
    const boot = () => {
      const current = sourceRead();
      if (current) publish(current, "boot_read");
      mountSurface(current);
      watchWorkbenchRoot();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true}); else boot();
    window.addEventListener("pageshow", () => { mountSurface(); decorateWorkbench(); });
  }
})();
