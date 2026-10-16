# HANDOFF — 40.6.390 · REDIVIDER Canonical HUD Integration

Current runtime: **40.6.390**
Parent: **40.6.389**
Market Core: **38.15.11**

## Why this build exists

The previous 40.6.389 REDIVIDER confirmation was functionally sound but visually native/CSS-only.

The target is a richer operator HUD without duplicating or replacing live state truth.

## Ownership

- artwork chassis: `administrator/assets/images/redivider-hud-frame-406390.png`
- integration CSS: `administrator/redivider-visual-406390.css`
- live confirmation DOM/state: `administrator/js/operator-dashboard-406384.js`

Do not create a second renderer.

## Desktop contract

- artwork remains fully visible;
- no duplicate CSS rails;
- no opaque CSS circle over the artwork;
- semantic REDIVIDER text is centered in the intentional empty core;
- lower state does not repeat the percentage;
- safety copy remains readable but visually secondary;
- buttons remain native HTML controls.

## Mobile contract

No REDIVIDER PNG integration below 760px.
The 40.6.389 native mobile confirmation remains the authority.

## Protected

Do not touch Math Core, Lecture Technique, Aether, Market Core 38.15.11, Strategy, Gates, storage/network ownership or order logic for this visual task.

## Final proof

1. Firefox desktop -> Ctrl+F5 -> Build 40.6.390.
2. Open REDIVIDER active state.
3. Cancel, reopen, confirm STOP, verify stopped state, then explicit resume.
4. Confirm no duplicate text/rails and no layout jump.
5. Blackview/Chrome -> verify native mobile dialog and absence of desktop PNG.
6. Confirm Math Core / Lecture Technique / Aether unchanged.
