# Agent-Crypto @erith.IA — 40.6.226

## G3 STRICT DECISION-TIME TRUTH

Parent: `40.6.225`  
Market Core: `38.15.11` unchanged  
Mode: **PAPER ONLY**  
Gate 3: **PENDING**  
Gate 9: **LOCKED**

## Why this version exists

The 40.6.225 Firefox terrain confirms that the G3 cascade has advanced: the 24h contract is certified, three T0 decisions are traceable/certified and three are joined to the replay dataset. At the same time, the historical post-horizon owner introduced in 40.6.214 starts T+5 / T+15 / T+60 from `market_at`.

`market_at` is the timestamp of the market input. It is not necessarily the timestamp at which Strategy A made the decision. A strict outcome audit must therefore use `decision_at` as its temporal origin.

## Correction

40.6.226 adds a read-only strict temporal owner:

`js/strategy-a-g3-strict-decision-time-truth-406226.js`

It:

- reads the existing certified 24h series and current joined T0 decisions;
- requires an actual decision timestamp;
- validates temporal order when available: `market_at <= decision_at <= available_at`;
- anchors T+5 / T+15 / T+60 to `decision_at`;
- uses the latest certified market point at or before the decision as the descriptive base price;
- accepts the first market point at/after each horizon only inside the certified cadence tolerance;
- keeps null / blank / boolean numeric values as **UNKNOWN**, never as `0`;
- rechecks the 40.6.222 legacy receipt instead of treating its previous PASS as immutable current truth.

## Current-truth behavior

The static 40.6.225 current-truth block is superseded in the DOM by **STRATEGY A · VÉRITÉ T0 STRICTE · 40.6.226**. Legacy audit panels are not deleted.

If every currently joined decision has all strict horizons certified, the next layer may remain **EXECUTION REALISM**. Otherwise the next layer is **STRICT DECISION-TIME OUTCOME REVALIDATION**. In both cases Gate 3 stays **PENDING**.

## Invariants

- no Market Core change;
- no Strategy A threshold or business-logic change;
- no T0 rewrite;
- no historical backfill;
- no current Oracle applied to the past;
- no future outcome used as T0 input;
- no economic backtest execution;
- no profitability claim;
- no recurring timer or MutationObserver;
- no storage write;
- no business network request;
- no live unlock or real order;
- Gate 3 remains PENDING;
- Gate 9 remains LOCKED.

## Terrain check

Reload until **Build 40.6.226 · Administrator** is visible. Verify the strict T0 block appears immediately before the legacy Evidence Dossier, then export the `.md`. No trade, backtest or hidden operator action is required.
