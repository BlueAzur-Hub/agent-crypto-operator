# SEVEN HANDOFF — Agent-Crypto Administrator 40.6.515

## Canonical checkpoint

Build: **40.6.515**  
Release: **GRAPH OWNER HANDSHAKE · USD COMMIT AFTER RENDER**  
Parent: **40.6.514**  
Market Core: **38.15.11 — protected**

## Why this build exists

40.6.514 proved that selecting USD was not enough: the asynchronous canonical graph owner rendered EUR after the router had already applied USD.

40.6.515 adds an explicit owner boundary:

`prepareOwnerRender → canonical owner render → settleOwnerRender → DISPLAY commit`.

This is event-driven. No periodic repair loop is allowed.

## Scope

Only the Graphique display ownership race is repaired.

Oracle remains outside scope and can still display EUR until the later USD coverage build.

Bougies already route USD to USDC and must remain functional.

Profondeur remains the validated 40.6.513 EUR-native owner.

## Next decision

Firefox proof first.

PASS:
- preserve 40.6.515;
- next build can widen USD coverage to Oracle / Market / Aether one owner at a time.

FAIL:
- repair only the handshake/router boundary;
- do not touch app.js, Market Core, Oracle, Aether, Strategy or Profondeur.

## Trading validation discipline

A strong isolated gain is evidence worth recording, not proof of a reproducible model. Preserve after-cost P/L, fees, spread, slippage, fill quality, drawdown, risk rejects, timestamps and sample size.

One request → one owner → one correction → one proof → stop.
