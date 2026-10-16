# Agent-Crypto Administrator 40.6.113 — DEX Exclusion Diagnostic Truth

Parent: **40.6.112**  
Market Core: **38.15.11 — unchanged**

## Mission

Make the existing DEX exclusion diagnostic explain the freshness decisions introduced by 40.6.111 without changing those decisions.

40.6.111 already fails closed when an otherwise valid DEX observation is stale or has unknown freshness. The historical 40.6.98 diagnostic only knew that `identity.atlas_eligible` had become false, so those cases could fall back to the generic `ATLAS_NOT_ELIGIBLE` label.

40.6.113 introduces the canonical read-only diagnostic owner:

`js/dex-exclusion-diagnostics.js`

The Source Truth demand loader routes Build 40.6.113 and newer to that canonical owner. Older immutable builds keep their historical 40.6.98 path.

## Diagnostic change

- read the existing `identity.freshness_reason` emitted by `js/dex-freshness-guard.js`;
- surface `STALE` when a provider observation exceeds the declared freshness bound;
- surface `FRESHNESS_UNKNOWN` when an otherwise OK provider has no usable freshness timestamp;
- retain the generic `ATLAS_NOT_ELIGIBLE` fallback only when no more specific diagnostic cause exists;
- keep the existing eligibility expression unchanged;
- keep stale/unknown observations visible for operator diagnosis.

## Ownership

Canonical active owner from 40.6.113:

`js/dex-exclusion-diagnostics.js`

Historical implementation for Builds 40.6.98–40.6.112:

`js/dex-exclusion-diagnostics-406098.js`

Git remains the implementation-history authority. The active functional filename does not gain a Build suffix.

## Protections

No Market Core change. No canonical-price change. No Source Truth ownership change. No Atlas eligibility rule change. No Web Classic change. No Atlas CURRENT algorithm change. No Aether state change. No Oracle change. No Lecture Technique change. No Strategy A/TRADUS change. No Bridge protocol change. No wallet or order path. No recurring timer, MutationObserver, storage write or new market-data request.

## Acceptance

- a fresh eligible DEX observation remains eligible and has no exclusion reason;
- a freshness exclusion carrying `STALE` is reported as `STALE`, not generic `ATLAS_NOT_ELIGIBLE`;
- a freshness exclusion carrying `FRESHNESS_UNKNOWN` is reported as `FRESHNESS_UNKNOWN`, not generic `ATLAS_NOT_ELIGIBLE`;
- an unexplained pre-existing `atlas_eligible=false` still uses the generic fallback;
- pure diagnostic self-test expected: **4/4**;
- Firefox terrain review required after Pages propagation.
