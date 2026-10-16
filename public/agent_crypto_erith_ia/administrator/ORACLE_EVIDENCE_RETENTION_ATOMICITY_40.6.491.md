# Oracle Evidence — Retention Atomicity 40.6.491

## Defect
40.6.490 separated the last local proof from the delete transaction. That left a time-of-check/time-of-use window: a row could be updated after its proof and before deletion.

## Transaction contract
The public chunk is authenticated first. The deletion owner then opens exactly one IndexedDB `readwrite` transaction and, inside that transaction:
- counts the store for the HOT invariant;
- reads every exact ID;
- compares `JSON.stringify(current)` with the already authenticated public row;
- aborts on the first missing or divergent value;
- only after all comparisons pass, queues the exact `delete(id)` operations.

No asynchronous cryptographic digest is awaited inside that transaction. This preserves IndexedDB transaction liveness while making the final value check and delete indivisible with respect to other write transactions.

## AUTO correction
`start()` has an explicit `starting` state before its first await. Progress uses an IndexedDB cursor count from the Bridge VERIFIED watermark to the fixed startup target. Historical archived totals are no longer subtracted from the retained local window.

## Proof boundary
CI proves syntax and source contracts. Firefox terrain remains the proof for browser/runtime behavior.
