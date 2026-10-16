# Agent-Crypto Administrator 40.6.566 — MARKET MICROSCOPE · COMPACT META + CONTROL AIR

Parent: **40.6.565**  
Market Core: **38.15.11 — protected / unchanged**

## Why this build

Firefox terrain showed that 40.6.565 stabilized the indicator and interval controls, but the left subtitle still duplicated nearly every technical capability in one long line:

`BTC-USDC · 5m · 300 points · O/H/L/C + Volume · MA5/10/20 + EMA5/10/20 + S/R pivots + Supertrend 10×3 + Bollinger 20×2 + SAR 0.02/0.20 + VWAP fenêtre + Volume Profile approx`

That line competed horizontally with the controls and could wrap, creating the impression that controls had moved or disappeared.

## Bounded repair

The subtitle is reduced to one compact runtime identity:

`instrument · interval · candle count · provider`

Example:

`BTC-USDC · 5m · 300 bougies · OKX`

The detailed indicator inventory is not repeated in the subtitle because the dedicated controls and legend already expose it.

## Geometry guard

- subtitle is one line only;
- overflow is clipped with ellipsis;
- title block has a bounded maximum width;
- indicator and interval rows keep the 40.6.565 stable geometry.

## Preserved

- OKX via local Backend 127.0.0.1:8790;
- strict candle validation and timeout truth from 40.6.564;
- eight indicator states and formulas;
- no new storage owner;
- no mode or interval persistence added;
- Market Core 38.15.11 unchanged;
- Lecture Technique, Profondeur, Strategy A, Oracle, Aether and New Listings unchanged;
- no real order.

## Firefox terrain proof

1. Open Bougies.
2. Verify subtitle is short and remains one line.
3. Confirm the long technical inventory is gone from the header.
4. Confirm all indicator controls remain visible.
5. Confirm 1m / 5m / 15m / 1h / 4h / 1j remain visible and stable.
6. Change 5m → 15m → 1h and confirm normal candle reload.
7. Confirm Lecture Technique and Profondeur are unchanged.

Terrain remains **PENDING Firefox** until operator validation.
