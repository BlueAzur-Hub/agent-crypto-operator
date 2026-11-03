# Operator Yoann — Administrator / Trader parity and source-truth audit

**Audit baseline:** 2026-11-03, after merged PR #14.  
**Master:** `BlueAzur-Hub/erith-ia-memory`, `main`, tree `cb9cd90e1d8894cc9725d6838d7e159878a7050a`.  
**Operator:** `BlueAzur-Hub/agent-crypto-operator`, `main`, commit `9bc2e5f99a52b9ead59b5add07e7ec5d5c5c0785`.  
**Shared displayed build:** `40.6.719`; Market Core `38.15.11`. Identical version labels are not proof of code parity.

## Method and limits

Compared complete GitHub tree inventories by path and blob SHA (non-truncated tree APIs), inspected all declared script/style URLs in the main Administrator/Trader entrypoints, and verified statically referenced script paths in Trader's runtime mirror and Administrator's post-boot loader. Read source portions and API contracts of the highest-impact divergent files, including full readable Trader modules and the read-only Event Intelligence file. For the ~3.4 MB `administrator/app.js` files, compared all ~69,232 Master vs ~67,797 Operator lines mechanically, identified unmatched ranges and audited representative sections; **not** a certified line-by-line human review of all 8,000+ files or a full runtime behavior proof. Automated CI and localhost Firefox are separate from Firefox Windows with live market data.

## Inventory before this targeted parity patch

| Subtree | MASTER files | Operator files | Common files with different SHA | MASTER-only files |
|---|---:|---:|---:|---:|
| `administrator/` | 517 | 1091 | 20 | 84 |
| `trader/` | 104 | 65 | 24 | 41 |
| `laboratoire/` | 82 | 15 | 5 | 67 |
| `web/` | 32 | 32 | 2 | 0 |

These totals include versioned archives, tests, assets, historical reports and intentional Operator-specific additions; they are **not** a parity deficit count. All 97 relative script/style references declared in Operator's Administrator entrypoint resolved inside its own tree; 65 statically referenced files in the post-boot loader, 10 explicit relative resources in the Trader runtime mirror, and both Trader entrypoint references also resolved. The missing functionality is not primarily a broken JavaScript `src` on page load.

## Confirmed findings, severity and action

