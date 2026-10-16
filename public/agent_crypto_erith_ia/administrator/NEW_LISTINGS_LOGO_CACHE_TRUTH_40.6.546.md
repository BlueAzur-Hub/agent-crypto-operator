# Agent-Crypto Administrator 40.6.546 — New Listings Logo Cache Truth

Parent: 40.6.545  
Market Core: 38.15.11 — protected / unchanged  
Scope: New Listings logos only.

## Terrain failure inherited from 40.6.545

Firefox operator proof showed:

- verified identities: 5/5;
- GitHub identity hits: 5/5;
- visible logos: 0;
- New Listings discovery, prices, 24 h and volumes remained present;
- Fiche Latérale is a separate failed responsibility and is intentionally not modified in this build.

## Root cause targeted

The identity registry kept the stable URL `./data/new-listings-identities.json` and was fetched with `cache:"force-cache"`.

40.6.543 had used embedded `data:image/png;base64` logo payloads. 40.6.544 changed the registry to GitHub PNG paths. Firefox could therefore reuse an older registry representation while the newer runtime applied `safeIdentityImage()`, producing the observed state: identity known, GitHub hit counted, image rejected / absent.

## 40.6.546 correction

Only the identity-registry delivery path changes:

- runtime module version → 40.6.546;
- registry URL → `./data/new-listings-identities.json?v=40.6.546`;
- registry fetch → `cache:"no-store"`;
- registry metadata version → 40.6.546;
- existing verified GitHub PNG assets are preserved unchanged.

## Explicitly unchanged

- dynamic Bitget SPOT `launchTime` discovery ≤ 30 days;
- CONFIRMÉ / CANDIDAT gates;
- current New Listings set is not fixed to five assets;
- prices / 24 h / volume;
- Graphique / Bougies / Profondeur / Lecture Technique;
- Fiche Latérale;
- Oracle / Strategy / Aether / Web Classique;
- Market Core 38.15.11;
- no new timer, observer, storage owner, private API, order or wallet path.

## Firefox proof required

1. Ctrl+F5.
2. Confirm `Build 40.6.546 · Administrator`.
3. Open **Nouveaux listings**.
4. Current verified identities should report `GitHub 5/5 · logos 5` when the same five are discovered.
5. More importantly: the five corresponding logos must be visibly rendered.
6. Repeat Ctrl+F5 at least twice.
7. If visible logos remain stable, 40.6.546 passes.
8. Do not evaluate or repair Latérale in this build; that is the next isolated responsibility.

Status: PENDING FIREFOX.
