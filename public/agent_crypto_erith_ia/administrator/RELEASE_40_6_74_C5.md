# Agent-Crypto Administrator — 40.6.74 Candidate 5

## Aether Watch V2 — Firefox Field Reframe

Parent candidate: **40.6.74 C4** on the validated **40.6.73 Administrator** runtime / **Market Core 38.15.11**.

C4 corrected the maximized 16:9 envelope but the Firefox 18:46 field capture still showed a stale floating Aether geometry of roughly 950 px centered too far right while the left workspace offered roughly 1,250 px before Lecture Technique. The result was not an image problem: the Observatory was needlessly undersized and its live cells were compressed.

C5 corrects the framing owner first, then the typography.

## What changed

- The V2 PNG remains unchanged.
- C5 is the only active 40.6.74 candidate stylesheet.
- C2, C2.1, C3, C3.1 and C4 candidate links are retired from the live DOM before C5 attaches.
- Floating Aether now targets the largest complete 16:9 rectangle available to the **left of the visible Lecture Technique rail**.
- When an old floating geometry materially under-uses that available workspace, C5 migrates it through the canonical `ErithAdministratorWindows.applySnapshot()` path and persists it through the existing Window Manager state owner.
- Maximized / F11 Aether still uses the largest complete 16:9 rectangle inside the current viewport.
- The <=1180 px fallback no longer collapses useful text to 6–8 px.
- The enlarged V2 cells use vertical breathing room instead of pinning every fact to the upper edge.
- Sources and Oracle remain 2×2.
- BTC / ETH / BNB / XRP / SOL remain visible as one five-asset unit.
- Atlas retains score, state, report/resident context where space permits.

## Protected

- visible Administrator build remains **40.6.73** until field validation;
- Market Core **38.15.11** unchanged;
- V2 backplate binary unchanged;
- `admin-window-manager.js` unchanged;
- Graphique unchanged;
- Lecture Technique unchanged;
- Aether data/runtime owners unchanged;
- active fiche foreground R5 unchanged;
- no recurring timer;
- no MutationObserver;
- no new storage owner;
- no new network owner;
- no trading action.

## Expected Firefox result

With Lecture Technique visible on the right, opening Aether should no longer restore the small center/right rectangle from the rejected capture. It should expand into the available left workspace, remain 16:9, and stop just before the technical rail. On a 1648×928 viewport close to the field capture, this is approximately a 1240×700 Aether frame beginning near the left edge and vertically fitted near the bottom of the viewport.

## Acceptance

1. Reload Firefox after Pages deployment.
2. Open Aether normally with Lecture Technique visible.
3. Confirm Aether uses the large left workspace instead of the old ~950 px center/right frame.
4. Confirm the nine painted cells remain aligned to the V2 artwork and text is visibly larger.
5. Click **Agrandir** and verify the largest complete 16:9 viewport frame.
6. Restore and verify the floating frame returns to the left-workspace geometry.
7. Check F11 and repeat maximize/restore.

If this field pass is accepted, the next operation is consolidation into canonical **40.6.74**: fold the validated V2 rules into the canonical Aether presentation path and delete dormant candidate CSS files instead of retaining a patch stack.
