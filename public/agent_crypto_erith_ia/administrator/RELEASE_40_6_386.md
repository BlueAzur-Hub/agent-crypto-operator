# Agent-Crypto 40.6.386 — AETHER VEILLE · LINK ENTITY TRUTH LOCK

Date: 2026-09-23
Parent: **40.6.385**
Market Core: **38.15.11**

## Audit finding

The Aether / Veille audit found a concrete semantic false positive visible in the operator ribbon:

- source headline: **SEC Censures OTC Link LLC for Repeated Compliance Failures Related to Regulation SCI**
- current archive asset: **LINK**
- Aether ribbon scope: **RÉGULATION · LINK · 91/100**

OTC Link LLC is a company/entity string in that headline. It is not evidence of Chainlink (LINK).

## Root cause

The canonical collector mapped LINK from both chainlink and the generic English word link. Aether then trusted the canonical assets array as a crypto anchor.

## 40.6.386 correction

- Producer owner: LINK detection now requires chainlink or link token.
- Regression lock: OTC Link LLC must not produce LINK.
- Regression lock: Chainlink LINK token must still produce LINK.
- Aether stale-cache guard: LINK is trusted for eligibility/scope only with an explicit Chainlink, LINK token or $LINK anchor.

## Deliberately unchanged

- News translation policy: native French first; qualified English stays explicit [EN].
- News Sentinel remains the canonical News owner.
- no new fetch;
- no new timer;
- no new storage owner;
- Aether Watch geometry / F11 / Window Manager untouched;
- Math Core and REDIVIDER untouched;
- Lecture Technique RND / Origines d’Aerith untouched;
- Strategy A / Gates untouched;
- Market Core 38.15.11 untouched.

## Terrain required

After the News workflow triggered by this release:

1. open Administrator under Firefox;
2. verify Build **40.6.386**;
3. verify the SEC OTC Link LLC story no longer enters Aether as Chainlink LINK;
4. verify genuine crypto/macro Aether rotation still works;
5. if a genuine Chainlink story is present, verify it remains eligible.

STOP after proof.
