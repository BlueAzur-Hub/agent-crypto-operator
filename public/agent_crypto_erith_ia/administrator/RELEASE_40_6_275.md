# Agent-Crypto 40.6.275 — Passive Boot Instrumentation

## Mission
Measure the real Administrator boot path before any further optimization. Base release: **40.6.273**. Protected engine: **Market Core 38.15.11**.

## What changes
- Adds a volatile `globalThis.AgentCryptoBootProbe` backed only by `performance.now()` / `performance.mark()`.
- Records shell, Chart.js, Core, Cold Boot owners, Auto Reader, startup Livecheck, Market, selected asset, Graph, detail, Oracle, CURRENT lifecycle and Administrator Window Manager milestones.
- Separates `current-closed` from `current-restored` so a restored persisted CURRENT is never mistaken for a newly computed CURRENT.
- Adds targeted cache identity only to the two JavaScript files changed by this release.

## What does not change
No Market Core, Oracle calculation, Math Core, Atlas CURRENT rule, Shared Memory schema, Lecture Technique visual, Strategy A threshold, Web Classic, Aether policy, order path or scheduler behavior changes. No timer, observer, storage owner, network request or UI panel is added.

## Notion boundary
This release creates or modifies **no Notion page, database, invitation, or MCP workspace artifact**.

## Terrain
Run Ryzen first. Capture `AgentCryptoBootProbe.snapshot()` after first release load, then after a normal warm-cache reload. Test Transformer Book only after Ryzen remains stable.
