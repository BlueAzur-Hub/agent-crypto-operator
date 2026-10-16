# Agent-Crypto 40.6.383 — TRANSFORMER HEADER RELIEF

Date: 2026-09-23
Parent: **40.6.382**

## Exact delta

One responsive presentation correction only:

- on viewports **<= 1280 CSS px**, hide the redundant visual badge:
  `ENGINE · Market Core 38.15.11`
- free horizontal room so the `?` contextual-help control can remain aligned in the main header row.

## Important

The engine reference is **not removed from runtime truth**.
It remains present in:

- `build.json`;
- the `atlas-engine-build` meta truth;
- runtime internals.

Only the visible badge is hidden on constrained widths.

## Preserved

- large desktop: ENGINE badge remains visible;
- Math Core 40.6.382;
- REDIVIDER 40.6.382;
- Lecture Technique;
- Market Core 38.15.11;
- Strategy A / Gates;
- storage / wallet / network;
- no real orders;
- no spacing refactor;
- no other header control moved.

## Terrain proof required

Transformer Book / Firefox:

1. at constrained width, ENGINE badge is not visible;
2. `?` stays aligned with the view controls;
3. no new wrap/regression in the header;
4. desktop wide view still shows ENGINE.
