# Agent-Crypto 40.6.535 — Solo Market Surface Intent

Parent audited: 40.6.534 at merge commit `366e5c0993ca655566790b4d63250c08930e927f`.

## Terrain defect

With Graph Context V7 memorized on **Oracle / Top 5**, an explicit click on **Solo** correctly selected one Market asset, but the memorized Oracle surface could remain active and cover the requested BTC Solo graph. Closing Oracle manually revealed the correct BTC Solo result.

## Root cause

The canonical Solo handler called `atlasResetComparison(...)` and then `atlasGraphContextV7CommitMarket("handler-solo")`.

`atlasGraphContextV7CommitMarket()` intentionally preserves an already-active Oracle surface for unrelated Market checkpoints. That behavior is correct globally, but it means the explicit Solo operator intent did not switch the active surface back to Market.

## Repair

The canonical Solo handler now, before resetting the comparison:

1. sets `state.chartViewV2.oracle = false`;
2. stores `activeSurface = "market"` through the existing V7 surface owner;
3. synchronizes the existing chart controls;
4. executes the existing Solo reset and normal Market commit.

The saved Oracle sub-profile is **not deleted or rewritten**. An explicit later click on Oracle can restore it normally.

## Scope lock

Unchanged:
- Oracle model and math;
- Oracle saved sub-profile;
- Graph renderer and historical data;
- Top 3 / Top 5 algorithms;
- New Listings lifecycle;
- Profondeur / order book;
- Strategy / Evidence;
- Market Core 38.15.11;
- storage schema.

No new timer, observer, network owner, storage owner, order or wallet.

## Operator acceptance

1. Start from a remembered `Oracle / Top 5` context.
2. Click **Solo**.
3. Oracle must close immediately.
4. BTC Solo must remain visible.
5. Click **Oracle** explicitly.
6. The saved Oracle view/horizon/zoom may restore normally.
7. Top 5, Reset and Clear remain unchanged.

Firefox operator validation remains pending until Christophe tests the deployed build.
