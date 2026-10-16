/* Agent-Crypto Administrator — canonical Strategy A automatic PAPER start.
   Stable runtime owner. It starts the existing PAPER runner through its owner API;
   it never searches the UI for a button and never synthesizes a click. */
(() => {
  "use strict";

  const OWNER = "strategy-a-auto-start";
  const STOP_KEY = "agent_crypto_strategy_a_auto_manual_stop_v1";
  const STOP_REASON_KEY = "agent_crypto_strategy_a_auto_manual_stop_reason_v1";
  const RETRY_MS = 250;
  const MAX_WAIT_MS = 30000;

  if (globalThis.AgentCryptoStrategyAAutoStart) return;

  let timer = null;
  let startedAt = Date.now();
  let lastAction = "boot";
  let attempts = 0;

  const paperRunner = () => globalThis.AgentCryptoAutoPaperRunner || null;

  function manualStop() {
    try { return sessionStorage.getItem(STOP_KEY) === "1"; }
    catch (_) { return false; }
  }

  function mark(value) {
    try { document.documentElement.dataset.strategyAAutoStart = value; }
    catch (_) {}
  }

  function clearTimer() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  function runnerState() {
    try { return paperRunner()?.state?.() || null; }
    catch (_) { return null; }
  }

  function ensureActive(reason = "runtime") {
    if (manualStop()) {
      lastAction = `manual-stop:${reason}`;
      mark("manual-stop");
      clearTimer();
      return false;
    }

    const runner = paperRunner();
    if (!runner || typeof runner.start !== "function" || typeof runner.state !== "function") {
      lastAction = `waiting-owner:${reason}`;
      mark("waiting-owner");
      return false;
    }

    const before = runnerState();
    if (before?.enabled === true) {
      lastAction = `already-active:${reason}`;
      mark("active");
      clearTimer();
      return true;
    }

    try {
      lastAction = `owner-start:${reason}`;
      const result = runner.start();
      const after = runnerState() || result || null;
      if (after?.enabled === true) {
        mark("active");
        clearTimer();
        try {
          document.dispatchEvent(new CustomEvent("agentcrypto:strategy-a-owner-autostart", {
            detail: { reason, paper_only: true, owner: OWNER }
          }));
        } catch (_) {}
        return true;
      }
      lastAction = `owner-refused:${reason}:${String(after?.phase || after?.last_action || "unknown")}`;
      mark("owner-refused");
      return false;
    } catch (error) {
      lastAction = `error:${reason}:${String(error?.message || error)}`;
      mark("error");
      return false;
    }
  }

  function schedule(reason = "bootstrap", delay = 0) {
    clearTimer();
    if (manualStop()) { mark("manual-stop"); return false; }
    if (Date.now() - startedAt > MAX_WAIT_MS) {
      lastAction = `timeout:${reason}`;
      mark("timeout");
      return false;
    }
    timer = setTimeout(() => {
      timer = null;
      attempts += 1;
      if (!ensureActive(`${reason}:${attempts}`)) schedule(reason, RETRY_MS);
    }, Math.max(0, Number(delay) || 0));
    return true;
  }

  function restart(reason) {
    startedAt = Date.now();
    attempts = 0;
    return schedule(reason, 0);
  }

  document.addEventListener("erith:system-hydrated", () => restart("system-hydrated"), { passive: true });
  window.addEventListener("pageshow", () => restart("pageshow"), { passive: true });
  const boot = () => restart("boot");
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();

  globalThis.AgentCryptoStrategyAAutoStart = Object.freeze({
    owner: OWNER,
    ensure_active: ensureActive,
    restart_bootstrap: () => restart("api"),
    snapshot: () => Object.freeze({
      owner: OWNER,
      runner_available: !!paperRunner(),
      runner_state: runnerState(),
      manual_stop: manualStop(),
      manual_stop_reason: (() => { try { return sessionStorage.getItem(STOP_REASON_KEY); } catch (_) { return null; } })(),
      attempts,
      elapsed_ms: Date.now() - startedAt,
      last_action: lastAction
    }),
    contract: Object.freeze({
      paper_only: true,
      owner_api_only: true,
      ui_independent: true,
      button_click: false,
      simulation_open_required: false,
      existing_runner_reused: true,
      operator_stop_owner_persists: true,
      explicit_owner_start_clears_stop: true,
      new_recurring_market_timer: false,
      real_order: false,
      wallet: false,
      credentials: false
    })
  });
})();
