# ORACLE EVIDENCE AUTO ARCHIVE SAFETY GATES — 40.6.487

## Problem

A safe one-chunk transport does not automatically imply that a 70-chunk unattended run is safe.

Before scaling, three ambiguity classes must be eliminated:
- disabled transport reported as operational;
- two archive owners racing;
- a verifier proving the wrong already-published chunk.

## Bridge enabled truth

Queue Start calls the authenticated Bridge status route.

The queue requires:
- bridge_version = 1.9.13;
- enabled = true;
- credential_ready = true.

Any failure stops before a chunk is prepared.

## Single archive owner

Global browser lock:
`__ATLAS_ORACLE_EVIDENCE_ARCHIVE_LOCK__`

Owners:
- manual surface: `manual-40.6.487`;
- auto queue: `auto-40.6.487`.

If the lock belongs to another owner, start fails closed.

The AUTO panel additionally disables the visible manual 500-row button.

The manual path is bootstrap-only once cold storage already contains archived rows.

## Sequential queue

For each chunk:
1. read at most 500 local rows after current watermark;
2. canonical JSONL;
3. SHA-256;
4. POST one bundle to Bridge;
5. require exact path/SHA/count in response;
6. require status VERIFIED;
7. only then advance local queue watermark;
8. only then consider Pause/Stop;
9. only then continue.

No parallel requests.

## Fixed target

The last local Evidence at Start is saved as the pass target.

This ensures a live Oracle producer cannot keep the queue alive forever.

## Resume

Browser state is not authoritative after restart.

A new Start reads the Bridge status, which derives its watermark from the GitHub manifest.

## Exact public receipt

The final public verifier uses `state.last_verified` from the current queue session.

The public manifest entry must match:
- exact relative_path;
- exact SHA-256;
- exact row_count;
- VERIFIED status.

Then the JSONL itself is fetched from Pages and re-hashed/recounted/reparsed through the proven 40.6.482 verifier.

## No retention

40.6.487 does not implement local deletion.

A later HOT-window policy requires separate measured evidence and explicit scope.
