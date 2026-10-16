# Agent-Crypto 40.6.520 — Graph Native USD Source

Parent: **40.6.519**
Market Core: **38.15.11 — protected**
Scope: **Graphique source/cache/context/presentation only**

## Purpose

Continue the owner-by-owner USD migration at the Graphique owner boundary.

When DISPLAY = USD:
- historical price series use CoinGecko market_chart with vs_currency=usd;
- USD chart cache is isolated from EUR cache;
- chart context keys include USD;
- graph price axes and tooltip format USD;
- the single-series caption reports Prix USD;
- the 24 h live presentation endpoint uses explicit priceUsd.

When DISPLAY = EUR, the existing canonical graph path remains unchanged.

## Truth rule

40.6.520 does not convert an EUR series into USD in Firefox.
It does not label USDC or USDT as USD.
USD historical data is requested as USD from the upstream historical source.

## Why CoinGecko for USD

The current Binance graph owner is explicitly EUR-oriented: direct EUR markets or USDT/EUR-derived EUR series.
For DISPLAY USD, 40.6.520 therefore selects CoinGecko native USD history instead of pretending a stablecoin pair is USD.

## Cache and context

EUR retains the existing cache keys.
USD uses a distinct owner key:

<asset>:USD:<family>:<period>

Graph render context also carries the USD domain, preventing an EUR render from satisfying an USD context.

## Protected

- app.js stays byte-for-byte unchanged;
- Market Core 38.15.11;
- Market + Fiche 40.6.518;
- Oracle + Aether 40.6.519;
- Lecture Technique;
- Bougies;
- Profondeur / OKX Carnet;
- Strategy A / Evidence / Cost Gate;
- Backend / Bridge.

## Firefox proof

1. Ctrl+F5 → Build 40.6.520 · Administrator.
2. EUR default: Graphique must remain identical to 40.6.519.
3. Click USD.
4. Single BTC 24 h: header must say PRIX USD, y-axis/tooltip must show USD, source must be CoinGecko USD.
5. Test 7 j / 30 j / 60 j / 90 j / 1 an / Max as available.
6. Test Top 3 / Top 5 comparison: Base 100 stays unitless, raw tooltip values are USD.
7. Return EUR: Graphique must reload the canonical EUR path, not reuse the USD cache.
8. Oracle/Aether/Market/Fiche remain USD-capable.
9. Bougies and Profondeur remain unchanged in this build.

## Stop

Do not start the Profondeur multi-quote migration until Firefox proves the Graphique round-trip EUR → USD → EUR.
