# Agent-Crypto Administrator 40.6.567 — MARKET MICROSCOPE · RESPONSIVE SINGLE-LINE TOOLBAR + CANVAS RECLAIM

Parent: **40.6.566**  
Market Core: **38.15.11 — protected / unchanged**

## Target

Desktop:
```text
INDICATEURS  MA  EMA  S/R  SUPER  BOLL  SAR  VWAP  VP   1m  5m  15m  1h  4h  1j  ⟲  ↻
```

Narrow width / Transformer Book:
```text
INDICATEURS  MA  EMA  S/R  SUPER  BOLL  SAR  VWAP  VP
             1m  5m  15m  1h  4h  1j  ⟲  ↻
```

The word **INTERVALLE** is removed. The interval buttons remain unchanged.

## Bounded repair

### 1. One-line toolbar when space exists

The indicator group and interval button group now share one responsive flex toolbar. On a wide desktop surface they remain on one line.

### 2. Clean two-row fallback on narrow surfaces

If the available Microscope width becomes insufficient, the whole interval button group wraps beneath the indicator group. No device name is detected; behavior follows the actual DOM geometry.

### 3. Canvas vertical reclaim

When controls fit on one row:
- candle inspector moves from top 72 px to top 39 px;
- series legend moves from top 145 px to top 112 px;
- the draw routine measures those overlays and therefore recovers the released vertical plot area.

When controls wrap to two rows, the safe 40.6.566 offsets are restored automatically.

### 4. No network side effect

Toolbar row detection is presentation-only. Resize and view-layout changes still perform mount / sync / redraw without adding a candle request solely because geometry changed.

## Preserved

- compact runtime subtitle from 40.6.566;
- OKX via local Backend 127.0.0.1:8790;
- strict candle validation and timeout truth;
- eight indicator state booleans and all formulas;
- native CoinGecko graph dialogue unchanged;
- OKX candle status dialogue unchanged;
- no new storage owner;
- Market Core 38.15.11 unchanged;
- Lecture Technique, Profondeur, Strategy A, Oracle, Aether and New Listings unchanged;
- no real order.

## Firefox terrain proof

1. Desktop wide: all indicator and interval controls on one line.
2. Confirm **INTERVALLE** label is absent.
3. Confirm the candle plotting area is visibly taller than 40.6.566.
4. Narrow Firefox window / Transformer Book width: interval buttons wrap to a second clean row.
5. Widen the window: toolbar returns to one line and plot area expands again.
6. Change 5m → 15m → 1h and confirm normal candle reload.
7. Confirm native CoinGecko dialogue and OKX status dialogue are both preserved.
8. Confirm Lecture Technique and Profondeur are unchanged.

Terrain remains **PENDING Firefox** until operator validation.
