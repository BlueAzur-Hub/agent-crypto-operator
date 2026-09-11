# Agent-Crypto 40.6.68 — TRADUS PAPER OBSERVABILITY · DURABLE EVALUATION ARCHIVE

Parent: **40.6.67 R1**  
Market Core: **38.15.11 — protected / unchanged**

## Purpose

40.6.68 does not change the TRADUS Paper Shadow trading lifecycle introduced in 40.6.67. It adds a read-only observability layer around that owner so PAPER results can be evaluated across browser sessions without turning the public interface into an execution surface.

## Added

- structured `agentcrypto:tradus-paper-snapshot` event;
- executable mark-to-market readout using the exit side of the current top of book;
- PAPER equity-if-closed-now calculation without mutating the 40.6.67 lifecycle;
- bounded local evaluation archive of **closed PAPER trades only** (max 500);
- archive statistics: wins, losses, net result, fees, average net and max closed-trade drawdown;
- exportable `TRADUS_PAPER_EVALUATION_40_6_68.json` receipt;
- explicit operator control to clear only the local 40.6.68 evaluation archive;
- a non-visual Aether data contract via stage datasets, preserving the validated Aether geometry for a later dedicated surface pass.

## Preserved

- TRADUS signal owner: `tradus-shadow-adapter-406066.js`;
- TRADUS Paper lifecycle owner: `tradus-paper-shadow-406067.js`;
- Strategy A remains unchanged and is not made comparable while OFF;
- Aether artwork, radial geometry, Technical Reading, Window Manager and Oracle presentation are untouched;
- Market Core **38.15.11** untouched;
- no broker/exchange order endpoint;
- no credentials, API key or wallet;
- no recurring timer and no new market/network owner.

## Storage contract

The 40.6.67 Paper position remains session-local. 40.6.68 persists **only normalized closed-trade evaluation evidence** in local browser storage. Open positions are not promoted into durable execution state.

## Acceptance

- JS syntax passes;
- built-in observability self-test passes;
- version manifests all report 40.6.68 / parent 40.6.67 / engine 38.15.11;
- index loads 40.6.67 Paper owner before the 40.6.68 observer;
- protected files are not modified.
