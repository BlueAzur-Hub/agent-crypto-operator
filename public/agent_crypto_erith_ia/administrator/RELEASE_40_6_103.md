# Agent-Crypto 40.6.103 — Generated Report Version Truth

Parent: 40.6.102  
Engine: Market Core 38.15.11 (unchanged)

## Reproduced defect

A current immutable Administrator entry can correctly identify itself as the loaded build while user-facing generated Markdown still prints the legacy parser-time release label captured by `app.js` (`Build 40.6.86 · Administrator`). The reproduced example is the automatic pedagogical journal shown in the Firefox/export snapshot supplied for 40.6.100.

The same legacy `ATLAS_RELEASE` value is also used by a small family of generated text builders. Rewriting the large legacy `app.js` or changing its protected `ATLAS_BUILD` constant would be disproportionate and could disturb analytical identity/fingerprint compatibility.

## Correction

40.6.103 adds a bounded read-side normalizer owned by Version Truth:

- new runtime patch: `js/generated-report-version-truth-406103.js`;
- loaded only for 40.6.103+ by the stable compatibility bootstrap after `js/version-truth-entry-authority-v3.js` is ready;
- current build authority is taken from `ErithVersionTruth`, immutable pathname, `ac-build`, then metadata fallback;
- six known Markdown/report builders are wrapped at call time so returned text replaces any stale `Build X.Y.Z · Administrator` label with the loaded immutable build;
- the already-rendered pedagogical journal is normalized once when the patch installs;
- legacy `ATLAS_BUILD = 40.6.86` is not changed;
- analytical fingerprints, CURRENT ownership, market data and business logic are not changed.

Target builders:

- `atlasMemoryIntelligenceMarkdown`
- `buildLearningJournalMarkdown`
- `buildMemoryReportMarkdown`
- `buildAutomaticLearningJournalMarkdown`
- `buildWakePlanText`
- `buildCollectionPlanMarkdown`

## Protected

- Market Core 38.15.11 unchanged.
- Web Classic unchanged.
- Graph/history unchanged.
- Aether unchanged.
- Atlas CURRENT unchanged.
- Oracle/Evidence/Math unchanged.
- Lecture Technique unchanged.
- Strategy A unchanged.
- Source Truth / DEX / CEX logic unchanged.
- No new recurring timer, observer, network owner, storage owner, wallet, order or trading endpoint.

## Acceptance

1. Immutable `index-40.6.103.html` loads as Build 40.6.103.
2. Generated pedagogical journal reports `Version : Build 40.6.103 · Administrator`.
3. The six bounded report builders normalize only generated release labels and preserve their remaining content.
4. Existing 40.6.102 footer late-writer protection remains active.
5. Version Truth Guard and Version Delivery Guard pass.
6. GitHub Pages publishes the same head.
7. Firefox terrain proof confirms the visible/generated journal no longer contains the stale 40.6.86 release label.
