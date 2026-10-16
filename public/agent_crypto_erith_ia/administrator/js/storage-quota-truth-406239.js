/* Agent-Crypto @erith.IA — 40.6.239
   LOCAL STORAGE QUOTA TRUTH / NON-DESTRUCTIVE VOLATILE FALLBACK

   Restores the stable AtlasStorageRelief runtime contract for current consumers.
   Primary persistence remains localStorage.
   On QuotaExceededError, the attempted value is retained only in a session-memory
   Map so same-page reads remain coherent. Nothing is deleted automatically.
   No IndexedDB schema/store/write is added. No timer. No observer. No network.
*/
(() => {
  "use strict";

  const BUILD = "40.6.239";
  const EVENT = "agent-crypto:storage-quota-truth";
  const volatile = new Map();
  let lastError = null;
  let quotaDetected = false;
  let localWritable = null;
  let acceptedWrites = 0;
  let volatileWrites = 0;

  const errorText = error => String(error?.name || error?.message || error || "storage error");
  const isQuota = error => {
    const name = String(error?.name || "");
    const message = String(error?.message || error || "");
    const code = Number(error?.code);
    return name === "QuotaExceededError"
      || code === 22
      || code === 1014
      || /quota/i.test(name)
      || /quota/i.test(message);
  };

  function mark(error, reason = "write") {
    lastError = errorText(error);
    if (isQuota(error)) {
      quotaDetected = true;
      localWritable = false;
    }
    try {
      document.documentElement.dataset.agentCryptoLocalStorageQuota =
        quotaDetected ? "quota-exceeded" : "storage-error";
      document.documentElement.dataset.agentCryptoStorageFallback =
        volatile.size ? "volatile-session" : "none";
    } catch (_) {}
    try {
      document.dispatchEvent(new CustomEvent(EVENT, {
        detail: snapshot(reason)
      }));
    } catch (_) {}
  }

  function probe(reason = "probe") {
    const key = "__agent_crypto_storage_probe_406239__";
    try {
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      localWritable = true;
      return Object.freeze({ ok:true, quota:false, reason });
    } catch (error) {
      mark(error, reason);
      return Object.freeze({ ok:false, quota:isQuota(error), error:errorText(error), reason });
    }
  }

  function readSync(key) {
    const k = String(key);
    if (volatile.has(k)) return volatile.get(k);
    try { return localStorage.getItem(k); }
    catch (error) {
      lastError = errorText(error);
      return null;
    }
  }

  function writeSync(key, value) {
    const k = String(key);
    const v = String(value);
    try {
      localStorage.setItem(k, v);
      volatile.delete(k);
      acceptedWrites += 1;
      localWritable = true;
      return true;
    } catch (error) {
      if (isQuota(error)) {
        volatile.set(k, v);
        volatileWrites += 1;
        mark(error, "quota-write");
        return false;
      }
      lastError = errorText(error);
      mark(error, "storage-write-error");
      return false;
    }
  }

  function removeSync(key) {
    const k = String(key);
    volatile.delete(k);
    try {
      localStorage.removeItem(k);
      return true;
    } catch (error) {
      lastError = errorText(error);
      mark(error, "remove-error");
      return false;
    }
  }

  function snapshot(reason = "snapshot") {
    return Object.freeze({
      build: BUILD,
      reason: String(reason || "snapshot"),
      primary: "localStorage",
      local_writable: localWritable,
      quota_detected: quotaDetected,
      fallback: quotaDetected ? "VOLATILE_SESSION_MEMORY" : "NONE",
      volatile_keys: volatile.size,
      accepted_local_writes: acceptedWrites,
      volatile_writes: volatileWrites,
      last_error: lastError,
      destructive_cleanup: false,
      automatic_delete: false,
      indexeddb_schema_changed: false,
      indexeddb_write_added: false,
      persistent_fallback_claim: false,
      timer: false,
      observer: false,
      network: false
    });
  }

  function decorate() {
    if (!quotaDetected || typeof document === "undefined") return false;

    const secondary = document.getElementById("atlasWorkspaceRepriseSecondary");
    if (secondary) {
      const current = String(secondary.textContent || "");
      if (/LS\s+QuotaExceededError/i.test(current)) {
        secondary.textContent = current.replace(
          /LS\s+QuotaExceededError/gi,
          "LS QUOTA · fallback session"
        );
      }
    }

    const probeNode = document.getElementById("atlasStorageLocalProbe");
    if (probeNode) probeNode.textContent = "quota saturé · fallback session non destructif";

    const statusNode = document.getElementById("atlasStorageReliefStatus");
    if (statusNode) {
      statusNode.textContent =
        "STORAGE RELIEF 40.6.239 · quota localStorage détecté · fallback session volatile · aucune suppression automatique · IndexedDB inchangé.";
    }

    try {
      document.documentElement.dataset.agentCryptoStorageFallback = "volatile-session";
    } catch (_) {}
    return true;
  }

  // Do not overwrite a stronger pre-existing producer. The current canonical
  // runtime has consumers but no loaded stable producer; this guard preserves
  // forward compatibility if one is added later.
  if (!globalThis.AtlasStorageRelief) {
    globalThis.AtlasStorageRelief = Object.freeze({
      build: BUILD,
      contract: "ATLAS_STORAGE_RELIEF_STABLE_V1",
      readSync,
      writeSync,
      removeSync,
      probe,
      snapshot,
      fallback: "VOLATILE_SESSION_MEMORY_ON_QUOTA",
      destructive_cleanup: false,
      automatic_delete: false,
      indexeddb_schema_changed: false,
      persistent_fallback: false,
      timer: false,
      observer: false,
      network: false
    });
  }

  globalThis.AgentCryptoStorageQuotaTruth406239 = Object.freeze({
    build: BUILD,
    event: EVENT,
    probe,
    decorate,
    snapshot,
    storage_relief_present: () => !!globalThis.AtlasStorageRelief,
    destructive_cleanup: false,
    indexeddb_schema_changed: false
  });

  probe("boot");

  if (typeof document !== "undefined") {
    document.addEventListener(EVENT, () => queueMicrotask(decorate), { passive:true });
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", decorate, { once:true });
    } else {
      decorate();
    }
    window.addEventListener("load", decorate, { once:true });
    window.addEventListener("pageshow", decorate, { passive:true });
  }
})();
