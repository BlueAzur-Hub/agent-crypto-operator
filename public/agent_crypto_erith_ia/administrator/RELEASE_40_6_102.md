# Agent-Crypto 40.6.102 — Visible Version Truth Late-Writer Lock

Parent: 40.6.101  
Engine: Market Core 38.15.11 (unchanged)

## Reproduced defect

Firefox/runtime exports can show the current immutable build in the header while the lower release/footer surface is later rewritten to an old embedded build (`40.6.86`). The defect is presentation truth only: the loaded immutable entry and published `build.json` remain authoritative, but a late legacy writer in `app.js` can overwrite visible labels after Version Truth already synchronized them.

Root cause: `app.js` captures `ADMIN_BUILD` from parser-time embedded metadata and later calls `installGlobalVersionIdentity()` during boot. A synchronous Version Truth event listener can therefore run before another listener in the same event turn rewrites the footer with stale metadata.

## Correction

40.6.102 keeps Version Truth Entry Authority V3 as the single visible version owner and hardens only its synchronization timing:

- existing immutable pathname / `ac-build` authority is unchanged;
- event-driven visible-truth resync is deferred with `queueMicrotask()`;
- the resync runs after other listeners in the same DOM/event turn;
- one-shot DOMContentLoaded/load/pageshow resyncs cover late boot writers;
- no polling, interval, MutationObserver, IntersectionObserver or storage write is added;
- the large legacy `app.js` is not rewritten.

Runtime owner: `js/version-truth-entry-authority-v3.js`

## Protected

- Market Core 38.15.11 unchanged.
- Web Classic unchanged.
- Graph/history unchanged.
- Aether unchanged.
- Atlas CURRENT unchanged.
- Oracle/Evidence/Math unchanged.
- Lecture Technique unchanged.
- Strategy A unchanged.
- Source Truth / DEX / CEX logic unchanged.
- No new recurring timer, observer, storage owner, wallet, order or trading endpoint.

## Acceptance

1. Immutable `index-40.6.102.html` loads as Build 40.6.102.
2. Header, Administrator mirror and footer converge on the loaded immutable build after boot/hydration/finalization.
3. A late legacy writer in the same event turn cannot remain visible after the deferred resync.
4. Version Truth Guard and Version Delivery Guard pass.
5. GitHub Pages publishes the same head.
6. Firefox terrain proof confirms no stale `40.6.86` footer remains after full load.
