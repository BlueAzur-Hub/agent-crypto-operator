# HANDOFF 40.6.397 — OPERATOR INPUT PRIORITY

Parent: **40.6.396**

## Scope

One performance variable only: simple pointer movement now counts as operator activity for the existing post-boot backpressure.

## Clean-upload ZIP tree

```text
administrator/
├── build.json
├── index.html
├── js/
│   └── post-boot-runtime-loader-406281.js
├── RELEASE_40_6_397.md
└── HANDOFF_40.6.397_OPERATOR_INPUT_PRIORITY.md
```

## Functional diff

`post-boot-runtime-loader-406281.js`

- existing: pointerdown / keydown / wheel / touchstart;
- 40.6.397: adds sampled passive `pointermove`;
- sample interval: **120 ms**;
- quiet window remains **1400 ms**;
- secondary module loading remains idle-paced and waits for operator quiet.

## Explicit non-changes

- no direct script residency change;
- no Aether lifecycle change;
- no REDIVIDER change;
- no Math Core change;
- no Market Core 38.15.11 change;
- no Window Manager change;
- no recurring timer;
- no MutationObserver;
- no storage schema change.

## Decision rule

If Firefox becomes clearly more responsive while the pointer is moving/hovering/clicking, keep this fix and continue the residency audit separately.

If there is no meaningful difference, do not stack another scheduler patch: move the investigation to persistent compositor/style/resident-module cost.
