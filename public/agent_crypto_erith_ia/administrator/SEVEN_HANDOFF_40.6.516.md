# SEVEN HANDOFF — Agent-Crypto Administrator 40.6.516

## Canonical checkpoint

Build: **40.6.516**  
Release: **ROLLBACK SAFE CHECKPOINT · RESTORE 40.6.513 RUNTIME**  
Parent: **40.6.515**  
Runtime target restored: **40.6.513**  
Market Core: **38.15.11 — protected**

## Failure record

40.6.514 failed Firefox because USD did not survive the final asynchronous Graphique render.

40.6.515 failed harder: the overlay could say USD while the axis remained EUR, the price line disappeared, and Graphique could show a temporary unavailable state.

Do not build on those runtime mechanisms.

## Recovery

40.6.516 restores the 40.6.513 ownership model and returns DISPLAY default to EUR.

The failed router and handshake modules remain historical but are not loaded by the canonical entry.

## Next decision

Firefox recovery proof only.

PASS:
- freeze 40.6.516 as the safe checkpoint;
- redesign USD from source/owner boundaries in a separate plan before code.

FAIL:
- compare only against 40.6.513 runtime files;
- no feature work until recovery is exact.

## Method

recovery → proof → freeze → only then redesign.
