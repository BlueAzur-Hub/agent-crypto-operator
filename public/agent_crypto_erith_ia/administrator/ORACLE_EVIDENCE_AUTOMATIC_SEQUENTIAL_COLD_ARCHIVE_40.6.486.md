# ORACLE EVIDENCE AUTOMATIC SEQUENTIAL COLD ARCHIVE — 40.6.486

## Problem

The safe transport is proven, but manual operation scales poorly.

At ~35k local Evidence and 500 rows per chunk, completing the initial backlog requires roughly 70 transport operations.

The system must automate the repetitive work without changing the safety model.

## Design choice: fixed target

The queue snapshots the latest local Evidence mark at start.

Why:
- Oracle continues producing new Evidence while archive runs;
- chasing a moving tail can create a queue that never completes;
- a fixed target gives the operator a bounded, measurable pass.

Any rows created after start remain local for the next pass.

## Authoritative resume point

The queue never trusts a browser-only checkpoint after restart.

On Start it asks the authenticated Bridge:
`GET /oracle-evidence/status`

The Bridge reads the current GitHub manifest and returns its VERIFIED watermark.

This watermark is the queue's start point.

## Browser cursor

The queue opens the existing Oracle Evidence IndexedDB only in `readonly` mode.

Ordering reproduces the proven 40.6.482 rule:
`(t0, id)`

Rows are selected:
- strictly after the current VERIFIED watermark;
- not beyond the fixed startup target;
- maximum 500 per chunk.

## Bundle compatibility

The queue emits the exact proven transport schema:
- bundle build: 40.6.482;
- chunk schema: `agent_crypto_oracle_evidence_cold_chunk_v1`;
- JSONL canonicalization: one JSON object per line + final newline;
- SHA-256 in browser;
- no GitHub credential;
- no delete authorization.

Bridge V1.9.13 already accepts this source build.

## Sequencing

There is never more than one ingest request in flight.

The local watermark advances only after:
`Bridge response.status === VERIFIED`

Any error stops the queue immediately.

Bridge V1.9.13 already owns bounded GitHub timeout/retry behavior.

## Pause and Stop

An in-flight chunk is allowed to reach its verified/failure boundary.

Pause:
- request flag set;
- current chunk finishes;
- queue enters AUTO_PAUSED.

Stop:
- request flag set;
- current chunk finishes;
- queue enters AUTO_STOPPED.

This avoids ambiguity about whether a GitHub commit partially completed.

## Resume after reload or stop

A new Start performs a fresh Bridge status read, so any chunk that completed while the page was interrupted is recognized through the GitHub manifest watermark.

## Progress

The queue reports:
- rows done / backlog at start;
- chunks done / estimated chunks;
- percent;
- current chunk;
- last VERIFIED result.

The backlog count is based on:
`local rows at start - archived rows reported by Bridge`.

## No retention in this build

Archiving and retention remain separate operations.

40.6.486 does not delete IndexedDB rows.
