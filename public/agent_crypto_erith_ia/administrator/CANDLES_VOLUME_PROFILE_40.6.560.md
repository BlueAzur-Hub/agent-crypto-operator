# Agent-Crypto Administrator 40.6.560 — CANDLES · VOLUME PROFILE APPROX OPT-IN

Parent: 40.6.559  
Market Core: 38.15.11 — protected / unchanged

40.6.559 VWAP passed code review, dedicated CI, Version Truth, Version Delivery and Pages deployment. Terrain remains pending while Christophe is away.

## Single responsibility
40.6.560 adds an opt-in Volume Profile approximation.

Truth boundary: this is **not tick-level/exchange-native Volume Profile**. The current data source is candle OHLCV, so each visible candle's volume is assigned to the price bin containing its typical price (H+L+C)/3.

- New VP button.
- OFF by default.
- 24 bins across the visible price range.
- Low-opacity horizontal bars at the right edge.
- Highest-volume bin is highlighted as an approximate POC.
- Existing candles remain the primary visual layer.
- No new network request, timer, observer or storage owner.

Unchanged: all prior indicators, Technical Reading, Profondeur, Market, Fiche, New Listings, USD, order path and Market Core.

Firefox proof remains pending.
