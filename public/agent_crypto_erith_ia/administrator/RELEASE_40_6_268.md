# Agent-Crypto 40.6.268 — STRATEGY A · DURABLE EVIDENCE CONTINUITY

Parent: **40.6.267**
Base commit: `c8f7f2e260456ef63abd46ee0b552d4c10123fbc`

## Terrain evidence motivating this build

The 40.6.267 dumps show the live Experiment Ledger increasing during the same session
(13 then 15 traced cycles), while the Evidence Dossier still reports zero durable cycles.
The Auto Reader also explicitly states that browser-local collection runs only while the tab
is visible.

40.6.268 fixes evidence continuity, not Strategy A policy.

## New owner

`js/strategy-a-durable-evidence-store.js`

IndexedDB database:
`agent_crypto_strategy_a_durable_evidence_v1`

Stores:
- cycles
- after_cost
- paper_states
- runtime_gaps
- meta

The owner snapshots existing Strategy A owners on already existing runtime/evidence events.
It adds no recurring market timer and no network request.

Experiment Ledger and After-Cost reads are overlaid with durable rows so a page reload no
longer makes already captured evidence disappear from the analytical view.

Legacy G3 prospective rows may be imported if they already exist locally. Missing historical
cycles are never invented.

Browser hidden/pagehide periods are recorded as gaps. A persisted PAPER state still marked
OPEN_SYNCED after reload is surfaced as REVIEW REQUIRED; it is not silently closed.

## Protected

Unchanged:
- Strategy A thresholds
- Cost Gate 0.80%
- Risk Governor
- Market Core 38.15.11
- Decision Intelligence
- Oracle
- Atlas CURRENT
- Lecture Technique
- Bridge authentication policy
- real-order paths

PAPER ONLY.
