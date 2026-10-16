# Agent-Crypto 40.6.266 — STABILITY · DECISION INTELLIGENCE CLUSTER INDEX

Parent: **40.6.265**
Base commit: `0f121ee5c2b6ed6a754cdaa55edc6b5548615f97`

## Scope
Two runtime owners only:
- `js/event-semantic-enrichment.js`
- `js/historical-analog-engine-405015.js`

The Section 01 DOM, Window Manager and Decision Intelligence mount are not moved.

## Repair
Semantic clustering previously searched every previously built group for every event.
40.6.266 indexes candidate groups by event family and 36-hour time bucket, then checks candidates in original group order.
The conservative `sameEvent()` rule is unchanged.

Historical Analog now filters horizon-eligible reaction rows before asking for semantic clusters.
If no historical reaction can qualify, it returns the same `NO_ANALOG` state without paying the cluster cost.

## Protected
Market Core 38.15.11, Oracle, Atlas CURRENT, Lecture Technique, Strategy A, Aether, Web Classique, Bridge auth and real-order paths are unchanged.

Firefox terrain remains required.
