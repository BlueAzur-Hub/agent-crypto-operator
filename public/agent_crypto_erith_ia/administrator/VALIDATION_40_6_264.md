# VALIDATION — Agent-Crypto 40.6.264

Base build: 40.6.263
Base commit: 119dc1cad0b87ed8c759ca78a02ab7449126059f
Candidate status: FIREFOX TERRAIN PENDING
GitHub write performed: NO

## Static checks completed

PASS:
- `node --check` on `event-memory.js`
- `node --check` on `historical-analog-engine-405015.js`
- `node --check` on `decision-intelligence-current-truth.js`
- `python -m py_compile` on `agent_crypto_version_truth_guard_compat.py`
- `build.json` JSON parse
- candidate build = `40.6.264`
- parent build = `40.6.263`
- Market Core = `38.15.11`
- no `40.6.264` literal in the three runtime JS owners
- unified patch applies cleanly to the exact captured 40.6.263 source files

## Event Memory equivalence benchmark

Synthetic deterministic benchmark:
- records: 10,000
- events: 120
- old archive time: 6530.08 ms
- candidate archive time: 22.62 ms
- measured speedup in this synthetic case: 288.71×
- serialized outputs: IDENTICAL

This benchmark validates the algorithmic replacement itself. It does not substitute for Firefox terrain on the real dataset.

## Historical Analog equivalence test

Two passes on the same target:
- +24h
- +48h

Results:
- old semantic similarity calls: 200
- candidate similarity calls: 100
- +24h output: IDENTICAL
- +48h output: IDENTICAL

## Intended complexity change

Previous Event Memory nearest lookup:
`events × windows × records` timestamp scans.

Candidate:
`records log records` timestamp index preparation once per shared projection batch,
then `events × windows × log(records)` nearest lookup.

## Disclosure behavior

Static source proof:
- mount no longer invokes `refresh()` merely because Firefox restored `<details open>`;
- toggle still computes on an explicit open;
- the disclosure label is synchronized on bind and every toggle;
- closed label = `Déplier`;
- open label = `Replier`.

## CI guard correction

Remote-main contract simulation against the actual current 40.6.263 files: PASS.

The following canonical contracts are now matched independent of harmless whitespace:
- `const truth = await canonicalIdentity();`
- `source: "canonical-build.json"`
- `"agent-crypto-version-owner", "canonical-entry"`
- `globalThis.AgentCryptoBootTruth = truth;`

Full GitHub Actions execution remains pending because this candidate has not been pushed.

## Protected / untouched

- Section 01 structure
- `runtime-shell.html`
- Window Manager
- Market Core 38.15.11
- Atlas CURRENT
- Oracle
- Lecture Technique
- Strategy A business rules / Gates
- Aether
- Web Classique
- Bridge auth
- real-order paths

## Required terrain before STABLE

PENDING:
- Firefox first open latency
- Firefox close/reopen latency
- Firefox slowdown banner absence
- Section 01 Window Manager controls
- Reduce/restore
- Decision Intelligence still inside Section 01
- Binance/Oracle/Atlas continuity
- GitHub Actions Version Truth Guard
- GitHub Actions Version Delivery Guard
- GitHub Pages
