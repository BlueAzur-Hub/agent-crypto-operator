# VALIDATION — Agent-Crypto 40.6.267

Status: COMMITTED RELEASE · FIREFOX TERRAIN PENDING

## Static contract

- Event Memory no longer calls `MarketRegimeContext.for_event()`.
- Event Memory regime_t0 is classified from the same T0 row already selected by indexed nearest lookup.
- Decision Intelligence no longer calls `EventSemanticEnrichment.clusters()` eagerly.
- Historical Analog 40.6.266 remains the lazy clustering owner.
- no Section 01 DOM change.
- no Window Manager change.
- no runtime-shell change.
- no Strategy A threshold change.
- no Market Core change.
- no new timer / observer / fetch / storage owner.
- no real-order path.

## Required live proof

1. Ctrl+F5 and confirm Build 40.6.267.
2. Open Decision Intelligence once.
3. Firefox must not display the slowdown banner.
4. No multi-second stall.
5. Same-event close/reopen must be immediate.
6. Déplier/Replier must match actual state.
7. Oracle/Binance/Atlas/Strategy A must continue updating.
