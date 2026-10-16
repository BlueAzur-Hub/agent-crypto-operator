/* Agent-Crypto @erith.IA — canonical CURRENT presentation consumer
   CONSOLIDATION 40.6.131

   This module is deliberately NOT a CURRENT owner.
   It never wraps business owners and never emits agentcrypto:current-finalized.
   A business finalization event is consumed only when it carries a verifiable
   CURRENT fingerprint. Boot/pageshow may repaint an already persisted state,
   but that repaint is presentation-only and cannot create a business truth.

   No analytical mutation, recurring timer, observer, fetch, storage, trading
   or wallet owner is introduced here. */
(() => {
  "use strict";

  const OWNER = "current-final-state-rebind";
  let queued = false;
  let lastReason = "boot-read-only";
  let consumed = 0;
  let rejected = 0;
  let lastProof = null;

  function loadedBuild() {
    return String(
      globalThis.AgentCryptoBootTruth?.loaded_build ||
      globalThis.AgentCryptoBootTruth?.build ||
      document.querySelector('meta[name="agent-crypto-loaded-build"]')?.content ||
      document.querySelector('meta[name="agent-crypto-boot-build"]')?.content ||
      "UNKNOWN"
    ).trim();
  }

  function normalizeFingerprint(value) {
    const text = String(value || "").trim();
    if (/^sha256:[a-f0-9]{16,}$/i.test(text)) return text.toLowerCase();
    if (/^[a-f0-9]{64}$/i.test(text)) return `sha256:${text.toLowerCase()}`;
    return "";
  }

  function proofFromDetail(detail) {
    const row = detail && typeof detail === "object" ? detail : {};
    const record = row.record && typeof row.record === "object" ? row.record : {};
    const fingerprint = normalizeFingerprint(
      row.fingerprint ||
      row.current_fingerprint ||
      row.currentFingerprint ||
      row.sha256 ||
      record.fingerprint ||
      record.current_fingerprint ||
      record.sha256
    );
    if (!fingerprint) return null;

    const snapshotId = String(
      row.snapshot_id ||
      row.snapshotId ||
      row.market_snapshot_id ||
      row.marketSnapshotId ||
      record.snapshot_id ||
      record.snapshotId ||
      ""
    ).trim();

    const currentAt = String(
      row.current_at ||
      row.currentAt ||
      row.closed_at ||
      row.closedAt ||
      row.produced_at ||
      row.producedAt ||
      record.current_at ||
      record.closed_at ||
      record.created_at ||
      ""
    ).trim();

    return Object.freeze({
      fingerprint,
      snapshot_id: snapshotId,
      current_at: currentAt
    });
  }

  function presentationSync(reason) {
    try {
      const api = globalThis.AgentCryptoLocalDialoguePresentation;
      if (api && typeof api.sync === "function") return api.sync(reason);
    } catch (_) {}
    return null;
  }

  function analyticalRefresh() {
    try {
      if (typeof globalThis.atlasAnalyticalMemoryRender394 === "function") {
        globalThis.atlasAnalyticalMemoryRender394();
        return true;
      }
    } catch (_) {}
    return false;
  }

  function canonicalCurrentUiTruth(reason) {
    try {
      if (typeof globalThis.atlasCanonicalCurrentUiTruth389 === "function") {
        globalThis.atlasCanonicalCurrentUiTruth389(`final-presentation:${String(reason || "read-only")}`);
        return true;
      }
    } catch (_) {}
    return false;
  }

  function publishState(state, reason, proof = null) {
    try {
      const root = document.documentElement;
      root.dataset.currentFinalStateRebind = state;
      root.dataset.currentFinalStateRebindReason = String(reason || "read-only");
      root.dataset.currentFinalStateRebindOwner = OWNER;
      root.dataset.currentFinalStateRebindProof = proof?.fingerprint || "";
    } catch (_) {}
  }

  function repaint(reason, proof = null) {
    const why = String(reason || "read-only");
    lastReason = why;
    const uiTruth = canonicalCurrentUiTruth(why);
    const analytical = analyticalRefresh();
    const presentation = presentationSync(`current-final-presentation:${why}`);
    publishState(proof ? "proof-consumed" : "read-only-sync", why, proof);
    return Object.freeze({
      owner: OWNER,
      build: loadedBuild(),
      reason: why,
      proof,
      ui_truth_refreshed: uiTruth,
      analytical_refreshed: analytical,
      presentation_result: presentation,
      presentation_only: true
    });
  }

  function consumeCanonicalFinalization(event) {
    const proof = proofFromDetail(event?.detail);
    if (!proof) {
      rejected += 1;
      publishState("rejected-unproven-finalization", "canonical-event-without-fingerprint", null);
      return false;
    }
    consumed += 1;
    lastProof = proof;
    repaint("canonical-current-finalized", proof);
    return true;
  }

  function scheduleReadOnly(reason = "manual-read-only") {
    lastReason = String(reason || "manual-read-only");
    if (queued) return false;
    queued = true;
    const finish = () => {
      queued = false;
      repaint(lastReason, null);
    };
    try {
      requestAnimationFrame(() => requestAnimationFrame(finish));
    } catch (_) {
      queueMicrotask(finish);
    }
    return true;
  }

  function bootReadOnlySync() {
    scheduleReadOnly("boot-read-only");
  }

  document.addEventListener("agentcrypto:current-finalized", consumeCanonicalFinalization);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootReadOnlySync, { once: true });
  } else {
    queueMicrotask(bootReadOnlySync);
  }

  window.addEventListener("pageshow", () => scheduleReadOnly("pageshow-read-only"), { passive: true });

  publishState("consumer-armed", "awaiting-canonical-proof", null);

  globalThis.AgentCryptoCurrentFinalStateRebind = Object.freeze({
    build: loadedBuild(),
    owner: OWNER,
    canonical_active_filename: "js/current-final-state-rebind.js",
    role: "presentation-consumer-only",
    proofFromDetail,
    consumeCanonicalFinalization,
    sync: reason => repaint(reason || "manual-read-only", null),
    schedule: scheduleReadOnly,
    consumed: () => consumed,
    rejected: () => rejected,
    emitted: () => 0,
    lastReason: () => lastReason,
    lastProof: () => lastProof,
    emits_current_finalized: false,
    wraps_business_owner: false,
    requires_canonical_proof: true,
    presentation_only: true,
    analytical_mutation: false,
    market_core_changed: false,
    recurring_timer: false,
    observer: false,
    fetch: false,
    storage_write: false,
    trading: false,
    wallet: false
  });
})();
