# Agent-Crypto 40.6.540 — NEW LISTINGS · SAFE RADAR

Parent: **40.6.539**  
Market Core: **38.15.11 — protected / unchanged**

## Destination

Make **Nouveaux listings** actively search again without repeating the 40.6.537 OKX `listTime` mistake.

40.6.540 keeps one proven discovery source:

- **Bitget SPOT instruments `launchTime`**
- window: **<= 30 days**
- no OKX `listTime`
- no second exchange added yet

The category refreshes discovery when reopened, with a **15 s cooldown** to avoid request spam.

## Evidence gates

Every discovered instrument gets a bounded proof state:

### CONFIRMÉ
Requires all three:
1. valid exchange `launchTime` inside the <=30 d window;
2. live price available;
3. positive 24 h turnover / volume available.

### CANDIDAT
The exchange listing exists, but one of the market proofs above is incomplete.

A candidate is visible as a candidate. It is never silently promoted to confirmed.

## Age bands

- `<24 h`
- `1–3 j`
- `4–7 j`
- `8–30 j`

Exact age remains visible.

## Identity + logo resilience

40.6.539 showed that the last CoinGecko identity calls could be rate-limited while earlier calls succeeded.

40.6.540 changes only the identity fetch scheduling:

- sequential requests instead of five simultaneous requests;
- bounded retries: 0 ms / 320 ms / 900 ms;
- failed identity is not cached forever;
- short 8 s failure TTL only;
- later category refresh may retry;
- identity failure never removes price / 24 h / volume.

This specifically gives **PONS** and **CNPY** another chance to load their verified CoinGecko logos without weakening identity proof.

## Explicitly protected

- price pipeline from 40.6.539;
- CT -> OKX CT/USDT analysis route;
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
- no recurring timer;
- no MutationObserver;
- no wallet / private API / real order.

## Firefox terrain proof

1. Ctrl+F5 -> **Build 40.6.540 · Administrator**.
2. Open **Nouveaux listings**.
3. Same valid prices / 24 h / volumes as 40.6.539.
4. Market note reports:
   - confirmed count;
   - candidate count;
   - identity count;
   - logo count.
5. Rows show **Nouveau confirmé** or **Candidat** plus an age band.
6. Close / reopen after >15 s -> fresh Bitget discovery.
7. Confirm PONS / CNPY logos can recover if CoinGecko responds.
8. Select CT -> Graphique.
9. **Réinit.** -> BTC · Solo · 24 h.

PASS -> freeze 40.6.540.
