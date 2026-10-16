# SEVEN HANDOFF — 40.6.531

40.6.530 terrain result:
- CT native Market row: PASS
- CT main line: PASS
- CT candles: PASS
- CT depth: PASS
- UX: PARTIAL/FAIL because category was CT-only and 40.6.529 plumbing remained visible.

40.6.531 destination:
**Nouveaux listings = generic native Market category.**

Required terrain proof:
1. multiple recent rows after clicking Nouveaux listings;
2. CT still works;
3. at least one second recent listing follows the same Line/Bougies/Depth path;
4. no NEW ribbon;
5. no Retour Market;
6. canonical Market click clears context.

Do not reopen graph/depth architecture if the failure is only discovery/canonicalization.

If second listing fails:
- determine whether provider instrument, FX reference, line-period bridge, Bougies or Profondeur owns the failure;
- patch that owner only.

Market Core 38.15.11 and state.coins remain protected.
