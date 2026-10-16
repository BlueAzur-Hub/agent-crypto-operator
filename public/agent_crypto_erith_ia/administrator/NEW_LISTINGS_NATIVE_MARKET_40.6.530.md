# Agent-Crypto 40.6.530 — New Listings · Native Market Integration

Parent: **40.6.529**  
Market Core: **38.15.11 protected**

## Product correction

40.6.529 proved that recent assets such as Concrete (CT) can be discovered and can expose real market data. Its visible **Live Asset Pipeline** UX is rejected.

40.6.530 restores the requested product model:

`Market actuel + source Nouveaux listings → même Fiche → même Graphique Ligne → mêmes Bougies → même Profondeur`

No second graph, no second Fiche, no second depth window.

## Native Market behavior

- Typing **CT** in the existing Market search adds **Concrete (CT)** as a native-styled Market row.
- The existing **Nouveaux listings** button becomes a Market source/filter instead of opening the 40.6.528/529 workspace.
- Concrete remains outside `state.coins` and outside ranking.
- The global `AtlasMarketUniverse1000.find()` public resolver is extended ephemerally so existing Fiche presentation owners can resolve the external asset without mutating Market Core.

## Concrete terrain contract

Canonical identity:
- name: Concrete
- ticker: CT
- CoinGecko id: `concrete`
- listing date: 2026-09-30
- native line source: CoinGecko canonical history
- explicit spot display: CoinGecko USD/EUR
- candles/depth context: OKX **CT/USDT**
- known verified listing pairs retained: OKX CT/USDT, Bitget CT/USDT, MEXC CT/USDC

USD is not relabelled from USDT. CoinGecko provides explicit USD for display; OKX CT/USDT remains the real exchange instrument for candles/depth.

## Existing owners reused

### Fiche
Uses the existing Market/Fiche surfaces and the existing 40.6.525 USD projection owner.

### Graphique Ligne
Uses the pre-existing `AtlasExternalChart` owner already embedded in `app.js` and therefore the same main chart canvas, period buttons, volume/legend presentation and native graph controls.

### Bougies
Uses `js/market-microscope-candles-406498.js`, but only when the operator selects **Bougies**. 40.6.529 incorrectly forced the microscope surface while Ligne was active; 40.6.530 removes that behavior.

### Profondeur
Uses the existing `js/okx-microstructure-406499.js` window. The 40.6.529 `CT/[OBJECT OBJECT]` defect was traced to a data-contract bug: live ticker data overwrote the context's `quote: "USDT"`. 40.6.530 stores ticker data under `marketTicker` and preserves `quote` as the currency string.

## Safety / ownership

No:
- `state.coins` injection
- ranking mutation
- Market Core modification
- duplicate graph
- duplicate Fiche
- duplicate depth window
- Strategy mutation
- order / wallet / private API
- storage owner
- recurring timer
- MutationObserver

## Firefox terrain proof

1. Ctrl+F5 → **Build 40.6.530**.
2. Leave Market in its normal interface.
3. Type **CT** in the existing search.
4. A native-styled **Concrete · CT · Nouveau listing** row must appear.
5. Hover/focus it → existing Fiche surface must resolve Concrete.
6. Click row/Solo → **existing Graphique Ligne** must show Concrete, not a second NEW LISTING graph.
7. Click **Bougies** → existing candle surface must show CT/USDT with real OHLCV.
8. Return **Ligne** → the candle overlay must close and the existing main line graph must remain.
9. Open **Profondeur** → existing depth window must show **CT/USDT**, never `[OBJECT OBJECT]`.
10. Click BTC (or another canonical Market row) → external CT context must clear and normal Market behavior must return.
11. Click **Nouveaux listings** → results must be injected into Market; the old Radar/Live Asset Pipeline panel must not open.
