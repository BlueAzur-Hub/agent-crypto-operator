# SEVEN HANDOFF — Agent-Crypto 40.6.522

Build: **40.6.522**
Release: **USD DEFAULT DISPLAY · OWNER CHAIN COMPLETE**
Parent: **40.6.521**

## Destination implemented

The requested presentation chain is now wired so Administrator starts in **USD**.

Existing owners keep their own data truth:
- Graphique: USD source.
- Market/Fiche: USD fields.
- Oracle/Aether/Lecture: USD presentation.
- Bougies: USDC instrument under USD display.
- Profondeur: USDC / USDT native orderbook.
- EUR remains available.

## Invariants

DISPLAY USD does not mutate:
- ANALYSIS EUR;
- EXEC BTC-EUR;
- SETTLE EUR.

Stablecoins are never relabelled USD.

## Terrain

The code/CI destination is complete but Firefox terrain proof remains required.

Required final proof:
USD boot → inspect Graphique + Oracle + Market + Bougies + Profondeur → switch EUR → verify clean round-trip.

If that passes, freeze the USD migration.
