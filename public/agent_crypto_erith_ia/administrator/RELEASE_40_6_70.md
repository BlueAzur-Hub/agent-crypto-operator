# Agent-Crypto Administrator — Build 40.6.70

## AETHER FIREFOX PERFORMANCE · DRAG PAINT BUDGET

Parent: **40.6.69 R1**  
Market Core: **38.15.11** unchanged.

### Why

Aether is functionally stable after 40.6.69 R1, but the approved 1672×941 Observatory and the Aether Workbench remain noticeably expensive to move in Firefox.

Code review found a bounded compositor cost that can be reduced without changing the visual composition:

- the native Window Manager applies a very large moving-window shadow (`0 44px 145px ...`) while a window is dragged;
- Aether itself also owns a large fixed-panel shadow;
- Workbench 40.6.39 owns a large `0 34px 100px` shadow;
- Administrator already has the global Firefox backdrop-filter lock, so this pass does **not** reopen that historical compositor experiment;
- the Aether backplate is already preloaded/decoded by the existing 40.6.52 warm-cache contract.

### 40.6.70 scope

New presentation owner: `aether-performance.css`.

Firefox Administrator only:

- paint/layout/style containment for the Aether window and Workbench;
- while Aether is actively dragged, temporarily remove expensive decorative shadows/transitions/text shadows/animations from the live stage;
- temporarily disable hit-testing inside the stage during active drag;
- while the Workbench title bar is actively held, flatten its large decorative shadow and row/card shadows;
- every visual effect returns automatically when the pointer is released.

### Preserved

- approved Aether 1672×941 artwork and geometry;
- nine LIVE Aether zones and central identity;
- 40.6.69 R1 passive TRADUS bridge;
- Aether Workbench content and modes;
- Window Manager positioning, detach/dock, minimize/maximize and persistence;
- Technical Reading;
- Strategy A;
- TRADUS 40.6.67/40.6.68 logic;
- Market Core 38.15.11;
- no timer, observer, network owner, storage owner or order path added.

### Acceptance in Firefox

1. Aether looks identical when stationary.
2. Dragging Aether feels lighter and does not produce the Firefox slow-page warning.
3. Values remain visible while moving; only decorative paint becomes temporarily flatter.
4. Releasing the pointer restores the normal visual polish immediately.
5. Workbench Historique / Détails / Événements still respond normally and are lighter to drag.
