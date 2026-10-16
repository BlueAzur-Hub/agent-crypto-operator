# Agent-Crypto Administrator 40.6.124 — Owner API Auto-Start

Parent: 40.6.123
Market Core: 38.15.11 (unchanged)

## Purpose
Start Strategy A Auto A through the canonical existing owner API `AgentCryptoAutoPaperRunner404265.start()` instead of searching the UI for the text `ACTIVER AUTO A` and simulating a button click.

## Scope
- UI-independent bootstrap.
- Simulation panel may remain collapsed.
- Reuses the existing 5-minute PAPER runner only.
- No second market timer.
- No real orders, wallet, credentials, or Market Core modification.
- Explicit operator STOP remains authoritative for the current browser session.

## Terrain acceptance
1. F5 on Administrator 40.6.124.
2. Do not open Simulation and do not click anything.
3. Open Simulation later.
4. Expected: `AUTO A ACTIF` and a scheduled next cycle.
5. Failure: `ARRÊTÉ / ACTIVER AUTO A` after owner API is available.
