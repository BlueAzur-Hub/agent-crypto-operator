# Agent-Crypto 40.6.528 — New Listings Radar V1

Parent: **40.6.527**  
Market Core: **38.15.11 protected**

## Purpose

Turn **Nouveaux listings** into a permanent discovery domain independent from Top 1000 ranking.

A very recent asset may be absent from the normal Market universe. The Radar therefore keeps a separate, read-only registry and never forces a candidate into `state.coins` or the ranking.

## Search contract

The Radar searches its tracked registry by:

- canonical name;
- canonical id;
- ticker;
- exchange pair;
- exchange name.

Ticker alone is never treated as a unique identity.

Canonical identity must converge on:

`name + canonical id + ticker + exchange provenance + pair`

## First terrain case

**Concrete (CT)** remains the first tracked case.

Verified pairs retained from 40.6.527:

- OKX Europe: CT/USD
- OKX Europe: CT/EUR
- OKX: CT/USDT
- MEXC: CT/USDC
- MEXC: CT/USDT

No OKX CT/USDC claim is made.

## UX

- Market chip renamed to **Nouveaux listings**.
- Dedicated Radar search field.
- Age filters: <24 h, 1–3 d, 4–7 d, 8–30 d.
- Unknown query can be routed to **Recherche Web externe**.
- Web Research remains voluntary and performs zero automatic ingestion.
- Existing **Chercher dans Market** remains a secondary check only; zero result is allowed.

## Safety

40.6.528 does not:

- mutate Market Core 38.15.11;
- inject assets into Top 1000;
- fabricate price;
- add storage writes;
- add timers or observers;
- alter Strategy;
- place orders;
- touch wallet/private exchange APIs.

## Firefox terrain proof

1. Ctrl+F5 and confirm Build 40.6.528.
2. Market → **Nouveaux listings**.
3. Search **Concrete** → one Radar result.
4. Search **CT/USDC** → Concrete result.
5. Search **MEXC** → Concrete result.
6. Select **4–7 j** → Concrete should remain visible on 04/10/2026.
7. Confirm the warning that ticker CT is not unique.
8. Search an unknown ticker → zero Radar result + **Recherche Web externe**.
9. Confirm normal Market Top 1000 is not mutated.
