# Agent-Crypto 40.6.393 — REDIVIDER Single CSS Owner Repair

Parent: **40.6.392**
Market Core: **38.15.11**

## Root cause fixed

Firefox proved that 40.6.392 still had two presentation owners:
1. the external REDIVIDER stylesheet loaded by the page;
2. legacy REDIVIDER confirmation CSS injected later by `operator-dashboard-406384.js::ensureStyle()`.

Because the injected style arrived later, it restored legacy rules such as:
- `overflow:auto` on the modal;
- the 620px legacy modal width;
- the 530px legacy HUD width;
- old confirmation title/state/action styling.

## 40.6.393 repair

- remove all REDIVIDER confirmation presentation selectors from the JavaScript-injected stylesheet;
- keep JavaScript responsible only for DOM, state, events and STOP/RESUME behavior;
- make `redivider-visual-406393.css` the only presentation owner;
- move base open/closed display, focus-visible and disabled button styling into that external CSS;
- keep the 40.6.392 rebuilt confirmation DOM unchanged;
- keep the approved PNG unchanged;
- compact/mobile remains CSS-only with no PNG request.

## Proof before commit

The injected style block was scanned for confirmation selectors after surgery.
Expected forbidden selector count: **0**.
JavaScript syntax check: **PASS**.

Firefox terrain proof remains required.

## Protected

No STOP/RESUME logic, Paper Only semantics, Math Core, Strategy, Aether, Lecture Technique, Market Core 38.15.11, timers, observers, storage, wallets or real orders changed.
