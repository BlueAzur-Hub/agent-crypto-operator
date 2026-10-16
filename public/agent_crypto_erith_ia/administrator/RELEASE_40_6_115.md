# Agent-Crypto Administrator 40.6.115 — Strategy A ↔ TRADUS Comparative Intelligence

Parent: **40.6.114**  
Market Core: **38.15.11 — unchanged**

## Mission

Make the existing Strategy A ↔ TRADUS comparison immediately visible and understandable to the operator.

40.6.115 does not create a new strategy. It reads the owners already present in Administrator:

- Strategy A state through the existing 40.6.105 reconciliation reader;
- TRADUS shadow state through the existing 40.6.66 owner;
- fail-closed comparison through the canonical 40.6.110 owner;
- session comparative memory through the existing Multi-Strategy Shadow Ledger;
- TRADUS Paper evaluation archive through the existing 40.6.68 observability owner.

## Visible change

A new panel is mounted **directly after the existing `TRADUS / YOHAN · SHADOW INDÉPENDANT` panel**.

It shows in plain French:

- current Strategy A decision/state and direction when readable;
- current TRADUS action, freshness, imbalance and spread;
- current comparison: accord, disagreement, non-comparable or refresh required;
- one plain-language explanation;
- comparative-memory observations and agreement/disagreement counts;
- independent TRADUS Paper trade count and archived net result;
- explicit reminder that the TRADUS Paper archive does not prove Strategy A performance.

## Canonical owner

`js/strategy-tradus-comparative-intelligence.js`

Loaded from Administrator 40.6.115 and newer by the stable demand loader.

## Fail-closed rules

- stale TRADUS => `RAFRAÎCHIR TRADUS`, not convergence;
- Strategy A unknown => non-comparable;
- Strategy A WAIT/NO TRADE + directional TRADUS => disagreement remains visible;
- Strategy A WAIT/NO TRADE + TRADUS NO_TRADE => descriptive prudent agreement;
- Paper history remains independent evidence and is never rewritten as proof of future profitability.

## Protections

No Market Core change. No Strategy A engine change. No TRADUS engine change. No Oracle change. No Atlas CURRENT change. No Aether change. No Graphique change. No Lecture Technique change. No Source Truth change. No fetch. No recurring timer. No MutationObserver. No new storage owner. No wallet. No real order.

## Acceptance

Expected model contract checks: **5/5**.

Firefox terrain proof remains required after Pages propagation. The visible acceptance criterion is simple: the operator must see `COMPARATEUR STRATÉGIE A ↔ TRADUS` immediately below the existing TRADUS shadow panel.
