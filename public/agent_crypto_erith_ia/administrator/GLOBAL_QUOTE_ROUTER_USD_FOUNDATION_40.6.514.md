# Agent-Crypto 40.6.514 — Global Quote Router · USD Foundation

Parent: **40.6.513**  
Market Core: **38.15.11 — protected**

## Destination

USD becomes the default **display** currency for the Graphique/Fiche foundation while execution and settlement remain explicitly separated:

- DISPLAY = USD by default;
- EXEC = BTC-EUR unchanged;
- SETTLE = EUR unchanged;
- EUR remains available from the existing selector.

## Source Truth

No new external market API is introduced.

The router reads the existing same-origin public snapshot at `../data/crypto/latest.json`.

That snapshot already carries:

- native CoinGecko quote = USD;
- `coins[].priceUsd`;
- EUR values derived from the existing ECB FX layer;
- `fx.usd_per_eur` and `fx.eur_per_usd`;
- source date and snapshot identity.

For the existing canonical chart, 40.6.514 preserves its EUR series and derives USD display values with the published ECB USD/EUR factor. Returning to EUR restores the exact original runtime chart data. Base100 stays unitless.

## Scope

Changed presentation/routing only:

- quote selector default;
- main Graphique price datasets, axis and tooltip;
- chart insight truth;
- compact Fiche price label/value;
- workspace/caption currency truth;
- version/build delivery.

## Protected

Unchanged:

- Market Core 38.15.11;
- Strategy A business logic and gates;
- Oracle math/prediction logic;
- Aether business logic;
- Lecture Technique logic;
- Profondeur 40.6.513 geometry and EUR-native validation contract;
- Backend / Bridge;
- wallet, API keys and real orders;
- storage schema.

## Firefox proof required

1. Ctrl+F5 and confirm **Build 40.6.514**.
2. Confirm **USD** is active at boot and the truth line still reads **EXEC BTC-EUR · SETTLE EUR**.
3. Graphique Prix: axis/tooltip/summary/Fiche must show USD.
4. Compare a visible value against EUR × the published ECB USD/EUR factor.
5. Click EUR: exact native EUR display must return.
6. Click USD again; change period/Solo/Top and confirm USD is reapplied.
7. Base100 must stay unitless.
8. Profondeur must keep the validated 40.6.513 geometry and its native EUR truth.
9. Oracle / Strategy / Aether / Market Core must remain unchanged.

## Stop

Do not widen coverage to Oracle/Market/Aether before the Firefox matrix above passes.