| Priority | Source evidence | Classification | Decision |
|---|---|---|---|
| **P1 — FIXED in this audit patch** | `trader/market-fiche-native.js`: Operator rendered market capitalization `0` even where external feeds encode missing data as zero; unverified 7d and 30d `0.00%` looked measured. Master applies `capRaw>0` and external-zero-to-unknown guards. | Data-truth regression | Port the exact Master read-only formatter; add runtime regression tests that preserve genuine measured 0% for native Market and show unknown as `—` for unverified Radar. |
| **P1 — FIXED in this audit patch** | `administrator/data/new-listings-identities.json`: MASTER already contained verified public AXIS/Bitget identity, but Operator omitted `axis-robotics` and had an earlier verification date for NeoSoul. The local AXIS logo existed in Operator already. | Static identity-memory gap | Align the public identity registry, preserving `spotUsdcOkxVerified:false` and `okxDerivativesNotSpot:true`. No new price feed, account connection, Spot permission or market owner. |
| **P0 — OPEN, DO NOT BLINDLY COPY** | `administrator/app.js` Master ~3,468 KB vs Operator ~3,382 KB; the Master has 1,581 unique lines absent from Operator. Reviewed changes include historical quote provenance, Top 3 EUR selection, Top 5 normalized 24h alignment, yearly native USD source, Coinbase fallback, no invented historical prices and constrained scanner recovery. | Substantial architecture/data-truth drift | Requires an isolated source-by-source parity plan, regression fixtures for 24h Top 3/5 and Hausses/Baisses/Volumes, and explicit approval of the diffs. Wholesale replacement could overwrite Operator role and validated TRADUS/Trader behavior. |
| **P1 — OPEN, DEPENDENCIES MISSING** | The MASTER `trader-runtime-mirror.js` mounts five modules absent from Operator: `strategy-comparator.js`, `spot-paper-order-engine.js`, `trader-paper-decision-core.js`, `trader-paper-decision-view.js`, `trader-order-entry-view.js`. `spot-case-scenario-model.js` also exists only in MASTER but is not a direct mounted script. | Functional Trader/PAPER difference | Each module is labelled PAPER/read-only, but its real dependencies and references must be reviewed before porting. No live order is authorized. |
| **P1 — OPEN, SOURCE DATA NOT PRESENT** | MASTER has 494 `data/trader_flux/` files, 30 `data/crypto/radar-opportunities/` files and 70 `data/crypto/okx-hourly/` files; Operator has zero in each of these subtrees. The Master PAPER decision/comparator fetches relative files in these families. | Canonical evidence not mirrored | Do not install viewer modules pointing at missing relative JSON and silently render `404`. Evaluate deliberate links to canonical public evidence or a bounded, reviewed subset with checksums and freshness, not a bulk archive copy. |
| **P1 — OPEN, ROLE COUPLING** | MASTER `trader-paper-lab-core.js` supports additional native crypto historical and prospective studies; Operator remains BTC/CT-centric. The two `trader-paper-lab-view.js` files differ because the Operator view owns the Yoann bottom handoff and TRADUS placement. | Partial functionality + intentional Operator customization | Merge behavioral deltas surgically; NEVER overwrite Operator view wholesale. |
| **P1 — PROTECTED BY DESIGN** | MASTER `trader-okx-account.js` exposes optional private multi-asset helpers not present in Operator. PR #14 disables the dossier's private read when those helpers are absent. Operator Bridge uses its own permission profile. | Intentional security boundary | Do not transfer Master private methods, tokens, accounts, balances or execution privileges. |
| **P2 — OPEN** | MASTER `administrator/js/event-intelligence.js` adds a normalized `news_intelligence` read-only payload and `watches()`, absent from Operator. No active Operator call to `AtlasEventIntelligence.watches` was found in repository search. | Specialized capability not proven necessary in Operator | Keep deferred pending a concrete view/consumer and source-truth test. |
| **P2 — OPEN** | MASTER loader uses `administrator/js/storage-primary-truth.js`; Operator loader still references an existing versioned `storage-primary-truth-406344.js`. | Deliberate or historical storage-owner difference | No automatic storage migration: verify IndexedDB/localStorage preservation, quotas and upgrade/rollback before changing the owner. |
| **P2 — INTENTIONAL LINKS** | Operator `administrator/js/market-radar-native.js` links missing local Radar/Knowledge archives to the existing public MASTER website instead of broken local paths. | Operator thin-public architecture | Retain external links; verify new-tab navigation and avoid duplicating heavy research archives. |
| **P3 — ARCHIVES EXCLUDED** | MASTER `laboratoire/` has 67 files not in Operator, including research pages, historic Radar and audit datasets. MASTER `administrator/book_mirror.json` is also much larger. | Mostly external evidence and archives | Do not bulk-copy. Use links/catalog and include only specifically requested, licensed, public and tested artifacts. |

## Separate checks already achieved in PR #14

- Dossier Seven BTC/ETH and Concrete CT share ONE technical reading accordion; missing private permissions fail closed.
- Canonical USD at Trader boot, manual EUR → USD still works. Display selection and historical native quote remain distinct.
- TRADUS stays in the existing end-of-page Yoann handoff, shadow/paper only, with no order or private Bridge.
- Firefox CI and exact-delta packaging passed before PR #14 merged; GitHub Pages completed successfully at the exact merged commit.

## Acceptance of this audit correction

- Only `trader/market-fiche-native.js` and `administrator/data/new-listings-identities.json` are deployed application changes.
- Node source-truth tests assert unverified zero remains unknown, real native zero stays valid, and AXIS is a public Bitget identity **without invented OKX Spot support**.
- The CI parity guard accepts ONLY this exact two-application-file delta; Firefox smoke, permission profile and the existing graph source hashes remain protected.
- The Phase C incremental ZIP must be labelled for Market Facts and Listings, not the older TRADUS patch.
- Do not increment the shared build to suggest parity was fully resolved. Git commit SHA proves actual provenance.

## Pending validation, not claimed completed

1. Manual Firefox Windows: new-listings AXIS logo/identity, fiche Crypto external zero as `—`, BTC dossier Seven, CT legacy, USD default, manual EUR return, TRADUS.
2. Read and design the `administrator/app.js` differential by market module and provider, then run source-provenance and 24h comparison fixtures before any further production patch.
3. Inventory the minimum public report data required for PAPER/Strategy Comparator and decide whether these modules belong in Yoann's Operator role; keep real-order execution permanently disabled.
4. Do not describe the product as completely synchronized until these P0/P1 items are resolved and verified.

**Status of report:** comprehensive **inventory and risk-based source audit**, not an attestation that every source line, dataset or real-time exchange path has been exercised. No private Yoann repository or private Bridge was touched.
