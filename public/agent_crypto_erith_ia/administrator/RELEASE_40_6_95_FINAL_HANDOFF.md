# Agent-Crypto — Final Administrator + Operator Handoff

**Final build:** 40.6.95  
**Protected Market Core:** 38.15.11  
**Release:** FINAL ADMINISTRATOR + OPERATOR HANDOFF  
**Release commit:** the Git commit containing this document; portable delivery bundles also carry the exact commit SHA in `COMMIT.txt`.

## Final cumulative cascade

### 40.6.93 — Generic Version Truth V3 + stable Source Truth loader

- Replaced the remaining build-specific Source Truth repair in Entry Authority V2 with `version-truth-entry-authority-v3.js`.
- Kept the historical `version-truth-406086-authority-lock.js` path as a compatibility bootstrap, now routing to V3.
- Made the Source Truth demand loader build-generic and kept the legacy API alias for compatibility.
- Removed the stale `falsePropagation=true` marker instead of asserting it.
- Preserved immutable-entry / `ac-build` loaded-build authority and `build.json` as published truth.

### 40.6.94 — Operator role contract

- Formalized Operator as a presentation/workspace role over the shared Administrator runtime.
- `?view=intermediate` requests Operator only when no valid local Administrator session already owns the role.
- The query parameter is not authorization: it grants no Administrator session, Bridge/files/GitHub write, wallet, order, trading or private exchange API authority.

### 40.6.95 — Final handoff + CI alignment

- Version Truth Guard and Version Delivery Guard now watch and syntax-check Entry Authority V3 and the stable Source Truth loader rather than the retired V2 current-owner path.
- Final immutable entry: `index-40.6.95.html`.
- No business/market logic, Aether, Oracle, Lecture Technique, Strategy A, Web Classic or Market Core change is part of this release.

## Source Truth final architecture

`Binance LIVE primary → Kraken Public control → Coinbase Exchange control → OKX Public control`

Read-only public market observation. Direct EUR only. Missing direct-EUR coverage remains unavailable (`—`). No synthetic USDT→EUR conversion.

OKX Wave 1 remains bounded to BTC / ETH / BNB / XRP / SOL. The recorded backend proof is OKX `5/5`, with global backend quotes `14/15` because Coinbase BNB-EUR is unavailable. Backend contract is 1.4.2 / R15 family. No authentication, account endpoint, wallet, order or private exchange API is introduced.

## Version Truth final architecture

`historical compatibility bootstrap → Entry Authority V3 → build.json`

Loaded-build authority is the immutable pathname `index-X.Y.Z.html`, with explicit canonical `?ac-build=X.Y.Z` fallback. Published-build authority is `build.json`. Footer and Administrator mirror visible version truth are synchronized by the runtime owner.

## Operator contract

Operator uses the shared runtime with a reduced presentation/workspace role. `?view=intermediate` is a view request, never a privilege escalation. Administrator session authority remains local-session controlled.

## Protected zones

The following remain protected and unchanged by the final cascade: Market Core `38.15.11`, Web Classic, Aether, Atlas Current, Oracle, Lecture Technique and Strategy A. Automatic and real orders remain disabled.

## Residual debts — deliberately not reopened here

1. Analytical Memory → Decision Board P1 remains incomplete.
2. Historical `localStorage` saturation / `QuotaExceededError` remains an environment debt; the IndexedDB V7 path was already the working route and is not rewritten here.
3. Strategy A Paper V2 self-tests were not re-certified by this final versioning pass.
4. CoinGecko coverage remains 249/250 where previously observed.
5. DEX identity work remains partial.
6. Final Firefox terrain proof of visible `Build 40.6.95 · Administrator` remains the operator/user authority after deployment propagation.
7. Legacy historical workflows may still fail independently; the authoritative current checks for this release are Agent-Crypto Version Truth Guard and Agent-Crypto Version Delivery Guard.

## Restart discipline

Read the exact current request first. Then consult current GitHub runtime truth and this handoff. Use the Crypto thread/file only when available; if it is absent, do not invent its contents. Make one bounded correction, prove it, commit it, then stop. Christophe remains final validator.
