# Agent-Crypto 40.6.34 — AETHER OBSERVATORY · SINGLE STAGE 16:9 · CODE-ONLY LOCK

Parent: **40.6.33**  
Market Core: **38.15.11 — protected**  
Generated: **2026-09-08T18:57:59Z**

## Cause
40.6.33 still had two geometry owners: a large modal shell and a nested 16:9 artwork stage. On Firefox, short-height/compact rules could therefore size the shell and the live cards against different boxes, producing the large empty right-hand surface and clipped content seen in the operator capture.

## Correction
- The Aether panel itself is now the single 16:9 coordinate stage.
- The selected artwork is the only background owner.
- The live DOM grid fills exactly the same box.
- Existing radial percentages are resolved against that one stage only.
- The historical <=1180 / short-height stacked fallback is overridden on desktop.
- History and Details remain bounded secondary overlays inside the same stage.
- No image generation and no SVG replacement.

## Protected
- `js/aether.js` byte-for-byte unchanged.
- Exact selected artwork byte-for-byte unchanged.
- Market Core 38.15.11 unchanged.
- Graphique, Lecture Technique, Oracle runtime, Chronos, Version Truth, Window Manager, Paper/Safety and Parker untouched.
- No timer, observer, storage, fetch or network owner added.

## Operator test
Firefox: Ctrl+F5 → Aether Attention → verify the whole Observatory is one centered 16:9 surface → Historique → Détails → Vue → close.
