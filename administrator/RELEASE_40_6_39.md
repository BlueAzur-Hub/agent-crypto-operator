# Agent-Crypto 40.6.39 — AETHER WORKBENCH FOCUS · READABILITY · Z-ORDER LOCK

Parent: **40.6.38**  
Market Core: **38.15.11 — protected**  
Generated: **2026-09-08T22:03:48Z**

## Firefox diagnosis from 40.6.38
The Workbench interaction is valid, but the Observatory's historical stage uses a near-maximum z-index. This lets the 16:9 Aether artwork render above the floating reader when the two overlap. History and Details are functionally correct but need stronger visual priority, more room and more legible reading lanes.

## 40.6.39 correction
- Replaces the lazy Workbench payload owner with `js/aether-workbench-406039.js`.
- Raises the Workbench above the existing Aether stage without touching the Aether stage z-index or global Window Manager.
- Adds a passive focus scrim below the Workbench and above the Observatory so the artwork remains visible but visually quiet while reading.
- Increases default Workbench width/height while keeping viewport clamps.
- Adds local `Agrandir / Restaurer` mode; no browser storage and no global window ownership.
- History gains explicit Heure / Type / Niveau / Lecture column headers, larger rows and more readable typography.
- Details uses wider long-form cards, larger line-height and preserved cyan + gold hierarchy.
- Events / History / Details continue to share the same lazy-loaded Workbench.
- The exact 16:9 Aether stage geometry stays frozen for this build. Full-width/F11 geometry is deferred until the final wider textless master background so the live percentage anchors are not distorted.

## Protected
- 40.6.37 graph-first scheduling preserved.
- Exact Observatory artwork byte-for-byte preserved (`5c4d61e9410d4a701372e2d30640d6523938dfe603f65902d493b354c5f2e7b2`).
- `admin-ribbons.css` byte-for-byte preserved at the validated 40.6.36 visual checkpoint.
- Market Core 38.15.11, Graphique runtime, Oracle runtime, Lecture Technique, Chronos, Version Truth and global Window Manager untouched.
- No fetch, recurring timer, observer or storage owner in the Workbench.
- No automatic or real order.

## Runtime hashes
- Parent Aether: `493a9e605930fdfecdfe50299633a4c7b9898060617632aca5235e593fc7a193`
- 40.6.39 Aether: `7b1056e62df7ef8a7495df1a7163cbc2881c820cb4b903dd2fa2eb395cea755a`
- 40.6.39 Workbench: `1dfddb43894924cd356f5386ea59662e07c1dcb5b032305b5637cfa54a952ac1`

## Firefox acceptance
1. Ctrl+F5 and confirm Build 40.6.39; graph-first behavior must remain.
2. Open Aether View: the 16:9 artwork geometry must be unchanged.
3. Click Details: the Workbench must appear above Aether, never behind it; the scene is dimmed but still visible.
4. Drag the Workbench; `Centrer` must recover it.
5. Click `Agrandir`, then `Restaurer`; both modes remain viewport-safe.
6. History must expose readable Heure / Type / Niveau / Lecture lanes without the Observatory crossing in front.
7. Events must use the same Workbench and no new network/storage/timer owner may appear.
