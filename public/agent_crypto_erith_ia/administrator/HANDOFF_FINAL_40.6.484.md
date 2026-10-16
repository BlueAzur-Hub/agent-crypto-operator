# HANDOFF FINAL — 40.6.484

## Decision corrected

The initial 40.6.483 concept created a separate Oracle Evidence service on port 8791.

The operator had not loaded it.

The actual canonical local architecture was then re-read from the Crypto thread and from the R15 complete-source archive. Agent-Crypto already owns:

- authenticated Bridge V1.9.11 on 8787;
- read-only Backend V1.4.2 on 8790.

Therefore 40.6.484 supersedes the standalone 8791 path and moves Oracle Evidence into the **existing Bridge**.

## Local deliverable

R16 source lineage:
- Control Center 2.3.2R16
- Bridge V1.9.12
- Backend V1.4.2 unchanged

Bridge source truth is locked in:
`coordination/inter_ai_dialogues/agent_crypto/BRIDGE_R16_V1_9_12_ORACLE_EVIDENCE_SOURCE_LOCK_40.6.484.md`

R16 EXE SHA-256:
`6e4ffd5812c2f39d3d583364b96b7fdcd5d63bcb9b97f9f1503d6ab7f7f15f40`

## Security model

Existing Aether Trust / Administrator login
→ existing Bridge session token
→ owner capability `oracle_evidence.publish`
→ Bridge 8787
→ server-side GitHub credential
→ bounded cold archive path only.

Browser never owns GitHub authentication.

Private Backend 8790 remains read-only.

## Archive protocol

bundle 40.6.482
→ schema validation
→ SHA-256 / row_count / bounds / watermark
→ atomic JSONL + PENDING manifest commit
→ exact commit readback
→ SHA/count/JSON parse
→ VERIFIED manifest commit.

## No-retention lock

40.6.484:
- no IndexedDB deletion;
- no retention reduction;
- no automatic upload;
- no generic GitHub write;
- no order execution.

## First mission for next operator/sister

Do not rebuild the architecture.

Run the R16 Windows proof on Ryzen:
1. Bridge V1.9.12 READY;
2. existing Administrator auth works;
3. Oracle Evidence status route reports GitHub credential ready;
4. one 500-row ingest returns VERIFIED;
5. published readback passes;
6. local Evidence count does not decrease.

Only then accumulate further VERIFIED chunks.
