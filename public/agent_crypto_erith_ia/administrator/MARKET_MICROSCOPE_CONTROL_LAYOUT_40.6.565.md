# Agent-Crypto Administrator 40.6.565 — MARKET MICROSCOPE · CONTROL LAYOUT + VIEW CONTINUITY

Parent: **40.6.564**  
Market Core: **38.15.11 — protected / unchanged**

## Why this build

Firefox screenshots confirmed that no indicator option had been removed. The apparent loss came from the interval controls (1m / 5m / 15m / 1h / 4h / 1j / reset / refresh) wrapping underneath the indicator row when the available width tightened.

40.6.565 is therefore a bounded presentation and continuity repair. It does not alter the candle transport, OHLC validation, indicator formulas, Market Core, Lecture Technique, Profondeur, Strategy A, Oracle, Aether or New Listings business logic.

## Repairs

### 1. Stable control geometry

The Market Microscope now renders two explicit control groups:

- **INDICATEURS** — MA / EMA / S/R / SUPER / BOLL / SAR / VWAP / VP
- **INTERVALLE** — 1m / 5m / 15m / 1h / 4h / 1j / reset / refresh

The two groups no longer share a wrapping flex row. Interval buttons cannot silently migrate underneath the indicator controls.

### 2. Inspector and legend clearance

The candle inspector and series legend are moved down to account for the stable two-row control header, preserving graph readability without changing plot formulas.

### 3. Idempotent mount across views

If a view transition changes the canonical host, the existing Microscope control node and chart root are reattached to their canonical parents instead of leaving stale nodes under an old host.

### 4. Layout refresh without data fetch

Firefox resize and the existing view-presentation events trigger only a mount/sync/redraw cycle.

No candle fetch is introduced solely by:
- resize;
- Classique / Intermédiaire / Administrateur presentation changes.

The loaded series, interval and current in-memory state stay attached to the same Microscope runtime.

## Deliberately not added

- no new storage owner;
- no persistence of Ligne/Bougies across F5;
- no persistence of interval across F5;
- no indicator formula changes;
- no overlay auto-scale changes yet.

The eight indicator state booleans continue to use the existing stable owner:
`agentCrypto.marketMicroscope.indicators.v1`.

## Firefox terrain proof

1. Enable all eight indicators.
2. Verify **INDICATEURS** remains one dedicated row.
3. Verify **INTERVALLE** remains one separate row and never wraps underneath indicators.
4. Change 5m → 15m → 1h.
5. Switch Classique → Intermédiaire → Administrateur → Classique.
6. Confirm the selected interval and loaded series remain intact across view changes.
7. Confirm no data request occurs solely because of a view transition or resize.
8. Confirm Backend 8790 transport truth from 40.6.564 remains unchanged.
9. Confirm Lecture Technique and Profondeur remain unchanged.

Terrain remains **PENDING Firefox** until operator validation.
