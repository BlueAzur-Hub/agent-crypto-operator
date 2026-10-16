/* Agent-Crypto @erith.IA — 40.6.255 STRATEGY A PAPER V2 EVIDENCE LIVE REFRESH
   Read-only presentation companion. It connects existing Strategy A PAPER truth
   with CURRENT → POST-CURRENT → retrospective history evidence.
   No threshold change, no order path, no wallet, no credentials, no fetch,
   no timer, no observer, no storage write, no Market Core mutation. */
(() => {
  "use strict";

  const RELEASE = "40.6.255";
  const OWNER = "strategy-a-paper-v2-proof-bridge";
  const ROOT_ID = "strategyAPaperV2ProofBridge";
  const STYLE_ID = "strategyAPaperV2ProofBridgeStyle";

  const byId = id => document.getElementById(id);
  const safeCall = (fn, fallback = null) => {
    try { return typeof fn === "function" ? fn() : fallback; }
    catch (_) { return fallback; }
  };
  const parseTime = value => {
    const ms = Date.parse(value || 0);
    return Number.isFinite(ms) ? ms : 0;
  };
  const currentTime = record => parseTime(
    record?.closed_at || record?.completed_at || record?.current_truth?.closed_at ||
    record?.saved_at || record?.last_seen_at || record?.source_time || record?.market_generated_at
  );
  const marketTime = record => parseTime(
    record?.market_generated_at || record?.source_time ||
    record?.snapshot?.market_snapshot?.source_time || record?.saved_at || record?.last_seen_at
  );
  const localTime = value => {
    const ms = typeof value === "number" ? value : parseTime(value);
    return ms ? new Date(ms).toLocaleString("fr-FR") : "—";
  };
  const duration = (fromMs, toMs) => {
    if (!(fromMs > 0) || !(toMs > fromMs)) return "—";
    const minutes = Math.round((toMs - fromMs) / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
  };
  const fingerprint = record => {
    const raw = String(record?.analysis_fingerprint || record?.current_fingerprint || "").trim();
    if (raw) return raw.startsWith("sha256:") ? raw : `sha256:${raw}`;
    try {
      if (typeof globalThis.atlasCurrentMemoryFingerprint34 === "function") {
        const value = String(globalThis.atlasCurrentMemoryFingerprint34(record) || "").trim();
        return value ? (value.startsWith("sha256:") ? value : `sha256:${value}`) : "";
      }
    } catch (_) {}
    return "";
  };
  const compactFingerprint = record => {
    const raw = fingerprint(record);
    return raw ? (raw.length > 22 ? `${raw.slice(0, 18)}…` : raw) : "—";
  };
  const pct = value => {
    const n = Number(value);
    return Number.isFinite(n) ? `${n >= 0 ? "+" : ""}${n.toFixed(2)} %` : "—";
  };
  const returnsLine = data => {
    const rows = Array.isArray(data?.rows) ? data.rows : [];
    return rows.length ? rows.map(row => `${String(row.symbol || "?").toUpperCase()} ${pct(row.pct)}`).join(" · ") : "—";
  };
  const breadthLine = data => {
    if (!Number(data?.comparable)) return "—";
    return `${Number(data.up || 0)} hausse(s) · ${Number(data.down || 0)} baisse(s) · ${Number(data.flat || 0)} stable(s)`;
  };
  const htmlEscape = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
  const gateLabel = (gate, index) => {
    if (typeof gate === "string") return gate;
    if (!gate || typeof gate !== "object") return `Gate ${index + 1}`;
    return String(gate.label || gate.name || gate.id || gate.gate || gate.key || gate.code || gate.reason || `Gate ${index + 1}`);
  };
  const gateReason = gate => {
    if (!gate || typeof gate !== "object") return "preuve non soldée";
    const value = gate.reason || gate.detail || gate.message || gate.note || gate.status_reason || gate.source || "preuve non soldée";
    return String(value);
  };
  const unresolvedRowsHtml = gates => {
    if (!Array.isArray(gates) || !gates.length) return '<div class="sapv2-gate-empty">Aucune gate non soldée signalée par Evidence Dossier.</div>';
    return gates.map((gate, index) => `
      <div class="sapv2-gate-row">
        <span class="sapv2-gate-index">${String(index + 1).padStart(2, "0")}</span>
        <div><b>${htmlEscape(gateLabel(gate, index))}</b><small>${htmlEscape(gateReason(gate))}</small></div>
        <span class="sapv2-gate-status">WAIT</span>
      </div>`).join("");
  };

  function snapshot() {
    const specApi = globalThis.AgentCryptoStrategyACanonicalSpec || null;
    const evidenceApi = globalThis.AgentCryptoStrategyAEvidenceDossier || null;
    const safetyApi = globalThis.AgentCryptoStrategyASafetyCertification || null;
    const retroApi = globalThis.atlasRetrospectiveValidation || null;
    const autoApi = globalThis.AgentCryptoStrategyAAutoStart || null;

    const spec = safeCall(specApi?.audit, null);
    const evidence = safeCall(evidenceApi?.snapshot, null);
    const safety = safeCall(safetyApi?.snapshot, null);
    const retro = safeCall(retroApi?.derive, null);
    const auto = safeCall(autoApi?.snapshot, null);

    const latest = retro?.latestPair || null;
    const latestEvaluable = retro?.latestEvaluable || null;
    const latestFirstTime = latest?.first ? marketTime(latest.first) : 0;
    const evalFirstTime = latestEvaluable?.first ? marketTime(latestEvaluable.first) : 0;
    const unresolved = Array.isArray(evidence?.certification?.unresolved) ? evidence.certification.unresolved : [];
    const gates = Array.isArray(evidence?.certification?.gates) ? evidence.certification.gates : [];
    const afterTrades = Number(evidence?.after_cost?.summary?.trades || 0);
    const cycles = Number(evidence?.experiment_ledger?.summary?.cycles || 0);

    const waits = [];
    if (!latest) waits.push("CURRENT analytique indisponible");
    else if (!latest.first) waits.push("dernier CURRENT sans observation marché postérieure");
    if (!latestEvaluable) waits.push("aucun CURRENT rétrospectif évaluable");
    if (spec && spec.status === "DRIFT") waits.push("drift du contrat Strategy A");
    if (spec && spec.status === "PARTIAL") waits.push("contrat Strategy A partiellement observable");
    if (safety && String(safety.level || "").toUpperCase() !== "NORMAL") waits.push(`Safety Governor ${String(safety.level || "UNKNOWN").toUpperCase()}`);
    if (auto?.manual_stop === true) waits.push("Auto A arrêté manuellement");

    return Object.freeze({
      release: RELEASE,
      owner: OWNER,
      paper_only: true,
      real_order: false,
      spec,
      evidence,
      safety,
      retro,
      auto,
      latest,
      latest_evaluable: latestEvaluable,
      latest_first_time: latestFirstTime,
      latest_evaluable_first_time: evalFirstTime,
      unresolved_gates: unresolved,
      gate_count: gates.length,
      paper_cycles: cycles,
      after_cost_trades: afterTrades,
      reasons_to_wait: waits
    });
  }

  function installStyle() {
    if (byId(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}{margin:12px 0;padding:13px;border:1px solid rgba(98,236,255,.28);border-radius:12px;background:linear-gradient(135deg,rgba(4,23,35,.82),rgba(20,14,38,.66));box-shadow:inset 0 0 0 1px rgba(255,255,255,.018)}
      #${ROOT_ID} .sapv2-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
      #${ROOT_ID} .sapv2-kicker{font:950 9px/1.2 system-ui,sans-serif;letter-spacing:.12em;color:#70edff;text-transform:uppercase}
      #${ROOT_ID} .sapv2-title{margin-top:4px;font:950 16px/1.18 system-ui,sans-serif;color:#fff3bd}
      #${ROOT_ID} .sapv2-sub{margin-top:4px;font:600 10px/1.4 system-ui,sans-serif;color:#9db1c3}
      #${ROOT_ID} .sapv2-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
      #${ROOT_ID} .sapv2-badge{padding:5px 8px;border-radius:999px;border:1px solid rgba(130,245,185,.30);font:900 9px/1 system-ui,sans-serif;color:#8cf6bd;background:rgba(22,84,60,.16)}
      #${ROOT_ID} .sapv2-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:11px}
      #${ROOT_ID} .sapv2-card{min-width:0;padding:9px 10px;border:1px solid rgba(255,255,255,.075);border-radius:9px;background:rgba(5,16,28,.58)}
      #${ROOT_ID} .sapv2-card span{display:block;font:850 8px/1.2 system-ui,sans-serif;letter-spacing:.065em;text-transform:uppercase;color:#7896aa}
      #${ROOT_ID} .sapv2-card b{display:block;margin-top:5px;font:900 11px/1.3 system-ui,sans-serif;color:#edf8ff;overflow-wrap:anywhere}
      #${ROOT_ID} .sapv2-card small{display:block;margin-top:4px;font:500 9px/1.4 system-ui,sans-serif;color:#91a6b7;overflow-wrap:anywhere}
      #${ROOT_ID} .sapv2-card[data-tone="wait"]{border-color:rgba(255,210,92,.26)}
      #${ROOT_ID} .sapv2-card[data-tone="wait"] b{color:#ffe08a}
      #${ROOT_ID} .sapv2-card[data-tone="ok"]{border-color:rgba(112,241,177,.24)}
      #${ROOT_ID} .sapv2-card[data-tone="ok"] b{color:#9af5c7}
      #${ROOT_ID} .sapv2-proof{margin-top:8px;padding:9px 10px;border:1px solid rgba(112,241,177,.17);border-radius:9px;background:rgba(8,28,27,.38);font:600 9px/1.45 system-ui,sans-serif;color:#a9c9c1}
      #${ROOT_ID} .sapv2-proof b{color:#dffced}
      #${ROOT_ID} .sapv2-wait{margin-top:8px;padding:9px 10px;border-left:3px solid #ffd45c;background:rgba(255,199,56,.06);font:650 9px/1.45 system-ui,sans-serif;color:#d8c98e}
      #${ROOT_ID} .sapv2-wait strong{color:#ffe58d}
      #${ROOT_ID} .sapv2-gates{margin-top:8px;border:1px solid rgba(255,210,92,.18);border-radius:9px;background:rgba(255,199,56,.035);overflow:hidden}
      #${ROOT_ID} .sapv2-gates>summary{cursor:pointer;list-style:none;padding:9px 10px;font:900 9px/1.35 system-ui,sans-serif;color:#ffe08a;letter-spacing:.035em}
      #${ROOT_ID} .sapv2-gates>summary::-webkit-details-marker{display:none}
      #${ROOT_ID} .sapv2-gates>summary::after{content:"DÉPLIER";float:right;font-size:8px;color:#98aabb}
      #${ROOT_ID} .sapv2-gates[open]>summary::after{content:"REPLIER"}
      #${ROOT_ID} .sapv2-gate-list{display:grid;gap:5px;padding:0 8px 8px}
      #${ROOT_ID} .sapv2-gate-row{display:grid;grid-template-columns:26px minmax(0,1fr) auto;gap:8px;align-items:center;padding:7px 8px;border:1px solid rgba(255,255,255,.055);border-radius:7px;background:rgba(4,15,25,.48)}
      #${ROOT_ID} .sapv2-gate-index{font:900 8px/1 system-ui,sans-serif;color:#7896aa}
      #${ROOT_ID} .sapv2-gate-row b{display:block;font:850 9px/1.3 system-ui,sans-serif;color:#f3f7fa;overflow-wrap:anywhere}
      #${ROOT_ID} .sapv2-gate-row small{display:block;margin-top:2px;font:500 8px/1.35 system-ui,sans-serif;color:#879cab;overflow-wrap:anywhere}
      #${ROOT_ID} .sapv2-gate-status{font:900 8px/1 system-ui,sans-serif;color:#ffd45c}
      #${ROOT_ID} .sapv2-gate-empty{padding:8px;font:600 8px/1.4 system-ui,sans-serif;color:#8da0ae}
      #${ROOT_ID} .sapv2-foot{margin-top:8px;font:600 8px/1.4 system-ui,sans-serif;color:#72899b}
      @media(max-width:1200px){#${ROOT_ID} .sapv2-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:720px){#${ROOT_ID} .sapv2-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function render() {
    installStyle();
    const anchor = byId("strategyAPaperAfterCostProof") || byId("strategyADossier") || byId("strategyASafety") || byId("strategyAAfterCost") || byId("strategyAPaperLifecycle");
    if (!anchor) return false;

    let root = byId(ROOT_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = ROOT_ID;
      anchor.insertAdjacentElement("afterend", root);
    }

    const data = snapshot();
    const specStatus = String(data.spec?.status || "UNAVAILABLE").toUpperCase();
    const safetyLevel = String(data.safety?.level || "UNAVAILABLE").toUpperCase();
    const currentFp = data.latest ? compactFingerprint(data.latest.current) : "—";
    const currentAt = data.latest ? localTime(data.latest.closedAt || currentTime(data.latest.current)) : "—";
    const postReady = !!data.latest?.first;
    const ev = data.latest_evaluable;
    const evFp = ev ? compactFingerprint(ev.current) : "—";
    const evCount = Array.isArray(data.retro?.evaluable) ? data.retro.evaluable.length : 0;
    const currentCount = Array.isArray(data.retro?.currents) ? data.retro.currents.length : 0;
    const waits = data.reasons_to_wait.length ? data.reasons_to_wait.join(" · ") : "aucune alerte structurelle supplémentaire ; PAPER reste isolé";
    const thresholds = data.spec?.checks?.length
      ? `${data.spec.known_checks}/${data.spec.total_checks} contrôles runtime · MIXTE ≥ +12/100 · confiance ≥ 70/100 · BTC 24 h ≥ +0,10 % · Cost Gate ≥ 0,80 %`
      : "Contrat canonique non observable dans ce rendu.";

    root.dataset.release = RELEASE;
    root.dataset.paperOnly = "true";
    root.dataset.spec = specStatus;
    root.dataset.safety = safetyLevel;
    root.innerHTML = `
      <div class="sapv2-head">
        <div>
          <div class="sapv2-kicker">STRATEGY A · PAPER V2 · PREUVES CROISÉES · ${RELEASE}</div>
          <div class="sapv2-title">CURRENT → POST-CURRENT → historique rétrospectif → Strategy A</div>
          <div class="sapv2-sub">Lecture de preuves uniquement : aucune promotion live, aucun ordre, aucune réécriture mémoire.</div>
        </div>
        <div class="sapv2-actions"><span class="sapv2-badge">PAPER ONLY · REAL ORDER OFF</span><button class="btn small" id="strategyAPaperV2ProofRefresh" type="button">ACTUALISER PREUVES</button></div>
      </div>
      <div class="sapv2-grid">
        <div class="sapv2-card" data-tone="${specStatus === "OK" ? "ok" : "wait"}"><span>Contrat Strategy A</span><b>${specStatus}</b><small>${thresholds}</small></div>
        <div class="sapv2-card"><span>Dernier CURRENT</span><b>${currentFp}</b><small>${currentAt}</small></div>
        <div class="sapv2-card" data-tone="${postReady ? "ok" : "wait"}"><span>POST-CURRENT</span><b>${postReady ? "OBSERVATION DISPONIBLE" : "EN ATTENTE"}</b><small>${postReady ? `${duration(data.latest.closedAt, data.latest_first_time)} après fermeture · ${returnsLine(data.latest.firstReturns)}` : "Aucun snapshot canonique strictement postérieur au dernier CURRENT."}</small></div>
        <div class="sapv2-card" data-tone="${evCount > 0 ? "ok" : "wait"}"><span>Historique rétrospectif</span><b>${evCount} / ${currentCount} CURRENT évaluable(s)</b><small>${ev ? `${evFp} · ${duration(ev.closedAt, data.latest_evaluable_first_time)} · ${breadthLine(ev.firstReturns)}` : "Aucune unité évaluable."}</small></div>
        <div class="sapv2-card" data-tone="${safetyLevel === "NORMAL" ? "ok" : "wait"}"><span>Safety Governor</span><b>${safetyLevel}</b><small>${data.safety ? `${String(data.safety.reason || "—")} · nouveaux PAPER autorisés par le gouverneur : ${data.safety.new_trades_allowed === true ? "OUI" : "NON"}` : "Safety Governor indisponible."}</small></div>
        <div class="sapv2-card"><span>Evidence dossier</span><b>${data.unresolved_gates.length} gate(s) non soldé(s)</b><small>${data.paper_cycles} cycle(s) · ${data.after_cost_trades} trade(s) après coûts · certification live toujours verrouillée.</small></div>
        <div class="sapv2-card"><span>Auto A PAPER</span><b>${data.auto?.runner_state?.enabled === true ? "ACTIF" : data.auto?.manual_stop === true ? "STOP MANUEL" : "ÉTAT NON ACTIF"}</b><small>${data.auto ? String(data.auto.last_action || "—") : "Owner Auto A indisponible."}</small></div>
        <div class="sapv2-card"><span>Contradiction centrale</span><b>OBSERVATION ≠ PRÉDICTION</b><small>Les résultats POST-CURRENT ne deviennent jamais un score de réussite ni une justification rétroactive.</small></div>
      </div>
      <div class="sapv2-proof"><b>Dernier CURRENT évaluable :</b> ${ev ? `${evFp} · ${localTime(data.latest_evaluable_first_time)} · ${returnsLine(ev.firstReturns)} · ${breadthLine(ev.firstReturns)}` : "aucun"}</div>
      <div class="sapv2-wait"><strong>Raison(s) d’attendre :</strong> ${waits}.</div>
      <details class="sapv2-gates">
        <summary>EVIDENCE DOSSIER · ${data.unresolved_gates.length} GATE(S) NON SOLDÉE(S) · VOIR LE DÉTAIL</summary>
        <div class="sapv2-gate-list">${unresolvedRowsHtml(data.unresolved_gates)}</div>
      </details>
      <div class="sapv2-foot">Owner analytique inchangé : Strategy A runtime existant + Retrospective Validation 39.6.1. Ce bridge ne modifie aucun seuil, aucune décision Risk, aucun lifecycle et aucun moteur.</div>`;

    byId("strategyAPaperV2ProofRefresh")?.addEventListener("click", render, { once: true });
    return true;
  }

  globalThis.AgentCryptoStrategyAPaperV2ProofBridge = Object.freeze({
    release: RELEASE,
    owner: OWNER,
    snapshot,
    render,
    paper_only: true,
    real_order: false,
    changes_thresholds: false,
    changes_lifecycle: false,
    changes_risk_decision: false,
    changes_market_core: false,
    network: false,
    fetch_added: false,
    timer_added: false,
    observer_added: false,
    storage_write: false,
    live_refresh_406255: true,
    live_refresh_events: Object.freeze([
      "agentcrypto:current-finalized",
      "agent-crypto:evidence-data-changed",
      "agent-crypto:evidence-refresh-complete",
      "agent-crypto:market-series-updated",
      "visibilitychange",
      "pageshow"
    ])
  });

  let mounted = false;
  let liveRefreshQueued = false;

  const scheduleLiveRefresh = (reason = "event") => {
    if (liveRefreshQueued) return true;
    liveRefreshQueued = true;
    queueMicrotask(() => {
      liveRefreshQueued = false;
      if (reason === "market-series-updated" && document.visibilityState === "hidden") return;
      try {
        if (!mounted && !byId(ROOT_ID)) attemptMount();
        else render();
      } catch (_) {}
    });
    return true;
  };

  const cleanup = () => {
    document.removeEventListener("click", attemptMount, true);
    document.removeEventListener("focusin", attemptMount, true);
    window.removeEventListener("pageshow", attemptMount);
  };

  const attemptMount = () => {
    if (mounted || byId(ROOT_ID)) { mounted = true; cleanup(); return true; }
    try { mounted = render() === true; } catch (_) { mounted = false; }
    if (mounted) cleanup();
    return mounted;
  };

  const afterPaint = () => {
    try { requestAnimationFrame(() => requestAnimationFrame(attemptMount)); }
    catch (_) { attemptMount(); }
  };

  document.addEventListener("click", attemptMount, true);
  document.addEventListener("focusin", attemptMount, true);
  window.addEventListener("pageshow", attemptMount);
  document.addEventListener("agent-crypto:runtime-modules-ready", attemptMount, { once: true });
  document.addEventListener("erith:system-hydrated", attemptMount, { passive: true });

  // 40.6.255 — targeted proof freshness only. No polling and no observer.
  document.addEventListener("agentcrypto:current-finalized", () => scheduleLiveRefresh("current-finalized"), { passive: true });
  document.addEventListener("agent-crypto:evidence-data-changed", () => scheduleLiveRefresh("evidence-data-changed"), { passive: true });
  document.addEventListener("agent-crypto:evidence-refresh-complete", () => scheduleLiveRefresh("evidence-refresh-complete"), { passive: true });
  document.addEventListener("agent-crypto:market-series-updated", () => scheduleLiveRefresh("market-series-updated"), { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") scheduleLiveRefresh("visibility-return");
  }, { passive: true });
  window.addEventListener("pageshow", () => scheduleLiveRefresh("pageshow"));

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { attemptMount(); afterPaint(); }, { once: true });
    window.addEventListener("load", () => { attemptMount(); afterPaint(); }, { once: true });
  } else {
    attemptMount();
    afterPaint();
  }
})();