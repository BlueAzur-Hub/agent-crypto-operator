# Validation 40.6.274

## Static validation — PASS
Checked on repository `main` after publication:
- `js/strategy-a-evidence-demand-loader.js` parses as JavaScript.
- `js/views/private-source-demand-loader.js` parses as JavaScript.
- canonical `index.html` inline scripts parse as JavaScript.
- `build.json` parses as JSON and publishes **40.6.274**.
- Strategy A evidence mode is `DEMAND_ONLY_PACED`.
- no evidence `requestBackground()` / idle-after-first-paint boot remains.
- Strategy A ↔ TRADUS no longer has eager `load` or `pageshow` wake paths.
- explicit Strategy A intent remains wired.
- historical empty `./app.js` script transport is absent.
- canonical `./js/app.js` remains present.
- targeted cache identity is present on both changed demand loaders.
- Market Core remains **38.15.11**.

## Terrain pending
1. Ryzen: normal boot; verify Classic usable and Oracle + Math Core alive.
2. Transformer Book: normal Classic load; do not spam reload; observe time-to-usable and Firefox slow-page warnings.
3. Book: verify Oracle + Math Core.
4. Book: verify Intermediate and Administrator remain enterable.
5. Before opening Strategy A, confirm canonical evidence pack remains dormant.
6. Open Strategy A once: confirm evidence modules appear progressively and remain PAPER-only.
7. Open Sources/Backend: confirm Source Truth → DEX freshness → downstream readers still settle correctly.
8. If Book freezes or a major regression appears: STOP and rollback to **40.6.273**. Do not stack a new patch before profiling.

## Protected areas
No change to Market Core, Oracle, Math Core, Shared Memory data, Atlas CURRENT, Lecture Technique, Strategy A business rules, IndexedDB schema or real-order locks.
