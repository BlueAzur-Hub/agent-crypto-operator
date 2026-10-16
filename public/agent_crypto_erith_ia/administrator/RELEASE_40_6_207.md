# Agent-Crypto 40.6.207 — G3 Eight-Panel Evidence Binding

Parent: 40.6.206  
Engine: Market Core 38.15.11  
Mode: PAPER ONLY  
G3: PENDING  
G9: LOCKED

## Terrain proof from 40.6.206
The Firefox export confirms that Build 40.6.206 is loaded and that the Cascade Checkpoint still reports:

- `BLOCKER · NO_CERTIFIED_T0_DECISION`
- `OWNER · AgentCryptoStrategyAExperimentLedger`
- `ACTION · CAPTURE_NEW_PROSPECTIVE_T0_ONLY`

The same report contains no visible prospective T0 panel, counters, or operator button.

## Exact repair
The stable G3 Evidence host and lifecycle truth still owned only seven panel IDs. The prospective T0 capture owner was therefore outside the canonical host lifecycle and could miss the render/export cycle.

40.6.207 adds `strategyAG3ProspectiveT0Capture` as the eighth owned panel in:

- `js/strategy-a-evidence-dossier-supplement-integrator.js`
- `js/strategy-a-evidence-lifecycle-truth.js`

Bootstrap completion now requires eight of eight panels present and hydrated.

## Deliberately unchanged
The prospective T0 capture contract remains the existing 40.6.206 owner. Strategy A thresholds, Risk Governor, PAPER lifecycle, Market Core, Atlas, Oracle, Aether, Lecture Technique, historical ledger, prospective storage contract, network behavior and real-order paths are unchanged.

## Static proof
Both modified JavaScript files pass `node --check`.

## Terrain acceptance
Reload Administrator until `Build 40.6.207 · Administrator`, then export the markdown report only.

Expected terrain proof:

- stable Evidence host: `8 / 8 PANNEAUX · 8 HYDRATÉ(S)`
- visible panel: `G3 · CAPTURE T0 PROSPECTIVE · 40.6.206`
- visible control: `CAPTURER LE PROCHAIN CYCLE PAPER`

No operator click should be requested until those visible strings survive in the exported report.
