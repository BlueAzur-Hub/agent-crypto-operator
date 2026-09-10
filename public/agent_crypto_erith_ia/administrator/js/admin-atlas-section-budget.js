(() => {
  "use strict";

  const BUILD = "40.3.25";
  const OWNER = "atlas_sectional_presentation_budget_v1";

  function esc(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function wrapNode(target, spec) {
    if (!target || target.closest?.("details.atlas-budget-section-40325")) return null;
    const parent = target.parentNode;
    if (!parent) return null;

    const details = document.createElement("details");
    details.className = "atlas-budget-section-40325";
    details.id = spec.id;
    details.dataset.budgetTone = spec.tone || "audit";
    details.dataset.budgetOwner = OWNER;
    details.dataset.defaultState = spec.open ? "open" : "closed";
    if (spec.open) details.open = true;

    const summary = document.createElement("summary");
    summary.className = "atlas-budget-summary-40325";
    summary.innerHTML = `
      <span class="atlas-budget-chevron-40325" aria-hidden="true">▶</span>
      <span class="atlas-budget-copy-40325"><b>${esc(spec.title)}</b><small>${esc(spec.subtitle || "")}</small></span>
      <span class="atlas-budget-badge-40325">${esc(spec.badge || "DÉTAILS")}</span>`;

    const body = document.createElement("div");
    body.className = "atlas-budget-body-40325";

    parent.insertBefore(details, target);
    details.append(summary, body);
    body.appendChild(target);

    details.addEventListener("toggle", () => {
      details.dataset.state = details.open ? "open" : "closed";
      try {
        window.dispatchEvent(new CustomEvent("atlas:presentation-budget-toggle", {
          detail: { build: BUILD, id: details.id, open: details.open }
        }));
      } catch (_) {}
    }, { passive: true });

    return details;
  }

  function wrapId(id, spec) {
    return wrapNode(document.getElementById(id), spec);
  }

  function init() {
    /* Question libre remains available but is not a daily-paint surface. */
    wrapNode(document.querySelector("#atlasLocalDialogue .atlas-local-question-panel"), {
      id: "atlasBudgetQuestion40325",
      title: "Question libre Atlas / Aerith",
      subtitle: "Routeur manuel et texte libre ; aucun besoin de l'afficher pendant le suivi CURRENT quotidien.",
      badge: "WARM",
      tone: "current"
    });

    /* Long free-question / Aerith markdown: header remains visible. */
    wrapId("atlasLocalResponse", {
      id: "atlasBudgetAerithResponse40325",
      title: "Conclusion / réponse complète",
      subtitle: "Le statut, les outils et la conclusion courte restent visibles ; le texte long s’ouvre à la demande.",
      badge: "WARM",
      tone: "current"
    });

    /* Duplicate/diagnostic stack is important but not required on every frame. */
    wrapId("atlasStableStack", {
      id: "atlasBudgetStableStack40325",
      title: "Pile locale — Interface / Control Center / Bridge / Ollama",
      subtitle: "État consolidé du poste producteur ; la carte d'identité Atlas/Aerith reste visible au-dessus.",
      badge: "WARM",
      tone: "current"
    });

    wrapId("atlasAnalyticalTruth", {
      id: "atlasBudgetAnalyticalTruth40325",
      title: "Vérité analytique & preuves",
      subtitle: "Empreinte, sources, Math Core, contradictions et preuve News ; ouvrir pour audit de qualité.",
      badge: "WARM",
      tone: "audit"
    });

    /* Memory owner moved first. Analytical Memory, Multi-Collector 39.7,
       Memory Health and Freeze subsequently anchor inside this closed body. */
    wrapId("atlasMemoryIntelligence", {
      id: "atlasBudgetMemory40325",
      title: "Mémoire, Analytical Memory, Health & Freeze",
      subtitle: "Market Memory détaillée · CURRENT analytiques · diagnostics · contrôles d’architecture.",
      badge: "AUDIT",
      tone: "memory"
    });

    /* Decision Board remains visible; only its multi-snapshot table is cold. */
    wrapId("decisionMemoryCompare", {
      id: "atlasBudgetDecisionHistory40325",
      title: "Comparaison historique du Decision Board",
      subtitle: "Snapshots précédents, écarts et tableau de comparaison.",
      badge: "COLD",
      tone: "audit"
    });

    wrapId("atlasScannerTruth37", {
      id: "atlasBudgetScanner40325",
      title: "Scanner Truth — hausses / baisses / volumes",
      subtitle: "Classements détaillés et provenance des cotations ; observation à la demande.",
      badge: "COLD",
      tone: "audit"
    });

    wrapId("atlasCurrentJournal33", {
      id: "atlasBudgetJournal40325",
      title: "Journal des CURRENT",
      subtitle: "Historique Atlas → NØX → Aerith et rapports archivés ; fermé au quotidien.",
      badge: "ARCHIVE",
      tone: "memory"
    });

    wrapId("atlasBookReadOnlyKnowledge", {
      id: "atlasBudgetBook40325",
      title: "Handoff Ryzen → Transformer Book",
      subtitle: "Miroir lecture seule, export/import et mémoire partagée.",
      badge: "HANDOFF",
      tone: "memory"
    });

    wrapId("atlasKnowledgeLibrary", {
      id: "atlasBudgetDictionary40325",
      title: "Dictionnaire Crypto / Banque / Bourse",
      subtitle: "56 définitions permanentes ; ouvrir seulement lorsqu’une recherche est nécessaire.",
      badge: "RÉFÉRENCE",
      tone: "memory"
    });

    wrapId("atlasSharedSynthesisContent", {
      id: "atlasBudgetSharedReport40325",
      title: "Synthèse Atlas/Aerith complète",
      subtitle: "Rapport consolidé multi-page conservé ; la vérité CURRENT reste visible dans les cartes au-dessus.",
      badge: "RAPPORT",
      tone: "audit"
    });

    /* Existing cross-navigation remains usable through the new outer disclosure. */
    document.getElementById("btnAtlasBookOpenDictionary")?.addEventListener("click", () => {
      const outer = document.getElementById("atlasBudgetDictionary40325");
      if (outer) outer.open = true;
    }, { passive: true });

    /* Boot curtain is only a first-paint guard. From here native closed details
       own visibility. This happens before protected runtime scripts start. */
    document.documentElement.classList.remove("atlas-budget-boot-40325");
    document.documentElement.dataset.atlasBudgetBuild = BUILD;

    globalThis.__AGENT_CRYPTO_ATLAS_SECTION_BUDGET_40325__ = Object.freeze({
      build: BUILD,
      owner: OWNER,
      presentation_only: true,
      default_closed: Object.freeze([
        "atlasBudgetQuestion40325",
        "atlasBudgetAerithResponse40325",
        "atlasBudgetStableStack40325",
        "atlasBudgetAnalyticalTruth40325",
        "atlasBudgetMemory40325",
        "atlasBudgetDecisionHistory40325",
        "atlasBudgetScanner40325",
        "atlasBudgetJournal40325",
        "atlasBudgetBook40325",
        "atlasBudgetDictionary40325",
        "atlasBudgetSharedReport40325"
      ]),
      moves_existing_nodes: true,
      clones_business_nodes: false,
      changes_market_core: false,
      changes_oracle: false,
      changes_v7: false,
      changes_math: false,
      changes_bridge: false,
      changes_window_manager: false
    });
  }

  try { init(); }
  catch (error) {
    document.documentElement.classList.remove("atlas-budget-boot-40325");
    console.error("[40.3.25] Atlas sectional presentation budget init failed", error);
  }
})();
