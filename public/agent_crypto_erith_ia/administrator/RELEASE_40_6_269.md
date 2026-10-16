# Agent-Crypto 40.6.269 — EMERGENCY STABILITY RESTORE

Parent release: **40.6.268**
Runtime recovery source: **40.6.254**
Recovery source commit: `f103ddda1873f26d5b6ba6641e706259cca11623`
Parent main commit at surgery: `ba0a6c47205904961d36a5d0039581b9ab518fb6`

## Why

The current cockpit is not operationally usable: Firefox terrain showed delayed clicks,
repeated slowdown warnings and long main-thread stalls during ordinary navigation.

40.6.254 is the last operator-proven checkpoint where Auto Reader advanced and the complete
Atlas 4/4 → NØX → Aerith → CURRENT chain finished, then returned to rest.

This release does not add another repair layer. It restores the post-40.6.254 runtime owners
to their exact 40.6.254 blobs.

## Exact runtime restore

- `administrator/app.js`
- `js/decision-intelligence-current-truth.js`
- `js/event-memory.js`
- `js/event-semantic-enrichment.js`
- `js/historical-analog-engine-405015.js`
- `js/strategy-a-paper-v2-proof-bridge.js`
- `runtime-shell.html`
- `style.css`

The 40.6.268 durable-evidence source file remains in Git history/repository but the restored
40.6.254 runtime shell does **not** load it.

## Preserved

- current market/news/data files;
- full Git history and post-40.6.254 release documentation;
- Market Core 38.15.11;
- Strategy A thresholds / Cost Gate / Risk Governor;
- real-order lock.

## Rule after recovery

No post-40.6.254 feature is reintroduced until Firefox terrain passes.
After PASS: one runtime owner per version, with a stop on the first regression.
