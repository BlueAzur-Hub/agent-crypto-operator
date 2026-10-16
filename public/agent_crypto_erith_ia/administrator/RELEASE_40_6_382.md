# Agent-Crypto 40.6.382 — HUD TEXT FRAME

Date: 2026-09-23
Parent: **40.6.381**

## Exact delta

Presentation-only operator HUD refinement:

- keeps the existing REDIVIDER side wings as CSS geometry (gradients, clipped rails, diamond marks);
- adds restrained text ornaments immediately above/below the NORMAL REDIVIDER ring;
- frames REDIVIDER hover status as:
  - `[ 100% ]`
  - `- : PRÊT : -`
  - `— CHARGÉ —`
  - `- Appuyez pour stopper -`;
- frames STOPPED / unavailable states consistently;
- frames Math hover without repeating the Math identity;
- frames the REDIVIDER confirmation-state readout;
- keeps the modal question and safety copy readable and centered.

## Clarification: decoration around REDIVIDER

The existing lateral “wings” around the circular button are **not text**:
they are CSS geometry made from gradients, clipped polygons, rails and small diamond marks.
The central `◈ ◉ ◈` are textual glyphs.
40.6.382 preserves both and adds a small, separate textual HUD layer.

## Preserved

- REDIVIDER continuous solid 360° ring;
- REDIVIDER STOP / RESUME owner and truth;
- confirmation action logic;
- Paper position preservation;
- Math Core 40.6.381 geometry and canonical score source;
- Market Core 38.15.11;
- Strategy A / Gates;
- Oracle / Atlas;
- storage / wallet / network;
- no real orders;
- no new timer, observer or storage owner.

## Terrain proof required

Firefox Ryzen + Transformer Book:

1. no clipping around the REDIVIDER ring;
2. orbit text remains compact and readable;
3. hover HUD feels tactical, not decorative overload;
4. confirmation HUD remains centered;
5. Math hover remains readable;
6. STOP / RESUME behavior unchanged.
