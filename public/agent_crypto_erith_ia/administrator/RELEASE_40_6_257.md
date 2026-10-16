# Agent-Crypto 40.6.257 — DECISION INTELLIGENCE · FAMILY 02 PLACEMENT

Parent: **40.6.256**  
Market Core: **38.15.11 — protected**

## Operator proof

The Firefox 40.6.256 capture showed **Decision Intelligence · vérité courante**
still rendered before the **02 · Intelligence, mémoire & création** family header.

The previous 40.6.256 layout review had explicitly decided not to move it.
That information-architecture decision is superseded by the operator's correction.

## Root cause

`js/decision-intelligence-current-truth.js` still owned presentation placement with:

- `data-layout-family="analysis"`
- `atlas-tone-analysis`
- `hostAnchor()` preferring `#news-sentinel`

So the subsection was guaranteed to mount in family 01 presentation territory.

## Surgery

Presentation only:

- keep the stable Decision Intelligence computation/cache owner unchanged;
- change the subsection family metadata to **intelligence**;
- change its visual tone to **atlas-tone-intelligence**;
- make `hostAnchor()` prefer the canonical `#atlasLayoutFamily02` family header;
- insert the subsection immediately after family 02 header, before **Atlas-10 + Aerith-10 Crypto**;
- retain bounded fallbacks only if family 02 is unavailable.

## Protected

- Market Core **38.15.11**
- Atlas CURRENT semantics
- Auto Reader 40.6.254
- Bridge auth continuity 40.6.255 / 40.6.256
- Strategy A business rules and Gates
- Decision Intelligence compute/cache chain
- Oracle
- Lecture Technique
- Aether
- Web Classique

## Static contract

- New recurring timer: **NO**
- New MutationObserver: **NO**
- New fetch: **NO**
- New storage owner: **NO**
- Decision Intelligence computation changed: **NO**
- Real orders: **NO**
- PAPER ONLY · G3 PENDING · G9 LOCKED

## Firefox acceptance

Expected vertical order:

1. **01 · Analyse & décision**
2. its analysis subsections, including Oracle
3. **02 · Intelligence, mémoire & création**
4. **Decision Intelligence · vérité courante**
5. **Atlas-10 + Aerith-10 Crypto**

Open Decision Intelligence once and confirm the Current Truth body is unchanged functionally.
