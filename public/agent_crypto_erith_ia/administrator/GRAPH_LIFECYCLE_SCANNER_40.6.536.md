# Agent-Crypto 40.6.536 — Graph Lifecycle + Scanner Responsiveness

Parent: 40.6.535.

## Firefox evidence behind this repair

40.6.535 proved that Solo now returns to the Market surface. Hausses 5, Baisses 5 and Volumes 5 also still produce valid 5/5 graphs, and Reset after a Scanner returns to BTC.

Two operational defects remained:

1. **Clear → Reset race**: after Vider, the native chart request owner could keep stale `loading` / `activeRequestKey` markers from an aborted request. Reset could then hit the existing early-return and fail to start a fresh BTC history.
2. **Scanner UI starvation**: compatibility search repeatedly counted rows while exploring candidate combinations synchronously, so Firefox could stop repainting for several seconds. Repeated clicks could then restart the same preset once the event loop recovered.

## Repair

- Clear and every fresh canonical selection explicitly return the chart request owner to idle.
- Historical window counting keeps exactly the same inclusive semantics but uses binary search instead of a full row scan.
- Cache-heavy Scanner work periodically yields to the UI thread.
- A repeated click on the same active preset/period is ignored instead of cancelling/restarting the transaction.
- A Scanner preset explicitly leaves the external New Listing chart context before taking ownership.

## Scope lock

Unchanged:
- Market Core 38.15.11;
- Hausses/Baisses/Volumes ranking semantics;
- comparison drawing and Base 100;
- Oracle business logic;
- Profondeur / OKX order book;
- Bougies;
- Lecture Technique;
- Strategy A / Evidence;
- Aether;
- Web Classique;
- orders and wallet.

## Firefox acceptance

1. BTC → Vider → Réinit. → BTC 24 h must repaint.
2. BTC → Vider → Hausses 5 → 5/5.
3. Hausses 5 → Baisses 5 → Volumes 5 without a prolonged frozen UI.
4. Re-click the same active Scanner while it is working: it must not restart the transaction.
5. Réinit. after Scanner → BTC 24 h.
6. New Listing → Hausses 5 → canonical Scanner owns the graph with no external context rebound.

Terrain remains pending Christophe/Firefox.

## Delivery proof

Compact ZIP packaging is part of the 40.6.536 CI contract. The artifact-output path was corrected after the first successful runtime guard so the generated 1.10 MB patch can be attached without changing runtime code.
