# Agent-Crypto Administrator 40.6.547 — Fiche Crypto Latérale Pointer Restore

Parent: 40.6.546  
Market Core: 38.15.11 — protected / unchanged  
Scope: Fiche Crypto Flottante ↔ Latérale interaction only.

## Terrain proof inherited from 40.6.546

40.6.546 passed the New Listings logo objective in Firefox:

- verified identities 5/5;
- logos 5;
- GitHub 5/5;
- five logos visibly rendered.

The remaining failure is independent: the Fiche Crypto displays the historical **Flottante / Latérale** controls, but **Latérale is not operable**.

## Root cause

The shared help stylesheet currently declares:

`#atlasHelpLayer.atlas-help-layer { pointer-events:none; }`

The Crypto Card restore in `style.css` declared:

`.atlas-help-layer[data-market-help-coin-id]:not([hidden]) { pointer-events:auto; }`

The ID selector in `help-layer.css` has higher CSS specificity than the class/attribute-only selector in `style.css`. Result: the Fiche Crypto is visibly rendered, but pointer input does not reach its buttons. The native JavaScript click owner therefore never receives **Latérale**.

This precisely matches Firefox terrain: visible controls, no effective Latérale action.

## 40.6.547 correction

No new dock is created and `app.js` is not functionally modified.

The existing interactive override is restored at the correct specificity:

`#atlasHelpLayer.atlas-help-layer[data-market-help-coin-id]:not([hidden]) { pointer-events:auto; }`

The canonical stylesheet is also cache-busted to:

`./style.css?v=40.6.547`

so Firefox cannot keep an older selector cascade.

## Historical contract preserved

- 28.3.46 — Flottante / Latérale + preference;
- 28.3.47 — adaptive dock with Market >= 980 px and card >= 320 px;
- 28.3.48 — sticky, viewport-bounded height, internal scroll, selected-asset persistence;
- 40.1.2 — CSS-only restoration principle.

Existing runtime owners remain:

- `atlasMarketCardDockAvailability()`;
- `atlasMarketCardDockHost()`;
- `atlasRenderMarketCardDock()`;
- `atlasRefreshMarketCardSurface()`;
- `atlasSetMarketCardMode()`.

## Explicitly unchanged

- New Listings discovery and identities;
- 40.6.546 logos;
- prices / 24 h / volume;
- Graphique / Bougies / Profondeur / Lecture Technique;
- Math Core logic;
- Oracle / Strategy / Aether / Web Classique;
- Market Core 38.15.11;
- no new timer, observer, storage owner, private API, order or wallet path.

## Firefox proof required

1. Ctrl+F5.
2. Confirm `Build 40.6.547 · Administrator`.
3. Open a Fiche Crypto.
4. Click **Latérale**.
5. Verify the Fiche leaves the floating layer and becomes a real right-side dock.
6. With Math Core reduced: **Market | Fiche 320–390 px | Math rail**.
7. Verify sticky + internal scroll.
8. Click **Flottante** and confirm the same Fiche returns to floating mode.
9. Repeat **Latérale → Flottante** once.

Status: PENDING FIREFOX.
