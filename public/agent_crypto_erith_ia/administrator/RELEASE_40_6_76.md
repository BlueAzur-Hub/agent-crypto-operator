# Agent-Crypto Administrator — 40.6.76

## Aether Watch V2 — Native Position Lock

Canonical parent: **40.6.75**. Engine: **Market Core 38.15.11** unchanged.

### Field validation inherited from 40.6.75

The V2 backplate, the nine-cell geometry and the 40.6.75 icon-safe typography are now frozen. `aether-v2-406075.css` is reused byte-for-byte by this release. No visual density, typography, padding, card geometry or background change is introduced.

### Defect corrected

40.6.75 still had two position authorities: the Aether Window Manager definition and `aether-frame-406075.js`, which recomputed and reapplied a centered/bottom-aligned target on open, resize, pageshow and Administrator-ready. The operator could therefore see Aether return to an automatic position even though centering had never been requested.

40.6.76 retires that behavior.

### Native position contract

- `js/app.js` remains the real first-open geometry definition owner.
- First open without saved geometry uses the native left workspace anchor (`x = 12`) while preserving the validated width, height and vertical formula.
- Existing Window Manager geometry is read-only reused after reload.
- A genuine operator-moved `x/y/width/height` wins unchanged.
- The exact legacy <=40.6.75 auto-centered geometry is migrated once to `x = 12`; width, height and y are preserved.
- After that migration there is no Aether resize listener, pageshow reframe or continuous geometry normalization.
- Drag, resize, persistence, z-order, minimize, hide and maximize remain owned by the canonical Administrator Window Manager.
- Explicit maximize keeps the historical Window Manager maximize/restore contract.

### Protected

- Market Core **38.15.11** unchanged;
- V2 PNG unchanged;
- `aether-v2-406075.css` unchanged;
- Administrator Window Manager core unchanged;
- Graphique unchanged;
- Lecture Technique unchanged;
- Atlas / Oracle / Sources data owners unchanged;
- active market fiche foreground R5 preserved;
- Operator / Yohan runtime unchanged;
- no new recurring timer;
- no MutationObserver;
- no new storage owner;
- no new network owner;
- no trading action.

### Firefox acceptance

1. From 40.6.75 click the Build badge: `build.json` must advertise 40.6.76 without requiring Ctrl+F5.
2. Open Aether normally. It must not be globally auto-centered by the Aether bridge.
3. Move Aether manually, close it, reopen it in the same session: the operator position must remain authoritative.
4. Reload, open Aether: the Window Manager saved geometry must be reused when valid.
5. If the only saved geometry is the historical auto-centered 40.6.75 position, it may migrate once to the native left anchor.
6. Maximize then restore: the Window Manager must restore the floating geometry.
7. Confirm the 40.6.75 visual composition is unchanged.
