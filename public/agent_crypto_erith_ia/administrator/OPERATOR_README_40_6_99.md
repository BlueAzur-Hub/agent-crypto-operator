# Agent-Crypto — Operator + Bridge Runtime Contract 40.6.99

**Runtime build:** 40.6.99  
**Market Core:** 38.15.11  
**Runtime:** shared Administrator document, Operator presentation/workspace role.  
**Operator entry:** `../operator/index-40.6.99.html`

## Entry

The first-class Operator entry opens the immutable Administrator runtime with `?view=intermediate`.

Role precedence remains conservative: a valid local Administrator session keeps the Administrator role; otherwise `view=intermediate` selects Operator; otherwise the public role remains active.

## Aether Operator Bridge

The shared runtime already loads `js/aether-operator-bridge.js`.

Its bounded responsibilities are preserved:
- reuse the existing Livecheck button once on an empty cold boot;
- allow VEILLE to return to the native operator row;
- hold that native row until Aether is reopened or the page reloads;
- add no recurring timer, observer, fetch owner, storage write, trading state or market algorithm.

## Security boundary

The Operator query is **not an authorization mechanism**. It does not grant Administrator session authority, Bridge writes, file/GitHub writes, wallet access, order placement, trading endpoints, or private exchange APIs.

## Source Truth

Read-only CEX chain remains `Binance primary → Kraken control → Coinbase control → OKX control`, direct EUR only.

## Protected runtime

Market Core `38.15.11`, Web Classic, Aether, Atlas CURRENT, Oracle, Lecture Technique, Strategy A and the Administrator runtime remain unchanged by this Operator delivery.

## Version policy

This is an Operator delivery on the already validated `40.6.99` runtime. It deliberately does not bump Administrator to `40.6.100`, because no shared runtime defect or new engine function requires that bump.
