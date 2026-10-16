# Agent-Crypto 40.6.534 — Latest operator intent

Base audited: 40.6.533 at 0697ac561a9a6ee390c279395d52dec1afa9d5d0.

## Reproduced defect

A pending CT ticker could resolve after a canonical exit and reactivate the external exchange context. The .533 public graph API fixes graph ownership but does not cancel async listing producers. Native exit handlers ignored selections still waiting for their first ticker. Period requests could also commit out of order.

## Repair

- Existing category owner reserves an intent revision before the first await; one AbortController follows quote, ticker and candle requests.
- Every async completion checks that its intent still owns the selection. Canonical exit invalidates both selected and pending work without clearing ahead of the native graph handler.
- Existing exchange context owner independently rejects superseded loads and propagates cancellation to its ticker request.
- Provider/instrument must match before candles can be presented. The latest period wins.
- Deferred presentation callbacks cannot restore a discarded Fiche.
- Legacy ribbon guard now reads the stable native category API, not the retired .531 symbol.
- Missing numeric data remains unknown, never 0 USD or 0%.

## Proof and scope

The same delayed-ticker test fails on .533 and passes on the repaired owner. CI exercises real listing modules in Firefox with controlled HTTP fixtures and spies at native chart/depth boundaries, including native exits while ticker/candles are pending, out-of-order CT/MHA, period changes, and unknown prices. This is focused automated proof, not validation of Christophe's full Firefox/Bridge session.

Preserved byte-for-byte: app.js, runtime-shell.html, market-microscope-candles-406498.js, okx-microstructure-406499.js, all CSS, market data and Strategy. Market Core 38.15.11. No new scheduler, observer, storage owner, endpoint, order or wallet.

## Operator acceptance (pending)

Confirm .534. Start CT, immediately click Top 5, then repeat with Réinit., Vider and a BTC row. No delayed CT return. Select CT then MHA quickly: graph, overlay, Fiche and Carnet must agree on MHA. Change 7j then 30j: last request stays 30j. Finally test CT and MHA normally through Ligne/Bougies/Profondeur and Sources.

This release does not claim to solve every visual candle quality issue or certify financial gates.
