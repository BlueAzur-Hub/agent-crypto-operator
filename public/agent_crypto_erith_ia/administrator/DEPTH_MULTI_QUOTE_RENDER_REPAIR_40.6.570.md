# Agent-Crypto 40.6.570 — Depth Multi-Quote Render Repair

Parent: **40.6.569**
Market Core: **38.15.11 — protected**
Scope: **Profondeur tab render only**

## Terrain symptom

When the independent OKX Carnet/Profondeur surface is open, clicking **Profondeur** correctly activates the tab (cyan) but the depth view does not render; the existing Carnet remains visible.

The 40.6.513 dock/window contract is not the defect:
- independent `document.body` portal;
- docked visually over Lecture Technique;
- detached window movable independently;
- native controls `⠿ — □ ⤢ ×`;
- no 180 ms dock-follow loop.

## Root cause

40.6.521 migrated quote display from the EUR-only formatter `eur()` to the multi-quote formatter `quoteAmount()` for EUR / USDC / USDT.

`renderDepth()` retained two stale calls:

```js
eur(bid)
eur(ask)
```

The helper `eur()` no longer exists, so selecting the Profondeur tab throws a `ReferenceError` and aborts the render after the active tab state has already changed.

## Repair

Only the stale depth-band formatting is changed:

```diff
- <b>${eur(bid)} / ${eur(ask)}</b>
+ <b>${quoteAmount(bid)} / ${quoteAmount(ask)}</b>
```

The formatter already uses `state.quote`:
- EUR → EUR amount;
- USDC → USDC amount;
- USDT → USDT amount;
- stablecoins are never relabelled USD.

## Protected / unchanged

- Market Core 38.15.11;
- 40.6.513 Profondeur dock/detach/drag geometry;
- Lecture Technique;
- Graphique / Bougies formulas and data path;
- Market;
- Math Core;
- FRESH / STALE / OFFLINE / UNKNOWN logic;
- Backend 1.4.4;
- Bridge 1.9.13;
- OKX transport;
- Strategy A / Evidence;
- Oracle / Aether;
- no private API;
- no order;
- no wallet;
- no new timer, observer, or storage owner.

## Static proof

The stable Depth current guard requires:
- JavaScript syntax success;
- no remaining `eur(...)` call in the owner;
- `renderDepth()` uses `quoteAmount(bid)` and `quoteAmount(ask)`;
- bands remain ±5 / ±10 / ±25 bp;
- current build/cache token truth remains aligned.

## Firefox terrain proof required

1. Hard refresh and confirm **Build 40.6.570 · Administrator**.
2. Open **Profondeur**.
3. Click **Profondeur** tab:
   - tab cyan;
   - ±5 / ±10 / ±25 bp rows visible.
4. Return **Carnet**, then **Profondeur** again.
5. In USD display, verify the actual quote remains **USDC** (or USDT fallback), not fake USD.
6. Detach and move Profondeur; redock it; the 40.6.513 behavior must be unchanged.

Terrain status at publication: **PENDING FIREFOX**.
