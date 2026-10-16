# Agent-Crypto 40.6.100 — Decision Board Market Memory Count Truth Lock

Parent: 40.6.99  
Engine: Market Core 38.15.11 (unchanged)

## Scope

Correct one reproduced Decision Board read-side inconsistency: the compact Decision Board can report `0 observation(s) marché` while the canonical Market Memory reader simultaneously reports hundreds of canonical snapshots.

The compact count must use the same canonical Market Memory stats API already used by the Dual Memory reader, with the legacy operator-summary split retained only as fallback.

## Reproduced evidence

On Administrator 40.6.99, the Decision Board detail reports 469 canonical market snapshots while the compact line reports 0 market observations. Retrospective validation remains intentionally separate and may still report 0/2 CURRENT evaluable when no canonical market snapshot exists strictly after CURRENT closure.

## Protected

- Market Core 38.15.11 unchanged.
- Web Classic unchanged.
- Aether unchanged.
- Atlas CURRENT unchanged.
- Oracle unchanged.
- Lecture Technique unchanged.
- Strategy A / Paper unchanged.
- Market Memory storage and collectors unchanged.
- Analytical Memory unchanged.
- Retrospective validation algorithm unchanged.
- No new fetch, timer, observer, storage owner, wallet, order or trading path.

## Acceptance

1. Administrator loads as Build 40.6.100.
2. Decision Board compact market count equals canonical Market Memory count shown by Dual Memory.
3. Retrospective `CURRENT évaluables` remains governed only by post-CURRENT market chronology.
4. No Atlas launch or memory write is caused by opening/refreshing Decision Board.
5. Version Truth / Version Delivery guards pass; Firefox terrain proof closes the build.
