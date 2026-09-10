# Agent-Crypto 40.6.38 — AETHER FLOATING WORKBENCH · LAZY INTERACTION

Parent: **40.6.37**  
Market Core: **38.15.11 — protected**  
Generated: **2026-09-08T21:23:33Z**

## Firefox diagnosis from 40.6.37
The graph-first lazy contract is validated and the Observatory View is close to final. History and Details now deserve a larger, movable reading surface; the embedded central overlay hides the strongest part of the artwork and compresses long evidence text. The painted Events card also needs a direct path to the same rich reader.

## 40.6.38 contract
- Adds `js/aether-workbench-406038.js` as an Aether-local floating reader.
- The Workbench script is not present in `index.html`; it is requested only on first History, Details or Events interaction.
- Workbench modes: Events / History / Details.
- The window is draggable by its title bar, viewport-clamped, recenterable and closable with `×` or Escape.
- Position is retained only in runtime memory for the current page; no localStorage/sessionStorage owner is added.
- History uses larger rows with independent time/type/level/detail lanes and internal scrolling.
- Details uses a roomy 2×2 explanatory grid on desktop, one column on narrow screens.
- Clicking the painted `Événements récents` card in View opens the Workbench directly in Events mode.
- The paid Observatory artwork remains visible behind the floating Workbench; the embedded History/Details surfaces remain fallback-only if lazy loading fails.

## Protected
- 40.6.37 graph-first scheduling preserved.
- Exact Observatory artwork byte-for-byte preserved (`5c4d61e9410d4a701372e2d30640d6523938dfe603f65902d493b354c5f2e7b2`).
- `admin-ribbons.css` unchanged from the 40.6.36/37 visual checkpoint.
- Market Core 38.15.11, Graphique runtime, Oracle runtime, Lecture Technique, Chronos, Version Truth and global Window Manager untouched.
- No fetch, recurring timer, MutationObserver or storage owner in the Workbench.
- No automatic or real order.

## Runtime hashes
- Parent Aether: `1ffb9e3c8ff4b1291b96c3f9fc1ac22de63b0cea35d23ec000d34deaa96a4427`
- 40.6.38 Aether: `493a9e605930fdfecdfe50299633a4c7b9898060617632aca5235e593fc7a193`
- Workbench: `f8502dc018b92f12ba58ff8ae6ec2f3502c7943463f5fa8b4ddf2a687ca0b8a8`

## Firefox acceptance
1. Ctrl+F5: graph-first behavior from 40.6.37 must remain.
2. Open Aether: View remains the default and artwork geometry stays unchanged.
3. Click the painted Events card: Workbench appears in Events mode.
4. Drag Workbench to each edge: it must remain recoverable inside the viewport; `Centrer` restores center.
5. Close, then click History: larger readable timeline opens in Workbench.
6. Switch Workbench to Details: four explanatory cards remain readable without hiding content by overflow.
7. Close and reopen Aether: no persistent position is written to browser storage.
