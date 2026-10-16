# Agent-Crypto 40.6.527 — New Listings Navigator · Concrete / CT

Parent: **40.6.526**  
Market Core: **38.15.11 protected**

## Purpose

Make the very recent Concrete (CT) listing discoverable from Market without lying about
rank, quote currency or local data support.

## Pair truth

Verified listing announcements:

- OKX Europe: **CT/USD**
- OKX Europe: **CT/EUR**
- OKX: **CT/USDT**
- MEXC: **CT/USDC**
- MEXC: **CT/USDT**

There is deliberately **no OKX CT/USDC claim**.

## Architecture

A new read-only Market chip opens an isolated listing card.

It does not:
- inject CT into state.coins;
- change Core 250 / Extended 1000 ranking;
- fabricate a price;
- call an exchange/private API;
- place orders.

If the canonical Market universe later contains CoinGecko id `concrete`, the panel may
display that already-loaded price. Otherwise it states that live price is not loaded.

The action "Rechercher CT dans Market" asks the existing Market 1000 search to find
`concrete`; failure leaves the listing card intact and honest.
