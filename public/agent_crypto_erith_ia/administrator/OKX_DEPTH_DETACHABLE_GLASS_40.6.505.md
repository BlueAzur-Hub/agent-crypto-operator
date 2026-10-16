# Agent-Crypto 40.6.505 — Detachable Depth Glass Surface

## Terrain verdict on 40.6.504

40.6.504 remained a presentation miss even though the order-book path was functional.

The requested interaction is now explicit:

1. **Docked**: Depth is visually calqued on Lecture Technique.
   - The decorative image remains visible through the glass.
   - Native Lecture Technique text/widgets remain behind the glass and are subdued, not destroyed.
2. **Detached**: the same Depth surface can be pulled out of Lecture Technique.
   - It becomes a document-level floating window.
   - Native Lecture Technique immediately returns fully visible and interactive.
   - The floating surface can be dragged across the workspace and resized.
3. **Replacer**: docks the surface back onto Lecture Technique.

## Operator controls

- **Décrocher ↗** — detach to a floating surface.
- Drag the header — move the detached surface.
- Native CSS resize handle — resize while detached.
- **Replacer ▣** — restore the docked state over Lecture Technique.
- **×** — close Depth entirely.

## Live behavior

The existing bounded live mode is preserved:
- Backend: `127.0.0.1:8790/orderbook`
- refresh: every 2 seconds only while open
- pause when browser document is hidden
- no direct browser OKX request
- read-only only

## Protected

Unchanged:
- Market Core 38.15.11
- Strategy / Cost Gate
- Oracle / Aether / Atlas CURRENT
- Lecture Technique logic/content
- Web Classique
- Backend 1.4.4 / Bridge 1.9.13
- Candles zoom/pan/fullspace
- real execution / wallet / private API

## Terrain proof

1. Ctrl+F5 and confirm **40.6.505**.
2. Open **Profondeur**.
3. In docked mode, confirm the image remains visible under the glass and native text is subdued behind.
4. Click **Décrocher ↗**.
5. Confirm Lecture Technique immediately returns to its normal base.
6. Drag the floating Depth window over the graph.
7. Resize it once.
8. Confirm live values continue updating.
9. Click **Replacer ▣**.
10. Confirm the surface returns over Lecture Technique.
11. Close and confirm native Lecture Technique is intact.
