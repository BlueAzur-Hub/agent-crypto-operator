# Agent-Crypto Administrator — Build 40.6.71

## TRADUS DATA / UI DECOUPLING · BOOT TRUTH

Parent: **40.6.70**  
Market Core: **38.15.11** unchanged.

### Why

40.6.70 validated the Firefox Aether performance checkpoint. The remaining TRADUS debt is architectural: the PAPER truth can exist before the optional TRADUS visual panels are mounted, while Aether may still initially receive no observability snapshot and show `TRADUS · N/D`.

The 40.6.68 observability owner already knows how to build a snapshot directly from the 40.6.67 PAPER lifecycle state even when its own panel cannot mount. The missing link is therefore boot coordination, not trading logic.

### 40.6.71 scope

New additive runtime owner: `js/tradus-data-ui-decoupling.js`.

- publish TRADUS observability truth at boot independently of visual panel mounting;
- repeat the same bounded truth publication on `pageshow`;
- keep visual mounting best-effort and secondary;
- retain the canonical 40.6.68 snapshot event and 40.6.69 R1 Aether bridge;
- normalize only the missing-data wording in Aether:
  - `TRADUS · EN ATTENTE` when the PAPER lifecycle owner exists but no first carnet observation exists yet;
  - `TRADUS · INDISPONIBLE` only when the PAPER lifecycle owner is actually absent;
  - once a real observation exists, 40.6.69 R1 remains the visible-label owner (`FLAT`, `LONG PAPER`, `SHORT PAPER`, signal, archive count/equity).

### Preserved

- Aether 40.6.70 performance and approved geometry/artwork;
- Workbench Historique / Détails / Événements;
- Technical Reading;
- 40.6.67 PAPER lifecycle and fee model;
- 40.6.68 local evaluation archive;
- 40.6.69 R1 passive bridge behavior;
- Strategy A;
- Market Core 38.15.11;
- no polling, recurring timer, MutationObserver or global DOM observer;
- no new network or storage owner;
- no credential, wallet or real-order path.

### Acceptance in Firefox

1. Fresh Administrator load: Aether must no longer depend on opening the TRADUS panel to know PAPER truth.
2. Before the first carnet observation, Aether shows `TRADUS · EN ATTENTE`, not a false failure state.
3. After a real TRADUS observation, Aether shows the canonical 40.6.69 R1 state (`FLAT`, `LONG PAPER` or `SHORT PAPER`) without 40.6.71 rewriting measured truth.
4. Opening or moving Aether remains as responsive as validated 40.6.70.
5. Strategy A, Market Core, Technical Reading and real-order safety remain unchanged.
