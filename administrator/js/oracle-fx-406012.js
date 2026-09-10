(() => {
  "use strict";
  const BUILD = "40.6.12";
  const STORAGE_KEY = "agent_crypto_oracle_fx_enabled_v1";
  const root = () => document.getElementById("atlasOracleV0");
  const readout = () => root()?.querySelector(".atlas-oracle-readout") || null;
  const bull = () => document.getElementById("atlasOracleBull");
  const price = () => document.getElementById("atlasOraclePrice");
  const toggle = () => document.getElementById("atlasOracleFxToggle406012");
  let bullObserver = null;
  let priceObserver = null;
  let lastPrice = null;

  function readEnabled() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw === null ? true : raw === "1"; }
    catch (_) { return true; }
  }
  function writeEnabled(value) {
    try { localStorage.setItem(STORAGE_KEY, value ? "1" : "0"); } catch (_) {}
  }
  function readBullStrength(text) {
    const m = String(text || "").replace(",", ".").match(/Force\s+(-?\d+(?:\.\d+)?)\s*\/\s*100/i);
    if (!m) return null;
    const value = Number(m[1]);
    return Number.isFinite(value) ? value : null;
  }
  function biasState(score) {
    if (score === null || score === 50) return "neutral";
    return score > 50 ? "bull" : "bear";
  }
  function parsePrice(text) {
    let raw = String(text || "").replace(/[\s\u00a0\u202f]/g, "").replace(/[^0-9,.-]/g, "");
    if (!raw) return null;
    if (raw.includes(",")) raw = raw.replace(/\./g, "").replace(",", ".");
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  }
  function applyBias() {
    const ro = readout(), b = bull();
    if (!ro || !b) return false;
    const score = readBullStrength(b.textContent);
    ro.dataset.oracleBiasState = biasState(score);
    if (score === null) delete ro.dataset.oracleBiasScore;
    else ro.dataset.oracleBiasScore = String(score);
    return true;
  }
  function applyEnabled(enabled = readEnabled()) {
    const ro = readout(), btn = toggle();
    if (ro) ro.dataset.oracleFx = enabled ? "on" : "off";
    if (btn) {
      btn.setAttribute("aria-pressed", enabled ? "true" : "false");
      btn.title = enabled ? "Effets Oracle : ON" : "Effets Oracle : OFF";
    }
    return enabled;
  }
  function flashPrice(next) {
    const el = price();
    if (!el || next === null) return false;
    const previous = lastPrice;
    lastPrice = next;
    if (previous === null || next === previous || !readEnabled()) return false;
    const up = next > previous;
    if (typeof el.animate === "function") {
      el.getAnimations?.().forEach(animation => animation.cancel());
      el.animate([
        { color: up ? "#7dffad" : "#ff879b", textShadow: up ? "0 0 12px rgba(88,255,157,.68)" : "0 0 12px rgba(255,93,122,.68)" },
        { color: "", textShadow: "" }
      ], { duration: 360, easing: "ease-out" });
    }
    el.dataset.oraclePriceTick = up ? "up" : "down";
    return true;
  }
  function syncPrice() { return flashPrice(parsePrice(price()?.textContent)); }
  function bind() {
    const ro = readout(), b = bull(), p = price(), btn = toggle();
    if (!ro || !b || !p || !btn) return false;
    applyBias();
    applyEnabled(readEnabled());
    lastPrice = parsePrice(p.textContent);

    if (btn.dataset.oracleFxBound406012 !== "1") {
      btn.dataset.oracleFxBound406012 = "1";
      btn.addEventListener("click", () => {
        const next = !readEnabled();
        writeEnabled(next);
        applyEnabled(next);
      });
    }
    if (!bullObserver) {
      bullObserver = new MutationObserver(applyBias);
      bullObserver.observe(b, { childList: true, subtree: true, characterData: true });
    }
    if (!priceObserver) {
      priceObserver = new MutationObserver(syncPrice);
      priceObserver.observe(p, { childList: true, subtree: true, characterData: true });
    }
    document.documentElement.dataset.oracleFx406012 = "ready";
    return true;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true });
  else bind();

  globalThis.ErithOracleFx406012 = Object.freeze({
    build: BUILD,
    bind,
    apply_bias: applyBias,
    apply_enabled: applyEnabled,
    enabled: readEnabled,
    rule: ">50 bull · =50 neutral · <50 bear",
    price_flash_source: "real rendered #atlasOraclePrice tick",
    presentation_only: true,
    oracle_model_modified: false,
    oracle_canvas_modified: false,
    network_request_added: false,
    recurring_timer_added: false
  });
})();
