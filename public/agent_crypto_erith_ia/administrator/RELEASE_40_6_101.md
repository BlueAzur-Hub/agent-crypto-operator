# Agent-Crypto 40.6.101 — CEX Divergence Fail-Closed

Parent: 40.6.100  
Engine: Market Core 38.15.11 (unchanged)

## Reproduced defect

A stored audit replay demonstrated a Source Intelligence state of `ready` while a fresh multi-CEX comparison contained a severely divergent asset (`max_spread_pct` about 57.14%). The base Source Truth owner already classified individual assets as `coherent`, `watch` or `divergent`, but Source Intelligence readiness only required CEX comparability, DEX eligibility and absence of DEX address mismatch.

That meant source availability could be mistaken for source agreement.

## Correction

40.6.101 adds a bounded read-side CEX quality gate after the existing 40.6.98 per-provider freshness gate:

- only fresh-provider consensus is evaluated;
- `coherent` remains accepted;
- `watch` remains observable and accepted;
- any fresh `divergent` asset forces Source Intelligence to `partial`;
- the affected asset symbols and maximum fresh spread remain visible;
- Binance remains the canonical live primary price;
- no median or control price replaces Binance;
- no trading or financial signal is added.

Runtime layer: `js/cex-divergence-guard-406101.js`  
Loader: `js/views/private-source-demand-loader.js`

## Protected

- Market Core 38.15.11 unchanged.
- Web Classic unchanged.
- Graph/history unchanged.
- Aether unchanged.
- Atlas CURRENT unchanged.
- Oracle/Evidence/Math unchanged.
- Lecture Technique unchanged.
- Strategy A unchanged.
- DEX rules unchanged.
- No new fetch owner, recurring timer, observer, storage owner, wallet, order or trading endpoint.

## Acceptance

1. A fresh coherent/watch CEX set preserves the previous readiness state.
2. A fresh CEX `divergent` verdict downgrades Source Intelligence to `partial`.
3. Stale controls remain excluded first by the 40.6.98 freshness gate, so stale disagreement cannot falsely trigger the new gate.
4. Binance remains the canonical primary price.
5. Version Truth and Version Delivery guards pass for immutable entry `index-40.6.101.html`.
6. Firefox terrain proof must confirm the normal coherent runtime remains operational after deployment.
