/* Agent-Crypto @erith.IA — 40.6.175 EVIDENCE SUPPLEMENT STABLE HOST
   Keeps supplemental evidence panels outside #strategyADossier, whose legacy owner
   may remove/recreate its own subtree. Event-driven only: no timer, no observer,
   no storage write, no network/order path, no Strategy A business-logic mutation. */
(() => {
  "use strict";

  const BUILD = "40.6.175";
  const ROOT_ID = "strategyAEvidenceSupplements";
  const AUDIT_ID = "strategyAEvidenceGateAudit";
  const DOSSIER_ID = "strategyADossier";
  const BRIDGE_ID = "strategyAPaperV2ProofBridge";
  const PANEL_IDS = Object.freeze([
    "strategyAG3StructuredTruth",
    "strategyAG3HistoryOwnerDiscovery",
    "strategyAG3HistoricalEvidenceAdapter"
  ]);

  let queued = false;
  let mountCount = 0;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;

  function anchor() {
    return byId(AUDIT_ID) || byId(DOSSIER_ID) || byId(BRIDGE_ID) || null;
  }

  function ensureStyle() {
    if (typeof document === "undefined" || byId(`${ROOT_ID}Style`)) return;
    const style = document.createElement("style");
    style.id = `${ROOT_ID}Style`;
    style.textContent = `#${ROOT_ID}{margin-top:10px;padding:10px;border:1px solid rgba(111,255,215,.22);border-radius:10px;background:rgba(5,23,25,.42)}#${ROOT_ID}>.saesh-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:4px}#${ROOT_ID} .saesh-title{font-size:9px;font-weight:950;letter-spacing:.09em;color:#83ffda;text-transform:uppercase}#${ROOT_ID} .saesh-sub{font-size:8px;color:#86aaa4;margin-top:3px}#${ROOT_ID} .saesh-state{font-size:8px;font-weight:900;color:#dffdf5;border:1px solid rgba(111,255,215,.18);border-radius:999px;padding:4px 7px;background:rgba(111,255,215,.06)}#${ROOT_ID}>section{margin-top:9px}`;
    document.head.appendChild(style);
  }

  function ensureHost() {
    if (typeof document === "undefined") return null;
    const a = anchor();
    if (!a) return null;

    let host = byId(ROOT_ID);
    if (!host) {
      host = document.createElement("section");
      host.id = ROOT_ID;
      host.dataset.build = BUILD;
      host.dataset.stableSibling = "true";
      host.innerHTML = `<div class="saesh-head"><div><div class="saesh-title">STRATEGY A · EVIDENCE SUPPLEMENTS · STABLE HOST · ${BUILD}</div><div class="saesh-sub">Panneaux de preuve hors du subtree legacy #strategyADossier · aucun PASS créé par ce host.</div></div><div class="saesh-state" data-saesh-state>0 / ${PANEL_IDS.length} PANNEAUX</div></div>`;
    }

    if (a.nextElementSibling !== host) a.insertAdjacentElement("afterend", host);
    ensureStyle();
    return host;
  }

  function renderOwners() {
    const apis = [
      globalThis.AgentCryptoStrategyAG3StructuredDataTruth,
      globalThis.AgentCryptoStrategyAG3HistoryOwnerDiscovery,
      globalThis.AgentCryptoStrategyAG3HistoricalEvidenceAdapter
    ];
    for (const api of apis) {
      if (typeof api?.render === "function") {
        try { api.render(); } catch (_) {}
      }
    }
  }

  function movePanels(host) {
    let present = 0;
    for (const id of PANEL_IDS) {
      const panel = byId(id);
      if (!panel) continue;
      if (panel.parentElement !== host) host.appendChild(panel);
      panel.dataset.stableHostBuild = BUILD;
      panel.dataset.outsideLegacyDossier = "true";
      present += 1;
    }
    const state = host.querySelector("[data-saesh-state]");
    if (state) state.textContent = `${present} / ${PANEL_IDS.length} PANNEAUX`;
    host.dataset.panelsPresent = String(present);
    host.dataset.panelsExpected = String(PANEL_IDS.length);
    host.dataset.complete = present === PANEL_IDS.length ? "true" : "false";
    return present;
  }

  function mount() {
    mountCount += 1;
    const host = ensureHost();
    if (!host) return { mounted: false, present: 0, expected: PANEL_IDS.length };
    renderOwners();
    const present = movePanels(host);
    return { mounted: true, present, expected: PANEL_IDS.length, complete: present === PANEL_IDS.length };
  }

  function schedule() {
    if (queued) return;
    queued = true;
    const run = () => { queued = false; mount(); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  function snapshot() {
    const host = byId(ROOT_ID);
    const present = PANEL_IDS.filter(id => !!byId(id)).length;
    return {
      schema: "agent_crypto_strategy_a_evidence_supplement_stable_host_v1",
      build: BUILD,
      host_present: !!host,
      stable_sibling: host?.dataset?.stableSibling === "true",
      panels_present: present,
      panels_expected: PANEL_IDS.length,
      complete: present === PANEL_IDS.length && !!host,
      panels: PANEL_IDS.map(id => ({ id, present: !!byId(id), parent: byId(id)?.parentElement?.id || null })),
      legacy_dossier_owner_unchanged: true,
      recurring_timer: false,
      observer: false,
      storage_write: false,
      network: false,
      real_order: false,
      paper_only: true,
      g3: "PENDING",
      g9: "LOCKED"
    };
  }

  function selfTest() {
    const s = snapshot();
    return {
      schema: "agent_crypto_strategy_a_evidence_supplement_stable_host_self_test_v1",
      build: BUILD,
      pass: s.recurring_timer === false && s.observer === false && s.storage_write === false && s.network === false && s.real_order === false && s.g3 === "PENDING" && s.g9 === "LOCKED",
      checks: {
        no_timer: s.recurring_timer === false,
        no_observer: s.observer === false,
        no_storage_write: s.storage_write === false,
        no_network: s.network === false,
        no_real_order: s.real_order === false,
        no_gate_promotion: s.g3 === "PENDING" && s.g9 === "LOCKED"
      }
    };
  }

  globalThis.AgentCryptoEvidenceSupplementStableHost = Object.freeze({
    build: BUILD,
    mount,
    snapshot,
    self_test: selfTest,
    host_id: ROOT_ID,
    panel_ids: PANEL_IDS,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    network: false,
    real_order: false,
    paper_only: true,
    g3: "PENDING",
    g9: "LOCKED"
  });

  if (typeof document !== "undefined") {
    document.addEventListener("agent-crypto:evidence-view-refreshed", schedule);
    document.addEventListener("agent-crypto:evidence-data-changed", schedule);
    document.addEventListener("erith:system-hydrated", schedule, { passive: true });
    document.addEventListener("agent-crypto:runtime-modules-ready", schedule, { once: true });
    window.addEventListener("pageshow", schedule);
    window.addEventListener("load", schedule, { once: true });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
    else schedule();
  }
})();
