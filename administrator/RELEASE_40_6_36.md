# Agent-Crypto 40.6.36 — AETHER OBSERVATORY · TYPOGRAPHY CALIBRATION · PAINTED-LANE LOCK

Parent: **40.6.35**  
Market Core: **38.15.11 — protected**  
Generated: **2026-09-08T20:26:45Z**

## Visual diagnosis from Firefox 40.6.35
The background-first architecture is validated. Remaining defects are typography/coordinate debt, not architecture debt.

Two inherited CSS contracts were still visible:
- Convergence kept an old `translateX(-50%)`, shifting its live value out of the painted card.
- Events preview kept an old `width:100%`, so absolute left/right placement overflowed the painted Events card.

The other cards were broadly aligned but needed local mask, line-height and text-lane calibration against the exact 1440x810 artwork.

## Correction
- Keeps the paid artwork as the only cockpit skin.
- Resets stale `right`, `bottom` and `transform` geometry on painted-card owners.
- Removes the inherited Events preview `width:100%` conflict.
- Calibrates Convergence, Divergence, System, Sources, Atlas, Market, Oracle, Weather and Events text lanes.
- Makes masks nearly opaque only over baked sample values; icons, titles, card shells and ornaments remain artwork-owned.
- Compacts the central Attention value into its painted capsule.
- Compacts the center Watch text below the painted yellow heading and keeps the note to one quiet line.
- Preserves History and Details as separate interactive views.

## Protected
- `js/aether.js` byte-for-byte unchanged.
- Exact Observatory artwork byte-for-byte unchanged.
- Market Core 38.15.11 unchanged.
- Graphique, Lecture Technique, Oracle runtime, Chronos, Version Truth, Window Manager, Paper/Safety and Parker untouched.
- No timer, observer, storage, fetch or network owner added.

## Firefox acceptance
Ctrl+F5 → Aether Attention. Verify first: Convergence returns inside its painted card; Events rows stay inside Events; central Attention/Watch no longer cross into adjacent cards. Then inspect all nine live lanes and test Historique → Détails → Vue → close.
