# Agent-Crypto 40.6.500 — OKX Local Backend Transport

## Terrain failure being repaired
Firefox on GitHub Pages loaded the 40.6.498 Candles UI and the 40.6.499 Microstructure UI, but direct browser requests to OKX returned `NetworkError when attempting to fetch resource`.

## Repair
40.6.500 adds one bounded browser transport owner:

- `js/okx-local-backend-transport-406500.js`

It rewrites only these read-only OKX public market GETs:

- `/api/v5/market/candles`
- `/api/v5/market/ticker`
- `/api/v5/market/books`
- `/api/v5/market/books-rpi`
- `/api/v5/market/trades`

to the local Private Backend route:

- `http://127.0.0.1:8790/okx-public`

The 40.6.498 and 40.6.499 feature owners remain unchanged.

## Required local companion
Aether Control **2.3.2R19**:

- Bridge: **V1.9.13 unchanged**, port 8787.
- Private Backend: **V1.4.4**, port 8790.
- New backend capability: allowlisted read-only OKX public proxy for the five market endpoints above.
- No API key, private exchange API, wallet, order or withdrawal endpoint.

## Protected
No change to:

- Market Core 38.15.11
- native Prix / Base 100
- Strategy thresholds / Cost Gate / Risk Governor
- Oracle Math
- Atlas CURRENT
- Aether
- Lecture Technique
- Web Classique

## Terrain proof required
1. Stop R18 services, quit R18, launch R19.
2. Confirm Bridge 8787 READY and Private Backend 8790 READY / V1.4.4.
3. Firefox → Administrator → Ctrl+F5.
4. Graphique → Bougies → 15m: candles must load; no browser OKX NetworkError.
5. Profondeur: open once; verify bid/ask, spread, books/RPI/trades (or explicit partial status if an upstream component is unavailable).
6. Switch EUR → USD: display route may use BTC-USDC, while EXEC remains BTC-EUR and SETTLE EUR.
7. Return to Ligne / Prix / Base 100 and confirm native surfaces remain intact.

Terrain remains pending until this Ryzen/Firefox proof is supplied.
