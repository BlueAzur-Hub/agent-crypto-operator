# Agent-Crypto 40.6.501 — Market Microscope Fullspace Zoom + Depth Dock

## Purpose
40.6.501 follows the successful 40.6.500 transport repair and focuses only on operator interaction and readability.

### Candles
- Wheel = horizontal zoom.
- Drag = pan through the loaded candle history.
- Double-click or ⟲ = reset viewport.
- Tighter internal padding so the plot fills more of the available chart surface.
- Denser grid and visible time/price axis labels.
- Existing OHLC tooltip, volume and MA5/10/20 preserved.

### Depth
The existing 40.6.499 OKX microstructure surface is no longer hidden below the graph.
It is docked inside the chart shell and opens immediately when the operator presses **Profondeur**.

The dock explains:
- BID
- ASK
- SPREAD
- IMBALANCE
- DEPTH
- RPI

and keeps ticker / books / books-rpi / recent trades read-only.

## Protected
Unchanged:
- Market Core 38.15.11
- 40.6.500 local OKX transport
- Aether Control R19 / Backend 1.4.4 / Bridge 1.9.13
- native Prix / Base 100
- Strategy thresholds / Cost Gate
- Oracle Math
- Aether
- Atlas CURRENT
- Lecture Technique
- Web Classique
- storage ownership and timers
- real execution

## Terrain proof
Firefox Ryzen:
1. Ctrl+F5 and confirm Build 40.6.501.
2. Bougies 15m: wheel zoom in/out.
3. Drag horizontally.
4. Double-click or ⟲ to reset.
5. Confirm the candle plot uses nearly the full available panel.
6. Press Profondeur: a visible right-side dock must appear immediately.
7. Confirm BID/ASK/spread/depth/RPI/trades are readable.
8. Return to Ligne / Prix / Base100 and confirm native surfaces remain intact.
