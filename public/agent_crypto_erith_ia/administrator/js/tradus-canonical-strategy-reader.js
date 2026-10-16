/* Agent-Crypto Administrator — canonical Strategy A reader for TRADUS.
   Stable runtime owner. Historical observations remain untouched; new reads and
   captures are normalized before they reach the comparative ledger. */
(() => {
  "use strict";

  const OWNER = "tradus-canonical-strategy-reader";
  const SHADOW_KEY = "AgentCryptoTradusShadow";
  const LEDGER_KEY = "AgentCryptoTradusShadowLedger";
  const OBS_EVENT = "agentcrypto:tradus-shadow-observation";
  const SHADOW_MARK = "agentCryptoCanonicalStrategyReader";
  const LEDGER_MARK = "agentCryptoCanonicalStrategyReader";

  if (globalThis.AgentCryptoTradusCanonicalStrategyReader) return;

  let shadowWrapped = false;
  let ledgerWrapped = false;
  let canonicalized = 0;
  let lastReason = "boot";

  const clone = value => {
    try { return JSON.parse(JSON.stringify(value)); }
    catch (_) { return null; }
  };
  const upper = value => String(value ?? "").trim().toUpperCase();
  const unknown = value => !value || value === "INCONNU" || value === "UNKNOWN" || value === "N/D" || value === "—";
  const canonicalOwner = () => globalThis.AgentCryptoTradusStrategyFailClosed || null;

  function readCanonicalStrategyA() {
    const owner = canonicalOwner();
    if (!owner || typeof owner.readStrategyA !== "function") return null;
    try {
      const value = owner.readStrategyA();
      const decision = upper(value?.decision || value?.phase || "");
      return unknown(decision) ? null : value;
    } catch (_) {
      return null;
    }
  }

  function compareCanonical(strategyA, signal, fallback = null) {
    const owner = canonicalOwner();
    if (!owner || typeof owner.compare !== "function") return fallback;
    try { return owner.compare(strategyA, signal) || fallback; }
    catch (_) { return fallback; }
  }

  function signalKnown(signal) {
    const action = upper(signal?.action || "");
    return !unknown(action);
  }

  function nonComparable(reason = "UNKNOWN_SIDE") {
    return Object.freeze({ state:"NON COMPARABLE", text:"Comparaison indisponible", fail_closed:true, reason });
  }

  function captureCanonical(row, reason = "capture") {
    if (!row || typeof row !== "object") return row;
    const out = clone(row) || { ...row };
    const strategyA = readCanonicalStrategyA();
    const capturedAt = String(out.at || new Date().toISOString());
    out.strategy_a = strategyA ? (clone(strategyA) || strategyA) : null;
    out.comparison = (!strategyA || !signalKnown(out.signal))
      ? clone(nonComparable(!strategyA ? "STRATEGY_A_UNKNOWN" : "TRADUS_SIGNAL_UNKNOWN"))
      : (clone(compareCanonical(strategyA, out.signal, nonComparable())) || nonComparable());
    out.strategy_a_reader = "AgentCryptoTradusStrategyFailClosed";
    out.strategy_a_reader_reason = String(reason || "capture");
    out.comparison_capture_at = capturedAt;
    out.strategy_a_capture_at = capturedAt;
    out.comparison_time_locked = true;
    canonicalized += 1;
    lastReason = String(reason || "capture");
    return out;
  }

  function canonicalize(row, reason = "runtime") {
    if (!row || typeof row !== "object") return row;
    if (/shadow-read|historical-read|read/i.test(String(reason || ""))) return clone(row) || row;
    return captureCanonical(row, reason);
  }

  function currentComparison(row) {
    const strategyA = readCanonicalStrategyA();
    const at = new Date().toISOString();
    if (!row || !strategyA || !signalKnown(row.signal)) {
      return Object.freeze({ at, strategy_a: strategyA ? clone(strategyA) : null, comparison: nonComparable(!row || !signalKnown(row?.signal) ? "TRADUS_SIGNAL_UNKNOWN" : "STRATEGY_A_UNKNOWN") });
    }
    return Object.freeze({ at, strategy_a: clone(strategyA) || strategyA, comparison: clone(compareCanonical(strategyA, row.signal, nonComparable())) });
  }

  function mutateObservationDetail(event) {
    const detail = event?.detail;
    if (!detail || typeof detail !== "object") return false;
    const fixed = captureCanonical(detail, "event_capture");
    if (!fixed || typeof fixed !== "object") return false;
    detail.strategy_a = fixed.strategy_a;
    detail.comparison = fixed.comparison;
    detail.strategy_a_reader = fixed.strategy_a_reader;
    detail.strategy_a_reader_reason = fixed.strategy_a_reader_reason;
    return true;
  }

  function wrapLedger() {
    const current = globalThis[LEDGER_KEY];
    if (!current) return true;
    if (current[LEDGER_MARK] === true) { ledgerWrapped = true; return true; }
    if (typeof current.capture !== "function") return false;
    const capture = current.capture.bind(current);
    globalThis[LEDGER_KEY] = Object.freeze({
      ...current,
      capture(row, source = "event") { return capture(captureCanonical(row, `ledger:${source}`), source); },
      [LEDGER_MARK]: true,
      canonical_reader: OWNER
    });
    ledgerWrapped = true;
    return true;
  }

  function wrapShadow() {
    const current = globalThis[SHADOW_KEY];
    if (!current) return false;
    if (current[SHADOW_MARK] === true) { shadowWrapped = true; return true; }
    if (typeof current.refresh !== "function" || typeof current.read !== "function") return false;
    const refresh = current.refresh.bind(current);
    const read = current.read.bind(current);
    globalThis[SHADOW_KEY] = Object.freeze({
      ...current,
      async refresh(trigger = "manual") { return captureCanonical(await refresh(trigger), `shadow-refresh:${trigger}`); },
      read() { return clone(read()) || read(); },
      [SHADOW_MARK]: true,
      canonical_reader: OWNER
    });
    shadowWrapped = true;
    return true;
  }

  function install(reason = "runtime") {
    lastReason = String(reason || "runtime");
    const ownerReady = !!canonicalOwner()?.readStrategyA && !!canonicalOwner()?.compare;
    if (!ownerReady) return false;
    return wrapShadow() && wrapLedger();
  }

  function ready() { return install("ready-check"); }

  function snapshot() {
    return clone({
      owner: OWNER,
      ready: !!canonicalOwner() && shadowWrapped && ledgerWrapped,
      shadow_wrapped: shadowWrapped,
      ledger_wrapped: ledgerWrapped,
      canonical_strategy_a: readCanonicalStrategyA(),
      canonicalized_rows: canonicalized,
      last_reason: lastReason,
      historical_rows_rewritten: false,
    historical_reads_recomputed: false,
    comparison_time_locked: true,
      strategy_a_mutated: false
    });
  }

  if (typeof document !== "undefined") {
    document.addEventListener(OBS_EVENT, mutateObservationDetail, true);
    document.addEventListener("agentcrypto:strategy-a-auto-cycle", () => install("strategy-a-cycle"), { passive: true });
    window.addEventListener("erith:system-hydrated", () => install("system-hydrated"), { passive: true });
    window.addEventListener("pageshow", () => install("pageshow"), { passive: true });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => install("dom-ready"), { once: true });
    else queueMicrotask(() => install("boot"));
    window.addEventListener("load", () => install("load"), { once: true, passive: true });
  }

  globalThis.AgentCryptoTradusCanonicalStrategyReader = Object.freeze({
    owner: OWNER,
    ready,
    install,
    canonicalize,
    captureCanonical,
    currentComparison,
    snapshot,
    canonical_strategy_owner: "AgentCryptoTradusStrategyFailClosed",
    shadow_owner: SHADOW_KEY,
    ledger_owner: LEDGER_KEY,
    historical_rows_rewritten: false,
    strategy_a_mutated: false,
    recurring_timer: false,
    observer: false,
    storage_owner: false,
    real_orders: false,
    credentials: false,
    wallet: false
  });
})();
