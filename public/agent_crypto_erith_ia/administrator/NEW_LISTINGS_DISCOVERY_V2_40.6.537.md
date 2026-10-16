> **REJECTED FIREFOX 2026-10-05** — false OKX "new" classifications (BTC/ETH/USDC), missing ticker/price path, CT regression. Superseded by rollback **40.6.538**.

# Agent-Crypto 40.6.537 — NEW LISTINGS · LIVE DISCOVERY V2

Parent: **40.6.536**  
Market Core: **38.15.11 — protected / unchanged**

## Destination

Turn the existing **Nouveaux listings** Market category into an operator-triggered live discovery surface without creating a second workspace.

## What changes

- Every activation of **Nouveaux listings** performs a fresh discovery.
- Bitget remains an explicit source through SPOT instrument `launchTime`.
- OKX is added as a second best-effort discovery source through public SPOT instrument `listTime`.
- One source may fail without blanking results from the other source.
- The Market note exposes per-source status/count instead of hiding partial availability.
- Recent listings are classified into:
  - `<24 h`
  - `1–3 j`
  - `4–7 j`
  - `8–30 j`
- Pair duplication is reduced only **inside one provider/base identity**, with quote preference USDT → USDC → USD → EUR.
- Unknown tickers discovered on different exchanges remain separate until a canonical identity is proven.
- Concrete / CT keeps its validated analysis route through **OKX CT/USDT**.

## What does not change

- no `state.coins` injection;
- no fabricated rank;
- no second Graphique;
- no second Fiche;
- no second Profondeur;
- no recurring timer;
- no observer;
- no storage owner;
- no private exchange API;
- no wallet;
- no real order;
- Market Core 38.15.11 unchanged;
- Strategy, Oracle business logic, Aether, Web Classique unchanged.

## Existing contract preserved

`Nouveaux listings → actif → Graphique → Réinit. → BTC`

The discovery layer finds assets. It never becomes the graph owner.

## Firefox terrain proof

1. Ctrl+F5 and confirm **Build 40.6.537 · Administrator**.
2. Open **Nouveaux listings**.
3. Confirm a fresh search starts and the Market note reports **Bitget + OKX** status/count.
4. Confirm age badges use the new bands.
5. Close/reopen **Nouveaux listings** and confirm another live discovery is triggered.
6. Select one listing and open its existing Graphique.
7. Click **Réinit.** and confirm BTC · Solo · 24 h.
8. If OKX discovery is unavailable, Bitget results must remain visible and OKX must be reported unavailable rather than silently fabricated.

PASS → freeze 40.6.537.  
FAIL → isolate only the discovery/provider owner; do not reopen Graphique/Scanner/Market Core.
