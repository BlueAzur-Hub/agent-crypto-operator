# HANDOFF FINAL — 40.6.487

## Architecture

```text
Firefox / IndexedDB HOT
        |
        | one operator Start
        v
40.6.487 sequential queue
        |
        | 500 rows / one in flight
        | VERIFIED required
        v
Bridge V1.9.13 · 8787
        |
        v
GitHub COLD
chunk + manifest VERIFIED
```

## Safety gates added after Astra audit

### 1. Enabled gate
READY is not inferred from version/auth alone.

Oracle Evidence status must report:
`enabled=true`

### 2. Shared archive lock
Manual and AUTO owners share:
`__ATLAS_ORACLE_EVIDENCE_ARCHIVE_LOCK__`

No second archive owner may start concurrently.

### 3. Exact receipt proof
The verifier does not accept “some latest VERIFIED chunk.”

It verifies the exact receipt from this session by:
- relative path;
- SHA-256;
- row count;
- VERIFIED status;
- public JSONL content.

## Queue behavior

- target frozen at Start;
- new Evidence during run deferred;
- watermark advanced only after VERIFIED;
- pause/stop after current chunk;
- fresh Start resumes from Bridge/GitHub VERIFIED watermark.

## Local safety

No local row is deleted.
No IndexedDB schema change.
No retention change.
No token in browser.
No generic GitHub browser write.

## Terrain proof required

Minimum:
- two automatic consecutive chunks;
- Pause → AUTO_PAUSED;
- Resume;
- local count not decreased.

Completion:
- AUTO_COMPLETE;
- final exact public receipt → FINAL_PUBLIC_EXACT_VERIFY_PASS.
