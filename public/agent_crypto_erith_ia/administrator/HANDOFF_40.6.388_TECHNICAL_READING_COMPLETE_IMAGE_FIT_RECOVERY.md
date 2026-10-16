# HANDOFF — 40.6.388 · Technical Reading Complete Image Fit Recovery

Current GitHub runtime: **40.6.388**
Parent: **40.6.387**
Market Core: **38.15.11**

## Why this version exists

Christophe reported that Lecture Technique images appeared zoomed on only part of the source image.

Historical audit:
- 40.4.237 / 40.4.238: complete portrait behavior used `object-fit: contain`
- 40.4.239: first explicit regression to `object-fit: cover`
- 40.4.240: full-panel cover owner installed
- 40.4.253: crop behavior consolidated into canonical owner
- 40.4.255: legacy owners retired, leaving the 40.4.253 owner authoritative
- 40.6.387: still inherited that canonical `cover`

## 40.6.388 owner repair

Only the surviving canonical portrait owner is changed:

`administrator/admin-visual-assets.css#TECHNICAL_READING_CANONICAL_OWNER_404253`

`object-fit: cover !important;`
→
`object-fit: contain !important;`

The canonical entry also cache-busts the stylesheet with `?v=40.6.388`.

## Freeze

Do not touch:
- Math Core / REDIVIDER
- Aether / Aether Watch
- Market Core 38.15.11
- RND assets or RND JS
- Strategy / Gates / Storage
- Shared Memory

unless a new operator request explicitly targets them.

## Next proof

Firefox:
`Ctrl+F5 → Build 40.6.388 → Lecture Technique AUTO + several RND → complete images, no destructive crop`.

If terrain passes: freeze 40.6.388 as the Technical Reading image-fit checkpoint.
