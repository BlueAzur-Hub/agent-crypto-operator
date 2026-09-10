/* 40.6.39 — AETHER WORKBENCH FOCUS · READABILITY · Z-ORDER LOCK */
(() => {
  "use strict";

  const BUILD = "40.6.39";
  const ROOT_ID = "atlasAetherWorkbench406039";
  const STYLE_ID = "atlasAetherWorkbenchStyle406039";
  const SCRIM_ID = "atlasAetherWorkbenchScrim406039";
  const MARGIN = 10;
  const MODES = new Set(["events", "history", "details"]);
  const state = {
    root: null,
    body: null,
    title: null,
    scrim: null,
    payload: null,
    mode: "events",
    position: null,
    drag: null,
    maximized: false,
    escapeBound: false
  };

  function text(value, fallback = "—") {
    const out = String(value ?? "").replace(/\s+/g, " ").trim();
    return out || fallback;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${SCRIM_ID}{
        position:fixed;inset:0;z-index:2147483300;pointer-events:none;
        background:rgba(0,5,14,.52);backdrop-filter:blur(1.5px) saturate(.88);-webkit-backdrop-filter:blur(1.5px) saturate(.88);
        opacity:1;transition:opacity .14s ease;
      }
      #${SCRIM_ID}[hidden]{display:none!important}
      #${ROOT_ID}{
        position:fixed;z-index:2147483600;left:0;top:0;
        width:min(1460px,calc(100vw - 28px));height:min(84vh,860px);
        max-width:calc(100vw - 20px);max-height:calc(100vh - 20px);
        min-width:min(760px,calc(100vw - 20px));min-height:410px;
        display:grid;grid-template-rows:auto auto minmax(0,1fr);
        overflow:hidden;border:1px solid rgba(89,224,255,.60);border-radius:18px;
        background:
          radial-gradient(circle at 50% 0,rgba(38,132,184,.18),transparent 34%),
          linear-gradient(145deg,rgba(1,10,21,.992),rgba(3,20,34,.988));
        box-shadow:0 34px 100px rgba(0,0,0,.70),inset 0 0 0 1px rgba(255,255,255,.04),0 0 42px rgba(39,195,255,.12);
        color:#eaf7ff;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;
      }
      #${ROOT_ID}[hidden]{display:none!important}
      #${ROOT_ID}[data-awb-maximized="1"]{left:10px!important;top:10px!important;width:calc(100vw - 20px)!important;height:calc(100vh - 20px)!important;max-width:none!important;max-height:none!important}
      #${ROOT_ID} .awb-head{display:flex;align-items:center;gap:14px;min-height:64px;padding:11px 13px 11px 18px;border-bottom:1px solid rgba(89,224,255,.24);background:rgba(1,9,20,.94);cursor:grab;user-select:none;touch-action:none}
      #${ROOT_ID}[data-awb-maximized="1"] .awb-head{cursor:default}
      #${ROOT_ID} .awb-head:active{cursor:grabbing}
      #${ROOT_ID} .awb-heading{display:grid;gap:2px;min-width:230px;margin-right:auto}
      #${ROOT_ID} .awb-kicker{font-size:10px;letter-spacing:.20em;text-transform:uppercase;font-weight:950;color:#63edff}
      #${ROOT_ID} .awb-title{font:760 20px/1.12 Georgia,"Times New Roman",serif;letter-spacing:.085em;color:#f2f8ff;text-shadow:0 0 14px rgba(98,236,255,.22)}
      #${ROOT_ID} .awb-actions{display:flex;align-items:center;gap:7px}
      #${ROOT_ID} button{border:1px solid rgba(99,224,255,.30);border-radius:999px;background:rgba(7,30,46,.94);color:#e4f9ff;font:850 11px/1 system-ui,sans-serif;padding:9px 13px;cursor:pointer}
      #${ROOT_ID} button:hover,#${ROOT_ID} button:focus-visible{border-color:#67ecff;background:rgba(16,67,88,.96);outline:none;box-shadow:0 0 0 2px rgba(91,232,255,.14)}
      #${ROOT_ID} .awb-close{font-size:19px;line-height:1;padding:8px 11px}
      #${ROOT_ID} .awb-tabs{display:flex;align-items:center;gap:9px;padding:10px 18px;border-bottom:1px solid rgba(89,224,255,.15);background:rgba(1,12,23,.88)}
      #${ROOT_ID} .awb-tabs button{font-size:12px;padding:9px 14px}
      #${ROOT_ID} .awb-tabs button[aria-pressed="true"]{color:#041219;background:linear-gradient(135deg,#68efff,#9affd9);border-color:#d0fcff;box-shadow:0 0 20px rgba(85,230,255,.24)}
      #${ROOT_ID} .awb-body{min-height:0;overflow:auto;padding:22px 24px 28px;scrollbar-gutter:stable;color:#dbeef7}
      #${ROOT_ID} .awb-intro{display:flex;justify-content:space-between;gap:18px;align-items:end;margin:0 0 16px;padding:0 2px}
      #${ROOT_ID} .awb-intro h3{margin:0;font-size:20px;letter-spacing:.045em;color:#79ecff}
      #${ROOT_ID} .awb-intro small{color:#91adbd;font-size:12px;text-align:right}
      #${ROOT_ID} .awb-columns{display:grid;grid-template-columns:96px 96px 92px minmax(0,1fr);gap:14px;padding:0 16px 7px;color:#6fdff5;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
      #${ROOT_ID} .awb-list{display:grid;gap:11px}
      #${ROOT_ID} .awb-row{display:grid;grid-template-columns:96px 96px 92px minmax(0,1fr);gap:14px;align-items:start;padding:15px 16px;border:1px solid rgba(85,203,232,.23);border-radius:13px;background:linear-gradient(135deg,rgba(10,39,57,.80),rgba(4,17,29,.90));box-shadow:inset 0 0 18px rgba(34,175,219,.04)}
      #${ROOT_ID} .awb-row:hover{border-color:rgba(106,231,255,.40);background:linear-gradient(135deg,rgba(12,48,68,.88),rgba(4,19,31,.94))}
      #${ROOT_ID} .awb-time{font:850 12.5px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;color:#8be5ff;white-space:nowrap}
      #${ROOT_ID} .awb-type{font-size:12.5px;line-height:1.5;color:#ddf8ff;letter-spacing:.035em}
      #${ROOT_ID} .awb-level{font-size:12.5px;line-height:1.5;font-weight:950;color:#ffd86d}
      #${ROOT_ID} .awb-detail{min-width:0;font-size:15px;line-height:1.52;font-weight:650;color:#f5f9fb;overflow-wrap:anywhere;text-transform:none}
      #${ROOT_ID} .awb-empty{padding:34px;border:1px dashed rgba(89,224,255,.28);border-radius:14px;text-align:center;color:#9db5c3;font-size:14px}
      #${ROOT_ID} .awb-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
      #${ROOT_ID} .awb-card{min-width:0;min-height:150px;padding:20px 21px;border:1px solid rgba(88,220,255,.26);border-radius:15px;background:linear-gradient(145deg,rgba(10,40,58,.82),rgba(3,16,28,.93));box-shadow:inset 0 0 28px rgba(46,190,235,.04)}
      #${ROOT_ID} .awb-card--wide{grid-column:1/-1;min-height:0}
      #${ROOT_ID} .awb-card h4{margin:0 0 11px;font-size:12px;line-height:1.2;letter-spacing:.13em;text-transform:uppercase;color:#69ecff}
      #${ROOT_ID} .awb-card p{margin:0;font-size:16px;line-height:1.62;font-weight:640;color:#f4f9fc;overflow-wrap:anywhere}
      #${ROOT_ID} .awb-watch{margin-top:16px;padding:17px 19px;border:1px solid rgba(255,205,92,.30);border-radius:14px;background:linear-gradient(135deg,rgba(68,47,9,.28),rgba(24,21,10,.24))}
      #${ROOT_ID} .awb-watch b{display:block;margin-bottom:7px;color:#ffdb70;font-size:12px;letter-spacing:.11em;text-transform:uppercase}
      #${ROOT_ID} .awb-watch p{margin:0;color:#f7edd2;font-size:15.5px;line-height:1.56}
      @media(max-width:980px){
        #${ROOT_ID}{width:calc(100vw - 18px);height:min(84vh,760px);min-width:0;min-height:350px}
        #${ROOT_ID} .awb-head{gap:8px;padding-left:13px}.awb-heading{min-width:0!important}.awb-title{font-size:16px!important}
        #${ROOT_ID} .awb-actions button:not(.awb-close):not([data-awb-maximize]){display:none}
        #${ROOT_ID} .awb-body{padding:16px 13px 20px}
        #${ROOT_ID} .awb-columns{display:none}
        #${ROOT_ID} .awb-row{grid-template-columns:80px 72px minmax(0,1fr);gap:8px}
        #${ROOT_ID} .awb-level{grid-column:2}.awb-detail{grid-column:3;grid-row:1 / span 2;font-size:13.5px}
        #${ROOT_ID} .awb-details{grid-template-columns:1fr}
        #${ROOT_ID} .awb-card--wide{grid-column:auto}
        #${ROOT_ID} .awb-card p{font-size:14.5px}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureScrim() {
    if (state.scrim) return state.scrim;
    let scrim = document.getElementById(SCRIM_ID);
    if (!scrim) {
      scrim = document.createElement("div");
      scrim.id = SCRIM_ID;
      scrim.hidden = true;
      scrim.setAttribute("aria-hidden", "true");
      document.body.appendChild(scrim);
    }
    state.scrim = scrim;
    return scrim;
  }

  function clampPosition(x, y) {
    const root = state.root;
    if (!root) return { x: MARGIN, y: MARGIN };
    if (state.maximized) return { x: MARGIN, y: MARGIN };
    const width = root.offsetWidth || 900;
    const height = root.offsetHeight || 560;
    const maxX = Math.max(MARGIN, window.innerWidth - width - MARGIN);
    const maxY = Math.max(MARGIN, window.innerHeight - height - MARGIN);
    return {
      x: Math.min(Math.max(MARGIN, Number(x) || MARGIN), maxX),
      y: Math.min(Math.max(MARGIN, Number(y) || MARGIN), maxY)
    };
  }

  function applyPosition(pos) {
    if (!state.root) return;
    const next = clampPosition(pos?.x, pos?.y);
    state.root.style.left = `${Math.round(next.x)}px`;
    state.root.style.top = `${Math.round(next.y)}px`;
    state.position = next;
  }

  function center() {
    if (!state.root) return;
    requestAnimationFrame(() => {
      if (state.maximized) return;
      const x = (window.innerWidth - state.root.offsetWidth) / 2;
      const y = (window.innerHeight - state.root.offsetHeight) / 2;
      applyPosition({ x, y });
    });
  }

  function setMaximized(value) {
    if (!state.root) return;
    state.maximized = value === true;
    state.root.dataset.awbMaximized = state.maximized ? "1" : "0";
    const button = state.root.querySelector("[data-awb-maximize]");
    if (button) button.textContent = state.maximized ? "Restaurer" : "Agrandir";
    if (!state.maximized) requestAnimationFrame(() => state.position ? applyPosition(state.position) : center());
  }

  function stopDrag() {
    if (!state.drag) return;
    window.removeEventListener("pointermove", dragMove, true);
    window.removeEventListener("pointerup", stopDrag, true);
    window.removeEventListener("pointercancel", stopDrag, true);
    state.drag = null;
  }

  function dragMove(event) {
    if (!state.drag || event.pointerId !== state.drag.pointerId || state.maximized) return;
    applyPosition({
      x: state.drag.left + (event.clientX - state.drag.clientX),
      y: state.drag.top + (event.clientY - state.drag.clientY)
    });
  }

  function dragStart(event) {
    if (state.maximized || event.button !== 0 || event.target.closest("button")) return;
    const rect = state.root.getBoundingClientRect();
    state.drag = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, left: rect.left, top: rect.top };
    window.addEventListener("pointermove", dragMove, true);
    window.addEventListener("pointerup", stopDrag, true);
    window.addEventListener("pointercancel", stopDrag, true);
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch (_) {}
    event.preventDefault();
  }

  function setMode(mode) {
    const target = MODES.has(mode) ? mode : "events";
    state.mode = target;
    state.root?.querySelectorAll("[data-awb-mode]").forEach(button => {
      button.setAttribute("aria-pressed", button.dataset.awbMode === target ? "true" : "false");
    });
    render();
  }

  function timelineRows(entries) {
    const list = document.createElement("div");
    list.className = "awb-list";
    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "awb-empty";
      empty.textContent = "Aucun changement significatif enregistré dans cette session.";
      list.appendChild(empty);
      return list;
    }
    entries.forEach(entry => {
      const row = document.createElement("article");
      row.className = "awb-row";
      const at = document.createElement("time");
      at.className = "awb-time";
      at.textContent = new Date(Number(entry.at) || Date.now()).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const type = document.createElement("b");
      type.className = "awb-type";
      type.textContent = text(entry.type, "AETHER");
      const level = document.createElement("span");
      level.className = "awb-level";
      level.textContent = text(entry.level, "N/D");
      const detail = document.createElement("div");
      detail.className = "awb-detail";
      detail.textContent = text(entry.detail, "État actualisé");
      row.append(at, type, level, detail);
      list.appendChild(row);
    });
    return list;
  }

  function timelineColumns() {
    const columns = document.createElement("div");
    columns.className = "awb-columns";
    ["Heure", "Type", "Niveau", "Lecture"].forEach(label => {
      const cell = document.createElement("span");
      cell.textContent = label;
      columns.appendChild(cell);
    });
    return columns;
  }

  function renderTimeline(mode) {
    const payload = state.payload || {};
    const all = Array.isArray(payload.timeline) ? payload.timeline : [];
    const entries = mode === "events" ? all.filter(row => String(row?.type || "").toUpperCase() !== "SYSTEM").slice(0, 8) : all.slice(0, 8);
    const intro = document.createElement("div");
    intro.className = "awb-intro";
    const h = document.createElement("h3");
    h.textContent = mode === "events" ? "Événements récents" : "Historique Aether";
    const small = document.createElement("small");
    small.textContent = `${entries.length} / 8 · session courante · lecture seule`;
    intro.append(h, small);
    state.body.replaceChildren(intro, timelineColumns(), timelineRows(entries));
  }

  function detailCard(label, value, wide = false) {
    const card = document.createElement("article");
    card.className = wide ? "awb-card awb-card--wide" : "awb-card";
    const h = document.createElement("h4");
    h.textContent = label;
    const p = document.createElement("p");
    p.textContent = text(value);
    card.append(h, p);
    return card;
  }

  function renderDetails() {
    const payload = state.payload || {};
    const d = payload.details || {};
    const intro = document.createElement("div");
    intro.className = "awb-intro";
    const h = document.createElement("h3");
    h.textContent = "Détails de la lecture Aether";
    const small = document.createElement("small");
    small.textContent = "Synthèse explicative · aucune exécution automatique";
    intro.append(h, small);
    const grid = document.createElement("div");
    grid.className = "awb-details";
    grid.append(
      detailCard("Pourquoi Aether attire ton attention ?", d.why, true),
      detailCard("Lecture News → Marché", d.semantic),
      detailCard("Attention", d.attention),
      detailCard("Dernière veille", d.news, true)
    );
    const watch = document.createElement("section");
    watch.className = "awb-watch";
    const wb = document.createElement("b");
    wb.textContent = "À surveiller maintenant";
    const wp = document.createElement("p");
    wp.textContent = text(payload?.watch?.watch || payload?.watch?.note);
    watch.append(wb, wp);
    state.body.replaceChildren(intro, grid, watch);
  }

  function render() {
    if (!state.body) return;
    state.title.textContent = state.mode === "details" ? "AETHER · DÉTAILS" : state.mode === "history" ? "AETHER · HISTORIQUE" : "AETHER · ÉVÉNEMENTS";
    if (state.mode === "details") renderDetails(); else renderTimeline(state.mode);
  }

  function close() {
    stopDrag();
    if (state.root) state.root.hidden = true;
    if (state.scrim) state.scrim.hidden = true;
  }

  function onEscape(event) {
    if (event.key === "Escape" && state.root && !state.root.hidden) close();
  }

  function ensureRoot() {
    if (state.root) return state.root;
    ensureStyle();
    ensureScrim();
    const root = document.createElement("section");
    root.id = ROOT_ID;
    root.hidden = true;
    root.dataset.awbMaximized = "0";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "false");
    root.setAttribute("aria-label", "Aether Workbench");
    root.innerHTML = `
      <header class="awb-head" data-awb-drag>
        <div class="awb-heading"><span class="awb-kicker">AETHER WORKBENCH · ${BUILD}</span><strong class="awb-title">AETHER · ÉVÉNEMENTS</strong></div>
        <div class="awb-actions"><button type="button" data-awb-center title="Recentrer la fenêtre">Centrer</button><button type="button" data-awb-maximize title="Agrandir la fenêtre">Agrandir</button><button type="button" class="awb-close" data-awb-close aria-label="Fermer">×</button></div>
      </header>
      <nav class="awb-tabs" aria-label="Vues Aether"><button type="button" data-awb-mode="events">Événements</button><button type="button" data-awb-mode="history">Historique</button><button type="button" data-awb-mode="details">Détails</button></nav>
      <div class="awb-body"></div>`;
    document.body.appendChild(root);
    state.root = root;
    state.body = root.querySelector(".awb-body");
    state.title = root.querySelector(".awb-title");
    root.querySelector("[data-awb-drag]")?.addEventListener("pointerdown", dragStart);
    root.querySelector("[data-awb-close]")?.addEventListener("click", close);
    root.querySelector("[data-awb-center]")?.addEventListener("click", center);
    root.querySelector("[data-awb-maximize]")?.addEventListener("click", () => setMaximized(!state.maximized));
    root.querySelectorAll("[data-awb-mode]").forEach(button => button.addEventListener("click", () => setMode(button.dataset.awbMode)));
    if (!state.escapeBound) {
      document.addEventListener("keydown", onEscape);
      state.escapeBound = true;
    }
    return root;
  }

  function open(payload = {}) {
    const root = ensureRoot();
    state.payload = payload && typeof payload === "object" ? payload : {};
    if (state.scrim) state.scrim.hidden = false;
    root.hidden = false;
    setMode(MODES.has(state.payload.mode) ? state.payload.mode : "events");
    requestAnimationFrame(() => {
      if (state.maximized) setMaximized(true);
      else if (state.position) applyPosition(state.position);
      else center();
      root.querySelector(`[data-awb-mode="${state.mode}"]`)?.focus({ preventScroll: true });
    });
    return true;
  }

  window.addEventListener("resize", () => {
    if (!state.root || state.root.hidden) return;
    if (state.maximized) setMaximized(true);
    else if (state.position) applyPosition(state.position);
  }, { passive: true });

  globalThis.AgentCryptoAetherWorkbench406039 = Object.freeze({
    build: BUILD,
    open,
    close,
    center,
    maximize: () => setMaximized(true),
    restore: () => setMaximized(false),
    local_position_only: true,
    focus_scrim: true,
    z_order_above_aether_stage: true,
    storage_owner: false,
    network_owner: false,
    recurring_timer: false,
    global_window_manager_owner: false
  });
})();
