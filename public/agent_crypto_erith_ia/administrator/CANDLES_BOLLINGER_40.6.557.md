# Agent-Crypto Administrator 40.6.557 — CANDLES · BOLLINGER OPT-IN

Parent: 40.6.556  
Market Core: 38.15.11 — protected / unchanged

40.6.556 is recorded PASS Firefox from Christophe's screenshot: SUPER is present, the Supertrend line is visible on the existing candle graph, and S/R + Technical Reading remain intact.

## Single responsibility
40.6.557 adds Bollinger only.

- New BOLL button beside SUPER.
- OFF by default.
- SMA 20.
- Upper/lower bands = SMA20 ± 2 population standard deviations.
- Upper, middle and lower lines rendered on the existing canvas.
- Very light fill inside the band.
- No new network request, timer, observer or storage owner.

Unchanged: MA, EMA, S/R, Supertrend, Technical Reading, Profondeur, Market, Fiche, New Listings, USD architecture, order path, Market Core 38.15.11.

Firefox proof: BOLL must be OFF by default; ON must show a readable three-line band that recomputes across 5m/15m/1h; OFF must restore the .556 view.
