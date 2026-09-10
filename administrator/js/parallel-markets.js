(() => {
  "use strict";

  const BUILD = "40.4.247";
  const DEPTH_LEVEL = 203;
  const ACTIVE = new Set(["indices", "energy", "cross-market"]);
  const ENABLE_MATH = true;
  const PERIODS = Object.freeze(["24h", "7j", "30j", "60j", "90j", "1a"]);
  const LONG_PERIODS = Object.freeze(["5a", "10a", "max"]);
  const CONFIG = Object.freeze({
    indices: Object.freeze({ label: "INDICES", title: "Indices / Bourse", path: "../data/indices/market.json", historyBase: "../data/indices/history", expected: 5, accent: "#aa91ee", source: "Yahoo Finance", defaultPeriod: "1a", depthAt: 190 }),
    energy: Object.freeze({ label: "ÉNERGIE", title: "Énergie & matières premières", path: "../data/energy/market.json", historyBase: "../data/energy/history", expected: 3, accent: "#e79b57", source: "Yahoo Finance", defaultPeriod: "1a", depthAt: 191 }),
    "cross-market": Object.freeze({ label: "CROSS", title: "Cross-Market Observatory", path: "../data/cross_market/market.json", historyBase: "../data/cross_market/history", expected: 5, accent: "#dce5ec", source: "Archives canoniques", defaultPeriod: "90j", base100Only: true, depthAt: 192 }),
  });
  const COLORS = Object.freeze(["#ffd35b", "#72d8ff", "#89f4d1", "#cf93f4", "#ff8b5c", "#e5edf4"]);
  const state = { current: "crypto", data: new Map(), period: new Map(), load: new Map(), history: new Map(), historyLoad: new Map(), selected: new Map(), color: new Map(), hover: {series:[], geometry:null, period:"", domain:""}, canvasHostReady: false };

  const byId = id => document.getElementById(id);
  const safeText = v => String(v ?? "");
  const finite = v => Number.isFinite(Number(v)) ? Number(v) : null;
  const esc = v => safeText(v).replace(/[&<>"\']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const pct = v => Number.isFinite(v) ? `${v >= 0 ? "+" : ""}${v.toFixed(2)} %` : "—";
  const num = (v, digits=2) => Number.isFinite(v) ? v.toLocaleString("fr-FR", {maximumFractionDigits:digits}) : "—";
  const dateText = value => {
    if (!value) return "—";
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d.toLocaleString("fr-FR", {year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}) : safeText(value);
  };

  function assetIdentity(asset) {
    return safeText(asset?.asset_id || asset?.symbol || asset?.provider_symbol || asset?.name).trim().toLowerCase();
  }

  function assetColorKey(domain, asset) {
    return `${safeText(domain).trim().toLowerCase()}:${assetIdentity(asset)}`;
  }

  function registerAssetColors(domain, payload) {
    if (!Array.isArray(payload?.assets)) return;
    payload.assets.forEach((asset, index) => {
      const key = assetColorKey(domain, asset);
      if (!key.endsWith(":")) state.color.set(key, COLORS[index % COLORS.length]);
    });
  }

  function colorForAsset(domain, asset, fallbackIndex=0) {
    const key = assetColorKey(domain, asset);
    if (state.color.has(key)) return state.color.get(key);
    const color = COLORS[Math.max(0, Number(fallbackIndex) || 0) % COLORS.length];
    if (!key.endsWith(":")) state.color.set(key, color);
    return color;
  }

  function pointTimeMs(point) {
    const ms = new Date(point?.time).getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  function nearestObservedPoint(points, targetTime) {
    let best = null, delta = Infinity;
    for (const point of points || []) {
      const ms = pointTimeMs(point);
      if (ms === null) continue;
      const d = Math.abs(ms - targetTime);
      if (d < delta) { best = point; delta = d; }
    }
    return best;
  }

  function emptyCanvasOverlay() {
    const overlay = stage()?.querySelector?.("[data-parallel-overlay]");
    if (!overlay) return;
    overlay.replaceChildren();
    overlay.removeAttribute("style");
  }

  /* 40.4.237 — permanent pinned values table retired.
     The graph owns curves + pointer inspection only; numeric context remains
     in the right rail. Leaving the canvas clears the inspection overlay. */
  function clearCanvasHover() {
    emptyCanvasOverlay();
  }

  function renderCanvasHover(event) {
    const canvas = byId("atlasParallelLiveCanvas404170");
    const overlay = stage()?.querySelector?.("[data-parallel-overlay]");
    const model = state.hover;
    const g = model?.geometry;
    if (!canvas || !overlay || !g || !model.series?.length || !ACTIVE.has(model.domain)) return clearCanvasHover();
    const rect = canvas.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    if (px < g.pad.l || px > g.width-g.pad.r || py < g.pad.t || py > g.height-g.pad.b) return clearCanvasHover();
    const ratio = Math.max(0, Math.min(1, (px-g.pad.l)/Math.max(1,g.w)));
    const targetTime = g.timeMin + ratio*Math.max(1,g.timeMax-g.timeMin);
    const rows = model.series.map((series,index) => {
      const point = nearestObservedPoint(series.points,targetTime);
      if (!point) return null;
      const ms = pointTimeMs(point);
      const x = ms !== null && g.timeMax > g.timeMin
        ? g.pad.l + ((ms-g.timeMin)/(g.timeMax-g.timeMin))*g.w
        : g.pad.l + ratio*g.w;
      const y = g.pad.t + (1-((point.value-g.min)/(g.max-g.min)))*g.h;
      const unit = safeText(series.asset?.currency || series.asset?.unit || "");
      return {series,index,point,ms,x,y,unit,change:point.value-100};
    }).filter(Boolean);
    if (!rows.length) return clearCanvasHover();

    const cardWidth = Math.min(360, Math.max(300, g.width*.32));
    const cardLeft = px > g.width*.62
      ? Math.max(12, px-cardWidth-18)
      : Math.min(g.width-cardWidth-12, px+18);
    const cardTop = Math.max(12, Math.min(g.height-250, py-84));
    const markers = rows.map(row => `<span style="position:absolute;left:${Math.round(row.x-4)}px;top:${Math.round(row.y-4)}px;width:8px;height:8px;border:2px solid ${row.series.color};border-radius:50%;background:#07111c;box-shadow:0 0 8px ${row.series.color};box-sizing:border-box"></span>`).join("");
    const items = rows.map(row => {
      const symbol = safeText(row.series.asset?.symbol || row.series.asset?.name || "ACTIF");
      const name = safeText(row.series.asset?.name || row.series.asset?.label || symbol);
      const observed = row.ms === null ? "—" : new Date(row.ms).toLocaleString("fr-FR", model.period === "24h" ? {day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"} : {day:"2-digit",month:"2-digit",year:"numeric"});
      return `<div style="display:grid;grid-template-columns:12px minmax(72px,1fr) minmax(86px,auto) minmax(62px,auto);gap:7px;align-items:center;padding:5px 0;border-top:1px solid rgba(255,255,255,.065)">
        <i style="width:8px;height:8px;border-radius:50%;background:${row.series.color};box-shadow:0 0 7px ${row.series.color}"></i>
        <span style="display:grid;min-width:0"><b style="color:#eef6fa;font-size:10px">${esc(symbol)}</b><small style="color:#7993a5;font-size:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(name)} · ${esc(observed)}</small></span>
        <strong style="color:#e8f0f5;font-size:10px;text-align:right">${num(row.point.raw,4)}${row.unit?` ${esc(row.unit)}`:""}</strong>
        <em style="font-style:normal;color:${row.change>=0?"#9df0c9":"#ff9eaa"};font-size:9px;font-weight:900;text-align:right">${pct(row.change)}</em>
      </div>`;
    }).join("");

    overlay.style.cssText = "position:absolute;inset:0;z-index:6;pointer-events:none;color:#dbe8ef;font-family:system-ui,sans-serif";
    overlay.innerHTML = `<span style="position:absolute;left:${Math.round(px)}px;top:${g.pad.t}px;bottom:${g.pad.b}px;width:1px;background:rgba(210,232,242,.34);box-shadow:0 0 8px rgba(210,232,242,.15)"></span>${markers}
      <section style="position:absolute;left:${Math.round(cardLeft)}px;top:${Math.round(cardTop)}px;width:${Math.round(cardWidth)}px;padding:10px 11px 8px;border:1px solid rgba(104,218,236,.34);border-radius:12px;background:linear-gradient(150deg,rgba(4,14,24,.97),rgba(5,22,31,.95));box-shadow:0 14px 34px rgba(0,0,0,.42),inset 0 0 0 1px rgba(255,255,255,.025);box-sizing:border-box">
        <header style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:5px"><span style="display:grid"><b style="font-size:11px;color:#fff0cc;letter-spacing:.04em">INSPECTION HISTORIQUE</b><small style="font-size:7px;color:#7994a6">${esc(CONFIG[model.domain]?.title || model.domain)} · Base 100</small></span><strong style="font-size:8px;color:#9dddea;white-space:nowrap">${esc(dateText(targetTime))}</strong></header>
        ${items}
        <footer style="display:flex;justify-content:space-between;gap:8px;margin-top:6px;padding-top:6px;border-top:1px solid rgba(104,218,236,.15);font-size:7px;color:#7895a7"><b style="color:#74e5ef">${esc(model.period.toUpperCase())}</b><span>point réel le plus proche par série · aucune interpolation</span></footer>
      </section>`;
  }

  function bindCanvasHover() {
    const canvas = byId("atlasParallelLiveCanvas404170");
    if (!canvas || canvas.dataset.parallelHoverBound === "1") return;
    canvas.dataset.parallelHoverBound = "1";
    canvas.addEventListener("pointermove", renderCanvasHover, {passive:true});
    canvas.addEventListener("pointerleave", clearCanvasHover, {passive:true});
  }

  function stage(){ return byId("atlasCyclicMarketInertStage404168"); }
  function toolbar(){ return byId("atlasCyclicMarketMirrorToolbar404168"); }
  function detail(){ return byId("atlasParallelDomainRailHost404189") || byId("atlasCyclicMarketInertDetail404168"); }

  function ensureShell() {
    const host = stage(), bar = toolbar(), rail = detail();
    if (!host || !bar || !rail) return false;
    if (!byId("atlasParallelLiveCanvas404170")) {
      host.innerHTML = `
        <div class="atlas-parallel-live-shell atlas-parallel-cockpit-404228" data-parallel-live-shell>
          <div class="atlas-parallel-live-heading">
            <div><small>ERITH.IA · MARKETS OBSERVATORY</small><h3 data-parallel-title>Marché</h3><p data-parallel-subtitle>Source Truth publique · observation uniquement.</p></div>
            <div class="atlas-parallel-live-badges"><span data-parallel-source>Source</span><span data-parallel-count>0/0</span></div>
          </div>
          <div class="atlas-parallel-live-stage">
            <canvas id="atlasParallelLiveCanvas404170" aria-label="Graphique marché parallèle"></canvas>
            <div class="atlas-parallel-live-overlay" data-parallel-overlay></div>
          </div>
          <div class="atlas-parallel-live-summary" data-parallel-summary>En attente du domaine.</div>
          <div class="atlas-parallel-live-legend" data-parallel-legend></div>
          <div class="atlas-parallel-memory-strip-404228"><span>ESPACE MÉMORISÉ</span><b data-parallel-memory>—</b><small>Source · période · couverture · choix locaux uniquement</small></div>
          <div class="atlas-parallel-truth-strip-404228"><b data-parallel-truth-title>MARCHÉ</b><span data-parallel-truth>Observation historique · aucune prévision</span></div>
        </div>`;
    }
    bindCanvasHover();
    if (bar.dataset.parallelToolbarBound !== "1") {
      bar.dataset.parallelToolbarBound = "1";
      bar.innerHTML = `
        <span class="mirror-group atlas-toolbar-view-404228" role="group" aria-label="Vue"><small>VUE</small><b class="active">Base 100</b></span>
        <span class="mirror-group atlas-toolbar-history-404246 atlas-parallel-history" role="group" aria-label="Historique long"><small>HISTORIQUE</small>${LONG_PERIODS.map(p => `<button type="button" data-parallel-long-period="${p}" title="Historique long chargé uniquement à la demande">${p === "max" ? "MAX" : p}</button>`).join("")}</span>
        <span class="mirror-group atlas-toolbar-inspection-404228" role="group" aria-label="Inspection"><small>INSPECTION</small><b class="active">Survol</b><span>Valeurs réelles</span></span>
        <span class="mirror-group atlas-toolbar-period-404228 atlas-parallel-periods" role="group" aria-label="Période standard"><small>PÉRIODE</small>${PERIODS.map(p => `<button type="button" data-parallel-period="${p}">${p}</button>`).join("")}</span>`;
      bar.addEventListener("click", event => {
        const button = event.target instanceof Element ? event.target.closest("[data-parallel-period]") : null;
        if (!button || !CONFIG[state.current] || !ACTIVE.has(state.current)) return;
        const period = button.getAttribute("data-parallel-period");
        if (!PERIODS.includes(period)) return;
        if (state.current === "cross-market" && period === "24h") return;
        state.period.set(state.current, period);
        render(state.current);
      });
      bar.addEventListener("click", async event => {
        const button = event.target instanceof Element ? event.target.closest("[data-parallel-long-period]") : null;
        if (!button || !CONFIG[state.current] || !ACTIVE.has(state.current)) return;
        const domain = state.current;
        const period = button.getAttribute("data-parallel-long-period");
        if (!LONG_PERIODS.includes(period) || !longDomainEnabled(domain)) return;
        button.dataset.historyLoading = "1";
        button.setAttribute("aria-busy", "true");
        try {
          await loadHistorical(domain, period);
          if (state.current !== domain) return;
          state.period.set(domain, period);
          render(domain);
        } catch (error) {
          button.title = `Historique indisponible : ${safeText(error?.message || error)}`;
          state.period.set(domain, CONFIG[domain].defaultPeriod);
          render(domain);
        } finally {
          delete button.dataset.historyLoading;
          button.removeAttribute("aria-busy");
        }
      });
    }
    if (rail.dataset.parallelRailBound !== "1") {
      rail.dataset.parallelRailBound = "1";
      rail.addEventListener("click", event => {
        const button = event.target instanceof Element ? event.target.closest("[data-parallel-asset]") : null;
        if (!button || !CONFIG[state.current] || DEPTH_LEVEL < CONFIG[state.current].depthAt) return;
        const id = button.getAttribute("data-parallel-asset");
        if (!id) return;
        state.selected.set(state.current, id);
        render(state.current);
      });
    }
    state.canvasHostReady = true;
    return true;
  }

  function setStatus(domain, cfg, payload) {
    const live = byId("liveStatus"), metals = byId("atlasMetalsLiveStatus");
    if (domain === "crypto") {
      if (live) live.hidden = false;
      if (metals) metals.hidden = true;
      return;
    }
    if (domain === "metals") return;
    if (live) live.hidden = true;
    if (metals) {
      metals.hidden = false;
      metals.textContent = `${cfg.title} · Public ${payload?.assets_count ?? 0}/${cfg.expected}`;
      metals.classList.toggle("ok", Number(payload?.assets_count) === cfg.expected);
      metals.classList.toggle("warn", Number(payload?.assets_count) !== cfg.expected);
    }
  }

  function loadDomain(domain) {
    if (state.data.has(domain)) return Promise.resolve(state.data.get(domain));
    if (state.load.has(domain)) return state.load.get(domain);
    const cfg = CONFIG[domain];
    if (!cfg || !ACTIVE.has(domain)) return Promise.resolve(null);
    const promise = fetch(cfg.path + `?v=${encodeURIComponent(BUILD)}`, { cache: "no-store", credentials: "same-origin" })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(payload => {
        if (!payload || payload.status !== "ready" || !Array.isArray(payload.assets)) throw new Error("archive non READY");
        registerAssetColors(domain, payload);
        state.data.set(domain, payload);
        return payload;
      })
      .finally(() => state.load.delete(domain));
    state.load.set(domain, promise);
    return promise;
  }

  function historyKey(domain, period) { return `${domain}:${period}`; }
  function isLongPeriod(period) { return LONG_PERIODS.includes(period); }
  function longDomainEnabled(domain) { return domain === "indices" || domain === "energy" || (DEPTH_LEVEL >= 202 && domain === "cross-market"); }

  function loadHistorical(domain, period) {
    const cfg = CONFIG[domain];
    if (!cfg?.historyBase || !longDomainEnabled(domain) || !isLongPeriod(period)) return Promise.reject(new Error("historique long non activé pour ce domaine"));
    const key = historyKey(domain, period);
    if (state.history.has(key)) return Promise.resolve(state.history.get(key));
    if (state.historyLoad.has(key)) return state.historyLoad.get(key);
    const expectedSchema = domain === "cross-market"
      ? "agent_crypto_cross_historical_depth_v1"
      : domain === "energy"
        ? "agent_crypto_commodity_historical_depth_v1"
        : "agent_crypto_historical_depth_v1";
    const promise = fetch(`${cfg.historyBase}/${period}.json?v=${encodeURIComponent(BUILD)}`, { cache:"no-store", credentials:"same-origin" })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(payload => {
        if (!payload || payload.status !== "ready" || payload.schema !== expectedSchema || !Array.isArray(payload.assets)) throw new Error("archive historique non READY");
        if (payload.domain !== domain || payload.horizon !== period || payload.integrity?.lazy_browser_load_required !== true || payload.integrity?.boot_payload_forbidden !== true) throw new Error("contrat lazy historique invalide");
        if (domain === "energy" && (payload.integrity?.future_continuous_only !== true || payload.integrity?.spot_semantics_forbidden !== true)) throw new Error("contrat Futures historique invalide");
        state.history.set(key, payload);
        return payload;
      })
      .finally(() => state.historyLoad.delete(key));
    state.historyLoad.set(key, promise);
    return promise;
  }

  function payloadForPeriod(domain, period) {
    if (isLongPeriod(period)) return state.history.get(historyKey(domain, period)) || null;
    return state.data.get(domain) || null;
  }

  function periodDays(period) {
    return period === "7j" ? 7 : period === "30j" ? 30 : period === "60j" ? 60 : period === "90j" ? 90 : period === "1a" ? 370 : 1;
  }

  function pickSeries(asset, period, cross) {
    if (isLongPeriod(period)) return (asset.history_points || []).map(p => ({ time:p.time || p.date, close:finite(p.close), volume:finite(p.volume), high:finite(p.high), low:finite(p.low), open:finite(p.open) })).filter(p => p.close !== null && p.time);
    if (period === "24h" && !cross) return (asset.intraday_24h || []).map(p => ({ time:p.time, close:finite(p.close), volume:finite(p.volume) })).filter(p => p.close !== null);
    const rows = (asset.daily || []).map(p => ({ time:p.time || p.date, close:finite(p.close), volume:finite(p.volume), high:finite(p.high), low:finite(p.low), open:finite(p.open) })).filter(p => p.close !== null && p.time);
    if (!rows.length) return [];
    const last = new Date(rows[rows.length - 1].time).getTime();
    const cutoff = last - periodDays(period) * 86400000;
    return rows.filter(p => new Date(p.time).getTime() >= cutoff);
  }

  function normalize(rows) {
    if (!rows.length || !rows[0].close) return [];
    const base = rows[0].close;
    return rows.map(p => ({ time:p.time, value:(p.close / base) * 100, raw:p.close }));
  }

  function metrics(rows) {
    if (rows.length < 2) return { change:null, volatility:null, drawdown:null, amplitude:null };
    const first = rows[0].close, last = rows[rows.length - 1].close;
    const change = first ? ((last / first) - 1) * 100 : null;
    const returns = [];
    let peak = rows[0].close, maxDd = 0, low = rows[0].close, high = rows[0].close;
    for (let i=1;i<rows.length;i++) {
      const prev = rows[i-1].close, cur = rows[i].close;
      if (prev && cur) returns.push(((cur / prev) - 1) * 100);
      if (cur > peak) peak = cur;
      if (cur < low) low = cur;
      if (cur > high) high = cur;
      if (peak > 0) maxDd = Math.min(maxDd, ((cur / peak) - 1) * 100);
    }
    let volatility = null;
    if (returns.length > 1) {
      const mean = returns.reduce((a,b)=>a+b,0) / returns.length;
      volatility = Math.sqrt(returns.reduce((a,b)=>a + Math.pow(b-mean,2),0) / (returns.length-1));
    }
    const amplitude = low ? ((high / low) - 1) * 100 : null;
    return { change, volatility, drawdown:maxDd, amplitude };
  }

  function drawCanvas(series, period, accent) {
    const canvas = byId("atlasParallelLiveCanvas404170");
    if (!canvas) return;
    clearCanvasHover();
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(640, Math.round(rect.width || canvas.parentElement?.clientWidth || 980));
    const height = Math.max(340, Math.round(rect.height || canvas.parentElement?.clientHeight || 470));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,width,height);

    /* 40.4.234 — Crypto plot language only. Geometry and data semantics stay unchanged. */
    const pad = {l:62,r:24,t:24,b:42}, w = width-pad.l-pad.r, h=height-pad.t-pad.b;
    const bg = ctx.createLinearGradient(0,0,0,height);
    bg.addColorStop(0,"rgba(1,7,14,.54)");
    bg.addColorStop(1,"rgba(1,10,17,.38)");
    ctx.fillStyle = bg; ctx.fillRect(0,0,width,height);
    ctx.strokeStyle = "rgba(153,190,211,.14)"; ctx.lineWidth = 1;
    for (let i=0;i<=5;i++){
      const y=pad.t+(h/5)*i;
      ctx.save();
      ctx.strokeStyle = i===0 || i===5 ? "rgba(153,190,211,.17)" : "rgba(153,190,211,.11)";
      ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke();ctx.restore();
    }
    for (let i=0;i<=6;i++){
      const x=pad.l+(w/6)*i;
      ctx.save();
      ctx.strokeStyle = i===0 || i===6 ? "rgba(153,190,211,.17)" : "rgba(153,190,211,.09)";
      ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,height-pad.b);ctx.stroke();ctx.restore();
    }
    ctx.save();
    ctx.strokeStyle="rgba(208,229,239,.13)";
    ctx.strokeRect(pad.l+.5,pad.t+.5,Math.max(0,w-1),Math.max(0,h-1));
    ctx.restore();

    const all = series.flatMap(s => s.points.map(p => p.value));
    let min = Math.min(100,...all), max = Math.max(100,...all); if (!Number.isFinite(min)||!Number.isFinite(max)) return;
    const span = Math.max(.4,max-min); const visualPad = Math.max(.18,span*.10); min -= visualPad; max += visualPad;
    const times = series.flatMap(s => s.points.map(pointTimeMs).filter(Number.isFinite));
    const timeMin = times.length ? Math.min(...times) : 0;
    const timeMax = times.length ? Math.max(...times) : 1;
    const timeSpan = Math.max(1,timeMax-timeMin);
    const xFor = (point,index,count) => {
      const ms = pointTimeMs(point);
      return ms !== null ? pad.l + ((ms-timeMin)/timeSpan)*w : pad.l + (index/Math.max(1,count-1))*w;
    };

    ctx.font = "700 10px system-ui"; ctx.fillStyle = "rgba(205,222,232,.76)"; ctx.textAlign = "right";
    for (let i=0;i<=5;i++){ const v=max-(max-min)*(i/5); ctx.fillText(v.toFixed(1),pad.l-9,pad.t+(h/5)*i+4); }

    if (100>=min && 100<=max) {
      const y100=pad.t+(1-((100-min)/(max-min)))*h;
      ctx.save();
      const band=ctx.createLinearGradient(0,y100-8,0,y100+8);
      band.addColorStop(0,"rgba(238,214,142,0)");band.addColorStop(.5,"rgba(238,214,142,.055)");band.addColorStop(1,"rgba(238,214,142,0)");
      ctx.fillStyle=band;ctx.fillRect(pad.l,y100-8,w,16);
      ctx.setLineDash([6,5]); ctx.strokeStyle="rgba(244,218,145,.48)"; ctx.lineWidth=1.15;
      ctx.beginPath(); ctx.moveTo(pad.l,y100); ctx.lineTo(width-pad.r,y100); ctx.stroke(); ctx.setLineDash([]);
      ctx.textAlign="left"; ctx.fillStyle="rgba(255,234,170,.90)"; ctx.font="900 9px system-ui";
      ctx.fillText("BASE 100",pad.l+7,Math.max(pad.t+10,y100-9)); ctx.restore();
    }

    series.forEach((s, idx) => {
      if (s.points.length < 2) return;
      const color = s.color || COLORS[idx % COLORS.length];
      const trace = () => {
        ctx.beginPath();
        s.points.forEach((p,i) => {
          const x = xFor(p,i,s.points.length);
          const y = pad.t + (1 - ((p.value-min)/(max-min)))*h;
          if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        });
      };
      ctx.save();
      ctx.globalAlpha=.16;ctx.strokeStyle=color;ctx.lineWidth=5.2;ctx.shadowColor=color;ctx.shadowBlur=8;trace();ctx.stroke();ctx.restore();
      ctx.save();
      ctx.strokeStyle=color;ctx.lineWidth=idx===0?2.7:2.25;ctx.lineJoin="round";ctx.lineCap="round";ctx.shadowColor=color;ctx.shadowBlur=2.8;trace();ctx.stroke();ctx.restore();
      const last=s.points[s.points.length-1], x=xFor(last,s.points.length-1,s.points.length), y=pad.t+(1-((last.value-min)/(max-min)))*h;
      ctx.save();ctx.strokeStyle=color;ctx.globalAlpha=.55;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,5.2,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(x,y,3.2,0,Math.PI*2);ctx.fill();ctx.restore();
    });

    ctx.font = "9px system-ui"; ctx.fillStyle = "rgba(176,199,213,.67)";
    [0,.2,.4,.6,.8,1].forEach((ratio,index) => {
      const stamp = timeMin + timeSpan*ratio;
      const d = new Date(stamp);
      const label = period === "24h" ? d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) : d.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year: period==="7j"||period==="30j" ? undefined : "2-digit"});
      ctx.textAlign = index===0 ? "left" : index===5 ? "right" : "center";
      ctx.fillText(label,pad.l+w*ratio,height-20);
    });
    ctx.textAlign = "left"; ctx.fillStyle = accent || "#dce5ec"; ctx.font = "900 9px system-ui"; ctx.fillText(`BASE 100 · ${period.toUpperCase()} · HISTORIQUE RÉEL`, pad.l, height-7);
    ctx.textAlign = "right"; ctx.fillStyle = "rgba(143,170,186,.82)"; ctx.font = "800 8px system-ui"; ctx.fillText("SURVOL = POINT RÉEL LE PLUS PROCHE", width-pad.r, height-7);
    state.hover = {series,period,domain:state.current,geometry:{pad,w,h,width,height,min,max,timeMin,timeMax}};
  }

  function latestValue(asset, rows) {
    const current = finite(asset?.current?.price);
    if (current !== null) return current;
    return finite(rows?.[rows.length - 1]?.close);
  }

  function horizonSnapshot(payload, domain, period) {
    const values = payload.assets.map(asset => {
      const rows = pickSeries(asset, period, domain === "cross-market");
      return { asset, rows, metric: metrics(rows) };
    }).filter(x => x.rows.length >= 2 && x.metric.change !== null);
    values.sort((a,b) => b.metric.change - a.metric.change);
    const leader = values[0], laggard = values[values.length - 1];
    const up = values.filter(x => x.metric.change > .05).length;
    const down = values.filter(x => x.metric.change < -.05).length;
    return {
      count: values.length, leader, laggard, up, down, flat: values.length-up-down,
      dispersion: leader && laggard ? leader.metric.change-laggard.metric.change : null,
      worstDrawdown: values.length ? Math.min(...values.map(x => x.metric.drawdown ?? 0)) : null,
      maxVolatility: values.length ? Math.max(...values.map(x => x.metric.volatility ?? 0)) : null,
    };
  }

  function horizonCards(payload, domain) {
    return ["7j","30j","90j","1a"].map(period => {
      const snap = horizonSnapshot(payload, domain, period);
      const l = snap.leader, r = snap.laggard;
      return `<div class="parallel-depth-horizon"><b>${period}</b><span>${l ? `${esc(l.asset.symbol||l.asset.name)} ${pct(l.metric.change)}` : "—"}</span><small>retard ${r ? `${esc(r.asset.symbol||r.asset.name)} ${pct(r.metric.change)}` : "—"} · écart ${num(snap.dispersion)} pt</small></div>`;
    }).join("");
  }

  function selectedAsset(domain, rowsByAsset) {
    const selectedId = state.selected.get(domain);
    return rowsByAsset.find(x => safeText(x.asset.asset_id || x.asset.symbol) === selectedId) || rowsByAsset[0] || null;
  }

  function selectedSheet(domain, selected, metricByAsset) {
    if (!selected) return "";
    const { asset, rows } = selected;
    const id = safeText(asset.asset_id || asset.symbol);
    state.selected.set(domain, id);
    const metric = metricByAsset.find(x => x.asset === asset)?.metric || metrics(rows);
    const last = latestValue(asset, rows);
    const latestRow = rows[rows.length - 1] || {};
    const unit = safeText(asset.currency || asset.unit || "");
    return `<section class="parallel-depth-sheet" style="--asset-color:${selected.color || CONFIG[domain]?.accent || "#dce5ec"}">
      <b>Fiche actif · ${esc(asset.name || asset.symbol)}</b>
      <div class="parallel-depth-grid">
        <span><small>Symbole</small><strong>${esc(asset.symbol || "—")}</strong></span>
        <span><small>Dernier</small><strong>${num(last,4)} ${esc(unit)}</strong></span>
        <span><small>Fenêtre</small><strong>${pct(metric.change)}</strong></span>
        <span><small>Volatilité / séance</small><strong>${pct(metric.volatility)}</strong></span>
        <span><small>Drawdown max</small><strong>${pct(metric.drawdown)}</strong></span>
        <span><small>Amplitude</small><strong>${pct(metric.amplitude)}</strong></span>
        <span><small>Points</small><strong>${rows.length}</strong></span>
        <span><small>Dernier relevé</small><strong>${esc(dateText(latestRow.time))}</strong></span>
      </div>
    </section>`;
  }

  function indicesDepth(payload, rowsByAsset, metricByAsset) {
    const activePeriod = state.period.get("indices") || "1a";
    if (isLongPeriod(activePeriod) && payload?.schema === "agent_crypto_historical_depth_v1") {
      const selected = selectedAsset("indices", rowsByAsset);
      const counts = rowsByAsset.map(x => x.rows.length).filter(Number.isFinite);
      const starts = rowsByAsset.map(x => x.rows[0]?.time).filter(Boolean).sort();
      const ends = rowsByAsset.map(x => x.rows[x.rows.length-1]?.time).filter(Boolean).sort();
      return `${selectedSheet("indices", selected, metricByAsset)}
        <section class="parallel-depth-section"><b>Historical Depth · ${esc(activePeriod.toUpperCase())}</b><div class="parallel-depth-grid">
          <span><small>Résolution</small><strong>${esc(payload.resolution || "1wk")}</strong></span>
          <span><small>Points / actif</small><strong>${counts.length ? `${Math.min(...counts)}–${Math.max(...counts)}` : "—"}</strong></span>
          <span><small>Début commun approx.</small><strong>${esc(starts[starts.length-1] ? dateText(starts[starts.length-1]) : "—")}</strong></span>
          <span><small>Dernier point</small><strong>${esc(ends[0] ? dateText(ends[0]) : "—")}</strong></span>
        </div><p class="parallel-depth-note">Archive hebdomadaire Yahoo Finance chargée uniquement après appel opérateur. Les fenêtres 5a et 10a sont des sous-ensembles déterministes de MAX ; aucune interpolation et aucune valeur inventée.</p></section>
        <section class="parallel-depth-section"><b>Risque historique long</b><p>Volatilité maximale observée ${pct(Math.max(...metricByAsset.map(x=>x.metric.volatility||0)))} · drawdown le plus profond ${pct(Math.min(...metricByAsset.map(x=>x.metric.drawdown||0)))}. Lecture historique uniquement, aucune prévision.</p></section>
        <section class="parallel-depth-section"><b>Provenance & lazy contract</b><p>${esc(payload.source || "Yahoo Finance")} · snapshot ${esc(dateText(payload.generated_at))} · ${payload.assets_count}/${payload.assets_expected || payload.assets_count}. Ce fichier n'appartient pas au payload de boot et reste absent de la mémoire navigateur tant que l'horizon long n'est pas demandé.</p></section>`;
    }
    const snap = horizonSnapshot(payload, "indices", activePeriod);
    const selected = selectedAsset("indices", rowsByAsset);
    const volumes = rowsByAsset.map(({asset,rows}) => {
      const vals = rows.map(r => finite(r.volume)).filter(v => v !== null);
      const latest = vals[vals.length-1];
      return latest === undefined ? null : `<li><b>${esc(asset.symbol||asset.name)}</b><span>${num(latest,0)}</span><small>volume source · non agrégé</small></li>`;
    }).filter(Boolean).join("");
    return `${selectedSheet("indices", selected, metricByAsset)}
      <section class="parallel-depth-section"><b>Lecture multi-horizon</b><div class="parallel-depth-horizons">${horizonCards(payload,"indices")}</div></section>
      <section class="parallel-depth-section"><b>Breadth & dispersion</b><p>${snap.up} hausses · ${snap.down} baisses · ${snap.flat} stables sur la fenêtre active. Dispersion ${num(snap.dispersion)} pt. Pire drawdown ${pct(snap.worstDrawdown)}.</p></section>
      <section class="parallel-depth-section"><b>Participation publiée</b><ul class="parallel-depth-list">${volumes || "<li>Volumes non fournis par la source.</li>"}</ul><p class="parallel-depth-note">Les volumes restent attachés à chaque indice : aucune somme inter-indices n'est calculée.</p></section>
      <section class="parallel-depth-section"><b>Provenance & intégrité</b><p>${esc(payload.source || "Yahoo Finance")} · snapshot ${esc(dateText(payload.generated_at))} · couverture ${payload.assets_count}/${payload.assets_expected || payload.assets_count}. Cotations, devises et unités restent séparées.</p></section>`;
  }

  function energyDepth(payload, rowsByAsset, metricByAsset) {
    const activePeriod = state.period.get("energy") || "1a";
    if (isLongPeriod(activePeriod) && payload?.schema === "agent_crypto_commodity_historical_depth_v1") {
      const selected = selectedAsset("energy", rowsByAsset);
      const counts = rowsByAsset.map(x => x.rows.length).filter(Number.isFinite);
      const starts = rowsByAsset.map(x => x.rows[0]?.time).filter(Boolean).sort();
      const ends = rowsByAsset.map(x => x.rows[x.rows.length-1]?.time).filter(Boolean).sort();
      return `${selectedSheet("energy", selected, metricByAsset)}
        <section class="parallel-depth-section"><b>Historical Depth · ${esc(activePeriod.toUpperCase())}</b><div class="parallel-depth-grid">
          <span><small>Instrument</small><strong>FUTURE CONTINU</strong></span>
          <span><small>Résolution</small><strong>${esc(payload.resolution || "historique")}</strong></span>
          <span><small>Points / actif</small><strong>${counts.length ? `${Math.min(...counts)}–${Math.max(...counts)}` : "—"}</strong></span>
          <span><small>Début commun approx.</small><strong>${esc(starts[starts.length-1] ? dateText(starts[starts.length-1]) : "—")}</strong></span>
          <span><small>Dernier point</small><strong>${esc(ends[0] ? dateText(ends[0]) : "—")}</strong></span>
        </div><p class="parallel-depth-note"><b>FUTURE CONTINU · HISTORIQUE FOURNISSEUR.</b> Archive Yahoo Finance chargée uniquement après appel opérateur. Ce n’est pas une série spot homogène ; aucune interpolation et aucune valeur inventée.</p></section>
        <section class="parallel-depth-section"><b>Risque historique long</b><p>Volatilité maximale observée ${pct(Math.max(...metricByAsset.map(x=>x.metric.volatility||0)))} · drawdown le plus profond ${pct(Math.min(...metricByAsset.map(x=>x.metric.drawdown||0)))}. Lecture historique uniquement, aucune prévision.</p></section>
        <section class="parallel-depth-section"><b>Provenance & lazy contract</b><p>${esc(payload.source || "Yahoo Finance chart endpoint")} · snapshot ${esc(dateText(payload.generated_at))} · ${payload.assets_count}/${payload.assets_expected || payload.assets_count}. Le fichier long reste absent de la mémoire navigateur tant que 5a / 10a / MAX n’est pas demandé.</p></section>`;
    }
    const selected = selectedAsset("energy", rowsByAsset);
    const map = new Map(rowsByAsset.map(x => [safeText(x.asset.symbol), x]));
    const wti = map.get("CL=F"), brent = map.get("BZ=F"), gas = map.get("NG=F");
    const wtiValue = wti ? latestValue(wti.asset,wti.rows) : null;
    const brentValue = brent ? latestValue(brent.asset,brent.rows) : null;
    const spread = wtiValue !== null && brentValue !== null ? brentValue-wtiValue : null;
    const gasValue = gas ? latestValue(gas.asset,gas.rows) : null;
    return `${selectedSheet("energy", selected, metricByAsset)}
      <section class="parallel-depth-section"><b>Lecture multi-horizon</b><div class="parallel-depth-horizons">${horizonCards(payload,"energy")}</div></section>
      <section class="parallel-depth-section"><b>Structure énergie</b><div class="parallel-depth-grid">
        <span><small>WTI</small><strong>${num(wtiValue,3)} USD</strong></span>
        <span><small>Brent</small><strong>${num(brentValue,3)} USD</strong></span>
        <span><small>Brent − WTI</small><strong>${spread===null?"—":`${spread>=0?"+":""}${num(spread,3)} USD`}</strong></span>
        <span><small>Gaz naturel</small><strong>${num(gasValue,4)} USD</strong></span>
      </div><p class="parallel-depth-note">Le spread Brent–WTI n'est calculé que lorsque les deux cotations USD sont présentes. Le gaz reste séparé des pétroles.</p></section>
      <section class="parallel-depth-section"><b>Risque historique</b><p>Volatilité maximale observée ${pct(Math.max(...metricByAsset.map(x=>x.metric.volatility||0)))} · drawdown le plus profond ${pct(Math.min(...metricByAsset.map(x=>x.metric.drawdown||0)))}. Mesures historiques, aucune prévision.</p></section>
      <section class="parallel-depth-section"><b>Provenance & intégrité</b><p>${esc(payload.source || "Yahoo Finance")} · snapshot ${esc(dateText(payload.generated_at))} · couverture ${payload.assets_count}/${payload.assets_expected || payload.assets_count}. Aucun mélange d'unités ou de contrats.</p></section>`;
  }

  function alignedReturns(asset) {
    const rows = (asset.daily || []).map(p => ({date:safeText(p.date || p.time).slice(0,10), close:finite(p.close)})).filter(x=>x.date&&x.close!==null);
    const out = new Map();
    for(let i=1;i<rows.length;i++){
      if (!rows[i-1].close || !rows[i].close) continue;
      out.set(rows[i].date, (rows[i].close/rows[i-1].close)-1);
    }
    return out;
  }

  function correlation(a,b) {
    const ra=alignedReturns(a), rb=alignedReturns(b), xs=[], ys=[];
    for(const [d,x] of ra){ if(rb.has(d)){ xs.push(x); ys.push(rb.get(d)); } }
    if(xs.length<12) return null;
    const mx=xs.reduce((s,v)=>s+v,0)/xs.length, my=ys.reduce((s,v)=>s+v,0)/ys.length;
    let cov=0,vx=0,vy=0;
    for(let i=0;i<xs.length;i++){ const dx=xs[i]-mx,dy=ys[i]-my; cov+=dx*dy;vx+=dx*dx;vy+=dy*dy; }
    return vx>0&&vy>0 ? cov/Math.sqrt(vx*vy) : null;
  }

  function crossDepth(payload, rowsByAsset, metricByAsset) {
    const selected = selectedAsset("cross-market", rowsByAsset);
    const pairs=[];
    for(let i=0;i<payload.assets.length;i++) for(let j=i+1;j<payload.assets.length;j++){
      const value=correlation(payload.assets[i],payload.assets[j]);
      if(value!==null) pairs.push({a:payload.assets[i],b:payload.assets[j],value});
    }
    pairs.sort((a,b)=>b.value-a.value);
    const pos=pairs[0], inv=[...pairs].sort((a,b)=>a.value-b.value)[0];
    const snap=horizonSnapshot(payload,"cross-market",state.period.get("cross-market")||"90j");
    return `${selectedSheet("cross-market", selected, metricByAsset)}
      <section class="parallel-depth-section"><b>Lecture multi-horizon</b><div class="parallel-depth-horizons">${horizonCards(payload,"cross-market")}</div></section>
      <section class="parallel-depth-section"><b>Corrélations observées</b><div class="parallel-depth-grid">
        <span><small>Plus positive</small><strong>${pos?`${esc(pos.a.symbol||pos.a.name)} / ${esc(pos.b.symbol||pos.b.name)} · ${pos.value.toFixed(2)}`:"—"}</strong></span>
        <span><small>Plus inverse</small><strong>${inv?`${esc(inv.a.symbol||inv.a.name)} / ${esc(inv.b.symbol||inv.b.name)} · ${inv.value.toFixed(2)}`:"—"}</strong></span>
        <span><small>Dispersion fenêtre</small><strong>${num(snap.dispersion)} pt</strong></span>
        <span><small>Breadth</small><strong>${snap.up} ↑ · ${snap.down} ↓ · ${snap.flat} =</strong></span>
      </div><p class="parallel-depth-note">Corrélations de rendements quotidiens sur dates communes ; observation statistique, aucune causalité supposée.</p></section>
      <section class="parallel-depth-section"><b>Provenance & séparation</b><p>${esc(payload.source_note || "Séries issues des archives canoniques et comparées en Base 100.")} Chaque série conserve son origine ; aucune moyenne inter-source.</p></section>`;
  }

  function depthContent(domain,payload,rowsByAsset,metricByAsset){
    const cfg=CONFIG[domain];
    if(!cfg || DEPTH_LEVEL < cfg.depthAt) return "";
    if(domain==="indices") return indicesDepth(payload,rowsByAsset,metricByAsset);
    if(domain==="energy") return energyDepth(payload,rowsByAsset,metricByAsset);
    if(domain==="cross-market") return crossDepth(payload,rowsByAsset,metricByAsset);
    return "";
  }

  function renderRail(domain, cfg, payload, rowsByAsset, metricByAsset) {
    const rail = detail(); if (!rail) return;
    const ranked = [...metricByAsset].filter(x => x.metric.change !== null).sort((a,b)=>b.metric.change-a.metric.change);
    const leader = ranked[0], laggard = ranked[ranked.length-1];
    const depthActive = DEPTH_LEVEL >= cfg.depthAt;
    if (depthActive && !state.selected.has(domain) && rowsByAsset[0]) state.selected.set(domain, safeText(rowsByAsset[0].asset.asset_id || rowsByAsset[0].asset.symbol));
    const selectedId = state.selected.get(domain);
    const basket = rowsByAsset.map(({asset,rows}) => {
      const last = latestValue(asset, rows);
      const found = metricByAsset.find(x => x.asset === asset)?.metric;
      const symbol = safeText(asset.symbol || asset.name || "ACTIF");
      const name = safeText(asset.name || asset.label || symbol);
      const unit = safeText(asset.currency || asset.unit || "");
      const value = last === null || last === undefined ? "—" : Number(last).toLocaleString("fr-FR", {maximumFractionDigits:4});
      const change = found?.change === null || found?.change === undefined ? "—" : `${found.change >= 0 ? "+" : ""}${found.change.toFixed(2)} %`;
      const assetId = safeText(asset.asset_id || asset.symbol);
      return `<li${selectedId===assetId?' class="is-selected"':""}>${depthActive?`<button type="button" data-parallel-asset="${esc(assetId)}" title="Sélectionner ${esc(name)}">`:"<span>"}<span><b>${esc(symbol)}</b><small>${esc(name)}</small></span>${depthActive?"</button>":"</span>"}</li>`;
    }).join("");
    const math = ENABLE_MATH && ranked.length ? `
      <section class="atlas-parallel-math"><b>Math Core · historique mesuré</b>
        <div class="atlas-parallel-math-grid">
          <span class="atlas-parallel-math-asset-404208" style="--asset-color:${colorForAsset(domain,leader.asset,0)}"><small>Leader</small><strong>${esc(leader.asset.symbol || leader.asset.name)} ${pct(leader.metric.change)}</strong></span>
          <span class="atlas-parallel-math-asset-404208" style="--asset-color:${colorForAsset(domain,laggard.asset,0)}"><small>Retard</small><strong>${esc(laggard.asset.symbol || laggard.asset.name)} ${pct(laggard.metric.change)}</strong></span>
          <span><small>Dispersion</small><strong>${num(leader.metric.change-laggard.metric.change)} pt</strong></span>
          <span><small>Prévision</small><strong>AUCUNE</strong></span>
        </div>
      </section>` : "";
    rail.innerHTML = `
      <header><span class="eyebrow">DÉTAIL ACTIF</span><strong>Lecture ${esc(cfg.title)}</strong><small>Observation seulement · Source Truth publique</small></header>
      <div class="atlas-parallel-detail-state atlas-parallel-detail-state-404228"><span><small>Domaine</small><b>${esc(cfg.label)}</b></span><span><small>Fenêtre active</small><b>${esc((state.period.get(domain) || cfg.defaultPeriod).toUpperCase())}</b></span><span><small>Couverture</small><b>${payload.assets_count}/${cfg.expected}</b></span><span><small>Source</small><b>${esc(payload.source || cfg.source)}</b></span></div>
      <section class="atlas-parallel-rail-context-404228"><b>État des données</b><p>Snapshot ${esc(dateText(payload.generated_at || payload.updated_at || payload.as_of || payload.timestamp))} · historique réel · comparaison Base 100 · aucune interpolation inventée.</p></section>
      <section class="atlas-parallel-rail-decision-404228"><span><small>DÉCISION</small><b>Observer / comparer</b></span><span><small>PRÉVISION</small><b>AUCUNE</b></span></section>
      <section><b>Lecture synthétique</b><p>${leader ? `Leader ${esc(leader.asset.name)} ${pct(leader.metric.change)} ; retard ${esc(laggard.asset.name)} ${pct(laggard.metric.change)}. Les séries restent indépendantes et sont comparées en Base 100.` : "Données insuffisantes."}</p></section>
      <section class="atlas-parallel-basket-404189 atlas-parallel-asset-selector-404236"><b>Sélection actif · ${esc(state.period.get(domain) || cfg.defaultPeriod)}</b><ul>${basket || "<li>Données insuffisantes.</li>"}</ul></section>
      ${math}
      ${depthContent(domain,payload,rowsByAsset,metricByAsset)}
      <section><b>Intégrité</b><p>Aucune valeur inventée · aucune moyenne inter-source · aucune exécution · décision humaine uniquement.</p></section>`;
  }

  function render(domain) {
    if (!ensureShell()) return;
    const cfg = CONFIG[domain]; if (!cfg) return;
    const period = state.period.get(domain) || cfg.defaultPeriod;
    const payload = payloadForPeriod(domain, period);
    if (!payload) return;
    state.period.set(domain, period);
    document.documentElement.dataset.parallelMarketRuntime = domain;
    document.documentElement.dataset.parallelMarketBuild = BUILD;
    document.documentElement.dataset.parallelDepthLevel = String(DEPTH_LEVEL);
    const shell = stage()?.querySelector("[data-parallel-live-shell]"); if (!shell) return;
    shell.querySelector("[data-parallel-title]").textContent = cfg.title;
    shell.querySelector("[data-parallel-subtitle]").textContent = isLongPeriod(period)
      ? `Historical Depth ${period.toUpperCase()} · archive chargée à la demande · ${payload.resolution || "1wk"}`
      : domain === "cross-market" ? (payload.source_note || "Comparaison transversale Base 100.") : "Cotations publiques et historique conservés séparément · Base 100 pour la comparaison.";
    const sourceText = safeText(payload.source || cfg.source);
    const coverageText = `${payload.assets_count}/${cfg.expected}`;
    const windowText = period.toUpperCase();
    const snapshotText = dateText(payload.generated_at || payload.updated_at || payload.as_of || payload.timestamp);
    shell.querySelector("[data-parallel-source]").textContent = sourceText;
    shell.querySelector("[data-parallel-count]").textContent = coverageText;
    const windowNode = shell.querySelector("[data-parallel-window]"); if (windowNode) windowNode.textContent = windowText;
    const statusSource = shell.querySelector("[data-parallel-status-source]"); if (statusSource) statusSource.textContent = sourceText;
    const statusCount = shell.querySelector("[data-parallel-status-count]"); if (statusCount) statusCount.textContent = coverageText;
    const memory = shell.querySelector("[data-parallel-memory]"); if (memory) memory.textContent = `${cfg.label} · ${windowText} · Base 100 · ${coverageText} séries`;
    const truthTitle = shell.querySelector("[data-parallel-truth-title]"); if (truthTitle) truthTitle.textContent = `MARCHÉ ${cfg.label}`;
    const truth = shell.querySelector("[data-parallel-truth]"); if (truth) truth.textContent = `${sourceText} · snapshot ${snapshotText} · comparaison Base 100 · aucune prévision`;
    const activeToolbar = toolbar();
    if (activeToolbar) {
      activeToolbar.dataset.activePeriod = period;
      activeToolbar.dataset.activePeriodKind = isLongPeriod(period) ? "history" : "standard";
      activeToolbar.setAttribute("aria-label", `${cfg.title} · période active ${period.toUpperCase()}`);
    }
    const buttons = activeToolbar?.querySelectorAll("[data-parallel-period]") || [];
    buttons.forEach(b => {
      const p=b.getAttribute("data-parallel-period"); const active=p===period;
      b.classList.toggle("is-active", active); b.disabled = domain==="cross-market" && p==="24h";
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
    const longButtons = activeToolbar?.querySelectorAll("[data-parallel-long-period]") || [];
    longButtons.forEach(b => {
      const p=b.getAttribute("data-parallel-long-period");
      const available = longDomainEnabled(domain);
      const active = available && p === period;
      b.classList.toggle("is-active", active); b.disabled = !available;
      b.setAttribute("aria-disabled", available ? "false" : "true");
      b.setAttribute("aria-pressed", active ? "true" : "false");
      b.title = available ? "Historique long chargé uniquement à la demande" : "Historique long activé dans une version dédiée ultérieure";
    });
    const rowsByAsset = [], metricByAsset = [], series = [];
    payload.assets.forEach((asset, idx) => {
      const rows = pickSeries(asset, period, domain==="cross-market");
      if (rows.length < 2) return;
      const norm = normalize(rows); if (norm.length < 2) return;
      const color = colorForAsset(domain, asset, idx);
      rowsByAsset.push({asset,rows,color}); metricByAsset.push({asset,metric:metrics(rows),color}); series.push({asset,points:norm,color});
    });
    drawCanvas(series, period, cfg.accent);
    emptyCanvasOverlay();
    const ranked = [...metricByAsset].filter(x=>x.metric.change!==null).sort((a,b)=>b.metric.change-a.metric.change);
    const leader=ranked[0], lag=ranked[ranked.length-1];
    const summary = shell.querySelector("[data-parallel-summary]");
    if (summary) {
      const identities = metricByAsset.map(x=>`<span style="--series:${x.color}"><i></i><b>${esc(x.asset.symbol||x.asset.name)}</b></span>`).join("");
      summary.innerHTML = ranked.length ? `<b>${series.length}/${cfg.expected}</b><span>Leader ${esc(leader.asset.symbol||leader.asset.name)} ${pct(leader.metric.change)} · retard ${esc(lag.asset.symbol||lag.asset.name)} ${pct(lag.metric.change)}</span><span class="atlas-parallel-summary-assets-404236">${identities}</span>` : "Données insuffisantes";
    }
    const legend = shell.querySelector("[data-parallel-legend]");
    if (legend) { legend.replaceChildren(); legend.hidden = true; }
    renderRail(domain,cfg,payload,rowsByAsset,metricByAsset);
    setStatus(domain,cfg,payload);
  }

  function showPending(domain) {
    const cfg = CONFIG[domain]; if (!cfg || !ensureShell()) return;
    const host = stage();
    if (host) host.innerHTML = `<div class="atlas-parallel-pending"><small>ERITH.IA · MARKETS OBSERVATORY</small><h3>${esc(cfg.title)}</h3><p>Domaine préparé. Source Truth non activée dans ce build.</p><b>PLANNED · INERT</b></div>`;
    const rail=detail(); if(rail) rail.innerHTML=`<header><span class="eyebrow">DÉTAIL ACTIF</span><strong>Lecture ${esc(cfg.title)}</strong><small>Aucune donnée inventée</small></header><section><b>État</b><p>PLANNED · INERT · activation après validation de la source, de l’unité, de l’historique et de la fraîcheur.</p></section>`;
    const bar=toolbar(); if(bar) bar.querySelector("[data-parallel-state]")?.replaceChildren(document.createTextNode(`${cfg.label} · SOURCE TRUTH REQUISE`));
  }

  async function sync(domain) {
    state.current = domain;
    clearCanvasHover();
    if (!CONFIG[domain]) { setStatus(domain, {}, null); return; }
    if (!ACTIVE.has(domain)) { showPending(domain); return; }
    if (!ensureShell()) return;
    const bar=toolbar(); if(bar) bar.querySelector("[data-parallel-state]")?.replaceChildren(document.createTextNode(`${CONFIG[domain].label} · PUBLIC`));
    try {
      const payload = await loadDomain(domain);
      if (state.current !== domain) return;
      render(domain);
    } catch (error) {
      const host=stage(); if(host) host.innerHTML=`<div class="atlas-parallel-pending"><small>${esc(CONFIG[domain].label)}</small><h3>Archive indisponible</h3><p>${esc(error?.message||error)}</p><b>UNKNOWN STATE = STOP</b></div>`;
      const rail=detail(); if(rail) rail.innerHTML=`<header><span class="eyebrow">DÉTAIL ACTIF</span><strong>Lecture ${esc(CONFIG[domain].title)}</strong></header><section><b>STOP</b><p>Source publique non lisible. Aucun calcul et aucune décision automatique.</p></section>`;
    }
  }

  document.addEventListener("erith:market-domain-change", event => sync(event?.detail?.domain || document.documentElement.dataset.cyclicMarketDomain || "crypto"));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => sync(document.documentElement.dataset.cyclicMarketDomain || "crypto"), {once:true});
  else sync(document.documentElement.dataset.cyclicMarketDomain || "crypto");

  function measuredSnapshot404199(domain, requestedPeriod=null) {
    const cfg = CONFIG[domain];
    if (!cfg || !ACTIVE.has(domain)) return { loaded:false, domain, period:requestedPeriod || null, reason:"domain_inactive" };
    const period = requestedPeriod || state.period.get(domain) || cfg.defaultPeriod;
    const payload = payloadForPeriod(domain, period);
    if (!payload) return { loaded:false, domain, period, long:isLongPeriod(period), reason:isLongPeriod(period)?"not_loaded":"payload_unavailable" };
    const assets=[];
    for (const asset of payload.assets || []) {
      const rows=pickSeries(asset,period,domain==="cross-market");
      if(rows.length<2) continue;
      const metric=metrics(rows);
      assets.push({
        asset_id:safeText(asset.asset_id||asset.symbol), name:safeText(asset.name||asset.label||asset.symbol), symbol:safeText(asset.symbol||asset.name),
        provider_symbol:safeText(asset.provider_symbol||asset.symbol), currency:safeText(asset.currency||asset.unit||""), instrument_type:safeText(asset.instrument_type||""),
        metric:{change:metric.change,volatility:metric.volatility,drawdown:metric.drawdown,amplitude:metric.amplitude},
        series:rows.map(row=>({time:row.time,close:row.close})), points:rows.length
      });
    }
    return {loaded:true,domain,period,long:isLongPeriod(period),source:safeText(payload.source||cfg.source),resolution:safeText(payload.resolution||""),generated_at:payload.generated_at||null,assets_count:assets.length,expected:cfg.expected,assets};
  }

  async function ensureHistorical404199(domain, period) {
    if (!longDomainEnabled(domain) || !isLongPeriod(period)) return measuredSnapshot404199(domain,period);
    await loadHistorical(domain,period);
    return measuredSnapshot404199(domain,period);
  }

  globalThis.ErithParallelMarketsRuntime = Object.freeze({
    build:BUILD,
    active:[...ACTIVE],
    math_core:ENABLE_MATH,
    periods:PERIODS,
    source_truth:true,
    one_shared_surface:true,
    depth_level:DEPTH_LEVEL,
    depth_domains:Object.freeze({indices:DEPTH_LEVEL>=190,energy:DEPTH_LEVEL>=191,"cross-market":DEPTH_LEVEL>=192}),
    depth_contract:DEPTH_LEVEL>=193 ? "shared_shell/domain_owned_depth/source_truth/no_execution" : "progressive",
    historical_depth_lazy:true,
    historical_boot_fetch:false,
    historical_resident_at_boot:false,
    historical_domains:Object.freeze({indices:true,energy:true,"cross-market":DEPTH_LEVEL>=202}),
    historical_long_periods:LONG_PERIODS,
    asset_color_identity:true,
    chart_table_parity:true,
    canvas_crypto_plot_language:true,
    values_hud_crypto_panel_parity:true,
    information_hierarchy_single_table:true,
    redundant_status_row_removed:true,
    rail_selector_values_removed:true,
    rail_asset_color_identity:true,
    math_semantic_color:true,
    color_redundant_with_text:true,
    asset_color_palette:COLORS,
    real_time_axis:true,
    historical_hover:true,
    hover_nearest_observed_only:true,
    hover_interpolation:false,
    new_timer:false,
    new_observer:false,
    storage_owner:false,
    orders_allowed:false,
    snapshot:measuredSnapshot404199,
    ensureHistorical:ensureHistorical404199,
    refresh:domain=>{state.data.delete(domain);for(const key of [...state.history.keys()]) if(key.startsWith(`${domain}:`)) state.history.delete(key);return sync(domain);}
  });
})();