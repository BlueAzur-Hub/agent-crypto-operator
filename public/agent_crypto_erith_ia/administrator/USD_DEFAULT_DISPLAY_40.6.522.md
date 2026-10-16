# Agent-Crypto 40.6.522 — USD Default Display

Parent: **40.6.521**
Market Core: **38.15.11 — protected**
Scope: **Administrator boot display policy only**

## Purpose

Complete the requested presentation destination: **USD becomes the default DISPLAY at Administrator startup**.

This build does not introduce a new conversion or source owner.

Instead, after the existing currency-aware owners are loaded, a one-shot policy calls the canonical quote architecture:

`setDisplayCurrency("USD")`

That emits the already-existing currency event.

## Owner chain at USD startup

- Graphique: native CoinGecko USD history from 40.6.520.
- Market/Fiche: explicit USD fields from 40.6.518.
- Oracle/Aether/Lecture price presentation: explicit USD from 40.6.519.
- Bougies: native OKX USDC instrument when DISPLAY=USD.
- Profondeur/Carnet: native OKX USDC, fallback USDT, from 40.6.521.

## Truth remains separated

DISPLAY = USD.

ANALYSIS remains EUR.
EXEC remains BTC-EUR.
SETTLE remains EUR.

USDC and USDT remain USDC and USDT.

No stablecoin is renamed USD.

## Operator control

EUR remains available in the same selector.

The default policy is one-shot and not persistent:
- reload → USD default;
- operator can choose EUR for the current page;
- no localStorage preference is added.

## No new machinery

- no recurring timer;
- no MutationObserver;
- no storage write;
- no network owner;
- no browser EUR→USD conversion;
- no private API;
- no order;
- no wallet.

## Firefox proof

1. Ctrl+F5 → Build 40.6.522.
2. Without clicking anything, USD button must be active.
3. Graphique / Market / Fiche / Oracle / Aether should present USD.
4. Bougies should use the real USDC instrument under USD.
5. Carnet should use USDC or USDT and show the actual pair.
6. Click EUR → all owners must return to their EUR presentation/instrument truth.
7. EXEC must remain BTC-EUR and SETTLE EUR throughout.
