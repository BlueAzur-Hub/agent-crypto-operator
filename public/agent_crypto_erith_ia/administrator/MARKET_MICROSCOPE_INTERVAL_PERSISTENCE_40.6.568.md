# Agent-Crypto Administrator 40.6.568 — MARKET MICROSCOPE · INTERVAL PERSISTENCE

Parent: **40.6.567**  
Market Core: **38.15.11 — protected / unchanged**

## Target

Micro-correction only:

- an operator-selected candle interval must survive a page reload;
- no graph, transport, indicator, responsive layout, Lecture Technique or Profondeur behavior is otherwise changed.

## Repair

A new stable preference key stores only the explicit operator candle interval:

`agentCrypto.marketMicroscope.bar.v1`

Allowed values:
- 1m
- 5m
- 15m
- 1h
- 4h
- 1j

If the stored value is missing or invalid, the safe default remains **15m**.

The preference is written only when the operator clicks an interval button. Programmatic candle loads do not overwrite the saved preference.

## Preserved

- 40.6.567 responsive one-line toolbar and narrow two-row fallback;
- 40.6.567 canvas vertical reclaim;
- OKX via local Backend 127.0.0.1:8790;
- strict candle validation and timeout truth;
- eight indicator state booleans and their existing storage owner;
- no Ligne/Bougies mode persistence added in this build;
- native CoinGecko dialogue unchanged;
- OKX candle status dialogue unchanged;
- Market Core 38.15.11 unchanged;
- Lecture Technique, Profondeur, Strategy A, Oracle, Aether and New Listings unchanged;
- no real order.

## Firefox terrain proof

1. Select **5m** in Bougies.
2. Reload the page.
3. Open Bougies and confirm **5m** is restored instead of 15m.
4. Repeat with **1h** and confirm **1h** is restored after reload.
5. Confirm the responsive toolbar and graph geometry remain identical to 40.6.567.
6. Confirm indicator states, Backend 8790, Lecture Technique and Profondeur are unchanged.

Terrain remains **PENDING Firefox** until operator validation.
