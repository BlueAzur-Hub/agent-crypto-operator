/* Agent-Crypto @erith.IA · Build 28.1.90
   Clean Shared Synthesis Core
   Autonomous module: one import route, one storage key, one boot, no shell patch.
*/
(() => {
  "use strict";

  const SCHEMA = "agent_crypto_shared_synthesis_v1";
  const STORAGE_SCHEMA = "agent_crypto_shared_synthesis_clean_storage_v1";
  const TRANSFER_PROFILE = "book_clean_v1";
  const STORAGE_KEY = "agent_crypto_shared_synthesis_clean_v1";
  const STORAGE_LIMIT_BYTES = 1_500_000;
  const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
  const REPORT_MODES = Object.freeze(["market", "top5", "math", "contradictions"]);
  const REPORT_LABELS = Object.freeze({
    market: "Résumé du marché",
    top5: "Analyse du Top 5",
    math: "Explication du Math Core",
    contradictions: "Contrôle des contradictions"
  });

  const runtime = {
    initialized: false,
    package: null,
    source: "none",
    persistence: { ok: false, bytes: 0, error: "non enregistrée" },
    observer: null,
    captureTimer: 0,
    lastFingerprint: ""
  };

  const byId = id => document.getElementById(id);
  const setText = (node, text) => { if (node) node.textContent = String(text ?? ""); };
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));

  function byteLength(text) {
    try { return new TextEncoder().encode(String(text || "")).byteLength; }
    catch { return unescape(encodeURIComponent(String(text || ""))).length; }
  }

  function safeDate(value) {
    const date = new Date(value || Date.now());
    return Number.isFinite(date.getTime()) ? date : new Date();
  }

  function releaseLabel() {
    try { return typeof ATLAS_RELEASE !== "undefined" ? ATLAS_RELEASE : "V2.0-alpha · Build 28.1.90"; }
    catch { return "V2.0-alpha · Build 28.1.90"; }
  }

  function reportLabel(mode) {
    return REPORT_LABELS[mode] || mode;
  }

  function normalizeReport(report, mode) {
    return {
      mode,
      label: String(report?.label || reportLabel(mode)),
      answer: String(report?.answer || "").replace(/\r\n?/g, "\n").trim(),
      profile: String(report?.profile || "atlas"),
      provider: String(report?.provider || "local"),
      model: String(report?.model || "modèle local"),
      time: report?.time || null,
      snapshotLabel: report?.snapshotLabel || report?.snapshot_label || null,
      fingerprint: report?.fingerprint || null,
      quality: report?.quality || "strict_contract_v2",
      modelCommentUsed: report?.modelCommentUsed === true || report?.model_comment_used === true
    };
  }

  function normalizeConclusion(conclusion) {
    return {
      answer: String(conclusion?.answer || "").replace(/\r\n?/g, "\n").trim(),
      profile: String(conclusion?.profile || "aerith"),
      provider: String(conclusion?.provider || "local"),
      model: String(conclusion?.model || "modèle local"),
      time: conclusion?.time || null,
      label: String(conclusion?.label || "Conclusion Aerith-10 Crypto"),
      eyebrow: String(conclusion?.eyebrow || "CONCLUSION AERITH-10 CRYPTO"),
      quality: conclusion?.quality || "strict_contract_v2",
      modelCommentUsed: conclusion?.modelCommentUsed === true || conclusion?.model_comment_used === true,
      fingerprint: conclusion?.fingerprint || null,
      meta: conclusion?.meta || null
    };
  }

  function normalizePackage(input) {
    if (!input || input.schema !== SCHEMA) {
      throw new Error("ce fichier n’est pas une synthèse Atlas/Aerith");
    }
    const reports = {};
    REPORT_MODES.forEach(mode => { reports[mode] = normalizeReport(input?.reports?.[mode], mode); });
    const snapshotAt = input?.snapshot_at
      || input?.snapshot?.strict_contract?.market?.timestamp
      || input?.snapshot?.generated_at
      || input?.generated_at
      || null;

    const normalized = {
      schema: SCHEMA,
      storage_schema: STORAGE_SCHEMA,
      transfer_profile: TRANSFER_PROFILE,
      generated_at: input?.generated_at || new Date().toISOString(),
      snapshot_at: snapshotAt,
      snapshot_label: String(input?.snapshot_label || (snapshotAt ? safeDate(snapshotAt).toLocaleString("fr-FR") : "Snapshot conservé")),
      fingerprint: String(input?.fingerprint || ""),
      origin: clone(input?.origin || {}),
      status: {
        atlas_reports: "4/4",
        aerith_conclusion: true,
        observation_only: true,
        human_validation_required: true,
        ...(clone(input?.status || {}))
      },
      summary_markdown: String(input?.summary_markdown || "").replace(/\r\n?/g, "\n").trim(),
      snapshot: {
        generated_at: input?.snapshot?.generated_at || snapshotAt || input?.generated_at || null,
        strict_contract: { market: { timestamp: snapshotAt } }
      },
      reports,
      conclusion: normalizeConclusion(input?.conclusion)
    };

    validate(normalized);
    return normalized;
  }

  function validate(pkg) {
    if (!pkg || pkg.schema !== SCHEMA) throw new Error("ce fichier n’est pas une synthèse Atlas/Aerith");
    if (!String(pkg.fingerprint || "").trim()) throw new Error("empreinte de synthèse absente");
    if (!String(pkg.summary_markdown || "").trim()) throw new Error("synthèse consolidée absente");
    for (const mode of REPORT_MODES) {
      if (!String(pkg?.reports?.[mode]?.answer || "").trim()) {
        throw new Error(`rapport Atlas manquant : ${reportLabel(mode)}`);
      }
    }
    if (!String(pkg?.conclusion?.answer || "").trim()) throw new Error("conclusion Aerith absente");
    return true;
  }

  function persistenceLabel() {
    if (runtime.persistence.ok) return `${Math.max(1, Math.round(runtime.persistence.bytes / 1024))} Ko vérifiés`;
    return runtime.persistence.error || "Non enregistrée";
  }

  function setStatus(state, message, badge) {
    const card = byId("atlasCleanSynthesisCard");
    if (card) card.dataset.state = state;
    setText(byId("atlasCleanSynthesisStatus"), message);
    const badgeNode = byId("atlasCleanSynthesisBadge");
    if (badgeNode) {
      badgeNode.textContent = badge;
      badgeNode.className = `pill ${state === "ready" ? "ok" : state === "error" || state === "warning" ? "warn" : ""}`.trim();
    }
  }

  function renderMarkdown(node, markdown) {
    if (!node) return;
    try {
      if (typeof atlasLocalSetReport === "function") {
        atlasLocalSetReport(node, markdown);
        return;
      }
    } catch {}
    node.textContent = String(markdown || "");
  }

  function render() {
    const pkg = runtime.package;
    const hasPackage = !!pkg;
    byId("btnAtlasCleanSynthesisCopy")?.toggleAttribute("disabled", !hasPackage);
    byId("btnAtlasCleanSynthesisExport")?.toggleAttribute("disabled", !hasPackage);

    if (!pkg) {
      setText(byId("atlasCleanSynthesisSnapshot"), "—");
      setText(byId("atlasCleanSynthesisOrigin"), "—");
      setText(byId("atlasCleanSynthesisReports"), "0/4");
      setText(byId("atlasCleanSynthesisConclusion"), "Absente");
      setText(byId("atlasCleanSynthesisPersistence"), "Non enregistrée");
      const summary = byId("atlasCleanSynthesisSummary");
      if (summary) summary.innerHTML = '<p class="atlas-local-response-empty">Aucune synthèse chargée. Sur le Ryzen, elle sera créée automatiquement après les quatre rapports Atlas et la conclusion Aerith.</p>';
      const list = byId("atlasCleanSynthesisReportList");
      if (list) list.hidden = true;
      return false;
    }

    setText(byId("atlasCleanSynthesisSnapshot"), pkg.snapshot_label || "—");
    setText(byId("atlasCleanSynthesisOrigin"), pkg.origin?.machine || "Ryzen");
    setText(byId("atlasCleanSynthesisReports"), "4/4");
    setText(byId("atlasCleanSynthesisConclusion"), "Disponible");
    setText(byId("atlasCleanSynthesisPersistence"), persistenceLabel());
    renderMarkdown(byId("atlasCleanSynthesisSummary"), pkg.summary_markdown);

    REPORT_MODES.forEach(mode => {
      const report = pkg.reports[mode];
      renderMarkdown(document.querySelector(`[data-clean-report-content="${mode}"]`), report.answer);
      setText(document.querySelector(`[data-clean-report-meta="${mode}"]`), `${report.snapshotLabel || pkg.snapshot_label} · ${report.model}`);
    });
    renderMarkdown(byId("atlasCleanSynthesisConclusionContent"), pkg.conclusion.answer);
    setText(byId("atlasCleanSynthesisConclusionMeta"), `${pkg.conclusion.time ? safeDate(pkg.conclusion.time).toLocaleString("fr-FR") : pkg.snapshot_label} · ${pkg.conclusion.model}`);
    const list = byId("atlasCleanSynthesisReportList");
    if (list) list.hidden = false;
    return true;
  }

  function persist(pkg) {
    let previous = null;
    try {
      previous = localStorage.getItem(STORAGE_KEY);
      const clean = normalizePackage(pkg);
      const raw = JSON.stringify(clean);
      const bytes = byteLength(raw);
      if (bytes > STORAGE_LIMIT_BYTES) throw new Error(`synthèse trop volumineuse (${Math.ceil(bytes / 1024)} Ko)`);
      localStorage.setItem(STORAGE_KEY, raw);
      const verifiedRaw = localStorage.getItem(STORAGE_KEY);
      if (verifiedRaw !== raw) throw new Error("relecture locale différente de l’écriture");
      const verified = normalizePackage(JSON.parse(verifiedRaw));
      if (verified.fingerprint !== clean.fingerprint) throw new Error("empreinte différente après relecture");
      runtime.persistence = { ok: true, bytes, error: "", package: verified };
      return runtime.persistence;
    } catch (error) {
      try {
        if (previous === null) localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, previous);
      } catch {}
      runtime.persistence = { ok: false, bytes: 0, error: error?.message || "stockage local refusé", package: null };
      return runtime.persistence;
    }
  }

  function activate(pkg, source, persistence = null) {
    const clean = normalizePackage(pkg);
    runtime.package = clean;
    runtime.source = source;
    runtime.lastFingerprint = clean.fingerprint;
    if (persistence) runtime.persistence = persistence;
    render();
    return clean;
  }

  function restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setStatus("idle", "Import prêt · choisis uniquement un fichier de synthèse Atlas/Aerith créé sur le Ryzen.", "Prêt");
        render();
        return false;
      }
      const pkg = normalizePackage(JSON.parse(raw));
      const persistence = { ok: true, bytes: byteLength(raw), error: "", package: pkg };
      activate(pkg, "restored", persistence);
      setStatus("ready", "Synthèse restaurée automatiquement · 4/4 rapports Atlas · conclusion Aerith disponible.", "Restaurée");
      return true;
    } catch (error) {
      runtime.package = null;
      runtime.persistence = { ok: false, bytes: 0, error: error?.message || "mémoire locale illisible" };
      setStatus("warning", `Mémoire locale ignorée : ${runtime.persistence.error}. L’import reste disponible.`, "Import prêt");
      render();
      return false;
    }
  }

  async function importFile(event) {
    const input = event?.currentTarget;
    const file = input?.files?.[0];
    if (!file) {
      setStatus("idle", "Import prêt · aucun fichier sélectionné.", "Prêt");
      return false;
    }

    setStatus("working", `Fichier sélectionné · ${file.name || "synthèse Ryzen"} · lecture en cours…`, "Lecture");
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error("fichier supérieur à 5 Mo");
      const raw = await file.text();
      setStatus("working", "Fichier lu · vérification des quatre rapports et de la conclusion…", "Validation");
      const pkg = normalizePackage(JSON.parse(raw));

      // Import and display never depend on localStorage success.
      activate(pkg, "imported", { ok: false, bytes: 0, error: "écriture en cours" });
      const saved = persist(pkg);
      render();
      if (saved.ok) {
        setStatus("ready", `Import terminé · 4/4 rapports Atlas · conclusion Aerith · conservation locale vérifiée (${Math.max(1, Math.round(saved.bytes / 1024))} Ko).`, "Importée");
      } else {
        setStatus("warning", `Import affiché · conservation locale impossible : ${saved.error}.`, "Importée sans mémoire");
      }
      return true;
    } catch (error) {
      setStatus("error", `Import refusé : ${error?.message || "fichier JSON invalide"}.`, "Erreur");
      return false;
    } finally {
      if (input) input.value = "";
    }
  }

  function download(name, type, text) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    if (!runtime.package) return false;
    const raw = JSON.stringify(normalizePackage(runtime.package));
    const stamp = safeDate(runtime.package.generated_at).toISOString().replace(/[:.]/g, "-");
    download(`agent_crypto_synthesis_book_${stamp}.json`, "application/json;charset=utf-8", raw);
    setStatus("ready", `JSON Book exporté · ${Math.max(1, Math.round(byteLength(raw) / 1024))} Ko.`, "Disponible");
    return true;
  }

  async function copySummary() {
    const text = runtime.package?.summary_markdown;
    if (!text) return false;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setStatus("ready", "Synthèse copiée dans le presse-papiers.", "Disponible");
    return true;
  }

  function buildSummary(snapshot) {
    const contract = snapshot?.strict_contract || {};
    const market = contract.market || {};
    const breadth = market.breadth_24h || {};
    const top5 = contract.canonical_top5 || {};
    const assets = Array.isArray(top5.assets) ? top5.assets : [];
    const graph = contract.graph || {};
    const math = contract.math || {};
    const risk = math.historical_risk || {};
    const lines = [
      "**1. État des sources**",
      `- Marché : ${market.status || "état conservé"} · univers ${market.assets_loaded ?? "—"}/${market.target_assets ?? "—"} · ${market.quote_currency || "EUR"}.`,
      "",
      "**2. Lecture globale**",
      `- Largeur 24 h : ${breadth.positive ?? "—"} hausses · ${breadth.negative ?? "—"} baisses · ${breadth.stable ?? "—"} stables · ${breadth.classification || "classification indisponible"}.`,
      "",
      "**3. Target Top 5 canonique**",
      `- ${assets.map(row => `${row.symbol || "?"} ${Number.isFinite(Number(row.change_24h_pct)) ? `${Number(row.change_24h_pct) >= 0 ? "+" : ""}${Number(row.change_24h_pct).toFixed(2)} %` : "—"}`).join(" · ") || "Données conservées dans les rapports Atlas."}`,
      "",
      "**4. Graphique et Math Core**",
      `- Graphique : ${graph.period_label || "période conservée"} · ${graph.truth_label || graph.provider || "source conservée"} · ${Array.isArray(graph.series) ? graph.series.length : 0} séries.`,
      `- Math Core : ${math.asset || "actif conservé"} · volatilité fenêtre ${risk.realized_volatility_window_pct ?? "—"} % · drawdown maximal ${risk.max_drawdown_pct ?? "—"} %.`,
      "",
      "**5. Gouvernance**",
      "- Lecture seule. Validation humaine obligatoire. Aucun ordre, wallet, clé privée ou écriture GitHub."
    ];
    return lines.join("\n");
  }

  function currentProducerPackage() {
    try {
      if (typeof atlasLocalReportsState === "undefined" || typeof atlasLocalDialogueState === "undefined") return null;
      const reports = {};
      for (const mode of REPORT_MODES) {
        const report = atlasLocalReportsState.reports?.[mode];
        if (!String(report?.answer || "").trim()) return null;
        reports[mode] = normalizeReport(report, mode);
      }
      const conclusion = normalizeConclusion(atlasLocalDialogueState.conclusionResponse);
      if (!conclusion.answer) return null;
      const fingerprint = String(reports.market.fingerprint || atlasLocalReportsState.lastCompletedFingerprint || conclusion.fingerprint || "").trim();
      if (!fingerprint) return null;
      if (REPORT_MODES.some(mode => reports[mode].fingerprint && reports[mode].fingerprint !== fingerprint)) return null;
      if (conclusion.fingerprint && conclusion.fingerprint !== fingerprint) return null;

      let snapshot = clone(atlasLocalReportsState.lastCompletedSnapshot || null);
      if (!snapshot && typeof atlasBuildCryptoPageSnapshot === "function") snapshot = atlasBuildCryptoPageSnapshot();
      if (!snapshot) return null;
      const snapshotAt = snapshot?.strict_contract?.market?.timestamp || snapshot?.generated_at || new Date().toISOString();
      const snapshotLabel = reports.market.snapshotLabel
        || (typeof atlasLocalReportSnapshotLabel === "function" ? atlasLocalReportSnapshotLabel(snapshot) : safeDate(snapshotAt).toLocaleString("fr-FR"));
      const provider = conclusion.provider || reports.market.provider || "local";
      const model = conclusion.model || reports.market.model || "modèle local";

      return normalizePackage({
        schema: SCHEMA,
        generated_at: new Date().toISOString(),
        snapshot_at: snapshotAt,
        snapshot_label: snapshotLabel,
        fingerprint,
        origin: {
          machine: "ryzen7-christophe",
          interface: releaseLabel(),
          bridge: "V1.7.4",
          provider,
          model
        },
        status: {
          atlas_reports: "4/4",
          aerith_conclusion: true,
          observation_only: true,
          human_validation_required: true
        },
        summary_markdown: buildSummary(snapshot),
        snapshot,
        reports,
        conclusion
      });
    } catch (error) {
      console.debug("Shared synthesis producer unavailable", error);
      return null;
    }
  }

  function captureProducer() {
    const pkg = currentProducerPackage();
    if (!pkg || pkg.fingerprint === runtime.lastFingerprint) return false;
    activate(pkg, "producer", { ok: false, bytes: 0, error: "écriture en cours" });
    const saved = persist(pkg);
    render();
    if (saved.ok) {
      setStatus("ready", `Synthèse Ryzen créée automatiquement · 4/4 rapports Atlas · conclusion Aerith · ${Math.max(1, Math.round(saved.bytes / 1024))} Ko vérifiés.`, "Produite");
    } else {
      setStatus("warning", `Synthèse Ryzen créée et affichée · conservation locale impossible : ${saved.error}.`, "Produite sans mémoire");
    }
    return true;
  }

  function scheduleCapture() {
    window.clearTimeout(runtime.captureTimer);
    runtime.captureTimer = window.setTimeout(captureProducer, 250);
  }

  function observeProducer() {
    const targets = [
      byId("atlasLocalReportMarket"),
      byId("atlasLocalReportTop5"),
      byId("atlasLocalReportMath"),
      byId("atlasLocalReportContradictions"),
      byId("atlasLocalResponse")
    ].filter(Boolean);
    if (!targets.length || typeof MutationObserver !== "function") return;
    runtime.observer = new MutationObserver(scheduleCapture);
    targets.forEach(target => runtime.observer.observe(target, { childList: true, subtree: true, characterData: true }));
  }

  function init() {
    if (runtime.initialized) return true;
    const input = byId("atlasCleanSynthesisImport");
    if (!input) return false;
    runtime.initialized = true;
    input.addEventListener("change", importFile);
    byId("btnAtlasCleanSynthesisExport")?.addEventListener("click", exportJson);
    byId("btnAtlasCleanSynthesisCopy")?.addEventListener("click", copySummary);
    restore();
    observeProducer();
    window.setTimeout(captureProducer, 0);
    return true;
  }

  window.AgentCryptoSharedSynthesis = Object.freeze({
    init,
    restore,
    importFile,
    exportJson,
    captureProducer,
    diagnostics: () => ({
      initialized: runtime.initialized,
      source: runtime.source,
      fingerprint: runtime.package?.fingerprint || "",
      reports: runtime.package ? REPORT_MODES.filter(mode => runtime.package.reports?.[mode]?.answer).length : 0,
      conclusion: !!runtime.package?.conclusion?.answer,
      persistence: clone(runtime.persistence),
      storageKey: STORAGE_KEY
    })
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
