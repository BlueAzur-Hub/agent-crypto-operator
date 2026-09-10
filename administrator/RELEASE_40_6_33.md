# Agent-Crypto 40.6.33 — AETHER OBSERVATORY · EXACT ARTWORK STAGE

"
    f"Parent: **40.6.32**  
Market Core: **38.15.11 — protected**  
Generated: **2026-09-08T06:11:00Z**

"
    "## Cause
"
    "40.6.32 uses the selected artwork, but the live cards were positioned against the modal viewport while the 16:9 artwork was cropped independently. "
    "On short Firefox viewports the historical `max-height:720px` fallback also turned the radial DOM back into stacked cards, producing two incompatible layouts.

"
    "## Correction
"
    "- The exact selected 16:9 artwork is now the coordinate stage for the live overlay.
"
    "- The Aether modal becomes a dedicated focus surface while open.
"
    "- Radial cards are positioned relative to that same stage, so artwork and DOM scale together.
"
    "- Desktop short-height no longer activates the historical stacked-card fallback.
"
    "- Glass cards preserve the artwork icon lane while masking baked text/value regions.
"
    "- History and Details remain one bounded central overlay.

"
    "## Protected
"
    "- `js/aether.js` byte-for-byte unchanged.
"
    "- Market Core 38.15.11 unchanged.
"
    "- Graphique, Lecture Technique, Oracle runtime, Chronos, Version Truth, Window Manager, Paper/Safety and Parker untouched by this release.
"
    "- Exact artwork bytes unchanged.
"
    "- No timer, observer, storage, fetch or network owner added.

"
    "## Operator test
"
    "Firefox: Ctrl+F5 → Aether Attention → inspect Vue at normal height and a shorter browser viewport → Historique → Détails → close and confirm the underlying Administrator is untouched.
"
    