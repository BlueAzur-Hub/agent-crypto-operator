(() => {
  "use strict";
  const BUILD = "40.6.11";
  const ROOT_ID = "atlasOracleV0";
  const BULL_ID = "atlasOracleBull";
  let observer = null;

  function readBullStrength(text) {
    const match = String(text || "").replace(",", ".").match(/Force\s+(-?\d+(?:\.\d+)?)\s*\/\s*100/i);
    if (!match) return null;
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
  }

  function stateFromScore(score) {
    if (score === null) return "neutral";
    if (score > 50) return "bull";
    if (score < 50) return "bear";
    return "neutral";
  }

  function apply() {
    const root = document.getElementById(ROOT_ID);
    const bull = document.getElementById(BULL_ID);
    const readout = root?.querySelector(".atlas-oracle-readout");
    if (!root || !bull || !readout) return false;
    const score = readBullStrength(bull.textContent);
    const state = stateFromScore(score);
    root.dataset.oracleBiasState = state;
    readout.dataset.oracleBiasState = state;
    if (score === null) delete readout.dataset.oracleBiasScore;
    else readout.dataset.oracleBiasScore = String(score);
    return true;
  }

  function bind() {
    if (!apply()) return false;
    if (observer) return true;
    const bull = document.getElementById(BULL_ID);
    if (!bull) return false;
    observer = new MutationObserver(apply);
    observer.observe(bull, { childList: true, subtree: true, characterData: true });
    document.documentElement.dataset.oracleSemanticBias406011 = "ready";
    return true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }

  globalThis.ErithOracleSemanticBias406011 = Object.freeze({
    build: BUILD,
    apply,
    rule: ">50 bull · =50 neutral · <50 bear",
    source: "#atlasOracleBull rendered Force N/100",
    presentation_only: true,
    oracle_model_modified: false,
    network_request_added: false,
    timer_added: false,
    storage_write_added: false
  });
})();
