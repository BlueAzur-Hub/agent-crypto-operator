# Agent-Crypto 40.6.506 — Independent Depth Body Portal

## Terrain verdict on 40.6.505

40.6.505 proved the correct visual intent but the wrong ownership:
- Depth could be detached;
- however, moving it could still carry the Graphique/Lecture workspace.

The screenshots and inspector make the requirement explicit:
**Depth must be an independent surface. Moving Depth must never move #analyste.**

## 40.6.506 correction

Depth is now always a direct child of `document.body`.

Docked mode no longer means DOM nesting inside `#detailPanel`.
Instead, the body-level surface mirrors the current viewport rectangle of Lecture Technique using `getBoundingClientRect()`.

Detached mode keeps the same body-level node and only changes geometry + drag state.

This removes structural coupling to the Graphique/Lecture parent.

## Required terrain behavior

1. Open Profondeur.
2. Docked surface visually overlays Lecture Technique.
3. Click **Décrocher ↗**.
4. Drag the Depth header.
5. Only Depth moves.
6. The graph and Lecture Technique remain immobile.
7. **Replacer ▣** visually re-aligns Depth over Lecture Technique.
8. Closing restores the native panel unchanged.

## Preserved

- local Backend 8790 /orderbook
- 2 s refresh while open
- no direct browser OKX
- no private API
- no wallet
- no real order
- Market Core 38.15.11 unchanged
- Strategy / Cost Gate unchanged
- Oracle / Aether / Atlas CURRENT unchanged
- Lecture Technique logic unchanged
- Web Classique unchanged
- Candles zoom/pan unchanged
