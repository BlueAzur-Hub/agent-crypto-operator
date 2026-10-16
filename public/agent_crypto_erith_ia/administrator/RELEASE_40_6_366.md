# Agent-Crypto 40.6.366 — REDIVIDER READY RESET

Date: 2026-09-23
Parent: **40.6.365**
Scope: **REDIVIDER readiness + cancel visual reset only**

## Fixes
- REDIVIDER readiness ring is now **100% full** whenever the stop owner is available;
- the previous arbitrary 86% ring is removed;
- after ANNULER, backdrop cancel or Escape, REDIVIDER returns immediately to neutral;
- hover stays suppressed while the pointer remains over the control after cancel;
- pointer leave unlocks normal hover again.

## Frozen
- Math Core 40.6.364;
- REDIVIDER confirmation modal 40.6.363;
- Auto A Paper owner / PAPER ONLY;
- Market Core 38.15.11;
- all business logic, wallet and real-order behavior.

## Static gates
- operator JS syntax: PASS
- ready ring: 100% WHEN OWNER AVAILABLE
- cancel reset: PRESENT
- hover unlock: POINTER LEAVE
- geometry change: FALSE
- Firefox terrain: PENDING
