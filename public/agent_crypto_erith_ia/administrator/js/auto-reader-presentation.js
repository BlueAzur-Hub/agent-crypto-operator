/* Agent-Crypto @erith.IA — 40.6.146 ATLAS SUBSECTION PRESENTATION + AUTO READER SUMMARY HOLD
   Presentation only. Enlarges the Intelligence/Memory/Creation subsection summaries,
   places descriptive copy under each title, and preserves the last observed Auto Reader
   presentation truth across lazy/collapsed DOM transitions. No collector cadence, storage,
   fetch, timer or business logic change. */
(() => {
  "use strict";

  const BUILD = "40.6.146";
  const STYLE_ID = "agentCryptoAtlasSubsectionPresentation146Style";
  const READOUT_ID = "agentCryptoAutoReaderSummary143";
  const SUBSECTION_KEYS = Object.freeze([
    "aerith10-creator",
    "salon-partage",
    "internet-research",
    "forge-aerith",
    "auto-reader",
    "shared-memory",
    "github-memory"
  ]);
  const truthCache = { mode: "—", visibility: "—", last: "—" };
  const boundDetails = new WeakSet();
  let observer = null;
  let residencyBound = false;
  let visibilityBound = false;

  const text = id => document.getElementById(id)?.textContent?.replace(/\s+/g, " ").trim() || "—";

  function root() {
    return document.querySelector('details[data-collapse-key="auto-reader"]');
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;

    const detailSelector = SUBSECTION_KEYS
      .map(key => `details[data-collapse-key="${key}"]`)
      .join(",\n");
    const summarySelector = SUBSECTION_KEYS
      .map(key => `details[data-collapse-key="${key}"] > .atlas-collapse-summary`)
      .join(",\n");
    const iconSelector = SUBSECTION_KEYS
      .map(key => `details[data-collapse-key="${key}"] > .atlas-collapse-summary > .atlas-collapse-icon`)
      .join(",\n");
    const titleSelector = SUBSECTION_KEYS
      .map(key => `details[data-collapse-key="${key}"] > .atlas-collapse-summary > .atlas-collapse-title`)
      .join(",\n");
    const subtitleSelector = SUBSECTION_KEYS
      .map(key => `details[data-collapse-key="${key}"] > .atlas-collapse-summary > .atlas-collapse-subtitle`)
      .join(",\n");

    style.textContent = `
      ${detailSelector}{margin:10px 0!important}

      ${summarySelector}{
        min-height:82px!important;
        padding:13px 16px!important;
        display:grid!important;
        grid-template-columns:32px minmax(0,1fr) auto!important;
        grid-template-rows:auto auto!important;
        column-gap:14px!important;
        row-gap:4px!important;
        align-items:center!important;
      }

      ${iconSelector}{
        grid-column:1!important;
        grid-row:1 / span 2!important;
        width:30px!important;
        height:30px!important;
        font-size:11px!important;
        align-self:center!important;
      }

      ${titleSelector}{
        grid-column:2!important;
        grid-row:1!important;
        align-self:end!important;
        min-width:0!important;
        font-size:clamp(16px,1.15vw,19px)!important;
        line-height:1.18!important;
        letter-spacing:.01em!important;
        white-space:normal!important;
        overflow:visible!important;
        text-overflow:clip!important;
      }

      ${subtitleSelector}{
        grid-column:2!important;
        grid-row:2!important;
        align-self:start!important;
        min-width:0!important;
        margin:1px 0 0!important;
        color:#aebfd1!important;
        font-size:clamp(11.5px,.86vw,13.5px)!important;
        line-height:1.35!important;
        white-space:normal!important;
        overflow:visible!important;
        text-overflow:clip!important;
      }

      #${READOUT_ID}{
        grid-column:3!important;
        grid-row:1 / span 2!important;
        justify-self:end!important;
        align-self:center!important;
        margin-left:12px!important;
        display:flex;
        align-items:center;
        gap:8px;
        min-width:0;
      }
      #${READOUT_ID}>b,#${READOUT_ID}>span{
        display:inline-flex;
        align-items:center;
        min-height:30px;
        padding:6px 10px;
        border:1px solid rgba(119,205,224,.18);
        border-radius:999px;
        background:rgba(3,15,25,.58);
        font:900 10px/1.05 system-ui,sans-serif;
        white-space:nowrap;
      }
      #${READOUT_ID}>b{
        color:#c9f8e1;
        border-color:rgba(103,226,179,.30);
        background:rgba(30,135,105,.10)
      }
      #${READOUT_ID}>span{
        max-width:280px;
        color:#a9bdc8;
        overflow:hidden;
        text-overflow:ellipsis
      }
      #${READOUT_ID}[data-state="live"]>b{
        color:#b9ff99;
        border-color:rgba(156,246,93,.38);
        background:rgba(100,164,49,.10)
      }
      #${READOUT_ID}[data-state="rest"]>b{
        color:#ffe0a1;
        border-color:rgba(255,205,103,.34);
        background:rgba(166,111,35,.10)
      }
      #${READOUT_ID}[data-state="waiting"]>b{
        color:#c7d6df;
        border-color:rgba(150,180,198,.24)
      }

      @media(max-width:1180px){
        ${summarySelector}{
          grid-template-columns:32px minmax(0,1fr)!important;
          grid-template-rows:auto auto auto!important;
        }
        #${READOUT_ID}{
          grid-column:2!important;
          grid-row:3!important;
          justify-self:start!important;
          margin:5px 0 0!important;
          flex-wrap:wrap
        }
      }

      @media(max-width:720px){
        ${summarySelector}{min-height:88px!important;padding:12px!important}
        ${titleSelector}{font-size:15px!important}
        ${subtitleSelector}{font-size:11.5px!important}
        #${READOUT_ID}>span{max-width:220px}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureReadout() {
    const details = root();
    const summary = details?.querySelector(":scope > summary");
    if (!summary) return null;
    let node = document.getElementById(READOUT_ID);
    if (!node) {
      node = document.createElement("span");
      node.id = READOUT_ID;
      node.dataset.owner = "auto-reader-presentation";
      node.dataset.presentationOnly = "true";
      node.innerHTML = '<b data-auto-reader-summary-mode>ÉTAT EN ATTENTE</b><span data-auto-reader-summary-last>Dernière lecture · —</span>';
      summary.appendChild(node);
    }
    return node;
  }

  function readTruth() {
    const current = {
      mode: text("autoReaderTruth"),
      visibility: text("autoVisibilityTruth"),
      last: text("autoLastRead")
    };

    for (const key of Object.keys(current)) {
      if (current[key] !== "—") truthCache[key] = current[key];
    }

    return {
      mode: current.mode !== "—" ? current.mode : truthCache.mode,
      visibility: current.visibility !== "—" ? current.visibility : truthCache.visibility,
      last: current.last !== "—" ? current.last : truthCache.last
    };
  }

  function render() {
    installStyle();
    const node = ensureReadout();
    if (!node) return false;

    const { mode, visibility, last } = readTruth();
    const modeNorm = mode.toLowerCase();
    const visibilityNorm = visibility.toLowerCase();
    const active = modeNorm.includes("actif") || modeNorm.includes("on");
    const visible = visibilityNorm.includes("visible") && !visibilityNorm.includes("non visible");
    const state = mode === "—" || visibility === "—"
      ? "waiting"
      : active && visible
        ? "live"
        : (!active || !visible) ? "rest" : "waiting";

    node.dataset.state = state;
    const modeNode = node.querySelector("[data-auto-reader-summary-mode]");
    const lastNode = node.querySelector("[data-auto-reader-summary-last]");
    if (modeNode) {
      modeNode.textContent = mode === "—" && visibility === "—"
        ? "ÉTAT EN ATTENTE"
        : `${mode} · ${visibility}`;
    }
    if (lastNode) lastNode.textContent = `Dernière lecture · ${last}`;
    node.title = `Atlas Auto Reader — ${mode} — ${visibility} — dernière lecture ${last}`;
    return true;
  }

  function disconnectObserver() {
    try { observer?.disconnect(); } catch (_) {}
    observer = null;
  }

  function bindObserver() {
    const details = root();
    if (!details) return false;
    const targets = ["autoReaderTruth", "autoVisibilityTruth", "autoLastRead", "autoNextRead"]
      .map(id => document.getElementById(id))
      .filter(Boolean);

    disconnectObserver();
    if (targets.length) {
      observer = new MutationObserver(render);
      for (const target of targets) {
        observer.observe(target, { childList: true, characterData: true, subtree: true });
      }
    }

    if (!boundDetails.has(details)) {
      boundDetails.add(details);
      details.addEventListener("toggle", () => {
        render();
        if (details.open) {
          bindObserver();
          queueMicrotask(render);
        }
      });
    }

    if (!visibilityBound) {
      visibilityBound = true;
      document.addEventListener("visibilitychange", render);
    }
    return targets.length > 0;
  }

  function onResidency(event) {
    const detail = event?.detail || {};
    if (detail.family !== "atlas" || detail.key !== "auto-reader") return;
    render();
    bindObserver();
    queueMicrotask(render);
  }

  function bindResidency() {
    if (residencyBound) return;
    residencyBound = true;
    document.addEventListener("erith:presentation-resident", onResidency);
  }

  function bind() {
    installStyle();
    bindResidency();
    const ok = render();
    bindObserver();
    return ok;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }

  globalThis.AgentCryptoAutoReaderPresentation = Object.freeze({
    build: BUILD,
    owner: "auto-reader-presentation",
    presentation_only: true,
    subsection_layout_refresh: true,
    subsection_descriptions_below_titles: true,
    auto_reader_last_truth_hold: true,
    lazy_residency_rebind: true,
    collector_logic_changed: false,
    cadence_changed: false,
    fetch_added: false,
    storage_added: false,
    timer_added: false,
    bounded_observer: true,
    residency_event_listener: true,
    render
  });
})();