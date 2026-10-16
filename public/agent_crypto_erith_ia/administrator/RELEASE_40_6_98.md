# Agent-Crypto 40.6.98 — Source Freshness Fail-Closed Stabilization

Parent: 40.6.97
Engine: Market Core 38.15.11 (unchanged)

## Scope
- Add a read-side freshness gate to the existing Source Truth / Source Intelligence runtime.
- Freshness limit derives from the current automatic refresh minimum interval plus 60 seconds grace, with a 120 second floor.
- A provider observation older than the gate is excluded from the guarded CEX consensus.
- If an asset no longer has at least two fresh providers, the guarded Source Intelligence cannot remain fully ready.
- Existing raw owner is preserved and exposed for diagnosis; no canonical price is fabricated.

## Safety
- Read-only.
- No wallet, order, withdrawal, private exchange API or synthetic USDT→EUR conversion.
- No recurring timer, MutationObserver or new storage owner.

## Expected runtime proof
When controls are fresh, Source Intelligence remains normal. When timestamps become stale, the guarded API downgrades to partial and the mounted UI reports `FRAÎCHEUR PARTIELLE` / `CEX À RAFRAÎCHIR` instead of silently treating old observations as current.
