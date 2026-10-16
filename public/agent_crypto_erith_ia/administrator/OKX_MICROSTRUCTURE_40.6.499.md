# Agent-Crypto 40.6.499 — OKX MICROSTRUCTURE

Parent: **40.6.498**  
Cumulative foundation: **40.6.497 + 40.6.498**  
Market Core: **38.15.11 — protected**

## Added
A collapsible **Profondeur** panel in the Crypto graph.

On open or explicit refresh only, it reads OKX public:
- ticker;
- organic `books` depth;
- consolidated `books-rpi` depth;
- recent trades.

Displayed:
- Bid / Ask / spread and spread bp;
- organic vs RPI imbalance;
- top-20 bid depth;
- consolidated levels: Total / Organic / RPI / aggregated order count;
- recent trade time / side / price / size.

The RPI calculation is explicit: **RPI = totalQty − nonRpiQty**.

## Safety / performance
No WebSocket in the Administrator panel yet, no polling timer, no MutationObserver, no private API, no persistent storage. Data is read only when the operator opens or refreshes the panel.

## Protections
Native Prix/Base100, 40.6.497 quote separation, 40.6.498 candles, Market Core 38.15.11, Strategy A, Oracle, Math, Risk, PAPER, Bridge and Backend are preserved.

## Test environment
The cumulative 497/498/499 modules passed Node syntax, module self-tests, and a headless Chromium visual harness with mocked market data. Firefox terrain on the production page remains pending.