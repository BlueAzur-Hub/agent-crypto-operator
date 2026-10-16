# Agent-Crypto 40.6.270 — RECOVERY LOCK · FULL 40.6.247 RUNTIME RESTORE

Parent: **40.6.269**
Recovery source: **40.6.247**
Recovery source commit: `cbd58df68a6224fc9a3f798cf3c1a2c1cbf32621`
Parent main commit at surgery: `c17a0c2d6909508db35c273a302f356ec8a7b6b2`

## Reason

40.6.269 still fails as an operator cockpit:
- slow initial load;
- Atlas restarts while the operator is trying to use Administrator;
- disclosure clicks are delayed or ignored for long periods;
- Firefox reports that the page is slowing the browser.

The previous recovery was too narrow. 40.6.270 restores the **complete Administrator runtime/control set**
that diverged after the explicitly terrain-PASS 40.6.247 checkpoint.

## Restored byte-for-byte from 40.6.247

- `app.js`
- `index.html`
- `js/decision-explainability.js`
- `js/decision-intelligence-acceptance.js`
- `js/decision-intelligence-current-truth-406243.js`
- `js/event-memory.js`
- `js/historical-analog-engine-405015.js`
- `js/horizon-calibration.js`
- `js/regime-qualified-analogs.js`
- `runtime-shell.html`

## Preserved

- current market data;
- current news data;
- current Book mirror;
- full Git history;
- Market Core 38.15.11;
- no real-order path.

No new runtime feature is added in this release.
