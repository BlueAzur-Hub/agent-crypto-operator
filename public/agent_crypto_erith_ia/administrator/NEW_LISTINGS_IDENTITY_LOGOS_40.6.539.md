# Agent-Crypto 40.6.539 — NEW LISTINGS · IDENTITY + LOGOS

Parent: **40.6.538**  
Market Core: **38.15.11 — protected / unchanged**

## Destination

Advance the validated New Listings category without reopening discovery, price, Graphique, Bougies or Profondeur.

40.6.539 adds only a bounded identity layer:

- explicit canonical CoinGecko IDs for the five currently known recent assets;
- exact CoinGecko id + symbol verification;
- logo propagation into the existing Market coin model;
- Market row logo rendering;
- existing Fiche Crypto and Graphique tooltip automatically reuse `coin.image`;
- identity status is visible in the New Listings note.

## Canonical mapping

- CT → `concrete`
- MHA → `magic-hash`
- MCAT → `marscat-token`
- PONS → `pons`
- CNPY → `canopy`

A logo is accepted only after:
1. the configured CoinGecko ID returns the same ID;
2. the returned symbol exactly matches the listing symbol;
3. the image URL is HTTPS and hosted on `coingecko.com` or a subdomain.

## Failure policy

Identity enrichment is **non-blocking**.

If CoinGecko metadata is unavailable or a proof fails:
- keep the Bitget listing;
- keep price / 24 h / volume;
- keep CT analysis route;
- do not invent a logo;
- do not change discovery.

## Explicitly unchanged

- Bitget SPOT `launchTime` discovery <= 30 days;
- CT → OKX CT/USDT analysis;
- Market Core 38.15.11;
- Graphique / Scanner;
- Bougies;
- Profondeur;
- Lecture Technique;
- Oracle business logic;
- Strategy;
- Aether;
- Web Classique;
- storage ownership;
- no timer;
- no observer;
- no wallet / private exchange API / real order.

## Firefox terrain proof

1. Ctrl+F5 → **Build 40.6.539 · Administrator**.
2. Open **Nouveaux listings**.
3. The same five validated listings and their prices / 24 h / volumes must remain.
4. Confirm identity counter + logo counter in the note.
5. Confirm logos when CoinGecko identity proof succeeds.
6. Hover / focus a listing → existing Fiche Crypto must reuse the same logo.
7. Select CT or another listing → existing Graphique; tooltip may reuse the same logo.
8. **Réinit.** → BTC · Solo · 24 h.

PASS → freeze 40.6.539.
