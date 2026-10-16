# Agent-Crypto Administrator 40.6.559 — CANDLES · VWAP OPT-IN

Parent: 40.6.558  
Market Core: 38.15.11 — protected / unchanged

40.6.558 SAR passed code review, dedicated CI, Version Truth, Version Delivery and Pages deployment. Terrain remains pending while Christophe is away.

## Single responsibility
40.6.559 adds VWAP only.

- New VWAP button.
- OFF by default.
- Cumulative VWAP using typical price (H+L+C)/3 weighted by candle volume.
- One restrained line on the existing candle canvas.
- No new network request, timer, observer or storage owner.

Unchanged: MA, EMA, S/R, Supertrend, Bollinger, SAR, Technical Reading, Profondeur, Market, Fiche, New Listings, USD, order path and Market Core.

Firefox proof remains pending.
