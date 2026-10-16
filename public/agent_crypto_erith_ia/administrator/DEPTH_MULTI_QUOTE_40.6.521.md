# Agent-Crypto 40.6.521 — OKX Depth Multi-Quote

Parent: **40.6.520**
Market Core: **38.15.11 — protected**
Scope: **Profondeur / Carnet only**

## Purpose

Make the OKX orderbook owner follow the DISPLAY domain without falsifying the exchange instrument.

- DISPLAY EUR → existing native `ASSET/EUR` orderbook path.
- DISPLAY USD → request native stablecoin books, preference **USDC**, fallback **USDT**.
- The panel always shows the **actual source pair**: `BTC/USDC`, `BTC/USDT`, etc.
- USDC and USDT are never renamed USD.

## Transport truth

EUR keeps the existing local route:

`GET 127.0.0.1:8790/orderbook?asset=...&depth=100`

Stablecoin books use the existing 40.6.500 OKX public GET transport. Browser requests are intercepted and routed to:

`127.0.0.1:8790/okx-public`

No private exchange API and no backend source-code change are introduced.

## Validation

The owner still requires:
- provider OKX;
- read-only contract;
- requested asset == received asset;
- requested quote == received quote;
- valid source timestamp;
- freshness <= 15 s;
- non-empty, non-crossed bids/asks.

## Presentation

Top-20 notional units now follow the real quote:
- EUR → €;
- USDC → USDC;
- USDT → USDT.

## Protected

- app.js / Market Core 38.15.11;
- Graphique 40.6.520;
- Market/Fiche 40.6.518;
- Oracle/Aether 40.6.519;
- Bougies 40.6.498;
- OKX local transport 40.6.500;
- Lecture Technique;
- Strategy / Evidence / Cost Gate;
- Backend source / Bridge.

## Firefox proof

1. Ctrl+F5 → Build 40.6.521.
2. EUR → Carnet must show `ASSET/EUR`.
3. USD → Carnet must reload `ASSET/USDC`; if unavailable, `ASSET/USDT`.
4. Values must be near the USD/stablecoin market level, not the EUR level.
5. Top20 must show the real quote unit.
6. Return EUR → native EUR book restored.
