# SEVEN HANDOFF — Agent-Crypto Administrator 40.6.519

Build: **40.6.519**  
Release: **ORACLE + AETHER USD PRESENTATION · MODEL UNCHANGED**  
Parent: **40.6.518**

## Migrated in this build

- Oracle visible price;
- Aether BTC market brief;
- Aether BTC Attention/System presentation.

All use explicit USD fields when DISPLAY = USD.

## Not migrated yet

- Graphique native USD series;
- Bougies multi-instrument display contract;
- Profondeur multi-quote display contract;
- final global USD default.

## Critical invariant

Oracle presentation may change currency.  
Oracle model, Math, Evidence, calibration and Strategy inputs do **not**.

Aether presentation may change currency.  
Aether's market interpretation percentages and News/Watch logic do **not**.

## Next owner after Firefox PASS

Graphique native USD source + currency-aware cache/context.

No Canvas post-conversion.
