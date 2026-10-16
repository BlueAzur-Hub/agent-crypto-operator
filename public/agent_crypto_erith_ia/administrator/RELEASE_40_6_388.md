# Agent-Crypto 40.6.388 — Technical Reading Complete Image Fit Recovery

Date: 2026-09-23

## Scope

Repair only the canonical image renderer used by **Lecture Technique**.

## Root cause confirmed

Git history identifies the first framing regression in **40.4.239**: the foreground portrait changed from `object-fit: contain` to `object-fit: cover`.
40.4.240 then installed a full-panel cover owner, and 40.4.253 consolidated it as the canonical Technical Reading owner.

That contract can crop/zoom images whose aspect ratio differs from the right-hand dock.

## 40.6.388 correction

- `administrator/admin-visual-assets.css`
  - canonical Technical Reading portrait: `object-fit: cover` → `object-fit: contain`
  - geometry, 136px internal spacer, focal x/y variables, opacity and controls are unchanged
- `administrator/index.html`
  - build truth advanced to 40.6.388
  - `admin-visual-assets.css?v=40.6.388` added to force Firefox to refresh the corrected CSS owner

## Explicitly untouched

- image assets, including RND 01–21 / Origines d’Aerith
- RND picker and anti-repeat logic
- private image picker / IndexedDB
- AUTO / AUBE / JOUR / SOIR / NUIT / LUNE logic
- Math Core / REDIVIDER
- Aether Watch / Aether Veille logic
- Market Core 38.15.11
- Strategy / Gates / Storage
- timers / observers / fetch owners
- wallet / real orders

## Static proof

- one canonical Technical Reading crop declaration changed: `cover → contain`
- stylesheet cache-busted at canonical entry
- no JavaScript business/runtime file modified

## Firefox terrain proof required

1. Ctrl+F5
2. confirm **Build 40.6.388**
3. open Lecture Technique
4. test AUTO and several RND images, including Origines d’Aerith
5. verify full image visibility without destructive zoom/crop
6. verify Math Core, REDIVIDER and Aether remain unchanged

Terrain status at publication: **PENDING**.
