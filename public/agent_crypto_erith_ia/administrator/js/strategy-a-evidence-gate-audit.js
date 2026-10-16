/* Agent-Crypto @erith.IA — 40.6.157 STRATEGY A FOUNDATION PROOF ACTION
   Read-only evidence audit companion inside PREUVES CROISÉES.
   It classifies what already exists, what is explicitly testable, what remains missing,
   and what is deliberately locked. It never promotes a certification gate.
*/
(() => {
  "use strict";

  const RELEASE = "40.6.157";
  let LAST_FOUNDATION_RUN = null;
  const OWNER = "strategy-a-evidence-gate-audit";
  const ROOT_ID = "strategyAEvidenceGateAudit";
  const STYLE_ID = "strategyAEvidenceGateAuditStyle";

  const byId = id => document.getElementById(id);
  const safeCall = (fn, fallback = null) => {
    try { return typeof fn === "function" ? fn() : fallback; }
    catch (_) { return fallback; }
  };
  const escapeHtml = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  function auditGate(gate, evidence, safetyApi, paperProof) {
    const n = Number(gate?.gate || 0);
    const rawState = String(gate?.state || "UNKNOWN").toUpperCase();
    const label = String(gate?.label || `GATE ${n}`);
    const exp = evidence?.dataset?.experiment || {};
    const aft = evidence?.dataset?.after_cost || {};
    const afterSummary = evidence?.after_cost?.summary || {};
    const cycles = Number(evidence?.experiment_ledger?.summary?.cycles || 0);
    const afterTrades = Number(afterSummary?.trades || 0);

    let auditState = ["PASS", "FOUNDATION_PASS"].includes(rawState) ? "PASS" : "WAIT";
    let tone = auditState === "PASS" ? "ok" : "wait";
    let owner = "Strategy A certification matrix";
    let evidenceText = gate?.note ? String(gate.note) : "Aucune preuve soldante raccordée.";
    let next = "Conserver WAIT jusqu’à preuve explicite.";

    if (n === 1) {
      owner = "Evidence Dossier · datasetReadiness";
      evidenceText = `Ledger cycles=${cycles} · intégrité cycles=${exp.data_integrity_ready === true ? "OK" : "NON"} · after-cost rows=${afterTrades} · intégrité after-cost=${aft.data_integrity_ready === true ? "OK" : "NON"}.`;
      next = aft.data_integrity_ready === true && exp.data_integrity_ready === true
        ? "Dataset structurellement prêt ; une règle de certification explicite reste nécessaire."
        : "Résoudre IDs / timestamps / chronologie / lignes after-cost complètes avant certification.";
    } else if (n === 2) {
      owner = "Safety Certification · run_foundation_tests";
      const testAvailable = typeof safetyApi?.run_foundation_tests === "function";
      if (auditState !== "PASS" && testAvailable) {
        auditState = "TEST DISPONIBLE";
        tone = "test";
      }
      evidenceText = paperProof?.pass === true
        ? "Preuve Paper lifecycle + after-cost 19/19 présente ; la matrice de fondation attend encore son test explicite replay/lifecycle/after-cost/bridge."
        : "Le test explicite de fondation existe mais n’est pas soldé dans cette session.";
      next = auditState === "PASS" ? "Aucune dette sur cette gate." : "Exécuter explicitement les tests de fondation ; aucune exécution automatique.";
    } else if (n === 3) {
      owner = "Evidence Dossier · historical realistic backtest dataset";
      evidenceText = `backtest_ready=${evidence?.dataset?.after_cost?.backtest_ready === true ? "true" : "false"} · aucune fabrication autorisée.`;
      next = "Fournir un dataset de replay marché historique réaliste + labels d’outcome certifiés.";
    } else if (n === 4) {
      owner = "Evidence Dossier · out-of-sample holdout";
      evidenceText = `out_of_sample_ready=${evidence?.dataset?.after_cost?.out_of_sample_ready === true ? "true" : "false"}.`;
      next = "Définir un holdout OOS réellement séparé du réglage et produire sa preuve.";
    } else if (n === 5) {
      owner = "Evidence Dossier · walk-forward windows";
      evidenceText = `walk_forward_ready=${evidence?.dataset?.after_cost?.walk_forward_ready === true ? "true" : "false"}.`;
      next = "Créer des fenêtres train/test successives et conserver leurs résultats séparément.";
    } else if (n === 6) {
      owner = "Evidence Dossier · Monte Carlo readiness";
      const ready = aft.monte_carlo_ready === true;
      if (auditState !== "PASS" && ready) {
        auditState = "DATASET PRÊT";
        tone = "test";
      }
      evidenceText = `monte_carlo_ready=${ready ? "true" : "false"} · lignes after-cost complètes=${Number(aft.after_cost_complete_rows || 0)} · minimum attendu par l’owner : 30.`;
      next = ready ? "Exécuter puis certifier Monte Carlo / stress sans changer les observations sources." : "Accumuler ≥30 trades PAPER after-cost complets et VERIFIED avant stress.";
    } else if (n === 7) {
      owner = "Safety Certification · circuit breakers + foundation tests";
      const testAvailable = typeof safetyApi?.run_foundation_tests === "function";
      if (auditState !== "PASS" && testAvailable) {
        auditState = "TEST DISPONIBLE";
        tone = "test";
      }
      evidenceText = gate?.note ? String(gate.note) : "Circuit breakers présents ; preuve explicite de fondation requise.";
      next = auditState === "PASS" ? "Aucune dette sur cette gate." : "Exécuter explicitement la fondation et vérifier DATA_STALE / UNKNOWN / PROTECTION_FAILURE.";
    } else if (n === 8) {
      owner = "After-Cost Metrics + Experiment Ledger";
      evidenceText = `${afterTrades} trade(s) après coûts · sample_state=${String(afterSummary?.sample_state || rawState)} · coût complet=${afterSummary?.cost_model_complete === true ? "oui" : "non"} · cycles=${cycles}.`;
      next = afterTrades > 0
        ? "Continuer l’observation PAPER jusqu’au seuil d’échantillon et à la complétude des coûts."
        : "Aucun trade after-cost certifiable : continuer PAPER sans forcer de trade.";
    } else if (n === 9) {
      owner = "Safety Certification · micro_live_locked";
      auditState = rawState === "LOCKED" ? "LOCKED" : auditState;
      tone = "locked";
      evidenceText = "Micro-live explicitement verrouillé par le contrat de sécurité.";
      next = "Ne pas déverrouiller tant que les gates amont ne sont pas soldées et qu’une validation humaine explicite n’existe pas.";
    }

    return Object.freeze({ gate: n, label, raw_state: rawState, audit_state: auditState, tone, owner, evidence: evidenceText, next });
  }

  function snapshot() {
    const evidenceApi = globalThis.AgentCryptoStrategyAEvidenceDossier || null;
    const safetyApi = globalThis.AgentCryptoStrategyASafetyCertification || null;
    const paperAcceptance = globalThis.AgentCryptoStrategyAPaperAfterCostAcceptance || null;
    const evidence = safeCall(evidenceApi?.snapshot, null);
    const matrix = safeCall(safetyApi?.certification_matrix, null);
    const paperProof = safeCall(paperAcceptance?.read, null);
    const gates = Array.isArray(matrix?.gates)
      ? matrix.gates
      : Array.isArray(evidence?.certification?.gates) ? evidence.certification.gates : [];
    const rows = gates.map(gate => auditGate(gate, evidence, safetyApi, paperProof));
    const counts = rows.reduce((acc, row) => {
      const k = row.audit_state;
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return Object.freeze({
      release: RELEASE,
      owner: OWNER,
      rows,
      counts: Object.freeze(counts),
      evidence_available: !!evidence,
      certification_available: !!matrix,
      paper_acceptance_receipt: paperProof,
      passive_read: true,
      certification_changed: false,
      explicit_foundation_test_action: true,
      automatic_tests: false,
      paper_only: true,
      real_order: false
    });
  }

  function runFoundationProof() {
    const safetyApi = globalThis.AgentCryptoStrategyASafetyCertification || null;
    if (typeof safetyApi?.run_foundation_tests !== "function") {
      LAST_FOUNDATION_RUN = Object.freeze({ pass: false, reason: "FOUNDATION_TEST_OWNER_UNAVAILABLE", at: new Date().toISOString() });
      render();
      return LAST_FOUNDATION_RUN;
    }
    try {
      const result = safetyApi.run_foundation_tests();
      LAST_FOUNDATION_RUN = Object.freeze({ ...(result || {}), at: result?.at || new Date().toISOString() });
    } catch (error) {
      LAST_FOUNDATION_RUN = Object.freeze({ pass: false, reason: String(error?.message || error), at: new Date().toISOString() });
    }
    try { globalThis.AgentCryptoStrategyAPaperV2ProofBridge?.render?.(); } catch (_) {}
    try { requestAnimationFrame(() => render()); } catch (_) { render(); }
    return LAST_FOUNDATION_RUN;
  }

  function installStyle() {
    if (byId(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}{margin:8px 0 2px;padding:9px;border:1px solid rgba(111,188,255,.18);border-radius:9px;background:rgba(7,15,30,.38)}
      #${ROOT_ID} .saga-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}
      #${ROOT_ID} .saga-title{font:950 9px/1.25 system-ui,sans-serif;letter-spacing:.08em;color:#b8d8ff;text-transform:uppercase}
      #${ROOT_ID} .saga-sub{margin-top:3px;font:600 8px/1.4 system-ui,sans-serif;color:#829ab0}
      #${ROOT_ID} .saga-counts{font:850 8px/1.25 system-ui,sans-serif;color:#b7c7d3}
      #${ROOT_ID} .saga-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
      #${ROOT_ID} .saga-run{white-space:nowrap}
      #${ROOT_ID} .saga-receipt{margin-top:7px;padding:7px 8px;border:1px solid rgba(102,207,255,.18);border-radius:7px;background:rgba(37,111,146,.08);font:650 8px/1.4 system-ui,sans-serif;color:#9fcfe5}
      #${ROOT_ID} .saga-receipt[data-pass="true"]{border-color:rgba(102,240,171,.25);color:#9be8bd}
      #${ROOT_ID} .saga-receipt[data-pass="false"]{border-color:rgba(255,118,160,.24);color:#f5a4bd}
      #${ROOT_ID} .saga-list{display:grid;gap:5px;margin-top:8px}
      #${ROOT_ID} .saga-row{display:grid;grid-template-columns:28px minmax(160px,.75fr) minmax(0,2.2fr) auto;gap:8px;align-items:start;padding:7px 8px;border:1px solid rgba(255,255,255,.055);border-radius:7px;background:rgba(3,12,22,.48)}
      #${ROOT_ID} .saga-n{font:900 8px/1.2 system-ui,sans-serif;color:#7896aa;padding-top:2px}
      #${ROOT_ID} .saga-name b{display:block;font:850 9px/1.3 system-ui,sans-serif;color:#f1f6fa}
      #${ROOT_ID} .saga-name small{display:block;margin-top:2px;font:600 7.5px/1.3 system-ui,sans-serif;color:#7890a5}
      #${ROOT_ID} .saga-proof{font:550 8px/1.4 system-ui,sans-serif;color:#9aafbd}
      #${ROOT_ID} .saga-proof b{color:#cfe0eb}
      #${ROOT_ID} .saga-next{display:block;margin-top:3px;color:#7f94a3}
      #${ROOT_ID} .saga-state{white-space:nowrap;padding:4px 6px;border-radius:999px;border:1px solid rgba(255,210,92,.24);font:900 7.5px/1 system-ui,sans-serif;color:#ffd85e}
      #${ROOT_ID} .saga-row[data-tone="ok"] .saga-state{border-color:rgba(102,240,171,.28);color:#8af3bd}
      #${ROOT_ID} .saga-row[data-tone="test"] .saga-state{border-color:rgba(102,207,255,.28);color:#82ddff}
      #${ROOT_ID} .saga-row[data-tone="locked"] .saga-state{border-color:rgba(255,118,160,.24);color:#ff9bbc}
      #${ROOT_ID} .saga-foot{margin-top:7px;font:600 7.5px/1.35 system-ui,sans-serif;color:#6f879a}
      @media(max-width:1050px){#${ROOT_ID} .saga-row{grid-template-columns:26px minmax(0,1fr) auto}#${ROOT_ID} .saga-proof{grid-column:2 / span 2}}
    `;
    document.head.appendChild(style);
  }

  function render() {
    if (typeof document === "undefined") return false;
    installStyle();
    const bridge = byId("strategyAPaperV2ProofBridge");
    const anchor = bridge?.querySelector(".sapv2-gates") || bridge?.querySelector(".sapv2-wait");
    if (!bridge || !anchor) return false;

    let root = byId(ROOT_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = ROOT_ID;
      anchor.insertAdjacentElement("afterend", root);
    }

    const data = snapshot();
    const c = data.counts;
    const summary = [
      `${c.PASS || 0} PASS`,
      `${c["TEST DISPONIBLE"] || 0} TEST DISPONIBLE`,
      `${c["DATASET PRÊT"] || 0} DATASET PRÊT`,
      `${c.WAIT || 0} WAIT`,
      `${c.LOCKED || 0} LOCKED`
    ].join(" · ");

    const foundationAvailable = typeof globalThis.AgentCryptoStrategyASafetyCertification?.run_foundation_tests === "function";
    const receipt = LAST_FOUNDATION_RUN
      ? `<div class="saga-receipt" data-pass="${LAST_FOUNDATION_RUN.pass === true}"><b>Dernier test fondation :</b> ${escapeHtml(LAST_FOUNDATION_RUN.pass === true ? "PASS" : "FAIL / INCOMPLET")} · ${escapeHtml(LAST_FOUNDATION_RUN.at || "—")}${LAST_FOUNDATION_RUN.reason ? ` · ${escapeHtml(LAST_FOUNDATION_RUN.reason)}` : ""}</div>`
      : "";

    root.innerHTML = `
      <div class="saga-head">
        <div><div class="saga-title">AUDIT DES 9 GATES · ${RELEASE}</div><div class="saga-sub">Owner réel → preuve existante → prochaine preuve. Aucun PASS n’est créé par cet audit.</div></div>
        <div class="saga-actions"><div class="saga-counts">${escapeHtml(summary)}</div>${foundationAvailable ? '<button type="button" class="btn small saga-run" id="strategyAEvidenceFoundationRun">EXÉCUTER TESTS FONDATION · G2/G7</button>' : ''}</div>
      </div>
      <div class="saga-list">${data.rows.map(row => `
        <div class="saga-row" data-tone="${escapeHtml(row.tone)}">
          <span class="saga-n">${String(row.gate).padStart(2, "0")}</span>
          <div class="saga-name"><b>${escapeHtml(row.label)}</b><small>certification actuelle : ${escapeHtml(row.raw_state)} · owner : ${escapeHtml(row.owner)}</small></div>
          <div class="saga-proof"><b>Preuve :</b> ${escapeHtml(row.evidence)}<span class="saga-next"><b>Suite :</b> ${escapeHtml(row.next)}</span></div>
          <span class="saga-state">${escapeHtml(row.audit_state)}</span>
        </div>`).join("")}</div>
      ${receipt}
      <div class="saga-foot">Audit passif par défaut · le bouton G2/G7 exécute uniquement les self-tests de fondation déjà existants, sur action opérateur · aucun ordre réel.</div>`;
    root.querySelector("#strategyAEvidenceFoundationRun")?.addEventListener("click", runFoundationProof, { once: true });
    return true;
  }

  globalThis.AgentCryptoStrategyAEvidenceGateAudit = Object.freeze({
    release: RELEASE,
    owner: OWNER,
    snapshot,
    render,
    run_foundation_proof: runFoundationProof,
    passive_read: true,
    certification_changed: false,
    explicit_foundation_test_action: true,
    automatic_tests: false,
    thresholds_changed: false,
    business_logic_changed: false,
    paper_only: true,
    real_order: false,
    network: false,
    timer_added: false,
    observer_added: false,
    storage_write: false
  });

  const attempt = () => { try { return render(); } catch (_) { return false; } };
  document.addEventListener("agent-crypto:runtime-modules-ready", attempt, { once: true });
  document.addEventListener("erith:system-hydrated", attempt, { once: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attempt, { once: true });
  else attempt();
})();
