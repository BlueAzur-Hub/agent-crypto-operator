# Agent-Crypto 40.6.517 — Currency Domain V2

Parent: **40.6.516**  
Market Core: **38.15.11 — protected**  
Scope: **data-contract foundation only**

## Purpose

40.6.517 does not switch the interface to USD.

It introduces an additive currency contract that future owner migrations can consume without changing the existing EUR runtime:

- explicit `value`;
- explicit `currency`;
- source identity;
- timestamp and freshness;
- instrument when relevant;
- derivation method;
- FX provenance when a value is converted.

## Contract

`QuoteValue` keeps EUR, USD, USDC and USDT distinct.

`QuoteBundle` groups explicit values for one asset.

`CurrencyContext` keeps four concepts separate:

- DISPLAY currency;
- ANALYSIS currency;
- execution instrument;
- settlement asset.

For this build:

- DISPLAY default remains **EUR**;
- ANALYSIS remains **EUR**;
- EXEC remains **BTC-EUR**;
- SETTLE remains **EUR**.

## Graph preparation

40.6.517 provides currency-aware chart storage/context keys.

It does **not** change any graph source, broker, cache, renderer or Canvas owner yet.

## Protected / unchanged

- `app.js` / Market Core 38.15.11;
- legacy `quote.price` EUR semantics;
- `state.coins`;
- `dataBroker.spot`;
- Graphique owners;
- Oracle / Math;
- Aether;
- Lecture Technique;
- Candles;
- Depth;
- Strategy A / Evidence / Cost Gate;
- Backend / Bridge.

## Safety

No timer.  
No MutationObserver.  
No storage write.  
No business network request.  
No wallet.  
No private API.  
No real order.

## Firefox proof

1. Ctrl+F5.
2. Confirm **Build 40.6.517 · Administrator**.
3. EUR remains selected by default.
4. Graphique remains identical to validated 40.6.516.
5. Market, Fiche, Oracle, Aether, Bougies and Profondeur remain visually/functionally unchanged.
6. Console: `AgentCryptoCurrencyDomainV2.self_test().pass === true`.
7. USD button may still be selected by the existing architecture, but .517 does not propagate USD to owners.

## Stop

If any visible owner changes in .517, the build fails its scope.
