# VALIDATION — Agent-Crypto 40.6.266

Status: COMMITTED RELEASE · FIREFOX TERRAIN PENDING

Static invariants:
- Section 01 placement unchanged.
- Window Manager unchanged.
- runtime-shell unchanged.
- `sameEvent()` semantic rule unchanged.
- first matching group order preserved by ascending original group index.
- no new timer / observer / fetch / storage owner.
- Market Core 38.15.11 unchanged.
- Strategy A business rules unchanged.
- no real-order path.

Required live test:
1. Ctrl+F5.
2. Open Decision Intelligence.
3. No visible multi-second wait / Firefox slowdown.
4. Same-event close/reopen immediate.
5. Déplier/Replier correct.
6. Oracle/Binance/Atlas continue updating.
