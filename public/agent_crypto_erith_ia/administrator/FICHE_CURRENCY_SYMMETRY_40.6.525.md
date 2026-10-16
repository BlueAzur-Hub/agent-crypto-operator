# Agent-Crypto 40.6.525 — Fiche USD De-dup + EUR Symmetry

Parent: **40.6.524**
Market Core: **38.15.11 — protected**
Scope: **FICHE CRYPTO presentation only**

## Firefox evidence

Two observations:

1. Under DISPLAY USD, FICHE CRYPTO showed the exact same BTC USD price twice:
   - Prix affichage USD
   - Prix USD marché

2. After returning to EUR, the two-metric card needed a deterministic symmetric restore rather than relying on one native writer plus one previously projected field.

The separate BTC/EUR Depth STALE 16 s warning later recovered by itself. Therefore Depth is not modified in 40.6.525 and its 15 s freshness rejection remains protected.

## 40.6.525 repair

USD:
- first metric: **Prix affichage USD** = explicit priceUsd
- second metric: **Source USD** = source + freshness
- Capitalisation / Volume remain explicit USD

EUR:
- first metric: **Prix direct EUR**
- second metric: **Prix USD marché**
- Capitalisation / Volume explicitly restore EUR

## Truth

No EUR→USD conversion.
No estimate.
No duplicate monetary value in USD mode.

## Protected

Unchanged:
- app.js
- Market Core 38.15.11
- Target Top + Market Flow 40.6.524 owner
- Depth 40.6.521 owner and 15 s freshness gate
- Graphique
- Oracle/Aether
- Bougies
- Strategy
- Backend / Bridge
- EXEC BTC-EUR
- SETTLE EUR

## Firefox test

1. Ctrl+F5 → Build 40.6.525.
2. DISPLAY USD:
   - open BTC Fiche;
   - one USD price only;
   - second box = Source USD + age;
   - cap/volume USD.
3. Click EUR:
   - Prix direct EUR;
   - Prix USD marché;
   - cap/volume EUR.
4. Repeat USD → EUR once more.
5. Confirm Target Top / Market Flow / Graph / Oracle / Depth remain unchanged.
