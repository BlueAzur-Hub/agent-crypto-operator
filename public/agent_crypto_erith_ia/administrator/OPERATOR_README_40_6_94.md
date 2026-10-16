# Agent-Crypto — Operator Runtime Contract

**Build contract:** 40.6.94  
**Market Core:** 38.15.11  
**Runtime:** shared Administrator document, Operator presentation role.

## Superseded

This historical contract is preserved for continuity. The current Operator delivery contract is:

`OPERATOR_README_40_6_99.md`

The runtime principles below remain valid.

## Entry

Use the existing Agent-Crypto entry with `?view=intermediate` to request the Operator view.

Role precedence remains conservative: a valid local Administrator session keeps the Administrator role; otherwise `view=intermediate` selects Operator; otherwise the public role remains active.

## Security boundary

The Operator query is **not an authorization mechanism**. It does not grant Administrator session authority, Bridge writes, file/GitHub writes, wallet access, order placement, trading endpoints, or private exchange APIs.

## Source Truth

The read-only CEX chain remains:

`Binance primary → Kraken control → Coinbase control → OKX control`

Direct EUR only. Missing coverage stays unavailable (`—`); no synthetic USDT→EUR conversion is created.

## Protected runtime

Market Core `38.15.11`, Web Classic, Aether, Oracle, Lecture Technique and Strategy A are not modified by this Operator contract release.

## Verification

40.6.94 is a contract/documentation seal over the shared runtime. It introduces no new timer, observer, storage owner, network owner, wallet or trading authority.
