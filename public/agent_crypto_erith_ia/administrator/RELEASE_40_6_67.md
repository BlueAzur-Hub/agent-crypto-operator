# Agent-Crypto Administrator — Build 40.6.67

## TRADUS PAPER SHADOW · INDEPENDENT PAPER LIFECYCLE

Parent: **40.6.66 R1**  
Market Core: **38.15.11** (protected)

### Functional advance

TRADUS/Yohan now owns an isolated PAPER shadow lifecycle fed only by its existing validated observations.

- flat + BUY -> open synthetic LONG PAPER at executable ask;
- flat + SELL -> open synthetic SHORT PAPER at executable bid;
- same-direction signal -> hold;
- NO_TRADE after an open edge -> close at executable opposite side;
- opposite signal -> close only, never flip on the same observation;
- invalid/stale/wide-spread data -> no Paper state mutation;
- one virtual position maximum; 50 EUR ticket; 1,000 EUR starting capital;
- P/L includes crossing the visible spread and a **local Paper assumption** of 0.10% fee per fill;
- session-local journal and JSON export;
- Strategy A remains independent; historical workspace Strategy B remains untouched.

### Safety

PAPER ONLY. No Kraken. No API key. No wallet. No real order. No new recurring timer. No new network owner.
Aether, Graphique, Lecture Technique, Atlas, Oracle and Market Core are not changed by this release.

### Acceptance

Static: JS syntax + deterministic Paper lifecycle self-test.  
Firefox field proof remains required after upload for visible mount and first real TRADUS Paper observation.
