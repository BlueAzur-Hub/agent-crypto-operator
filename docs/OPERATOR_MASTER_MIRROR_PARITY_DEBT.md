# Operator — Administrator and Trader master mirror parity

Reference at branch creation (2026-11-06): MASTER `BlueAzur-Hub/erith-ia-memory` main `a1af4bcf9089d637d42230452e2b9b55b30dcaef`; Operator main `487c1586c4a587d30e90e790e7ced3fdabe487eb`.

## Purpose
Keep all compatible shared Administrator and Trader behavior in the public Operator mirror while preserving Yoann's private Bridge, credentials, permissions, independent TRADUS handoff and role-specific modules. Never copy the private account payload or live-order privileges into a public site.

## Integrated into Operator main by PR #26 (merge ea38dd4, 2026-11-06)

Four PR checks passed, including the direct scanner regression suite and headless Firefox Linux smoke. This is a code deployment, not a Windows Firefox acceptance or an 84/84 source-history certification.
- Administrator: quote-specific graph context identity; canonical Top 3 / Top 5 basket stability; source-and-quote-aware chart fingerprint and cached workspace restore.
- Administrator: Master 24h native scanner common-window Base 100 safeguards; preserve extrema when downsampling and require qualified 24h coverage.
- Trader: Master PAPER historical study, multi-asset qualified observations, session-only prospective manual watch with cancel, bounded automatic evaluation and read-only journal.
- Trader: keep the Operator Yoann/TRADUS section and the existing private role boundary as-is; do not transplant the Master private OKX account module.
- New CI guard checks shared invariants and existing Trader PAPER, TRADUS and public parity tests.

## Intentionally not overwritten
- Trader `trader-runtime-mirror.js`, `trader-okx-account.js`, `ai-ct-contract.js`, `ai-asset-reading-view.js`: different private Bridge/role boundary and account capabilities need explicit function-level reconciliation.
- Operator `graph-native-usd.js` and native OKX source path: already identical to MASTER at inspected SHAs, so no duplicate port.
- Existing Operator B3–B5 merged baseline, PR #24 and independent PR #25 scanner acceptance audit.

## Acceptance still required
1. [DONE] Confirm CI: mirror contract, legacy six-file scope, general Operator checks, and Phase C Firefox smoke all passed.
2. [OPEN] Verify USD/EUR Top 3/5, scanner and 24h/7d/1y/MAX contexts on Firefox Windows, including no stale 24h banner after annual completion.
3. [OPEN] Review unmatched Trader CT / private OKX account functions *without* copying privileges, then verify IA Dossier, PAPER and TRADUS across both desks.
4. [OPEN] Reconcile PR #25 with the updated runtime; previous run #42293617773 observed 84 cases, but certified only 40 (26 deadline, 18 scanner reject) on the earlier baseline. Do not describe its green workflow as 84/84 certification.
5. [DONE] Update the Notion decision record with PR #26 merge and open acceptance items.

No real trade, private API credential, local Bridge or account mutation is permitted by this branch.
