/* Agent-Crypto Administrator — canonical TRADUS autonomous shadow refresh.
   Stable runtime owner. One 60 s read-only cycle while the page is visible. */
(() => {
  "use strict";

  const OWNER = "tradus-autonomous-refresh";
  const INTERVAL_MS = 60000;
  const START_DELAY_MS = 1500;
  const RETRY_MS = 2000;
  const PANEL_ID = "tradusShadow406066";

  if (globalThis.AgentCryptoTradusAutonomousRefresh) return;

  let timer = null;
  let running = false;
  let cycles = 0;
  let lastAt = null;
  let lastTrigger = null;
  let lastError = null;

  const shadow = () => globalThis.AgentCryptoTradusShadow || null;
  const canonicalReader = () => globalThis.AgentCryptoTradusCanonicalStrategyReader || null;
  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };

  function clearTimer() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  function readerReady() {
    const reader = canonicalReader();
    if (!reader || typeof reader.ready !== "function") return false;
    try { return reader.ready() === true; }
    catch (_) { return false; }
  }

  function syncVisibleContract() {
    if (typeof document === "undefined") return false;
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return false;
    panel.dataset.autonomousRefresh = OWNER;
    panel.dataset.autonomousRefreshInterval = String(INTERVAL_MS);
    const foot = panel.querySelector(".ts-foot");
    if (foot) foot.textContent = "SHADOW ONLY · AUTO 60 S ACTIF PAGE VISIBLE · aucun ordre · aucune clé · aucun wallet · aucune mutation Strategy A · signal comparatif uniquement.";
    return true;
  }

  function schedule(delay = INTERVAL_MS) {
    clearTimer();
    if (!running || typeof document === "undefined" || document.hidden) return false;
    timer = setTimeout(() => { void cycle("autonomous_60s"); }, Math.max(250, Number(delay) || INTERVAL_MS));
    return true;
  }

  async function cycle(trigger = "autonomous_60s") {
    if (!running || typeof document === "undefined" || document.hidden) return false;
    if (!readerReady()) {
      lastError = "CANONICAL_READER_NOT_READY";
      schedule(RETRY_MS);
      return false;
    }
    const owner = shadow();
    if (!owner || typeof owner.refresh !== "function") {
      lastError = "TRADUS_OWNER_UNAVAILABLE";
      schedule(RETRY_MS);
      return false;
    }
    try { owner.mount?.(); } catch (_) {}
    syncVisibleContract();
    try {
      await owner.refresh(trigger);
      cycles += 1;
      lastAt = new Date().toISOString();
      lastTrigger = trigger;
      lastError = null;
      syncVisibleContract();
      try {
        document.dispatchEvent(new CustomEvent("agentcrypto:tradus-autonomous-refresh", {
          detail: { owner: OWNER, cycles, at: lastAt, trigger }
        }));
      } catch (_) {}
      return true;
    } catch (error) {
      lastError = String(error?.message || error || "TRADUS_REFRESH_FAILED");
      return false;
    } finally {
      schedule(INTERVAL_MS);
    }
  }

  function start(source = "start") {
    if (running) { syncVisibleContract(); return false; }
    running = true;
    lastTrigger = source;
    readerReady();
    syncVisibleContract();
    schedule(START_DELAY_MS);
    return true;
  }

  function stop(source = "stop") {
    running = false;
    lastTrigger = source;
    clearTimer();
    return true;
  }

  function status() {
    return clone({
      owner: OWNER,
      running,
      page_visible: typeof document !== "undefined" ? !document.hidden : false,
      interval_ms: INTERVAL_MS,
      cycles,
      last_at: lastAt,
      last_trigger: lastTrigger,
      last_error: lastError,
      owner_available: !!shadow(),
      canonical_reader_ready: readerReady(),
      visible_contract_synced: syncVisibleContract(),
      paper_only: true,
      shadow_only: true,
      real_orders: false,
      credentials: false,
      wallet: false,
      strategy_a_mutated: false,
      storage_write: false,
      recurring_timer: true
    });
  }

  globalThis.AgentCryptoTradusAutonomousRefresh = Object.freeze({
    owner: OWNER,
    interval_ms: INTERVAL_MS,
    start,
    stop,
    run_once: () => cycle("explicit_run_once"),
    status,
    sync_visible_contract: syncVisibleContract,
    paper_only: true,
    shadow_only: true,
    real_orders: false,
    credentials: false,
    wallet: false,
    strategy_a_mutated: false,
    storage_write: false,
    recurring_timer: true
  });

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearTimer();
      else if (running) { readerReady(); syncVisibleContract(); schedule(250); }
    }, { passive: true });
    document.addEventListener("agentcrypto:tradus-shadow-observation", syncVisibleContract, { passive: true });
    window.addEventListener("pagehide", () => stop("pagehide"), { passive: true });
    window.addEventListener("pageshow", () => { readerReady(); start("pageshow"); }, { passive: true });
    const boot = () => { readerReady(); start("boot"); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
    else boot();
  }
})();
