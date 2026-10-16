# Agent-Crypto 40.6.502 — OKX Orderbook Depth Bottom Dock

## Terrain verdict on 40.6.501

40.6.501 is a **PASS for Candles UX**:
- Build 40.6.501 loaded in Firefox.
- Full-space candles visible.
- Wheel zoom and drag/pan visually confirmed.
- Tooltip and moving averages preserved.

40.6.501 is a **FAIL for Depth UX**:
- the right overlay masks too much of the chart;
- it does not resemble an operator order-book/depth surface;
- terrain still showed `NetworkError` on the operator Depth path.

## 40.6.502 repair

The operator Depth surface is rebuilt around the already-proven local Backend 8790 order-book route introduced in 40.6.492:

`http://127.0.0.1:8790/orderbook?asset=<ASSET>&depth=100`

No browser-to-OKX direct fetch is used by the operator Depth panel.

### UX

Depth now opens as a **bottom dock**, closer to the exchange-terminal/mobile pattern shown by the operator.

Two internal tabs:
- **Carnet d’ordres** — BID and ASK ladders with cumulative quantity bars.
- **Profondeur** — cumulative notional around the mid price at ±5 / ±10 / ±25 bp.

KPIs:
- Best Bid
- Best Ask
- Spread
- Spread bp
- Mid
- Bid Top 20 notional
- Ask Top 20 notional

The chart remains visible above the dock.

## Preserved
- 40.6.501 candle wheel zoom.
- drag/pan.
- double-click / reset.
- 40.6.500 local transport for candles.
- Aether Control R19 / Backend 1.4.4 / Bridge 1.9.13.
- Market Core 38.15.11.
- native Prix / Base100.
- Strategy / Cost Gate.
- Oracle, Aether, Atlas CURRENT, Lecture Technique, Web Classique.

No private API, wallet, order, recurring timer, storage owner, observer or Market Core change.

## Terrain proof
1. Ctrl+F5 and confirm 40.6.502.
2. Confirm Candles zoom/pan still work.
3. Press **Profondeur**.
4. The panel must appear at the bottom of the chart, not as a large right overlay.
5. No `NetworkError`.
6. Verify BID / ASK / Spread / Mid / Top20 values.
7. Verify **Carnet d’ordres** ladder.
8. Verify **Profondeur** ±5/10/25 bp bands.
9. Close Depth and confirm the full chart is restored.
