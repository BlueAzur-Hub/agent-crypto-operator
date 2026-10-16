# ORACLE EVIDENCE EXISTING BRIDGE INTEGRATION — 40.6.484

## Objective

Correct the transport owner before the uninstalled 40.6.483 candidate reaches the operator machine.

## Canonical topology

```text
Seven Vault 8780            independent

Firefox / IndexedDB HOT
        |
        | explicit operator action
        v
40.6.482 bounded bundle
        |
        | existing Administrator Bridge session
        v
Atlas-10 Crypto Bridge V1.9.12
127.0.0.1:8787
        |
        | owner-only oracle_evidence.publish
        | GitHub credential remains server-side
        v
GitHub COLD
chunk JSONL + manifest

Private Backend V1.4.2
127.0.0.1:8790             read-only / unchanged
```

No 8791 runtime exists in the target architecture.

## Browser contract

The 40.6.484 module reads only the existing Bridge session token already used by Administrator.

It never reads:
- GitHub PAT;
- GitHub CLI credential;
- exchange secrets.

It prepares the bundle through the proven 40.6.482 foundation.

It rejects a Bridge response unless:
- status = VERIFIED;
- relative path matches;
- SHA-256 matches;
- row_count matches;
- local delete flags remain false;
- local Evidence count did not decrease.

## Bridge contract

Bridge V1.9.12 extends the existing refusal-default capability policy.

Owner only:
- `oracle_evidence.read`
- `oracle_evidence.publish`

Routes:
- `GET /oracle-evidence/status`
- `POST /oracle-evidence/ingest`

The generic Browser → GitHub path remains forbidden.

## Concurrency and atomicity

Before every Git commit, the Bridge compares current branch HEAD with the expected parent.

If `main` moved:
**fail closed**.

First commit contains:
- JSONL chunk;
- manifest entry `WRITTEN_PENDING_VERIFY`.

Only after independent readback of that exact commit can a second commit promote it to:
`VERIFIED`.

## Idempotence

Already-VERIFIED same path + same SHA/count:
- readback is repeated;
- result returns VERIFIED;
- no duplicate chunk is created.

Divergent collision:
- fail closed.

## Retention

This version intentionally does not solve Firefox retention.

Cold proof must mature before any local release policy is allowed.
