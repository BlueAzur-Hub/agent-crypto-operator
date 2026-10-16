# SEVEN HANDOFF — Agent-Crypto Administrator 40.6.518

## Canonical build

Build: **40.6.518**  
Release: **MARKET + FICHE USD PROJECTION · EXPLICIT VALUES ONLY**  
Parent: **40.6.517 — Firefox PASS**  
Market Core: **38.15.11 — protected**

## Changed owner scope

Only:

- Market Snapshot monetary presentation;
- compact Fiche price;
- expanded Fiche USD truth row.

DISPLAY USD reads only fields already present in Market data:

- `priceUsd`;
- `marketCapUsd`;
- `volume24hUsd`.

No EUR→USD conversion is permitted.

## Protected / not migrated

- Graphique remains EUR;
- Oracle / Math remains EUR;
- Aether remains unchanged;
- Bougies remain their instrument owner;
- Profondeur remains its OKX pair owner;
- Strategy / Evidence / Cost Gate unchanged;
- broker Spot unchanged;
- app.js unchanged.

## Firefox decision

PASS only if:

- EUR default equals 40.6.517;
- USD Market + Fiche remain USD across live spot refresh;
- Graphique remains intact EUR;
- switching back EUR restores canonical presentation.

After PASS, the next owner may be Oracle + Aether presentation.  
Do not migrate Graphique yet.
