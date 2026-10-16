# Agent-Crypto 40.6.571 — Workspace Memory Currency Label Sync

Parent: **40.6.570**  
Market Core: **38.15.11 — protected**  
Scope: **ESPACE MÉMORISÉ display-currency label only**

## Firefox proof inherited from 40.6.570

The operator screenshot on 06/10/2026 confirms the repaired Profondeur surface renders correctly:
- Profondeur tab active;
- ±5 / ±10 / ±25 bp visible;
- USDC BID / ASK depth amounts visible;
- source status FRESH.

40.6.570 is therefore recorded as terrain PASS for the repaired Depth render.

## Defect

The current graph is displayed in USD, but the bottom workspace-memory strip still says:

`Solo · 24h · Prix EUR · Normale · BTC`

The cause is local and explicit: `atlasWorkspaceRenderStrip()` in `administrator/app.js` hardcodes `Prix EUR`.

## Repair

The workspace strip now reads the canonical display currency from:

`AgentCryptoQuoteCurrencyArchitecture.snapshot().displayCurrency`

Result:
- USD display → **Prix USD**
- EUR display → **Prix EUR**
- Base 100 → unchanged

The strip also rerenders on the existing `agent-crypto:quote-architecture-changed` event.

## Protected / unchanged

- Profondeur 40.6.570 repair;
- Profondeur dock/detach/drag contract 40.6.513;
- Market Core 38.15.11;
- Graph data and indicator math;
- Bougies logic;
- Lecture Technique;
- Market;
- Math Core;
- Backend 1.4.4;
- Bridge 1.9.13;
- OKX transport;
- execution instrument and settlement asset;
- no stablecoin relabel to USD;
- no new storage owner;
- no new recurring timer;
- no MutationObserver;
- no order;
- no wallet.

## Firefox terrain proof required

1. Confirm **Build 40.6.571 · Administrator**.
2. With USD active, bottom strip must show **Prix USD**.
3. Switch to EUR: strip must show **Prix EUR**.
4. Switch back to USD: strip must return to **Prix USD**.
5. Profondeur must remain unchanged and functional.

Terrain status at publication: **PENDING FIREFOX**.
