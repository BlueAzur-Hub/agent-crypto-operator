/**
 * ERITH.IA Trader — vérification indépendante de comparabilité des prix.
 * Aucun réseau, aucune lecture du compte, aucune transaction, aucun stockage.
 * N'est PAS chargé par la page Trader. Les prix doivent être fournis par leurs
 * propriétaires de données avec devise native et horodatage de provenance.
 */
const QUOTES = new Set(['USD', 'EUR', 'USDT', 'USDC']);
const MAX_COMPARISON_SKEW_MS = 15 * 60_000;
const MAX_SIGNAL_AGE_MS = 2 * 60_000;

function timestampMs(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || raw <= 0) return null;
    return raw >= 1e12 ? raw : raw >= 1e9 ? raw * 1000 : null;
  }
  if (typeof raw !== 'string') return null;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function validateObservation(observation, nowMs) {
  const o = observation && typeof observation === 'object' ? observation : {};
  const price = o.price === null || o.price === undefined || o.price === '' ? NaN : Number(o.price);
  const quote = typeof o.quote === 'string' ? o.quote.toUpperCase().trim() : '';
  const assetId = typeof o.assetId === 'string' ? o.assetId.trim().toLowerCase() : '';
  const at = timestampMs(o.observedAt);
  const ageMs = at === null ? null : nowMs - at;
  const issues = [];
  if (!assetId) issues.push('ASSET_UNVERIFIED');
  if (!QUOTES.has(quote)) issues.push('QUOTE_UNVERIFIED');
  if (!(Number.isFinite(price) && price > 0)) issues.push('PRICE_INVALID');
  if (at === null) issues.push('TIME_UNVERIFIED');
  else if (ageMs < -2000) issues.push('FUTURE_TIMESTAMP');
  return Object.freeze({assetId, quote, price: Number.isFinite(price) && price > 0 ? price : null,
    observedAtMs: at, ageMs, issues: Object.freeze(issues),
    priceQualified: !!assetId && QUOTES.has(quote) && Number.isFinite(price) && price > 0,
    freshForSignal: issues.length === 0 && ageMs <= MAX_SIGNAL_AGE_MS });
}

export function compareObservedPrices(first, second, { nowMs = Date.now() } = {}) {
  if (!Number.isFinite(nowMs) || nowMs <= 0) throw new RangeError('Horloge de contrôle invalide');
  const a = validateObservation(first, nowMs), b = validateObservation(second, nowMs);
  let blocker = null;
  if (!a.assetId || !b.assetId || a.assetId !== b.assetId) blocker = 'ASSET_MISMATCH';
  else if (!a.quote || !b.quote || !QUOTES.has(a.quote) || !QUOTES.has(b.quote)) blocker = 'QUOTE_UNVERIFIED';
  else if (a.quote !== b.quote) blocker = 'QUOTE_MISMATCH';
  else if (a.price === null || b.price === null) blocker = 'PRICE_INVALID';
  if (blocker) return Object.freeze({comparable: false, blocker, differencePct: null,
    sameCurrency: a.quote === b.quote, sameAsset: a.assetId === b.assetId,
    timeQualified: false, freshForSignal: false});
  const timeKnown = a.observedAtMs !== null && b.observedAtMs !== null;
  const skewMs = timeKnown ? Math.abs(a.observedAtMs - b.observedAtMs) : null;
  const timeQualified = timeKnown && skewMs <= MAX_COMPARISON_SKEW_MS &&
    !a.issues.includes('FUTURE_TIMESTAMP') && !b.issues.includes('FUTURE_TIMESTAMP');
  const differencePct = (a.price / b.price - 1) * 100;
  return Object.freeze({comparable: true, blocker: null, differencePct,
    sameCurrency: true, sameAsset: true, timeQualified, skewMs,
    freshForSignal: timeQualified && a.freshForSignal && b.freshForSignal,
    warning: !timeKnown ? 'TIMESTAMPS_MISSING' : !timeQualified ? 'TIMESTAMPS_NOT_COMPARABLE' :
      !a.freshForSignal || !b.freshForSignal ? 'STALE_FOR_SIGNAL' : null});
}

/** Rapport purement technique : aucune autorisation Paper ni ordre. */
export function auditTraderSources({chart, market, spot, nowMs = Date.now()} = {}) {
  if (!Number.isFinite(nowMs) || nowMs <= 0) throw new RangeError('Horloge de contrôle invalide');
  const chartMarket = compareObservedPrices(chart, market, {nowMs});
  const chartSpot = compareObservedPrices(chart, spot, {nowMs});
  return Object.freeze({
    schema: 'erith.trader.source-coherence.v1',
    chartMarket, chartSpot,
    marketFresh: validateObservation(market, nowMs).freshForSignal,
    chartFresh: validateObservation(chart, nowMs).freshForSignal,
    paperAuthorized: false,
    orderAuthorized: false,
    readOnly: true
  });
}
