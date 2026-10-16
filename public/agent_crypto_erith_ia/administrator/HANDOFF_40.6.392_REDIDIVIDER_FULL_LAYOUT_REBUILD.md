# HANDOFF — 40.6.392 REDIVIDER Full Layout Rebuild

Build: **40.6.392**
Parent: **40.6.391**
Market Core: **38.15.11**

## New ownership

- DOM: `administrator/js/operator-dashboard-406384.js` — REDIVIDER confirmation fragment
- CSS: `administrator/redivider-visual-406392.css`
- art: existing `administrator/assets/images/redivider-hud-frame-406390.png`

## Desktop contract

1. HUD is the upper visual block.
2. All live copy is inside one centered HUD copy container.
3. Command deck sits directly below in normal flow.
4. No independent top/left offsets for title/state siblings.
5. No horizontal scrollbar.
6. No vertical scrollbar.
7. Both buttons remain visible.
8. STOP/RESUME behavior is unchanged.

## Mobile contract

Below 900px the PNG is never requested. A native CSS circle owns the visual confirmation.

## Terrain gate

Firefox: Ctrl+F5 -> Build 40.6.392 -> REDIVIDER -> cancel -> reopen -> STOP -> explicit resume.
Blackview/Chrome: confirm native CSS-only mobile dialog.
