# Agent-Crypto 40.6.545 — FICHE CRYPTO · RESTORE NATIVE LATÉRALE

Parent: **40.6.544**  
Scope: **Fiche Crypto Latérale only**.

## Restore means restore

The canonical implementation already exists in `administrator/app.js` and originates from:

- 28.3.46 — Flottante / Latérale;
- 28.3.47 — adaptive lateral availability;
- 28.3.48 — sticky + persistence + internal scroll;
- 40.1.2 — exact CSS dock restoration.

This build does not invent another dock.

## Regression removed

A later module, `js/aether-role-visibility.js`, added a second owner around the active Market Fiche:

- 40.6.73 R5 body-tail foreground portal;
- later 40.6.543 R6 dock-aware variant.

That second owner listened globally to pointer/focus/click/keydown and could still compete with the native app.js mode transition.

40.6.545 retires that competing portal completely.

The only owner of **Flottante / Latérale** is again the native `app.js` contract.

## Historical geometry kept

The existing `style.css` 40.1.2 restoration remains authoritative:

- Market >= 980 px;
- Fiche 320–390 px;
- right rail;
- sticky;
- viewport-bounded;
- internal scrolling;
- persisted mode;
- Math Core rail compatibility.

## Explicitly unchanged

- 40.6.544 crypto logo version;
- New Listings discovery;
- prices / 24 h / volume;
- Market Core 38.15.11;
- Graphique;
- Profondeur;
- Lecture Technique;
- Oracle;
- storage.

## Firefox proof

1. Open a Fiche Crypto.
2. Click **Latérale**.
3. The Fiche must dock at right and stay there.
4. The button remains reachable.
5. Width must be normal, not a thin crushed rail.
6. Scroll must stay inside the card if needed.
7. Click **Flottante** -> card returns floating.
8. Repeat **Latérale -> Flottante** once.
