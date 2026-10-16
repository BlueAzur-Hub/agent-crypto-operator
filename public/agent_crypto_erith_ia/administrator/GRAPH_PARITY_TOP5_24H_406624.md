# Agent-Crypto 40.6.624 — Graph parity · Top 5 24h canonical

## Terrain defect

Firefox proof on 40.6.623:

- Administrator opened first: Top 5 · 24h · Base 100 showed fresh direct historical series;
- Trader opened next: same Top 5 · 24h · Base 100 showed an older preserved history;
- the Trader panel reported roughly 288–289 points/series with oldest history on 07/10;
- Administrator reported 300 points/series with oldest history on 08/10.

The two surfaces therefore did not share the same graph-history truth for the same canonical comparison request.

## Root cause

`graph-native-usd-406520.js` wrapped `atlasFetchComparisonSeriesResilient()` whenever USD display was active.

For the exact canonical case:

- period = 1 day
- comparison preset = `rank-5`

the USD wrapper called its own CoinGecko USD comparison path instead of letting the existing `app.js` rank-5 / 24h history route execute.

If CoinGecko USD direct failed, that path could render an older saved USD series.

## 40.6.624 correction

Owner changed:

`administrator/js/graph-native-usd-406520.js`

The module now detects the existing canonical Top 5 24h route and delegates that request back to the original comparison owner.

For that route, the USD module no longer overrides:

- preferred history family;
- comparison preferred family;
- chart storage key;
- expected chart context key;
- CoinGecko comparison fetch;
- scanner fetch;
- comparison overlay relabel;
- chart tooltip currency formatter;
- live comparison presentation;
- current chart observation.

Outside the canonical Top 5 24h route, native USD behavior remains available.

Additionally, stale USD comparison cache is now refused if `atlasChartNeedsRefresh()` says it is old. A failed direct USD refresh must become unavailable instead of silently presenting an archive as the current graph.

## Protected

Unchanged:

- `administrator/app.js`
- Market Core 38.15.11
- Bridge 1.9.13
- Backend 1.4.6 R2
- Resolver
- Bougies
- Profondeur
- Support/Resistance formulas
- Strategy A
- real execution remains disabled

No new timer.
No new observer.
No new storage owner.
No new business-network request.

## Firefox proof required

1. Hard refresh Administrator 40.6.624.
2. Select **Top 5 · 24h · Base 100**.
3. Record:
   - five assets;
   - point count;
   - oldest timestamp;
   - history truth label;
   - leader/laggard.
4. Open Trader 40.6.624.
5. Open the same **Top 5 · 24h · Base 100**.
6. Expected:
   - same five assets;
   - same current historical window;
   - direct/canonical history truth rather than an unrelated preserved USD archive;
   - no old 07/10 series when Administrator is on the fresh 08/10 window.
7. Refresh once more and confirm the Trader cannot silently fall back to an obsolete USD cache.

Terrain remains pending until Christophe's Firefox proof.
