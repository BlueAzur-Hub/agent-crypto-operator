# Agent-Crypto Administrator 40.6.561 — CANDLES · REQUEST + ASSET TRUTH LOCK

Parent: **40.6.560**  
Market Core: **38.15.11 — protected / unchanged**

## Why this build

The post-40.6.560 code review found a truth gap in Market Microscope orchestration:

- an interval click could change the displayed state while the previous request was still loading;
- a later request was refused by `state.loading`, allowing old candles to land under a newer bar label;
- the normal Market path guessed a symbol from visible text with a finite whitelist and could fall back to BTC;
- ordinary Market selection changes did not have a dedicated Microscope reload path;
- the normal OKX candle request had no bounded timeout / abort owner.

40.6.561 repairs only this request/context ownership.

## Single responsibility

**The candle series that wins must belong to the latest requested asset + quote + bar.**

### Canonical asset

Normal Market mode now uses the existing canonical owner:

`getSelectedCoin().symbol`

The historical finite symbol-regex guess is removed.

New Listings keep their separate explicit external context.

### Latest request wins

Each load now owns:

- requested instrument;
- requested bar;
- monotonically increasing request token;
- dedicated `AbortController`;
- bounded 12 s timeout.

A newer load aborts the previous one. A stale response cannot commit rows.

Requested context and loaded context are separate, so the interface can keep showing the last valid series while a new request is in flight without relabelling old candles as the new bar.

### Market selection synchronization

The Microscope installs a narrow post-selection hook on the existing canonical Market selection owners:

- `atlasSelectMarketCoin`;
- `atlasSetComparisonIds`.

If Bougies is open, a canonical Market selection change requests the latest candle context.

Quote-architecture and New Listing events remain preserved.

## Explicitly unchanged

- indicator formulas: MA / EMA / S/R / SUPER / BOLL / SAR / VWAP / VP;
- Support / Resistance algorithm;
- Lecture Technique business logic;
- Profondeur;
- Market Core 38.15.11;
- New Listings discovery/business logic;
- USD architecture;
- Strategy A;
- Oracle;
- Aether;
- Web Classique;
- storage ownership;
- real / automatic orders.

No recurring timer, MutationObserver or new business data source is added.

## Firefox terrain proof required

1. BTC → Bougies → rapidly switch **15m → 1h**. Final metadata and candles must both belong to **1h**.
2. While Bougies is open, select **ETH**, then a Market asset outside the old whitelist such as **TRX**. The Microscope must follow the canonical selected symbol and must not fall back to BTC.
3. Toggle **EUR / USD** while Bougies is open. The final loaded instrument must match the latest quote architecture.
4. Enter a New Listing, then return to the normal Market path. An older external request must never overwrite the returned canonical Market context.
5. Existing S/R, SUPER, BOLL, SAR, VWAP, VP, Lecture Technique and Profondeur must remain unchanged.

Terrain remains **PENDING Firefox** until Christophe validates it.
