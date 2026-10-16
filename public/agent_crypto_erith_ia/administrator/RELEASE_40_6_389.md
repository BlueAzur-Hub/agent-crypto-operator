# Agent-Crypto 40.6.389 — Technical Reading Canonical Owner + Visual Cache Recovery

Date: 2026-09-23
Parent: **40.6.388**

## Decision

**40.6.388 is rejected for Lecture Technique.**

The Fil Crypto establishes the validated contract:
- full-panel single portrait surface;
- `object-fit: cover`;
- existing per-asset `--admin-tech-x / --admin-tech-y` focal framing;
- 136px in-flow Classic host;
- no second same-asset backdrop owner.

The clean consolidation was 40.4.255 and the same canonical CSS blob remained active through 40.6.387.

## 40.6.389 repair

1. **Exact CSS rollback**
   - `administrator/admin-visual-assets.css` is restored byte-for-byte from 40.6.387.
   - Git blob: `fb394e9aafb98c50d3d486c9756b214e40a7cfc7`.
   - This removes the 40.6.388 `contain` experiment completely.

2. **Visual-cache generation recovery**
   - Existing cache owner only: `js/admin-visual-cache.js`.
   - DB schema unchanged: `agent_crypto_visual_cache_v1`.
   - Generation:
     - before: `administrator-visuals-2026-09-05-404254-v2`
     - after: `administrator-visuals-2026-09-23-406389-v3`
   - Existing `fetch(..., { cache: "reload" })` behavior is preserved.
   - No destructive IndexedDB clear is added.
   - Old-generation blobs are simply ignored and replaced on demand.

3. **Firefox cache-bust**
   - `admin-visual-assets.css?v=40.6.389`
   - `js/admin-visual-cache.js?v=40.6.389`

## Untouched

- RND 01–21 library and labels;
- all image assets;
- AUTO / AUBE / JOUR / SOIR / NUIT / LUNE logic;
- local private-image picker;
- focal x/y metadata;
- detail-panel geometry;
- Math Core;
- REDIVIDER;
- Aether / Aether Watch;
- Market Core 38.15.11;
- Strategy / Gates / Shared Memory;
- timers / observers / business fetch owners;
- wallets / orders.

## Firefox proof

`Ctrl+F5 → Build 40.6.389 → Lecture Technique → AUTO → 6–10 RND clicks`.

Expected:
- no 40.6.388 contain/letterbox rendering;
- historical full-panel cover composition restored;
- stale old visual blobs cannot win;
- functional overlay remains in its validated positions.

Terrain status at publication: **PENDING**.
