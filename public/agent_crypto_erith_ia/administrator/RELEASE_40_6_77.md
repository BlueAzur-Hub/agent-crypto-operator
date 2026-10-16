# Agent-Crypto Administrator — 40.6.77

## Aether Watch V2 — Pre-Reveal Position Lock

Canonical parent: **40.6.76**. Engine: **Market Core 38.15.11** unchanged.

### Field defect corrected

40.6.76 retired forced centering for new/manual positions, but its legacy-center migration rejected Aether while hidden. The Window Manager could therefore reveal one frame at the old centered geometry before the later migration.

40.6.77 performs the same migration before reveal. Hidden is preserved instead of treated as an abort condition.

### Canonical behavior

- historical auto-centered geometry migrates to `x = 12` while Aether may still be hidden;
- the hidden flag is preserved during migration;
- operator-owned x/y/size is preserved when it is not the legacy center;
- first-open fallback in `js/app.js` remains native-left;
- maximize / restore remains owned by the canonical Window Manager;
- no resize reframe, pageshow reframe, timer or MutationObserver.

### Visual lock

The field-validated visual owner is unchanged: `aether-v2-406075.css`.
SHA-256: `0fc33fab4d20eb38511326d970f8304c785925b0bf260b1ead4dc95f71eb2d28`.

`js/app.js` is unchanged in this release.
SHA-256: `77eccaaaf4e2b96121254d53e1380c74ee33ac27104cb24eb66ce1b0d4ac7e3f`.

### Protected

- Market Core **38.15.11** unchanged;
- V2 PNG unchanged;
- Aether cells and typography unchanged;
- Administrator Window Manager core unchanged;
- Graphique and Lecture Technique unchanged;
- Atlas / Oracle / Sources data owners unchanged;
- Operator / Yohan unchanged.

### Acceptance

Reload Administrator, then open Aether. It must appear directly at its stored/native position without one centered paint first. Manually moved positions remain authoritative across close/reopen and reload.
