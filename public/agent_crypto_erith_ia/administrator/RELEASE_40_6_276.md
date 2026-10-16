# Agent-Crypto 40.6.276 — Human Boot Report

## Mission
Make the existing 40.6.275 passive boot measurements readable by a human operator directly inside Agent-Crypto.

## Operator path
**Command Center → Système → Boot report**

Controls:
- **Actualiser** — rebuilds the readable report from the current in-memory boot marks.
- **Copier** — copies the readable report when browser clipboard permission allows it.

No Firefox Console, DevTools command or JavaScript knowledge is required.

## Report
The UI translates the existing milestones for Shell, Chart.js, Core, Cold Boot, Auto Reader, startup Livecheck, Market, selected asset, Graph, Lecture Technique detail, Oracle, Administrator Window Manager and CURRENT.

CURRENT is described as:
- new CURRENT closed;
- restored CURRENT;
- pending CURRENT;
- not observed.

The report also identifies the slowest observed Cold Boot owner interval when enough owner marks exist.

## Protected
Market Core 38.15.11; Oracle business logic; Math Core; Atlas CURRENT rules; Shared Memory; Lecture Technique visual; Strategy A; Aether; Web Classic; real-order locks.

## Architecture
40.6.276 reuses the volatile 40.6.275 `AgentCryptoBootProbe`. It adds no recurring timer, observer, storage write, fetch, polling owner or business network request.
