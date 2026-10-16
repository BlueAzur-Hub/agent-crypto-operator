# Agent-Crypto Administrator — 40.6.73 R5

## Active Market Fiche Body-Top Portal

Parent corrective: 40.6.73 R4.

### Test result that forced R5
R4's extreme `z-index` alone did not keep the active floating Crypto fiche above Aether in the live Firefox Administrator stack.

### Root cause class
The live Administrator workspace contains extreme/clamped z-index values. When surfaces reach the browser's effective upper z-index range, paint order can still resolve by stacking-context / DOM order. A pure numeric raise is therefore insufficient.

### Correction
The existing `#atlasHelpLayer` is not cloned or rebuilt. When a real Crypto fiche is visible, R5:

1. keeps its fixed geometry;
2. keeps the maximum foreground z-index lock;
3. moves the existing node to the end of `<body>` after the opening interaction completes.

This guarantees foreground paint priority against Aether even when extreme z-index values tie or clamp.

### Trigger surface
Promotion is checked after the existing operator interactions only: `pointerover`, `focusin`, `click`, `keydown`.

No MutationObserver, no interval, no polling and no network/storage owner are added.

### Protected
- Aether geometry unchanged.
- Aether visibility unchanged.
- Administrator Window Manager unchanged.
- Market Core 38.15.11 unchanged.
- Graph / Oracle / Atlas / Lecture Technique unchanged.
- Existing fiche node and fiche content unchanged.

### Acceptance
In Administrator:
- open Aether;
- open or hover a Crypto fiche from Target Top 5 / Market;
- the fiche must paint above Aether in the overlap zone;
- leaving/closing the fiche must preserve normal Aether behavior.
