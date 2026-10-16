# Agent-Crypto 40.6.503 — Live Depth on Lecture Technique

## Terrain verdict on 40.6.502

40.6.502 is a functional PASS:
- local orderbook loads;
- no browser OKX NetworkError on the operator Depth path;
- orderbook and depth tabs render;
- depth bands are visible;
- 40.6.501 candle zoom/pan remain intact.

Presentation remains unsatisfactory:
- the dock consumes chart space instead of using the existing right-side operator surface;
- typography is too small for comfortable reading.

## 40.6.503 repair

Depth is moved onto the existing **Lecture Technique** panel as a semi-transparent overlay.

Why this location:
- preserves the chart at full width;
- uses an already-reserved operator surface;
- visually masks the decorative image while Depth is active;
- restores Lecture Technique unchanged when closed.

## Quasi-live behavior

The operator asked whether OKX Depth moves continuously.
Native OKX orderbooks are updated near-real-time from exchange market data.

40.6.503 does not claim tick-by-tick exchange parity.
It performs bounded read-only polling of the proven local Backend 8790 orderbook route every **2 seconds**, only while the overlay is open.

Polling:
- starts when Depth opens;
- stops when Depth closes;
- pauses when the document is hidden;
- never sends private API or order requests.

## Typography

Increased operator readability:
- title: 12 px;
- KPIs: 11 px;
- orderbook rows: 10 px;
- notes / labels: 8–9 px.

## Protected

Unchanged:
- Market Core 38.15.11
- native chart / Base100
- 40.6.501 candles zoom/pan/fullspace
- 40.6.500 candle transport
- Backend 1.4.4 / Bridge 1.9.13
- Strategy / Cost Gate / Oracle
- Aether / Atlas CURRENT
- Lecture Technique logic
- Web Classique
- storage ownership
- real execution

## Terrain proof

1. Ctrl+F5 and confirm Build 40.6.503.
2. Open Depth.
3. It must cover the **Lecture Technique** panel on the right, not the chart.
4. Background remains semi-transparent / blurred.
5. Text must be clearly larger than 40.6.502.
6. Keep open ~10 seconds: bid/ask values should update about every 2 seconds.
7. Switch to **Profondeur** and confirm ±5/10/25 bp bars.
8. Close the overlay and confirm original Lecture Technique is intact.
9. Confirm Candles zoom/pan still work.
