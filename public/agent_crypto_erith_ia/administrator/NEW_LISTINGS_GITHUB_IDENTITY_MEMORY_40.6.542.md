# Agent-Crypto 40.6.542 — NEW LISTINGS · GITHUB IDENTITY MEMORY

Parent: **40.6.541**  
Market Core: **38.15.11 — protected / unchanged**

## Terrain cause

40.6.541 showed an intermittent identity path:

- one Firefox run: **identities 0/5 · logos 0 · batch 1 · fallback 15 · 5 network failures**;
- later, the same build loaded the five logos successfully without a code change.

Therefore the identities and rendering are not fundamentally broken. The fragile part is re-fetching quasi-static identity metadata at each page life.

## 40.6.542 correction

GitHub becomes the primary memory owner for the five already verified identities:

- CT / Concrete / `concrete`
- MHA / MAGNE.AI / `magic-hash`
- MCAT / MarsCat / `marscat-token`
- PONS / Pons / `pons`
- CNPY / Canopy / `canopy`

Canonical registry:

`data/new-listings-identities.json`

The registry stores:

- symbol;
- display name;
- canonical name;
- CoinGecko ID;
- verification state/date;
- embedded PNG logo data.

Normal startup path:

1. Bitget discovers the live listing.
2. GitHub registry supplies identity + logo.
3. Live price / 24 h / volume stay on their existing live pipeline.
4. No CoinGecko identity request is needed for these five known identities.

CoinGecko identity lookup remains only as a **single batch emergency path** for a known ID absent from the GitHub registry.

## Retry-storm removal

40.6.541 could produce 15 individual fallbacks after a failed batch.

40.6.542 removes that individual fallback loop.

Normal target:

- **GitHub 5/5**
- **identities 5/5**
- **logos 5**
- **CoinGecko identity calls 0**

## Explicitly protected

- Bitget `launchTime` discovery and <=30 day window;
- prices / 24 h / volume;
- CT -> OKX CT/USDT analysis route;
- Market Core 38.15.11;
- existing Market table and Fiche;
- Graphique / Scanner;
- Bougies;
- Profondeur;
- Lecture Technique;
- Oracle business logic;
- Strategy;
- Aether;
- Web Classique;
- no `state.coins` injection;
- no ranking mutation;
- no timer / MutationObserver;
- no localStorage or IndexedDB identity owner;
- no wallet / private API / real order.

## Firefox terrain proof

1. Ctrl+F5 -> **Build 40.6.542 · Administrator**.
2. Open **Nouveaux listings**.
3. Confirm the same live prices / 24 h / volumes as before.
4. Expected identity line: **identités 5/5 · logos 5 · GitHub 5/5**.
5. There should be no individual fallback counter.
6. Hover/open a row: Fiche Crypto must show the same logo.
7. Select CT -> existing Graphique.
8. **Réinit.** -> BTC · Solo · 24 h.

PASS -> GitHub identity memory becomes the stable owner; remote identity enrichment is reserved for genuinely new/unknown assets.
