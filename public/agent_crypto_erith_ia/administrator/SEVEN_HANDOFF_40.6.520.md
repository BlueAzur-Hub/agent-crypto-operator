# SEVEN HANDOFF — Agent-Crypto Administrator 40.6.520

Build: **40.6.520**
Release: **GRAPH NATIVE USD SOURCE · CURRENCY-AWARE CACHE/CONTEXT**
Parent: **40.6.519**

## Migrated in this build

Graphique only:
- native USD historical source;
- USD-isolated chart cache;
- USD-isolated render context;
- USD price axes;
- USD tooltip;
- USD single-series caption;
- explicit USD 24 h endpoint.

## Preserved

DISPLAY default remains EUR.
ANALYSIS remains EUR.
EXEC remains BTC-EUR.
SETTLE remains EUR.

Market/Fiche 40.6.518 and Oracle/Aether 40.6.519 stay intact.
Bougies and Profondeur are not migrated by this build.

## Source truth

DISPLAY USD does not reuse Binance EUR history.
It requests CoinGecko historical prices directly with vs_currency=usd.
USDC and USDT remain distinct instruments and are never renamed USD.

## Firefox gate

40.6.520 is **PENDING FIREFOX**.
Required proof: EUR → USD → EUR round-trip, single graph + comparison + multiple periods, with no cross-currency cache contamination.

## Next owner after Firefox PASS

**OKX / Profondeur multi-quote contract.**

Current 40.6.513 Profondeur still validates EUR only, so it must be migrated as its own owner with source truth preserved.
