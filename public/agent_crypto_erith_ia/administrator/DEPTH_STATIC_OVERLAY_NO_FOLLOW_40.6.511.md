# Agent-Crypto 40.6.511 — Depth Static Overlay · No Follow Loop

## Terrain source

Firefox 40.6.510 confirmed the data-truth repair:
- Build 40.6.510 loaded;
- BTC FRESH visible;
- source and receive times visible;
- ETH/EUR loaded with dynamic `ETH / Cumul ETH` columns;
- STALE state visible;
- BNB/EUR loaded with dynamic BNB columns.

A separate UI problem remained: while docked, **Profondeur chased Lecture Technique when the Administrator layout moved**, briefly blocking the interface before disappearing/repositioning.

## Root cause

The behavior came from 40.6.507.

Depth was correctly made an independent `document.body` portal in 40.6.506, but 40.6.507 added an "exact dock" mechanism:

- `dockSyncTimer`;
- `setInterval(..., 180 ms)`;
- continuous `#detailPanel.getBoundingClientRect()`;
- scroll → `applyDockRect()`;
- docked resize → `applyDockRect()`.

This turned a visual overlay into a follower.

## 40.6.511 correction

The portal architecture is preserved.

### Docked mode

- opening Profondeur reads the Lecture Technique rectangle **once**;
- the body-level Depth surface is placed over that rectangle;
- after placement it remains fixed;
- no periodic dock timer exists;
- no scroll-follow handler exists;
- ordinary Administrator layout movement does not reposition Depth.

### Redock

The native `□` control redocks by performing **one new snap** to the current Lecture Technique rectangle.

### Detached mode

The native `⠿` move control still detaches and moves **Depth only**.

Controls remain:

`⠿ — □ ⤢ ×`

## Preserved from 40.6.510

- FRESH / STALE / OFFLINE / UNKNOWN;
- source timestamp truth;
- requested asset / pair / EUR validation;
- dynamic BTC/ETH/BNB/etc. columns;
- old-level protection;
- live orderbook polling every 2 s while open.

## Protected

- Market Core **38.15.11**
- Graphique / Bougies
- Strategy / Cost Gate
- Oracle / Aether
- Lecture Technique logic
- Backend **1.4.4**
- Bridge **1.9.13**
- no private API / wallet / real order

## Firefox terrain test

1. Ctrl+F5 and confirm **Build 40.6.511 · Administrator**.
2. Open Profondeur.
3. Confirm it overlays Lecture Technique in the expected zone.
4. Change market/view/layout several times: **Depth must not chase the moving interface**.
5. Scroll: Depth must not chase Lecture Technique.
6. Use `⠿`: only Depth moves.
7. Use `□`: one-shot redock over the current Lecture Technique position.
8. Recheck FRESH/STALE and ETH/BNB dynamic columns.

## Next

After terrain PASS:
**40.6.512 — OKX LOCAL TRANSPORT ABORT SIGNAL**.
