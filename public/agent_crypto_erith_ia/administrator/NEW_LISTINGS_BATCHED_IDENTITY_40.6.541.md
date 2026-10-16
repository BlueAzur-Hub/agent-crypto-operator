# Agent-Crypto 40.6.541 — NEW LISTINGS · BATCHED IDENTITY

Parent: **40.6.540**  
Market Core: **38.15.11 — protected / unchanged**

## Terrain cause

40.6.540 proved the Safe Radar itself:

- 5 confirmed listings;
- 0 candidate;
- prices / 24 h / volume preserved;
- CT / MHA / MCAT identities loaded;
- PONS / CNPY remained without identity/logo on the observed Firefox run.

The failure is therefore isolated to the CoinGecko identity enrichment layer, not Bitget discovery and not the Market/Graphique pipeline.

## 40.6.541 correction

Primary identity path:

- one CoinGecko `/coins/markets` batch;
- `vs_currency=usd`;
- explicit canonical IDs only;
- exact CoinGecko ID + symbol proof still required;
- logo accepted only through the existing HTTPS CoinGecko host guard.

Only identities absent or invalid after the batch may enter the fallback path.

Fallback:

- starts only after **1200 ms**;
- individual `/coins/{id}` only for unresolved assets;
- bounded retries: **0 / 900 / 2200 ms**;
- failure remains non-blocking;
- no missing logo can remove an already valid listing, price, 24 h variation or volume.

## Diagnostics

The Market note now exposes batch count, fallback count and HTTP 429 when observed, so another identity failure is diagnosable instead of looking like a silent missing logo.

## Protected

Bitget `launchTime` discovery, evidence gates, CT -> OKX CT/USDT, Market Core 38.15.11, Market/Fiche, Graphique/Scanner, Bougies, Profondeur, Lecture Technique, Oracle, Strategy, Aether, Web Classique, storage ownership, wallet/order paths.

## Firefox proof

1. Ctrl+F5 -> **Build 40.6.541 · Administrator**.
2. Open **Nouveaux listings**.
3. Same five valid listings/prices/24 h/volumes as 40.6.540.
4. Target: **identités 5/5 · logos 5 · batch 1**.
5. Normal success should need **fallback 0**.
6. If fallback appears, it must concern only unresolved identities.
7. Select CT -> existing Graphique.
8. **Réinit.** -> BTC · Solo · 24 h.

PASS -> freeze identity before adding another discovery provider.
