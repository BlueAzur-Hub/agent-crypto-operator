# Agent-Crypto 40.6.373 — HOVER STATUS BIND FIX

Date: 2026-09-23
Parent: **40.6.372**

## Proven defect in 40.6.372
The hover listeners were accidentally installed inside `openSwitchConfirm()`.
Result: before clicking REDIVIDER, no hover listener existed, so Christophe saw no status line.

## Correction
- listeners bind once in `mount()`;
- REDIVIDER NORMAL + MINI + recall are covered;
- Math Core NORMAL + MINI + recall are covered;
- NORMAL readout is moved above the visible instrument;
- no click is required to activate hover.

## Preserved
- 40.6.371 reversible REDIVIDER;
- 40.6.370 centered crimson/bold modal safety copy;
- 40.6.369 continuous 360° ring;
- Math 40.6.364;
- Market Core 38.15.11;
- PAPER ONLY / no real orders / no wallet.

## Static gates
- JavaScript parse: PASS;
- hover binding in mount: PASS;
- hover binding removed from confirmation path: PASS;
- NORMAL/MINI/recall coverage: PASS;
- Firefox terrain: PENDING.
