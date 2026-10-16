# HANDOFF FINAL — 40.6.483

## Frozen foundation

- 40.6.481 = Firefox cursor recovery PASS.
- 40.6.482 = HOT/COLD foundation PASS terrain with a real 500-row bundle.
- 40.6.482 is not reconstructed by this build.

## 40.6.483

Safe local Bridge transport + cold verification.

Owners:
- preparation: `administrator/js/oracle-evidence-tiered-storage-foundation.js` (40.6.482 preserved);
- browser transport UI: `administrator/js/oracle-evidence-safe-bridge-ingest.js`;
- trusted transport: `tools/oracle_evidence_cold_bridge.py`;
- cold truth: `data/oracle_evidence/manifest.json`.

## Write sequence

bundle
-> schema validation
-> SHA-256 recalculation
-> row_count validation
-> atomic chunk + PENDING manifest commit
-> GitHub readback
-> SHA/count/JSON parse verification
-> VERIFIED manifest commit.

## Security invariants

- loopback Bridge only;
- GitHub credential server-side only;
- no browser GitHub write;
- no automatic upload;
- no local delete API;
- no IndexedDB schema change;
- no retention change;
- no Oracle Math / Strategy A / Market Core change;
- no real order.

## Terrain still required

The static harness proves the contract, not the local machine credential or live GitHub round trip.

Operator terrain must prove:
- Bridge READY;
- one 500-row ingest returns VERIFIED;
- one cold chunk is present on GitHub;
- manifest reports VERIFIED;
- published readback passes;
- local Evidence count is unchanged or higher.

## Future

Only after several VERIFIED cold chunks:
**40.6.484 — VERIFIED LOCAL RETENTION / HOT WINDOW**.

No purge is authorized by 40.6.483.
