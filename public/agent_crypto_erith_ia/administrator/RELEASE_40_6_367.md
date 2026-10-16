# Agent-Crypto 40.6.367 — REDIVIDER STATE LIGHTING

Date: 2026-09-23
Parent: **40.6.366**
Scope: **REDIVIDER state-lighting semantics only**

## State logic
- **READY**: ring remains 100% full, but dark/dim;
- **HOVER / ARMED**: same full ring lights bright crimson;
- **CONFIRM OPEN**: bright crimson;
- **CANCEL**: immediate return to dim READY, even if pointer remains over the control;
- **STOPPED**: muted/desaturated;
- **UNAVAILABLE**: nearly off.

## Principle
- ring fill = readiness;
- brightness = interaction/state.

## Frozen
- Math Core 40.6.364;
- REDIVIDER confirmation modal 40.6.363;
- owner Auto A Paper / PAPER ONLY;
- Market Core 38.15.11;
- all business logic, wallet and real-order behavior.

## Static gates
- operator JS syntax: PASS
- ready fill: 100%
- state lamp dataset: PRESENT
- cancel neutral reset: PRESERVED
- geometry change: FALSE
- Firefox terrain: PENDING
