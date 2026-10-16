# ORACLE EVIDENCE GITHUB TRANSPORT RESILIENCE — 40.6.485

## Problem

The first real cold bundle contains 500 Evidence and 4,269,455 bytes of JSONL. Bridge V1.9.12 used a 25 s timeout for GitHub blob creation. Two operator attempts reproduced the same write timeout.

A second latent defect also existed: the cold verifier assumed Repository Contents would embed Base64 content for the large chunk. Large chunks require a large-file-safe readback path.

## Repair

Browser:
- keeps chunk size 500;
- waits up to 300 s;
- still performs no GitHub write and no IndexedDB delete.

Bridge V1.9.13:
- 45 s small operations;
- 180 s large blob creation;
- one bounded retry;
- 120 s readback;
- Repository Contents object metadata to obtain blob SHA;
- Git Blob endpoint for exact file content;
- same atomic PENDING -> exact commit readback -> VERIFIED protocol.

## Fail closed

Timeout exhaustion does not mark a chunk verified.
A timeout surfaces as GITHUB_TIMEOUT.
Network exhaustion surfaces as GITHUB_NETWORK_ERROR.
Local Evidence remains untouched.

## Scope boundary

No retention release in this version.
