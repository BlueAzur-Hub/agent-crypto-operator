# Agent-Crypto 40.6.271 — PRE-ROLLBACK FUNCTIONAL RESTORE

Parent: **40.6.270**
Recovery source: **40.6.267**
Recovery source commit: `1a629a89eda07ff69665cef0cff168782c5e7748`

## Purpose

Restore the days of functional runtime work that 40.6.270 removed, without rolling back current market/news data.

## Restored from 40.6.267

- Administrator app runtime
- canonical entry
- runtime shell
- Decision Intelligence canonical owner
- Decision Intelligence Acceptance / Explainability
- Event Memory
- semantic enrichment
- Historical Analog
- Horizon Calibration
- Regime Qualified Analogs
- Strategy A Paper V2 proof bridge
- related presentation style

## Explicitly not re-enabled

40.6.268 durable evidence persistence remains preserved in Git history but is **not loaded** in this recovery pass because it was added after 40.6.267 and was implicated in additional main-thread pressure.

## Preserved

- current market/news/data snapshots from latest main
- Market Core 38.15.11
- no real-order path
- full Git history
