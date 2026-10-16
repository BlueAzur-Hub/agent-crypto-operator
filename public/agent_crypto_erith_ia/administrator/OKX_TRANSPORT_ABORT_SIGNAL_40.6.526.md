# Agent-Crypto 40.6.526 — OKX Transport AbortSignal + Canonical Owner Name

Parent **40.6.525** · Market Core **38.15.11** · Backend **1.4.4** · Bridge **1.9.13**

The browser OKX route owner rebuilt local fetch calls without the caller AbortSignal.
40.6.526 forwards only the original AbortSignal in addition to the bounded GET/no-store/Accept contract.

Loaded owner: `js/okx-local-backend-transport.js`.
Historical `okx-local-backend-transport-406500.js` remains in repository but is no longer loaded.

No change to Backend, Bridge, Bougies, Profondeur, pairs, Strategy, wallets or orders.
