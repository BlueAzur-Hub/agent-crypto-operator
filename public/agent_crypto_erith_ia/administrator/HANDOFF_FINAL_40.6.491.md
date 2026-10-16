# HANDOFF FINAL — 40.6.491

**Release:** ORACLE EVIDENCE RETENTION ATOMICITY + AUTO SINGLE-FLIGHT  
**Parent:** 40.6.490  
**Market Core:** 38.15.11 protected  
**Terrain:** PENDING Firefox

## Fixed
- Retention comparison + deletion are one IndexedDB readwrite transaction.
- Exact local value must still equal the authenticated public cold row at deletion time.
- A concurrent Oracle mutation before the retention transaction is observed and stops deletion.
- A later Oracle write waits behind the retention transaction.
- AUTO startup is single-flight before the first await.
- AUTO progress is watermark-based and remains meaningful after HOT retention.

## Unchanged
Cold archive 36,056 / 74, Strategy A business logic, Oracle Math, Aether, Lecture Technique, Web Classique, storage schema, real-order state.

## Stop rule
If Firefox terrain does not reproduce the expected safe behavior, stop on 40.6.491 and do not continue retention.
