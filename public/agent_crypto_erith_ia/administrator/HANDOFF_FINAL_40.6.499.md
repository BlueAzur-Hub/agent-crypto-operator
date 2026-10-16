# HANDOFF SEVEN — 40.6.499 · MARKET MICROSCOPE / OKX MICROSTRUCTURE

## Current checkpoint
- Administrator **40.6.499**
- Market Core **38.15.11 protected**
- Strategy A V1 **FAIL_BENCHMARK_FROZEN**
- Strategy A2 **not started**
- V6.2 local BTC-EUR fill-quality/adverse-selection campaign is running separately; final JSON pending.

## Cascade delivered
- **40.6.497** Quote Currency Architecture: display EUR/USD separated from execution instrument and settlement asset.
- **40.6.498** Market Microscope Candles: additive OHLC/volume/MA5/10/20/crosshair, 1m/5m/15m/1h/4h/1j; native Prix/Base100 untouched.
- **40.6.499** OKX Microstructure: on-demand public ticker/books/books-rpi/trades panel, no polling/WebSocket/private API.

## First terrain test for next IA
Ctrl+F5 in Firefox → confirm Build 40.6.499 → Graphique Crypto:
1. EUR/USD selector: USD must not mutate EXEC BTC-EUR.
2. Bougies: test 15m, 1m, 1h, hover O/H/L/C/V, return Ligne.
3. Profondeur: open, verify real instrument, Bid/Ask/spread bp, organic/RPI imbalance, levels Total/Organic/RPI/#orders, trades; refresh once; close.
4. Confirm Prix/Base100/Top5/Lecture Technique/Market Core unchanged.

## After 40.6.499
Wait for V6.2 FINAL JSON. Then run the same bounded lab on BTC-USDC before any execution-market decision.

## 40.6.500 — EXECUTION VENUE COMPARATOR
Evidence-only comparator, not a trading gate. Compare BTC-EUR vs BTC-USDC on matched test design: spread bp, organic/RPI depth, maker/taker fee, full/partial/no-fill, fill CDF/median/P95, short markouts, filled-vs-no-fill adverse-selection delta, and EUR conversion/settlement cost. No winner without matched evidence; no live order.

## 40.6.501 — STRATEGY A2 EVIDENCE LAB
Start only after 40.6.500 terrain/evidence is complete. Freeze Strategy A V1 as historical FAIL benchmark. A2 must consume measured execution-instrument truth, cost, fill probability, adverse selection and horizon evidence. Do not lower old thresholds to manufacture PASS; no production/live execution without separate certification and human authorization.
