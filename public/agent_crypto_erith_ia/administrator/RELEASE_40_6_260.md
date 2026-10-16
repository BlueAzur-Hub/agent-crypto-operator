# Agent-Crypto 40.6.260 — Decision Intelligence · restore family 01 sibling placement

Parent: **40.6.259**  
Rollback target: **40.6.258 placement mechanism**  
Market Core: **38.15.11 — protected**

## Correction

40.6.259 incorrectly made **Decision Intelligence · vérité courante** a DOM child of the compact family 01 header grid.

40.6.260 removes only that mistake.

The placement mechanism is restored to the 40.6.258 behavior:

```text
01 · Analyse & décision   ← family header wrapper
Decision Intelligence    ← immediate sibling after the header
remaining family 01 subsections
```

## Scope

- restore `hostAnchor()` from 40.6.258;
- restore sibling `insertAdjacentHTML("afterend", ...)`;
- remove 40.6.259 `beforeend` child mount;
- remove 40.6.259 inline `grid-column`, `width` and `margin-top`;
- keep `data-layout-family="analysis"`;
- keep `atlas-tone-analysis`;
- no Decision Intelligence engine/cache/business change.

## Protected

- Market Core **38.15.11**
- Atlas CURRENT
- Oracle
- Lecture Technique
- Strategy A business logic and Gates
- Aether
- Web Classique
- Bridge auth continuity

## Firefox proof

After GitHub Pages exposes **Build 40.6.260 · Administrator**:

1. hard reload once;
2. verify the family 01 header is compact and intact;
3. verify Decision Intelligence is immediately below it as its own full-width section;
4. verify Oracle and the following family 01 sections keep their previous layout;
5. open Decision Intelligence once and confirm no slowdown / duplicate.

PAPER ONLY · G3 PENDING · G9 LOCKED · no real order path changed.
