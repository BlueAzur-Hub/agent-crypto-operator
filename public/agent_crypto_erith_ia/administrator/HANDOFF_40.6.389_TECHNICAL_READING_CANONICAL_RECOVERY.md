# HANDOFF — 40.6.389 · Technical Reading Canonical Owner + Visual Cache Recovery

Current runtime: **40.6.389**
Parent: **40.6.388**
Market Core: **38.15.11**

## What was wrong

40.6.388 repeated a historically rejected experiment by changing the canonical Technical Reading portrait from `cover` to `contain`.

The Fil Crypto confirms that 40.4.238 contain + backdrop was rejected, while the final clean line became:
- 40.4.253: single portrait owner;
- 40.4.254: visual cache generation refresh;
- 40.4.255: legacy CSS owner retirement / clean consolidation.

## What 40.6.389 does

- restores the exact 40.6.387 / 40.4.255 canonical CSS blob;
- keeps the 136px Classic host;
- restores the single full-panel `cover` portrait;
- keeps per-image focal x/y;
- bumps only the existing visual cache generation to force fresh asset blobs;
- cache-busts CSS + visual cache JS.

## Freeze

Do not touch:
- Lecture Technique geometry;
- RND library/assets;
- Math Core / REDIVIDER;
- Aether;
- Market Core;
- Strategy / Gates / Shared Memory.

until Firefox proof.

## Next proof

`Ctrl+F5 → 40.6.389 → AUTO → RND repeatedly`.

If 40.6.389 restores the historical composition but one specific RND remains badly framed, investigate that **asset's focal x/y only**. Do not create another renderer or change `object-fit`.
