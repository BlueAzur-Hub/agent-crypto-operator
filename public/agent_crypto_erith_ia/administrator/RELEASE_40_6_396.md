# Agent-Crypto 40.6.396 — REDIVIDER White / Red HUD Bloom

Parent: **40.6.395**
Market Core: **38.15.11**

## Scope
Visual-only REDIVIDER refinement. Single visual owner: `administrator/redivider-visual.css`.

## Firefox refinement on the same build
The first Firefox proof confirmed the white/red direction. The same 40.6.396 was then refined without a version bump:

- `REDIVIDER`: smaller white spread, cleaner letter edges, red halo preserved;
- `[ 100% ]`: smaller white spill, tighter red falloff;
- no geometry, placement or component structure change.

## Frozen
No change to PNG, DOM, STOP/RESUME, Paper logic, Math Core formulas or the 40.6.395 restore fix, Market Core **38.15.11**, Oracle, Aether, Lecture Technique, Strategy A, storage, timers, observers, network owners, wallet or real orders.

## Final Firefox terrain validation
Ctrl+F5 -> **Build 40.6.396** -> REDIVIDER.

PASS only if:
- text remains white incandescent with red bloom;
- `REDIVIDER` and `[100%]` are sharper than the first 40.6.396 proof;
- no layout shift or scrollbar appears;
- Math Core remains healthy.

Terrain after refinement: **PENDING**.
