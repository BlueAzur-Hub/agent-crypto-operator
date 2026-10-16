# Agent-Crypto Administrator 40.6.112 — Local Dialogue Presentation V2

Parent: **40.6.111**  
Market Core: **38.15.11 — unchanged**

## Mission

Finish the visual/readability work originally requested for the local Atlas/Aerith dialogue without changing the analytical pipeline.

The 40.6.108 presentation layer was conceptually correct but selected the target surface through phrases that later changed. On 40.6.111 the runtime is analytically healthy while the user can still see the plain line `Dialogue local prêt avec gpt-oss:20b-32k.` and a long, undersized provenance sentence.

40.6.112 introduces the stable canonical presentation owner:

`js/local-dialogue-presentation.js`

Git carries its implementation history. The active functional filename does not carry a Build suffix.

## Presentation changes

- add a compact Atlas local-status card next to the existing Dialogue local surface;
- show Atlas report progress, a real meter, and the six stages Marché → Top 5 → Math → Contradictions → NØX → Aerith;
- show `CURRENT VALIDÉ` / `REPOS` when the analytical chain is already closed;
- keep the Ollama model as secondary information rather than the main visual status;
- replace the small provenance sentence with a readable analytical provenance card;
- separate **Snapshot marché** from **CURRENT produit** explicitly;
- preserve Bridge validation, report count, Ryzen source and read-only semantics.

## Ownership

The existing 40.6.108 file remains historical. The canonical active owner for this presentation is now:

`js/local-dialogue-presentation.js`

The historical compatibility bootstrap loads that owner only once Version Truth has resolved Build 40.6.112 or newer. It still owns no global Build/version truth.

## Protections

No Market Core change. No Web Classic change. No Atlas CURRENT algorithm change. No Aether state change. No Oracle change. No Lecture Technique change. No Strategy A/TRADUS change. No Bridge protocol change. No Ollama configuration change. No wallet, order, recurring timer, MutationObserver, storage owner or market-data request.

## Acceptance

- 3/4 Atlas state parses as 75%;
- completed Atlas 4/4 + NØX + Aerith + REPOS renders 100%;
- snapshot market time and CURRENT completion time remain distinct;
- Bridge validation and report count remain visible;
- Firefox terrain review required after Pages propagation.
