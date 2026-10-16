# Agent-Crypto 40.6.543 — NEW LISTINGS · VALID LOGOS + FICHE DOCK STABILITY

Parent: **40.6.542**  
Market Core: **38.15.11 — protected / unchanged**

## Terrain defects reproduced from 40.6.542

### A. Logos

40.6.542 reported:

- identities 5/5;
- logos 5;
- GitHub 5/5.

But Firefox visibly rendered CT/MHA/MCAT while **PONS and CNPY remained blank**.

The registry counter only proved that five image strings existed. It did not prove that the embedded PNG payloads were decodable.

Binary inspection of the embedded PNG chunks showed invalid IDAT CRCs in the affected payload set. The GitHub identity architecture itself remains valid; the stored image payloads were the defect.

### B. Fiche Crypto Flottante / Latérale

The historical module `js/aether-role-visibility.js` still contained the 40.6.73 R5 foreground portal.

On every `pointerover`, `focusin`, `click` or `keydown`, an active Market Fiche was queued for promotion to:

- `document.body`;
- z-index 2147483647.

The native Fiche dock contract, however, uses:

- `data-market-card-mode="floating"`;
- `data-market-card-mode="dock"`;
- `#atlasMarketCardDockHost`;
- `.market-card-dock-active`.

Therefore a click on **Latérale** could correctly begin the dock transition, then the historical portal would re-parent the same Fiche back to `document.body` after the click. This explains the terrain symptom: the Fiche moved while the operator was trying to click the mode control.

## 40.6.543 correction

### GitHub logo payload integrity

The verified identity registry stays the primary owner:

`data/new-listings-identities.json`

The embedded logo payloads are repaired and the release guard now validates actual PNG structure / CRC instead of trusting a non-empty image string.

Expected visible set:

- CT;
- MHA;
- MCAT;
- PONS;
- CNPY.

### Native Fiche mode ownership restored

The historical body-top portal is now **dock-aware**.

When the native Fiche is docked:

- `#atlasMarketCardDockHost` is respected;
- `.market-card-dock-active` is respected;
- the portal does not append the Fiche back to `document.body`;
- the forced floating z-index is released.

Mode clicks are handled specially:

- **Latérale / dock** remains in the native dock;
- **Flottante / floating** keeps the existing body-tail foreground behavior.

No new Fiche owner is created.

## Explicitly protected

- Bitget discovery;
- prices / 24 h / volume;
- GitHub identity registry architecture;
- Market Core 38.15.11;
- Market table;
- Graphique / Scanner;
- Bougies;
- Profondeur;
- Lecture Technique;
- Oracle;
- Strategy;
- Aether business logic;
- Web Classique;
- storage;
- wallet/order paths.

## Firefox terrain proof

1. Ctrl+F5 -> **Build 40.6.543 · Administrator**.
2. Open **Nouveaux listings**.
3. Confirm **5 identities / 5 logos** and visually confirm all five icons, especially **PONS + CNPY**.
4. Open a Fiche Crypto.
5. Click **Latérale**.
6. The Fiche must stay docked and the Latérale control must not escape under the pointer.
7. Click **Flottante**.
8. The Fiche must return to floating mode.
9. Repeat **Flottante -> Latérale -> Flottante** once.
10. Select CT -> existing Graphique.
11. **Réinit.** -> BTC · Solo · 24 h.

PASS -> freeze logo payload integrity + Fiche native mode ownership.
