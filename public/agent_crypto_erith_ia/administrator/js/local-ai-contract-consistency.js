/* Agent-Crypto @erith.IA — canonical Local AI contract-consistency owner.
   Introduced as the active canonical filename in Build 40.6.109.
   Git carries file history; the active filename does not carry a build number.

   Scope for 40.6.109:
   - price evidence and volume evidence are independent;
   - a truthful missing-volume reserve remains allowed when volume is absent;
   - Math completeness requires all four core risk measures;
   - the existing deterministic bounded-comment guard remains the owner;
   - read-side only: no timer, observer, network, storage, trading or wallet. */
(() => {
  "use strict";

  const RELEASE = "40.6.109";
  const previous = globalThis.atlasLocalBoundedCommentTruthGuard;
  if (typeof previous !== "function") {
    globalThis.AgentCryptoLocalAIReserveTruth = Object.freeze({
      release: RELEASE,
      active: false,
      reason: "prior_guard_missing"
    });
    return;
  }

  const normalize = value => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const finite = value => Number.isFinite(Number(value));

  function evidence(snapshot) {
    const contract = snapshot?.strict_contract || {};
    const market = contract.market || {};
    const rows = Array.isArray(contract.canonical_top5?.assets)
      ? contract.canonical_top5.assets
      : [];
    const priceCount = rows.filter(row =>
      row?.available === true && finite(row?.price_eur ?? row?.price ?? row?.eur)
    ).length;
    const hasPrices = priceCount > 0;
    const hasVolume = finite(
      market.total_volume_24h_eur ??
      market.total_volume_24h ??
      market.volume_24h_eur ??
      market.volume_24h
    ) || finite(contract.math?.volume_market_cap_ratio_pct);

    const math = contract.math || {};
    const risk = math.historical_risk || {};
    const values = [
      risk.realized_volatility_pct ?? risk.volatility_pct ?? math.realized_volatility_pct,
      risk.max_drawdown_pct ?? math.max_drawdown_pct,
      risk.var_95_pct ?? risk.var95_pct ?? math.var_95_pct,
      risk.expected_shortfall_95_pct ?? risk.expected_shortfall_pct ?? math.expected_shortfall_95_pct
    ];
    const mathCount = values.filter(finite).length;
    const degraded = math.degraded === true || risk.degraded === true
      || (Array.isArray(math.degraded_measures) && math.degraded_measures.length > 0)
      || (Array.isArray(risk.degraded_measures) && risk.degraded_measures.length > 0)
      || (Array.isArray(math.missing_measures) && math.missing_measures.length > 0)
      || (Array.isArray(risk.missing_measures) && risk.missing_measures.length > 0);

    return Object.freeze({
      hasPrices,
      hasVolume,
      mathCount,
      mathComplete: mathCount === 4 && !degraded,
      degraded
    });
  }

  function refinedGuard(mode, body, snapshot) {
    const source = String(body || "").replace(/\r\n?/g, "\n");
    const prior = previous(mode, source, snapshot);
    if (!prior?.conflict) return prior || { conflict: false, reason: "", body: source };

    const reason = String(prior.reason || "");
    const e = evidence(snapshot);
    const text = normalize(source);

    if (reason === "market_data_truth_conflict_406106") {
      const deniesPrice = /(?:aucune|pas de) donn(?:ee|ees)[^\n]{0,100}prix|prix[^\n]{0,100}(?:non fourni|non transmis|indisponible|absent|manquant)|no price data|price data[^\n]{0,100}(?:unavailable|missing|not provided)/.test(text);
      const deniesVolume = /(?:aucune|pas de) donn(?:ee|ees)[^\n]{0,100}volume|volume[^\n]{0,100}(?:non fourni|non transmis|indisponible|absent|manquant)|no volume data|volume data[^\n]{0,100}(?:unavailable|missing|not provided)/.test(text);
      const conflict = (deniesPrice && e.hasPrices) || (deniesVolume && e.hasVolume);
      return conflict
        ? { conflict: true, reason: "market_field_truth_conflict", body: source }
        : { conflict: false, reason: "reserve_supported", body: source };
    }

    if (reason === "math_completeness_truth_conflict_406106") {
      return e.mathComplete
        ? { conflict: true, reason: "math_4of4_truth_conflict", body: source }
        : { conflict: false, reason: "math_reserve_supported", body: source };
    }

    return prior;
  }

  function selfTest() {
    const mk = (prices, volume, mathCount) => ({
      strict_contract: {
        canonical_top5: {
          assets: Array.from({ length: prices ? 5 : 0 }, (_, i) => ({
            available: true,
            price_eur: 100 + i
          }))
        },
        market: volume ? { total_volume_24h_eur: 123 } : {},
        math: {
          historical_risk: {
            realized_volatility_pct: mathCount > 0 ? 1 : null,
            max_drawdown_pct: mathCount > 1 ? 2 : null,
            var_95_pct: mathCount > 2 ? 3 : null,
            expected_shortfall_95_pct: mathCount > 3 ? 4 : null
          }
        }
      }
    });
    const checks = [];
    const e1 = evidence(mk(true, false, 4));
    checks.push(e1.hasPrices && !e1.hasVolume);
    const e2 = evidence(mk(true, true, 4));
    checks.push(e2.hasPrices && e2.hasVolume);
    checks.push(evidence(mk(true, true, 3)).mathComplete === false);
    checks.push(evidence(mk(true, true, 4)).mathComplete === true);
    checks.push(evidence(mk(false, false, 0)).hasPrices === false);
    checks.push(evidence(mk(false, false, 0)).mathComplete === false);
    return Object.freeze({
      pass: checks.every(Boolean),
      total: checks.length,
      passed: checks.filter(Boolean).length,
      checks: Object.freeze(checks)
    });
  }

  globalThis.atlasLocalBoundedCommentTruthGuard = refinedGuard;
  globalThis.AgentCryptoLocalAIReserveTruth = Object.freeze({
    release: RELEASE,
    active: true,
    canonical_file: "js/local-ai-contract-consistency.js",
    owner: "atlasLocalBoundedCommentTruthGuard",
    price_volume_evidence_separated: true,
    math_completeness_requires_4_of_4: true,
    selfTest,
    recurring_timer: false,
    observer: false,
    network_owner: false,
    storage_write: false,
    trading: false,
    wallet: false
  });
})();
