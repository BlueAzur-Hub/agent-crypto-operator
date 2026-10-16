# Agent-Crypto Administrator 40.6.111 — DEX Freshness Fail-Closed + Canonical Version Owner

Parent: **40.6.110**  
Market Core: **38.15.11 — unchanged**

## Mission A — DEX freshness

- DEX observations with unknown freshness are not Atlas-eligible.
- DEX observations older than the declared freshness bound are not Atlas-eligible.
- Stale/unknown observations remain observable for diagnostics.
- No DEX value becomes a canonical market price.
- Default bounded fallback when no contract threshold exists: 600 seconds.

Active owner: `js/dex-freshness-guard.js`.

## Mission B — Aether truth

`js/aether.js` was reread before surgery. It already evaluates `atlasCurrentPendingMarket137()` before the CURRENT → REPOS branch. Therefore Aether is not rewritten in this release. The existing owner is preserved and the release records the invariant instead of adding a second state owner.

## Mission C — versioning cleanup, phase 3/3

The active global build owner is now the stable canonical file:

`js/version-truth.js`

Historical immutable documents still reference `js/version-truth-406086-authority-lock.js`; that file is reduced to a compatibility shim and owns no version logic. The versioned V3 runtime owner is retired from the active tree.

Canonical active functional filenames after this cascade:

- `js/version-truth.js`
- `js/local-ai-contract-consistency.js`
- `js/tradus-strategy-a-reconcile.js`
- `js/dex-freshness-guard.js`

Git is the implementation-history authority. Build numbers remain in immutable release entry filenames and in the release manifest, not in each active functional filename.

The CI Version Truth / Delivery guards now validate the canonical owner and reject the retired build-numbered active 109–111 files.

## Known historical-document residue

Existing immutable HTML documents still contain old embedded static metadata from their ancestral snapshot. Those values no longer own the loaded build: immutable pathname `index-X.Y.Z.html` is authoritative, with explicit `ac-build` only for canonical handoff. Removing those historical first-paint literals requires regenerating immutable documents rather than adding another runtime Version Truth owner.

## Protections

No Market Core change. No Web Classic change. No Aether runtime change. No Atlas CURRENT algorithm change. No Oracle change. No Technical Reading change. No Strategy A change. No wallet, trade, recurring timer, observer or storage owner.

## Acceptance

- canonical owner JavaScript syntax PASS;
- DEX guard internal self-test contract: 4/4 expected;
- Version Truth Guard PASS required;
- Version Delivery Guard PASS required;
- Firefox terrain proof remains operator validation after Pages propagation.
