# Agent-Crypto 40.6.395 — Math Core Boot Restore Resync

Parent: **40.6.394**  
Market Core: **38.15.11**

## Root cause

1. `atlasMathScoreBand(score)` converted `null` through `Number(null)` to `0`, so an absent boot score could become red **Données insuffisantes** instead of pending.
2. `atlasRestoreRememberedMarket()` restored a valid canonical market snapshot without rerunning the existing `renderScore()` owner, so the provisional Math state could persist until a later full render or manual reload.

## Repair

- `null`, `undefined` and empty score values remain neutral **En attente**.
- A successful remembered-market restore immediately reruns canonical `renderScore()` for the selected/restored coin.
- The existing Math rail is resynchronized through `atlasV2SyncMathRail()`.

## Frozen

No score-formula or historical-risk-formula change. No change to `js/operator-dashboard-406384.js`, REDIVIDER STOP/RESUME, Market Core **38.15.11**, Oracle, Aether, Lecture Technique, Strategy A, storage owners, timers, observers, network owners, wallet or real orders.

## Firefox terrain validation

Ctrl+F5 -> **Build 40.6.395**. During boot an absent score must remain neutral **En attente**. After remembered-market restoration the score + label must repopulate without a second F5. REDIVIDER and protected surfaces must remain unchanged.
