# HANDOFF — 40.6.393 REDIVIDER Single CSS Owner Repair

Build: **40.6.393**
Parent: **40.6.392**
Market Core: **38.15.11**

## Architectural rule

REDIVIDER confirmation presentation has exactly one owner:

`administrator/redivider-visual-406393.css`

`operator-dashboard-406384.js` owns:
- DOM;
- state;
- events;
- STOP/RESUME calls.

It no longer injects any `.redivider-confirm-*` or `.confirm-*` presentation CSS.

## Firefox gate

1. Ctrl+F5.
2. Confirm Build 40.6.393.
3. Open REDIVIDER.
4. Verify no vertical or horizontal scrollbar.
5. Verify HUD is not reset to 530px.
6. Verify full buttons visible.
7. Cancel -> reopen -> STOP -> explicit resume.
8. Verify no layout jump.

## Mobile gate

Chrome/Blackview below 900px:
- no REDIVIDER PNG request;
- CSS-only compact modal;
- same STOP/RESUME behavior.
