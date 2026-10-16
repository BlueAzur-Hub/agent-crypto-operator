# ORACLE EVIDENCE SAFE BRIDGE INGEST + COLD VERIFY — 40.6.483

## Goal

Complete the transport half of the HOT/COLD Oracle Evidence architecture without weakening the browser or local-retention safety locks.

## Architecture

```text
Firefox / IndexedDB HOT
        |
        | explicit operator action
        v
40.6.482 bounded bundle
        |
        v
127.0.0.1:8791
Oracle Evidence Safe Bridge
        |
        | authenticated GitHub API
        v
GitHub COLD
chunk JSONL + manifest
```

## Why a separate owner

The 40.6.482 foundation already passed terrain. It remains the owner of:
- IndexedDB cursor reading;
- chunk selection;
- canonical JSONL;
- SHA-256;
- bundle creation;
- published-chunk verification.

40.6.483 does not rewrite that owner. It adds a separate transport layer.

## Browser owner

`administrator/js/oracle-evidence-safe-bridge-ingest.js`

Responsibilities:
- test Bridge health;
- explicitly request the next 500-row bundle from the 40.6.482 foundation;
- POST it to loopback only;
- compare returned path/SHA/count to the prepared bundle;
- verify that the local row count did not decrease;
- optionally verify the latest published VERIFIED chunk after Pages propagation.

It has:
- no GitHub token;
- no direct GitHub write;
- no IndexedDB delete or write;
- no timer;
- no MutationObserver;
- no automatic upload.

## Bridge owner

`tools/oracle_evidence_cold_bridge.py`

The Bridge is Python stdlib only.

Authentication is resolved server-side from environment or local GitHub CLI authentication.

The Bridge writes only below:
`public/agent_crypto_erith_ia/data/oracle_evidence/`.

### Validation gates

Before any write:
- bundle schema exact;
- accepted build 40.6.482 or 40.6.483;
- chunk schema exact;
- safe relative path;
- 1..1000 rows;
- exact SHA-256;
- exact row_count;
- first/last T0 and IDs;
- watermark equals last row;
- every row parses as `atlas.oracle.evidence.v1`;
- local-delete flags remain false.

### Two-commit verification protocol

Commit A:
- JSONL chunk;
- manifest entry = `WRITTEN_PENDING_VERIFY`.

Both files are in one Git tree/commit.

Then the Bridge reads the chunk back from Commit A.

Only if SHA-256, row_count and every JSON line pass:

Commit B:
- same manifest entry -> `VERIFIED`;
- verified chunk count incremented;
- archived row count recomputed;
- watermark advanced.

If verification fails, the manifest stays PENDING and local data remains untouched.

## Concurrency

Before each commit, the Bridge checks that `main` is still the expected parent SHA.

If main moved:
**fail closed**.

No force push.

## Idempotence

If the same chunk is already VERIFIED with the same SHA/count, re-ingest performs a readback check and returns VERIFIED without duplicating the chunk.

A SHA/count collision fails closed.

## Retention

40.6.483 does not implement retention release.

`local_retention_allowed = false` remains canonical.

Future retention requires multiple VERIFIED chunks plus a measured HOT-window policy.
