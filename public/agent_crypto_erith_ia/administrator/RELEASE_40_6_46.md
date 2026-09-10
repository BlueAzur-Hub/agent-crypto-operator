# Agent-Crypto Administrator — 40.6.46

## AETHER CLEAN REBUILD · SINGLE RADIAL OWNER · F11 PARITY

Parent: **40.6.45**  
Market Core: **38.15.11 — protected**

### Why this build exists

40.6.45 exposed the real Aether presentation debt: the historical 40.6.30/40.6.32 Observatory and the newer 40.6.42+ component stage could coexist in the same runtime panel. This build does not add another visual patch. It rebuilds the Aether panel presentation around one stage only.

### Single-owner contract

- `js/aether.js` keeps the existing Aether data/view-model owners.
- At panel creation, historical Aether presentation nodes are removed from the runtime panel.
- `aether-406046.css` is the only current Aether visual owner.
- The stage is `aether46-stage`, isolated from `.aether42-*` and historical grid selectors.
- The approved operator-provided empty artwork is used directly as PNG: `assets/aether/aether-observatory-empty-ui-406046.png`.
- No image generation and no recompression of the approved artwork.

### Visual contract

- exact 1672 × 941 design ratio;
- nine radial live zones:
  - System / Sources / Atlas;
  - Convergence;
  - Divergence / Market / Recent Events;
  - Oracle / Weather;
- central Aether attention readout over the existing lotus/orbits without an opaque center card;
- painted capsules remain the visual panels; the DOM provides live text only;
- windowed and F11/maximized use the same stage and geometry, only scaled;
- no vertical-dashboard reflow on desktop;
- History / Details remain delegated to the existing Aether Workbench.

### Interaction contract

- Aether is closed on boot in Classic, Intermediate and Administrator views;
- Window Manager may restore geometry, never Aether visibility;
- operator click is required to open Aether;
- direct Administration → Aether Trust returns to the operator viewport;
- explicit Atlas → Trust → Atlas navigation remains preserved.

### Protected / unchanged

- Market Core 38.15.11;
- Graph;
- Technical Reading;
- Chronos;
- Oracle engine;
- Aether Workbench;
- Strategy A;
- order paths.

No new recurring timer, observer, network owner, storage owner, automatic order or real order is introduced.
