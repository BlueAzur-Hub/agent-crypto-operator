/* Agent-Crypto @erith.IA — 40.6.142 MEMORY BOUNDARY DEDUPE
   Presentation only. Clarifies Shared Memory vs GitHub Memory without adding
   synchronization, upload, network, storage ownership or automatic import.
   40.6.142 makes the presentation idempotent across repeated render/hydration. */
(() => {
  "use strict";

  const BUILD = "40.6.142";
  const OWNER = "memory-boundary-presentation";
  /* Keep the 40.6.141 style/id names for cache/release compatibility. */
  const STYLE_ID = "agentCryptoMemoryBoundary141Style";
  const PANEL_CLASS = "ac-memory-boundary-141";

  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function findRoot(id, label) {
    const direct = document.getElementById(id);
    if (direct) return direct.closest("details,section,article,.panel,.card") || direct;
    const wanted = normalize(label);
    const summaries = [...document.querySelectorAll("details > summary")];
    const summary = summaries.find(node => normalize(node.textContent).includes(wanted));
    if (summary) return summary.parentElement;
    const headings = [...document.querySelectorAll("h2,h3,h4,strong")];
    const heading = headings.find(node => normalize(node.textContent) === wanted);
    return heading?.closest("details,section,article,.panel,.card") || null;
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .ac-memory-boundary-141{margin:10px 0 12px;padding:13px;border:1px solid rgba(116,214,230,.20);border-radius:13px;background:linear-gradient(145deg,rgba(5,20,31,.90),rgba(10,18,32,.86));box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}
      .ac-memory-boundary-141[data-kind="github"]{border-color:rgba(178,143,255,.22);background:linear-gradient(145deg,rgba(16,14,35,.88),rgba(8,20,31,.86))}
      .ac-memory-boundary-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px}
      .ac-memory-boundary-head>div{display:grid;gap:3px}.ac-memory-boundary-kicker{color:#79d9e8;font:950 8px/1 system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase}
      [data-kind="github"] .ac-memory-boundary-kicker{color:#c7a7ff}.ac-memory-boundary-head strong{color:#fff1b8;font:950 14px/1.2 system-ui,sans-serif}.ac-memory-boundary-head small{color:#829eab;font:700 9px/1.4 system-ui,sans-serif}
      .ac-memory-boundary-badge{padding:5px 8px;border:1px solid rgba(102,236,212,.28);border-radius:999px;color:#aaf7df;background:rgba(28,143,114,.08);font:950 8px/1 system-ui,sans-serif;letter-spacing:.06em;white-space:nowrap}
      [data-kind="github"] .ac-memory-boundary-badge{border-color:rgba(194,158,255,.28);color:#d8c3ff;background:rgba(119,79,191,.08)}
      .ac-memory-boundary-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}.ac-memory-boundary-card{min-width:0;padding:9px 10px;border:1px solid rgba(115,202,218,.13);border-radius:10px;background:rgba(1,12,21,.50)}
      .ac-memory-boundary-card>span{display:block;margin-bottom:5px;color:#7195a3;font:900 8px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}.ac-memory-boundary-card>strong{display:block;color:#e4f8fb;font:950 11px/1.25 system-ui,sans-serif;overflow-wrap:anywhere}.ac-memory-boundary-card>small{display:block;margin-top:4px;color:#78919d;font:700 8.5px/1.35 system-ui,sans-serif}
      .ac-memory-boundary-note{margin-top:9px;padding:8px 9px;border-left:3px solid rgba(104,220,237,.45);background:rgba(39,137,156,.07);color:#8cabb6;font:730 9px/1.45 system-ui,sans-serif}.ac-memory-boundary-note b{color:#ddf7fb}[data-kind="github"] .ac-memory-boundary-note{border-left-color:rgba(190,151,255,.50);background:rgba(119,79,191,.06)}
      @media(max-width:1180px){.ac-memory-boundary-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:760px){.ac-memory-boundary-grid{grid-template-columns:1fr 1fr}.ac-memory-boundary-head{flex-direction:column}}@media(max-width:520px){.ac-memory-boundary-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function sharedStats() {
    const local = document.getElementById("sharedLocalCount")?.textContent?.trim() || "—";
    const collectors = document.getElementById("sharedCollectorsCount")?.textContent?.trim() || "—";
    return { local, collectors, api: Boolean(globalThis.AgentCryptoSharedMemory) };
  }

  function makePanel(kind) {
    const shared = kind === "shared";
    const panel = document.createElement("section");
    panel.className = PANEL_CLASS;
    panel.dataset.kind = kind;
    panel.dataset.presentationOnly = "true";
    panel.dataset.owner = OWNER;

    if (shared) {
      const stats = sharedStats();
      panel.innerHTML = `
        <div class="ac-memory-boundary-head"><div><span class="ac-memory-boundary-kicker">MÉMOIRE · FRONTIÈRE DE VÉRITÉ</span><strong>Shared Memory · transfert par machine</strong><small>Le fichier JSON est un pont volontaire entre collecteurs; ce n’est pas une synchronisation réseau.</small></div><span class="ac-memory-boundary-badge">LOCAL + FICHIER · VOLONTAIRE</span></div>
        <div class="ac-memory-boundary-grid">
          <div class="ac-memory-boundary-card"><span>OWNER LOCAL</span><strong>IndexedDB Collector</strong><small>Persistance locale du Market Memory.</small></div>
          <div class="ac-memory-boundary-card"><span>CONTENU</span><strong>MARKET uniquement</strong><small>CURRENT analytique conservé séparément.</small></div>
          <div class="ac-memory-boundary-card"><span>TRANSFERT</span><strong>Export / import JSON</strong><small>Action explicite de l’opérateur.</small></div>
          <div class="ac-memory-boundary-card"><span>LECTURE LOCALE</span><strong>${stats.local}</strong><small>Collecteurs visibles : ${stats.collectors}.</small></div>
          <div class="ac-memory-boundary-card"><span>RÉSEAU</span><strong>0 SYNCHRO AUTO</strong><small>Aucun backend ajouté par cette couche.</small></div>
        </div>
        <div class="ac-memory-boundary-note"><b>Contrat :</b> l’import doit rester fail-closed, vérifié après persistance et relu avant succès. Exporter un fichier ne modifie pas la mémoire distante d’une autre machine.</div>`;
    } else {
      panel.innerHTML = `
        <div class="ac-memory-boundary-head"><div><span class="ac-memory-boundary-kicker">GITHUB · FRONTIÈRE DE VÉRITÉ</span><strong>GitHub Memory · source versionnée</strong><small>GitHub est une source commune et traçable; il n’est pas la mémoire locale courante du Firefox.</small></div><span class="ac-memory-boundary-badge">SOURCE · VERSIONNÉE</span></div>
        <div class="ac-memory-boundary-grid">
          <div class="ac-memory-boundary-card"><span>RÔLE</span><strong>Source commune</strong><small>Repères partagés et historique versionné.</small></div>
          <div class="ac-memory-boundary-card"><span>LOCAL</span><strong>RESTE DISTINCT</strong><small>IndexedDB / localStorage ne deviennent pas GitHub automatiquement.</small></div>
          <div class="ac-memory-boundary-card"><span>IMPORT</span><strong>VOLONTAIRE</strong><small>Une source GitHub doit être lue ou importée explicitement.</small></div>
          <div class="ac-memory-boundary-card"><span>SYNC AUTO</span><strong>NON ASSERTÉE</strong><small>Cette couche n’invente aucun backend de synchronisation.</small></div>
          <div class="ac-memory-boundary-card"><span>PRIVÉ</span><strong>NE PAS PUBLIER</strong><small>La mémoire privée reste hors du dépôt public.</small></div>
        </div>
        <div class="ac-memory-boundary-note"><b>Contrat :</b> dépôt GitHub ≠ mémoire runtime ≠ CURRENT analytique. Une donnée versionnée ne devient mémoire active qu’après une action explicite et vérifiable.</div>`;
    }
    return panel;
  }

  function ownedPanels(kind) {
    return [...document.querySelectorAll(`.${PANEL_CLASS}[data-kind="${kind}"]`)]
      .filter(node => node.dataset.owner === OWNER || node.id === `agentCryptoMemoryBoundary141-${kind}`);
  }

  function placePanel(root, panel) {
    const summary = root.matches("details") ? root.querySelector(":scope > summary") : null;
    if (summary?.nextSibling) root.insertBefore(panel, summary.nextSibling);
    else root.prepend(panel);
  }

  function attach(kind, id, label) {
    const root = findRoot(id, label);
    if (!root) return false;
    const panelId = `agentCryptoMemoryBoundary141-${kind}`;
    const matches = ownedPanels(kind);
    let panel = matches.find(node => root.contains(node)) || matches[0] || null;

    if (!panel) panel = makePanel(kind);
    for (const extra of matches) if (extra !== panel) extra.remove();

    /* Keep the legacy id so a stale 40.6.141 script cannot append a second panel. */
    panel.id = panelId;
    panel.dataset.kind = kind;
    panel.dataset.owner = OWNER;
    panel.dataset.presentationOnly = "true";
    const fresh = makePanel(kind);
    panel.innerHTML = fresh.innerHTML;

    const summary = root.matches("details") ? root.querySelector(":scope > summary") : null;
    if (panel.parentElement !== root || (summary && panel.previousElementSibling !== summary)) placePanel(root, panel);

    /* Final semantic sweep closes duplicate panels left by a previous hydration owner. */
    for (const extra of ownedPanels(kind)) if (extra !== panel) extra.remove();

    root.dataset.memoryBoundary141 = "true";
    root.dataset.memoryBoundaryDedupe = BUILD;
    return true;
  }

  function render() {
    installStyle();
    const shared = attach("shared", "shared-memory", "Shared Memory");
    const github = attach("github", "github-memory", "GitHub Memory");
    return Object.freeze({ shared, github, shared_panels: ownedPanels("shared").length, github_panels: ownedPanels("github").length });
  }

  function bind() {
    const result = render();
    for (const [id, label] of [["shared-memory","Shared Memory"],["github-memory","GitHub Memory"]]) {
      const root = findRoot(id, label);
      if (root?.matches("details") && root.dataset.memoryBoundaryDedupeBound !== "true") {
        root.dataset.memoryBoundaryDedupeBound = "true";
        root.addEventListener("toggle", () => { if (root.open) render(); });
      }
    }
    return result;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true });
  else bind();

  globalThis.AgentCryptoMemoryBoundaryPresentation = Object.freeze({
    build: BUILD,
    owner: OWNER,
    presentation_only: true,
    semantic_dedupe: true,
    synchronization_added: false,
    upload_added: false,
    network_added: false,
    storage_owner_added: false,
    automatic_import_added: false,
    timer: false,
    observer: false,
    render
  });
})();
