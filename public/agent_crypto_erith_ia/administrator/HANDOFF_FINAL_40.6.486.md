# HANDOFF FINAL — 40.6.486

## Proven before this build

40.6.485 completed the first full cold round trip:
- local preparation;
- Bridge V1.9.13 ingest;
- GitHub write;
- exact readback;
- VERIFIED manifest;
- GitHub Pages propagation;
- PUBLISHED_VERIFY_PASS.

## New owner

`administrator/js/oracle-evidence-auto-archive-queue.js`

Role:
automatic sequential backlog archive.

## Invariants

- source bundle contract remains 40.6.482;
- Bridge remains V1.9.13 on 8787;
- chunk size remains 500;
- no parallelism;
- next chunk waits for VERIFIED;
- target is frozen at queue start;
- new live rows are deferred;
- pause/stop only after current safe chunk;
- fresh start resumes from Bridge VERIFIED watermark;
- IndexedDB is read-only;
- no local purge;
- no retention reduction.

## Workflow cleanup

Historical package workflows .481-.485 are manual-only, preventing runtime archive commits from generating irrelevant historical release failures.

## Terrain proof required

A meaningful operator test is not just one chunk.

Minimum useful terrain:
- start automatic mode;
- observe at least 2 consecutive chunks VERIFIED automatically;
- test Pause after chunk;
- Resume;
- optionally Stop after chunk and Start again;
- confirm resume begins after the latest VERIFIED watermark;
- local count never decreases.

Full backlog completion can then run unattended.

After final Pages propagation:
- read manifest;
- verify final published chunk once.
