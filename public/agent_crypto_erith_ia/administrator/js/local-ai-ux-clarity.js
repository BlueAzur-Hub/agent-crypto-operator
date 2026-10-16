/* Agent-Crypto @erith.IA — 40.6.140 LOCAL AI UX CLARITY
   Presentation only. Clarifies CURRENT / LIVE / REPOS and Atlas / Aerith roles.
   Does not start Atlas, mutate CURRENT, change analytical data, add timers,
   observers, storage owners, network calls or financial actions. */
(() => {
  "use strict";

  const BUILD = "40.6.140";
  const ROOT_ID = "atlas-local-ai-collapse";
  const HOST_ID = "local-ai-hub";
  const PANEL_ID = "agentCryptoLocalAiClarity140";
  const STYLE_ID = "agentCryptoLocalAiClarity140Style";

  const clean = value => String(value || "").replace(/\s+/g, " ").trim();

  function readState(root) {
    const text = clean(root?.innerText || root?.textContent || "");
    const currentClosed = /CURRENT\s+(?:validé|fermé|restauré)/i.test(text);
    const active = /Analyse\s+(?:Atlas-10\s+)?(?:en cours|automatique)|\b[0-3]\s*\/\s*4\s+(?:rapports?\s+)?prêts?/i.test(text);
    const bridgeReady = /Dialogue local prêt|Bridge validé|gpt-oss:20b-32k/i.test(text);
    const repose = currentClosed && !active;
    return Object.freeze({
      current: currentClosed ? "VALIDÉ" : active ? "EN COURS" : "À QUALIFIER",
      engine: repose ? "REPOS" : active ? "ANALYSE" : "ATTENTE",
      bridge: bridgeReady ? "PRÊT" : "À VÉRIFIER",
      currentClosed,
      active,
      repose,
      bridgeReady
    });
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${PANEL_ID}{margin:0 0 14px;padding:14px;border:1px solid rgba(95,228,255,.24);border-radius:14px;background:radial-gradient(circle at 92% 8%,rgba(112,86,220,.10),transparent 28%),linear-gradient(135deg,rgba(5,24,38,.90),rgba(10,19,35,.88));box-shadow:inset 0 1px 0 rgba(255,255,255,.035)}
      #${PANEL_ID} .ac-ai-clarity-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:11px}
      #${PANEL_ID} .ac-ai-clarity-head>div{display:grid;gap:3px}
      #${PANEL_ID} .ac-ai-clarity-kicker{color:#bda8ff;font:950 9px/1.1 system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase}
      #${PANEL_ID} .ac-ai-clarity-head strong{color:#fff0b9;font:950 15px/1.2 system-ui,sans-serif}
      #${PANEL_ID} .ac-ai-clarity-head small{color:#8ca8b5;font:750 10px/1.35 system-ui,sans-serif}
      #${PANEL_ID} .ac-ai-clarity-state{padding:6px 9px;border:1px solid rgba(95,241,205,.30);border-radius:999px;background:rgba(35,162,127,.10);color:#aef9dc;font:950 9px/1 system-ui,sans-serif;letter-spacing:.07em;white-space:nowrap}
      #${PANEL_ID} .ac-ai-clarity-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
      #${PANEL_ID} .ac-ai-clarity-card{min-width:0;padding:10px 11px;border:1px solid rgba(117,203,224,.13);border-radius:11px;background:rgba(2,13,23,.52)}
      #${PANEL_ID} .ac-ai-clarity-card>span{display:block;margin-bottom:5px;color:#7599a8;font:900 8px/1 system-ui,sans-serif;letter-spacing:.13em;text-transform:uppercase}
      #${PANEL_ID} .ac-ai-clarity-card>strong{display:block;color:#e8fbff;font:950 12px/1.2 system-ui,sans-serif;overflow-wrap:anywhere}
      #${PANEL_ID} .ac-ai-clarity-card>small{display:block;margin-top:5px;color:#829ba7;font:700 9px/1.35 system-ui,sans-serif}
      #${PANEL_ID} .ac-ai-clarity-card[data-kind="current"]{border-color:rgba(255,216,111,.18)}
      #${PANEL_ID} .ac-ai-clarity-card[data-kind="current"]>strong{color:#ffe6a3}
      #${PANEL_ID} .ac-ai-clarity-card[data-kind="atlas"]>strong{color:#9eeeff}
      #${PANEL_ID} .ac-ai-clarity-card[data-kind="aerith"]>strong{color:#ffc2e8}
      #${PANEL_ID} .ac-ai-clarity-note{margin-top:10px;padding:9px 10px;border-left:3px solid rgba(104,226,255,.48);background:rgba(36,130,159,.07);color:#91b5c1;font:760 10px/1.45 system-ui,sans-serif}
      #${PANEL_ID} .ac-ai-clarity-note b{color:#dff9ff}
      @media(max-width:1180px){#${PANEL_ID} .ac-ai-clarity-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:760px){#${PANEL_ID} .ac-ai-clarity-grid{grid-template-columns:1fr 1fr}#${PANEL_ID} .ac-ai-clarity-head{flex-direction:column}}
      @media(max-width:520px){#${PANEL_ID} .ac-ai-clarity-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function render() {
    const root = document.getElementById(ROOT_ID);
    const host = document.getElementById(HOST_ID) || root?.querySelector?.(`#${HOST_ID}`);
    if (!root || !host) return false;
    installStyle();

    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement("section");
      panel.id = PANEL_ID;
      panel.dataset.presentationOnly = "true";
      panel.dataset.owner = "local-ai-ux-clarity";
      host.prepend(panel);
    } else if (panel.parentNode !== host) {
      host.prepend(panel);
    }

    const state = readState(root);
    panel.innerHTML = `
      <div class="ac-ai-clarity-head">
        <div>
          <span class="ac-ai-clarity-kicker">LOCAL AI · CARTE DE LECTURE</span>
          <strong>Atlas-10 + Aerith-10 Crypto</strong>
          <small>Une seule vérité de cycle, deux rôles distincts, aucun redémarrage implicite.</small>
        </div>
        <span class="ac-ai-clarity-state">MOTEUR · ${state.engine}</span>
      </div>
      <div class="ac-ai-clarity-grid">
        <div class="ac-ai-clarity-card" data-kind="current"><span>CURRENT</span><strong>${state.current}</strong><small>Snapshot canonique · cycle analytique identifié.</small></div>
        <div class="ac-ai-clarity-card"><span>BRIDGE LOCAL</span><strong>${state.bridge}</strong><small>Dialogue local distinct du moteur marché.</small></div>
        <div class="ac-ai-clarity-card" data-kind="atlas"><span>ATLAS-10</span><strong>Données · Math · contradictions</strong><small>Lecture technique et contrôle de cohérence.</small></div>
        <div class="ac-ai-clarity-card" data-kind="aerith"><span>AERITH-10</span><strong>Explication · discernement · No-FOMO</strong><small>Relecture pédagogique sans inventer la décision.</small></div>
        <div class="ac-ai-clarity-card"><span>LIVE</span><strong>Flux marché séparé</strong><small>Les prix peuvent continuer après la fermeture du CURRENT.</small></div>
      </div>
      <div class="ac-ai-clarity-note"><b>Contrat :</b> CURRENT ≠ LIVE · Question libre ≠ nouveau CURRENT · un CURRENT fermé reste en lecture seule jusqu’à un nouveau snapshot canonique qualifié.</div>
    `;
    return true;
  }

  function bind() {
    const root = document.getElementById(ROOT_ID);
    render();
    if (root && root.dataset.localAiClarity140Bound !== "true") {
      root.dataset.localAiClarity140Bound = "true";
      root.addEventListener("toggle", () => { if (root.open) render(); });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true });
  else bind();

  globalThis.AgentCryptoLocalAiUxClarity = Object.freeze({
    build: BUILD,
    owner: "local-ai-ux-clarity",
    presentation_only: true,
    atlas_start: false,
    current_mutation: false,
    analytical_mutation: false,
    timer: false,
    observer: false,
    storage_write: false,
    network: false,
    render,
    snapshot: () => readState(document.getElementById(ROOT_ID))
  });
})();
