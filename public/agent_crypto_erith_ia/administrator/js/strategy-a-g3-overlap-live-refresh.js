/* Agent-Crypto @erith.IA — 40.6.211 G3 DURABLE DECISION EVIDENCE · ASSET REBIND
   Terrain 40.6.209 proved that an operator-created prospective PAPER decision could
   exist in-session, then disappear after a normal reload. This module keeps the
   existing capture path untouched and adds a durable IndexedDB evidence mirror.
   It restores durable prospective rows into the generic Experiment Ledger read
   facade after reload, then refreshes the existing T0 proof/cascade/overlap views.
   No trading threshold, Gate state, market data, PAPER lifecycle, real-order path,
   recurring timer, MutationObserver or business-network request is changed. */
(() => {
  "use strict";

  const BUILD = "40.6.211";
  const OWNER = "strategy-a-g3-durable-decision-evidence";
  const BUTTON_ID = "strategyAG3ProspectiveT0CaptureRun";
  const HOST_ID = "strategyAEvidenceSupplements";
  const CAPTURE_PANEL_ID = "strategyAG3ProspectiveT0Capture";
  const STATUS_ID = "strategyAG3DurableDecisionEvidence";
  const OVERLAP_ID = "strategyAG3T0WindowOverlapProof";
  const DB_NAME = "agent_crypto_erith_ia_g3_evidence_v1";
  const DB_VERSION = 1;
  const STORE_NAME = "prospective_t0";
  const MAX_ROWS = 64;

  const clone = value => {
    try { return JSON.parse(JSON.stringify(value)); }
    catch (_) { return null; }
  };
  const plain = value => !!value && typeof value === "object" && !Array.isArray(value);
  const text = value => value === null || value === undefined ? "" : String(value).trim();
  const cycleId = row => text(row?.cycle_id ?? row?.decision_id ?? row?.proposal_id ?? row?.id);

  let durableRows = [];
  let hydrated = false;
  let dbState = "PENDING";
  let lastError = null;
  let queued = false;
  let refreshCount = 0;
  let lastReceipt = null;
  let facadeInstalled = false;
  let upstreamLedger = null;
  let wrapperLedger = null;

  function mergeRows(baseRows, extraRows) {
    const map = new Map();
    for (const row of [...(Array.isArray(baseRows) ? baseRows : []), ...(Array.isArray(extraRows) ? extraRows : [])]) {
      if (!plain(row)) continue;
      const id = cycleId(row);
      if (!id) continue;
      map.set(id, row);
    }
    return Array.from(map.values()).slice(-240);
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("INDEXEDDB_UNAVAILABLE"));
        return;
      }
      let request;
      try { request = indexedDB.open(DB_NAME, DB_VERSION); }
      catch (error) { reject(error); return; }
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "cycle_id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("INDEXEDDB_OPEN_FAILED"));
      request.onblocked = () => reject(new Error("INDEXEDDB_BLOCKED"));
    });
  }

  async function readDurableRows() {
    const db = await openDb();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result.filter(plain).slice(-MAX_ROWS) : []);
        request.onerror = () => reject(request.error || new Error("INDEXEDDB_READ_FAILED"));
        tx.onabort = () => reject(tx.error || new Error("INDEXEDDB_READ_ABORTED"));
      });
    } finally {
      try { db.close(); } catch (_) {}
    }
  }

  async function writeDurableRows(rows) {
    const clean = (Array.isArray(rows) ? rows : []).filter(plain).filter(row => cycleId(row)).slice(-MAX_ROWS);
    if (!clean.length) return 0;
    const db = await openDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        for (const row of clean) store.put(clone(row));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error("INDEXEDDB_WRITE_FAILED"));
        tx.onabort = () => reject(tx.error || new Error("INDEXEDDB_WRITE_ABORTED"));
      });
      return clean.length;
    } finally {
      try { db.close(); } catch (_) {}
    }
  }

  function captureApi() {
    return globalThis.AgentCryptoStrategyAG3ProspectiveT0Capture || null;
  }

  function currentCaptureRows() {
    try {
      const rows = captureApi()?.read?.();
      return Array.isArray(rows) ? rows.filter(plain) : [];
    } catch (_) {
      return [];
    }
  }

  function readUpstream() {
    const owner = upstreamLedger;
    try {
      const value = owner?.read?.();
      if (Array.isArray(value)) return value.filter(plain);
      if (Array.isArray(value?.rows)) return value.rows.filter(plain);
      if (Array.isArray(value?.entries)) return value.entries.filter(plain);
    } catch (_) {}
    return [];
  }

  function installDurableLedgerFacade() {
    const current = globalThis.AgentCryptoStrategyAExperimentLedger || null;
    if (current && current !== wrapperLedger && current?.durable_store_owner !== OWNER) {
      upstreamLedger = current;
    }
    if (!upstreamLedger) return false;

    wrapperLedger = Object.freeze({
      build: BUILD,
      source_build: upstreamLedger?.build || null,
      source_owner: upstreamLedger?.source_owner || "AgentCryptoStrategyAExperimentLedger",
      durable_store_owner: OWNER,
      read: () => mergeRows(readUpstream(), durableRows),
      summary: () => ({
        build: BUILD,
        source_rows: readUpstream().length,
        durable_rows: durableRows.length,
        merged_rows: mergeRows(readUpstream(), durableRows).length,
        hydrated,
        db_state: dbState,
        paper_only: true,
        g3: "PENDING",
        g9: "LOCKED"
      }),
      prospective_read: () => clone(durableRows) || [],
      original_read: () => clone(readUpstream()) || [],
      storage_backend: "IndexedDB",
      database: DB_NAME,
      store: STORE_NAME,
      max_durable_rows: MAX_ROWS,
      paper_only: true,
      real_orders: false,
      kraken_network: false,
      current_runtime_backfill: false,
      current_oracle_applied_to_past: false,
      future_outcomes_used_as_t0_input: false
    });

    try {
      globalThis.AgentCryptoStrategyAExperimentLedger = wrapperLedger;
      facadeInstalled = globalThis.AgentCryptoStrategyAExperimentLedger === wrapperLedger;
    } catch (_) {
      facadeInstalled = false;
    }
    if (!facadeInstalled) {
      try {
        Object.defineProperty(globalThis, "AgentCryptoStrategyAExperimentLedger", {
          configurable: true,
          writable: true,
          value: wrapperLedger
        });
        facadeInstalled = globalThis.AgentCryptoStrategyAExperimentLedger === wrapperLedger;
      } catch (_) {
        facadeInstalled = false;
      }
    }
    return facadeInstalled;
  }

  function renderHumanStatus() {
    if (typeof document === "undefined") return;
    const host = document.getElementById(HOST_ID);
    const capturePanel = document.getElementById(CAPTURE_PANEL_ID);
    if (!host || !capturePanel) return;

    let node = document.getElementById(STATUS_ID);
    if (!node) {
      node = document.createElement("section");
      node.id = STATUS_ID;
      node.style.cssText = "margin-top:8px;padding:9px;border:1px solid rgba(115,235,208,.26);border-radius:9px;background:rgba(4,26,26,.48)";
    }
    if (node.parentElement !== host || capturePanel.nextElementSibling !== node) {
      capturePanel.insertAdjacentElement("afterend", node);
    }

    const rows = durableRows.length;
    const latest = durableRows.at(-1) || null;
    const retained = hydrated && rows > 0;
    const headline = retained
      ? "PREUVE CONSERVÉE APRÈS RECHARGEMENT"
      : hydrated
        ? "MÉMOIRE DURABLE PRÊTE — AUCUNE DÉCISION ENREGISTRÉE"
        : "VÉRIFICATION DE LA MÉMOIRE DURABLE…";
    const state = dbState === "READY" ? "MÉMOIRE DURABLE OK" : dbState;

    node.innerHTML = `
      <div style="font-size:9px;font-weight:950;letter-spacing:.08em;color:#91f2d7;text-transform:uppercase">DÉCISION PAPER · MÉMOIRE DURABLE · ${BUILD}</div>
      <div style="margin-top:5px;font-size:11px;font-weight:900;color:#f2fff9">${headline}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px;margin-top:7px">
        <div><small style="color:#789b91">ÉTAT</small><div style="font-weight:900">${state}</div></div>
        <div><small style="color:#789b91">DÉCISIONS CONSERVÉES</small><div style="font-weight:900">${rows}</div></div>
        <div><small style="color:#789b91">DERNIÈRE DÉCISION</small><div style="font-weight:900;overflow-wrap:anywhere">${latest?.cycle_id || "—"}</div></div>
        <div><small style="color:#789b91">APRÈS RECHARGEMENT</small><div style="font-weight:900">${retained ? "OUI" : "PAS ENCORE PROUVÉ"}</div></div>
      </div>
      <div style="margin-top:6px;font-size:9px;color:#98b8af;line-height:1.4">${lastError ? `Erreur mémoire : ${String(lastError)}` : "Aucun ordre réel. Cette mémoire sert uniquement à conserver la preuve d'une décision PAPER pour les vérifications historiques."}</div>`;

    const button = document.getElementById(BUTTON_ID);
    if (button) {
      button.textContent = "ENREGISTRER LA PROCHAINE DÉCISION PAPER";
      button.title = "Enregistre une décision simulée dans la mémoire de preuve. Aucun ordre réel.";
    }
  }

  function refreshEvidence(reason = "manual") {
    refreshCount += 1;
    installDurableLedgerFacade();
    try { globalThis.AgentCryptoStrategyAG3T0DecisionProof?.render?.(); } catch (_) {}
    try { globalThis.AgentCryptoStrategyAG3ReplayDataset?.render?.(); } catch (_) {}
    try { globalThis.AgentCryptoStrategyAG3DecisionReplay?.render?.(); } catch (_) {}
    try { globalThis.AgentCryptoStrategyAG3CascadeCheckpoint?.render?.(); } catch (_) {}
    try { captureApi()?.render?.(); } catch (_) {}
    renderHumanStatus();

    const host = typeof document !== "undefined" ? document.getElementById(HOST_ID) : null;
    const integrator = globalThis.AgentCryptoStrategyAEvidenceDossierSupplementIntegrator || null;
    let proof = null;
    try {
      proof = typeof integrator?.render_overlap_proof === "function"
        ? integrator.render_overlap_proof(host)
        : null;
    } catch (_) { proof = null; }
    const overlap = typeof document !== "undefined" ? document.getElementById(OVERLAP_ID) : null;
    if (overlap) {
      overlap.dataset.liveRefreshBuild = BUILD;
      overlap.dataset.liveRefreshOwner = OWNER;
      overlap.dataset.liveRefreshReason = String(reason);
    }

    lastReceipt = Object.freeze({
      schema: "agent_crypto_g3_durable_decision_evidence_receipt_v1",
      build: BUILD,
      owner: OWNER,
      reason: String(reason),
      refresh_count: refreshCount,
      hydrated,
      db_state: dbState,
      durable_rows: durableRows.length,
      facade_installed: facadeInstalled,
      relation: proof?.relation || null,
      gap_min: proof?.gap_min ?? null,
      conclusion: proof?.conclusion || null,
      read_only_after_capture: true,
      paper_only: true,
      real_order: false,
      g3: "PENDING",
      g9: "LOCKED"
    });
    return clone(lastReceipt);
  }

  function schedule(reason) {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      refreshEvidence(reason);
    });
  }

  async function hydrate() {
    dbState = "OPENING";
    renderHumanStatus();
    try {
      const stored = await readDurableRows();
      const captureRows = currentCaptureRows();
      if (captureRows.length) {
        await writeDurableRows(captureRows);
      }
      durableRows = mergeRows(stored, captureRows).slice(-MAX_ROWS);
      dbState = "READY";
      hydrated = true;
      lastError = null;
      installDurableLedgerFacade();
      refreshEvidence("durable-hydrate");
      document.dispatchEvent(new CustomEvent("agent-crypto:g3-durable-evidence-ready", { detail: { build: BUILD, rows: durableRows.length } }));
      return true;
    } catch (error) {
      hydrated = true;
      dbState = "ERROR";
      lastError = error?.message || String(error || "UNKNOWN");
      installDurableLedgerFacade();
      refreshEvidence("durable-hydrate-error");
      return false;
    }
  }

  async function persistCurrentCapture(reason = "capture") {
    const rows = currentCaptureRows();
    if (!rows.length) {
      lastReceipt = Object.freeze({
        schema: "agent_crypto_g3_durable_decision_evidence_receipt_v1",
        build: BUILD,
        owner: OWNER,
        ok: false,
        blocker: "NO_NEW_CAPTURE_ROW_TO_PERSIST",
        paper_only: true,
        real_order: false,
        g3: "PENDING",
        g9: "LOCKED"
      });
      refreshEvidence("capture-empty");
      return clone(lastReceipt);
    }
    try {
      const written = await writeDurableRows(rows);
      durableRows = mergeRows(durableRows, rows).slice(-MAX_ROWS);
      dbState = "READY";
      hydrated = true;
      lastError = null;
      installDurableLedgerFacade();
      refreshEvidence(reason);
      document.dispatchEvent(new CustomEvent("agent-crypto:g3-durable-evidence-written", { detail: { build: BUILD, rows: durableRows.length, written } }));
      return { ok: true, written, durable_rows: durableRows.length };
    } catch (error) {
      dbState = "ERROR";
      lastError = error?.message || String(error || "UNKNOWN");
      refreshEvidence("capture-persist-error");
      return { ok: false, error: lastError };
    }
  }

  function onClick(event) {
    const target = event?.target;
    if (!(target instanceof Element)) return;
    if (!target.closest(`#${BUTTON_ID}`)) return;
    // The existing capture handler runs on the button itself before this bubble listener.
    // Persist the resulting prospective evidence after that synchronous capture completes.
    queueMicrotask(() => { void persistCurrentCapture("operator-paper-decision"); });
  }

  function snapshot() {
    return Object.freeze({
      schema: "agent_crypto_g3_durable_decision_evidence_v1",
      build: BUILD,
      owner: OWNER,
      db_name: DB_NAME,
      store_name: STORE_NAME,
      db_state: dbState,
      hydrated,
      durable_rows: durableRows.length,
      latest_cycle_id: durableRows.at(-1)?.cycle_id || null,
      facade_installed: facadeInstalled,
      last_error: lastError,
      last_receipt: clone(lastReceipt),
      recurring_timer: false,
      observer: false,
      business_network_request: false,
      real_order: false,
      paper_only: true,
      current_runtime_backfill: false,
      current_oracle_applied_to_past: false,
      future_outcomes_used_as_t0_input: false,
      g3: "PENDING",
      g9: "LOCKED"
    });
  }

  const api = Object.freeze({
    build: BUILD,
    owner: OWNER,
    hydrate,
    persist_current_capture: persistCurrentCapture,
    refresh: refreshEvidence,
    schedule,
    snapshot,
    read: () => clone(durableRows) || [],
    storage_backend: "IndexedDB",
    db_name: DB_NAME,
    store_name: STORE_NAME,
    max_rows: MAX_ROWS,
    recurring_timer: false,
    observer: false,
    business_network_request: false,
    real_order: false,
    paper_only: true,
    g3: "PENDING",
    g9: "LOCKED"
  });

  globalThis.AgentCryptoStrategyAG3OverlapLiveRefresh = api;
  globalThis.AgentCryptoStrategyAG3DurableDecisionEvidence = api;

  if (typeof document !== "undefined") {
    document.addEventListener("click", onClick, false);
    document.addEventListener("agent-crypto:evidence-data-changed", () => schedule("evidence-data-changed"));
    document.addEventListener("erith:system-hydrated", () => schedule("system-hydrated"), {passive:true});
    window.addEventListener("pageshow", () => { void hydrate(); }, {passive:true});
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => { renderHumanStatus(); }, {once:true});
      window.addEventListener("load", () => { void hydrate(); }, {once:true});
    } else {
      renderHumanStatus();
      void hydrate();
    }
  }
})();