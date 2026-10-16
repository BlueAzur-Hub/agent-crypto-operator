# Agent-Crypto 40.6.529 — New Listings Live Asset Pipeline V1

Parent: **40.6.528**  
Market Core: **38.15.11 protected**

## Purpose

A very recent crypto may be absent from CoinGecko Top 1000 but still have a real SPOT market.

40.6.529 gives such an asset a **temporary external analysis context** without inserting it into `state.coins`, changing ranking, or pretending it belongs to Market Core.

The destination is:

`Nouveaux listings → Charger → Graphique Ligne → Bougies → Profondeur → Retour Market`

## Providers V1

### OKX public
- existing validated transport owner: `js/okx-local-backend-transport.js`
- candles and books remain read-only public market GETs
- Concrete terrain pair: **CT/USDT**

### Bitget public
- recent-listing discovery: `GET /api/v3/market/instruments?category=SPOT`
- uses `launchTime` to identify pairs launched in the last 30 days
- ticker probe: `GET /api/v3/market/tickers`
- candles: `GET /api/v3/market/candles`
- order book: `GET /api/v3/market/orderbook`

Bitget discovery is **operator-triggered only**. No background poller is added.

## Graphique / Bougies

The existing Market Microscope owner is reused.

Normal Market:
- Ligne = existing native Market graph
- Bougies = existing OKX path

Active New Listing:
- Ligne = close-price line from the selected provider's real candles
- Bougies = real OHLCV from the same selected provider
- same chart shell
- no second permanent graph owner
- no Top 1000 injection

## Profondeur

The existing depth window is reused.

When a New Listing context is active:
- requested asset/quote come from that context
- OKX or Bitget order book is normalized into the existing validated read-only contract
- source timestamp remains mandatory
- freshness / pair / asset / quote checks remain active

## Concrete terrain control

Verified project identity: **Concrete (CT)**.

Pipeline V1 offers:
- **OKX CT/USDT**
- **Bitget CT/USDT**

The previously verified MEXC **CT/USDC** remains visible in the Radar, but V1 does not use it as the primary depth source because the existing depth truth contract requires a usable source timestamp.

## Safety

40.6.529 does not:
- mutate Market Core 38.15.11;
- inject the New Listing into `state.coins`;
- alter ranking;
- alter Strategy;
- place orders;
- access wallet/private exchange APIs;
- create a storage owner;
- add a recurring timer;
- add a MutationObserver.

## Firefox terrain proof

1. Ctrl+F5 → confirm **Build 40.6.529**.
2. Market → **Nouveaux listings**.
3. In **LIVE ASSET PIPELINE**, click **Charger OKX** for Concrete.
4. Verify chart title becomes **NEW LISTING · LIGNE** and shows **CT-USDT**.
5. Click **Bougies** → real CT/USDT candles must load.
6. Open **Profondeur** → order book must show CT/USDT and provider OKX.
7. Return to **Ligne**.
8. Click **Retour Market** → the normal Market graph must return.
9. Back in Radar, click **Actualiser listings ≤30 j**.
10. Load one recent Bitget instrument and repeat Ligne / Bougies / Profondeur.
11. Confirm Top 1000 remains unchanged.
