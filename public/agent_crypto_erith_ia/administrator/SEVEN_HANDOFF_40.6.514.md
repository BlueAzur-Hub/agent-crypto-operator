# SEVEN HANDOFF — Agent-Crypto Administrator 40.6.514

## Point de reprise

Build: **40.6.514**  
Release: **GLOBAL QUOTE ROUTER · USD FOUNDATION**  
Parent: **40.6.513**  
Market Core: **38.15.11 — protected**

## What changed

40.6.514 turns the pre-existing EUR/USD selector into the first real USD display foundation.

The public crypto snapshot already uses CoinGecko USD as source truth and publishes ECB conversion metadata. The new router reads that existing same-origin snapshot and converts the canonical EUR chart display back to USD using the published `fx.usd_per_eur` factor.

USD is now the default display currency.

## Hard separation

- DISPLAY: USD / EUR operator choice.
- EXEC: BTC-EUR unchanged.
- SETTLE: EUR unchanged.

A display switch must never change an execution instrument, settlement asset or historical Evidence unit.

## Scope

This build is intentionally narrow:

- Graphique price display;
- compact Fiche;
- graph insight/workspace/caption truth;
- USD default.

Not yet widened to:

- Market Snapshot table;
- Oracle numerical surfaces;
- Aether numerical surfaces;
- Profondeur multi-quote.

## Protected checkpoint

Profondeur remains the validated **40.6.513** body-document dock. Its native orderbook quote contract is still EUR. Do not alter geometry or quote validation in this build.

## Next decision

Run Firefox proof.

PASS → next build may widen USD coverage to Market / Oracle / Aether, then handle OKX multi-quote separately.

FAIL → repair only the 40.6.514 quote/display owner. Do not touch protected owners.

## Evidence doctrine

A positive trading result is an observation, not proof of a reproducible model. Model validation must preserve after-cost results, fills, slippage, sample size, drawdown, risk rejects and repeatability.

One request → one owner → one correction → one proof → stop.
