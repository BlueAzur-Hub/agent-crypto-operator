# Agent-Crypto Administrator — 40.6.73 R4

## Active Market Fiche Above Aether Lock

Parent checkpoint: 40.6.73 R3.

### Purpose
Keep the active floating Crypto Market fiche above Aether Attention Watch when both surfaces overlap.

### Root cause
The canonical Administrator Window Manager starts floating windows in the high z-index range (`2147481800+`), while the shared Crypto fiche layer historically used `z-index: 10050`. Aether therefore painted above the active fiche even though the fiche was the operator's current foreground detail.

### Correction
A single scoped presentation rule raises only the active floating Crypto fiche:

`.atlas-help-layer[data-market-help-coin-id]:not([hidden])`

The active fiche is assigned `z-index: 2147483647`.

### Protected
- Aether geometry unchanged.
- Aether visibility behavior unchanged.
- Administrator Window Manager unchanged.
- Market Core 38.15.11 unchanged.
- Graph, Oracle, Atlas and Lecture Technique unchanged.
- No timer, observer, storage owner or network owner added.

### Validation target
Open Aether, then open a Crypto fiche from Target Top 5 / Market. The fiche must paint above Aether while remaining interactive. Closing the fiche returns the workspace to the normal Aether stack.
