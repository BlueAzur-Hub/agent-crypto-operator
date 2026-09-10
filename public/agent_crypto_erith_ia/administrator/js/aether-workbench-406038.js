/* 40.6.38 — AETHER FLOATING WORKBENCH · LAZY INTERACTION */
(() => {
  "use strict";

  const BUILD = "40.6.38";
  const ROOT_ID = "atlasAetherWorkbench406038";
  const STYLE_ID = "atlasAetherWorkbenchStyle406038";
  const MARGIN = 12;
  const MODES = new Set(["events", "history", "details"]);
  const state = {
    root: null,
    body: null,
    title: null,
    payload: null,
    mode: "events",
    position: null,
    drag: null,
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
      #${ROOT_ID}{
        position:fixed;z-index:2650;left:0;top:0;
        width:min(1180px,calc(100vw - 36px));height:min(74vh,760px);
        min-width:min(680px,calc(100vw - 24px));min-height:360px;
        display:grid;grid-template-rows:auto auto minmax(0,1fr);
        overflow:hidden;border:1px solid rgba(89,224,255,.56);border-radius:18px;
        background:
          radial-gradient(circle at 50% 0,rgba(38,132,184,.15),transparent 36%),
          linear-gradient(145deg,rgba(2,12,24,.985),rgba(3,20,34,.975));
        box-shadow:0 28px 80px rgba(0,0,0,.58),inset 0 0 0 1px rgba(255,255,255,.035),0 0 34px rgba(39,195,255,.10);
        color:#eaf7ff;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;
      }
      #${ROOT_ID}[hidden]{display:none!important}
      #${ROOT_ID} .awb-head{display:flex;align-items:center;gap:14px;min-height:58px;padding:10px 12px 10px 16px;border-bottom:1px solid rgba(89,224,255,.22);background:rgba(1,10,21,.90);cursor:grab;user-select:none;touch-action:none}
      #${ROOT_ID} .awb-head:active{cursor:grabbing}
      #${ROOT_ID} .awb-heading{display:grid;gap:1px;min-width:190px;margin-right:auto}
      #${ROOT_ID} .awb-kicker{font-size:10px;letter-spacing:.19em;text-transform:uppercase;font-weight:950;color:#5deaff}
      #${ROOT_ID} .awb-title{font:750 18px/1.15 Georgia,"Times New Roman",serif;letter-spacing:.08em;color:#edf8ff;text-shadow:0 0 12px rgba(98,236,255,.18)}
      #${ROOT_ID} .awb-actions{display:flex;align-items:center;gap:7px}
      #${ROOT_ID} button{border:1px solid rgba(99,224,255,.28);border-radius:999px;background:rgba(7,30,46,.90);color:#dff7ff;font:850 11px/1 system-ui,sans-serif;padding:8px 12px;cursor:pointer}
      #${ROOT_ID} button:hover,#${ROOT_ID} button:focus-visible{border-color:#67ecff;background:rgba(16,67,88,.92);outline:none;box-shadow:0 0 0 2px rgba(91,232,255,.13)}
      #${ROOT_ID} .awb-close{font-size:18px;line-height:1;padding:7px 10px}
      #${ROOT_ID} .awb-tabs{display:flex;align-items:center;gap:8px;padding:9px 16px;border-bottom:1px solid rgba(89,224,255,.14);background:rgba(1,12,23,.82)}
      #${ROOT_ID} .awb-tabs button[aria-pressed="true"]{color:#03121a;background:linear-gradient(135deg,#65ecff,#8fffd5);border-color:#c4fbff;box-shadow:0 0 18px rgba(85,230,255,.22)}
      #${ROOT_ID} .awb-body{min-height:0;overflow:auto;padding:18px 20px 22px;scrollbar-gutter:stable;color:#dbeef7}
      #${ROOT_ID} .awb-intro{display:flex;justify-content:space-between;gap:16px;align-items:end;margin:0 0 14px;padding:0 2px}
      #${ROOT_ID} .awb-intro h3{margin:0;font-size:18px;letter-spacing:.05em;color:#79ecff}
      #${ROOT_ID} .awb-intro small{color:#8ca8b8;font-size:12px}
      #${ROOT_ID} .awb-list{display:grid;gap:10px}
      #${ROOT_ID} .awb-row{display:grid;grid-template-columns:92px 86px 92px minmax(0,1fr);gap:12px;align-items:start;padding:13px 14px;border:1px solid rgba(85,203,232,.20);border-radius:12px;background:linear-gradient(135deg,rgba(10,39,57,.72),rgba(4,17,29,.82));box-shadow:inset 0 0 16px rgba(34,175,219,.035)}
      #${ROOT_ID} .awb-time{font:800 12px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace;color:#86dffc;white-space:nowrap}
      #${ROOT_ID} .awb-type{font-size:12px;line-height:1.4;color:#d9f6ff;letter-spacing:.04em}
      #${ROOT_ID} .awb-level{font-size:12px;line-height:1.4;font-weight:900;color:#ffd86d}
      #${ROOT_ID} .awb-detail{min-width:0;font-size:14px;line-height:1.45;font-weight:650;color:#f2f8fb;overflow-wrap:anywhere;text-transform:none}
      #${ROOT_ID} .awb-empty{padding:30px;border:1px dashed rgba(89,224,255,.25);border-radius:14px;text-align:center;color:#9db5c3}
      #${ROOT_ID} .awb-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      #${ROOT_ID} .awb-card{min-width:0;min-height:150px;padding:17px 18px;border:1px solid rgba(88,220,255,.24);border-radius:14px;background:linear-gradient(145deg,rgba(10,40,58,.76),rgba(3,16,28,.88));box-shadow:inset 0 0 25px rgba(46,190,235,.035)}
      #${ROOT_ID} .awb-card h4{margin:0 0 10px;font-size:12px;line-height:1.2;letter-spacing:.12em;text-transform:uppercase;color:#66eaff}
      #${ROOT_ID} .awb-card p{margin:0;font-size:15px;line-height:1.55;font-weight:650;color:#f2f8fb;overflow-wrap:anywhere}
      #${ROOT_ID} .awb-watch{margin-top:14px;padding:14px 16px;border:1px solid rgba(255,205,92,.24);border-radius:13px;background:rgba(54,39,10,.22)}
      #${ROOT_ID} .awb-watch b{display:block;margin-bottom:6px;color:#ffd66c;font-size:12px;letter-spacing:.10em;text-transform:uppercase}
      #${ROOT_ID} .awb-watch p{margin:0;color:#f4ead0;font-size:14px;line-height:1.5}
      @media(max-width:820px){
        #${ROOT_ID}{width:calc(100vw - 20px);height:min(80vh,720px);min-width:0;min-height:330px}
        #${ROOT_ID} .awb-head{gap:8px;padding-left:12px}.awb-heading{min-width:0!important}.awb-title{font-size:15px!important}
        #${ROOT_ID} .awb-actions button:not(.awb-close){display:none}
        #${ROOT_ID} .awb-body{padding:14px 12px 18px}
        #${ROOT_ID} .awb-row{grid-template-columns:78px 72px minmax(0,1fr);gap:8px}
        #${ROOT_ID} .awb-level{grid-column:2}.awb-detail{grid-column:3;grid-row:1 / span 2}
        #${ROOT_ID} .awb-details{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);
  }

  function clampPosition(x, y) {
    const root = state.root;
    if (!root) return { x: MARGIN, y: MARGIN };
    const width = root.offsetWidth || 800;
    const height = root.offsetHeight || 500;
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
      const x = (window.innerWidth - state.root.offsetWidth) / 2;
      const y = (window.innerHeight - state.root.offsetHeight) / 2;
      applyPosition({ x, y });
    });
  }

  function stopDrag() {
    if (!state.drag) return;
    window.removeEventListener("pointermove", dragMove, true);
    window.removeEventListener("pointerup", stopDrag, true);
    window.removeEventListener("pointercancel", stopDrag, true);
    state.drag = null;
  }

  function dragMove(event) {
    if (!state.drag || event.pointerId !== state.drag.pointerId) return;
    applyPosition({
      x: state.drag.left + (event.clientX - state.drag.clientX),
      y: state.drag.top + (event.clientY - state.drag.clientY)
    });
  }

  function dragStart(event) {
    if (event.button !== 0 || event.target.closest("button")) return;
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
    state.body.replaceChildren(intro, timelineRows(entries));
  }

  function detailCard(label, value) {
    const card = document.createElement("article");
    card.className = "awb-card";
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
      detailCard("Pourquoi Aether attire ton attention ?", d.why),
      detailCard("Lecture News → Marché", d.semantic),
      detailCard("Attention", d.attention),
      detailCard("Dernière veille", d.news)
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
  }

  function onEscape(event) {
    if (event.key === "Escape" && state.root && !state.root.hidden) close();
  }

  function ensureRoot() {
    if (state.root) return state.root;
    ensureStyle();
    const root = document.createElement("section");
    root.id = ROOT_ID;
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "false");
    root.setAttribute("aria-label", "Aether Workbench");
    root.innerHTML = `
      <header class="awb-head" data-awb-drag>
        <div class="awb-heading"><span class="awb-kicker">AETHER WORKBENCH · ${BUILD}</span><strong class="awb-title">AETHER · ÉVÉNEMENTS</strong></div>
        <div class="awb-actions"><button type="button" data-awb-center title="Recentrer la fenêtre">Centrer</button><button type="button" class="awb-close" data-awb-close aria-label="Fermer">×</button></div>
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
    root.hidden = false;
    setMode(MODES.has(state.payload.mode) ? state.payload.mode : "events");
    requestAnimationFrame(() => {
      if (state.position) applyPosition(state.position); else center();
      root.querySelector(`[data-awb-mode="${state.mode}"]`)?.focus({ preventScroll: true });
    });
    return true;
  }

  window.addEventListener("resize", () => { if (state.root && !state.root.hidden && state.position) applyPosition(state.position); }, { passive: true });

  globalThis.AgentCryptoAetherWorkbench406038 = Object.freeze({ build: BUILD, open, close, center, local_position_only: true, storage_owner: false, network_owner: false, recurring_timer: false, global_window_manager_owner: false });
})();
